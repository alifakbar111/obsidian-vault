# Code Review — SkillPass Agent Infrastructure

**Date:** 2026-06-09
**Scope:** Agent orchestration infrastructure — `.claude/agents/`, `.agents/agents/`, `.opencode/agents/`, `CLAUDE.md`, `package.json`
**Commits reviewed:** `f9ddffb`..`f3fe679` (5 commits)
**Verdict at a glance:** **Request Changes** — 4 medium-severity correctness issues (runtime breakage, naming inconsistency, path divergence, tool name divergence), 3 low-severity items. No critical or high findings. Package dependency bumps are benign.

---

## Findings

### 🔴 Critical
*None.*

### 🟠 High
*None.*

### 🟡 Medium

| # | File:Line | Issue |
|---|---|---|
| 1 | `.opencode/agents/test-runner.md:10`, `.agents/agents/test-runner.md:10` | Wrong Go test command: `go test ./server-go/...` — should be `go -C server-go test ./...`. There is no Go module at the repo root; the monorepo pattern runs `go` from inside the module. This will silently find no tests or error at runtime. The `.claude/agents/test-runner.md` copy is correct. |
| 2 | `.claude/agents/db-migration.md`, `.agents/agents/db-migration.md`, `CLAUDE.md:200` | Three incompatible migration naming conventions: `YYYYMMDDHHMMSS_<name>.sql` (db-migration agents), `001_initial_schema.sql` (CLAUDE.md example), `000001_init.sql` (actual files on disk). Any new migration created by the agent will be inconsistently named. Standardize all references to `000006_<kebab-name>.sql` (next in sequence after existing `000005`). |
| 3 | `.agents/agents/agent-manager.md:20` | Registry scan path points to `.opencode/agents/` instead of `.agents/agents/`. When this copy is executed in a context that serves agents from `.agents/`, the scan resolves via the wrong path. Additionally, this copy is missing `model:` and `color:` frontmatter fields required for use as a `.claude/agents/` subagent. |
| 4 | `.claude/agents/agent-manager.md:103,111` vs `.opencode/agents/agent-manager.md`, `.agents/agents/agent-manager.md` | Dispatch tool name divergence: `.claude` copy instructs the orchestrator to use the `Agent` tool; the `.opencode`/`.agents` copies instruct it to use the `Task` tool. These are different API surfaces on different platforms. Copy/paste between environments will break silently with no error until the tool call fails. |

### 🟢 Low

| # | File:Line | Issue |
|---|---|---|
| 5 | `.claude/agents/agent-manager.md:113-121` | Keyword routing collision: `design` appears in both the `planner` row ("plan, design, approach") and the `ui-ux-designer` row ("ui, design, layout"). A request like "design the search flow" non-deterministically matches both agents. Remove `design` from the `planner` keyword row so `design` exclusively routes to `ui-ux-designer`. |
| 6 | `.claude/agents/bug-hunter.md:33` | Default branch resolved via `gh repo view` which requires an authenticated `gh` CLI and a GitHub remote. On GitLab/Bitbucket remotes or unauthenticated sessions, the subshell expansion fails silently and `git diff ...HEAD` runs with a malformed rev-spec — returning an empty diff and producing no findings. Add an explicit fallback: "If `gh` is unavailable, fall back to `git diff origin/main...HEAD`." |
| 7 | `CLAUDE.md:200` | Migration naming example (`001_initial_schema.sql`) does not match the actual convention used in `server-go/migrations/` (`000001_init.sql`). This is an independent documentation drift from finding #2 above, but tracked here so both `CLAUDE.md` updates are made together. |

---

## Package Dependencies

| Package | Change | Assessment |
|---|---|---|
| `@biomejs/biome` | `2.4.15` → `2.4.16` | Patch release, dev-only linter. No CVEs. Benign. |
| `concurrently` | `^9.1.0` → `^9.2.1` | Minor bump, dev-only process runner. No CVEs. Benign. |

---

## Priority Fixes

1. **Fix Go test command** in `.opencode/agents/test-runner.md` and `.agents/agents/test-runner.md` — runtime breakage, easy one-liner fix.
2. **Standardize migration naming** to `000NNN_<kebab>.sql` across `db-migration.md` (both copies) and `CLAUDE.md:200`.
3. **Fix registry scan path** in `.agents/agents/agent-manager.md` to read from `.agents/agents/` and add missing frontmatter.
4. **Document platform/tool target** at the top of each `agent-manager.md` copy to prevent future cross-platform confusion.
5. **Remove `design` keyword** from `planner` row in keyword routing table (low effort, high clarity gain).

---

## Verdict

**Request Changes.** Items #1 and #2 are runtime-breakage bugs that will produce wrong behavior the first time an agent creates a migration or runs Go tests. Items #3 and #4 are maintainability hazards that will cause silent failures when the files are copied across environments. The low items are polish and can be batched into the same fix PR.
