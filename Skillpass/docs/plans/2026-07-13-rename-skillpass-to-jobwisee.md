# Rename SkillPass → JobWisee Implementation Plan

> **For agentic workers:** This plan MUST be executed by delegating each task to the appropriate agent(s) via the agent-manager. Do NOT implement tasks directly — route to existing agents (go-scaffolder, test-runner, bug-hunter, etc.) or the agent-manager for orchestration. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the entire monorepo from "SkillPass" to "JobWisee" — module names, database names, brand text, file paths, Go imports, and agent configurations — matching the domain `jobwisee.com`.

**Architecture:** Eight sequential phases, each with a clear boundary and verifiable outputs. Phases 1–4 are simple find-and-replace across config, Go imports, Go brand text, and frontend brand text. Phase 5 handles the database and go-jet codegen regeneration (the most delicate step). Phases 6–7 update agent/rule files and design docs. Phase 8 offers optional historical doc cleanup. Every phase includes a verification command.

**Tech Stack:** Go 1.26 (Gin), go-jet codegen, React 19 + Vite 7, PostgreSQL 16, Docker Compose, Biome, Lefthook

---

## Rename Mapping Reference

| Pattern | Old | New |
|---------|-----|-----|
| Go module name | `skillpass-server-go` | `jobwisee-server-go` |
| Go import path schema | `.gen/skillpass/public/` | `.gen/jobwisee/public/` |
| DB name | `skillpass` | `jobwisee` |
| Test DB | `skillpass_test` | `jobwisee_test` |
| Test DB env var | `SKILLPASS_TEST_DATABASE_URL` | `JOBWISEE_TEST_DATABASE_URL` |
| Brand text (PascalCase) | `SkillPass` | `JobWisee` |
| Brand text (lowercase) | `skillpass` | `jobwisee` |
| Binary names | `skillpass-server`, `skillpass-migrate`, `skillpass-seed` | `jobwisee-server`, `jobwisee-migrate`, `jobwisee-seed` |
| Email domain | `skillpass.com`, `skillpass.local`, `skillpass.app` | `jobwisee.com` |
| JWT secret | `skillpass-dev-secret` | `jobwisee-dev-secret` |
| Webhook header | `X-SkillPass-Signature` | `X-JobWisee-Signature` |
| DID prefix | `did:skillpass:local:` | `did:jobwisee:local:` |
| MIME boundary | `skillpass-mime-boundary` | `jobwisee-mime-boundary` |
| npm package names | `skillpass` (root), `skillpass-web` | `jobwisee` (root), `jobwisee-web` |
| Python project name | `skillpass` | `jobwisee` |
| Project ref in config | `"project": "skillpass"` | `"project": "jobwisee"` |
| Virtual env prompt | `skillpass` | `jobwisee` |

---

## Prerequisites

Before starting, ensure a clean Git state:

```bash
git status
git log --oneline -5
```
Expected: working tree clean, no staged/unstaged changes.

---

## Phase 1 — Config Files (9 files)

**Complexity:** Simple find-and-replace (trivial)
**Dependency:** None (start here)
**Files:** `package.json`, `server-go/go.mod`, `server-go/.env`, `server-go/.env.example`, `server-go/Dockerfile`, `docker-compose.yml`, `web/package.json`, `pyproject.toml`, `.mimocode/config.json`, `run.bat`

### Task 1.1: Root package.json

**File:** `package.json`

- [ ] Change `"name": "skillpass"` → `"name": "jobwisee"`
- [ ] Change `"build:server": "... go build -o ../skillpass ./cmd/server"` → `../jobwisee`
- [ ] Change `"start": "./skillpass"` → `"./jobwisee"`
- [ ] Change DB DSN in `db:generate` from `/skillpass?` → `/jobwisee?`
- [ ] Change `BUILD_SCRIPT=..."` if present

```bash
# Use sed for all changes or edit manually
sed -i 's/"name": "skillpass"/"name": "jobwisee"/' package.json
sed -i 's/-o \.\.\/skillpass/-o \.\.\/jobwisee/' package.json
sed -i 's|"start": "./skillpass"|"start": "./jobwisee"|' package.json
sed -i 's|/skillpass?|/jobwisee?|' package.json
```

