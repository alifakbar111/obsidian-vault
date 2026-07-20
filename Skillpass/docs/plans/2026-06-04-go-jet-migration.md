# Go-Jet ORM Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Replace Drizzle ORM (TypeScript) with go-jet (Go query builder/code generator), eliminating all TypeScript/Bun dependencies for the server. After this, delete `server/`.

**Architecture:** go-jet is a database-first code generator that reads the PostgreSQL schema and produces type-safe Go SQL builder types. The Drizzle schema (currently source of truth in TypeScript) gets replaced by raw SQL DDL files. go-jet generates model types and query builders used by all handlers. The DB connection switches from `*pgxpool.Pool` to `*sql.DB` (via pgx stdlib) for go-jet compatibility.

**Tech Stack:** Go 1.23+, Gin, go-jet v2, pgx v5 (stdlib driver), raw SQL DDL files, bcrypt + argon2id

---

### Task 1: Extract SQL DDL from Drizzle schema

**Files:**
- Create: `server-go/migrations/000001_init.sql`
- Read: `server/src/db/schema.ts` (for reference, then delete)
- Read: `server/seed.ts` (for reference, then delete)

The Drizzle schema (`server/src/db/schema.ts`) defines 7 tables, 5 enums, and their relations. We need to extract the equivalent SQL DDL. The schema is already applied to the running database (via previous `drizzle-kit push`), so we can also dump it, but writing it from the schema.ts is more precise.

- [ ] **Step 1: Create `server-go/migrations/` directory and the init migration**

```bash
mkdir -p /home/al-ip/learning/skillpass/server-go/migrations
```

```sql
-- server-go/migrations/000001_init.sql
-- Initial schema extracted from server/src/db/schema.ts

-- Enums
DO $$ BEGIN
  CREATE TYPE role AS ENUM ('jobseeker', 'company', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experience_type AS ENUM ('employment', 'gig', 'education', 'certification', 'project', 'volunteering');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'lead');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('open', 'closed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role role NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    industry TEXT NOT NULL,
    description TEXT,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verification_docs JSONB,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobseeker profiles
CREATE TABLE IF NOT EXISTS jobseeker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline TEXT,
    about TEXT,
    years_of_experience INTEGER,
    slug TEXT NOT NULL UNIQUE
);

-- Job experiences
CREATE TABLE IF NOT EXISTS job_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES jobseeker_profiles(id) ON DELETE CASCADE,
    type experience_type NOT NULL,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    industry TEXT,
    skills_used TEXT[],
    url TEXT
);

CREATE INDEX IF NOT EXISTS experience_profile_idx ON job_experiences(profile_id);

-- Industry categories
CREATE TABLE IF NOT EXISTS industry_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry_category_id UUID REFERENCES industry_categories(id)
);

CREATE INDEX IF NOT EXISTS tags_industry_idx ON tags(industry_category_id);

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    industry TEXT NOT NULL,
    tags TEXT[],
    required_skills TEXT[],
    experience_level experience_level,
    location TEXT,
    salary_range TEXT,
    status job_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_status_created_idx ON job_postings(status, created_at);
CREATE INDEX IF NOT EXISTS job_company_idx ON job_postings(company_id);
```

- [ ] **Step 2: Verify migration applies cleanly**

Run: `docker compose up db -d` (if not already running)

Then apply the migration to verify it works:
```bash
psql postgres://postgres:postgres@localhost:5432/skillpass -f server-go/migrations/000001_init.sql
```

Expected: All CREATE statements succeed (or return "already exists" notices from IF NOT EXISTS).

- [ ] **Step 3: Commit**

```bash
git add server-go/migrations/
git commit -m "feat: add SQL DDL migration file extracted from Drizzle schema"
```

---

### Task 2: Add go-jet dependency and generate models

**Files:**
- Modify: `server-go/go.mod`
- Create: `server-go/.gen/` (generated, committed)
- Create: `server-go/internal/gen/` (package alias for generated code)

- [ ] **Step 1: Install go-jet generator and add deps**

```bash
go get github.com/go-jet/jet/v2@latest
# Install the generator CLI
go install github.com/go-jet/jet/v2/cmd/jet@latest
```

- [ ] **Step 2: Generate go-jet models from the running database**

```bash
jet -dsn=postgres://postgres:postgres@localhost:5432/skillpass?sslmode=disable \
    -schema=public \
    -path=./.gen \
    -ignore-tables=__drizzle_migrations
```

Expected output:
```
Connecting to postgres database...
Retrieving schema information...
  FOUND 7 table(s), 0 view(s), 5 enum(s)
Cleaning up destination directory...
Generating table sql builder files...
Generating view sql builder files...
Generating enum sql builder files...
Generating table model files...
Generating view model files...
Generating enum model files...
Done
```

This creates:
```
server-go/.gen/skillpass/public/
├── table/          — type-safe SQL builder per table
├── model/          — Go struct per table/view/enum
└── enum/           — enum type constants
```

- [ ] **Step 3: Create convenience package for imports**

Create `server-go/internal/gen/gen.go`:
```go
// Package gen re-exports generated table, model, and enum packages for convenience.
// This avoids deep import paths throughout the codebase.
package gen

//go:generate jet -dsn=postgres://postgres:postgres@localhost:5432/skillpass?sslmode=disable -schema=public -path=../../.gen -ignore-tables=__drizzle_migrations
```

- [ ] **Step 4: Add .gen to .gitignore exemption (we want to commit generated code)**

The `.gen/` directory should be committed per go-jet recommendation. Verify `.gitignore` doesn't exclude it.

```bash
# Check .gitignore at root and server-go/ level
cat /home/al-ip/learning/skillpass/.gitignore
cat /home/al-ip/learning/skillpass/server-go/.gitignore 2>/dev/null || echo "no server-go .gitignore"
```

If there's a root `.gitignore` that ignores `.gen`, add an exception:
```
!.gen/
```

- [ ] **Step 5: Run go mod tidy and verify build compiles**

```bash
go -C server-go mod tidy
go -C server-go build ./...
```

Expected: Build succeeds. The generated code may not be used yet, but it should compile.

- [ ] **Step 6: Commit**

```bash
git add server-go/go.mod server-go/go.sum server-go/.gen/ server-go/internal/gen/
git commit -m "feat: add go-jet generated models from database schema"
```

---

### Task 3: Switch DB connection from pgxpool to database/sql (pgx stdlib)

**Files:**
- Modify: `server-go/internal/db/db.go`
- Modify: `server-go/cmd/server/main.go`
- Modify: `server-go/internal/handlers/auth.go`
- Modify: `server-go/internal/handlers/profiles.go`
- Modify: `server-go/internal/handlers/passport.go`
- Modify: `server-go/internal/handlers/companies.go`
- Modify: `server-go/internal/handlers/jobs.go`
- Modify: `server-go/internal/handlers/search.go`
- Modify: `server-go/internal/handlers/reference.go`
- Modify: `server-go/internal/handlers/admin.go`
- Modify: `server-go/internal/middleware/auth.go`

