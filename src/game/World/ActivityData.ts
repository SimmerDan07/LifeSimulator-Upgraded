// v0.27.0 "The World Update": 110 new things to do in the Leisure tab (pure data; rules in Activities.ts).
//
// - 73 everyday activities in 8 groups (Leisure tab › Things to Do › a group screen).
// - 37 local favourites: one for every country, only available while you live there (Leisure tab › Local Favourites).
// Every activity becomes a real `Leisure` value, so it takes the week, costs money, changes health/happiness/sanity
// and can trigger the usual random events like the original leisure options.
//
// Fields: cost in dollars; mods [health, happiness, sanity]; minAge; `drink` (legal drinking age instead);
// `outdoor` (daytime, so sunlight hurts vampires); `night` (vampire-friendly); `seasons` (weather) or `months`
// (calendar months 0–11, for festivals); `family` (under 18 your parents pay); `item` (Possession name);
// `effect` (a special effect in Activities.ts).

export type ActivityCategory = "outdoors" | "sports" | "culture" | "nightlife" | "wellness" | "fun" | "food" | "giving";
export interface ActivityDef {
    id: string; title: string; cat: ActivityCategory | "local"; image: string; fallback: string;
    cost: number; mods: [number, number, number]; minAge: number; blurb: string;
    drink?: boolean; outdoor?: boolean; night?: boolean; family?: boolean;
    seasons?: ("winter" | "spring" | "summer" | "fall")[]; months?: number[];
    country?: string; item?: string; effect?: string; notIn?: string[]; snow?: boolean;
}
export const ACTIVITY_CATEGORIES: { id: ActivityCategory; title: string; image: string; fallback?: string; blurb: string }[] = [
    { id: "outdoors", title: "Outdoors & Adventure", image: "icon_actcat_outdoors", blurb: "Hike, climb, dive and jump out of planes." },
    { id: "sports", title: "Sports & Fitness", image: "icon_actcat_sports", fallback: "health_workout", blurb: "Get moving: courts, lanes, pools and dojos." },
    { id: "culture", title: "Arts & Culture", image: "icon_actcat_culture", blurb: "Museums, theatres, comedy and books." },
    { id: "nightlife", title: "Nightlife & Social", image: "icon_actcat_nightlife", blurb: "Clubs, karaoke, parties and casinos." },
    { id: "wellness", title: "Relax & Wellness", image: "icon_actcat_wellness", blurb: "Massages, saunas, stars and silence." },
    { id: "fun", title: "Games & Fun", image: "icon_actcat_fun", fallback: "childaction_themepark", blurb: "Escape rooms, arcades and theme parks." },
    { id: "food", title: "Food & Shopping", image: "icon_actcat_food", blurb: "Festivals, cooking classes and shopping sprees." },
    { id: "giving", title: "Giving Back", image: "icon_actcat_giving", blurb: "Volunteer, donate and help out." },
];

const A = (id: string, title: string, cat: ActivityCategory | "local", fallback: string, cost: number, mods: [number, number, number], minAge: number, blurb: string, extra: Partial<ActivityDef> = {}): ActivityDef =>
    // (a festival's month is shown by its "Only in …" note, so a "(February)" in the blurb would say it twice)
    ({ id, title, cat, image: "act_" + id.toLowerCase(), fallback, cost, mods, minAge, blurb: extra.months ? blurb.replace(/\s*\([^)]*\)\.$/, ".") : blurb, ...extra });
const WARM: ActivityDef["seasons"] = ["spring", "summer", "fall"];

