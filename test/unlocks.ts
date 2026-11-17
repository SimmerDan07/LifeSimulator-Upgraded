import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Perk } from "../src/game/Enums/Perk";
import { GameInAppPurchase } from "../src/game/Enums/GameInAppPurchase";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { InAppPurchaseManager } from "../src/game/Managers/InAppPurchaseManager";
import { ButtonViewModel } from "../src/game/Models/ButtonViewModel";
import { PersonAttribute } from "../src/game/Enums/PersonAttribute";
import { SettingsManager } from "../src/game/Managers/SettingsManager";
import { OptionsBarViewModel } from "../src/game/Models/OptionsBarViewModel";
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
const buttons = (vm: any) => { const out: ButtonViewModel[] = []; const walk = (o: any, d = 0) => { if (!o || typeof o !== "object" || d > 5) return; if (o instanceof ButtonViewModel) { out.push(o); return; } for (const v of Object.values(o)) Array.isArray(v) ? v.forEach((x) => walk(x, d + 1)) : walk(v, d + 1); }; walk(vm); return out; };
const check = (name: string, ok: boolean, extra = "") => console.log((ok ? "PASS " : "FAIL ") + name + (extra ? "  (" + extra + ")" : ""));

// scenarios
const scen = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.scenarioSelection, "", false);
const sb = buttons(scen.getContentViewModels());
check("all scenarios choosable", sb.every((b) => !b.getShowLock() && b.getEnabled()), `${sb.length} scenarios, ${sb.filter((b) => b.getShowLock()).length} locked`);
check("sandbox purchased", gsm.getLifeScenarioState().getStates().find((s: any) => s.getType() === LifeScenario.sandboxMode)!.getPurchased());
// perks
const locked = Perk.values().filter((p) => !gsm.getPerkState().isPerkUnlocked(p));
check("all perks unlocked", locked.length === 0, `${Perk.values().length} perks, locked: ${locked.map((p) => p.name()).join(",")}`);
// paid unlocks
const paid = GameInAppPurchase.values().filter((i) => !i.getConsumable() && !gsm.getInappPurchaseState().isPurchased(i));
check("all paid unlocks owned", paid.length === 0, paid.map((p) => p.name()).join(","));
// save slots
const slots = gsm.getSaveState().getSlots();
check("all save slots unlocked", slots.every((s: any) => s.isUnlocked()), `${slots.length} slots`);
// sandbox game start with customize screen
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
const cust = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.customizeGame, "", true);
check("sandbox customize screen", cust.getContentViewModels().length > 0, cust.getContentViewModels().map((c: any) => c.constructor.name).join(","));
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!);
const p = GameStateManager.INSTANCE.getPersonState();
// store removed: no free money or free elixir, no store screen, no social/ads in Settings
const cash0 = p.getMoneyState().getCash();
for (const item of GameInAppPurchase.values()) if (item !== GameInAppPurchase.revive) InAppPurchaseManager.INSTANCE.purchaseProduct(item);
check("money packs give nothing", p.getMoneyState().getCash().compareTo(cash0) === 0, `${cash0} -> ${p.getMoneyState().getCash()}`);
const age0 = p.getAgeInYears();
check("elixir packs give nothing", p.getAgeInYears() === age0);
check("no store screen", typeof (InAppPurchaseManager.INSTANCE as any).getInAppPurchaseViewModel !== "function");
const settings = SettingsManager.INSTANCE.getSettingsViewModel();
const rowTitles = Array.from(settings.getContentViewModels()).map((r: any) => r.getTitle?.() ?? "");
check("settings: no Store / Watch Ad / Leaderboard / Report Bug", !rowTitles.some((t) => /Store|Watch Ad|Leaderboard|Report Bug/i.test(t)), rowTitles.join(", "));
check("settings: no social media bar", !Array.from(settings.getHeaderViewModels()).some((h: any) => h instanceof OptionsBarViewModel));
check("no ad income doubling", !p.getMiscState().isAdDoubleIncomeRewardActive());
// revive after death
p.getAttributeState().setHealth(0); void PersonAttribute;
let death: any = null;
for (let i = 0; i < 300 && !death; i++) {
    while (alerts.length) { const a = alerts.shift(); if (/died/i.test(a.getTitle())) { death = a; break; } AlertManager.INSTANCE.alertDismissed(a); }
    if (death) break;
    (p.getAttributeState() as any).lowAttributeCountdown_health = 10;
    p.getAttributeState().setHealth(0);
    p.applyWeekly();
}
check("died", !!death && !gsm.getSaveState().getHasGameStarted());
const reviveBtn = [death?.getPositiveButton(), death?.getNegativeButton()].find((b: any) => b && /chance|revive/i.test(b.getTitle()));
reviveBtn?.getAction().invoke();
check("free revive brings you back", gsm.getSaveState().getHasGameStarted() && GameStateManager.INSTANCE.getPersonState().getAttributeState().getHealth() > 50, reviveBtn?.getTitle());
AlertManager.INSTANCE.setCurrentlyShowing(false);
