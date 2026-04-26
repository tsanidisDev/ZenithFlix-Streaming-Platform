# Backend

NestJS REST API — architecture notes, endpoint reference, and bug fix log.

---

## Folder structure

```
src/
  auth/           JWT guard, strategy, register/login controller
  streaming/      CRUD endpoints for content catalogue
  recommendations/ genre-based recommendations (bugs fixed)
  watch-history/  track watched content + progress
  users/          user entity + service (used by auth)
  database/       TypeORM migration files
  config/         database connection config
```

---

## Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |

### Streaming content
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/streaming` | — | List with pagination, `contentType` + `genre` filters |
| GET | `/api/streaming/:id` | — | Single item |
| POST | `/api/streaming` | JWT | Create |
| PUT | `/api/streaming/:id` | JWT | Full update |
| DELETE | `/api/streaming/:id` | JWT | Delete |

Pagination response shape: `{ data, total, page, limit, totalPages }`

### Recommendations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/recommendations/user/:userId` | — | Top 10 by genre overlap with watch history |
| GET | `/api/recommendations/similar/:contentId` | — | Top 10 similar to a given item |

### Watch history
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/watch-history?userId=1` | — | History for a user, with content relation |
| POST | `/api/watch-history` | — | Add entry |
| PATCH | `/api/watch-history/:id/progress` | — | Update progress (0–100) |
| DELETE | `/api/watch-history/:id` | — | Remove entry |

---

## RecommendationsService — bug fixes

The service was provided with bugs as part of the assessment.

### Bug 1 — Wrong repository

Original code queried `StreamingContent` with `{ where: { userId } }`. `StreamingContent` has no `userId` column — it's a catalogue table. Injected `WatchHistoryRepository` instead and queried `watch_history WHERE user_id = ?` with `relations: ['content']` to get the genres.

### Bug 2 — N+1 query

One `findOne` call per watched item inside a loop. With 50 watched items = 50 DB round-trips. Fixed by collecting all unique genres first, then firing a single QueryBuilder call.

### Bug 3 — Scalar equality on TEXT[] column

`findOne({ where: { genre: 'Drama' } })` generates `WHERE genre = $1`. For a `TEXT[]` column this never matches because `'Drama' ≠ '{Drama,Action}'`. Fixed with the Postgres `&&` (array overlap) operator: `content.genre && ARRAY[:...genres]`.

### Bug 4 — No null check in `getSimilar`

`contentRepo.findOne` returns `null` when the id doesn't exist. Accessing `.genre` on null throws. Fixed with a `NotFoundException` guard before property access.

---

## Auth

JWT via `@nestjs/jwt` + `passport-jwt`. Secrets from env vars (`JWT_SECRET`, `JWT_EXPIRES_IN`). Read routes are public; `POST/PUT/DELETE /streaming` require `Authorization: Bearer <token>`.

Passwords hashed with bcrypt (cost factor 12).
