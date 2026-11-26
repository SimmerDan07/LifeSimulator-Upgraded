// v0.33.0: Self-Care (Health tab). All of it is a bonus: skipping self-care never costs you anything.
//
// - Sleep (a setting, like Effort): Running on little (−1 health, −1 sanity, a sharper edge at work), Healthy
//   (+1 health; +2 with the Sleep App) or Sleeping in (+1 happiness, a little slower at work). Insomnia locks you
//   to little sleep until it's treated. Vampires sleep by day: it doesn't touch them.
// - 14 quick things to do for yourself: instant, each once a week.
// - Care beyond the checkup (which stays where it was): dentist, eye exam, physical therapy, chiropractor,
//   acupuncture, a sleep clinic and support groups.
// - Optional goals ("Walk 4 times", "Journal 10 times"…): finishing one gives a small boost and a badge.
//   Missing a week just pauses a goal. A life coach makes them 25% shorter.
// - About 10 self-care moments (random events: the pop-up switch silences them).
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Moment } from "../Managers/LifeMoments";
import { Subscriptions } from "../Managers/Subscriptions";
import { Illness } from "../Health/Illness";
import { Vampire } from "../Lifepaths/Vampire";
import { Hobbies } from "../Managers/Hobbies";
import { Relationships } from "../Social/Relationships";
import { LifeActionDef } from "../Lifepaths/Vampire";
import { Work, WorkDice, money } from "./Work";
import { Benefits } from "./Benefits";

export type SleepId = "little" | "healthy" | "long";
export const SLEEP: { id: SleepId; title: string; blurb: string; mods: [number, number, number]; perf: number }[] = [
    { id: "little", title: "Running on Little (5 hours)", blurb: "−1 health and −1 sanity a week, but a sharper edge at work.", mods: [-1, 0, -1], perf: 3 },
    { id: "healthy", title: "Healthy (8 hours)", blurb: "+1 health a week.", mods: [1, 0, 0], perf: 0 },
    { id: "long", title: "Sleeping In (10 hours)", blurb: "+1 happiness a week, a little slower at work.", mods: [0, 1, 0], perf: -3 },
];
export interface CareState { sleep: SleepId; last: Record<string, number>; counts: Record<string, number>; goals: string[]; done: string[]; makeoverYear: number; dentist: number; eyes: number; group: string | null }
export interface GoalDef { id: string; title: string; action: string; count: number; reward: [number, number, number]; badge: string }
export const GOALS: GoalDef[] = [
    { id: "walks", title: "Go for a walk 4 times", action: "walk", count: 4, reward: [3, 0, 2], badge: "Walker" },
    { id: "journal", title: "Write in your journal 10 times", action: "journal", count: 10, reward: [0, 2, 4], badge: "Reflective" },
    { id: "meals", title: "Cook 8 healthy meals", action: "meal", count: 8, reward: [4, 2, 0], badge: "Home Chef" },
    { id: "sleep", title: "Healthy sleep for a season (13 weeks)", action: "sleepWeek", count: 13, reward: [5, 0, 3], badge: "Well Rested" },
    { id: "stretch", title: "Stretch and breathe 6 times", action: "stretch", count: 6, reward: [2, 0, 3], badge: "Limber" },
    { id: "gratitude", title: "Make 8 gratitude lists", action: "gratitude", count: 8, reward: [0, 4, 2], badge: "Grateful" },
    { id: "declutter", title: "Declutter your home 5 times", action: "declutter", count: 5, reward: [0, 2, 4], badge: "Minimalist" },
    { id: "dentist", title: "Dentist twice a year for 2 years", action: "dentist", count: 4, reward: [3, 1, 0], badge: "Bright Smile" },
];

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { roll, rnd, pick, clamp } = WorkDice;
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const pay = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null); };
const WPY = 52;

