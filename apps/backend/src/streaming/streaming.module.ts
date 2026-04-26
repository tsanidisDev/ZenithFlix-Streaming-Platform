import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamingContent } from './entities/streaming-content.entity.js';
import { StreamingService } from './streaming.service.js';
import { StreamingController } from './streaming.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([StreamingContent])],
  controllers: [StreamingController],
  providers: [StreamingService],
  exports: [StreamingService],
})
export class StreamingModule {}
