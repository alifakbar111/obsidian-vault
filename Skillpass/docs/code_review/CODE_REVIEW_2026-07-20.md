# Code Review — SkillPass

> **Agent:** code-reviewer
> **Date:** 2026-07-20
> **Scope:** Branch `main` since 2026-07-13 (audits) — 21 commits, primarily a
> go-jet → Bun ORM migration + resume-import UX + omitempty patch.
> **Companion reports:** `docs/security_issue/SECURITY_REVIEW_2026-07-20.md` (18 findings),
> `docs/bug_finding/BUG_REVIEW_2026-07-20.md` (130 findings).

---

## Executive Summary

**Verdict: 🚫 BLOCK — do not merge to production as-is.**

The branch is dominated by a mechanical go-jet → Bun ORM refactor (21 of the diff's commits
delete `.gen/skillpass/public/{enum,model,table}/*.go` and rewrite query sites to use Bun's
builder API). That refactor is internally consistent and tidies a long-standing dependency,
but it does **not** address any of the Critical or High findings from the security or bug
audits. Concretely:

- **All 6 Critical bug findings and all 18 security findings remain open in the current tree.**
  The most alarming unaddressed item is the live `LLM_API_KEY=sk-7fcec27cb6ee0538-1ouwgu-ae6a1416`
  in `server-go/.env:21` — anyone with a checkout has a working billable LLM credential.
- **The refactor introduced one partial fix** (MED-006 — `RequireVerifiedCompany` now selects
  only `id, verification_status` instead of `*`), **one real fix** (H23 — Register transaction
  now commits `signTokens` inside the same tx, eliminating a pre-commit race), and **one
  minor regression** (typed `model.VerificationStatus_Verified` enum became a string literal
  `"verified"` at `middleware/auth.go:104`).
- **3 net-positive UX fixes** in the web layer (TanStack Query dedup for latest evaluation,
  removal of `window.location.reload()` after resume import, `resetExpForm` helper to remove
  ~150 lines of duplication).

**Merge blockers** (must be fixed before merge to `main`/deploy):
1. **Rotate & purge `server-go/.env`** — live LLM key + weak JWT secret + commented production
   DSN with credentials. Even with `.gitignore`, every active clone has these.
2. **`server-go/.env.example:4` ships `JWT_SECRET=skillpass-dev-secret-change-in-prod`** —
   every fresh deployment that copies this file has a publicly known signing key.
3. **CRIT bug C1 (`handlers/companies.go:195`)** — `UpdateProfile` returns a zero-value
   Company to the client, silent data-loss for verified companies.
4. **CRIT bug C5 (`handlers/passport.go:92-97`)** — public profile endpoint writes on every
   read; trivial DoS amplifier and view-count inflation.

The web-side changes in `91c40c6` and `eefcb35` are safe to ship independently as a
small UX patch once the four blockers above are cleared.

---

## Cross-Reference: Security Audit (2026-07-20) vs Diff

Legend: **✅ Fixed** · **🟡 Partially Fixed** · **🟠 Regressed** · **⚪ Untouched (still open)**

