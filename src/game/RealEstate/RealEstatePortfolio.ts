// Real estate portfolio (Life Sim Upgraded — Property System Overhaul 1.0).
//
// Every property the player owns is an OwnedProperty record here. The original HousingState still
// exists and is kept in sync (numberOwned per type == units recorded here) so every original system —
// moving, rent, pets, achievements, scenarios — keeps working unchanged.
//
// Two entry points are called by Player each week:
//   collectWeeklyValues(player)  side-effect-free money/attribute deltas (also used for previews)
//   advanceWeek(player)          the simulation: market, wear, problems, tenants, mortgages
import { BigInteger } from "../runtime";
import { Housing } from "../Enums/Housing";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { PersonAttribute } from "../Enums/PersonAttribute";
import { Relationship } from "../Enums/Relationship";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { NameGenerator } from "../Managers/NameGenerator";
import { Sex } from "../Enums/Sex";
import { Utils } from "../Utils/Utils";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { R } from "../runtime";
import {
    PROPERTY_TYPES, NEIGHBORHOODS, COUNTRIES, DEFAULT_COUNTRY, RENOVATIONS, PROBLEMS, UPKEEP, RE,
    STREETS, STREET_SUFFIX, BUILDING_NAMES, rand, pick, clamp,
} from "./RealEstateConfig";
import { OwnedProperty, PropertyUse, conditionFactor } from "./OwnedProperty";

export interface RealEstateEvent {
    kind: "problem" | "market" | "tenantLeft" | "tenantFound" | "mortgagePaid";
    id?: string;
    problem?: string;
    text: string;
}
export interface GiftRecord { property: OwnedProperty; recipientId: string; recipientName: string; clock: number }
export interface SoldRecord { name: string; type: string; boughtFor: number; soldFor: number; clock: number; seller: string }

/** Classic Housing-screen purchases of up to this many units become individual properties; more become one block. */
const MAX_INDIVIDUAL = 12;
const GREEK = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Helios", "Selene", "Orion", "Vega"];

const big = (n: number) => BigInteger.valueOf(Math.round(Number.isFinite(n) ? n : 0));
const num = (b: BigInteger | null | undefined) => (b == null ? 0 : b.doubleValue());

