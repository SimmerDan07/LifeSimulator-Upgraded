// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, JMath, NoWhenBranchMatchedException } from "../runtime";
import { PlayerActionType } from "./PlayerActionType";
import { RelationshipProgressStatus } from "./RelationshipProgressStatus";

export class Relationship extends JEnum {
    static readonly parent: Relationship = new Relationship("parent", 0);
    static readonly lover: Relationship = new Relationship("lover", 1);
    static readonly child: Relationship = new Relationship("child", 2);
    static readonly pet: Relationship = new Relationship("pet", 3);
    static readonly self: Relationship = new Relationship("self", 4);
    static values(): Relationship[] { return [Relationship.parent, Relationship.lover, Relationship.child, Relationship.pet, Relationship.self]; }
    static valueOf(n: string): Relationship { return (Relationship as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getCorrespondingActionType(): PlayerActionType {
        let i: Relationship = this;
        if (i === Relationship.lover) {
            return PlayerActionType.love;
        }
        if (i === Relationship.child) {
            return PlayerActionType.child;
        }
        if (i === Relationship.pet) {
            return PlayerActionType.pet;
        }
        if (i === Relationship.parent) {
            return PlayerActionType.parent;
        }
        return PlayerActionType.none;
    }
    getStartingRelationshipProgress(): number {
        let i: Relationship = this;
        if (i === Relationship.parent) {
            return RelationshipProgressStatus.good.getStartProgressValue();
        }
        if (i === Relationship.lover) {
            return JMath.idiv(RelationshipProgressStatus.lacking.getStartProgressValue(), 2);
        }
        if (i === Relationship.child) {
            return JMath.idiv(RelationshipProgressStatus.lacking.getStartProgressValue(), 2);
        }
        if (i === Relationship.pet) {
            return RelationshipProgressStatus.lacking.getStartProgressValue();
        }
        if (i === Relationship.self) {
            return 0;
        }
        throw new NoWhenBranchMatchedException();
    }
}
