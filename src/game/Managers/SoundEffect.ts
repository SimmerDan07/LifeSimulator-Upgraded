// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";

export class SoundEffect extends JEnum {
    static readonly Whoosh: SoundEffect = new SoundEffect("Whoosh", 0);
    static readonly Pop: SoundEffect = new SoundEffect("Pop", 1);
    static readonly Pop2: SoundEffect = new SoundEffect("Pop2", 2);
    static readonly Important: SoundEffect = new SoundEffect("Important", 3);
    static readonly Victory: SoundEffect = new SoundEffect("Victory", 4);
    static readonly Coin: SoundEffect = new SoundEffect("Coin", 5);
    static readonly Bell: SoundEffect = new SoundEffect("Bell", 6);
    static readonly Siren: SoundEffect = new SoundEffect("Siren", 7);
    static readonly BabyCry: SoundEffect = new SoundEffect("BabyCry", 8);
    static readonly Plane: SoundEffect = new SoundEffect("Plane", 9);
    static readonly Bark: SoundEffect = new SoundEffect("Bark", 10);
    static readonly Meow: SoundEffect = new SoundEffect("Meow", 11);
    static readonly Fish: SoundEffect = new SoundEffect("Fish", 12);
    static readonly GuineaPig: SoundEffect = new SoundEffect("GuineaPig", 13);
    static readonly BirdCall: SoundEffect = new SoundEffect("BirdCall", 14);
    static readonly Duck: SoundEffect = new SoundEffect("Duck", 15);
    static readonly Turkey: SoundEffect = new SoundEffect("Turkey", 16);
    static values(): SoundEffect[] { return [SoundEffect.Whoosh, SoundEffect.Pop, SoundEffect.Pop2, SoundEffect.Important, SoundEffect.Victory, SoundEffect.Coin, SoundEffect.Bell, SoundEffect.Siren, SoundEffect.BabyCry, SoundEffect.Plane, SoundEffect.Bark, SoundEffect.Meow, SoundEffect.Fish, SoundEffect.GuineaPig, SoundEffect.BirdCall, SoundEffect.Duck, SoundEffect.Turkey]; }
    static valueOf(n: string): SoundEffect { return (SoundEffect as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getFileId(): number {
        switch (this) {
            case SoundEffect.Whoosh:
                return R.raw.whoosh;
            case SoundEffect.Pop:
                return R.raw.pop;
            case SoundEffect.Pop2:
                return R.raw.pop2;
            case SoundEffect.Important:
                return R.raw.important;
            case SoundEffect.Victory:
                return R.raw.victory;
            case SoundEffect.Coin:
                return R.raw.coin;
            case SoundEffect.Bell:
                return R.raw.bell;
            case SoundEffect.Siren:
                return R.raw.siren;
            case SoundEffect.BabyCry:
                return R.raw.babycry;
            case SoundEffect.Plane:
                return R.raw.plane;
            case SoundEffect.Bark:
                return R.raw.bark;
            case SoundEffect.Meow:
                return R.raw.cat;
            case SoundEffect.Fish:
                return R.raw.fish;
            case SoundEffect.GuineaPig:
                return R.raw.guineapig;
            case SoundEffect.BirdCall:
                return R.raw.birdcall;
            case SoundEffect.Duck:
                return R.raw.duck;
            case SoundEffect.Turkey:
                return R.raw.turkey;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
