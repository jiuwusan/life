import { Injectable } from '@nestjs/common';
import { qbApi } from '@/external/api';
import { RedisService } from '@/service/redis';
import { type Params } from '@/utils/fetch';

@Injectable()
export class QbService {
  private authCacheKey = `qbittorrent:auth-cookies`;
  private authFormInfo = { username: 'admin', password: 'xinshu527' };
  constructor(private readonly redisService: RedisService) {}

  /**
   * 授权
   */
  async auth() {
    const response = await qbApi.login(this.authFormInfo);
    const cookies = response.headers.get('set-cookie');
    // 提取 SID
    const result = (cookies || '').match(/SID=([^;]+)/) || [];
    result[1] && this.redisService.set(this.authCacheKey, result[1]);
    return result[1];
  }

  /**
   * 发送请求
   * @param APIFunciton
   * @param options
   */
  async fetch(APIFunciton: any, options: Params) {
    let cookies = this.redisService.get(this.authCacheKey);
    !cookies && (cookies = this.auth());
    APIFunciton({ ...options, headers: { Cookie: cookies } });
  }

  /**
   * 重命名
   */
  async rename() {
    return await this.auth();
  }

  queryTorrentsInfo() {
    this.fetch(qbApi.queryTorrentsInfo, { query: {} });
  }
}
