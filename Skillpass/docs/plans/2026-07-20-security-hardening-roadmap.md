# SkillPass Security & Bug Hardening Roadmap

> **For agentic workers:** REQUIRED Delegate Agents — Route and delegate to the right agent(s) — single dispatch or multi-step workflow

**Goal:** Turn the 2026-07-20 security audit (18 findings), bug audit (130 findings), and code review (BLOCK) into a sequenced, verifiable, deployable hardening program.

**Architecture:** Pure-process work — no new architectural patterns. The plan groups findings by blast radius (auth → critical bugs → high bugs → backlog) so each release invalidates the fewest user sessions and produces the smallest diff. TDD where behavior changes; mechanical sweeps where patterns repeat.

**Tech Stack:** Go 1.26 + Gin + Bun ORM + pgx, React 19 + Vite + TanStack Query, raw SQL migrations, vitest (web), Go `testing` (server), lefthook gates (`api:check`, `fmt`, `gosec`, `govulncheck`).

**Companion documents (read in this order):**
- `docs/security_issue/SECURITY_REVIEW_2026-07-20.md` (18 findings; 1 CRIT, 5 HIGH, 7 MED, 5 LOW)
- `docs/bug_finding/BUG_REVIEW_2026-07-20.md` (130 findings; 6 CRIT, 54 HIGH, 35 MED, 35 LOW)
- `docs/code_review/CODE_REVIEW_2026-07-20.md` (BLOCK; 4 merge blockers)

---

## 1. Executive Summary

**Total scope to address (this plan):** 1 CRIT-security + 5 HIGH-security + 6 CRIT-bugs + 11 HIGH-bugs (top 23) → **~7 engineer-days** at the security-sprint velocity assumed by `docs/code_review/CODE_REVIEW_2026-07-20.md` (2 engineers, 1 week). The remaining 100+ findings collapse into 5 batched sweeps in Phases 3-4, adding another **~4 engineer-days** of follow-up. **Total estimate: ~11 engineer-days across 3 weeks**, of which **~0.5 day is "do today, no code"** (Phase 0 credential rotation).

**Phasing rationale:** Phases are ordered by *blast radius*, not by audit ID. Phase 0 strips the kill-the-company-now credentials (live LLM key, weak JWT secret) before any code deploy. Phase 1 removes the four code-review merge blockers (one trivial SQL fix, one DoS fix, one auth-flow redesign, plus the .env guardrails from Phase 0). Phase 2 closes the remaining data-integrity Critical bugs (PII in DB, IDOR, gameable reputation) — these can ship as soon as Phase 1 lands because they do not invalidate sessions. Phase 3 batches the recurring high-frequency low-risk patterns (panicking type assertions, swallowed DB errors, unbounded goroutines, N+1) into one PR per pattern. Phase 4 absorbs the medium/low backlog and verification items into a hardening release. This ordering keeps every release independently revertable and avoids the "rotated the JWT secret but still leaking it via `?token=`" trap.

**Three things you must accept up front:**
1. The HIGH-001 / HIGH-002 / HIGH-003 auth-flow fix **invalidates all existing user sessions** (we will rotate `JWT_SECRET`, add `JWT_REFRESH_SECRET`, and stop accepting `?token=`). Plan a brief logout-everyone window.
2. HIGH-005 (PII in `ai_evaluations.raw_analysis`) is a **two-step fix**: stop writing the system prompt + PII, then run a one-time data scrub on existing rows. The scrub is in Phase 2; the schema change can be a `DROP COLUMN` after the scrub.
3. C2 (company reviews) is **partially blocked on a product question** (what qualifies as "applied" — any application, or only completed interviews?). Phrased as a single decision in Phase 2; engineering work proceeds with the "any application to that company" definition as the default if product does not respond by the end of the sprint.

---

## 2. Phase 0 — IMMEDIATE (today, before anything else merges)

No code. Operator actions only. All three items must complete before any other Phase begins.

### 0.1 — Rotate live LLM API key (CRIT/HIGH-004)
- **Where:** `server-go/.env:21` currently contains `LLM_API_KEY=sk-7fcec27cb6ee0538-1ouwgu-ae6a1416`; `LLM_BASE_URL=http://202.155.90.174:20128/v1` (line 23).
- **Steps:**
  1. Log in to the LLM provider dashboard (audit says "looks like OpenRouter" based on the `sk-` prefix and `9Router` reference; confirm by curling the LLM base URL with a 1-token ping).
  2. Revoke the existing key. Generate a new one.
  3. Open a new terminal; do **not** write the new key into any committed file. Store it in the deployment secret manager.
  4. Purge `server-go/.env` from every developer machine, CI cache, and Docker image (the audit notes these caches can outlive the `.gitignore` fix).
  5. Write a clean `server-go/.env` with the new key injected at deploy time only.
- **Verification:** `grep -R "sk-7fcec27cb6ee0538" .` returns nothing. `git log --all -S "sk-7fcec27cb6ee0538"` returns nothing (already the case per audit, but confirm). LLM API provider dashboard shows the new key active and the old one revoked.
- **Owner-role:** Platform / DevOps. **No code change.**

### 0.2 — Rotate JWT signing secret (CRIT/CRIT-001)
- **Where:** `server-go/.env:5` (`JWT_SECRET=S3crEt123!!`, 11 chars). The current production value is weak.
- **Steps:**
  1. Generate a 64-byte random secret: `openssl rand -hex 64`.
  2. Set the new value in the deployment secret manager; do **not** commit it.
  3. Plan a rolling deploy where the new secret is set in env, the server is restarted, and the new secret is read on boot. **This invalidates all existing access tokens (15 min) and refresh tokens (7 days) by signature mismatch.** Plan a brief user-visible "log in again" window.
  4. After deploy, `DELETE FROM refresh_tokens` is **not required** because refresh tokens are validated by signature first; an old refresh token with an old signature is rejected. The DB rows become harmless.
- **Verification:** New secret in env. Server boots. Login issues a JWT that decodes with the new secret. Old tokens (issued before rotation) return 401.
- **Owner-role:** Platform / DevOps. **No code change.**

### 0.3 — Replace `.env.example` placeholder + scrub `.env` (CRIT/CRIT-001, N1)
- **Where:** `server-go/.env.example:4`, `server-go/.env` (whole file).
- **Steps:**
  1. Edit `server-go/.env.example:4` → `JWT_SECRET=` (empty) and add a comment:
     ```bash
     # Generate with: openssl rand -hex 64 (must be ≥ 32 bytes)
     # The server refuses to boot with a shorter value or with the dev placeholder.
     JWT_SECRET=
     ```
  2. `git diff` should show only that line changed. Commit. **The shipped `.env.example` is now safe to copy.**
  3. Operator writes a fresh `server-go/.env` from the new `.env.example`, filling in the rotated LLM key (0.1) and JWT secret (0.2) from the secret manager. All other fields keep the dev defaults.
- **Verification:** `grep "skillpass-dev-secret-change-in-prod" server-go/.env.example` returns nothing. `grep "S3crEt" server-go/.env` returns nothing. `cat server-go/.env | grep -E "^\w+=" | cut -d= -f1` lists every key with a non-empty value (sanity).
- **Owner-role:** Backend. **2-line code change.**

**Total Phase 0: 0.5 engineer-day. Zero user impact if Phase 1 lands in the same deploy window.**

---

## 3. Phase 1 — MERGE BLOCKERS (must fix before current branch can merge)

Four blockers per `docs/code_review/CODE_REVIEW_2026-07-20.md` (lines 167-217). Phased in **dependency order**: BLOCK-3 (trivial SQL) first, then BLOCK-4 (small handler change), then BLOCK-2 (startup guards, requires no .env change), then BLOCK-1 (auth-flow redesign — the highest-risk item, last so the other three land cleanly first).

