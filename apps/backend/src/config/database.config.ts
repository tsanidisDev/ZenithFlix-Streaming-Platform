import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: false,
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
  }),
);
