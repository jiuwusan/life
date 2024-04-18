import { TypeOrmModule } from '@nestjs/typeorm';

export const MYSQL57 = TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'jiuwusan.cn',
  port: 36336,
  username: 'root',
  password: 'ZkD953HzR497',
  database: 'life-prod',
  entities: [__dirname + '/../entity/*{.ts,.js}'],
  synchronize: true
});
