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
import { GameStateManager } from "./GameStateManager";
import { Constants } from "../Utils/Constants";
import { SaveCodec } from "../save/SaveCodec";

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
            // v0.31.0: back up your save to a file, and load one (move a life between computers)
            if (UIBridge.canBackUp()) {
                arrayList.add(new SettingsRowViewModel("Back Up Your Save", R.drawable.menu_share, true, true, {
                    invoke: () => SettingsManager.INSTANCE.backUpSave(),
                }));
                arrayList.add(new SettingsRowViewModel("Load a Backup", R.drawable.menu_saves, true, true, {
                    invoke: () => SettingsManager.INSTANCE.loadBackup(),
                }));
            }
            return new GenericListFragmentViewModel(arrayList, arrayList2, arrayList3);
        }
    }
    info(title: string, msg: string, image: any = R.drawable.menu_saves): void {
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null);
    }
    backUpSave(): void {
        const gsm = GameStateManager.INSTANCE;
        try { if (gsm.getGlobalStateManager().getSaveState().getHasGameStarted()) gsm.saveData(); } catch { /* keep going */ }
        const text = UIBridge.readFile(Constants.File.INSTANCE.getSaveFileName());
        if (text == null || text.length === 0) { this.info("Back Up Your Save", "There's nothing saved yet."); return; }
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        let who = "";
        try { who = "-" + gsm.getPersonState().getFullName().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, ""); } catch { /* no life */ }
        const name = `LifeSimulator${who}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.txt`;
        void UIBridge.backUp(name, text).then((r) => {
            if (r === "cancelled") return;
            if (r === "failed") this.info("Back Up Your Save", "The backup couldn't be made on this device.");
            else if (r === "downloads") this.info("Backed Up", `Your save (every save slot) is in your phone's Download folder, in "Life Simulator", as "${name}". It stays there even if you uninstall the game.\n\nTo carry on the same lives on another device (or the Windows game), copy that file over, then open Settings › Load a Backup and pick it.`);
            else if (r === "shared") this.info("Back Up Your Save", `Pick where to keep "${name}" (Drive, email, …). On another device, open Settings › Load a Backup and pick that file to carry on the same lives.`);
            else this.info("Backed Up", `Your save (every save slot) is in the file "${name}".\n\nKeep it somewhere safe. On another device, open Settings › Load a Backup and pick this file to carry on the same lives.`);
        });
    }
    loadBackup(): void {
        void UIBridge.pickFile().then((text) => {
            if (text == null) return;
            let summary = "";
            try {
                const g: any = SaveCodec.decode(text.trim());
                const pl = g.getSaveState().currentSlot().getPersonState();
                if (pl != null) summary = ` of ${pl.getFullName()} (age ${pl.getAgeInYears()})`;
            } catch {
                this.info("Load a Backup", "That file isn't a Life Simulator save.");
                return;
            }
            AlertManager.INSTANCE.showConfirmationAlert(new AlertViewModel("Load a Backup", `Load this backup${summary}? The game on this device is replaced by the backup (all save slots). Back it up first if you want to keep it.`, R.drawable.menu_saves, null, null, null, null, null, null, 504, null), {
                invoke: () => { void UIBridge.replaceSave(Constants.File.INSTANCE.getSaveFileName(), text.trim()); },
            });
        });
    }
    showSaveFolder(): void {
        const dir = UIBridge.saveFolder();
        if (dir == null) {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Save Folder", "This version keeps your saves on this device, inside the app (they stay when you close it). To keep a copy or move a life to another device, use Back Up Your Save. The Windows game saves to Documents\\Life Simulator\\Saves.", R.drawable.menu_saves, null, null, null, null, null, null, 504, null), false, 2, null);
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
                // v0.36.0: the achievements gallery (new and classic)
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, "rm-feats", false, 4, null);
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
