// v0.36.0 The Remaster: the Bank's data (sectors, companies, funds, the economy, loans, goals). Rules in Bank.ts.

export type SectorId = "tech" | "energy" | "health" | "finance" | "retail" | "media" | "travel" | "industry";
export interface Sector { id: SectorId; title: string; vol: number; beta: number; blurb: string }
/** vol: weekly price swing (standard deviation); beta: how hard the economy moves it. */
export const SECTORS: Sector[] = [
    { id: "tech", title: "Technology", vol: 0.045, beta: 1.5, blurb: "Big swings, big growth." },
    { id: "energy", title: "Energy", vol: 0.04, beta: 1.1, blurb: "Rides the price of oil and the weather." },
    { id: "health", title: "Healthcare", vol: 0.025, beta: 0.6, blurb: "People get sick in good times and bad." },
    { id: "finance", title: "Finance", vol: 0.03, beta: 1.3, blurb: "Banks boom with the economy, and crash with it." },
    { id: "retail", title: "Retail", vol: 0.03, beta: 1.0, blurb: "What people buy when they feel rich." },
    { id: "media", title: "Entertainment", vol: 0.04, beta: 1.0, blurb: "Hits and flops." },
    { id: "travel", title: "Travel", vol: 0.045, beta: 1.6, blurb: "First to fall in a downturn, first to fly back." },
    { id: "industry", title: "Industry & Autos", vol: 0.03, beta: 1.2, blurb: "Factories, cars and cranes." },
];

export interface Company { id: string; name: string; sector: SectorId; price: number; edge: number; blurb: string }
/** edge: the company's own long-run drift per year on top of the market (good or bad management). Fictional names. */
export const COMPANIES: Company[] = [
    { id: "nimbus", name: "Nimbus Systems", sector: "tech", price: 180, edge: 0.04, blurb: "Cloud servers for half the internet." },
    { id: "quanta", name: "Quanta Chips", sector: "tech", price: 95, edge: 0.06, blurb: "Makes the chips in everything." },
    { id: "pixelforge", name: "Pixelforge", sector: "tech", price: 42, edge: -0.01, blurb: "Phone apps and a lot of promises." },
    { id: "lumen", name: "Lumen AI", sector: "tech", price: 260, edge: 0.03, blurb: "Everybody's favourite chatbot. Very volatile." },
    { id: "sunrise", name: "Sunrise Power", sector: "energy", price: 55, edge: 0.03, blurb: "Solar farms and big batteries." },
    { id: "deepwell", name: "Deepwell Oil", sector: "energy", price: 70, edge: -0.01, blurb: "Old oil money; pays a fat dividend." },
    { id: "gale", name: "Gale Wind", sector: "energy", price: 28, edge: 0.02, blurb: "Turbines on hills and at sea." },
    { id: "vita", name: "Vita Pharma", sector: "health", price: 140, edge: 0.02, blurb: "Pills you've heard of." },
    { id: "helix", name: "Helix Bio", sector: "health", price: 35, edge: 0.03, blurb: "Gene therapy start-up: a cure or bust." },
    { id: "carefirst", name: "CareFirst Clinics", sector: "health", price: 88, edge: 0.01, blurb: "Clinics in every town." },
    { id: "granite", name: "Granite Bank", sector: "finance", price: 64, edge: 0.01, blurb: "A big, boring bank." },
    { id: "lighthouse", name: "Lighthouse Insurance", sector: "finance", price: 110, edge: 0.015, blurb: "Insures houses, cars and pets." },
    { id: "coinbridge", name: "Coinbridge", sector: "finance", price: 48, edge: 0.0, blurb: "A crypto exchange. Wild." },
    { id: "bramble", name: "Bramble Market", sector: "retail", price: 52, edge: 0.01, blurb: "The supermarket down the road." },
    { id: "threads", name: "Urban Threads", sector: "retail", price: 31, edge: 0.0, blurb: "Fast fashion, fast trends." },
    { id: "quickcart", name: "QuickCart", sector: "retail", price: 210, edge: 0.04, blurb: "Online shopping, delivered tomorrow." },
    { id: "starlight", name: "Starlight Studios", sector: "media", price: 120, edge: 0.01, blurb: "Blockbusters and streaming." },
    { id: "echo", name: "Echo Records", sector: "media", price: 26, edge: 0.0, blurb: "Pop stars on their label (maybe you, one day)." },
    { id: "arcade", name: "Arcade Nine", sector: "media", price: 75, edge: 0.03, blurb: "Video games people can't stop playing." },
    { id: "skyway", name: "Skyway Airlines", sector: "travel", price: 22, edge: -0.005, blurb: "Cheap seats, thin margins." },
    { id: "harbor", name: "Harbor Cruises", sector: "travel", price: 38, edge: 0.0, blurb: "Floating hotels." },
    { id: "roam", name: "Roam Hotels", sector: "travel", price: 92, edge: 0.02, blurb: "A hotel in every city you've heard of." },
    { id: "ironworks", name: "Ironworks Motors", sector: "industry", price: 58, edge: 0.0, blurb: "Pickups and family cars." },
    { id: "volt", name: "Volt Motors", sector: "industry", price: 150, edge: 0.04, blurb: "Electric cars; loved and doubted." },
    { id: "atlas", name: "Atlas Construction", sector: "industry", price: 44, edge: 0.015, blurb: "Bridges, towers and roads." },
    { id: "orbit", name: "Orbit Aerospace", sector: "industry", price: 175, edge: 0.03, blurb: "Rockets for hire." },
    { id: "brew", name: "Copper Kettle Coffee", sector: "retail", price: 66, edge: 0.02, blurb: "A coffee shop on every corner." },
    { id: "pawpal", name: "PawPal", sector: "retail", price: 19, edge: 0.02, blurb: "Pet food and toys, by subscription." },
    { id: "beacon", name: "Beacon Telecom", sector: "tech", price: 34, edge: 0.0, blurb: "Your phone and internet bill." },
    { id: "meridian", name: "Meridian Shipping", sector: "industry", price: 81, edge: 0.01, blurb: "Container ships around the world." },
];

