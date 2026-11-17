// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Double, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Perk } from "./Perk";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";

export class HealthStatus extends JEnum {
    static readonly good: HealthStatus = new HealthStatus("good", 0);
    static readonly okay: HealthStatus = new HealthStatus("okay", 1);
    static readonly declining: HealthStatus = new HealthStatus("declining", 2);
    static readonly weak: HealthStatus = new HealthStatus("weak", 3);
    static readonly veryWeak: HealthStatus = new HealthStatus("veryWeak", 4);
    static readonly failing: HealthStatus = new HealthStatus("failing", 5);
    static readonly bedBound: HealthStatus = new HealthStatus("bedBound", 6);
    static readonly deathBed: HealthStatus = new HealthStatus("deathBed", 7);
    static values(): HealthStatus[] { return [HealthStatus.good, HealthStatus.okay, HealthStatus.declining, HealthStatus.weak, HealthStatus.veryWeak, HealthStatus.failing, HealthStatus.bedBound, HealthStatus.deathBed]; }
    static valueOf(n: string): HealthStatus { return (HealthStatus as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getHealthModifier(): number {
        let d: number;
        switch (this) {
            case HealthStatus.good:
                d = 0.0;
                break;
            case HealthStatus.okay:
                d = -1.0;
                break;
            case HealthStatus.declining:
                d = -3.0;
                break;
            case HealthStatus.weak:
                d = -4.0;
                break;
            case HealthStatus.veryWeak:
                d = -10.0;
                break;
            case HealthStatus.failing:
                d = -20.0;
                break;
            case HealthStatus.bedBound:
                d = -40.0;
                break;
            case HealthStatus.deathBed:
                d = -50.0;
                break;
            default:
                throw new NoWhenBranchMatchedException();
        }
        if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.goodHealth)) {
            let d2: number = 1;
            Double.isNaN(d2);
            d += d2;
        }
        return GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.strongImmuneSystem) ? (d + Trait.INSTANCE.getStrongImmuneSystemModifier()) : d;
    }
    getTitle(): string {
        switch (this) {
            case HealthStatus.good:
                return Utils.INSTANCE.getString(R.string.Health_Status_Good);
            case HealthStatus.okay:
                return Utils.INSTANCE.getString(R.string.Health_Status_Okay);
            case HealthStatus.declining:
                return Utils.INSTANCE.getString(R.string.Health_Status_Declining);
            case HealthStatus.weak:
                return Utils.INSTANCE.getString(R.string.Health_Status_Weak);
            case HealthStatus.veryWeak:
                return Utils.INSTANCE.getString(R.string.Health_Status_VeryWeak);
            case HealthStatus.failing:
                return Utils.INSTANCE.getString(R.string.Health_Status_Failing);
            case HealthStatus.bedBound:
                return Utils.INSTANCE.getString(R.string.Health_Status_BedBound);
            case HealthStatus.deathBed:
                return Utils.INSTANCE.getString(R.string.Health_Status_Dying);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getColorId(): number {
        switch (this) {
            case HealthStatus.good:
            case HealthStatus.okay:
                return R.color.flatGreen;
            case HealthStatus.declining:
            case HealthStatus.weak:
            case HealthStatus.veryWeak:
                return R.color.flatOrange;
            case HealthStatus.failing:
            case HealthStatus.bedBound:
            case HealthStatus.deathBed:
                return R.color.flatRed;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
export namespace HealthStatus {
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
        getStatus(ageInYears: number): HealthStatus {
        if (ageInYears < 50) {
            return HealthStatus.good;
        }
        if (ageInYears < 60) {
            return HealthStatus.okay;
        }
        if (ageInYears < 70) {
            return HealthStatus.declining;
        }
        if (ageInYears < 80) {
            return HealthStatus.weak;
        }
        if (ageInYears < 90) {
            return HealthStatus.veryWeak;
        }
        if (ageInYears < 100) {
            return HealthStatus.failing;
        }
        if (ageInYears < 110) {
            return HealthStatus.bedBound;
        }
        return HealthStatus.deathBed;
    }
    }
}
HealthStatus.INSTANCE = new HealthStatus.Companion(null);
