// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Double, JMath } from "../runtime";
import { ExtensionsKt } from "./ExtensionsKt";
import { Utils } from "./Utils";

export class ValueRange {
    static INSTANCE: any;
    max: number = 0;
    min: number = 0;
    constructor(d: number, d2: number) {
        this.min = d;
        this.max = d2;
    }
    static copy$default(valueRange: ValueRange, d: number, d2: number, i: number, obj: any): ValueRange {
        if ((i & 1) !== 0) {
            d = valueRange.min;
        }
        if ((i & 2) !== 0) {
            d2 = valueRange.max;
        }
        return valueRange.copy(d, d2);
    }
    getMin(): number {
        return this.min;
    }
    getMax(): number {
        return this.max;
    }
    copy(min: number, max: number): ValueRange {
        return new ValueRange(min, max);
    }
    equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (!(other instanceof ValueRange)) {
            return false;
        }
        let valueRange: ValueRange = (other as unknown as ValueRange);
        return (Double.compare(this.min, valueRange.min) === 0) && (Double.compare(this.max, valueRange.max) === 0);
    }
    toString(): string {
        return ((("ValueRange(min=" + this.min) + ", max=") + this.max) + ")";
    }
    isRange(): boolean {
        return this.min !== this.max;
    }
    getRandomValue(): number {
        if (!this.isRange()) {
            return this.min;
        }
        return Utils.Random.INSTANCE.randomValueWithinRange(JMath.toInt(this.min), JMath.toInt(this.max));
    }
    getStringForSalary(): string {
        if (this.isRange()) {
            return (ExtensionsKt.numberDisplayString$default(JMath.toInt(this.min), false, 1, null) + "-") + ExtensionsKt.numberDisplayString$default(JMath.toInt(this.max), false, 1, null);
        }
        return ExtensionsKt.numberDisplayString$default(JMath.toInt(this.min), false, 1, null);
    }
    displayString(isMoney: boolean): string {
        if (this.isRange()) {
            return (ExtensionsKt.numberDisplayString(JMath.toInt(this.min), isMoney) + "-") + ExtensionsKt.numberDisplayString(JMath.toInt(this.max), isMoney);
        }
        return ExtensionsKt.numberDisplayString(JMath.toInt(this.min), isMoney);
    }
}
export namespace ValueRange {
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
        getWithMinAge$0(min: number): ValueRange {
        return new ValueRange(min, 999.0);
    }
        getWithMinAge$1(min: number): ValueRange {
        return new ValueRange(min, 999.0);
    }
        getWithMinAge(...a: any[]): any {
            if (a.length === 1 && typeof a[0] === 'number') return (this as any).getWithMinAge$0(...a);
            if (a.length === 1 && (typeof a[0] === 'number' || typeof a[0] === 'string')) return (this as any).getWithMinAge$1(...a);
            throw new Error('no overload for getWithMinAge with ' + a.length + ' args');
        }
        getWithValue(value: number): ValueRange {
        return new ValueRange(value, value);
    }
        getWithInt(value: number): ValueRange {
        let d: number = value;
        return new ValueRange(d, d);
    }
        getWithIntRange(min: number, max: number): ValueRange {
        return new ValueRange(min, max);
    }
    }
}
ValueRange.INSTANCE = new ValueRange.Companion(null);
