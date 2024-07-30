import { Redis } from 'ioredis';

export const REDIS_INJECT = 'REDIS_CLIENT';

export const REDIS = {
  provide: REDIS_INJECT,
  useFactory: () => {
    return new Redis({
      // Redis服务器配置
      host: 'redis-server',
      port: 6379,
      password: 'ZkD953HzR497'
    });
  }
};
