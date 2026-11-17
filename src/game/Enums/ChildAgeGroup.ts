// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class ChildAgeGroup extends JEnum {
    static readonly pregnant: ChildAgeGroup = new ChildAgeGroup("pregnant", 0);
    static readonly infant: ChildAgeGroup = new ChildAgeGroup("infant", 1);
    static readonly child: ChildAgeGroup = new ChildAgeGroup("child", 2);
    static readonly adolescent: ChildAgeGroup = new ChildAgeGroup("adolescent", 3);
    static readonly adult: ChildAgeGroup = new ChildAgeGroup("adult", 4);
    static values(): ChildAgeGroup[] { return [ChildAgeGroup.pregnant, ChildAgeGroup.infant, ChildAgeGroup.child, ChildAgeGroup.adolescent, ChildAgeGroup.adult]; }
    static valueOf(n: string): ChildAgeGroup { return (ChildAgeGroup as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
export namespace ChildAgeGroup {
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
        stateWithAge(ageInYears: number): ChildAgeGroup {
        if (ageInYears < 0) {
            return ChildAgeGroup.pregnant;
        }
        if (ageInYears <= 3) {
            return ChildAgeGroup.infant;
        }
        if (ageInYears < 12) {
            return ChildAgeGroup.child;
        }
        if (ageInYears < 18) {
            return ChildAgeGroup.adolescent;
        }
        return ChildAgeGroup.adult;
    }
    }
}
ChildAgeGroup.INSTANCE = new ChildAgeGroup.Companion(null);
