import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinResult } from '@/types';

@Entity()
export class Lottery {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  type: string;

  // 下注时间
  @Column({ name: 'bet_time', type: 'datetime' })
  betTime: string;

  //下注号码
  @Column({ name: 'bet_ball', type: 'json' })
  betBall: Array<Array<string>>;

  // 开奖时间
  @Column({ name: 'win_time', type: 'datetime', nullable: true })
  winTime: string;

  //开奖号码
  @Column({ name: 'win_ball', type: 'simple-array', nullable: true })
  winBall: Array<string>;

  //开奖结果
  @Column({ name: 'win_results', type: 'json', nullable: true })
  winResults: Array<WinResult>;

  //追加uid
  @Column({ name: 'add_uid', type: 'varchar', nullable: true })
  addUid: Array<WinResult>;

  //追加期数
  @Column({ name: 'add_count', type: 'varchar', nullable: true })
  addCount: Array<WinResult>;

  //是否删除
  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  username: string;

  // 下注时间
  @Column()
  password: string;
}

export const EntityFeature = TypeOrmModule.forFeature([Lottery, User]);
