import { TypeOrmModule } from '@nestjs/typeorm';

const { MYSQL_HOST, MYSQL_PORT = 3306, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

export const MYSQL57 = TypeOrmModule.forRoot({
  type: 'mysql',
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  username: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  entities: [__dirname + '/../entity/*{.ts,.js}'],
  timezone: '+08:00',
  synchronize: true
});
