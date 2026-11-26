// v0.33.0 "The Career Overhaul", stage 5: businesses, rebuilt.
//
// Found a company: pick one of 10 types, a name, how you pay for it (savings, a business loan, or investors who
// take a share), and a quality level. Then a few choices on one screen: prices, staff, marketing, whether you run it
// yourself or pay a manager, and new locations once it's doing well. Every week customers come (or don't) depending
// on quality, prices, reviews, staff, marketing and rivals, and the profit (or loss) is yours.
// Reviews (1–5 stars) follow quality, staffing and prices. Rivals open nearby; inspectors, viral reviews, theft and
// celebrity customers happen (random events). Sell it (offers come in), take it public at 5+ locations, or close it.
// Months of losses with poor reviews close it for you. Your heir inherits it.
// The original game's 5 businesses carry over as companies of the closest type, with the same weekly profit.
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Modifiers } from "../Managers/Modifiers";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Work, WorkDice, money } from "./Work";
import { CareerPath } from "./CareerPath";

export interface CompanyType {
    id: string; title: string; image: string; cost: number;
    /** Customers (or clients, jobs, sales) per location per week at normal demand. */
    customers: number; spend: number;
    /** Share of revenue spent on goods (at Standard quality). */
    goods: number; rent: number; staff: number; wage: number;
    names: string[]; blurb: string; skill?: string;
}
export const COMPANY_TYPES: CompanyType[] = [
    { id: "foodTruck", title: "Food Truck", image: "work_burger_flipper", cost: 15000, customers: 220, spend: 12, goods: 0.42, rent: 120, staff: 1, wage: 500, skill: "hospitality",
        names: ["Rolling Bites", "Taco Tornado", "Wheels & Meals", "The Hungry Hatch", "Street Heat"], blurb: "Cheap to start, goes where the crowds are." },
    { id: "cafe", title: "Café", image: "work_barista", cost: 40000, customers: 620, spend: 8, goods: 0.38, rent: 600, staff: 3, wage: 550, skill: "hospitality",
        names: ["The Daily Grind", "Bean There", "Morning Ritual", "Brew & Co.", "The Cozy Cup"], blurb: "Coffee, pastries and regulars." },
    { id: "restaurant", title: "Restaurant", image: "work_sushichef", cost: 250000, customers: 700, spend: 40, goods: 0.4, rent: 2500, staff: 8, wage: 650, skill: "hospitality",
        names: ["Saffron", "The Copper Pot", "Olive & Vine", "Harbor House", "Ember"], blurb: "Big money, big risk. Reviews make or break it." },
    { id: "salon", title: "Salon", image: "vacation_spa", cost: 60000, customers: 130, spend: 60, goods: 0.28, rent: 900, staff: 4, wage: 650,
        names: ["Shear Genius", "The Mane Event", "Glow", "Curl Up & Dye", "Velvet"], blurb: "Haircuts, nails and gossip." },
    { id: "clothing", title: "Clothing Brand", image: "work_artist", cost: 80000, customers: 300, spend: 45, goods: 0.48, rent: 1200, staff: 3, wage: 600, skill: "creative",
        names: ["Northbound", "Velour", "Common Thread", "Kin & Co.", "Lowkey"], blurb: "Design it, make it, sell it. Fame sells clothes." },
    { id: "gym", title: "Gym", image: "health_workout", cost: 150000, customers: 380, spend: 25, goods: 0.2, rent: 2000, staff: 4, wage: 600, skill: "sports",
        names: ["Iron Works", "Pulse Fitness", "The Grind House", "Peak", "Lift Lab"], blurb: "Members pay every week, whether they come or not." },
    { id: "tech", title: "Tech Startup", image: "business_software1", cost: 100000, customers: 45, spend: 420, goods: 0.25, rent: 1500, staff: 6, wage: 1600, skill: "tech",
        names: ["Nimbus", "Quanta", "Brightloop", "Stackwise", "Orbitly"], blurb: "Slow at first, then it can explode." },
    { id: "construction", title: "Construction Company", image: "business_factory1", cost: 120000, customers: 7, spend: 9000, goods: 0.58, rent: 800, staff: 10, wage: 900, skill: "trades",
        names: ["Cornerstone Builders", "Ironclad Construction", "Summit Works", "Keystone & Sons", "Bedrock"], blurb: "Big jobs, big crews, steady money." },
    { id: "farm", title: "Farm", image: "business_farm1", cost: 200000, customers: 40, spend: 1300, goods: 0.52, rent: 500, staff: 6, wage: 550,
        names: ["Sunny Acres", "Green Valley Farm", "Willow Creek Farm", "Golden Fields", "Meadowbrook"], blurb: "Weather-dependent, but people always need food." },
    { id: "realEstate", title: "Real Estate Agency", image: "business_realestate1", cost: 150000, customers: 4, spend: 9500, goods: 0.25, rent: 1000, staff: 5, wage: 1000,
        names: ["Keystone Realty", "Hearth & Home", "Prime Properties", "Open Door Realty", "Landmark Homes"], blurb: "Commission on every home you sell." },
];
export const QUALITY = [{ id: 0, title: "Budget", goods: 0.78, demand: 0.85, stars: 2.6 }, { id: 1, title: "Standard", goods: 1, demand: 1, stars: 3.5 }, { id: 2, title: "Premium", goods: 1.3, demand: 1.12, stars: 4.4 }];
export const PRICES = [{ id: 0, title: "Cheap", mult: 0.8, demand: 1.25, stars: 0.2 }, { id: 1, title: "Fair", mult: 1, demand: 1, stars: 0 }, { id: 2, title: "Pricey", mult: 1.25, demand: 0.78, stars: -0.25 }];
export const MARKETING = [0, 250, 1000, 5000];

