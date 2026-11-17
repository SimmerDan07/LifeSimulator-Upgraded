// Creates save files with the CURRENT code, used later to check old saves still load.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Housing } from "../src/game/Enums/Housing";
import { HousingState } from "../src/game/Managers/HousingState";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
import { SaveCodec } from "../src/game/save/SaveCodec";
import fs from "fs";
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const out = process.argv[2];
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.brinkOfBankruptcy);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!);
const p = GameStateManager.INSTANCE.getPersonState();
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(300000000), MoneyUpdateType.workIncome, null, null, 12, null);
HousingState.purchase$default(p.getHousingState(), Housing.house, BigInteger.valueOf(2), 0, null);
HousingState.purchase$default(p.getHousingState(), Housing.apartmentComplex, BigInteger.valueOf(2), 0, null);
p.getHousingState().moveHere(Housing.house);
for (let i = 0; i < 30; i++) { p.applyWeekly(); while (alerts.length) { const a = alerts.shift(); a.getPositiveButton()?.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); } }
fs.writeFileSync(out + "/save-v0.3-landlord.txt", SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
console.log("v0.3 fixture:", p.getFullName(), "cash", p.getMoneyState().getCash().toString(),
  "houses", p.getHousingState().getState(Housing.house).getNumberOwned().toString(), "complexes", p.getHousingState().getState(Housing.apartmentComplex).getNumberOwned().toString(), "living:", p.getHousingState().currentHousing().getType().name());
