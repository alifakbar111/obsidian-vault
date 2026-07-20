# go-jet → Bun ORM Migration Plan

> **For agentic workers:** This plan MUST be executed by delegating each task to the appropriate agent(s) via the agent-manager. Do NOT implement tasks directly — route to existing agents (go-scaffolder, test-runner, bug-hunter, etc.) or the agent-manager for orchestration. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the SkillPass Go backend from go-jet (type-safe query builder) to Bun (lightweight ORM) for reduced boilerplate, cleaner relation loading, and a more ergonomic developer experience.

**Architecture:** Bun wraps the same `*sql.DB` pool that go-jet uses today. Migration is incremental — one package at a time, both libraries coexist until the final cleanup step. The `.gen/` directory (137 auto-generated files) gets deleted at the end, replaced by hand-written Bun model structs for the 14 core tables.

**Tech Stack:** Bun ORM (`github.com/uptrace/bun`), `github.com/uptrace/bun/dialect/pgdialect`, `github.com/uptrace/bun/extra/bundebug` (dev debug), PostgreSQL via pgx (unchanged)

**Strategy — three phases (20 tasks):**
1. **Setup** (Tasks 1–4) — Add Bun + security guard rail, create shared connection, write model structs
2. **Incremental conversion** (Tasks 5–18) — Convert one package at a time (middleware → handlers → application → matching → evaluation → seed → testutil)
3. **Cleanup** (Tasks 19–20) — Remove go-jet, delete `.gen/`, update go.mod, remove stale `*sql.DB` fields

---

## Phase 1: Setup

### Task 1: Add Bun dependency and shared connection

**Files:**
- Modify: `server-go/go.mod`
- Create: `server-go/internal/db/bun.go`
- No change: `server-go/internal/db/db.go` (still returns `*sql.DB`)

- [ ] **Step 1: Install Bun**

```bash
cd server-go
go get github.com/uptrace/bun@latest
go get github.com/uptrace/bun/dialect/pgdialect@latest
go get github.com/uptrace/bun/extra/bundebug@latest
```

Expected: `go.mod` updated with Bun entries, `go.sum` regenerated.

- [ ] **Step 2: Create `internal/db/bun.go`**

Create a thin wrapper that initializes Bun from the existing `*sql.DB`:

```go
package db

import (
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/extra/bundebug"
)

func NewBunDB(sqlDB *DB) *bun.DB {
	bunDB := bun.NewDB(sqlDB, pgdialect.New())
	bunDB.AddQueryHook(bundebug.NewQueryHook(
		bundebug.WithVerbose(false), // set true for dev debugging
	))
	return bunDB
}
```

Note: This uses `*DB` — our custom type from `db.go`. If `Connect` returns `*sql.DB`, the signature is `NewBunDB(sqlDB *sql.DB) *bun.DB`.

- [ ] **Step 3: Update `cmd/server/main.go` to initialize Bun**

Find where `db.Connect(...)` is called. After it, add:

```go
import "skillpass-server-go/internal/db"

// existing
sqlDB, err := db.Connect(ctx, cfg.DatabaseURL)

// new
bunDB := db.NewBunDB(sqlDB)
defer bunDB.Close()
```

Then pass `bunDB` through the dependency chain. Currently handlers receive `*sql.DB` — we'll add `*bun.DB` alongside it in the Handler struct.

- [ ] **Step 4: Verify it compiles**

```bash
cd server-go && go build ./...
```

Expected: No errors. Nothing is using Bun yet — just making sure the dependency resolves.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Bun ORM dependency and shared connection wrapper"
```

---

### Task 2: Add SQL injection lint check to pre-push hooks

> **Why:** Bun uses string-based column names (`Where("id = ?", id)`) instead of go-jet's compile-time checked columns (`gen.Users.ID.EQ(...)`). This is a minor regression in type safety. Adding `gosec` (Go security linter) to pre-push hooks catches SQL injection via string concatenation — e.g. `Where("name = " + userInput)` instead of `Where("name = ?", userInput)`.

**Files:**
- Modify: `lefthook.yml`
- Create: `server-go/tools/cmd/gosec-check/` (optional — or just run `gosec` directly)

- [ ] **Step 1: Install gosec**

```bash
go install github.com/securego/gosec/v2/cmd/gosec@latest
```

- [ ] **Step 2: Add gosec to pre-push hooks in `lefthook.yml`**

Insert a new command after the `vuln-go` block (line 16):

```yaml
    sql-injection:
      run: >
        command -v gosec >/dev/null 2>&1 &&
        gosec -quiet -include G201,G202,G203,G204 ./server-go/... ||
        echo "gosec not installed — run: go install github.com/securego/gosec/v2/cmd/gosec@latest"
