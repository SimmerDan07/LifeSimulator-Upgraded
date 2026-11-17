// Ads removed in the desktop version. Rewarded ads grant their reward immediately.
import type { Function0 } from "../runtime";
export class AdManager {
    static INSTANCE: AdManager;
    isReadyToShow(): boolean { return true; }
    showAd(..._args: any[]): void {
        for (const a of _args) if (a && typeof a.invoke === "function") { a.invoke(); return; }
    }
    loadAd(): void {}
}
AdManager.INSTANCE = new AdManager();
export type _F = Function0;
