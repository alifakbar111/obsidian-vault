# SkillPass ADK — 5-Layer Implementation Plan (opencode)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a tool-agnostic 5-layer Agent Development Kit (Memory, Skills, Hooks, Subagents, Distribution) in the SkillPass repo, wired for **opencode only**.

**Stack:** Go 1.26 + Gin + pgx/go-jet (server), React 19 + Vite 7 + Tailwind v4 + DaisyUI 5 (web), Biome (format/lint), Bun (orchestration), PostgreSQL, vitest.

**Architecture:** One tool-neutral source tree — `AGENTS.md` (entry) + `.agents/{rules,skills,agents,hooks}/` — plus thin opencode adapter (`opencode.json`, `.opencode/agents/`), plus git hooks (`lefthook.yml`) as the deterministic layer.

---

## Per-Task Cross-Reference

| Layer | What | opencode config | Portable source |
|-------|------|-----------------|-----------------|
| L1 | Memory | `opencode.json` `instructions` glob | `AGENTS.md` + `.agents/rules/` |
| L2 | Skills | reads `.agents/skills/` natively | `.agents/skills/<n>/SKILL.md` |
| L3 | Hooks | none needed (git hooks runtime) | `lefthook.yml` + `.agents/hooks/` |
| L4 | Subagents | `.opencode/agents/<role>.md` `mode: subagent` | `.agents/agents/<role>.md` |
| L5 | Distribution | committed files + `opencode.json` | `AGENTS.md` bootstrap section |

---

## Phase 1 — L1 Memory

### Task 1.1: Add ADK sections to `AGENTS.md`

**Files:** Modify: `AGENTS.md`

Current `AGENTS.md` (93 lines) has: stack summary, commands, monorepo layout, local startup flow, dev URLs, server conventions, frontend conventions, styling, DB docs, testing docs. These all stay unchanged.

Insert new sections after line 9 (after the stack summary line `- **Linter**: Biome (single binary, replaces ESLint + Prettier)` and before `## Monorepo layout`).

