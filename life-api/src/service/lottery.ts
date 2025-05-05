import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lottery } from '@/entity';
import { Repository, Not } from 'typeorm';
import { createLottery, batchCheckLottery } from '@/utils/lottery';
import { getWebCookiesStr } from '@/utils/puppeteer';
import { lotteryApi } from '@/external/api';
import type { WinLottery } from '@/types';
import { RedisService } from '@/service/redis';
import { BaseService } from '@/service/base';

@Injectable()
export class LotteryService extends BaseService {
  constructor(
    @InjectRepository(Lottery)
    private lotteryRepository: Repository<Lottery>,
    private readonly redisService: RedisService
  ) {
    super();
  }

  /**
   * 投注
   * @param data
   * @returns
   */
  async bet(data: { userId: string; type: string; count: number; uid: string; recommend: boolean; betBall?: string; betTime?: string; persist?: boolean; reprint?: boolean; sequence: boolean }) {
    const { userId, type = 'sp', count = 0, betBall: betBallStr, betTime, uid, reprint = false, sequence = false } = data;
    // 创建投注
    const lottery = new Lottery();
    lottery.userId = userId;
    lottery.type = type; // 例如 'sp' 或 'wf'
    lottery.betTime = this.getDatabaseDateStr(betTime);
    // 投注号码
    const betBall = betBallStr ? betBallStr.split(';') : [];
    if (uid) {
      const currentLottery = await this.lotteryRepository.findOne({ where: { uid } });
      if (currentLottery) {
        betBall.push(...(currentLottery.betBall ? currentLottery.betBall.split(';') : []));
        if (reprint) {
          lottery.type = currentLottery.type;
          const reprintId = currentLottery.reprintId || currentLottery.uid;
          lottery.reprintId = reprintId;
          const reprintCount = await this.lotteryRepository.count({ where: { reprintId } });
          lottery.reprintCount = reprintCount + 1;
        }
      }
    }
    count > 0 && !reprint && betBall.push(...createLottery({ count, type, sequence }));
    // 转字符串
    lottery.betBall = betBall.join(';');
    // 保存
    return uid && !reprint ? await this.lotteryRepository.update(uid, lottery) : await this.lotteryRepository.save(lottery);
  }

  /**
   * 批量验证
   * @param lotteryNumbers
   * @param multiUserNumbers
   * @returns
   */
  async batchVerify(lotterys: Array<Lottery>) {
    const winHistory = {
      sp: await this.queryWinHistory({ type: 'sp' }),
      wf: await this.queryWinHistory({ type: 'wf' })
    };

    for (let index = 0; index < lotterys.length; index++) {
      const lottery = lotterys[index];
      if (lottery.winRemark) {
        continue;
      }
      const winLottery = this.findWinLottery(winHistory[lottery.type], lottery.betTime);
      if (!winLottery) {
        continue;
      }
      const lotteryResult = batchCheckLottery(lottery.type, winLottery.lotteryDrawResult, lottery.betBall).map(item => {
        const result = winLottery.prizeLevelList.find(res => res.prizeLevelNum === item.prize);
        return {
          ...item,
          ...result
        };
      });
      console.log('lotteryResult---->', lotteryResult);
      const updateValues = {
        winNum: winLottery.lotteryDrawNum,
        winBall: winLottery.lotteryDrawResult,
        winTime: this.getDatabaseDateStr(`${winLottery.lotteryDrawTime} 21:25:00`),
        winResult: lotteryResult.map(item => `${item.prizeLevel}：￥${item.stakeAmount}.00`).join('；'),
        winRemark: winLottery.lotteryDrawRemark
      };
      // 还原数据
      Object.keys(updateValues).forEach((key: string) => updateValues[key] && (lottery[key] = updateValues[key]));
      this.lotteryRepository.update(lottery.uid, updateValues);
    }
    return lotterys;
  }

  /**
   * 查询列表
   *
   * @returns
   */
  async querylist(params: { type?: string; pageNo?: number; pageSize?: number }) {
    const { type, pageNo = 1, pageSize = 10 } = params;
    const whereQuery: Record<string, any> = { deleted: Not('1') };
    type && (whereQuery.type = type);

    const [list, total] = await this.lotteryRepository.findAndCount({
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      order: { betTime: 'DESC' },
      where: whereQuery
    });

    return {
      pageNo,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      list: await this.batchVerify(list)
    };
  }

  /**
   * 查询列表
   *
   * @returns
   */
  async remove(uid: string) {
    return await this.lotteryRepository.update(uid, { deleted: '1' });
  }

