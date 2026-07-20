# Server Comprehensive Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full test coverage for all 33 server API endpoints — unit tests per handler, integration tests per HTTP endpoint, with proper test infrastructure.

**Architecture:** Tests use Go's `testing` + `httptest` packages with PostgreSQL test database. Each handler test file tests one handler group. Test helpers provide DB setup/teardown, JWT token generation, and data factories. Auth middleware is tested separately. Each test uses transaction rollback for isolation.

**Tech Stack:** Go 1.24, `testing`, `httptest`, `testify/assert`, `pgx` via `database/sql`, go-jet, JWT (golang-jwt)

---

### File Structure

```
server-go/internal/
├── testutil/                    (NEW — test helpers)
│   ├── db.go                    DB setup, migration, cleanup
│   ├── auth.go                  JWT token generation for tests
│   └── factories.go             Test data factories (users, companies, etc.)
├── handlers/
│   ├── health_test.go           (NEW) GET /api/v1/health
│   ├── reference_test.go        (NEW) GET /api/v1/industries, /tags
│   ├── auth_test.go             (NEW) POST /api/v1/auth/register, /login, /refresh, /logout
│   ├── profiles_test.go         (NEW) GET/PUT /profiles/me, CRUD /experience
│   ├── passport_test.go         (NEW) GET /api/v1/profiles/:username
│   ├── companies_test.go        (NEW) Company CRUD + verification
│   ├── jobs_test.go             (NEW) Job CRUD + listing
│   ├── search_test.go           (NEW) GET /api/v1/search/candidates
│   └── admin_test.go            (NEW) Admin verification endpoints
├── evaluation/
│   └── handler_test.go          (NEW) POST /evaluate/me, GET /evaluate/me/results
├── application/
│   └── handler_test.go          (NEW) Job apply, list, status update
├── matching/
│   └── handler_test.go          (NEW) Job/candidate matching
├── middleware/
│   └── auth_test.go             (NEW) AuthRequired, RequireRole, RequireVerifiedCompany
├── lib/
│   └── password_test.go         (NEW) Password hashing + verification
├── middleware/
│   └── ratelimit_test.go        (NEW) Rate limiter unit tests
```

### Endpoint Inventory (33 total)

| # | Method | Path | Auth | Handler | Test File |
|---|--------|------|------|---------|-----------|
| 1 | GET | /api/v1/health | None | GetHealth | health_test.go |
| 2 | GET | /api/v1/industries | None | GetIndustries | reference_test.go |
| 3 | GET | /api/v1/tags | None | GetTags | reference_test.go |
| 4 | GET | /api/v1/jobs | None | ListJobs | jobs_test.go |
| 5 | GET | /api/v1/jobs/:id | None | GetJob | jobs_test.go |
| 6 | GET | /api/v1/profiles/:username | None | GetProfile (passport) | passport_test.go |
| 7 | POST | /api/v1/auth/register | RateLimit | Register | auth_test.go |
| 8 | POST | /api/v1/auth/login | RateLimit | Login | auth_test.go |
| 9 | POST | /api/v1/auth/refresh | RateLimit | Refresh | auth_test.go |
| 10 | POST | /api/v1/auth/logout | JWT | Logout | auth_test.go |
| 11 | GET | /api/v1/profiles/me | JWT | GetMyProfile | profiles_test.go |
| 12 | PUT | /api/v1/profiles/me | JWT | UpdateMyProfile | profiles_test.go |
| 13 | POST | /api/v1/profiles/me/experience | JWT | CreateExperience | profiles_test.go |
| 14 | PUT | /api/v1/profiles/me/experience/:id | JWT | UpdateExperience | profiles_test.go |
| 15 | DELETE | /api/v1/profiles/me/experience/:id | JWT | DeleteExperience | profiles_test.go |
| 16 | GET | /api/v1/company/profile | JWT+role=company | GetProfile (company) | companies_test.go |
| 17 | PUT | /api/v1/company/profile | JWT+role=company | UpdateProfile | companies_test.go |
| 18 | POST | /api/v1/company/verification | JWT+role=company | SubmitVerification | companies_test.go |
| 19 | GET | /api/v1/company/verification-status | JWT+role=company | GetVerificationStatus | companies_test.go |
| 20 | GET | /api/v1/jobs/me | JWT+role=company+verified | ListMyJobs | jobs_test.go |
| 21 | POST | /api/v1/jobs | JWT+role=company+verified | CreateJob | jobs_test.go |
| 22 | PUT | /api/v1/jobs/:id | JWT+role=company+verified | UpdateJob | jobs_test.go |
| 23 | DELETE | /api/v1/jobs/:id | JWT+role=company+verified | DeleteJob | jobs_test.go |
| 24 | GET | /api/v1/search/candidates | JWT+role=company+verified | SearchCandidates | search_test.go |
| 25 | GET | /api/v1/admin/verifications/pending | JWT+role=admin | ListPendingVerifications | admin_test.go |
| 26 | POST | /api/v1/admin/verifications/:id | JWT+role=admin | HandleVerification | admin_test.go |
| 27 | POST | /api/v1/evaluate/me | JWT+role=jobseeker | PostEvaluate | evaluation/handler_test.go |
| 28 | GET | /api/v1/evaluate/me/results | JWT+role=jobseeker | GetLatestEvaluation | evaluation/handler_test.go |
| 29 | POST | /api/v1/jobs/:id/apply | JWT+role=jobseeker | Apply | application/handler_test.go |
| 30 | GET | /api/v1/applications/me | JWT+role=jobseeker | ListMyApplications | application/handler_test.go |
| 31 | PUT | /api/v1/applications/:id/status | JWT+role=company+verified | UpdateStatus | application/handler_test.go |
| 32 | GET | /api/v1/jobs/matches | JWT+role=jobseeker | MatchJobs | matching/handler_test.go |
| 33 | GET | /api/v1/candidates/matches | JWT+role=company+verified | MatchCandidates | matching/handler_test.go |

---

### Task 0: Pre-requisite — Ensure DB is running and migrations applied

This must be done before any test that touches the database.

- [ ] **Step 1: Start DB container and run migrations**

Run: `docker compose up db -d && bun run db:migrate`
Expected: Database running, all migrations applied

---

### Task 1: Test Infrastructure — Database Helpers

**Files:**
- Create: `server-go/internal/testutil/db.go`
- Create: `server-go/internal/testutil/auth.go`
- Create: `server-go/internal/testutil/factories.go`

- [ ] **Step 1: Create `server-go/internal/testutil/db.go`**

```go
package testutil

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"testing"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var TestDBURL = func() string {
	if v := os.Getenv("SKILLPASS_TEST_DATABASE_URL"); v != "" {
		return v
	}
	return "postgres://postgres:postgres@localhost:5432/skillpass"
}()

var (
	setupOnce sync.Once
	setupErr  error
	globalDB  *sql.DB
)

func SetupTestDB() *sql.DB {
	setupOnce.Do(func() {
		ctx := context.Background()
		db, err := sql.Open("pgx", TestDBURL)
		if err != nil {
			setupErr = fmt.Errorf("open test db: %w", err)
			return
		}
		if err := db.PingContext(ctx); err != nil {
			db.Close()
			setupErr = fmt.Errorf("ping test db: %w", err)
			return
		}
		globalDB = db
		log.Printf("Test DB connected: %s", TestDBURL)
		if err := runMigrations(ctx, db); err != nil {
			db.Close()
			setupErr = fmt.Errorf("run migrations: %w", err)
			return
		}
		log.Println("Test DB migrations complete")
	})
	if setupErr != nil {
		log.Fatalf("Test DB setup failed: %v", setupErr)
	}
	return globalDB
}

func NewTestTx(t *testing.T, db *sql.DB) (*sql.Tx, func()) {
	t.Helper()
	ctx := context.Background()
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		t.Fatalf("begin tx: %v", err)
	}
	return tx, func() { _ = tx.Rollback() }
}

func runMigrations(ctx context.Context, db *sql.DB) error {
	if _, err := db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			id SERIAL PRIMARY KEY,
			filename VARCHAR(255) NOT NULL UNIQUE,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}
	migrationsDir := "../migrations"
	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		migrationsDir = "migrations"
		files, err = filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
		if err != nil {
			return fmt.Errorf("glob migrations: %w", err)
		}
	}
	sort.Strings(files)
	rows, err := db.QueryContext(ctx, "SELECT filename FROM schema_migrations ORDER BY id")
	if err != nil {
		return fmt.Errorf("query applied: %w", err)
	}
	applied := make(map[string]bool)
	for rows.Next() {
		var fn string
		if err := rows.Scan(&fn); err != nil {
			rows.Close()
			return fmt.Errorf("scan: %w", err)
		}
		applied[fn] = true
	}
	rows.Close()
	for _, file := range files {
		filename := filepath.Base(file)
		if applied[filename] {
			continue
		}
		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("read %s: %w", filename, err)
		}
		if _, err := db.ExecContext(ctx, string(content)); err != nil {
			return fmt.Errorf("exec %s: %w", filename, err)
		}
		if _, err := db.ExecContext(ctx,
			"INSERT INTO schema_migrations (filename) VALUES ($1)", filename,
		); err != nil {
			return fmt.Errorf("record %s: %w", filename, err)
		}
		fmt.Printf("  MIGRATE %s\n", filename)
	}
	return nil
}
```

