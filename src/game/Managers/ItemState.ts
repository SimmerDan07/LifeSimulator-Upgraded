// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics, TypeCastException } from "../runtime";
import { Possession } from "../Enums/Possession";

export class ItemState {
    static INSTANCE: any;
    states: ItemState.SingleItemState[] = null;
    constructor() {
        let values: Possession[] = Possession.values();
        let arrayList: ArrayList = new ArrayList();
        for (const possession of values) {
            arrayList.add(new ItemState.SingleItemState(possession, false, 0));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array == null) {
            throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
        }
        this.states = (array as unknown as ItemState.SingleItemState[]);
    }
    getStates(): ItemState.SingleItemState[] {
        return this.states;
    }
    setStates(singleItemStateArr: ItemState.SingleItemState[]): void {
        Intrinsics.checkParameterIsNotNull(singleItemStateArr, "<set-?>");
        this.states = singleItemStateArr;
    }
    isOwned(possession: Possession): boolean {
        Intrinsics.checkParameterIsNotNull(possession, "possession");
        return this.getState(possession).getOwned();
    }
    getState(possession: Possession): ItemState.SingleItemState {
        Intrinsics.checkParameterIsNotNull(possession, "possession");
        let singleItemStateArr: ItemState.SingleItemState[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const singleItemState of singleItemStateArr) {
            if (singleItemState.getType() === possession) {
                arrayList.add(singleItemState);
            }
        }
        return (CollectionsKt.first((arrayList as unknown as ArrayList)) as unknown as ItemState.SingleItemState);
    }
    acquireItem(possession: Possession): void {
        Intrinsics.checkParameterIsNotNull(possession, "possession");
        let state: ItemState.SingleItemState = this.getState(possession);
        if (state.getLevel() < state.getType().getMaxLevel()) {
            state.setLevel(state.getLevel() + 1);
        }
        state.setOwned(true);
    }
}
export namespace ItemState {
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
    export class SingleItemState {
        static INSTANCE: any;
        level: number = 0;
        owned: boolean = false;
        type: Possession = null;
        constructor(type: Possession, z: boolean, i: number) {
            Intrinsics.checkParameterIsNotNull(type, "type");
        this.type = type;
        this.owned = z;
        this.level = i;
        }
        static copy$default(singleItemState: ItemState.SingleItemState, possession: Possession, z: boolean, i: number, i2: number, obj: any): ItemState.SingleItemState {
        if ((i2 & 1) !== 0) {
            possession = singleItemState.type;
        }
        if ((i2 & 2) !== 0) {
            z = singleItemState.owned;
        }
        if ((i2 & 4) !== 0) {
            i = singleItemState.level;
        }
        return singleItemState.copy(possession, z, i);
    }
        getType(): Possession {
        return this.type;
    }
        getOwned(): boolean {
        return this.owned;
    }
        getLevel(): number {
        return this.level;
    }
        copy(type: Possession, owned: boolean, level: number): ItemState.SingleItemState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new ItemState.SingleItemState(type, owned, level);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof ItemState.SingleItemState) {
                let singleItemState: ItemState.SingleItemState = (other as unknown as ItemState.SingleItemState);
                if (Intrinsics.areEqual(this.type, singleItemState.type)) {
                    if (this.owned === singleItemState.owned) {
                        if (this.level === singleItemState.level) {
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((("SingleItemState(type=" + this.type) + ", owned=") + this.owned) + ", level=") + this.level) + ")";
    }
        setOwned(z: boolean): void {
        this.owned = z;
    }
        setLevel(i: number): void {
        this.level = i;
    }
    }
    export namespace SingleItemState {
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
}
ItemState.INSTANCE = new ItemState.Companion(null);
ItemState.SingleItemState.INSTANCE = new ItemState.SingleItemState.Companion(null);
