// Appearance (v0.18.0): everyone has one look for life — a head style, a skin tone and a hair color — so a
// baby grows into a child, adult and elder who still looks like the same person, and families resemble each other.
//
// - The look is saved on the person (`appearance`). People from older saves get one the first time they're shown:
//   the player keeps the original look, and family is worked out from the player (parents, siblings and children
//   look related); everyone else gets a stable look from their id.
// - Children take after their parents (a skin tone between theirs, one parent's hair), relatives take after the
//   parent they come from; partners, friends and strangers are random across all tones.
// - Head art: see tools/gen-heads.mjs. Styles come from src/game/data/heads.json (style 0 = the original heads).
import HEADS from "../data/heads.json";
import { GameStateManager } from "../Managers/GameStateManager";
import { AgeGroup } from "../Enums/AgeGroup";
import { Relationship } from "../Enums/Relationship";
import { Sex } from "../Enums/Sex";

export interface Look { style: number; skin: number; hair: number }

const H: any = HEADS;
export const SKIN_NAMES: string[] = H.skins;
export const HAIR_NAMES: string[] = H.hairs;
const SKINS = SKIN_NAMES.length, HAIRS = HAIR_NAMES.length;
/** Look given to people from older saves (the original art). */
export const ORIGINAL: Look = { style: 0, skin: 1, hair: 0 };

const player = (): any => { try { return GameStateManager.INSTANCE.getPersonState(); } catch { return null; } };
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
/** Small seeded random (stable looks for people without one yet). */
const seeded = (seed: string) => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
};

