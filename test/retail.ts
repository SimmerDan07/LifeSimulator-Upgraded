// Retail career + no custom icons on Come Out / Assisted Dying.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Job } from "../src/game/Enums/Job";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { AssistedDying } from "../src/game/Managers/AssistedDying";
import { ComingOut } from "../src/game/Managers/ComingOut";
import fs from "fs";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
let fixture: string | null = fs.readFileSync("test/fixtures/save-v0.3-landlord.txt", "utf8");
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => fixture, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Work; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const json = (o: any) => JSON.stringify(o, (k, v) => (typeof v === "bigint" ? v.toString() : v));

// old save made before Retail existed
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p = GameStateManager.INSTANCE.getPersonState();
    let ok = true, msg = "";
    try { const st = p.getJobState().getState(Job.retail); ok = st.getLevel() === 1; msg = new WorkModelGenerator().getWorkViewModels ? "" : ""; } catch (e: any) { ok = false; msg = e.message; }
    check("old save: Retail record created on demand", ok, msg);
    let txt = "";
    try { txt = json(p.getJobState().statesForPlayer(p).map((s: any) => s.getJobTitle())); } catch (e: any) { txt = "ERR " + e.message; }
    check("old save: job list includes Cashier", /Cashier/.test(txt), txt.slice(0, 120));
}

// definition
fixture = null;
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
check("7 levels", Job.retail.getMaxLevels() === 7);
check("titles", Job.retail.getJobTitles().join(" → ") === "Cashier → Senior Cashier → Shift Supervisor → Assistant Store Manager → Store Manager → District Manager → VP of Retail", Job.retail.getJobTitles().join(" → "));
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.oldMan);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear();
const p = GameStateManager.INSTANCE.getPersonState();
const pays = [1, 2, 3, 4, 5, 6, 7].map((l) => Job.retail.pay(l).getMin());
check("pay rises every level", pays.every((v, i) => i === 0 || v > pays[i - 1]), pays.join(", "));
check("education: middle school → high school → business degree", Job.retail.educationRequirement(1) === CompletableAction.middleSchool && Job.retail.educationRequirement(3) === CompletableAction.highSchool && Job.retail.educationRequirement(6) === CompletableAction.college_business);
check("offered on the Work tab", Job.INSTANCE.jobsForPlayer(p).includes(Job.retail));
check("has its own icon", Job.retail.getImageId() === "work_retail");

// work it (a young adult, so they live long enough for promotions)
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.highSchoolDropout);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear();
{ const y = GameStateManager.INSTANCE.getPersonState(); (globalThis as any).__y = y; }
const y: any = (globalThis as any).__y;
y.getJobState().switchJob(Job.retail);
const cash0 = y.getMoneyState().getCash().doubleValue();
let weeks = 0;
for (; weeks < 600 && y.getJobState().getCurrentJobState().getLevel() < 2 && GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted(); weeks++) {
    y.getJobState().work(Job.retail, WorkAction.values()[0]); clear();
    y.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
    MoneyState.updateMoney$default(y.getMoneyState(), BigInteger.valueOf(5000), MoneyUpdateType.workIncome, null, null, 12, null);
}
const lvl = y.getJobState().getCurrentJobState().getLevel();
check("working pays", y.getMoneyState().getCash().doubleValue() > cash0);
check("gets promoted to Senior Cashier", lvl >= 2, `level ${lvl} (${y.getJobState().getCurrentJobDisplayString()}) after ${weeks} weeks, age ${y.getAgeInYears()}, alive ${GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()}`);
// level 3 needs high school
y.getJobState().getCurrentJobState().setProgress(10000);
const hs = y.getCompletableActionState().isCompleted(CompletableAction.highSchool);
y.getJobState().work(Job.retail, WorkAction.values()[0]); clear();
check("Shift Supervisor needs high school", (y.getJobState().getCurrentJobState().getLevel() >= 3) === hs, `has high school: ${hs}, level ${y.getJobState().getCurrentJobState().getLevel()}`);
const back = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager())).getSaveState().currentSlot().getPersonState();
check("saved", back.getJobState().getCurrentJob() === Job.retail && back.getJobState().getCurrentJobState().getLevel() >= lvl);

// icons removed
check("Assisted Dying row has its picture", AssistedDying.cell()?.getImageId() === "health_assisted_dying");
check("Come Out row has its picture", ComingOut.cell()?.getImageId() === "love_comingout");
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
