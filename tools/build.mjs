// Builds dist/: bundled renderer + assets + Electron main/preload.
import { build } from "esbuild";
import fs from "fs";
import path from "path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

await import("./gen-registry.mjs");
// image manifest: resource name -> file
const imgs = {};
for (const f of fs.readdirSync(path.join(root, "assets/images"))) imgs[f.replace(/\.(svg|png)$/, "")] = f;
// v0.18.0: head variants (skin tones × hair colors for every head style) are generated into dist only
const { generateHeads } = await import("./gen-heads.mjs");
const heads = generateHeads(root);
for (const name of Object.keys(heads)) imgs[name] = "generated/" + name + ".svg";
fs.writeFileSync(path.join(root, "src/ui/images.json"), JSON.stringify(imgs));

await build({
    entryPoints: [path.join(root, "src/ui/main.ts")],
    bundle: true, outfile: path.join(dist, "renderer.js"), format: "iife", platform: "browser",
    target: ["chrome120"], sourcemap: true, loader: { ".txt": "text", ".ttf": "file" }, logLevel: "warning",
    external: ["assets/*"],
});
fs.copyFileSync(path.join(root, "src/ui/index.html"), path.join(dist, "index.html"));
fs.cpSync(path.join(root, "assets"), path.join(dist, "assets"), { recursive: true });
fs.mkdirSync(path.join(dist, "assets/images/generated"), { recursive: true });
for (const [name, text] of Object.entries(heads)) fs.writeFileSync(path.join(dist, "assets/images/generated", name + ".svg"), text);
fs.copyFileSync(path.join(root, "electron/main.cjs"), path.join(dist, "main.cjs"));
fs.copyFileSync(path.join(root, "electron/preload.cjs"), path.join(dist, "preload.cjs"));
fs.writeFileSync(path.join(dist, "package.json"), JSON.stringify({ name: "lifesim-upgraded", productName: "Life Simulator", version: JSON.parse(fs.readFileSync(path.join(root, "package.json"))).version, main: "main.cjs" }, null, 1));
console.log("built dist/");
