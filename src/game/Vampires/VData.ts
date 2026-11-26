// v0.35.0 "Vampires Reborn": the data (bloodlines, ranks, the power tree, weather, hunting grounds, prey, lair, eras).
// Images are art slots (VAMP_ICONS): drop a picture with that name into assets/images and the game uses it.

export type LineId = "nosferim" | "velvet" | "ironblood" | "moonborn" | "ashen";
export type DisciplineId = "shadow" | "blood" | "mind" | "beast" | "sun";

export interface Bloodline { id: LineId; title: string; gift: string; weakness: string; feel: string; discipline: DisciplineId; image: string }
export const BLOODLINES: Bloodline[] = [
    { id: "nosferim", title: "Nosferim", discipline: "shadow", image: "icon_line_nosferim",
        gift: "Shadows and secrecy: Rumours fade twice as fast, and Shadow powers cost 1 less.",
        weakness: "Ageless but uncanny: mortals warm to you more slowly (relationship gains −20%).", feel: "Hidden, patient, ancient" },
    { id: "velvet", title: "Velvet Court", discipline: "mind", image: "icon_line_velvet",
        gift: "Charm and influence: Mind powers cost 1 less, and seducing prey always works.",
        weakness: "You only feed well on the willing: bagged, animal and stolen blood eases half as much hunger.", feel: "Glamorous, social, dangerous" },
    { id: "ironblood", title: "Ironblood", discipline: "blood", image: "icon_line_ironblood",
        gift: "Strength and endurance: +20% to win fights, and you heal +2 more a week.",
        weakness: "Your hunger rises 25% faster.", feel: "Warriors and survivors" },
    { id: "moonborn", title: "Moonborn", discipline: "beast", image: "icon_line_moonborn",
        gift: "Beast powers cost 1 less, and the night is yours: hunting raises half the Rumours.",
        weakness: "The Beast is close: frenzy comes 50% more often.", feel: "Wild and close to the Beast" },
    { id: "ashen", title: "Ashen", discipline: "sun", image: "icon_line_ashen",
        gift: "Scholars of blood: Sun powers cost 1 less, and only the Ashen can research a Cure.",
        weakness: "Sunlight hurts 50% more for your first 25 years.", feel: "Clever, cold, curious" },
];
export const lineOf = (id: string | null | undefined): Bloodline => BLOODLINES.find((b) => b.id === id) ?? BLOODLINES[0];

export interface Rank { id: string; title: string; years: number; tier: number; opens: string }
export const RANKS: Rank[] = [
    { id: "fledgling", title: "Fledgling", years: 0, tier: 1, opens: "Tier 1 powers; your sire watches over you" },
    { id: "neonate", title: "Neonate", years: 25, tier: 2, opens: "Tier 2 powers; you can sire childer of your own" },
    { id: "ancilla", title: "Ancilla", years: 100, tier: 3, opens: "Tier 3 powers; cloudy days cost you nothing" },
    { id: "elder", title: "Elder", years: 300, tier: 4, opens: "Tier 4 powers; sun damage halved; legends begin" },
    { id: "ancient", title: "Ancient", years: 1000, tier: 5, opens: "Tier 5 powers; legends know your name" },
];

