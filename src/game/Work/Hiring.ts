// v0.33.0 "The Career Overhaul", stage 2: getting hired.
//
// Every career outside Starter Jobs (and Celebrity Life's own careers) has 2–4 openings at named employers, fresh
// every 4 weeks. Applying takes no week. A week later you hear back: an offer straight away (Hire Score 85+), an
// interview (3 questions, answers lean on your traits), or a no. Offers wait 4 weeks: accept, negotiate once, or
// decline. High performers get headhunted; a friend or relative who puts in a word gets you an interview.
// The Hire Score (0–100) comes from what the game already knows: grades, experience, teen jobs, upbringing and game
// traits, health or looks for some careers, fame, a criminal record, your last reference, and later certifications.
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { News } from "../Managers/News";
import { Trait } from "../Enums/Trait";
import { Job } from "../Enums/Job";
import { Careers } from "../Careers/Careers";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Crime } from "../Crime/Crime";
import { Retirement } from "../Managers/Retirement";
import { AgeLimits } from "../Managers/Schooling";
import { Youth } from "../Youth/Youth";
import { Work, Employer, WorkDice } from "./Work";
import {
    VIBES, PERKS, OPENINGS_EVERY, SKIP_INTERVIEW, OFFER_WEEKS, GROUP_FIT, PHYSICAL_GROUPS, LOOKS_GROUPS,
    QUESTIONS, ANSWER_TITLES, ANSWER_TRAITS, AnswerStyle,
} from "./WorkData";

export interface Opening { id: string; job: string; employer: Employer; level: number }
export interface Application {
    id: string; job: string; employer: Employer; level: number; week: number;
    stage: "applied" | "interview" | "offer"; iv: number; pay: number; expires: number;
    via?: string; negotiated?: boolean;
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { roll, rnd, pick, clamp } = WorkDice;
const refresh = () => { try { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); } catch { /* no UI */ } };
const has = (p: any, t: string) => { try { return p.hasTrait((Trait as any)[t]); } catch { return false; } };
const WPY = 52;
let seq = 0;
const uid = () => `${Date.now().toString(36)}${(seq++).toString(36)}`;

