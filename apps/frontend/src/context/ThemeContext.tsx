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
	// Lazy initializer — reads the data-theme attribute the server already set on
	// <html> (from the cookie). This is always in sync with the SSR output, so
	// there is never a hydration mismatch. Falls back to 'dark' on the server.
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === 'undefined') return 'dark';
		const attr = document.documentElement.getAttribute('data-theme');
		return attr === 'light' ? 'light' : 'dark';
	});

	// Side effects triggered by a user action belong in the event handler,
	// not in a reactive effect.
	function toggleTheme() {
		const next = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', next);
		localStorage.setItem(STORAGE_KEY, next);
		// Also write a cookie so the server can read it on the next request
		// and set data-theme on <html> before sending HTML (no flash).
		document.cookie = `zenithflix-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
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
