// New-game customization: typed names must survive refreshes and later choices.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { CustomizeTextFieldViewModel } from "../src/game/Models/CustomizeTextFieldViewModel";
import { CustomizeOptionsViewModel } from "../src/game/Models/CustomizeOptionsViewModel";
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert() {}, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
const gen = () => GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.customizeGame, "", true).getContentViewModels();
let cells: any[] = Array.from(gen());
const fields = () => cells.filter((c) => c instanceof CustomizeTextFieldViewModel).map((c: any) => c.getEditTextViewModel());
fields()[0].getTextChangedHandler().invoke("Danny"); fields()[1].getTextChangedHandler().invoke("Karadeem");
cells = Array.from(gen());
check("boxes show typed names after a refresh", fields()[0].initialText === "Danny" && fields()[1].initialText === "Karadeem");
const sexes = cells.find((c) => c instanceof CustomizeOptionsViewModel) as any;
for (const o of sexes.getOptionsViewModels()) { o.getOnSelected().invoke(); cells = Array.from(gen()); }
const np = GameStateManager.INSTANCE.getNewGamePlayerState()!;
check("choosing a sex keeps the typed first name", np.getFirstName() === "Danny" && np.getLastName() === "Karadeem", np.getFullName());
fields()[0].getTextChangedHandler().invoke("   ");
check("clearing the box doesn't make a blank name", np.getFirstName().trim().length > 0);
GameStateManager.INSTANCE.startNewGame(np);
check("game starts with the typed name", GameStateManager.INSTANCE.getPersonState().getLastName() === "Karadeem");
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
