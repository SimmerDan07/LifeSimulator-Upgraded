// v0.36.0 The Remaster: owning things. The Store, cars (cash or a car loan), what your things do each week, upkeep as
// one weekly cost, values that fall (cars, tech) or move (collectibles), selling, gifting, leaving them to your heir,
// rare car breakdowns (a random event) and things to do with the original big toys.
import { Rm, player, now, age, WPY, roll, pick, clamp, money, cash, pay, earn, bill, Say, img, weeklyMods, isVampire } from "./Core";
import { THINGS, THING_BY_ID, THING_CATS, THING_CAPS, type ThingDef, type ThingCat } from "./ThingsData";
import { Bank } from "./Bank";
import { Possession } from "../Enums/Possession";
import { Traits } from "./Traits";

export interface Owned { uid: string; id: string; since: number; paid: number; value?: number; loan?: string; from?: string }
export interface ThingsState { v: number; owned: Owned[]; next: number; sold: number; gifted: number; breakdowns: number; flights: number; parties: number; launched?: boolean }

export const Things = {
    st(p: any = player()): ThingsState {
        const t = Rm.st(p).things as ThingsState;
        if (t.v == null) {
            Object.assign(t, { v: 1, owned: [], next: 1, sold: 0, gifted: 0, breakdowns: 0, flights: 0, parties: 0 });
            // an old save's car becomes a real car in your garage
            try {
                const car = p.getItemState().getState(Possession.car);
                if (car.getOwned()) { const id = car.getLevel() >= 2 ? "luxurySedan" : "usedSedan"; t.owned.push({ uid: "T" + t.next++, id, since: now(p), paid: THING_BY_ID[id].price }); (t as any).hadCar = true; }
            } catch { /* */ }
        }
        return t;
    },
    peek(p: any = player()): ThingsState | null { const t = p?.rm?.things; return t?.v ? t : null; },
    def(id: string): ThingDef | undefined { return THING_BY_ID[id]; },
    owned(p: any = player()): Owned[] { return p ? Things.st(p).owned : []; },
    has(id: string, p: any = player()): boolean { return Things.owned(p).some((o) => o.id === id); },
    cars(p: any = player()): Owned[] { return Things.owned(p).filter((o) => Things.def(o.id)?.cat === "car"); },
    bestCar(p: any = player()): ThingDef | null {
        let best: ThingDef | null = null;
        for (const o of Things.cars(p)) { const d = Things.def(o.id)!; if (!best || (d.tier ?? 0) > (best.tier ?? 0)) best = d; }
        return best;
    },
    /** A routine boost (fit / sleep / cook) from everything you own. */
    boost(p: any, key: "fit" | "sleep" | "cook"): number { return Things.owned(p).reduce((s, o) => s + ((Things.def(o.id) as any)?.[key] ?? 0), 0); },
    catTitle(c: ThingCat | string) { return THING_CATS.find((x) => x.id === c)?.title ?? "Store"; },
    inCat(c: ThingCat | string): ThingDef[] { return THINGS.filter((t) => t.cat === c && !t.hidden); },
    addSouvenir(p: any, where: string) { const t = Things.st(p); t.owned.push({ uid: "T" + t.next++, id: "souvenir", since: now(p), paid: 40, value: 40, from: where }); },

    // ------------------------------------------------------------------ value
    years(p: any, o: Owned) { return Math.max(0, (now(p) - o.since) / WPY()); },
    value(p: any, o: Owned): number {
        const d = Things.def(o.id);
        if (!d) return 0;
        if (o.value != null) return o.value;
        return Math.round(d.price * Math.pow(1 - (d.dep ?? 0.1), Things.years(p, o)));
    },
    worth(p: any = player()): number { return Things.owned(p).reduce((s, o) => s + Things.value(p, o), 0); },
    upkeep(p: any = player()): number { return Math.round(Things.owned(p).reduce((s, o) => s + (Things.def(o.id)?.upkeep ?? 0), 0) * Traits.upkeepMult(p)); },

    // ------------------------------------------------------------------ buying
    lock(p: any, d: ThingDef, finance = false): string | null {
        if (age(p) < (d.minAge ?? 18)) return `Ages ${d.minAge ?? 18}+`;
        if (d.hidden) return "Not for sale";
        if (d.cat !== "car" && d.cat !== "collect" && Things.has(d.id, p)) return "You have one";
        if (finance) {
            if (d.cat !== "car" || d.price < 5000) return "Only cars can be financed";
            if (age(p) < 18) return "Car loans are for ages 18+";
            const down = Math.round(d.price * 0.1);
            if (cash(p) < down) return `Needs ${money(down)} down`;
            if ((Bank.credit(p) ?? 0) < 560) return "Needs a credit score of 560";
            return null;
        }
        if (cash(p) < d.price) return "Not enough cash";
        return null;
    },
    buy(p: any, id: string, finance = false): string {
        const d = Things.def(id)!;
        const lock = Things.lock(p, d, finance);
        if (lock) return lock;
        const t = Things.st(p);
        const o: Owned = { uid: "T" + t.next++, id, since: now(p), paid: d.price };
        if (finance) {
            const down = Math.round(d.price * 0.1);
            pay(p, down);
            const l = Bank.addLoan(p, "car", `Car Loan (${d.title})`, d.price - down, 5, o.uid);
            o.loan = l.id;
            t.owned.push(o);
            Things.sync(p);
            return `You drove home in a ${d.title}: ${money(down)} down, then ${money(l.payment)} a week for 5 years (${(l.rate * 100).toFixed(1)}%).`;
        }
        pay(p, d.price);
        if (d.grow != null) o.value = d.price;
        t.owned.push(o);
        Things.sync(p);
        return d.cat === "car" ? `You bought a ${d.title}. ${d.blurb}` : `You bought ${/^[AEIOU]/.test(d.title) ? "an" : "a"} ${d.title}. ${d.blurb}`;
    },
    /** The original items follow what you own (camping gear, game console, passport, laptop, car). */
    sync(p: any) {
        const is = p.getItemState();
        for (const o of Things.owned(p)) {
            const d = Things.def(o.id);
            if (d?.possession) { const pos = (Possession as any)[d.possession]; const s = is.getState(pos); if (!s.getOwned()) { s.setOwned(true); if (s.getLevel() < 1) s.setLevel(1); const g: any = Things.st(p); (g.granted ??= {})[d.possession] = true; } }
        }
        const car = is.getState(Possession.car);
        const best = Things.bestCar(p);
        const ts: any = Things.st(p);
        if (best) { car.setOwned(true); car.setLevel((best.tier ?? 1) >= 4 ? 2 : 1); ts.hadCar = true; }
        else if (ts.hadCar) { car.setOwned(false); car.setLevel(0); }
    },
    // ------------------------------------------------------------------ selling and gifting
    sellPrice(p: any, o: Owned): number { const d = Things.def(o.id)!; return Math.round(Things.value(p, o) * (d.cat === "collect" ? 0.9 : 0.85) * Traits.sellMult(p)); },
    remove(p: any, uid: string) {
        const t = Things.st(p);
        const o = t.owned.find((x) => x.uid === uid);
        t.owned = t.owned.filter((x) => x.uid !== uid);
        if (o) {
            const d = Things.def(o.id);
            if (d?.possession && !t.owned.some((x) => Things.def(x.id)?.possession === d.possession)) {
                const s = p.getItemState().getState((Possession as any)[d.possession]);
                // only take back what came with the Thing (an original you bought yourself stays yours)
                const g: any = t;
                if (d.possession !== "passport" && g.granted?.[d.possession]) { s.setOwned(false); delete g.granted[d.possession]; }
            }
        }
        Things.sync(p);
        return o;
    },
    sell(p: any, uid: string): string {
        const t = Things.st(p);
        const o = t.owned.find((x) => x.uid === uid);
        if (!o) return "";
        const d = Things.def(o.id)!;
        let got = Things.sellPrice(p, o);
        let note = "";
        if (o.loan) {
            const l = Bank.st(p).loans.find((x) => x.id === o.loan);
            if (l) { const owe = Math.ceil(l.balance); got -= owe; Bank.st(p).loans = Bank.st(p).loans.filter((x) => x !== l); note = ` (${money(owe)} went to pay off the loan)`; }
        }
        if (d.cat === "collect" && got >= o.paid * 2 && o.paid > 0) Rm.mark(p, "doubleSale");
        Things.remove(p, uid);
        t.sold++;
        if (got >= 0) earn(p, got); else pay(p, -got);
        return `You sold your ${d.title} for ${money(Math.max(0, got))}${note}.`;
    },
    giftLock(p: any, o: Owned): string | null { return o.loan ? "Pay off the loan first" : null; },
    gift(p: any, uid: string, to: any): string {
        const t = Things.st(p);
        const o = t.owned.find((x) => x.uid === uid);
        if (!o || !to) return "";
        if (o.loan) return "Pay off the loan first";
        const d = Things.def(o.id)!;
        const boost = clamp(Math.round(Things.value(p, o) / 100), 20, 250);
        if (Things.value(p, o) >= 10_000) Rm.mark(p, "bigGift");
        try { to.setRelationshipProgress(Math.min(1000, to.getRelationshipProgress() + boost)); } catch { /* */ }
        Things.remove(p, uid);
        t.gifted++;
        return `You gave ${to.getFirstName()} your ${d.title}. They loved it (+${boost} relationship).`;
    },
    repossess(p: any, uid: string): string { const o = Things.owned(p).find((x) => x.uid === uid); if (!o) return "it"; const d = Things.def(o.id)!; Things.remove(p, uid); return `your ${d.title}`; },

    // ------------------------------------------------------------------ the week
    collectWeeklyValues(p: any) {
        const t = Things.peek(p);
        if (!t || !t.owned.length) return;
        const up = Things.upkeep(p);
        if (up > 0) bill(p, up, "Upkeep (cars and things)");
        let h = 0, hap = 0, san = 0;
        for (const o of t.owned) { const m = Things.def(o.id)?.mods; if (m) { h += m[0]; hap += m[1]; san += m[2]; } }
        hap *= Traits.thingsHappyMult(p);
        h = Math.min(h, THING_CAPS[0]); hap = Math.min(hap, THING_CAPS[1] * Traits.thingsHappyMult(p)); san = Math.min(san, THING_CAPS[2]);
        if (h || hap || san) weeklyMods(p, isVampire(p) ? 0 : h, hap, san, "Your things");
    },
    afterWeek(p: any) {
        const t = Things.peek(p);
        if (!t || !t.owned.length) return;
        // collectibles: a new value each year
        if (now(p) % WPY() === 0) for (const o of t.owned) {
            const d = Things.def(o.id);
            if (d?.grow != null) { const g = d.grow + (Math.random() * 2 - 1) * (d.vol ?? 0.1); o.value = Math.max(Math.round(d.price * 0.05), Math.round((o.value ?? d.price) * (1 + g))); }
        }
        // a rare breakdown (a random event)
        for (const o of Things.cars(p)) {
            const d = Things.def(o.id)!;
            const old = Things.years(p, o) > 8 ? 2 : 1;
            if (roll((d.reliability ?? 0.003) * old * Traits.breakdownMult(p))) {
                const cost = Math.round(clamp(d.price * (0.01 + Math.random() * 0.03), 80, 6000));
                t.breakdowns++;
                const paidIt = cash(p) >= cost;
                if (paidIt) pay(p, cost);
                Say.note("Car Trouble", `Your ${d.title} ${pick(["broke down on the way to work", "wouldn't start this morning", "got a flat tyre on the motorway", "made a terrible noise and stopped"])}. ${paidIt ? `The garage fixed it for ${money(cost)}.` : `You couldn't pay ${money(cost)} right away, so it took a while (−2 happiness).`}`, img("icon_rm_cars"));
                if (!paidIt) weeklyMods(p, 0, -2, 0, "Car trouble");
                break;
            }
        }
    },
    /** Your heir gets your things (loans are settled by the estate first). */
    inherit(parent: any, heir: any) {
        const pt = Things.peek(parent);
        if (!pt || !pt.owned.length) return;
        const ht = Things.st(heir);
        for (const o of pt.owned) { ht.owned.push({ ...o, uid: "T" + ht.next++, loan: undefined, from: parent.getFirstName?.() }); }
        pt.owned = [];
        Things.sync(heir);
    },

    // ------------------------------------------------------------------ the big toys (the original items)
    toyLock(p: any, which: "yacht" | "jet" | "rocket"): string | null {
        const pos = which === "yacht" ? Possession.yacht : which === "jet" ? Possession.privateJet : Possession.rocket;
        if (!p.getItemState().isOwned(pos)) return `Buy the ${which === "jet" ? "private jet" : which} first`;
        if (which === "rocket" && Things.st(p).launched) return "You've been to space";
        return null;
    },
    yachtParty(p: any): string {
        const t = Things.st(p); t.parties++;
        const friends: any[] = [];
        try { for (const x of require_rel().circle(p).list()) if (x.getIsAlive() && (x.kind === "friend" || x.kind === "bestFriend")) friends.push(x); } catch { /* */ }
        for (const f of friends.slice(0, 6)) try { f.setRelationshipProgress(Math.min(1000, f.getRelationshipProgress() + 40)); } catch { /* */ }
        weeklyMods(p, 0, 8, 6, "Yacht party");
        return `Champagne, a DJ and the sun going down over the water.${friends.length ? ` ${friends.length > 6 ? "Your closest friends" : "Your friends"} still talk about it (+40 each).` : ""}`;
    },
    jetAway(p: any): string {
        const t = Things.st(p); t.flights++;
        weeklyMods(p, 0, 6, 8, "Private jet weekend");
        return `${pick(["Lunch in Paris, dinner in Rome", "A weekend in the Maldives", "Skiing in the Alps", "A beach in Bali"])}: no queues, no security lines, no one in the next seat.`;
    },
    launch(p: any): string {
        Things.st(p).launched = true;
        weeklyMods(p, 0, 20, 15, "Space");
        return "Ten, nine, eight… You saw the curve of the Earth and the thin blue line of the sky. Nothing will ever look the same.";
    },
};

// Relationships is loaded lazily (avoids an import loop at module load)
let REL: any = null;
export function setRelationshipsRef(r: any) { REL = r; }
const require_rel = () => REL;
