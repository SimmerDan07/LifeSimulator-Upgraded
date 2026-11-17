// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function0, Intrinsics } from "../runtime";

export class CustomizeSingleOptionViewModel {
    imageId: number = 0;
    onSelected: Function0<any> = null;
    title: string = null;
    constructor(title: string, i: number, onSelected: Function0<any>) {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(onSelected, "onSelected");
        this.title = title;
        this.imageId = i;
        this.onSelected = onSelected;
    }
    static copy$default(customizeSingleOptionViewModel: CustomizeSingleOptionViewModel, str: string, i: number, function0: Function0, i2: number, obj: any): CustomizeSingleOptionViewModel {
        if ((i2 & 1) !== 0) {
            str = customizeSingleOptionViewModel.title;
        }
        if ((i2 & 2) !== 0) {
            i = customizeSingleOptionViewModel.imageId;
        }
        if ((i2 & 4) !== 0) {
            function0 = customizeSingleOptionViewModel.onSelected;
        }
        return customizeSingleOptionViewModel.copy(str, i, function0);
    }
    getTitle(): string {
        return this.title;
    }
    getImageId(): number {
        return this.imageId;
    }
    component3(): Function0<any> {
        return this.onSelected;
    }
    copy(title: string, imageId: number, onSelected: Function0<any>): CustomizeSingleOptionViewModel {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(onSelected, "onSelected");
        return new CustomizeSingleOptionViewModel(title, imageId, onSelected);
    }
    toString(): string {
        return ((((("CustomizeSingleOptionViewModel(title=" + this.title) + ", imageId=") + this.imageId) + ", onSelected=") + this.onSelected) + ")";
    }
    getOnSelected(): Function0<any> {
        return this.onSelected;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof CustomizeSingleOptionViewModel)) {
            return false;
        }
        let customizeSingleOptionViewModel: CustomizeSingleOptionViewModel = (other as unknown as CustomizeSingleOptionViewModel);
        return Intrinsics.areEqual(this.title, customizeSingleOptionViewModel.title) && (this.imageId === customizeSingleOptionViewModel.imageId);
    }
}
