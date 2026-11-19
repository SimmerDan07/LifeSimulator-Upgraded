// Playtime for ages 0–8, weeks left on schools/degrees, true age of family & partner, Elixir of Youth for them,
// together/married counters, and "Spend Time with Everyone".
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { EducationModelGenerator } from "../src/game/Controllers/EducationModelGenerator";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { KidsLeisure } from "../src/game/Managers/KidsLeisure";
import { FamilyExtras } from "../src/game/Managers/FamilyExtras";
import { Person } from "../src/game/Managers/Person";
import { SocialPerson } from "../src/game/Social/SocialPerson";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { LoverPersonality } from "../src/game/Enums/LoverPersonality";
import { LoveEvent } from "../src/game/Enums/LoveEvent";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import fs from "fs";
let fixture: string | null = fs.readFileSync("test/fixtures/save-v0.3-landlord.txt", "utf8");
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => fixture, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Love; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const W = 48;
const text = (vm: any): string => { const out: string[] = []; const walk = (o: any, d: number) => { if (o == null || d > 4) return; if (typeof o === "string") { out.push(o); return; } if (typeof o !== "object") return; if (typeof o.text === "string") out.push(o.text); for (const k of Object.keys(o)) if (k !== "text") walk(o[k], d + 1); }; walk(vm, 0); return out.join(" | "); };
const rows = (gen: any) => Array.from(gen.generateViewModels().getContentViewModels() as any) as any[];
const keepAlive = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(500), MoneyUpdateType.workIncome, null, null, 12, null); };
const start = (sc: any, tweak?: (p: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    if (tweak) tweak(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};

// ---------------------------------------------------------------- old save: true ages catch up, Love tab works
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p: any = GameStateManager.INSTANCE.getPersonState();
    const parents = Array.from(p.getFamilyState().getParents() as any) as any[];
    check("old save: parents' true age is at least their age", parents.length > 0 && parents.every((x) => FamilyExtras.trueAgeYears(x) >= x.getAgeInYears()), parents.map((x) => `${x.getAgeInYears()}/${x.trueAgeInWeeks}`).join(" "));
    let ok = true, msg = "";
    try { rows(new LoveModelGenerator()); } catch (e: any) { ok = false; msg = e.message; }
    check("old save: Love tab works", ok, msg);
}

// ---------------------------------------------------------------- Playtime for little kids
fixture = null;
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
let p: any = start(LifeScenario.youngChild);
const leisure = rows(new VacationModelGenerator());
const titles = leisure.map((r) => r.title).filter(Boolean);
check("newborn: Playtime section with 10 activities", leisure.some((r) => /Playtime/.test(text(r))) && KidsLeisure.activities.every((a) => titles.includes(a.getTitle())), titles.slice(0, 12).join(", "));
const row = (t: string) => leisure.find((r) => r.title === t);
check("Nap Time and Play with Toys open at 0", !/at least/.test(text(row("Nap Time"))) && !/at least/.test(text(row("Play with Toys"))));
check("Playground locked until 2, Theme Park until 4", /at least 2/.test(text(row("Go to the Playground"))) && /at least 4/.test(text(row("Theme Park Trip"))));
const parents = Array.from(p.getFamilyState().getParents() as any) as any[];
for (const x of parents) x.setRelationshipProgress(200);
const bond0 = parents.map((x) => x.getRelationshipProgress());
const weeks0 = p.getAgeInWeeks();
KidsLeisure.get("story").action(p); clear();
check("Bedtime Story: a week passes and parents grow closer", p.getAgeInWeeks() === weeks0 + 1 && parents.every((x, i) => x.getRelationshipProgress() > bond0[i]), parents.map((x, i) => `${bond0[i]}→${x.getRelationshipProgress()}`).join(" "));
KidsLeisure.get("themepark").action(p); clear();
check("Theme Park does nothing at age 0", p.getAgeInWeeks() === weeks0 + 1);

// ---------------------------------------------------------------- true age of parents advances; elixir for a parent
const mom = parents[0];
const momAge0 = mom.getAgeInYears(), momTrue0 = FamilyExtras.trueAgeYears(mom);
for (let w = 0; w < 3 * W; w++) { keepAlive(p); p.applyWeekly(); clear(); }
check("parent's true age goes up as they age (fixed)", (FamilyExtras.trueAgeYears(mom) === momTrue0 + 3 || FamilyExtras.trueAgeYears(mom) === momTrue0 + 4 /* the elixir's week can be their birthday */) && mom.getAgeInYears() === momAge0 + 3, `${momAge0}/${momTrue0} → ${mom.getAgeInYears()}/${FamilyExtras.trueAgeYears(mom)}`);
check("toddler (3): playground opens", KidsLeisure.get("playground").requirementNotMetString(p) == null);
const parentScreen = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.parentDetails, mom.getId(), true);
// v0.15.0: the Elixir of Youth became the vampire Cure, so family can no longer be made younger
check("parent screen shows their age and no Elixir button any more", /Age: \d+/.test(text(parentScreen)) && !/Elixir of Youth/.test(text(parentScreen)));
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(25000000), MoneyUpdateType.workIncome, null, null, 12, null);
const before = mom.getAgeInYears();
check("the elixir can't be given any more", !FamilyExtras.giveElixir(mom) && mom.getAgeInYears() === before); clear();
mom.trueAgeInWeeks = mom.getAgeInWeeks() + 10 * W;   // e.g. an older save where she drank it
check("…list row still shows a true age that differs", /true age/.test(text(mom.getPersonNameAndAgeInfoViewModel())), text(mom.getPersonNameAndAgeInfoViewModel()));

