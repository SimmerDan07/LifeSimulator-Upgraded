// v0.36.0 The Remaster: Leisure. One tab of categories (the original activities folded in with the World update's),
// three ways to do anything (on a budget, normal, or splurge), someone to bring along, favourites (do something
// often and it means more to you), and real trips (where, how long, what budget) instead of the three old vacations.
import { Rm, player, now, age, WPY, roll, pick, clamp, money, cash, pay, Say, img, mods, isVampire, inJail } from "./Core";
import { Leisure } from "../Enums/Leisure";
import { Country } from "../Enums/Country";
import { Possession } from "../Enums/Possession";
import { COUNTRY_BY_ID } from "../World/WorldData";
import { ACTIVITY_CATEGORIES, ACTIVITY_DEFS } from "../World/ActivityData";
import { Traits } from "./Traits";

export type Tier = "cheap" | "normal" | "splurge" | "night";
export const TIERS: Record<Tier, { title: string; cost: number; mods: number; blurb: string }> = {
    cheap: { title: "On a Budget", cost: 0.4, mods: 0.6, blurb: "Cheaper, and not quite as good." },
    normal: { title: "Normal", cost: 1, mods: 1, blurb: "" },
    splurge: { title: "Splurge", cost: 2.5, mods: 1.6, blurb: "The best seats, the good stuff. Sometimes something special happens." },
    night: { title: "At Night", cost: 1, mods: 0.8, blurb: "After dark: no sun." },
};

/** Where the original leisure options live now ("local" = Only Here; null = replaced or prison-only). */
export const ORIGINAL_CAT: Record<string, string | null> = {
    take_week_off: "wellness", goToPark: "outdoors", playGames: "fun", grab_drinks: "nightlife", goToConcert: "culture", goCamping: "outdoors", spa: "wellness",
    local_vacation: null, international_vacation: null, luxury_vacation: null,
    smokeCigarette: null, prisonRiot: null, stareAtWall: null, prisonEscape: null,
    ski: "local", iceHockey: "local", jpopConcert: "local", izakaya: "local", watchAnime: "local", watchOpera: "local", watchSoccer: "local",
    flamingoShow: "local", bullfightingShow: "local", pub: "local", pingpong: "local", badminton: "local",
};

export interface TripLength { id: string; title: string; weeks: number; mult: number }
export const TRIP_LENGTHS: TripLength[] = [
    { id: "short", title: "A Long Weekend", weeks: 1, mult: 0.5 },
    { id: "week", title: "A Week", weeks: 1, mult: 1 },
    { id: "two", title: "Two Weeks", weeks: 2, mult: 1.8 },
];
export const TRIP_BUDGETS = [
    { id: "backpacker", title: "Backpacker", perWeek: 400, mods: 0.7, blurb: "Hostels and street food." },
    { id: "comfort", title: "Comfortable", perWeek: 1500, mods: 1, blurb: "A nice hotel and good dinners." },
    { id: "luxury", title: "Luxury", perWeek: 6000, mods: 1.5, blurb: "Five stars, first class." },
];
export interface FunState { v: number; withId: string | null; counts: Record<string, number>; trips: number; visited: string[]; tripLen: string; souvenirs: number; splurges: number }

