// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Buglife, ContextCompat, Intrinsics, MapsKt, R, TuplesKt, TypeCastException } from "../runtime";
import { AdManager } from "./AdManager";
import { AdRewards } from "./AdRewards";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { GoogleLeaderboardManager } from "./GoogleLeaderboardManager";
import { ImageButtonViewModel } from "../Models/ImageButtonViewModel";
import { MainApplication } from "../ui/bridge";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { OptionsBarViewModel } from "../Models/OptionsBarViewModel";
import { SettingRow } from "./SettingRow";
import { SettingsRowViewModel } from "../Models/SettingsRowViewModel";
import { SocialBarItem } from "./SocialBarItem";
import { TelemetryManager } from "./TelemetryManager";
import { Utils } from "../Utils/Utils";

export class SettingsManager {
    static INSTANCE: SettingsManager = new SettingsManager();
    constructor() {

    }
    getSettingsViewModel(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        let arrayList2: ArrayList = new ArrayList();
        let arrayList3: ArrayList = new ArrayList();
        arrayList2.add(new NavigationBarViewModel(Utils.INSTANCE.getString(R.string.Menu_Help_Settings), false, 2, null));
        let arrayList4: ArrayList = new ArrayList();
        for (const socialBarItem of SocialBarItem.values()) {
            arrayList4.add(new ImageButtonViewModel(true, false, socialBarItem.getImageId(), {
                invoke: () => {
                SettingsManager.INSTANCE.handleSocialTap(socialBarItem);
            }
            }));
        }
        let array = arrayList4.toArray(new Array(0).fill(null));
        if (array != null) {
            arrayList2.add(new OptionsBarViewModel((array as unknown as ImageButtonViewModel[])));
            for (const settingRow of SettingRow.values()) {
                arrayList.add(new SettingsRowViewModel(settingRow.getTitle(), settingRow.getImageId(), settingRow.getHasChevron(), settingRow.isEnabled(), {
                    invoke: () => {
                    SettingsManager.INSTANCE.handleRowTap(settingRow);
                }
                }));
            }
            return new GenericListFragmentViewModel(arrayList, arrayList2, arrayList3);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    handleSocialTap(socialBarItem: SocialBarItem): void {
        Intrinsics.checkParameterIsNotNull(socialBarItem, "socialBarItem");
        TelemetryManager.INSTANCE.logEvent("SettingsSocialButtonTapped", MapsKt.mapOf(TuplesKt.to("Option", socialBarItem.getDescription())));
        ContextCompat.startActivity(MainApplication.INSTANCE.applicationContext(), socialBarItem.getIntent(), null);
    }
    handleRowTap(settingsRow: SettingRow): void {
        Intrinsics.checkParameterIsNotNull(settingsRow, "settingsRow");
        TelemetryManager.INSTANCE.logEvent("SettingOptionTapped", MapsKt.mapOf(TuplesKt.to("Option", settingsRow.getTitle())));
        switch (settingsRow) {
            case SettingRow.reportBug:
                Buglife.showReporter();
                break;
            case SettingRow.store:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.store, null, false, 6, null);
                break;
            case SettingRow.restart:
                AlertManager.INSTANCE.showConfirmationAlert(new AlertViewModel(Utils.INSTANCE.getString(R.string.Common_AreYouSure), Utils.INSTANCE.getString(R.string.Alert_Restart_Descrption), R.drawable.menu_restart, null, null, null, null, null, null, 504, null), {
                    invoke: () => {
                    Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.scenarioSelection, null, false, 6, null);
                }
                });
                break;
            case SettingRow.badges:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.badgeList, null, false, 6, null);
                break;
            case SettingRow.lifeGoal:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.achivementList, null, false, 6, null);
                break;
            case SettingRow.saveSlot:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.saveSlots, null, false, 6, null);
                break;
            case SettingRow.settings:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.gameSettings, null, false, 6, null);
                break;
            case SettingRow.cemetery:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.cemetery, null, false, 6, null);
                break;
            case SettingRow.help:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.help, null, false, 6, null);
                break;
            case SettingRow.leaderboard:
                GoogleLeaderboardManager.INSTANCE.showLeaderboard();
                break;
            case SettingRow.credit:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.credits, null, false, 6, null);
                break;
            case SettingRow.watchAd:
                if (AdManager.INSTANCE.isReadyToShow()) {
                    AdManager.INSTANCE.showAd(AdRewards.doubleIncomeForAYear, "Settings");
                    break;
                }
                break;
        }
    }
}