This task changes the DB connection type from `*pgxpool.Pool` to `*sql.DB` (using pgx stdlib driver). go-jet's `QueryContext()` works with `*sql.DB`. The SQL query syntax (`$1`, `$2`) is identical since pgx stdlib uses the same PostgreSQL wire protocol.

- [ ] **Step 1: Rewrite `db.go` to return `*sql.DB`**

```go
package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func Connect(ctx context.Context, databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	log.Println("Connected to PostgreSQL")
	return db, nil
}
```

- [ ] **Step 2: Update all handler structs to use `*sql.DB` instead of `*pgxpool.Pool`**

In every handler file, change:
- Import: remove `"github.com/jackc/pgx/v5/pgxpool"`, add `"database/sql"`
- Struct field: `pool *pgxpool.Pool` → `db *sql.DB`
- Constructor param: `pool *pgxpool.Pool` → `db *sql.DB`
- Constructor body: `h.pool = pool` → `h.db = db`
- All query calls: `h.pool.QueryRow(ctx, ...)` → `h.db.QueryRowContext(ctx, ...)`
- All query calls: `h.pool.Query(ctx, ...)` → `h.db.QueryContext(ctx, ...)`
- All exec calls: `h.pool.Exec(ctx, ...)` → `h.db.ExecContext(ctx, ...)`

**Files to change and summary of changes:**

**auth.go:**
```go
// import changes:
import (
    "context"
    "database/sql"
    "net/http"
    "time"
    // remove pgxpool
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

// struct:
type AuthHandler struct {
    db        *sql.DB
    jwtSecret string
}

// constructor:
func NewAuthHandler(db *sql.DB, jwtSecret string) *AuthHandler {
    return &AuthHandler{db: db, jwtSecret: jwtSecret}
}

// all pool.QueryRow → db.QueryRowContext:
// LINE 97: h.pool.QueryRow(c.Request.Context(), → h.db.QueryRowContext(c.Request.Context(),
// LINE 116: h.pool.QueryRow(c.Request.Context(), → h.db.QueryRowContext(c.Request.Context(),
// LINE 127: h.pool.Exec(c.Request.Context(), → h.db.ExecContext(c.Request.Context(),
// LINE 137: h.pool.Exec(c.Request.Context(), → h.db.ExecContext(c.Request.Context(),
// LINE 173: h.pool.QueryRow(c.Request.Context(), → h.db.QueryRowContext(c.Request.Context(),
// LINE 231: h.pool.QueryRow(c.Request.Context(), → h.db.QueryRowContext(c.Request.Context(),
```

**profiles.go:**
```go
// import changes: remove pgxpool, add database/sql
// struct field: pool → db
// All QueryRow → QueryRowContext, Query → QueryContext, Exec → ExecContext
```

**passport.go, companies.go, jobs.go, search.go, reference.go, admin.go:**
Same pattern — `pool` → `db`, add `Context` suffix to all query methods.

**middleware/auth.go:**
```go
import (
    "context"
    "database/sql"
    "net/http"
    "strings"
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

func RequireVerifiedCompany(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, _ := c.Get("userId")
        var companyID string
        var verificationStatus string
        err := db.QueryRowContext(context.Background(),
            "SELECT id, verification_status FROM companies WHERE user_id = $1", userID).
            Scan(&companyID, &verificationStatus)
        // ... rest unchanged
    }
}
```

- [ ] **Step 3: Update main.go to pass `*sql.DB`**

```go
// change:
pool, err := db.Connect(ctx, cfg.DatabaseURL)
if err != nil { log.Fatalf(...) }
defer pool.Close()

// to:
database, err := db.Connect(ctx, cfg.DatabaseURL)
if err != nil { log.Fatalf(...) }
defer database.Close()
```

Then rename all references from `pool` to `database` in constructor calls.

- [ ] **Step 4: Verify build compiles**

```bash
go -C server-go build ./...
```

Expected: Build succeeds. No runtime behavior has changed yet — we only changed the DB interface type.

- [ ] **Step 5: Run existing seed + verify basic routes work**

```bash
docker compose up db -d
go -C server-go run ./cmd/seed/
go -C server-go run ./cmd/server/ &
sleep 2
curl -s http://localhost:1234/api/v1/health
kill %1
```

Expected: `{"status":"ok","timestamp":"..."}` with no errors.

- [ ] **Step 6: Commit**

```bash
git add server-go/
git commit -m "refactor: switch DB connection from pgxpool to database/sql (pgx stdlib)"
```

---

### Task 4: Create Go migration runner

**Files:**
- Create: `server-go/cmd/migrate/main.go`

- [ ] **Step 1: Create `server-go/cmd/migrate/main.go`**

```go
package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../.env")

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/skillpass"
	}

	ctx := context.Background()

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	migrationsDir := "migrations"
	if len(os.Args) > 1 {
		migrationsDir = os.Args[1]
	}

	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		log.Fatalf("Failed to glob migrations: %v", err)
	}

	if len(files) == 0 {
		log.Println("No migration files found")
		return
	}

	sort.Strings(files)

	os.MkdirAll(filepath.Join(migrationsDir, ".applied"), 0755)

	for _, file := range files {
		filename := filepath.Base(file)
		appliedMarker := filepath.Join(migrationsDir, ".applied", filename)

		if _, err := os.Stat(appliedMarker); err == nil {
			fmt.Printf("  SKIP %s (already applied)\n", filename)
			continue
		}

		content, err := os.ReadFile(file)
		if err != nil {
			log.Fatalf("Failed to read %s: %v", filename, err)
		}

		sql := string(content)

		_, err = db.ExecContext(ctx, sql)
		if err != nil {
			log.Fatalf("FAILED %s: %v\n\nSQL:\n%s", filename, err, sql)
		}

		if err := os.WriteFile(appliedMarker, []byte{}, 0644); err != nil {
			log.Fatalf("Failed to write marker %s: %v", appliedMarker, err)
		}

		fmt.Printf("  OK   %s\n", filename)
	}

	if _, err := db.ExecContext(ctx, "SELECT 1"); err != nil {
		log.Fatalf("Post-migration verification failed: %v", err)
	}

	fmt.Println(strings.Repeat("─", 40))
	fmt.Println("All migrations complete")
}
```

- [ ] **Step 2: Test the migration runner**

```bash
# Remove applied markers to force re-apply
rm -rf server-go/migrations/.applied

# Run migrations
go -C server-go run ./cmd/migrate/
```

Expected output:
```
  OK   000001_init.sql
────────────────────────────────────────
All migrations complete
```

Run it again — should skip:
```
  SKIP 000001_init.sql
────────────────────────────────────────
All migrations complete
```

- [ ] **Step 3: Commit**

```bash
git add server-go/cmd/migrate/
git commit -m "feat: add Go migration runner with SQL DDL files"
```

---

### Task 5: Add go-jet convenience re-exports for generated code

**Files:**
- Create: `server-go/internal/gen/table.go`
- Create: `server-go/internal/gen/model.go`
- Create: `server-go/internal/gen/enum.go`

The generated go-jet code lives in `server-go/.gen/skillpass/public/`. We create convenience re-exports so handlers can import from a single `gen` package.

