// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Arrays, ArraysKt, BigInteger, CollectionsKt, Double, Integer, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, StringCompanionObject, TypeCastException } from "../runtime";
import { AttributeState } from "../Managers/AttributeState";
import { CompletableAction } from "./CompletableAction";
import { CompletableActionState } from "../Managers/CompletableActionState";
import { CompletableActionType } from "./CompletableActionType";
import { Constants } from "../Utils/Constants";
import { EventChoice } from "./EventChoice";
import { EventFrequency } from "./EventFrequency";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { HealthEvent } from "./HealthEvent";
import { IProbableEvent } from "./IProbableEvent";
import { Job } from "./Job";
import { JobState } from "../Managers/JobState";
import { Leisure } from "./Leisure";
import { LoveEvent } from "./LoveEvent";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "./MoneyUpdateType";
import { PersonInteraction } from "./PersonInteraction";
import { Player } from "../Managers/Player";
import { SideHustle } from "./SideHustle";
import { SideHustleState } from "../Managers/SideHustleState";
import { StockState } from "../Managers/StockState";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";

export class RandomEvent extends JEnum implements IProbableEvent {
    static readonly workComplimentedByBoss: RandomEvent = new RandomEvent("workComplimentedByBoss", 0);
    static readonly workAwardedBonus: RandomEvent = new RandomEvent("workAwardedBonus", 1);
    static readonly workNapping: RandomEvent = new RandomEvent("workNapping", 2);
    static readonly workExtraLastMinuteWork: RandomEvent = new RandomEvent("workExtraLastMinuteWork", 3);
    static readonly workSomeoneThrownABottle: RandomEvent = new RandomEvent("workSomeoneThrownABottle", 4);
    static readonly workBigTip: RandomEvent = new RandomEvent("workBigTip", 5);
    static readonly workSomeoneTookSpot: RandomEvent = new RandomEvent("workSomeoneTookSpot", 6);
    static readonly workFreePizza: RandomEvent = new RandomEvent("workFreePizza", 7);
    static readonly workFreePizzaOption2Slices: RandomEvent = new RandomEvent("workFreePizzaOption2Slices", 8);
    static readonly workFreePizzaOptionWholePizza: RandomEvent = new RandomEvent("workFreePizzaOptionWholePizza", 9);
    static readonly workFreePizzaOptionEat3Pizzas: RandomEvent = new RandomEvent("workFreePizzaOptionEat3Pizzas", 10);
    static readonly workArgument: RandomEvent = new RandomEvent("workArgument", 11);
    static readonly workFreeDonuts: RandomEvent = new RandomEvent("workFreeDonuts", 12);
    static readonly workFree100GiftCard: RandomEvent = new RandomEvent("workFree100GiftCard", 13);
    static readonly workFree100GiftCardOptionClaimIt: RandomEvent = new RandomEvent("workFree100GiftCardOptionClaimIt", 14);
    static readonly workFree100GiftCardOptionCloseIt: RandomEvent = new RandomEvent("workFree100GiftCardOptionCloseIt", 15);
    static readonly workInspiringSpeaker: RandomEvent = new RandomEvent("workInspiringSpeaker", 16);
    static readonly workTeamBuildingExercise: RandomEvent = new RandomEvent("workTeamBuildingExercise", 17);
    static readonly workForgotAlarm: RandomEvent = new RandomEvent("workForgotAlarm", 18);
    static readonly workCarAccident: RandomEvent = new RandomEvent("workCarAccident", 19);
    static readonly workGoodConversationPassenger: RandomEvent = new RandomEvent("workGoodConversationPassenger", 20);
    static readonly workGreaseBurn: RandomEvent = new RandomEvent("workGreaseBurn", 21);
    static readonly workDifficultCustomer: RandomEvent = new RandomEvent("workDifficultCustomer", 22);
    static readonly workMundaneWork: RandomEvent = new RandomEvent("workMundaneWork", 23);
    static readonly workBadMarket: RandomEvent = new RandomEvent("workBadMarket", 24);
    static readonly workMultipleDeath: RandomEvent = new RandomEvent("workMultipleDeath", 25);
    static readonly workSavedLives: RandomEvent = new RandomEvent("workSavedLives", 26);
    static readonly workMadeGoodMusic: RandomEvent = new RandomEvent("workMadeGoodMusic", 27);
    static readonly workAcidSpill: RandomEvent = new RandomEvent("workAcidSpill", 28);
    static readonly workGoodResearchFocus: RandomEvent = new RandomEvent("workGoodResearchFocus", 29);
    static readonly workLaidOff: RandomEvent = new RandomEvent("workLaidOff", 30);
    static readonly workTeacherConference: RandomEvent = new RandomEvent("workTeacherConference", 31);
    static readonly workSubituteAnotherTeacher: RandomEvent = new RandomEvent("workSubituteAnotherTeacher", 32);
    static readonly workDifficultStudent: RandomEvent = new RandomEvent("workDifficultStudent", 33);
    static readonly workPoliceShootout: RandomEvent = new RandomEvent("workPoliceShootout", 34);
    static readonly workPoliceFreshDonuts: RandomEvent = new RandomEvent("workPoliceFreshDonuts", 35);
    static readonly workPolicerConfiscateGrass: RandomEvent = new RandomEvent("workPolicerConfiscateGrass", 36);
    static readonly workArmyAccidentWithDrill: RandomEvent = new RandomEvent("workArmyAccidentWithDrill", 37);
    static readonly workArmyLostExercise: RandomEvent = new RandomEvent("workArmyLostExercise", 38);
    static readonly workArmyScreamedAt: RandomEvent = new RandomEvent("workArmyScreamedAt", 39);
    static readonly workLawyerLostCase: RandomEvent = new RandomEvent("workLawyerLostCase", 40);
    static readonly workLawyerWinCase: RandomEvent = new RandomEvent("workLawyerWinCase", 41);
    static readonly workLawyerFrustratedRuling: RandomEvent = new RandomEvent("workLawyerFrustratedRuling", 42);
    static readonly vacationGoodHappyHour: RandomEvent = new RandomEvent("vacationGoodHappyHour", 43);
    static readonly vacationPickpocketed: RandomEvent = new RandomEvent("vacationPickpocketed", 44);
    static readonly vacationBeautifulSunset: RandomEvent = new RandomEvent("vacationBeautifulSunset", 45);
    static readonly vacationSelfReflection: RandomEvent = new RandomEvent("vacationSelfReflection", 46);
    static readonly vacationPulledOffA24HourNap: RandomEvent = new RandomEvent("vacationPulledOffA24HourNap", 47);
    static readonly vacationOutofShowsToWatch: RandomEvent = new RandomEvent("vacationOutofShowsToWatch", 48);
    static readonly vacationDidNotLeaveCouch: RandomEvent = new RandomEvent("vacationDidNotLeaveCouch", 49);
    static readonly vacationDrankTooMuch: RandomEvent = new RandomEvent("vacationDrankTooMuch", 50);
    static readonly vacationTrainDelayed: RandomEvent = new RandomEvent("vacationTrainDelayed", 51);
    static readonly vacationOnlyOneDayLeft: RandomEvent = new RandomEvent("vacationOnlyOneDayLeft", 52);
    static readonly vacationOnlyOneDayLeftOptionABusyTouristSpot: RandomEvent = new RandomEvent("vacationOnlyOneDayLeftOptionABusyTouristSpot", 53);
    static readonly vacationOnlyOneDayLeftOptionGoShopping: RandomEvent = new RandomEvent("vacationOnlyOneDayLeftOptionGoShopping", 54);
    static readonly vacationOnlyOneDayLeftOptionLocalSpot: RandomEvent = new RandomEvent("vacationOnlyOneDayLeftOptionLocalSpot", 55);
    static readonly vacationTravelDelayed: RandomEvent = new RandomEvent("vacationTravelDelayed", 56);
    static readonly vacationPoorChildBeggingForMoney: RandomEvent = new RandomEvent("vacationPoorChildBeggingForMoney", 57);
    static readonly vacationPoorChildBeggingForMoneyOptionGiveFood: RandomEvent = new RandomEvent("vacationPoorChildBeggingForMoneyOptionGiveFood", 58);
    static readonly vacationPoorChildBeggingForMoneyOptionGive10: RandomEvent = new RandomEvent("vacationPoorChildBeggingForMoneyOptionGive10", 59);
    static readonly vacationPoorChildBeggingForMoneyOptionGive200: RandomEvent = new RandomEvent("vacationPoorChildBeggingForMoneyOptionGive200", 60);
    static readonly vacationConnectionWithNature: RandomEvent = new RandomEvent("vacationConnectionWithNature", 61);
    static readonly vacationStrollHealthy: RandomEvent = new RandomEvent("vacationStrollHealthy", 62);
    static readonly vacationRageQuit: RandomEvent = new RandomEvent("vacationRageQuit", 63);
    static readonly vacationBeatHighscore: RandomEvent = new RandomEvent("vacationBeatHighscore", 64);
    static readonly vacationBittenByMosquitos: RandomEvent = new RandomEvent("vacationBittenByMosquitos", 65);
    static readonly vacationPoisonIvy: RandomEvent = new RandomEvent("vacationPoisonIvy", 66);
    static readonly vacationCamping: RandomEvent = new RandomEvent("vacationCamping", 67);
    static readonly vacationCampingBearEatYourFood: RandomEvent = new RandomEvent("vacationCampingBearEatYourFood", 68);
    static readonly vacationCampingBearDestroysYou: RandomEvent = new RandomEvent("vacationCampingBearDestroysYou", 69);
    static readonly vacationCampingBearRunsOff: RandomEvent = new RandomEvent("vacationCampingBearRunsOff", 70);
    static readonly vacationCrowdSurf: RandomEvent = new RandomEvent("vacationCrowdSurf", 71);
    static readonly vacationSomeoneOfferPill: RandomEvent = new RandomEvent("vacationSomeoneOfferPill", 72);
    static readonly vacationSomeoneOfferPillRedPill: RandomEvent = new RandomEvent("vacationSomeoneOfferPillRedPill", 73);
    static readonly vacationSomeoneOfferPillBluePill: RandomEvent = new RandomEvent("vacationSomeoneOfferPillBluePill", 74);
    static readonly vacationSomeoneOfferPillRefuse: RandomEvent = new RandomEvent("vacationSomeoneOfferPillRefuse", 75);
    static readonly vacationAmazingMassage: RandomEvent = new RandomEvent("vacationAmazingMassage", 76);
    static readonly vacationLovingLife: RandomEvent = new RandomEvent("vacationLovingLife", 77);
    static readonly vacationHouseKeeperStoleMoney: RandomEvent = new RandomEvent("vacationHouseKeeperStoleMoney", 78);
    static readonly vacationTeamDefeated: RandomEvent = new RandomEvent("vacationTeamDefeated", 79);
    static readonly vacationTeamWin: RandomEvent = new RandomEvent("vacationTeamWin", 80);
    static readonly vacationTeamGoodMatch: RandomEvent = new RandomEvent("vacationTeamGoodMatch", 81);
    static readonly vacationMetIdolGroup: RandomEvent = new RandomEvent("vacationMetIdolGroup", 82);
    static readonly vacationCrowdSynchronizatio: RandomEvent = new RandomEvent("vacationCrowdSynchronizatio", 83);
    static readonly vacationIcePatch: RandomEvent = new RandomEvent("vacationIcePatch", 84);
    static readonly vacationSlammedIntoTree: RandomEvent = new RandomEvent("vacationSlammedIntoTree", 85);
    static readonly vacationSkiSpeedRecord: RandomEvent = new RandomEvent("vacationSkiSpeedRecord", 86);
    static readonly vacationAmazingEpisode: RandomEvent = new RandomEvent("vacationAmazingEpisode", 87);
    static readonly vacationTooManyTentacles: RandomEvent = new RandomEvent("vacationTooManyTentacles", 88);
    static readonly vacationDanceGood: RandomEvent = new RandomEvent("vacationDanceGood", 89);
    static readonly vacationDanceShakeIt: RandomEvent = new RandomEvent("vacationDanceShakeIt", 90);
    static readonly vacationBullCastrated: RandomEvent = new RandomEvent("vacationBullCastrated", 91);
    static readonly vacationBullSword: RandomEvent = new RandomEvent("vacationBullSword", 92);
    static readonly schoolPanicAttack: RandomEvent = new RandomEvent("schoolPanicAttack", 93);
    static readonly schoolDidWellOnExam: RandomEvent = new RandomEvent("schoolDidWellOnExam", 94);
    static readonly schoolEpiphany: RandomEvent = new RandomEvent("schoolEpiphany", 95);
    static readonly schoolInTheZone: RandomEvent = new RandomEvent("schoolInTheZone", 96);
    static readonly schoolForgotEssay: RandomEvent = new RandomEvent("schoolForgotEssay", 97);
    static readonly schoolForgotEssayOptionQuickEssay: RandomEvent = new RandomEvent("schoolForgotEssayOptionQuickEssay", 98);
    static readonly schoolForgotEssayOptionWriteAllNight: RandomEvent = new RandomEvent("schoolForgotEssayOptionWriteAllNight", 99);
    static readonly schoolForgotEssayOptionCopyFromInternet: RandomEvent = new RandomEvent("schoolForgotEssayOptionCopyFromInternet", 100);
    static readonly schoolTeamProject: RandomEvent = new RandomEvent("schoolTeamProject", 101);
    static readonly schoolNapping: RandomEvent = new RandomEvent("schoolNapping", 102);
    static readonly schoolFightBully: RandomEvent = new RandomEvent("schoolFightBully", 103);
    static readonly schoolFightBullyOptionRunAway: RandomEvent = new RandomEvent("schoolFightBullyOptionRunAway", 104);
    static readonly schoolFightBullyOptionFightHim: RandomEvent = new RandomEvent("schoolFightBullyOptionFightHim", 105);
    static readonly schoolFightBullyOptionPlayDead: RandomEvent = new RandomEvent("schoolFightBullyOptionPlayDead", 106);
    static readonly schoolYourDogAteYourHomework: RandomEvent = new RandomEvent("schoolYourDogAteYourHomework", 107);
    static readonly schoolSubtituteTeacher: RandomEvent = new RandomEvent("schoolSubtituteTeacher", 108);
    static readonly skillProductiveLearning: RandomEvent = new RandomEvent("skillProductiveLearning", 109);
    static readonly skillInspiring: RandomEvent = new RandomEvent("skillInspiring", 110);
    static readonly skillTurnNewRecipe: RandomEvent = new RandomEvent("skillTurnNewRecipe", 111);
    static readonly skillSaveExtra: RandomEvent = new RandomEvent("skillSaveExtra", 112);
    static readonly skillControlYourMind: RandomEvent = new RandomEvent("skillControlYourMind", 113);
    static readonly loveGreatConversation: RandomEvent = new RandomEvent("loveGreatConversation", 114);
    static readonly loveArgument: RandomEvent = new RandomEvent("loveArgument", 115);
    static readonly lovePassionateAfterDinner: RandomEvent = new RandomEvent("lovePassionateAfterDinner", 116);
    static readonly loveYouDidNotMeetAnyone: RandomEvent = new RandomEvent("loveYouDidNotMeetAnyone", 117);
    static readonly loveYouHadAGoodTime: RandomEvent = new RandomEvent("loveYouHadAGoodTime", 118);
    static readonly loveYouHadAGreatTime: RandomEvent = new RandomEvent("loveYouHadAGreatTime", 119);
    static readonly loveBarFight: RandomEvent = new RandomEvent("loveBarFight", 120);
    static readonly loveRejectsAllNight: RandomEvent = new RandomEvent("loveRejectsAllNight", 121);
    static readonly loveShowTerrible: RandomEvent = new RandomEvent("loveShowTerrible", 122);
    static readonly loveShowRipOff: RandomEvent = new RandomEvent("loveShowRipOff", 123);
    static readonly loveSurpassExpectation: RandomEvent = new RandomEvent("loveSurpassExpectation", 124);
    static readonly loveMuseumDiscount: RandomEvent = new RandomEvent("loveMuseumDiscount", 125);
    static readonly lovePonderAncestor: RandomEvent = new RandomEvent("lovePonderAncestor", 126);
    static readonly loveStoodUp: RandomEvent = new RandomEvent("loveStoodUp", 127);
    static readonly loveShowUplifting: RandomEvent = new RandomEvent("loveShowUplifting", 128);
    static readonly loveNoMatches: RandomEvent = new RandomEvent("loveNoMatches", 129);
    static readonly loveStayFriends: RandomEvent = new RandomEvent("loveStayFriends", 130);
    static readonly anySteppedOnDogPoop: RandomEvent = new RandomEvent("anySteppedOnDogPoop", 131);
    static readonly anyPoopedByBird: RandomEvent = new RandomEvent("anyPoopedByBird", 132);
    static readonly anyMugged: RandomEvent = new RandomEvent("anyMugged", 133);
    static readonly anyFoundMoneyOnStreet: RandomEvent = new RandomEvent("anyFoundMoneyOnStreet", 134);
    static readonly anyFlu: RandomEvent = new RandomEvent("anyFlu", 135);
    static readonly anyCold: RandomEvent = new RandomEvent("anyCold", 136);
    static readonly anyHitByCar: RandomEvent = new RandomEvent("anyHitByCar", 137);
    static readonly anyGloomyWeather: RandomEvent = new RandomEvent("anyGloomyWeather", 138);
    static readonly anyCutLittleFinger: RandomEvent = new RandomEvent("anyCutLittleFinger", 139);
    static readonly anyTerribleTraffic: RandomEvent = new RandomEvent("anyTerribleTraffic", 140);
    static readonly anyFellOnStreet: RandomEvent = new RandomEvent("anyFellOnStreet", 141);
    static readonly anyBeautifulWeather: RandomEvent = new RandomEvent("anyBeautifulWeather", 142);
    static readonly anySweetDreams: RandomEvent = new RandomEvent("anySweetDreams", 143);
    static readonly anyWellRested: RandomEvent = new RandomEvent("anyWellRested", 144);
    static readonly anyFoodPoisoning: RandomEvent = new RandomEvent("anyFoodPoisoning", 145);
    static readonly anyLaundryDay: RandomEvent = new RandomEvent("anyLaundryDay", 146);
    static readonly anyChasedByRaccoons: RandomEvent = new RandomEvent("anyChasedByRaccoons", 147);
    static readonly anyFellInManhole: RandomEvent = new RandomEvent("anyFellInManhole", 148);
    static readonly anyPhoneDied: RandomEvent = new RandomEvent("anyPhoneDied", 149);
    static readonly anyFoundDollar: RandomEvent = new RandomEvent("anyFoundDollar", 150);
    static readonly anyFoundWallet: RandomEvent = new RandomEvent("anyFoundWallet", 151);
    static readonly anyFoundWalletKeepCash: RandomEvent = new RandomEvent("anyFoundWalletKeepCash", 152);
    static readonly anyFoundWalletShoppingSpree: RandomEvent = new RandomEvent("anyFoundWalletShoppingSpree", 153);
    static readonly anyFoundWalletReportToPolice: RandomEvent = new RandomEvent("anyFoundWalletReportToPolice", 154);
    static readonly anyGiantPimple: RandomEvent = new RandomEvent("anyGiantPimple", 155);
    static readonly anyNoToiletPaper: RandomEvent = new RandomEvent("anyNoToiletPaper", 156);
    static readonly anyRightSideOfBed: RandomEvent = new RandomEvent("anyRightSideOfBed", 157);
    static readonly anyNiceStroll: RandomEvent = new RandomEvent("anyNiceStroll", 158);
    static readonly appDeveloper_StuckOnBug: RandomEvent = new RandomEvent("appDeveloper_StuckOnBug", 159);
    static readonly appDeveloper_InternetSucks: RandomEvent = new RandomEvent("appDeveloper_InternetSucks", 160);
    static readonly appDeveloper_PatentTroll: RandomEvent = new RandomEvent("appDeveloper_PatentTroll", 161);
    static readonly appDeveloper_ExtraEfficient: RandomEvent = new RandomEvent("appDeveloper_ExtraEfficient", 162);
    static readonly appDeveloper_AppCrashing: RandomEvent = new RandomEvent("appDeveloper_AppCrashing", 163);
    static readonly youTubeStar_deathThreats: RandomEvent = new RandomEvent("youTubeStar_deathThreats", 164);
    static readonly youTubeStar_footageCorrupt: RandomEvent = new RandomEvent("youTubeStar_footageCorrupt", 165);
    static readonly youTubeStar_donationFromFan: RandomEvent = new RandomEvent("youTubeStar_donationFromFan", 166);
    static readonly youTubeStar_IncreaseInSubscribers: RandomEvent = new RandomEvent("youTubeStar_IncreaseInSubscribers", 167);
    static readonly dj_frustrated: RandomEvent = new RandomEvent("dj_frustrated", 168);
    static readonly dj_turntableBroke: RandomEvent = new RandomEvent("dj_turntableBroke", 169);
    static readonly dj_musicCreativityOnFire: RandomEvent = new RandomEvent("dj_musicCreativityOnFire", 170);
    static readonly dj_FanLetters: RandomEvent = new RandomEvent("dj_FanLetters", 171);
    static readonly dj_ToxicComments: RandomEvent = new RandomEvent("dj_ToxicComments", 172);
    static readonly author_backtrak: RandomEvent = new RandomEvent("author_backtrak", 173);
    static readonly author_madeProgress: RandomEvent = new RandomEvent("author_madeProgress", 174);
    static readonly author_glowingReviews: RandomEvent = new RandomEvent("author_glowingReviews", 175);
    static readonly author_stuck: RandomEvent = new RandomEvent("author_stuck", 176);
    static readonly actor_yelledAt: RandomEvent = new RandomEvent("actor_yelledAt", 177);
    static readonly actor_fansHyped: RandomEvent = new RandomEvent("actor_fansHyped", 178);
    static readonly actor_harshCriticism: RandomEvent = new RandomEvent("actor_harshCriticism", 179);
    static readonly actor_accident: RandomEvent = new RandomEvent("actor_accident", 180);
    static readonly actor_nominated: RandomEvent = new RandomEvent("actor_nominated", 181);
    static readonly parents_wontStopNagging: RandomEvent = new RandomEvent("parents_wontStopNagging", 182);
    static readonly parents_bondingMoment: RandomEvent = new RandomEvent("parents_bondingMoment", 183);
    static readonly parents_surprisePresent: RandomEvent = new RandomEvent("parents_surprisePresent", 184);
    static readonly parents_HomeCooking: RandomEvent = new RandomEvent("parents_HomeCooking", 185);
    static readonly parents_CleanYourRoom: RandomEvent = new RandomEvent("parents_CleanYourRoom", 186);
    static readonly parents_ArguingDuringTrip: RandomEvent = new RandomEvent("parents_ArguingDuringTrip", 187);
    static readonly parents_GoodMeal: RandomEvent = new RandomEvent("parents_GoodMeal", 188);
    static readonly prison_riot_beatenUp: RandomEvent = new RandomEvent("prison_riot_beatenUp", 189);
    static readonly prison_riot_chickenedOut: RandomEvent = new RandomEvent("prison_riot_chickenedOut", 190);
    static readonly prison_riot_tookYourCash: RandomEvent = new RandomEvent("prison_riot_tookYourCash", 191);
    static readonly prison_riot_kungfu: RandomEvent = new RandomEvent("prison_riot_kungfu", 192);
    static readonly prison_riot_tooFastForThem: RandomEvent = new RandomEvent("prison_riot_tooFastForThem", 193);
    static readonly prison_escape_success: RandomEvent = new RandomEvent("prison_escape_success", 194);
    static readonly prison_escape_failure_tunnel: RandomEvent = new RandomEvent("prison_escape_failure_tunnel", 195);
    static readonly prison_escape_failure_flushToilet: RandomEvent = new RandomEvent("prison_escape_failure_flushToilet", 196);
    static readonly stockCrash: RandomEvent = new RandomEvent("stockCrash", 197);
    static readonly sports_sprainAnkle: RandomEvent = new RandomEvent("sports_sprainAnkle", 198);
    static readonly sports_tornligament: RandomEvent = new RandomEvent("sports_tornligament", 199);
    static readonly sports_hadABlast: RandomEvent = new RandomEvent("sports_hadABlast", 200);
    static readonly sports_unstoppable: RandomEvent = new RandomEvent("sports_unstoppable", 201);
    static readonly sports_footballTouchdown: RandomEvent = new RandomEvent("sports_footballTouchdown", 202);
    static readonly sports_baseballHomerun: RandomEvent = new RandomEvent("sports_baseballHomerun", 203);
    static readonly sports_basketball3Pointer: RandomEvent = new RandomEvent("sports_basketball3Pointer", 204);
    static readonly sports_sloppy: RandomEvent = new RandomEvent("sports_sloppy", 205);
    static readonly health_supremeConcentration: RandomEvent = new RandomEvent("health_supremeConcentration", 206);
    static readonly health_forgotToSilencePhone: RandomEvent = new RandomEvent("health_forgotToSilencePhone", 207);
    static readonly health_fellAsleep: RandomEvent = new RandomEvent("health_fellAsleep", 208);
    static readonly health_unableToClearMind: RandomEvent = new RandomEvent("health_unableToClearMind", 209);
    static readonly health_overdosed: RandomEvent = new RandomEvent("health_overdosed", 210);
    static readonly health_tookWrongPills: RandomEvent = new RandomEvent("health_tookWrongPills", 211);
    static readonly health_CBDOil: RandomEvent = new RandomEvent("health_CBDOil", 212);
    static readonly health_chinseHerbs: RandomEvent = new RandomEvent("health_chinseHerbs", 213);
    static readonly health_healthierDiet: RandomEvent = new RandomEvent("health_healthierDiet", 214);
    static readonly health_unnecessarySurgery: RandomEvent = new RandomEvent("health_unnecessarySurgery", 215);
    static readonly health_unnecessaryMeds: RandomEvent = new RandomEvent("health_unnecessaryMeds", 216);
    static readonly health_mentalHealthConsulting: RandomEvent = new RandomEvent("health_mentalHealthConsulting", 217);
    static readonly health_sharedHospitalRoom: RandomEvent = new RandomEvent("health_sharedHospitalRoom", 218);
    static readonly health_additionalBills: RandomEvent = new RandomEvent("health_additionalBills", 219);
    static readonly health_lineInfection: RandomEvent = new RandomEvent("health_lineInfection", 220);
    static readonly health_goodNurse: RandomEvent = new RandomEvent("health_goodNurse", 221);
    static readonly health_treatmentGoneWrong: RandomEvent = new RandomEvent("health_treatmentGoneWrong", 222);
    static readonly health_treatmentSuccess: RandomEvent = new RandomEvent("health_treatmentSuccess", 223);
    static readonly health_treatmentNotEffective: RandomEvent = new RandomEvent("health_treatmentNotEffective", 224);
    static readonly health_gotSTD: RandomEvent = new RandomEvent("health_gotSTD", 225);
    static readonly health_disease_heartAttack: RandomEvent = new RandomEvent("health_disease_heartAttack", 226);
    static readonly health_disease_seizure: RandomEvent = new RandomEvent("health_disease_seizure", 227);
    static values(): RandomEvent[] { return [RandomEvent.workComplimentedByBoss, RandomEvent.workAwardedBonus, RandomEvent.workNapping, RandomEvent.workExtraLastMinuteWork, RandomEvent.workSomeoneThrownABottle, RandomEvent.workBigTip, RandomEvent.workSomeoneTookSpot, RandomEvent.workFreePizza, RandomEvent.workFreePizzaOption2Slices, RandomEvent.workFreePizzaOptionWholePizza, RandomEvent.workFreePizzaOptionEat3Pizzas, RandomEvent.workArgument, RandomEvent.workFreeDonuts, RandomEvent.workFree100GiftCard, RandomEvent.workFree100GiftCardOptionClaimIt, RandomEvent.workFree100GiftCardOptionCloseIt, RandomEvent.workInspiringSpeaker, RandomEvent.workTeamBuildingExercise, RandomEvent.workForgotAlarm, RandomEvent.workCarAccident, RandomEvent.workGoodConversationPassenger, RandomEvent.workGreaseBurn, RandomEvent.workDifficultCustomer, RandomEvent.workMundaneWork, RandomEvent.workBadMarket, RandomEvent.workMultipleDeath, RandomEvent.workSavedLives, RandomEvent.workMadeGoodMusic, RandomEvent.workAcidSpill, RandomEvent.workGoodResearchFocus, RandomEvent.workLaidOff, RandomEvent.workTeacherConference, RandomEvent.workSubituteAnotherTeacher, RandomEvent.workDifficultStudent, RandomEvent.workPoliceShootout, RandomEvent.workPoliceFreshDonuts, RandomEvent.workPolicerConfiscateGrass, RandomEvent.workArmyAccidentWithDrill, RandomEvent.workArmyLostExercise, RandomEvent.workArmyScreamedAt, RandomEvent.workLawyerLostCase, RandomEvent.workLawyerWinCase, RandomEvent.workLawyerFrustratedRuling, RandomEvent.vacationGoodHappyHour, RandomEvent.vacationPickpocketed, RandomEvent.vacationBeautifulSunset, RandomEvent.vacationSelfReflection, RandomEvent.vacationPulledOffA24HourNap, RandomEvent.vacationOutofShowsToWatch, RandomEvent.vacationDidNotLeaveCouch, RandomEvent.vacationDrankTooMuch, RandomEvent.vacationTrainDelayed, RandomEvent.vacationOnlyOneDayLeft, RandomEvent.vacationOnlyOneDayLeftOptionABusyTouristSpot, RandomEvent.vacationOnlyOneDayLeftOptionGoShopping, RandomEvent.vacationOnlyOneDayLeftOptionLocalSpot, RandomEvent.vacationTravelDelayed, RandomEvent.vacationPoorChildBeggingForMoney, RandomEvent.vacationPoorChildBeggingForMoneyOptionGiveFood, RandomEvent.vacationPoorChildBeggingForMoneyOptionGive10, RandomEvent.vacationPoorChildBeggingForMoneyOptionGive200, RandomEvent.vacationConnectionWithNature, RandomEvent.vacationStrollHealthy, RandomEvent.vacationRageQuit, RandomEvent.vacationBeatHighscore, RandomEvent.vacationBittenByMosquitos, RandomEvent.vacationPoisonIvy, RandomEvent.vacationCamping, RandomEvent.vacationCampingBearEatYourFood, RandomEvent.vacationCampingBearDestroysYou, RandomEvent.vacationCampingBearRunsOff, RandomEvent.vacationCrowdSurf, RandomEvent.vacationSomeoneOfferPill, RandomEvent.vacationSomeoneOfferPillRedPill, RandomEvent.vacationSomeoneOfferPillBluePill, RandomEvent.vacationSomeoneOfferPillRefuse, RandomEvent.vacationAmazingMassage, RandomEvent.vacationLovingLife, RandomEvent.vacationHouseKeeperStoleMoney, RandomEvent.vacationTeamDefeated, RandomEvent.vacationTeamWin, RandomEvent.vacationTeamGoodMatch, RandomEvent.vacationMetIdolGroup, RandomEvent.vacationCrowdSynchronizatio, RandomEvent.vacationIcePatch, RandomEvent.vacationSlammedIntoTree, RandomEvent.vacationSkiSpeedRecord, RandomEvent.vacationAmazingEpisode, RandomEvent.vacationTooManyTentacles, RandomEvent.vacationDanceGood, RandomEvent.vacationDanceShakeIt, RandomEvent.vacationBullCastrated, RandomEvent.vacationBullSword, RandomEvent.schoolPanicAttack, RandomEvent.schoolDidWellOnExam, RandomEvent.schoolEpiphany, RandomEvent.schoolInTheZone, RandomEvent.schoolForgotEssay, RandomEvent.schoolForgotEssayOptionQuickEssay, RandomEvent.schoolForgotEssayOptionWriteAllNight, RandomEvent.schoolForgotEssayOptionCopyFromInternet, RandomEvent.schoolTeamProject, RandomEvent.schoolNapping, RandomEvent.schoolFightBully, RandomEvent.schoolFightBullyOptionRunAway, RandomEvent.schoolFightBullyOptionFightHim, RandomEvent.schoolFightBullyOptionPlayDead, RandomEvent.schoolYourDogAteYourHomework, RandomEvent.schoolSubtituteTeacher, RandomEvent.skillProductiveLearning, RandomEvent.skillInspiring, RandomEvent.skillTurnNewRecipe, RandomEvent.skillSaveExtra, RandomEvent.skillControlYourMind, RandomEvent.loveGreatConversation, RandomEvent.loveArgument, RandomEvent.lovePassionateAfterDinner, RandomEvent.loveYouDidNotMeetAnyone, RandomEvent.loveYouHadAGoodTime, RandomEvent.loveYouHadAGreatTime, RandomEvent.loveBarFight, RandomEvent.loveRejectsAllNight, RandomEvent.loveShowTerrible, RandomEvent.loveShowRipOff, RandomEvent.loveSurpassExpectation, RandomEvent.loveMuseumDiscount, RandomEvent.lovePonderAncestor, RandomEvent.loveStoodUp, RandomEvent.loveShowUplifting, RandomEvent.loveNoMatches, RandomEvent.loveStayFriends, RandomEvent.anySteppedOnDogPoop, RandomEvent.anyPoopedByBird, RandomEvent.anyMugged, RandomEvent.anyFoundMoneyOnStreet, RandomEvent.anyFlu, RandomEvent.anyCold, RandomEvent.anyHitByCar, RandomEvent.anyGloomyWeather, RandomEvent.anyCutLittleFinger, RandomEvent.anyTerribleTraffic, RandomEvent.anyFellOnStreet, RandomEvent.anyBeautifulWeather, RandomEvent.anySweetDreams, RandomEvent.anyWellRested, RandomEvent.anyFoodPoisoning, RandomEvent.anyLaundryDay, RandomEvent.anyChasedByRaccoons, RandomEvent.anyFellInManhole, RandomEvent.anyPhoneDied, RandomEvent.anyFoundDollar, RandomEvent.anyFoundWallet, RandomEvent.anyFoundWalletKeepCash, RandomEvent.anyFoundWalletShoppingSpree, RandomEvent.anyFoundWalletReportToPolice, RandomEvent.anyGiantPimple, RandomEvent.anyNoToiletPaper, RandomEvent.anyRightSideOfBed, RandomEvent.anyNiceStroll, RandomEvent.appDeveloper_StuckOnBug, RandomEvent.appDeveloper_InternetSucks, RandomEvent.appDeveloper_PatentTroll, RandomEvent.appDeveloper_ExtraEfficient, RandomEvent.appDeveloper_AppCrashing, RandomEvent.youTubeStar_deathThreats, RandomEvent.youTubeStar_footageCorrupt, RandomEvent.youTubeStar_donationFromFan, RandomEvent.youTubeStar_IncreaseInSubscribers, RandomEvent.dj_frustrated, RandomEvent.dj_turntableBroke, RandomEvent.dj_musicCreativityOnFire, RandomEvent.dj_FanLetters, RandomEvent.dj_ToxicComments, RandomEvent.author_backtrak, RandomEvent.author_madeProgress, RandomEvent.author_glowingReviews, RandomEvent.author_stuck, RandomEvent.actor_yelledAt, RandomEvent.actor_fansHyped, RandomEvent.actor_harshCriticism, RandomEvent.actor_accident, RandomEvent.actor_nominated, RandomEvent.parents_wontStopNagging, RandomEvent.parents_bondingMoment, RandomEvent.parents_surprisePresent, RandomEvent.parents_HomeCooking, RandomEvent.parents_CleanYourRoom, RandomEvent.parents_ArguingDuringTrip, RandomEvent.parents_GoodMeal, RandomEvent.prison_riot_beatenUp, RandomEvent.prison_riot_chickenedOut, RandomEvent.prison_riot_tookYourCash, RandomEvent.prison_riot_kungfu, RandomEvent.prison_riot_tooFastForThem, RandomEvent.prison_escape_success, RandomEvent.prison_escape_failure_tunnel, RandomEvent.prison_escape_failure_flushToilet, RandomEvent.stockCrash, RandomEvent.sports_sprainAnkle, RandomEvent.sports_tornligament, RandomEvent.sports_hadABlast, RandomEvent.sports_unstoppable, RandomEvent.sports_footballTouchdown, RandomEvent.sports_baseballHomerun, RandomEvent.sports_basketball3Pointer, RandomEvent.sports_sloppy, RandomEvent.health_supremeConcentration, RandomEvent.health_forgotToSilencePhone, RandomEvent.health_fellAsleep, RandomEvent.health_unableToClearMind, RandomEvent.health_overdosed, RandomEvent.health_tookWrongPills, RandomEvent.health_CBDOil, RandomEvent.health_chinseHerbs, RandomEvent.health_healthierDiet, RandomEvent.health_unnecessarySurgery, RandomEvent.health_unnecessaryMeds, RandomEvent.health_mentalHealthConsulting, RandomEvent.health_sharedHospitalRoom, RandomEvent.health_additionalBills, RandomEvent.health_lineInfection, RandomEvent.health_goodNurse, RandomEvent.health_treatmentGoneWrong, RandomEvent.health_treatmentSuccess, RandomEvent.health_treatmentNotEffective, RandomEvent.health_gotSTD, RandomEvent.health_disease_heartAttack, RandomEvent.health_disease_seizure]; }
    static valueOf(n: string): RandomEvent { return (RandomEvent as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case RandomEvent.workSomeoneTookSpot:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workSomeoneTookSpot);
            case RandomEvent.workSomeoneThrownABottle:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workSomeoneThrownABottle);
            case RandomEvent.workComplimentedByBoss:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workComplimentedByBoss);
            case RandomEvent.workAwardedBonus:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workAwardedBonus);
            case RandomEvent.workNapping:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workNapping);
            case RandomEvent.workExtraLastMinuteWork:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workExtraLastMinuteWork);
            case RandomEvent.workFreePizza:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFreePizza);
            case RandomEvent.workFreePizzaOption2Slices:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFreePizzaOption2Slices);
            case RandomEvent.workFreePizzaOptionWholePizza:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFreePizzaOptionWholePizza);
            case RandomEvent.workFreePizzaOptionEat3Pizzas:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFreePizzaOptionWholePizza);
            case RandomEvent.workArgument:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workArgument);
            case RandomEvent.workFreeDonuts:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFreeDonuts);
            case RandomEvent.workFree100GiftCard:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFree100GiftCard);
            case RandomEvent.workFree100GiftCardOptionClaimIt:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFree100GiftCardOptionClaimIt);
            case RandomEvent.workFree100GiftCardOptionCloseIt:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workFree100GiftCardOptionCloseIt);
            case RandomEvent.workInspiringSpeaker:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workInspiringSpeaker);
            case RandomEvent.workTeamBuildingExercise:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workTeamBuildingExercise);
            case RandomEvent.vacationGoodHappyHour:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationGoodHappyHour);
            case RandomEvent.vacationPickpocketed:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationPickpocketed);
            case RandomEvent.vacationBeautifulSunset:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationBeautifulSunset);
            case RandomEvent.vacationSelfReflection:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationSelfReflection);
            case RandomEvent.vacationPulledOffA24HourNap:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationPulledOffA24HourNap);
            case RandomEvent.vacationDidNotLeaveCouch:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationDidNotLeaveCouch);
            case RandomEvent.vacationDrankTooMuch:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationDrankTooMuch);
            case RandomEvent.vacationOnlyOneDayLeft:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationOnlyOneDayLeft);
            case RandomEvent.vacationOnlyOneDayLeftOptionABusyTouristSpot:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationOnlyOneDayLeftOptionABusyTouristSpot);
            case RandomEvent.vacationOnlyOneDayLeftOptionGoShopping:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationOnlyOneDayLeftOptionGoShopping);
            case RandomEvent.vacationOnlyOneDayLeftOptionLocalSpot:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationOnlyOneDayLeftOptionLocalSpot);
            case RandomEvent.vacationTravelDelayed:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationTravelDelayed);
            case RandomEvent.vacationTrainDelayed:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationTrainDelayed);
            case RandomEvent.vacationPoorChildBeggingForMoney:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationPoorChildBeggingForMoney);
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGiveFood:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationPoorChildBeggingForMoneyOptionGiveFood);
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGive10:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationPoorChildBeggingForMoneyOptionGive10);
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGive200:
                return Utils.INSTANCE.getString(R.string.RandomEvent_vacationPoorChildBeggingForMoneyOptionGive200);
            case RandomEvent.schoolPanicAttack:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolPanicAttack);
            case RandomEvent.schoolDidWellOnExam:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolDidWellOnExam);
            case RandomEvent.schoolEpiphany:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolEpiphany);
            case RandomEvent.schoolInTheZone:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolInTheZone);
            case RandomEvent.schoolForgotEssay:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolForgotEssay);
            case RandomEvent.schoolForgotEssayOptionQuickEssay:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolForgotEssayOptionQuickEssay);
            case RandomEvent.schoolForgotEssayOptionWriteAllNight:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolForgotEssayOptionWriteAllNight);
            case RandomEvent.schoolForgotEssayOptionCopyFromInternet:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolForgotEssayOptionCopyFromInternet);
            case RandomEvent.schoolTeamProject:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolTeamProject);
            case RandomEvent.schoolNapping:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolNapping);
            case RandomEvent.schoolFightBully:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolFightBully);
            case RandomEvent.schoolFightBullyOptionRunAway:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolFightBullyOptionRunAway);
            case RandomEvent.schoolFightBullyOptionFightHim:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolFightBullyOptionFightHim);
            case RandomEvent.schoolFightBullyOptionPlayDead:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolFightBullyOptionPlayDead);
            case RandomEvent.schoolYourDogAteYourHomework:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolYourDogAteYourHomework);
            case RandomEvent.schoolSubtituteTeacher:
                return Utils.INSTANCE.getString(R.string.RandomEvent_schoolSubtituteTeacher);
            case RandomEvent.loveGreatConversation:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveGreatConversation);
            case RandomEvent.loveArgument:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveArgument);
            case RandomEvent.lovePassionateAfterDinner:
                return Utils.INSTANCE.getString(R.string.RandomEvent_lovePassionateAfterDinner);
            case RandomEvent.loveYouDidNotMeetAnyone:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveYouDidNotMeetAnyone);
            case RandomEvent.loveYouHadAGoodTime:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveYouHadAGoodTime);
            case RandomEvent.loveYouHadAGreatTime:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveYouHadAGreatTime);
            case RandomEvent.loveBarFight:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveBarFight);
            case RandomEvent.loveRejectsAllNight:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveRejectsAllNight);
            case RandomEvent.anySteppedOnDogPoop:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anySteppedOnDogFood);
            case RandomEvent.anyPoopedByBird:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyPoopedByBird);
            case RandomEvent.anyMugged:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyMugged);
            case RandomEvent.anyFoundMoneyOnStreet:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundMoneyOnStreet);
            case RandomEvent.anyFlu:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFlu);
            case RandomEvent.anyCold:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyCold);
            case RandomEvent.anyHitByCar:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyHitByCar);
            case RandomEvent.anyGloomyWeather:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyGloomyWeather);
            case RandomEvent.anyCutLittleFinger:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyCutLittleFinger);
            case RandomEvent.anyTerribleTraffic:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyTerribleTraffic);
            case RandomEvent.workForgotAlarm:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workForgotAlarm);
            case RandomEvent.vacationConnectionWithNature:
                return Utils.INSTANCE.getString(R.string.RandomEvent_connectionWithNature);
            case RandomEvent.vacationStrollHealthy:
                return Utils.INSTANCE.getString(R.string.RandomEvent_strollHealthier);
            case RandomEvent.vacationRageQuit:
                return Utils.INSTANCE.getString(R.string.RandomEvent_rageQuit);
            case RandomEvent.vacationBeatHighscore:
                return Utils.INSTANCE.getString(R.string.RandomEvent_beatHighscore);
            case RandomEvent.vacationBittenByMosquitos:
                return Utils.INSTANCE.getString(R.string.RandomEvent_bittenByMosquitos);
            case RandomEvent.vacationPoisonIvy:
                return Utils.INSTANCE.getString(R.string.RandomEvent_poisonIvy);
            case RandomEvent.vacationCamping:
                return Utils.INSTANCE.getString(R.string.RandomEvent_campingBear);
            case RandomEvent.vacationCampingBearEatYourFood:
                return Utils.INSTANCE.getString(R.string.RandomEvent_campingBearOption1Message);
            case RandomEvent.vacationCampingBearDestroysYou:
                return Utils.INSTANCE.getString(R.string.RandomEvent_campingBearOption2Message);
            case RandomEvent.vacationCampingBearRunsOff:
                return Utils.INSTANCE.getString(R.string.RandomEvent_campingBearOption3Message);
            case RandomEvent.vacationCrowdSurf:
                return Utils.INSTANCE.getString(R.string.RandomEvent_crowdsurf);
            case RandomEvent.vacationSomeoneOfferPill:
                return Utils.INSTANCE.getString(R.string.RandomEvent_someoneOfferAPill);
            case RandomEvent.vacationSomeoneOfferPillRedPill:
                return Utils.INSTANCE.getString(R.string.RandomEvent_someoneOfferAPillOption1Message);
            case RandomEvent.vacationSomeoneOfferPillBluePill:
                return Utils.INSTANCE.getString(R.string.RandomEvent_someoneOfferAPillOption2Message);
            case RandomEvent.vacationSomeoneOfferPillRefuse:
                return Utils.INSTANCE.getString(R.string.RandomEvent_someoneOfferAPillOption3Message);
            case RandomEvent.vacationAmazingMassage:
                return Utils.INSTANCE.getString(R.string.RandomEvent_AmazingMassage);
            case RandomEvent.vacationLovingLife:
                return Utils.INSTANCE.getString(R.string.RandomEvent_LovingLife);
            case RandomEvent.loveShowTerrible:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveShowTerrible);
            case RandomEvent.loveShowRipOff:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveRippedOff);
            case RandomEvent.loveSurpassExpectation:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveSurpassExpectation);
            case RandomEvent.loveMuseumDiscount:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveMuseumDiscount);
            case RandomEvent.lovePonderAncestor:
                return Utils.INSTANCE.getString(R.string.RandomEvent_lovePonderAncestor);
            case RandomEvent.loveStoodUp:
                return Utils.INSTANCE.getString(R.string.RandomEvent_loveStoodup);
            case RandomEvent.anyFellOnStreet:
                return Utils.INSTANCE.getString(R.string.RandomEvent_FellOnStreet);
            case RandomEvent.workBigTip:
                return Utils.INSTANCE.getString(R.string.RandomEvent_BigTip);
            case RandomEvent.workCarAccident:
                return Utils.INSTANCE.getString(R.string.RandomEvent_CarAccident);
            case RandomEvent.workGoodConversationPassenger:
                return Utils.INSTANCE.getString(R.string.RandomEvent_GoodConversationPassenger);
            case RandomEvent.workGreaseBurn:
                return Utils.INSTANCE.getString(R.string.RandomEvent_GreaseBurn);
            case RandomEvent.workDifficultCustomer:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DifficultCustomer);
            case RandomEvent.workMundaneWork:
                return Utils.INSTANCE.getString(R.string.RandomEvent_MundaneWork);
            case RandomEvent.workBadMarket:
                return Utils.INSTANCE.getString(R.string.RandomEvent_BadMarket);
            case RandomEvent.workMultipleDeath:
                return Utils.INSTANCE.getString(R.string.RandomEvent_MultipleDeath);
            case RandomEvent.workSavedLives:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SavedLives);
            case RandomEvent.workMadeGoodMusic:
                return Utils.INSTANCE.getString(R.string.RandomEvent_GoodMusic);
            case RandomEvent.vacationOutofShowsToWatch:
                return Utils.INSTANCE.getString(R.string.RandomEvent_RanOutOfShowsToWatch);
            case RandomEvent.vacationHouseKeeperStoleMoney:
                return Utils.INSTANCE.getString(R.string.RandomEvent_HousekeeperStealMoney);
            case RandomEvent.skillProductiveLearning:
                return Utils.INSTANCE.getString(R.string.RandomEvent_ProductiveLearningSkill);
            case RandomEvent.skillInspiring:
                return Utils.INSTANCE.getString(R.string.RandomEvent_LearningInspiring);
            case RandomEvent.skillTurnNewRecipe:
                return Utils.INSTANCE.getString(R.string.RandomEvent_TryNewRecipes);
            case RandomEvent.skillSaveExtra:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SaveExtraMoney);
            case RandomEvent.skillControlYourMind:
                return Utils.INSTANCE.getString(R.string.RandomEvent_LearnToControlYourMind);
            case RandomEvent.loveShowUplifting:
                return Utils.INSTANCE.getString(R.string.RandomEvent_ShowUplifting);
            case RandomEvent.loveNoMatches:
                return Utils.INSTANCE.getString(R.string.RandomEvent_NoMatches);
            case RandomEvent.loveStayFriends:
                return Utils.INSTANCE.getString(R.string.RandomEvent_GoodDateButStayFriends);
            case RandomEvent.anyBeautifulWeather:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyBeautifulWeather);
            case RandomEvent.anySweetDreams:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anySweetDreams);
            case RandomEvent.anyWellRested:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyWellRested);
            case RandomEvent.workAcidSpill:
                return Utils.INSTANCE.getString(R.string.RandomEvent_acidSpill);
            case RandomEvent.workGoodResearchFocus:
                return Utils.INSTANCE.getString(R.string.RandomEvent_researchGoodFocus);
            case RandomEvent.appDeveloper_StuckOnBug:
                return Utils.INSTANCE.getString(R.string.RandomEvent_AppDeveloper_StuckOnBug);
            case RandomEvent.appDeveloper_InternetSucks:
                return Utils.INSTANCE.getString(R.string.RandomEvent_AppDeveloper_InternetSucks);
            case RandomEvent.appDeveloper_PatentTroll:
                return Utils.INSTANCE.getString(R.string.RandomEvent_AppDeveloper_PatentTroll);
            case RandomEvent.appDeveloper_ExtraEfficient:
                return Utils.INSTANCE.getString(R.string.RandomEvent_AppDeveloper_ExtraEfficient);
            case RandomEvent.appDeveloper_AppCrashing:
                return Utils.INSTANCE.getString(R.string.RandomEvent_AppDeveloper_AppCrashing);
            case RandomEvent.youTubeStar_deathThreats:
                return Utils.INSTANCE.getString(R.string.RandomEvent_YouTubeStar_DeathThreats);
            case RandomEvent.youTubeStar_footageCorrupt:
                return Utils.INSTANCE.getString(R.string.RandomEvent_YouTubeStar_FootageCorrupt);
            case RandomEvent.youTubeStar_donationFromFan:
                return Utils.INSTANCE.getString(R.string.RandomEvent_YouTubeStar_DonationFromFan);
            case RandomEvent.youTubeStar_IncreaseInSubscribers:
                return Utils.INSTANCE.getString(R.string.RandomEvent_YouTubeStar_IncreaseSubscriber);
            case RandomEvent.dj_frustrated:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DJ_Frustrated);
            case RandomEvent.dj_turntableBroke:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DJ_TurntableBroke);
            case RandomEvent.dj_musicCreativityOnFire:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DJ_MusicCreativity);
            case RandomEvent.dj_FanLetters:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DJ_FanLetters);
            case RandomEvent.dj_ToxicComments:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DJ_ToxicComment);
            case RandomEvent.parents_wontStopNagging:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Parents_WontStopNagging);
            case RandomEvent.parents_bondingMoment:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Parents_BondingMoment);
            case RandomEvent.parents_surprisePresent:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Parents_SurprisePresent);
            case RandomEvent.parents_HomeCooking:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Parents_HomeCooking);
            case RandomEvent.parents_CleanYourRoom:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Parents_CleanYourClean);
            case RandomEvent.parents_ArguingDuringTrip:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Parents_ArguingDuringTrip);
            case RandomEvent.parents_GoodMeal:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Parents_GoodMeal);
            case RandomEvent.workLaidOff:
                return Utils.INSTANCE.getString(R.string.RandomEvent_workLaidOff);
            case RandomEvent.anyFoodPoisoning:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFoodPoisoning);
            case RandomEvent.anyLaundryDay:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyLaundryDay);
            case RandomEvent.anyChasedByRaccoons:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyChasedByRaccoons);
            case RandomEvent.anyFellInManhole:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFellInManhole);
            case RandomEvent.anyFoundDollar:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundDollar);
            case RandomEvent.anyFoundWallet:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundWallet);
            case RandomEvent.anyFoundWalletKeepCash:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundWalletKeepCash);
            case RandomEvent.anyFoundWalletShoppingSpree:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundWalletShoppingSpree);
            case RandomEvent.anyFoundWalletReportToPolice:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundWaletReportToPolice);
            case RandomEvent.anyGiantPimple:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyGiantPimple);
            case RandomEvent.anyNoToiletPaper:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyNoToiletPaper);
            case RandomEvent.anyRightSideOfBed:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyRightSideOfBed);
            case RandomEvent.anyNiceStroll:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyNiceStroll);
            case RandomEvent.anyPhoneDied:
                return Utils.INSTANCE.getString(R.string.RandomEvent_anyPhoneDied);
            case RandomEvent.prison_riot_beatenUp:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonRiot_YouGotAnniliated);
            case RandomEvent.prison_riot_chickenedOut:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonRiot_ChickenedOut);
            case RandomEvent.prison_riot_tookYourCash:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonRiot_TakeYourCash);
            case RandomEvent.prison_riot_kungfu:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonRiot_KungFu);
            case RandomEvent.prison_riot_tooFastForThem:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonRiot_TooFast);
            case RandomEvent.prison_escape_success:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonEscape_Escaped);
            case RandomEvent.prison_escape_failure_tunnel:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonEscape_CaughtTunnel);
            case RandomEvent.prison_escape_failure_flushToilet:
                return Utils.INSTANCE.getString(R.string.RandomEvent_PrisonEscape_CaughtFlush);
            case RandomEvent.workTeacherConference:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_Teacher_Conference);
            case RandomEvent.workSubituteAnotherTeacher:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_Teacher_SubstituteAnotherTeacher);
            case RandomEvent.workDifficultStudent:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_Teacher_DifficultStudents);
            case RandomEvent.author_backtrak:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Author_Backtrack);
            case RandomEvent.author_madeProgress:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Author_MadeProgress);
            case RandomEvent.author_glowingReviews:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Author_GlowingReviews);
            case RandomEvent.author_stuck:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Author_Stuck);
            case RandomEvent.actor_yelledAt:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Actor_YelledAt);
            case RandomEvent.actor_fansHyped:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Actor_FansHyped);
            case RandomEvent.actor_harshCriticism:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Actor_HarshCriticism);
            case RandomEvent.actor_accident:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Actor_Accident);
            case RandomEvent.actor_nominated:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SideHustle_Actor_Nominated);
            case RandomEvent.workPoliceShootout:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_PoliceShootOut);
            case RandomEvent.workPoliceFreshDonuts:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_PoliceFreshDonuts);
            case RandomEvent.workPolicerConfiscateGrass:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_PoliceConfiscateGrass);
            case RandomEvent.workArmyAccidentWithDrill:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_ArmyAccidentWithDrill);
            case RandomEvent.workArmyLostExercise:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_ArmyLostExercise);
            case RandomEvent.workArmyScreamedAt:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_ArmyScreamedAt);
            case RandomEvent.workLawyerLostCase:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_LawyerLostCase);
            case RandomEvent.workLawyerWinCase:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_LawyerWinCase);
            case RandomEvent.workLawyerFrustratedRuling:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Work_LawyerFrustratedRuling);
            case RandomEvent.stockCrash:
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.RandomEvent_StockCrash);
                let stockCrashPercent: number = Constants.RandomEvent.INSTANCE.getStockCrashPercent();
                let d: number = 100;
                Double.isNaN(d);
                let objArr = [Integer.valueOf(JMath.toInt((stockCrashPercent * d)))];
                let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                return format;
            case RandomEvent.vacationTeamDefeated:
                return Utils.INSTANCE.getString(R.string.RandomEvent_TeamDefeated);
            case RandomEvent.vacationTeamWin:
                return Utils.INSTANCE.getString(R.string.RandomEvent_TeamWin);
            case RandomEvent.vacationTeamGoodMatch:
                return Utils.INSTANCE.getString(R.string.RandomEvent_TeamGoodMatch);
            case RandomEvent.vacationMetIdolGroup:
                return Utils.INSTANCE.getString(R.string.RandomEvent_MetIdolGroup);
            case RandomEvent.vacationCrowdSynchronizatio:
                return Utils.INSTANCE.getString(R.string.RandomEvent_CrowdSynchronizatio);
            case RandomEvent.vacationIcePatch:
                return Utils.INSTANCE.getString(R.string.RandomEvent_IcePatch);
            case RandomEvent.vacationSlammedIntoTree:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SlammedIntoTree);
            case RandomEvent.vacationSkiSpeedRecord:
                return Utils.INSTANCE.getString(R.string.RandomEvent_SkiSpeedRecord);
            case RandomEvent.vacationAmazingEpisode:
                return Utils.INSTANCE.getString(R.string.RandomEvent_AmazingEpisode);
            case RandomEvent.vacationTooManyTentacles:
                return Utils.INSTANCE.getString(R.string.RandomEvent_TooManyTentacles);
            case RandomEvent.vacationDanceGood:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DanceGood);
            case RandomEvent.vacationDanceShakeIt:
                return Utils.INSTANCE.getString(R.string.RandomEvent_DanceShakeIt);
            case RandomEvent.vacationBullCastrated:
                return Utils.INSTANCE.getString(R.string.RandomEvent_BullCastrated);
            case RandomEvent.vacationBullSword:
                return Utils.INSTANCE.getString(R.string.RandomEvent_BullSword);
            case RandomEvent.sports_sprainAnkle:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_SprainAnkle);
            case RandomEvent.sports_tornligament:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_TornLigament);
            case RandomEvent.sports_hadABlast:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_HadABlast);
            case RandomEvent.sports_unstoppable:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_Unstoppable);
            case RandomEvent.sports_footballTouchdown:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_FootballTouchdown);
            case RandomEvent.sports_baseballHomerun:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_BaseballHomerun);
            case RandomEvent.sports_basketball3Pointer:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_Basketball3Pointer);
            case RandomEvent.sports_sloppy:
                return Utils.INSTANCE.getString(R.string.RandomEvent_Sport_Sloppy);
            case RandomEvent.health_supremeConcentration:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_supremeConcentration);
            case RandomEvent.health_forgotToSilencePhone:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_forgotToSilencePhone);
            case RandomEvent.health_fellAsleep:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_fellAsleep);
            case RandomEvent.health_unableToClearMind:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_unableToClearMind);
            case RandomEvent.health_overdosed:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_overdosed);
            case RandomEvent.health_tookWrongPills:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_tookWrongPills);
            case RandomEvent.health_CBDOil:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_CBDOil);
            case RandomEvent.health_chinseHerbs:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_chineseHerbs);
            case RandomEvent.health_healthierDiet:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_healthierDiet);
            case RandomEvent.health_unnecessarySurgery:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_unneccessarySurgery);
            case RandomEvent.health_unnecessaryMeds:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_unneccessaryMeds);
            case RandomEvent.health_mentalHealthConsulting:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_mentalHealthConsulting);
            case RandomEvent.health_sharedHospitalRoom:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_sharedHospitalRoom);
            case RandomEvent.health_additionalBills:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_additionalBills);
            case RandomEvent.health_lineInfection:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_lineInfection);
            case RandomEvent.health_goodNurse:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_goodNurse);
            case RandomEvent.health_treatmentGoneWrong:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_treatmentGoneWrong);
            case RandomEvent.health_treatmentSuccess:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_treatmentSuccess);
            case RandomEvent.health_treatmentNotEffective:
                return Utils.INSTANCE.getString(R.string.RandomEvent_health_treatmentNotEffective);
            case RandomEvent.health_gotSTD:
                return Utils.INSTANCE.getString(R.string.RandomEvent_GotSTD);
            case RandomEvent.health_disease_heartAttack:
                return Utils.INSTANCE.getString(R.string.Random_Event_HeartAttack);
            case RandomEvent.health_disease_seizure:
                return Utils.INSTANCE.getString(R.string.Random_Event_Seizure);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getModifiers(): Modifiers {
        let modifiers: Modifiers;
        switch (this) {
            case RandomEvent.workComplimentedByBoss:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workAwardedBonus:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workNapping:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workExtraLastMinuteWork:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.workSomeoneThrownABottle:
                modifiers = new Modifiers(-5.0, 0.0, 0.0);
                break;
            case RandomEvent.workBigTip:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workSomeoneTookSpot:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.workFreePizza:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workFreePizzaOption2Slices:
                modifiers = new Modifiers(0.0, 3.0, 0.0);
                break;
            case RandomEvent.workFreePizzaOptionWholePizza:
                modifiers = new Modifiers(-3.0, 5.0, 0.0);
                break;
            case RandomEvent.workFreePizzaOptionEat3Pizzas:
                modifiers = new Modifiers(-10.0, -3.0, 0.0);
                break;
            case RandomEvent.workArgument:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.workFreeDonuts:
                modifiers = new Modifiers(0.0, 3.0, 0.0);
                break;
            case RandomEvent.workFree100GiftCard:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workFree100GiftCardOptionClaimIt:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workFree100GiftCardOptionCloseIt:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workInspiringSpeaker:
                modifiers = new Modifiers(0.0, 0.0, 3.0);
                break;
            case RandomEvent.workTeamBuildingExercise:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.workForgotAlarm:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workCarAccident:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workGoodConversationPassenger:
                modifiers = new Modifiers(-30.0, 5.0, 0.0);
                break;
            case RandomEvent.workGreaseBurn:
                modifiers = new Modifiers(-10.0, 0.0, 0.0);
                break;
            case RandomEvent.workDifficultCustomer:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.workMundaneWork:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.workBadMarket:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.workMultipleDeath:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.workSavedLives:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.workMadeGoodMusic:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.workAcidSpill:
                modifiers = new Modifiers(-20.0, 0.0, 0.0);
                break;
            case RandomEvent.workGoodResearchFocus:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.workLaidOff:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.workTeacherConference:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.workSubituteAnotherTeacher:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.workDifficultStudent:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.workPoliceShootout:
                modifiers = new Modifiers(-25.0, 0.0, 0.0);
                break;
            case RandomEvent.workPoliceFreshDonuts:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.workPolicerConfiscateGrass:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.workArmyAccidentWithDrill:
                modifiers = new Modifiers(-10.0, 0.0, 0.0);
                break;
            case RandomEvent.workArmyLostExercise:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.workArmyScreamedAt:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.workLawyerLostCase:
                modifiers = new Modifiers(0.0, -10.0, 0.0);
                break;
            case RandomEvent.workLawyerWinCase:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.workLawyerFrustratedRuling:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.vacationGoodHappyHour:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationPickpocketed:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationBeautifulSunset:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.vacationSelfReflection:
                modifiers = new Modifiers(0.0, 0.0, 10.0);
                break;
            case RandomEvent.vacationPulledOffA24HourNap:
                modifiers = new Modifiers(5.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationOutofShowsToWatch:
                modifiers = new Modifiers(0.0, 0.0, -3.0);
                break;
            case RandomEvent.vacationDidNotLeaveCouch:
                modifiers = new Modifiers(0.0, 3.0, 0.0);
                break;
            case RandomEvent.vacationDrankTooMuch:
                modifiers = new Modifiers(-10.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationTrainDelayed:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationOnlyOneDayLeft:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationOnlyOneDayLeftOptionABusyTouristSpot:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationOnlyOneDayLeftOptionGoShopping:
                modifiers = new Modifiers(0.0, 3.0, 0.0);
                break;
            case RandomEvent.vacationOnlyOneDayLeftOptionLocalSpot:
                modifiers = new Modifiers(0.0, 8.0, 0.0);
                break;
            case RandomEvent.vacationTravelDelayed:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationPoorChildBeggingForMoney:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGiveFood:
                modifiers = new Modifiers(0.0, 0.0, -3.0);
                break;
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGive10:
                modifiers = new Modifiers(0.0, 3.0, 0.0);
                break;
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGive200:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationConnectionWithNature:
                modifiers = new Modifiers(0.0, 0.0, 5.0);
                break;
            case RandomEvent.vacationStrollHealthy:
                modifiers = new Modifiers(3.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationRageQuit:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.vacationBeatHighscore:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.vacationBittenByMosquitos:
                modifiers = new Modifiers(-5.0, -5.0, 0.0);
                break;
            case RandomEvent.vacationPoisonIvy:
                modifiers = new Modifiers(-20.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationCamping:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationCampingBearEatYourFood:
                modifiers = new Modifiers(0.0, -5.0, -10.0);
                break;
            case RandomEvent.vacationCampingBearDestroysYou:
                modifiers = new Modifiers(-100.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationCampingBearRunsOff:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationCrowdSurf:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.vacationSomeoneOfferPill:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationSomeoneOfferPillRedPill:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.vacationSomeoneOfferPillBluePill:
                modifiers = new Modifiers(-30.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationSomeoneOfferPillRefuse:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationAmazingMassage:
                modifiers = new Modifiers(10.0, 0.0, 5.0);
                break;
            case RandomEvent.vacationLovingLife:
                modifiers = new Modifiers(0.0, 5.0, 10.0);
                break;
            case RandomEvent.vacationHouseKeeperStoleMoney:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationTeamDefeated:
                modifiers = new Modifiers(0.0, -10.0, 0.0);
                break;
            case RandomEvent.vacationTeamWin:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.vacationTeamGoodMatch:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.vacationMetIdolGroup:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.vacationCrowdSynchronizatio:
                modifiers = new Modifiers(0.0, 5.0, 5.0);
                break;
            case RandomEvent.vacationIcePatch:
                modifiers = new Modifiers(-5.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationSlammedIntoTree:
                modifiers = new Modifiers(-25.0, 0.0, 0.0);
                break;
            case RandomEvent.vacationSkiSpeedRecord:
                modifiers = new Modifiers(0.0, 10.0, 10.0);
                break;
            case RandomEvent.vacationAmazingEpisode:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.vacationTooManyTentacles:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.vacationDanceGood:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.vacationDanceShakeIt:
                modifiers = new Modifiers(0.0, 8.0, 0.0);
                break;
            case RandomEvent.vacationBullCastrated:
                modifiers = new Modifiers(0.0, 10.0, -5.0);
                break;
            case RandomEvent.vacationBullSword:
                modifiers = new Modifiers(0.0, 10.0, -2.0);
                break;
            case RandomEvent.schoolPanicAttack:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.schoolDidWellOnExam:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.schoolEpiphany:
                modifiers = new Modifiers(0.0, 0.0, 10.0);
                break;
            case RandomEvent.schoolInTheZone:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolForgotEssay:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolForgotEssayOptionQuickEssay:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolForgotEssayOptionWriteAllNight:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.schoolForgotEssayOptionCopyFromInternet:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolTeamProject:
                modifiers = new Modifiers(0.0, -5.0, -5.0);
                break;
            case RandomEvent.schoolNapping:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolFightBully:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolFightBullyOptionRunAway:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.schoolFightBullyOptionFightHim:
                modifiers = new Modifiers(-20.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolFightBullyOptionPlayDead:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolYourDogAteYourHomework:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.schoolSubtituteTeacher:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.skillProductiveLearning:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.skillInspiring:
                modifiers = new Modifiers(0.0, 0.0, 8.0);
                break;
            case RandomEvent.skillTurnNewRecipe:
                modifiers = new Modifiers(10.0, 0.0, 0.0);
                break;
            case RandomEvent.skillSaveExtra:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.skillControlYourMind:
                modifiers = new Modifiers(0.0, 0.0, 10.0);
                break;
            case RandomEvent.loveGreatConversation:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.loveArgument:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.lovePassionateAfterDinner:
                modifiers = new Modifiers(0.0, 20.0, 0.0);
                break;
            case RandomEvent.loveYouDidNotMeetAnyone:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.loveYouHadAGoodTime:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.loveYouHadAGreatTime:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.loveBarFight:
                modifiers = new Modifiers(-10.0, 0.0, -10.0);
                break;
            case RandomEvent.loveRejectsAllNight:
                modifiers = new Modifiers(0.0, -5.0, -10.0);
                break;
            case RandomEvent.loveShowTerrible:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.loveShowRipOff:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.loveSurpassExpectation:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.loveMuseumDiscount:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.lovePonderAncestor:
                modifiers = new Modifiers(0.0, 0.0, 5.0);
                break;
            case RandomEvent.loveStoodUp:
                modifiers = new Modifiers(0.0, -10.0, 0.0);
                break;
            case RandomEvent.loveShowUplifting:
                modifiers = new Modifiers(0.0, 5.0, 5.0);
                break;
            case RandomEvent.loveNoMatches:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.loveStayFriends:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.anySteppedOnDogPoop:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.anyPoopedByBird:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.anyMugged:
                modifiers = new Modifiers(0.0, -10.0, 0.0);
                break;
            case RandomEvent.anyFoundMoneyOnStreet:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.anyFlu:
                modifiers = new Modifiers(-12.0, 0.0, 0.0);
                break;
            case RandomEvent.anyCold:
                modifiers = new Modifiers(-8.0, 0.0, 0.0);
                break;
            case RandomEvent.anyHitByCar:
                modifiers = new Modifiers(-50.0, 0.0, 0.0);
                break;
            case RandomEvent.anyGloomyWeather:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.anyCutLittleFinger:
                modifiers = new Modifiers(-5.0, 0.0, 0.0);
                break;
            case RandomEvent.anyTerribleTraffic:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.anyFellOnStreet:
                modifiers = new Modifiers(-5.0, 0.0, 0.0);
                break;
            case RandomEvent.anyBeautifulWeather:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.anySweetDreams:
                modifiers = new Modifiers(0.0, 0.0, 10.0);
                break;
            case RandomEvent.anyWellRested:
                modifiers = new Modifiers(5.0, 0.0, 0.0);
                break;
            case RandomEvent.anyFoodPoisoning:
                modifiers = new Modifiers(-5.0, 0.0, 0.0);
                break;
            case RandomEvent.anyLaundryDay:
                modifiers = new Modifiers(0.0, -3.0, 0.0);
                break;
            case RandomEvent.anyChasedByRaccoons:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.anyFellInManhole:
                modifiers = new Modifiers(-8.0, 0.0, 0.0);
                break;
            case RandomEvent.anyPhoneDied:
                modifiers = new Modifiers(0.0, 0.0, -3.0);
                break;
            case RandomEvent.anyFoundDollar:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.anyFoundWallet:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.anyFoundWalletKeepCash:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.anyFoundWalletShoppingSpree:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.anyFoundWalletReportToPolice:
                modifiers = new Modifiers(0.0, 0.0, 10.0);
                break;
            case RandomEvent.anyGiantPimple:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.anyNoToiletPaper:
                modifiers = new Modifiers(0.0, -3.0, -3.0);
                break;
            case RandomEvent.anyRightSideOfBed:
                modifiers = new Modifiers(0.0, 8.0, 0.0);
                break;
            case RandomEvent.anyNiceStroll:
                modifiers = new Modifiers(0.0, 0.0, 5.0);
                break;
            case RandomEvent.appDeveloper_StuckOnBug:
                modifiers = new Modifiers(0.0, 0.0, -8.0);
                break;
            case RandomEvent.appDeveloper_InternetSucks:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.appDeveloper_PatentTroll:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.appDeveloper_ExtraEfficient:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.appDeveloper_AppCrashing:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.youTubeStar_deathThreats:
                modifiers = new Modifiers(0.0, -5.0, -5.0);
                break;
            case RandomEvent.youTubeStar_footageCorrupt:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.youTubeStar_donationFromFan:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.youTubeStar_IncreaseInSubscribers:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.dj_frustrated:
                modifiers = new Modifiers(0.0, -5.0, -5.0);
                break;
            case RandomEvent.dj_turntableBroke:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.dj_musicCreativityOnFire:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.dj_FanLetters:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.dj_ToxicComments:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.author_backtrak:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.author_madeProgress:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.author_glowingReviews:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.author_stuck:
                modifiers = new Modifiers(0.0, 0.0, -8.0);
                break;
            case RandomEvent.actor_yelledAt:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case RandomEvent.actor_fansHyped:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.actor_harshCriticism:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.actor_accident:
                modifiers = new Modifiers(-10.0, 0.0, 0.0);
                break;
            case RandomEvent.actor_nominated:
                modifiers = new Modifiers(0.0, 20.0, 0.0);
                break;
            case RandomEvent.parents_wontStopNagging:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.parents_bondingMoment:
                modifiers = new Modifiers(0.0, 5.0, 10.0);
                break;
            case RandomEvent.parents_surprisePresent:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.parents_HomeCooking:
                modifiers = new Modifiers(5.0, 5.0, 0.0);
                break;
            case RandomEvent.parents_CleanYourRoom:
                modifiers = new Modifiers(0.0, -5.0, 0.0);
                break;
            case RandomEvent.parents_ArguingDuringTrip:
                modifiers = new Modifiers(0.0, 0.0, -20.0);
                break;
            case RandomEvent.parents_GoodMeal:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.prison_riot_beatenUp:
                modifiers = new Modifiers(-50.0, 0.0, 0.0);
                break;
            case RandomEvent.prison_riot_chickenedOut:
                modifiers = new Modifiers(0.0, 0.0, -20.0);
                break;
            case RandomEvent.prison_riot_tookYourCash:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.prison_riot_kungfu:
                modifiers = new Modifiers(0.0, 30.0, 0.0);
                break;
            case RandomEvent.prison_riot_tooFastForThem:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.prison_escape_success:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.prison_escape_failure_tunnel:
                modifiers = new Modifiers(0.0, -25.0, 0.0);
                break;
            case RandomEvent.prison_escape_failure_flushToilet:
                modifiers = new Modifiers(-25.0, 0.0, 0.0);
                break;
            case RandomEvent.stockCrash:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.sports_sprainAnkle:
                modifiers = new Modifiers(-10.0, 0.0, 0.0);
                break;
            case RandomEvent.sports_tornligament:
                modifiers = new Modifiers(-20.0, 0.0, 0.0);
                break;
            case RandomEvent.sports_hadABlast:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case RandomEvent.sports_unstoppable:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.sports_footballTouchdown:
                modifiers = new Modifiers(0.0, 5.0, 5.0);
                break;
            case RandomEvent.sports_baseballHomerun:
                modifiers = new Modifiers(0.0, 5.0, 5.0);
                break;
            case RandomEvent.sports_basketball3Pointer:
                modifiers = new Modifiers(0.0, 5.0, 5.0);
                break;
            case RandomEvent.sports_sloppy:
                modifiers = new Modifiers(0.0, -10.0, 0.0);
                break;
            case RandomEvent.health_supremeConcentration:
                modifiers = new Modifiers(0.0, 0.0, 20.0);
                break;
            case RandomEvent.health_forgotToSilencePhone:
                modifiers = new Modifiers(0.0, 0.0, -3.0);
                break;
            case RandomEvent.health_fellAsleep:
                modifiers = new Modifiers(2.0, 0.0, 0.0);
                break;
            case RandomEvent.health_unableToClearMind:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.health_overdosed:
                modifiers = new Modifiers(-30.0, 0.0, 0.0);
                break;
            case RandomEvent.health_tookWrongPills:
                modifiers = new Modifiers(-12.0, 0.0, 0.0);
                break;
            case RandomEvent.health_CBDOil:
                modifiers = new Modifiers(-8.0, 0.0, 0.0);
                break;
            case RandomEvent.health_chinseHerbs:
                modifiers = new Modifiers(10.0, 0.0, 0.0);
                break;
            case RandomEvent.health_healthierDiet:
                modifiers = new Modifiers(5.0, 0.0, 0.0);
                break;
            case RandomEvent.health_unnecessarySurgery:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.health_unnecessaryMeds:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.health_mentalHealthConsulting:
                modifiers = new Modifiers(0.0, 0.0, 10.0);
                break;
            case RandomEvent.health_sharedHospitalRoom:
                modifiers = new Modifiers(0.0, 0.0, -5.0);
                break;
            case RandomEvent.health_additionalBills:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case RandomEvent.health_lineInfection:
                modifiers = new Modifiers(-10.0, 0.0, 0.0);
                break;
            case RandomEvent.health_goodNurse:
                modifiers = new Modifiers(10.0, 0.0, 10.0);
                break;
            case RandomEvent.health_treatmentGoneWrong:
                modifiers = new Modifiers(-80.0, 0.0, 0.0);
                break;
            case RandomEvent.health_treatmentSuccess:
                modifiers = new Modifiers(50.0, 0.0, 0.0);
                break;
            case RandomEvent.health_treatmentNotEffective:
                modifiers = new Modifiers(-20.0, 0.0, 0.0);
                break;
            case RandomEvent.health_gotSTD:
                modifiers = new Modifiers(0.0, 10.0, 0.0);
                break;
            case RandomEvent.health_disease_heartAttack:
                modifiers = new Modifiers(-50.0, 0.0, 0.0);
                break;
            case RandomEvent.health_disease_seizure:
                modifiers = new Modifiers(-30.0, 0.0, 0.0);
                break;
            default:
                throw new NoWhenBranchMatchedException();
        }
        if (!GameStateManager.INSTANCE.getPersonState().getCompletableActionState().isCompleted(CompletableAction.stocisim)) {
            return modifiers;
        }
        let d: number = 0;
        if (modifiers.getHappiness() < d) {
            modifiers = new Modifiers(modifiers.getHealth(), modifiers.getHappiness() * 0.5, modifiers.getSanity());
        }
        return (modifiers.getSanity() < d) ? new Modifiers(modifiers.getHealth(), modifiers.getHappiness(), modifiers.getSanity() * 0.5) : modifiers;
    }
    getWeekModifier(): number {
        let i: RandomEvent = this;
        return (((i === RandomEvent.vacationTravelDelayed) || (i === RandomEvent.vacationTrainDelayed)) || (i === RandomEvent.appDeveloper_InternetSucks)) ? 1 : null;
    }
    getPromotionProgressModifier(): number {
        let i: RandomEvent = this;
        if (i === RandomEvent.workComplimentedByBoss) {
            return 3;
        }
        if (i !== RandomEvent.workNapping) {
            return (i !== RandomEvent.workGoodResearchFocus) ? null : 3;
        }
        return -5;
    }
    getCoursePorgressModifier(): number {
        let i: RandomEvent = this;
        if (i === RandomEvent.schoolInTheZone) {
            return 3;
        }
        if (i === RandomEvent.schoolForgotEssayOptionQuickEssay) {
            return -3;
        }
        if (i === RandomEvent.schoolForgotEssayOptionCopyFromInternet) {
            return Integer.valueOf(Constants.RandomEvent.INSTANCE.getResetValueConstant());
        }
        if (i !== RandomEvent.schoolYourDogAteYourHomework) {
            return (i !== RandomEvent.schoolNapping) ? null : -1;
        }
        return -2;
    }
    getIncomeModifier(): number {
        if (this !== RandomEvent.workAwardedBonus) {
            return null;
        }
        return Double.valueOf(5.0);
    }
    getMoneyModifier(): number {
        switch (this) {
            case RandomEvent.vacationGoodHappyHour:
            case RandomEvent.anyFoundWalletReportToPolice:
                return 50;
            case RandomEvent.workFree100GiftCardOptionClaimIt:
            case RandomEvent.vacationOnlyOneDayLeftOptionGoShopping:
            case RandomEvent.workCarAccident:
            case RandomEvent.anyFoundWalletShoppingSpree:
                return -1000;
            case RandomEvent.vacationDrankTooMuch:
            case RandomEvent.vacationPickpocketed:
                return -100;
            case RandomEvent.anyFoundMoneyOnStreet:
                return 20;
            case RandomEvent.loveMuseumDiscount:
            case RandomEvent.parents_surprisePresent:
            case RandomEvent.anyFoundWalletKeepCash:
                return 100;
            case RandomEvent.workBigTip:
            case RandomEvent.youTubeStar_donationFromFan:
                return 200;
            case RandomEvent.skillSaveExtra:
            case RandomEvent.prison_riot_tooFastForThem:
                return 500;
            case RandomEvent.appDeveloper_PatentTroll:
            case RandomEvent.dj_turntableBroke:
            case RandomEvent.health_overdosed:
            case RandomEvent.health_unnecessaryMeds:
                return -500;
            case RandomEvent.anyFoundDollar:
                return 1;
            case RandomEvent.health_unnecessarySurgery:
            case RandomEvent.health_additionalBills:
                return -2000;
            case RandomEvent.health_disease_seizure:
            case RandomEvent.health_disease_heartAttack:
                let negate: BigInteger = HealthEvent.hospitalStay.getCost().negate();
                return negate.intValue();
            default:
                return 0;
        }
    }
    getMoneyPercentModifier(): number {
        let i: RandomEvent = this;
        let valueOf: number = Double.valueOf(0.8);
        let valueOf2: number = Double.valueOf(0.5);
        switch (i) {
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGive200:
            case RandomEvent.schoolFightBullyOptionPlayDead:
                return valueOf2;
            case RandomEvent.anyMugged:
            case RandomEvent.vacationHouseKeeperStoleMoney:
                return valueOf;
            case RandomEvent.vacationSomeoneOfferPillRefuse:
                return Double.valueOf(0.6);
            case RandomEvent.prison_riot_tookYourCash:
                return Double.valueOf(0.0);
            default:
                return null;
        }
    }
    getShowAsAlert(): boolean {
        let i: any;
        let choices: EventChoice[] = this.getChoices();
        return ((((((choices != null) && (choices.length > 0)) || ((i = this) === RandomEvent.health_gotSTD)) || (i === RandomEvent.health_disease_heartAttack)) || (i === RandomEvent.health_disease_seizure)) || (i === RandomEvent.anyHitByCar)) || (i === RandomEvent.health_treatmentGoneWrong);
    }
    getJailTimeModifier(): number {
        let weeksPerYear: number;
        let i: RandomEvent = this;
        if (i === RandomEvent.prison_escape_failure_flushToilet) {
            weeksPerYear = Constants.Time.INSTANCE.getWeeksPerYear();
        } else {
            if (i !== RandomEvent.prison_escape_failure_tunnel) {
                if (i !== RandomEvent.prison_escape_success) {
                    return 0;
                }
                return Constants.RandomEvent.INSTANCE.getResetValueConstant();
            }
            weeksPerYear = Constants.Time.INSTANCE.getWeeksPerYear();
        }
        return weeksPerYear * 1;
    }
    getSideProjectProgressModifier(): number {
        let i: RandomEvent = this;
        if (i === RandomEvent.appDeveloper_ExtraEfficient) {
            return 3;
        }
        if (i === RandomEvent.youTubeStar_footageCorrupt) {
            return -10;
        }
        if ((i !== RandomEvent.dj_musicCreativityOnFire) && (i !== RandomEvent.author_madeProgress)) {
            return (i !== RandomEvent.author_backtrak) ? null : -3;
        }
        return 5;
    }
    isNegativeEvent(): boolean {
        let d: number = 0;
        if (((this.getModifiers().getHappiness() >= d) && (this.getModifiers().getHealth() >= d)) && (this.getModifiers().getSanity() >= d)) {
            let weekModifier: number = this.getWeekModifier();
            if (((weekModifier != null) ? weekModifier.intValue() : 0) <= 0) {
                let moneyPercentModifier: number = this.getMoneyPercentModifier();
                if (((moneyPercentModifier != null) ? moneyPercentModifier.doubleValue() : 1.0) >= 1.0) {
                    let coursePorgressModifier: number = this.getCoursePorgressModifier();
                    if (((coursePorgressModifier != null) ? coursePorgressModifier.intValue() : 0) >= 0) {
                        let promotionProgressModifier: number = this.getPromotionProgressModifier();
                        if (((promotionProgressModifier != null) ? promotionProgressModifier.intValue() : 0) >= 0) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    isHealthEvent(): boolean {
        let i: RandomEvent = this;
        return (i === RandomEvent.anyFlu) || (i === RandomEvent.anyCold);
    }
    getImageId(): number {
        return (this !== RandomEvent.stockCrash) ? null : R.drawable.randomevent_stockcrash;
    }
    getFrequency(): EventFrequency {
        let eventFrequency: EventFrequency = EventFrequency.medium;
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        switch (this) {
            case RandomEvent.workSomeoneThrownABottle:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workSomeoneTookSpot:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationTrainDelayed:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workComplimentedByBoss:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workAwardedBonus:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.workNapping:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workExtraLastMinuteWork:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workFreePizza:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workFreePizzaOption2Slices:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.workFreePizzaOptionWholePizza:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.workFreePizzaOptionEat3Pizzas:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.workArgument:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workFreeDonuts:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.workFree100GiftCard:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.workFree100GiftCardOptionClaimIt:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.workFree100GiftCardOptionCloseIt:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.workInspiringSpeaker:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workTeamBuildingExercise:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.vacationGoodHappyHour:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationPickpocketed:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationBeautifulSunset:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationSelfReflection:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationPulledOffA24HourNap:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationDidNotLeaveCouch:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationDrankTooMuch:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationOnlyOneDayLeft:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.vacationOnlyOneDayLeftOptionABusyTouristSpot:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationOnlyOneDayLeftOptionGoShopping:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationOnlyOneDayLeftOptionLocalSpot:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationTravelDelayed:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationPoorChildBeggingForMoney:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGiveFood:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGive10:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationPoorChildBeggingForMoneyOptionGive200:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolPanicAttack:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.schoolDidWellOnExam:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.schoolEpiphany:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.schoolInTheZone:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.schoolForgotEssay:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolForgotEssayOptionQuickEssay:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolForgotEssayOptionWriteAllNight:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolForgotEssayOptionCopyFromInternet:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolTeamProject:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.schoolNapping:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.schoolFightBully:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.schoolFightBullyOptionRunAway:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolFightBullyOptionFightHim:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolFightBullyOptionPlayDead:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.schoolYourDogAteYourHomework:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.schoolSubtituteTeacher:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveGreatConversation:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveArgument:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.lovePassionateAfterDinner:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.loveYouDidNotMeetAnyone:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.loveYouHadAGoodTime:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveYouHadAGreatTime:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.loveBarFight:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.loveRejectsAllNight:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.anySteppedOnDogPoop:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyPoopedByBird:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyMugged:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.anyFoundMoneyOnStreet:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.anyFlu:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.anyCold:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyHitByCar:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.anyGloomyWeather:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyCutLittleFinger:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.anyTerribleTraffic:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.workForgotAlarm:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationConnectionWithNature:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.vacationStrollHealthy:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationRageQuit:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationBeatHighscore:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationBittenByMosquitos:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.vacationPoisonIvy:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationCamping:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.vacationCampingBearEatYourFood:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationCampingBearDestroysYou:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationCampingBearRunsOff:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationCrowdSurf:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.vacationSomeoneOfferPill:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationSomeoneOfferPillRedPill:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationSomeoneOfferPillBluePill:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationSomeoneOfferPillRefuse:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.vacationAmazingMassage:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationLovingLife:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveShowTerrible:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveShowRipOff:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.loveSurpassExpectation:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveMuseumDiscount:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.lovePonderAncestor:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveStoodUp:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.anyFellOnStreet:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workBigTip:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workCarAccident:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.workGoodConversationPassenger:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.workGreaseBurn:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workDifficultCustomer:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workMundaneWork:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.workBadMarket:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workMultipleDeath:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.workSavedLives:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workMadeGoodMusic:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationOutofShowsToWatch:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationHouseKeeperStoleMoney:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.skillProductiveLearning:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.skillInspiring:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.skillTurnNewRecipe:
                eventFrequency = EventFrequency.high;
                break;
            case RandomEvent.skillSaveExtra:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.skillControlYourMind:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveShowUplifting:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveNoMatches:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.loveStayFriends:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.anyBeautifulWeather:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anySweetDreams:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyWellRested:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workAcidSpill:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workGoodResearchFocus:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.appDeveloper_StuckOnBug:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.appDeveloper_InternetSucks:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.appDeveloper_PatentTroll:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.appDeveloper_ExtraEfficient:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.appDeveloper_AppCrashing:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.youTubeStar_deathThreats:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.youTubeStar_footageCorrupt:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.youTubeStar_donationFromFan:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.youTubeStar_IncreaseInSubscribers:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.dj_frustrated:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.dj_turntableBroke:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.dj_musicCreativityOnFire:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.dj_FanLetters:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.dj_ToxicComments:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.parents_wontStopNagging:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.parents_bondingMoment:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.parents_surprisePresent:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.parents_HomeCooking:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.parents_CleanYourRoom:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.parents_ArguingDuringTrip:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.parents_GoodMeal:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workLaidOff:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.anyFoodPoisoning:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyLaundryDay:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyChasedByRaccoons:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyFellInManhole:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.anyPhoneDied:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyFoundDollar:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyFoundWallet:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.anyFoundWalletKeepCash:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.anyFoundWalletShoppingSpree:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.anyFoundWalletReportToPolice:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.anyGiantPimple:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.anyNoToiletPaper:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.anyRightSideOfBed:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.anyNiceStroll:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.prison_riot_beatenUp:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.prison_riot_chickenedOut:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.prison_riot_tookYourCash:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.prison_riot_kungfu:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.prison_riot_tooFastForThem:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.prison_escape_success:
                if (!personState.hasTrait(Trait.cunning)) {
                    eventFrequency = EventFrequency.medium;
                    break;
                } else {
                    eventFrequency = EventFrequency.high;
                    break;
                }
            case RandomEvent.prison_escape_failure_tunnel:
                if (!personState.hasTrait(Trait.cunning)) {
                    eventFrequency = EventFrequency.high;
                    break;
                } else {
                    eventFrequency = EventFrequency.medium;
                    break;
                }
            case RandomEvent.prison_escape_failure_flushToilet:
                if (!personState.hasTrait(Trait.cunning)) {
                    eventFrequency = EventFrequency.high;
                    break;
                } else {
                    eventFrequency = EventFrequency.medium;
                    break;
                }
            case RandomEvent.workTeacherConference:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workSubituteAnotherTeacher:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workDifficultStudent:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.author_backtrak:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.author_madeProgress:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.author_glowingReviews:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.author_stuck:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.actor_yelledAt:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.actor_fansHyped:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.actor_harshCriticism:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.actor_accident:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.actor_nominated:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.workPoliceShootout:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.workPoliceFreshDonuts:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workPolicerConfiscateGrass:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workArmyAccidentWithDrill:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workArmyLostExercise:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workArmyScreamedAt:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workLawyerLostCase:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workLawyerWinCase:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.workLawyerFrustratedRuling:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.stockCrash:
                eventFrequency = EventFrequency.ultraRare;
                break;
            case RandomEvent.vacationTeamDefeated:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationTeamWin:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationTeamGoodMatch:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationMetIdolGroup:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationCrowdSynchronizatio:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationIcePatch:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationSlammedIntoTree:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.vacationSkiSpeedRecord:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationAmazingEpisode:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationTooManyTentacles:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationDanceGood:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationDanceShakeIt:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationBullCastrated:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.vacationBullSword:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.sports_sprainAnkle:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.sports_tornligament:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.sports_hadABlast:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.sports_unstoppable:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.sports_footballTouchdown:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.sports_baseballHomerun:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.sports_basketball3Pointer:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.sports_sloppy:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.health_supremeConcentration:
                eventFrequency = EventFrequency.rare;
                break;
            case RandomEvent.health_overdosed:
            case RandomEvent.health_mentalHealthConsulting:
            case RandomEvent.health_lineInfection:
            case RandomEvent.health_gotSTD:
                eventFrequency = EventFrequency.low;
                break;
            case RandomEvent.health_healthierDiet:
            case RandomEvent.health_chinseHerbs:
            case RandomEvent.health_unnecessarySurgery:
            case RandomEvent.health_unnecessaryMeds:
            case RandomEvent.health_CBDOil:
            case RandomEvent.health_tookWrongPills:
            case RandomEvent.health_unableToClearMind:
            case RandomEvent.health_fellAsleep:
            case RandomEvent.health_forgotToSilencePhone:
            case RandomEvent.health_sharedHospitalRoom:
            case RandomEvent.health_additionalBills:
            case RandomEvent.health_goodNurse:
            case RandomEvent.health_treatmentGoneWrong:
            case RandomEvent.health_treatmentSuccess:
            case RandomEvent.health_treatmentNotEffective:
                eventFrequency = EventFrequency.medium;
                break;
            case RandomEvent.health_disease_heartAttack:
            case RandomEvent.health_disease_seizure:
                eventFrequency = EventFrequency.high;
                break;
        }
        if (personState.hasTrait(Trait.unlucky) && this.isNegativeEvent()) {
            eventFrequency = eventFrequency.getIncreaseSeverity();
        }
        return (personState.getCompletableActionState().isCompleted(CompletableAction.hygieneExpert) && this.isHealthEvent()) ? eventFrequency.getDecreaseSeverity() : eventFrequency;
    }
    getShouldApplyModifierImmediately(): boolean {
        return this.getChoices() != null;
    }
    getRelativeProbability(): number {
        return this.getFrequency().getRelativeProbability();
    }
    getChoices(): EventChoice[] {
        switch (this) {
            case RandomEvent.workFreePizza:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_workFreePizzaOption2SlicesButtonText), RandomEvent.workFreePizzaOption2Slices), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_workFreePizzaOptionWholePizzaButtonText), RandomEvent.workFreePizzaOptionWholePizza), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_workFreePizzaOptionThreePizzaButtonText), RandomEvent.workFreePizzaOptionEat3Pizzas)];
            case RandomEvent.workFree100GiftCard:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_workFree100GiftCardOptionClaimItButtonText), RandomEvent.workFree100GiftCardOptionClaimIt), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_workFree100GiftCardOptionCloseItButtonText), null)];
            case RandomEvent.vacationPoorChildBeggingForMoney:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_vacationPoorChildBeggingForMoneyOptionGiveFoodButtonText), RandomEvent.vacationPoorChildBeggingForMoneyOptionGiveFood), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_vacationPoorChildBeggingForMoneyOptionGive10ButtonText), RandomEvent.vacationPoorChildBeggingForMoneyOptionGive10), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_vacationPoorChildBeggingForMoneyOptionGive200ButtonText), RandomEvent.vacationPoorChildBeggingForMoneyOptionGive200)];
            case RandomEvent.schoolForgotEssay:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_schoolForgotEssayOptionQuickEssayButtonText), RandomEvent.schoolForgotEssayOptionQuickEssay), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_schoolForgotEssayOptionWriteAllNightButtonText), RandomEvent.schoolForgotEssayOptionWriteAllNight), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_schoolForgotEssayOptionCopyFromInternetButtonText), RandomEvent.schoolForgotEssayOptionCopyFromInternet)];
            case RandomEvent.schoolFightBully:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_schoolFightBullyOptionRunAwayButtonText), RandomEvent.schoolFightBullyOptionRunAway), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_schoolFightBullyOptionFightHimButtonText), RandomEvent.schoolFightBullyOptionFightHim), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_schoolFightBullyOptionPlayDeadButtonText), RandomEvent.schoolFightBullyOptionPlayDead)];
            case RandomEvent.vacationOnlyOneDayLeft:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_vacationOnlyOneDayLeftOptionLocalSpotButtonText), RandomEvent.vacationOnlyOneDayLeftOptionLocalSpot), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_vacationOnlyOneDayLeftOptionGoShoppingButtonText), RandomEvent.vacationOnlyOneDayLeftOptionGoShopping), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_vacationOnlyOneDayLeftOptionTouristSpotButtonText), RandomEvent.vacationOnlyOneDayLeftOptionABusyTouristSpot)];
            case RandomEvent.vacationCamping:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_campingBearOption1ButtonText), RandomEvent.vacationCampingBearEatYourFood), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_campingBearOption2ButtonText), RandomEvent.vacationCampingBearDestroysYou), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_campingBearOption3ButtonText), RandomEvent.vacationCampingBearRunsOff)];
            case RandomEvent.vacationSomeoneOfferPill:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_someoneOfferAPillOption1ButtonText), RandomEvent.vacationSomeoneOfferPillRedPill), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_someoneOfferAPillOption2ButtonText), RandomEvent.vacationSomeoneOfferPillBluePill), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_someoneOfferAPillOption3ButtonText), RandomEvent.vacationSomeoneOfferPillRefuse)];
            case RandomEvent.anyFoundWallet:
                return [new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundWalletKeepCashAction), RandomEvent.anyFoundWalletKeepCash), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundWalletShoppingSpreeAction), RandomEvent.anyFoundWalletShoppingSpree), new EventChoice(Utils.INSTANCE.getString(R.string.RandomEvent_anyFoundWaletReportToPoliceAction), RandomEvent.anyFoundWalletReportToPolice)];
            default:
                return null;
        }
    }
    applyEventModifier(person: Player): void {
        let activeProject: SideHustleState.SideHustleProject;
        Intrinsics.checkParameterIsNotNull(person, "person");
        if (this.getShouldApplyModifierImmediately()) {
            person.getAttributeState().setDeltaValueImmediate(this.getModifiers());
        } else {
            AttributeState.setDeltaValue$default(person.getAttributeState(), this.getModifiers(), null, 2, null);
        }
        let promotionProgressModifier: number = this.getPromotionProgressModifier();
        if (promotionProgressModifier != null) {
            let intValue: number = promotionProgressModifier.intValue();
            let currentJobState: JobState.JobStateSingle = person.getJobState().getCurrentJobState();
            if (currentJobState != null) {
                currentJobState.updateProgress(currentJobState.getProgress() + intValue);
            }
        }
        let coursePorgressModifier: number = this.getCoursePorgressModifier();
        if (coursePorgressModifier != null) {
            let intValue2: number = coursePorgressModifier.intValue();
            let deduceCurrentDegreeBeingWorkedOn: CompletableActionState.CompletableActionStateSingle = person.getCompletableActionState().deduceCurrentDegreeBeingWorkedOn();
            if (deduceCurrentDegreeBeingWorkedOn != null) {
                deduceCurrentDegreeBeingWorkedOn.updateProgress(deduceCurrentDegreeBeingWorkedOn.getProgress() + intValue2);
            }
        }
        let incomeModifier: number = this.getIncomeModifier();
        if (incomeModifier != null) {
            let doubleValue: number = incomeModifier.doubleValue();
            let currentJobState2: JobState.JobStateSingle = person.getJobState().getCurrentJobState();
            if (currentJobState2 != null) {
                let max: number = currentJobState2.getType().pay(currentJobState2.getLevel()).getMax();
                let d: number = 1;
                Double.isNaN(d);
                let d2: number = max * (doubleValue - d);
                let moneyState: MoneyState = person.getMoneyState();
                let valueOf: BigInteger = BigInteger.valueOf(JMath.toInt(d2));
                MoneyState.updateMoney$default(moneyState, valueOf, MoneyUpdateType.workIncome, null, null, 12, null);
            }
        }
        let moneyState2: MoneyState = person.getMoneyState();
        let valueOf2: BigInteger = BigInteger.valueOf(this.getMoneyModifier());
        MoneyState.updateMoney$default(moneyState2, valueOf2, MoneyUpdateType.misc, null, null, 12, null);
        let moneyPercentModifier: number = this.getMoneyPercentModifier();
        if (moneyPercentModifier != null) {
            let doubleValue2: number = moneyPercentModifier.doubleValue();
            let cash: BigInteger = person.getMoneyState().getCash();
            let valueOf3: BigInteger = BigInteger.valueOf(0);
            if (cash.compareTo(valueOf3) > 0) {
                MoneyState.updateMoney$default(person.getMoneyState(), ExtensionsKt.times(person.getMoneyState().getCash(), 1.0 - doubleValue2), MoneyUpdateType.directSpend, null, null, 12, null);
            }
        }
        let sideProjectProgressModifier: number = this.getSideProjectProgressModifier();
        if (sideProjectProgressModifier != null) {
            let intValue3: number = sideProjectProgressModifier.intValue();
            let currentSideHustleState: SideHustleState.SingleSideHustleState = person.getSideHustleState().currentSideHustleState();
            if ((currentSideHustleState != null) && ((activeProject = currentSideHustleState.getActiveProject()) != null)) {
                let progressCurrent: number = activeProject.getProgressCurrent();
                let d3: number = intValue3;
                Double.isNaN(d3);
                activeProject.setProgressCurrent(progressCurrent + d3);
            }
        }
        let weekModifier: number = this.getWeekModifier();
        if (weekModifier != null) {
            person.setAgeInWeeks(person.getAgeInWeeks() + weekModifier.intValue());
        }
        if (this !== RandomEvent.stockCrash) {
            return;
        }
        let stockState: StockState = person.getStockState();
        stockState.setCostPerShare(stockState.getCostPerShare() * (1.0 - Constants.RandomEvent.INSTANCE.getStockCrashPercent()));
    }
}
export namespace RandomEvent {
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
        getAllApplicableEvents(): RandomEvent[] {
        return [RandomEvent.anySteppedOnDogPoop, RandomEvent.anyMugged, RandomEvent.anyFoundMoneyOnStreet, RandomEvent.anyHitByCar, RandomEvent.anyGloomyWeather, RandomEvent.anyFellOnStreet, RandomEvent.anyBeautifulWeather, RandomEvent.anySweetDreams, RandomEvent.anyWellRested, RandomEvent.anyFoodPoisoning, RandomEvent.anyLaundryDay, RandomEvent.anyChasedByRaccoons, RandomEvent.anyFellInManhole, RandomEvent.anyPhoneDied, RandomEvent.anyFoundDollar, RandomEvent.anyFoundWallet, RandomEvent.anyGiantPimple, RandomEvent.anyNoToiletPaper, RandomEvent.anyRightSideOfBed, RandomEvent.anyNiceStroll, RandomEvent.stockCrash];
    }
        selectEvent(events: ArrayList<RandomEvent>, probabilityToSelectAEvent: number): RandomEvent {
        if (!Utils.Random.INSTANCE.rollWithProbability(probabilityToSelectAEvent) || (events.size() === 0)) {
            return null;
        }
        let chooseFromPool: IProbableEvent = Utils.Random.INSTANCE.chooseFromPool(events);
        if (chooseFromPool != null) {
            return (chooseFromPool as unknown as RandomEvent);
        }
        throw new TypeCastException("null cannot be cast to non-null type Enums.RandomEvent");
    }
        randomEventForJob(job: Job): RandomEvent {
        Intrinsics.checkParameterIsNotNull(job, "job");
        let mutableList: ArrayList = ArraysKt.toMutableList(RandomEvent.INSTANCE.getAllApplicableEvents());
        let randomEventArr: RandomEvent[] = [RandomEvent.workAwardedBonus, RandomEvent.workNapping, RandomEvent.workExtraLastMinuteWork, RandomEvent.workFreePizza, RandomEvent.workArgument, RandomEvent.workFreeDonuts, RandomEvent.workFree100GiftCard, RandomEvent.workInspiringSpeaker, RandomEvent.workTeamBuildingExercise, RandomEvent.anyTerribleTraffic, RandomEvent.workLaidOff];
        switch (job) {
            case Job.panHandler:
                CollectionsKt.addAll(mutableList, [RandomEvent.workSomeoneThrownABottle, RandomEvent.workSomeoneTookSpot, RandomEvent.workBigTip]);
                break;
            case Job.burgerFlipper:
                CollectionsKt.addAll(mutableList, [RandomEvent.workAwardedBonus, RandomEvent.workNapping, RandomEvent.workFreePizza, RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic, RandomEvent.workGreaseBurn, RandomEvent.workDifficultCustomer]);
                break;
            case Job.dataEntry:
                CollectionsKt.addAll(mutableList, randomEventArr);
                mutableList.add(RandomEvent.workMundaneWork);
                break;
            case Job.uber:
                CollectionsKt.addAll(mutableList, [RandomEvent.anyTerribleTraffic, RandomEvent.workBigTip, RandomEvent.workCarAccident]);
                break;
            case Job.music:
                CollectionsKt.addAll(mutableList, [RandomEvent.workFreePizza, RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic, RandomEvent.workMadeGoodMusic]);
                break;
            case Job.business:
                CollectionsKt.addAll(mutableList, randomEventArr);
                break;
            case Job.medical:
                CollectionsKt.addAll(mutableList, [RandomEvent.workAwardedBonus, RandomEvent.workNapping, RandomEvent.workExtraLastMinuteWork, RandomEvent.workFreePizza, RandomEvent.workFreeDonuts, RandomEvent.workFree100GiftCard, RandomEvent.workInspiringSpeaker, RandomEvent.anyTerribleTraffic, RandomEvent.workMultipleDeath, RandomEvent.workSavedLives]);
                break;
            case Job.finance:
                CollectionsKt.addAll(mutableList, randomEventArr);
                mutableList.add(RandomEvent.workBadMarket);
                break;
            case Job.research:
                let list: ArrayList = mutableList;
                CollectionsKt.addAll(list, randomEventArr);
                CollectionsKt.addAll(list, [RandomEvent.workAcidSpill, RandomEvent.workGoodResearchFocus]);
                break;
            case Job.programmer:
                let list2: ArrayList = mutableList;
                CollectionsKt.addAll(list2, randomEventArr);
                CollectionsKt.addAll(list2, [RandomEvent.appDeveloper_StuckOnBug]);
                break;
            case Job.teacher:
                CollectionsKt.addAll(mutableList, [RandomEvent.workSubituteAnotherTeacher, RandomEvent.workTeacherConference, RandomEvent.workDifficultStudent]);
                break;
            case Job.police:
                CollectionsKt.addAll(mutableList, [RandomEvent.workPolicerConfiscateGrass, RandomEvent.workPoliceFreshDonuts, RandomEvent.workPoliceShootout]);
                break;
            case Job.army:
                CollectionsKt.addAll(mutableList, [RandomEvent.workArmyScreamedAt, RandomEvent.workArmyLostExercise, RandomEvent.workArmyAccidentWithDrill]);
                break;
            case Job.lawyer:
                let list3: ArrayList = mutableList;
                CollectionsKt.addAll(list3, randomEventArr);
                CollectionsKt.addAll(list3, [RandomEvent.workLawyerFrustratedRuling, RandomEvent.workLawyerWinCase, RandomEvent.workLawyerLostCase]);
                break;
            case Job.artist:
                CollectionsKt.addAll(mutableList, randomEventArr);
                mutableList.add(RandomEvent.anyTerribleTraffic);
                break;
            case Job.actor:
                CollectionsKt.addAll(mutableList, [RandomEvent.anyTerribleTraffic, RandomEvent.workFreeDonuts, RandomEvent.workAwardedBonus]);
                break;
            case Job.dancer:
                // v0.19.0 Celebrity Life: the Dance career
                CollectionsKt.addAll(mutableList, [RandomEvent.anyTerribleTraffic, RandomEvent.workBigTip, RandomEvent.workFreePizza]);
                break;
            case Job.barista:
                CollectionsKt.addAll(mutableList, [RandomEvent.workAwardedBonus, RandomEvent.workNapping, RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic, RandomEvent.workDifficultCustomer, RandomEvent.workBigTip]);
                break;
            case Job.sushiChef:
                CollectionsKt.addAll(mutableList, [RandomEvent.workAwardedBonus, RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic, RandomEvent.workDifficultCustomer]);
                break;
            case Job.animeArtist:
                CollectionsKt.addAll(mutableList, randomEventArr);
                break;
            case Job.pastryChef:
                CollectionsKt.addAll(mutableList, [RandomEvent.workAwardedBonus, RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic, RandomEvent.workDifficultCustomer, RandomEvent.workGreaseBurn]);
                break;
            case Job.tourGuide:
                CollectionsKt.addAll(mutableList, [RandomEvent.anyTerribleTraffic, RandomEvent.workBigTip]);
                break;
            case Job.sommelier:
                CollectionsKt.addAll(mutableList, [RandomEvent.workAwardedBonus, RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic, RandomEvent.workDifficultCustomer]);
                break;
            case Job.royalGuard:
                CollectionsKt.addAll(mutableList, [RandomEvent.anyTerribleTraffic]);
                break;
            case Job.constructionWorker:
                CollectionsKt.addAll(mutableList, [RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic]);
                break;
            case Job.retail:
                CollectionsKt.addAll(mutableList, [RandomEvent.workAwardedBonus, RandomEvent.workNapping, RandomEvent.workFreeDonuts, RandomEvent.anyTerribleTraffic, RandomEvent.workDifficultCustomer]);
                break;
            default: {
                // v0.26.0: the Career Center careers
                const d: any = (job as any).def?.();
                CollectionsKt.addAll(mutableList, randomEventArr);
                if (d?.medical) CollectionsKt.addAll(mutableList, [RandomEvent.workSavedLives, RandomEvent.workMultipleDeath]);
                if (d?.category === "hospitality") CollectionsKt.addAll(mutableList, [RandomEvent.workBigTip, RandomEvent.workDifficultCustomer]);
                break;
            }
        }
        let arrayList: ArrayList = new ArrayList();
        for (const obj of mutableList) {
            let promotionProgressModifier: number = ((obj as unknown as RandomEvent)).getPromotionProgressModifier();
            if ((((promotionProgressModifier != null) ? promotionProgressModifier.intValue() : 0) === 0) || !GameStateManager.INSTANCE.getPersonState().getJobState().isJobMaxedOut()) {
                arrayList.add(obj);
            }
        }
        return this.selectEvent((CollectionsKt.toCollection(arrayList, new ArrayList()) as unknown as ArrayList), Constants.RandomEvent.Probability.INSTANCE.getWork());
    }
        randomEventForLeisure(leisure: Leisure): RandomEvent {
        Intrinsics.checkParameterIsNotNull(leisure, "leisure");
        let arrayList: ArrayList = new ArrayList();
        let randomEventArr: RandomEvent[] = [RandomEvent.vacationGoodHappyHour, RandomEvent.vacationPickpocketed, RandomEvent.vacationBeautifulSunset, RandomEvent.vacationSelfReflection, RandomEvent.vacationOnlyOneDayLeft, RandomEvent.vacationTravelDelayed, RandomEvent.vacationPoorChildBeggingForMoney];
        let leisure2: number = Constants.RandomEvent.Probability.INSTANCE.getLeisure();
        let d: number = 1.0;
        switch (leisure) {
            case Leisure.take_week_off:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationPulledOffA24HourNap, RandomEvent.vacationDidNotLeaveCouch, RandomEvent.vacationOutofShowsToWatch]);
                d = leisure2;
                break;
            case Leisure.goToPark:
                CollectionsKt.addAll(arrayList, [RandomEvent.anyMugged, RandomEvent.anyPoopedByBird, RandomEvent.vacationConnectionWithNature, RandomEvent.vacationStrollHealthy]);
                d = leisure2;
                break;
            case Leisure.playGames:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationRageQuit, RandomEvent.vacationBeatHighscore]);
                d = leisure2;
                break;
            case Leisure.grab_drinks:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationDrankTooMuch, RandomEvent.vacationGoodHappyHour, RandomEvent.loveYouHadAGoodTime]);
                d = leisure2;
                break;
            case Leisure.goToConcert:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationSomeoneOfferPill, RandomEvent.vacationCrowdSurf, RandomEvent.loveShowTerrible, RandomEvent.loveSurpassExpectation]);
                d = leisure2;
                break;
            case Leisure.goCamping:
                CollectionsKt.addAll(arrayList, [RandomEvent.anyPoopedByBird, RandomEvent.vacationConnectionWithNature, RandomEvent.vacationPoisonIvy, RandomEvent.vacationBittenByMosquitos, RandomEvent.vacationCamping]);
                d = leisure2;
                break;
            case Leisure.local_vacation:
                let arrayList2: ArrayList = arrayList;
                CollectionsKt.addAll(arrayList2, randomEventArr);
                CollectionsKt.addAll(arrayList2, [RandomEvent.vacationTrainDelayed]);
                d = leisure2;
                break;
            case Leisure.international_vacation:
            case Leisure.luxury_vacation:
                CollectionsKt.addAll(arrayList, randomEventArr);
                d = leisure2;
                break;
            case Leisure.spa:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationLovingLife, RandomEvent.vacationAmazingMassage, RandomEvent.vacationHouseKeeperStoleMoney]);
                d = leisure2;
                break;
            case Leisure.prisonRiot:
                CollectionsKt.addAll(arrayList, [RandomEvent.prison_riot_kungfu, RandomEvent.prison_riot_beatenUp, RandomEvent.prison_riot_chickenedOut, RandomEvent.prison_riot_tookYourCash, RandomEvent.prison_riot_tooFastForThem]);
                break;
            case Leisure.prisonEscape:
                CollectionsKt.addAll(arrayList, [RandomEvent.prison_escape_success, RandomEvent.prison_escape_failure_tunnel, RandomEvent.prison_escape_failure_flushToilet]);
                break;
            case Leisure.ski:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationIcePatch, RandomEvent.vacationSlammedIntoTree, RandomEvent.vacationSkiSpeedRecord]);
                d = leisure2;
                break;
            case Leisure.iceHockey:
            case Leisure.watchSoccer:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationTeamDefeated, RandomEvent.vacationTeamWin, RandomEvent.vacationTeamGoodMatch]);
                d = leisure2;
                break;
            case Leisure.jpopConcert:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationSomeoneOfferPill, RandomEvent.vacationCrowdSurf, RandomEvent.loveShowTerrible, RandomEvent.loveSurpassExpectation, RandomEvent.vacationMetIdolGroup, RandomEvent.vacationCrowdSynchronizatio]);
                d = leisure2;
                break;
            case Leisure.izakaya:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationDrankTooMuch, RandomEvent.vacationGoodHappyHour, RandomEvent.loveYouHadAGoodTime]);
                d = leisure2;
                break;
            case Leisure.watchAnime:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationAmazingEpisode, RandomEvent.vacationTooManyTentacles]);
                d = leisure2;
                break;
            case Leisure.watchOpera:
                CollectionsKt.addAll(arrayList, [RandomEvent.loveShowTerrible, RandomEvent.loveSurpassExpectation, RandomEvent.loveShowRipOff, RandomEvent.loveShowUplifting]);
                d = leisure2;
                break;
            case Leisure.flamingoShow:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationDanceGood, RandomEvent.vacationDanceShakeIt]);
                d = leisure2;
                break;
            case Leisure.bullfightingShow:
                CollectionsKt.addAll(arrayList, [RandomEvent.vacationBullCastrated, RandomEvent.vacationBullSword]);
                d = leisure2;
                break;
            default:
                d = leisure2;
                break;
        }
        return this.selectEvent(arrayList, d);
    }
        randomEventForCompletableAction(type: CompletableActionType, skillOrEducation: CompletableAction): RandomEvent {
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(skillOrEducation, "skillOrEducation");
        let companion = this;
        let mutableList: ArrayList = ArraysKt.toMutableList(companion.getAllApplicableEvents());
        let i: CompletableActionType = type;
        if (i === CompletableActionType.education) {
            let list: ArrayList = mutableList;
            CollectionsKt.addAll(list, [RandomEvent.schoolPanicAttack, RandomEvent.schoolDidWellOnExam, RandomEvent.schoolEpiphany, RandomEvent.schoolInTheZone, RandomEvent.schoolForgotEssay, RandomEvent.schoolTeamProject, RandomEvent.schoolNapping, RandomEvent.schoolYourDogAteYourHomework]);
            if (skillOrEducation === CompletableAction.middleSchool) {
                CollectionsKt.addAll(list, [RandomEvent.schoolFightBully, RandomEvent.schoolSubtituteTeacher]);
            }
        } else if (i === CompletableActionType.skill) {
            let list2: ArrayList = mutableList;
            CollectionsKt.addAll(list2, [RandomEvent.schoolEpiphany, RandomEvent.skillProductiveLearning, RandomEvent.skillInspiring]);
            switch (skillOrEducation) {
                case CompletableAction.homeChef:
                case CompletableAction.nutritionScience:
                    CollectionsKt.addAll(list2, [RandomEvent.skillTurnNewRecipe, RandomEvent.anyCutLittleFinger]);
                    break;
                case CompletableAction.personalFinance:
                case CompletableAction.investmentStrategies:
                    CollectionsKt.addAll(list2, [RandomEvent.skillSaveExtra]);
                    break;
                case CompletableAction.stocisim:
                case CompletableAction.meditationExpert:
                    CollectionsKt.addAll(list2, [RandomEvent.skillControlYourMind]);
                    break;
            }
        } else if (i === CompletableActionType.philanthrophy) {
            return null;
        }
        return companion.selectEvent(mutableList, Constants.RandomEvent.Probability.INSTANCE.getSchool());
    }
        randomEventForLoveEvent(event: LoveEvent): RandomEvent {
        Intrinsics.checkParameterIsNotNull(event, "event");
        let arrayList: ArrayList = new ArrayList();
        switch (event) {
            case LoveEvent.swipeRight:
                CollectionsKt.addAll(arrayList, [RandomEvent.loveYouHadAGoodTime, RandomEvent.loveStoodUp, RandomEvent.loveNoMatches, RandomEvent.loveStayFriends]);
                break;
            case LoveEvent.nightClub:
                CollectionsKt.addAll(arrayList, [RandomEvent.loveBarFight, RandomEvent.loveYouHadAGoodTime, RandomEvent.loveYouHadAGreatTime, RandomEvent.loveRejectsAllNight]);
                break;
            case LoveEvent.localEvent:
                CollectionsKt.addAll(arrayList, [RandomEvent.loveYouHadAGoodTime, RandomEvent.loveYouHadAGreatTime]);
                break;
            case LoveEvent.romanticDinner:
                CollectionsKt.addAll(arrayList, [RandomEvent.loveGreatConversation, RandomEvent.loveArgument, RandomEvent.lovePassionateAfterDinner]);
                break;
            case LoveEvent.watchMovie:
                CollectionsKt.addAll(arrayList, [RandomEvent.loveShowTerrible, RandomEvent.loveSurpassExpectation, RandomEvent.loveShowUplifting]);
                break;
            case LoveEvent.watchPlay:
                CollectionsKt.addAll(arrayList, [RandomEvent.loveShowTerrible, RandomEvent.loveSurpassExpectation, RandomEvent.loveShowRipOff, RandomEvent.loveShowUplifting]);
                break;
            case LoveEvent.museum:
                CollectionsKt.addAll(arrayList, [RandomEvent.lovePonderAncestor, RandomEvent.loveMuseumDiscount]);
                break;
        }
        return this.selectEvent(arrayList, (((event === LoveEvent.swipeRight) || (event === LoveEvent.nightClub)) || (event === LoveEvent.localEvent)) ? Constants.RandomEvent.Probability.INSTANCE.getLoveSingle() : Constants.RandomEvent.Probability.INSTANCE.getLoveRelationship());
    }
        randomEventForPersonInteraction(action: PersonInteraction): RandomEvent {
        Intrinsics.checkParameterIsNotNull(action, "action");
        let arrayList: ArrayList = new ArrayList();
        let randomEventArr: RandomEvent[] = [RandomEvent.parents_wontStopNagging, RandomEvent.parents_bondingMoment, RandomEvent.parents_GoodMeal];
        let i: PersonInteraction = action;
        if (i === PersonInteraction.spendTime) {
            let arrayList2: ArrayList = arrayList;
            CollectionsKt.addAll(arrayList2, randomEventArr);
            CollectionsKt.addAll(arrayList2, [RandomEvent.parents_surprisePresent, RandomEvent.parents_HomeCooking, RandomEvent.parents_CleanYourRoom]);
        } else if (i === PersonInteraction.roadTrip) {
            let arrayList3: ArrayList = arrayList;
            CollectionsKt.addAll(arrayList3, randomEventArr);
            CollectionsKt.addAll(arrayList3, [RandomEvent.parents_surprisePresent]);
            if (GameStateManager.INSTANCE.getPersonState().getFamilyState().getAliveParents().size() === 2) {
                CollectionsKt.addAll(arrayList3, [RandomEvent.parents_ArguingDuringTrip]);
            }
        }
        return this.selectEvent(arrayList, Constants.RandomEvent.Probability.INSTANCE.getParentAction());
    }
        randomEventForSideHustle(sideHustle: SideHustle): RandomEvent {
        Intrinsics.checkParameterIsNotNull(sideHustle, "sideHustle");
        let arrayList: ArrayList = new ArrayList();
        let i: SideHustle = sideHustle;
        if (i === SideHustle.appDeveloper) {
            CollectionsKt.addAll(arrayList, [RandomEvent.appDeveloper_StuckOnBug, RandomEvent.appDeveloper_InternetSucks, RandomEvent.appDeveloper_PatentTroll, RandomEvent.appDeveloper_ExtraEfficient, RandomEvent.appDeveloper_AppCrashing]);
        } else if (i === SideHustle.youTubeStar) {
            CollectionsKt.addAll(arrayList, [RandomEvent.youTubeStar_deathThreats, RandomEvent.youTubeStar_footageCorrupt, RandomEvent.youTubeStar_donationFromFan, RandomEvent.youTubeStar_IncreaseInSubscribers, RandomEvent.appDeveloper_ExtraEfficient]);
        } else if (i === SideHustle.DJ) {
            CollectionsKt.addAll(arrayList, [RandomEvent.dj_frustrated, RandomEvent.dj_turntableBroke, RandomEvent.dj_musicCreativityOnFire, RandomEvent.dj_FanLetters, RandomEvent.dj_ToxicComments]);
        } else if (i === SideHustle.author) {
            CollectionsKt.addAll(arrayList, [RandomEvent.author_backtrak, RandomEvent.author_madeProgress, RandomEvent.author_glowingReviews, RandomEvent.author_stuck]);
        } else if (i === SideHustle.actor) {
            CollectionsKt.addAll(arrayList, [RandomEvent.actor_accident, RandomEvent.actor_nominated, RandomEvent.actor_fansHyped, RandomEvent.actor_harshCriticism, RandomEvent.actor_yelledAt]);
        }
        return this.selectEvent(arrayList, Constants.RandomEvent.Probability.INSTANCE.getSideHustle());
    }
        randomEventForHealth(event: HealthEvent): RandomEvent {
        Intrinsics.checkParameterIsNotNull(event, "event");
        let arrayList: ArrayList = new ArrayList();
        switch (event) {
            case HealthEvent.mindfulMeditation:
                CollectionsKt.addAll(arrayList, [RandomEvent.health_supremeConcentration, RandomEvent.health_forgotToSilencePhone, RandomEvent.health_fellAsleep, RandomEvent.health_unableToClearMind]);
                break;
            case HealthEvent.takeAntidepressantPills:
                CollectionsKt.addAll(arrayList, [RandomEvent.health_overdosed]);
                break;
            case HealthEvent.selfTreatment:
                CollectionsKt.addAll(arrayList, [RandomEvent.health_tookWrongPills, RandomEvent.health_CBDOil, RandomEvent.health_chinseHerbs, RandomEvent.health_healthierDiet]);
                break;
            case HealthEvent.doctorVisit:
                CollectionsKt.addAll(arrayList, [RandomEvent.health_unnecessarySurgery, RandomEvent.health_unnecessaryMeds, RandomEvent.health_mentalHealthConsulting]);
                break;
            case HealthEvent.hospitalStay:
                CollectionsKt.addAll(arrayList, [RandomEvent.health_sharedHospitalRoom, RandomEvent.health_additionalBills, RandomEvent.health_lineInfection, RandomEvent.health_goodNurse]);
                break;
            case HealthEvent.experimentalTreatment:
                CollectionsKt.addAll(arrayList, [RandomEvent.health_treatmentGoneWrong, RandomEvent.health_treatmentSuccess, RandomEvent.health_treatmentNotEffective]);
                break;
        }
        return this.selectEvent(arrayList, Constants.RandomEvent.Probability.INSTANCE.getHealth());
    }
    }
}
RandomEvent.INSTANCE = new RandomEvent.Companion(null);