### 1.1 — BLOCK-3: Fix `UpdateProfile` RETURNING row (C1, 0.25 day)
- **Where:** `server-go/internal/handlers/companies.go:179-217`.
- **Confirmed line:** `:195` — `err = query.Where("user_id = ?", userUUID).Returning("*").Scan(c.Request.Context())` with no destination.
- **Steps:**
  1. **Test (TDD):** in `server-go/internal/handlers/companies_test.go`, add `TestUpdateProfileReturnsUpdatedRow`:
     - Create a company user via `testutil.CreateCompanyUser`.
     - `PUT /api/v1/company/profile` with `{"companyName":"Acme Inc"}`.
     - Assert response JSON's `companyName == "Acme Inc"` and `id` matches the seeded company.
     - Run `go test -p 1 ./internal/handlers/ -run TestUpdateProfileReturnsUpdatedRow` → **must fail** (response has `companyName: ""`).
  2. **Fix:** at `:195`, change to `err = query.Where("user_id = ?", userUUID).Returning("*").Scan(c.Request.Context(), &company)`.
  3. Re-run the test → must pass.
  4. Also fold `blind_mode` into the same Bun UPDATE (resolves **H11** and the dual-snapshot bug at `:168-177` and `:219-220`). Concretely: add `BlindMode bool` to `models.Company` if not already present, then `if req.BlindMode != nil { query = query.Set("blind_mode = ?", *req.BlindMode) }`. Delete the raw-SQL `ExecContext` block at `:168-177` and the post-read `CompanyBlindMode` call at `:220`. Re-derive `resp.BlindMode` from the RETURNING row.
  5. **TDD for the blind_mode fold:** add `TestUpdateProfileBlindModeInOneTx` that asserts the response is correct after a `blindMode` update and that the Bun update logs contain a single statement (verify via `pg_stat_statements` or by mocking — simpler: assert response correctness; trust the `RETURNING` row to be authoritative).
