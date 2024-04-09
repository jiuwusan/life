import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lottery } from '@/entity';
import { Repository } from 'typeorm';
import { createLottery, batchCheckLottery } from '@/utils/lottery';
import { API } from '@/external';

@Injectable()
export default class LotteryService {
  constructor(
    @InjectRepository(Lottery)
    private lotteryRepository: Repository<Lottery>
  ) {}

  async bet(type: string, uid: string, count: number) {
    const betBall = createLottery(count);
    const lottery = new Lottery();
    lottery.uid = uid;
    lottery.type = type;
    lottery.betBall = betBall;
    lottery.betTime = new Date();
    // lottery = {
    //   uid,
    //   type,
    //   betBall: JSON.stringify(betBall),
    //   betTime: new Date()
    // };
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
   * 查询列表
   *
   * @returns
   */
  querylist() {
    return this.lotteryRepository.find();
  }

  /**
   * 查询列表
   *
   * @returns
   */
  history() {
    return API.queryLotteryHistory({
      gameNo: 85,
      provinceId: 0,
      isVerify: 1,
      pageNo: 1,
      pageSize: 100
    });
  }
}
