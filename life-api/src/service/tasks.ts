import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { nextSleep, formatDateToStr } from '@/utils/util';
import { LotteryService } from '@/service/lottery';

@Injectable()
export class TasksService {
  constructor(private readonly lotteryService: LotteryService) {}

  // @Cron('45 * * * * *')
  // handleCron() {
  //   console.log('Called every 45 seconds');
  // }

  /**
   * 每周1、3、6 21:30 执行
   */
  @Cron('35 21 * * 1,3,6')
  async updateLotteryHistory() {
    console.log(`${new Date().toLocaleString()} : 开始更新历史记录`);
    // 今天
    const currentDate = formatDateToStr(new Date(), 'yyyy-MM-dd');
    let lastdDate = '';
    let queryCount = 0;
    // 最多查询30次
    while (currentDate !== lastdDate && queryCount < 30) {
      queryCount++;
      const list = await this.lotteryService.queryWinHistory(1, 100, true);
      list && list?.length > 0 && (lastdDate = list[0].lotteryDrawTime);
      // 等待2分钟
      await nextSleep(1000 * 60 * 2);
    }
    console.log(`${new Date().toLocaleString()} : 结束更新历史记录，共查询${queryCount}次`);
  }
}
