// v0.32.0 "Childhood & Teen Years": the years before 18 shape the adult you become.
//
// School (Education tab): grades 0–100 (a report card every 16 weeks), a reputation 0–100, a crowd (11+), a best
// friend, a favourite subject (a head start in a matching college degree at 18), homework, cramming, skipping.
// After-school activities (up to 3 at once): practise once a week (no week passes), level up Beginner → Good →
// Great → Star → the activity's top title, and show off every 8 weeks for trophies. Skills carry over to the adult
// hobbies and Celebrity Life skills.
// Home (Leisure tab, "Growing Up"): pocket money every week (more when you Help Around the House), a piggy bank your
// parents match at 18, asking for more, a phone, a learner's permit, driving lessons and the test, sneaking out,
// school dances, parties, and trouble (detentions, a juvenile record that's sealed at 18). Grounding (light parents):
// no hanging out, parties or dances for a few weeks.
// Part-time jobs (Work tab, 12+): paid every week. Hard work counts at your first real job.
// Upbringing traits (13): earned by what you do, not picked. Each one brings one of the game's own traits and a
// one-time gift. At most 5. Everything ends up in the Yearbook (Profile tab).
// Child star (Lifepaths › Celebrity Life, 6–13): auditions, shoots and a kids' TV show; fans carry into Celebrity Life
// and 85% of the pay waits in a trust fund until 18.
// Your own kids (Love tab): their grades and upbringing grow with your parenting; continue as them and they start
// with the traits you gave them.
//
// State: Player.youth (undefined in older saves; made on first use). Kids you raise: Relationships.meta(child).kid.
// Random school and home moments are in YouthMoments.ts (they're Life Moments, so they follow the pop-up switches).
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { AlertActionViewModel } from "../Managers/AlertActionViewModel";
import { AlertType } from "../Managers/AlertType";
import { ArrayList } from "../runtime";
import { LifeMoments } from "../Managers/LifeMoments";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { CompletableAction } from "../Enums/CompletableAction";
import { Relationships } from "../Social/Relationships";
import { Hobbies } from "../Managers/Hobbies";
import { Celebrity } from "../Lifepaths/Celebrity";
import { News } from "../Managers/News";
import {
    ACTIVITIES, ACT_LEVELS, ActDef, CROWDS, CrowdDef, UPBRINGING, TraitDef, TraitKey, TRAIT_POINTS, MAX_TRAITS,
    SUBJECTS, SUBJECT_HEAD_START, HEAD_START_SHARE, PART_JOBS, PartJobDef,
} from "./YouthData";

export type ParentStyle = "relaxed" | "loving" | "strict" | "overprotective" | "none";
export interface ActState { xp: number; weeks: number; trophies: number; shows: number; lastShow: number; joined: boolean }
export interface StarState { gigs: number; trust: number; agent: boolean; burnout: number; tv: number; lastGig: number }
export interface YouthState {
    v: number;
    grades: number; rep: number;
    crowd: string | null; crowdSince: number;
    best: string | null;
    focus: string | null; subjects: Record<string, number>;
    acts: Record<string, ActState>;
    /** Once-a-week actions: id → the week it was done. */
    done: Record<string, number>;
    studied: number;
    grounded: number; groundedFor: string | null;
    style: ParentStyle;
    allowance: number; raiseWeek: number; piggy: number; piggyOn: boolean;
    phone: boolean; permit: boolean; license: boolean; lessons: number; testFails: number;
    job: { id: string; since: number; weeks: number; earned: number } | null; jobWeeks: number; jobEarned: number;
    record: string[]; detentions: number; suspensions: number;
    points: Partial<Record<TraitKey, number>>; traits: TraitKey[];
    yearbook: { age: number; text: string }[];
    report: number; reports: string[];
    scholarship: number; scholarApplied: boolean;
    graduated: boolean; honors: string | null; grown: boolean;
    star: StarState | null;
    dances: number; lastDance: number; parties: number;
    honorRolls: number;
}
/** A kid you're raising (meta.kid). */
export interface KidYouth { grades: number; points: Partial<Record<TraitKey, number>>; style: "strict" | "relaxed" | null; act: string | null; traits?: TraitKey[]; grown?: boolean; cheered?: number }

const player = (): any => GameStateManager.INSTANCE.getPersonState();
export const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const roll = (x: number) => Math.random() < x;
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const attr = (p: any, h: number, hap: number, san: number) => { if (h || hap || san) p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san)); };
export const cashOf = (p: any) => Number(p.getMoneyState().getCash().toString());
export const earn = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null); };
export const pay = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null); };
const toSavings = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.misc, null, MoneyDestination.savings, 4, null); };
const alive = (x: any) => x != null && (x.getIsAlive?.() ?? true);
export const parentsOf = (p: any): any[] => { try { return (Array.from(p.getFamilyState().getParents() as any) as any[]).filter(alive); } catch { return []; } };
export const bond = (x: any, n: number) => { if (x != null) x.setRelationshipProgress(clamp(x.getRelationshipProgress() + n, 0, 1000)); };
export const bondParents = (p: any, n: number) => parentsOf(p).forEach((x) => bond(x, n));
export const parentWord = (p: any) => { const ps = parentsOf(p); return ps.length >= 2 ? "your parents" : ps.length ? `your ${String(ps[0].getTitle?.() ?? "parent").toLowerCase()}` : "your guardian"; };
export const Parent = (p: any) => { const w = parentWord(p); return w[0].toUpperCase() + w.slice(1); };
/** "are" for your parents, "is" for one parent. */
export const are = (p: any) => (parentsOf(p).length === 1 ? "is" : "are");
const refresh = () => { try { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); } catch { /* no UI */ } };

export const LETTERS: [number, string][] = [[97, "A+"], [93, "A"], [90, "A−"], [87, "B+"], [83, "B"], [80, "B−"], [77, "C+"], [73, "C"], [70, "C−"], [67, "D+"], [63, "D"], [60, "D−"], [0, "F"]];
export const REP_LEVELS: [number, string][] = [[85, "Legendary"], [60, "Popular"], [35, "Liked"], [15, "Known"], [0, "Invisible"]];
const STYLE_TITLE: Record<ParentStyle, string> = { relaxed: "Relaxed", loving: "Loving", strict: "Strict", overprotective: "Overprotective", none: "No parents at home" };
const STYLE_INFO: Record<ParentStyle, { allowance: number; ground: number; catch: number; raise: number }> = {
    relaxed: { allowance: 1.25, ground: 2, catch: 0.2, raise: 0.2 },
    loving: { allowance: 1, ground: 3, catch: 0.3, raise: 0.1 },
    strict: { allowance: 0.75, ground: 5, catch: 0.5, raise: -0.15 },
    overprotective: { allowance: 1, ground: 3, catch: 0.6, raise: 0 },
    none: { allowance: 0, ground: 0, catch: 0.1, raise: -1 },
};