- **Verification:** `bun run test:server` passes; the existing `TestBlindModeToggle` still passes.
- **API drift:** No new fields; `CompanyResponse` unchanged. **No `api:generate` needed.**
- **Risk:** Low. The `blind_mode` fold is a small refactor that depends on a model-field change — confirm the model has or can accept `blind_mode` as a column (the audit says it's currently outside the Bun model). If not, add it via migration `000030_company_blind_mode_column.sql`:
  ```sql
  ALTER TABLE companies ADD COLUMN blind_mode boolean NOT NULL DEFAULT false;
  ```
  Then `bun run db:generate` to regenerate the model.

### 1.2 — BLOCK-4: Move `view_count` write off the public GET (C5, 0.5 day)
- **Where:** `server-go/internal/handlers/passport.go:90-97`. Confirmed: the public GET writes `view_count` on every unauthenticated request.
- **Design decision needed:** product/UX must decide between two approaches:
  - **(a)** Stop writing on public GET entirely. The `ViewCount` field on the public response is removed or returns 0 for anonymous viewers. The `profile_views` table (already exists per `000009_passport_views.sql`) is used by an authenticated company viewer. *Cleanest, removes the DoS amplifier, no gameability.*
  - **(b)** Batch the increment on the public GET — collect in-process for 10s, flush via a single `UPDATE ... SET view_count = view_count + N`. *Keeps the displayed count accurate but does not stop the inflation attack; a jobseeker can still script their own count.*
- **Default if product does not respond:** ship (a). Add `ViewCount` as a separate authenticated `GET /api/v1/profiles/{username}/stats` endpoint for verified companies, backed by `profile_views` with `(viewer_ip, profile_id, day)` dedup.
- **Steps:**
  1. **Test (TDD):** `server-go/internal/handlers/passport_test.go` — `TestGetProfileNoWrite`:
     - Insert a profile. Set `view_count = 5` directly in the DB.
     - `GET /api/v1/profiles/{slug}` 100 times in a loop.
     - Assert `view_count` in the DB is still `5`. Today this fails.
  2. **Fix:** delete the `QueryRowContext(... UPDATE jobseeker_profiles ...)` block at `passport.go:90-97`. Set `viewCount := 0` in the response. If product chose (b), add a `sync.Once`-protected buffered counter that flushes on shutdown.
  3. **Bonus:** the `view_count` column on `jobseeker_profiles` is now stale-or-zero; document it in the schema. Do **not** drop the column in this PR (it is referenced elsewhere; out of scope).
- **Verification:** Test passes. `bun run test:server`. Manual: hit the public endpoint 5 times, observe no DB write in `pg_stat_statements`.
- **API drift:** Response shape `PublicProfileResponse` already has `viewCount int`. If we set it to `0`, no type change. If we omit the field, the `omitempty` tag at `:21` means the JSON drops it. **No `api:generate` needed unless we change the field type.**

### 1.3 — BLOCK-2: Refuse to boot with weak JWT secret (CRIT-001 follow-through, 0.25 day)
- **Where:** `server-go/internal/config/config.go:14-18` and `server-go/.env.example` (already updated in Phase 0).
- **Confirmed line:** `:16-18` — only checks `if jwtSecret == ""`. No length check. No known-value check.
- **Steps:**
  1. **Test (TDD):** `server-go/internal/config/config_test.go` (new file):
     - `TestLoadRejectsShortSecret` — set `JWT_SECRET="short"`, expect `panic`.
     - `TestLoadRejectsKnownDevSecret` — set `JWT_SECRET="skillpass-dev-secret-change-in-prod"`, expect `panic`.
     - `TestLoadAcceptsValidSecret` — set `JWT_SECRET` to a 64-hex string, expect no panic and a non-nil `*Config`.
  2. **Fix:** at `config.go:16`, replace `if jwtSecret == ""` with:
     ```go
     const minSecretLen = 32
     if jwtSecret == "" {
         panic("JWT_SECRET environment variable is required")
     }
     if len(jwtSecret) < minSecretLen {
         panic(fmt.Sprintf("JWT_SECRET must be at least %d bytes (got %d)", minSecretLen, len(jwtSecret)))
     }
     if jwtSecret == "skillpass-dev-secret-change-in-prod" {
         panic("JWT_SECRET is the dev placeholder — generate a new one with `openssl rand -hex 64`")
     }
     ```
  3. Run the tests; iterate until all pass.
  4. The `tokenVersion` claim (MED-001) is **not** in scope here — that is a separate, larger refactor. See Phase 3.
- **Verification:** `go -C server-go test -p 1 ./internal/config/...` passes. A test boot with the placeholder secret panics.
- **API drift:** None.

### 1.4 — BLOCK-1: Stop accepting `?token=` for SSE (HIGH-001 / C4, 1.5 day) — **biggest risk in Phase 1**
- **Where:** `server-go/internal/middleware/auth.go:24-34` (server side); `web/src/lib/notifications.ts:46-53` (client side).
- **Design decision:** EventSource cannot set custom headers (verified — see "design constraints" at end of file). The two real options are:
  - **(a) Short-lived SSE exchange ticket.** Client `POST /api/v1/notifications/stream-token` with the Bearer header → server returns a 60-second opaque `exchange` nonce bound to the user's `userId` via an in-memory map (or a short-lived signed JWT with a different secret). Client opens `EventSource('/api/v1/notifications/stream?exchange=<nonce>')`. Server middleware redeems the nonce, sets `userId`/`role` in context, and rejects any other use of the `?exchange=` param outside `/notifications/stream`.
  - **(b) Cookie-based SSE.** Server sets the access token as an HttpOnly, SameSite=Strict cookie. EventSource sends cookies automatically. This solves the SSE problem and also addresses LOW-005 (JWT in localStorage) at the same time — but it is a larger change (logout, CSRF, XSRF tokens).
- **Default if product does not respond:** ship (a). It is the smaller change and is the pattern GitHub/Slack use. (b) is a longer Phase 2+3 item.
- **Steps for option (a):**
  1. **New endpoint:** `POST /api/v1/notifications/stream-token` in `server-go/internal/notification/handler.go` — requires the same `AuthRequired` middleware (Bearer header). Returns `{"exchange": "<nonce>", "expiresIn": 60}`. Stores the mapping in an in-memory `map[string]string` (key = nonce, value = userId) protected by a `sync.RWMutex`, with a 60s TTL.
  2. **Middleware change:** `auth.go:24-34`:
     - Remove the unconditional `?token=` fallback.
     - Add a new function `SSERedeemMiddleware(state *StreamExchangeStore)` that ONLY applies to routes registered with `c.Stream(...)`. It looks up `?exchange=`, fetches the userId, and on success deletes the nonce (single-use) and sets `c.Set("userId", userId)`.
     - If `Authorization: Bearer` is present, the existing `AuthRequired` still works.
  3. **Route registration:** in `server-go/cmd/server/main.go`, find the notification stream route. Apply the new middleware in addition to the existing one.
  4. **Client change:** `web/src/lib/notifications.ts:46-53`:
     ```ts
     export async function subscribeToNotifications(onEvent, onError): Promise<EventSource> {
       const { exchange } = await api<{ exchange: string }>('/notifications/stream-token', { method: 'POST' });
       const es = new EventSource(`/api/v1/notifications/stream?exchange=${encodeURIComponent(exchange)}`);
       ...
     }
     ```
     Callers (likely `useNotifications`) must now `await subscribeToNotifications` and handle the async.
  5. **Tests:**
     - `server-go/internal/notification/handler_test.go`: `TestStreamToken` — login → POST stream-token with Bearer → expect 200 with non-empty `exchange`. Same nonce in a second POST must NOT return a different one (each POST issues a new one); reusing a single exchange on two SSE opens → second is rejected with 401.
     - `server-go/internal/middleware/auth_test.go`: `TestAuthRejectsQueryTokenExceptSSE` — `?token=` on any non-stream route returns 401. `?exchange=` on a non-stream route returns 401.
     - `web/src/lib/notifications.test.ts`: mock `api`; assert `subscribeToNotifications` calls `/notifications/stream-token` first and constructs the URL with `?exchange=`, never `?token=`.
- **Verification:** `bun run test:server && bun --cwd web test && bun run api:check` all pass. `grep -rn "token=" web/src/lib/notifications.ts` returns no match. The notifications page renders and receives events end-to-end.
- **API drift:** `POST /notifications/stream-token` is a new endpoint. Add it to the swagger annotations. **Run `bun run api:generate` and commit the regenerated `server-go/docs/` + `web/src/lib/generated/api.d.ts`.** Web consumer types are in `@/lib/api-types` (no hand-written interface).
- **Backwards compat:** any client that still tries `?token=` is silently broken. There is no SPA version that does this in the current code, but old tabs/curl users will see SSE stop. Announce in release notes.
- **Out of scope (defer to Phase 3):** the same `?token=` pattern is not used by any other endpoint (grep confirms it is only the notification stream). HIGH-001 is fully closed by fixing SSE.

**Total Phase 1: ~2.5 engineer-days. Once deployed, the code review BLOCK verdict is lifted.**

---

## 4. Phase 2 — CRITICAL BUGS (sprint 1, this week)

Remaining 4 of 6 Critical bugs from `docs/bug_finding/BUG_REVIEW_2026-07-20.md` (C1 and C5 already in Phase 1) plus the data-leakage HIGH-005 and the URL-token HIGH-002. These do not invalidate sessions and can ship after Phase 1.

### 2.1 — HIGH-005: Stop persisting PII + system prompt in `ai_evaluations` (1 day)
- **Where:** `server-go/internal/evaluation/service.go:168-169` (write site). Schema: `ai_evaluations.raw_analysis` (column from `migrations/000005_ai_evaluations_applications.sql`).
- **Design decision needed:** the column is `TEXT` storing the full LLM I/O. Two options:
  - **(a) Stop writing it.** Update the INSERT at `:181-184` to pass `''` for `raw_analysis` (or `NULL` if the column is nullable). The existing data stays in the DB. *Lowest risk.*
  - **(b) Drop the column.** Add a migration that sets `raw_analysis = NULL` first, then `DROP COLUMN raw_analysis`. *Cleanest, but breaks any consumer that reads the column.*
  - **(c) Move to a separate admin-only table.** New `ai_evaluation_audit` table with stricter access. *Heaviest, but preserves the audit trail for a 30-day window.*
- **Default:** (a) for the immediate fix; (c) as a follow-up if product confirms they need the audit trail. (b) is acceptable if no consumers exist — grep first.
- **Steps:**
  1. `grep -rn "raw_analysis" server-go web/src` — confirm consumers. The audit found only the write site and the model struct.
  2. **Test (TDD):** `server-go/internal/evaluation/service_test.go` — `TestEvaluateDoesNotPersistSystemPrompt`:
     - Build a fake `evalService` with a stub LLM that returns a fixed result.
     - Call `Evaluate(ctx, profileID)`.
     - Re-SELECT the row from `ai_evaluations`; assert `raw_analysis` is empty or null and that the system prompt string is **not present** anywhere in the row.
  3. **Fix:** at `:168`, replace the construction with `rawAnalysis := ""` (or omit the SET clause). Update the INSERT to bind `nil` (if column is nullable) or `""`.
  4. **Bonus (related):** the LLM error body echo at `server-go/internal/lib/llm.go:138, 157, 159, 164, 168, 182, 350, 363, 367, 379` is also flagged. Wrap the body in a digest helper:
     ```go
     func previewBody(b []byte, n int) string {
         h := sha256.Sum256(b)
         if len(b) > n { b = b[:n] }
         return fmt.Sprintf("%s…sha256=%x", b, h)
     }
     ```
     Then every error site becomes `fmt.Errorf("llm returned %d: %s", status, previewBody(body, 200))`. The raw body is still logged at `slog.Error` server-side for debugging, but never reaches the client.
  5. **Migration (optional, follow-up):** `000031_clear_raw_analysis.sql`:
     ```sql
     UPDATE ai_evaluations SET raw_analysis = NULL WHERE raw_analysis IS NOT NULL;
     ```
     Run once after the code change. **Coordinate with a maintenance window if the table is large.**
- **Verification:** Test passes. Manual: trigger an evaluation, query the row, confirm no system prompt text.
- **API drift:** None — the read-side response struct already does not include `raw_analysis`.

### 2.2 — C2: Company-review eligibility check + C3: `created_at` reset (1 day)
- **Where:** `server-go/internal/companyreviews/service.go:49-93` (Create). The audit also flags the missing interaction-history check (C2) and the `created_at = now()` on update (C3 at line 76).
- **Design decision needed (C2):** what interaction counts? The default is **"the candidate has at least one application to any of this company's jobs"**. This is a permissive check that gates spam without locking out edge cases (e.g., the candidate applied and was rejected — they can still leave a review). If product wants stricter (e.g., `status IN ('interviewed', 'offered')`), add a second phase.
- **C3 decision:** C3 is mechanical — remove `created_at = now()` from the `ON CONFLICT DO UPDATE` and add an `updated_at` column.
- **Steps:**
  1. **Migration:** `000032_company_reviews_updated_at.sql`:
     ```sql
     ALTER TABLE company_reviews ADD COLUMN updated_at timestamptz;
     UPDATE company_reviews SET updated_at = created_at;
     ALTER TABLE company_reviews ALTER COLUMN updated_at SET NOT NULL;
     ALTER TABLE company_reviews ALTER COLUMN updated_at SET DEFAULT now();
     ```
  2. **Test (TDD):** `server-go/internal/companyreviews/service_test.go`:
     - `TestCreateRejectsUnrelatedCandidate` — create company A and candidate B (no applications). `Create(ctx, A.ID, B.ID, {rating: 5})` returns `ErrNoApplication` (new error).
     - `TestCreateAcceptsCandidateWithApplication` — create company A, job, application from B. `Create(ctx, A.ID, B.ID, {rating: 5})` succeeds.
     - `TestUpdatePreservesCreatedAt` — call `Create` twice with the same `(companyID, candidateID)`. Assert the `createdAt` from the first response equals the `createdAt` from the second response.
     - `TestUpdateBumpsUpdatedAt` — same setup, but assert `updated_at` from the second response is later than `created_at`.
  3. **Fix in service.go:**
     - At line 49, add a pre-check:
       ```go
       var hasInteraction bool
       err := s.db.QueryRowContext(ctx, `
           SELECT EXISTS(
               SELECT 1 FROM applications a
               JOIN job_postings j ON j.id = a.job_posting_id
               WHERE a.jobseeker_id = $1 AND j.company_id = $2
           )`, candidateID, companyID).Scan(&hasInteraction)
       if err != nil { return nil, fmt.Errorf("check interaction: %w", err) }
       if !hasInteraction { return nil, ErrNoInteraction }
       ```
     - Add `var ErrNoInteraction = errors.New("candidate has no application to this company")` to the package.
     - At line 76, remove `created_at = now()` from the `ON CONFLICT` set. Add `updated_at = now()`.
     - In the `RETURNING` clause, also return `updated_at` and surface it on the `CompanyReview` struct.
  4. **Handler:** in `server-go/internal/companyreviews/handler.go`, map `ErrNoInteraction` → `http.StatusForbidden` with a user-facing message ("You can only review a company after applying to one of its jobs").
  5. **Bonus — rate limit:** add a per-candidate-per-company limit (1 update per 24h) to prevent re-edit gaming. The `updated_at` check makes this trivial in SQL: refuse an update if `now() - updated_at < 24h`.
- **Verification:** All three new tests pass. `bun run test:server` green.
- **API drift:** `CompanyReview` struct gains an optional `updatedAt` field. **Run `bun run api:generate` and commit the regenerated files.**

### 2.3 — C6: HRIS Employee Get IDOR (0.5 day)
- **Where:** `server-go/internal/hris/employee/handler.go:72-86`. Confirmed: a user with only `employee.view_self` can pass any UUID in the URL and read that employee's PII.
- **Steps:**
  1. **Test (TDD):** in `server-go/internal/hris/employee/handler_test.go` (or new file):
     - `TestGetRejectsCrossEmployeeForViewSelf` — seed requester employee A and target employee B in the same company, both with `employee.view_self` only. Request `GET /api/v1/hris/employees/B` as A. Expect 403.
     - `TestGetAcceptsSelfForViewSelf` — request `GET /api/v1/hris/employees/A` as A. Expect 200.
     - `TestGetAcceptsSubordinateForViewTeam` — give A `employee.view_team`, B's `manager_id = A`. Request `GET /api/v1/hris/employees/B` as A. Expect 200.
  2. **Fix:** at `handler.go:72-86`, replace the existing logic with:
     ```go
     if employeeID != requesterUUID {
         // Cross-employee access. Require explicit permission.
         if !h.hasPermission(c, "employee.view") {
             // Fall back to view_team if the target reports to the requester.
             if !h.hasPermission(c, "employee.view_team") || !h.reportsTo(c, employeeID, requesterUUID) {
                 c.JSON(http.StatusForbidden, gin.H{"error": "Cannot view other employees"})
                 return
             }
         }
     }
     ```
     The two helpers `hasPermission` and `reportsTo` are added to the package; `reportsTo` is a single CTE query.
  3. **Delete the dead code:** the `emp == nil` check at `:82` and the redundant `svc.Get(requesterUUID)` call at `:73-81` go away.
- **Verification:** All three new tests pass. Existing HRIS tests still pass.
- **API drift:** None (response shape unchanged).

### 2.4 — HIGH-002: Move email-verification and password-reset tokens out of URL (1.5 day)
- **Where:** `server-go/internal/handlers/auth_recovery.go:29, 80, 170`. Confirmed: tokens are in `verifyURL = base + "/auth/verify-email?token=" + raw` and `resetURL = base + "/auth/reset-password?token=" + raw`.
- **Design decision needed:** the two options from `docs/security_issue/SECURITY_REVIEW_2026-07-20.md` (lines 116-120) are:
  - **(a) Opaque short ID + typed-code entry.** Email contains `https://app/auth/redeem?id=<opaque>` (the ID is the lookup key). The verify/reset page asks the user to enter the token (delivered as a separate email, or rendered client-side from the ID lookup). *Removes the URL-leak vector entirely but is UX-friction.*
  - **(b) URL fragment (`#token=...`).** Server cannot see the fragment; it requires JS to extract and POST. Still leaks via `Referer` and JS reads. *Removes the server-log vector only.*
  - **(c) POST + body.** Keep the link short (`/auth/redeem?id=<opaque>`) and have the page auto-POST the token from a fragment to a `/auth/redeem/confirm` endpoint. The token is never in a URL the server logs.
- **Default:** (c) for password reset (we control the page); (a) for email verification (out-of-band; user can re-request).
- **Steps for (c) on reset:**
  1. **Token model change:** `server-go/internal/authtoken/service.go` — add a `LookupID` field to issued tokens. The opaque ID is what goes in the URL; the token itself is in the email body or the URL fragment.
  2. **Email template change:** `server-go/internal/email/templates.go` — instead of `<a href="...?token=...">`, send two parts: an HTML email with an `<a>` to the redeem page (ID only), and a plain-text alternative that shows the token inline so the user can copy it. *Note: the audit also recommends TTL ≤ 15 min (currently 1h in `authtoken/service.go:21`); drop to 15 min in this PR.*
  3. **Server change:** `auth_recovery.go:170` — emit `redeemURL = base + "/auth/redeem?id=" + opaqueID`. The token is included as a `#token=...` fragment.
  4. **Page change:** the React reset-password page parses the fragment client-side, POSTs `{id, token, newPassword}` to `POST /auth/reset-password/confirm`. The server looks up the ID, validates the token against the stored hash, and sets the new password.
  5. **Old `?token=` endpoint:** keep it temporarily as a fallback, but log a `slog.Warn` if it is hit (it indicates an old link). Remove in Phase 3.
  6. **Tests:** verify the URL in the email contains `id=` but not `token=`. Verify the fragment is in the body text. Verify the server rejects `?token=` queries after the migration.
- **Verification:** All tests pass. `grep -rn "token=" server-go/internal/email/` shows no `token=` in URLs (only in fragment or body). Manual: request a reset, check the email URL, confirm the token never appears in any server-side log.
- **API drift:** `POST /auth/reset-password/confirm` is a new endpoint. **Run `bun run api:generate` and commit the regenerated files.** Same for any verify-email confirm endpoint added.

**Total Phase 2: ~4 engineer-days. After Phase 2, the Critical-bug count drops from 6 to 0 and the worst data-leakage item (HIGH-005) is closed.**

---

## 5. Phase 3 — HIGH BUGS (sprint 2-3, batched by file)

Group by file/module to minimize context-switching. Each group is one PR. Items already fixed in Phase 1-2 are excluded.

### 3.1 — Type-assertion-without-`ok` sweep (H1, 1 day)
- **Affected sites (confirmed in `docs/bug_finding/BUG_REVIEW_2026-07-20.md` lines 91-100 and `docs/code_review/CODE_REVIEW_2026-07-20.md` line 90):**
  - `server-go/internal/matching/handler.go:49, 89` — `userID.(string)` after `c.Get` returns `ok` is **discarded** on the next line.
  - `server-go/internal/rbac/middleware.go:54` — `employeeIDVal.(string)` in `RequirePermission` panics if not a string.
  - `server-go/internal/middleware/auth.go:62` — `userRole.(string)` in `RequireRole`.
  - `server-go/internal/handlers/auth_recovery.go:51, 114` — `userID, _ := userIDVal.(string)`.
  - `server-go/internal/handlers/admin.go:152` (and possibly more in `admin.go`).
- **Pattern (helper):** add to `server-go/internal/middleware/auth.go`:
  ```go
  func GetUserID(c *gin.Context) (string, bool) {
      v, ok := c.Get("userId")
      if !ok { return "", false }
      s, ok := v.(string)
      return s, ok && s != ""
  }
  func GetRole(c *gin.Context) (string, bool) {
      v, ok := c.Get("role")
      if !ok { return "", false }
      s, ok := v.(string)
      return s, ok && s != ""
  }
  ```
  Replace every `userID, ok := c.Get("userId"); if !ok { ... }; userIDStr := userID.(string)` with a single `userID, ok := middleware.GetUserID(c); if !ok { ... }` call.
- **TDD approach:** for each touched handler, add a test that calls the handler with no `userId` set in context (use `gin.CreateTestContext` with an empty context) and asserts 401, not 500.
- **Risk:** Low. The helper is purely additive; the rewrite is mechanical.
- **Suggested PR split:** one PR per package (`matching`, `rbac`, `handlers/auth*`, `handlers/admin*`) so review is small. Total 4 PRs, each < 100 lines diff.

### 3.2 — Swallowed DB errors sweep (H20, H22, H27, H28, H29, H30, M20, 0.5 day)
- **Affected sites (confirmed):**
  - `server-go/internal/hris/employee/service.go:419` — `rows, _ := result.RowsAffected()` (H20, M20).
  - `server-go/internal/hris/onboarding/service.go:186` — DELETE error discarded before re-INSERT (H27).
  - `server-go/internal/profileviews/service.go:32-35` — SELECT EXISTS error swallowed (H28).
  - `server-go/internal/hris/attendance/service.go:200-203` — OnLeave count error swallowed (H29).
  - `server-go/internal/hris/report/service.go:208-211` — AvgTenure count error swallowed (H30).
  - `server-go/internal/application/service.go:386-414` — `AddMessage` senderName lookup swallows err (M22).
- **Pattern:** every `rows, _ := ...` or `_ = ...` next to a `QueryRowContext`/`ExecContext` becomes a real error check that returns to the caller. Where the existing code "falls through" on error, propagate.
- **TDD:** for each site, write a test that closes the DB mid-call and asserts the handler returns 500 (or 503) — today they silently return 200 with stale data.
- **Risk:** Medium. The "fall through" behavior may be relied on by callers expecting partial data. Read each call site before fixing.
- **Suggested PR split:** one PR for HRIS services (4 files, one commit each), one for application/profileviews (2 files).

### 3.3 — Rate limiter `X-Forwarded-For` (MED-002 / H2, 0.5 day)
- **Where:** `server-go/internal/middleware/ratelimit.go:86-98` (the `clientIP` function).
- **Confirmed:** the function reads `X-Forwarded-For` unconditionally and returns the first IP. Bypassable by spoofing the header.
- **Design decision needed:** the deployment topology (direct, behind nginx, behind CloudFront). Two paths:
  - **Path A (behind a known proxy):** configure `r.SetTrustedProxies([]string{"<proxy-cidr>"})` in `cmd/server/main.go` and replace `clientIP` with `c.ClientIP()` (Gin's helper respects TrustedProxies).
  - **Path B (direct, no proxy):** ignore `X-Forwarded-For` entirely; use `c.Request.RemoteAddr` always.
- **Default:** ship **Path A** with a sane default list (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` — RFC 1918) and a `TRUSTED_PROXIES` env var to override. Add a startup log line printing the active list.
- **TDD:** unit test `clientIP` with various `X-Forwarded-For` and `RemoteAddr` combinations; assert the returned IP matches expectation per the configured trusted-proxy list.
- **Risk:** Low. Path A is the standard Gin pattern; Path B is a one-line change.
- **Also fix H3 (rate-limiter GC leak):** add a `done chan struct{}` to `NewRateLimiter` and `select` on it inside `gc`. Plumb a shutdown hook in `main.go` (`defer close(rl.Done())` or pass into a `Stop()` method).

### 3.4 — Unbounded goroutine fan-out (H5, H6, 0.5 day)
- **Where:** `server-go/internal/webhook/service.go:225-228`; `server-go/internal/feedback/service.go:81`.
- **Pattern (shared worker pool):** add `internal/async/pool.go` with:
  ```go
  type Pool struct {
      sem chan struct{}
      wg  sync.WaitGroup
  }
  func NewPool(max int) *Pool { return &Pool{sem: make(chan struct{}, max)} }
  func (p *Pool) Go(fn func()) { p.sem <- struct{}{}; p.wg.Add(1); go func() { defer func() { <-p.sem; p.wg.Done() }(); fn() }() }
  func (p *Pool) Wait() { p.wg.Wait() }
  ```
  Inject the pool into webhook and feedback services. Replace `go s.deliver(...)` with `pool.Go(func() { s.deliver(...) })`.
- **Also fix M12 (per-company webhook cap):** add `MAX_WEBHOOKS_PER_COMPANY = 50` constant; refuse `Create` if the company has 50 already.
- **TDD:** write a test that creates 100 webhook targets and asserts at most `max` are in-flight at any moment (instrument with an atomic counter).
- **Risk:** Medium. The pool's `Wait()` semantics matter at shutdown — if a request fires a webhook and the server shuts down before `Wait()`, the delivery is lost. Document the trade-off in code comments.
- **Suggested PR:** one PR for the pool + webhook, one for the feedback migration.

### 3.5 — `time.Parse` swallowed in evaluation handler (H10, 0.25 day)
- **Where:** `server-go/internal/evaluation/handler.go:225` (in `toResponse`).
- **Confirmed:** `createdAt, _ := time.Parse(time.RFC3339, eval.CreatedAt)` discards the parse error, leading to false `IsExpired` on malformed input.
- **Fix:** pass the parse error through and treat parse failure as `isExpired = false` (safer default — show the result) plus a `staleParse bool` flag on the response so the UI can surface a re-evaluation prompt.
- **TDD:** test that a malformed `createdAt` returns `isExpired: false` and `staleParse: true`.

### 3.6 — N+1 in matching + analytics (H7, 0.5 day)
- **Where:** `server-go/internal/matching/service.go:130-135` (per-job `computeJobMatchScore` calls `categoryService.GetJobCategoryWeights` per job).
- **Fix:** pre-load the weights map keyed by job id in a single query, then look up in-memory. Same pattern for analytics aggregations (the audit does not pinpoint analytics, but the same shape applies).
- **TDD:** benchmark before/after. Assert response shape unchanged.

**Total Phase 3: ~3.5 engineer-days. Net: ~30 of 54 High bugs closed in a week.**

---

## 6. Phase 4 — MEDIUM/LOW BACKLOG (sprint 3+, hardening release)

Group by area. Listed in priority order; each item is small.

### 6.1 — Security headers (MED-004, 0.25 day)
- **Where:** new file `server-go/internal/middleware/security_headers.go`. Register in `cmd/server/main.go` after the recovery middleware.
- **Items:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. HSTS and CSP only in `GIN_MODE=release`.

### 6.2 — Verbose error leaks (MED-005 / H32, 0.5 day)
- **Where:** ~30 sites in `server-go/internal/handlers/{jobs,profiles,companies,search}.go` and `middleware/auth.go:85` (the `fmt.Sprintf("Invalid user ID: %v", err)` site).
- **Pattern:** replace `c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("...%v", err)})` with `slog.Warn("...invalid ID", "raw", id, "error", err); c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})`.
- **Helper:** add `lib.MapDBError(err) (status int, public string)` to centralize.
- **Suggested PR:** one per package (5 PRs total, ~50 lines each).

### 6.3 — Forgot-password constant-time (MED-007, 0.25 day)
- **Where:** `server-go/internal/handlers/auth_recovery.go:160-176` (and H24 in `auth.go:307-311`).
- **Fix:** always run a bcrypt verify against a pre-computed dummy hash (compute once at startup, not per-request), and always do a fixed-cost DB lookup keyed by the SHA-256 of the email (so the response time is the same for existing and non-existing emails).

### 6.4 — Webhook SSRF re-check (MED-003, 0.5 day)
- **Where:** `server-go/internal/webhook/service.go:54-82, 225-228`.
- **Items:** re-resolve the hostname at delivery time; block `100.64.0.0/10` (CGNAT) and `0.0.0.0/8`; require `https://` when `GIN_MODE=release`.

