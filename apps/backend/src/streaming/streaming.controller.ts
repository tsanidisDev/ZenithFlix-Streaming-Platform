import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { StreamingService } from './streaming.service.js';
import { CreateStreamingContentDto } from './dto/create-streaming-content.dto.js';
import { UpdateStreamingContentDto } from './dto/update-streaming-content.dto.js';
import { ListStreamingContentDto } from './dto/list-streaming-content.dto.js';

@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Get()
  findAll(@Query() query: ListStreamingContentDto) {
    return this.streamingService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.streamingService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStreamingContentDto) {
    return this.streamingService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStreamingContentDto,
  ) {
    return this.streamingService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.streamingService.remove(id);
  }
}
