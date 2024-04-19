import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lottery } from '@/entity';
import { Repository, Not } from 'typeorm';
import { createLottery, batchCheckLottery } from '@/utils/lottery';
import { lotteryApi } from '@/external/api';
import type { WinLottery } from '@/types';
import { RedisService } from '@/service/redis';

@Injectable()
export class LotteryService {
  // private readonly redisService = new RedisService();

  constructor(
    @InjectRepository(Lottery)
    private lotteryRepository: Repository<Lottery>,
    private readonly redisService: RedisService
  ) {}

  async bet(type: string, count: number, uid: string) {
    const betBall = createLottery(count);
    const lottery = new Lottery();
    lottery.type = type;
    lottery.betBall = betBall;
    lottery.betTime = new Date();
    if (uid) {
      return await this.lotteryRepository.update(uid, lottery);
    }
    return await this.lotteryRepository.save(lottery);
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
        break;
      }
      const winLottery = this.findWinLottery(winHistory, lottery.betTime);
      if (!winLottery) {
        break;
      }
      const lotteryResult = batchCheckLottery(winLottery.lotteryDrawResult.split(' '), lottery.betBall, true);
      lottery.winBall = winLottery.lotteryDrawResult.split(' ');
      lottery.winTime = `${winLottery.lotteryDrawTime} 21:25:00`;
      lotteryResult.length > 0 && (lottery.winResults = lotteryResult);
      this.lotteryRepository.save(lottery);
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
    betTime = new Date(betTime);
    const result = list.find((item, index) => {
      const saleEndTime = new Date(item.lotterySaleEndtime);
      if (index + 1 === list.length) {
        return betTime < saleEndTime;
      }
      return betTime < saleEndTime && betTime > new Date(list[index + 1].lotterySaleEndtime);
    });
    return result;
  }

  /**
   * 统计情况
   */
  async statistics() {
    type Stats = Record<string, { total: number; vanish: number }>;
    const list = await this.queryWinHistory();
    const result: { frontStat: Stats; backStat: Stats } = { frontStat: {}, backStat: {} };
    let vanish = 0;
    list.forEach(item => {
      const drawBalls = item.lotteryDrawResult.split(' ');
      drawBalls.forEach((ball, idx) => {
        const current = idx > 4 ? 'backStat' : 'frontStat';
        !result[current][ball] && (result[current][ball] = { total: 0, vanish });
        result[current][ball].total = result[current][ball].total + 1;
      });
      vanish++;
    });

    const formatStat = (stats: Stats) =>
      Object.keys(stats).map(ball => {
        const diff = stats[ball].total - stats[ball].vanish;
        return {
          ball,
          diff,
          gran: Math.abs(diff),
          sum: stats[ball].total + stats[ball].vanish,
          ...stats[ball]
        };
      });

    return {
      frontStat: formatStat(result.frontStat),
      backStat: formatStat(result.backStat)
    };
  }

  /**
   * 推荐
   */
  async recommend() {
    const ballSort = (list: Array<string>) => {
      list.sort((a, b) => parseInt(a) - parseInt(b));
      return list;
    };
    const { frontStat, backStat } = await this.statistics();
    const result: Array<Array<string>> = [];
    // 差值绝对值最小
    frontStat.sort((a, b) => a.gran - b.gran);
    backStat.sort((a, b) => a.gran - b.gran);
    result.push([
      ...ballSort(frontStat.slice(0, 5).map(item => item.ball)),
      ...ballSort(backStat.slice(0, 2).map(item => item.ball))
    ]);
    // 和值最大
    frontStat.sort((a, b) => b.sum - a.sum);
    backStat.sort((a, b) => b.sum - a.sum);
    result.push([
      ...ballSort(frontStat.slice(0, 5).map(item => item.ball)),
      ...ballSort(backStat.slice(0, 2).map(item => item.ball))
    ]);
    // 连续遗失最多
    frontStat.sort((a, b) => b.vanish - a.vanish);
    backStat.sort((a, b) => b.vanish - a.vanish);
    result.push([
      ...ballSort(frontStat.slice(0, 5).map(item => item.ball)),
      ...ballSort(backStat.slice(0, 2).map(item => item.ball))
    ]);
    return result;
  }
}
