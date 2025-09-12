import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { TrackerService, WebHookService } from '@/service';
import { validationParameter, formatDateToStr } from '@/utils/util';

@Controller('tracker')
export class TrackerController {
  constructor(
    private readonly trackerService: TrackerService,
    private readonly webHookService: WebHookService
  ) {}

  @Post('report')
  async tracker(@Body() data) {
    // 添加 必填项校验 name,type
    const list = Array.isArray(data) ? data : [data];
    // 时间戳
    const timestamp = formatDateToStr(Date.now(), 'yyyy-MM-dd HH:mm:ss');
    // 数据校验
    for (let i = 0; i < list.length; i++) {
      const current = list[i];
      await validationParameter(current, ['owner', 'name', 'type']);
      switch (current.type) {
        case 'SENSOR': // 传感器
          // 判断 current.value 是否为数字，如果小数点后全是0，则转为整数
          if (current.value && !isNaN(current.value)) {
            current.value = String(current.value).replace(/\.0+$/g, '');
            if (current.name.startsWith('FAN') && Number(current.value) <= 1000) {
              this.webHookService.sendMarkdown('风扇状态变更', {
                设备: current.owner,
                名称: current.name,
                转速: `${current.value} RPM`,
                时间: timestamp
              });
            }
          }
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
