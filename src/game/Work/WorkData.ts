// v0.33.0 "The Career Overhaul": the fixed tables. Rules live in Work.ts, rows in WorkScreens.ts.

export type EffortId = "coast" | "steady" | "hard" | "grind";
export interface EffortDef {
    id: EffortId; title: string; short: string;
    /** Pay multiplier for the week. */
    pay: number;
    /** Where performance settles if you keep this effort. */
    target: number;
    /** Promotion progress per week (the old game: 1). */
    progress: number;
    /** Health, happiness, sanity every week you work. */
    mods: [number, number, number];
    /** How Illness counts it towards burnout (the old WorkAction names). */
    overwork: "coast" | "normal" | "hard" | "veryHard";
    blurb: string;
}
export const EFFORTS: EffortDef[] = [
    { id: "coast", title: "Coasting", short: "Coast", pay: 1.0, target: 35, progress: 0.5, mods: [0, 0, 1], overwork: "coast",
        blurb: "The bare minimum. Stress falls, but performance slides and promotions crawl." },
    { id: "steady", title: "Steady", short: "Steady", pay: 1.0, target: 60, progress: 1, mods: [0, -1, 0], overwork: "normal",
        blurb: "A normal week's work. Meets expectations." },
    { id: "hard", title: "Hard Worker", short: "Hard", pay: 1.15, target: 78, progress: 1.25, mods: [0, -2, -1], overwork: "hard",
        blurb: "Overtime most days: 15% more pay, and your boss notices." },
    { id: "grind", title: "Grinding", short: "Grind", pay: 1.35, target: 92, progress: 1.5, mods: [-1, -3, -2], overwork: "veryHard",
        blurb: "Nights and weekends: 35% more pay and the fastest climb, but burnout builds week after week." },
];
export const effortDef = (id: string | null | undefined): EffortDef => EFFORTS.find((e) => e.id === id) ?? EFFORTS[1];

/** Performance ratings (yearly reviews use the same bands). */
export const RATINGS: { min: number; id: string; title: string; tone: string }[] = [
    { min: 85, id: "outstanding", title: "Outstanding", tone: "gold" },
    { min: 65, id: "exceeds", title: "Exceeds Expectations", tone: "green" },
    { min: 40, id: "meets", title: "Meets Expectations", tone: "blue" },
    { min: 0, id: "needsWork", title: "Needs Work", tone: "red" },
];
export const ratingOf = (perf: number) => RATINGS.find((r) => perf >= r.min) ?? RATINGS[RATINGS.length - 1];
/** Performance a promotion needs. */
export const PROMOTION_PERF = 40;
/** Burnout: Illness.state.overwork at this level catches Burnout for sure (the old game's risk starts at 8). */
export const BURNOUT_FULL = 12;
export const ALL_NIGHTER_EVERY = 4;

export type VibeId = "friendly" | "cutthroat" | "chill" | "prestigious" | "chaotic";
export const VIBES: Record<VibeId, { title: string; blurb: string; pay: number; target: number; mods: [number, number, number] }> = {
    friendly: { title: "Friendly", blurb: "People look out for each other.", pay: 1, target: 0, mods: [0, 1, 0] },
    cutthroat: { title: "Cut-throat", blurb: "Better pay, sharp elbows.", pay: 1.08, target: -3, mods: [0, -1, -1] },
    chill: { title: "Chill", blurb: "Nobody's in a hurry.", pay: 0.97, target: -4, mods: [0, 1, 1] },
    prestigious: { title: "Prestigious", blurb: "A name that opens doors.", pay: 1.05, target: 0, mods: [0, 0, 0] },
    chaotic: { title: "Chaotic", blurb: "Never a dull week.", pay: 1, target: 0, mods: [0, 0, -1] },
};
export const VIBE_IDS = Object.keys(VIBES) as VibeId[];

export type PerkId = "remote" | "insurance" | "pension" | "match" | "gym" | "meals" | "flexible" | "courses" | "car" | "stock";
export const PERKS: Record<PerkId, { title: string; blurb: string }> = {
    remote: { title: "Remote days", blurb: "You can work from home." },
    insurance: { title: "Health insurance", blurb: "Your job covers your health insurance." },
    pension: { title: "Pension", blurb: "A pension when you retire, growing with every year here." },
    match: { title: "401(k) match", blurb: "Your employer adds to your 401(k)." },
    gym: { title: "Gym membership", blurb: "Your job pays for your gym." },
    meals: { title: "Free meals", blurb: "+1 health a week you work." },
    flexible: { title: "Flexible hours", blurb: "Less stress: +1 sanity a week you work." },
    courses: { title: "Paid courses", blurb: "Your job pays for online courses." },
    car: { title: "Company car", blurb: "A car for work (and the weekend)." },
    stock: { title: "Stock grants", blurb: "A share bonus every year." },
};
export const PERK_IDS = Object.keys(PERKS) as PerkId[];
/** Perks more likely in each career group. */
export const GROUP_PERKS: Record<string, PerkId[]> = {
    health: ["insurance", "pension", "meals"], trades: ["car", "insurance", "pension"], public: ["pension", "insurance", "flexible"],
    tech: ["remote", "stock", "courses", "match", "gym"], creative: ["remote", "flexible"], hospitality: ["meals", "flexible"],
    science: ["pension", "courses", "insurance"], sports: ["gym", "meals"], starter: ["meals"], entertainment: ["flexible", "car"],
};

const PLACES = ["Riverside", "Lakeview", "Northside", "Maple", "Harbor", "Summit", "Oakwood", "Bayview", "Cedar", "Pinecrest", "Silver Lake",
    "Brookfield", "Westgate", "Eastwood", "Redwood", "Sunnyvale", "Fairview", "Kingston", "Hillcrest", "Willow Creek", "Bluewater", "Granite"];
