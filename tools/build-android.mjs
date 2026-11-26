// Prepares the Android app (android/, a Capacitor project): builds the game, copies it into the app as
// web assets, and sets the app version from package.json. Then build the APK on Windows with "Build APK.bat"
// (needs Android Studio), or anywhere with:  cd android && ./gradlew assembleRelease
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
await import("./build.mjs");

const dist = path.join(root, "dist"), web = path.join(root, "dist-android");
fs.rmSync(web, { recursive: true, force: true });
fs.cpSync(dist, web, { recursive: true, filter: (src) => !/(main\.cjs|preload\.cjs|package\.json|\.map)$/.test(src) });

// Touch screens: size to the device, no pinch zoom. Capacitor injects a small inline script, so allow it.
const indexPath = path.join(web, "index.html");
let html = fs.readFileSync(indexPath, "utf8");
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">');
html = html.replace("default-src 'self';", "default-src 'self'; script-src 'self' 'unsafe-inline';");
html = html.replace("<body", '<body class="android"');
fs.writeFileSync(indexPath, html);

// App version: 0.8.0 -> versionName "0.8.0", versionCode 800 (must go up for updates to install over the old one).
const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"))).version;
const [a, b, c] = version.split(".").map((n) => parseInt(n, 10) || 0);
const gradlePath = path.join(root, "android/app/build.gradle");
let gradle = fs.readFileSync(gradlePath, "utf8");
gradle = gradle.replace(/versionCode \d+/, `versionCode ${a * 10000 + b * 100 + c}`).replace(/versionName "[^"]*"/, `versionName "${version}"`);
fs.writeFileSync(gradlePath, gradle);
fs.writeFileSync(path.join(root, "android/app/version.txt"), version);  // used by "Build APK.bat" for the file name

execSync("npx cap sync android", { cwd: root, stdio: "inherit" });
console.log(`android/ ready (v${version})`);
