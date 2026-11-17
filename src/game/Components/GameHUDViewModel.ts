// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Double, Intrinsics } from "../runtime";

export class GameHUDViewModel {
    ageInYears: number = 0;
    attr_happiness_progress: number = 0;
    attr_health_progress: number = 0;
    attr_sanity_progress: number = 0;
    bankAmount: BigInteger = null;
    cashAmount: BigInteger = null;
    monthString: string = null;
    weekProgress: number = 0;
    constructor(d: number, d2: number, d3: number, cashAmount: BigInteger, bankAmount: BigInteger, i: number, monthString: string, i2: number) {
        Intrinsics.checkParameterIsNotNull(cashAmount, "cashAmount");
        Intrinsics.checkParameterIsNotNull(bankAmount, "bankAmount");
        Intrinsics.checkParameterIsNotNull(monthString, "monthString");
        this.attr_health_progress = d;
        this.attr_happiness_progress = d2;
        this.attr_sanity_progress = d3;
        this.cashAmount = cashAmount;
        this.bankAmount = bankAmount;
        this.ageInYears = i;
        this.monthString = monthString;
        this.weekProgress = i2;
    }
    getAttr_health_progress(): number {
        return this.attr_health_progress;
    }
    getAttr_happiness_progress(): number {
        return this.attr_happiness_progress;
    }
    getAttr_sanity_progress(): number {
        return this.attr_sanity_progress;
    }
    getCashAmount(): BigInteger {
        return this.cashAmount;
    }
    getBankAmount(): BigInteger {
        return this.bankAmount;
    }
    getAgeInYears(): number {
        return this.ageInYears;
    }
    getMonthString(): string {
        return this.monthString;
    }
    getWeekProgress(): number {
        return this.weekProgress;
    }
    copy(attr_health_progress: number, attr_happiness_progress: number, attr_sanity_progress: number, cashAmount: BigInteger, bankAmount: BigInteger, ageInYears: number, monthString: string, weekProgress: number): GameHUDViewModel {
        Intrinsics.checkParameterIsNotNull(cashAmount, "cashAmount");
        Intrinsics.checkParameterIsNotNull(bankAmount, "bankAmount");
        Intrinsics.checkParameterIsNotNull(monthString, "monthString");
        return new GameHUDViewModel(attr_health_progress, attr_happiness_progress, attr_sanity_progress, cashAmount, bankAmount, ageInYears, monthString, weekProgress);
    }
    equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof GameHUDViewModel) {
                let gameHUDViewModel: GameHUDViewModel = (other as unknown as GameHUDViewModel);
                if (((((Double.compare(this.attr_health_progress, gameHUDViewModel.attr_health_progress) === 0) && (Double.compare(this.attr_happiness_progress, gameHUDViewModel.attr_happiness_progress) === 0)) && (Double.compare(this.attr_sanity_progress, gameHUDViewModel.attr_sanity_progress) === 0)) && Intrinsics.areEqual(this.cashAmount, gameHUDViewModel.cashAmount)) && Intrinsics.areEqual(this.bankAmount, gameHUDViewModel.bankAmount)) {
                    if ((this.ageInYears === gameHUDViewModel.ageInYears) && Intrinsics.areEqual(this.monthString, gameHUDViewModel.monthString)) {
                        if (this.weekProgress === gameHUDViewModel.weekProgress) {
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
    toString(): string {
        return ((((((((((((((("GameHUDViewModel(attr_health_progress=" + this.attr_health_progress) + ", attr_happiness_progress=") + this.attr_happiness_progress) + ", attr_sanity_progress=") + this.attr_sanity_progress) + ", cashAmount=") + this.cashAmount) + ", bankAmount=") + this.bankAmount) + ", ageInYears=") + this.ageInYears) + ", monthString=") + this.monthString) + ", weekProgress=") + this.weekProgress) + ")";
    }
}
