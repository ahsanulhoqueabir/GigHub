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
            universalApk false
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

## 4. Step-by-Step Build Execution

### Windows (PowerShell)

```powershell
# 2. (Optional) Re-generate native android directory if needed
npx expo prebuild --platform android

# Navigate to android directory
cd "e:\web dev\Own\gighub\app\android"

# Set JAVA_HOME to JDK 21
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"

# 1. Build arm64-v8a Release APK (~35 MB - Modern 64-bit phones):
.\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a --no-daemon

# 2. Build armeabi-v7a Release APK (~30 MB - Older 32-bit phones):
.\gradlew.bat assembleRelease -PreactNativeArchitectures=armeabi-v7a --no-daemon

# 3. Build x86_64 Release APK (~36 MB - Emulators & Intel Chromebooks):
.\gradlew.bat assembleRelease -PreactNativeArchitectures=x86_64 --no-daemon

# 4. Build Universal Release APK (~107 MB - All devices) + AAB for Play Store:
.\gradlew.bat assembleRelease bundleRelease --no-daemon
```

#5. Single command

```
.\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a --no-daemon

```

### Linux / macOS (Bash)

```bash
# 1. Navigate to android directory
cd android

# 2. Set JAVA_HOME and run clean release build
export JAVA_HOME="/path/to/jdk-21"
./gradlew clean assembleRelease bundleRelease --no-daemon
```

---

## 5. Generated Build Artifacts & Locations

### Release APKs (Split by Architecture & Universal)

Location: `android/app/build/outputs/apk/release/`

- **`app-universal-release.apk`**: Universal APK containing all native binaries (~83 MB) — **Best for direct sideloading on any physical phone**
- **`app-arm64-v8a-release.apk`**: Release APK for modern 64-bit devices (~35 MB)
- **`app-armeabi-v7a-release.apk`**: Release APK for 32-bit devices (~30 MB)
- **`app-x86_64-release.apk`**: Release APK for emulators / Intel Chromebooks (~36 MB)

### Android App Bundle (AAB)

Location: `android/app/build/outputs/bundle/release/`

- **`app-release.aab`**: Production App Bundle for Google Play Store upload (~51 MB)

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
