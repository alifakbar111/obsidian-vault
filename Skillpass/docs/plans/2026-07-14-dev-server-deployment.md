# Dev Server Deployment Implementation Plan

> **For agentic workers:** REQUIRED Delegate Agents — This plan has two phases: (1) local preparation (env config, image build, push) and (2) remote VPS provisioning + deploy. Route Phase 1 to a `general` agent with Docker access, Phase 2 to a `general` agent with SSH access. Migrations/seed are one-shot sub-tasks within Phase 2.

**Goal:** Deploy SkillPass to a VPS dev server accessible via IP address on port 80, using Docker containers pushed to Docker Hub and pulled onto the VPS.

**Architecture:** Build Docker images for the Go/Gin API server (with embedded React SPA) and the MarkItDown Python service on a local machine, push to Docker Hub, then SSH into the VPS to pull and run via Docker Compose. Nginx on the VPS host reverse-proxies port 80 to the Go server on port 1234. PostgreSQL runs inside Docker on the same VPS. No domain — access via VPS IP directly.

**Tech Stack:** Docker, Docker Compose, Go/Gin (server, serves embedded SPA on `SERVE_STATIC=true`), React/Vite (frontend built into Go binary), Python/FastAPI (MarkItDown), Nginx (host-level reverse proxy), PostgreSQL 16 (local Docker container)

**Security hardening applied:**
- All containers run as non-root user (uid 1000)
- DB and admin passwords sourced from `.env` — nothing hardcoded in tracked files
- Nginx rate-limits auth (5 req/min) and API (30 req/min)
- Content-Security-Policy, X-Frame-Options, and other security headers in nginx
- fail2ban + key-only SSH on VPS
- `.env` auto-protected with `chmod 600`

---

## Prerequisites

Before starting, ensure the following are in place:

| Item | Check |
|------|-------|
| Docker Hub account with repos created | `skillpass-server`, `skillpass-markitdown` (public or private) |
| `docker login` completed locally | `docker login` |
| VPS with SSH access and public IP | `ssh root@<VPS_IP>` works |
| `openssl` installed locally | `openssl rand -base64 32` works |

---

## Task 1: One-Time VPS Provisioning

**Files:** `deploy/setup-vps.sh` (already exists), `deploy/nginx.conf` (already exists)

### Step 1.1 — Run the VPS setup script

SSH into the VPS and install Docker, Docker Compose, Nginx, and configure the firewall.

```bash
# From your local machine, pipe the setup script to the VPS
ssh root@<VPS_IP> 'bash -s' < deploy/setup-vps.sh
```

**Expected output (last lines):**
```
═══ VPS Setup Complete ═══

Next steps:
  1. Copy deploy/.env to ~/skillpass/.env and edit: ...
  2. Copy deploy/nginx.conf to /etc/nginx/sites-available/skillpass
  3. Enable the site and reload nginx
```

**Verification:** SSH into VPS and confirm:
```bash
ssh root@<VPS_IP>
docker --version && docker compose version && nginx -v
# Should print all three version strings without errors
```

### Step 1.2 — Verify firewall rules

```bash
ssh root@<VPS_IP> 'ufw status'
```

**Expected output:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

### Step 1.3 — Configure Nginx reverse proxy on VPS

The nginx config needs to be on the VPS before the first deploy so the site is available immediately.

```bash
# Copy nginx config to VPS
scp deploy/nginx.conf root@<VPS_IP>:/etc/nginx/sites-available/skillpass

# Enable the site
ssh root@<VPS_IP> 'ln -sf /etc/nginx/sites-available/skillpass /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx'
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Verification:** Hit the VPS IP in a browser or curl — should get a 502 (expected, server not running yet, but Nginx responds):
```bash
curl -v http://<VPS_IP> 2>&1 | head -20
# Should show Nginx headers, likely a 502 Bad Gateway since containers aren't running yet
```

---

## Task 2: Create Local .env File from Template

**Files:** `deploy/.env` (create from `.env.prod.example`)

### Step 2.1 — Copy the example env file

```bash
cp deploy/.env.prod.example deploy/.env
```

### Step 2.2 — Generate JWT secret

```bash
openssl rand -base64 32
# Copy the output — this is your JWT_SECRET
```

### Step 2.3 — Fill in all required values

Edit `deploy/.env` with these exact values:

```
# ── VPS connection (for deploy.sh) ──
VPS_HOST=root@<VPS_IP>
DOCKER_USER=<your-dockerhub-username>

