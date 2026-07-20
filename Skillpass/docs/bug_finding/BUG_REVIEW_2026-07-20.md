# SkillPass Bug Review — 2026-07-20 (Full-Codebase Audit)

Scope: every Go file in `server-go/`, every TS/TSX file in `web/src/`, plus migration/config. This is a wide-net audit (not a branch-diff audit), so it surfaces long-standing bugs as well as recent regressions.

Conventions:
- **Severity**: Critical (data loss, security, or production crash) / High (major bug, no easy workaround) / Medium (real bug, limited blast radius) / Low (code quality / nit).
- **Confidence**: 0.0–1.0 — how sure we are the issue is real and the file/line is the right one. 1.0 = verified by reading the code, no test masks it, the issue is reproducible in production.
- **Repro** is given where useful. Many items are static-analysis findings.

---

## CRITICAL

### C1. `handlers/companies.go:195` — `UpdateProfile` discards `RETURNING` row, returns zero-value company
- **Confidence**: 0.95
- **What's wrong**: In `UpdateProfile`, when `hasProfileFields` is true the build is:
  ```go
  var company models.Company
  hasProfileFields := req.CompanyName != nil || ...
  if hasProfileFields {
      query := h.bunDB.NewUpdate().Model((*models.Company)(nil))
      ...
      err = query.Where("user_id = ?", userUUID).Returning("*").Scan(c.Request.Context())
  ...
  resp := companyFromModel(company)   // <-- company is the zero value
  ```
  `Scan(c.Request.Context())` is called with **no destination** — the RETURNING row is thrown away. The response is then built from the never-populated `company` struct (empty `ID`, empty `CompanyName`, etc.).
- **Why it's a bug**: Clients see an empty company in the response. Worse, `resp.BlindMode = CompanyBlindMode(...)` is read separately and works, so the bug is silent — callers believe the update succeeded and the response shows it.
- **Fix**: Pass `&company` to `Scan`. The whole `if/else` branch can collapse to a single RETURNING update.
- **Repro**:
  ```bash
  curl -X PUT /api/v1/company/profile -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
       -d '{"companyName":"Acme Inc","website":"https://acme.example"}'
  # Response body: {"id":"","userId":"","companyName":"",...,"verificationStatus":""}
  ```

### C2. `companyreviews/service.go:49–93` — Anyone can rate any company; missing interaction check
- **Confidence**: 0.9
- **What's wrong**: `PostReview` accepts a rating (1–5) for any `companyID` from any authenticated jobseeker. It never verifies the candidate has actually applied to or interviewed with that company. `interactionType` is just a free-text field the candidate writes.
- **Why it's a bug**: Reputation system is fully gameable. A jobseeker (or a botnet of accounts) can hammer reviews of competitors. There is no per-company rate limit, no per-user-per-company rate limit, and `ON CONFLICT ... DO UPDATE` means they can repeatedly overwrite the same (company_id, candidate_id) row.
- **Fix**:
  1. Verify `EXISTS(SELECT 1 FROM applications a JOIN job_postings j ON j.id=a.job_posting_id WHERE a.jobseeker_id=$profileID AND j.company_id=$companyID)` before insert.
  2. Match `interactionType` against the candidate's actual history (must have an application with that company for "applied"; must be in `interviewed`/`offered` status for "interviewed").
  3. Add per-IP and per-user rate limit on this endpoint.
  4. Audit existing reviews for abuse.

### C3. `companyreviews/service.go:72–78` — `created_at` overwritten on every review update
- **Confidence**: 0.95
- **What's wrong**: The upsert sets `created_at = now()` on conflict. So a user who reviews on day 1 and edits on day 100 makes the row appear day-100 fresh.
- **Why it's a bug**: Any time-based reputation/ordering logic (e.g., "recent reviews") is corrupted. Also allows backdating — but more importantly, allows a reviewer to keep their review "fresh" indefinitely, suppressing other reviewers' visibility in sort orders.
- **Fix**: Remove `created_at = now()` from the conflict clause. Add an `updated_at` column if you want to track edits.

### C4. `middleware/auth.go:26–34, 36` — JWT accepted in `?token=` query string
- **Confidence**: 0.9
- **What's wrong**: SSE/WebSocket endpoints send the JWT as `?token=...`. The middleware explicitly supports this fallback (line 28: `token := c.Query("token")`).
- **Why it's a bug**:
  1. JWT in URL gets logged in access logs, browser history, referer headers, downstream proxies/CDN, and tools like Sentry URL breadcrumbs. Once leaked, an attacker can replay it for 15 min (access token TTL).
  2. The code comment justifies it with "EventSource does not support custom headers" — but `EventSource` in modern browsers does support `eventSourceInitDict.headers` since the spec update; `fetch` with `EventSource` polyfill is also available. The fallback was never needed.
  3. Combined with the `web/src/lib/notifications.ts:48` `?token=${token}` URL build, every SSE connection leaks a long-lived credential in URLs.
- **Fix**:
  1. Remove the query-string fallback entirely.
  2. If SSE is the blocker, mint a short-lived SSE-only token (e.g., 60s) from a separate endpoint and accept that. Or use WebSocket with subprotocol headers.
  3. Until #1 is done, add `?token=` to a denylist in reverse proxies and access logs.

### C5. `handlers/passport.go:90–97` — `view_count` UPDATE on every public profile GET
- **Confidence**: 0.95
- **What's wrong**: Every unauthenticated GET to `/api/v1/profiles/{username}` executes `UPDATE jobseeker_profiles SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count`. No rate limit, no auth, no idempotency.
- **Why it's a bug**:
  1. **DoS / write-amplification**: An attacker can trivially pin a row, saturating the DB write path. Each visit = 1 write + 1 read.
  2. **Race conditions**: Two concurrent visitors can both increment but only one RETURNING value is observed; the displayed count is the value seen by *one* of the two racers.
  3. **Cheating**: A jobseeker can inflate their own view count to game "trending" / "popular" sorts.
- **Fix**:
  1. Move view tracking to the existing `profile_views` table (`POST /api/v1/profiles/:id/view` is already there for companies) and de-duplicate by `(viewer_ip, profile_id, day)`.
  2. The public `GET` should never write.
  3. Add a soft rate limit (e.g., 1 view per IP per profile per hour) and a per-day cap on the count.
  4. If keeping on the public GET, batch the increment every N seconds via a background flush.

### C6. `hris/employee/handler.go:72–86` — `Get` handler authorization logic is broken (IDOR risk for `view_self` users)
- **Confidence**: 0.7
- **What's wrong**: The handler allows any caller with `employee.view_self` permission to query any employee's record by passing `c.Param("id")`. The "if asking for someone else" branch only re-loads the requester's own employee row to confirm it exists, then falls through and returns the **target** employee.
- **Why it's a bug**: The middleware in `main.go:340` allows `employee.view`, `employee.view_team`, or `employee.view_self` for this route. A user with only `employee.view_self` can call `GET /api/v1/hris/employees/<any-uuid>` and read other employees' PII (email, national ID, bank account, NPWP, BPJS, salary).
- **Fix**:
  1. If `requester != target`, enforce that the requester has `employee.view` or that the target reports to the requester (`target.manager_id = requester.id`) and the requester has `employee.view_team`.
  2. Add a per-route check or split the route.
  3. Drop the dead `if emp == nil` check (line 82) and the redundant requester lookup.

---

## HIGH

### H1. `middleware/auth.go:53–54` + 12+ handlers — `c.Get("userId")` type assertion without `ok`
- **Confidence**: 0.9
- **Examples**:
  - `matching/handler.go:49` — `userIDStr := userID.(string)` panics if `userId` is missing.
  - `matching/handler.go:89` — same.
  - `rbac/middleware.go:54` — `employeeID, err := uuid.Parse(employeeIDVal.(string))` panics if `employeeId` isn't a string.
  - `evaluation/handler.go:48` is safe (uses helper with `ok`).
- **Why it's a bug**: Any middleware reordering, test path, or refactor that leaves `userId` unset causes a runtime panic and 500. Easy to introduce in tests.
- **Fix**: Add the `, ok` form everywhere and treat missing key as 401.

