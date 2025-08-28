import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LotteryService } from '@/service/lottery';
import { SubService } from '@/service/sub';
import { isProduction } from '@/utils/util';

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
  updateLotteryHistory() {
    isProduction() && this.lotteryService.pollingUpdateLotteryHistory();
  }

  /**
   * 每天 7:45 执行
   */
  @Cron('45 7 * * *')
  sendSubMessage() {
    isProduction() && this.subService.list({ refresh: true });
  }
}
