import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lottery } from '@/entity';
import { Repository } from 'typeorm';
import { createLottery, batchCheckLottery } from '@/utils/lottery';

@Injectable()
export default class LotteryService {
  constructor(
    @InjectRepository(Lottery)
    private lotteryRepository: Repository<Lottery>
  ) {}

  async create(type: string, uid: string, count: number) {
    const betBall = createLottery(count);
    const lottery = new Lottery();
    lottery.uid = uid;
    lottery.type = type;
    lottery.betBall = JSON.stringify(betBall);
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
}