- [ ] **Step 2: Create `server-go/internal/testutil/auth.go`**

```go
package testutil

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const TestJWTSecret = "test-secret-for-testing-only"

func GenerateToken(userID, role string, ttl time.Duration) string {
	now := time.Now()
	claims := jwt.MapClaims{
		"userId": userID,
		"role":   role,
		"iat":    now.Unix(),
		"exp":    now.Add(ttl).Unix(),
	}
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(TestJWTSecret))
	return token
}

func GenerateExpiredToken(userID, role string) string {
	now := time.Now()
	claims := jwt.MapClaims{
		"userId": userID,
		"role":   role,
		"iat":    now.Add(-2 * time.Hour).Unix(),
		"exp":    now.Add(-1 * time.Hour).Unix(),
	}
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(TestJWTSecret))
	return token
}

func GenerateRefreshToken(userID, role, jti string, ttl time.Duration) string {
	now := time.Now()
	claims := jwt.MapClaims{
		"jti":    jti,
		"userId": userID,
		"role":   role,
		"type":   "refresh",
		"iat":    now.Unix(),
		"exp":    now.Add(ttl).Unix(),
	}
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(TestJWTSecret))
	return token
}
```

- [ ] **Step 3: Create `server-go/internal/testutil/factories.go`**

```go
package testutil

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	. "github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"skillpass-server-go/internal/gen"
	"skillpass-server-go/internal/lib"
)

func CreateUser(tx *sql.Tx, email, username, password, name, role string) (uuid.UUID, error) {
	hash, err := lib.HashPassword(password)
	if err != nil {
		return uuid.Nil, fmt.Errorf("hash password: %w", err)
	}
	stmt := gen.Users.INSERT(
		gen.Users.Email, gen.Users.Username, gen.Users.PasswordHash, gen.Users.Name, gen.Users.Role,
	).VALUES(email, username, hash, name, role).RETURNING(gen.Users.ID)
	var user struct{ ID uuid.UUID }
	if err := stmt.QueryContext(context.Background(), tx, &user); err != nil {
		return uuid.Nil, fmt.Errorf("insert user: %w", err)
	}
	return user.ID, nil
}

func CreateJobseeker(tx *sql.Tx, email, username, password, name string) (uuid.UUID, uuid.UUID, error) {
	userID, err := CreateUser(tx, email, username, password, name, "jobseeker")
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}
	profileID := uuid.New()
	_, err = gen.JobseekerProfiles.INSERT(
		gen.JobseekerProfiles.ID, gen.JobseekerProfiles.UserID, gen.JobseekerProfiles.Slug,
	).VALUES(profileID, userID, username).ExecContext(context.Background(), tx)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("insert profile: %w", err)
	}
	return userID, profileID, nil
}

func CreateCompanyUser(tx *sql.Tx, email, username, password, companyName string, verified bool) (uuid.UUID, uuid.UUID, error) {
	userID, err := CreateUser(tx, email, username, password, companyName, "company")
	if err != nil {
		return uuid.Nil, uuid.Nil, err
	}
	companyID := uuid.New()
	verificationStatus := gen.VerificationStatusVerified
	if !verified {
		verificationStatus = gen.VerificationStatusPending
	}
	_, err = gen.Companies.INSERT(
		gen.Companies.ID, gen.Companies.UserID, gen.Companies.CompanyName,
		gen.Companies.Industry, gen.Companies.VerificationDocs, gen.Companies.VerificationStatus,
	).VALUES(
		companyID, userID, companyName, "Technology",
		`{"businessRegistration":"reg123","website":"https://example.com","address":"123 Main St","contact":"contact@example.com"}`,
		verificationStatus,
	).ExecContext(context.Background(), tx)
	if err != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("insert company: %w", err)
	}
	if verified {
		_, err = gen.Users.UPDATE().SET(
			gen.Users.IsVerified.SET(Bool(true)),
		).WHERE(gen.Users.ID.EQ(UUID(userID))).ExecContext(context.Background(), tx)
		if err != nil {
			return uuid.Nil, uuid.Nil, fmt.Errorf("mark verified: %w", err)
		}
	}
	return userID, companyID, nil
}

func CreateAdmin(tx *sql.Tx, email, username, password string) (uuid.UUID, error) {
	return CreateUser(tx, email, username, password, "Admin", "admin")
}

func CreateJob(tx *sql.Tx, companyID uuid.UUID, title, industry string, open bool) (uuid.UUID, error) {
	jobID := uuid.New()
	status := gen.JobStatusOpen
	if !open {
		status = gen.JobStatusClosed
	}
	_, err := gen.JobPostings.INSERT(
		gen.JobPostings.ID, gen.JobPostings.CompanyID, gen.JobPostings.Title,
		gen.JobPostings.Description, gen.JobPostings.Industry, gen.JobPostings.Status,
	).VALUES(jobID, companyID, title, "Test job description", industry, status).
		ExecContext(context.Background(), tx)
	return jobID, err
}

func CreateExperience(tx *sql.Tx, profileID uuid.UUID, expType, title, org string) (uuid.UUID, error) {
	expID := uuid.New()
	_, err := gen.JobExperiences.INSERT(
		gen.JobExperiences.ID, gen.JobExperiences.ProfileID, gen.JobExperiences.Type,
		gen.JobExperiences.Title, gen.JobExperiences.Organization, gen.JobExperiences.StartDate,
		gen.JobExperiences.IsCurrent,
	).VALUES(expID, profileID, expType, title, org, "2020-01", true).
		ExecContext(context.Background(), tx)
	return expID, err
}

func InsertRefreshToken(tx *sql.Tx, tokenID uuid.UUID, userID uuid.UUID, tokenStr string, expiresAt time.Time) error {
	hash := sha256.Sum256([]byte(tokenStr))
	tokenHash := hex.EncodeToString(hash[:])
	_, err := gen.RefreshTokens.INSERT(
		gen.RefreshTokens.ID, gen.RefreshTokens.UserID, gen.RefreshTokens.TokenHash,
		gen.RefreshTokens.ExpiresAt,
	).VALUES(tokenID, userID, tokenHash, TimestampzT(expiresAt)).ExecContext(context.Background(), tx)
	return err
}

func CreateIndustry(tx *sql.Tx, name, description string) error {
	_, err := gen.IndustryCategories.INSERT(
		gen.IndustryCategories.Name, gen.IndustryCategories.Description,
	).VALUES(name, description).ExecContext(context.Background(), tx)
	return err
}

func CreateTag(tx *sql.Tx, name, industryID string) error {
	_, err := gen.Tags.INSERT(
		gen.Tags.Name, gen.Tags.IndustryCategoryID,
	).VALUES(name, industryID).ExecContext(context.Background(), tx)
	return err
}

func CreateAIEvaluation(tx *sql.Tx, profileID uuid.UUID, overallScore int) error {
	id := uuid.New()
	_, err := gen.AiEvaluations.INSERT(
		gen.AiEvaluations.ID, gen.AiEvaluations.ProfileID, gen.AiEvaluations.OverallScore,
		gen.AiEvaluations.Strengths, gen.AiEvaluations.Weaknesses,
		gen.AiEvaluations.Suggestions, gen.AiEvaluations.SkillScores,
	).VALUES(
		id, profileID, overallScore,
		`[{"skill":"Go","score":90,"note":"Strong"}]`,
		`[{"skill":"React","score":40,"note":"Weak"}]`,
		`[{"area":"Frontend","tip":"Learn React"}]`,
		`[{"skill":"Go","category":"backend","score":90}]`,
	).ExecContext(context.Background(), tx)
	return err
}

func CreateApplication(tx *sql.Tx, profileID, jobPostingID uuid.UUID, status string) (uuid.UUID, error) {
	id := uuid.New()
	_, err := gen.Applications.INSERT(
		gen.Applications.ID, gen.Applications.JobseekerID,
		gen.Applications.JobPostingID, gen.Applications.Status,
	).VALUES(id, profileID, jobPostingID, status).ExecContext(context.Background(), tx)
	return id, err
}
```

