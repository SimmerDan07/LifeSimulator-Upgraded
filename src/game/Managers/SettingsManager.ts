// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { UIBridge } from "../ui/bridge";
import { ArrayList, Buglife, ContextCompat, Intrinsics, MapsKt, R, TuplesKt, TypeCastException } from "../runtime";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { ImageButtonViewModel } from "../Models/ImageButtonViewModel";
import { MainApplication } from "../ui/bridge";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { OptionsBarViewModel } from "../Models/OptionsBarViewModel";
import { SettingRow } from "./SettingRow";
import { SettingsRowViewModel } from "../Models/SettingsRowViewModel";
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
        // Removed in this edition: social media bar, Store, Watch Ad, Google leaderboard and bug reporter.
        const removed = [SettingRow.store, SettingRow.watchAd, SettingRow.leaderboard, SettingRow.reportBug];
        {
            for (const settingRow of SettingRow.values().filter((r) => !removed.includes(r))) {
                arrayList.add(new SettingsRowViewModel(settingRow.getTitle(), settingRow.getImageId(), settingRow.getHasChevron(), settingRow.isEnabled(), {
                    invoke: () => {
                    SettingsManager.INSTANCE.handleRowTap(settingRow);
                }
                }));
            }
            // v0.18.0: where your saves are (Documents\Life Simulator\Saves on Windows)
            arrayList.add(new SettingsRowViewModel("Save Folder", R.drawable.menu_saves, true, true, {
                invoke: () => SettingsManager.INSTANCE.showSaveFolder(),
            }));
            return new GenericListFragmentViewModel(arrayList, arrayList2, arrayList3);
        }
    }
    showSaveFolder(): void {
        const dir = UIBridge.saveFolder();
        if (dir == null) {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Save Folder", "This version keeps your save in the browser. The Windows game saves to Documents\\Life Simulator\\Saves.", R.drawable.menu_saves, null, null, null, null, null, null, 504, null), false, 2, null);
            return;
        }
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Save Folder", `Your saves are in:\n${dir}\n\nCopy this folder to back up your game.`, R.drawable.menu_saves, null, null,
            new AlertActionViewModel("Open Folder", { invoke: () => { UIBridge.openSaveFolder(); return null; } }),
            new AlertActionViewModel("Close", { invoke: () => null }),
            new ArrayList(), AlertType.Alert, 0, null), false, 2, null);
    }
    handleRowTap(settingsRow: SettingRow): void {
        Intrinsics.checkParameterIsNotNull(settingsRow, "settingsRow");
        TelemetryManager.INSTANCE.logEvent("SettingOptionTapped", MapsKt.mapOf(TuplesKt.to("Option", settingsRow.getTitle())));
        switch (settingsRow) {
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
            case SettingRow.credit:
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.credits, null, false, 6, null);
                break;
        }
    }
}
