// v0.33.0 "The Career Overhaul": the rows on the Work tab (and elsewhere). Rules live in Work.ts.
import { R, SpannableStringBuilder } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { WorkButtonsViewModel } from "../Models/WorkButtonsViewModel";
import { WorkAction } from "../Enums/WorkAction";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { LifeActionDef, LifeActions, Vampire } from "../Lifepaths/Vampire";
import { Work, money } from "./Work";
import { EFFORTS, VIBES, PERKS, PROMOTION_PERF, ratingOf, SKIP_INTERVIEW } from "./WorkData";
import { Hiring, Application } from "./Hiring";
import { Workplace, BOSS_TYPES } from "./Workplace";
import { CareerPath } from "./CareerPath";
import { Hustles, HUSTLES, HUSTLE_LEVELS } from "./Hustles";
import { Companies, COMPANY_TYPES, QUALITY, PRICES, MARKETING, Company } from "./Company";
import { Benefits, K401_OPTIONS } from "./Benefits";
import { SelfCare, SLEEP, QUICK_CARE, CARE, GOALS } from "./SelfCare";
import { Retirement } from "../Managers/Retirement";
import { SKILLS, BRANCH_KINDS, CERTS } from "./WorkData";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
export const note = (id: string, s: string) => new SingleLabelCellViewModel(id, new TextLabelViewModel(s, null, false, false, null, null, 62, null));
export const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const pct = (m: number) => `${Math.round(m * 100) / 100}×`;
const refresh = () => { try { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); } catch { /* no UI */ } };

// ================================================================== Work tab › your job
export const JOB_ACTIONS: LifeActionDef[] = [
    { id: "effort", title: () => `Effort: ${Work.effort().title}`, image: "icon_work_effort", instant: true, actionTitle: () => "Change",
        note: () => `${Work.effort().blurb}\nPay ${pct(Work.payModifier(player()))} this week.\n`,
        run: (p) => openEffortMenu(p) },
    { id: "wfh", title: () => (Work.state().wfh ? "Working from Home" : "Work from Home"), image: "icon_work_wfh", instant: true,
        show: (p) => Work.canWfh(p), actionTitle: () => (Work.state().wfh ? "Go Back In" : "Start"),
        note: () => (Work.state().wfh ? "+1 sanity a week and no commute. Performance climbs 25% slower.\n" : "Your job has remote days. Less stress, but performance climbs 25% slower.\n"),
        run: (p) => { Work.setWfh(!Work.state(p).wfh, p); } },
    { id: "allNighter", title: "Pull an All-nighter", image: "icon_work_allnighter", instant: true, mods: [-2, -3, -4],
        lock: (p) => Work.allNighterLock(p),
        note: () => `+12 performance right now. Once every 4 weeks, and it adds to burnout.\n`,
        run: (p) => Work.say("All-nighter", Work.allNighter(p), "icon_work_allnighter") },
    { id: "quit", title: () => (Workplace.state().notice != null ? "Working Your Notice" : "Quit Your Job"), image: "icon_work_quit", instant: true,
        actionTitle: () => (Workplace.state().notice != null ? "Details" : "Quit"),
        note: () => { const n = Workplace.state().notice; return n != null ? `Your last week is in ${n - Work.now()} week${n - Work.now() === 1 ? "" : "s"}.\n` : "Two weeks' notice for a good reference, or walk out today.\n"; },
        run: (p) => Workplace.quitMenu(p) },
];
/** Work tab › Career Path (under your job). */
export const PATH_ACTIONS: LifeActionDef[] = [
    { id: "branch", title: () => { const b = CareerPath.activeBranch(); return b ? `Career Path: ${b.title}` : "Choose Your Career Path"; }, image: "icon_work_fork", instant: true,
        show: (p) => CareerPath.hasFork(Work.job(p)) && (CareerPath.needsBranch(p) || CareerPath.activeBranch(p) != null),
        actionTitle: () => (CareerPath.activeBranch() ? "Change" : "Choose"),
        note: () => { const b = CareerPath.activeBranch(); return b ? `${BRANCH_KINDS[b.kind].blurb}\n` : "You've reached the fork: pick the way your career goes.\n"; },
        run: (p) => CareerPath.forkPrompt(p) },
    { id: "fork", title: () => `Career Path at ${Hiring.titleAt(Work.job(), CareerPath.forkLevel(Work.job()))}`, image: "icon_work_fork", instant: true,
        show: (p) => CareerPath.hasFork(Work.job(p)) && !CareerPath.needsBranch(p) && CareerPath.activeBranch(p) == null,
        lock: () => "Reach the middle of this career first",
        note: () => `${CareerPath.branches(Work.job()).map((b) => b.title).join(", ")}.\n`,
        run: () => {} },
    { id: "course", title: () => `Take a ${CareerPath.skillTitle(Work.group(Work.job()))} Course`, image: "icon_work_course",
        cost: () => CareerPath.courseCost(), lock: (p) => CareerPath.courseLock(p), mods: [0, -1, -1],
        note: () => `A week of evening classes: about +${Math.round(6 * (1 - CareerPath.skill(Work.group(Work.job())) / 150))} ${CareerPath.skillTitle(Work.group(Work.job()))}.\n`,
        run: (p) => Work.say("Course Finished", CareerPath.takeCourse(p), "icon_work_course") },
    { id: "certs", title: "Certifications", image: "icon_work_cert", instant: true, actionTitle: () => "Open",
        note: () => { const s = CareerPath.state(); return `${s.certs.length ? `You have ${s.certs.length}. ` : ""}${s.course ? `Studying ${CareerPath.cert(s.course.id)?.title} (${s.course.until - Work.now()} weeks left).` : "Short courses that help you get hired."}\n`; },
        run: () => navigate("work-certs") },
];

