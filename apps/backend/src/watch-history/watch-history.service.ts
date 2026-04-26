import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from './entities/watch-history.entity.js';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto.js';
import { UpdateWatchProgressDto } from './dto/update-watch-progress.dto.js';

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectRepository(WatchHistory)
    private readonly watchHistoryRepo: Repository<WatchHistory>,
  ) {}

  async findByUser(userId: number): Promise<WatchHistory[]> {
    return this.watchHistoryRepo.find({
      where: { userId },
      relations: ['content'],
      order: { watchedAt: 'DESC' },
    });
  }

  async create(dto: CreateWatchHistoryDto): Promise<WatchHistory> {
    const entry = this.watchHistoryRepo.create({
      userId: dto.userId,
      contentId: dto.contentId,
    });
    return this.watchHistoryRepo.save(entry);
  }

  async updateProgress(
    id: number,
    dto: UpdateWatchProgressDto,
  ): Promise<WatchHistory> {
    const entry = await this.watchHistoryRepo.findOneBy({ id });
    if (!entry) {
      throw new NotFoundException(`Watch history entry ${id} not found`);
    }
    if (dto.progress !== undefined) {
      entry.progress = dto.progress;
    }
    return this.watchHistoryRepo.save(entry);
  }

  async remove(id: number): Promise<void> {
    const entry = await this.watchHistoryRepo.findOneBy({ id });
    if (!entry) {
      throw new NotFoundException(`Watch history entry ${id} not found`);
    }
    await this.watchHistoryRepo.remove(entry);
  }
}