### 6.5 — Token-version claim (MED-001, 1 day)
- **Where:** `users` table (migration `000033_users_token_version.sql`); `signTokens` in `auth.go`; a new `RequireRole` variant that re-checks.
- **Adds:** a `token_version int NOT NULL DEFAULT 0` column; bumps on role/status change; rejected by middleware on mismatch.

### 6.6 — `RequireVerifiedCompany` per-request caching + multi-company (N2, 0.5 day)
- **Where:** `server-go/internal/middleware/auth.go:70-110`.
- **Add:** a `sync.Map`-based per-user cache with 30s TTL. Add a `?companyId=` query param validated against owned companies (resolves N2).

### 6.7 — JWT in `localStorage` (LOW-005, 1 day)
- **Where:** `web/src/lib/api.ts:14-23`, `web/src/hooks/useAuth.tsx:61-77`.
- **Fix:** remove `localStorage` access-token storage. Move the access token to an HttpOnly, SameSite=Strict cookie set by the server. The refresh cookie is already set; the access token becomes a same-host cookie.
- **Note:** requires server changes (`Set-Cookie` on `/auth/login` response) and a deploy plan (existing localStorage tokens become invalid; users log in once after deploy).

### 6.8 — WebSocket origins from config (LOW-004, 0.25 day)
- **Where:** `server-go/internal/hris/attendance/ws.go:12-28`.
- **Fix:** parse `cfg.CORSOrigin` (comma-separated) and check against it. Mirror the HTTP CORS config.

