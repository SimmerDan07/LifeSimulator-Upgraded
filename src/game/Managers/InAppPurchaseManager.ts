// Store for the free edition: no payments. Consumables (money packs, youth potions, revive) are
// claimed for free; unlock packs show as owned. Behaviour follows Unlocks.removePaywall.
import { ArrayList } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import type { BaseViewModel } from "../Models/BaseViewModel";
import { Utils } from "../Utils/Utils";
import { Unlocks } from "../Unlocks";
import { MainGameFragment } from "../ui/bridge";

export class InAppPurchaseManager {
    static INSTANCE: InAppPurchaseManager;

    getInAppPurchaseViewModel(): GenericListFragmentViewModel {
        const content = new ArrayList<BaseViewModel>();
        const header = new ArrayList<BaseViewModel>();
        header.add(new NavigationBarViewModel(Utils.INSTANCE.getString("Common_Store"), false, 2, null));
        const states = GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState();
        for (const item of GameInAppPurchase.INSTANCE.getGetAllStoreProducts()) {
            const owned = !item.getConsumable() && states.isPurchased(item);
            const label = owned ? "Unlocked" : Unlocks.removePaywall ? "Claim free" : "Unavailable";
            content.add(new ActionCellSingleViewModel(item.getImageId(), item.getTitle(),
                new TextLabelViewModel(item.getDescription(), null, false, false, null, null, 62, null),
                new ButtonViewModel(label, null, !owned && Unlocks.removePaywall, false, false, true, false,
                    { invoke: () => this.purchaseProduct(item) }, 122, null), null, null, 48, null));
        }
        return new GenericListFragmentViewModel(content, header, new ArrayList());
    }

    /** Grants a store item immediately (free edition). */
    purchaseProduct(item: GameInAppPurchase, ..._rest: any[]): void {
        if (!Unlocks.removePaywall) { this.purchasesUnavailable(); return; }
        const states = GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState();
        if (item.getConsumable()) {
            item.applyPurchase(GameStateManager.INSTANCE.getPersonState());
            const f = GameStateManager.INSTANCE.getMainGameFragment();
            if (f != null) MainGameFragment.updateUI$default(f, null, 1, null);
        } else {
            states.getState(item).setPurchased(true);
            Utils.INSTANCE.reloadGenericList(GenericListType.store);
        }
        GameStateManager.INSTANCE.saveData();
    }
    static purchaseProduct$default(m: InAppPurchaseManager, item: GameInAppPurchase, ..._a: any[]): void { m.purchaseProduct(item); }
    restorePurchase(): void {}

    purchasesUnavailable(): void {
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(
            "Store unavailable", "Purchases are switched off in this build.",
            null, null, null, null, null, null, null, 504, null), false, 2, null);
    }
}
InAppPurchaseManager.INSTANCE = new InAppPurchaseManager();
