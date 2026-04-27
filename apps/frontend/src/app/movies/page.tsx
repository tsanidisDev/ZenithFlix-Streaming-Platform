'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
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

function MoviesContent() {
  const { items, loading, error } = useContent({ contentType: 'movie' });
  const { user, token } = useAuth();
  const auth = user && token ? { userId: user.sub, token } : undefined;
  const { history, setProgress } = useWatchHistory(auth);
  const { items: recommended } = useRecommendations({ userId: user?.sub });
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const [genreFilter, setGenreFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const recommendedMovies = recommended.filter((i) => i.contentType === 'movie');
  const isFiltering = genreFilter !== 'All' || query !== '' || minRating > 0;

  function clearFilters() {
    setGenreFilter('All');
    setMinRating(0);
    router.replace(pathname);
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Movies</h1>

      {error && <p className={styles.error}>{error}</p>}

      {query && (
        <p className={styles.searchHint}>
          Results for &ldquo;<strong>{query}</strong>&rdquo;
          {filtered.length === 0 && ' — no matches'}
        </p>
      )}

      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <button
            className={styles.filterToggle}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={14} aria-hidden />
            Filters
            <ChevronDown
              size={14}
              className={filtersOpen ? styles.filterChevronOpen : styles.filterChevron}
              aria-hidden
            />
          </button>
          {genreFilter !== 'All' && (
            <span className={styles.filterBadge}>
              {genreFilter}
              <button className={styles.badgeRemove} onClick={() => setGenreFilter('All')} aria-label="Remove genre filter">
                <X size={10} aria-hidden />
              </button>
            </span>
          )}
          {minRating > 0 && (
            <span className={styles.filterBadge}>
              {minRating}+ ★
              <button className={styles.badgeRemove} onClick={() => setMinRating(0)} aria-label="Remove rating filter">
                <X size={10} aria-hidden />
              </button>
            </span>
          )}
          {isFiltering && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear all
            </button>
          )}
        </div>
        {filtersOpen && (
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="movies-genre-filter">Genre</label>
              <div className={styles.selectWrap}>
                <select
                  id="movies-genre-filter"
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
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="movies-rating-filter">Min Rating</label>
              <div className={styles.selectWrap}>
                <select
                  id="movies-rating-filter"
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
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonRow title="Movies" />
      ) : (
        <>
          {recommendedMovies.length > 0 && !isFiltering && (
            <ContentRow
              title="Recommended Movies"
              items={recommendedMovies}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
          <ContentRow
            title="All Movies"
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

export default function MoviesPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className={styles.main}>
            <SkeletonRow title="Movies" />
          </main>
        }
      >
        <MoviesContent />
      </Suspense>
    </>
  );
}
