'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Header from '../../components/Header/Header';
import ContentRow from '../../components/ContentRow/ContentRow';
import ContentModal from '../../components/ContentModal/ContentModal';
import SkeletonRow from '../../components/SkeletonRow/SkeletonRow';
import { useContent } from '../../hooks/useContent';
import { useWatchHistory } from '../../hooks/useWatchHistory';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useAuth } from '../../context/AuthContext';
import type { StreamingContent } from '../../types/content';
import styles from '../section.module.css';

function SeriesContent() {
  const { items, loading, error } = useContent({ contentType: 'series' });
  const { user, token } = useAuth();
  const auth = user && token ? { userId: user.sub, token } : undefined;
  const { history, setProgress } = useWatchHistory(auth);
  const { items: recommended } = useRecommendations({ userId: user?.sub });
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const [genreFilter, setGenreFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get('q')?.toLowerCase().trim() ?? '';
  const genres = ['All', ...new Set(items.flatMap((i) => i.genre ?? []))];

  const searched = query
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.description?.toLowerCase().includes(query),
      )
    : items;

  const filtered = (genreFilter === 'All' ? searched : searched.filter((i) => i.genre?.includes(genreFilter)))
    .filter((i) => minRating === 0 || parseFloat(String(i.rating ?? 0)) >= minRating);

  const recommendedSeries = recommended.filter((i) => i.contentType === 'series');
  const isFiltering = genreFilter !== 'All' || query !== '' || minRating > 0;

  function clearFilters() {
    setGenreFilter('All');
    setMinRating(0);
    router.replace(pathname);
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Series</h1>

      {error && <p className={styles.error}>{error}</p>}

      {query && (
        <p className={styles.searchHint}>
          Results for &ldquo;<strong>{query}</strong>&rdquo;
          {filtered.length === 0 && ' — no matches'}
        </p>
      )}

      <div className={styles.filterBar}>
        <label className={styles.filterLabel} htmlFor="series-genre-filter">Genre</label>
        <div className={styles.selectWrap}>
          <select
            id="series-genre-filter"
            className={styles.filterSelect}
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            aria-label="Filter by genre"
          >
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown size={14} className={styles.selectChevron} aria-hidden />
        </div>
        <label className={styles.filterLabel} htmlFor="series-rating-filter">Min Rating</label>
        <div className={styles.selectWrap}>
          <select
            id="series-rating-filter"
            className={styles.filterSelect}
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            aria-label="Filter by minimum rating"
          >
            <option value={0}>Any</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5+</option>
            <option value={6}>6+</option>
            <option value={7}>7+</option>
            <option value={8}>8+</option>
            <option value={9}>9+</option>
          </select>
          <ChevronDown size={14} className={styles.selectChevron} aria-hidden />
        </div>
        {isFiltering && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonRow title="Series" />
      ) : (
        <>
          {recommendedSeries.length > 0 && !isFiltering && (
            <ContentRow
              title="Recommended Series"
              items={recommendedSeries}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
          <ContentRow
            title="All Series"
            items={filtered}
            onSelect={setSelected}
            watchProgress={history}
          />
        </>
      )}
      {selected && (
        <ContentModal
          item={selected}
          onClose={() => setSelected(null)}
          onProgress={setProgress}
          onSelect={setSelected}
          watchProgress={history}
        />
      )}
    </main>
  );
}

export default function SeriesPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className={styles.main}>
            <SkeletonRow title="Series" />
          </main>
        }
      >
        <SeriesContent />
      </Suspense>
    </>
  );
}