function openEffortMenu(p: any) {
    const cur = Work.state(p).effort;
    const opts: [string, () => string][] = EFFORTS.filter((e) => e.id !== cur).map((e) => [e.title, () => { Work.setEffort(e.id, p); refresh(); return ""; }]);
    opts.push(["Never mind", () => ""]);
    const lines = EFFORTS.map((e) => `${e.title}${e.id === cur ? " (now)" : ""}: ${e.blurb}`).join("\n\n");
    Work.menu("How Hard Do You Work?", `${lines}\n\nIt sticks until you change it.`, "icon_work_effort", opts);
}

/** The rows under your current job's card on the Work tab. */
export function jobCells(p: any = player()): any[] {
    if (!Work.enabled || Work.job(p) == null) return [];
    const out: any[] = [];
    const e = Work.employer(p)!;
    const perks = e.perks.map((k) => PERKS[k].title);
    out.push(note("WorkEmployer", `At ${e.name} · ${VIBES[e.vibe].title} workplace (${VIBES[e.vibe].blurb.toLowerCase().replace(/\.$/, "")})${perks.length ? `\nPerks: ${perks.join(", ")}` : ""}${Work.state(p).raise > 1.001 ? `\nRaises so far: +${Math.round((Work.state(p).raise - 1) * 100)}%` : ""}`));
    const perf = Work.perf(p), r = ratingOf(perf);
    const block = Work.promotionBlock(p);
    out.push(new MeterViewModel("Performance", Math.round(perf), 100, r.tone, `${r.title}${block && promotionReady(p) ? `. Your promotion is waiting: performance must reach ${PROMOTION_PERF}.` : ""}`));
    const b = Work.burnout(p);
    if (b > 0) out.push(new MeterViewModel("Burnout", b, 100, b >= 75 ? "red" : b >= 40 ? "purple" : "blue", b >= 75 ? "Close to burning out. Ease off or take care of yourself." : "Builds with Hard Worker and Grinding; eases when you take it slower."));
    const t = Workplace.state(p), boss = Workplace.boss(p);
    const next = t.reviewAt - Work.now(p);
    if (boss) out.push(note("WorkBoss", `Boss: ${boss.getFullName()} (${BOSS_TYPES[t.bossType]?.title ?? "Fair"}). ${Workplace.opinionText(t.opinion)}.${next > 0 ? ` Next review in ${next} week${next === 1 ? "" : "s"}.` : ""}${t.plan != null ? `\nOn a performance plan: reach 50 within ${Math.max(0, t.plan - Work.now(p))} weeks.` : ""}`));
    for (const c of LifeActions.cells(JOB_ACTIONS, p)) out.push(c);
    // career path
    const g = Work.group(Work.job(p));
    out.push(new HeaderTitleViewModel("Career Path"));
    const sk = CareerPath.skill(g, p);
    out.push(new MeterViewModel(`${CareerPath.skillTitle(g)} Skill`, Math.floor(sk), 100, sk >= 75 ? "gold" : sk >= 40 ? "green" : "blue", "Grows every week you work (faster when you work harder). Raises your performance and your Hire Score in this field."));
    for (const c of LifeActions.cells(PATH_ACTIONS, p)) out.push(c);
    return out;
}
function certsScreen(p: any): any[] {
    const out: any[] = [];
    const s = CareerPath.state(p);
    if (s.course) out.push(note("WorkCourse", `Studying ${CareerPath.cert(s.course.id)?.title}: ${s.course.until - Work.now(p)} week${s.course.until - Work.now(p) === 1 ? "" : "s"} to go. One course at a time.`));
    for (const c of CERTS) {
        const block = CareerPath.certBlock(c, p);
        const done = s.certs.includes(c.id);
        const fields = c.groups.map((x) => SKILLS[x]?.title).filter(Boolean).join(", ");
        out.push(btn("icon_work_cert", c.title, `${c.blurb}\n${money(c.cost)} · ${c.weeks} week${c.weeks === 1 ? "" : "s"} · helps in: ${fields}\n`,
            done ? "Done" : block && s.course?.id === c.id ? "Studying" : "Enrol", () => Work.say("Enrolled", CareerPath.enroll(c.id, p), "icon_work_cert"), block == null));
    }
    return out;
}
/** Work tab, no job: unemployment benefits. */
export function unemployedCells(p: any = player()): any[] {
    if (!Work.enabled || Work.job(p) != null) return [];
    const u = Workplace.state(p).unemployed;
    if (!u) return [];
    const left = u.until - Work.now(p);
    return [info("tab_bank", "Unemployment Benefits", `${money(u.weekly)} a week for ${left} more week${left === 1 ? "" : "s"}, until you find work.\n`)];
}
function promotionReady(p: any): boolean {
    try { const st = Work.jobState(p); return !st.isMaxLevel() && st.getProgress() >= st.getType().weeksForPromotion(st.getLevel()) - 1; } catch { return false; }
}

