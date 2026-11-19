// Hobbies (v0.25.0, Leisure tab, ages 6+): eight things to get good at, a week at a time.
//
// Practice (one week, small cost) raises your skill 0–100 and lifts your mood. Levels: Beginner, Amateur (20),
// Skilled (45), Expert (70), Master (90); each new level gets a message. From Amateur on, every hobby has a way to show
// it off (sell a painting, play a gig, enter a cook-off, run a race…) once every 4 weeks — prizes and pay grow with skill.
// Skills never decay. State: Player.hobbies (undefined in older saves).
//
// Cross content: practising guitar also trains the Celebrity Life music skill; writing a book at Master level is a
// bestseller far more often if you're famous.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { Celebrity } from "../Lifepaths/Celebrity";

export interface HobbyState { skill: number; practiced: number; shows: number; lastShow: number; wins: number; earned: number }

export const LEVELS = [
    { name: "Beginner", min: 0 },
    { name: "Amateur", min: 20 },
    { name: "Skilled", min: 45 },
    { name: "Expert", min: 70 },
    { name: "Master", min: 90 },
];

type Show = { title: string | ((s: number) => string); note: (s: number) => string; run: (p: any, h: HobbyState) => string };
export interface HobbyDef {
    id: string; title: string; who: string; minAge: number; cost: number; image: any;
    mods: [number, number, number];   // health, happiness, sanity — per practice
    blurb: string;
    show: Show;
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const roll = (x: number) => Math.random() < x;
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const earn = (p: any, n: number, h: HobbyState) => {
    n = Math.round(n);
    if (n <= 0) return;
    MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
    h.earned = (h.earned ?? 0) + n;
};
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const lvl = (s: number) => Hobbies.levelOf(s);

export const HOBBIES: HobbyDef[] = [
    { id: "painting", title: "Painting", who: "painter", minAge: 6, cost: 15, image: R.drawable.work_artist, mods: [0, 4, 3],
        blurb: "Brushes, canvas and a lot of patience.",
        show: { title: "Sell a Painting", note: (s) => `Sells for about ${money(Hobbies.paintingPrice(s))}. Masters sometimes paint a masterpiece.`,
            run: (p, h) => {
                if (lvl(h.skill) >= 4 && roll(0.08)) { const n = rnd(60, 150) * 1000; earn(p, n, h); attr(p, 0, 15, 5); h.wins++; return `A collector called it a masterpiece and paid ${money(n)}!`; }
                const n = Hobbies.paintingPrice(h.skill) * (0.7 + Math.random() * 0.6); earn(p, n, h); attr(p, 0, 5, 2);
                return `Your painting sold for ${money(n)}.`;
            } } },
    { id: "guitar", title: "Guitar", who: "guitarist", minAge: 8, cost: 0, image: R.drawable.education_college_music, mods: [0, 4, 2],
        blurb: "Chords, calluses and late-night songs. Also trains your Celebrity Life music skill.",
        show: { title: (s) => (lvl(s) >= 3 ? "Headline a Bar Gig" : "Play an Open Mic"), note: (s) => `Tips and pay of about ${money(s * 25)}. Crowds love an Expert.`,
            run: (p, h) => {
                const n = h.skill * 25 * (0.6 + Math.random() * 0.8); earn(p, n, h); attr(p, 0, 7, 2);
                if (Celebrity.fans(p) > 0 || roll(0.3)) Celebrity.addFans(p, 50 + h.skill * 5);
                return `${lvl(h.skill) >= 3 ? "The bar was packed" : "The crowd clapped along"}. You made ${money(n)}.`;
            } } },
    { id: "cooking", title: "Cooking", who: "cook", minAge: 10, cost: 30, image: R.drawable.skill_homechef, mods: [2, 3, 1],
        blurb: "Recipes, knife skills and feeding everyone you love.",
        show: { title: "Enter a Cook-off", note: (s) => `${Math.round(Hobbies.winChance(s) * 100)}% chance to win ${money(Hobbies.prize(s))}.`,
            run: (p, h) => {
                if (roll(Hobbies.winChance(h.skill))) { const n = Hobbies.prize(h.skill); earn(p, n, h); attr(p, 0, 10, 3); h.wins++; return `Your dish won first place: ${money(n)} and a shiny trophy.`; }
                attr(p, 0, 2, 0); return "The judges liked it, but someone else's dish won. Next time.";
            } } },
    { id: "gardening", title: "Gardening", who: "gardener", minAge: 6, cost: 10, image: R.drawable.business_farm_new, mods: [1, 2, 4],
        blurb: "Dirt under your nails and the calmest mind in town.",
        show: { title: "Sell at the Farmers' Market", note: (s) => `Sales of about ${money(s * 15)}.`,
            run: (p, h) => { const n = h.skill * 15 * (0.7 + Math.random() * 0.6); earn(p, n, h); attr(p, 1, 4, 3); return `You sold out of vegetables and flowers: ${money(n)}.`; } } },
    { id: "running", title: "Running", who: "runner", minAge: 8, cost: 0, image: R.drawable.health_workout, mods: [3, 2, 1],
        blurb: "One more mile. Great for your health.",
        show: { title: (s) => Hobbies.race(s), note: (s) => `${Hobbies.race(s)}: +health and a medal. Masters can win prize money.`,
            run: (p, h) => {
                attr(p, 5, 8, 3);
                const race = Hobbies.race(h.skill);
                if (lvl(h.skill) >= 4 && roll(0.25)) { const n = rnd(5, 25) * 1000; earn(p, n, h); h.wins++; return `You won the ${race}! ${money(n)} in prize money.`; }
                return `You finished the ${race} and got your medal. Your legs disagree.`;
            } } },
    { id: "chess", title: "Chess & Board Games", who: "player", minAge: 6, cost: 0, image: R.drawable.random, mods: [0, 2, 4],
        blurb: "Openings, endgames and game nights.",
        show: { title: "Play in a Tournament", note: (s) => `${Math.round(Hobbies.winChance(s) * 100)}% chance to win ${money(Hobbies.prize(s) / 2)}. Masters can earn a title.`,
            run: (p, h) => {
                if (roll(Hobbies.winChance(h.skill))) {
                    const n = Hobbies.prize(h.skill) / 2; earn(p, n, h); attr(p, 0, 8, 6); h.wins++;
                    return lvl(h.skill) >= 4 && h.wins >= 3 ? `You won again (${money(n)}). People are calling you a Grandmaster.` : `You won the tournament: ${money(n)}.`;
                }
                attr(p, 0, -2, 2); return "You lost a close final. You'll be thinking about that move for a week.";
            } } },
    { id: "writing", title: "Writing", who: "writer", minAge: 10, cost: 0, image: R.drawable.sidehustle_author, mods: [0, 2, 4],
        blurb: "Stories, poems, maybe a novel one day.",
        show: { title: (s) => (lvl(s) >= 4 ? "Publish a Novel" : "Submit a Story"), note: (s) => (lvl(s) >= 4 ? "A real book. Bestsellers pay big (more often if you're famous)." : `${Math.round(Hobbies.winChance(s) * 100)}% chance a magazine buys it.`),
            run: (p, h) => {
                if (lvl(h.skill) >= 4) {
                    const best = 0.15 + Math.min(0.35, Celebrity.tier(p) * 0.06);
                    if (roll(best)) { const n = rnd(100, 400) * 1000; earn(p, n, h); attr(p, 0, 15, 5); h.wins++; return `Your novel is a bestseller! ${money(n)} in sales.`; }
                    const n = rnd(5, 20) * 1000; earn(p, n, h); attr(p, 0, 6, 3); return `Your novel came out. Modest sales: ${money(n)}.`;
                }
                if (roll(Hobbies.winChance(h.skill))) { const n = h.skill * 30; earn(p, n, h); attr(p, 0, 7, 3); h.wins++; return `A magazine bought your story for ${money(n)}.`; }
                attr(p, 0, -2, 0); return "A polite rejection letter. Every writer has a drawer full of them.";
            } } },
    { id: "gaming", title: "Gaming", who: "gamer", minAge: 8, cost: 0, image: R.drawable.vacation_videogames, mods: [-1, 5, 1],
        blurb: "Ranked matches until 3am. Experts enter esports tournaments.",
        show: { title: (s) => (lvl(s) >= 3 ? "Esports Tournament" : "Stream Your Games"), note: (s) => (lvl(s) >= 3 ? `${Math.round(Hobbies.winChance(s) * 100)}% chance to win ${money(Hobbies.prize(s))}.` : `Viewer tips of about ${money(s * 8)}.`),
            run: (p, h) => {
                if (lvl(h.skill) >= 3) {
                    if (roll(Hobbies.winChance(h.skill))) { const n = Hobbies.prize(h.skill); earn(p, n, h); attr(p, 0, 10, 2); h.wins++; return `Your team won the tournament: ${money(n)}!`; }
                    attr(p, 0, -3, 0); return "Knocked out in the semifinals. Lag, obviously.";
                }
                const n = h.skill * 8 * (0.5 + Math.random()); earn(p, n, h); attr(p, 0, 4, 0); return `You streamed all week and made ${money(n)} in tips.`;
            } } },
];

export const Hobbies = {
    showEvery: 4,
    minAge: 6,
    def(id: string): HobbyDef { return HOBBIES.find((d) => d.id === id)!; },
    all(p: any = player()): Record<string, HobbyState> { return p.hobbies ?? (p.hobbies = {}); },
    state(id: string, p: any = player()): HobbyState {
        const all = Hobbies.all(p);
        return all[id] ?? (all[id] = { skill: 0, practiced: 0, shows: 0, lastShow: -999, wins: 0, earned: 0 });
    },
    peek(id: string, p: any = player()): HobbyState | null { return p?.hobbies?.[id] ?? null; },
    skill(id: string, p: any = player()): number { return Hobbies.peek(id, p)?.skill ?? 0; },
    levelOf(skill: number): number { let l = 0; LEVELS.forEach((x, i) => { if (skill >= x.min) l = i; }); return l; },
    levelName(skill: number): string { return LEVELS[Hobbies.levelOf(skill)].name; },
    /** Practice gains: fast at first, slower near the top. */
    gain(skill: number): number { return Math.max(2, Math.round(9 - skill / 14)); },
    paintingPrice(s: number): number { return Math.round(s * s * 2 + 50); },
    winChance(s: number): number { return Math.min(0.85, 0.1 + s / 130); },
    prize(s: number): number { return [0, 500, 2500, 10000, 30000][Hobbies.levelOf(s)]; },
    race(s: number): string { return ["Fun Run", "5K Race", "Half Marathon", "Marathon", "Ultramarathon"][Hobbies.levelOf(s)]; },
    now(p: any): number { try { return p.getTrueAgeInWeeks(); } catch { return 0; } },
    weeksToShow(id: string, p: any = player()): number {
        const h = Hobbies.peek(id, p);
        if (h == null) return 0;
        return Math.max(0, Hobbies.showEvery - (Hobbies.now(p) - (h.lastShow ?? -999)));
    },
    /** Add skill (practice, life moments). Shows a message on reaching a new level. */
    addSkill(id: string, n: number, p: any = player()): number {
        const d = Hobbies.def(id), h = Hobbies.state(id, p);
        const before = Hobbies.levelOf(h.skill);
        h.skill = Math.max(0, Math.min(100, h.skill + n));
        const after = Hobbies.levelOf(h.skill);
        if (after > before) {
            const unlock = before === 0 ? ` You can ${titleOf(d.show, h.skill).toLowerCase()} now (once every ${Hobbies.showEvery} weeks).` : after === 4 ? " Nobody does it better." : "";
            Hobbies.alert(`${LEVELS[after].name} ${d.who[0].toUpperCase() + d.who.slice(1)}`, `Your ${d.title.toLowerCase()} skill reached ${LEVELS[after].name} (${Math.floor(h.skill)}).${unlock}`, d.image);
        }
        return h.skill;
    },
    /** Why you can't practice, or null. */
    blocked(d: HobbyDef, p: any = player()): string | null {
        if (p.getAgeInYears() < d.minAge) return `Must be at least ${d.minAge} years old`;
        try { if (p.getCrimeState().getIsInJail()) return "Not while you're in jail"; } catch { /* ignore */ }
        return null;
    },
    practice(id: string, p: any = player()): boolean {
        const d = Hobbies.def(id);
        if (Hobbies.blocked(d, p) != null) return false;
        if (d.cost > 0 && p.getMoneyState().getCash().compareTo(BigInteger.valueOf(d.cost)) < 0) return false;
        const h = Hobbies.state(id, p);
        if (d.cost > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(d.cost), MoneyUpdateType.directSpend, null, null, 12, null);
        attr(p, d.mods[0], d.mods[1], d.mods[2]);
        h.practiced++;
        Hobbies.addSkill(id, Hobbies.gain(h.skill) + (Math.random() < 0.3 ? 1 : 0), p);
        if (id === "guitar") { try { if (p.getAgeInYears() >= 6) Celebrity.train(p, "music", 1); } catch { /* ignore */ } }
        p.applyWeekly();
        return true;
    },
    canShow(id: string, p: any = player()): string | null {
        const d = Hobbies.def(id), h = Hobbies.peek(id, p);
        if (h == null || h.skill < LEVELS[1].min) return `Reach Amateur (${LEVELS[1].min}) first`;
        const b = Hobbies.blocked(d, p);
        if (b) return b;
        const w = Hobbies.weeksToShow(id, p);
        return w > 0 ? `Again in ${w} week${w === 1 ? "" : "s"}` : null;
    },
    showOff(id: string, p: any = player()): string | null {
        if (Hobbies.canShow(id, p) != null) return null;
        const d = Hobbies.def(id), h = Hobbies.state(id, p);
        h.lastShow = Hobbies.now(p);
        h.shows++;
        const result = d.show.run(p, h);
        Hobbies.alert(titleOf(d.show, h.skill), result, d.image);
        p.applyWeekly();
        return result;
    },
    /** "Painting (Expert), Chess (Skilled)" — your hobbies at Amateur or better. */
    summary(p: any = player()): string {
        return HOBBIES.filter((d) => Hobbies.skill(d.id, p) >= LEVELS[1].min)
            .map((d) => `${d.title} (${Hobbies.levelName(Hobbies.skill(d.id, p))})`).join(", ");
    },
    alert(title: string, msg: string, image: any) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
    },
    shown(p: any = player()): boolean { return p.getAgeInYears() >= Hobbies.minAge; },
    cells(p: any = player()): ActionCellSingleViewModel[] {
        const out: ActionCellSingleViewModel[] = [];
        for (const d of HOBBIES) {
            out.push(ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(new PracticeCell(d) as any, null));
            if (Hobbies.skill(d.id, p) >= LEVELS[1].min) out.push(ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(new ShowCell(d) as any, null));
        }
        return out;
    },
};

