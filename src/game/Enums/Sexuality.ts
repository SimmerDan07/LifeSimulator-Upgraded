// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { Utils } from "../Utils/Utils";

export class Sexuality extends JEnum {
    static readonly straight: Sexuality = new Sexuality("straight", 0);
    static readonly gay: Sexuality = new Sexuality("gay", 1);
    static readonly bisexual: Sexuality = new Sexuality("bisexual", 2);
    static values(): Sexuality[] { return [Sexuality.straight, Sexuality.gay, Sexuality.bisexual]; }
    static valueOf(n: string): Sexuality { return (Sexuality as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        let i: Sexuality = this;
        if (i === Sexuality.straight) {
            return Utils.INSTANCE.getString(R.string.sexuality_straight);
        }
        if (i === Sexuality.gay) {
            return Utils.INSTANCE.getString(R.string.sexuality_gay);
        }
        if (i === Sexuality.bisexual) {
            return Utils.INSTANCE.getString(R.string.sexuality_bisexual);
        }
        throw new NoWhenBranchMatchedException();
    }
    getImageId(): number {
        let i: Sexuality = this;
        if (i === Sexuality.straight) {
            return R.drawable.gender_straight;
        }
        if (i === Sexuality.gay) {
            return R.drawable.gender_gay;
        }
        if (i === Sexuality.bisexual) {
            return R.drawable.gender_bi;
        }
        throw new NoWhenBranchMatchedException();
    }
}