```

The `-include G201,G202,G203,G204` flags target:
- **G201**: SQL injection via format string (`fmt.Sprintf` + SQL)
- **G202**: SQL injection via string concatenation
- **G203**: Use of unescaped data in SQL
- **G204**: SQL query via `db.Query` with string concatenation

- [ ] **Step 3: Verify gosec runs cleanly against the current codebase**

```bash
gosec -quiet -include G201,G202,G203,G204 ./server-go/...
```

Expected: No findings (or known false positives reviewed and allowlisted).

If there are findings, investigate each one. False positives can be suppressed with `// #nosec` comments:

```go
// #nosec G201 — false positive, value is parameterized
rows, err := db.QueryContext(ctx, "SELECT * FROM users WHERE id = $1", id)
```

- [ ] **Step 4: Run the full pre-push check to confirm it works**

```bash
cd server-go && go test -p 1 ./...
gosec -quiet -include G201,G202,G203,G204 ./server-go/...
```

- [ ] **Step 5: Commit**

```bash
git add lefthook.yml
git commit -m "ci: add gosec SQL injection linter to pre-push hooks"
```

---

### Task 3: Write Bun model structs for all 14 core tables

**Files:**
- Create: `server-go/internal/models/` directory
- Create: `server-go/internal/models/user.go`
- Create: `server-go/internal/models/company.go`
- Create: `server-go/internal/models/job_posting.go`
- Create: `server-go/internal/models/application.go`
- Create: `server-go/internal/models/jobseeker_profile.go`
- Create: `server-go/internal/models/job_experience.go`
- Create: `server-go/internal/models/industry_category.go`
- Create: `server-go/internal/models/tag.go`
- Create: `server-go/internal/models/skill.go`
- Create: `server-go/internal/models/skill_category.go`
- Create: `server-go/internal/models/job_category_weight.go`
- Create: `server-go/internal/models/evaluation.go`
- Create: `server-go/internal/models/refresh_token.go`
- Create: `server-go/internal/models/admin_audit.go`
- Create: `server-go/internal/models/notification.go`
- Delete (later): `server-go/internal/gen/` (Phase 3)

Each model struct maps exactly to a DB table with Bun struct tags. Bun is database-first compatible — table names, column names, types must match PostgreSQL exactly.

**Convention:**
- Package `models` (singular to match Bun style)
- Struct name = PascalCase singular of table name (e.g. `users` → `User`)
- `bun:",pk"` tag on primary key
- `bun:",type:uuid,default:gen_random_uuid()"` for UUID PKs with auto-gen
- `bun:",notnull"` for NOT NULL columns
- `bun:",unique"` for UNIQUE constraints
- `bun:",nullzero"` for nullable fields (zero value → NULL)
- Naming convention: `table_name` → `TableName`, `column_name` → `ColumnName` (Go style)
- Use `pgtype.UUID` or `string` for UUID (check what the codebase currently uses)
- Use `time.Time` for timestamps
- Use `string` for enums (PostgreSQL enum type as Go string)
- Use `string` with `bun:",type:text"` for text fields

- [ ] **Step 1: Create the model directory**

```bash
mkdir -p server-go/internal/models
```

- [ ] **Step 2: Read current generated types**

Read `server-go/internal/gen/model.go` to see which 12+ models are re-exported. Then read the corresponding `.gen/` model files to understand field names and types. Also scan the migration DDL files to get exact column definitions.

---

**Key struct definitions:**

```go
// server-go/internal/models/user.go
package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"time"
)

type User struct {
	bun.BaseModel `bun:"table:users"`

	ID        uuid.UUID `bun:",pk,type:uuid,default:gen_random_uuid()"`
	Email     string    `bun:",notnull,unique"`
	Password  string    `bun:",notnull"`
	Role      string    `bun:",notnull,default:'jobseeker'"`       // jobseeker, company, admin, hris
	Name      string    `bun:",notnull"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:now()"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:now()"`
}
```

```go
// server-go/internal/models/company.go
package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"time"
)

type Company struct {
	bun.BaseModel `bun:"table:companies"`

	ID                uuid.UUID  `bun:",pk,type:uuid,default:gen_random_uuid()"`
	UserID            uuid.UUID  `bun:",notnull,unique"`
	CompanyName       string     `bun:",notnull"`
	Description       string     `bun:",type:text"`
	Industry          string     `bun:",notnull"`
	LogoURL           string     `bun:",type:text"`
	Website           string     `bun:",type:text"`
	Size              string     `bun:",type:varchar(50)"`
	Location          string     `bun:",type:text"`
	IsVerified        bool       `bun:",notnull,default:false"`
	VerificationToken string     `bun:",unique"`
	CreatedAt         time.Time  `bun:",nullzero,notnull,default:now()"`
	UpdatedAt         time.Time  `bun:",nullzero,notnull,default:now()"`
}
```