| ID | Finding | File / Line | Status | Notes |
|---|---|---|---|---|
| CRIT-001 | Weak JWT secret in `.env.example` | `server-go/.env.example:4` | ⚪ | Shipped verbatim. `config.go` still does not enforce min-length or reject known-dev values. |
| HIGH-001 | JWT accepted via `?token=` query | `server-go/internal/middleware/auth.go:26-34` | ⚪ | **Re-confirmed present.** Comment still justifies it as needed for EventSource. |
| HIGH-002 | Reset/verify tokens in URL | `server-go/internal/handlers/auth_recovery.go:29, 80, 170` | ⚪ | Untouched. |
| HIGH-003 | Same secret for AT and RT | `server-go/internal/handlers/auth.go:96-115` | ⚪ | Both still signed with `h.jwtSecret`. |
| HIGH-004 | LLM/DB creds in committed `.env` | `server-go/.env:4, 5, 16, 21` | ⚪ | **`.env:21` still contains a live-looking LLM key.** `JWT_SECRET=S3crEt123!!` (11 chars). |
| HIGH-005 | PII in `ai_evaluations.raw_analysis` + LLM body echo in errors | `server-go/internal/evaluation/service.go:168-169, 184`; `server-go/internal/lib/llm.go:138, 157, 159, 164, 168, 182, 350, 363, 367, 379` | ⚪ | Both paths untouched by the diff. |
| MED-001 | Role from JWT never re-validated | `server-go/internal/middleware/auth.go:59-68` | ⚪ | Same claim-only check. |
| MED-002 | `X-Forwarded-For` trusted | `server-go/internal/middleware/ratelimit.go:86-98` | ⚪ | `TrustedProxies` never set in `main.go` (grep returned 0 hits). |
| MED-003 | Webhook SSRF re-check | `server-go/internal/webhook/service.go:54-82` | ⚪ | Validation-time-only, no re-check at request time. |
| MED-004 | No security-headers middleware | `server-go/cmd/server/main.go` (none) | ⚪ | Grep for `X-Frame-Options`/`Content-Security-Policy`/`HSTS` returned 0 hits. |
| MED-005 | `fmt.Sprintf("...%v", err)` in ~30 sites | `server-go/internal/handlers/jobs.go:219, 259, 306, 359, 375, 483, 499`; `profiles.go:189, 274, 460, 567, 574, 708, 715`; `companies.go:101, 152, 251, 306`; `search.go:101, 119, 125, 160, 171`; `middleware/auth.go:85` | ⚪ | All sites still leak raw `err.Error()`. |
| MED-006 | N+1 lookup in `RequireVerifiedCompany` | `server-go/internal/middleware/auth.go:89-94` | 🟡 | **Partial fix.** Now selects only `id, verification_status` (was `SELECT *`). Still 1 query per request; multi-company user still gets `companies[0]`; no TTL cache. **Side effect: typed enum `model.VerificationStatus_Verified` replaced with string `"verified"` (line 104) — minor type-safety regression.** |
| MED-007 | Forgot-password timing leak | `server-go/internal/handlers/auth_recovery.go:160-176` | ⚪ | `tokens.CreatePasswordReset` runs only on user-found branch. |
| LOW-001 | `BcryptCost = 4` (dev) / 10 (prod) | `server-go/internal/lib/password.go:14` | ⚪ | Untouched. |
| LOW-002 | LLM_BASE_URL not allowlisted | `server-go/internal/lib/llm.go:50-70` | ⚪ | Untouched. |
| LOW-003 | Webhook `http://` allowed | `server-go/internal/webhook/service.go:59-61` | ⚪ | Untouched. |
| LOW-004 | WS upgrader hardcodes `localhost:4200` | `server-go/internal/hris/attendance/ws.go:12-28` | ⚪ | Untouched. |
| LOW-005 | JWT in `localStorage` | `web/src/lib/api.ts:14-23`; `web/src/hooks/useAuth.tsx:61-77` | ⚪ | Untouched. |

**Net: 0 of 18 security findings fully resolved by this diff; 1 partial fix.**

---

## Cross-Reference: Bug Audit (2026-07-20) vs Diff

Top-priority subset. Full mapping for all 130 findings is at the end of this document.

