import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LotteryController } from '@/controller';
import { LotteryService, RedisService, TasksService } from '@/service';
import { MYSQL57, REDIS, REDIS_INJECT } from '@/module';
import { EntityFeature } from '@/entity';
import { AllExceptionsFilter, ResponseInterceptor } from '@/middleware';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MYSQL57,
    EntityFeature,
    ServeStaticModule.forRoot({
      rootPath: __dirname + '/public'
    }),
    ScheduleModule.forRoot()
  ],
  controllers: [LotteryController],
  providers: [
    REDIS,
    RedisService,
    LotteryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    TasksService
  ],
  exports: [REDIS_INJECT]
})
export class AppModule {}
