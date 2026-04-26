import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StreamingContent } from '../../streaming/entities/streaming-content.entity';

@Entity('watch_history')
export class WatchHistory {
  @PrimaryGeneratedColumn()
  declare id: number;

  @ManyToOne(() => User, (user) => user.watchHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  declare user: User;

  @Column({ name: 'user_id', nullable: true })
  declare userId: number;

  @ManyToOne(() => StreamingContent, (content) => content.watchHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'content_id' })
  declare content: StreamingContent;

  @Column({ name: 'content_id', nullable: true })
  declare contentId: number;

  @Check(`"progress" BETWEEN 0 AND 100`)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  progress: number | null = null;

  @CreateDateColumn({ type: 'timestamptz', name: 'watched_at' })
  declare watchedAt: Date;
}
