// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Integer, Intrinsics, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { ActionDescriptor } from "./ActionDescriptor";
import { AlertManager } from "../Managers/AlertManager";
import { ChildAgeGroup } from "./ChildAgeGroup";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragment } from "../ui/bridge";
import { GenericListType } from "../Fragments/GenericListType";
import { LoveEvent } from "./LoveEvent";
import { Modifiers } from "../Managers/Modifiers";
import { Person } from "../Managers/Person";
import { PersonInteractionEventType } from "./PersonInteractionEventType";
import { Pet } from "./Pet";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { RandomEvent } from "./RandomEvent";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";

export class PersonInteraction extends JEnum implements ActionDescriptor {
    static readonly putUpForAdoption: PersonInteraction = new PersonInteraction("putUpForAdoption", 0);
    static readonly tellStory: PersonInteraction = new PersonInteraction("tellStory", 1);
    static readonly visitPlayground: PersonInteraction = new PersonInteraction("visitPlayground", 2);
    static readonly playCatch: PersonInteraction = new PersonInteraction("playCatch", 3);
    static readonly goToCarnival: PersonInteraction = new PersonInteraction("goToCarnival", 4);
    static readonly movieNight: PersonInteraction = new PersonInteraction("movieNight", 5);
    static readonly visitThemePark: PersonInteraction = new PersonInteraction("visitThemePark", 6);
    static readonly call: PersonInteraction = new PersonInteraction("call", 7);
    static readonly grabDrinks: PersonInteraction = new PersonInteraction("grabDrinks", 8);
    static readonly visit: PersonInteraction = new PersonInteraction("visit", 9);
    static readonly familyVacation: PersonInteraction = new PersonInteraction("familyVacation", 10);
    static readonly funeral: PersonInteraction = new PersonInteraction("funeral", 11);
    static readonly adoptPet: PersonInteraction = new PersonInteraction("adoptPet", 12);
    static readonly petPet: PersonInteraction = new PersonInteraction("petPet", 13);
    static readonly giveTreat: PersonInteraction = new PersonInteraction("giveTreat", 14);
    static readonly abandonPet: PersonInteraction = new PersonInteraction("abandonPet", 15);
    static readonly spendTime: PersonInteraction = new PersonInteraction("spendTime", 16);
    static readonly giveGift: PersonInteraction = new PersonInteraction("giveGift", 17);
    static readonly roadTrip: PersonInteraction = new PersonInteraction("roadTrip", 18);
    static values(): PersonInteraction[] { return [PersonInteraction.putUpForAdoption, PersonInteraction.tellStory, PersonInteraction.visitPlayground, PersonInteraction.playCatch, PersonInteraction.goToCarnival, PersonInteraction.movieNight, PersonInteraction.visitThemePark, PersonInteraction.call, PersonInteraction.grabDrinks, PersonInteraction.visit, PersonInteraction.familyVacation, PersonInteraction.funeral, PersonInteraction.adoptPet, PersonInteraction.petPet, PersonInteraction.giveTreat, PersonInteraction.abandonPet, PersonInteraction.spendTime, PersonInteraction.giveGift, PersonInteraction.roadTrip]; }
    static valueOf(n: string): PersonInteraction { return (PersonInteraction as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getAgeRange(): ValueRange {
        return ActionDescriptor.DefaultImpls.getAgeRange(this);
    }
    getRequiredItem(): Possession {
        return ActionDescriptor.DefaultImpls.getRequiredItem(this);
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
            case PersonInteraction.putUpForAdoption:
                return Utils.INSTANCE.getString(R.string.ChildAction_PutUpForAdoption);
            case PersonInteraction.tellStory:
                return Utils.INSTANCE.getString(R.string.ChildAction_TellStory);
            case PersonInteraction.visitPlayground:
                return Utils.INSTANCE.getString(R.string.ChildAction_VisitPlayground);
            case PersonInteraction.playCatch:
                return Utils.INSTANCE.getString(R.string.ChildAction_PlayCatch);
            case PersonInteraction.goToCarnival:
                return Utils.INSTANCE.getString(R.string.ChildAction_GoToCarnival);
            case PersonInteraction.movieNight:
                return Utils.INSTANCE.getString(R.string.ChildAction_MovieNight);
            case PersonInteraction.visitThemePark:
                return Utils.INSTANCE.getString(R.string.ChildAction_VisitThemePark);
            case PersonInteraction.call:
                return Utils.INSTANCE.getString(R.string.ChildAction_FamilyCall);
            case PersonInteraction.grabDrinks:
                return Utils.INSTANCE.getString(R.string.ChildAction_GrabDrinks);
            case PersonInteraction.visit:
                return Utils.INSTANCE.getString(R.string.ChildAction_FamilyVisit);
            case PersonInteraction.familyVacation:
                return Utils.INSTANCE.getString(R.string.ChildAction_FamilyVacation);
            case PersonInteraction.funeral:
                return Utils.INSTANCE.getString(R.string.ChildAction_Funeral);
            case PersonInteraction.adoptPet:
                return Utils.INSTANCE.getString(R.string.Pet_Action_Adopt);
            case PersonInteraction.petPet:
                return Utils.INSTANCE.getString(R.string.Pet_Action_Pet);
            case PersonInteraction.giveTreat:
                return Utils.INSTANCE.getString(R.string.Pet_Action_GiveTreat);
            case PersonInteraction.abandonPet:
                return Utils.INSTANCE.getString(R.string.Pet_Action_Abandon);
            case PersonInteraction.spendTime:
                return Utils.INSTANCE.getString(R.string.FamilyEvent_SpendTime);
            case PersonInteraction.giveGift:
                return Utils.INSTANCE.getString(R.string.FamilyEvent_GiveGift);
            case PersonInteraction.roadTrip:
                return Utils.INSTANCE.getString(R.string.FamilyEvent_FamilyVacation);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getCost(): BigInteger {
        let i: number = 5000;
        switch (this) {
            case PersonInteraction.putUpForAdoption:
            case PersonInteraction.visit:
                break;
            case PersonInteraction.tellStory:
            case PersonInteraction.playCatch:
            case PersonInteraction.call:
            case PersonInteraction.spendTime:
            // v0.12.0 fix: petting, adopting (the pet's own price applies) and abandoning fell through to $5,000 in the port
            case PersonInteraction.petPet:
            case PersonInteraction.adoptPet:
            case PersonInteraction.abandonPet:
                i = 0;
                break;
            case PersonInteraction.visitPlayground:
                i = 50;
                break;
            case PersonInteraction.goToCarnival:
            case PersonInteraction.visitThemePark:
            case PersonInteraction.giveGift:
                i = 200;
                break;
            case PersonInteraction.movieNight:
                i = 100;
                break;
            case PersonInteraction.grabDrinks:
                i = 500;
                break;
            case PersonInteraction.familyVacation:
                i = ((GameStateManager.INSTANCE.getPersonState().getFamilyState().getAliveChildren().size() * 10000) + 30000) + ((GameStateManager.INSTANCE.getPersonState().getFamilyState().getPartner() == null) ? 0 : 10000);
                break;
            case PersonInteraction.funeral:
                i = 10000;
                break;
            case PersonInteraction.roadTrip:
                i = 3000;
                break;
        }
        let valueOf: BigInteger = BigInteger.valueOf(i);
        return valueOf;
    }
    overrideCost(metadata: any): BigInteger {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        if (!(metadata instanceof Person)) {
            return null;
        }
        if (((metadata as unknown as Person)).getPetType() != null) {
            if (this !== PersonInteraction.giveTreat) {
                return null;
            }
            let valueOf: BigInteger = BigInteger.valueOf(((metadata as unknown as Person)).getPetType().getTreatCost());
            return valueOf;
        }
        return ActionDescriptor.DefaultImpls.overrideCost(this, metadata);
    }
    getImageId(): number {
        switch (this) {
            case PersonInteraction.putUpForAdoption:
                return R.drawable.childaction_adoption;
            case PersonInteraction.tellStory:
                return R.drawable.childaction_tellstory;
            case PersonInteraction.visitPlayground:
                return R.drawable.childaction_playground;
            case PersonInteraction.playCatch:
                return R.drawable.childaction_playcatch;
            case PersonInteraction.goToCarnival:
                return R.drawable.childaction_carnival;
            case PersonInteraction.movieNight:
                return R.drawable.childaction_movienight;
            case PersonInteraction.visitThemePark:
                return R.drawable.childaction_themepark;
            case PersonInteraction.call:
                return R.drawable.childaction_call;
            case PersonInteraction.grabDrinks:
                return R.drawable.childaction_grabdrinks;
            case PersonInteraction.visit:
                return R.drawable.childaction_visit;
            case PersonInteraction.familyVacation:
                return R.drawable.childaction_familyvacation;
            case PersonInteraction.funeral:
                return LoveEvent.attendFuneral.getImageId();
            case PersonInteraction.adoptPet:
                return R.drawable.pet_adopt;
            case PersonInteraction.petPet:
                return R.drawable.pet_dog;
            case PersonInteraction.giveTreat:
                return R.drawable.pet_dog_food;
            case PersonInteraction.abandonPet:
                return R.drawable.pet_abandon;
            case PersonInteraction.spendTime:
                return R.drawable.family;
            case PersonInteraction.giveGift:
                return R.drawable.inappnotification_gift;
            case PersonInteraction.roadTrip:
                return R.drawable.work_uber;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    overrideImageId(metadata: any): number {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        if (!(metadata instanceof Person)) {
            return null;
        }
        let petType: Pet = ((metadata as unknown as Person)).getPetType();
        if (petType != null) {
            let i: PersonInteraction = this;
            if (i === PersonInteraction.petPet) {
                return Integer.valueOf(petType.getImageId());
            }
            if (i !== PersonInteraction.giveTreat) {
                return null;
            }
            return Integer.valueOf(petType.getTreatImageId());
        }
        return ActionDescriptor.DefaultImpls.overrideImageId(this, metadata);
    }
    getModifiers(): Modifiers {
        switch (this) {
            case PersonInteraction.putUpForAdoption:
                return Modifiers.INSTANCE.modifierWithHappiness(0.0);
            case PersonInteraction.tellStory:
                return Modifiers.INSTANCE.modifierWithHappiness(3.0);
            case PersonInteraction.visitPlayground:
                return Modifiers.INSTANCE.modifierWithHappiness(6.0);
            case PersonInteraction.playCatch:
                return Modifiers.INSTANCE.modifierWithHappiness(6.0);
            case PersonInteraction.goToCarnival:
                return Modifiers.INSTANCE.modifierWithHappiness(10.0);
            case PersonInteraction.movieNight:
                return Modifiers.INSTANCE.modifierWithHappiness(8.0);
            case PersonInteraction.visitThemePark:
                return Modifiers.INSTANCE.modifierWithHappiness(15.0);
            case PersonInteraction.call:
                return Modifiers.INSTANCE.modifierWithHappiness(0.0);
            case PersonInteraction.grabDrinks:
                return Modifiers.INSTANCE.modifierWithHappiness(10.0);
            case PersonInteraction.visit:
                return Modifiers.INSTANCE.modifierWithHappiness(20.0);
            case PersonInteraction.familyVacation:
                return Modifiers.INSTANCE.modifierWithHappiness(25.0);
            case PersonInteraction.funeral:
                return Modifiers.INSTANCE.modifierWithHappiness(-20.0);
            case PersonInteraction.adoptPet:
                return Modifiers.INSTANCE.modifierWithZero();
            case PersonInteraction.petPet:
                return Modifiers.INSTANCE.modifierWithZero();
            case PersonInteraction.giveTreat:
                return Modifiers.INSTANCE.modifierWithZero();
            case PersonInteraction.abandonPet:
                return Modifiers.INSTANCE.modifierWithZero();
            case PersonInteraction.spendTime:
                return Modifiers.INSTANCE.modifierWithHappiness(3.0);
            case PersonInteraction.giveGift:
                return Modifiers.INSTANCE.modifierWithHappiness(5.0);
            case PersonInteraction.roadTrip:
                return Modifiers.INSTANCE.modifierWithHappiness(8.0);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getEventType(): PersonInteractionEventType {
        switch (this) {
            case PersonInteraction.putUpForAdoption:
            case PersonInteraction.tellStory:
            case PersonInteraction.visitPlayground:
            case PersonInteraction.playCatch:
            case PersonInteraction.goToCarnival:
            case PersonInteraction.movieNight:
            case PersonInteraction.visitThemePark:
            case PersonInteraction.call:
            case PersonInteraction.grabDrinks:
            case PersonInteraction.visit:
            case PersonInteraction.familyVacation:
            case PersonInteraction.funeral:
                return PersonInteractionEventType.child;
            case PersonInteraction.adoptPet:
            case PersonInteraction.petPet:
            case PersonInteraction.giveTreat:
            case PersonInteraction.abandonPet:
                return PersonInteractionEventType.pet;
            case PersonInteraction.spendTime:
            case PersonInteraction.giveGift:
            case PersonInteraction.roadTrip:
                return PersonInteractionEventType.family;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getRelationshipModifier(): number {
        switch (this) {
            case PersonInteraction.putUpForAdoption:
            case PersonInteraction.funeral:
                return 0;
            case PersonInteraction.tellStory:
                return 8;
            case PersonInteraction.visitPlayground:
            case PersonInteraction.playCatch:
                return 12;
            case PersonInteraction.goToCarnival:
            case PersonInteraction.roadTrip:
                return 25;
            case PersonInteraction.movieNight:
            case PersonInteraction.giveGift:
                return 15;
            case PersonInteraction.visitThemePark:
                return 30;
            case PersonInteraction.call:
                return 20;
            case PersonInteraction.grabDrinks:
            case PersonInteraction.petPet:
                return 50;
            case PersonInteraction.visit:
                return 150;
            case PersonInteraction.familyVacation:
            case PersonInteraction.giveTreat:
                return 100;
            case PersonInteraction.spendTime:
                return 10;
        }
        return 0;   // adopt/abandon a pet: no change (was undefined → "+undefined relationship")
    }
    getAdditionalDescription(): string {
        if (this.getRelationshipModifier() <= 0) {
            return null;
        }
        if (this.getEventType() === PersonInteractionEventType.child) {
            return ((("+" + this.getRelationshipModifier()) + " ") + Utils.INSTANCE.getString(R.string.ChildEvent_EventModifier)) + "\n";
        }
        return ((("+" + this.getRelationshipModifier()) + " ") + Utils.INSTANCE.getString(R.string.Common_RelationshipLower)) + "\n";
    }
    getShouldAdvanceWeek(): boolean {
        return this !== PersonInteraction.adoptPet;
    }
    action(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let currentlyShowingGenericList: GenericListFragment = GameStateManager.INSTANCE.getCurrentlyShowingGenericList();
        if ((currentlyShowingGenericList != null) && (((currentlyShowingGenericList.getListType() === GenericListType.childDetails) || (currentlyShowingGenericList.getListType() === GenericListType.petDetails)) || (currentlyShowingGenericList.getListType() === GenericListType.parentDetails) || (currentlyShowingGenericList.getListType() === GenericListType.personDetails))) {
            let withId: Person = player.getFamilyState().getWithId(currentlyShowingGenericList.getListKey());
            if (withId != null) {
                withId.interactionEvent(this);
            }
            Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getReloadGenericList());
        }
        player.personInteractionEvent(this);
        if (this.getShouldAdvanceWeek()) {
            AlertManager.showRandomEvent$default(AlertManager.INSTANCE, RandomEvent.INSTANCE.randomEventForPersonInteraction(this), false, 2, null);
            player.applyWeekly();
        }
    }
    getActionTitle(): string {
        if (this !== PersonInteraction.adoptPet) {
            return null;
        }
        return Utils.INSTANCE.getString(R.string.Common_Choose);
    }
}
export namespace PersonInteraction {
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
        actionWithChild(child: Person): PersonInteraction[] {
        Intrinsics.checkParameterIsNotNull(child, "child");
        if (!child.getIsAlive()) {
            return [PersonInteraction.funeral];
        }
        let i: ChildAgeGroup = child.getChildAgeGroup();
        if (i === ChildAgeGroup.pregnant) {
            return new Array(0).fill(null);
        }
        if (i === ChildAgeGroup.infant) {
            return [PersonInteraction.tellStory, PersonInteraction.visitPlayground, PersonInteraction.putUpForAdoption];
        }
        if (i === ChildAgeGroup.child) {
            return [PersonInteraction.playCatch, PersonInteraction.goToCarnival, PersonInteraction.putUpForAdoption];
        }
        if (i === ChildAgeGroup.adolescent) {
            return [PersonInteraction.movieNight, PersonInteraction.visitThemePark, PersonInteraction.putUpForAdoption];
        }
        if (i === ChildAgeGroup.adult) {
            return [PersonInteraction.call, PersonInteraction.grabDrinks, PersonInteraction.visit];
        }
        throw new NoWhenBranchMatchedException();
    }
        getParentActions(): PersonInteraction[] {
        return [PersonInteraction.spendTime, PersonInteraction.giveGift];
    }
        getGroupChildAction(): PersonInteraction[] {
        return [PersonInteraction.familyVacation];
    }
        getPetActions(): PersonInteraction[] {
        return [PersonInteraction.petPet, PersonInteraction.giveTreat, PersonInteraction.abandonPet];
    }
    }
}
PersonInteraction.INSTANCE = new PersonInteraction.Companion(null);
