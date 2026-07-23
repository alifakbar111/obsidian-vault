---
title: Tokscale Termux PR — PR Body
created: 2026-07-23
tags: ['tokscale', 'termux', 'android', 'pr']
status: evergreen
---

# Tokscale Termux PR — Ready-to-Paste PR Body

Copy this into the new PR description when opening it on GitHub. See [[Tokscale PR #948 — Termux/Android Support Report]] and [[Tokscale Termux Fixes — Patch]] for full details.

---

## PR Title
`feat(cli): add android-arm64 (Termux) prebuilt support`

## PR Body

```markdown
## Summary

Adds `aarch64-linux-android` as a build target and `@tokscale/cli-android-arm64` as a platform package so Tokscale runs on **Termux** (Android terminal emulator).

This is a re-submission of #948 with the three blocking fixes applied.

## Why a new target?

Android 5+ requires **PIE (`DYN`) binaries**. The existing `aarch64-unknown-linux-musl` prebuilt is ELF type `EXEC` (non-PIE) and is rejected by Android's linker:

```
error: ".../tokscale" has unexpected e_type: 2
```

The `aarch64-linux-android` target (via Android NDK) produces a `DYN` binary that Android accepts.

## Changes

### Original scaffolding (from #948)
- **`packages/cli-android-arm64/`** — new platform package (`os: ["android"]`, `cpu: ["arm64"]`)
- **`.github/workflows/build-native.yml`** — add `aarch64-linux-android` target with NDK r26d via `taiki-e/setup-cross-toolchain-action`
- **`.github/workflows/publish-cli.yml`** — add android-arm64 to publish matrix
- **`packages/cli/package.json`** — add `@tokscale/cli-android-arm64` to `optionalDependencies`
- **`scripts/*`** — update release/version-coherence/launcher/artifact tests for the new package

### New fixes (tested on real Termux device)
- **`packages/cli/src/index.ts`** — add `android` platform to `resolveTargetPackageName()` → `"cli-android-arm64"` and `resolveRustTargetTriple()` → `"aarch64-linux-android"` (the launcher previously only handled `darwin`/`linux`/`win32`)
- **`crates/tokscale-cli/Cargo.toml`** — gate `arboard` (clipboard) dependency with `cfg(not(target_os = "android"))` — `arboard` has no Android backend and fails to compile
- **`crates/tokscale-cli/src/tui/app.rs`** — gate the `arboard::Clipboard` call with `#[cfg]` + Android fallback status message

## Proof of Execution (real Termux device)

Tested on **Termux (Android, aarch64-linux-android)** with a binary cross-compiled via `cargo build --release --target aarch64-linux-android -p tokscale-cli`.

**ELF type is PIE — Android accepts it:**
```
$ readelf -h ~/tokscale | grep -E "Class|Type|Machine"
  Class:                             ELF64
  Type:                              DYN (Shared object file)
  Machine:                           AArch64
```

**`--version` works:**
```
$ ~/tokscale --version
tokscale 4.7.0
```

**`clients` discovers Pi sessions on device:**
```
$ ~/tokscale clients
  Pi
  sessions: ~/.pi/agent/sessions ✓
  messages: 309
```

**`--light` produces a full token usage report with real data:**
```
$ ~/tokscale --light

  Token Usage Report by Model

┌──────────┬──────────────┬───────────────────┬───────────────────┬───────────┬────────┬─────────────┬────────────┬────────────┬───────┬───────┬──────────┐
│ Client   │ Provider     │ Model             │ Resolved          │ Input     │ Output │ Cache Write │ Cache Read │ Total      │ ms/1K │ Cost  │ Cost/1M  │
├──────────┼──────────────┼───────────────────┼───────────────────┼───────────┼────────┼─────────────┼────────────┼────────────┼───────┼───────┼──────────┤
│ Pi       │ Opencode Go  │ glm-5.2           │ glm-5.2           │ 2,036,208 │ 24,849 │           0 │  9,374,468 │ 11,435,525 │     — │ $5.40 │ $0.47/M  │
│ Pi       │ Opencode Go  │ deepseek-v4-flash │ deepseek-v4-flash │   229,990 │ 54,206 │           0 │ 12,513,152 │ 12,797,348 │     — │ $0.08 │ $0.01/M  │
│ Pi       │ Opencode Go  │ kimi-k3           │ kimi-k3           │         0 │      0 │           0 │          0 │          0 │     — │ $0.00 │       —  │
│ Total    │              │                   │                   │ 2,266,198 │ 79,055 │           0 │ 21,887,620 │ 24,232,873 │     — │ $5.48 │ $0.23/M  │
└──────────┴──────────────┴───────────────────┴───────────────────┴───────────┴────────┴─────────────┴────────────┴────────────┴───────┴───────┴──────────┘

  Total: 309 messages, 24,232,873 tokens, $5.48
```

**Contrast — the existing `aarch64-unknown-linux-musl` prebuilt is rejected:**
```
$ readelf -h node_modules/@tokscale/cli-linux-arm64-musl/bin/tokscale | grep Type
  Type:                              EXEC (Executable file)

$ node_modules/@tokscale/cli-linux-arm64-musl/bin/tokscale --version
error: ".../tokscale" has unexpected e_type: 2
```

## Build instructions (for CI / local cross-compile)

```bash
rustup target add aarch64-linux-android
cargo build --release --target aarch64-linux-android -p tokscale-cli
# Binary: target/aarch64-linux-android/release/tokscale (DYN/PIE)
```

The CI workflow uses `taiki-e/setup-cross-toolchain-action@v1` with `android-ndk: r26d` to install the NDK and wire `CC_aarch64_linux_android` / `AR_aarch64_linux_android`.

## Test plan

- [ ] CI `build-native.yml` produces a `DYN` binary for `aarch64-linux-android`
- [ ] Binary is published to `@tokscale/cli-android-arm64`
- [ ] `npm install tokscale` on Termux → `npx tokscale --version` returns `tokscale 4.7.0`
- [ ] `npx tokscale --light` on Termux produces a token usage report
- [ ] `npm install tokscale` on Linux/macOS/Windows still works (android package skipped as optional dep)
```