### 6.9 — LLM URL allowlist (LOW-002, 0.25 day)
- **Where:** `server-go/internal/lib/llm.go:50-70`.
- **Fix:** at startup, validate `LLM_BASE_URL` against a configurable allowlist (`LLM_ALLOWED_HOSTS` env var, default `api.openai.com`).

### 6.10 — Bcrypt cost (LOW-001, 0.25 day)
- **Where:** `server-go/internal/lib/password.go:14`.
- **Fix:** `const BcryptCost = 12`. Document the offline-rehash migration for a future release.

### 6.11 — Verification items (VERIFY-001..005, 0.5 day total)
- **VERIFY-001** (blind mode in public profile): product decision — should a company with `blind_mode = true` still see candidate identities via the public passport URL? Default if no answer: no, the public endpoint masks identity for that company.
- **VERIFY-002** (payslip access): code review confirms the permission check is in the right place; add a test that asserts a `payroll.view_self` user cannot read another employee's payslip.
- **VERIFY-003** (resume upload filename): confirm with the MarkItDown team that filenames are sanitized.
- **VERIFY-004** (auto-eval cost): product decision — accept the cost or move to async (see H31/H36 below).
- **VERIFY-005** (already-used token idempotency): the audit suspects this is intentional for React Strict Mode; confirm with the React/frontend team. If unintentional, change `ConsumeEmailVerification` to return an error on already-used.

