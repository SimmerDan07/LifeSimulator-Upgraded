// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";

export class ImageCellViewModel extends BaseViewModel {
    identifier: string = null;
    imageId: number = 0;
    topRightImageId: number = null;
    $init0(identifier: string, i: number, num: number): void {
        Intrinsics.checkParameterIsNotNull(identifier, "identifier");
        this.identifier = identifier;
        this.imageId = i;
        this.topRightImageId = num;
    }
    $init1(str: string, i: number, num: number, i2: number, defaultConstructorMarker: any): void {
        this.$init(str, i, ((i2 & 4) !== 0) ? null : num);
    }
    constructor(...args: any[]) {
        super();
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 5 && (a[0] == null || typeof a[0] === 'string') && (typeof a[1] === 'number' || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'number' || typeof a[2] === 'string') && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init1(...a);
        if (a.length === 3 && (a[0] == null || typeof a[0] === 'string') && (typeof a[1] === 'number' || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'number' || typeof a[2] === 'string')) return (this as any).$init0(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getType(): CellType {
        return CellType.imageCell;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getImageId(): number {
        return this.imageId;
    }
    getTopRightImageId(): number {
        return this.topRightImageId;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ImageCellViewModel)) {
            return false;
        }
        let imageCellViewModel: ImageCellViewModel = (other as unknown as ImageCellViewModel);
        return (this.imageId === imageCellViewModel.imageId) && Intrinsics.areEqual(this.topRightImageId, imageCellViewModel.topRightImageId);
    }
}
