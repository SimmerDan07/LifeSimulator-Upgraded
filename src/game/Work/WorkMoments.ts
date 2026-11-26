// v0.33.0 "The Career Overhaul": moments at work. They're Life Moments (random events): the pop-up switch silences
// them. At most one every 4 weeks, none in your first 4 weeks at a job. No trap options: every choice has an upside.
import { BigInteger } from "../runtime";
import { Moment } from "../Managers/LifeMoments";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Relationships } from "../Social/Relationships";
import { Work, WorkDice, money } from "./Work";
import { Workplace } from "./Workplace";

const { roll, rnd, pick, clamp } = WorkDice;
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const perf = (p: any, n: number) => { const w = Work.state(p); w.perf = clamp(w.perf + n, 0, 100); };
const op = (p: any, n: number) => Workplace.bump(p, n);
const earn = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null); };
const pay = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null); };
const bond = (x: any, n: number) => { if (x) x.setRelationshipProgress(clamp(x.getRelationshipProgress() + n, 0, 1000)); };
const bossName = (p: any) => Workplace.boss(p)?.getFirstName() ?? "Your boss";
const byRole = (p: any, ...roles: string[]) => Workplace.coworkers(p).find((x: any) => roles.includes(x.workRole)) ?? null;
const anyone = (p: any) => pick(Workplace.coworkers(p)) ?? null;
const weekPay = (p: any) => Math.max(100, Workplace.weeklyPay(p));
const group = (p: any) => Work.group(Work.job(p));
const atWork = (p: any) => {
    if (!Work.enabled || Work.job(p) == null) return false;
    const e = Work.employer(p), t = Workplace.state(p);
    return e != null && Work.now(p) - e.since >= 4 && Work.now(p) - t.lastMoment >= 4 && Workplace.boss(p) != null;
};
/** A work moment: only at work, at most one every 4 weeks. */
const W = (m: Omit<Moment, "min" | "max"> & { min?: number; max?: number; also?: (p: any) => boolean }): Moment => ({
    min: 16, max: 120, weight: 1.5, ...m,
    when: (p) => atWork(p) && (m.also ? m.also(p) : true),
    make: (p) => { const r = m.make(p); if (r) Workplace.state(p).lastMoment = Work.now(p); return r; },
});

