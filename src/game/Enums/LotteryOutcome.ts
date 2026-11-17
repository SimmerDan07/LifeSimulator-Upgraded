// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { IProbableEvent } from "./IProbableEvent";
import { Utils } from "../Utils/Utils";

export class LotteryOutcome extends JEnum implements IProbableEvent {
    static readonly noWinning: LotteryOutcome = new LotteryOutcome("noWinning", 0);
    static readonly smallPrize: LotteryOutcome = new LotteryOutcome("smallPrize", 1);
    static readonly mediumPrize: LotteryOutcome = new LotteryOutcome("mediumPrize", 2);
    static readonly jackpot: LotteryOutcome = new LotteryOutcome("jackpot", 3);
    static values(): LotteryOutcome[] { return [LotteryOutcome.noWinning, LotteryOutcome.smallPrize, LotteryOutcome.mediumPrize, LotteryOutcome.jackpot]; }
    static valueOf(n: string): LotteryOutcome { return (LotteryOutcome as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getReward(): number {
        let i: LotteryOutcome = this;
        if (i === LotteryOutcome.noWinning) {
            return 0;
        }
        if (i === LotteryOutcome.smallPrize) {
            return 100;
        }
        if (i === LotteryOutcome.mediumPrize) {
            return 10000;
        }
        if (i === LotteryOutcome.jackpot) {
            return Utils.Random.INSTANCE.randomValueWithinRange(1000000, 10000000);
        }
        throw new NoWhenBranchMatchedException();
    }
    getRelativeProbability(): number {
        let i: LotteryOutcome = this;
        if (i === LotteryOutcome.noWinning) {
            return 1660000;
        }
        if (i === LotteryOutcome.smallPrize) {
            return 130000;
        }
        if (i === LotteryOutcome.mediumPrize) {
            return 1500;
        }
        if (i === LotteryOutcome.jackpot) {
            return 10;
        }
        throw new NoWhenBranchMatchedException();
    }
    getTitle(): string {
        let i: LotteryOutcome = this;
        if (i === LotteryOutcome.noWinning) {
            return Utils.INSTANCE.getString(R.string.Lottery_Title_NoWinning);
        }
        if (i === LotteryOutcome.smallPrize) {
            return Utils.INSTANCE.getString(R.string.Lottery_Title_Small);
        }
        if (i === LotteryOutcome.mediumPrize) {
            return Utils.INSTANCE.getString(R.string.Lottery_Title_Medium);
        }
        if (i === LotteryOutcome.jackpot) {
            return Utils.INSTANCE.getString(R.string.Lottery_Title_Jackpot);
        }
        throw new NoWhenBranchMatchedException();
    }
}
