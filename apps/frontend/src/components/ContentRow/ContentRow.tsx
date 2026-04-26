'use client';

import { useRef } from 'react';
import ContentTile from '../ContentTile/ContentTile';
import type { StreamingContent } from '../../types/content';
import styles from './ContentRow.module.css';

interface Props {
  id?: string;
  title: string;
  items: StreamingContent[];
  onSelect: (item: StreamingContent) => void;
  watchProgress?: Record<number, number>;
}

export default function ContentRow({ id, title, items, onSelect, watchProgress = {} }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  function scroll(dir: 'left' | 'right') {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 640 : -640, behavior: 'smooth' });
  }

  return (
    <section id={id} className={styles.row} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.wrapper}>
        <button
          className={`${styles.btn} ${styles.btnLeft}`}
          onClick={() => scroll('left')}
          aria-label={`Scroll ${title} left`}
        >
          &#8249;
        </button>

        <div ref={trackRef} className={styles.track} role="list">
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <ContentTile
                item={item}
                onClick={onSelect}
                watchProgress={watchProgress[item.id] ?? 0}
              />
            </div>
          ))}
        </div>

        <button
          className={`${styles.btn} ${styles.btnRight}`}
          onClick={() => scroll('right')}
          aria-label={`Scroll ${title} right`}
        >
          &#8250;
        </button>
      </div>
    </section>
  );
}