export interface PowerNode { id: string; title: string; discipline: DisciplineId; tier: number; blurb: string; image: string }
/** The five disciplines. The 14 powers from before v0.35 keep their ids (and owners keep them). */
export const TREE: PowerNode[] = [
    { id: "mistStep", title: "Mist Step", discipline: "shadow", tier: 1, image: "icon_power_miststep", blurb: "Hunting never brings police trouble." },
    { id: "shadowStep", title: "Shadow Step", discipline: "shadow", tier: 2, image: "icon_power_shadowstep", blurb: "Lay Low takes 25 Rumours off and costs no happiness; fleeing hunters keeps your job." },
    { id: "mindFog", title: "Mind Fog", discipline: "shadow", tier: 3, image: "icon_power_mindfog", blurb: "Rumours fall by 5 by themselves every week." },
    { id: "vanish", title: "Vanish", discipline: "shadow", tier: 4, image: "icon_power_vanish", blurb: "Escape hunters every time, and the Hunt cools 2 a week." },
    { id: "nightEternal", title: "Night Eternal", discipline: "shadow", tier: 5, image: "icon_power_nighteternal", blurb: "You wrap yourself in darkness: the sun never touches you on cloudy or rainy days, and Rumours can't rise above 50." },
    { id: "bloodAlchemy", title: "Blood Alchemy", discipline: "blood", tier: 1, image: "icon_power_alchemy", blurb: "Your hunger rises 25% slower on any supply." },
    { id: "regeneration", title: "Regeneration", discipline: "blood", tier: 2, image: "icon_power_regen", blurb: "+2 more healing a week; a Withered body and burns heal twice as fast." },
    { id: "bloodBank", title: "Blood Bank Contact", discipline: "blood", tier: 3, image: "icon_power_bloodbank", blurb: "Unlocks Buy from a Blood Bank and the Blood Bank Bags supply." },
    { id: "bloodBond", title: "Blood Bond", discipline: "blood", tier: 4, image: "icon_power_bloodbond", blurb: "A mortal becomes your thrall after one sharing instead of three, and each thrall lowers Rumours 2 a week." },
    { id: "ancientBlood", title: "Ancient Blood", discipline: "blood", tier: 5, image: "icon_power_ancientblood", blurb: "Your hunger barely rises (−60%), and your childer start as Neonates." },
    { id: "charm", title: "Charm", discipline: "mind", tier: 1, image: "icon_power_charm", blurb: "Dating works more often; relationship gains +25%." },
    { id: "glamour", title: "Glamour", discipline: "mind", tier: 2, image: "icon_power_glamour", blurb: "You show up in mirrors and photos, and can Glamour your prey (never fails, no Rumours)." },
    { id: "hypnoticGaze", title: "Hypnotic Gaze", discipline: "mind", tier: 3, image: "icon_power_gaze", blurb: "Promotions come twice as fast, and you can talk hunters out of it more often." },
    { id: "dominate", title: "Dominate", discipline: "mind", tier: 4, image: "icon_power_dominate", blurb: "Command a mortal mind: Dominate your prey (a feast with no Humanity cost), and win every Attend Court vote." },
    { id: "puppetMaster", title: "Puppet Master", discipline: "mind", tier: 5, image: "icon_power_puppet", blurb: "Mortals do as you wish: +2 Standing a year, and the Hunt can't rise above 60." },
    { id: "beastTongue", title: "Beast Tongue", discipline: "beast", tier: 1, image: "icon_power_beast", blurb: "Animals adore you: Rats & Strays and Animal Blood cost no happiness." },
    { id: "nightOwl", title: "Night Owl", discipline: "beast", tier: 2, image: "icon_power_nightowl", blurb: "You work night shifts: no sunlight at work and 20% more pay (not in outdoor jobs)." },
    { id: "batForm", title: "Bat Form", discipline: "beast", tier: 3, image: "icon_power_batform", blurb: "Fly into the night: hunting raises half the Rumours, +20% against hunters, and the rooftops open as a hunting ground." },
    { id: "wolfForm", title: "Wolf Form", discipline: "beast", tier: 4, image: "icon_power_wolfform", blurb: "+30% against hunters and rivals, and the woods open as a hunting ground." },
    { id: "thePack", title: "The Pack", discipline: "beast", tier: 5, image: "icon_power_pack", blurb: "Wolves and bats answer your call: hunters never catch you unawares, and frenzy can't take you." },
    { id: "sunWard", title: "Sun Ward", discipline: "sun", tier: 1, image: "icon_power_sunward", blurb: "Sunlight hurts you half as much." },
    { id: "overcast", title: "Overcast", discipline: "sun", tier: 2, image: "icon_power_overcast", blurb: "Clouds are your friend: a cloudy day is as safe as a rainy one." },
    { id: "ancientScholar", title: "Ancient Scholar", discipline: "sun", tier: 3, image: "icon_power_scholar", blurb: "Degrees, trainings, skills and languages take 25% less time." },
    { id: "duskWalker", title: "Dusk Walker", discipline: "sun", tier: 4, image: "icon_power_duskwalker", blurb: "Sunlight hurts you half as much again, and Vitality refills twice as fast." },
    { id: "daywalker", title: "Daywalker", discipline: "sun", tier: 5, image: "icon_power_daywalker", blurb: "Once a week, walk in full sun with no harm at all." },
];
export const DISCIPLINES: { id: DisciplineId; title: string; use: string }[] = [
    { id: "shadow", title: "Shadow", use: "Secrecy, escaping, the Masquerade" },
    { id: "blood", title: "Blood", use: "Hunger, healing, thralls, siring" },
    { id: "mind", title: "Mind", use: "Love, work, fame, court politics" },
    { id: "beast", title: "Beast", use: "Hunting, fighting, animals" },
    { id: "sun", title: "Sun", use: "Surviving the day; research" },
];
export const TIER_COST = [0, 1, 2, 3, 4, 6];

