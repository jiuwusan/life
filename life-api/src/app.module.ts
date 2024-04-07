import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotteryController } from '@/controller';
import { LotteryService } from '@/service';
import mysql from '@/module/mysql';
import { Lottery } from '@/entity';

@Module({
  imports: [mysql, TypeOrmModule.forFeature([Lottery])],
  controllers: [LotteryController],
  providers: [LotteryService]
})
export class AppModule {}
