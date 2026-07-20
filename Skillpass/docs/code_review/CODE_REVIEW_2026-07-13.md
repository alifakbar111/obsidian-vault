# Code Review — SkillPass

> **Agent:** code-reviewer
> **Date:** 2026-07-13
> **Scope:** Branch changes — SSE notification streaming, notification CRUD, profile edit dialogs,
> nullable JSON serialization fixes

---

## Consolidated Priority

| Priority | Issue | Fix |
|---|---|---|
| **P0** | Race condition: `Publish` sends on closed channel → server panic | Safe-send pattern + copy subs under lock |
| **P1** | Custom `MarshalJSON` ignores `omitempty` on `Data` | Add nil check |
| **P2** | Fragile `SET(setVals[0], setVals[1:]...)` pattern | Use variadic `SET(setVals...)` |
| **P2** | Hardcoded credentials in docker-compose.yml | Document dev-only; use `.env` refs |
| **P3** | `omitempty` on always-initialized slices (no-op) | Remove tag or use nil slices |
| **P3** | 5 dialog forms with ~90% duplication | Extract `ExperienceSection` component |
| **P4** | Commented-out default DATABASE_URL in seed | Intentional — keep as-is |

---

## 🔴 Critical

### Finding 1: Race Condition in SSE Broker — Server Panic
- **Location:** `server-go/internal/notification/broker.go:73-84`
- **Issue:** `Publish` reads the subscriber list under `RLock`, then releases the lock before iterating and sending. If `Unsubscribe` (which acquires exclusive `Lock`, removes the channel, and **closes** it) runs between `RUnlock` and the `ch <- event` send, the send hits a closed channel, causing a **runtime panic** that crashes the entire server.

  **Timeline of the race:**
  ```
  Publish()                         Unsubscribe()
  RLock
  read subs (includes ch A)
  RUnlock
                                     Lock
                                     remove ch A, close(ch A)
                                     Unlock
  ch A <- event  ← PANIC
  ```
- **Impact:** Production crash. Any scenario where a user closes their browser tab (triggering `Unsubscribe`) concurrently with a notification being pushed will crash the server. In practice, this can happen whenever a notification is created — `NotifyCompanyOfApplication`, `MarkRead`, `ClearAll`, etc. all call `publishRefresh`.
- **Fix (Option A — copy under lock):**
  ```go
  func (b *Broker) Publish(userID string, event SSEEvent) {
      b.mu.RLock()
      subs := append([]chan SSEEvent(nil), b.subscribers[userID]...)
      b.mu.RUnlock()

      for _, ch := range subs {
          select {
          case ch <- event:
          default:
              slog.Warn("sse subscriber channel full, dropping event", "userID", userID)
          }
      }
  }
  ```
- **Fix (Option B — safe-send with deferred recover):**
  ```go
  func safeSend(ch chan SSEEvent, evt SSEEvent) (ok bool) {
      defer func() { recover() }()
      select {
      case ch <- evt:
          return true
      default:
          return false
      }
  }
  ```
- **Confidence:** HIGH

### Finding 2: Custom `MarshalJSON` Ignores `omitempty` Tag
- **Location:** `server-go/internal/notification/broker.go:16-23`
- **Issue:** `SSEEvent` has a custom `MarshalJSON()` that builds a map literal unconditionally including `"data": e.Data`. The `omitempty` tag on the struct field is **entirely ignored**.
  ```go
  func (e SSEEvent) MarshalJSON() ([]byte, error) {
      m := map[string]interface{}{
          "type": e.Type,
          "data": e.Data,  // always present, even when nil
      }
      return json.Marshal(m)
  }
  ```
- **Impact:** The `refresh` event type intentionally sends `Data: nil` (see `publishRefresh` at line 54: `SSEEvent{Type: "refresh"}`) but still serializes `"data": null`. Currently harmless because client checks `parsed.data` — but any code depending on `omitempty` behavior silently breaks.
- **Fix:**
  ```go
  func (e SSEEvent) MarshalJSON() ([]byte, error) {
      m := map[string]interface{}{"type": e.Type}
      if e.Data != nil {
          m["data"] = e.Data
      }
      return json.Marshal(m)
  }
  ```
- **Confidence:** HIGH

---

## 🟡 High

### Finding 3: JWT Token Exposed in URL Query Parameter for SSE Fallback
- **Location:** `server-go/internal/middleware/auth.go:32`
- **Issue:** The `?token=` query parameter fallback exposes JWT bearer tokens in URLs. OWASP recommendation: never put tokens in URLs. URLs end up in server access logs, reverse proxy logs (nginx, Cloudflare), browser history, and Referer headers.
- **Impact:** Token leakage could lead to account compromise. Mitigated because:
  1. SSE endpoint is read-only (notifications)
  2. Tokens are short-lived (15-min expiry)
  3. `?token=` is only a fallback — normal API calls use headers
