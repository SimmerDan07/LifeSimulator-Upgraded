// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, R } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { CompletableActionState } from "../Managers/CompletableActionState";
import { CompletableActionType } from "../Enums/CompletableActionType";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { IViewModelGenerator } from "./IViewModelGenerator";
import { Utils } from "../Utils/Utils";

export class EducationModelGenerator implements IViewModelGenerator {
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        arrayList.addAll(this.getEducationViewModels());
        arrayList.addAll(this.getSkillsViewModels());
        arrayList.addAll(this.getLanguagesViewModels());
        return new GenericListFragmentViewModel(arrayList);
    }
    getEducationViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.tab_name_education)));
        for (const completableActionStateSingle of GameStateManager.INSTANCE.getPersonState().getCompletableActionState().getStates(CompletableActionType.education)) {
            arrayList.add(completableActionStateSingle.getViewModel());
        }
        return arrayList;
    }
    getSkillsViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Skills)));
        let states: CompletableActionState.CompletableActionStateSingle[] = GameStateManager.INSTANCE.getPersonState().getCompletableActionState().getStates(CompletableActionType.skill);
        let arrayList2: ArrayList = new ArrayList();
        for (const completableActionStateSingle of states) {
            if (!completableActionStateSingle.getType().isLanguage()) {
                arrayList2.add(completableActionStateSingle);
            }
        }
        let it = arrayList2.iterator();
        while (it.hasNext()) {
            arrayList.add(((it.next() as unknown as CompletableActionState.CompletableActionStateSingle)).getViewModel());
        }
        return arrayList;
    }
    getLanguagesViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Language)));
        let states: CompletableActionState.CompletableActionStateSingle[] = GameStateManager.INSTANCE.getPersonState().getCompletableActionState().getStates(CompletableActionType.skill);
        let arrayList2: ArrayList = new ArrayList();
        for (const completableActionStateSingle of states) {
            if (completableActionStateSingle.getType().isLanguage()) {
                arrayList2.add(completableActionStateSingle);
            }
        }
        let it = arrayList2.iterator();
        while (it.hasNext()) {
            arrayList.add(((it.next() as unknown as CompletableActionState.CompletableActionStateSingle)).getViewModel());
        }
        return arrayList;
    }
}
