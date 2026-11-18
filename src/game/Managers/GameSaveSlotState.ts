// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Appearance } from "../Social/Appearance";
import { Unlocks } from "../Unlocks";
import { ArrayList, Arrays, Integer, Intrinsics, JEnum, MapsKt, NoWhenBranchMatchedException, R, SpannableStringBuilder, StringCompanionObject, TuplesKt, TypeCastException } from "../runtime";
import { Achievement } from "../Enums/Achievement";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { GameStateManager } from "./GameStateManager";
import { GenericListType } from "../Fragments/GenericListType";
import { Player } from "./Player";
import { TelemetryManager } from "./TelemetryManager";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";

export class GameSaveSlotState {
    static INSTANCE: any;
    currentSlotId: number = 0;
    hasGameStarted: boolean = false;
    slots: GameSaveSlotState.SingleSaveSlotState[] = null;
    constructor() {
        let player: Player = null;
        let i: number = 4;
        let defaultConstructorMarker = null;
        this.slots = [new GameSaveSlotState.SingleSaveSlotState(0, GameSaveSlotState.SaveSlotUnlockType.initiallyUnlocked, null, 4, null), new GameSaveSlotState.SingleSaveSlotState(1, GameSaveSlotState.SaveSlotUnlockType.initiallyUnlocked, null, 4, null), new GameSaveSlotState.SingleSaveSlotState(2, GameSaveSlotState.SaveSlotUnlockType.achievement_highAchiever, player, i, defaultConstructorMarker), new GameSaveSlotState.SingleSaveSlotState(3, GameSaveSlotState.SaveSlotUnlockType.inappPurchase, player, i, defaultConstructorMarker), new GameSaveSlotState.SingleSaveSlotState(4, GameSaveSlotState.SaveSlotUnlockType.inappPurchase, player, i, defaultConstructorMarker), new GameSaveSlotState.SingleSaveSlotState(5, GameSaveSlotState.SaveSlotUnlockType.inappPurchase, player, i, defaultConstructorMarker)];
        this.currentSlotId = 0;
        this.hasGameStarted = false;
    }
    getSlots(): GameSaveSlotState.SingleSaveSlotState[] {
        return this.slots;
    }
    getCurrentSlotId(): number {
        return this.currentSlotId;
    }
    setCurrentSlotId(i: number): void {
        this.currentSlotId = i;
    }
    getHasGameStarted(): boolean {
        return this.hasGameStarted;
    }
    setHasGameStarted(z: boolean): void {
        this.hasGameStarted = z;
    }
    getSlot(id: number): GameSaveSlotState.SingleSaveSlotState {
        return this.slots[id];
    }
    currentSlot(): GameSaveSlotState.SingleSaveSlotState {
        return this.getSlot(this.currentSlotId);
    }
    switchSlot(slotId: number): void {
        this.currentSlotId = slotId;
        if (this.currentSlot().getPersonState() == null) {
            this.currentSlot().setPersonState(Player.INSTANCE.newPerson());
        }
    }
}
export namespace GameSaveSlotState {
    export class SaveSlotUnlockType extends JEnum {
        static readonly initiallyUnlocked: SaveSlotUnlockType = new SaveSlotUnlockType("initiallyUnlocked", 0);
        static readonly achievement_highAchiever: SaveSlotUnlockType = new SaveSlotUnlockType("achievement_highAchiever", 1);
        static readonly inappPurchase: SaveSlotUnlockType = new SaveSlotUnlockType("inappPurchase", 2);
        static values(): SaveSlotUnlockType[] { return [SaveSlotUnlockType.initiallyUnlocked, SaveSlotUnlockType.achievement_highAchiever, SaveSlotUnlockType.inappPurchase]; }
        static valueOf(n: string): SaveSlotUnlockType { return (SaveSlotUnlockType as any)[n]; }
        constructor(name: string, ordinal: number) { super(name, ordinal); }
    }
    export class Companion {
        $init0(): void {
    }
        $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 1) return (this as any).$init1(...a);
            if (a.length === 0) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
    }
    export class SingleSaveSlotState {
        static INSTANCE: any;
        personState: Player = null;
        slotId: number = 0;
        unlockType: GameSaveSlotState.SaveSlotUnlockType = null;
        $init0(i: number, unlockType: GameSaveSlotState.SaveSlotUnlockType, player: Player): void {
        Intrinsics.checkParameterIsNotNull(unlockType, "unlockType");
        this.slotId = i;
        this.unlockType = unlockType;
        this.personState = player;
    }
        $init1(i: number, saveSlotUnlockType: GameSaveSlotState.SaveSlotUnlockType, player: Player, i2: number, defaultConstructorMarker: any): void {
        this.$init(i, saveSlotUnlockType, ((i2 & 4) !== 0) ? null : player);
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 5 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof GameSaveSlotState.SaveSlotUnlockType) && (a[2] == null || a[2] instanceof Player) && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init1(...a);
            if (a.length === 3 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof GameSaveSlotState.SaveSlotUnlockType) && (a[2] == null || a[2] instanceof Player)) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        getSlotId(): number {
        return this.slotId;
    }
        getUnlockType(): GameSaveSlotState.SaveSlotUnlockType {
        return this.unlockType;
    }
        getPersonState(): Player {
        return this.personState;
    }
        setPersonState(player: Player): void {
        this.personState = player;
    }
        isUnlocked(): boolean {
        let i: GameSaveSlotState.SaveSlotUnlockType = this.unlockType;
        if (i === GameSaveSlotState.SaveSlotUnlockType.initiallyUnlocked) {
            return true;
        }
        if (i === GameSaveSlotState.SaveSlotUnlockType.achievement_highAchiever && Unlocks.unlockProgression) {
            return true;
        }
        if (i === GameSaveSlotState.SaveSlotUnlockType.achievement_highAchiever) {
            return GameStateManager.INSTANCE.getGlobalStateManager().getAchievementState().isAchievementComplete(Achievement.highAchiever);
        }
        if (i === GameSaveSlotState.SaveSlotUnlockType.inappPurchase) {
            return GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockAllContent) || GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockSaveSlots);
        }
        throw new NoWhenBranchMatchedException();
    }
        getViewModel(): BaseViewModel {
        let valueOf: string = String.valueOf(this.slotId);
        if (!this.isUnlocked()) {
            let string: string = Utils.INSTANCE.getString(R.string.Common_Locked);
            let string2: string = Utils.INSTANCE.getString(R.string.Perks_Unlock_InAppPurchase);
            if (this.unlockType === GameSaveSlotState.SaveSlotUnlockType.achievement_highAchiever) {
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string3: string = Utils.INSTANCE.getString(R.string.SaveSlots_UnlockAchievement);
                let objArr = [Achievement.highAchiever.getTitle()];
                string2 = String.format(string3, Arrays.copyOf(objArr, objArr.length));
            }
            return new ActionCellSingleViewModel(R.drawable.locked, string, new TextLabelViewModel(string2, null, false, false, null, null, 62, null), ButtonViewModel.INSTANCE.getHidden(), null, valueOf, 16, null);
        }
        let player: Player = this.personState;
        if (player != null) {
            let imageId: any = Appearance.head(player);
            let fullName: string = player.getFullName();
            let z: boolean = GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getCurrentSlotId() === this.slotId;
            if (z) {
                fullName = ((fullName + " (") + Utils.INSTANCE.getString(R.string.Common_Current)) + ")";
            }
            let appendNormal$default: SpannableStringBuilder = ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.identity_name_age), String.valueOf(player.getAgeInYears())), null, null, null, 14, null)), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.DeathSummaryNetWorth), ExtensionsKt.numberDisplayString$default(player.getNetWorth(), false, 1, null)), null, null, null, 14, null)), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.ProfileStatus_LifeScenario), player.getLifeScenario().getTitle()), null, null, null, 14, null);
            let arrayList: ArrayList = new ArrayList();
            if (!z) {
                arrayList.add(new ButtonViewModel(Utils.INSTANCE.getString(R.string.Common_Resume), null, false, false, false, false, false, {
                    invoke: () => {
                    TelemetryManager.INSTANCE.logEvent("SaveSlotAction", MapsKt.mapOf(TuplesKt.to("Type", "Resume")));
                    GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().switchSlot(this.getSlotId());
                    Utils.INSTANCE.reloadGenericList(GenericListType.saveSlots);
                }
                }, 126, null));
                arrayList.add(new ButtonViewModel(Utils.INSTANCE.getString(R.string.Common_Delete), null, false, false, false, false, false, {
                    invoke: () => {
                    AlertManager.INSTANCE.showConfirmationAlert(new AlertViewModel(Utils.INSTANCE.getString(R.string.Common_AreYouSure), Utils.INSTANCE.getString(R.string.Alert_DeleteSaveSlot_Message), R.drawable.redx, null, null, null, null, null, null, 504, null), {
                        invoke: () => {
                        TelemetryManager.INSTANCE.logEvent("SaveSlotAction", MapsKt.mapOf(TuplesKt.to("Type", "Delete")));
                        this.setPersonState(null);
                        Utils.INSTANCE.reloadGenericList(GenericListType.saveSlots);
                    }
                    });
                }
                }, 126, null));
            }
            let valueOf2: number = Integer.valueOf(imageId);
            let textLabelViewModel: TextLabelViewModel = new TextLabelViewModel(appendNormal$default, false, false, null, 14, null);
            let hidden: TextLabelViewModel = TextLabelViewModel.INSTANCE.getHidden();
            let array = arrayList.toArray(new Array(0).fill(null));
            if (array != null) {
                return new ActionCellMultipleOptionsViewModel(valueOf2, fullName, textLabelViewModel, hidden, (array as unknown as ButtonViewModel[]), valueOf);
            }
            throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
        }
        let singleSaveSlotState: GameSaveSlotState.SingleSaveSlotState = this;
        return new ActionCellMultipleOptionsViewModel(R.drawable.sperm, Utils.INSTANCE.getString(R.string.Common_EmptySlot), new TextLabelViewModel(Utils.INSTANCE.getString(R.string.SaveSlots_StartLifeToSwitchToSlot), null, false, false, null, null, 62, null), TextLabelViewModel.INSTANCE.getHidden(), [new ButtonViewModel(Utils.INSTANCE.getString(R.string.SaveSlotButtons_NewLife), null, false, false, false, false, false, {
            invoke: () => {
            TelemetryManager.INSTANCE.logEvent("SaveSlotAction", MapsKt.mapOf(TuplesKt.to("Type", "New Life")));
            GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().setHasGameStarted(false);
            Utils.INSTANCE.triggerNewGameStart();
            GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().switchSlot(this.getSlotId());
        }
        }, 126, null)], valueOf);
    }
    }
    export namespace SingleSaveSlotState {
        export class Companion {
            $init0(): void {
    }
            $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
            constructor(...args: any[]) {
                this.$init(...args);
            }
            $init(...a: any[]): any {
                if (a.length === 1) return (this as any).$init1(...a);
                if (a.length === 0) return (this as any).$init0(...a);
                throw new Error('no overload for $init with ' + a.length + ' args');
            }
        }
    }
}
GameSaveSlotState.INSTANCE = new GameSaveSlotState.Companion(null);
GameSaveSlotState.SingleSaveSlotState.INSTANCE = new GameSaveSlotState.SingleSaveSlotState.Companion(null);
