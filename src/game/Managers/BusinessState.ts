// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, BigInteger, Double, Intrinsics, JMath, R, TypeCastException } from "../runtime";
import { BenefitLevel } from "../Enums/BenefitLevel";
import { Business } from "../Enums/Business";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "./GameStateManager";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Player } from "./Player";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { Utils } from "../Utils/Utils";

export class BusinessState {
    static INSTANCE: any;
    states: BusinessState.SingleBusinessState[] = null;
    constructor() {
        let values: Business[] = Business.values();
        let arrayList: ArrayList = new ArrayList();
        for (const business of values) {
            let business2: string = business.toString();
            let valueOf: BigInteger = BigInteger.valueOf(0);
            arrayList.add(new BusinessState.SingleBusinessState(business2, business, 0, valueOf, business.getRandomCompanyName(), BenefitLevel.low));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array == null) {
            throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
        }
        this.states = (array as unknown as BusinessState.SingleBusinessState[]);
    }
    getStates(): BusinessState.SingleBusinessState[] {
        return this.states;
    }
    setStates(singleBusinessStateArr: BusinessState.SingleBusinessState[]): void {
        Intrinsics.checkParameterIsNotNull(singleBusinessStateArr, "<set-?>");
        this.states = singleBusinessStateArr;
    }
    applyWeeklyValues(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        for (const singleBusinessState of this.states) {
            let totalProfit: BigInteger = singleBusinessState.getTotalProfit();
            let j: number = 0;
            if (!Intrinsics.areEqual(totalProfit, BigInteger.valueOf(0))) {
                MoneyState.updateMoney$default(player.getMoneyState(), singleBusinessState.getTotalProfit(), MoneyUpdateType.passiveIncome, (singleBusinessState.getType().getBaseBusinessName() + " ") + Utils.INSTANCE.getString(R.string.Common_Revenue), null, 8, null);
            }
            let numberOfBusinessUnits: BigInteger = singleBusinessState.getNumberOfBusinessUnits();
            let valueOf: BigInteger = BigInteger.valueOf(j);
            if (numberOfBusinessUnits.compareTo(valueOf) > 0) {
                singleBusinessState.setMoraleProgress(singleBusinessState.getMoraleProgress() + singleBusinessState.getMoraleLevel().getWeeklyMoraleModifier());
            }
        }
    }
}
export namespace BusinessState {
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
    export class SingleBusinessState {
        static INSTANCE: any;
        id: string = null;
        level: number = 0;
        moraleLevel: BenefitLevel = null;
        moraleProgress: number = 0;
        name: string = null;
        numberOfBusinessUnits: BigInteger = null;
        type: Business = null;
        constructor(id: string, type: Business, i: number, numberOfBusinessUnits: BigInteger, name: string, moraleLevel: BenefitLevel) {
            Intrinsics.checkParameterIsNotNull(id, "id");
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(numberOfBusinessUnits, "numberOfBusinessUnits");
        Intrinsics.checkParameterIsNotNull(name, "name");
        Intrinsics.checkParameterIsNotNull(moraleLevel, "moraleLevel");
        this.id = id;
        this.type = type;
        this.level = i;
        this.numberOfBusinessUnits = numberOfBusinessUnits;
        this.name = name;
        this.moraleLevel = moraleLevel;
        this.moraleProgress = Constants.Business.INSTANCE.getDefaultBusinessMorale();
        }
        static copy$default(singleBusinessState: BusinessState.SingleBusinessState, str: string, business: Business, i: number, bigInteger: BigInteger, str2: string, benefitLevel: BenefitLevel, i2: number, obj: any): BusinessState.SingleBusinessState {
        if ((i2 & 1) !== 0) {
            str = singleBusinessState.id;
        }
        if ((i2 & 2) !== 0) {
            business = singleBusinessState.type;
        }
        let business2: Business = business;
        if ((i2 & 4) !== 0) {
            i = singleBusinessState.level;
        }
        let i3: number = i;
        if ((i2 & 8) !== 0) {
            bigInteger = singleBusinessState.numberOfBusinessUnits;
        }
        let bigInteger2: BigInteger = bigInteger;
        if ((i2 & 16) !== 0) {
            str2 = singleBusinessState.name;
        }
        let str3: string = str2;
        if ((i2 & 32) !== 0) {
            benefitLevel = singleBusinessState.moraleLevel;
        }
        return singleBusinessState.copy(str, business2, i3, bigInteger2, str3, benefitLevel);
    }
        getId(): string {
        return this.id;
    }
        getType(): Business {
        return this.type;
    }
        getLevel(): number {
        return this.level;
    }
        getNumberOfBusinessUnits(): BigInteger {
        return this.numberOfBusinessUnits;
    }
        getName(): string {
        return this.name;
    }
        getMoraleLevel(): BenefitLevel {
        return this.moraleLevel;
    }
        copy(id: string, type: Business, level: number, numberOfBusinessUnits: BigInteger, name: string, moraleLevel: BenefitLevel): BusinessState.SingleBusinessState {
        Intrinsics.checkParameterIsNotNull(id, "id");
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(numberOfBusinessUnits, "numberOfBusinessUnits");
        Intrinsics.checkParameterIsNotNull(name, "name");
        Intrinsics.checkParameterIsNotNull(moraleLevel, "moraleLevel");
        return new BusinessState.SingleBusinessState(id, type, level, numberOfBusinessUnits, name, moraleLevel);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof BusinessState.SingleBusinessState) {
                let singleBusinessState: BusinessState.SingleBusinessState = (other as unknown as BusinessState.SingleBusinessState);
                if (Intrinsics.areEqual(this.id, singleBusinessState.id) && Intrinsics.areEqual(this.type, singleBusinessState.type)) {
                    if (((!(this.level === singleBusinessState.level) || !Intrinsics.areEqual(this.numberOfBusinessUnits, singleBusinessState.numberOfBusinessUnits)) || !Intrinsics.areEqual(this.name, singleBusinessState.name)) || !Intrinsics.areEqual(this.moraleLevel, singleBusinessState.moraleLevel)) {
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((((((((("SingleBusinessState(id=" + this.id) + ", type=") + this.type) + ", level=") + this.level) + ", numberOfBusinessUnits=") + this.numberOfBusinessUnits) + ", name=") + this.name) + ", moraleLevel=") + this.moraleLevel) + ")";
    }
        setLevel(i: number): void {
        this.level = i;
    }
        setNumberOfBusinessUnits(bigInteger: BigInteger): void {
        Intrinsics.checkParameterIsNotNull(bigInteger, "<set-?>");
        this.numberOfBusinessUnits = bigInteger;
    }
        setName(str: string): void {
        Intrinsics.checkParameterIsNotNull(str, "<set-?>");
        this.name = str;
    }
        setMoraleLevel(benefitLevel: BenefitLevel): void {
        Intrinsics.checkParameterIsNotNull(benefitLevel, "<set-?>");
        this.moraleLevel = benefitLevel;
    }
        getMoraleProgress(): number {
        return this.moraleProgress;
    }
        setMoraleProgress(i: number): void {
        this.moraleProgress = ExtensionsKt.keepWithinRange(i, 0, RelationshipProgressStatus.INSTANCE.getMaxValue());
    }
        getHasIncorporated(): boolean {
        return this.level > 0;
    }
        getMoraleProgressStatus(): RelationshipProgressStatus {
        return RelationshipProgressStatus.INSTANCE.statusFromValue(this.moraleProgress);
    }
        getMaxEmployeeHirable(): BigInteger {
        let j: number = 0;
        let valueOf: BigInteger = BigInteger.valueOf(j);
        if (this.level < Constants.Business.INSTANCE.getMaxLevel()) {
            let valueOf2: BigInteger = BigInteger.valueOf(this.type.upgradeUnitRequirement(this.level + 1));
            valueOf = valueOf2.subtract(this.numberOfBusinessUnits);
        }
        let cash: BigInteger = GameStateManager.INSTANCE.getPersonState().getMoneyState().getCash();
        let valueOf3: BigInteger = BigInteger.valueOf(this.type.unitCostForLevel(this.level));
        let divide: BigInteger = cash.divide(valueOf3);
        let valueOf4: BigInteger = BigInteger.valueOf(j);
        return Intrinsics.areEqual(valueOf, valueOf4) ? divide : Utils.MathExtension.INSTANCE.min(divide, valueOf);
    }
        getBusinessName(): string {
        return this.type.companyTitle(this.level);
    }
        getMoraleRevenueModifier(): number {
        let d: number = this.moraleProgress;
        let maxValue: number = RelationshipProgressStatus.INSTANCE.getMaxValue();
        Double.isNaN(d);
        Double.isNaN(maxValue);
        return (d / maxValue) + 0.5;
    }
        getRevenuePerEmployee(): number {
        let revenueForWeekForLevel: number = this.type.revenueForWeekForLevel(this.level);
        let moraleRevenueModifier: number = this.getMoraleRevenueModifier();
        Double.isNaN(revenueForWeekForLevel);
        return JMath.toInt((revenueForWeekForLevel * moraleRevenueModifier));
    }
        getProfitPerEmployee(): number {
        return this.getRevenuePerEmployee() - this.getSalaryPerEmployeePerWeek();
    }
        getTotalProfit(): BigInteger {
        let valueOf: BigInteger = BigInteger.valueOf(this.getProfitPerEmployee());
        let multiply: BigInteger = valueOf.multiply(this.numberOfBusinessUnits);
        return multiply;
    }
        getSalaryPerEmployeePerWeek(): number {
        let baseSalaryPerWeek: number = this.type.getBaseSalaryPerWeek();
        let d: number = 1;
        let costSalaryModifier: number = this.moraleLevel.getCostSalaryModifier();
        Double.isNaN(d);
        Double.isNaN(baseSalaryPerWeek);
        return JMath.toInt((baseSalaryPerWeek * (d + costSalaryModifier)));
    }
        getTotalCompanyValue(): BigInteger {
        let valueOf: BigInteger = BigInteger.valueOf(0);
        if (this.getHasIncorporated()) {
            let i: number = 1;
            let i2: number = this.level - 1;
            if (1 <= i2) {
                while (true) {
                    valueOf = valueOf.add(this.type.businessUpgradeCostForLevel(i));
                    if (i === i2) {
                        break;
                    }
                    i++;
                }
            }
        }
        let bigInteger: BigInteger = this.numberOfBusinessUnits;
        let valueOf2: BigInteger = BigInteger.valueOf(this.type.unitCostForLevel(this.level));
        let multiply: BigInteger = bigInteger.multiply(valueOf2);
        let add: BigInteger = valueOf.add(multiply);
        return ExtensionsKt.times(add, 0.8);
    }
        sell(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        MoneyState.updateMoney$default(player.getMoneyState(), this.getTotalCompanyValue(), MoneyUpdateType.sell, null, null, 12, null);
        this.level = 0;
        let valueOf: BigInteger = BigInteger.valueOf(0);
        this.numberOfBusinessUnits = valueOf;
        this.setMoraleProgress(Constants.Business.INSTANCE.getDefaultBusinessMorale());
        this.moraleLevel = BenefitLevel.low;
        this.name = this.type.getRandomCompanyName();
    }
    }
    export namespace SingleBusinessState {
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
BusinessState.INSTANCE = new BusinessState.Companion(null);
BusinessState.SingleBusinessState.INSTANCE = new BusinessState.SingleBusinessState.Companion(null);