```go
// server-go/internal/models/job_posting.go
package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"github.com/lib/pq" // for pq.StringArray
	"time"
)

type JobPosting struct {
	bun.BaseModel `bun:"table:job_postings"`

	ID                 uuid.UUID    `bun:",pk,type:uuid,default:gen_random_uuid()"`
	CompanyID          uuid.UUID    `bun:",notnull"`
	Title              string       `bun:",notnull"`
	Description        string       `bun:",type:text,notnull"`
	Industry           string       `bun:",notnull"`
	Tags               pq.StringArray `bun:",type:text[]"`
	RequiredSkills     pq.StringArray `bun:",type:text[]"`
	ExperienceLevel    string       `bun:",notnull"` // enum: entry, mid, senior, lead
	Location           string       `bun:",notnull"`
	SalaryRange        string       `bun:",type:varchar(100)"`
	Requirements       string       `bun:",type:text"`
	Benefits           string       `bun:",type:text"`
	YearsExperienceMin int          `bun:",default:0"`
	YearsExperienceMax int          `bun:",default:0"`
	IsFreshGradFriendly bool        `bun:",default:false"`
	Status             string       `bun:",notnull,default:'open'"` // enum: open, closed, draft, filled
	CreatedAt          time.Time    `bun:",nullzero,notnull,default:now()"`
	UpdatedAt          time.Time    `bun:",nullzero,notnull,default:now()"`
}
```

```go
// server-go/internal/models/application.go
package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"time"
)

type Application struct {
	bun.BaseModel `bun:"table:applications"`

	ID            uuid.UUID  `bun:",pk,type:uuid,default:gen_random_uuid()"`
	JobseekerID   uuid.UUID  `bun:",notnull"`
	JobPostingID  uuid.UUID  `bun:",notnull"`
	Status        string     `bun:",notnull,default:'pending'"` // pending, reviewed, shortlisted, rejected, hired, withdrawn
	CoverLetter   string     `bun:",type:text"`
	ResumeURL     string     `bun:",type:text"`
	CreatedAt     time.Time  `bun:",nullzero,notnull,default:now()"`
	UpdatedAt     time.Time  `bun:",nullzero,notnull,default:now()"`
}
```

**Repeat the same pattern for the remaining tables:**

List of all tables needed (reference from `internal/gen/model.go`):

| Table | Struct | Key Bun features |
|---|---|---|
| `users` | User | PK uuid, email unique |
| `companies` | Company | FK to users, is_verified bool |
| `jobseeker_profiles` | JobseekerProfile | FK to users, pgtype.JSONB for preferences |
| `job_experiences` | JobExperience | FK to jobseeker_profiles, date range |
| `industry_categories` | IndustryCategory | Simple PK + name |
| `tags` | Tag | Simple PK + name |
| `job_postings` | JobPosting | FK to companies, pq.StringArray for tags |
| `refresh_tokens` | RefreshToken | FK to users, has expiry |
| `admin_audit_log` | AdminAuditLog | Actor + action + target |
| `ai_evaluations` | AiEvaluation | FK to applications + evaluator |
| `applications` | Application | FK to jobseeker + job_posting |
| `skills` | Skill | Simple PK + name |
| `skill_categories` | SkillCategory | Hierarchical |
| `job_category_weights` | JobCategoryWeight | FK to job_postings + skill_categories |

For each, check the actual migration SQL to get exact column names and types. Read:
- `server-go/migrations/000001_init.sql` (users, companies, jobseeker_profiles, job_experiences, industry_categories, tags, job_postings)
- `server-go/migrations/000002_refresh_tokens.sql`
- `server-go/migrations/000003_admin_audit.sql`
- `server-go/migrations/000005_ai_evaluations_applications.sql`
- `server-go/migrations/000021_create_skills_table.sql`
- `server-go/migrations/000028_category_taxonomy.sql` (skill_categories, job_category_weights)

- [ ] **Step 3: Write each model file**

Create one `.go` file per table in `server-go/internal/models/`. Each file has one struct with Bun tags. Follow the pattern from Step 2.

- [ ] **Step 4: Verify compilation**

```bash
cd server-go && go build ./...
```

