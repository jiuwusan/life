import { Controller, Post, Get, Body, Query } from '@nestjs/common';
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
      await validationParameter(list[i], ['owner', 'name', 'type']);
    }
    return await this.trackerService.createOrUpdate(list);
  }

  @Get('list')
  async list(@Query() { owner, type, pageNo = 1, pageSize = 20 }) {
    return await this.trackerService.list({ owner, type, pageNo, pageSize });
  }
}