export const WORK_MOMENTS: Moment[] = [
    // ------------------------------------------------------------------ your coworkers
    W({ id: "w_creditStolen", title: "Stolen Credit", image: "icon_work_review", also: (p) => byRole(p, "rival", "star") != null, make: (p) => {
        const r = byRole(p, "rival", "star")!; const n = r.getFirstName();
        return { text: `In the big meeting, ${n} presented your idea as their own. Everyone loved it.`, options: [
            ["Call it out, politely", () => { if (roll(0.6)) { op(p, 5); perf(p, 4); bond(r, -60); return `"Actually, that was my idea, and here's the rest of it." ${bossName(p)} noticed. ${n} didn't look at you for a week.`; } bond(r, -40); op(p, -2); return `It came out sounding petty. ${n} smirked.`; }],
            ["Talk to them afterwards", () => { bond(r, 30); attr(p, 0, -2, 1); return `${n} apologised, sort of. They owe you one now.`; }],
            ["Let it go", () => { attr(p, 0, -4, -2); return "You let it slide. It still bugs you at 2 a.m."; }],
        ] };
    } }),
    W({ id: "w_cover", title: "Cover for Me?", image: "tab_briefcase", also: (p) => byRole(p, "friend", "slacker") != null, make: (p) => {
        const f = byRole(p, "friend", "slacker")!; const n = f.getFirstName();
        return { text: `${n} has a family thing and asks you to cover their shift. Your boss would rather not know.`, options: [
            ["Cover for them", () => { bond(f, 50); attr(p, -1, -1, -1); return `A long day, but ${n} brought you coffee every morning for a week.`; }],
            ["Say no", () => { bond(f, -20); return `${n} understood. Mostly.`; }],
        ] };
    } }),
    W({ id: "w_rumour", title: "The Rumour Mill", image: "icon_work_review", also: (p) => byRole(p, "gossip") != null, make: (p) => {
        const g = byRole(p, "gossip")!; const n = g.getFirstName();
        return { text: `${n} has been telling everyone you're about to quit.`, options: [
            ["Confront them", () => { bond(g, -40); attr(p, 0, 2, 2); return `${n} swore it was "just a joke". The rumour died by Friday.`; }],
            ["Tell your boss it's not true", () => { op(p, 3); return `${bossName(p)} laughed: "Good, because we need you."`; }],
            ["Start a rumour about them", () => { bond(g, -80); if (roll(0.4)) { op(p, -6); return "It got traced back to you. Not your finest week."; } attr(p, 0, 4, 0); return `Now everyone thinks ${n} is moving to Iceland. Petty, but funny.`; }],
        ] };
    } }),
    W({ id: "w_newHire", title: "The New Hire", image: "tab_briefcase", make: (p) => ({
        text: "A nervous new hire is starting on your team, and nobody's shown them around.",
        options: [
            ["Take them under your wing", () => { op(p, 3); attr(p, 0, 3, 1); const x = Workplace.coworkers(p).length < 5 ? Workplace.newPerson("friend", p) : null; return x ? `${x.getFirstName()} thanks you every day. You've made a work friend.` : "They found their feet fast, thanks to you."; }],
            ["Too busy", () => { perf(p, 2); return "You kept your head down and got your own work done."; }],
        ] }) }),
    W({ id: "w_slacker", title: "Doing Their Job Too", image: "tab_briefcase", also: (p) => byRole(p, "slacker") != null, make: (p) => {
        const s = byRole(p, "slacker")!; const n = s.getFirstName();
        return { text: `${n} has left their half of the project to you. Again.`, options: [
            ["Do it yourself", () => { perf(p, 4); attr(p, 0, -3, -3); return "It's done, and it's good. You're tired."; }],
            ["Have a word with them", () => { bond(s, -30); if (roll(0.5)) return `${n} actually pulled their weight after that.`; return `${n} shrugged. Classic ${n}.`; }],
            ["Tell your boss", () => { bond(s, -50); op(p, 2); return `${bossName(p)} had a quiet word. ${n} knows it was you.`; }],
        ] };
    } }),
    W({ id: "w_rivalPromo", title: "Same Promotion", image: "icon_work_effort", also: (p) => byRole(p, "rival") != null, make: (p) => {
        const r = byRole(p, "rival")!; const n = r.getFirstName();
        return { text: `You and ${n} are both up for the same opening on the team.`, options: [
            ["Outwork them", () => { perf(p, 6); attr(p, -1, -2, -3); return "Late nights, early mornings. Your work speaks for itself now."; }],
            ["Make friends with them", () => { bond(r, 120); r.workRole = "friend"; return `Over drinks, ${n} admitted they were terrified of you. Rivals no more.`; }],
            ["Let them have it", () => { attr(p, 0, 1, 3); return "You don't need the stress. Nobody can take that away from you."; }],
        ] };
    } }),
    // ------------------------------------------------------------------ romance
    W({ id: "w_flirt", title: "Office Chemistry", image: "love_movie", also: (p) => p.getAgeInYears() >= 18 && p.getFamilyState().getPartner() == null, make: (p) => {
        const x: any = byRole(p, "friend", "star", "rival", "gossip", "slacker");
        if (!x) return null;
        try { x.sex = p.getSex().randomPartnerGender(p.getSexuality()); x.gender = x.sex.getCorrespondingGender(); } catch { /* keep */ }
        const n = x.getFirstName();
        return { text: `${n} keeps finding reasons to stop by your desk. Today they asked if you're free Friday.`, options: [
            ["Say yes", () => { x.setRelationshipProgress(Math.max(650, x.getRelationshipProgress())); return Workplace.date(p, x) ? `Friday turned into Saturday brunch. You and ${n} are dating.` : "It was a lovely evening."; }],
            ["Keep it professional", () => { bond(x, -20); return `${n} took it well. Mostly.`; }],
        ] };
    } }),
    W({ id: "w_ex", title: "Still Sit Next to Them", image: "love_breakup", also: (p) => byRole(p, "friend", "gossip") != null && roll(0.5), make: (p) => {
        const g = byRole(p, "gossip", "friend")!;
        return { text: `${g.getFirstName()} heard your love life is complicated and wants every detail.`, options: [
            ["Spill", () => { bond(g, 40); attr(p, 0, 3, 2); return "It felt good to talk. By lunch, the whole floor knew."; }],
            ["Change the subject", () => { attr(p, 0, 0, 1); return "You talked about the weather for 20 painful minutes."; }],
        ] };
    } }),
    // ------------------------------------------------------------------ office life
    W({ id: "w_holidayParty", title: "The Holiday Party", image: "vacation_drinks", seasons: ["winter"], make: (p) => ({
        text: "Open bar, a DJ who only plays the 80s, and your boss is doing karaoke.",
        options: [
            ["Join the karaoke", () => { op(p, 4); attr(p, 0, 7, 3); for (const x of Workplace.people(p)) bond(x, 15); return `You and ${bossName(p)} did a duet. It'll be in the newsletter.`; }],
            ["One drink too many", () => { attr(p, -2, 6, -1); if (roll(0.35)) { op(p, -5); return "You told the CEO exactly what you think of the parking. Monday was rough."; } return "A great night. Hazy, but great."; }],
            ["Leave early", () => { attr(p, 0, 1, 2); return "You were in bed by ten. No regrets."; }],
        ] }) }),
    W({ id: "w_secretSanta", title: "Secret Santa", image: "inappnotification_gift", seasons: ["winter"], make: (p) => {
        const x = anyone(p);
        return { text: `You drew ${x ? x.getFirstName() : "someone you barely know"} for Secret Santa. The limit is $20.`, options: [
            ["Something thoughtful", () => { pay(p, 20); bond(x, 40); return `${x ? x.getFirstName() : "They"} loved it. How did you know?`; }],
            ["A mug that says World's Okayest Coworker", () => { pay(p, 15); bond(x, 10); attr(p, 0, 2, 0); return "Big laughs. They actually use it."; }],
        ] };
    } }),
    W({ id: "w_birthdayCake", title: "Office Birthday", image: "inappnotification_gift", make: (p) => ({
        text: "There's cake in the break room for someone you've never met.",
        options: [
            ["Have a slice and sign the card", () => { attr(p, 0, 3, 1); return "Chocolate. A good day."; }],
            ["Skip it, you're busy", () => { perf(p, 1); return "You finished that report instead. Somebody saved you a slice anyway."; }],
        ] }) }),
    W({ id: "w_retreat", title: "Team-Building Retreat", image: "vacation_camping", make: (p) => ({
        text: "The company is sending your team to a weekend retreat. Trust falls, ropes course, the lot.",
        options: [
            ["Throw yourself into it", () => { for (const x of Workplace.people(p)) bond(x, 30); op(p, 2); attr(p, 1, 4, 2); return "You won the raft race. The team has never been closer."; }],
            ["Go, but quietly", () => { attr(p, 0, 1, 2); return "You found a hammock and read a book. Bliss."; }],
            ["Call in sick", () => { attr(p, 0, 2, 3); op(p, -2); return "A whole weekend to yourself. Your boss noticed the empty seat on the bus."; }],
        ] }) }),
    W({ id: "w_wellness", title: "Workplace Wellness Challenge", image: "health_workout", make: (p) => ({
        text: "HR launched a step challenge. The winning team gets a pizza party.",
        options: [
            ["Go for the win", () => { attr(p, 3, 3, 2); return roll(0.4) ? "Your team won. Pizza never tasted so earned." : "Second place. Your calves are incredible though."; }],
            ["Tape the tracker to your dog", () => { attr(p, 0, 4, 0); return roll(0.5) ? "Your dog walked 30,000 steps a day. Nobody asked questions." : "Someone noticed. Disqualified, but legendary."; }],
        ] }) }),
    W({ id: "w_coffee", title: "The Last of the Coffee", image: "vacation_drinks", make: (p) => {
        const x = anyone(p);
        return { text: `You and ${x ? x.getFirstName() : "a coworker"} reach for the last cup of coffee at the same moment.`, options: [
            ["Let them have it", () => { bond(x, 25); attr(p, 0, 1, 0); return "They'll remember that. Probably."; }],
            ["Make a fresh pot for everyone", () => { for (const y of Workplace.people(p)) bond(y, 10); return "Office hero, for at least an hour."; }],
        ] };
    } }),
    // ------------------------------------------------------------------ pressure
    W({ id: "w_deadline", title: "Deadline Crunch", image: "icon_work_allnighter", make: (p) => ({
        text: "A huge deadline just moved up by a week. Everyone's panicking.",
        options: [
            ["Stay late all week", () => { perf(p, 7); attr(p, -2, -3, -4); return "You made it. The team made it. Pizza at 11 p.m. tastes like victory."; }],
            ["Work smart, not long", () => { perf(p, roll(0.5) ? 5 : 1); attr(p, 0, 0, -1); return "You cut the fat and shipped what mattered."; }],
            ["Ask for more time", () => { op(p, -2); attr(p, 0, 1, 2); return `${bossName(p)} gave you three extra days, with a sigh.`; }],
        ] }) }),
    W({ id: "w_bigClient", title: "The Big Client", image: "tab_briefcase", make: (p) => ({
        text: "Your boss wants you to lead the meeting with the company's biggest client.",
        options: [
            ["Prepare like crazy", () => { perf(p, 6); op(p, 4); attr(p, 0, 2, -2); return "You knew every answer before they asked. The client signed on the spot."; }],
            ["Wing it", () => { if (roll(0.5)) { perf(p, 6); op(p, 5); return "Charm and confidence carried you. They loved you."; } perf(p, -5); op(p, -4); return "You called the client by the wrong name. Twice."; }],
            ["Pass it to someone else", () => { attr(p, 0, 0, 2); return "Someone else took the spotlight, and the stress."; }],
        ] }) }),
    W({ id: "w_mistake", title: "An Expensive Mistake", image: "health_low", make: (p) => ({
        text: "You just realised a mistake you made last week cost the company real money. Nobody knows yet.",
        options: [
            ["Own up straight away", () => { op(p, roll(0.7) ? 2 : -3); attr(p, 0, -2, 3); return `${bossName(p)} appreciated the honesty. "Let's fix it together."`; }],
            ["Fix it quietly", () => { if (roll(0.6)) { perf(p, 2); return "Late nights, but nobody ever found out."; } perf(p, -6); op(p, -6); return "It came out anyway. Hiding it made it worse."; }],
        ] }) }),
    W({ id: "w_angryCustomer", title: "The Angry Customer", image: "health_low", also: (p) => ["starter", "hospitality", "health", "public"].includes(group(p)), make: (p) => ({
        text: "A customer is yelling at you over something that isn't your fault.",
        options: [
            ["Stay calm and help", () => { perf(p, 3); attr(p, 0, -2, -2); return "By the end they were apologising. Your manager saw everything."; }],
            ["Get the manager", () => { attr(p, 0, 0, 1); return "Not your problem today."; }],
            ["Give them a piece of your mind", () => { attr(p, 0, 4, 4); op(p, -5); return "It felt amazing for about four seconds."; }],
        ] }) }),
    W({ id: "w_overtimeAsk", title: "Weekend Work", image: "icon_work_allnighter", make: (p) => ({
        text: `${bossName(p)} asks if you can come in this weekend. Double pay.`,
        options: [
            ["Sure, double pay", () => { earn(p, weekPay(p) * 0.8); attr(p, -1, -2, -2); op(p, 3); return `Two long days, ${money(weekPay(p) * 0.8)} richer.`; }],
            ["You have plans", () => { attr(p, 0, 2, 1); return "\"No problem.\" It really wasn't."; }],
        ] }) }),
    // ------------------------------------------------------------------ the company
    W({ id: "w_layoffRumour", title: "Layoff Rumours", image: "icon_work_fired", make: (p) => ({
        text: "Everyone is whispering about layoffs. Meetings keep getting cancelled.",
        options: [
            ["Keep your head down and work hard", () => { perf(p, 4); attr(p, 0, -2, -3); return "Nothing happened, in the end. Your work stood out though."; }],
            ["Quietly look at other openings", () => { attr(p, 0, 0, 1); return "It's good to have options. The Career Center is on the Work tab."; }],
        ] }) }),
    W({ id: "w_newBoss", title: "A New Boss", image: "icon_work_review", make: (p) => {
        const old = Workplace.boss(p);
        return { text: `${old ? old.getFirstName() : "Your boss"} is leaving, and the company wants to know if you'd like to be considered for the job.`, options: [
            ["Go for it", () => {
                const st = Work.jobState(p);
                if (Work.perf(p) >= 70 && st && !st.isMaxLevel() && roll(0.5)) { const ed = st.getType().educationRequirement(st.getLevel() + 1); if (ed == null || p.getCompletableActionState().isCompleted(ed)) { st.setLevel(st.getLevel() + 1); st.setProgress(0); if (old) Relationships.circle(p).remove(old.id); Workplace.state(p).boss = null; Workplace.newPerson("boss", p); return `You got it! You're now ${st.getJobTitle()}, reporting to a new boss upstairs.`; } }
                if (old) Relationships.circle(p).remove(old.id); const b: any = Workplace.newPerson("boss", p); Workplace.state(p).bossType = b.bossType; Workplace.state(p).opinion = 50;
                return `They went with an outside hire: ${b.getFirstName()}. A fresh start.`;
            }],
            ["Wait and see", () => { if (old) Relationships.circle(p).remove(old.id); const b: any = Workplace.newPerson("boss", p); Workplace.state(p).bossType = b.bossType; Workplace.state(p).opinion = 50; return `Your new boss is ${b.getFullName()}. First impressions matter.`; }],
        ] };
    } }),
    W({ id: "w_merger", title: "Merger!", image: "tab_briefcase", make: (p) => ({
        text: "Your company is merging with a competitor. Big changes are coming.",
        options: [
            ["Volunteer for the transition team", () => { perf(p, 5); op(p, 4); attr(p, 0, -1, -3); return "Long weeks, but now everyone knows your name."; }],
            ["Ride it out", () => { attr(p, 0, 0, -1); return "The logo changed. Your desk didn't."; }],
        ] }) }),
    W({ id: "w_strike", title: "Strike Vote", image: "icon_work_review", make: (p) => ({
        text: "Your coworkers are voting on whether to strike for better pay.",
        options: [
            ["Vote to strike", () => { if (roll(0.5)) { Work.state(p).raise = Math.round(Work.state(p).raise * 1.05 * 1000) / 1000; for (const x of Workplace.coworkers(p)) bond(x, 25); return "Three weeks on the picket line, and you won: a 5% raise for everyone."; } attr(p, 0, -3, -2); return "The strike fizzled. At least you stood together."; }],
            ["Vote against", () => { op(p, 3); for (const x of Workplace.coworkers(p)) bond(x, -15); return "The vote failed. Management noticed who was on their side."; }],
        ] }) }),
    W({ id: "w_remote", title: "Going Remote", image: "icon_work_wfh", also: (p) => !Work.hasPerk("remote", p) && ["tech", "creative", "science"].includes(group(p)), make: (p) => ({
        text: "The company is letting some teams work from home. Do you want in?",
        options: [
            ["Yes, please", () => { const e = Work.employer(p); if (e && !e.perks.includes("remote")) e.perks.push("remote"); return "You can work from home now (Work tab). Pajamas: approved."; }],
            ["I like the office", () => { op(p, 2); return "You like the people. And the free coffee."; }],
        ] }) }),
    W({ id: "w_bonus", title: "Surprise Bonus", image: "bank_deposit", also: (p) => Work.perf(p) >= 65, make: (p) => {
        const b = Math.round(weekPay(p) * rnd(2, 4));
        return { text: `Great year for the company. ${bossName(p)} hands you an envelope: ${money(b)}.`, options: [
            ["Save it", () => { earn(p, b); attr(p, 0, 4, 3); return "Into the savings it goes (well, your account). Future you says thanks."; }],
            ["Treat the team to dinner", () => { earn(p, Math.round(b * 0.8)); for (const x of Workplace.people(p)) bond(x, 30); attr(p, 0, 6, 2); return "Best team dinner ever. You're a legend."; }],
        ] };
    } }),
    // ------------------------------------------------------------------ ethics
    W({ id: "w_fudge", title: "Funny Numbers", image: "icon_work_review", make: (p) => ({
        text: `You notice ${bossName(p)} has been fudging the numbers in the quarterly report.`,
        options: [
            ["Report it to HR", () => { if (roll(0.6)) { const old = Workplace.boss(p); if (old) Relationships.circle(p).remove(old.id); const b: any = Workplace.newPerson("boss", p); Workplace.state(p).bossType = b.bossType; Workplace.state(p).opinion = 60; attr(p, 0, 2, 4); return `HR investigated. Your boss was let go; ${b.getFirstName()} is in charge now. You sleep fine.`; } op(p, -15); return "HR \"looked into it\" and found nothing. Your boss knows it was you."; }],
            ["Stay quiet", () => { attr(p, 0, -2, -3); return "Not your fight. It nags at you."; }],
            ["Ask for a cut", () => { if (roll(0.5)) { earn(p, weekPay(p) * 3); op(p, 5); return `Your boss slipped you ${money(weekPay(p) * 3)} and a wink. You're in it now.`; } Workplace.fire(p, "trying to blackmail your boss"); return ""; }],
        ] }) }),
    W({ id: "w_bribe", title: "An Envelope", image: "bank_withdrawal", also: (p) => ["public", "health", "trades", "science"].includes(group(p)), make: (p) => {
        const b = Math.round(weekPay(p) * rnd(3, 6));
        return { text: `A contractor slides you an envelope with ${money(b)} inside. "For your trouble." They want an approval you shouldn't give.`, options: [
            ["Refuse", () => { attr(p, 0, 1, 3); op(p, 2); return "You handed it back. Some things aren't for sale."; }],
            ["Take it", () => { earn(p, b); if (roll(0.25)) { Workplace.fire(p, "taking a bribe"); return ""; } attr(p, 0, 2, -4); return `${money(b)}, and a knot in your stomach.`; }],
        ] };
    } }),
    W({ id: "w_lie", title: "Just Tell Them It's Fine", image: "icon_work_review", make: (p) => ({
        text: "Your boss wants you to tell a customer their order is \"on its way\". It hasn't even been made.",
        options: [
            ["Do as you're told", () => { op(p, 2); attr(p, 0, -1, -2); return "The customer was happy. For now."; }],
            ["Tell the truth", () => { op(p, -3); attr(p, 0, 1, 3); return "The customer appreciated it. Your boss didn't."; }],
        ] }) }),
    // ------------------------------------------------------------------ career-specific
    W({ id: "w_health", title: "Code Blue", image: "health_hospitalstay", also: (p) => group(p) === "health", make: (p) => ({
        text: "A patient crashes at the end of your shift. Everyone else has gone home.",
        options: [
            ["Stay and help", () => { perf(p, 6); attr(p, -1, 3, -3); return roll(0.8) ? "You brought them back. You sat in your car for ten minutes afterwards, shaking." : "You did everything right. It wasn't enough. Some nights are like that."; }],
            ["Hand over to the night team", () => { attr(p, 0, -2, -1); return "They had it under control. You hope."; }],
        ] }) }),
    W({ id: "w_trades", title: "Cutting Corners", image: "work_constructionworker", also: (p) => group(p) === "trades", make: (p) => ({
        text: "The client wants the job done a week early. The only way is to skip a safety step.",
        options: [
            ["Do it properly", () => { op(p, -2); attr(p, 0, 1, 3); return "A week late, done right. You'll never get a call about this one."; }],
            ["Skip it", () => { earn(p, weekPay(p)); if (roll(0.3)) { attr(p, -15, -4, -4); return "Something gave way. You got hurt, and the client is suing."; } return `Done early, with a ${money(weekPay(p))} bonus. Fingers crossed.`; }],
        ] }) }),
    W({ id: "w_public", title: "A Rescue", image: "work_police", also: (p) => group(p) === "public", make: (p) => ({
        text: "On your way home you see someone in real trouble.",
        options: [
            ["Step in", () => { attr(p, -2, 8, 3); op(p, 5); perf(p, 3); return "You got them to safety. The local news called you a hero."; }],
            ["Call it in", () => { attr(p, 0, 2, 1); return "Help arrived within minutes. You did the right thing."; }],
        ] }) }),
    W({ id: "w_tech", title: "Everything Is Down", image: "possession_computer_2", also: (p) => group(p) === "tech", make: (p) => ({
        text: "At 3 a.m. your phone explodes: the whole system is down.",
        options: [
            ["Fix it from bed", () => { perf(p, 7); op(p, 4); attr(p, 0, -2, -4); return "Back up by 4:15. You're a legend in the team chat."; }],
            ["Let the on-call person handle it", () => { attr(p, 1, 1, 2); return "You slept. They handled it. That's what on-call is for."; }],
        ] }) }),
    W({ id: "w_creative", title: "It Went Viral", image: "work_artist", also: (p) => group(p) === "creative", make: (p) => ({
        text: "Something you made at work just went viral. Millions of views overnight.",
        options: [
            ["Take the credit publicly", () => { perf(p, 6); op(p, 3); attr(p, 0, 7, 0); return "Interviews, a podcast, and a very proud boss."; }],
            ["Credit the whole team", () => { for (const x of Workplace.people(p)) bond(x, 30); op(p, 5); return "The team loves you for it. So does your boss."; }],
        ] }) }),
    W({ id: "w_hospitality", title: "The Food Critic", image: "work_pastrychef", also: (p) => group(p) === "hospitality", make: (p) => ({
        text: "Word is a famous critic is coming in tonight.",
        options: [
            ["Go all out", () => { if (roll(0.6)) { perf(p, 7); op(p, 5); return "Five stars. The review is framed by the door."; } perf(p, -2); return "Three stars. \"Ambitious.\" Ouch."; }],
            ["Treat them like anyone else", () => { perf(p, 2); return "\"Honest and reliable.\" Four stars."; }],
        ] }) }),
    W({ id: "w_science", title: "A Breakthrough?", image: "work_research", also: (p) => group(p) === "science", make: (p) => ({
        text: "Your results look incredible. Almost too incredible.",
        options: [
            ["Check everything twice", () => { perf(p, 4); return roll(0.5) ? "They held up. You're presenting at a conference next month." : "A calibration error. You caught it before anyone else did."; }],
            ["Publish right away", () => { if (roll(0.4)) { perf(p, 10); op(p, 6); attr(p, 0, 8, 0); return "It's real! Your name is on everyone's lips."; } perf(p, -8); op(p, -6); return "Someone found the error. Embarrassing."; }],
        ] }) }),
    W({ id: "w_sports", title: "The Big Game", image: "health_workout", also: (p) => group(p) === "sports", make: (p) => ({
        text: "Everything comes down to the final minutes of the big game.",
        options: [
            ["Take the big moment", () => { if (roll(0.55)) { perf(p, 8); attr(p, 0, 9, 2); return "You nailed it. The crowd went wild."; } attr(p, 0, -5, -3); return "So close. They'll talk about that one for years."; }],
            ["Set up a teammate", () => { const x = anyone(p); bond(x, 40); perf(p, 3); return `${x ? x.getFirstName() : "Your teammate"} scored the winner and pointed straight at you.`; }],
        ] }) }),
    W({ id: "w_starter", title: "Employee of the Month", image: "work_retail", also: (p) => group(p) === "starter" && Work.perf(p) >= 60, make: (p) => ({
        text: "Your photo is going up on the wall: Employee of the Month.",
        options: [
            ["Smile for the photo", () => { op(p, 4); attr(p, 0, 5, 1); earn(p, 50); return `A ${money(50)} gift card and your face by the door for a whole month.`; }],
            ["Pull a silly face", () => { attr(p, 0, 7, 0); for (const x of Workplace.coworkers(p)) bond(x, 15); return "Management wasn't amused. Your coworkers loved it."; }],
        ] }) }),
];
