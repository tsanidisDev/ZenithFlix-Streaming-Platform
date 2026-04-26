import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { StreamingContent } from './entities/streaming-content.entity.js';
import { StreamingService } from './streaming.service.js';
import { CreateStreamingContentDto } from './dto/create-streaming-content.dto.js';

type MockRepo = Partial<Record<keyof Repository<StreamingContent>, jest.Mock>>;

const mockQueryBuilder = () => ({
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
});

const createMockRepo = (): MockRepo => ({
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder()),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('StreamingService', () => {
  let service: StreamingService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamingService,
        { provide: getRepositoryToken(StreamingContent), useValue: repo },
      ],
    }).compile();

    service = module.get(StreamingService);
  });

  describe('findAll', () => {
    it('returns paginated result with defaults', async () => {
      const result = await service.findAll({});
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    });

    it('applies contentType filter', async () => {
      const qb = mockQueryBuilder();
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll({ contentType: 'movie' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'content.contentType = :contentType',
        { contentType: 'movie' },
      );
    });

    it('applies genre filter', async () => {
      const qb = mockQueryBuilder();
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll({ genre: 'Drama' });

      expect(qb.andWhere).toHaveBeenCalledWith(':genre = ANY(content.genre)', {
        genre: 'Drama',
      });
    });

    it('calculates totalPages correctly', async () => {
      const qb = mockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([new Array(10).fill({}), 45]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.totalPages).toBe(5);
      expect(result.page).toBe(2);
    });
  });

  describe('findOne', () => {
    it('returns content when found', async () => {
      const content = { id: 1, title: 'Test Movie' } as StreamingContent;
      (repo.findOneBy as jest.Mock).mockResolvedValue(content);

      await expect(service.findOne(1)).resolves.toEqual(content);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('throws NotFoundException when not found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves content', async () => {
      const dto: CreateStreamingContentDto = { title: 'New Movie' };
      const entity = { id: 1, ...dto } as StreamingContent;

      (repo.create as jest.Mock).mockReturnValue(entity);
      (repo.save as jest.Mock).mockResolvedValue(entity);

      await expect(service.create(dto)).resolves.toEqual(entity);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('update', () => {
    it('updates and saves content', async () => {
      const content = { id: 1, title: 'Old Title' } as StreamingContent;
      const updated = { ...content, title: 'New Title' };

      (repo.findOneBy as jest.Mock).mockResolvedValue(content);
      (repo.save as jest.Mock).mockResolvedValue(updated);

      await expect(service.update(1, { title: 'New Title' })).resolves.toEqual(
        updated,
      );
    });

    it('throws NotFoundException when content not found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.update(99, { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes content', async () => {
      const content = { id: 1, title: 'Test' } as StreamingContent;
      (repo.findOneBy as jest.Mock).mockResolvedValue(content);
      (repo.remove as jest.Mock).mockResolvedValue(undefined);

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith(content);
    });

    it('throws NotFoundException when content not found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
