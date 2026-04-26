'use client';

import type { StreamingContent } from '../../types/content';
import styles from './ContentTile.module.css';

interface Props {
  item: StreamingContent;
  onClick: (item: StreamingContent) => void;
  watchProgress?: number;
}

export default function ContentTile({ item, onClick, watchProgress = 0 }: Props) {
  const rating = parseFloat(String(item.rating)).toFixed(1);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item);
    }
  }

  return (
    <div
      className={styles.tile}
      onClick={() => onClick(item)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${item.title}, ${item.content_type}, ${item.release_year}, rated ${rating} out of 10`}
    >
      <div className={styles.thumbnail}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt="" />
        ) : (
          <div className={styles.fallback} aria-hidden="true">
            <span>{item.title[0]}</span>
          </div>
        )}
        <div className={styles.overlay} aria-hidden="true">
          <span className={styles.play}>&#9654;</span>
        </div>
        <span className={styles.rating} aria-hidden="true">
          &#9733; {rating}
        </span>
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.meta}>
          {item.release_year} &middot; {item.genre}
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
