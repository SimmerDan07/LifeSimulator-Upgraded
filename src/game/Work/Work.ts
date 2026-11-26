// v0.33.0 "The Career Overhaul": rules. Data in WorkData.ts, rows in WorkScreens.ts.
//
// Effort (one setting, kept week to week) replaces the old Work / Overtime / All-nighter buttons: one "Go to Work"
// button passes the week at the chosen effort. Effort sets the pay, how fast you climb, the weekly stat cost, and
// where your performance (0–100) settles. A promotion needs a full progress bar AND performance at Meets (40+).
// Pull an All-nighter is a one-off (every 4 weeks, instant). Burnout uses Illness's overwork counter: at the top
// you catch Burnout (the illness) and choose what to do.
// Every job has an employer: a name, a workplace vibe and perks. Old saves get one for the job they already have.
//
// State: Player.work (undefined in older saves; made on first use).
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { AlertActionViewModel } from "../Managers/AlertActionViewModel";
import { AlertType } from "../Managers/AlertType";
import { ArrayList } from "../runtime";
import { AttributeState } from "../Managers/AttributeState";
import { LifeMoments } from "../Managers/LifeMoments";
import { Modifiers } from "../Managers/Modifiers";
import { CompletableAction } from "../Enums/CompletableAction";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { News } from "../Managers/News";
import { Careers } from "../Careers/Careers";
import { Illness } from "../Health/Illness";
import { Vampire } from "../Lifepaths/Vampire";
import {
    EFFORTS, EffortDef, EffortId, effortDef, ratingOf, PROMOTION_PERF, BURNOUT_FULL, ALL_NIGHTER_EVERY,
    VIBES, VIBE_IDS, VibeId, PERKS, PERK_IDS, PerkId, GROUP_PERKS, employerName,
} from "./WorkData";

export interface Employer { name: string; job: string; vibe: VibeId; pay: number; perks: PerkId[]; since: number }
export interface HistoryEntry { job: string; title: string; employer: string; from: number; to: number; why: string }
export interface WorkState {
    v: number;
    effort: EffortId;
    perf: number;
    /** Promotion progress carried between weeks (effort can add half a week). */
    frac: number;
    wfh: boolean;
    allNighter: number;
    employer: Employer | null;
    /** Raises at this job, as a pay multiplier. */
    raise: number;
    history: HistoryEntry[];
    /** Set when an older save got its employer: a one-time "upgrade" note. */
    converted: boolean;
    burnoutShown: number;
    /** Stage 2: openings per career (refreshed every few weeks), applications and offers, a friend's good word. */
    openings: Record<string, { week: number; list: any[] }>;
    apps: any[];
    referral: string | null;
    /** Stage 3: the boss, coworkers, reviews (Workplace.ts). */
    team?: any;
    /** Stage 4–5: career path, side hustles, companies. */
    path?: any; hustles?: any; companies?: any[];
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
export const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const roll = (x: number) => Math.random() < x;
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const refresh = () => { try { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); } catch { /* no UI */ } };