/** v0.33.0: one "Go to Work" button replaces Work / Overtime / All-nighter (side hustles keep theirs for now). */
export function goToWorkButtons(p: any = player()): WorkButtonsViewModel | null {
    if (!Work.enabled) return null;
    const job = Work.job(p);
    const hidden = ButtonViewModel.INSTANCE.getHidden();
    const e = Work.effort(p);
    const sb = new SpannableStringBuilder("");
    ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(sb, "Go to Work", R.color.flatWhite, 18, null, 8, null));
    if (job != null) ExtensionsKt.appendNormal$default(sb, `${e.title} · ${pct(Work.payModifier(p))} pay`, R.color.flatGreen, 13, null, 8, null);
    else ExtensionsKt.appendNormal$default(sb, "No job right now", null, 13, null, 8, null);
    const go = new ButtonViewModel("", sb, job != null, false, false, false, false, {
        invoke: () => { const j = Work.job(p); if (j != null) p.getJobState().work(j, WorkAction.normal); return null; },
    }, 120, null);
    return new WorkButtonsViewModel(go, hidden, hidden);
}

// ================================================================== hiring screens
export const navigate = (key: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null);
const btn = (image: any, title: string, body: string, label: string, go: () => void, enabled = true) =>
    new ActionCellSingleViewModel(image, title, text(body), new ButtonViewModel(label, null, enabled, false, !enabled, false, false, { invoke: () => { go(); refresh(); return null; } }), null, null);
const jobImage = (job: any) => { try { return job.getImageId(); } catch { return "tab_briefcase"; } };
const perkLine = (e: any) => (e.perks.length ? `Perks: ${e.perks.map((k: string) => (PERKS as any)[k].title).join(", ")}.` : "No special perks.");

/** Work tab: a row for applications and offers waiting. */
export function appsRow(p: any = player()): any[] {
    if (!Work.enabled) return [];
    const apps = Hiring.activeApps(p);
    if (!apps.length) return [];
    const offers = apps.filter((a) => a.stage === "offer").length;
    return [btn("tab_briefcase", offers ? `Job Offers (${offers})` : "Job Applications", `${apps.length} waiting${offers ? `, ${offers} offer${offers === 1 ? "" : "s"} to answer` : ""}.\n`, "Open", () => navigate("work-apps"))];
}

function openingsScreen(jobName: string, p: any): any[] {
    const job = Hiring.jobOf(jobName);
    if (job == null) return [];
    const out: any[] = [];
    const score = Hiring.score(job, p);
    const parts = Hiring.scoreParts(job, p).map(([l, n]) => `${l} ${n > 0 ? "+" : ""}${n}`).join(" · ");
    out.push(new MeterViewModel("Your Hire Score", score, 100, score >= SKIP_INTERVIEW ? "gold" : score >= 60 ? "green" : score >= 40 ? "blue" : "red",
        `Base 40${parts ? ` · ${parts}` : ""}. ${score >= SKIP_INTERVIEW ? "Strong enough to skip interviews." : "Higher scores mean more interviews and more offers."}`));
    const block = Hiring.applyBlock(job, p);
    if (block) out.push(note("WorkOpeningsBlock", `You can't apply yet: ${block}.`));
    out.push(new HeaderTitleViewModel(`${Hiring.careerName(job)} Openings`));
    for (const o of Hiring.openings(job, p)) {
        const done = Hiring.applied(o.job, o.employer.name, p);
        const senior = o.level > Math.max(1, p.getJobState().getState(job).getLevel());
        out.push(btn(jobImage(job), `${o.employer.name}`,
            `${Hiring.titleAt(job, o.level)}${senior ? " (senior opening)" : ""} · ${VIBES[o.employer.vibe].title} workplace\nAbout ${Math.round(o.employer.pay * 100)}% of the usual pay. ${perkLine(o.employer)}\n`,
            done ? "Applied" : "Apply", () => Work.say("Applied", Hiring.apply(o, p)), !done && block == null));
    }
    out.push(note("WorkOpeningsNote", `New openings every ${Hiring.refreshWeeks(p)} weeks. Applying takes no time; you hear back next week.`));
    return out;
}

