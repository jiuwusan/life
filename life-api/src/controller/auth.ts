import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '@/service';
import { validationParameter } from '@/utils/util';

@Controller()
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('authorization')
  async authorization(@Body() data) {
    await validationParameter(data, ['username', 'password']);
    // 添加 必填项校验 username,password
    const result = await this.userService.create(data);
    return result;
  }

  @Post('authorization/code')
  async verifyCode(@Body() data) {
    await validationParameter(data, ['code']);
    return data.code === '953';
  }
}
