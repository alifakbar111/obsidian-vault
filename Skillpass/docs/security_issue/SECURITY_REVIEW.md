# Security Review: SkillPass (Phase 1)

**Date**: 2026-05-23
**Scope**: Server (`server/src/`) and Web (`web/src/`) — all Phase 1 routes, pages, and infrastructure config.
**Methodology**: OWASP Cheat Sheet Series (CC BY-SA 4.0) — high-confidence findings only.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 1 |
| Medium   | 3 |
| Low      | 1 |
| **Total** | **6** |

---

## Findings

### [VULN-001] Admin Authorization Bypass (Critical)

- **Location**: `server/src/routes/admin.ts:10-16`
- **Confidence**: High
- **Issue**: The `.resolve()` hook only verifies the JWT is valid — it never checks for an admin role. There is **no admin role in the system** (the `role` enum in `schema.ts:4` only has `'jobseeker' | 'company'`). Any registered user can call these endpoints.
- **Impact**: Any authenticated user can view all pending company verification requests (with sensitive business documents), approve their own company, or reject competitors.
- **Evidence**:
  ```ts
  // admin.ts:10-16 — no role check at all
  .resolve(async ({ headers, jwt: j, error }) => {
      const auth = headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) return error(401, 'Unauthorized');
      const payload = await j.verify(auth.slice(7));
      if (!payload) return error(401, 'Unauthorized');
      return { userId: payload.userId as string };  // ← no admin check
  })
  ```
- **Fix**: Add an `admin` role to the DB enum, restrict these endpoints to admin-only users, and seed at least one admin account.

---

### [VULN-002] Hardcoded JWT Secret in Docker Compose (High)

- **Location**: `docker-compose.yml:27`
- **Confidence**: High
- **Issue**: The JWT secret is hardcoded as `skillpass-dev-secret` in the docker-compose file committed to the repo. The code defaults (in 6 route files) also use `'skillpass-dev-secret-change-in-prod'` — a different but equally hardcoded fallback.
- **Impact**: Anyone with access to the repo can forge valid JWTs for any user, gaining full access to the platform as any role.
- **Evidence**:
  ```yaml
  environment:
    JWT_SECRET: skillpass-dev-secret
  ```
- **Fix**: Use Docker secrets or an env file not committed to git. Generate a strong random secret in production. Remove fallback defaults from source code — fail hard if `JWT_SECRET` is not set.

---

### [VULN-003] JWT Secret Default Fallback in 6 Route Files (Medium)

- **Location**:
  - `server/src/routes/auth.ts:7`
  - `server/src/routes/profiles.ts:6`
  - `server/src/routes/jobs.ts:6`
  - `server/src/routes/companies.ts:6`
  - `server/src/routes/admin.ts:6`
  - `server/src/routes/search.ts:6`
- **Confidence**: High
- **Issue**: Every route file redundantly defines `const JWT_SECRET = process.env.JWT_SECRET || 'skillpass-dev-secret-change-in-prod'`. If even one file's env var is unset in production, it silently uses a known default string.
- **Impact**: An attacker who knows this default can forge JWTs for that specific route group.
- **Fix**: Centralize `JWT_SECRET` in one place (e.g., a config module) and remove the fallback — throw on missing env var.

---

### [VULN-004] User Enumeration via Registration (Medium)

- **Location**: `server/src/routes/auth.ts:18-20`
- **Confidence**: High
- **Issue**: Register returns `409 "Email already registered"` revealing whether an email exists. The login endpoint correctly uses generic `"Invalid credentials"`, so the inconsistency makes enumeration trivial.
- **Impact**: Attacker can build a list of registered emails on the platform.
- **Evidence**:
  ```ts
  if (existingUser.length > 0) {
    return error(409, 'Email already registered');  // ← leaks existence
  }
  ```
- **Fix**: Return the same generic error as login (e.g., `400 "Registration failed"`) regardless of whether the email already exists.

---

### [VULN-005] No Rate Limiting on Auth Endpoints (Medium)

- **Location**: `server/src/routes/auth.ts` — login (line 57), register (line 11), refresh (line 85)
- **Confidence**: High
- **Issue**: No rate limiting on any auth endpoint. Login is vulnerable to brute-force password guessing, register to account creation spam.
- **Impact**: Unlimited login attempts enable credential stuffing and brute-force attacks.
- **Fix**: Add rate limiting middleware (e.g., 5 attempts/minute on login, 3 registrations/hour per IP).

---

### [VULN-006] Logout Does Not Invalidate Tokens (Medium)

- **Location**: `server/src/routes/auth.ts:102-104`
- **Confidence**: High
- **Issue**: The logout handler returns a success message without revoking the refresh token. The refresh token remains valid for its full 7-day TTL.
- **Impact**: A stolen refresh token continues working even after the user "logs out". There is no mechanism to revoke sessions.
- **Evidence**:
  ```ts
  .post('/logout', async () => {
    return { message: 'Logged out' };  // ← no token invalidation
  })
  ```
- **Fix**: Maintain a token blacklist (redis or DB table) and check it during `/refresh` and protected routes.

---

## Areas Investigated (No Issues Found)

| Area | Result |
|------|--------|
| **XSS** | All 7+ frontend pages use standard React JSX — React auto-escapes all output. No `dangerouslySetInnerHTML` or `innerHTML` assignments. |
| **SQL Injection** | All queries use Drizzle ORM with parameterized queries. No raw SQL or `sql` template literals with user input. |
| **Password Storage** | Uses `Bun.password.hash` with bcrypt (cost=10) — industry standard. |
| **IDOR on Profiles** | All CRUD operations scope to the authenticated user's `userId`. |
| **Authorization on Jobs** | Company routes verify `payload.role !== 'company'` and check ownership. |