- [ ] **Step 4: Create directory and verify**

Run: `mkdir -p server-go/internal/testutil && go vet ./server-go/internal/testutil/`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add server-go/internal/testutil/
git commit -m "test: add test infrastructure (DB helper, JWT helper, data factories)"

---

### Task 2: Password Library Tests

**Files:**
- Create: `server-go/internal/lib/password_test.go`

- [ ] **Step 1: Write `server-go/internal/lib/password_test.go`**

```go
package lib

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	hash, err := HashPassword("test-password-123")
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}
	if hash == "" {
		t.Fatal("HashPassword returned empty string")
	}
	if len(hash) < 4 || (hash[:4] != "$2a$" && hash[:4] != "$2b$") {
		t.Fatalf("HashPassword should produce bcrypt hash, got: %s", hash[:min(len(hash), 4)])
	}
}

func TestVerifyPasswordCorrect(t *testing.T) {
	hash, err := HashPassword("correct-password")
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}
	valid, err := VerifyPassword("correct-password", hash)
	if err != nil {
		t.Fatalf("VerifyPassword failed: %v", err)
	}
	if !valid {
		t.Fatal("VerifyPassword should return true for correct password")
	}
}

func TestVerifyPasswordIncorrect(t *testing.T) {
	hash, err := HashPassword("correct-password")
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}
	valid, err := VerifyPassword("wrong-password", hash)
	if err != nil {
		t.Fatalf("VerifyPassword failed: %v", err)
	}
	if valid {
		t.Fatal("VerifyPassword should return false for incorrect password")
	}
}

func TestPasswordUniqueness(t *testing.T) {
	h1, _ := HashPassword("same-password")
	h2, _ := HashPassword("same-password")
	if h1 == h2 {
		t.Fatal("Two hashes of the same password should differ due to salt")
	}
}

func TestBcryptCostConstant(t *testing.T) {
	if BcryptCost != 10 {
		t.Fatalf("Expected BcryptCost=10, got %d", BcryptCost)
	}
}

func TestVerifyPasswordArgon2id(t *testing.T) {
	// A synthetic argon2id hash — just ensure no panic/crash
	argonHash := "$argon2id$v=19$m=65536,t=1,p=4$c29tZXNhbHRzb21lc2FsdA$rHmLqLJzBaLHkJmPjFQmJg"
	valid, err := VerifyPassword("password", argonHash)
	if err != nil {
		t.Logf("Got error for synthetic argon2id hash: %v (acceptable)", err)
	}
	if valid {
		t.Log("Synthetic hash verified (hash format may be coincidental)")
	}
}
```

- [ ] **Step 2: Run password tests**

Run: `go test -v ./server-go/internal/lib/ -run 'TestHashPassword|TestVerify|TestPasswordUniqueness|TestBcryptCost'`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/lib/password_test.go
git commit -m "test: add password hashing unit tests"
```

---

### Task 3: Auth Middleware Tests

**Files:**
- Create: `server-go/internal/middleware/auth_test.go`

- [ ] **Step 1: Write `server-go/internal/middleware/auth_test.go`**

```go
package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAuthRequired(t *testing.T) {
	t.Run("no auth header", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)

		AuthRequired("secret")(c)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})

	t.Run("invalid token", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)
		c.Request.Header.Set("Authorization", "Bearer invalid-token")

		AuthRequired("secret")(c)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})

	t.Run("missing Bearer prefix", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)
		c.Request.Header.Set("Authorization", "Token abc123")

		AuthRequired("secret")(c)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})
}

func TestRequireRole(t *testing.T) {
	t.Run("correct role passes", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", "admin")

		RequireRole("admin")(c)
		if c.IsAborted() {
			t.Fatal("should not abort for correct role")
		}
	})

	t.Run("wrong role returns 403", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", "jobseeker")

		RequireRole("company")(c)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", w.Code)
		}
		if !c.IsAborted() {
			t.Fatal("should abort for wrong role")
		}
	})

	t.Run("no role set returns 403", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		RequireRole("admin")(c)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", w.Code)
		}
	})
}
```

- [ ] **Step 2: Run middleware tests**

Run: `go test -v ./server-go/internal/middleware/ -run 'TestAuthRequired|TestRequireRole'`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/middleware/auth_test.go
git commit -m "test: add auth middleware unit tests"
```

---

### Task 4: Rate Limiter Tests

**Files:**
- Create: `server-go/internal/middleware/ratelimit_test.go`

- [ ] **Step 1: Write `server-go/internal/middleware/ratelimit_test.go`**

```go
package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRateLimiterAllow(t *testing.T) {
	rl := NewRateLimiter(10, 5) // 10 rps, burst of 5

	// First 5 requests should be allowed
	for i := 0; i < 5; i++ {
		if !rl.Allow("192.168.1.1") {
			t.Fatalf("request %d should be allowed within burst", i+1)
		}
	}
	// 6th request may or may not be allowed depending on timing
	// but at least the first 5 must be allowed
}

func TestRateLimiterMiddleware(t *testing.T) {
	rl := NewRateLimiter(1000, 100) // very high limit so we don't hit it

	router := gin.New()
	router.GET("/test", rl.Middleware(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}

func TestRateLimiterDifferentIPs(t *testing.T) {
	rl := NewRateLimiter(100, 5)

	// Different IPs should have independent buckets
	if !rl.Allow("10.0.0.1") {
		t.Fatal("10.0.0.1 should be allowed")
	}
	if !rl.Allow("10.0.0.2") {
		t.Fatal("10.0.0.2 should be allowed")
	}
}

func TestClientIP(t *testing.T) {
	t.Run("uses X-Forwarded-For", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)
		c.Request.Header.Set("X-Forwarded-For", "203.0.113.1, 10.0.0.1")
		c.Request.RemoteAddr = "10.0.0.1:12345"

		ip := clientIP(c)
		if ip != "203.0.113.1" {
			t.Fatalf("expected 203.0.113.1, got %s", ip)
		}
	})

	t.Run("falls back to RemoteAddr", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)
		c.Request.RemoteAddr = "192.168.1.1:8080"

		ip := clientIP(c)
		if ip != "192.168.1.1" {
			t.Fatalf("expected 192.168.1.1, got %s", ip)
		}
	})
}
```

- [ ] **Step 2: Run rate limiter tests**

Run: `go test -v ./server-go/internal/middleware/ -run 'TestRateLimiter|TestClientIP'`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/middleware/ratelimit_test.go
git commit -m "test: add rate limiter unit tests"
```

---

### Task 5: Health Endpoint Tests

**Files:**
- Create: `server-go/internal/handlers/health_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/health_test.go`**

```go
package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestGetHealth(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/api/v1/health", nil)
	GetHealth(c)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if status, ok := resp["status"]; !ok || status != "ok" {
		t.Fatalf("expected status=ok, got %v", resp)
	}
	if _, ok := resp["timestamp"]; !ok {
		t.Fatal("response should contain timestamp")
	}
}

