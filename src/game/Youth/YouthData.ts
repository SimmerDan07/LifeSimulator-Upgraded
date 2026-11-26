// v0.32.0 "Childhood & Teen Years": the data (activities, crowds, upbringing traits, subjects, part-time jobs).
// Rules live in Youth.ts, the rows in YouthScreens.ts, the random school and home moments in YouthMoments.ts.
// Every picture is an art slot (data/ArtSlots.ts): its own file name, with a stand-in until it's drawn.
import { CompletableAction } from "../Enums/CompletableAction";
import { Trait } from "../Enums/Trait";

export type TraitKey =
    | "bookworm" | "brainiac" | "athlete" | "creative" | "musical" | "social" | "leader"
    | "kind" | "troublemaker" | "rebel" | "resilient" | "golden" | "hardWorker";

// ---------------------------------------------------------------- after-school activities
export type ActKind = "sport" | "music" | "art" | "brain" | "social";
export interface ActDef {
    id: string; title: string; kind: ActKind; minAge: number;
    image: string; fallback: string;
    /** Trait points per practice. */
    points: Partial<Record<TraitKey, number>>;
    mods: [number, number, number];        // health, happiness, sanity per practice
    /** Practising also trains this adult hobby (Hobbies.ts) … */
    hobby?: string;
    /** … or this Celebrity Life skill. */
    celeb?: "acting" | "music" | "dance";
    /** The show-off, by level (Good, Great, Star, top). */
    show: string;
    /** The name of the top level ("Team Captain", "First Chair", …). */
    top: string;
    blurb: string;
}

export const ACT_LEVELS = [
    { name: "Beginner", min: 0 },
    { name: "Good", min: 20 },
    { name: "Great", min: 45 },
    { name: "Star", min: 70 },
    { name: "", min: 90 },   // the activity's own top title (ActDef.top)
];

const sport = (id: string, title: string, minAge: number, fallback: string, show: string, blurb: string, extra: Partial<ActDef> = {}): ActDef =>
    ({ id, title, kind: "sport", minAge, image: "icon_youth_" + id, fallback, points: { athlete: 2 }, mods: [2, 3, 1], show, top: "Team Captain", blurb, ...extra });