export const Hiring = {
    /** Extra Hire Score parts (certifications, Job Board Premium…), added by later stages. */
    scoreHooks: [] as ((job: any, p: any) => [string, number] | null)[],
    /** Weeks between fresh openings (Job Board Premium: 2). */
    refreshWeeks: (p: any): number => OPENINGS_EVERY,

    jobOf(name: string): any { return (Job as any)[name]; },
    usesOpenings(job: any): boolean {
        if (!Work.enabled || job == null) return false;
        if (Work.group(job) === "starter") return false;
        try { if (Celebrity.isCelebJob(job)) return false; } catch { /* ignore */ }
        return true;
    },
    titleAt(job: any, level: number): string { try { return job.getJobTitles()[Math.max(0, Math.min(job.getMaxLevels(), level) - 1)]; } catch { return String(job); } },
    careerName(job: any): string { try { return Careers.def(job)?.name ?? job.getJobTitles()[0]; } catch { return String(job); } },

    // ------------------------------------------------------------------ the Hire Score
    yearsIn(group: string, p: any = player()): number {
        let weeks = 0;
        try { for (const st of p.getJobState().states) if (Work.group(st.getType()) === group) weeks += st.weeksInCareer ?? 0; } catch { /* ignore */ }
        return Math.floor(weeks / WPY);
    },
    scoreParts(job: any, p: any = player()): [string, number][] {
        const g = Work.group(job), parts: [string, number][] = [];
        const add = (label: string, n: number) => { n = Math.round(n); if (n !== 0) parts.push([label, n]); };
        const y = Youth.peek(p);
        if (y && (y.grown || y.graduated)) add("School grades", clamp((y.grades - 70) / 3, -5, 10));
        add("Experience in this field", Math.min(15, Hiring.yearsIn(g, p) * 3));
        if (y && y.jobWeeks >= 26) add("Part-time work as a teen", 4);
        const fit = (y?.traits ?? []).filter((t: string) => (GROUP_FIT[g] ?? []).includes(t)).length;
        add("Upbringing", Math.min(10, fit * 5));
        add("Smarts", (has(p, "intellectualCuriosity") ? 3 : 0) + (has(p, "logical") ? 3 : 0) - (has(p, "stupid") ? 8 : 0));
        add("Work ethic", has(p, "lazy") ? -6 : 0);
        add("Way with words", (has(p, "persuasive") ? 2 : 0) + (has(p, "articulate") ? 2 : 0));
        if (LOOKS_GROUPS.includes(g)) add("Looks", (has(p, "sexy") ? 4 : 0) - (has(p, "buttUgly") ? 4 : 0));
        if (PHYSICAL_GROUPS.includes(g)) { try { add("Fitness", clamp((p.getAttributeState().getHealth() - 60) / 8, -5, 5)); } catch { /* ignore */ } }
        const fans = Celebrity.fans(p);
        if (fans >= 1_000_000) add("Famous", 10); else if (fans >= 10_000) add("A bit famous", 5);
        try { if (Crime.activeRecord(p).length) add("Criminal record", -15); } catch { /* ignore */ }
        const last = Work.state(p).history[0];
        if (last) add(`Reference from ${last.employer}`, Hiring.referenceOf(last.why));
        for (const h of Hiring.scoreHooks) { const r = h(job, p); if (r) add(r[0], r[1]); }
        return parts;
    },
    referenceOf(why: string): number {
        if (/fired/.test(why)) return -10;
        if (/walked out|on the spot/.test(why)) return -5;
        if (/notice|laid off|retired|moved on|headhunted/.test(why)) return 5;
        return 0;
    },
    score(job: any, p: any = player()): number { return clamp(40 + Hiring.scoreParts(job, p).reduce((t, [, n]) => t + n, 0), 0, 100); },

    // ------------------------------------------------------------------ openings
    /** Why you can't apply for this career right now, or null. */
    applyBlock(job: any, p: any = player()): string | null {
        if (p.getCrimeState?.().getIsInJail?.()) return "Not from prison";
        const young = AgeLimits.tooYoung(AgeLimits.work, p); if (young) return young;
        const block = Careers.applyBlock(job, p); if (block) return block;
        const ed = job.educationRequirement(1);
        if (ed != null && !p.getCompletableActionState().isCompleted(ed)) return `Needs ${ed.getTitle()}`;
        const item = job.getRequiredItem?.();
        if (item != null && !p.getItemState().isOwned(item)) return `Needs ${item.getTitle()}`;
        return null;
    },
    openings(job: any, p: any = player()): Opening[] {
        const w = Work.state(p), name = job.name(), now = Work.now(p);
        const cur = w.openings[name];
        if (cur && now - cur.week < Hiring.refreshWeeks(p)) return cur.list;
        const st = p.getJobState().getState(job);
        const years = Hiring.yearsIn(Work.group(job), p);
        const list: Opening[] = [];
        for (let i = 0, n = rnd(2, 4); i < n; i++) {
            let level = Math.max(1, st.getLevel());
            // experienced people see senior openings, if their education reaches that far
            if (years >= 3 && roll(0.35)) {
                const want = Math.min(job.getMaxLevels(), level + 1 + Math.floor(years / 4));
                for (let l = want; l > level; l--) { const ed = job.educationRequirement(l); if (ed == null || p.getCompletableActionState().isCompleted(ed)) { level = l; break; } }
            }
            list.push({ id: uid(), job: name, employer: Work.newEmployer(job, p), level });
        }
        w.openings[name] = { week: now, list };
        return list;
    },
    applied(job: string, employer: string, p: any = player()): boolean { return Work.state(p).apps.some((a) => a.job === job && a.employer.name === employer); },
    activeApps(p: any = player()): Application[] { return Work.state(p).apps; },
    offers(p: any = player()): Application[] { return Work.state(p).apps.filter((a) => a.stage === "offer"); },
    maxApps: 5,
    apply(o: Opening, p: any = player()): string {
        const w = Work.state(p), job = Hiring.jobOf(o.job);
        const block = Hiring.applyBlock(job, p);
        if (block) return block;
        if (Hiring.applied(o.job, o.employer.name, p)) return "You already applied there.";
        if (w.apps.filter((a) => a.stage !== "offer").length >= Hiring.maxApps) return `You can have ${Hiring.maxApps} applications out at once.`;
        const app: Application = { id: uid(), job: o.job, employer: o.employer, level: o.level, week: Work.now(p), stage: "applied", iv: 0, pay: o.employer.pay, expires: 0 };
        if (w.referral) { app.via = w.referral; w.referral = null; }
        w.apps.push(app);
        return `Application sent to ${o.employer.name}. You'll hear back next week.${app.via ? ` ${app.via} put in a good word for you.` : ""}`;
    },
    withdraw(id: string, p: any = player()) { const w = Work.state(p); w.apps = w.apps.filter((a) => a.id !== id); },

    // ------------------------------------------------------------------ hearing back
    afterWeek(p: any) {
        const w = Work.state(p), now = Work.now(p);
        for (const a of [...w.apps]) {
            if (a.stage === "applied" && now > a.week) Hiring.hearBack(a, p);
            else if (a.stage === "offer" && now >= a.expires) {
                w.apps = w.apps.filter((x) => x !== a);
                News.add({ getTitle: () => "Offer Expired", getMessage: () => `The offer from ${a.employer.name} ran out.`, getImageId: () => "tab_briefcase" });
            }
        }
        Hiring.headhunt(p);
    },
    hearBack(a: Application, p: any) {
        const w = Work.state(p), job = Hiring.jobOf(a.job), score = Hiring.score(job, p);
        if (score >= SKIP_INTERVIEW) { a.iv = 20; Hiring.makeOffer(a, p, "Your application was so strong they skipped the interview."); return; }
        if (a.via || roll(0.3 + score * 0.006)) { a.stage = "interview"; Hiring.interview(a, p); return; }
        w.apps = w.apps.filter((x) => x !== a);
        News.add({ getTitle: () => "Application Turned Down", getMessage: () => `${a.employer.name} went with someone else for ${Hiring.titleAt(job, a.level)}.`, getImageId: () => "tab_briefcase" });
    },

    // ------------------------------------------------------------------ the interview
    interview(a: Application, p: any) {
        const qs = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 3);
        const job = Hiring.jobOf(a.job);
        const ask = (i: number) => {
            const q = qs[i];
            const styles = Object.keys(ANSWER_TITLES) as AnswerStyle[];
            Work.milestone(`Interview at ${a.employer.name}`, `${i === 0 ? `You're interviewing for ${Hiring.titleAt(job, a.level)}.\n\n` : ""}Question ${i + 1} of 3: "${q.q}"\n\n${styles.map((s) => `${ANSWER_TITLES[s]}: ${q.answers[s]}`).join("\n")}`, "tab_briefcase",
                styles.map((s) => [ANSWER_TITLES[s], () => { a.iv += Hiring.answerPoints(s, p); if (i < 2) { ask(i + 1); return ""; } return Hiring.finishInterview(a, p); }] as [string, () => string]));
        };
        ask(0);
    },
    answerPoints(style: AnswerStyle, p: any): number {
        const fits = ANSWER_TRAITS[style].some((t) => has(p, t));
        if (fits) return 12;
        if (style === "funny") return roll(0.5) ? 12 : -4;
        if (style === "confident") return roll(0.3) ? -3 : 8;
        return style === "honest" ? 8 : 7;
    },
    finishInterview(a: Application, p: any): string {
        const w = Work.state(p), job = Hiring.jobOf(a.job);
        if (!w.apps.includes(a)) return "";
        const chance = clamp(0.25 + Hiring.score(job, p) * 0.006 + a.iv * 0.012 + (a.via ? 0.1 : 0), 0.05, 0.97);
        if (roll(chance)) { Hiring.makeOffer(a, p, "They liked you."); return ""; }
        w.apps = w.apps.filter((x) => x !== a);
        return `${a.employer.name} called: they went with someone else. ${pick(["It stings, but there are other openings.", "Their loss.", "Onwards."])}`;
    },

    // ------------------------------------------------------------------ offers
    makeOffer(a: Application, p: any, why: string) {
        a.stage = "offer";
        a.pay = Math.round(a.employer.pay * (1 + Math.max(0, a.iv - 15) / 300) * 100) / 100;
        a.expires = Work.now(p) + OFFER_WEEKS;
        Work.milestone("Job Offer", `${why} ${a.employer.name} offers you ${Hiring.offerText(a)}`, "tab_briefcase", Hiring.offerOptions(a, p));
    },
    offerText(a: Application): string {
        const job = Hiring.jobOf(a.job);
        const perks = a.employer.perks.map((k) => PERKS[k].title);
        return `${Hiring.titleAt(job, a.level)} at ${Math.round(a.pay * 100)}% of the usual pay. ${VIBES[a.employer.vibe].title} workplace.${perks.length ? ` Perks: ${perks.join(", ")}.` : ""}`;
    },
    offerOptions(a: Application, p: any): [string, () => string][] {
        const o: [string, () => string][] = [["Accept", () => Hiring.accept(a, p)]];
        if (!a.negotiated) o.push(["Negotiate", () => { Hiring.negotiateMenu(a, p); return ""; }]);
        o.push(["Think it over", () => `The offer waits ${OFFER_WEEKS} weeks on the Work tab (Job Applications).`]);
        o.push(["Decline", () => Hiring.decline(a, p)]);
        return o;
    },
    acceptBlock(a: Application, p: any = player()): string | null { return Hiring.applyBlock(Hiring.jobOf(a.job), p); },
    accept(a: Application, p: any = player()): string {
        const w = Work.state(p), job = Hiring.jobOf(a.job);
        const block = Hiring.acceptBlock(a, p);
        if (block) return block;
        w.apps = w.apps.filter((x) => x !== a && x.job !== a.job);
        const hadJob = Work.job(p) != null;
        Retirement.beforeApplying(() => {
            if (hadJob) { Work.employer(p); Work.left(p, a.via === "headhunter" ? "headhunted" : "moved on"); }
            Work.pendingEmployer = { ...a.employer, pay: a.pay };
            p.getJobState().switchJob(job);
            const st = p.getJobState().getState(job);
            if (a.level > st.getLevel()) { st.setLevel(a.level); st.setProgress(0); }
            refresh();
        });
        return `You start as ${Hiring.titleAt(job, Math.max(a.level, p.getJobState().getState(job).getLevel()))} at ${a.employer.name} this week.`;
    },
    decline(a: Application, p: any = player()): string {
        Work.state(p).apps = Work.state(p).apps.filter((x) => x !== a);
        return `You turned down ${a.employer.name}.`;
    },
    negotiateMenu(a: Application, p: any) {
        const ask = (pct: number, ok: number, pull: number) => () => {
            a.negotiated = true;
            if (roll(ok)) { a.pay = Math.round(a.pay * (1 + pct / 100) * 100) / 100; Work.milestone("They Said Yes", `${a.employer.name} raised the offer by ${pct}%: ${Hiring.offerText(a)}`, "tab_briefcase", Hiring.offerOptions(a, p)); return ""; }
            if (roll(pull)) { Work.state(p).apps = Work.state(p).apps.filter((x) => x !== a); return `${a.employer.name} pulled the offer. Too much, too soon.`; }
            Work.milestone("They Held Firm", `${a.employer.name} won't go higher. The offer stands: ${Hiring.offerText(a)}`, "tab_briefcase", Hiring.offerOptions(a, p));
            return "";
        };
        Work.menu("Negotiate", "Ask for more. The bigger the ask, the bigger the risk they walk away.", "tab_briefcase", [
            ["Ask for 5% more", ask(5, 0.85, 0.05)],
            ["Ask for 10% more", ask(10, 0.65, 0.1)],
            ["Ask for 20% more", ask(20, 0.4, 0.25)],
            ["Never mind", () => { Work.milestone("Job Offer", `${a.employer.name} offers you ${Hiring.offerText(a)}`, "tab_briefcase", Hiring.offerOptions(a, p)); return ""; }],
        ]);
    },

    // ------------------------------------------------------------------ headhunters
    headhunt(p: any) {
        const w = Work.state(p), job = Work.job(p), e = w.employer;
        if (job == null || e == null || w.perf < 80 || Work.now(p) - e.since < WPY) return;
        if (w.apps.some((a) => a.via === "headhunter") || !roll(0.012)) return;
        const st = p.getJobState().getCurrentJobState();
        const rival = Work.newEmployer(job, p);
        rival.pay = Math.round(e.pay * w.raise * (1.15 + Math.random() * 0.15) * 100) / 100;
        const a: Application = { id: uid(), job: job.name(), employer: rival, level: st.getLevel(), week: Work.now(p), stage: "offer", iv: 0, pay: rival.pay, expires: Work.now(p) + OFFER_WEEKS, via: "headhunter", negotiated: false };
        w.apps.push(a);
        const msg = `A recruiter from ${rival.name} heard about your work. They offer ${Hiring.offerText(a)} It waits on the Work tab for ${OFFER_WEEKS} weeks.`;
        Work.say("Headhunted", msg);
    },
};
