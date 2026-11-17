// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { ImageButtonViewModel } from "./ImageButtonViewModel";

export class OptionsBarViewModel extends BaseViewModel {
    buttons: ImageButtonViewModel[] = null;
    identifier: string = null;
    constructor(buttons: ImageButtonViewModel[]) {
        super();
        Intrinsics.checkParameterIsNotNull(buttons, "buttons");
        this.identifier = "OptionBar";
        this.buttons = buttons;
    }
    getType(): CellType {
        return CellType.optionBar;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getButtons(): ImageButtonViewModel[] {
        return this.buttons;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof OptionsBarViewModel)) {
            return false;
        }
        let optionsBarViewModel: OptionsBarViewModel = (other as unknown as OptionsBarViewModel);
        let length: number = optionsBarViewModel.buttons.length;
        let imageButtonViewModelArr: ImageButtonViewModel[] = this.buttons;
        if (length !== imageButtonViewModelArr.length) {
            return false;
        }
        let length2: number = imageButtonViewModelArr.length;
        for (let i = 0; i < length2; i++) {
            if (true !== Intrinsics.areEqual(imageButtonViewModelArr[i], optionsBarViewModel.buttons[i])) {
                return false;
            }
        }
        return true;
    }
}
