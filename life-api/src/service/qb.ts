import { Injectable } from '@nestjs/common';
import { qbApi } from '@/external/api';
import { RedisService } from '@/service/redis';
import { type Params } from '@/utils/fetch';

@Injectable()
export class QbService {
  private authCacheKey = `qbittorrent:auth-cookies`;
  private authFormInfo = { username: 'jiuwusan', password: 'ZkD953497' };
  constructor(private readonly redisService: RedisService) {}

  /**
   * 授权
   */
  async auth() {
    let ACIDCount = 0;
    const takeAuth = async () => {
      const response = await qbApi.login(this.authFormInfo);
      const cookies = response.headers.get('set-cookie');
      // 提取 SID
      const result = (cookies || '').match(/SID=([^;]+)/) || [];
      // 如果登录失败，最多尝试3次
      if (!result[1] && ACIDCount < 3) {
        ACIDCount++;
        return await takeAuth();
      }
      // 返回结果
      result[1] && this.redisService.set(this.authCacheKey, result[1]);
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
  async fetch(APIFunciton: any, options: Params) {
    let ACIDCount = 0;
    const sendFetch = async (refreshAuth?: boolean) => {
      let cookies = await this.redisService.get(this.authCacheKey);
      (!cookies || refreshAuth) && (cookies = await this.auth());
      try {
        const result = await APIFunciton({ ...options, headers: { Cookie: `SID=${cookies}` } });
        return result;
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
  async updateTorrentsFileName(hash: string, regexRule: string, replaceRegexRule: string) {
    const matchRegex = new RegExp(regexRule, 'g');
    const result = await this.queryTorrentFiles(hash);
    const reanmeResult = [];
    for (let i = 0; i < result.length; i++) {
      const current = result[i];
      const data = { hash, oldPath: current.name, newPath: current.name.replace(matchRegex, replaceRegexRule), success: true };
      try {
        await this.fetch(qbApi.updateTorrentFileName, { data });
      } catch (error) {
        data.success = false;
      }
      reanmeResult.push(data);
    }
    return reanmeResult;
  }

  async queryTorrentsInfo() {
    return await this.fetch(qbApi.queryTorrentsInfo, { query: {} });
  }

  async queryTorrentFiles(hash: string) {
    if (!hash) {
      throw new Error('hash值 不能为空');
    }
    return (await this.fetch(qbApi.queryTorrentFiles, { query: { hash } })) || [];
  }
}
