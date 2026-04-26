import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { StreamingContent } from '../streaming/entities/streaming-content.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, StreamingContent, WatchHistory],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: false,
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
  }),
);
