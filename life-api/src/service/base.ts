import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class BaseService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis
  ) {}
}
