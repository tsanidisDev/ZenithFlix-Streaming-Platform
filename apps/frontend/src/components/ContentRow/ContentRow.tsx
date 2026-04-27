'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import ContentTile from '../ContentTile/ContentTile';
import type { StreamingContent } from '../../types/content';
import styles from './ContentRow.module.css';

interface Props {
  id?: string;
  title: string;
  items: StreamingContent[];
  onSelect: (item: StreamingContent) => void;
  watchProgress?: Record<number, number>;
  variant?: 'default' | 'trending';
}

export default function ContentRow({
  id,
  title,
  items,
  onSelect,
  watchProgress = {},
  variant = 'default',
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  function scroll(dir: 'left' | 'right') {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 640 : -640, behavior: 'smooth' });
  }

  const isTrending = variant === 'trending';

  return (
    <section
      id={id}
      className={`${styles.row} ${isTrending ? styles.rowTrending : ''}`}
      aria-label={title}
    >
      <h2 className={`${styles.title} ${isTrending ? styles.titleTrending : ''}`}>
        {isTrending && <TrendingUp size={18} className={styles.trendingBadge} aria-hidden="true" />}
        {title}
      </h2>
      <div className={styles.wrapper}>
        <button
          className={`${styles.btn} ${styles.btnLeft}`}
          onClick={() => scroll('left')}
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft size={28} />
        </button>

        <div ref={trackRef} className={styles.track} role="list">
          {items.map((item, index) => (
            <div key={item.id} role="listitem">
              <ContentTile
                item={item}
                onClick={onSelect}
                watchProgress={watchProgress[item.id] ?? 0}
                rank={isTrending ? index + 1 : undefined}
              />
            </div>
          ))}
        </div>

        <button
          className={`${styles.btn} ${styles.btnRight}`}
          onClick={() => scroll('right')}
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
}

