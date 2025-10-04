import { Controller, Post, Get, Query, Body, Headers } from '@nestjs/common';
import { QbService } from '@/service';
import config from '@/config';

@Controller('qb')
export class QbController {
  constructor(private readonly qbService: QbService) {}

  getServerInfo(apiKeys = '') {
    const [server, username, password] = apiKeys.split(';');
    return {
      server: server || config.QBITTORRENT_SERVER,
      username: username || config.QBITTORRENT_USERNAME,
      password: password || config.QBITTORRENT_PASSWORD
    };
  }

  @Post('torrents/rename')
  async updateTorrentsFileName(@Headers('qb-api-keys') apiKeys: string, @Body() { hash, regexRule, replaceRegexRule }) {
    return await this.qbService.updateTorrentsFileName(this.getServerInfo(apiKeys), { hash, regexRule, replaceRegexRule });
  }

  @Get('torrents/info')
  async queryTorrentsInfo(@Headers('qb-api-keys') apiKeys: string, @Query() { filter }) {
    return await this.qbService.queryTorrentsInfo(this.getServerInfo(apiKeys), { filter });
  }

  @Get('torrents/files')
  async queryTorrentFiles(@Headers('qb-api-keys') apiKeys: string, @Query() { hash, indexes }) {
    return await this.qbService.queryTorrentFiles(this.getServerInfo(apiKeys), { hash, indexes });
  }
}
