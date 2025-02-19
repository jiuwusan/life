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
    await validationParameter(data, ['type']);
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
  async history(@Query() { pageNo = 1, pageSize = 100, type = 'sp', refresh = false }) {
    return await this.lotteryService.queryWinHistory({ type, pageNo, pageSize, refresh });
  }

  @Get('statistics')
  async statistics(@Query() { type = 'sp', numbers = 100 }) {
    return await this.lotteryService.statistics(type, numbers);
  }

  @Get('recommend')
  async recommend(@Query() { type = 'sp' }) {
    return await this.lotteryService.recommend(type);
  }

  @Get('persist')
  async persist(@Query() { refresh = false }) {
    return await this.lotteryService.persist(refresh);
  }
}
