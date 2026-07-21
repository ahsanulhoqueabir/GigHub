# Android Production Build Guide (ABI Split & AAB)

This guide documents the full configuration and step-by-step process to generate optimized production **Release APKs (split per ABI)** and the **Android App Bundle (.aab)** for this React Native (Expo SDK 54) project.

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Project Configuration](#3-project-configuration)
   - [`android/app/build.gradle`](#androidappbuildgradle)
   - [`android/gradle.properties`](#androidgradleproperties)
   - [`android/build.gradle`](#androidbuildgradle)
4. [Step-by-Step Build Execution](#4-step-by-step-build-execution)
5. [Generated Build Artifacts & Locations](#5-generated-build-artifacts--locations)
6. [Troubleshooting & Gotchas](#6-troubleshooting--gotchas)

---

## 1. Overview

The project is configured to generate separate, architecture-specific APKs:

- **`arm64-v8a`** (Modern 64-bit ARM Android devices)
- **`armeabi-v7a`** (Older 32-bit ARM Android devices)
- **`x86_64`** (64-bit Android Emulators & ChromeOS/Intel devices)

### Key Features

- **Universal APK**: Enabled (`universalApk true`) for 100% device installation compatibility (`app-universal-release.apk`).
- **Hermes JS Engine**: Enabled.
- **R8 / ProGuard Shrinking**: Preserved for production builds.
- **Version Code Overrides**: Automatically shifts version codes per ABI so Google Play and device installs succeed seamlessly.

---

## 2. Prerequisites & Environment Setup

Before running the build, ensure your environment meets the following requirements:

| Tool            | Recommended Version            | Path Example / Note                            |
| :-------------- | :----------------------------- | :--------------------------------------------- |
| **Java JDK**    | OpenJDK 21 (or JDK 17)         | `C:\Program Files\Android\Android Studio\jbr`  |
| **Android NDK** | `28.2.13676358`                | `%LOCALAPPDATA%\Android\Sdk\ndk\28.2.13676358` |
| **Node.js**     | v20+ / v22+                    |                                                |
| **Android SDK** | Build-Tools 36, Compile SDK 36 | `%LOCALAPPDATA%\Android\Sdk`                   |

> ⚠️ **Important**: Do not use JDK 25+ as system default Java for Gradle 8.x, as it will cause `Unsupported class file major version 69` errors. Always set `JAVA_HOME` to JDK 21.

---

## 3. Project Configuration

### `android/app/build.gradle`

Inside the `android { ... }` block, the ABI splits configuration is defined:

```groovy
android {
    ...
    splits {
        abi {
            reset()
            enable true
            universalApk true
            include "arm64-v8a", "armeabi-v7a", "x86_64"
        }
    }
}
```

Below the `android { ... }` block, unique version codes are assigned per ABI:

```groovy
// Map for the different ABI that React Native supports.
def abiCodes = ["armeabi-v7a": 1, "arm64-v8a": 2, "x86": 3, "x86_64": 4]

// Assign a different version code for each output APK
android.applicationVariants.all { variant ->
    variant.outputs.all { output ->
        def versionCodes = abiCodes
        def abi = output.filters.find { it.filterType == 'ABI' }?.identifier
        if (abi != null) {
            output.versionCodeOverride =
                versionCodes.get(abi) * 1048576 + variant.versionCode
        }
    }
}
```

### `android/gradle.properties`

Align target architectures and set JVM Java home:

```properties
# Specify Java Home to JDK 21 (Android Studio JBR)
org.gradle.java.home=C:/Program Files/Android/Android Studio/jbr

# Target Architectures
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86_64

# JS Engine & Features
hermesEnabled=true
newArchEnabled=true
```

### `android/build.gradle`

Specify the installed NDK version explicitly in top-level `buildscript`:

```groovy
buildscript {
  ext {
    ndkVersion = "28.2.13676358"
  }
  ...
}
```

---

### 🚀 Automatic Version Increment & Build (Recommended)

Simply run:
```bash
npm run release
```
This script will automatically:
1. Increment the version (`P.Q.R` format, e.g., `2.0.1` ➔ `2.0.2`).
2. Roll over `R` to `0` when reaching `10` and increment `Q` (e.g. `2.0.10` ➔ `2.1.0`).
3. Update `app.json`, `package.json`, and `android/app/build.gradle` (`versionName` & `versionCode`).
4. Execute `assembleRelease bundleRelease` automatically.

*(To bump version without triggering a build, run: `npm run release:bump`)*

---

### Manual Step-by-Step Build Execution

With `splits { abi { enable true; universalApk true; include "arm64-v8a", "armeabi-v7a", "x86_64" } }` configured in `android/app/build.gradle`, running Gradle directly produces **all 4 APKs simultaneously** along with the **Play Store App Bundle (.aab)**:

```powershell
cd "e:\web dev\Own\gighub\app\android"
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat assembleRelease bundleRelease --no-daemon
```

### Linux / macOS (Bash)

```bash
# 1. Navigate to android directory
cd android

# 2. Set JAVA_HOME and run release build for all 4 APKs + AAB
export JAVA_HOME="/path/to/jdk-21"
./gradlew clean assembleRelease bundleRelease --no-daemon
```

---

## 5. Generated Build Artifacts & Locations

### Release APKs (Simultaneously generated in one command)

Location: `android/app/build/outputs/apk/release/`

- **`app-arm64-v8a-release.apk`**: Release APK for modern 64-bit ARM devices (~46 MB)
- **`app-armeabi-v7a-release.apk`**: Release APK for older 32-bit ARM devices (~40 MB)
- **`app-x86_64-release.apk`**: Release APK for 64-bit Android Emulators & Intel Chromebooks (~47 MB)
- **`app-universal-release.apk`**: Universal APK containing all native binaries (~102 MB) — **Best for direct sideloading on any physical phone**

### Android App Bundle (AAB)

Location: `android/app/build/outputs/bundle/release/`

- **`app-release.aab`**: Production App Bundle for Google Play Store upload (~72 MB)

---

## 6. Troubleshooting & Gotchas

### 1. `Unsupported class file major version 69`

- **Cause**: Gradle is running with JDK 25 on system path.
- **Fix**: Ensure `org.gradle.java.home=C:/Program Files/Android/Android Studio/jbr` is set in `gradle.properties` or set `$env:JAVA_HOME` before calling `./gradlew`.

### 2. `Timeout waiting to lock build logic queue` / `buildLogic.lock`

- **Cause**: Another Gradle instance or IDE Java extension (e.g. RedHat Java Language Server) is locking `.gradle`.
- **Fix**: Terminate background Java processes and run with `--no-daemon`:
  ```powershell
  Get-Process | Where-Object { $_.Name -eq "java" } | Stop-Process -Force
  Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
  ```

### 3. `NDK at ... did not have a source.properties file`

- **Cause**: Interrupted/corrupted NDK download in SDK directory.
- **Fix**: Delete incomplete NDK folder from `%LOCALAPPDATA%\Android\Sdk\ndk` and specify working NDK version in `android/build.gradle` (`ext.ndkVersion = "28.2.13676358"`).

---

_Created on: 2026-07-20_
