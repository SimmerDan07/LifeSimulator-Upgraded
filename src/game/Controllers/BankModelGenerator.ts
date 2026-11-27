// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Integer, R, TypeCastException } from "../runtime";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { BankAction } from "../Enums/BankAction";
import { BankActionAmount } from "../Enums/BankActionAmount";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { CompletableActionType } from "../Enums/CompletableActionType";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { Subscriptions } from "../Managers/Subscriptions";
import { IViewModelGenerator } from "./IViewModelGenerator";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";
import { RScreens } from "../Remaster/RScreens";

export class BankModelGenerator implements IViewModelGenerator {
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        // v0.36.0 The Remaster: accounts, loans, investing, goals, the lottery
        for (const c of RScreens.bankTab(GameStateManager.INSTANCE.getPersonState())) arrayList.add(c);
        arrayList.addAll(this.getPhilanthrophyViewModels());
        return new GenericListFragmentViewModel(arrayList);
    }
    getPhilanthrophyViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Philanthropy)));
        for (const completableActionStateSingle of GameStateManager.INSTANCE.getPersonState().getCompletableActionState().getStates(CompletableActionType.philanthrophy)) {
            arrayList.add(completableActionStateSingle.getViewModel());
        }
        return arrayList;
    }
    getBankActionViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Bank)));
        for (const bankAction of BankAction.values()) {
            let arrayList2: ArrayList = new ArrayList();
            for (const bankActionAmount of BankActionAmount.values()) {
                arrayList2.add(new ButtonViewModel(bankActionAmount.buttonText(bankAction), null, bankActionAmount.buttonEnabled(bankAction), false, bankAction.getLockedString() != null, false, false, {
                    invoke: () => {
                    GameStateManager.INSTANCE.getPersonState().bankAction(bankAction, bankActionAmount);
                }
                }, 106, null));
            }
            let textLabelViewModel: TextLabelViewModel = new TextLabelViewModel("", null, false, false, null, bankAction.getSubtitle(), 30, null);
            let lockedString: string = bankAction.getLockedString();
            if (lockedString != null) {
                textLabelViewModel = new TextLabelViewModel(lockedString, null, false, false, null, null, 62, null);
            }
            let textLabelViewModel2: TextLabelViewModel = textLabelViewModel;
            let valueOf: number = Integer.valueOf(bankAction.getImageId());
            let title: string = bankAction.getTitle();
            let textLabelViewModel3: TextLabelViewModel = new TextLabelViewModel("", null, false, false, null, bankAction.getDecorator(), 30, null);
            let array = arrayList2.toArray(new Array(0).fill(null));
            if (array != null) {
                arrayList.add(new ActionCellMultipleOptionsViewModel(valueOf, title, textLabelViewModel2, textLabelViewModel3, (array as unknown as ButtonViewModel[]), null, 32, null));
            } else {
                throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
            }
        }
        // v0.24.0: Automatic Savings and Pay Bills from Savings (same rows as Profile › Subscriptions)
        for (const c of Subscriptions.moneyCells()) arrayList.add(c);
        return arrayList;
    }
}
