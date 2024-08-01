import { TypeOrmModule } from '@nestjs/typeorm';

export const MYSQL57 = TypeOrmModule.forRoot({
  type: 'mysql',
  // host: 'mysql57-server',
  // port: 3306,
  host: 'cloud.jiuwusan.cn',
  port: 36336,
  username: 'root',
  password: 'ZkD953HzR497',
  database: 'life-prod',
  entities: [__dirname + '/../entity/*{.ts,.js}'],
  timezone: '+08:00', // 设置时区为东八区
  synchronize: true
});
