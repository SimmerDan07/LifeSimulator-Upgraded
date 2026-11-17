// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class DebugFlag extends JEnum {
    static readonly unlockAllScenarios: DebugFlag = new DebugFlag("unlockAllScenarios", 0);
    static readonly unlockAllPerks: DebugFlag = new DebugFlag("unlockAllPerks", 1);
    static readonly turnOffRandomEvents: DebugFlag = new DebugFlag("turnOffRandomEvents", 2);
    static readonly unlockAllCountries: DebugFlag = new DebugFlag("unlockAllCountries", 3);
    static readonly startWithAlotOfMoney: DebugFlag = new DebugFlag("startWithAlotOfMoney", 4);
    static readonly simulateParentDeath: DebugFlag = new DebugFlag("simulateParentDeath", 5);
    static values(): DebugFlag[] { return [DebugFlag.unlockAllScenarios, DebugFlag.unlockAllPerks, DebugFlag.turnOffRandomEvents, DebugFlag.unlockAllCountries, DebugFlag.startWithAlotOfMoney, DebugFlag.simulateParentDeath]; }
    static valueOf(n: string): DebugFlag { return (DebugFlag as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getEnabled(): boolean {
        return false;
    }
}
