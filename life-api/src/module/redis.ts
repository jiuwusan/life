import { Redis } from 'ioredis';

export const REDIS_INJECT = 'REDIS_CLIENT';

export const REDIS = {
  provide: REDIS_INJECT,
  useFactory: () => {
    return new Redis({
      // Redis服务器配置
      host: 'redis-server',
      port: 6379,
      // host: '10.86.0.239',
      // port: 6379,
      // host: 'cloud.jiuwusan.cn',
      // port: 56379,
      password: 'ZkD953HzR497'
    });
  }
};
