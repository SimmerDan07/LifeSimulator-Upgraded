// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Double, Intrinsics, NoWhenBranchMatchedException, Pair } from "../runtime";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Modifiers } from "./Modifiers";
import { PersonAttribute } from "../Enums/PersonAttribute";

export class AttributeState {
    static INSTANCE: any;
    happiness: number = 0;
    happinessDeltaThisWeek: ArrayList<Pair<string, number>> = null;
    health: number = 0;
    healthDeltaThisWeek: ArrayList<Pair<string, number>> = null;
    lowAttributeCountdown_happiness: number = 0;
    lowAttributeCountdown_health: number = 0;
    lowAttributeCountdown_sanity: number = 0;
    sanity: number = 0;
    sanityDeltaThisWeek: ArrayList<Pair<string, number>> = null;
    constructor(d: number, d2: number, d3: number) {
        this.healthDeltaThisWeek = new ArrayList();
        this.happinessDeltaThisWeek = new ArrayList();
        this.sanityDeltaThisWeek = new ArrayList();
        this.setHealth(d);
        this.setHappiness(d2);
        this.setSanity(d3);
    }
    static happinessDeltaThisWeek$annotations(): void {
    }
    static healthDeltaThisWeek$annotations(): void {
    }
    static sanityDeltaThisWeek$annotations(): void {
    }
    getHealth(): number {
        return this.health;
    }
    setHealth(d: number): void {
        this.health = ExtensionsKt.keepWithinRange(d, 0.0, Constants.Attribute.INSTANCE.getMaxAttributeValue());
    }
    getHappiness(): number {
        return this.happiness;
    }
    setHappiness(d: number): void {
        this.happiness = ExtensionsKt.keepWithinRange(d, 0.0, Constants.Attribute.INSTANCE.getMaxAttributeValue());
    }
    getSanity(): number {
        return this.sanity;
    }
    setSanity(d: number): void {
        this.sanity = ExtensionsKt.keepWithinRange(d, 0.0, Constants.Attribute.INSTANCE.getMaxAttributeValue());
    }
    getLowAttributeCountdown_health(): number {
        return this.lowAttributeCountdown_health;
    }
    setLowAttributeCountdown_health(i: number): void {
        this.lowAttributeCountdown_health = i;
    }
    getLowAttributeCountdown_sanity(): number {
        return this.lowAttributeCountdown_sanity;
    }
    setLowAttributeCountdown_sanity(i: number): void {
        this.lowAttributeCountdown_sanity = i;
    }
    getLowAttributeCountdown_happiness(): number {
        return this.lowAttributeCountdown_happiness;
    }
    setLowAttributeCountdown_happiness(i: number): void {
        this.lowAttributeCountdown_happiness = i;
    }
    getDeltaThisWeek(attribute: PersonAttribute): ArrayList<Pair<string, number>> {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        let i: PersonAttribute = attribute;
        if (i === PersonAttribute.health) {
            return this.healthDeltaThisWeek;
        }
        if (i === PersonAttribute.happiness) {
            return this.happinessDeltaThisWeek;
        }
        if (i === PersonAttribute.sanity) {
            return this.sanityDeltaThisWeek;
        }
        throw new NoWhenBranchMatchedException();
    }
    static setDeltaValue$default$0(attributeState: AttributeState, personAttribute: PersonAttribute, str: string, d: number, i: number, obj: any): void {
        if ((i & 2) !== 0) {
            str = null;
        }
        attributeState.setDeltaValue(personAttribute, str, d);
    }
    static setDeltaValue$default$1(attributeState: AttributeState, modifiers: Modifiers, str: string, i: number, obj: any): void {
        if ((i & 2) !== 0) {
            str = null;
        }
        attributeState.setDeltaValue(modifiers, str);
    }
    static setDeltaValue$default(...a: any[]): any {
        if (a.length === 6 && (a[0] == null || a[0] instanceof AttributeState) && (a[1] == null || a[1] instanceof PersonAttribute) && (a[2] == null || typeof a[2] === 'string') && typeof a[3] === 'number' && (typeof a[4] === 'number' || typeof a[4] === 'string')) return (AttributeState as any).setDeltaValue$default$0(...a);
        if (a.length === 5 && (a[0] == null || a[0] instanceof AttributeState) && (a[1] == null || a[1] instanceof Modifiers) && (a[2] == null || typeof a[2] === 'string') && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (AttributeState as any).setDeltaValue$default$1(...a);
        throw new Error('no overload for setDeltaValue$default with ' + a.length + ' args');
    }
    setDeltaValue$0(attribute: PersonAttribute, key: string, value: number): void {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        if (value === 0.0) {
            return;
        }
        let i: PersonAttribute = attribute;
        if (i === PersonAttribute.health) {
            this.healthDeltaThisWeek.add(new Pair(key, Double.valueOf(value)));
        } else if (i === PersonAttribute.happiness) {
            this.happinessDeltaThisWeek.add(new Pair(key, Double.valueOf(value)));
        } else {
            if (i !== PersonAttribute.sanity) {
                return;
            }
            this.sanityDeltaThisWeek.add(new Pair(key, Double.valueOf(value)));
        }
    }
    setDeltaValue$1(modifiers: Modifiers, key: string): void {
        Intrinsics.checkParameterIsNotNull(modifiers, "modifiers");
        this.setDeltaValue(PersonAttribute.health, key, modifiers.getHealth());
        this.setDeltaValue(PersonAttribute.happiness, key, modifiers.getHappiness());
        this.setDeltaValue(PersonAttribute.sanity, key, modifiers.getSanity());
    }
    setDeltaValue(...a: any[]): any {
        if (a.length === 3 && (a[0] == null || a[0] instanceof PersonAttribute) && (a[1] == null || typeof a[1] === 'string') && typeof a[2] === 'number') return (this as any).setDeltaValue$0(...a);
        if (a.length === 2 && (a[0] == null || a[0] instanceof Modifiers) && (a[1] == null || typeof a[1] === 'string')) return (this as any).setDeltaValue$1(...a);
        throw new Error('no overload for setDeltaValue with ' + a.length + ' args');
    }
    setDeltaValueImmediate(modifiers: Modifiers): void {
        Intrinsics.checkParameterIsNotNull(modifiers, "modifiers");
        this.setHealth(this.health + modifiers.getHealth());
        this.setHappiness(this.happiness + modifiers.getHappiness());
        this.setSanity(this.sanity + modifiers.getSanity());
    }
    clearWeeklyValues(): void {
        this.healthDeltaThisWeek.clear();
        this.happinessDeltaThisWeek.clear();
        this.sanityDeltaThisWeek.clear();
    }
    applyThisWeeksValues(): void {
        let d: number = this.health;
        let arrayList: ArrayList<Pair<string, number>> = this.healthDeltaThisWeek;
        let arrayList2: ArrayList = new ArrayList();
        let it = arrayList.iterator();
        while (it.hasNext()) {
            arrayList2.add(Double.valueOf((((it.next() as unknown as Pair)).getSecond()).doubleValue()));
        }
        this.setHealth(d + CollectionsKt.sumOfDouble(arrayList2));
        let d2: number = this.happiness;
        let arrayList3: ArrayList<Pair<string, number>> = this.happinessDeltaThisWeek;
        let arrayList4: ArrayList = new ArrayList();
        let it2 = arrayList3.iterator();
        while (it2.hasNext()) {
            arrayList4.add(Double.valueOf((((it2.next() as unknown as Pair)).getSecond()).doubleValue()));
        }
        this.setHappiness(d2 + CollectionsKt.sumOfDouble(arrayList4));
        let d3: number = this.sanity;
        let arrayList5: ArrayList<Pair<string, number>> = this.sanityDeltaThisWeek;
        let arrayList6: ArrayList = new ArrayList();
        let it3 = arrayList5.iterator();
        while (it3.hasNext()) {
            arrayList6.add(Double.valueOf((((it3.next() as unknown as Pair)).getSecond()).doubleValue()));
        }
        this.setSanity(d3 + CollectionsKt.sumOfDouble(arrayList6));
        this.clearWeeklyValues();
        let d4: number = 0;
        if (this.health <= d4) {
            this.lowAttributeCountdown_health++;
        } else {
            this.lowAttributeCountdown_health = 0;
        }
        if (this.happiness <= d4) {
            this.lowAttributeCountdown_happiness++;
        } else {
            this.lowAttributeCountdown_happiness = 0;
        }
        if (this.sanity <= d4) {
            this.lowAttributeCountdown_sanity++;
        } else {
            this.lowAttributeCountdown_sanity = 0;
        }
    }
    maxOutAttribute(): void {
        this.setHealth(100.0);
        this.setHappiness(100.0);
        this.setSanity(100.0);
    }
}
export namespace AttributeState {
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
    }
}
AttributeState.INSTANCE = new AttributeState.Companion(null);
