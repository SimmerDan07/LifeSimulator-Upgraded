// Health tab: Assisted Dying.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { HealthModelGenerator } from "../src/game/Controllers/HealthModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { ButtonViewModel } from "../src/game/Models/ButtonViewModel";
import { BigInteger } from "../src/game/runtime";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { MoneyState } from "../src/game/Managers/MoneyState";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Health; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const buttons = (vm: any) => { const out: ButtonViewModel[] = []; const seen = new Set(); const walk = (o: any, d = 0) => { if (!o || typeof o !== "object" || d > 6 || seen.has(o)) return; seen.add(o); if (o instanceof ButtonViewModel) { out.push(o); return; } for (const v of Object.values(o)) Array.isArray(v) ? v.forEach((x) => walk(x, d + 1)) : walk(v, d + 1); }; walk(vm); return out; };
const healthText = () => JSON.stringify(new HealthModelGenerator().getHealthViewModels(), (k, v) => (typeof v === "bigint" ? v.toString() : v));
const assistedButton = () => buttons(new HealthModelGenerator().getHealthViewModels()).find((b) => /10/.test(b.getTitle()) && /Assisted Dying/.test(healthText()));
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };

// a child doesn't see it
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.youngChild);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear();
check("not offered to under-18s", !/Assisted Dying/.test(healthText()), "age " + GameStateManager.INSTANCE.getPersonState().getAgeInYears());

// an adult does
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.oldMan);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear();
const p = GameStateManager.INSTANCE.getPersonState();
check("offered in the Health tab", /Assisted Dying/.test(healthText()));
const btn = buttons(new HealthModelGenerator().getHealthViewModels()).find((b) => b.getTitle() === "$10K");
check("priced at $10K", !!btn, buttons(new HealthModelGenerator().getHealthViewModels()).map((b) => b.getTitle()).join(", "));

// not enough cash
MoneyState.updateMoney$default(p.getMoneyState(), p.getMoneyState().getCash().negate().add(BigInteger.valueOf(500)), MoneyUpdateType.misc, null, null, 12, null);
btn!.getAction().invoke();
check("refused without enough cash", alerts.length === 1 && /enough cash/.test(alerts[0].getMessage()) && gsm.getSaveState().getHasGameStarted());
clear();

// cancel
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(100000), MoneyUpdateType.workIncome, null, null, 12, null);
const kid = new Person(Relationship.child, Sex.female, p.getLastName(), 48 * 20 + 3); kid.setFirstName("Ava");
p.getFamilyState().getFamilyMembers().add(kid);
btn!.getAction().invoke();
const confirm = alerts.shift();
check("asks to confirm", !!confirm && /Are you sure/.test(confirm.getMessage()));
confirm.getNegativeButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(confirm);
check("cancel keeps you alive", gsm.getSaveState().getHasGameStarted());

// confirm
const cash0 = p.getMoneyState().getCash().doubleValue();
btn!.getAction().invoke();
const c2 = alerts.shift(); c2.getPositiveButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(c2);
const death = alerts.find((a) => /passed away peacefully/.test(a.getMessage() ?? ""));
check("life ends with a death pop-up", !!death && !gsm.getSaveState().getHasGameStarted(), death?.getMessage());
check("charged $10,000", Math.round(cash0 - p.getMoneyState().getCash().doubleValue()) === 10000);
check("added to the cemetery", gsm.getCemetaryState().getPastLives().some((x: any) => x.getId() === p.getId()));
const cont = (death?.getAdditionalButtons() ?? []).find((b: any) => /child/i.test(b.getTitle()));
check("can continue as your child", !!cont);
cont.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(death);
buttons(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.chooseHeir, "", false).getContentViewModels()).find((b) => /Ava/.test(b.getTitle()))?.getAction().invoke();
check("now playing the heir", GameStateManager.INSTANCE.getPersonState().getFirstName() === "Ava" && gsm.getSaveState().getHasGameStarted());

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
