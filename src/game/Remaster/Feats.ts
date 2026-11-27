// v0.36.0 The Remaster: achievements. 63 new ones in groups (alongside the original 15), saved across all your
// lives in a gallery with progress, and head starts they unlock for new lives (small and optional).
import { Rm, player, now, age, WPY, money, num, cash, Say, img, isVampire } from "./Core";
import { GameStateManager } from "../Managers/GameStateManager";
import { Bank } from "./Bank";
import { Things } from "./Things";
import { Body } from "./Body";
import { Fun } from "./Fun";
import { THING_BY_ID } from "./ThingsData";
import { Possession } from "../Enums/Possession";
import { Trait } from "../Enums/Trait";

export type FeatGroup = "life" | "family" | "love" | "work" | "money" | "things" | "health" | "care" | "world" | "fame" | "crime" | "vampire";
export const FEAT_GROUPS: { id: FeatGroup; title: string }[] = [
    { id: "life", title: "Life" }, { id: "family", title: "Family" }, { id: "love", title: "Love" }, { id: "work", title: "Career" },
    { id: "money", title: "Money" }, { id: "things", title: "Things" }, { id: "health", title: "Health" }, { id: "care", title: "Self-Care" },
    { id: "world", title: "World" }, { id: "fame", title: "Fame" }, { id: "crime", title: "Crime" }, { id: "vampire", title: "Vampire" },
];
export interface FeatDef { id: string; group: FeatGroup; title: string; blurb: string; image: string; fallback: string; test?: (p: any) => boolean; progress?: (p: any) => [number, number]; start?: string }

// ---------------------------------------------------------------- small readers (all defensive)
const T = (f: () => any, d: any = 0) => { try { const v = f(); return v ?? d; } catch { return d; } };
const kids = (p: any): any[] => T(() => (Array.from(p.getFamilyState().getAliveChildren() as any) as any[]).filter((c) => !c.getNotYetBorn()), []);
const fam = (p: any): any[] => T(() => Array.from(p.getFamilyState().getFamilyMembers() as any) as any[], []);
const partner = (p: any) => T(() => p.getFamilyState().getPartner(), null);
const rel = (x: any) => T(() => x.getRelationship().name(), "");
const crime = (p: any) => T(() => p.crime, null);
const vamp = (p: any) => T(() => p.vampire, null);
const rb = (p: any) => T(() => p.vampire?.rb, null);
const W = () => WPY();
const worth = (p: any) => T(() => Bank.netWorth(p), 0);
const marks = (p: any): Record<string, number> => Rm.st(p).feats.marks ?? (Rm.st(p).feats.marks = {});
const marked = (p: any, k: string) => (marks(p)[k] ?? 0) > 0;
const count = (n: number, need: number) => (): [number, number] => [Math.min(n, need), need];

const F = (id: string, group: FeatGroup, title: string, blurb: string, fallback: string, test: (p: any) => boolean, progress?: (p: any) => [number, number], start?: string): FeatDef =>
    ({ id, group, title, blurb, image: "feat_" + id.toLowerCase(), fallback, test, progress, start });

