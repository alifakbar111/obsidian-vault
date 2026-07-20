# Code Review — SkillPass (full project)

**Date:** 2026-06-04
**Scope:** Go/Gin backend (`server-go/`) + React 19 SPA (`web/`)
**Method:** Three parallel reviews — backend security, backend correctness/performance, frontend.

---

## Summary

A well-structured codebase with solid foundations — parameterized queries via go-jet, Zod validation, ProtectedRoute gating, RBAC middleware. However, **authentication has critical flaws** (access tokens never expire, refresh tokens never rotate, logout is a no-op), several endpoints are vulnerable to DoS via unbounded queries, and a few patterns can panic the server. The frontend has token-storage and accessibility gaps. None of these are show-stoppers individually, but the auth issues should be fixed before any production exposure.

---

## 🔴 Critical

| # | File:Line | Issue |
|---|---|---|
| 1 | `server-go/internal/handlers/auth.go:62-69` | **Access tokens have no `exp` claim** → stolen token is valid forever. Middleware (`middleware/auth.go:23-49`) cannot reject expired tokens because there's nothing to check. |
| 2 | `server-go/internal/handlers/auth.go:240-288` | **Refresh tokens never rotate or revoke**, and `Logout` (line 286) is a no-op. A leaked refresh token is valid 7 days and reusable infinitely. |
| 3 | `server-go/cmd/seed/main.go:90,99,106` | **Hardcoded admin credentials** `admin-skillpass@yopmail.com / admin123!!` seeded into every environment and logged to stdout. Catastrophic if seed ever runs in prod. |
| 4 | `server-go/internal/handlers/auth.go:254` | Unchecked type assertion `(*claims)["userId"].(string)` — malformed-but-signed token **panics the server** (500 + stack trace). Same risk pattern elsewhere in refresh. |

## 🟠 High

| # | File:Line | Issue |
|---|---|---|
| 5 | `server-go/internal/handlers/auth.go:26-37,84` | Mass-assignment: `Role` taken from request body — anyone can self-register as `company`. Register also lacks `email` validator and password min-length. |
| 6 | `server-go/cmd/server/main.go` | No rate limiting on `/auth/login`, `/auth/register`, `/auth/refresh`. Combined with distinct `"Email already registered"` vs `"Invalid credentials"` (auth.go:108) = trivial user enumeration + credential stuffing. |
| 7 | `server-go/internal/handlers/auth.go:138-164` | Register creates user + profile + company across separate statements with **no transaction** — partial failure leaves orphan rows. |
| 8 | `server-go/internal/handlers/admin.go:87-158` | Approve/reject not wrapped in a transaction; second UPDATE error is **silently discarded** (line 129-133) — response reports success even on failure. No audit log. |
| 9 | `server-go/internal/handlers/search.go:46-189` | Classic **N+1**: 2 queries per profile inside loop, no DB-side filtering, no LIMIT. DoS vector + correctness bug. |
| 10 | `server-go/internal/handlers/jobs.go:91-117`, `admin.go:62-85` | List endpoints unbounded — no LIMIT/pagination on jobs or pending verifications. |
| 11 | `server-go/cmd/migrate/main.go:69-91` | Each migration runs **without an enclosing transaction**; verification only checks the `users` table exists, so silent skips are possible after failure. |
| 12 | `web/src/lib/api.ts:34-68` | No single-flight on token refresh — concurrent 401s race; only one wins, others may clear tokens. Also doesn't read the new `refreshToken` if backend rotates it. |
| 13 | `web/src/lib/api.ts:4-11` | Both access and refresh tokens in `localStorage` — full XSS exposure. Refresh token should be httpOnly cookie. |

## 🟡 Medium

