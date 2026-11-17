// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, BigInteger, Double, Intrinsics, Pair } from "../runtime";
import { CompletableAction } from "../Enums/CompletableAction";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "./GameStateManager";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Perk } from "../Enums/Perk";
import { Player } from "./Player";

export class MoneyState {
    static INSTANCE: any;
    cash: BigInteger = null;
    cashDeltaThisWeek: ArrayList<Pair<string, BigInteger>> = null;
    loanLimitUsed: BigInteger = null;
    lowMoneyCountDown: number = 0;
    savings: BigInteger = null;
    savingsDeltaThisWeek: ArrayList<Pair<string, BigInteger>> = null;
    $init0(cash: BigInteger, savings: BigInteger): void {
        Intrinsics.checkParameterIsNotNull(cash, "cash");
        Intrinsics.checkParameterIsNotNull(savings, "savings");
        this.cashDeltaThisWeek = new ArrayList();
        this.savingsDeltaThisWeek = new ArrayList();
        this.cash = cash;
        this.savings = savings;
        let valueOf: BigInteger = BigInteger.valueOf(0);
        this.loanLimitUsed = valueOf;
    }
    $init1(i: number, i2: number): void {
        this.cashDeltaThisWeek = new ArrayList();
        this.savingsDeltaThisWeek = new ArrayList();
        let valueOf: BigInteger = BigInteger.valueOf(i);
        this.cash = valueOf;
        let valueOf2: BigInteger = BigInteger.valueOf(i2);
        this.savings = valueOf2;
        let valueOf3: BigInteger = BigInteger.valueOf(0);
        this.loanLimitUsed = valueOf3;
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 2 && (a[0] == null || a[0] instanceof BigInteger) && (a[1] == null || a[1] instanceof BigInteger)) return (this as any).$init0(...a);
        if (a.length === 2 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (typeof a[1] === 'number' || typeof a[1] === 'string')) return (this as any).$init1(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    static cashDeltaThisWeek$annotations(): void {
    }
    static savingsDeltaThisWeek$annotations(): void {
    }
    getCash(): BigInteger {
        return this.cash;
    }
    getSavings(): BigInteger {
        return this.savings;
    }
    getLoanLimit(): BigInteger {
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        if (personState.getCompletableActionState().getHasACollegeDegree()) {
            let valueOf: BigInteger = BigInteger.valueOf(250000);
            return valueOf;
        }
        if (personState.getCompletableActionState().isCompleted(CompletableAction.highSchool)) {
            let valueOf2: BigInteger = BigInteger.valueOf(80000);
            return valueOf2;
        }
        let valueOf3: BigInteger = BigInteger.valueOf(25000);
        return valueOf3;
    }
    getLoanLimitUsed(): BigInteger {
        return this.loanLimitUsed;
    }
    setLoanLimitUsed(bigInteger: BigInteger): void {
        Intrinsics.checkParameterIsNotNull(bigInteger, "<set-?>");
        this.loanLimitUsed = bigInteger;
    }
    getLowMoneyCountDown(): number {
        return this.lowMoneyCountDown;
    }
    setLowMoneyCountDown(i: number): void {
        this.lowMoneyCountDown = i;
    }
    getBankruptcyLimit(): BigInteger {
        let loanLimit: BigInteger = this.getLoanLimit();
        let valueOf: BigInteger = BigInteger.valueOf(2);
        let multiply: BigInteger = loanLimit.multiply(valueOf);
        return multiply;
    }
    getEffectiveInterestRate(): number {
        let baseInterestRate: number = Constants.Money.INSTANCE.getBaseInterestRate();
        if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.goodCreditScore)) {
            baseInterestRate += Perk.INSTANCE.getGoodCreditScoreExtraInterest();
        }
        if (!GameStateManager.INSTANCE.getPersonState().hasSkill(CompletableAction.financialLiteracy)) {
            return baseInterestRate;
        }
        let financialLiteracyInterestIncrease: number = Constants.Skill.INSTANCE.getFinancialLiteracyInterestIncrease();
        Double.isNaN(financialLiteracyInterestIncrease);
        return baseInterestRate + financialLiteracyInterestIncrease;
    }
    getEffectiveLoanInterestRate(): number {
        return Constants.Money.INSTANCE.getBaseLoanInterestRate();
    }
    getLoanAmountRemaining(): BigInteger {
        let subtract: BigInteger = this.getLoanLimit().subtract(this.loanLimitUsed);
        return subtract;
    }
    getTotalAsset(): BigInteger {
        let add: BigInteger = this.cash.add(this.savings);
        return add;
    }
    static updateMoney$default(moneyState: MoneyState, bigInteger: BigInteger, moneyUpdateType: MoneyUpdateType, str: string, moneyDestination: MoneyDestination, i: number, obj: any): void {
        if ((i & 4) !== 0) {
            str = null;
        }
        if ((i & 8) !== 0) {
            moneyDestination = MoneyDestination.cash;
        }
        moneyState.updateMoney(bigInteger, moneyUpdateType, str, moneyDestination);
    }
    updateMoney(amount: BigInteger, type: MoneyUpdateType, key: string, destination: MoneyDestination): void {
        Intrinsics.checkParameterIsNotNull(amount, "amount");
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(destination, "destination");
        let j: number = 0;
        let valueOf: BigInteger = BigInteger.valueOf(j);
        if (Intrinsics.areEqual(amount, valueOf)) {
            return;
        }
        if ((type === MoneyUpdateType.directSpend) || (type === MoneyUpdateType.expense)) {
            let valueOf2: BigInteger = BigInteger.valueOf(j);
            if (amount.compareTo(valueOf2) > 0) {
                let valueOf3: BigInteger = BigInteger.valueOf(-1);
                amount = amount.multiply(valueOf3);
            }
        }
        if ((((type === MoneyUpdateType.directSpend) || (type === MoneyUpdateType.sell)) || (type === MoneyUpdateType.workIncome)) || (type === MoneyUpdateType.misc)) {
            let i: MoneyDestination = destination;
            if (i === MoneyDestination.cash) {
                let add: BigInteger = this.cash.add(amount);
                this.cash = add;
                return;
            } else {
                if (i !== MoneyDestination.savings) {
                    return;
                }
                let add2: BigInteger = this.savings.add(amount);
                this.savings = add2;
                return;
            }
        }
        if ((type === MoneyUpdateType.passiveIncome) || (type === MoneyUpdateType.expense)) {
            let i2: MoneyDestination = destination;
            if (i2 === MoneyDestination.cash) {
                this.cashDeltaThisWeek.add(new Pair(key, amount));
            } else {
                if (i2 !== MoneyDestination.savings) {
                    return;
                }
                this.savingsDeltaThisWeek.add(new Pair(key, amount));
            }
        }
    }
    applyThisWeekValues(): void {
        let bigInteger: BigInteger = this.cash;
        let arrayList: ArrayList<Pair<string, BigInteger>> = this.cashDeltaThisWeek;
        let arrayList2: ArrayList = new ArrayList();
        let it = arrayList.iterator();
        while (it.hasNext()) {
            arrayList2.add((((it.next() as unknown as Pair)).getSecond() as unknown as BigInteger));
        }
        let j: number = 0;
        let valueOf: BigInteger = BigInteger.valueOf(j);
        let it2 = arrayList2.iterator();
        while (it2.hasNext()) {
            valueOf = valueOf.add((it2.next() as unknown as BigInteger));
        }
        let add: BigInteger = bigInteger.add(valueOf);
        this.cash = add;
        let bigInteger2: BigInteger = this.savings;
        let arrayList3: ArrayList<Pair<string, BigInteger>> = this.savingsDeltaThisWeek;
        let arrayList4: ArrayList = new ArrayList();
        let it3 = arrayList3.iterator();
        while (it3.hasNext()) {
            arrayList4.add((((it3.next() as unknown as Pair)).getSecond() as unknown as BigInteger));
        }
        let valueOf2: BigInteger = BigInteger.valueOf(j);
        let it4 = arrayList4.iterator();
        while (it4.hasNext()) {
            valueOf2 = valueOf2.add((it4.next() as unknown as BigInteger));
        }
        let add2: BigInteger = bigInteger2.add(valueOf2);
        this.savings = add2;
        this.resetWeekValues();
        let totalAsset: BigInteger = this.getTotalAsset();
        let bankruptcyLimit: BigInteger = this.getBankruptcyLimit();
        let valueOf3: BigInteger = BigInteger.valueOf(1);
        let negate: BigInteger = valueOf3.negate();
        let multiply: BigInteger = bankruptcyLimit.multiply(negate);
        if (totalAsset.compareTo(multiply) <= 0) {
            this.lowMoneyCountDown++;
        } else {
            this.lowMoneyCountDown = 0;
        }
    }
    getWeeklyDelta(): ArrayList<Pair<string, BigInteger>> {
        let arrayList: ArrayList<Pair<string, BigInteger>> = new ArrayList();
        arrayList.addAll(this.cashDeltaThisWeek);
        arrayList.addAll(this.savingsDeltaThisWeek);
        return arrayList;
    }
    resetWeekValues(): void {
        this.cashDeltaThisWeek.clear();
        this.savingsDeltaThisWeek.clear();
    }
    initializeWithValues(cash: number, savings: number): void {
        let valueOf: BigInteger = BigInteger.valueOf(cash);
        this.cash = valueOf;
        let valueOf2: BigInteger = BigInteger.valueOf(savings);
        this.savings = valueOf2;
    }
}
export namespace MoneyState {
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
MoneyState.INSTANCE = new MoneyState.Companion(null);
