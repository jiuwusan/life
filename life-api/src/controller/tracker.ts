import { Controller, Post, Get, Body } from '@nestjs/common';
import { TrackerService } from '@/service';
import { validationParameter } from '@/utils/util';

@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Post('report')
  async tracker(@Body() data) {
    console.log('data', data);
    // 添加 必填项校验 name,type
    const list = Array.isArray(data) ? data : [data];
    for (let i = 0; i < list.length; i++) {
      await validationParameter(list[i], ['name', 'type']);
    }
    return await this.trackerService.createOrUpdate(list);
  }

  @Get('list')
  async list() {
    return await this.trackerService.list();
  }
}