| # | File:Line | Issue |
|---|---|---|
| 14 | `server-go/internal/handlers/auth.go:202-211` | **Timing oracle** on login: bcrypt only runs when email exists → response-time enumeration. Run a dummy bcrypt on miss. |
| 15 | `server-go/internal/handlers/auth.go:240`, `middleware/auth.go:31` | JWT parser doesn't pin the signing algorithm — defense-in-depth against `alg:none` / HS-vs-RS confusion. |
| 16 | `server-go/internal/middleware/auth.go:76` | `RequireVerifiedCompany` uses `context.Background()` instead of `c.Request.Context()` — request cancellation/timeout not propagated. |
| 17 | `server-go/internal/handlers/passport.go:31-98` | `GetProfile` by username is **public** (registered outside auth group in `main.go:64`). Exposes full work history. Confirm intent. |
| 18 | `server-go/internal/handlers/profiles.go:210-211` | User-controlled `Slug` written with no format/blocklist — enables passport URL squatting (`/profiles/admin`). |
| 19 | `server-go/internal/handlers/companies.go:170-190` | `GetVerificationStatus` returns `200 OK + "none"` on any DB error — masks real failures. |
| 20 | `server-go/internal/handlers/*.go` (multiple) | `err != nil` from queries returns 404; should distinguish `sql.ErrNoRows` from DB errors (companies.go:84, profiles.go:130, admin.go:106). |
| 21 | `server-go/internal/handlers/jobs.go:108,158` | List ordered `CreatedAt.ASC()` — almost certainly intended `DESC`. |
| 22 | `server-go/internal/handlers/profiles.go:25` | `StartDate string` has no date-format validation; passed straight to DB. |
| 23 | `web/src/pages/PublicJobs.tsx:28`, `PublicPassport.tsx:31`, `JobseekerPassport.tsx:33` | URL params interpolated **without `encodeURIComponent`** — breaks on `&`, spaces; potential URL injection. Use `URLSearchParams`. |
| 24 | `web/src/hooks/useAuth.tsx:88` | Context value rebuilt every render — every consumer re-renders on any state change. Wrap in `useMemo`. |
| 25 | `web/src/hooks/useAuth.tsx` | No `storage` event listener → stale auth across tabs after logout. |
| 26 | `web/src/components/layout/Navbar.tsx:65` | `aria-expanded="false"` hard-coded — never reflects `dropdownOpen` state. |
| 27 | `web/src/components/layout/Navbar.tsx:72-94` | Dropdown has no outside-click handler; invalid menu semantics (missing `role="menu"`/`role="menuitem"`). |
| 28 | `web/src/components/layout/RootLayout.tsx` | No focus management on route change; `main[tabIndex=-1]` never programmatically focused. |
| 29 | `web/src/pages/Register.tsx:84` | Conditional `register('companyName') \| register('name')` — switching role leaves stale RHF state. Use `shouldUnregister`. |
| 30 | `web/src/lib/api.ts:19-22,88-90` | Auth detection by string-matching error message is brittle; raw server response thrown as `Error.message` leaks internals. Use status codes + parsed `{error}`. |
| 31 | `web/src/pages/*.tsx` (most) | Fetches don't cancel on unmount — `setState` after unmount in StrictMode. Use `AbortController`. |
| 32 | `web/src/lib/schemas/index.ts:14` | Password min length 6 — too weak. Server should also enforce. |

## 🟢 Low / Suggestions

- `server-go/internal/lib/password.go:14-19` — `BcryptCost = 4` declared but unused; remove or wire via config.
- `server-go/internal/config/config.go:21` — `DATABASE_URL` falls back to hardcoded local creds; should fail-closed like `JWT_SECRET`.
- `server-go/internal/handlers/jobs.go:244-246` — `Status` accepted without `oneof` validator.
- `server-go/internal/db/db.go:18-19` — no `SetConnMaxLifetime` / `SetConnMaxIdleTime`.
- Suggested indexes: `companies(user_id)`, `companies(verification_status)`, `job_experiences(profile_id)`, `job_postings(company_id, status)`.
- `web/src/App.tsx:32-145` — `<Suspense>` repeated per route; wrap once around `<Outlet/>` in `RootLayout`. `Protect` wrapper is unnecessary indirection.
- `web/src/pages/CompanyJobs.tsx:54-61`, `CompanyProfile.tsx:28` — `.catch(() => {})` / `console.error` only; failures silently swallowed.
- `web/src/components/ui/ErrorBoundary.tsx:32` — full reload destroys SPA state; consider a reset handler.
- `web/src/pages/CompanyProfile.tsx:46-51` — no success feedback after save.

---

## ✅ What looks good

### Backend
- All DB access via go-jet parameterized builders — no SQL injection surface.
- `JWT_SECRET` panics if missing — no insecure default.
- Argon2id verification uses `crypto/subtle.ConstantTimeCompare`.
- Bcrypt default cost (10) for new hashes; argon2id fallback preserved cleanly.
- RBAC composition is clean: `AuthRequired` → `RequireRole` → `RequireVerifiedCompany`.
- Per-resource ownership enforced on writes (jobs.go:254-255, profiles.go:362-363) — no IDOR seen.
- `RowsAffected` checked for 404 correctness on delete/update.
- CORS allowlisted origin (not `*`) with credentials.
- `passwordHash` never returned in any response.

### Frontend
- Consistent `api()` wrapper — no raw `fetch` in pages.
- Zod + react-hook-form + zodResolver everywhere — strong validation pattern.
- `ProtectedRoute` correctly handles loading/unauth/role mismatch with `<Navigate replace>`.
- Route-level code splitting via `lazy()` + `Suspense`.
- No `dangerouslySetInnerHTML` — all user content is text (XSS-safe).
- Lucide icons consistently `aria-hidden`; icon-only buttons have `aria-label`.
- `autoComplete` set on auth forms; same-origin `/api` in prod removes CORS.

---

## Verdict

**Request Changes.** Fix the 4 critical items (token expiry, refresh rotation, seeded admin creds, panic-on-bad-token) and the high-severity auth + DoS items (#5–#13) before any production exposure. The rest can land in follow-up PRs.

### Top 5 priorities
1. Add `exp` to access tokens (15 min) + enforce with `jwt.WithExpirationRequired()`.
2. Refresh-token rotation + DB-backed revocation list; make `Logout` actually invalidate.
3. Remove hardcoded admin from `cmd/seed`; require `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars.
4. Rate-limit auth endpoints + constant-time login + generic register response.
5. Replace `handlers/search.go` N+1 with a single JOIN + add `LIMIT`/pagination to all list endpoints.