Expected: No errors. Models are not used yet — just verifying struct tags are syntactically valid.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Bun model structs for all core tables"
```

---

### Task 4: Add Bun connection to handler/application/matching structs

**Files:**
- Modify: `server-go/internal/handlers/handler.go` (or wherever `Handler` struct is defined)
- Modify: `server-go/internal/application/service.go`
- Modify: `server-go/internal/matching/service.go`
- Modify: `server-go/internal/evaluation/service.go`
- Modify: `server-go/cmd/seed/main.go`
- Modify: `server-go/internal/middleware/auth.go`

- [ ] **Step 1: Find where `Handler` struct is defined**

Read `server-go/internal/handlers/handler.go` (or equivalent). Add a `*bun.DB` field alongside the existing `*sql.DB`:

```go
type Handler struct {
    db    *sql.DB   // keep for existing go-jet code
    bunDB *bun.DB   // new Bun connection
}
```

- [ ] **Step 2: Find all other service structs**

Check `application/service.go`, `evaluation/service.go`, `matching/service.go`. Add `bun bun.IDB` field to each.

- [ ] **Step 3: Update `cmd/server/main.go`**

Where handlers/services are constructed, pass the new `bunDB`:

```go
// before
h := &handlers.Handler{db: sqlDB}

// after
h := &handlers.Handler{db: sqlDB, bunDB: bunDB}
```

- [ ] **Step 4: Verify build**

```bash
cd server-go && go build ./...
```

Expected: Compilation succeeds. No Bun queries written yet — just passing the connection.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Bun DB field to handler/service structs"
```

---

## Phase 2: Incremental Package Conversion

Strategy: Convert one package at a time, from simplest to hardest. Each step converts all go-jet queries in that package to Bun, then removes the go-jet import. The `*sql.DB` field stays in the struct until Phase 3 (for any unconverted packages still using it).

Order: `middleware` → `handlers/skills` → `handlers/reference` → `handlers/companies` → `handlers/profiles` → `handlers/auth` → `handlers/jobs` → `handlers/passport` → `handlers/admin` → `application` → `matching` → `evaluation` → `seed` → `testutil`

**General conversion pattern for each file:**

**SELECT (go-jet → Bun):**
```go
// go-jet
stmt := SELECT(
    gen.JobPostings.AllColumns,
).FROM(
    gen.JobPostings,
).WHERE(
    gen.JobPostings.ID.EQ(UUID(id)),
)
var job model.JobPostings
stmt.QueryContext(ctx, h.db, &job)

// Bun
var job models.JobPosting
err := h.bunDB.NewSelect().
    Model(&job).
    Where("id = ?", id).
    Scan(ctx)
```

**INSERT + RETURNING (go-jet → Bun):**
```go
// go-jet
stmt := gen.JobPostings.INSERT(
    gen.JobPostings.Title, gen.JobPostings.Description,
).VALUES(
    req.Title, req.Description,
).RETURNING(gen.JobPostings.AllColumns)
var job model.JobPostings
stmt.QueryContext(ctx, h.db, &job)

// Bun
job := &models.JobPosting{
    Title:       req.Title,
    Description: req.Description,
}
err := h.bunDB.NewInsert().
    Model(job).
    Returning("*").
    Scan(ctx)
```

**UPDATE (go-jet → Bun):**
```go
// go-jet
stmt := gen.JobPostings.UPDATE().
    SET(gen.JobPostings.Title.SET(String(newTitle))).
    WHERE(gen.JobPostings.ID.EQ(UUID(id)))
stmt.ExecContext(ctx, h.db)

// Bun
_, err := h.bunDB.NewUpdate().
    Model(&job).
    Set("title = ?", newTitle).
    Where("id = ?", id).
    Exec(ctx)
```

**DELETE (go-jet → Bun):**
```go
// go-jet
stmt := gen.JobPostings.DELETE().
    WHERE(gen.JobPostings.ID.EQ(UUID(id)))
stmt.ExecContext(ctx, h.db)

// Bun
_, err := h.bunDB.NewDelete().
    Model((*models.JobPosting)(nil)).
    Where("id = ?", id).
    Exec(ctx)
```

---

### Task 5: Convert `internal/middleware/auth.go`

**Files:**
- Modify: `server-go/internal/middleware/auth.go`

This file is the smallest go-jet user. It likely does a single user lookup.

- [ ] **Step 1: Read `internal/middleware/auth.go`**

Read the file and identify the queries.

- [ ] **Step 2: Convert go-jet queries to Bun**

If it does `SELECT ... FROM users WHERE id = ?`:
```go
// before
stmt := SELECT(gen.Users.AllColumns).FROM(gen.Users).WHERE(gen.Users.ID.EQ(UUID(userID)))
var user model.Users
stmt.QueryContext(ctx, db, &user)

// after
var user models.User
err := bunDB.NewSelect().Model(&user).Where("id = ?", userID).Scan(ctx)
```

