import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { nextSleep, formatDateToStr } from '@/utils/util';
import { LotteryService } from '@/service/lottery';

@Injectable()
export class TasksService {
  constructor(private readonly lotteryService: LotteryService) {}

  @Cron('45 * * * * *')
  handleCron() {
    console.log('Called every 45 seconds');
  }

  /**
   * 每周1、3、6 21:30 执行
   */
  @Cron('35 21 * * 1,3,6')
  async updateLotteryHistory() {
    const currentDate = formatDateToStr(Date.now(), 'yyyy-MM-dd');
    console.log(`${currentDate} --> 开始更新历史记录`);
    let lastdDate = '';
    while (currentDate !== lastdDate) {
      const list = await this.lotteryService.queryWinHistory(1, 100, true);
      list?.length > 0 && (lastdDate = list[0].lotteryDrawTime);
      // 等待2分钟
      await nextSleep(1000 * 60 * 1);
    }
  }
}
