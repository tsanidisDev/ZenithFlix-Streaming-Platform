# ZenithFlix Streaming Platform

Full-stack streaming platform - NestJS backend, Next.js 15 frontend, PostgreSQL.

---

## Project Structure

`apps/backend` - NestJS REST API

`apps/frontend` - Next.js 15 App Router

`docs/` - per-area notes (backend, frontend, migrations, postman collections)

`docker-compose.yml` - runs PostgreSQL locally

---

## Prerequisites

- Node.js >= 22
- pnpm >= 9
- Docker & Docker Compose

---

## Setup

```bash
git clone https://github.com/tsanidisDev/ZenithFlix-Streaming-Platform.git
cd ZenithFlix-Streaming-Platform
pnpm install
cp .env.example .env
# fill in your values in .env
pnpm db:up
pnpm dev:backend
pnpm dev:frontend
```

---

## Scripts

`pnpm dev` - start both apps in parallel

`pnpm dev:backend` - NestJS in watch mode (`start:dev`)

`pnpm dev:frontend` - Next.js with Turbopack

`pnpm build` - production build for both apps

`pnpm test:backend` - backend unit + integration tests

`pnpm test:frontend` - frontend component tests

`pnpm db:up` - start the database container

`pnpm db:down` - stop the database container

`pnpm db:reset` - wipe and restart the database

---

## Key Decisions

**TypeORM over Prisma** - fits better with NestJS decorators and lets you generate migrations straight from entities. Query API is less ergonomic than Prisma's but QueryBuilder covers the gaps.

**CSS Modules over Tailwind** - styles live next to the component, zero runtime cost, full isolation. More verbose for responsive work but easier to maintain long term.

**pnpm workspaces over Nx/Turborepo** - no extra tooling needed for two apps. Easy to layer on Turborepo later if build caching becomes necessary.

---

## Migration bugs - see [docs/migrations.md](docs/migrations.md)

## Recommendations module bugs - see [docs/backend.md](docs/backend.md)

---

## Assumptions

- Auth is JWT with a mocked user context, no real sign-up/login flow yet.
- Video playback uses the `video_url` field with an HTML5 `<video>` tag, no real CDN.
- Watch history lives in `localStorage` for now; the DB table is there for a future sync.