# ── Database (REQUIRED: change passwords before deploying) ──
DB_PASSWORD=<change-this-to-a-strong-random-secret>
ADMIN_PASSWORD=<change-this-too>

# ── Server ──
PORT=1234
JWT_SECRET=<output-of-openssl-rand-command>
CORS_ORIGIN=http://<VPS_IP>
APP_URL=http://<VPS_IP>
SERVE_STATIC=true
GIN_MODE=release
COOKIE_SECURE=false

# ── LLM ──
LLM_PROVIDER=openai
LLM_API_KEY=sk-<your-key>
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1

# ── Email ──
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=no-reply@skillpass.local

# ── Admin seed account ──
ADMIN_EMAIL=admin@skillpass.com

# ── File uploads ──
UPLOAD_DIR=./uploads

# ── MarkItDown ──
MARKITDOWN_URL=http://markitdown:8000
OPENAI_API_KEY=sk-<your-key>
ANTHROPIC_API_KEY=
```

**Verification:**
```bash
# Check .env exists and is not empty
wc -l deploy/.env
# Should show ~35 lines

# Ensure no placeholders remain
grep -n '<YOUR_VPS_IP>\|<change-this>\|your-dockerhub' deploy/.env && echo "ERROR: unset placeholders remain" || echo "OK: no placeholders"
```

---

## Task 3: Build and Push Docker Images

**Files:** `deploy/build-and-push.sh` (already exists)

### Step 3.1 — Verify Docker login

```bash
docker login
# Should print "Login Succeeded"
```

### Step 3.2 — Run the build-and-push script

```bash
# First deploy: use "latest" tag
./deploy/build-and-push.sh
```

**Expected output (final lines):**
```
═══ Pushing images to Docker Hub ═══
The push refers to repository [docker.io/<user>/skillpass-server]
...
<tag>: digest: sha256:... size: ...
The push refers to repository [docker.io/<user>/skillpass-markitdown]
...
<tag>: digest: sha256:... size: ...
✓ All images built and pushed successfully!

To deploy on VPS:
   1. Copy deploy/.env.prod.example to deploy/.env on VPS and fill in values
   2. Run: ./deploy/deploy.sh latest
```

> **Note:** The build script builds 2 images only: `skillpass-server` and `skillpass-markitdown`. The server image embeds the frontend — no separate web container needed.
```

### Step 3.3 — Verify images exist on Docker Hub

```bash
# Check via Docker CLI
docker manifest inspect <DOCKER_USER>/skillpass-server:latest > /dev/null 2>&1 && echo "Server image OK" || echo "Server image MISSING"
docker manifest inspect <DOCKER_USER>/skillpass-markitdown:latest > /dev/null 2>&1 && echo "MarkItDown image OK" || echo "MarkItDown image MISSING"
```

Or check via browser: `https://hub.docker.com/r/<DOCKER_USER>/skillpass-server/tags`

---

## Task 4: Deploy to VPS

**Files:** `deploy/deploy.sh` (already exists)

### Step 4.1 — Run the deploy script

```bash
./deploy/deploy.sh
```

**What this does:**
1. SSHes into the VPS
2. Creates `~/skillpass/` directory
3. Copies `deploy/docker-compose.yml` and `deploy/.env` to the VPS
4. Secures `.env` on VPS (`chmod 600`)
5. Pulls latest images from Docker Hub
6. Runs `docker compose up -d` with `DOCKER_USER` and `TAG` env vars

**Expected output (final lines):**
```
>>> Service status:
NAME                IMAGE                                        ...
skillpass-server   <user>/skillpass-server:latest   ...   Up (healthy)  ...
skillpass-markitdown <user>/skillpass-markitdown:latest ...   Up (healthy)  ...

✓ Deployment complete!
```

