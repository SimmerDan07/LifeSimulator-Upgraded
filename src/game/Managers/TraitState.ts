// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics, Random } from "../runtime";
import { Trait } from "../Enums/Trait";

export class TraitState {
    static INSTANCE: any;
    traits: ArrayList<Trait> = null;
    constructor() {
        this.traits = new ArrayList();
    }
    getTraits(): ArrayList<Trait> {
        return this.traits;
    }
    setTraits(arrayList: ArrayList<Trait>): void {
        Intrinsics.checkParameterIsNotNull(arrayList, "<set-?>");
        this.traits = arrayList;
    }
    hasTrait(trait: Trait): boolean {
        Intrinsics.checkParameterIsNotNull(trait, "trait");
        return this.traits.contains(trait);
    }
    addTrait(trait: Trait): void {
        Intrinsics.checkParameterIsNotNull(trait, "trait");
        if (this.traits.contains(trait)) {
            return;
        }
        this.traits.add(trait);
    }
    addRandomTrait(positive: boolean, traitForNewSkill: boolean): Trait {
        let availableTraits: Trait[] = Trait.INSTANCE.getAvailableTraits();
        let arrayList: ArrayList = new ArrayList();
        for (const trait of availableTraits) {
            let z: boolean = positive === trait.isPositiveTrait();
            let hasTrait: boolean = this.hasTrait(trait);
            let isMentalTrait: boolean = traitForNewSkill ? trait.isMentalTrait() : true;
            let opposite: Trait = trait.getOpposite();
            if (((z && !hasTrait) && isMentalTrait) && !((opposite != null) ? this.hasTrait(opposite) : false)) {
                arrayList.add(trait);
            }
        }
        let trait2: Trait = (CollectionsKt.random(arrayList, Random.INSTANCE) as unknown as Trait);
        this.addTrait(trait2);
        return trait2;
    }
}
export namespace TraitState {
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
TraitState.INSTANCE = new TraitState.Companion(null);
