// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function0, Intrinsics, R } from "../runtime";

export class ImageButtonViewModel {
    static INSTANCE: any;
    static hidden: ImageButtonViewModel;
    action: Function0<any> = null;
    enabled: boolean = false;
    hidden: boolean = false;
    imageId: number = 0;
    $init0(z: boolean, z2: boolean, i: number, action: Function0<any>): void {
        Intrinsics.checkParameterIsNotNull(action, "action");
        this.enabled = z;
        this.hidden = z2;
        this.imageId = i;
        this.action = action;
    }
    $init1(z: boolean, z2: boolean, i: number, function0: Function0, i2: number, defaultConstructorMarker: any): void {
        this.$init(((i2 & 1) !== 0) ? true : z, ((i2 & 2) !== 0) ? false : z2, i, function0);
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 6 && typeof a[0] === 'boolean' && typeof a[1] === 'boolean' && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'object') && (typeof a[4] === 'number' || typeof a[4] === 'string')) return (this as any).$init1(...a);
        if (a.length === 4 && typeof a[0] === 'boolean' && typeof a[1] === 'boolean' && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'object')) return (this as any).$init0(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static copy$default(imageButtonViewModel: ImageButtonViewModel, z: boolean, z2: boolean, i: number, function0: Function0, i2: number, obj: any): ImageButtonViewModel {
        if ((i2 & 1) !== 0) {
            z = imageButtonViewModel.enabled;
        }
        if ((i2 & 2) !== 0) {
            z2 = imageButtonViewModel.hidden;
        }
        if ((i2 & 4) !== 0) {
            i = imageButtonViewModel.imageId;
        }
        if ((i2 & 8) !== 0) {
            function0 = imageButtonViewModel.action;
        }
        return imageButtonViewModel.copy(z, z2, i, function0);
    }
    getEnabled(): boolean {
        return this.enabled;
    }
    getHidden(): boolean {
        return this.hidden;
    }
    getImageId(): number {
        return this.imageId;
    }
    component4(): Function0<any> {
        return this.action;
    }
    copy(enabled: boolean, hidden2: boolean, imageId: number, action: Function0<any>): ImageButtonViewModel {
        Intrinsics.checkParameterIsNotNull(action, "action");
        return new ImageButtonViewModel(enabled, hidden2, imageId, action);
    }
    toString(): string {
        return ((((((("ImageButtonViewModel(enabled=" + this.enabled) + ", hidden=") + this.hidden) + ", imageId=") + this.imageId) + ", action=") + this.action) + ")";
    }
    setEnabled(z: boolean): void {
        this.enabled = z;
    }
    setHidden(z: boolean): void {
        this.hidden = z;
    }
    getAction(): Function0<any> {
        return this.action;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ImageButtonViewModel)) {
            return false;
        }
        let imageButtonViewModel: ImageButtonViewModel = (other as unknown as ImageButtonViewModel);
        return ((this.imageId === imageButtonViewModel.imageId) && (this.hidden === imageButtonViewModel.hidden)) && (this.enabled === imageButtonViewModel.enabled);
    }
}
export namespace ImageButtonViewModel {
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
        getHidden(): ImageButtonViewModel {
        return ImageButtonViewModel.hidden;
    }
    }
}
ImageButtonViewModel.INSTANCE = new ImageButtonViewModel.Companion(null);
ImageButtonViewModel.hidden = new ImageButtonViewModel(false, true, R.drawable.achievement_happy, {
        invoke: () => {
    }
    }, 1, null);
