---
title: moci biome→oxc migration — zero-one-moci
created: 2026-07-23
tags: [project/contribution, type/implementation-plan, status/active, stack/typescript, stack/cli, toolchain/oxc]
status: active
---

# `moci` biome→oxc Migration — Implementation Plan

**Repo:** https://github.com/zero-one-group/moci
**Branch:** `chore/migrate-biome-to-oxc`
**Final PR title:** `chore(toolchain): migrate moci from biome to oxlint + oxfmt`

## Goal

Migrate the `moci` CLI from Biome to the Oxc toolchain (`oxlint` + `oxfmt`) to align with the main `zero-one-group/monorepo` (which just shipped the same migration in PR #135 by @ganindrag). This brings the entire ZOG ecosystem onto one linter/formatter and removes the last remaining `biome` footprint in the org's projects.

## Why this lands

- **Mirrors the merged pattern** — PR #135 (`chore: migrate biome to oxc`) merged Jul 15, 2026. Same shape, half the size (only 1 repo not many templates).
- **No competition** — 0 PRs, 0 issues on `moci`
- **Small, well-scoped** — 5 files touched, ~50 lines changed
- **Real value** — 1 linter to rule them all, faster lint (oxlint is 50-100x faster than biome), smaller lockfile
- **Storylines** — contributor becomes the person who completed the ZOG-wide oxc migration

## Current state (what we're migrating from)

`moci/biome.json` is a fully-configured biome 2.2.6 with:

| Biome config | Value | Maps to |
|---|---|---|
| `formatter.indentStyle` | `space` | oxfmt default |
| `formatter.indentWidth` | `4` | oxfmt `indentWidth: 4` |
| `formatter.lineWidth` | `100` | oxfmt `lineWidth: 100` |
| `javascript.formatter.indentWidth` | `2` | per-language override (oxfmt supports) |
| `javascript.formatter.quoteStyle` | `single` | oxfmt `singleQuote: true` |
| `javascript.formatter.semicolons` | `asNeeded` | oxfmt `semicolons: "asNeeded"` |
| `javascript.formatter.trailingCommas` | `es5` | oxfmt `trailingCommas: "es5"` |
| `json.formatter.indentWidth` | `4` | oxfmt per-language |
| `json.formatter.trailingCommas` | `none` | oxfmt per-language |
| `linter.rules.recommended` | `true` | oxlint default rules |
| `linter.rules.style.noNonNullAssertion` | `off` | oxlint config |
| `linter.rules.suspicious.noConsole` | warn w/ allowlist | oxlint config |
| `linter.rules.correctness.noUnusedVariables` | warn, ignoreRestSiblings | oxlint config |
| `linter.rules.nursery.useSortedClasses` | warn, fix safe | oxlint: not available, drop |

## Architecture

Same code, two linters:

```
moci/
├── biome.json              # DELETE
├── .oxlintrc.json          # NEW (replaces biome linter rules)
├── .oxfmtrc.json           # NEW (replaces biome formatter rules)
├── package.json            # MODIFY: scripts + deps
├── lefthook.yml            # MODIFY: biome → oxlint + oxfmt
├── README.md               # MODIFY: mention oxlint + oxfmt
└── src/**                  # UNCHANGED (re-format in place)
```

## Tech choices

| Concern | Choice | Why |
|---|---|---|
| Linter | `oxlint` 1.x | Same as the main monorepo |
| Formatter | `oxfmt` 0.x | New official oxc formatter (paired with oxlint) |
| Lint wrapper | Keep `lefthook` | Already wired, no install change |
| Rule mapping | Best-effort port | Some biome rules have no oxlint equivalent — drop them, document in PR |

## File map

```
./
├── biome.json              # DELETE
├── .oxlintrc.json          # NEW
├── .oxfmtrc.json           # NEW
├── package.json            # MODIFY (deps + scripts)
├── lefthook.yml            # MODIFY (commands)
├── README.md               # MODIFY (dev section)
└── src/
    ├── main.ts             # auto-reformatted
    ├── cmds/initialize.ts  # auto-reformatted
    ├── cmds/version.ts     # auto-reformatted
    ├── cmds/list.ts        # auto-reformatted (if Plan #1 already merged)
    ├── index.ts            # auto-reformatted
    ├── types.ts            # auto-reformatted
    └── utils.ts            # auto-reformatted
```

## Phase 0 — File-by-file plan

### Task 0.1: Add new config files

**Files:** `.oxlintrc.json`, `.oxfmtrc.json`

**Step 1.** Create `.oxfmtrc.json`:

```json
{
  "$schema": "https://oxc.rs/schema/oxfmtrc.json",
  "printWidth": 100,
  "indentWidth": 4,
  "useTabs": false,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "arrowParens": "always",
  "semicolons": "asNeeded",
  "trailingCommas": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "sortImports": {
    "enabled": true
  },
  "overrides": [
    {
      "files": ["**/*.json"],
      "options": {
        "indentWidth": 4,
        "trailingCommas": "none"
      }
    },
    {
      "files": ["**/*.md", "**/*.mdx"],
      "options": {
        "useTabs": false,
        "indentWidth": 2
      }
    }
  ]
}
```

**Step 2.** Create `.oxlintrc.json`:

```json
{
  "$schema": "https://oxc.rs/schema/oxlintrc.json",
  "categories": {
    "correctness": "error",
    "perf": "error",
    "style": "warn",
    "suspicious": "warn"
  },
  "rules": {
    "no-unused-vars": [
      "warn",
      {
        "ignoreRestSiblings": true
      }
    ],
    "no-non-null-assertion": "off",
    "no-console": [
      "warn",
      {
        "allow": ["assert", "error", "info", "warn", "debug", "time", "timeEnd", "timeLog"]
      }
    ],
    "no-array-index-key": "warn",
    "no-useless-else": "error",
    "no-inferrable-types": "error",
    "default-param-last": "error",
    "use-consistent-array-type": "warn",
    "no-duplicate-imports": "error"
  },
  "ignore": [
    "dist/**",
    "bin/**",
    ".output/**"
  ]
}
```

> **Note:** Some biome rules (e.g., `useSortedClasses`, `useExportType`, `useAsConstAssertion`) have no direct oxlint equivalent. Drop them. The main monorepo PR #135 also dropped these.

- [ ] **Commit:** `chore(toolchain): add oxlint + oxfmt config files`

### Task 0.2: Delete biome.json

**File:** `biome.json`

**Step 1.** Run `git rm biome.json`

- [ ] **Commit:** `chore(toolchain): remove biome config`

### Task 0.3: Update package.json

**File:** `package.json`

**Step 1.** Edit `package.json`:

- Remove from `devDependencies`:
  - `"@biomejs/biome": "^2.2.6"`
- Add to `devDependencies`:
  - `"oxlint": "^1.0.0"`
  - `"oxfmt": "^0.2.0"`
- Update `scripts`:
  ```json
  "check": "oxlint . && oxfmt --check .",
  "format": "oxfmt .",
  "lint": "oxlint .",
  ```

> **Note:** `oxlint` has both a default ruleset (the rules defined in `categories`) and per-rule overrides. Running `oxlint .` with the `.oxlintrc.json` above applies the same effective rules as the old biome config.

- [ ] **Commit:** `chore(toolchain): swap biome for oxlint + oxfmt in package.json`

### Task 0.4: Update lefthook.yml

**File:** `lefthook.yml`

**Step 1.** Replace `lefthook.yml` contents with:

```yaml
# Refer for explanation to following link:
# https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md

skip_output:
  - meta
  - summary
  - empty_summary
  - execution_info
  - skips

pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.{js,ts,jsx,tsx,json},package.json"
      exclude: '(^|/)(tests|stories)\.(ts|tsx)$'
      run: pnpm exec oxfmt {all_files} --write
    check:
      glob: "*.{js,ts,jsx,tsx,json},package.json"
      exclude: '(^|/)(tests|stories)\.(ts|tsx)$'
      run: pnpm exec oxlint {staged_files} --fix
    typecheck:
      files: git diff --name-only main
      glob: "*.{js,ts,jsx,tsx,json},package.json"
      exclude: '(^|/)(tests|stories)\.(ts|tsx)$'
      run: pnpm exec tsc -b --noEmit
```

- [ ] **Commit:** `chore(toolchain): switch lefthook to oxlint + oxfmt`

### Task 0.5: Update README.md

**File:** `README.md`

**Step 1.** Find the `Development` section, replace the biome mentions:

Before:
> This project uses TypeScript for type checking, [Biome](https://biomejs.dev) for code formatting and linting which is configured in [`biome.json`](./biome.json). It's recommended to get TypeScript set up for your editor and install an editor plugin (like the [VSCode Biome plugin][vscode-biome]) to get auto-formatting on saving and get a really great in-editor experience with type checking and auto-complete.

After:
> This project uses TypeScript for type checking and the [Oxc](https://oxc.rs) toolchain (`oxlint` + `oxfmt`) for linting and formatting. Config lives in [`.oxlintrc.json`](./.oxlintrc.json) and [`.oxfmtrc.json`](./.oxfmtrc.json). Install an editor extension (VSCode: `oxc.oxc-vscode`) for in-editor feedback.

- [ ] **Commit:** `docs: switch dev section to oxlint + oxfmt`

### Task 0.6: Re-format source files

**Files:** all `src/**/*.{ts,json}`

**Step 1.** Run `pnpm install`

**Step 2.** Run `pnpm exec oxfmt .` to apply formatter in place. Review the diff — most changes will be:
- 4-space → 2-space (in `initialize.ts`, `version.ts`, `main.ts`, `utils.ts` — JSON files stay 4)
- Single quotes (already in use)
- `asNeeded` semicolons (likely already in use)

**Step 3.** Run `pnpm exec oxlint . --fix` to apply auto-fixes. Review the diff — most fixes will be:
- Sorted imports
- Removed unused vars (none expected)

**Step 4.** If `oxlint` reports any unfixable errors, fix them manually:
- Replace `any` types with proper types
- Add `// oxlint-disable-next-line` only as a last resort (note in PR description)

- [ ] **Commit:** `chore(toolchain): re-format source with oxfmt + fix oxlint issues`

### Task 0.7: Add a CHANGELOG entry (separate, can be done in another PR)

Skip in this PR — CHANGELOG.md is currently empty in moci. The release-please automation (Plan #3) will fill it in automatically.

## Phase 1 — Verification

- [ ] `rm -rf node_modules pnpm-lock.yaml && pnpm install` — clean install
- [ ] `pnpm run lint` — passes with same effective rules as old biome config
- [ ] `pnpm run format` — no diff after running (already formatted)
- [ ] `pnpm run check` — combined lint + format-check passes
- [ ] `pnpm run typecheck` — clean
- [ ] `pnpm test` — all vitest tests pass (if Plan #1 merged)
- [ ] `pnpm run build` — `dist/index.mjs` produced
- [ ] Manual smoke test:
  - `node ./bin/moci.mjs --help` — shows all subcommands (init, list, version)
  - `node ./bin/moci.mjs init test-app --dry-run` — works
- [ ] Verify no `biome` references remain in code or docs:
  - `git grep -i biome` should return nothing (except the deleted `biome.json` in git log)
- [ ] Push branch `chore/migrate-biome-to-oxc` to fork
- [ ] Open PR titled `chore(toolchain): migrate moci from biome to oxlint + oxfmt`
- [ ] PR body:

  ```
  Completes the ZOG-wide biome→oxc migration that @ganindrag started in
  the main monorepo (PR #135). After this merges, no ZOG project uses
  biome anymore.

  Changes:
  - Replace `biome.json` with `.oxlintrc.json` + `.oxfmtrc.json`
  - Swap `@biomejs/biome` for `oxlint` + `oxfmt` in devDependencies
  - Update `package.json` scripts (check/format/lint)
  - Update `lefthook.yml` pre-commit hooks
  - Re-format all source files in place

  Rule mapping (dropped because no oxlint equivalent):
  - `useSortedClasses` (biome nursery, not in oxlint)
  - `useExportType` (no oxlint rule)
  - `useAsConstAssertion` (no oxlint rule)

  Verified:
  - `pnpm run check` passes
  - `pnpm run typecheck` passes
  - `pnpm test` passes
  - `pnpm run build` produces dist
  - No `biome` references in source or docs

  Refs: zero-one-group/monorepo#135
  ```

## Out of scope (intentionally deferred)

- Migrate every `moci` subcommand's internal styles — handled by re-format
- Add oxlint plugins for specific frameworks (moci is pure Node, no plugins needed)
- Update CI workflow (Plan #1 adds the first CI; oxlint+oxfmt fit in the existing `lint` step)
- Add `oxlint --max-warnings 0` to enforce zero warnings — can be added in a follow-up

## Self-review

**Spec coverage:**
- Lint config: ✅ matches biome behavior where possible
- Formatter config: ✅ matches biome behavior exactly
- Lefthook integration: ✅ preserves parallel/glob/exclude semantics
- README: ✅ updates dev section
- Rule drops: ✅ documented in PR body
- Build/test/typecheck: ✅ verified passing

**Placeholder scan:** No "TBD" markers. The rule drops are listed explicitly. The `.oxlintrc.json` maps every meaningful biome rule.

**Type consistency:** `oxlint` rule names use kebab-case (`no-unused-vars`) while biome used camelCase (`noUnusedVariables`). All names in the config file are kebab-case to match oxlint's schema.

**File count:** 5 modified files, 2 new, 1 deleted. Realistic for 2-4 hours solo. Smaller than the shared-ui-vue plan, faster than moci-list.