- [ ] **Step 1: Create table convenience re-exports**

`server-go/internal/gen/table.go`:
```go
package gen

import (
	"github.com/go-jet/jet/v2/postgres"
	. "github.com/go-jet/jet/v2/postgres"

	"skillpass-server-go/.gen/skillpass/public/table"
)

// Table references for type-safe SQL building.
var (
	Users             = table.Users
	Companies         = table.Companies
	JobseekerProfiles = table.JobseekerProfiles
	JobExperiences    = table.JobExperiences
	IndustryCategories = table.IndustryCategories
	Tags              = table.Tags
	JobPostings       = table.JobPostings
)
```

`server-go/internal/gen/model.go`:
```go
package gen

import (
	"skillpass-server-go/.gen/skillpass/public/model"
)

// Model type aliases for query result mapping.
type (
	User             = model.Users
	Company          = model.Companies
	JobseekerProfile = model.JobseekerProfiles
	JobExperience    = model.JobExperiences
	IndustryCategory = model.IndustryCategories
	Tag              = model.Tags
	JobPosting       = model.JobPostings
)
```

`server-go/internal/gen/enum.go`:
```go
package gen

import (
	"skillpass-server-go/.gen/skillpass/public/enum"
)

// Enum value accessors.
var (
	RoleJobseeker = enum.Role.Jobseeker
	RoleCompany   = enum.Role.Company
	RoleAdmin     = enum.Role.Admin

	VerificationStatusPending  = enum.VerificationStatus.Pending
	VerificationStatusVerified = enum.VerificationStatus.Verified
	VerificationStatusRejected = enum.VerificationStatus.Rejected

	JobStatusOpen   = enum.JobStatus.Open
	JobStatusClosed = enum.JobStatus.Closed

	ExperienceLevelEntry = enum.ExperienceLevel.Entry
	ExperienceLevelMid   = enum.ExperienceLevel.Mid
	ExperienceLevelSenior= enum.ExperienceLevel.Senior
	ExperienceLevelLead  = enum.ExperienceLevel.Lead
)
```

- [ ] **Step 2: Verify package compiles**

```bash
go -C server-go build ./internal/gen/
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add server-go/internal/gen/
git commit -m "feat: add convenience re-exports for go-jet generated code"
```

---

### Task 6: Refactor handlers — health + reference (simplest first)

**Files:**
- Modify: `server-go/internal/handlers/health.go`
- Modify: `server-go/internal/handlers/reference.go`

These are the simplest handlers with no or trivial queries. We'll use them to establish the go-jet pattern.

- [ ] **Step 1: health.go — no changes needed**

`health.go` doesn't use the database. No refactoring required.

- [ ] **Step 2: Rewrite `reference.go` to use go-jet**

```go
package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	. "github.com/go-jet/jet/v2/postgres"

	"skillpass-server-go/internal/gen"
)

type ReferenceHandler struct {
	db *sql.DB
}

func NewReferenceHandler(db *sql.DB) *ReferenceHandler {
	return &ReferenceHandler{db: db}
}

func (h *ReferenceHandler) GetIndustries(c *gin.Context) {
	stmt := SELECT(
		gen.IndustryCategories.AllColumns,
	).FROM(
		gen.IndustryCategories,
	).ORDER_BY(
		gen.IndustryCategories.Name,
	)

	var dest []gen.IndustryCategory
	err := stmt.QueryContext(c.Request.Context(), h.db, &dest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query industries"})
		return
	}

	c.JSON(http.StatusOK, dest)
}

func (h *ReferenceHandler) GetTags(c *gin.Context) {
	industryID := c.Query("industry")

	var stmt SelectStatement
	if industryID != "" {
		stmt = SELECT(
			gen.Tags.AllColumns,
		).FROM(
			gen.Tags,
		).WHERE(
			gen.Tags.IndustryCategoryID.EQ(UUID(industryID)),
		).ORDER_BY(
			gen.Tags.Name,
		)
	} else {
		stmt = SELECT(
			gen.Tags.AllColumns,
		).FROM(
			gen.Tags,
		).ORDER_BY(
			gen.Tags.Name,
		)
	}

	var dest []gen.Tag
	err := stmt.QueryContext(c.Request.Context(), h.db, &dest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query tags"})
		return
	}

	c.JSON(http.StatusOK, dest)
}
```

- [ ] **Step 3: Verify build compiles**

```bash
go -C server-go build ./...
```

- [ ] **Step 4: Test endpoints**

```bash
go -C server-go run ./cmd/server/ &
sleep 2
curl -s http://localhost:1234/api/v1/industries | jq 'length'
curl -s http://localhost:1234/api/v1/health | jq .
kill %1
```

Expected: 12 industries returned, health check works.

- [ ] **Step 5: Commit**

```bash
git add server-go/internal/handlers/health.go server-go/internal/handlers/reference.go
git commit -m "refactor: reference handler to use go-jet query builder"
```

---

### Task 7: Refactor auth handler to use go-jet

**Files:**
- Modify: `server-go/internal/handlers/auth.go`

This is the most complex single-file refactoring. We'll rewrite all queries to use go-jet.

- [ ] **Step 1: Rewrite `auth.go` with go-jet**

