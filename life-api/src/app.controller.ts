import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ResponseResult } from './types';
import { BaseController } from './base';

@Controller()
export class AppController extends BaseController {
  constructor(private readonly appService: AppService) { }

  @Get('/hello')
  getHello(): ResponseResult {
    return this.sendResult(this.appService.getHello())
  }
}