// ---------------------------------------------------------------- weather
export type Weather = "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "polarNight" | "midnightSun";
export const WEATHER: Record<Weather, { title: string; light: number; text: string; fa: string }> = {
    sunny: { title: "Sunny", light: 1, text: "Full sun: day shifts and daytime outings burn.", fa: "" },
    cloudy: { title: "Cloudy", light: 0.5, text: "Half sun: bearable with care.", fa: "" },
    rainy: { title: "Rainy", light: 0.1, text: "Almost no sun: safe to go out by day.", fa: "" },
    stormy: { title: "Stormy", light: 0.05, text: "Dark skies all day: safe to go out by day.", fa: "" },
    snowy: { title: "Snowy", light: 0.6, text: "Low sun, but bright snow reflects it.", fa: "" },
    polarNight: { title: "Polar Night", light: 0, text: "The sun never rises: weeks of freedom.", fa: "" },
    midnightSun: { title: "Midnight Sun", light: 1.3, text: "The sun never sets: the worst time of year.", fa: "" },
};
/** Chances by climate and season (weights). */
export const CLIMATE_WEATHER: Record<string, Record<string, [Weather, number][]>> = {
    temperate: {
        summer: [["sunny", 50], ["cloudy", 30], ["rainy", 15], ["stormy", 5]],
        spring: [["sunny", 30], ["cloudy", 35], ["rainy", 30], ["stormy", 5]],
        fall: [["sunny", 25], ["cloudy", 40], ["rainy", 30], ["stormy", 5]],
        winter: [["sunny", 20], ["cloudy", 40], ["rainy", 25], ["snowy", 15]],
    },
    cold: {
        summer: [["sunny", 45], ["cloudy", 35], ["rainy", 20]],
        spring: [["sunny", 25], ["cloudy", 40], ["rainy", 25], ["snowy", 10]],
        fall: [["sunny", 20], ["cloudy", 40], ["rainy", 30], ["snowy", 10]],
        winter: [["sunny", 15], ["cloudy", 35], ["snowy", 50]],
    },
    tropical: {
        summer: [["sunny", 40], ["cloudy", 20], ["rainy", 25], ["stormy", 15]],
        spring: [["sunny", 45], ["cloudy", 20], ["rainy", 25], ["stormy", 10]],
        fall: [["sunny", 40], ["cloudy", 20], ["rainy", 30], ["stormy", 10]],
        winter: [["sunny", 55], ["cloudy", 25], ["rainy", 20]],
    },
    desert: {
        summer: [["sunny", 90], ["cloudy", 8], ["stormy", 2]],
        spring: [["sunny", 80], ["cloudy", 15], ["stormy", 5]],
        fall: [["sunny", 80], ["cloudy", 15], ["stormy", 5]],
        winter: [["sunny", 70], ["cloudy", 25], ["rainy", 5]],
    },
};
/** Far-north countries get polar nights in deep winter and the midnight sun in high summer. */
export const FAR_NORTH = new Set(["norway", "finland", "iceland", "sweden", "russia"]);

