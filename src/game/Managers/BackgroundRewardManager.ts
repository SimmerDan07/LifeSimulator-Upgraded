// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Arrays, BigInteger, JMath, R, Ref, StringCompanionObject } from "../runtime";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { BackgroundRewardState } from "./BackgroundRewardState";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "./GameStateManager";
import { JobState } from "./JobState";
import { MainGameFragment } from "../ui/bridge";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Utils } from "../Utils/Utils";

export class BackgroundRewardManager {
    static INSTANCE: BackgroundRewardManager = new BackgroundRewardManager();
    constructor() {

    }
    showBackgroundRewardIfRequired(): void {
        let str: string;
        let currentUnixTimestamp: number = Utils.Time.INSTANCE.currentUnixTimestamp();
        let backgroundRewardState: BackgroundRewardState = GameStateManager.INSTANCE.getGlobalStateManager().getBackgroundRewardState();
        let min: number = Math.min((Constants.Time.INSTANCE.getMaxBackgroundIncomeRewardInDays() * 60) * 24, JMath.idiv((currentUnixTimestamp - ((backgroundRewardState != null) ? backgroundRewardState.getLastAppActiveTimeUnix() : Utils.Time.INSTANCE.currentUnixTimestamp())), 60));
        let intRef: Ref.IntRef = new Ref.IntRef();
        intRef.element = 0;
        let currentJobState: JobState.JobStateSingle = GameStateManager.INSTANCE.getPersonState().getJobState().getCurrentJobState();
        if (currentJobState != null) {
            intRef.element = JMath.toInt((currentJobState.getSalaryRange().getMin() * Constants.Time.INSTANCE.getIncomeMultiplePerBackgroundMinute()));
            str = currentJobState.getJobTitle();
        } else {
            str = "";
        }
        if ((intRef.element < 500) || (min <= 5)) {
            return;
        }
        let alertManager: AlertManager = AlertManager.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Alert_DoubleBackgroundIncomeTitle);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_DoubleBackgroundIncomeMessage);
        let objArr = [ExtensionsKt.numberDisplayString$default(intRef.element, false, 1, null), str];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, R.drawable.iap_money1, {
            invoke: () => {
            let moneyState: MoneyState = GameStateManager.INSTANCE.getPersonState().getMoneyState();
            let valueOf: BigInteger = BigInteger.valueOf(intRef.element);
            MoneyState.updateMoney$default(moneyState, valueOf, MoneyUpdateType.workIncome, null, null, 12, null);
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }), false, 2, null);
    }
    appWillTerminate(): void {
        let backgroundRewardState: BackgroundRewardState = GameStateManager.INSTANCE.getGlobalStateManager().getBackgroundRewardState();
        if (backgroundRewardState != null) {
            backgroundRewardState.setLastAppActiveTimeUnix(Utils.Time.INSTANCE.currentUnixTimestamp());
        }
    }
}
