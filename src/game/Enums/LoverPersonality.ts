// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { IProbableEvent } from "./IProbableEvent";
import { Modifiers } from "../Managers/Modifiers";
import { Utils } from "../Utils/Utils";

export class LoverPersonality extends JEnum implements IProbableEvent {
    static readonly partyAnimal: LoverPersonality = new LoverPersonality("partyAnimal", 0);
    static readonly bookWorm: LoverPersonality = new LoverPersonality("bookWorm", 1);
    static readonly careerDriven: LoverPersonality = new LoverPersonality("careerDriven", 2);
    static readonly highMaintenance: LoverPersonality = new LoverPersonality("highMaintenance", 3);
    static readonly soulMate: LoverPersonality = new LoverPersonality("soulMate", 4);
    static readonly sugarMama: LoverPersonality = new LoverPersonality("sugarMama", 5);
    static readonly lazy: LoverPersonality = new LoverPersonality("lazy", 6);
    static readonly optimist: LoverPersonality = new LoverPersonality("optimist", 7);
    static readonly cheerful: LoverPersonality = new LoverPersonality("cheerful", 8);
    static readonly abusive: LoverPersonality = new LoverPersonality("abusive", 9);
    static values(): LoverPersonality[] { return [LoverPersonality.partyAnimal, LoverPersonality.bookWorm, LoverPersonality.careerDriven, LoverPersonality.highMaintenance, LoverPersonality.soulMate, LoverPersonality.sugarMama, LoverPersonality.lazy, LoverPersonality.optimist, LoverPersonality.cheerful, LoverPersonality.abusive]; }
    static valueOf(n: string): LoverPersonality { return (LoverPersonality as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getRelativeProbability(): number {
        switch (this) {
            case LoverPersonality.partyAnimal:
            case LoverPersonality.highMaintenance:
            case LoverPersonality.lazy:
            case LoverPersonality.optimist:
                return 10;
            case LoverPersonality.bookWorm:
            case LoverPersonality.careerDriven:
                return 15;
            case LoverPersonality.soulMate:
                return 2;
            case LoverPersonality.sugarMama:
                return 7;
            case LoverPersonality.cheerful:
            case LoverPersonality.abusive:
                return 5;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getModifiers(): Modifiers {
        switch (this) {
            case LoverPersonality.partyAnimal:
                return new Modifiers(0.0, 1.0, -1.0);
            case LoverPersonality.bookWorm:
                return new Modifiers(0.0, 0.0, 1.0);
            case LoverPersonality.careerDriven:
                return new Modifiers(0.0, 0.0, 1.0);
            case LoverPersonality.highMaintenance:
                return new Modifiers(0.0, 1.0, 0.0);
            case LoverPersonality.soulMate:
                return new Modifiers(0.0, 1.0, 1.0);
            case LoverPersonality.sugarMama:
                return new Modifiers(0.0, 0.0, -1.0);
            case LoverPersonality.lazy:
                return new Modifiers(0.0, 0.0, 0.0);
            case LoverPersonality.optimist:
                return new Modifiers(0.0, 0.0, 1.0);
            case LoverPersonality.cheerful:
                return new Modifiers(0.0, 1.0, 0.0);
            case LoverPersonality.abusive:
                return new Modifiers(0.0, -1.0, -1.0);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getCost(): number {
        switch (this) {
            case LoverPersonality.partyAnimal:
                return -100;
            case LoverPersonality.bookWorm:
            case LoverPersonality.soulMate:
            case LoverPersonality.optimist:
            case LoverPersonality.cheerful:
            case LoverPersonality.abusive:
                return 0;
            case LoverPersonality.careerDriven:
                return 100;
            case LoverPersonality.highMaintenance:
                return -250;
            case LoverPersonality.sugarMama:
                return 250;
            case LoverPersonality.lazy:
                return -50;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getTitle(): string {
        switch (this) {
            case LoverPersonality.partyAnimal:
                return Utils.INSTANCE.getString(R.string.Love_Partner_PartyAnimal);
            case LoverPersonality.bookWorm:
                return Utils.INSTANCE.getString(R.string.Love_Partner_Bookworm);
            case LoverPersonality.careerDriven:
                return Utils.INSTANCE.getString(R.string.Love_Partner_CareerDriven);
            case LoverPersonality.highMaintenance:
                return Utils.INSTANCE.getString(R.string.Love_Partner_HighMaintenance);
            case LoverPersonality.soulMate:
                return Utils.INSTANCE.getString(R.string.Love_Partner_Soulmate);
            case LoverPersonality.sugarMama:
                return Utils.INSTANCE.getString(R.string.Love_Partner_Sugar_mama);
            case LoverPersonality.lazy:
                return Utils.INSTANCE.getString(R.string.Love_Partner_Lazy);
            case LoverPersonality.optimist:
                return Utils.INSTANCE.getString(R.string.Love_Partner_Optimist);
            case LoverPersonality.cheerful:
                return Utils.INSTANCE.getString(R.string.Love_Partner_Cheerful);
            case LoverPersonality.abusive:
                return Utils.INSTANCE.getString(R.string.Love_Partner_Abusive);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
