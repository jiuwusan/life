import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MYSQL57, REDIS, REDIS_INJECT } from '@/module';
import { EntityFeature } from '@/entity';
import { AllExceptionsFilter, ResponseInterceptor, Gateway } from '@/middleware';
import { ScheduleModule } from '@nestjs/schedule';
import * as Controllers from '@/controller';
import * as Services from '@/service';

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
  controllers: [...Object.keys(Controllers).map((name: string) => Controllers[name])],
  providers: [
    REDIS,
    ...Object.keys(Services).map((name: string) => Services[name]),
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter }
  ],
  exports: [REDIS_INJECT]
})

//中间件
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Gateway).forRoutes('*');
  }
}
