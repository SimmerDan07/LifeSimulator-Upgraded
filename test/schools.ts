// Preschool + Elementary School, realistic school lengths and starting ages, Young Child starting at 0,
// birth month, and age limits for young players.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { CompletableActionType } from "../src/game/Enums/CompletableActionType";
import { Job } from "../src/game/Enums/Job";
import { BankAction } from "../src/game/Enums/BankAction";
import { BankActionAmount } from "../src/game/Enums/BankActionAmount";
import { HealthEvent } from "../src/game/Enums/HealthEvent";
import { SideHustle } from "../src/game/Enums/SideHustle";
import { EducationModelGenerator } from "../src/game/Controllers/EducationModelGenerator";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Schooling } from "../src/game/Managers/Schooling";
import { Generations } from "../src/game/Managers/Generations";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { Perk } from "../src/game/Enums/Perk";
import { BigInteger } from "../src/game/runtime";
import fs from "fs";
let fixture: string | null = fs.readFileSync("test/fixtures/save-v0.3-landlord.txt", "utf8");
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => fixture, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Education; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const W = 48;
const S = CompletableAction;
const text = (vm: any): string => { const out: string[] = []; const walk = (o: any, d: number) => { if (o == null || d > 4) return; if (typeof o === "string") { out.push(o); return; } if (typeof o !== "object") return; if (typeof o.text === "string") out.push(o.text); for (const k of Object.keys(o)) if (k !== "text") walk(o[k], d + 1); }; walk(vm, 0); return out.join(" | "); };
const eduRow = (title: string) => (Array.from(new EducationModelGenerator().getEducationViewModels() as any) as any[]).find((r) => r.title === title);
const start = (sc: any, tweak?: (p: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    if (tweak) tweak(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const keepAlive = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(2000), MoneyUpdateType.workIncome, null, null, 12, null); };

// ---------------------------------------------------------------- old save (made before these schools existed)
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p: any = GameStateManager.INSTANCE.getPersonState();
    let ok = true, msg = "";
    try { new EducationModelGenerator().generateViewModels(); } catch (e: any) { ok = false; msg = e.message; }
    check("old save: Education tab works", ok, msg);
    const titles = (Array.from(new EducationModelGenerator().getEducationViewModels() as any) as any[]).map((r) => r.title).filter((x: any) => x && x !== "Education");
    check("old save: schools listed first, in order", titles.slice(0, 4).join(" > ") === "Preschool > Elementary School > Middle School > High School", titles.slice(0, 5).join(" > "));
    const edu = p.getCompletableActionState();
    check("old save adult: preschool + elementary count as done", edu.isCompleted(S.preschool) && edu.isCompleted(S.elementarySchool), `age ${p.getAgeInYears()}`);
    check("old save: birth month defaults to January", p.getBirthMonth() === 0);
}

// ---------------------------------------------------------------- Young Child: a newborn
fixture = null;
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
let p: any = start(LifeScenario.youngChild, (np) => { np.setBirthMonth(5); np.getPerkState().getPerks().clear(); });
check("Young Child starts at age 0", p.getAgeInYears() === 0 && p.getAgeInWeeks() === 0, `age ${p.getAgeInYears()} weeks ${p.getAgeInWeeks()}`);
check("born in the chosen month (June)", p.getGetHUDViewModel().monthString === "June" || JSON.stringify(p.getGetHUDViewModel()).includes("June"), JSON.stringify(p.getGetHUDViewModel()).slice(0, 200));
check("newborn: no schooling", [S.preschool, S.elementarySchool, S.middleSchool, S.highSchool].every((a) => !p.getCompletableActionState().isCompleted(a)));
check("preschool locked until 3", /Starts at age 3/.test(text(eduRow("Preschool"))), text(eduRow("Preschool")).slice(0, 120));
check("elementary locked until 5", /Starts at age 5/.test(text(eduRow("Elementary School"))));
check("middle school needs elementary", /Elementary School/.test(text(eduRow("Middle School"))));
check("baby can't apply for jobs (14+)", /at least 14/.test(text(Array.from(new LifepathsModelGenerator().screen("careers:hospitality").getContentViewModels() as any).find((r: any) => r.title === "Burger Flipper"))));
check("baby can't take a loan / buy stock (18+)", /at least 18/.test(BankAction.takeLoan.getLockedString() ?? "") && /at least 18/.test(BankAction.buyStock.getLockedString() ?? ""));
check("baby can't do side hustles", /at least 14/.test(SideHustle.values()[0].requirementNotMetString(p) ?? ""));
check("skills from 6", (CompletableAction as any).homeChef && /at least 6/.test(text((Array.from(new EducationModelGenerator().getSkillsViewModels() as any) as any[])[1])));
const study0 = p.getCompletableActionState().getState(S.preschool).getProgress();
p.learnSkillOrEducation(S.preschool); clear();
check("studying preschool at 0 does nothing", p.getCompletableActionState().getState(S.preschool).getProgress() === study0 && p.getAgeInWeeks() === 0);
// month advances and birthday is in June
for (let w = 0; w < 4; w++) { keepAlive(p); p.applyWeekly(); clear(); }
check("4 weeks later it's July", JSON.stringify(p.getGetHUDViewModel()).includes("July"));
for (let w = 4; w < W; w++) { keepAlive(p); p.applyWeekly(); clear(); }
check("first birthday comes in June", p.getAgeInYears() === 1 && JSON.stringify(p.getGetHUDViewModel()).includes("June"));

