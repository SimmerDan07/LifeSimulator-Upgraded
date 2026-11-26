// v0.33.0 "The Career Overhaul", stage 3: the people at work and what they think of you.
//
// Every job comes with a boss and 3 coworkers: real people in a Work section of the Love tab (kind "coworker").
// The boss has a style (Fair, Strict, Lazy, Micromanager, Mentor) and an opinion of you (0–100) that follows your
// performance. Coworkers have roles (Rival, Work Friend, Gossip, Slacker, Star). Nobody at work drifts away while
// you work together; when you leave, good work friends stay on as friends.
// Once a year: a performance review (no choice in it, so it follows the pop-up switch). Exceeds or better = a raise and a jump in progress. Needs Work
// twice in a row = a 12-week performance plan; miss it and you're fired. Quit with two weeks' notice (good
// reference; the boss may counter-offer), or on the spot. Layoffs happen (severance, then unemployment benefits).
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { News } from "../Managers/News";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Sex } from "../Enums/Sex";
import { Sexuality } from "../Enums/Sexuality";
import { Relationship } from "../Enums/Relationship";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { Person } from "../Managers/Person";
import { TrueAge } from "../Managers/TrueAge";
import { Relationships } from "../Social/Relationships";
import { SocialPerson } from "../Social/SocialPerson";
import { Work, WorkDice, money } from "./Work";
import { ratingOf } from "./WorkData";

export type WorkRole = "boss" | "rival" | "friend" | "gossip" | "slacker" | "star";
export type BossType = "fair" | "strict" | "lazy" | "micro" | "mentor";
export const ROLE_TITLES: Record<WorkRole, string> = { boss: "Boss", rival: "Rival", friend: "Work Friend", gossip: "Office Gossip", slacker: "Slacker", star: "Rising Star" };
export const BOSS_TYPES: Record<BossType, { title: string; blurb: string }> = {
    fair: { title: "Fair", blurb: "Judges you on your work." },
    strict: { title: "Strict", blurb: "Hard to impress, quick to criticise." },
    lazy: { title: "Laid-back", blurb: "Barely notices what anyone does." },
    micro: { title: "Micromanager", blurb: "Wants to see you working. Hates remote days." },
    mentor: { title: "Mentor", blurb: "Wants you to grow: your performance climbs faster." },
};
export interface TeamState {
    ids: string[]; boss: string | null; bossType: BossType; opinion: number;
    reviewAt: number; needsWork: number; plan: number | null; reviews: number;
    raiseAsk: number; promoAsk: number; feedback: number; chat: number; help: number;
    notice: number | null; counterOffered: boolean;
    unemployed: { until: number; weekly: number } | null;
    lastMoment: number;
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { roll, rnd, pick, clamp } = WorkDice;
const WPY = 52;
const refresh = () => { try { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); } catch { /* no UI */ } };
const earn = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null); };

