// v0.28.0 Illnesses (pure data). The rules are in Illness.ts.
//
// Every illness has a weekly chance to start (`base`, times the risk factors in Illness.risk), weekly effects while
// you have it, and a list of treatments. Acute illnesses also clear up on their own after `weeks`; chronic ones stay
// until cured or are "managed" (daily medication: no effects, no complications, a weekly cost). Hidden ones give no
// symptoms for a while: a checkup finds them early. Untreated, some lead to something worse (`after`).
// Vampires are dead: they can't catch anything, and the bite cures whatever they had.

export type IllnessKind = "infection" | "injury" | "chronic" | "mental" | "serious";

export interface TreatDef {
    id: string;
    title: string;
    cost: number;          // USD, before public healthcare / insurance / parents paying
    odds: number;          // chance it cures (at the end of the course)
    weeks?: number;        // a course: you're "under treatment" this many weeks, then the odds are rolled
    note?: string;
    /** Only offered from this cancer stage (1–4) or up to it. */
    minStage?: number; maxStage?: number;
}

export interface IllnessDef {
    id: string;
    title: string;
    kind: IllnessKind;
    image: string;         // art slot ("icon_ill_<id>")
    fallback: string;
    blurb: string;
    mods: [number, number, number];   // health, happiness, sanity a week while you have symptoms
    weeks?: [number, number];         // acute: clears up on its own after this long
    contagious?: boolean;
    once?: boolean;                   // you only get it once (immunity afterwards)
    hidden?: number;                  // weeks with no symptoms (a checkup finds it)
    stages?: number;                  // cancer: gets worse every `stageWeeks` untreated
    stageWeeks?: number;
    emergency?: boolean;              // needs treatment within a couple of weeks
    minAge?: number; maxAge?: number;
    base: number;                     // weekly chance (before risk factors)
    risk?: string[];                  // see Illness.risk
    treat: TreatDef[];
    manage?: { title: string; weekly: number };
    after?: { id: string; chance: number };   // untreated: weekly chance it turns into this
}

const R = (id: string, title: string, cost: number, odds: number, extra: Partial<TreatDef> = {}): TreatDef => ({ id, title, cost, odds, ...extra });
const REST = R("rest", "Rest at Home", 0, 0.35, { note: "Free. Sleep, soup and patience." });
const PHARMACY = R("pharmacy", "Pharmacy Medicine", 40, 0.6);
const DOCTOR = R("doctor", "See a Doctor", 300, 0.85);
const ANTIBIOTICS = R("antibiotics", "Doctor + Antibiotics", 350, 0.95);
const HOSPITAL = R("hospital", "Hospital Stay", 3000, 0.95);
const ER = R("er", "Emergency Room", 2500, 0.9);
const THERAPY = R("therapy", "Therapy (8 weeks)", 1600, 0.75, { weeks: 8, note: "Much better with a Therapist subscription." });
const MEDS = R("meds", "Prescription Medication", 200, 0.55);

const I = (id: string, title: string, kind: IllnessKind, fallback: string, blurb: string, mods: [number, number, number], base: number, treat: TreatDef[], extra: Partial<IllnessDef> = {}): IllnessDef =>
    ({ id, title, kind, image: "icon_ill_" + id.toLowerCase(), fallback, blurb, mods, base, treat, ...extra });