func TestGetHealthOnlyGET(t *testing.T) {
	router := gin.New()
	router.GET("/api/v1/health", GetHealth)
	w := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/v1/health", nil)
	router.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound && w.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 404 or 405, got %d", w.Code)
	}
}
```

- [ ] **Step 2: Run health tests**

Run: `go test -v ./server-go/internal/handlers/ -run TestGetHealth`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/health_test.go
git commit -m "test: add health endpoint tests"

---

### Task 6: Reference Endpoint Tests (Industries + Tags)

**Files:**
- Create: `server-go/internal/handlers/reference_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/reference_test.go`**

```go
package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/testutil"
)

func TestGetIndustries(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	testutil.CreateIndustry(tx, "Technology", "Software and IT")
	testutil.CreateIndustry(tx, "Healthcare", "Medical services")

	router := gin.New()
	h := NewReferenceHandler(tx)
	router.GET("/api/v1/industries", h.GetIndustries)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/v1/industries", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	var resp []interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(resp) < 2 {
		t.Fatalf("expected at least 2 industries, got %d", len(resp))
	}
}

func TestGetIndustriesEmpty(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	router := gin.New()
	h := NewReferenceHandler(tx)
	router.GET("/api/v1/industries", h.GetIndustries)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/v1/industries", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var resp []interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if len(resp) != 0 {
		t.Fatalf("expected empty array, got %d items", len(resp))
	}
}

func TestGetTags(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	testutil.CreateIndustry(tx, "Technology", "SW")
	var techID string
	tx.QueryRow("SELECT id FROM industry_categories WHERE name = 'Technology'").Scan(&techID)
	testutil.CreateTag(tx, "Go", techID)
	testutil.CreateTag(tx, "React", techID)

	router := gin.New()
	h := NewReferenceHandler(tx)
	router.GET("/api/v1/tags", h.GetTags)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/v1/tags", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	var resp []interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if len(resp) < 2 {
		t.Fatalf("expected at least 2 tags, got %d", len(resp))
	}
}

func TestGetTagsFilterByIndustry(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	testutil.CreateIndustry(tx, "Technology", "SW")
	testutil.CreateIndustry(tx, "Healthcare", "Med")
	var techID, healthID string
	tx.QueryRow("SELECT id FROM industry_categories WHERE name = 'Technology'").Scan(&techID)
	tx.QueryRow("SELECT id FROM industry_categories WHERE name = 'Healthcare'").Scan(&healthID)
	testutil.CreateTag(tx, "Go", techID)
	testutil.CreateTag(tx, "Nursing", healthID)

	router := gin.New()
	h := NewReferenceHandler(tx)
	router.GET("/api/v1/tags", h.GetTags)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/v1/tags?industry="+techID, nil)
	router.ServeHTTP(w, req)

	var resp []interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if len(resp) != 1 {
		t.Fatalf("expected 1 tag filtered by industry, got %d", len(resp))
	}
}
```

- [ ] **Step 2: Run reference tests**

Run: `go test -v ./server-go/internal/handlers/ -run 'TestGetIndustries|TestGetTags' -count=1`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/reference_test.go
git commit -m "test: add reference endpoint tests (industries, tags)"
```

---

### Task 7: Auth Endpoint Tests (Register + Login + Refresh + Logout)

**Files:**
- Create: `server-go/internal/handlers/auth_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/auth_test.go`**

