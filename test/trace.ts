import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); },
    readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
GameStateManager.INSTANCE.init();
GameStateManager.INSTANCE.setMainGameFragment(new M());
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.values()[0]);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!);
const p = GameStateManager.INSTANCE.getPersonState();
const a = p.getAttributeState();
console.log("scenario:", LifeScenario.values()[0].name(), "diet:", p.getDiet().name(), "housing:", p.getHousingState().getCurrentHousing?.()?.name?.());
for (let w = 0; w < 60; w++) {
    const d = p.collectWeeklyAttributeDeltas();
    if (w % 4 === 0) console.log(`wk${w} age ${p.getAgeInYears()} H ${a.getHealth().toFixed(1)} Hap ${a.getHappiness().toFixed(1)} San ${a.getSanity().toFixed(1)} | weekly delta H ${d.getHealth().toFixed(2)} Hap ${d.getHappiness().toFixed(2)} San ${d.getSanity().toFixed(2)} | cash ${p.getMoneyState().getCash()}`);
    p.applyWeekly();
    while (alerts.length) { const vm = alerts.shift(); if (w % 4 === 0) console.log("   alert:", vm.getTitle()); vm.getPositiveButton()?.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(vm); }
    if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) { console.log("DIED at week", w); break; }
}
