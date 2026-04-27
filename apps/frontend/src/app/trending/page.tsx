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

function TrendingContent() {
  const { items, loading, error } = useContent();
  const { user, token } = useAuth();
  const auth = user && token ? { userId: user.sub, token } : undefined;
  const { history, setProgress } = useWatchHistory(auth);
  const { items: recommended } = useRecommendations({ userId: user?.sub });
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const [minRating, setMinRating] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get('q')?.toLowerCase().trim() ?? '';
  const isFiltering = minRating > 0 || query !== '';

  const trending = [...items]
    .sort((a, b) => parseFloat(String(b.rating ?? 0)) - parseFloat(String(a.rating ?? 0)))
    .slice(0, 20);

  const filtered = (query
    ? trending.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.description?.toLowerCase().includes(query),
      )
    : trending
  ).filter((i) => minRating === 0 || parseFloat(String(i.rating ?? 0)) >= minRating);

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Trending Now</h1>

      {error && <p className={styles.error}>{error}</p>}

      {query && (
        <p className={styles.searchHint}>
          Results for &ldquo;<strong>{query}</strong>&rdquo;
          {filtered.length === 0 && ' \u2014 no matches'}
        </p>
      )}

      <div className={styles.filterBar}>
        <label className={styles.filterLabel} htmlFor="trending-rating-filter">Min Rating</label>
        <div className={styles.selectWrap}>
          <select
            id="trending-rating-filter"
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
          <button
            className={styles.clearBtn}
            onClick={() => { setMinRating(0); router.replace(pathname); }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonRow title="Trending" />
      ) : (
        <>
          {recommended.length > 0 && !isFiltering && (
            <ContentRow
              title="Recommended for You"
              items={recommended}
              onSelect={setSelected}
              watchProgress={history}
            />
          )}
          <ContentRow
            title="Top Rated"
            items={filtered}
            onSelect={setSelected}
            watchProgress={history}
            variant="trending"
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

export default function TrendingPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className={styles.main}>
            <SkeletonRow title="Trending" />
          </main>
        }
      >
        <TrendingContent />
      </Suspense>
    </>
  );
}
