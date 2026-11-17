// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, BigInteger, CollectionsKt, Intrinsics, TypeCastException, Unit } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { Housing } from "../Enums/Housing";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";

export class HousingState {
    static INSTANCE: any;
    states: HousingState.HousingStateSingle[] = null;
    constructor() {
        let values: Housing[] = Housing.values();
        let arrayList: ArrayList = new ArrayList();
        for (const housing of values) {
            let valueOf: BigInteger = BigInteger.valueOf(0);
            arrayList.add(new HousingState.HousingStateSingle(housing, valueOf, false, false));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array != null) {
            this.states = (array as unknown as HousingState.HousingStateSingle[]);
            this.getState(Housing.homeless).setCurrentlyLivingHere(true);
            return;
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    getStates(): HousingState.HousingStateSingle[] {
        return this.states;
    }
    getNumberOfPropertiesOwned(): BigInteger {
        let housingStateSingleArr: HousingState.HousingStateSingle[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const housingStateSingle of housingStateSingleArr) {
            if (((housingStateSingle.getType() === Housing.homeless) || (housingStateSingle.getType() === Housing.parentsHouse)) ? false : true) {
                arrayList.add(housingStateSingle);
            }
        }
        let valueOf: BigInteger = BigInteger.valueOf(0);
        let it = arrayList.iterator();
        while (it.hasNext()) {
            valueOf = valueOf.add(((it.next() as unknown as HousingState.HousingStateSingle)).getNumberOwned());
        }
        return valueOf;
    }
    moveHere(housing: Housing): void {
        Intrinsics.checkParameterIsNotNull(housing, "housing");
        let housingStateSingleArr: HousingState.HousingStateSingle[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const housingStateSingle of housingStateSingleArr) {
            housingStateSingle.setCurrentlyLivingHere(false);
            arrayList.add(Unit.INSTANCE);
        }
        this.getState(housing).setCurrentlyLivingHere(true);
    }
    static purchase$default(housingState: HousingState, housing: Housing, bigInteger: BigInteger, i: number, obj: any): void {
        if ((i & 2) !== 0) {
            bigInteger = BigInteger.valueOf(1);
        }
        housingState.purchase(housing, bigInteger);
    }
    purchase(housing: Housing, number: BigInteger): void {
        Intrinsics.checkParameterIsNotNull(housing, "housing");
        Intrinsics.checkParameterIsNotNull(number, "number");
        let moneyState: MoneyState = GameStateManager.INSTANCE.getPersonState().getMoneyState();
        let multiply: BigInteger = housing.getPurchasePrice().multiply(number);
        moneyState.updateMoney(multiply, MoneyUpdateType.directSpend, null, MoneyDestination.cash);
        let state: HousingState.HousingStateSingle = this.getState(housing);
        let add: BigInteger = state.getNumberOwned().add(number);
        state.setNumberOwned(add);
    }
    static sell$default(housingState: HousingState, housing: Housing, bigInteger: BigInteger, i: number, obj: any): void {
        if ((i & 2) !== 0) {
            bigInteger = BigInteger.valueOf(1);
        }
        housingState.sell(housing, bigInteger);
    }
    sell(housing: Housing, number: BigInteger): void {
        Intrinsics.checkParameterIsNotNull(housing, "housing");
        Intrinsics.checkParameterIsNotNull(number, "number");
        let moneyState: MoneyState = GameStateManager.INSTANCE.getPersonState().getMoneyState();
        let multiply: BigInteger = housing.getPurchasePrice().multiply(number);
        moneyState.updateMoney(multiply, MoneyUpdateType.sell, null, MoneyDestination.cash);
        let state: HousingState.HousingStateSingle = this.getState(housing);
        let subtract: BigInteger = state.getNumberOwned().subtract(number);
        state.setNumberOwned(subtract);
    }
    purchaseMax(housing: Housing): void {
        Intrinsics.checkParameterIsNotNull(housing, "housing");
        let divide: BigInteger = GameStateManager.INSTANCE.getPersonState().getMoneyState().getCash().divide(housing.getPurchasePrice());
        this.purchase(housing, divide);
    }
    sellMax(housing: Housing): void {
        Intrinsics.checkParameterIsNotNull(housing, "housing");
        this.sell(housing, this.getState(housing).getNumberOwned());
    }
    getState(housing: Housing): HousingState.HousingStateSingle {
        Intrinsics.checkParameterIsNotNull(housing, "housing");
        let housingStateSingleArr: HousingState.HousingStateSingle[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const housingStateSingle of housingStateSingleArr) {
            if (housingStateSingle.getType() === housing) {
                arrayList.add(housingStateSingle);
            }
        }
        return (CollectionsKt.first((arrayList as unknown as ArrayList)) as unknown as HousingState.HousingStateSingle);
    }
    currentHousing(): HousingState.HousingStateSingle {
        let housingStateSingleArr: HousingState.HousingStateSingle[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const housingStateSingle of housingStateSingleArr) {
            if (housingStateSingle.getCurrentlyLivingHere()) {
                arrayList.add(housingStateSingle);
            }
        }
        return (CollectionsKt.first((arrayList as unknown as ArrayList)) as unknown as HousingState.HousingStateSingle);
    }
}
export namespace HousingState {
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
    export class HousingStateSingle {
        static INSTANCE: any;
        currentlyLivingHere: boolean = false;
        numberOwned: BigInteger = null;
        rentedOut: boolean = false;
        type: Housing = null;
        constructor(type: Housing, numberOwned: BigInteger, z: boolean, z2: boolean) {
            Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(numberOwned, "numberOwned");
        this.type = type;
        this.numberOwned = numberOwned;
        this.rentedOut = z;
        this.currentlyLivingHere = z2;
        }
        static copy$default(housingStateSingle: HousingState.HousingStateSingle, housing: Housing, bigInteger: BigInteger, z: boolean, z2: boolean, i: number, obj: any): HousingState.HousingStateSingle {
        if ((i & 1) !== 0) {
            housing = housingStateSingle.type;
        }
        if ((i & 2) !== 0) {
            bigInteger = housingStateSingle.numberOwned;
        }
        if ((i & 4) !== 0) {
            z = housingStateSingle.rentedOut;
        }
        if ((i & 8) !== 0) {
            z2 = housingStateSingle.currentlyLivingHere;
        }
        return housingStateSingle.copy(housing, bigInteger, z, z2);
    }
        getType(): Housing {
        return this.type;
    }
        getNumberOwned(): BigInteger {
        return this.numberOwned;
    }
        getRentedOut(): boolean {
        return this.rentedOut;
    }
        getCurrentlyLivingHere(): boolean {
        return this.currentlyLivingHere;
    }
        copy(type: Housing, numberOwned: BigInteger, rentedOut: boolean, currentlyLivingHere: boolean): HousingState.HousingStateSingle {
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(numberOwned, "numberOwned");
        return new HousingState.HousingStateSingle(type, numberOwned, rentedOut, currentlyLivingHere);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof HousingState.HousingStateSingle) {
                let housingStateSingle: HousingState.HousingStateSingle = (other as unknown as HousingState.HousingStateSingle);
                if (Intrinsics.areEqual(this.type, housingStateSingle.type) && Intrinsics.areEqual(this.numberOwned, housingStateSingle.numberOwned)) {
                    if (this.rentedOut === housingStateSingle.rentedOut) {
                        if (this.currentlyLivingHere === housingStateSingle.currentlyLivingHere) {
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((((("HousingStateSingle(type=" + this.type) + ", numberOwned=") + this.numberOwned) + ", rentedOut=") + this.rentedOut) + ", currentlyLivingHere=") + this.currentlyLivingHere) + ")";
    }
        setType(housing: Housing): void {
        Intrinsics.checkParameterIsNotNull(housing, "<set-?>");
        this.type = housing;
    }
        setNumberOwned(bigInteger: BigInteger): void {
        Intrinsics.checkParameterIsNotNull(bigInteger, "<set-?>");
        this.numberOwned = bigInteger;
    }
        setRentedOut(z: boolean): void {
        this.rentedOut = z;
    }
        setCurrentlyLivingHere(z: boolean): void {
        this.currentlyLivingHere = z;
    }
        getTotalValue(): BigInteger {
        let multiply: BigInteger = this.numberOwned.multiply(this.type.getPurchasePrice());
        return multiply;
    }
        getOwned(): boolean {
        let bigInteger: BigInteger = this.numberOwned;
        let valueOf: BigInteger = BigInteger.valueOf(0);
        return bigInteger.compareTo(valueOf) > 0;
    }
        getTotalRentableUnits(): BigInteger {
        if (!this.getOwned()) {
            let valueOf: BigInteger = BigInteger.valueOf(0);
            return valueOf;
        }
        if (!this.currentlyLivingHere) {
            return this.numberOwned;
        }
        let bigInteger: BigInteger = this.numberOwned;
        let valueOf2: BigInteger = BigInteger.valueOf(1);
        let subtract: BigInteger = bigInteger.subtract(valueOf2);
        return subtract;
    }
        getTotalRentalIncome(): BigInteger {
        if (this.getOwned()) {
            let multiply: BigInteger = this.getTotalRentableUnits().multiply(this.type.getRentalEarning());
            return multiply;
        }
        let valueOf: BigInteger = BigInteger.valueOf(0);
        return valueOf;
    }
    }
    export namespace HousingStateSingle {
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
HousingState.INSTANCE = new HousingState.Companion(null);
HousingState.HousingStateSingle.INSTANCE = new HousingState.HousingStateSingle.Companion(null);
