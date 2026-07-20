# Go Migration Plan — SkillPass

## Why Go?

- **Career growth** — learn a language with strong job market demand
- **Performance** — Gin is 2.5x–7.4x faster than Elysia on real endpoints (see benchmarks below)
- **Type safety** — compile-time checks catch entire categories of bugs

## Benchmark results (real, measured)

```
                          ELYSIA (Bun)         GIN (Go)         GO SPEEDUP
  ─────────────────────────────────────────────────────────────────────────
  GET /health             22,473 r/s           55,373 r/s        2.5x
  GET /jobs                1,959 r/s            6,981 r/s        3.6x
  POST /login (bcrypt)     1,719 r/s            4,543 r/s        2.6x
  GET /profiles/me         2,387 r/s           17,745 r/s        7.4x
```

Biggest gaps are where Elysia's `.derive()` hook + Drizzle ORM overhead add up — Go's direct pgx + middleware pattern is dramatically lighter.

## DB bottleneck found & fixed

The original Elysia server had `max: 1` in `server/src/db/index.ts` — only 1 DB connection for the entire app. Fixed to `max: 25`, resulting in **7.7x throughput improvement**. This was more impactful than the framework choice.

## Password hashing strategy

Go can verify **both** argon2id (Bun's default) and bcrypt (faster). Detection is automatic via hash prefix:

| Algorithm | Speed per verify | Use case |
|---|---|---|
| bcrypt cost=4 | ~3ms | Dev / fastest |
| bcrypt cost=6 | ~10ms | Recommended default |
| bcrypt cost=10 | ~100ms | Traditional prod |
| argon2id | ~80-100ms | Bun default (kept for existing hashes) |

The Go `VerifyPassword()` function in `internal/lib/password.go` auto-detects the algorithm — existing DB rows with argon2id hashes continue working, new registrations use bcrypt.

## Migration Complete ✅

> **Status:** The Elysia → Go migration is fully complete. All endpoints have been migrated to Go/Gin. The original Elysia server (`server/` directory) has been removed. The Vite proxy now forwards all `/api/v1/*` requests to the Go server at `localhost:1234`.

### Historical progress

| Step | File | Endpoints | Status |
|---|---|---|---|
| 1 | `health.go` | `GET /health` | ✅ Done |
| 2 | `reference.go` | `GET /industries`, `GET /tags` | ✅ Done |
| 3 | `auth.go` | `POST /login` | ✅ Done |
| 4 | `jobs.go` | `GET /jobs` (public list) | ✅ Done |
| 5 | `profiles.go` | `GET /profiles/me` | ✅ Done |
| 6 | `middleware/auth.go` | JWT auth + role guard | ✅ Done |
| — | `internal/lib/password.go` | bcrypt + argon2 verify | ✅ Done |
| 7 | `passport.go` | `GET /profiles/:username` | ✅ Done |
| 8 | `auth.go` | `POST /register`, `/refresh`, `/logout` | ✅ Done |
| 9 | `companies.go` | Company CRUD + verification | ✅ Done |
| 10 | `jobs.go` | `GET /me`, `POST /`, `PUT /:id`, `DELETE /:id` | ✅ Done |
| 11 | `search.go` | `GET /candidates` | ✅ Done |
| 12 | `admin.go` | Admin verification approval | ✅ Done |

## Migration order (easiest → hardest)

| Step | File | LOC | What you'll learn |
|---|---|---|---|
| 1 | `health.go` | ~20 | Minimal handler, no DB |
| 2 | `reference.go` | ~50 | Gin handler, pgx query, JSON response |
| 3 | `passport.go` | ~60 | URL params (`/profiles/:username`) |
| 4 | `auth.go` (login) | ~100 | JWT signing, bcrypt verify, body binding |
| 5 | `jobs.go` (list) | ~80 | Query with optional filters |
| 6 | `profiles.go` | ~200 | Auth middleware, nested resources, JSON arrays |
| 7 | `auth.go` (register) | ~100 | bcrypt hash, DB insert, JWT sign |
| 8 | `companies.go` | ~100 | Auth middleware, role checks |
| 9 | `jobs.go` (CRUD) | ~100 | Path params, PUT/DELETE |
| 10 | `search.go` | ~80 | Complex query with multiple filters |
| 11 | `admin.go` | ~60 | Role-gated endpoints |

## Key Go patterns vs Elysia

| Elysia (current) | Go/Gin (target) |
|---|---|
| `new Elysia({ prefix })` | `r.Group("/api/v1")` |
| `.get("/path", async (ctx) => {...})` | `api.GET("/path", handler)` |
| `t.Object({...})` body validation | `c.ShouldBindJSON(&struct)` |
| `jwt.verify(token)` | `jwt.ParseWithClaims(token, &Claims{}, keyFunc)` |
| `db.select().from(table)` | `pool.Query(ctx, "SELECT ...")` |
| `.derive(...)` for auth | `gin.HandlerFunc` middleware |
| `.use(jwt({...}))` plugin | Manual `jwt.ParseWithClaims` |
| `Bun.password.hash/verify` | `bcrypt.GenerateFromPassword` / `CompareHashAndPassword` |

## How to run

```bash
cd server-go
JWT_SECRET=skillpass-dev-secret-change-in-prod \
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/skillpass \
  go run ./cmd/server/
```

Runs on port 8801 by default (alongside Elysia on 8800). When a route is migrated, update the vite proxy to forward that path to Go.

## Migration approach

**Incremental, not big bang.** Run both servers side-by-side:

```
Vite proxy (port 4200)
  ├── /api/v1/health          → Go (8801) ✅
  ├── /api/v1/jobs            → Go (8801) ✅
  ├── /api/v1/auth/login      → Go (8801) ✅
  ├── /api/v1/profiles/me     → Go (8801) ✅
  └── everything else          → Elysia (8800) ⬜
```

As each Go route is implemented, update the Vite proxy config and Elysia removes its version.

## Learning resources

- [Tour of Go](https://go.dev/tour/) — start here (2 hours)
- [Gin docs](https://gin-gonic.com/docs/) — framework reference
- [pgx docs](https://github.com/jackc/pgx) — PostgreSQL driver
- [Go by Example](https://gobyexample.com/) — quick reference