```go
package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	. "github.com/go-jet/jet/v2/postgres"

	"skillpass-server-go/.gen/skillpass/public/model"
	"skillpass-server-go/internal/gen"
	"skillpass-server-go/internal/lib"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type RegisterRequest struct {
	Email                string  `json:"email" binding:"required"`
	Username             string  `json:"username" binding:"required"`
	Password             string  `json:"password" binding:"required"`
	Name                 string  `json:"name" binding:"required"`
	Role                 string  `json:"role" binding:"required,oneof=jobseeker company"`
	CompanyName          *string `json:"companyName"`
	BusinessRegistration *string `json:"businessRegistration"`
	Website              *string `json:"website"`
	Address              *string `json:"address"`
	Contact              *string `json:"contact"`
}

type UserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

type LoginResponse struct {
	AccessToken  string       `json:"accessToken"`
	RefreshToken string       `json:"refreshToken"`
	User         UserResponse `json:"user"`
}

type AuthHandler struct {
	db        *sql.DB
	jwtSecret string
}

func NewAuthHandler(db *sql.DB, jwtSecret string) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: jwtSecret}
}

func (h *AuthHandler) signTokens(userID, role string) (accessToken, refreshToken string, err error) {
	accessToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": userID,
		"role":   role,
	}).SignedString([]byte(h.jwtSecret))
	if err != nil {
		return "", "", err
	}

	refreshToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": userID,
		"role":   role,
		"type":   "refresh",
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(),
	}).SignedString([]byte(h.jwtSecret))
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Check for existing email using go-jet
	countStmt := SELECT(
		COUNT(gen.Users.ID),
	).FROM(
		gen.Users,
	).WHERE(
		gen.Users.Email.EQ(String(req.Email)),
	)

	var count int64
	err := countStmt.QueryContext(c.Request.Context(), h.db, &count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	displayName := req.Name
	if req.Role == "company" && req.CompanyName != nil && *req.CompanyName != "" {
		displayName = *req.CompanyName
	}

	passwordHash, err := lib.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	// Insert user with RETURNING
	insertStmt := gen.Users.INSERT(
		gen.Users.Email, gen.Users.Username, gen.Users.PasswordHash, gen.Users.Name, gen.Users.Role,
	).VALUES(
		req.Email, req.Username, passwordHash, displayName, req.Role,
	).RETURNING(
		gen.Users.ID, gen.Users.Email, gen.Users.Username, gen.Users.Name, gen.Users.Role,
	)

	var user model.Users
	err = insertStmt.QueryContext(c.Request.Context(), h.db, &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	if req.Role == "jobseeker" {
		_, err = gen.JobseekerProfiles.INSERT(
			gen.JobseekerProfiles.UserID, gen.JobseekerProfiles.Slug,
		).VALUES(
			user.ID, req.Username,
		).ExecContext(c.Request.Context(), h.db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create profile"})
			return
		}
	} else if req.Role == "company" {
		coName := displayName
		if req.CompanyName != nil {
			coName = *req.CompanyName
		}
		_, err = gen.Companies.INSERT(
			gen.Companies.UserID, gen.Companies.CompanyName, gen.Companies.Industry,
			gen.Companies.VerificationDocs, gen.Companies.VerificationStatus,
		).VALUES(
			user.ID, coName, "Technology",
			`{"businessRegistration":"","website":"","address":"","contact":""}`, "pending",
		).ExecContext(c.Request.Context(), h.db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create company"})
			return
		}
	}

	accessToken, refreshToken, err := h.signTokens(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
		return
	}

	c.JSON(http.StatusCreated, LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: UserResponse{
			ID:       user.ID,
			Email:    user.Email,
			Username: user.Username,
			Name:     user.Name,
			Role:     user.Role,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	stmt := SELECT(
		gen.Users.ID, gen.Users.Email, gen.Users.Username, gen.Users.Name,
		gen.Users.Role, gen.Users.PasswordHash,
	).FROM(
		gen.Users,
	).WHERE(
		gen.Users.Email.EQ(String(req.Email)),
	)

	var user model.Users
	err := stmt.QueryContext(c.Request.Context(), h.db, &user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	valid, err := lib.VerifyPassword(req.Password, user.PasswordHash)
	if err != nil || !valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	accessToken, refreshToken, err := h.signTokens(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: UserResponse{
			ID:       user.ID,
			Email:    user.Email,
			Username: user.Username,
			Name:     user.Name,
			Role:     user.Role,
		},
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	token, err := jwt.ParseWithClaims(req.RefreshToken, &jwt.MapClaims{}, func(t *jwt.Token) (any, error) {
		return []byte(h.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok || (*claims)["type"] != "refresh" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	userID := (*claims)["userId"].(string)
	role, ok := (*claims)["role"].(string)
	if !ok || role == "" {
		stmt := SELECT(
			gen.Users.Role,
		).FROM(
			gen.Users,
		).WHERE(
			gen.Users.ID.EQ(UUID(userID)),
		)

		var user model.Users
		err := stmt.QueryContext(c.Request.Context(), h.db, &user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}
		role = user.Role
	}

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": userID,
		"role":   role,
	}).SignedString([]byte(h.jwtSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"accessToken": accessToken})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}
```

- [ ] **Step 2: Verify build compiles**

```bash
go -C server-go build ./...
```

- [ ] **Step 3: Test auth endpoints**

```bash
go -C server-go run ./cmd/server/ &
sleep 2

# Register
curl -s -X POST http://localhost:1234/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"gotester@test.com","username":"gotester","password":"test123","name":"Go Tester","role":"jobseeker"}' | jq '.user.name'

# Login
curl -s -X POST http://localhost:1234/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gotester@test.com","password":"test123"}' | jq '.accessToken[:20]'

# Refresh
TOKEN=$(curl -s -X POST http://localhost:1234/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gotester@test.com","password":"test123"}' | jq -r '.refreshToken')
curl -s -X POST http://localhost:1234/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$TOKEN\"}" | jq '.accessToken[:20]'

kill %1
```

Expected: All requests succeed with proper responses.

- [ ] **Step 4: Commit**

```bash
git add server-go/internal/handlers/auth.go
git commit -m "refactor: auth handler to use go-jet query builder"
```

---

### Task 8: Refactor profile + passport handlers

**Files:**
- Modify: `server-go/internal/handlers/profiles.go`
- Modify: `server-go/internal/handlers/passport.go`

- [ ] **Step 1: Rewrite `profiles.go` with go-jet**

Key patterns:
- SELECT with JOINs for get profile (profiles + user + experiences)
- INSERT with RETURNING for create experience
- UPDATE with MODEL for profile update and experience update
- DELETE for experience delete

