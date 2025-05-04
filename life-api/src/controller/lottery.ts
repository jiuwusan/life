import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LotteryService, AuthService } from '@/service';
import { validationParameter } from '@/utils/util';

@Controller('lottery')
export class LotteryController {
  constructor(
    private readonly lotteryService: LotteryService,
    private readonly authService: AuthService
  ) {}

  @Post('bet')
  async bet(@Body() data) {
    // 校验
    await validationParameter(data, {
      type: params => {
        if (params.uid) {
          return;
        }
        if (!params.type) {
          return 'type 参数不能为空';
        }
      },
      betBall: params => {
        const regex = /^(\d{2}(?: \d{2}){6})(;(\d{2}(?: \d{2}){6}))*$/;
        if (!params.betBall) {
          return;
        }
        if (!regex.test(params.betBall)) {
          return '投注球格式异常';
        }
      }
    });
    const userId = await this.authService.getUserId();
    const result = await this.lotteryService.bet({ ...data, userId });
    return result;
  }

  @Post('remove')
  async remove(@Body() { uid }) {
    const result = await this.lotteryService.remove(uid);
    return result;
  }

  @Get('query/list')
  async querylist(@Query() { type, pageNo = 1, pageSize = 10 }) {
    const result = await this.lotteryService.querylist({ type, pageNo, pageSize });
    return result;
  }

  @Get('query/history')
  async history(@Query() { pageNo = 1, pageSize = 20, type = 'sp', refresh = false }) {
    return await this.lotteryService.queryWinHistory({ type, pageNo, pageSize, refresh });
  }

  @Get('persist')
  async persist(@Query() { refresh = false }) {
    return await this.lotteryService.persist(refresh);
  }
}
