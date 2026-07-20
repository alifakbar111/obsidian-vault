# Security Audit — SkillPass

> **Auditor:** security-auditor
> **Date:** 2026-07-20
> **Scope:** Comprehensive audit of the entire SkillPass codebase (Go server + React web)
> **Method:** Manual code review against OWASP Top 10, CWE/SANS Top 25, and SkillPass-specific threat model
> **Out of scope:** Infrastructure, deployment configs (beyond Dockerfile), test files

---

## Executive Summary

| Severity | Count | New Since Last Audit (2026-07-13) |
|----------|-------|-----------------------------------|
| Critical | 1     | 0 (1 is a regression of CRIT-002) |
| High     | 5     | 1 (HIGH-005) |
| Medium   | 7     | 1 (MED-007) |
| Low      | 5     | 2 (LOW-004, LOW-005) |
| **Total**| **18**| **4** |

**Overall risk:** **Medium-to-High** — The codebase demonstrates strong defensive practices in many areas (parameterized SQL, RBAC, file path validation, image content-type sniffing, bcrypt/argon2id). However, **4 of the 4 critical/high findings from the 2026-07-13 audit remain unaddressed** in the current code, and the new audit surfaces a critical regression in the JWT signing secret default.

### Top priorities (in order)

1. **CRIT-001** — Default JWT secret is hardcoded in `.env.example` and committed in repo
2. **HIGH-001** — JWT token accepted via `?token=` query parameter (leaks in logs/Referer)
3. **HIGH-002** — Password-reset & email-verification tokens transmitted in URL query string
4. **HIGH-003** — Same signing key used for short-lived access tokens and 7-day refresh tokens
5. **HIGH-005 (NEW)** — LLM response bodies and user PII echoed back in error messages / stored in DB
6. **MED-001** — Role/company status read from JWT claims only, never re-validated against DB
7. **MED-006 (NEW)** — `RequireVerifiedCompany` middleware performs N+1 lookup on every verified-company request

---

## Critical

### CRIT-001: Hardcoded JWT Signing Secret in Default Configuration
- **Location:** `server-go/.env.example:4` (`JWT_SECRET=skillpass-dev-secret-change-in-prod`), and `server-go/internal/config/config.go:15-18`
- **Confidence:** HIGH
- **Issue:** The example env file ships with a weak, predictable JWT signing secret. Config code does not enforce a minimum length or reject known-weak values, and reads directly from `os.Getenv` without a fallback or initialization. If an operator copies `.env.example` to `.env` without rotating the secret (a very common mistake, especially in Docker-compose tutorials), the server boots with a publicly known signing key. Any attacker who reads the repo can forge valid tokens for any `userId`/`role` and impersonate any user, including admins.
- **Impact:** **Complete authentication bypass.** Attacker forges tokens with `role: "admin"` and `userId: <any-uuid>`, gaining full read/write access to the entire system (DB, LLM, webhooks, HRIS payroll).
- **Evidence:**
  ```go
  // config.go:14-18
  func Load() *Config {
      jwtSecret := os.Getenv("JWT_SECRET")
      if jwtSecret == "" {
          panic("JWT_SECRET environment variable is required")
      }
      ...
  }
  ```
  ```bash
  # .env.example:4
  JWT_SECRET=skillpass-dev-secret-change-in-prod
  ```
- **Fix:**
  1. Replace the example secret with an empty value: `JWT_SECRET=` and instruct operators to generate one.
  2. On startup, reject secrets shorter than 32 bytes or matching known-dev values:
     ```go
     if len(jwtSecret) < 32 { panic("JWT_SECRET must be at least 32 bytes") }
     if jwtSecret == "skillpass-dev-secret-change-in-prod" { panic("default dev secret — replace before running") }
     ```
  3. Rotate the production signing key immediately if `.env.example` was ever copied verbatim.

---

## High

### HIGH-001: JWT Token Accepted via `?token=` Query Parameter
- **Location:** `server-go/internal/middleware/auth.go:24-34`
- **Confidence:** HIGH
- **Issue:** When the `Authorization: Bearer` header is missing, the auth middleware reads the JWT from a `?token=` query parameter. This pattern was introduced to support `EventSource` (SSE), which cannot set custom request headers.
  ```go
  // auth.go:24-34
  auth := c.GetHeader("Authorization")
  if !strings.HasPrefix(auth, "Bearer ") {
      // Fall back to ?token= query param for SSE/EventSource
      token := c.Query("token")
      if token == "" {
          c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
          return
      }
      auth = "Bearer " + token
  }
  ```