export const SelfCare = {
    state(p: any = player()): CareState {
        const s: CareState = p.selfCare ?? (p.selfCare = { sleep: "healthy", last: {}, counts: {}, goals: [], done: [], makeoverYear: -1, dentist: -999, eyes: -999, group: null } as CareState);
        s.last ??= {}; s.counts ??= {}; s.goals ??= []; s.done ??= [];
        return s;
    },
    now(p: any = player()): number { return Work.now(p); },
    sleep(p: any = player()): SleepId { return Illness.has("insomnia", p) ? "little" : SelfCare.state(p).sleep; },
    setSleep(id: SleepId, p: any = player()) { SelfCare.state(p).sleep = id; },
    sleepDef(p: any = player()) { return SLEEP.find((x) => x.id === SelfCare.sleep(p))!; },
    /** Performance from sleep (Work perfHooks). */
    perfBonus(p: any): number { return Vampire.isVampire(p) ? 0 : SelfCare.sleepDef(p).perf; },
    weekly(p: any) {
        if (Vampire.isVampire(p)) return;
        const d = SelfCare.sleepDef(p);
        let [h, hap, san] = d.mods;
        if (d.id === "healthy" && Subscriptions.on("sleepApp", p)) h += 1;
        try { p.getAttributeState().setDeltaValue(new Modifiers(h, hap, san), "Sleep"); } catch { /* ignore */ }
        if (d.id === "healthy") SelfCare.count("sleepWeek", p);
        const g = SelfCare.state(p).group;
        if (g) attr(p, 0, 0, 2);
    },
    /** Counts towards your goals. */
    count(action: string, p: any = player()) {
        const s = SelfCare.state(p);
        s.counts[action] = (s.counts[action] ?? 0) + 1;
        for (const id of [...s.goals]) {
            const g = GOALS.find((x) => x.id === id);
            if (!g || g.action !== action) continue;
            if ((s.counts[`goal:${id}`] = (s.counts[`goal:${id}`] ?? 0) + 1) >= SelfCare.goalNeed(g, p)) {
                s.goals = s.goals.filter((x) => x !== id);
                if (!s.done.includes(id)) s.done.push(id);
                attr(p, g.reward[0], g.reward[1], g.reward[2]);
                Work.say("Goal Reached", `${g.title}: done! You earned the ${g.badge} badge.`, "health_meditation");
            }
        }
    },
    goalNeed(g: GoalDef, p: any = player()): number { return Math.max(1, Math.ceil(g.count * (Subscriptions.on("lifeCoach", p) ? 0.75 : 1))); },
    goalProgress(g: GoalDef, p: any = player()): number { return SelfCare.state(p).counts[`goal:${g.id}`] ?? 0; },
    startGoal(id: string, p: any = player()) { const s = SelfCare.state(p); if (!s.goals.includes(id) && !s.done.includes(id)) { s.goals.push(id); s.counts[`goal:${id}`] = 0; } },
    dropGoal(id: string, p: any = player()) { const s = SelfCare.state(p); s.goals = s.goals.filter((x) => x !== id); },
    weekLock(id: string, p: any = player()): string | null { return SelfCare.state(p).last[id] === SelfCare.now(p) ? "Again next week" : null; },
    mark(id: string, p: any = player()) { SelfCare.state(p).last[id] = SelfCare.now(p); },
    treatMenu(p: any = player()) {
        const opt = (n: number, hap: number, what: string): [string, () => string] => [money(n), () => { if (cash(p) < n) return "You can't afford that right now."; pay(p, n); attr(p, 0, hap, 1); return `${what}. Worth it.`; }];
        Work.menu("Treat Yourself", "How big a treat?", "inappnotification_gift", [opt(20, 2, "A fancy coffee and a cake"), opt(100, 4, "New shoes"), opt(500, 7, "Something you've wanted for ages"), ["Never mind", () => ""]]);
    },
};

