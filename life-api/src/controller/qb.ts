import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { QbService } from '@/service';

@Controller('qb')
export class QbController {
  constructor(private readonly qbService: QbService) {}

  @Post('torrents/rename')
  async updateTorrentsFileName(@Body() { hash, regexRule, replaceRegexRule }) {
    return await this.qbService.updateTorrentsFileName(hash, regexRule, replaceRegexRule);
  }

  @Get('torrents/info')
  async queryTorrentsInfo() {
    return await this.qbService.queryTorrentsInfo();
  }

  @Get('torrents/files')
  async queryTorrentFiles(@Query() { hash }) {
    return await this.qbService.queryTorrentFiles(hash);
  }
}