### 6.12 — Deferrable items (recommend deferring)
- **H31 / H36** (auto-eval blocks Apply for 30-60s) — **medium risk**, but the LLM provider may already be async. Recommend product discussion before the 1.5-day refactor.
- **H18** (ConsumeEmailVerification double-query) — microscopic perf, no behavior bug. Skip.
- **H15** (PDF reader not reset) — narrow edge case; only triggers if the underlying `multipart.File` does not support `Seek` (rare). Add a single-line try-reopen as a separate one-line PR.
- **H19** (pg unique violation string match) — cosmetic; convert to `errors.As(&pgErr)` if we ever touch that function.
- **H22** (HEAD check for slug availability) — UX nice-to-have, not a bug. Defer to product roadmap.
- **M1..M35** — backlog; pick up on a per-PR basis as the relevant files are touched. Do not open dedicated PRs.

**Total Phase 4: ~5 engineer-days spread over 2-3 weeks.**

---

## 7. Cross-cutting concerns

### 7.1 — API drift
Any change to a response struct triggers `bun run api:generate`. The plan items that touch response shapes:
- **Phase 2.2 (C2/C3):** `CompanyReview` gains an `updatedAt` field → `api:generate` required.
- **Phase 2.4 (HIGH-002):** new endpoints `/auth/reset-password/confirm` and possibly `/auth/verify-email/confirm` → `api:generate` required.
- **Phase 1.4 (BLOCK-1):** new `POST /notifications/stream-token` → `api:generate` required.
- **Phase 1.1 (BLOCK-3):** `CompanyResponse` field set is unchanged → no drift.
- **Phase 1.2 (BLOCK-4):** if we set `viewCount = 0` and rely on the existing tag, no drift; if we remove the field, `omitempty` means the type stays the same → no drift.
- **Phase 2.3 (C6):** same response shape → no drift.
- **Phase 2.1 (HIGH-005):** `EvaluationResult` does not include `raw_analysis` in the response → no drift.

**The lefthook pre-push gate `api:check` will fail if any of these is missed.** Run `bun run api:generate` and commit `server-go/docs/swagger.json` + `web/src/lib/generated/api.d.ts` in the same PR as the Go change.

### 7.2 — Tests
- **Phase 0-2 should be TDD.** For each PR, the sequence is:
  1. Write the failing test against the current behavior.
  2. Run it; confirm it fails for the right reason.
  3. Make the minimal code change.
  4. Re-run; confirm it passes.
  5. Run the full `bun run test:server` and `bun --cwd web test`.
  6. Commit.
- **Test patterns:**
  - **Go (server):** `httptest` for handlers (pattern in `server-go/internal/handlers/companies_test.go:19-50`), direct function calls for services (pattern in `server-go/internal/companyreviews/` if added). Use `testutil.SetupTestDB()` — it auto-creates `skillpass_test` and seeds the row.
  - **Web (frontend):** vitest + happy-dom + @testing-library/react (already configured). Mock `api()` with `vi.mock('@/lib/api')`.
- **Phase 3 sweeps** are mostly mechanical refactors. A single integration test per sweep ("given a user without `userId` in context, the handler returns 401 not 500") is sufficient.

### 7.3 — Migrations
- **`000030_company_blind_mode_column.sql`** — only if `blind_mode` is not already a column on the `companies` table. Confirm with `bun run db:generate` first.
- **`000031_clear_raw_analysis.sql`** — sets existing PII in `ai_evaluations.raw_analysis` to NULL after the code stops writing it. Run during a quiet period.
- **`000032_company_reviews_updated_at.sql`** — adds `updated_at` column.
- **`000033_users_token_version.sql`** — adds `token_version` column for MED-001 (Phase 4).
- Migration naming: per `.agents/rules/database.md` and the existing sequence in `server-go/migrations/`.

### 7.4 — Backwards compatibility
- **HIGH-001 (BLOCK-1):** any client still using `?token=` for SSE is silently broken. Mitigation: the exchange-ticket endpoint accepts the same `Bearer` token, so updating the client is a one-line change. Announce in release notes; the SPA bundle is the only known consumer.
- **HIGH-002 (Phase 2.4):** old `?token=` links in already-sent emails stop working. Mitigation: keep the old endpoint live for 30 days, logging a deprecation warning. Document in the release notes.
- **HIGH-003 (signing-key separation):** `JWT_REFRESH_SECRET` is a new env var. If unset, fall back to `JWT_SECRET` and log a startup warning. Existing refresh tokens continue to validate; new ones use the new secret (forward-compatible). A future release can hard-require the new var.
- **CRIT-001 secret rotation:** all existing access tokens invalidated (15 min impact); refresh tokens invalidated by signature mismatch (7 days impact). Plan a deploy window. Users log in once.
- **C2 (company reviews):** no backwards compat needed — old reviews that fail the new eligibility check are still readable, but new reviews from candidates who never applied are rejected.

