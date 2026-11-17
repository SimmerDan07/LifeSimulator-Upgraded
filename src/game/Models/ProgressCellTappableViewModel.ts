// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function0, Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { ProgressBarViewModel } from "./ProgressBarViewModel";
import { TextLabelViewModel } from "./TextLabelViewModel";

export class ProgressCellTappableViewModel extends BaseViewModel {
    identifier: string = null;
    imageId: number = 0;
    onClick: Function0<any> = null;
    progressBar: ProgressBarViewModel = null;
    subtitle: TextLabelViewModel = null;
    title: string = null;
    constructor(i: number, title: string, subtitle: TextLabelViewModel, progressBar: ProgressBarViewModel, onClick: Function0<any>) {
        super();
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(subtitle, "subtitle");
        Intrinsics.checkParameterIsNotNull(progressBar, "progressBar");
        Intrinsics.checkParameterIsNotNull(onClick, "onClick");
        this.identifier = "ProgressCellTappable";
        this.imageId = i;
        this.title = title;
        this.subtitle = subtitle;
        this.progressBar = progressBar;
        this.onClick = onClick;
    }
    getType(): CellType {
        return CellType.progressCellTappable;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getImageId(): number {
        return this.imageId;
    }
    getTitle(): string {
        return this.title;
    }
    getSubtitle(): TextLabelViewModel {
        return this.subtitle;
    }
    getProgressBar(): ProgressBarViewModel {
        return this.progressBar;
    }
    getOnClick(): Function0<any> {
        return this.onClick;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ProgressCellTappableViewModel)) {
            return false;
        }
        let progressCellTappableViewModel: ProgressCellTappableViewModel = (other as unknown as ProgressCellTappableViewModel);
        return (((progressCellTappableViewModel.imageId === this.imageId) && Intrinsics.areEqual(progressCellTappableViewModel.title, this.title)) && Intrinsics.areEqual(progressCellTappableViewModel.subtitle, this.subtitle)) && Intrinsics.areEqual(progressCellTappableViewModel.progressBar, this.progressBar);
    }
}