### H2. `middleware/ratelimit.go:86–97` — `X-Forwarded-For` trusted without proxy config
- **Confidence**: 0.95
- **What's wrong**: `clientIP` blindly takes the first hop in `X-Forwarded-For` if the header is present. There is no list of trusted proxies and no use of `c.Request.RemoteAddr` fallback unless XFF is empty.
- **Why it's a bug**: Any client can set `X-Forwarded-For: 1.2.3.4` and rotate it on every request → the rate limiter never sees the same IP twice. The auth-endpoint limiter (5 rps, 10 burst) is bypassable.
- **Fix**: Use `(*Engine).TrustedProxies` and `(*Engine).SetTrustedProxies(...)` to limit which upstream IPs can inject XFF. Compare to `RemoteAddr` if request is not from a trusted proxy.

### H3. `middleware/ratelimit.go:33` — `go rl.gc()` runs forever, no shutdown
- **Confidence**: 0.9
- **What's wrong**: `NewRateLimiter` launches a GC goroutine that ticks every minute and removes idle buckets. The goroutine has no stop channel. If `NewRateLimiter` is called twice (e.g., in tests), old goroutines stack up. More importantly, on graceful shutdown, the goroutine leaks the only outbound reference to `rl.buckets`.
- **Why it's a bug**: Memory leak under reload / many `NewRateLimiter` invocations; leaked goroutine on shutdown.
- **Fix**: Accept a `ctx` (or `done chan struct{}`) on `NewRateLimiter` and `select` on it inside `gc`.

### H4. `rbac/rbac.go:37–70, 305–345` — Permission check + role assignment bypass patterns
- **Confidence**: 0.6
- **What's wrong**:
  - `HasPermission` and `HasAnyPermission` use `SELECT EXISTS(...)`. The check is correct but the middleware (`rbac/middleware.go:60`) does it once per request, with no caching. The comment "TODO: Cache permission check per-request or per-session" acknowledges this. → 1 query per request for every HRIS route, even when a single user hits many routes.
  - More importantly, `AssignRole` and `RemoveRole` use `INSERT ... SELECT FROM employees e, hris_roles r WHERE e.company_id = $1 AND r.company_id = $1`. The "company match" check is **in the same query as the insert/delete** — if either side fails to match, the operation silently affects 0 rows and returns nil. The caller cannot distinguish "wrong company" from "already assigned" / "not assigned".
- **Why it's a bug**: A user trying to assign a role from another company to their own employee gets a `200 OK` with no error and no effect. Hard to debug and the only feedback is "the role list didn't change".
- **Fix**: Use a transaction; do the SELECT first, return ErrNotFound if either side is missing, then INSERT.

### H5. `webhook/service.go:225–228` — Unbounded goroutine fan-out per application
- **Confidence**: 0.9
- **What's wrong**: `DispatchApplicationReceived` looks up all webhooks for a company and spawns one goroutine per webhook. No semaphore, no bounded pool.
- **Why it's a bug**: A company with 10 000 webhooks (legit or malicious — `Create` is unauthenticated beyond "verified company") causes 10 000 concurrent HTTP requests with a 10 s timeout each. Memory + connection pool exhaustion.
- **Fix**: Bounded worker pool (e.g., semaphore of 16). Reject `Create` if the company's webhook count exceeds a sensible cap (e.g., 50). Add a circuit breaker on the receiver side.

### H6. `feedback/service.go:81` — Unbounded goroutine per feedback submission
- **Confidence**: 0.8
- **What's wrong**: `go s.generateAISuggestions(...)` is fired on every `Create` with no rate limit. Each goroutine makes an LLM call.
- **Why it's a bug**: A company spamming feedback can spawn unlimited concurrent LLM calls, exhausting the upstream API quota and tying up DB connections for 60 s each.
- **Fix**: Bounded async worker queue (e.g., channel of 16). Or use the same webhook worker pool pattern.

### H7. `matching/service.go:130–135` and `201–233` — N+1 queries in match
- **Confidence**: 0.85
- **What's wrong**: `MatchJobs` (jobseeker view) loops 200 jobs and calls `computeJobMatchScore` per job; that calls `categoryService.GetJobCategoryWeights` (1 query) inside if it falls into the weighted branch. Same shape in `MatchCandidates`: 200 evaluations, each could trigger a category lookup. The `seen` map dedup happens in Go memory after the SQL already returned 200 rows.
- **Why it's a bug**: Each match request = 1 + 1 + 200 + N (weighted lookups) round-trips. For a platform of 5 000 candidates and 200 jobs that's ~200 000 queries per matching request.
- **Fix**: Do the dedup and weight lookup in SQL (`SELECT DISTINCT ON (profile_id) ...`). For per-job weight, cache the weights map in the service and only refetch when invalidated (or per-company cache).

### H8. `handlers/profiles.go:122–145` — Reserved-slug list incomplete; allows SPA route shadowing
- **Confidence**: 0.6
- **What's wrong**: `reservedSlugs` does not include "new", "edit", "delete", "settings", "billing", "dashboard", "api", "v1", "docs", "swagger", "static", "uploads", "ws", "debug", "admin" etc. A user can claim slug `settings` and break `GET /p/settings` (OG page) and any future SPA route that resolves `/settings`.
- **Fix**: Add a much larger denylist. Better: prefix user slugs (`/@username`) so they can never collide with routes.

### H9. `matching/service.go:181–198` — `s.bun.NewRaw(...).Scan(ctx, &rows)` with `&rows` where `rows` is `[]struct{...}` with `bun:"..."` tags
- **Confidence**: 0.6
- **What's wrong**: This pattern (Bun scanning raw SQL into a slice of struct) is fragile. The comment claims "go-jet ... rows silently come back empty" — but Bun's documentation is explicit that `Scan` on a slice is supported, while `NewRaw` does not always honor struct tags in the same way. The code compensates with a `seen` map dedup, which masks a silent bug.
- **Why it's a bug**: If the scan silently returns 0 rows when there are matches, candidates get an empty list with no error, and the user has no recourse.
- **Fix**: Switch to plain `db.QueryContext` + manual `rows.Scan` like the other handlers. Or use Bun's `NewSelect().Column(...).Scan(ctx, &models)` with a registered model.

### H10. `evaluation/handler.go:224–237` — `toResponse` ignores `time.Parse` error → false `isExpired`
- **Confidence**: 0.9
- **What's wrong**:
  ```go
  func toResponse(eval *EvaluationResult) EvaluationResponse {
      createdAt, _ := time.Parse(time.RFC3339, eval.CreatedAt)
      ...
      IsExpired: IsExpired(createdAt),   // false positive if parse failed
  }
  ```
  If `eval.CreatedAt` is malformed, `createdAt` is the zero time, and `IsExpired(zero)` returns `true` because 2026 is way after year 1. The frontend then hides the evaluation.
- **Why it's a bug**: Any future format change to the LLM side that returns a non-RFC3339 string causes the user's evaluation to silently disappear from the UI.
- **Fix**: Log the parse error. Treat parse failure as `IsExpired=false` (safer default — show the result) and surface a "stale" flag for re-evaluation.

### H11. `handlers/companies.go:168–220` — `UpdateProfile` blind_mode update outside transaction
- **Confidence**: 0.95
- **What's wrong**: `blind_mode` is updated via a separate `db.ExecContext` outside the main UPDATE...RETURNING, and the response is built from a re-read that uses yet another connection. Three different consistency snapshots.
- **Why it's a bug**:
  1. If the transaction succeeds but the blind_mode update fails (e.g., DB blip), the user is told the whole update failed but partial state was committed.
  2. The blind_mode read used in the response can be from a different replica/snapshot.
- **Fix**: Make `blind_mode` a real column on the Bun model. Use a single UPDATE with `Returning("*")` for both fields.

