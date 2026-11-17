// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ComingOut } from "../Managers/ComingOut";
import { ArrayList, BigInteger, CollectionsKt, ComparisonsKt, Integer, Intrinsics, R, SpannableStringBuilder } from "../runtime";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { IViewModelGenerator } from "./IViewModelGenerator";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { LoveEvent } from "../Enums/LoveEvent";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { Modifiers } from "../Managers/Modifiers";
import { Person } from "../Managers/Person";
import { PersonInteraction } from "../Enums/PersonInteraction";
import { Player } from "../Managers/Player";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";

export class LoveModelGenerator implements IViewModelGenerator {
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        arrayList.addAll(this.getRomanceViewModels());
        arrayList.addAll(this.getParentsViewModels());
        arrayList.addAll(this.getChildrenViewModels());
        arrayList.addAll(this.getPetsViewModels());
        return new GenericListFragmentViewModel(arrayList);
    }
    getPetsViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.Common_Pets)));
        let pets: ArrayList<Person> = GameStateManager.INSTANCE.getPersonState().getFamilyState().getPets();
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of pets) {
            if (((obj as unknown as Person)).getIsAlive()) {
                arrayList2.add(obj);
            }
        }
        let arrayList3: ArrayList<Person> = arrayList2;
        if (arrayList3.size() > 0) {
            for (const person of arrayList3) {
                let personNameAndAgeInfoViewModel: LeftRightCellViewModel = person.getPersonNameAndAgeInfoViewModel();
                personNameAndAgeInfoViewModel.setOnClick({
                    invoke: () => {
                    Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.petDetails, person.getId(), false, 4, null);
                }
                });
                arrayList.add(personNameAndAgeInfoViewModel);
                arrayList.add(person.getProgressBarViewModel());
            }
        } else {
            arrayList.add(new SingleLabelCellViewModel("NoPetsMessage", Utils.INSTANCE.getString(R.string.YouHaveNoPetsMessage)));
        }
        arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, PersonInteraction.adoptPet, null, 2, null));
        return arrayList;
    }
    getChildrenViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.Common_Children)));
        let children: ArrayList<Person> = GameStateManager.INSTANCE.getPersonState().getFamilyState().getChildren();
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of children) {
            if (((obj as unknown as Person)).getIsAlive()) {
                arrayList2.add(obj);
            }
        }
        let sortedWith: ArrayList<Person> = CollectionsKt.sortedWith(arrayList2, {
            compare: (t: any, t2: any) => {
            return ComparisonsKt.compareValues(Integer.valueOf(((t as unknown as Person)).getAgeInWeeks()), Integer.valueOf(((t2 as unknown as Person)).getAgeInWeeks()));
        }
        });
        if (sortedWith.size() > 0) {
            for (const person of sortedWith) {
                let personNameAndAgeInfoViewModel: LeftRightCellViewModel = person.getPersonNameAndAgeInfoViewModel();
                if (!person.getNotYetBorn()) {
                    personNameAndAgeInfoViewModel.setOnClick({
                        invoke: () => {
                        Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.childDetails, person.getId(), false, 4, null);
                    }
                    });
                    arrayList.add(personNameAndAgeInfoViewModel);
                    arrayList.add(person.getProgressBarViewModel());
                } else {
                    arrayList.add(personNameAndAgeInfoViewModel);
                }
            }
        } else {
            arrayList.add(new SingleLabelCellViewModel("NoChildrenMessage", Utils.INSTANCE.getString(R.string.YouHaveNoChildrenMessage)));
        }
        for (const personInteraction of PersonInteraction.INSTANCE.getGroupChildAction()) {
            arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, personInteraction, null, 2, null));
        }
        return arrayList;
    }
    getRomanceViewModels(): ArrayList<BaseViewModel> {
        let intValue: number;
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Love)));
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        arrayList.add(new SingleLabelCellViewModel("RelationshipStatus", new TextLabelViewModel(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Common_Status) + ": ", null, null, null, 14, null), personState.getRomanticRelationshipStatus().getTitle(), R.color.flatSkyBlue, null, null, 12, null), false, false, null, 14, null)));
        let partner: Person = personState.getFamilyState().getPartner();
        if (partner != null) {
            let loverPersonality: LoverPersonality = partner.getLoverPersonality();
            if (loverPersonality == null) {
                Intrinsics.throwNpe();
            }
            arrayList.add(new LeftRightCellViewModel("RomanceNameAndAge", new TextLabelViewModel(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), partner.getTitle() + ": ", null, null, null, 14, null), partner.getFullName(), null, null, null, 14, null), false, false, null, 14, null), new TextLabelViewModel(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), (Utils.INSTANCE.getString(R.string.identity_name_age) + ": ") + partner.getAgeInYears(), null, null, null, 14, null), false, false, null, 14, null), null, 8, null));
            let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
            let partnerModifiers: Modifiers = partner.getPartnerModifiers();
            if (partnerModifiers != null) {
                ExtensionsKt.appendAttributesString$default(spannableStringBuilder, partnerModifiers, null, null, null, 14, null);
            }
            let partnerCost: number = partner.getPartnerCost();
            if ((partnerCost != null) && ((intValue = partnerCost.intValue()) !== 0)) {
                spannableStringBuilder.append(" ");
                let valueOf: BigInteger = BigInteger.valueOf(intValue);
                ExtensionsKt.appendMoney(spannableStringBuilder, valueOf);
            }
            arrayList.add(new LeftRightCellViewModel("LovePersonality", new TextLabelViewModel(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Alert_Love_YouMetSomeone_Personality) + ": ", null, null, null, 14, null), loverPersonality.getTitle(), null, null, null, 14, null), false, false, null, 14, null), new TextLabelViewModel(spannableStringBuilder, false, false, null, 14, null), null, 8, null));
            CollectionsKt.addAll(arrayList, partner.getRelationDescriptorAndProgressBarViewModels());
        }
        let it = LoveEvent.INSTANCE.eventsForPlayer(GameStateManager.INSTANCE.getPersonState()).iterator();
        while (it.hasNext()) {
            let loveEvent: LoveEvent = it.next();
            let companion = ActionCellSingleViewModel.INSTANCE;
            arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(companion, loveEvent, null, 2, null));
        }
        const comingOut = ComingOut.cell();
        if (comingOut != null) arrayList.add(comingOut);
        return arrayList;
    }
    getParentsViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.HelpSection_Parents)));
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        if (personState.getFamilyState().getParents().size() === 0) {
            arrayList.add(new SingleLabelCellViewModel("NoParentLabel", Utils.INSTANCE.getString(R.string.YouHaveNoParents_Message)));
            return arrayList;
        }
        let appendBold$default: SpannableStringBuilder = ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Family_AllowanceLabel) + ": ", null, null, null, 14, null);
        if (!personState.getFamilyState().getParentsStillLiving()) {
            ExtensionsKt.appendNormal$default(appendBold$default, Utils.INSTANCE.getString(R.string.FamilyEvent_ParentsDead), null, null, null, 14, null);
        } else if (!personState.getCanBeSupportedByFamily()) {
            ExtensionsKt.appendNormal$default(appendBold$default, Utils.INSTANCE.getString(R.string.FamilyEvent_TooOldForAllowance), null, null, null, 14, null);
        } else {
            ExtensionsKt.appendNormal$default(appendBold$default, ExtensionsKt.numberDisplayString$default(personState.getCurrentAllowance(), false, 1, null), R.color.flatGreen, null, null, 12, null);
        }
        arrayList.add(new LeftRightCellViewModel("ParentAllowance", appendBold$default));
        let it = personState.getFamilyState().getParents().iterator();
        while (it.hasNext()) {
            let next: Person = it.next();
            let personNameAndAgeInfoViewModel: LeftRightCellViewModel = next.getPersonNameAndAgeInfoViewModel();
            if (next.getIsAlive()) {
                personNameAndAgeInfoViewModel.setOnClick({
                    invoke: () => {
                    Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.parentDetails, next.getId(), false, 4, null);
                }
                });
            }
            arrayList.add(personNameAndAgeInfoViewModel);
            arrayList.add(next.getProgressBarViewModel());
        }
        arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, PersonInteraction.roadTrip, null, 2, null));
        return arrayList;
    }
}
