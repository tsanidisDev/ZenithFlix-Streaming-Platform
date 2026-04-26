'use client';

import { useEffect, useState } from 'react';
import type { PaginatedResponse, StreamingContent } from '../types/content';
import { mockContent } from '../lib/mockContent';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export function useContent() {
  const [items, setItems] = useState<StreamingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      try {
        const res = await fetch(`${API_BASE}/streaming?limit=100&page=1`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as PaginatedResponse;
        if (!cancelled) setItems(json.data);
      } catch {
        if (!cancelled) {
          console.warn('[useContent] API unavailable — using mock data');
          setItems(mockContent);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchContent();

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}
