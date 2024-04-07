import { Entity, Column, PrimaryGeneratedColumn, Repository } from 'typeorm';

@Entity()
export class Lottery {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  type: string;

  // 下注时间
  @Column({ name: 'bet_time', type: 'datetime' })
  betTime: string;

  //下注号码
  @Column({ name: 'bet_ball', type: 'text' })
  betBall: string;

  // 开奖时间
  @Column({ name: 'win_time', type: 'datetime', nullable: true })
  winTime: string;

  //开奖号码
  @Column({ name: 'win_ball', type: 'text', nullable: true })
  winBall: string;
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
