# Comprehensive Codebase Audit — SkillPass

**Date:** 2026-06-30
**Scope:** server-go/ (Go/Gin) + web/ (React/Vite) + markitdown-service (Python)
**Audit agents:** security-auditor, bug-hunter, code-reviewer, test-runner

---

## Summary

| Area | Status |
|------|--------|
| **Security** | 7 findings (2 High, 3 Medium, 2 Low) |
| **Bugs** | 9 findings (1 Critical, 1 High, 5 Medium, 2 Low) |
| **Code Quality** | 11 findings (1 Critical, 2 High, 4 Medium, 4 Low) |
| **Tests** | ✅ Web: 35/35 passed · Server: 22/22 packages passed |

**Consolidated priority order:** 1 Critical, 3 High, 8 Medium, 6 Low (some findings overlap across agents)

---

## Critical (1)

### C-001: Premature `URL.revokeObjectURL()` — Silent Download Failure

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter, code-reviewer | `web/src/pages/JobseekerProfile/ResumeImport.tsx` | 91 |

`URL.revokeObjectURL(url)` is called synchronously on the line after `a.click()`, before the browser starts the download. In Chromium, the object URL is revoked before the fetch begins, so no file is saved with no error feedback.

**Fix:** Revoke in a `setTimeout(1000)` or attach to a load-equivalent event.

---

## High (3)

### H-001: MarkItDown HTTP Call — No Timeout / No Context

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter, code-reviewer | `server-go/internal/resume/handler.go` | 153, 159 |

`convertWithMarkItDown` uses `http.DefaultClient` (zero timeout) and `http.NewRequest` instead of `http.NewRequestWithContext`. If the MarkItDown microservice hangs, the goroutine leaks. Under sustained traffic this exhausts the goroutine pool.

**Fix:**
```go
req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodPost, url, &buf)
client := &http.Client{Timeout: 30 * time.Second}
resp, err := client.Do(req)
```

### H-002: Rate Limiter Bypass via `X-Forwarded-For`

| Agent(s) | File | Line |
|----------|------|------|
| security-auditor | `server-go/internal/middleware/ratelimit.go` | 86–97 |

