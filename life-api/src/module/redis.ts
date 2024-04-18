import { Redis } from 'ioredis';

export const REDIS_INJECT = 'REDIS_CLIENT';

export const REDIS = {
  provide: REDIS_INJECT,
  useFactory: () => {
    return new Redis({
      // Redis服务器配置
      host: 'jiuwusan.cn',
      port: 36379,
      password: 'ZkD953HzR497'
    });
  }
};
