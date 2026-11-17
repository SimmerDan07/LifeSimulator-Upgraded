// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class Species extends JEnum {
    static readonly person: Species = new Species("person", 0);
    static readonly pet: Species = new Species("pet", 1);
    static values(): Species[] { return [Species.person, Species.pet]; }
    static valueOf(n: string): Species { return (Species as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