export const ACTIVITIES: ActDef[] = [
    // sports
    sport("soccer", "Soccer", 5, "vacation_soccer", "Play in the Big Game", "Run, pass, score. Saturday mornings in muddy cleats."),
    sport("basketball", "Basketball", 7, "vacation_badminton", "Play in the Big Game", "Hoops after school until the streetlights come on."),
    sport("baseball", "Baseball & Softball", 6, "vacation_hockeymatch", "Play in the Big Game", "Batting cages, dugout snacks and the occasional home run."),
    sport("swimming", "Swimming", 5, "vacation_spa", "Swim at a Meet", "Laps, goggles and chlorine hair. Lifeguards start here."),
    sport("track", "Track & Field", 8, "health_workout", "Race at a Meet", "Sprints, relays and long jumps. Also trains your Running hobby.", { hobby: "running" }),
    sport("gymnastics", "Gymnastics", 5, "vacation_park", "Compete at a Meet", "Flips, beams and a lot of chalk.", { points: { athlete: 2, resilient: 1 } }),
    sport("martialArts", "Karate", 6, "vacation_pingpong", "Fight at a Tournament", "Discipline, belts and a very loud \"hai!\".", { points: { athlete: 2, resilient: 1 }, top: "Black Belt" }),
    sport("cheer", "Cheerleading", 11, "vacation_concert", "Compete at Nationals", "Stunts, chants and team spirit.", { points: { athlete: 1, social: 2 }, top: "Head Cheerleader" }),
    { id: "dance", title: "Dance", kind: "sport", minAge: 5, image: "icon_youth_dance", fallback: "love_nightclub", points: { athlete: 1, musical: 1, creative: 1 }, mods: [2, 4, 1],
        celeb: "dance", show: "Dance at the Recital", top: "Principal Dancer", blurb: "Ballet, hip-hop and jazz. Also trains your Celebrity Life dance skill." },
    // music
    { id: "piano", title: "Piano Lessons", kind: "music", minAge: 5, image: "icon_youth_piano", fallback: "vacation_opera", points: { musical: 2, bookworm: 1 }, mods: [0, 2, 3],
        celeb: "music", show: "Play at the Recital", top: "Concert Pianist", blurb: "Scales, sonatas and a metronome that never stops." },
    { id: "guitar", title: "Guitar Lessons", kind: "music", minAge: 8, image: "icon_youth_guitar", fallback: "education_college_music", points: { musical: 2, creative: 1 }, mods: [0, 4, 2],
        hobby: "guitar", show: "Play at the Recital", top: "Lead Guitar", blurb: "Your first three chords. Also trains your Guitar hobby." },
    { id: "choir", title: "Choir", kind: "music", minAge: 6, image: "icon_youth_choir", fallback: "vacation_jpopconcert", points: { musical: 2, social: 1 }, mods: [0, 3, 3],
        celeb: "music", show: "Sing at the Concert", top: "Soloist", blurb: "Harmonies, robes and the winter concert. Also trains your singing." },
    { id: "band", title: "School Band", kind: "music", minAge: 10, image: "icon_youth_band", fallback: "possession_turntable_1", points: { musical: 2, social: 1 }, mods: [0, 3, 2],
        celeb: "music", show: "Play at the Concert", top: "First Chair", blurb: "Trumpets, drums and marching at halftime." },
    // arts
    { id: "drama", title: "Drama Club", kind: "art", minAge: 6, image: "icon_youth_drama", fallback: "education_theater", points: { creative: 2, social: 1 }, mods: [0, 4, 1],
        celeb: "acting", show: "Star in the School Play", top: "Lead Role", blurb: "Auditions, stage fright and the spotlight. Also trains your acting." },
    { id: "art", title: "Art Club", kind: "art", minAge: 5, image: "icon_youth_art", fallback: "education_art", points: { creative: 2 }, mods: [0, 3, 3],
        hobby: "painting", show: "Enter the Art Show", top: "Art Prodigy", blurb: "Paint, clay and glitter everywhere. Also trains your Painting hobby." },
    { id: "newspaper", title: "School Newspaper", kind: "art", minAge: 11, image: "icon_youth_newspaper", fallback: "sidehustle_author", points: { creative: 1, bookworm: 2 }, mods: [0, 2, 2],
        hobby: "writing", show: "Publish a Big Story", top: "Editor-in-Chief", blurb: "Interviews, deadlines and the scoop. Also trains your Writing hobby." },
    // brains
    { id: "chess", title: "Chess Club", kind: "brain", minAge: 6, image: "icon_youth_chess", fallback: "random", points: { brainiac: 2 }, mods: [0, 2, 3],
        hobby: "chess", show: "Play in a Tournament", top: "Club Champion", blurb: "Openings, endgames and a lot of thinking. Also trains your Chess hobby." },
    { id: "coding", title: "Coding Club", kind: "brain", minAge: 9, image: "icon_youth_coding", fallback: "possesion_computer_1", points: { brainiac: 2, bookworm: 1 }, mods: [0, 2, 2],
        show: "Enter a Hackathon", top: "Club Champion", blurb: "Games, apps and a robot that says hello." },
    { id: "robotics", title: "Science Olympiad", kind: "brain", minAge: 10, image: "icon_youth_robotics", fallback: "education_science", points: { brainiac: 2, bookworm: 1 }, mods: [0, 2, 2],
        show: "Compete at the Olympiad", top: "Gold Medalist", blurb: "Bridges, rockets and robots, against the whole state." },
    { id: "debate", title: "Debate Team", kind: "brain", minAge: 12, image: "icon_youth_debate", fallback: "work_lawyer", points: { leader: 2, brainiac: 1 }, mods: [0, 2, 1],
        show: "Argue at the Debate Final", top: "Debate Champion", blurb: "Facts, rebuttals and winning every argument at dinner." },
    // people
    { id: "scouts", title: "Scouts", kind: "social", minAge: 6, image: "icon_youth_scouts", fallback: "possesion_campingtent", points: { leader: 1, kind: 1, athlete: 1 }, mods: [1, 3, 2],
        show: "Go for a Big Badge", top: "Eagle Scout", blurb: "Campfires, knots and helping old ladies cross the street." },
    { id: "council", title: "Student Council", kind: "social", minAge: 12, image: "icon_youth_council", fallback: "work_teacher", points: { leader: 3, social: 1 }, mods: [0, 2, 0],
        show: "Run a School Event", top: "Class President", blurb: "Speeches, posters and deciding the prom theme." },
    { id: "volunteer", title: "Volunteer Club", kind: "social", minAge: 10, image: "icon_youth_volunteer", fallback: "philanthrophy_worldhunger", points: { kind: 3 }, mods: [0, 3, 3],
        show: "Lead a Charity Drive", top: "Community Hero", blurb: "Food banks, animal shelters and beach clean-ups." },
    { id: "esports", title: "Esports Club", kind: "brain", minAge: 12, image: "icon_youth_esports", fallback: "vacation_videogames", points: { brainiac: 1, social: 1 }, mods: [-1, 4, 1],
        hobby: "gaming", show: "Play at a Tournament", top: "Team Captain", blurb: "Ranked matches with your team. Also trains your Gaming hobby." },
    { id: "cooking", title: "Cooking Club", kind: "art", minAge: 9, image: "icon_youth_cooking", fallback: "skill_homechef", points: { creative: 1, kind: 1 }, mods: [1, 3, 2],
        hobby: "cooking", show: "Enter a Bake-off", top: "Junior Chef", blurb: "Cupcakes, pasta and a fire alarm or two. Also trains your Cooking hobby." },
];

