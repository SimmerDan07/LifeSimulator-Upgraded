// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Arrays, BigInteger, CollectionsKt, Double, Integer, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, StringCompanionObject, TypeCastException } from "../runtime";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { CompletableActionType } from "./CompletableActionType";
import { Constants } from "../Utils/Constants";
import { Country } from "./Country";
import { GameStateManager } from "../Managers/GameStateManager";
import { HealthEvent } from "./HealthEvent";
import { Job } from "./Job";
import { Perk } from "./Perk";
import { Player } from "../Managers/Player";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";

export class CompletableAction extends JEnum {
    static readonly middleSchool: CompletableAction = new CompletableAction("middleSchool", 0);
    static readonly highSchool: CompletableAction = new CompletableAction("highSchool", 1);
    static readonly college_music: CompletableAction = new CompletableAction("college_music", 2);
    static readonly college_business: CompletableAction = new CompletableAction("college_business", 3);
    static readonly college_biology: CompletableAction = new CompletableAction("college_biology", 4);
    static readonly college_finance: CompletableAction = new CompletableAction("college_finance", 5);
    static readonly college_science: CompletableAction = new CompletableAction("college_science", 6);
    static readonly college_computerScience: CompletableAction = new CompletableAction("college_computerScience", 7);
    static readonly college_theater: CompletableAction = new CompletableAction("college_theater", 8);
    static readonly college_literature: CompletableAction = new CompletableAction("college_literature", 9);
    static readonly college_philosophy: CompletableAction = new CompletableAction("college_philosophy", 10);
    static readonly college_art: CompletableAction = new CompletableAction("college_art", 11);
    static readonly masters: CompletableAction = new CompletableAction("masters", 12);
    static readonly mba: CompletableAction = new CompletableAction("mba", 13);
    static readonly phd: CompletableAction = new CompletableAction("phd", 14);
    static readonly law_school: CompletableAction = new CompletableAction("law_school", 15);
    static readonly medSchool: CompletableAction = new CompletableAction("medSchool", 16);
    static readonly police_academy: CompletableAction = new CompletableAction("police_academy", 17);
    static readonly militaryAcademy: CompletableAction = new CompletableAction("militaryAcademy", 18);
    static readonly homeChef: CompletableAction = new CompletableAction("homeChef", 19);
    static readonly nutritionScience: CompletableAction = new CompletableAction("nutritionScience", 20);
    static readonly frugalShopper: CompletableAction = new CompletableAction("frugalShopper", 21);
    static readonly personalFinance: CompletableAction = new CompletableAction("personalFinance", 22);
    static readonly investmentStrategies: CompletableAction = new CompletableAction("investmentStrategies", 23);
    static readonly financialLiteracy: CompletableAction = new CompletableAction("financialLiteracy", 24);
    static readonly homeMedic: CompletableAction = new CompletableAction("homeMedic", 25);
    static readonly meditationExpert: CompletableAction = new CompletableAction("meditationExpert", 26);
    static readonly hygieneExpert: CompletableAction = new CompletableAction("hygieneExpert", 27);
    static readonly stocisim: CompletableAction = new CompletableAction("stocisim", 28);
    static readonly timeMangement: CompletableAction = new CompletableAction("timeMangement", 29);
    static readonly selfHelp: CompletableAction = new CompletableAction("selfHelp", 30);
    static readonly selfImprovement: CompletableAction = new CompletableAction("selfImprovement", 31);
    static readonly french: CompletableAction = new CompletableAction("french", 32);
    static readonly japanese: CompletableAction = new CompletableAction("japanese", 33);
    static readonly spanish: CompletableAction = new CompletableAction("spanish", 34);
    static readonly chinese: CompletableAction = new CompletableAction("chinese", 35);
    static readonly diseaseEradicationPolio: CompletableAction = new CompletableAction("diseaseEradicationPolio", 36);
    static readonly diseaseEradicationMalaria: CompletableAction = new CompletableAction("diseaseEradicationMalaria", 37);
    static readonly cancerResearch: CompletableAction = new CompletableAction("cancerResearch", 38);
    static readonly worldHunger: CompletableAction = new CompletableAction("worldHunger", 39);
    static readonly sustainableEnergy: CompletableAction = new CompletableAction("sustainableEnergy", 40);
    static readonly lunarBase: CompletableAction = new CompletableAction("lunarBase", 41);
    static readonly marsColonization: CompletableAction = new CompletableAction("marsColonization", 42);
    static values(): CompletableAction[] { return [CompletableAction.middleSchool, CompletableAction.highSchool, CompletableAction.college_music, CompletableAction.college_business, CompletableAction.college_biology, CompletableAction.college_finance, CompletableAction.college_science, CompletableAction.college_computerScience, CompletableAction.college_theater, CompletableAction.college_literature, CompletableAction.college_philosophy, CompletableAction.college_art, CompletableAction.masters, CompletableAction.mba, CompletableAction.phd, CompletableAction.law_school, CompletableAction.medSchool, CompletableAction.police_academy, CompletableAction.militaryAcademy, CompletableAction.homeChef, CompletableAction.nutritionScience, CompletableAction.frugalShopper, CompletableAction.personalFinance, CompletableAction.investmentStrategies, CompletableAction.financialLiteracy, CompletableAction.homeMedic, CompletableAction.meditationExpert, CompletableAction.hygieneExpert, CompletableAction.stocisim, CompletableAction.timeMangement, CompletableAction.selfHelp, CompletableAction.selfImprovement, CompletableAction.french, CompletableAction.japanese, CompletableAction.spanish, CompletableAction.chinese, CompletableAction.diseaseEradicationPolio, CompletableAction.diseaseEradicationMalaria, CompletableAction.cancerResearch, CompletableAction.worldHunger, CompletableAction.sustainableEnergy, CompletableAction.lunarBase, CompletableAction.marsColonization]; }
    static valueOf(n: string): CompletableAction { return (CompletableAction as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getType(): CompletableActionType {
        switch (this) {
            case CompletableAction.middleSchool:
            case CompletableAction.highSchool:
            case CompletableAction.college_music:
            case CompletableAction.college_business:
            case CompletableAction.college_biology:
            case CompletableAction.college_finance:
            case CompletableAction.masters:
            case CompletableAction.medSchool:
            case CompletableAction.mba:
            case CompletableAction.phd:
            case CompletableAction.college_science:
            case CompletableAction.college_computerScience:
            case CompletableAction.college_theater:
            case CompletableAction.college_literature:
            case CompletableAction.police_academy:
            case CompletableAction.law_school:
            case CompletableAction.college_philosophy:
            case CompletableAction.militaryAcademy:
            case CompletableAction.college_art:
                return CompletableActionType.education;
            case CompletableAction.homeChef:
            case CompletableAction.nutritionScience:
            case CompletableAction.frugalShopper:
            case CompletableAction.personalFinance:
            case CompletableAction.investmentStrategies:
            case CompletableAction.financialLiteracy:
            case CompletableAction.homeMedic:
            case CompletableAction.meditationExpert:
            case CompletableAction.hygieneExpert:
            case CompletableAction.stocisim:
            case CompletableAction.timeMangement:
            case CompletableAction.selfHelp:
            case CompletableAction.selfImprovement:
            case CompletableAction.french:
            case CompletableAction.japanese:
            case CompletableAction.spanish:
            case CompletableAction.chinese:
                return CompletableActionType.skill;
            case CompletableAction.diseaseEradicationPolio:
            case CompletableAction.diseaseEradicationMalaria:
            case CompletableAction.cancerResearch:
            case CompletableAction.worldHunger:
            case CompletableAction.sustainableEnergy:
            case CompletableAction.lunarBase:
            case CompletableAction.marsColonization:
                return CompletableActionType.philanthrophy;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case CompletableAction.middleSchool:
                return R.drawable.education_middleschool;
            case CompletableAction.highSchool:
                return R.drawable.education_highschool;
            case CompletableAction.college_music:
                return R.drawable.education_college_music;
            case CompletableAction.college_business:
                return R.drawable.education_college_business;
            case CompletableAction.college_biology:
                return R.drawable.education_college_biology;
            case CompletableAction.college_finance:
                return R.drawable.education_college_finance;
            case CompletableAction.college_computerScience:
                return R.drawable.education_computer_science;
            case CompletableAction.masters:
                return R.drawable.education_masters;
            case CompletableAction.medSchool:
                return R.drawable.education_medschool;
            case CompletableAction.mba:
                return R.drawable.education_mba;
            case CompletableAction.college_science:
                return R.drawable.education_science;
            case CompletableAction.phd:
                return R.drawable.education_phd;
            case CompletableAction.college_theater:
                return R.drawable.education_theater;
            case CompletableAction.college_literature:
                return R.drawable.education_literature;
            case CompletableAction.police_academy:
                return R.drawable.education_policeacademy;
            case CompletableAction.law_school:
                return R.drawable.education_lawschool;
            case CompletableAction.college_philosophy:
                return R.drawable.education_philosophy;
            case CompletableAction.militaryAcademy:
                return R.drawable.education_military;
            case CompletableAction.college_art:
                return R.drawable.education_art;
            case CompletableAction.homeChef:
                return R.drawable.skill_homechef;
            case CompletableAction.nutritionScience:
                return R.drawable.skill_nutritionscience;
            case CompletableAction.frugalShopper:
                return R.drawable.skill_frugalshopper;
            case CompletableAction.personalFinance:
                return R.drawable.skill_personalfinance;
            case CompletableAction.investmentStrategies:
                return R.drawable.skill_investment;
            case CompletableAction.homeMedic:
                return R.drawable.health_selftreatment;
            case CompletableAction.meditationExpert:
                return R.drawable.health_meditation;
            case CompletableAction.hygieneExpert:
                return R.drawable.skill_hygieneexpert;
            case CompletableAction.stocisim:
                return R.drawable.iap_perk_growthmindset;
            case CompletableAction.timeMangement:
                return R.drawable.skill_timemanagement;
            case CompletableAction.selfHelp:
                return R.drawable.skill_selfhelp;
            case CompletableAction.french:
                return Country.france.getImageId();
            case CompletableAction.japanese:
                return Country.japan.getImageId();
            case CompletableAction.spanish:
                return Country.spain.getImageId();
            case CompletableAction.chinese:
                return Country.china.getImageId();
            case CompletableAction.selfImprovement:
                return R.drawable.skill_selfimprovement;
            case CompletableAction.diseaseEradicationPolio:
                return R.drawable.philanthrophy_polio;
            case CompletableAction.diseaseEradicationMalaria:
                return R.drawable.mosquito;
            case CompletableAction.cancerResearch:
                return R.drawable.philanthrophy_cancer;
            case CompletableAction.worldHunger:
                return R.drawable.philanthrophy_worldhunger;
            case CompletableAction.sustainableEnergy:
                return R.drawable.philanthrophy_energy;
            case CompletableAction.lunarBase:
                return R.drawable.philanthrophy_moonbase;
            case CompletableAction.marsColonization:
                return R.drawable.philanthrophy_marscolonization;
            case CompletableAction.financialLiteracy:
                return R.drawable.skill_financialliteracy;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getTitle(): string {
        switch (this) {
            case CompletableAction.middleSchool:
                return Utils.INSTANCE.getString(R.string.Education_Type_MiddleSchool);
            case CompletableAction.highSchool:
                return Utils.INSTANCE.getString(R.string.Education_Type_HighSchool);
            case CompletableAction.college_music:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Music);
            case CompletableAction.college_business:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Business);
            case CompletableAction.college_biology:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Medical);
            case CompletableAction.college_finance:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Finance);
            case CompletableAction.college_science:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Science);
            case CompletableAction.college_computerScience:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_ComputerScience);
            case CompletableAction.college_theater:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Theater);
            case CompletableAction.college_literature:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Literature);
            case CompletableAction.college_philosophy:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Philosophy);
            case CompletableAction.college_art:
                return (Utils.INSTANCE.getString(R.string.Education_Type_College) + " - ") + Utils.INSTANCE.getString(R.string.Education_Type_Degree_Art);
            case CompletableAction.masters:
                return Utils.INSTANCE.getString(R.string.Education_Type_Masters);
            case CompletableAction.mba:
                return Utils.INSTANCE.getString(R.string.Education_Type_MBA);
            case CompletableAction.phd:
                return Utils.INSTANCE.getString(R.string.Education_Type_PHD);
            case CompletableAction.law_school:
                return Utils.INSTANCE.getString(R.string.Education_Type_LawSchool);
            case CompletableAction.medSchool:
                return Utils.INSTANCE.getString(R.string.Education_Type_MedicalSchool);
            case CompletableAction.police_academy:
                return Utils.INSTANCE.getString(R.string.Education_Type_PoliceAcademy);
            case CompletableAction.militaryAcademy:
                return Utils.INSTANCE.getString(R.string.Education_Type_MilitaryAcademy);
            case CompletableAction.homeChef:
                return Utils.INSTANCE.getString(R.string.Education_Skill_HomeChef);
            case CompletableAction.nutritionScience:
                return Utils.INSTANCE.getString(R.string.Education_Skill_NutritionScience);
            case CompletableAction.frugalShopper:
                return Utils.INSTANCE.getString(R.string.Education_Skill_FrugalShopper);
            case CompletableAction.personalFinance:
                return Utils.INSTANCE.getString(R.string.Education_Skill_PersonalFinance);
            case CompletableAction.investmentStrategies:
                return Utils.INSTANCE.getString(R.string.Education_Skill_InvestmentStrategies);
            case CompletableAction.financialLiteracy:
                return Utils.INSTANCE.getString(R.string.Skill_FinancialLiteracy_Title);
            case CompletableAction.homeMedic:
                return Utils.INSTANCE.getString(R.string.Education_Skill_HomeMedic);
            case CompletableAction.meditationExpert:
                return Utils.INSTANCE.getString(R.string.Education_Skill_MeditationExpert);
            case CompletableAction.hygieneExpert:
                return Utils.INSTANCE.getString(R.string.Education_Skill_HygieneExpert);
            case CompletableAction.stocisim:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Stocisim);
            case CompletableAction.timeMangement:
                return Utils.INSTANCE.getString(R.string.Education_Skill_TimeManagement);
            case CompletableAction.selfHelp:
                return Utils.INSTANCE.getString(R.string.Education_Skill_SelfHelp);
            case CompletableAction.selfImprovement:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_SelfImprovement);
            case CompletableAction.french:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_French);
            case CompletableAction.japanese:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_Japanese);
            case CompletableAction.spanish:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_Spanish);
            case CompletableAction.chinese:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_Chinese);
            case CompletableAction.diseaseEradicationPolio:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_diseaseEradicationPolio);
            case CompletableAction.diseaseEradicationMalaria:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_diseaseEradicationMalaria);
            case CompletableAction.cancerResearch:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_cancerResearch);
            case CompletableAction.worldHunger:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_worldHunger);
            case CompletableAction.sustainableEnergy:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_sustainableEnergy);
            case CompletableAction.lunarBase:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_lunarBase);
            case CompletableAction.marsColonization:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_marsColonization);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDescription(): string {
        switch (this) {
            case CompletableAction.homeChef:
                return Utils.INSTANCE.getString(R.string.Education_Skill_HomeChef_Description);
            case CompletableAction.nutritionScience:
                return Utils.INSTANCE.getString(R.string.Education_Skill_NutritionScience_Description);
            case CompletableAction.frugalShopper:
                return Utils.INSTANCE.getString(R.string.Education_Skill_FrugalShopper_Description);
            case CompletableAction.personalFinance:
                return Utils.INSTANCE.getString(R.string.Education_Skill_PersonalFinance_Description);
            case CompletableAction.investmentStrategies:
                return Utils.INSTANCE.getString(R.string.Education_Skill_InvestmentStrategies_Description);
            case CompletableAction.financialLiteracy:
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.Skill_FinancialLiteracy_Description);
                let objArr = [Integer.valueOf(Constants.Skill.INSTANCE.getFinancialLiteracyInterestIncrease())];
                let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                return format;
            case CompletableAction.homeMedic:
                let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                let string2: string = Utils.INSTANCE.getString(R.string.Education_Skill_IncreaseEffectiveness);
                let objArr2 = [HealthEvent.selfTreatment.getTitle()];
                let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
                return format2;
            case CompletableAction.meditationExpert:
                let stringCompanionObject3 = StringCompanionObject.INSTANCE;
                let string3: string = Utils.INSTANCE.getString(R.string.Education_Skill_IncreaseEffectiveness);
                let objArr3 = [HealthEvent.mindfulMeditation.getTitle()];
                let format3: string = String.format(string3, Arrays.copyOf(objArr3, objArr3.length));
                return format3;
            case CompletableAction.hygieneExpert:
                return Utils.INSTANCE.getString(R.string.Education_Skill_HygieneExpert_Description);
            case CompletableAction.stocisim:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Stocisim_Description);
            case CompletableAction.timeMangement:
                return Utils.INSTANCE.getString(R.string.Education_Skill_TimeManagement_Description);
            case CompletableAction.selfHelp:
                return Utils.INSTANCE.getString(R.string.Education_Skill_SelfHelp_Description);
            case CompletableAction.selfImprovement:
                return Utils.INSTANCE.getString(R.string.Education_Skill_SelfImprovement_Description);
            case CompletableAction.french:
            case CompletableAction.japanese:
            case CompletableAction.spanish:
            case CompletableAction.chinese:
                let stringCompanionObject4 = StringCompanionObject.INSTANCE;
                let string4: string = Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_Description);
                let objArr4 = [this.getTitle()];
                let format4: string = String.format(string4, Arrays.copyOf(objArr4, objArr4.length));
                return format4;
            case CompletableAction.diseaseEradicationPolio:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_diseaseEradicationPolio_Description);
            case CompletableAction.diseaseEradicationMalaria:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_diseaseEradicationMalaria_Description);
            case CompletableAction.cancerResearch:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_cancerResearch_Description);
            case CompletableAction.worldHunger:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_worldHunger_Description);
            case CompletableAction.sustainableEnergy:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_sustainableEnergy_Description);
            case CompletableAction.lunarBase:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_lunarBase_Description);
            case CompletableAction.marsColonization:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_marsColonization_Description);
            default:
                return null;
        }
    }
    isLanguage(): boolean {
        let i: CompletableAction = this;
        return (((i === CompletableAction.french) || (i === CompletableAction.japanese)) || (i === CompletableAction.spanish)) || (i === CompletableAction.chinese);
    }
    getCostPerWeek(): BigInteger {
        switch (this) {
            case CompletableAction.middleSchool:
                let valueOf: BigInteger = BigInteger.valueOf(0);
                return valueOf;
            case CompletableAction.highSchool:
                let valueOf2: BigInteger = BigInteger.valueOf(0);
                return valueOf2;
            case CompletableAction.college_music:
            case CompletableAction.college_business:
            case CompletableAction.college_biology:
            case CompletableAction.college_finance:
            case CompletableAction.college_science:
            case CompletableAction.college_computerScience:
            case CompletableAction.college_theater:
            case CompletableAction.college_literature:
            case CompletableAction.college_philosophy:
            case CompletableAction.college_art:
                let valueOf3: BigInteger = BigInteger.valueOf(500);
                return valueOf3;
            case CompletableAction.masters:
                let valueOf4: BigInteger = BigInteger.valueOf(750);
                return valueOf4;
            case CompletableAction.mba:
                let valueOf5: BigInteger = BigInteger.valueOf(1250);
                return valueOf5;
            case CompletableAction.phd:
                let valueOf6: BigInteger = BigInteger.valueOf(600);
                return valueOf6;
            case CompletableAction.law_school:
                let valueOf7: BigInteger = BigInteger.valueOf(1000);
                return valueOf7;
            case CompletableAction.medSchool:
                let valueOf8: BigInteger = BigInteger.valueOf(1000);
                return valueOf8;
            case CompletableAction.police_academy:
                let valueOf9: BigInteger = BigInteger.valueOf(100);
                return valueOf9;
            case CompletableAction.militaryAcademy:
                let valueOf10: BigInteger = BigInteger.valueOf(250);
                return valueOf10;
            case CompletableAction.homeChef:
                let valueOf11: BigInteger = BigInteger.valueOf(250);
                return valueOf11;
            case CompletableAction.nutritionScience:
                let valueOf12: BigInteger = BigInteger.valueOf(500);
                return valueOf12;
            case CompletableAction.frugalShopper:
                let valueOf13: BigInteger = BigInteger.valueOf(250);
                return valueOf13;
            case CompletableAction.personalFinance:
                let valueOf14: BigInteger = BigInteger.valueOf(500);
                return valueOf14;
            case CompletableAction.investmentStrategies:
                let valueOf15: BigInteger = BigInteger.valueOf(750);
                return valueOf15;
            case CompletableAction.financialLiteracy:
                let valueOf16: BigInteger = BigInteger.valueOf(500);
                return valueOf16;
            case CompletableAction.homeMedic:
                let valueOf17: BigInteger = BigInteger.valueOf(300);
                return valueOf17;
            case CompletableAction.meditationExpert:
                let valueOf18: BigInteger = BigInteger.valueOf(300);
                return valueOf18;
            case CompletableAction.hygieneExpert:
                let valueOf19: BigInteger = BigInteger.valueOf(250);
                return valueOf19;
            case CompletableAction.stocisim:
                let valueOf20: BigInteger = BigInteger.valueOf(300);
                return valueOf20;
            case CompletableAction.timeMangement:
                let valueOf21: BigInteger = BigInteger.valueOf(500);
                return valueOf21;
            case CompletableAction.selfHelp:
                let valueOf22: BigInteger = BigInteger.valueOf(300);
                return valueOf22;
            case CompletableAction.selfImprovement:
                let valueOf23: BigInteger = BigInteger.valueOf(500);
                return valueOf23;
            case CompletableAction.french:
            case CompletableAction.japanese:
            case CompletableAction.spanish:
            case CompletableAction.chinese:
                let valueOf24: BigInteger = BigInteger.valueOf(250);
                return valueOf24;
            case CompletableAction.diseaseEradicationPolio:
                return new BigInteger("10000000000");
            case CompletableAction.diseaseEradicationMalaria:
                return new BigInteger("1000000000000");
            case CompletableAction.cancerResearch:
                return new BigInteger("1000000000000000");
            case CompletableAction.worldHunger:
                return new BigInteger("1000000000000000000");
            case CompletableAction.sustainableEnergy:
                return new BigInteger("1000000000000000000000");
            case CompletableAction.lunarBase:
                return new BigInteger("1000000000000000000000000");
            case CompletableAction.marsColonization:
                return new BigInteger("1000000000000000000000000000");
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getPrerequiste(): CompletableAction {
        switch (this) {
            case CompletableAction.middleSchool:
            case CompletableAction.masters:
            case CompletableAction.homeChef:
            case CompletableAction.personalFinance:
            case CompletableAction.homeMedic:
            case CompletableAction.meditationExpert:
            case CompletableAction.hygieneExpert:
            case CompletableAction.stocisim:
            case CompletableAction.timeMangement:
            case CompletableAction.selfHelp:
            case CompletableAction.french:
            case CompletableAction.japanese:
            case CompletableAction.spanish:
            case CompletableAction.chinese:
            case CompletableAction.diseaseEradicationPolio:
            case CompletableAction.diseaseEradicationMalaria:
            case CompletableAction.cancerResearch:
            case CompletableAction.worldHunger:
            case CompletableAction.sustainableEnergy:
            case CompletableAction.lunarBase:
                return null;
            case CompletableAction.highSchool:
                return CompletableAction.middleSchool;
            case CompletableAction.college_music:
            case CompletableAction.college_business:
            case CompletableAction.college_biology:
            case CompletableAction.college_finance:
            case CompletableAction.college_science:
            case CompletableAction.college_computerScience:
            case CompletableAction.college_theater:
            case CompletableAction.college_literature:
            case CompletableAction.college_philosophy:
            case CompletableAction.college_art:
                return CompletableAction.highSchool;
            case CompletableAction.mba:
                return CompletableAction.masters;
            case CompletableAction.phd:
                return CompletableAction.masters;
            case CompletableAction.law_school:
                return CompletableAction.college_philosophy;
            case CompletableAction.medSchool:
                return CompletableAction.college_biology;
            case CompletableAction.police_academy:
                return CompletableAction.highSchool;
            case CompletableAction.militaryAcademy:
                return CompletableAction.highSchool;
            case CompletableAction.nutritionScience:
                return CompletableAction.homeChef;
            case CompletableAction.frugalShopper:
                return CompletableAction.homeChef;
            case CompletableAction.investmentStrategies:
                return CompletableAction.personalFinance;
            case CompletableAction.financialLiteracy:
                return CompletableAction.personalFinance;
            case CompletableAction.selfImprovement:
                return CompletableAction.selfHelp;
            case CompletableAction.marsColonization:
                return CompletableAction.lunarBase;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getTotalCost(): BigInteger {
        let valueOf: BigInteger = BigInteger.valueOf(this.getTimeRequiredInWeeks(GameStateManager.INSTANCE.getPersonState()));
        let multiply: BigInteger = valueOf.multiply(this.getCostPerWeek());
        return multiply;
    }
    getTimeRequiredInWeeks(player: Player): number {
        let closeMindedSkillModifier: number;
        Intrinsics.checkParameterIsNotNull(player, "player");
        let d: number = 0.5;
        switch (this) {
            case CompletableAction.middleSchool:
            case CompletableAction.selfImprovement:
            case CompletableAction.french:
            case CompletableAction.spanish:
                d = 1.5;
                break;
            case CompletableAction.highSchool:
            case CompletableAction.masters:
            case CompletableAction.mba:
            case CompletableAction.militaryAcademy:
            case CompletableAction.japanese:
                d = 2.0;
                break;
            case CompletableAction.college_music:
            case CompletableAction.college_business:
            case CompletableAction.college_biology:
            case CompletableAction.college_finance:
            case CompletableAction.college_science:
            case CompletableAction.college_computerScience:
            case CompletableAction.college_theater:
            case CompletableAction.college_literature:
            case CompletableAction.college_philosophy:
            case CompletableAction.college_art:
            case CompletableAction.law_school:
                d = 3.0;
                break;
            case CompletableAction.phd:
            case CompletableAction.medSchool:
                d = 5.0;
                break;
            case CompletableAction.police_academy:
            case CompletableAction.investmentStrategies:
            case CompletableAction.financialLiteracy:
            case CompletableAction.timeMangement:
            case CompletableAction.selfHelp:
                d = 1.0;
                break;
            case CompletableAction.homeChef:
            case CompletableAction.nutritionScience:
            case CompletableAction.frugalShopper:
            case CompletableAction.personalFinance:
            case CompletableAction.homeMedic:
            case CompletableAction.meditationExpert:
            case CompletableAction.hygieneExpert:
            case CompletableAction.stocisim:
                break;
            case CompletableAction.chinese:
            case CompletableAction.diseaseEradicationPolio:
            case CompletableAction.diseaseEradicationMalaria:
            case CompletableAction.cancerResearch:
            case CompletableAction.worldHunger:
            case CompletableAction.sustainableEnergy:
            case CompletableAction.lunarBase:
            case CompletableAction.marsColonization:
                d = 2.5;
                break;
            default:
                throw new NoWhenBranchMatchedException();
        }
        let workYearLengthWeeks: number = Constants.Time.INSTANCE.getWorkYearLengthWeeks();
        Double.isNaN(workYearLengthWeeks);
        let d2: number = d * workYearLengthWeeks;
        if (this.getType() === CompletableActionType.education) {
            if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.fastLearner)) {
                d2 *= Perk.INSTANCE.getFastLearnerDegreeBoost();
            }
            if (GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.intellectualCuriosity)) {
                d2 *= Trait.INSTANCE.getIntellectualCuriosityBoost();
            }
            if (GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.stupid)) {
                closeMindedSkillModifier = Trait.INSTANCE.getStupidEducationModifier();
                d2 *= closeMindedSkillModifier;
            }
            return JMath.toInt(d2);
        }
        if ((this.getType() === CompletableActionType.skill) && GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.closeMinded)) {
            closeMindedSkillModifier = Trait.INSTANCE.getCloseMindedSkillModifier();
            d2 *= closeMindedSkillModifier;
        }
        return JMath.toInt(d2);
    }
    getProjectCompleteAlertTitle(): string {
        let i: CompletableActionType = this.getType();
        if (i === CompletableActionType.education) {
            return Utils.INSTANCE.getString(R.string.Alert_NewDegree_Title);
        }
        if (i === CompletableActionType.skill) {
            return Utils.INSTANCE.getString(R.string.Alert_NewSkill_Title);
        }
        if (i === CompletableActionType.philanthrophy) {
            return Utils.INSTANCE.getString(R.string.Alert_NewPhilanthropyProject_Title);
        }
        throw new NoWhenBranchMatchedException();
    }
    getProjectCompletedAlertMessage(): string {
        let i: CompletableActionType = this.getType();
        if (i === CompletableActionType.education) {
            let stringCompanionObject = StringCompanionObject.INSTANCE;
            let string: string = Utils.INSTANCE.getString(R.string.Alert_NewDegree_Message);
            let objArr = [this.getTitle()];
            let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
            return format;
        }
        if (i === CompletableActionType.skill) {
            let stringCompanionObject2 = StringCompanionObject.INSTANCE;
            let string2: string = Utils.INSTANCE.getString(R.string.Alert_NewSkill_Message);
            let objArr2 = [this.getTitle()];
            let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
            return format2;
        }
        if (i !== CompletableActionType.philanthrophy) {
            throw new NoWhenBranchMatchedException();
        }
        switch (this) {
            case CompletableAction.diseaseEradicationPolio:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_diseaseEradicationPolio_Message);
            case CompletableAction.diseaseEradicationMalaria:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_diseaseEradicationMalaria_Message);
            case CompletableAction.cancerResearch:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_cancerResearch_Message);
            case CompletableAction.worldHunger:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_worldHunger_Message);
            case CompletableAction.sustainableEnergy:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_sustainableEnergy_Message);
            case CompletableAction.lunarBase:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_lunarBase_Message);
            case CompletableAction.marsColonization:
                return Utils.INSTANCE.getString(R.string.Education_Skill_Lanaguage_marsColonization_Message);
            default:
                return "";
        }
    }
    actionCompletedHandler(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let i: CompletableAction = this;
        if ((i === CompletableAction.selfHelp) || (i === CompletableAction.selfImprovement)) {
            AlertManager.INSTANCE.showNewTraitAcquired(player.getTraitState().addRandomTrait(true, true), this);
        } else {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(this.getProjectCompleteAlertTitle(), this.getProjectCompletedAlertMessage(), this.getImageId(), {
                invoke: () => {
                AlertManager.INSTANCE.rateGamePrompt();
            }
            }), false, 2, null);
        }
    }
    getJobForDegree(): Job {
        switch (this) {
            case CompletableAction.college_music:
                return Job.music;
            case CompletableAction.college_business:
                return Job.business;
            case CompletableAction.college_biology:
                return Job.medical;
            case CompletableAction.college_finance:
                return Job.finance;
            case CompletableAction.college_science:
                return Job.research;
            case CompletableAction.college_computerScience:
                return Job.programmer;
            case CompletableAction.college_theater:
                return Job.actor;
            case CompletableAction.college_literature:
                return Job.teacher;
            case CompletableAction.college_philosophy:
                return Job.lawyer;
            case CompletableAction.college_art:
                return Job.artist;
            default:
                return null;
        }
    }
}
export namespace CompletableAction {
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
        getActions(type: CompletableActionType): CompletableAction[] {
        Intrinsics.checkParameterIsNotNull(type, "type");
        let values: CompletableAction[] = CompletableAction.values();
        let arrayList: ArrayList = new ArrayList();
        for (const completableAction of values) {
            if (completableAction.getType() === type) {
                arrayList.add(completableAction);
            }
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as CompletableAction[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
        getCollegeDegrees(): CompletableAction[] {
        return [CompletableAction.college_music, CompletableAction.college_business, CompletableAction.college_biology, CompletableAction.college_finance, CompletableAction.college_science, CompletableAction.college_computerScience, CompletableAction.college_theater, CompletableAction.college_literature, CompletableAction.college_philosophy, CompletableAction.college_art];
    }
        getGetSandboxCustomizableEducation(): CompletableAction[] {
        let mutableListOf: ArrayList = CollectionsKt.mutableListOf(CompletableAction.middleSchool, CompletableAction.highSchool);
        CollectionsKt.addAll(mutableListOf, CompletableAction.INSTANCE.getCollegeDegrees());
        let array = mutableListOf.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as CompletableAction[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    }
}
CompletableAction.INSTANCE = new CompletableAction.Companion(null);
