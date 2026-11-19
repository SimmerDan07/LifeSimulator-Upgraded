// Hand-ported from Utils/ExtensionsKt.java. Android view `configure(...)` helpers live in the UI layer.
import {
    BigInteger, SpannableStringBuilder, ForegroundColorSpan, AbsoluteSizeSpan, CustomTypefaceSpan,
    StyleSpan, JString, MathKt, Integer, Function1, ArrayList,
} from "../runtime";
import { Utils } from "./Utils";
import { Constants } from "./Constants";
import { GameStateManager } from "../Managers/GameStateManager";
import type { Modifiers } from "../Managers/Modifiers";
import type { ValueRange } from "./ValueRange";
import { PersonAttribute } from "../Enums/PersonAttribute";

/** Number-name suffixes and the digit count at which each starts (from the original bytecode). */
const SUFFIXES: [string, number][] = [
    ["M", 7], ["B", 10], ["T", 13], ["Qua", 16], ["Qui", 19], ["Sext", 22], ["Sept", 25], ["Oct", 28],
    ["Non", 31], ["Dec", 34], ["Und", 37], ["Duo", 40], ["Tred", 43], ["Quat", 46], ["Quin", 49],
    ["Sexd", 52], ["Septe", 55], ["Octo", 58], ["Nov", 61], ["Vig", 64], ["Unv", 67], ["Duov", 70],
    ["Tres", 73], ["Quatt", 76], ["Quinq", 79], ["Ses", 82], ["Septe", 85], ["Octo", 88], ["Novem", 91],
    ["Trig", 94], ["Unt", 97], ["Duotr", 100], ["Trest", 103], ["Quattu", 106], ["Quinqu", 109],
    ["Sest", 112], ["Septen", 115], ["Octotri", 118], ["Noven", 121], ["Quadr", 124], ["Quinqua", 154],
    ["Sexag", 184], ["Septuag", 214], ["Octog", 244], ["Nonag", 274],
];

const defaultFontSize = () => Constants.ViewModel.INSTANCE.getDefaultFontSize();

