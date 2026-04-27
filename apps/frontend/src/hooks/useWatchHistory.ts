'use client';

import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'zenithflix_history';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface WatchHistoryAuth {
  userId: number;
  token: string;
}

// Map of contentId → watch progress (0–100)
export type WatchHistory = Record<number, number>;

function readStorage(): WatchHistory {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchHistory) : {};
  } catch {
    return {};
  }
}

function writeStorage(history: WatchHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore quota errors — watch history is non-critical
  }
}

interface UseWatchHistoryReturn {
  /** Full history map: contentId → progress % */
  history: WatchHistory;
  /** Record or update progress for a single item (0–100). */
  setProgress: (contentId: number, progress: number) => void;
  /** Progress for a specific item, or 0 if not watched. */
  getProgress: (contentId: number) => number;
}

export function useWatchHistory(auth?: WatchHistoryAuth): UseWatchHistoryReturn {
  // Lazy initializer — reads localStorage once on mount, never triggers an effect
  const [history, setHistory] = useState<WatchHistory>(readStorage);
  // Track which contentIds have been POSTed to the backend this session
  const syncedRef = useRef<Set<number>>(new Set());

  const setProgress = useCallback((contentId: number, progress: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    setHistory((prev) => {
      // Skip update if progress hasn't changed by at least 1% — timeupdate fires
      // several times per second and we don't want to thrash localStorage.
      if (prev[contentId] === clamped) return prev;
      const next = { ...prev, [contentId]: clamped };
      writeStorage(next);
      return next;
    });

    // Sync to backend once per item per session so the recommendations engine
    // has data to work with. Fire-and-forget — watch history is non-critical.
    if (auth && clamped > 0 && !syncedRef.current.has(contentId)) {
      syncedRef.current.add(contentId);
      fetch(`${API_BASE}/watch-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ userId: auth.userId, contentId }),
      }).catch(() => {
        // Allow retry on next progress update
        syncedRef.current.delete(contentId);
      });
    }
  }, [auth]);

  const getProgress = useCallback(
    (contentId: number) => history[contentId] ?? 0,
    [history],
  );

  return { history, setProgress, getProgress };
}