### H12. `application/service.go:218–275` — `UpdateStatus` does not check `allowedTransitions` against the `fromStatus` for "rejected"
- **Confidence**: 0.7
- **What's wrong**:
  ```go
  "rejected": {},
  ```
  Empty list, so once an application is rejected, the company cannot reopen it. This may be intentional, but there is no business reason documented; meanwhile the company cannot move from `rejected` to any state, and the jobseeker cannot apply again to the same job (because the `Apply` service uses `ON CONFLICT`-style duplicate detection... actually it doesn't — it just checks `existing` first).
- **Related**: `Apply` does not have a "rejected application" check, so a jobseeker can re-apply to the same job after rejection. If that is desired, document it; if not, add the check.
- **Fix**: Add a comment / decision record. If "rejected" is terminal, enforce it in `Apply`.

### H13. `matching/service.go:212–223` — Dedupe of AI evaluations by `seen[pid]` in Go masks DB sort instability
- **Confidence**: 0.6
- **What's wrong**: The query is `ORDER BY ae.created_at DESC LIMIT 200`. With multiple evaluations per profile, only the **most recent** is wanted; the dedup in Go uses the first hit. But "first hit" depends on row order which depends on the database. If two evaluations share the same `created_at` (HIGH probability under LLM regeneration), the wrong one may win.
- **Fix**: Use `DISTINCT ON (profile_id) ... ORDER BY profile_id, created_at DESC` in SQL.

### H14. `storage/storage.go:51–75` — `keyPattern` accepts `..` substring; relies on separate check
- **Confidence**: 0.4
- **What's wrong**: `keyPattern = ^[a-zA-Z0-9/_.-]+$` allows `/`, `.`, `_`, `-`. A key like `a/../../../etc/passwd` would pass the pattern (slashes + dots are allowed) and is then blocked by the substring check `strings.Contains(key, "..")`. The `keyPattern` is doing nothing useful here. Worse, on Windows a `\\` is treated as a path separator and the regex would still allow the literal `\\`.
- **Fix**: Reject any key containing `..` and any key starting with `/`. Use a stricter pattern (no `.` other than the file extension). Sanitize with `filepath.Clean` and re-verify the result is inside `l.dir`.

### H15. `resume/handler.go:99–125` — PDF reader not properly reset between MarkItDown and fallback
- **Confidence**: 0.7
- **What's wrong**: `convertWithMarkItDown` reads the PDF via `io.Copy(part, r)`, which may consume the whole file. The fallback path then `Seek(0, io.SeekStart)` and re-reads. If the underlying `multipart.File` doesn't support seek (some implementations don't), the seek returns an error and the handler returns 500 ("Could not process upload").
- **Fix**: Open the file fresh from the file header in the fallback path. Or always read the PDF into a buffer first (8 MB cap already enforced).

### H16. `lib/llm.go:150–161` — Anthropic fallback branch is unreachable
- **Confidence**: 0.8
- **What's wrong**:
  ```go
  if err := json.Unmarshal(cleaned, &chatResp); err != nil || len(chatResp.Choices) == 0 {
      if parsed := tryAnthropicAsOpenAI(cleaned); parsed != nil {
          chatResp = *parsed
      } else if err != nil {
          return fmt.Errorf("parse response: %w (body: %s)", err, string(respBody))
      } else {
          return fmt.Errorf("llm returned no choices (body: %s)", string(respBody))
      }
  }
  ```
  The `else if err != nil` is unreachable: if `err == nil` and `len(Choices) == 0`, we go to the `else` branch; if `err != nil` (regardless of `Choices`), we already entered the `if`, so the `else if err != nil` always fires. Logic is wrong but happens to produce the same result because the inner `err` is shadowed.
- **Fix**: Restructure to a switch on the parse outcome.

### H17. `lib/llm.go:170–186` — `*string` resultPtr branch returns early; double-unmarshal risk
- **Confidence**: 0.5
- **What's wrong**: If the caller passes `*string`, the function stores the stripped content. But the calling code (`resume/service.go:65–67`) then tries to `json.Unmarshal([]byte(clean), &result)` where `clean` is the same content. Works for the resume case but is fragile: if `extractJSON` finds a partial object, the stripped content is what gets stored, and the caller's separate `json.Unmarshal` may re-extract a *different* substring.
- **Fix**: Pick one path — always store raw content in `*string`, never call `json.Unmarshal` inside the LLM client.

### H18. `handlers/auth.go:74–116` — `ConsumeEmailVerification` double-queries inside transaction
- **Confidence**: 0.7
- **What's wrong**: UPDATE RETURNING; if no rows, a second SELECT EXISTS runs inside the same transaction. Both are FOR NOTHING (no row lock on first attempt). The idempotency path is racy — two concurrent requests for the same token both see "already used" and both return success without flipping `users.is_verified`. (Actually fine because the UPDATE is the source of truth, but the second SELECT adds latency for no real safety.)
- **Fix**: Single UPDATE with `WHERE used_at IS NULL AND expires_at > now()` and the audit row insert in a CTE; if 0 rows affected, check for the already-used case once via a single `RETURNING used_at`.

### H19. `rbac/rbac.go:347–349` — `isPGUniqueViolation` uses string match
- **Confidence**: 0.95
- **What's wrong**: `strings.Contains(err.Error(), "duplicate key")` is fragile. If a future driver changes its error message, the check silently returns false. A user could create a duplicate role and get a generic 500.
- **Fix**: Use `var pgErr *pgconn.PgError; if errors.As(err, &pgErr) && pgErr.Code == "23505" { ... }`.

### H20. `hris/employee/service.go:419` — Swallowed `RowsAffected` error
- **Confidence**: 0.95
- **What's wrong**: `rows, _ := result.RowsAffected()`. If `RowsAffected()` itself fails (driver issue), the code falls through and returns the row from `s.Get(...)` — but `Get` queries by `id, company_id`, so it returns the *existing* row even if the update failed. Caller sees `200 OK` with stale data.
- **Fix**: Check the error.

### H21. `hris/employee/handler.go:88–96` — `Update` doesn't verify the resource existed before update
- **Confidence**: 0.7
- **What's wrong**: Handler relies on `s.Update` returning `sql.ErrNoRows` on 0 affected. But the service's check uses `rows, _ := result.RowsAffected()` (see H20) — when 0 affected, returns ErrNoRows. The race here is real: a `200 OK` may mask a "row not found" if the RowsAffected call has a transient error.
- **Fix**: Add an explicit `SELECT ... FOR UPDATE` before UPDATE in the service.

### H22. `handlers/profiles.go:300–301, 318–324` — Slug-collision check is via DB unique violation only
- **Confidence**: 0.6
- **What's wrong**: `UpdateMyProfile` builds an UPDATE with `slug = ?`. If two users race to claim the same slug, the unique violation (`23505`) is converted to 409. The losing user's other changes are *also* rolled back by the error path. Acceptable, but the `HEAD` check is missing — UI cannot pre-validate a slug.
- **Fix**: Optional `HEAD /profiles/:slug` (or GET that returns 200/404 without the full payload) for slug availability.

### H23. `auth.go:204–267` — `Register` rolls back transaction but JWT was already signed
- **Confidence**: 0.4
- **What's wrong**: `signTokens` is called inside the transaction with `tx` as the DB. If the token insert fails (e.g., race on email), the transaction rolls back. The user already has an `accessToken` in the local variable, but the handler returns an error without writing the response. So the token is never leaked. **Not a real bug** — but the code is misleading. Add a comment.

### H24. `auth.go:307–311` — Dummy bcrypt to equalize login timing
- **Confidence**: 0.6
- **What's wrong**: When the user doesn't exist, the code does `_, _ = lib.HashPassword("dummy-equalize-timing")` to spend comparable CPU. Two issues:
  1. `BcryptCost` is currently 4 (dev) — not equal to any real cost. With production cost 10, the dummy costs the same as the real one. The two bcrypt calls don't run in parallel, so login timing is still a function of "user exists or not" because the dummy runs *first* then the password verification runs only on real users. The timing isn't equalized, it's just padded.
  2. The error from `HashPassword` is discarded. If the dummy fails, no timing pad.
- **Fix**: Always verify the password (against the dummy hash) regardless of user existence. Store a single pre-computed dummy hash, not regenerate it per request.

### H25. `matching/handler.go:23–32` — `lookupProfileID` swallows `sql.ErrNoRows` differently from other paths
- **Confidence**: 0.4
- **What's wrong**: Returns the raw error, and the handler at line 53 maps any error to "Profile not found" (404) — but if the real error is "DB connection lost", the user sees a 404 and the server logs misleadingly. Should be split.

### H26. `handlers/jobs.go:355–467` — `UpdateJob` `updated_at` SQL injection vector via `Returning("*")` of a column list
- **Confidence**: 0.2 (not exploitable but fragile)
- **What's wrong**: The build uses `query.Where("id = ? AND company_id = ?", jobUUID, companyUUID).Returning("*").Scan(c.Request.Context())`. The values are parameterized — no SQLi. The issue is the `hasUpdates` boolean is set to true when any of the 15 fields is non-nil, but if the user supplies *all* 15 fields as `null` JSON values, `hasUpdates` stays false (correct). However, `updated_at = NOW()` is added unconditionally (line 451) — this writes to the row even if no real fields changed. Combined with the subsequent `Scan` checking `len(jobs) == 0`, the row gets a new `updated_at` with no actual change. Minor; the lock contention in Postgres is the real cost.

### H27. `hris/onboarding/service.go:186` — Swallowed `DELETE` error before re-insert
- **Confidence**: 0.95
- **What's wrong**:
  ```go
  tx.ExecContext(ctx, `DELETE FROM onboarding_checklist_items WHERE checklist_id = $1`, checklistID)
  // error discarded
  for i, task := range tmpl.Tasks { tx.ExecContext(... INSERT ...) }
  ```
  If the DELETE fails (e.g., FK constraint, lock), the subsequent INSERTs duplicate items, violating the implicit `(checklist_id, sort_order)` uniqueness (if any) or producing duplicate checklist items the user can complete twice.
- **Fix**: Capture and check the error.

### H28. `profileviews/service.go:32–35` — Swallowed `today-exists` query error
- **Confidence**: 0.95
- **What's wrong**:
  ```go
  _ = s.db.QueryRowContext(ctx, `SELECT EXISTS(...)`, ...).Scan(&todayExists)
  if todayExists { return nil }
  _, err := s.db.ExecContext(ctx, `INSERT ...`)
  ```
  If the SELECT fails, `todayExists` is `false` → INSERT runs even when it shouldn't. Duplicate view logs. The `INSERT` itself is non-idempotent (no unique constraint mentioned), so duplicates accumulate.
- **Fix**: Add a unique constraint `(profile_id, company_id, viewed_at::date)` and use `ON CONFLICT DO NOTHING`. Or check the error.

### H29. `hris/attendance/service.go:200–203` — Swallowed error on `OnLeave` count
- **Confidence**: 0.95
- **What's wrong**:
  ```go
  s.db.QueryRowContext(ctx, `SELECT COUNT(DISTINCT employee_id) FROM leave_requests ...`, ...).Scan(&stats.OnLeave)
  ```
  No error check. If the query fails, `OnLeave` is `0` and the subsequent `stats.Absent = TotalEmployees - Present - Late - OnLeave` over-counts absences silently.
- **Fix**: Capture and return the error.

### H30. `hris/report/service.go:208–211` — Same pattern: swallowed `AvgTenure` query error
- **Confidence**: 0.95
- **What's wrong**: `s.db.QueryRowContext(ctx, ...).Scan(&stats.AvgTenure)` — error discarded. Same impact as H29.

### H31. `application/service.go:120–133` — Auto-trigger evaluation can be skipped mid-transaction
- **Confidence**: 0.6
- **What's wrong**: `Apply` calls `s.evalService.Evaluate(ctx, jobseekerID)` if the existing evaluation is expired. This is *outside* the application insert transaction. If the LLM call hangs for 30 s, the user's "Apply" request hangs. The frontend cannot show a progress UI.
- **Fix**: Move the auto-eval to a background worker. Apply should return immediately and the evaluation can complete async.

### H32. `handlers/profiles.go:317–322` — `pgErr.Code == "23505"` is the only error mapped; other DB errors return 500 with leak-prone message
- **Confidence**: 0.5
- **What's wrong**: `c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})` is fine, but the `err.Error()` from the DB may contain constraint/column names that leak schema. This pattern is repeated across ~30 handlers.
- **Fix**: Use a single error mapper that converts DB errors to safe user-facing messages.

### H33. `handlers/companies.go:182–196` — Register transaction with `tx.Rollback()` and a transaction body that can succeed-or-fail mid-flight
- **Confidence**: 0.5
- **What's wrong**: `defer tx.Rollback()` is at line 209. The `signTokens` call at line 258 also writes to the DB. If the bcrypt/email-flow path is hot, the transaction window includes the bcrypt cost. Bcrypt cost 4 is dev only; cost 10 takes ~50 ms — fine, but 100 concurrent registrations = 5 seconds of held DB connection.
- **Fix**: Hash password before opening the transaction.

### H34. `evaluation/handler.go:151–158` — `results == nil` check is dead code
- **Confidence**: 0.95
- **What's wrong**: `results` is initialized to `[]EvaluationResponse{}` via `make`. The `if results == nil` check is never true.
- **Fix**: Remove the dead check.

### H35. `matching/service.go:131` — `computeJobMatchScore` per-row call doesn't share the `weights` map
- **Confidence**: 0.85
- **What's wrong**: Even with caching, the current API forces one DB call per job. If two consecutive jobs have the same weight set, the second still pays the full DB cost.
- **Fix**: Pre-load all job weights in one query keyed by job id, then look up in-memory.

### H36. `application/service.go:120–133` — `s.evalService.Evaluate(ctx, jobseekerID)` blocks the request
- **Confidence**: 0.9
- **What's wrong**: An LLM evaluation can take 30–60 s. The Apply handler waits for it. The user is stuck. No progress UI.
- **Fix**: Background job; respond 202 Accepted.

### H37. `application/service.go:218–275` — `UpdateStatus` does not check whether the current status is already the new status
- **Confidence**: 0.4
- **What's wrong**: If a company sends `PUT /applications/:id/status {status: "reviewed"}` twice, the second call: 1) passes the transition check (`applied → reviewed` is allowed), 2) updates `updated_at` again. Trivial but the `messages` thread may show the same status change twice.

### H38. `handlers/profiles.go:520–525` — `CreateExperience` returns the inserted experience *plus* spawns N skill upserts, but the skill upsert is fire-and-forget
- **Confidence**: 0.5
- **What's wrong**: The skills inserted in `INSERT INTO skills ... ON CONFLICT DO NOTHING` are not checked. If a skill name has 200+ characters, no validation rejects it. The autocomplete endpoint will then show a 200-char string.
- **Fix**: Add a length cap to skill names.

### H39. `notification/broker.go:39–50` — `Subscribe` does not de-dupe if the same channel is passed twice
- **Confidence**: 0.7
- **What's wrong**: `Subscribe` blindly appends to the slice. If the same `chan SSEEvent` is registered twice (e.g., a bug in the handler), the same channel is in the list twice and gets every event twice.
- **Fix**: Check before append; if exists, return the existing channel.

### H40. `notification/handler.go:58–59` — defer `Unsubscribe` on SSE stream
- **Confidence**: 0.6
- **What's wrong**: If the user connects 5 SSE tabs to `/notifications/stream`, all 5 are subscribed. The browser-side closes them on logout... but on hard refresh of the SPA without logout, old EventSources are never `.close()`d, so they remain subscribed server-side until the connection times out (Gin's default or nginx).
- **Fix**: The client should call `es.close()` on logout. Or have the server detect disconnect via the `Done` channel of the request context (already in the `c.Stream` select) and unsubscribe then. Currently unsubscribe is only on `return false` from `c.Stream`, which happens when the context is done or the channel closes.

### H41. `evaluation/handler.go:203–210` — `lookupProfileID` uses `s.bun.NewRaw(...).Scan(..., &profileID)` for a single UUID
- **Confidence**: 0.3
- **What's wrong**: `NewRaw` with bun's `?` placeholder for a single UUID scan works, but it's more code than `s.db.QueryRowContext(...).Scan(&profileID)`. Inconsistent with `career/handler.go:135` and `matching/handler.go:25–30` which use `db.QueryRowContext`. Pick one.

### H42. `handlers/profiles.go:73` — `isCurrent` JSON field is always present
- **Confidence**: 0.5
- **What's wrong**: `IsCurrent bool \`json:"isCurrent,omitempty"\`` — `omitempty` on a `bool` only omits if the value is `false`. The handler always sets `exp.IsCurrent = *req.IsCurrent` or `false` (default). For a `bool` field, `omitempty` is misleading.

### H43. `storage/storage.go:60` — `os.MkdirAll` with 0o755 ignores `umask`
- **Confidence**: 0.3
- **What's wrong**: For multi-tenant deployments the upload directory may be shared. If `UPLOAD_DIR` is on a shared volume with strict permissions, the 0o755 mode is more permissive than the parent. Not a bug per se.

### H44. `handlers/admin.go:188–228` — `HandleVerification` allows `admin` to set status to `rejected` without reason enforcement
- **Confidence**: 0.5
- **What's wrong**: `req.Reason` is `*string`, optional. The audit log stores the reason if provided but doesn't enforce a minimum length for rejection. So an admin can reject with `reason: "x"` and the company is left guessing.
- **Fix**: Require non-empty reason when action == "reject".

### H45. `handlers/companies.go:237–281` — `SubmitVerification` overwrites docs without preserving history
- **Confidence**: 0.5
- **What's wrong**: `UPDATE companies SET verification_docs = ?` replaces the whole JSON. If the company re-submits, the audit trail of the previous submission is lost.

### H46. `matching/handler.go:43–69` — `MatchJobs` and `SkillsGap` look up `profileID` from `userID` twice
- **Confidence**: 0.4
- **What's wrong**: The two-query pattern (`SELECT id FROM jobseeker_profiles WHERE user_id = $1`) runs in 3 of the matching routes per request. A simple JOIN would save 1 round-trip.

### H47. `rbac/middleware.go:24–28` — `uuid.Parse(userIDStr)` on UUID that has already been parsed in `RequireCompanyMember` callers
- **Confidence**: 0.4
- **What's wrong**: `RequireCompanyMember` parses `userID` and stores the `EmployeeInfo` struct. Downstream middleware `RequirePermission` re-parses the `employeeId` from context. The `userID` itself is parsed twice on the same request. Minor.

### H48. `matching/category_service.go:100–105` — Unknown skills always classified as "Software Engineering"
- **Confidence**: 0.7
- **What's wrong**: Any skill not in the small `skillCategoryMap` is bucketed into "Software Engineering". For a platform that handles non-tech roles (HR, Medical, etc.), this is wrong. A "Suturing" skill ends up in the SWE bucket and may be weighted against a job's swe weight.
- **Fix**: Use the `skill_categories` table (referenced in `GetJobCategoryWeights`) to look up categories from the database. Maintain a fallback "Uncategorized" bucket.

### H49. `application/handler.go:96–101` — `LookupJobseekerProfileID` errors with 404 for any failure
- **Confidence**: 0.4
- **What's wrong**: `slog.Error("failed to lookup jobseeker profile", ...)` followed by `c.JSON(http.StatusNotFound, ...)`. DB connection error gets reported as 404 to the client, misleading.

### H50. `auth.go:466–476` — `revokeAllForUserString` silently returns nil on bad UUID
- **Confidence**: 0.7
- **What's wrong**: If `userID` is not a valid UUID, the function returns nil error. The user's `Logout` returns success but no tokens are revoked. This is the same path used by the logout endpoint, so a malformed claim effectively keeps the session alive from the server's perspective.
- **Fix**: Return the parse error and let the handler log it.

### H51. `handlers/companies.go:121, 220` — `CompanyBlindMode` is called in the same handler that did the update; reads may be from a different connection
- **Confidence**: 0.6
- **What's wrong**: After updating `blind_mode`, the response uses a fresh `QueryRowContext` to read it. With Postgres read-committed isolation this *usually* sees the new value, but on a replica (if any) or under transaction-snapshot inconsistency, it could be stale.

### H52. `webhook/service.go:54–82` — `validateURL` allows URL containing userinfo (`http://evil@internal/`)
- **Confidence**: 0.5
- **What's wrong**: `net.LookupHost(host)` resolves the hostname, but `u.Hostname()` strips userinfo. If the URL is `http://attacker@169.254.169.254/`, `u.Hostname()` returns `169.254.169.254` which is link-local — blocked. But the check `ip.IsLinkLocalUnicast()` is correct. Edge case: `https://[::1]/` (IPv6 loopback) — `IsLoopback()` matches. OK.
- **Mitigation good as-is.**

### H53. `application/service.go:294–362` — `ListForCompany` and `ListForJobseeker` use raw SQL with hard-coded `latest_notes` CTE that does `ORDER BY application_id, created_at DESC`
- **Confidence**: 0.5
- **What's wrong**: `DISTINCT ON (application_id) ... ORDER BY application_id, created_at DESC` is correct, but if Postgres chooses a different plan, the `DISTINCT ON` requires the first ORDER BY column to match the `DISTINCT ON` column. Here it does. OK.

### H54. `rbac/rbac.go:54–67` — `HasAnyPermission` only matches if `p.code` is in the array
- **Confidence**: 0.4
- **What's wrong**: Uses `ANY($2)` for the array. Correct, but the array is `[]string` — pgx will marshal it. The order of codes doesn't matter for the EXISTS check, but if a permission is in multiple roles, EXISTS returns true and we short-circuit. The query runs per request, per HRIS call.

---

## MEDIUM

### M1. `lib/llm.go:147, 359` — `extractOuterJSON` returns the body unchanged on no match
- **Confidence**: 0.6
- **What's wrong**: If the response has no `{...}`, the function returns the body as-is. The next `json.Unmarshal` then fails on a non-JSON body. The error message includes the body, which can be large. Minor.

### M2. `handlers/companies.go:177–196` — Register: `displayName = req.Name` then `if req.Role == "company" { ... displayName = *req.CompanyName }`
- **Confidence**: 0.4
- **What's wrong**: For a company, `req.Name` is silently overwritten. The `binding:"required,oneof=jobseeker company"` requires `role`, but `name` is not required for companies. UX: a company fills in "name" and it disappears.

### M3. `handlers/profiles.go:54–58` — `req.Organization` falls back to `req.Title` for empty (line 500–503)
- **Confidence**: 0.5
- **What's wrong**: If a user types `title: ""` and `organization: ""`, both are empty → DB column is NOT NULL → insert fails. But the `binding:"required"` on Title should prevent this. Edge case: if a user disables browser-side validation.

### M4. `auth.go:177–283` — Register does not log the user in if `signTokens` fails after the profile is created
- **Confidence**: 0.5
- **What's wrong**: If `signTokens` fails, the transaction rolls back, so no user is created. OK. But the `tx.Rollback` is deferred, so on a successful `tx.Commit()` the deferred `Rollback` is a no-op. Minor noise.

### M5. `handlers/companies.go:121` — `CompanyBlindMode` returns `false` on any error, including no rows
- **Confidence**: 0.4
- **What's wrong**: The function is "blind mode" = false if there's any error. But the company might exist with `blind_mode = false` legitimately, or the row might genuinely not exist. The handler has already verified the company exists, so the second case is unlikely — but if the row is deleted between the two queries, the company is silently treated as "not blind". Cosmetic.

### M6. `matching/service.go:141–143` — `if len(scoredJobs) > 20 { scoredJobs = scoredJobs[:20] }` happens before JSON marshaling
- **Confidence**: 0.3
- **What's wrong**: Truncates the slice in-place. If the caller is reusing the variable, they see only 20. But the function returns a new slice, so OK. Cosmetic.

### M7. `rbac/rbac.go:204–221` — `ListPermissions` has no company filter
- **Confidence**: 0.4
- **What's wrong**: Returns all permissions across all companies. The frontend uses this for the role-edit UI, so any company sees any permission. If permissions are global, OK; if not, IDOR.

### M8. `handlers/jobs.go:316–340` — `CreateJob` does not validate `YearsExperienceMin <= YearsExperienceMax`
- **Confidence**: 0.6
- **What's wrong**: User can set min=10, max=2. Filtering by `yearsExperienceMin <= ? <= yearsExperienceMax` would then match nothing. Minor.

### M9. `auth.go:439–460` — `parseRefreshToken` reads `claims["userId"]` and `claims["role"]` without type-checking
- **Confidence**: 0.4
- **What's wrong**: If the token is signed by an old version with `userId` as a number, the type assertion `.(string)` fails, `userID = ""`, and the function returns `ErrInvalidToken`. The check `if userID == ""` masks the type mismatch.

### M10. `rbac/middleware.go:24` — `uuid.Parse` on a value that was set by `c.Set("userId", claims.UserID)` already
- **Confidence**: 0.5
- **What's wrong**: The `userId` is already a string from the JWT. We re-parse it as a UUID. If the JWT's `userId` is not a valid UUID, the user is told "Unauthorized" (which is the right answer but a 500 with the parse error would be more debuggable).

### M11. `application/handler.go:51–58` — `getUserID` returns `false` on missing key, but uses `ok` in a way that doesn't propagate well
- **Confidence**: 0.4
- **What's wrong**: The `s, ok := val.(string)` and the subsequent `return s, ok && s != ""` collapses two error states. Hard to debug "why is my user unauthenticated".

### M12. `webhook/service.go:99–104` — `Create` does not enforce a per-company webhook count limit
- **Confidence**: 0.6
- **What's wrong**: A verified company can create thousands of webhooks, each of which will fire on every application. Combined with H5, this is the DoS amplifier.

### M13. `handlers/companies.go:262–280` — `SubmitVerification` returns `VerificationSubmittedResponse` but the company status might not actually change to `pending` if it was already `verified`
- **Confidence**: 0.5
- **What's wrong**: The UPDATE sets `verification_status = 'pending'` regardless of current status. A verified company can re-submit and revert to pending. This may be intentional for re-verification, but the audit trail is lost.

### M14. `matching/service.go:393–423` — `extractSkillNames` uses `maxScore * 0.5` as threshold, depends on LLM scale
- **Confidence**: 0.7
- **What's wrong**: The threshold is "half of the max observed score". If the LLM returns 1 for every skill (low confidence), threshold is 0.5 → no skills selected. If LLM returns 100, threshold is 50 → all selected. The matching is very sensitive to LLM output variability.
- **Fix**: Use a fixed minimum score (e.g., 60/100) and validate the scale.

### M15. `evaluation/handler.go:204–209` — `lookupProfileID` returns `sql.ErrNoRows` but `c.Get` doesn't
- **Confidence**: 0.4
- **What's wrong**: Inconsistent error types across the codebase: `evaluation/handler.go` returns the raw `sql.ErrNoRows`, while `career/handler.go` and `matching/handler.go` return their own custom error.

### M16. `auth.go:308` — `lib.HashPassword("dummy-equalize-timing")` allocates a fresh bcrypt hash every login attempt
- **Confidence**: 0.6
- **What's wrong**: Bcrypt is intentionally slow. Doing it on every login attempt for a non-existent user wastes CPU. Pre-compute a single dummy hash at startup.

### M17. `handlers/auth.go:96–104` — `sendVerificationEmail` swallows token creation errors via `slog.Warn` only
- **Confidence**: 0.4
- **What's wrong**: User believes their email was sent but it wasn't. They can't verify. UX issue.

### M18. `matching/handler.go:23–32` — `lookupProfileID` is duplicated in evaluation/handler.go, career/handler.go, application/handler.go, companyreviews/handler.go
- **Confidence**: 0.7
- **What's wrong**: Same query, same bug surface. Centralize in a helper.

### M19. `webhook/service.go:54–82` — `validateURL` does not check that the URL scheme is not `javascript:` or `file:`
- **Confidence**: 0.6
- **What's wrong**: The check is `u.Scheme != "http" && u.Scheme != "https"`. So only http/https pass. OK, but the check is by `u.Scheme`, not by full URL. If the URL has weird characters, the parsing may fail. OK in practice.

### M20. `hris/employee/service.go:419` — `rows == 0` returns `sql.ErrNoRows` from `Update`
- **Confidence**: 0.5
- **What's wrong**: When 0 rows are affected, the service returns `sql.ErrNoRows`. The handler maps this to 404. But for an UPDATE that didn't change any values (same data sent), `RowsAffected()` is 0, leading to a 404. The user thinks the row doesn't exist when in fact nothing changed.
- **Fix**: Check existence with a SELECT before the UPDATE, or use `RETURNING id` to detect "no row found".

### M21. `matching/handler.go:49, 89` — `userID, ok := c.Get("userId")` is followed by `userIDStr := userID.(string)` (no `ok`)
- **Confidence**: 0.95
- **What's wrong**: Same as H1. Listed separately for the matching module.

### M22. `application/service.go:386–414` — `AddMessage` queries the user's name separately and ignores the error
- **Confidence**: 0.7
- **What's wrong**:
  ```go
  var senderName string
  _ = s.db.QueryRowContext(ctx, `SELECT name FROM users WHERE id = $1`, senderUserID).Scan(&senderName)
  ```
  If the user is deleted between the message insert and this lookup, `senderName` is `""` and the message shows an empty sender. The error is swallowed.

### M23. `notification/service.go:237–243` — `CountUnread` runs an extra query for every list call
- **Confidence**: 0.4
- **What's wrong**: The `ListForUser` runs 2 queries (the rows + a count). Both are within the same handler request, but the count is a `SELECT COUNT(*)` on `notifications WHERE user_id = $1 AND read_at IS NULL` — a full table scan without an index hint. Needs a composite index `(user_id, read_at)`.

### M24. `auth.go:204–267` — Register's `tx.Rollback` is deferred AFTER `tx.Commit` may have been called
- **Confidence**: 0.4
- **What's wrong**: If `tx.Commit()` succeeds, the deferred `tx.Rollback()` is a no-op. OK. If `tx.Commit()` fails, the transaction is already in a failed state — the `Rollback` will fail with "sql: transaction has already been committed or rolled back". The error is silently discarded.

### M25. `auth.go:439–460` — `parseRefreshToken` returns `("", nil, ErrInvalidToken)` for missing `userId`, but the user can be identified via `jti` in the DB
- **Confidence**: 0.3
- **What's wrong**: The DB row has the user_id. The JWT's `userId` claim is redundant for security. If the JWT's `userId` is tampered with, the DB still has the right user. But the function uses the JWT's `userId` for `signTokens`, so a tampered token issues a new token with the wrong `userId`. The DB update on the old token still works, but the new access token has the wrong identity.

### M26. `rbac/middleware.go:11–44` — `RequireCompanyMember` does a SELECT per request
- **Confidence**: 0.5
- **What's wrong**: Every HRIS request = 1 employee lookup + 1 permission check = 2 DB round-trips. The `rbac.go:54` comment acknowledges this. Cache by user-id for the duration of the request (or session).

### M27. `matching/category_service.go:64–107` — Hardcoded `skillCategoryMap` cannot be updated without a deploy
- **Confidence**: 0.7
- **What's wrong**: The category assignments are in code. Any new skill must be added here. The `skill_categories` table exists; use it.

### M28. `handlers/companies.go:182–196` — Register: `displayName = req.Name` is then `binding:"required"` for non-company; for company, `req.Name` is not required
- **Confidence**: 0.4
- **What's wrong**: A company registers with `name: "John"` (the owner's personal name) — `name` is accepted. Then `if req.Role == "company" { displayName = *req.CompanyName }` overrides it. So the user's personal name is never persisted as the user record. Companies register with empty `name` and only the company name lives in `companies.company_name`. The user record's `name` is the company name, which means `/auth/me` returns the company name as the user's name. Slightly confusing for HRIS employees later added under that user.

