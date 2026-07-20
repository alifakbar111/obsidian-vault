# Security Audit — SkillPass

> **Agent:** security-auditor
> **Date:** 2026-07-13
> **Scope:** JWT handling, SQL injection, auth bypass, password hashing, CORS, secret leakage, error messages

---

## Consolidated Priority

| Priority | Issue | Fix |
|---|---|---|
| **P0** | CRIT-001 to CRIT-004: Secrets committed in `.env` | Revoke & rotate all credentials, use env injection |
| **P1** | HIGH-002: Verbose errors leaking DB schema | Return generic errors, log server-side |
| **P1** | HIGH-003: Password reset tokens in URL params | POST-based or fragment-based submission |
| **P2** | MED-001: Role string comparison stale until token expiry | Token version checked against DB |
| **P2** | MED-002: Rate limiter trusts spoofable `X-Forwarded-For` | Use `c.ClientIP()` with trusted proxies |
| **P2** | MED-004: Missing security headers | Add secure headers middleware |
| **P3** | LOW-001: `RawAnalysis` stores LLM prompts + PII | Store only response, archive prompts separately |
| **P3** | LOW-002: Bcrypt cost 10 → 12+ | Bump constant |

---

## Critical

### CRIT-001: Production Database Credentials Exposed in `.env`
- **Location:** `server-go/.env:4`
- **Issue:** Live NeonDB PostgreSQL connection string with full credentials committed to repo.
  ```
  postgresql://neondb_owner:npg_mAs1Ed6NJURO@ep-lively-field-ao07m1fq-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```
- **Impact:** Full read/write access to database — all user data, credentials, evaluation data, PII.
- **Fix:** Revoke credentials immediately. Rotate all secrets. Use environment variable injection only.
- **Confidence:** HIGH

### CRIT-002: Weak JWT Signing Secret
- **Location:** `server-go/.env:5`
- **Issue:** `JWT_SECRET=S3CrEt123!!` — 12 characters, predictable pattern.
- **Impact:** Complete authentication bypass. Attacker can forge tokens with any role (`admin`, `company`, etc.).
- **Fix:** Generate cryptographically-random 256-bit secret via `openssl rand -base64 32`. Rotate immediately.
- **Confidence:** HIGH

### CRIT-003: Hardcoded LLM API Key
- **Location:** `server-go/.env:21`
- **Issue:** `LLM_API_KEY=sk-7fcec27cb6ee0538-1ouwgu-ae6a1416` — working API key for OpenAI-compatible LLM (base URL `http://202.155.90.174:20128/v1`).
- **Impact:** Financial loss from unauthorized usage. Candidate profile data leakage to third-party LLM.
- **Fix:** Revoke API key immediately. Use environment variable injection only at deploy time.
- **Confidence:** HIGH

### CRIT-004: Weak Admin Seed Password
- **Location:** `server-go/.env:16`
- **Issue:** `ADMIN_PASSWORD=pass123!`.
- **Impact:** Admin account (`admin@skillpass.com` / `pass123!`) compromisable if used beyond local dev (staging, demo, CI).
- **Fix:** Ensure seed runs only on disposable dev databases. Force password change on first login for seed accounts.
- **Confidence:** HIGH

---

## High

### HIGH-001: JWT Token in URL Query Parameter for SSE Fallback
- **Location:** `server-go/internal/middleware/auth.go:31-37`
- **Issue:** When `Authorization` header is missing, middleware falls back to reading `?token=` query param (to support `EventSource`/SSE which cannot set custom headers).
  ```go
  token := c.Query("token")
  if token == "" {
      c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
      return
  }
  auth = "Bearer " + token
  ```
- **Impact:** JWT tokens leaked in web server access logs, browser history, referrer headers, proxy/CDN logs.
- **Fix:** Use short-lived exchange token, WebSocket (supports custom headers), or same-site session cookie with `withCredentials`.
- **Confidence:** HIGH

