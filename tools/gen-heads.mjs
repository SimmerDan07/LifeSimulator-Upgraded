// Head variants (v0.18.0): every head style in 6 skin tones × 5 hair colors, so people look different and keep
// the same look from baby to elder.
//
// Head styles in assets/images:
//   style 0 (the original game):  head_male_1..4.svg, head_female_1..4.svg
//   new styles (your art):        head_male_s<N>_<age>.svg|png, head_female_s<N>_<age>.svg|png
//                                 age 1 = baby, 2 = child, 3 = adult, 4 = elder; N = 1, 2, 3...
// SVG heads drawn with the original palette are recolored automatically (see BASE below); PNG heads are used
// exactly as drawn. A style missing an age uses style 0 for that age.
//
// Writes src/game/data/heads.json (which styles exist) and returns the generated SVGs { name: text }.
// Generated names: hv_<m|f><age>_<style>_s<skin>_h<hair>.
import fs from "fs";
import path from "path";

/** The original art's colors. */
export const BASE = {
    face: "#ffd5ab", ear: "#f9c19b", blush: "#fcb19a", line: "#e2a586", eyes: "#442106", mouth: "#935d4a",
    hair: "#59351c", hair2: "#4c2d18",
};
export const SKINS = [
    { name: "Fair", face: "#ffe3cc", ear: "#f6cbb0", blush: "#fbb5a5", line: "#e6b9a0", eyes: "#442106", mouth: "#935d4a" },
    { name: "Light", face: "#ffd5ab", ear: "#f9c19b", blush: "#fcb19a", line: "#e2a586", eyes: "#442106", mouth: "#935d4a" },
    { name: "Tan", face: "#eab58a", ear: "#dba077", blush: "#e8977f", line: "#c88b66", eyes: "#3d1d06", mouth: "#874f3c" },
    { name: "Olive", face: "#cf9a68", ear: "#bd8656", blush: "#cc7f62", line: "#a8744a", eyes: "#341905", mouth: "#6e3b2a" },
    { name: "Brown", face: "#a86d42", ear: "#955d36", blush: "#a95a42", line: "#80502f", eyes: "#241004", mouth: "#4f2416" },
    { name: "Deep", face: "#77492b", ear: "#663c22", blush: "#7d3f2c", line: "#55331c", eyes: "#170a02", mouth: "#38170c" },
];
export const HAIRS = [
    { name: "Brown", hair: "#59351c", hair2: "#4c2d18" },
    { name: "Black", hair: "#2a2220", hair2: "#1f1917" },
    { name: "Blonde", hair: "#e3b75e", hair2: "#cfa04a" },
    { name: "Red", hair: "#b4471f", hair2: "#9c3b19" },
    { name: "Light Brown", hair: "#8d5c2c", hair2: "#7b4f25" },
];

export function recolor(svg, skin, hair) {
    const map = {
        [BASE.face]: skin.face, [BASE.ear]: skin.ear, [BASE.blush]: skin.blush, [BASE.line]: skin.line,
        [BASE.eyes]: skin.eyes, [BASE.mouth]: skin.mouth, [BASE.hair]: hair.hair, [BASE.hair2]: hair.hair2,
    };
    return svg.replace(/#[0-9a-fA-F]{6}\b/g, (c) => map[c.toLowerCase()] ?? c);
}

export function generateHeads(root) {
    const dir = path.join(root, "assets/images");
    const out = {};
    // styles[sex][style] = { 1: "svg"|"png", ... }
    const styles = { male: { 0: {} }, female: { 0: {} } };
    const sources = [];
    for (const f of fs.readdirSync(dir)) {
        let m = /^head_(male|female)_([1-4])\.svg$/.exec(f);
        if (m) { styles[m[1]][0][m[2]] = "svg"; sources.push({ sex: m[1], style: 0, age: m[2], file: f, kind: "svg" }); continue; }
        m = /^head_(male|female)_s(\d+)_([1-4])\.(svg|png)$/.exec(f);
        if (m) {
            const st = Number(m[2]);
            (styles[m[1]][st] ??= {})[m[3]] = m[4];
            sources.push({ sex: m[1], style: st, age: m[3], file: f, kind: m[4] });
        }
    }
    for (const s of sources) {
        if (s.kind !== "svg") continue;
        const text = fs.readFileSync(path.join(dir, s.file), "utf8");
        SKINS.forEach((skin, k) => HAIRS.forEach((hair, h) => {
            out[`hv_${s.sex[0]}${s.age}_${s.style}_s${k}_h${h}`] = recolor(text, skin, hair);
        }));
    }
    const manifest = {
        skins: SKINS.map((s) => s.name),
        hairs: HAIRS.map((h) => h.name),
        styles: Object.fromEntries(Object.entries(styles).map(([sex, st]) => [sex, Object.entries(st).map(([id, ages]) => ({ id: Number(id), ages }))
            .filter((x) => Object.keys(x.ages).length > 0).sort((a, b) => a.id - b.id)])),
    };
    fs.mkdirSync(path.join(root, "src/game/data"), { recursive: true });
    fs.writeFileSync(path.join(root, "src/game/data/heads.json"), JSON.stringify(manifest, null, 1));
    return out;
}

// node tools/gen-heads.mjs → just refresh heads.json
if (import.meta.url === `file://${process.argv[1]}`) {
    const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
    const n = Object.keys(generateHeads(root)).length;
    console.log(`heads.json written; ${n} head variants`);
}