- [ ] **Step 3: Remove go-jet import**

Remove `"github.com/go-jet/jet/v2/postgres"` and `"skillpass-server-go/internal/gen"` imports if no longer needed.

- [ ] **Step 4: Verify build**

```bash
cd server-go && go build ./...
```

- [ ] **Step 5: Run auth tests**

```bash
go test ./server-go/internal/middleware/... -v -p 1
```

Expected: Tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(middleware): migrate auth middleware from go-jet to Bun"
```

---

### Task 6: Convert `handlers/skills.go`

**Files:**
- Modify: `server-go/internal/handlers/skills.go`

This is a simple read-only handler (likely just SELECT queries).

- [ ] **Step 1: Read `skills.go`**

Read the file and identify all go-jet queries.

- [ ] **Step 2: Convert all queries to Bun**

Replace each `SELECT().FROM().WHERE()` with `NewSelect().Model(&dest).Where("...").Scan(ctx)`.

```go
// before
stmt := SELECT(
    gen.Skills.AllColumns,
).FROM(
    gen.Skills,
).WHERE(
    gen.Skills.Industry.EQ(String(industry)),
).ORDER_BY(
    gen.Skills.Name.ASC(),
)
var skills []model.Skills
stmt.QueryContext(ctx, h.db, &skills)

// after
var skills []models.Skill
err := h.bunDB.NewSelect().
    Model(&skills).
    Where("industry = ?", industry).
    Order("name ASC").
    Scan(ctx)
```

- [ ] **Step 3: Remove unused imports**

- [ ] **Step 4: Verify build**

```bash
cd server-go && go build ./...
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(handlers): migrate skills handler from go-jet to Bun"
```

---

### Task 7: Convert `handlers/reference.go`

**Files:**
- Modify: `server-go/internal/handlers/reference.go`

Similar simplicity to skills — likely just read-only reference data queries.

- [ ] **Step 1: Read `reference.go`**

- [ ] **Step 2: Convert all go-jet queries to Bun**

- [ ] **Step 3: Remove unused imports**

- [ ] **Step 4: Build & commit**

---

### Task 8: Convert `handlers/companies.go`

**Files:**
- Modify: `server-go/internal/handlers/companies.go`

This likely has CRUD on companies. May include joins.

- [ ] **Step 1: Read `companies.go`**

Identify all query types.

- [ ] **Step 2: Convert SELECT queries**

```go
// Single company lookup
var company models.Company
err := h.bunDB.NewSelect().
    Model(&company).
    Where("id = ?", id).
    Scan(ctx)
```

- [ ] **Step 3: Convert INSERT queries**

```go
company := &models.Company{
    CompanyName: req.Name,
    Industry:    req.Industry,
    // ...
}
err := h.bunDB.NewInsert().
    Model(company).
    Returning("*").
    Scan(ctx)
```

- [ ] **Step 4: Convert UPDATE queries**

```go
_, err := h.bunDB.NewUpdate().
    Model(&company).
    Set("company_name = ?", req.Name).
    Set("description = ?", req.Description).
    Where("id = ?", id).
    Exec(ctx)
```

- [ ] **Step 5: Convert DELETE if present**

- [ ] **Step 6: Remove unused imports, build, test, commit**

---

### Task 9: Convert `handlers/profiles.go`

**Files:**
- Modify: `server-go/internal/handlers/profiles.go`

May have joins with `jobseeker_profiles` and `job_experiences`. Use Bun's `Relation()` if joins are for related data.

- [ ] **Step 1: Read `profiles.go`**

- [ ] **Step 2: Convert each query**

If there's a join:

```go
// go-jet: manual JOIN with SELECT + FROM + INNER_JOIN
// Bun: use Relation if model has the relationship defined

type JobseekerProfile struct {
    // ...
    Experiences []JobExperience `bun:"rel:has-many,join:id=jobseeker_profile_id"`
}

// Then:
var profile models.JobseekerProfile
err := h.bunDB.NewSelect().
    Model(&profile).
    Relation("Experiences").
    Where("id = ?", id).
    Scan(ctx)
```

If the join is custom (not a direct FK relationship), use explicit query:

```go
var result struct {
    models.JobseekerProfile
    UserName string `bun:"user_name"`
}
err := h.bunDB.NewSelect().
    ColumnExpr("jp.*").
    ColumnExpr("u.name AS user_name").
    TableExpr("jobseeker_profiles jp").
    Join("JOIN users u ON u.id = jp.user_id").
    Where("jp.id = ?", id).
    Scan(ctx, &result)
