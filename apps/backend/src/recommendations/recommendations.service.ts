import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContentType,
  StreamingContent,
} from '../streaming/entities/streaming-content.entity';
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
      // No watch history — fall back to top-rated content across all types
      return this.contentRepo
        .createQueryBuilder('content')
        .orderBy('content.rating', 'DESC')
        .take(MAX_RECOMMENDATIONS)
        .getMany();
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
      // No genres in watch history — fall back to top-rated
      return this.contentRepo
        .createQueryBuilder('content')
        .orderBy('content.rating', 'DESC')
        .take(MAX_RECOMMENDATIONS)
        .getMany();
    }

    // Track watched content IDs so we don't recommend what the user already watched
    const watchedIds = history
      .map((entry) => entry.content?.id)
      .filter((id): id is number => id !== undefined);

    // Also track which content types the user prefers
    const preferredTypes = [
      ...new Set(
        history
          .map((entry) => entry.content?.contentType)
          .filter((t): t is ContentType => t != null),
      ),
    ];

    // FIX 2: single batch query replacing the N+1 loop
    // FIX 3: use && (array overlap) operator for TEXT[] genre matching
    const qb = this.contentRepo
      .createQueryBuilder('content')
      .where('content.genre && ARRAY[:...genres]', { genres })
      .orderBy('content.rating', 'DESC')
      .take(MAX_RECOMMENDATIONS * 2);

    if (watchedIds.length > 0) {
      qb.andWhere('content.id NOT IN (:...watchedIds)', { watchedIds });
    }

    const candidates = await qb.getMany();

    // Boost preferred content types to the top
    return candidates
      .sort((a, b) => {
        const preferA =
          a.contentType != null && preferredTypes.includes(a.contentType)
            ? 0
            : 1;
        const preferB =
          b.contentType != null && preferredTypes.includes(b.contentType)
            ? 0
            : 1;
        if (preferA !== preferB) return preferA - preferB;
        return (
          parseFloat(String(b.rating ?? 0)) - parseFloat(String(a.rating ?? 0))
        );
      })
      .slice(0, MAX_RECOMMENDATIONS);
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
    // Fetch 2× limit so we can re-sort: same contentType first, then by rating
    const candidates = await this.contentRepo
      .createQueryBuilder('content')
      .where('content.genre && ARRAY[:...genres]', { genres: content.genre })
      .andWhere('content.id != :id', { id: contentId })
      .orderBy('content.rating', 'DESC')
      .take(MAX_RECOMMENDATIONS * 2)
      .getMany();

    // Boost same content type to the top
    return candidates
      .sort((a, b) => {
        const sameA = a.contentType === content.contentType ? 0 : 1;
        const sameB = b.contentType === content.contentType ? 0 : 1;
        if (sameA !== sameB) return sameA - sameB;
        return (
          parseFloat(String(b.rating ?? 0)) - parseFloat(String(a.rating ?? 0))
        );
      })
      .slice(0, MAX_RECOMMENDATIONS);
  }
}