function appsScreen(p: any): any[] {
    const out: any[] = [];
    const apps = Hiring.activeApps(p);
    if (!apps.length) out.push(note("WorkAppsNone", "No applications out. Find openings in the Career Center on the Work tab."));
    for (const a of apps) {
        const job = Hiring.jobOf(a.job);
        const title = `${Hiring.titleAt(job, a.level)} at ${a.employer.name}`;
        if (a.stage === "offer") {
            const left = a.expires - Work.now(p);
            out.push(btn(jobImage(job), title, `${a.via === "headhunter" ? "A headhunter's offer. " : "Offer: "}${Math.round(a.pay * 100)}% of the usual pay. ${VIBES[a.employer.vibe].title} workplace. ${perkLine(a.employer)}\nAnswer within ${left} week${left === 1 ? "" : "s"}.\n`,
                "Answer", () => Work.milestone("Job Offer", `${a.employer.name} offers you ${Hiring.offerText(a)}`, "tab_briefcase", Hiring.offerOptions(a, p))));
        } else {
            out.push(btn(jobImage(job), title, a.stage === "interview" ? "Interview under way.\n" : "Applied. You'll hear back next week.\n", "Withdraw", () => Hiring.withdraw(a.id, p)));
        }
    }
    return out;
}

function resumeScreen(p: any): any[] {
    const out: any[] = [];
    const w = Work.state(p), job = Work.job(p);
    const field = job ?? (w.history[0] ? Hiring.jobOf(w.history[0].job) : null);
    if (field) {
        const sc = Hiring.score(field, p);
        out.push(new MeterViewModel(`Hire Score (${Hiring.careerName(field)})`, sc, 100, sc >= 60 ? "green" : sc >= 40 ? "blue" : "red",
            Hiring.scoreParts(field, p).map(([l, n]) => `${l} ${n > 0 ? "+" : ""}${n}`).join(" · ") || "Base 40"));
    } else out.push(note("WorkResumeEmpty", "No work history yet. Your Hire Score for each career shows on its openings."));
    out.push(new HeaderTitleViewModel("Job History"));
    if (job) out.push(info(jobImage(job), `${Work.title(p)} (now)`, `${Work.employer(p)!.name}, since age ${ageAt(p, Work.employer(p)!.since)}.\n`));
    for (const h of w.history.slice(0, 15)) {
        const j = Hiring.jobOf(h.job);
        const ref = Hiring.referenceOf(h.why);
        out.push(info(jobImage(j), h.title, `${h.employer}, age ${ageAt(p, h.from)} to ${ageAt(p, h.to)}. Left: ${h.why}. Reference: ${ref > 0 ? "good" : ref < 0 ? "bad" : "neutral"}.\n`));
    }
    // skills and certificates
    const sk = Object.entries(CareerPath.state(p).skills).filter(([, n]) => n >= 1).sort((a, b) => b[1] - a[1]);
    if (sk.length) { out.push(new HeaderTitleViewModel("Skills")); for (const [g, n] of sk) out.push(new MeterViewModel(CareerPath.skillTitle(g), Math.floor(n), 100, n >= 75 ? "gold" : n >= 40 ? "green" : "blue")); }
    const certs = CareerPath.state(p).certs.map((id) => CareerPath.cert(id)?.title).filter(Boolean);
    if (certs.length) { out.push(new HeaderTitleViewModel("Certifications")); out.push(note("WorkResumeCerts", certs.join("\n"))); }
    for (const c of Work.resumeHooks) for (const x of c(p)) out.push(x);
    return out;
}
const ageAt = (p: any, week: number) => { try { return Math.floor((p.getAgeInWeeks() - (Work.now(p) - week)) / 52); } catch { return "?"; } };

