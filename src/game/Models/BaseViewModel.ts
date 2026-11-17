// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { CellType } from "./CellType";

export class BaseViewModel {
    identifier: string = "";
    getType(): CellType {
        return CellType.none;
    }
    getIdentifier(): string {
        return this.identifier;
    }
}
