// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Arrays, Double, Integer, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, StringBuilder, StringCompanionObject, TypeCastException } from "../runtime";
import { Achievement } from "./Achievement";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";

export class Perk extends JEnum {
    static readonly diligent: Perk = new Perk("diligent", 0);
    static readonly growthMindset: Perk = new Perk("growthMindset", 1);
    static readonly fastLearner: Perk = new Perk("fastLearner", 2);
    static readonly goodCreditScore: Perk = new Perk("goodCreditScore", 3);
    static readonly realestateMogul: Perk = new Perk("realestateMogul", 4);
    static readonly frugalTraveler: Perk = new Perk("frugalTraveler", 5);
    static readonly goodHealth: Perk = new Perk("goodHealth", 6);
    static readonly trustFund: Perk = new Perk("trustFund", 7);
    static readonly excitable: Perk = new Perk("excitable", 8);
    static readonly emotionalIntelligence: Perk = new Perk("emotionalIntelligence", 9);
    static readonly lucky: Perk = new Perk("lucky", 10);
    static readonly goodParenting: Perk = new Perk("goodParenting", 11);
    static readonly naturalGenius: Perk = new Perk("naturalGenius", 12);
    static readonly angelic: Perk = new Perk("angelic", 13);
    static values(): Perk[] { return [Perk.diligent, Perk.growthMindset, Perk.fastLearner, Perk.goodCreditScore, Perk.realestateMogul, Perk.frugalTraveler, Perk.goodHealth, Perk.trustFund, Perk.excitable, Perk.emotionalIntelligence, Perk.lucky, Perk.goodParenting, Perk.naturalGenius, Perk.angelic]; }
    static valueOf(n: string): Perk { return (Perk as any)[n]; }
    static INSTANCE: any;
    static realestateMongulBoost: number;
    static diligentEarningBoost: number;
    static growthMindsetPromotionBoost: number;
    static fastLearnerDegreeBoost: number;
    static frugalTravelerDiscountModifier: number;
    static trustFundExtraMoney: number;
    static excitableHappinessBoost: number;
    static goodCreditScoreExtraInterest: number;
    static goodParentingChildSupportBoost: number;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case Perk.diligent:
                return Utils.INSTANCE.getString(R.string.Perks_Diligent_Title);
            case Perk.growthMindset:
                return Utils.INSTANCE.getString(R.string.Perks_GrowthMindset_Title);
            case Perk.fastLearner:
                return Utils.INSTANCE.getString(R.string.Perks_FastLearner_Title);
            case Perk.goodCreditScore:
                return Utils.INSTANCE.getString(R.string.Perks_GoodCreditScore_Title);
            case Perk.realestateMogul:
                return Utils.INSTANCE.getString(R.string.Perks_RealEstateMogul_Title);
            case Perk.frugalTraveler:
                return Utils.INSTANCE.getString(R.string.Perks_FrugalTraveler_Title);
            case Perk.goodHealth:
                return Utils.INSTANCE.getString(R.string.Perks_GoodHealth_Title);
            case Perk.trustFund:
                return Utils.INSTANCE.getString(R.string.Perks_TrustFund_Title);
            case Perk.excitable:
                return Utils.INSTANCE.getString(R.string.Perks_Excitable_Title);
            case Perk.emotionalIntelligence:
                return Utils.INSTANCE.getString(R.string.Perks_EmotionalIntelligence);
            case Perk.lucky:
                return Utils.INSTANCE.getString(R.string.Perks_Lucky);
            case Perk.goodParenting:
                return Utils.INSTANCE.getString(R.string.Perk_GoodParenting);
            case Perk.naturalGenius:
                return Utils.INSTANCE.getString(R.string.Perk_NaturalGenius);
            case Perk.angelic:
                return Utils.INSTANCE.getString(R.string.Perk_Angelic);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDescription(): string {
        switch (this) {
            case Perk.diligent:
                let sb: StringBuilder = new StringBuilder();
                sb.append("+");
                let d: number = Perk.diligentEarningBoost;
                let d2: number = 1;
                Double.isNaN(d2);
                sb.append(ExtensionsKt.toPercentString(d - d2));
                sb.append(" ");
                sb.append(Utils.INSTANCE.getString(R.string.DiligentPerk_workPay));
                return sb.toString();
            case Perk.growthMindset:
                return (ExtensionsKt.toPercentString(Perk.growthMindsetPromotionBoost) + " ") + Utils.INSTANCE.getString(R.string.Perks_GrowthMindset_Description);
            case Perk.fastLearner:
                return (ExtensionsKt.toPercentString(Perk.fastLearnerDegreeBoost) + " ") + Utils.INSTANCE.getString(R.string.Perks_FastLearner_Description);
            case Perk.goodCreditScore:
                return Utils.INSTANCE.getString(R.string.Perks_GoodCreditScore_Description);
            case Perk.realestateMogul:
                let sb2: StringBuilder = new StringBuilder();
                sb2.append("+");
                let d3: number = Perk.realestateMongulBoost;
                let d4: number = 1;
                Double.isNaN(d4);
                sb2.append(ExtensionsKt.toPercentString(d3 - d4));
                sb2.append(" ");
                sb2.append(Utils.INSTANCE.getString(R.string.Perks_RealEstateMogul_Description));
                return sb2.toString();
            case Perk.frugalTraveler:
                let sb3: StringBuilder = new StringBuilder();
                sb3.append("-");
                let d5: number = 1;
                let d6: number = Perk.frugalTravelerDiscountModifier;
                Double.isNaN(d5);
                sb3.append(ExtensionsKt.toPercentString(d5 - d6));
                sb3.append(" ");
                sb3.append(Utils.INSTANCE.getString(R.string.Perks_FrugalTraveler_Description));
                return sb3.toString();
            case Perk.goodHealth:
                return Utils.INSTANCE.getString(R.string.Perks_GoodHealth_Description);
            case Perk.trustFund:
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.Perks_TrustFund_Description);
                let objArr = [ExtensionsKt.numberDisplayString$default(Perk.trustFundExtraMoney, false, 1, null)];
                let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                return format;
            case Perk.excitable:
                return Utils.INSTANCE.getString(R.string.Perks_Excitable_Description);
            case Perk.emotionalIntelligence:
                return Utils.INSTANCE.getString(R.string.Perks_EmotionalIntelligence_Description);
            case Perk.lucky:
                return Utils.INSTANCE.getString(R.string.Perks_Lucky_Description);
            case Perk.goodParenting:
                let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                let string2: string = Utils.INSTANCE.getString(R.string.Perk_GoodParenting_Description);
                let objArr2 = [Integer.valueOf(JMath.toInt(Perk.goodParentingChildSupportBoost))];
                let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
                return format2;
            case Perk.naturalGenius:
                return Utils.INSTANCE.getString(R.string.Perk_NaturalGenius_Description);
            case Perk.angelic:
                return Utils.INSTANCE.getString(R.string.Perk_Angelic_Description);
            default:
                return "";
        }
    }
    getLockedString(): string {
        let i: Perk.PerkUnlockType = this.getUnlockType();
        if (i === Perk.PerkUnlockType.inAppPurchase) {
            return Utils.INSTANCE.getString(R.string.Perks_Unlock_InAppPurchase);
        }
        if (i !== Perk.PerkUnlockType.achievement) {
            if (i === Perk.PerkUnlockType.dailyReward) {
                return Utils.INSTANCE.getString(R.string.Perks_Unlock_DailyReward);
            }
            throw new NoWhenBranchMatchedException();
        }
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Perks_Unlock_Achievement);
        let objArr = new Array(1).fill(null);
        let requiredAchievementToUnlock: Achievement = this.getRequiredAchievementToUnlock();
        if (requiredAchievementToUnlock == null) {
            Intrinsics.throwNpe();
        }
        objArr[0] = requiredAchievementToUnlock.getTitle();
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        return format;
    }
    getUnlockType(): Perk.PerkUnlockType {
        switch (this) {
            case Perk.diligent:
            case Perk.growthMindset:
            case Perk.fastLearner:
            case Perk.goodCreditScore:
            case Perk.realestateMogul:
                return Perk.PerkUnlockType.inAppPurchase;
            case Perk.frugalTraveler:
            case Perk.goodHealth:
            case Perk.trustFund:
            case Perk.excitable:
            case Perk.goodParenting:
            case Perk.naturalGenius:
            case Perk.angelic:
                return Perk.PerkUnlockType.achievement;
            case Perk.emotionalIntelligence:
            case Perk.lucky:
                return Perk.PerkUnlockType.dailyReward;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case Perk.diligent:
                return R.drawable.iap_perk;
            case Perk.growthMindset:
            case Perk.emotionalIntelligence:
                return R.drawable.iap_perk_growthmindset;
            case Perk.fastLearner:
                return R.drawable.tab_education;
            case Perk.goodCreditScore:
                return R.drawable.hud_bank;
            case Perk.realestateMogul:
                return R.drawable.iap_perkrealstate;
            case Perk.frugalTraveler:
            case Perk.goodHealth:
            case Perk.trustFund:
            case Perk.excitable:
            case Perk.goodParenting:
            case Perk.naturalGenius:
            case Perk.angelic:
                let requiredAchievementToUnlock: Achievement = this.getRequiredAchievementToUnlock();
                if (requiredAchievementToUnlock == null) {
                    Intrinsics.throwNpe();
                }
                return requiredAchievementToUnlock.getImageId();
            case Perk.lucky:
                return R.drawable.perk_lucky;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getRequiredAchievementToUnlock(): Achievement {
        switch (this) {
            case Perk.frugalTraveler:
                return Achievement.worldTraveler;
            case Perk.goodHealth:
                return Achievement.centenarian;
            case Perk.trustFund:
                return Achievement.wealthCollector;
            case Perk.excitable:
                return Achievement.theHappyLife;
            case Perk.goodParenting:
                return Achievement.largeFamily;
            case Perk.naturalGenius:
                return Achievement.polyMath;
            case Perk.angelic:
                return Achievement.saviorOfHumanity;
            default:
                return null;
        }
    }
}
export namespace Perk {
    export class PerkUnlockType extends JEnum {
        static readonly inAppPurchase: PerkUnlockType = new PerkUnlockType("inAppPurchase", 0);
        static readonly achievement: PerkUnlockType = new PerkUnlockType("achievement", 1);
        static readonly dailyReward: PerkUnlockType = new PerkUnlockType("dailyReward", 2);
        static values(): PerkUnlockType[] { return [PerkUnlockType.inAppPurchase, PerkUnlockType.achievement, PerkUnlockType.dailyReward]; }
        static valueOf(n: string): PerkUnlockType { return (PerkUnlockType as any)[n]; }
        constructor(name: string, ordinal: number) { super(name, ordinal); }
    }
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
        getRealestateMongulBoost(): number {
        return Perk.realestateMongulBoost;
    }
        getDiligentEarningBoost(): number {
        return Perk.diligentEarningBoost;
    }
        getGrowthMindsetPromotionBoost(): number {
        return Perk.growthMindsetPromotionBoost;
    }
        getFastLearnerDegreeBoost(): number {
        return Perk.fastLearnerDegreeBoost;
    }
        getFrugalTravelerDiscountModifier(): number {
        return Perk.frugalTravelerDiscountModifier;
    }
        getTrustFundExtraMoney(): number {
        return Perk.trustFundExtraMoney;
    }
        getExcitableHappinessBoost(): number {
        return Perk.excitableHappinessBoost;
    }
        getGoodCreditScoreExtraInterest(): number {
        return Perk.goodCreditScoreExtraInterest;
    }
        getGoodParentingChildSupportBoost(): number {
        return Perk.goodParentingChildSupportBoost;
    }
        getAvailablePerks(): Perk[] {
        let values: Perk[] = Perk.values();
        let arrayList: ArrayList = new ArrayList();
        for (const perk of values) {
            if (perk.getUnlockType() !== Perk.PerkUnlockType.dailyReward) {
                arrayList.add(perk);
            }
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as Perk[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    }
}
Perk.INSTANCE = new Perk.Companion(null);
Perk.realestateMongulBoost = 1.5;
Perk.diligentEarningBoost = 1.5;
Perk.growthMindsetPromotionBoost = 0.5;
Perk.fastLearnerDegreeBoost = 0.5;
Perk.frugalTravelerDiscountModifier = 0.75;
Perk.trustFundExtraMoney = 25000;
Perk.excitableHappinessBoost = 1.25;
Perk.goodCreditScoreExtraInterest = 3.0;
Perk.goodParentingChildSupportBoost = 2.0;
