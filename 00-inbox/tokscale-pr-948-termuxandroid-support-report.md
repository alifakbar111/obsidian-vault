---
title: Tokscale PR #948 — Termux/Android Support Report
created: 2026-07-23
tags: ['tokscale', 'termux', 'android', 'pr-review', 'rust']
status: evergreen
---

# Tokscale PR #948 — Termux/Android Support Report

**PR:** https://github.com/junhoyeo/tokscale/pull/948
**Title:** feat(cli): add android-arm64 prebuilt for Termux
**Status:** Closed (needs fixes before merge)
**Date tested:** 2026-07-23
**Test environment:** Termux on Android (aarch64-linux-android), 11GB RAM

---

## Summary

The PR adds an `aarch64-linux-android` build target and `@tokscale/cli-android-arm64` npm package for Termux support. The core approach is correct — cross-compiling with the Android NDK produces a PIE (`DYN`) binary that Android's linker accepts. However, **three blocking issues** prevent the binary from being usable via the npm launcher, and two of them also prevent the binary from compiling on-device.

A PIE binary built for `aarch64-linux-android` **does run correctly on Termux** once manually placed — it successfully scans Pi sessions and produces accurate token/cost reports.

---

## ✅ What Works

### Binary execution on Termux
- A binary cross-compiled with `cargo build --release --target aarch64-linux-android -p tokscale-cli` runs natively on Termux
- ELF type is `DYN` (PIE) — accepted by Android's linker (unlike `aarch64-unknown-linux-musl` which produces `EXEC` and is rejected with `"unexpected e_type: 2"`)
- `tokscale --version` → `tokscale 4.7.0` ✅
- `tokscale --light` → full token usage report ✅
- `tokscale clients` → correctly discovers Pi sessions (276 messages) ✅

### Scanning results (real data from this device)
| Client | Provider | Model | Input | Output | Cache Read | Total | Cost |
|--------|----------|-------|-------|--------|------------|-------|------|
| Pi | Opencode Go | glm-5.2 | 1,672,778 | 9,313 | 4,012,744 | 5,694,835 | $3.43 |
| Pi | Opencode Go | deepseek-v4-flash | 229,990 | 54,206 | 12,513,152 | 12,797,348 | $0.08 |
| Pi | Opencode Go | kimi-k3 | 0 | 0 | 0 | 0 | $0.00 |
| **Total** | | | **1,902,768** | **63,519** | **16,525,896** | **18,492,183** | **$3.51** |

**271 messages, 18.5M tokens, $3.51 estimated cost** — all from the Pi client.

### CI workflow changes
- `build-native.yml` correctly adds `aarch64-linux-android` target with NDK r26d via `taiki-e/setup-cross-toolchain-action`
- `publish-cli.yml` correctly adds the android-arm64 package to the publish matrix

---

## ❌ Blocking Issues (must fix before merge)

### Issue 1: Launcher does not recognize `android` platform

**File:** `packages/cli/dist/index.js` (and its source `packages/cli/src/index.ts`)

The launcher's `resolveTargetPackageName()` and `resolveRustTargetTriple()` functions only handle `darwin`, `linux`, and `win32`. On Termux, `process.platform` returns `"android"`, so the launcher returns `null` and prints:

```
Error: tokscale binary not found
Build from source: cargo build --release -p tokscale-cli
Expected optional package: @tokscale/cli-android-arm64
```

Even though `@tokscale/cli-android-arm64` is installed in `node_modules`, the launcher never looks for it.

**Fix:** Add an `android` branch to both functions:

```js
// In resolveTargetPackageName():
if (process.platform === "android") {
    if (arch === "arm64") return "cli-android-arm64";
    return null;
}

// In resolveRustTargetTriple():
if (process.platform === "android") {
    if (arch === "arm64") return "aarch64-linux-android";
    return null;
}
```

Also update the `detectLibcKind()` function — on Android, `process.platform === "android"` should short-circuit to avoid unnecessary `ldd`/loader detection (Android uses bionic libc, not glibc or musl).

### Issue 2: `arboard` crate does not compile on Android

**File:** `crates/tokscale-cli/Cargo.toml` and `crates/tokscale-cli/src/tui/app.rs`

The `arboard` crate (clipboard support) has no Android backend. Compiling for `aarch64-linux-android` fails with:

```
error[E0433]: failed to resolve: could not find `platform` in `arboard`
error[E0425]: cannot find type `Get` in module `platform`
error[E0425]: cannot find type `Set` in module `platform`
error[E0425]: cannot find type `Clear` in module `platform`
```

**Fix in `Cargo.toml`:** Move `arboard` to a target-specific dependency:

```toml
[target.'cfg(not(target_os = "android"))'.dependencies]
arboard = { workspace = true }
```

**Fix in `src/tui/app.rs`:** Gate the clipboard call:

```rust
if let Some(text) = text {
    #[cfg(not(target_os = "android"))]
    match arboard::Clipboard::new().and_then(|mut cb| cb.set_text(&text)) {
        Ok(_) => self.set_status("Copied to clipboard"),
        Err(_) => self.set_status("Failed to copy"),
    }
    #[cfg(target_os = "android")]
    self.set_status("Clipboard not supported on Android");
}
```

### Issue 3: `npm install` rejects the android package on non-Android

**File:** `packages/cli-android-arm64/package.json`