- **Fix:** Consider adding a warning log when token-from-query-string path is taken. For production, consider dedicated SSE token type (read-only, short-lived) rather than the full JWT. Document the tradeoff in code.
- **Confidence:** MEDIUM

### Finding 4: Fragile `SET(setVals[0], setVals[1:]...)` Pattern
- **Location:** `server-go/internal/handlers/jobs.go:475`
- **Issue:** The `SET(setVals[0], setVals[1:]...)` call will **panic with index out of bounds** if `setVals` is empty. The current fix (moving `updated_at` append after `len == 0` guard) means `setVals` always has at least 1 element. However, any future refactor that removes the guard or changes ordering could reintroduce the panic.
  ```go
  // This will panic if setVals has 0 elements:
  stmt := gen.JobPostings.UPDATE().SET(setVals[0], setVals[1:]...)
  ```
- **Fix:** Use variadic `SET(setVals...)` with the full slice:
  ```go
  if len(setVals) == 0 {
      c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
      return
  }
  setVals = append(setVals, gen.JobPostings.UpdatedAt.SET(RawTimestampz("NOW()")))
  stmt := gen.JobPostings.UPDATE().SET(setVals...).WHERE(...)
  ```
- **Confidence:** MEDIUM

---

## 🔵 Medium

### Finding 5: Hardcoded Admin Credentials and JWT Secret in docker-compose.yml
- **Location:** `docker-compose.yml:39`
- **Issue:** `ADMIN_PASSWORD: pass123!` and `JWT_SECRET: skillpass-dev-secret` embedded in Docker Compose file. For development-only Docker setup this is standard practice, but these values are also used as defaults for all developers and could easily end up in a production deployment.
- **Fix:** Document in file header that these are dev-only. Consider `.env` file references:
  ```yaml
  environment:
    ADMIN_PASSWORD: ${ADMIN_PASSWORD:-pass123!}
    JWT_SECRET: ${JWT_SECRET:-skillpass-dev-secret}
  ```
- **Confidence:** HIGH

### Finding 6: `omitempty` on Always-Initialized Slices is a No-Op
- **Location:** `server-go/internal/matching/service.go:296-297`
- **Issue:** Both `MatchedSkills` and `MissingSkills` in `SkillsGap` are initialized as `[]string{}` (non-nil empty slice) in `ComputeSkillsGap`. Go's `omitempty` only omits **nil** slices, not empty ones. The tag never triggers — both fields always serialize as `[]` even when empty. Same pattern in `analytics/service.go` where `ApplicationsByStatus` and `Jobs` are also non-nil empty slices.
- **Impact:** Minor. The `omitempty` tags are defensive and don't cause harm. But they create misleading impression about behavior. If a test or client code relies on field being absent vs present-as-empty-array, there's a mismatch.
- **Fix:** Either remove `omitempty` (since it has no effect), or change initialization to let slices be nil when empty.
- **Confidence:** HIGH

---

## 🟢 Low

### Finding 7: High Code Duplication Across 5 Dialog Forms
- **Location:** `web/src/pages/JobseekerProfile/index.tsx:325-622`
- **Issue:** The 5 `FormDialog` sections (work, education, certification, project, volunteering) share ~90% identical code for `onAdd`/`onEdit`/cancel patterns. Each section resets to identical default values, filters experiences by type, and calls the same mutations. Pre-existing complexity, but dialog refactor increased the surface area.
- **Fix:** Extract a reusable `ExperienceSection` component that takes the experience type as a prop, reducing ~300 lines to ~60.
- **Confidence:** HIGH

### Finding 8: Commented-Out Default DATABASE_URL in Seed
- **Location:** `server-go/cmd/seed/main.go:23-25`
- **Issue:** The fallback default `postgres://postgres:postgres@localhost:5432/skillpass` was commented out. If `DATABASE_URL` is unset, `sql.Open("pgx", "")` won't fail immediately (Go defers connection), but `PingContext` will. Error message is clear. Intentional — makes seed script fail early rather than silently using a fallback.
- **Note:** Intentional design choice. Keep as-is.
- **Confidence:** HIGH

---

## ✅ What Passed Review

| Area | Status | Notes |
|---|---|---|
| `handlers/jobs.go` `updated_at` fix | ✅ Correct | Move after `len == 0` guard prevents meaningless timestamp-only updates |
| Analytics `*float64` omitempty | ✅ Correct | Pointer-to-float64 correctly omitted when nil (no data) |
| Notification test coverage | ✅ Good | handler_test.go covers CRUD + auth-gating |
| SSE client `notifications.ts` | ✅ Good | Proper EventSource lifecycle, URL-safe token encoding, `init` vs `refresh` handling |
| FormDialog accessibility | ✅ Good | Native `<dialog>` element, `aria-label` on close, keyboard-dismissable |
| NotificationBell accessibility | ✅ Good | `aria-expanded`, `aria-controls`, `aria-haspopup`, dynamic unread count |
