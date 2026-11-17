import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { PersonAttribute } from "../src/game/Enums/PersonAttribute";
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert() {}, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
for (const sc of LifeScenario.values()) {
    try {
        GameStateManager.INSTANCE.startNewGameFlow(sc);
        GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!);
        const p = GameStateManager.INSTANCE.getPersonState();
        p.collectWeeklyValues();
        const parts: string[] = [];
        for (const at of PersonAttribute.values()) for (const pr of p.getAttributeState().getDeltaThisWeek(at)) if (pr.getSecond()) parts.push(`${at.name()}:${pr.getFirst()}=${pr.getSecond()}`);
        p.resetValuesThisWeek();
        console.log(sc.name().padEnd(22), "age", p.getAgeInYears(), "diet", p.getDiet().name(), "|", parts.join("  "));
    } catch (e: any) { console.log(sc.name(), "ERR", e.message); }
}