// ---------------------------------------------------------------- the Hunt
export interface Ground { id: string; title: string; image: string; risk: number; blurb: string; prey: string[]; needs?: string }
export const GROUNDS: Ground[] = [
    { id: "club", title: "A Nightclub", image: "love_nightclub", risk: 4, blurb: "Loud, dark and full of the young and the drunk.", prey: ["young", "drunk", "inLove", "party"] },
    { id: "alleys", title: "The Back Alleys", image: "icon_vamp_hunt", risk: 8, blurb: "Nobody asks questions. Nobody helps either.", prey: ["drunk", "frightened", "predator", "lonely"] },
    { id: "hospital", title: "A Hospital at Night", image: "health_hospitalstay", risk: 6, blurb: "Tired staff, sleeping patients, blood in the fridge.", prey: ["lonely", "frightened", "nurse", "old"] },
    { id: "docks", title: "The Docks", image: "icon_ground_docks", risk: 7, blurb: "Sailors, smugglers and fog.", prey: ["drunk", "predator", "worker", "frightened"] },
    { id: "gala", title: "A Charity Gala", image: "vacation_opera", risk: 5, blurb: "The rich, the bored and the famous. Rare vintages.", prey: ["rich", "famous", "inLove", "old"] },
    { id: "rooftops", title: "The Rooftops", image: "icon_power_batform", risk: 2, blurb: "Bat Form: drop from above on the city's night owls.", prey: ["lonely", "young", "worker", "drunk"], needs: "batForm" },
    { id: "woods", title: "The Woods", image: "icon_power_wolfform", risk: 1, blurb: "Wolf Form: campers, hikers and things that prowl.", prey: ["frightened", "young", "predator", "lonely"], needs: "wolfForm" },
    { id: "rival", title: "A Rival's Territory", image: "skull", risk: 12, blurb: "The richest feeding in the city, if you dare.", prey: ["rich", "famous", "young", "inLove"], needs: "rival" },
];
export interface Prey { id: string; title: string; vintage: string; hard: number; bonus: [number, number, number]; note: string }
export const PREY: Prey[] = [
    { id: "young", title: "a student out too late", vintage: "Youth", hard: 0.1, bonus: [2, 2, 0], note: "+2 health, +2 happiness" },
    { id: "drunk", title: "a drunk businessman", vintage: "The Drunk", hard: 0, bonus: [0, 4, -2], note: "+4 happiness, −2 sanity (you're tipsy)" },
    { id: "frightened", title: "someone walking home scared", vintage: "Fear", hard: 0.2, bonus: [0, 0, 3], note: "+3 sanity: the rush sharpens you" },
    { id: "inLove", title: "a couple on a first date", vintage: "Love", hard: 0.15, bonus: [0, 5, 0], note: "+5 happiness" },
    { id: "lonely", title: "a lonely night-shift nurse", vintage: "Loneliness", hard: 0.05, bonus: [0, -1, 4], note: "+4 sanity, −1 happiness" },
    { id: "predator", title: "another predator (a mugger)", vintage: "The Wicked", hard: 0.3, bonus: [3, 2, 0], note: "+3 health, and no guilt: no Humanity cost" },
    { id: "rich", title: "a bored heir", vintage: "Old Money", hard: 0.2, bonus: [0, 3, 2], note: "+3 happiness, +2 sanity" },
    { id: "famous", title: "a famous face", vintage: "Fame", hard: 0.35, bonus: [0, 6, 0], note: "+6 happiness, +1 blood power the first time" },
    { id: "party", title: "someone dancing alone", vintage: "Euphoria", hard: 0.05, bonus: [0, 4, 1], note: "+4 happiness, +1 sanity" },
    { id: "nurse", title: "a doctor on a break", vintage: "Caffeine", hard: 0.1, bonus: [2, 0, 2], note: "+2 health, +2 sanity" },
    { id: "old", title: "an old man who can't sleep", vintage: "The Years", hard: 0, bonus: [0, -2, 5], note: "+5 sanity, −2 happiness" },
    { id: "worker", title: "a dock worker on the night shift", vintage: "Hard Work", hard: 0.1, bonus: [3, 0, 0], note: "+3 health" },
];
export const AMOUNTS: { id: "sip" | "feast" | "drain"; title: string; hunger: number; humanity: number; rumours: number; note: string }[] = [
    { id: "sip", title: "Just a Sip", hunger: 25, humanity: 0, rumours: 0, note: "−25 hunger. They'll wake up dizzy, nothing more." },
    { id: "feast", title: "Feast", hunger: 55, humanity: 0.25, rumours: 3, note: "−55 hunger. They'll need a hospital (Humanity −¼ unless they're willing or wicked)." },
    { id: "drain", title: "Drain Them", hunger: 90, humanity: 1, rumours: 12, note: "−90 hunger and a body to deal with: Humanity −1, Rumours +12, the Hunt +6." },
];

