// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { WorkScreens } from "../Work/WorkScreens";
import { ArrayList, Integer, R, SpannableStringBuilder } from "../runtime";
import { Illness } from "../Health/Illness";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { Vampire } from "../Lifepaths/Vampire";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { HealthEvent } from "../Enums/HealthEvent";
import { AssistedDying } from "../Managers/AssistedDying";
import { HealthStatus } from "../Enums/HealthStatus";
import { Housing } from "../Enums/Housing";
import { IViewModelGenerator } from "./IViewModelGenerator";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { Modifiers } from "../Managers/Modifiers";
import { PersonAttribute } from "../Enums/PersonAttribute";
import { Player } from "../Managers/Player";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";

export class HealthModelGenerator implements IViewModelGenerator {
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        arrayList.addAll(this.getHealthViewModels());
        arrayList.addAll(this.getDietViewModels());
        return new GenericListFragmentViewModel(arrayList);
    }
    getHealthViewModels(): ArrayList<BaseViewModel> {
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let healthStatus: HealthStatus = personState.getHealthStatus();
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.tab_name_health)));
        let singleLabelCellViewModel: SingleLabelCellViewModel = new SingleLabelCellViewModel("HealthAgeModel", new TextLabelViewModel("", null, false, false, null, ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.identity_name_age) + ": ", null, null, null, 14, null), String.valueOf(personState.getAgeInYears()), null, null, null, 14, null), 30, null));
        let leftRightCellViewModel: LeftRightCellViewModel = new LeftRightCellViewModel("HealthStatusModel", new TextLabelViewModel("", null, false, false, null, ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Health_Header_Health) + ": ", null, null, null, 14, null), healthStatus.getTitle(), Integer.valueOf(personState.getHealthStatus().getColorId()), null, null, 12, null), 30, null), new TextLabelViewModel("", null, false, false, null, ExtensionsKt.appendNormal$default(ExtensionsKt.appendAttributesString$default(new SpannableStringBuilder(), new Modifiers(healthStatus.getHealthModifier(), 0.0, 0.0), null, null, PersonAttribute.health, 6, null), "/" + Utils.INSTANCE.getString(R.string.Common_Week), null, null, null, 14, null), 30, null), null, 8, null);
        arrayList.add(singleLabelCellViewModel);
        arrayList.add(leftRightCellViewModel);
        for (const c of Illness.cells(personState)) arrayList.add(c);   // v0.28.0 illnesses
        for (const c of WorkScreens.selfCareCells(personState)) arrayList.add(c);   // v0.33.0 self-care
        arrayList.add(new HeaderTitleViewModel("Treatments"));
        for (const healthEvent of HealthEvent.INSTANCE.eventsForPlayer(personState)) {
            arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, healthEvent, null, 2, null));
        }
        const assisted = AssistedDying.cell();
        if (assisted != null) arrayList.add(assisted);
        return arrayList;
    }
    getDietViewModels(): ArrayList<BaseViewModel> {
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let arrayList: ArrayList = new ArrayList();
        if (Vampire.isVampire(personState)) {
            // v0.35.0: a vampire's Health tab shows Hunger and Vitality; the blood supply is chosen on Lifepaths › Vampire (one place)
            const vs: any = Vampire.state(personState);
            arrayList.add(new HeaderTitleViewModel("Blood"));
            arrayList.add(new MeterViewModel("Hunger", vs.thirst, 100, "red", `${vs.thirst >= 95 ? "Torpor is near" : vs.thirst >= 80 ? "Starving" : vs.thirst >= 60 ? "Hungry" : vs.thirst >= 30 ? "Peckish" : "Sated"}. Your blood supply: ${Vampire.chosenDiet(personState).title} (change it on Lifepaths › Vampire).`, `${Math.round(vs.thirst)}`));
            if (vs.rb) arrayList.add(new MeterViewModel("Vitality", vs.rb.vitality ?? 100, 100, "blue", "Daylight drains it; it refills at night.", `${Math.round(vs.rb.vitality ?? 100)}`));
            return arrayList;
        }
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.Common_Diet)));
        let initWithActionDescriptor$default: ActionCellSingleViewModel = ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, personState.getDiet(), null, 2, null);
        initWithActionDescriptor$default.getActionButton().setHidden(true);
        arrayList.add(initWithActionDescriptor$default);
        if (personState.getHousingState().currentHousing().getType() !== Housing.parentsHouse) {
            arrayList.add(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, HealthEvent.chooseMenu, null, 2, null));
        }
        return arrayList;
    }
}