export const FEATS: FeatDef[] = [
    // life
    F("eighty", "life", "Eighty Candles", "Reach 80.", "achievement_old", (p) => age(p) >= 80, (p) => [Math.min(age(p), 80), 80]),
    F("sunny", "life", "Sunny Disposition", "Happiness 90+ at 50 or older.", "achievement_happy", (p) => age(p) >= 50 && T(() => p.getAttributeState().getHappiness()) >= 90),
    F("bucket", "life", "Bucket List", "Try 30 different things to do.", "vacation_park", (p) => Object.keys(Fun.peek(p)?.counts ?? {}).length >= 30, (p) => [Math.min(30, Object.keys(Fun.peek(p)?.counts ?? {}).length), 30]),
    F("habit", "life", "Creature of Habit", "Have 3 favourite things to do.", "achievement_happy", (p) => Fun.favourites(p).length >= 3, (p) => [Math.min(3, Fun.favourites(p).length), 3]),
    F("nextGen", "life", "The Next Generation", "Carry on as your child or childe.", "achievement_truelegacy", (p) => T(() => p.getGeneration()) >= 2, undefined, "strongFamily"),
    F("dynasty", "life", "Dynasty", "Reach the 5th generation.", "achievement_truelegacy", (p) => T(() => p.getGeneration()) >= 5, (p) => [Math.min(5, T(() => p.getGeneration(), 1)), 5]),
    // family
    F("fullHouse", "family", "Full House", "Three children at once.", "achievement_bigfamily", (p) => kids(p).length >= 3, (p) => [Math.min(3, kids(p).length), 3]),
    F("grandparent", "family", "Grandparent", "Hold your first grandchild.", "love_baby", (p) => fam(p).some((x) => /grand(child|son|daughter)/i.test(rel(x)) && x.getIsAlive())),
    F("collegeFund", "family", "College Fund", "A child gets their kids' fund at 18.", "education_masters", (p) => marked(p, "fundPaid")),
    F("petLover", "family", "Animal Lover", "Three pets at once.", "love_play", (p) => T(() => p.getFamilyState().getAlivePets().size()) >= 3, (p) => [Math.min(3, T(() => p.getFamilyState().getAlivePets().size())), 3]),
    F("closeKid", "family", "Best Parent Ever", "A child who loves you completely (1000).", "love_baby", (p) => kids(p).some((c) => T(() => c.getRelationshipProgress()) >= 990)),
    // love
    F("soulmates", "love", "Soulmates", "A partner who loves you completely (1000).", "love_marry", (p) => T(() => partner(p)?.getRelationshipProgress()) >= 990, undefined, "charm"),
    F("getaway", "love", "Romantic Getaway", "Take a trip with your partner.", "vacation_luxury", (p) => marked(p, "partnerTrip")),
    F("bigGift", "love", "Big Spender", "Give someone a gift worth $10,000 or more.", "love_propose", (p) => marked(p, "bigGift")),
    F("married", "love", "Happily Ever After", "Get married.", "love_marry", (p) => T(() => p.getRomanticRelationshipStatus().name()) === "married"),
    // career
    F("top", "work", "Top of the Ladder", "Reach the highest level of a career.", "tab_briefcase", (p) => T(() => p.getJobState().isJobMaxedOut(), false)),
    F("retired", "work", "Golden Years", "Retire.", "achievement_old", (p) => T(() => !!p.retired || !!p.getJobState().retired || !!p.retirement?.retired, false) || marked(p, "retired")),
    F("founder", "work", "Founder", "Own a company.", "work_research", (p) => T(() => (p.work?.companies ?? []).length) > 0),
    F("hustler", "work", "Side Hustler", "Earn from a side hustle.", "possession_turntable_3", (p) => T(() => (p.work?.hustles ?? []).length) > 0 || T(() => Array.from(p.getSideHustleState().getStates() as any).some((s: any) => s.getLevel?.() > 1), false)),
    // money
    F("million", "money", "Millionaire", "Net worth of $1,000,000.", "achievement_money_collector", (p) => worth(p) >= 1e6, (p) => [Math.max(0, Math.min(worth(p), 1e6)), 1e6], "savings"),
    F("billion", "money", "Billionaire", "Net worth of $1,000,000,000.", "achievement_money_collector", (p) => worth(p) >= 1e9, (p) => [Math.max(0, Math.min(worth(p), 1e9)), 1e9]),
    F("debtFree", "money", "Debt Free", "Pay off a loan.", "bank_loan", (p) => marked(p, "loanPaid"), undefined, "goodName"),
    F("creditStar", "money", "Exceptional Credit", "A credit score of 800.", "bank_loan", (p) => (Bank.peek(p)?.credit ?? 0) >= 800, (p) => [Math.min(800, Bank.peek(p)?.credit ?? 0), 800]),
    F("saver", "money", "Saver", "Reach a savings goal.", "bank_deposit", (p) => (Bank.peek(p)?.goals ?? []).some((g) => g.reached)),
    F("investor", "money", "Investor", "$100,000 invested.", "bank_withdrawal", (p) => Bank.invested(p) >= 100_000, (p) => [Math.min(100_000, Bank.invested(p)), 100_000]),
    F("diamondHands", "money", "Diamond Hands", "Stay invested through a whole recession.", "bank_withdrawal", (p) => marked(p, "diamondHands")),
    F("scratch", "money", "Lucky Scratch", "Win $10,000 or more on a scratch card.", "bank_lottery", (p) => marked(p, "scratchBig"), undefined, "luckyStar"),
    F("comeback", "money", "The Comeback", "Climb from debt to $100,000.", "bank_deposit", (p) => marked(p, "wasBroke") && worth(p) >= 100_000),
    // things
    F("firstCar", "things", "First Car", "Buy your first car.", "possession_car", (p) => Things.cars(p).length > 0, undefined, "familyCar"),
    F("supercar", "things", "Supercar", "Own a top-tier car.", "possesion_nicecar", (p) => (Things.bestCar(p)?.tier ?? 0) >= 5),
    F("garage", "things", "Car Collector", "Own 4 cars at once.", "possesion_nicecar", (p) => Things.cars(p).length >= 4, (p) => [Math.min(4, Things.cars(p).length), 4]),
    F("collector", "things", "Collector", "Own 5 collectibles.", "education_art", (p) => Things.owned(p).filter((o) => THING_BY_ID[o.id]?.cat === "collect").length >= 5, (p) => [Math.min(5, Things.owned(p).filter((o) => THING_BY_ID[o.id]?.cat === "collect").length), 5], "heirloom"),
    F("dealer", "things", "Art Dealer", "Sell a collectible for twice what you paid.", "education_art", (p) => marked(p, "doubleSale")),
    F("astronaut", "things", "Astronaut", "Launch your own rocket.", "possession_rocket", (p) => !!Things.peek(p)?.launched),
    F("yachtParty", "things", "Party on the Water", "Throw a yacht party.", "possession_yacht", (p) => (Things.peek(p)?.parties ?? 0) > 0),
    F("jetSet", "things", "Jet Set", "Fly your private jet 10 times.", "possession_jet", (p) => (Things.peek(p)?.flights ?? 0) >= 10, (p) => [Math.min(10, Things.peek(p)?.flights ?? 0), 10]),
    // health
    F("peak", "health", "Peak Fitness", "Fitness 85.", "health_workout", (p) => (Body.peek(p)?.fit ?? 0) >= 85, (p) => [Math.min(85, Math.round(Body.peek(p)?.fit ?? 0)), 85], "athletic"),
    F("smokeFree", "health", "Smoke-Free", "Quit smoking.", "health_pills", (p) => marked(p, "quitSmoking")),
    F("sober", "health", "One Day at a Time", "Get sober.", "health_meditation", (p) => marked(p, "sober")),
    F("checkups", "health", "Regular Checkups", "Five checkups with your family doctor.", "health_doctorvisit", (p) => (Body.peek(p)?.doctorVisits ?? 0) >= 5, (p) => [Math.min(5, Body.peek(p)?.doctorVisits ?? 0), 5]),
    F("fitNinety", "health", "Spry", "Health 80+ at 90.", "achievement_old", (p) => age(p) >= 90 && T(() => p.getAttributeState().getHealth()) >= 80 && !isVampire(p)),
    F("survivor", "health", "Survivor", "Get over a serious illness.", "health_chemotherapy", (p) => T(() => (p.illness?.history ?? []).some((h: any) => ["cancer", "leukemia", "heartDisease", "stroke", "pneumonia", "tuberculosis"].includes(h.id) && /cured|better|remission/.test(h.outcome)), false)),
    // self-care
    F("careGoals", "care", "Self-Care Pro", "Complete 3 self-care goals.", "health_meditation", (p) => T(() => (p.work?.care?.done ?? p.selfCare?.done ?? []).length) >= 3 || marked(p, "care3")),
    F("careAll", "care", "Wellness Guru", "Complete 8 self-care goals.", "health_meditation", (p) => T(() => (p.work?.care?.done ?? p.selfCare?.done ?? []).length) >= 8 || marked(p, "care8")),
    F("rested", "care", "Well Rested", "Sleep 8 hours a night for two years.", "health_meditation", (p) => (marks(p).restedWeeks ?? 0) >= 2 * W(), (p) => [Math.min(2 * W(), marks(p).restedWeeks ?? 0), 2 * W()]),
    F("zen", "care", "Zen", "Sanity 95+ for a whole year.", "health_meditation", (p) => (marks(p).zenWeeks ?? 0) >= W(), (p) => [Math.min(W(), marks(p).zenWeeks ?? 0), W()]),
    // world
    F("explorer", "world", "Explorer", "Visit 5 countries.", "vacation_international", (p) => (Fun.peek(p)?.visited?.length ?? 0) >= 5, (p) => [Math.min(5, Fun.peek(p)?.visited?.length ?? 0), 5]),
    F("globetrotter", "world", "Globetrotter", "Visit 15 countries.", "vacation_international", (p) => (Fun.peek(p)?.visited?.length ?? 0) >= 15, (p) => [Math.min(15, Fun.peek(p)?.visited?.length ?? 0), 15], "globetrotter"),
    F("expat", "world", "Expat", "Live in another country.", "vacation_international", (p) => !!marks(p).home && T(() => p.getCountry().name()) !== Rm.st(p).feats.homeCountry),
    F("polyglot", "world", "Polyglot", "Speak 3 languages.", "education_literature", (p) => T(() => Feats.languages?.(p) ?? 0) >= 3, (p) => [Math.min(3, T(() => Feats.languages?.(p) ?? 0)), 3]),
    F("fiveStars", "world", "Five Stars", "Take a luxury trip.", "vacation_luxury", (p) => marked(p, "luxTrip")),
    F("splurge", "world", "Treat Yourself", "Splurge 10 times.", "vacation_concert", (p) => (Fun.peek(p)?.splurges ?? 0) >= 10, (p) => [Math.min(10, Fun.peek(p)?.splurges ?? 0), 10]),
    // fame
    F("famous", "fame", "Famous", "100,000 fans.", "achievement_halloffame", (p) => T(() => p.celebrity?.fans) >= 1e5, (p) => [Math.min(1e5, T(() => p.celebrity?.fans)), 1e5]),
    F("star", "fame", "Superstar", "1,000,000 fans.", "achievement_halloffame", (p) => T(() => p.celebrity?.fans) >= 1e6, (p) => [Math.min(1e6, T(() => p.celebrity?.fans)), 1e6]),
    F("influencer", "fame", "Influencer", "10,000 followers on social media.", "achievement_halloffame", (p) => T(() => p.social?.followers ?? p.socialMedia?.followers) >= 10_000),
    // crime
    F("didTime", "crime", "Did Time", "Go to prison.", "leisure_prison_stareatwall", (p) => !!crime(p)?.jail || T(() => crime(p)?.stats?.served) > 0),
    F("escape", "crime", "The Great Escape", "Escape from prison.", "leisure_prison_escape", (p) => T(() => crime(p)?.stats?.escapes) > 0),
    F("clean", "crime", "Clean Record", "Reach 60 without a conviction.", "police_badge", (p) => age(p) >= 60 && !T(() => (crime(p)?.record ?? []).length, 0)),
    // vampire
    F("turned", "vampire", "Creature of the Night", "Become a vampire.", "lifepath_vampire", (p) => !!vamp(p)?.isVampire),
    F("sire", "vampire", "Sire", "Turn someone into a vampire.", "lifepath_vampire", (p) => T(() => Feats.childer?.(p) ?? 0) > 0),
    F("elder", "vampire", "Elder", "Reach Elder rank (300 years of blood).", "lifepath_vampire", (p) => T(() => rb(p)?.bloodAgeWeeks) >= 300 * W(), undefined, "oldBlood"),
    F("century", "vampire", "A Century of Nights", "100 years of blood.", "lifepath_vampire", (p) => T(() => rb(p)?.bloodAgeWeeks) >= 100 * W(), (p) => [Math.min(100, Math.floor(T(() => rb(p)?.bloodAgeWeeks) / W())), 100]),
    F("prince", "vampire", "Prince of the City", "Standing 95 at your court.", "lifepath_vampire", (p) => T(() => rb(p)?.standing) >= 95),
    F("golconda", "vampire", "Golconda", "Find peace with the Beast.", "lifepath_vampire", (p) => !!rb(p)?.golconda),
];
export const FEAT_BY_ID: Record<string, FeatDef> = Object.fromEntries(FEATS.map((f) => [f.id, f]));