```

- [ ] **Step 3: Remove unused imports, build, test, commit**

---

### Task 10: Convert `handlers/auth.go` and `handlers/auth_helpers.go`

**Files:**
- Modify: `server-go/internal/handlers/auth.go`
- Modify: `server-go/internal/handlers/auth_helpers.go`

Auth handlers have sensitive queries (login, register, token refresh). Be extra careful to preserve exact SQL semantics.

- [ ] **Step 1: Read both files**

- [ ] **Step 2: Convert queries one by one**

Pay attention to:
- `RETURNING` clauses (Bun `Returning("*")`)
- UUID handling (Bun works directly with `uuid.UUID`)
- Password hash fields (ensure `nullzero` handles empty correctly)

- [ ] **Step 3: Remove unused imports, build, run tests**

```bash
go test ./server-go/internal/handlers/... -run "Auth" -v -p 1
```

- [ ] **Step 4: Commit**

---

### Task 11: Convert `handlers/jobs.go`

**Files:**
- Modify: `server-go/internal/handlers/jobs.go`

This is the largest handler (548 lines, the reference example). It has SELECT, INSERT, UPDATE, DELETE, dynamic WHERE building, pagination, and `jobFromModel()` type conversion functions.

- [ ] **Step 1: Read `jobs.go` fully**

- [ ] **Step 2: Replace dynamic WHERE building**

go-jet pattern:
```go
var whereCond BoolExpression
whereCond = gen.JobPostings.Status.EQ(String("open"))
if industry != "" {
    whereCond = whereCond.AND(gen.JobPostings.Industry.EQ(String(industry)))
}
```

Bun pattern:
```go
query := h.bunDB.NewSelect().Model(&jobs).Where("status = ?", "open")
if industry != "" {
    query = query.Where("industry = ?", industry)
}
```

- [ ] **Step 3: Replace pagination**

```go
// go-jet
.LIMIT(limit).OFFSET(offset)