```go
package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestRegister(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	router := gin.New()
	h := NewAuthHandler(tx, testutil.TestJWTSecret)
	rl := middleware.NewRateLimiter(100, 200)
	router.POST("/api/v1/auth/register", rl.Middleware(), h.Register)

	t.Run("register jobseeker success", func(t *testing.T) {
		body := `{"email":"test@example.com","username":"testuser","password":"password123","name":"Test User","role":"jobseeker"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
		var resp LoginResponse
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if resp.AccessToken == "" {
			t.Fatal("expected access token")
		}
		if resp.User.Email != "test@example.com" {
			t.Fatalf("expected test@example.com, got %s", resp.User.Email)
		}
		if resp.User.Role != "jobseeker" {
			t.Fatalf("expected jobseeker, got %s", resp.User.Role)
		}
	})

	t.Run("register company success", func(t *testing.T) {
		body := `{"email":"company@example.com","username":"testcompany","password":"password123","name":"","role":"company","companyName":"Test Corp"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
		var resp LoginResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.User.Name != "Test Corp" {
			t.Fatalf("expected 'Test Corp', got '%s'", resp.User.Name)
		}
	})

	t.Run("register duplicate email", func(t *testing.T) {
		body := `{"email":"test@example.com","username":"another","password":"password123","name":"Another","role":"jobseeker"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		if w.Code != http.StatusConflict {
			t.Fatalf("expected 409, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("register missing required fields", func(t *testing.T) {
		cases := []struct{ name, body string }{
			{"no email", `{"username":"u","password":"password123","name":"U","role":"jobseeker"}`},
			{"no username", `{"email":"u@test.com","password":"password123","name":"U","role":"jobseeker"}`},
			{"no password", `{"email":"u@test.com","username":"u","name":"U","role":"jobseeker"}`},
			{"invalid email", `{"email":"bad","username":"u","password":"password123","name":"U","role":"jobseeker"}`},
			{"short password", `{"email":"u@test.com","username":"u","password":"short","name":"U","role":"jobseeker"}`},
		}
		for _, tc := range cases {
			t.Run(tc.name, func(t *testing.T) {
				w := httptest.NewRecorder()
				req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBufferString(tc.body))
				req.Header.Set("Content-Type", "application/json")
				router.ServeHTTP(w, req)
				if w.Code != http.StatusBadRequest {
					t.Fatalf("expected 400 for '%s', got %d: %s", tc.name, w.Code, w.Body.String())
				}
			})
		}
	})
}

func TestLogin(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	testutil.CreateUser(tx, "login@example.com", "loginuser", "correct-password", "Login User", "jobseeker")

	router := gin.New()
	h := NewAuthHandler(tx, testutil.TestJWTSecret)
	rl := middleware.NewRateLimiter(100, 200)
	router.POST("/api/v1/auth/login", rl.Middleware(), h.Login)

	t.Run("login success", func(t *testing.T) {
		body := `{"email":"login@example.com","password":"correct-password"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("login wrong password", func(t *testing.T) {
		body := `{"email":"login@example.com","password":"wrong-password"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("login nonexistent email", func(t *testing.T) {
		body := `{"email":"nobody@example.com","password":"password123"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("login invalid JSON", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBufferString("{invalid}"))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestRefresh(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	userID, err := testutil.CreateUser(tx, "refresh@example.com", "refreshuser", "password123", "Refresh User", "jobseeker")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	refreshID := uuid.New()
	refreshTokenStr := testutil.GenerateRefreshToken(userID.String(), "jobseeker", refreshID.String(), 7*24*time.Hour)
	testutil.InsertRefreshToken(tx, refreshID, userID, refreshTokenStr, time.Now().Add(7*24*time.Hour))

	router := gin.New()
	h := NewAuthHandler(tx, testutil.TestJWTSecret)
	rl := middleware.NewRateLimiter(100, 200)
	router.POST("/api/v1/auth/refresh", rl.Middleware(), h.Refresh)

	t.Run("refresh success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/refresh", nil)
		req.AddCookie(&http.Cookie{Name: "refreshToken", Value: refreshTokenStr, Path: "/api/v1/auth"})
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp map[string]string
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp["accessToken"] == "" {
			t.Fatal("expected new access token")
		}
	})

	t.Run("refresh no cookie", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/refresh", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("refresh unknown token", func(t *testing.T) {
		badToken := testutil.GenerateRefreshToken(uuid.New().String(), "jobseeker", uuid.New().String(), 7*24*time.Hour)
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/refresh", nil)
		req.AddCookie(&http.Cookie{Name: "refreshToken", Value: badToken, Path: "/api/v1/auth"})
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestLogout(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	userID, err := testutil.CreateUser(tx, "logout@example.com", "logoutuser", "password123", "Logout User", "jobseeker")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	token := testutil.GenerateToken(userID.String(), "jobseeker", 15*time.Minute)

	router := gin.New()
	h := NewAuthHandler(tx, testutil.TestJWTSecret)
	router.POST("/api/v1/auth/logout", middleware.AuthRequired(testutil.TestJWTSecret), h.Logout)

	t.Run("logout success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/logout", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("logout without auth", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/auth/logout", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})
}
```

- [ ] **Step 2: Run auth tests**

Run: `go test -v ./server-go/internal/handlers/ -run 'TestRegister|TestLogin|TestRefresh|TestLogout' -count=1 -timeout 30s`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/auth_test.go
git commit -m "test: add auth endpoint tests (register, login, refresh, logout)"
```

---

### Task 8: Public Passport Profile Tests

**Files:**
- Create: `server-go/internal/handlers/passport_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/passport_test.go`**

```go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/testutil"
)

func TestGetPublicProfile(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	_, profileID, err := testutil.CreateJobseeker(tx, "public@example.com", "publicuser", "password123", "Public User")
	if err != nil {
		t.Fatalf("create jobseeker: %v", err)
	}
	testutil.CreateExperience(tx, profileID, "employment", "Software Engineer", "Tech Corp")

	router := gin.New()
	h := NewPassportHandler(tx)
	router.GET("/api/v1/profiles/:username", h.GetProfile)

	t.Run("get profile by slug", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/profiles/publicuser", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp PublicProfileResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.Name != "Public User" {
			t.Fatalf("expected 'Public User', got '%s'", resp.Name)
		}
		if len(resp.Experiences) != 1 {
			t.Fatalf("expected 1 experience, got %d", len(resp.Experiences))
		}
	})

	t.Run("get profile not found", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/profiles/nonexistent", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})
}
```

- [ ] **Step 2: Run passport tests**

Run: `go test -v ./server-go/internal/handlers/ -run TestGetPublicProfile -count=1`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/passport_test.go
git commit -m "test: add passport (public profile) endpoint tests"

---

### Task 9: Private Profile + Experience CRUD Tests

**Files:**
- Create: `server-go/internal/handlers/profiles_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/profiles_test.go`**

```go
package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestGetMyProfile(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	userID, profileID, err := testutil.CreateJobseeker(tx, "myprofile@example.com", "myprofile", "password123", "My Profile")
	if err != nil {
		t.Fatalf("create jobseeker: %v", err)
	}
	testutil.CreateExperience(tx, profileID, "employment", "Engineer", "Acme")
	token := testutil.GenerateToken(userID.String(), "jobseeker", 15*time.Minute)

	router := gin.New()
	h := NewProfileHandler(tx)
	g := router.Group("/api/v1/profiles")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret))
	g.GET("/me", h.GetMyProfile)

	t.Run("success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/profiles/me", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp ProfileResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.Username != "myprofile" {
			t.Fatalf("expected 'myprofile', got '%s'", resp.Username)
		}
		if len(resp.Experiences) != 1 {
			t.Fatalf("expected 1 experience, got %d", len(resp.Experiences))
		}
	})

	t.Run("unauthorized", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/profiles/me", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})

	t.Run("company user no profile", func(t *testing.T) {
		cu, _, _ := testutil.CreateCompanyUser(tx, "comp@ex.com", "comp", "pass123", "Co", true)
		ct := testutil.GenerateToken(cu.String(), "company", 15*time.Minute)
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/profiles/me", nil)
		req.Header.Set("Authorization", "Bearer "+ct)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestUpdateMyProfile(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	userID, _, _ := testutil.CreateJobseeker(tx, "up@ex.com", "upuser", "pass123", "Up User")
	token := testutil.GenerateToken(userID.String(), "jobseeker", 15*time.Minute)

	router := gin.New()
	h := NewProfileHandler(tx)
	g := router.Group("/api/v1/profiles")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret))
	g.PUT("/me", h.UpdateMyProfile)

	t.Run("update headline", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/profiles/me", bytes.NewBufferString(`{"headline":"Engineer","about":"I code"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("update slug reserved", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/profiles/me", bytes.NewBufferString(`{"slug":"admin"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("no fields", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/profiles/me", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestCreateExperience(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	userID, _, _ := testutil.CreateJobseeker(tx, "ce@ex.com", "ceuser", "pass123", "CE User")
	token := testutil.GenerateToken(userID.String(), "jobseeker", 15*time.Minute)

	router := gin.New()
	h := NewProfileHandler(tx)
	g := router.Group("/api/v1/profiles")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret))
	g.POST("/me/experience", h.CreateExperience)

	t.Run("success", func(t *testing.T) {
		body := `{"type":"employment","title":"Engineer","organization":"Co","startDate":"2020-01"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/profiles/me/experience", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("missing fields", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/profiles/me/experience", bytes.NewBufferString(`{"type":"employment"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("invalid date", func(t *testing.T) {
		body := `{"type":"employment","title":"E","organization":"C","startDate":"2020-13"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/profiles/me/experience", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestUpdateExperience(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	userID, profileID, _ := testutil.CreateJobseeker(tx, "ue@ex.com", "ueuser", "pass123", "UE User")
	expID, _ := testutil.CreateExperience(tx, profileID, "employment", "Junior", "Small Co")
	token := testutil.GenerateToken(userID.String(), "jobseeker", 15*time.Minute)

	router := gin.New()
	h := NewProfileHandler(tx)
	g := router.Group("/api/v1/profiles")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret))
	g.PUT("/me/experience/:id", h.UpdateExperience)

	t.Run("success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", fmt.Sprintf("/api/v1/profiles/me/experience/%s", expID.String()), bytes.NewBufferString(`{"title":"Senior"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("not found", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/profiles/me/experience/00000000-0000-0000-0000-000000000000", bytes.NewBufferString(`{"title":"X"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("invalid id", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/profiles/me/experience/bad", bytes.NewBufferString(`{"title":"X"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestDeleteExperience(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	userID, profileID, _ := testutil.CreateJobseeker(tx, "de@ex.com", "deuser", "pass123", "DE User")
	expID, _ := testutil.CreateExperience(tx, profileID, "employment", "Temp", "Temp Co")
	token := testutil.GenerateToken(userID.String(), "jobseeker", 15*time.Minute)

	router := gin.New()
	h := NewProfileHandler(tx)
	g := router.Group("/api/v1/profiles")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret))
	g.DELETE("/me/experience/:id", h.DeleteExperience)

	t.Run("success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/v1/profiles/me/experience/%s", expID.String()), nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("not found", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("DELETE", "/api/v1/profiles/me/experience/00000000-0000-0000-0000-000000000000", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})
}
```

- [ ] **Step 2: Run profile tests**

Run: `go test -v ./server-go/internal/handlers/ -run 'TestGetMyProfile|TestUpdateMyProfile|TestCreateExperience|TestUpdateExperience|TestDeleteExperience' -count=1 -timeout 30s`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/profiles_test.go
git commit -m "test: add profile CRUD + experience endpoint tests"
```

---

### Task 10: Company Endpoint Tests

**Files:**
- Create: `server-go/internal/handlers/companies_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/companies_test.go`**

```go
package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestGetCompanyProfile(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, _, _ := testutil.CreateCompanyUser(tx, "comp@ex.com", "comp", "pass123", "Test Corp", true)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewCompanyHandler(tx)
	g := router.Group("/api/v1/company")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"))
	g.GET("/profile", h.GetProfile)

	t.Run("success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/company/profile", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp CompanyResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.CompanyName != "Test Corp" {
			t.Fatalf("expected 'Test Corp', got '%s'", resp.CompanyName)
		}
	})

	t.Run("no auth", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/company/profile", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})

	t.Run("wrong role", func(t *testing.T) {
		wt := testutil.GenerateToken(uID.String(), "jobseeker", 15*time.Minute)
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/company/profile", nil)
		req.Header.Set("Authorization", "Bearer "+wt)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", w.Code)
		}
	})
}

func TestUpdateCompanyProfile(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, _, _ := testutil.CreateCompanyUser(tx, "uc@ex.com", "uc", "pass123", "Old Name", true)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewCompanyHandler(tx)
	g := router.Group("/api/v1/company")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"))
	g.PUT("/profile", h.UpdateProfile)

	t.Run("update name", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/company/profile", bytes.NewBufferString(`{"companyName":"New Name Inc"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp CompanyResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.CompanyName != "New Name Inc" {
			t.Fatalf("expected 'New Name Inc', got '%s'", resp.CompanyName)
		}
	})

	t.Run("no fields", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/company/profile", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestSubmitVerification(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, _, _ := testutil.CreateCompanyUser(tx, "sv@ex.com", "sv", "pass123", "SV Corp", false)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewCompanyHandler(tx)
	g := router.Group("/api/v1/company")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"))
	g.POST("/verification", h.SubmitVerification)

	t.Run("success", func(t *testing.T) {
		body := `{"businessRegistration":"BR-123","website":"https://ex.com","address":"123 St","contact":"c@ex.com"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/company/verification", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("missing fields", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/company/verification", bytes.NewBufferString(`{"website":"https://ex.com"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestGetVerificationStatus(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	pu, _, _ := testutil.CreateCompanyUser(tx, "p@ex.com", "p", "pass123", "P Inc", false)
	vu, _, _ := testutil.CreateCompanyUser(tx, "v@ex.com", "v", "pass123", "V Inc", true)
	pt := testutil.GenerateToken(pu.String(), "company", 15*time.Minute)
	vt := testutil.GenerateToken(vu.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewCompanyHandler(tx)
	g := router.Group("/api/v1/company")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"))
	g.GET("/verification-status", h.GetVerificationStatus)

	t.Run("pending", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/company/verification-status", nil)
		req.Header.Set("Authorization", "Bearer "+pt)
		router.ServeHTTP(w, req)
		var m map[string]string
		json.Unmarshal(w.Body.Bytes(), &m)
		if m["verificationStatus"] != "pending" {
			t.Fatalf("expected 'pending', got '%s'", m["verificationStatus"])
		}
	})

	t.Run("verified", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/company/verification-status", nil)
		req.Header.Set("Authorization", "Bearer "+vt)
		router.ServeHTTP(w, req)
		var m map[string]string
		json.Unmarshal(w.Body.Bytes(), &m)
		if m["verificationStatus"] != "verified" {
			t.Fatalf("expected 'verified', got '%s'", m["verificationStatus"])
		}
	})
}
```

- [ ] **Step 2: Run company tests**

Run: `go test -v ./server-go/internal/handlers/ -run 'TestGetCompany|TestUpdateCompany|TestSubmitVerification|TestGetVerification' -count=1 -timeout 30s`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/companies_test.go
git commit -m "test: add company endpoint tests"

---

### Task 11: Job Endpoint Tests (Public + Company CRUD)

**Files:**
- Create: `server-go/internal/handlers/jobs_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/jobs_test.go`**

```go
package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestListJobs(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	_, cID, _ := testutil.CreateCompanyUser(tx, "jc@ex.com", "jc", "pass123", "Job Co", true)
	testutil.CreateJob(tx, cID, "Software Engineer", "Technology", true)
	testutil.CreateJob(tx, cID, "Doctor", "Healthcare", false)

	router := gin.New()
	h := NewJobHandler(tx)
	router.GET("/api/v1/jobs", h.ListJobs)

	t.Run("list only open", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp []JobResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 1 {
			t.Fatalf("expected 1 open job, got %d", len(resp))
		}
	})

	t.Run("filter by industry", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs?industry=Technology", nil)
		router.ServeHTTP(w, req)
		var resp []JobResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 1 {
			t.Fatalf("expected 1, got %d", len(resp))
		}
	})

	t.Run("no match", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs?industry=NoExist", nil)
		router.ServeHTTP(w, req)
		var resp []JobResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 0 {
			t.Fatalf("expected 0, got %d", len(resp))
		}
	})
}

func TestGetJob(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	_, cID, _ := testutil.CreateCompanyUser(tx, "gj@ex.com", "gj", "pass123", "GJ Co", true)
	jID, _ := testutil.CreateJob(tx, cID, "Backend Engineer", "Technology", true)

	router := gin.New()
	h := NewJobHandler(tx)
	router.GET("/api/v1/jobs/:id", h.GetJob)

	t.Run("by id", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/jobs/%s", jID.String()), nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("invalid id", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs/invalid", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", w.Code)
		}
	})

	t.Run("not found", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs/00000000-0000-0000-0000-000000000000", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestListMyJobs(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, cID, _ := testutil.CreateCompanyUser(tx, "mj@ex.com", "mj", "pass123", "MJ Co", true)
	testutil.CreateJob(tx, cID, "Job 1", "Tech", true)
	testutil.CreateJob(tx, cID, "Job 2", "Tech", false)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewJobHandler(tx)
	g := router.Group("/api/v1/jobs")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(tx))
	g.GET("/me", h.ListMyJobs)

	t.Run("all statuses", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs/me", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp []JobResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 2 {
			t.Fatalf("expected 2 jobs, got %d", len(resp))
		}
	})
}

func TestCreateJob(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, _, _ := testutil.CreateCompanyUser(tx, "cj@ex.com", "cj", "pass123", "CJ Co", true)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewJobHandler(tx)
	g := router.Group("/api/v1/jobs")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(tx))
	g.POST("", h.CreateJob)

	t.Run("success", func(t *testing.T) {
		body := `{"title":"New Job","description":"Great","industry":"Technology"}`
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/jobs", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("missing fields", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/jobs", bytes.NewBufferString(`{"title":"Only Title"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("no auth", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/jobs", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})
}

func TestUpdateJob(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, cID, _ := testutil.CreateCompanyUser(tx, "uj@ex.com", "uj", "pass123", "UJ Co", true)
	jID, _ := testutil.CreateJob(tx, cID, "Original", "Tech", true)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewJobHandler(tx)
	g := router.Group("/api/v1/jobs")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(tx))
	g.PUT("/:id", h.UpdateJob)

	t.Run("update title", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", fmt.Sprintf("/api/v1/jobs/%s", jID.String()), bytes.NewBufferString(`{"title":"Updated"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("not found", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/jobs/00000000-0000-0000-0000-000000000000", bytes.NewBufferString(`{"title":"X"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("invalid id", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("PUT", "/api/v1/jobs/invalid", bytes.NewBufferString(`{"title":"X"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}

func TestDeleteJob(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, cID, _ := testutil.CreateCompanyUser(tx, "dj@ex.com", "dj", "pass123", "DJ Co", true)
	jID, _ := testutil.CreateJob(tx, cID, "To Delete", "Tech", true)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	router := gin.New()
	h := NewJobHandler(tx)
	g := router.Group("/api/v1/jobs")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(tx))
	g.DELETE("/:id", h.DeleteJob)

	t.Run("success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/v1/jobs/%s", jID.String()), nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("not found", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("DELETE", "/api/v1/jobs/00000000-0000-0000-0000-000000000000", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("invalid id", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("DELETE", "/api/v1/jobs/invalid", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})
}
```

- [ ] **Step 2: Run job tests**

Run: `go test -v ./server-go/internal/handlers/ -run 'TestListJobs|TestGetJob|TestListMyJobs|TestCreateJob|TestUpdateJob|TestDeleteJob' -count=1 -timeout 30s`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/jobs_test.go
git commit -m "test: add job endpoint tests (public + company CRUD)"
```

---

### Task 12: Search Candidates Tests

**Files:**
- Create: `server-go/internal/handlers/search_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/search_test.go`**

```go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestSearchCandidates(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, _, _ := testutil.CreateCompanyUser(tx, "sc@ex.com", "sc", "pass123", "Search Co", true)
	tok := testutil.GenerateToken(uID.String(), "company", 15*time.Minute)

	_, p1, _ := testutil.CreateJobseeker(tx, "c1@ex.com", "c1", "pass123", "Candidate One")
	_, p2, _ := testutil.CreateJobseeker(tx, "c2@ex.com", "c2", "pass123", "Candidate Two")

	tx.Exec(`INSERT INTO job_experiences (id, profile_id, type, title, organization, start_date, is_current, skills_used) VALUES ($1,$2,'employment','Go Dev','Tech Co','2020-01',true,$3)`,
		"11111111-1111-1111-1111-111111111111", p1.String(), `{Go,PostgreSQL}`)
	tx.Exec(`INSERT INTO job_experiences (id, profile_id, type, title, organization, start_date, is_current, skills_used) VALUES ($1,$2,'employment','React Dev','Web Co','2019-06',true,$3)`,
		"22222222-2222-2222-2222-222222222222", p2.String(), `{React,TypeScript}`)
	tx.Exec("UPDATE jobseeker_profiles SET headline = 'Senior Go Developer' WHERE id = $1", p1.String())

	router := gin.New()
	h := NewSearchHandler(tx)
	g := router.Group("/api/v1/search")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(tx))
	g.GET("/candidates", h.SearchCandidates)

	t.Run("by text", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/search/candidates?q=candidate", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp []CandidateResult
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 2 {
			t.Fatalf("expected 2, got %d", len(resp))
		}
	})

	t.Run("by skills", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/search/candidates?skills=Go", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		var resp []CandidateResult
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 1 {
			t.Fatalf("expected 1 with Go, got %d", len(resp))
		}
	})

	t.Run("no results", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/search/candidates?q=nonexistent", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		var resp []CandidateResult
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 0 {
			t.Fatalf("expected 0, got %d", len(resp))
		}
	})

	t.Run("no auth", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/search/candidates?q=test", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})
}
```

- [ ] **Step 2: Run search tests**

Run: `go test -v ./server-go/internal/handlers/ -run TestSearchCandidates -count=1 -timeout 30s`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/search_test.go
git commit -m "test: add search candidates endpoint tests"
```

---

### Task 13: Admin Endpoint Tests

**Files:**
- Create: `server-go/internal/handlers/admin_test.go`

- [ ] **Step 1: Write `server-go/internal/handlers/admin_test.go`**

```go
package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestListPendingVerifications(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	aID, _ := testutil.CreateAdmin(tx, "admin@ex.com", "admin", "adminpass123")
	aTok := testutil.GenerateToken(aID.String(), "admin", 15*time.Minute)

	testutil.CreateCompanyUser(tx, "p1@ex.com", "p1", "pass123", "P1 Co", false)
	testutil.CreateCompanyUser(tx, "p2@ex.com", "p2", "pass123", "P2 Co", false)
	testutil.CreateCompanyUser(tx, "vco@ex.com", "vco", "pass123", "V Co", true)

	router := gin.New()
	h := NewAdminHandler(tx)
	g := router.Group("/api/v1/admin")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("admin"))
	g.GET("/verifications/pending", h.ListPendingVerifications)

	t.Run("list pending", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/admin/verifications/pending", nil)
		req.Header.Set("Authorization", "Bearer "+aTok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp []PendingCompany
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 2 {
			t.Fatalf("expected 2 pending, got %d", len(resp))
		}
	})

	t.Run("wrong role", func(t *testing.T) {
		wt := testutil.GenerateToken(aID.String(), "jobseeker", 15*time.Minute)
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/admin/verifications/pending", nil)
		req.Header.Set("Authorization", "Bearer "+wt)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", w.Code)
		}
	})
}

func TestHandleVerification(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	aID, _ := testutil.CreateAdmin(tx, "a2@ex.com", "a2", "adminpass123")
	aTok := testutil.GenerateToken(aID.String(), "admin", 15*time.Minute)
	_, cID, _ := testutil.CreateCompanyUser(tx, "ap@ex.com", "ap", "pass123", "Approve Co", false)

	router := gin.New()
	h := NewAdminHandler(tx)
	g := router.Group("/api/v1/admin")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("admin"))
	g.POST("/verifications/:id", h.HandleVerification)

	t.Run("approve", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/admin/verifications/%s", cID.String()), bytes.NewBufferString(`{"action":"approve"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+aTok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp PendingCompany
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.VerificationStatus != "verified" {
			t.Fatalf("expected 'verified', got '%s'", resp.VerificationStatus)
		}
	})

	t.Run("reject", func(t *testing.T) {
		_, c2, _ := testutil.CreateCompanyUser(tx, "rj@ex.com", "rj", "pass123", "Reject Co", false)
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/admin/verifications/%s", c2.String()), bytes.NewBufferString(`{"action":"reject","reason":"Bad docs"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+aTok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp PendingCompany
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.VerificationStatus != "rejected" {
			t.Fatalf("expected 'rejected', got '%s'", resp.VerificationStatus)
		}
	})

	t.Run("invalid action", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/admin/verifications/%s", cID.String()), bytes.NewBufferString(`{"action":"invalid"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+aTok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("not found", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/admin/verifications/00000000-0000-0000-0000-000000000000", bytes.NewBufferString(`{"action":"approve"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+aTok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})
}
```

- [ ] **Step 2: Run admin tests**

Run: `go test -v ./server-go/internal/handlers/ -run 'TestListPending|TestHandleVerification' -count=1 -timeout 30s`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/handlers/admin_test.go
git commit -m "test: add admin endpoint tests"

---

### Task 14: Evaluation Handler Tests

**Files:**
- Create: `server-go/internal/evaluation/handler_test.go`

- [ ] **Step 1: Write `server-go/internal/evaluation/handler_test.go`**

```go
package evaluation

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/lib"
	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestPostEvaluate(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	uID, pID, err := testutil.CreateJobseeker(tx, "eval@ex.com", "eval", "pass123", "Eval User")
	if err != nil {
		t.Fatalf("create jobseeker: %v", err)
	}
	tok := testutil.GenerateToken(uID.String(), "jobseeker", 15*time.Minute)

	mockLLM := lib.NewMockLLMClient()
	svc := NewService(tx, mockLLM)
	h := NewHandler(tx, svc)

	router := gin.New()
	g := router.Group("/api/v1/evaluate")
	g.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("jobseeker"))
	g.POST("/me", h.PostEvaluate)
	g.GET("/me/results", h.GetLatestEvaluation)

	t.Run("post evaluate", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/evaluate/me", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp EvaluationResponse
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.OverallScore != 75 {
			t.Fatalf("expected 75, got %d", resp.OverallScore)
		}
	})

	t.Run("get latest after post", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/evaluate/me/results", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("get latest no eval", func(t *testing.T) {
		u2, _, _ := testutil.CreateJobseeker(tx, "eval2@ex.com", "eval2", "pass123", "Eval2")
		t2 := testutil.GenerateToken(u2.String(), "jobseeker", 15*time.Minute)
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/evaluate/me/results", nil)
		req.Header.Set("Authorization", "Bearer "+t2)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("wrong role", func(t *testing.T) {
		cu, _, _ := testutil.CreateCompanyUser(tx, "eco@ex.com", "eco", "pass123", "E Co", true)
		ct := testutil.GenerateToken(cu.String(), "company", 15*time.Minute)
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/evaluate/me", nil)
		req.Header.Set("Authorization", "Bearer "+ct)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", w.Code)
		}
	})

	t.Run("no auth", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/evaluate/me", nil)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})
}
```

- [ ] **Step 2: Run evaluation tests**

Run: `go test -v ./server-go/internal/evaluation/ -run TestPostEvaluate -count=1 -timeout 30s`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/evaluation/handler_test.go
git commit -m "test: add AI evaluation endpoint tests"
```

---

### Task 15: Application Handler Tests

**Files:**
- Create: `server-go/internal/application/handler_test.go`

- [ ] **Step 1: Write `server-go/internal/application/handler_test.go`**

```go
package application

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestApplicationFlow(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	// Create company with two jobs (one open, one closed)
	cu, cID, _ := testutil.CreateCompanyUser(tx, "aco@ex.com", "aco", "pass123", "App Co", true)
	jID, _ := testutil.CreateJob(tx, cID, "Software Engineer", "Technology", true)
	cjID, _ := testutil.CreateJob(tx, cID, "Closed Position", "Technology", false)

	// Create jobseeker
	uID, pID, _ := testutil.CreateJobseeker(tx, "app@ex.com", "app", "pass123", "Applicant")
	tok := testutil.GenerateToken(uID.String(), "jobseeker", 15*time.Minute)
	ctok := testutil.GenerateToken(cu.String(), "company", 15*time.Minute)

	svc := NewService(tx)
	h := NewHandler(svc)

	router := gin.New()

	// Jobseeker routes
	ag := router.Group("/api/v1/jobs")
	ag.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("jobseeker"))
	ag.POST("/:id/apply", h.Apply)

	lg := router.Group("/api/v1/applications")
	lg.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("jobseeker"))
	lg.GET("/me", h.ListMyApplications)

	// Company routes
	sg := router.Group("/api/v1/applications")
	sg.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(tx))
	sg.PUT("/:id/status", h.UpdateStatus)

	t.Run("apply success", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/jobs/%s/apply", jID.String()), nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("apply duplicate", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/jobs/%s/apply", jID.String()), nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusConflict {
			t.Fatalf("expected 409, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("apply closed job", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/jobs/%s/apply", cjID.String()), nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("apply nonexistent job", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/api/v1/jobs/00000000-0000-0000-0000-000000000000/apply", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("list my apps", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/applications/me", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp []ApplicationResult
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp) != 1 {
			t.Fatalf("expected 1, got %d", len(resp))
		}
	})

	t.Run("update status", func(t *testing.T) {
		// Get app ID from listing
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/applications/me", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		var apps []ApplicationResult
		json.Unmarshal(w.Body.Bytes(), &apps)
		if len(apps) == 0 {
			t.Fatal("no apps")
		}
		appID := apps[0].ID

		w2 := httptest.NewRecorder()
		req2 := httptest.NewRequest("PUT", fmt.Sprintf("/api/v1/applications/%s/status", appID), bytes.NewBufferString(`{"status":"reviewed"}`))
		req2.Header.Set("Content-Type", "application/json")
		req2.Header.Set("Authorization", "Bearer "+ctok)
		router.ServeHTTP(w2, req2)
		if w2.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w2.Code, w2.Body.String())
		}
	})
}
```

- [ ] **Step 2: Run application tests**

Run: `go test -v ./server-go/internal/application/ -run TestApplicationFlow -count=1 -timeout 30s`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/application/handler_test.go
git commit -m "test: add application endpoint tests (apply, list, status update)"

---

### Task 16: Matching Handler Tests

**Files:**
- Create: `server-go/internal/matching/handler_test.go`

- [ ] **Step 1: Write `server-go/internal/matching/handler_test.go`**

```go
package matching

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"skillpass-server-go/internal/middleware"
	"skillpass-server-go/internal/testutil"
)

func TestMatching(t *testing.T) {
	db := testutil.SetupTestDB()
	tx, cleanup := testutil.NewTestTx(t, db)
	defer cleanup()

	// Company with job requiring skills
	cu, cID, _ := testutil.CreateCompanyUser(tx, "mco@ex.com", "mco", "pass123", "Match Co", true)
	jID := "33333333-3333-3333-3333-333333333333"
	tx.Exec(`INSERT INTO job_postings (id, company_id, title, description, industry, required_skills, status) VALUES ($1,$2,'Go Dev','Build Go services','Technology',$3,'open')`,
		jID, cID.String(), `{Go,PostgreSQL,Docker}`)

	// Jobseeker with evaluation
	uID, pID, _ := testutil.CreateJobseeker(tx, "mee@ex.com", "mee", "pass123", "Matchee")
	testutil.CreateAIEvaluation(tx, pID, 90)

	// Another company user for candidate matching
	cu2, _, _ := testutil.CreateCompanyUser(tx, "mco2@ex.com", "mco2", "pass123", "Match Co 2", true)

	tok := testutil.GenerateToken(uID.String(), "jobseeker", 15*time.Minute)
	ctok := testutil.GenerateToken(cu2.String(), "company", 15*time.Minute)

	svc := NewService(tx)
	h := NewHandler(svc)

	router := gin.New()

	// Jobseeker: match jobs
	jsg := router.Group("/api/v1/jobs")
	jsg.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("jobseeker"))
	jsg.GET("/matches", h.MatchJobs)

	// Company: match candidates
	cog := router.Group("/api/v1/candidates")
	cog.Use(middleware.AuthRequired(testutil.TestJWTSecret), middleware.RequireRole("company"), middleware.RequireVerifiedCompany(tx))
	cog.GET("/matches", h.MatchCandidates)

	t.Run("match jobs for jobseeker", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs/matches", nil)
		req.Header.Set("Authorization", "Bearer "+tok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp []JobMatch
		json.Unmarshal(w.Body.Bytes(), &resp)
		t.Logf("got %d job matches", len(resp))
		// May be empty depending on skill matching threshold — just verify no error
	})

	t.Run("match candidates for company", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/candidates/matches?jobId="+jID, nil)
		req.Header.Set("Authorization", "Bearer "+ctok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}
		var resp []CandidateMatch
		json.Unmarshal(w.Body.Bytes(), &resp)
		t.Logf("got %d candidate matches", len(resp))
	})

	t.Run("match candidates missing jobId", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/candidates/matches", nil)
		req.Header.Set("Authorization", "Bearer "+ctok)
		router.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("match jobs wrong role", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/api/v1/jobs/matches", nil)
		req.Header.Set("Authorization", "Bearer "+ctok) // company token
		router.ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", w.Code)
		}
	})
}
```

- [ ] **Step 2: Run matching tests**

Run: `go test -v ./server-go/internal/matching/ -run TestMatching -count=1 -timeout 30s`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/matching/handler_test.go
git commit -m "test: add matching endpoint tests (job + candidate matching)"
```

