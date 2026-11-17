// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics } from "../runtime";
import { DebugFlag } from "../Enums/DebugFlag";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";

export class GameInAppPurchaseState {
    static INSTANCE: any;
    states: ArrayList<GameInAppPurchaseState.SingleInAppPurchaseState> = null;
    constructor() {
        this.states = new ArrayList();
        for (const gameInAppPurchase of GameInAppPurchase.values()) {
            this.states.add(new GameInAppPurchaseState.SingleInAppPurchaseState(gameInAppPurchase, "$" + ExtensionsKt.toStringWithDecimals(gameInAppPurchase.getDefaultPrice(), 2), false));
        }
    }
    getStates(): ArrayList<GameInAppPurchaseState.SingleInAppPurchaseState> {
        return this.states;
    }
    getState$0(type: GameInAppPurchase): GameInAppPurchaseState.SingleInAppPurchaseState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        let arrayList: ArrayList<GameInAppPurchaseState.SingleInAppPurchaseState> = this.states;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (((obj as unknown as GameInAppPurchaseState.SingleInAppPurchaseState)).getType() === type) {
                arrayList2.add(obj);
            }
        }
        return (CollectionsKt.first((arrayList2 as unknown as ArrayList)) as unknown as GameInAppPurchaseState.SingleInAppPurchaseState);
    }
    getState$1(sku: string): GameInAppPurchaseState.SingleInAppPurchaseState {
        Intrinsics.checkParameterIsNotNull(sku, "sku");
        let arrayList: ArrayList<GameInAppPurchaseState.SingleInAppPurchaseState> = this.states;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (Intrinsics.areEqual(((obj as unknown as GameInAppPurchaseState.SingleInAppPurchaseState)).getType().getSku(), sku)) {
                arrayList2.add(obj);
            }
        }
        return (CollectionsKt.first((arrayList2 as unknown as ArrayList)) as unknown as GameInAppPurchaseState.SingleInAppPurchaseState);
    }
    getState(...a: any[]): any {
        if (a.length === 1 && (a[0] == null || a[0] instanceof GameInAppPurchase)) return (this as any).getState$0(...a);
        if (a.length === 1 && (a[0] == null || typeof a[0] === 'string')) return (this as any).getState$1(...a);
        throw new Error('no overload for getState with ' + a.length + ' args');
    }
    isPurchased(item: GameInAppPurchase): boolean {
        Intrinsics.checkParameterIsNotNull(item, "item");
        if (DebugFlag.unlockAllCountries.getEnabled() && (item === GameInAppPurchase.unlockAllDestinations)) {
            return true;
        }
        return this.getState(item).getPurchased();
    }
}
export namespace GameInAppPurchaseState {
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
    export class SingleInAppPurchaseState {
        static INSTANCE: any;
        localizedPrice: string = null;
        purchased: boolean = false;
        type: GameInAppPurchase = null;
        constructor(type: GameInAppPurchase, localizedPrice: string, z: boolean) {
            Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(localizedPrice, "localizedPrice");
        this.type = type;
        this.localizedPrice = localizedPrice;
        this.purchased = z;
        }
        static copy$default(singleInAppPurchaseState: GameInAppPurchaseState.SingleInAppPurchaseState, gameInAppPurchase: GameInAppPurchase, str: string, z: boolean, i: number, obj: any): GameInAppPurchaseState.SingleInAppPurchaseState {
        if ((i & 1) !== 0) {
            gameInAppPurchase = singleInAppPurchaseState.type;
        }
        if ((i & 2) !== 0) {
            str = singleInAppPurchaseState.localizedPrice;
        }
        if ((i & 4) !== 0) {
            z = singleInAppPurchaseState.purchased;
        }
        return singleInAppPurchaseState.copy(gameInAppPurchase, str, z);
    }
        getType(): GameInAppPurchase {
        return this.type;
    }
        getLocalizedPrice(): string {
        return this.localizedPrice;
    }
        getPurchased(): boolean {
        return this.purchased;
    }
        copy(type: GameInAppPurchase, localizedPrice: string, purchased: boolean): GameInAppPurchaseState.SingleInAppPurchaseState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(localizedPrice, "localizedPrice");
        return new GameInAppPurchaseState.SingleInAppPurchaseState(type, localizedPrice, purchased);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof GameInAppPurchaseState.SingleInAppPurchaseState) {
                let singleInAppPurchaseState: GameInAppPurchaseState.SingleInAppPurchaseState = (other as unknown as GameInAppPurchaseState.SingleInAppPurchaseState);
                if (Intrinsics.areEqual(this.type, singleInAppPurchaseState.type) && Intrinsics.areEqual(this.localizedPrice, singleInAppPurchaseState.localizedPrice)) {
                    if (this.purchased === singleInAppPurchaseState.purchased) {
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((("SingleInAppPurchaseState(type=" + this.type) + ", localizedPrice=") + this.localizedPrice) + ", purchased=") + this.purchased) + ")";
    }
        setLocalizedPrice(str: string): void {
        Intrinsics.checkParameterIsNotNull(str, "<set-?>");
        this.localizedPrice = str;
    }
        setPurchased(z: boolean): void {
        this.purchased = z;
    }
    }
    export namespace SingleInAppPurchaseState {
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
GameInAppPurchaseState.INSTANCE = new GameInAppPurchaseState.Companion(null);
GameInAppPurchaseState.SingleInAppPurchaseState.INSTANCE = new GameInAppPurchaseState.SingleInAppPurchaseState.Companion(null);