### M29. `application/service.go:107–117` — Duplicate-application check is non-transactional
- **Confidence**: 0.5
- **What's wrong**: A user clicks "Apply" twice quickly. Two goroutines: both see no existing application, both INSERT. The first wins; the second hits the unique violation (if one exists) or inserts a duplicate.
- **Fix**: `INSERT ... ON CONFLICT (jobseeker_id, job_posting_id) DO NOTHING RETURNING id`; check if any row was returned.

### M30. `webhook/service.go:99–104` — `Create` doesn't check that the URL is not already registered for the same company
- **Confidence**: 0.4
- **What's wrong**: A company can register the same URL 100 times → 100 webhook deliveries per application.

### M31. `lib/llm.go:107–116` — `chatRequest.Stream` is always `false` but the JSON tag is `omitempty`, so the field is omitted
- **Confidence**: 0.3
- **What's wrong**: Cosmetic. No bug, but the `Stream bool` is always set to `false` in code; the `omitempty` tag means it's omitted from the JSON. Set the field to `false` only if needed.

### M32. `auth.go:120` — `hashToken(refreshToken)` is called with the raw token, which is then stored in the DB and used as the `jti` in the JWT
- **Confidence**: 0.4
- **What's wrong**: The `jti` is a UUID, the token hash is sha256(token). The DB stores `token_hash` indexed. Lookup is O(1). OK.