export const Workplace = {
    reviewEvery: WPY,
    planWeeks: 12,
    noticeWeeks: 2,
    layoffChance: 0.0012,

    state(p: any = player()): TeamState {
        const w: any = Work.state(p);
        if (w.team == null) w.team = { ids: [], boss: null, bossType: "fair", opinion: 55, reviewAt: 0, needsWork: 0, plan: null, reviews: 0, raiseAsk: -999, promoAsk: -999, feedback: -999, chat: -999, help: -999, notice: null, counterOffered: false, unemployed: null, lastMoment: -999 };
        return w.team as TeamState;
    },
    people(p: any = player()): SocialPerson[] {
        try { return Relationships.circle(p).list("coworker").filter((x: any) => x.getIsAlive()); } catch { return []; }
    },
    boss(p: any = player()): SocialPerson | null { return Workplace.people(p).find((x: any) => x.workRole === "boss") ?? null; },
    coworkers(p: any = player()): SocialPerson[] { return Workplace.people(p).filter((x: any) => x.workRole !== "boss"); },
    role(x: any): WorkRole { return (x?.workRole ?? "friend") as WorkRole; },
    workFriend(p: any = player()): SocialPerson | null { return Workplace.coworkers(p).find((x: any) => x.workRole === "friend" && x.getRelationshipProgress() >= 500) ?? null; },
    rival(p: any = player()): SocialPerson | null { return Workplace.coworkers(p).find((x: any) => x.workRole === "rival") ?? null; },

    // ------------------------------------------------------------------ a team for every job
    newPerson(role: WorkRole, p: any, sex?: any): SocialPerson {
        const a = p.getAgeInYears();
        const age = role === "boss" ? rnd(Math.max(28, a + 2), Math.max(36, a + 18)) : rnd(Math.max(19, a - 8), Math.max(24, a + 12));
        const x: any = SocialPerson.make("coworker" as any, sex ?? Sex.INSTANCE.getRandomSex(), null, age * WPY + rnd(0, 51));
        x.workRole = role;
        x.metAt = "work";
        x.sinceWeek = Relationships.now();
        x.setRelationshipProgress(role === "rival" ? rnd(200, 350) : role === "friend" ? rnd(450, 600) : rnd(320, 480));
        if (role === "boss") x.bossType = pick(Object.keys(BOSS_TYPES) as BossType[]);
        Relationships.circle(p).add(x);
        return x;
    },
    /** Build the team for the job you have now (a new job, or an older save's job). */
    makeTeam(p: any = player()) {
        const t = Workplace.state(p);
        Workplace.clearTeam(p, false);
        const boss: any = Workplace.newPerson("boss", p);
        const roles: WorkRole[] = ["friend", pick(["rival", "rival", "star"] as WorkRole[]), pick(["gossip", "slacker", "friend"] as WorkRole[])];
        const team = [boss, ...roles.map((r) => Workplace.newPerson(r, p))];
        t.ids = team.map((x) => x.id); t.boss = boss.id; t.bossType = boss.bossType;
        t.opinion = 55; t.needsWork = 0; t.plan = null; t.notice = null; t.counterOffered = false;
        t.reviewAt = Work.now(p) + Workplace.reviewEvery;
        t.unemployed = null;
    },
    /** Leaving: good work friends stay on as friends; everyone else goes. */
    clearTeam(p: any, keepFriends = true) {
        const c = Relationships.circle(p);
        let kept = 0;
        for (const x of Relationships.circle(p).list("coworker")) {
            const good = keepFriends && x.workRole !== "boss" && x.getIsAlive() && x.getRelationshipProgress() >= 500 && Relationships.friends(p).length < Relationships.maxFriends;
            if (good) { x.kind = "friend"; (x as any).workRole = undefined; kept++; } else c.remove(x.id);
        }
        const t = Workplace.state(p);
        t.ids = []; t.boss = null; t.plan = null; t.notice = null;
        return kept;
    },
    ensureTeam(p: any = player()) {
        if (Work.job(p) == null) return;
        if (Workplace.boss(p) == null) Workplace.makeTeam(p);
    },

    // ------------------------------------------------------------------ the boss's opinion
    opinion(p: any = player()): number { return Workplace.state(p).opinion; },
    opinionText(n: number): string { return n >= 80 ? "Thinks you're one of the best" : n >= 60 ? "Likes your work" : n >= 40 ? "Thinks you're doing fine" : n >= 20 ? "Has doubts about you" : "Wants you gone"; },
    bump(p: any, n: number) { const t = Workplace.state(p); t.opinion = clamp(t.opinion + n, 0, 100); },
    /** Extra performance target from your boss and work friends. */
    perfBonus(p: any): number {
        if (Work.job(p) == null) return 0;
        const t = Workplace.state(p);
        let b = (t.opinion - 50) / 10;
        if (t.bossType === "mentor") b += 5;
        if (Workplace.workFriend(p) && Work.state(p).effort === "coast") b += 4;   // they cover for you
        return b;
    },
    opinionWeek(p: any) {
        const t = Workplace.state(p), w = Work.state(p);
        let target = w.perf;
        if (t.bossType === "strict") target -= 10;
        if (t.bossType === "lazy") target = 50 + (w.perf - 50) / 3;
        if (t.bossType === "micro" && w.wfh) target -= 12;
        t.opinion = clamp(t.opinion + (target - t.opinion) * 0.06, 0, 100);
    },

    // ------------------------------------------------------------------ reviews
    review(p: any) {
        const t = Workplace.state(p), w = Work.state(p);
        t.reviewAt = Work.now(p) + Workplace.reviewEvery;
        t.reviews++;
        const score = w.perf * 0.7 + t.opinion * 0.3;
        const r = ratingOf(score);
        const boss = Workplace.boss(p);
        const who = boss ? boss.getFirstName() : "Your boss";
        let text = `${who} sat you down for your yearly review. Rating: ${r.title}.`;
        const st = Work.jobState(p);
        const bar = (() => { try { return st.getType().weeksForPromotion(st.getLevel()); } catch { return 0; } })();
        if (r.id === "outstanding" || r.id === "exceeds") {
            const pct = r.id === "outstanding" ? rnd(6, 10) : rnd(3, 6);
            w.raise = Math.round(w.raise * (1 + pct / 100) * 1000) / 1000;
            const jump = Math.round(bar * (r.id === "outstanding" ? 0.5 : 0.25));
            try { if (!st.isMaxLevel()) st.setProgress(Math.min(bar - 1, st.getProgress() + jump)); } catch { /* ignore */ }
            t.needsWork = 0;
            text += ` A ${pct}% raise${jump > 0 ? ", and a big step towards your next promotion" : ""}.`;
            Workplace.bump(p, 3);
        } else if (r.id === "meets") {
            const pct = rnd(1, 2);
            w.raise = Math.round(w.raise * (1 + pct / 100) * 1000) / 1000;
            t.needsWork = 0;
            text += ` A ${pct}% cost-of-living raise. Solid.`;
        } else {
            t.needsWork++;
            if (t.needsWork >= 2) {
                t.plan = Work.now(p) + Workplace.planWeeks;
                text += ` Second bad review in a row: you're on a performance plan. Get your performance to 40 within ${Workplace.planWeeks} weeks, or you're out.`;
            } else text += " This is a warning. Another review like this and you'll be on a performance plan.";
        }
        Work.say("Performance Review", text, "icon_work_review");   // no choice in it: News when pop-ups are off
    },
    planCheck(p: any) {
        const t = Workplace.state(p);
        if (t.plan == null) return;
        if (Work.perf(p) >= 50) { t.plan = null; t.needsWork = 0; Work.say("Off the Plan", "Your boss says you've turned it around. The performance plan is over.", "icon_work_review"); return; }
        if (Work.now(p) >= t.plan) Workplace.fire(p, "missed the performance plan");
    },

    // ------------------------------------------------------------------ leaving
    weeklyPay(p: any = player()): number {
        try { const st = Work.jobState(p); const r = st.getSalaryRange(); return Math.round(((r.getMin() + r.getMax()) / 2) * Work.payModifier(p)); } catch { return 0; }
    },
    fire(p: any, why: string) {
        if (Work.job(p) == null) return;
        const title = Work.title(p), emp = Work.employer(p)?.name ?? "work";
        Work.left(p, `fired (${why})`);
        p.getJobState().setCurrentJob(null);
        Work.milestone("You're Fired", `${emp} let you go as ${title}: ${why}. Your next employer will hear about it.`, "icon_work_fired");
    },
    layOff(p: any, why = pick(["budget cuts", "a merger", "the company is downsizing", "a slow year"])) {
        if (Work.job(p) == null) return;
        const t = Workplace.state(p), e = Work.employer(p)!;
        const years = Math.max(1, Math.floor((Work.now(p) - e.since) / WPY));
        const weekly = Workplace.weeklyPay(p);
        const severance = weekly * 2 * years;
        Work.left(p, "laid off");
        p.getJobState().setCurrentJob(null);
        earn(p, severance);
        t.unemployed = { until: Work.now(p) + 12, weekly: Math.round(weekly * 0.4) };
        Work.say("Laid Off", `${e.name} is letting people go (${why}). It isn't about you. Severance: ${money(severance)}. Unemployment benefits: ${money(t.unemployed.weekly)} a week for up to 12 weeks, until you find work.`, "icon_work_fired");
    },
    /** The Quit menu (Work tab). */
    quitMenu(p: any = player()) {
        const t = Workplace.state(p);
        if (t.notice != null) { Work.menu("Quit", `You've handed in your notice. Your last week is in ${t.notice - Work.now(p)} week${t.notice - Work.now(p) === 1 ? "" : "s"}.`, "icon_work_quit", [["Take it back", () => { t.notice = null; Workplace.bump(p, -3); return "You told your boss you're staying after all. Awkward, but fine."; }], ["OK", () => ""]]); return; }
        Work.menu("Quit Your Job?", "Give two weeks' notice and leave on good terms (a good reference), or walk out today.", "icon_work_quit", [
            ["Give two weeks' notice", () => Workplace.giveNotice(p)],
            ["Quit on the spot", () => { Workplace.walkOut(p); return ""; }],
            ["Never mind", () => ""],
        ]);
    },
    giveNotice(p: any): string {
        const t = Workplace.state(p), w = Work.state(p), e = Work.employer(p);
        t.notice = Work.now(p) + Workplace.noticeWeeks;
        // a valued employee gets a counter-offer
        if (!t.counterOffered && e && Work.now(p) - e.since >= WPY && w.perf >= 60 && t.opinion >= 50) {
            t.counterOffered = true;
            const pct = rnd(8, 15);
            const who = Workplace.boss(p)?.getFirstName() ?? "Your boss";
            Work.milestone("Counter-Offer", `${who} doesn't want to lose you: stay, and it's a ${pct}% raise.`, "icon_work_review", [
                ["Stay for the raise", () => { t.notice = null; w.raise = Math.round(w.raise * (1 + pct / 100) * 1000) / 1000; return `You're staying, ${pct}% richer.`; }],
                ["Leave anyway", () => `You thanked them and kept your notice in. Two more weeks.`],
            ]);
            return "";
        }
        return `You handed in your notice. Two more weeks, then you're free. Work them well for a good reference.`;
    },
    walkOut(p: any) {
        const emp = Work.employer(p)?.name ?? "work";
        Work.menu("Quitting on the Spot", `This is your last minute at ${emp}. How do you go?`, "icon_work_quit", [
            ["Tell them what you really think", () => { Work.quit(p, "walked out (told them off)"); Workplace.clearTeam(p); p.getAttributeState().setDeltaValueImmediate(Relationships.mods(0, 6, 8)); return "Every word. The whole office heard. It felt amazing; your reference won't."; }],
            ["Pack up quietly", () => { Work.quit(p, "walked out"); Workplace.clearTeam(p); p.getAttributeState().setDeltaValueImmediate(Relationships.mods(0, 3, 4)); return "You put your plant in a box and left. Nobody stopped you."; }],
            ["Never mind", () => ""],
        ]);
    },
    noticeCheck(p: any) {
        const t = Workplace.state(p);
        if (t.notice == null || Work.now(p) < t.notice) return;
        t.notice = null;
        const emp = Work.employer(p)?.name ?? "work";
        const kept = Workplace.clearTeam(p);
        Work.quit(p, "quit with notice");
        Work.say("Last Day", `Cake, a card everyone signed, and a good reference from ${emp}.${kept ? ` ${kept} work friend${kept === 1 ? "" : "s"} stayed in touch.` : ""}`, "icon_work_quit");
    },

    // ------------------------------------------------------------------ the boss and coworkers (Love tab actions)
    askRaise(p: any): string {
        const t = Workplace.state(p), w = Work.state(p);
        t.raiseAsk = Work.now(p);
        const chance = clamp(0.15 + t.opinion * 0.006 + (w.perf - 50) * 0.004, 0.05, 0.9);
        if (roll(chance)) { const pct = rnd(3, 7); w.raise = Math.round(w.raise * (1 + pct / 100) * 1000) / 1000; Workplace.bump(p, 2); return `Yes! A ${pct}% raise, starting this week.`; }
        Workplace.bump(p, t.bossType === "strict" ? -8 : -5);
        return pick(["\"Not this year.\" You'll have to earn it.", "\"Let's revisit this at your review.\"", "\"Budgets are tight.\" They always are."]);
    },
    askPromotion(p: any): string {
        const t = Workplace.state(p), w = Work.state(p), st = Work.jobState(p);
        t.promoAsk = Work.now(p);
        if (st == null || st.isMaxLevel()) return "There's nowhere higher to go here.";
        const bar = st.getType().weeksForPromotion(st.getLevel());
        const ed = st.getType().educationRequirement(st.getLevel() + 1);
        if (ed != null && !p.getCompletableActionState().isCompleted(ed)) return `"Come back when you have ${ed.getTitle()}."`;
        if (st.getProgress() >= bar * 0.6 && w.perf >= 65 && roll(clamp(0.2 + t.opinion * 0.007, 0.1, 0.9))) {
            st.setLevel(st.getLevel() + 1); st.setProgress(0);
            Workplace.bump(p, 2);
            return `You made your case, and it worked: you're now ${st.getJobTitle()}!`;
        }
        Workplace.bump(p, -3);
        return st.getProgress() < bar * 0.6 ? "\"You're not ready yet. Give it more time.\"" : w.perf < 65 ? "\"Get your numbers up first.\"" : "\"Not yet. Keep doing what you're doing.\"";
    },
    feedback(p: any): string {
        const t = Workplace.state(p);
        t.feedback = Work.now(p);
        Workplace.bump(p, 1);
        const r = Work.rating(p);
        const next = t.reviewAt - Work.now(p);
        return `"Honestly? ${r.id === "outstanding" ? "You're the best we've got." : r.id === "exceeds" ? "You're doing great work." : r.id === "meets" ? "You're doing fine. There's room to push." : "I need more from you."}" (${r.title}, performance ${Math.round(Work.perf(p))}. ${Workplace.opinionText(t.opinion)}. Next review in ${next} week${next === 1 ? "" : "s"}.)`;
    },
    complainMenu(p: any) {
        const list = Workplace.coworkers(p);
        Work.menu("Complain About Someone", "Who's the problem?", "icon_work_review", [
            ...list.map((x: any) => [`${x.getFirstName()} (${ROLE_TITLES[Workplace.role(x)]})`, () => {
                const fair = x.workRole === "rival" || x.workRole === "slacker" || x.workRole === "gossip";
                if (fair && roll(0.6)) { x.setRelationshipProgress(x.getRelationshipProgress() - 100); Workplace.bump(p, 2); return `Your boss had a word with ${x.getFirstName()}. Things are quieter now. (${x.getFirstName()} knows it was you.)`; }
                Workplace.bump(p, -4); return "\"Sort it out between yourselves.\" Nobody likes a tattletale.";
            }] as [string, () => string]),
            ["Never mind", () => ""],
        ]);
    },
    askHelp(p: any, x: any): string {
        Workplace.state(p).help = Work.now(p);
        if (x.getRelationshipProgress() >= 500 || x.workRole === "friend" || x.workRole === "star") { Work.state(p).perf = clamp(Work.state(p).perf + 3, 0, 100); return `${x.getFirstName()} walked you through it. (+3 performance)`; }
        return `${x.getFirstName()} was "too busy". Maybe get to know them first.`;
    },
    canAskOut(p: any, x: any): string | null {
        try { if (p.getFamilyState().getPartner() != null) return "You're already with someone"; } catch { /* ignore */ }
        if (x.workRole === "boss") return null;
        if (x.getRelationshipProgress() < 600) return "Get to know them better first";
        if (p.getAgeInYears() < 18 || x.getAgeInYears() < 18) return "Not yet";
        return null;
    },
    /** Office romance: a coworker becomes your partner. */
    date(p: any, x: any): boolean {
        if (Workplace.canAskOut(p, x) != null) return false;
        const lover = new Person(x.firstName, x.lastName, x.getGender(), x.sexuality ?? Sexuality.straight, x.getSex(), Relationship.lover, x.getAgeInWeeks(), LoverPersonality.cheerful);
        try { TrueAge.copy(x, lover); } catch { /* ignore */ }
        lover.setRelationshipProgress(Math.max(600, x.getRelationshipProgress()));
        const wasBoss = x.workRole === "boss";
        Relationships.circle(p).remove(x.id);
        p.getFamilyState().date(lover);
        if (wasBoss) Workplace.state(p).boss = null;
        return true;
    },

    // ------------------------------------------------------------------ the week
    afterWeek(p: any) {
        const t = Workplace.state(p), now = Work.now(p);
        if (Work.job(p) == null) {
            if (t.ids.length) Workplace.clearTeam(p);
            if (t.unemployed) {
                if (now > t.unemployed.until) t.unemployed = null;
                else { earn(p, t.unemployed.weekly); }
            }
            return;
        }
        t.unemployed = null;
        Workplace.ensureTeam(p);
        Workplace.opinionWeek(p);
        Workplace.noticeCheck(p);
        if (Work.job(p) == null) return;
        if (t.reviewAt > 0 && now >= t.reviewAt) Workplace.review(p);
        Workplace.planCheck(p);
        if (Work.job(p) == null) return;
        // layoffs are random events
        if (roll(Workplace.layoffChance) && now - (Work.employer(p)?.since ?? now) > 26) Workplace.layOff(p);
    },
    onHired(p: any) { Workplace.makeTeam(p); },
    onLeft(p: any) { Workplace.clearTeam(p); },
};
export { ratingOf };
