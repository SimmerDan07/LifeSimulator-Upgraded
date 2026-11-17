// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */

export class GlobalGameState {
    static INSTANCE: any;
    hasPromptedForAppRating: boolean = false;
    isFirstLaunch: boolean = false;
    constructor() {
        this.isFirstLaunch = true;
    }
    getIsFirstLaunch(): boolean {
        return this.isFirstLaunch;
    }
    setFirstLaunch(z: boolean): void {
        this.isFirstLaunch = z;
    }
    getHasPromptedForAppRating(): boolean {
        return this.hasPromptedForAppRating;
    }
    setHasPromptedForAppRating(z: boolean): void {
        this.hasPromptedForAppRating = z;
    }
}
export namespace GlobalGameState {
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
GlobalGameState.INSTANCE = new GlobalGameState.Companion(null);
