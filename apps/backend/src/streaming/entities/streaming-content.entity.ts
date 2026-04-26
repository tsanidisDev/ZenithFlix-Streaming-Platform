import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WatchHistory } from '../../watch-history/entities/watch-history.entity';

export type ContentType = 'movie' | 'series';

@Entity('streaming_content')
export class StreamingContent {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: 'varchar' })
  declare title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  @Column({ type: 'varchar', name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string | null = null;

  @Column({ type: 'varchar', name: 'video_url', nullable: true })
  videoUrl: string | null = null;

  @Index('idx_content_type')
  @Check(`"content_type" IN ('movie', 'series')`)
  @Column({ type: 'varchar', name: 'content_type', nullable: true })
  contentType: ContentType | null = null;

  @Check(`"year" > 1800 AND "year" < 2100`)
  @Column({ type: 'smallint', nullable: true })
  year: number | null = null;

  @Column({ type: 'text', array: true, nullable: true })
  genre: string[] | null = null;

  @Check(`"rating" BETWEEN 0 AND 10`)
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number | null = null;

  @Column({ type: 'integer', nullable: true })
  duration: number | null = null;

  @Column({ type: 'text', name: 'cast_members', array: true, nullable: true })
  castMembers: string[] | null = null;

  @Check(`"watch_progress" BETWEEN 0 AND 100`)
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'watch_progress',
    default: 0,
  })
  declare watchProgress: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  declare updatedAt: Date;

  @OneToMany(() => WatchHistory, (wh) => wh.content)
  declare watchHistory: WatchHistory[];
}
