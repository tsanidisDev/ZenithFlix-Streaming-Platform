'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Header from '../../components/Header/Header';
import ContentRow from '../../components/ContentRow/ContentRow';
import ContentModal from '../../components/ContentModal/ContentModal';
import SkeletonRow from '../../components/SkeletonRow/SkeletonRow';
import { useContent } from '../../hooks/useContent';
import type { StreamingContent } from '../../types/content';
import styles from '../section.module.css';

function SeriesContent() {
  const { items, loading, error } = useContent({ contentType: 'series' });
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const [genreFilter, setGenreFilter] = useState('All');
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
  const filtered =
    genreFilter === 'All' ? searched : searched.filter((i) => i.genre?.includes(genreFilter));

  const hasFilters = genreFilter !== 'All' || query !== '';

  function clearFilters() {
    setGenreFilter('All');
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
        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonRow title="Series" />
      ) : (
        <ContentRow title="All Series" items={filtered} onSelect={setSelected} />
      )}
      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
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
