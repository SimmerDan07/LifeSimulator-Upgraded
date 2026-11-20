// Seasons (v0.26.0): the calendar month decides the season, and the season changes things.
//
// Winter (Dec–Feb): −1 happiness (short days), heating bills, freezing if homeless, vampires love the long nights
//   (half sun damage, +1 happiness). Ski season. Plumbers, mail carriers, meteorologists, trainers earn more.
// Spring (Mar–May): +1 happiness. Tax season for accountants.
// Summer (Jun–Aug): +2 happiness, air conditioning bills; vampires suffer (sun damage ×1.5, −1 happiness).
//   Lifeguards, park rangers, photographers, hotels and firefighters are busy.
// Fall (Sep–Nov): +1 sanity (cosy).
// Holidays (once a year, with a choice): New Year's Resolution, Valentine's Day, Summer Fireworks, Halloween,
//   Harvest Feast and the Winter Holidays. Seasonal activities (two per season) appear in the Leisure tab.
// Nothing seasonal happens to you in jail or while a vampire lies collapsed (bills are frozen then too).
import { BigInteger, R, ArrayList } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Housing } from "../Enums/Housing";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Relationships } from "../Social/Relationships";
import { LifeMoments } from "./LifeMoments";
import { Vampire, LifeActionDef, LifeActions } from "../Lifepaths/Vampire";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import type { Season } from "../Careers/CareerData";
import { seasonForMonth, climateOf, hasSnow, COUNTRY_BY_ID } from "../World/WorldData";

export type { Season };
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const pay = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.directSpend, null, null, 12, null);
const alive = (x: any) => x != null && (x.getIsAlive?.() ?? true);

export const SEASON_INFO: Record<Season, { name: string; icon: string; months: string }> = {
    winter: { name: "Winter", icon: "❄️", months: "December–February" },
    spring: { name: "Spring", icon: "🌸", months: "March–May" },
    summer: { name: "Summer", icon: "☀️", months: "June–August" },
    fall: { name: "Fall", icon: "🍂", months: "September–November" },
};

interface Holiday { id: string; month: number; week: number; title: string; image: any; min?: number; seasonal?: boolean; run: (p: any) => void }

