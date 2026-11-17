// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { Utils } from "../Utils/Utils";

export class LifeScenarioDifficulty extends JEnum {
    static readonly sandbox: LifeScenarioDifficulty = new LifeScenarioDifficulty("sandbox", 0, 0);
    static readonly easy: LifeScenarioDifficulty = new LifeScenarioDifficulty("easy", 1, 1);
    static readonly moderate: LifeScenarioDifficulty = new LifeScenarioDifficulty("moderate", 2, 2);
    static readonly challenging: LifeScenarioDifficulty = new LifeScenarioDifficulty("challenging", 3, 3);
    static values(): LifeScenarioDifficulty[] { return [LifeScenarioDifficulty.sandbox, LifeScenarioDifficulty.easy, LifeScenarioDifficulty.moderate, LifeScenarioDifficulty.challenging]; }
    static valueOf(n: string): LifeScenarioDifficulty { return (LifeScenarioDifficulty as any)[n]; }
    raw: number = 0;
    constructor(name: string, ordinal: number, i: number) {
        super(name, ordinal);
        this.raw = i;
    }
    getRaw(): number {
        return this.raw;
    }
    getTitle(): string {
        let i: LifeScenarioDifficulty = this;
        if (i === LifeScenarioDifficulty.sandbox) {
            return Utils.INSTANCE.getString(R.string.LifeScenarioDifficulty_Sandbox);
        }
        if (i === LifeScenarioDifficulty.easy) {
            return Utils.INSTANCE.getString(R.string.LifeScenarioDifficulty_Easy);
        }
        if (i === LifeScenarioDifficulty.moderate) {
            return Utils.INSTANCE.getString(R.string.LifeScenarioDifficulty_Moderate);
        }
        if (i === LifeScenarioDifficulty.challenging) {
            return Utils.INSTANCE.getString(R.string.LifeScenarioDifficulty_Challenging);
        }
        throw new NoWhenBranchMatchedException();
    }
    getColor(): number {
        let i: LifeScenarioDifficulty = this;
        if (i === LifeScenarioDifficulty.sandbox) {
            return R.color.flatPurple;
        }
        if (i === LifeScenarioDifficulty.easy) {
            return R.color.flatGreen;
        }
        if (i === LifeScenarioDifficulty.moderate) {
            return R.color.flatOrange;
        }
        if (i === LifeScenarioDifficulty.challenging) {
            return R.color.flatRed;
        }
        throw new NoWhenBranchMatchedException();
    }
}
