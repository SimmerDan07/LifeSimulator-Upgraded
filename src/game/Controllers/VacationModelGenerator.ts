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
import { Hobbies } from "../Managers/Hobbies";
import { Seasons } from "../Managers/Seasons";
import { Activities } from "../World/Activities";
import { World } from "../World/World";

export class VacationModelGenerator implements IViewModelGenerator {
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        const p: any = GameStateManager.INSTANCE.getPersonState();
        // v0.27.0: prison: only the yard (and what the Crime update adds there)
        if (p.getCrimeState().getIsInJail()) {
            arrayList.add(new HeaderTitleViewModel("Prison Yard"));
            for (const l of Leisure.INSTANCE.getJailEvent()) arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, l, null, 2, null));
            for (const c of VacationModelGenerator.prisonCells(p)) arrayList.add(c);
            return new GenericListFragmentViewModel(arrayList);
        }
        arrayList.addAll(this.getPlaytimeViewModels());
        arrayList.addAll(this.getLeisureViewModels());
        for (const c of Activities.localCells(p)) arrayList.add(c);   // v0.27.0
        if (p.getAgeInYears() >= 4) for (const c of Activities.categoryCells(p)) arrayList.add(c);
        // v0.26.0: two activities that only happen this season
        if (p.getAgeInYears() >= 3) for (const c of Seasons.cells()) arrayList.add(c);
        arrayList.addAll(this.getHobbyViewModels());
        for (const c of World.travelCells(p)) arrayList.add(c);   // v0.27.0: Move Abroad (four regions)
        return new GenericListFragmentViewModel(arrayList);
    }
    /** Set by the Crime update: prison activities shown under the yard. */
    static prisonCells: (p: any) => any[] = () => [];
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
    /** v0.25.0 Hobbies (ages 6+): practice, level up, show it off (see Hobbies.ts). */
    getHobbyViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        const player = GameStateManager.INSTANCE.getPersonState();
        if (!Hobbies.shown(player)) return arrayList;
        arrayList.add(new HeaderTitleViewModel("Hobbies"));
        for (const c of Hobbies.cells(player)) arrayList.add(c);
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
