// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class MoneyUpdateType extends JEnum {
    static readonly sell: MoneyUpdateType = new MoneyUpdateType("sell", 0);
    static readonly directSpend: MoneyUpdateType = new MoneyUpdateType("directSpend", 1);
    static readonly expense: MoneyUpdateType = new MoneyUpdateType("expense", 2);
    static readonly workIncome: MoneyUpdateType = new MoneyUpdateType("workIncome", 3);
    static readonly passiveIncome: MoneyUpdateType = new MoneyUpdateType("passiveIncome", 4);
    static readonly misc: MoneyUpdateType = new MoneyUpdateType("misc", 5);
    static values(): MoneyUpdateType[] { return [MoneyUpdateType.sell, MoneyUpdateType.directSpend, MoneyUpdateType.expense, MoneyUpdateType.workIncome, MoneyUpdateType.passiveIncome, MoneyUpdateType.misc]; }
    static valueOf(n: string): MoneyUpdateType { return (MoneyUpdateType as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
