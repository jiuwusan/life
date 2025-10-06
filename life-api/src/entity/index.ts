import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
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

  //下注倍数
  @Column({ name: 'bet_times', type: 'varchar', default: '1' })
  betTimes: string;

  //下注是否追加
  @Column({ name: 'bet_is_add', type: 'varchar', default: '0' })
  betIsAdd: string;

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

  //备注
  @Column({ name: 'win_remark', type: 'varchar', nullable: true })
  winRemark: string;

  //追加的uid
  @Column({ name: 'reprint_id', type: 'varchar', nullable: true })
  reprintId: string;

  //追加期数
  @Column({ name: 'reprint_count', type: 'varchar', default: '0' })
  reprintCount: number;

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

  @Column()
  password: string;

  @Column({ nullable: true })
  nickname: string;

  //是否删除
  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

@Entity()
@Unique('UQ_TYPE_NAME', ['name'])
export class Sublink {
  @PrimaryGeneratedColumn()
  uid: string;

  @Column()
  name: string;

  @Column()
  link: string;

  @Column({ nullable: true })
  expire: string;

  @Column({ nullable: true })
  total: string;

  @Column({ nullable: true })
  overage: string;

  @Column({ nullable: true })
  download: string;

  @Column({ nullable: true })
  upload: string;

  @Column({ name: 'update_time', type: 'datetime', nullable: true })
  updateTime: string;

  //是否删除
  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

@Entity()
export class Authcode {
  @PrimaryGeneratedColumn()
  uid: string;

  @Column()
  code: string;

  @Column({ type: 'datetime', nullable: true })
  expire: string;

  @Column()
  remark: string;

  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

@Entity()
@Unique('UQ_TYPE_NAME', ['owner', 'name', 'type'])
export class Tracker {
  @PrimaryGeneratedColumn()
  uid: string;

  @Column()
  owner: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  value: string;

  @Column({ type: 'datetime', nullable: true })
  timestamp: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

@Entity()
export class Feature {
  @PrimaryGeneratedColumn()
  uid: string;

  @Column()
  name: string; // 名称

  @Column()
  route: string; //路由

  @Column()
  image: string; //图片

  @Column({ type: 'varchar', length: 32, default: '1' })
  type: string; //类型

  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

@Entity()
@Unique('UQ_USER_DATE', ['userid', 'date'])
export class WorkDaily {
  @PrimaryGeneratedColumn()
  uid: string;

  @Column({ type: 'varchar', length: 36, default: '1' })
  userid: string;

  @Column({ type: 'date' })
  date: string; // 日期

  @Column()
  content: string; // 内容

  @Column()
  remark: string; // 备注

  @Column({ type: 'varchar', length: 2, default: '0' })
  deleted: string;
}

export const EntityFeature = TypeOrmModule.forFeature([Lottery, User, Sublink, Authcode, Tracker, Feature, WorkDaily]);
