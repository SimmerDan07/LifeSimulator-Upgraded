// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { AdManager } from "./AdManager";
import { GameStateManager } from "./GameStateManager";
import { Utils } from "../Utils/Utils";

export class SettingRow extends JEnum {
    static readonly help: SettingRow = new SettingRow("help", 0);
    static readonly lifeGoal: SettingRow = new SettingRow("lifeGoal", 1);
    static readonly badges: SettingRow = new SettingRow("badges", 2);
    static readonly leaderboard: SettingRow = new SettingRow("leaderboard", 3);
    static readonly restart: SettingRow = new SettingRow("restart", 4);
    static readonly store: SettingRow = new SettingRow("store", 5);
    static readonly watchAd: SettingRow = new SettingRow("watchAd", 6);
    static readonly saveSlot: SettingRow = new SettingRow("saveSlot", 7);
    static readonly cemetery: SettingRow = new SettingRow("cemetery", 8);
    static readonly reportBug: SettingRow = new SettingRow("reportBug", 9);
    static readonly credit: SettingRow = new SettingRow("credit", 10);
    static readonly settings: SettingRow = new SettingRow("settings", 11);
    static values(): SettingRow[] { return [SettingRow.help, SettingRow.lifeGoal, SettingRow.badges, SettingRow.leaderboard, SettingRow.restart, SettingRow.store, SettingRow.watchAd, SettingRow.saveSlot, SettingRow.cemetery, SettingRow.reportBug, SettingRow.credit, SettingRow.settings]; }
    static valueOf(n: string): SettingRow { return (SettingRow as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case SettingRow.help:
                return Utils.INSTANCE.getString(R.string.Menu_Help_Title);
            case SettingRow.lifeGoal:
                return Utils.INSTANCE.getString(R.string.Menu_Help_Achievements);
            case SettingRow.badges:
                return Utils.INSTANCE.getString(R.string.Menu_Leaderboard_Badges);
            case SettingRow.restart:
                return Utils.INSTANCE.getString(R.string.Menu_Help_RestartGame);
            case SettingRow.store:
                return Utils.INSTANCE.getString(R.string.Common_Store);
            case SettingRow.watchAd:
                return Utils.INSTANCE.getString(R.string.Menu_WatchAd);
            case SettingRow.saveSlot:
                return Utils.INSTANCE.getString(R.string.Menu_SaveSlots);
            case SettingRow.cemetery:
                return Utils.INSTANCE.getString(R.string.Menu_Cemetery);
            case SettingRow.reportBug:
                return Utils.INSTANCE.getString(R.string.Menu_Leaderboard_ReportBug);
            case SettingRow.settings:
                return Utils.INSTANCE.getString(R.string.Menu_Help_Settings);
            case SettingRow.leaderboard:
                return Utils.INSTANCE.getString(R.string.Menu_Leaderboard_Title);
            case SettingRow.credit:
                return Utils.INSTANCE.getString(R.string.Menu_Help_Credits);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case SettingRow.help:
                return R.drawable.menu_help;
            case SettingRow.lifeGoal:
                return R.drawable.menu_achievement;
            case SettingRow.badges:
                return R.drawable.menu_badge;
            case SettingRow.restart:
                return R.drawable.menu_restart;
            case SettingRow.store:
                return R.drawable.hud_iap;
            case SettingRow.watchAd:
                return R.drawable.menu_watchad;
            case SettingRow.saveSlot:
                return R.drawable.menu_saves;
            case SettingRow.cemetery:
                return R.drawable.menu_coffin;
            case SettingRow.reportBug:
                return R.drawable.menu_bug;
            case SettingRow.settings:
                return R.drawable.settings_black;
            case SettingRow.leaderboard:
                return R.drawable.menu_leaderboard;
            case SettingRow.credit:
                return R.drawable.menu_credits;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    isEnabled(): boolean {
        if (this === SettingRow.watchAd) {
            return AdManager.INSTANCE.isReadyToShow() && !GameStateManager.INSTANCE.getPersonState().getMiscState().isAdDoubleIncomeRewardActive();
        }
        return true;
    }
    getHasChevron(): boolean {
        switch (this) {
            case SettingRow.restart:
            case SettingRow.reportBug:
            case SettingRow.watchAd:
            case SettingRow.leaderboard:
                return false;
            case SettingRow.help:
            case SettingRow.lifeGoal:
            case SettingRow.badges:
            case SettingRow.store:
            case SettingRow.saveSlot:
            case SettingRow.cemetery:
            case SettingRow.settings:
            case SettingRow.credit:
                return true;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