export const Appearance = {
    sexKey(sex: any): "male" | "female" { return sex === Sex.female || sex?.name?.() === "female" || sex === "female" ? "female" : "male"; },
    styles(sex: any): number[] { return (H.styles[Appearance.sexKey(sex)] ?? []).map((s: any) => s.id); },
    hasAge(sex: any, style: number, age: number): string | null {
        const st = (H.styles[Appearance.sexKey(sex)] ?? []).find((s: any) => s.id === style);
        return st?.ages?.[String(age)] ?? null;
    },
    ageIndex(group: AgeGroup): number {
        if (group === AgeGroup.baby) return 1;
        if (group === AgeGroup.child) return 2;
        if (group === AgeGroup.elder) return 4;
        return 3;
    },
    valid(l: any): boolean { return l != null && Number.isInteger(l.skin) && Number.isInteger(l.hair) && Number.isInteger(l.style); },

    // ------------------------------------------------------------------ rolling looks
    randomHair(skin: number, rnd = Math.random): number {
        // hair colors that fit the skin tone, with some variety
        const w = skin >= 4 ? [35, 60, 0, 0, 5] : skin >= 2 ? [40, 35, 7, 3, 15] : [30, 15, 20, 10, 25];
        let r = rnd() * w.reduce((a, b) => a + b, 0);
        for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return Math.min(i, HAIRS - 1); }
        return 0;
    },
    randomStyle(sex: any, rnd = Math.random): number { const s = Appearance.styles(sex); return s.length ? s[Math.floor(rnd() * s.length)] : 0; },
    random(sex: any, rnd = Math.random): Look {
        const skin = Math.floor(rnd() * SKINS);
        return { style: Appearance.randomStyle(sex, rnd), skin, hair: Appearance.randomHair(skin, rnd) };
    },
    /** Someone related to `base` (a parent, a grandparent): close skin tone, often the same hair. */
    near(base: Look, sex: any, rnd = Math.random): Look {
        const r = rnd();
        const d = r < 0.55 ? 0 : r < 0.9 ? (rnd() < 0.5 ? -1 : 1) : (rnd() < 0.5 ? -2 : 2);
        const skin = clamp(base.skin + d, 0, SKINS - 1);
        return { style: Appearance.randomStyle(sex, rnd), skin, hair: rnd() < 0.6 ? base.hair : Appearance.randomHair(skin, rnd) };
    },
    /** A child of `a` (and `b`, if known): skin tone between the parents', one parent's hair. */
    childOf(a: Look, b: Look | null, sex: any, rnd = Math.random): Look {
        if (b == null) {
            const skin = clamp(a.skin + (rnd() < 0.6 ? 0 : rnd() < 0.5 ? -1 : 1), 0, SKINS - 1);
            return { style: Appearance.randomStyle(sex, rnd), skin, hair: rnd() < 0.55 ? a.hair : Appearance.randomHair(skin, rnd) };
        }
        const lo = Math.min(a.skin, b.skin), hi = Math.max(a.skin, b.skin);
        const skin = lo + Math.floor(rnd() * (hi - lo + 1));
        const r = rnd();
        const hair = r < 0.45 ? a.hair : r < 0.9 ? b.hair : Appearance.randomHair(skin, rnd);
        return { style: Appearance.randomStyle(sex, rnd), skin, hair };
    },

    // ------------------------------------------------------------------ the look of anyone
    set(x: any, l: Look): Look { x.appearance = { style: l.style, skin: l.skin, hair: l.hair }; return x.appearance; },
    /** Their look (given one now if they don't have one yet). */
    of(x: any): Look {
        if (x == null) return ORIGINAL;
        if (Appearance.valid(x.appearance)) return x.appearance;
        return Appearance.set(x, Appearance.derive(x));
    },
    /** A look for someone who doesn't have one, from their family where possible. */
    derive(x: any): Look {
        const p = player();
        const sex = x.getSex?.() ?? Sex.male;
        const rnd = seeded(String(x.getId?.() ?? x.id ?? x.getFullName?.() ?? Math.random()));
        if (p == null) return Appearance.random(sex, rnd);
        if (x === p) return { ...ORIGINAL };   // older saves: the player keeps the original look
        const me = Appearance.of(p);
        let kind: string | null = null;
        try { kind = x.kind ?? null; } catch { /* Person */ }
        if (kind == null) {
            const rel = x.getRelationship?.();
            if (rel === Relationship.parent) return Appearance.near(me, sex, rnd);
            if (rel === Relationship.child) {
                const partner = p.getFamilyState?.()?.getPartner?.();
                return Appearance.childOf(me, partner != null ? Appearance.of(partner) : null, sex, rnd);
            }
            return Appearance.random(sex, rnd);
        }
        const find = (id: string | null) => { if (!id) return null; try { return require_Relationships().find(id, p); } catch { return null; } };
        const parents = () => (Array.from(p.getFamilyState().getParents() as any) as any[]);
        switch (kind) {
            case "sibling": {
                const [a, b] = parents();
                return a ? Appearance.childOf(Appearance.of(a), b ? Appearance.of(b) : null, sex, rnd) : Appearance.near(me, sex, rnd);
            }
            case "grandparent": {
                const par = find(x.side);
                return Appearance.near(par ? Appearance.of(par) : me, sex, rnd);
            }
            case "auntUncle": {
                const par = find(x.side);
                return Appearance.near(par ? Appearance.of(par) : me, sex, rnd);
            }
            case "cousin": case "nibling": case "grandchild": case "greatGrandchild": {
                const par = find(x.parentId);
                return Appearance.childOf(par ? Appearance.of(par) : me, null, sex, rnd);
            }
            default: return Appearance.random(sex, rnd);
        }
    },
    /** The head image for a person at their current age. */
    head(x: any): any {
        const sex = x.getSex?.() ?? Sex.male;
        let group: AgeGroup;
        try { group = x.getAgeGroup(); } catch { group = AgeGroup.youngAdult; }
        return Appearance.headFor(sex, group, Appearance.of(x));
    },
    /** Head image name for a sex, age group and look (falls back to the original style for a missing age). */
    headFor(sex: any, group: AgeGroup, l: Look): any {
        const age = Appearance.ageIndex(group);
        const sx = Appearance.sexKey(sex);
        let style = l?.style ?? 0;
        let kind = Appearance.hasAge(sex, style, age);
        if (kind == null) { style = 0; kind = "svg"; }
        if (kind === "png") return `head_${sx}_s${style}_${age}`;
        return `hv_${sx[0]}${age}_${style}_s${clamp(l?.skin ?? 1, 0, SKINS - 1)}_h${clamp(l?.hair ?? 0, 0, HAIRS - 1)}`;
    },
    describe(x: any): string {
        const l = Appearance.of(x);
        return `${SKIN_NAMES[l.skin] ?? ""} skin · ${(HAIR_NAMES[l.hair] ?? "").toLowerCase()} hair`;
    },
};

// Relationships imports this module's users; load it lazily to avoid an import cycle at startup.
import { Relationships } from "./Relationships";
function require_Relationships() { return Relationships; }
