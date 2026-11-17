// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Arrays, ArraysKt, BigInteger, CollectionsKt, ComparisonsKt, Double, Integer, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, SpannableStringBuilder, StringCompanionObject, TypeCastException } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { Business } from "./Business";
import { BusinessState } from "../Managers/BusinessState";
import { CompletableActionState } from "../Managers/CompletableActionState";
import { CompletableActionType } from "./CompletableActionType";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { Player } from "../Managers/Player";
import { Rarity } from "./Rarity";
import { RelationshipProgressStatus } from "./RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "./RomanticRelationshipStatus";
import { SideHustle } from "./SideHustle";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";

export class AchievementBadge extends JEnum {
    static readonly married: AchievementBadge = new AchievementBadge("married", 0);
    static readonly wellOff: AchievementBadge = new AchievementBadge("wellOff", 1);
    static readonly rich: AchievementBadge = new AchievementBadge("rich", 2);
    static readonly wealthy: AchievementBadge = new AchievementBadge("wealthy", 3);
    static readonly crazyRich: AchievementBadge = new AchievementBadge("crazyRich", 4);
    static readonly oldAge: AchievementBadge = new AchievementBadge("oldAge", 5);
    static readonly tooYoung: AchievementBadge = new AchievementBadge("tooYoung", 6);
    static readonly realEstateEmpire: AchievementBadge = new AchievementBadge("realEstateEmpire", 7);
    static readonly doer: AchievementBadge = new AchievementBadge("doer", 8);
    static readonly invester: AchievementBadge = new AchievementBadge("invester", 9);
    static readonly criminal: AchievementBadge = new AchievementBadge("criminal", 10);
    static readonly nerd: AchievementBadge = new AchievementBadge("nerd", 11);
    static readonly skillful: AchievementBadge = new AchievementBadge("skillful", 12);
    static readonly familyMan: AchievementBadge = new AchievementBadge("familyMan", 13);
    static readonly workaholic: AchievementBadge = new AchievementBadge("workaholic", 14);
    static readonly sadLife: AchievementBadge = new AchievementBadge("sadLife", 15);
    static readonly happyLife: AchievementBadge = new AchievementBadge("happyLife", 16);
    static readonly bigFamily: AchievementBadge = new AchievementBadge("bigFamily", 17);
    static readonly massiveFamily: AchievementBadge = new AchievementBadge("massiveFamily", 18);
    static readonly seedSpreader: AchievementBadge = new AchievementBadge("seedSpreader", 19);
    static readonly restaurantOwner: AchievementBadge = new AchievementBadge("restaurantOwner", 20);
    static readonly restaurantFranchise: AchievementBadge = new AchievementBadge("restaurantFranchise", 21);
    static readonly factoryOwner: AchievementBadge = new AchievementBadge("factoryOwner", 22);
    static readonly manufactoringTycoon: AchievementBadge = new AchievementBadge("manufactoringTycoon", 23);
    static readonly softwareCompany: AchievementBadge = new AchievementBadge("softwareCompany", 24);
    static readonly techGiant: AchievementBadge = new AchievementBadge("techGiant", 25);
    static readonly prolificWriter: AchievementBadge = new AchievementBadge("prolificWriter", 26);
    static readonly superstar: AchievementBadge = new AchievementBadge("superstar", 27);
    static readonly supercentenarian: AchievementBadge = new AchievementBadge("supercentenarian", 28);
    static readonly bilingual: AchievementBadge = new AchievementBadge("bilingual", 29);
    static readonly philanthropist: AchievementBadge = new AchievementBadge("philanthropist", 30);
    static readonly baseballSuperstar: AchievementBadge = new AchievementBadge("baseballSuperstar", 31);
    static readonly basketballSuperstar: AchievementBadge = new AchievementBadge("basketballSuperstar", 32);
    static readonly footballSuperstar: AchievementBadge = new AchievementBadge("footballSuperstar", 33);
    static readonly cheatingDeath: AchievementBadge = new AchievementBadge("cheatingDeath", 34);
    static readonly immortal: AchievementBadge = new AchievementBadge("immortal", 35);
    static readonly gotCatchemAll: AchievementBadge = new AchievementBadge("gotCatchemAll", 36);
    static values(): AchievementBadge[] { return [AchievementBadge.married, AchievementBadge.wellOff, AchievementBadge.rich, AchievementBadge.wealthy, AchievementBadge.crazyRich, AchievementBadge.oldAge, AchievementBadge.tooYoung, AchievementBadge.realEstateEmpire, AchievementBadge.doer, AchievementBadge.invester, AchievementBadge.criminal, AchievementBadge.nerd, AchievementBadge.skillful, AchievementBadge.familyMan, AchievementBadge.workaholic, AchievementBadge.sadLife, AchievementBadge.happyLife, AchievementBadge.bigFamily, AchievementBadge.massiveFamily, AchievementBadge.seedSpreader, AchievementBadge.restaurantOwner, AchievementBadge.restaurantFranchise, AchievementBadge.factoryOwner, AchievementBadge.manufactoringTycoon, AchievementBadge.softwareCompany, AchievementBadge.techGiant, AchievementBadge.prolificWriter, AchievementBadge.superstar, AchievementBadge.supercentenarian, AchievementBadge.bilingual, AchievementBadge.philanthropist, AchievementBadge.baseballSuperstar, AchievementBadge.basketballSuperstar, AchievementBadge.footballSuperstar, AchievementBadge.cheatingDeath, AchievementBadge.immortal, AchievementBadge.gotCatchemAll]; }
    static valueOf(n: string): AchievementBadge { return (AchievementBadge as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getOnlyAchievedOnDeath(): boolean {
        let i: AchievementBadge = this;
        return ((((i === AchievementBadge.tooYoung) || (i === AchievementBadge.sadLife)) || (i === AchievementBadge.familyMan)) || (i === AchievementBadge.workaholic)) || (i === AchievementBadge.happyLife);
    }
    getGetBadgeSpannableString(): SpannableStringBuilder {
        return ExtensionsKt.appendBold$default(ExtensionsKt.appendFontAwesomeCharacter$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.fa_award_solid), this.getRarity().getColorId(), null, 4, null), "  " + this.getTitle(), Integer.valueOf(this.getRarity().getColorId()), 14, null, 8, null);
    }
    getRarity(): Rarity {
        switch (this) {
            case AchievementBadge.married:
                return Rarity.common;
            case AchievementBadge.oldAge:
                return Rarity.rare;
            case AchievementBadge.tooYoung:
                return Rarity.common;
            case AchievementBadge.realEstateEmpire:
                return Rarity.legendary;
            case AchievementBadge.doer:
                return Rarity.uncommon;
            case AchievementBadge.invester:
                return Rarity.rare;
            case AchievementBadge.criminal:
                return Rarity.rare;
            case AchievementBadge.nerd:
                return Rarity.uncommon;
            case AchievementBadge.skillful:
                return Rarity.uncommon;
            case AchievementBadge.familyMan:
                return Rarity.common;
            case AchievementBadge.workaholic:
                return Rarity.common;
            case AchievementBadge.sadLife:
                return Rarity.common;
            case AchievementBadge.happyLife:
                return Rarity.rare;
            case AchievementBadge.restaurantOwner:
                return Rarity.uncommon;
            case AchievementBadge.restaurantFranchise:
                return Rarity.rare;
            case AchievementBadge.factoryOwner:
                return Rarity.uncommon;
            case AchievementBadge.manufactoringTycoon:
                return Rarity.rare;
            case AchievementBadge.softwareCompany:
                return Rarity.uncommon;
            case AchievementBadge.techGiant:
                return Rarity.rare;
            case AchievementBadge.prolificWriter:
                return Rarity.rare;
            case AchievementBadge.superstar:
                return Rarity.rare;
            case AchievementBadge.wellOff:
                return Rarity.common;
            case AchievementBadge.rich:
                return Rarity.uncommon;
            case AchievementBadge.wealthy:
                return Rarity.rare;
            case AchievementBadge.crazyRich:
                return Rarity.legendary;
            case AchievementBadge.bigFamily:
                return Rarity.uncommon;
            case AchievementBadge.massiveFamily:
                return Rarity.rare;
            case AchievementBadge.seedSpreader:
                return Rarity.legendary;
            case AchievementBadge.supercentenarian:
                return Rarity.legendary;
            case AchievementBadge.bilingual:
                return Rarity.uncommon;
            case AchievementBadge.philanthropist:
                return Rarity.legendary;
            case AchievementBadge.baseballSuperstar:
                return Rarity.legendary;
            case AchievementBadge.basketballSuperstar:
                return Rarity.legendary;
            case AchievementBadge.footballSuperstar:
                return Rarity.legendary;
            case AchievementBadge.cheatingDeath:
                return Rarity.rare;
            case AchievementBadge.immortal:
                return Rarity.legendary;
            case AchievementBadge.gotCatchemAll:
                return Rarity.legendary;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getTitle(): string {
        switch (this) {
            case AchievementBadge.married:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Married);
            case AchievementBadge.rich:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Rich);
            case AchievementBadge.oldAge:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_OldAge);
            case AchievementBadge.tooYoung:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_TooYoung);
            case AchievementBadge.realEstateEmpire:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_realEstateEmpire);
            case AchievementBadge.doer:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_doer);
            case AchievementBadge.invester:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_invester);
            case AchievementBadge.criminal:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_criminal);
            case AchievementBadge.nerd:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_nerd);
            case AchievementBadge.skillful:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_skillful);
            case AchievementBadge.familyMan:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_familyMan);
            case AchievementBadge.workaholic:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_workaholic);
            case AchievementBadge.sadLife:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_sadLife);
            case AchievementBadge.happyLife:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_happyLife);
            case AchievementBadge.bigFamily:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_bigFamily);
            case AchievementBadge.massiveFamily:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_massiveFamily);
            case AchievementBadge.restaurantOwner:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_restaurantOwner);
            case AchievementBadge.restaurantFranchise:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_restaurantFranchise);
            case AchievementBadge.factoryOwner:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_factoryOwner);
            case AchievementBadge.manufactoringTycoon:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_manufactoringTycoon);
            case AchievementBadge.softwareCompany:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_softwareCompany);
            case AchievementBadge.techGiant:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_techGiant);
            case AchievementBadge.prolificWriter:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_ProlificWriter);
            case AchievementBadge.superstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Superstar);
            case AchievementBadge.wellOff:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_WellOff);
            case AchievementBadge.wealthy:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Wealthy);
            case AchievementBadge.crazyRich:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_CrazyRich);
            case AchievementBadge.seedSpreader:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_SeedSpreader);
            case AchievementBadge.supercentenarian:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_SuperCentenarian);
            case AchievementBadge.bilingual:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Bilingual);
            case AchievementBadge.philanthropist:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Philanthropist);
            case AchievementBadge.baseballSuperstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Sport_BaseballStar);
            case AchievementBadge.basketballSuperstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Sport_BasketballStar);
            case AchievementBadge.footballSuperstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Sport_FootballStar);
            case AchievementBadge.cheatingDeath:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_CheatingDeath);
            case AchievementBadge.immortal:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Immortal);
            case AchievementBadge.gotCatchemAll:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_GotCatchemAll);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDescription(): string {
        switch (this) {
            case AchievementBadge.married:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Married);
            case AchievementBadge.rich:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Rich);
            case AchievementBadge.oldAge:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_OldAge);
            case AchievementBadge.tooYoung:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_TooYoung);
            case AchievementBadge.realEstateEmpire:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_RealEstateEmpire);
            case AchievementBadge.doer:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Doer);
            case AchievementBadge.invester:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Investor);
            case AchievementBadge.criminal:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Criminal);
            case AchievementBadge.nerd:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Nerd);
            case AchievementBadge.skillful:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Skillful);
            case AchievementBadge.familyMan:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_FamilyMan);
            case AchievementBadge.workaholic:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Workaholic);
            case AchievementBadge.sadLife:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_SadLife);
            case AchievementBadge.happyLife:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_HappyLife);
            case AchievementBadge.bigFamily:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_BigFamily);
            case AchievementBadge.massiveFamily:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_MassiveFamily);
            case AchievementBadge.restaurantOwner:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_restaurantOwner);
            case AchievementBadge.restaurantFranchise:
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.LifeOutcome_Description_restaurantFranchise);
                let objArr = [Integer.valueOf(Constants.Business.INSTANCE.getMaxLevel())];
                let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                return format;
            case AchievementBadge.factoryOwner:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_factoryOwner);
            case AchievementBadge.manufactoringTycoon:
                let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                let string2: string = Utils.INSTANCE.getString(R.string.LifeOutcome_Description_manufactoringTycoon);
                let objArr2 = [Integer.valueOf(Constants.Business.INSTANCE.getMaxLevel())];
                let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
                return format2;
            case AchievementBadge.softwareCompany:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_softwareCompany);
            case AchievementBadge.techGiant:
                let stringCompanionObject3 = StringCompanionObject.INSTANCE;
                let string3: string = Utils.INSTANCE.getString(R.string.LifeOutcome_Description_techGiant);
                let objArr3 = [Integer.valueOf(Constants.Business.INSTANCE.getMaxLevel())];
                let format3: string = String.format(string3, Arrays.copyOf(objArr3, objArr3.length));
                return format3;
            case AchievementBadge.prolificWriter:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_prolificWriter);
            case AchievementBadge.superstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_superstar);
            case AchievementBadge.wellOff:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_WellOff);
            case AchievementBadge.wealthy:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Wealthy);
            case AchievementBadge.crazyRich:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_CrazyRich);
            case AchievementBadge.seedSpreader:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_SeedSpreader);
            case AchievementBadge.supercentenarian:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_SuperCentenarian);
            case AchievementBadge.bilingual:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_BilingualDescription);
            case AchievementBadge.philanthropist:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_PhilanthropistDescription);
            case AchievementBadge.baseballSuperstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Sport_BaseballStar_Description);
            case AchievementBadge.basketballSuperstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Sport_BasketballStar_Description);
            case AchievementBadge.footballSuperstar:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Sport_FootballStar_Description);
            case AchievementBadge.cheatingDeath:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_CheatingDeath);
            case AchievementBadge.immortal:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_Immortal);
            case AchievementBadge.gotCatchemAll:
                return Utils.INSTANCE.getString(R.string.LifeOutcome_Description_GotCatchemAll);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    achieved(player: Player): boolean {
        Intrinsics.checkParameterIsNotNull(player, "player");
        switch (this) {
            case AchievementBadge.married:
                return player.getRomanticRelationshipStatus() === RomanticRelationshipStatus.married;
            case AchievementBadge.wellOff:
                let netWorth: BigInteger = player.getNetWorth();
                let valueOf: BigInteger = BigInteger.valueOf(1000000);
                return netWorth.compareTo(valueOf) >= 0;
            case AchievementBadge.rich:
                let netWorth2: BigInteger = player.getNetWorth();
                let valueOf2: BigInteger = BigInteger.valueOf(1000000000);
                return netWorth2.compareTo(valueOf2) >= 0;
            case AchievementBadge.wealthy:
                return player.getNetWorth().compareTo(new BigInteger("1000000000000")) >= 0;
            case AchievementBadge.crazyRich:
                return player.getNetWorth().compareTo(new BigInteger("1000000000000000000")) >= 0;
            case AchievementBadge.oldAge:
                return player.getAgeInYears() >= 100;
            case AchievementBadge.tooYoung:
                return player.getAgeInYears() < 25;
            case AchievementBadge.realEstateEmpire:
                let numberOfPropertiesOwned: BigInteger = player.getHousingState().getNumberOfPropertiesOwned();
                let valueOf3: BigInteger = BigInteger.valueOf(30);
                return numberOfPropertiesOwned.compareTo(valueOf3) >= 0;
            case AchievementBadge.doer:
                let i: number = 0;
                for (const singleSideHustleState of player.getSideHustleState().getStates()) {
                    i += singleSideHustleState.getCompletedProjects().length;
                }
                return i >= 100;
            case AchievementBadge.invester:
                let totalValue: BigInteger = player.getStockState().getTotalValue();
                let valueOf4: BigInteger = BigInteger.valueOf(10000000);
                return totalValue.compareTo(valueOf4) >= 0;
            case AchievementBadge.criminal:
                return false;
            case AchievementBadge.nerd:
                let states: CompletableActionState.CompletableActionStateSingle[] = player.getCompletableActionState().getStates(CompletableActionType.education);
                let arrayList: ArrayList = new ArrayList();
                for (const completableActionStateSingle of states) {
                    if (completableActionStateSingle.getCompleted()) {
                        arrayList.add(completableActionStateSingle);
                    }
                }
                return arrayList.size() > ((JMath.idiv(states.length, 2)) + 2);
            case AchievementBadge.skillful:
                let states2: CompletableActionState.CompletableActionStateSingle[] = player.getCompletableActionState().getStates(CompletableActionType.skill);
                let arrayList2: ArrayList = new ArrayList();
                for (const completableActionStateSingle2 of states2) {
                    if (completableActionStateSingle2.getCompleted()) {
                        arrayList2.add(completableActionStateSingle2);
                    }
                }
                return arrayList2.size() > ((JMath.idiv(states2.length, 2)) + 2);
            case AchievementBadge.familyMan:
                return (player.getFamilyState().getCombinedParentRelationshipProgressStatus() === RelationshipProgressStatus.close) || (player.getFamilyState().getCombinedParentRelationshipProgressStatus() === RelationshipProgressStatus.besties);
            case AchievementBadge.workaholic:
                let workAction: number = player.getMiscState().getLifeTracker().getWorkAction();
                let totalTimeSpend: number = player.getMiscState().getLifeTracker().getTotalTimeSpend();
                Double.isNaN(workAction);
                Double.isNaN(totalTimeSpend);
                return (workAction / totalTimeSpend) > 0.35;
            case AchievementBadge.sadLife:
                return player.getMiscState().getCurrentAverageHappiness() <= 0.4;
            case AchievementBadge.happyLife:
                return player.getMiscState().getCurrentAverageHappiness() >= 0.65;
            case AchievementBadge.bigFamily:
                return player.getFamilyState().getChildren().size() >= 5;
            case AchievementBadge.massiveFamily:
                return player.getFamilyState().getChildren().size() >= 10;
            case AchievementBadge.seedSpreader:
                return player.getFamilyState().getChildren().size() >= 50;
            case AchievementBadge.restaurantOwner:
                let states3: BusinessState.SingleBusinessState[] = player.getBusinessState().getStates();
                let arrayList3: ArrayList = new ArrayList();
                for (const singleBusinessState of states3) {
                    if (singleBusinessState.getType() === Business.restaurantChain) {
                        arrayList3.add(singleBusinessState);
                    }
                }
                return ((CollectionsKt.first((arrayList3 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState)).getLevel() >= 5;
            case AchievementBadge.restaurantFranchise:
                let states4: BusinessState.SingleBusinessState[] = player.getBusinessState().getStates();
                let arrayList4: ArrayList = new ArrayList();
                for (const singleBusinessState2 of states4) {
                    if (singleBusinessState2.getType() === Business.restaurantChain) {
                        arrayList4.add(singleBusinessState2);
                    }
                }
                return ((CollectionsKt.first((arrayList4 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState)).getLevel() >= Constants.Business.INSTANCE.getMaxLevel();
            case AchievementBadge.factoryOwner:
                let states5: BusinessState.SingleBusinessState[] = player.getBusinessState().getStates();
                let arrayList5: ArrayList = new ArrayList();
                for (const singleBusinessState3 of states5) {
                    if (singleBusinessState3.getType() === Business.factory) {
                        arrayList5.add(singleBusinessState3);
                    }
                }
                return ((CollectionsKt.first((arrayList5 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState)).getLevel() >= 5;
            case AchievementBadge.manufactoringTycoon:
                let states6: BusinessState.SingleBusinessState[] = player.getBusinessState().getStates();
                let arrayList6: ArrayList = new ArrayList();
                for (const singleBusinessState4 of states6) {
                    if (singleBusinessState4.getType() === Business.factory) {
                        arrayList6.add(singleBusinessState4);
                    }
                }
                return ((CollectionsKt.first((arrayList6 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState)).getLevel() >= Constants.Business.INSTANCE.getMaxLevel();
            case AchievementBadge.softwareCompany:
                let states7: BusinessState.SingleBusinessState[] = player.getBusinessState().getStates();
                let arrayList7: ArrayList = new ArrayList();
                for (const singleBusinessState5 of states7) {
                    if (singleBusinessState5.getType() === Business.softwareCompany) {
                        arrayList7.add(singleBusinessState5);
                    }
                }
                return ((CollectionsKt.first((arrayList7 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState)).getLevel() >= 5;
            case AchievementBadge.techGiant:
                let states8: BusinessState.SingleBusinessState[] = player.getBusinessState().getStates();
                let arrayList8: ArrayList = new ArrayList();
                for (const singleBusinessState6 of states8) {
                    if (singleBusinessState6.getType() === Business.softwareCompany) {
                        arrayList8.add(singleBusinessState6);
                    }
                }
                return ((CollectionsKt.first((arrayList8 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState)).getLevel() >= Constants.Business.INSTANCE.getMaxLevel();
            case AchievementBadge.prolificWriter:
                return player.getSideHustleState().getState(SideHustle.author).getCompletedProjects().length >= 100;
            case AchievementBadge.superstar:
                return player.getSideHustleState().getState(SideHustle.actor).getCompletedProjects().length >= 100;
            case AchievementBadge.supercentenarian:
                return player.getAgeInYears() >= 110;
            case AchievementBadge.bilingual:
                let states9: CompletableActionState.CompletableActionStateSingle[] = player.getCompletableActionState().getStates();
                let arrayList9: ArrayList = new ArrayList();
                for (const completableActionStateSingle3 of states9) {
                    if (completableActionStateSingle3.getType().isLanguage() && completableActionStateSingle3.getCompleted()) {
                        arrayList9.add(completableActionStateSingle3);
                    }
                }
                return arrayList9.size() >= 1;
            case AchievementBadge.philanthropist:
                let states10: CompletableActionState.CompletableActionStateSingle[] = player.getCompletableActionState().getStates(CompletableActionType.philanthrophy);
                let arrayList10: ArrayList = new ArrayList();
                for (const completableActionStateSingle4 of states10) {
                    if (completableActionStateSingle4.getCompleted()) {
                        arrayList10.add(completableActionStateSingle4);
                    }
                }
                return arrayList10.size() > 0;
            case AchievementBadge.baseballSuperstar:
            case AchievementBadge.basketballSuperstar:
            case AchievementBadge.footballSuperstar:
                return false;
            case AchievementBadge.cheatingDeath:
                return player.getTrueAgeInYears() >= 200;
            case AchievementBadge.immortal:
                return player.getTrueAgeInYears() >= 500;
            case AchievementBadge.gotCatchemAll:
                return false;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
export namespace AchievementBadge {
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
        getAvailableBadges(): AchievementBadge[] {
        return [AchievementBadge.married, AchievementBadge.wellOff, AchievementBadge.rich, AchievementBadge.wealthy, AchievementBadge.crazyRich, AchievementBadge.oldAge, AchievementBadge.tooYoung, AchievementBadge.realEstateEmpire, AchievementBadge.doer, AchievementBadge.invester, AchievementBadge.nerd, AchievementBadge.skillful, AchievementBadge.familyMan, AchievementBadge.workaholic, AchievementBadge.sadLife, AchievementBadge.happyLife, AchievementBadge.bigFamily, AchievementBadge.massiveFamily, AchievementBadge.seedSpreader, AchievementBadge.prolificWriter, AchievementBadge.superstar, AchievementBadge.supercentenarian, AchievementBadge.bilingual, AchievementBadge.philanthropist, AchievementBadge.cheatingDeath, AchievementBadge.immortal, AchievementBadge.restaurantOwner, AchievementBadge.restaurantFranchise, AchievementBadge.factoryOwner, AchievementBadge.manufactoringTycoon, AchievementBadge.softwareCompany, AchievementBadge.techGiant];
    }
        getBadges(player: Player): ArrayList<AchievementBadge> {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let arrayList: ArrayList = new ArrayList();
        for (const achievementBadge of this.getAvailableBadges()) {
            if (achievementBadge.achieved(player)) {
                arrayList.add(achievementBadge);
            }
        }
        return new ArrayList(CollectionsKt.sortedWith(arrayList, {
            compare: (t: any, t2: any) => {
            return ComparisonsKt.compareValues(Integer.valueOf(((t as unknown as AchievementBadge)).getRarity().getRaw()), Integer.valueOf(((t2 as unknown as AchievementBadge)).getRarity().getRaw()));
        }
        }));
    }
        getBadgeViewModels(player: Player): BaseViewModel[] {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let arrayList: ArrayList = new ArrayList();
        for (const achievementBadge of ArraysKt.sortedWith(this.getAvailableBadges(), {
            compare: (t: any, t2: any) => {
            return ComparisonsKt.compareValues(Integer.valueOf(((t as unknown as AchievementBadge)).getRarity().getRaw()), Integer.valueOf(((t2 as unknown as AchievementBadge)).getRarity().getRaw()));
        }
        })) {
            let i: number = R.color.flatGrey;
            if (GameStateManager.INSTANCE.getGlobalStateManager().getAchievementBadgeState().isCompleted(achievementBadge)) {
                i = achievementBadge.getRarity().getColorId();
            }
            arrayList.add(new LeftRightCellViewModel(achievementBadge.getTitle(), new TextLabelViewModel(ExtensionsKt.appendBold$default(ExtensionsKt.appendFontAwesomeCharacter$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.fa_award_solid), i, null, 4, null), "  " + achievementBadge.getTitle(), Integer.valueOf(i), 14, null, 8, null), false, false, Integer.valueOf(i), 6, null), new TextLabelViewModel(achievementBadge.getDescription(), null, false, false, null, null, 62, null), null, 8, null));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as BaseViewModel[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    }
}
AchievementBadge.INSTANCE = new AchievementBadge.Companion(null);