### Task 1.2: server-go/go.mod

**File:** `server-go/go.mod`

- [ ] Change `module skillpass-server-go` → `module jobwisee-server-go`

```bash
sed -i 's/module skillpass-server-go/module jobwisee-server-go/' server-go/go.mod
```

### Task 1.3: .env and .env.example

**Files:** `server-go/.env`, `server-go/.env.example`

- [ ] Replace all occurrences:
  - `skillpass-dev-secret` → `jobwisee-dev-secret`
  - `admin@skillpass.com` → `admin@jobwisee.com`
  - `no-reply@skillpass.local` → `no-reply@jobwisee.local`
  - `/skillpass` (in DATABASE_URL) → `/jobwisee`

```bash
sed -i 's|/skillpass|/jobwisee|g' server-go/.env server-go/.env.example
sed -i 's/skillpass-dev-secret/jobwisee-dev-secret/g' server-go/.env server-go/.env.example
sed -i 's/admin@skillpass\.com/admin@jobwisee.com/g' server-go/.env server-go/.env.example
sed -i 's/no-reply@skillpass\.local/no-reply@jobwisee.local/g' server-go/.env server-go/.env.example
```

**Note:** The `.env` file currently has `DATABASE_URL` pointing to a Neon cloud DB. Also update the POSTGRES_DB reference in the comment if present, but the actual connection string host is unchanged.

### Task 1.4: server-go/Dockerfile

**File:** `server-go/Dockerfile`

- [ ] Change binary outputs: `/skillpass-server` → `/jobwisee-server`, `/skillpass-migrate` → `/jobwisee-migrate`, `/skillpass-seed` → `/jobwisee-seed`
- [ ] Change COPY lines: copy new binary names
- [ ] Change CMD: `./skillpass-server` → `./jobwisee-server`

```bash
sed -i 's|/skillpass-server|/jobwisee-server|g' server-go/Dockerfile
sed -i 's|/skillpass-migrate|/jobwisee-migrate|g' server-go/Dockerfile
sed -i 's|/skillpass-seed|/jobwisee-seed|g' server-go/Dockerfile
```

### Task 1.5: docker-compose.yml

**File:** `docker-compose.yml`

- [ ] `POSTGRES_DB: skillpass` → `POSTGRES_DB: jobwisee`
- [ ] `DATABASE_URL: .../skillpass` → `.../jobwisee`
- [ ] `ADMIN_EMAIL: admin@skillpass.com` → `admin@jobwisee.com`
- [ ] `JWT_SECRET: skillpass-dev-secret` → `jobwisee-dev-secret`
- [ ] Binary commands: `./skillpass-migrate` → `./jobwisee-migrate`, `./skillpass-seed` → `./jobwisee-seed`

```bash
sed -i 's|POSTGRES_DB: skillpass|POSTGRES_DB: jobwisee|g' docker-compose.yml
sed -i 's|/skillpass|/jobwisee|g' docker-compose.yml
sed -i 's|ADMIN_EMAIL: admin@skillpass.com|ADMIN_EMAIL: admin@jobwisee.com|g' docker-compose.yml
sed -i 's|JWT_SECRET: skillpass-dev-secret|JWT_SECRET: jobwisee-dev-secret|g' docker-compose.yml
sed -i 's|./skillpass-migrate|./jobwisee-migrate|g' docker-compose.yml
sed -i 's|./skillpass-seed|./jobwisee-seed|g' docker-compose.yml
```

### Task 1.6: web/package.json

**File:** `web/package.json`

- [ ] `"name": "skillpass-web"` → `"name": "jobwisee-web"`

```bash
sed -i 's/"name": "skillpass-web"/"name": "jobwisee-web"/' web/package.json
```

### Task 1.7: pyproject.toml

**File:** `pyproject.toml`

- [ ] `name = "skillpass"` → `name = "jobwisee"`
- [ ] Update description if it references "Skillpass"

```bash
sed -i 's/name = "skillpass"/name = "jobwisee"/' pyproject.toml
sed -i 's/Skillpass/JobWisee/g' pyproject.toml
```

