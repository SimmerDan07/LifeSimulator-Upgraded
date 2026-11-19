// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Arrays, BigInteger, Integer, Intrinsics, JMath, R, StringCompanionObject, TypeCastException } from "../runtime";
import { CompletableAction } from "./CompletableAction";
import { Constants } from "../Utils/Constants";
import { Country } from "./Country";
import { Diet } from "./Diet";
import { GameInAppPurchase } from "./GameInAppPurchase";
import { GameStateManager } from "../Managers/GameStateManager";
import { Leisure } from "./Leisure";
import { LoveEvent } from "./LoveEvent";
import { Modifiers } from "../Managers/Modifiers";
import { Person } from "../Managers/Person";
import { PersonInteraction } from "./PersonInteraction";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { Relationship } from "./Relationship";
import { RelationshipProgressStatus } from "./RelationshipProgressStatus";
import { Sex } from "./Sex";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";

export interface ActionDescriptor {
    action(player: Player): void;
    getActionTitle(): string;
    getAdditionalDescription(): string;
    getAgeRange(): ValueRange;
    getCost(): BigInteger;
    getImageId(): number;
    getModifiers(): Modifiers;
    getRequiredItem(): Possession;
    getTitle(): string;
    overrideCost(metadata: any): BigInteger;
    overrideImageId(metadata: any): number;
    overrideTitle(metadata: any): string;
    requirementNotMetString(player: Player): string;
}
export namespace ActionDescriptor {
    export class DefaultImpls {
        static getActionTitle(actionDescriptor: ActionDescriptor): string {
        return null;
    }
        static getAdditionalDescription(actionDescriptor: ActionDescriptor): string {
        return null;
    }
        static getAgeRange(actionDescriptor: ActionDescriptor): ValueRange {
        return null;
    }
        static getRequiredItem(actionDescriptor: ActionDescriptor): Possession {
        return null;
    }
        static overrideCost(actionDescriptor: ActionDescriptor, metadata: any): BigInteger {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return null;
    }
        static overrideImageId(actionDescriptor: ActionDescriptor, metadata: any): number {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return null;
    }
        static overrideTitle(actionDescriptor: ActionDescriptor, metadata: any): string {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return null;
    }
        static getCost(actionDescriptor: ActionDescriptor): BigInteger {
        let valueOf: BigInteger = BigInteger.valueOf(0);
        return valueOf;
    }
        static getModifiers(actionDescriptor: ActionDescriptor): Modifiers {
        return new Modifiers(0.0, 0.0, 0.0);
    }
        static requirementNotMetString(actionDescriptor: ActionDescriptor, player: Player): string {
        let string: string;
        let string2: string;
        let partner: Person;
        let travelCountry: Country;
        Intrinsics.checkParameterIsNotNull(player, "player");
        let ageRange: ValueRange = actionDescriptor.getAgeRange();
        if (ageRange != null) {
            if (player.getAgeInYears() < ageRange.getMin()) {
                let string3: string = Utils.INSTANCE.getString(R.string.AgeRestriction_TooYoung);
                let objArr = [Integer.valueOf(JMath.toInt(ageRange.getMin()))];
                let format: string = String.format(string3, Arrays.copyOf(objArr, objArr.length));
                return format;
            }
            if (player.getAgeInYears() > ageRange.getMax()) {
                let string4: string = Utils.INSTANCE.getString(R.string.AgeRestriction_TooOld);
                let objArr2 = [Integer.valueOf(JMath.toInt(ageRange.getMax()))];
                let format2: string = String.format(string4, Arrays.copyOf(objArr2, objArr2.length));
                return format2;
            }
        }
        let requiredItem: Possession = actionDescriptor.getRequiredItem();
        if ((requiredItem != null) && !player.getItemState().isOwned(requiredItem)) {
            return Utils.Strings.INSTANCE.getRequiresString(requiredItem.getTitle());
        }
        if ((actionDescriptor instanceof Leisure) && ((travelCountry = ((actionDescriptor as unknown as Leisure)).getTravelCountry()) != null)) {
            if ((!GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockAllDestinations) && !GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockAllContent)) && !travelCountry.getUnlockedByDefault()) {
                return Utils.INSTANCE.getString(R.string.Perks_Unlock_InAppPurchase);
            }
            // v0.27.0: English counts too (for people born elsewhere), and your native language is always known
            let requiredLanguage: CompletableAction = travelCountry.getRequiredLanguage() ?? (CompletableAction as any).english;
            if ((requiredLanguage != null) && !player.getCompletableActionState().isCompleted(requiredLanguage) && ((player as any).nativeLanguage ?? "english") !== requiredLanguage.name()) {
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string5: string = Utils.INSTANCE.getString(R.string.Move_NeedLanguage_Message);
                let objArr3 = [requiredLanguage.getTitle()];
                let format3: string = String.format(string5, Arrays.copyOf(objArr3, objArr3.length));
                return format3;
            }
        }
        if (actionDescriptor instanceof LoveEvent) {
            let requiredRelationshipStatus: RelationshipProgressStatus = ((actionDescriptor as unknown as LoveEvent)).getRequiredRelationshipStatus();
            if (((requiredRelationshipStatus != null) && ((partner = player.getFamilyState().getPartner()) != null)) && (partner.getRelationshipProgress() < requiredRelationshipStatus.getStartProgressValue())) {
                let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                let string6: string = Utils.INSTANCE.getString(R.string.LoveRequiresRelationship);
                let objArr4 = [requiredRelationshipStatus.title(Relationship.lover)];
                let format4: string = String.format(string6, Arrays.copyOf(objArr4, objArr4.length));
                return format4;
            }
            if (actionDescriptor === LoveEvent.makeBaby) {
                let partner2: Person = player.getFamilyState().getPartner();
                if (partner2 == null) {
                    Intrinsics.throwNpe();
                }
                if (player.getSex() === Sex.male) {
                    let stringCompanionObject3 = StringCompanionObject.INSTANCE;
                    let string7: string = Utils.INSTANCE.getString(R.string.Common_YourWife);
                    let objArr5 = new Array(1).fill(null);
                    let title: string = partner2.getTitle();
                    if (title == null) {
                        throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
                    }
                    let lowerCase: string = title.toLowerCase();
                    objArr5[0] = lowerCase;
                    string = String.format(string7, Arrays.copyOf(objArr5, objArr5.length));
                } else {
                    string = Utils.INSTANCE.getString(R.string.Common_You);
                }
                if (player.getSex() === Sex.male) {
                    let stringCompanionObject4 = StringCompanionObject.INSTANCE;
                    let string8: string = Utils.INSTANCE.getString(R.string.PregnantMessageWife);
                    let objArr6 = new Array(1).fill(null);
                    let title2: string = partner2.getTitle();
                    if (title2 == null) {
                        throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
                    }
                    let lowerCase2: string = title2.toLowerCase();
                    objArr6[0] = lowerCase2;
                    string2 = String.format(string8, Arrays.copyOf(objArr6, objArr6.length));
                } else {
                    string2 = Utils.INSTANCE.getString(R.string.PregnantMessageYou);
                }
                let ageInYears: number = (player.getSex() === Sex.male) ? partner2.getAgeInYears() : player.getAgeInYears();
                let hasTrait: boolean = player.hasTrait(Trait.infertile);
                if (player.getFamilyState().getPregnantChild() != null) {
                    let stringCompanionObject5 = StringCompanionObject.INSTANCE;
                    let objArr7 = [string2];
                    let format5: string = String.format(Utils.INSTANCE.getString(R.string.PregnantAlreadyMessage), Arrays.copyOf(objArr7, objArr7.length));
                    return format5;
                }
                if (hasTrait) {
                    return Utils.INSTANCE.getString(R.string.Infertile_ActionDescription);
                }
                let d: number = ageInYears;
                if (d < Constants.Time.INSTANCE.getPregnancyAgeRange().getMin()) {
                    let stringCompanionObject6 = StringCompanionObject.INSTANCE;
                    let string9: string = Utils.INSTANCE.getString(R.string.TooYoungToHaveChildrenMessage);
                    let objArr8 = [string, Integer.valueOf(JMath.toInt(Constants.Time.INSTANCE.getPregnancyAgeRange().getMin()))];
                    let format6: string = String.format(string9, Arrays.copyOf(objArr8, objArr8.length));
                    return format6;
                }
                if (d > Constants.Time.INSTANCE.getPregnancyAgeRange().getMax()) {
                    let stringCompanionObject7 = StringCompanionObject.INSTANCE;
                    let string10: string = Utils.INSTANCE.getString(R.string.TooOldToHaveChildrenMessage);
                    let objArr9 = [string, Integer.valueOf(JMath.toInt(Constants.Time.INSTANCE.getPregnancyAgeRange().getMax()))];
                    let format7: string = String.format(string10, Arrays.copyOf(objArr9, objArr9.length));
                    return format7;
                }
            }
        }
        if (actionDescriptor instanceof PersonInteraction) {
            if (actionDescriptor === PersonInteraction.familyVacation) {
                let children: ArrayList<Person> = player.getFamilyState().getChildren();
                let arrayList: ArrayList = new ArrayList();
                for (const obj of children) {
                    if (((obj as unknown as Person)).getIsAlive()) {
                        arrayList.add(obj);
                    }
                }
                if (arrayList.size() < 2) {
                    return Utils.INSTANCE.getString(R.string.FamilyVacation_NoEnoughChildren);
                }
            } else if (actionDescriptor === PersonInteraction.adoptPet) {
                let size: number = player.getFamilyState().getAlivePets().size();
                let numberOfPetsAllowed: number = player.getHousingState().currentHousing().getType().getNumberOfPetsAllowed();
                if (numberOfPetsAllowed === 0) {
                    return Utils.INSTANCE.getString(R.string.PetsLimit_NoPetsAllowed);
                }
                if (size >= numberOfPetsAllowed) {
                    return Utils.INSTANCE.getString(R.string.PetsLimit_MaxPetsReached);
                }
            } else if (actionDescriptor === PersonInteraction.roadTrip) {
                if (player.getFamilyState().getParents().size() === 0) {
                    return Utils.INSTANCE.getString(R.string.FamilyEvent_NoParents);
                }
                if (!player.getFamilyState().getParentsStillLiving()) {
                    return Utils.INSTANCE.getString(R.string.FamilyEvent_ParentsDead);
                }
            }
        }
        if (((actionDescriptor instanceof Diet) && ((actionDescriptor as unknown as Diet)).isHomeCooked()) && !player.getCompletableActionState().isCompleted(CompletableAction.homeChef)) {
            return Utils.Strings.INSTANCE.getRequiresString(CompletableAction.homeChef.getTitle());
        }
        return null;
    }
    }
}
