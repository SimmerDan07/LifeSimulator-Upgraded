// v0.28.0 Legacy (pure data): estate tax by country and family heirlooms.

/**
 * Inheritance / estate tax, simplified to one rate above a tax-free amount (in US dollars). Applies to money and
 * investments when someone dies; homes pass tax-free (family-home relief), and gifts while you're alive are free.
 */
export const ESTATE_TAX: Record<string, { rate: number; exempt: number }> = {
    unitedStates: { rate: 0.4, exempt: 13_000_000 }, canada: { rate: 0, exempt: 0 }, japan: { rate: 0.3, exempt: 300_000 },
    france: { rate: 0.2, exempt: 110_000 }, spain: { rate: 0.1, exempt: 100_000 }, uk: { rate: 0.4, exempt: 410_000 },
    china: { rate: 0, exempt: 0 }, germany: { rate: 0.15, exempt: 430_000 }, italy: { rate: 0.04, exempt: 1_100_000 },
    portugal: { rate: 0, exempt: 0 }, ireland: { rate: 0.33, exempt: 360_000 }, netherlands: { rate: 0.1, exempt: 25_000 },
    sweden: { rate: 0, exempt: 0 }, norway: { rate: 0, exempt: 0 }, denmark: { rate: 0.15, exempt: 45_000 },
    finland: { rate: 0.13, exempt: 22_000 }, poland: { rate: 0, exempt: 0 }, greece: { rate: 0.05, exempt: 160_000 },
    russia: { rate: 0, exempt: 0 }, iceland: { rate: 0.1, exempt: 40_000 }, turkey: { rate: 0.05, exempt: 120_000 },
    mexico: { rate: 0, exempt: 0 }, brazil: { rate: 0.06, exempt: 0 }, argentina: { rate: 0.05, exempt: 100_000 },
    southKorea: { rate: 0.35, exempt: 400_000 }, india: { rate: 0, exempt: 0 }, thailand: { rate: 0.05, exempt: 2_800_000 },
    vietnam: { rate: 0.1, exempt: 400 }, indonesia: { rate: 0, exempt: 0 }, philippines: { rate: 0.06, exempt: 100_000 },
    australia: { rate: 0, exempt: 0 }, newZealand: { rate: 0, exempt: 0 }, uae: { rate: 0, exempt: 0 },
    egypt: { rate: 0, exempt: 0 }, israel: { rate: 0, exempt: 0 }, kenya: { rate: 0, exempt: 0 },
    southAfrica: { rate: 0.2, exempt: 190_000 },
};

export interface HeirloomDef {
    id: string;
    title: string;
    fallback: string;      // art slot "icon_heirloom_<id>"
    value: number;         // USD when it first enters the family; antiques gain 25% a generation
    blurb: string;
    hobby?: { id: string; skill: number };   // inheriting it teaches you a little
}

export const HEIRLOOMS: HeirloomDef[] = [
    { id: "pocketWatch", title: "Gold Pocket Watch", fallback: "skill_timemanagement", value: 2500, blurb: "It still ticks. Someone wound it every morning for fifty years." },
    { id: "weddingRing", title: "Grandmother's Ring", fallback: "love_propose", value: 4000, blurb: "Worn through three generations of weddings." },
    { id: "recipeBook", title: "Family Recipe Book", fallback: "skill_homechef", value: 50, blurb: "Stained pages, secret sauces and handwritten notes.", hobby: { id: "cooking", skill: 12 } },
    { id: "oldGuitar", title: "Battered Old Guitar", fallback: "possession_turntable_1", value: 800, blurb: "Scratched, out of tune and priceless.", hobby: { id: "guitar", skill: 12 } },
    { id: "chessSet", title: "Carved Chess Set", fallback: "childaction_movienight", value: 600, blurb: "Hand-carved pieces, one rook glued back on.", hobby: { id: "chess", skill: 12 } },
    { id: "paintBox", title: "Paint Box and Brushes", fallback: "education_art", value: 300, blurb: "Dried colours from a lifetime of paintings.", hobby: { id: "painting", skill: 12 } },
    { id: "diary", title: "Leather Diary", fallback: "will", value: 100, blurb: "A life in tiny handwriting. You read it in one night.", hobby: { id: "writing", skill: 12 } },
    { id: "oilPainting", title: "Oil Painting", fallback: "love_museum", value: 9000, blurb: "A portrait of an ancestor who looks exactly like you." },
    { id: "coinCollection", title: "Rare Coin Collection", fallback: "iap_money3", value: 12000, blurb: "Old coins in velvet trays. Some are worth a fortune." },
    { id: "teaSet", title: "Silver Tea Set", fallback: "vacation_drinks", value: 3500, blurb: "Brought out for weddings and funerals only." },
    { id: "quilt", title: "Patchwork Quilt", fallback: "housing_family_home", value: 400, blurb: "Every patch from a different family member's clothes." },
    { id: "medal", title: "Old Medal", fallback: "menu_badge", value: 1500, blurb: "Earned by an ancestor nobody talks about enough." },
    { id: "photoAlbum", title: "Family Photo Album", fallback: "family", value: 20, blurb: "Black-and-white weddings, babies and bad haircuts." },
    { id: "jewelryBox", title: "Jewellery Box", fallback: "iap_money4", value: 7000, blurb: "Pearls, brooches and one mysterious key." },
    { id: "violin", title: "Antique Violin", fallback: "education_college_music", value: 15000, blurb: "Made in Italy over a century ago." },
    { id: "landDeed", title: "Old Land Deed", fallback: "business_farm1", value: 30000, blurb: "A deed to a field nobody has visited in decades. It's still yours." },
];
export const HEIRLOOM_BY_ID: Record<string, HeirloomDef> = Object.fromEntries(HEIRLOOMS.map((h) => [h.id, h]));
