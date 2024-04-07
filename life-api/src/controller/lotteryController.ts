import { Controller, Get, Query } from '@nestjs/common';
import { LotteryService } from '@/service';
import { BaseController } from '@/base';
import { type ResponseResult } from '@/types';

@Controller()
export default class LotteryController extends BaseController {
  constructor(private readonly lotteryService: LotteryService) {
    super();
  }

  @Get('/lottery/bet')
  lotteryBet(@Query('uid') uid: string, @Query('count') count = 5, @Query('type') type = '1'): ResponseResult {
    const result = this.lotteryService.create(type, uid, count);
    return this.sendResult(result);
  }
}
