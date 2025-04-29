import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Entity()
export class Lottery {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  // 类型 sp | wf
  @Column({ type: 'varchar', length: 20 })
  type: string;

  // 下注时间
  @Column({ name: 'bet_time', type: 'datetime' })
  betTime: string;

  //下注号码
  @Column({ name: 'bet_ball', type: 'varchar' })
  betBall: string;

  //开奖期数
  @Column({ name: 'win_num', type: 'varchar', nullable: true })
  winNum: string;

  // 开奖时间
  @Column({ name: 'win_time', type: 'datetime', nullable: true })
  winTime: string;

  //开奖号码
  @Column({ name: 'win_ball', type: 'varchar', nullable: true })
  winBall: string;

  //开奖结果
  @Column({ name: 'win_result', type: 'varchar', nullable: true })
  winResult: string;

  //追加uid
  @Column({ name: 'add_uid', type: 'varchar', nullable: true })
  addUid: string;

  //追加期数
  @Column({ name: 'add_count', type: 'varchar', nullable: true })
  addCount: string;

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

  @Column({ nullable: true })
  nickname: string;

  //是否删除
  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

export const EntityFeature = TypeOrmModule.forFeature([Lottery, User]);