export const Fun = {
    st(p: any = player()): FunState {
        const f = Rm.st(p).fun as FunState;
        if (f.v == null) Object.assign(f, { v: 1, withId: null, counts: {}, trips: 0, visited: [], tripLen: "week", souvenirs: 0, splurges: 0 } as FunState);
        return f;
    },
    peek(p: any = player()): FunState | null { const f = p?.rm?.fun; return f?.v ? f : null; },
    /** The tier being done right now (read by Leisure.getCost / getModifiers). */
    current: null as Tier | null,

    // ------------------------------------------------------------------ what's where
    categoryOf(l: Leisure): string | null {
        const a = l.act();
        if (a) return a.cat;
        if (l.getTravelCountry() != null) return null;
        return ORIGINAL_CAT[l.name()] ?? null;
    },
    /** Every leisure option for a category, as the player can see it in their country (originals first). */
    inCategory(p: any, cat: string): Leisure[] {
        const here = p.getCountry();
        let orig: Leisure[] = [];
        try { orig = Leisure.INSTANCE.getLeisureOptions(p); } catch { orig = []; }
        const out: Leisure[] = [];
        for (const l of orig) if (Fun.categoryOf(l) === cat && !l.act()) out.push(l);
        if (cat === "local") {
            for (const a of ACTIVITY_DEFS) if (a.country === here.name()) out.push((Leisure as any)[a.id]);
        } else {
            for (const a of ACTIVITY_DEFS) if (a.cat === cat) out.push((Leisure as any)[a.id]);
        }
        return out.filter((l) => l != null);
    },
    categories(p: any = player()): { id: string; title: string; image: string; blurb: string }[] {
        const out = ACTIVITY_CATEGORIES.map((c) => ({ id: c.id as string, title: c.title, image: c.image, blurb: c.blurb }));
        out.push({ id: "local", title: `Only Here: ${p.getCountry().getTitle()}`, image: "icon_rm_local", blurb: "Things you can only do where you live." });
        return out;
    },

    // ------------------------------------------------------------------ doing something
    tierFor(l: Leisure, p: any): Tier[] {
        if (inJail(p)) return ["normal"];
        const base = Fun.baseCost(l, p);
        const ts: Tier[] = base > 0 ? ["cheap", "normal", "splurge"] : ["normal"];
        if (isVampire(p) && Fun.daytime(l)) ts.push("night");
        return ts;
    },
    daytime(l: Leisure): boolean { try { return Fun.isDaytime?.(l) ?? false; } catch { return false; } },
    /** Set at install (Vampire.isDaytime). */
    isDaytime: null as ((l: any) => boolean) | null,
    baseCost(l: Leisure, _p: any): number { const prev = Fun.current; Fun.current = null; try { return Number(l.getCost().toString()); } finally { Fun.current = prev; } },
    go(p: any, l: Leisure, tier: Tier) {
        Fun.current = tier;
        try { l.action(p); } finally { Fun.current = null; }
    },
    /** After any leisure option (Player.leisureAction): company, favourites, splurges. */
    onLeisure(p: any, l: Leisure, tier: Tier | null) {
        if (inJail(p)) return;
        const f = Fun.st(p);
        const k = l.name();
        f.counts[k] = (f.counts[k] ?? 0) + 1;
        if (f.counts[k] === 8) Say.note("A New Favourite", `${l.getTitle()} has become one of your favourite things to do. It'll always mean a little more (extra happiness every time).`, img("icon_rm_favourite"));
        if (f.counts[k] > 8) mods(p, 0, 2, 1);
        const w = Fun.companion(p);
        if (w) {
            try { w.setRelationshipProgress(Math.min(1000, w.getRelationshipProgress() + (tier === "splurge" ? 30 : 15))); } catch { /* */ }
            mods(p, 0, 1, 1);
        }
        if (tier === "splurge") {
            f.splurges++;
            if (roll(0.3)) { mods(p, 0, 3, 2); Say.note("Something Special", pick(["You got upgraded to the VIP area.", "A stranger bought you a drink and you talked for hours.", "The best night you've had in ages.", "You got a front-row view of everything.", "They gave you a little extra, on the house."]), img("icon_rm_favourite")); }
        }
    },

    // ------------------------------------------------------------------ bringing someone
    people(p: any): any[] {
        const out: any[] = [];
        try {
            const fam = p.getFamilyState();
            const partner = fam.getPartner(); if (partner && partner.getIsAlive()) out.push(partner);
            for (const c of Array.from(fam.getAliveChildren() as any) as any[]) if (!c.getNotYetBorn() && c.getAgeInYears() >= 4) out.push(c);
            for (const x of Array.from(fam.getFamilyMembers() as any) as any[]) {
                const r = x.getRelationship?.()?.name?.() ?? "";
                if (x.getIsAlive() && ["parent", "sibling", "grandparent"].includes(r) && !out.includes(x)) out.push(x);
            }
        } catch { /* */ }
        try { for (const x of Fun.friends?.(p) ?? []) if (x.getIsAlive() && !out.includes(x)) out.push(x); } catch { /* */ }
        return out.slice(0, 12);
    },
    /** Set at install (Relationships.friends). */
    friends: null as ((p: any) => any[]) | null,
    companion(p: any = player()): any | null {
        const f = Fun.peek(p);
        if (!f?.withId) return null;
        const x = Fun.people(p).find((q) => q.getId?.() === f.withId);
        if (!x) { f.withId = null; return null; }
        return x;
    },
    setCompanion(p: any, x: any | null): string {
        Fun.st(p).withId = x ? x.getId() : null;
        return x ? `You'll bring ${x.getFirstName()} along (+15 relationship each time, and it's more fun).` : "You'll go on your own.";
    },

    // ------------------------------------------------------------------ trips
    tripLength(p: any): TripLength { return TRIP_LENGTHS.find((x) => x.id === Fun.st(p).tripLen) ?? TRIP_LENGTHS[1]; },
    destinations(p: any): any[] { return Country.values().filter((c: any) => c !== p.getCountry()); },
    region(c: any): string { return COUNTRY_BY_ID[c.name()]?.region ?? "europe"; },
    tripCost(p: any, c: any | null, budget: string): number {
        const b = TRIP_BUDGETS.find((x) => x.id === budget)!;
        const L = Fun.tripLength(p);
        const flight = c == null ? 150 : Fun.region(c) === Fun.region(p.getCountry()) ? 500 : 1400;
        const travelers = Fun.companion(p) ? 2 : 1;
        let cost = (flight * (budget === "luxury" ? 3 : 1) + b.perWeek * L.mult) * travelers;
        try { cost *= Leisure.travelDiscount(p); } catch { /* */ }
        cost *= Traits.tripCostMult(p);
        return Math.round(cost);
    },
    tripLock(p: any, c: any | null, budget: string): string | null {
        if (inJail(p)) return "Not while you're in prison";
        if (age(p) < 16) return "Ages 16+ (or go with your family)";
        if (c != null && !p.getItemState().isOwned(Possession.passport)) return "Needs a passport (Money › Things › Home)";
        if (cash(p) < Fun.tripCost(p, c, budget)) return "Not enough cash";
        return null;
    },
    trip(p: any, c: any | null, budget: string): void {
        const lock = Fun.tripLock(p, c, budget);
        if (lock) return;
        const f = Fun.st(p);
        const b = TRIP_BUDGETS.find((x) => x.id === budget)!;
        const L = Fun.tripLength(p);
        const cost = Fun.tripCost(p, c, budget);
        pay(p, cost);
        f.trips++;
        const where = c == null ? `somewhere new in ${p.getCountry().getTitle()}` : c.getTitle();
        const first = c != null && !f.visited.includes(c.name());
        if (c != null && first) f.visited.push(c.name());
        if (c != null) { try { const m = p.getMiscState(); m.setTripsTaken(m.getTripsTaken() + 1); } catch { /* */ } }
        const k = b.mods * (L.weeks === 2 ? 1.4 : L.id === "short" ? 0.6 : 1) * (first ? 1.2 : 1) * Traits.tripMult(p);
        mods(p, 0, Math.round(20 * k), Math.round(18 * k));
        const w = Fun.companion(p);
        if (w) try { w.setRelationshipProgress(Math.min(1000, w.getRelationshipProgress() + 60)); if (w === p.getFamilyState().getPartner()) Rm.mark(p, "partnerTrip"); } catch { /* */ }
        if (budget === "luxury") Rm.mark(p, "luxTrip");
        const lines: string[] = [`${L.title} in ${where}${w ? ` with ${w.getFirstName()}` : ""}, ${b.title.toLowerCase()} (${money(cost)}).`];
        // what happened
        const x = Math.random();
        if (x < 0.12) { mods(p, -6, -3, 0); lines.push("You got food poisoning on day two. Worth it, mostly."); }
        else if (x < 0.2) { pay(p, 300); lines.push("The airline lost your luggage. New clothes: $300."); }
        else if (x < 0.32 && !w) { const fr = Fun.meet?.(p, where); if (fr) lines.push(`You met ${fr} on the trip and kept in touch (Love › Friends).`); }
        else if (x < 0.42 && budget !== "backpacker") { mods(p, 0, 4, 3); lines.push("A free upgrade on the way: the best seats on the plane."); }
        else lines.push(pick(["You came home rested and full of stories.", "You took a thousand photos and don't regret one.", "You didn't want to come home.", "Every day was better than the last."]));
        if (c != null && roll(0.5)) { Fun.souvenir?.(p, c.getTitle()); f.souvenirs++; lines.push(`You brought home a souvenir from ${c.getTitle()} (Money › Your Things).`); }
        if (first) lines.push(`Your first time in ${c.getTitle()}. Countries visited: ${f.visited.length}.`);
        Say.result("Your Trip", lines.join("\n\n"), c ? c.getImageId() : img("vacation_local"));
        for (let i = 0; i < L.weeks; i++) p.applyWeekly();
    },
    /** Set at install: meet someone on a trip (returns their name), and bring home a souvenir. */
    meet: null as ((p: any, where: string) => string | null) | null,
    souvenir: null as ((p: any, where: string) => void) | null,
    favourites(p: any = player()): [string, number][] {
        const f = Fun.peek(p);
        if (!f) return [];
        return Object.entries(f.counts).filter(([, n]) => n >= 8).sort((a, b) => b[1] - a[1]).slice(0, 5);
    },
};