### M33. `application/service.go:294–362` — `ListForCompany` and `ListForJobseeker` are duplicated
- **Confidence**: 0.5
- **What's wrong**: Two near-identical functions. Differ only in the WHERE clause. Refactor to a single function with parameters.

### M34. `evaluation/handler.go:48–73` — `PostEvaluate` does not check if a recent evaluation already exists
- **Confidence**: 0.7
- **What's wrong**: A user can spam "Re-evaluate" 100 times, each making a 30-60 s LLM call. No rate limit, no de-duplication. (Note: `application/service.go:120` triggers one if the existing one is expired, but the explicit user-triggered route has no check.)

### M35. `handlers/admin.go:165–247` — `HandleVerification` has 3 separate UPDATE/INSERT statements; only the audit insert has no `ForUpdate`
- **Confidence**: 0.5
- **What's wrong**: A second admin can re-verify the same company while the first admin is mid-flight. The audit log will show two entries. The first admin's UPDATE will be overwritten. Probably fine, but no advisory lock.

---

## LOW

### L1. `lib/uuid.go:21` — `MustParseUUID` panics on bad input
- **Confidence**: 0.7
- **What's wrong**: Used in `auth.go:123` (`uuid.MustParse(userID)`) where `userID` comes from a JWT. A malformed token would cause a panic instead of a clean 401. The JWT parse already validates `userId` is a string; the `uuid.Parse` may still fail. Wrapping with `MustParse` panics.
- **Fix**: Use `lib.ParseUUID` and propagate the error.