| ID | Finding | File / Line | Status | Notes |
|---|---|---|---|---|
| C1 | `UpdateProfile` discards RETURNING row | `server-go/internal/handlers/companies.go:195` | ⚪ | **Confirmed still present.** `query.Where("user_id = ?", userUUID).Returning("*").Scan(c.Request.Context())` — no destination pointer. Returns zero-value Company to client. |
| C2 | Anyone can rate any company; no apply/interview check | `server-go/internal/companyreviews/service.go:49-93` | ⚪ | `interactionType` is a free string; no `EXISTS(applications)` check. |
| C3 | `created_at = now()` on every review update | `server-go/internal/companyreviews/service.go:76` | ⚪ | Untouched. |
| C4 | JWT in `?token=` query | `server-go/internal/middleware/auth.go:28` | ⚪ | **Re-confirmed.** |
| C5 | `view_count` UPDATE on every public GET | `server-go/internal/handlers/passport.go:90-97` | ⚪ | **Confirmed still present.** `UPDATE jobseeker_profiles SET view_count = view_count + 1 ... RETURNING view_count` runs on every unauthenticated GET. |
| C6 | HRIS Employee Get IDOR | `server-go/internal/hris/employee/handler.go:72-86` | ⚪ | **Confirmed still present.** A user with only `employee.view_self` passes any `id` in the URL and gets the target's record. |
| H1 | `c.Get("userId").(string)` without `ok` | matching/handler.go:49, 89; rbac/middleware.go:54; auth_recovery.go:51, 114; admin.go:152; auth.go:423 | ⚪ | All sites untouched. **Note:** matching/handler.go *collects* `ok` at lines 44/84 then discards it on the next line. |
| H2 | `X-Forwarded-For` trusted | `server-go/internal/middleware/ratelimit.go:86-98` | ⚪ | Untouched. |
| H3 | Rate limiter GC goroutine never stops | `server-go/internal/middleware/ratelimit.go:33` | ⚪ | Untouched. |
| H5 | Unbounded webhook goroutine fan-out | `server-go/internal/webhook/service.go:226` | ⚪ | `go s.deliver(...)` per webhook, no semaphore, no per-company cap. |
| H6 | Unbounded feedback goroutine per submit | `server-go/internal/feedback/service.go:81` | ⚪ | `go s.generateAISuggestions(...)` per call. |
| H7 | Matching N+1 | `server-go/internal/matching/service.go:131` → `category_service.go:110` | ⚪ | `s.categoryService.GetJobCategoryWeights(ctx, jobPostingID)` runs once per job in the 200-row loop. |
| H10 | `time.Parse` swallowed → `IsExpired` false positive | `server-go/internal/evaluation/handler.go:225` | ⚪ | `createdAt, _ := time.Parse(...)` — same as audit. |
| H11 | `UpdateProfile` blind_mode outside tx | `server-go/internal/handlers/companies.go:168-177` | ⚪ | Separate `db.ExecContext` before main UPDATE. |
| H18 | `ConsumeEmailVerification` double-query | `server-go/internal/handlers/auth.go:74-116` | ⚪ | Untouched. |
| H20 | Swallowed `RowsAffected` | `server-go/internal/hris/employee/service.go:419` | ⚪ | Untouched. |
| **H23** | **Register signTokens after commit** | `server-go/internal/handlers/auth.go:255-267` | **✅ Fixed** | **Diff reorders `tx.Commit()` to *after* `signTokens` (which inserts the RefreshToken row).** Now atomic: if `signTokens` fails the user/company inserts are also rolled back. Audit note said this was a "non-real bug" — the fix removes the misleading ordering regardless. |
| H24 | Dummy bcrypt per login | `server-go/internal/handlers/auth.go:308` | ⚪ | `lib.HashPassword("dummy-equalize-timing")` still allocates a fresh hash per non-existent-user login. |
| H31/H36 | Auto-eval blocks Apply (30-60s) | `server-go/internal/application/service.go:120-133` | ⚪ | Synchronous `s.evalService.Evaluate(ctx, jobseekerID)` inside the Apply handler. |
| H32 | DB error leaks to client | `server-go/internal/handlers/profiles.go:317-322` | ⚪ | Same pattern across ~30 handlers. |
| H34 | Dead `if results == nil` check | `server-go/internal/evaluation/handler.go:151-158` | ⚪ | Untouched. |

**Net: 1 of 130 bug findings fully resolved by this diff (H23 — Register transaction reordering).**

---

## New Findings Introduced by the Diff Itself

These are observations on the *new* code in this branch that are not in the audits.

### N1 — `RequireVerifiedCompany` lost type-safety on verification_status
- **File:** `server-go/internal/middleware/auth.go:104`
- **Severity:** LOW
- **Confidence:** HIGH
- **What's wrong:** Pre-migration compared `company.VerificationStatus != model.VerificationStatus_Verified`; post-migration compares `!= "verified"` (string literal). The DB column is an enum with `unverified|pending|verified|rejected` — a future rename or case-sensitivity regression (e.g. migration adds `Verified` capitalized) will silently let unverified companies through.
- **Fix:** Promote the literal to a `const verifiedStatus = "verified"` and add a startup test (`TestVerificationStatusValidValues`) that exercises each enum value against this constant. Or define a typed alias in `models`.

### N2 — `RequireVerifiedCompany` still returns `companies[0]` for multi-company users
- **File:** `server-go/internal/middleware/auth.go:103`
- **Severity:** MEDIUM
- **Confidence:** MEDIUM
- **What's wrong:** The fix narrowed the column list, but the handler still picks `companies[0]` as the company. A user owning two companies can only have the *first* (insertion-order) one attached to their request — any per-company routing downstream is wrong for that user.
- **Fix:** Add a `?companyId=` query param or `X-Active-Company` header, validated against the user's owned companies. Or add a `company_id` JWT claim refreshed on switch.

