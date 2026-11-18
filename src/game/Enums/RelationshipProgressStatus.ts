// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { GameStateManager } from "../Managers/GameStateManager";
import { Perk } from "./Perk";
import { ProgressBarCellViewModel } from "../Models/ProgressBarCellViewModel";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { Relationship } from "./Relationship";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";

export class RelationshipProgressStatus extends JEnum {
    static readonly distant: RelationshipProgressStatus = new RelationshipProgressStatus("distant", 0);
    static readonly lacking: RelationshipProgressStatus = new RelationshipProgressStatus("lacking", 1);
    static readonly good: RelationshipProgressStatus = new RelationshipProgressStatus("good", 2);
    static readonly close: RelationshipProgressStatus = new RelationshipProgressStatus("close", 3);
    static readonly besties: RelationshipProgressStatus = new RelationshipProgressStatus("besties", 4);
    static values(): RelationshipProgressStatus[] { return [RelationshipProgressStatus.distant, RelationshipProgressStatus.lacking, RelationshipProgressStatus.good, RelationshipProgressStatus.close, RelationshipProgressStatus.besties]; }
    static valueOf(n: string): RelationshipProgressStatus { return (RelationshipProgressStatus as any)[n]; }
    static INSTANCE: any;
    static maxValue: number;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getStartProgressValue(): number {
        let i: RelationshipProgressStatus = this;
        if (i === RelationshipProgressStatus.distant) {
            return 0;
        }
        if (i === RelationshipProgressStatus.lacking) {
            return 200;
        }
        if (i === RelationshipProgressStatus.good) {
            return 400;
        }
        if (i === RelationshipProgressStatus.close) {
            return 600;
        }
        if (i === RelationshipProgressStatus.besties) {
            return 800;
        }
        throw new NoWhenBranchMatchedException();
    }
    getAllowance(): number {
        let i: RelationshipProgressStatus = this;
        if (i === RelationshipProgressStatus.distant) {
            return 0;
        }
        if (i === RelationshipProgressStatus.lacking) {
            return 5;
        }
        if (i === RelationshipProgressStatus.good) {
            return 10;
        }
        if (i === RelationshipProgressStatus.close) {
            return 20;
        }
        if (i === RelationshipProgressStatus.besties) {
            return 30;
        }
        throw new NoWhenBranchMatchedException();
    }
    getInheritance(): number {
        let i: RelationshipProgressStatus = this;
        if (i === RelationshipProgressStatus.distant) {
            return 1;
        }
        if (i === RelationshipProgressStatus.lacking) {
            return Utils.Random.INSTANCE.randomValueWithinRange(10000, 30000);
        }
        if (i === RelationshipProgressStatus.good) {
            return Utils.Random.INSTANCE.randomValueWithinRange(30000, 80000);
        }
        if (i === RelationshipProgressStatus.close) {
            return Utils.Random.INSTANCE.randomValueWithinRange(80000, 150000);
        }
        if (i === RelationshipProgressStatus.besties) {
            return Utils.Random.INSTANCE.randomValueWithinRange(250000, 1000000);
        }
        throw new NoWhenBranchMatchedException();
    }
    getColor(): number {
        let i: RelationshipProgressStatus = this;
        if (i === RelationshipProgressStatus.distant) {
            return R.color.flatRed;
        }
        if (i === RelationshipProgressStatus.lacking) {
            return R.color.flatOrange;
        }
        if ((i === RelationshipProgressStatus.good) || (i === RelationshipProgressStatus.close)) {
            return R.color.flatGreen;
        }
        if (i === RelationshipProgressStatus.besties) {
            return R.color.flatPurple;
        }
        throw new NoWhenBranchMatchedException();
    }
    title(relationship: Relationship): string {
        Intrinsics.checkParameterIsNotNull(relationship, "relationship");
        let i: Relationship = relationship;
        if ((i === Relationship.parent) || (i === Relationship.child)) {
            let i2: RelationshipProgressStatus = this;
            if (i2 === RelationshipProgressStatus.distant) {
                return Utils.INSTANCE.getString(R.string.ParentRelationship_Distant);
            }
            if (i2 === RelationshipProgressStatus.lacking) {
                return Utils.INSTANCE.getString(R.string.ParentRelationship_Lacking);
            }
            if (i2 === RelationshipProgressStatus.good) {
                return Utils.INSTANCE.getString(R.string.ParentRelationship_Good);
            }
            if (i2 === RelationshipProgressStatus.close) {
                return Utils.INSTANCE.getString(R.string.ParentRelationship_Close);
            }
            if (i2 === RelationshipProgressStatus.besties) {
                return Utils.INSTANCE.getString(R.string.ParentRelationship_Besties);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === Relationship.lover) {
            let i3: RelationshipProgressStatus = this;
            if (i3 === RelationshipProgressStatus.distant) {
                return Utils.INSTANCE.getString(R.string.RomanticRelationship_Distant);
            }
            if (i3 === RelationshipProgressStatus.lacking) {
                return Utils.INSTANCE.getString(R.string.RomanticRelationship_Lacking);
            }
            if (i3 === RelationshipProgressStatus.good) {
                return Utils.INSTANCE.getString(R.string.RomanticRelationship_Good);
            }
            if (i3 === RelationshipProgressStatus.close) {
                return Utils.INSTANCE.getString(R.string.RomanticRelationship_Close);
            }
            if (i3 === RelationshipProgressStatus.besties) {
                return Utils.INSTANCE.getString(R.string.RomanticRelationship_Besties);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i !== Relationship.pet) {
            if (i === Relationship.self) {
                return "";
            }
            throw new NoWhenBranchMatchedException();
        }
        let i4: RelationshipProgressStatus = this;
        if (i4 === RelationshipProgressStatus.distant) {
            return Utils.INSTANCE.getString(R.string.PetRelationship_Distant);
        }
        if (i4 === RelationshipProgressStatus.lacking) {
            return Utils.INSTANCE.getString(R.string.PetRelationship_Lacking);
        }
        if (i4 === RelationshipProgressStatus.good) {
            return Utils.INSTANCE.getString(R.string.PetRelationship_Good);
        }
        if (i4 === RelationshipProgressStatus.close) {
            return Utils.INSTANCE.getString(R.string.PetRelationship_Close);
        }
        if (i4 === RelationshipProgressStatus.besties) {
            return Utils.INSTANCE.getString(R.string.PetRelationship_Besties);
        }
        throw new NoWhenBranchMatchedException();
    }
    getDeathReasonForStatus(): string {
        let i: RelationshipProgressStatus = this;
        if (i === RelationshipProgressStatus.distant) {
            return Utils.INSTANCE.getString(R.string.FamilyAlert_DeathAltitudeVeryRegretful);
        }
        if (i === RelationshipProgressStatus.lacking) {
            return Utils.INSTANCE.getString(R.string.FamilyAlert_DeathAltitudeRegret);
        }
        if (i === RelationshipProgressStatus.good) {
            return Utils.INSTANCE.getString(R.string.FamilyAlert_DeathAltitudeMoreEffort);
        }
        if (i === RelationshipProgressStatus.close) {
            return Utils.INSTANCE.getString(R.string.FamilyAlert_DeathAltitudeNoRegret);
        }
        if (i === RelationshipProgressStatus.besties) {
            return Utils.INSTANCE.getString(R.string.FamilyAlert_DeathAltitudeBestFriend);
        }
        throw new NoWhenBranchMatchedException();
    }
}
export namespace RelationshipProgressStatus {
    export class Companion {
        $init0(): void {
    }
        $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 1) return (this as any).$init1(...a);
            if (a.length === 0) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        getWeeklyDeteriorationRate(): number {
        // v0.12.1: halved (was -2, or -3 if Apathetic) — relationships fell apart far too fast
        let i: number = GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.apathetic) ? -2 : -1;
        return GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.emotionalIntelligence) ? (i + 1) : i;
    }
        getMaxValue(): number {
        return RelationshipProgressStatus.maxValue;
    }
        statusFromValue(value: number): RelationshipProgressStatus {
        if (value < RelationshipProgressStatus.lacking.getStartProgressValue()) {
            return RelationshipProgressStatus.distant;
        }
        if ((value >= RelationshipProgressStatus.lacking.getStartProgressValue()) && (value < RelationshipProgressStatus.good.getStartProgressValue())) {
            return RelationshipProgressStatus.lacking;
        }
        if ((value >= RelationshipProgressStatus.good.getStartProgressValue()) && (value < RelationshipProgressStatus.close.getStartProgressValue())) {
            return RelationshipProgressStatus.good;
        }
        if ((value >= RelationshipProgressStatus.close.getStartProgressValue()) && (value < RelationshipProgressStatus.besties.getStartProgressValue())) {
            return RelationshipProgressStatus.close;
        }
        return RelationshipProgressStatus.besties;
    }
        getProgressBarViewModel(progress: number): BaseViewModel {
        return new ProgressBarCellViewModel("GenericProgressBar", new ProgressBarViewModel(progress, this.getMaxValue(), true, false, 8, null));
    }
    }
}
RelationshipProgressStatus.INSTANCE = new RelationshipProgressStatus.Companion(null);
RelationshipProgressStatus.maxValue = 1000;
