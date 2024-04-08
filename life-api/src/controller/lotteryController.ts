import { Controller, Get, Post, Body } from '@nestjs/common';
import { LotteryService } from '@/service';

@Controller()
export default class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  // @Post('/lottery/bet')
  // async bet(@Body() { type = '1', uid, count = 5 }) {
  //   const result = await this.lotteryService.bet(type, uid, count);
  //   return result;
  // }

  @Get('/lottery/bet')
  async bet(@Body() { type = '1', uid, count = 5 }) {
    const result = await this.lotteryService.bet(type, uid, count);
    return result;
  }

  @Get('/lottery/list')
  async querylist() {
    const result = await this.lotteryService.querylist();
    return result;
  }

  @Get('/lottery/query/:uid')
  async queryById() {
    const result = await this.lotteryService.querylist();
    return result;
  }
}
