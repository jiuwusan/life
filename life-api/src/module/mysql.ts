import { TypeOrmModule } from '@nestjs/typeorm';
import config from '@/config';

export const MYSQL57 = TypeOrmModule.forRoot({
  type: 'mysql',
  host: config.MYSQL_HOST,
  port: config.MYSQL_PORT,
  username: config.MYSQL_USERNAME,
  password: config.MYSQL_PASSWORD,
  database: config.MYSQL_DATABASE,
  entities: [__dirname + '/../entity/*{.ts,.js}'],
  timezone: '+08:00',
  synchronize: true
});
