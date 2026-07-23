---
title: tokscale repo analysis
created: 2026-07-23
tags: []
status: evergreen
---

# tokscale — repo analysis

Source: https://github.com/junhoyeo/tokscale/ (v4.7.0, MIT, author Junho Yeo)

## Elevator pitch
"A high-performance CLI tool and visualization dashboard for tracking token usage and costs across multiple AI coding agents." Tagline: "The Kardashev Scale for AI Devs" — tokens are the new energy.

## What it does
Tokscale scans the on-disk session/transcript stores of ~45 AI coding agents (Claude Code, Codex, Copilot, Cursor, Gemini, Amp, Goose, Qwen, Kimi, Kiro, Trae, Zed, Cline, Roo, Kilo, Warp, Grok, Devin, etc.), normalizes them into a unified message model, computes token/cost/time metrics, and presents them in:
- a native Rust TUI (Ratatui): Overview / Models / Daily / Hourly / Stats / Agents / Minutely
- a `--light` table mode
- a Next.js web frontend at tokscale.ai with a 3D contribution graph, public profiles, leaderboards, and groups
- a "Wrapped 2025" year-in-review image generator
- a social platform where users `tokscale submit` their usage to a leaderboard

## Architecture / layout
Monorepo, hybrid Rust + TypeScript (Bun workspaces):

- `crates/tokscale-core/` — the parsing/aggregation engine. ~44 per-agent session parsers under `src/sessions/<agent>.rs`, each converting local formats → a unified `UnifiedMessage`/`TokenBreakdown`. Plus `pricing/` (LiteLLM + OpenRouter + models.dev + custom overrides, 1h disk cache), `scanner.rs`, `aggregator.rs`, `sessionize.rs` (idle-gap sessionization), `model_alias.rs`, `content_extractor.rs`, `paths.rs` (XDG), `fs_atomic.rs`.
- `crates/tokscale-cli/` — the `tokscale` binary. `main.rs` defines a large Clap CLI (~50 subcommands: models/monthly/hourly/tui/pricing/submit/autosubmit/wrapped/report/export/login/etc.). `tui/` is a full Ratatui app with cache, keymap, export, mouse selection. `commands/usage/*` fetch live subscription usage per provider. Integrations: `antigravity.rs`, `cursor.rs`, `trae.rs`, `warp.rs` (auth + cache sync). Optional `apple-fm` feature FFI into Apple FoundationModels for on-device summarization; vendored `foundation-models-c` Swift bindings.
- `packages/cli/` + `packages/cli-<platform-arch>/` — npm wrapper that installs the prebuilt native binary per target (à la `swc`/`@tokscale/core`).
- `packages/frontend/` — Next.js web dashboard (~35k LOC TS/TSX): routes `/u/[username]`, `/leaderboard`, `/groups/[slug]`, `/api/embed/[username]/svg`, plus `/local` graph and settings. Libs for leaderboard, groups, embed, profile.
- `packages/benchmarks/` — perf benchmark harness + results.
- `docs/` + `DESIGN.md` — detailed product design system spec (design principles, component contracts, a11y WCAG 2.2 AA, responsive breakpoints, embed/SVG template hierarchy).
- `AGENTS.md`, `CONTRIBUTING.md` — contributor guidance.

## Tech stack
- Rust 2021, workspace with LTO + strip in release. Key deps: `simd-json`, `rayon`, `ratatui` + `crossterm`, `clap` (derive), `rusqlite` (bundled), `reqwest`/`tokio`, `walkdir`, `chrono`, `aes`/`cbc`/`base64` (Trae credential decryption), `arboard` (clipboard), `qrcode`, `resvg`/`usvg`/`ab_glyph` (wrapped image rendering), `image`/`imageproc`.
- TypeScript/Bun: Next.js frontend, npm launcher packages.
- CI: `build-native.yml`, `frontend_ci.yml`, `publish-cli.yml`, `test_coverage.yml` (tarpaulin), launcher validation. Cross-platform native builds (darwin/linux/win, x64/arm64, gnu/musl/msvc).

## Notable engineering details
- **SIMD-accelerated JSON parsing** via `simd-json` for the (often huge) JSONL session transcripts.
- **Parallel traversal** with `rayon`; claimed 10x faster than a JS implementation.
- **Model identity discipline**: `canonical_model_id` (structural only, used for submit/export/persist) vs `normalize_model_for_grouping` (folds user-local aliases, display only). Carefully documented so machine-local aliases never leak into the server-side model identity — prevents usage fragmentation across a user's devices.
- **Pricing sources stacked**: LiteLLM primary → OpenRouter fallback → models.dev → Cursor/Sakana overrides → user `custom:` overrides. Excludes subscription-priced `github_copilot/` entries from pay-per-token estimation.
- **Sessionization**: idle-gap-based grouping of messages into sessions with time metrics.
- **Atomic FS writes**, disk caches (XDG `~/.config/tokscale/`), file locking (`fs2`).
- **Live integrations** that don't store data on disk: Antigravity (RPC against local language server), Trae (JWT → official API), Warp (GraphQL aggregate), Cursor (API CSV export) — each modeled as `tokscale <x> sync` → local cache.
- **Credential handling**: decrypts Trae's Electron `iCubeAuthInfo` (AES-128-CBC + base64); manages Codex OAuth and Cursor session tokens.

## Scale
- ~130k LOC Rust, ~35k LOC frontend TS/TSX, ~195k total across all source files.
- ~144 Rust source files.
- 45 supported clients, each with a dedicated parser.

## Strengths
- Exceptionally broad agent coverage — likely the most comprehensive anywhere.
- Clean Rust core / TS shell separation; performance-oriented (SIMD + rayon + LTO).
- Thoughtful design artifacts (DESIGN.md is a real product/design system doc, with a11y and responsive contracts).
- Strong model-identity hygiene — a subtle but important correctness property for a social/leaderboard product.

## Watch-outs
- Large surface area → maintenance burden; each agent's on-disk format can break on upstream changes.
- Some parsers estimate tokens textually (e.g. Command Code ~4 chars/token) — accuracy varies by client.
- The social/leaderboard data flows are centralized through tokscale.ai; long-term bus-factor risk if the author steps back (single primary author).

## Relevance to pi
Tokscale reads pi's own session store (`~/.pi/agent/sessions/` and `~/.omp/agent/sessions/` for [[Oh My Pi]]) as one of its 45 clients — so pi users get free token/cost analytics by running `bunx tokscale`. The pi session JSONL format is already a supported first-class citizen here.
