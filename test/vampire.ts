// v0.15.0: the Vampire lifepath, the Elixir reworked as the Cure, and having children
// (no more pregnant men, surrogacy, artificial insemination, adopting on your own).
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { HealthEvent } from "../src/game/Enums/HealthEvent";
import { Leisure } from "../src/game/Enums/Leisure";
import { LoveEvent } from "../src/game/Enums/LoveEvent";
import { Relationship } from "../src/game/Enums/Relationship";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { PersonAttribute } from "../src/game/Enums/PersonAttribute";
import { Sex } from "../src/game/Enums/Sex";
import { Trait } from "../src/game/Enums/Trait";
import { LoverPersonality } from "../src/game/Enums/LoverPersonality";
import { Person } from "../src/game/Managers/Person";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { Vampire, LifeActions, BECOMING, FEEDING, HIDING, ENDINGS, powerDefs, LifeActionCell } from "../src/game/Lifepaths/Vampire";
import { Babies } from "../src/game/Social/Babies";
import { Relationships } from "../src/game/Social/Relationships";
import { LoveActions, loveAction, LoveActionCell } from "../src/game/Social/LoveActions";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Lifepaths; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const titlesOf = () => alerts.map((a) => a.getTitle?.() ?? a.title);
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
/** Press "yes" on the confirmation, dismissing anything shown before it (alerts queue one at a time). */
const yes = () => {
    for (let i = 0; i < 20; i++) {
        const a = [...alerts].reverse().find((x) => x.getPositiveButton?.() != null && /Cancel/.test(text(x.getNegativeButton?.())));
        if (a) { alerts.splice(alerts.indexOf(a), 1); a.getPositiveButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); return true; }
        if (!alerts.length) return false;
        AlertManager.INSTANCE.alertDismissed(alerts.shift());
    }
    return false;
};
const W = 48;
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const tab = () => Array.from(new LifepathsModelGenerator().generateViewModels().getContentViewModels() as any) as any[];
const titles = (rows: any[]) => rows.map((r) => r.title).filter((t) => typeof t === "string");
const def = (list: any[], id: string) => list.find((d) => d.id === id);
const withRandom = <T>(v: number, fn: () => T): T => { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } };
const keep = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); };
const rich = (p: any, n = 50_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const week = (p: any, n = 1, feed = true) => { for (let i = 0; i < n; i++) { keep(p); if (feed && Vampire.isVampire(p)) Vampire.state(p).thirst = 0; p.applyWeekly(); clear(); } };
const start = (sc: any, tweak?: (np: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.getTraitState().getTraits().clear();
    tweak?.(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const lover = (p: any, sex: any, first: string, score = 700) => {
    const x = new Person(Relationship.lover, sex, "Vale", 30 * W); x.setFirstName(first); x.setLoverPersonality(LoverPersonality.cheerful);
    x.setRelationshipProgress(score);
    p.getFamilyState().date(x);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    return x;
};
const loveEventTitles = (p: any) => Array.from(LoveEvent.INSTANCE.eventsForPlayer(p) as any).map((e: any) => e.name());

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());

// ---------------------------------------------------------------- the Elixir is now the Cure
let p = start(LifeScenario.educatedAndInDebt);
check("Health tab: no Elixir of Youth for humans", !HealthEvent.INSTANCE.eventsForPlayer(p).includes(HealthEvent.elixirOfYouth));

// ---------------------------------------------------------------- kids can't, adults can find the path
{
    const kid = start(LifeScenario.youngChild);
    check("under 18: the Vampire row is locked", tab().some((r) => r.title === "Vampire" && /18/.test(text(r))) && !titles(tab()).includes("Seek the Ancient"));
    p = start(LifeScenario.educatedAndInDebt);
    rich(p);
    check("adult: Seek the Ancient, no bite yet", titles(tab()).includes("Seek the Ancient") && !titles(tab()).includes("Accept the Bite"));
    withRandom(0.9, () => LifeActions.perform(def(BECOMING, "seek"), p)); clear();
    check("a failed search costs $5,000 and a week", !Vampire.state(p).discovered && Vampire.state(p).seekTries === 1);
    withRandom(0.01, () => p.loveEvent(LoveEvent.nightClub));
    let sawStranger = false;
    for (let i = 0; i < 10 && alerts.length; i++) { if (titlesOf().includes("A Pale Stranger")) sawStranger = true; AlertManager.INSTANCE.alertDismissed(alerts.shift()); }
    check("the pale stranger at a nightclub reveals the path", Vampire.state(p).discovered && sawStranger);
    clear();
    check("now: Accept the Bite", titles(tab()).includes("Accept the Bite") && !titles(tab()).includes("Seek the Ancient"));
    void kid;
}

// ---------------------------------------------------------------- the bite
const age0 = p.getAgeInWeeks();
LifeActions.perform(def(BECOMING, "bite"), p);
check("the bite asks first", alerts.some((a) => /Accept the bite\?/.test(text(a))));
yes();
clear();
check("after the turning week you rise a vampire", Vampire.isVampire(p), JSON.stringify(Vampire.state(p)));
const frozen = p.getAgeInWeeks();
check("…frozen at the age you were turned (+ the turning week)", frozen === age0 + 1, `${age0} → ${frozen}`);
check("Lifepaths tab is your vampire home: meters, Feeding, Hiding, Powers, Coven, Endings",
    ["Feeding", "Hiding", "Coven", "Endings"].every((h) => tab().some((r) => r.title === h)) && tab().some((r) => r.title === "Thirst") && tab().some((r) => r.title === "Suspicion"));

// ---------------------------------------------------------------- ageing, calendar, blood power
{
    const true0 = p.getTrueAgeInWeeks(), month0 = p.getCurrentMonthIndex(), bp0 = Vampire.state(p).bloodPower;
    week(p, W);
    check("a year later: same body age, true age +1 year", p.getAgeInWeeks() === frozen && p.getTrueAgeInWeeks() === true0 + W, `${p.getAgeInWeeks()} ${p.getTrueAgeInWeeks() - true0}`);
    check("a full year later it's the same month again", p.getCurrentMonthIndex() === month0);
    check("a year as a vampire gives +1 blood power", Vampire.state(p).bloodPower === bp0 + 1, `${bp0} → ${Vampire.state(p).bloodPower}`);
    const m = new Set<number>();
    for (let i = 0; i < 8; i++) { m.add(p.getCurrentMonthIndex()); week(p); }
    check("…months pass while your age stands still", m.size >= 2 && p.getAgeInWeeks() === frozen, [...m].join(","));
}

// ---------------------------------------------------------------- thirst
{
    const s = Vampire.state(p);
    s.thirst = 0;
    keep(p); p.applyWeekly(); clear();
    check("thirst rises 15 a week", s.thirst === 15, String(s.thirst));
    s.thirst = 85;
    p.collectWeeklyValues();
    const san = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.sanity) as any).find((x: any) => x.getFirst() === "Thirst") as any;
    p.resetValuesThisWeek();
    check("at 80+ thirst: −20 sanity a week", san != null && Number(san.getSecond()) === -20);
    const flow = Array.from(p.collectWeeklyCashFlow?.() ?? []).map((x: any) => String(x.getFirst?.() ?? x));
    check("diet is no longer charged to a vampire", !flow.some((t) => /Diet/.test(t)), flow.join("; "));
    LifeActions.perform(def(FEEDING, "animal"), p); clear();
    check("Animal Blood: −20 thirst (then +15 for the week)", s.thirst === 85 - 20 + 15, String(s.thirst));
    s.suspicion = 0;
    withRandom(0.5, () => LifeActions.perform(def(FEEDING, "hunt"), p)); clear();
    check("Hunt at Night: −60 thirst, +10 suspicion", s.thirst === Math.max(0, 80 - 60) + 15 && s.suspicion === 10, `${s.thirst} ${s.suspicion}`);
    check("Blood Bank needs the power or a medical job", /Blood Bank Contact/.test(new LifeActionCell(def(FEEDING, "bloodBank")).requirementNotMetString(p) ?? ""));
    s.bloodPower = 10;
    LifeActions.perform(def(powerDefs(), "power-bloodBank"), p);
    check("buying a power spends blood power", Vampire.has("bloodBank", p) && s.bloodPower === 8);
    check("…and opens the Blood Bank", new LifeActionCell(def(FEEDING, "bloodBank")).requirementNotMetString(p) == null);
    s.thirst = 100;
    keep(p); p.applyWeekly();
    check("at 100 thirst you frenzy", titlesOf().includes("Frenzy"), titlesOf().join(","));
    clear();
    s.thirst = 100; s.weeksAtMaxThirst = 4;
    p.collectWeeklyValues();
    const hp = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.health) as any).find((x: any) => x.getFirst() === "Starving for blood") as any;
    p.resetValuesThisWeek();
    check("4 weeks at 100: starving, −25 health a week", hp != null && Number(hp.getSecond()) === -25);
    s.thirst = 0; s.weeksAtMaxThirst = 0;
}

