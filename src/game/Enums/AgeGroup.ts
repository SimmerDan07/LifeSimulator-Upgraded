// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { Sex } from "./Sex";
import { Utils } from "../Utils/Utils";

export class AgeGroup extends JEnum {
    static readonly baby: AgeGroup = new AgeGroup("baby", 0);
    static readonly child: AgeGroup = new AgeGroup("child", 1);
    static readonly youngAdult: AgeGroup = new AgeGroup("youngAdult", 2);
    static readonly olderAdult: AgeGroup = new AgeGroup("olderAdult", 3);
    static readonly elder: AgeGroup = new AgeGroup("elder", 4);
    static values(): AgeGroup[] { return [AgeGroup.baby, AgeGroup.child, AgeGroup.youngAdult, AgeGroup.olderAdult, AgeGroup.elder]; }
    static valueOf(n: string): AgeGroup { return (AgeGroup as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        let i: AgeGroup = this;
        if (i === AgeGroup.baby) {
            return Utils.INSTANCE.getString(R.string.age_group_infant);
        }
        if (i === AgeGroup.child) {
            return Utils.INSTANCE.getString(R.string.age_group_child);
        }
        if (i === AgeGroup.youngAdult) {
            return Utils.INSTANCE.getString(R.string.age_group_adult);
        }
        if (i === AgeGroup.olderAdult) {
            return Utils.INSTANCE.getString(R.string.age_group_adult);
        }
        if (i === AgeGroup.elder) {
            return Utils.INSTANCE.getString(R.string.age_group_elder);
        }
        throw new NoWhenBranchMatchedException();
    }
    imageId(sex: Sex): number {
        Intrinsics.checkParameterIsNotNull(sex, "sex");
        let i: Sex = sex;
        if (i === Sex.male) {
            let i2: AgeGroup = this;
            if (i2 === AgeGroup.baby) {
                return R.drawable.head_male_1;
            }
            if (i2 === AgeGroup.child) {
                return R.drawable.head_male_2;
            }
            if ((i2 === AgeGroup.youngAdult) || (i2 === AgeGroup.olderAdult)) {
                return R.drawable.head_male_3;
            }
            if (i2 === AgeGroup.elder) {
                return R.drawable.head_male_4;
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === Sex.female) {
            let i3: AgeGroup = this;
            if (i3 === AgeGroup.baby) {
                return R.drawable.head_female_1;
            }
            if (i3 === AgeGroup.child) {
                return R.drawable.head_female_2;
            }
            if ((i3 === AgeGroup.youngAdult) || (i3 === AgeGroup.olderAdult)) {
                return R.drawable.head_female_3;
            }
            if (i3 === AgeGroup.elder) {
                return R.drawable.head_female_4;
            }
            throw new NoWhenBranchMatchedException();
        }
        throw new NoWhenBranchMatchedException();
    }
}
export namespace AgeGroup {
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
        getAgeGroup(ageInYears: number): AgeGroup {
        if (ageInYears < 10) {
            return AgeGroup.baby;
        }
        if ((ageInYears >= 10) && (ageInYears < 21)) {
            return AgeGroup.child;
        }
        if ((ageInYears >= 21) && (ageInYears < 40)) {
            return AgeGroup.youngAdult;
        }
        if ((ageInYears >= 40) && (ageInYears < 65)) {
            return AgeGroup.olderAdult;
        }
        return AgeGroup.elder;
    }
    }
}
AgeGroup.INSTANCE = new AgeGroup.Companion(null);
