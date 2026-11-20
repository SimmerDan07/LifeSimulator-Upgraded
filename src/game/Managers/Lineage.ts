// Family lines and compact past lives (v0.18.0) — built for saves that run for hundreds of generations.
//
// - Every life that ends gets a small permanent LifeRecord (~1 KB: name, ages, cause, badges, tombstone lines,
//   obituary) in `CemetaryState.records`, tagged with its family line (`Player.lineId`) and generation.
// - Only the newest KEEP_FULL lives keep their full snapshot in `CemetaryState.pastLives` (~35 KB each, with the
//   whole family, homes and businesses). Older lives are summarized by their record: their Life Summary still
//   shows the tombstone and obituary, but they can't be revived.
// - The Family Line screen pages through a line's generations from its records; the cemetery pages through all.
// - Older saves: records are made for every stored life the first time, the `ancestors` name list is turned into
//   records, and matching old snapshots are linked into the player's line.
import { Celebrity } from "../Lifepaths/Celebrity";
import { ArrayList, Pair, SpannableStringBuilder, Layout, R, UUID } from "../runtime";
import { AchievementBadge } from "../Enums/AchievementBadge";
import { GameStateManager } from "./GameStateManager";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { Obituary } from "./Obituary";

export interface LifeRecord {
    id: string;
    lineId: string;
    generation: number;
    /** Order of death (for "newest first"). */
    seq: number;
    name: string;
    sex: string;
    age: number;
    trueAge: number;
    cause: string;
    badges: string[];
    tombstone: [string, string][];
    obituary: string;
    obituaryRows: [string, string][];
    children: number;
    partner: string | null;
    vampireYears: number;
    /** v0.19.0: "Superstar (12.4M fans at the peak)" for famous lives. */
    fame?: string | null;
    /** Converted from an older save's ancestor list (only a name and age are known). */
    legacy?: boolean;
    appearance?: any;
    /** v0.28.0 Switch Life: handed everything to a child at this age (and still alive until `alive` is false). */
    retired?: { to: string; age: number };
    alive?: boolean;
}

const gsm = (): any => GameStateManager.INSTANCE.getGlobalStateManager();
const cem = (): any => gsm()?.getCemetaryState?.();

