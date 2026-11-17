// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Intrinsics, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { ActionDescriptor } from "./ActionDescriptor";
import { CompletableAction } from "./CompletableAction";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";

export class HealthEvent extends JEnum implements ActionDescriptor {
    static readonly mindfulMeditation: HealthEvent = new HealthEvent("mindfulMeditation", 0);
    static readonly takeAntidepressantPills: HealthEvent = new HealthEvent("takeAntidepressantPills", 1);
    static readonly selfTreatment: HealthEvent = new HealthEvent("selfTreatment", 2);
    static readonly doctorVisit: HealthEvent = new HealthEvent("doctorVisit", 3);
    static readonly hospitalStay: HealthEvent = new HealthEvent("hospitalStay", 4);
    static readonly experimentalTreatment: HealthEvent = new HealthEvent("experimentalTreatment", 5);
    static readonly elixirOfYouth: HealthEvent = new HealthEvent("elixirOfYouth", 6);
    static readonly workOut: HealthEvent = new HealthEvent("workOut", 7);
    static readonly contrabandPills: HealthEvent = new HealthEvent("contrabandPills", 8);
    static readonly psychiatristVisit: HealthEvent = new HealthEvent("psychiatristVisit", 9);
    static readonly chemotherapy: HealthEvent = new HealthEvent("chemotherapy", 10);
    static readonly chooseMenu: HealthEvent = new HealthEvent("chooseMenu", 11);
    static values(): HealthEvent[] { return [HealthEvent.mindfulMeditation, HealthEvent.takeAntidepressantPills, HealthEvent.selfTreatment, HealthEvent.doctorVisit, HealthEvent.hospitalStay, HealthEvent.experimentalTreatment, HealthEvent.elixirOfYouth, HealthEvent.workOut, HealthEvent.contrabandPills, HealthEvent.psychiatristVisit, HealthEvent.chemotherapy, HealthEvent.chooseMenu]; }
    static valueOf(n: string): HealthEvent { return (HealthEvent as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getAdditionalDescription(): string {
        return ActionDescriptor.DefaultImpls.getAdditionalDescription(this);
    }
    getAgeRange(): ValueRange {
        return ActionDescriptor.DefaultImpls.getAgeRange(this);
    }
    getRequiredItem(): Possession {
        return ActionDescriptor.DefaultImpls.getRequiredItem(this);
    }
    overrideCost(metadata: any): BigInteger {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return ActionDescriptor.DefaultImpls.overrideCost(this, metadata);
    }
    overrideImageId(metadata: any): number {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return ActionDescriptor.DefaultImpls.overrideImageId(this, metadata);
    }
    overrideTitle(metadata: any): string {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return ActionDescriptor.DefaultImpls.overrideTitle(this, metadata);
    }
    requirementNotMetString(player: Player): string {
        Intrinsics.checkParameterIsNotNull(player, "player");
        return ActionDescriptor.DefaultImpls.requirementNotMetString(this, player);
    }
    getTitle(): string {
        switch (this) {
            case HealthEvent.mindfulMeditation:
                return Utils.INSTANCE.getString(R.string.Health_MindfulMeditaton);
            case HealthEvent.takeAntidepressantPills:
                return Utils.INSTANCE.getString(R.string.Health_TakeAntidepressant);
            case HealthEvent.selfTreatment:
                return Utils.INSTANCE.getString(R.string.Health_SelfTreatment);
            case HealthEvent.doctorVisit:
                return Utils.INSTANCE.getString(R.string.Health_DoctorVisit);
            case HealthEvent.hospitalStay:
                return Utils.INSTANCE.getString(R.string.Health_HospitalStay);
            case HealthEvent.experimentalTreatment:
                return Utils.INSTANCE.getString(R.string.Health_ExperimentalTreatment);
            case HealthEvent.elixirOfYouth:
                return Utils.INSTANCE.getString(R.string.Health_ElixirOfYouth);
            case HealthEvent.workOut:
                return Utils.INSTANCE.getString(R.string.Health_WorkOut);
            case HealthEvent.contrabandPills:
                return Utils.INSTANCE.getString(R.string.Health_ContrabandPills);
            case HealthEvent.psychiatristVisit:
                return Utils.INSTANCE.getString(R.string.HealthVisit_VisitPsychiatrist);
            case HealthEvent.chemotherapy:
                return Utils.INSTANCE.getString(R.string.HealthVisit_Chemotherapy);
            case HealthEvent.chooseMenu:
                return Utils.INSTANCE.getString(R.string.HealthVisit_ChooseMenu);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case HealthEvent.mindfulMeditation:
                return R.drawable.health_meditation;
            case HealthEvent.takeAntidepressantPills:
                return R.drawable.health_takeantidepressant;
            case HealthEvent.selfTreatment:
                return R.drawable.health_selftreatment;
            case HealthEvent.doctorVisit:
                return R.drawable.health_doctorvisit;
            case HealthEvent.hospitalStay:
                return R.drawable.health_hospitalstay;
            case HealthEvent.experimentalTreatment:
                return R.drawable.health_experimentaltreatment;
            case HealthEvent.elixirOfYouth:
                return R.drawable.health_youthelixir;
            case HealthEvent.workOut:
                return R.drawable.health_workout;
            case HealthEvent.contrabandPills:
                return R.drawable.health_pills;
            case HealthEvent.psychiatristVisit:
                return R.drawable.health_psychologist;
            case HealthEvent.chemotherapy:
                return R.drawable.health_chemotherapy;
            case HealthEvent.chooseMenu:
                return R.drawable.health_choosemenu;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getCost(): BigInteger {
        switch (this) {
            case HealthEvent.mindfulMeditation:
                let valueOf: BigInteger = BigInteger.valueOf(0);
                return valueOf;
            case HealthEvent.takeAntidepressantPills:
                let valueOf2: BigInteger = BigInteger.valueOf(50);
                return valueOf2;
            case HealthEvent.selfTreatment:
                let valueOf3: BigInteger = BigInteger.valueOf(50);
                return valueOf3;
            case HealthEvent.doctorVisit:
                let valueOf4: BigInteger = BigInteger.valueOf(1000);
                return valueOf4;
            case HealthEvent.hospitalStay:
                let valueOf5: BigInteger = BigInteger.valueOf(3000);
                return valueOf5;
            case HealthEvent.experimentalTreatment:
                let valueOf6: BigInteger = BigInteger.valueOf(20000);
                return valueOf6;
            case HealthEvent.elixirOfYouth:
                let numberOfLifeElixirsBought: number = GameStateManager.INSTANCE.getPersonState().getMiscState().getNumberOfLifeElixirsBought();
                let i: number = 1;
                if (numberOfLifeElixirsBought > 0) {
                    for (let i2 = 0; i2 < numberOfLifeElixirsBought; i2++) {
                        i *= 2;
                    }
                }
                let valueOf7: BigInteger = BigInteger.valueOf(i);
                let valueOf8: BigInteger = BigInteger.valueOf(20000000);
                let multiply: BigInteger = valueOf7.multiply(valueOf8);
                return multiply;
            case HealthEvent.workOut:
                let valueOf9: BigInteger = BigInteger.valueOf(0);
                return valueOf9;
            case HealthEvent.contrabandPills:
                let valueOf10: BigInteger = BigInteger.valueOf(2000);
                return valueOf10;
            case HealthEvent.psychiatristVisit:
                let valueOf11: BigInteger = BigInteger.valueOf(2000);
                return valueOf11;
            case HealthEvent.chemotherapy:
                let valueOf12: BigInteger = BigInteger.valueOf(25000);
                return valueOf12;
            case HealthEvent.chooseMenu:
                let valueOf13: BigInteger = BigInteger.valueOf(0);
                return valueOf13;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getModifiers(): Modifiers {
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        switch (this) {
            case HealthEvent.mindfulMeditation:
                return personState.getCompletableActionState().isCompleted(CompletableAction.meditationExpert) ? Modifiers.INSTANCE.modifierWithSanity(10.0) : Modifiers.INSTANCE.modifierWithSanity(5.0);
            case HealthEvent.takeAntidepressantPills:
                return new Modifiers(-2.0, 5.0, 0.0);
            case HealthEvent.selfTreatment:
                return personState.getCompletableActionState().isCompleted(CompletableAction.homeMedic) ? Modifiers.INSTANCE.modifierWithHealth(12.0) : Modifiers.INSTANCE.modifierWithHealth(8.0);
            case HealthEvent.doctorVisit:
                return Modifiers.INSTANCE.modifierWithHealth(20.0);
            case HealthEvent.hospitalStay:
                return Modifiers.INSTANCE.modifierWithHealth(30.0);
            case HealthEvent.experimentalTreatment:
                return Modifiers.INSTANCE.modifierWithHealth(40.0);
            case HealthEvent.elixirOfYouth:
                return Modifiers.INSTANCE.modifierWithHealth(100.0);
            case HealthEvent.workOut:
                return Modifiers.INSTANCE.modifierWithHealth(5.0);
            case HealthEvent.contrabandPills:
                return Modifiers.INSTANCE.modifierWithHealth(10.0);
            case HealthEvent.psychiatristVisit:
                return Modifiers.INSTANCE.modifierWithHappiness(20.0);
            case HealthEvent.chemotherapy:
                return Modifiers.INSTANCE.modifierWithHealth(-10.0);
            case HealthEvent.chooseMenu:
                return Modifiers.INSTANCE.modifierWithZero();
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getActionTitle(): string {
        if (this === HealthEvent.chooseMenu) {
            return Utils.INSTANCE.getString(R.string.Common_Choose);
        }
        return null;
    }
    action(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        player.healthAction(this);
    }
}
export namespace HealthEvent {
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
        eventsForPlayer(player: Player): HealthEvent[] {
        Intrinsics.checkParameterIsNotNull(player, "player");
        return [HealthEvent.mindfulMeditation, HealthEvent.takeAntidepressantPills, HealthEvent.selfTreatment, HealthEvent.doctorVisit, HealthEvent.hospitalStay, HealthEvent.experimentalTreatment, HealthEvent.elixirOfYouth];
    }
    }
}
HealthEvent.INSTANCE = new HealthEvent.Companion(null);
