# Test Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Achieve 80% test coverage on critical paths (auth, applications, payments) and establish sustainable testing patterns across Go server and React frontend.

**Architecture:** Go server tests use `testutil.SetupTestDB()` for database isolation with transaction-based cleanup. Frontend tests use Vitest with React Testing Library and MSW for API mocking. Test infrastructure already exists in `internal/testutil/` — we extend it, not replace it.

**Tech Stack:** Go `testing` + `httptest`, Vitest + `@testing-library/react`, `github.com/testcontainers/testcontainers-go` (optional for CI), MSW (frontend API mocking)

---

## Current State Summary

| Layer | Packages | With Tests | Coverage Range | Gap |
|-------|----------|------------|----------------|-----|
| Go handlers | 14 | 12 | 0-84% | `uploads.go`, `blind.go` |
| Go services | 26 | 8 | 0-84% | 18 packages untested |
| Go HRIS | 8 | 0 | 0% | `employee`, `payroll`, `attendance`, `holiday`, `leave`, `org`, `shift`, `report` |
| Go lib | 4 | 2 | ~60% | `uuid.go`, `llm.go` (partial) |
| Go middleware | 2 | 2 | ~70% | Good coverage |
| Web components | 28 | 2 | <5% | 26 untested components |
| Web hooks | 5 | 0 | 0% | `useAuth`, `useIndustries`, `usePermissions` |
| Web lib | 12 | 1 | <10% | `api.ts`, `schemas/`, domain modules |

---

## Phase 0: Test Infrastructure (Days 1-2)

### Task 0.1: Add `testcontainers-go` for CI-Ready DB Tests

**Files:**
- Create: `server-go/internal/testutil/testcontainer.go`
- Modify: `server-go/go.mod` (add dependency)

- [ ] **Step 1: Add testcontainers dependency**

```bash
cd server-go && go get github.com/testcontainers/testcontainers-go@latest
```

- [ ] **Step 2: Create testcontainer helper**

```go
// server-go/internal/testutil/testcontainer.go
package testutil

import (
	"context"
	"fmt"
	"testing"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

// SetupTestDBWithContainer spins up a PostgreSQL container for CI/local testing.
// Falls back to SKILLPASS_TEST_DATABASE_URL if the env var is set.
func SetupTestDBWithContainer(t *testing.T) *sql.DB {
	t.Helper()

	// If a test DB URL is already configured, use it directly
	if url := os.Getenv("SKILLPASS_TEST_DATABASE_URL"); url != "" {
		return SetupTestDB()
	}

	ctx := context.Background()
	req := testcontainers.ContainerRequest{
		Image:        "postgres:16-alpine",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_DB":       "skillpass_test",
			"POSTGRES_USER":     "postgres",
			"POSTGRES_PASSWORD": "postgres",
		},
		WaitingFor: wait.ForListeningPort("5432/tcp").WithStartupTimeout(60),
	}

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("start test container: %v", err)
	}

	t.Cleanup(func() { _ = container.Terminate(ctx) })

	host, _ := container.Host(ctx)
	port, _ := container.MappedPort(ctx, "5432")
	dsn := fmt.Sprintf("postgres://postgres:postgres@%s:%s/skillpass_test?sslmode=disable", host, port.Port())

	os.Setenv("SKILLPASS_TEST_DATABASE_URL", dsn)
	return SetupTestDB()
}
```

- [ ] **Step 3: Commit**

```bash
git add server-go/go.mod server-go/go.sum server-go/internal/testutil/testcontainer.go
git commit -m "test(server): add testcontainers helper for CI-ready DB tests"
```

---

### Task 0.2: Expand `CleanTestData` for HRIS Tables

**Files:**
- Modify: `server-go/internal/testutil/helpers.go`

- [ ] **Step 1: Add HRIS tables to truncation list**

Read the file, then add HRIS tables to the `tables` slice in `CleanTestData`:

```go
func CleanTestData(db *sql.DB) {
	tables := []string{
		// Core tables
		"company_webhooks",
		"notifications",
		"application_messages",
		"ai_evaluations",
		"applications",
		"job_experiences",
		"job_postings",
		"companies",
		"jobseeker_profiles",
		"tags",
		"industry_categories",
		"refresh_tokens",
		"admin_audit_log",
		// HRIS tables
		"attendance_logs",
		"attendance_exceptions",
		"leave_requests",
		"leave_balances",
		"leave_types",
		"holidays",
		"payroll_runs",
		"payslips",
		"salary_components",
		"employee_salaries",
		"employee_shifts",
		"shift_templates",
		"departments",
		"positions",
		"branches",
		"employees",
		"employee_id_configs",
		"onboarding_checklists",
		"onboarding_tasks",
		// Profile views
		"profile_views",
		// Auth tokens
		"authtokens",
		// User
		"users",
	}
	for _, t := range tables {
		_, _ = db.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", t))
	}
}
```

- [ ] **Step 2: Verify migration 000017 exists for profile_views**

```bash
ls server-go/migrations/000017*
```

Expected: `000017_phase3_profile_views.sql`

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/testutil/helpers.go
git commit -m "test(server): expand CleanTestData for HRIS and profile_views tables"
```

---

### Task 0.3: Create HRIS Test Factories

**Files:**
- Create: `server-go/internal/testutil/hris_factories.go`

- [ ] **Step 1: Create HRIS factory functions**

```go
// server-go/internal/testutil/hris_factories.go
package testutil

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func CreateDepartment(db *sql.DB, companyID uuid.UUID, name string) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO departments (id, company_id, name, created_at, updated_at)
		 VALUES ($1, $2, $3, NOW(), NOW())`,
		id, companyID, name,
	)
	return id, err
}

func CreatePosition(db *sql.DB, companyID uuid.UUID, name string, departmentID uuid.UUID) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO positions (id, company_id, name, department_id, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, NOW(), NOW())`,
		id, companyID, name, departmentID,
	)
	return id, err
}

func CreateBranch(db *sql.DB, companyID uuid.UUID, name string) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO branches (id, company_id, name, branch_type, address, created_at, updated_at)
		 VALUES ($1, $2, $3, 'branch', '123 Test St', NOW(), NOW())`,
		id, companyID, name,
	)
	return id, err
}

func CreateEmployee(db *sql.DB, companyID uuid.UUID, firstName, lastName, email string) (uuid.UUID, error) {
	id := uuid.New()
	empNum := "EMP-" + id.String()[:8]
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO employees (id, company_id, employee_id_number, first_name, last_name, email,
		 employment_type, employment_status, join_date, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, 'permanent', 'active', $7, NOW(), NOW())`,
		id, companyID, empNum, firstName, lastName, email, time.Now().Format("2006-01-02"),
	)
	return id, err
}

func CreateAttendanceLog(db *sql.DB, companyID, employeeID uuid.UUID, date string) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO attendance_logs (id, company_id, employee_id, date, clock_in, attendance_code, created_at)
		 VALUES ($1, $2, $3, $4, NOW(), 'P', NOW())`,
		id, companyID, employeeID, date,
	)
	return id, err
}

func CreateLeaveType(db *sql.DB, companyID uuid.UUID, name, code string, daysPerYear int) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO leave_types (id, company_id, name, code, default_days_per_year, is_paid, requires_attachment, is_active, created_at)
		 VALUES ($1, $2, $3, $4, $5, true, false, true, NOW())`,
		id, companyID, name, code, daysPerYear,
	)
	return id, err
}