// ---------------------------------------------------------------- crowds (ages 11+)
export interface CrowdDef {
    id: string; title: string; image: string; fallback: string;
    /** Reputation needed to be let in. */
    minRep: number;
    blurb: string;
    /** Hanging out: reputation, happiness, health, sanity, grades, trait points. */
    hang: { rep: number; hap: number; health?: number; san?: number; grades?: number; points: Partial<Record<TraitKey, number>> };
}
export const CROWDS: CrowdDef[] = [
    { id: "jocks", title: "The Jocks", image: "icon_crowd_jocks", fallback: "vacation_soccer", minRep: 20, blurb: "Team jackets, pep rallies and the loudest table in the cafeteria.",
        hang: { rep: 3, hap: 4, health: 1, points: { athlete: 2, social: 1 } } },
    { id: "brains", title: "The Brains", image: "icon_crowd_brains", fallback: "education_science", minRep: 0, blurb: "Study groups, robotics and arguments about science fiction.",
        hang: { rep: 2, hap: 3, san: 2, grades: 1, points: { brainiac: 2, bookworm: 1 } } },
    { id: "artsy", title: "The Artsy Kids", image: "icon_crowd_artsy", fallback: "education_art", minRep: 0, blurb: "Sketchbooks, band practice and the best playlists.",
        hang: { rep: 2, hap: 4, san: 3, points: { creative: 2, musical: 1 } } },
    { id: "popular", title: "The Popular Crowd", image: "icon_crowd_popular", fallback: "love_nightclub", minRep: 45, blurb: "Everyone knows their names. Everyone has an opinion about them.",
        hang: { rep: 5, hap: 5, san: -1, points: { social: 3 } } },
    { id: "rebels", title: "The Rebels", image: "icon_crowd_rebels", fallback: "angry", minRep: 0, blurb: "Leather jackets, back-row seats and rules that are more like suggestions.",
        hang: { rep: 3, hap: 6, grades: -1, points: { rebel: 2, troublemaker: 1 } } },
];

// ---------------------------------------------------------------- upbringing traits
export interface TraitDef {
    id: TraitKey; title: string; image: string; fallback: string;
    /** How you earn it (shown on the Yearbook). */
    how: string;
    /** A game trait that comes with it (its effect is the game's own). */
    /** A game trait that comes with it (lazy: module load order). */
    gameTrait: (() => Trait) | null;
    /** What it does, in words. */
    effect: string;
    /** A one-time gift when you earn it: health, happiness, sanity. */
    gift?: [number, number, number];
}
/** Points you need to earn a trait. */
export const TRAIT_POINTS = 40;
/** Most traits one childhood can give. */
export const MAX_TRAITS = 5;

