// v0.27.0 "The Crime Update": crimes, gangs and crime families (pure data; rules in Crime.ts).
//
// Each crime: who can do it (minAge, needs), the odds (`odds` = base chance of success), the take ($ range),
// how much police attention it draws (`heat`), and the sentence range in weeks if you're convicted
// (0 = a fine instead). `respect` is street credibility. `kind` groups the crimes on the Underworld screen.

export type CrimeKind = "petty" | "theft" | "white" | "heist" | "violent";
export interface CrimeDef {
    id: string; title: string; kind: CrimeKind; image: string; fallback: string; blurb: string;
    minAge: number; odds: number; take: [number, number]; heat: number; sentence: [number, number];
    respect: number; violent?: boolean; crew?: boolean; skill?: "tech" | "con" | "fight" | "stealth" | "drive";
    fine?: number; needs?: string;
}
const C = (id: string, title: string, kind: CrimeKind, fallback: string, blurb: string, minAge: number, odds: number, take: [number, number], heat: number, sentence: [number, number], respect: number, extra: Partial<CrimeDef> = {}): CrimeDef =>
    ({ id, title, kind, image: "icon_crime_" + id.toLowerCase(), fallback, blurb, minAge, odds, take, heat, sentence, respect, ...extra });

export const CRIME_KINDS: { id: CrimeKind; title: string; blurb: string }[] = [
    { id: "petty", title: "Petty Crime", blurb: "Small risks, small rewards. Juvenile records are sealed at 18." },
    { id: "theft", title: "Theft & Robbery", blurb: "Cars, homes and stores." },
    { id: "white", title: "Scams & Fraud", blurb: "No masks needed: just a laptop and no conscience." },
    { id: "heist", title: "Big Heists", blurb: "Huge scores. You'll want a crew (a gang or a crime family)." },
    { id: "violent", title: "Violent Crime", blurb: "Dangerous, and judges show no mercy." },
];

export const CRIMES: CrimeDef[] = [
    // petty (13+)
    C("shoplift", "Shoplift", "petty", "work_retail", "Slip something into your pocket.", 13, 0.75, [20, 120], 4, [0, 0], 1, { fine: 300, skill: "stealth" }),
    C("pickpocket", "Pickpocket", "petty", "hud_cash", "A crowded train, a loose wallet.", 13, 0.7, [30, 300], 5, [0, 4], 1, { fine: 500, skill: "stealth" }),
    C("vandalism", "Graffiti a Wall", "petty", "education_art", "Leave your mark on the city.", 13, 0.8, [0, 0], 3, [0, 0], 2, { fine: 400 }),
    C("stealBike", "Steal a Bike", "petty", "health_workout", "Cut the lock, ride off.", 13, 0.75, [50, 250], 4, [0, 4], 1, { fine: 400, skill: "stealth" }),
    C("fakeIds", "Sell Fake IDs", "petty", "possesion_passport", "Students pay well to get into bars.", 16, 0.7, [200, 900], 7, [4, 12], 2, { skill: "tech" }),
    // theft (16+)
    C("carTheft", "Steal a Car", "theft", "possession_car", "Hotwire it and sell it to a chop shop.", 16, 0.6, [2000, 8000], 12, [12, 48], 4, { skill: "drive" }),
    C("burglary", "Burgle a House", "theft", "housing_house", "They're on vacation. Their TV isn't.", 18, 0.6, [1000, 6000], 12, [24, 96], 4, { skill: "stealth" }),
    C("mugging", "Mug Someone", "theft", "angry", "A dark alley and a threat.", 18, 0.65, [50, 600], 10, [24, 96], 4, { violent: true, skill: "fight" }),
    C("storeRobbery", "Rob a Convenience Store", "theft", "work_burger_flipper", "Empty the register.", 18, 0.55, [300, 2500], 18, [48, 192], 6, { violent: true, skill: "fight" }),
    C("sellContraband", "Sell Contraband", "theft", "health_pills", "Smuggled goods on the street corner.", 16, 0.6, [500, 3000], 12, [24, 144], 4, { skill: "con" }),
    // scams & fraud
    C("phoneScam", "Phone Scam", "white", "tab_social", "\"This is your bank calling…\"", 16, 0.6, [300, 4000], 8, [24, 96], 2, { skill: "con" }),
    C("identityTheft", "Identity Theft", "white", "possession_computer_2", "Open credit cards in someone else's name. Needs a computer.", 18, 0.55, [2000, 15000], 12, [48, 192], 3, { skill: "tech", needs: "computer" }),
    C("insuranceFraud", "Insurance Fraud", "white", "housing_family_home", "Your car was \"stolen\". Needs a car.", 18, 0.55, [5000, 20000], 14, [48, 192], 2, { skill: "con", needs: "car" }),
    C("embezzle", "Embezzle from Work", "white", "bank_withdrawal", "Skim from the company. Needs a job; you'll lose it if caught.", 18, 0.6, [3000, 30000], 15, [48, 240], 2, { skill: "con", needs: "job" }),
    C("policeBribe", "Take a Bribe", "white", "police_badge", "You're a cop: look the other way for cash. Getting caught ends your career.", 18, 0.8, [500, 3000], 6, [24, 96], 1, { skill: "con", needs: "police" }),
    C("cyberHeist", "Cyber Heist", "white", "possession_computer_3", "Hack a bank's servers. Tech jobs and degrees help a lot.", 18, 0.35, [20000, 200000], 25, [96, 480], 8, { skill: "tech", needs: "computer" }),
    // heists (crew)
    C("jewelryHeist", "Jewellery Store Heist", "heist", "iap_money3", "Smash the cases, grab the diamonds.", 18, 0.4, [30000, 120000], 30, [144, 480], 10, { crew: true, violent: true, skill: "stealth" }),
    C("bankRobbery", "Rob a Bank", "heist", "theft_robbank", "The classic.", 18, 0.35, [50000, 400000], 40, [240, 720], 15, { crew: true, violent: true, skill: "fight" }),
    C("armoredTruck", "Armoured Truck Heist", "heist", "possesion_nicecar", "Stop the truck, open the back.", 18, 0.35, [80000, 300000], 40, [240, 720], 15, { crew: true, violent: true, skill: "drive" }),
    C("artHeist", "Museum Art Heist", "heist", "love_museum", "A priceless painting, a buyer in Geneva.", 18, 0.3, [200000, 1500000], 45, [240, 960], 20, { crew: true, skill: "stealth" }),
    C("casinoHeist", "Casino Heist", "heist", "bank_lottery", "Eleven people, one vault.", 21, 0.25, [500000, 3000000], 50, [480, 1200], 25, { crew: true, skill: "con" }),
    // violent
    C("assault", "Start a Fight", "violent", "angry", "Pick a fight with a stranger.", 16, 0.7, [0, 0], 10, [12, 96], 3, { violent: true, skill: "fight" }),
    C("arson", "Arson", "violent", "business_factory_morale", "Burn a building down.", 18, 0.6, [0, 0], 25, [96, 480], 6, { violent: true, skill: "stealth" }),
];
export const CRIME_BY_ID: Record<string, CrimeDef> = Object.fromEntries(CRIMES.map((c) => [c.id, c]));
/** Murder (its own flow: pick a victim, then a method). Sentence in weeks. */
export const MURDER = { id: "murder", title: "Murder", sentence: [960, 2400] as [number, number], heat: 35, respect: 20 };
/** v0.28.0: an unsolved murder is closed after this many years (other crimes go cold after 5). */
export const MURDER_COLD_YEARS = 20;