### Task 1.8: .mimocode/config.json

**File:** `.mimocode/config.json`

- [ ] `"project": "skillpass"` → `"project": "jobwisee"`

```bash
sed -i 's/"project": "skillpass"/"project": "jobwisee"/' .mimocode/config.json
```

### Task 1.9: run.bat

**File:** `run.bat`

- [ ] `SkillPass Dev Launcher` → `JobWisee Dev Launcher`

```bash
sed -i 's/SkillPass Dev Launcher/JobWisee Dev Launcher/' run.bat
```

### Task 1.10: Verify Phase 1

Run a scan to confirm no remaining old config values:

```bash
rg -rn "skillpass" package.json server-go/go.mod server-go/.env server-go/.env.example server-go/Dockerfile docker-compose.yml web/package.json pyproject.toml .mimocode/config.json run.bat
```

Expected: no matches (empty output).

---

## Phase 2 — Go Import Paths (~75 .go files)

**Complexity:** Simple find-and-replace across many files (bulk sed)
**Dependency:** Phase 1.2 (go.mod module rename) must be done first
**Files:** All `.go` files under `server-go/` that import from the old module path

### Task 2.1: Bulk rename module imports

This changes ALL Go import paths from `"skillpass-server-go/..."` → `"jobwisee-server-go/..."` AND `"skillpass-server-go/.gen/skillpass/..."` → `"jobwisee-server-go/.gen/jobwisee/..."`.

```bash
# Replace all import paths in Go files
find server-go -name "*.go" -exec sed -i 's|skillpass-server-go|jobwisee-server-go|g' {} \;
```

This single command handles:
- All `import "skillpass-server-go/internal/..."` references in handlers, middleware, services, tests
- All `import "skillpass-server-go/.gen/skillpass/public/model"` references in handlers, services, middleware
- All `import "skillpass-server-go/.gen/skillpass/public/table"`, `.../public/enum` references
- All `import "skillpass-server-go/docs"` references
- All `import "skillpass-server-go/internal/gen"` references
- All `import "skillpass-server-go/internal/testutil"` references in test files
- The `go:generate` directives in `internal/gen/*.go` (DSN reference to skillpass DB)

After this command, imports will read `jobwisee-server-go/...`

### Task 2.2: Also fix the .gen directory path inside imports

The sed above changes the module prefix. But we also need to change the `.gen/skillpass/` directory segment to `.gen/jobwisee/` inside the import paths:

```bash
find server-go -name "*.go" -exec sed -i 's|\.gen/skillpass/|\.gen/jobwisee/|g' {} \;
```

This handles imports like:
- `jobwisee-server-go/.gen/jobwisee/public/model` (now correctly points to new .gen dir)
- `jobwisee-server-go/.gen/jobwisee/public/table`
- `jobwisee-server-go/.gen/jobwisee/public/enum`

### Task 2.3: Fix go:generate directives in internal/gen/*.go

**Files:** `server-go/internal/gen/gen.go`, `server-go/internal/gen/model.go`, `server-go/internal/gen/table.go`, `server-go/internal/gen/enum.go`

The `go:generate` comments reference `dsn=.../skillpass?` — change to `.../jobwisee?`:

```bash
find server-go/internal/gen -name "*.go" -exec sed -i 's|/skillpass?|/jobwisee?|g' {} \;
```

### Task 2.4: Verify Phase 2

Check no file still imports from old paths:

```bash
rg -rn "skillpass-server-go" server-go/ --include "*.go"
rg -rn "\"skillpass" server-go/ --include "*.go"
```

Expected: no matches from both commands.

---

## Phase 3 — Go Brand Text (12+ files)

**Complexity:** Simple find-and-replace (trivial)
**Dependency:** Phase 2 (to avoid nested changes)
**Files:** Go files with "SkillPass", "skillpass", "skillpass-dev-secret", "skillpass.com", "skillpass.local", "skillpass.app", "X-SkillPass-Signature", "did:skillpass:local:", "skillpass-mime-boundary" brand text

### Task 3.1: Rename PascalCase brand text in Go source

