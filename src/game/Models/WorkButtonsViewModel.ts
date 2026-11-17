// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { ButtonViewModel } from "./ButtonViewModel";
import { CellType } from "./CellType";

export class WorkButtonsViewModel extends BaseViewModel {
    identifier: string = null;
    workButton1: ButtonViewModel = null;
    workButton2: ButtonViewModel = null;
    workButton3: ButtonViewModel = null;
    constructor(workButton1: ButtonViewModel, workButton2: ButtonViewModel, workButton3: ButtonViewModel) {
        super();
        Intrinsics.checkParameterIsNotNull(workButton1, "workButton1");
        Intrinsics.checkParameterIsNotNull(workButton2, "workButton2");
        Intrinsics.checkParameterIsNotNull(workButton3, "workButton3");
        this.identifier = "WorkButtons";
        this.workButton1 = workButton1;
        this.workButton2 = workButton2;
        this.workButton3 = workButton3;
    }
    getType(): CellType {
        return CellType.workButtons;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getWorkButton1(): ButtonViewModel {
        return this.workButton1;
    }
    getWorkButton2(): ButtonViewModel {
        return this.workButton2;
    }
    getWorkButton3(): ButtonViewModel {
        return this.workButton3;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof WorkButtonsViewModel)) {
            return false;
        }
        let workButtonsViewModel: WorkButtonsViewModel = (other as unknown as WorkButtonsViewModel);
        return (Intrinsics.areEqual(workButtonsViewModel.workButton1, this.workButton1) && Intrinsics.areEqual(workButtonsViewModel.workButton2, this.workButton2)) && Intrinsics.areEqual(workButtonsViewModel.workButton3, this.workButton3);
    }
}
