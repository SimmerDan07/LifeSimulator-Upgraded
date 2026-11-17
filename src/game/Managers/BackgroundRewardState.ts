// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Utils } from "../Utils/Utils";

export class BackgroundRewardState {
    static INSTANCE: any;
    lastAppActiveTimeUnix: number = 0;
    constructor() {
        this.lastAppActiveTimeUnix = Utils.Time.INSTANCE.currentUnixTimestamp();
    }
    getLastAppActiveTimeUnix(): number {
        return this.lastAppActiveTimeUnix;
    }
    setLastAppActiveTimeUnix(j: number): void {
        this.lastAppActiveTimeUnix = j;
    }
}
export namespace BackgroundRewardState {
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
BackgroundRewardState.INSTANCE = new BackgroundRewardState.Companion(null);