export const Seasons = {
    monthIndex(p: any = player()): number { try { return p.getCurrentMonthIndex(); } catch { return 0; } },
    weekOfMonth(p: any = player()): number {
        try { return (p.calendarWeeks() % Constants.Time.INSTANCE.getWeeksPerYear()) % Constants.Time.INSTANCE.getWeeksPerMonth(); } catch { return 0; }
    },
    /** Northern-hemisphere season for a month (v0.27.0: use `season(p)`, which knows the hemisphere). */
    ofMonth(m: number): Season { return seasonForMonth(m, null); },
    countryId(p: any = player()): string | null { try { return p.getCountry().name(); } catch { return null; } },
    /** v0.27.0: seasons are flipped south of the equator (December is summer in Australia). */
    southern(p: any = player()): boolean { return !!COUNTRY_BY_ID[Seasons.countryId(p) ?? ""]?.south; },
    climate(p: any = player()) { return climateOf(Seasons.countryId(p)); },
    snow(p: any = player()): boolean { return hasSnow(Seasons.countryId(p)); },
    season(p: any = player()): Season { return seasonForMonth(Seasons.monthIndex(p), Seasons.countryId(p)); },
    /** The months of a season where you live, e.g. "June–August" for winter in Australia. */
    monthsOf(s: Season, p: any = player()): string { return Seasons.southern(p) ? SEASON_INFO[({ winter: "summer", spring: "fall", summer: "winter", fall: "spring" } as Record<Season, Season>)[s]].months : SEASON_INFO[s].months; },
    is(s: Season, p: any = player()): boolean { return Seasons.season(p) === s; },
    name(p: any = player()): string { return SEASON_INFO[Seasons.season(p)].name; },
    label(p: any = player()): string { const i = SEASON_INFO[Seasons.season(p)]; return `${i.icon} ${i.name}`; },
    /** Sunlight for vampires: half in winter, ×1.5 in summer. */
    sunFactor(p: any = player()): number { const s = Seasons.season(p); return s === "winter" ? 0.5 : s === "summer" ? 1.5 : 1; },
    away(p: any): boolean { return Relationships.away(p); },
    /** Your home has bills (not with your parents, not homeless, not in jail). */
    paysBills(p: any): boolean {
        try {
            const h = p.getHousingState().currentHousing().getType();
            return h !== Housing.homeless && h !== Housing.parentsHouse && h !== Housing.jail && p.getAgeInYears() >= 18;
        } catch { return false; }
    },
    homeless(p: any): boolean { try { return p.getHousingState().currentHousing().getType() === Housing.homeless; } catch { return false; } },
    heating: 40,
    cooling: 30,

    /** Weekly mood and bills (Player.collectWeeklyValues). */
    collectWeeklyValues(p: any) {
        if (Seasons.away(p)) return;
        const a = p.getAttributeState(), ms = p.getMoneyState();
        const s = Seasons.season(p), vamp = Vampire.isVampire(p);
        const bill = (n: number, key: string) => MoneyState.updateMoney$default(ms, BigInteger.valueOf(n), MoneyUpdateType.expense, key, null, 8, null);
        // v0.27.0 climates: cold countries have long dark winters (−2, more heating); tropical and desert countries have
        // mild winters (no gloom, no heating) and hot summers (more air conditioning).
        const clim = Seasons.climate(p);
        const warm = clim === "tropical" || clim === "desert";
        if (s === "winter") {
            if (vamp) a.setDeltaValue(new Modifiers(0, 1, 0), "Long winter nights");
            else if (!warm) a.setDeltaValue(new Modifiers(0, clim === "cold" ? -2 : -1, 0), clim === "cold" ? "Winter: long, dark days" : "Winter: short, dark days");
            if (Seasons.homeless(p) && !vamp && !warm) a.setDeltaValue(new Modifiers(clim === "cold" ? -3 : -2, 0, 0), "Freezing outside");
            if (Seasons.paysBills(p) && !warm) bill(clim === "cold" ? Seasons.heating + 20 : Seasons.heating, "Heating");
        } else if (s === "spring") {
            a.setDeltaValue(new Modifiers(0, 1, 0), "Spring");
        } else if (s === "summer") {
            if (vamp) a.setDeltaValue(new Modifiers(0, -1, 0), "Long summer days");
            else a.setDeltaValue(new Modifiers(0, 2, 0), "Summer");
            if (Seasons.paysBills(p)) bill(warm ? Seasons.cooling + 20 : Seasons.cooling, "Air conditioning");
            if (Seasons.homeless(p) && !vamp && clim === "desert") a.setDeltaValue(new Modifiers(-2, 0, 0), "Desert heat");
        } else {
            a.setDeltaValue(new Modifiers(0, 0, 1), "Cosy fall");
        }
    },

    /** Camping in winter is cold. */
    onLeisure(p: any, action: any) {
        if (action?.name?.() === "goCamping" && Seasons.is("winter", p) && Seasons.snow(p) && !Vampire.isVampire(p)) attr(p, -3, -2, 0);
    },
    leisureNote(action: any): string | null {
        if (action?.name?.() === "goCamping" && Seasons.is("winter") && Seasons.snow() && !Vampire.isVampire(player())) return "Winter camping: −3 health, −2 happiness (it's freezing)\n";
        return null;
    },

    // ------------------------------------------------------------------ holidays
    state(p: any): { done: Record<string, number> } {
        const s = p.seasons ?? (p.seasons = {});
        s.done ??= {};
        return s;
    },
    year(p: any): number { try { return Math.floor(p.calendarWeeks() / Constants.Time.INSTANCE.getWeeksPerYear()); } catch { return 0; } },
    holidays(): Holiday[] { return HOLIDAYS; },
    /** Called once a week after it ends (Player.applyWeekly). */
    afterWeek(p: any) {
        if (!LifeMoments.canHappen(p)) return;
        const m = Seasons.monthIndex(p), w = Seasons.weekOfMonth(p), st = Seasons.state(p), y = Seasons.year(p);
        for (const h of HOLIDAYS) {
            if (Seasons.holidayMonth(h, p) !== m || h.week !== w || st.done[h.id] === y || p.getAgeInYears() < (h.min ?? 3)) continue;
            st.done[h.id] = y;
            try { h.run(p); } catch { /* ignore */ }
            break;
        }
    },

    // ------------------------------------------------------------------ seasonal activities (Leisure tab)
    activities(p: any = player()): LifeActionDef[] { return ACTIVITIES[Seasons.season(p)]; },
    /** v0.27.0: southern-hemisphere holidays tied to a season (summer fireworks, the harvest) move six months. */
    holidayMonth(h: Holiday, p: any = player()): number { return h.seasonal && Seasons.southern(p) ? (h.month + 6) % 12 : h.month; },
    cells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel(`This Season: ${Seasons.label(p)}`)];
        for (const c of LifeActions.cells(Seasons.activities(p), p)) out.push(c);
        return out;
    },
};

