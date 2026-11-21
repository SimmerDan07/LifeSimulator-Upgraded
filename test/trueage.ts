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
import { TrueAge } from "../src/game/Managers/TrueAge";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
// v0.29.2: the true age counter has no ceiling.
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const p = start(30);
const SAFE = Number.MAX_SAFE_INTEGER;   // 9,007,199,254,740,991 — a plain number stops counting here
check("a normal true age reads normally", TrueAge.text(p) === "30" && p.getTrueAgeInYears() === 30, TrueAge.text(p));
p.setTrueAgeInWeeks(SAFE - 3);
const w0 = TrueAge.weeks(p);
check("set near the old limit: carried exactly", w0 === BigInt(SAFE - 3), String(w0));
let exact = true;
for (let i = 1; i <= 50; i++) { p.addTrueAgeWeeks(1); if (TrueAge.weeks(p) !== w0 + BigInt(i)) exact = false; }
check("past 9 quadrillion weeks it still counts every single week", exact, String(TrueAge.weeks(p) - w0));
// vampires: the week passes, the true age goes up by exactly one each week
Vampire.rise(p); dismissAll();
check("a vampire", Vampire.isVampire(p));
const w1 = TrueAge.weeks(p);
for (let i = 0; i < 6; i++) { keep(p); Vampire.state(p).thirst = 0; p.applyWeekly(); dismissAll(); }
check("an ancient vampire's weeks keep counting (+6 in 6 weeks)", TrueAge.weeks(p) - w1 === 6n, String(TrueAge.weeks(p) - w1));
// far beyond: a number with hundreds of digits
p.trueAgeBlocks = BigInteger.valueOf(10n ** 400n); p.trueAgeInWeeks = 0;
const txt = TrueAge.text(p);
check("a true age hundreds of digits long", txt.replace(/,/g, "").length > 400 && /^\d{1,3}(,\d{3})+$/.test(txt), txt.slice(0, 40) + "… (" + txt.length + " chars)");
p.addTrueAgeWeeks(48);
check("…and a year still adds one", TrueAge.years(p) === (10n ** 400n * BigInt(TrueAge.BLOCK) + 48n) / 48n);
check("comparisons still work (achievements: 200, 500 years)", p.getTrueAgeInYears() >= 500 && Number.isFinite(p.getTrueAgeInWeeks()));
const prof = JSON.stringify(new ProfileModelGenerator().generateViewModels());
check("the Profile shows every digit (no 1e+, no Infinity, no NaN)", prof.includes(txt.slice(0, 20)) && !/e\+\d|Infinity|NaN/.test(prof));
// saves keep every digit
const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager())).getSaveState().currentSlot().getPersonState();
check("saving and loading keeps every digit", TrueAge.weeks(back) === TrueAge.weeks(p) && TrueAge.text(back) === TrueAge.text(p));
// an heir or a family member copies it exactly
const kid: any = new Person(Relationship.child, Sex.female, "Lane", 48 * 10);
TrueAge.copy(p, kid);
check("copied exactly (an heir, a former life)", TrueAge.weeks(kid) === TrueAge.weeks(p));
check("family screens show it too", FamilyExtras.ageText(kid).includes(TrueAge.text(p).slice(0, 30)));
// small numbers get commas
p.setTrueAgeInWeeks(48 * 1234567);
check("commas: 1,234,567", TrueAge.text(p) === "1,234,567" && p.getTrueAgeInYears() === 1234567);
console.log(failures ? `\n${failures} FAILED` : "\nall true age checks passed");
process.exit(failures ? 1 : 0);