### Step 4.2 — Verify containers are running

```bash
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose ps'
```

**Expected output:** Both `server` and `markitdown` services should show `Up` status with healthy health checks.

---

## Task 5: Run Database Migrations and Seed

**Files:** Uses one-shot containers defined in `deploy/docker-compose.yml` (profiles: setup)

### Step 5.1 — Run migrations

```bash
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose --profile setup run --rm migrate'
```

**Expected output (last lines):**
```
<timestamp> INFO migration applied: 000001_init
<timestamp> INFO migration applied: 000002_...
...
<timestamp> INFO migration complete
```

### Step 5.2 — Run seed (optional, first time only)

```bash
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose --profile setup run --rm seed'
```

**Expected output (last lines):**
```
<timestamp> INFO seed complete
```

---

## Task 6: Verify Deployment End-to-End

### Step 6.1 — Check health endpoint

```bash
curl -s http://<VPS_IP>/api/v1/health | python3 -m json.tool
```

**Expected output:**
```json
{
    "status": "ok",
    "timestamp": "2026-07-14T12:00:00Z"
}
```

### Step 6.2 — Check frontend loads

```bash
curl -s http://<VPS_IP> | head -20
```

**Expected output:** HTML of the React SPA — should contain `<div id="root">`, script tags, etc.

### Step 6.3 — Check API responds with proper CORS headers

```bash
curl -s -D - -o /dev/null http://<VPS_IP>/api/v1/health
```

**Expected output:** Should include `HTTP/1.1 200 OK` and CORS headers (`Access-Control-Allow-Origin`).

### Step 6.4 — Check Swagger docs

```bash
curl -s http://<VPS_IP>/docs/index.html | head -5
```

**Expected output:** HTML of Swagger UI.

### Step 6.5 — Open in browser

Navigate to `http://<VPS_IP>` in a web browser. The SkillPass frontend should load and be functional.

---

## Task 7: Configure Regular Updates Workflow

### Step 7.1 — Tagged release workflow

For routine code updates, use semantic version tags:

```bash
# 1. Build and push with a version tag
git tag v1.1.0
./deploy/build-and-push.sh v1.1.0

# 2. Deploy the specific tag to VPS
./deploy/deploy.sh v1.1.0
```

### Step 7.2 — Quick deploy (latest, no tag)

For rapid iteration on the dev server:

```bash
./deploy/build-and-push.sh && ./deploy/deploy.sh
```

### Step 7.3 — Check logs after deployment

```bash
# Tail all logs
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose logs -f'

# Tail server only
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose logs -f server'

# Tail markitdown only
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose logs -f markitdown'
```

---

## Task 8: Rollback Procedure

### Step 8.1 — Rollback to a previous tag

If a deployment introduces issues, roll back to the last known good version:

```bash
# Deploy a specific previous tag
./deploy/deploy.sh v1.0.0
```

### Step 8.2 — Manual rollback via SSH

If the deploy script itself is broken:

```bash
ssh root@<VPS_IP>
cd ~/skillpass

# Pull and run a specific tag
TAG=v1.0.0 docker compose pull
TAG=v1.0.0 docker compose up -d

# Or re-pull the previous latest
docker compose pull
docker compose up -d
```

### Step 8.3 — Rollback database schema (if migration caused issues)

If a migration needs to be rolled back, the current process is manual — future improvement to add down migrations:

```bash
ssh root@<VPS_IP>
cd ~/skillpass
# Connect to the local db container and run a reverse migration
docker compose exec -T db psql -U postgres -d skillpass -f /rollback_<migration_name>.sql
```

---

## Task 9: Future Improvements

### 9.1 — Add domain and HTTPS with Caddy

Replace host-level Nginx with Caddy for automatic HTTPS:

