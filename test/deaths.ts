// v0.28.1 Fewer pop-ups: only holidays pop up on their own; everything else goes to News. Spend Time with Everyone
// still goes to work.
delete (globalThis as any).process?.env?.LIFESIM_ALL_POPUPS;
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { AlertType } from "../src/game/Managers/AlertType";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { PersonAttribute } from "../src/game/Enums/PersonAttribute";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { SpouseIncome } from "../src/game/Social/SpouseIncome";
import { LoveScreens } from "../src/game/Social/LoveScreens";
import { Job } from "../src/game/Enums/Job";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger, SpannableStringBuilder } from "../src/game/runtime";
import { ExtensionsKt } from "../src/game/Utils/ExtensionsKt";
import { LifeMoments } from "../src/game/Managers/LifeMoments";
import { News } from "../src/game/Managers/News";
import { FamilyExtras } from "../src/game/Managers/FamilyExtras";
import { Relationships } from "../src/game/Social/Relationships";
import { Illness } from "../src/game/Health/Illness";
import { Body } from "../src/game/Remaster/Body";
import { Crime } from "../src/game/Crime/Crime";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Utils } from "../src/game/Utils/Utils";
import { AlertViewModel } from "../src/game/Managers/AlertViewModel";
import { AlertActionViewModel } from "../src/game/Managers/AlertActionViewModel";
import { LoveActions, loveAction } from "../src/game/Social/LoveActions";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Achievement } from "../src/game/Enums/Achievement";
import { Subscriptions } from "../src/game/Managers/Subscriptions";

