import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lottery } from '@/entity';
import { Repository, Not } from 'typeorm';
import { createLottery, batchCheckLottery, computeStatVariance, getRandomNumbersByStat, getRandomNumbersByVariance } from '@/utils/lottery';
import { lotteryApi } from '@/external/api';
import type { WinLottery } from '@/types';
import { RedisService } from '@/service/redis';

@Injectable()
export class LotteryService {
  constructor(
    @InjectRepository(Lottery)
    private lotteryRepository: Repository<Lottery>,
    private readonly redisService: RedisService
  ) {}

  async bet(data: { userId: string; type: string; count: number; uid: string; recommend: boolean; betBall?: string; betTime?: string; persist?: boolean; reprint?: boolean; sequence: boolean }) {
    const { userId, type = 'sp', count = 1, betTime = new Date(), uid, reprint = false, sequence = false } = data;
    const betBall = [];
    if (uid) {
      const lasted = await this.lotteryRepository.findOne({ where: { uid } });
      lasted && lasted.betBall && betBall.push(...(lasted.betBall ? lasted.betBall.split(';') : []));
    }
    !reprint && betBall.push(...createLottery({ count, type, sequence }));
    // 使用 UTC时间
    const lottery = new Lottery();
    lottery.userId = userId;
    lottery.type = type; // 例如 'sp' 或 'wf'
    lottery.betBall = betBall.join(';');
    lottery.betTime = new Date(betTime).toISOString();
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
      if (lottery.winTime) {
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
        winBall: winLottery.lotteryDrawResult,
        winTime: new Date(`${winLottery.lotteryDrawTime} 21:25:00`).toISOString(),
        winResult: lotteryResult.map(item => `${item.prizeLevel}：￥${item.stakeAmount}.00`).join('；')
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
   * 查询列表
   *
   * @returns
   */
  async queryWinHistory(params: { type: string; pageNo?: number; pageSize?: number; refresh?: boolean }): Promise<Array<Record<string, any>>> {
    const { type, pageNo = 1, pageSize = 100, refresh = false } = params;
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
          ...((
            await lotteryApi.queryWfLotteryHistory({
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
            })
          )?.result || [])
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
      prizeLevelList: (result?.prizeLevelList || result?.prizegrades)
        .filter(item => !['201', '401'].includes(item.group))
        .map((item, index) => {
          const chineseNumerals = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
          const prizeLevelNum = index + 1;
          const prizeLevel = `${chineseNumerals[prizeLevelNum]}等奖`;
          const stakeAmount = item.stakeAmountFormat || item.typemoney;
          const stakeCount = item.stakeCount || item.typenum;
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
   * 统计情况
   */
  async statistics(type: string, numbers = 100) {
    type Stats = Record<string, { total: number; vanish: number }>;
    const list = [];
    while (list.length < numbers) {
      list.push(...(await this.queryWinHistory({ type, pageNo: list.length / 100 + 1 })));
    }

    const result: { frontStat: Stats; backStat: Stats } = { frontStat: {}, backStat: {} };
    const varianceList: { frontHistory: string[][]; backHistory: string[][] } = {
      frontHistory: [],
      backHistory: []
    };
    let vanish = 0;
    list.forEach(item => {
      const drawBalls = item.lotteryDrawResult.split(' ');
      varianceList.frontHistory.push(drawBalls.slice(0, 5));
      varianceList.backHistory.push(drawBalls.slice(-2));
      drawBalls.forEach((ball, idx) => {
        const current = idx > 4 ? 'backStat' : 'frontStat';
        !result[current][ball] && (result[current][ball] = { total: 0, vanish });
        result[current][ball].total = result[current][ball].total + 1;
      });
      vanish++;
    });

    const formatStat = (stats: Stats, varianceStat: any) => {
      const list = Object.keys(stats).map(ball => {
        const diff = stats[ball].total - stats[ball].vanish;
        return {
          ball,
          diff,
          gran: Math.abs(diff),
          sum: stats[ball].total + stats[ball].vanish,
          ...stats[ball],
          ...varianceStat[ball]
        };
      });
      // 倒叙
      list.sort((a, b) => b.vanish - a.vanish);
      return list;
    };
    return {
      frontStat: formatStat(result.frontStat, computeStatVariance(varianceList.frontHistory)),
      backStat: formatStat(result.backStat, computeStatVariance(varianceList.backHistory))
    };
  }

  /**
   * 推荐
   */
  async recommend(type: string) {
    const rangs = [500, 1500, 2500];
    const result = [];
    const { frontStat, backStat } = await this.statistics(type, 100);
    result.push(getRandomNumbersByStat(frontStat, backStat));
    for (let i = 0; i < rangs.length; i++) {
      const stat = await this.statistics(type, rangs[i]);
      result.push(getRandomNumbersByVariance(stat.frontStat, stat.backStat));
    }
    // 只取一项
    const randomIndex = Math.floor(Math.random() * result.length);
    return result[randomIndex];
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
