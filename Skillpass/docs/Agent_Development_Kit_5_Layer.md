# Tool-Agnostic 5-Layer ADK — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **This plan is executed INSIDE a target project that does NOT use Claude (opencode / Cline / other).** It is portable: the executing AI must FIRST detect that project's stack, tooling, and conventions (Phase 0), then derive each layer's content from what it found. Paths that are tool-standard (e.g. `AGENTS.md`, `.agents/skills/`, `lefthook.yml`, `.claude/`, `.opencode/`, `.clinerules/`) are given exactly; project-specific content (rule text, skill names, commands) is derived and is marked `‹derive›`.

**Goal:** Stand up a 5-layer Agent Development Kit (Memory, Skills, Hooks, Subagents, Distribution) in any repository, working across Claude Code, opencode, and Cline from a single source of truth.

**Architecture:** One **tool-neutral source tree** — `AGENTS.md` (universal entry) + `.agents/{rules,skills,agents,hooks}/` — that every tool reads, plus **thin per-tool adapters** only where a tool needs them, plus **git hooks (lefthook)** as the portable deterministic layer (no AI-tool hook runtime is shared across tools).

**Tech Stack:** Markdown + YAML; `lefthook` for git hooks; the target project's own runtime (Node/Python/Go/etc.) for any skill scripts; the config formats of whichever AI tools are in use.

---

## Cross-tool mapping (reference for every task)

| Layer | Claude Code | opencode | Cline | Portable choice |
|---|---|---|---|---|
| L1 Memory | `CLAUDE.md`, `.claude/rules/` | reads `AGENTS.md`; rule globs in `opencode.json` `instructions` | `.clinerules/` (all `.md` merged); reads `AGENTS.md` | **`AGENTS.md` + `.agents/rules/`** |
| L2 Skills | `.claude/skills/<n>/SKILL.md` | reads `.claude/`+`.agents/`+`.opencode/skills/` | reads `.claude/`+`.cline/`+`.clinerules/skills/` | **`.agents/skills/<n>/SKILL.md`** (all 3 read it) |
| L3 Hooks | shell in `.claude/settings.json` | JS plugins (`tool.execute.after`) | scripts in `.clinerules/hooks/` (macOS/Linux) | **git hooks via `lefthook.yml`** |
| L4 Subagents | `.claude/agents/*.md` | `.opencode/agents/*.md` (`mode: subagent`) | none declarative → **workflow** `/name` | neutral `.agents/agents/*.md` + adapters |
| L5 Distribution | `.claude-plugin/`+`marketplace.json` | `.opencode/plugins/`+npm `plugin` | committed files only | **git repo + `AGENTS.md` bootstrap** |

Target source tree this plan produces:

```
AGENTS.md
.agents/{rules,skills,agents,hooks}/
lefthook.yml
# adapters, only for tools actually in use:
.claude/   .opencode/   .clinerules/
```

---

## Phase 0 — Detect the project (re-learn; assume nothing)

### Task 0.1: Identify the AI tool(s) in use
**Files:** none (investigation)
- [ ] **Step 1:** Check for tool fingerprints. Run:
  ```bash
  ls -a; ls -a .claude .opencode .clinerules 2>/dev/null; cat opencode.json 2>/dev/null | head
  ```
- [ ] **Step 2:** If ambiguous, ask the user which tools the team uses. Record the set as
  `TOOLS` (subset of `claude`, `opencode`, `cline`). Only these get adapter folders.

### Task 0.2: Detect stack & package manager
**Files:** none
- [ ] **Step 1:** Identify manifests. Run:
  ```bash
  ls package.json go.mod pyproject.toml Cargo.toml pom.xml build.gradle 2>/dev/null
  ```
- [ ] **Step 2:** Read the primary manifest; record language, framework, and package manager
  (npm/pnpm/yarn/bun, uv/poetry, go, cargo). Record as `‹stack›`.

### Task 0.3: Detect commands (dev/build/test/lint/format/codegen)
**Files:** none
- [ ] **Step 1:** Read manifest scripts + any task runner (`Makefile`, `moon.yml`, `nx.json`,
  `turbo.json`, `justfile`) and CI files (`.github/workflows/*`, `.gitlab-ci.yml`).
- [ ] **Step 2:** Record the EXACT commands for: dev, build, test, lint, format, typecheck, and any
  codegen (types, mocks, i18n, OpenAPI). Record as `‹cmds›`. These feed L1 rules + L3 hooks.

### Task 0.4: Detect conventions & structure
**Files:** none
- [ ] **Step 1:** Map the directory layout and how a "feature/module" is organized (sample 2–3
  existing features). Note file-naming casing, test location + framework, import/alias conventions.
- [ ] **Step 2:** Record as `‹conventions›`.

### Task 0.5: Read existing docs and confirm scope
**Files:** read `README*`, `CONTRIBUTING*`, existing `AGENTS.md`/`CLAUDE.md`/`.clinerules/`
- [ ] **Step 1:** Read them; reuse existing guidance rather than recreating it.
- [ ] **Step 2:** Present a short summary of `TOOLS`, `‹stack›`, `‹cmds›`, `‹conventions›` and the
  proposed layer scope to the user. **Wait for confirmation before Phase 1.**

