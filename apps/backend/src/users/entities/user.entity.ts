import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WatchHistory } from '../../watch-history/entities/watch-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: 'varchar', unique: true })
  declare email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  declare passwordHash: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  declare createdAt: Date;

  @OneToMany(() => WatchHistory, (wh) => wh.user)
  declare watchHistory: WatchHistory[];
}
