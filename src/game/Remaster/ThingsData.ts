// v0.36.0 The Remaster: things you can own (the Store). Rules in Things.ts.
//
// mods: [health, happiness, sanity] each week you own it (the total from all your things is capped, so a house full
// of stuff doesn't add up forever). fit / sleep / cook: a boost to that Health routine. dep: value lost per year
// (cars and tech); grow + vol: collectibles change value every year. upkeep: a weekly cost (insurance, fuel, care).
// possession: buying it also gives you an original item (the Gaming PC counts as a game console). The original items
// (game console, laptop, camping gear, passport, turntable, video gear, jet, yacht, rocket) are sold in their department.

export type ThingCat = "tech" | "hobby" | "home" | "style" | "collect" | "car" | "toy";
export interface ThingDef {
    id: string; title: string; cat: ThingCat; price: number; image: string; fallback: string; blurb: string;
    mods?: [number, number, number]; fit?: number; sleep?: number; cook?: number; dep?: number; grow?: number; vol?: number;
    upkeep?: number; minAge?: number; possession?: string; level?: number; hidden?: boolean;
    // cars
    tier?: number; reliability?: number; electric?: boolean; seats?: number;
}
export const THING_CATS: { id: ThingCat; title: string; image: string; blurb: string }[] = [
    { id: "car", title: "Cars", image: "icon_rm_cars", blurb: "From a rusty first car to a supercar. Upkeep is one weekly cost; nothing to maintain by hand." },
    { id: "tech", title: "Tech", image: "icon_rm_tech", blurb: "Phones, computers and screens." },
    { id: "hobby", title: "Hobbies & Sport", image: "icon_rm_hobby", blurb: "Gear that makes the things you love more fun." },
    { id: "home", title: "Home & Travel", image: "icon_rm_home", blurb: "Things that make home better, and your passport." },
    { id: "style", title: "Style", image: "icon_rm_style", blurb: "Clothes, jewellery and a good watch." },
    { id: "collect", title: "Collectibles", image: "icon_rm_collect", blurb: "Art, wine and rare things: their value changes every year." },
    { id: "toy", title: "Big Toys", image: "icon_rm_toys", blurb: "A private jet, a yacht and a rocket, and things to do with them." },
];

const T = (id: string, title: string, cat: ThingCat, price: number, fallback: string, blurb: string, x: Partial<ThingDef> = {}): ThingDef =>
    ({ id, title, cat, price, image: "thing_" + id.toLowerCase(), fallback, blurb, ...x });