// ---------------------------------------------------------------- organisations
export const GANG_RANKS = ["Prospect", "Member", "Enforcer", "Lieutenant", "Shot Caller"];
export const GANG_RESPECT = [0, 20, 60, 140, 300];
export const MAFIA_RANKS = ["Associate", "Soldier", "Capo", "Underboss", "Don"];
export const MAFIA_RESPECT = [0, 40, 120, 300, 600];
export const GANG_NAMES = ["Southside Vipers", "Iron Saints", "Red Dragons", "Midnight Kings", "Los Lobos", "Eastside Ravens", "The Black Hand Crew", "Northside Jackals", "Steel Serpents", "The Concrete Wolves"];
/** Fictional crime families, flavoured by country. */
export const FAMILY_NAMES: Record<string, string[]> = {
    default: ["The Moretti Family", "The Castellano Family", "The DeLuca Family", "The Romano Family"],
    russia: ["The Volkov Bratva", "The Sokolov Bratva"], poland: ["The Volkov Bratva"], ukraine: ["The Volkov Bratva"],
    japan: ["The Kurogane-kai", "The Shiranui-gumi"], china: ["The Jade Lotus Triad", "The Golden Dragon Triad"],
    vietnam: ["The Jade Lotus Triad"], thailand: ["The Golden Dragon Triad"], southKorea: ["The Seven Stars Pa"],
    mexico: ["The Sierra Syndicate", "The Del Mar Syndicate"], brazil: ["The Morro Commando"], argentina: ["The Sierra Syndicate"],
    ireland: ["The Kinahan Crew"], uk: ["The Firm of East End", "The Kray Street Firm"],
};
/** Fronts a Don can buy: weekly income (dollars) and how much heat they launder away. */
export const FRONTS: { id: string; title: string; price: number; income: number; launder: number; fallback: string }[] = [
    { id: "pizzeria", title: "Pizzeria", price: 150000, income: 2500, launder: 1, fallback: "diet_paella" },
    { id: "laundromat", title: "Laundromat", price: 200000, income: 3000, launder: 2, fallback: "skill_hygieneexpert" },
    { id: "nightclub", title: "Nightclub", price: 600000, income: 9000, launder: 2, fallback: "love_nightclub" },
    { id: "construction", title: "Construction Company", price: 1500000, income: 22000, launder: 3, fallback: "work_constructionworker" },
    { id: "wasteManagement", title: "Waste Management", price: 2500000, income: 35000, launder: 3, fallback: "business_factory1" },
    { id: "casinoFront", title: "Casino", price: 8000000, income: 110000, launder: 4, fallback: "bank_lottery" },
];
