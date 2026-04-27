'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Header from '../../components/Header/Header';
import ContentRow from '../../components/ContentRow/ContentRow';
import ContentModal from '../../components/ContentModal/ContentModal';
import SkeletonRow from '../../components/SkeletonRow/SkeletonRow';
import { useContent } from '../../hooks/useContent';
import type { StreamingContent } from '../../types/content';
import styles from '../section.module.css';

function TrendingContent() {
  const { items, loading, error } = useContent();
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get('q')?.toLowerCase().trim() ?? '';

  const trending = [...items]
    .sort((a, b) => parseFloat(String(b.rating ?? 0)) - parseFloat(String(a.rating ?? 0)))
    .slice(0, 20);

  const filtered = query
    ? trending.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.description?.toLowerCase().includes(query),
      )
    : trending;

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Trending Now</h1>

      {error && <p className={styles.error}>{error}</p>}

      {query && (
        <p className={styles.searchHint}>
          Results for &ldquo;<strong>{query}</strong>&rdquo;
          {filtered.length === 0 && ' — no matches'}
          {query && (
            <button
              className={styles.clearBtnInline}
              onClick={() => router.replace(pathname)}
            >
              Clear
            </button>
          )}
        </p>
      )}

      {loading ? (
        <SkeletonRow title="Trending" />
      ) : (
        <ContentRow
          title="Top Rated"
          items={filtered}
          onSelect={setSelected}
          variant="trending"
        />
      )}
      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
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
