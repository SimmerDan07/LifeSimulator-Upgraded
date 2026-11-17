// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, R } from "../runtime";
import { Utils } from "../Utils/Utils";

export class GenericListType extends JEnum {
    static readonly weeklyModifiers: GenericListType = new GenericListType("weeklyModifiers", 0);
    static readonly cashFlow: GenericListType = new GenericListType("cashFlow", 1);
    static readonly traits: GenericListType = new GenericListType("traits", 2);
    static readonly childDetails: GenericListType = new GenericListType("childDetails", 3);
    static readonly petDetails: GenericListType = new GenericListType("petDetails", 4);
    static readonly choosePet: GenericListType = new GenericListType("choosePet", 5);
    static readonly chooseDiet: GenericListType = new GenericListType("chooseDiet", 6);
    static readonly sideHustleProjects: GenericListType = new GenericListType("sideHustleProjects", 7);
    static readonly settingsMenu: GenericListType = new GenericListType("settingsMenu", 8);
    static readonly parentDetails: GenericListType = new GenericListType("parentDetails", 9);
    static readonly store: GenericListType = new GenericListType("store", 10);
    static readonly scenarioSelection: GenericListType = new GenericListType("scenarioSelection", 11);
    static readonly customizeGame: GenericListType = new GenericListType("customizeGame", 12);
    static readonly perkSelection: GenericListType = new GenericListType("perkSelection", 13);
    static readonly perkList: GenericListType = new GenericListType("perkList", 14);
    static readonly traitList: GenericListType = new GenericListType("traitList", 15);
    static readonly badgeList: GenericListType = new GenericListType("badgeList", 16);
    static readonly achivementList: GenericListType = new GenericListType("achivementList", 17);
    static readonly saveSlots: GenericListType = new GenericListType("saveSlots", 18);
    static readonly gameSettings: GenericListType = new GenericListType("gameSettings", 19);
    static readonly gameSummary: GenericListType = new GenericListType("gameSummary", 20);
    static readonly cemetery: GenericListType = new GenericListType("cemetery", 21);
    static readonly help: GenericListType = new GenericListType("help", 22);
    static readonly credits: GenericListType = new GenericListType("credits", 23);
    static readonly businessDetails: GenericListType = new GenericListType("businessDetails", 24);
    static readonly chooseHeir: GenericListType = new GenericListType("chooseHeir", 25);
    static readonly realEstate: GenericListType = new GenericListType("realEstate", 26);
    static readonly propertyDetails: GenericListType = new GenericListType("propertyDetails", 27);
    static readonly propertyMarket: GenericListType = new GenericListType("propertyMarket", 28);
    static readonly propertyRenovations: GenericListType = new GenericListType("propertyRenovations", 29);
    static readonly propertyFamily: GenericListType = new GenericListType("propertyFamily", 30);
    static readonly rentalMarket: GenericListType = new GenericListType("rentalMarket", 31);
    static values(): GenericListType[] { return [GenericListType.weeklyModifiers, GenericListType.cashFlow, GenericListType.traits, GenericListType.childDetails, GenericListType.petDetails, GenericListType.choosePet, GenericListType.chooseDiet, GenericListType.sideHustleProjects, GenericListType.settingsMenu, GenericListType.parentDetails, GenericListType.store, GenericListType.scenarioSelection, GenericListType.customizeGame, GenericListType.perkSelection, GenericListType.perkList, GenericListType.traitList, GenericListType.badgeList, GenericListType.achivementList, GenericListType.saveSlots, GenericListType.gameSettings, GenericListType.gameSummary, GenericListType.cemetery, GenericListType.help, GenericListType.credits, GenericListType.businessDetails, GenericListType.chooseHeir, GenericListType.realEstate, GenericListType.propertyDetails, GenericListType.propertyMarket, GenericListType.propertyRenovations, GenericListType.propertyFamily, GenericListType.rentalMarket]; }
    static valueOf(n: string): GenericListType { return (GenericListType as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getNavBarTitle(): string {
        if (this === GenericListType.chooseHeir) return "Continue Your Legacy";
        if (this === GenericListType.realEstate) return "Real Estate";
        if (this === GenericListType.propertyDetails) return "Property";
        if (this === GenericListType.propertyMarket) return "Homes for Sale";
        if (this === GenericListType.propertyRenovations) return "Renovations";
        if (this === GenericListType.propertyFamily) return "Family & Property";
        if (this === GenericListType.rentalMarket) return "Homes for Rent";
        switch (this) {
            case GenericListType.weeklyModifiers:
                return Utils.INSTANCE.getString(R.string.ProfileSection_WeeklyModifiers);
            case GenericListType.traits:
                return Utils.INSTANCE.getString(R.string.Common_Traits);
            case GenericListType.cashFlow:
                return Utils.INSTANCE.getString(R.string.SectionHeader_WeeklyCash);
            case GenericListType.choosePet:
                return Utils.INSTANCE.getString(R.string.ChoosePet_Title);
            case GenericListType.chooseDiet:
                return Utils.INSTANCE.getString(R.string.ChooseDiet_Title);
            case GenericListType.scenarioSelection:
                return Utils.INSTANCE.getString(R.string.Common_NewGame);
            case GenericListType.customizeGame:
                return Utils.INSTANCE.getString(R.string.ControllerTitle_CustomGame);
            case GenericListType.perkSelection:
            case GenericListType.perkList:
                return Utils.INSTANCE.getString(R.string.Common_Perks);
            case GenericListType.traitList:
                return Utils.INSTANCE.getString(R.string.Common_Trait);
            case GenericListType.badgeList:
                return Utils.INSTANCE.getString(R.string.Menu_Leaderboard_Badges);
            case GenericListType.achivementList:
                return Utils.INSTANCE.getString(R.string.Menu_Help_Achievements);
            case GenericListType.saveSlots:
                return Utils.INSTANCE.getString(R.string.Common_SaveSlots);
            case GenericListType.gameSettings:
                return Utils.INSTANCE.getString(R.string.Common_GameSettings);
            case GenericListType.gameSummary:
                return Utils.INSTANCE.getString(R.string.DeathLifeSummaryTitle);
            case GenericListType.cemetery:
                return Utils.INSTANCE.getString(R.string.Menu_Cemetery);
            case GenericListType.help:
                return Utils.INSTANCE.getString(R.string.Menu_Help_Title);
            case GenericListType.credits:
                return Utils.INSTANCE.getString(R.string.Menu_Help_Credits);
            default:
                return null;
        }
    }
}
