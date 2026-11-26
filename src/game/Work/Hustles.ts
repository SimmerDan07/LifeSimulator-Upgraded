// v0.33.0 "The Career Overhaul", stage 5: side hustles, rebuilt.
//
// Ten small jobs you run on top of your main one. Each has one instant action a week (no week passes) that pays now
// and earns experience: 5 levels (Newbie → Pro, like the original). Books, apps and videos also build a back
// catalogue that pays a little every week. Up to 2 hustles at once (1 while you're Grinding at work). Rare big
// breaks pay out at the top levels.
// The original game's side hustles (App Developer, YouTube Star, DJ, Author, Actor) carry over at the same level,
// with their weekly royalties; acting moves into Celebrity Life as fans.
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Possession } from "../Enums/Possession";
import { Hobbies } from "../Managers/Hobbies";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Youth } from "../Youth/Youth";
import { Work, WorkDice, money } from "./Work";
import { CareerPath } from "./CareerPath";

export interface HustleDef {
    id: string; title: string; image: string; action: string; minAge: number;
    /** Pay per shift at level 1 (US dollars), grows with level. */
    pay: number; mods: [number, number, number];
    /** Builds a back catalogue that pays weekly. */
    catalogue?: number;
    needs: (p: any) => string | null;
    /** A skill, hobby or following that adds to each shift's pay (0–1). */
    boost?: (p: any) => number;
    startCost?: number;
    blurb: string;
}
export interface HustleState { xp: number; active: boolean; last: number; earned: number; shifts: number; catalogue: number; started: boolean }
export const HUSTLE_LEVELS = [{ name: "Newbie", min: 0 }, { name: "Amateur", min: 10 }, { name: "Intermediate", min: 30 }, { name: "Experienced", min: 60 }, { name: "Pro", min: 100 }];

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { roll, rnd, pick, clamp } = WorkDice;
const owns = (p: any, x: any) => { try { return p.getItemState().isOwned(x); } catch { return false; } };
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const earn = (p: any, n: number, why = "Side hustle") => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null); };
const spend = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null); };
const skill = (p: any, g: string) => CareerPath.skill(g, p);
const hobby = (p: any, id: string) => { try { return Hobbies.skill(id, p); } catch { return 0; } };
const licensed = (p: any) => !!Youth.peek(p)?.license || p.getAgeInYears() >= 25;

export const HUSTLES: HustleDef[] = [
    { id: "rideshare", title: "Rideshare Driver", image: "work_uber", action: "Drive a Few Shifts", minAge: 18, pay: 220, mods: [0, -1, -1],
        needs: (p) => (!owns(p, Possession.car) && !Work.hasPerk("car", p) ? "Needs a car" : !licensed(p) ? "Needs a driver's licence" : null), boost: (p) => (CareerPath.hasCert("cdl", p) ? 0.3 : 0),
        blurb: "Your car, your hours. Weekend nights pay best." },
    { id: "freelance", title: "Freelancer", image: "possession_computer_2", action: "Take a Gig", minAge: 16, pay: 260, mods: [0, 0, -1],
        needs: (p) => (Math.max(skill(p, "tech"), skill(p, "creative")) < 20 ? "Needs 20 Code or Creativity skill" : null),
        boost: (p) => Math.max(skill(p, "tech"), skill(p, "creative")) / 100,
        blurb: "Writing, design or code for clients. Your career skill makes you better (and it grows both ways)." },
    { id: "shop", title: "Online Shop", image: "work_retail", action: "Restock and Ship Orders", minAge: 14, pay: 150, mods: [0, 1, -1], startCost: 200,
        needs: () => null, boost: (p) => clamp(Math.log10(1 + Celebrity.fans(p)) / 8, 0, 0.8),
        blurb: "Things you make or resell. Fans and followers bring customers." },
    { id: "creator", title: "Content Creator", image: "sidehustle_youtube", action: "Post a Video", minAge: 13, pay: 60, mods: [0, 2, -1], catalogue: 12,
        needs: (p) => (!owns(p, Possession.videoEquipment) && p.getAgeInYears() < 16 ? "Needs video equipment (or a phone at 16)" : null),
        boost: (p) => clamp(Math.log10(1 + Celebrity.fans(p)) / 7, 0, 1),
        blurb: "Videos that keep earning. Every post wins a few fans (Celebrity Life)." },
    { id: "tutor", title: "Tutor", image: "work_teacher", action: "Teach a Few Students", minAge: 15, pay: 180, mods: [0, 1, 0],
        needs: (p) => ((Youth.peek(p)?.grades ?? 0) >= 80 || Tutor.hasDegree(p) ? null : "Needs good grades (80+) or a degree"), boost: (p) => (CareerPath.hasCert("teaching", p) ? 0.5 : 0),
        blurb: "Homework help, test prep, music theory. Kids remember good tutors." },
    { id: "petSitter", title: "Pet Sitter & Dog Walker", image: "vacation_park", action: "Walk the Dogs", minAge: 12, pay: 90, mods: [2, 2, 1],
        needs: () => null, blurb: "Fresh air, wet noses, steady cash." },
    { id: "flipper", title: "Flipper", image: "business_sell", action: "Flip Something", minAge: 16, pay: 0, mods: [0, 1, -1],
        needs: (p) => (cash(p) < 500 ? "Needs $500 to buy stock" : null),
        blurb: "Buy low at garage sales, sell high online. Sometimes you lose." },
    { id: "appDev", title: "App Developer", image: "sidehustle_appdeveloper", action: "Ship an Update", minAge: 14, pay: 80, mods: [0, 0, -2], catalogue: 25,
        needs: (p) => (!owns(p, Possession.laptop) ? "Needs a laptop" : skill(p, "tech") < 15 ? "Needs 15 Code skill" : null), boost: (p) => skill(p, "tech") / 80,
        blurb: "Apps that earn while you sleep. One might go viral." },
    { id: "dj", title: "DJ", image: "sidehustle_dj", action: "Play a Gig", minAge: 16, pay: 300, mods: [-1, 3, 0],
        needs: (p) => (!owns(p, Possession.turntable) ? "Needs a turntable" : null), boost: (p) => Math.max(hobby(p, "guitar"), skill(p, "creative")) / 100,
        blurb: "Weddings, clubs, the odd bar mitzvah. A residency is the dream." },
    { id: "author", title: "Author", image: "sidehustle_author", action: "Write a Chapter", minAge: 12, pay: 30, mods: [0, 1, 2], catalogue: 20,
        needs: (p) => (Math.max(hobby(p, "writing"), skill(p, "creative")) < 15 ? "Needs 15 Writing (hobby) or Creativity" : null), boost: (p) => Math.max(hobby(p, "writing"), skill(p, "creative")) / 60,
        blurb: "Every few chapters, a book: royalties for years. Maybe a bestseller." },
];
const Tutor = { hasDegree(p: any): boolean { try { return p.getCompletableActionState().getHasACollegeDegree(); } catch { return false; } } };

