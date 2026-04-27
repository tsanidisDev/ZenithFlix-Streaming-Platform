# Frontend

Next.js 16 App Router — component guide, hooks, theming, and UX decisions.

---

## Folder Structure

```
app/                  Next.js App Router pages
  page.tsx            Home — Trending Now + genre filter rows
  movies/             Movies catalogue with genre filter + search
  series/             Series catalogue with genre filter + search
  trending/           Trending page with search
  live/               Live TV placeholder
  profile/            User profile placeholder
  login/              Login page with JWT auth
  register/           Register page
  layout.tsx          Root layout — ThemeProvider, AuthProvider, Header, anti-FOUC script
  globals.css         CSS reset, base styles
components/
  ContentModal/       Full-screen modal — thumbnail, video player, metadata, cast
  ContentRow/         Horizontally scrollable row of tiles
  ContentTile/        Individual tile — thumbnail, title, hover overlay, progress bar
  Header/             Navigation bar — logo, links, search, theme toggle, user menu
  MobileNav/          Slide-in mobile drawer
  SkeletonRow/        Loading skeleton that mirrors ContentRow layout
context/
  AuthContext.tsx     JWT state — login/register/logout, user, isLoading
  ThemeContext.tsx    Dark/light theme — reads localStorage on mount, toggles on demand
hooks/
  useContent.ts       Data-fetching hook — returns { items, loading, error }
lib/
  api.ts              Typed fetch wrappers for the backend REST API
public/
  theme-init.js       Anti-FOUC script — sets data-theme before React hydrates
styles/
  theme.css           All CSS custom properties (tokens) — spacing, color, typography, radius
types/
  content.ts          StreamingContent interface + related types
```

---

## Theming

### Token system

All values live in `styles/theme.css` as CSS custom properties. Components reference tokens only — never raw hex/rgb values. The dark theme is the default; the light theme overrides via `[data-theme='light']`.

Color palette uses **oklch** — a perceptually uniform colour space. `L + 6%` always produces the same perceived brightness bump regardless of hue, making hover and focus states consistent across the palette without manual adjustments.

### Anti-FOUC (Flash Of Unstyled Content)

The theme preference is stored in `localStorage` (`zenithflix-theme`). On load, there's a window between the browser painting the HTML and React hydrating where the wrong theme could flash.

**Fix:** `/public/theme-init.js` is loaded via `<Script strategy="beforeInteractive">` in `layout.tsx`. Next.js injects this script before any React JS runs. It reads `localStorage` and sets `data-theme` on `<html>` before the first paint. The script has a `try/catch` to handle SSR or private browsing safely.

This is preferable to `dangerouslySetInnerHTML` with an inline script string — the file is readable, version-controlled, and doesn't trigger CSP issues with `unsafe-inline`.

---

## `useContent` Hook

`hooks/useContent.ts` — single hook for all content fetching.

```ts
const { items, loading, error } = useContent({ contentType: 'movie' });
```

### Design decisions

- **Primitive dependency** — destructures `contentType` from the options object before passing to the dep array. This avoids `options` being a new object reference every render (which would cause infinite re-fetches).
- **setState inside async function** — `setLoading(true)` / `setError(null)` are called inside the `fetchContent` async function, not directly in the effect body. React's rule is: don't call `setState` synchronously at the top level of an effect. Inside an async function triggered from the effect is fine.
- **Prod/dev error messages** — `process.env.NODE_ENV === 'development'` gates dev-specific error messages ("Cannot reach backend on port 3001"). Production always sees a generic "Unable to load content" message. Dev-specific details should never leak to production.

---

## `useEffect` Discipline

This project follows [react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect) strictly.

### Effects that were kept

| File | Effect | Why it's valid |
|------|--------|---------------|
| `ThemeContext.tsx` | Reads `localStorage` on mount | `localStorage` is browser-only — cannot be read during SSR or in a `useState` initializer in Next.js |
| `AuthContext.tsx` | Reads JWT from `localStorage` on mount | Same SSR constraint |
| `login/page.tsx` | Redirects if already authenticated | Subscribes to auth state to drive navigation — "syncing with an external system" per React docs |

### Effects that were removed

| File | Removed effect | Why it was wrong |
|------|---------------|-----------------|
| `ThemeContext.tsx` | `useEffect([theme])` that called `setAttribute` + `localStorage.setItem` | Side effects triggered by a user action (clicking "toggle theme") belong in the **event handler**, not a reactive effect. Also had a subtle bug: fires on mount with `theme='dark'`, potentially overwriting a stored `'light'` before the init effect reads it. Moved to `toggleTheme()`. |

---

## Search Architecture

Search state lives in the URL as `?q=`. This means:
- Results are shareable and bookmarkable
- Browser Back/Forward work as expected
- State survives hard refresh

**Header** reads `usePathname()` and pushes `${pathname}?q=${encodeURIComponent(q)}`. It routes to the current page, not always `/`.

**Each page** reads `useSearchParams()` inside a `<Suspense>` boundary (required by Next.js App Router) and filters content client-side.

**Clear filters** button appears when either the URL param or the genre dropdown has a value. Clicking calls `router.replace(pathname)` to strip the `?q=` param and resets the genre state.

---

## CSS Conventions

- **CSS Modules** — one `.module.css` per component, co-located in the component folder
- **BEM naming, camelCase** — `.cardTitle` not `.card__title` (CSS Modules generate unique hashes anyway)
- **No `composes: ... from global`** — this is CSS Modules-only syntax that trips standard CSS linters. Instead, grouped selectors share animations: `.title, .thumb, .line { animation: shimmer ... }`
- **No `background-image: url("data:image/svg+xml,...")` hacks** for custom select arrows — use a positioned `<ChevronDown>` Lucide icon with `pointer-events: none` instead. The icon respects `currentColor` and updates automatically with theme changes.
- **No early-return full-screen errors** — returning a completely different JSX tree from a component on error causes React to unmount the Header, removes all navigation context, and is jarring UX. Errors render inline as an `.errorBanner` within the normal layout.

---

## Component Notes

### `ContentModal`

- Focus trap on open (Tab cycles only within the modal)
- `Escape` key closes
- `aria-modal="true"` + `role="dialog"` + `aria-labelledby` for screen readers
- `<video>` tag wired to `content.videoUrl` with `controls` — falls back to a styled placeholder if the URL is empty

### `Header`

- Lucide icons throughout: `Search`, `X`, `Sun`, `Moon`, `Menu`, `LogOut`
- Search bar expands inline on click, collapses on Escape or clicking outside
- User avatar dropdown shows username + logout option when authenticated

### `SkeletonRow`

- Mirrors `ContentRow` layout exactly (same padding, same tile widths)
- Shimmer animation defined locally in `SkeletonRow.module.css` — no global `.shimmer` class dependency

---

## Not Yet Implemented

- `useWatchHistory` hook + progress bar on `ContentTile` (Part 4)
- "Continue Watching" row on the home page
- Frontend tests with Vitest + RTL (Part 5)

