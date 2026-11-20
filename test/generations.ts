import { Lineage } from "../src/game/Managers/Lineage";
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { Job } from "../src/game/Enums/Job";
import { Housing } from "../src/game/Enums/Housing";
import { HealthEvent } from "../src/game/Enums/HealthEvent";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { ButtonViewModel } from "../src/game/Models/ButtonViewModel";
import { BigInteger } from "../src/game/runtime";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { JobState } from "../src/game/Managers/JobState";
import { SaveCodec } from "../src/game/save/SaveCodec";

const alerts: any[] = []; const navs: string[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo(t) { navs.push(t.name()); }, backToMainGame() { navs.push("<back>"); }, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
const check = (n: string, ok: boolean, x = "") => console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : ""));
const buttons = (vm: any) => { const out: ButtonViewModel[] = []; const walk = (o: any, d = 0) => { if (!o || typeof o !== "object" || d > 5) return; if (o instanceof ButtonViewModel) { out.push(o); return; } for (const v of Object.values(o)) Array.isArray(v) ? v.forEach((x) => walk(x, d + 1)) : walk(v, d + 1); }; walk(vm); return out; };

// --- v0.15.0: the Elixir of Youth is now the vampire Cure: not on the Health tab, and it no longer makes you younger
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.oldMan);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!);
const p = GameStateManager.INSTANCE.getPersonState();
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(100000000), MoneyUpdateType.workIncome, null, null, 12, null);
check("the Health tab no longer offers the Elixir of Youth", !HealthEvent.INSTANCE.eventsForPlayer(p).includes(HealthEvent.elixirOfYouth));
const age0 = p.getAgeInYears();
p.healthAction(HealthEvent.elixirOfYouth); while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift());
check("…and it doesn't make you younger any more", p.getAgeInYears() >= age0);

// --- set up a family: adult child with a job, a young child, a house
const kid = new Person(Relationship.child, Sex.female, p.getLastName(), 48 * 24 + 10);
kid.setFirstName("Ava");
const js = new JobState(); js.applyJob?.(Job.barista); kid.setChildJobState(js.getCurrentJob() ? js : null);
const baby = new Person(Relationship.child, Sex.male, p.getLastName(), 48 * 3);
p.getFamilyState().getFamilyMembers().add(kid); p.getFamilyState().getFamilyMembers().add(baby);
p.getHousingState().purchase$default?.(p.getHousingState(), Housing.house, null, 2, null);
const cashBefore = p.getMoneyState().getCash().add(p.getMoneyState().getSavings());
const parentName = p.getFullName(); const parentId = p.getId();

// --- die
alerts.length = 0;
for (let i = 0; i < 40 && gsm.getSaveState().getHasGameStarted(); i++) {
    while (alerts.length) { const a = alerts.shift(); if (/died/i.test(a.getTitle())) { alerts.unshift(a); break; } AlertManager.INSTANCE.alertDismissed(a); }
    if (alerts.length) break;
    (p.getAttributeState() as any).lowAttributeCountdown_health = 10; p.getAttributeState().setHealth(0); p.applyWeekly();
}
const death = alerts.find((a) => /died/i.test(a.getTitle()));
check("parent died", !!death && !gsm.getSaveState().getHasGameStarted());
const cont = (death?.getAdditionalButtons() ?? []).find((b: any) => /child/i.test(b.getTitle()));
check("death alert offers 'Continue as your child'", !!cont);
cont?.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(death);
check("opens heir screen", navs.includes("chooseHeir"), navs.slice(-2).join(" > "));
const heirVm = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.chooseHeir, "", false);
const heirBtns = buttons(heirVm.getContentViewModels());
check("only eligible heirs listed (adult Ava, not the 3-year-old)", heirBtns.length === 1 && /Ava/.test(heirBtns[0].getTitle()), heirBtns.map((b) => b.getTitle()).join(","));
const summary = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.gameSummary, "OnDeath", false);
check("life summary also offers it", buttons(summary.getFooterViewModels()).some((b) => /child/i.test(b.getTitle())));
heirBtns[0].getAction().invoke();

// --- verify heir
const h = GameStateManager.INSTANCE.getPersonState();
check("now playing the heir", h.getFirstName() === "Ava" && h.getAgeInYears() === 24 && gsm.getSaveState().getHasGameStarted(), `${h.getFullName()}, ${h.getAgeInYears()}`);
check("generation 2 (the parent is in the family line)", h.getGeneration() === 2 && Lineage.line(h).length === 1 && Lineage.line(h)[0].generation === 1, Lineage.line(h).map((r) => r.name).join(";"));
check("inherited estate", h.getMoneyState().getCash().compareTo(BigInteger.ZERO) > 0, `parent had ${cashBefore}, heir has ${h.getMoneyState().getCash()}`);
check("inherited the house", h.getHousingState() === (gsm.getCemetaryState().getPastLives().find((x: any) => x.getId() === parentId) ? h.getHousingState() : null));
check("schooling filled in", h.getCompletableActionState().isCompleted(CompletableAction.highSchool));
const parents = h.getFamilyState().getParents();
check("deceased parent in family", parents.some((x: any) => !x.getIsAlive() && x.getFirstName() === parentName.split(" ")[0]), parents.map((x: any) => x.getFullName() + (x.getIsAlive() ? "" : " (deceased)")).join(", "));
const ceme = gsm.getCemetaryState().getPastLives().find((x: any) => x.getId() === parentId);
check("parent kept in cemetery (snapshot)", !!ceme && ceme !== p);
const profile = new ProfileModelGenerator().generateViewModels();
check("profile shows Generation", JSON.stringify(profile.getContentViewModels().map((c: any) => c?.label?.stringBuilder?.text ?? "")).includes("Generation"));
const alert = alerts.find((a) => /Generation 2/.test(a.getTitle()));
check("welcome alert", !!alert, alert?.getMessage() ?? alerts.map((a) => a.getTitle()).join(" | "));
// play on + save round trip
let err = "";
try {
    for (let i = 0; i < 100; i++) { h.applyWeekly(); while (alerts.length) { const a = alerts.shift(); a.getPositiveButton()?.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); } if (!gsm.getSaveState().getHasGameStarted()) break; }
    const back = SaveCodec.decode(SaveCodec.encode(gsm));
    GameStateManager.INSTANCE.setGlobalStateManager(back);
    err = GameStateManager.INSTANCE.getPersonState().getGeneration() === 2 ? "" : "generation lost in save";
} catch (e: any) { err = e.stack; }
check("heir plays 100 weeks + save/load keeps generation", !err, err.slice(0, 300));