Files with `SkillPass` brand text:
- `server-go/cmd/server/main.go` — swagger @title, @description (lines 1, 3, 5, 7)
- `server-go/internal/handlers/passport_og.go` — og:site_name, title, description (lines 22, 64, 66, 68)
- `server-go/internal/email/templates.go` — email templates (lines 29, 34, 63, 64, 76, 79)
- `server-go/internal/webhook/service.go` — X-SkillPass-Signature (line 247)
- `server-go/internal/webhook/handler.go` — X-SkillPass-Signature in swagger comment (line 56)
- `server-go/internal/webhook/service_test.go` — X-SkillPass-Signature in test (line 105)
- `server-go/internal/spdid/service.go` — "did:skillpass:local:" (line 35)
- `server-go/internal/email/sender.go` — "skillpass-mime-boundary" (line 96), "skillpass.local" (lines 52, 68)
- `server-go/internal/email/resend.go` — "skillpass.local" (lines 25, 29)
- `server-go/internal/email/sender_test.go` — "skillpass.app", "skillpass.com" (lines 77, 79)
- `server-go/internal/email/resend_test.go` — "skillpass.com" (lines 96, 102, 154, 191)

```bash
# PascalCase brand text
find server-go -name "*.go" -exec sed -i 's/SkillPass/JobWisee/g' {} \;

# Domain names in email addresses
find server-go -name "*.go" -exec sed -i 's/skillpass\.com/jobwisee.com/g' {} \;
find server-go -name "*.go" -exec sed -i 's/skillpass\.local/jobwisee.local/g' {} \;
find server-go -name "*.go" -exec sed -i 's/skillpass\.app/jobwisee.app/g' {} \;

# Webhook signature header
find server-go -name "*.go" -exec sed -i 's/X-SkillPass-Signature/X-JobWisee-Signature/g' {} \;

# DID prefix
find server-go -name "*.go" -exec sed -i 's/did:skillpass:local:/did:jobwisee:local:/g' {} \;

# MIME boundary
find server-go -name "*.go" -exec sed -i 's/skillpass-mime-boundary/jobwisee-mime-boundary/g' {} \;

# Lowercase brand text (careful — match whole words, not partials in URLs/imports)
find server-go -name "*.go" -exec sed -i 's/\bskillpass\b/jobwisee/g' {} \;
```

**IMPORTANT:** The last `\bskillpass\b` sed should be checked — it might match things inside longer strings. Run `rg -rn "skillpass" server-go --include "*.go"` after to confirm no remaining lowercase instances that should have been changed.

### Task 3.2: Fix server-go/docs/docs.go (generated swagger)

**File:** `server-go/docs/docs.go`

This file is auto-generated by swag. It contains:
- `Title: "SkillPass API"` (line 5086)
- `Description: "SkillPass — skills-based hiring platform API"` (line 5087)
- `X-SkillPass-Signature` reference (line 1435)

The sed commands from Task 3.1 will catch this file too. Verify:

```bash
rg "SkillPass|skillpass" server-go/docs/docs.go
```

Expected: no matches (will be regenerated in Phase 5 anyway).

### Task 3.3: Fix test DB references

**Files:** `server-go/internal/testutil/db.go`, `server-go/internal/testutil/testcontainer.go`

- `SKILLPASS_TEST_DATABASE_URL` → `JOBWISEE_TEST_DATABASE_URL`
- `skillpass_test` → `jobwisee_test`

```bash
sed -i 's/SKILLPASS_TEST_DATABASE_URL/JOBWISEE_TEST_DATABASE_URL/g' server-go/internal/testutil/db.go server-go/internal/testutil/testcontainer.go
sed -i 's/skillpass_test/jobwisee_test/g' server-go/internal/testutil/db.go server-go/internal/testutil/testcontainer.go
```

### Task 3.4: Fix seed constants in cmd/seed

Check if any seed files reference brand text:

```bash
rg -rn "skillpass\|SkillPass" server-go/cmd/ server-go/internal/handlers/company*.go 2>/dev/null
```

If found, apply the same `sed` patterns.

### Task 3.5: Verify Phase 3

