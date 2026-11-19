// v0.27.0 "The World Update": data for every country, language and currency (pure data, no game imports).
//
// - 37 countries: the original 7 plus 30 new ones. New countries become real `Country` values (Enums/Country.ts),
//   with a "Move to …" `Leisure` value each, and appear in the new-game country picker.
// - 35 languages: the original 4 plus 31 new ones (English is now a language too, for people born elsewhere).
//   Everyone speaks their birth country's language natively.
// - Climate: `south` flips the seasons (December is summer in Australia); tropical and desert countries have no snow
//   and no gloomy winter; cold countries have long, dark winters.
// - `justice` scales prison sentences (lenient Nordic courts, strict courts elsewhere).

export type Region = "americas" | "europe" | "asia" | "africa";
export type Climate = "temperate" | "cold" | "tropical" | "desert";

export interface CountryDef {
    id: string;
    name: string;
    original?: boolean;       // one of the 7 countries from the original game (its enum switches stay as they were)
    region: Region;
    lang: string | null;      // CompletableAction name of the language you need (null = English)
    currency: string;         // Currency enum name
    drink: number;            // legal drinking age
    climate: Climate;
    south?: boolean;          // southern hemisphere: seasons are flipped
    ski?: boolean;            // ski resorts (the Go Skiing leisure)
    diets: string[];          // Diet enum names (localCuisine shows `dish`)
    dish: string;             // the local cuisine
    jobs: string[];           // Job names: local entry-level jobs
    local: string[];          // activity ids only found here (Leisure tab › Local Favourites)
    cities: string[];
    value: number;            // property prices (1 = US)
    tax: number;              // property tax
    street: "us" | "eu" | "jp";
    justice: number;          // prison sentence multiplier
    blurb: string;
}

const T = "temperate", C = "cold", TR = "tropical", D = "desert";