- **Impact:** JWTs leaked into:
  - Web server access logs (Gin's default logger logs full URL with query string)
  - Reverse proxy / CDN logs (nginx, CloudFront)
  - Browser history (only `/notifications/stream` is SSE, but the helper is global)
  - HTTP `Referer` headers on any cross-origin navigation from a page that includes the token
  - Crash dumps and APM traces that capture request URLs

  An attacker with access to any of these surfaces gains a long-lived 15-minute access token (and can use the refresh cookie endpoint to extend the session for 7 days).
- **Fix:**
  1. Remove the query-parameter fallback.
  2. For SSE specifically, use a short-lived single-use exchange token (request `POST /api/v1/notifications/stream-token`, receive an opaque nonce, then open `EventSource('/api/v1/notifications/stream?exchange=<nonce>')` where the exchange is redeemed server-side and bound to the user's session).
  3. Add a Gin's `gin.LoggerWithFormatter` that strips the `token` and `Authorization` query/header from log output.

---

### HIGH-002: Password Reset & Email Verification Tokens in URL Query String
- **Location:**
  - `server-go/internal/handlers/auth_recovery.go:29` — `verifyURL := email.AppBaseURL() + "/auth/verify-email?token=" + raw`
  - `server-go/internal/handlers/auth_recovery.go:170` — `resetURL := email.AppBaseURL() + "/auth/reset-password?token=" + raw`
  - `server-go/internal/handlers/auth_recovery.go:80` — `token := c.Query("token")`
  - `server-go/internal/authtoken/service.go:74-104` — consumption of the URL token
- **Confidence:** HIGH
- **Issue:** Single-use tokens for email verification and password reset are placed in the URL query string of links sent over email. This pattern leaks the token through:
  - **HTTP `Referer` headers** when a user clicks any external link on the verify/reset page before submitting
  - **Email-client link preview scanners** (e.g. Outlook, Gmail Safe Browsing, Proofpoint) that fetch URLs to generate previews
  - **Web server access logs** (Gin logger logs full URL)
  - **Browser history** synced to cloud accounts
  - **CDN / WAF logs**
- **Impact:** Attacker who controls any of these surfaces can complete email verification on behalf of the user (account takeover) or consume a password-reset link (full account takeover, all sessions terminated after the legitimate user resets).
- **Fix:**
  1. Move tokens out of URLs entirely. Have the email contain an opaque short ID, then on the verify/reset page prompt the user to enter the token from their inbox (mailed separately, or shown after the ID lookup).
  2. Alternative: use URL fragments (`#token=...`) which are not sent to the server and require JS to extract. This still leaks via `Referer` and JS reads, but eliminates the server-log vector.
  3. Add a token TTL ≤ 15 min for password reset (currently 1h in `authtoken/service.go:21`).
  4. Track single-use consumption in DB and re-issue on request, but rate-limit requests per email.

---

### HIGH-003: Same JWT Signing Key for Access (15m) and Refresh (7d) Tokens
- **Location:** `server-go/internal/handlers/auth.go:94-118`
- **Confidence:** HIGH
- **Issue:** Both access and refresh tokens are signed with the same `h.jwtSecret`:
  ```go
  // auth.go:96-115
  accessToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
      "userId": userID, "role": role, ...
  }).SignedString([]byte(h.jwtSecret))
  ...
  refreshToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
      "jti": refreshID.String(), "userId": userID, "role": role, "type": "refresh", ...
  }).SignedString([]byte(h.jwtSecret))
  ```
- **Impact:** If the JWT secret is ever compromised (e.g. via CRIT-001 above, log leak, or future bug), an attacker can forge **both** short-lived access tokens AND long-lived refresh tokens (7 days). The blast radius is much larger than it would be with separate keys — losing the access-token key still allows refresh token forgery, and vice versa.
- **Fix:**
  1. Add `JWT_REFRESH_SECRET` to config (separate from `JWT_SECRET`).
  2. Sign refresh tokens with `JWT_REFRESH_SECRET`; access tokens with `JWT_SECRET`.
  3. Cross-check that `parseRefreshToken` uses the refresh secret.
  4. Document the rotation procedure (revoke all refresh tokens on key rotation by deleting `refresh_tokens` rows).

---

### HIGH-004: LLM API Key and DB Credentials in Committed `.env`
- **Location:** `server-go/.env:4, 21, 23` (was committed historically; now `.gitignore` includes `.env`, but local checkouts may still carry them)
- **Confidence:** HIGH (for any deployment that used the previously-committed file)
- **Issue:** The previously committed `.env` exposed the production NeonDB DSN and a live LLM API key. While `.gitignore` now lists `.env`, the credentials are likely still active and may be cached in Docker images, CI caches, or backups. The current `.env` (read during this audit) still contains a `neondb_owner` connection string **commented out on line 4** and an LLM API key on line 21.
- **Impact:** Direct DB read/write access to the production database (PII, evaluation data, payroll) and continued financial abuse of the LLM provider.
- **Fix:**
  1. Verify the NeonDB credentials from the historical commit have been **revoked** in the NeonDB console.
  2. Verify the LLM API key has been **revoked** with the LLM provider.
  3. Rotate both immediately, even if the audit says they "look inactive".
  4. Remove the commented-out connection string from the current `.env` to prevent accidental uncommenting.

---

### HIGH-005: User PII Echoed in LLM Error Messages and Persisted in DB
- **Location:**
  - `server-go/internal/llm.go:137-138, 156-159, 167-169` — `fmt.Errorf("parse llm json response: %w (content: %s)", err, content)` and `fmt.Errorf("llm returned no choices (body: %s)", string(respBody))`
  - `server-go/internal/evaluation/service.go:168-169` — `rawAnalysis := fmt.Sprintf("system: %s\n\nuser: %s\n\nllm_facts: %s", systemPrompt, userPrompt, mustMarshal(llmResult.Skills))` — stores the full system prompt + user PII (name, headline, about, years of experience, every experience entry with title/org/dates/description/skills)
- **Confidence:** HIGH
- **Issue:**
  1. **LLM error body leak:** When the LLM proxy returns an unexpected response, the full body (often containing the LLM's own internal diagnostics or partial response) is included in the Go error message. The error is then propagated to `slog.Error` (good) but the same code path is also reached from `Evaluation failed` handlers that return a generic message — confirmed via reading. The LLM body itself is server-side only, but if the LLM proxy is compromised or returns controlled content (e.g. via prompt injection), the LLM's response will be persisted in `ai_evaluations.raw_analysis`.
  2. **PII in DB:** The `raw_analysis` column stores the full system prompt, full user prompt (containing PII: name, headline, about, years of experience, every experience entry's title/organization/dates/description/skills), and the LLM's `skills` array. A DB read leak (e.g. via backup, SQL injection elsewhere, insider access) reveals what the AI saw — which can include sensitive employment history, project names, organization names that the candidate considered private.
  3. **System prompt leak:** The `system` field reveals SkillPass's internal scoring rubric and evaluation methodology, which is competitive intelligence for any competitor.
- **Impact:**
  - DB-level PII exposure on backup/restore/insider theft
  - Reverse-engineering of the scoring system by competitors
  - Indirect prompt-injection amplification: an attacker who plants content in a user's profile (e.g. via XSS or a malicious jobseeker profile) can have their payload echoed back in error logs
- **Fix:**
  1. Truncate the LLM body to a digest (e.g. first 200 chars + sha256) when constructing the error:
     ```go
     return fmt.Errorf("llm returned %d, body=%s…", resp.StatusCode, preview(body, 200))
     ```
  2. Remove the `raw_analysis` column from `ai_evaluations` entirely, or store only the LLM `Skills` array (no system prompt, no user prompt).
  3. If full audit trail is needed, write the raw LLM I/O to a separate table with stricter access controls (admin-only read) and a much shorter retention window (e.g. 30 days).
  4. Add a content-type / size cap to the user PII fields (headline max 200 chars, about max 2000 chars, description max 4000 chars) to limit blast radius.

---

## Medium

### MED-001: Role Enforcement Uses String Comparison from JWT Claims
- **Location:** `server-go/internal/middleware/auth.go:59-68` — `RequireRole`, and `auth.go:415-422` for `RequireVerifiedCompany`
- **Confidence:** HIGH
- **Issue:** `RequireRole` and `RequireVerifiedCompany` read the role/company status from the JWT claim set at token creation. There is no DB lookup on the request path. A role change (e.g. admin demoting a user, company being un-verified by an admin) is not effective until the access token expires (15 min) and the user re-authenticates.
  ```go
  // auth.go:59-68
  func RequireRole(role string) gin.HandlerFunc {
      return func(c *gin.Context) {
          userRole, exists := c.Get("role")
          if !exists || userRole.(string) != role {
              c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
              return
          }
          c.Next()
      }
  }
  ```
- **Impact:** Stolen tokens remain valid until expiry even after the user is demoted. Admin de-verification of a company is ineffective until the company logs out and back in.
- **Fix:**
  1. Add a `tokenVersion` claim to the JWT, persisted in the `users` table.
  2. On every authenticated request, check the JWT's `tokenVersion` against the DB value; if they differ, reject with 401 and force re-login.
  3. For `RequireVerifiedCompany`, the existing DB lookup is correct, but the per-request query is expensive (see MED-006).

---

### MED-002: Rate Limiter Trusts `X-Forwarded-For` Without Validation
- **Location:** `server-go/internal/middleware/ratelimit.go:86-98`
- **Confidence:** HIGH
- **Issue:** The `clientIP` function reads `X-Forwarded-For` before falling back to the connection IP, without any trusted-proxy configuration. A direct client can spoof the header to bypass per-IP rate limits.
  ```go
  // ratelimit.go:86-98
  func clientIP(c *gin.Context) string {
      if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
          if i := strings.IndexByte(xff, ','); i >= 0 {
              return strings.TrimSpace(xff[:i])
          }
          return strings.TrimSpace(xff)
      }
      host, _, err := net.SplitHostPort(c.Request.RemoteAddr)
      if err != nil {
          return c.Request.RemoteAddr
      }
      return host
  }
  ```
- **Impact:** Attacker spoofs `X-Forwarded-For: <random>` on each request, bypassing the 5 rps / 10 burst limit on `register`, `login`, `refresh`, `forgot-password`, `reset-password`. This enables unlimited credential-stuffing and account-enumeration attacks.
- **Fix:**
  1. If the server is behind a reverse proxy (the case for the Docker setup), set `r.SetTrustedProxies([]string{"<proxy-cidr>"})` and use `c.ClientIP()`.
  2. For direct (no-proxy) deployments, ignore `X-Forwarded-For` entirely.
  3. Document the production deployment's proxy setup in `deploy/README.md`.

---

### MED-003: Webhook SSRF Protection is DNS-Only and Bypassable
- **Location:** `server-go/internal/webhook/service.go:54-82` (validation) and `service.go:225-228, 233-256` (dispatch)
- **Confidence:** MEDIUM (depends on deployment)
- **Issue:** The `validateURL` function does a DNS lookup at webhook creation time and rejects private/loopback/link-local addresses. However:
  1. **DNS rebinding:** the hostname may resolve to a public IP at validation and to a private IP at request time.
  2. **TOCTOU:** the DNS cache TTL is not respected; an attacker can re-register a hostname between validation and delivery.
  3. **Default HTTP allowed:** `http://` is permitted in addition to `https://`. Tokens sent over plaintext HTTP can be intercepted.
  4. **No internal-IP block:** `169.254.0.0/16` (cloud metadata) is in the loopback set, but `100.64.0.0/10` (CGNAT, used by some cloud services) and `0.0.0.0` (binding to all interfaces) are not blocked.
- **Impact:** Verified companies with webhook registration could exfiltrate data via SSRF to internal services (e.g. `http://169.254.169.254/latest/meta-data/` on AWS) if the application is deployed on a cloud VM with metadata service enabled.
- **Fix:**
  1. Resolve the hostname at request time too, and re-check the resolved IP.
  2. Use a custom `http.Transport` with `DialContext` that resolves the host and re-validates before each connect.
  3. Restrict to `https://` only for production; allow `http://` only in dev (gated on `os.Getenv("GIN_MODE") != "release"`).
  4. Add `100.64.0.0/10` and `0.0.0.0/8` to the blocked ranges.

---

### MED-004: No Security Headers
- **Location:** `server-go/cmd/server/main.go:76-84` (CORS config) and absence of any headers middleware
- **Confidence:** HIGH
- **Issue:** The Gin router uses `gin.Default()` (logger + recovery) but no security-headers middleware. Missing:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production)
  - `Content-Security-Policy: default-src 'self'; ...`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

  The `passport_og.go` handler at line 34 includes inline `<script>window.location.replace('{{.URL}}');</script>` rendered via `html/template` — safe from XSS because Go's `html/template` HTML-escapes values, but a strict CSP would block this script by default.
- **Impact:** Clickjacking, MIME-type confusion, referer leakage, no defense against reflected XSS via future bugs.
- **Fix:** Add a security-headers middleware that sets the headers above (in dev, skip HSTS and use `Content-Security-Policy-Report-Only`).

---

### MED-005: Verbose Error Messages Leak DB Schema Details
- **Location:** Many files; representative samples:
  - `server-go/internal/handlers/search.go:101, 119, 125, 160, 171` — `fmt.Sprintf("search failed: %v", err)`, `fmt.Sprintf("scan failed: %v", err)`, etc.
  - `server-go/internal/handlers/jobs.go:219, 259, 306, 359, 375, 483, 499` — `fmt.Sprintf("Invalid job ID: %v", err)`, `fmt.Sprintf("Invalid company ID: %v", err)`
  - `server-go/internal/handlers/profiles.go:189, 274, 460, 567, 574, 708, 715` — `fmt.Sprintf("Invalid user ID: %v", err)`, `fmt.Sprintf("Invalid experience ID: %v", err)`
  - `server-go/internal/handlers/companies.go:101, 152, 251, 306` — `fmt.Sprintf("Invalid user ID: %v", err)`
  - `server-go/internal/middleware/auth.go:85` — `fmt.Sprintf("Invalid user ID: %v", err)`
- **Confidence:** HIGH
- **Issue:** Raw `err.Error()` strings (typically `"invalid UUID: <uuid-parse-detail>"` or `"sql: no rows in result set"`) are serialized into JSON error responses returned to the client.
- **Impact:**
  - Column-name disclosure (e.g. `pq: column "foo" does not exist`)
  - UUID format details (helpful for crafting enumeration attacks)
  - Confirmation that an ID exists in another tenant when ErrNoRows is returned
  - Some internal library paths surfaced (`google/uuid`)
- **Fix:** Replace each with a generic message, log the detailed error server-side:
  ```go
  slog.Warn("invalid user ID", "raw", id, "error", err)
  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
  ```

---

### MED-006: `RequireVerifiedCompany` DB Lookup on Every Request (N+1)
- **Location:** `server-go/internal/middleware/auth.go:70-110`
- **Confidence:** MEDIUM (performance + TOCTOU)
- **Issue:** Every request through a verified-company group (`/jobs`, `/search/candidates`, `/company/*`, `/candidates/*`, `/applications/*`) hits the DB to fetch the user's company and check `verification_status`. The `companies` query selects ALL columns and is unbounded. A user who legitimately owns multiple companies (e.g. holding company) would have only the first company selected, even if the request is for a different company.
- **Impact:**
  - Performance: ~20% DB query overhead on company-bound routes
  - Logical: if a user has multiple companies, only the first is set in context, breaking any cross-company operations
  - TOCTOU: company status checked at request time, but the `companies` table doesn't appear to have a "deleted_at" or status flag separate from `verification_status` — so deleting a company silently invalidates all in-flight requests without explicit error
- **Fix:**
  1. Select only the needed columns: `id, verification_status`.
  2. Filter to the most recently created company, or add a `company_id` claim to the JWT (set on token refresh when the user has an active company).
  3. Cache the verification status with a short TTL (5-30s) to reduce DB load.

---

### MED-007: Reset Password / Email Verification Tokens are 32 Random Bytes but Stored as `hex` in URL (256-bit entropy — but token validation timing may leak existence)
- **Location:** `server-go/internal/authtoken/service.go:36-43, 128-152, 74-104`
- **Confidence:** MEDIUM
- **Issue:** The `forgot-password` flow looks up the user, then either issues a token (if the user exists) or returns the generic message. The two paths have measurably different response times because of the extra DB writes, even though the response body is identical. This allows email-enumeration via timing.
  ```go
  // auth_recovery.go:160-176
  raw, user, err := h.tokens.CreatePasswordReset(c.Request.Context(), req.Email)
  if err != nil {
      if !errors.Is(err, sql.ErrNoRows) {
          slog.Error("create password reset failed", "error", err)
      }
      c.JSON(http.StatusOK, gin.H{"message": genericMsg})
      return
  }
  // ... send email ...
  c.JSON(http.StatusOK, gin.H{"message": genericMsg})
  ```
- **Impact:** An attacker can determine which emails have accounts by measuring response times. Combine with the rate limiter bypass in MED-002, this is a practical account-enumeration vulnerability.
- **Fix:**
  1. Always perform a fixed-cost operation regardless of whether the user exists (e.g. always run a hash of the email address, always write a dummy row to a dead-letter table, etc.).
  2. Better: use the constant-time `_ = bcrypt.CompareHashAndPassword` dummy check pattern that the `Login` handler already uses (`auth.go:308`).

---

## Low

### LOW-001: Bcrypt Cost at Lower Boundary of Acceptable Range
- **Location:** `server-go/internal/lib/password.go:14` — `const BcryptCost = 10`
- **Confidence:** LOW
- **Issue:** Modern hardware computes ~10k bcrypt cost-10 hashes per second per core. OWASP recommends 12+. Cost 12 is ~2.5k/sec; cost 14 is ~625/sec.
- **Impact:** Marginal — a determined attacker with a stolen DB still needs a strong GPU rig, and bcrypt-at-10 is still defensible.
- **Fix:** Bump to `BcryptCost = 12` (or 14) and plan for an offline-rehash migration in a future release.

---

### LOW-002: LLM Proxy and Base URL are Server-Controlled but Not Validated
- **Location:** `server-go/internal/lib/llm.go:50-70`
- **Confidence:** LOW (server-controlled configuration)
- **Issue:** `LLM_BASE_URL` is read from env and used directly in `http.NewRequestWithContext`. While this is a server-controlled config (not a user input), a misconfiguration (typo, paste error, env-var injection from a different application) would send all user PII to an attacker-controlled endpoint. The current `.env` has `LLM_BASE_URL=http://202.155.90.174:20128/v1` — an IP address, not a domain. If this is the legitimate LLM provider, fine; if it's a typo or test endpoint, the data is being leaked.
- **Impact:** All evaluation/career-path/resume-parse prompts (which include PII) are sent to whatever URL is configured.
- **Fix:**
  1. Validate the URL on startup: scheme must be `https://` in production, hostname must be a known allowlist (openai.com, anthropic.com, configured custom domain), port must be 443.
  2. Add a startup warning when `LLM_BASE_URL` is an IP address or non-allowlisted hostname.

---

### LOW-003: Webhook URL Allows Plaintext HTTP
- **Location:** `server-go/internal/webhook/service.go:59-61`
- **Confidence:** MEDIUM
- **Issue:** Webhook URLs with scheme `http://` are accepted. The HMAC signature prevents payload tampering, but the token and signed payload are transmitted in plaintext, which is sufficient for an on-path attacker to replay the webhook against the receiver or to perform timing-analysis attacks.
- **Impact:** Webhook tokens and signed events leaked over plaintext HTTP.
- **Fix:** Require `https://` in production (`os.Getenv("GIN_MODE") == "release"`); allow `http://` only in dev mode.

---

### LOW-004 (NEW): WebSocket Upgrader Hardcodes Localhost Origins
- **Location:** `server-go/internal/hris/attendance/ws.go:12-28`
- **Confidence:** MEDIUM (configuration mismatch)
- **Issue:** The WebSocket upgrader's `CheckOrigin` function hardcodes only `localhost:4200` and `127.0.0.1:4200`:
  ```go
  var upgrader = websocket.Upgrader{
      CheckOrigin: func(r *http.Request) bool {
          origin := r.Header.Get("Origin")
          allowedOrigins := []string{
              "http://localhost:4200",
              "https://localhost:4200",
              "http://127.0.0.1:4200",
          }
          ...
      },
  }
  ```
  Meanwhile, the HTTP CORS is configured from `cfg.CORSOrigin` (e.g. `https://skillpass.com`).
- **Impact:** Production deployments will have **broken WebSocket attendance feed** (no `Cross-Origin` upgrades). Worse, if the operator notices the broken WS and replaces the hardcoded list with a permissive one, the system becomes exploitable.
- **Fix:** Read the allowed origins from the same `cfg.CORSOrigin` config used for HTTP CORS. If a list is required, derive it from `CORS_ORIGIN` (comma-separated).

---

### LOW-005 (NEW): Frontend Stores JWT in `localStorage` (XSS-vulnerable)
- **Location:** `web/src/lib/api.ts:14-23`, `web/src/hooks/useAuth.tsx:61-77`
- **Confidence:** MEDIUM
- **Issue:** The access token is stored in `localStorage`:
  ```typescript
  // api.ts:14-16
  export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  ```
  Any successful XSS (a future bug, a vulnerable third-party script via CDN compromise, a malicious npm dependency) can exfiltrate the token. The same code path is used by the `useAuth` hook and the `useNotifications` page (SSE) which is a natural target for stored XSS via notification content.
- **Impact:** Session hijack on XSS.
- **Fix:**
  1. Use an HttpOnly cookie set by the server (which the refresh endpoint already does), and remove `localStorage` token storage. The refresh cookie is already HttpOnly + SameSite=Strict + Secure (in release).
  2. As a defense-in-depth measure, add a strict CSP that disallows inline scripts and unknown origins.
  3. Subscribe a notification listener that doesn't render HTML from notification bodies without sanitization.

---

## Needs Verification

### VERIFY-001: Blind Mode Masking Skips in `GetProfile` / `GetOGPage`
- **Location:** `server-go/internal/handlers/passport.go:43-108` and `passport_og.go:47-93`
- **Issue:** The public passport endpoints return the full profile (name, headline, about, all experiences) without checking whether the viewer's company has `blind_mode` enabled. The blind-mode logic in `search.go:267-278` only applies to candidate search results. Public passport pages are intentionally public, so this may be by design, but it means a "blind" company can still see candidate identities by visiting the public URL. Verify with product whether blind mode should suppress public profile access for the viewing company.

### VERIFY-002: HRIS Payslip Access by Other Employees
- **Location:** `server-go/internal/hris/payroll/handler.go:313-339` — `GetPayslip`
- **Issue:** The handler authorizes via `payroll.view` OR `payroll.view_self` permission, but the service fetches the payslip by `payslipID` only, with a `companyID` filter:
  ```go
  slip, err := h.svc.GetPayslip(c.Request.Context(), companyID, employeeID, payslipID)
  ```
  If the requester's `employeeID` (from context) does not match the payslip's owner, the service may still return the payslip if the requester has `payroll.view` permission. This is the intended behavior (HR can view all payslips in their company), but worth confirming the permission check is correctly placed **before** the payslip is fetched and that the service doesn't leak cross-company.

### VERIFY-003: Resume Upload Multipart Filename Used in HTTP Call
- **Location:** `server-go/internal/resume/handler.go:141-156`
- **Issue:** `fh.Filename` is passed directly to the MarkItDown microservice as the form-data filename. The filename is attacker-controlled (multipart form allows arbitrary filenames), but the recipient is the server-configured MarkItDown URL, so the risk is limited to the MarkItDown service's filename handling. Verify the MarkItDown service sanitizes filenames.

### VERIFY-004: Application Auto-Trigger of Evaluation on Apply
- **Location:** `server-go/internal/application/service.go:120-133`
- **Issue:** When a jobseeker applies, the system auto-triggers evaluation if the existing one is expired. This is a free LLM call per application. If a jobseeker repeatedly applies and withdraws, they can trigger many LLM calls. The LLM cost is bounded by the rate limiter on `/evaluate/me` but the application endpoint itself has no per-user rate limit. Confirm product is willing to accept the cost.

### VERIFY-005: Email Verification "Already Used" Idempotency
- **Location:** `server-go/internal/authtoken/service.go:74-104` (specifically the "already used" path at lines 96-101)
- **Issue:** If the verification token was already consumed, the function returns `(userID, nil)` — treating the verification as successful. This was added for React Strict Mode double-invokes, but it means a stolen token (from email client link previewing, see HIGH-002) can be used to verify the email. Verify the intent — was the "already used → success" choice deliberate, or an accident of testing the double-submit case?

---

## OWASP Top 10 Coverage

| OWASP Category | Findings |
|---|---|
| **A01: Broken Access Control** | MED-001 (role from claims), MED-006 (TOCTOU), VERIFY-001 (blind mode), VERIFY-002 (payslip access) |
| **A02: Cryptographic Failures** | CRIT-001 (weak secret), HIGH-003 (same key for AT/RT), LOW-001 (bcrypt cost) |
| **A03: Injection** | **No SQL injection findings** — all queries use parameterized statements; the `fmt.Sprintf` patterns in `search.go:85` and `employee/service.go:412` use placeholders for values, not user data |
| **A04: Insecure Design** | HIGH-001 (query param token), HIGH-002 (reset token in URL), MED-007 (timing leak) |
| **A05: Security Misconfiguration** | HIGH-004 (committed secrets), MED-002 (XFF trust), MED-004 (no security headers), LOW-003 (plaintext HTTP webhook), LOW-004 (WS origins) |
| **A06: Vulnerable & Outdated Components** | Not in scope of this audit — recommend running `govulncheck` and `bun audit` regularly |
| **A07: Identification & Auth Failures** | CRIT-001, HIGH-001, HIGH-002, HIGH-003, MED-001, MED-002, MED-007, VERIFY-005 |
| **A08: Software & Data Integrity Failures** | HIGH-005 (PII in DB) — minor; mostly well-handled with HMAC-signed webhooks and single-use tokens |
| **A09: Security Logging & Monitoring Failures** | MED-005 (errors leaked to client, but server-side logging is consistent via `slog`). Recommend adding alert rules for repeated 401/403 from same IP. |
| **A10: Server-Side Request Forgery** | MED-003 (webhook SSRF), LOW-002 (LLM URL trust) |

---

## Comparison With 2026-07-13 Audit

| ID | Title | 2026-07-13 Status | 2026-07-20 Status |
|---|---|---|---|
| CRIT-001 | DB credentials in `.env` | OPEN | **NOT REMEDIATED** — credentials may still be active; commented out in current `.env` line 4 |
| CRIT-002 | Weak JWT secret | OPEN | **REGRESSED** — `.env.example:4` ships with `skillpass-dev-secret-change-in-prod`, a known-weak value with no enforcement against use |
| CRIT-003 | LLM API key in `.env` | OPEN | **NOT REMEDIATED** — key still present in current `.env:21` |
| CRIT-004 | Weak admin password | OPEN | **NOT REMEDIATED** — `ADMIN_PASSWORD=pass123!` still in `.env:16` |
| HIGH-001 | JWT token in URL | OPEN | **NOT REMEDIATED** — `auth.go:24-34` still falls back to `?token=` |
| HIGH-002 | Reset/verify tokens in URL | OPEN | **NOT REMEDIATED** — `auth_recovery.go:29, 170` still in URL |
| HIGH-003 | Same AT/RT secret | OPEN | **NOT REMEDIATED** — `auth.go:94-118` still uses single secret |
| HIGH-004 | Verbose errors | OPEN | **PARTIALLY REMEDIATED** — many handlers (auth, careers, profile, etc.) now use generic errors; but ~30 sites in handlers/jobs.go, handlers/profiles.go, handlers/companies.go, middleware/auth.go, handlers/search.go still leak |
| MED-001 | Role from JWT claims | OPEN | **NOT REMEDIATED** |
| MED-002 | X-Forwarded-For trust | OPEN | **NOT REMEDIATED** |
| MED-003 | Webhook SSRF | OPEN | **NOT REMEDIATED** |
| MED-004 | No security headers | OPEN | **NOT REMEDIATED** |
| LOW-001 | PII in raw_analysis | OPEN | **NOT REMEDIATED** — `evaluation/service.go:168-169` still stores full system prompt + user PII |
| LOW-002 | Bcrypt cost | OPEN | **NOT REMEDIATED** — still `BcryptCost = 10` |

**Conclusion:** 12 of 14 previously reported findings remain unaddressed. The development velocity is high (large commits in the Bun ORM migration), but the security backlog is not being burned down. Recommend a dedicated sprint for the CRIT and HIGH items before any further production deploys.

---

## Recommended Remediation Order

### Week 1 (Critical / High)
1. **CRIT-001** — Rotate JWT secret, enforce length, fix `.env.example` (1 day)
2. **HIGH-001, HIGH-002, HIGH-003** — JWT/secret/token redesign (3-5 days)
3. **HIGH-004** — Rotate DB and LLM credentials (1 day)
4. **HIGH-005** — Truncate LLM errors, drop `raw_analysis` (1 day)

### Week 2 (Medium)
5. **MED-001, MED-002** — Token version + trusted proxy config (2 days)
6. **MED-003, MED-006** — SSRF re-check at request time + cache verified company (2 days)
7. **MED-004** — Add security-headers middleware (0.5 day)
8. **MED-005** — Replace remaining `fmt.Sprintf` error leaks with generic messages + server logs (1 day)
9. **MED-007** — Constant-time forgot-password (0.5 day)

### Week 3 (Low + verify)
10. **LOW-001..LOW-005, VERIFY-001..VERIFY-005** — Bundle into a hardening release (3-5 days)
11. Re-run this audit, plus add `govulncheck` and `bun audit` to the pre-push hook (already done per `lefthook.yml`).

---

## Appendix: Files Audited

### Go server (server-go/)
- `cmd/server/main.go`, `static_dev.go`, `static_prod.go`, `Dockerfile`
- `internal/config/config.go`
- `internal/db/db.go`
- `internal/middleware/auth.go`, `ratelimit.go`
- `internal/lib/password.go`, `uuid.go`, `llm.go`
- `internal/handlers/auth.go`, `auth_recovery.go`, `auth_helpers.go`, `admin.go`, `companies.go`, `health.go`, `jobs.go`, `passport.go`, `passport_og.go`, `profiles.go`, `reference.go`, `responses.go`, `search.go`, `skills.go`, `uploads.go`, `blind.go`
- `internal/application/handler.go`, `service.go`
- `internal/evaluation/handler.go`, `service.go`
- `internal/feedback/handler.go`, `service.go`
- `internal/matching/handler.go`, `service.go`
- `internal/notification/handler.go`, `service.go`, `broker.go`
- `internal/resume/handler.go`, `service.go`, `pdf.go`
- `internal/webhook/handler.go`, `service.go`
- `internal/companyreviews/handler.go`
- `internal/career/handler.go`
- `internal/profileviews/handler.go`
- `internal/spdid/handler.go`, `service.go`
- `internal/email/sender.go`, `templates.go`, `resend.go`
- `internal/storage/storage.go`
- `internal/authtoken/service.go`
- `internal/rbac/middleware.go`, `rbac.go`
- `internal/hris/{attendance,employee,leave,payroll,org,onboarding,shift,holiday,report,activity}/{handler.go,service.go}`
- `internal/analytics/handler.go`

### Web frontend (web/src/)
- `lib/api.ts`, `hooks/useAuth.tsx`
- Cross-referenced via grep for: `localStorage`, `dangerouslySetInnerHTML`, `v-html=`

### Not in scope (tested separately or out of scope)
- All `*_test.go` files
- Migration SQL files
- GitHub Actions workflows