// ---------------------------------------------------------------- lair
export interface LairPart { id: string; title: string; cost: number; image: string; blurb: string; minRank?: number }
export const LAIR: LairPart[] = [
    { id: "blackout", title: "Blackout Rooms", cost: 5000, image: "menu_coffin", blurb: "Safe day sleep: Vitality refills fully every week (half as fast without them)." },
    { id: "exit", title: "A Secret Exit", cost: 20000, image: "icon_lair_exit", blurb: "+15% to escape or beat hunters, and fleeing never costs your job." },
    { id: "feeding", title: "A Feeding Room", cost: 15000, image: "icon_lair_feeding", blurb: "Your herd is comfier: the Own Herd supply eases 5 more hunger and herd mortals never talk." },
    { id: "library", title: "An Occult Library", cost: 25000, image: "love_museum", blurb: "+1 blood power every 10 years, and Cure research goes twice as fast." },
    { id: "crypt", title: "A Crypt", cost: 40000, image: "grave", blurb: "Hunters can never find you while you sleep: chosen torpor is safe and the Hunt falls 30 while you rest." },
    { id: "manor", title: "An Elder's Manor", cost: 2000000, image: "housing_ranch_house", minRank: 3, blurb: "A haven worthy of an elder: +10 Standing, and court meets at your place (+1 favour a year)." },
];

// ---------------------------------------------------------------- court and the world
export const COURT_TITLES = ["Prince", "Seneschal", "Keeper of Elysium", "Sheriff", "Harpy", "Scourge"];
export const STANDING = [
    { min: 0, title: "Outcast" }, { min: 20, title: "Known" }, { min: 40, title: "Respected" }, { min: 60, title: "Feared" }, { min: 80, title: "Prince" },
];
export const ERAS = [
    "Phones got smaller, then bigger, then smarter than everyone",
    "A new war is on every screen",
    "Everyone dresses like it's thirty years ago again",
    "Cash is gone; everything is a tap of a card",
    "Cars drive themselves now",
    "The music you loved is played on 'oldies' stations",
    "A pandemic emptied the streets for a year",
    "Everyone has a camera, and every camera is online",
];
export const TASKS = [
    { id: "fledgling", title: "Find the fledgling breaking the Masquerade", power: "mind", weeks: 4 },
    { id: "hunter", title: "Deal with a hunter sniffing around Elysium", power: "beast", weeks: 6 },
    { id: "relic", title: "Recover a relic stolen from the Prince", power: "shadow", weeks: 8 },
    { id: "ledger", title: "Balance the court's blood ledger", power: "blood", weeks: 4 },
    { id: "eclipse", title: "Prepare the court for an eclipse", power: "sun", weeks: 6 },
];