const quick = (id: string, title: string, image: string, cost: number, mods: [number, number, number], note: string, extra?: Partial<LifeActionDef> & { goal?: string; after?: (p: any) => string | void }): LifeActionDef => ({
    id: `sc_${id}`, title, image, instant: true, cost: cost || undefined, mods, ...extra,
    lock: (p) => (extra?.lock?.(p) ?? SelfCare.weekLock(id, p)),
    note: () => `${note}\n`,
    run: (p) => { SelfCare.mark(id, p); if (extra?.goal) SelfCare.count(extra.goal, p); const r = extra?.after?.(p); if (r) Work.say(title, r, image); },
});
export const QUICK_CARE: LifeActionDef[] = [
    quick("nap", "Take a Nap", "health_meditation", 0, [0, 0, 2], "Twenty minutes, no alarm."),
    quick("journal", "Write in a Journal", "sidehustle_author", 0, [0, 0, 2], "Get it all out on paper.", { goal: "journal", show: (p) => p.getAgeInYears() >= 12 }),
    quick("walk", "Go for a Walk", "vacation_park", 0, [1, 0, 1], "Around the block, or further.", { goal: "walk" }),
    quick("stretch", "Stretch and Breathe", "health_meditation", 0, [1, 0, 0], "Slow breaths. Eases work burnout.", { goal: "stretch", after: (p) => { try { const s = Illness.state(p); s.overwork = Math.max(0, s.overwork - 0.8); } catch { /* ignore */ } } }),
    quick("gratitude", "Gratitude List", "skill_selfhelp", 0, [0, 1, 1], "Three good things from this week.", { goal: "gratitude" }),
    quick("declutter", "Declutter Your Home", "skill_hygieneexpert", 0, [0, 0, 2], "One drawer at a time.", { goal: "declutter" }),
    quick("cry", "Have a Good Cry", "sanity_low", 0, [0, 0, 3], "Only when you need it (sanity under 30).", { show: (p) => { try { return p.getAttributeState().getSanity() < 30; } catch { return false; } } }),
    quick("bath", "Bubble Bath", "vacation_spa", 5, [0, 2, 0], "Candles optional.", { show: (p) => p.getAgeInYears() >= 3 }),
    quick("skincare", "Skincare Routine", "skill_hygieneexpert", 10, [0, 1, 0], "Cleanse, tone, glow.", { show: (p) => p.getAgeInYears() >= 12 }),
    quick("meal", "Cook a Healthy Meal", "skill_homechef", 15, [2, 0, 0], "Vegetables, even.", { goal: "meal", show: (p) => p.getAgeInYears() >= 12, after: (p) => { try { const h: any = Hobbies.peek("cooking", p); if (h) h.skill = Math.min(100, (h.skill ?? 0) + 1); } catch { /* ignore */ } } }),
    quick("haircut", "Get a Haircut", "vacation_spa", 40, [0, 1, 0], "A fresh look.", { show: (p) => p.getAgeInYears() >= 12 }),
    quick("treat", "Treat Yourself", "inappnotification_gift", 0, [0, 0, 0], "Something small, or something big. You pick.", { show: (p) => p.getAgeInYears() >= 12, after: (p) => { SelfCare.treatMenu(p); } }),
    quick("makeover", "Get a Makeover", "vacation_spa", 300, [0, 2, 1], "Once a year: hair, clothes, the works.", { show: (p) => p.getAgeInYears() >= 16, lock: (p) => (SelfCare.state(p).makeoverYear === Math.floor(SelfCare.now(p) / WPY) ? "Once a year" : SelfCare.weekLock("makeover", p)), after: (p) => { SelfCare.state(p).makeoverYear = Math.floor(SelfCare.now(p) / WPY); return "You barely recognised yourself. In a good way."; } }),
    quick("mentalDay", "Mental Health Day", "health_meditation", 0, [0, 1, 4], "A day of paid leave, just for you. Burnout drops by a quarter.", { show: (p) => Work.job(p) != null, lock: (p) => Benefits.leaveLock(p) ?? SelfCare.weekLock("mentalDay", p), after: (p) => { Benefits.useLeave(p, 0.2); try { const s = Illness.state(p); s.overwork = Math.max(0, s.overwork * 0.75); } catch { /* ignore */ } } }),
];

