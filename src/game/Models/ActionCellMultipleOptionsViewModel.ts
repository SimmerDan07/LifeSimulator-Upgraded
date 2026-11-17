// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArraysKt, Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { ButtonViewModel } from "./ButtonViewModel";
import { CellType } from "./CellType";
import { TextLabelViewModel } from "./TextLabelViewModel";

export class ActionCellMultipleOptionsViewModel extends BaseViewModel {
    buttons: ButtonViewModel[] = null;
    decorator: TextLabelViewModel = null;
    identifier: string = null;
    imageId: number = null;
    subtitle: TextLabelViewModel = null;
    title: string = null;
    $init0(num: number, title: string, subtitle: TextLabelViewModel, decorator: TextLabelViewModel, buttons: ButtonViewModel[], str: string): void {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(subtitle, "subtitle");
        Intrinsics.checkParameterIsNotNull(decorator, "decorator");
        Intrinsics.checkParameterIsNotNull(buttons, "buttons");
        this.identifier = (str == null) ? title : str;
        this.imageId = num;
        this.title = title;
        this.subtitle = subtitle;
        this.decorator = decorator;
        this.buttons = buttons;
    }
    $init1(num: number, str: string, textLabelViewModel: TextLabelViewModel, textLabelViewModel2: TextLabelViewModel, buttonViewModelArr: ButtonViewModel[], str2: string, i: number, defaultConstructorMarker: any): void {
        this.$init(num, str, textLabelViewModel, textLabelViewModel2, buttonViewModelArr, ((i & 32) !== 0) ? null : str2);
    }
    constructor(...args: any[]) {
        super();
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 8 && (a[0] == null || typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || a[3] instanceof TextLabelViewModel) && (a[4] == null || Array.isArray(a[4])) && (a[5] == null || typeof a[5] === 'string') && (typeof a[6] === 'number' || typeof a[6] === 'string')) return (this as any).$init1(...a);
        if (a.length === 6 && (a[0] == null || typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || a[3] instanceof TextLabelViewModel) && (a[4] == null || Array.isArray(a[4])) && (a[5] == null || typeof a[5] === 'string')) return (this as any).$init0(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getType(): CellType {
        return CellType.actionCellMultipleOptions;
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
    setSubtitle(textLabelViewModel: TextLabelViewModel): void {
        Intrinsics.checkParameterIsNotNull(textLabelViewModel, "<set-?>");
        this.subtitle = textLabelViewModel;
    }
    getDecorator(): TextLabelViewModel {
        return this.decorator;
    }
    setDecorator(textLabelViewModel: TextLabelViewModel): void {
        Intrinsics.checkParameterIsNotNull(textLabelViewModel, "<set-?>");
        this.decorator = textLabelViewModel;
    }
    getButtons(): ButtonViewModel[] {
        return this.buttons;
    }
    setButtons(buttonViewModelArr: ButtonViewModel[]): void {
        Intrinsics.checkParameterIsNotNull(buttonViewModelArr, "<set-?>");
        this.buttons = buttonViewModelArr;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ActionCellMultipleOptionsViewModel)) {
            return false;
        }
        let actionCellMultipleOptionsViewModel: ActionCellMultipleOptionsViewModel = (other as unknown as ActionCellMultipleOptionsViewModel);
        return (((Intrinsics.areEqual(this.imageId, actionCellMultipleOptionsViewModel.imageId) && Intrinsics.areEqual(this.title, actionCellMultipleOptionsViewModel.title)) && Intrinsics.areEqual(this.subtitle, actionCellMultipleOptionsViewModel.subtitle)) && Intrinsics.areEqual(this.decorator, actionCellMultipleOptionsViewModel.decorator)) && ArraysKt.contentDeepEquals(this.buttons, actionCellMultipleOptionsViewModel.buttons);
    }
}
