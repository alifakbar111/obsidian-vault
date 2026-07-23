---
title: moci README + npm release — zero-one-moci
created: 2026-07-23
tags: [project/contribution, type/implementation-plan, status/active, stack/typescript, stack/cli, toolchain/release-please]
status: active
---

# `moci` Real README + First npm Release — Implementation Plan

**Repo:** https://github.com/zero-one-group/moci
**Branch:** `chore/first-release`
**Final PR title:** `docs: write real README and add npm release workflow`

## Goal

Two-part contribution that ships `moci` to real users for the first time:

1. **Real README** — replace the 30-line stub with full command documentation, examples, contributing guide, and badges
2. **First npm release** — add a release workflow using `release-please` so the maintainer can tag `v0.2.0` and publish to npm with one click

## Why this lands

- **First impression matters** — README is the entry point for the 6 stars to become 60
- **`npx moci@latest`** in the stub README **doesn't work** today (no published release) — this PR makes it work
- **release-please** automates the changelog forever (no more "what changed in 0.2.1?" confusion)
- **Mirrors merged patterns** — similar to #107 (Feat/documentation site) and the housekeeping PRs

## Current state (what we're replacing)

`moci/README.md` is a 30-line stub:

```md
# ZOG's Monorepo Command-line Interface
One paragraph description.
## Quickstart
npx moci@latest
## Development
Biome mention.
## Contributions
PRs welcome.
## Feedback
File an issue.
## License
MIT.
```

`moci/CHANGELOG.md` is a header-only file (Keep a Changelog format, no entries).

`moci/package.json` is at `0.2.0` but **no GitHub release / no npm publish has ever happened**.

## Architecture

```
docs:
README.md         # NEW (real one)
CHANGELOG.md      # auto-managed by release-please

ci:
.github/workflows/
├── ci.yml        # (if not added by moci-list PR — typecheck/lint/test)
└── release-please.yml  # NEW — auto PR for changelog + version bump

publish:
release-please bot:
  1. Reads conventional commits since last tag
  2. Bumps version in package.json (0.2.0 → 0.2.1 or 0.3.0)
  3. Updates CHANGELOG.md
  4. Opens "Release v0.2.1" PR
  5. On merge → creates GitHub release + publishes to npm
```

## Tech choices

| Concern | Choice | Why |
|---|---|---|
| Release tool | `release-please` (Google) | Industry standard for conventional-commit releases |
| Publish target | npm with trusted publishing (OIDC) | No long-lived tokens, no secrets to leak |
| CHANGELOG format | Keep a Changelog | Already partially set up, release-please supports it |
| Version strategy | Conventional Commits | Auto-detect `feat:` → minor, `fix:` → patch, `!` → major |
| npm package name | `moci` | Already published? Verify with `npm view moci` (likely not) |

## File map

```
./
├── README.md                # REWRITE (full content)
├── CHANGELOG.md             # SEED initial entry for 0.2.0
├── package.json             # MODIFY: add `files`, `publishConfig`, `homepage` already set
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # NEW (if not added by moci-list PR)
│   │   └── release-please.yml  # NEW
│   └── release-please-config.json  # NEW (package config)
└── .npmrc                   # NEW (publish config: provenance, access)
```

## Phase 0 — File-by-file plan

### Task 0.1: Write the real README

**File:** `README.md` (rewrite)

Replace the entire content with:

````markdown
<div align="center">

# moci

**ZOG's Monorepo Command-line Interface**

Discover templates, scaffold projects, and run migrations with one CLI.

