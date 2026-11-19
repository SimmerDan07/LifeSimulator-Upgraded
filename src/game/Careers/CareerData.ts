// v0.26.0 "The Career Update": 40 new careers and 37 new degrees and trainings, as plain data.
// Job.ts and CompletableAction.ts turn these into real enum values (so saves, the Work tab and promotions treat them
// like the original careers). Careers.ts adds the rules that need the game state (seasons, followers, hobbies, age).
//
// Pay is per week at each level; a [min, max] pair means it varies. Mods are weekly [health, happiness, sanity].
// edu[i] is the degree or training (a CompletableAction name) needed at level i+1, or null.

export type Season = "winter" | "spring" | "summer" | "fall";
export interface CareerDef {
    id: string;
    name: string;               // the career as a whole ("Nurse")
    category: string;           // Career Center group id
    image: string;              // art slot name
    fallback: string;           // existing picture used until the art exists
    blurb: string;
    titles: string[];
    pay: (number | [number, number])[];
    mods: [number, number, number][];
    edu: (string | null)[];
    minAge?: number;            // to apply
    maxAge?: number;            // to apply
    minHealth?: number;         // to apply and to keep working
    followers?: (number | 0)[]; // social media followers needed to be promoted to level i+1
    hobby?: { id: string; skill: number; from: number };   // a hobby level needed from level `from`
    season?: Partial<Record<Season, number>>;               // pay multiplier by season
    seasonNote?: string;
    outdoor?: boolean;          // daylight work outside (vampires suffer more)
    night?: boolean;            // a night job (no sunlight for vampires)
    medical?: boolean;          // counts as a medical job (vampires: Blood Bank Bags)
    trait?: string;             // a Trait name that boosts pay (like the original careers)
}

export interface CareerCategory { id: string; title: string; image: string; blurb: string }
export const CAREER_CATEGORIES: CareerCategory[] = [
    { id: "health", title: "Healthcare", image: "education_medschool", blurb: "Nurses, paramedics, pharmacists, vets and dentists." },
    { id: "trades", title: "Skilled Trades", image: "work_constructionworker", blurb: "Electricians, plumbers, carpenters, mechanics and truckers. Good money, no college." },
    { id: "public", title: "Public Service", image: "work_police", blurb: "Firefighters, social workers, mail carriers, park rangers and politicians." },
    { id: "tech", title: "Tech & Office", image: "education_computer_science", blurb: "Game developers, hackers (the good kind), data scientists, designers and accountants." },
    { id: "creative", title: "Creative & Media", image: "work_artist", blurb: "Journalists, photographers, fashion designers, architects and film directors." },
    { id: "hospitality", title: "Hospitality & Travel", image: "work_tourguide", blurb: "Chefs, bartenders, hotel managers, pilots and flight attendants." },
    { id: "science", title: "Science & Nature", image: "education_science", blurb: "Marine biologists, astronauts, engineers, zookeepers and meteorologists." },
    { id: "sports", title: "Sports & Online", image: "health_workout", blurb: "Trainers, pro athletes, lifeguards, ski instructors and content creators." },
];

const L = (n: number, h = 0, hap = 0, san = 0) => Array.from({ length: n }, (_, i) => [h, hap, san - Math.floor(i / 2)] as [number, number, number]);

