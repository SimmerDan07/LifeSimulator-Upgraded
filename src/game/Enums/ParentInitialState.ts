// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class ParentInitialState extends JEnum {
    static readonly none: ParentInitialState = new ParentInitialState("none", 0);
    static readonly dead: ParentInitialState = new ParentInitialState("dead", 1);
    static readonly alive: ParentInitialState = new ParentInitialState("alive", 2);
    static values(): ParentInitialState[] { return [ParentInitialState.none, ParentInitialState.dead, ParentInitialState.alive]; }
    static valueOf(n: string): ParentInitialState { return (ParentInitialState as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
