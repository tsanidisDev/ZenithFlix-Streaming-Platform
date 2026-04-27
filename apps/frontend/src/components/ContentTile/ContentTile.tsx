'use client';

import type { StreamingContent } from '../../types/content';
import styles from './ContentTile.module.css';

interface Props {
  item: StreamingContent;
  onClick: (item: StreamingContent) => void;
  watchProgress?: number;
  rank?: number;
}

export default function ContentTile({ item, onClick, watchProgress = 0, rank }: Props) {
  const rating = item.rating != null ? parseFloat(String(item.rating)).toFixed(1) : null;
  const genre = item.genre?.[0] ?? null;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item);
    }
  }

  return (
    <div
      className={`${styles.tile} ${rank != null ? styles.tileHero : ''}`}
      onClick={() => onClick(item)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${item.title}${item.contentType ? `, ${item.contentType}` : ''}${item.year ? `, ${item.year}` : ''}${rating ? `, rated ${rating} out of 10` : ''}`}
    >
      {rank != null && (
        <span className={styles.rank} aria-hidden="true">
          {rank}
        </span>
      )}

      <div className={styles.thumbnail}>
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" />
        ) : (
          <div className={styles.fallback} aria-hidden="true">
            <span>{item.title[0]}</span>
          </div>
        )}
        <div className={styles.overlay} aria-hidden="true">
          <span className={styles.play}>&#9654;</span>
        </div>
        {rating && (
          <span className={styles.rating} aria-hidden="true">
            &#9733; {rating}
          </span>
        )}
        {item.contentType === 'live' && (
          <span className={styles.liveBadge} aria-label="Live content">LIVE</span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.meta}>
          {item.year && <span>{item.year}</span>}
          {item.year && genre && <span aria-hidden="true"> &middot; </span>}
          {genre && <span>{genre}</span>}
        </p>
      </div>

      <div
        className={styles.progress}
        role="progressbar"
        aria-valuenow={watchProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Watch progress: ${watchProgress}%`}
      >
        <div className={styles.progressFill} style={{ width: `${watchProgress}%` }} />
      </div>
    </div>
  );
}

