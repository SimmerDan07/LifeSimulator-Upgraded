// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class MoneyDestination extends JEnum {
    static readonly cash: MoneyDestination = new MoneyDestination("cash", 0);
    static readonly savings: MoneyDestination = new MoneyDestination("savings", 1);
    static values(): MoneyDestination[] { return [MoneyDestination.cash, MoneyDestination.savings]; }
    static valueOf(n: string): MoneyDestination { return (MoneyDestination as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
