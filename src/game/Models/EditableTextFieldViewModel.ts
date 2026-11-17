// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function1, Intrinsics } from "../runtime";

export class EditableTextFieldViewModel {
    /** Text to show in the box when it's (re)drawn, so typed values don't vanish on refresh. */
    initialText: string | null = null;
    withInitialText(t: string | null): EditableTextFieldViewModel { this.initialText = t; return this; }
    static INSTANCE: any;
    static hidden: EditableTextFieldViewModel;
    hidden: boolean = false;
    placeholderText: string = null;
    textChangedHandler: Function1<string, any> = null;
    $init0(placeholderText: string, textChangedHandler: Function1<string, any>, z: boolean): void {
        Intrinsics.checkParameterIsNotNull(placeholderText, "placeholderText");
        Intrinsics.checkParameterIsNotNull(textChangedHandler, "textChangedHandler");
        this.placeholderText = placeholderText;
        this.textChangedHandler = textChangedHandler;
        this.hidden = z;
    }
    $init1(str: string, function1: Function1, z: boolean, i: number, defaultConstructorMarker: any): void {
        this.$init(str, function1, ((i & 4) !== 0) ? false : z);
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 5 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'object') && typeof a[2] === 'boolean' && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init1(...a);
        if (a.length === 3 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'object') && typeof a[2] === 'boolean') return (this as any).$init0(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static copy$default(editableTextFieldViewModel: EditableTextFieldViewModel, str: string, function1: Function1, z: boolean, i: number, obj: any): EditableTextFieldViewModel {
        if ((i & 1) !== 0) {
            str = editableTextFieldViewModel.placeholderText;
        }
        if ((i & 2) !== 0) {
            function1 = editableTextFieldViewModel.textChangedHandler;
        }
        if ((i & 4) !== 0) {
            z = editableTextFieldViewModel.hidden;
        }
        return editableTextFieldViewModel.copy(str, function1, z);
    }
    getPlaceholderText(): string {
        return this.placeholderText;
    }
    component2(): Function1<string, any> {
        return this.textChangedHandler;
    }
    getHidden(): boolean {
        return this.hidden;
    }
    copy(placeholderText: string, textChangedHandler: Function1<string, any>, hidden2: boolean): EditableTextFieldViewModel {
        Intrinsics.checkParameterIsNotNull(placeholderText, "placeholderText");
        Intrinsics.checkParameterIsNotNull(textChangedHandler, "textChangedHandler");
        return new EditableTextFieldViewModel(placeholderText, textChangedHandler, hidden2);
    }
    toString(): string {
        return ((((("EditableTextFieldViewModel(placeholderText=" + this.placeholderText) + ", textChangedHandler=") + this.textChangedHandler) + ", hidden=") + this.hidden) + ")";
    }
    getTextChangedHandler(): Function1<string, any> {
        return this.textChangedHandler;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof EditableTextFieldViewModel)) {
            return false;
        }
        let editableTextFieldViewModel: EditableTextFieldViewModel = (other as unknown as EditableTextFieldViewModel);
        return Intrinsics.areEqual(this.placeholderText, editableTextFieldViewModel.placeholderText) && (this.hidden === editableTextFieldViewModel.hidden);
    }
}
export namespace EditableTextFieldViewModel {
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
        getHidden(): EditableTextFieldViewModel {
        return EditableTextFieldViewModel.hidden;
    }
    }
}
EditableTextFieldViewModel.INSTANCE = new EditableTextFieldViewModel.Companion(null);
EditableTextFieldViewModel.hidden = new EditableTextFieldViewModel("", {
        invoke: (it: string) => {
        Intrinsics.checkParameterIsNotNull(it, "it");
    }
    }, true);
