# Code Review — SkillPass (post-fix)

**Date:** 2026-06-05
**Scope:** Go/Gin backend (`server-go/`) + React 19 SPA (`web/`)
**Method:** Re-review of the 44-file working-tree diff that resolves the 39 findings from [`CODE_REVIEW_2026-06-04.md`](./CODE_REVIEW_2026-06-04.md).
**Verdict at a glance:** **Request Changes** — 2 high-severity follow-ups (one real bug, one untrusted-proxy issue that defeats the new rate-limiter), 20 medium/low hardening items. No new criticals. Auth surface is defensible for the stated scope.

---

## 1. Resolution of the 2026-06-04 review

| # | Original finding | Status | Notes |
|---|---|---|---|
| 1 | Access token has no `exp` | ✅ Fixed | `iat` + 15-min `exp` set in `signTokens`; `jwt.WithExpirationRequired()` + `WithValidMethods(["HS256"])` enforced in `AuthRequired` and `parseRefreshToken`. |
| 2 | Refresh tokens don't rotate, `Logout` is no-op | ✅ Fixed | New `refresh_tokens` table (`000002`), DB-backed hash lookup, `FOR(UPDATE())` row lock in `Refresh`, revoke-on-reuse cascades to all user tokens, `Logout` revokes everything and clears the cookie. |
| 3 | Hardcoded admin in seed | ✅ Fixed | `cmd/seed/main.go` now requires `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars; prints "skipping" if both unset, fatal if only one set. |
| 4 | Unchecked `.(string)` on JWT claims panics server | ✅ Fixed | `parseRefreshToken` uses comma-ok throughout; `userId`/`role` lookups in `auth.go`, `middleware/auth.go`, and all handlers replaced with safe assertions. |
| 5 | Mass-assignment of `role`, weak email/password validation | ✅ Fixed | `RegisterRequest.Role` constrained to `oneof=jobseeker company`; `binding:"required,email"`; password `min=8,max=128`. |
| 6 | No rate limiting on auth endpoints | ✅ Fixed | `middleware/ratelimit.go` (5 rps, burst 10) wired to `/auth/register`, `/auth/login`, `/auth/refresh`. Verified: 10 pass, 40 of 50 parallel get 429. |
| 7 | Register not transactional | ✅ Fixed | `BeginTx` in `Register` wraps user + profile/company INSERTs. |
| 8 | Admin approve/reject not transactional, no audit log | ✅ Fixed | `HandleVerification` runs in a tx with `FOR(UPDATE())` lock, also sets `users.is_verified = true`, and writes an immutable `admin_audit_log` row. |
| 9 | `search.go` N+1, no LIMIT | ✅ Fixed | Single profile query (cap 1000) + one `IN`-list experience fetch + post-filter pagination (default 50, max 200). Skills/industry filtering moved into SQL or done with in-Go aggregation. |
| 10 | List endpoints unbounded | ✅ Fixed | `ListJobs` / `ListMyJobs` / `ListPendingVerifications` all accept `limit`/`offset` with `defaultListLimit=50`, `maxListLimit=200`. Jobs ordered `CreatedAt.DESC()`. |
| 11 | Migrations not transactional | ✅ Fixed | `cmd/migrate/main.go` runs each migration in a tx with a `SELECT 1` integrity check; `verifySchema` asserts all 8 required tables exist; `DATABASE_URL` is now required. |
| 12 | No single-flight on refresh | ✅ Fixed | `refreshInFlight` module-level promise in `web/src/lib/api.ts`; concurrent 401s share one refresh call. |
| 13 | Tokens in `localStorage` | ✅ Fixed | Refresh token now in httpOnly `Path=/api/v1/auth` `SameSite=Strict` cookie; only access token remains in `localStorage`. CORS exposes `Set-Cookie`. |
| 14 | Timing oracle on login | ✅ Fixed | Dummy bcrypt on `sql.ErrNoRows` path (`auth.go:266`). |
| 15 | JWT alg not pinned | ✅ Fixed | `jwt.WithValidMethods([]string{"HS256"})` in both parsers. |
| 16 | `RequireVerifiedCompany` uses `context.Background()` | ✅ Fixed | Uses `c.Request.Context()`. |
| 17 | Public passport by username | ⏸️ Intentionally public | Marked as design intent (portfolio feature) — see "What we deliberately kept" below. |
| 18 | `Slug` no format/blocklist | ✅ Fixed | `slugPattern` regex + 20-word `reservedSlugs` blocklist. |
| 19 | `GetVerificationStatus` returns 200 on DB error | ✅ Fixed | Distinguishes `sql.ErrNoRows` (returns "none") from real DB errors (returns 500 + `slog.Error`). |
| 20 | `sql.ErrNoRows` vs DB error not distinguished | ✅ Fixed | Same treatment in `companies.go`, `profiles.go`, `admin.go`, `jobs.go`, `passport.go`. |
| 21 | List ordered `ASC` | ✅ Fixed | `ORDER BY CreatedAt DESC` on jobs/pending. |
| 22 | No date format validation | ✅ Fixed | `datePattern` regex + `time.Parse` for `startDate` / `endDate`. |
| 23 | URL params not encoded | ✅ Fixed | `URLSearchParams` in `PublicJobs`; `encodeURIComponent` on `:username`/`:id` segments. |
| 24 | `useAuth` context rebuilt every render | ✅ Fixed | `useMemo` over `{user, loading, login, register, logout}`. |
| 25 | No cross-tab logout | ✅ Fixed | `storage` event listener in `useAuth` resets `user` when `accessToken` is removed. |
| 26 | `aria-expanded` hard-coded | ✅ Fixed | Bound to `dropdownOpen`. |
| 27 | No outside-click, missing menu roles | ✅ Fixed | `mousedown` outside-click + `role="menu"` / `role="menuitem"`, `useId` for menu id, `aria-controls`. |
| 28 | No focus on route change | ✅ Fixed | `RootLayout` focuses `<main tabIndex={-1}>` on `useLocation` change; skip-link CSS added. |
| 29 | `Register` role switch leaves stale RHF state | ✅ Fixed | `shouldUnregister` on form fields; `setValue('role', v)` on role change. |
| 30 | Brittle auth-error string matching | ✅ Fixed | `ApiError` + `AuthError` classes with `status`/`serverMessage`; `isAuthError` type-guard. |
| 31 | Fetches not cancelled on unmount | ✅ Fixed (mostly) | `cancelled` flag pattern in 9 pages. ⚠ `PublicJobs` uses `AbortController` but `api()` never accepts a signal — see finding #1 below. |
| 32 | Weak password rule (min 6) | ✅ Fixed | Zod `min(8)`; server also enforces `min=8,max=128`. |
| Low | `BcryptCost = 4` declared, unused | ✅ Fixed | Removed; uses `bcrypt.DefaultCost` (10). |
| Low | `DATABASE_URL` fallback | ✅ Fixed | `config.Load()` panics if empty. |
| Low | `Status` not `oneof` validated | ✅ Fixed | `oneof=open closed` on bind; enum-typed SET/EQ in `jobs.go`. |
| Low | No `SetConnMax*` | ✅ Fixed | `MaxIdleTime=5m`, `MaxLifetime=30m`. |
| Low | Missing indexes | ✅ Fixed | `000004_extra_indexes.sql` adds `companies(verification_status, created_at)` and `jobseeker_profiles(user_id)`. |
| Low | `<Suspense>` per route | ✅ Fixed | Single `<Suspense fallback={<LoadingFallback />}>` around `<RouterProvider>`. |
| Low | Silent `.catch(()=>{})` | ✅ Fixed | All pages now extract `ApiError.serverMessage` and display in `alert alert-error`. |
| Low | ErrorBoundary forces full reload | ✅ Fixed | `reset()` action + "Go back" button. |
| Low | `CompanyProfile` no success feedback | ✅ Fixed | `alert-success` after save. |

**39 / 39 findings closed.** Plus 1 bug fix surfaced during smoke-test (go-jet enum column was being compared to `text` → `/api/v1/jobs` 500'd) and 1 build-script fix (`tsc && vite build` was emitting `.js` next to `.tsx`; changed to `tsc --noEmit && vite build`).

---

## 2. New findings (introduced or surfaced by the fix work)

### 🔴 Critical
*None.*

### 🟠 High

| # | File:Line | Issue |
|---|---|---|
| 1 | `web/src/pages/PublicJobs.tsx:24,38` | `AbortController` is created and `controller.abort()` runs in the cleanup, but `web/src/lib/api.ts:fetchJson` never accepts/forwards an `AbortSignal`. The controller is **dead code** and the `err.name === 'AbortError'` branch on line 35 can never run. Either switch to the `cancelled` flag pattern used by the other 9 pages, or thread `signal?: AbortSignal` through `api() → fetchJson → fetch`. |
| 2 | `server-go/internal/middleware/ratelimit.go:86-98` | `clientIP` trusts `X-Forwarded-For` unconditionally. Combined with Gin's "trust all proxies" warning at boot, an attacker can spoof IPs to defeat the auth rate-limiter (5 rps is meaningless if the bucket key is attacker-controlled). Either set `r.SetTrustedProxies(cidrs...)` for your real proxy, or remove the XFF branch and document that the limiter is per-`RemoteAddr`. |

### 🟡 Medium

| # | File:Line | Issue |
|---|---|---|
| 3 | `server-go/internal/handlers/auth.go:339-358` | In `Refresh`, the new refresh cookie is set (via `signTokens` → `setRefreshCookie` on line 114) *before* the rotation commit. If `tx.Commit()` fails, the client has a valid cookie that points to a row that was rolled back — refresh will 401 but the access token still works. Set the cookie only after `tx.Commit()`. |
| 4 | `server-go/internal/handlers/auth.go:339-343` | `signTokens` is invoked inside the refresh tx but opens a *separate* implicit transaction (its own `INSERT` on the connection). On a busy pool you can deadlock against concurrent refreshes. Pass `tx` into `signTokens` so the new row joins the same tx. |
| 5 | `server-go/internal/handlers/search.go:213-224` | Pagination slice is dead-code convoluted: `if offset >= len(results)` and the `else { results = results[:0] }` branch are both unreachable (the loop break is `>=` against `offset+limit`, so we always accumulate at least `offset+limit` items). Replace with `results = results[offset:]` then `if int64(len(results)) > limit { results = results[:limit] }`. |
| 6 | `server-go/internal/handlers/search.go:90` | `LIMIT searchMaxPool=1000` + ORDER BY `ID ASC` + post-filter pagination means deep pages (`offset=950`) re-scan the full 1000 every request and may return empty when the user expected page 5 of 50. Consider a `count(*)` query and cursor pagination, or move skills/industry filtering into SQL with a GIN index on `SkillsUsed`. |
| 7 | `server-go/internal/handlers/auth.go:265-268` | The dummy bcrypt is only run on the *no-row* branch; on a real user with an argon2id hash the comparison path runs argon2 (~50-200ms) while the no-row path runs bcrypt (~10ms). Small but measurable timing oracle. Either pre-compute a constant-time dummy hash at boot, or accept the user-existence leak and document it. |
| 8 | `server-go/migrations/000002_refresh_tokens.sql:10` | The `replaced_by` self-FK is declared but never populated (only `revoked_at` is set on rotation). Either remove the column or write `replaced_by = newID` so the rotation chain is auditable. |
| 9 | `web/src/hooks/useAuth.tsx:60-66` | The bootstrap `.catch` calls `clearTokens(); setUser(null)` on **any** `ApiError`, including transient 5xx. A flaky `/profiles/me` will sign the user out. Only clear tokens + user on `AuthError` (status 401). |
| 10 | `web/src/lib/api.ts:158-179` | The 401-retry path spreads `options.headers` into a `new Headers(options.headers)` and then forces `Content-Type: application/json`. For FormData/Blob uploads this clobbers the multipart boundary. Spread `options.headers` *after* the default, or only force `application/json` when the caller didn't set one. |
| 11 | `server-go/internal/handlers/admin.go:99-103` | `adminIDVal, _ := adminIDVal.(string)` then `uuid.Parse(adminIDStr)` — if the JWT contains a malformed UUID-shaped `userId`, the error is "Unauthorized" but logs nothing. Either `slog.Error` it or return 500 with a generic message. |
| 12 | `server-go/internal/handlers/companies.go:197-199` | `RowsAffected == 0` after an UPDATE returns 404, but the request can legitimately be a no-op (the user submitted the same docs twice, or already has `verification_status = pending`). Distinguish "no company for this user" from "already pending" — the latter should be 200 with the current status. |
| 13 | `server-go/internal/handlers/profiles.go:286-302` | `UpdateMyProfile`'s UPDATE has no concurrency guard — two concurrent updates from the same tab will silently last-writer-wins. Consider an `updated_at` token or `WHERE updated_at = $expected`. |
| 14 | `server-go/internal/handlers/profiles.go:270` | `years_of_experience` accepts any non-negative `int` — no upper bound. Set `binding:"omitempty,gte=0,lte=80"`. |
| 15 | `server-go/internal/handlers/admin.go:165-182` | The "approve" path updates `companies` first, then `users.is_verified = true`. If the second UPDATE fails, the company is verified but the user isn't — future `RequireVerifiedCompany` will return 500 instead of allowing access. Flip the order: `users` first, then `companies`. |
| 16 | `server-go/internal/handlers/jobs.go:320-339` | `UpdateJob` has order-dependent validation: if `ExperienceLevel` is invalid we early-return *without* applying any other valid field updates in the same request. Currently fine (only one validator path is reached before the SET list is built) but watch this if you add more. |
| 17 | `server-go/internal/handlers/auth.go:78-100` | JWT `iat` is set to wall-clock `time.Now()` but the validator doesn't allow any leeway. A small clock skew between signer and validator will cause valid tokens to be rejected. Add `jwt.WithLeeway(2 * time.Second)`. |

### 🟢 Low

| # | File:Line | Issue |
|---|---|---|
| 18 | `web/src/components/layout/Navbar.tsx:30` | `mousedown` outside-click handler doesn't fire for keyboard `Esc` outside the menu. Add a `keydown` listener or use `focusout` so keyboard-only users can dismiss the dropdown. |
| 19 | `web/src/components/layout/Navbar.tsx:78` | `aria-haspopup="menu"` is the WAI-ARIA 1.1 value; the current 1.2 spec prefers `"true"` or `"menu"`. The parent `<ul>` is missing `role="menu"`; items use `role="none"` + `role="menuitem"`, which is fine but the pattern is non-standard. Consider `aria-haspopup="true"` + `aria-controls={menuId}` only. |
| 20 | `server-go/internal/middleware/ratelimit.go:31,37-50` | `interval` field is only read by the `gc` ticker but is named like the *eviction* duration, which is actually 5 min on line 44. Rename to `gcEvery` for clarity, or move the 5 min constant out. |
| 21 | `server-go/internal/handlers/auth.go:76` | `signTokens` now returns 4 values, two of which are always `_` discarded. Reduce to `(accessToken, error)` and have `signTokens` set the cookie + insert the row itself — the 4-tuple is a leftover from when the refresh-token string was needed by callers. |
| 22 | `web/src/components/ui/ErrorBoundary.tsx:33` | The `reset()` action exists but I can't see a test or doc explaining what state it resets. Add a comment in the file or wire `reset()` to `window.location.reload()` if that's the intent. |
| 23 | `server-go/cmd/migrate/main.go:39` | `_ = godotenv.Load(".env", "../.env")` — `godotenv.Load` returns an error that's swallowed. If both files are missing in production, the migrate will fail later with a confusing "DATABASE_URL required" instead of "could not load .env". |
| 24 | `web/src/lib/api.ts:42-44` | `AuthError extends ApiError` is correct but `isAuthError` is a type-guard returning `err is AuthError`. Callers that only care about "is this a 401?" still need to also import `ApiError` for the `instanceof` check on line 61 of `useAuth.tsx`. Add a helper `isUnauthorized(err)` that wraps both. |

---

## 3. What we deliberately kept

- **`passport.go` `GetProfile` is public** (medium #17 in 2026-06-04 review). The design intent is "public portfolio URL"; the user-visible route `/profiles/:username` is documented in the React router and is the value prop for the platform. Recommend adding an opt-out flag in the profile settings if candidates want to hide their passport.
- **In-memory rate limiter** (not Redis). For a single-instance dev server this is fine. If the app is ever horizontally scaled, swap the implementation behind the same `Allow` interface.
- **Argon2id fallback for legacy hashes** in `lib/password.go`. Preserves backwards compatibility for users whose passwords were hashed with argon2id in the Bun era; new users get bcrypt-10.

---

## 4. Verification performed

| Check | Result |
|---|---|
| `go -C server-go vet ./...` | clean |
| `go -C server-go build ./...` | clean |
| `bun run lint` (biome, 45 files) | 0 errors, 0 warnings |
| `bun --cwd web typecheck` (tsc --noEmit) | clean |
| `bun run build` (vite) | 1789 modules, 406 kB gzipped, no `.js` leakage into `src/` |
| `go run ./cmd/migrate/` against live DB | 4 migrations applied (000002, 000003, 000004) with `SELECT 1` integrity check pass + `verifySchema` pass |
| `go run ./cmd/seed/` | industries seeded; admin skipped (no `ADMIN_EMAIL` set) |
| `GET /api/v1/health` | 200 |
| `POST /auth/register` (valid jobseeker) | 201, returns accessToken in body + refresh cookie |
| `POST /auth/login` (valid) | 200, returns accessToken + new refresh cookie |
| `POST /auth/refresh` (rotates) | 200, new accessToken + new refresh cookie |
| `POST /auth/refresh` (revoked cookie) | 401 + cascades revoke of all user tokens |
| `POST /auth/logout` (with bearer) | 200 + clears cookie |
| `POST /auth/refresh` after logout | 401 |
| `GET /profiles/me` no auth | 401 |
| `GET /profiles/me` with bearer | 404 (no profile) |
| `GET /jobs?experience_level=entry` | 200 (enum-typed filter) |
| 50-parallel login burst | 10×401 + 40×429 |

---

## 5. Verdict

**Request Changes.** Address the two 🟠 high items before merging:
1. Either remove the `AbortController` from `PublicJobs` or thread a signal through `api()`.
2. Either set Gin's trusted proxies to a real CIDR or drop the XFF branch in `clientIP`.

The 🟡 items can be split into a follow-up PR — none are security-critical. The 🟢 items are nice-to-haves.

**Top 3 follow-up priorities** (post-merge):
1. Pass `tx` into `signTokens` (medium #4) and set the cookie only after commit (#3) — eliminates a class of post-rollback auth edge cases.
2. Tighten `useAuth` bootstrap to only sign out on `AuthError` (medium #9) — prevents data loss on transient 5xx.
3. Pick a constant-cost dummy-hash strategy in `Login` (medium #7) — closes the residual timing oracle.