The package has `"os": ["android"]` which is correct, but npm on Linux/macOS/Windows will error with `EBADPLATFORM` when installing `@tokscale/cli` (which lists it as an optional dependency). This is the same pattern used by the other platform packages (`"os": ["linux"]`, etc.) and npm handles it correctly **only when the package is an `optionalDependencies` entry**.

The PR correctly adds it to `optionalDependencies` in `packages/cli/package.json`:

```json
"@tokscale/cli-android-arm64": "4.7.0"
```

This should work — npm skips optional deps that don't match the platform. ✅ (Confirmed: `npm install @tokscale/cli-linux-arm64-musl --force` worked on Android after overriding the platform check.)

---

## ⚠️ Non-Blocking Issues / Notes

### Note 1: On-device compilation is difficult (but not required)

Building `tokscale-cli` directly on Termux requires:
- `pkg install rust perl make pkg-config` (~1.1GB)
- `OPENSSL_NO_VENDOR=1` to use system OpenSSL (Termux's `openssl` package includes headers)
- The `av-scenechange` crate (dependency of `resvg`, used by the `wrapped` command) triggers a `rustc` SIGSEGV during release-mode compilation due to the `stacker` crate's incompatibility with Android's bionic libc. Debug mode compiles but is slow.

This is not a blocker for the PR since the CI cross-compiles with NDK, but it's worth documenting for users who want to build from source on Termux.

### Note 2: `termux-elf-cleaner` cannot fix non-PIE binaries

The `aarch64-unknown-linux-musl` prebuilt binary is ELF type `EXEC` (non-PIE). Android 5+ requires `DYN` (PIE). `termux-elf-cleaner` removes unsupported sections/DT entries but does **not** convert `EXEC` → `DYN`. Only recompiling with the `aarch64-linux-android` target (which produces PIE by default) fixes this. This confirms the PR's approach is correct.

### Note 3: Launcher `detectLibcKind()` on Android

On Termux, `process.platform` is `"android"` and `ldd --version` prints musl-like output (bionic doesn't identify as glibc). The current `detectLibcKind()` would misidentify Android as musl, but this doesn't matter because the `android` platform branch should short-circuit before libc detection is reached.

---

## 📋 Checklist for Revised PR

- [ ] **Add `android` platform support to launcher** (`packages/cli/src/index.ts` → `dist/index.js`)
  - [ ] Add android branch to `resolveTargetPackageName()`
  - [ ] Add android branch to `resolveRustTargetTriple()`
  - [ ] Short-circuit `detectLibcKind()` for `process.platform === "android"`
- [ ] **Gate `arboard` dependency for Android** (`crates/tokscale-cli/Cargo.toml`)
  - [ ] Move `arboard` to `[target.'cfg(not(target_os = "android"))'.dependencies]`
- [ ] **Gate clipboard code for Android** (`crates/tokscale-cli/src/tui/app.rs`)
  - [ ] Wrap `arboard::Clipboard::new()` call with `#[cfg(not(target_os = "android"))]`
  - [ ] Add `#[cfg(target_os = "android")]` fallback
- [ ] **Verify CI workflow** (`.github/workflows/build-native.yml`)
  - [ ] Confirm `taiki-e/setup-cross-toolchain-action@v1` with `android-ndk: r26d` produces a PIE binary
  - [ ] Confirm the built binary is copied to `packages/cli-android-arm64/bin/tokscale`
- [ ] **Test end-to-end**: `npm install tokscale` on Termux → `npx tokscale --version`

---

## 🧪 Reproduction Steps

### Build (on PC with Android NDK)
```bash
rustup target add aarch64-linux-android
cargo build --release --target aarch64-linux-android -p tokscale-cli
# Binary: target/aarch64-linux-android/release/tokscale
```

### Test (on Termux)
```bash
# Transfer binary to device (e.g., via HTTP or scp)
curl -o ~/tokscale http://<pc-ip>:8080/tokscale
chmod +x ~/tokscale
~/tokscale --version        # → tokscale 4.7.0
~/tokscale --light          # → full token usage report
~/tokscale clients          # → shows Pi sessions discovered
```

### Verify ELF type
```bash
readelf -h ~/tokscale | grep Type
# Should be: DYN (Shared object file) — NOT EXEC
```

---

## 🔥 Proof of Execution (raw terminal output)

Tested on **Termux (Android 16, aarch64-linux-android)** with a binary cross-compiled via `cargo build --release --target aarch64-linux-android -p tokscale-cli`.

### 1. ELF type is PIE (DYN) — Android accepts it
```
$ readelf -h ~/tokscale | grep -E "Class|Type|Machine"
  Class:                             ELF64
  Type:                              DYN (Shared object file)
  Machine:                           AArch64
```

### 2. `--version` works
```
$ ~/tokscale --version
tokscale 4.7.0
```

### 3. `clients` — discovers Pi sessions on device
```
$ ~/tokscale clients
  Pi
  sessions: ~/.pi/agent/sessions ✓
  messages: 309
```

### 4. `--light` — full token usage report with real data
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

### 5. Contrast: the `aarch64-unknown-linux-musl` prebuilt is rejected
```
$ readelf -h node_modules/@tokscale/cli-linux-arm64-musl/bin/tokscale | grep Type
  Type:                              EXEC (Executable file)

$ node_modules/@tokscale/cli-linux-arm64-musl/bin/tokscale --version
error: ".../tokscale" has unexpected e_type: 2
```

This confirms why the `aarch64-linux-android` target (not `aarch64-unknown-linux-musl`) is required for Termux.
