# Dual-Mode Static Serving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed the React SPA build output into the Go binary for production, while keeping Vite hot-reload working in development — controlled via Go build tags.

**Architecture:** Two build-tagged files (`static_prod.go` with `//go:build !dev`, `static_dev.go` with `//go:build dev`) export the same `setupStatic(r *gin.Engine)` function. In production, the function serves embedded files from `web/dist/*` via `embed.FS` with a SPA catch-all. In dev, it's a no-op — Vite on `:4200` handles the frontend. A new `SERVE_STATIC` env var (default `true`) gives runtime control as an additional knob.

**Tech Stack:** Go `embed` package, Gin router, Vite build output, build tags (`dev` / default)

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `server-go/cmd/server/static_prod.go` | Create | Embed `web/dist/*`, serve SPA in production |
| `server-go/cmd/server/static_dev.go` | Create | No-op for dev builds (`go build -tags dev`) |
| `server-go/cmd/server/main.go:239-245` | Modify | Call `setupStatic(r)` before logging, update log messages |
| `server-go/internal/config/config.go:8-12` | Modify | Add `ServeStatic` field to Config |
| `package.json:10` | Modify | Add `build:server` script for production binary |
| `package.json:12` | Modify | Add `start` script for running production binary |

---

## Task 1: Add `ServeStatic` to Config

**Files:**
- Modify: `server-go/internal/config/config.go:8-12`

- [ ] **Step 1: Add `ServeStatic` field to Config struct**

```go
// server-go/internal/config/config.go
type Config struct {
	Port        string
	JWTSecret   string
	DatabaseURL string
	CORSOrigin  string
	ServeStatic bool
}
```

- [ ] **Step 2: Add `ServeStatic` to Load() function**

In the `Load()` function, add after the `CORSOrigin` line:

