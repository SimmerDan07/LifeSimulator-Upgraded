// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Integer, JEnum, JMath, NoWhenBranchMatchedException, R } from "../runtime";
import { RelationshipProgressStatus } from "./RelationshipProgressStatus";
import { Utils } from "../Utils/Utils";

export class RomanticRelationshipStatus extends JEnum {
    static readonly single: RomanticRelationshipStatus = new RomanticRelationshipStatus("single", 0);
    static readonly inRelationship: RomanticRelationshipStatus = new RomanticRelationshipStatus("inRelationship", 1);
    static readonly engaged: RomanticRelationshipStatus = new RomanticRelationshipStatus("engaged", 2);
    static readonly married: RomanticRelationshipStatus = new RomanticRelationshipStatus("married", 3);
    static readonly widowed: RomanticRelationshipStatus = new RomanticRelationshipStatus("widowed", 4);
    static values(): RomanticRelationshipStatus[] { return [RomanticRelationshipStatus.single, RomanticRelationshipStatus.inRelationship, RomanticRelationshipStatus.engaged, RomanticRelationshipStatus.married, RomanticRelationshipStatus.widowed]; }
    static valueOf(n: string): RomanticRelationshipStatus { return (RomanticRelationshipStatus as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        let i: RomanticRelationshipStatus = this;
        if (i === RomanticRelationshipStatus.single) {
            return Utils.INSTANCE.getString(R.string.Love_Status_Single);
        }
        if (i === RomanticRelationshipStatus.inRelationship) {
            return Utils.INSTANCE.getString(R.string.Love_Status_InARelationship);
        }
        if (i === RomanticRelationshipStatus.engaged) {
            return Utils.INSTANCE.getString(R.string.Love_Status_Engaged);
        }
        if (i === RomanticRelationshipStatus.married) {
            return Utils.INSTANCE.getString(R.string.Love_Status_Married);
        }
        if (i === RomanticRelationshipStatus.widowed) {
            return Utils.INSTANCE.getString(R.string.Love_Status_Widowed);
        }
        throw new NoWhenBranchMatchedException();
    }
    getWarningForBreakupThreshold(): number {
        let i: RomanticRelationshipStatus = this;
        if (i === RomanticRelationshipStatus.single) {
            return null;
        }
        if (i === RomanticRelationshipStatus.inRelationship) {
            return Integer.valueOf(JMath.idiv(RelationshipProgressStatus.lacking.getStartProgressValue(), 4));
        }
        if (i === RomanticRelationshipStatus.engaged) {
            return Integer.valueOf(JMath.idiv(RelationshipProgressStatus.lacking.getStartProgressValue(), 2));
        }
        if (i === RomanticRelationshipStatus.married) {
            return Integer.valueOf(RelationshipProgressStatus.lacking.getStartProgressValue());
        }
        if (i === RomanticRelationshipStatus.widowed) {
            return null;
        }
        throw new NoWhenBranchMatchedException();
    }
}
