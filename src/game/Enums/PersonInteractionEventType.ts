// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class PersonInteractionEventType extends JEnum {
    static readonly child: PersonInteractionEventType = new PersonInteractionEventType("child", 0);
    static readonly pet: PersonInteractionEventType = new PersonInteractionEventType("pet", 1);
    static readonly family: PersonInteractionEventType = new PersonInteractionEventType("family", 2);
    static values(): PersonInteractionEventType[] { return [PersonInteractionEventType.child, PersonInteractionEventType.pet, PersonInteractionEventType.family]; }
    static valueOf(n: string): PersonInteractionEventType { return (PersonInteractionEventType as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