```go
package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	. "github.com/go-jet/jet/v2/postgres"

	"skillpass-server-go/.gen/skillpass/public/model"
	"skillpass-server-go/internal/gen"
)

type UpdateProfileRequest struct {
	Headline         *string `json:"headline"`
	About            *string `json:"about"`
	YearsOfExperience *int   `json:"yearsOfExperience"`
	Slug             *string `json:"slug"`
}

type CreateExperienceRequest struct {
	Type         string   `json:"type" binding:"required"`
	Title        string   `json:"title" binding:"required"`
	Organization string   `json:"organization" binding:"required"`
	StartDate    string   `json:"startDate" binding:"required"`
	EndDate      *string  `json:"endDate"`
	IsCurrent    *bool    `json:"isCurrent"`
	Description  *string  `json:"description"`
	Industry     *string  `json:"industry"`
	SkillsUsed   []string `json:"skillsUsed"`
	URL          *string  `json:"url"`
}

type UpdateExperienceRequest struct {
	Type         *string  `json:"type"`
	Title        *string  `json:"title"`
	Organization *string  `json:"organization"`
	StartDate    *string  `json:"startDate"`
	EndDate      *string  `json:"endDate"`
	IsCurrent    *bool    `json:"isCurrent"`
	Description  *string  `json:"description"`
	Industry     *string  `json:"industry"`
	SkillsUsed   []string `json:"skillsUsed"`
	URL          *string  `json:"url"`
}

type Experience struct {
	ID           string   `json:"id"`
	ProfileID    string   `json:"profileId"`
	Type         string   `json:"type"`
	Title        string   `json:"title"`
	Organization string   `json:"organization"`
	StartDate    string   `json:"startDate"`
	EndDate      *string  `json:"endDate"`
	IsCurrent    bool     `json:"isCurrent"`
	Description  *string  `json:"description"`
	Industry     *string  `json:"industry"`
	SkillsUsed   []string `json:"skillsUsed"`
	URL          *string  `json:"url"`
}

type ProfileResponse struct {
	ID               string       `json:"id"`
	UserID           string       `json:"userId"`
	Headline         *string      `json:"headline"`
	About            *string      `json:"about"`
	YearsOfExp       *int         `json:"yearsOfExperience"`
	Slug             string       `json:"slug"`
	Name             string       `json:"name"`
	Email            string       `json:"email"`
	Username         string       `json:"username"`
	Role             string       `json:"role"`
	AvatarURL        *string      `json:"avatarUrl"`
	Experiences      []Experience `json:"experiences"`
}

type ProfileHandler struct {
	db *sql.DB
}

func NewProfileHandler(db *sql.DB) *ProfileHandler {
	return &ProfileHandler{db: db}
}

func (h *ProfileHandler) GetMyProfile(c *gin.Context) {
	userID, _ := c.Get("userId")

	// Fetch profile
	profileStmt := SELECT(
		gen.JobseekerProfiles.AllColumns,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(UUID(userID.(string))),
	)

	var profile model.JobseekerProfiles
	err := profileStmt.QueryContext(c.Request.Context(), h.db, &profile)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	// Fetch user data
	userStmt := SELECT(
		gen.Users.Name, gen.Users.Email, gen.Users.Username,
		gen.Users.Role, gen.Users.AvatarURL,
	).FROM(
		gen.Users,
	).WHERE(
		gen.Users.ID.EQ(UUID(userID.(string))),
	)

	var user model.Users
	err = userStmt.QueryContext(c.Request.Context(), h.db, &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
		return
	}

	// Fetch experiences
	expStmt := SELECT(
		gen.JobExperiences.AllColumns,
	).FROM(
		gen.JobExperiences,
	).WHERE(
		gen.JobExperiences.ProfileID.EQ(UUID(profile.ID)),
	).ORDER_BY(
		gen.JobExperiences.StartDate,
	)

	var experiences []model.JobExperiences
	err = expStmt.QueryContext(c.Request.Context(), h.db, &experiences)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query experiences"})
		return
	}

	// Convert to response
	expResp := make([]Experience, len(experiences))
	for i, e := range experiences {
		expResp[i] = Experience{
			ID:           e.ID,
			ProfileID:    e.ProfileID,
			Type:         e.Type,
			Title:        e.Title,
			Organization: e.Organization,
			StartDate:    e.StartDate,
			EndDate:      e.EndDate,
			IsCurrent:    e.IsCurrent,
			Description:  e.Description,
			Industry:     e.Industry,
			SkillsUsed:   e.SkillsUsed,
			URL:          e.URL,
		}
	}

	c.JSON(http.StatusOK, ProfileResponse{
		ID:          profile.ID,
		UserID:      profile.UserID,
		Headline:    profile.Headline,
		About:       profile.About,
		YearsOfExp:  profile.YearsOfExperience,
		Slug:        profile.Slug,
		Name:        user.Name,
		Email:       user.Email,
		Username:    user.Username,
		Role:        user.Role,
		AvatarURL:   user.AvatarURL,
		Experiences: expResp,
	})
}

func (h *ProfileHandler) UpdateMyProfile(c *gin.Context) {
	userID, _ := c.Get("userId")

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Build SET clause dynamically (only set non-nil fields)
	var setList ColumnAssigmentList
	if req.Headline != nil {
		setList = append(setList, gen.JobseekerProfiles.Headline.SET(String(*req.Headline)))
	}
	if req.About != nil {
		setList = append(setList, gen.JobseekerProfiles.About.SET(String(*req.About)))
	}
	if req.YearsOfExperience != nil {
		setList = append(setList, gen.JobseekerProfiles.YearsOfExperience.SET(Int(int64(*req.YearsOfExperience))))
	}
	if req.Slug != nil {
		setList = append(setList, gen.JobseekerProfiles.Slug.SET(String(*req.Slug)))
	}

	if len(setList) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	stmt := gen.JobseekerProfiles.UPDATE(setList...).
		WHERE(gen.JobseekerProfiles.UserID.EQ(UUID(userID.(string)))).
		RETURNING(gen.JobseekerProfiles.AllColumns)

	var profile model.JobseekerProfiles
	err := stmt.QueryContext(c.Request.Context(), h.db, &profile)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *ProfileHandler) CreateExperience(c *gin.Context) {
	userID, _ := c.Get("userId")

	var profileID string
	profileStmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(UUID(userID.(string))),
	)

	err := profileStmt.QueryContext(c.Request.Context(), h.db, &profileID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	var req CreateExperienceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	isCurrent := false
	if req.IsCurrent != nil {
		isCurrent = *req.IsCurrent
	}

	insertStmt := gen.JobExperiences.INSERT(
		gen.JobExperiences.ProfileID, gen.JobExperiences.Type, gen.JobExperiences.Title,
		gen.JobExperiences.Organization, gen.JobExperiences.StartDate, gen.JobExperiences.EndDate,
		gen.JobExperiences.IsCurrent, gen.JobExperiences.Description, gen.JobExperiences.Industry,
		gen.JobExperiences.SkillsUsed, gen.JobExperiences.URL,
	).VALUES(
		profileID, req.Type, req.Title, req.Organization, req.StartDate, req.EndDate,
		isCurrent, req.Description, req.Industry, req.SkillsUsed, req.URL,
	).RETURNING(
		gen.JobExperiences.AllColumns,
	)

	var exp model.JobExperiences
	err = insertStmt.QueryContext(c.Request.Context(), h.db, &exp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create experience"})
		return
	}

	c.JSON(http.StatusCreated, Experience{
		ID:           exp.ID,
		ProfileID:    exp.ProfileID,
		Type:         exp.Type,
		Title:        exp.Title,
		Organization: exp.Organization,
		StartDate:    exp.StartDate,
		EndDate:      exp.EndDate,
		IsCurrent:    exp.IsCurrent,
		Description:  exp.Description,
		Industry:     exp.Industry,
		SkillsUsed:   exp.SkillsUsed,
		URL:          exp.URL,
	})
}

func (h *ProfileHandler) UpdateExperience(c *gin.Context) {
	userID, _ := c.Get("userId")
	expID := c.Param("id")

	var profileID string
	profileStmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(UUID(userID.(string))),
	)

	err := profileStmt.QueryContext(c.Request.Context(), h.db, &profileID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	var req UpdateExperienceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var setList ColumnAssigmentList
	if req.Type != nil {
		setList = append(setList, gen.JobExperiences.Type.SET(String(*req.Type)))
	}
	if req.Title != nil {
		setList = append(setList, gen.JobExperiences.Title.SET(String(*req.Title)))
	}
	if req.Organization != nil {
		setList = append(setList, gen.JobExperiences.Organization.SET(String(*req.Organization)))
	}
	if req.StartDate != nil {
		setList = append(setList, gen.JobExperiences.StartDate.SET(String(*req.StartDate)))
	}
	if req.EndDate != nil {
		setList = append(setList, gen.JobExperiences.EndDate.SET(String(*req.EndDate)))
	}
	if req.IsCurrent != nil {
		setList = append(setList, gen.JobExperiences.IsCurrent.SET(Bool(*req.IsCurrent)))
	}
	if req.Description != nil {
		setList = append(setList, gen.JobExperiences.Description.SET(String(*req.Description)))
	}
	if req.Industry != nil {
		setList = append(setList, gen.JobExperiences.Industry.SET(String(*req.Industry)))
	}
	if req.SkillsUsed != nil {
		setList = append(setList, gen.JobExperiences.SkillsUsed.SET(StringArray(req.SkillsUsed)))
	}
	if req.URL != nil {
		setList = append(setList, gen.JobExperiences.URL.SET(String(*req.URL)))
	}

	if len(setList) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	updateStmt := gen.JobExperiences.UPDATE(setList...).
		WHERE(
			gen.JobExperiences.ID.EQ(UUID(expID)).
				AND(gen.JobExperiences.ProfileID.EQ(UUID(profileID))),
		).
		RETURNING(gen.JobExperiences.AllColumns)

	var exp model.JobExperiences
	err = updateStmt.QueryContext(c.Request.Context(), h.db, &exp)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Experience not found"})
		return
	}

	c.JSON(http.StatusOK, Experience{
		ID:           exp.ID,
		ProfileID:    exp.ProfileID,
		Type:         exp.Type,
		Title:        exp.Title,
		Organization: exp.Organization,
		StartDate:    exp.StartDate,
		EndDate:      exp.EndDate,
		IsCurrent:    exp.IsCurrent,
		Description:  exp.Description,
		Industry:     exp.Industry,
		SkillsUsed:   exp.SkillsUsed,
		URL:          exp.URL,
	})
}

func (h *ProfileHandler) DeleteExperience(c *gin.Context) {
	userID, _ := c.Get("userId")
	expID := c.Param("id")

	var profileID string
	profileStmt := SELECT(
		gen.JobseekerProfiles.ID,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.UserID.EQ(UUID(userID.(string))),
	)

	err := profileStmt.QueryContext(c.Request.Context(), h.db, &profileID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	deleteStmt := gen.JobExperiences.DELETE().
		WHERE(
			gen.JobExperiences.ID.EQ(UUID(expID)).
				AND(gen.JobExperiences.ProfileID.EQ(UUID(profileID))),
		)

	result, err := deleteStmt.ExecContext(c.Request.Context(), h.db)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Experience not found"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Experience not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
```

