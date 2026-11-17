// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Float, Intrinsics, SpannableStringBuilder } from "../runtime";
import { Constants } from "../Utils/Constants";

export class TextLabelViewModel {
    static INSTANCE: any;
    static hidden: TextLabelViewModel;
    bold: boolean = false;
    fontSize: number = null;
    hidden: boolean = false;
    stringBuilder: SpannableStringBuilder = null;
    textColor: number = null;
    title: string = null;
    $init0(title: string, f: number, z: boolean, z2: boolean, num: number, spannableStringBuilder: SpannableStringBuilder): void {
        Intrinsics.checkParameterIsNotNull(title, "title");
        this.title = title;
        this.fontSize = f;
        this.hidden = z;
        this.bold = z2;
        this.textColor = num;
        this.stringBuilder = spannableStringBuilder;
    }
    $init1(str: string, f: number, z: boolean, z2: boolean, num: number, spannableStringBuilder: SpannableStringBuilder, i: number, defaultConstructorMarker: any): void {
        this.$init(str, ((i & 2) !== 0) ? Float.valueOf(Constants.ViewModel.INSTANCE.getDefaultFontSize()) : f, ((i & 4) !== 0) ? false : z, ((i & 8) !== 0) ? false : z2, ((i & 16) !== 0) ? null : num, ((i & 32) !== 0) ? null : spannableStringBuilder);
    }
    $init2(stringBuilder: SpannableStringBuilder, z: boolean, z2: boolean, num: number): void {
        this.$init("", null, z, z2, num, stringBuilder);
        Intrinsics.checkParameterIsNotNull(stringBuilder, "stringBuilder");
    }
    $init3(spannableStringBuilder: SpannableStringBuilder, z: boolean, z2: boolean, num: number, i: number, defaultConstructorMarker: any): void {
        this.$init(spannableStringBuilder, ((i & 2) !== 0) ? false : z, ((i & 4) !== 0) ? false : z2, ((i & 8) !== 0) ? null : num);
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 8 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'number') && typeof a[2] === 'boolean' && typeof a[3] === 'boolean' && (a[4] == null || typeof a[4] === 'number' || typeof a[4] === 'string') && (a[5] == null || a[5] instanceof SpannableStringBuilder) && (typeof a[6] === 'number' || typeof a[6] === 'string')) return (this as any).$init1(...a);
        if (a.length === 6 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'number') && typeof a[2] === 'boolean' && typeof a[3] === 'boolean' && (a[4] == null || typeof a[4] === 'number' || typeof a[4] === 'string') && (a[5] == null || a[5] instanceof SpannableStringBuilder)) return (this as any).$init0(...a);
        if (a.length === 6 && (a[0] == null || a[0] instanceof SpannableStringBuilder) && typeof a[1] === 'boolean' && typeof a[2] === 'boolean' && (a[3] == null || typeof a[3] === 'number' || typeof a[3] === 'string') && (typeof a[4] === 'number' || typeof a[4] === 'string')) return (this as any).$init3(...a);
        if (a.length === 4 && (a[0] == null || a[0] instanceof SpannableStringBuilder) && typeof a[1] === 'boolean' && typeof a[2] === 'boolean' && (a[3] == null || typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init2(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static copy$default(textLabelViewModel: TextLabelViewModel, str: string, f: number, z: boolean, z2: boolean, num: number, spannableStringBuilder: SpannableStringBuilder, i: number, obj: any): TextLabelViewModel {
        if ((i & 1) !== 0) {
            str = textLabelViewModel.title;
        }
        if ((i & 2) !== 0) {
            f = textLabelViewModel.fontSize;
        }
        let f2: number = f;
        if ((i & 4) !== 0) {
            z = textLabelViewModel.hidden;
        }
        let z3: boolean = z;
        if ((i & 8) !== 0) {
            z2 = textLabelViewModel.bold;
        }
        let z4: boolean = z2;
        if ((i & 16) !== 0) {
            num = textLabelViewModel.textColor;
        }
        let num2: number = num;
        if ((i & 32) !== 0) {
            spannableStringBuilder = textLabelViewModel.stringBuilder;
        }
        return textLabelViewModel.copy(str, f2, z3, z4, num2, spannableStringBuilder);
    }
    getTitle(): string {
        return this.title;
    }
    getFontSize(): number {
        return this.fontSize;
    }
    getHidden(): boolean {
        return this.hidden;
    }
    getBold(): boolean {
        return this.bold;
    }
    getTextColor(): number {
        return this.textColor;
    }
    getStringBuilder(): SpannableStringBuilder {
        return this.stringBuilder;
    }
    copy(title: string, fontSize: number, hidden2: boolean, bold: boolean, textColor: number, stringBuilder: SpannableStringBuilder): TextLabelViewModel {
        Intrinsics.checkParameterIsNotNull(title, "title");
        return new TextLabelViewModel(title, fontSize, hidden2, bold, textColor, stringBuilder);
    }
    toString(): string {
        return ((((((((((("TextLabelViewModel(title=" + this.title) + ", fontSize=") + this.fontSize) + ", hidden=") + this.hidden) + ", bold=") + this.bold) + ", textColor=") + this.textColor) + ", stringBuilder=") + (this.stringBuilder)) + ")";
    }
    setTitle(str: string): void {
        Intrinsics.checkParameterIsNotNull(str, "<set-?>");
        this.title = str;
    }
    setHidden(z: boolean): void {
        this.hidden = z;
    }
    setBold(z: boolean): void {
        this.bold = z;
    }
    setTextColor(num: number): void {
        this.textColor = num;
    }
    setStringBuilder(spannableStringBuilder: SpannableStringBuilder): void {
        this.stringBuilder = spannableStringBuilder;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof TextLabelViewModel)) {
            return false;
        }
        let textLabelViewModel: TextLabelViewModel = (other as unknown as TextLabelViewModel);
        return ((((Intrinsics.areEqual(this.title, textLabelViewModel.title) && (this.hidden === textLabelViewModel.hidden)) && (this.bold === textLabelViewModel.bold)) && Intrinsics.areEqual(this.textColor, textLabelViewModel.textColor)) && Intrinsics.areEqual(this.fontSize, textLabelViewModel.fontSize)) && Intrinsics.areEqual(String.valueOf(this.stringBuilder), String.valueOf(textLabelViewModel.stringBuilder));
    }
}
export namespace TextLabelViewModel {
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
        getHidden(): TextLabelViewModel {
        return TextLabelViewModel.hidden;
    }
    }
}
TextLabelViewModel.INSTANCE = new TextLabelViewModel.Companion(null);
TextLabelViewModel.hidden = new TextLabelViewModel("", null, true, false, null, null, 56, null);
