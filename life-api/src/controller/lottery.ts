import { Controller, Get, Post, Body } from '@nestjs/common';
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
  async history() {
    return await this.lotteryService.queryWinHistory();
  }

  @Get('statistics')
  async statistics() {
    return await this.lotteryService.statistics();
  }

  @Get('recommend')
  async recommend() {
    return await this.lotteryService.recommend();
  }
}
