---
title: Tokscale Termux Fixes — Patch
created: 2026-07-23
tags: ['tokscale', 'termux', 'android', 'patch']
status: evergreen
---

# Tokscale Termux Fixes — Complete Patch

Complete patch for a **new PR** (previous PR #948 was closed). This includes both the original scaffolding AND the 3 fixes. Apply on `main` with:

```bash
cd tokscale
git checkout main
git checkout -b feat/android-termux-support
git apply tokscale-termux-complete.patch
git add -A
git commit -m "feat(cli): add android-arm64 prebuilt for Termux"
git push origin feat/android-termux-support
# Then open a new PR
```

See [[Tokscale PR #948 — Termux/Android Support Report]] for the full testing report.

## Files changed (14 files, +107/-6)

### Original PR #948 scaffolding (11 files)
| File | Change |
|------|--------|
| `.github/workflows/build-native.yml` | Add `aarch64-linux-android` target with NDK r26d |
| `.github/workflows/publish-cli.yml` | Add android-arm64 to publish matrix |
| `packages/cli-android-arm64/package.json` | New platform package (`os: ["android"]`, `cpu: ["arm64"]`) |
| `packages/cli-android-arm64/bin/.gitkeep` | Placeholder for binary |
| `packages/cli/package.json` | Add `@tokscale/cli-android-arm64` to optionalDependencies |
| `scripts/check-release-workflow-safety.py` | Add android target mapping |
| `scripts/check-version-coherence.sh` | Add android package to required list |
| `scripts/test-check-version-coherence.sh` | Add android to test manifests |
| `scripts/test-package-launchers.sh` | Add android to launcher test |
| `scripts/test-prepare-release-provenance.sh` | Add android to provenance test |
| `scripts/test-release-package-artifacts.sh` | Add android to artifact test |

### New fixes (3 files)
| File | Fix |
|------|-----|
| `packages/cli/src/index.ts` | Add `android` platform to launcher (`resolveTargetPackageName` + `resolveRustTargetTriple`) |
| `crates/tokscale-cli/Cargo.toml` | Gate `arboard` dependency with `cfg(not(target_os = "android"))` |
| `crates/tokscale-cli/src/tui/app.rs` | Gate clipboard code with `#[cfg]` + Android fallback |

## Patch

```diff
diff --git a/.github/workflows/build-native.yml b/.github/workflows/build-native.yml
index 8d1ad67..d13ae99 100644
--- a/.github/workflows/build-native.yml
+++ b/.github/workflows/build-native.yml
@@ -57,6 +57,17 @@ jobs:
             build: cargo zigbuild --release -p tokscale-cli --target aarch64-unknown-linux-musl
             strip: ""
             bin_name: tokscale
+          # Android (Termux) on aarch64. Requires the Android NDK cross
+          # toolchain (Bionic libc) — zigbuild does not apply here. The
+          # taiki-e/setup-cross-toolchain-action installs the NDK r26d and
+          # wires CC_aarch64_linux_android / AR_aarch64_linux_android so
+          # `cargo build --target aarch64-linux-android` links against
+          # Bionic via the NDK's clang/lld.
+          - host: ubuntu-latest
+            target: aarch64-linux-android
+            build: cargo build --release -p tokscale-cli --target aarch64-linux-android
+            strip: ""
+            bin_name: tokscale
           - host: windows-latest
             target: x86_64-pc-windows-msvc
             build: cargo build --release -p tokscale-cli --target x86_64-pc-windows-msvc
@@ -103,6 +114,13 @@ jobs:
         with:
           tool: cargo-zigbuild
 
+      - name: Setup Android cross toolchain
+        if: ${{ matrix.settings.target == 'aarch64-linux-android' }}
+        uses: taiki-e/setup-cross-toolchain-action@v1
+        with:
+          target: aarch64-linux-android
+          android-ndk: r26d
+
       - name: Build CLI binary
         run: ${{ matrix.settings.build }}
         shell: bash
diff --git a/.github/workflows/publish-cli.yml b/.github/workflows/publish-cli.yml
index fc71dca..e20693a 100644
--- a/.github/workflows/publish-cli.yml
+++ b/.github/workflows/publish-cli.yml
@@ -202,6 +202,15 @@ jobs:
             bin_name: tokscale
             build: cargo zigbuild --release -p tokscale-cli --target aarch64-unknown-linux-musl
             strip: ""
+          # Android (Termux) on aarch64: links against Bionic via NDK r26d.
+          # See build-native.yml for the matching toolchain setup.
+          - host: ubuntu-latest
+            target: aarch64-linux-android
+            package_dir: cli-android-arm64
+            artifact_name: cli-binary-aarch64-linux-android
+            bin_name: tokscale
+            build: cargo build --release -p tokscale-cli --target aarch64-linux-android
+            strip: ""
           - host: windows-latest
             target: x86_64-pc-windows-msvc
             package_dir: cli-win32-x64-msvc
@@ -260,6 +269,13 @@ jobs:
         with:
           tool: cargo-zigbuild
 
+      - name: Setup Android cross toolchain
+        if: ${{ matrix.settings.target == 'aarch64-linux-android' }}
+        uses: taiki-e/setup-cross-toolchain-action@v1
+        with:
+          target: aarch64-linux-android
+          android-ndk: r26d
+
       - name: Build CLI binary
         shell: bash
         run: ${{ matrix.settings.build }}
@@ -414,6 +430,10 @@ jobs:
             package_dir: cli-linux-arm64-musl
             artifact_name: cli-binary-aarch64-unknown-linux-musl
             binary_name: tokscale
+          - package_name: '@tokscale/cli-android-arm64'
+            package_dir: cli-android-arm64
+            artifact_name: cli-binary-aarch64-linux-android
+            binary_name: tokscale
           - package_name: '@tokscale/cli-win32-x64-msvc'
             package_dir: cli-win32-x64-msvc
             artifact_name: cli-binary-x86_64-pc-windows-msvc
diff --git a/crates/tokscale-cli/Cargo.toml b/crates/tokscale-cli/Cargo.toml
index 9cb40b6..6e5c833 100644
--- a/crates/tokscale-cli/Cargo.toml
+++ b/crates/tokscale-cli/Cargo.toml
@@ -35,7 +35,6 @@ toml = { workspace = true }
 chrono = { workspace = true }
 dirs = { workspace = true }
 rayon = { workspace = true }
-arboard = { workspace = true }
 reqwest = { workspace = true }
 fs2 = { workspace = true }
 image = "0.25"
@@ -56,6 +55,10 @@ aes = { workspace = true }
 cbc = { workspace = true }
 base64 = { workspace = true }
 
+# arboard (clipboard) has no Android backend — gate it out on Termux.
+[target.'cfg(not(target_os = "android"))'.dependencies]
+arboard = { workspace = true }
+
 [target.'cfg(unix)'.dependencies]
 signal-hook = { workspace = true }
 
diff --git a/crates/tokscale-cli/src/tui/app.rs b/crates/tokscale-cli/src/tui/app.rs
index b08f930..d96c68e 100644
--- a/crates/tokscale-cli/src/tui/app.rs
+++ b/crates/tokscale-cli/src/tui/app.rs
@@ -2131,10 +2131,13 @@ impl App {
         };
 
         if let Some(text) = text {
+            #[cfg(not(target_os = "android"))]
             match arboard::Clipboard::new().and_then(|mut cb| cb.set_text(&text)) {
                 Ok(_) => self.set_status("Copied to clipboard"),
                 Err(_) => self.set_status("Failed to copy"),
             }
+            #[cfg(target_os = "android")]
+            self.set_status("Clipboard not supported on Android");
         }
     }
 
diff --git a/packages/cli-android-arm64/bin/.gitkeep b/packages/cli-android-arm64/bin/.gitkeep
new file mode 100644
index 0000000..e69de29
diff --git a/packages/cli-android-arm64/package.json b/packages/cli-android-arm64/package.json
new file mode 100644
index 0000000..7d05dee
--- /dev/null
+++ b/packages/cli-android-arm64/package.json
@@ -0,0 +1,26 @@
+{
+  "name": "@tokscale/cli-android-arm64",
+  "version": "4.7.0",
+  "description": "tokscale CLI binary for android arm64 (Termux)",
+  "license": "MIT",
+  "type": "module",
+  "os": [
+    "android"
+  ],
+  "cpu": [
+    "arm64"
+  ],
+  "main": "bin/tokscale",
+  "files": [
+    "bin"
+  ],
+  "publishConfig": {
+    "registry": "https://registry.npmjs.org/",
+    "access": "public"
+  },
+  "repository": {
+    "type": "git",
+    "url": "git+https://github.com/junhoyeo/tokscale.git",
+    "directory": "packages/cli-android-arm64"
+  }
+}
diff --git a/packages/cli/package.json b/packages/cli/package.json
index 9604c86..a41a6f2 100644
--- a/packages/cli/package.json
+++ b/packages/cli/package.json
@@ -36,7 +36,8 @@
     "@tokscale/cli-linux-arm64-gnu": "4.7.0",
     "@tokscale/cli-linux-arm64-musl": "4.7.0",
     "@tokscale/cli-win32-x64-msvc": "4.7.0",
-    "@tokscale/cli-win32-arm64-msvc": "4.7.0"
+    "@tokscale/cli-win32-arm64-msvc": "4.7.0",
+    "@tokscale/cli-android-arm64": "4.7.0"
   },
   "devDependencies": {
     "@types/node": "^20.0.0",
diff --git a/packages/cli/src/index.ts b/packages/cli/src/index.ts
index afcce33..4058d86 100644
--- a/packages/cli/src/index.ts
+++ b/packages/cli/src/index.ts
@@ -121,6 +121,15 @@ function resolveTargetPackageName(): string | null {
     return null;
   }
 
+  if (process.platform === "android") {
+    // Termux: Android uses bionic libc, not glibc or musl.
+    // The aarch64-linux-android target produces PIE (DYN) binaries
+    // that Android's linker accepts; linux-musl builds are EXEC and
+    // rejected with "unexpected e_type: 2".
+    if (arch === "arm64") return "cli-android-arm64";
+    return null;
+  }
+
   if (process.platform === "win32") {
     if (arch === "arm64") return "cli-win32-arm64-msvc";
     if (arch === "x64") return "cli-win32-x64-msvc";
@@ -154,6 +163,11 @@ function resolveRustTargetTriple(): string | null {
     return null;
   }
 
+  if (process.platform === "android") {
+    if (arch === "arm64") return "aarch64-linux-android";
+    return null;
+  }
+
   if (process.platform === "win32") {
     if (arch === "arm64") return "aarch64-pc-windows-msvc";
     if (arch === "x64") return "x86_64-pc-windows-msvc";
diff --git a/scripts/check-release-workflow-safety.py b/scripts/check-release-workflow-safety.py
index 0ce0156..ada1af4 100755
--- a/scripts/check-release-workflow-safety.py
+++ b/scripts/check-release-workflow-safety.py
@@ -19,6 +19,7 @@ TARGET_PACKAGES = {
     "aarch64-unknown-linux-musl": "cli-linux-arm64-musl",
     "x86_64-pc-windows-msvc": "cli-win32-x64-msvc",
     "aarch64-pc-windows-msvc": "cli-win32-arm64-msvc",
+    "aarch64-linux-android": "cli-android-arm64",
 }
 
 
diff --git a/scripts/check-version-coherence.sh b/scripts/check-version-coherence.sh
index 32550ee..ff5ad9b 100755
--- a/scripts/check-version-coherence.sh
+++ b/scripts/check-version-coherence.sh
@@ -65,6 +65,7 @@ required_platform_names = {
     "@tokscale/cli-linux-x64-musl",
     "@tokscale/cli-win32-arm64-msvc",
     "@tokscale/cli-win32-x64-msvc",
+    "@tokscale/cli-android-arm64",
 }
 
 def expect_equal(label: str, actual: str, expected: str) -> None:
diff --git a/scripts/test-check-version-coherence.sh b/scripts/test-check-version-coherence.sh
index 4012465..ec929e4 100755
--- a/scripts/test-check-version-coherence.sh
+++ b/scripts/test-check-version-coherence.sh
@@ -20,6 +20,7 @@ write_release_manifests() {
     packages/cli-linux-arm64-musl \
     packages/cli-win32-x64-msvc \
     packages/cli-win32-arm64-msvc \
+    packages/cli-android-arm64 \
     packages/tokscale
 
   cat > Cargo.toml <<EOF_MANIFEST
@@ -61,7 +62,8 @@ EOF_LOCK
     "@tokscale/cli-linux-arm64-gnu": "${version}",
     "@tokscale/cli-linux-arm64-musl": "${version}",
     "@tokscale/cli-win32-x64-msvc": "${version}",
-    "@tokscale/cli-win32-arm64-msvc": "${version}"
+    "@tokscale/cli-win32-arm64-msvc": "${version}",
+    "@tokscale/cli-android-arm64": "${version}"
   }
 }
 EOF_MANIFEST
@@ -74,7 +76,8 @@ EOF_MANIFEST
     cli-linux-arm64-gnu \
     cli-linux-arm64-musl \
     cli-win32-x64-msvc \
-    cli-win32-arm64-msvc; do
+    cli-win32-arm64-msvc \
+    cli-android-arm64; do
     cat > "packages/${pkg}/package.json" <<EOF_MANIFEST
 {
   "name": "@tokscale/${pkg}",
diff --git a/scripts/test-package-launchers.sh b/scripts/test-package-launchers.sh
index a9eaa26..d82bdcc 100755
--- a/scripts/test-package-launchers.sh
+++ b/scripts/test-package-launchers.sh
@@ -112,6 +112,9 @@ if (process.platform === "darwin") {
   if (arch === "arm64") console.log(libc === "musl" ? "cli-linux-arm64-musl" : "cli-linux-arm64-gnu");
   else if (arch === "x64") console.log(libc === "musl" ? "cli-linux-x64-musl" : "cli-linux-x64-gnu");
   else process.exit(1);
+} else if (process.platform === "android") {
+  if (arch === "arm64") console.log("cli-android-arm64");
+  else process.exit(1);
 } else {
   process.exit(1);
 }
diff --git a/scripts/test-prepare-release-provenance.sh b/scripts/test-prepare-release-provenance.sh
index b018676..f09de7f 100755
--- a/scripts/test-prepare-release-provenance.sh
+++ b/scripts/test-prepare-release-provenance.sh
@@ -24,6 +24,7 @@ git_add_release_files() {
     packages/cli-linux-arm64-musl/package.json \
     packages/cli-win32-x64-msvc/package.json \
     packages/cli-win32-arm64-msvc/package.json \
+    packages/cli-android-arm64/package.json \
     packages/tokscale/package.json \
     scripts/check-version-coherence.sh \
     scripts/prepare-release-provenance.sh
@@ -41,6 +42,7 @@ write_manifests() {
     packages/cli-linux-arm64-musl \
     packages/cli-win32-x64-msvc \
     packages/cli-win32-arm64-msvc \
+    packages/cli-android-arm64 \
     packages/tokscale
 
   cat > Cargo.toml <<EOF_MANIFEST
@@ -76,7 +78,8 @@ EOF_LOCK
     "@tokscale/cli-linux-arm64-gnu": "${version}",
     "@tokscale/cli-linux-arm64-musl": "${version}",
     "@tokscale/cli-win32-x64-msvc": "${version}",
-    "@tokscale/cli-win32-arm64-msvc": "${version}"
+    "@tokscale/cli-win32-arm64-msvc": "${version}",
+    "@tokscale/cli-android-arm64": "${version}"
   }
 }
 EOF_MANIFEST
@@ -89,7 +92,8 @@ EOF_MANIFEST
     cli-linux-arm64-gnu \
     cli-linux-arm64-musl \
     cli-win32-x64-msvc \
-    cli-win32-arm64-msvc; do
+    cli-win32-arm64-msvc \
+    cli-android-arm64; do
     cat > "packages/${pkg}/package.json" <<EOF_MANIFEST
 {
   "name": "@tokscale/${pkg}",
diff --git a/scripts/test-release-package-artifacts.sh b/scripts/test-release-package-artifacts.sh
index af698db..16b78e0 100644
--- a/scripts/test-release-package-artifacts.sh
+++ b/scripts/test-release-package-artifacts.sh
@@ -42,6 +42,7 @@ const rows = [
   ["cli-linux-arm64-musl", "cli-binary-aarch64-unknown-linux-musl", "tokscale"],
   ["cli-win32-x64-msvc", "cli-binary-x86_64-pc-windows-msvc", "tokscale.exe"],
   ["cli-win32-arm64-msvc", "cli-binary-aarch64-pc-windows-msvc", "tokscale.exe"],
+  ["cli-android-arm64", "cli-binary-aarch64-linux-android", "tokscale"],
 ];
 for (const row of rows) {
   console.log(row.join("\t"));
@@ -124,6 +125,9 @@ if (process.platform === "darwin") {
   if (arch === "arm64") console.log("cli-win32-arm64-msvc");
   else if (arch === "x64") console.log("cli-win32-x64-msvc");
   else process.exit(1);
+} else if (process.platform === "android") {
+  if (arch === "arm64") console.log("cli-android-arm64");
+  else process.exit(1);
 } else {
   process.exit(1);
 }
```
