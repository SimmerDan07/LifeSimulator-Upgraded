// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function0, Intrinsics, SpannableStringBuilder } from "../runtime";

export class ButtonViewModel {
    static INSTANCE: any;
    static hidden: ButtonViewModel;
    static locked: ButtonViewModel;
    action: Function0<any> = null;
    enabled: boolean = false;
    hidden: boolean = false;
    shouldShowAnimation: boolean = false;
    showLock: boolean = false;
    showPlaySoundEffect: boolean = false;
    title: string = null;
    titleStringBuilder: SpannableStringBuilder = null;
    $init0(title: string, spannableStringBuilder: SpannableStringBuilder, z: boolean, z2: boolean, z3: boolean, z4: boolean, z5: boolean, action: Function0<any>): void {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(action, "action");
        this.title = title;
        this.titleStringBuilder = spannableStringBuilder;
        this.enabled = z;
        this.hidden = z2;
        this.showLock = z3;
        this.showPlaySoundEffect = z4;
        this.shouldShowAnimation = z5;
        this.action = action;
    }
    $init1(str: string, spannableStringBuilder: SpannableStringBuilder, z: boolean, z2: boolean, z3: boolean, z4: boolean, z5: boolean, function0: Function0, i: number, defaultConstructorMarker: any): void {
        this.$init(str, ((i & 2) !== 0) ? null : spannableStringBuilder, ((i & 4) !== 0) ? true : z, ((i & 8) !== 0) ? false : z2, ((i & 16) !== 0) ? false : z3, ((i & 32) !== 0) ? true : z4, ((i & 64) !== 0) ? true : z5, function0);
    }
    $init2(spannableStringBuilder: SpannableStringBuilder, z: boolean, z2: boolean, z3: boolean, z4: boolean, z5: boolean, function0: Function0, i: number, defaultConstructorMarker: any): void {
        this.$init(spannableStringBuilder, ((i & 2) !== 0) ? true : z, ((i & 4) !== 0) ? false : z2, ((i & 8) !== 0) ? false : z3, ((i & 16) !== 0) ? true : z4, ((i & 32) !== 0) ? true : z5, function0);
    }
    $init3(titleStringBuilder: SpannableStringBuilder, z: boolean, z2: boolean, z3: boolean, z4: boolean, z5: boolean, action: Function0<any>): void {
        this.$init("", titleStringBuilder, z, z2, z3, z4, z5, action);
        Intrinsics.checkParameterIsNotNull(titleStringBuilder, "titleStringBuilder");
        Intrinsics.checkParameterIsNotNull(action, "action");
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 10 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof SpannableStringBuilder) && typeof a[2] === 'boolean' && typeof a[3] === 'boolean' && typeof a[4] === 'boolean' && typeof a[5] === 'boolean' && typeof a[6] === 'boolean' && (a[7] == null || typeof a[7] === 'object') && (typeof a[8] === 'number' || typeof a[8] === 'string')) return (this as any).$init1(...a);
        if (a.length === 9 && (a[0] == null || a[0] instanceof SpannableStringBuilder) && typeof a[1] === 'boolean' && typeof a[2] === 'boolean' && typeof a[3] === 'boolean' && typeof a[4] === 'boolean' && typeof a[5] === 'boolean' && (a[6] == null || typeof a[6] === 'object') && (typeof a[7] === 'number' || typeof a[7] === 'string')) return (this as any).$init2(...a);
        if (a.length === 8 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof SpannableStringBuilder) && typeof a[2] === 'boolean' && typeof a[3] === 'boolean' && typeof a[4] === 'boolean' && typeof a[5] === 'boolean' && typeof a[6] === 'boolean' && (a[7] == null || typeof a[7] === 'object')) return (this as any).$init0(...a);
        if (a.length === 7 && (a[0] == null || a[0] instanceof SpannableStringBuilder) && typeof a[1] === 'boolean' && typeof a[2] === 'boolean' && typeof a[3] === 'boolean' && typeof a[4] === 'boolean' && typeof a[5] === 'boolean' && (a[6] == null || typeof a[6] === 'object')) return (this as any).$init3(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getTitle(): string {
        return this.title;
    }
    getTitleStringBuilder(): SpannableStringBuilder {
        return this.titleStringBuilder;
    }
    getEnabled(): boolean {
        return this.enabled;
    }
    getHidden(): boolean {
        return this.hidden;
    }
    getShowLock(): boolean {
        return this.showLock;
    }
    getShowPlaySoundEffect(): boolean {
        return this.showPlaySoundEffect;
    }
    getShouldShowAnimation(): boolean {
        return this.shouldShowAnimation;
    }
    component8(): Function0<any> {
        return this.action;
    }
    copy(title: string, titleStringBuilder: SpannableStringBuilder, enabled: boolean, hidden2: boolean, showLock: boolean, showPlaySoundEffect: boolean, shouldShowAnimation: boolean, action: Function0<any>): ButtonViewModel {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(action, "action");
        return new ButtonViewModel(title, titleStringBuilder, enabled, hidden2, showLock, showPlaySoundEffect, shouldShowAnimation, action);
    }
    toString(): string {
        return ((((((((((((((("ButtonViewModel(title=" + this.title) + ", titleStringBuilder=") + (this.titleStringBuilder)) + ", enabled=") + this.enabled) + ", hidden=") + this.hidden) + ", showLock=") + this.showLock) + ", showPlaySoundEffect=") + this.showPlaySoundEffect) + ", shouldShowAnimation=") + this.shouldShowAnimation) + ", action=") + this.action) + ")";
    }
    setEnabled(z: boolean): void {
        this.enabled = z;
    }
    setHidden(z: boolean): void {
        this.hidden = z;
    }
    setShouldShowAnimation(z: boolean): void {
        this.shouldShowAnimation = z;
    }
    getAction(): Function0<any> {
        return this.action;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ButtonViewModel)) {
            return false;
        }
        let buttonViewModel: ButtonViewModel = (other as unknown as ButtonViewModel);
        return (((((Intrinsics.areEqual(this.title, buttonViewModel.title) && (this.hidden === buttonViewModel.hidden)) && (this.enabled === buttonViewModel.enabled)) && (this.showLock === buttonViewModel.showLock)) && (this.showPlaySoundEffect === buttonViewModel.showPlaySoundEffect)) && (this.shouldShowAnimation === buttonViewModel.shouldShowAnimation)) && Intrinsics.areEqual(String.valueOf(this.titleStringBuilder), String.valueOf(buttonViewModel.titleStringBuilder));
    }
}
export namespace ButtonViewModel {
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
        getHidden(): ButtonViewModel {
        return ButtonViewModel.hidden;
    }
        getLocked(): ButtonViewModel {
        return ButtonViewModel.locked;
    }
    }
}
ButtonViewModel.INSTANCE = new ButtonViewModel.Companion(null);
ButtonViewModel.hidden = new ButtonViewModel("", null, false, true, false, false, false, {
        invoke: () => {
    }
    }, 112, null);
ButtonViewModel.locked = new ButtonViewModel("", null, false, false, true, false, false, {
        invoke: () => {
    }
    }, 96, null);
