// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, BigInteger, CollectionsKt, Intrinsics, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragment } from "../ui/bridge";
import { GenericListType } from "../Fragments/GenericListType";
import { MainGameFragment } from "../ui/bridge";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "./MoneyUpdateType";
import { Player } from "../Managers/Player";
import { Utils } from "../Utils/Utils";

export class GameInAppPurchase extends JEnum {
    static readonly unlockAllPerks: GameInAppPurchase = new GameInAppPurchase("unlockAllPerks", 0);
    static readonly moneyPack1: GameInAppPurchase = new GameInAppPurchase("moneyPack1", 1);
    static readonly moneyPack2: GameInAppPurchase = new GameInAppPurchase("moneyPack2", 2);
    static readonly moneyPack3: GameInAppPurchase = new GameInAppPurchase("moneyPack3", 3);
    static readonly moneyPack4: GameInAppPurchase = new GameInAppPurchase("moneyPack4", 4);
    static readonly moneyPack5: GameInAppPurchase = new GameInAppPurchase("moneyPack5", 5);
    static readonly moneyPack6: GameInAppPurchase = new GameInAppPurchase("moneyPack6", 6);
    static readonly youthPotion1: GameInAppPurchase = new GameInAppPurchase("youthPotion1", 7);
    static readonly youthPotion2: GameInAppPurchase = new GameInAppPurchase("youthPotion2", 8);
    static readonly youthPotion3: GameInAppPurchase = new GameInAppPurchase("youthPotion3", 9);
    static readonly revive: GameInAppPurchase = new GameInAppPurchase("revive", 10);
    static readonly unlockSandboxMode: GameInAppPurchase = new GameInAppPurchase("unlockSandboxMode", 11);
    static readonly unlockAllDestinations: GameInAppPurchase = new GameInAppPurchase("unlockAllDestinations", 12);
    static readonly unlockAllContent: GameInAppPurchase = new GameInAppPurchase("unlockAllContent", 13);
    static readonly unlockSaveSlots: GameInAppPurchase = new GameInAppPurchase("unlockSaveSlots", 14);
    static readonly TESTPRODUCT: GameInAppPurchase = new GameInAppPurchase("TESTPRODUCT", 15);
    static values(): GameInAppPurchase[] { return [GameInAppPurchase.unlockAllPerks, GameInAppPurchase.moneyPack1, GameInAppPurchase.moneyPack2, GameInAppPurchase.moneyPack3, GameInAppPurchase.moneyPack4, GameInAppPurchase.moneyPack5, GameInAppPurchase.moneyPack6, GameInAppPurchase.youthPotion1, GameInAppPurchase.youthPotion2, GameInAppPurchase.youthPotion3, GameInAppPurchase.revive, GameInAppPurchase.unlockSandboxMode, GameInAppPurchase.unlockAllDestinations, GameInAppPurchase.unlockAllContent, GameInAppPurchase.unlockSaveSlots, GameInAppPurchase.TESTPRODUCT]; }
    static valueOf(n: string): GameInAppPurchase { return (GameInAppPurchase as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getSku(): string {
        switch (this) {
            case GameInAppPurchase.unlockAllPerks:
                return "2394875345";
            case GameInAppPurchase.moneyPack1:
                return "6984753975";
            case GameInAppPurchase.moneyPack2:
                return "428947540";
            case GameInAppPurchase.moneyPack3:
                return "5764574934";
            case GameInAppPurchase.moneyPack4:
                return "3987289473";
            case GameInAppPurchase.moneyPack5:
                return "2364754957";
            case GameInAppPurchase.moneyPack6:
                return "8473928374";
            case GameInAppPurchase.youthPotion1:
                return "6509385205";
            case GameInAppPurchase.youthPotion2:
                return "3892347220";
            case GameInAppPurchase.youthPotion3:
                return "1287289347";
            case GameInAppPurchase.revive:
                return "8364574530";
            case GameInAppPurchase.unlockSandboxMode:
                return "7548578434";
            case GameInAppPurchase.unlockAllDestinations:
                return "3985789434";
            case GameInAppPurchase.unlockAllContent:
                return "4835789493";
            case GameInAppPurchase.unlockSaveSlots:
                return "6845784539";
            case GameInAppPurchase.TESTPRODUCT:
                return Constants.Test.INSTANCE.getFakeProductID();
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getTitle(): string {
        switch (this) {
            case GameInAppPurchase.unlockAllPerks:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_AllPerks_Title);
            case GameInAppPurchase.moneyPack1:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack1_Title);
            case GameInAppPurchase.moneyPack2:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack2_Title);
            case GameInAppPurchase.moneyPack3:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack3_Title);
            case GameInAppPurchase.moneyPack4:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack4_Title);
            case GameInAppPurchase.moneyPack5:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack5_Title);
            case GameInAppPurchase.moneyPack6:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack6_Title);
            case GameInAppPurchase.youthPotion1:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_YouthPotion1_Title);
            case GameInAppPurchase.youthPotion2:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_YouthPotion2_Title);
            case GameInAppPurchase.youthPotion3:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_YouthPotion3_Title);
            case GameInAppPurchase.revive:
            case GameInAppPurchase.TESTPRODUCT:
                return "";
            case GameInAppPurchase.unlockSandboxMode:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_UnlockSandboxMode_Title);
            case GameInAppPurchase.unlockAllDestinations:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_UnlockCountryAllTitle);
            case GameInAppPurchase.unlockAllContent:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_AllContent_Title);
            case GameInAppPurchase.unlockSaveSlots:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_UnlockSaveSlots_Title);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case GameInAppPurchase.unlockAllPerks:
                return R.drawable.iap_perk_all;
            case GameInAppPurchase.moneyPack1:
            case GameInAppPurchase.TESTPRODUCT:
                return R.drawable.iap_money1;
            case GameInAppPurchase.moneyPack2:
                return R.drawable.iap_money2;
            case GameInAppPurchase.moneyPack3:
            case GameInAppPurchase.moneyPack4:
            case GameInAppPurchase.moneyPack5:
                return R.drawable.iap_money3;
            case GameInAppPurchase.moneyPack6:
                return R.drawable.iap_money4;
            case GameInAppPurchase.youthPotion1:
                return R.drawable.iap_youthpill;
            case GameInAppPurchase.youthPotion2:
            case GameInAppPurchase.youthPotion3:
                return R.drawable.health_youthelixir;
            case GameInAppPurchase.revive:
                return R.drawable.iap_revive;
            case GameInAppPurchase.unlockSandboxMode:
                return R.drawable.iap_sandbox;
            case GameInAppPurchase.unlockAllDestinations:
                return R.drawable.iap_unlockdestinations;
            case GameInAppPurchase.unlockAllContent:
                return R.drawable.iap_allcontent;
            case GameInAppPurchase.unlockSaveSlots:
                return R.drawable.menu_saves;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDescription(): string {
        switch (this) {
            case GameInAppPurchase.unlockAllPerks:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_AllPerks_Description);
            case GameInAppPurchase.moneyPack1:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack1_Description);
            case GameInAppPurchase.moneyPack2:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack2_Description);
            case GameInAppPurchase.moneyPack3:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack3_Description);
            case GameInAppPurchase.moneyPack4:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack4_Description);
            case GameInAppPurchase.moneyPack5:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack5_Description);
            case GameInAppPurchase.moneyPack6:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_MoneyPack6_Description);
            case GameInAppPurchase.youthPotion1:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_YouthPotion1_Description);
            case GameInAppPurchase.youthPotion2:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_YouthPotion2_Description);
            case GameInAppPurchase.youthPotion3:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_YouthPotion3_Description);
            case GameInAppPurchase.revive:
            case GameInAppPurchase.TESTPRODUCT:
                return "";
            case GameInAppPurchase.unlockSandboxMode:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_UnlockSandboxMode_Description);
            case GameInAppPurchase.unlockAllDestinations:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_UnlockCountryAllDescription);
            case GameInAppPurchase.unlockAllContent:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_AllContent_Description);
            case GameInAppPurchase.unlockSaveSlots:
                return Utils.INSTANCE.getString(R.string.InAppPurchase_Item_UnlockSaveSlots_Description);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getDefaultPrice(): number {
        let d: number = 9.99;
        switch (this) {
            case GameInAppPurchase.unlockAllPerks:
            case GameInAppPurchase.moneyPack2:
            case GameInAppPurchase.youthPotion2:
            case GameInAppPurchase.unlockSandboxMode:
            case GameInAppPurchase.unlockAllDestinations:
            case GameInAppPurchase.unlockSaveSlots:
                return 2.99;
            case GameInAppPurchase.moneyPack1:
            case GameInAppPurchase.youthPotion1:
            case GameInAppPurchase.revive:
                return 0.99;
            case GameInAppPurchase.moneyPack3:
            case GameInAppPurchase.youthPotion3:
                return 4.99;
            case GameInAppPurchase.moneyPack4:
            case GameInAppPurchase.unlockAllContent:
                break;
            case GameInAppPurchase.moneyPack5:
                d = 19.99;
                break;
            case GameInAppPurchase.moneyPack6:
                d = 49.99;
                break;
            case GameInAppPurchase.TESTPRODUCT:
                d = 0.0;
                break;
            default:
                throw new NoWhenBranchMatchedException();
        }
        return d;
    }
    getConsumable(): boolean {
        switch (this) {
            case GameInAppPurchase.moneyPack1:
            case GameInAppPurchase.moneyPack2:
            case GameInAppPurchase.moneyPack3:
            case GameInAppPurchase.moneyPack4:
            case GameInAppPurchase.moneyPack5:
            case GameInAppPurchase.moneyPack6:
            case GameInAppPurchase.youthPotion1:
            case GameInAppPurchase.youthPotion2:
            case GameInAppPurchase.youthPotion3:
            case GameInAppPurchase.revive:
                return true;
            default:
                return false;
        }
    }
    getMoneyRewardAmount(): number {
        switch (this) {
            case GameInAppPurchase.moneyPack1:
                return 50000;
            case GameInAppPurchase.moneyPack2:
                return 250000;
            case GameInAppPurchase.moneyPack3:
                return 2000000;
            case GameInAppPurchase.moneyPack4:
                return 10000000;
            case GameInAppPurchase.moneyPack5:
                return 50000000;
            case GameInAppPurchase.moneyPack6:
                return 1000000000;
            default:
                return 0;
        }
    }
    applyPurchase(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        if (this.getConsumable()) {
            if (this.getMoneyRewardAmount() > 0) {
                let moneyState: MoneyState = player.getMoneyState();
                let valueOf: BigInteger = BigInteger.valueOf(this.getMoneyRewardAmount());
                MoneyState.updateMoney$default(moneyState, valueOf, MoneyUpdateType.workIncome, null, null, 12, null);
            }
            let i: GameInAppPurchase = this;
            if (i === GameInAppPurchase.youthPotion1) {
                player.setAgeInWeeks(player.getAgeInWeeks() - (Constants.Time.INSTANCE.getWeeksPerYear() * 10));
                return;
            }
            if (i === GameInAppPurchase.youthPotion2) {
                player.setAgeInWeeks(player.getAgeInWeeks() - (Constants.Time.INSTANCE.getWeeksPerYear() * 30));
                return;
            }
            if (i === GameInAppPurchase.youthPotion3) {
                player.setAgeInWeeks(Constants.Time.INSTANCE.getWeeksPerYear() * 18);
                return;
            }
            if (i !== GameInAppPurchase.revive) {
                return;
            }
            if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) {
                GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().setHasGameStarted(true);
                GameStateManager.INSTANCE.getPersonState().getAttributeState().maxOutAttribute();
            } else {
                let currentlyShowingGenericList: GenericListFragment = GameStateManager.INSTANCE.getCurrentlyShowingGenericList();
                if ((currentlyShowingGenericList != null) && (currentlyShowingGenericList.getListType() === GenericListType.gameSummary)) {
                    let pastLives: ArrayList<Player> = GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().getPastLives();
                    let arrayList: ArrayList = new ArrayList();
                    for (const obj of pastLives) {
                        if (Intrinsics.areEqual(((obj as unknown as Player)).getId(), currentlyShowingGenericList.getListKey())) {
                            arrayList.add(obj);
                        }
                    }
                    let player2: Player = (CollectionsKt.first((arrayList as unknown as ArrayList)) as unknown as Player);
                    GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().currentSlot().setPersonState(player2);
                    player2.getAttributeState().maxOutAttribute();
                    GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().removeLife(player2.getId());
                    Utils.INSTANCE.navigationBackToMainGame();
                }
            }
            GameStateManager.INSTANCE.saveData();
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
    }
}
export namespace GameInAppPurchase {
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
        getGetAllStoreProducts(): GameInAppPurchase[] {
        return [GameInAppPurchase.unlockSandboxMode, GameInAppPurchase.unlockAllPerks, GameInAppPurchase.unlockAllDestinations, GameInAppPurchase.unlockSaveSlots, GameInAppPurchase.unlockAllContent, GameInAppPurchase.moneyPack1, GameInAppPurchase.moneyPack2, GameInAppPurchase.moneyPack3, GameInAppPurchase.moneyPack4, GameInAppPurchase.moneyPack5, GameInAppPurchase.moneyPack6, GameInAppPurchase.youthPotion1, GameInAppPurchase.youthPotion2, GameInAppPurchase.youthPotion3];
    }
    }
}
GameInAppPurchase.INSTANCE = new GameInAppPurchase.Companion(null);
