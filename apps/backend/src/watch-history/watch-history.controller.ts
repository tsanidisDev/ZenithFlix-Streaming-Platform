import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service.js';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto.js';
import { UpdateWatchProgressDto } from './dto/update-watch-progress.dto.js';

@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Get()
  findByUser(@Query('userId', ParseIntPipe) userId: number) {
    return this.watchHistoryService.findByUser(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateWatchHistoryDto) {
    return this.watchHistoryService.create(dto);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWatchProgressDto,
  ) {
    return this.watchHistoryService.updateProgress(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.watchHistoryService.remove(id);
  }
}
