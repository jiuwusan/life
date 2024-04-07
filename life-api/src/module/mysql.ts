import { TypeOrmModule } from '@nestjs/typeorm';
console.log('__dirname-->', __dirname);
export default TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'jiuwusan.cn',
  port: 36336,
  username: 'root',
  password: 'ZkD953HzR497',
  database: 'life-prod',
  entities: [__dirname + '/../entity/*{.ts,.js}'],
  synchronize: true
});
