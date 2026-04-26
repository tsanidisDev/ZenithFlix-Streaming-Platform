import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreamingContent } from './entities/streaming-content.entity.js';
import { CreateStreamingContentDto } from './dto/create-streaming-content.dto.js';
import { UpdateStreamingContentDto } from './dto/update-streaming-content.dto.js';
import { ListStreamingContentDto } from './dto/list-streaming-content.dto.js';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class StreamingService {
  constructor(
    @InjectRepository(StreamingContent)
    private readonly contentRepo: Repository<StreamingContent>,
  ) {}

  async findAll(
    query: ListStreamingContentDto,
  ): Promise<PaginatedResult<StreamingContent>> {
    const { page = 1, limit = 20, contentType, genre } = query;

    const qb = this.contentRepo.createQueryBuilder('content');

    if (contentType) {
      qb.andWhere('content.contentType = :contentType', { contentType });
    }

    if (genre) {
      qb.andWhere(':genre = ANY(content.genre)', { genre });
    }

    const [data, total] = await qb
      .orderBy('content.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<StreamingContent> {
    const content = await this.contentRepo.findOneBy({ id });
    if (!content) {
      throw new NotFoundException(`Content with id ${id} not found`);
    }
    return content;
  }

  async create(dto: CreateStreamingContentDto): Promise<StreamingContent> {
    const content = this.contentRepo.create(dto);
    return this.contentRepo.save(content);
  }

  async update(
    id: number,
    dto: UpdateStreamingContentDto,
  ): Promise<StreamingContent> {
    const content = await this.findOne(id);
    Object.assign(content, dto);
    return this.contentRepo.save(content);
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepo.remove(content);
  }
}
