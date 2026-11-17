// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Arrays, Double, Function1, Intrinsics, JMath, MathKt } from "../runtime";

export class SliderViewModel {
    initialValue: number = 0;
    _isMoney: boolean = false;
    max: number = 0;
    min: number = 0;
    segments: number[] = null;
    valueChangedHandler: Function1<number, any> = null;
    $init0(i: number, i2: number, i3: number, z: boolean, valueChangedHandler: Function1<number, any>, numArr: number[]): void {
        Intrinsics.checkParameterIsNotNull(valueChangedHandler, "valueChangedHandler");
        this.min = i;
        this.max = i2;
        this.initialValue = i3;
        this._isMoney = z;
        this.valueChangedHandler = valueChangedHandler;
        this.segments = numArr;
    }
    $init1(i: number, i2: number, i3: number, z: boolean, function1: Function1, numArr: number[], i4: number, defaultConstructorMarker: any): void {
        this.$init(i, i2, i3, z, function1, ((i4 & 32) !== 0) ? null : numArr);
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 8 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (typeof a[1] === 'number' || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && typeof a[3] === 'boolean' && (a[4] == null || typeof a[4] === 'object') && (a[5] == null || Array.isArray(a[5])) && (typeof a[6] === 'number' || typeof a[6] === 'string')) return (this as any).$init1(...a);
        if (a.length === 6 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (typeof a[1] === 'number' || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && typeof a[3] === 'boolean' && (a[4] == null || typeof a[4] === 'object') && (a[5] == null || Array.isArray(a[5]))) return (this as any).$init0(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static copy$default(sliderViewModel: SliderViewModel, i: number, i2: number, i3: number, z: boolean, function1: Function1, numArr: number[], i4: number, obj: any): SliderViewModel {
        if ((i4 & 1) !== 0) {
            i = sliderViewModel.min;
        }
        if ((i4 & 2) !== 0) {
            i2 = sliderViewModel.max;
        }
        let i5: number = i2;
        if ((i4 & 4) !== 0) {
            i3 = sliderViewModel.initialValue;
        }
        let i6: number = i3;
        if ((i4 & 8) !== 0) {
            z = sliderViewModel._isMoney;
        }
        let z2: boolean = z;
        if ((i4 & 16) !== 0) {
            function1 = sliderViewModel.valueChangedHandler;
        }
        let function12: Function1 = function1;
        if ((i4 & 32) !== 0) {
            numArr = sliderViewModel.segments;
        }
        return sliderViewModel.copy(i, i5, i6, z2, function12, numArr);
    }
    getMin(): number {
        return this.min;
    }
    getMax(): number {
        return this.max;
    }
    getInitialValue(): number {
        return this.initialValue;
    }
    getIsMoney(): boolean {
        return this._isMoney;
    }
    component5(): Function1<number, any> {
        return this.valueChangedHandler;
    }
    getSegments(): number[] {
        return this.segments;
    }
    copy(min: number, max: number, initialValue: number, isMoney: boolean, valueChangedHandler: Function1<number, any>, segments: number[]): SliderViewModel {
        Intrinsics.checkParameterIsNotNull(valueChangedHandler, "valueChangedHandler");
        return new SliderViewModel(min, max, initialValue, isMoney, valueChangedHandler, segments);
    }
    toString(): string {
        return ((((((((((("SliderViewModel(min=" + this.min) + ", max=") + this.max) + ", initialValue=") + this.initialValue) + ", isMoney=") + this._isMoney) + ", valueChangedHandler=") + this.valueChangedHandler) + ", segments=") + Arrays.toString(this.segments)) + ")";
    }
    isMoney(): boolean {
        return this._isMoney;
    }
    getValueChangedHandler(): Function1<number, any> {
        return this.valueChangedHandler;
    }
    getSliderResolution(): number {
        if (this.segments != null) {
            return this.segments.length - 1;
        }
        return 1000;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof SliderViewModel)) {
            return false;
        }
        let sliderViewModel: SliderViewModel = (other as unknown as SliderViewModel);
        return (((this.min === sliderViewModel.min) && (this.max === sliderViewModel.max)) && (this.initialValue === sliderViewModel.initialValue)) && Intrinsics.areEqual(this.segments, sliderViewModel.segments);
    }
    getScaledValueForProgressBar(value: number): number {
        let i: number = this.max;
        let i2: number = this.min;
        let i3: number = i - i2;
        let d: number = value - i2;
        let d2: number = i3;
        Double.isNaN(d);
        Double.isNaN(d2);
        let d3: number = d / d2;
        let sliderResolution: number = this.getSliderResolution();
        Double.isNaN(sliderResolution);
        return JMath.toInt((sliderResolution * d3));
    }
    getActualValueFromProgressBarValue(value: number): number {
        let d: number = value;
        let sliderResolution: number = this.getSliderResolution();
        Double.isNaN(d);
        Double.isNaN(sliderResolution);
        let d2: number = d / sliderResolution;
        let i: number = this.max - this.min;
        let numArr: number[] = this.segments;
        if (numArr != null) {
            return numArr[value].intValue();
        }
        let i2: number = this.min;
        let d3: number = i;
        Double.isNaN(d3);
        return i2 + MathKt.roundToInt(d3 * d2);
    }
}