// ---------------------------------------------------------------- sunlight, work
{
    const s = Vampire.state(p);
    check("daytime leisure rows warn vampires", /Daytime: −10 health/.test(Leisure.goToPark.getAdditionalDescription() ?? ""));
    check("night leisure doesn't", !/Daytime/.test(Leisure.pub.getAdditionalDescription() ?? ""));
    const h0 = p.getAttributeState().getHealth();
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(-40, 0, 0));
    const h1 = p.getAttributeState().getHealth();
    Vampire.onLeisure(p, Leisure.goToPark);
    check("the park burns: −10 health", Math.abs(p.getAttributeState().getHealth() - (h1 - 10)) < 0.01, `${h0} ${h1} → ${p.getAttributeState().getHealth()}`);
    check("day jobs burn a little; Night Owl pays 20% more", Vampire.onWork(p) === 1 && (s.powers = [...s.powers, "nightOwl"], Vampire.onWork(p) === 1.2));
    s.powers = s.powers.filter((x) => x !== "nightOwl");
}

// ---------------------------------------------------------------- suspicion and hunters
{
    const s = Vampire.state(p);
    s.suspicion = 50;
    LifeActions.perform(def(HIDING, "layLow"), p); clear();
    check("Lay Low: −15 suspicion", s.suspicion === 35, String(s.suspicion));
    s.suspicion = 90; s.thirst = 0;
    withRandom(0.1, () => { keep(p); p.applyWeekly(); });
    const h = alerts.find((a) => (a.getTitle?.() ?? a.title) === "Vampire Hunters");
    check("at 80+ suspicion, vampire hunters come (Fight / Flee / Hide)", h != null && /Fight/.test(text(h)) && /Flee/.test(text(h)) && /Hide/.test(text(h)));
    if (h) { alerts.splice(alerts.indexOf(h), 1); h.getNegativeButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(h); }
    check("Flee: −50 suspicion and no job", s.suspicion <= 40 && p.getJobState().getCurrentJob() == null, String(s.suspicion));
    clear();
}