The `clientIP()` function unconditionally trusts the `X-Forwarded-For` header without validation. An attacker spoofs the header to bypass per-IP rate limiting on auth endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`).

**Fix:** Use `gin.Context.ClientIP()` (which respects `SetTrustedProxies`) or validate against known proxy IPs.

### H-003: Weak Default JWT Secret

| Agent(s) | File | Line |
|----------|------|------|
| security-auditor | `server-go/.env.example` | 4 |

`JWT_SECRET=skillpass-dev-secret-change-in-prod` is checked into git. Anyone with repo access can forge valid JWTs for any user/role.

**Fix:** Add a startup guard that rejects known-weak secrets in production (`GIN_MODE=release`). Document randomization in pre-startup scripts.

### H-004: `ListBranches` Silent Active-Only Filter

| Agent(s) | File | Line |
|----------|------|------|
| code-reviewer | `server-go/internal/hris/org/service.go` | 87 |

`AND is_active = TRUE` was hardcoded into `ListBranches` with no opt-out parameter. Callers that need inactive branches (admin restore/UIs) get silently truncated results.

**Fix:** Add a `showInactive` query parameter or split into `ListActiveBranches` / `ListAllBranches`.

### H-005: Typed-nil Guard Gap in Employee Update

| Agent(s) | File | Line |
|----------|------|------|
| code-reviewer | `server-go/internal/hris/employee/service.go` | 358–380 |

The `addField` switch handles `*string`, `*uuid.UUID`, `*float64` but falls through silently for unhandled types (e.g. `*bool`, `*int`). Future nullable fields could silently insert NULL.

**Fix:** Add a `default` case or use reflection (`reflect.ValueOf(val).IsNil()`).

---

## Medium (8)

### M-001: DB Error Info Disclosure in Search Handler

| Agent(s) | File | Line |
|----------|------|------|
| security-auditor | `server-go/internal/handlers/search.go` | 99, 117, 124, 158, 169 |

Raw DB error messages are formatted and returned to the client (e.g. `fmt.Sprintf("search failed: %v", err)`), leaking schema details.

**Fix:** Log with `slog.Error()`, return generic `"search failed"` to the client.

### M-002: Missing Validation on LoginRequest

| Agent(s) | File | Line |
|----------|------|------|
| security-auditor | `server-go/internal/handlers/auth.go` | 32–35, 291–294 |

`LoginRequest` has no `binding:"required"` tags unlike `RegisterRequest`. Empty credentials reach the DB, creating a subtle timing oracle for user enumeration.

**Fix:**
```go
type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}
```

### M-003: LLM API Key in Version-Controlled `.env`

| Agent(s) | File | Line |
|----------|------|------|
| security-auditor | `server-go/.env` | 20 |

`LLM_API_KEY=9router` stored on disk. While `.env` is gitignored, it's vulnerable to backup/CI/container-image leaks.

**Fix:** Add `.env` to `.dockerignore` and a pre-commit hook warning about real credentials.

### M-004: `RawMarkdown` Truncation Inconsistency

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter, code-reviewer | `server-go/internal/resume/handler.go` | 196–208 |

LLM input is truncated to 20K chars but `result.RawMarkdown = raw` stores the full untruncated text. This means:
1. LLM extraction may miss content beyond 20K
2. JSON response can balloon to 8MB (serial DoS vector)

**Fix:** Either `result.RawMarkdown = text` (truncated) or enforce a separate cap.

### M-005: Silently Ignored Error in AddMessage User Lookup

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter | `server-go/internal/application/service.go` | 444 |

`_ = s.db.QueryRowContext(ctx, ...).Scan(&senderName)` discards the error. If the sender user is deleted, `senderName` is `""` and messages display with no sender name.

**Fix:** Check the error; fall back to `"Unknown"` or return an error.

### M-006: Ignored Error in Profile View Dedup

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter | `server-go/internal/profileviews/service.go` | 32 |

`_ = s.db.QueryRowContext(ctx, ...).Scan(&todayExists)` — if the query fails, `todayExists` stays `false`, bypassing dedup and creating duplicate profile view records.

**Fix:** `if err := ...; err != nil { return err }`.

### M-007: `COALESCE` Pattern Prevents Clearing Nullable Fields

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter | `server-go/internal/hris/org/service.go` | 119–139 |

`UPDATE ... SET col = COALESCE($N, col)` makes it impossible to clear nullable columns (`parent_branch_id`, `address`, `city`, etc.). Once set, values are permanently stuck.

**Fix:** Use a sentinel pattern (`nil` = skip, `""` = clear to null) or explicit "clear" markers.

### M-008: MSW Stub Bypasses Token Validation in Auth Test

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter | `web/src/test/setup.ts`, `web/src/hooks/useAuth.test.tsx` | 53–59 |

The MSW handler returns a valid user for any non-empty `Authorization` header. A regression where the hook loads fake user data from localStorage would pass this test.

**Fix:** Validate the token format/value in the MSW handler, return 401 for unknown tokens.

### M-009: User-Controlled Filename Not Sanitized (MarkItDown Export)

| Agent(s) | File | Line |
|----------|------|------|
| code-reviewer | `markitdown-service/app.py` | 211–215 |

`Path(file.filename).stem` preserves special characters (spaces, quotes, unicode). If the export directory is ever served via static files, this could be exploited.

**Fix:** `re.sub(r'[^\w\-]', '_', stem)`.

### M-010: `RowsAffected()` Error Silently Swallowed

| Agent(s) | File | Line |
|----------|------|------|
| code-reviewer | `server-go/internal/hris/employee/service.go` | 419 |

`rows, _ := result.RowsAffected()` — if the driver can't report rows affected, this returns 0, making the function return `sql.ErrNoRows` incorrectly.

**Fix:** Check the error: `rows, err := result.RowsAffected()`.

---

## Low (6)

### L-001: Message Body Has No Length Limit

| Agent(s) | File | Line |
|----------|------|------|
| security-auditor | `server-go/internal/application/service.go` | 433–438 |

No max-length validation on application message `body` or feedback `Content` fields.

**Fix:** Add `binding:"max=5000"` to struct tags.

### L-002: Refresh Cookie `Secure` Flag Inconsistency

| Agent(s) | File | Line |
|----------|------|------|
| security-auditor | `server-go/internal/handlers/auth.go` | 136–146 |

`Secure` flag depends on env vars; behind TLS without explicit config it may be unset, allowing cookie theft over MITM.

**Fix:** Default `Secure` to `true` when `c.Request.TLS != nil`.

### L-003: `import re` Inside Function Body

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter | `markitdown-service/app.py` | 112–114 |

`import re` inside `_looks_like_messy_extract()` — non-standard, executes on every call (though Python caches the module).

**Fix:** Move `import re` to the top of the file.

### L-004: `console.error` Not Restored If Test Throws

| Agent(s) | File | Line |
|----------|------|------|
| bug-hunter | `web/src/components/ui/ErrorBoundary.test.tsx` | 23–31 |

If the ThrowingComponent throws outside the ErrorBoundary, `console.error = spy` never executes, muting subsequent tests.

**Fix:** Use `beforeEach`/`afterEach` or `try/finally`.

### L-005: Response Body Not Drained on Success

| Agent(s) | File | Line |
|----------|------|------|
| code-reviewer | `server-go/internal/resume/handler.go` | 130–163 |

`json.NewDecoder(resp.Body).Decode(...)` reads only the JSON value, not the full body. Remaining bytes prevent connection reuse.

**Fix:** `io.Copy(io.Discard, resp.Body)` before close.

### L-006: `employeeCode` JSON Tag Misleading

| Agent(s) | File | Line |
|----------|------|------|
| code-reviewer | `server-go/internal/hris/payroll/service.go` | 276, 408, 441, 476 |

SELECT changed from `employee_code` to `employee_id_number` but the struct field still serializes as `json:"employeeCode"`.

**Fix:** Rename field and JSON tag to `EmployeeIDNumber` / `employeeIdNumber`.

---

## Tests

### Web Tests (`bun --cwd web test`)

| Result | Files | Tests |
|--------|-------|-------|
| ✅ Passed | 12 | 35 |

Components tested: ErrorBoundary, SkillScoresChart, EvaluationScoreBadge, ApplicationKanban, ThemeToggle, queryClient, Navbar, ChecklistCard, NotificationBell, AvatarUploader, useAuth, ProtectedRoute.

### Server Tests (`go test -p 1 ./server-go/...`)

| Result | Packages |
|--------|----------|
| ✅ Passed | 22/22 |

**Critical constraint:** Go tests share a single PostgreSQL database. Must use `-p 1` (serial execution). Without it, concurrent `CleanTestData()` calls cause ~19 false-positive failures across 14 packages (deadlocks, "not found" errors, FK violations).

---

## Positive Findings (Clean)

| Area | Assessment |
|------|-----------|
| **SQL Injection** | All queries use parameterized `$N` placeholders or go-jet query builder. No dynamic string interpolation of user input. |
| **XSS** | React JSX auto-escapes; no `dangerouslySetInnerHTML`. Go uses `html/template` for email/OG pages. |
| **Auth Bypass** | All endpoints behind `authGroup` (BearerAuth). Route registration has no path traversal. |
| **Password Hashing** | bcrypt (cost 10) + argon2id fallback. Constant-time comparison via `subtle.ConstantTimeCompare`. Timing equalization on login. |
| **JWT** | `WithExpirationRequired()`, `WithValidMethods([]string{"HS256"})` — no alg confusion. 15-min access token TTL. |
| **Refresh Token Rotation** | Old token revoked atomically with `FOR UPDATE` row lock. Reuse triggers full session revocation. Stored as SHA-256 hash. |
| **Webhook SSRF** | `validateURL()` checks scheme, resolves hostname, blocks private/loopback/link-local IPs. |
| **File Upload** | Content-type sniffing, extension whitelist, size caps, magic-byte checks. Path-traversal regex on storage keys. |
| **CORS** | Single explicit origin from config (not `*`), works with `AllowCredentials: true`. |
| **N+1 Queries** | Application refactor eliminated previous N+1 with a single CTE. |
| **RBAC** | Row-level security via company-scoped queries across all HRIS endpoints. |
| **Rate Limiting** | Present on auth endpoints (5 rps, burst 10). Token-bucket with GC. |

---

## Recommended Fix Order

```
1.  C-001   Premature URL.revokeObjectURL()              [ResumeImport.tsx]
2.  H-001   MarkItDown HTTP timeout/context              [resume/handler.go]
3.  H-002   Rate limiter X-Forwarded-For bypass           [ratelimit.go]
4.  H-003   Weak default JWT secret                       [.env.example]
5.  H-004   ListBranches active-only filter               [org/service.go]
6.  M-001   DB error info disclosure                      [search.go]
7.  M-004   RawMarkdown truncation inconsistency          [resume/handler.go]
8.  M-002   LoginRequest validation missing               [auth.go]
9.  M-005   AddMessage user lookup error swallowed        [application/service.go]
10. M-006   Profile view dedup error swallowed            [profileviews/service.go]
11. M-003   LLM API key exposure                          [.env]
12. M-007   COALESCE prevents clearing nullable fields    [org/service.go]
13. M-008   MSW stub bypasses token validation            [useAuth.test.tsx]
14. H-005   Typed-nil guard gap in update                 [employee/service.go]
15. M-009   Filename not sanitized (markitdown)           [app.py]
16. M-010   RowsAffected error swallowed                  [employee/service.go]
17. L-001   Message body length limit                     [application/service.go]
18. L-002   Refresh cookie Secure flag                    [auth.go]
19. L-005   Response body not drained                     [resume/handler.go]
20. L-006   employeeCode JSON tag                         [payroll/service.go]
21. L-003   import re inside function                     [app.py]
22. L-004   console.error not restored                    [ErrorBoundary.test.tsx]
```
