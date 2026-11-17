// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { RealEstateScreens } from "../RealEstate/RealEstateScreens";
import { Generations } from "../Managers/Generations";
import { ArrayList, BigInteger, Integer, Pair, R, SpannableStringBuilder } from "../runtime";
import { HousingState } from "../Managers/HousingState";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { AlertManager } from "../Managers/AlertManager";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { Housing } from "../Enums/Housing";
import { IViewModelGenerator } from "./IViewModelGenerator";
import { ImageCellViewModel } from "../Models/ImageCellViewModel";
import { ItemState } from "../Managers/ItemState";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { MainGameTab } from "../Enums/MainGameTab";
import { Player } from "../Managers/Player";
import { Possession } from "../Enums/Possession";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";

export class ProfileModelGenerator implements IViewModelGenerator {
    gameTab: MainGameTab = MainGameTab.Profile;
    getGameTab(): MainGameTab {
        return this.gameTab;
    }
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        arrayList.addAll(this.getIdentityViewModels());
        arrayList.addAll(this.getHousingViewModels());
        arrayList.addAll(this.getItemsViewModels());
        return new GenericListFragmentViewModel(arrayList);
    }
    getIdentityViewModels(): ArrayList<BaseViewModel> {
        let leftRightCellViewModel: LeftRightCellViewModel;
        let leftRightCellViewModel2: LeftRightCellViewModel;
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.section_header_identity)));
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        arrayList.add(new ImageCellViewModel("PersonProfileImage", personState.getAgeGroup().imageId(personState.getSex()), Integer.valueOf(personState.getCountry().getImageId())));
        arrayList.add(Utils.ViewModel.INSTANCE.getPropertyListViewModel([new Pair(Utils.INSTANCE.getString(R.string.ProfileStatus_LifeScenario), String.valueOf(personState.getLifeScenario().getTitle())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_age), String.valueOf(personState.getAgeInYears())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_trueAge), String.valueOf(personState.getTrueAgeInYears())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_name), String.valueOf(personState.getFullName())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_sex), String.valueOf(personState.getSex().getTitle())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_gender), String.valueOf(personState.getGender().getTitle())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_sexuality), String.valueOf(personState.getSexuality().getTitle())), new Pair(Utils.INSTANCE.getString(R.string.Attribute_Country), String.valueOf(personState.getCountry().getTitle())), new Pair(Utils.INSTANCE.getString(R.string.identity_name_networth), String.valueOf(ExtensionsKt.numberDisplayString$default(personState.getNetWorth(), false, 1, null))), ...Generations.identityRows(personState)]));
        let totalCashFlowPerWeek: BigInteger = GameStateManager.INSTANCE.getPersonState().getTotalCashFlowPerWeek();
        let append: SpannableStringBuilder = ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.SectionHeader_WeeklyCash), null, null, null, 14, null).append("  ");
        let leftRightCellViewModel3: LeftRightCellViewModel = new LeftRightCellViewModel("WeeklyCashFlow", new TextLabelViewModel(ExtensionsKt.appendBold$default(append, ExtensionsKt.numberDisplayString$default(totalCashFlowPerWeek, false, 1, null), Integer.valueOf(ExtensionsKt.displayColorForMoney(totalCashFlowPerWeek)), null, null, 12, null), false, false, null, 14, null), {
            invoke: () => {
            Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.cashFlow, null, false, 6, null);
        }
        });
        let append2: SpannableStringBuilder = ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.ProfileSection_WeeklyModifiers), null, null, null, 14, null).append("  ");
        let leftRightCellViewModel4: LeftRightCellViewModel = new LeftRightCellViewModel("WeeklyModifiers", new TextLabelViewModel(ExtensionsKt.appendAttributesString$default(append2, GameStateManager.INSTANCE.getPersonState().collectWeeklyAttributeDeltas(), null, null, null, 14, null), false, false, null, 14, null), {
            invoke: () => {
            Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.weeklyModifiers, null, false, 6, null);
        }
        });
        let size: number = personState.getPerkState().getPerks().size();
        if (size > 0) {
            leftRightCellViewModel = new LeftRightCellViewModel("PerkList", new TextLabelViewModel(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (size + " ") + Utils.INSTANCE.getString(R.string.Common_Perks), null, null, null, 14, null), false, false, null, 14, null), {
                invoke: () => {
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.perkList, null, false, 6, null);
            }
            });
        } else {
            leftRightCellViewModel = new LeftRightCellViewModel("PerkList", ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (size + " ") + Utils.INSTANCE.getString(R.string.Common_Perks), R.color.flatGrey, null, null, 12, null));
        }
        let size2: number = personState.getTraitState().getTraits().size();
        if (size2 > 0) {
            leftRightCellViewModel2 = new LeftRightCellViewModel("TraitList", new TextLabelViewModel(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (size2 + " ") + Utils.INSTANCE.getString(R.string.Common_Traits), null, null, null, 14, null), false, false, null, 14, null), {
                invoke: () => {
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.traitList, null, false, 6, null);
            }
            });
        } else {
            leftRightCellViewModel2 = new LeftRightCellViewModel("TraitList", ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (size2 + " ") + Utils.INSTANCE.getString(R.string.Common_Traits), R.color.flatGrey, null, null, 12, null));
        }
        arrayList.add(leftRightCellViewModel3);
        arrayList.add(leftRightCellViewModel4);
        arrayList.add(leftRightCellViewModel);
        arrayList.add(leftRightCellViewModel2);
        return arrayList;
    }
    /** Ported from Vineflower output (jadx could not decompile it). */
    getHousingViewModels(): ArrayList<BaseViewModel> {
        // Property System Overhaul: renting, moving, buying and selling all live in the Real Estate screen now.
        const out = new ArrayList<BaseViewModel>();
        out.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.section_header_housing)));
        RealEstateScreens.profileSummary(out);
        return out;
    }
    getItemsViewModels(): ArrayList<BaseViewModel> {
        let z: boolean;
        let str: string;
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Items)));
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let states: ItemState.SingleItemState[] = personState.getItemState().getStates();
        let arrayList2: ArrayList<ItemState.SingleItemState> = new ArrayList();
        for (const singleItemState of states) {
            if (singleItemState.getType().isAvaliable()) {
                arrayList2.add(singleItemState);
            }
        }
        for (const singleItemState2 of arrayList2) {
            let initWithActionDescriptor: ActionCellSingleViewModel = ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(singleItemState2.getType(), Integer.valueOf(singleItemState2.getLevel()));
            let type: Possession = singleItemState2.getType();
            if (singleItemState2.getOwned() && (singleItemState2.getLevel() === type.getMaxLevel())) {
                str = Utils.INSTANCE.getString(R.string.Housing_Label_Owned);
                z = false;
            } else {
                let costForLevel: BigInteger = type.costForLevel(singleItemState2.getLevel() + 1);
                let numberDisplayString$default: string = ExtensionsKt.numberDisplayString$default(costForLevel, false, 1, null);
                z = personState.getMoneyState().getCash().compareTo(costForLevel) >= 0;
                str = numberDisplayString$default;
            }
            initWithActionDescriptor.setActionButton(new ButtonViewModel(str, null, z, false, false, false, false, {
                invoke: () => {
                type.action(GameStateManager.INSTANCE.getPersonState());
            }
            }, 122, null));
            arrayList.add(initWithActionDescriptor);
        }
        return arrayList;
    }
}
