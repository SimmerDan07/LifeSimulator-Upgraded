// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { ActionProgressViewModel } from "./ActionProgressViewModel";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { ProgressBarViewModel } from "./ProgressBarViewModel";

export class ProgressBarCellViewModel extends BaseViewModel {
    identifier: string = null;
    progressBar: ProgressBarViewModel = null;
    constructor(identifier: string, progressBar: ProgressBarViewModel) {
        super();
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        Intrinsics.checkParameterIsNotNull(progressBar, "progressBar");
        this.identifier = identifier;
        this.progressBar = progressBar;
    }
    getType(): CellType {
        return CellType.progressbarCell;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getProgressBar(): ProgressBarViewModel {
        return this.progressBar;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ActionProgressViewModel)) {
            return false;
        }
        return Intrinsics.areEqual(this.progressBar, ((other as unknown as ActionProgressViewModel)).getProgressBar());
    }
}