export const COUNTRY_DEFS: CountryDef[] = [
    // ------------------------------------------------------------------ the original seven
    { id: "unitedStates", name: "United States", original: true, region: "americas", lang: null, currency: "dollar", drink: 21, climate: T, diets: [], dish: "", jobs: ["burgerFlipper"], local: ["routeSixtySix"], cities: [], value: 1, tax: 0.011, street: "us", justice: 1.2, blurb: "The land of opportunity and very big portions." },
    { id: "canada", name: "Canada", original: true, region: "americas", lang: null, currency: "dollar", drink: 18, climate: C, ski: true, diets: [], dish: "", jobs: ["barista"], local: ["mapleFestival"], cities: [], value: 0.95, tax: 0.01, street: "us", justice: 0.9, blurb: "Hockey, maple syrup and apologising." },
    { id: "japan", name: "Japan", original: true, region: "asia", lang: "japanese", currency: "yen", drink: 20, climate: T, diets: [], dish: "", jobs: ["sushiChef"], local: ["onsenRetreat"], cities: [], value: 1.15, tax: 0.014, street: "jp", justice: 1.1, blurb: "Bullet trains, temples and the best convenience stores on Earth." },
    { id: "france", name: "France", original: true, region: "europe", lang: "french", currency: "euro", drink: 18, climate: T, diets: [], dish: "", jobs: ["pastryChef", "tourGuide"], local: ["bordeauxWine"], cities: [], value: 1.1, tax: 0.008, street: "eu", justice: 0.9, blurb: "Wine, cheese and long lunches." },
    { id: "spain", name: "Spain", original: true, region: "europe", lang: "spanish", currency: "euro", drink: 16, climate: T, diets: [], dish: "", jobs: ["sommelier", "tourGuide"], local: ["tomatina"], cities: [], value: 0.85, tax: 0.006, street: "eu", justice: 0.9, blurb: "Late dinners, siestas and fiestas." },
    { id: "uk", name: "United Kingdom", original: true, region: "europe", lang: null, currency: "pound", drink: 18, climate: T, diets: [], dish: "", jobs: ["royalGuard"], local: ["afternoonTea"], cities: [], value: 1.2, tax: 0.005, street: "us", justice: 1, blurb: "Tea, queues and talking about the weather." },
    { id: "china", name: "China", original: true, region: "asia", lang: "chinese", currency: "yuan", drink: 18, climate: T, diets: [], dish: "", jobs: ["constructionWorker"], local: ["greatWall"], cities: [], value: 0.9, tax: 0.003, street: "us", justice: 1.4, blurb: "Ancient history and futuristic cities." },

    // ------------------------------------------------------------------ Europe
    { id: "germany", name: "Germany", region: "europe", lang: "german", currency: "euro", drink: 16, climate: T, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced", "vegan"], dish: "German Cooking (bratwurst, pretzels, schnitzel)", jobs: ["constructionWorker", "barista"], local: ["oktoberfest"], cities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"], value: 1.05, tax: 0.005, street: "eu", justice: 0.9, blurb: "Castles, autobahns and very punctual trains." },
    { id: "italy", name: "Italy", region: "europe", lang: "italian", currency: "euro", drink: 18, climate: T, ski: true, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood", "vegan"], dish: "Italian Cooking (pasta, pizza, gelato)", jobs: ["sommelier", "tourGuide", "pastryChef"], local: ["gondolaRide"], cities: ["Rome", "Milan", "Florence", "Naples", "Venice"], value: 1.0, tax: 0.008, street: "eu", justice: 1, blurb: "Art, history and the best food in the world (says every Italian)." },
    { id: "portugal", name: "Portugal", region: "europe", lang: "portuguese", currency: "euro", drink: 18, climate: T, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood"], dish: "Portuguese Cooking (custard tarts, grilled sardines)", jobs: ["tourGuide", "sommelier"], local: ["fadoNight"], cities: ["Lisbon", "Porto", "Faro", "Coimbra", "Braga"], value: 0.8, tax: 0.004, street: "eu", justice: 0.8, blurb: "Sunny coasts, tiled streets and soulful music." },
    { id: "ireland", name: "Ireland", region: "europe", lang: null, currency: "euro", drink: 18, climate: T, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced"], dish: "Irish Cooking (stew, soda bread)", jobs: ["barista", "tourGuide"], local: ["tradSession"], cities: ["Dublin", "Cork", "Galway", "Limerick", "Kilkenny"], value: 1.1, tax: 0.003, street: "us", justice: 0.9, blurb: "Green hills, friendly pubs and a lot of rain." },
    { id: "netherlands", name: "Netherlands", region: "europe", lang: "dutch", currency: "euro", drink: 18, climate: T, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced", "vegan"], dish: "Dutch Cooking (stroopwafels, bitterballen)", jobs: ["barista", "constructionWorker"], local: ["tulipCycle"], cities: ["Amsterdam", "Rotterdam", "Utrecht", "The Hague", "Eindhoven"], value: 1.1, tax: 0.006, street: "eu", justice: 0.7, blurb: "Bikes, canals and fields of tulips." },
    { id: "sweden", name: "Sweden", region: "europe", lang: "swedish", currency: "sek", drink: 18, climate: C, ski: true, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood", "vegan"], dish: "Swedish Cooking (meatballs, cinnamon buns)", jobs: ["barista"], local: ["midsummer"], cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Kiruna"], value: 1.0, tax: 0.007, street: "eu", justice: 0.6, blurb: "Flat-pack furniture, fika and long summer nights." },
    { id: "norway", name: "Norway", region: "europe", lang: "norwegian", currency: "nok", drink: 18, climate: C, ski: true, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood"], dish: "Norwegian Cooking (salmon, brown cheese)", jobs: ["barista"], local: ["northernLights"], cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø"], value: 1.2, tax: 0.004, street: "eu", justice: 0.6, blurb: "Fjords, northern lights and very good salaries." },
    { id: "denmark", name: "Denmark", region: "europe", lang: "danish", currency: "dkk", drink: 18, climate: C, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood", "vegan"], dish: "Danish Cooking (open sandwiches, pastries)", jobs: ["barista", "pastryChef"], local: ["tivoli"], cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg"], value: 1.05, tax: 0.008, street: "eu", justice: 0.6, blurb: "Hygge, bicycles and the happiest people in the world." },
    { id: "finland", name: "Finland", region: "europe", lang: "finnish", currency: "euro", drink: 18, climate: C, ski: true, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood"], dish: "Finnish Cooking (rye bread, salmon soup)", jobs: ["constructionWorker"], local: ["iceSwim"], cities: ["Helsinki", "Tampere", "Turku", "Oulu", "Rovaniemi"], value: 0.9, tax: 0.008, street: "eu", justice: 0.6, blurb: "Saunas, lakes and a million summer cottages." },
    { id: "poland", name: "Poland", region: "europe", lang: "polish", currency: "pln", drink: 18, climate: C, ski: true, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced"], dish: "Polish Cooking (pierogi, borscht)", jobs: ["constructionWorker"], local: ["krakowOldTown"], cities: ["Warsaw", "Kraków", "Gdańsk", "Wrocław", "Poznań"], value: 0.65, tax: 0.003, street: "eu", justice: 1, blurb: "Medieval towns, mountains and dumplings." },
    { id: "greece", name: "Greece", region: "europe", lang: "greek", currency: "euro", drink: 18, climate: T, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood"], dish: "Greek Cooking (souvlaki, feta, olives)", jobs: ["tourGuide", "sommelier"], local: ["santoriniSunset"], cities: ["Athens", "Thessaloniki", "Heraklion", "Patras", "Rhodes"], value: 0.75, tax: 0.003, street: "eu", justice: 1, blurb: "Islands, ruins and blue-and-white villages." },
    { id: "russia", name: "Russia", region: "europe", lang: "russian", currency: "rub", drink: 18, climate: C, ski: true, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced"], dish: "Russian Cooking (borscht, blini, dumplings)", jobs: ["constructionWorker"], local: ["bolshoiBallet"], cities: ["Moscow", "St Petersburg", "Kazan", "Sochi", "Novosibirsk"], value: 0.6, tax: 0.002, street: "eu", justice: 1.5, blurb: "The biggest country on Earth, with winters to match." },
    { id: "iceland", name: "Iceland", region: "europe", lang: "icelandic", currency: "isk", drink: 20, climate: C, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood"], dish: "Icelandic Cooking (lamb soup, skyr)", jobs: ["tourGuide"], local: ["blueLagoon"], cities: ["Reykjavík", "Akureyri", "Selfoss", "Húsavík", "Vík"], value: 1.15, tax: 0.004, street: "eu", justice: 0.6, blurb: "Volcanoes, glaciers and hot springs everywhere." },
    { id: "turkey", name: "Turkey", region: "europe", lang: "turkish", currency: "try", drink: 18, climate: T, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced", "seafood"], dish: "Turkish Cooking (kebabs, baklava)", jobs: ["tourGuide", "constructionWorker"], local: ["hammam"], cities: ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa"], value: 0.55, tax: 0.002, street: "eu", justice: 1.3, blurb: "Where Europe meets Asia, with bazaars to prove it." },

    // ------------------------------------------------------------------ the Americas
    { id: "mexico", name: "Mexico", region: "americas", lang: "spanish", currency: "mxn", drink: 18, climate: D, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced"], dish: "Mexican Cooking (tacos, mole, tamales)", jobs: ["tourGuide", "constructionWorker"], local: ["dayOfTheDead"], cities: ["Mexico City", "Guadalajara", "Monterrey", "Cancún", "Oaxaca"], value: 0.5, tax: 0.002, street: "us", justice: 1.1, blurb: "Ancient pyramids, beaches and incredible food." },
    { id: "brazil", name: "Brazil", region: "americas", lang: "portuguese", currency: "brl", drink: 18, climate: TR, south: true, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced"], dish: "Brazilian Cooking (feijoada, barbecue)", jobs: ["tourGuide", "constructionWorker"], local: ["rioCarnival"], cities: ["São Paulo", "Rio de Janeiro", "Salvador", "Brasília", "Recife"], value: 0.5, tax: 0.003, street: "us", justice: 1.1, blurb: "Beaches, rainforests and the biggest party on Earth." },
    { id: "argentina", name: "Argentina", region: "americas", lang: "spanish", currency: "ars", drink: 18, climate: T, south: true, ski: true, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced"], dish: "Argentine Cooking (steak, empanadas)", jobs: ["sommelier", "tourGuide"], local: ["tangoLesson"], cities: ["Buenos Aires", "Córdoba", "Mendoza", "Rosario", "Bariloche"], value: 0.45, tax: 0.003, street: "us", justice: 1, blurb: "Tango, steak and the Andes." },

    // ------------------------------------------------------------------ Asia & the Pacific
    { id: "southKorea", name: "South Korea", region: "asia", lang: "korean", currency: "krw", drink: 19, climate: T, ski: true, diets: ["scavenge", "cupnoodle", "noodles", "localCuisine", "balanced"], dish: "Korean Cooking (kimchi, barbecue, bibimbap)", jobs: ["barista", "constructionWorker"], local: ["kpopConcert"], cities: ["Seoul", "Busan", "Incheon", "Daegu", "Jeju"], value: 1.0, tax: 0.004, street: "jp", justice: 1.1, blurb: "K-pop, street food and super-fast internet." },
    { id: "india", name: "India", region: "asia", lang: "hindi", currency: "inr", drink: 21, climate: TR, diets: ["scavenge", "cupnoodle", "localCuisine", "tikkaMasala", "balanced", "vegan"], dish: "Indian Cooking (curry, dosa, biryani)", jobs: ["tourGuide", "constructionWorker"], local: ["holiFestival"], cities: ["Mumbai", "Delhi", "Bangalore", "Jaipur", "Kolkata"], value: 0.35, tax: 0.002, street: "us", justice: 1.1, blurb: "Colour, spice and a billion stories." },
    { id: "thailand", name: "Thailand", region: "asia", lang: "thai", currency: "thb", drink: 20, climate: TR, diets: ["scavenge", "cupnoodle", "noodles", "localCuisine", "seafood"], dish: "Thai Cooking (pad thai, green curry)", jobs: ["tourGuide"], local: ["muayThaiNight"], cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi"], value: 0.45, tax: 0.002, street: "us", justice: 1.4, blurb: "Temples, beaches and night markets." },
    { id: "vietnam", name: "Vietnam", region: "asia", lang: "vietnamese", currency: "vnd", drink: 18, climate: TR, diets: ["scavenge", "cupnoodle", "noodles", "localCuisine", "seafood"], dish: "Vietnamese Cooking (pho, banh mi)", jobs: ["tourGuide", "constructionWorker"], local: ["halongCruise"], cities: ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hoi An", "Hue"], value: 0.4, tax: 0.002, street: "us", justice: 1.4, blurb: "Scooters, noodle soup and limestone islands." },
    { id: "indonesia", name: "Indonesia", region: "asia", lang: "indonesian", currency: "idr", drink: 21, climate: TR, south: true, diets: ["scavenge", "cupnoodle", "noodles", "localCuisine", "seafood"], dish: "Indonesian Cooking (nasi goreng, satay)", jobs: ["tourGuide"], local: ["baliTemples"], cities: ["Jakarta", "Bali", "Surabaya", "Bandung", "Yogyakarta"], value: 0.4, tax: 0.002, street: "us", justice: 1.5, blurb: "Seventeen thousand islands, and volcanoes on most of them." },
    { id: "philippines", name: "Philippines", region: "asia", lang: "tagalog", currency: "php", drink: 18, climate: TR, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "seafood"], dish: "Filipino Cooking (adobo, lechon)", jobs: ["tourGuide", "barista"], local: ["palawanIslands"], cities: ["Manila", "Cebu", "Davao", "Boracay", "Baguio"], value: 0.4, tax: 0.002, street: "us", justice: 1.2, blurb: "Seven thousand islands of beaches and karaoke." },
    { id: "australia", name: "Australia", region: "asia", lang: null, currency: "aud", drink: 18, climate: T, south: true, ski: true, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced", "seafood"], dish: "Aussie Cooking (meat pies, barbecue)", jobs: ["barista", "constructionWorker"], local: ["bondiSurf"], cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"], value: 1.1, tax: 0.005, street: "us", justice: 1, blurb: "Beaches, the outback and animals that want to bite you." },
    { id: "newZealand", name: "New Zealand", region: "asia", lang: null, currency: "nzd", drink: 18, climate: T, south: true, ski: true, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced", "seafood"], dish: "Kiwi Cooking (lamb roast, pavlova)", jobs: ["barista", "tourGuide"], local: ["volcanoHike"], cities: ["Auckland", "Wellington", "Christchurch", "Queenstown", "Dunedin"], value: 1.05, tax: 0.004, street: "us", justice: 0.8, blurb: "Mountains, sheep and adventure sports." },

    // ------------------------------------------------------------------ the Middle East & Africa
    { id: "uae", name: "United Arab Emirates", region: "africa", lang: "arabic", currency: "aed", drink: 21, climate: D, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced", "seafood"], dish: "Emirati Cooking (machboos, dates)", jobs: ["barista", "constructionWorker"], local: ["desertSafari"], cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Fujairah"], value: 1.2, tax: 0, street: "us", justice: 1.6, blurb: "Skyscrapers in the desert and no income tax." },
    { id: "egypt", name: "Egypt", region: "africa", lang: "arabic", currency: "egp", drink: 21, climate: D, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced"], dish: "Egyptian Cooking (koshari, falafel)", jobs: ["tourGuide", "constructionWorker"], local: ["pyramids"], cities: ["Cairo", "Alexandria", "Luxor", "Giza", "Aswan"], value: 0.35, tax: 0.002, street: "us", justice: 1.4, blurb: "Pyramids, pharaohs and the Nile." },
    { id: "israel", name: "Israel", region: "africa", lang: "hebrew", currency: "ils", drink: 18, climate: D, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced", "vegan"], dish: "Israeli Cooking (hummus, shakshuka)", jobs: ["barista", "tourGuide"], local: ["deadSea"], cities: ["Tel Aviv", "Jerusalem", "Haifa", "Eilat", "Nazareth"], value: 1.1, tax: 0.005, street: "us", justice: 1.1, blurb: "Ancient cities, startups and the lowest place on Earth." },
    { id: "kenya", name: "Kenya", region: "africa", lang: "swahili", currency: "kes", drink: 18, climate: TR, diets: ["scavenge", "cupnoodle", "localCuisine", "balanced"], dish: "Kenyan Cooking (nyama choma, ugali)", jobs: ["tourGuide", "constructionWorker"], local: ["safari"], cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Lamu"], value: 0.3, tax: 0.002, street: "us", justice: 1.2, blurb: "Safaris, long-distance runners and the Great Rift Valley." },
    { id: "southAfrica", name: "South Africa", region: "africa", lang: "zulu", currency: "zar", drink: 18, climate: T, south: true, diets: ["scavenge", "cupnoodle", "fastfood", "localCuisine", "balanced"], dish: "South African Cooking (braai, bobotie)", jobs: ["sommelier", "tourGuide"], local: ["sharkCage"], cities: ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth"], value: 0.45, tax: 0.003, street: "us", justice: 1.1, blurb: "Wine country, wildlife and Table Mountain." },
];
export const COUNTRY_BY_ID: Record<string, CountryDef> = Object.fromEntries(COUNTRY_DEFS.map((c) => [c.id, c]));
export const NEW_COUNTRY_DEFS = COUNTRY_DEFS.filter((c) => !c.original);
export const REGIONS: { id: Region; title: string; blurb: string; image: string }[] = [
    { id: "americas", title: "The Americas", blurb: "From Canadian snow to Brazilian beaches.", image: "flag_unitedstates" },
    { id: "europe", title: "Europe", blurb: "Old towns, new ideas and lots of borders close together.", image: "flag_france" },
    { id: "asia", title: "Asia & the Pacific", blurb: "Mega-cities, islands and the land down under.", image: "flag_japan" },
    { id: "africa", title: "Middle East & Africa", blurb: "Deserts, safaris and ancient wonders.", image: "flag_egypt" },
];

// ---------------------------------------------------------------- languages
export interface LanguageDef {
    id: string;          // CompletableAction name (the original four keep theirs)
    title: string;
    original?: boolean;
    years: number;       // time to learn (work-years, like the original languages)
    image: string;       // a flag (or another picture)
    fallback: string;
    perk: string;        // what it's good for besides moving
    jobs?: string[];     // careers that pay +5% with it
}
export const LANGUAGE_DEFS: LanguageDef[] = [
    { id: "french", title: "French", original: true, years: 1.5, image: "flag_france", fallback: "flag_france", perk: "Needed to move to France." },
    { id: "japanese", title: "Japanese", original: true, years: 2, image: "flag_japan", fallback: "flag_japan", perk: "Needed to move to Japan." },
    { id: "spanish", title: "Spanish", original: true, years: 1.5, image: "flag_spain", fallback: "flag_spain", perk: "Needed to move to Spain, Mexico or Argentina." },
    { id: "chinese", title: "Chinese", original: true, years: 2.5, image: "flag_china", fallback: "flag_china", perk: "Needed to move to China." },
    { id: "english", title: "English", years: 1.5, image: "flag_uk", fallback: "flag_uk", perk: "Needed to move to the US, Canada, the UK, Ireland, Australia or New Zealand." },
    { id: "german", title: "German", years: 1.5, image: "flag_germany", fallback: "flag_france", perk: "Needed to move to Germany.", jobs: ["engineer"] },
    { id: "italian", title: "Italian", years: 1.5, image: "flag_italy", fallback: "flag_france", perk: "Needed to move to Italy.", jobs: ["chef", "fashionDesigner"] },
    { id: "portuguese", title: "Portuguese", years: 1.5, image: "flag_portugal", fallback: "flag_spain", perk: "Needed to move to Portugal or Brazil." },
    { id: "dutch", title: "Dutch", years: 1.5, image: "flag_netherlands", fallback: "flag_france", perk: "Needed to move to the Netherlands." },
    { id: "swedish", title: "Swedish", years: 1.5, image: "flag_sweden", fallback: "flag_uk", perk: "Needed to move to Sweden." },
    { id: "norwegian", title: "Norwegian", years: 1.5, image: "flag_norway", fallback: "flag_uk", perk: "Needed to move to Norway." },
    { id: "danish", title: "Danish", years: 1.5, image: "flag_denmark", fallback: "flag_uk", perk: "Needed to move to Denmark." },
    { id: "finnish", title: "Finnish", years: 2.5, image: "flag_finland", fallback: "flag_uk", perk: "Needed to move to Finland." },
    { id: "icelandic", title: "Icelandic", years: 2.5, image: "flag_iceland", fallback: "flag_uk", perk: "Needed to move to Iceland." },
    { id: "polish", title: "Polish", years: 2, image: "flag_poland", fallback: "flag_japan", perk: "Needed to move to Poland." },
    { id: "russian", title: "Russian", years: 2, image: "flag_russia", fallback: "flag_france", perk: "Needed to move to Russia." },
    { id: "greek", title: "Greek", years: 2, image: "flag_greece", fallback: "flag_france", perk: "Needed to move to Greece." },
    { id: "turkish", title: "Turkish", years: 2, image: "flag_turkey", fallback: "flag_china", perk: "Needed to move to Turkey." },
    { id: "arabic", title: "Arabic", years: 2.5, image: "flag_egypt", fallback: "flag_china", perk: "Needed to move to the UAE or Egypt." },
    { id: "hebrew", title: "Hebrew", years: 2, image: "flag_israel", fallback: "flag_japan", perk: "Needed to move to Israel." },
    { id: "korean", title: "Korean", years: 2.5, image: "flag_southkorea", fallback: "flag_japan", perk: "Needed to move to South Korea." },
    { id: "hindi", title: "Hindi", years: 2, image: "flag_india", fallback: "flag_japan", perk: "Needed to move to India." },
    { id: "thai", title: "Thai", years: 2, image: "flag_thailand", fallback: "flag_japan", perk: "Needed to move to Thailand." },
    { id: "vietnamese", title: "Vietnamese", years: 2, image: "flag_vietnam", fallback: "flag_china", perk: "Needed to move to Vietnam." },
    { id: "indonesian", title: "Indonesian", years: 1.5, image: "flag_indonesia", fallback: "flag_japan", perk: "Needed to move to Indonesia." },
    { id: "tagalog", title: "Tagalog (Filipino)", years: 1.5, image: "flag_philippines", fallback: "flag_japan", perk: "Needed to move to the Philippines." },
    { id: "swahili", title: "Swahili", years: 1.5, image: "flag_kenya", fallback: "flag_japan", perk: "Needed to move to Kenya." },
    { id: "zulu", title: "Zulu", years: 2, image: "flag_southafrica", fallback: "flag_japan", perk: "Needed to move to South Africa." },
    { id: "irish", title: "Irish (Gaelic)", years: 2, image: "flag_ireland", fallback: "flag_france", perk: "Not needed for Ireland (everyone speaks English there), but locals love it: +10 happiness the week you finish, and tour guides earn more.", jobs: ["tourGuide"] },
    { id: "czech", title: "Czech", years: 2, image: "flag_czechia", fallback: "flag_france", perk: "A language for travellers: tour guides and translators earn more.", jobs: ["tourGuide"] },
    { id: "ukrainian", title: "Ukrainian", years: 2, image: "flag_ukraine", fallback: "flag_france", perk: "A language for travellers: journalists and translators earn more.", jobs: ["journalist"] },
    { id: "romanian", title: "Romanian", years: 1.5, image: "flag_romania", fallback: "flag_france", perk: "A language for travellers: tour guides and translators earn more.", jobs: ["tourGuide"] },
    { id: "persian", title: "Persian (Farsi)", years: 2, image: "flag_iran", fallback: "flag_japan", perk: "The language of poets: writers, journalists and translators earn more.", jobs: ["journalist"] },
    { id: "latin", title: "Latin", years: 2, image: "education_literature", fallback: "education_literature", perk: "Nobody speaks it, but doctors, pharmacists and lawyers earn 5% more for knowing it.", jobs: ["medical", "pharmacist", "lawyer", "veterinarian"] },
    { id: "signLanguage", title: "Sign Language", years: 1.5, image: "waving_hand", fallback: "waving_hand", perk: "Talk with your hands: nurses, teachers and social workers earn 5% more.", jobs: ["nurse", "teacher", "socialWorker"] },
];
export const LANGUAGE_BY_ID: Record<string, LanguageDef> = Object.fromEntries(LANGUAGE_DEFS.map((l) => [l.id, l]));
export const NEW_LANGUAGE_DEFS = LANGUAGE_DEFS.filter((l) => !l.original);
/** The language you grow up speaking in a country (English where none is required). */
export const nativeLanguageOf = (countryId: string): string => COUNTRY_BY_ID[countryId]?.lang ?? "english";

// ---------------------------------------------------------------- currencies
export interface CurrencyDef { id: string; symbol: string; rate: number; name: string }
export const CURRENCY_DEFS: CurrencyDef[] = [
    { id: "sek", symbol: "kr ", rate: 10.5, name: "Swedish krona" },
    { id: "nok", symbol: "kr ", rate: 10.7, name: "Norwegian krone" },
    { id: "dkk", symbol: "kr ", rate: 6.9, name: "Danish krone" },
    { id: "isk", symbol: "kr ", rate: 138, name: "Icelandic króna" },
    { id: "pln", symbol: "zł ", rate: 4, name: "Polish złoty" },
    { id: "rub", symbol: "₽", rate: 90, name: "Russian ruble" },
    { id: "try", symbol: "₺", rate: 32, name: "Turkish lira" },
    { id: "mxn", symbol: "MX$", rate: 18, name: "Mexican peso" },
    { id: "brl", symbol: "R$", rate: 5, name: "Brazilian real" },
    { id: "ars", symbol: "AR$", rate: 900, name: "Argentine peso" },
    { id: "krw", symbol: "₩", rate: 1350, name: "South Korean won" },
    { id: "inr", symbol: "₹", rate: 83, name: "Indian rupee" },
    { id: "thb", symbol: "฿", rate: 35, name: "Thai baht" },
    { id: "vnd", symbol: "₫", rate: 25000, name: "Vietnamese dong" },
    { id: "idr", symbol: "Rp ", rate: 16000, name: "Indonesian rupiah" },
    { id: "php", symbol: "₱", rate: 57, name: "Philippine peso" },
    { id: "aud", symbol: "A$", rate: 1.5, name: "Australian dollar" },
    { id: "nzd", symbol: "NZ$", rate: 1.65, name: "New Zealand dollar" },
    { id: "aed", symbol: "AED ", rate: 3.67, name: "UAE dirham" },
    { id: "egp", symbol: "E£", rate: 48, name: "Egyptian pound" },
    { id: "ils", symbol: "₪", rate: 3.7, name: "Israeli shekel" },
    { id: "kes", symbol: "KSh ", rate: 130, name: "Kenyan shilling" },
    { id: "zar", symbol: "R ", rate: 18, name: "South African rand" },
];
export const CURRENCY_BY_ID: Record<string, CurrencyDef> = Object.fromEntries(CURRENCY_DEFS.map((c) => [c.id, c]));

// ---------------------------------------------------------------- seasons (hemisphere-aware, pure)
export type SeasonName = "winter" | "spring" | "summer" | "fall";
/** The season for a calendar month (0 = January). Southern-hemisphere countries have them the other way round. */
export const seasonForMonth = (month: number, countryId?: string | null): SeasonName => {
    const m = COUNTRY_BY_ID[countryId ?? ""]?.south ? (month + 6) % 12 : ((month % 12) + 12) % 12;
    return m === 11 || m <= 1 ? "winter" : m <= 4 ? "spring" : m <= 7 ? "summer" : "fall";
};
export const climateOf = (countryId?: string | null): Climate => COUNTRY_BY_ID[countryId ?? ""]?.climate ?? "temperate";
/** Snow falls here in winter (no snow in tropical or desert countries). */
export const hasSnow = (countryId?: string | null): boolean => { const c = climateOf(countryId); return c === "temperate" || c === "cold"; };
