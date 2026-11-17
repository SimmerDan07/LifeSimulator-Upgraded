// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics, NoWhenBranchMatchedException, R, Random } from "../runtime";
import maleNamesTxt from "../data/male_names.txt";
import femaleNamesTxt from "../data/female_names.txt";
import lastNamesTxt from "../data/last_names.txt";
import { Sex } from "../Enums/Sex";

export class NameGenerator {
    static INSTANCE: NameGenerator = null;
    static femaleFirstNames: ArrayList<string> = null;
    static lastNames: ArrayList<string> = null;
    static maleFirstNames: ArrayList<string> = null;
    constructor() {

    }
    getMaleFirstNames(): ArrayList<string> {
        return NameGenerator.maleFirstNames;
    }
    setMaleFirstNames(arrayList: ArrayList<string>): void {
        Intrinsics.checkParameterIsNotNull(arrayList, "<set-?>");
        NameGenerator.maleFirstNames = arrayList;
    }
    getFemaleFirstNames(): ArrayList<string> {
        return NameGenerator.femaleFirstNames;
    }
    setFemaleFirstNames(arrayList: ArrayList<string>): void {
        Intrinsics.checkParameterIsNotNull(arrayList, "<set-?>");
        NameGenerator.femaleFirstNames = arrayList;
    }
    getLastNames(): ArrayList<string> {
        return NameGenerator.lastNames;
    }
    setLastNames(arrayList: ArrayList<string>): void {
        Intrinsics.checkParameterIsNotNull(arrayList, "<set-?>");
        NameGenerator.lastNames = arrayList;
    }
    getNamesFromFile(fileId: any): ArrayList<string> {
        const src: string = ({ male_names: maleNamesTxt, female_names: femaleNamesTxt, last_names: lastNamesTxt } as any)[fileId] ?? "";
        return new ArrayList(src.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0));
    }
    generateFirstName(sex: Sex): string {
        Intrinsics.checkParameterIsNotNull(sex, "sex");
        let i: Sex = sex;
        if (i === Sex.male) {
            return (CollectionsKt.random(NameGenerator.maleFirstNames, Random.INSTANCE) as string);
        }
        if (i === Sex.female) {
            return (CollectionsKt.random(NameGenerator.femaleFirstNames, Random.INSTANCE) as string);
        }
        throw new NoWhenBranchMatchedException();
    }
    generateLastName(): string {
        return (CollectionsKt.random(NameGenerator.lastNames, Random.INSTANCE) as string);
    }
    static {
        let nameGenerator: NameGenerator = new NameGenerator();
        NameGenerator.INSTANCE = nameGenerator;
        NameGenerator.maleFirstNames = nameGenerator.getNamesFromFile(R.raw.male_names);
        NameGenerator.femaleFirstNames = nameGenerator.getNamesFromFile(R.raw.female_names);
        NameGenerator.lastNames = nameGenerator.getNamesFromFile(R.raw.last_names);
    }
}