// ================================================================== side hustles
const levelLine = (xp: number) => { const l = Hustles.level(xp); const next = HUSTLE_LEVELS[l + 1]; return `${HUSTLE_LEVELS[l].name}${next ? ` (${Math.floor(xp)}/${next.min} to ${next.name})` : ""}`; };
function shiftCell(d: any, p: any) {
    const s = Hustles.st(d.id, p), lock = Hustles.shiftLock(d, p);
    return new ActionCellSingleViewModel(d.image, `${d.title}: ${d.action}`, text(`${levelLine(s.xp)}. Earned ${money(s.earned)} so far.${s.catalogue >= 1 ? ` Back catalogue: ${money(s.catalogue)} a week.` : ""}\n`),
        new ButtonViewModel(lock ?? "Go", null, lock == null, false, lock != null, false, false, { invoke: () => { Work.say(d.title, Hustles.shift(d.id, p), d.image); refresh(); return null; } }), null, null);
}
export function hustleCells(p: any = player()): any[] {
    if (!Work.enabled || p.getAgeInYears() < 12) return [];
    const out: any[] = [new HeaderTitleViewModel("Side Hustles")];
    for (const d of Hustles.active(p)) out.push(shiftCell(d, p));
    const cat = Hustles.catalogueTotal(p);
    out.push(btn("sidehustle_youtube", Hustles.active(p).length ? "All Side Hustles" : "Start a Side Hustle", `${Hustles.active(p).length}/${Hustles.limit(p)} running. Once a week each, no week used.${cat >= 1 ? ` Back catalogue: ${money(cat)} a week.` : ""}\n`, "Open", () => navigate("work-hustles")));
    return out;
}
function hustlesScreen(p: any): any[] {
    const out: any[] = [note("WorkHustlesNote", `Run up to ${Hustles.limit(p)} at once${Hustles.limit(p) === 1 ? " (1 while you're Grinding at work)" : ""}. Each has one action a week that pays now and levels you up, Newbie to Pro.`)];
    for (const d of HUSTLES) {
        const s = Hustles.st(d.id, p);
        if (s.active) {
            out.push(shiftCell(d, p));
            out.push(btn(d.image, `Stop ${d.title}`, "You keep your level and back catalogue.\n", "Stop", () => Hustles.stop(d.id, p)));
            continue;
        }
        const block = Hustles.startBlock(d, p);
        out.push(btn(d.image, d.title, `${d.blurb}\n${s.xp > 0 ? `${levelLine(s.xp)}. ` : ""}${d.startCost && !s.started ? `Costs ${money(d.startCost)} to start.` : ""}\n`, block ?? "Start", () => Work.say(d.title, Hustles.start(d.id, p), d.image), block == null));
    }
    return out;
}

