import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { StreamingContent } from '../src/streaming/entities/streaming-content.entity.js';
import { StreamingModule } from '../src/streaming/streaming.module.js';

const mockRepo = {
  createQueryBuilder: jest.fn(() => ({
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('GET /api/streaming (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StreamingModule],
    })
      .overrideProvider(getRepositoryToken(StreamingContent))
      .useValue(mockRepo)
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with paginated shape', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/streaming')
      .expect(200);

    const body = res.body as Record<string, unknown>;
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.page).toBe('number');
    expect(typeof body.limit).toBe('number');
    expect(typeof body.totalPages).toBe('number');
  });

  it('rejects unknown query params with 400', async () => {
    await request(app.getHttpServer())
      .get('/api/streaming?unknownParam=bad')
      .expect(400);
  });

  it('returns 400 for invalid page param', async () => {
    await request(app.getHttpServer())
      .get('/api/streaming?page=abc')
      .expect(400);
  });
});
