// There is no app store on desktop. Store items stay unavailable rather than being granted
// for free; the store screen explains this.
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";

export class InAppPurchaseManager {
    static INSTANCE: InAppPurchaseManager;
    getInAppPurchaseViewModel(..._a: any[]): any { return null; }
    purchaseProduct(..._a: any[]): void { this.purchasesUnavailable(); }
    static purchaseProduct$default(m: InAppPurchaseManager, ..._a: any[]): void { m.purchasesUnavailable(); }
    purchasesUnavailable(): void {
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(
            "Store unavailable",
            "In-app purchases aren't available in the desktop version.",
            null, null, null, null, null, null, null, 504, null), false, 2, null);
    }
}
InAppPurchaseManager.INSTANCE = new InAppPurchaseManager();
