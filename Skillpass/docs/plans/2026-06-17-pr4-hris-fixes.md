# PR #4 — HRIS Security & Schema Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Fix all critical, high, and medium issues found during code review, bug hunting, and security audit of PR #4 (HRIS Sprint 3-7: Shift Config, GPS Clock-In, Live Attendance, Leave Management, Payroll, Reports, Onboarding).

**Architecture:** Go (Gin) backend with raw SQL (pgx), React (Vite/Tailwind/DaisyUI) frontend. Fixes span 13 backend files across 6 HRIS packages + route registration.

**Tech Stack:** Go 1.26, Gin, gorilla/websocket, PostgreSQL, go-jet

**Context:** This PR introduces ~8,500 lines of new code. Three agents (code-reviewer, bug-hunter, security-auditor, test-runner) identified 22+ critical/high issues that must be fixed before merge. The fix branch is `fix/pr4-hris-issues`.

---

### Fix Legend
| Prefix | Severity |
|--------|----------|
| 🔴 C | Critical (runtime crash or security bypass) |
| 🟠 H | High (correctness bug or data integrity) |
| 🟡 M | Medium (best practice or edge case) |

---

### Task 1: Fix Schema/Column Mismatches in Report Service

**Files:**
- Modify: `server-go/internal/hris/report/service.go`
- Modify: `server-go/internal/hris/report/handler.go`

**🔴 C Fixes:**

1. **`ExportAttendance` query** — Rewrite entire SQL query:
   - `e.full_name` → `COALESCE(e.first_name||' '||e.last_name, '')`
   - `e.employee_code` → `e.employee_id_number`
   - `al.clock_in_time` → `al.clock_in` / `al.clock_out`
   - `al.status` → `al.attendance_code`
   - Remove `LEFT JOIN shift_templates st ON st.id = al.shift_id` (no `shift_id` column in `attendance_logs`)
   - `JOIN hris_employees` → `JOIN employees`
   - `al.clock_in_time::date` → `al.date`

2. **`GetHeadcountStats` query** — Replace ALL:
   - `hris_employees` → `employees`, `hris_departments` → `departments`, `hris_branches` → `branches`
   - `e.status` → `e.employment_status`

3. **`GenerateSnapshot` query** — Replace ALL:
   - `hris_employees` → `employees`, `hris_departments` → `departments`
   - `e.status` → `e.employment_status`
   - Fix `monthEnd := month + "-01"` → compute last day of month via `time.Parse + AddDate(0,1,-1)`

4. **Ignored errors** — Check errors from all `QueryRowContext` calls in `GenerateSnapshot` (4 occurrences) and `json.Marshal` / `json.Unmarshal` calls.

**🟡 M Fix:**
- Sanitize `Content-Disposition` header in `ExportAttendance` handler — use fixed filename instead of interpolating user input.

---

### Task 2: Fix Schema/Column Mismatches in Onboarding Service

**Files:**
- Modify: `server-go/internal/hris/onboarding/service.go`

**🔴 C Fixes:**
1. `hris_employees` → `employees` (2 occurrences)
2. `e.full_name` → `COALESCE(e.first_name||' '||e.last_name, '')` (2 occurrences)
3. `e.employee_code` → `e.employee_id_number` (2 occurrences)

---

### Task 3: Fix Schema/Column Mismatch in Payroll Service

**Files:**
- Modify: `server-go/internal/hris/payroll/service.go`

**🔴 C Fixes:**
1. `e.status = 'active'` → `e.employment_status = 'active'` in `CalculateRun`

---

### Task 4: Fix Missing RBAC on Onboarding Routes

**Files:**
- Modify: `server-go/cmd/server/main.go`

**🔴 C Fixes:**
1. Add `rbac.RequirePermission(rbacService, "employee.update", "employee.view_self")` to `POST /hris/onboarding/items/:itemId/complete`
2. Add same middleware to `POST /hris/onboarding/items/:itemId/uncomplete`
3. Add `rbac.RequirePermission(rbacService, "attendance.view")` to `GET /api/v1/hris/attendance/ws`