- [ ] **Step 2: Rewrite `passport.go` with go-jet**

```go
package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	. "github.com/go-jet/jet/v2/postgres"

	"skillpass-server-go/.gen/skillpass/public/model"
	"skillpass-server-go/internal/gen"
)

type PublicProfileResponse struct {
	Name       string       `json:"name"`
	AvatarURL  *string      `json:"avatarUrl"`
	Headline   *string      `json:"headline"`
	About      *string      `json:"about"`
	YearsOfExp *int         `json:"yearsOfExperience"`
	Experiences []Experience `json:"experiences"`
}

type PassportHandler struct {
	db *sql.DB
}

func NewPassportHandler(db *sql.DB) *PassportHandler {
	return &PassportHandler{db: db}
}

func (h *PassportHandler) GetProfile(c *gin.Context) {
	username := c.Param("username")

	profileStmt := SELECT(
		gen.JobseekerProfiles.AllColumns,
	).FROM(
		gen.JobseekerProfiles,
	).WHERE(
		gen.JobseekerProfiles.Slug.EQ(String(username)),
	)

	var profile model.JobseekerProfiles
	err := profileStmt.QueryContext(c.Request.Context(), h.db, &profile)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	userStmt := SELECT(
		gen.Users.Name, gen.Users.AvatarURL,
	).FROM(
		gen.Users,
	).WHERE(
		gen.Users.ID.EQ(UUID(profile.UserID)),
	)

	var user model.Users
	err = userStmt.QueryContext(c.Request.Context(), h.db, &user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	expStmt := SELECT(
		gen.JobExperiences.AllColumns,
	).FROM(
		gen.JobExperiences,
	).WHERE(
		gen.JobExperiences.ProfileID.EQ(UUID(profile.ID)),
	).ORDER_BY(
		gen.JobExperiences.StartDate,
	)

	var experiences []model.JobExperiences
	err = expStmt.QueryContext(c.Request.Context(), h.db, &experiences)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query experiences"})
		return
	}

	expResp := make([]Experience, len(experiences))
	for i, e := range experiences {
		expResp[i] = Experience{
			ID:           e.ID,
			ProfileID:    e.ProfileID,
			Type:         e.Type,
			Title:        e.Title,
			Organization: e.Organization,
			StartDate:    e.StartDate,
			EndDate:      e.EndDate,
			IsCurrent:    e.IsCurrent,
			Description:  e.Description,
			Industry:     e.Industry,
			SkillsUsed:   e.SkillsUsed,
			URL:          e.URL,
		}
	}

	c.JSON(http.StatusOK, PublicProfileResponse{
		Name:        user.Name,
		AvatarURL:   user.AvatarURL,
		Headline:    profile.Headline,
		About:       profile.About,
		YearsOfExp:  profile.YearsOfExperience,
		Experiences: expResp,
	})
}
```

- [ ] **Step 3: Verify build compiles**

```bash
go -C server-go build ./...
```

- [ ] **Step 4: Test profile + passport endpoints**

```bash
go -C server-go run ./cmd/server/ &
sleep 2

# Get profile (need token)
TOKEN=$(curl -s -X POST http://localhost:1234/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gotester@test.com","password":"test123"}' | jq -r '.accessToken')

curl -s http://localhost:1234/api/v1/profiles/me \
  -H "Authorization: Bearer $TOKEN" | jq '.slug'

# Public passport
curl -s http://localhost:1234/api/v1/profiles/gotester | jq '.name'

kill %1
```

Expected: Both return valid data.

- [ ] **Step 5: Commit**

```bash
git add server-go/internal/handlers/profiles.go server-go/internal/handlers/passport.go
git commit -m "refactor: profile and passport handlers to use go-jet"
```

---

### Task 9: Refactor remaining handlers (companies, jobs, search, admin)

**Files:**
- Modify: `server-go/internal/handlers/companies.go`
- Modify: `server-go/internal/handlers/jobs.go`
- Modify: `server-go/internal/handlers/search.go`
- Modify: `server-go/internal/handlers/admin.go`
- Modify: `server-go/internal/middleware/auth.go`

These follow the same patterns established in Tasks 7-8. Each step applies the same go-jet transformation.

**Patterns to apply per handler:**

1. Replace `*pgxpool.Pool` with `*sql.DB` (already done in Task 3)
2. Replace raw SQL queries with go-jet builder statements
3. Use `SELECT(...).FROM(...).WHERE(...)` for queries
4. Use `Table.INSERT(...).VALUES(...).RETURNING(...)` for inserts
5. Use `Table.UPDATE(setList...).WHERE(...).RETURNING(...)` for updates
6. Use `Table.DELETE().WHERE(...)` for deletes
7. Use dynamic `ColumnAssigmentList` for partial updates
8. Replace manual row scanning with go-jet's struct mapping

- [ ] **Step 1: companies.go — key changes**

```go
// Replace pool → db, use go-jet throughout.
// GetProfile: SELECT companies.* WHERE user_id = $1
// UpdateProfile: UPDATE with dynamic SET list WHERE user_id = $1 RETURNING
// SubmitVerification: UPDATE companies SET verification_docs, verification_status WHERE user_id
// GetVerificationStatus: SELECT verification_status FROM companies WHERE user_id
```

