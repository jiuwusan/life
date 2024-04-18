import { Controller, Get, Post, Body } from '@nestjs/common';
import { LotteryService } from '@/service';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Post('bet')
  async bet(@Body() { type = '1', uid, count = 5 }) {
    const result = await this.lotteryService.bet(type, count, uid);
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
}
