import { Controller, Get } from '@nestjs/common';
import { LotteryService } from '@/service';
import { BaseController } from '@/base';
import { type ResponseResult } from '@/types';

@Controller()
export default class LotteryController extends BaseController {
  constructor(private readonly lotteryService: LotteryService) {
    super();
  }

  @Get('/lottery/bet')
  lotteryBet(): ResponseResult {
    return this.sendResult(this.lotteryService.create(5));
  }
}
