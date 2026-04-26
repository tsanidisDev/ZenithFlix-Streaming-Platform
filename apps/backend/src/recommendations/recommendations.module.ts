import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { StreamingContent } from '../streaming/entities/streaming-content.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StreamingContent, WatchHistory])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