export const Lineage = {
    /** Full snapshots kept for the most recent lives. */
    KEEP_FULL: 25,

    records(c: any = cem()): LifeRecord[] {
        if (c == null) return [];
        if (!Array.isArray(c.records)) c.records = [];
        return c.records;
    },
    lineIdOf(p: any): string {
        if (p.lineId == null) p.lineId = UUID.randomUUID().toString();
        return p.lineId;
    },
    find(id: string, c: any = cem()): LifeRecord | null { return Lineage.records(c).find((r) => r.id === id) ?? null; },
    hasFull(id: string, c: any = cem()): boolean {
        if (c == null) return false;
        for (const x of c.getPastLives()) if ((x as any).getId() === id) return true;
        return false;
    },

    // ------------------------------------------------------------------ making records
    tombstonePairs(p: any): [string, string][] {
        try {
            return (p.tombstonePairs() as Pair<string, string>[]).map((x) => [String(x.component1()), String(x.component2())] as [string, string]);
        } catch { return []; }
    },
    /** Create or refresh the record for a life that has ended. */
    record(p: any, c: any = cem()): LifeRecord {
        const recs = Lineage.records(c);
        let r = recs.find((x) => x.id === p.getId());
        if (r && r.retired && r.alive === false) return r;   // v0.28.0: a retired life that has since ended
        const fam = (() => { try { return p.getFamilyState(); } catch { return null; } })();
        const partner = fam?.getPartner?.();
        let badges: string[] = [];
        try { badges = (Array.from(AchievementBadge.INSTANCE.getBadges(p) as any) as any[]).map((b) => b.name()); } catch { /* none */ }
        const data: LifeRecord = {
            id: p.getId(),
            lineId: Lineage.lineIdOf(p),
            generation: p.getGeneration?.() ?? 1,
            seq: r?.seq ?? (recs.reduce((m, x) => Math.max(m, x.seq ?? 0), 0) + 1),
            name: p.getFullName(),
            sex: p.getSex?.()?.name?.() ?? "male",
            age: p.getAgeInYears(),
            trueAge: p.getTrueAgeInYears?.() ?? p.getAgeInYears(),
            cause: p.deathCause ?? "",
            badges,
            tombstone: Lineage.tombstonePairs(p),
            obituary: (() => { try { return Obituary.text(p); } catch { return ""; } })(),
            obituaryRows: (() => { try { return Obituary.rows(p).map((x: any) => [String(x.component1()), String(x.component2())] as [string, string]); } catch { return []; } })(),
            children: (() => { try { return fam.getChildren().size(); } catch { return 0; } })(),
            partner: partner != null ? partner.getFullName() : null,
            vampireYears: Math.floor((p.vampire?.vampireWeeks ?? 0) / 48),
            fame: (() => { try { return Celebrity.fameLine(p); } catch { return null; } })(),
            ...(p.retiredTo ? { retired: { to: p.retiredTo, age: p.getAgeInYears() }, alive: true } : {}),
            appearance: p.appearance ?? undefined,
        };
        if (r) Object.assign(r, data); else { recs.push(data); r = data; }
        return r;
    },
    /** After a life is added to the cemetery: record it and keep only the newest full snapshots. */
    afterAddLife(c: any, p: any) {
        Lineage.record(p, c);
        Lineage.trim(c);
    },
    trim(c: any = cem()) {
        if (c == null) return;
        const lives = Array.from(c.getPastLives() as any) as any[];
        for (const x of lives) if (!Lineage.find(x.getId(), c)) Lineage.record(x, c);
        if (lives.length <= Lineage.KEEP_FULL) return;
        const keep = lives.slice(lives.length - Lineage.KEEP_FULL);
        const list = new ArrayList<any>();
        for (const x of keep) list.add(x);
        c.setPastLives(list);
    },

    // ------------------------------------------------------------------ older saves
    /** Records for older saves: every stored life, and the player's `ancestors` names linked into their line. */
    migrate(p: any = GameStateManager.INSTANCE.getPersonState()) {
        const c = cem();
        if (c == null || p == null) return;
        Lineage.trim(c);
        const line = Lineage.lineIdOf(p);
        const anc: string[] = p.getAncestors?.() ?? [];
        if (!anc.length || p.lineageMigrated) return;
        p.lineageMigrated = true;
        const recs = Lineage.records(c);
        anc.forEach((s, i) => {
            const m = /^(.*) \(died at (\d+)\)$/.exec(s);
            const name = m ? m[1] : s, age = m ? Number(m[2]) : 0;
            // an old full snapshot of this ancestor? link it into the line
            const match = recs.find((r) => r.lineId !== line && r.name === name && r.age === age && !r.legacy);
            if (match) { match.lineId = line; match.generation = i + 1; return; }
            if (recs.some((r) => r.lineId === line && r.generation === i + 1)) return;
            recs.push({ id: "legacy-" + line + "-" + (i + 1), lineId: line, generation: i + 1, seq: 0, name, sex: "male", age, trueAge: age, cause: "",
                badges: [], tombstone: [], obituary: "", obituaryRows: [], children: 0, partner: null, vampireYears: 0, legacy: true });
        });
    },

    // ------------------------------------------------------------------ reading
    /** A family line, oldest generation first (records only; the living player is not included). */
    line(p: any): LifeRecord[] {
        Lineage.migrate(p);
        const id = Lineage.lineIdOf(p);
        return Lineage.records().filter((r) => r.lineId === id).sort((a, b) => a.generation - b.generation || (a.seq ?? 0) - (b.seq ?? 0));
    },
    /** All past lives, newest first. */
    all(): LifeRecord[] {
        Lineage.trim();
        return Lineage.records().filter((r) => !r.legacy).sort((a, b) => (b.seq ?? 0) - (a.seq ?? 0));
    },
    /** The tombstone text for an archived life (same layout as Player.getGetDeathTombstoneString). */
    tombstone(r: LifeRecord): SpannableStringBuilder {
        const grey = R.color.tombstoneTextGrey;
        const sb = ExtensionsKt.appendNewline(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(
            ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), r.name, grey, null, Layout.Alignment.ALIGN_CENTER, 4, null)),
            Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.identity_name_age), String(r.age)), grey, null, Layout.Alignment.ALIGN_CENTER, 4, null)));
        for (const b of r.badges) {
            try { sb.append((AchievementBadge as any).valueOf(b).getGetBadgeSpannableString()); ExtensionsKt.appendNormal$default(sb, "  ", null, null, null, 14, null); } catch { /* unknown badge */ }
        }
        ExtensionsKt.appendNewline(sb); ExtensionsKt.appendNewline(sb);
        const rows: [string, string][] = r.tombstone.length ? r.tombstone : [["Generation", String(r.generation)]];
        for (const [k, v] of rows) ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(sb, k + ": ", grey, 12, null, 8, null), v, grey, 12, null, 8, null));
        return sb;
    },
};
