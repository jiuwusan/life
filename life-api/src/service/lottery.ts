import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lottery } from '@/entity';
import { Repository } from 'typeorm';
import { createLottery, batchCheckLottery } from '@/utils/lottery';
import { lotteryApi } from '@/external/api';
import type { WinLottery } from '@/types';

@Injectable()
export default class LotteryService {
  constructor(
    @InjectRepository(Lottery)
    private lotteryRepository: Repository<Lottery>
  ) {}

  async bet(type: string, count: number, uid: string) {
    const betBall = createLottery(count);
    const lottery = new Lottery();
    lottery.uid = uid;
    lottery.type = type;
    lottery.betBall = betBall;
    lottery.betTime = new Date();
    const result = await this.lotteryRepository.save(lottery);

    return result;
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
      order: {
        betTime: 'DESC'
      }
    });
    return this.batchVerify(list);
  }

  /**
   * 查询列表
   *
   * @returns
   */
  async queryWinHistory(): Promise<Array<WinLottery>> {
    // 查询历史
    const result = await lotteryApi.queryLotteryHistory({
      gameNo: 85,
      provinceId: 0,
      isVerify: 1,
      pageNo: 1,
      pageSize: 100
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
}
