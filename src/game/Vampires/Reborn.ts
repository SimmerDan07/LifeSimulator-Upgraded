// v0.35.0 "Vampires Reborn": the core layer on top of the Vampire lifepath (Lifepaths/Vampire.ts).
// - State lives on p.vampire.rb (a plain object; old saves get it on first use and a one-time "You've Been Reborn").
// - Hunger = the old thirst bar (stages), Rumours = the old suspicion bar. New: Humanity (0–10), Vitality (0–100),
//   the week's weather and sunlight, blood age and rank, the five-discipline power tree, frenzy with a choice, and
//   torpor in four kinds (starving, chosen, lost to the Beast, staked) instead of one sudden collapse.
// - A vampire never dies unless they choose Final Rest (v0.30.1): every bad outcome takes years, power or Humanity.
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { LifeMoments } from "../Managers/LifeMoments";
import { Modifiers } from "../Managers/Modifiers";
import { Constants } from "../Utils/Constants";
import { seasonForMonth, COUNTRY_BY_ID } from "../World/WorldData";
import { R } from "../runtime";
import { Vampire } from "../Lifepaths/Vampire";
import { Relationships } from "../Social/Relationships";
import { Subscriptions } from "../Managers/Subscriptions";
import { Work } from "../Work/Work";
import { BLOODLINES, lineOf, RANKS, TREE, TIER_COST, WEATHER, CLIMATE_WEATHER, FAR_NORTH, STANDING, type Weather, type PowerNode, type LineId } from "./VData";

export const player = (): any => GameStateManager.INSTANCE.getPersonState();
export const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
export const roll = (x: number) => Math.random() < x;
export const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const img = (k: string) => (R.drawable as any)[k] ?? k;
export const now = (p: any) => { try { return p.getTrueAgeInWeeks(); } catch { return 0; } };
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));

export interface RebornState {
    v: number;
    converted?: boolean;
    // becoming
    sireId: string | null; sireName: string; sireAge: number; sireLine: LineId | null;
    line: LineId | null; way: string | null; meetings: number; seekStep: number; nightOuts: number; lastNight: string | null;
    // the Beast, the body
    humanity: number; vitality: number; sunburnWeeks: number; burnWeeks: number; cleanWeeks: number; frenzies: number;
    warned80: boolean; warned95: boolean; dayFree: number;
    // the world
    weather: Weather; weatherWeek: number; nightMode: boolean;
    bloodAgeWeeks: number; reshapedCentury: number;
    // Masquerade
    hunt: number; hunter: { name: string; base: string; martyrs: number; stage: number } | null; cover: boolean; cityWeek: number; identityWeek: number;
    // court
    city: string | null; courtIds: string[]; princeId: string | null; standing: number; owed: number; owing: number;
    rivalId: string | null; allyIds: string[]; domain: string | null; lastCourt: number; lastTask: number;
    task: { id: string; title: string; until: number; power: string } | null; lastRivalry: number;
    // feeding
    vintages: Record<string, number>; lastHunt: number; herdIds: string[];
    // forever
    lair: string[]; vault: number; eraYear: number; legend: number; neverLove: boolean;
    golconda: boolean; at10Weeks: number; golcondaStep: number; cureResearch: number; milestones: Record<string, number[]>;
    lastAntique: number; lastAgeing: number;
}