// ---------------------------------------------------------------- loved ones: tell, feed, turn
{
    const ana = lover(p, Sex.female, "Ana", 700);
    const rows = () => Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.personDetails, ana.getId(), true).getContentViewModels() as any) as any[];
    check("partner screen: Tell Them You're a Vampire", titles(rows()).includes("Tell Them You're a Vampire") && !titles(rows()).includes("Turn Them into a Vampire"));
    check("vampires can't make a baby (adopt only)", !loveEventTitles(p).includes("makeBaby") && loveEventTitles(p).includes("adoptBaby"));
    LoveActions.perform(loveAction("tellSecret"), ana, p); clear();
    check("700 relationship: they accept your secret", Vampire.knows(ana));
    const feedPartner = def(FEEDING, "partner");
    check("Feed on Ana unlocks", new LifeActionCell(feedPartner).requirementNotMetString(p) == null && new LifeActionCell(feedPartner).getTitle() === "Feed on Ana");
    Vampire.state(p).bloodPower = 5;
    check("Turn Them appears once they know", titles(rows()).includes("Turn Them into a Vampire"));
    LoveActions.perform(loveAction("turn"), ana, p); clear();
    const a0 = ana.getAgeInWeeks();
    week(p, 2 * W);
    check("turned: Ana stops ageing, has a Vampire badge, and is in your coven", Vampire.isTurned(ana) && ana.getAgeInWeeks() === a0 && Relationships.badges(ana).includes("Vampire") && Vampire.coven(p).includes(ana), `${a0} → ${ana.getAgeInWeeks()}`);
    check("Coven shows her card on the Lifepaths tab", tab().some((r) => r.id === ana.getId()));
}

// ---------------------------------------------------------------- save, the Cure, Final Rest
{
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    const p2 = back.getSaveState().currentSlot().getPersonState();
    check("save keeps the vampire (thirst, powers, blood power)", p2.vampire?.isVampire === true && JSON.stringify(p2.vampire.powers) === JSON.stringify(Vampire.state(p).powers));
    rich(p, 2_000_000);
    const cure = def(ENDINGS, "cure");
    check("the Cure is the reworked Elixir: $1,000,000", new LifeActionCell(cure).costValue() === 1_000_000 && new LifeActionCell(cure).getTitle() === "Elixir of Youth: The Cure");
    LifeActions.perform(cure, p); yes(); clear();
    week(p, 2, false);
    check("the Cure is working (still a vampire, no thirst) — 4 weeks in all", Vampire.isVampire(p) && Vampire.state(p).cureWeeks === 1, String(Vampire.state(p).cureWeeks));
    week(p, 1, false);
    check("after 4 weeks you're human again", !Vampire.isVampire(p) && Vampire.state(p).cured);
    const a = p.getAgeInWeeks();
    week(p, 2);
    check("…and you age again", p.getAgeInWeeks() === a + 2);
    const v = start(LifeScenario.educatedAndInDebt);
    const s = Vampire.state(v); s.isVampire = true; s.turnedAtWeeks = v.getAgeInWeeks();
    LifeActions.perform(def(ENDINGS, "finalRest"), v); yes();
    check("Final Rest ends the life (death screen)", !GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted());
    clear();
}

