import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { StreamingModule } from './streaming/streaming.module.js';
import { UsersModule } from './users/users.module.js';
import { WatchHistoryModule } from './watch-history/watch-history.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        config.get<TypeOrmModuleOptions>('database') as TypeOrmModuleOptions,
    }),
    StreamingModule,
    UsersModule,
    WatchHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
