'use client';

import { useEffect, useState } from 'react';
import type { StreamingContent } from '../types/content';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface UseRecommendationsOptions {
	/** Pass to fetch personalised recommendations for a logged-in user. */
	userId?: number;
	/** Pass to fetch content similar to a specific item. */
	contentId?: number;
}

/**
 * Fetches recommendations from the backend.
 * - `userId`    → GET /recommendations/user/:userId   (personalised row)
 * - `contentId` → GET /recommendations/similar/:contentId (More Like This)
 *
 * Fails silently — recommendations are non-critical UI.
 * State is only updated inside async callbacks — no synchronous setState in
 * the effect body to avoid cascading-render warnings in React 19.
 */
export function useRecommendations({
	userId,
	contentId,
}: UseRecommendationsOptions) {
	const [items, setItems] = useState<StreamingContent[]>([]);

	useEffect(() => {
		if (userId == null && contentId == null) return;

		let cancelled = false;
		const endpoint =
			userId != null
				? `${API_BASE}/recommendations/user/${userId}`
				: `${API_BASE}/recommendations/similar/${contentId}`;

		fetch(endpoint)
			.then((r) =>
				r.ok ? (r.json() as Promise<StreamingContent[]>) : Promise.resolve([]),
			)
			.then((data) => {
				if (!cancelled) setItems(data);
			})
			.catch(() => {
				// Recommendations are non-critical — swallow errors silently
			});

		return () => {
			cancelled = true;
		};
	}, [userId, contentId]);

	return { items };
}