```bash
# On VPS, stop nginx
systemctl stop nginx && systemctl disable nginx

# Install Caddy
apt-get install -y caddy

# Configure Caddyfile
echo "<your-domain.com> {
    reverse_proxy localhost:1234
}" > /etc/caddy/Caddyfile

systemctl enable caddy && systemctl start caddy
```

Then update `deploy/.env`:
```
CORS_ORIGIN=https://<your-domain.com>
APP_URL=https://<your-domain.com>
COOKIE_SECURE=true
```

### 9.2 — Set up CI/CD pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push images
        run: ./deploy/build-and-push.sh ${{ github.sha }}
        env:
          DOCKER_USER: ${{ secrets.DOCKER_USER }}
      - name: Deploy to VPS
        run: ./deploy/deploy.sh ${{ github.sha }}
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          DOCKER_USER: ${{ secrets.DOCKER_USER }}
```

### 9.3 — Add monitoring

```bash
# On VPS, set up health check pinging
# Simple cron job:
echo "*/5 * * * * curl -s http://127.0.0.1/api/v1/health > /dev/null || docker compose -f ~/skillpass/docker-compose.yml restart" | crontab -
```

### 9.4 — Production hardening checklist

| Item | Done |
|------|------|
| Change `JWT_SECRET` to strong random value | Step 2.2 |
| Set `COOKIE_SECURE=true` | After HTTPS setup |
| Change default `EMAIL_FROM` domain | After domain setup |
| Restrict VPS SSH to key-only auth | ✅ setup-vps.sh |
| Set up automated backups | |
| Enable Docker container logging to syslog | |
| Set up SSL/TLS certificate rotation | |

---

## Troubleshooting Guide

### Issue: Container exits immediately

```bash
# Check logs
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose logs server'

# Common cause: DATABASE_URL is wrong or DB credentials are incorrect
# Fix: Check that the DB container is healthy
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose ps db'
```

### Issue: Nginx 502 Bad Gateway

```bash
# Server container may not be running
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose ps'

# Or server is running but on wrong port
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose exec server wget -q -O- http://localhost:1234/api/v1/health'
```

### Issue: Static frontend not loading

```bash
# Verify SERVE_STATIC is set
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose exec server env | grep SERVE_STATIC'
# Should print: SERVE_STATIC=true
```

### Issue: CORS errors in browser

```bash
# Check CORS_ORIGIN matches the URL in browser
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose exec server env | grep CORS_ORIGIN'
# Should match http://<VPS_IP> exactly
```

### Issue: "connection refused" to database

```bash
# Check if the db container is running
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose logs db'

# Test connectivity using docker network (no password exposure)
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose exec -T db pg_isready -U postgres'
```

---

## Security Notes

- Port 1234 (Go server) binds to `127.0.0.1` only — never exposed to the internet directly
- All external traffic goes through Nginx on port 80
- The `.env` file on VPS contains database credentials and API keys — `deploy.sh` auto-sets `chmod 600`
- Never commit `deploy/.env` to git (verify it's in `.gitignore`)
- JWT secret should be rotated periodically
- For production with real users, always use HTTPS (Task 9.1)
- **Changed secrets in this version:**
  - `ADMIN_PASSWORD` is no longer hardcoded in docker-compose — must be set in `.env`
  - `DB_PASSWORD` is no longer hardcoded — must be set in `.env`
  - MarkItDown container receives only the env vars it needs (not the full `.env`)
  - Nginx rate-limits auth endpoints (5 req/min per IP) and general API (30 req/min)
  - fail2ban installed on VPS (5 failed SSH attempts → 1h ban)
  - SSH hardened to key-only auth in setup-vps.sh
  - Content-Security-Policy header added to nginx

---

## Quick Reference Card

```bash
# One-time VPS setup
ssh root@<VPS_IP> 'bash -s' < deploy/setup-vps.sh
scp deploy/nginx.conf root@<VPS_IP>:/etc/nginx/sites-available/skillpass
ssh root@<VPS_IP> 'ln -sf /etc/nginx/sites-available/skillpass /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx'

# Local env
cp deploy/.env.prod.example deploy/.env
# Edit deploy/.env with values

