// Builds dist-web/: the game as a web app for iPhone (Safari › Share › Add to Home Screen) and any browser.
// Saves stay on the device (IndexedDB, see src/ui/main.ts); a service worker keeps an offline copy.
// GitHub Actions (.github/workflows/web.yml) publishes it to the gh-pages branch → GitHub Pages.
import fs from "fs";
import path from "path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
await import("./build.mjs");
const dist = path.join(root, "dist"), web = path.join(root, "dist-web"), src = path.join(root, "web");
const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"))).version;
fs.rmSync(web, { recursive: true, force: true });
fs.cpSync(dist, web, { recursive: true, filter: (f) => !/(main\.cjs|preload\.cjs|package\.json|\.map)$/.test(f) });
for (const f of ["pwa.js", "icon-180.png", "icon-192.png", "icon-512.png"]) fs.copyFileSync(path.join(src, f), path.join(web, f));
fs.writeFileSync(path.join(web, "manifest.webmanifest"), JSON.stringify({
    name: "Life Simulator", short_name: "Life Sim", start_url: "./", scope: "./", display: "standalone",
    orientation: "any", background_color: "#3a3a3a", theme_color: "#3a3a3a",
    icons: [{ src: "icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png" }],
}, null, 1));

let html = fs.readFileSync(path.join(web, "index.html"), "utf8");
html = html.replace('<meta charset="utf-8">', [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-title" content="Life Sim">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
    '<meta name="theme-color" content="#3a3a3a">',
    '<meta name="format-detection" content="telephone=no">',
    '<link rel="manifest" href="manifest.webmanifest">',
    '<link rel="apple-touch-icon" href="icon-180.png">',
    '<link rel="icon" type="image/png" href="icon-192.png">',
].join("\n"));
html = html.replace("<body", '<body class="android web"');   // touch styling (no text selection, no tap flash)
html = html.replace('<script src="renderer.js"></script>', '<script src="renderer.js"></script>\n<script src="pwa.js"></script>');
fs.writeFileSync(path.join(web, "index.html"), html);

// the offline copy: every file in dist-web
const files = [];
const walk = (d, rel = "") => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const r = rel ? rel + "/" + e.name : e.name; if (e.isDirectory()) walk(path.join(d, e.name), r); else files.push(r); } };
walk(web);
files.sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));
const sw = fs.readFileSync(path.join(src, "sw.template.js"), "utf8").replace("__VERSION__", version).replace("__FILES__", JSON.stringify(files.map((f) => f.split("/").map(encodeURIComponent).join("/"))));
fs.writeFileSync(path.join(web, "sw.js"), sw);
fs.writeFileSync(path.join(web, ".nojekyll"), "");
let bytes = 0; for (const f of files) bytes += fs.statSync(path.join(web, f)).size;
console.log(`dist-web ready (v${version}): ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB`);