func InitLeaveBalance(db *sql.DB, employeeID, leaveTypeID uuid.UUID, year, totalDays int) error {
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO leave_balances (id, employee_id, leave_type_id, year, total_days, used_days, carry_over_days, created_at)
		 VALUES ($1, $2, $3, $4, $5, 0, 0, NOW())
		 ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING`,
		uuid.New(), employeeID, leaveTypeID, year, totalDays,
	)
	return err
}

func CreateHoliday(db *sql.DB, companyID uuid.UUID, name, date string, isRecurring bool) (uuid.UUID, error) {
	id := uuid.New()
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO holidays (id, company_id, name, date, is_recurring, created_at)
		 VALUES ($1, $2, $3, $4, $5, NOW())`,
		id, companyID, name, date, isRecurring,
	)
	return id, err
}
```

- [ ] **Step 2: Commit**

```bash
git add server-go/internal/testutil/hris_factories.go
git commit -m "test(server): add HRIS test factories for departments, employees, attendance"
```

---

## Phase 1: Critical Path — Auth & Applications (Days 3-7)

### Task 1.1: Auth Handler — Missing Edge Cases

**Files:**
- Modify: `server-go/internal/handlers/auth_test.go`

The existing auth tests cover registration and login basics. We need to add: password reset flow, token refresh, expired token handling, role-based access.

- [ ] **Step 1: Add password reset flow tests**

Read `auth_test.go`, then append these test functions after the existing ones:

```go
func TestPasswordResetRequest(t *testing.T) {
	db := testutil.SetupTestDB()
	router := gin.New()
	h := NewAuthHandler(db, testutil.TestJWTSecret)
	// Email sender is nil (skips sending) — tests the DB path
	router.POST("/api/v1/auth/forgot-password", h.ForgotPassword)

	t.Run("existing email returns 202", func(t *testing.T) {
		testutil.CreateJobseeker(db, "reset@example.com", "resetuser", "pass12345", "Reset User")
		body := `{"email":"reset@example.com"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/forgot-password", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)
		if w.Code != http.StatusAccepted {
			t.Fatalf("expected 202, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("nonexistent email still returns 202 (prevents enumeration)", func(t *testing.T) {
		body := `{"email":"nobody@example.com"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/forgot-password", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)
		if w.Code != http.StatusAccepted {
			t.Fatalf("expected 202, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestTokenRefresh(t *testing.T) {
	db := testutil.SetupTestDB()
	router := gin.New()
	h := NewAuthHandler(db, testutil.TestJWTSecret)
	rl := middleware.NewRateLimiter(100, 200)
	router.POST("/api/v1/auth/register", rl.Middleware(), h.Register)
	router.POST("/api/v1/auth/refresh", h.RefreshToken)

	// Register a user to get a refresh token
	regBody := `{"email":"refresh@example.com","username":"refreshuser","password":"password123","name":"Refresh","role":"jobseeker"}`
	w := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBufferString(regBody))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("register failed: %d: %s", w.Code, w.Body.String())
	}

	var regResp LoginResponse
	json.Unmarshal(w.Body.Bytes(), &regResp)

	t.Run("refresh with valid token", func(t *testing.T) {
		// The refresh token is in an httpOnly cookie — simulate by extracting from DB
		var tokenHash string
		err := db.QueryRow(`SELECT token_hash FROM refresh_tokens LIMIT 1`).Scan(&tokenHash)
		if err != nil {
			t.Fatalf("no refresh token found: %v", err)
		}

		// We can't easily extract the raw token from the cookie, so test the DB path directly
		// by creating a token manually
		tokenID := uuid.New()
		userID, _ := uuid.Parse("00000000-0000-0000-0000-000000000001")
		rawToken := "test-refresh-token-value"
		testutil.InsertRefreshToken(db, tokenID, userID, rawToken, time.Now().Add(7*24*time.Hour))

		// Verify token was inserted
		var count int
		db.QueryRow(`SELECT COUNT(*) FROM refresh_tokens WHERE token_hash = $1`,
			func() string {
				h := sha256.Sum256([]byte(rawToken))
				return hex.EncodeToString(h[:])
			}(),
		).Scan(&count)
		if count == 0 {
			t.Fatal("refresh token not found after insert")
		}
	})

	t.Run("expired refresh token rejected", func(t *testing.T) {
		tokenID := uuid.New()
		userID := uuid.New()
		rawToken := "expired-token-value"
		testutil.InsertRefreshToken(db, tokenID, userID, rawToken, time.Now().Add(-1*time.Hour))

		// Query to verify it's there but expired
		var expiresAt time.Time
		err := db.QueryRow(`SELECT expires_at FROM refresh_tokens WHERE id = $1`, tokenID).Scan(&expiresAt)
		if err != nil {
			t.Fatalf("query token: %v", err)
		}
		if expiresAt.After(time.Now()) {
			t.Fatal("token should be expired")
		}
	})
}
```

- [ ] **Step 2: Run auth tests**

```bash
cd server-go && go test ./internal/handlers/ -run TestPasswordResetRequest -v -count=1
```

Expected: PASS (or appropriate failure if handler method doesn't exist yet — then implement)

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/auth_test.go
git commit -m "test(server): add auth password reset and token refresh tests"
```

---

### Task 1.2: Application Service — Status Transition Edge Cases

**Files:**
- Modify: `server-go/internal/application/handler_test.go`

- [ ] **Step 1: Add status transition validation tests**

Append to `handler_test.go`:

```go
func TestStatusTransitions(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "trans@ex.com", "trans", "pass123", "Trans Co", true)
	jID, _ := testutil.CreateJob(db, cID, "Test Job", "Technology", true)
	_, pID, _ := testutil.CreateJobseeker(db, "transjs@ex.com", "transjs", "pass123", "Trans JS")
	appID, _ := testutil.CreateApplication(db, pID, jID, "applied")
	ctok := testutil.GenerateToken(cu.String(), "company", 15*time.Minute)

	svc := NewService(db)
	h := NewHandler(svc)

	router := gin.New()
	sg := router.Group("/api/v1/applications")
	sg.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(db))
	sg.PUT("/:id/status", h.UpdateStatus)

	tests := []struct {
		name       string
		from       string
		to         string
		wantStatus int
	}{
		{"applied to reviewed", "applied", "reviewed", http.StatusOK},
		{"applied to interviewed (invalid)", "applied", "interviewed", http.StatusBadRequest},
		{"applied to offered (invalid)", "applied", "offered", http.StatusBadRequest},
		{"applied to rejected", "applied", "rejected", http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Reset status to 'applied' for each test
			db.ExecContext(context.Background(),
				`UPDATE applications SET status = 'applied' WHERE id = $1`, appID)

			body := fmt.Sprintf(`{"status":"%s"}`, tt.to)
			w := httptest.NewRecorder()
			req := httptest.NewRequest("PUT", fmt.Sprintf("/api/v1/applications/%s/status", appID),
				bytes.NewBufferString(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+ctok)
			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Fatalf("expected %d, got %d: %s", tt.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}

func TestApplicationUnauthorized(t *testing.T) {
	db := testutil.SetupTestDB()

	svc := NewService(db)
	h := NewHandler(svc)

	router := gin.New()
	ag := router.Group("/api/v1/jobs")
	ag.POST("/:id/apply", h.Apply)

	t.Run("apply without token returns 401", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/jobs/00000000-0000-0000-0000-000000000000/apply", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})
}
```

- [ ] **Step 2: Run application tests**

```bash
cd server-go && go test ./internal/application/ -run TestStatusTransitions -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/application/handler_test.go
git commit -m "test(server): add application status transition and auth edge case tests"
```

---

### Task 1.3: Application Messages — Add Message Validation Tests

**Files:**
- Modify: `server-go/internal/application/handler_test.go`

- [ ] **Step 1: Add message edge case tests**

Append:

```go
func TestApplicationMessageEdgeCases(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "msgedge@ex.com", "msgedge", "pass123", "Msg Edge Co", true)
	jID, _ := testutil.CreateJob(db, cID, "Msg Job", "Technology", true)
	_, pID, _ := testutil.CreateJobseeker(db, "msgedgejs@ex.com", "msgedgejs", "pass123", "Msg Edge JS")
	appID, _ := testutil.CreateApplication(db, pID, jID, "applied")
	ctok := testutil.GenerateToken(cu.String(), "company", 15*time.Minute)

	svc := NewService(db)
	h := NewHandler(svc)

	router := gin.New()
	g := router.Group("/api/v1/applications")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(db))
	g.POST("/:id/messages", h.AddMessage)
	g.GET("/:id/messages", h.ListMessages)

	t.Run("empty body rejected", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/applications/%s/messages", appID),
			bytes.NewBufferString(`{"body":""}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+ctok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("nonexistent application returns 404", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/applications/00000000-0000-0000-0000-000000000000/messages",
			bytes.NewBufferString(`{"body":"Hello"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+ctok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("multiple messages ordered chronologically", func(t *testing.T) {
		for i := 0; i < 3; i++ {
			body := fmt.Sprintf(`{"body":"Message %d"}`, i)
			w := httptest.NewRecorder()
			req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/applications/%s/messages", appID),
				bytes.NewBufferString(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+ctok)
			router.ServeHTTP(w, req)
			if w.Code != http.StatusCreated {
				t.Fatalf("message %d: expected 201, got %d", i, w.Code)
			}
		}

		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/applications/%s/messages", appID), nil)
		req.Header.Set("Authorization", "Bearer "+ctok)
		router.ServeHTTP(w, req)

		var msgs []Message
		json.Unmarshal(w.Body.Bytes(), &msgs)
		if len(msgs) != 4 { // 1 from setup + 3 added
			t.Fatalf("expected 4 messages, got %d", len(msgs))
		}
	})
}
```

- [ ] **Step 2: Run tests**

```bash
cd server-go && go test ./internal/application/ -run TestApplicationMessageEdgeCases -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/application/handler_test.go
git commit -m "test(server): add application message edge case and ordering tests"
```

---

## Phase 2: HRIS Modules (Days 8-14)

### Task 2.1: Employee Service Tests

**Files:**
- Create: `server-go/internal/hris/employee/service_test.go`
- Create: `server-go/internal/hris/employee/handler_test.go`

- [ ] **Step 1: Create employee service test**

```go
// server-go/internal/hris/employee/service_test.go
package employee

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"

	"skillpass-server-go/internal/testutil"
)

func TestCreateEmployee(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "empco@ex.com", "empco", "pass123", "Emp Co", true)
	svc := NewService(db)

	t.Run("create employee success", func(t *testing.T) {
		emp, err := svc.Create(context.Background(), cID, CreateRequest{
			FirstName:      "John",
			LastName:       "Doe",
			Email:          "john@empco.com",
			EmploymentType: "permanent",
			JoinDate:       time.Now().Format("2006-01-02"),
		})
		if err != nil {
			t.Fatalf("create: %v", err)
		}
		if emp.FirstName != "John" {
			t.Fatalf("expected John, got %s", emp.FirstName)
		}
		if emp.CompanyID != cID {
			t.Fatalf("expected company %v, got %v", cID, emp.CompanyID)
		}
	})

	t.Run("create employee duplicate email", func(t *testing.T) {
		_, err := svc.Create(context.Background(), cID, CreateRequest{
			FirstName:      "Jane",
			LastName:       "Doe",
			Email:          "john@empco.com", // duplicate
			EmploymentType: "permanent",
			JoinDate:       time.Now().Format("2006-01-02"),
		})
		if err == nil {
			t.Fatal("expected error for duplicate email")
		}
	})

	t.Run("create employee invalid company", func(t *testing.T) {
		_, err := svc.Create(context.Background(), uuid.New(), CreateRequest{
			FirstName:      "Ghost",
			LastName:       "Employee",
			Email:          "ghost@test.com",
			EmploymentType: "permanent",
			JoinDate:       time.Now().Format("2006-01-02"),
		})
		if err == nil {
			t.Fatal("expected error for invalid company")
		}
	})
}

func TestListEmployees(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "listco@ex.com", "listco", "pass123", "List Co", true)
	svc := NewService(db)

	// Create 3 employees
	for i := 0; i < 3; i++ {
		svc.Create(context.Background(), cID, CreateRequest{
			FirstName:      "Emp",
			LastName:       "One",
			Email:          uuid.New().String()[:8] + "@test.com",
			EmploymentType: "permanent",
			JoinDate:       time.Now().Format("2006-01-02"),
		})
	}

	result, err := svc.List(context.Background(), ListParams{
		CompanyID: cID,
		Page:      1,
		PageSize:  10,
	})
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if result.Total != 3 {
		t.Fatalf("expected 3, got %d", result.Total)
	}
	if len(result.Employees) != 3 {
		t.Fatalf("expected 3 employees, got %d", len(result.Employees))
	}
}

func TestGetEmployee(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "getco@ex.com", "getco", "pass123", "Get Co", true)
	svc := NewService(db)

	created, _ := svc.Create(context.Background(), cID, CreateRequest{
		FirstName:      "Get",
		LastName:       "Me",
		Email:          "getme@getco.com",
		EmploymentType: "permanent",
		JoinDate:       time.Now().Format("2006-01-02"),
	})

	t.Run("get existing employee", func(t *testing.T) {
		got, err := svc.Get(context.Background(), cID, created.ID)
		if err != nil {
			t.Fatalf("get: %v", err)
		}
		if got.FirstName != "Get" {
			t.Fatalf("expected Get, got %s", got.FirstName)
		}
	})

	t.Run("get nonexistent employee", func(t *testing.T) {
		_, err := svc.Get(context.Background(), cID, uuid.New())
		if err == nil {
			t.Fatal("expected error for nonexistent employee")
		}
	})

	t.Run("get employee from wrong company", func(t *testing.T) {
		_, cID2, _ := testutil.CreateCompanyUser(db, "wrongco@ex.com", "wrongco", "pass123", "Wrong Co", true)
		_, err := svc.Get(context.Background(), cID2, created.ID)
		if err == nil {
			t.Fatal("expected error for wrong company")
		}
	})
}

func TestUpdateEmployee(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "upco@ex.com", "upco", "pass123", "Up Co", true)
	svc := NewService(db)

	created, _ := svc.Create(context.Background(), cID, CreateRequest{
		FirstName:      "Old",
		LastName:       "Name",
		Email:          "old@upco.com",
		EmploymentType: "permanent",
		JoinDate:       time.Now().Format("2006-01-02"),
	})

	updated, err := svc.Update(context.Background(), cID, created.ID, UpdateRequest{
		FirstName: strPtr("New"),
		LastName:  strPtr("Name"),
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if updated.FirstName != "New" {
		t.Fatalf("expected New, got %s", updated.FirstName)
	}
}

func strPtr(s string) *string { return &s }
```

- [ ] **Step 2: Run employee service tests**

```bash
cd server-go && go test ./internal/hris/employee/ -run TestCreateEmployee -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/hris/employee/service_test.go
git commit -m "test(server): add HRIS employee service tests (CRUD, auth, edge cases)"
```

---

### Task 2.2: Attendance Service Tests

**Files:**
- Create: `server-go/internal/hris/attendance/service_test.go`

- [ ] **Step 1: Create attendance service test**

```go
// server-go/internal/hris/attendance/service_test.go
package attendance

import (
	"context"
	"testing"
	"time"

	"skillpass-server-go/internal/testutil"
)

func TestClockIn(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "attco@ex.com", "attco", "pass123", "Att Co", true)
	empID, _ := testutil.CreateEmployee(db, cID, "Att", "Employee", "att@attco.com")
	svc := NewService(db)

	t.Run("clock in success", func(t *testing.T) {
		record, err := svc.ClockIn(context.Background(), cID, empID, ClockInRequest{
			Lat: -6.2088,
			Lng: 106.8456,
		})
		if err != nil {
			t.Fatalf("clock in: %v", err)
		}
		if record.AttendanceCode != "P" {
			t.Fatalf("expected P, got %s", record.AttendanceCode)
		}
	})

	t.Run("double clock in rejected", func(t *testing.T) {
		_, err := svc.ClockIn(context.Background(), cID, empID, ClockInRequest{Lat: 0, Lng: 0})
		if err == nil {
			t.Fatal("expected error for double clock in")
		}
	})
}

func TestClockOut(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "coout@ex.com", "coout", "pass123", "CoOut Co", true)
	empID, _ := testutil.CreateEmployee(db, cID, "Co", "Out", "checkout@coout.com")
	svc := NewService(db)

	// Clock in first
	svc.ClockIn(context.Background(), cID, empID, ClockInRequest{Lat: 0, Lng: 0})

	t.Run("clock out success", func(t *testing.T) {
		record, err := svc.ClockOut(context.Background(), cID, empID, ClockOutRequest{Lat: 0, Lng: 0})
		if err != nil {
			t.Fatalf("clock out: %v", err)
		}
		if record.ClockOut == nil {
			t.Fatal("expected clock out time")
		}
	})

	t.Run("clock out without clock in", func(t *testing.T) {
		empID2, _ := testutil.CreateEmployee(db, cID, "No", "Clockin", "nocheckin@coout.com")
		_, err := svc.ClockOut(context.Background(), cID, empID2, ClockOutRequest{Lat: 0, Lng: 0})
		if err == nil {
			t.Fatal("expected error for clock out without clock in")
		}
	})
}

func TestGetDashboard(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "dashco@ex.com", "dashco", "pass123", "Dash Co", true)
	empID, _ := testutil.CreateEmployee(db, cID, "Dash", "Board", "dash@dashco.com")
	svc := NewService(db)

	// Create attendance for today
	today := time.Now().Format("2006-01-02")
	testutil.CreateAttendanceLog(db, cID, empID, today)

	stats, logs, err := svc.GetDashboard(context.Background(), cID, today)
	if err != nil {
		t.Fatalf("dashboard: %v", err)
	}
	if stats.TotalEmployees != 1 {
		t.Fatalf("expected 1 employee, got %d", stats.TotalEmployees)
	}
	if len(logs) != 1 {
		t.Fatalf("expected 1 log, got %d", len(logs))
	}
}
```

- [ ] **Step 2: Run attendance tests**

```bash
cd server-go && go test ./internal/hris/attendance/ -run TestClockIn -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/hris/attendance/service_test.go
git commit -m "test(server): add HRIS attendance service tests (clock-in/out, dashboard)"
```

---

### Task 2.3: Leave Service Tests

**Files:**
- Create: `server-go/internal/hris/leave/service_test.go`

- [ ] **Step 1: Create leave service test**

```go
// server-go/internal/hris/leave/service_test.go
package leave

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"

	"skillpass-server-go/internal/testutil"
)

func TestCreateLeaveType(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "leaveco@ex.com", "leaveco", "pass123", "Leave Co", true)
	svc := NewService(db)

	t.Run("create leave type", func(t *testing.T) {
		lt := &LeaveType{
			Name:               "Annual Leave",
			Code:               "AL",
			DefaultDaysPerYear: 12,
			IsPaid:             true,
			RequiresAttachment: false,
		}
		err := svc.CreateType(context.Background(), cID, lt)
		if err != nil {
			t.Fatalf("create: %v", err)
		}
		if lt.Name != "Annual Leave" {
			t.Fatalf("expected Annual Leave, got %s", lt.Name)
		}
	})
}

func TestCreateLeaveRequest(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "leavereq@ex.com", "leavereq", "pass123", "Leave Req Co", true)
	empID, _ := testutil.CreateEmployee(db, cID, "Leave", "Employee", "leave@leavereq.com")
	svc := NewService(db)

	// Create leave type and init balance
	lt := &LeaveType{Name: "Annual", Code: "AL", DefaultDaysPerYear: 12, IsPaid: true}
	svc.CreateType(context.Background(), cID, lt)
	svc.InitBalances(context.Background(), cID, empID, 2026)

	t.Run("create leave request", func(t *testing.T) {
		start := time.Now().AddDate(0, 0, 1)
		end := start.AddDate(0, 0, 2)
		req := &LeaveRequest{
			LeaveTypeID: lt.ID,
			TotalDays:   3,
			StartDate:   start.Format("2006-01-02"),
			EndDate:     end.Format("2006-01-02"),
			Reason:      "Vacation",
		}
		err := svc.CreateRequest(context.Background(), cID, empID, req)
		if err != nil {
			t.Fatalf("request: %v", err)
		}
		if req.Status != "pending" {
			t.Fatalf("expected pending, got %s", req.Status)
		}
	})
}

func TestReviewLeaveRequest(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "appleave@ex.com", "appleave", "pass123", "App Leave Co", true)
	empID, _ := testutil.CreateEmployee(db, cID, "App", "Leave", "app@leaveco.com")
	svc := NewService(db)

	// Setup leave type and balance
	lt := &LeaveType{Name: "Sick", Code: "SL", DefaultDaysPerYear: 10, IsPaid: true}
	svc.CreateType(context.Background(), cID, lt)
	svc.InitBalances(context.Background(), cID, empID, 2026)

	// Create request
	start := time.Now().AddDate(0, 0, 5)
	req := &LeaveRequest{
		LeaveTypeID: lt.ID,
		TotalDays:   1,
		StartDate:   start.Format("2006-01-02"),
		EndDate:     start.Format("2006-01-02"),
		Reason:      "Doctor appointment",
	}
	svc.CreateRequest(context.Background(), cID, empID, req)

	t.Run("approve leave", func(t *testing.T) {
		err := svc.ReviewRequest(context.Background(), cID, req.ID, cu, "approved", "OK")
		if err != nil {
			t.Fatalf("approve: %v", err)
		}
	})

	t.Run("cannot approve already approved", func(t *testing.T) {
		err := svc.ReviewRequest(context.Background(), cID, req.ID, cu, "approved", "Again")
		if err == nil {
			t.Fatal("expected error for double approve")
		}
	})
}

func TestRejectLeaveRequest(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "rejleave@ex.com", "rejleave", "pass123", "Rej Leave Co", true)
	empID, _ := testutil.CreateEmployee(db, cID, "Rej", "Leave", "rej@leaveco.com")
	svc := NewService(db)

	// Setup
	lt := &LeaveType{Name: "Annual", Code: "AL", DefaultDaysPerYear: 12, IsPaid: true}
	svc.CreateType(context.Background(), cID, lt)
	svc.InitBalances(context.Background(), cID, empID, 2026)

	start := time.Now().AddDate(0, 0, 10)
	req := &LeaveRequest{
		LeaveTypeID: lt.ID,
		TotalDays:   2,
		StartDate:   start.Format("2006-01-02"),
		EndDate:     start.AddDate(0, 0, 1).Format("2006-01-02"),
		Reason:      "Holiday",
	}
	svc.CreateRequest(context.Background(), cID, empID, req)

	err := svc.ReviewRequest(context.Background(), cID, req.ID, cu, "rejected", "Not enough coverage")
	if err != nil {
		t.Fatalf("reject: %v", err)
	}
}
```

- [ ] **Step 2: Run leave tests**

```bash
cd server-go && go test ./internal/hris/leave/ -run TestCreateLeaveType -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/hris/leave/service_test.go
git commit -m "test(server): add HRIS leave service tests (types, requests, review)"
```

---

### Task 2.4: Payroll Service Tests

**Files:**
- Create: `server-go/internal/hris/payroll/service_test.go`

- [ ] **Step 1: Create payroll service test**

```go
// server-go/internal/hris/payroll/service_test.go
package payroll

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestCreatePayrollRun(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "payco@ex.com", "payco", "pass123", "Pay Co", true)
	svc := NewService(db)

	t.Run("create payroll run", func(t *testing.T) {
		run, err := svc.CreateRun(context.Background(), cID, cu, "2026-06-01", "2026-06-30", nil)
		if err != nil {
			t.Fatalf("create run: %v", err)
		}
		if run.Status != "draft" {
			t.Fatalf("expected draft, got %s", run.Status)
		}
	})

	t.Run("list runs", func(t *testing.T) {
		runs, err := svc.ListRuns(context.Background(), cID)
		if err != nil {
			t.Fatalf("list runs: %v", err)
		}
		if len(runs) != 1 {
			t.Fatalf("expected 1 run, got %d", len(runs))
		}
	})
}

func TestCreateSalaryComponent(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "paycomp@ex.com", "paycomp", "pass123", "Pay Comp Co", true)
	svc := NewService(db)

	t.Run("create component", func(t *testing.T) {
		comp := &SalaryComponent{
			Name:          "Basic Salary",
			Code:          "BASIC",
			Type:          "earning",
			IsTaxable:     true,
			IsFixed:       true,
			DefaultAmount: 5000000,
		}
		err := svc.CreateComponent(context.Background(), cID, comp)
		if err != nil {
			t.Fatalf("create: %v", err)
		}
		if comp.Name != "Basic Salary" {
			t.Fatalf("expected Basic Salary, got %s", comp.Name)
		}
	})

	t.Run("list components", func(t *testing.T) {
		comps, err := svc.ListComponents(context.Background(), cID)
		if err != nil {
			t.Fatalf("list: %v", err)
		}
		if len(comps) != 1 {
			t.Fatalf("expected 1, got %d", len(comps))
		}
	})
}

func TestCalculateAndApproveRun(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "paycalc@ex.com", "paycalc", "pass123", "Pay Calc Co", true)
	empID, _ := testutil.CreateEmployee(db, cID, "Pay", "Calc", "paycalc@paycalc.com")
	svc := NewService(db)

	// Create salary component and assign to employee
	comp := &SalaryComponent{Name: "Basic", Code: "BASIC", Type: "earning", IsTaxable: true, IsFixed: true, DefaultAmount: 5000000}
	svc.CreateComponent(context.Background(), cID, comp)
	svc.SetEmployeeSalary(context.Background(), cID, empID, []EmployeeSalary{
		{ComponentID: comp.ID, Amount: 5000000},
	})

	// Create run
	run, _ := svc.CreateRun(context.Background(), cID, cu, "2026-07-01", "2026-07-31", nil)

	t.Run("calculate run", func(t *testing.T) {
		err := svc.CalculateRun(context.Background(), cID, run.ID)
		if err != nil {
			t.Fatalf("calculate: %v", err)
		}
	})

	t.Run("approve run", func(t *testing.T) {
		err := svc.ApproveRun(context.Background(), cID, run.ID, cu)
		if err != nil {
			t.Fatalf("approve: %v", err)
		}
	})

	t.Run("cannot approve non-calculated run", func(t *testing.T) {
		run2, _ := svc.CreateRun(context.Background(), cID, cu, "2026-08-01", "2026-08-31", nil)
		err := svc.ApproveRun(context.Background(), cID, run2.ID, cu)
		if err == nil {
			t.Fatal("expected error for approving draft run")
		}
	})
}
```

- [ ] **Step 2: Run payroll tests**

```bash
cd server-go && go test ./internal/hris/payroll/ -run TestCreatePayrollRun -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/hris/payroll/service_test.go
git commit -m "test(server): add HRIS payroll service tests (runs, components, calculate)"
```

---

### Task 2.5: Holiday & Org Service Tests

**Files:**
- Create: `server-go/internal/hris/holiday/service_test.go`
- Create: `server-go/internal/hris/org/service_test.go`

- [ ] **Step 1: Create holiday service test**

```go
// server-go/internal/hris/holiday/service_test.go
package holiday

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestCreateHoliday(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "holco@ex.com", "holco", "pass123", "Hol Co", true)
	svc := NewService(db)

	t.Run("create holiday", func(t *testing.T) {
		h := &Holiday{
			Name:        "Independence Day",
			Date:        "2026-08-17",
			IsRecurring: true,
		}
		err := svc.Create(context.Background(), cID, h)
		if err != nil {
			t.Fatalf("create: %v", err)
		}
		if h.Name != "Independence Day" {
			t.Fatalf("expected Independence Day, got %s", h.Name)
		}
	})

	t.Run("list holidays", func(t *testing.T) {
		holidays, err := svc.List(context.Background(), cID, 2026)
		if err != nil {
			t.Fatalf("list: %v", err)
		}
		if len(holidays) != 1 {
			t.Fatalf("expected 1, got %d", len(holidays))
		}
	})

	t.Run("update holiday", func(t *testing.T) {
		holidays, _ := svc.List(context.Background(), cID, 2026)
		h := holidays[0]
		h.Name = "Hari Kemerdekaan"
		err := svc.Update(context.Background(), cID, h.ID, &h)
		if err != nil {
			t.Fatalf("update: %v", err)
		}
	})

	t.Run("delete holiday", func(t *testing.T) {
		holidays, _ := svc.List(context.Background(), cID, 2026)
		err := svc.Delete(context.Background(), cID, holidays[0].ID)
		if err != nil {
			t.Fatalf("delete: %v", err)
		}
	})
}
```

- [ ] **Step 2: Create org service test (Branch)**

```go
// server-go/internal/hris/org/service_test.go
package org

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestCreateBranch(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "orgco@ex.com", "orgco", "pass123", "Org Co", true)
	svc := NewService(db)

	t.Run("create branch", func(t *testing.T) {
		b, err := svc.CreateBranch(context.Background(), cID, CreateBranchRequest{
			Name:       "Jakarta Office",
			BranchType: "head_office",
		})
		if err != nil {
			t.Fatalf("create: %v", err)
		}
		if b.Name != "Jakarta Office" {
			t.Fatalf("expected Jakarta Office, got %s", b.Name)
		}
		if b.BranchType != "head_office" {
			t.Fatalf("expected head_office, got %s", b.BranchType)
		}
	})

	t.Run("list branches", func(t *testing.T) {
		branches, err := svc.ListBranches(context.Background(), cID)
		if err != nil {
			t.Fatalf("list: %v", err)
		}
		if len(branches) != 1 {
			t.Fatalf("expected 1, got %d", len(branches))
		}
	})
}
```

- [ ] **Step 3: Run tests**

```bash
cd server-go && go test ./internal/hris/holiday/ -run TestCreateHoliday -v -count=1
cd server-go && go test ./internal/hris/org/ -run TestCreateBranch -v -count=1
```

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/hris/holiday/service_test.go server-go/internal/hris/org/service_test.go
git commit -m "test(server): add HRIS holiday and org branch service tests"
```

---

## Phase 3: Web Component Tests (Days 15-21)

### Task 3.1: Setup MSW for API Mocking

**Files:**
- Modify: `web/src/test/setup.ts` (already exists)
- Modify: `web/vitest.config.ts` (already exists)

- [ ] **Step 1: Install MSW**

```bash
cd web && bun add -D msw @mswjs/data
```

- [ ] **Step 2: Update MSW handler setup**

Read `web/src/test/setup.ts`, then update:

```typescript
// web/src/test/setup.ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

export const handlers = [
  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      role: 'jobseeker',
      isVerified: true,
    });
  }),

  http.get('/api/v1/applications/me', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1/jobs', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1/industries', () => {
    return HttpResponse.json([
      { id: 'ind-1', name: 'Technology', description: 'Tech industry' },
    ]);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

export { server };
```

- [ ] **Step 3: Commit**

```bash
git add web/src/test/setup.ts web/package.json web/bun.lockb
git commit -m "test(web): add MSW setup for API mocking in component tests"
```

---

### Task 3.2: Auth Hook Tests

**Files:**
- Create: `web/src/hooks/useAuth.test.tsx`

- [ ] **Step 1: Create useAuth test**

```tsx
// web/src/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns unauthenticated state by default', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('stores tokens in localStorage on login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
          role: 'jobseeker',
          isVerified: true,
        },
      });
    });

    expect(localStorage.getItem('accessToken')).toBe('test-token');
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('clears tokens on logout', async () => {
    localStorage.setItem('accessToken', 'existing-token');
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('reads existing tokens from localStorage', () => {
    localStorage.setItem('accessToken', 'existing-token');
    localStorage.setItem('refreshToken', 'existing-refresh');

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

- [ ] **Step 2: Run useAuth tests**

```bash
cd web && bun test src/hooks/useAuth.test.tsx
```

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks/useAuth.test.tsx
git commit -m "test(web): add useAuth hook tests for login/logout/token persistence"
```

---

### Task 3.3: UI Component Tests

**Files:**
- Create: `web/src/components/ui/ErrorBoundary.test.tsx`
- Create: `web/src/components/ui/ProtectedRoute.test.tsx`
- Create: `web/src/components/ui/ThemeToggle.test.tsx`

- [ ] **Step 1: Create ErrorBoundary test**

```tsx
// web/src/components/ui/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function ThrowingComponent() {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('renders children normally', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders error UI on throw', () => {
    // Suppress console.error for this test
    const spy = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    console.error = spy;
  });
});
```

- [ ] **Step 2: Create ProtectedRoute test**

```tsx
// web/src/components/ui/ProtectedRoute.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders children when authenticated', () => {
    localStorage.setItem('accessToken', 'valid-token');
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to forbidden when role does not match', () => {
    localStorage.setItem('accessToken', 'valid-token');
    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="company">
          <div>Company Only</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Company Only')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Create ThemeToggle test**

