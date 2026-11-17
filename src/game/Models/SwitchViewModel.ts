// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function1, Intrinsics } from "../runtime";

export class SwitchViewModel {
    static INSTANCE: any;
    hidden: boolean = false;
    initialValue: boolean = false;
    onValueChangedHandler: Function1<boolean, any> = null;
    $init0(z: boolean, z2: boolean, onValueChangedHandler: Function1<boolean, any>): void {
        Intrinsics.checkParameterIsNotNull(onValueChangedHandler, "onValueChangedHandler");
        this.initialValue = z;
        this.hidden = z2;
        this.onValueChangedHandler = onValueChangedHandler;
    }
    $init1(z: boolean, z2: boolean, function1: Function1, i: number, defaultConstructorMarker: any): void {
        this.$init(z, ((i & 2) !== 0) ? false : z2, function1);
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 5 && typeof a[0] === 'boolean' && typeof a[1] === 'boolean' && (a[2] == null || typeof a[2] === 'object') && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init1(...a);
        if (a.length === 3 && typeof a[0] === 'boolean' && typeof a[1] === 'boolean' && (a[2] == null || typeof a[2] === 'object')) return (this as any).$init0(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static copy$default(switchViewModel: SwitchViewModel, z: boolean, z2: boolean, function1: Function1, i: number, obj: any): SwitchViewModel {
        if ((i & 1) !== 0) {
            z = switchViewModel.initialValue;
        }
        if ((i & 2) !== 0) {
            z2 = switchViewModel.hidden;
        }
        if ((i & 4) !== 0) {
            function1 = switchViewModel.onValueChangedHandler;
        }
        return switchViewModel.copy(z, z2, function1);
    }
    getInitialValue(): boolean {
        return this.initialValue;
    }
    getHidden(): boolean {
        return this.hidden;
    }
    component3(): Function1<boolean, any> {
        return this.onValueChangedHandler;
    }
    copy(initialValue: boolean, hidden: boolean, onValueChangedHandler: Function1<boolean, any>): SwitchViewModel {
        Intrinsics.checkParameterIsNotNull(onValueChangedHandler, "onValueChangedHandler");
        return new SwitchViewModel(initialValue, hidden, onValueChangedHandler);
    }
    toString(): string {
        return ((((("SwitchViewModel(initialValue=" + this.initialValue) + ", hidden=") + this.hidden) + ", onValueChangedHandler=") + this.onValueChangedHandler) + ")";
    }
    setInitialValue(z: boolean): void {
        this.initialValue = z;
    }
    getOnValueChangedHandler(): Function1<boolean, any> {
        return this.onValueChangedHandler;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof SwitchViewModel)) {
            return false;
        }
        let switchViewModel: SwitchViewModel = (other as unknown as SwitchViewModel);
        return (this.initialValue === switchViewModel.initialValue) && (this.hidden === switchViewModel.hidden);
    }
}
export namespace SwitchViewModel {
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
        getHidden(): SwitchViewModel {
        return new SwitchViewModel(true, true, {
            invoke: (z: boolean) => {
        }
        });
    }
    }
}
SwitchViewModel.INSTANCE = new SwitchViewModel.Companion(null);