export const THINGS: ThingDef[] = [
    // ------------------------------------------------------------------ tech
    T("phone", "Smartphone", "tech", 900, "possession_computer_2", "Everyone you know, in your pocket.", { mods: [0, 0.4, -0.1], dep: 0.35, minAge: 10 }),
    T("gamingPc", "Gaming PC", "tech", 2500, "possession_computer_3", "Glowing fans and a lot of games.", { mods: [0, 0.6, 0.2], dep: 0.3, minAge: 10, possession: "gameConsole", level: 1 }),
    T("tv", "Big-Screen TV", "tech", 1800, "vacation_watchanime", "Movie nights at home.", { mods: [0, 0.4, 0.2], dep: 0.2 }),
    T("headphones", "Noise-Cancelling Headphones", "tech", 350, "possession_turntable_1", "The world goes quiet.", { mods: [0, 0.1, 0.3], dep: 0.25, minAge: 10 }),
    T("tablet", "Tablet", "tech", 800, "possession_computer_2", "Films in bed and recipes in the kitchen.", { mods: [0, 0.3, 0.1], dep: 0.3, minAge: 6 }),
    T("vr", "VR Headset", "tech", 600, "vacation_videogames", "Other worlds in your living room.", { mods: [0, 0.4, 0.1], dep: 0.3, minAge: 12 }),
    T("drone", "Camera Drone", "tech", 1200, "possesion_recordingequipment_2", "Your town from the sky.", { mods: [0, 0.3, 0.1], dep: 0.25, minAge: 14 }),
    T("ereader", "E-Reader", "tech", 150, "education_literature", "A library in your bag.", { mods: [0, 0.1, 0.3], dep: 0.2, minAge: 8 }),
    // ------------------------------------------------------------------ hobbies & sport
    T("bike", "Road Bike", "hobby", 1200, "health_workout", "Ride to work, ride for fun.", { fit: 2, mods: [0.2, 0.2, 0.1], dep: 0.12, minAge: 8 }),
    T("runningShoes", "Running Shoes", "hobby", 160, "health_workout", "A small push to keep running.", { fit: 1, dep: 0.5, minAge: 8 }),
    T("guitar", "Guitar", "hobby", 700, "possession_turntable_3", "Three chords and the truth.", { mods: [0, 0.3, 0.3], dep: 0.05, minAge: 8 }),
    T("piano", "Piano", "hobby", 6000, "education_college_music", "The centre of the living room.", { mods: [0, 0.3, 0.4], dep: 0.03, minAge: 6 }),
    T("camera", "Camera", "hobby", 1800, "possesion_recordingequipment_1", "Notice the light everywhere you go.", { mods: [0, 0.3, 0.2], dep: 0.15, minAge: 10 }),
    T("paints", "Art Studio Kit", "hobby", 400, "education_art", "Easel, canvases and too many brushes.", { mods: [0, 0.2, 0.4], dep: 0.2, minAge: 6 }),
    T("golf", "Golf Clubs", "hobby", 1500, "vacation_park", "Four hours outside, mostly looking for the ball.", { mods: [0.1, 0.2, 0.2], fit: 0.5, dep: 0.1, minAge: 10 }),
    T("telescope", "Telescope", "hobby", 900, "education_science", "Saturn's rings, from your back yard.", { mods: [0, 0.2, 0.3], dep: 0.08, minAge: 8 }),
    T("kayak", "Kayak", "hobby", 1100, "vacation_park", "Quiet water, early mornings.", { mods: [0.1, 0.2, 0.3], fit: 1, dep: 0.08, minAge: 10 }),
    T("skis", "Skis", "hobby", 900, "vacation_ski", "For winter weekends.", { mods: [0.1, 0.2, 0.1], fit: 0.5, dep: 0.12, minAge: 8 }),
    // ------------------------------------------------------------------ home
    T("homeGym", "Home Gym", "home", 3500, "health_workout", "No membership, no excuses.", { fit: 3, mods: [0.3, 0, 0.1], dep: 0.1 }),
    T("mattress", "Luxury Mattress", "home", 2500, "housing_luxury_condo", "The best sleep of your life.", { sleep: 2, mods: [0.2, 0.2, 0.3], dep: 0.1 }),
    T("knives", "Chef's Kitchen", "home", 3000, "diet_balanced", "Good knives and copper pans make home cooking better for you.", { cook: 2, mods: [0, 0.2, 0.1], dep: 0.05 }),
    T("espresso", "Espresso Machine", "home", 900, "work_barista", "Café coffee every morning.", { mods: [0, 0.3, 0.1], dep: 0.12 }),
    T("massageChair", "Massage Chair", "home", 4000, "vacation_spa", "Fifteen minutes and every knot is gone.", { mods: [0.1, 0.2, 0.5], dep: 0.1 }),
    T("hotTub", "Hot Tub", "home", 9000, "vacation_spa", "Stars, steam and quiet.", { mods: [0.1, 0.4, 0.5], dep: 0.08, upkeep: 15 }),
    T("aquarium", "Aquarium", "home", 1500, "pet_bird", "Bright fish and a gentle hum.", { mods: [0, 0.2, 0.4], dep: 0.1, upkeep: 5 }),
    T("smartHome", "Smart Home", "home", 2500, "possession_computer_3", "Lights, locks and heating that sort themselves out.", { mods: [0, 0.2, 0.3], dep: 0.2 }),
    // ------------------------------------------------------------------ style
    T("wardrobe", "Designer Wardrobe", "style", 8000, "love_romantic_dinner", "You look like you have somewhere better to be.", { mods: [0, 0.5, 0.1], dep: 0.25, minAge: 14 }),
    T("sneakers", "Limited Sneakers", "style", 600, "health_workout", "Nobody else has these.", { mods: [0, 0.2, 0], dep: 0.3, minAge: 10 }),
    T("designerBag", "Designer Bag", "style", 4000, "love_propose", "The one everyone wants.", { mods: [0, 0.3, 0], dep: 0.15, minAge: 16 }),
    T("jewelry", "Fine Jewellery", "style", 15000, "love_propose", "Diamonds and gold. A wonderful gift.", { mods: [0, 0.3, 0], dep: 0.05, minAge: 16 }),
    T("watch", "Luxury Watch", "style", 25000, "achievement_money_collector", "Swiss. Keeps its value well.", { mods: [0, 0.3, 0], grow: 0.02, vol: 0.05, minAge: 16 }),
    // ------------------------------------------------------------------ collectibles
    T("painting", "Original Painting", "collect", 50000, "education_art", "A canvas by an up-and-coming artist. It could be worth a fortune one day.", { mods: [0, 0.3, 0.2], grow: 0.05, vol: 0.25, minAge: 18 }),
    T("masterpiece", "Old Master Painting", "collect", 5_000_000, "education_art", "Museum quality. Steady, and very expensive.", { mods: [0, 0.5, 0.3], grow: 0.04, vol: 0.08, minAge: 18 }),
    T("wine", "Vintage Wine Cellar", "collect", 20000, "work_sommelier", "Gets better (and pricier) with age.", { mods: [0, 0.2, 0.1], grow: 0.06, vol: 0.08, minAge: 21 }),
    T("cards", "Rare Trading Cards", "collect", 3000, "possession_computer_2", "A binder of first editions.", { mods: [0, 0.2, 0], grow: 0.04, vol: 0.35, minAge: 8 }),
    T("comics", "Vintage Comics", "collect", 8000, "education_literature", "First appearances, bagged and boarded.", { mods: [0, 0.2, 0], grow: 0.05, vol: 0.2, minAge: 10 }),
    T("coins", "Rare Coins", "collect", 12000, "bank_deposit", "Old gold and silver.", { mods: [0, 0.1, 0.1], grow: 0.03, vol: 0.1, minAge: 12 }),
    T("classicCar", "Classic Car", "collect", 90000, "possesion_nicecar", "A beauty from the sixties. Looked after, it gains value.", { mods: [0, 0.5, 0.2], grow: 0.05, vol: 0.12, upkeep: 40, minAge: 18 }),
    // ------------------------------------------------------------------ cars (tier 1 = beater … 5 = supercar)
    T("beater", "Rusty Hatchback", "car", 2500, "possession_car", "It runs. Mostly.", { tier: 1, reliability: 0.012, dep: 0.15, upkeep: 30, mods: [0, 0.1, 0.2], minAge: 16 }),
    T("usedSedan", "Used Sedan", "car", 9000, "possession_car", "Ten years old and very sensible.", { tier: 1, reliability: 0.006, dep: 0.12, upkeep: 40, mods: [0, 0.2, 0.3], minAge: 16 }),
    T("compact", "New Compact", "car", 22000, "possession_car", "Cheap to run and easy to park.", { tier: 2, reliability: 0.002, dep: 0.15, upkeep: 45, mods: [0, 0.3, 0.3], minAge: 16 }),
    T("hybrid", "Hybrid", "car", 30000, "possession_car", "Sips fuel.", { tier: 2, reliability: 0.002, dep: 0.14, upkeep: 35, mods: [0, 0.3, 0.4], minAge: 16 }),
    T("minivan", "Minivan", "car", 38000, "possession_car", "Seven seats and sliding doors.", { tier: 2, reliability: 0.003, dep: 0.15, upkeep: 60, seats: 7, mods: [0, 0.3, 0.3], minAge: 16 }),
    T("pickup", "Pickup Truck", "car", 45000, "possession_car", "Haul anything.", { tier: 3, reliability: 0.003, dep: 0.12, upkeep: 75, mods: [0, 0.4, 0.3], minAge: 16 }),
    T("suv", "Family SUV", "car", 48000, "possession_car", "Room for everyone and the dog.", { tier: 3, reliability: 0.003, dep: 0.15, upkeep: 70, seats: 7, mods: [0, 0.4, 0.3], minAge: 16 }),
    T("ev", "Electric Car", "car", 52000, "possesion_nicecar", "Silent and quick. Charge it at home.", { tier: 3, reliability: 0.002, dep: 0.16, upkeep: 30, electric: true, mods: [0, 0.5, 0.4], minAge: 16 }),
    T("convertible", "Convertible", "car", 55000, "possesion_nicecar", "Roof down on a summer day.", { tier: 3, reliability: 0.004, dep: 0.15, upkeep: 80, mods: [0, 0.6, 0.3], minAge: 16 }),
    T("sportsCar", "Sports Car", "car", 90000, "possesion_nicecar", "Low, loud and fast.", { tier: 4, reliability: 0.004, dep: 0.15, upkeep: 140, mods: [0, 0.8, 0.2], minAge: 16 }),
    T("luxurySedan", "Luxury Sedan", "car", 110000, "possesion_nicecar", "Leather, wood and silence.", { tier: 4, reliability: 0.002, dep: 0.17, upkeep: 130, mods: [0, 0.7, 0.5], minAge: 16 }),
    T("luxurySuv", "Luxury SUV", "car", 130000, "possesion_nicecar", "Arrive like you mean it.", { tier: 4, reliability: 0.003, dep: 0.17, upkeep: 160, seats: 7, mods: [0, 0.8, 0.4], minAge: 16 }),
    T("electricSuper", "Electric Hypercar", "car", 250000, "possesion_nicecar", "0 to 60 before you finish blinking.", { tier: 5, reliability: 0.002, dep: 0.15, upkeep: 120, electric: true, mods: [0, 1.1, 0.4], minAge: 16 }),
    T("supercar", "Supercar", "car", 350000, "possesion_nicecar", "People take pictures at red lights.", { tier: 5, reliability: 0.005, dep: 0.12, upkeep: 400, mods: [0, 1.2, 0.2], minAge: 16 }),
    T("limo", "Chauffeured Limousine", "car", 500000, "possesion_nicecar", "Comes with a driver (included in the upkeep).", { tier: 5, reliability: 0.001, dep: 0.15, upkeep: 1500, mods: [0, 1.0, 0.8], minAge: 18 }),
    // ------------------------------------------------------------------ not sold in the Store
    T("souvenir", "Souvenir", "collect", 40, "vacation_international", "A little something from a trip.", { mods: [0, 0.1, 0], grow: 0.01, vol: 0.05, hidden: true, minAge: 0 }),
    T("motorbike", "Motorbike", "car", 14000, "possession_car", "Two wheels, open road.", { tier: 2, reliability: 0.004, dep: 0.12, upkeep: 30, mods: [0, 0.5, 0.2], minAge: 16 }),
];
export const THING_BY_ID: Record<string, ThingDef> = Object.fromEntries(THINGS.map((t) => [t.id, t]));
export const CAR_IDS = THINGS.filter((t) => t.cat === "car").map((t) => t.id);

/** Weekly caps on what your things add (all together). */
export const THING_CAPS: [number, number, number] = [1, 3, 2.5];
