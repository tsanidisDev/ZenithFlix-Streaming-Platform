# ZenithFlix Streaming Platform

Full-stack streaming platform — NestJS backend, Next.js 16 frontend, PostgreSQL.

---

## Project Structure

```
apps/backend/     NestJS REST API (auth, streaming CRUD, recommendations, watch history)
apps/frontend/    Next.js 16 App Router (content browsing, auth, theming, search)
docs/             Per-area notes (backend, frontend, migrations, Postman collection)
docker-compose.yml  Runs PostgreSQL 16 locally
```

---

## Prerequisites

- Node.js >= 22
- pnpm >= 9
- Docker & Docker Compose

---

## Setup

### 1 — Clone and install

```bash
git clone https://github.com/tsanidisDev/ZenithFlix-Streaming-Platform.git
cd ZenithFlix-Streaming-Platform
pnpm install
```

### 2 — Environment

```bash
cp .env.example .env
# Edit .env — required values:
#   POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
#   DATABASE_URL=postgres://<user>:<pass>@localhost:5432/<db>
#   JWT_SECRET=<any-long-random-string>
#   JWT_EXPIRES_IN=7d
```

### 3 — Database

```bash
pnpm db:up          # starts the PostgreSQL container
# Wait a few seconds for the container to be ready, then:
cd apps/backend && pnpm migration:run   # runs all TypeORM migrations
pnpm db:seed                            # seeds 15 sample content items
```

### 4 — Run

```bash
# From the monorepo root:
pnpm dev             # starts both apps in parallel
# OR individually:
pnpm dev:backend     # NestJS on http://localhost:3001
pnpm dev:frontend    # Next.js on http://localhost:3000
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both apps in parallel |
| `pnpm dev:backend` | NestJS in watch mode |
| `pnpm dev:frontend` | Next.js with Turbopack |
| `pnpm build` | Production build for both apps |
| `pnpm test:backend` | Backend unit + integration tests |
| `pnpm test:frontend` | Frontend component tests (Vitest + RTL) |
| `pnpm db:up` | Start the PostgreSQL Docker container |
| `pnpm db:down` | Stop the container |
| `pnpm db:reset` | Wipe and restart the database |
| `pnpm db:seed` | Seed 15 sample content items |

---

## Architectural Decisions

### Backend

- **NestJS** with layered structure (controllers / services / modules / DTOs / entities). Enables clean separation of concerns and makes dependency injection straightforward.
- **TypeORM** with `synchronize: false` in all environments — migrations are the source of truth, never auto-sync.
- **JWT** via `@nestjs/jwt` + `passport-jwt`. Secrets from env vars. Passwords hashed with bcrypt (cost factor 12). Write endpoints (`POST/PUT/DELETE /streaming`) require a valid Bearer token; read endpoints are public.
- **class-validator** + **class-transformer** applied via global `ValidationPipe` with `whitelist: true` to strip unknown fields at the boundary.
- **Recommendations** resolved with a single QueryBuilder call using Postgres `&&` (array overlap) on the `genre` column. N+1 queries were the original bug — see [docs/backend.md](docs/backend.md).

### Frontend

- **Next.js 16 App Router** — each route in `app/` is a Server Component shell that renders a client `"use client"` page for interactivity.
- **`useContent` hook** — all data fetching in one place. Returns `{ items, loading, error }`. Only runs when `contentType` (a primitive) changes — avoids object-reference re-render traps.
- **`AuthContext`** — JWT stored in `localStorage` (`zenithflix_token`). A single mount-only `useEffect` reads and decodes the token (SSR constraint — `localStorage` is browser-only). Login/logout mutate state and `localStorage` directly in the event handler.
- **Anti-FOUC theming** — Theme is resolved server-side. `layout.tsx` is an `async` Server Component that reads the `zenithflix-theme` cookie from `next/headers` and sets `data-theme` directly on `<html>` before any HTML is sent to the client. No script injection, no `dangerouslySetInnerHTML`, no flash. `ThemeContext` initialises with a lazy `useState` that reads `document.documentElement.getAttribute('data-theme')` (matching the SSR output exactly) to avoid hydration mismatches. `toggleTheme()` writes both `localStorage` and `document.cookie` so the preference survives hard refreshes.
- **URL-scoped search** — the Header reads the current pathname via `usePathname()` and routes search to `${pathname}?q=…`. Each page reads `useSearchParams()` and filters locally. Search state never bleeds across routes.

---

## Key Decisions

### 1. TypeORM over Prisma

**Chosen:** TypeORM  
**Tradeoff:** TypeORM's entity-decorator pattern maps directly onto NestJS's DI system — `@InjectRepository()` works out of the box. Migrations are generated from entity diffs with a single CLI command. The downside is a less ergonomic query API for complex joins; `QueryBuilder` compensates but is more verbose than Prisma's fluent API. For a team already on NestJS, TypeORM's tighter integration outweighs Prisma's DX advantages.

### 2. CSS Modules over Tailwind

**Chosen:** CSS Modules  
**Tradeoff:** Styles live next to the component, zero runtime cost, full class-name isolation. The design token system (all values in `styles/theme.css` as CSS custom properties) means components only ever reference tokens — the palette can change without touching component files. The downside is verbosity: responsive styles and hover states require explicit rules. Tailwind's utility classes are faster to prototype with but leak implementation details into JSX and make large-scale token changes harder.

### 3. oklch for the design token system

**Chosen:** oklch colour space  
**Tradeoff:** oklch is perceptually uniform — adjusting `L` by a fixed amount produces the same perceived brightness change regardless of hue. This makes hover states (`L + 6%`) and disabled states (`L − 15%`) predictable across the whole palette without manual colour tweaking. The cost is that oklch is not supported in IE11 (irrelevant here) and requires a mental model shift from the familiar hsl. Chose teal (`oklch(70% 0.22 190)`) on a near-black background (`oklch(9% 0.015 260)`) to demonstrate independent design thinking rather than copying a known brand palette.

### 4. pnpm workspaces over Nx / Turborepo

**Chosen:** pnpm workspaces  
**Tradeoff:** No extra tooling for two apps — `pnpm dev` + `--filter` handles parallel dev and per-package scripts cleanly. Turborepo's build caching would pay off once the repo has 5+ packages with slow builds; at two apps it adds config overhead for minimal gain. The monorepo can be migrated to Turborepo non-destructively later.

### 5. URL-scoped search via `useSearchParams` / `usePathname`

**Chosen:** URL query param `?q=` per page  
**Tradeoff:** Search state lives in the URL — shareable, bookmarkable, survives refresh, and Back/Forward work as expected. The alternative (shared React state in a Context) is simpler to implement but breaks navigation semantics and makes search results non-shareable. The URL approach requires `<Suspense>` wrappers around every page that reads `useSearchParams` (Next.js App Router requirement), which adds a small amount of boilerplate but is the correct architectural choice.

---

## Migration Bug Fixes

Full details in [docs/migrations.md](docs/migrations.md).

| # | Bug | Error | Fix |
|---|-----|-------|-----|
| 1 | `cast` is a reserved SQL keyword | `syntax error at or near "cast"` | Renamed column to `cast_members TEXT[]` |
| 2 | `CREATE INDEX` on non-existent column `content_type` | `column "content_type" does not exist` | Added `content_type VARCHAR CHECK(...)` column to the table |
| 3 | `watch_history.user_id` references `users(id)` but no `users` table exists | `relation "users" does not exist` | Added `CREATE TABLE users` before `watch_history` |
| 4 | Trigger on `streaming_content` failed because Bug 1 prevented the table from being created | `relation "streaming_content" does not exist` | Resolved automatically once Bug 1 was fixed |

---

## NestJS Module Bug Fixes

Full details in [docs/backend.md](docs/backend.md).

| # | Bug | Description | Fix |
|---|-----|-------------|-----|
| 1 | Wrong repository for user history | `getForUser` queried `StreamingContent` with `{ where: { userId } }` — `StreamingContent` has no `userId` | Injected `WatchHistoryRepository`, queried `watch_history WHERE user_id = ?` with content relation |
| 2 | N+1 query | One `findOne` per history item inside a loop — 50 watched items = 50 DB round-trips | Collected all unique genres first, then one `QueryBuilder` call with `&&` array overlap |
| 3 | Scalar equality on `TEXT[]` column | `findOne({ where: { genre: 'Drama' } })` generates `WHERE genre = $1` which never matches an array | Used Postgres `&&` operator: `content.genre && ARRAY[:...genres]` |
| 4 | No null guard in `getSimilar` | `findOne` returns `null` for unknown IDs; accessing `.genre` throws | Added `NotFoundException` guard before property access |

---

## Postman Collection

Import `docs/postman/ZenithFlix.postman_collection.json` into Postman.
Swagger UI is also available at `http://localhost:3001/api/docs` when the backend is running.