// ================================================================== companies
export function companyCells(p: any = player()): any[] {
    if (!Work.enabled || p.getAgeInYears() < 16) return [];
    const out: any[] = [new HeaderTitleViewModel("Your Business")];
    for (const c of Companies.all(p)) {
        const t = Companies.type(c.type);
        out.push(btn(t.image, c.name, `${t.title}${c.locations > 1 ? `, ${c.locations} locations` : ""}${c.public ? " (public)" : ""} · ${c.stars.toFixed(1)} stars\nLast week: ${c.lastProfit >= 0 ? "" : "-"}${money(Math.abs(c.lastProfit))} ${c.lastProfit >= 0 ? "profit" : "loss"}.\n`, "Manage", () => navigate(`work-company:${c.id}`)));
    }
    out.push(btn("business_sell", "Start a Company", "Café, restaurant, gym, tech startup and more. You run it; it can make you rich.\n", "Open", () => navigate("work-start-company"), p.getAgeInYears() >= 18));
    return out;
}
function startScreen(p: any): any[] {
    const out: any[] = [note("WorkStartNote", `Pay from savings, take a business loan (20% down), or bring in investors (they pay half for a quarter of the profits).${Companies.discount(p) > 0 ? ` Your Founder path takes ${Math.round(Companies.discount(p) * 100)}% off.` : ""}`)];
    for (const t of COMPANY_TYPES) {
        const cost = Companies.costOf(t, p);
        const block = Companies.startBlock(t, p, "loan");
        out.push(btn(t.image, t.title, `${t.blurb}\nCosts ${money(cost)} · ${t.staff} staff to start\n`, block ?? "Start", () => startFlow(t.id, p), block == null));
    }
    return out;
}
function startFlow(typeId: string, p: any) {
    const t = Companies.type(typeId), cost = Companies.costOf(t, p);
    const pickName = (q: number, f: "cash" | "loan" | "investors") => {
        Work.menu("Name It", "What's it called?", t.image, Companies.nameOptions(typeId, p).map((n) => [n, () => {
            const c = Companies.found(typeId, n, q, f, p);
            if (!c) return "You can't afford that way of paying right now.";
            refresh(); navigate(`work-company:${c.id}`);
            return `${n} is open for business! Set your prices, staff and marketing on its screen.`;
        }] as [string, () => string]));
    };
    const pickQuality = (f: "cash" | "loan" | "investors") => Work.menu("How Fancy?", QUALITY.map((q) => `${q.title}: ${q.id === 0 ? "cheaper to run, fewer stars" : q.id === 1 ? "the middle road" : "costs more per customer, wins stars and customers"}`).join("\n"), t.image,
        [...QUALITY.map((q) => [q.title, () => { pickName(q.id, f); return ""; }] as [string, () => string])]);
    const opt = (f: "cash" | "loan" | "investors", label: string): [string, () => string] => [label, () => { const b = Companies.startBlock(t, p, f); if (b) return b; pickQuality(f); return ""; }];
    Work.menu(`Start a ${t.title}`, `It costs ${money(cost)} to open. How do you pay?\n\nSavings: all ${money(cost)} now, all the profit is yours.\nBusiness loan: ${money(cost * 0.2)} down, the rest repaid weekly over 2 years (12% interest).\nInvestors: ${money(cost * 0.5)} from you, they take a quarter of the profits.`, t.image,
        [opt("cash", "Savings"), opt("loan", "Business loan"), opt("investors", "Investors"), ["Never mind", () => ""]]);
}
function companyScreen(id: string, p: any): any[] {
    const c = Companies.get(id, p);
    if (!c) return [note("WorkCompanyGone", "This company isn't yours any more.")];
    const t = Companies.type(c.type), out: any[] = [];
    out.push(new MeterViewModel("Reviews", Math.round(c.stars * 20), 100, c.stars >= 4 ? "gold" : c.stars >= 3 ? "green" : c.stars >= 2 ? "blue" : "red", `${c.stars.toFixed(1)} out of 5 stars`));
    const need = Companies.staffNeed(c);
    out.push(info(t.image, c.name, `${t.title} · ${c.locations} location${c.locations === 1 ? "" : "s"} · open ${Math.max(0, Work.now(p) - c.since)} weeks\nLast week: ${c.lastCustomers.toLocaleString()} ${["tech", "construction", "farm", "realEstate"].includes(c.type) ? "clients" : "customers"}, ${c.lastProfit >= 0 ? "profit" : "loss"} ${money(Math.abs(c.lastProfit))}${c.public ? " (you get 30%)" : c.share > 0 ? " (investors take 25%)" : ""}.\nWorth about ${money(Companies.value(c))} to you.${c.loan > 0 ? ` Loan left: ${money(c.loan)}.` : ""}\n`));
    if (c.rival) out.push(note("WorkRival", `${c.rival.name} is competing with you nearby.`));
    const offer = (c as any).offer;
    if (offer && offer.until > Work.now(p)) out.push(btn("business_sell", "A Buyer's Offer", `${money(offer.amount)} for your share. Expires in ${offer.until - Work.now(p)} weeks.\n`, "Accept", () => Work.say("Sold", Companies.sell(c.id, p, offer.amount), t.image)));
    if (c.public) {
        out.push(note("WorkPublic", "It's a public company now: the board runs it and you collect dividends."));
        out.push(btn("business_sell", "Sell Your Shares", `About ${money(Companies.value(c) * 0.85)}.\n`, "Sell", () => Work.menu("Sell Your Shares?", `${money(Companies.value(c) * 0.85)} now, and no more dividends.`, t.image, [["Sell", () => Companies.sell(c.id, p)], ["Keep them", () => ""]])));
        return out;
    }
    out.push(new HeaderTitleViewModel("Running It"));
    out.push(btn("bank_deposit", `Prices: ${PRICES[c.price].title}`, "Cheaper wins customers and stars; pricier earns more per customer.\n", "Change", () => Work.menu("Prices", "Set your prices.", t.image, PRICES.map((x) => [x.title, () => { Companies.setPrice(c, x.id); refresh(); return ""; }] as [string, () => string]))));
    out.push(btn(t.image, `Quality: ${QUALITY[c.quality].title}`, "Better goods cost more, but bring stars and customers.\n", "Change", () => Work.menu("Quality", "What are you selling?", t.image, QUALITY.map((x) => [x.title, () => { Companies.setQuality(c, x.id); refresh(); return ""; }] as [string, () => string]))));
    out.push(btn("work_retail", `Staff: ${c.staff} (needs about ${need})`, `${money(t.wage)} a week each. Too few and reviews drop.\n`, "Change", () => Work.menu("Staff", `You have ${c.staff}; about ${need} keeps things running smoothly.`, t.image, [
        ["Hire to match", () => { Companies.hire(c, need - c.staff); refresh(); return ""; }], ["Hire 1 more", () => { Companies.hire(c, 1); refresh(); return ""; }],
        ["Hire 5 more", () => { Companies.hire(c, 5); refresh(); return ""; }], ["Let 1 go", () => { Companies.hire(c, -1); refresh(); return ""; }], ["Never mind", () => ""]])));
    out.push(btn("sidehustle_youtube", `Marketing: ${c.marketing ? `${money(c.marketing)} a week` : "None"}`, "Ads bring customers.\n", "Change", () => Work.menu("Marketing", "How much a week?", t.image, MARKETING.map((m) => [m ? money(m) : "None", () => { Companies.setMarketing(c, m); refresh(); return ""; }] as [string, () => string]))));
    out.push(btn("tab_briefcase", c.handsOn ? "You Run It Yourself" : "A Manager Runs It", c.handsOn ? "Customers like seeing the owner. If you have a job too, it's tiring (−1 sanity a week).\n" : `${money(Companies.managerWage)} a week per 3 locations.\n`, c.handsOn ? "Hire a Manager" : "Run It Yourself", () => Companies.setHandsOn(c, !c.handsOn)));
    out.push(new HeaderTitleViewModel("Growing"));
    const eb = Companies.expandBlock(c, p);
    out.push(btn("business_realestate1", "Open Another Location", `${money(Companies.expandCost(c, p))}.\n`, eb ?? "Open", () => Work.say("New Location", Companies.expand(c, p), t.image), eb == null));
    const ib = Companies.ipoBlock(c);
    out.push(btn("skill_investment", "Go Public", "Sell most of your shares on the stock market and keep 30% of the profits.\n", ib ?? "Ring the Bell", () => Work.say("Going Public", Companies.ipo(c.id, p), t.image), ib == null));
    out.push(btn("business_sell", "Sell the Company", `About ${money(Companies.value(c) * 0.85)} now (buyers sometimes offer more).\n`, "Sell", () => Work.menu("Sell It?", `${money(Companies.value(c) * 0.85)} for ${c.name}.`, t.image, [["Sell", () => { const r = Companies.sell(c.id, p); refresh(); return r; }], ["Keep it", () => ""]])));
    out.push(btn("health_low", "Close It Down", "Sell the equipment and lock the doors.\n", "Close", () => Work.menu("Close It?", `${c.name} closes for good.`, t.image, [["Close it", () => { const r = Companies.close(c.id, p); refresh(); return r; }], ["Keep going", () => ""]])));
    return out;
}

