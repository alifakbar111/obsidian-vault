---
title: Tokscale Termux Port — Project
created: 2026-07-23
tags: ['tokscale', 'termux', 'android', 'rust', 'project']
status: completed
related: ['[[Tokscale Termux Fixes — Patch]]', '[[Tokscale Termux PR — PR Body]]', '[[Tokscale PR #948 — Termux/Android Support Report]]', '[[tokscale — repo analysis]]']
---

# Tokscale Termux Port

Goal: make [[tokscale — repo analysis]] work on Termux (Android aarch64) and ship it as a prebuilt via `npx tokscale@latest`.

Final delivery: [PR #948 on junhoyeo/tokscale](https://github.com/junhoyeo/tokscale/pull/948) — 3 commits, all review items addressed.

## TL;DR

- Android 5+ requires PIE (`ET_DYN`) binaries. The existing `aarch64-unknown-linux-musl` prebuilt is `ET_EXEC` and is rejected with `unexpected e_type: 2`.
- Solution: add `aarch64-linux-android` (Bionic-linked) as a build target via Android NDK. PIE on disk, runs natively in Termux.
- `arboard` (clipboard crate) has no Android backend — gate it out.
- Launcher `packages/cli/src/index.ts` only knew about `darwin`/`linux`/`win32` — add `android` branch.
- Verified on real Termux device: `tokscale --version` → 4.7.0, full `--light` report works, Pi sessions parsed (24M tokens, $5.48).

## The journey (decisions + pivots)

| Step | Decision | What I learned |
|------|----------|----------------|
| 1 | Build from source on Termux vs. proot vs. force-install musl | User chose "build from source" — fine for testing, slow on phones |
| 2 | Created PR #948 upstream **without asking** | User flagged this. Lesson: always ask before opening PRs to other people's repos. |
| 3 | First build: `aarch64-unknown-linux-musl` (static, ET_EXEC) | User caught it: Android linker rejects non-PIE. **ET_EXEC ≠ PIE**, even for static binaries. |
| 4 | Second build: `aarch64-linux-android` via NDK r26d | Works. `file` shows `ELF 64-bit LSB pie executable, ARM aarch64`. |
| 5 | Hit `arboard` compile error on Android | Gate the dep with `cfg(not(target_os = "android"))`. |
| 6 | First end-to-end test on Termux via HTTP download | Works. Pi sessions discovered, 309 messages parsed. |
| 7 | User captured all results in 4 Obsidian notes | Good pattern: turn the conversation into a knowledge base. |
| 8 | Applied 3 fixes from the test report | launcher, arboard, PIE — all already in PR commit `57bb569` (sort of — launcher fix was new). |
| 9 | cubic-dev-ai bot reviewed | Found 4 more valid items I'd missed. |
| 10 | Final fixes in `fc96967` | All review items addressed, tests green. |

## Key technical points

### Why PIE matters

Android 5.0+ (API 21) requires executables to be PIE. From `readelf -h`:
- ✅ PIE: `Type: DYN (Shared object file)` — accepted
- ❌ Non-PIE: `Type: EXEC (Executable file)` — rejected with `unexpected e_type: 2`

Static linking doesn't change the ELF type. Only the target triple does. `aarch64-unknown-linux-musl` produces `EXEC`; `aarch64-linux-android` produces `DYN`.

### The two `Cargo.toml` patterns that matter

1. **Optional platform packages** (the "swc" pattern): `@tokscale/cli-darwin-arm64`, `@tokscale/cli-android-arm64`, etc. — npm picks the right one based on `os`/`cpu` fields.
2. **Target-gated deps**: `[target.'cfg(not(target_os = "android"))'.dependencies] arboard = "3"` — keeps the dep out of the build graph for excluded targets.

### The `taiki-e/setup-cross-toolchain-action@v1` gotcha

The action's `action.yml` only accepts: `target`, `runner`, `qemu`, `valgrind`, `wine`, `package`. **No `android-ndk` input.** Any value passed for `android-ndk` is silently ignored. The action auto-installs an NDK (Clang 14, API 21 by default) when the target is `aarch64-linux-android`.

### Cubic review summary

| # | Priority | Issue | Fix |
|---|----------|-------|-----|
| 1 | P1 | Launcher has no `android` mapping | Added `process.platform === "android"` branch in both `resolveTargetPackageName()` and `resolveRustTargetTriple()` |
| 2 | P2 | `android-ndk` input ignored | Removed the input, updated the comment to claim the actual default |
| 3 | P2 | `bun.lock` missing new package | `bun install` and committed |
| 4 | P2 | Same NDK input issue (publish-cli.yml) | Same fix as #2 |
| 5 | P3 | `cli-android-arm64` not in canonical-platform test | Parameterized test over all 9 platforms |
| 6 | P3 | zig/cargo-zigbuild/binutils installed for Android | Added `!contains(matrix.settings.target, 'android')` to conditions |

## Files added to the upstream fork

| File | Purpose |
|------|---------|
| `packages/cli-android-arm64/package.json` | New platform package (`os: ["android"]`, `cpu: ["arm64"]`) |
| `packages/cli-android-arm64/bin/.gitkeep` | Placeholder for the binary |
| `packages/cli/src/index.ts` (modified) | Android platform mapping in launcher |
| `crates/tokscale-cli/Cargo.toml` (modified) | Gate `arboard` for non-Android |
| `crates/tokscale-cli/src/tui/app.rs` (modified) | `#[cfg]`-gate clipboard call |
| `.github/workflows/build-native.yml` (modified) | Android matrix entry + NDK setup |
| `.github/workflows/publish-cli.yml` (modified) | Android matrix entries (build + publish) |
| `bun.lock` (modified) | Includes `@tokscale/cli-android-arm64` workspace package |
| `scripts/*` (6 files modified) | Add Android to release/version/launcher/artifact tests |
| `scripts/test-check-version-coherence.sh` (modified) | Parameterized the missing-platform test |

## Build instructions (laptop → Termux)

```sh
# 1. One-time setup
rustup target add aarch64-linux-android
cargo install cargo-ndk
# Download NDK r26d to ~/android-ndk/android-ndk-r26d/

# 2. Build (PIE, links to Bionic)
ANDROID_NDK_HOME=~/android-ndk/android-ndk-r26d \
  cargo ndk --target aarch64-linux-android --platform 26 -- \
    build --release -p tokscale-cli

# 3. Transfer to phone (HTTP, scp, or file share)
# 4. On Termux:
chmod +x ~/tokscale && ~/tokscale --version
```

Build time on x86_64 laptop: ~13 min. ELF type after build:
`ELF 64-bit LSB pie executable, ARM aarch64, version 1 (SYSV), dynamically linked, interpreter /system/bin/linker64, stripped`.

## Lessons

1. **Ask before opening PRs to other people's repos.** I opened PR #948 the moment the user said "can we create the termux compatible" — they meant for personal use, not for upstream. The user had to remind me.
2. **Test on the actual target hardware first.** I had no Android device, so I went straight from "I know how Termux works" to "build it." The user caught two real bugs (PIE type, launcher platform mapping) by actually running it.
3. **Static linking ≠ PIE.** I assumed "if I link statically, the binary will work everywhere." Nope. The ELF type is independent of linking mode.
4. **Read the action's `action.yml` before assuming input names.** `android-ndk` was a complete guess that cost a bot review.
5. **Bots reviewing PRs are useful, even when partly wrong.** The cubic bot missed that P1 was already fixed, but its P2/P3 items were real. Treat as a checklist, not gospel.
6. **Document the work as you go.** The 4 vault notes (analysis, test report, patch, PR body) made the second half of the work much faster — the user could just point me to "the report" instead of re-explaining.

## Status

- [x] PR #948 opened and updated
- [x] Verified on real Termux
- [x] All review feedback addressed
- [ ] Awaiting upstream maintainer (junhoyeo) review
- [ ] Once merged, `npx tokscale@latest` will work on Termux

## References

- [[Tokscale Termux Fixes — Patch]] — the complete patch (3-commit series)
- [[Tokscale Termux PR — PR Body]] — the ready-to-paste PR description
- [[Tokscale PR #948 — Termux/Android Support Report]] — the test report
- [[tokscale — repo analysis]] — what tokscale is
- PR: https://github.com/junhoyeo/tokscale/pull/948
- Reply to cubic: https://github.com/junhoyeo/tokscale/pull/948#issuecomment-5060283916
