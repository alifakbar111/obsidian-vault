# Elysia → Go/Gin Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Move all functionality from the Elysia (Bun/TypeScript) server to the Go/Gin server so the `server/` directory can be deleted.

**Architecture:** The Go server (`server-go/`) already implements all API endpoints with identical behavior. This plan migrates the remaining dependencies — Drizzle schema management, seed script, Docker setup, and root-level config — from `server/` to standalone locations, then removes `server/`.

**Tech Stack:** Go 1.23+, Gin, pgx, godotenv, bcrypt + argon2id, Drizzle ORM (for schema management only), PostgreSQL 16

---

### Task 1: Extract Drizzle schema to root `db/` directory

**Files:**
- Create: `db/schema.ts`
- Create: `db/drizzle.config.ts`
- Create: `db/package.json`
- Create: `db/tsconfig.json`
- Move: `server/src/db/schema.ts` → `db/schema.ts` (content identical)
- Delete: `server/src/db/schema.ts`
- Delete: `server/drizzle.config.ts`

- [ ] **Step 1: Create `db/` directory and `db/package.json`**

```bash
mkdir -p /home/al-ip/learning/skillpass/db
```

```json
{
  "name": "skillpass-db",
  "private": true,
  "type": "module",
  "scripts": {
    "push": "drizzle-kit push",
    "generate": "drizzle-kit generate",
    "studio": "drizzle-kit studio"
  },
  "dependencies": {
    "drizzle-orm": "^0.40.0",
    "drizzle-kit": "^0.30.0",
    "postgres": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0"
  }
}
```

- [ ] **Step 2: Create `db/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 3: Create `db/drizzle.config.ts`**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/skillpass',
  },
});
```

