// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException } from "../runtime";

export class Currency extends JEnum {
    static readonly dollar: Currency = new Currency("dollar", 0);
    static readonly yen: Currency = new Currency("yen", 1);
    static readonly euro: Currency = new Currency("euro", 2);
    static readonly pound: Currency = new Currency("pound", 3);
    static readonly yuan: Currency = new Currency("yuan", 4);
    static values(): Currency[] { return [Currency.dollar, Currency.yen, Currency.euro, Currency.pound, Currency.yuan]; }
    static valueOf(n: string): Currency { return (Currency as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getSymbol(): string {
        let i: Currency = this;
        if (i === Currency.dollar) {
            return "$";
        }
        if (i === Currency.yen) {
            return "‎¥";
        }
        if (i === Currency.euro) {
            return "€";
        }
        if (i === Currency.pound) {
            return "£";
        }
        if (i === Currency.yuan) {
            return "‎¥";
        }
        throw new NoWhenBranchMatchedException();
    }
    getExchangeRate(): number {
        let i: Currency = this;
        if (i === Currency.dollar) {
            return 1.0;
        }
        if (i === Currency.yen) {
            return 100.0;
        }
        if (i === Currency.euro) {
            return 0.87;
        }
        if (i === Currency.pound) {
            return 0.78;
        }
        if (i === Currency.yuan) {
            return 7.0;
        }
        throw new NoWhenBranchMatchedException();
    }
}