export const Youth = {
    /** Set by other modules (Crime): what Youth can't import directly. */
    hooks: { respect: null as ((p: any, n: number) => void) | null },
    adultAge: 18,
    reportEvery: 16,
    showEvery: 8,
    maxActivities: 3,
    crowdAge: 11,
    /** Off switch for feature tests that count alerts. */
    enabled: true,

    now(p: any = player()): number { try { return p.getTrueAgeInWeeks(); } catch { return 0; } },
    age(p: any = player()): number { return p.getAgeInYears(); },
    isYoung(p: any = player()): boolean { return p.getAgeInYears() < Youth.adultAge; },
    peek(p: any = player()): YouthState | null { return p?.youth ?? null; },
    state(p: any = player()): YouthState {
        let y: YouthState = p.youth;
        if (y == null) {
            const age = p.getAgeInYears();
            // somebody who starts the game older than 5 grew up a little already
            const head = age >= 8;
            y = p.youth = {
                v: 1, grades: head ? rnd(62, 88) : 75, rep: head ? rnd(15, 40) : 20, crowd: null, crowdSince: 0, best: null,
                focus: null, subjects: {}, acts: {}, done: {}, studied: -999, grounded: 0, groundedFor: null,
                style: Youth.pickStyle(p), allowance: 0, raiseWeek: -999, piggy: 0, piggyOn: false,
                phone: false, permit: false, license: false, lessons: 0, testFails: 0,
                job: null, jobWeeks: 0, jobEarned: 0, record: [], detentions: 0, suspensions: 0,
                points: {}, traits: [], yearbook: [], report: Youth.now(p), reports: [],
                scholarship: 0, scholarApplied: false, graduated: false, honors: null, grown: !Youth.isYoung(p),
                star: null, dances: 0, lastDance: -999, parties: 0, honorRolls: 0,
            };
        }
        y.points ??= {}; y.traits ??= []; y.yearbook ??= []; y.acts ??= {}; y.done ??= {}; y.subjects ??= {}; y.record ??= []; y.reports ??= [];
        return y;
    },
    pickStyle(p: any): ParentStyle {
        if (parentsOf(p).length === 0) return "none";
        const r = Math.random();
        return r < 0.3 ? "loving" : r < 0.55 ? "relaxed" : r < 0.8 ? "strict" : "overprotective";
    },
    styleTitle(p: any = player()): string { return STYLE_TITLE[Youth.style(p)]; },
    style(p: any = player()): ParentStyle { const y = Youth.state(p); if (parentsOf(p).length === 0) return "none"; if (y.style === "none") y.style = Youth.pickStyle(p); return y.style; },

    // ------------------------------------------------------------------ school
    letter(g: number): string { for (const [min, l] of LETTERS) if (g >= min) return l; return "F"; },
    repName(r: number): string { for (const [min, n] of REP_LEVELS) if (r >= min) return n; return "Invisible"; },
    /** The school you're in now (the first one you haven't finished whose age has come), or null. */
    currentSchool(p: any = player()): CompletableAction | null {
        if (!Youth.isYoung(p)) return null;
        try {
            const cas = p.getCompletableActionState(), age = p.getAgeInYears();
            for (const [a, min] of [[CompletableAction.preschool, 3], [CompletableAction.elementarySchool, 5], [CompletableAction.middleSchool, 11], [CompletableAction.highSchool, 14]] as [CompletableAction, number][]) {
                if (a === CompletableAction.preschool && age >= 5) continue;
                if (!cas.isCompleted(a)) return age >= min ? a : null;
            }
        } catch { /* ignore */ }
        return null;
    },
    inSchool(p: any = player()): boolean { const s = Youth.currentSchool(p); return s != null && s !== CompletableAction.preschool; },
    /** School life (grades, homework, crowds) is for 5–17 year-olds who haven't graduated. */
    schoolShown(p: any = player()): boolean { const a = p.getAgeInYears(); return a >= 5 && a < 18 && !Youth.state(p).graduated; },
    grades(p: any, n: number) { const y = Youth.state(p); y.grades = clamp(y.grades + n, 0, 100); },
    rep(p: any, n: number) { const y = Youth.state(p); y.rep = clamp(y.rep + n, 0, 100); },
    /** Called by CompletableActionState when a week of school is studied. */
    onSchoolWeek(p: any, a: CompletableAction) {
        if (!Youth.isYoung(p) || a === CompletableAction.preschool) return;
        const y = Youth.state(p);
        y.studied = Youth.now(p) + 1;   // the week that's about to end
        const f = y.focus ?? null;
        if (f) y.subjects[f] = (y.subjects[f] ?? 0) + 2;
        else { const s = pick(SUBJECTS); y.subjects[s.id] = (y.subjects[s.id] ?? 0) + 1; }
    },
    doneThisWeek(id: string, p: any = player()): boolean { return Youth.state(p).done[id] === Youth.now(p); },
    markDone(id: string, p: any = player()) { Youth.state(p).done[id] = Youth.now(p); },
    weeksSince(week: number, p: any = player()): number { return Youth.now(p) - week; },

    // ------------------------------------------------------------------ trait points & traits
    addPoints(p: any, pts: Partial<Record<TraitKey, number>>, scale = 1) {
        const y = Youth.state(p);
        if (y.grown) return;
        for (const [k, v] of Object.entries(pts)) y.points[k as TraitKey] = (y.points[k as TraitKey] ?? 0) + (v ?? 0) * scale;
        Youth.checkTraits(p);
    },
    trait(id: TraitKey): TraitDef { return UPBRINGING.find((t) => t.id === id)!; },
    has(id: TraitKey, p: any = player()): boolean { return Youth.peek(p)?.traits?.includes(id) ?? false; },
    /** Earn every trait whose points crossed the line (most points first), up to MAX_TRAITS. */
    checkTraits(p: any) {
        const y = Youth.state(p);
        const ready = UPBRINGING.filter((t) => !y.traits.includes(t.id) && (y.points[t.id] ?? 0) >= TRAIT_POINTS)
            .sort((a, b) => (y.points[b.id] ?? 0) - (y.points[a.id] ?? 0));
        for (const t of ready) {
            if (y.traits.length >= MAX_TRAITS) break;
            Youth.giveTrait(p, t.id);
        }
    },
    giveTrait(p: any, id: TraitKey, quiet = false) {
        const y = Youth.state(p);
        if (y.traits.includes(id)) return;
        y.traits.push(id);
        const t = Youth.trait(id);
        // the game's own trait (a negative opposite is grown out of)
        if (t.gameTrait != null) {
            try {
                const gt = t.gameTrait();
                const ts = p.getTraitState();
                const opp = gt.getOpposite?.();
                if (opp != null && ts.hasTrait(opp)) ts.getTraits().remove(opp);
                ts.addTrait(gt);
            } catch { /* ignore */ }
        }
        if (t.gift) attr(p, t.gift[0], t.gift[1], t.gift[2]);
        if (id === "social") { try { Relationships.friends(p).forEach((f: any) => bond(f, 100)); } catch { /* ignore */ } }
        if (id === "kind") { try { (Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]).filter(alive).forEach((x) => { if (x.setRelationshipProgress) bond(x, 100); }); } catch { /* ignore */ } }
        if (id === "golden") bondParents(p, 100);
        if (id === "musical") { try { Celebrity.train(p, "music", 10); } catch { /* ignore */ } }
        Youth.book(p, `Became known as ${/^[AEIOU]/.test(t.title) ? "an" : "a"} ${t.title}.`);
        if (!quiet) Youth.say(`Upbringing Trait: ${t.title}`, `${t.how}\n\nIt's who you are now: ${t.effect}`, t.image);
    },

    // ------------------------------------------------------------------ yearbook & messages
    book(p: any, text: string) {
        const y = Youth.state(p);
        y.yearbook.push({ age: p.getAgeInYears(), text });
        if (y.yearbook.length > 120) y.yearbook.splice(0, y.yearbook.length - 120);
    },
    /** A result: a pop-up when you did something, in News (by the pop-up rules) when it happened during the week. */
    say(title: string, msg: string, image: any = "icon_youth_school") {
        LifeMoments.result(title, msg, image, { random: AlertManager.inWeek > 0 });
    },
    /** A menu the player opened: always pops up. */
    menu(title: string, text: string, image: any, options: [string, () => string | null | void][]) {
        LifeMoments.ask(title, text, image, options.map(([l, f]) => [l, () => (f() as any) ?? ""] as [string, () => string]));
    },

    // ------------------------------------------------------------------ grounding & trouble
    groundedWeeks(p: any = player()): number { return Youth.peek(p)?.grounded ?? 0; },
    ground(p: any, why: string, weeks?: number): string {
        const st = Youth.style(p);
        const w = weeks ?? STYLE_INFO[st].ground;
        if (w <= 0) return "";
        const y = Youth.state(p);
        y.grounded = Math.max(y.grounded, w);
        y.groundedFor = why;
        Youth.addPoints(p, { rebel: 1, resilient: 1 });
        return ` You're grounded for ${w} week${w === 1 ? "" : "s"} (no hanging out, parties or dances).`;
    },
    groundLock(p: any = player()): string | null { const g = Youth.groundedWeeks(p); return g > 0 ? `Grounded: ${g} week${g === 1 ? "" : "s"} left` : null; },
    catchChance(p: any = player()): number { return STYLE_INFO[Youth.style(p)].catch + (Youth.groundedWeeks(p) > 0 ? 0.2 : 0); },
    detention(p: any): string {
        const y = Youth.state(p);
        y.detentions++;
        Youth.addPoints(p, { troublemaker: 2 });
        bondParents(p, -15);
        if (y.detentions % 3 === 0) {
            y.suspensions++;
            Youth.grades(p, -5);
            bondParents(p, -30);
            Youth.book(p, "Got suspended.");
            return ` That's detention number ${y.detentions}: you're suspended for a week (−5 grades).` + Youth.ground(p, "a suspension");
        }
        return ` Detention (${y.detentions} so far; every third one is a suspension).`;
    },
    addRecord(p: any, what: string) {
        const y = Youth.state(p);
        y.record.push(what);
        Youth.addPoints(p, { troublemaker: 4 });
        Youth.book(p, `Got in trouble with the police: ${what.toLowerCase()}.`);
    },

    // ------------------------------------------------------------------ activities
    act(id: string): ActDef { return ACTIVITIES.find((a) => a.id === id)!; },
    actState(id: string, p: any = player()): ActState {
        const y = Youth.state(p);
        return y.acts[id] ?? (y.acts[id] = { xp: 0, weeks: 0, trophies: 0, shows: 0, lastShow: -999, joined: false });
    },
    /** "Big Game", "Meet", "Recital"… (what a parent goes to watch). */
    eventName(d: ActDef): string {
        const special: Record<string, string> = { newspaper: "Big Issue Launch", scouts: "Badge Ceremony", council: "School Event", volunteer: "Charity Drive" };
        return special[d.id] ?? d.show.replace(/^(Play|Swim|Race|Compete|Fight|Dance|Sing|Star|Argue)( \w+)? ?(in|at) (the |a |an )?/i, "").replace(/^(Enter|Publish) (the |a |an )?/i, "");
    },
    joined(p: any = player()): ActDef[] { const y = Youth.state(p); return ACTIVITIES.filter((a) => y.acts[a.id]?.joined); },
    levelOf(xp: number): number { let l = 0; ACT_LEVELS.forEach((x, i) => { if (xp >= x.min) l = i; }); return l; },
    levelName(d: ActDef, xp: number): string { const l = Youth.levelOf(xp); return l === 4 ? d.top : ACT_LEVELS[l].name; },
    joinBlock(d: ActDef, p: any = player()): string | null {
        if (!Youth.isYoung(p)) return "For kids and teens";
        if (p.getAgeInYears() < d.minAge) return `From age ${d.minAge}`;
        if (Youth.joined(p).length >= Youth.maxActivities && !Youth.state(p).acts[d.id]?.joined) return `You're in ${Youth.maxActivities} activities already (quit one first)`;
        return null;
    },
    join(id: string, p: any = player()): boolean {
        const d = Youth.act(id);
        if (Youth.joinBlock(d, p) != null) return false;
        const a = Youth.actState(id, p);
        a.joined = true;
        Youth.book(p, `Joined ${d.title}.`);
        refresh();
        return true;
    },
    quit(id: string, p: any = player()) { const a = Youth.peek(p)?.acts?.[id]; if (a) { a.joined = false; refresh(); } },
    practiceBlock(d: ActDef, p: any = player()): string | null {
        if (!Youth.isYoung(p)) return "For kids and teens";
        try { if (p.getCrimeState().getIsInJail()) return "Not while you're locked up"; } catch { /* ignore */ }
        if (Youth.doneThisWeek("act_" + d.id, p)) return "Practised this week";
        return null;
    },
    gain(xp: number): number { return Math.max(3, Math.round(10 - xp / 12)); },
    practice(id: string, p: any = player()): boolean {
        const d = Youth.act(id);
        if (Youth.practiceBlock(d, p) != null) return false;
        const a = Youth.actState(id, p);
        const before = Youth.levelOf(a.xp);
        const g = Youth.gain(a.xp) + (roll(0.3) ? 1 : 0);
        a.xp = Math.min(100, a.xp + g);
        a.weeks++;
        Youth.markDone("act_" + id, p);
        attr(p, d.mods[0], d.mods[1], d.mods[2]);
        Youth.addPoints(p, d.points);
        if (d.hobby) { try { Hobbies.addSkill(d.hobby, Math.max(1, Math.round(g * 0.6)), p); } catch { /* ignore */ } }
        if (d.celeb) { try { Celebrity.train(p, d.celeb, 1); } catch { /* ignore */ } }
        const after = Youth.levelOf(a.xp);
        if (after > before) {
            const name = Youth.levelName(d, a.xp);
            if (after === 4) { Youth.addPoints(p, { leader: 4 }); Youth.rep(p, 6); Youth.book(p, `${d.top} in ${d.title}.`); }
            else if (after === 3) Youth.book(p, `Became a star at ${d.title}.`);
            Youth.say(`${d.title}: ${name}`, after === 1
                ? `You're getting good at ${d.title.toLowerCase()}. You can ${d.show.toLowerCase()} now, every ${Youth.showEvery} weeks.`
                : after === 4 ? `You made it all the way: ${d.top}! (+6 reputation)` : `You reached ${name} at ${d.title.toLowerCase()}.`, d.image);
        }
        refresh();
        return true;
    },
    weeksToShow(id: string, p: any = player()): number { const a = Youth.peek(p)?.acts?.[id]; return a ? Math.max(0, Youth.showEvery - (Youth.now(p) - a.lastShow)) : 0; },
    showBlock(d: ActDef, p: any = player()): string | null {
        const a = Youth.peek(p)?.acts?.[d.id];
        if (a == null || a.xp < ACT_LEVELS[1].min) return "Reach Good first";
        if (!Youth.isYoung(p)) return "For kids and teens";
        try { if (p.getCrimeState().getIsInJail()) return "Not while you're locked up"; } catch { /* ignore */ }
        const w = Youth.weeksToShow(d.id, p);
        return w > 0 ? `Again in ${w} week${w === 1 ? "" : "s"}` : null;
    },
    winChance(xp: number): number { return clamp(0.2 + xp / 140, 0.2, 0.88); },
    showOff(id: string, p: any = player()): string | null {
        const d = Youth.act(id);
        if (Youth.showBlock(d, p) != null) return null;
        const a = Youth.actState(id, p);
        a.lastShow = Youth.now(p);
        a.shows++;
        const watching = parentsOf(p).length ? ` ${Parent(p)} cheered from the front row.` : "";
        let msg: string;
        if (roll(Youth.winChance(a.xp))) {
            a.trophies++;
            attr(p, 0, 10, 3);
            Youth.rep(p, 5);
            Youth.addPoints(p, { ...d.points, golden: 1 });
            bondParents(p, 20);
            const what = d.kind === "sport" ? "You won! The team carried you off the field" : d.kind === "music" ? "A standing ovation" : d.kind === "art" ? "First prize" : d.kind === "brain" ? "You took first place" : "It was a huge success";
            msg = `${what}. Trophy number ${a.trophies}.${watching} (+5 reputation)`;
            if (a.trophies === 1) Youth.book(p, `Won a trophy in ${d.title}.`);
            if (Celebrity.fans(p) > 0) Celebrity.addFans(p, 200 + a.xp * 20);
        } else {
            attr(p, 0, -2, 1);
            Youth.addPoints(p, { resilient: 1 });
            msg = `${pick(["Close, but not this time.", "Second place. Next time.", "You gave it everything. The judges didn't see it that way."])}${watching}`;
        }
        Youth.say(d.show, msg, d.image);
        refresh();
        return msg;
    },
    /** Trophies across every activity. */
    trophies(p: any = player()): number { const y = Youth.peek(p); return y ? Object.values(y.acts).reduce((t, a) => t + (a.trophies ?? 0), 0) : 0; },
    bestActivity(p: any = player()): { d: ActDef; a: ActState } | null {
        const y = Youth.peek(p);
        if (!y) return null;
        let best: { d: ActDef; a: ActState } | null = null;
        for (const d of ACTIVITIES) { const a = y.acts[d.id]; if (a && a.xp > (best?.a.xp ?? 0)) best = { d, a }; }
        return best;
    },

    // ------------------------------------------------------------------ crowds & friends
    crowd(id: string | null): CrowdDef | null { return CROWDS.find((c) => c.id === id) ?? null; },
    crowdBlock(c: CrowdDef, p: any = player()): string | null {
        if (p.getAgeInYears() < Youth.crowdAge) return `From age ${Youth.crowdAge}`;
        const y = Youth.state(p);
        if (y.rep < c.minRep) return `Needs a ${Youth.repName(c.minRep)} reputation (${c.minRep})`;
        return null;
    },
    joinCrowd(id: string | null, p: any = player()) {
        const y = Youth.state(p);
        y.crowd = id; y.crowdSince = Youth.now(p);
        const c = Youth.crowd(id);
        if (c) Youth.book(p, `Joined ${c.title}.`);
        refresh();
    },
    hangOut(p: any = player()): string {
        const y = Youth.state(p);
        const c = Youth.crowd(y.crowd);
        Youth.markDone("crowd", p);
        if (c == null) {
            Youth.rep(p, 2); attr(p, 0, 3, 1); Youth.addPoints(p, { social: 1 });
            return "You drifted between tables at lunch and got along with everyone. (+2 reputation)";
        }
        const h = c.hang;
        Youth.rep(p, h.rep); attr(p, h.health ?? 0, h.hap, h.san ?? 0); if (h.grades) Youth.grades(p, h.grades);
        Youth.addPoints(p, h.points);
        const lines: Record<string, string[]> = {
            jocks: ["Pickup games after school and way too much pizza.", "You watched game tape and planned the pep rally."],
            brains: ["A study session turned into a three-hour argument about black holes.", "You built a tiny robot out of a calculator."],
            artsy: ["Sketching in the park with headphones on.", "Band practice in someone's garage. The neighbours complained. Worth it."],
            popular: ["Everyone wanted a photo with your table today.", "You decided what everyone will be wearing next week."],
            rebels: ["You skipped the assembly and sat on the roof.", "Skateboards, loud music and a security guard who almost caught you."],
        };
        return `${pick(lines[c.id])} (+${h.rep} reputation)`;
    },
    bestFriend(p: any = player()): any {
        const y = Youth.state(p);
        let fs: any[] = [];
        try { fs = Relationships.friends(p).filter(alive); } catch { /* ignore */ }
        let f = fs.find((x) => String(x.getId()) === y.best);
        if (f == null && fs.length) {
            f = fs.slice().sort((a, b) => b.getRelationshipProgress() - a.getRelationshipProgress())[0];
            y.best = String(f.getId());
        }
        return f ?? null;
    },
    setBest(f: any, p: any = player()) { const y = Youth.state(p); y.best = String(f.getId()); Youth.book(p, `${f.getFirstName()} became your best friend.`); refresh(); },
    hangBest(p: any = player()): string {
        const f = Youth.bestFriend(p);
        Youth.markDone("best", p);
        if (f == null) return "";
        bond(f, 25); attr(p, 0, 4, 3); Youth.addPoints(p, { social: 1, kind: 1 });
        const what = pick(["You built a blanket fort and talked until midnight.", "Bikes, ice cream and a secret handshake.", "You spent the whole afternoon making a ridiculous video.", "You just sat on the curb and talked about everything."]);
        return `${what} You and ${f.getFirstName()} are closer than ever.`;
    },

    // ------------------------------------------------------------------ money
    baseAllowance(age: number): number { return age < 5 ? 0 : age <= 7 ? 3 : age <= 10 ? 6 : age <= 12 ? 10 : age <= 15 ? 15 : 25; },
    allowance(p: any = player()): number {
        const y = Youth.state(p);
        const st = Youth.style(p);
        if (st === "none" || !Youth.isYoung(p)) return 0;
        return Math.round(Youth.baseAllowance(p.getAgeInYears()) * STYLE_INFO[st].allowance * (1 + (y.allowance ?? 0) * 0.5));
    },
    raiseBlock(p: any = player()): string | null {
        const y = Youth.state(p);
        if (Youth.style(p) === "none") return "No parents to ask";
        if (p.getAgeInYears() < 5) return "From age 5";
        if (y.allowance >= 4) return "That's as much as they'll ever give";
        const w = 24 - (Youth.now(p) - y.raiseWeek);
        return w > 0 ? `Ask again in ${w} week${w === 1 ? "" : "s"}` : null;
    },
    askRaise(p: any = player()): string {
        const y = Youth.state(p);
        y.raiseWeek = Youth.now(p);
        const ps = parentsOf(p);
        const avg = ps.length ? ps.reduce((t, x) => t + x.getRelationshipProgress(), 0) / ps.length : 0;
        const chance = clamp(0.3 + avg / 2000 + STYLE_INFO[Youth.style(p)].raise + (Youth.has("golden", p) ? 0.2 : 0), 0.05, 0.9);
        if (roll(chance)) {
            y.allowance++;
            attr(p, 0, 5, 0);
            return `${Parent(p)} said yes! Pocket money is now ${money(Youth.allowance(p))} a week.`;
        }
        if (Youth.style(p) === "strict") bondParents(p, -10);
        attr(p, 0, -2, 0);
        return `"${pick(["Money doesn't grow on trees.", "Maybe when you're older.", "We'll see.", "Do you know how much groceries cost?"])}" Not this time.`;
    },
    breakPiggy(p: any = player()): string {
        const y = Youth.state(p);
        const n = y.piggy;
        y.piggy = 0;
        earn(p, n);
        return `You smashed the piggy bank: ${money(n)} in coins all over the floor.`;
    },

    // ------------------------------------------------------------------ driving & phone
    permitBlock(p: any = player()): string | null {
        const y = Youth.state(p);
        if (y.license) return "You have your driver's licence";
        if (y.permit) return "You have your permit";
        if (p.getAgeInYears() < 15) return "From age 15";
        if (Youth.doneThisWeek("permit", p)) return "Try again next week";
        return null;
    },
    permitTest(p: any = player()): string {
        const y = Youth.state(p);
        Youth.markDone("permit", p);
        if (roll(clamp(0.55 + y.grades / 250, 0.5, 0.95))) {
            y.permit = true; attr(p, 0, 6, 0);
            Youth.book(p, "Got a learner's permit.");
            return "You passed the written test! You can take driving lessons now (with an adult in the car).";
        }
        attr(p, 0, -3, 0); Youth.addPoints(p, { resilient: 1 });
        return "You mixed up yield and merge. Try again next week.";
    },
    lessonsBlock(p: any = player()): string | null { const y = Youth.state(p); return y.license ? "You have your licence" : !y.permit ? "Get your learner's permit first" : null; },
    lesson(p: any = player()): string {
        const y = Youth.state(p);
        y.lessons++;
        const ps = parentsOf(p);
        if (ps.length) { bond(pick(ps), 20); return `${Parent(p)} took you out driving. Only one curb was hit. (Lessons: ${y.lessons})`; }
        return `A driving instructor with a second brake pedal took you around town. (Lessons: ${y.lessons})`;
    },
    testChance(p: any = player()): number { const y = Youth.state(p); return clamp(0.3 + y.lessons * 0.12 - y.testFails * 0.02, 0.3, 0.95); },
    testBlock(p: any = player()): string | null {
        const y = Youth.state(p);
        if (y.license) return "You passed already";
        if (!y.permit) return "Get your learner's permit first";
        if (p.getAgeInYears() < 16) return "From age 16";
        if (Youth.doneThisWeek("drivetest", p)) return "Book another test next week";
        return null;
    },
    drivingTest(p: any = player()): string {
        const y = Youth.state(p);
        Youth.markDone("drivetest", p);
        if (roll(Youth.testChance(p))) {
            y.license = true; attr(p, 0, 15, 3); Youth.rep(p, 3);
            Youth.book(p, `Passed the driving test${y.testFails ? ` (on try number ${y.testFails + 1})` : " first time"}.`);
            return "You passed! Freedom has four wheels. (+3 reputation)";
        }
        y.testFails++; attr(p, 0, -6, -2); Youth.addPoints(p, { resilient: 2 });
        return pick(["You failed on parallel parking. Everyone does.", "You rolled through a stop sign in front of the examiner.", "You forgot to check your mirror. The examiner sighed loudly."]) + " Practise more and try again.";
    },
    hasLicense(p: any = player()): boolean { return Youth.peek(p)?.license === true; },

    // ------------------------------------------------------------------ part-time jobs
    partJob(id: string | null): PartJobDef | null { return PART_JOBS.find((j) => j.id === id) ?? null; },
    jobBlock(d: PartJobDef, p: any = player()): string | null {
        if (!Youth.isYoung(p)) return "For teens (you can get a real job now)";
        if (p.getAgeInYears() < d.minAge) return `From age ${d.minAge}`;
        try { if (p.getCrimeState().getIsInJail()) return "Not while you're locked up"; } catch { /* ignore */ }
        const y = Youth.state(p);
        if (y.job?.id === d.id) return null;
        return d.needs?.(p, y) ?? null;
    },
    takeJob(id: string, p: any = player()): string {
        const d = Youth.partJob(id)!;
        const y = Youth.state(p);
        const first = y.jobWeeks === 0;
        y.job = { id, since: Youth.now(p), weeks: 0, earned: 0 };
        if (first) Youth.book(p, `Got a first job: ${d.title}.`);
        refresh();
        return `You're a ${d.title.toLowerCase()} now: ${money(d.pay)} a week, after school and on weekends.`;
    },
    quitJob(p: any = player()) { const y = Youth.state(p); y.job = null; refresh(); },

    // ------------------------------------------------------------------ scholarships & graduation
    scholarshipBlock(p: any = player()): string | null {
        const y = Youth.state(p);
        if (y.graduated) return "You've graduated";
        if (p.getAgeInYears() < 16) return "From age 16";
        if (y.scholarApplied) return "You've applied (the results come at graduation)";
        return null;
    },
    /** What a scholarship would be worth now (grades, trophies, top levels, leader). */
    scholarshipValue(p: any = player()): number {
        const y = Youth.state(p);
        let v = 0;
        if (y.grades >= 95) v += 25000; else if (y.grades >= 88) v += 12000; else if (y.grades >= 80) v += 4000;
        const best = Youth.bestActivity(p);
        if (best) { const l = Youth.levelOf(best.a.xp); v += [0, 0, 3000, 10000, 20000][l]; }
        v += Math.min(10, Youth.trophies(p)) * 1000;
        if (Youth.has("leader", p)) v += 5000;
        if (Youth.has("kind", p)) v += 2000;
        return v;
    },
    applyScholarships(p: any = player()): string {
        const y = Youth.state(p);
        y.scholarApplied = true;
        const v = Youth.scholarshipValue(p);
        Youth.addPoints(p, { bookworm: 2, leader: 1 });
        if (v <= 0) return "You filled in a dozen applications. With these grades it's a long shot, but you never know. Results come at graduation.";
        return `Essays written, recommendation letters in. Right now you'd win about ${money(v)}; better grades and trophies before graduation could raise it.`;
    },
    honorsFor(g: number): string { return g >= 96 ? "Valedictorian" : g >= 88 ? "With Honors" : g >= 70 ? "Graduated" : "Just Made It"; },
    /** High school is done: the ceremony (a once-in-a-life milestone that pops up). */
    graduate(p: any) {
        const y = Youth.state(p);
        if (y.graduated) return;
        y.graduated = true;
        y.honors = Youth.honorsFor(y.grades);
        const sch = y.scholarApplied ? Youth.scholarshipValue(p) : Math.round(Youth.scholarshipValue(p) * 0.4);
        y.scholarship = sch;
        if (sch > 0) toSavings(p, sch);
        Youth.book(p, `Graduated high school: ${y.honors}${sch > 0 ? `, with ${money(sch)} in scholarships` : ""}.`);
        bondParents(p, y.honors === "Just Made It" ? 10 : 50);
        attr(p, 0, y.honors === "Just Made It" ? 6 : 15, 4);
        const best = Youth.bestFriend(p);
        const lines = [
            `${p.getFirstName()} ${p.getLastName()}: ${y.honors}! Final grades: ${Youth.letter(y.grades)}.`,
            sch > 0 ? `Scholarships: ${money(sch)}, paid into your savings for college.` : null,
            Youth.trophies(p) ? `${Youth.trophies(p)} trophies on the shelf.` : null,
            best ? `${best.getFirstName()} hugged you so hard your cap fell off.` : null,
            parentsOf(p).length ? `${Parent(p)} cried. A lot.` : null,
        ].filter(Boolean).join("\n");
        const options: [string, () => string][] = y.honors === "Valedictorian"
            ? [["Give an inspiring speech", () => { Youth.rep(p, 10); Youth.addPoints(p, { leader: 3 }); return "Your speech got a standing ovation. Somebody's grandma asked for your autograph."; }],
                ["Give a funny speech", () => { Youth.rep(p, 12); Youth.addPoints(p, { social: 3 }); return "The whole stadium laughed. The principal didn't, at first."; }]]
            : [["Throw your cap in the air", () => "Caps everywhere. You never found yours. Worth it."]];
        Youth.milestone("Graduation Day", lines, "icon_youth_graduation", options);
    },
    /** Turning 18: the piggy bank and trust fund, the head start, a sealed record. */
    growUp(p: any) {
        const y = Youth.state(p);
        if (y.grown) return;
        Youth.checkTraits(p);
        y.grown = true;
        const lines: string[] = [];
        // the piggy bank, matched
        if (y.piggy > 0) {
            const match = parentsOf(p).length ? Math.round(y.piggy * 0.5) : 0;
            toSavings(p, y.piggy + match);
            lines.push(`Your piggy bank (${money(y.piggy)})${match ? ` plus ${money(match)} from ${parentWord(p)}` : ""} went into your savings.`);
            y.piggy = 0;
        }
        // the child-star trust fund
        if (y.star && y.star.trust > 0) {
            toSavings(p, y.star.trust);
            lines.push(`Your child-star trust fund opened: ${money(y.star.trust)} into savings.`);
            y.star.trust = 0;
        }
        // a head start in the subject you loved
        const fav = Youth.favourite(p);
        if (fav && (y.subjects[fav.id] ?? 0) >= SUBJECT_HEAD_START) {
            try {
                const cas = p.getCompletableActionState();
                const started: string[] = [];
                for (const d of fav.degrees()) {
                    const st = cas.getState(d);
                    if (st.getCompleted() || st.getProgress() > 0) continue;
                    const need = d.getTimeRequiredInWeeks(p);
                    cas.setProgress(d, Math.max(1, Math.round(need * HEAD_START_SHARE)));
                    started.push(d.getTitle?.() ?? "college");
                }
                if (started.length) lines.push(`You loved ${fav.title}: a head start on ${started.join(" and ")} (${Math.round(HEAD_START_SHARE * 100)}% done).`);
            } catch { /* ignore */ }
        }
        // a sealed record (and street smarts)
        if (y.record.length) { lines.push(`Your juvenile record (${y.record.length} thing${y.record.length === 1 ? "" : "s"}) was sealed. Clean slate.`); }
        if (Youth.has("troublemaker", p)) { try { Youth.hooks.respect?.(p, 10); } catch { /* ignore */ } }
        if (y.traits.length) lines.push(`You grew up to be: ${y.traits.map((t) => Youth.trait(t).title).join(", ")}.`);
        if (y.jobWeeks >= 24) lines.push(`${Math.floor(y.jobWeeks / 48) >= 1 ? `${Math.floor(y.jobWeeks / 48)} year${Math.floor(y.jobWeeks / 48) === 1 ? "" : "s"}` : `${y.jobWeeks} weeks`} of part-time work: your first real job starts with experience.`);
        y.job = null; y.grounded = 0;
        Youth.book(p, "Turned 18.");
        if (lines.length) Youth.milestone("You're 18", lines.join("\n"), "icon_youth_yearbook");
    },
    /** JobState.switchJob: your first real job (18+) starts with the experience from part-time work. */
    onFirstJob(p: any) {
        const y = Youth.peek(p);
        if (y == null || (y as any).expUsed || Youth.isYoung(p)) return;
        if (y.jobWeeks < 24 && !y.traits.includes("hardWorker")) return;
        const js = p.getJobState().getCurrentJobState();
        if (js == null) return;
        const exp = Math.min(12, Math.floor(y.jobWeeks / 6)) + (y.traits.includes("hardWorker") ? 4 : 0);
        if (exp <= 0) return;
        (y as any).expUsed = true;
        js.progress = (js.progress ?? 0) + exp;
        Youth.say("Experience Counts", `Your boss was impressed by your part-time jobs${y.traits.includes("hardWorker") ? " and your work ethic" : ""}: you start ${exp} weeks ahead towards your first promotion.`, "icon_trait_hardworker");
    },
    favourite(p: any = player()) {
        const y = Youth.peek(p);
        if (!y) return null;
        let best: (typeof SUBJECTS)[number] | null = null, n = 0;
        for (const s of SUBJECTS) { const v = y.subjects[s.id] ?? 0; if (v > n) { n = v; best = s; } }
        return best;
    },
    /** A once-in-a-life milestone: always pops up (it isn't a random event). */
    milestone(title: string, text: string, image: any, options?: [string, () => string][]) {
        try {
            if (options && options.length > 1) {
                const wrap = (o: [string, () => string]) => new AlertActionViewModel(o[0], { invoke: () => { const r = o[1](); if (r) LifeMoments.result(title, r, image); refresh(); return null; } });
                const extra = new ArrayList<AlertActionViewModel>();
                for (const o of options.slice(1, -1)) extra.add(wrap(o));
                const vm: any = new AlertViewModel(title, text, image, null, null, wrap(options[0]), wrap(options[options.length - 1]), extra, AlertType.Alert, 0, null);
                vm.milestone = true; vm.essential = true;
                AlertManager.showAlert$default(AlertManager.INSTANCE, vm, false, 2, null);
            } else {
                const vm: any = new AlertViewModel(title, text + (options?.length ? `\n\n${options[0][1]()}` : ""), image, null, null, null, null, null, null, 504, null);
                vm.milestone = true; vm.essential = true;
                AlertManager.showAlert$default(AlertManager.INSTANCE, vm, false, 2, null);
            }
            News.add({ getTitle: () => title, getMessage: () => text, getImageId: () => image });
            { const st = News.state(); if (st.unread > 0) st.unread--; }
        } catch { /* no UI */ }
    },

    // ------------------------------------------------------------------ the weekly tick (Player.applyWeekly)
    afterWeek(p: any) {
        if (!Youth.enabled) return;
        try { if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) return; } catch { return; }
        Youth.kidsWeek(p);   // the kids you're raising
        const age = p.getAgeInYears();
        if (p.youth == null && (age < 5 || !Youth.isYoung(p))) return;
        const y = Youth.state(p);
        // high school finished (at 16–19)
        try { if (!y.graduated && age >= 16 && age <= 19 && p.getCompletableActionState().isCompleted(CompletableAction.highSchool)) Youth.graduate(p); } catch { /* ignore */ }
        if (!Youth.isYoung(p)) {
            if (!y.grown) Youth.growUp(p);
            return;
        }
        const now = Youth.now(p);
        // school: studying this week lifts your grades, skipping lets them slide (never below 45 on their own)
        if (Youth.inSchool(p)) {
            if (y.studied === now) Youth.grades(p, 1.2 + (Youth.style(p) === "strict" ? 0.4 : 0) + (Youth.has("bookworm", p) ? 0.3 : 0));
            else if (y.grades > 45) y.grades = Math.max(45, y.grades - 0.6);
            if (now - y.report >= Youth.reportEvery) Youth.reportCard(p);
        }
        // reputation slowly settles when you don't keep it up
        if (y.rep > 40 && !Youth.doneThisWeek("crowd", p) && y.done.crowd !== now - 1) Youth.rep(p, -0.3);
        // grounding wears off
        if (y.grounded > 0) { y.grounded--; if (y.grounded === 0) y.groundedFor = null; }
        // pocket money (more when you helped around the house this week)
        const pm = Youth.allowance(p);
        if (pm > 0) {
            const helped = y.done.chores === now - 1 || y.done.chores === now;
            const total = pm * (helped ? 2 : 1);
            const saved = y.piggyOn ? Math.round(total / 2) : 0;
            y.piggy += saved;
            earn(p, total - saved);
        }
        // a part-time job pays every week
        if (y.job) {
            const d = Youth.partJob(y.job.id);
            if (d && Youth.jobBlock(d, p) == null) {
                earn(p, d.pay); y.job.weeks++; y.job.earned += d.pay; y.jobWeeks++; y.jobEarned += d.pay;
                attr(p, d.mods[0], d.mods[1], d.mods[2]);
                Youth.addPoints(p, d.points, 0.5);
                if (!Youth.has("hardWorker", p) && y.grades > 50) Youth.grades(p, -0.2);
            } else y.job = null;
        }
        // a child star: burnout fades, too much of it hurts
        if (y.star) {
            if (y.star.burnout >= 70) attr(p, 0, -2, -2);
            y.star.burnout = Math.max(0, y.star.burnout - 3);
        }
    },
    reportCard(p: any) {
        const y = Youth.state(p);
        y.report = Youth.now(p);
        const l = Youth.letter(y.grades);
        y.reports.push(l);
        if (y.reports.length > 60) y.reports.splice(0, y.reports.length - 60);
        let msg: string;
        const has = parentsOf(p).length > 0;
        if (y.grades >= 90) {
            y.honorRolls++;
            bondParents(p, 15); attr(p, 0, 6, 2); Youth.addPoints(p, { bookworm: 3, golden: 2 });
            if (has) earn(p, 20);
            if (y.honorRolls === 1) Youth.book(p, "Made the honor roll.");
            msg = `${l}! You made the honor roll.${has ? ` ${Parent(p)} put it on the fridge and gave you ${money(20)}.` : ""}`;
        } else if (y.grades >= 80) { bondParents(p, 5); Youth.addPoints(p, { bookworm: 1, golden: 1 }); msg = `${l}. Solid work.${has ? ` ${Parent(p)} ${are(p)} pleased.` : ""}`; }
        else if (y.grades >= 70) msg = `${l}. "You can do better," says the note from your teacher.`;
        else if (y.grades >= 60) { Youth.addPoints(p, { resilient: 1 }); msg = `${l}.${has ? ` ${Parent(p)} want${parentsOf(p).length === 1 ? "s" : ""} a word with you about homework.` : " Your teacher wants a word with you about homework."}`; }
        else {
            // (no hit to your relationships: v0.12.1, family doesn't drift away on its own)
            attr(p, 0, -5, -3); Youth.addPoints(p, { resilient: 2 });
            msg = `${l}. That's failing.` + (!has ? " Your teacher is worried about you." : Youth.style(p) === "strict" || Youth.style(p) === "overprotective" ? Youth.ground(p, "a failing report card") : ` ${Parent(p)} ${are(p)} worried about you.`);
        }
        Youth.say(`Report Card: ${l}`, msg, "icon_youth_school");
    },

    // ------------------------------------------------------------------ the kids you raise
    kid(child: any, p: any = player()): KidYouth {
        const m: any = Relationships.meta(child, p);
        return m.kid ?? (m.kid = { grades: rnd(60, 85), points: {}, style: null, act: null });
    },
    kidsWeek(p: any) {
        let kids: any[] = [];
        try { kids = (Array.from(p.getFamilyState().getChildren() as any) as any[]).filter(alive); } catch { return; }
        for (const k of kids) {
            const age = k.getAgeInYears();
            if (age < 5) continue;
            const kd = Youth.kid(k, p);
            if (age >= 18) {
                if (!kd.grown) Youth.kidGrowUp(k, kd, p);
                continue;
            }
            kd.grades = clamp(kd.grades + (kd.style === "strict" ? 0.15 : kd.style === "relaxed" ? -0.05 : 0.03) + (Math.random() - 0.5) * 0.6, 20, 100);
            // a little of who they are, every week
            const natural: TraitKey[] = kd.style === "strict" ? ["bookworm", "golden", "rebel"] : kd.style === "relaxed" ? ["social", "creative", "rebel"] : ["social", "kind", "athlete", "creative", "bookworm"];
            const t = pick(natural);
            kd.points[t] = (kd.points[t] ?? 0) + 0.25;
            if (kd.act) { const d = Youth.act(kd.act); if (d) for (const [k2, v] of Object.entries(d.points)) kd.points[k2 as TraitKey] = (kd.points[k2 as TraitKey] ?? 0) + (v ?? 0) * 0.2; }
            if (kd.grades >= 90) kd.points.bookworm = (kd.points.bookworm ?? 0) + 0.15;
        }
    },
    /** Their top traits (from the points your parenting gave them). */
    kidTraits(kd: KidYouth): TraitKey[] {
        return (Object.entries(kd.points) as [TraitKey, number][]).filter(([, v]) => v >= 15).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    },
    kidGrowUp(child: any, kd: KidYouth, p: any) {
        kd.grown = true;
        kd.traits = Youth.kidTraits(kd);
        const names = kd.traits.map((t) => Youth.trait(t).title);
        const msg = `${child.getFirstName()} is 18 and finished growing up (final grades: ${Youth.letter(kd.grades)}).` + (names.length ? ` You raised a ${names.join(", ")}.` : "");
        LifeMoments.result("All Grown Up", msg, "icon_youth_graduation", { random: true });
    },
    /** Parenting actions add to your kid's upbringing. */
    kidPoints(child: any, pts: Partial<Record<TraitKey, number>>, grades = 0, p: any = player()) {
        const kd = Youth.kid(child, p);
        for (const [k, v] of Object.entries(pts)) kd.points[k as TraitKey] = (kd.points[k as TraitKey] ?? 0) + (v ?? 0);
        if (grades) kd.grades = clamp(kd.grades + grades, 0, 100);
    },
    /** Generations: continuing as your child, they bring the upbringing you gave them. */
    heir(parent: any, heir: any) {
        try {
            const kids = (Array.from(parent.getFamilyState().getChildren() as any) as any[]);
            const child = kids.find((k) => k.getFirstName() === heir.getFirstName() && k.getAgeInWeeks() === heir.getAgeInWeeks()) ?? null;
            if (child == null) return;
            const m: any = Relationships.circle(parent).metaFor(child.getId());
            const kd: KidYouth | undefined = m.kid;
            if (kd == null) return;
            const y = Youth.state(heir);
            y.grades = Math.round(kd.grades);
            for (const [k, v] of Object.entries(kd.points)) y.points[k as TraitKey] = Math.round((v ?? 0) * (TRAIT_POINTS / 15));
            if (kd.style) y.style = kd.style === "strict" ? "strict" : "relaxed";
            if (kd.act) { const a = Youth.actState(kd.act, heir); a.xp = Math.max(a.xp, 35); a.joined = Youth.isYoung(heir); }
            const traits = kd.traits ?? Youth.kidTraits(kd);
            for (const t of traits) Youth.giveTrait(heir, t, true);
            y.yearbook.push({ age: 0, text: `Raised by ${parent.getFirstName()} ${parent.getLastName()}.` });
        } catch { /* ignore */ }
    },
};

/** Test hook: lets tests replace dice. */
export const YouthDice = { roll, rnd };