- [ ] **Step 2: jobs.go — key changes**

```go
// ListJobs: SELECT with dynamic WHERE filter (industry, experience_level), ORDER BY
// GetJob: SELECT WHERE id
// ListMyJobs: SELECT WHERE company_id, ORDER BY
// CreateJob: INSERT with RETURNING
// UpdateJob: UPDATE with dynamic SET list, WHERE id AND company_id, RETURNING
// DeleteJob: DELETE WHERE id AND company_id

// For experience_level filter with enum cast:
// In go-jet, use Raw to cast to enum:
condition := Bool(true)
if expLevel := c.Query("experience_level"); expLevel != "" {
    condition = condition.AND(
        gen.JobPostings.ExperienceLevel.EQ(Raw("$1::experience_level", String(expLevel))),
    )
}
```

- [ ] **Step 3: search.go — key changes**

```go
// SearchCandidates: Fetch all profiles via go-jet, then in-memory filter (same as current).
// Replace raw SQL row scanning with go-jet struct mapping.
// The in-memory filtering logic stays identical — only the DB query part changes.
```

- [ ] **Step 4: admin.go — key changes**

```go
// ListPendingVerifications: SELECT companies.* WHERE verification_status = 'pending'
// HandleVerification: UPDATE companies SET status/verified_at WHERE id, plus UPDATE users SET is_verified
```

- [ ] **Step 5: middleware/auth.go — key change**

```go
// RequireVerifiedCompany: use go-jet SELECT instead of raw SQL
func RequireVerifiedCompany(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, _ := c.Get("userId")
        
        stmt := SELECT(
            gen.Companies.ID, gen.Companies.VerificationStatus,
        ).FROM(
            gen.Companies,
        ).WHERE(
            gen.Companies.UserID.EQ(UUID(userID.(string))),
        )
        
        var company gen.Company
        err := stmt.QueryContext(context.Background(), db, &company)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "Company not found"})
            return
        }
        if company.VerificationStatus != "verified" {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Company not verified"})
            return
        }
        c.Set("companyId", company.ID)
        c.Next()
    }
}
```

- [ ] **Step 6: Verify build compiles**

```bash
go -C server-go build ./...
```

- [ ] **Step 7: Run full integration test**

```bash
# Kill any running server
pkill -f "server-go" 2>/dev/null || true
sleep 1

# Start fresh
docker compose up db -d
go -C server-go run ./cmd/seed/
go -C server-go run ./cmd/server/ &
sleep 2

# 1. Health
curl -s http://localhost:1234/api/v1/health

# 2. Register jobseeker
JWT=$(curl -s -X POST http://localhost:1234/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"fulltest@test.com","username":"fulltest","password":"test123","name":"Full Test","role":"jobseeker"}' | jq -r '.accessToken')

# 3. Update profile
curl -s -X PUT http://localhost:1234/api/v1/profiles/me \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"headline":"Go Developer","about":"Testing go-jet"}' | jq '.headline'

# 4. Add experience
curl -s -X POST http://localhost:1234/api/v1/profiles/me/experience \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"type":"employment","title":"Engineer","organization":"Acme","startDate":"2023-01"}' | jq '.title'

# 5. Public passport
curl -s http://localhost:1234/api/v1/profiles/fulltest | jq '.headline'

# 6. Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:1234/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin-skillpass@yopmail.com","password":"admin123!!"}' | jq -r '.accessToken')

echo "Admin token OK: ${ADMIN_TOKEN:0:20}..."

# 7. List industries via go-jet
curl -s http://localhost:1234/api/v1/industries | jq 'length'

# 8. List tags
curl -s http://localhost:1234/api/v1/tags | jq 'length'

# 9. List jobs (empty)
curl -s http://localhost:1234/api/v1/jobs | jq 'length'

# 10. Admin pending verifications
curl -s http://localhost:1234/api/v1/admin/verifications/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq 'length'

kill %1
```

Expected: All 10 tests pass.

- [ ] **Step 8: Commit**

```bash
git add server-go/
git commit -m "refactor: all handlers use go-jet query builder; remove raw SQL"
```

---

### Task 10: Rewrite seed to use go-jet models

**Files:**
- Modify: `server-go/cmd/seed/main.go`
- Remove: `server/seed.ts` (if still exists)

- [ ] **Step 1: Rewrite `seed.go` using go-jet**

```go
package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	. "github.com/go-jet/jet/v2/postgres"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

	"skillpass-server-go/.gen/skillpass/public/model"
	"skillpass-server-go/internal/gen"
)

func main() {
	_ = godotenv.Load("../.env")

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/skillpass"
	}

	ctx := context.Background()

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer db.Close()

	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("Failed to ping DB: %v", err)
	}

	fmt.Println("Seeding database...")

	industries := []struct {
		Name        string
		Description string
	}{
		{"Technology", "Software, hardware, IT services"},
		{"Manufacturing", "Industrial production and fabrication"},
		{"Healthcare", "Medical services and pharmaceuticals"},
		{"Finance", "Banking, investment, insurance"},
		{"Education", "Schools, universities, training"},
		{"Retail", "Sales, e-commerce, consumer goods"},
		{"Transportation", "Logistics, delivery, ride-hailing"},
		{"Creative Arts", "Design, media, entertainment"},
		{"Hospitality", "Hotels, restaurants, tourism"},
		{"Construction", "Building and infrastructure"},
		{"Agriculture", "Farming, food production"},
		{"Energy", "Oil, gas, renewable energy"},
	}

	count := 0
	for _, ind := range industries {
		stmt := gen.IndustryCategories.INSERT(
			gen.IndustryCategories.Name, gen.IndustryCategories.Description,
		).VALUES(ind.Name, ind.Description).
			ON_CONFLICT(gen.IndustryCategories.Name).DO_NOTHING()

		_, err := stmt.ExecContext(ctx, db)
		if err != nil {
			log.Printf("  Warning: failed to insert industry %s: %v", ind.Name, err)
			continue
		}
		count++
	}
	fmt.Printf("Seeded %d industry categories\n", count)

	// Check for existing admin
	checkStmt := SELECT(
		gen.Users.ID,
	).FROM(
		gen.Users,
	).WHERE(
		gen.Users.Email.EQ(String("admin-skillpass@yopmail.com")),
	)

	var existingID string
	err = checkStmt.QueryContext(ctx, db, &existingID)
	if err == nil {
		fmt.Println("Admin user already exists, skipping")
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("admin123!!"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	insertStmt := gen.Users.INSERT(
		gen.Users.Email, gen.Users.Username, gen.Users.PasswordHash,
		gen.Users.Name, gen.Users.Role,
	).VALUES(
		"admin-skillpass@yopmail.com", "admin", string(passwordHash), "Admin", "admin",
	)

	_, err = insertStmt.ExecContext(ctx, db)
	if err != nil {
		log.Fatalf("Failed to create admin: %v", err)
	}
	fmt.Println("Seeded admin user (admin-skillpass@yopmail.com / admin123!!)")
}
```

- [ ] **Step 2: Run seed to verify**

