'use client';

import { useEffect, useState } from 'react';
import type { PaginatedResponse, StreamingContent } from '../types/content';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const IS_DEV = process.env.NODE_ENV === 'development';

interface UseContentOptions {
	contentType?: 'movie' | 'series' | 'live';
}

export function useContent({ contentType }: UseContentOptions = {}) {
	const [items, setItems] = useState<StreamingContent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchContent() {
			// setState calls inside the async function body are fine — they
			// are not "direct synchronous" calls in the effect itself.
			setLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({ limit: '100', page: '1' });
				if (contentType) params.set('contentType', contentType);

				const res = await fetch(`${API_BASE}/streaming?${params.toString()}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = (await res.json()) as PaginatedResponse;
				if (!cancelled) setItems(json.data);
			} catch (err) {
				if (!cancelled) {
					// Dev: surface actionable details; production: generic message only.
					const isNetworkError =
						err instanceof TypeError && err.message === 'Failed to fetch';
					const msg = IS_DEV
						? isNetworkError
							? 'Cannot reach the backend. Ensure it is running on port 3001 with CORS enabled.'
							: err instanceof Error
								? err.message
								: 'Failed to load content'
						: 'Unable to load content. Please try again later.';
					setError(msg);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		void fetchContent();

		return () => {
			cancelled = true;
		};
	}, [contentType]);

	return { items, loading, error };
}