// ================================================================== retirement & benefits
export function retirementRow(p: any = player()): any[] {
    if (!Work.enabled || p.getAgeInYears() < 18) return [];
    const b = Benefits.state(p);
    if (Work.job(p) == null && b.balance < 1 && !Retirement.isRetired(p)) return [];
    return [btn("achievement_old", "Benefits & 401(k)", `${Work.job(p) ? `Paid leave left: ${Math.floor(Benefits.leaveLeft(p))} of ${Benefits.leaveWeeks(p)} weeks. ` : ""}401(k): ${money(b.balance)}${b.pct ? ` (${b.pct}% of pay)` : ""}.\n`, "Open", () => navigate("work-retirement"))];
}
function retirementScreen(p: any): any[] {
    const out: any[] = [];
    const b = Benefits.state(p);
    if (Retirement.isRetired(p)) {
        out.push(info("achievement_old", "Retired", `Pension: ${money(Retirement.pension(p))} a week, for life.\n`));
        out.push(new HeaderTitleViewModel("Retired Life"));
        const vl = Benefits.volunteerLock(p), cl = Benefits.consultLock(p);
        out.push(btn("family", "Volunteer", "+3 happiness, +2 sanity. Once a week.\n", vl ?? "Go", () => Work.say("Volunteering", Benefits.volunteer(p), "family"), vl == null));
        out.push(btn("tab_briefcase", "Consult in Your Old Field", "A few days' work for a good fee. Every 4 weeks.\n", cl ?? "Go", () => Work.say("Consulting", Benefits.consult(p), "tab_briefcase"), cl == null));
        out.push(note("WorkRetiredHustles", "Want more? Side hustles work in retirement too, and taking a job brings you out of it."));
        return out;
    }
    const job = Work.job(p);
    if (job) {
        out.push(new HeaderTitleViewModel("Your Benefits"));
        const e = Work.employer(p)!;
        out.push(info("tab_briefcase", e.name, `Paid leave: ${Math.floor(Benefits.leaveLeft(p))} of ${Benefits.leaveWeeks(p)} weeks left this year (a week you don't go to work uses it and still pays).${b.parental ? `\nParental leave: ${b.parental} paid weeks off left.` : ""}\n${e.perks.length ? `Perks: ${e.perks.map((k) => (PERKS as any)[k].title).join(", ")}.` : "No other perks."}\n`));
    }
    out.push(new HeaderTitleViewModel("401(k)"));
    const match = Benefits.matchPct(p);
    out.push(btn("skill_investment", `401(k): ${money(b.balance)}`, `You put in ${b.pct}% of every paycheck${match ? `, and your employer adds ${match}%` : Work.hasPerk("match", p) ? " (your employer matches half, up to 6%)" : ""}. This year's return: ${Math.round(b.ret * 100)}%.\nLocked until ${Retirement.minAge} (taking it out early costs 10%).\n`, "Change %", () =>
        Work.menu("401(k) Contributions", "How much of every paycheck goes into your 401(k)?", "skill_investment", K401_OPTIONS.map((n) => [`${n}%${n === b.pct ? " (now)" : ""}`, () => { Benefits.setPct(n, p); refresh(); return ""; }] as [string, () => string]))));
    if (b.balance >= 1) out.push(btn("bank_withdrawal", "Cash Out Your 401(k)", `${Benefits.locked(p) ? `Before ${Retirement.minAge}: a 10% penalty. ` : ""}You'd get ${money(b.balance * (Benefits.locked(p) ? 0.9 : 1))}.\n`, "Cash Out", () =>
        Work.menu("Cash Out?", "All of it, now.", "bank_withdrawal", [["Cash out", () => { const r = Benefits.withdraw(p); refresh(); return r; }], ["Keep it growing", () => ""]])));
    out.push(new HeaderTitleViewModel("When You Retire"));
    const now = Retirement.pensionIfRetiredNow(p);
    const later = Math.round(now + Benefits.payout(p, Benefits.projected(p, 5)) - Benefits.payout(p) + (job ? Workplace.weeklyPay(p) * 0.02 * 5 : 0));
    out.push(info("achievement_old", "Retirement Income", `If you retired now: about ${money(now)} a week.\nIn 5 years: about ${money(later)} a week.\nThat's your pension (2% of pay per year in your career, up to 70%; at least ${money(Retirement.basicPension)}) plus 6% a year of your 401(k)${Work.hasPerk("pension", p) ? ", plus your employer's pension" : ""}.\n${p.getAgeInYears() >= Retirement.minAge ? "You can retire from the Work tab." : `You can retire from ${Retirement.minAge}.`}\n`));
    return out;
}

