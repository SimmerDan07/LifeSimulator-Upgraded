// v0.33.0 "The Career Overhaul", stage 4: career paths.
//
// Halfway up a career (Celebrity Life's own careers aside) you pick a branch: Expert, Leadership, Lifestyle, Fame or
// Founder flavours, named for each field. Your branch sets pay, weekly stats and a bonus (fans, cheaper companies,
// your boss's opinion counting double), and shows in your job title.
// Every field has a career skill (0–100) that grows each week you work (faster the harder you work), with courses,
// and from your teen activities. It lifts your performance and your Hire Score in that field.
// Certifications are short courses that run in the background (one at a time) and count at hiring.
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Youth } from "../Youth/Youth";
import { Job } from "../Enums/Job";
import { Work, WorkDice, money } from "./Work";
import { Workplace } from "./Workplace";
import { SKILLS, ACT_GROUP, COURSE_GAIN, BRANCHES, BRANCH_KINDS, BranchDef, CERTS, CertDef, EffortDef } from "./WorkData";

export interface PathState {
    skills: Record<string, number>; seeded: boolean;
    branches: Record<string, string>;
    certs: string[]; course: { id: string; until: number } | null;
    courseWeek: number;
}
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { clamp } = WorkDice;
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const pay = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null); };
const SKILL_STEP: Record<string, number> = { coast: 0.1, steady: 0.4, hard: 0.7, grind: 1.0 };