export const CAREERS: CareerDef[] = [
    // ------------------------------------------------------------------ Healthcare
    { id: "nurse", name: "Nurse", category: "health", image: "icon_job_nurse", fallback: "health_hospitalstay", medical: true,
        blurb: "Long shifts, real lives saved. Nurse Practitioners need a master's.",
        titles: ["Nursing Assistant", "Registered Nurse", "Charge Nurse", "Nurse Practitioner", "Head Nurse", "Director of Nursing"],
        pay: [500, 900, 1300, 1900, 2500, 3500], mods: [[0, 1, -1], [0, 1, -1], [0, 1, -2], [0, 1, -2], [0, 1, -3], [0, 0, -3]],
        edu: ["highSchool", "nursing", "nursing", "masters", "masters", "masters"] },
    { id: "paramedic", name: "Paramedic", category: "health", image: "icon_job_paramedic", fallback: "health_doctorvisit", medical: true, night: false,
        blurb: "First on the scene of every emergency.",
        titles: ["EMT", "Paramedic", "Senior Paramedic", "Field Supervisor", "EMS Chief"],
        pay: [550, 900, 1300, 1800, 2600], mods: [[0, 1, -2], [0, 1, -2], [0, 1, -3], [0, 0, -3], [0, 0, -3]],
        edu: ["emtTraining", "emtTraining", "emtTraining", "emtTraining", "emtTraining"] },
    { id: "pharmacist", name: "Pharmacist", category: "health", image: "icon_job_pharmacist", fallback: "health_pills", medical: true,
        blurb: "Start as a technician; Pharmacy School (after Biology) makes you a pharmacist.",
        titles: ["Pharmacy Technician", "Pharmacist", "Senior Pharmacist", "Pharmacy Manager", "Director of Pharmacy"],
        pay: [500, 2200, 2800, 3500, 4500], mods: [[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -2], [0, 0, -2]],
        edu: ["highSchool", "pharmacySchool", "pharmacySchool", "pharmacySchool", "pharmacySchool"] },
    { id: "veterinarian", name: "Veterinarian", category: "health", image: "icon_job_vet", fallback: "pet_dog", medical: true,
        blurb: "Puppies, kittens and the occasional angry parrot. Vet School comes after Biology.",
        titles: ["Vet Assistant", "Veterinarian", "Senior Veterinarian", "Clinic Owner", "Chief of Veterinary Medicine"],
        pay: [450, 1800, 2600, 3800, 5000], mods: [[0, 2, -1], [0, 2, -1], [0, 2, -2], [0, 1, -2], [0, 1, -3]],
        edu: ["highSchool", "vetSchool", "vetSchool", "vetSchool", "vetSchool"] },
    { id: "dentist", name: "Dentist", category: "health", image: "icon_job_dentist", fallback: "skill_hygieneexpert", medical: true,
        blurb: "Everyone's least favourite appointment, and one of the best paid. Dental School comes after Biology.",
        titles: ["Dental Assistant", "Dental Hygienist", "Dentist", "Orthodontist", "Dental Practice Owner"],
        pay: [500, 1000, 3000, 4500, 6500], mods: [[0, 0, -1], [0, 0, -1], [0, 0, -2], [0, 0, -2], [0, 0, -3]],
        edu: ["highSchool", "college_biology", "dentalSchool", "dentalSchool", "dentalSchool"] },

    // ------------------------------------------------------------------ Skilled Trades
    { id: "electrician", name: "Electrician", category: "trades", image: "icon_job_electrician", fallback: "work_constructionworker",
        blurb: "Learn on the job, get licensed at Trade School, run your own crew.",
        titles: ["Apprentice Electrician", "Journeyman Electrician", "Master Electrician", "Electrical Contractor", "Contracting Business Owner"],
        pay: [500, 900, 1400, 2200, 3500], mods: [[-1, 0, 0], [-1, 0, 0], [-1, 0, -1], [0, 0, -1], [0, 0, -2]],
        edu: ["highSchool", "electricalTrade", "electricalTrade", "electricalTrade", "electricalTrade"] },
    { id: "plumber", name: "Plumber", category: "trades", image: "icon_job_plumber", fallback: "housing_small_apartment",
        blurb: "Someone always has a leak. Business is never slow.",
        titles: ["Plumber's Helper", "Apprentice Plumber", "Journeyman Plumber", "Master Plumber", "Plumbing Company Owner"],
        pay: [450, 650, 1000, 1600, 3000], mods: [[0, -1, 0], [0, -1, 0], [0, 0, 0], [0, 0, -1], [0, 0, -2]],
        edu: [null, "plumbingTrade", "plumbingTrade", "plumbingTrade", "plumbingTrade"],
        season: { winter: 1.25 }, seasonNote: "Winter: frozen pipes everywhere (+25% pay)." },
    { id: "carpenter", name: "Carpenter", category: "trades", image: "icon_job_carpenter", fallback: "work_constructionworker", outdoor: true,
        blurb: "Build things that last. Slower in winter.",
        titles: ["Carpenter's Helper", "Carpenter", "Finish Carpenter", "Master Carpenter", "Custom Home Builder"],
        pay: [450, 750, 1000, 1500, 2600], mods: [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, -1], [0, 0, -2]],
        edu: [null, null, "carpentryTrade", "carpentryTrade", "carpentryTrade"],
        season: { winter: 0.8, summer: 1.1 }, seasonNote: "Winter: fewer building jobs (−20% pay). Summer: +10%." },
    { id: "mechanic", name: "Mechanic", category: "trades", image: "icon_job_mechanic", fallback: "possession_car",
        blurb: "Oil changes today, your own garage tomorrow.",
        titles: ["Lube Tech", "Mechanic", "Master Mechanic", "Service Manager", "Garage Owner"],
        pay: [400, 700, 1100, 1600, 2500], mods: [[0, 0, 0], [0, 0, 0], [0, 1, -1], [0, 0, -1], [0, 0, -2]],
        edu: [null, "autoMechanics", "autoMechanics", "autoMechanics", "autoMechanics"] },
    { id: "truckDriver", name: "Truck Driver", category: "trades", image: "icon_job_trucker", fallback: "work_uber",
        blurb: "Open roads and long nights. Needs a Commercial Driver's License after the first job.",
        titles: ["Delivery Driver", "Truck Driver", "Long-Haul Trucker", "Owner-Operator", "Trucking Fleet Owner"],
        pay: [450, 800, 1100, 1700, 2800], mods: [[0, 0, -1], [0, 0, -1], [-1, 0, -2], [-1, 0, -2], [0, 0, -2]],
        edu: ["highSchool", "cdl", "cdl", "cdl", "cdl"], night: true, minAge: 18,
        season: { winter: 1.1 }, seasonNote: "Holiday shipping season pays a little extra in winter." },

    // ------------------------------------------------------------------ Public Service
    { id: "firefighter", name: "Firefighter", category: "public", image: "icon_job_firefighter", fallback: "work_police", minHealth: 60, outdoor: true,
        blurb: "Run in when everyone runs out. You need to stay fit (60+ health).",
        titles: ["Volunteer Firefighter", "Firefighter", "Engineer", "Lieutenant", "Captain", "Battalion Chief", "Fire Chief"],
        pay: [100, 800, 1100, 1500, 2000, 2800, 3800], mods: [[0, 2, -1], [-1, 2, -2], [-1, 2, -2], [-1, 1, -2], [0, 1, -3], [0, 1, -3], [0, 1, -3]],
        edu: [null, "fireAcademy", "fireAcademy", "fireAcademy", "fireAcademy", "fireAcademy", "fireAcademy"],
        season: { summer: 1.2 }, seasonNote: "Summer is wildfire season: overtime (+20% pay)." },
    { id: "socialWorker", name: "Social Worker", category: "public", image: "icon_job_socialworker", fallback: "waving_hand",
        blurb: "Help families through their worst days. Heavy, but it matters.",
        titles: ["Case Aide", "Social Worker", "Senior Social Worker", "Clinical Social Worker", "Program Director"],
        pay: [450, 800, 1100, 1600, 2400], mods: [[0, 1, -2], [0, 2, -2], [0, 2, -3], [0, 2, -3], [0, 1, -3]],
        edu: ["highSchool", "socialWork", "socialWork", "masters", "masters"] },
    { id: "mailCarrier", name: "Mail Carrier", category: "public", image: "icon_job_mail", fallback: "childaction_call", outdoor: true,
        blurb: "Rain or shine. December is very busy.",
        titles: ["Mail Sorter", "Mail Carrier", "Senior Carrier", "Postmaster", "Regional Postmaster"],
        pay: [450, 650, 850, 1300, 2000], mods: [[1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, -2]],
        edu: ["highSchool", "highSchool", "highSchool", "highSchool", "highSchool"],
        season: { winter: 1.2 }, seasonNote: "Winter: the holiday rush (+20% pay)." },
    { id: "parkRanger", name: "Park Ranger", category: "public", image: "icon_job_ranger", fallback: "possesion_campingtent", outdoor: true,
        blurb: "Forests, trails and the occasional bear.",
        titles: ["Seasonal Ranger", "Park Ranger", "Senior Ranger", "Chief Ranger", "Park Superintendent"],
        pay: [400, 700, 1000, 1500, 2300], mods: [[1, 2, 1], [1, 2, 1], [1, 2, 0], [0, 1, 0], [0, 1, -1]],
        edu: [null, "environmentalScience", "environmentalScience", "environmentalScience", "environmentalScience"],
        season: { summer: 1.2, winter: 0.8 }, seasonNote: "Summer: the parks are packed (+20%). Winter: −20%." },
    { id: "politician", name: "Politician", category: "public", image: "icon_job_politician", fallback: "work_lawyer", minAge: 18,
        blurb: "From volunteer to President. Every step up needs more followers on social media.",
        titles: ["Campaign Volunteer", "City Council Member", "Mayor", "State Representative", "Governor", "Senator", "President"],
        pay: [50, 800, 1800, 2500, 4000, 5000, 9000], mods: [[0, 0, -1], [0, 1, -2], [0, 1, -3], [0, 1, -3], [0, 1, -4], [0, 1, -5], [-1, 2, -6]],
        edu: [null, "highSchool", "politicalScience", "politicalScience", "politicalScience", "politicalScience", "politicalScience"],
        followers: [0, 500, 5000, 25000, 100000, 500000, 2000000], trait: "confident" },

    // ------------------------------------------------------------------ Tech & Office
    { id: "gameDeveloper", name: "Game Developer", category: "tech", image: "icon_job_gamedev", fallback: "vacation_videogames",
        blurb: "Make the games you grew up playing. Crunch time is real.",
        titles: ["QA Tester", "Junior Game Developer", "Game Developer", "Senior Game Developer", "Lead Designer", "Creative Director", "Studio Head"],
        pay: [450, 900, 1400, 2000, 3000, 4500, 7000], mods: [[0, 2, -1], [0, 1, -2], [0, 1, -2], [0, 1, -3], [0, 1, -3], [0, 0, -4], [0, 0, -4]],
        edu: ["highSchool", "gameDesign", "gameDesign", "gameDesign", "gameDesign", "gameDesign", "gameDesign"],
        hobby: { id: "gaming", skill: 45, from: 5 } },
    { id: "cybersecurity", name: "Cybersecurity", category: "tech", image: "icon_job_cyber", fallback: "possesion_computer_1",
        blurb: "Stop hackers for a living. The Cybersecurity Certificate gets you in; Computer Science takes you higher.",
        titles: ["SOC Analyst", "Security Analyst", "Penetration Tester", "Security Engineer", "Security Architect", "Chief Information Security Officer"],
        pay: [800, 1300, 1900, 2600, 3800, 6000], mods: [[0, 0, -1], [0, 0, -2], [0, 1, -2], [0, 0, -3], [0, 0, -3], [0, 0, -4]],
        edu: ["cybersecurityCert", "cybersecurityCert", "college_computerScience", "college_computerScience", "college_computerScience", "college_computerScience"], night: true },
    { id: "dataScientist", name: "Data Scientist", category: "tech", image: "icon_job_data", fallback: "work_data_entry",
        blurb: "Find the story hiding in a billion numbers.",
        titles: ["Data Analyst", "Junior Data Scientist", "Data Scientist", "Senior Data Scientist", "Head of Data", "Chief Data Officer"],
        pay: [700, 1100, 1700, 2500, 3800, 6000], mods: [[0, 0, -1], [0, 0, -1], [0, 0, -2], [0, 0, -2], [0, 0, -3], [0, 0, -4]],
        edu: ["dataScience", "dataScience", "dataScience", "masters", "masters", "masters"] },
    { id: "uxDesigner", name: "UX Designer", category: "tech", image: "icon_job_ux", fallback: "education_art",
        blurb: "Make apps people actually enjoy using.",
        titles: ["Junior Designer", "UX Designer", "Senior UX Designer", "Design Lead", "Head of Design"],
        pay: [600, 1000, 1600, 2400, 3800], mods: [[0, 1, -1], [0, 1, -1], [0, 1, -2], [0, 0, -2], [0, 0, -3]],
        edu: ["graphicDesign", "graphicDesign", "graphicDesign", "graphicDesign", "graphicDesign"] },
    { id: "accountant", name: "Accountant", category: "tech", image: "icon_job_accountant", fallback: "skill_personalfinance",
        blurb: "Numbers, deadlines and a very busy spring. The top jobs need an MBA.",
        titles: ["Bookkeeper", "Staff Accountant", "Senior Accountant", "Accounting Manager", "Partner", "Chief Financial Officer"],
        pay: [500, 800, 1200, 1800, 3000, 6000], mods: [[0, -1, -1], [0, 0, -1], [0, 0, -1], [0, 0, -2], [0, 0, -3], [0, 0, -4]],
        edu: ["highSchool", "accounting", "accounting", "accounting", "mba", "mba"], trait: "logical",
        season: { spring: 1.4 }, seasonNote: "Spring is tax season: +40% pay, −2 sanity a week." },

    // ------------------------------------------------------------------ Creative & Media
    { id: "journalist", name: "Journalist", category: "creative", image: "icon_job_journalist", fallback: "sidehustle_author",
        blurb: "Chase the story. Your posts get more followers while you work in news.",
        titles: ["Newsroom Intern", "Staff Writer", "Reporter", "Senior Correspondent", "Editor", "Editor-in-Chief"],
        pay: [300, 600, 900, 1400, 2200, 3500], mods: [[0, 1, -1], [0, 1, -1], [0, 1, -2], [0, 1, -2], [0, 0, -3], [0, 0, -3]],
        edu: [null, "journalism", "journalism", "journalism", "journalism", "journalism"],
        hobby: { id: "writing", skill: 45, from: 4 } },
    { id: "photographer", name: "Photographer", category: "creative", image: "icon_job_photographer", fallback: "possesion_recordingequipment_2",
        blurb: "Weddings in summer, quiet winters.",
        titles: ["Photo Assistant", "Freelance Photographer", "Wedding Photographer", "Photojournalist", "Studio Owner", "Celebrity Photographer"],
        pay: [300, 500, 900, 1300, 2000, 3500], mods: [[0, 1, 0], [0, 1, -1], [0, 1, -1], [0, 1, -2], [0, 0, -2], [0, 1, -2]],
        edu: [null, null, "photographyCourse", "photographyCourse", "photographyCourse", "photographyCourse"],
        season: { summer: 1.3, winter: 0.7 }, seasonNote: "Summer: wedding season (+30%). Winter: −30%." },
    { id: "fashionDesigner", name: "Fashion Designer", category: "creative", image: "icon_job_fashion", fallback: "education_art",
        blurb: "From pattern maker to fashion icon (the very top needs a million followers).",
        titles: ["Design Intern", "Pattern Maker", "Assistant Designer", "Fashion Designer", "Head Designer", "Creative Director", "Fashion Icon"],
        pay: [300, 500, 900, 1400, 2500, 4500, 8000], mods: [[0, 1, -1], [0, 1, -1], [0, 1, -2], [0, 1, -2], [0, 1, -3], [0, 1, -4], [0, 2, -4]],
        edu: [null, null, "fashionDesign", "fashionDesign", "fashionDesign", "fashionDesign", "fashionDesign"],
        followers: [0, 0, 0, 0, 10000, 100000, 1000000] },
    { id: "architect", name: "Architect", category: "creative", image: "icon_job_architect", fallback: "housing_skyscraper",
        blurb: "Design the buildings everyone else lives in. A long degree, a great career.",
        titles: ["Architectural Drafter", "Junior Architect", "Architect", "Project Architect", "Senior Architect", "Principal Architect"],
        pay: [600, 1000, 1700, 2400, 3500, 5500], mods: [[0, 1, -1], [0, 1, -1], [0, 1, -2], [0, 0, -2], [0, 0, -3], [0, 0, -3]],
        edu: ["highSchool", "architecture", "architecture", "architecture", "architecture", "architecture"] },
    { id: "filmDirector", name: "Film Director", category: "creative", image: "icon_job_director", fallback: "education_theater",
        blurb: "Fetch coffee on set today, accept an award tomorrow. Directors with fans make bigger films.",
        titles: ["Production Assistant", "Assistant Director", "Music Video Director", "Indie Film Director", "Film Director", "Award-Winning Director"],
        pay: [300, 700, 1200, 2000, 4000, [6000, 15000]], mods: [[0, 0, -1], [0, 1, -2], [0, 1, -2], [0, 2, -2], [0, 1, -3], [0, 2, -4]],
        edu: [null, null, "filmSchool", "filmSchool", "filmSchool", "filmSchool"],
        followers: [0, 0, 0, 5000, 50000, 500000] },

    // ------------------------------------------------------------------ Hospitality & Travel
    { id: "chef", name: "Chef", category: "hospitality", image: "icon_job_chef", fallback: "skill_homechef",
        blurb: "Dishwasher to Celebrity Chef. Head Chefs need to really cook (the Cooking hobby at Skilled).",
        titles: ["Dishwasher", "Prep Cook", "Line Cook", "Sous Chef", "Head Chef", "Executive Chef", "Celebrity Chef"],
        pay: [350, 450, 600, 900, 1500, 2500, 5000], mods: [[0, -1, -1], [0, 0, -1], [0, 0, -2], [0, 1, -2], [0, 1, -3], [0, 1, -3], [0, 2, -3]],
        edu: [null, null, null, "culinarySchool", "culinarySchool", "culinarySchool", "culinarySchool"],
        hobby: { id: "cooking", skill: 45, from: 5 }, followers: [0, 0, 0, 0, 0, 0, 250000], night: true },
    { id: "bartender", name: "Bartender", category: "hospitality", image: "icon_job_bartender", fallback: "love_nightclub", night: true, minAge: 18,
        blurb: "A night job: great tips, great stories. Vampires love it (no sunlight).",
        titles: ["Barback", "Bartender", "Head Bartender", "Mixologist", "Bar Manager", "Bar Owner"],
        pay: [[300, 450], [450, 800], [600, 1000], [800, 1300], 1600, [2000, 3500]], mods: [[0, 1, -1], [-1, 2, -1], [-1, 2, -1], [0, 2, -1], [0, 1, -2], [0, 1, -2]],
        edu: [null, "bartendingCourse", "bartendingCourse", "bartendingCourse", "bartendingCourse", "bartendingCourse"],
        season: { winter: 1.15 }, seasonNote: "Winter holidays: +15% tips." },
    { id: "hotelManager", name: "Hotel Manager", category: "hospitality", image: "icon_job_hotel", fallback: "vacation_luxury",
        blurb: "Keep a hotel full of strangers happy. Summer is the busy season.",
        titles: ["Front Desk Clerk", "Concierge", "Assistant Manager", "Hotel Manager", "General Manager", "Regional Director"],
        pay: [400, 600, 900, 1500, 2500, 4000], mods: [[0, 0, -1], [0, 1, -1], [0, 0, -2], [0, 0, -2], [0, 0, -3], [0, 0, -3]],
        edu: ["highSchool", "highSchool", "hospitality", "hospitality", "hospitality", "hospitality"],
        season: { summer: 1.2 }, seasonNote: "Summer: tourist season (+20%)." },
    { id: "pilot", name: "Pilot", category: "hospitality", image: "icon_job_pilot", fallback: "possession_jet", minHealth: 50,
        blurb: "Flight School is long and expensive; the view is worth it. Pilots fly free on vacation (−50%).",
        titles: ["Flight Instructor", "First Officer", "Captain", "Senior Captain", "Chief Pilot"],
        pay: [900, 1800, 3500, 5000, 7000], mods: [[0, 1, -1], [0, 1, -2], [0, 1, -2], [0, 1, -3], [0, 0, -3]],
        edu: ["flightSchool", "flightSchool", "flightSchool", "flightSchool", "flightSchool"] },
    { id: "flightAttendant", name: "Flight Attendant", category: "hospitality", image: "icon_job_flightattendant", fallback: "vacation_international",
        blurb: "See the world on someone else's dime. Flight attendants fly free on vacation (−50%).",
        titles: ["Flight Attendant", "Senior Flight Attendant", "Purser", "In-Flight Manager", "Base Manager"],
        pay: [600, 800, 1100, 1500, 2200], mods: [[-1, 2, -1], [-1, 2, -1], [0, 1, -2], [0, 1, -2], [0, 0, -2]],
        edu: ["flightAttendantTraining", "flightAttendantTraining", "flightAttendantTraining", "flightAttendantTraining", "hospitality"], minAge: 18 },

    // ------------------------------------------------------------------ Science & Nature
    { id: "marineBiologist", name: "Marine Biologist", category: "science", image: "icon_job_marine", fallback: "vacation_luxury",
        blurb: "Whales, coral and a lot of boat time.",
        titles: ["Aquarium Lab Assistant", "Field Researcher", "Marine Biologist", "Senior Marine Biologist", "Research Director"],
        pay: [400, 700, 1300, 2000, 3200], mods: [[0, 2, 0], [0, 2, -1], [0, 2, -1], [0, 1, -2], [0, 1, -2]],
        edu: ["highSchool", "marineBiology", "marineBiology", "masters", "phd"], season: { summer: 1.1 }, seasonNote: "Summer: field season (+10%)." },
    { id: "astronaut", name: "Astronaut", category: "science", image: "icon_job_astronaut", fallback: "possession_rocket", minHealth: 70, maxAge: 50,
        blurb: "The hardest job to get on Earth (or off it). Needs Aerospace Engineering, top fitness (70+ health) and to apply before 50.",
        titles: ["Astronaut Candidate", "Astronaut", "Mission Specialist", "Flight Engineer", "Mission Commander", "Moonwalker"],
        pay: [1500, 2500, 3500, 4500, 6000, 9000], mods: [[1, 1, -2], [1, 2, -2], [0, 2, -3], [0, 2, -3], [0, 2, -4], [0, 3, -4]],
        edu: ["aerospaceEngineering", "aerospaceEngineering", "masters", "masters", "masters", "phd"] },
    { id: "engineer", name: "Engineer", category: "science", image: "icon_job_engineer", fallback: "education_science",
        blurb: "Bridges, engines, power plants: you make them work.",
        titles: ["Engineering Intern", "Junior Engineer", "Engineer", "Senior Engineer", "Principal Engineer", "Chief Engineer"],
        pay: [600, 1100, 1700, 2500, 3500, 5500], mods: [[0, 0, -1], [0, 0, -1], [0, 1, -2], [0, 0, -2], [0, 0, -3], [0, 0, -3]],
        edu: ["engineering", "engineering", "engineering", "engineering", "masters", "masters"], trait: "logical" },
    { id: "zookeeper", name: "Zookeeper", category: "science", image: "icon_job_zookeeper", fallback: "pet_turkey", outdoor: true,
        blurb: "Feed the lions (carefully). A happy job.",
        titles: ["Zoo Volunteer", "Zookeeper", "Senior Zookeeper", "Head Keeper", "Zoo Curator", "Zoo Director"],
        pay: [100, 500, 700, 1000, 1600, 2600], mods: [[0, 2, 1], [0, 2, 1], [0, 2, 0], [0, 2, 0], [0, 1, -1], [0, 1, -2]],
        edu: [null, "highSchool", "zoology", "zoology", "zoology", "zoology"] },
    { id: "meteorologist", name: "Meteorologist", category: "science", image: "icon_job_weather", fallback: "vacation_park",
        blurb: "Predict the weather (and take the blame). Storm season keeps you busy.",
        titles: ["Weather Intern", "Weather Forecaster", "TV Meteorologist", "Chief Meteorologist", "Climate Scientist"],
        pay: [400, 800, 1400, 2200, 3200], mods: [[0, 0, -1], [0, 1, -1], [0, 2, -2], [0, 1, -2], [0, 1, -2]],
        edu: [null, "meteorology", "meteorology", "meteorology", "phd"],
        season: { winter: 1.2 }, seasonNote: "Winter storms: +20% pay." },

    // ------------------------------------------------------------------ Sports & Online
    { id: "personalTrainer", name: "Personal Trainer", category: "sports", image: "icon_job_trainer", fallback: "health_workout",
        blurb: "Get paid to work out. Everybody starts a diet in January.",
        titles: ["Gym Attendant", "Personal Trainer", "Senior Trainer", "Fitness Coach", "Gym Owner"],
        pay: [350, 700, 1100, 1700, 3000], mods: [[2, 1, 0], [3, 1, 0], [3, 1, -1], [2, 1, -1], [1, 0, -2]],
        edu: [null, "trainerCert", "trainerCert", "trainerCert", "trainerCert"],
        season: { winter: 1.25 }, seasonNote: "Winter: New Year's resolutions (+25%)." },
    { id: "proAthlete", name: "Pro Athlete", category: "sports", image: "icon_job_athlete", fallback: "vacation_soccer", minHealth: 75, maxAge: 30,
        blurb: "Apply by 30 with 75+ health. Stars earn fans. Most retire before 40.",
        titles: ["Amateur Player", "Minor League Player", "Pro Player", "Starting Player", "All-Star", "MVP", "Hall of Famer"],
        pay: [100, 600, 3000, 6000, 12000, 20000, 30000], mods: [[-1, 2, -1], [-1, 2, -1], [-2, 2, -2], [-2, 3, -2], [-2, 3, -3], [-2, 3, -3], [-1, 3, -3]],
        edu: [null, null, null, null, null, null, null], trait: "confident" },
    { id: "lifeguard", name: "Lifeguard", category: "sports", image: "icon_job_lifeguard", fallback: "housing_beach_villa", outdoor: true, minAge: 15,
        blurb: "A summer job (from 15). In other seasons you guard an indoor pool for less.",
        titles: ["Junior Lifeguard", "Lifeguard", "Head Lifeguard", "Beach Patrol Captain"],
        pay: [350, 500, 700, 1000], mods: [[2, 2, 0], [2, 2, 0], [1, 1, -1], [1, 1, -1]],
        edu: ["lifeguardCert", "lifeguardCert", "lifeguardCert", "lifeguardCert"],
        season: { summer: 1.5, winter: 0.4, spring: 0.7, fall: 0.7 }, seasonNote: "Summer: beach season (+50%). Winter: indoor pool (−60%). Spring/fall: −30%." },
    { id: "skiInstructor", name: "Ski Instructor", category: "sports", image: "icon_job_ski", fallback: "vacation_ski", outdoor: true, minAge: 16,
        blurb: "A winter job. In summer you guide mountain bike tours for less.",
        titles: ["Lift Operator", "Ski Instructor", "Senior Instructor", "Ski School Director"],
        pay: [350, 600, 900, 1400], mods: [[2, 2, 0], [2, 2, 0], [1, 2, -1], [1, 1, -1]],
        edu: [null, "skiCert", "skiCert", "skiCert"],
        season: { winter: 1.6, summer: 0.4, spring: 0.7, fall: 0.7 }, seasonNote: "Winter: ski season (+60%). Summer: bike tours (−60%). Spring/fall: −30%." },
    { id: "contentCreator", name: "Content Creator", category: "sports", image: "icon_job_creator", fallback: "sidehustle_youtube", minAge: 14,
        blurb: "Make content full time. Every promotion needs more social media followers; working also gets you followers.",
        titles: ["Aspiring Creator", "Micro-Influencer", "Content Creator", "Influencer", "Top Creator", "Internet Icon"],
        pay: [[0, 200], [300, 800], [600, 1400], [1500, 4000], [4000, 10000], [10000, 30000]], mods: [[0, 1, -1], [0, 2, -1], [0, 2, -2], [0, 2, -3], [0, 2, -3], [0, 3, -4]],
        edu: [null, null, null, null, null, null],
        followers: [0, 1000, 10000, 100000, 1000000, 10000000] },
];