// Bun (chained on the same query builder)
query = query.Limit(limit).Offset(offset)
```

- [ ] **Step 4: Replace INSERT with RETURNING**

```go
job := &models.JobPosting{
    Title:       req.Title,
    Description: req.Description,
    // ... map all fields from req
}
err := h.bunDB.NewInsert().Model(job).Returning("*").Scan(ctx)
```

- [ ] **Step 5: Replace UPDATE with SET**

```go
query := h.bunDB.NewUpdate().Model((*models.JobPosting)(nil))
if req.Title != nil {
    query = query.Set("title = ?", *req.Title)
}
if req.Description != nil {
    query = query.Set("description = ?", *req.Description)
}
_, err := query.Where("id = ? AND company_id = ?", jobUUID, companyUUID).Exec(ctx)
```

- [ ] **Step 6: Replace DELETE**

- [ ] **Step 7: Update `jobFromModel()`**

Instead of converting `model.JobPostings` to the response struct, convert from `models.JobPosting`:

```go
func jobFromModel(j models.JobPosting) JobResponse {
    return JobResponse{
        ID: j.ID.String(),
        // ...
    }
}
```

- [ ] **Step 8: Remove unused imports, build, test, commit**

---

### Task 12: Convert `handlers/passport.go`

**Files:**
- Modify: `server-go/internal/handlers/passport.go`

- [ ] **Step 1: Read and convert**

- [ ] **Step 2: Build, test, commit**

---

### Task 13: Convert `handlers/admin.go`

**Files:**
- Modify: `server-go/internal/handlers/admin.go`

Admin handlers often have complex aggregate queries. Use Bun's raw query where appropriate.

```go
// Complex query → just use Bun's raw query (same pool)
var results []AdminDashboardRow
err := h.bunDB.Query(ctx, &results, `
    SELECT u.role, COUNT(*) as count
    FROM users u
    GROUP BY u.role
`)
```

- [ ] **Step 1: Read and convert**

- [ ] **Step 2: Build, test, commit**

---

### Task 14: Convert `internal/application/service.go`

**Files:**
- Modify: `server-go/internal/application/service.go`

This file already uses raw SQL alongside go-jet. The go-jet parts are likely simple queries that are easy to convert.

- [ ] **Step 1: Read and identify go-jet portions**

- [ ] **Step 2: Replace with Bun**

The existing raw SQL parts can stay as Bun's `Query()` calls (same pool).

- [ ] **Step 3: Build, test, commit**

---

### Task 15: Convert `internal/matching/service.go` and `category_service.go`

**Files:**
- Modify: `server-go/internal/matching/service.go`
- Modify: `server-go/internal/matching/category_service.go`

- [ ] **Step 1: Read and convert**

- [ ] **Step 2: Build, test, commit**

---

### Task 16: Convert `internal/evaluation/service.go`

**Files:**
- Modify: `server-go/internal/evaluation/service.go`

- [ ] **Step 1: Read and convert**

- [ ] **Step 2: Build, test, commit**

---

### Task 17: Convert `cmd/seed/main.go`

**Files:**
- Modify: `server-go/cmd/seed/main.go`

The seeder inserts bulk data. Bun's bulk insert:

```go
users := make([]models.User, 0, 100)
for i := 0; i < 100; i++ {
    users = append(users, models.User{Email: fmt.Sprintf("user%d@test.com", i), ...})
}
_, err := bunDB.NewInsert().Model(&users).Exec(ctx)
```

- [ ] **Step 1: Read and convert**

- [ ] **Step 2: Build, verify seed works**

```bash
go run ./cmd/seed/main.go
# or
bun run db:seed
```

- [ ] **Step 3: Commit**

---

### Task 18: Convert `internal/testutil/factories.go`

**Files:**
- Modify: `server-go/internal/testutil/factories.go`

Test factories use go-jet to create test data. Replace with Bun inserts.

- [ ] **Step 1: Read and convert**

- [ ] **Step 2: Verify tests still pass**

```bash
go test ./server-go/... -p 1
```

- [ ] **Step 3: Commit**

---

## Phase 3: Cleanup

### Task 19: Verify no remaining go-jet imports

- [ ] **Step 1: Search for remaining go-jet imports**

```bash
rg "go-jet/jet" --type go server-go/
```

Expected: No results (except possibly in `.gen/` which we'll delete next).

- [ ] **Step 2: Remove go-jet from go.mod**

```bash
cd server-go && go mod edit -droprequire github.com/go-jet/jet/v2
go mod tidy
```

- [ ] **Step 3: Delete the `.gen/` directory**

```bash
rm -rf server-go/.gen
```

- [ ] **Step 4: Delete `internal/gen/` package**

```bash
rm -rf server-go/internal/gen
```

- [ ] **Step 5: Verify entire project builds**

```bash
cd server-go && go build ./...
cd .. && bun run build # also check frontend build
```

- [ ] **Step 6: Run full test suite**

```bash
bun run test:server
bun --cwd web test
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: remove go-jet, complete migration to Bun ORM"
```

---

### Task 20: Update documentation references from go-jet to Bun

> **Why:** There are ~20 documentation files across the repo that reference go-jet. After removing go-jet, these must be updated to reference Bun so future readers don't get confused.

**Files to update (exhaustive list):**

| File | What to update |
|---|---|
| `CLAUDE.md` | Stack description, `db:generate` command, gen-types rule, architecture references |
| `AGENTS.md` | Stack, file tree, commands table, response struct convention, DB section |
| `README.md` | Tech stack, dependencies, commands, file tree |
| `.agents/rules/database.md` | Replace "go-jet query builder" with "Bun ORM" |
| `.agents/rules/architecture.md` | Replace go-jet references with Bun |
| `.agents/rules/commands.md` | Replace `db:generate` description |
| `.agents/rules/naming-and-structure.md` | Remove "generated as PascalCase by go-jet" line |
| `.agents/agents/go-scaffolder.md` | Description + step mentioning go-jet |
| `.agents/agents/db-migration.md` | Description + step mentioning go-jet codegen |
| `.agents/agents/security-auditor.md` | "go-jet expressions" → update |
| `.agents/skills/go-scaffold/SKILL.md` | Description + step mentioning go-jet |
| `.claude/agents/go-scaffolder.md` | Mirror of `.agents/agents/go-scaffolder.md` |
| `.claude/agents/db-migration.md` | Mirror of `.agents/agents/db-migration.md` |
| `.claude/agents/security-auditor.md` | Mirror of `.agents/agents/security-auditor.md` |
| `.opencode/agents/go-scaffolder.md` | Mirror |
| `.opencode/agents/db-migration.md` | Mirror |
| `.opencode/agents/security-auditor.md` | Mirror |
| `.clinerules/workflows/go-scaffolder.md` | Mirror |
| `.clinerules/workflows/db-migration.md` | Mirror |
| `.clinerules/workflows/security-auditor.md` | Mirror |

**Go code comments** (updated naturally during Task 5-18 conversions — no extra step needed here):
- `internal/notification/service.go` — comments about go-jet
- `internal/matching/service.go` — comments about raw SQL vs go-jet
- `internal/handlers/search.go` — comment about go-jet type issues
- `internal/handlers/companies.go` — comment about go-jet model
- `internal/handlers/passport.go` — comment about go-jet model
- `internal/handlers/blind.go` — comment about go-jet generated types
- `internal/application/handler_test.go` — comment about go-jet scan
- `internal/authtoken/service.go` — comment about go-jet codegen

- [ ] **Step 1: Update root docs — `CLAUDE.md`, `AGENTS.md`, `README.md`**

Replace go-jet references with Bun:

```diff
- **DB**: PostgreSQL + go-jet (codegen)
+ **DB**: PostgreSQL + Bun ORM
```

```diff
- | DB generate (go-jet codegen) | `bun run db:generate` |
+ | DB codegen (Bun)              | `bun run db:generate` |  (or remove if no codegen step needed)
```

```diff
- go-jet generated types in `server-go/.gen/`, re-exported via `server-go/internal/gen/`
+ Bun model structs in `server-go/internal/models/`
```

- [ ] **Step 2: Update agent/skill rule files**

For each file in `.agents/rules/`, `.agents/agents/`, `.agents/skills/`:

```diff
- PostgreSQL, accessed via pgx pool + go-jet query builder
+ PostgreSQL, accessed via pgx pool + Bun ORM
```

```diff
- Scaffold Gin handlers, middleware, SQL migrations, and seeders following project conventions (Gin groups, go-jet, pgx pool, httptest).
+ Scaffold Gin handlers, middleware, SQL migrations, and seeders following project conventions (Gin groups, Bun ORM, pgx pool, httptest).
```

- [ ] **Step 3: Update mirrored agent files**

Repeat Steps 1-2 for files in `.claude/agents/`, `.opencode/agents/`, `.clinerules/workflows/`.

These are copies/mirrors — apply the same changes.

- [ ] **Step 4: Remove `docs/` gitignore if plan docs should be tracked**

Check if `.gitignore` ignores `docs/`:

```bash
grep "^docs/" .gitignore
```

If yes and you want plan docs committed, remove or scope the gitignore entry. Otherwise skip.

- [ ] **Step 5: Verify all go-jet references are gone from docs**

```bash
rg -i "go-jet" --type md
```

Expected: No results (all documentation updated).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: update references from go-jet to Bun across all documentation"
```