// ------------------------------------------------------------------ care
const careCost = (p: any, n: number) => Math.round(n * Illness.payShare(p));
const injuries = ["sprainedAnkle", "brokenArm", "brokenLeg", "backInjury"];
export const CARE: LifeActionDef[] = [
    { id: "sc_dentist", title: "Dentist Cleaning", image: "health_doctorvisit", instant: true, mods: [1, 0, 0], show: (p) => p.getAgeInYears() >= 3 && !Vampire.isVampire(p),
        cost: () => (Subscriptions.on("dentalVision", player()) ? 0 : careCost(player(), 100)), lock: (p) => (SelfCare.now(p) - SelfCare.state(p).dentist < 26 ? "Twice a year" : null),
        note: () => "+1 health, and a nice smile. Twice a year.\n", run: (p) => { SelfCare.state(p).dentist = SelfCare.now(p); SelfCare.count("dentist", p); } },
    { id: "sc_eyes", title: "Eye Exam", image: "health_doctorvisit", instant: true, mods: [0, 1, 0], show: (p) => p.getAgeInYears() >= 6 && !Vampire.isVampire(p),
        cost: () => (Subscriptions.on("dentalVision", player()) ? 0 : careCost(player(), 80)), lock: (p) => (SelfCare.now(p) - SelfCare.state(p).eyes < WPY ? "Once a year" : null),
        note: () => "Glasses if you need them, and Pink Eye gets caught early.\n",
        run: (p) => { SelfCare.state(p).eyes = SelfCare.now(p); const x = Illness.list(p).find((i) => i.id === "pinkEye"); if (x) { Illness.cure(p, x, "cured at an eye exam"); Work.say("Eye Exam", "The optometrist spotted your Pink Eye and sorted it out.", "health_doctorvisit"); } } },
    { id: "sc_physio", title: "Physical Therapy", image: "health_workout", instant: true, mods: [1, 0, 0],
        show: (p) => Illness.known(p).some((x) => injuries.includes(x.id)), cost: () => careCost(player(), 120), lock: (p) => SelfCare.weekLock("physio", p),
        note: () => "Your injury heals 2 weeks faster each session. Once a week.\n",
        run: (p) => { SelfCare.mark("physio", p); for (const x of Illness.list(p)) if (injuries.includes(x.id) && x.left != null) { x.left = Math.max(0, x.left - 2); if (x.left <= 0) Illness.cure(p, x, "healed with physical therapy"); } } },
    { id: "sc_chiro", title: "Chiropractor", image: "health_doctorvisit", instant: true, mods: [1, 0, 1],
        show: (p) => Illness.known(p).some((x) => x.id === "backInjury" || x.id === "arthritis"), cost: () => careCost(player(), 80), lock: (p) => SelfCare.weekLock("chiro", p),
        note: () => "Eases a bad back or arthritis this week.\n", run: (p) => { SelfCare.mark("chiro", p); } },
    { id: "sc_acupuncture", title: "Acupuncture", image: "health_meditation", instant: true, mods: [0, 0, 2], show: (p) => p.getAgeInYears() >= 16 && !Vampire.isVampire(p),
        cost: () => careCost(player(), 90), lock: (p) => SelfCare.weekLock("acupuncture", p),
        note: () => "+2 sanity. Eases migraines and arthritis this week.\n", run: (p) => { SelfCare.mark("acupuncture", p); if (Illness.known(p).some((x) => x.id === "migraines" || x.id === "arthritis")) attr(p, 1, 1, 0); } },
    { id: "sc_sleepClinic", title: "Sleep Clinic", image: "health_hospitalstay", instant: true, show: (p) => Illness.known(p).some((x) => x.id === "insomnia"),
        cost: () => careCost(player(), 400), lock: (p) => SelfCare.weekLock("sleepClinic", p),
        note: () => "An overnight study. Usually fixes insomnia (3 in 4 times).\n",
        run: (p) => { SelfCare.mark("sleepClinic", p); const x = Illness.list(p).find((i) => i.id === "insomnia"); const ok = x && roll(0.75); if (ok) Illness.cure(p, x!, "cured at a sleep clinic"); Work.say("Sleep Clinic", ok ? "They found the problem. You slept 9 hours that night." : "Not this time. Try again in a week.", "health_hospitalstay"); } },
    { id: "sc_support", title: () => (SelfCare.state().group ? "Support Group (going)" : "Join a Support Group"), image: "family", instant: true, show: (p) => p.getAgeInYears() >= 12,
        actionTitle: () => (SelfCare.state().group ? "Stop" : "Join"),
        note: () => (SelfCare.state().group ? `Your ${SelfCare.state().group} group meets every week: +2 sanity.\n` : "Free. People who've been there too: +2 sanity every week you go.\n"),
        run: (p) => {
            const s = SelfCare.state(p);
            if (s.group) { s.group = null; return; }
            Work.menu("Support Group", "Which group?", "family", ["grief", "divorce", "illness", "new parents"].map((g) => [g[0].toUpperCase() + g.slice(1), () => { s.group = g; return "Everyone said hello. You're not alone in this."; }] as [string, () => string]).concat([["Never mind", () => ""]]));
        } },
];


