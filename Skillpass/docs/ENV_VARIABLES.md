# Environment Variables — Dev Server Deployment

> Complete reference for configuring SkillPass on a development server.

## Quick Start

```bash
# 1. Copy the example files
cp server-go/.env.example server-go/.env
cp web/.env.example web/.env

# 2. Edit server-go/.env with your values (see table below)

# 3. Start everything
docker compose up db -d
bun run db:migrate
bun run db:seed
bun run dev
```

---

## Server Variables (`server-go/.env`)

### Required

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/skillpass` | PostgreSQL connection string. Format: `postgres://user:pass@host:port/dbname?sslmode=disable` |
| `JWT_SECRET` | `your-secret-key-here` | Secret key for signing JWT tokens. **Must be random and long** — use `openssl rand -hex 32` to generate |

### Server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `1234` | Port the Go API server listens on |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed CORS origin. In dev, set to Vite's URL. In prod, set to your domain |
| `SERVE_STATIC` | `true` | `true` = serve embedded SPA from Go binary. `false` = API-only (use when nginx serves the frontend) |

### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `COOKIE_SECURE` | `false` | Set to `true` in production (HTTPS required). Controls `Secure` flag on auth cookies |
| `GIN_MODE` | `debug` | `debug` = verbose logging. `release` = production mode (no debug output) |

### LLM (AI Features)

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `openai` | LLM provider: `openai` or `anthropic` |
| `LLM_API_KEY` | — | API key for the LLM provider |
| `LLM_MODEL` | `gpt-4o-mini` | Model to use for AI evaluation, resume parsing, career path |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | Base URL for the LLM API. Override for local/proxy setups |

### Email

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_URL` | `http://localhost:4200` | Public URL used in email links (verification, password reset) and Open Graph tags |
| `SMTP_HOST` | — | SMTP server host. **Leave empty in dev** — emails print to console instead |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USER` | — | SMTP authentication username |
| `SMTP_PASS` | — | SMTP authentication password |
| `EMAIL_FROM` | `no-reply@skillpass.local` | Sender email address |

### File Uploads

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded files (avatars). In Docker, set to `/app/uploads` |

### Seed Data

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_EMAIL` | — | Email for the default admin account (created by `bun run db:seed`) |
| `ADMIN_PASSWORD` | — | Password for the default admin account |

---

## Web Variables (`web/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_PATH` | `/api/v1` | API base path prepended to all frontend API calls |
| `DEV_PORT` | `4200` | Port for the Vite dev server |
| `API_PROXY_TARGET` | `http://localhost:1234` | Proxy target for `/api` requests in dev mode |

---

## Example: Dev Server Setup

```bash
# server-go/.env
PORT=1234
DATABASE_URL=postgres://postgres:postgres@localhost:5432/skillpass
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=http://localhost:4200
SERVE_STATIC=true

# Security
COOKIE_SECURE=false
GIN_MODE=debug

# LLM (optional — leave empty to disable AI features)
LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1

# Email (console mode — no SMTP needed)
APP_URL=http://localhost:4200
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=no-reply@skillpass.local

# File uploads
UPLOAD_DIR=./uploads

# Seed data
ADMIN_EMAIL=admin@skillpass.local
ADMIN_PASSWORD=changeme123
```

```bash
# web/.env
VITE_API_BASE_PATH=/api/v1
DEV_PORT=4200
API_PROXY_TARGET=http://localhost:1234
```

---

## Example: Docker Compose (Production-like)

The `docker-compose.yml` passes env vars directly. To customize, override in a `docker-compose.override.yml`:

```yaml
services:
  server:
    environment:
      JWT_SECRET: your-production-secret-here
      CORS_ORIGIN: https://your-domain.com
      COOKIE_SECURE: "true"
      GIN_MODE: release
      LLM_API_KEY: sk-...
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
      SMTP_USER: you@gmail.com
      SMTP_PASS: app-password-here
      EMAIL_FROM: noreply@your-domain.com
      APP_URL: https://your-domain.com
```

---

## Environment Variables by Mode

| Variable | Local Dev | Docker Dev | Production |
|----------|-----------|------------|------------|
| `PORT` | `1234` | `1234` | `1234` |
| `DATABASE_URL` | `postgres://...@localhost:5432/...` | `postgres://...@db:5432/...` | Your prod DB URL |
| `JWT_SECRET` | Random | Random | **Strong random** |
| `CORS_ORIGIN` | `http://localhost:4200` | `http://localhost:4200` | `https://your-domain.com` |
| `SERVE_STATIC` | `true` | `true` | `true` (single binary) or `false` (nginx) |
| `GIN_MODE` | `debug` | `debug` | `release` |
| `COOKIE_SECURE` | `false` | `false` | `true` |
| `SMTP_HOST` | (empty — console) | (empty — console) | Your SMTP server |
| `APP_URL` | `http://localhost:4200` | `http://localhost:4200` | `https://your-domain.com` |
| `LLM_API_KEY` | (empty — disabled) | (empty — disabled) | Your API key |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `JWT_SECRET environment variable is required` | Missing `JWT_SECRET` | Add `JWT_SECRET=...` to `.env` |
| `DATABASE_URL environment variable is required` | Missing `DATABASE_URL` | Add `DATABASE_URL=...` to `.env` |
| CORS errors in browser | `CORS_ORIGIN` doesn't match frontend URL | Set `CORS_ORIGIN=http://localhost:4200` (or your frontend URL) |
| Emails not sending | `SMTP_HOST` is empty | Leave empty for console mode, or configure SMTP |
| AI features return errors | `LLM_API_KEY` is empty | Set your OpenAI/Anthropic API key |
| Cookie not secure in prod | `COOKIE_SECURE=false` | Set `COOKIE_SECURE=true` (requires HTTPS) |
| Static files not served | `SERVE_STATIC=false` | Set `SERVE_STATIC=true` or use nginx |
