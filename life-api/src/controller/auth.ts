import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '@/service';
import { validationParameter } from '@/utils/util';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('verification')
  async bet(@Body() data) {
    await validationParameter(data, ['username', 'password']);
    // 添加 必填项校验 username,password
    const result = await this.userService.create(data);
    return result;
  }
}
