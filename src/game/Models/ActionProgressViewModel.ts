// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { ButtonViewModel } from "./ButtonViewModel";
import { CellType } from "./CellType";
import { ImageButtonViewModel } from "./ImageButtonViewModel";
import { ProgressBarViewModel } from "./ProgressBarViewModel";
import { TextLabelViewModel } from "./TextLabelViewModel";

export class ActionProgressViewModel extends BaseViewModel {
    actionButton: ButtonViewModel = null;
    decoratorImage: ImageButtonViewModel = null;
    decoratorText: string = null;
    identifier: string = null;
    imageId: number = 0;
    progressBar: ProgressBarViewModel = null;
    subtitle: TextLabelViewModel = null;
    title: string = null;
    $init0(i: number, str: string, textLabelViewModel: TextLabelViewModel, str2: string, progressBarViewModel: ProgressBarViewModel, imageButtonViewModel: ImageButtonViewModel, buttonViewModel: ButtonViewModel, i2: number, defaultConstructorMarker: any): void {
        this.$init(i, str, textLabelViewModel, str2, progressBarViewModel, ((i2 & 32) !== 0) ? ImageButtonViewModel.INSTANCE.getHidden() : imageButtonViewModel, buttonViewModel);
    }
    $init1(i: number, title: string, subtitle: TextLabelViewModel, str: string, progressBar: ProgressBarViewModel, decoratorImage: ImageButtonViewModel, actionButton: ButtonViewModel): void {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(subtitle, "subtitle");
        Intrinsics.checkParameterIsNotNull(progressBar, "progressBar");
        Intrinsics.checkParameterIsNotNull(decoratorImage, "decoratorImage");
        Intrinsics.checkParameterIsNotNull(actionButton, "actionButton");
        this.identifier = title;
        this.imageId = i;
        this.title = title;
        this.subtitle = subtitle;
        this.actionButton = actionButton;
        this.progressBar = progressBar;
        this.decoratorText = str;
        this.decoratorImage = decoratorImage;
    }
    constructor(...args: any[]) {
        super();
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 9 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || typeof a[3] === 'string') && (a[4] == null || a[4] instanceof ProgressBarViewModel) && (a[5] == null || a[5] instanceof ImageButtonViewModel) && (a[6] == null || a[6] instanceof ButtonViewModel) && (typeof a[7] === 'number' || typeof a[7] === 'string')) return (this as any).$init0(...a);
        if (a.length === 7 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || typeof a[3] === 'string') && (a[4] == null || a[4] instanceof ProgressBarViewModel) && (a[5] == null || a[5] instanceof ImageButtonViewModel) && (a[6] == null || a[6] instanceof ButtonViewModel)) return (this as any).$init1(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getType(): CellType {
        return CellType.actionCellWithProgress;
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
    getActionButton(): ButtonViewModel {
        return this.actionButton;
    }
    getProgressBar(): ProgressBarViewModel {
        return this.progressBar;
    }
    getDecoratorText(): string {
        return this.decoratorText;
    }
    getDecoratorImage(): ImageButtonViewModel {
        return this.decoratorImage;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ActionProgressViewModel)) {
            return false;
        }
        let actionProgressViewModel: ActionProgressViewModel = (other as unknown as ActionProgressViewModel);
        return ((((((this.imageId === actionProgressViewModel.imageId) && Intrinsics.areEqual(this.title, actionProgressViewModel.title)) && Intrinsics.areEqual(this.subtitle, actionProgressViewModel.subtitle)) && Intrinsics.areEqual(this.actionButton, actionProgressViewModel.actionButton)) && Intrinsics.areEqual(this.progressBar, actionProgressViewModel.progressBar)) && Intrinsics.areEqual(this.decoratorText, actionProgressViewModel.decoratorText)) && Intrinsics.areEqual(this.decoratorImage, actionProgressViewModel.decoratorImage);
    }
}