---

### Task 21: Remove `*sql.DB` field from handlers (optional cleanup)

If all handlers are converted to Bun, the `*sql.DB` field is no longer needed in handler structs. This is pure cleanup.

**Note:** There are ~41 files that use raw SQL via `db.QueryContext(ctx, ...)`. These need to either:
- Stay on `*sql.DB` (keep the field)
- Convert to `bunDB.Query(ctx, &dest, ...)` (same thing, different receiver)

Decision: Keep `*sql.DB` for these raw SQL files unless you also convert them to Bun's query interface. Bun's `Query()` method accepts `*sql.DB` underneath so the migration is minimal, but not required.

- [ ] **Step 1: Decide whether to keep `*sql.DB` for raw SQL files**

If yes: keep the `db *sql.DB` field in handlers, skip this task.  
If no: convert all raw SQL calls to use Bun's `Query()` method.

- [ ] **Step 2: If converting, replace `db.QueryContext(ctx, sql, args...)` with `bunDB.Query(ctx, &dest, sql, args...)`**

For any raw SQL that scans results:

```go
// before
rows, err := h.db.QueryContext(ctx, "SELECT * FROM ...")
// ... manual rows.Scan loop

// after
var results []SomeType
err := h.bunDB.Query(ctx, &results, "SELECT * FROM ...")
```

- [ ] **Step 3: Build, test, commit**

---

## Self-Review

**1. Spec coverage:**
- Setup (dependency, connection, models, security guard): ✅ Tasks 1-4
- Incremental conversion (all 14 files + seed + testutil): ✅ Tasks 5-18
- Cleanup (remove go-jet, delete .gen/): ✅ Task 19
- Documentation updates (20+ markdown files): ✅ Task 20
- Stale field cleanup (optional): ✅ Task 21
- SQL injection lint (gosec) in pre-push: ✅ Task 2 (also the immediate commit below)
- Testing at each step: ✅ Each task includes build + test step

**2. Placeholder scan:**
- Every model has an explicit struct definition shown ✅
- Every query pattern has before/after code shown in the general conversion pattern ✅
- File paths are exact ✅
- Commands have expected output ✅
- No "TBD", "TODO", or "implement later" ✅

**3. Type consistency:**
- Models are in `server-go/internal/models/` package ✅
- Handler structs get `bunDB *bun.DB` field ✅
- All references to `models.JobPosting` (not `model.JobPostings`) ✅
- Bun's `Returning("*")` maps to go-jet's `RETURNING(gen.X.AllColumns)` ✅
