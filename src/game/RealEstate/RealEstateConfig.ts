// Real estate tuning tables (Life Sim Upgraded — Property System Overhaul 1.0).
// Everything balance-related lives here so it can be tweaked without touching logic.
// Money values are in US dollars; the game converts them to the player's currency for display.

export interface TypeInfo {
    /** Housing enum name this property type corresponds to. */
    housing: string;
    label: string;
    category: "Residential" | "Investment";
    /** Base price at market index 1.0, US, Suburbs, condition ~85 (same as the original game's price). */
    basePrice: number;
    /** Original weekly rent this type earned when rented out (from the 1.05 build). */
    baseRent: number;
    /** Weekly utilities when someone lives there (tenants pay their own). */
    utilities: number;
    /** Multiplier on condition decay (big buildings wear slower relative to their size). */
    decay: number;
    /** Many tenants (occupancy %) instead of a single tenant. */
    multiUnit: boolean;
    neighborhoods: string[];
    /** Weekly happiness / sanity for whoever lives here (at ~85% condition; scales with condition). Replaces the
     *  original fixed housing modifiers for real homes. */
    comfort: number;
    calm: number;
    /** Image name (assets/images/<image>.svg|png). */
    image: string;
    /** Group shown in the market. */
    tier: "Starter" | "Mid-range" | "Luxury" | "Investment";
}

const RES = ["downtown", "waterfront", "suburbs", "oldTown", "rural"];
const BIG = ["downtown", "waterfront", "suburbs", "oldTown", "industrial"];

export const PROPERTY_TYPES: Record<string, TypeInfo> = {
    // Original 1.05 types (prices and rents unchanged)
    small_apartment: { housing: "small_apartment", label: "Apartment", category: "Residential", tier: "Starter", basePrice: 200000, baseRent: 200, utilities: 35, decay: 1.0, multiUnit: false, neighborhoods: RES, comfort: 0.2, calm: 0, image: "housing_small_apartment" },
    house: { housing: "house", label: "House", category: "Residential", tier: "Mid-range", basePrice: 500000, baseRent: 600, utilities: 70, decay: 1.0, multiUnit: false, neighborhoods: RES, comfort: 1.0, calm: 0, image: "housing_house" },
    luxury_condo: { housing: "luxury_condo", label: "Luxury Condo", category: "Residential", tier: "Luxury", basePrice: 1250000, baseRent: 1600, utilities: 110, decay: 0.9, multiUnit: false, neighborhoods: ["downtown", "waterfront", "suburbs"], comfort: 1.0, calm: 1.0, image: "housing_luxury_condo" },
    grand_estate: { housing: "grand_estate", label: "Grand Estate", category: "Residential", tier: "Luxury", basePrice: 10000000, baseRent: 12000, utilities: 450, decay: 0.9, multiUnit: false, neighborhoods: ["waterfront", "suburbs", "rural"], comfort: 2.0, calm: 1.0, image: "housing_grand_estate" },
    // New in v0.6.0 — mid-range homes
    townhouse: { housing: "house", label: "Townhouse", category: "Residential", tier: "Mid-range", basePrice: 350000, baseRent: 420, utilities: 50, decay: 1.0, multiUnit: false, neighborhoods: ["downtown", "suburbs", "oldTown"], comfort: 0.7, calm: 0, image: "housing_townhouse" },
    ranch_house: { housing: "house", label: "Ranch House", category: "Residential", tier: "Mid-range", basePrice: 650000, baseRent: 780, utilities: 80, decay: 1.05, multiUnit: false, neighborhoods: ["rural", "suburbs"], comfort: 1.1, calm: 0.3, image: "housing_ranch_house" },
    family_home: { housing: "house", label: "Family Home", category: "Residential", tier: "Mid-range", basePrice: 850000, baseRent: 1020, utilities: 100, decay: 1.0, multiUnit: false, neighborhoods: ["suburbs", "oldTown", "waterfront"], comfort: 1.3, calm: 0.3, image: "housing_family_home" },
    // New in v0.6.0 — high-end homes
    penthouse: { housing: "luxury_condo", label: "Penthouse", category: "Residential", tier: "Luxury", basePrice: 3000000, baseRent: 3600, utilities: 300, decay: 0.85, multiUnit: false, neighborhoods: ["downtown", "waterfront"], comfort: 1.6, calm: 1.2, image: "housing_penthouse" },
    beach_villa: { housing: "grand_estate", label: "Beachfront Villa", category: "Residential", tier: "Luxury", basePrice: 6000000, baseRent: 7200, utilities: 500, decay: 1.1, multiUnit: false, neighborhoods: ["waterfront"], comfort: 2.2, calm: 1.5, image: "housing_beach_villa" },
    hilltop_mansion: { housing: "grand_estate", label: "Hilltop Mansion", category: "Residential", tier: "Luxury", basePrice: 25000000, baseRent: 30000, utilities: 1500, decay: 0.9, multiUnit: false, neighborhoods: ["suburbs", "rural", "waterfront"], comfort: 3.0, calm: 1.6, image: "housing_hilltop_mansion" },
    // Investment buildings (can't live in them)
    apartmentComplex: { housing: "apartmentComplex", label: "Apartment Complex", category: "Investment", tier: "Investment", basePrice: 100000000, baseRent: 125000, utilities: 0, decay: 0.8, multiUnit: true, neighborhoods: BIG, comfort: 0, calm: 0, image: "housing_apartmentcomplex" },
    skyscraper: { housing: "skyscraper", label: "Skyscraper", category: "Investment", tier: "Investment", basePrice: 10000000000, baseRent: 15000000, utilities: 0, decay: 0.6, multiUnit: true, neighborhoods: ["downtown", "waterfront"], comfort: 0, calm: 0, image: "housing_skyscraper" },
    spaceHotel: { housing: "spaceHotel", label: "Space Hotel", category: "Investment", tier: "Investment", basePrice: 10000000000000, baseRent: 16000000000, utilities: 0, decay: 0.7, multiUnit: true, neighborhoods: ["orbit"], comfort: 0, calm: 0, image: "housing_spacehotel" },
};
/** Basic places to live that aren't properties (keep the original game's fixed effects and rent). */
export const BASIC_HOUSING = ["homeless", "shared_room", "parentsHouse", "jail"];