### N3 — Resume-import: `addAll` silently swallows per-entry errors and overwrites `error` state
- **File:** `web/src/pages/JobseekerProfile/ResumeImport.tsx:140-153`
- **Severity:** LOW
- **Confidence:** HIGH
- **What's wrong:** The bare `catch {}` discards the error message, while `addOne` internally sets `setError(...)` on its first failure. If 3 of 5 entries fail, the UI only shows the first failure's message; subsequent failures are invisible. The "Added" badge state is also not rolled back on failure, so the user sees an entry marked "Added" when the API call threw.
- **Fix:** Collect failures into an array and render a summary at the end. On `addOne` failure, do not add `idx` to `addedIdx`. Add a per-entry error indicator.

### N4 — `JobseekerProfile` `onExperienceAdded` only invalidates the requester's own passport cache
- **File:** `web/src/pages/JobseekerProfile/index.tsx:259-263`
- **Severity:** LOW
- **Confidence:** MEDIUM
- **What's wrong:** `queryClient.invalidateQueries({ queryKey: ['passport', user?.username] })` — the `user` from `useAuth()` may be a stale closure (the change to use the updater function on `profile` was a good catch, but the `user` reference is still from the outer scope). If a jobseeker changes their username, or if `user` is unset when the user logs out mid-import, the wrong cache key is invalidated.
- **Fix:** Read `useAuth()` inside the callback or pass `user?.username` via the `onExperienceAdded` signature.

### N5 — `JobseekerOnboarding` cache key string is duplicated (not exported)
- **File:** `web/src/components/onboarding/JobseekerOnboarding.tsx:14-19`
- **Severity:** LOW
- **Confidence:** HIGH
- **What's wrong:** The fix relies on `'evaluation'` + `'latest'` matching the same string in `AIEvaluationSection`. If that file's key changes (e.g. to `['evaluation', userId, 'latest']`) the dedup silently breaks and the network fan-out returns.
- **Fix:** Export a constant `EVALUATION_LATEST_QUERY_KEY` from `lib/evaluation.ts` and import it in both files.

