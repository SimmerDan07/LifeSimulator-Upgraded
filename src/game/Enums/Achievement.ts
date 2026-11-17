// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Arrays, ArraysKt, BigInteger, CollectionsKt, ComparisonsKt, Double, Integer, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, StringCompanionObject } from "../runtime";
import { BusinessState } from "../Managers/BusinessState";
import { ChildAgeGroup } from "./ChildAgeGroup";
import { CompletableActionState } from "../Managers/CompletableActionState";
import { CompletableActionType } from "./CompletableActionType";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Person } from "../Managers/Person";
import { Player } from "../Managers/Player";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { Utils } from "../Utils/Utils";

export class Achievement extends JEnum {
    static readonly worldTraveler: Achievement = new Achievement("worldTraveler", 0);
    static readonly centenarian: Achievement = new Achievement("centenarian", 1);
    static readonly theHappyLife: Achievement = new Achievement("theHappyLife", 2);
    static readonly wealthCollector: Achievement = new Achievement("wealthCollector", 3);
    static readonly filialPiety: Achievement = new Achievement("filialPiety", 4);
    static readonly lifeOfCrime: Achievement = new Achievement("lifeOfCrime", 5);
    static readonly largeFamily: Achievement = new Achievement("largeFamily", 6);
    static readonly businessMagnet: Achievement = new Achievement("businessMagnet", 7);
    static readonly polyMath: Achievement = new Achievement("polyMath", 8);
    static readonly trueLegacy: Achievement = new Achievement("trueLegacy", 9);
    static readonly saviorOfHumanity: Achievement = new Achievement("saviorOfHumanity", 10);
    static readonly hallOfFame: Achievement = new Achievement("hallOfFame", 11);
    static readonly highAchiever: Achievement = new Achievement("highAchiever", 12);
    static readonly cancerSurvivor: Achievement = new Achievement("cancerSurvivor", 13);
    static readonly megaFan: Achievement = new Achievement("megaFan", 14);
    static values(): Achievement[] { return [Achievement.worldTraveler, Achievement.centenarian, Achievement.theHappyLife, Achievement.wealthCollector, Achievement.filialPiety, Achievement.lifeOfCrime, Achievement.largeFamily, Achievement.businessMagnet, Achievement.polyMath, Achievement.trueLegacy, Achievement.saviorOfHumanity, Achievement.hallOfFame, Achievement.highAchiever, Achievement.cancerSurvivor, Achievement.megaFan]; }
    static valueOf(n: string): Achievement { return (Achievement as any)[n]; }
    static INSTANCE: any;
    static worldTravelNumberOfTripsNeeded: number;
    static centenarianAge: number;
    static theHappyLifeTillAge: number;
    static theHappyLifeAverageHappiness: number;
    static filialPietyRelationship: number;
    static wealthCollectorMoney: number;
    static largeFamilynumberOfChildren: number;
    static trueLegacyNumberOfProjects: number;
    static highAchieverNumberOfBadges: number;
    static megaFanNumberOfStreaks: number;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case Achievement.worldTraveler:
                return Utils.INSTANCE.getString(R.string.Achievement_WorldTraveler_Title);
            case Achievement.centenarian:
                return Utils.INSTANCE.getString(R.string.Achievement_Centenarian_Title);
            case Achievement.theHappyLife:
                return Utils.INSTANCE.getString(R.string.Achievement_HappyLife_Title);
            case Achievement.wealthCollector:
                return Utils.INSTANCE.getString(R.string.Achievement_WealthCollector_Title);
            case Achievement.filialPiety:
                return Utils.INSTANCE.getString(R.string.Achievement_FilialPiety);
            case Achievement.lifeOfCrime:
                return Utils.INSTANCE.getString(R.string.Achievement_LifeOfCrime);
            case Achievement.largeFamily:
                return Utils.INSTANCE.getString(R.string.Achievement_LargeFamily);
            case Achievement.businessMagnet:
                return Utils.INSTANCE.getString(R.string.Achievement_BusinessMagnet);
            case Achievement.polyMath:
                return Utils.INSTANCE.getString(R.string.Achievement_Polymath_Title);
            case Achievement.trueLegacy:
                return Utils.INSTANCE.getString(R.string.Achievement_TrueLegacy_Title);
            case Achievement.saviorOfHumanity:
                return Utils.INSTANCE.getString(R.string.Achievement_SaviorOfHumanity_Title);
            case Achievement.hallOfFame:
                return Utils.INSTANCE.getString(R.string.Achievement_HallOfFame_Title);
            case Achievement.highAchiever:
                return Utils.INSTANCE.getString(R.string.Achievement_HighAchiever_Title);
            case Achievement.cancerSurvivor:
                return Utils.INSTANCE.getString(R.string.Achievement_CancerSurvivor_Title);
            case Achievement.megaFan:
                return Utils.INSTANCE.getString(R.string.Achievement_MegaFan_Title);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDescription(): string {
        switch (this) {
            case Achievement.worldTraveler:
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.Achievement_WorldTraveler_Description);
                let objArr = [Integer.valueOf(Achievement.worldTravelNumberOfTripsNeeded)];
                let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                return format;
            case Achievement.centenarian:
                let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                let string2: string = Utils.INSTANCE.getString(R.string.Achievement_Centenarian_Description);
                let objArr2 = [Integer.valueOf(Achievement.centenarianAge)];
                let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
                return format2;
            case Achievement.theHappyLife:
                let stringCompanionObject3 = StringCompanionObject.INSTANCE;
                let string3: string = Utils.INSTANCE.getString(R.string.Achievement_HappyLife_Description);
                let d: number = Achievement.theHappyLifeAverageHappiness;
                let d2: number = 100;
                Double.isNaN(d2);
                let objArr3 = [Integer.valueOf(JMath.toInt((d * d2))), Integer.valueOf(Achievement.theHappyLifeTillAge)];
                let format3: string = String.format(string3, Arrays.copyOf(objArr3, objArr3.length));
                return format3;
            case Achievement.wealthCollector:
                let stringCompanionObject4 = StringCompanionObject.INSTANCE;
                let string4: string = Utils.INSTANCE.getString(R.string.Achievement_WealthCollector_Description);
                let objArr4 = [ExtensionsKt.numberDisplayString$default(Achievement.wealthCollectorMoney, false, 1, null)];
                let format4: string = String.format(string4, Arrays.copyOf(objArr4, objArr4.length));
                return format4;
            case Achievement.filialPiety:
                let stringCompanionObject5 = StringCompanionObject.INSTANCE;
                let string5: string = Utils.INSTANCE.getString(R.string.Achievement_FilialPietyDescription);
                let d3: number = Achievement.filialPietyRelationship;
                let d4: number = 100;
                Double.isNaN(d4);
                let objArr5 = [Integer.valueOf(JMath.toInt((d3 * d4)))];
                let format5: string = String.format(string5, Arrays.copyOf(objArr5, objArr5.length));
                return format5;
            case Achievement.lifeOfCrime:
                return "";
            case Achievement.largeFamily:
                let stringCompanionObject6 = StringCompanionObject.INSTANCE;
                let string6: string = Utils.INSTANCE.getString(R.string.Achievement_LargeFamilyDescription);
                let objArr6 = [Integer.valueOf(Achievement.largeFamilynumberOfChildren)];
                let format6: string = String.format(string6, Arrays.copyOf(objArr6, objArr6.length));
                return format6;
            case Achievement.businessMagnet:
                let stringCompanionObject7 = StringCompanionObject.INSTANCE;
                let string7: string = Utils.INSTANCE.getString(R.string.Achievement_BusinessMagnetDescription);
                let objArr7 = [Integer.valueOf(Constants.Business.INSTANCE.getMaxLevel())];
                let format7: string = String.format(string7, Arrays.copyOf(objArr7, objArr7.length));
                return String.valueOf(format7);
            case Achievement.polyMath:
                return Utils.INSTANCE.getString(R.string.Achievement_Polymath_Description);
            case Achievement.trueLegacy:
                let stringCompanionObject8 = StringCompanionObject.INSTANCE;
                let string8: string = Utils.INSTANCE.getString(R.string.Achievement_TrueLegacyDescription);
                let objArr8 = [Integer.valueOf(Achievement.trueLegacyNumberOfProjects)];
                let format8: string = String.format(string8, Arrays.copyOf(objArr8, objArr8.length));
                return format8;
            case Achievement.saviorOfHumanity:
                return Utils.INSTANCE.getString(R.string.Achievement_SaviorOfHumanityDescription);
            case Achievement.hallOfFame:
                return Utils.INSTANCE.getString(R.string.Achievement_HallOfFame_Description);
            case Achievement.highAchiever:
                let stringCompanionObject9 = StringCompanionObject.INSTANCE;
                let string9: string = Utils.INSTANCE.getString(R.string.Achievement_HighAchiever_Description);
                let objArr9 = [Integer.valueOf(Achievement.highAchieverNumberOfBadges)];
                let format9: string = String.format(string9, Arrays.copyOf(objArr9, objArr9.length));
                return format9;
            case Achievement.cancerSurvivor:
                return Utils.INSTANCE.getString(R.string.Achievement_CancerSurvivor_Description);
            case Achievement.megaFan:
                let stringCompanionObject10 = StringCompanionObject.INSTANCE;
                let string10: string = Utils.INSTANCE.getString(R.string.Achievement_MegaFan_Description);
                let objArr10 = [Integer.valueOf(Achievement.megaFanNumberOfStreaks)];
                let format10: string = String.format(string10, Arrays.copyOf(objArr10, objArr10.length));
                return format10;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case Achievement.worldTraveler:
                return R.drawable.vacation_international;
            case Achievement.centenarian:
                return R.drawable.achievement_old;
            case Achievement.theHappyLife:
                return R.drawable.achievement_happy;
            case Achievement.wealthCollector:
                return R.drawable.achievement_money_collector;
            case Achievement.filialPiety:
                return R.drawable.family;
            case Achievement.lifeOfCrime:
                return R.drawable.theft_robbank;
            case Achievement.largeFamily:
                return R.drawable.achievement_bigfamily;
            case Achievement.businessMagnet:
                return R.drawable.business_software3;
            case Achievement.polyMath:
                return R.drawable.achievement_polymath;
            case Achievement.trueLegacy:
                return R.drawable.achievement_truelegacy;
            case Achievement.saviorOfHumanity:
                return R.drawable.achievement_savior;
            case Achievement.hallOfFame:
                return R.drawable.achievement_halloffame;
            case Achievement.highAchiever:
                return R.drawable.menu_badge;
            case Achievement.cancerSurvivor:
                return R.drawable.philanthrophy_cancer;
            case Achievement.megaFan:
                return 0;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getProgressState(player: Player): ProgressBarViewModel {
        let d: number;
        let d2: number;
        Intrinsics.checkParameterIsNotNull(player, "player");
        let i: number = 1;
        let i2: number = 0;
        switch (this) {
            case Achievement.worldTraveler:
                i2 = player.getMiscState().getTripsTaken();
                i = Achievement.worldTravelNumberOfTripsNeeded;
                break;
            case Achievement.centenarian:
                i2 = player.getAgeInYears();
                i = Achievement.centenarianAge;
                break;
            case Achievement.theHappyLife:
                let currentAverageHappiness: number = player.getMiscState().getCurrentAverageHappiness();
                d = 100;
                Double.isNaN(d);
                i2 = JMath.toInt((currentAverageHappiness * d));
                d2 = Achievement.theHappyLifeAverageHappiness;
                Double.isNaN(d);
                i = JMath.toInt((d2 * d));
                break;
            case Achievement.wealthCollector:
                let totalAsset: BigInteger = player.getMoneyState().getTotalAsset();
                let valueOf: BigInteger = BigInteger.valueOf(1000000);
                let divide: BigInteger = totalAsset.divide(valueOf);
                let j: number = Integer.MAX_VALUE;
                let valueOf2: BigInteger = BigInteger.valueOf(j);
                if (divide.compareTo(valueOf2) > 0) {
                    divide = BigInteger.valueOf(j);
                }
                i = JMath.idiv(Achievement.wealthCollectorMoney, 1000000);
                i2 = Math.min(divide.intValue(), i);
                break;
            case Achievement.filialPiety:
                let currentParentRelationship: number = player.getMiscState().getCurrentParentRelationship();
                d = 100;
                Double.isNaN(d);
                i2 = JMath.toInt((currentParentRelationship * d));
                d2 = Achievement.filialPietyRelationship;
                Double.isNaN(d);
                i = JMath.toInt((d2 * d));
                break;
            case Achievement.largeFamily:
                let aliveChildren: ArrayList<Person> = player.getFamilyState().getAliveChildren();
                let arrayList: ArrayList = new ArrayList();
                for (const obj of aliveChildren) {
                    if (((obj as unknown as Person)).getChildAgeGroup() === ChildAgeGroup.adult) {
                        arrayList.add(obj);
                    }
                }
                i2 = arrayList.size();
                i = Achievement.largeFamilynumberOfChildren;
                break;
            case Achievement.polyMath:
                let states: CompletableActionState.CompletableActionStateSingle[] = player.getCompletableActionState().getStates(CompletableActionType.education);
                let arrayList2: ArrayList = new ArrayList();
                let length: number = states.length;
                while (i2 < length) {
                    let completableActionStateSingle: CompletableActionState.CompletableActionStateSingle = states[i2];
                    if (completableActionStateSingle.getCompleted()) {
                        arrayList2.add(completableActionStateSingle);
                    }
                    i2++;
                }
                i2 = arrayList2.size();
                i = states.length;
                break;
            case Achievement.trueLegacy:
                let states2: CompletableActionState.CompletableActionStateSingle[] = player.getCompletableActionState().getStates(CompletableActionType.philanthrophy);
                let arrayList3: ArrayList = new ArrayList();
                let length2: number = states2.length;
                while (i2 < length2) {
                    let completableActionStateSingle2: CompletableActionState.CompletableActionStateSingle = states2[i2];
                    if (completableActionStateSingle2.getCompleted()) {
                        arrayList3.add(completableActionStateSingle2);
                    }
                    i2++;
                }
                i2 = arrayList3.size();
                i = Achievement.trueLegacyNumberOfProjects;
                break;
            case Achievement.saviorOfHumanity:
                let states3: CompletableActionState.CompletableActionStateSingle[] = player.getCompletableActionState().getStates(CompletableActionType.philanthrophy);
                let arrayList4: ArrayList = new ArrayList();
                let length3: number = states3.length;
                while (i2 < length3) {
                    let completableActionStateSingle3: CompletableActionState.CompletableActionStateSingle = states3[i2];
                    if (completableActionStateSingle3.getCompleted()) {
                        arrayList4.add(completableActionStateSingle3);
                    }
                    i2++;
                }
                i2 = arrayList4.size();
                i = states3.length;
                break;
            case Achievement.highAchiever:
                i2 = GameStateManager.INSTANCE.getGlobalStateManager().getAchievementBadgeState().completedBadges().length;
                i = Achievement.highAchieverNumberOfBadges;
                break;
            case Achievement.businessMagnet:
                i2 = ((CollectionsKt.last(ArraysKt.sortedWith(GameStateManager.INSTANCE.getPersonState().getBusinessState().getStates(), {
                    compare: (t: any, t2: any) => {
                    return ComparisonsKt.compareValues(Integer.valueOf(((t as unknown as BusinessState.SingleBusinessState)).getLevel()), Integer.valueOf(((t2 as unknown as BusinessState.SingleBusinessState)).getLevel()));
                }
                })) as unknown as BusinessState.SingleBusinessState)).getLevel();
                i = Constants.Business.INSTANCE.getMaxLevel();
                break;
        }
        return new ProgressBarViewModel(i2, i, false, false, 12, null);
    }
    isAchievementConditionMet(player: Player): boolean {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let progressState: ProgressBarViewModel = this.getProgressState(player);
        let i: Achievement = this;
        return (progressState.getProgressValue() >= progressState.getMaxProgressValue()) && ((i === Achievement.theHappyLife) ? (player.getAgeInYears() >= Achievement.theHappyLifeTillAge) : !((i === Achievement.filialPiety) && player.getFamilyState().getParentsStillLiving()));
    }
}
export namespace Achievement {
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
        getWorldTravelNumberOfTripsNeeded(): number {
        return Achievement.worldTravelNumberOfTripsNeeded;
    }
        getCentenarianAge(): number {
        return Achievement.centenarianAge;
    }
        getTheHappyLifeTillAge(): number {
        return Achievement.theHappyLifeTillAge;
    }
        getTheHappyLifeAverageHappiness(): number {
        return Achievement.theHappyLifeAverageHappiness;
    }
        getFilialPietyRelationship(): number {
        return Achievement.filialPietyRelationship;
    }
        getWealthCollectorMoney(): number {
        return Achievement.wealthCollectorMoney;
    }
        getLargeFamilynumberOfChildren(): number {
        return Achievement.largeFamilynumberOfChildren;
    }
        getTrueLegacyNumberOfProjects(): number {
        return Achievement.trueLegacyNumberOfProjects;
    }
        getHighAchieverNumberOfBadges(): number {
        return Achievement.highAchieverNumberOfBadges;
    }
        getMegaFanNumberOfStreaks(): number {
        return Achievement.megaFanNumberOfStreaks;
    }
        getAvailableAchievements(): Achievement[] {
        return [Achievement.worldTraveler, Achievement.centenarian, Achievement.theHappyLife, Achievement.wealthCollector, Achievement.filialPiety, Achievement.largeFamily, Achievement.polyMath, Achievement.trueLegacy, Achievement.saviorOfHumanity, Achievement.highAchiever, Achievement.businessMagnet];
    }
    }
}
Achievement.INSTANCE = new Achievement.Companion(null);
Achievement.worldTravelNumberOfTripsNeeded = 500;
Achievement.centenarianAge = 100;
Achievement.theHappyLifeTillAge = 80;
Achievement.theHappyLifeAverageHappiness = 0.8;
Achievement.filialPietyRelationship = 0.8;
Achievement.wealthCollectorMoney = 50000000;
Achievement.largeFamilynumberOfChildren = 8;
Achievement.trueLegacyNumberOfProjects = 3;
Achievement.highAchieverNumberOfBadges = 20;
Achievement.megaFanNumberOfStreaks = 20;