export type FundId = "index" | "bonds" | "crypto" | "gold";
export interface Fund { id: FundId; title: string; price: number; blurb: string; risk: string }
export const FUNDS: Fund[] = [
    { id: "index", title: "Index Fund", price: 100, risk: "Medium", blurb: "A little of every company. The set-it-and-forget-it choice." },
    { id: "bonds", title: "Government Bonds", price: 100, risk: "Low", blurb: "Slow and steady: about 3.5% a year, and they hold up in a recession." },
    { id: "gold", title: "Gold", price: 100, risk: "Medium", blurb: "Shines when everything else is falling." },
    { id: "crypto", title: "Crypto", price: 1000, risk: "Very high", blurb: "Could double. Could halve. In a week." },
];

export type Phase = "boom" | "steady" | "slump" | "recession";
/** Yearly market return in each phase (stocks, before each sector's beta). */
export const PHASES: { id: Phase; title: string; yearly: number; blurb: string }[] = [
    { id: "boom", title: "Boom", yearly: 0.18, blurb: "Jobs are easy to find and stocks keep climbing." },
    { id: "steady", title: "Steady", yearly: 0.07, blurb: "A normal economy." },
    { id: "slump", title: "Slowdown", yearly: -0.04, blurb: "Growth has stalled. People are careful." },
    { id: "recession", title: "Recession", yearly: -0.22, blurb: "Layoffs and falling prices. Bonds and gold hold up." },
];

export type LoanKind = "personal" | "car" | "student" | "credit";
export interface LoanOffer { id: string; kind: LoanKind; title: string; amount: number; years: number; minCredit: number }
export const LOAN_OFFERS: LoanOffer[] = [
    { id: "p5", kind: "personal", title: "Personal Loan", amount: 5_000, years: 2, minCredit: 520 },
    { id: "p20", kind: "personal", title: "Personal Loan", amount: 20_000, years: 3, minCredit: 580 },
    { id: "p50", kind: "personal", title: "Personal Loan", amount: 50_000, years: 5, minCredit: 640 },
    { id: "s30", kind: "student", title: "Student Loan", amount: 30_000, years: 10, minCredit: 0 },
];

/** Credit score bands (FICO-style 300–850). */
export const CREDIT_BANDS: { min: number; title: string; rate: number; mortgage: number }[] = [
    { min: 800, title: "Exceptional", rate: 0.06, mortgage: 0.045 },
    { min: 740, title: "Very Good", rate: 0.08, mortgage: 0.05 },
    { min: 670, title: "Good", rate: 0.11, mortgage: 0.055 },
    { min: 580, title: "Fair", rate: 0.16, mortgage: 0.065 },
    { min: 300, title: "Poor", rate: 0.24, mortgage: 0.08 },
];

export interface GoalDef { id: string; title: string; target: number; image: string; blurb: string }
export const GOALS: GoalDef[] = [
    { id: "rainy", title: "Rainy Day Fund", target: 10_000, image: "bank_deposit", blurb: "A cushion for when things go wrong." },
    { id: "car", title: "A New Car", target: 35_000, image: "possession_car", blurb: "Pay cash, skip the loan." },
    { id: "wedding", title: "A Wedding", target: 30_000, image: "love_marry", blurb: "The big day." },
    { id: "travel", title: "The Trip of a Lifetime", target: 20_000, image: "vacation_luxury", blurb: "Somewhere far away, for a long time." },
    { id: "house", title: "A House Deposit", target: 80_000, image: "housing_house", blurb: "20% down on a home of your own." },
    { id: "college", title: "College for the Kids", target: 100_000, image: "education_masters", blurb: "So they don't start life in debt." },
    { id: "million", title: "A Million", target: 1_000_000, image: "achievement_money_collector", blurb: "Seven figures." },
    { id: "retire", title: "Retire Early", target: 2_000_000, image: "vacation_spa", blurb: "Enough to never work again." },
];

/** Lottery: scratch cards and the weekly jackpot. */
export const SCRATCH = { cost: 5, odds: [[0.0000025, 1_000_000], [0.0005, 10_000], [0.01, 500], [0.08, 20], [0.2, 5]] as [number, number][] };
export const JACKPOT = { cost: 2, odds: 1 / 30_000_000, base: 20_000_000, rollover: 5_000_000 };
