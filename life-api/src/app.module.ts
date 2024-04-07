import { Module } from '@nestjs/common';
import { LotteryController } from '@/controller';
import { LotteryService } from '@/service';
import mysql from '@/module/mysql';

@Module({
  imports: [mysql],
  controllers: [LotteryController],
  providers: [LotteryService]
})
export class AppModule {}
