// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { RandomEvent } from "./RandomEvent";

export class EventChoice {
    choiceText: string = null;
    event: RandomEvent = null;
    constructor(choiceText: string, randomEvent: RandomEvent) {
        Intrinsics.checkParameterIsNotNull(choiceText, "choiceText");
        this.choiceText = choiceText;
        this.event = randomEvent;
    }
    static copy$default(eventChoice: EventChoice, str: string, randomEvent: RandomEvent, i: number, obj: any): EventChoice {
        if ((i & 1) !== 0) {
            str = eventChoice.choiceText;
        }
        if ((i & 2) !== 0) {
            randomEvent = eventChoice.event;
        }
        return eventChoice.copy(str, randomEvent);
    }
    getChoiceText(): string {
        return this.choiceText;
    }
    getEvent(): RandomEvent {
        return this.event;
    }
    copy(choiceText: string, event: RandomEvent): EventChoice {
        Intrinsics.checkParameterIsNotNull(choiceText, "choiceText");
        return new EventChoice(choiceText, event);
    }
    equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (!(other instanceof EventChoice)) {
            return false;
        }
        let eventChoice: EventChoice = (other as unknown as EventChoice);
        return Intrinsics.areEqual(this.choiceText, eventChoice.choiceText) && Intrinsics.areEqual(this.event, eventChoice.event);
    }
    toString(): string {
        return ((("EventChoice(choiceText=" + this.choiceText) + ", event=") + this.event) + ")";
    }
}