# First deploy
./deploy/build-and-push.sh
./deploy/deploy.sh
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose --profile setup run --rm migrate'
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose --profile setup run --rm seed'  # optional

# Verify
curl http://<VPS_IP>/api/v1/health

# Regular update
./deploy/build-and-push.sh && ./deploy/deploy.sh

# Rollback
./deploy/deploy.sh v1.0.0

# Logs
ssh root@<VPS_IP> 'cd ~/skillpass && docker compose logs -f'
```

---

## Deployment Checklist

Use this checklist to track your progress. Tick each item off as you complete it.

### 🏗️ Prerequisites

- [ ] **Create Docker Hub repos** — Create `skillpass-server` and `skillpass-markitdown` at https://hub.docker.com
- [ ] **Docker login** — `docker login` on your local machine
- [ ] **Confirm VPS access** — `ssh root@<VPS_IP>` works
- [ ] **Generate secrets** — Run these and save the output:
  ```bash
  openssl rand -base64 32   # JWT_SECRET
  openssl rand -base64 32   # DB_PASSWORD
  openssl rand -base64 32   # ADMIN_PASSWORD
  ```

### 📝 Environment Configuration

- [ ] **Create .env** — `cp deploy/.env.prod.example deploy/.env`
- [ ] **Fill in `VPS_HOST`** — Set to `root@<YOUR_VPS_IP>`
- [ ] **Fill in `DOCKER_USER`** — Your Docker Hub username
- [ ] **Fill in `DB_PASSWORD`** — Random secret from above
- [ ] **Fill in `ADMIN_PASSWORD`** — Random secret from above
- [ ] **Fill in `JWT_SECRET`** — Random secret from above
- [ ] **Fill in `CORS_ORIGIN`** — `http://<YOUR_VPS_IP>`
- [ ] **Fill in `APP_URL`** — `http://<YOUR_VPS_IP>`
- [ ] **Fill in `LLM_API_KEY`** — Your LLM provider API key
- [ ] **Fill in `OPENAI_API_KEY`** — Same key (for MarkItDown)
- [ ] **Verify no placeholders**:
  ```bash
  grep -n '<YOUR_\|<change-this>\|your-dockerhub' deploy/.env
  ```

### 🖥️ VPS Setup (one-time)

- [ ] **Run setup-vps.sh**:
  ```bash
  ssh root@<YOUR_VPS_IP> 'bash -s' < deploy/setup-vps.sh
  ```
- [ ] **Copy nginx config**:
  ```bash
  scp deploy/nginx.conf root@<YOUR_VPS_IP>:/etc/nginx/sites-available/skillpass
  ```
- [ ] **Enable nginx site**:
  ```bash
  ssh root@<YOUR_VPS_IP> 'ln -sf /etc/nginx/sites-available/skillpass /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx'
  ```

### 🐳 Build & Deploy

- [ ] **Build and push images**:
  ```bash
  ./deploy/build-and-push.sh
  ```
- [ ] **Deploy to VPS**:
  ```bash
  ./deploy/deploy.sh
  ```

### 🗄️ Database

- [ ] **Run migrations**:
  ```bash
  ssh root@<YOUR_VPS_IP> 'cd ~/skillpass && docker compose --profile setup run --rm migrate'
  ```
- [ ] **Seed admin account** (first time only):
  ```bash
  ssh root@<YOUR_VPS_IP> 'cd ~/skillpass && docker compose --profile setup run --rm seed'
  ```

### ✅ Verification

- [ ] **Health check**:
  ```bash
  curl http://<YOUR_VPS_IP>/api/v1/health
  ```
  Expected: `{"status":"ok","timestamp":"..."}`
- [ ] **Frontend loads** — Open `http://<YOUR_VPS_IP>` in browser
- [ ] **Swagger docs** — Open `http://<YOUR_VPS_IP>/docs/index.html`
- [ ] **CORS headers present**:
  ```bash
  curl -s -D - -o /dev/null http://<YOUR_VPS_IP>/api/v1/health | grep -i access-control
  ```