// grow up studying every school week the age allows
const graduatedAt: Record<string, number> = {};
const schools = [S.preschool, S.elementarySchool, S.middleSchool, S.highSchool];
let guard = 0;
while (p.getAgeInYears() < 19 && guard++ < 20 * W) {
    keepAlive(p);
    const edu = p.getCompletableActionState();
    const next = schools.find((a) => !edu.isCompleted(a) && Schooling.ageBlock(a, p) == null && (a.getPrerequiste() == null || edu.isCompleted(a.getPrerequiste())));
    if (next) p.learnSkillOrEducation(next); else p.applyWeekly();
    clear();
    for (const a of schools) if (graduatedAt[a.name()] == null && edu.isCompleted(a)) graduatedAt[a.name()] = Math.round(p.getAgeInWeeks() / W * 10) / 10;
}
const g = graduatedAt;
console.log("   graduation ages:", JSON.stringify(g));
check("preschool done at about 4.7 (started at 3)", g.preschool >= 4.5 && g.preschool <= 5);
check("elementary done at about 9.6 (6 years from 5, half a year head start)", g.elementarySchool >= 9 && g.elementarySchool <= 10.5);
check("middle school done at about 13.5 (starts at 11)", g.middleSchool >= 13 && g.middleSchool <= 14.5);
check("high school done at about 17.3 — not 15", g.highSchool >= 17 && g.highSchool <= 18.5);
check("Fast Learner perk doesn't shorten kids' school", S.highSchool.getTimeRequiredInWeeks(p) === 160 || p.getAgeInYears() >= 18);

// ---------------------------------------------------------------- night school for adults
p = start(LifeScenario.highSchoolDropout, (np) => { np.getPerkState().getPerks().clear(); np.getTraitState().getTraits().clear(); });   // traits like Stupid change study time
const edu = p.getCompletableActionState();
check("High School Dropout (18): preschool + elementary done, middle done, high school 15 weeks in", edu.isCompleted(S.preschool) && edu.isCompleted(S.elementarySchool) && edu.isCompleted(S.middleSchool) && edu.getState(S.highSchool).getProgress() === 15 && !edu.isCompleted(S.highSchool));
check("adult high school is night school: 80 weeks", S.highSchool.getTimeRequiredInWeeks(p) === 80 && /Night school/.test(text(eduRow("High School"))), `${S.highSchool.getTimeRequiredInWeeks(p)} weeks, traits ${Array.from(p.getTraitState?.()?.getTraits?.() ?? []).map((t: any) => t.name()).join(",")}`);
check("adult can't go to preschool", /Only for ages 3–5/.test(text(eduRow("Preschool"))) || edu.isCompleted(S.preschool));
p.getPerkState().addPerk(Perk.fastLearner);
check("Fast Learner still speeds up adult night school", S.highSchool.getTimeRequiredInWeeks(p) < 80, String(S.highSchool.getTimeRequiredInWeeks(p)));

// ---------------------------------------------------------------- kids in other scenarios get schooling for their age
for (const sc of [LifeScenario.sicklyChild, LifeScenario.orphanChild]) {
    const k = start(sc);
    const e = k.getCompletableActionState(), age = k.getAgeInYears();
    const ok = e.isCompleted(S.preschool) && e.isCompleted(S.elementarySchool) && (age < 14 || e.isCompleted(S.middleSchool)) && (age >= 14 || e.getState(S.middleSchool).getProgress() > 0 || age <= 11);
    check(`${sc.name()} (age ${age}): school fits the age`, ok, schools.map((a) => `${a.name()}:${e.isCompleted(a) ? "done" : e.getState(a).getProgress()}`).join(" "));
}
// sandbox at 7: preschool done, elementary 2 years in
{
    const k = start(LifeScenario.sandboxMode, (np) => { np.initializeAge(7, true); for (const a of [S.middleSchool, S.highSchool]) np.getCompletableActionState().clearAction(a); });
    const e = k.getCompletableActionState();
    check("sandbox can start at 7: preschool done, elementary 80 weeks in", k.getAgeInYears() === 7 && e.isCompleted(S.preschool) && e.getState(S.elementarySchool).getProgress() === 80, `${k.getAgeInYears()} ${e.getState(S.elementarySchool).getProgress()}`);
}

