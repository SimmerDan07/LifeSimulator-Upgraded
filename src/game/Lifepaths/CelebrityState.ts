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
}