### 7.5 — Lefthook gates likely to trip
- `bun run format` (pre-commit) — runs Biome with `--write`. **No action needed; auto-fixes.**
- `bun run test:server` (pre-push) — must be green before push.
- `bun --cwd web test` (pre-push) — must be green if any web tests exist.
- `govulncheck` (pre-push) — surfaces new Go vulnerabilities. If a Phase 0-2 change introduces a dep, expect a possible alert. Run manually to confirm before merging.
- `gosec` (pre-push) — checks `G201-G204` (SQL injection). All Phase 1-2 changes are SQL-injection-neutral (parameterized). No expected trips.
- `bun run api:check` (pre-push) — see Section 7.1.
- `no-gen-types-in-annotations` (pre-push) — Phase 1.4 / 2.2 / 2.4 changes add new swagger annotations. Use response structs (e.g., `StreamTokenResponse`), never raw Bun models.
- `omitempty-check` (pre-push) — Phase 1.1 may add nullable fields to `UpdateProfileRequest`; the allowlist at lefthook.yml:36-38 covers it.
- `zod-null-safety` (pre-push) — Phase 1.4 / 2.4 may add Zod schemas; ensure any `.optional()` fields that can receive `null` from the Go API are also `.nullable()`.

---

## 8. Risk register

| # | Risk | Impact | Mitigation | Owner |
|---|------|--------|------------|-------|
| R1 | Phase 0 secret rotation invalidates all user sessions | High UX impact (everyone logs out once) | Coordinate with a low-traffic window; communicate via status page; ensure refresh token rotation is forward-compatible (Phase 1) | DevOps |
| R2 | BLOCK-1 (SSE `?token=` removal) breaks old browser tabs | Medium — old tabs silently lose notifications | The new exchange-ticket flow is one async call away; ship client + server in the same deploy | Backend + Frontend |
| R3 | HIGH-002 (tokens out of URL) breaks already-sent emails | Medium — outstanding reset/verify links no longer work | Keep the old `?token=` endpoint for 30 days, log a deprecation warning | Backend |
| R4 | C2 (review eligibility) may be wrong | Medium — wrong definition = either spam stays open or legit reviewers are locked out | Default = "any application to any job at the company"; ask product in the same week; ship the migration as a no-op for first 48 hours (log a warning, do not reject) | Product + Backend |
| R5 | N+1 fix in matching changes response order | Low — sorted by score, should be stable | Add a deterministic tiebreaker (created_at DESC); snapshot a real-world test before/after | Backend |
| R6 | `RequireVerifiedCompany` cache (Phase 4.6) serves stale verification status | Medium — a newly-revoked company keeps API access for up to 30s | Add a `POST /admin/companies/:id/revoke` that explicitly invalidates the cache entry | Backend |
| R7 | `token_version` claim (Phase 4.5) requires DB migration on a hot table | Low — `ALTER TABLE ADD COLUMN ... DEFAULT 0` is fast in modern Postgres but locks briefly | Run during a quiet period; use `IF NOT EXISTS` | DevOps |
| R8 | Audit-side verifications (VERIFY-001..005) may require product decisions that block work | Medium — could delay Phase 2.4 and 4.5 | Raise each VERIFY-001..005 in the same sprint planning meeting; track as a separate product ticket | Product |
| R9 | LLM provider may not allow key rotation during the rotation window | Low — most providers allow immediate revocation | Rotate in one shot; have a rollback key ready if the new one is misconfigured | DevOps |
| R10 | The leftover `?token=` code path in `auth.go:24-34` is deleted; any other ad-hoc curl consumers in CI break | Low — only the notifications stream uses it (grep confirms) | Add a startup-time warning if the env var `LEGACY_SSE_TOKEN` is set, allowing opt-in for one release | Backend |
| R11 | Goroutine worker pool loses in-flight webhook deliveries on shutdown | Medium — applications trigger webhooks; if the server restarts within 5s, the delivery is lost | Add a `defer pool.Wait()` with a 5s timeout in the graceful-shutdown path; document the trade-off | Backend |
| R12 | `auto-eval` blocking the Apply handler (H31/H36) is *out of scope* for this plan | Medium — UX issue (30-60s apply) | Flag as a Phase 5 candidate; surface in the product meeting | Product + Backend |
| R13 | `NO_COLOR`/`LINT` failures on sweeper PRs due to large diffs | Low — review fatigue | Split each Phase 3 sweep into small per-file PRs as noted in 5.x | Backend |
| R14 | External proxy changes (MED-002 trust list) require ops coordination | Medium — wrong trust list = rate-limiter bypass returns | Default to RFC 1918 ranges; add a `TRUSTED_PROXIES` env var; document in `docs/deploy/` (does not exist yet — create as a follow-up) | DevOps |
| R15 | Audit identifies "12 of 14 previously reported findings remain unaddressed" — the security backlog is not being burned down | High — process risk | This plan + sprint commitment is the response. Track burndown weekly | Engineering lead |

---

## 9. Suggested PR split

PRs grouped by *what can be reviewed and merged together*. "Sequence" = dependency on earlier PRs. "Safe to merge in any order" items do not conflict.

