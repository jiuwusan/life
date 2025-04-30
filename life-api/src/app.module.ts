import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LotteryController, QbController, UserController } from '@/controller';
import { LotteryService, QbService, UserService, RedisService, TasksService, AuthService } from '@/service';
import { MYSQL57, REDIS, REDIS_INJECT } from '@/module';
import { EntityFeature } from '@/entity';
import { AllExceptionsFilter, ResponseInterceptor, Gateway } from '@/middleware';
import { ScheduleModule } from '@nestjs/schedule';

// 注入模块
@Module({
  imports: [
    MYSQL57,
    EntityFeature,
    ServeStaticModule.forRoot({
      rootPath: __dirname + '/public'
    }),
    ScheduleModule.forRoot()
  ],
  controllers: [LotteryController, QbController, UserController],
  providers: [
    REDIS,
    RedisService,
    LotteryService,
    QbService,
    UserService,
    AuthService,
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

//中间件
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Gateway).forRoutes('*');
  }
}