### HIGH-002: Verbose Error Messages Leak Internal DB Errors
- **Locations:**
  - `server-go/internal/handlers/search.go:99` — `fmt.Sprintf("search failed: %v", err)`
  - `server-go/internal/handlers/search.go:117` — `fmt.Sprintf("scan failed: %v", err)`
  - `server-go/internal/handlers/search.go:123` — `fmt.Sprintf("rows error: %v", err)`
  - `server-go/internal/handlers/search.go:158` — `fmt.Sprintf("failed to load experiences: %v", err)`
  - `server-go/internal/handlers/search.go:169` — `fmt.Sprintf("scan experience: %v", err)`
  - `server-go/internal/handlers/companies.go:101` — `fmt.Sprintf("Invalid user ID: %v", err)`
  - `server-go/internal/middleware/auth.go:89` — `fmt.Sprintf("Invalid user ID: %v", err)`
- **Issue:** Raw database/sql errors (column names, table structures, constraint violations, query syntax) directly serialized into JSON error responses returned to the client.
- **Impact:** Attacker can probe API with malformed input and learn DB schema details, column names, enum values, aiding SQL injection.
- **Fix:** Log full error server-side (`slog.Error`), return only generic `"Internal server error"` to client. Never include `err.Error()` or `%v` in API response bodies.
- **Confidence:** HIGH

### HIGH-003: Password Reset & Email Verification Tokens in URL Query Params
- **Locations:**
  - `server-go/internal/handlers/auth_recovery.go:29` — `verifyURL := email.AppBaseURL() + "/auth/verify-email?token=" + raw`
  - `server-go/internal/handlers/auth_recovery.go:170` — `resetURL := email.AppBaseURL() + "/auth/reset-password?token=" + raw`
- **Impact:** Token leakage via Referer headers when navigating to external sites, email client tracking pixels/link scanners, web server/proxy logs, browser history synced across devices.
- **Fix:** Use POST-based token submission (token in request body, not URL). Or use URL fragments (`#token=...`) not sent to servers (requires JS to extract).
- **Confidence:** HIGH

### HIGH-004: Same JWT Secret for Access and Refresh Tokens
- **Location:** `server-go/internal/handlers/auth.go:94-118`
- **Issue:** Both access tokens (15min TTL) and refresh tokens (7 day TTL) signed with same `h.jwtSecret`.
  ```go
  accessToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, ...).SignedString([]byte(h.jwtSecret))
  refreshToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, ...).SignedString([]byte(h.jwtSecret))
  ```
- **Impact:** If JWT secret compromised, attacker forges both access tokens and long-lived refresh tokens. Separate keys limit blast radius.
- **Fix:** Use separate secrets for access and refresh tokens. Store refresh signing secret in Config struct.
- **Confidence:** HIGH

---

## Medium

### MED-001: Role Enforcement Uses String Comparison from JWT Claims
- **Location:** `server-go/internal/middleware/auth.go:63-71`
- **Issue:** `RequireRole` does direct string comparison against JWT `role` claim. Role set at token creation, never re-verified against DB.
  ```go
  userRole, exists := c.Get("role")
  if !exists || userRole.(string) != role {
      c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
  }
  ```
- **Impact:** Role changes (e.g., admin demoting a user) ineffective until token expires — up to 15m for access, 7 days for refresh.
- **Fix:** Implement "token version" claim (`jti` or custom `tokenVersion`) checked against DB on each request, or at least on the refresh endpoint.
- **Confidence:** HIGH

### MED-002: Rate Limiter Trusts `X-Forwarded-For` Without Validation
- **Location:** `server-go/internal/middleware/ratelimit.go:86-98`
- **Issue:** `clientIP()` uses `X-Forwarded-For` header preferentially over actual connection IP, with no validation or trusted proxy configuration.
  ```go
  func clientIP(c *gin.Context) string {
      if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
          if i := strings.IndexByte(xff, ','); i >= 0 {
              return strings.TrimSpace(xff[:i])
          }
          return strings.TrimSpace(xff)
      }
      // fallback to RemoteAddr
  }
  ```