export interface Company {
    id: string; type: string; name: string; quality: number; price: number; staff: number; marketing: number;
    locations: number; stars: number; handsOn: boolean; since: number;
    share: number; loan: number; lastProfit: number; lastCustomers: number; totalProfit: number;
    lossWeeks: number; rival: { name: string; until: number } | null; public: boolean; hype: number;
    profits: number[];
}
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { roll, rnd, pick, clamp } = WorkDice;
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const add = (p: any, n: number, type = MoneyUpdateType.passiveIncome) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), type, null, null, 12, null); };
const take = (p: any, n: number) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null); };
let seq = 0;

export const Companies = {
    managerWage: 1800,
    careful: (_p: any): boolean => false,
    maxCompanies: 3,
    type(id: string): CompanyType { return COMPANY_TYPES.find((t) => t.id === id) ?? COMPANY_TYPES[0]; },
    all(p: any = player()): Company[] {
        const w: any = Work.state(p);
        if (w.companies == null) { w.companies = []; Companies.convertOld(p, w.companies); }
        return w.companies;
    },
    get(id: string, p: any = player()): Company | undefined { return Companies.all(p).find((c) => c.id === id); },
    discount(p: any = player()): number { return CareerPath.founderDiscount(p) + (CareerPath.hasCert("realEstate", p) ? 0 : 0); },
    costOf(t: CompanyType, p: any = player()): number {
        let d = Companies.discount(p);
        if (t.id === "realEstate" && CareerPath.hasCert("realEstate", p)) d += 0.2;
        return Math.round(t.cost * (1 - Math.min(0.5, d)));
    },
    startBlock(t: CompanyType, p: any = player(), funding: "cash" | "loan" | "investors" = "cash"): string | null {
        if (p.getAgeInYears() < 18) return "From age 18";
        if (p.getCrimeState?.().getIsInJail?.()) return "Not from prison";
        if (Companies.all(p).filter((c) => !c.public).length >= Companies.maxCompanies) return `${Companies.maxCompanies} companies at once is plenty`;
        const cost = Companies.costOf(t, p);
        const need = funding === "cash" ? cost : funding === "loan" ? Math.round(cost * 0.2) : Math.round(cost * 0.5);
        if (cash(p) < need) return `Needs ${money(need)}`;
        return null;
    },
    /** Found a company. Funding: all from savings, a loan (20% down, repaid weekly over 2 years), or investors (they pay half for a quarter of the profits). */
    found(typeId: string, name: string, quality: number, funding: "cash" | "loan" | "investors", p: any = player()): Company | null {
        const t = Companies.type(typeId);
        if (Companies.startBlock(t, p, funding) != null) return null;
        const cost = Companies.costOf(t, p);
        let share = 0, loan = 0;
        if (funding === "cash") take(p, cost);
        else if (funding === "loan") { take(p, Math.round(cost * 0.2)); loan = Math.round(cost * 0.8 * 1.12); }
        else { take(p, Math.round(cost * 0.5)); share = 0.25; }
        const c: Company = {
            id: `co${Date.now().toString(36)}${(seq++).toString(36)}`, type: t.id, name, quality, price: 1, staff: t.staff, marketing: 0,
            locations: 1, stars: QUALITY[quality].stars, handsOn: Work.job(p) == null, since: Work.now(p),
            share, loan, lastProfit: 0, lastCustomers: 0, totalProfit: 0, lossWeeks: 0, rival: null, public: false, hype: 0, profits: [],
        };
        Companies.all(p).push(c);
        return c;
    },
    nameOptions(typeId: string, p: any = player()): string[] {
        const t = Companies.type(typeId);
        let last = "";
        try { last = p.getLastName(); } catch { /* ignore */ }
        const list = [...t.names].sort(() => Math.random() - 0.5).slice(0, 2);
        if (last) list.push(`${last} ${t.id === "construction" ? "Construction" : t.id === "realEstate" ? "Realty" : t.id === "farm" ? "Farm" : t.title}`);
        return list;
    },

    // ------------------------------------------------------------------ the week's numbers
    weeklyLoan(c: Company): number { return c.loan > 0 ? Math.min(c.loan, Math.round(Companies.costOf(Companies.type(c.type)) * 0.8 * 1.12 / 104)) : 0; },
    staffNeed(c: Company): number { return Companies.type(c.type).staff * c.locations; },
    demand(c: Company, p: any = player()): number {
        const t = Companies.type(c.type);
        const staffRatio = clamp(c.staff / Math.max(1, Companies.staffNeed(c)), 0.3, 1.3);
        const staffF = staffRatio < 1 ? 0.55 + 0.45 * staffRatio : 1 + (staffRatio - 1) * 0.15;
        const starsF = 0.55 + c.stars * 0.13;
        const mkt = [1, 1.08, 1.2, 1.38][MARKETING.indexOf(c.marketing)] ?? 1;
        const fame = c.type === "clothing" || c.type === "restaurant" || c.type === "gym" ? 1 + clamp(Math.log10(1 + Celebrity.fans(p)) / 30, 0, 0.25) : 1;
        const skill = t.skill ? 1 + CareerPath.skill(t.skill, p) / 400 : 1;
        const rival = c.rival && Work.now(p) < c.rival.until ? 0.85 : 1;
        const hands = c.handsOn ? 1.08 : 1;
        const hype = 1 + c.hype;
        // a tech startup is slow for its first year, then it can take off
        const young = c.type === "tech" ? clamp((Work.now(p) - c.since) / 52, 0.35, 1) * (c.since && Work.now(p) - c.since > 52 ? 1 + Math.min(1.5, (Work.now(p) - c.since - 52) / 150) : 1) : 1;
        return QUALITY[c.quality].demand * PRICES[c.price].demand * staffF * starsF * mkt * fame * skill * rival * hands * hype * young;
    },
    week(c: Company, p: any): number {
        const t = Companies.type(c.type);
        if (c.rival && Work.now(p) >= c.rival.until) c.rival = null;
        c.hype = Math.max(0, c.hype * 0.85 - 0.01);
        const customers = Math.round(t.customers * c.locations * Companies.demand(c, p) * (0.88 + Math.random() * 0.24));
        const revenue = customers * t.spend * PRICES[c.price].mult;
        const goods = revenue * t.goods * QUALITY[c.quality].goods;
        const wages = c.staff * t.wage + (c.handsOn ? 0 : Companies.managerWage * Math.max(1, Math.ceil(c.locations / 3)));
        const loan = Companies.weeklyLoan(c);
        const profit = Math.round(revenue - goods - wages - t.rent * c.locations - c.marketing - loan);
        c.loan = Math.max(0, c.loan - loan);
        c.lastCustomers = customers;
        c.lastProfit = profit;
        c.profits.push(profit); if (c.profits.length > 52) c.profits.shift();
        // reviews follow quality, staffing and prices
        const staffRatio = c.staff / Math.max(1, Companies.staffNeed(c));
        const target = clamp(QUALITY[c.quality].stars + PRICES[c.price].stars + (staffRatio < 0.8 ? -1 : staffRatio > 1.1 ? 0.3 : 0) + (c.handsOn ? 0.2 : 0), 1, 5);
        c.stars = clamp(c.stars + (target - c.stars) * 0.08 + (Math.random() - 0.5) * 0.05, 1, 5);
        const mine = c.public ? 0.3 : 1 - c.share;
        const yours = Math.round(profit * mine);
        c.totalProfit += yours;
        c.lossWeeks = profit < 0 ? c.lossWeeks + 1 : 0;
        return yours;
    },
    value(c: Company): number {
        const yearly = c.profits.length ? (c.profits.reduce((a, b) => a + b, 0) / c.profits.length) * 52 : 0;
        const t = Companies.type(c.type);
        return Math.max(Math.round(t.cost * 0.4 * c.locations), Math.round(yearly * 3)) * (c.public ? 0.3 : 1 - c.share);
    },
    weekly(p: any) {
        const list = Companies.all(p);
        let net = 0;
        for (const c of [...list]) {
            const yours = Companies.week(c, p);
            net += yours;
            Companies.events(c, p);
            if (!c.public && c.lossWeeks >= 16 && c.stars < 2.3) {
                Companies.close(c.id, p, true);
            }
        }
        if (net > 0) add(p, net);
        else if (net < 0) take(p, -net);
        // owners who run it themselves feel it
        const hands = list.filter((c) => c.handsOn && !c.public).length;
        if (hands && Work.job(p) != null) p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, 0, -1 * hands));
    },
    events(c: Company, p: any) {
        if (c.public || !roll(0.03)) return;
        const t = Companies.type(c.type);
        let ev = pick(["rival", "inspection", "viral", "theft", "supplier", "celebrity", "offer"]);
        if ((ev === "theft" || ev === "supplier") && Companies.careful(p) && roll(0.5)) return;   // accounting software
        if (ev === "rival" && !c.rival) { c.rival = { name: pick(t.names.filter((n) => n !== c.name)) ?? "A new rival", until: Work.now(p) + rnd(26, 60) }; Work.say("A Rival Opens", `${c.rival.name} opened just down the street from ${c.name}. Customers are curious. (Fewer customers for a while; lower prices or better reviews win them back.)`, t.image); }
        else if (ev === "inspection") { const pass = c.stars + (c.quality - 1) * 0.5 + Math.random() > 3; if (pass) Work.say("Inspection", `The inspector gave ${c.name} a clean bill of health.`, t.image); else { take(p, 2000 * c.locations); c.stars = Math.max(1, c.stars - 0.4); Work.say("Inspection", `${c.name} failed an inspection: ${money(2000 * c.locations)} in fines, and the reviews took a hit.`, t.image); } }
        else if (ev === "viral") { c.hype += 0.5; c.stars = Math.min(5, c.stars + 0.3); Work.say("Gone Viral", `A glowing review of ${c.name} went viral. The line is out the door.`, t.image); }
        else if (ev === "theft") { const n = Math.round(t.wage * rnd(1, 3)); take(p, n); Work.say("Theft", `Someone at ${c.name} was stealing from the till: ${money(n)} gone. You let them go.`, t.image); c.staff = Math.max(0, c.staff - 1); }
        else if (ev === "supplier") { const n = Math.round(t.customers * t.spend * 0.2); take(p, n); Work.say("Supplier Trouble", `Your supplier let ${c.name} down. Rush orders cost ${money(n)}.`, t.image); }
        else if (ev === "celebrity") { c.hype += 0.3; Work.say("A Famous Customer", `A celebrity was spotted at ${c.name}. Everyone wants to go now.`, t.image); }
        else if (ev === "offer" && Companies.value(c) > 20000) {
            const offer = Math.round(Companies.value(c) * (1.1 + Math.random() * 0.4));
            Work.say("A Buyer Calls", `Someone wants to buy ${c.name} for ${money(offer)}. The offer is on its screen (Work tab) for 8 weeks.`, t.image);
            (c as any).offer = { amount: offer, until: Work.now(p) + 8 };
        }
    },

    // ------------------------------------------------------------------ decisions
    setPrice(c: Company, n: number) { c.price = clamp(n, 0, 2); },
    setQuality(c: Company, n: number) { c.quality = clamp(n, 0, 2); },
    setMarketing(c: Company, n: number) { if (MARKETING.includes(n)) c.marketing = n; },
    hire(c: Company, n: number) { c.staff = clamp(c.staff + n, 0, 400); },
    setHandsOn(c: Company, on: boolean) { c.handsOn = on; },
    expandBlock(c: Company, p: any = player()): string | null {
        if (c.public) return "The board decides that now";
        if (Work.now(p) - c.since < 26) return "Open for at least 6 months first";
        const recent = c.profits.slice(-8);
        if (recent.length < 8 || recent.reduce((a, b) => a + b, 0) <= 0) return "Needs 2 profitable months first";
        if (cash(p) < Companies.expandCost(c, p)) return `Costs ${money(Companies.expandCost(c, p))}`;
        return null;
    },
    expandCost(c: Company, p: any = player()): number { return Math.round(Companies.costOf(Companies.type(c.type), p) * 0.8); },
    expand(c: Company, p: any = player()): string {
        if (Companies.expandBlock(c, p) != null) return "";
        take(p, Companies.expandCost(c, p));
        c.locations++;
        c.staff += Companies.type(c.type).staff;
        return `${c.name} now has ${c.locations} locations. You hired ${Companies.type(c.type).staff} more staff for the new one.`;
    },
    sell(id: string, p: any = player(), amount?: number): string {
        const c = Companies.get(id, p); if (!c) return "";
        const v = amount ?? Math.round(Companies.value(c) * 0.85);
        add(p, v, MoneyUpdateType.sell);
        if (c.loan > 0) take(p, c.loan);
        Work.state(p).companies = Companies.all(p).filter((x) => x.id !== id);
        (Work.state(p) as any).soldCompanies = ((Work.state(p) as any).soldCompanies ?? 0) + 1;
        return `You sold ${c.name} for ${money(v)}${c.loan > 0 ? ` and paid off the ${money(c.loan)} loan` : ""}.`;
    },
    ipoBlock(c: Company): string | null {
        if (c.public) return "Already public";
        if (c.locations < 5) return "Needs 5 locations";
        const yearly = c.profits.reduce((a, b) => a + b, 0) / Math.max(1, c.profits.length) * 52;
        if (yearly < 1_000_000) return `Needs ${money(1_000_000)} a year in profit`;
        return null;
    },
    ipo(id: string, p: any = player()): string {
        const c = Companies.get(id, p); if (!c || Companies.ipoBlock(c) != null) return "";
        const yearly = c.profits.reduce((a, b) => a + b, 0) / Math.max(1, c.profits.length) * 52;
        const payout = Math.round(yearly * 6 * 0.7 * (1 - c.share));
        add(p, payout, MoneyUpdateType.sell);
        if (c.loan > 0) { take(p, c.loan); c.loan = 0; }
        c.public = true; c.share = 0; c.handsOn = false;
        try { Celebrity.addFans(p, 20000); } catch { /* ignore */ }
        return `The bell rang: ${c.name} is on the stock market. You sold most of your shares for ${money(payout)} and keep 30% of the profits as dividends.`;
    },
    close(id: string, p: any = player(), forced = false): string {
        const c = Companies.get(id, p); if (!c) return "";
        const salvage = Math.round(Companies.type(c.type).cost * 0.15 * c.locations);
        add(p, salvage, MoneyUpdateType.sell);
        if (c.loan > 0) take(p, c.loan);
        Work.state(p).companies = Companies.all(p).filter((x) => x.id !== id);
        const msg = `${c.name} closed its doors. You got ${money(salvage)} for the equipment${c.loan > 0 ? ` and paid off the ${money(c.loan)} loan` : ""}.`;
        if (forced) Work.say("Out of Business", `Months of losses and bad reviews: ${msg}`, Companies.type(c.type).image);
        return msg;
    },

    // ------------------------------------------------------------------ the original game's businesses
    convertOld(p: any, list: Company[]) {
        let states: any[] = [];
        try { states = Array.from(p.getBusinessState().getStates() as any); } catch { return; }
        const map: Record<string, string> = { factory: "construction", softwareCompany: "tech", restaurantChain: "restaurant", realEstateCompany: "realEstate", farm: "farm" };
        for (const st of states) {
            if (!(st.getLevel?.() > 0)) continue;
            const typeId = map[st.getType().name()] ?? "cafe";
            const t = Companies.type(typeId);
            let profit = 0; try { profit = Number(st.getTotalProfit().toString()); } catch { /* ignore */ }
            const units = (() => { try { return Number(st.getNumberOfBusinessUnits().toString()); } catch { return 1; } })();
            const loc = clamp(Math.round(st.getLevel() / 2), 1, 8);
            const c: Company = {
                id: `co${Date.now().toString(36)}${(seq++).toString(36)}`, type: typeId, name: st.getName?.() ?? pick(t.names), quality: 1, price: 1,
                staff: Math.max(t.staff * loc, Math.min(400, units)), marketing: 0, locations: loc, stars: 3.8, handsOn: false, since: Work.now(p) - 52,
                share: 0, loan: 0, lastProfit: profit, lastCustomers: 0, totalProfit: 0, lossWeeks: 0, rival: null, public: false, hype: 0, profits: [profit],
            };
            list.push(c);
        }
    },
};
