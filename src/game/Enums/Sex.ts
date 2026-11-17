// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArraysKt, Intrinsics, JEnum, NoWhenBranchMatchedException, R, Random } from "../runtime";
import { Gender } from "./Gender";
import { Sexuality } from "./Sexuality";
import { Utils } from "../Utils/Utils";

export class Sex extends JEnum {
    static readonly male: Sex = new Sex("male", 0);
    static readonly female: Sex = new Sex("female", 1);
    static values(): Sex[] { return [Sex.male, Sex.female]; }
    static valueOf(n: string): Sex { return (Sex as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        let i: Sex = this;
        if (i === Sex.male) {
            return Utils.INSTANCE.getString(R.string.gender_male);
        }
        if (i === Sex.female) {
            return Utils.INSTANCE.getString(R.string.gender_female);
        }
        throw new NoWhenBranchMatchedException();
    }
    getCorrespondingGender(): Gender {
        let i: Sex = this;
        if (i === Sex.male) {
            return Gender.male;
        }
        if (i === Sex.female) {
            return Gender.female;
        }
        throw new NoWhenBranchMatchedException();
    }
    getOpposite(): Sex {
        let i: Sex = this;
        if (i === Sex.male) {
            return Sex.female;
        }
        if (i === Sex.female) {
            return Sex.male;
        }
        throw new NoWhenBranchMatchedException();
    }
    randomPartnerGender(sexuality: Sexuality): Sex {
        Intrinsics.checkParameterIsNotNull(sexuality, "sexuality");
        let i: Sexuality = sexuality;
        if (i === Sexuality.straight) {
            return this.getOpposite();
        }
        if (i === Sexuality.gay) {
            return this;
        }
        if (i === Sexuality.bisexual) {
            return (ArraysKt.random(Sex.values(), Random.INSTANCE) as unknown as Sex);
        }
        throw new NoWhenBranchMatchedException();
    }
    getDatingTitle(): string {
        let i: Sex = this;
        if (i === Sex.male) {
            return Utils.INSTANCE.getString(R.string.Common_Boy);
        }
        if (i === Sex.female) {
            return Utils.INSTANCE.getString(R.string.Common_Girl);
        }
        throw new NoWhenBranchMatchedException();
    }
    getImageId(): number {
        return this.getCorrespondingGender().getImageId();
    }
}
export namespace Sex {
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
        getRandomSex(): Sex {
        return (ArraysKt.random(Sex.values(), Random.INSTANCE) as unknown as Sex);
    }
    }
}
Sex.INSTANCE = new Sex.Companion(null);
