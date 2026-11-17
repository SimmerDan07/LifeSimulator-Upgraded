// Save-file codec: serialises the whole game object graph (classes, enums, BigIntegers,
// lists, maps, shared references) to JSON and rebuilds it with the right prototypes.
// Replaces kotlinx.serialization from the Android app. Saves are not compatible with
// the phone version's save files (they were never accessible anyway).
import { ArrayList, BigInteger, HashMap, HashSet, JEnum } from "../runtime";
import { allClasses } from "../registry";

const VERSION = 1;
let byCtor: Map<Function, string> | null = null;
let byName: Map<string, any> | null = null;

function index() {
    if (byCtor) return;
    byCtor = new Map(); byName = new Map();
    const seen = new Set<any>();
    const visit = (path: string, c: any) => {
        if (typeof c !== "function" || !c.prototype || seen.has(c)) return;
        seen.add(c);
        if (!byName!.has(path)) { byName!.set(path, c); byCtor!.set(c, path); }
        for (const k of Object.getOwnPropertyNames(c)) {
            if (k === "prototype" || k === "length" || k === "name") continue;
            let v: any;
            try { v = c[k]; } catch { continue; }
            if (typeof v === "function" && v.prototype && /^[A-Z]/.test(k) && !(v.prototype instanceof JEnum && false)) visit(path + "." + k, v);
        }
    };
    for (const [name, c] of Object.entries(allClasses())) visit(name, c);
}

function isFunctionObject(o: any): boolean {
    if (typeof o === "function") return true;
    if (o && Object.getPrototypeOf(o) === Object.prototype) {
        const vals = Object.values(o);
        return vals.length > 0 && vals.every((v) => typeof v === "function");
    }
    return false;
}

export const SaveCodec = {
    encode(root: any): string {
        index();
        const ids = new Map<any, number>();
        let next = 1;
        const enc = (v: any): any => {
            if (v === null || v === undefined) return null;
            const t = typeof v;
            if (t === "number") return Number.isFinite(v) ? v : { $n: String(v) };
            if (t === "string" || t === "boolean") return v;
            if (t === "bigint") return { $b: v.toString() };
            if (isFunctionObject(v)) return null;
            if (v instanceof BigInteger) return { $b: v.v.toString() };
            if (v instanceof JEnum) {
                const p = byCtor!.get(v.constructor);
                if (!p) throw new Error("enum not registered: " + v.constructor.name);
                return { $e: p, n: v.name() };
            }
            if (ids.has(v)) return { $r: ids.get(v) };
            if (v instanceof ArrayList) { const id = next++; ids.set(v, id); return { $l: Array.from(v, enc), $id: id }; }
            if (Array.isArray(v)) { const id = next++; ids.set(v, id); return { $a: v.map(enc), $id: id }; }
            if (v instanceof HashMap) { const id = next++; ids.set(v, id); return { $m: v.entrySet().map((e: any) => [enc(e.getKey()), enc(e.getValue())]), $id: id }; }
            if (v instanceof HashSet) { const id = next++; ids.set(v, id); return { $s: v.toArray().map(enc), $id: id }; }
            const p = byCtor!.get(v.constructor);
            if (!p) {
                if (Object.getPrototypeOf(v) === Object.prototype) {
                    const o: any = {};
                    for (const [k, x] of Object.entries(v)) o[k] = enc(x);
                    return { $o: o };
                }
                throw new Error("class not registered for saving: " + v.constructor?.name);
            }
            const id = next++; ids.set(v, id);
            const f: any = {};
            for (const k of Object.keys(v)) f[k] = enc(v[k]);
            return { $c: p, $id: id, f };
        };
        return JSON.stringify({ lifesimSave: VERSION, data: enc(root) });
    },

    decode(text: string): any {
        index();
        const doc = JSON.parse(text);
        if (doc.lifesimSave !== VERSION) throw new Error("unsupported save version " + doc.lifesimSave);
        const refs = new Map<number, any>();
        const dec = (j: any): any => {
            if (j === null || typeof j !== "object") return j;
            if (Array.isArray(j)) return j.map(dec);
            if ("$n" in j) return Number(j.$n);
            if ("$b" in j) return new BigInteger(j.$b);
            if ("$r" in j) return refs.get(j.$r);
            if ("$e" in j) {
                const E = byName!.get(j.$e);
                if (!E || !E[j.n]) throw new Error("unknown enum " + j.$e + "." + j.n);
                return E[j.n];
            }
            if ("$l" in j) { const l = new ArrayList(); refs.set(j.$id, l); for (const x of j.$l) l.push(dec(x)); return l; }
            if ("$a" in j) { const a: any[] = []; refs.set(j.$id, a); for (const x of j.$a) a.push(dec(x)); return a; }
            if ("$m" in j) { const m = new HashMap(); refs.set(j.$id, m); for (const [k, v] of j.$m) m.put(dec(k), dec(v)); return m; }
            if ("$s" in j) { const s = new HashSet(); refs.set(j.$id, s); for (const x of j.$s) s.add(dec(x)); return s; }
            if ("$o" in j) { const o: any = {}; for (const [k, x] of Object.entries(j.$o)) o[k] = dec(x); return o; }
            if ("$c" in j) {
                const C = byName!.get(j.$c);
                if (!C) throw new Error("unknown class in save: " + j.$c);
                const o = Object.create(C.prototype);
                refs.set(j.$id, o);
                for (const [k, x] of Object.entries(j.f)) o[k] = dec(x);
                return o;
            }
            return j;
        };
        return dec(doc.data);
    },
};
