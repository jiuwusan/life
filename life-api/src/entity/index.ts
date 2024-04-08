import { Entity, Column, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Entity()
export class Lottery {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  type: string;

  // 下注时间
  @Column({ name: 'bet_time', type: 'datetime' })
  betTime: Date;

  //下注号码
  @Column({ name: 'bet_ball', type: 'json' })
  betBall: Array<Array<string>>;

  // 开奖时间
  @Column({ name: 'win_time', type: 'datetime', nullable: true })
  winTime: Date;

  //开奖号码
  @Column({ name: 'win_ball', type: 'simple-array', nullable: true })
  winBall: Array<string>;
}

export type LotteryRepository = Repository<Lottery>;

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

export type UserRepository = Repository<User>;

export const EntityFeature = TypeOrmModule.forFeature([Lottery, User]);