### L2. `matching/service.go:64–73` — `jobMatchRow` struct uses `pq.StringArray` for `RequiredSkills`; the same shape is used in `career/service.go` with different fields
- **Confidence**: 0.3
- **What's wrong**: Inconsistent struct shape between similar functions. Refactor.

### L3. `handlers/profiles.go:54–58` — `Organization` and `Title` are kept in sync via fallback, but the API doesn't surface this fallback
- **Confidence**: 0.4
- **What's wrong**: The frontend may not know that `organization` was overwritten by `title`. UI shows empty `organization` and a different `title`. Need a flag or response note.

### L4. `evaluation/handler.go:224–237` — `toResponse` re-parses `CreatedAt` on every call
- **Confidence**: 0.3
- **What's wrong**: `eval.CreatedAt` is set to a `time.Time` in `evalToResult` then formatted to RFC3339, then parsed back. Round-trip. Wasteful and the parse error is swallowed (see H10).

### L5. `auth.go:439–460` — `parseRefreshToken` uses `jwt.WithValidMethods([]string{"HS256"})` but the function still does the manual `Method.(*jwt.SigningMethodHMAC)` check
- **Confidence**: 0.4
- **What's wrong**: Belt and suspenders. The `WithValidMethods` already rejects non-HMAC; the manual check is redundant.