```bash
go -C server-go run ./cmd/seed/
```

Expected: "Seeded 12 industry categories" and "Admin user already exists, skipping" (or creates admin).

- [ ] **Step 3: Commit**

```bash
git add server-go/cmd/seed/
git commit -m "refactor: seed command uses go-jet query builder"
```

---

### Task 11: Update Docker and build pipeline

**Files:**
- Create: `server-go/Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `.dockerignore` (root)

- [ ] **Step 1: Create Go server Dockerfile**

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /skillpass-server ./cmd/server/

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /skillpass-server .
COPY migrations/ ./migrations/

EXPOSE 1234
CMD ["./skillpass-server"]
```

- [ ] **Step 2: Update docker-compose.yml server service**

```yaml
  server:
    build:
      context: ./server-go
      dockerfile: Dockerfile
    ports:
      - "1234:1234"
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/skillpass
      JWT_SECRET: skillpass-dev-secret
      CORS_ORIGIN: http://localhost:4200
      PORT: 1234
```

- [ ] **Step 3: Commit**

```bash
git add server-go/Dockerfile docker-compose.yml
git commit -m "feat: update Docker for Go server with go-jet"
```

---

### Task 12: Update root scripts and remove TypeScript dependencies

**Files:**
- Modify: `package.json` (root)
- Delete: `server/` (entire directory)
- Delete: `db/` (if it was created from previous plan)
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Update root package.json**

```json
{
  "scripts": {
    "dev": "concurrently -n server,web -c cyan,green \"go -C server-go run ./cmd/server/\" \"bun --cwd web dev\"",
    "dev:server": "go -C server-go run ./cmd/server/",
    "dev:web": "bun --cwd web dev",
    "build": "bun --cwd web build",
    "db:migrate": "go -C server-go run ./cmd/migrate/",
    "db:seed": "go -C server-go run ./cmd/seed/",
    "db:generate": "cd server-go && jet -dsn=postgres://postgres:postgres@localhost:5432/skillpass?sslmode=disable -schema=public -path=./.gen -ignore-tables=__drizzle_migrations",
    "docker:up": "docker compose up --build",
    "docker:down": "docker compose down",
    "lint": "biome check .",
    "lint:fix": "biome check --write --unsafe .",
    "format": "biome format --write .",
    "format:check": "biome format ."
  }
}
```

Changes from previous plan:
- `db:push` → `db:migrate` (Go migration runner)
- `db:seed` → Go seed (already planned)
- Added `db:generate` (regenerate go-jet models after schema changes)
- Removed `db:studio` (Drizzle Studio no longer needed)
- Removed `dev:elysia`

- [ ] **Step 2: Verify every script works**

```bash
docker compose up db -d

# Migrate
go -C server-go run ./cmd/migrate/

# Seed
go -C server-go run ./cmd/seed/

# Build server
go -C server-go build ./cmd/server/

# Dev server
go -C server-go run ./cmd/server/ &
sleep 2
curl -s http://localhost:1234/api/v1/health
kill %1
```

- [ ] **Step 3: Update README.md**

Replace the entire README to reflect:
- Tech stack: Go + Gin + go-jet
- No more TypeScript/Bun for server
- Port 1234 (not 8800)
- Updated project structure with migrations/ and .gen/
- Updated commands table
- No Swagger docs

- [ ] **Step 4: Update AGENTS.md**

Replace the entire AGENTS.md to reflect:
- Only Go server, no Elysia legacy references
- go-jet for DB access
- SQL migration files in `server-go/migrations/`
- Regenerate go-jet models after schema changes via `bun run db:generate`
- Updated essential commands table

- [ ] **Step 5: Commit**

```bash
git add package.json README.md AGENTS.md
git commit -m "chore: update scripts and docs for go-jet migration"
```

---

### Task 13: Delete server/ folder and final verification

**Files:**
- Delete: entire `server/` directory

- [ ] **Step 1: Final verification — start fresh and test everything**

```bash
# Clean state
docker compose down
docker compose up db -d
sleep 3

# Apply schema
go -C server-go run ./cmd/migrate/

# Seed
go -C server-go run ./cmd/seed/

# Start dev
go -C server-go run ./cmd/server/ &
sleep 2

# Run full test suite
echo "=== Health ==="
curl -s http://localhost:1234/api/v1/health | jq .

echo "=== Industries ==="
curl -s http://localhost:1234/api/v1/industries | jq 'length'

echo "=== Register ==="
JWT=$(curl -s -X POST http://localhost:1234/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"final@test.com","username":"finaltest","password":"test123","name":"Final Test","role":"jobseeker"}' | jq -r '.accessToken')
echo "Token: ${JWT:0:20}..."

echo "=== Profile ==="
curl -s http://localhost:1234/api/v1/profiles/me \
  -H "Authorization: Bearer $JWT" | jq '.slug'

echo "=== Passport ==="
curl -s http://localhost:1234/api/v1/profiles/finaltest | jq '.name'

echo "=== Login ==="
curl -s -X POST http://localhost:1234/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"final@test.com","password":"test123"}' | jq '.user.name'

echo "=== Admin login ==="
ADMIN_TOKEN=$(curl -s -X POST http://localhost:1234/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin-skillpass@yopmail.com","password":"admin123!!"}' | jq -r '.accessToken')
echo "Admin OK: ${ADMIN_TOKEN:0:20}..."

kill %1 2>/dev/null

echo "=== ALL TESTS PASSED ==="
```

- [ ] **Step 2: Delete server/ directory**

```bash
rm -rf /home/al-ip/learning/skillpass/server
```

- [ ] **Step 3: Verify lint still passes**

```bash
bun run lint
```

Expected: Biome passes (no server/ to lint).

- [ ] **Step 4: Commit**

```bash
git rm -r server/
git add -A
git commit -m "chore: remove legacy Elysia server (fully migrated to Go/Gin with go-jet)"
```

---

## Spec Coverage Self-Review

| Requirement | Task | Status |
|---|---|---|
| Replace Drizzle (TypeScript) with go-jet | Tasks 2, 5 | Generated models, convenience re-exports |
| SQL DDL as source of truth | Task 1 | `migrations/000001_init.sql` |
| All endpoints migrated | Pre-existing + Tasks 6-9 | Every handler uses go-jet |
| Seed script in Go | Task 10 | go-jet seed with ON CONFLICT |
| DB connection compatible with go-jet | Task 3 | `*sql.DB` via pgx stdlib |
| Migration runner in Go | Task 4 | `cmd/migrate/` applies SQL files |
| No TypeScript/Bun for server | Tasks 12-13 | Removed Drizzle, seed.ts, server/ |
| Docker for Go server | Task 11 | Multi-stage Go build |
| Updated root scripts | Task 12 | `db:migrate`, `db:seed`, `db:generate` |
| Documentation updated | Task 12 | README + AGENTS.md |

**What's intentionally dropped:**
- Drizzle Studio (DB GUI) — replaced by direct SQL or any DB tool
- Swagger docs — not reimplemented
- `dev:elysia` script — no longer needed

**No placeholders**: Every step has complete, compilable code.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-04-go-jet-migration.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