| PR | Title | Files | Review complexity | Sequence |
|----|-------|-------|-------------------|----------|
| **PR-1** | `chore(ops): rotate LLM key + JWT secret + purge .env` | `server-go/.env.example`, ops playbook | Trivial (env-only) | **Phase 0, no PR** — direct deploy |
| **PR-2** | `feat(server): refuse to boot with weak JWT secret` | `server-go/internal/config/config.go`, `server-go/.env.example` | Low | **Must land in same release as PR-1** |
| **PR-3** | `fix(server): UpdateProfile returns the updated row + fold blind_mode into one Bun UPDATE` | `server-go/internal/handlers/companies.go`, `server-go/internal/handlers/companies_test.go` (new test), `server-go/internal/models/company.go` if blind_mode added, `server-go/migrations/000030_*.sql` if needed | Low | Independent of PR-1/2. **Phase 1.1** |
| **PR-4** | `fix(server): public profile GET is read-only` | `server-go/internal/handlers/passport.go`, `server-go/internal/handlers/passport_test.go` (new test) | Low | Independent. **Phase 1.2** |
| **PR-5** | `feat(server): SSE exchange-ticket + remove ?token= fallback` | `server-go/internal/middleware/auth.go`, `server-go/internal/notification/handler.go`, `server-go/cmd/server/main.go`, `web/src/lib/notifications.ts`, `web/src/lib/notifications.test.ts` (new), generated swagger/TS types | **High** — touches both Go and TS; new endpoint; auth-flow change | Depends on PR-1 (new secret must be live so the Bearer path is testable). **Phase 1.4** |
| **PR-6** | `fix(server): stop persisting PII + system prompt in ai_evaluations; truncate LLM body echoes` | `server-go/internal/evaluation/service.go`, `server-go/internal/lib/llm.go`, `server-go/internal/lib/llm_test.go` (new), `server-go/internal/evaluation/service_test.go` (new test), `server-go/migrations/000031_clear_raw_analysis.sql` | Medium | Independent. **Phase 2.1** |
| **PR-7** | `fix(server): company reviews require application; created_at preserved on update` | `server-go/internal/companyreviews/service.go`, `server-go/internal/companyreviews/handler.go`, `server-go/internal/companyreviews/service_test.go` (new), `server-go/migrations/000032_company_reviews_updated_at.sql`, generated types | Medium | Depends on product answer to "what counts as applied?" (default = any application). **Phase 2.2** |
| **PR-8** | `fix(server): HRIS Employee Get IDOR — require explicit permission for cross-employee` | `server-go/internal/hris/employee/handler.go`, `server-go/internal/hris/employee/handler_test.go` (new) | Low | Independent. **Phase 2.3** |
| **PR-9** | `feat(server): email-verification and password-reset tokens out of URL` | `server-go/internal/handlers/auth_recovery.go`, `server-go/internal/authtoken/service.go`, `server-go/internal/email/templates.go`, web reset/verify pages, generated types | **High** — UX change; new pages | Depends on product UX input. **Phase 2.4** |
| **PR-10** | `refactor(server): add GetUserID/GetRole helpers; sweep type-assertion-without-ok sites` | `server-go/internal/middleware/auth.go`, `server-go/internal/matching/handler.go`, `server-go/internal/rbac/middleware.go`, `server-go/internal/handlers/auth_recovery.go`, `server-go/internal/handlers/admin.go`, per-package tests | Medium | Safe in any order. **Phase 3.1.** Split into 4 sub-PRs (per package) if reviewer bandwidth is tight. |
| **PR-11** | `fix(server): propagate swallowed DB errors in HRIS + application + profileviews` | 6 files (see Phase 3.2) | Medium | Safe in any order. **Phase 3.2.** Split into 2 sub-PRs (HRIS, app+views). |
| **PR-12** | `fix(server): rate limiter trusts X-Forwarded-For only from configured proxies; rate-limiter GC stops on shutdown` | `server-go/internal/middleware/ratelimit.go`, `server-go/cmd/server/main.go`, `server-go/internal/middleware/ratelimit_test.go` (new) | Low | Independent. **Phase 3.3.** |
| **PR-13** | `feat(server): bounded goroutine pool for webhook + feedback fan-out; cap webhooks per company` | `server-go/internal/async/pool.go` (new), `server-go/internal/webhook/service.go`, `server-go/internal/feedback/service.go`, tests | Medium | Independent. **Phase 3.4.** |
| **PR-14** | `fix(server): time.Parse error logged; IsExpired false on parse failure + staleParse flag` | `server-go/internal/evaluation/handler.go`, `server-go/internal/evaluation/handler_test.go` (new), generated types | Low | Independent. **Phase 3.5.** |
| **PR-15** | `perf(server): pre-load matching weights map; eliminate N+1` | `server-go/internal/matching/service.go`, `server-go/internal/matching/category_service.go`, tests | Medium | Independent. **Phase 3.6.** |
| **PR-16** | `chore(server): security headers middleware` | `server-go/internal/middleware/security_headers.go` (new), `server-go/cmd/server/main.go` | Trivial | Independent. **Phase 4.1.** |
| **PR-17** | `refactor(server): replace verbose error leaks with generic messages + server logs` | ~5 packages | Low | Independent. **Phase 4.2.** |
| **PR-18** | `fix(server): constant-time forgot-password + dummy bcrypt pre-computed` | `server-go/internal/handlers/auth.go`, `server-go/internal/handlers/auth_recovery.go`, tests | Medium | Independent. **Phase 4.3.** |
| **PR-19** | `fix(server): webhook SSRF re-check at delivery time; require https in release` | `server-go/internal/webhook/service.go`, tests | Medium | Independent. **Phase 4.4.** |
| **PR-20** | `feat(server): token_version claim + DB column` | migration, `server-go/internal/handlers/auth.go`, `server-go/internal/middleware/auth.go`, tests | **High** — every authenticated route affected | **Last in the series.** **Phase 4.5.** |
| **PR-21** | `feat(server): RequireVerifiedCompany cache + multi-company via ?companyId=` | `server-go/internal/middleware/auth.go`, tests | Medium | Independent. **Phase 4.6.** |
| **PR-22** | `feat(web): access token in HttpOnly cookie; remove localStorage` | `web/src/lib/api.ts`, `web/src/hooks/useAuth.tsx`, server login handler, tests | **High** — affects every API call | **Last in the auth series.** **Phase 4.7.** |
| **PR-23** | `fix(server): WS upgrader reads allowed origins from CORSOrigin` | `server-go/internal/hris/attendance/ws.go` | Trivial | Independent. **Phase 4.8.** |
| **PR-24** | `feat(server): LLM_BASE_URL allowlist + bcrypt cost 12` | `server-go/internal/lib/llm.go`, `server-go/internal/lib/password.go`, tests | Trivial | Independent. **Phase 4.9 + 4.10.** |

**Recommended merge order:**
1. PR-1 (ops) + PR-2 (config guard) → one deploy.
2. PR-3, PR-4, PR-12, PR-23, PR-24 (low-risk, no schema, no UX) → merge as ready, any order.
3. PR-6, PR-8, PR-14, PR-15, PR-16, PR-17, PR-18, PR-19, PR-21 → batch through review.
4. PR-5 (SSE redesign) → single PR, careful review.
5. PR-7, PR-9 → depend on product decisions; ship as soon as product signs off.
6. PR-10, PR-11, PR-13 → sweeps; can be one PR per file group.
7. PR-20, PR-22 → the last two; touch every authenticated route. Coordinate with a deploy window.

**"Safe to merge in any order":** PR-3, 4, 6, 8, 12, 14-18, 19, 21, 23, 24.
**"Must sequence":** PR-1+2 (one deploy), PR-5 (depends on PR-1+2), PR-7 (depends on product), PR-9 (depends on product), PR-20+22 (deploy-window pair).

---

## 10. Out of scope

Items considered and explicitly **rejected for this plan**:

1. **A full ORM-driven rewrite of all remaining raw SQL.** The audit is full of "use `s.bun.NewSelect` instead of `QueryRowContext`" observations (M18, M22, H41, etc.). The Bun ORM migration is already a separate, larger effort; this plan does not bundle it. Each Phase 3-4 PR touches one file and may opportunistically migrate; no dedicated migration PR.
2. **Replacing the JWT format entirely (e.g., PASETO, signed cookies).** The audit does not recommend it; the cost of change is high. We split the AT/RT secret (HIGH-003) and move SSE off the URL (HIGH-001), which closes the practical risks.
3. **Moving the access token to HttpOnly cookie (LOW-005) in Phase 1.** It is in Phase 4 (PR-22) because it is a larger client + server change and requires a deploy-window commitment. Tempting to bundle with HIGH-001, but the SSE redesign is already enough for one PR.
4. **Rate-limit the SSE stream itself.** The audit does not flag it; EventSource auto-reconnects are already throttled by the browser. Skip.
5. **An audit of the test files themselves.** Out of scope per `docs/security_issue/SECURITY_REVIEW_2026-07-20.md:7` and consistent with the bug-hunt methodology.
6. **The 35 Low-priority bug findings (L1..L35) in `docs/bug_finding/BUG_REVIEW_2026-07-20.md`.** They are predominantly code-quality nits (`omitempty` misuse, doc comments, unused vars). Not security-impacting. Suggest a quarterly cleanup PR rather than bundling.
7. **VERIFY-004 (auto-eval cost) refactor (H31/H36).** The 30-60s Apply hang is a real UX issue but is a product decision (do we accept the cost or async-ify?). Raise in the product meeting; do not bundle with security work.
8. **WebSocket-only attendance feed refactor (LOW-004 follow-up).** Once origins are read from config (PR-23), the fix is complete. No deeper refactor needed.
9. **A separate `docs/deploy/` runbook.** The plan references one; create as a follow-up after the proxy trust decision (R14) is made.
10. **The `go-jet` codegen cleanup.** The diff already deleted `.gen/skillpass/public/...`. No further action.
11. **Re-running the full audit at the end of the plan.** Recommended in `docs/code_review/CODE_REVIEW_2026-07-20.md:325-327` as a verification step but is a separate engagement. The plan assumes the engineering lead will re-engage the security-auditor and bug-hunt skills after Phase 2 lands.
12. **Adding a `docs/research/` entry for each major decision.** The decisions in this plan are documented inline; create research files only if a future decision needs a longer write-up.

---

**End of plan. Total: 24 PRs, ~11 engineer-days, 3 weeks. After PR-9 lands, the code-review BLOCK verdict is fully resolved and 0 of 6 Critical bugs + 0 of 1 CRIT-security remain open. After PR-22 lands, 5 of 5 HIGH-security items are closed.**
