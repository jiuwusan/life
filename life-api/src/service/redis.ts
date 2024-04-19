import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis
  ) {}

  set(key: string, value: any) {
    typeof value === 'object' && (value = JSON.stringify(value));
    return this.redis.set(key, value);
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
}
