import { Controller, Post, Get, Body } from '@nestjs/common';
import { HardwareService } from '@/service';
import { validationParameter } from '@/utils/util';
import { Hardware } from '@/entity';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @Post('tracker')
  async tracker(@Body() data: Partial<Hardware>) {
    // 添加 必填项校验 machine,name,type
    await validationParameter(data, ['machine', 'name', 'type']);
    return await this.hardwareService.createOrUpdate(data);
  }

  @Get('list')
  async list() {
    return await this.hardwareService.list();
  }
}