// ---------------------------------------------------------------- weeks left on schools
const eduRow = (t: string) => (Array.from(new EducationModelGenerator().getEducationViewModels() as any) as any[]).find((r) => r.title === t);
const decor = (r: any) => r?.decoratorText ?? r?.getDecoratorText?.() ?? "";
check("preschool at 3: '80 weeks left'", decor(eduRow("Preschool")) === "80 weeks left", decor(eduRow("Preschool")));
// (a random event can occasionally cost the week's progress, so study until it moves)
for (let i = 0; i < 5 && decor(eduRow("Preschool")) === "80 weeks left"; i++) { p.learnSkillOrEducation(CompletableAction.preschool); clear(); }
check("after a week of preschool: '79 weeks left'", decor(eduRow("Preschool")) === "79 weeks left", decor(eduRow("Preschool")));
check("locked schools show no countdown", decor(eduRow("Middle School")) === "");

// ---------------------------------------------------------------- 9+: no Playtime
p.ageInWeeks = 9 * W; p.trueAgeInWeeks = Math.max(p.trueAgeInWeeks, p.ageInWeeks);
check("age 9: no Playtime section", !rows(new VacationModelGenerator()).some((r) => /Playtime/.test(text(r))));

// ---------------------------------------------------------------- partner counters, partner elixir, spend time with everyone
p = start(LifeScenario.educatedAndInDebt);
const lover = new Person(Relationship.lover, Sex.female, "Rivera", 30 * W); lover.setFirstName("Ana"); lover.setLoverPersonality(LoverPersonality.soulMate);
p.getFamilyState().date(lover);
check("dating: 'Together less than a year'", FamilyExtras.countersText() === "Together less than a year", String(FamilyExtras.countersText()));
for (let w = 0; w < 2 * W; w++) { keepAlive(p); p.applyWeekly(); clear(); }
check("2 years later: 'Together 2 years'", FamilyExtras.countersText() === "Together 2 years", String(FamilyExtras.countersText()));
p.getFamilyState().advanceRomanticRelationship(LoveEvent.marry); clear();
for (let w = 0; w < W + 3; w++) { keepAlive(p); p.applyWeekly(); clear(); }
check("married a year: 'Together 3 years · Married 1 year'", FamilyExtras.countersText() === "Together 3 years · Married 1 year", String(FamilyExtras.countersText()));
const love = rows(new LoveModelGenerator());
check("Love tab shows the counters", love.some((r) => /Together 3 years · Married 1 year/.test(text(r))));
const partnerScreen = Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.personDetails, p.getFamilyState().getPartner().getId(), true).getContentViewModels() as any) as any[];
check("partner screen: no Elixir; Love tab: Spend Time with Everyone", !partnerScreen.some((r) => /Elixir/.test(r.title ?? "")) && love.some((r) => r.title === "Spend Time with Everyone"));
// v0.21.0: a week with EACH relationship — partner, family, extended family, friends, pets
const social = p.getSocial();
for (const [kind, first] of [["friend", "Maya"], ["friend", "Leo"], ["cousin", "Ava"], ["sibling", "Sam"]] as [any, string][]) {
    const sp = SocialPerson.make(kind, Sex.female, kind === "friend" ? "Stone" : p.getLastName(), 25 * W);
    sp.firstName = first; sp.relationshipProgress = 300; social.add(sp);
}
const exes = SocialPerson.make("ex", Sex.male, "Gray", 30 * W); exes.firstName = "Rex"; social.add(exes);
const everyone = FamilyExtras.everyone();
check("everyone = partner, parents, siblings, extended family, friends and pets (not exes)",
    ["Maya", "Leo", "Ava", "Sam"].every((n) => everyone.some((x) => x.getFirstName() === n)) && !everyone.some((x) => x.getFirstName() === "Rex") && everyone.includes(p.getFamilyState().getPartner()),
    everyone.map((x) => x.getFirstName()).join(", "));
