// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";

export class ProgressBarViewModel {
    static INSTANCE: any;
    static hidden: ProgressBarViewModel;
    hidden: boolean = false;
    maxProgressValue: number = 0;
    progressValue: number = 0;
    useColorScheme: boolean = false;
    $init0(d: number, d2: number, z: boolean, z2: boolean): void {
        this.progressValue = d;
        this.maxProgressValue = d2;
        this.useColorScheme = z;
        this.hidden = z2;
    }
    $init1(d: number, d2: number, z: boolean, z2: boolean, i: number, defaultConstructorMarker: any): void {
        this.$init(d, d2, ((i & 4) !== 0) ? false : z, ((i & 8) !== 0) ? false : z2);
    }
    $init2(d: number): void {
        this.$init(d, RelationshipProgressStatus.INSTANCE.getMaxValue(), true, false, 8, null);
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 6 && typeof a[0] === 'number' && typeof a[1] === 'number' && typeof a[2] === 'boolean' && typeof a[3] === 'boolean' && (typeof a[4] === 'number' || typeof a[4] === 'string')) return (this as any).$init1(...a);
        if (a.length === 4 && typeof a[0] === 'number' && typeof a[1] === 'number' && typeof a[2] === 'boolean' && typeof a[3] === 'boolean') return (this as any).$init0(...a);
        if (a.length === 1 && typeof a[0] === 'number') return (this as any).$init2(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static copy$default(progressBarViewModel: ProgressBarViewModel, d: number, d2: number, z: boolean, z2: boolean, i: number, obj: any): ProgressBarViewModel {
        if ((i & 1) !== 0) {
            d = progressBarViewModel.progressValue;
        }
        let d3: number = d;
        if ((i & 2) !== 0) {
            d2 = progressBarViewModel.maxProgressValue;
        }
        let d4: number = d2;
        if ((i & 4) !== 0) {
            z = progressBarViewModel.useColorScheme;
        }
        let z3: boolean = z;
        if ((i & 8) !== 0) {
            z2 = progressBarViewModel.hidden;
        }
        return progressBarViewModel.copy(d3, d4, z3, z2);
    }
    getProgressValue(): number {
        return this.progressValue;
    }
    getMaxProgressValue(): number {
        return this.maxProgressValue;
    }
    getUseColorScheme(): boolean {
        return this.useColorScheme;
    }
    getHidden(): boolean {
        return this.hidden;
    }
    copy(progressValue: number, maxProgressValue: number, useColorScheme: boolean, hidden2: boolean): ProgressBarViewModel {
        return new ProgressBarViewModel(progressValue, maxProgressValue, useColorScheme, hidden2);
    }
    toString(): string {
        return ((((((("ProgressBarViewModel(progressValue=" + this.progressValue) + ", maxProgressValue=") + this.maxProgressValue) + ", useColorScheme=") + this.useColorScheme) + ", hidden=") + this.hidden) + ")";
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ProgressBarViewModel)) {
            return false;
        }
        let progressBarViewModel: ProgressBarViewModel = (other as unknown as ProgressBarViewModel);
        return (((this.progressValue === progressBarViewModel.progressValue) && (this.maxProgressValue === progressBarViewModel.maxProgressValue)) && (this.useColorScheme === progressBarViewModel.useColorScheme)) && (this.hidden === progressBarViewModel.hidden);
    }
}
export namespace ProgressBarViewModel {
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
        getHidden(): ProgressBarViewModel {
        return ProgressBarViewModel.hidden;
    }
    }
}
ProgressBarViewModel.INSTANCE = new ProgressBarViewModel.Companion(null);
ProgressBarViewModel.hidden = new ProgressBarViewModel(1.0, 1.0, false, true, 4, null);
