// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics, SpannableStringBuilder } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";

export class TombstoneViewModel extends BaseViewModel {
    deathSummary: SpannableStringBuilder = null;
    identifier: string = null;
    constructor(deathSummary: SpannableStringBuilder) {
        super();
        Intrinsics.checkParameterIsNotNull(deathSummary, "deathSummary");
        let spannableStringBuilder: string = deathSummary.toString();
        this.identifier = spannableStringBuilder;
        this.deathSummary = deathSummary;
    }
    getType(): CellType {
        return CellType.tombstoneCell;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getDeathSummary(): SpannableStringBuilder {
        return this.deathSummary;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof TombstoneViewModel)) {
            return false;
        }
        return Intrinsics.areEqual(((other as unknown as TombstoneViewModel)).deathSummary, this.deathSummary);
    }
}
