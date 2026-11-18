// Celebrity Life (v0.20.0 "The Fame Update"): names for songs, albums, movies, shows and more, so every career has
// a real body of work. Pure word lists (no game imports).
const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];

const ADJ = ["Neon", "Golden", "Broken", "Electric", "Velvet", "Midnight", "Wild", "Silver", "Crimson", "Lonely", "Burning", "Hollow",
    "Endless", "Sweet", "Restless", "Fearless", "Paper", "Glass", "Crystal", "Dangerous", "Secret", "Faded", "Bright", "Savage", "Lucky"];
const NOUN = ["Heart", "Hearts", "Lights", "Dreams", "Fire", "Summer", "Highway", "Ghosts", "Diamonds", "Rain", "Thunder", "Mirrors",
    "Skyline", "Heartbeat", "Promises", "Shadows", "Waves", "Satellites", "Roses", "Echoes", "Gravity", "Stars", "Sirens", "Wolves", "Kingdom"];
const PLACE = ["Tokyo", "Paris", "Vegas", "Brooklyn", "Miami", "London", "Hollywood", "Berlin", "Nashville", "Rio", "Seoul", "Malibu"];
const SONG_TEMPLATES = [
    () => `${pick(ADJ)} ${pick(NOUN)}`,
    () => `Midnight in ${pick(PLACE)}`,
    () => `Don't Let Go`,
    () => `${pick(NOUN)} on the Dance Floor`,
    () => `Call Me ${pick(["Maybe", "Tonight", "Back", "Crazy", "Yours"])}`,
    () => `${pick(["Last", "First", "One More", "Only"])} ${pick(["Dance", "Kiss", "Night", "Chance", "Time"])}`,
    () => `${pick(NOUN)} (${pick(["Remix", "Acoustic", "Live", "Reprise"])})`,
    () => `Say It Like You Mean It`,
    () => `${pick(["Run", "Fly", "Burn", "Shine", "Fall"])} ${pick(["Away", "With Me", "Forever", "Again", "Tonight"])}`,
    () => `${pick(PLACE)} ${pick(["Nights", "Summer", "Lights", "Rain"])}`,
    () => `${pick(["Bad", "Good", "Sad", "Mad"])} ${pick(["Habit", "Liar", "Romance", "Idea", "Decision"])}`,
    () => `Never Say ${pick(["Never", "Goodbye", "Sorry", "Forever"])}`,
];
const ALBUM_TEMPLATES = [
    () => `${pick(ADJ)} ${pick(["Season", "Era", "Chapter", "Hours", "Daydream", "Memoirs"])}`,
    () => `${pick(NOUN)}`,
    () => `${pick(["Volume", "Side", "Act"])} ${pick(["I", "II", "III", "IV", "V"])}`,
    () => `${pick(["Songs from", "Letters from", "Notes from", "Live in"])} ${pick(PLACE)}`,
    () => `The ${pick(ADJ)} ${pick(["Tapes", "Sessions", "Collection", "Diaries"])}`,
];
export const MOVIE_GENRES = ["Action", "Drama", "Comedy", "Horror", "Indie"] as const;
export type MovieGenre = typeof MOVIE_GENRES[number];
const MOVIE_TEMPLATES: Record<string, (() => string)[]> = {
    Action: [() => `${pick(["Zero", "Black", "Iron", "Rogue", "Final"])} ${pick(["Protocol", "Strike", "Hour", "Code", "Vendetta"])}`, () => `Last ${pick(["Stand", "Mission", "Run", "Heist"])} ${pick(["", "2", "3"]).trim()}`.trim()],
    Drama: [() => `The ${pick(NOUN)} of ${pick(PLACE)}`, () => `${pick(["A", "The"])} ${pick(["Quiet", "Long", "Hidden", "Second"])} ${pick(["Life", "Winter", "Promise", "Truth"])}`],
    Comedy: [() => `My Big ${pick(["Fake", "Loud", "Crazy", "Awkward"])} ${pick(["Wedding", "Vacation", "Family", "Roommate"])}`, () => `${pick(["Dude", "Mom", "Grandpa", "Boss"])}, Where's My ${pick(["Car", "Llama", "Pizza", "Phone"])}?`],
    Horror: [() => `The ${pick(["Thing", "House", "Voice", "Door", "Doll"])} ${pick(["Below", "Upstairs", "Next Door", "in the Wall"])}`, () => `${pick(["Don't", "Never"])} ${pick(["Look Back", "Open It", "Answer", "Sleep"])}`],
    Indie: [() => `${pick(ADJ)} ${pick(["Summer", "Afternoon", "Bicycles", "Coffee", "Postcards"])}`, () => `${pick(["Ordinary", "Small", "Little"])} ${pick(["Miracles", "Things", "Victories"])}`],
};
export const SOUNDS = [
    { id: "pop", title: "Pop", blurb: "+10% fans from every release." },
    { id: "hiphop", title: "Hip-Hop", blurb: "Singles chart higher; diss tracks hit harder." },
    { id: "rock", title: "Rock", blurb: "Tours earn 25% more." },
    { id: "rnb", title: "R&B", blurb: "Better odds at the Music Awards." },
    { id: "country", title: "Country", blurb: "Scandals hurt less; fans stay loyal (fade half as fast)." },
    { id: "electronic", title: "Electronic", blurb: "Music videos and challenges go viral more often." },
];
const SERIES = [() => `${pick(PLACE)} ${pick(["General", "Nights", "P.D.", "High", "Heights"])}`, () => `The ${pick(["Firm", "Crown", "Family", "Agency", "Kitchen"])}`, () => `${pick(ADJ)} ${pick(["Lies", "Street", "Island", "Hearts"])}`];
const SHOWS = [() => `${pick(NOUN)}: The Show`, () => `${pick(ADJ)} ${pick(["Revue", "Spectacular", "Nights", "Odyssey"])}`, () => `${pick(PLACE)} Live`];
const MERCH = [() => `${pick(ADJ)} Collection`, () => `"${pick(NOUN)}" Capsule`, () => `${pick(["Tour", "Fan", "Limited"])} Edition Drop`];
const MEMOIR = [() => `${pick(["Still", "Finally", "Always", "Never"])} ${pick(["Shining", "Dancing", "Me", "Enough"])}`, () => `${pick(["Behind", "Beyond", "Under"])} the ${pick(["Spotlight", "Curtain", "Lights", "Velvet Rope"])}`];
const FOUNDATION_CAUSES = ["children's music education", "kids' hospitals", "ocean cleanup", "animal shelters", "young artists", "mental health"];

const dedupe = (gen: () => string, used: string[] | undefined): string => {
    for (let i = 0; i < 12; i++) { const t = gen(); if (!used?.includes(t)) return t; }
    return gen() + " " + pick(["II", "Pt. 2", "Again", "Reloaded"]);
};

export const CelebNames = {
    song: (used?: string[]) => dedupe(() => pick(SONG_TEMPLATES)(), used),
    album: (used?: string[]) => dedupe(() => pick(ALBUM_TEMPLATES)(), used),
    movie: (genre: string, used?: string[]) => dedupe(() => pick(MOVIE_TEMPLATES[genre] ?? MOVIE_TEMPLATES.Drama)(), used),
    series: (used?: string[]) => dedupe(() => pick(SERIES)(), used),
    show: (used?: string[]) => dedupe(() => pick(SHOWS)(), used),
    challenge: (first: string) => `The ${first} ${pick(["Shuffle", "Slide", "Bounce", "Wave", "Spin", "Glide"])}`,
    merch: () => pick(MERCH)(),
    memoir: (full: string) => `${pick(MEMOIR)()}: ${pick(["My Story", "A Memoir", "The Real " + full.split(" ")[0]])}`,
    cause: () => pick(FOUNDATION_CAUSES),
    pick,
};
