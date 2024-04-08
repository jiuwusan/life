import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LotteryController } from '@/controller';
import { LotteryService } from '@/service';
import mysql from '@/module/mysql';
import { EntityFeature } from '@/entity';
import { AllExceptionsFilter, ResponseInterceptor } from '@/middleware';

@Module({
  imports: [mysql, EntityFeature],
  controllers: [LotteryController],
  providers: [
    LotteryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ]
})
export class AppModule {}