---

## Phase 1 — L1 Memory (always do this)

### Task 1.1: Create the universal `AGENTS.md`
**Files:** Create/Modify: `AGENTS.md`
- [ ] **Step 1:** Write `AGENTS.md` at repo root using this skeleton (fill `‹…›` from Phase 0):
  ```markdown
  # AGENTS.md — ‹project name›

  ‹one-line stack summary›.

  > Detailed rules live in `.agents/rules/`. Skills, agents, and hooks are described in the
  > "Agent Dev Kit" section below. Every AI tool (Claude Code, opencode, Cline) reads this file.

  ## Commands
  - dev: `‹cmd›`  · build: `‹cmd›`  · test: `‹cmd›`  · lint: `‹cmd›`  · format: `‹cmd›`
  ‹+ codegen commands if any›

  ## Conventions
  ‹2–4 bullets: structure, naming, test location, imports — from Phase 0›

  ## Agent Dev Kit (where things live)
  - Rules: `.agents/rules/`  · Skills: `.agents/skills/`  · Agents: `.agents/agents/`
  - Deterministic checks run via git hooks (`lefthook.yml`).
  ```
- [ ] **Step 2:** Verify each tool in `TOOLS` reads it (opencode/Cline read `AGENTS.md` natively;
  for Claude, `AGENTS.md` is read and `CLAUDE.md` can symlink to it: `ln -s AGENTS.md CLAUDE.md`).

### Task 1.2: Create focused rule docs under `.agents/rules/`
**Files:** Create: `.agents/rules/{architecture,naming-and-structure,testing-and-tdd,commands,code-style}.md`
- [ ] **Step 1:** Create one `.md` per concern, content derived from Phase 0. Keep each focused.
  Example `.agents/rules/commands.md`:
  ```markdown
  # Commands
  | Task | Command |
  |------|---------|
  | dev | `‹cmd›` |
  | test | `‹cmd›` |
  | lint | `‹cmd›` |
  | format | `‹cmd›` |
  | codegen | `‹cmd›` (run after ‹trigger›) |
  ```
- [ ] **Step 2:** Only create rule files that the project actually warrants (YAGNI). Skip empties.

### Task 1.3: Wire per-tool memory adapters
**Files:** per tool in `TOOLS`
- [ ] **Step 1 (opencode):** ensure rules are loadable — add globs to `opencode.json`:
  ```json
  { "$schema": "https://opencode.ai/config.json",
    "instructions": ["AGENTS.md", ".agents/rules/*.md"] }
  ```
- [ ] **Step 2 (Cline):** make rules visible — either reference them from `AGENTS.md` (Cline reads
  it) or, if the team prefers Cline-native, copy/point them into `.clinerules/` (all `.md` merged).
- [ ] **Step 3 (Claude):** create `.claude/rules/` pointing at / mirroring `.agents/rules/`, or rely
  on `CLAUDE.md`→`AGENTS.md`.
