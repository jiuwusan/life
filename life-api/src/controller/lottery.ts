import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LotteryService } from '@/service';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Post('bet')
  async bet(@Body() data) {
    // { type = '1', uid, recommend, count = 5 }
    const result = await this.lotteryService.bet(data);
    return result;
  }

  @Post('remove')
  async remove(@Body() { uid }) {
    const result = await this.lotteryService.remove(uid);
    return result;
  }

  @Get('query/list')
  async querylist() {
    const result = await this.lotteryService.querylist();
    return result;
  }

  @Get('query/history')
  async history(@Query() { pageNo = 1, pageSize = 100 }) {
    return await this.lotteryService.queryWinHistory(pageNo, pageSize);
  }

  @Get('statistics')
  async statistics(@Query() { numbers = 100 }) {
    return await this.lotteryService.statistics(numbers);
  }

  @Get('recommend')
  async recommend() {
    return await this.lotteryService.recommend();
  }
}