const shown: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { shown.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Work; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const dismissAll = () => { for (let i = 0; i < 200 && shown.length; i++) { const a = shown.shift(); try { a.getPositiveButton?.()?.getAction?.()?.invoke?.(); } catch { /* ignore */ } AlertManager.INSTANCE.alertDismissed(a); } };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const cash = (p: any) => Number(p.getMoneyState().getCash().add(p.getMoneyState().getSavings()).toString());
const start = (age: number) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState(); np.initializeAge(age, true); np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); dismissAll();
    const p: any = GameStateManager.INSTANCE.getPersonState(); keep(p);
    MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(500_000), MoneyUpdateType.workIncome, null, null, 12, null);
    return p;
};
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Crime } from "../src/game/Crime/Crime";
import { AssistedDying } from "../src/game/Managers/AssistedDying";
import { Obituary } from "../src/game/Managers/Obituary";
import { Illness } from "../src/game/Health/Illness";
// v0.30.1 Deaths: only health, happiness or sanity reaching zero (or your own choice). Vampires: only by choice.
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const started = () => GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted();
const seen: any[] = [];
const isDeath = (a: any) => /You have died|passed away|chose to rest/.test(String(a.getMessage?.() ?? ""));
// one week: anything that popped up (a holiday, a warning) is answered so it can't hold the next alert back
const week = (p: any) => {
    p.applyWeekly();
    for (let i = 0; i < 50 && shown.length; i++) { const a = shown.shift(); seen.push(a); AlertManager.INSTANCE.alertDismissed(a); }
};
const week0 = () => { for (let i = 0; i < 50 && shown.length; i++) { const a = shown.shift(); seen.push(a); AlertManager.INSTANCE.alertDismissed(a); } };
const deaths = () => [...seen, ...shown].filter((a) => /You have died|passed away|chose to rest/.test(String(a.getMessage?.() ?? "")));
const zero = (p: any, which: "health" | "happiness" | "sanity") => {
    const a = p.getAttributeState();
    if (which === "health") a.setHealth(0); else if (which === "happiness") a.setHappiness(0); else a.setSanity(0);
};
const live = (p: any, weeks: number, which: "health" | "happiness" | "sanity") => {
    // v0.36.0: a fit body adds a little health each week; this test needs the stat to stay at zero
    for (let i = 0; i < weeks && started(); i++) { zero(p, which); try { Body.st(p).fit = 0; } catch { /* */ } if (Vampire.isVampire(p)) Vampire.state(p).thirst = 0; week(p); }
};
for (const which of ["health", "happiness", "sanity"] as const) {
    const p = start(40); shown.length = 0; seen.length = 0;
    live(p, 40, which);
    const d = deaths()[0];
    check(`a mortal dies when ${which} stays at zero`, !started() && d != null);
    check(`…the message says it plainly ("Your ${which} reached zero")`, new RegExp(`Your ${which} reached zero`).test(String(d?.getMessage?.() ?? "")), String(d?.getMessage?.()));
    check(`…and so does the obituary`, p.deathCause === `${which[0].toUpperCase()}${which.slice(1)} reached zero`, String(p.deathCause));
    dismissAll();
}
{
    const p = start(40); shown.length = 0; seen.length = 0;
    for (let i = 0; i < 40 && started(); i++) {
        if (!Illness.known(p).some((x: any) => x.id === "pneumonia")) Illness.catch(p, "pneumonia", "test", true);
        zero(p, "health"); week(p);
    }
    const d = deaths()[0];
    check("an illness can still drain your health to zero (and the message mentions it)", !started() && /Your health reached zero.*pneumonia/i.test(String(d?.getMessage?.())), String(d?.getMessage?.()));
    dismissAll();
}
// vampires: nothing kills them
for (const which of ["health", "happiness", "sanity"] as const) {
    const p = start(30); Vampire.rise(p); dismissAll(); shown.length = 0; seen.length = 0;
    live(p, 60, which);
    check(`a vampire with ${which} at zero for 60 weeks is still here`, started() && deaths().length === 0);
    check(`…and gets no "you will die" warnings`, ![...seen, ...shown].some((a) => /will die|die in \d+ week/i.test(String(a.getMessage?.() ?? ""))) && p.getAttributeState().getLowAttributeCountdown_health() === 0 && p.getAttributeState().getLowAttributeCountdown_happiness() === 0 && p.getAttributeState().getLowAttributeCountdown_sanity() === 0);
    dismissAll();
}
{
    const p = start(30); Vampire.rise(p); dismissAll(); p.getJobState().switchJob(Job.retail); shown.length = 0; seen.length = 0;
    const r = Math.random; Math.random = () => 0.999;   // the worst outcome of a fight with the hunters
    try { Vampire.fight(p); } finally { Math.random = r; }
    week0();
    check("losing to vampire hunters doesn't kill a vampire (staked, not dead)", started() && deaths().length === 0 && [...seen, ...shown].some((a) => a.getTitle() === "Staked") && p.getJobState().getCurrentJob() == null);
    dismissAll();
    Vampire.finalRest(p);
    week0();
    check("Final Rest (the vampire's own choice) still ends the life", !started() && /chose to rest/.test(String(deaths()[0]?.getMessage?.())));
    dismissAll();
}
{
    const p = start(40); shown.length = 0; seen.length = 0;
    const r = Math.random; Math.random = () => 0.999;   // the hit goes badly
    try { Crime.hit(p); } finally { Math.random = r; }
    week0();
    check("a mob hit no longer kills you outright (−60 health, alive)", started() && deaths().length === 0 && seen.some((a) => a.getTitle() === "They Found You"));
    dismissAll();
}
{
    const p = start(40); shown.length = 0; seen.length = 0;
    const ms = p.getMoneyState();
    ms.cash = BigInteger.valueOf(-10_000_000); ms.savings = BigInteger.valueOf(5_000);
    for (let i = 0; i < 30 && started(); i++) { keep(p); week(p); }
    const b = [...seen, ...shown].find((a) => /bankrupt/i.test(a.getTitle() + " " + a.getMessage()));
    check("going bankrupt no longer ends your life", started() && b != null && deaths().length === 0);
    check("…your debts are wiped (and your savings go with them)", Number(ms.getCash().toString()) > -100_000 && ms.getSavings().signum() === 0, `${ms.getCash()} ${ms.getSavings()}`);
    dismissAll();
}
{
    const p = start(70); shown.length = 0; seen.length = 0;
    AssistedDying.perform();
    week0();
    check("Assisted Dying (your own choice) still ends the life", !started() && deaths().length === 1);
    dismissAll();
}
{
    // a long life ends the natural way: health declines with age until it reaches zero
    const p = start(80); shown.length = 0; seen.length = 0;
    for (let i = 0; i < 48 * 60 && started(); i++) { const a = p.getAttributeState(); a.setHappiness(100); a.setSanity(100); week(p); }
    check("a mortal still dies of old age — when their health runs out", !started() && p.deathCause === "Health reached zero", `${p.getAgeInYears()} ${p.deathCause}`);
    dismissAll();
}
console.log(failures ? `\n${failures} FAILED` : "\nall death checks passed");
process.exit(failures ? 1 : 0);