// ---------------------------------------------------------------- holidays
const family = (p: any): any[] => {
    const out: any[] = [];
    try { for (const x of Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]) if (alive(x) && !x.getNotYetBorn?.() && x.getPetType?.() == null) out.push(x); } catch { /* ignore */ }
    return out;
};
const bond = (x: any, n: number) => x.setRelationshipProgress(Math.max(0, Math.min(1000, x.getRelationshipProgress() + n)));
const partner = (p: any) => { try { const x = p.getFamilyState().getPartner(); return alive(x) ? x : null; } catch { return null; } };
type Opt = [string, () => string];
const ask = (title: string, text: string, image: any, options: Opt[]) => {
    const ok = options.filter((o) => { const mm = /\$([\d,]+)/.exec(o[0]); return mm == null || cash(player()) >= Number(mm[1].replace(/,/g, "")); });
    const list = ok.length ? ok : options.slice(-1);
    // with holiday pop-ups off: the middle option of three, otherwise the first one that costs nothing
    const free = (o: Opt) => !/\(\$/.test(o[0]);
    const quiet = list.length >= 3 && free(list[1]) ? 1 : Math.max(0, list.findIndex(free));
    LifeMoments.ask(title, text, image, list, { holiday: true, quiet });   // holidays still pop up (unless turned off)
};

const HOLIDAYS: Holiday[] = [
    { id: "newYear", month: 0, week: 0, title: "New Year's Resolution", image: R.drawable.achievement_happy, min: 8, run: (p) => ask("New Year's Resolution", "A new year! What's your resolution?", R.drawable.achievement_happy, [
        ["Get fit", () => { attr(p, 6, 2, 0); return "You actually went to the gym for the whole of January. (+6 health)"; }],
        ["Be kinder to myself", () => { attr(p, 0, 3, 6); return "Less doomscrolling, more sleep. (+6 sanity)"; }],
        ["Resolutions are a scam", () => { attr(p, 0, 2, 0); return "No resolution, no disappointment. Bold strategy."; }],
    ]) },
    { id: "valentine", month: 1, week: 1, title: "Valentine's Day", image: R.drawable.love_romantic_dinner, min: 13, run: (p) => {
        const x = partner(p);
        if (x) ask("Valentine's Day", `It's Valentine's Day. What are you doing for ${x.getFirstName()}?`, R.drawable.love_romantic_dinner, [
            ["A fancy dinner ($150)", () => { pay(p, 150); bond(x, 60); attr(p, 0, 6, 0); return `Candles, dessert and ${x.getFirstName()} smiling all night. (+60 relationship)`; }],
            ["A handwritten card", () => { bond(x, 30); attr(p, 0, 3, 1); return `${x.getFirstName()} kept the card on the fridge. (+30)`; }],
            ["Forget it's Valentine's", () => { bond(x, -50); attr(p, 0, -3, -1); return `${x.getFirstName()} did not forget. (−50)`; }],
        ]);
        else ask("Valentine's Day", "Valentine's Day, and you're single.", R.drawable.love_romantic_dinner, [
            ["Treat yourself", () => { pay(p, Math.min(40, Math.max(0, cash(p)))); attr(p, 0, 5, 2); return "Chocolate, a movie and zero drama. Perfect."; }],
            ["Galentine's with friends", () => { attr(p, 0, 6, 1); Relationships.friends(p).forEach((f: any) => bond(f, 15)); return "The best Valentine's is with your friends."; }],
        ]);
    } },
    { id: "fireworks", month: 6, week: 0, seasonal: true, title: "Summer Fireworks", image: R.drawable.vacation_concert, min: 3, run: (p) => ask("Summer Fireworks", "The big summer festival is tonight: music, food stalls and fireworks.", R.drawable.vacation_concert, [
        ["Go with everyone", () => { attr(p, 0, 7, 1); family(p).forEach((x) => bond(x, 10)); return "The whole sky lit up. A perfect summer night."; }],
        ["Watch from the roof", () => { attr(p, 0, 4, 3); return "Quiet, cool, and the best view in town."; }],
    ]) },
    { id: "halloween", month: 9, week: 3, title: "Halloween", image: R.drawable.icon_vamp_bite, min: 3, run: (p) => {
        const opts: Opt[] = [];
        if (Vampire.isVampire(p)) opts.push(["Go as… yourself", () => { const s = Vampire.state(p); s.suspicion = Math.max(0, s.suspicion - 15); attr(p, 0, 8, 2); return "Best vampire costume anyone has ever seen. For one night you fit right in. (−15 suspicion)"; }]);
        if (p.getAgeInYears() < 14) opts.push(["Trick-or-treat", () => { attr(p, -1, 10, 1); return "A pillowcase full of candy. Your teeth have regrets."; }]);
        else opts.push(["Costume party ($40)", () => { pay(p, 40); attr(p, 0, 8, 0); return "You won best costume. Obviously."; }]);
        opts.push(["Hand out candy at home", () => { attr(p, 0, 4, 3); return "You gave out the good chocolate. The neighbourhood kids will remember."; }]);
        ask("Halloween", "It's Halloween! What's the plan?", R.drawable.icon_vamp_bite, opts);
    } },
    { id: "harvest", month: 10, week: 3, seasonal: true, title: "Harvest Feast", image: R.drawable.diet_balanced, min: 3, run: (p) => {
        const fam = family(p);
        ask("Harvest Feast", fam.length ? "The family is getting together for the big autumn feast." : "It's the big autumn feast weekend.", R.drawable.diet_balanced, [
            [fam.length ? "Host it ($100)" : "Cook a feast for friends ($100)", () => { pay(p, 100); fam.forEach((x) => bond(x, 30)); Relationships.friends(p).forEach((f: any) => bond(f, 10)); attr(p, 1, 6, 0); return "Too much food, too many stories, everyone went home happy. (+30 family)"; }],
            ["Bring a side dish", () => { fam.forEach((x) => bond(x, 15)); attr(p, 0, 4, 1); return "Your dish was a hit. Mostly."; }],
            ["Skip it this year", () => { fam.forEach((x) => bond(x, -15)); attr(p, 0, -1, 2); return "A quiet weekend. Your family noticed the empty chair."; }],
        ]);
    } },
    { id: "holidays", month: 11, week: 2, title: "Winter Holidays", image: R.drawable.achievement_happy, min: 3, run: (p) => {
        const fam = family(p);
        const n = Math.max(1, fam.length);
        const big = Math.min(2000, 50 * n);
        if (p.getAgeInYears() < 16) {
            attr(p, 0, 10, 2);
            fam.forEach((x) => bond(x, 15));
            return LifeMoments.result(holidayName(p), "Presents, snacks and staying up late. Best week of the year!", R.drawable.achievement_happy, { holiday: true });
        }
        ask(holidayName(p), fam.length ? `The holidays are here. Gifts for the family (${fam.length})?` : "The holidays are here.", R.drawable.achievement_happy, [
            [`Generous gifts (${money(big)})`, () => { pay(p, big); fam.forEach((x) => bond(x, 40)); attr(p, 0, 8, 0); return "Everyone loved their presents. (+40 family)"; }],
            ["Homemade gifts", () => { fam.forEach((x) => bond(x, 20)); attr(p, 0, 5, 2); return "Knitted scarves and cookies. Thoughtful wins. (+20 family)"; }],
            ["Skip the gifts", () => { fam.forEach((x) => bond(x, -10)); attr(p, 0, -2, 1); return "You saved money. The family saved their opinions (mostly)."; }],
        ]);
    } },
];

// ---------------------------------------------------------------- seasonal activities
const kidsFree = (n: number) => () => (player().getAgeInYears() < 18 ? 0 : n);
/** Daylight activity: vampires lose happiness to the sun (seasonal). */
const sunlit = (p: any) => { if (Vampire.isVampire(p)) { const n = Math.round(Vampire.sunDamage(p)); attr(p, 0, -n, 0); } };
const sunNote = (base: string) => () => {
    const p = player();
    return base + (Vampire.isVampire(p) ? ` Daytime: −${Math.round(Vampire.sunDamage(p))} happiness for a vampire.` : "") + "\n";
};
const holidayName = (p: any) => (Seasons.southern(p) ? "Summer Holidays" : "Winter Holidays");
const noSnow = (p: any) => (Seasons.snow(p) ? null : `It never snows in ${p.getCountry().getTitle()}`);
const ACTIVITIES: Record<Season, LifeActionDef[]> = {
    winter: [
        { id: "snowman", title: "Build a Snowman", image: R.drawable.vacation_ski, mods: [1, 6, 1], lock: noSnow, note: sunNote("Carrot nose mandatory."), run: (p) => sunlit(p) },
        { id: "iceSkating", title: "Go Ice Skating", image: R.drawable.vacation_hockeymatch, cost: kidsFree(20), mods: [2, 5, 0], lock: noSnow, note: () => "Graceful? Not really. Fun? Very.\n", run: () => {} },
    ],
    spring: [
        { id: "picnic", title: "Picnic in the Park", image: R.drawable.vacation_park, cost: kidsFree(20), mods: [0, 5, 2], note: sunNote("Blossoms, sandwiches and a blanket in the sun."), run: (p) => sunlit(p) },
        { id: "springCleaning", title: "Spring Cleaning", image: R.drawable.skill_hygieneexpert, mods: [0, 1, 6], note: () => "Throw out everything you haven't touched since last spring.\n", run: () => {} },
    ],
    summer: [
        { id: "beachDay", title: "Beach Day", image: R.drawable.housing_beach_villa, cost: kidsFree(30), mods: [1, 8, 2], note: sunNote("Sun, sand and a sunburn."), run: (p) => { sunlit(p); sunlit(p); } },
        { id: "waterPark", title: "Water Park", image: R.drawable.vacation_local, cost: kidsFree(50), mods: [1, 8, 0], note: sunNote("Every slide, twice."), run: (p) => sunlit(p) },
    ],
    fall: [
        { id: "pumpkinPatch", title: "Pumpkin Patch", image: R.drawable.business_farm_new, cost: kidsFree(20), mods: [0, 5, 2], note: sunNote("Pick the biggest, roundest pumpkin."), run: (p) => sunlit(p) },
        { id: "hauntedHouse", title: "Haunted House", image: R.drawable.icon_vamp_bite, cost: kidsFree(30), mods: [0, 6, -2], note: () => (Vampire.isVampire(player()) ? "Honestly, it's a bit insulting.\n" : "Screaming, then laughing about screaming.\n"), run: () => {} },
    ],
};
