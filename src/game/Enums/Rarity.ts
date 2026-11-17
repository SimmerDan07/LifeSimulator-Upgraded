// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { Utils } from "../Utils/Utils";

export class Rarity extends JEnum {
    static readonly common: Rarity = new Rarity("common", 0, 0);
    static readonly uncommon: Rarity = new Rarity("uncommon", 1, 1);
    static readonly rare: Rarity = new Rarity("rare", 2, 2);
    static readonly legendary: Rarity = new Rarity("legendary", 3, 3);
    static values(): Rarity[] { return [Rarity.common, Rarity.uncommon, Rarity.rare, Rarity.legendary]; }
    static valueOf(n: string): Rarity { return (Rarity as any)[n]; }
    raw: number = 0;
    constructor(name: string, ordinal: number, i: number) {
        super(name, ordinal);
        this.raw = i;
    }
    getRaw(): number {
        return this.raw;
    }
    getColorId(): number {
        let i: Rarity = this;
        if (i === Rarity.common) {
            return R.color.flatDarkGreen;
        }
        if (i === Rarity.uncommon) {
            return R.color.flatBlue;
        }
        if (i === Rarity.rare) {
            return R.color.flatPurple;
        }
        if (i === Rarity.legendary) {
            return R.color.flatYellowDark;
        }
        throw new NoWhenBranchMatchedException();
    }
    getTitle(): string {
        let i: Rarity = this;
        if (i === Rarity.common) {
            return Utils.INSTANCE.getString(R.string.Banner_Type_Common);
        }
        if (i === Rarity.uncommon) {
            return Utils.INSTANCE.getString(R.string.Banner_Type_Uncommon);
        }
        if (i === Rarity.rare) {
            return Utils.INSTANCE.getString(R.string.Banner_Type_Rare);
        }
        if (i === Rarity.legendary) {
            return Utils.INSTANCE.getString(R.string.Banner_Type_Legendary);
        }
        throw new NoWhenBranchMatchedException();
    }
}