export const UPBRINGING: TraitDef[] = [
    { id: "bookworm", title: "Bookworm", image: "icon_trait_bookworm", fallback: "education_literature", gameTrait: () => Trait.intellectualCuriosity,
        how: "Homework, cramming, reading and good report cards.", effect: "Degrees take less time (Intellectually Curious).", gift: [0, 0, 8] },
    { id: "brainiac", title: "Brainiac", image: "icon_trait_brainiac", fallback: "education_science", gameTrait: () => Trait.logical,
        how: "Chess, coding, science and hanging out with the Brains.", effect: "Science careers pay more (Logical).", gift: [0, 0, 6] },
    { id: "athlete", title: "Athlete", image: "icon_trait_athlete", fallback: "health_workout", gameTrait: () => Trait.strongImmuneSystem,
        how: "Playing sports and hanging out with the Jocks.", effect: "You catch fewer illnesses (Strong Immune System). +10 health now.", gift: [10, 0, 0] },
    { id: "creative", title: "Creative", image: "icon_trait_creative", fallback: "education_art", gameTrait: () => Trait.creative,
        how: "Art, drama, writing and the Artsy Kids.", effect: "DJs and online creators earn more (Creative).", gift: [0, 5, 3] },
    { id: "musical", title: "Musical", image: "icon_trait_musical", fallback: "education_college_music", gameTrait: () => Trait.entertainer,
        how: "Piano, guitar, choir, band and dance.", effect: "Actors earn more (Entertainer). +10 to your Celebrity Life music skill.", gift: [0, 6, 2] },
    { id: "social", title: "Social Butterfly", image: "icon_trait_social", fallback: "waving_hand", gameTrait: () => Trait.charismatic,
        how: "Hanging out with your crowd, parties and a sky-high reputation.", effect: "Business staff cost less (Charismatic). +100 with every friend now.", gift: [0, 8, 0] },
    { id: "leader", title: "Leader", image: "icon_trait_leader", fallback: "work_teacher", gameTrait: () => Trait.confident,
        how: "Student council, debate, scouts and captaining a team.", effect: "Business careers pay more (Confident).", gift: [0, 4, 4] },
    { id: "kind", title: "Kind-Hearted", image: "icon_trait_kind", fallback: "philanthrophy_worldhunger", gameTrait: () => Trait.humble,
        how: "Volunteering, standing up for others and helping out.", effect: "Promotions come faster (Humble). +100 with your family now.", gift: [0, 6, 6] },
    { id: "troublemaker", title: "Troublemaker", image: "icon_trait_troublemaker", fallback: "police_badge", gameTrait: () => Trait.cunning,
        how: "Pranks, skipping school, detentions and worse.", effect: "Crimes go better and jail escapes are easier (Cunning). +10 underworld respect.", gift: [0, 5, -2] },
    { id: "rebel", title: "Rebel", image: "icon_trait_rebel", fallback: "angry", gameTrait: () => Trait.adventurous,
        how: "Sneaking out, breaking curfew and the Rebels.", effect: "Vacations do you more good (Adventurous).", gift: [0, 8, 0] },
    { id: "resilient", title: "Resilient", image: "icon_trait_resilient", fallback: "health_meditation", gameTrait: () => Trait.evenTempered,
        how: "Getting through hard times: bullies, bad grades, losses and moves.", effect: "Your sanity stays steadier (Even Tempered).", gift: [0, 0, 10] },
    { id: "golden", title: "Golden Child", image: "icon_trait_golden", fallback: "achievement_happy", gameTrait: () => Trait.optimistic,
        how: "Chores, great report cards and keeping out of trouble.", effect: "Your happiness stays higher (Optimistic). +100 with your parents now.", gift: [0, 8, 2] },
    { id: "hardWorker", title: "Hard Worker", image: "icon_trait_hardworker", fallback: "work_burger_flipper", gameTrait: () => Trait.frugal,
        how: "Part-time jobs, chores and saving your pocket money.", effect: "Groceries cost less (Frugal), and your first job starts with experience.", gift: [2, 2, 2] },
];