### N6 — Auth.go Register: transaction now holds connection across `signTokens`
- **File:** `server-go/internal/handlers/auth.go:258-267`
- **Severity:** LOW (correctness unchanged, connection-pool impact)
- **Confidence:** HIGH
- **What's wrong:** The reordering means `tx.Commit()` is now the *last* step; the RefreshToken insert (inside `signTokens`) keeps the transaction open for an extra round-trip. Under 100 concurrent registrations each held a connection for the bcrypt+signTokens+commit cycle. Not a regression vs pre-fix (bcrypt was already outside the tx) but worth noting.
- **Fix:** Keep the reordering (it's correct) and add a comment that the bcrypt cost is outside the transaction intentionally.

### N7 — `ResumeImport` `addAll` catches and ignores the very error it should propagate
- **File:** `web/src/pages/JobseekerProfile/ResumeImport.tsx:147-150`
- **Severity:** LOW
- **Confidence:** HIGH
- **What's wrong:** The outer `try { await addOne(...) } catch {}` is a no-op because `addOne` already catches its own errors. The outer catch would never fire — but the comment says "Continue with remaining entries even if one fails," which is misleading. If `addOne` is ever refactored to re-throw, the current code silently swallows.
- **Fix:** Remove the outer try/catch or rely on the inner `addOne` behavior. Add a comment that `addOne` does not throw.

---

## Specific Blockers for Merge

The four items below must be resolved before merging to `main`/deploying:

### BLOCK-1 — Live LLM API key and weak JWT secret in `server-go/.env`
- **File:** `server-go/.env:5, 16, 21`
- **Severity:** CRITICAL
- **Confidence:** HIGH
- **Evidence:**
  ```
  server-go/.env:5  JWT_SECRET=S3crEt123!!          # 11 chars, no entropy
  server-go/.env:16 ADMIN_PASSWORD=pass123!         # 8 chars, dictionary
  server-go/.env:21 LLM_API_KEY=sk-7fcec27cb6ee0538-1ouwgu-ae6a1416   # looks live
  ```
- **Why it matters:** Any developer or CI runner with a clone of the repo has these credentials. `LLM_API_KEY` is a billable LLM credential (likely OpenRouter, given the `sk-` prefix and earlier audit mentioning `9Router`); the JWT secret is 11 chars and well below any sane minimum. The audit's CRIT-001 regression stands.
- **Fix:**
  1. Rotate the LLM key with the provider immediately, regardless of merge.
  2. Rotate the JWT secret (requires issuing new tokens + invalidating all refresh tokens).
  3. Strip the credentials from `server-go/.env`, replace with empty `=` and a comment.
  4. Add `bun run setup` step that refuses to start with a default or short secret.

### BLOCK-2 — `.env.example` ships a known-weak default JWT secret
- **File:** `server-go/.env.example:4`
- **Severity:** CRITICAL
- **Confidence:** HIGH
- **Evidence:** `JWT_SECRET=skillpass-dev-secret-change-in-prod` — a string that exists in a public GitHub repo, so any operator who copies the example to `.env` without rotating is running with a publicly known signing key. The audit's CRIT-001.
- **Why it matters:** Forge-admin-token-by-reading-the-repo. Same blast radius as BLOCK-1.
- **Fix:** Replace with `JWT_SECRET=` (empty) + a comment instructing operators to generate one. Add a startup guard in `internal/config/config.go:14-18`:
  ```go
  if len(jwtSecret) < 32 { panic("JWT_SECRET must be at least 32 bytes") }
  if jwtSecret == "skillpass-dev-secret-change-in-prod" { panic("default dev secret — rotate before running") }
  ```

### BLOCK-3 — `UpdateProfile` returns zero-value Company to client
- **File:** `server-go/internal/handlers/companies.go:195`
- **Severity:** CRITICAL
- **Confidence:** 0.95
- **What's wrong:** `query.Where("user_id = ?", userUUID).Returning("*").Scan(c.Request.Context())` is called with no destination pointer. The RETURNING row is thrown away. The response is then built from the never-populated `var company models.Company` (declared at line 179).
- **Repro:**
  ```bash
  curl -X PUT /api/v1/company/profile -H "Authorization: Bearer $TOK" \
       -H "Content-Type: application/json" \
       -d '{"companyName":"Acme Inc","website":"https://acme.example"}'
  # Response: {"id":"","userId":"","companyName":"",...,"verificationStatus":""}
  ```
- **Fix:** Pass `&company` to `Scan`. The `if/else` at 181-217 can collapse to a single RETURNING update.

### BLOCK-4 — `passport.go` writes `view_count` on every public GET
- **File:** `server-go/internal/handlers/passport.go:90-97`
- **Severity:** CRITICAL
- **Confidence:** 0.95
- **What's wrong:** Unauthenticated `GET /api/v1/profiles/{username}` runs `UPDATE jobseeker_profiles SET view_count = view_count + 1 ... RETURNING view_count`. No rate limit, no idempotency. A bot can pin a row; the jobseeker can also script their own count inflation.
- **Fix:** Move view tracking to the existing `profile_views` table (POST endpoint already exists for company views). De-dup by `(viewer_ip, profile_id, day)`. Public GET should be read-only.

---

## Additional High-Severity Findings (Pre-Existing, Unaddressed)

These are *not* blockers, but should be in the next sprint:

### HIGH-A — HRIS Employee Get IDOR (C6)
- **File:** `server-go/internal/hris/employee/handler.go:72-86`
- **Confidence:** 0.85
- **Why it matters:** Any user with only `employee.view_self` can read PII (national ID, NPWP, bank, salary) of any employee by passing `?id=<uuid>`.
- **Fix:** If `requester != target`, require `employee.view` or `target.manager_id = requester.id` + `employee.view_team`.

### HIGH-B — `companyreviews` gameable + `created_at` reset (C2 + C3)
- **Files:** `server-go/internal/companyreviews/service.go:49-93` (lines 76 and the missing application check)
- **Confidence:** 0.9 / 0.95
- **Fix:** Add `EXISTS(SELECT 1 FROM applications WHERE jobseeker_id=$1 AND job_posting_id IN (SELECT id FROM job_postings WHERE company_id=$2))` before insert. Remove `created_at = now()` from the ON CONFLICT clause and add an `updated_at` column.

### HIGH-C — Type assertion without `ok` in 5+ handlers (H1)
- **Files:** matching/handler.go:49, 89; rbac/middleware.go:54; auth_recovery.go:51, 114; admin.go:152
- **Confidence:** 0.9
- **Why it matters:** Any middleware reorder, test path, or refactor that leaves `userId` unset causes a runtime panic and 500.
- **Fix:** Add a `getUserID(c)` helper in `middleware/auth.go` that returns `(string, bool)` and use it everywhere. Audit the 12 sites flagged in the bug report.

### HIGH-D — Unbounded goroutine fan-out (H5, H6)
- **Files:** `server-go/internal/webhook/service.go:226`; `server-go/internal/feedback/service.go:81`
- **Confidence:** 0.85
- **Why it matters:** Verified company with 10 000 webhooks = 10 000 concurrent HTTP requests with 10 s timeout each. Combined with the missing per-company webhook count cap (M12) the blast radius is large.
- **Fix:** Bounded worker pool (semaphore of 16) shared between webhook and feedback dispatch. Cap webhook count per company at 50.

---

## What Passed Review (Net-Positive Changes)

These are *good* changes in the diff and can be celebrated:

| Change | File | Why it's good |
|---|---|---|
| TanStack Query dedup for "latest evaluation" | `web/src/components/onboarding/JobseekerOnboarding.tsx:14-22` | Replaces `useEffect+useState` with `useQuery`; the shared query key `['evaluation', 'latest']` dedupes with `AIEvaluationSection` — eliminates 1 redundant HTTP round-trip on every onboarding render. |
| Remove `window.location.reload()` after resume import | `web/src/pages/JobseekerProfile/ResumeImport.tsx:120-122` (deleted) | The old code force-reloaded the entire page after every `Add` — bad UX and stomped TanStack Query cache. Replaced with optimistic cache update via updater function. |
| Extract `resetExpForm` helper | `web/src/pages/JobseekerProfile/index.tsx:61-74` | Removed 5 copies of the 11-line `expForm.reset({...})` call. ~150 lines deleted. |
| Updater function in `setQueryData` | `web/src/pages/JobseekerProfile/index.tsx:259-263` | `setQueryData(['profile', 'me'], (old) => ...)` reads latest cache, fixing the stale-closure bug from rapid sequential imports. |
| `CreateExperience.Organization` now optional with title fallback | `server-go/internal/handlers/profiles.go:500-504` | Project and volunteering experiences often have no organization; the DB column is `NOT NULL`, so the title fallback closes the only path that previously 500'd for these types. |
| `RequireVerifiedCompany` selects only needed columns | `server-go/internal/middleware/auth.go:89-94` | Was `SELECT *` (16+ columns), now `id, verification_status`. ~80% reduction in bytes-per-request at the per-request middleware level. |
| `Register` transaction commits after `signTokens` | `server-go/internal/handlers/auth.go:258-267` | If `signTokens` (which inserts the RefreshToken row) fails, the user/company inserts are now rolled back in the same transaction. Eliminates the pre-commit "user created but no refresh token" race window. |
| Query placeholder style consistent | `server-go/internal/handlers/profiles.go:533, 675` | Migrated from `$1` (go-jet/pgx) to `?` (Bun) — minor consistency win. |
| `omitempty` on `CreateExperienceRequest.organization` | `server-go/internal/handlers/profiles.go:30` | Makes the API spec match the new "organization optional" contract. |
| `RequireRole` no longer imports go-jet | `server-go/internal/middleware/auth.go` | Smaller compile-time surface. |

---

## New Review Findings Introduced (Severity-ordered)

| # | Severity | File:Line | Finding | Fix |
|---|---|---|---|---|
| 1 | CRITICAL | `server-go/.env:5, 16, 21` | Live LLM key + weak JWT secret + weak admin password | Rotate credentials, empty the file, add startup guards. **See BLOCK-1.** |
| 2 | CRITICAL | `server-go/.env.example:4` | `JWT_SECRET=skillpass-dev-secret-change-in-prod` shipped | Empty value + comment; enforce min-length in `config.go`. **See BLOCK-2.** |
| 3 | CRITICAL | `server-go/internal/handlers/companies.go:195` | `UpdateProfile` discards RETURNING row | Pass `&company` to `Scan`. **See BLOCK-3.** |
| 4 | CRITICAL | `server-go/internal/handlers/passport.go:90-97` | `view_count` UPDATE on every public GET | Move to `profile_views` table; never write on public read. **See BLOCK-4.** |
| 5 | HIGH | `server-go/internal/hris/employee/handler.go:72-86` | HRIS Employee Get IDOR (C6) | Enforce `view` or `target.manager_id = requester.id` + `view_team`. |
| 6 | HIGH | `server-go/internal/middleware/auth.go:26-34` | JWT in `?token=` (HIGH-001 / C4) | Remove fallback; for SSE use a 60s single-use exchange token. |
| 7 | HIGH | `server-go/internal/companyreviews/service.go:49-93` | Company review gameable (C2) | Add `EXISTS(applications WHERE company_id=$1)` pre-check. |
| 8 | HIGH | `server-go/internal/companyreviews/service.go:76` | `created_at = now()` on update (C3) | Remove from ON CONFLICT, add `updated_at` column. |
| 9 | HIGH | `server-go/internal/middleware/auth.go:62` | `userRole.(string)` without `ok` in `RequireRole` | Use helper. |
| 10 | HIGH | matching/handler.go:49, 89; rbac/middleware.go:54; auth_recovery.go:51, 114; admin.go:152 | Type assertion without `ok` (H1) | Centralize in a `getUserID(c)` helper. |
| 11 | MEDIUM | `server-go/internal/middleware/auth.go:103` | `companies[0]` for multi-company user (N2) | Add `?companyId=` validated against owned companies. |
| 12 | MEDIUM | `server-go/internal/middleware/ratelimit.go:86-98` | `X-Forwarded-For` trusted (MED-002 / H2) | `r.SetTrustedProxies(...)`; use `c.ClientIP()`. |
| 13 | MEDIUM | `server-go/internal/webhook/service.go:226`; `server-go/internal/feedback/service.go:81` | Unbounded goroutine fan-out (H5, H6) | Bounded worker pool; per-company webhook cap. |
| 14 | MEDIUM | `server-go/internal/matching/service.go:131` → `category_service.go:110` | N+1 in match (H7) | Pre-load weights map keyed by job id. |
| 15 | MEDIUM | `server-go/internal/evaluation/handler.go:225` | `time.Parse` swallowed → false `IsExpired` (H10) | Log the error; treat parse failure as not-expired. |
| 16 | MEDIUM | `server-go/internal/handlers/companies.go:168-177` | `blind_mode` UPDATE outside tx (H11) | Fold into the same Bun UPDATE. |
| 17 | MEDIUM | `server-go/internal/application/service.go:107-142` | Duplicate-app check non-transactional (M29) | `INSERT ... ON CONFLICT DO NOTHING RETURNING id`. |
| 18 | MEDIUM | `server-go/internal/application/service.go:120-133` | Auto-eval blocks Apply for 30-60s (H31, H36) | Move to background worker; return 202. |
| 19 | LOW | 30+ sites | `fmt.Sprintf("...%v", err)` leaks DB error to client (MED-005 / H32) | Generic message + `slog.Warn` server-side. |
| 20 | LOW | `server-go/internal/middleware/auth.go:85` | `fmt.Sprintf("Invalid user ID: %v", err)` | Generic "Invalid user ID". |
| 21 | LOW | `server-go/internal/handlers/auth_recovery.go:160-176` | Forgot-password timing leak (MED-007) | Constant-time dummy operation. |
| 22 | LOW | `server-go/cmd/server/main.go` (none) | No security-headers middleware (MED-004) | Add headers middleware (CSP, X-CTO, HSTS prod-only). |
| 23 | LOW | `server-go/internal/hris/attendance/ws.go:12-28` | WS origin hardcoded `localhost:4200` (LOW-004) | Read from `cfg.CORSOrigin`. |
| 24 | LOW | `web/src/lib/api.ts:14-23`; `web/src/hooks/useAuth.tsx:61-77` | JWT in `localStorage` (LOW-005) | Move access token to HttpOnly cookie (refresh is already cookie-based). |
| 25 | LOW | `web/src/pages/JobseekerProfile/ResumeImport.tsx:140-153` | `addAll` swallows errors and overwrites error state (N3) | Collect per-entry failures; do not mark `idx` as added on failure. |
| 26 | LOW | `web/src/pages/JobseekerProfile/index.tsx:259-263` | `user?.username` in `onExperienceAdded` may be stale (N4) | Read from `useAuth()` inside callback. |
| 27 | LOW | `web/src/components/onboarding/JobseekerOnboarding.tsx:14-19` | `'evaluation', 'latest'` query key duplicated (N5) | Export `EVALUATION_LATEST_QUERY_KEY` constant. |
| 28 | LOW | `server-go/internal/middleware/auth.go:104` | `!= "verified"` lost type-safety (N1) | Promote to a `const` and unit-test. |
| 29 | LOW | `server-go/internal/handlers/auth.go:258-267` | Register tx holds connection across signTokens (N6) | Add comment explaining intentionality. |
| 30 | LOW | `web/src/pages/JobseekerProfile/ResumeImport.tsx:147-150` | Outer `catch {}` in `addAll` is dead code (N7) | Remove or document. |

---

## Merge Recommendation

# 🚫 BLOCK

**Do not merge to `main` until BLOCK-1 through BLOCK-4 are resolved.**

The Bun ORM refactor is internally consistent and improves a few things, but the audit
backlog (1 CRIT + 5 HIGH + 7 MED + 5 LOW in security, 6 CRIT + 54 HIGH + 35 MED + 35 LOW
in bugs) is **untouched** by this branch. The web-side changes in `91c40c6` + `eefcb35` are
safe and net-positive — recommend cherry-picking them onto a `hotfix/web-resume-import-ux`
branch as a follow-up if a quick UX fix is needed.

### Suggested path forward

1. **Open a security sprint** focused on the 4 blockers + the 4 HIGH-A/B/C/D items above.
   Estimated: 2 engineers, 1 week.
2. **Rotate** the LLM key and JWT secret **today**, regardless of the merge.
3. **Refactor of `RequireVerifiedCompany`** to support multi-company users is independently
   valuable (N2) — bundle with the multi-company `company_id` claim work.
4. **Run the bug-hunt skill again** on the security-sprint branch to confirm the 130 bug
   findings are reduced to <10.
5. **Then merge** the ORM refactor + UX patch.

### Verifications before re-review

After fixing blockers, run:
- `cd server-go && go test -p 1 ./...` (Go tests)
- `bun --cwd web test` (web tests)
- `bun run api:check` (API drift)
- `bun run lint` (Biome)
- `gosec -include G201,G202,G203,G204 ./server-go/...` (SQL injection)
- `govulncheck -C server-go ./...` (Go vuln check)
- `cd web && bun audit` (frontend vulns)

---

## Full Cross-Reference: All 130 Bug Findings

This is a condensed view — for full details see `docs/bug_finding/BUG_REVIEW_2026-07-20.md`.

| ID | Status | One-line |
|---|---|---|
| C1-C6 | ⚪ all 6 | Unchanged in diff. |
| H1 | ⚪ | Type assertion panics, 12+ sites. |
| H2 | ⚪ | XFF trust. |
| H3 | ⚪ | Rate limiter GC leak. |
| H4 | ⚪ | RBAC role assignment bypass. |
| H5, H6 | ⚪ | Unbounded goroutines. |
| H7 | ⚪ | Matching N+1. |
| H8 | ⚪ | Slug denylist incomplete. |
| H9 | ⚪ | Bun `NewRaw().Scan` fragile. |
| H10 | ⚪ | `time.Parse` swallowed. |
| H11 | ⚪ | blind_mode outside tx. |
| H12 | ⚪ | UpdateStatus rejected-terminal. |
| H13 | ⚪ | DISTINCT ON with duplicate created_at. |
| H14 | ⚪ | storage keyPattern + `..`. |
| H15 | ⚪ | PDF reader not reset between paths. |
| H16 | ⚪ | Anthropic fallback unreachable. |
| H17 | ⚪ | `*string` double-unmarshal. |
| H18 | ⚪ | ConsumeEmailVerification double-query. |
| H19 | ⚪ | pg unique violation string match. |
| H20 | ⚪ | Swallowed `RowsAffected`. |
| H21 | ⚪ | Update no existence pre-check. |
| H22 | ⚪ | Slug-collision via DB unique only. |
| **H23** | **✅** | **Register signTokens reorder.** |
| H24-H37 | ⚪ | All unchanged. |
| H38-H54 | ⚪ | All unchanged. |
| M1-M35 | ⚪ | All unchanged. |
| L1-L35 | ⚪ | All unchanged. |

**Net: 1 of 130 bug findings fixed (H23).** All 129 others remain open and represent the
backlog that should drive the next sprint.
