// Saved state for the Celebrity Life lifepath (v0.19.0). Lives on Player.celebrity (null until the path is used;
// undefined in older saves — see Celebrity.state()).
export class CelebrityState {
    /** Fans right now, and the most you've ever had. */
    fans: number = 0;
    peakFans: number = 0;
    /** 0–100. Low reputation slows fan growth; 10 or less and you're cancelled. */
    reputation: number = 60;
    cancelled: boolean = false;
    /** Skills 0–100 (classes, practice, and working in the career raise them). */
    acting: number = 0;
    music: number = 0;
    dance: number = 0;
    /** Records. */
    songs: number = 0;       // written, not yet recorded
    singles: number = 0;
    albums: number = 0;
    hits: number = 0;        // top-10 singles and platinum albums
    roles: number = 0;
    movies: number = 0;
    tours: number = 0;
    battlesWon: number = 0;
    awards: string[] = [];
    /** Things done this awards year (they count toward nominations). */
    yearWork: number = 0;
    awardYear: number = -1;
    championshipYear: number = -1;
    /** Your team (weekly costs). */
    agent: boolean = false;
    publicist: boolean = false;
    bodyguard: boolean = false;
    /** Your own brand (fragrance, clothing line…) and when it launched. */
    brand: string = null;
    walkOfFame: boolean = false;
    /** True week of your last fame activity (fans fade when you go quiet). */
    lastActive: number = 0;
    /** Tier you last reached (for "You're now Famous!" alerts). */
    tierShown: number = 0;
    /** "job:level" whose not-famous-enough alert was shown. */
    blockShown: string = null;
    /** Fans that came with a famous family name (heirs). */
    inherited: number = 0;
    /** v0.25.0 (vampires): the famous name you had before you faked your death, its fans, and whether you've
     *  "returned from the dead" as that star. Undefined in older saves. */
    formerName: string = null;
    formerFans: number = 0;
    returned: boolean = false;
    /** v0.25.2: the dead star's catalogue and honours, put away when you fake your death (back if you return). */
    former: any = null;

    // ---- v0.20.0 "The Fame Update" (all undefined in v0.19 saves: Celebrity.state() fills them in)
    /** Tabloid headlines about you, newest last. */
    news: CelebHeadline[] = [];
    /** Everything you've made: songs, albums, movies, series, shows, videos, challenges, books, merch. */
    works: CelebWork[] = [];
    /** One rival per career (acting / music / dance). */
    rivals: Record<string, CelebRival> = {};
    /** Celebrity friends (from parties, collabs and feuds that ended well). */
    friends: CelebFriend[] = [];
    /** Milestones reached (ids). */
    milestones: string[] = [];
    /** Your music sound (pop, hiphop, rock, rnb, country, electronic) or null. */
    sound: string = null;
    /** A TV series you're on (weeks left), or null. */
    series: { title: string; weeksLeft: number; season: number } = null;
    /** Business: last merch drop week, fan club, foundation. */
    merchWeek: number = -999;
    fanClub: boolean = false;
    foundation: string = null;
    memoir: string = null;
    /** Legacy: a farewell tour makes you a Legend (fans never fade); the Hall of Fame. */
    legend: boolean = false;
    hallOfFame: boolean = false;
    /** You were a child star (1K fans before 14); you came back from being cancelled. */
    childStar: boolean = false;
    wasCancelled: boolean = false;
    comeback: boolean = false;
    /** Awards won by show (for the Grand Slam). */
    awardShows: string[] = [];
    /** Your celebrity partner (Person id), and whether the wedding made the news. */
    partnerId: string = null;
    weddingNews: boolean = false;
    /** Feud results. */
    feudWins: number = 0;
    feudLosses: number = 0;
}

export interface CelebHeadline { age: number; week: number; text: string }
export interface CelebWork { kind: string; title: string; age: number; result: string; score: number; extra?: string }
export interface CelebRival { first: string; last: string; female: boolean; fans: number; wins: number; losses: number; made: number }
export interface CelebFriend { name: string; career: string; fans: number; female: boolean }
