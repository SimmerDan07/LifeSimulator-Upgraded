// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */

export class CrimeState {
    static INSTANCE: any;
    isInJail: boolean = false;
    constructor() {

    }
    getIsInJail(): boolean {
        return this.isInJail;
    }
}
export namespace CrimeState {
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
CrimeState.INSTANCE = new CrimeState.Companion(null);
