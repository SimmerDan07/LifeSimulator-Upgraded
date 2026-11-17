// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Double, Intrinsics, JMath } from "../runtime";
import { CompletableAction } from "../Enums/CompletableAction";
import { GameStateManager } from "./GameStateManager";
import { Perk } from "../Enums/Perk";
import { Utils } from "../Utils/Utils";

export class StockState {
    static INSTANCE: any;
    costPerShare: number = 0;
    previousWeekCost: number = 0;
    sharesOwned: BigInteger = null;
    constructor() {
        let valueOf: BigInteger = BigInteger.valueOf(0);
        this.sharesOwned = valueOf;
        this.costPerShare = 100.0;
        this.previousWeekCost = 100.0;
    }
    getSharesOwned(): BigInteger {
        return this.sharesOwned;
    }
    setSharesOwned(bigInteger: BigInteger): void {
        Intrinsics.checkParameterIsNotNull(bigInteger, "<set-?>");
        this.sharesOwned = bigInteger;
    }
    getCostPerShare(): number {
        return this.costPerShare;
    }
    setCostPerShare(d: number): void {
        this.costPerShare = d;
    }
    getPreviousWeekCost(): number {
        return this.previousWeekCost;
    }
    setPreviousWeekCost(d: number): void {
        this.previousWeekCost = d;
    }
    getTotalValue(): BigInteger {
        let bigInteger: BigInteger = this.sharesOwned;
        let valueOf: BigInteger = BigInteger.valueOf(JMath.toInt(this.costPerShare));
        let multiply: BigInteger = bigInteger.multiply(valueOf);
        return multiply;
    }
    getPercentChangeSinceLastWeek(): number {
        let d: number = this.costPerShare;
        let d2: number = (d - this.previousWeekCost) / d;
        let d3: number = 100;
        Double.isNaN(d3);
        return d2 * d3;
    }
    incrementWeek(): void {
        this.previousWeekCost = this.costPerShare;
        let randomValueWithinRange: number = Utils.Random.INSTANCE.randomValueWithinRange(StockState.INSTANCE.getMaxWeeklyDecrease(), StockState.INSTANCE.getMaxWeeklyIncrease());
        Double.isNaN(randomValueWithinRange);
        this.costPerShare *= (randomValueWithinRange / 1000.0) + 1.0;
    }
}
export namespace StockState {
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
        getMaxWeeklyDecrease(): number {
        return -20;
    }
        getMaxWeeklyIncrease(): number {
        let i: number = GameStateManager.INSTANCE.getPersonState().getCompletableActionState().isCompleted(CompletableAction.investmentStrategies) ? 23 : 22;
        return GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.lucky) ? (i + 1) : i;
    }
    }
}
StockState.INSTANCE = new StockState.Companion(null);
