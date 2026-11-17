// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Double, Intrinsics, NoWhenBranchMatchedException } from "../runtime";
import { PersonAttribute } from "../Enums/PersonAttribute";

export class Modifiers {
    static INSTANCE: any;
    happiness: number = 0;
    health: number = 0;
    sanity: number = 0;
    constructor(d: number, d2: number, d3: number) {
        this.health = d;
        this.happiness = d2;
        this.sanity = d3;
    }
    static copy$default(modifiers: Modifiers, d: number, d2: number, d3: number, i: number, obj: any): Modifiers {
        if ((i & 1) !== 0) {
            d = modifiers.health;
        }
        let d4: number = d;
        if ((i & 2) !== 0) {
            d2 = modifiers.happiness;
        }
        let d5: number = d2;
        if ((i & 4) !== 0) {
            d3 = modifiers.sanity;
        }
        return modifiers.copy(d4, d5, d3);
    }
    getHealth(): number {
        return this.health;
    }
    getHappiness(): number {
        return this.happiness;
    }
    getSanity(): number {
        return this.sanity;
    }
    copy(health: number, happiness: number, sanity: number): Modifiers {
        return new Modifiers(health, happiness, sanity);
    }
    equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (!(other instanceof Modifiers)) {
            return false;
        }
        let modifiers: Modifiers = (other as unknown as Modifiers);
        return ((Double.compare(this.health, modifiers.health) === 0) && (Double.compare(this.happiness, modifiers.happiness) === 0)) && (Double.compare(this.sanity, modifiers.sanity) === 0);
    }
    toString(): string {
        return ((((("Modifiers(health=" + this.health) + ", happiness=") + this.happiness) + ", sanity=") + this.sanity) + ")";
    }
    setHappiness(d: number): void {
        this.happiness = d;
    }
    setHealth(d: number): void {
        this.health = d;
    }
    setSanity(d: number): void {
        this.sanity = d;
    }
    multiplyBy(multiple: number): Modifiers {
        return new Modifiers(this.health * multiple, this.happiness * multiple, this.sanity * multiple);
    }
    update(attribute: PersonAttribute, value: number): void {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        let i: PersonAttribute = attribute;
        if (i === PersonAttribute.health) {
            this.health = value;
        } else if (i === PersonAttribute.sanity) {
            this.sanity = value;
        } else {
            if (i !== PersonAttribute.happiness) {
                return;
            }
            this.happiness = value;
        }
    }
    get(attribute: PersonAttribute): number {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        let i: PersonAttribute = attribute;
        if (i === PersonAttribute.health) {
            return this.health;
        }
        if (i === PersonAttribute.sanity) {
            return this.sanity;
        }
        if (i === PersonAttribute.happiness) {
            return this.happiness;
        }
        throw new NoWhenBranchMatchedException();
    }
    isAllZero(): boolean {
        return ((this.health === 0.0) && (this.sanity === 0.0)) && (this.happiness === 0.0);
    }
}
export namespace Modifiers {
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
        modifierWithHealth(health: number): Modifiers {
        return new Modifiers(health, 0.0, 0.0);
    }
        modifierWithHappiness(happiness: number): Modifiers {
        return new Modifiers(0.0, happiness, 0.0);
    }
        modifierWithSanity(sanity: number): Modifiers {
        return new Modifiers(0.0, 0.0, sanity);
    }
        modifierWithZero(): Modifiers {
        return new Modifiers(0.0, 0.0, 0.0);
    }
        modifier(attribute: PersonAttribute, value: number): Modifiers {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        let i: PersonAttribute = attribute;
        if (i === PersonAttribute.health) {
            return this.modifierWithHealth(value);
        }
        if (i === PersonAttribute.happiness) {
            return this.modifierWithHappiness(value);
        }
        if (i === PersonAttribute.sanity) {
            return this.modifierWithSanity(value);
        }
        throw new NoWhenBranchMatchedException();
    }
    }
}
Modifiers.INSTANCE = new Modifiers.Companion(null);