export const VAMP_ICONS: { name: string; fallback: string; where: string; row: string }[] = [
    { name: "icon_line_nosferim", fallback: "lifepath_vampire", where: "Vampire › Bloodline", row: "Nosferim" },
    { name: "icon_line_velvet", fallback: "love_nightclub", where: "Vampire › Bloodline", row: "Velvet Court" },
    { name: "icon_line_ironblood", fallback: "health_workout", where: "Vampire › Bloodline", row: "Ironblood" },
    { name: "icon_line_moonborn", fallback: "icon_power_beast", where: "Vampire › Bloodline", row: "Moonborn" },
    { name: "icon_line_ashen", fallback: "icon_power_scholar", where: "Vampire › Bloodline", row: "Ashen" },
    { name: "icon_power_vanish", fallback: "icon_power_shadowstep", where: "Vampire › Powers", row: "Vanish" },
    { name: "icon_power_nighteternal", fallback: "icon_power_mindfog", where: "Vampire › Powers", row: "Night Eternal" },
    { name: "icon_power_bloodbond", fallback: "icon_vamp_turn", where: "Vampire › Powers", row: "Blood Bond" },
    { name: "icon_power_ancientblood", fallback: "vdiet_vintage", where: "Vampire › Powers", row: "Ancient Blood" },
    { name: "icon_power_dominate", fallback: "icon_power_gaze", where: "Vampire › Powers", row: "Dominate" },
    { name: "icon_power_puppet", fallback: "icon_power_charm", where: "Vampire › Powers", row: "Puppet Master" },
    { name: "icon_power_wolfform", fallback: "icon_power_beast", where: "Vampire › Powers; the Hunt", row: "Wolf Form / The Woods" },
    { name: "icon_power_pack", fallback: "icon_power_batform", where: "Vampire › Powers", row: "The Pack" },
    { name: "icon_power_overcast", fallback: "icon_power_sunward", where: "Vampire › Powers", row: "Overcast" },
    { name: "icon_power_duskwalker", fallback: "icon_power_sunward", where: "Vampire › Powers", row: "Dusk Walker" },
    { name: "icon_power_daywalker", fallback: "icon_vamp_cure", where: "Vampire › Powers", row: "Daywalker" },
    { name: "icon_vamp_weather", fallback: "vacation_park", where: "Vampire", row: "This week's weather" },
    { name: "icon_vamp_humanity", fallback: "health_meditation", where: "Vampire", row: "Humanity" },
    { name: "icon_vamp_court", fallback: "vacation_opera", where: "Vampire › Court; Love › Night", row: "Court, Attend Court" },
    { name: "icon_vamp_sire", fallback: "lifepath_vampire", where: "Vampire › Bloodline; Love › Night", row: "Your sire" },
    { name: "icon_vamp_childe", fallback: "icon_vamp_turn", where: "Love › Night", row: "Your childer" },
    { name: "icon_vamp_thrall", fallback: "icon_vamp_feedpartner", where: "Love", row: "Share Your Blood / thralls" },
    { name: "icon_vamp_herd", fallback: "icon_vamp_donors", where: "Supplies; Love › Night", row: "Your Own Herd" },
    { name: "icon_vamp_hunter", fallback: "icon_vamp_hunters", where: "Vampire › Masquerade", row: "The Hunt's leader" },
    { name: "icon_vamp_torpor", fallback: "menu_coffin", where: "Vampire › Lair", row: "Chosen torpor" },
    { name: "icon_vamp_vault", fallback: "bank_deposit", where: "Vampire › Lair", row: "The Vault" },
    { name: "icon_vamp_identity", fallback: "icon_vamp_fakedeath", where: "Vampire › Masquerade", row: "New Identity / Cover Story" },
    { name: "icon_vamp_golconda", fallback: "health_youthelixir", where: "Vampire", row: "Golconda" },
    { name: "icon_vamp_task", fallback: "skull", where: "Vampire › Court", row: "The Prince's tasks" },
    { name: "icon_ground_docks", fallback: "work_barista", where: "The Hunt", row: "The Docks" },
    { name: "icon_lair_exit", fallback: "housing_townhouse", where: "Vampire › Lair", row: "A Secret Exit" },
    { name: "icon_lair_feeding", fallback: "icon_vamp_donors", where: "Vampire › Lair", row: "A Feeding Room" },
];
