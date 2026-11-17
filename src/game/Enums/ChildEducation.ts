// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { Utils } from "../Utils/Utils";

export class ChildEducation extends JEnum {
    static readonly kindergarten: ChildEducation = new ChildEducation("kindergarten", 0);
    static readonly elementarySchool: ChildEducation = new ChildEducation("elementarySchool", 1);
    static readonly middleSchool: ChildEducation = new ChildEducation("middleSchool", 2);
    static readonly highSchool: ChildEducation = new ChildEducation("highSchool", 3);
    static readonly college: ChildEducation = new ChildEducation("college", 4);
    static values(): ChildEducation[] { return [ChildEducation.kindergarten, ChildEducation.elementarySchool, ChildEducation.middleSchool, ChildEducation.highSchool, ChildEducation.college]; }
    static valueOf(n: string): ChildEducation { return (ChildEducation as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        let i: ChildEducation = this;
        if (i === ChildEducation.kindergarten) {
            return Utils.INSTANCE.getString(R.string.ChildEducation_Kindergarten);
        }
        if (i === ChildEducation.elementarySchool) {
            return Utils.INSTANCE.getString(R.string.ChildEducation_ElementarySchool);
        }
        if (i === ChildEducation.middleSchool) {
            return Utils.INSTANCE.getString(R.string.Education_Type_MiddleSchool);
        }
        if (i === ChildEducation.highSchool) {
            return Utils.INSTANCE.getString(R.string.Education_Type_HighSchool);
        }
        if (i === ChildEducation.college) {
            return Utils.INSTANCE.getString(R.string.Education_Type_College);
        }
        throw new NoWhenBranchMatchedException();
    }
}
export namespace ChildEducation {
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
        educationWithAge(age: number): ChildEducation {
        if ((4 <= age) && (5 >= age)) {
            return ChildEducation.kindergarten;
        }
        if ((6 <= age) && (11 >= age)) {
            return ChildEducation.elementarySchool;
        }
        if ((12 <= age) && (14 >= age)) {
            return ChildEducation.middleSchool;
        }
        if ((15 <= age) && (18 >= age)) {
            return ChildEducation.highSchool;
        }
        if ((19 <= age) && (22 >= age)) {
            return ChildEducation.college;
        }
        return null;
    }
    }
}
ChildEducation.INSTANCE = new ChildEducation.Companion(null);
