// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { AlertViewModel } from "./AlertViewModel";
import { Constants } from "../Utils/Constants";
import { Player } from "./Player";
import { Utils } from "../Utils/Utils";

export class AdRewards extends JEnum {
    static readonly doubleIncomeForAYear: AdRewards = new AdRewards("doubleIncomeForAYear", 0);
    static values(): AdRewards[] { return [AdRewards.doubleIncomeForAYear]; }
    static valueOf(n: string): AdRewards { return (AdRewards as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    applyReward(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        if (this !== AdRewards.doubleIncomeForAYear) {
            return;
        }
        player.getMiscState().setAdRewardDoubleIncomeWeeksLeft(Constants.Time.INSTANCE.getWeeksPerYear());
    }
    getRewardSuccessAlert(): AlertViewModel {
        if (this === AdRewards.doubleIncomeForAYear) {
            return new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_AdCompleteTitle), Utils.INSTANCE.getString(R.string.Alert_AdCompleteMessageDoubleIncome), R.drawable.iap_money1, null, null, null, null, null, null, 504, null);
        }
        throw new NoWhenBranchMatchedException();
    }
}