export class ExtensionsKt {
    /** Android view binding helpers; the desktop UI renders view models itself. */
    static configure(..._a: any[]): void {}
    static animateGrowShrink$default(..._a: any[]): void {}
    static displayColor(d: number): string {
        return d === 0 ? "flatBlack" : d > 0 ? "flatGreen" : "flatRed";
    }
    static progressColorScheme(d: number): string {
        return d < 10 ? "flatRed" : d < 25 ? "flatOrange" : d < 49 ? "flatYellow" : "flatGreen";
    }
    static valuePlusMinusSign(d: number): string {
        return d !== 0 && d > 0 ? "+" : "";
    }
    static numberDisplayString$default(value: BigInteger | number, z: boolean, mask: number, _o: any): string {
        if ((mask & 1) !== 0) z = true;
        return ExtensionsKt.numberDisplayString(value, z);
    }
    /**
     * Reconstructed from bytecode (jadx could not decompile it).
     * Fixes an original bug where exactly 9,999 rendered as 0.
     */
    static numberDisplayString(value: BigInteger | number, showCurrency: boolean = true): string {
        let v = value instanceof BigInteger ? value : BigInteger.valueOf(value);
        let symbol = "";
        if (showCurrency) {
            const currency = GameStateManager.INSTANCE.getPersonState().getCountry().getCurrency();
            symbol = currency.getSymbol();
            v = ExtensionsKt.times(v, currency.getExchangeRate());
        }
        const abs = v.abs();
        const digits = abs.toString().length;
        let d = 0;
        let suffix = "";
        if (abs.compareTo(BigInteger.valueOf(10000)) < 0) {
            d = v.doubleValue();
        } else if (abs.compareTo(BigInteger.valueOf(1000000)) < 0) {
            d = v.doubleValue() / 1000;
            suffix = "K";
        } else {
            for (let i = SUFFIXES.length - 1; i >= 0; i--) {
                const [name, n] = SUFFIXES[i];
                if (digits >= n) {
                    d = v.divide(new BigInteger("1" + "0".repeat(n - 3))).doubleValue() / 100;
                    suffix = name;
                    break;
                }
            }
        }
        const fmt = ExtensionsKt.isWholeNumber(d) ? "%.0f" : "%.2f";
        if (d >= 0) return symbol + JString.format(fmt, d) + suffix;
        return "-" + symbol + JString.format(fmt, Math.abs(d)) + suffix;
    }
    /**
     * v0.27.0: prices written into story text as US dollars ("Go ($800)", "$5,000 a week") are shown in the
     * currency of the country you live in, converted like every other price. Only display text is changed.
     */
    static localizeDollars(s: string): string {
        if (!s || s.indexOf("$") < 0) return s;
        let cur: any;
        try { cur = GameStateManager.INSTANCE.getPersonState()?.getCountry()?.getCurrency(); } catch { return s; }
        if (cur == null || (cur.getSymbol() === "$" && cur.getExchangeRate() === 1)) return s;
        const mult: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
        return s.replace(/(?<![A-Za-z0-9$])\$(\d+(?:,\d{3})*(?:\.\d+)?)(?:(K|M|B|T)\b|\s(thousand|million|billion|trillion)\b)?/g, (m, num: string, suf?: string, word?: string) => {
            const n = parseFloat(num.replace(/,/g, "")) * (mult[suf ?? word ?? ""] ?? 1);
            if (!isFinite(n)) return m;
            try { return ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true); } catch { return m; }
        });
    }
    /** "a" or "an" before a word: aOrAn("Interpreter") = "an Interpreter". */
    static aOrAn(word: string): string {
        return (/^[aeiou]/i.test(word) && !/^(uni|use|eu|one|ur)/i.test(word) ? "an " : "a ") + word;
    }
    static toIntegerCappingAtMaxInt(b: BigInteger): number {
        if (b.compareTo(BigInteger.valueOf(Integer.MAX_VALUE)) > 0) return Integer.MAX_VALUE;
        return b.intValue();
    }
    static multiply(b: BigInteger, d: number): BigInteger {
        return ExtensionsKt.times(b, d * 1000).divide(BigInteger.valueOf(1000));
    }
    static formatWithDecimals(d: number, i: number): string {
        return JString.format("%." + i + "f", d);
    }
    static round(d: number, i: number): number {
        let m = 1;
        for (let k = 0; k < i; k++) m *= 10;
        return rint(d * m) / m;
    }
    static toPercentString(d: number): string {
        return MathKt.roundToInt(d * 100) + "%";
    }
    /** BigInteger * double using 1e8 fixed-point, exactly as the original (int overflow included). */
    static times(b: BigInteger, d: number): BigInteger {
        const pow = toJavaInt(Math.pow(10, 8) * d);
        const pow2 = toJavaInt(Math.pow(10, 8));
        return b.multiply(BigInteger.valueOf(pow)).divide(BigInteger.valueOf(pow2));
    }
    static keepWithinRange(d: number, lo: number, hi: number): number {
        return Math.max(Math.min(d, hi), lo);
    }
    static isWholeNumber(d: number): boolean {
        return Math.trunc(d) === d;
    }
    static displayColorForMoney(b: BigInteger): string {
        return b.compareTo(BigInteger.ZERO) >= 0 ? "flatGreen" : "flatRed";
    }
    static randomSimilarValue(i: number, d: number): number {
        const spread = toJavaInt(i * d);
        return Utils.Random.INSTANCE.randomValueWithinRange(i - spread, i + spread);
    }
    static stringWithExplicitPlusMinusSign(i: number): string {
        return i >= 0 ? "+" + i : String(i);
    }
    static getAttributeDisplayString(d: number, withSign: boolean): string {
        const fmt = ExtensionsKt.isWholeNumber(d) ? "%.0f" : "%.1f";
        if (withSign) return ExtensionsKt.valuePlusMinusSign(d) + JString.format(fmt, d) + " ";
        return JString.format(fmt, d);
    }
    static toStringWithDecimals(d: number, i: number): string {
        return JString.format("%." + i + "f", d);
    }
    static sumByBigInt<T>(items: Iterable<T>, selector: Function1<T, BigInteger>): BigInteger {
        let s = BigInteger.ZERO;
        for (const x of items) s = s.add(selector.invoke(x));
        return s;
    }

    // ------------------------------------------------------------- rich text
    static appendBold$default(sb: SpannableStringBuilder, s: string, color: any, size: any, align: any, mask: number, _o: any): SpannableStringBuilder {
        if ((mask & 2) !== 0) color = null;
        if ((mask & 4) !== 0) size = defaultFontSize();
        if ((mask & 8) !== 0) align = null;
        return ExtensionsKt.appendBold(sb, s, color, size, align);
    }
    static appendBold(sb: SpannableStringBuilder, s: string, color: any, size: any, align: any): SpannableStringBuilder {
        return appendWithFont(sb, s, "futura_bold", color, size, align);
    }
    static appendNormal$default(sb: SpannableStringBuilder, s: string, color: any, size: any, align: any, mask: number, _o: any): SpannableStringBuilder {
        if ((mask & 2) !== 0) color = null;
        if ((mask & 4) !== 0) size = defaultFontSize();
        if ((mask & 8) !== 0) align = null;
        return ExtensionsKt.appendNormal(sb, s, color, size, align);
    }
    static appendNormal(sb: SpannableStringBuilder, s: string, color: any, size: any, align: any): SpannableStringBuilder {
        return appendWithFont(sb, s, "futura_normal", color, size, align);
    }
    static appendNewline(sb: SpannableStringBuilder): SpannableStringBuilder {
        sb.append("\n");
        return sb;
    }
    static appendDoubleNewline(sb: SpannableStringBuilder): SpannableStringBuilder {
        sb.append("\n");
        sb.append("\n");
        return sb;
    }
    static appendMoney(sb: SpannableStringBuilder, money: BigInteger): SpannableStringBuilder {
        ExtensionsKt.appendNormal$default(sb, ExtensionsKt.numberDisplayString$default(money, false, 1, null), ExtensionsKt.displayColorForMoney(money), null, null, 12, null);
        return sb;
    }
    static appendAttributeIcon$default(sb: SpannableStringBuilder, attr: PersonAttribute, size: any, mask: number, _o: any): SpannableStringBuilder {
        if ((mask & 2) !== 0) size = defaultFontSize();
        return ExtensionsKt.appendAttributeIcon(sb, attr, size);
    }
    static appendAttributeIcon(sb: SpannableStringBuilder, attr: PersonAttribute, size: any): SpannableStringBuilder {
        return ExtensionsKt.appendFontAwesomeCharacter(sb, attr.getFontAwesomeCharacter(), attr.getColorId(), size);
    }
    static appendFontAwesomeCharacter$default(sb: SpannableStringBuilder, ch: string, color: any, size: any, mask: number, _o: any): SpannableStringBuilder {
        if ((mask & 4) !== 0) size = defaultFontSize();
        return ExtensionsKt.appendFontAwesomeCharacter(sb, ch, color, size);
    }
    static appendFontAwesomeCharacter(sb: SpannableStringBuilder, ch: string, color: any, size: any): SpannableStringBuilder {
        const start = sb.length;
        sb.append(ch);
        const end = sb.length;
        sb.setSpan(new CustomTypefaceSpan("", "fa_solid"), start, end, 33);
        sb.setSpan(new ForegroundColorSpan(Utils.INSTANCE.getColor(color)), start, end, 33);
        if (size != null) sb.setSpan(new AbsoluteSizeSpan(size), start, end, 33);
        return sb;
    }
    static appendAttributesString$default(sb: SpannableStringBuilder, modifiers: Modifiers, range: ValueRange | null, size: any, attr: PersonAttribute | null, mask: number, _o: any): SpannableStringBuilder {
        if ((mask & 2) !== 0) range = null;
        if ((mask & 4) !== 0) size = defaultFontSize();
        if ((mask & 8) !== 0) attr = null;
        return ExtensionsKt.appendAttributesString(sb, modifiers, range, size, attr);
    }
    static appendAttributesString(sb: SpannableStringBuilder, modifiers: Modifiers, range: ValueRange | null, size: any, attr: PersonAttribute | null): SpannableStringBuilder {
        const entries: [PersonAttribute, number][] = [
            [PersonAttribute.health, modifiers.getHealth()],
            [PersonAttribute.happiness, modifiers.getHappiness()],
            [PersonAttribute.sanity, modifiers.getSanity()],
        ];
        if (range != null) {
            ExtensionsKt.appendNormal$default(sb, range.getStringForSalary() + " ", ExtensionsKt.displayColor(range.getMin()), null, null, 12, null);
        }
        const inner = new SpannableStringBuilder();
        for (const [a, value] of entries) {
            if (value !== 0 || a === attr) {
                if (inner.length > 0 && attr == null) inner.append("  ");
                ExtensionsKt.appendAttributeIcon(
                    ExtensionsKt.appendNormal$default(inner, String(ExtensionsKt.getAttributeDisplayString(value, true)), ExtensionsKt.displayColor(value), size, null, 8, null),
                    a, size);
            }
        }
        sb.append(inner);
        return sb;
    }
}

function appendWithFont(sb: SpannableStringBuilder, s: string, font: string, color: any, size: any, _align: any): SpannableStringBuilder {
    const start = sb.length;
    sb.append(s);
    const end = sb.length;
    if (font === "futura_bold") sb.setSpan(new StyleSpan(1), start, end, 33);
    sb.setSpan(new ForegroundColorSpan(Utils.INSTANCE.getColor(color != null ? color : "flatBlack")), start, end, 33);
    if (size != null) sb.setSpan(new AbsoluteSizeSpan(size), start, end, 33);
    return sb;
}

/** Math.rint: round half to even. */
function rint(x: number): number {
    const r = Math.round(x);
    if (Math.abs(x % 1) === 0.5) return 2 * Math.round(x / 2);
    return r;
}
function toJavaInt(x: number): number {
    if (Number.isNaN(x)) return 0;
    if (x >= 2147483647) return 2147483647;
    if (x <= -2147483648) return -2147483648;
    return Math.trunc(x);
}
void ArrayList;
