// v0.29.2: the true age counter has no ceiling.
// A plain number is only exact up to about 9 quadrillion; past that, adding a week stops working. So the counter
// keeps up to BLOCK weeks in the plain number (exact, fast, used as the game's clock) and carries whole blocks into
// an unlimited BigInteger (trueAgeBlocks) - the same kind of number the game uses for money. Saves keep both.
// Shown with commas, every digit ("1,234,567,890,123,456,789 years"), never "1e+21" or "Infinity".
import { BigInteger } from "../runtime";
import { Constants } from "../Utils/Constants";

const BLOCK = 2 ** 48;                 // 281,474,976,710,656 weeks (~5.9 trillion years) per carried block
const BLOCK_N = BigInt(BLOCK);
const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();

export const TrueAge = {
    BLOCK,
    /** Move whole blocks from the plain counter into the unlimited one. */
    carry(o: any): void {
        const w = o.trueAgeInWeeks ?? 0;
        if (!(w >= BLOCK)) return;
        if (!Number.isFinite(w)) { o.trueAgeInWeeks = 0; return; }
        const n = Math.floor(w / BLOCK);
        o.trueAgeInWeeks = w - n * BLOCK;
        o.trueAgeBlocks = TrueAge.blocks(o).add(BigInteger.valueOf(BigInt(n)));
    },
    blocks(o: any): BigInteger { return o.trueAgeBlocks instanceof BigInteger ? o.trueAgeBlocks : BigInteger.ZERO; },
    /** The exact true age in weeks, however big. */
    weeks(o: any): bigint { return BigInt(Math.max(0, Math.floor(o.trueAgeInWeeks ?? 0))) + TrueAge.blocks(o).v * BLOCK_N; },
    /** The exact true age in years, however big. */
    years(o: any): bigint { return TrueAge.weeks(o) / BigInt(WPY()); },
    /** As a plain number for comparisons and clocks (stops at about 9 quadrillion; the exact value is in weeks()). */
    weeksNumber(o: any): number {
        if (o.trueAgeBlocks == null || TrueAge.blocks(o).signum() === 0) return o.trueAgeInWeeks ?? 0;
        const w = TrueAge.weeks(o);
        return w > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(w);
    },
    yearsNumber(o: any): number {
        const y = TrueAge.years(o);
        return y > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(y);
    },
    /** Set it to a plain number of weeks (drops any carried blocks). */
    set(o: any, weeks: number): void { o.trueAgeInWeeks = weeks; o.trueAgeBlocks = undefined; TrueAge.carry(o); },
    add(o: any, weeks: number): void { o.trueAgeInWeeks = (o.trueAgeInWeeks ?? 0) + weeks; TrueAge.carry(o); },
    /** Copy someone's true age exactly (an heir, a former life, a family member). */
    copy(from: any, to: any): void {
        to.trueAgeInWeeks = from?.trueAgeInWeeks ?? from?.getTrueAgeInWeeks?.() ?? 0;
        to.trueAgeBlocks = from?.trueAgeBlocks instanceof BigInteger && from.trueAgeBlocks.signum() !== 0 ? from.trueAgeBlocks : undefined;
        TrueAge.carry(to);
    },
    /** "1,234" — every digit, with commas. */
    text(o: any): string { return TrueAge.format(TrueAge.years(o)); },
    format(n: bigint | number): string {
        const b = typeof n === "bigint" ? n : BigInt(Math.floor(n));
        const neg = b < 0n, s = (neg ? -b : b).toString();
        let out = "";
        for (let i = 0; i < s.length; i++) { if (i > 0 && (s.length - i) % 3 === 0) out += ","; out += s[i]; }
        return (neg ? "-" : "") + out;
    },
};