export const NEIGHBORHOODS: Record<string, { label: string; value: number; rent: number }> = {
    downtown: { label: "Downtown", value: 1.3, rent: 1.25 },
    waterfront: { label: "Waterfront", value: 1.55, rent: 1.35 },
    suburbs: { label: "Suburbs", value: 1.0, rent: 1.0 },
    oldTown: { label: "Old Town", value: 0.9, rent: 0.95 },
    rural: { label: "Countryside", value: 0.7, rent: 0.75 },
    industrial: { label: "Industrial District", value: 0.8, rent: 0.85 },
    orbit: { label: "Low Earth Orbit", value: 1.0, rent: 1.0 },
};

/** Location effects. taxRate is yearly property tax as a fraction of value. */
export const COUNTRIES: Record<string, { value: number; taxRate: number; cities: string[]; streetFormat: "us" | "eu" | "jp" }> = {
    unitedStates: { value: 1.0, taxRate: 0.011, cities: ["Springfield", "Riverside", "Lakewood", "Fairview", "Greenville"], streetFormat: "us" },
    canada: { value: 0.95, taxRate: 0.010, cities: ["Toronto", "Vancouver", "Calgary", "Ottawa", "Halifax"], streetFormat: "us" },
    japan: { value: 1.15, taxRate: 0.014, cities: ["Tokyo", "Osaka", "Kyoto", "Sapporo", "Fukuoka"], streetFormat: "jp" },
    france: { value: 1.1, taxRate: 0.008, cities: ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"], streetFormat: "eu" },
    spain: { value: 0.85, taxRate: 0.006, cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga"], streetFormat: "eu" },
    uk: { value: 1.2, taxRate: 0.005, cities: ["London", "Manchester", "Edinburgh", "Bristol", "Leeds"], streetFormat: "us" },
    china: { value: 0.9, taxRate: 0.003, cities: ["Shanghai", "Beijing", "Shenzhen", "Hangzhou", "Chengdu"], streetFormat: "us" },
};
export const DEFAULT_COUNTRY = "unitedStates";

export const STREETS = ["Maple", "Oak", "Cedar", "Elm", "Willow", "Birch", "Pine", "Lake", "Hill", "River", "Sunset", "Park",
    "Highland", "Meadow", "Harbor", "Church", "Mill", "Spring", "Forest", "Victoria", "Chestnut", "Rose", "King", "Queen"];
export const STREET_SUFFIX = ["St", "Ave", "Rd", "Lane", "Drive", "Court", "Way", "Blvd"];
export const BUILDING_NAMES = ["Plaza", "Tower", "Heights", "Residences", "Commons", "Gardens", "Court", "Place", "Center"];

export interface RenovationInfo {
    label: string;
    /** Per level (Basic, Modern, Luxury): cost as a fraction of the property's base market value. */
    cost: number[];
    /** Per level: value increase as a fraction of base market value. */
    value: number[];
    /** Weekly happiness for the residence per level reached (kitchens, baths and living rooms make home nicer). */
    comfort: number;
    condition: number;
}
export const RENOVATION_LEVELS = ["Basic refresh", "Modern", "Luxury"];
export const RENOVATIONS: Record<string, RenovationInfo> = {
    kitchen: { label: "Kitchen", cost: [0.04, 0.07, 0.12], value: [0.05, 0.07, 0.08], comfort: 0.12, condition: 8 },
    bathroom: { label: "Bathrooms", cost: [0.03, 0.05, 0.08], value: [0.04, 0.04, 0.05], comfort: 0.1, condition: 6 },
    bedroom: { label: "Bedrooms", cost: [0.025, 0.04, 0.06], value: [0.03, 0.03, 0.04], comfort: 0.08, condition: 5 },
    livingRoom: { label: "Living Room", cost: [0.03, 0.05, 0.07], value: [0.03, 0.04, 0.04], comfort: 0.1, condition: 5 },
    flooringWalls: { label: "Flooring & Walls", cost: [0.02, 0.035, 0.05], value: [0.025, 0.03, 0.035], comfort: 0.05, condition: 10 },
    exterior: { label: "Exterior & Garden", cost: [0.03, 0.05, 0.08], value: [0.04, 0.05, 0.06], comfort: 0.05, condition: 8 },
};

export interface ProblemInfo {
    description: string; label: string; costPct: number; minCost: number; weeklyDamage: number; chance: number; diy: boolean }
/** Things that go wrong. chance = relative likelihood; weeklyDamage = condition lost per week while unfixed. */
export const PROBLEMS: Record<string, ProblemInfo> = {
    leakyRoof: { description: "Water is coming through the roof", label: "Leaky roof", costPct: 0.010, minCost: 2500, weeklyDamage: 0.5, chance: 3, diy: true },
    burstPipe: { description: "A pipe burst and is flooding the floor", label: "Burst pipe", costPct: 0.006, minCost: 1200, weeklyDamage: 0.8, chance: 3, diy: true },
    brokenHeater: { description: "The heating has stopped working", label: "Broken heating", costPct: 0.008, minCost: 2000, weeklyDamage: 0.2, chance: 3, diy: false },
    electrical: { description: "There's a dangerous electrical fault", label: "Electrical fault", costPct: 0.007, minCost: 1500, weeklyDamage: 0.3, chance: 2, diy: false },
    pests: { description: "Pests have moved in", label: "Pest infestation", costPct: 0.004, minCost: 800, weeklyDamage: 0.4, chance: 3, diy: true },
    mold: { description: "Mold is spreading on the walls", label: "Mold", costPct: 0.006, minCost: 1500, weeklyDamage: 0.4, chance: 2, diy: true },
    brokenWindows: { description: "Some windows are broken", label: "Broken windows", costPct: 0.003, minCost: 600, weeklyDamage: 0.2, chance: 3, diy: true },
    foundation: { description: "The foundation has cracked", label: "Cracked foundation", costPct: 0.04, minCost: 15000, weeklyDamage: 0.6, chance: 1, diy: false },
};

/** Upkeep plans: yearly cost as a fraction of value; how fast the place wears; how often problems happen;
 *  after how many weeks a property manager fixes minor / major problems for you (at the normal pro price). */
export const UPKEEP: Record<string, { label: string; yearly: number; decay: number; problems: number; autoFixWeeks: number | null; autoFixMajorWeeks: number | null }> = {
    none: { label: "None (neglect)", yearly: 0, decay: 1.6, problems: 1.7, autoFixWeeks: null, autoFixMajorWeeks: null },
    standard: { label: "Standard", yearly: 0.004, decay: 0.2, problems: 0.8, autoFixWeeks: 3, autoFixMajorWeeks: 6 },
    premium: { label: "Premium", yearly: 0.01, decay: 0.05, problems: 0.35, autoFixWeeks: 1, autoFixMajorWeeks: 2 },
};

export const RE = {
    weeksPerYear: 48,
    /** Base condition loss per week before upkeep/type multipliers (~5.4/year with no upkeep, ~0.7 with standard upkeep). */
    baseDecay: 0.07,
    /** Base weekly chance that a property develops a problem (scaled by condition and upkeep). */
    problemChance: 0.0045,
    /** Market: long-run yearly growth trend, weekly volatility of the price index; rare booms/crashes. */
    marketDrift: 0.015,
    marketVolatility: 0.006,
    marketShockChance: 0.004,
    /** Selling costs (agent fees etc.) as a fraction of sale price. */
    sellingFees: 0.05,
    /** Mortgages. */
    downPayment: 0.2,
    mortgageRate: 0.055,
    mortgageYears: 30,
    maxDebtToIncome: 0.45,
    /** Market listings refresh this often. */
    listingRefreshWeeks: 4,
    listingCount: 8,
    rentalListingCount: 6,
    /** Professional maintenance visit: cost (fraction of value) and condition gained. */
    serviceCost: 0.004,
    serviceGain: 10,
    diyServiceGain: 5,
    diyRepairSuccess: 0.65,
    diyCostShare: 0.25,
    /** Weekly relationship bonus for family members you house for free. */
    familyHousingBonus: 0.3,
};

export function rand(min: number, max: number): number { return min + Math.random() * (max - min); }
export function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
export function clamp(x: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, x)); }
