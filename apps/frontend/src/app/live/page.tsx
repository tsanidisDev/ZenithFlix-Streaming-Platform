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

function LiveContent() {
  const { items, loading, error } = useContent({ contentType: 'live' });
  const [selected, setSelected] = useState<StreamingContent | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get('q')?.toLowerCase().trim() ?? '';

  const filtered = query
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.description?.toLowerCase().includes(query),
      )
    : items;

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>
        <span className={styles.liveDot} aria-hidden="true" /> Live
      </h1>

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
        <SkeletonRow title="Live" />
      ) : (
        <ContentRow title="Live Events" items={filtered} onSelect={setSelected} />
      )}
      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

export default function LivePage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className={styles.main}>
            <SkeletonRow title="Live" />
          </main>
        }
      >
        <LiveContent />
      </Suspense>
    </>
  );
}