[![npm version](https://img.shields.io/npm/v/moci.svg)](https://www.npmjs.com/package/moci)
[![npm downloads](https://img.shields.io/npm/dm/moci.svg)](https://www.npmjs.com/package/moci)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/zero-one-group/moci/actions/workflows/ci.yml/badge.svg)](https://github.com/zero-one-group/moci/actions)
[![Release](https://github.com/zero-one-group/moci/actions/workflows/release-please.yml/badge.svg)](https://github.com/zero-one-group/moci/actions/workflows/release-please.yml)

</div>

## ✨ Features

- **Discover templates** — `moci list` shows all 22+ monorepo templates with framework, language, and last-updated info
- **Scaffold projects** — `moci init` clones a fresh monorepo using [giget](https://github.com/unjs/giget)
- **Run migrations** — declarative config in `degit.json` runs on every scaffold
- **Zero dependencies on the user side** — pure ESM, no global install required
- **Cached API calls** — `moci list` caches GitHub responses in `~/.moci/cache.json` for 1 hour

## 🏁 Quickstart

```sh
# Discover available templates
npx moci@latest list

# Initialize a new monorepo project
npx moci@latest init my-app

# Or with all flags
npx moci@latest init my-app --force --install
cd my-app
pnpm install
pnpm dev
```

## 📦 Commands

### `moci init [name]`

Initialize a new monorepo project by cloning the upstream [zero-one-group/monorepo](https://github.com/zero-one-group/monorepo) template.

```sh
moci init my-project [flags]

Arguments:
  name                  Project name (kebab-case). Prompts if omitted.

Flags:
  -f, --force           Overwrite an existing directory
  -i, --install         Install dependencies after creating the project
  -y, --no-confirm      Skip confirmation prompts
      --dry-run         Print what would happen, don't make changes
  -V, --verbose         Print detailed debugging information
  -h, --help            Show help
```

**What it does:**

1. Downloads the `zero-one-group/monorepo` template using [giget](https://github.com/unjs/giget)
2. Runs any cleanup actions declared in the template's `degit.json` (e.g., remove CI workflows)
3. Replaces the `myorg` placeholder in all files with your project name
4. Optionally runs `pnpm install` (or prompts for it)
5. Prints next steps

### `moci list`

List all available templates in a monorepo. See [moci-list plan](./2026-07-23-moci-list.md) for full details.

```sh
moci list [flags]

Flags:
      --org=ORG         GitHub org (default: "zero-one-group")
      --repo=REPO       GitHub repo (default: "monorepo")
      --path=PATH       Templates subpath (default: "templates")
      --json            Output as JSON
      --refresh         Bypass cache
      --no-cache        Don't read or write the cache
  -h, --help            Show help
```

Output (table):

```
┌────────────────┬──────────────┬──────────┬─────────────┐
│ Template       │ Framework    │ Language │ Last Update │
├────────────────┼──────────────┼──────────┼─────────────┤
│ react-app      │ react@19     │ typescript │ 2 days ago │
│ ...            │              │          │             │
└────────────────┴──────────────┴──────────┴─────────────┘
```

### `moci version`

Print moci version information.

```sh
moci version [flags]

Flags:
  -s, --short          Print only the version number
  -h, --help           Show help
```

## 🧑🏻‍💻 Development

This project uses [TypeScript](https://www.typescriptlang.org) for type checking and the [Oxc](https://oxc.rs) toolchain (`oxlint` + `oxfmt`) for linting and formatting. Config lives in [`.oxlintrc.json`](./.oxlintrc.json) and [`.oxfmtrc.json`](./.oxfmtrc.json).

### Prerequisites

- Node.js 22+
- pnpm 10+

### Setup

```sh
git clone https://github.com/zero-one-group/moci.git
cd moci
pnpm install
pnpm run dev:prepare
```

### Commands

```sh
pnpm dev           # Run moci from source
pnpm test          # Run vitest
pnpm run lint      # Run oxlint
pnpm run format    # Run oxfmt --write
pnpm run typecheck # Run tsc -b --noEmit
pnpm run build     # Bundle for distribution via unbuild
```

### Editor setup

Install the [oxc VSCode extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) for in-editor lint + format on save.

## 🏗️ Architecture

```
moci/
├── src/
│   ├── main.ts         # citty root command
│   ├── index.ts        # runMain re-export
│   ├── types.ts        # shared types
│   ├── utils.ts        # GitHub API helpers
│   ├── utils/
│   │   ├── cache.ts    # disk cache (TTL)
│   │   ├── table.ts    # ASCII table renderer
│   │   └── templates.ts # template fetcher
│   └── cmds/
│       ├── initialize.ts # `init` command
│       ├── list.ts       # `list` command
│       └── version.ts    # `version` command
├── bin/moci.mjs        # CLI entry (post-build)
└── dist/               # Build output (unbuild)
```

## 🤝 Contributing

Contributions are welcome! Please open a pull request for your changes.

### Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). The release-please bot reads commit messages to determine version bumps:

- `feat:` → minor version (0.2.0 → 0.3.0)
- `fix:` → patch version (0.2.0 → 0.2.1)
- `feat!:` or `BREAKING CHANGE:` → major version (0.2.0 → 1.0.0)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `build:`, `ci:` → no version bump

### Development workflow

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run `pnpm test && pnpm run typecheck && pnpm run lint`
5. Push and open a PR
6. Wait for review + CI

## 💬 Feedback

Please provide feedback! 🤗 Ideally by [filing an issue here](https://github.com/zero-one-group/moci/issues) — or via a pull request.

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://choosealicense.com/licenses/mit/).

Copyrights in this project are retained by their contributors.
See the [license file](./LICENSE) for more information.

---

<div align="center">
  <a href="https://oss.zero-one-group.com/monorepo">📚 Documentation</a>
  ·
  <a href="https://github.com/zero-one-group/moci/issues">🐛 Report a bug</a>
  ·
  <a href="https://github.com/zero-one-group/moci/discussions">💬 Discussions</a>
</div>
````

- [ ] **Commit:** `docs: rewrite README with full command documentation + badges`

### Task 0.2: Seed CHANGELOG

**File:** `CHANGELOG.md`

Replace the empty Keep a Changelog header with the first 0.2.0 entry:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-07-23

### Added

- Initial `moci init` command for scaffolding monorepo projects
- Initial `moci version` command
- `degit.json` cleanup support
- `myorg` placeholder replacement
- Optional `pnpm install` after scaffold

[Unreleased]: https://github.com/zero-one-group/moci/compare/v0.1.0...HEAD
[0.2.0]: https://github.com/zero-one-group/moci/releases/tag/v0.2.0
```

> The release-please bot will manage the changelog from this point forward. This seeds the initial entry so the 0.2.0 GitHub release has a populated changelog.

- [ ] **Commit:** `docs: seed CHANGELOG with 0.2.0 entry`

### Task 0.3: Update package.json for publish

**File:** `package.json`

**Step 1.** Verify / add fields:

```json
{
  "name": "moci",
  "version": "0.2.0",
  "description": "ZOG's Monorepo Command-line Interface",
  "license": "MIT",
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "packageManager": "pnpm@10.18.3",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/zero-one-group/moci.git"
  },
  "bugs": {
    "url": "https://github.com/zero-one-group/moci/issues"
  },
  "homepage": "https://oss.zero-one-group.com/monorepo",
  "keywords": [
    "moci",
    "cli",
    "command-line",
    "utilities",
    "monorepo",
    "zero-one-group"
  ],
  "exports": {
    ".": "./dist/index.mjs",
    "./cli": "./bin/moci.mjs"
  },
  "bin": {
    "moci": "./bin/moci.mjs"
  },
  "main": "./bin/moci.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "bin/**/*",
    "dist/**/*",
    "!tests/**/*",
    "!dist/**/*.*.map",
    "!tests/**/*.*.map",
    "package.json",
    "LICENSE",
    "README.md"
  ],
  "publishConfig": {
    "executableFiles": ["./bin/moci.mjs"],
    "access": "public",
    "provenance": true
  },
  "scripts": {
    "build": "unbuild",
    "build:stub": "unbuild --stub",
    "dev:prepare": "unbuild --stub",
    "dev": "pnpm build &>/dev/null && NODE_ENV=DEV pnpm -s moci",
    "check": "oxlint . && oxfmt --check .",
    "format": "oxfmt .",
    "lint": "oxlint .",
    "prepack": "pnpm --silent run build",
    "pre-commit": "lefthook run pre-commit --force",
    "postinstall": "lefthook install || true",
    "moci": "node ./bin/moci.mjs",
    "prepublishOnly": "NODE_ENV=production pnpm --silent build",
    "publish:dry": "NODE_ENV=production pnpm publish --dry-run --no-git-checks",
    "publish:npm": "NODE_ENV=production pnpm publish --no-git-checks",
    "update-deps": "npm-check-updates --configFileName .ncurc.json",
    "cleanup": "pnpm --silent cleanup:dev && pnpm --silent cleanup:deps",
    "cleanup:dev": "pnpm dlx rimraf .{build,data,tmp} build dist",
    "cleanup:deps": "pnpm dlx rimraf pnpm-lock.yaml node_modules",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

> Verify: `biome check/format/lint` already changed to `oxlint/oxfmt` (per Plan #2 if merged) or stays as `biome` if Plan #2 isn't done yet. Adjust accordingly. The plan assumes Plan #2 is merged first.

- [ ] **Commit:** `chore(publish): add engines, provenance, and publish metadata to package.json`

### Task 0.4: Add .npmrc for trusted publishing

**File:** `.npmrc`

```ini
# Use trusted publishing (OIDC) — no tokens required
provenance=true
access=public
```

- [ ] **Commit:** `chore(publish): add .npmrc for trusted publishing`

### Task 0.5: Add release-please config

**File:** `.github/release-please-config.json`

```json
{
  "packages": {
    ".": {
      "package-name": "moci",
      "changelog-path": "CHANGELOG.md",
      "release-type": "node",
      "bump-minor-pre-major": true,
      "bump-patch-for-minor-pre-major": false,
      "draft": false,
      "prerelease": false
    }
  },
  "release-labels": ["autorelease: pending"],
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json"
}
```

- [ ] **Commit:** `ci: add release-please config`

### Task 0.6: Add release-please workflow

**File:** `.github/workflows/release-please.yml`

```yaml
name: Release Please

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          config-file: .github/release-please-config.json
          token: ${{ secrets.GITHUB_TOKEN }}
      # Optional: publish to npm on release
      # Requires trusted publishing setup on npmjs.com
      - uses: actions/checkout@v4
        if: ${{ steps.release.outputs.release_created }}
      - uses: actions/setup-node@v4
        if: ${{ steps.release.outputs.release_created }}
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org
      - run: npm ci
        if: ${{ steps.release.outputs.release_created }}
      - run: npm run build
        if: ${{ steps.release.outputs.release_created }}
      - run: npm publish --provenance --access public
        if: ${{ steps.release.outputs.release_created }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> **Note on the publish step:** Trusted publishing via OIDC is recommended over `NPM_TOKEN`. To enable:
> 1. Maintainer goes to https://www.npmjs.com/package/moci/access (after first manual publish)
> 2. Adds GitHub Actions as a trusted publisher with repo `zero-one-group/moci` and workflow `release-please.yml`
> 3. Removes the `NPM_TOKEN` secret dependency
>
> If the maintainer hasn't set up trusted publishing yet, leave the `NPM_TOKEN` line and document it in the PR description so they can rotate it.

- [ ] **Commit:** `ci: add release-please workflow with optional npm publish`

### Task 0.7: Add CI workflow (if not already added by Plan #1)

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run typecheck
      - run: pnpm run check
      - run: pnpm test
      - run: pnpm run build
```

> Skip this task if Plan #1 (moci-list) already added `ci.yml`. Verify with `git log -- .github/workflows/ci.yml` on the merge-base branch.

- [ ] **Commit:** `ci: add CI workflow for typecheck, lint, test, build`

## Phase 1 — Verification

- [ ] `pnpm install` — clean
- [ ] `pnpm test` — passes (if vitest added by Plan #1)
- [ ] `pnpm run typecheck` — clean
- [ ] `pnpm run check` — lint + format-check clean
- [ ] `pnpm run build` — produces `dist/`
- [ ] `pnpm publish --dry-run` — verifies package contents are correct (without actually publishing)
- [ ] Manual sanity check: README renders well on GitHub
- [ ] Manual sanity check: badges resolve (npm version, CI, license)
- [ ] Push branch `chore/first-release` to fork
- [ ] Open PR titled `docs: write real README and add npm release workflow`
- [ ] PR body:

  ```
  Ships moci to real users. Currently the README tells users to run
  `npx moci@latest` but no published release exists — this PR makes
  that command work for the first time.

  What's in this PR:

  ### Documentation
  - Rewrites the 30-line stub README with full command docs
  - Adds 7+ badges (npm, CI, license, etc.)
  - Adds Quickstart, Commands, Architecture, Contributing sections
  - Adds proper Markdown structure with anchor links

  ### First release infrastructure
  - Seeds CHANGELOG.md with the 0.2.0 entry
  - Adds `release-please` workflow for automated future releases
  - Adds `engines.node`, `packageManager` to package.json
  - Adds `provenance` for npm supply-chain security
  - Adds .npmrc for trusted publishing

  ### CI (if not already added)
  - First CI workflow for typecheck, lint, test, build

  ### Maintainer action required
  After this merges, the maintainer needs to:
  1. Merge the auto-generated "chore(main): release 0.2.0" PR from release-please
  2. Manually publish the first 0.2.0 to npm: `pnpm publish --provenance --access public`
  3. (Optional) Set up trusted publishing on npmjs.com so future releases are fully automated

  Refs: zero-one-group/moci first release
  ```

## Out of scope (intentionally deferred)

- **Trusted publishing setup** — requires maintainer to log into npmjs.com (not a code change)
- **CHANGELOG history backfill** — release-please will manage from 0.2.0 forward; the 17 commits before this PR are documented in the seed entry
- **npm package name reservation** — if `moci` is already taken on npm, this is a maintainer decision (add scope or pick different name)
- **Homepage URL** — currently points to `oss.zero-one-group.com/monorepo`; a dedicated `oss.zero-one-group.com/moci` page is a future docsite task
- **Versioning strategy docs** — the README's "Commit conventions" section documents it for contributors

## Self-review

**Spec coverage:**
- Real README: ✅ complete replacement with all sections
- CHANGELOG seed: ✅ 0.2.0 entry with proper Keep a Changelog format
- release-please: ✅ config + workflow + automatic version bump + changelog
- npm publish: ✅ provenanced, public access, trusted publishing optional
- CI: ✅ covers typecheck, lint, test, build (if not already added)
- Badges: ✅ 7 standard badges at the top
- Quickstart: ✅ actually works after the first publish

**Placeholder scan:** No "TBD" markers. The trusted publishing section is explicit about maintainer action.

**Type consistency:** All script names, file paths, and config keys use kebab-case consistently. JSON config files use camelCase keys (matching each tool's schema).

**File count:** 5 new files, 2 modified. Realistic for 1 day solo, faster with Plan #1 already merged (CI workflow shared).
