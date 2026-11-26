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
import { LifeActionDef, LifeActions } from "../Lifepaths/Vampire";
import { Work } from "./Work";
import { EFFORTS, VIBES, PERKS, PROMOTION_PERF, ratingOf, SKIP_INTERVIEW } from "./WorkData";
import { Hiring, Application } from "./Hiring";
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
    for (const c of LifeActions.cells(JOB_ACTIONS, p)) out.push(c);
    return out;
}
function promotionReady(p: any): boolean {
    try { const st = Work.jobState(p); return !st.isMaxLevel() && st.getProgress() >= st.getType().weeksForPromotion(st.getLevel()) - 1; } catch { return false; }
}

/** v0.33.0: one "Go to Work" button replaces Work / Overtime / All-nighter (side hustles keep theirs for now). */
export function goToWorkButtons(p: any = player()): WorkButtonsViewModel | null {
    if (!Work.enabled) return null;
    const job = Work.job(p);
    const hidden = ButtonViewModel.INSTANCE.getHidden();
    if (job == null && p.getWorkButtonType().name() === "sideHustle") return null;
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
    for (const c of Work.resumeHooks) for (const x of c(p)) out.push(x);
    return out;
}
const ageAt = (p: any, week: number) => { try { return Math.floor((p.getAgeInWeeks() - (Work.now(p) - week)) / 52); } catch { return "?"; } };

export function screenTitle(key: string): string {
    if (key.startsWith("work-openings:")) { const j = Hiring.jobOf(key.slice(14)); return j ? `${Hiring.careerName(j)} Openings` : "Openings"; }
    return ({ "work-apps": "Job Applications", "work-resume": "Résumé" } as any)[key] ?? "Work";
}
export function screen(key: string, p: any = player()): any[] {
    if (key.startsWith("work-openings:")) return openingsScreen(key.slice(14), p);
    if (key === "work-apps") return appsScreen(p);
    if (key === "work-resume") return resumeScreen(p);
    for (const h of Work.screenHooks) { const r = h(key, p); if (r) return r; }
    return [];
}
/** Profile tab: the résumé row. */
export function profileCells(p: any = player()): any[] {
    if (!Work.enabled || p.getAgeInYears() < 14) return [];
    return [btn("tab_briefcase", "Résumé", "Your Hire Score, job history and references.\n", "Open", () => navigate("work-resume"))];
}

export const WorkScreens = { jobCells, goToWorkButtons, JOB_ACTIONS, appsRow, screen, screenTitle, profileCells, navigate };
