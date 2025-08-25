import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LotteryService } from '@/service/lottery';
import { SubService } from '@/service/sub';

@Injectable()
export class TasksService {
  constructor(
    private readonly lotteryService: LotteryService,
    private readonly subService: SubService
  ) {}

  /**
   * 每天 21:15 执行
   */
  @Cron('15 21 * * *')
  async updateLotteryHistory() {
    await this.lotteryService.pollingUpdateLotteryHistory();
  }

  /**
   * 每天 8:15 执行
   */
  @Cron('15 8 * * *')
  async sendSubInfo() {
    await this.subService.statistics();
  }
}
