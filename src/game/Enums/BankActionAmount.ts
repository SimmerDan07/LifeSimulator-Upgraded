// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Double, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, StringBuilder } from "../runtime";
import { BankAction } from "./BankAction";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";

export class BankActionAmount extends JEnum {
    static readonly low: BankActionAmount = new BankActionAmount("low", 0);
    static readonly medium: BankActionAmount = new BankActionAmount("medium", 1);
    static readonly high: BankActionAmount = new BankActionAmount("high", 2);
    static values(): BankActionAmount[] { return [BankActionAmount.low, BankActionAmount.medium, BankActionAmount.high]; }
    static valueOf(n: string): BankActionAmount { return (BankActionAmount as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    buttonText(action: BankAction): string {
        Intrinsics.checkParameterIsNotNull(action, "action");
        switch (action) {
            case BankAction.withdrawal:
            case BankAction.deposit:
            case BankAction.takeLoan:
            case BankAction.buyStock:
            case BankAction.sellStock:
                let sb: StringBuilder = new StringBuilder();
                sb.append(this.amountForAction(action));
                sb.append("%");
                return sb.toString();
            case BankAction.buyLottery:
                return String.valueOf(this.amountForAction(action));
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    amountForAction(action: BankAction): number {
        Intrinsics.checkParameterIsNotNull(action, "action");
        switch (action) {
            case BankAction.withdrawal:
            case BankAction.deposit:
            case BankAction.takeLoan:
            case BankAction.buyStock:
            case BankAction.sellStock:
                let i: BankActionAmount = this;
                if (i !== BankActionAmount.low) {
                    if (i === BankActionAmount.medium) {
                        return 25;
                    }
                    if (i === BankActionAmount.high) {
                        return 100;
                    }
                    throw new NoWhenBranchMatchedException();
                }
                return 10;
            case BankAction.buyLottery:
                let i2: BankActionAmount = this;
                if (i2 === BankActionAmount.low) {
                    return 1;
                }
                if (i2 !== BankActionAmount.medium) {
                    if (i2 === BankActionAmount.high) {
                        return 100;
                    }
                    throw new NoWhenBranchMatchedException();
                }
                return 10;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    buttonEnabled(action: BankAction): boolean {
        Intrinsics.checkParameterIsNotNull(action, "action");
        let moneyState: MoneyState = GameStateManager.INSTANCE.getPersonState().getMoneyState();
        let amountForAction: number = this.amountForAction(action);
        Double.isNaN(amountForAction);
        let d: number = amountForAction / 100.0;
        switch (action) {
            case BankAction.withdrawal:
                let times: BigInteger = ExtensionsKt.times(moneyState.getSavings(), d);
                let valueOf: BigInteger = BigInteger.valueOf(0);
                return times.compareTo(valueOf) > 0;
            case BankAction.deposit:
                let times2: BigInteger = ExtensionsKt.times(moneyState.getCash(), d);
                let valueOf2: BigInteger = BigInteger.valueOf(0);
                return times2.compareTo(valueOf2) > 0;
            case BankAction.takeLoan:
                let times3: BigInteger = ExtensionsKt.times(moneyState.getLoanAmountRemaining(), d);
                let valueOf3: BigInteger = BigInteger.valueOf(0);
                return times3.compareTo(valueOf3) > 0;
            case BankAction.buyStock:
                let times4: BigInteger = ExtensionsKt.times(moneyState.getCash(), d);
                let valueOf4: BigInteger = BigInteger.valueOf(JMath.toInt(GameStateManager.INSTANCE.getPersonState().getStockState().getCostPerShare()));
                let divide: BigInteger = times4.divide(valueOf4);
                let valueOf5: BigInteger = BigInteger.valueOf(0);
                return divide.compareTo(valueOf5) > 0;
            case BankAction.sellStock:
                let times5: BigInteger = ExtensionsKt.times(GameStateManager.INSTANCE.getPersonState().getStockState().getSharesOwned(), d);
                let valueOf6: BigInteger = BigInteger.valueOf(0);
                return times5.compareTo(valueOf6) > 0;
            case BankAction.buyLottery:
                let amountForAction2: number = this.amountForAction(action) * Constants.Money.INSTANCE.getLotteryTicketPrice();
                let cash: BigInteger = moneyState.getCash();
                let valueOf7: BigInteger = BigInteger.valueOf(amountForAction2);
                return cash.compareTo(valueOf7) >= 0;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
