// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Integer, JEnum, JMath, NoWhenBranchMatchedException, R, SpannableStringBuilder } from "../runtime";
import { AgeLimits } from "../Managers/Schooling";
import { CompletableAction } from "./CompletableAction";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { StockState } from "../Managers/StockState";
import { Utils } from "../Utils/Utils";

export class BankAction extends JEnum {
    static readonly withdrawal: BankAction = new BankAction("withdrawal", 0);
    static readonly deposit: BankAction = new BankAction("deposit", 1);
    static readonly takeLoan: BankAction = new BankAction("takeLoan", 2);
    static readonly buyStock: BankAction = new BankAction("buyStock", 3);
    static readonly sellStock: BankAction = new BankAction("sellStock", 4);
    static readonly buyLottery: BankAction = new BankAction("buyLottery", 5);
    static values(): BankAction[] { return [BankAction.withdrawal, BankAction.deposit, BankAction.takeLoan, BankAction.buyStock, BankAction.sellStock, BankAction.buyLottery]; }
    static valueOf(n: string): BankAction { return (BankAction as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case BankAction.withdrawal:
                return Utils.INSTANCE.getString(R.string.Bank_Action_Withdrawal);
            case BankAction.deposit:
                return Utils.INSTANCE.getString(R.string.Bank_Action_Deposit);
            case BankAction.takeLoan:
                return Utils.INSTANCE.getString(R.string.Bank_Action_Loan);
            case BankAction.buyStock:
                return Utils.INSTANCE.getString(R.string.Bank_Action_BuyStock);
            case BankAction.sellStock:
                return Utils.INSTANCE.getString(R.string.Bank_Action_SellStock);
            case BankAction.buyLottery:
                return Utils.INSTANCE.getString(R.string.Bank_Action_Lottery);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case BankAction.withdrawal:
                return R.drawable.bank_withdrawal;
            case BankAction.deposit:
                return R.drawable.bank_deposit;
            case BankAction.takeLoan:
                return R.drawable.bank_loan;
            case BankAction.buyStock:
            case BankAction.sellStock:
                return R.drawable.skill_personalfinance;
            case BankAction.buyLottery:
                return R.drawable.bank_lottery;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getLockedString(): string {
        let i: BankAction = this;
        if (i === BankAction.takeLoan || i === BankAction.buyStock || i === BankAction.sellStock || i === BankAction.buyLottery) {
            const tooYoung = AgeLimits.tooYoung(AgeLimits.adultStuff);
            if (tooYoung != null) return tooYoung;
        }
        if (((i === BankAction.buyStock) || (i === BankAction.sellStock)) && !GameStateManager.INSTANCE.getPersonState().getCompletableActionState().isCompleted(CompletableAction.personalFinance)) {
            return Utils.Strings.INSTANCE.getRequiresString(CompletableAction.personalFinance.getTitle());
        }
        return null;
    }
    getSubtitle(): SpannableStringBuilder {
        switch (this) {
            case BankAction.withdrawal:
                return null;
            case BankAction.deposit:
                return ExtensionsKt.appendBold$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Bank_Label_Interest) + ": ", null, null, null, 14, null), ((JMath.toInt(GameStateManager.INSTANCE.getPersonState().getMoneyState().getEffectiveInterestRate())) + "%/") + Utils.INSTANCE.getString(R.string.common_years), R.color.flatGreen, null, null, 12, null);
            case BankAction.takeLoan:
                return ExtensionsKt.appendBold$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Bank_Label_Interest) + ": ", null, null, null, 14, null), ((JMath.toInt(GameStateManager.INSTANCE.getPersonState().getMoneyState().getEffectiveLoanInterestRate())) + "%/") + Utils.INSTANCE.getString(R.string.common_years), R.color.flatRed, null, null, 12, null);
            case BankAction.buyStock:
                let percentChangeSinceLastWeek: number = GameStateManager.INSTANCE.getPersonState().getStockState().getPercentChangeSinceLastWeek();
                return ExtensionsKt.appendBold$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Stock_Label_WeekChange) + ": ", null, null, null, 14, null), ExtensionsKt.formatWithDecimals(percentChangeSinceLastWeek, 2) + "%", Integer.valueOf(ExtensionsKt.displayColor(percentChangeSinceLastWeek)), null, null, 12, null);
            case BankAction.sellStock:
                return ExtensionsKt.appendBold$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Stock_Label_TotalValue) + ": ", null, null, null, 14, null), ExtensionsKt.numberDisplayString$default(GameStateManager.INSTANCE.getPersonState().getStockState().getTotalValue(), false, 1, null), R.color.flatGreen, null, null, 12, null);
            case BankAction.buyLottery:
                return ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (ExtensionsKt.numberDisplayString$default(Constants.Money.INSTANCE.getLotteryTicketPrice(), false, 1, null) + " ") + Utils.INSTANCE.getString(R.string.Common_Each), null, null, null, 14, null);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDecorator(): SpannableStringBuilder {
        let moneyState: MoneyState = GameStateManager.INSTANCE.getPersonState().getMoneyState();
        let stockState: StockState = GameStateManager.INSTANCE.getPersonState().getStockState();
        switch (this) {
            case BankAction.withdrawal:
                return ExtensionsKt.appendBold$default(new SpannableStringBuilder(), ExtensionsKt.numberDisplayString$default(moneyState.getSavings(), false, 1, null), R.color.flatGreen, null, null, 12, null);
            case BankAction.deposit:
                return ExtensionsKt.appendBold$default(new SpannableStringBuilder(), ExtensionsKt.numberDisplayString$default(moneyState.getCash(), false, 1, null), R.color.flatGreen, null, null, 12, null);
            case BankAction.takeLoan:
                return ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (ExtensionsKt.numberDisplayString$default(moneyState.getLoanAmountRemaining(), false, 1, null) + "/") + ExtensionsKt.numberDisplayString$default(moneyState.getLoanLimit(), false, 1, null), null, null, null, 14, null);
            case BankAction.buyStock:
                return ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (ExtensionsKt.numberDisplayString$default(JMath.toInt(stockState.getCostPerShare()), false, 1, null) + "/") + Utils.INSTANCE.getString(R.string.Stock_Label_PerShare), null, null, null, 14, null);
            case BankAction.sellStock:
                return ExtensionsKt.appendBold$default(new SpannableStringBuilder(), (ExtensionsKt.numberDisplayString(stockState.getSharesOwned(), false) + " ") + Utils.INSTANCE.getString(R.string.Stock_Label_Shares), null, null, null, 14, null);
            case BankAction.buyLottery:
                return null;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