- **Impact:** Attacker spoofs `X-Forwarded-For` to bypass rate limiting on auth endpoints (register, login, refresh, forgot-password, reset-password). Each spoofed IP resets rate limiter.
- **Fix:** Only trust `X-Forwarded-For` from known reverse proxies. Use `c.ClientIP()` with `c.SetTrustedProxies()`.
- **Confidence:** MEDIUM

### MED-003: SSRF Protection on Webhooks is DNS-Based (Bypassable)
- **Location:** `server-go/internal/webhook/service.go:54-82`
- **Issue:** DNS resolution check for private IPs — bypassable via DNS rebinding, hostnames resolving to different IPs on subsequent lookups, or internal DNS names.
  ```go
  ips, err := net.LookupHost(host)
  for _, ipStr := range ips {
      if ip.IsPrivate() || ip.IsLoopback() || ... {
          return fmt.Errorf("URL must not point to a private or internal network address")
      }
  }
  ```
- **Impact:** Company with webhook access could bypass protection and make server send requests to internal services (cloud metadata endpoints like `http://169.254.169.254/`).
- **Fix:** In addition to DNS validation: enforce connection timeout (already: 10s), create URL allowlist, use dedicated HTTP client with `DialContext` that re-resolves IPs at connection time.
- **Confidence:** MEDIUM

### MED-004: No Security Headers
- **Location:** `server-go/cmd/server/main.go:73-81`
- **Issue:** Gin router created with `gin.Default()` (Logger + Recovery), but no security headers middleware. Missing:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (or `SAMEORIGIN`)
  - `Content-Security-Policy`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security` (for HTTPS)
- **Impact:** Clickjacking, MIME-type confusion, referrer leakage.
- **Fix:** Add security headers middleware (`github.com/unrolled/secure` or custom `gin.HandlerFunc`).
- **Confidence:** MEDIUM

---

## Low

### LOW-001: `RawAnalysis` Stores Full LLM Prompts Including PII
- **Location:** `server-go/internal/evaluation/service.go:170-171`
- **Issue:** Stores `system: <systemPrompt>\n\nuser: <userPrompt>\n\nllm_facts: <result>` — complete system prompt (internal instructions) + user prompt (full profile data: skills, experience descriptions) in DB.
  ```go
  rawAnalysis := fmt.Sprintf("system: %s\n\nuser: %s\n\nllm_facts: %s",
      systemPrompt, userPrompt, mustMarshal(llmResult.Skills))
  ```
- **Impact:** Excessive PII storage. Data breach or API leak exposes full content sent to LLM, including sensitive resume/experience info. System prompt reveals internal business logic.
- **Fix:** Store only raw LLM response (facts JSON). Move full prompts to separate archival table with stricter access controls.
- **Confidence:** HIGH

### LOW-002: Bcrypt Cost at Lower Boundary
- **Location:** `server-go/internal/lib/password.go:14`
- **Issue:** `const BcryptCost = 10`. Modern hardware computes ~100-200 hashes/sec at this cost. OWASP recommends 12-14 for new deployments. (AGENTS.md mentions "cost 4 for dev" — verify dev value not accidentally used in production.)
- **Impact:** Marginal — brute-forcing at cost 10 still impractical for most attackers. Defense-in-depth improvement.
- **Fix:** Increase to `BcryptCost = 12` or higher.
- **Confidence:** LOW

---

## Needs Verification

### VERIFY-001: Refresh Token Cookie Secure Flag Depends on Environment
- **Location:** `server-go/internal/handlers/auth.go:137`
- **Issue:** `secure := os.Getenv("COOKIE_SECURE") == "true" || os.Getenv("GIN_MODE") == "release"` — verify production deployment sets either `COOKIE_SECURE=true` or `GIN_MODE=release`. Without it, refresh tokens transmitted over unencrypted HTTP.

### VERIFY-002: Login Does Not Check `is_verified`
- **Location:** `server-go/internal/handlers/auth.go:296-343`
- **Issue:** `Login` authenticates users regardless of `is_verified` status. May be intentional design choice, but weakens email verification mechanism.