```bash
rg -rn "skillpass\|SkillPass\|skillpass\.\|skillpass-\|X-SkillPass\|did:skillpass" server-go/ --include "*.go"
```

Expected: no matches.

---

## Phase 4 — Frontend Brand Text (8 files)

**Complexity:** Simple find-and-replace (trivial)
**Dependency:** Phase 1
**Files:** Web TSX/TS files with brand text

### Task 4.1: Bulk rename brand text in all frontend files

```bash
# PascalCase
find web/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/SkillPass/JobWisee/g'

# Lowercase (careful: match word boundary)
find web/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/skillpass/jobwisee/g'
```

Files affected:
- `web/index.html` — `<title>SkillPass — Your Career Passport</title>` → `JobWisee`, meta description
- `web/src/components/layout/Navbar.tsx` — brand link text
- `web/src/components/layout/Navbar.test.tsx` — `/skillpass/i` test text
- `web/src/components/layout/RootLayout.tsx` — footer `SkillPass — Build your career passport`
- `web/src/components/passport/SharePassport.tsx` — share text, document title, comment
- `web/src/components/onboarding/CompanyOnboarding.tsx` — "Get hiring on SkillPass"
- `web/src/pages/CompanyProfile/WebhooksSection.tsx` — X-SkillPass-Signature, placeholder text

### Task 4.2: Fix web/index.html title

The title should become something like `JobWisee — Your Career Passport`:

```bash
sed -i 's/SkillPass/JobWisee/g' web/index.html
```

### Task 4.3: Verify Phase 4

```bash
rg -rn "SkillPass\|skillpass\|X-SkillPass" web/ --include "*.tsx" --include "*.ts" --include "*.html"
```

Expected: no matches (except possibly in `web/src/lib/generated/` which will be regenerated later).

---

## Phase 5 — Database & Generated Code (delicate)

**Complexity:** High — requires DB operations and codegen regeneration
**Dependency:** Phases 1-4 (Go code must compile with new module paths before go-jet can generate)
**Verification:** `bun run test:server`, `bun run api:generate`

### Task 5.1: Rename .gen directory

Rename the go-jet generated code directory from `skillpass` to `jobwisee`:

```bash
mv server-go/.gen/skillpass server-go/.gen/jobwisee
```

Verify:
```bash
ls server-go/.gen/jobwisee/public/model/ | head -5
```
Expected: shows model files (e.g., users.go, companies.go)

### Task 5.2: Create new DB and seed it

We need a fresh `jobwisee` DB (the old `skillpass` DB still exists with its data). Run:

```bash
# Drop existing databases
docker compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS jobwisee;"
docker compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS jobwisee_test;"

# Create new databases
docker compose exec db psql -U postgres -c "CREATE DATABASE jobwisee;"
docker compose exec db psql -U postgres -c "CREATE DATABASE jobwisee_test;"
```

Or, if Docker isn't running:
```bash
docker compose up db -d --wait
```

Then migrate and seed:
```bash
bun run db:migrate
bun run db:seed
```

Expected output:
```
MIGRATE 000001_init.sql
MIGRATE 000002_views.sql
...
✓ Seed complete
```

### Task 5.3: Regenerate go-jet codegen

Run codegen pointing to the new `jobwisee` database:

```bash
bun run db:generate
```

This runs: `cd server-go && jet -dsn=postgres://postgres:postgres@localhost:5432/jobwisee?sslmode=disable -schema=public -path=./.gen`

Expected output: go-jet generates files under `server-go/.gen/jobwisee/public/model/`, `table/`, `enum/`

Verify:
```bash
ls server-go/.gen/jobwisee/public/model/ | head -5
```

### Task 5.4: Verify Go compilation

```bash
go -C server-go build ./...
```

Expected: no compilation errors. If errors occur, they will likely be in `internal/gen/*.go` where the import path was already updated in Phase 2.

### Task 5.5: Run API generate (regenerate swagger + API types)

```bash
bun run api:generate
```

This regenerates:
- `server-go/docs/docs.go` — swagger spec with new "JobWisee API" title
- `server-go/docs/swagger.json`
- `web/src/lib/generated/openapi.json`
- `web/src/lib/generated/api.d.ts`

