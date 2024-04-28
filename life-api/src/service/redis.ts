import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis
  ) {}

  set(key: string, value: any, durationType?: 'EX' | 'PX', duration?: number | string) {
    typeof value === 'object' && (value = JSON.stringify(value));
    if (!durationType) {
      return this.redis.set(key, value);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.redis.set(key, value, durationType, duration);
  }

  async get<T>(key: string): Promise<T> {
    let result = await this.redis.get(key);
    try {
      // 尝试格式化
      result && ['{', '['].findIndex(item => result.includes(item)) > -1 && (result = JSON.parse(result));
    } catch (error) {
      // 格式化出错
    }
    return result as T;
  }

  async del(key: string) {
    return this.redis.del(key);
  }
}
