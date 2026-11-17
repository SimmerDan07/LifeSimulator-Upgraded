// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class PlayerActionType extends JEnum {
    static readonly none: PlayerActionType = new PlayerActionType("none", 0);
    static readonly love: PlayerActionType = new PlayerActionType("love", 1);
    static readonly pet: PlayerActionType = new PlayerActionType("pet", 2);
    static readonly child: PlayerActionType = new PlayerActionType("child", 3);
    static readonly parent: PlayerActionType = new PlayerActionType("parent", 4);
    static values(): PlayerActionType[] { return [PlayerActionType.none, PlayerActionType.love, PlayerActionType.pet, PlayerActionType.child, PlayerActionType.parent]; }
    static valueOf(n: string): PlayerActionType { return (PlayerActionType as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