// ---------------------------------------------------------------- school subjects
export interface SubjectDef { id: string; title: string; /** Lazy: module load order. */ degrees: () => CompletableAction[]; image: string; fallback: string }
export const SUBJECTS: SubjectDef[] = [
    { id: "math", title: "Math", degrees: () => [CompletableAction.college_finance, CompletableAction.college_computerScience], image: "icon_subject_math", fallback: "skill_financialliteracy" },
    { id: "science", title: "Science", degrees: () => [CompletableAction.college_science, CompletableAction.college_biology], image: "icon_subject_science", fallback: "education_science" },
    { id: "english", title: "English", degrees: () => [CompletableAction.college_literature, CompletableAction.college_philosophy], image: "icon_subject_english", fallback: "education_literature" },
    { id: "history", title: "History", degrees: () => [CompletableAction.college_philosophy, CompletableAction.college_literature], image: "icon_subject_history", fallback: "education_philosophy" },
    { id: "art", title: "Art", degrees: () => [CompletableAction.college_art], image: "icon_subject_art", fallback: "education_art" },
    { id: "music", title: "Music", degrees: () => [CompletableAction.college_music], image: "icon_subject_music", fallback: "education_college_music" },
    { id: "drama", title: "Drama", degrees: () => [CompletableAction.college_theater], image: "icon_subject_drama", fallback: "education_theater" },
    { id: "computers", title: "Computers", degrees: () => [CompletableAction.college_computerScience], image: "icon_subject_computers", fallback: "education_computer_science" },
    { id: "business", title: "Business", degrees: () => [CompletableAction.college_business, CompletableAction.college_finance], image: "icon_subject_business", fallback: "education_college_business" },
];
/** Subject points for a head start in college. */
export const SUBJECT_HEAD_START = 60;
/** The head start: this share of the degree is already done. */
export const HEAD_START_SHARE = 0.2;

// ---------------------------------------------------------------- part-time jobs (Work tab, 12–17)
export interface PartJobDef {
    id: string; title: string; minAge: number; pay: number; image: string; fallback: string;
    mods: [number, number, number];
    points: Partial<Record<TraitKey, number>>;
    /** Why you can't get it (besides age), or null. */
    needs?: (p: any, y: any) => string | null;
    blurb: string;
}
export const PART_JOBS: PartJobDef[] = [
    { id: "babysitter", title: "Babysitter", minAge: 12, pay: 40, image: "icon_pjob_babysitter", fallback: "love_baby", mods: [0, -1, -1], points: { kind: 1, hardWorker: 1 },
        blurb: "Weekend evenings with the neighbours' kids. Easy money once they're asleep." },
    { id: "lawns", title: "Lawn Mowing", minAge: 12, pay: 35, image: "icon_pjob_lawns", fallback: "business_farm_new", mods: [1, -1, 0], points: { hardWorker: 2 },
        blurb: "Every lawn on the street, every Saturday." },
    { id: "paper", title: "Paper Route", minAge: 12, pay: 30, image: "icon_pjob_paper", fallback: "sidehustle_author", mods: [1, -1, 0], points: { hardWorker: 2 },
        blurb: "Up at dawn, newspapers on porches (mostly)." },
    { id: "bagger", title: "Grocery Bagger", minAge: 14, pay: 90, image: "icon_pjob_bagger", fallback: "skill_frugalshopper", mods: [0, -1, -1], points: { hardWorker: 2 },
        blurb: "Paper or plastic? Eggs on top." },
    { id: "fastFood", title: "Fast Food Crew", minAge: 15, pay: 120, image: "icon_pjob_fastfood", fallback: "work_burger_flipper", mods: [-1, -2, -1], points: { hardWorker: 2, social: 1 },
        blurb: "Fryer duty, drive-through headset and free fries." },
    { id: "retail", title: "Store Clerk", minAge: 16, pay: 140, image: "icon_pjob_retail", fallback: "work_retail", mods: [0, -1, -2], points: { hardWorker: 2, social: 1 },
        blurb: "Folding shirts and \"can I help you find anything?\"" },
    { id: "lifeguard", title: "Lifeguard", minAge: 15, pay: 150, image: "icon_pjob_lifeguard", fallback: "vacation_spa", mods: [1, 1, -1], points: { athlete: 1, leader: 1, hardWorker: 1 },
        needs: (_p, y) => ((y.acts?.swimming?.xp ?? 0) >= 20 ? null : "Needs Swimming at Good (After-School Activities)"),
        blurb: "Whistle, sunglasses, a tall chair by the pool." },
    { id: "tutor", title: "Tutor", minAge: 15, pay: 110, image: "icon_pjob_tutor", fallback: "work_teacher", mods: [0, 0, -1], points: { bookworm: 2, kind: 1 },
        needs: (_p, y) => (y.grades >= 85 ? null : "Needs grades of B+ or better"),
        blurb: "Helping younger kids with fractions and spelling." },
];