  /**
   * 查询双色球历史记录
   */
  async queryWfLotteryHistory(params: Record<string, any>) {
    let refreshCount = 1;
    const querySsqList = async (pms: Record<string, any>, url?: string) => {
      const cacheKey = `wf:web-cookie-str`;
      if (refreshCount > 3) {
        return [];
      }
      if (url) {
        refreshCount++;
        const newCookie = await getWebCookiesStr(url);
        newCookie && (await this.redisService.set(cacheKey, newCookie));
        return await querySsqList(pms);
      }
      const headers: Record<string, string> = {};
      const cookie = await this.redisService.get<string>(cacheKey);
      cookie && (headers.cookie = cookie);

      const result = await lotteryApi.queryWfLotteryHistory(pms, { headers });

      if (result?.status === 403) {
        return await querySsqList(pms, result?.url);
      }

      if (result?.status === 302) {
        refreshCount++;
        const newCookies = result.headers.get('set-cookie');
        newCookies && this.redisService.set(cacheKey, newCookies.split('; ')[0]);
        return await querySsqList(pms);
      }

      result?.newCookies && this.redisService.set(cacheKey, result?.newCookies);

      return result?.result || [];
    };

    return await querySsqList(params);
  }

  /**
   * 查询列表
   *
   * @returns
   */
  async queryWinHistory(params: { type: string; pageNo?: number; pageSize?: number; refresh?: boolean }): Promise<Array<Record<string, any>>> {
    const { type, pageNo = 1, pageSize = 20, refresh = false } = params;
    const cacheKey = `${type}:lottery:history-${pageSize}-${pageNo}`;
    const list = await this.redisService.get<Array<Record<string, any>>>(cacheKey);
    if (list && list?.length > 0 && !refresh) {
      return list;
    }
    // 查询历史
    const newList = [];
    switch (type) {
      case 'sp':
        newList.push(...((await lotteryApi.querySpLotteryHistory({ gameNo: 85, provinceId: 0, isVerify: 1, pageNo, pageSize }))?.list || []));
        break;
      case 'wf':
        newList.push(
          ...(await this.queryWfLotteryHistory({
            name: 'ssq',
            issueCount: '',
            issueStart: '',
            issueEnd: '',
            dayStart: '',
            dayEnd: '',
            pageNo,
            pageSize,
            week: '',
            systemType: 'PC'
          }))
        );
        break;
      default:
        throw new Error('Lottery Type 异常');
    }

    newList && newList.length > 0 && this.redisService.set(cacheKey, newList);
    return newList;
  }

  /**
   * 寻找对应开奖期
   * @param list
   * @param betTime
   * @returns
   */
  findWinLottery(list: Array<any>, betTime: string | Date): WinLottery {
    const betTimestamp = new Date(betTime).getTime();
    const result = list.find((item, index) => {
      const drawDate = item.lotteryDrawTime || item.date;
      if (!drawDate) {
        return false;
      }
      const saleTimestamp = new Date(`${drawDate.substring(0, 10)} 21:00:00`).getTime();
      if (index + 1 === list.length) {
        // 最后一期
        return betTimestamp < saleTimestamp;
      }
      const preItem = list[index + 1];
      const preDrawDate = preItem.lotteryDrawTime || preItem.date;
      const preSaleTimestamp = new Date(`${preDrawDate.substring(0, 10)} 21:00:00`).getTime();
      return betTimestamp < saleTimestamp && betTimestamp > preSaleTimestamp;
    });
    if (!result) {
      return result;
    }
    const lotteryName = result?.lotteryGameName || result?.name;

    return {
      lotteryType: { 双色球: 'wf', 超级大乐透: 'sp' }[lotteryName],
      lotteryName,
      lotteryDrawResult: (result?.lotteryDrawResult || `${result?.red},${result?.blue}`).replace(/,/g, ' '),
      lotteryDrawNum: result?.lotteryDrawNum || result?.code,
      lotteryDrawTime: (result?.lotteryDrawTime || result?.date).substring(0, 10),
      lotterySaleEndtime: (result?.lotterySaleEndtime || result?.date).substring(0, 10),
      lotteryDrawRemark: result?.drawPdfUrl || (result?.detailsLink ? `https://www.cwl.gov.cn/html5${result?.detailsLink}` : ''),
      prizeLevelList: (result?.prizeLevelList || result?.prizegrades)
        .filter(item => !['201', '401'].includes(item.group))
        .map(item => {
          const chineseNumerals = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
          const prizeLevelNum = Number(item.type || chineseNumerals.findIndex((chineseNumeral: string) => !!item.prizeLevel && item.prizeLevel.startsWith(chineseNumeral)) || 0);
          const prizeLevel = prizeLevelNum > 0 ? `${chineseNumerals[prizeLevelNum]}等奖` : '';
          const stakeAmount = prizeLevelNum > 0 ? item.stakeAmountFormat || item.typemoney : '';
          const stakeCount = prizeLevelNum > 0 ? item.stakeCount || item.typenum : '';
          return {
            prizeLevelNum,
            prizeLevel,
            stakeAmount,
            stakeCount
          };
        })
    };
  }

  /**
   * 守号
   */
  async persist(refresh?: boolean) {
    const userId = 'jiuwusan';
    const cacheKey = `lottery:persist-${userId}`;
    let bets = await this.redisService.get<string[][]>(cacheKey);
    if (!bets || refresh) {
      bets = createLottery({ count: 2, sequence: true });
      this.redisService.set(cacheKey, bets);
    }
    return bets;
  }
}