export const ILLNESS_DEFS: IllnessDef[] = [
    // ------------------------------------------------------------------ infections (catch them, they pass)
    I("commonCold", "Common Cold", "infection", "health_selftreatment", "Sniffles, sneezes and a box of tissues.", [-1, -2, -1], 0.012, [REST, PHARMACY], { weeks: [1, 2], contagious: true, risk: ["winter3", "kids", "school", "lowHealth", "homeless"] }),
    I("flu", "Flu", "infection", "health_pills", "Fever, aches and a week in bed.", [-4, -4, -2], 0.0015, [REST, PHARMACY, DOCTOR], { weeks: [1, 3], contagious: true, risk: ["winter4", "kids", "school", "old", "lowHealth", "fluShot", "homeless", "jail"], after: { id: "pneumonia", chance: 0.04 } }),
    I("stomachBug", "Stomach Bug", "infection", "health_selftreatment", "Let's not talk about it.", [-3, -3, -1], 0.004, [REST, PHARMACY], { weeks: [1, 1], contagious: true, risk: ["winter2", "kids", "school"] }),
    I("strepThroat", "Strep Throat", "infection", "health_doctorvisit", "Swallowing feels like razor blades.", [-2, -3, -1], 0.0012, [REST, ANTIBIOTICS], { weeks: [2, 3], contagious: true, risk: ["school", "kids", "winter2"], maxAge: 60 }),
    I("earInfection", "Ear Infection", "infection", "health_doctorvisit", "A throbbing ear and no sleep.", [-1, -3, -2], 0.003, [REST, ANTIBIOTICS], { weeks: [1, 2], maxAge: 12, risk: ["swim", "winter2"] }),
    I("pinkEye", "Pink Eye", "infection", "health_selftreatment", "Red, itchy and very contagious.", [0, -2, -1], 0.002, [REST, PHARMACY], { weeks: [1, 2], contagious: true, risk: ["school", "kids"] }),
    I("chickenpox", "Chickenpox", "infection", "health_selftreatment", "Itchy spots everywhere. Don't scratch.", [-2, -3, -2], 0.004, [REST, PHARMACY], { weeks: [1, 2], contagious: true, once: true, maxAge: 14, risk: ["school"] }),
    I("headLice", "Head Lice", "infection", "health_selftreatment", "Tiny guests from school.", [0, -3, -2], 0.004, [PHARMACY, R("comb", "Lice Comb (and a lot of patience)", 15, 0.6)], { weeks: [2, 4], contagious: true, maxAge: 12, minAge: 4, risk: ["school"] }),
    I("mono", "Mono", "infection", "health_low", "The kissing disease. Exhausted for weeks.", [-3, -3, -2], 0.0008, [REST, DOCTOR], { weeks: [3, 6], once: true, minAge: 14, maxAge: 30 }),
    I("bronchitis", "Bronchitis", "infection", "health_doctorvisit", "A cough that won't quit.", [-3, -2, -1], 0.0008, [REST, PHARMACY, DOCTOR], { weeks: [2, 4], risk: ["winter3", "old", "smoker", "homeless"], after: { id: "pneumonia", chance: 0.03 } }),
    I("pneumonia", "Pneumonia", "infection", "health_hospitalstay", "Fluid in the lungs. This one can kill, especially when you're old.", [-8, -4, -3], 0.0004, [ANTIBIOTICS, HOSPITAL], { weeks: [3, 6], risk: ["winter3", "aging", "homeless", "jail", "lowHealth"] }),
    I("foodPoisoning", "Food Poisoning", "infection", "health_pills", "Something you ate fought back.", [-4, -3, -1], 0.0015, [REST, PHARMACY, DOCTOR], { weeks: [1, 1], risk: ["junkFood", "scavenge", "summer2", "streetFood"] }),
    I("tuberculosis", "Tuberculosis", "infection", "health_hospitalstay", "A serious lung infection, spread in crowded places.", [-5, -3, -2], 0.00002, [R("tbCourse", "Six-Month Antibiotic Course", 2500, 0.95, { weeks: 24 })], { risk: ["homeless5", "jail10", "tropical"] }),
    I("malaria", "Malaria", "infection", "mosquito", "One mosquito bite. Fever, chills, and it can be deadly.", [-7, -4, -3], 0, [R("antimalarials", "Antimalarial Drugs", 200, 0.92), HOSPITAL], { weeks: [2, 4], risk: ["tropicalOnly", "outdoors", "summer2"] }),
    I("dengue", "Dengue Fever", "infection", "mosquito", "\"Breakbone fever\": every joint hurts.", [-6, -4, -2], 0, [REST, HOSPITAL], { weeks: [2, 3], risk: ["tropicalOnly", "summer2", "outdoors"] }),
    I("lymeDisease", "Lyme Disease", "infection", "vacation_camping", "A tick bite from the woods, a bullseye rash, and aches.", [-2, -2, -2], 0, [ANTIBIOTICS], { weeks: [6, 12], risk: ["onlyFromActivities"] }),
    I("measles", "Measles", "infection", "health_low", "Rare now, thanks to vaccines, but miserable.", [-5, -3, -2], 0.00005, [REST, HOSPITAL], { weeks: [2, 3], once: true, contagious: true, risk: ["school"] }),
    I("shingles", "Shingles", "infection", "health_low", "The chickenpox virus wakes up decades later. A painful rash.", [-2, -4, -3], 0.0006, [R("antivirals", "Antiviral Medication", 250, 0.8), REST], { weeks: [3, 5], minAge: 50, risk: ["old"] }),

    // ------------------------------------------------------------------ injuries
    I("sprainedAnkle", "Sprained Ankle", "injury", "health_selftreatment", "Rolled it. Ice and elevate.", [-2, -2, 0], 0.001, [REST, R("brace", "Ankle Brace and Physio", 300, 0.9)], { weeks: [2, 4], minAge: 6, risk: ["active"] }),
    I("brokenArm", "Broken Arm", "injury", "health_hospitalstay", "A cast for six weeks and everyone signs it.", [-4, -3, -1], 0.0003, [R("cast", "Set It and Get a Cast", 2000, 1, { weeks: 6 })], { weeks: [10, 14], minAge: 4, risk: ["active", "kids", "elderly", "jail"] }),
    I("brokenLeg", "Broken Leg", "injury", "health_hospitalstay", "Crutches for weeks.", [-5, -4, -2], 0.0002, [R("cast", "Set It and Get a Cast", 3000, 1, { weeks: 8 }), R("surgery", "Surgery with Pins", 20000, 1, { weeks: 4 })], { weeks: [14, 20], minAge: 4, risk: ["active", "elderly"] }),
    I("concussion", "Concussion", "injury", "health_low", "Headaches, light hurts, and no screens for a while.", [-3, -2, -4], 0.0002, [REST, ER], { weeks: [2, 4], risk: ["active", "jail"] }),
    I("backInjury", "Back Injury", "injury", "health_selftreatment", "Lifted with your back, not your legs.", [-2, -4, -2], 0.0005, [R("physio", "Physical Therapy (6 weeks)", 900, 0.85, { weeks: 6 }), R("surgery", "Back Surgery", 40000, 0.9, { weeks: 4 })], { weeks: [6, 16], minAge: 25, risk: ["manualJob", "old"] }),
    I("burn", "Bad Burn", "injury", "health_hospitalstay", "A kitchen (or a fire) got you.", [-4, -3, -2], 0.0003, [DOCTOR, R("burnUnit", "Burn Unit", 8000, 1, { weeks: 2 })], { weeks: [4, 8], risk: ["firefighter", "cook"] }),
    I("frostbite", "Frostbite", "injury", "vacation_ski", "Fingers and toes that went numb in the cold.", [-4, -2, -1], 0, [DOCTOR, HOSPITAL], { weeks: [3, 6], risk: ["frostbite"] }),
    I("heatstroke", "Heatstroke", "injury", "health_low", "Too long in the sun.", [-6, -3, -2], 0, [REST, ER], { weeks: [1, 1], risk: ["heatstroke"] }),
    I("dogBite", "Dog Bite", "injury", "health_doctorvisit", "Not every dog is a good boy.", [-2, -3, -1], 0.0002, [DOCTOR], { weeks: [2, 3], risk: ["dogOwner"] }),

    // ------------------------------------------------------------------ chronic (manage them, or cure them)
    I("asthma", "Asthma", "chronic", "health_pills", "Tight chest, wheezing. An inhaler helps.", [-1, -1, -1], 0.0003, [R("asthmaPlan", "Asthma Specialist (outgrow it)", 1500, 0.25)], { maxAge: 16, manage: { title: "Inhaler", weekly: 10 }, risk: ["homeless", "cold"] }),
    I("hayFever", "Hay Fever", "chronic", "health_selftreatment", "Pollen season: itchy eyes and sneezing every spring.", [0, -2, -1], 0.0006, [R("allergyShots", "Allergy Shots (a year)", 2000, 0.7, { weeks: 48 })], { manage: { title: "Antihistamines", weekly: 5 }, risk: ["spring3"] }),
    I("migraines", "Migraines", "chronic", "health_low", "Headaches that shut the world out.", [-1, -3, -3], 0.0004, [R("neuro", "Neurologist", 1200, 0.5)], { minAge: 12, manage: { title: "Migraine Medication", weekly: 15 }, risk: ["stress"] }),
    I("highBloodPressure", "High Blood Pressure", "chronic", "health_doctorvisit", "The silent killer: no symptoms until something goes wrong.", [-1, 0, -1], 0.0004, [R("lifestyle", "Diet & Exercise Program (12 weeks)", 1200, 0.45, { weeks: 12 })], { minAge: 30, hidden: 96, manage: { title: "Blood Pressure Pills", weekly: 10 }, risk: ["old", "junkFood", "stress", "fit"], after: { id: "stroke", chance: 0.002 } }),
    I("diabetes", "Type 2 Diabetes", "chronic", "diet_fastfood", "Your body stopped handling sugar well.", [-2, -1, -1], 0.00015, [R("lifestyle", "Diet & Exercise Program (12 weeks)", 1200, 0.35, { weeks: 12 })], { minAge: 25, hidden: 48, manage: { title: "Diabetes Medication", weekly: 25 }, risk: ["junkFood2", "aging", "fit"], after: { id: "kidneyDisease", chance: 0.002 } }),
    I("heartDisease", "Heart Disease", "chronic", "health_hospitalstay", "Clogged arteries. Take it seriously.", [-2, -1, -1], 0.00012, [R("bypass", "Heart Bypass Surgery", 60000, 0.85, { weeks: 4 }), R("stents", "Stents", 25000, 0.6, { weeks: 2 })], { minAge: 40, hidden: 96, manage: { title: "Heart Medication", weekly: 20 }, risk: ["aging", "junkFood2", "smoker", "fit", "stress"], after: { id: "heartAttack", chance: 0.004 } }),
    I("arthritis", "Arthritis", "chronic", "health_selftreatment", "Stiff, aching joints.", [-1, -2, -1], 0.0008, [R("jointReplacement", "Joint Replacement", 35000, 0.85, { weeks: 6 })], { minAge: 55, manage: { title: "Anti-inflammatories", weekly: 10 }, risk: ["old"] }),
    I("osteoporosis", "Osteoporosis", "chronic", "health_low", "Brittle bones. A fall becomes a break.", [-1, -1, 0], 0.0005, [R("boneTherapy", "Bone Density Therapy (a year)", 4000, 0.5, { weeks: 48 })], { minAge: 60, hidden: 48, manage: { title: "Calcium and Bone Medication", weekly: 10 }, risk: ["old", "fit"] }),
    I("kidneyDisease", "Kidney Disease", "chronic", "health_hospitalstay", "Your kidneys are failing.", [-3, -2, -2], 0.00004, [R("transplant", "Kidney Transplant", 120000, 0.85, { weeks: 6 })], { minAge: 30, manage: { title: "Dialysis", weekly: 600 }, risk: ["old", "junkFood"] }),
    I("liverDisease", "Liver Disease", "chronic", "health_pills", "Years of drinks catch up with you.", [-3, -2, -2], 0, [R("rehab", "Quit Drinking: Rehab (8 weeks)", 6000, 0.6, { weeks: 8 }), R("transplant", "Liver Transplant", 150000, 0.85, { weeks: 6 })], { minAge: 25, manage: { title: "Liver Medication", weekly: 40 }, risk: ["drinker"] }),
    I("copd", "Lung Disease (COPD)", "chronic", "health_low", "Breathless after the stairs. Thank the cigarettes.", [-3, -2, -1], 0, [R("lungRehab", "Pulmonary Rehab (12 weeks)", 5000, 0.3, { weeks: 12 })], { minAge: 35, manage: { title: "Oxygen and Inhalers", weekly: 60 }, risk: ["smokerOnly", "old"] }),
    I("dementia", "Dementia", "chronic", "sanity_low", "Names and days slip away. There is no cure yet, only time you can slow.", [-1, -3, -6], 0.0004, [], { minAge: 70, manage: { title: "Memory Care and Medication", weekly: 300 }, risk: ["aging", "fit"] }),

    // ------------------------------------------------------------------ mental health
    I("depression", "Depression", "mental", "health_takeantidepressant", "A heavy grey fog over everything.", [0, -5, -4], 0.0005, [THERAPY, MEDS], { minAge: 12, weeks: [12, 48], risk: ["sad3", "lonely", "stress"] }),
    I("anxiety", "Anxiety Disorder", "mental", "health_psychologist", "A racing heart over nothing at all.", [0, -3, -5], 0.0005, [THERAPY, MEDS], { minAge: 10, weeks: [12, 40], risk: ["stress", "sad"] }),
    I("insomnia", "Insomnia", "mental", "health_meditation", "Staring at the ceiling at 3 a.m.", [-2, -2, -4], 0.0008, [R("sleepClinic", "Sleep Clinic", 800, 0.7), MEDS], { minAge: 14, weeks: [4, 12], risk: ["stress", "nightShift"] }),
    I("burnout", "Burnout", "mental", "sanity_low", "Too many all-nighters. Nothing left in the tank.", [-2, -4, -6], 0, [R("timeOff", "Take Real Time Off (4 weeks)", 0, 0.9, { weeks: 4, note: "No work counts: just rest." }), THERAPY], { minAge: 16, weeks: [8, 16], risk: ["overwork"] }),

    // ------------------------------------------------------------------ serious
    I("appendicitis", "Appendicitis", "serious", "health_hospitalstay", "Sharp pain on the right side. It has to come out.", [-15, -5, -3], 0.00004, [R("appendectomy", "Emergency Surgery", 15000, 0.99, { weeks: 2 })], { emergency: true, minAge: 5, maxAge: 60 }),
    I("kidneyStones", "Kidney Stones", "serious", "health_pills", "Said to hurt worse than anything.", [-5, -6, -3], 0.0003, [R("drink", "Drink Water and Wait", 0, 0.5), ER, R("lithotripsy", "Shockwave Treatment", 6000, 0.97)], { weeks: [1, 3], minAge: 20, risk: ["junkFood", "summer2"] }),
    I("heartAttack", "Heart Attack", "serious", "health_hospitalstay", "Crushing pain in the chest. Call an ambulance NOW.", [-35, -8, -6], 0.00005, [R("cathLab", "Emergency Cardiac Care", 50000, 0.85, { weeks: 2 })], { emergency: true, minAge: 35, risk: ["aging", "smoker", "junkFood", "stress"] }),
    I("stroke", "Stroke", "serious", "health_hospitalstay", "Face drooping, arm weak, words slurred.", [-30, -8, -10], 0.00004, [R("strokeUnit", "Stroke Unit", 40000, 0.8, { weeks: 3 })], { emergency: true, minAge: 40, risk: ["aging"] }),
    I("cancer", "Cancer", "serious", "health_chemotherapy", "Caught early, it's very treatable. Left alone, it spreads.", [-2, -3, -3], 0.0001, [
        R("surgery", "Surgery to Remove It", 30000, 0.9, { weeks: 4, maxStage: 2 }),
        R("chemo", "Chemotherapy (8 weeks)", 25000, 0.75, { weeks: 8 }),
        R("radiation", "Radiation (6 weeks)", 20000, 0.65, { weeks: 6, maxStage: 3 }),
        R("experimental", "Experimental Treatment", 250000, 0.45, { weeks: 8, minStage: 3 }),
    ], { minAge: 20, hidden: 48, stages: 4, stageWeeks: 24, risk: ["aging", "smoker", "junkFood", "fit"] }),
    I("leukemia", "Childhood Leukemia", "serious", "health_chemotherapy", "A blood cancer. Children are strong, and most beat it.", [-4, -3, -2], 0.00003, [R("chemo", "Chemotherapy (12 weeks)", 30000, 0.85, { weeks: 12 })], { maxAge: 17, stages: 2, stageWeeks: 24 }),
];
export const ILLNESS_BY_ID: Record<string, IllnessDef> = Object.fromEntries(ILLNESS_DEFS.map((d) => [d.id, d]));

/** Share of the bill you pay yourself, by country (public healthcare). The US is 1 (all of it). */
export const HEALTHCARE: Record<string, number> = {
    unitedStates: 1, canada: 0.1, japan: 0.3, france: 0.15, spain: 0.1, uk: 0.1, china: 0.5,
    germany: 0.15, italy: 0.1, portugal: 0.15, ireland: 0.35, netherlands: 0.2, sweden: 0.1, norway: 0.1, denmark: 0.1,
    finland: 0.1, poland: 0.2, greece: 0.3, russia: 0.3, iceland: 0.1, turkey: 0.3,
    mexico: 0.5, brazil: 0.3, argentina: 0.3,
    southKorea: 0.3, india: 0.5, thailand: 0.3, vietnam: 0.5, indonesia: 0.5, philippines: 0.6, australia: 0.2, newZealand: 0.2,
    uae: 0.5, egypt: 0.6, israel: 0.2, kenya: 0.6, southAfrica: 0.6,
};
/** Health insurance (a subscription) pays this much of what's left. */
export const INSURANCE_COVERS = 0.7;
