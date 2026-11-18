// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, R } from "../runtime";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { BaseViewModel } from "../Models/BaseViewModel";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { IViewModelGenerator } from "./IViewModelGenerator";
import { Leisure } from "../Enums/Leisure";
import { Player } from "../Managers/Player";
import { Utils } from "../Utils/Utils";
import { KidsLeisure } from "../Managers/KidsLeisure";

export class VacationModelGenerator implements IViewModelGenerator {
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        arrayList.addAll(this.getPlaytimeViewModels());
        arrayList.addAll(this.getLeisureViewModels());
        arrayList.addAll(this.getTravelViewModels());
        return new GenericListFragmentViewModel(arrayList);
    }
    /** Ages 0–8: things for young children to do (see KidsLeisure.ts). */
    getPlaytimeViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        const player = GameStateManager.INSTANCE.getPersonState();
        if (!KidsLeisure.shown(player)) return arrayList;
        arrayList.add(new HeaderTitleViewModel("Playtime"));
        for (const a of KidsLeisure.activities) {
            arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, a as any, null, 2, null));
        }
        return arrayList;
    }
    getLeisureViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Leisure)));
        for (const leisure of Leisure.INSTANCE.getLeisureOptions(GameStateManager.INSTANCE.getPersonState())) {
            arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, leisure, null, 2, null));
        }
        return arrayList;
    }
    getTravelViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Travel)));
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let travelEvents: Leisure[] = Leisure.INSTANCE.getTravelEvents();
        let arrayList2: ArrayList = new ArrayList();
        for (const leisure of travelEvents) {
            if (leisure.getTravelCountry() !== personState.getCountry()) {
                arrayList2.add(leisure);
            }
        }
        let it = arrayList2.iterator();
        while (it.hasNext()) {
            let initWithActionDescriptor$default: ActionCellSingleViewModel = ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, (it.next() as unknown as Leisure), null, 2, null);
            initWithActionDescriptor$default.getActionButton().setShouldShowAnimation(false);
            arrayList.add(initWithActionDescriptor$default);
        }
        return arrayList;
    }
}
