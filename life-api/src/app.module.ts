import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LotteryController } from '@/controller';
import { LotteryService } from '@/service';
import { MYSQL57, REDIS, REDIS_INJECT } from '@/module';
import { EntityFeature } from '@/entity';
import { AllExceptionsFilter, ResponseInterceptor } from '@/middleware';

@Module({
  imports: [
    MYSQL57,
    EntityFeature,
    ServeStaticModule.forRoot({
      rootPath: __dirname + '/public'
    })
  ],
  controllers: [LotteryController],
  providers: [
    REDIS,
    LotteryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ],
  exports: [REDIS_INJECT]
})
export class AppModule {}