---

### Final Verification

Run all tests together to confirm everything passes:

- [ ] **Step 1: Run all server tests**

Run: `go test -v ./server-go/... -count=1 -timeout 120s`
Expected: All tests PASS

- [ ] **Step 2: Run lint check**

Run: `bun run lint 2>&1 || true` (Biome for JS, but also check Go vet)
Run: `go vet ./server-go/...`
Expected: No errors

- [ ] **Step 3: Create final commit with all test files**

```bash
git add server-go/internal/lib/password_test.go \
       server-go/internal/middleware/auth_test.go \
       server-go/internal/middleware/ratelimit_test.go \
       server-go/internal/handlers/health_test.go \
       server-go/internal/handlers/reference_test.go \
       server-go/internal/handlers/auth_test.go \
       server-go/internal/handlers/passport_test.go \
       server-go/internal/handlers/profiles_test.go \
       server-go/internal/handlers/companies_test.go \
       server-go/internal/handlers/jobs_test.go \
       server-go/internal/handlers/search_test.go \
       server-go/internal/handlers/admin_test.go \
       server-go/internal/evaluation/handler_test.go \
       server-go/internal/application/handler_test.go \
       server-go/internal/matching/handler_test.go
git commit -m "test: complete server test suite covering all 33 endpoints"
```

