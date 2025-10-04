import { Injectable } from '@nestjs/common';
import { qbApi } from '@/external/api';
import { RedisService } from '@/service/redis';
import { type Params } from '@/utils/fetch';

export type QbServerInfo = {
  server: string;
  username: string;
  password: string;
};

@Injectable()
export class QbService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 获取缓存KEY
   * @param server
   * @returns
   */
  getAuthCacheKey(server: string) {
    const host = new URL(server).host;
    return `${host}:qbittorrent:auth-cookie`;
  }

  /**
   * 授权
   */
  async getAuthorization(server: string, username: string, password: string) {
    let ACIDCount = 0;
    const takeAuth = async () => {
      const response = await fetch(`${server}/api/v2/auth/login`, {
        method: 'POST',
        body: new URLSearchParams({ username, password })
      });
      const cookies = response.headers.get('set-cookie');
      // 提取 SID
      const result = (cookies || '').match(/SID=([^;]+)/) || [];
      // 如果登录失败，最多尝试3次
      if (!result[1] && ACIDCount < 3) {
        ACIDCount++;
        return await takeAuth();
      }
      // 返回结果
      result[1] && this.redisService.set(this.getAuthCacheKey(server), result[1]);
      console.log(`qBittorrent 登录成功：${result[1]}`);
      return result[1];
    };
    return await takeAuth();
  }

  /**
   * 发送请求
   * @param APIFunciton
   * @param options
   */
  async fetch(qb: QbServerInfo, APIFunciton: any, options: Params) {
    let ACIDCount = 0;
    const sendFetch = async (refreshAuth?: boolean) => {
      let cookies = await this.redisService.get(this.getAuthCacheKey(qb.server));
      (!cookies || refreshAuth) && (cookies = await this.getAuthorization(qb.server, qb.username, qb.password));
      try {
        return await APIFunciton({ ...options, headers: { Cookie: `SID=${cookies}` }, baseUrl: qb.server });
      } catch (error) {
        if (error.status === 403 && ACIDCount < 3) {
          console.log(`qBittorrent cookie 过期，重新登录`);
          ACIDCount++;
          return await sendFetch(true);
        }
      }
      return void 0;
    };
    return await sendFetch();
  }

  /**
   * 重命名
   */
  async updateTorrentsFileName(qb: QbServerInfo, { hash, regexRule, replaceRegexRule }: { hash: string; regexRule: string; replaceRegexRule: string }) {
    const matchRegex = new RegExp(regexRule, 'g');
    const result = await this.queryTorrentFiles(qb, { hash });
    const results = [];
    let failed = 0;
    for (let i = 0; i < result.length; i++) {
      const current = result[i];
      const data = { hash, oldPath: current.name, newPath: current.name.replace(matchRegex, replaceRegexRule), success: true };
      try {
        await this.fetch(qb, qbApi.updateTorrentFileName, { data });
      } catch (error) {
        data.success = false;
        failed++;
      }
      results.push(data);
    }
    return {
      success: results.length - failed,
      failed,
      results
    };
  }

  /**
   * 获取种子列表
   * @param qb
   * @param query
   * @returns
   */
  async queryTorrentsInfo(qb: QbServerInfo, { filter = 'all' }) {
    console.log('qb:', qb);
    return await this.fetch(qb, qbApi.queryTorrentsInfo, { query: { filter } });
  }

  /**
   * 获取种子文件列表
   * @param qb
   * @param query
   * @returns
   */
  async queryTorrentFiles(qb: QbServerInfo, query: { hash: string; indexes?: string }) {
    if (!query?.hash) {
      throw new Error('hash值 不能为空');
    }
    !query.indexes && delete query.indexes;
    return (await this.fetch(qb, qbApi.queryTorrentFiles, { query })) || [];
  }
}