export const ACTIVITY_DEFS: ActivityDef[] = [
    // ------------------------------------------------------------------ Outdoors & Adventure
    A("hiking", "Go Hiking", "outdoors", "vacation_park", 0, [3, 6, 8], 8, "Trail mix, blisters and a great view.", { outdoor: true, family: true }),
    A("rockClimbing", "Go Rock Climbing", "outdoors", "vacation_camping", 80, [4, 10, 6], 12, "Hold on tight.", { outdoor: true, family: true, effect: "risky" }),
    A("fishing", "Go Fishing", "outdoors", "vacation_camping", 40, [0, 8, 12], 6, "Mostly sitting. Sometimes fish.", { outdoor: true, family: true, effect: "fishing" }),
    A("kayaking", "Go Kayaking", "outdoors", "vacation_local", 120, [3, 12, 8], 10, "Paddle down the river.", { outdoor: true, family: true, seasons: WARM }),
    A("surfing", "Go Surfing", "outdoors", "vacation_luxury", 150, [3, 14, 6], 12, "Catch a wave (or a mouthful of sea).", { outdoor: true, seasons: ["spring", "summer"] }),
    A("skydiving", "Go Skydiving", "outdoors", "possession_jet", 3000, [0, 30, 10], 18, "Jump out of a perfectly good plane.", { outdoor: true, effect: "risky" }),
    A("bungee", "Go Bungee Jumping", "outdoors", "vacation_international", 1500, [0, 25, 5], 16, "Scream all the way down.", { outdoor: true, effect: "risky" }),
    A("hotAirBalloon", "Hot Air Balloon Ride", "outdoors", "vacation_luxury", 2500, [0, 22, 18], 10, "Float above it all at sunrise.", { outdoor: true }),
    A("scubaDiving", "Go Scuba Diving", "outdoors", "diet_seafood", 1200, [2, 20, 15], 12, "Coral reefs and curious fish.", { outdoor: true }),
    A("horseRiding", "Go Horseback Riding", "outdoors", "vacation_park", 200, [3, 12, 10], 6, "Saddle up.", { outdoor: true, family: true }),

    // ------------------------------------------------------------------ Sports & Fitness
    A("basketball", "Play Pickup Basketball", "sports", "vacation_badminton", 0, [4, 8, 4], 8, "Shirts versus skins at the park.", { outdoor: true, family: true }),
    A("tennis", "Play Tennis", "sports", "vacation_badminton", 60, [4, 8, 5], 8, "Love means nothing.", { outdoor: true, family: true }),
    A("bowling", "Go Bowling", "sports", "vacation_videogames", 50, [1, 10, 6], 6, "Strikes, gutters and funny shoes.", { night: true, family: true }),
    A("golf", "Play a Round of Golf", "sports", "vacation_park", 300, [2, 10, 10], 10, "Bring your boss: a round can help your career.", { outdoor: true, effect: "golf" }),
    A("yoga", "Take a Yoga Class", "sports", "health_meditation", 40, [3, 4, 12], 10, "Downward dog, upward mood.", { family: true }),
    A("martialArts", "Martial Arts Class", "sports", "health_workout", 80, [4, 6, 6], 6, "Every class makes you better in a fight (prison riots, gang fights, vampire hunters).", { family: true, effect: "martial" }),
    A("swimming", "Go Swimming", "sports", "vacation_luxury", 20, [5, 6, 6], 4, "Laps at the indoor pool.", { family: true }),
    A("goKarting", "Go-Karting", "sports", "possession_car", 100, [0, 14, 4], 10, "Pretend you're a racing driver.", { family: true }),
    A("soccerMatch", "Play a Soccer Match", "sports", "vacation_soccer", 0, [4, 9, 4], 6, "Jumpers for goalposts.", { outdoor: true, family: true }),
    A("iceSkatingRink", "Indoor Ice Skating", "sports", "vacation_ski", 30, [2, 10, 6], 5, "Round and round the rink, all year.", { family: true }),

    // ------------------------------------------------------------------ Arts & Culture
    A("museum", "Visit a Museum", "culture", "love_museum", 25, [0, 6, 10], 6, "Dinosaurs, mummies and gift shops.", { family: true }),
    A("artGallery", "Visit an Art Gallery", "culture", "education_art", 0, [0, 6, 9], 10, "Nod thoughtfully at paintings.", { family: true }),
    A("theater", "See a Play", "culture", "vacation_opera", 120, [0, 12, 10], 8, "Lights down, curtain up.", { night: true, family: true }),
    A("movies", "Go to the Movies", "culture", "love_movie", 30, [0, 10, 6], 4, "Popcorn and a blockbuster.", { night: true, family: true }),
    A("comedyClub", "Comedy Club Night", "culture", "love_play", 60, [0, 15, 8], 18, "Laugh until it hurts.", { night: true }),
    A("ballet", "Watch the Ballet", "culture", "vacation_flamingo", 150, [0, 12, 12], 8, "Grace, tutus and big leaps.", { night: true, family: true }),
    A("library", "Spend a Day at the Library", "culture", "education_literature", 0, [0, 4, 10], 6, "Quiet, books and free Wi-Fi. Practises Writing.", { family: true, effect: "library" }),
    A("historicTour", "Historic Walking Tour", "culture", "work_tourguide", 40, [1, 8, 8], 8, "Learn the stories behind the streets.", { outdoor: true, family: true }),
    A("symphony", "Go to the Symphony", "culture", "vacation_opera", 120, [0, 12, 14], 8, "A hundred musicians, no talking.", { night: true, family: true }),
    A("poetrySlam", "Poetry Slam", "culture", "will", 10, [0, 9, 10], 13, "Snap your fingers. Or get up and read.", { night: true }),

    // ------------------------------------------------------------------ Nightlife & Social
    A("clubbing", "Go Clubbing", "nightlife", "love_nightclub", 100, [-2, 18, 4], 0, "Dance until 4 a.m. You might meet someone.", { drink: true, night: true, effect: "meet" }),
    A("karaoke", "Karaoke Night", "nightlife", "possession_turntable_1", 60, [0, 16, 6], 13, "Belt out a power ballad. Trains Music.", { night: true, effect: "karaoke" }),
    A("houseParty", "Throw a House Party", "nightlife", "childaction_grabdrinks", 500, [-1, 18, 4], 16, "Invite everyone. Make new friends.", { night: true, effect: "party" }),
    A("triviaNight", "Trivia Night", "nightlife", "loupe_icon", 30, [0, 10, 8], 0, "A degree helps you win the bar tab.", { drink: true, night: true, effect: "trivia" }),
    A("speedDating", "Speed Dating", "nightlife", "love_tinder_date", 50, [0, 8, 2], 18, "Twenty dates in an hour. Singles only.", { night: true, effect: "speedDating" }),
    A("casino", "Go to a Casino", "nightlife", "bank_lottery", 500, [0, 10, -2], 21, "Bet $500 on red… or black.", { night: true, effect: "casino", notIn: ["uae", "japan", "thailand", "indonesia", "vietnam", "india", "china"] }),
    A("wineTasting", "Wine Tasting", "nightlife", "work_sommelier", 150, [0, 12, 10], 0, "Swirl, sniff, sip, pretend.", { drink: true }),
    A("rooftopBar", "Rooftop Bar Night", "nightlife", "vacation_drinks", 120, [0, 14, 8], 0, "Cocktails above the city lights.", { drink: true, night: true }),
    A("boardGameNight", "Host a Board Game Night", "nightlife", "childaction_movienight", 40, [0, 10, 8], 8, "Friends, snacks and a very long game of Monopoly.", { family: true, effect: "friends" }),
    A("barbecue", "Have a Barbecue", "nightlife", "diet_basic", 80, [0, 10, 8], 0, "Burgers for the whole family.", { outdoor: true, family: true, seasons: WARM, effect: "family" }),

    // ------------------------------------------------------------------ Relax & Wellness
    A("massage", "Get a Massage", "wellness", "vacation_spa", 120, [3, 8, 14], 16, "Knots, meet thumbs."),
    A("meditationRetreat", "Meditation Retreat", "wellness", "health_meditation", 600, [2, 10, 30], 16, "A silent week in the mountains."),
    A("sauna", "Sit in a Sauna", "wellness", "vacation_spa", 30, [2, 5, 10], 12, "Sweat it out."),
    A("stargazing", "Go Stargazing", "wellness", "love_romantic_dinner", 0, [0, 8, 14], 6, "Lie on the grass and look up.", { night: true, family: true }),
    A("cafeReading", "Read in a Café", "wellness", "work_barista", 15, [0, 6, 10], 10, "Coffee, a book and nowhere to be.", { family: true }),
    A("botanicalGarden", "Walk in a Botanical Garden", "wellness", "vacation_park", 15, [2, 6, 10], 4, "Flowers from all over the world.", { outdoor: true, family: true }),
    A("hotSprings", "Soak in Hot Springs", "wellness", "vacation_spa", 200, [4, 10, 15], 6, "Natural hot water. Very relaxing.", { family: true }),
    A("salonDay", "Pamper Day at the Salon", "wellness", "skill_hygieneexpert", 250, [2, 12, 12], 13, "Haircut, nails and a face mask."),
    A("napDay", "Have a Lazy Pajama Day", "wellness", "vacation_take_week_off", 0, [1, 6, 8], 4, "Blankets, snacks, no plans.", { family: true }),

    // ------------------------------------------------------------------ Games & Fun
    A("escapeRoom", "Escape Room", "fun", "loupe_icon", 80, [0, 14, 4], 10, "Sixty minutes to find the key.", { family: true }),
    A("arcade", "Go to the Arcade", "fun", "vacation_videogames", 30, [0, 10, 4], 6, "Tokens, tickets and a tiny prize.", { family: true }),
    A("laserTag", "Laser Tag", "fun", "possession_gun", 40, [2, 12, 4], 8, "Pew pew.", { family: true }),
    A("boardGameCafe", "Board Game Café", "fun", "childaction_movienight", 25, [0, 9, 7], 8, "Hundreds of games on the shelves.", { family: true }),
    A("themePark", "Theme Park Day", "fun", "childaction_themepark", 250, [0, 25, 5], 4, "Roller coasters and churros.", { outdoor: true, family: true }),
    A("zoo", "Visit the Zoo", "fun", "pet_turkey", 40, [1, 10, 8], 2, "Lions, penguins and a petting zoo.", { outdoor: true, family: true, effect: "animals" }),
    A("aquarium", "Visit the Aquarium", "fun", "pet_fish", 40, [0, 10, 10], 2, "Sharks overhead in the glass tunnel.", { family: true, effect: "animals" }),
    A("miniGolf", "Mini Golf", "fun", "vacation_park", 20, [1, 8, 5], 4, "Through the windmill.", { outdoor: true, family: true }),
    A("paintball", "Paintball", "fun", "possession_gun", 100, [2, 14, 2], 12, "It stings. Worth it.", { outdoor: true, family: true }),
    A("vrArcade", "Virtual Reality Arcade", "fun", "possession_computer_3", 60, [0, 12, 4], 10, "Fight robots without leaving the room.", { family: true }),
    A("trampolinePark", "Trampoline Park", "fun", "childaction_playground", 30, [2, 12, 4], 4, "Bounce off the walls. Literally.", { family: true }),

    // ------------------------------------------------------------------ Food & Shopping
    A("foodFestival", "Food Festival", "food", "diet_paella", 60, [0, 12, 6], 4, "Fifty stalls, one stomach.", { outdoor: true, family: true, seasons: WARM }),
    A("cookingClass", "Cooking Class", "food", "skill_homechef", 120, [1, 8, 8], 10, "Learn from a chef. Trains Cooking.", { family: true, effect: "cooking" }),
    A("farmersMarket", "Farmers' Market", "food", "business_farm1", 30, [2, 6, 8], 4, "Fresh veg and free samples.", { outdoor: true, family: true }),
    A("fineDining", "Fine Dining", "food", "love_romantic_dinner", 400, [0, 18, 10], 10, "Tiny portions, big prices, amazing food.", { family: true }),
    A("shoppingSpree", "Go on a Shopping Spree", "food", "hud_cash", 1500, [0, 20, 4], 13, "Bags and bags of new stuff."),
    A("thrifting", "Go Thrift Shopping", "food", "skill_frugalshopper", 40, [0, 9, 6], 10, "One person's junk…", { family: true }),
    A("foodTruckCrawl", "Food Truck Crawl", "food", "diet_fastfood", 50, [-1, 12, 6], 10, "Tacos, then dumplings, then waffles.", { outdoor: true, family: true }),
    A("bakeSale", "Bake for the Neighbours", "food", "work_pastrychef", 30, [0, 8, 8], 8, "Cookies make friends.", { family: true, effect: "friends" }),

    // ------------------------------------------------------------------ Giving Back
    A("animalShelter", "Volunteer at an Animal Shelter", "giving", "pet_adopt", 0, [0, 10, 8], 10, "Walk dogs, cuddle cats.", { family: true, effect: "animals" }),
    A("soupKitchen", "Serve at a Soup Kitchen", "giving", "diet_basic", 0, [0, 8, 10], 12, "Feed people who need it. Good for your reputation.", { family: true, effect: "goodDeed" }),
    A("beachCleanup", "Beach Cleanup", "giving", "vacation_luxury", 0, [2, 8, 8], 8, "Bags of plastic, one clean beach.", { outdoor: true, family: true, effect: "goodDeed" }),
    A("bloodDrive", "Donate Blood", "giving", "vdiet_bloodbag", 0, [-3, 8, 6], 17, "One pint can save three lives.", { effect: "blood" }),
    A("tutorKids", "Tutor Kids", "giving", "work_teacher", 0, [0, 6, 6], 16, "Help with homework. Teachers' careers move faster.", { family: true, effect: "tutor" }),
    A("plantTrees", "Plant Trees", "giving", "philanthrophy_energy", 0, [2, 8, 10], 8, "Dig, plant, water.", { outdoor: true, family: true, seasons: ["spring", "fall"], effect: "goodDeed" }),
    A("charityRun", "Charity Fun Run", "giving", "health_workout", 30, [5, 10, 6], 8, "Run 5K for a good cause. Trains Running.", { outdoor: true, family: true, effect: "run" }),
    A("retirementHome", "Visit a Retirement Home", "giving", "family", 0, [0, 8, 8], 8, "Bingo and old stories.", { family: true, effect: "goodDeed" }),

    // ------------------------------------------------------------------ local favourites (one per country)
    A("routeSixtySix", "Road Trip on Route 66", "local", "possession_car", 1500, [0, 30, 20], 16, "Diners, motels and the open road.", { country: "unitedStates", outdoor: true }),
    A("mapleFestival", "Maple Syrup Festival", "local", "diet_maplepancakes", 40, [0, 12, 8], 4, "Sugar season in the forest.", { country: "canada", months: [2, 3], family: true }),
    A("onsenRetreat", "Onsen Retreat", "local", "vacation_spa", 300, [5, 12, 20], 6, "Hot spring baths in the mountains.", { country: "japan", family: true }),
    A("bordeauxWine", "Wine Tour in Bordeaux", "local", "work_sommelier", 400, [0, 20, 14], 0, "Chateaux and vineyards.", { country: "france", drink: true }),
    A("tomatina", "La Tomatina Festival", "local", "diet_paella", 100, [0, 25, 5], 10, "The world's biggest tomato fight (last Wednesday of August).", { country: "spain", months: [7], outdoor: true }),
    A("afternoonTea", "Afternoon Tea", "local", "diet_balanced", 60, [0, 10, 10], 6, "Scones, clotted cream, pinkies out.", { country: "uk", family: true }),
    A("greatWall", "Hike the Great Wall", "local", "vacation_international", 100, [4, 16, 12], 8, "Thousands of steps of history.", { country: "china", outdoor: true, family: true }),
    A("oktoberfest", "Oktoberfest", "local", "vacation_pub", 200, [-2, 25, 8], 0, "Beer tents, pretzels and lederhosen (Sept–Oct).", { country: "germany", drink: true, months: [8, 9] }),
    A("gondolaRide", "Gondola Ride in Venice", "local", "possession_yacht", 150, [0, 16, 14], 6, "Glide down the canals.", { country: "italy", outdoor: true, family: true }),
    A("fadoNight", "Fado Night in Lisbon", "local", "vacation_opera", 60, [0, 12, 14], 10, "Heartbreak songs in a candlelit tavern.", { country: "portugal", night: true }),
    A("rioCarnival", "Rio Carnival", "local", "vacation_flamingo", 300, [-1, 35, 8], 10, "Samba, feathers and a million people (February).", { country: "brazil", months: [1] }),
    A("dayOfTheDead", "Day of the Dead Festival", "local", "skull", 40, [0, 14, 16], 4, "Marigolds and memories (Oct–Nov).", { country: "mexico", months: [9, 10], night: true, family: true, effect: "remember" }),
    A("tangoLesson", "Take a Tango Lesson", "local", "vacation_flamingo", 80, [2, 14, 8], 12, "It takes two.", { country: "argentina", night: true }),
    A("bolshoiBallet", "Ballet at the Bolshoi", "local", "vacation_opera", 250, [0, 18, 14], 8, "World-famous dancers in Moscow.", { country: "russia", night: true, family: true }),
    A("kpopConcert", "K-Pop Concert", "local", "vacation_jpopconcert", 1200, [0, 30, 15], 10, "Lightsticks up.", { country: "southKorea", night: true, family: true }),
    A("holiFestival", "Holi Festival of Colours", "local", "education_art", 20, [0, 25, 10], 4, "Throw coloured powder at everyone (March).", { country: "india", months: [2], outdoor: true, family: true }),
    A("bondiSurf", "Surf at Bondi Beach", "local", "vacation_luxury", 100, [3, 18, 10], 12, "Australia's most famous waves.", { country: "australia", outdoor: true, seasons: ["spring", "summer", "fall"] }),
    A("volcanoHike", "Hike a Volcano Trail", "local", "vacation_camping", 50, [5, 14, 12], 10, "Steaming craters and emerald lakes.", { country: "newZealand", outdoor: true }),
    A("tradSession", "Trad Music Session at the Pub", "local", "vacation_pub", 40, [0, 14, 10], 0, "Fiddles, pints and singing along.", { country: "ireland", drink: true, night: true }),
    A("tulipCycle", "Cycle the Tulip Fields", "local", "vacation_park", 30, [4, 12, 12], 6, "Stripes of colour to the horizon (April–May).", { country: "netherlands", outdoor: true, months: [3, 4], family: true }),
    A("midsummer", "Midsummer Festival", "local", "vacation_park", 50, [0, 22, 12], 4, "Maypoles, flower crowns and the sun that never sets (June).", { country: "sweden", outdoor: true, months: [5], family: true }),
    A("northernLights", "Northern Lights Tour", "local", "love_romantic_dinner", 400, [0, 20, 25], 6, "Green curtains across the night sky (winter).", { country: "norway", night: true, seasons: ["winter", "fall"], family: true }),
    A("tivoli", "Day at Tivoli Gardens", "local", "childaction_themepark", 120, [0, 20, 8], 4, "One of the oldest amusement parks in the world.", { country: "denmark", outdoor: true, family: true }),
    A("iceSwim", "Sauna and Ice Swim", "local", "vacation_spa", 40, [5, 10, 14], 12, "Hot, then very, very cold (winter).", { country: "finland", seasons: ["winter"] }),
    A("krakowOldTown", "Explore Kraków's Old Town", "local", "work_tourguide", 30, [1, 10, 10], 6, "Castles, cellars and dragons.", { country: "poland", outdoor: true, family: true }),
    A("santoriniSunset", "Sunset in Santorini", "local", "vacation_luxury", 600, [0, 22, 18], 10, "The most photographed sunset on Earth.", { country: "greece", outdoor: true }),
    A("hammam", "Turkish Bath (Hammam)", "local", "vacation_spa", 80, [4, 10, 16], 12, "Steam, marble and a vigorous scrub.", { country: "turkey" }),
    A("pyramids", "See the Pyramids", "local", "vacation_international", 150, [0, 20, 12], 6, "4,500 years old and still standing.", { country: "egypt", outdoor: true, family: true }),
    A("deadSea", "Float in the Dead Sea", "local", "vacation_spa", 100, [4, 14, 14], 8, "So salty you can't sink.", { country: "israel", outdoor: true, family: true }),
    A("desertSafari", "Desert Safari", "local", "possession_car", 300, [0, 22, 10], 8, "Dune bashing, camels and a desert barbecue.", { country: "uae", outdoor: true, family: true }),
    A("muayThaiNight", "Muay Thai Fight Night", "local", "health_workout", 80, [0, 20, 4], 13, "The loudest crowd in Bangkok.", { country: "thailand", night: true }),
    A("halongCruise", "Ha Long Bay Cruise", "local", "possession_yacht", 500, [0, 22, 18], 6, "Thousands of limestone islands.", { country: "vietnam", outdoor: true, family: true }),
    A("baliTemples", "Bali Temple Tour", "local", "vacation_international", 80, [1, 14, 16], 6, "Clifftop temples and rice terraces.", { country: "indonesia", outdoor: true, family: true }),
    A("palawanIslands", "Island Hopping in Palawan", "local", "possession_yacht", 300, [2, 22, 15], 8, "Lagoons, cliffs and white sand.", { country: "philippines", outdoor: true, family: true }),
    A("safari", "Go on Safari", "local", "pet_cat", 1500, [0, 30, 20], 6, "Lions, elephants and the great migration.", { country: "kenya", outdoor: true, family: true, effect: "animals" }),
    A("sharkCage", "Shark Cage Diving", "local", "diet_seafood", 400, [0, 24, 0], 14, "Face to face with a great white.", { country: "southAfrica", outdoor: true }),
    A("blueLagoon", "Soak in the Blue Lagoon", "local", "vacation_spa", 300, [5, 16, 20], 6, "Milky blue water in a lava field.", { country: "iceland", family: true }),
];
export const ACTIVITY_BY_ID: Record<string, ActivityDef> = Object.fromEntries(ACTIVITY_DEFS.map((a) => [a.id, a]));
