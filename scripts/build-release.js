const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const appJsonPath = path.join(rootDir, 'app.json');
const packageJsonPath = path.join(rootDir, 'package.json');
const buildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');

function bumpVersion() {
  console.log('🔄 Reading current app version...');

  // 1. Read app.json
  const appJsonRaw = fs.readFileSync(appJsonPath, 'utf8');
  const appJson = JSON.parse(appJsonRaw);
  const currentVersion = appJson.expo.version || '2.0.0';

  // 2. Parse version numbers P.Q.R
  let [p, q, r] = currentVersion.split('.').map(Number);

  // 3. Auto increment logic:
  // Increment R by 1. If R > 10, reset R to 0 and increment Q by 1. If Q > 10, reset Q to 0 and increment P by 1.
  r += 1;
  if (r > 10) {
    r = 0;
    q += 1;
    if (q > 10) {
      q = 0;
      p += 1;
    }
  }

  const newVersion = `${p}.${q}.${r}`;
  // Calculate versionCode dynamically (e.g. 2.0.1 -> 20001, 2.1.0 -> 20100)
  const newVersionCode = p * 10000 + q * 100 + r;

  console.log(`✨ Version bumped from v${currentVersion} ➔ v${newVersion} (versionCode: ${newVersionCode})`);

  // 4. Update app.json
  appJson.expo.version = newVersion;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
  console.log('✅ Updated app.json');

  // 5. Update package.json
  if (fs.existsSync(packageJsonPath)) {
    const pkgRaw = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(pkgRaw);
    pkg.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('✅ Updated package.json');
  }

  // 6. Update android/app/build.gradle
  if (fs.existsSync(buildGradlePath)) {
    let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
    gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`);
    gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "${newVersion}"`);
    fs.writeFileSync(buildGradlePath, gradleContent, 'utf8');
    console.log('✅ Updated android/app/build.gradle');
  }

  return { newVersion, newVersionCode };
}

function runBuild() {
  const isWindows = process.platform === 'win32';
  const androidDir = path.join(rootDir, 'android');
  
  // Custom Java Home check for Windows
  const defaultJavaHome = 'C:\\Program Files\\Android\\Android Studio\\jbr';
  const envJavaHome = process.env.JAVA_HOME || (fs.existsSync(defaultJavaHome) ? defaultJavaHome : null);

  const env = { ...process.env };
  if (envJavaHome) {
    env.JAVA_HOME = envJavaHome;
  }

  console.log('\n🚀 Starting Android Release Build (assembleRelease bundleRelease)...');
  const command = isWindows ? '.\\gradlew.bat assembleRelease bundleRelease --no-daemon' : './gradlew assembleRelease bundleRelease --no-daemon';

  try {
    execSync(command, {
      cwd: androidDir,
      env: env,
      stdio: 'inherit'
    });
    console.log('\n🎉 RELEASE BUILD SUCCESSFUL!');
  } catch (error) {
    console.error('\n❌ Release build failed:', error.message);
    process.exit(1);
  }
}

// Execute
const args = process.argv.slice(2);
const skipBump = args.includes('--no-bump');
const skipBuild = args.includes('--no-build');

if (!skipBump) {
  bumpVersion();
}

if (!skipBuild) {
  runBuild();
}