Verify no old brand text remains:
```bash
rg "SkillPass\|skillpass" server-go/docs/ web/src/lib/generated/
```

Only `JobWisee` expected.

### Task 5.6: Run Go tests

```bash
bun run test:server
```

Expected: all tests pass (auto-creates `jobwisee_test` DB if needed).

### Task 5.7: Run web typecheck

```bash
bun --cwd web typecheck
```

Expected: no type errors.

### Task 5.8: Run web build

```bash
bun run build
```

Expected: web builds successfully.

---

## Phase 6 — Agent/Rule Files (~20 files)

**Complexity:** Medium — many small files, manual review needed for agent descriptions
**Dependency:** None (can run in parallel with Phase 5)
**Files:** `.agents/`, `.claude/`, `.opencode/`, `.clinerules/` directories

### Task 6.1: Bulk rename in all agent/rule files

```bash
# PascalCase in all markdown and JSON files
find .agents .claude .opencode .clinerules -name "*.md" -o -name "*.json" 2>/dev/null | xargs sed -i 's/SkillPass/JobWisee/g' 2>/dev/null

# Lowercase (word-boundary safe)
find .agents .claude .opencode .clinerules -name "*.md" -o -name "*.json" 2>/dev/null | xargs sed -i 's/\bskillpass\b/jobwisee/g' 2>/dev/null

# Database-specific references (skillpass_test)
find .agents .claude .opencode .clinerules -name "*.md" -o -name "*.json" 2>/dev/null | xargs sed -i 's/skillpass_test/jobwisee_test/g' 2>/dev/null
```

Files that will be updated:
- `.agents/agents/*.md` (3 files: react-scaffolder, ui-ux-designer, test-runner)
- `.agents/rules/testing-and-tdd.md` — "skillpass_test DB"
- `.agents/skills/go-scaffold/SKILL.md` — "SkillPass conventions"
- `.agents/skills/db-migration/SKILL.md` — "SkillPass PostgreSQL database"
- `.claude/agents/*.md` (2+ files)
- `.clinerules/workflows/*.md` (3 files: react-scaffolder, ui-ux-designer, test-runner)
- `.clinerules/team-setup.md`
- `.opencode/agents/*.md` (3 files)

### Task 6.2: Verify Phase 6

```bash
rg -rn "SkillPass\|skillpass" .agents .claude .opencode .clinerules 2>/dev/null
```

Expected: zero matches.

---

## Phase 7 — Design & Top-Level Docs (6 files)

**Complexity:** Simple find-and-replace
**Dependency:** None (can run in parallel with Phases 5-6)

### Task 7.1: Update top-level documentation files

```bash
# PascalCase
sed -i 's/SkillPass/JobWisee/g' AGENTS.md CLAUDE.md README.md DESIGN.md

# Lowercase repo name references
sed -i 's/\bskillpass\b/jobwisee/g' AGENTS.md CLAUDE.md README.md DESIGN.md

# Database URLs
sed -i 's|/skillpass|/jobwisee|g' CLAUDE.md
sed -i 's/skillpass_test/jobwisee_test/g' CLAUDE.md AGENTS.md
```

### Task 7.2: Update design-tokens.json

```bash
sed -i 's/SkillPass/JobWisee/g' design-tokens.json
sed -i 's/\bskillpass\b/jobwisee/g' design-tokens.json
```

### Task 7.3: Verify Phase 7

```bash
rg -rn "SkillPass\|skillpass" AGENTS.md CLAUDE.md README.md DESIGN.md design-tokens.json
```

Expected: zero matches.

---

## Phase 8 — Historical Docs (optional, user-decides)

**Complexity:** Depends on count — bulk sed or skip
**Dependency:** None (can skip entirely)

The following directories contain 30+ files with "SkillPass" references:
- `docs/plans/` — 24 plan files
- `docs/specs/` — (if exists)
- `docs/research/` — 1 file
- `docs/code_review/` — 4 files
- `docs/security_issue/` — (if exists)
- `docs/bug_finding/` — 4 files
- `docs/` — any other files

These are **historical artifacts** — references to the old project name are contextually accurate for their time. Options:

