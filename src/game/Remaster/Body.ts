// v0.36.0 The Remaster: Health basics. A fitness routine and fitness level, habits you choose (smoking, drinking)
// with real help to quit, and a family doctor who knows you. Food is grouped (Everyday, Cheap & Quick, Only Here)
// and home cooking with a chef's kitchen is better for you. Sleep and the rest of self-care stay in Self-Care.
// Vampires are immune to all of it. Nothing here can kill anyone (only health, happiness or sanity at zero can).
import { Rm, player, now, age, WPY, roll, pick, clamp, money, cash, pay, bill, Say, img, weeklyMods, isVampire, inJail } from "./Core";
import { Things } from "./Things";
import { Subscriptions } from "../Managers/Subscriptions";
import { Trait } from "../Enums/Trait";

export type RoutineId = "none" | "walks" | "yoga" | "running" | "swimming" | "gym" | "classes" | "team" | "athlete";
export interface Routine { id: RoutineId; title: string; target: number; weekly: number; mods: [number, number, number]; minAge: number; blurb: string; needs?: string }
export const ROUTINES: Routine[] = [
    { id: "none", title: "No Exercise", target: 10, weekly: 0, mods: [0, 0, 0], minAge: 0, blurb: "Your fitness slowly settles where it would anyway." },
    { id: "walks", title: "Daily Walks", target: 30, weekly: 0, mods: [0, 0.2, 0.3], minAge: 6, blurb: "Free, easy, good for your head." },
    { id: "yoga", title: "Yoga at Home", target: 40, weekly: 0, mods: [0, 0, 0.6], minAge: 10, blurb: "Flexibility and calm." },
    { id: "running", title: "Running", target: 55, weekly: 0, mods: [0, 0.2, 0.3], minAge: 10, blurb: "Free, and it gets easier." },
    { id: "swimming", title: "Swimming", target: 55, weekly: 10, mods: [0, 0.2, 0.3], minAge: 6, blurb: "Easy on the joints." },
    { id: "gym", title: "The Gym", target: 65, weekly: 0, mods: [0, 0.2, 0.2], minAge: 14, blurb: "Weights and machines.", needs: "a Gym Membership (Profile › Subscriptions) or a Home Gym" },
    { id: "classes", title: "Fitness Classes", target: 60, weekly: 0, mods: [0, 0.4, 0.3], minAge: 14, blurb: "Spin, HIIT and an instructor who shouts.", needs: "a Fitness Class Pass (Profile › Subscriptions)" },
    { id: "team", title: "A Sports Team", target: 60, weekly: 15, mods: [0, 0.6, 0.2], minAge: 8, blurb: "Weekly games, team-mates and a pint after." },
    { id: "athlete", title: "Athlete Training", target: 90, weekly: 60, mods: [0, 0.2, -0.2], minAge: 14, blurb: "Twice a day with a coach. Needs fitness 60 to start.", needs: "fitness 60" },
];

export interface BodyState {
    v: number; fit: number; routine: RoutineId;
    smoker: boolean; smokeSince: number; quitting: null | { how: "patches" | "program"; until: number; odds: number }; quitTries: number; quit: number;
    drink: "none" | "social" | "heavy"; soberTries: number;
    doctor: string | null; doctorVisits: number; lastAdvice: number;
}

const DOCTORS = ["Patel", "Okafor", "Nguyen", "García", "Kowalski", "Chen", "Haddad", "Morales", "Fischer", "Larsen", "Mensah", "Romano", "Silva", "Tanaka", "Ivanova", "O'Brien"];