### Summary of Test Coverage

| Test File | Endpoints Covered | Test Cases |
|-----------|------------------|------------|
| `lib/password_test.go` | — | 6 (hash, verify, uniqueness, bcrypt cost, argon2id) |
| `middleware/auth_test.go` | — | 6 (no auth, invalid token, wrong role, etc.) |
| `middleware/ratelimit_test.go` | — | 4 (allow, middleware, different IPs, clientIP) |
| `handlers/health_test.go` | 1 | 2 (success, method not allowed) |
| `handlers/reference_test.go` | 2 | 4 (industries, industries empty, tags, tags filtered) |
| `handlers/auth_test.go` | 4 | 12 (register, login success/error, refresh, logout) |
| `handlers/passport_test.go` | 1 | 2 (success, not found) |
| `handlers/profiles_test.go` | 5 | 12 (get/update profile, CRUD experience) |
| `handlers/companies_test.go` | 4 | 9 (get/update company, submit verification, status) |
| `handlers/jobs_test.go` | 6 | 14 (list, get, list my, create, update, delete) |
| `handlers/search_test.go` | 1 | 4 (text search, skill search, no results, no auth) |
| `handlers/admin_test.go` | 2 | 6 (list pending, approve, reject, invalid action, not found) |
| `evaluation/handler_test.go` | 2 | 5 (post, get latest, no eval, wrong role, no auth) |
| `application/handler_test.go` | 3 | 6 (apply, duplicate, closed, list, status update) |
| `matching/handler_test.go` | 2 | 4 (job match, candidate match, missing param, wrong role) |
| **Total** | **33** | **~96 test cases** |
```
```
```
```
```
```