- **Option A (recommended):** Leave as-is — these are dated records; the old name is historically correct.
- **Option B:** Bulk rename with explicit note about historical context.
- **Option C:** Only rename titles/first mentions but leave body text.

If user chooses Option B:

```bash
find docs -name "*.md" -exec sed -i 's/SkillPass/JobWisee/g' {} \;
find docs -name "*.md" -exec sed -i 's/\bskillpass\b/jobwisee/g' {} \;
find docs -name "*.md" -exec sed -i 's/skillpass_test/jobwisee_test/g' {} \;
```

---

## Full Verification Suite

After all phases are complete, run the full verification suite:

### Step 1: Search for any remaining old brand text

```bash
# Case-sensitive search
rg -rn "SkillPass" . --include "*.go" --include "*.tsx" --include "*.ts" --include "*.md" --include "*.json" --include "*.yml" --include "*.yaml" --include "*.html" --include "*.toml" --include "*.bat"
rg -rn "skillpass" . --include "*.go" --include "*.tsx" --include "*.ts" --include "*.md" --include "*.json" --include "*.yml" --include "*.yaml" --include "*.html" --include "*.toml" --include "*.bat"
```

Expected: no matches (except possibly historical docs if skipped).

### Step 2: Build all

```bash
go -C server-go build ./...
bun run build
```

Expected: both pass.

### Step 3: Run all tests

```bash
bun run test:server
bun --cwd web test
```

Expected: all tests pass.

### Step 4: API drift check

```bash
bun run api:check
```

Expected: no diff (or if there is diff, it's the intended rename diff which should be committed).

### Step 5: Typecheck

```bash
bun --cwd web typecheck
```

Expected: no type errors.

### Step 6: Format

```bash
bun run format
```

Expected: all files formatted correctly.

---

## Phase 9 — GitHub Repo Rename

**Complexity:** Trivial (GitHub UI + one git command)
**Dependency:** After all code changes are committed and pushed
**When to execute:** After Phases 1-7 are completed, committed, and pushed to origin

### Task 9.1: Rename repo on GitHub

1. Go to https://github.com/alifakbar111/skillpass/settings
2. Under "Repository Name", change `skillpass` → `jobwisee`
3. Click "Rename"

GitHub automatically sets up redirects — all existing links, issues, PRs, stars, and forks remain functional at the new URL.

### Task 9.2: Update local remote

```bash
git remote set-url origin git@github.com:alifakbar111/jobwisee.git
```

### Task 9.3: Verify

```bash
git remote -v
# Should show: origin  git@github.com:alifakbar111/jobwisee.git (fetch/push)
```

---

## Summary

| Phase | Files | Complexity | Est. Time | Verification |
|-------|-------|-----------|-----------|-------------|
| 1. Config | 10 | Trivial (sed) | 5 min | grep for old values |
| 2. Go imports | ~75 | Trivial (bulk sed) | 5 min | grep for old import paths |
| 3. Go brand text | 12+ | Trivial (bulk sed) | 5 min | grep for old brand strings |
| 4. Frontend brand text | 8 | Trivial (bulk sed) | 3 min | grep for old brand strings |
| 5. DB & codegen | dir rename + regen | **High** | 15 min | build + tests |
| 6. Agent/rule files | ~20 | Medium (manual review) | 10 min | grep for old strings |
| 7. Top-level docs | 6 | Trivial (sed) | 3 min | grep for old strings |
| 8. Historical docs | ~30+ | Optional (user choice) | 5 min | N/A |
| **9. GitHub rename** | repo settings | Trivial (UI) | 2 min | `git remote -v` |

Total estimated time: **~45-60 minutes** for phases 1-7 (excl. historical docs).

---

## Execution Handoff

**Plan complete and saved to `docs/plans/2026-07-13-rename-skillpass-to-jobwisee.md`.**

Two execution options:

1. **Agent-Driven (recommended)** — Route each phase to the appropriate agent via agent-manager or direct dispatch. One agent per phase, with review between phases.

2. **Inline Execution** — Execute all phases in this session, with checkpoint verification after each phase.

Which approach?
