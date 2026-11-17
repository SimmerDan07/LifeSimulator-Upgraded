// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { PlayerActionType } from "../Enums/PlayerActionType";

export class TempState {
    static INSTANCE: any;
    prevActionState: PlayerActionType = null;
    constructor() {
        this.prevActionState = PlayerActionType.none;
    }
    getPrevActionState(): PlayerActionType {
        return this.prevActionState;
    }
    setPrevActionState(playerActionType: PlayerActionType): void {
        Intrinsics.checkParameterIsNotNull(playerActionType, "<set-?>");
        this.prevActionState = playerActionType;
    }
}
export namespace TempState {
    export class Companion {
        $init0(): void {
    }
        $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 1) return (this as any).$init1(...a);
            if (a.length === 0) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
    }
}
TempState.INSTANCE = new TempState.Companion(null);