- [ ] **Step 4: Copy `schema.ts` from server to db/**

Copy `/home/al-ip/learning/skillpass/server/src/db/schema.ts` to `/home/al-ip/learning/skillpass/db/schema.ts` — content identical. No changes needed.

- [ ] **Step 5: Delete old schema files from server/**

```bash
rm /home/al-ip/learning/skillpass/server/src/db/schema.ts
rm /home/al-ip/learning/skillpass/server/drizzle.config.ts
```

- [ ] **Step 6: Install deps and verify drizzle-kit push works from new location**

Run: `bun install --cwd db && bun --cwd db run push`

Expected: "No schema changes" (schema already applied to DB). If there are pending changes, the push applies them.

- [ ] **Step 7: Commit**

```bash
git add db/ server/src/db/schema.ts server/drizzle.config.ts
git rm server/src/db/schema.ts server/drizzle.config.ts
git commit -m "refactor: extract Drizzle schema to root db/ directory"
```

---

### Task 2: Create Go seed command

**Files:**
- Create: `server-go/cmd/seed/main.go`

- [ ] **Step 1: Create `server-go/cmd/seed/main.go`**

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load("../.env")

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/skillpass"
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Failed to ping DB: %v", err)
	}

	fmt.Println("Seeding database...")

	industries := []struct {
		Name        string
		Description string
	}{
		{"Technology", "Software, hardware, IT services"},
		{"Manufacturing", "Industrial production and fabrication"},
		{"Healthcare", "Medical services and pharmaceuticals"},
		{"Finance", "Banking, investment, insurance"},
		{"Education", "Schools, universities, training"},
		{"Retail", "Sales, e-commerce, consumer goods"},
		{"Transportation", "Logistics, delivery, ride-hailing"},
		{"Creative Arts", "Design, media, entertainment"},
		{"Hospitality", "Hotels, restaurants, tourism"},
		{"Construction", "Building and infrastructure"},
		{"Agriculture", "Farming, food production"},
		{"Energy", "Oil, gas, renewable energy"},
	}

	count := 0
	for _, ind := range industries {
		_, err := pool.Exec(ctx,
			"INSERT INTO industry_categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
			ind.Name, ind.Description)
		if err != nil {
			log.Printf("  Warning: failed to insert industry %s: %v", ind.Name, err)
			continue
		}
		count++
	}
	fmt.Printf("Seeded %d industry categories\n", count)

	var existingID string
	err = pool.QueryRow(ctx,
		"SELECT id FROM users WHERE email = $1", "admin-skillpass@yopmail.com").Scan(&existingID)
	if err == nil {
		fmt.Println("Admin user already exists, skipping")
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("admin123!!"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	_, err = pool.Exec(ctx,
		"INSERT INTO users (email, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)",
		"admin-skillpass@yopmail.com", "admin", string(passwordHash), "Admin", "admin")
	if err != nil {
		log.Fatalf("Failed to create admin: %v", err)
	}
	fmt.Println("Seeded admin user (admin-skillpass@yopmail.com / admin123!!)")
}
```

- [ ] **Step 2: Run it to verify**

Run: `go -C server-go run ./cmd/seed/`

Expected output:
```
Seeding database...
Seeded 12 industry categories
Admin user already exists, skipping
```

Or on fresh DB:
```
Seeded 12 industry categories
Seeded admin user (admin-skillpass@yopmail.com / admin123!!)
```

- [ ] **Step 3: Commit**

```bash
git add server-go/cmd/seed/main.go
git commit -m "feat: add Go seed command for industries and admin user"
```

---

### Task 3: Create Go server Dockerfile

**Files:**
- Create: `server-go/Dockerfile`
- Create: `server-go/.dockerignore`

- [ ] **Step 1: Create `server-go/Dockerfile`**

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /skillpass-server ./cmd/server/

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /skillpass-server .

EXPOSE 1234
CMD ["./skillpass-server"]
```

- [ ] **Step 2: Create `server-go/.dockerignore`**

```
.env
.env.example
cmd/seed/
*.md
```

- [ ] **Step 3: Verify it builds**

Run: `docker build -f server-go/Dockerfile -t skillpass-server-go:test server-go/`

Expected: Build succeeds, image created.

- [ ] **Step 4: Commit**

```bash
git add server-go/Dockerfile server-go/.dockerignore
git commit -m "feat: add Go server Dockerfile"
```

---

### Task 4: Update docker-compose.yml for Go server

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Update the `server` service in `docker-compose.yml`**

Old content (lines 17–31):
```yaml
  server:
    build:
      context: ./server
    ports:
      - "8800:8800"
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/skillpass
      JWT_SECRET: skillpass-dev-secret
      CORS_ORIGIN: http://localhost:4200
      PORT: 8800
    command: >
      sh -c "bun run db:push && bun run seed && bun run src/index.ts"
```

Replace with:
```yaml
  server:
    build:
      context: ./server-go
    ports:
      - "1234:1234"
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/skillpass
      JWT_SECRET: skillpass-dev-secret
      CORS_ORIGIN: http://localhost:4200
      PORT: 1234
```

Note: The Go server doesn't auto-run DB migrations or seed. For Docker full-stack startup, the DB should already be initialized (via volume). If needed, add an init container or entrypoint script separately — out of scope for this migration.

- [ ] **Step 2: Commit**

```bash
git add docker-compose.yml
git commit -m "fix: update docker-compose to use Go server"
```

---

### Task 5: Update root package.json scripts

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Update scripts in root `package.json`**

Old scripts block:
```json
  "scripts": {
    "dev": "concurrently -n server,web -c cyan,green \"go -C server-go run ./cmd/server/\" \"bun --cwd web dev\"",
    "dev:server": "go -C server-go run ./cmd/server/",
    "dev:web": "bun --cwd web dev",
    "dev:elysia": "bun --cwd server dev",
    "build": "bun --cwd web build",
    "db:push": "bun --cwd server db:push",
    "db:seed": "bun --cwd server seed",
    "docker:up": "docker compose up --build",
    "docker:down": "docker compose down",
    "lint": "biome check .",
    "lint:fix": "biome check --write --unsafe .",
    "format": "biome format --write .",
    "format:check": "biome format ."
  },
```

Replace with:
```json
  "scripts": {
    "dev": "concurrently -n server,web -c cyan,green \"go -C server-go run ./cmd/server/\" \"bun --cwd web dev\"",
    "dev:server": "go -C server-go run ./cmd/server/",
    "dev:web": "bun --cwd web dev",
    "build": "bun --cwd web build",
    "db:push": "bun --cwd db push",
    "db:seed": "go -C server-go run ./cmd/seed/",
    "db:studio": "bun --cwd db studio",
    "docker:up": "docker compose up --build",
    "docker:down": "docker compose down",
    "lint": "biome check .",
    "lint:fix": "biome check --write --unsafe .",
    "format": "biome format --write .",
    "format:check": "biome format ."
  },
```

Changes:
- `db:push` now points to `bun --cwd db push` (new `db/` directory)
- `db:seed` now runs the Go seed command
- Added `db:studio` for Drizzle Studio access
- Removed `dev:elysia` (no longer needed)

- [ ] **Step 2: Verify both commands work**

Run: `bun run db:push`
Expected: "No schema changes" or applies any pending changes.

Run: `bun run db:seed`
Expected: Seed runs successfully (industries + admin)

Run: `bun run dev`
Expected: Both Go server and web start without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "fix: update root scripts to use new db/ and Go seed"
```

---

### Task 6: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rewrite README.md to reflect Go stack**

Replace the entire README (old content in `/home/al-ip/learning/skillpass/README.md`) with:

```markdown
# SkillPass

Talent marketplace where jobseekers build structured career profiles, get AI-powered skill evaluations, and share their "skill passport" publicly. Verified companies discover candidates and post jobs.

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Go + Gin |
| Frontend | React 19 + React Router v7 |
| Styling | Tailwind CSS v4 + DaisyUI 5 |
| Database | PostgreSQL |
| Schema Mgmt | Drizzle (standalone, code-first) |
| Auth | JWT (golang-jwt/v5) |
| Password | bcrypt + argon2id (backward compatible) |

## Prerequisites

- [Go](https://go.dev) >= 1.23
- [Bun](https://bun.sh) >= 1.2 (for web tooling and DB schema)
- [Docker](https://docker.com) (for PostgreSQL)

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up db -d

# 2. Push schema and seed
bun run db:push
bun run db:seed

# 3. Start development servers (both server + web)
bun run dev
```

- **Web:** http://localhost:4200
- **API:** http://localhost:1234

## Full Docker Setup

```bash
# Build and start all services
bun run docker:up

# Stop
bun run docker:down
```

## Available Commands

| Command | Description |
|---|---|
| `bun run dev` | Start server + web concurrently |
| `bun run dev:server` | Start server only |
| `bun run dev:web` | Start web only |
| `bun run build` | Build web for production |
| `bun run db:push` | Push Drizzle schema to DB |
| `bun run db:seed` | Seed industries and admin user |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run docker:up` | docker compose up --build |
| `bun run docker:down` | docker compose down |

## Project Structure

```
skillpass/
├── db/                    — Drizzle schema + config (source of truth)
│   └── schema.ts
├── server-go/             — Go (Gin) API
│   ├── cmd/server/        — Entrypoint
│   ├── cmd/seed/          — Seed script
│   └── internal/
│       ├── handlers/      — Route handlers by domain
│       ├── middleware/     — Auth + role guards
│       ├── lib/           — Utilities (password hashing)
│       ├── db/            — PostgreSQL pool setup
│       └── config/        — Env config
├── web/                   — React SPA frontend
│   ├── src/
│   │   ├── App.tsx        — Route definitions
│   │   ├── pages/         — Page components
│   │   ├── components/    — Reusable UI
│   │   ├── hooks/         — Auth context
│   │   └── lib/           — API client with JWT handling
│   └── Dockerfile
├── docker-compose.yml
└── docs/superpowers/
    ├── specs/
    └── plans/
```

## Phases

| Phase | Features |
|---|---|
| **1** (current) | Auth, profiles, company verification, candidate search, job postings, Skill Passport |
| **2** | AI evaluation & scoring, job applications, matching, Application Kanban |
| **3** | Company feedback, AI skill suggestions, Skill Gap Radar, Career Path, Company Rep Score |
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README for Go/Gin server stack"
```

---

### Task 7: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Clean up AGENTS.md — remove Elysia references, update commands**

Old content to find and replace:

Current file:
```
## Stack
- **Runtime**: Go 1.26 (server), Bun (web tooling)
- **Server**: Gin (Go) — migrated from Elysia (Bun). Old server at `server/`, new at `server-go/`
- **Server (legacy)**: Elysia 1.x at `server/` — run with `bun run dev:elysia`
- **Frontend**: React 19 SPA (not Next.js), React Router v7, Vite 7
- ...
- **Server conventions (Elysia — legacy)**
- See old AGENTS.md or `server/` source. Only kept for reference; do not add new routes here.
```

Replace with:
```
## Stack
- **Runtime**: Go 1.26 (server), Bun (web tooling)
- **Server**: Gin (Go) at `server-go/`
- **Frontend**: React 19 SPA (not Next.js), React Router v7, Vite 7
- ...
```

Also update the Essential commands table — remove `dev:elysia`. Also remove or update the DB section:
```
- DB: pgx pool (`internal/db/db.go`), raw SQL queries (no ORM)
- Schema source of truth: `db/schema.ts` (Drizzle, root `db/` directory)
```

And in the `dev` script description update the table:
```
| Dev server only | `bun run dev:server` |
```
Keep `dev:elysia` removed.

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md — remove Elysia references"
```

---

### Task 8: Delete server/ folder and verify

**Files:**
- Delete: entire `server/` directory

- [ ] **Step 1: Verify everything works before deletion**

Run full dev mode and exercise key flows:

```bash
# Start fresh
docker compose down
docker compose up db -d
bun run db:push
bun run db:seed

# Start dev
bun run dev &
sleep 3

# Health check
curl -s http://localhost:1234/api/v1/health | jq .
# Expected: {"status":"ok","timestamp":"..."}

# Register a jobseeker
curl -s -X POST http://localhost:1234/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"test123","name":"Test User","role":"jobseeker"}' | jq .
# Expected: { "accessToken": "...", "refreshToken": "...", "user": { ... } }

# List industries
curl -s http://localhost:1234/api/v1/industries | jq '. | length'
# Expected: 12

# Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:1234/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin-skillpass@yopmail.com","password":"admin123!!"}' | jq -r '.accessToken')
echo "Admin token: ${ADMIN_TOKEN:0:20}..."
# Expected: token obtained without error

# List jobs (public)
curl -s http://localhost:1234/api/v1/jobs | jq .
# Expected: [] (empty array)

kill %1 2>/dev/null
```

- [ ] **Step 2: Delete the server/ directory**

```bash
rm -rf /home/al-ip/learning/skillpass/server
```

- [ ] **Step 3: Verify dev still works without server/**

```bash
# Start clean
docker compose up db -d
bun run db:push
bun run db:seed
bun run dev
```

Expected: All services start without errors. The `server/` folder no longer exists.

- [ ] **Step 4: Commit**

```bash
git rm -r server/
git commit -m "chore: remove legacy Elysia server (fully migrated to Go/Gin)"
```

- [ ] **Step 5: Final verification — run lint**

Run: `bun run lint`
Expected: Biome passes with no errors.

---

## Spec Coverage Self-Review

- **All Elysia endpoints → Go parity**: Already complete in `server-go/`. Tasks 1–8 cover the infrastructure needed to remove `server/`.
- **Drizzle schema**: Task 1 moves to `db/` — preserved as source of truth.
- **Seed data (industries + admin)**: Task 2 creates Go equivalent.
- **Docker**: Tasks 3–4 add Go Dockerfile + update compose.
- **Root scripts**: Task 5 updates package.json.
- **Documentation**: Tasks 6–7 update README + AGENTS.md.
- **Cleanup**: Task 8 deletes `server/` with verification gates.

**What's intentionally dropped:**
- Swagger docs (`/docs` via `@elysiajs/swagger`) — not reimplemented in Go. The Go server has no OpenAPI spec. If needed later, add swaggo/swag or a static spec file.
- `dev:elysia` script — no longer needed.
- Elysia Dockerfile — replaced by Go Dockerfile.

**No placeholders**: All code is complete and runnable.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-04-migrate-elysia-to-gin.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
