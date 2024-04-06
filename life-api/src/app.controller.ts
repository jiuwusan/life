import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import type { ResponseResult } from './types'
import { BaseController } from './base'
import { createLottery } from './service/lottery'

@Controller()
export class AppController extends BaseController {
  constructor(private readonly appService: AppService) {
    super()
  }

  @Get('/hello')
  getHello(): ResponseResult {
    return this.sendResult(createLottery(5))
  }
}
