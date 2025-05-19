import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LotteryService } from '@/service/lottery';

@Injectable()
export class TasksService {
  constructor(private readonly lotteryService: LotteryService) {}

  /**
   * 每天 21:30 执行
   */
  @Cron('15 21 * * *')
  async updateLotteryHistory() {
    this.lotteryService.pollingUpdateLotteryHistory();
  }
}