- [ ] **Step 4 — Verify:** open the project in each tool; confirm it loads the rules (ask it "what
  are this repo's commands?" and check the answer matches `‹cmds›`).

---

## Phase 2 — L2 Skills (decide what's worth one)

### Task 2.1: Decide the skill list with the user
**Files:** none
- [ ] **Step 1:** Identify repetitive, codifiable workflows in this project (e.g. "scaffold a
  module", "add a migration", a project-specific codegen flow). Propose a short list; confirm.

### Task 2.2: Author each skill in `.agents/skills/`
**Files:** Create: `.agents/skills/‹name›/SKILL.md` (+ `templates/`, `scripts/` as needed)
- [ ] **Step 1:** For each skill, create `SKILL.md` with this exact frontmatter shape:
  ```markdown
  ---
  name: ‹kebab-name›
  description: ‹when to use it — this is what the AI matches against›
  ---
  # ‹Title›
  Steps the AI follows, referencing templates/scripts in this folder.
  ```
- [ ] **Step 2:** If the skill scaffolds files, add real `templates/` and a `scripts/` runner in the
  project's language; reference them from `SKILL.md`. No placeholder bodies.
- [ ] **Step 3 — Verify:** this single location is read by Claude, opencode, AND Cline — no
  per-tool copy needed. Confirm by listing skills in each tool in `TOOLS`.

### Task 2.3 (optional): Vendor general-purpose skills
**Files:** Create: `.agents/skills/{code-review,find-bugs,refactor,…}/` (copied)
- [ ] **Step 1:** If desired, copy in self-contained general skills (carry their LICENSE files).
- [ ] **Step 2:** Trim any non-applicable bundled reference files to keep the tree focused.

---

## Phase 3 — L3 Hooks (deterministic layer via git hooks)

### Task 3.1: Install lefthook
**Files:** Create: `lefthook.yml`
- [ ] **Step 1:** Install (pick the project's package manager), e.g. `pnpm add -D lefthook` /
  `go install` / `brew install lefthook`, then `lefthook install`.
- [ ] **Step 2:** Create `lefthook.yml` wiring the project's checks (fill `‹cmds›`):
  ```yaml
  pre-commit:
    parallel: true
    commands:
      format: { run: ‹format cmd on staged›, stage_fixed: true }
      lint:   { run: ‹lint cmd on staged› }
  pre-push:
    commands:
      test: { run: ‹test cmd› }
  ```
- [ ] **Step 3 — Verify:** `git commit` on a deliberately mis-formatted file → hook formats/blocks.

### Task 3.2: Add reusable hook scripts (if logic exceeds one-liners)
**Files:** Create: `.agents/hooks/‹name›` (executable)
- [ ] **Step 1:** Put non-trivial checks (codegen-refresh, consistency/parity guards) as scripts in
  `.agents/hooks/`, called from `lefthook.yml`. This keeps logic in one place.
- [ ] **Step 2 — Verify:** run the script directly on a sample input; confirm pass/fail behavior.

### Task 3.3 (optional): Native per-tool "on-edit" wrappers
**Files:** per tool — thin wrappers around `.agents/hooks/` scripts
- [ ] **Step 1 (Claude):** `.claude/settings.json` `PostToolUse` (matcher `Edit|MultiEdit|Write`)
  calling the same script. **(opencode):** a `.opencode/plugins/*.js` on `file.edited`.
  **(Cline):** `.clinerules/hooks/PostToolUse` executable (macOS/Linux only).
- [ ] **Step 2:** Keep them thin — they must call the SAME `.agents/hooks/` logic, never duplicate it.
  Note in `AGENTS.md` that git hooks are the source of truth; these are convenience only.

---

## Phase 4 — L4 Subagents (delegation roles)

### Task 4.1: Decide roles
**Files:** none
- [ ] **Step 1:** Pick roles that fit the stack (read-heavy audits make the best subagents):
  e.g. `test-runner`, `code-reviewer`, a stack-specific `scaffolder`. Confirm with user.

### Task 4.2: Author neutral role definitions
**Files:** Create: `.agents/agents/‹role›.md`
- [ ] **Step 1:** For each role write the neutral definition:
  ```markdown
  ---
  name: ‹role›
  description: ‹when to delegate to it›
  tools: ‹read-only or read+write as appropriate›
  ---
  Purpose, method (reference any skill it wraps), and the return contract (findings only / summary).
  ```

### Task 4.3: Wire per-tool adapters
**Files:** per tool in `TOOLS`
- [ ] **Step 1 (Claude):** copy to `.claude/agents/‹role›.md`.
- [ ] **Step 2 (opencode):** copy to `.opencode/agents/‹role›.md`, add frontmatter `mode: subagent`.
- [ ] **Step 3 (Cline):** Cline has **no declarative subagents** → create a workflow
  `.clinerules/workflows/‹role›.md` (the body is the role prompt), invoked as `/‹role›`.
- [ ] **Step 4 — Verify:** invoke each role in each tool; confirm it runs and returns the contract.

---

## Phase 5 — L5 Distribution (team gets it on clone)

### Task 5.1: Add the bootstrap section to `AGENTS.md`
**Files:** Modify: `AGENTS.md`
- [ ] **Step 1:** Add an "Agent Dev Kit — enabling per tool" section: how to install lefthook, that
  `.agents/skills/` is auto-read, and any tool-specific enable step. This is the portable "installer."

### Task 5.2: Commit the kit
**Files:** all created files
- [ ] **Step 1:** Stage and commit on a branch per the project's git convention:
  ```bash
  git add AGENTS.md .agents/ lefthook.yml .claude/ .opencode/ .clinerules/ opencode.json
  git commit -m "chore(adk): add tool-agnostic agent development kit"
  ```
  (Adjust the path list to the tools actually present.)

### Task 5.3 (optional): Tool-native distribution extras
**Files:** per tool
- [ ] **Step 1 (Claude):** add `.claude-plugin/plugin.json` + an in-repo `.claude-plugin/marketplace.json`
  for one-command install. **(opencode):** list any JS plugins in `opencode.json` `plugin`.
  **(Cline):** none — committed files are the distribution.

---

## Key principles for the executing AI
- **Re-learn, don't copy.** All content (stack, naming, skills, agents, commands) comes from the
  target project. This plan is the *method*.
- **`AGENTS.md` + `.agents/skills/` are the portability backbone** — unchanged across all three tools.
- **Determinism lives in git hooks** (lefthook), because no AI-tool hook runtime is shared.
- **YAGNI:** always do L1; add a skill/agent/hook only for a real, repeated need.
- **Confirm scope after Phase 0** before scaffolding.

## Verification (end-to-end, in the target project)
- [ ] Open the project in each tool in `TOOLS`; confirm it loads `AGENTS.md`/rules and lists skills.
- [ ] Trigger one skill and one subagent/workflow; confirm they run and return as specified.
- [ ] Make a commit; confirm lefthook runs format/lint (and pre-push runs tests).
- [ ] Fresh `git clone` → open in a tool → kit is active with only the `AGENTS.md`-documented setup.

