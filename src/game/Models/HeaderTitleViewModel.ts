// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";

export class HeaderTitleViewModel extends BaseViewModel {
    identifier: string = null;
    title: string = null;
    constructor(title: string) {
        super();
        Intrinsics.checkParameterIsNotNull(title, "title");
        this.identifier = title;
        this.title = title;
    }
    getType(): CellType {
        return CellType.headerTitle;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getDisplayTitle(): string {
        return ("◆ " + this.title) + " ◆";
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof HeaderTitleViewModel)) {
            return false;
        }
        return Intrinsics.areEqual(this.title, ((other as unknown as HeaderTitleViewModel)).title);
    }
}