---

## Assumptions & Known Limitations

- **Video playback:** uses the `video_url` field with an HTML5 `<video>` tag. Sample seed URLs point to W3C's official HTML5 test-video assets (purpose-built for embedding).
- **Watch history (Part 4):** fully implemented. `useWatchHistory()` stores per-item progress in `localStorage`. A "Continue Watching" row surfaces items with 0 < progress < 100%. Progress bars appear on content tiles. Video progress is written via a `timeupdate` listener in `ContentModal`, throttled so only whole-number percentage changes trigger a write.
- **Frontend tests (Part 5):** Vitest + React Testing Library configured. 8 tests across `ContentModal` (4 tests) and `ContentTile` (4 tests), covering: rendering title/year/description, Escape-to-close, null `videoUrl` fallback, null rating badge, click handler, and progress bar visibility/ARIA attributes. Also fixed a real accessibility bug during testing: `aria-hidden="true"` was on the backdrop wrapper, hiding the dialog from screen readers — replaced with relying on `aria-modal="true"` on the dialog alone (the correct pattern).
- **Profile page:** "Member since Month Year" is populated from the `createdAt` claim embedded in the JWT payload at login/register.
- **Footer:** site-wide footer with ZenithFlix branding, mock social links (placeholder `#` hrefs), a fictional-content disclaimer, and the current copyright year. Lucide-react icon names diverge from standard at v1.11 — used `X`, `AtSign`, `Play`, `GitFork` as stand-ins.
- **Forgot password:** button exists on the login page with a "not yet available" message. No reset flow or email service is implemented.
- **Recommendations (full-stack):** two endpoints (`GET /recommendations/user/:userId` and `GET /recommendations/similar/:contentId`) are both wired to the frontend via a `useRecommendations` hook. A **"Recommended for You"** row appears on the home page when the logged-in user has watch history (personalised, genre-overlap from the DB). A **"More Like This"** section appears at the bottom of every content modal, showing horizontally-scrollable similar title cards — clicking one swaps the modal instantly.
- **Live TV:** fully implemented. Fetches `contentType: 'live'` items from the API, renders a scrollable `ContentRow`, supports search/filter, shows a skeleton loader, and opens the full `ContentModal` on click. The two seeded live items have no `video_url` (live events have no VOD) — the modal shows the "No video available" fallback state for those entries.
