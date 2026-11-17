// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, ArraysKt, BigInteger, CollectionsKt, Integer, JEnum, NoWhenBranchMatchedException, R, Random, Unit } from "../runtime";
import { Business } from "./Business";
import { BusinessState } from "../Managers/BusinessState";
import { CompletableAction } from "./CompletableAction";
import { Constants } from "../Utils/Constants";
import { Diet } from "./Diet";
import { GameStateManager } from "../Managers/GameStateManager";
import { Housing } from "./Housing";
import { Job } from "./Job";
import { LifeScenarioDifficulty } from "./LifeScenarioDifficulty";
import { LoverPersonality } from "./LoverPersonality";
import { MoneyState } from "../Managers/MoneyState";
import { ParentInitialState } from "./ParentInitialState";
import { PerkState } from "../Managers/PerkState";
import { Person } from "../Managers/Person";
import { Pet } from "./Pet";
import { Player } from "../Managers/Player";
import { PlayerPerkState } from "../Managers/PlayerPerkState";
import { Possession } from "./Possession";
import { Relationship } from "./Relationship";
import { RelationshipProgressStatus } from "./RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "./RomanticRelationshipStatus";
import { Sex } from "./Sex";
import { SideHustle } from "./SideHustle";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";

export class LifeScenario extends JEnum {
    static readonly highSchoolDropout: LifeScenario = new LifeScenario("highSchoolDropout", 0);
    static readonly youngChild: LifeScenario = new LifeScenario("youngChild", 1);
    static readonly uberDriver: LifeScenario = new LifeScenario("uberDriver", 2);
    static readonly educatedAndInDebt: LifeScenario = new LifeScenario("educatedAndInDebt", 3);
    static readonly oldMan: LifeScenario = new LifeScenario("oldMan", 4);
    static readonly brinkOfBankruptcy: LifeScenario = new LifeScenario("brinkOfBankruptcy", 5);
    static readonly sicklyChild: LifeScenario = new LifeScenario("sicklyChild", 6);
    static readonly unluckiestGuy: LifeScenario = new LifeScenario("unluckiestGuy", 7);
    static readonly uneducatedAndHomeless: LifeScenario = new LifeScenario("uneducatedAndHomeless", 8);
    static readonly youTubeStarWannable: LifeScenario = new LifeScenario("youTubeStarWannable", 9);
    static readonly starvingAppDeveloper: LifeScenario = new LifeScenario("starvingAppDeveloper", 10);
    static readonly risingDJ: LifeScenario = new LifeScenario("risingDJ", 11);
    static readonly abusiveMarriage: LifeScenario = new LifeScenario("abusiveMarriage", 12);
    static readonly orphanChild: LifeScenario = new LifeScenario("orphanChild", 13);
    static readonly sandboxMode: LifeScenario = new LifeScenario("sandboxMode", 14);
    static readonly singleParent: LifeScenario = new LifeScenario("singleParent", 15);
    static readonly infertileParent: LifeScenario = new LifeScenario("infertileParent", 16);
    static readonly smallRestaurantOwner: LifeScenario = new LifeScenario("smallRestaurantOwner", 17);
    static readonly smallSoftwareStudio: LifeScenario = new LifeScenario("smallSoftwareStudio", 18);
    static readonly washedUpActor: LifeScenario = new LifeScenario("washedUpActor", 19);
    static readonly inspiringAuthor: LifeScenario = new LifeScenario("inspiringAuthor", 20);
    static readonly armyPrivate: LifeScenario = new LifeScenario("armyPrivate", 21);
    static readonly crazyCatLady: LifeScenario = new LifeScenario("crazyCatLady", 22);
    static readonly againstTheOdds: LifeScenario = new LifeScenario("againstTheOdds", 23);
    static readonly footballCaptain: LifeScenario = new LifeScenario("footballCaptain", 24);
    static readonly giftedBasketPlayer: LifeScenario = new LifeScenario("giftedBasketPlayer", 25);
    static values(): LifeScenario[] { return [LifeScenario.highSchoolDropout, LifeScenario.youngChild, LifeScenario.uberDriver, LifeScenario.educatedAndInDebt, LifeScenario.oldMan, LifeScenario.brinkOfBankruptcy, LifeScenario.sicklyChild, LifeScenario.unluckiestGuy, LifeScenario.uneducatedAndHomeless, LifeScenario.youTubeStarWannable, LifeScenario.starvingAppDeveloper, LifeScenario.risingDJ, LifeScenario.abusiveMarriage, LifeScenario.orphanChild, LifeScenario.sandboxMode, LifeScenario.singleParent, LifeScenario.infertileParent, LifeScenario.smallRestaurantOwner, LifeScenario.smallSoftwareStudio, LifeScenario.washedUpActor, LifeScenario.inspiringAuthor, LifeScenario.armyPrivate, LifeScenario.crazyCatLady, LifeScenario.againstTheOdds, LifeScenario.footballCaptain, LifeScenario.giftedBasketPlayer]; }
    static valueOf(n: string): LifeScenario { return (LifeScenario as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case LifeScenario.uberDriver:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_UberDriver);
            case LifeScenario.highSchoolDropout:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_HighschoolDropout);
            case LifeScenario.youngChild:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_YoungChild);
            case LifeScenario.educatedAndInDebt:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_EducatedAndInDebt);
            case LifeScenario.oldMan:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_OldMan);
            case LifeScenario.brinkOfBankruptcy:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_BrinkOfBankruptcy);
            case LifeScenario.sicklyChild:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_SicklyChild);
            case LifeScenario.unluckiestGuy:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_TheUnluckiestGuy);
            case LifeScenario.uneducatedAndHomeless:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_UneducatedHomeless);
            case LifeScenario.youTubeStarWannable:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_YoutubeStarWannable);
            case LifeScenario.starvingAppDeveloper:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_StarvingAppDeveloper);
            case LifeScenario.risingDJ:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_RisingDJ);
            case LifeScenario.abusiveMarriage:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_AbusiveMarriage);
            case LifeScenario.orphanChild:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_OrphanChild);
            case LifeScenario.sandboxMode:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_SandboxMode);
            case LifeScenario.singleParent:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_SingleParent);
            case LifeScenario.infertileParent:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_InfertileParent);
            case LifeScenario.smallRestaurantOwner:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_SmallRestaurantOwner);
            case LifeScenario.smallSoftwareStudio:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_smallSoftwareStudio);
            case LifeScenario.washedUpActor:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_washedUpActor);
            case LifeScenario.inspiringAuthor:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_inspiringAuthor);
            case LifeScenario.armyPrivate:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_armyPrivate);
            case LifeScenario.crazyCatLady:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_CrazyCatLady);
            case LifeScenario.againstTheOdds:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_AgainstTheOdds);
            case LifeScenario.footballCaptain:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_FootballCaptain);
            case LifeScenario.giftedBasketPlayer:
                return Utils.INSTANCE.getString(R.string.GameScenario_Title_GiftedBasketballPlayer);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDescription(): string {
        switch (this) {
            case LifeScenario.uberDriver:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_UberDriver);
            case LifeScenario.highSchoolDropout:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_HighschoolDropout);
            case LifeScenario.youngChild:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_YoungChild);
            case LifeScenario.educatedAndInDebt:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_EducatedAndInDebt);
            case LifeScenario.oldMan:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_OldMan);
            case LifeScenario.brinkOfBankruptcy:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_BrinkOfBankruptcy);
            case LifeScenario.sicklyChild:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_SicklyChild);
            case LifeScenario.unluckiestGuy:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_TheUnluckiestGuy);
            case LifeScenario.uneducatedAndHomeless:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_UneducatedHomeless);
            case LifeScenario.youTubeStarWannable:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_YoutubeStarWannable);
            case LifeScenario.starvingAppDeveloper:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_StarvingAppDeveloper);
            case LifeScenario.risingDJ:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_RisingDJ);
            case LifeScenario.abusiveMarriage:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_AbusiveMarriage);
            case LifeScenario.orphanChild:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_OrphanChild);
            case LifeScenario.sandboxMode:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_Sandbox);
            case LifeScenario.singleParent:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_SingleParent);
            case LifeScenario.infertileParent:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_InfertileParent);
            case LifeScenario.smallRestaurantOwner:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_SmallRestaurantOwner);
            case LifeScenario.smallSoftwareStudio:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_SmallSoftwareStudio);
            case LifeScenario.washedUpActor:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_washedUpActor);
            case LifeScenario.inspiringAuthor:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_inspiringAuthor);
            case LifeScenario.armyPrivate:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_armyPrivate);
            case LifeScenario.crazyCatLady:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_CrazyCatLady);
            case LifeScenario.againstTheOdds:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_AgainstTheOdds);
            case LifeScenario.footballCaptain:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_FootballCaptain);
            case LifeScenario.giftedBasketPlayer:
                return Utils.INSTANCE.getString(R.string.GameScenario_Description_GiftedBasketballPlayer);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getInitiallyUnlocked(): boolean {
        switch (this) {
            case LifeScenario.brinkOfBankruptcy:
            case LifeScenario.highSchoolDropout:
            case LifeScenario.youngChild:
            case LifeScenario.uberDriver:
            case LifeScenario.educatedAndInDebt:
            case LifeScenario.oldMan:
            case LifeScenario.sicklyChild:
            case LifeScenario.unluckiestGuy:
            case LifeScenario.sandboxMode:
            case LifeScenario.singleParent:
            case LifeScenario.armyPrivate:
            case LifeScenario.uneducatedAndHomeless:
            case LifeScenario.smallRestaurantOwner:
            case LifeScenario.smallSoftwareStudio:
            case LifeScenario.againstTheOdds:
                return true;
            case LifeScenario.youTubeStarWannable:
            case LifeScenario.starvingAppDeveloper:
            case LifeScenario.risingDJ:
            case LifeScenario.abusiveMarriage:
            case LifeScenario.orphanChild:
            case LifeScenario.infertileParent:
            case LifeScenario.washedUpActor:
            case LifeScenario.inspiringAuthor:
            case LifeScenario.giftedBasketPlayer:
            case LifeScenario.crazyCatLady:
            case LifeScenario.footballCaptain:
                return false;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    isCustomizable(): boolean {
        return this === LifeScenario.sandboxMode;
    }
    getInitialSex(): Sex {
        let i: LifeScenario = this;
        if (i === LifeScenario.oldMan) {
            return Sex.male;
        }
        if (i === LifeScenario.crazyCatLady) {
            return Sex.female;
        }
        return Sex.INSTANCE.getRandomSex();
    }
    getDifficulty(): LifeScenarioDifficulty {
        switch (this) {
            case LifeScenario.uberDriver:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.highSchoolDropout:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.youngChild:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.educatedAndInDebt:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.oldMan:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.brinkOfBankruptcy:
                return LifeScenarioDifficulty.challenging;
            case LifeScenario.sicklyChild:
                return LifeScenarioDifficulty.challenging;
            case LifeScenario.unluckiestGuy:
                return LifeScenarioDifficulty.challenging;
            case LifeScenario.uneducatedAndHomeless:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.youTubeStarWannable:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.starvingAppDeveloper:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.risingDJ:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.abusiveMarriage:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.orphanChild:
                return LifeScenarioDifficulty.challenging;
            case LifeScenario.sandboxMode:
                return LifeScenarioDifficulty.sandbox;
            case LifeScenario.singleParent:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.infertileParent:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.smallRestaurantOwner:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.smallSoftwareStudio:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.washedUpActor:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.inspiringAuthor:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.armyPrivate:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.crazyCatLady:
                return LifeScenarioDifficulty.moderate;
            case LifeScenario.againstTheOdds:
                return LifeScenarioDifficulty.challenging;
            case LifeScenario.footballCaptain:
                return LifeScenarioDifficulty.easy;
            case LifeScenario.giftedBasketPlayer:
                return LifeScenarioDifficulty.easy;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getParentsInitialState(): ParentInitialState {
        let i: LifeScenario = this;
        if ((i === LifeScenario.crazyCatLady) || (i === LifeScenario.oldMan)) {
            return ParentInitialState.dead;
        }
        if (((i === LifeScenario.sicklyChild) || (i === LifeScenario.orphanChild)) || (i === LifeScenario.againstTheOdds)) {
            return ParentInitialState.none;
        }
        return ParentInitialState.alive;
    }
    getInitialState(): Player {
        let newPerson: Player = Player.INSTANCE.newPerson();
        newPerson.initializeRandomTraits();
        newPerson.initializeSex(this.getInitialSex(), false);
        newPerson.setLifeScenario(this);
        let perkState: PlayerPerkState = newPerson.getPerkState();
        let states: ArrayList<PerkState.SinglePerkState> = GameStateManager.INSTANCE.getGlobalStateManager().getPerkState().getStates();
        let arrayList: ArrayList = new ArrayList();
        for (const obj of states) {
            if (((obj as unknown as PerkState.SinglePerkState)).getUnlocked()) {
                arrayList.add(obj);
            }
        }
        let arrayList2: ArrayList = arrayList;
        let arrayList3: ArrayList = new ArrayList();
        let it = arrayList2.iterator();
        while (it.hasNext()) {
            arrayList3.add(((it.next() as unknown as PerkState.SinglePerkState)).getType());
        }
        perkState.setPerks((CollectionsKt.toCollection(arrayList3, new ArrayList()) as unknown as ArrayList));
        switch (this) {
            case LifeScenario.highSchoolDropout:
                newPerson.initializeAgeInYears(18);
                newPerson.setMoneyState(new MoneyState(500, 0));
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.changeDiet(Diet.scavenge);
                newPerson.getHousingState().moveHere(Housing.homeless);
                newPerson.getCompletableActionState().setProgress(CompletableAction.highSchool, 15);
                break;
            case LifeScenario.youngChild:
                newPerson.initializeAgeInYears(13);
                newPerson.setMoneyState(new MoneyState(0, 0));
                newPerson.changeDiet(Diet.scavenge);
                newPerson.getHousingState().moveHere(Housing.parentsHouse);
                newPerson.setDiet(Diet.homeCooking);
                break;
            case LifeScenario.educatedAndInDebt:
                newPerson.initializeAgeInYears(25);
                newPerson.setMoneyState(new MoneyState(1000, -200000));
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction((ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.fastfood);
                break;
            case LifeScenario.oldMan:
                newPerson.initializeAgeInYears(70);
                newPerson.setMoneyState(new MoneyState(10000, 50000));
                let completableAction: CompletableAction = (ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(completableAction);
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.fastfood);
                newPerson.initializeMidLevelJobForDegree(completableAction);
                break;
            case LifeScenario.brinkOfBankruptcy:
                newPerson.initializeAgeInYears(50);
                newPerson.setMoneyState(new MoneyState(2000, -400000));
                let completableAction2: CompletableAction = (ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(completableAction2);
                newPerson.getHousingState().moveHere(Housing.grand_estate);
                newPerson.changeDiet(Diet.fastfood);
                newPerson.initializeMidLevelJobForDegree(completableAction2);
                break;
            case LifeScenario.sicklyChild:
                newPerson.initializeAgeInYears(15);
                newPerson.setMoneyState(new MoneyState(200, 0));
                newPerson.getHousingState().moveHere(Housing.homeless);
                newPerson.changeDiet(Diet.scavenge);
                newPerson.getTraitState().addTrait(Trait.sickly);
                break;
            case LifeScenario.unluckiestGuy:
                newPerson.initializeAgeInYears(19);
                newPerson.setMoneyState(new MoneyState(1000, 0));
                newPerson.getHousingState().moveHere(Housing.homeless);
                newPerson.changeDiet(Diet.fastfood);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getTraitState().addTrait(Trait.unlucky);
                break;
            case LifeScenario.uberDriver:
                newPerson.initializeAgeInYears(32);
                newPerson.setMoneyState(new MoneyState(5000, 1000));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getItemState().acquireItem(Possession.car);
                newPerson.getJobState().switchJob(Job.uber);
                break;
            case LifeScenario.uneducatedAndHomeless:
                newPerson.initializeAgeInYears(34);
                newPerson.setMoneyState(new MoneyState(5, 0));
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getHousingState().moveHere(Housing.homeless);
                newPerson.changeDiet(Diet.scavenge);
                break;
            case LifeScenario.youTubeStarWannable:
                newPerson.initializeAgeInYears(22);
                newPerson.setMoneyState(new MoneyState(500, 0));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getItemState().acquireItem(Possession.videoEquipment);
                newPerson.getSideHustleState().populateProject(SideHustle.youTubeStar, 4, SideHustle.ProjectQuality.garbage);
                break;
            case LifeScenario.starvingAppDeveloper:
                newPerson.initializeAgeInYears(37);
                newPerson.setMoneyState(new MoneyState(500, -100000));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.college_computerScience);
                newPerson.getItemState().acquireItem(Possession.laptop);
                newPerson.getSideHustleState().populateProject(SideHustle.appDeveloper, 3, SideHustle.ProjectQuality.garbage);
                newPerson.getSideHustleState().populateProject(SideHustle.appDeveloper, 1, SideHustle.ProjectQuality.poor);
                break;
            case LifeScenario.risingDJ:
                newPerson.initializeAgeInYears(32);
                newPerson.setMoneyState(new MoneyState(1000, -25000));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.college_music);
                newPerson.getItemState().acquireItem(Possession.turntable);
                newPerson.getSideHustleState().populateProject(SideHustle.DJ, 5, SideHustle.ProjectQuality.garbage);
                newPerson.getSideHustleState().populateProject(SideHustle.DJ, 2, SideHustle.ProjectQuality.poor);
                newPerson.getSideHustleState().populateProject(SideHustle.DJ, 1, SideHustle.ProjectQuality.good);
                break;
            case LifeScenario.abusiveMarriage:
                newPerson.initializeAgeInYears(34);
                newPerson.setMoneyState(new MoneyState(5000, -50000));
                newPerson.getHousingState().moveHere(Housing.house);
                newPerson.changeDiet(Diet.fastfood);
                let completableAction3: CompletableAction = (ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(completableAction3);
                newPerson.initializeMidLevelJobForDegree(completableAction3);
                newPerson.initializeLover(LoverPersonality.abusive, RomanticRelationshipStatus.married);
                break;
            case LifeScenario.orphanChild:
                newPerson.initializeAgeInYears(14);
                newPerson.setMoneyState(new MoneyState(10, 0));
                newPerson.getHousingState().moveHere(Housing.homeless);
                newPerson.changeDiet(Diet.scavenge);
                break;
            case LifeScenario.sandboxMode:
                newPerson.initializeAgeInYears(18);
                newPerson.setMoneyState(new MoneyState(50000, 0));
                newPerson.getHousingState().moveHere(Housing.homeless);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                break;
            case LifeScenario.singleParent:
                newPerson.initializeAgeInYears(32);
                newPerson.setMoneyState(new MoneyState(2000, 0));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getJobState().switchJob(Job.burgerFlipper);
                newPerson.getFamilyState().getFamilyMembers().add(new Person(Relationship.child, Sex.INSTANCE.getRandomSex(), newPerson.getLastName(), (Constants.Time.INSTANCE.getWeeksPerYear() * 3) + 5));
                newPerson.getFamilyState().getFamilyMembers().add(new Person(Relationship.child, Sex.INSTANCE.getRandomSex(), newPerson.getLastName(), (Constants.Time.INSTANCE.getWeeksPerYear() * 5) + 21));
                break;
            case LifeScenario.infertileParent:
                newPerson.initializeAgeInYears(32);
                newPerson.setMoneyState(new MoneyState(2000, 5000));
                newPerson.getHousingState().moveHere(Housing.house);
                newPerson.changeDiet(Diet.fastfood);
                let completableAction4: CompletableAction = (ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(completableAction4);
                newPerson.getTraitState().addTrait(Trait.infertile);
                newPerson.initializeMidLevelJobForDegree(completableAction4);
                newPerson.initializeLover(LoverPersonality.abusive, (ArraysKt.random(RomanticRelationshipStatus.values(), Random.INSTANCE) as unknown as RomanticRelationshipStatus));
                let partner: Person = newPerson.getFamilyState().getPartner();
                if (partner != null) {
                    partner.setRelationshipProgress(RelationshipProgressStatus.close.getStartProgressValue());
                    break;
                }
                break;
            case LifeScenario.washedUpActor:
                newPerson.initializeAgeInYears(42);
                newPerson.setMoneyState(new MoneyState(2000, 5000));
                newPerson.getHousingState().moveHere(Housing.luxury_condo);
                newPerson.changeDiet(Diet.fastfood);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.college_theater);
                newPerson.getItemState().acquireItem(Possession.videoEquipment);
                newPerson.getSideHustleState().populateProject(SideHustle.actor, 3, SideHustle.ProjectQuality.garbage);
                newPerson.getSideHustleState().populateProject(SideHustle.actor, 1, SideHustle.ProjectQuality.poor);
                break;
            case LifeScenario.inspiringAuthor:
                newPerson.initializeAgeInYears(34);
                newPerson.setMoneyState(new MoneyState(1000, 0));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.fastfood);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.college_literature);
                newPerson.getItemState().acquireItem(Possession.laptop);
                newPerson.getSideHustleState().populateProject(SideHustle.author, 3, SideHustle.ProjectQuality.garbage);
                break;
            case LifeScenario.armyPrivate:
                newPerson.initializeAgeInYears(20);
                newPerson.setMoneyState(new MoneyState(500, 100));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.militaryAcademy);
                newPerson.getJobState().switchJob(Job.army);
                break;
            case LifeScenario.crazyCatLady:
                newPerson.initializeAgeInYears(70);
                newPerson.setMoneyState(new MoneyState(2000, 25000));
                newPerson.getHousingState().moveHere(Housing.house);
                newPerson.changeDiet(Diet.fastfood);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction((ArraysKt.random(CompletableAction.INSTANCE.getCollegeDegrees(), Random.INSTANCE) as unknown as CompletableAction));
                for (let i = 0; i < 10; i++) {
                    newPerson.getFamilyState().adoptPet(Pet.cat, Integer.valueOf(Utils.Random.INSTANCE.randomValueWithinRange(0, Constants.Time.INSTANCE.getWeeksPerYear() * 3)));
                    let unit = Unit.INSTANCE;
                }
                break;
            case LifeScenario.againstTheOdds:
                newPerson.initializeAgeInYears(14);
                newPerson.setMoneyState(new MoneyState(200, 0));
                newPerson.getHousingState().moveHere(Housing.homeless);
                newPerson.changeDiet(Diet.scavenge);
                newPerson.getTraitState().addTrait(Trait.buttUgly);
                newPerson.getTraitState().addTrait(Trait.pessimistic);
                newPerson.getTraitState().addTrait(Trait.sickly);
                break;
            case LifeScenario.smallRestaurantOwner:
                newPerson.initializeAgeInYears(42);
                newPerson.setMoneyState(new MoneyState(20000, 500));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                let states2: BusinessState.SingleBusinessState[] = newPerson.getBusinessState().getStates();
                let arrayList4: ArrayList = new ArrayList();
                for (const singleBusinessState of states2) {
                    if (singleBusinessState.getType() === Business.restaurantChain) {
                        arrayList4.add(singleBusinessState);
                    }
                }
                let singleBusinessState2: BusinessState.SingleBusinessState = (CollectionsKt.firstOrNull((arrayList4 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState);
                if (singleBusinessState2 != null) {
                    singleBusinessState2.setLevel(1);
                    let valueOf: BigInteger = BigInteger.valueOf(1);
                    singleBusinessState2.setNumberOfBusinessUnits(valueOf);
                    singleBusinessState2.setMoraleProgress(50);
                    let unit2 = Unit.INSTANCE;
                    break;
                }
                break;
            case LifeScenario.smallSoftwareStudio:
                newPerson.initializeAgeInYears(32);
                newPerson.setMoneyState(new MoneyState(50000, 1000));
                newPerson.getHousingState().moveHere(Housing.shared_room);
                newPerson.changeDiet(Diet.cupnoodle);
                newPerson.getCompletableActionState().completeAction(CompletableAction.middleSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.highSchool);
                newPerson.getCompletableActionState().completeAction(CompletableAction.college_computerScience);
                let states3: BusinessState.SingleBusinessState[] = newPerson.getBusinessState().getStates();
                let arrayList5: ArrayList = new ArrayList();
                for (const singleBusinessState3 of states3) {
                    if (singleBusinessState3.getType() === Business.softwareCompany) {
                        arrayList5.add(singleBusinessState3);
                    }
                }
                let singleBusinessState4: BusinessState.SingleBusinessState = (CollectionsKt.firstOrNull((arrayList5 as unknown as ArrayList)) as unknown as BusinessState.SingleBusinessState);
                if (singleBusinessState4 != null) {
                    singleBusinessState4.setLevel(1);
                    let valueOf2: BigInteger = BigInteger.valueOf(4);
                    singleBusinessState4.setNumberOfBusinessUnits(valueOf2);
                    singleBusinessState4.setMoraleProgress(100);
                    let unit3 = Unit.INSTANCE;
                    break;
                }
                break;
        }
        newPerson.initializeParents(this.getParentsInitialState());
        return newPerson;
    }
}
