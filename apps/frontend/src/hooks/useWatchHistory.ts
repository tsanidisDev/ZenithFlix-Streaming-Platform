'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'zenithflix_history';

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

export function useWatchHistory(): UseWatchHistoryReturn {
  // Lazy initializer — reads localStorage once on mount, never triggers an effect
  const [history, setHistory] = useState<WatchHistory>(readStorage);

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
  }, []);

  const getProgress = useCallback(
    (contentId: number) => history[contentId] ?? 0,
    [history],
  );

  return { history, setProgress, getProgress };
}