export const CareerPath = {
    state(p: any = player()): PathState {
        const w: any = Work.state(p);
        if (w.path == null) w.path = { skills: {}, seeded: false, branches: {}, certs: [], course: null, courseWeek: -999 };
        const s: PathState = w.path;
        if (!s.seeded && p.getAgeInYears?.() >= 14) CareerPath.seed(p, s);
        return s;
    },
    /** Teen activities give a head start (once). */
    seed(p: any, s: PathState) {
        s.seeded = true;
        const acts = Youth.peek(p)?.acts ?? {};
        for (const [id, a] of Object.entries(acts) as [string, any][]) {
            const g = ACT_GROUP[id] ?? (a && (Youth as any).act?.(id)?.kind === "sport" ? "sports" : null);
            if (g && a?.xp > 0) s.skills[g] = clamp((s.skills[g] ?? 0) + a.xp * 0.2, 0, 30);
        }
    },

    // ------------------------------------------------------------------ skills
    skill(group: string, p: any = player()): number { return CareerPath.state(p).skills[group] ?? 0; },
    addSkill(group: string, n: number, p: any = player()) { const s = CareerPath.state(p); s.skills[group] = clamp((s.skills[group] ?? 0) + n, 0, 100); },
    skillTitle(group: string): string { return SKILLS[group]?.title ?? "Skill"; },
    onWork(p: any, e: EffortDef) {
        const job = Work.job(p);
        if (job == null) return;
        const g = Work.group(job), cur = CareerPath.skill(g, p);
        CareerPath.addSkill(g, (SKILL_STEP[e.id] ?? 0.4) * (1 - cur / 125), p);
        // fame branches win fans every week
        const b = CareerPath.activeBranch(p);
        if (b?.kind === "fame") { try { Celebrity.addFans(p, 150 + 60 * (Work.jobState(p)?.getLevel() ?? 1)); } catch { /* no fame */ } }
    },
    courseCost(p: any = player()): number { const job = Work.job(p); return Math.round(200 + CareerPath.skill(Work.group(job), p) * 20); },
    courseLock(p: any = player()): string | null {
        if (Work.job(p) == null) return "Needs a job";
        if (CareerPath.skill(Work.group(Work.job(p)), p) >= 100) return "You know it all";
        return null;
    },
    takeCourse(p: any = player()): string {
        const g = Work.group(Work.job(p)), cur = CareerPath.skill(g, p);
        const n = Math.max(2, Math.round(COURSE_GAIN * (1 - cur / 150) * 10) / 10);
        CareerPath.addSkill(g, n, p);
        CareerPath.state(p).courseWeek = Work.now(p);
        return `A week of evening classes: +${n} ${CareerPath.skillTitle(g)} (now ${Math.floor(CareerPath.skill(g, p))}).`;
    },

    // ------------------------------------------------------------------ branches
    hasFork(job: any): boolean {
        if (job == null || BRANCHES[Work.group(job)] == null) return false;
        try { if (Celebrity.isCelebJob(job)) return false; return job.getMaxLevels() >= 3; } catch { return false; }
    },
    forkLevel(job: any): number { try { return Math.max(2, Math.ceil(job.getMaxLevels() / 2)); } catch { return 99; } },
    branches(job: any): BranchDef[] { return BRANCHES[Work.group(job)] ?? []; },
    branchOf(jobName: string, p: any = player()): BranchDef | null {
        const id = CareerPath.state(p).branches[jobName];
        if (!id) return null;
        for (const list of Object.values(BRANCHES)) { const b = list.find((x) => x.id === id); if (b) return b; }
        return null;
    },
    /** The branch that counts now (you're at or past the fork in your current job). */
    activeBranch(p: any = player()): BranchDef | null {
        const job = Work.job(p), st = Work.jobState(p);
        if (job == null || st == null || !CareerPath.hasFork(job) || st.getLevel() < CareerPath.forkLevel(job)) return null;
        return CareerPath.branchOf(job.name(), p);
    },
    needsBranch(p: any = player()): boolean {
        const job = Work.job(p), st = Work.jobState(p);
        return job != null && st != null && CareerPath.hasFork(job) && st.getLevel() >= CareerPath.forkLevel(job) && CareerPath.branchOf(job.name(), p) == null;
    },
    choose(id: string, p: any = player()): string {
        const job = Work.job(p);
        const b = CareerPath.branches(job).find((x) => x.id === id);
        if (!b) return "";
        CareerPath.state(p).branches[job.name()] = id;
        return `You're on the ${b.title} path now. ${BRANCH_KINDS[b.kind].blurb}`;
    },
    forkPrompt(p: any = player()) {
        const job = Work.job(p);
        const list = CareerPath.branches(job);
        const lines = list.map((b) => `${b.title}: ${BRANCH_KINDS[b.kind].blurb}`).join("\n\n");
        Work.milestone("A Fork in Your Career", `You've reached the middle of your career as ${Work.title(p)}. Which way now?\n\n${lines}`, "icon_work_fork",
            [...list.map((b) => [b.title, () => CareerPath.choose(b.id, p)] as [string, () => string]), ["Decide later", () => "You can pick your path any time from the Work tab."]]);
    },
    /** " (Specialist)" after the title once you're past the fork on a branch. */
    titleSuffix(jobName: string, level: number, p: any = player()): string {
        try {
            const job = (Work.job(p)?.name?.() === jobName) ? Work.job(p) : null;
            const any = job ?? CareerPath.jobOf(jobName);
            if (!any || !CareerPath.hasFork(any) || level < CareerPath.forkLevel(any)) return "";
            const b = CareerPath.branchOf(jobName, p);
            return b ? ` (${b.title})` : "";
        } catch { return ""; }
    },
    jobOf(name: string): any { return (Job as any)[name] ?? null; },

    // ------------------------------------------------------------------ hooks into the week
    payMult(p: any): number { const b = CareerPath.activeBranch(p); return b ? BRANCH_KINDS[b.kind].pay : 1; },
    mods(p: any): [number, number, number] { const b = CareerPath.activeBranch(p); return b ? BRANCH_KINDS[b.kind].mods : [0, 0, 0]; },
    perfBonus(p: any): number {
        const job = Work.job(p);
        if (job == null) return 0;
        let n = CareerPath.skill(Work.group(job), p) / 10;
        const b = CareerPath.activeBranch(p);
        if (b) n += BRANCH_KINDS[b.kind].perf;
        if (b?.kind === "lead") n += (Workplace.opinion(p) - 50) / 20;
        return n;
    },
    founderDiscount(p: any = player()): number {
        const s = CareerPath.state(p);
        for (const [job, id] of Object.entries(s.branches)) for (const list of Object.values(BRANCHES)) if (list.some((b) => b.id === id && b.kind === "founder")) return 0.3;
        return 0;
    },

    // ------------------------------------------------------------------ certifications
    cert(id: string): CertDef | undefined { return CERTS.find((c) => c.id === id); },
    hasCert(id: string, p: any = player()): boolean { return CareerPath.state(p).certs.includes(id); },
    certBlock(c: CertDef, p: any = player()): string | null {
        const s = CareerPath.state(p);
        if (s.certs.includes(c.id)) return "Done";
        if (s.course) return s.course.id === c.id ? `${s.course.until - Work.now(p)} weeks to go` : "You're already taking a course";
        if (p.getAgeInYears() < c.minAge) return `From age ${c.minAge}`;
        if (cash(p) < c.cost) return `Costs ${money(c.cost)}`;
        return null;
    },
    enroll(id: string, p: any = player()): string {
        const c = CareerPath.cert(id);
        if (!c || CareerPath.certBlock(c, p) != null) return "";
        pay(p, c.cost);
        CareerPath.state(p).course = { id, until: Work.now(p) + c.weeks };
        return `You signed up for ${c.title}: ${c.weeks} week${c.weeks === 1 ? "" : "s"} of evening classes. Life goes on around it.`;
    },
    weekly(p: any) {
        const s = CareerPath.state(p);
        if (s.course && Work.now(p) >= s.course.until) {
            const c = CareerPath.cert(s.course.id);
            s.course = null;
            if (c) {
                s.certs.push(c.id);
                if (c.id === "bootcamp") CareerPath.addSkill("tech", 15, p);
                if (c.id === "design") CareerPath.addSkill("creative", 10, p);
                Work.say("Certified", `You passed: ${c.title}. It's on your résumé now.`, "icon_work_cert");
            }
        }
        if (CareerPath.needsBranch(p) && !(Work.state(p) as any).forkAsked?.[Work.job(p).name()]) {
            const w: any = Work.state(p);
            (w.forkAsked ??= {})[Work.job(p).name()] = true;
            CareerPath.forkPrompt(p);
        }
    },
    hireBonus(job: any, p: any): [string, number] | null {
        const g = Work.group(job);
        let n = Math.round(CareerPath.skill(g, p) / 8);
        const certs = CareerPath.state(p).certs.map((id) => CareerPath.cert(id)).filter((c): c is CertDef => !!c && c.groups.includes(g));
        const certN = certs.reduce((t, c) => t + c.hire, 0);
        if (n === 0 && certN === 0) return null;
        return [`${CareerPath.skillTitle(g)} skill${certs.length ? ` and ${certs.length} certificate${certs.length === 1 ? "" : "s"}` : ""}`, Math.min(25, n + certN)];
    },
};
