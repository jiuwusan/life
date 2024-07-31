import { Controller, Get } from '@nestjs/common';
import { QbService } from '@/service';

@Controller('qb')
export class QbController {
  constructor(private readonly qbService: QbService) {}

  @Get('rename')
  async rename() {
    return await this.qbService.rename();
  }

  @Get('torrents/info')
  async queryTorrentsInfo() {
    return await this.qbService.queryTorrentsInfo();
  }
}
