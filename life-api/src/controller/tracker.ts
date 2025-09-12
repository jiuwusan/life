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
      const current = list[i];
      await validationParameter(current, ['owner', 'name', 'type']);
      switch (current.type) {
        case 'SENSOR': // 传感器
          // 判断 current.value 是否为数字，如果小数点后全是0，则转为整数
          current.value && !isNaN(current.value) && (current.value = String(current.value).replace(/\.0+$/g, ''));
          break;
        default:
          // 默认
          break;
      }
    }
    return await this.trackerService.createOrUpdate(list);
  }

  @Get('list')
  async list(@Query() { owner, type, pageNo = 1, pageSize = 20 }) {
    return await this.trackerService.list({ owner, type, pageNo, pageSize });
  }
}