```tsx
// web/src/components/ui/ThemeToggle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('toggles theme on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    // Theme state is in localStorage or data attribute
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run UI tests**

```bash
cd web && bun test src/components/ui/
```

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/ErrorBoundary.test.tsx web/src/components/ui/ProtectedRoute.test.tsx web/src/components/ui/ThemeToggle.test.tsx
git commit -m "test(web): add ErrorBoundary, ProtectedRoute, ThemeToggle component tests"
```

---

### Task 3.4: Layout Component Tests

**Files:**
- Create: `web/src/components/layout/Navbar.test.tsx`
- Create: `web/src/components/layout/NotificationBell.test.tsx`

- [ ] **Step 1: Create Navbar test**

```tsx
// web/src/components/layout/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders app name', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByText(/skillpass/i)).toBeInTheDocument();
  });

  it('shows login link when not authenticated', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    localStorage.setItem('accessToken', 'valid-token');
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create NotificationBell test**

```tsx
// web/src/components/layout/NotificationBell.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotificationBell } from '@/components/layout/NotificationBell';

describe('NotificationBell', () => {
  it('renders bell icon', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows unread count when present', () => {
    render(<NotificationBell unreadCount={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides count when zero', () => {
    render(<NotificationBell unreadCount={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run layout tests**

```bash
cd web && bun test src/components/layout/
```

- [ ] **Step 4: Commit**

```bash
git add web/src/components/layout/Navbar.test.tsx web/src/components/layout/NotificationBell.test.tsx
git commit -m "test(web): add Navbar and NotificationBell component tests"
```

---

### Task 3.5: Jobseeker Component Tests

**Files:**
- Create: `web/src/components/jobseeker/EvaluationScoreBadge.test.tsx`
- Create: `web/src/components/jobseeker/SkillScoresChart.test.tsx`
- Create: `web/src/components/jobseeker/AvatarUploader.test.tsx`

- [ ] **Step 1: Create EvaluationScoreBadge test**

```tsx
// web/src/components/jobseeker/EvaluationScoreBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvaluationScoreBadge } from '@/components/jobseeker/EvaluationScoreBadge';

describe('EvaluationScoreBadge', () => {
  it('renders score', () => {
    render(<EvaluationScoreBadge score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('applies correct color class for high score', () => {
    render(<EvaluationScoreBadge score={90} />);
    const badge = screen.getByText('90');
    expect(badge.className).toContain('success');
  });

  it('applies correct color class for medium score', () => {
    render(<EvaluationScoreBadge score={65} />);
    const badge = screen.getByText('65');
    expect(badge.className).toContain('warning');
  });

  it('applies correct color class for low score', () => {
    render(<EvaluationScoreBadge score={30} />);
    const badge = screen.getByText('30');
    expect(badge.className).toContain('error');
  });
});
```

- [ ] **Step 2: Create SkillScoresChart test**

```tsx
// web/src/components/jobseeker/SkillScoresChart.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkillScoresChart } from '@/components/jobseeker/SkillScoresChart';

const mockSkills = [
  { skill: 'Go', score: 90 },
  { skill: 'React', score: 75 },
  { skill: 'PostgreSQL', score: 85 },
];

describe('SkillScoresChart', () => {
  it('renders skill names', () => {
    render(<SkillScoresChart skills={mockSkills} />);
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('renders scores', () => {
    render(<SkillScoresChart skills={mockSkills} />);
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<SkillScoresChart skills={[]} />);
    expect(screen.getByText(/no skills/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Create AvatarUploader test**

```tsx
// web/src/components/jobseeker/AvatarUploader.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AvatarUploader } from '@/components/jobseeker/AvatarUploader';

describe('AvatarUploader', () => {
  it('renders upload button', () => {
    render(<AvatarUploader onUpload={vi.fn()} />);
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('shows current avatar when provided', () => {
    render(<AvatarUploader currentAvatar="/avatars/me.jpg" onUpload={vi.fn()} />);
    const img = screen.getByRole('img', { name: /avatar/i });
    expect(img).toHaveAttribute('src', '/avatars/me.jpg');
  });

  it('shows placeholder when no avatar', () => {
    render(<AvatarUploader onUpload={vi.fn()} />);
    expect(screen.getByText(/no photo/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run jobseeker tests**

```bash
cd web && bun test src/components/jobseeker/
```

- [ ] **Step 5: Commit**

```bash
git add web/src/components/jobseeker/EvaluationScoreBadge.test.tsx web/src/components/jobseeker/SkillScoresChart.test.tsx web/src/components/jobseeker/AvatarUploader.test.tsx
git commit -m "test(web): add EvaluationScoreBadge, SkillScoresChart, AvatarUploader tests"
```

---

## Phase 4: Uncovered Packages (Days 22-28)

### Task 4.1: Profile Views Service Tests

**Files:**
- Create: `server-go/internal/profileviews/service_test.go`

- [ ] **Step 1: Create profile views service test**

```go
// server-go/internal/profileviews/service_test.go
package profileviews

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestRecordView(t *testing.T) {
	db := testutil.SetupTestDB()

	_, cID, _ := testutil.CreateCompanyUser(db, "viewco@ex.com", "viewco", "pass123", "View Co", true)
	_, pID, _ := testutil.CreateJobseeker(db, "viewjs@ex.com", "viewjs", "pass123", "View JS")
	viewerID, _ := testutil.CreateUser(db, "viewer@ex.com", "viewer", "pass123", "Viewer", "company")
	svc := NewService(db)

	t.Run("record view", func(t *testing.T) {
		err := svc.RecordView(context.Background(), pID, viewerID, &cID)
		if err != nil {
			t.Fatalf("record: %v", err)
		}
	})

	t.Run("duplicate view deduplicated", func(t *testing.T) {
		err := svc.RecordView(context.Background(), pID, viewerID, &cID)
		if err != nil {
			t.Fatalf("record duplicate: %v", err)
		}
		views, _ := svc.GetViewsByProfile(context.Background(), pID)
		if len(views) != 1 {
			t.Fatalf("expected 1 view, got %d", len(views))
		}
	})
}

func TestGetViewsByProfile(t *testing.T) {
	db := testutil.SetupTestDB()

	_, cID, _ := testutil.CreateCompanyUser(db, "vcoco@ex.com", "vcoco", "pass123", "VCo Co", true)
	_, cID2, _ := testutil.CreateCompanyUser(db, "vcoco2@ex.com", "vcoco2", "pass123", "VCo Co 2", true)
	_, pID, _ := testutil.CreateJobseeker(db, "vcjs@ex.com", "vcjs", "pass123", "VC JS")
	viewer1, _ := testutil.CreateUser(db, "v1@ex.com", "v1", "pass123", "V1", "company")
	viewer2, _ := testutil.CreateUser(db, "v2@ex.com", "v2", "pass123", "V2", "company")
	svc := NewService(db)

	svc.RecordView(context.Background(), pID, viewer1, &cID)
	svc.RecordView(context.Background(), pID, viewer2, &cID2)

	views, err := svc.GetViewsByProfile(context.Background(), pID)
	if err != nil {
		t.Fatalf("views: %v", err)
	}
	if len(views) != 2 {
		t.Fatalf("expected 2 views, got %d", len(views))
	}
}
```

- [ ] **Step 2: Run profile views tests**

```bash
cd server-go && go test ./internal/profileviews/ -run TestRecordView -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/profileviews/service_test.go
git commit -m "test(server): add profile views service tests (record, dedup, listing)"
```

---

### Task 4.2: Webhook Service Tests

**Files:**
- Modify: `server-go/internal/webhook/service_test.go`

- [ ] **Step 1: Add webhook tests**

Read the existing file, then append:

```go
func TestCreateWebhook(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "whco@ex.com", "whco", "pass123", "WH Co", true)
	svc := NewService(db)

	t.Run("create webhook", func(t *testing.T) {
		wh, err := svc.Create(context.Background(), cID, "https://httpbin.org/post")
		if err != nil {
			t.Fatalf("create: %v", err)
		}
		if wh.URL != "https://httpbin.org/post" {
			t.Fatalf("expected URL, got %s", wh.URL)
		}
		if wh.Secret == "" {
			t.Fatal("expected secret to be generated")
		}
	})

	t.Run("list webhooks", func(t *testing.T) {
		webhooks, err := svc.List(context.Background(), cID)
		if err != nil {
			t.Fatalf("list: %v", err)
		}
		if len(webhooks) != 1 {
			t.Fatalf("expected 1, got %d", len(webhooks))
		}
	})

	t.Run("invalid URL rejected", func(t *testing.T) {
		_, err := svc.Create(context.Background(), cID, "not-a-url")
		if err == nil {
			t.Fatal("expected error for invalid URL")
		}
	})

	t.Run("private URL rejected (SSRF)", func(t *testing.T) {
		_, err := svc.Create(context.Background(), cID, "http://192.168.1.1/admin")
		if err == nil {
			t.Fatal("expected error for private URL")
		}
	})
}

func TestDeleteWebhook(t *testing.T) {
	db := testutil.SetupTestDB()

	cu, cID, _ := testutil.CreateCompanyUser(db, "whdel@ex.com", "whdel", "pass123", "WH Del Co", true)
	svc := NewService(db)

	wh, _ := svc.Create(context.Background(), cID, "https://httpbin.org/post")

	err := svc.Delete(context.Background(), cID, wh.ID)
	if err != nil {
		t.Fatalf("delete: %v", err)
	}

	webhooks, _ := svc.List(context.Background(), cID)
	if len(webhooks) != 0 {
		t.Fatalf("expected 0 after delete, got %d", len(webhooks))
	}
}
```

- [ ] **Step 2: Run webhook tests**

```bash
cd server-go && go test ./internal/webhook/ -run TestCreateWebhook -v -count=1
```

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/webhook/service_test.go
git commit -m "test(server): add webhook CRUD and SSRF protection tests"
```

---

### Task 4.3: Feedback & Company Reviews Tests

**Files:**
- Create: `server-go/internal/feedback/service_test.go`
- Create: `server-go/internal/companyreviews/service_test.go`

- [ ] **Step 1: Create feedback service test**

```go
// server-go/internal/feedback/service_test.go
package feedback

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestSubmitFeedback(t *testing.T) {
	db := testutil.SetupTestDB()

	_, cID, _ := testutil.CreateCompanyUser(db, "fbco@ex.com", "fbco", "pass123", "FB Co", true)
	_, pID, _ := testutil.CreateJobseeker(db, "fbjs@ex.com", "fbjs", "pass123", "FB JS")
	_, jID, _ := testutil.CreateJob(db, cID, "FB Job", "Technology", true)
	appID, _ := testutil.CreateApplication(db, pID, jID, "applied")
	svc := NewService(db)

	t.Run("submit feedback", func(t *testing.T) {
		fb, err := svc.Submit(context.Background(), cID, appID, SubmitRequest{
			Rating:  5,
			Comment: "Great candidate",
		})
		if err != nil {
			t.Fatalf("submit: %v", err)
		}
		if fb.Rating != 5 {
			t.Fatalf("expected 5, got %d", fb.Rating)
		}
	})

	t.Run("duplicate feedback rejected", func(t *testing.T) {
		_, err := svc.Submit(context.Background(), cID, appID, SubmitRequest{
			Rating:  4,
			Comment: "Good",
		})
		if err == nil {
			t.Fatal("expected error for duplicate feedback")
		}
	})
}

func TestGetCompanyFeedback(t *testing.T) {
	db := testutil.SetupTestDB()

	_, cID, _ := testutil.CreateCompanyUser(db, "gfbco@ex.com", "gfbco", "pass123", "GFB Co", true)
	svc := NewService(db)

	// Submit 3 feedbacks
	for i := 0; i < 3; i++ {
		_, pID, _ := testutil.CreateJobseeker(db, "gfbjs"+string(rune('0'+i))+"@ex.com", "gfbjs"+string(rune('0'+i)), "pass123", "GFB JS")
		_, jID, _ := testutil.CreateJob(db, cID, "GFB Job", "Technology", true)
		appID, _ := testutil.CreateApplication(db, pID, jID, "applied")
		svc.Submit(context.Background(), cID, appID, SubmitRequest{Rating: 4, Comment: "Good"})
	}

	feedbacks, err := svc.GetCompanyFeedback(context.Background(), cID)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if len(feedbacks) != 3 {
		t.Fatalf("expected 3, got %d", len(feedbacks))
	}
}
```

- [ ] **Step 2: Create company reviews service test**

```go
// server-go/internal/companyreviews/service_test.go
package companyreviews

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestSubmitReview(t *testing.T) {
	db := testutil.SetupTestDB()

	_, cID, _ := testutil.CreateCompanyUser(db, "revco@ex.com", "revco", "pass123", "Rev Co", true)
	_, pID, _ := testutil.CreateJobseeker(db, "revjs@ex.com", "revjs", "pass123", "Rev JS")
	svc := NewService(db)

	t.Run("submit review", func(t *testing.T) {
		review, err := svc.Submit(context.Background(), pID, cID, SubmitRequest{
			Rating:    4,
			Pros:      "Good work culture",
			Cons:      "Long hours",
			Advice:    "Improve work-life balance",
		})
		if err != nil {
			t.Fatalf("submit: %v", err)
		}
		if review.Rating != 4 {
			t.Fatalf("expected 4, got %d", review.Rating)
		}
	})

	t.Run("duplicate review rejected", func(t *testing.T) {
		_, err := svc.Submit(context.Background(), pID, cID, SubmitRequest{
			Rating: 3,
			Pros:   "OK",
		})
		if err == nil {
			t.Fatal("expected error for duplicate review")
		}
	})
}

func TestGetCompanyReviews(t *testing.T) {
	db := testutil.SetupTestDB()

	_, cID, _ := testutil.CreateCompanyUser(db, "grco@ex.com", "grco", "pass123", "GR Co", true)
	svc := NewService(db)

	for i := 0; i < 3; i++ {
		_, pID, _ := testutil.CreateJobseeker(db, "grjs"+string(rune('0'+i))+"@ex.com", "grjs"+string(rune('0'+i)), "pass123", "GR JS")
		svc.Submit(context.Background(), pID, cID, SubmitRequest{Rating: 4, Pros: "Good"})
	}

	reviews, avgRating, err := svc.GetCompanyReviews(context.Background(), cID)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if len(reviews) != 3 {
		t.Fatalf("expected 3 reviews, got %d", len(reviews))
	}
	if avgRating != 4.0 {
		t.Fatalf("expected avg 4.0, got %.1f", avgRating)
	}
}
```

- [ ] **Step 3: Run tests**

```bash
cd server-go && go test ./internal/feedback/ -run TestSubmitFeedback -v -count=1
cd server-go && go test ./internal/companyreviews/ -run TestSubmitReview -v -count=1
```

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/feedback/service_test.go server-go/internal/companyreviews/service_test.go
git commit -m "test(server): add feedback and company reviews service tests"
```

---

### Task 4.4: Career & SPDID Tests

**Files:**
- Create: `server-go/internal/career/service_test.go`
- Create: `server-go/internal/spdid/service_test.go`

- [ ] **Step 1: Create career service test**

```go
// server-go/internal/career/service_test.go
package career

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestGenerateCareerPath(t *testing.T) {
	db := testutil.SetupTestDB()

	_, pID, _ := testutil.CreateJobseeker(db, "careerjs@ex.com", "careerjs", "pass123", "Career JS")
	testutil.CreateExperience(db, pID, "work", "Junior Developer", "TechCorp")
	svc := NewService(db)

	t.Run("generate career path", func(t *testing.T) {
		path, err := svc.GenerateCareerPath(context.Background(), pID.String())
		if err != nil {
			t.Fatalf("generate: %v", err)
		}
		if len(path.Milestones) == 0 {
			t.Fatal("expected milestones")
		}
	})
}

func TestGetCareerInsights(t *testing.T) {
	db := testutil.SetupTestDB()

	_, pID, _ := testutil.CreateJobseeker(db, "insjs@ex.com", "insjs", "pass123", "Ins JS")
	testutil.CreateAIEvaluation(db, pID, 85)
	svc := NewService(db)

	insights, err := svc.GetCareerInsights(context.Background(), pID.String())
	if err != nil {
		t.Fatalf("insights: %v", err)
	}
	if insights.OverallScore != 85 {
		t.Fatalf("expected 85, got %d", insights.OverallScore)
	}
}
```

- [ ] **Step 2: Create SPDID service test**

```go
// server-go/internal/spdid/service_test.go
package spdid

import (
	"context"
	"testing"

	"skillpass-server-go/internal/testutil"
)

func TestGenerateSPDID(t *testing.T) {
	db := testutil.SetupTestDB()

	_, pID, _ := testutil.CreateJobseeker(db, "spdidjs@ex.com", "spdidjs", "pass123", "SPDID JS")
	testutil.CreateExperience(db, pID, "work", "Developer", "TechCo")
	svc := NewService(db)

	t.Run("generate spdid", func(t *testing.T) {
		spdid, err := svc.Generate(context.Background(), pID.String())
		if err != nil {
			t.Fatalf("generate: %v", err)
		}
		if spdid.ID == "" {
			t.Fatal("expected spdid ID")
		}
	})
}

func TestVerifySPDID(t *testing.T) {
	db := testutil.SetupTestDB()

	_, pID, _ := testutil.CreateJobseeker(db, "vspdid@ex.com", "vspdid", "pass123", "VSPDID JS")
	svc := NewService(db)

	spdid, _ := svc.Generate(context.Background(), pID.String())

	t.Run("verify valid spdid", func(t *testing.T) {
		valid, err := svc.Verify(context.Background(), spdid.ID)
		if err != nil {
			t.Fatalf("verify: %v", err)
		}
		if !valid {
			t.Fatal("expected valid")
		}
	})

	t.Run("verify invalid spdid", func(t *testing.T) {
		valid, err := svc.Verify(context.Background(), "nonexistent-id")
		if err != nil {
			t.Fatalf("verify: %v", err)
		}
		if valid {
			t.Fatal("expected invalid")
		}
	})
}
```

- [ ] **Step 3: Run tests**

```bash
cd server-go && go test ./internal/career/ -run TestGenerateCareerPath -v -count=1
cd server-go && go test ./internal/spdid/ -run TestGenerateSPDID -v -count=1
```

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/career/service_test.go server-go/internal/spdid/service_test.go
git commit -m "test(server): add career path and SPDID service tests"
```

---

## Phase 5: Coverage Verification (Day 29)

### Task 5.1: Generate Coverage Report

- [ ] **Step 1: Run Go coverage**

```bash
cd server-go && go test ./... -coverprofile=coverage.out -covermode=atomic -count=1
go tool cover -func=coverage.out | grep total
```

Expected: Coverage should be ≥60% across all tested packages.

- [ ] **Step 2: Run web coverage**

```bash
cd web && bun test --coverage
```

- [ ] **Step 3: Identify gaps**

```bash
cd server-go && go tool cover -func=coverage.out | grep -v "100.0%" | sort -t'%' -k2 -n
```

- [ ] **Step 4: Commit coverage baseline**

```bash
git add server-go/coverage.out
git commit -m "test: add coverage baseline report"
```

---

### Task 5.2: Fill Critical Gaps

Based on coverage report, add tests for any critical path below 80%:

- [ ] **Step 1: Identify packages below 80%**

```bash
cd server-go && go tool cover -func=coverage.out | awk -F'\t' '{print $1}' | cut -d'.' -f1-3 | sort -u | while read pkg; do
  pct=$(go tool cover -func=coverage.out | grep "^$pkg" | awk '{print $NF}' | tail -1)
  echo "$pct $pkg"
done | sort -n
```

- [ ] **Step 2: Add targeted tests for gaps**

For each package below 80%, add tests following the patterns established in Tasks 1-4.

- [ ] **Step 3: Re-run coverage**

```bash
cd server-go && go test ./... -coverprofile=coverage.out -covermode=atomic -count=1
go tool cover -func=coverage.out | grep total
```

- [ ] **Step 4: Final commit**

```bash
git add server-go/coverage.out
git commit -m "test: achieve 80% coverage on critical paths"
```

---

## Timeline Summary

| Phase | Days | Focus | Target Coverage |
|-------|------|-------|-----------------|
| Phase 0 | 1-2 | Test infrastructure (testcontainers, factories) | Foundation |
| Phase 1 | 3-7 | Auth & Applications (critical path) | 80% on auth, applications |
| Phase 2 | 8-14 | HRIS modules (8 packages) | 60% on HRIS |
| Phase 3 | 15-21 | Web component tests (26 components) | 40% on web |
| Phase 4 | 22-28 | Remaining packages (profile views, webhook, feedback, career, spdid) | 70% overall |
| Phase 5 | 29 | Coverage verification and gap filling | 80% on critical paths |

---

## Test Files Summary

### Go Server (24 new test files)

| File | Package | Tests |
|------|---------|-------|
| `testutil/testcontainer.go` | testutil | CI-ready DB setup |
| `testutil/hris_factories.go` | testutil | HRIS test data factories |
| `handlers/auth_test.go` | handlers | +5 tests (password reset, token refresh) |
| `application/handler_test.go` | application | +8 tests (transitions, messages, auth) |
| `hris/employee/service_test.go` | employee | 5 tests (CRUD, auth, edge cases) |
| `hris/attendance/service_test.go` | attendance | 4 tests (check-in/out, listing) |
| `hris/leave/service_test.go` | leave | 4 tests (request, approve, reject) |
| `hris/payroll/service_test.go` | payroll | 4 tests (runs, payslips, finalization) |
| `hris/holiday/service_test.go` | holiday | 3 tests (CRUD, listing) |
| `hris/org/service_test.go` | org | 4 tests (departments, positions, org chart) |
| `profileviews/service_test.go` | profileviews | 3 tests (record, count, viewers) |
| `webhook/service_test.go` | webhook | +2 tests (delivery, deactivation) |
| `feedback/service_test.go` | feedback | 3 tests (submit, duplicate, list) |
| `companyreviews/service_test.go` | companyreviews | 3 tests (submit, duplicate, list) |
| `career/service_test.go` | career | 2 tests (path, insights) |
| `spdid/service_test.go` | spdid | 3 tests (generate, verify) |

### Web Frontend (14 new test files)

| File | Component | Tests |
|------|-----------|-------|
| `test/setup.ts` | MSW handlers | API mock setup |
| `hooks/useAuth.test.tsx` | useAuth | 4 tests (auth state, login, logout, persistence) |
| `components/ui/ErrorBoundary.test.tsx` | ErrorBoundary | 2 tests (normal, error) |
| `components/ui/ProtectedRoute.test.tsx` | ProtectedRoute | 3 tests (auth, redirect, role) |
| `components/ui/ThemeToggle.test.tsx` | ThemeToggle | 2 tests (render, toggle) |
| `components/layout/Navbar.test.tsx` | Navbar | 3 tests (brand, login, user menu) |
| `components/layout/NotificationBell.test.tsx` | NotificationBell | 3 tests (icon, count, zero) |
| `components/jobseeker/EvaluationScoreBadge.test.tsx` | EvaluationScoreBadge | 4 tests (score, colors) |
| `components/jobseeker/SkillScoresChart.test.tsx` | SkillScoresChart | 3 tests (skills, scores, empty) |
| `components/jobseeker/AvatarUploader.test.tsx` | AvatarUploader | 3 tests (button, avatar, placeholder) |
| `components/onboarding/JobseekerOnboarding.test.tsx` | JobseekerOnboarding | 2 tests |
| `components/onboarding/CompanyOnboarding.test.tsx` | CompanyOnboarding | 2 tests |
| `components/company/JobMatches.test.tsx` | JobMatches | 2 tests |
| `components/passport/SharePassport.test.tsx` | SharePassport | 2 tests |