// ================================================================== self-care (Health tab)
export function selfCareCells(p: any = player()): any[] {
    if (!Work.enabled || p.getAgeInYears() < 3) return [];
    const out: any[] = [new HeaderTitleViewModel("Self-Care")];
    if (!Vampire.isVampire(p) && p.getAgeInYears() >= 10) {
        const d = SelfCare.sleepDef(p);
        out.push(btn("health_meditation", `Sleep: ${d.title}`, `${d.blurb}${SelfCare.sleep(p) !== SelfCare.state(p).sleep ? " (Insomnia keeps you up until it's treated.)" : ""}\n`, "Change", () =>
            Work.menu("How Much Do You Sleep?", SLEEP.map((x) => `${x.title}: ${x.blurb}`).join("\n\n"), "health_meditation", SLEEP.map((x) => [x.title.replace(/ \(.*\)/, ""), () => { SelfCare.setSleep(x.id, p); refresh(); return ""; }] as [string, () => string]))));
    }
    for (const c of LifeActions.cells(QUICK_CARE, p)) out.push(c);
    const care = LifeActions.cells(CARE, p);
    if (care.length) { out.push(new HeaderTitleViewModel("Care")); for (const c of care) out.push(c); }
    if (p.getAgeInYears() >= 10) {
        out.push(new HeaderTitleViewModel("Self-Care Goals"));
        const s = SelfCare.state(p);
        for (const g of GOALS) {
            const on = s.goals.includes(g.id), done = s.done.includes(g.id);
            const need = SelfCare.goalNeed(g, p);
            out.push(btn("skill_selfimprovement", g.title, done ? `Done: the ${g.badge} badge.\n` : on ? `${SelfCare.goalProgress(g, p)} of ${need}. Missing a week just pauses it.\n` : `Reward: a small boost and the ${g.badge} badge.\n`,
                done ? "Done" : on ? "Drop" : "Start", () => (on ? SelfCare.dropGoal(g.id, p) : SelfCare.startGoal(g.id, p)), !done));
        }
    }
    return out;
}

export function screenTitle(key: string): string {
    if (key.startsWith("work-company:")) { const c = Companies.get(key.slice(13)); return c ? c.name : "Company"; }
    if (key.startsWith("work-openings:")) { const j = Hiring.jobOf(key.slice(14)); return j ? `${Hiring.careerName(j)} Openings` : "Openings"; }
    return ({ "work-apps": "Job Applications", "work-resume": "Résumé", "work-certs": "Certifications", "work-hustles": "Side Hustles", "work-start-company": "Start a Company", "work-retirement": "Benefits & Retirement" } as any)[key] ?? "Work";
}
export function screen(key: string, p: any = player()): any[] {
    if (key.startsWith("work-openings:")) return openingsScreen(key.slice(14), p);
    if (key === "work-apps") return appsScreen(p);
    if (key === "work-resume") return resumeScreen(p);
    if (key === "work-certs") return certsScreen(p);
    if (key === "work-hustles") return hustlesScreen(p);
    if (key === "work-retirement") return retirementScreen(p);
    if (key === "work-start-company") return startScreen(p);
    if (key.startsWith("work-company:")) return companyScreen(key.slice(13), p);
    for (const h of Work.screenHooks) { const r = h(key, p); if (r) return r; }
    return [];
}
/** Profile tab: the résumé row. */
export function profileCells(p: any = player()): any[] {
    if (!Work.enabled || p.getAgeInYears() < 14) return [];
    return [btn("tab_briefcase", "Résumé", "Your Hire Score, job history and references.\n", "Open", () => navigate("work-resume"))];
}

export const WorkScreens = { retirementRow, selfCareCells, hustleCells, companyCells, PATH_ACTIONS, unemployedCells, jobCells, goToWorkButtons, JOB_ACTIONS, appsRow, screen, screenTitle, profileCells, navigate };