- [ ] **Step 1:** Insert the "Agent Dev Kit" section after line 9:

  ```markdown
  ## Agent Dev Kit

  - Rules: `.agents/rules/`  · Skills: `.agents/skills/`  · Agents: `.agents/agents/`
  - Deterministic checks: git hooks (`lefthook.yml`)

  ### Per-Tool Enablement (opencode)

  **Setup:**
  1. `bun add -D lefthook && bun run lefthook install` — install git hooks
  2. Skills auto-discovered from `.agents/skills/`
  3. Subagents in `.opencode/agents/` (`mode: subagent`)

  > `opencode.json` points to `AGENTS.md` and `.agents/rules/*.md` for instructions.
  ```

  Detailed content (commands, conventions, server/frontend/DB docs, testing, local startup) remains in the existing sections below.

### Task 1.2: Create focused rule docs under `.agents/rules/`

**Files:** Create: `.agents/rules/{commands,architecture,naming-and-structure,testing-and-tdd,code-style,database,security}.md`

- [ ] **Step 1 — `commands.md`:**

  ```markdown
  # Commands
  | Task | Command |
  |------|---------|
  | dev (server + web) | `bun run dev` |
  | dev server only | `bun run dev:server` |
  | dev web only | `bun run dev:web` |
  | test web | `bun --cwd web test` |
  | test server | `go test ./server-go/...` |
  | lint all | `bun run lint` |
  | lint + auto-fix | `bun run lint:fix` |
  | format all | `bun run format` |
  | format check | `bun run format:check` |
  | build web | `bun run build` |
  | db migrate | `bun run db:migrate` |
  | db seed | `bun run db:seed` |
  | db generate (go-jet codegen) | `bun run db:generate` |
  | docker full stack up | `bun run docker:up` |
  | docker full stack down | `bun run docker:down` |
  | typecheck web | `bun --cwd web typecheck` |
  ```

- [ ] **Step 2 — `architecture.md`:**

  ```markdown
  # Architecture
  - Monorepo: root orchestration (`bun run dev` via concurrently), `server-go/` (Go), `web/` (React/Vite)
  - API: Gin groups at `/api/v1/...`, JWT auth via `internal/middleware/auth.go`
  - DB: pgx connection pool (`internal/db/db.go`), go-jet query builder + raw SQL migrations
  - Frontend: React 19 SPA (not Next.js), React Router v7 client-side routing
  - go-jet generated types in `server-go/.gen/`, re-exported via `server-go/internal/gen/`
  ```

- [ ] **Step 3 — `naming-and-structure.md`:**

  ```markdown
  # Naming & Structure
  - Go files: `snake_case.go` in feature packages under `server-go/internal/`
  - React files: `PascalCase.tsx` for components, `camelCase.ts` for hooks/lib
  - Go structs: PascalCase with JSON tags (`json:"camelCase"`)
  - Frontend path alias: `@/*` → `web/src/*`
  - DB tables: `snake_case`, generated as PascalCase by go-jet
  ```

- [ ] **Step 4 — `testing-and-tdd.md`:**

  ```markdown
  # Testing & TDD
  - Web: vitest with happy-dom + @testing-library/react
  - Server: Go `testing` package with `httptest`
  - No tests written yet — prefer TDD for new features
  - Run tests: `bun --cwd web test` (web) or `go test ./server-go/...` (server)
  ```

- [ ] **Step 5 — `code-style.md`:**

  ```markdown
  # Code Style
  - Formatting: Biome (single binary, replaces ESLint + Prettier)
  - Minimal comments — explain WHY, not WHAT
  - Go: camelCase JSON responses, use gin.H for simple responses
  - Frontend: functional components with hooks, use `api()` wrapper for all authenticated requests
  - Import order: standard lib → third-party → internal (Go); react → third-party → @/ (frontend)
  ```

- [ ] **Step 6 — `database.md`:**

  ```markdown
  # Database
  - PostgreSQL, accessed via pgx pool + go-jet query builder
  - Raw SQL migrations in `server-go/migrations/` (run via `bun run db:migrate`)
  - go-jet codegen: `bun run db:generate` (requires live DB)
  - Generated types in `server-go/.gen/`, re-exported via `server-go/internal/gen/`
  - Always run `db:migrate` then `db:generate` after schema changes
  ```

- [ ] **Step 7 — `security.md`:**

  ```markdown
  # Security
  - JWT auth: Bearer token, parsed by `AuthRequired(jwtSecret)` middleware — sets `userId` + `role` in context
  - Role guards: `RequireRole("company")` + `RequireVerifiedCompany(pool)` middleware
  - Password hashing: bcrypt (default cost 4 for dev) + argon2id fallback via `internal/lib/password.go`
  - Config from `.env`: `JWT_SECRET`, `DATABASE_URL`, `PORT`, `CORS_ORIGIN`
  - All API responses use camelCase (no accidental schema leakage)
  ```

### Task 1.3: Wire opencode adapter

**Files:** Create: `opencode.json`

- [ ] **Step 1:** Create `opencode.json`:

  ```json
  {
    "$schema": "https://opencode.ai/config.json",
    "instructions": ["AGENTS.md", ".agents/rules/*.md"]
  }
  ```

---

## Phase 2 — L2 Skills

### Task 2.1: No changes needed

The existing 23 skills in `.agents/skills/` have proper `SKILL.md` frontmatter with `name` and `description`. opencode reads `.agents/skills/` natively. All skills are discoverable as-is.

---

## Phase 3 — L3 Hooks (Deterministic via git hooks)

### Task 3.1: Install lefthook + create config

**Files:** Create: `lefthook.yml`

- [ ] **Step 1:** Install lefthook:

  ```bash
  bun add -D lefthook && bun run lefthook install
  ```

- [ ] **Step 2:** Create `lefthook.yml`:

  ```yaml
  pre-commit:
    commands:
      lint-and-format:
        run: bun run lint:fix
        stage_fixed: true

  pre-push:
    commands:
      test-web:
        run: bun --cwd web test
      test-server:
        run: go test ./server-go/...
  ```

  `bun run lint:fix` runs `biome check --write --unsafe .` which covers both formatting and linting in one pass.

- [ ] **Step 3 — Verify:** Make a deliberately mis-formatted file → `git commit` → hook auto-fixes and stages the changes. Check pre-push by running `git push` (or simulate with `lefthook run pre-push`).

---

## Phase 4 — L4 Subagents

### Task 4.1: Create neutral role definitions in `.agents/agents/`

**Files:** Create: `.agents/agents/{code-reviewer,test-runner,go-scaffolder,react-scaffolder,db-migration,security-auditor}.md`

- [ ] **Step 1 — `code-reviewer.md`:**

  ```markdown
  ---
  name: code-reviewer
  description: "Review code diffs before merge for N+1 queries, injection, missing edge cases, auth bypass"
  tools: read-only
  ---
  # Code Reviewer
  - Reads the diff/branch
  - Checks: N+1 queries, injection risks, missing edge cases, error handling gaps, auth bypass
  - Returns: list of findings with severity (blocker/critical/warning/info), confidence (high/medium/low), and suggested fix
  ```

- [ ] **Step 2 — `test-runner.md`:**

  ```markdown
  ---
  name: test-runner
  description: "Run web (vitest) or server (Go test) tests and report failures with file:line and root cause"
  tools: read-only
  ---
  # Test Runner
  - Runs `bun --cwd web test` (web) and/or `go test ./server-go/...` (server) as appropriate
  - On failure: extracts failing test names, error messages, and stack traces
  - Returns: pass/fail summary, list of failures with file:line + error, suggested root cause
  - Does NOT fix code — only reports findings
  ```

- [ ] **Step 3 — `go-scaffolder.md`:**

  ```markdown
  ---
  name: go-scaffolder
  description: "Scaffold Gin handlers, middleware, SQL migrations, seeders — follows go-jet + pgx conventions"
  tools: read-write
  ---
  # Go Scaffolder
  - Creates files in `server-go/internal/handlers/`, `server-go/internal/middleware/`, or `server-go/migrations/`
  - Follows: Gin groups, go-jet query patterns, pgx pool conventions
  - Creates corresponding test file (`handler_test.go`) with httptest setup
  - Returns: path to created files, summary of what was scaffolded
  ```

- [ ] **Step 4 — `react-scaffolder.md`:**

  ```markdown
  ---
  name: react-scaffolder
  description: "Scaffold React components, pages, hooks, API modules — uses api() wrapper, @/* alias, vitest tests"
  tools: read-write
  ---
  # React Scaffolder
  - Creates files in `web/src/components/`, `web/src/pages/`, `web/src/hooks/`, or `web/src/lib/`
  - Uses: functional components, proper hooks, `api()` wrapper for API calls, path alias `@/*`
  - Creates corresponding test file with vitest + @testing-library/react
  - Returns: path to created files, component interface summary
  ```

- [ ] **Step 5 — `db-migration.md`:**

  ```markdown
  ---
  name: db-migration
  description: "Create timestamped SQL migration files and trigger go-jet codegen"
  tools: read-write
  ---
  # DB Migration
  - Creates new timestamped SQL file in `server-go/migrations/`
  - Migration naming: `YYYYMMDDHHMMSS_<description>.sql`
  - Reminds to run: `bun run db:migrate && bun run db:generate` after creation
  - Returns: migration file path, summary of schema changes
  ```

- [ ] **Step 6 — `security-auditor.md`:**

  ```markdown
  ---
  name: security-auditor
  description: "Audit code for JWT issues, SQL injection, auth bypass, password hashing, CORS, secret leakage"
  tools: read-only
  ---
  # Security Auditor
  - Reviews: JWT handling, role guards, SQL injection paths, password hashing, CORS config, env var leakage
  - Checks: middleware ordering, error message verbosity, rate limiting gaps
  - Returns: findings grouped by severity (critical/high/medium/low) with file:line and remediation advice
  ```

### Task 4.2: Wire opencode adapters

**Files:** Create: `.opencode/agents/{code-reviewer,test-runner,go-scaffolder,react-scaffolder,db-migration,security-auditor}.md`

- [ ] **Step 1:** Copy each `.agents/agents/<role>.md` → `.opencode/agents/<role>.md`, adding `mode: subagent` to frontmatter:

  ```markdown
  ---
  name: code-reviewer
  description: "Review code diffs before merge for N+1 queries, injection, missing edge cases, auth bypass"
  mode: subagent
  tools: read-only
  ---
  ```

  Repeat for all 6 roles.

---

## Phase 5 — L5 Distribution

### Task 5.1: Add bootstrap section to `AGENTS.md`

Already included in Task 1.1 (the "Agent Dev Kit" + "Per-Tool Enablement" sections).

### Task 5.2: Commit the kit

- [ ] **Step 1:** Stage all new/modified files:

  ```bash
  git add AGENTS.md opencode.json lefthook.yml \
         .agents/rules/ .agents/agents/ .opencode/agents/
  ```

- [ ] **Step 2:** Commit:

  ```bash
  git commit -m "chore(adk): add 5-layer agent development kit for opencode

  - L1 Memory: AGENTS.md + .agents/rules/ (7 rule files) + opencode.json
  - L2 Skills: 23 portable skills in .agents/skills/ (no changes)
  - L3 Hooks: lefthook.yml (pre-commit: auto-fix lint+format, pre-push: test)
  - L4 Subagents: 6 roles in .agents/agents/ + .opencode/agents/ adapters
  - L5 Distribution: bootstrap docs in AGENTS.md"
  ```

---

## End-to-End Verification

- [ ] Open opencode in repo — confirm it loads `AGENTS.md` + `.agents/rules/*.md` (ask "what are this repo's commands?" — should match commands table)
- [ ] List skills in opencode — should show all 23 skills (ask "list available skills")
- [ ] Invoke one subagent (e.g., `/code-reviewer`) — confirm it runs and returns findings
- [ ] Make a commit — confirm lefthook auto-fixes format/lint and stages changes
- [ ] Run `lefthook run pre-push` — confirm tests execute (web + server)
- [ ] Fresh `git clone` → open in opencode → kit is active with only `AGENTS.md`-documented setup

---

## Files Changed Summary

| Layer | Action | Path |
|-------|--------|------|
| L1 | **Modify** | `AGENTS.md` |
| L1 | **Create** | `opencode.json` |
| L1 | **Create** | `.agents/rules/commands.md` |
| L1 | **Create** | `.agents/rules/architecture.md` |
| L1 | **Create** | `.agents/rules/naming-and-structure.md` |
| L1 | **Create** | `.agents/rules/testing-and-tdd.md` |
| L1 | **Create** | `.agents/rules/code-style.md` |
| L1 | **Create** | `.agents/rules/database.md` |
| L1 | **Create** | `.agents/rules/security.md` |
| L3 | **Create** | `lefthook.yml` |
| L4 | **Create** | `.agents/agents/code-reviewer.md` |
| L4 | **Create** | `.agents/agents/test-runner.md` |
| L4 | **Create** | `.agents/agents/go-scaffolder.md` |
| L4 | **Create** | `.agents/agents/react-scaffolder.md` |
| L4 | **Create** | `.agents/agents/db-migration.md` |
| L4 | **Create** | `.agents/agents/security-auditor.md` |
| L4 | **Create** | `.opencode/agents/code-reviewer.md` |
| L4 | **Create** | `.opencode/agents/test-runner.md` |
| L4 | **Create** | `.opencode/agents/go-scaffolder.md` |
| L4 | **Create** | `.opencode/agents/react-scaffolder.md` |
| L4 | **Create** | `.opencode/agents/db-migration.md` |
| L4 | **Create** | `.opencode/agents/security-auditor.md` |

**Total: 1 modified + 21 new files**
