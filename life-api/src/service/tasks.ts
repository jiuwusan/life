import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { nextSleep, formatDateToStr } from '@/utils/util';
import { LotteryService } from '@/service/lottery';
import { RedisService } from '@/service/redis';

@Injectable()
export class TasksService {
  constructor(
    private readonly lotteryService: LotteryService,
    private readonly redisService: RedisService
  ) {}

  // @Cron('45 * * * * *')
  // handleCron() {
  //   console.log('Called every 45 seconds');
  // }

  /**
   * 每周1、3、6 21:30 执行
   */
  @Cron('35 21 * * 1,3,6')
  async updateLotteryHistory() {
    const lockKey = `lottery:history-update-locked`;
    // 随机锁
    await nextSleep(Math.floor(1000 * 31 * Math.random()));
    if (await this.redisService.get(lockKey)) {
      console.log(`${new Date().toLocaleString()} : 其他服务正在更新，直接退出`);
      return;
    }
    // 60s 后释放
    this.redisService.set(lockKey, 'locked', 'EX', 60);
    console.log(`${new Date().toLocaleString()} : 开始更新历史记录`);
    // 今天
    const currentDate = formatDateToStr(new Date(), 'yyyy-MM-dd');
    let queryCount = 0;
    let pageNo = 1;
    // 最多查询36次
    while (queryCount < 36) {
      queryCount++;
      const list = await this.lotteryService.queryWinHistory(pageNo, 100, true);
      if (list && list?.length > 0 && currentDate === list[0].lotteryDrawTime && !!list[0].drawPdfUrl) {
        break; // 已经查询到最新数据
      }
      // 等待2分钟
      await nextSleep(1000 * 60 * 5);
    }
    console.log(`${new Date().toLocaleString()} : 结束更新历史记录，共查询${queryCount}次`);
    console.log(`${new Date().toLocaleString()} : 开始更新后续24次历史记录`);
    while (++pageNo && pageNo < 26) {
      await this.lotteryService.queryWinHistory(pageNo, 100, true);
      // 等待1分钟
      await nextSleep(1000 * 60 * 1);
    }
  }
}