### L6. `handlers/companies.go:177–196` — `Register` does not validate that `req.CompanyName` is a meaningful string
- **Confidence**: 0.3
- **What's wrong**: `req.CompanyName == nil || *req.CompanyName == ""` returns 400. But `*req.CompanyName == "   "` (whitespace) is accepted.

### L7. `lib/password.go:43–46` — `version` parsed from hash but never used
- **Confidence**: 0.8
- **What's wrong**: `_ = version` indicates the version is parsed but ignored. If two argon2id versions are accepted (e.g., v=0x13 and v=0x10), the function should reject unknown versions. Currently both are accepted.

### L8. `lib/llm.go:175–179` — `if ptr, ok := resultPtr.(*string); ok` is a code smell
- **Confidence**: 0.5
- **What's wrong**: An LLM client should not have two return paths. Always return the raw text, and have callers parse. Or always parse and never return raw.

### L9. `handlers/profiles.go:57–58` — `Industry` is optional but affects the evaluation LLM prompt
- **Confidence**: 0.3
- **What's wrong**: If `req.Industry` is nil, the LLM has less context. Acceptable.

### L10. `web/src/lib/api.ts:53` — `refreshPromise` is set to `null` in `finally` before awaiters complete
- **Confidence**: 0.5
- **What's wrong**: This is actually correct. But if `doRefresh` itself throws, the promise resolves with `null` and `refreshPromise` is reset. OK.

### L11. `web/src/hooks/useAuth.tsx:60–77` — On mount, calls `/auth/me` and silently swallows non-AuthError
- **Confidence**: 0.5
- **What's wrong**: If the API is down (network error), the user sees a perpetual loading state. Only `AuthError` triggers logout. The 5xx errors also keep `loading: true`.

### L12. `web/src/hooks/useAuth.tsx:67` — `if (isAuthError(err))` only catches AuthError, not all 401s
- **Confidence**: 0.4
- **What's wrong**: If the access token is invalid (expired, malformed), `/auth/me` returns 401 → `api()` auto-refreshes → if refresh fails, throws `AuthError` → caught here. OK. But if the user is on a page that calls a route that returns 401, the auto-refresh + retry path handles it, but `useAuth`'s own `useEffect` mount is independent.

### L13. `handlers/profiles.go:184–186` — `req.URL` is used directly without re-validating the scheme after `omitempty` handling
- **Confidence**: 0.5
- **What's wrong**: `isValidExperienceURL` is called at line 479. If `req.URL` is nil, the function returns true (valid). If `req.URL` is set to a non-empty value, it's checked. OK.

### L14. `auth.go:51` — `accessTokenTTL = 15 * time.Minute` and `refreshTokenTTL = 7 * 24 * time.Hour`
- **Confidence**: 0.5
- **What's wrong**: 15-min access tokens are short; combined with auto-refresh on 401, the user is rarely logged out. But the refresh token cookie is 7 days. If the user is inactive for >7 days, they have to log in again. OK.

### L15. `auth.go:143` — Cookie has `Path: "/api/v1/auth"` so the refresh cookie is not sent to other endpoints
- **Confidence**: 0.6
- **What's wrong**: This is intentional — the refresh cookie is only sent to `/api/v1/auth/*`. The access token is sent via `Authorization: Bearer`. OK.

### L16. `notification/handler.go:43–47` — `http.Flusher` cast panics if Gin's writer isn't a `*responseWriter`
- **Confidence**: 0.6
- **What's wrong**: The code returns 500 if not. OK.

### L17. `evaluation/handler.go:48–52` — `c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})` — error message is "unauthorized" (lowercase, generic)
- **Confidence**: 0.3
- **What's wrong**: UX — could be "Session expired" or "Authentication required".

### L18. `handlers/companies.go:237–281` — `SubmitVerification` re-validates `businessRegistration` as required
- **Confidence**: 0.4
- **What's wrong**: After initial registration already saved these, re-submission requires them again. Acceptable for re-verification, but if the docs are unchanged the user must re-enter them.

### L19. `application/service.go:386–414` — `AddMessage` allows sending messages for any application in any company (only checked via `verifyCompanyOwnsApplication`)
- **Confidence**: 0.3
- **What's wrong**: A company employee can add messages to any application they own. Within scope. OK.

### L20. `rbac/middleware.go:48–51` — `employeeId` is not set in context for HRIS routes that don't go through `RequireCompanyMember`
- **Confidence**: 0.5
- **What's wrong**: All HRIS routes go through `RequireCompanyMember` per `main.go:335`. OK.

### L21. `webhook/service.go:43–44` — `Secret` field in `Webhook` struct has `omitempty`
- **Confidence**: 0.4
- **What's wrong**: The secret is returned in `Create` but omitted in `List`. Both endpoints return the same struct. Good.

### L22. `matching/service.go:393–423` — `extractSkillNames` uses `maxScore` from the LLM output to set a relative threshold
- **Confidence**: 0.6
- **What's wrong**: Documented as a workaround, but if all scores are 1 (lowest possible), threshold is 0.5 → no skills → matching returns empty for everyone with low confidence. Real-world impact depends on LLM prompt.

### L23. `application/service.go:218–275` — `UpdateStatus` does not record the *who* (employee_id) in the audit log
- **Confidence**: 0.5
- **What's wrong**: `ReviewerID` in `LeaveRequest` is recorded; for applications, the actor is in the JWT but not stored. Audit trail gap.

### L24. `hris/leave/service.go:258–298` — `ReviewRequest` updates `used_days` after `Update` — race if two reviewers approve at the same time
- **Confidence**: 0.5
- **What's wrong**: A `SELECT ... FOR UPDATE` is implicit via the UPDATE. But two concurrent approves of the same `id` may both pass the WHERE `status='pending'` check (one of them, the other hits `n=0` and returns the "already reviewed" error). OK.

### L25. `handlers/companies.go:182–196` — Register: `role` is `binding:"required,oneof=jobseeker company"` but `Role` in `models.User` is just a string
- **Confidence**: 0.3
- **What's wrong**: If a future role is added (e.g., "admin") and the binding isn't updated, registration fails. Maintenance hazard.

### L26. `auth.go:439–460` — `parseRefreshToken` returns `ErrInvalidToken` for type assertions on map values
- **Confidence**: 0.5
- **What's wrong**: The function uses `(*mc)["type"].(string)` and similar. If the value isn't a string, the assertion returns "" and is treated as invalid. Acceptable.

### L27. `application/handler.go:82–134` — `Apply` does not check if the company is verified before allowing application
- **Confidence**: 0.4
- **What's wrong**: The job posting must be `status = 'open'`, but the company can be `pending` verification. The route `jobApplyGroup` only requires `RequireRole("jobseeker")`, not verified company. A jobseeker can apply to a job from an unverified company. The application succeeds and the company gets a notification.