function gauss(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export class RealEstatePortfolio {
    properties: OwnedProperty[] = [];
    listings: OwnedProperty[] = [];
    gifted: GiftRecord[] = [];
    sold: SoldRecord[] = [];
    /** Price index per country (1.0 = the original game's prices). */
    market: Record<string, number> = {};
    /** Weeks this family estate has existed (keeps counting across generations). */
    weeks = 0;
    listingsWeek = -9999;
    nextId = 1;

    // ------------------------------------------------------------------ basics
    all(): OwnedProperty[] { return this.properties ?? (this.properties = []); }
    get(id: string): OwnedProperty | undefined { return this.all().find((p) => p.id === id); }
    listing(id: string): OwnedProperty | undefined { return (this.listings ?? []).find((p) => p.id === id); }
    residence(): OwnedProperty | undefined { return this.all().find((p) => p.use === "residence"); }
    clock(): number { return this.weeks ?? 0; }
    newId(prefix = "P"): string { this.nextId = (this.nextId ?? 1) + 1; return `${prefix}${this.nextId}-${Math.floor(Math.random() * 1e6).toString(36)}`; }

    static countryKey(player: any): string {
        const c = player?.getCountry?.()?.name?.();
        return c && COUNTRIES[c] ? c : DEFAULT_COUNTRY;
    }
    static housingOf(type: string): Housing { return (Housing as any)[type] as Housing; }

    marketIndex(country: string): number {
        if (!this.market) this.market = {};
        return this.market[country] ?? 1;
    }

    // ------------------------------------------------------------------ valuation (all in US dollars)
    /** Market value before condition and renovations. */
    baseValue(p: OwnedProperty): number {
        const info = p.info();
        return info.basePrice * p.units * (NEIGHBORHOODS[p.neighborhood]?.value ?? 1) * p.countryInfo().value * this.marketIndex(p.country) * (p.quality ?? 1);
    }
    value(p: OwnedProperty): number {
        return this.baseValue(p) * conditionFactor(p.condition) * (1 + p.renovationBonus());
    }
    equity(p: OwnedProperty): number { return this.value(p) - (p.mortgage?.balance ?? 0); }
    /** What a sale would bring in after agent fees and paying off the mortgage. */
    saleProceeds(p: OwnedProperty): number { return this.value(p) * (1 - RE.sellingFees) - (p.mortgage?.balance ?? 0); }

    /** Weekly rent if fully let (includes the Real Estate Mogul perk through Housing.getRentalEarning). */
    rentPotential(p: OwnedProperty): number {
        let perUnit = p.info().baseRent;
        try { perUnit = num(RealEstatePortfolio.housingOf(p.type).getRentalEarning()); } catch { /* no player yet */ }
        const condRent = (0.5 + 0.5 * p.condition / 100) / 0.925;
        return perUnit * p.units * (NEIGHBORHOODS[p.neighborhood]?.rent ?? 1) * p.countryInfo().value * this.marketIndex(p.country)
            * (p.quality ?? 1) * condRent * (1 + 0.5 * p.renovationBonus());
    }
    occupancyShare(p: OwnedProperty): number {
        if (p.use !== "rental") return 0;
        if (p.info().multiUnit || p.isBlock()) return clamp(p.occupancy ?? 0, 0, 1);
        return p.tenant ? 1 : 0;
    }
    weeklyRent(p: OwnedProperty): number { return this.rentPotential(p) * this.occupancyShare(p); }
    weeklyTax(p: OwnedProperty): number { return this.value(p) * p.countryInfo().taxRate / RE.weeksPerYear; }
    weeklyUpkeep(p: OwnedProperty): number { return this.baseValue(p) * (UPKEEP[p.upkeep]?.yearly ?? 0) / RE.weeksPerYear; }
    weeklyUtilities(p: OwnedProperty): number {
        return p.use === "residence" || p.use === "family" ? p.info().utilities * p.units * p.countryInfo().value : 0;
    }
    weeklyCosts(p: OwnedProperty): number {
        return this.weeklyTax(p) + this.weeklyUpkeep(p) + this.weeklyUtilities(p) + (p.mortgage?.payment ?? 0);
    }
    weeklyNet(p: OwnedProperty): number { return this.weeklyRent(p) - this.weeklyCosts(p); }

    repairCost(p: OwnedProperty, problem: string): number {
        const info = PROBLEMS[problem];
        const perUnit = this.baseValue(p) / p.units;
        return Math.max(info.minCost * p.countryInfo().value, info.costPct * perUnit) * p.units;
    }
    renovationCost(p: OwnedProperty, cat: string): number | null {
        const lvl = p.renovations[cat] ?? 0;
        const r = RENOVATIONS[cat];
        if (!r || lvl >= r.cost.length) return null;
        return r.cost[lvl] * this.baseValue(p);
    }
    serviceCost(p: OwnedProperty, diy: boolean): number {
        return this.baseValue(p) * RE.serviceCost * (diy ? 0.1 : 1);
    }

    /** Price of a standard property of this type through the classic Housing screen (the original price in the US at index 1.0). */
    quickPrice(type: string, country: string): number {
        const info = PROPERTY_TYPES[type];
        if (!info) return 0;
        return Math.round(info.basePrice * (COUNTRIES[country]?.value ?? 1) * this.marketIndex(country));
    }
    quickPriceBig(player: any, housing: Housing): BigInteger {
        if (!PROPERTY_TYPES[housing.name()]) return housing.getPurchasePrice();
        return big(this.quickPrice(housing.name(), RealEstatePortfolio.countryKey(player)));
    }
    /** Current weekly rent collected from properties of one type (for the classic Housing screen). */
    rentForType(type: string): number { return this.all().filter((p) => p.type === type).reduce((s, p) => s + this.weeklyRent(p), 0); }

    totalValue(): number { return this.all().reduce((s, p) => s + this.value(p), 0); }
    totalDebt(): number { return this.all().reduce((s, p) => s + (p.mortgage?.balance ?? 0), 0); }
    totalEquity(): number { return this.totalValue() - this.totalDebt(); }
    totalMortgagePayments(): number { return this.all().reduce((s, p) => s + (p.mortgage?.payment ?? 0), 0); }

    // ------------------------------------------------------------------ creation
    makeProperty(type: string, country: string, opts: { neighborhood?: string; quality?: number; condition?: number } = {}): OwnedProperty {
        const info = PROPERTY_TYPES[type];
        const p = new OwnedProperty();
        p.id = this.newId();
        p.type = type;
        p.country = country;
        p.neighborhood = opts.neighborhood ?? pick(info.neighborhoods);
        p.quality = opts.quality ?? 1;
        p.condition = opts.condition ?? 85;
        p.city = type === "spaceHotel" ? "Low Earth Orbit" : pick(COUNTRIES[country]?.cities ?? COUNTRIES[DEFAULT_COUNTRY].cities);
        p.name = RealEstatePortfolio.makeName(type);
        p.upkeep = "standard";
        p.renovations = {};
        p.problems = [];
        p.occupants = [];
        p.history = [];
        return p;
    }

    static makeName(type: string): string {
        const n = 1 + Math.floor(Math.random() * 980);
        const street = pick(STREETS), suffix = pick(STREET_SUFFIX);
        switch (type) {
            case "small_apartment": return `Apt ${1 + Math.floor(Math.random() * 12)}${"ABCDEF"[Math.floor(Math.random() * 6)]}, ${n} ${street} ${suffix}`;
            case "luxury_condo": return `${street} ${pick(["Residences", "Tower", "Place", "Heights"])} #${10 + Math.floor(Math.random() * 40)}0${1 + Math.floor(Math.random() * 4)}`;
            case "grand_estate": return `${street} ${pick(["Estate", "Manor", "Hall", "Park"])}`;
            case "apartmentComplex": return `${street} ${pick(BUILDING_NAMES)} Apartments`;
            case "skyscraper": return `${street} ${pick(["Tower", "Center", "Plaza"])}`;
            case "spaceHotel": return `${pick(GREEK)} Orbital Hotel`;
            default: return `${n} ${street} ${suffix}`;
        }
    }

    private static TENANT_SEX = () => (Math.random() < 0.5 ? Sex.male : Sex.female);
    static tenantName(): string {
        try { return `${NameGenerator.INSTANCE.generateFirstName(RealEstatePortfolio.TENANT_SEX())} ${NameGenerator.INSTANCE.generateLastName()}`; }
        catch { return pick(["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey"]) + " " + pick(["Smith", "Lee", "Garcia", "Brown", "Khan", "Novak"]); }
    }
    newTenant(p: OwnedProperty) { p.tenant = { name: RealEstatePortfolio.tenantName(), weeksLeft: 24 + Math.floor(Math.random() * 72) }; }

    ownerLabel(player: any): string {
        try { return `${player.getFullName()} (age ${player.getAgeInYears()})`; } catch { return "the owner"; }
    }

    private addRecord(player: any, p: OwnedProperty, how: string) {
        p.purchasedAt = this.clock();
        p.purchasedBy = player?.getFullName?.() ?? "";
        p.purchasedAtAge = player?.getAgeInYears?.() ?? 0;
        p.log(this.clock(), how);
        this.all().push(p);
    }

    /**
     * Creates records for `units` units of `type` (classic purchases and save migration). They start as rentals,
     * matching the original game where owned homes you don't live in earn rent automatically.
     */
    addUnits(player: any, type: string, units: number, how: (p: OwnedProperty) => string, pricePerUnit: number | null) {
        const country = RealEstatePortfolio.countryKey(player);
        const make = (n: number) => {
            const p = this.makeProperty(type, country, { neighborhood: "suburbs", quality: 1, condition: 85 });
            if (n > 1) { p.units = n; p.name = `${PROPERTY_TYPES[type].label} portfolio`; p.city = ""; }
            p.purchasePrice = pricePerUnit != null ? pricePerUnit * n : this.value(p);
            if (pricePerUnit == null) (p as any).migrated = true;
            p.use = "rental";
            p.occupancy = 1;
            if (!PROPERTY_TYPES[type].multiUnit && n === 1) this.newTenant(p);
            this.addRecord(player, p, how(p));
            return p;
        };
        if (units <= MAX_INDIVIDUAL) { for (let i = 0; i < units; i++) make(1); return; }
        const block = this.all().find((p) => p.type === type && p.isBlock());
        if (block) {
            block.units += units;
            block.purchasePrice += (pricePerUnit ?? this.value(block) / block.units) * units;
            block.log(this.clock(), `${how(block)} (+${units} units)`);
        } else make(units);
    }

    /** Removes units without money changing hands (save repair). Least important first. */
    private removeUnits(type: string, units: number) {
        const order: Record<string, number> = { vacant: 0, rental: 1, family: 2, residence: 3 };
        const recs = this.all().filter((p) => p.type === type).sort((a, b) => (b.isBlock() ? 1 : 0) - (a.isBlock() ? 1 : 0) || order[a.use] - order[b.use]);
        for (const p of recs) {
            if (units <= 0) break;
            const take = Math.min(units, p.units);
            units -= take;
            p.units -= take;
            if (p.units <= 0) this.properties = this.all().filter((x) => x !== p);
        }
    }

    // ------------------------------------------------------------------ syncing with the original HousingState
    /**
     * Brings the portfolio in line with HousingState: creates records for units owned in older saves,
     * drops records for units no longer owned, and makes sure the home you live in is marked as your residence.
     * Cheap; safe to call any time.
     */
    reconcile(player: any) {
        const hs = player?.getHousingState?.();
        if (!hs) return;
        if (!this.properties) this.properties = [];
        if (!this.market) this.market = {};
        for (const type of Object.keys(PROPERTY_TYPES)) {
            const housing = RealEstatePortfolio.housingOf(type);
            if (!housing) continue;
            const owned = num(hs.getState(housing).getNumberOwned());
            const have = this.all().filter((p) => p.type === type).reduce((s, p) => s + p.units, 0);
            if (have < owned) this.addUnits(player, type, owned - have, () => `Owned by ${this.ownerLabel(player)} (recorded when the property system was upgraded)`, null);
            else if (have > owned) this.removeUnits(type, have - owned);
        }
        // Residence follows where the original game says you live.
        const cur = hs.currentHousing()?.getType()?.name?.() as string;
        let res = this.residence();
        if (res && res.type !== cur) {
            res.use = "rental";
            res.tenant = null;
            res.log(this.clock(), "Owner moved out; listed for rent");
            res = undefined;
        }
        if (!res && PROPERTY_TYPES[cur] && num(hs.getState(RealEstatePortfolio.housingOf(cur)).getNumberOwned()) > 0) {
            const order: Record<string, number> = { vacant: 0, rental: 1, family: 2, residence: 3 };
            const cands = this.all().filter((p) => p.type === cur).sort((a, b) => (a.isBlock() ? 1 : 0) - (b.isBlock() ? 1 : 0) || order[a.use] - order[b.use]);
            let home = cands[0];
            if (home && home.isBlock()) home = this.splitOne(home);
            if (home) this.setResidence(home, player);
        }
        // Occupants must still be alive family members.
        const fam = player.getFamilyState?.();
        if (fam) {
            for (const p of this.all()) {
                if (!p.occupants?.length) { if (p.use === "family") p.use = "vacant"; continue; }
                p.occupants = p.occupants.filter((id) => {
                    const m = RealEstatePortfolio.familyMember(player, id);
                    return m != null && m.getIsAlive();
                });
                if (p.use === "family" && p.occupants.length === 0) { p.use = "vacant"; p.log(this.clock(), "Family moved out"); }
            }
        }
    }

    private setResidence(home: OwnedProperty, player: any) {
        if (home.tenant) home.log(this.clock(), `Tenant ${home.tenant.name} moved out`);
        home.use = "residence";
        home.tenant = null;
        home.occupants = [];
        home.log(this.clock(), `${player?.getFullName?.() ?? "Owner"} moved in`);
    }

    /** Takes one unit out of a block as its own property. */
    splitOne(block: OwnedProperty): OwnedProperty {
        const per = block.purchasePrice / block.units;
        block.units -= 1;
        block.purchasePrice -= per;
        const p = this.makeProperty(block.type, block.country, { neighborhood: block.neighborhood, quality: block.quality, condition: block.condition });
        p.renovations = { ...block.renovations };
        p.upkeep = block.upkeep;
        p.purchasePrice = per;
        p.purchasedAt = block.purchasedAt;
        p.purchasedBy = block.purchasedBy;
        p.purchasedAtAge = block.purchasedAtAge;
        p.use = "vacant";
        p.history = [{ clock: this.clock(), text: `Split from ${block.name}` }];
        if (block.units <= 0) this.properties = this.all().filter((x) => x !== block);
        this.all().push(p);
        return p;
    }

    static familyMember(player: any, id: string): any {
        const members = player?.getFamilyState?.()?.getFamilyMembers?.();
        if (!members) return null;
        for (const m of members) if (m.getId() === id) return m;
        return null;
    }

    // ------------------------------------------------------------------ weekly
    /** Money and attribute deltas for this week. No randomness and no state changes beyond reconcile(). */
    collectWeeklyValues(player: any) {
        this.reconcile(player);
        const ms = player.getMoneyState();
        let tax = 0, upkeep = 0, util = 0, mort = 0;
        const rentByType: Record<string, { amount: number; units: number }> = {};
        for (const p of this.all()) {
            tax += this.weeklyTax(p);
            upkeep += this.weeklyUpkeep(p);
            util += this.weeklyUtilities(p);
            mort += p.mortgage?.payment ?? 0;
            const rent = this.weeklyRent(p);
            if (rent > 0) {
                const r = (rentByType[p.type] ??= { amount: 0, units: 0 });
                r.amount += rent;
                r.units += p.info().multiUnit || p.isBlock() ? Math.max(1, Math.round(p.units * this.occupancyShare(p))) : 1;
            }
        }
        const expense = (amount: number, label: string) => { if (amount >= 1) MoneyState.updateMoney$default(ms, big(amount), MoneyUpdateType.expense, label, null, 8, null); };
        expense(tax, "Property Tax");
        expense(upkeep, "Property Upkeep");
        expense(util, "Home Utilities");
        expense(mort, "Mortgage Payments");
        for (const [type, r] of Object.entries(rentByType)) {
            if (r.amount < 1) continue;
            let title = PROPERTY_TYPES[type].label;
            try { title = RealEstatePortfolio.housingOf(type).getTitle(); } catch { /* keep label */ }
            let label = `Rental Income - ${title} x${r.units}`;
            try { label = `${Utils.INSTANCE.getString(R.string.Bank_CashFlow_RentalIncome)} - ${title} x${r.units}`; } catch { /* default */ }
            MoneyState.updateMoney$default(ms, big(r.amount), MoneyUpdateType.passiveIncome, label, null, 8, null);
        }
        // How your own home feels.
        const home = this.residence();
        if (home) {
            const as = player.getAttributeState();
            const comfort = home.comfort();
            if (comfort > 0) as.setDeltaValue(PersonAttribute.happiness, "Home - Renovations", comfort);
            if (home.condition < 50) as.setDeltaValue(PersonAttribute.happiness, "Home - Run-down", -(50 - home.condition) / 20);
            for (const pr of home.problems ?? []) {
                const label = "Home - " + (PROBLEMS[pr.type]?.label ?? pr.type);
                as.setDeltaValue(PersonAttribute.happiness, label, -0.5);
                if (pr.type === "mold" || pr.type === "brokenHeater") as.setDeltaValue(PersonAttribute.health, label, -0.3);
            }
        }
    }

    /** Runs one week of simulation. Returns things worth telling the player. */
    advanceWeek(player: any): RealEstateEvent[] {
        this.reconcile(player);
        const events: RealEstateEvent[] = [];
        this.weeks = this.clock() + 1;
        const home = RealEstatePortfolio.countryKey(player);
        const countries = new Set<string>([home, ...this.all().map((p) => p.country)]);
        for (const c of countries) {
            const shock = this.stepMarket(c);
            if (shock && c === home && (this.all().length > 0 || (player?.getAgeInYears?.() ?? 0) >= 18)) {
                events.push({ kind: "market", text: shock > 0
                    ? `Housing market boom! Property prices jumped about ${Math.round(shock * 100)}%.`
                    : `Housing market slump. Property prices fell about ${Math.round(-shock * 100)}%.` });
            }
        }
        if (this.clock() - (this.listingsWeek ?? -9999) >= RE.listingRefreshWeeks || !this.listings?.length) this.refreshListings(player);

        for (const p of [...this.all()]) {
            const info = p.info();
            const plan = UPKEEP[p.upkeep] ?? UPKEEP.standard;
            // Running totals for the property's history.
            (p as any).rentCollected = ((p as any).rentCollected ?? 0) + this.weeklyRent(p);
            (p as any).costsPaid = ((p as any).costsPaid ?? 0) + this.weeklyCosts(p);
            // Mortgage amortization (the payment itself was charged in collectWeeklyValues).
            if (p.mortgage) {
                const m = p.mortgage;
                const interest = m.balance * m.rate / RE.weeksPerYear;
                m.balance = Math.max(0, m.balance - Math.max(0, m.payment - interest));
                if (m.balance < 1) {
                    p.mortgage = null;
                    p.log(this.clock(), "Mortgage paid off");
                    events.push({ kind: "mortgagePaid", id: p.id, text: `The mortgage on ${p.displayName()} is fully paid off.` });
                }
            }
            // Wear and tear.
            const damage = (p.problems ?? []).reduce((s, pr) => s + (PROBLEMS[pr.type]?.weeklyDamage ?? 0), 0);
            const decay = RE.baseDecay * info.decay * plan.decay * (p.use === "rental" ? 1.15 : 1) + damage;
            p.condition = clamp(p.condition - decay, 0, 100);
            for (const pr of p.problems ?? []) pr.weeks++;
            // Paid upkeep plans include a property manager who fixes problems you leave alone.
            if (plan.autoFixWeeks != null) {
                for (const pr of [...(p.problems ?? [])]) {
                    const info = PROBLEMS[pr.type];
                    const due = info.diy ? plan.autoFixWeeks : plan.autoFixMajorWeeks;
                    if (due == null || pr.weeks < due) continue;
                    const cost = this.repairCost(p, pr.type);
                    if (this.cash(player) < cost) continue;
                    this.pay(player, cost);
                    (p as any).costsPaid = ((p as any).costsPaid ?? 0) + cost;
                    p.problems = p.problems.filter((x) => x !== pr);
                    p.log(this.clock(), `${info.label} fixed by the property manager for ${this.fmt(cost)}`);
                }
            }
            // Something breaks.
            const chance = RE.problemChance * plan.problems * (1 + (100 - p.condition) / 60) * (p.isBlock() ? Math.min(3, Math.sqrt(p.units)) : 1);
            if ((p.problems?.length ?? 0) < 3 && Math.random() < chance) {
                const open = new Set(p.problems.map((x) => x.type));
                const pool = Object.entries(PROBLEMS).filter(([k]) => !open.has(k));
                let roll = Math.random() * pool.reduce((s, [, v]) => s + v.chance, 0);
                let type = pool[0][0];
                for (const [k, v] of pool) { roll -= v.chance; if (roll <= 0) { type = k; break; } }
                p.problems.push({ type, weeks: 0 });
                p.log(this.clock(), `${PROBLEMS[type].label} reported`);
                events.push({ kind: "problem", id: p.id, problem: type, text: `${PROBLEMS[type].label} at ${p.displayName()}.` });
            }
            // Tenants.
            if (p.use === "rental") {
                if (info.multiUnit || p.isBlock()) {
                    const target = clamp(0.6 + 0.5 * p.condition / 100 - 0.05 * p.problems.length, 0.2, 1);
                    p.occupancy = clamp((p.occupancy ?? 0) + (target - (p.occupancy ?? 0)) * 0.15 + rand(-0.01, 0.01), 0, 1);
                } else if (p.tenant) {
                    p.tenant.weeksLeft--;
                    const fedUp = Math.random() < 0.03 * p.problems.length;
                    if (p.tenant.weeksLeft <= 0 || fedUp) {
                        const renew = !fedUp && Math.random() < (p.condition >= 60 ? 0.7 : 0.4);
                        if (renew) {
                            p.tenant.weeksLeft = 24 + Math.floor(Math.random() * 72);
                            p.log(this.clock(), `${p.tenant.name} renewed the lease`);
                        } else {
                            p.log(this.clock(), `Tenant ${p.tenant.name} moved out`);
                            events.push({ kind: "tenantLeft", id: p.id, text: `Your tenant ${p.tenant.name} moved out of ${p.displayName()}.` });
                            p.tenant = null;
                        }
                    }
                } else if (Math.random() < 0.12 + 0.3 * p.condition / 100 - 0.05 * p.problems.length) {
                    this.newTenant(p);
                    p.log(this.clock(), `New tenant: ${p.tenant!.name}`);
                    events.push({ kind: "tenantFound", id: p.id, text: `${p.tenant!.name} is now renting ${p.displayName()}.` });
                }
            }
            // Family you house for free grow closer to you.
            if (p.use === "family") {
                for (const id of p.occupants) {
                    const m = RealEstatePortfolio.familyMember(player, id);
                    if (m && Math.random() < RE.familyHousingBonus) {
                        m.setRelationshipProgress(Math.min(RelationshipProgressStatus.INSTANCE.getMaxValue(), m.getRelationshipProgress() + 1));
                    }
                }
            }
        }
        return events;
    }

    /** One week of the price index: noise + slow pull toward a long-run growth trend + rare booms/crashes. Returns the shock size if any. */
    stepMarket(country: string): number {
        const years = this.clock() / RE.weeksPerYear;
        const trend = Math.log(Math.pow(1 + RE.marketDrift, years));
        let l = Math.log(this.marketIndex(country));
        l += (trend - l) * 0.01 + gauss() * RE.marketVolatility;
        let shock = 0;
        if (Math.random() < RE.marketShockChance) {
            shock = (Math.random() < 0.55 ? 1 : -1) * rand(0.08, 0.2);
            l += Math.log(1 + shock);
        }
        this.market[country] = clamp(Math.exp(l), 0.4, 6);
        return shock;
    }

    refreshListings(player: any) {
        const country = RealEstatePortfolio.countryKey(player);
        const cv = COUNTRIES[country].value * this.marketIndex(country);
        const ms = player.getMoneyState();
        const liquid = Math.max(0, num(ms.getCash()) + num(ms.getSavings()));
        const budget = Math.max(liquid * 4, 300000 * cv);
        const items = player.getItemState?.();
        const types = Object.keys(PROPERTY_TYPES).filter((t) => {
            const req = RealEstatePortfolio.housingOf(t)?.getRequiredItem?.();
            return req == null || (items != null && items.isOwned(req));
        }).sort((a, b) => PROPERTY_TYPES[a].basePrice - PROPERTY_TYPES[b].basePrice);
        const affordable = types.filter((t) => PROPERTY_TYPES[t].basePrice * cv <= budget);
        const tier = affordable.length ? affordable : [types[0]];
        const nextUp = types.find((t) => !tier.includes(t));
        const out: OwnedProperty[] = [];
        for (let i = 0; i < RE.listingCount; i++) {
            let type: string;
            if (i === RE.listingCount - 1 && nextUp) type = nextUp; // something to aim for
            else if (i < 2) type = tier[0];                            // always some starter homes
            else type = tier[Math.max(0, tier.length - 1 - Math.floor(Math.random() * Math.min(3, tier.length)))];
            const roll = Math.random();
            const condition = roll < 0.18 ? rand(25, 50) : roll < 0.78 ? rand(55, 88) : rand(88, 100);
            const p = this.makeProperty(type, country, { quality: rand(0.88, 1.12), condition });
            p.id = this.newId("L");
            if (condition > 80) {
                for (const cat of Object.keys(RENOVATIONS)) if (Math.random() < 0.35) p.renovations[cat] = 1 + (Math.random() < 0.3 ? 1 : 0);
            }
            if (condition < 50 && Math.random() < 0.6) p.problems.push({ type: pick(Object.keys(PROBLEMS)), weeks: 10 });
            p.askingPrice = Math.round(this.value(p) * rand(0.9, 1.12) * (condition < 50 ? 0.93 : 1));
            out.push(p);
        }
        this.listings = out;
        this.listingsWeek = this.clock();
    }

    // ------------------------------------------------------------------ mortgages
    static mortgagePayment(loan: number, rate: number): number {
        const r = rate / RE.weeksPerYear, n = RE.mortgageYears * RE.weeksPerYear;
        return loan * r / (1 - Math.pow(1 + r, -n));
    }
    /** Rough weekly income the bank will count: job pay plus current rent. */
    weeklyIncome(player: any): number {
        let inc = 0;
        try {
            const js = player.getJobState().getCurrentJobState();
            if (js) { const r = js.getType().pay(js.getLevel()); inc += (r.getMin() + r.getMax()) / 2; }
        } catch { /* unemployed */ }
        return inc + this.all().reduce((s, p) => s + this.weeklyRent(p), 0);
    }
    /** Explains whether the bank would lend `loan`; null when approved. */
    mortgageRefusal(player: any, price: number): string | null {
        const down = price * RE.downPayment, loan = price - down;
        const ms = player.getMoneyState();
        const cash = num(ms.getCash());
        if (cash < down) return `You need ${this.fmt(down)} in cash for the ${Math.round(RE.downPayment * 100)}% down payment.`;
        const pay = RealEstatePortfolio.mortgagePayment(loan, RE.mortgageRate);
        const income = this.weeklyIncome(player);
        const liquidAfter = cash - down + num(ms.getSavings());
        if (this.totalMortgagePayments() + pay <= RE.maxDebtToIncome * income) return null;
        if (liquidAfter >= loan * 0.5) return null;
        return `The bank turned you down: payments of ${this.fmt(pay)}/week are too high for your income of about ${this.fmt(income)}/week.`;
    }
    fmt(dollars: number): string { return RealEstatePortfolio.money(dollars); }
    /** The game's own money formatting (player's currency + K/M/B suffixes). */
    static money(dollars: number): string {
        try { return ExtensionsKt.numberDisplayString(big(dollars), true); }
        catch { return "$" + Math.round(dollars).toLocaleString("en-US"); }
    }

    // ------------------------------------------------------------------ actions (return an error message, or null on success)
    private pay(player: any, amount: number) {
        if (amount >= 1) MoneyState.updateMoney$default(player.getMoneyState(), big(amount), MoneyUpdateType.directSpend, null, null, 12, null);
    }
    private receive(player: any, amount: number) {
        if (Math.abs(amount) >= 1) player.getMoneyState().updateMoney(big(amount), MoneyUpdateType.sell, null, MoneyDestination.cash);
    }
    private cash(player: any): number { return num(player.getMoneyState().getCash()); }
    private bumpOwned(player: any, type: string, delta: number) {
        const st = player.getHousingState().getState(RealEstatePortfolio.housingOf(type));
        st.setNumberOwned(st.getNumberOwned().add(big(delta)));
    }

    /** Classic Housing screen "Purchase" buttons. */
    quickBuy(player: any, housing: Housing, n: number): string | null {
        const type = housing.name();
        if (!PROPERTY_TYPES[type] || n <= 0) return "Not for sale";
        this.reconcile(player);
        const price = this.quickPrice(type, RealEstatePortfolio.countryKey(player));
        this.pay(player, price * n);
        this.addUnits(player, type, n, () => `Bought by ${this.ownerLabel(player)} for ${this.fmt(price)}${n > 1 ? " each" : ""}`, price);
        this.bumpOwned(player, type, n);
        this.reconcile(player);
        return null;
    }

    /** Classic Housing screen "Sell" buttons: sells the least important units of a type at market value. */
    quickSell(player: any, housing: Housing, n: number): string | null {
        const type = housing.name();
        if (!PROPERTY_TYPES[type] || n <= 0) return "Nothing to sell";
        this.reconcile(player);
        const order: Record<string, number> = { vacant: 0, rental: 1, family: 2, residence: 3 };
        const recs = this.all().filter((p) => p.type === type).sort((a, b) => (b.isBlock() ? 1 : 0) - (a.isBlock() ? 1 : 0) || order[a.use] - order[b.use]);
        let left = n, proceeds = 0;
        for (const p of recs) {
            if (left <= 0) break;
            const take = Math.min(left, p.units);
            const share = take / p.units;
            proceeds += this.saleProceeds(p) * share;
            this.archiveSale(player, p, this.value(p) * share * (1 - RE.sellingFees), take);
            left -= take;
            if (take === p.units) this.properties = this.all().filter((x) => x !== p);
            else {
                p.purchasePrice *= 1 - share;
                if (p.mortgage) { p.mortgage.balance *= 1 - share; p.mortgage.payment *= 1 - share; p.mortgage.original *= 1 - share; }
                p.units -= take;
                p.log(this.clock(), `${take} units sold`);
            }
        }
        const sold = n - left;
        this.receive(player, proceeds);
        this.bumpOwned(player, type, -sold);
        this.reconcile(player);
        return null;
    }

    private archiveSale(player: any, p: OwnedProperty, soldFor: number, units: number) {
        if (!this.sold) this.sold = [];
        this.sold.push({ name: units > 1 ? `${units} × ${p.typeLabel()}` : p.displayName(), type: p.type,
            boughtFor: p.purchasePrice * units / p.units, soldFor, clock: this.clock(), seller: player?.getFullName?.() ?? "" });
        if (this.sold.length > 40) this.sold.splice(0, this.sold.length - 40);
    }

    buyListing(player: any, id: string, mortgage: boolean): string | null {
        const l = this.listing(id);
        if (!l) return "That listing is gone.";
        const price = l.askingPrice;
        if (mortgage) {
            const refusal = this.mortgageRefusal(player, price);
            if (refusal) return refusal;
            const loan = price * (1 - RE.downPayment);
            this.pay(player, price - loan);
            l.mortgage = { original: loan, balance: loan, rate: RE.mortgageRate, payment: RealEstatePortfolio.mortgagePayment(loan, RE.mortgageRate) };
        } else {
            if (this.cash(player) < price) return `You need ${this.fmt(price)} in cash.`;
            this.pay(player, price);
        }
        this.listings = this.listings.filter((x) => x !== l);
        l.id = this.newId();
        l.purchasePrice = price;
        l.askingPrice = 0;
        l.use = "vacant";
        this.addRecord(player, l, `Bought by ${this.ownerLabel(player)} for ${this.fmt(price)}${mortgage ? " with a mortgage" : ""}`);
        this.bumpOwned(player, l.type, 1);
        this.reconcile(player);
        return null;
    }

    sellProperty(player: any, id: string): string | null {
        const p = this.get(id);
        if (!p) return "Not found";
        const proceeds = this.saleProceeds(p);
        if (proceeds < 0 && this.cash(player) < -proceeds) return `You owe more than it's worth and need ${this.fmt(-proceeds)} in cash to close the sale.`;
        this.archiveSale(player, p, this.value(p) * (1 - RE.sellingFees), p.units);
        this.properties = this.all().filter((x) => x !== p);
        this.receive(player, proceeds);
        this.bumpOwned(player, p.type, -p.units);
        this.reconcile(player);
        return null;
    }

    /** Make this property your home (uses the original "move here" so pets/rent rules still apply). */
    moveInto(player: any, id: string): string | null {
        let p = this.get(id);
        if (!p) return "Not found";
        const housing = RealEstatePortfolio.housingOf(p.type);
        if (!housing.getLivable()) return `You can't live in a${/^[AEIOU]/.test(p.typeLabel()) ? "n" : ""} ${p.typeLabel()}.`;
        if (housing.getNumberOfPetsAllowed() < player.getFamilyState().getAlivePets().size()) return `Too many pets for a${/^[AEIOU]/.test(p.typeLabel()) ? "n" : ""} ${p.typeLabel()}.`;
        if (p.isBlock()) p = this.splitOne(p);
        const old = this.residence();
        if (old && old !== p) { old.use = "vacant"; old.log(this.clock(), "Owner moved out"); }
        player.getHousingState().moveHere(housing);
        this.setResidence(p, player);
        this.reconcile(player);
        return null;
    }

    setUse(player: any, id: string, use: PropertyUse): string | null {
        const p = this.get(id);
        if (!p) return "Not found";
        if (use === "residence") return this.moveInto(player, id);
        if (p.use === "residence") return "Move somewhere else first.";
        if (use === "family") return "Pick a family member to move in.";
        if (p.use === "family" && p.occupants.length) p.log(this.clock(), "Family moved out");
        p.occupants = [];
        p.use = use;
        if (use === "rental") { p.log(this.clock(), "Listed for rent"); if (p.info().multiUnit || p.isBlock()) p.occupancy = p.occupancy ?? 0.5; }
        else { if (p.tenant) p.log(this.clock(), `Tenant ${p.tenant.name} moved out`); p.tenant = null; if (p.info().multiUnit || p.isBlock()) p.occupancy = 0; p.log(this.clock(), "Left vacant"); }
        return null;
    }

    setUpkeep(id: string, plan: string): string | null {
        const p = this.get(id);
        if (!p || !UPKEEP[plan]) return "Not found";
        p.upkeep = plan;
        p.log(this.clock(), `Upkeep plan: ${UPKEEP[plan].label}`);
        return null;
    }

    renovate(player: any, id: string, cat: string): string | null {
        const p = this.get(id);
        if (!p) return "Not found";
        const cost = this.renovationCost(p, cat);
        if (cost == null) return "Already fully renovated.";
        if (this.cash(player) < cost) return `You need ${this.fmt(cost)} in cash.`;
        this.pay(player, cost);
        const lvl = (p.renovations[cat] ?? 0) + 1;
        p.renovations[cat] = lvl;
        p.condition = clamp(p.condition + RENOVATIONS[cat].condition, 0, 100);
        (p as any).costsPaid = ((p as any).costsPaid ?? 0) + cost;
        p.log(this.clock(), `${RENOVATIONS[cat].label} renovated (${["Basic refresh", "Modern", "Luxury"][lvl - 1]}) for ${this.fmt(cost)}`);
        return null;
    }

    /** Fix a problem. DIY is cheap but can fail. Returns an error, or a result message prefixed with "ok:". */
    repair(player: any, id: string, problem: string, diy: boolean): string {
        const p = this.get(id);
        if (!p) return "Not found";
        const idx = p.problems.findIndex((x) => x.type === problem);
        if (idx < 0) return "ok:Already fixed.";
        const info = PROBLEMS[problem];
        if (diy && (!info.diy || p.info().multiUnit || p.isBlock())) return "That needs a professional.";
        const cost = this.repairCost(p, problem) * (diy ? RE.diyCostShare : 1);
        if (this.cash(player) < cost) return `You need ${this.fmt(cost)} in cash.`;
        this.pay(player, cost);
        (p as any).costsPaid = ((p as any).costsPaid ?? 0) + cost;
        if (diy && Math.random() > RE.diyRepairSuccess) {
            p.condition = clamp(p.condition - 1, 0, 100);
            p.log(this.clock(), `DIY repair of ${info.label.toLowerCase()} failed`);
            return `ok:Your DIY fix didn't hold — the ${info.label.toLowerCase()} is still there. Try again or call a pro.`;
        }
        p.problems.splice(idx, 1);
        p.log(this.clock(), `${info.label} fixed${diy ? " (DIY)" : ""} for ${this.fmt(cost)}`);
        return `ok:${info.label} fixed${diy ? " by you" : ""}.`;
    }

    /** General maintenance visit (pro every 4 weeks, DIY every 8) to restore condition. */
    service(player: any, id: string, diy: boolean): string | null {
        const p = this.get(id);
        if (!p) return "Not found";
        const wait = this.serviceWait(p, diy);
        if (wait > 0) return `Available again in ${wait} week${wait === 1 ? "" : "s"}.`;
        if (diy && (p.info().multiUnit || p.isBlock())) return "Too big to do yourself.";
        const cost = this.serviceCost(p, diy);
        if (this.cash(player) < cost) return `You need ${this.fmt(cost)} in cash.`;
        this.pay(player, cost);
        (p as any).costsPaid = ((p as any).costsPaid ?? 0) + cost;
        p.condition = clamp(p.condition + (diy ? RE.diyServiceGain : RE.serviceGain), 0, 100);
        (p as any)[diy ? "lastDiy" : "lastService"] = this.clock();
        p.log(this.clock(), diy ? "DIY maintenance" : `Maintenance crew visit (${this.fmt(cost)})`);
        return null;
    }
    serviceWait(p: OwnedProperty, diy: boolean): number {
        const last = (p as any)[diy ? "lastDiy" : "lastService"];
        if (last == null) return 0;
        return Math.max(0, (diy ? 8 : 4) - (this.clock() - last));
    }

    payOffMortgage(player: any, id: string): string | null {
        const p = this.get(id);
        if (!p?.mortgage) return "No mortgage.";
        const bal = p.mortgage.balance;
        if (this.cash(player) < bal) return `You need ${this.fmt(bal)} in cash.`;
        this.pay(player, bal);
        p.mortgage = null;
        p.log(this.clock(), `Mortgage paid off early (${this.fmt(bal)})`);
        return null;
    }

    // ------------------------------------------------------------------ family
    /** Family members who could live in a property you own (adults, not your partner, not already housed by you). */
    housableFamily(player: any): any[] {
        const out: any[] = [];
        for (const m of player.getFamilyState().getFamilyMembers()) {
            if (!m.getIsAlive() || m.getNotYetBorn?.() || m.getPetType?.() != null) continue;
            const rel = m.getRelationship();
            if (rel === Relationship.parent || (rel === Relationship.child && m.getAgeInYears() >= 18)) out.push(m);
        }
        return out;
    }
    whereLives(personId: string): OwnedProperty | undefined { return this.all().find((p) => p.occupants?.includes(personId)); }

    addOccupant(player: any, id: string, personId: string): string | null {
        const p = this.get(id);
        if (!p) return "Not found";
        if (p.use === "residence") return "They'd be living with you already.";
        if (p.info().multiUnit || p.isBlock() || !RealEstatePortfolio.housingOf(p.type).getLivable()) return "Pick a home, not an investment building.";
        const m = RealEstatePortfolio.familyMember(player, personId);
        if (!m) return "Not found";
        const prev = this.whereLives(personId);
        if (prev) { prev.occupants = prev.occupants.filter((x) => x !== personId); if (!prev.occupants.length) { prev.use = "vacant"; } prev.log(this.clock(), `${m.getFullName()} moved out`); }
        if (p.tenant) { p.log(this.clock(), `Tenant ${p.tenant.name} moved out`); p.tenant = null; }
        p.use = "family";
        p.occupants.push(personId);
        p.log(this.clock(), `${m.getFullName()} moved in`);
        return null;
    }

    removeOccupant(player: any, id: string, personId: string): string | null {
        const p = this.get(id);
        if (!p) return "Not found";
        const m = RealEstatePortfolio.familyMember(player, personId);
        p.occupants = p.occupants.filter((x) => x !== personId);
        p.log(this.clock(), `${m?.getFullName() ?? "Family member"} moved out`);
        if (!p.occupants.length) p.use = "vacant";
        return null;
    }

    /** Give a property to a family member. If they later become the heir, it's theirs again. */
    gift(player: any, id: string, personId: string): string | null {
        const p = this.get(id);
        if (!p) return "Not found";
        if (p.use === "residence") return "You can't give away the home you live in.";
        if (p.mortgage) return "Pay off the mortgage first.";
        const m = RealEstatePortfolio.familyMember(player, personId);
        if (!m || !m.getIsAlive()) return "Not found";
        this.properties = this.all().filter((x) => x !== p);
        this.bumpOwned(player, p.type, -p.units);
        if (p.tenant == null && p.use !== "rental") { p.use = "family"; p.occupants = [personId]; }
        p.log(this.clock(), `Gifted to ${m.getFullName()} by ${this.ownerLabel(player)}`);
        if (!this.gifted) this.gifted = [];
        this.gifted.push({ property: p, recipientId: personId, recipientName: m.getFullName(), clock: this.clock() });
        m.setRelationshipProgress(Math.min(RelationshipProgressStatus.INSTANCE.getMaxValue(), m.getRelationshipProgress() + 25));
        this.reconcile(player);
        return null;
    }

    // ------------------------------------------------------------------ inheritance
    /**
     * Called by Generations when `heirPerson` takes over from `parent`. The heir already holds the parent's
     * HousingState and this portfolio; this records the inheritance, returns gifts the heir received, and
     * moves the heir into the family home they were living in.
     */
    inherit(parent: any, heir: any, heirPerson: any) {
        const heirId = heirPerson.getId();
        for (const p of this.all()) {
            p.log(this.clock(), `Inherited by ${heir.getFullName()} from ${parent.getFullName()}`);
            p.occupants = (p.occupants ?? []).filter((x) => x !== heirId);
        }
        // Gifts made to the heir come back into the estate they now control.
        const mine = (this.gifted ?? []).filter((g) => g.recipientId === heirId);
        this.gifted = (this.gifted ?? []).filter((g) => g.recipientId !== heirId);
        for (const g of mine) {
            const p = g.property;
            p.occupants = (p.occupants ?? []).filter((x) => x !== heirId);
            p.log(this.clock(), `${heir.getFullName()} took over the property as head of the family`);
            this.all().push(p);
            this.bumpOwned(heir, p.type, p.units);
            if (p.use === "family" && !p.occupants.length) { p.use = "vacant"; (p as any).heirLivedHere = true; }
        }
        // Where does the heir live now? A family property they lived in (or were gifted and lived in), else the parent's home.
        const heirHome = this.all().find((p) => (p as any).heirLivedHere || (p as any).__heirOccupant);
        const parentHome = this.residence();
        if (heirHome && heirHome !== parentHome && RealEstatePortfolio.housingOf(heirHome.type).getLivable()) {
            if (parentHome) {
                const partner = heir.getFamilyState?.()?.getFamilyMembers?.()?.find?.((m: any) => m.getRelationship() === Relationship.parent && m.getIsAlive());
                parentHome.use = partner ? "family" : "vacant";
                parentHome.occupants = partner ? [partner.getId()] : [];
                parentHome.log(this.clock(), partner ? `${partner.getFullName()} stays on in the family home` : "Left vacant after the owner's death");
            }
            heir.getHousingState().moveHere(RealEstatePortfolio.housingOf(heirHome.type));
            heirHome.use = "residence";
            heirHome.tenant = null;
            heirHome.occupants = [];
        }
        for (const p of this.all()) { delete (p as any).heirLivedHere; delete (p as any).__heirOccupant; }
        this.reconcile(heir);
    }

    /** Before the family is rebuilt for the heir, remember which property the heir was living in. */
    markHeirHome(heirPerson: any) {
        const id = heirPerson.getId();
        const p = this.whereLives(id);
        if (p) (p as any).__heirOccupant = true;
        for (const g of this.gifted ?? []) if (g.recipientId === id && g.property.occupants?.includes(id)) (g.property as any).heirLivedHere = true;
    }
}