export const Body = {
    st(p: any = player()): BodyState {
        const b = Rm.st(p).body as BodyState;
        if (b.v == null) Object.assign(b, { v: 1, fit: Body.startFit(p), routine: "none", smoker: false, smokeSince: 0, quitting: null, quitTries: 0, quit: 0, drink: "none", soberTries: 0, doctor: null, doctorVisits: 0, lastAdvice: -999 } as BodyState);
        return b;
    },
    peek(p: any = player()): BodyState | null { const b = p?.rm?.body; return b?.v ? b : null; },
    startFit(p: any): number { const a = age(p); return a < 12 ? 35 : a < 30 ? 30 : a < 50 ? 25 : 18; },
    shown(p: any = player()): boolean { return !isVampire(p) && age(p) >= 6; },

    // ------------------------------------------------------------------ fitness
    routine(p: any = player()): Routine { return ROUTINES.find((r) => r.id === Body.st(p).routine) ?? ROUTINES[0]; },
    routineLock(p: any, r: Routine): string | null {
        if (age(p) < r.minAge) return `Ages ${r.minAge}+`;
        if (r.id === "gym" && !Subscriptions.has("gym", p) && !Things.has("homeGym", p)) return "Needs a Gym Membership or a Home Gym";
        if (r.id === "classes" && !Subscriptions.has("fitnessPass", p)) return "Needs a Fitness Class Pass";
        if (r.id === "athlete" && Body.st(p).fit < 60 && Body.st(p).routine !== "athlete") return "Needs fitness 60";
        if (inJail(p) && !["none", "walks", "yoga", "running"].includes(r.id)) return "Not in prison";
        return null;
    },
    setRoutine(p: any, id: RoutineId): string {
        const r = ROUTINES.find((x) => x.id === id)!;
        const lock = Body.routineLock(p, r);
        if (lock) return lock;
        Body.st(p).routine = id;
        return id === "none" ? "You stopped exercising. You'll keep what you built for a while." : `${r.title} it is. ${r.blurb}`;
    },
    target(p: any): number {
        const r = Body.routine(p);
        let t = r.target + Things.boost(p, "fit") * 3;
        const a = age(p);
        if (a > 60) t -= (a - 60) * 0.8;
        if (a < 6) t = 35;
        try { if (p.getTraitState().getTraits().contains(Trait.sickly)) t -= 8; } catch { /* */ }
        return clamp(t, 5, 100);
    },
    fitTitle(f: number): string { return f >= 85 ? "Athletic" : f >= 65 ? "Fit" : f >= 45 ? "Active" : f >= 25 ? "Average" : "Out of Shape"; },
    /** Weekly health from your fitness (the bonus you keep only while you're fit). */
    fitHealth(p: any): number { const f = Body.st(p).fit; return Math.round(((f - 25) / 30) * 10) / 10; },
    fitReducesIllness(p: any): boolean { const b = Body.peek(p); return !!b && b.fit >= 50; },

    // ------------------------------------------------------------------ habits
    smokeLock(p: any): string | null { return age(p) < 18 ? "Ages 18+" : null; },
    startSmoking(p: any): string { const b = Body.st(p); b.smoker = true; b.smokeSince = now(p); b.quitting = null; return "You bought your first pack. It calms you down, and it'll cost you."; },
    quitOdds(p: any, base: number): number {
        let o = base;
        try { const t = p.getTraitState().getTraits(); if (t.contains(Trait.evenTempered)) o += 0.1; if (t.contains(Trait.shortTempered)) o -= 0.1; if (t.contains(Trait.optimistic)) o += 0.05; } catch { /* */ }
        o += Math.min(0.15, Body.st(p).quitTries * 0.05);   // each try teaches you something
        return clamp(o, 0.05, 0.95);
    },
    quitSmoking(p: any, how: "cold" | "patches" | "program"): string {
        const b = Body.st(p);
        if (!b.smoker) return "";
        if (how === "cold") {
            b.quitTries++;
            if (roll(Body.quitOdds(p, 0.15))) { Body.quitDone(p); return "You threw the last pack away and never looked back. Cold turkey worked."; }
            weeklyMods(p, 0, -2, -3, "Trying to quit");
            return "Three days in, you cracked. Quitting cold turkey is hard; patches or a program help.";
        }
        if (how === "patches") { b.quitting = { how, until: now(p) + 8, odds: Body.quitOdds(p, 0.5) }; return "Nicotine patches for 8 weeks ($40 a week). You'll know if it worked when they run out."; }
        if (cash(p) < 300) return "Not enough cash";
        pay(p, 300);
        b.quitting = { how, until: now(p) + 6, odds: Body.quitOdds(p, 0.75) };
        return "A 6-week quit program: counselling, a support group and medication.";
    },
    quitDone(p: any) { const b = Body.st(p); b.smoker = false; b.quitting = null; b.quit = now(p); Rm.mark(p, "quitSmoking"); },
    setDrink(p: any, d: "none" | "social" | "heavy"): string {
        const b = Body.st(p);
        if (d !== "none" && age(p) < 18) return "Ages 18+";
        if (b.drink === "heavy" && d !== "heavy") return "Heavy drinking is hard to step back from: try a support group or rehab.";
        b.drink = d;
        return d === "none" ? "You've stopped drinking." : d === "social" ? "A drink or two with friends at the weekend." : "Most nights end with a drink, or several.";
    },
    getSober(p: any, how: "group" | "rehab"): string {
        const b = Body.st(p);
        if (b.drink !== "heavy") return "";
        b.soberTries++;
        if (how === "rehab") { if (cash(p) < 5000) return "Not enough cash"; pay(p, 5000); }
        const odds = how === "rehab" ? Body.quitOdds(p, 0.8) : Body.quitOdds(p, 0.45);
        if (roll(odds)) { b.drink = "none"; Rm.mark(p, "sober"); return how === "rehab" ? "Thirty days away, and you came home clear-headed. You're sober." : "One day at a time. With the group behind you, you're sober."; }
        weeklyMods(p, 0, -2, -2, "A slip");
        return "You slipped. It happens; trying again often works.";
    },

    // ------------------------------------------------------------------ your doctor
    doctor(p: any = player()): string { const b = Body.st(p); if (!b.doctor) b.doctor = "Dr. " + pick(DOCTORS); return b.doctor; },
    advice(p: any): string[] {
        const b = Body.st(p), out: string[] = [];
        const attrs = p.getAttributeState();
        if (b.smoker) out.push("Stop smoking: it triples your risk of heart and lung disease.");
        if (b.drink === "heavy") out.push("Cut back on drinking: your liver is working overtime.");
        if (b.fit < 25) out.push("Move more: even daily walks add years.");
        else if (b.fit >= 65) out.push("Your fitness is excellent. Keep it up.");
        try { const diet = p.getDiet().name(); if (["fastfood", "cupnoodle", "scavenge"].includes(diet)) out.push("Eat better: the food you're living on is hard on your heart."); } catch { /* */ }
        if (attrs.getSanity() < 40) out.push("You seem stressed. Self-Care (sleep, a therapist) would help.");
        if (attrs.getHappiness() < 35) out.push("If you feel low for a long time, talking to someone helps.");
        if (age(p) >= 40) out.push("At your age, a checkup once a year catches things early.");
        if (!out.length) out.push("You're doing everything right.");
        return out;
    },

    // ------------------------------------------------------------------ the week
    collectWeeklyValues(p: any) {
        if (!Body.shown(p)) return;
        const b = Body.st(p);
        const r = Body.routine(p);
        if (r.weekly > 0) bill(p, r.weekly, r.title);
        let h = Body.fitHealth(p), hap = r.mods[1], san = r.mods[2];
        // home cooking with good kit
        try { const diet = p.getDiet().name(); if (["homeCooking", "balanced", "basic", "vegan"].includes(diet)) h += Things.boost(p, "cook") * 0.25; } catch { /* */ }
        h += Things.boost(p, "sleep") * 0.15; san += Things.boost(p, "sleep") * 0.1;
        if (b.smoker) { h -= 0.6; san += 0.4; bill(p, 35, "Cigarettes"); }
        if (b.quitting?.how === "patches") bill(p, 40, "Nicotine patches");
        if (b.drink === "social") { hap += 0.6; bill(p, 25, "Drinks"); }
        if (b.drink === "heavy") { hap += 1; h -= 1; san -= 0.8; bill(p, 70, "Drinks"); }
        // a new baby at home: night feeds
        try { if ((Array.from(p.getFamilyState().getAliveChildren() as any) as any[]).some((c) => !c.getNotYetBorn() && c.getAgeInYears() < 1)) san -= 0.5; } catch { /* */ }
        if (Math.abs(h) + Math.abs(hap) + Math.abs(san) > 0.01) weeklyMods(p, Math.round(h * 10) / 10, Math.round(hap * 10) / 10, Math.round(san * 10) / 10, "Fitness and habits");
    },
    afterWeek(p: any) {
        if (!Body.shown(p)) return;
        const b = Body.st(p);
        const t = Body.target(p);
        b.fit = clamp(b.fit + (t - b.fit) * (b.fit < t ? 0.03 : 0.015), 0, 100);
        if (b.routine === "athlete" && b.fit < 50) { b.routine = "gym"; if (Body.routineLock(p, ROUTINES.find((x) => x.id === "gym")!)) b.routine = "running"; }
        if ((b.routine === "gym" || b.routine === "classes") && Body.routineLock(p, Body.routine(p))) b.routine = "running";
        // the Illness system counts smoking and drinking
        try { const il = p.illness; if (il) { if (b.smoker) il.smokes = (il.smokes ?? 0) + 1; else if ((il.smokes ?? 0) > 0 && b.quit) il.smokes = Math.max(0, il.smokes - 1); if (b.drink === "heavy") il.drinks = (il.drinks ?? 0) + 2; } } catch { /* */ }
        if (b.quitting && now(p) >= b.quitting.until) {
            const q = b.quitting; b.quitTries++;
            if (roll(q.odds)) { Body.quitDone(p); Say.milestone("You Quit Smoking", "You haven't had a cigarette in weeks, and you don't want one. Your lungs are already thanking you.", img("icon_rm_habits")); }
            else { b.quitting = null; Say.result("Back to Smoking", "When the program ended, the cravings won. Each try makes the next one more likely to work.", img("icon_rm_habits")); }
        }
        // the team: sometimes a team-mate becomes a friend
        if (b.routine === "team" && roll(0.03)) Body.teamFriend?.(p);
        // a reminder from your doctor (40+, no checkup in two years)
        try { const il = p.illness; if (age(p) >= 40 && b.doctor && il && now(p) - (il.checkupWeek ?? -999) > 2 * WPY() && now(p) - b.lastAdvice > 2 * WPY()) { b.lastAdvice = now(p); Say.note("A Letter from Your Doctor", `${b.doctor} hasn't seen you in two years and would like a checkup (Health › Doctor).`, img("health_doctorvisit")); } } catch { /* */ }
    },
    /** Set at install: a team-mate becomes a friend. */
    teamFriend: null as ((p: any) => void) | null,
    inherit(_parent: any, _heir: any) { /* habits are your own */ },
};
