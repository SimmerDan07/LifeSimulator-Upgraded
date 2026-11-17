import { GameStateManager } from "./GameStateManager";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { MainGameFragment } from "../ui/bridge";

// The store has been removed from this edition. Content it used to sell (sandbox, perks, destinations,
// save slots, "all content") is simply unlocked (see Unlocks.ts); money packs and Elixir of Youth packs
// no longer exist. Only the free Revive on the death / bankruptcy pop-ups still goes through here.

export class InAppPurchaseManager {
    static INSTANCE: InAppPurchaseManager;

    /** Only Revive is still available (free). Everything else that used to be sold is ignored. */
    purchaseProduct(item: GameInAppPurchase, ..._rest: any[]): void {
        if (item !== GameInAppPurchase.revive) return;
        item.applyPurchase(GameStateManager.INSTANCE.getPersonState());
        const f = GameStateManager.INSTANCE.getMainGameFragment();
        if (f != null) MainGameFragment.updateUI$default(f, null, 1, null);
        GameStateManager.INSTANCE.saveData();
    }
    static purchaseProduct$default(m: InAppPurchaseManager, item: GameInAppPurchase, ..._a: any[]): void { m.purchaseProduct(item); }
    restorePurchase(): void {}
}
InAppPurchaseManager.INSTANCE = new InAppPurchaseManager();