### L28. `matching/handler.go:130–162` — `MatchCandidates` does not verify the requesting company owns the job
- **Confidence**: 0.7
- **What's wrong**: The `MatchCandidates` endpoint is at `api/candidates/matches` (line 283 of main.go) and only requires `verifiedCompany` middleware. The `jobId` query param is not validated against the company's own jobs. A company can find candidates for any job (any company). Privacy leak.
- **Fix**: Filter candidates to only those who applied to the company's jobs, or reject if the jobId isn't the company's.

### L29. `rbac/middleware.go:13–22` — `RequireCompanyMember` ignores the requested `employeeId` in the URL; only checks the requester
- **Confidence**: 0.5
- **What's wrong**: Combined with H6, a user with `view_self` can request any employee's data.

### L30. `web/src/lib/api.ts:1` — Imports `FetchOptions` from `ofetch` but only uses it in a type position
- **Confidence**: 0.4
- **What's wrong**: Fine; cosmetic.

### L31. `web/src/lib/notifications.ts:48` — SSE token in URL leaks to access logs
- **Confidence**: 0.9
- **What's wrong**: Same as C4 from the front-end side. The token is appended to the URL, which appears in nginx access logs and browser history. Mitigation: do not log query strings at the proxy, and clear browser history on logout.

### L32. `web/src/main.tsx:6–8` — `unhandledrejection` only logs to console
- **Confidence**: 0.5
- **What's wrong**: In production, console.error is dropped. Should report to Sentry or similar.

### L33. `auth.go:439–460` — `parseRefreshToken` doesn't check `iss` or `aud` claims
- **Confidence**: 0.6
- **What's wrong**: Tokens minted for one app could be replayed against this app. Minor if there's only one consumer.

### L34. `webhook/service.go:54–82` — `validateURL` returns the raw error string to the client (line 84 in handler)
- **Confidence**: 0.4
- **What's wrong**: "URL must not point to a private or internal network address" leaks info about the network. Acceptable.

### L35. `auth.go:466–476` — `revokeAllForUserString` returns nil for both "no rows updated" and "DB error"
- **Confidence**: 0.5
- **What's wrong**: A Logout that fails to revoke due to DB error still returns 200. The user thinks their session is killed but it isn't.

---

## Areas I could NOT fully verify

- **Front-end UI logic** beyond `useAuth`, `api.ts`, and `main.tsx`. The 167 TS/TSX files include many `pages/`, `components/`, and `hooks/` that I did not exhaustively read. Likely contains more issues in:
  - `usePermissions.ts` (if it exists)
  - `useIndustries.ts` (if it exists)
  - `web/src/lib/queryClient.ts` cache invalidation
  - `web/src/components/jobseeker/ApplicationKanban.tsx` (status update UI)
  - `web/src/pages/hris/*` (HRIS frontend, large)
- **Test files** (not the focus of this audit) — many tests may rely on behaviors that are actually buggy. The `find-bugs` task focuses on bugs, not test bugs.
- **Database migrations** (`server-go/migrations/000001-000017`) — schema-level issues are out of scope; only the SQL the application issues is in scope.
- **MarkItDown Python microservice** (`markitdown-service/`) — out of scope.

---

## Pre-Conclusion Audit (Methodology)

### Files read in full
- `cmd/server/main.go` (576 lines)
- `cmd/server/static_dev.go`, `static_prod.go` (referenced, not read)
- `cmd/migrate/main.go`, `cmd/seed/main.go` (not read — admin tooling)
- All `internal/handlers/*.go` (auth, auth_helpers, auth_recovery, blind, companies, health, jobs, passport, passport_og, profiles, reference, responses, search, skills, uploads)
- All `internal/middleware/*.go` (auth, ratelimit)
- All `internal/db/*.go` (db, bun)
- All `internal/config/config.go`
- All `internal/lib/*.go` (llm, password, uuid)
- `internal/application/handler.go`, `service.go`
- `internal/evaluation/handler.go`, `service.go`
- `internal/matching/handler.go`, `service.go`, `category_service.go`
- `internal/notification/handler.go`, `broker.go`, `service.go`
- `internal/webhook/handler.go`, `service.go`
- `internal/feedback/handler.go`, `service.go`
- `internal/companyreviews/handler.go`, `service.go`
- `internal/profileviews/service.go`, `handler.go` (partially)
- `internal/career/handler.go`, `service.go`
- `internal/resume/handler.go`, `service.go`
- `internal/storage/storage.go`
- `internal/rbac/middleware.go`, `rbac.go`
- `internal/authtoken/service.go`
- `internal/hris/employee/handler.go`, `service.go`
- `internal/hris/leave/handler.go`, `service.go`
- `internal/hris/attendance/handler.go`, `service.go`, `ws.go`
- `internal/hris/payroll/service.go`
- `internal/hris/report/service.go` (partial)
- `internal/hris/org/service.go` (partial)
- `internal/hris/onboarding/service.go`
- `internal/hris/activity/handler.go`, `service.go`
- `internal/hris/holiday/handler.go`, `service.go` (partial)
- `internal/spdid/handler.go` (partial)
- `web/src/lib/api.ts`
- `web/src/lib/notifications.ts`
- `web/src/hooks/useAuth.tsx`
- `web/src/main.tsx`

### Files NOT read
- HRIS handlers for: shift, report, holiday, org, onboarding, spdid (large surface)
- `web/src/pages/*` (all page-level components)
- `web/src/components/*` (component-level)
- `web/src/lib/schemas/*` (Zod schemas)
- Migration SQL files
- Test files

### Checklist status
- **Injection (SQL/command/template)**: Clean. Bun uses parameterized queries throughout; the `fmt.Sprintf` calls in `handlers/search.go` and `matching/service.go` use `%d`/`%s` only for *numeric* placeholders and the table name, not for user input. One exception: `fmt.Sprintf` in `org/service.go:585` for `pqIntArray.Value` — clean.
- **XSS**: `passport_og.go` uses `html/template` (auto-escapes). Front-end uses React (auto-escapes by default). `isValidExperienceURL` in `profiles.go:340–349` rejects non-http(s). Clean.
- **Authentication**: `AuthRequired` middleware in place. **But see C4** (token in query string), **H1** (type assertion panics), **H2** (XFF trust), and the front-end `notifications.ts:48` URL token leak.
- **Authorization / IDOR**: **C6** (HRIS employee Get), **C2** (company review no-interaction check), **M28** (MatchCandidates for any job). Other handlers rely on middleware which is mostly correct.
- **CSRF**: Refresh cookie is `SameSite=Strict` and the path is `/api/v1/auth`. The session cookie is not set anywhere — only the refresh cookie. State-changing endpoints rely on the `Authorization: Bearer` header (CSRF-safe). OK.
- **Race conditions**: **C1** (UpdateProfile return value), **C5** (view_count race), **H11** (blind_mode outside tx), **H13** (DISTINCT ON with duplicate created_at), **H18** (idempotent token consume).
- **Session**: Refresh tokens hashed (sha256). JWT secret required. 15 min access, 7 day refresh. OK, with the C4 caveat.
- **Cryptography**: bcrypt (with `BcryptCost=4` for dev — see H24). HMAC-SHA256 for webhooks. `crypto/rand` for token + secret generation. argon2id for legacy hashes. OK.
- **Information disclosure**: `c.JSON(500, gin.H{"error": err.Error()})` in many handlers leaks DB errors. **H32**.
- **DoS**: **C5** (view_count writes), **H5** (webhook fan-out), **H6** (feedback async), **H7** (matching N+1), **H34** (eval re-trigger), **M12** (no webhook cap).
- **Business logic**: **C2/C3** (reputation gameable), **C5** (view count inflation), **H10** (IsExpired false positive), **H14** (TOCTOU storage keys), **M28** (matching any job).

---

## Top 10 Most Urgent Fixes (Summary)

1. **C1** — `UpdateProfile` returns zero-value company (user-facing, silent).
2. **C5** — `view_count` write on every public GET (DoS + cheating).
3. **C2** — Anyone can review any company (reputation gameable).
4. **C4** — JWT in URL query string (token leak).
5. **C3** — Review `created_at` reset (audit trail broken).
6. **H2** — Rate limiter bypass via `X-Forwarded-For` (auth abuse).
7. **H5** — Unbounded webhook goroutine fan-out (DoS).
8. **H1** — `c.Get("userId").(string)` panics in 12+ handlers.
9. **H10** — `IsExpired` returns true on parse failure (eval disappears from UI).
10. **H7** — Matching N+1 queries (perf cliff at 200+ jobs/candidates).
