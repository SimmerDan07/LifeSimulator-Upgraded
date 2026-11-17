// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException } from "../runtime";
import { IProbableEvent } from "./IProbableEvent";

export class EventFrequency extends JEnum implements IProbableEvent {
    static readonly ultraRare: EventFrequency = new EventFrequency("ultraRare", 0);
    static readonly rare: EventFrequency = new EventFrequency("rare", 1);
    static readonly low: EventFrequency = new EventFrequency("low", 2);
    static readonly medium: EventFrequency = new EventFrequency("medium", 3);
    static readonly high: EventFrequency = new EventFrequency("high", 4);
    static values(): EventFrequency[] { return [EventFrequency.ultraRare, EventFrequency.rare, EventFrequency.low, EventFrequency.medium, EventFrequency.high]; }
    static valueOf(n: string): EventFrequency { return (EventFrequency as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getRelativeProbability(): number {
        let i: EventFrequency = this;
        if (i === EventFrequency.ultraRare) {
            return 3;
        }
        if (i === EventFrequency.rare) {
            return 20;
        }
        if (i === EventFrequency.low) {
            return 100;
        }
        if (i === EventFrequency.medium) {
            return 200;
        }
        if (i === EventFrequency.high) {
            return 400;
        }
        throw new NoWhenBranchMatchedException();
    }
    getIncreaseSeverity(): EventFrequency {
        let i: EventFrequency = this;
        if (i === EventFrequency.ultraRare) {
            return EventFrequency.rare;
        }
        if (i === EventFrequency.rare) {
            return EventFrequency.low;
        }
        if (i === EventFrequency.low) {
            return EventFrequency.medium;
        }
        if (i === EventFrequency.medium) {
            return EventFrequency.high;
        }
        if (i === EventFrequency.high) {
            return EventFrequency.high;
        }
        throw new NoWhenBranchMatchedException();
    }
    getDecreaseSeverity(): EventFrequency {
        let i: EventFrequency = this;
        if (i === EventFrequency.ultraRare) {
            return EventFrequency.ultraRare;
        }
        if (i === EventFrequency.rare) {
            return EventFrequency.ultraRare;
        }
        if (i === EventFrequency.low) {
            return EventFrequency.rare;
        }
        if (i === EventFrequency.medium) {
            return EventFrequency.low;
        }
        if (i === EventFrequency.high) {
            return EventFrequency.medium;
        }
        throw new NoWhenBranchMatchedException();
    }
}
