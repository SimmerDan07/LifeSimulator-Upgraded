// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics, JEnum, NoWhenBranchMatchedException } from "../runtime";
import { AlertManager } from "../Managers/AlertManager";
import { IProbableEvent } from "./IProbableEvent";
import { Person } from "../Managers/Person";

export class PregnancyOutcome extends JEnum implements IProbableEvent {
    static readonly normalBirth: PregnancyOutcome = new PregnancyOutcome("normalBirth", 0);
    static readonly twins: PregnancyOutcome = new PregnancyOutcome("twins", 1);
    static readonly triplets: PregnancyOutcome = new PregnancyOutcome("triplets", 2);
    static readonly miscarriage: PregnancyOutcome = new PregnancyOutcome("miscarriage", 3);
    static values(): PregnancyOutcome[] { return [PregnancyOutcome.normalBirth, PregnancyOutcome.twins, PregnancyOutcome.triplets, PregnancyOutcome.miscarriage]; }
    static valueOf(n: string): PregnancyOutcome { return (PregnancyOutcome as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getRelativeProbability(): number {
        let i: PregnancyOutcome = this;
        if (i === PregnancyOutcome.normalBirth) {
            return 1000;
        }
        if (i === PregnancyOutcome.twins) {
            return 20;
        }
        if (i === PregnancyOutcome.triplets) {
            return 5;
        }
        if (i === PregnancyOutcome.miscarriage) {
            return 100;
        }
        throw new NoWhenBranchMatchedException();
    }
    showAlertForOutcome(child: Person): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        let i: PregnancyOutcome = this;
        if (i === PregnancyOutcome.normalBirth) {
            AlertManager.INSTANCE.showBabyBornAlert(child, false);
            return;
        }
        if ((i === PregnancyOutcome.twins) || (i === PregnancyOutcome.triplets)) {
            AlertManager.INSTANCE.showBabyTwinOrTripletBorn(child, this);
        } else {
            if (i !== PregnancyOutcome.miscarriage) {
                return;
            }
            AlertManager.INSTANCE.showMiscarriage(child);
        }
    }
}