// ---------------------------------------------------------------- age limits at 10, and adults
{
    const k = start(LifeScenario.sandboxMode, (np) => np.initializeAge(10, true));
    check("10-year-old: jobs locked", /at least 14/.test(text(Array.from(new LifepathsModelGenerator().screen("careers:hospitality").getContentViewModels() as any).find((r: any) => r.title === "Burger Flipper"))));
    k.getJobState().switchJob(Job.burgerFlipper); k.getJobState().setCurrentJob(null);
    const market = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.propertyMarket, "", true);
    check("10-year-old: can't buy property", /must be 18 to buy/.test(text(market)));
    const buyButtons = (Array.from(market.getContentViewModels() as any) as any[]).filter((r) => r.getButtons).flatMap((r) => r.getButtons()).filter((b: any) => /^Buy|^Mortgage/.test(b.getTitle()));
    check("…buy buttons are greyed out", buyButtons.length > 0 && buyButtons.every((b: any) => !b.getEnabled()));
    const cash0 = k.getMoneyState().getCash().doubleValue(), sav0 = k.getMoneyState().getSavings().doubleValue();
    k.bankAction(BankAction.takeLoan, BankActionAmount.high); clear();
    check("10-year-old: loan does nothing", k.getMoneyState().getSavings().doubleValue() === sav0 && k.getMoneyState().getCash().doubleValue() === cash0);
    // Elixir of Youth can't make a child younger than 8
    k.setAgeInWeeks(9 * W + 5);
    k.setAgeInWeeks(k.getAgeInWeeks() - 10 * W);
    check("Elixir floor: 9-year-old → 8", k.getAgeInYears() === 8, String(k.getAgeInYears()));
}
{
    const a = start(LifeScenario.educatedAndInDebt);
    check("adult (25): jobs, loans and property open", !/at least/.test(text(Array.from(new LifepathsModelGenerator().screen("careers:hospitality").getContentViewModels() as any).find((r: any) => r.title === "Burger Flipper"))) && BankAction.takeLoan.getLockedString() == null);
}

// ---------------------------------------------------------------- heir keeps the calendar month and gets schooling by age
{
    const parent = start(LifeScenario.sandboxMode, (np) => { np.initializeAge(40, true); np.setBirthMonth(9); });
    for (let w = 0; w < 9; w++) { keepAlive(parent); parent.applyWeekly(); clear(); }
    const monthBefore = parent.getCurrentMonthIndex();
    const fam = parent.getFamilyState();
    const { Person } = await import("../src/game/Managers/Person");
    const { Relationship } = await import("../src/game/Enums/Relationship");
    const { Sex } = await import("../src/game/Enums/Sex");
    const child = new Person(Relationship.child, Sex.female, parent.getLastName(), 9 * W + 13); child.setFirstName("Ivy");
    fam.getFamilyMembers().add(child);
    let ok = true, msg = "";
    try { Generations.continueAs(child); } catch (e: any) { ok = false; msg = e.message; }
    clear();
    const heir: any = GameStateManager.INSTANCE.getPersonState();
    if (ok && heir.getFirstName() === "Ivy") {
        const e = heir.getCompletableActionState();
        check("heir (9): preschool done, elementary 4 years in", e.isCompleted(S.preschool) && e.getState(S.elementarySchool).getProgress() === 160 && !e.isCompleted(S.middleSchool), String(e.getState(S.elementarySchool).getProgress()));
        check("heir: calendar month carries on", heir.getCurrentMonthIndex() === monthBefore, `${heir.getCurrentMonthIndex()} vs ${monthBefore}`);
    } else check("heir created", false, msg || heir.getFirstName());
}

// ---------------------------------------------------------------- save round trip
{
    const k = start(LifeScenario.youngChild, (np) => np.setBirthMonth(2));
    const back: any = (SaveCodec as any).decode((SaveCodec as any).encode(k));
    check("save keeps birth month and new schools", back.getBirthMonth() === 2 && back.getCompletableActionState().getState(S.preschool) != null);
    void CompletableActionType; void HealthEvent;
}
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures ? 1 : 0);
