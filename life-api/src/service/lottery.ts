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

  async bet(data: { type: string; count: number; uid: string; recommend: boolean; betBall?: string[][]; betTime?: string; persist?: boolean; reprint?: boolean; }) {
    const { type = 'random', recommend, betTime = new Date(), persist = false, reprint = false } = data;
    let { count = 1, uid } = data;

    const betBall = [];
    if (!uid && persist) {
      // 守号
      betBall.push(...(await this.persist()));
      count -= 2;
    }

    if (!uid && recommend && betBall.length < count) {
      // 推荐
      betBall.push(await this.recommend());
      count--;
    }

    if (uid) {
      const lasted = await this.lotteryRepository.findOne({ where: { uid } });
      lasted && betBall.push(...lasted.betBall);
    }

    betBall.push(...createLottery(count, type));
    // 使用 UTC时间
    const lottery = { type, betBall, betTime: new Date(betTime).toUTCString() };
    // 追投
    reprint && (uid = '');
    // 保存
    return uid ? await this.lotteryRepository.update(uid, lottery) : await this.lotteryRepository.save(lottery);
  }

  /**
   * 批量验奖
   * @param lotteryNumbers
   * @param multiUserNumbers
   * @returns
   */
  verify(lotteryNumbers: Array<string>, multiUserNumbers: Array<Array<string>>) {
    return batchCheckLottery(lotteryNumbers, multiUserNumbers);
  }

  /**
   * 批量验证
   * @param lotteryNumbers
   * @param multiUserNumbers
   * @returns
   */
  async batchVerify(lotterys: Array<Lottery>) {
    const winHistory = await this.queryWinHistory();
    for (let index = 0; index < lotterys.length; index++) {
      const lottery = lotterys[index];
      if (!!lottery.winTime) {
        continue;
      }
      const winLottery = this.findWinLottery(winHistory, lottery.betTime);
      if (!winLottery) {
        continue;
      }
      const lotteryResult = batchCheckLottery(winLottery.lotteryDrawResult.split(' '), lottery.betBall, true);
      const updateValues = {
        winBall: winLottery.lotteryDrawResult.split(' '),
        winTime: new Date(`${winLottery.lotteryDrawTime} 21:25:00`).toUTCString(),
        winResults: lotteryResult.length > 0 ? lotteryResult : null
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
  async querylist() {
    const list = await this.lotteryRepository.find({
      order: { betTime: 'DESC' },
      where: { deleted: Not('1') }
    });
    return this.batchVerify(list);
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
  async queryWinHistory(pageNo = 1, pageSize = 100, refresh?: boolean): Promise<Array<WinLottery>> {
    const cacheKey = `lottery:history-${pageSize}-${pageNo}`;
    let list = await this.redisService.get<Array<WinLottery>>(cacheKey);
    // 参数
    const query = { gameNo: 85, provinceId: 0, isVerify: 1, pageNo, pageSize };
    // 查询历史
    if (!list || list.length === 0 || refresh) {
      list = (await lotteryApi.queryLotteryHistory(query))?.list || [];
      list && list.length > 0 && this.redisService.set(cacheKey, list);
    }
    return list;
  }

  /**
   * 寻找对应开奖期
   * @param list
   * @param betTime
   * @returns
   */
  findWinLottery(list: Array<WinLottery>, betTime: string | Date): WinLottery {
    const betTimestamp = new Date(betTime).getTime();
    const result = list.find((item, index) => {
      const saleEndTimestamp = new Date(item.lotterySaleEndtime).getTime();
      if (index + 1 === list.length) {
        // 最后一期
        return betTimestamp < saleEndTimestamp;
      }
      return betTimestamp < saleEndTimestamp && betTimestamp > new Date(list[index + 1].lotterySaleEndtime).getTime();
    });
    return result;
  }

  /**
   * 统计情况
   */
  async statistics(numbers = 100) {
    type Stats = Record<string, { total: number; vanish: number }>;
    const list = [];
    while (list.length < numbers) {
      list.push(...(await this.queryWinHistory(list.length / 100 + 1)));
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
  async recommend() {
    const rangs = [500, 1500, 2500];
    const result = [];
    const { frontStat, backStat } = await this.statistics(100);
    result.push(getRandomNumbersByStat(frontStat, backStat));
    for (let i = 0; i < rangs.length; i++) {
      const stat = await this.statistics(rangs[i]);
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
      bets = createLottery(2);
      this.redisService.set(cacheKey, bets);
    }
    return bets;
  }
}