// ------------------------------------------------------------------ moments
const C = (m: Moment): Moment => ({ weight: 1, ...m, when: (p) => !Vampire.isVampire(p) && (m.when ? m.when(p) : true) });
export const CARE_MOMENTS: Moment[] = [
    C({ id: "sc_exhausted", title: "You Look Exhausted", image: "sanity_low", min: 16, max: 120, when: (p) => { try { return p.getAttributeState().getSanity() < 45; } catch { return false; } }, make: (p) => {
        const f = Relationships.friends(p)[0];
        return { text: `${f ? f.getFirstName() : "A friend"} says you look completely worn out and offers to take you out for the afternoon.`, options: [
            ["Go", () => { attr(p, 0, 3, 4); if (f) f.setRelationshipProgress(Math.min(1000, f.getRelationshipProgress() + 30)); return "Lunch, a walk, a lot of laughing. You needed that."; }],
            ["Not today", () => { attr(p, 0, 0, 1); return "You stayed in and slept. Also fine."; }],
        ] };
    } }),
    C({ id: "sc_bodyWarning", title: "Your Body Is Talking", image: "health_low", min: 18, max: 120, when: (p) => { try { return p.getAttributeState().getHealth() < 40; } catch { return false; } }, make: (p) => ({
        text: "You get winded on the stairs and your back aches all the time. Something's got to give.",
        options: [
            ["Make a change", () => { SelfCare.setSleep("healthy", p); attr(p, 3, 0, 2); SelfCare.startGoal("walks", p); return "Healthy sleep, and a goal to walk more (Health › Self-Care). Small steps."; }],
            ["Ignore it", () => "You'll deal with it later. Probably."],
        ] }) }),
    C({ id: "sc_mall", title: "Retail Therapy", image: "inappnotification_gift", min: 14, max: 120, make: (p) => ({
        text: "Something in a shop window is calling your name. It's been a long week.",
        options: [
            ["Treat yourself ($80)", () => { if (cash(p) < 80) return "Your card said no. Window shopping it is."; pay(p, 80); attr(p, 0, 4, 1); return "It looks even better at home."; }],
            ["Walk on by", () => { attr(p, 0, 0, 1); return "Future you thanks present you."; }],
        ] }) }),
    C({ id: "sc_resolution", title: "New Year's Resolution", image: "skill_selfimprovement", min: 12, max: 120, seasons: ["winter"], make: (p) => ({
        text: "It's a new year. What's your resolution?",
        options: [
            ["Sleep better", () => { SelfCare.setSleep("healthy", p); SelfCare.startGoal("sleep", p); return "Lights out by eleven. You set a sleep goal (Health › Self-Care)."; }],
            ["Eat better", () => { SelfCare.startGoal("meals", p); return "You set a goal to cook 8 healthy meals."; }],
            ["Be kinder to yourself", () => { SelfCare.startGoal("gratitude", p); attr(p, 0, 1, 2); return "A goal: 8 gratitude lists. Starting with this one."; }],
        ] }) }),
    C({ id: "sc_kindness", title: "A Stranger's Kindness", image: "family", min: 10, max: 120, make: (p) => ({
        text: "A stranger in line pays for your coffee and says, \"Have a good one.\"",
        options: [
            ["Pay it forward", () => { pay(p, 5); attr(p, 0, 3, 2); return "You bought the next person's. It felt great."; }],
            ["Smile and say thanks", () => { attr(p, 0, 2, 1); return "It made your whole day."; }],
        ] }) }),
    C({ id: "sc_insomniaNight", title: "Wide Awake at 3 a.m.", image: "sanity_low", min: 14, max: 120, when: (p) => SelfCare.sleep(p) === "little", make: (p) => ({
        text: "Staring at the ceiling again.",
        options: [
            ["Get up and read", () => { attr(p, 0, 1, 1); return "Two chapters in, you finally dozed off."; }],
            ["Scroll your phone", () => { attr(p, 0, 0, -2); return "It's 5 a.m. and you know a lot about otters now."; }],
        ] }) }),
    C({ id: "sc_spaDay", title: "A Spa Voucher", image: "vacation_spa", min: 16, max: 120, make: (p) => ({
        text: "You won a spa voucher in a raffle you forgot you entered.",
        options: [
            ["Use it now", () => { attr(p, 1, 3, 4); return "Robes, cucumbers, silence. Bliss."; }],
            ["Give it to someone who needs it more", () => { const f = Relationships.friends(p)[0]; if (f) f.setRelationshipProgress(Math.min(1000, f.getRelationshipProgress() + 60)); attr(p, 0, 2, 1); return `${f ? f.getFirstName() : "Your friend"} almost cried.`; }],
        ] }) }),
    C({ id: "sc_rainyDay", title: "A Rainy Sunday", image: "health_meditation", min: 8, max: 120, make: (p) => ({
        text: "Rain on the windows and nowhere you have to be.",
        options: [
            ["Blanket, tea, a good book", () => { attr(p, 0, 2, 3); return "The best kind of nothing."; }],
            ["Clean the whole house", () => { attr(p, 0, 1, 2); SelfCare.count("declutter", p); return "It sparkles. So do you."; }],
        ] }) }),
    C({ id: "sc_burnoutTalk", title: "Running on Empty", image: "sanity_low", min: 18, max: 120, when: (p) => Work.job(p) != null && Work.burnout(p) >= 60, make: (p) => ({
        text: "You realise you haven't had a proper break in months.",
        options: [
            ["Take a long weekend", () => { try { const s = Illness.state(p); s.overwork = Math.max(0, s.overwork - 3); } catch { /* ignore */ } attr(p, 1, 3, 4); return "Phone off, feet up. You came back a different person."; }],
            ["Push on", () => "Not yet. Soon."],
        ] }) }),
    C({ id: "sc_challenge", title: "Wellness Challenge", image: "health_workout", min: 14, max: 120, make: (p) => ({
        text: "A friend challenges you to a month of walking every week.",
        options: [
            ["Accept", () => { SelfCare.startGoal("walks", p); attr(p, 0, 1, 0); return "Game on. (A walking goal is on Health › Self-Care.)"; }],
            ["Maybe next month", () => "They'll ask again."],
        ] }) }),
];
