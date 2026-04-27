'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Header from '../components/Header/Header';
import ContentRow from '../components/ContentRow/ContentRow';
import ContentModal from '../components/ContentModal/ContentModal';
import SkeletonRow from '../components/SkeletonRow/SkeletonRow';
import { useContent } from '../hooks/useContent';
import type { StreamingContent } from '../types/content';
import styles from './page.module.css';

function HomeContent() {
  const { items, loading, error } = useContent();
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const [genreFilter, setGenreFilter] = useState('All');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('q')?.toLowerCase().trim() ?? '';

  const availableGenres = ['All', ...new Set(items.flatMap((i) => i.genre ?? []))];

  const searched = query
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.genre?.some((g) => g.toLowerCase().includes(query)) ||
          i.description?.toLowerCase().includes(query),
      )
    : items;

  const filtered =
    genreFilter === 'All' ? searched : searched.filter((i) => i.genre?.includes(genreFilter));

  const trending = [...items]
    .sort((a, b) => parseFloat(String(b.rating ?? 0)) - parseFloat(String(a.rating ?? 0)))
    .slice(0, 12);

  const byType = (type: string) => filtered.filter((i) => i.contentType === type);

  return (
    <main className={styles.main}>
      {error && (
        <p className={styles.errorBanner} role="alert">{error}</p>
      )}

      {query && (
        <p className={styles.searchHint}>
          Showing results for &ldquo;<strong>{query}</strong>&rdquo;
          {filtered.length === 0 && ' — no matches found'}
        </p>
      )}

      <div className={styles.filterBar}>
        <label className={styles.filterLabel} htmlFor="home-genre-filter">Genre</label>
        <div className={styles.selectWrap}>
          <select
            id="home-genre-filter"
            className={styles.filterSelect}
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            aria-label="Filter by genre"
          >
            {availableGenres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.selectChevron} aria-hidden />
        </div>
        {(genreFilter !== 'All' || query) && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setGenreFilter('All');
              router.replace(pathname);
            }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <>
          <SkeletonRow title="Trending Now" />
          <SkeletonRow title="Movies" />
          <SkeletonRow title="Series" />
        </>
      ) : (
        <>
          {genreFilter === 'All' && !query && (
            <ContentRow
              id="trending"
              title="Trending Now"
              items={trending}
              onSelect={setSelected}
              variant="trending"
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

      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <main className={styles.main}>
          <SkeletonRow title="Trending Now" />
          <SkeletonRow title="Movies" />
          <SkeletonRow title="Series" />
        </main>
      }>
        <HomeContent />
      </Suspense>
    </>
  );
}

