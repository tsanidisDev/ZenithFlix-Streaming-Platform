import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { StreamingContent } from '../streaming/entities/streaming-content.entity';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('user/:userId')
  getForUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<StreamingContent[]> {
    return this.recommendationsService.getForUser(userId);
  }

  @Get('similar/:contentId')
  getSimilar(
    @Param('contentId', ParseIntPipe) contentId: number,
  ): Promise<StreamingContent[]> {
    return this.recommendationsService.getSimilar(contentId);
  }
}