const cell = FamilyExtras.spendTimeCell();
check("the Love tab button says how many weeks", text(cell).includes(`${everyone.length} weeks`), text(cell).slice(0, 300));
const rel0 = everyone.map((x) => x.getRelationshipProgress());
const w0 = p.getAgeInWeeks();
FamilyExtras.askSpendTime();
const ask = alerts.find((a) => a.getTitle() === "Spend Time with Everyone");
check("asks first: 'Spend N weeks' / Cancel", ask != null && ask.getPositiveButton().getTitle() === `Spend ${everyone.length} weeks` && ask.getNegativeButton().getTitle() === "Cancel");
alerts.splice(alerts.indexOf(ask), 1); ask.getNegativeButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(ask); clear();
check("Cancel: no time passes", p.getAgeInWeeks() === w0);
keepAlive(p);
const n = FamilyExtras.spendTimeWithEveryone();
const summary = alerts.find((a) => a.getTitle() === "Time Well Spent");
clear();
check("one week with each person: N relationships = N weeks", n === everyone.length && n >= 6 && p.getAgeInWeeks() === w0 + n, `${n} people, ${p.getAgeInWeeks() - w0} weeks`);
check("everyone grew closer", everyone.every((x, i) => x.getRelationshipProgress() > rel0[i] || x.getRelationshipProgress() >= 1000),
    everyone.map((x, i) => `${x.getFirstName()} ${rel0[i]}→${x.getRelationshipProgress()}`).join(", "));
check("a 'Time Well Spent' summary", summary != null && summary.getMessage().includes(`${n} weeks`));
check("exes don't get a week", social.list("ex")[0].getRelationshipProgress() === exes.getRelationshipProgress());
const back: any = (SaveCodec as any).decode((SaveCodec as any).encode(p));
check("save keeps the counters", back.getFamilyState().getPartner().togetherSinceWeek === p.getFamilyState().getPartner().togetherSinceWeek && back.getFamilyState().getPartner().marriedSinceWeek != null);
// a partner with an older true age (from an older save) still shows it on the Love tab
lover.trueAgeInWeeks = lover.getAgeInWeeks() + 10 * W;
check("Love tab shows a partner's true age when it differs", rows(new LoveModelGenerator()).some((r) => /true age/.test(text(r))));
// minors can't get it
const kid = new Person(Relationship.child, Sex.male, p.getLastName(), 10 * W);
check("children under 18 can't get the elixir", !FamilyExtras.canGetElixir(kid));

// ---------------------------------------------------------------- turning 18: no longer kicked out; move out and back
{
    const { Housing } = await import("../src/game/Enums/Housing");
    const k: any = start(LifeScenario.sandboxMode, (np) => np.initializeAge(17, true));
    k.ageInWeeks = 18 * W - 1; k.trueAgeInWeeks = k.ageInWeeks;
    k.getHousingState().moveHere(Housing.parentsHouse);
    keepAlive(k); k.applyWeekly();
    const msg = alerts.map((a) => a.getMessage?.() ?? "").join(" | ");
    clear();
    check("turning 18: still living with parents", k.getAgeInYears() === 18 && k.getHousingState().currentHousing().getType() === Housing.parentsHouse, k.getHousingState().currentHousing().getType().name());
    check("…a friendly 18th-birthday note instead of being kicked out", /keep living with your parents/.test(msg), msg.slice(0, 120));
    const re = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.realEstate, "", true);
    const btns = (Array.from(re.getContentViewModels() as any) as any[]).filter((r) => r.getButtons).flatMap((r) => r.getButtons());
    check("…can look for a place to buy or rent", btns.some((b: any) => b.getTitle() === "Homes for Sale" && b.getEnabled()) && btns.some((b: any) => b.getTitle() === "Homes for Rent" && b.getEnabled()));
    const move = btns.find((b: any) => b.getTitle() === "Move here");
    check("…and move to basic places", !!move);
    k.getRealEstate().moveToBasic(k, Housing.shared_room);
    check("moved out to a shared room", k.getHousingState().currentHousing().getType() === Housing.shared_room);
    check("adults can move back in while a parent is alive", Housing.INSTANCE.housingOptions(k).includes(Housing.parentsHouse));
    k.getRealEstate().moveToBasic(k, Housing.parentsHouse);
    keepAlive(k); k.applyWeekly(); clear();
    check("…moved back home and stays there", k.getHousingState().currentHousing().getType() === Housing.parentsHouse);
    for (let w = 0; w < W; w++) { keepAlive(k); k.applyWeekly(); clear(); }
    check("…still at home at 19", k.getAgeInYears() === 19 && k.getHousingState().currentHousing().getType() === Housing.parentsHouse);
    const kid2: any = start(LifeScenario.sandboxMode, (np) => np.initializeAge(12, true));
    check("a 12-year-old can't move out", !Housing.INSTANCE.housingOptions(kid2).includes(Housing.shared_room));
}

console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures ? 1 : 0);