---

### Task 5: Fix AssignShift Company Scope Bypass

**Files:**
- Modify: `server-go/internal/hris/shift/handler.go`
- Modify: `server-go/internal/hris/shift/service.go`

**🔴 C Fixes:**
1. **Handler** — Remove `_ = companyID` and `_ = shiftID`, pass `companyID` to service call
2. **Service** — Add `companyID` parameter. Verify shift template's `company_id` matches. Verify employee's `company_id` matches. Return errors if checks fail.

---

### Task 6: Fix Payslip IDOR

**Files:**
- Modify: `server-go/internal/hris/payroll/handler.go`
- Modify: `server-go/internal/hris/payroll/service.go`

**🔴 C Fixes:**
1. **Service** — Change `GetPayslip` signature to accept `employeeID` param. Add `AND ($3::uuid IS NULL OR p.employee_id = $3)` to SQL WHERE clause.
2. **Handler** — Parse `employeeId` from context and pass to service.

---

### Task 7: Fix WebSocket Security

**Files:**
- Modify: `server-go/internal/hris/attendance/ws.go`

**🟠 H Fixes:**
1. **CheckOrigin** — Restrict from `return true` to checking against allowed origins (localhost:4200, etc.)

---

### Task 8: Fix UncompleteItem Handler

**Files:**
- Modify: `server-go/internal/hris/onboarding/handler.go`
- Modify: `server-go/internal/hris/onboarding/service.go`

**🟠 H Fixes:**
1. **Handler** — Parse `employeeId` from context (missing entirely)
2. **Service** — Add `completedBy` parameter to `UncompleteItem` for audit trail

---

### Task 9: Fix Code Bugs in Attendance Service

**Files:**
- Modify: `server-go/internal/hris/attendance/service.go`

**🔴 C Fixes:**
1. **Duplicate SQL query in `ClockIn`** — Remove redundant first query that discards results. Keep single query.
2. **`onLeave` stat always 0** — Add `COUNT(DISTINCT employee_id)` query from `leave_requests WHERE status='approved'` in `GetDashboard`. Adjust `Absent` calculation to subtract `OnLeave`.
3. **Geofence 0,0 sentinel** — Use `*float64` (nullable) instead of `COALESCE(latitude,0)` / `branchLat != 0` sentinel.

**🟡 M Fixes:**
4. **CreateException client-supplied employeeId** — Override `ex.EmployeeID = employeeID` before returning response.

---

### Task 10: Fix Code Bugs in Onboarding

**Files:**
- Modify: `server-go/internal/hris/onboarding/handler.go`
- Modify: `server-go/internal/hris/onboarding/service.go`

**🟠 H Fixes:**
1. **ShouldBindJSON error** — Check `c.ShouldBindJSON(&req)` error in `CompleteItem` handler
2. **Missing transactions** — Wrap `CompleteItem` and `UncompleteItem` in `BeginTx`/`Commit`
3. **Unchecked errors** — Check errors from all `QueryRowContext` and `ExecContext` calls in auto-complete logic

---

### Task 11: Fix Leave Balance TOCTOU

**Files:**
- Modify: `server-go/internal/hris/leave/service.go`

**🟠 H Fixes:**
1. **Balance guard in `ReviewRequest`** — Add `AND (total_days + carry_over_days - used_days) >= $1` to balance deduction UPDATE. Check `RowsAffected` and return error if none affected.

---

## Execution

After all fixes:
1. `cd server-go && go build ./... && go vet ./...` — verify compilation
2. `cd .. && bun --cwd web typecheck` — verify frontend types
3. `git add -A && git commit -m "fix(hris): resolve schema mismatches, security issues, and bugs in Sprint 3-7"`
4. `git push origin fix/pr4-hris-issues`