const KINDS: Record<string, string[]> = {
    health: ["General Hospital", "Medical Center", "Family Clinic", "Health", "Veterinary Clinic", "Dental Care", "Children's Hospital"],
    trades: ["Electrical", "Plumbing Co.", "Construction", "Auto Repair", "Builders", "Freight", "Contractors"],
    public: ["City Services", "Fire Department", "Police Department", "Post Office", "County Office", "State Parks", "Public Schools"],
    tech: ["Software", "Labs", "Systems", "Digital", "Data Co.", "Games", "Cloud"],
    creative: ["Media", "Studios", "Press", "Design", "Gazette", "Pictures", "Agency"],
    hospitality: ["Grill", "Hotel", "Bistro", "Airlines", "Resort", "Café", "Kitchen"],
    science: ["Research Institute", "Aquarium", "Space Center", "Engineering", "Zoo", "Observatory", "Laboratories"],
    sports: ["Athletics", "Fitness", "Sports Club", "Gym", "Recreation", "Esports", "Stadium"],
    starter: ["Mart", "Supermarket", "Deliveries", "Diner", "Outlet", "Warehouse", "Rides"],
    entertainment: ["Talent Agency", "Studios", "Records", "Productions", "Theatre", "Entertainment", "Live"],
};
export function employerName(group: string, rnd: () => number = Math.random): string {
    const kinds = KINDS[group] ?? KINDS.starter;
    return `${PLACES[Math.floor(rnd() * PLACES.length)]} ${kinds[Math.floor(rnd() * kinds.length)]}`;
}

/** Art slots for v0.33 (the user can draw these; until then the fallback shows). */
export const WORK_ICONS: { name: string; fallback: string; where: string; row: string }[] = [
    { name: "icon_work_effort", fallback: "tab_briefcase", where: "Work › Your Job", row: "Effort" },
    { name: "icon_work_wfh", fallback: "possession_computer_2", where: "Work › Your Job", row: "Work from Home" },
    { name: "icon_work_allnighter", fallback: "work_data_entry", where: "Work › Your Job", row: "Pull an All-nighter" },
];

// ------------------------------------------------------------------ hiring (stage 2)
/** Openings refresh this often (Job Board Premium makes it 2). */
export const OPENINGS_EVERY = 4;
/** At or above this Hire Score you skip the interview. */
export const SKIP_INTERVIEW = 85;
/** Offers wait this long for an answer. */
export const OFFER_WEEKS = 4;
/** Upbringing traits (v0.32) that suit each career group. */
export const GROUP_FIT: Record<string, string[]> = {
    health: ["kind", "brainiac", "bookworm", "hardWorker"], trades: ["hardWorker", "athlete", "resilient"],
    public: ["leader", "kind", "resilient", "golden"], tech: ["brainiac", "bookworm", "creative"],
    creative: ["creative", "musical", "rebel"], hospitality: ["social", "kind", "hardWorker"],
    science: ["brainiac", "bookworm", "hardWorker"], sports: ["athlete", "leader", "resilient"],
    starter: ["hardWorker", "social"], entertainment: ["musical", "social", "creative", "golden"],
};
/** Groups where your health counts at hiring. */
export const PHYSICAL_GROUPS = ["public", "trades", "sports"];
/** Groups where looks count at hiring. */
export const LOOKS_GROUPS = ["entertainment", "hospitality", "creative"];

export type AnswerStyle = "confident" | "honest" | "funny" | "humble";
/** Interview questions: each answer leans on a trait. */
export const QUESTIONS: { q: string; answers: Record<AnswerStyle, string> }[] = [
    { q: "Why do you want this job?", answers: {
        confident: "\"Because I'd be great at it, and you know it.\"", honest: "\"Honestly? The work interests me, and so does the pay.\"",
        funny: "\"My plants told me to aim higher.\"", humble: "\"I'd love the chance to learn from a team like yours.\"" } },
    { q: "Tell us about a challenge you overcame.", answers: {
        confident: "Tell the story where you saved the day.", honest: "Talk about a time you failed and what you learned.",
        funny: "Describe assembling flat-pack furniture with no instructions.", humble: "Credit the people who helped you through it." } },
    { q: "Where do you see yourself in five years?", answers: {
        confident: "\"In your chair.\"", honest: "\"Still here, a few rungs higher.\"",
        funny: "\"Five years older, hopefully wiser, definitely balder.\"", humble: "\"Wherever I'm most useful to the team.\"" } },
    { q: "What's your biggest weakness?", answers: {
        confident: "\"I care too much about winning.\"", honest: "Name a real one, and how you're working on it.",
        funny: "\"Chocolate. And mornings.\"", humble: "\"Asking for help. I'm getting better at it.\"" } },
    { q: "Why should we hire you over everyone else?", answers: {
        confident: "\"Look at my record. Then look at theirs.\"", honest: "\"I'll show up, work hard and tell you the truth.\"",
        funny: "\"I bring snacks.\"", humble: "\"You may not have to choose: I'd learn fast either way.\"" } },
];
export const ANSWER_TITLES: Record<AnswerStyle, string> = { confident: "Confident", honest: "Honest", funny: "Funny", humble: "Humble" };
/** The game's traits that make an answer land. */
export const ANSWER_TRAITS: Record<AnswerStyle, string[]> = {
    confident: ["confident", "persuasive"], honest: ["evenTempered", "logical"], funny: ["charismatic", "entertainer"], humble: ["humble", "articulate"],
};