export const Work = {
    enabled: true,
    hooks: {} as { onLeft?: (p: any, why: string) => void },
    /** Run when a new job starts (the workplace builds your team). */
    hireHooks: [] as ((p: any) => void)[],
    /** The employer of the offer you accepted, picked up by JobState.switchJob. */
    pendingEmployer: undefined as Employer | undefined,

    now(p: any = player()): number { try { return p.getTrueAgeInWeeks(); } catch { return 0; } },
    peek(p: any = player()): WorkState | null { return p?.work ?? null; },
    state(p: any = player()): WorkState {
        let w: WorkState = p.work;
        if (w == null) {
            w = p.work = { v: 1, effort: "steady", perf: 50, frac: 0, wfh: false, allNighter: -999, employer: null, raise: 1, history: [], converted: false, burnoutShown: -999 } as WorkState;
            // an older save that already has a job: give it an employer and a fair start
            if (Work.job(p) != null) { w.perf = 60; w.employer = Work.newEmployer(Work.job(p), p); w.converted = true; }
        }
        w.history ??= []; w.openings ??= {}; w.apps ??= []; w.referral ??= null;
        return w;
    },
    job(p: any = player()): any { try { return p.getJobState().getCurrentJob(); } catch { return null; } },
    jobState(p: any = player()): any { try { return p.getJobState().getCurrentJobState(); } catch { return null; } },
    group(job: any): string { return (job && Careers.categoryOf(job)) || "starter"; },
    title(p: any = player()): string { try { return Work.jobState(p)?.getJobTitle() ?? ""; } catch { return ""; } },

    // ------------------------------------------------------------------ employers
    newEmployer(job: any, p: any = player(), opts: Partial<Employer> = {}): Employer {
        const g = Work.group(job);
        const vibe: VibeId = opts.vibe ?? pick(VIBE_IDS);
        const likely = GROUP_PERKS[g] ?? [];
        const perks = new Set<PerkId>();
        for (const k of likely) if (roll(0.55)) perks.add(k);
        if (roll(0.3)) perks.add(pick(PERK_IDS));
        if (vibe === "prestigious") perks.add(pick(["pension", "insurance", "match"] as PerkId[]));
        return {
            name: opts.name ?? employerName(g), job: job?.name?.() ?? String(job), vibe,
            pay: opts.pay ?? Math.round((0.9 + Math.random() * 0.2) * 100) / 100,
            perks: opts.perks ?? [...perks], since: opts.since ?? Work.now(p),
        };
    },
    /** The employer for the job you have now (made if the job changed some other way). */
    employer(p: any = player()): Employer | null {
        const w = Work.state(p), job = Work.job(p);
        if (job == null) { if (w.employer) Work.left(p, "left"); return null; }
        if (w.employer == null || w.employer.job !== job.name()) {
            if (w.employer) Work.left(p, "moved on");
            w.employer = Work.newEmployer(job, p); w.raise = 1; w.perf = 50; w.frac = 0; w.wfh = false;
            for (const f of Work.hireHooks) { try { f(p); } catch (e) { console.error(e); } }
        }
        return w.employer;
    },
    hasPerk(id: PerkId, p: any = player()): boolean { return Work.employer(p)?.perks.includes(id) ?? false; },
    vibe(p: any = player()) { const e = Work.employer(p); return e ? VIBES[e.vibe] : null; },
    /** A new job just started (JobState.switchJob). */
    onHired(p: any, job: any, employer?: Employer) {
        if (!Work.enabled) return;
        const w = Work.state(p);
        if (w.employer && w.employer.job !== job?.name?.()) Work.left(p, "moved on");
        w.employer = employer ?? Work.newEmployer(job, p);
        w.employer.job = job.name(); w.employer.since = Work.now(p);
        w.raise = 1; w.perf = 50; w.frac = 0; w.wfh = false;
        for (const f of Work.hireHooks) { try { f(p); } catch (e) { console.error(e); } }
    },
    /** The job ended (quit, fired, retired, prison, …): into your job history. */
    left(p: any, why: string) {
        const w = Work.state(p), e = w.employer;
        if (e == null) return;
        let title = e.job;
        try { const st = p.getJobState().states.find((s: any) => s.getType().name() === e.job); if (st) title = st.getJobTitle(); } catch { /* ignore */ }
        w.history.unshift({ job: e.job, title, employer: e.name, from: e.since, to: Work.now(p), why });
        if (w.history.length > 30) w.history.length = 30;
        w.employer = null; w.raise = 1; w.wfh = false;
        Work.hooks.onLeft?.(p, why);
    },
    /** Leave your job yourself (the burnout choice; the full Quit comes with the workplace). */
    quit(p: any, why = "quit") {
        if (Work.job(p) == null) return;
        Work.employer(p);
        Work.left(p, why);
        p.getJobState().setCurrentJob(null);
    },

    // ------------------------------------------------------------------ effort & performance
    effort(p: any = player()): EffortDef { return effortDef(Work.state(p).effort); },
    setEffort(id: EffortId, p: any = player()) { if (EFFORTS.some((e) => e.id === id)) Work.state(p).effort = id; },
    perf(p: any = player()): number { return Work.state(p).perf; },
    rating(p: any = player()) { return ratingOf(Work.perf(p)); },
    /** Pay multiplier for a week's work. A WorkAction other than "normal" is the old game's button (tests, old paths). */
    payModifier(p: any, workAction?: any): number {
        if (!Work.enabled) return workAction?.getPayModifier?.() ?? 1;
        if (workAction != null && workAction.name?.() !== "normal") return workAction.getPayModifier();
        const e = Work.effort(p);
        let m = e.pay;
        if (e.id === "grind" && Work.timeManaged(p)) m += 0.15;   // the old Time Management skill still helps
        const emp = Work.employer(p);
        if (emp) m *= emp.pay * (VIBES[emp.vibe]?.pay ?? 1);
        for (const f of Work.payHooks) m *= f(p);
        return m * Work.state(p).raise;
    },
    /** Pay multipliers from later stages (your career branch). */
    payHooks: [] as ((p: any) => number)[],
    /** Run after each week's work (career skills grow). */
    workHooks: [] as ((p: any, effort: EffortDef) => void)[],
    timeManaged(p: any): boolean { try { return p.hasSkill(CompletableAction.timeMangement); } catch { return false; } },
    /** The week's work: stats, performance, burnout. Returns the name Illness knows the effort by. */
    onWork(p: any, workAction?: any): string {
        if (!Work.enabled) return workAction?.name?.() ?? "normal";
        const legacy = workAction != null && workAction.name?.() !== "normal";
        const w = Work.state(p), e = Work.effort(p), emp = Work.employer(p);
        // the week's cost (vampires don't lose health to work)
        const vibe = emp ? VIBES[emp.vibe] : null;
        const [h, hap, san] = Work.weekMods(p);
        if (!legacy && (h || hap || san)) AttributeState.setDeltaValue$default(p.getAttributeState(), new Modifiers(h, hap, san), "Effort", 2, null);
        // performance settles towards the effort's target
        const target = clamp((legacy ? effortDef(workAction.name() === "veryHard" ? "grind" : "hard").target : e.target) + (vibe?.target ?? 0) + Work.perfBonus(p), 0, 100);
        let step = (target - w.perf) * 0.12;
        if (step > 0 && w.wfh) step *= 0.75;
        w.perf = clamp(w.perf + step, 0, 100);
        for (const f of Work.workHooks) { try { f(p, legacy ? effortDef(workAction.name() === "veryHard" ? "grind" : "hard") : e); } catch (err) { console.error(err); } }
        return legacy ? workAction.name() : e.overwork;
    },
    /** What a week at your effort does to health, happiness and sanity (vampires don't lose health to work). */
    weekMods(p: any = player()): [number, number, number] {
        const w = Work.state(p), e = Work.effort(p), emp = Work.employer(p);
        const vibe = emp ? VIBES[emp.vibe] : null;
        let [h, hap, san] = e.mods;
        if (vibe) { hap += vibe.mods[1]; san += vibe.mods[2]; }
        if (Work.hasPerk("meals", p)) h += 1;
        if (Work.hasPerk("flexible", p)) san += 1;
        if (w.wfh) san += 1;
        for (const f of Work.modHooks) { const m = f(p); h += m[0]; hap += m[1]; san += m[2]; }
        if (Vampire.isVampire(p)) h = Math.max(0, h);
        return [h, hap, san];
    },
    modHooks: [] as ((p: any) => [number, number, number])[],
    /** Extra performance target (career skills, the boss) — later stages add to this. */
    perfBonus(p: any): number { let b = 0; for (const f of Work.perfHooks) b += f(p); return b; },
    perfHooks: [] as ((p: any) => number)[],
    /** Weekly rules of the later stages (hiring, the workplace, hustles, companies, benefits). */
    weekHooks: [] as ((p: any) => void)[],
    /** Extra rows on the résumé (certifications, skills) and extra "work-…" screens from later stages. */
    resumeHooks: [] as ((p: any) => any[])[],
    screenHooks: [] as ((key: string, p: any) => any[] | null)[],
    /** Promotion progress for this week (whole weeks; Coasting adds half). */
    progressStep(p: any = player()): number {
        if (!Work.enabled) return 1;
        const w = Work.state(p);
        w.frac += Work.effort(p).progress;
        const n = Math.floor(w.frac);
        w.frac -= n;
        return n;
    },
    /** Why the next promotion can't happen yet, or null. */
    promotionBlock(p: any = player()): string | null {
        if (!Work.enabled) return null;
        return Work.perf(p) < PROMOTION_PERF ? `Performance must reach ${PROMOTION_PERF} (Meets Expectations)` : null;
    },

    // ------------------------------------------------------------------ one-offs
    allNighterLock(p: any = player()): string | null {
        const since = Work.now(p) - Work.state(p).allNighter;
        return since < ALL_NIGHTER_EVERY ? `Again in ${ALL_NIGHTER_EVERY - since} week${ALL_NIGHTER_EVERY - since === 1 ? "" : "s"}` : null;
    },
    allNighter(p: any = player()): string {
        const w = Work.state(p);
        w.allNighter = Work.now(p);
        const before = w.perf;
        w.perf = clamp(w.perf + 12, 0, 100);
        Illness.onWork(p, "veryHard");
        return pick([
            "Coffee, cold pizza and a deadline. You hit send at 5:58 a.m.",
            "The cleaners said goodnight. Then good morning.",
            "You finished the whole thing in one sitting. Your boss is impressed; your back isn't.",
        ]) + ` (performance ${Math.round(before)} → ${Math.round(w.perf)})`;
    },
    canWfh(p: any = player()): boolean { return Work.hasPerk("remote", p); },
    setWfh(on: boolean, p: any = player()) { Work.state(p).wfh = on && Work.canWfh(p); },

    // ------------------------------------------------------------------ burnout
    /** 0–100: how close Illness's overwork counter is to Burnout. */
    burnout(p: any = player()): number { try { return clamp(Math.round((Illness.state(p).overwork / BURNOUT_FULL) * 100), 0, 100); } catch { return 0; } },
    checkBurnout(p: any) {
        if (Illness.immune(p) || Work.job(p) == null) return;
        const s = Illness.state(p), w = Work.state(p);
        // caught by the old overwork risk this week, or the meter topped out
        const caught = Illness.list(p).find((x: any) => x.id === "burnout");
        if (caught == null && s.overwork >= BURNOUT_FULL) { Illness.catch(p, "burnout", "working yourself to the bone", true); s.overwork = BURNOUT_FULL * 0.6; }
        const ill = Illness.list(p).find((x: any) => x.id === "burnout");
        const cal = (() => { try { return p.calendarWeeks(); } catch { return 0; } })();   // Illness counts calendar weeks
        if (ill == null || w.burnoutShown >= ill.since) return;
        w.burnoutShown = cal;
        Work.milestone("Burned Out", "You've been running on empty for too long. One morning you just can't get out of bed. You've caught Burnout (see the Health tab).", "sanity_low", [
            ["Ease off (Steady)", () => { Work.setEffort("steady", p); return "You set your effort back to Steady. Rest is part of the job."; }],
            ["Push through", () => "You kept going. Your body won't thank you."],
            ["Quit your job", () => { Work.quit(p, "burned out"); return "You walked away. Whatever comes next, it won't be this."; }],
        ]);
    },

    // ------------------------------------------------------------------ the week
    afterWeek(p: any) {
        if (!Work.enabled) return;
        try { if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) return; } catch { return; }
        const w = Work.state(p);
        Work.employer(p);   // notices a job that ended or changed some other way
        if (w.converted) {
            w.converted = false;
            const e = w.employer;
            if (e) Work.milestone("Your Work Life Got an Upgrade", `You work at ${e.name} (${VIBES[e.vibe].title.toLowerCase()} workplace). Set your effort on the Work tab: Coasting, Steady, Hard Worker or Grinding. It sticks week to week, and one Go to Work button does the rest.`, "tab_briefcase");
        }
        if (Work.job(p) != null) Work.checkBurnout(p);
        for (const f of Work.weekHooks) { try { f(p); } catch (e) { console.error(e); } }
    },

    // ------------------------------------------------------------------ pop-ups
    say(title: string, msg: string, image: any = "tab_briefcase") { LifeMoments.result(title, msg, image, { random: AlertManager.inWeek > 0 }); },
    /** A menu the player opened: always pops up. */
    menu(title: string, text: string, image: any, options: [string, () => string | null | void][]) {
        LifeMoments.ask(title, text, image, options.map(([l, f]) => [l, () => (f() as any) ?? ""] as [string, () => string]));
    },
    /** Something that changes your life (reviews, offers, firing, burnout): always shows. */
    milestone(title: string, text: string, image: any, options?: [string, () => string][]) {
        try {
            const wrap = (o: [string, () => string]) => new AlertActionViewModel(o[0], { invoke: () => { const r = o[1](); if (r) LifeMoments.result(title, r, image); refresh(); return null; } });
            let vm: any;
            if (options && options.length > 1) {
                const extra = new ArrayList<AlertActionViewModel>();
                for (const o of options.slice(1, -1)) extra.add(wrap(o));
                vm = new AlertViewModel(title, text, image, null, null, wrap(options[0]), wrap(options[options.length - 1]), extra, AlertType.Alert, 0, null);
            } else vm = new AlertViewModel(title, text, image, null, null, null, null, null, null, 504, null);
            vm.milestone = true; vm.essential = true;
            AlertManager.showAlert$default(AlertManager.INSTANCE, vm, false, 2, null);
            News.add({ getTitle: () => title, getMessage: () => text, getImageId: () => image });
        } catch { /* no UI */ }
    },
};
export const WorkDice = { roll, rnd, pick, clamp };
export { PERKS, VIBES };