export interface HeadStart { id: string; title: string; blurb: string; by: string }
export const HEAD_STARTS: HeadStart[] = [
    { id: "savings", title: "A Family Nest Egg", blurb: "Start life with $20,000 in savings.", by: "million" },
    { id: "goodName", title: "A Good Name", blurb: "Your credit score starts at 760 when you turn 18.", by: "debtFree" },
    { id: "athletic", title: "Born Athletic", blurb: "Start with fitness 55.", by: "peak" },
    { id: "globetrotter", title: "Globetrotter's Kid", blurb: "Start with a passport and five countries already visited.", by: "globetrotter" },
    { id: "heirloom", title: "The Heirloom", blurb: "Start with a collection of rare coins.", by: "collector" },
    { id: "familyCar", title: "A Hand-Me-Down Car", blurb: "Get a used sedan when you turn 16.", by: "firstCar" },
    { id: "luckyStar", title: "Lucky Star", blurb: "Scratch cards win twice as often.", by: "scratch" },
    { id: "strongFamily", title: "A Close Family", blurb: "Your parents start out loving you (+200 relationship).", by: "nextGen" },
    { id: "charm", title: "Natural Charm", blurb: "Start Charismatic.", by: "soulmates" },
    { id: "oldBlood", title: "Old Blood", blurb: "If you're ever turned, you start as a Neonate (25 years of blood).", by: "elder" },
];

