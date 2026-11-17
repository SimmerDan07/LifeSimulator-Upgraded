// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException } from "../runtime";
import { MainGameTab } from "./MainGameTab";

export class CompletableActionType extends JEnum {
    static readonly education: CompletableActionType = new CompletableActionType("education", 0);
    static readonly skill: CompletableActionType = new CompletableActionType("skill", 1);
    static readonly philanthrophy: CompletableActionType = new CompletableActionType("philanthrophy", 2);
    static values(): CompletableActionType[] { return [CompletableActionType.education, CompletableActionType.skill, CompletableActionType.philanthrophy]; }
    static valueOf(n: string): CompletableActionType { return (CompletableActionType as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getAssociatedTab(): MainGameTab {
        let i: CompletableActionType = this;
        if (i === CompletableActionType.education) {
            return MainGameTab.Education;
        }
        if (i === CompletableActionType.skill) {
            return MainGameTab.Education;
        }
        if (i === CompletableActionType.philanthrophy) {
            return MainGameTab.Bank;
        }
        throw new NoWhenBranchMatchedException();
    }
}