export type DegreeKind = "college" | "grad" | "training";
export interface DegreeDef {
    id: string; title: string; kind: DegreeKind; image: string; fallback: string;
    years: number;              // in work-years (like the original degrees)
    costPerWeek: number;
    prereq: string;             // CompletableAction name
    description: string;
    job?: string;               // the career this degree is "for"
}
const C = (id: string, title: string, image: string, fallback: string, description: string, job: string, years = 3): DegreeDef =>
    ({ id, title, kind: "college", image, fallback, years, costPerWeek: 500, prereq: "highSchool", description, job });
const T = (id: string, title: string, image: string, fallback: string, years: number, costPerWeek: number, description: string, job: string, prereq = "highSchool"): DegreeDef =>
    ({ id, title, kind: "training", image, fallback, years, costPerWeek, prereq, description, job });

export const DEGREES: DegreeDef[] = [
    // college degrees
    C("nursing", "Nursing Degree", "icon_deg_nursing", "education_college_biology", "Become a Registered Nurse.", "nurse"),
    C("socialWork", "Social Work Degree", "icon_deg_socialwork", "education_literature", "Help people for a living.", "socialWorker"),
    C("environmentalScience", "Environmental Science Degree", "icon_deg_environment", "education_science", "Protect forests, parks and wildlife.", "parkRanger"),
    C("politicalScience", "Political Science Degree", "icon_deg_politics", "education_philosophy", "Needed to run for Mayor and beyond.", "politician"),
    C("gameDesign", "Game Design Degree", "icon_deg_gamedesign", "education_computer_science", "Make video games.", "gameDeveloper"),
    C("dataScience", "Data Science Degree", "icon_deg_datascience", "education_computer_science", "Statistics, code and a lot of graphs.", "dataScientist"),
    C("graphicDesign", "Graphic & UX Design Degree", "icon_deg_design", "education_art", "Design apps, websites and brands.", "uxDesigner"),
    C("accounting", "Accounting Degree", "icon_deg_accounting", "education_college_finance", "Become a certified accountant.", "accountant"),
    C("journalism", "Journalism Degree", "icon_deg_journalism", "education_literature", "Report the news.", "journalist"),
    C("fashionDesign", "Fashion Design Degree", "icon_deg_fashion", "education_art", "Sketch, sew and set trends.", "fashionDesigner"),
    C("architecture", "Architecture Degree", "icon_deg_architecture", "education_masters", "Design buildings. A long one (4 years).", "architect", 4),
    C("filmSchool", "Film School", "icon_deg_film", "education_theater", "Learn to direct movies.", "filmDirector"),
    C("hospitality", "Hospitality Management Degree", "icon_deg_hospitality", "education_college_business", "Run hotels, resorts and airlines.", "hotelManager"),
    C("marineBiology", "Marine Biology Degree", "icon_deg_marine", "education_college_biology", "Study life in the oceans.", "marineBiologist"),
    C("aerospaceEngineering", "Aerospace Engineering Degree", "icon_deg_aerospace", "education_science", "Rockets, satellites and spacecraft (4 years). The way to become an astronaut.", "astronaut", 4),
    C("engineering", "Engineering Degree", "icon_deg_engineering", "education_science", "Build bridges, engines and machines (4 years).", "engineer", 4),
    C("zoology", "Zoology Degree", "icon_deg_zoology", "education_college_biology", "Everything about animals.", "zookeeper"),
    C("meteorology", "Meteorology Degree", "icon_deg_meteorology", "education_science", "Forecast the weather.", "meteorologist"),
    // graduate schools (after Biology)
    { id: "pharmacySchool", title: "Pharmacy School", kind: "grad", image: "icon_deg_pharmacy", fallback: "education_medschool", years: 3, costPerWeek: 1000, prereq: "college_biology", description: "Become a pharmacist. Needs a Biology degree.", job: "pharmacist" },
    { id: "vetSchool", title: "Veterinary School", kind: "grad", image: "icon_deg_vet", fallback: "education_medschool", years: 4, costPerWeek: 1000, prereq: "college_biology", description: "Become a vet. Needs a Biology degree.", job: "veterinarian" },
    { id: "dentalSchool", title: "Dental School", kind: "grad", image: "icon_deg_dental", fallback: "education_medschool", years: 4, costPerWeek: 1000, prereq: "college_biology", description: "Become a dentist. Needs a Biology degree.", job: "dentist" },
    // trade school and training
    T("emtTraining", "EMT Training", "icon_tr_emt", "health_doctorvisit", 0.5, 150, "Emergency medical training for paramedics.", "paramedic"),
    T("electricalTrade", "Trade School: Electrical", "icon_tr_electrical", "work_constructionworker", 1.5, 200, "Get your electrician's license.", "electrician"),
    T("plumbingTrade", "Trade School: Plumbing", "icon_tr_plumbing", "work_constructionworker", 1.5, 200, "Get your plumber's license.", "plumber"),
    T("carpentryTrade", "Trade School: Carpentry", "icon_tr_carpentry", "work_constructionworker", 1, 150, "Fine woodworking and building codes.", "carpenter"),
    T("autoMechanics", "Auto Mechanics Certificate", "icon_tr_mechanic", "possession_car", 1, 150, "Engines, brakes and diagnostics.", "mechanic"),
    T("cdl", "Commercial Driver's License", "icon_tr_cdl", "work_uber", 0.25, 250, "Drive big trucks legally.", "truckDriver"),
    T("fireAcademy", "Fire Academy", "icon_tr_fire", "education_policeacademy", 0.5, 100, "Train to fight fires.", "firefighter"),
    T("flightSchool", "Flight School", "icon_tr_flight", "possession_jet", 2, 1500, "Learn to fly planes. Expensive, and worth it.", "pilot"),
    T("flightAttendantTraining", "Flight Attendant Training", "icon_tr_flightattendant", "vacation_international", 0.25, 200, "Safety drills and a very nice smile.", "flightAttendant"),
    T("culinarySchool", "Culinary School", "icon_tr_culinary", "skill_homechef", 1, 400, "Knife skills, sauces and kitchen discipline.", "chef"),
    T("bartendingCourse", "Bartending Course", "icon_tr_bartending", "love_nightclub", 0.1, 200, "A few weeks of cocktails.", "bartender"),
    T("photographyCourse", "Photography Course", "icon_tr_photography", "possesion_recordingequipment_2", 0.5, 200, "Light, lenses and composition.", "photographer"),
    T("trainerCert", "Personal Trainer Certification", "icon_tr_trainer", "health_workout", 0.25, 200, "Get certified to coach others.", "personalTrainer"),
    T("lifeguardCert", "Lifeguard Certification", "icon_tr_lifeguard", "housing_beach_villa", 0.1, 100, "Rescue swimming and first aid. Teens can take it (after middle school).", "lifeguard", "middleSchool"),
    T("skiCert", "Ski Instructor Certification", "icon_tr_ski", "vacation_ski", 0.25, 300, "Teach people to ski.", "skiInstructor"),
    T("cybersecurityCert", "Cybersecurity Certificate", "icon_tr_cyber", "possesion_computer_1", 1, 400, "Ethical hacking and network defence.", "cybersecurity"),
];

export const CAREER_BY_ID: Record<string, CareerDef> = Object.fromEntries(CAREERS.map((c) => [c.id, c]));
export const DEGREE_BY_ID: Record<string, DegreeDef> = Object.fromEntries(DEGREES.map((d) => [d.id, d]));
