'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'zenithflix-theme';

interface ThemeContextValue {
	theme: Theme;
	toggleTheme(): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	// Lazy initializer — runs once on the client, never on the server.
	// During SSR, `window` is undefined so we fall back to 'dark'.
	// The anti-FOUC script (/public/theme-init.js) already set `data-theme`
	// on <html> before React hydrated, so there is no flash regardless of
	// which value is stored. No useEffect needed here at all — this is
	// exactly the pattern described in:
	// https://react.dev/learn/you-might-not-need-an-effect
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === 'undefined') return 'dark';
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored === 'light' || stored === 'dark' ? stored : 'dark';
	});

	// Side effects triggered by a user action belong in the event handler,
	// not in a reactive effect.
	function toggleTheme() {
		const next = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', next);
		localStorage.setItem(STORAGE_KEY, next);
		setTheme(next);
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
}
