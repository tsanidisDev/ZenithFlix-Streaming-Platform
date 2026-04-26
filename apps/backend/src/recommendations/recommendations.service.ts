import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreamingContent } from '../streaming/entities/streaming-content.entity';
import { WatchHistory } from '../watch-history/entities/watch-history.entity';

const MAX_RECOMMENDATIONS = 10;

@Injectable()
export class RecommendationsService {
  constructor(
    // FIX 1: inject WatchHistory repo (not StreamingContent) to query a user's watch history
    @InjectRepository(WatchHistory)
    private watchHistoryRepo: Repository<WatchHistory>,
    @InjectRepository(StreamingContent)
    private contentRepo: Repository<StreamingContent>,
  ) {}

  async getForUser(userId: number): Promise<StreamingContent[]> {
    // FIX 1: query watch_history by userId, loading the related content for its genres
    const history = await this.watchHistoryRepo.find({
      where: { user: { id: userId } },
      relations: ['content'],
    });

    if (history.length === 0) {
      return [];
    }

    // Collect all unique genres from watched content, filter out nulls
    const genres = [
      ...new Set(
        history
          .flatMap((entry) => entry.content?.genre ?? [])
          .filter((g) => g.length > 0),
      ),
    ];

    if (genres.length === 0) {
      return [];
    }

    // Track watched content IDs so we don't recommend what the user already watched
    const watchedIds = history
      .map((entry) => entry.content?.id)
      .filter((id): id is number => id !== undefined);

    // FIX 2: single batch query replacing the N+1 loop
    // FIX 3: use && (array overlap) operator for TEXT[] genre matching
    const qb = this.contentRepo
      .createQueryBuilder('content')
      .where('content.genre && ARRAY[:...genres]', { genres })
      .orderBy('content.rating', 'DESC')
      .take(MAX_RECOMMENDATIONS);

    if (watchedIds.length > 0) {
      qb.andWhere('content.id NOT IN (:...watchedIds)', { watchedIds });
    }

    return qb.getMany();
  }

  async getSimilar(contentId: number): Promise<StreamingContent[]> {
    const content = await this.contentRepo.findOneBy({ id: contentId });

    // FIX: null check — contentRepo.findOne can return null if the id doesn't exist
    if (!content) {
      throw new NotFoundException(`Content with id ${contentId} not found`);
    }

    if (!content.genre || content.genre.length === 0) {
      return [];
    }

    // FIX 3: array overlap query instead of equality check on TEXT[] column
    return this.contentRepo
      .createQueryBuilder('content')
      .where('content.genre && ARRAY[:...genres]', { genres: content.genre })
      .andWhere('content.id != :id', { id: contentId })
      .orderBy('content.rating', 'DESC')
      .take(MAX_RECOMMENDATIONS)
      .getMany();
  }
}