const titleOf = (s: Show, skill: number) => (typeof s.title === "function" ? s.title(skill) : s.title);

/** "Painting · Skilled 52" with a Practice button (one week). */
class PracticeCell {
    constructor(public d: HobbyDef) {}
    h(): HobbyState | null { return Hobbies.peek(this.d.id); }
    getTitle(): string {
        const h = this.h();
        return h && h.skill > 0 ? `${this.d.title} · ${Hobbies.levelName(h.skill)} ${Math.floor(h.skill)}` : this.d.title;
    }
    getImageId(): any { return this.d.image; }
    getCost(): BigInteger { return BigInteger.valueOf(this.d.cost); }
    getModifiers(): Modifiers { return new Modifiers(this.d.mods[0], this.d.mods[1], this.d.mods[2]); }
    getActionTitle(): string | null { return this.d.cost > 0 ? null : "Practice"; }
    getAdditionalDescription(): string {
        const h = this.h();
        const s = h?.skill ?? 0;
        const next = LEVELS[Hobbies.levelOf(s) + 1];
        const prog = h && h.skill > 0
            ? (next ? `Practice to reach ${next.name} at ${next.min}.` : "Master level. Keep it up for fun.")
            : `${this.d.blurb} Practice to reach Amateur at 20.`;
        return `${prog} Every practice: `;
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null { return Hobbies.blocked(this.d, p); }
    action(p: any): void { Hobbies.practice(this.d.id, p); }
}

/** The hobby's show-off action (Amateur and up). */
class ShowCell {
    constructor(public d: HobbyDef) {}
    skill(): number { return Hobbies.skill(this.d.id); }
    getTitle(): string { return titleOf(this.d.show, this.skill()); }
    getImageId(): any { return this.d.image; }
    getCost(): BigInteger { return BigInteger.valueOf(0); }
    getModifiers(): Modifiers { return new Modifiers(0, 0, 0); }
    getActionTitle(): string { return "Go"; }
    getAdditionalDescription(): string {
        const h = Hobbies.peek(this.d.id);
        const rec = h && h.shows ? ` So far: ${h.shows} time${h.shows === 1 ? "" : "s"}${h.wins ? `, ${h.wins} win${h.wins === 1 ? "" : "s"}` : ""}${h.earned ? `, ${money(h.earned)} earned` : ""}.` : "";
        return `${this.d.show.note(this.skill())}${rec}`;
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null { return Hobbies.canShow(this.d.id, p); }
    action(p: any): void { Hobbies.showOff(this.d.id, p); }
}
