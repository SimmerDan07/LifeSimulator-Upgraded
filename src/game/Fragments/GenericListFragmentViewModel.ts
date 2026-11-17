// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Intrinsics } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";

export class GenericListFragmentViewModel {
    contentViewModels: ArrayList<BaseViewModel> = null;
    footerViewModels: ArrayList<BaseViewModel> = null;
    headerViewModels: ArrayList<BaseViewModel> = null;
    $init0(contentViewModels: ArrayList<BaseViewModel>, arrayList: ArrayList<BaseViewModel>, arrayList2: ArrayList<BaseViewModel>): void {
        Intrinsics.checkParameterIsNotNull(contentViewModels, "contentViewModels");
        this.contentViewModels = contentViewModels;
        this.headerViewModels = arrayList;
        this.footerViewModels = arrayList2;
    }
    $init1(arrayList: ArrayList, arrayList2: ArrayList, arrayList3: ArrayList, i: number, defaultConstructorMarker: any): void {
        this.$init(arrayList, ((i & 2) !== 0) ? null : arrayList2, ((i & 4) !== 0) ? null : arrayList3);
    }
    $init2(contentViewModels: ArrayList<BaseViewModel>): void {
        this.$init(contentViewModels, null, null);
        Intrinsics.checkParameterIsNotNull(contentViewModels, "contentViewModels");
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 5 && (a[0] == null || Array.isArray(a[0])) && (a[1] == null || Array.isArray(a[1])) && (a[2] == null || Array.isArray(a[2])) && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init1(...a);
        if (a.length === 3 && (a[0] == null || Array.isArray(a[0])) && (a[1] == null || Array.isArray(a[1])) && (a[2] == null || Array.isArray(a[2]))) return (this as any).$init0(...a);
        if (a.length === 1 && (a[0] == null || Array.isArray(a[0]))) return (this as any).$init2(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static copy$default(genericListFragmentViewModel: GenericListFragmentViewModel, arrayList: ArrayList, arrayList2: ArrayList, arrayList3: ArrayList, i: number, obj: any): GenericListFragmentViewModel {
        if ((i & 1) !== 0) {
            arrayList = genericListFragmentViewModel.contentViewModels;
        }
        if ((i & 2) !== 0) {
            arrayList2 = genericListFragmentViewModel.headerViewModels;
        }
        if ((i & 4) !== 0) {
            arrayList3 = genericListFragmentViewModel.footerViewModels;
        }
        return genericListFragmentViewModel.copy(arrayList, arrayList2, arrayList3);
    }
    component1(): ArrayList<BaseViewModel> {
        return this.contentViewModels;
    }
    component2(): ArrayList<BaseViewModel> {
        return this.headerViewModels;
    }
    component3(): ArrayList<BaseViewModel> {
        return this.footerViewModels;
    }
    copy(contentViewModels: ArrayList<BaseViewModel>, headerViewModels: ArrayList<BaseViewModel>, footerViewModels: ArrayList<BaseViewModel>): GenericListFragmentViewModel {
        Intrinsics.checkParameterIsNotNull(contentViewModels, "contentViewModels");
        return new GenericListFragmentViewModel(contentViewModels, headerViewModels, footerViewModels);
    }
    equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (!(other instanceof GenericListFragmentViewModel)) {
            return false;
        }
        let genericListFragmentViewModel: GenericListFragmentViewModel = (other as unknown as GenericListFragmentViewModel);
        return (Intrinsics.areEqual(this.contentViewModels, genericListFragmentViewModel.contentViewModels) && Intrinsics.areEqual(this.headerViewModels, genericListFragmentViewModel.headerViewModels)) && Intrinsics.areEqual(this.footerViewModels, genericListFragmentViewModel.footerViewModels);
    }
    toString(): string {
        return ((((("GenericListFragmentViewModel(contentViewModels=" + this.contentViewModels) + ", headerViewModels=") + this.headerViewModels) + ", footerViewModels=") + this.footerViewModels) + ")";
    }
    getContentViewModels(): ArrayList<BaseViewModel> {
        return this.contentViewModels;
    }
    getHeaderViewModels(): ArrayList<BaseViewModel> {
        return this.headerViewModels;
    }
    getFooterViewModels(): ArrayList<BaseViewModel> {
        return this.footerViewModels;
    }
    setFooterViewModels(arrayList: ArrayList<BaseViewModel>): void {
        this.footerViewModels = arrayList;
    }
    addFromModel(model: GenericListFragmentViewModel): void {
        let arrayList: ArrayList<BaseViewModel>;
        let arrayList2: ArrayList<BaseViewModel>;
        Intrinsics.checkParameterIsNotNull(model, "model");
        this.contentViewModels.addAll(model.contentViewModels);
        let arrayList3: ArrayList<BaseViewModel> = model.headerViewModels;
        if ((arrayList3 != null) && ((arrayList2 = this.headerViewModels) != null)) {
            arrayList2.addAll(arrayList3);
        }
        let arrayList4: ArrayList<BaseViewModel> = model.footerViewModels;
        if ((arrayList4 == null) || ((arrayList = this.footerViewModels) == null)) {
            return;
        }
        arrayList.addAll(arrayList4);
    }
}
