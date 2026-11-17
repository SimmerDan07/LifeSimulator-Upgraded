// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { ButtonViewModel } from "./ButtonViewModel";
import { CellType } from "./CellType";

export class SingleButtonViewModel extends BaseViewModel {
    button: ButtonViewModel = null;
    identifier: string = null;
    constructor(button: ButtonViewModel) {
        super();
        Intrinsics.checkParameterIsNotNull(button, "button");
        this.identifier = button.getTitle();
        this.button = button;
    }
    getType(): CellType {
        return CellType.singleButton;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getButton(): ButtonViewModel {
        return this.button;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof SingleButtonViewModel)) {
            return false;
        }
        return Intrinsics.areEqual(((other as unknown as SingleButtonViewModel)).button, this.button);
    }
}
