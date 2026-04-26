import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StreamingContent } from '../streaming/entities/streaming-content.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, StreamingContent, WatchHistory],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
