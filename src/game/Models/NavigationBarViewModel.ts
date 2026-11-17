// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";

export class NavigationBarViewModel extends BaseViewModel {
    identifier: string = null;
    showBackButton: boolean = false;
    title: string = null;
    $init0(title: string, z: boolean): void {
        Intrinsics.checkParameterIsNotNull(title, "title");
        this.identifier = title;
        this.title = title;
        this.showBackButton = z;
    }
    $init1(str: string, z: boolean, i: number, defaultConstructorMarker: any): void {
        this.$init(str, ((i & 2) !== 0) ? true : z);
    }
    constructor(...args: any[]) {
        super();
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 4 && (a[0] == null || typeof a[0] === 'string') && typeof a[1] === 'boolean' && (typeof a[2] === 'number' || typeof a[2] === 'string')) return (this as any).$init1(...a);
        if (a.length === 2 && (a[0] == null || typeof a[0] === 'string') && typeof a[1] === 'boolean') return (this as any).$init0(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getType(): CellType {
        return CellType.navigationBarCell;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof NavigationBarViewModel)) {
            return false;
        }
        return Intrinsics.areEqual(this.title, ((other as unknown as NavigationBarViewModel)).title);
    }
}
