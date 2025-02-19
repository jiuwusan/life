import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '@/service';
import { validationParameter } from '@/utils/util';

@Controller('user')
export class UserController {
  constructor(private readonly lotteryService: UserService) {}

  @Post('create')
  async bet(@Body() data) {
    await validationParameter(data, ['username', 'password']);
    // 添加 必填项校验 username,password
    const result = await this.lotteryService.create(data);
    return result;
  }
}
