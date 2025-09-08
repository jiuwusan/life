import { Redis } from 'ioredis';

const { REDIS_HOST, REDIS_PORT = 6379, REDIS_PASSWORD } = process.env;

export const REDIS_INJECT = 'REDIS_CLIENT';

export const REDIS = {
  provide: REDIS_INJECT,
  useFactory: () => {
    return new Redis({
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
      password: REDIS_PASSWORD
    });
  }
};
