import { Controller, Post, Get, Body } from '@nestjs/common';
import { HardwareService } from '@/service';
import { validationParameter } from '@/utils/util';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @Post('tracker')
  async tracker(@Body() data) {
    console.log('data', data);
    // 添加 必填项校验 machine,name,type
    const list = Array.isArray(data.list) ? data.list : [data];
    for (let i = 0; i < list.length; i++) {
      await validationParameter(list[i], ['machine', 'name', 'type']);
    }
    return await this.hardwareService.createOrUpdate(list);
  }

  @Get('list')
  async list() {
    return await this.hardwareService.list();
  }
}