export interface FeatsGlobal { done: Record<string, { name: string; age: number; life: number }>; lives: number }

export const Feats = {
    global(): FeatsGlobal {
        const a: any = GameStateManager.INSTANCE.getGlobalStateManager().getAchievementState();
        if (a.rm == null) a.rm = { done: {}, lives: 0 };
        return a.rm as FeatsGlobal;
    },
    done(id: string): boolean { return !!Feats.global().done[id]; },
    count(): number { return Object.keys(Feats.global().done).length; },
    mark(p: any, k: string, n = 1) { const m = marks(p); m[k] = (m[k] ?? 0) + n; },
    /** Set at install. */
    languages: null as ((p: any) => number) | null,
    childer: null as ((p: any) => number) | null,
    check(p: any = player()) {
        if (!p) return;
        try { if (p.getLifeScenario?.().isCustomizable?.()) return; } catch { /* */ }
        const g = Feats.global();
        for (const f of FEATS) {
            if (g.done[f.id]) continue;
            let ok = false;
            try { ok = !!f.test?.(p); } catch { ok = false; }
            if (ok) {
                g.done[f.id] = { name: T(() => p.getFullName(), ""), age: age(p), life: g.lives };
                const hs = HEAD_STARTS.find((h) => h.by === f.id);
                Say.milestone("Achievement", `${f.title}: ${f.blurb}${hs ? `\n\nUnlocked a head start for new lives: ${hs.title} (${hs.blurb})` : ""}`, img(f.image));
            }
        }
    },
    progress(p: any, f: FeatDef): [number, number] | null { try { return f.progress ? f.progress(p) : null; } catch { return null; } },
    afterWeek(p: any) {
        const st = Rm.st(p).feats;
        if (st.homeCountry == null) { st.homeCountry = T(() => p.getCountry().name(), ""); marks(p).home = 1; }
        const m = marks(p);
        // counters
        try { if (p.work?.care?.sleep === "healthy" || p.selfCare?.sleep === "healthy") m.restedWeeks = (m.restedWeeks ?? 0) + 1; else if (T(() => Feats.sleepHealthy?.(p), false)) m.restedWeeks = (m.restedWeeks ?? 0) + 1; } catch { /* */ }
        m.zenWeeks = T(() => p.getAttributeState().getSanity()) >= 95 ? (m.zenWeeks ?? 0) + 1 : 0;
        if (worth(p) < 0) m.wasBroke = 1;
        const b = Bank.peek(p);
        if (b) {
            if (b.phase === "recession" && Bank.invested(p) > 1000) m.inRecession = 1;
            if (b.phase !== "recession" && m.inRecession && Bank.invested(p) > 1000) { m.diamondHands = 1; m.inRecession = 0; }
            if (b.phase !== "recession" && Bank.invested(p) <= 1000) m.inRecession = 0;
        }
        Feats.applyAgeStarts(p);
        Feats.check(p);
    },
    /** Set at install (Self-Care's sleep). */
    sleepHealthy: null as ((p: any) => boolean) | null,

    // ------------------------------------------------------------------ head starts
    startUnlocked(h: HeadStart): boolean { return Feats.done(h.by); },
    chosen(p: any): string[] { const f = Rm.st(p).feats; return f.starts ?? (f.starts = []); },
    toggle(p: any, id: string, on: boolean) { const c = Feats.chosen(p); const i = c.indexOf(id); if (on && i < 0) c.push(id); if (!on && i >= 0) c.splice(i, 1); },
    /** A brand-new life begins (GameStateManager.startNewGame). */
    applyStart(p: any) {
        Feats.global().lives++;
        const c = Feats.chosen(p).filter((id) => { const h = HEAD_STARTS.find((x) => x.id === id); return h && Feats.startUnlocked(h); });
        Rm.st(p).feats.starts = c;
        for (const id of c) {
            try {
                if (id === "savings") { const { MoneyState } = require_money(); MoneyState?.updateMoney$default(p.getMoneyState(), require_big()(20000), require_type().workIncome, null, require_dest().savings, 4, null); }
                if (id === "athletic") Body.st(p).fit = 55;
                if (id === "globetrotter") { const is = p.getItemState(); const s = is.getState(Possession.passport); s.setOwned(true); if (s.getLevel() < 1) s.setLevel(1); const f = Fun.st(p); f.visited = ["france", "japan", "uk", "spain", "canada"].filter((x) => x !== T(() => p.getCountry().name())).slice(0, 5); }
                if (id === "heirloom") { const t = Things.st(p); t.owned.push({ uid: "T" + t.next++, id: "coins", since: now(p), paid: THING_BY_ID.coins.price, value: THING_BY_ID.coins.price, from: "your family" }); }
                if (id === "strongFamily") for (const x of fam(p)) if (rel(x) === "parent") x.setRelationshipProgress(Math.min(1000, x.getRelationshipProgress() + 200));
                if (id === "charm") { const ts = p.getTraitState(); const opp = (Trait as any).charismatic.getOpposite?.(); if (!(opp && ts.getTraits().contains(opp))) ts.addTrait((Trait as any).charismatic); }
            } catch (e) { console.error(e); }
        }
    },
    has(p: any, id: string): boolean { return (Rm.peek(p)?.feats?.starts ?? []).includes(id); },
    applyAgeStarts(p: any) {
        const f = Rm.st(p).feats;
        if (Feats.has(p, "familyCar") && age(p) >= 16 && !f.gotCar) { f.gotCar = true; const t = Things.st(p); t.owned.push({ uid: "T" + t.next++, id: "usedSedan", since: now(p), paid: 0, from: "your parents" }); Things.sync(p); Say.milestone("Your First Car", "Your parents handed you the keys to the family sedan. It's yours now.", img("possession_car")); }
        if (Feats.has(p, "goodName") && age(p) >= 18 && !f.gotCredit) { f.gotCredit = true; const b = Bank.st(p); b.credit = Math.max(b.credit ?? 0, 760); }
    },
};

// lazily required (keeps module load order simple)
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { BigInteger } from "../runtime";
const require_money = () => ({ MoneyState });
const require_big = () => (n: number) => BigInteger.valueOf(n);
const require_type = () => MoneyUpdateType;
const require_dest = () => MoneyDestination;
