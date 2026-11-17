// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArraysKt, JEnum, NoWhenBranchMatchedException, R, Random } from "../runtime";
import { Sex } from "./Sex";
import { Utils } from "../Utils/Utils";

export class Gender extends JEnum {
    static readonly male: Gender = new Gender("male", 0);
    static readonly female: Gender = new Gender("female", 1);
    static readonly nonbinary: Gender = new Gender("nonbinary", 2);
    static values(): Gender[] { return [Gender.male, Gender.female, Gender.nonbinary]; }
    static valueOf(n: string): Gender { return (Gender as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        let i: Gender = this;
        if (i === Gender.male) {
            return Utils.INSTANCE.getString(R.string.gender_male);
        }
        if (i === Gender.female) {
            return Utils.INSTANCE.getString(R.string.gender_female);
        }
        if (i === Gender.nonbinary) {
            return Utils.INSTANCE.getString(R.string.gender_nonbinary);
        }
        throw new NoWhenBranchMatchedException();
    }
    getImageId(): number {
        let i: Gender = this;
        if (i === Gender.male) {
            return R.drawable.gender_male;
        }
        if (i === Gender.female) {
            return R.drawable.gender_female;
        }
        if (i === Gender.nonbinary) {
            return R.drawable.non_binary_1;
        }
        throw new NoWhenBranchMatchedException();
    }
    getCorrespondingSex(): Sex {
        let i: Gender = this;
        if (i === Gender.male) {
            return Sex.male;
        }
        if (i === Gender.female) {
            return Sex.female;
        }
        if (i === Gender.nonbinary) {
            return Sex.INSTANCE.getRandomSex();
        }
        throw new NoWhenBranchMatchedException();
    }
    getPronoun(): string {
        let i: Gender = this;
        if (i === Gender.male) {
            return Utils.INSTANCE.getString(R.string.Male_pronoun);
        }
        if (i === Gender.female) {
            return Utils.INSTANCE.getString(R.string.Female_pronoun);
        }
        if (i === Gender.nonbinary) {
            return Utils.INSTANCE.getString(R.string.Nonbinary_pronoun);
        }
        throw new NoWhenBranchMatchedException();
    }
    getPronounThirdPerson(): string {
        let i: Gender = this;
        if (i === Gender.male) {
            return Utils.INSTANCE.getString(R.string.Male_thirdPerson);
        }
        if (i === Gender.female) {
            return Utils.INSTANCE.getString(R.string.Female_thirdPerson);
        }
        if (i === Gender.nonbinary) {
            return Utils.INSTANCE.getString(R.string.Nonbinary_thirdPerson);
        }
        throw new NoWhenBranchMatchedException();
    }
    getPossessiveHisHer(): string {
        let i: Gender = this;
        if (i === Gender.male) {
            return Utils.INSTANCE.getString(R.string.Common_His);
        }
        if (i === Gender.female) {
            return Utils.INSTANCE.getString(R.string.Common_Her);
        }
        if (i === Gender.nonbinary) {
            return Utils.INSTANCE.getString(R.string.Common_Their);
        }
        throw new NoWhenBranchMatchedException();
    }
}
export namespace Gender {
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
        randomGender(): Gender {
        return (ArraysKt.random([Gender.male, Gender.female], Random.INSTANCE) as unknown as Gender);
    }
    }
}
Gender.INSTANCE = new Gender.Companion(null);