export const Hustles = {
    def(id: string): HustleDef | undefined { return HUSTLES.find((h) => h.id === id); },
    all(p: any = player()): Record<string, HustleState> {
        const w: any = Work.state(p);
        if (w.hustles == null) { w.hustles = {}; Hustles.convertOld(p, w.hustles); }
        return w.hustles;
    },
    st(id: string, p: any = player()): HustleState {
        const a = Hustles.all(p);
        return (a[id] ??= { xp: 0, active: false, last: -999, earned: 0, shifts: 0, catalogue: 0, started: false });
    },
    active(p: any = player()): HustleDef[] { const a = Hustles.all(p); return HUSTLES.filter((h) => a[h.id]?.active); },
    level(xp: number): number { let l = 0; HUSTLE_LEVELS.forEach((x, i) => { if (xp >= x.min) l = i; }); return l; },
    levelName(xp: number): string { return HUSTLE_LEVELS[Hustles.level(xp)].name; },
    limit(p: any = player()): number { return Work.job(p) != null && Work.state(p).effort === "grind" ? 1 : 2; },
    startBlock(d: HustleDef, p: any = player()): string | null {
        if (Hustles.st(d.id, p).active) return null;
        if (p.getAgeInYears() < d.minAge) return `From age ${d.minAge}`;
        if (p.getCrimeState?.().getIsInJail?.()) return "Not from prison";
        const n = d.needs(p); if (n) return n;
        if (Hustles.active(p).length >= Hustles.limit(p)) return Hustles.limit(p) === 1 ? "One at a time while you're Grinding at work" : "Two at a time at most";
        if (d.startCost && !Hustles.st(d.id, p).started && cash(p) < d.startCost) return `Costs ${money(d.startCost)} to start`;
        return null;
    },
    start(id: string, p: any = player()): string {
        const d = Hustles.def(id)!, s = Hustles.st(id, p);
        if (Hustles.startBlock(d, p) != null) return "";
        if (d.startCost && !s.started) spend(p, d.startCost);
        s.active = true; s.started = true;
        return `You started ${d.title.toLowerCase().startsWith("a") ? "" : "as a "}${d.title}. Once a week: ${d.action}.`;
    },
    stop(id: string, p: any = player()) { Hustles.st(id, p).active = false; },
    shiftLock(d: HustleDef, p: any = player()): string | null {
        const s = Hustles.st(d.id, p);
        if (s.last === Work.now(p)) return "Done this week";
        if (p.getCrimeState?.().getIsInJail?.()) return "Not from prison";
        const n = d.needs(p); if (n) return n;
        return null;
    },
    /** One shift: pay now, experience, maybe a catalogue item or a big break. */
    shift(id: string, p: any = player()): string {
        const d = Hustles.def(id)!, s = Hustles.st(id, p);
        s.last = Work.now(p); s.shifts++;
        const lvl = Hustles.level(s.xp);
        s.xp += 3 + (d.boost ? d.boost(p) * 2 : 0);
        let msg = "";
        let n = 0;
        if (d.id === "flipper") {
            const stake = Math.min(cash(p), 300 + lvl * 400);
            const r = roll(0.25 + lvl * 0.08) ? 1.4 + Math.random() * 0.8 : roll(0.3) ? 0.6 + Math.random() * 0.3 : 1.05 + Math.random() * 0.3;
            n = Math.round(stake * (r - 1));
            if (n >= 0) earn(p, n); else spend(p, -n);
            msg = n >= 0 ? pick([`A dusty lamp from a garage sale sold for a ${money(n)} profit.`, `Vintage sneakers: ${money(n)} profit.`, `A box of old comics: ${money(n)} profit.`]) : `That "antique" was from last year. You lost ${money(-n)}.`;
        } else {
            n = Math.round(d.pay * (1 + lvl * 0.55) * (1 + (d.boost ? d.boost(p) : 0)) * (0.85 + Math.random() * 0.3));
            earn(p, n);
            msg = `${d.action}: ${money(n)}.`;
        }
        s.earned += Math.max(0, n);
        if (d.catalogue && s.shifts % (d.id === "author" ? 6 : 3) === 0) {
            const add = Math.round(d.catalogue * (1 + lvl) * (1 + (d.boost ? d.boost(p) : 0)));
            s.catalogue += add;
            msg += ` ${d.id === "author" ? "Your book is out" : d.id === "appDev" ? "A new app is live" : "That one's doing numbers"}: +${money(add)} a week from now on.`;
        }
        if (d.id === "creator") { try { Celebrity.addFans(p, 50 + lvl * 120); } catch { /* ignore */ } }
        if (d.id === "freelance") { const g = skill(p, "tech") >= skill(p, "creative") ? "tech" : "creative"; CareerPath.addSkill(g, 0.3, p); }
        // a big break at the top
        if (lvl >= 3 && roll(0.03 + (lvl - 3) * 0.03)) {
            const big = Math.round(d.pay * rnd(20, 60) * (lvl - 1));
            earn(p, big);
            msg += ` ${pick(["Big break!", "Jackpot!", "It took off!"])} ${d.id === "author" ? "A bestseller" : d.id === "appDev" ? "Your app went viral" : d.id === "dj" ? "A festival booked you" : d.id === "creator" ? "A brand deal" : "A huge client"}: ${money(big)}.`;
            if (d.id === "creator" || d.id === "author" || d.id === "dj") { try { Celebrity.addFans(p, 5000 * lvl); } catch { /* ignore */ } }
        }
        const after = Hustles.level(s.xp);
        if (after > lvl) msg += ` You're now ${HUSTLE_LEVELS[after].name}!`;
        return msg;
    },
    /** Back catalogues pay every week (and slowly fade). */
    weekly(p: any) {
        let total = 0;
        for (const [, s] of Object.entries(Hustles.all(p))) {
            if (s.catalogue > 0) { total += s.catalogue; s.catalogue = Math.max(0, Math.round(s.catalogue * 0.995 * 100) / 100); }
        }
        if (total >= 1) earn(p, total);
    },
    catalogueTotal(p: any = player()): number { return Object.values(Hustles.all(p)).reduce((t, s) => t + s.catalogue, 0); },

    // ------------------------------------------------------------------ the original game's side hustles
    /** Same level and the same weekly royalties; acting goes to Celebrity Life as fans. Runs once. */
    convertOld(p: any, a: Record<string, HustleState>) {
        let states: any[] = [];
        try { states = Array.from(p.getSideHustleState().getStates() as any); } catch { return; }
        const map: Record<string, string> = { appDeveloper: "appDev", youTubeStar: "creator", DJ: "dj", author: "author" };
        for (const st of states) {
            const done = st.getCompletedProjects?.()?.length ?? 0;
            if (done <= 0) continue;
            const name = st.getType().name();
            const weekly = st.getWeeklyRevenue?.() ?? 0;
            if (name === "actor") { try { Celebrity.addFans(p, done * 2000); } catch { /* ignore */ } (a as any)._actorRoyalty = weekly; continue; }
            const id = map[name]; if (!id) continue;
            const old = st.getSkillLevel?.()?.getRaw?.() ?? 0;
            a[id] = { xp: HUSTLE_LEVELS[Math.min(4, old)].min, active: false, last: -999, earned: 0, shifts: done, catalogue: weekly, started: true };
        }
        const actor = (a as any)._actorRoyalty;
        if (actor) { a.creator ??= { xp: 0, active: false, last: -999, earned: 0, shifts: 0, catalogue: 0, started: true }; a.creator.catalogue += actor; delete (a as any)._actorRoyalty; }
    },
};