// ---------------------------------------------------------------- the rest of Growing Up (Leisure tab), art slots
export const YOUTH_ICONS: { name: string; fallback: string; where: string; row: string }[] = [
    { name: "icon_youth_school", fallback: "education_elementaryschool", where: "Education › School Life", row: "Grades and reputation" },
    { name: "icon_youth_homework", fallback: "education_elementaryschool", where: "Education › School Life", row: "Do Your Homework" },
    { name: "icon_youth_teacher", fallback: "work_teacher", where: "Education › School Life", row: "Ask a Teacher for Help" },
    { name: "icon_youth_cram", fallback: "education_highschool", where: "Education › School Life", row: "Cram for a Big Test" },
    { name: "icon_youth_skip", fallback: "vacation_take_week_off", where: "Education › School Life", row: "Skip School" },
    { name: "icon_youth_subject", fallback: "education_literature", where: "Education › School Life", row: "Favourite Subject" },
    { name: "icon_youth_crowd", fallback: "love_go_to_local_event", where: "Education › School Life", row: "Your Crowd" },
    { name: "icon_youth_bestfriend", fallback: "waving_hand", where: "Education › School Life", row: "Best Friend" },
    { name: "icon_youth_scholarship", fallback: "education_college_business", where: "Education › Your Future", row: "Apply for Scholarships" },
    { name: "icon_youth_graduation", fallback: "education_highschool", where: "Profile › Yearbook", row: "Graduation" },
    { name: "icon_youth_yearbook", fallback: "education_literature", where: "Profile › Growing Up", row: "Yearbook" },
    { name: "icon_youth_pocket", fallback: "hud_cash", where: "Leisure › Growing Up", row: "Pocket Money" },
    { name: "icon_youth_piggy", fallback: "hud_bank", where: "Leisure › Growing Up", row: "Piggy Bank" },
    { name: "icon_youth_raise", fallback: "iap_money1", where: "Leisure › Growing Up", row: "Ask for More Pocket Money" },
    { name: "icon_youth_phone", fallback: "hud_menu_instagram", where: "Leisure › Growing Up", row: "Get a Phone" },
    { name: "icon_youth_permit", fallback: "possesion_passport", where: "Leisure › Growing Up", row: "Learner's Permit" },
    { name: "icon_youth_lessons", fallback: "possession_car", where: "Leisure › Growing Up", row: "Driving Lessons" },
    { name: "icon_youth_drivetest", fallback: "possesion_nicecar", where: "Leisure › Growing Up", row: "Driving Test" },
    { name: "icon_youth_sneak", fallback: "love_nightclub", where: "Leisure › Growing Up", row: "Sneak Out" },
    { name: "icon_youth_dance_night", fallback: "love_marry", where: "Leisure › Growing Up", row: "School Dance" },
    { name: "icon_youth_party", fallback: "childaction_grabdrinks", where: "Leisure › Growing Up", row: "Throw a Party" },
    { name: "icon_youth_prank", fallback: "random", where: "Leisure › Growing Up", row: "Prank the School" },
    { name: "icon_youth_graffiti", fallback: "icon_crime_arson", where: "Leisure › Growing Up", row: "Graffiti" },
    { name: "icon_youth_shoplift", fallback: "theft_robbank", where: "Leisure › Growing Up", row: "Shoplift" },
    { name: "icon_youth_grounded", fallback: "housing_shared_room", where: "Leisure › Growing Up", row: "Grounded" },
    { name: "icon_star_audition", fallback: "sidehustle_actor", where: "Lifepaths › Celebrity Life (under 14)", row: "Audition for a Commercial" },
    { name: "icon_star_model", fallback: "head_female_2", where: "Lifepaths › Celebrity Life (under 14)", row: "Kids' Modelling Shoot" },
    { name: "icon_star_tv", fallback: "love_movie", where: "Lifepaths › Celebrity Life (under 14)", row: "Kids' TV Show" },
    { name: "icon_star_agent", fallback: "menu_badge", where: "Lifepaths › Celebrity Life (under 14)", row: "Child Talent Agent" },
    { name: "icon_star_break", fallback: "vacation_take_week_off", where: "Lifepaths › Celebrity Life (under 14)", row: "Take a Break from Fame" },
    { name: "icon_parent_game", fallback: "vacation_soccer", where: "Love › your child", row: "Go to Their Game or Recital" },
    { name: "icon_parent_rules", fallback: "skill_timemanagement", where: "Love › your child", row: "House Rules" },
];
