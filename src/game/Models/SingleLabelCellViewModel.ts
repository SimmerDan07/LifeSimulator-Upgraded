// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { TextLabelViewModel } from "./TextLabelViewModel";

export class SingleLabelCellViewModel extends BaseViewModel {
    identifier: string = null;
    label: TextLabelViewModel = null;
    $init0(identifier: string, label: TextLabelViewModel): void {
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        Intrinsics.checkParameterIsNotNull(label, "label");
        this.identifier = identifier;
        this.label = label;
    }
    $init1(identifier: string, labelString: string): void {
        this.$init(identifier, new TextLabelViewModel(labelString, null, false, false, null, null, 62, null));
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        Intrinsics.checkParameterIsNotNull(labelString, "labelString");
    }
    constructor(...args: any[]) {
        super();
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof TextLabelViewModel)) return (this as any).$init0(...a);
        if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string')) return (this as any).$init1(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getType(): CellType {
        return CellType.singleLabel;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getLabel(): TextLabelViewModel {
        return this.label;
    }
    setLabel(textLabelViewModel: TextLabelViewModel): void {
        Intrinsics.checkParameterIsNotNull(textLabelViewModel, "<set-?>");
        this.label = textLabelViewModel;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof SingleLabelCellViewModel)) {
            return false;
        }
        let singleLabelCellViewModel: SingleLabelCellViewModel = (other as unknown as SingleLabelCellViewModel);
        return Intrinsics.areEqual(this.getIdentifier(), singleLabelCellViewModel.getIdentifier()) && Intrinsics.areEqual(this.label, singleLabelCellViewModel.label);
    }
}
