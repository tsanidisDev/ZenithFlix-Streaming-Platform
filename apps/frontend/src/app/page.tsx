'use client';

import { useState } from 'react';
import Header from '../components/Header/Header';
import ContentRow from '../components/ContentRow/ContentRow';
import ContentModal from '../components/ContentModal/ContentModal';
import SkeletonRow from '../components/SkeletonRow/SkeletonRow';
import { useContent } from '../hooks/useContent';
import type { StreamingContent } from '../types/content';
import styles from './page.module.css';

export default function Home() {
  const { items, loading, error } = useContent();
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const [genreFilter, setGenreFilter] = useState('All');

  const availableGenres = ['All', ...new Set(items.map((i) => i.genre))];

  const filtered =
    genreFilter === 'All' ? items : items.filter((i) => i.genre === genreFilter);

  const trending = [...items]
    .sort((a, b) => parseFloat(String(b.rating)) - parseFloat(String(a.rating)))
    .slice(0, 12);

  const byType = (type: string) => filtered.filter((i) => i.content_type === type);

  if (error) {
    return (
      <>
        <Header />
        <main className={styles.error}>
          <p className={styles.errorText}>Could not load content: {error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.filters} role="group" aria-label="Filter by genre">
          {availableGenres.map((g) => (
            <button
              key={g}
              className={`${styles.pill} ${genreFilter === g ? styles.pillActive : ''}`}
              onClick={() => setGenreFilter(g)}
              aria-pressed={genreFilter === g}
            >
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <>
            <SkeletonRow title="Trending Now" />
            <SkeletonRow title="Movies" />
            <SkeletonRow title="Series" />
          </>
        ) : (
          <>
            {genreFilter === 'All' && (
              <ContentRow
                id="trending"
                title="Trending Now"
                items={trending}
                onSelect={setSelected}
              />
            )}
            <ContentRow
              id="movies"
              title="Movies"
              items={byType('movie')}
              onSelect={setSelected}
            />
            <ContentRow
              id="series"
              title="Series"
              items={byType('series')}
              onSelect={setSelected}
            />
            <ContentRow
              id="live"
              title="Live"
              items={byType('live')}
              onSelect={setSelected}
            />
          </>
        )}
      </main>

      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

