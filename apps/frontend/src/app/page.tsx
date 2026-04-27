'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import Header from '../components/Header/Header';
import ContentRow from '../components/ContentRow/ContentRow';
import ContentModal from '../components/ContentModal/ContentModal';
import SkeletonRow from '../components/SkeletonRow/SkeletonRow';
import { useContent } from '../hooks/useContent';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { useRecommendations } from '../hooks/useRecommendations';
import { useAuth } from '../context/AuthContext';
import type { StreamingContent } from '../types/content';
import styles from './page.module.css';

function HomeContent() {
  const { items, loading, error } = useContent();
  const { user, token } = useAuth();
  const auth = user && token ? { userId: user.sub, token } : undefined;
  const { history, setProgress } = useWatchHistory(auth);
  const { items: recommended } = useRecommendations({ userId: user?.sub });
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const [genreFilter, setGenreFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const filtered = (genreFilter === 'All' ? searched : searched.filter((i) => i.genre?.includes(genreFilter)))
    .filter((i) => typeFilter === 'All' || i.contentType === typeFilter)
    .filter((i) => minRating === 0 || parseFloat(String(i.rating ?? 0)) >= minRating);

  const isFiltering = genreFilter !== 'All' || typeFilter !== 'All' || query !== '' || minRating > 0;

  function clearFilters() {
    setGenreFilter('All');
    setTypeFilter('All');
    setMinRating(0);
    router.replace(pathname);
  }

  const trending = [...items]
    .sort((a, b) => parseFloat(String(b.rating ?? 0)) - parseFloat(String(a.rating ?? 0)))
    .slice(0, 12);

  const byType = (type: string) => filtered.filter((i) => typeFilter === 'All' ? i.contentType === type : true);

  // Items the user has started watching (progress > 0 and < 100)
  const continueWatching = items
    .filter((i) => (history[i.id] ?? 0) > 0 && (history[i.id] ?? 0) < 100)
    .sort((a, b) => (history[b.id] ?? 0) - (history[a.id] ?? 0));

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
          {typeFilter !== 'All' && (
            <span className={styles.filterBadge}>
              {typeFilter === 'movie' ? 'Movie' : typeFilter === 'series' ? 'Series' : 'Live'}
              <button className={styles.badgeRemove} onClick={() => setTypeFilter('All')} aria-label="Remove type filter">
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
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="home-type-filter">Type</label>
              <div className={styles.selectWrap}>
                <select
                  id="home-type-filter"
                  className={styles.filterSelect}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filter by content type"
                >
                  <option value="All">All Types</option>
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                  <option value="live">Live</option>
                </select>
                <ChevronDown size={14} className={styles.selectChevron} aria-hidden />
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="home-rating-filter">Min Rating</label>
              <div className={styles.selectWrap}>
                <select
                  id="home-rating-filter"
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
        <>
          <SkeletonRow title="Trending Now" />
          <SkeletonRow title="Movies" />
          <SkeletonRow title="Series" />
        </>
      ) : (
        <>
          {continueWatching.length > 0 && !isFiltering && (
            <ContentRow
              id="continue-watching"
              title="Continue Watching"
              items={continueWatching}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
          {recommended.length > 0 && !isFiltering && (
            <ContentRow
              id="recommended"
              title="Recommended for You"
              items={recommended}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
          {!isFiltering && (
            <ContentRow
              id="trending"
              title="Trending Now"
              items={trending}
              onSelect={setSelected}
              watchProgress={history}
              variant="trending"
            />
          )}
          {(typeFilter === 'All' || typeFilter === 'movie') && (
            <ContentRow
              id="movies"
              title="Movies"
              items={byType('movie')}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
          {(typeFilter === 'All' || typeFilter === 'series') && (
            <ContentRow
              id="series"
              title="Series"
              items={byType('series')}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
          {(typeFilter === 'All' || typeFilter === 'live') && (
            <ContentRow
              id="live"
              title="Live"
              items={byType('live')}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
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