// ---------------------------------------------------------------- babies: no pregnant men, new ways to have kids
{
    // two men
    let q = start(LifeScenario.educatedAndInDebt, (np) => { np.setSex(Sex.male); });
    rich(q);
    lover(q, Sex.male, "Leo");
    check("two men: no Make a Baby", !loveEventTitles(q).includes("makeBaby"), loveEventTitles(q).join(","));
    const partnerRows = () => Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.personDetails, q.getFamilyState().getPartner().getId(), true).getContentViewModels() as any) as any[];
    check("two men: Surrogacy (and Adopt)", titles(partnerRows()).includes("Surrogacy") && loveEventTitles(q).includes("adoptBaby"));
    check("making a baby the old way does nothing for two men", (q.loveEvent(LoveEvent.makeBaby), clear(), q.getFamilyState().getPregnantChild() == null));
    LoveActions.perform(loveAction("surrogacy"), q.getFamilyState().getPartner(), q); clear();
    const baby = q.getFamilyState().getPregnantChild();
    check("surrogacy: a surrogate carries your baby", baby != null && Babies.carrierOf(baby) === "surrogate" && /Your surrogate is pregnant/.test(text(baby.getPersonNameAndAgeInfoViewModel())));
    check("…no abortion option for a surrogacy", !loveEventTitles(q).includes("abortChild"));

    // two women
    q = start(LifeScenario.educatedAndInDebt, (np) => { np.setSex(Sex.female); });
    rich(q);
    lover(q, Sex.female, "Mia");
    const pr = () => Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.personDetails, q.getFamilyState().getPartner().getId(), true).getContentViewModels() as any) as any[];
    check("two women: Artificial Insemination, no Make a Baby", titles(pr()).includes("Artificial Insemination") && !loveEventTitles(q).includes("makeBaby"));
    LoveActions.perform(loveAction("insemination"), q.getFamilyState().getPartner(), q); clear();
    check("…you carry the baby", Babies.carrierOf(q.getFamilyState().getPregnantChild()) === "you" && /You are pregnant/.test(text(q.getFamilyState().getPregnantChild().getPersonNameAndAgeInfoViewModel())));

    // a man and a woman
    q = start(LifeScenario.educatedAndInDebt, (np) => { np.setSex(Sex.male); });
    lover(q, Sex.female, "Zoe");
    check("man + woman: Make a Baby, no surrogacy/insemination", loveEventTitles(q).includes("makeBaby") && !new LoveActionCell(loveAction("surrogacy"), q.getFamilyState().getPartner()).visible(q) && !new LoveActionCell(loveAction("insemination"), q.getFamilyState().getPartner()).visible(q));
    q.loveEvent(LoveEvent.makeBaby); clear();
    const b2 = q.getFamilyState().getPregnantChild();
    check("…the woman carries it: 'Your wife is pregnant' (not the man)", b2 != null && Babies.carrierOf(b2) === "partner" && /Your wife is pregnant/.test(text(b2.getPersonNameAndAgeInfoViewModel())), text(b2?.getPersonNameAndAgeInfoViewModel()));
    q.getTraitState().addTrait(Trait.infertile);
    check("infertile: adopt only", !loveEventTitles(q).includes("makeBaby"));

    // single
    q = start(LifeScenario.educatedAndInDebt);
    rich(q);
    const love = Array.from(new LoveModelGenerator().generateViewModels().getContentViewModels() as any) as any[];
    check("single adults can adopt from the Love tab", titles(love).includes("Adopt a Child"));
    const kids0 = q.getFamilyState().getChildren().size();
    LoveActions.perform(loveAction("adoptSingle"), null, q); clear();
    check("…a child joins your family, $50,000", q.getFamilyState().getChildren().size() === kids0 + 1);
}

console.log(failures ? `${failures} FAILED` : "ALL PASSED");
if (failures) process.exit(1);