export const Reborn = {
    // ------------------------------------------------------------------ state
    st(p: any = player()): RebornState {
        const v = Vampire.state(p) as any;
        if (v.rb == null) {
            v.rb = Reborn.fresh();
            // a vampire from before v0.35 (no new state yet): convert now, before anything reads the defaults
            if (v.isVampire && !Reborn.converting && Reborn.convertHook) { try { Reborn.convertHook(p); } catch (e) { console.error(e); } }
        }
        const r = v.rb as RebornState;
        // fields added later (keep old rb objects whole)
        const f = Reborn.fresh() as any;
        for (const k of Object.keys(f)) if ((r as any)[k] === undefined) (r as any)[k] = f[k];
        return r;
    },
    peek(p: any = player()): RebornState | null { return p?.vampire?.rb ?? null; },
    /** Set at install: converts an old vampire the first time the new state is made. */
    convertHook: null as ((p: any) => void) | null,
    /** True while a vampire is being made in the new way (no "You've Been Reborn"). */
    converting: false,
    fresh(): RebornState {
        return {
            v: 1, sireId: null, sireName: "", sireAge: 0, sireLine: null, line: null, way: null, meetings: 0, seekStep: 0, nightOuts: 0, lastNight: null,
            humanity: 7, vitality: 100, sunburnWeeks: 0, burnWeeks: 0, cleanWeeks: 0, frenzies: 0, warned80: false, warned95: false, dayFree: -1,
            weather: "cloudy", weatherWeek: -1, nightMode: false, bloodAgeWeeks: 0, reshapedCentury: -1,
            hunt: 0, hunter: null, cover: false, cityWeek: 0, identityWeek: 0,
            city: null, courtIds: [], princeId: null, standing: 10, owed: 0, owing: 0, rivalId: null, allyIds: [], domain: null,
            lastCourt: -99, lastTask: -99, task: null, lastRivalry: 0,
            vintages: {}, lastHunt: -1, herdIds: [],
            lair: [], vault: 0, eraYear: 0, legend: 0, neverLove: false, golconda: false, at10Weeks: 0, golcondaStep: 0, cureResearch: 0, milestones: {},
            lastAntique: 0, lastAgeing: 0,
        };
    },
    on(p: any = player()): boolean { return Vampire.isVampire(p) && (p?.vampire?.cureWeeks ?? 0) === 0; },

    // ------------------------------------------------------------------ bloodline, age and rank
    line(p: any = player()) { return lineOf(Reborn.st(p).line); },
    isLine(id: LineId, p: any = player()): boolean { return Vampire.isVampire(p) && Reborn.peek(p)?.line === id; },
    bloodYears(p: any = player()): number { return Math.floor((Reborn.peek(p)?.bloodAgeWeeks ?? Vampire.peek(p)?.vampireWeeks ?? 0) / WPY()); },
    rankIndex(p: any = player()): number { const y = Reborn.bloodYears(p); let i = 0; RANKS.forEach((r, k) => { if (y >= r.years) i = k; }); return i; },
    rank(p: any = player()) { return RANKS[Reborn.rankIndex(p)]; },
    nextRank(p: any = player()) { return RANKS[Reborn.rankIndex(p) + 1] ?? null; },
    standingTitle(p: any = player()): string { const s = Reborn.st(p).standing; let t = STANDING[0].title; for (const x of STANDING) if (s >= x.min) t = x.title; return t; },
    addStanding(p: any, n: number) { const r = Reborn.st(p); r.standing = clamp(r.standing + n, 0, 100); },

    // ------------------------------------------------------------------ Humanity
    humanity(p: any = player()): number { return Math.round(Reborn.peek(p)?.humanity ?? 7); },
    humanityTitle(h: number): string { return h >= 8 ? "Almost human" : h >= 4 ? "Vampire" : h >= 1 ? "Monster" : "Lost to the Beast"; },
    addHumanity(p: any, n: number, why?: string) {
        const r = Reborn.st(p);
        const before = Math.round(r.humanity);
        r.humanity = clamp(r.humanity + n, 0, 10);
        if (n < 0) r.cleanWeeks = 0;
        const after = Math.round(r.humanity);
        if (after !== before && why) Reborn.note(p, after > before ? "Humanity" : "The Beast Stirs", `${why} Humanity ${before} → ${after} (${Reborn.humanityTitle(after)}).`);
        if (r.humanity <= 0 && !Vampire.isInTorpor(p)) Reborn.pendingBeast = true;
    },
    pendingBeast: false,
    /** Relationship gains: Charm, your Humanity and the Nosferim's uncanny look. */
    gainFactor(p: any = player()): number {
        if (!Vampire.isVampire(p)) return 1;
        const h = Reborn.humanity(p);
        return (h >= 8 ? 1.1 : h <= 3 ? 0.8 : 1) * (Reborn.isLine("nosferim", p) ? 0.8 : 1);
    },

    // ------------------------------------------------------------------ weather and the sun
    country(p: any): string { try { return p.getCountry().name(); } catch { return "unitedStates"; } },
    season(p: any): string { let m = 0; try { m = p.getCurrentMonthIndex(); } catch { /* */ } return seasonForMonth(m, Reborn.country(p)); },
    /** This week's weather (rolled once a week from your country's climate and the season). */
    weather(p: any = player()): Weather {
        const r = Reborn.st(p);
        const w = now(p);
        if (r.weatherWeek !== w) { r.weather = Reborn.rollWeather(p); r.weatherWeek = w; }
        return r.weather;
    },
    rollWeather(p: any): Weather {
        const c = Reborn.country(p), season = Reborn.season(p);
        let m = 0; try { m = p.getCurrentMonthIndex(); } catch { /* */ }
        if (FAR_NORTH.has(c)) {
            if (m === 11 || m === 0) return "polarNight";
            if (m === 5 || m === 6) return "midnightSun";
        }
        const climate = COUNTRY_BY_ID[c]?.climate ?? "temperate";
        const table = CLIMATE_WEATHER[climate]?.[season] ?? CLIMATE_WEATHER.temperate.spring;
        let t = Math.random() * table.reduce((n, x) => n + x[1], 0);
        for (const [w, n] of table) { t -= n; if (t <= 0) return w; }
        return table[0][0];
    },
    weatherText(p: any = player()): string { const w = WEATHER[Reborn.weather(p)]; return `${w.title}: ${w.text}`; },
    /** 0 = no sun at all, 1 = a clear day (after your powers, age and bloodline). */
    sunlight(p: any = player()): number {
        const w = Reborn.weather(p);
        let light = WEATHER[w].light;
        const season = Reborn.season(p);
        light *= season === "summer" ? 1.2 : season === "winter" ? 0.8 : 1;
        if (w === "cloudy" && (Vampire.has("overcast", p) || Reborn.rankIndex(p) >= 2)) light = 0.1;
        if ((w === "cloudy" || w === "rainy" || w === "stormy") && Vampire.has("nightEternal", p)) light = 0;
        if (Vampire.has("sunWard", p)) light *= 0.5;
        if (Vampire.has("duskWalker", p)) light *= 0.5;
        if (Reborn.rankIndex(p) >= 3) light *= 0.5;
        light *= 1 - 0.05 * Math.min(10, Math.floor(Reborn.bloodYears(p) / 100));   // each century helps a little
        if (Reborn.isLine("ashen", p) && Reborn.bloodYears(p) < 25) light *= 1.5;
        if (Reborn.st(p).golconda) light *= 0.2;
        try { if (Subscriptions.on("spf999", p)) light *= 0.7; } catch { /* */ }
        return Math.max(0, light);
    },
    /** What a daytime outing costs this week: [happiness, vitality]. */
    sunCost(p: any = player(), outdoorJob = false): [number, number] {
        const l = Reborn.sunlight(p) * (outdoorJob ? 2 : 1);
        return [Math.round(10 * l), Math.round(25 * l)];
    },
    /** A daytime outing or day shift happened: the sun takes its toll (Daywalker shrugs off one a week). */
    exposed(p: any, outdoorJob = false, shift = false) {
        if (!Reborn.on(p)) return;
        const r = Reborn.st(p);
        if (Vampire.has("daywalker", p) && r.dayFree !== now(p)) { r.dayFree = now(p); return; }
        let [hap, vit] = Reborn.sunCost(p, outdoorJob);
        if (shift) { hap = Math.ceil(hap / 5); vit = Math.ceil(vit / 2); }
        if (hap > 0) attr(p, 0, -hap, 0);
        Reborn.addVitality(p, -vit);
        // caught out in the sun: rare, never fatal (v0.30.1), but a burn takes months to heal
        if (Reborn.sunlight(p) >= 0.8 && !shift && roll(0.03)) Reborn.caughtInSun(p);
    },
    addVitality(p: any, n: number) {
        const r = Reborn.st(p);
        const before = r.vitality;
        r.vitality = clamp(r.vitality + n, 0, 100);
        if (before > 0 && r.vitality === 0 && r.sunburnWeeks === 0) {
            r.sunburnWeeks = 4;
            Reborn.note(p, "Sunburned", "Too much daylight: your Vitality ran out. For the next 4 weeks you're sunburned (−2 happiness a week, weaker in fights and on the hunt). Stay in at night to recover.");
        }
    },
    caughtInSun(p: any) {
        const r = Reborn.st(p);
        const how = pick(["A fire alarm at noon forced you out into the street.", "Your car broke down on the highway, miles from shade.", "A hunter's trap: someone tore the curtains off your window at noon.", "You fell asleep somewhere you shouldn't have, and woke up in sunlight."]);
        r.burnWeeks = 24; r.vitality = 0; r.sunburnWeeks = Math.max(r.sunburnWeeks, 8);
        Vampire.harming = true;
        try { attr(p, -35, -10, -10); } finally { Vampire.harming = false; }
        LifeMoments.result("Caught in the Sun", `${how} Your skin blistered and smoked before you found shelter. You'll live (nothing kills a vampire but your own choice), but the burns will take about 6 months to heal: health can't go above 60 until then.`, img("icon_vamp_weather"), { random: true });
    },

    // ------------------------------------------------------------------ hunger
    stage(h: number): string { return h >= 95 ? "Torpor is near" : h >= 80 ? "Starving" : h >= 60 ? "Hungry" : h >= 30 ? "Peckish" : "Sated"; },
    stageText(h: number): string {
        return h >= 95 ? "Torpor is near: you're about to fall into torpor for years. Feed now."
            : h >= 80 ? "Starving: −2 happiness and −3 sanity a week, your powers weaken and frenzy is likely."
            : h >= 60 ? "Hungry: −1 happiness a week, and frenzy can strike."
            : h >= 30 ? "Peckish: nothing yet." : "Sated: you heal 3 health a week and your powers are at full strength.";
    },
    /** How fast hunger rises on top of the supply (bloodline, powers, Golconda). */
    rateFactor(p: any): number {
        let f = 1;
        if (Reborn.isLine("ironblood", p)) f *= 1.25;
        if (Vampire.has("ancientBlood", p)) f *= 0.4;
        if (Reborn.peek(p)?.golconda) f *= 0.25;
        return f;
    },

    // ------------------------------------------------------------------ the power tree
    node(id: string): PowerNode | undefined { return TREE.find((n) => n.id === id); },
    cost(n: PowerNode, p: any = player()): number {
        let c = TIER_COST[n.tier];
        if (Reborn.line(p).discipline === n.discipline) c -= 1;
        if (n.discipline === "beast" && Reborn.humanity(p) <= 3) c -= 1;   // a monster finds the Beast easy
        if (n.discipline === "beast" && Reborn.humanity(p) >= 8) c += 1;   // and the almost-human find it hard
        return Math.max(1, c);
    },
    powerLock(n: PowerNode, p: any = player()): string | null {
        if (Vampire.has(n.id, p)) return "You have this power";
        const rank = RANKS[Reborn.rankIndex(p)];
        if (n.tier > rank.tier) return `Needs ${RANKS[n.tier - 1].title} rank (${RANKS[n.tier - 1].years} years as a vampire)`;
        const prev = TREE.find((x) => x.discipline === n.discipline && x.tier === n.tier - 1);
        if (prev && !Vampire.has(prev.id, p)) return `Learn ${prev.title} first`;
        if (Vampire.state(p).bloodPower < Reborn.cost(n, p)) return `Needs ${Reborn.cost(n, p)} blood power`;
        return null;
    },
    learn(p: any, id: string): boolean {
        const n = Reborn.node(id);
        if (!n || Reborn.powerLock(n, p) != null) return false;
        const s = Vampire.state(p);
        s.bloodPower -= Reborn.cost(n, p);
        s.powers = [...(s.powers ?? []), n.id];
        return true;
    },
    /** Once a century: give back every power for its blood power and choose again. */
    canReshape(p: any = player()): string | null {
        if (!(Vampire.state(p).powers ?? []).length) return "You have no powers to reshape";
        const c = Math.floor(Reborn.bloodYears(p) / 100);
        return Reborn.st(p).reshapedCentury === c ? "Once a century: you've reshaped your powers this century" : null;
    },
    reshape(p: any) {
        const s = Vampire.state(p);
        let back = 0;
        for (const id of s.powers ?? []) { const n = Reborn.node(id); back += n ? TIER_COST[n.tier] : 1; }
        s.bloodPower += back;
        s.powers = [];
        Reborn.st(p).reshapedCentury = Math.floor(Reborn.bloodYears(p) / 100);
        return back;
    },

    // ------------------------------------------------------------------ frenzy
    frenzyChance(p: any): number {
        const s = Vampire.state(p);
        if (Vampire.has("thePack", p) || s.thirst < 60) return 0;
        let c = (s.thirst - 55) / 250;
        const h = Reborn.humanity(p);
        c *= h >= 8 ? 0.5 : h <= 3 ? 1.6 : 1;
        if (Reborn.isLine("moonborn", p)) c *= 1.5;
        if (Reborn.st(p).golconda) c = 0;
        return clamp(c, 0, 0.3);
    },
    /** Hungry and close to the edge: the Beast wants out. A random event (silenced: you resist). */
    frenzy(p: any) {
        const r = Reborn.st(p);
        const resist = clamp(0.35 + Reborn.humanity(p) * 0.05, 0.3, 0.85);
        const pct = Math.round(resist * 100);
        LifeMoments.ask("Frenzy", `Hunger claws at you. A stranger's pulse is so loud you can taste it, and the Beast wants out. (Resisting works ${pct}% of the time.)`, img("icon_vamp_humanity"), [
            [`Resist (${pct}%)`, () => {
                if (roll(resist)) { attr(p, 0, 0, -5); return "You dug your nails into your palms until it passed. Exhausting, but nobody got hurt (−5 sanity)."; }
                return Reborn.giveIn(p, true);
            }],
            ["Flee and lock yourself away", () => { attr(p, 0, -5, 0); Vampire.state(p).suspicion = clamp(Vampire.state(p).suspicion + 2, 0, 100); return "You ran home and bolted the door until the hunger dulled. People noticed you vanish mid-sentence (−5 happiness, Rumours +2)."; }],
            ["Give in", () => Reborn.giveIn(p, false)],
        ], { random: true, quiet: "positive" });
        r.frenzies++;
    },
    giveIn(p: any, lostControl: boolean): string {
        const s = Vampire.state(p);
        s.thirst = Math.max(0, s.thirst - 45); s.weeksAtMaxThirst = 0;
        const fam = Relationships.familyPeople(p).filter((x: any) => !Vampire.isTurned(x) && x.getPetType?.() == null && x.getIsAlive());
        const job = p.getJobState().getCurrentJob();
        const r = Math.random();
        let what: string;
        if (r < 0.5 || (!job && !fam.length)) { s.suspicion = clamp(s.suspicion + 15, 0, 100); Reborn.st(p).hunt = clamp(Reborn.st(p).hunt + 5, 0, 100); what = "You fell on a stranger in an alley and fed until they stopped struggling. They lived, barely, and they'll talk (Rumours +15, the Hunt +5)."; }
        else if ((r < 0.75 && job) || !fam.length) { p.getJobState().setCurrentJob(null); what = "You lost control at work and bit a coworker. You've been fired."; }
        else { const x: any = pick(fam as any[]); x.setRelationshipProgress(x.getRelationshipProgress() - 100); what = `In your hunger you lashed out at ${x.getFirstName()}. They're terrified of you now (−100 relationship).`; }
        Reborn.addHumanity(p, -1);
        return (lostControl ? "You couldn't hold it back. " : "") + what + " Hunger −45, Humanity −1.";
    },

    // ------------------------------------------------------------------ torpor
    /** Falls asleep for years. Kinds: starving (hunger hit 100), chosen, beast (Humanity 0), staked (lost to hunters). */
    torpor(p: any, kind: "starving" | "chosen" | "beast" | "staked", years?: number): number {
        const r = Reborn.st(p);
        const y = years ?? (kind === "starving" ? 5 + Math.floor(Math.random() * 26) : kind === "beast" ? 5 + Math.floor(Math.random() * 11) : kind === "staked" ? 3 + Math.floor(Math.random() * 8) : 10);
        const before = { hunt: r.hunt };
        const passed = Vampire.collapse(p, y, kind);
        if (kind === "beast") { r.humanity = 1; Reborn.pendingBeast = false; }
        if (kind === "staked") { r.humanity = clamp(r.humanity - 1, 1, 10); r.domain = null; r.hunt = 10; r.hunter = null; }
        if (kind === "chosen") r.hunt = clamp(before.hunt - (r.lair.includes("crypt") ? 30 : 20), 0, 100);
        r.warned80 = false; r.warned95 = false;
        return passed;
    },

    // ------------------------------------------------------------------ messages
    /** Something that happened to you on its own (follows the pop-up switch). */
    note(_p: any, title: string, text: string, image: any = Vampire.image) { LifeMoments.result(title, text, image, { random: AlertManager.inWeek > 0 }); },
    /** Life-changing: always shows. */
    milestone(title: string, text: string, image: any = Vampire.image, options?: [string, () => string | null | void][]) {
        try {
            Work.milestone(title, text, image, options?.map(([l, f]) => [l, () => (f() as any) ?? ""]));
        } catch { /* no UI */ }
    },
    /** Something that happens to you with a choice (follows the pop-up switch; silenced, the first option is taken). */
    ask(_p: any, title: string, text: string, image: any, options: [string, () => string | null | void][]) {
        LifeMoments.ask(title, text, image, options.map(([l, f]) => [l, () => (f() as any) ?? ""] as [string, () => string]), { random: AlertManager.inWeek > 0, quiet: "positive" });
    },
    /** A menu the player opened: always shows. */
    menu(title: string, text: string, image: any, options: [string, () => string | null | void][]) {
        LifeMoments.ask(title, text, image, options.map(([l, f]) => [l, () => (f() as any) ?? ""] as [string, () => string]));
    },
    BLOODLINES,
};
