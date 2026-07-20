# Bug Hunt — SkillPass

> **Agent:** bug-hunter
> **Date:** 2026-07-13
> **Scope:** Bugs, vulnerabilities, and quality issues in local branch changes

---

## Consolidated Priority

| Priority | Issue | Fix |
|---|---|---|
| **P0** | VULN-001: JWT token in SSE `?token=` URL | Use exchange token or WebSocket |
| **P1** | BUG-002: `window.location.reload()` workaround | Proper `queryClient.invalidateQueries()` |
| **P2** | VULN-002: Hardcoded secrets in docker-compose.yml | Env var substitution, CI secrets |
| **P2** | BUG-001: Dead Dockerfile `web-builder` stage | Remove duplicate stage |
| **P3** | BUG-003: No per-user SSE connection limit | Cap at 5 concurrent |
| **P3** | BUG-004: Missing security headers on SSE | Add `X-Content-Type-Options` |

---

## HIGH

### VULN-001: JWT Token Leaked in SSE Query String URL
- **Location:** `server-go/internal/middleware/auth.go:32` + `web/src/lib/notifications.ts:48`
- **Problem:** The SSE (Server-Sent Events) endpoint `/api/v1/notifications/stream` authenticates by passing the JWT access token as a `?token=` query parameter. The auth middleware falls back to `c.Query("token")` when no `Authorization` header is present (because `EventSource` doesn't support custom headers). The frontend constructs `new EventSource(url)` with the token in the URL.
- **Impact:** JWT tokens in URL query strings are an OWASP ASVS V3.2.1 anti-pattern:
  - Captured by every intermediary (nginx, load balancers, app logs, CDNs)
  - Leaked via Referer header
  - Visible in browser dev tools network inspector
  - Bearer token — anyone who captures it fully impersonates the user
- **Fix Options:**
  - **A (preferred):** Short-lived exchange token — one-time-use token valid for 30s, exchanged for SSE session, then discarded
  - **B:** WebSocket (supports custom headers natively)
  - **C:** Same-site session cookie + `EventSource(url, { withCredentials: true })`
- **Severity:** HIGH
- **Confidence:** HIGH

---

## MEDIUM

### VULN-002: Hardcoded Secrets in docker-compose.yml
- **Location:** `docker-compose.yml:39,41,58`
- **Problem:** Three secrets hardcoded:
  - `ADMIN_PASSWORD: pass123!`
  - `JWT_SECRET: skillpass-dev-secret`
  - `DATABASE_URL: postgres://postgres:postgres@db:5432/skillpass` (contains DB password)
- **Impact:** If deployed beyond local dev (staging, CI, accidentally exposed), these weak credentials are immediately exploitable. The JWT secret `skillpass-dev-secret` is trivially guessable — anyone can forge valid JWT tokens.
- **Fix:**
  - Remove hardcoded secrets from docker-compose.yml
  - Use env var substitution: `JWT_SECRET: ${JWT_SECRET:-skillpass-dev-secret}`
  - Use `docker-compose.override.yml` with dev secrets (`.gitignore`d)
  - For CI, inject via GitHub Actions secrets
- **Severity:** MEDIUM
- **Confidence:** HIGH

### BUG-001: Dead/Duplicate Dockerfile Stage
- **Location:** `server-go/Dockerfile:159-167`
- **Problem:** Two `FROM oven/bun:1 AS web-builder` stages. The first (Stage 1, lines 159-167) builds the web app but is overwritten by the second `web-builder` (Stage 3, lines 182-188) — identical build. In Docker multi-stage builds, duplicate stage names cause the last definition to win. Stage 1 runs the full `bun install && bun run build` for nothing.
- **Impact:** Wastes ~30-60 seconds of CI/Docker build time per image build. Wastes bandwidth installing dependencies twice. Indicates incomplete refactor.
- **Fix:** Remove the first `web-builder` stage (lines 159-167). Only the second is needed.
- **Severity:** MEDIUM
- **Confidence:** HIGH

### BUG-002: Full Page Reload Workaround for Broken Data Invalidation
- **Location:** `web/src/pages/JobseekerProfile/ResumeImport.tsx:76,102`
- **Problem:** After successfully importing resume experiences, the page calls `window.location.reload()` instead of properly invalidating and refetching via React Query.
  ```tsx
  // Reload page to refresh all profile sections with the new data
  window.location.reload();
  ```
  The parent defines `invalidateProfileViews` that calls `queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })` — suggests profile sections don't subscribe to the right query key.
- **Impact:**
  - Destroys all client-side state (scroll position, open dialogs, form inputs)
  - Full page flash
  - Disconnects active SSE notifications (EventSource reconnects, misses events)
  - Indicates incomplete data invalidation wiring
- **Fix:** Remove both `window.location.reload()` calls. Fix data invalidation so `invalidateProfileViews()` correctly triggers refetch on all profile sections.
- **Severity:** MEDIUM
- **Confidence:** HIGH

---

## LOW

### BUG-003: No Per-User SSE Connection Limit
- **Location:** `server-go/internal/notification/handler.go:31-78`
- **Problem:** Each call to `Subscribe(userID)` adds a new goroutine+buffered channel (64 events) to the broker. No limit on concurrent connections per user.
  ```go
  ch := h.service.Subscribe(userID)
  defer h.service.Unsubscribe(userID, ch)
  ```
  ```go
  ch := make(chan SSEEvent, 64)
  b.subscribers[userID] = append(b.subscribers[userID], ch)
  ```
- **Impact:** Memory exhaustion from malicious or buggy client opening unlimited SSE connections. Broker's subscriber map grows unboundedly for same userID.
- **Fix:** Add per-user connection limit (e.g., max 5 concurrent). When exceeded, close oldest connection or reject with 429.
- **Severity:** LOW
- **Confidence:** HIGH

### BUG-004: SSE Handler Missing Security Headers
- **Location:** `server-go/internal/notification/handler.go:38-41`
- **Problem:** SSE handler sets `Content-Type`, `Cache-Control`, `Connection`, `X-Accel-Buffering` but missing `X-Content-Type-Options: nosniff`.
- **Impact:** Low — defense-in-depth. Exploit surface for SSE endpoint is minimal (GET-only, same-origin).
- **Fix:** Add `c.Header("X-Content-Type-Options", "nosniff")` to SSE response headers.
- **Severity:** LOW
- **Confidence:** MEDIUM

---

## Clean Categories — No Issues Found

| Category | Status |
|---|---|
| SQL injection | ✅ All parameterized, go-jet query builder used |
| XSS | ✅ React auto-escapes, no `dangerouslySetInnerHTML` |
| CSRF | ✅ JWT Bearer auth, SSE is GET-only |
| Race conditions | ✅ Broker uses RWMutex correctly, non-blocking publish |
| Session | ✅ JWT-based, no session handling changed |
| Cryptography | ✅ HS256 JWT, no crypto changes |
| IDOR/Authorization | ✅ All scoped to authenticated userID |
| Path traversal | ✅ No file operations in changed code |
| SSRF | ✅ No external URL calls in changed code |
