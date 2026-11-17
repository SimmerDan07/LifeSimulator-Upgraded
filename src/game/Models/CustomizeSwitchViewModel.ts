// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { SwitchViewModel } from "./SwitchViewModel";

export class CustomizeSwitchViewModel extends BaseViewModel {
    identifier: string = null;
    switchViewModel: SwitchViewModel = null;
    title: string = null;
    constructor(title: string, switchViewModel: SwitchViewModel) {
        super();
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(switchViewModel, "switchViewModel");
        this.identifier = title;
        this.title = title;
        this.switchViewModel = switchViewModel;
    }
    getType(): CellType {
        return CellType.customize_switch;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getTitle(): string {
        return this.title;
    }
    getSwitchViewModel(): SwitchViewModel {
        return this.switchViewModel;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof CustomizeSwitchViewModel)) {
            return false;
        }
        let customizeSwitchViewModel: CustomizeSwitchViewModel = (other as unknown as CustomizeSwitchViewModel);
        return Intrinsics.areEqual(customizeSwitchViewModel.title, this.title) && Intrinsics.areEqual(customizeSwitchViewModel.switchViewModel, this.switchViewModel);
    }
}
