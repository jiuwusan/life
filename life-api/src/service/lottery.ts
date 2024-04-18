import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lottery } from '@/entity';
import { Repository, Not } from 'typeorm';
import { createLottery, batchCheckLottery } from '@/utils/lottery';
import { lotteryApi } from '@/external/api';
import type { WinLottery } from '@/types';

@Injectable()
export class LotteryService {
  constructor(
    @InjectRepository(Lottery)
    private lotteryRepository: Repository<Lottery>
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
  async queryWinHistory(pageNo = 1, pageSize = 100): Promise<Array<WinLottery>> {
    // 查询历史
    const result = await lotteryApi.queryLotteryHistory({
      gameNo: 85,
      provinceId: 0,
      isVerify: 1,
      pageNo,
      pageSize
    });
    return result?.list || [];
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
    const list = await this.queryWinHistory();
    const result: {
      frontStat: Record<string, { total: number; vanish: number }>;
      backStat: Record<string, { total: number; vanish: number }>;
    } = { frontStat: {}, backStat: {} };
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
    return {
      frontStat: Object.keys(result.frontStat)
        .map(ball => {
          return {
            ball,
            ...result.frontStat[ball]
          };
        })
        .sort((a, b) => b.vanish - a.vanish),
      backStat: Object.keys(result.backStat)
        .map(ball => {
          return {
            ball,
            ...result.backStat[ball]
          };
        })
        .sort((a, b) => b.vanish - a.vanish)
    };
  }
}
