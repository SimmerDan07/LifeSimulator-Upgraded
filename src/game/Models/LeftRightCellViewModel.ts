// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function0, Intrinsics, SpannableStringBuilder } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { TextLabelViewModel } from "./TextLabelViewModel";

export class LeftRightCellViewModel extends BaseViewModel {
    identifier: string = null;
    leftLabel: TextLabelViewModel = null;
    onClick: Function0<any> = null;
    rightLabel: TextLabelViewModel = null;
    $init0(identifier: string, leftLabel: TextLabelViewModel, rightLabel: TextLabelViewModel, function0: Function0<any>): void {
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        Intrinsics.checkParameterIsNotNull(leftLabel, "leftLabel");
        Intrinsics.checkParameterIsNotNull(rightLabel, "rightLabel");
        this.identifier = identifier;
        this.leftLabel = leftLabel;
        this.rightLabel = rightLabel;
        this.onClick = function0;
    }
    $init1(str: string, textLabelViewModel: TextLabelViewModel, textLabelViewModel2: TextLabelViewModel, function0: Function0, i: number, defaultConstructorMarker: any): void {
        this.$init(str, textLabelViewModel, textLabelViewModel2, ((i & 8) !== 0) ? null : function0);
    }
    $init2(identifier: string, leftLabel: TextLabelViewModel, onClick: Function0<any>): void {
        this.$init(identifier, leftLabel, TextLabelViewModel.INSTANCE.getHidden(), onClick);
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        Intrinsics.checkParameterIsNotNull(leftLabel, "leftLabel");
        Intrinsics.checkParameterIsNotNull(onClick, "onClick");
    }
    $init3(identifier: string, leftLabelText: SpannableStringBuilder): void {
        this.$init(identifier, new TextLabelViewModel("", null, false, false, null, leftLabelText, 30, null), TextLabelViewModel.INSTANCE.getHidden(), null, 8, null);
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        Intrinsics.checkParameterIsNotNull(leftLabelText, "leftLabelText");
    }
    $init4(identifier: string, leftLabelText: string): void {
        this.$init(identifier, new TextLabelViewModel(leftLabelText, null, false, false, null, null, 30, null), TextLabelViewModel.INSTANCE.getHidden(), null, 8, null);
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        Intrinsics.checkParameterIsNotNull(leftLabelText, "leftLabelText");
    }
    constructor(...args: any[]) {
        super();
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 6 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof TextLabelViewModel) && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || typeof a[3] === 'object') && (typeof a[4] === 'number' || typeof a[4] === 'string')) return (this as any).$init1(...a);
        if (a.length === 4 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof TextLabelViewModel) && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || typeof a[3] === 'object')) return (this as any).$init0(...a);
        if (a.length === 3 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof TextLabelViewModel) && (a[2] == null || typeof a[2] === 'object')) return (this as any).$init2(...a);
        if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof SpannableStringBuilder)) return (this as any).$init3(...a);
        if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string')) return (this as any).$init4(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getType(): CellType {
        return CellType.leftRightCell;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getLeftLabel(): TextLabelViewModel {
        return this.leftLabel;
    }
    setLeftLabel(textLabelViewModel: TextLabelViewModel): void {
        Intrinsics.checkParameterIsNotNull(textLabelViewModel, "<set-?>");
        this.leftLabel = textLabelViewModel;
    }
    getRightLabel(): TextLabelViewModel {
        return this.rightLabel;
    }
    setRightLabel(textLabelViewModel: TextLabelViewModel): void {
        Intrinsics.checkParameterIsNotNull(textLabelViewModel, "<set-?>");
        this.rightLabel = textLabelViewModel;
    }
    getOnClick(): Function0<any> {
        return this.onClick;
    }
    setOnClick(function0: Function0<any>): void {
        this.onClick = function0;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof LeftRightCellViewModel)) {
            return false;
        }
        let leftRightCellViewModel: LeftRightCellViewModel = (other as unknown as LeftRightCellViewModel);
        return (Intrinsics.areEqual(this.getIdentifier(), leftRightCellViewModel.getIdentifier()) && Intrinsics.areEqual(this.leftLabel, leftRightCellViewModel.leftLabel)) && Intrinsics.areEqual(this.rightLabel, leftRightCellViewModel.rightLabel);
    }
}