```go
func Load() Config {
	return Config{
		Port:        getEnv("PORT", "1234"),
		JWTSecret:   getEnv("JWT_SECRET", ""),
		DatabaseURL: getEnv("DATABASE_URL", ""),
		CORSOrigin:  getEnv("CORS_ORIGIN", "http://localhost:4200"),
		ServeStatic: getEnv("SERVE_STATIC", "true") == "true",
	}
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd server-go && go build ./cmd/server/`
Expected: compiles without errors (embed files don't exist yet, but static_dev.go will be created next)

---

## Task 2: Create Dev-Mode Static File (No-Op)

**Files:**
- Create: `server-go/cmd/server/static_dev.go`

- [ ] **Step 1: Create `static_dev.go` with build tag**

```go
//go:build dev

package main

import "github.com/gin-gonic/gin"

// setupStatic is a no-op in dev mode.
// The Vite dev server on :4200 handles the frontend with hot reload.
func setupStatic(r *gin.Engine) {}
```

- [ ] **Step 2: Verify dev build compiles**

Run: `cd server-go && go build -tags dev ./cmd/server/`
Expected: compiles without errors

---

## Task 3: Create Prod-Mode Static File (Embed + Serve)

**Files:**
- Create: `server-go/cmd/server/static_prod.go`

- [ ] **Step 1: Create `static_prod.go` with embed directive**

```go
//go:build !dev

package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed all:../../../web/dist
var webDist embed.FS

// setupStatic mounts the embedded React SPA build into the Gin router.
// It serves index.html for all non-API, non-file routes (SPA catch-all).
func setupStatic(r *gin.Engine) {
	// Navigate into the dist subdirectory
	distFS, err := fs.Sub(webDist, "../../../web/dist")
	if err != nil {
		log.Printf("Warning: could not access embedded web/dist: %v", err)
		return
	}

	// Serve hashed assets (JS, CSS, images) with long cache
	r.GET("/assets/*filepath", func(c *gin.Context) {
		filepath := c.Param("filepath")
		c.FileFromFS("/assets/"+filepath, http.FS(distFS))
	})

	// Serve other static files from dist root (favicon, robots.txt, etc.)
	r.GET("/favicon.ico", func(c *gin.Context) {
		c.FileFromFS("/favicon.ico", http.FS(distFS))
	})
	r.GET("/robots.txt", func(c *gin.Context) {
		c.FileFromFS("/robots.txt", http.FS(distFS))
	})

	// SPA catch-all: serve index.html for all non-API, non-file routes
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Don't serve index.html for API routes, uploads, or Swagger
		if strings.HasPrefix(path, "/api/") ||
			strings.HasPrefix(path, "/uploads/") ||
			strings.HasPrefix(path, "/docs/") ||
			strings.HasPrefix(path, "/p/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}

		c.FileFromFS("/index.html", http.FS(distFS))
	})

	log.Println("Serving embedded static files (production mode)")
}
```

- [ ] **Step 2: Verify prod build compiles**

Run: `cd server-go && go build ./cmd/server/`
Expected: compiles without errors (but will fail if `web/dist/` doesn't exist — see Task 4)

---

## Task 4: Build Web Assets (Create `web/dist/`)

**Files:**
- None (runs a build command)

- [ ] **Step 1: Build the web frontend**

Run: `bun run build` (from root)
Expected: Creates `web/dist/` with `index.html` and `assets/` directory

- [ ] **Step 2: Verify prod build now compiles**

Run: `cd server-go && go build ./cmd/server/`
Expected: compiles successfully, binary is ~30-50MB larger than before

---

## Task 5: Update `main.go` to Call `setupStatic`

**Files:**
- Modify: `server-go/cmd/server/main.go:239-245`

- [ ] **Step 1: Add `setupStatic(r)` call before the log messages**

Replace lines 239-245:

```go
	// Serve static files (production: embedded SPA, dev: no-op)
	setupStatic(r)

	log.Printf("SkillPass API running at http://localhost:%s", cfg.Port)
	if cfg.ServeStatic {
		log.Printf("Frontend served from embedded files at http://localhost:%s", cfg.Port)
	} else {
		log.Printf("Frontend: use Vite dev server (bun run dev:web)")
	}
	log.Printf("Swagger UI at http://localhost:%s/docs/index.html", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
```

- [ ] **Step 2: Verify compilation**

Run: `cd server-go && go build ./cmd/server/`
Expected: compiles successfully

---

## Task 6: Add Build Scripts to `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add `build:server` and `start` scripts**

In the `"scripts"` section, add:

```json
"build:server": "bun run build && cd server-go && go build -o ../skillpass ./cmd/server",
"start": "./skillpass",
"start:dev": "bun run dev:server"
```

The full scripts section should now include:
```json
{
  "scripts": {
    "dev": "concurrently \"bun run dev:server\" \"bun run dev:web\"",
    "dev:server": "cd server-go && go run ./cmd/server",
    "dev:web": "bun --cwd web dev",
    "build": "bun --cwd web build",
    "build:server": "bun run build && cd server-go && go build -o ../skillpass ./cmd/server",
    "start": "./skillpass",
    "start:dev": "bun run dev:server",
    ...
  }
}
```

- [ ] **Step 2: Verify scripts exist**

Run: `cat package.json | grep -E "build:server|start"` from root
Expected: shows the new scripts

---

## Task 7: Update Dockerfile for Single-Container Mode

**Files:**
- Modify: `server-go/Dockerfile`

- [ ] **Step 1: Add web build stage and embed into Go binary**

Replace the existing `server-go/Dockerfile` with:

```dockerfile
# Stage 1: Build web assets
FROM oven/bun:1 AS web-builder
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN bun install --frozen-lockfile
COPY web/ .
RUN bun run build

# Stage 2: Build Go server (embeds web/dist)
FROM golang:1.26-alpine AS server-builder
WORKDIR /app
COPY server-go/ .
COPY --from=web-builder /app/web/dist ./web/dist
RUN CGO_ENABLED=0 go build -o /skillpass ./cmd/server

# Stage 3: Runtime
FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=server-builder /skillpass .
COPY --from=server-builder /app/migrations ./migrations
EXPOSE 1234
CMD ["./skillpass"]
```

- [ ] **Step 2: Verify Docker build works**

Run: `docker build -f server-go/Dockerfile -t skillpass-server .` (from root)
Expected: builds successfully, produces a single container with everything embedded

---

## Task 8: Test Both Modes

**Files:**
- None (verification only)

- [ ] **Step 1: Test dev mode (current workflow)**

Run: `bun run dev`
Expected:
- Go server starts on `:1234` (no embedded files)
- Vite dev server starts on `:4200` with hot reload
- Frontend loads from Vite, API calls proxy to Go
- Logs show "Frontend: use Vite dev server"

- [ ] **Step 2: Test production mode (single binary)**

Run: `bun run build:server && ./skillpass`
Expected:
- Single binary starts on `:1234`
- Frontend loads from embedded files at `http://localhost:1234`
- API calls work at `http://localhost:1234/api/v1/...`
- SPA routing works (refresh on `/login` serves `index.html`)
- Logs show "Serving embedded static files (production mode)"

- [ ] **Step 3: Test SPA catch-all routing**

In production mode, navigate to:
- `http://localhost:1234/` → serves `index.html` ✅
- `http://localhost:1234/login` → serves `index.html` ✅
- `http://localhost:1234/company/jobs` → serves `index.html` ✅
- `http://localhost:1234/api/v1/health` → returns JSON ✅
- `http://localhost:1234/nonexistent` → serves `index.html` (SPA fallback) ✅

- [ ] **Step 4: Test Docker single-container mode**

Run: `docker compose up --build server`
Expected: single container serves both API and frontend on `:1234`

---

## Commit Strategy

1. `feat(server): add dual-mode static file serving with build tags` — Tasks 1-5
2. `chore: add build:server and start scripts` — Task 6
3. `chore(docker): single-container mode with embedded SPA` — Task 7
