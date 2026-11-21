import { SocialPerson } from "../src/game/Social/SocialPerson";
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
import { Vampire, LifeActions, BECOMING, FEEDING, HIDING, ENDINGS, powerDefs, LifeActionCell, BLOOD_DIETS, BloodDietCell, THIRST_2_YEARS, WITHERED_CAP, WITHERED_WEEKS } from "../src/game/Lifepaths/Vampire";
import { AlertViewModel } from "../src/game/Managers/AlertViewModel";
import { AlertActionViewModel } from "../src/game/Managers/AlertActionViewModel";
import { AlertType } from "../src/game/Managers/AlertType";
const RATE = THIRST_2_YEARS;
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
import { HealthModelGenerator } from "../src/game/Controllers/HealthModelGenerator";
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
const tab = () => Array.from(new LifepathsModelGenerator().screen("vampire").getContentViewModels() as any) as any[];
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
    check("thirst: the bar takes 2 years (96 weeks) to fill on Feed by Hand (v0.22.0)", near(s.thirst, RATE) && near(RATE * 96, 100), String(s.thirst));
    s.thirst = 85;
    p.collectWeeklyValues();
    const san = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.sanity) as any).find((x: any) => x.getFirst() === "Thirst") as any;
    const hapT = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.happiness) as any).find((x: any) => x.getFirst() === "Thirst") as any;
    p.resetValuesThisWeek();
    check("at 80+ thirst: −3 sanity, −2 happiness a week (v0.22.0)", san != null && Number(san.getSecond()) === -3 && hapT != null && Number(hapT.getSecond()) === -2);
    const flow = Array.from(p.collectWeeklyCashFlow?.() ?? []).map((x: any) => String(x.getFirst?.() ?? x));
    check("diet is no longer charged to a vampire", !flow.some((t) => /Diet/.test(t)), flow.join("; "));
    LifeActions.perform(def(FEEDING, "animal"), p); clear();
    check("Animal Blood: −20 thirst (then the weekly rise)", near(s.thirst, 85 - 20 + RATE), String(s.thirst));
    const beforeHunt = s.thirst;
    s.suspicion = 0;
    withRandom(0.5, () => LifeActions.perform(def(FEEDING, "hunt"), p)); clear();
    check("Hunt at Night: −60 thirst, +10 suspicion", near(s.thirst, Math.max(0, beforeHunt - 60) + RATE) && s.suspicion === 10, `${s.thirst} ${s.suspicion}`);
    check("Blood Bank needs the power or a medical job", /Blood Bank Contact/.test(new LifeActionCell(def(FEEDING, "bloodBank")).requirementNotMetString(p) ?? ""));
    s.bloodPower = 10;
    LifeActions.perform(def(powerDefs(), "power-bloodBank"), p);
    check("buying a power spends blood power", Vampire.has("bloodBank", p) && s.bloodPower === 8);
    check("…and opens the Blood Bank", new LifeActionCell(def(FEEDING, "bloodBank")).requirementNotMetString(p) == null);
    s.thirst = 100;
    const realCollapse = Vampire.collapse; let collapsed = 0;
    (Vampire as any).collapse = () => { collapsed++; return 0; };
    keep(p); p.applyWeekly();
    (Vampire as any).collapse = realCollapse;
    check("at 100 thirst you collapse when the week ends (no frenzy)", collapsed === 1 && !titlesOf().includes("Frenzy") && !Vampire.state(p).collapsePending, titlesOf().join(","));
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
    p.setBirthMonth(3 - Math.floor((p.calendarWeeks() % 48) / 4));   // v0.26.0: April (spring sun: the normal −10)
    const s = Vampire.state(p);
    check("daytime leisure rows warn vampires (sunlight drains happiness)", /Daytime: −10 happiness/.test(Leisure.goToPark.getAdditionalDescription() ?? ""));
    check("night leisure doesn't", !/Daytime/.test(Leisure.pub.getAdditionalDescription() ?? ""));
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, -40, 0));
    const h1 = p.getAttributeState().getHealth(), hap1 = p.getAttributeState().getHappiness();
    Vampire.onLeisure(p, Leisure.goToPark);
    check("the park: −10 happiness, no health lost (v0.21.1)", Math.abs(p.getAttributeState().getHappiness() - (hap1 - 10)) < 0.01 && p.getAttributeState().getHealth() === h1, `${hap1} → ${p.getAttributeState().getHappiness()}, health ${h1} → ${p.getAttributeState().getHealth()}`);
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
    check("turned: Ana stops ageing, has an Eternal Bond badge, and is in your coven", Vampire.isTurned(ana) && ana.getAgeInWeeks() === a0 && Relationships.badges(ana).includes("Eternal Bond") && Vampire.coven(p).includes(ana), `${a0} → ${ana.getAgeInWeeks()}`);
    // v0.17.0 Eternal Bond
    check("Eternal Bond: you and your vampire partner", Vampire.bonded(p) && Vampire.bondedPartner(p) === ana);
    check("…you never drift apart", Relationships.drift(ana, p) === 0);
    check("…better odds against hunters (70%)", Vampire.fightWinChance(p) === 0.7);
    check("…Hunt Together, Dance Through the Night and Eternal Vows on their screen", ["Hunt Together", "Dance Through the Night", "Eternal Vows"].every((t) => titles(rows()).includes(t)));
    check("…and an Eternal Bond card on the Lifepaths tab", tab().some((r) => r.title === "Eternal Bond with Ana"));
    // v0.25.1: a partner you turned is a vampire too — no feeding on them
    const fp = new LifeActionCell(def(FEEDING, "partner"));
    check("v0.25.1: you can't feed on a partner you turned (locked, says why)", Vampire.willingPartner(p) == null && /Ana is a vampire too/.test(fp.requirementNotMetString(p) ?? "") && !LifeActions.perform(def(FEEDING, "partner"), p), fp.requirementNotMetString(p) ?? "");
    {
        const s = Vampire.state(p); s.thirst = 80; s.suspicion = 10; const sus = s.suspicion;
        withRandom(0.99, () => { LoveActions.perform(loveAction("huntTogether"), ana, p); }); clear();
        check("Hunt Together: −50 thirst, +6 suspicion (+2 more: your partner hunts alone on Feed by Hand)", near(s.thirst, 30 + RATE) && s.suspicion === sus + 8, `${s.thirst} ${s.suspicion}`);
        rich(p, 100000);
        LoveActions.perform(loveAction("eternalVows"), ana, p); clear();
        check("Eternal Vows: once every 10 years", new LoveActionCell(loveAction("eternalVows"), ana).requirementNotMetString(p) === "Once every 10 years");
        s.diet = "bags"; s.powers = [...(s.powers ?? []), "bloodBank"];
        const flow = (Array.from(p.collectWeeklyCashFlow() as any) as any[]).map((x: any) => `${x.getFirst()}=${x.getSecond()}`).join("|");
        check("…your partner shares your blood diet (for two, double cost)", /Blood Diet - Blood Bank Bags \(for two\)=-4000/.test(flow), flow);
        s.diet = "hand"; s.thirst = 0;
    }
    check("Coven shows her card on the Lifepaths tab", tab().some((r) => r.id === ana.getId()));
}

// ---------------------------------------------------------------- v0.16.0: health never decays, blood diets
{
    const s = Vampire.state(p);
    const hp = () => p.getAttributeState().getHealth();
    // health never decays for a vampire
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(-100, 0, 0));
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(60, 0, 0));
    s.thirst = 0; s.diet = "hand";
    const h0 = hp();
    p.getAttributeState().setDeltaValue(PersonAttribute.health, "Old age", -7);
    p.applyWeekly(); clear();
    check("a vampire's health never decays (weekly health losses are ignored)", hp() >= h0, `${h0} → ${hp()}`);
    check("…and the Health tab shows no decline for a vampire (Health: Good)", p.getHealthStatus().name() === "good");
    s.thirst = 100; s.weeksAtMaxThirst = 4;
    const h1 = hp();
    withRandom(0.99, () => { p.collectWeeklyValues(); });
    const starving = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.health) as any).some((x: any) => x.getFirst() === "Starving for blood");
    p.resetValuesThisWeek();
    check("…but starving for blood still hurts", starving && h1 === hp());
    s.thirst = 0; s.weeksAtMaxThirst = 0;
    // v0.21.1: nothing mortal can hurt a vampire; well-fed vampires heal
    {
        const h = hp();
        p.getAttributeState().setDeltaValueImmediate(new Modifiers(-30, 0, 0));
        check("mortal harm (an accident, a bad night out) doesn't lower a vampire's health", hp() === h, `${h} → ${hp()}`);
        Vampire.harming = true; p.getAttributeState().setDeltaValueImmediate(new Modifiers(-40, 0, 0)); Vampire.harming = false;
        check("…but a hunter's stake still does", hp() === Math.max(0, h - 40), `${h} → ${hp()}`);
        p.getAttributeState().setHealth(50);
        s.thirst = 10;
        withRandom(0.99, () => p.applyWeekly()); clear();
        check("a well-fed vampire heals +3 health a week", hp() >= 53, String(hp()));
        p.getAttributeState().setHealth(60);
        let low = 100;
        for (let w = 0; w < 52; w++) {
            s.thirst = 20;
            p.getAttributeState().setDeltaValue(PersonAttribute.health, "Junk food", -5);
            p.getAttributeState().setDeltaValueImmediate(new Modifiers(-10, 0, 0));
            Vampire.onWork(p);
            withRandom(0.99, () => p.applyWeekly()); clear();
            low = Math.min(low, hp());
        }
        check("a whole year of mortal damage and day jobs: health never drops", low >= 60 && hp() >= 60, `lowest ${low}, now ${hp()}`);
        check("Butcher's Blood keeps thirst going down (−3 a week)", BLOOD_DIETS.find((d) => d.id === "butcher")!.thirst === -3);
    }
    s.thirst = 0; s.weeksAtMaxThirst = 0;
    // blood diets
    check("seven blood diets", BLOOD_DIETS.length === 7 && BLOOD_DIETS.map((d) => d.title).join("|") === "Feed by Hand|Rats & Strays|Butcher's Blood|Blood Bank Bags|Nightly Hunting|Willing Donors|Rare Vintage");
    const hrows = Array.from(new HealthModelGenerator().generateViewModels().getContentViewModels() as any) as any[];
    check("Health tab: a Blood Diet section with Choose Menu", hrows.some((r) => r.title === "Blood Diet") && hrows.some((r) => r.title === "Feed by Hand") && hrows.some((r) => /Choose/i.test(text(r)) && r.title === HealthEvent.chooseMenu.getTitle()));
    const menu = Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.chooseDiet, null, true).getContentViewModels() as any) as any[];
    check("Choose Menu lists the blood diets (not food) for a vampire", BLOOD_DIETS.every((d) => menu.some((r) => r.title === d.title)) && !menu.some((r) => r.title === "Fast Food"), titles(menu).join(","));
    s.powers = (s.powers ?? []).filter((x: string) => x !== "bloodBank");
    check("Blood Bank Bags need Blood Bank Contact (or a medical job)", new BloodDietCell(BLOOD_DIETS[3]).requirementNotMetString(p) != null || Vampire.hasMedicalJob(p));
    new BloodDietCell(BLOOD_DIETS[1]).action(p); clear();
    check("pick Rats & Strays", Vampire.chosenDiet(p).id === "rats" && Vampire.state(p).diet === "rats");
    week(p, 1, false);
    check("Rats & Strays: half the rise (the bar fills in 4 years)", near(s.thirst, RATE / 2) && Vampire.fillText(RATE / 2) === "4 years", String(s.thirst));
    p.collectWeeklyValues();
    const hap = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.happiness) as any).some((x: any) => x.getFirst() === "Blood Diet - Rats & Strays");
    p.resetValuesThisWeek();
    check("…and it shows in your weekly changes (−3 happiness)", hap);
    new BloodDietCell(BLOOD_DIETS[6]).action(p); s.thirst = 50;
    week(p, 1, false);
    check("Rare Vintage: thirst −20 a week", s.thirst === 30, String(s.thirst));
    new BloodDietCell(BLOOD_DIETS[4]).action(p); s.thirst = 50; s.suspicion = 10;
    s.powers = (s.powers ?? []).filter((x: string) => x !== "mindFog");
    withRandom(0.99, () => week(p, 1, false));
    check("Nightly Hunting: thirst −20 and suspicion +4 a week", s.thirst === 30 && s.suspicion === 14, `${s.thirst} ${s.suspicion}`);
    check("Lifepaths Feeding shows your Blood Diet with Change", tab().some((r) => r.title === "Blood Diet: Nightly Hunting"));
    check("the Thirst meter says it falls on your diet", /Falls 20 a week/.test(text(tab())));
    const old: any = Object.create(Object.getPrototypeOf(s)); Object.assign(old, s); delete old.diet;
    const real = p.vampire; p.vampire = old;
    check("older saves: no diet = Feed by Hand", Vampire.diet(p).id === "hand");
    p.vampire = real; s.diet = "hand"; s.thirst = 0; s.suspicion = 0;
}

// ---------------------------------------------------------------- v0.22.0: collapse — decades lost, and a Withered body
{
    const s = Vampire.state(p);
    check("Feed by Hand fills the bar in 2 years", Vampire.fillText(Vampire.thirstPerWeekFor(p)) === "2 years");
    check("the Thirst meter warns about collapsing for 10 to 40 years", /fills in 2 years.*10 to 40 years/.test(text(tab())));
    // a job, a mortal partner, cash, blood power: all at stake
    rich(p, 1_000_000);
    const job = p.getJobState().getCurrentJob();
    const ana = p.getFamilyState().getPartner();
    s.bloodPower = 9; s.suspicion = 50; s.thirst = 100;
    const cash0 = Number(p.getMoneyState().getCash().toString());
    const cal0 = p.calendarWeeks(); const age0 = p.getAgeInWeeks(); const col0 = s.collapses ?? 0;
    const W = 48;
    const t0 = Date.now();
    keep(p); p.applyWeekly();
    const ms = Date.now() - t0;
    const yrs = (p.calendarWeeks() - cal0) / W;
    const t: string[] = []; let c: any = null;
    for (let i = 0; i < 20 && alerts.length; i++) { const a = alerts.shift(); const ti = a.getTitle?.() ?? a.title; t.push(ti); if (ti === "You Collapsed") c = a; AlertManager.INSTANCE.alertDismissed(a); }
    check("at 100 thirst you collapse: 10–40 years pass", yrs >= 10 && yrs < 41.5, `${yrs.toFixed(1)} years`);
    check("…in reasonable time", ms < 60000, `${ms} ms`);
    check("…you're still alive and your body didn't age", GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted() && GameStateManager.INSTANCE.getPersonState() === p && p.getAgeInWeeks() === age0);
    check("…one alert: You Collapsed (everything else is summed up in it)", c != null && t.filter((x) => x === "You Collapsed").length === 1 && t.length <= 3, t.join(","));
    check("…someone found you and gave you blood: thirst 40, a new friend at 650", s.thirst === 40 && /found you/.test(text(c)) && /is your friend now/.test(text(c)));
    check("…consequence: half your cash is gone (you were declared missing)", Math.abs(Number(p.getMoneyState().getCash().toString()) / (cash0 / 2) - 1) < 0.001, `${cash0} → ${p.getMoneyState().getCash()}`);
    check("…your vampire partner waited for you", p.getFamilyState().getPartner() === ana && /never stopped looking/.test(text(c)));
    check("…consequence: your job is gone", job == null || (p.getJobState().getCurrentJob() == null && /your job/.test(text(c))));
    check("…consequence: half your blood power withered", s.bloodPower === 4 || s.bloodPower >= 4 && s.bloodPower <= 4 + Math.ceil(yrs) * 2, String(s.bloodPower));
    check("…consequence: Withered body — 20 health, 2 years", p.getAttributeState().getHealth() === 20 && s.witheredWeeks === WITHERED_WEEKS && /Withered/.test(text(c)));
    check("…suspicion faded (the world forgot you), collapse counted", s.suspicion < 30 && s.collapses === col0 + 1, `${s.suspicion}`);
    check("…everything is switched back on afterwards", AlertManager.muted == null && MoneyState.frozen === false && !s.inTorpor);
    check("Withered shows on the Vampire screen", tab().some((r) => r.title === "Withered"));
    clear();
    // Withered: no healing, health capped at 50, −1 happiness a week
    p.collectWeeklyValues();
    const heal = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.health) as any).some((x: any) => x.getFirst() === "Vampire healing");
    const wh = Array.from(p.getAttributeState().getDeltaThisWeek(PersonAttribute.happiness) as any).some((x: any) => x.getFirst() === "Withered body");
    p.resetValuesThisWeek();
    check("Withered: no vampire healing, −1 happiness a week", !heal && wh);
    week(p, 2);
    check("Withered: health can't go above " + WITHERED_CAP, p.getAttributeState().getHealth() <= WITHERED_CAP, String(p.getAttributeState().getHealth()));
    s.witheredWeeks = 1; week(p, 1);
    check("…and after two years it wears off", s.witheredWeeks === 0 && !tab().some((r) => r.title === "Withered"));
    // while collapsed nobody answers alerts: "Okay" ones still happen, questions are declined
    {
        let ok = 0, no = 0, yesB = 0;
        const mk = (neg: boolean) => new AlertViewModel("T", "m", 0, null, null, new AlertActionViewModel("Okay", { invoke: () => { if (neg) yesB++; else ok++; return null; } }),
            neg ? new AlertActionViewModel("No", { invoke: () => { no++; return null; } }) : null, null, AlertType.Alert, 0, null);
        AlertManager.muted = [];
        AlertManager.showAlert$default(AlertManager.INSTANCE, mk(false), false, 2, null);
        AlertManager.showAlert$default(AlertManager.INSTANCE, mk(true), false, 2, null);
        const n = AlertManager.muted.length; AlertManager.muted = null;
        check("muted alerts: Okay-only actions run, questions get No", ok === 1 && no === 1 && yesB === 0 && n === 2 && alerts.length === 0, `${ok} ${no} ${yesB} ${n}`);
    }
    // a mortal partner doesn't wait
    p.getFamilyState().breakUp(); clear();
    lover(p, Sex.male, "Tom", 900);
    Vampire.collapse(p, 0);
    const c2 = alerts.find((a) => (a.getTitle?.() ?? a.title) === "You Collapsed") ?? (clear(), null);
    check("consequence: a mortal partner has you declared dead and moves on", p.getFamilyState().getPartner() == null && (c2 == null || /Tom waited for years/.test(text(c2))));
    clear();
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
    s.thirst = 0; s.suspicion = 0;
}

// ---------------------------------------------------------------- v0.23.0: Fake Your Death resets your career
{
    const js = p.getJobState();
    const job = js.statesForPlayer(p)[0].getType();
    js.switchJob(job);
    const st = js.getState(job); st.level = 3; st.progress = 5; st.weeksInCareer = 200;
    const other = js.states.find((x: any) => x.getType() !== job); other.level = 2; other.weeksInCareer = 50;
    rich(p, 100000);
    const fd = def(HIDING, "fakeDeath");
    check("Fake Your Death warns that your career progress resets", /career progress/.test(new LifeActionCell(fd).getAdditionalDescription?.() ?? fd.note()) && /career progress/.test(fd.confirm()));
    Vampire.fakeDeath(p);
    const msg = alerts.find((a) => (a.getTitle?.() ?? a.title) === "A New Life");
    clear();
    check("Fake Your Death: job gone, every career back to level 1 with no progress", js.getCurrentJob() == null && st.level === 1 && st.progress === 0 && other.level === 1, `${st.level} ${st.progress} ${other.level}`);
    check("…and the years-in-career counter resets too", st.weeksInCareer === 0 && other.weeksInCareer === 0 && /career starts over/.test(text(msg)));
}

// ---------------------------------------------------------------- save, the Cure, Final Rest
{
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    const p2 = back.getSaveState().currentSlot().getPersonState();
    check("save keeps the vampire (thirst, powers, blood power)", p2.vampire?.isVampire === true && JSON.stringify(p2.vampire.powers) === JSON.stringify(Vampire.state(p).powers));
    const cure = def(ENDINGS, "cure");
    check("the Vampiric Cure costs $300 billion", new LifeActionCell(cure).costValue() === 300_000_000_000 && new LifeActionCell(cure).getTitle() === "Vampiric Cure");
    check("…you can't drink it without the money", !LifeActions.perform(cure, p));
    rich(p, 300_100_000_000);
    LifeActions.perform(cure, p); yes(); clear();
    week(p, 2, false);
    check("the Cure is working (still a vampire, no thirst) — 4 weeks in all", Vampire.isVampire(p) && Vampire.state(p).cureWeeks === 1, String(Vampire.state(p).cureWeeks));
    week(p, 1, false);
    check("after 4 weeks you're human again", !Vampire.isVampire(p) && Vampire.state(p).cured);
    check("one vampire life: you can't become a vampire again", Vampire.canBecome(p) === "You've already lived your one vampire life");
    check("…the Lifepaths tab says the path is closed (no Seek / Accept the Bite)", tab().some((r) => r.title === "Human Again") && !titles(tab()).includes("Accept the Bite") && !titles(tab()).includes("Seek the Ancient"));
    check("…and Accept the Bite does nothing", (Vampire.state(p).discovered = true, !LifeActions.perform(def(BECOMING, "bite"), p)) && !Vampire.isTurning(p));
    const before = alerts.length;
    withRandom(0, () => Vampire.maybeStranger(p, { name: () => "nightClub" }));
    check("…and no pale stranger appears", alerts.length === before);
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

// ---------------------------------------------------------------- v0.30.2: buy the Vampiric Cure for someone else
{
    const q: any = start(LifeScenario.sandboxMode, (np) => np.initializeAge(30, true));
    Vampire.rise(q); clear();
    const ana = lover(q, Sex.female, "Ana", 700);
    Relationships.meta(ana).knows = true; Vampire.state(q).bloodPower = 5;
    LoveActions.perform(loveAction("turn"), ana, q); clear();
    const rowsFor = (t: any) => titles(Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.personDetails, t.getId(), true).getContentViewModels() as any) as any[]);
    if (ana == null || !Vampire.isTurned(ana)) check("v0.30.2 setup: a turned partner to cure", false);
    else {
        check("v0.30.2: a vampire you turned has 'Buy Them the Vampiric Cure' on their screen", rowsFor(ana).includes("Buy Them the Vampiric Cure"));
        const cell = new LoveActionCell(loveAction("cureThem"), ana);
        check("…it costs the same as yours ($300 billion)", cell.costValue() === Vampire.curePrice, String(cell.costValue()));
        rich(q, 400_000_000_000);
        const cash0 = Number(q.getMoneyState().getCash().toString());
        LoveActions.perform(loveAction("cureThem"), ana, q);
        const ask = alerts.find((a) => (a.getTitle?.() ?? a.title) === "Buy Them the Vampiric Cure");
        check("…asks first", ask != null && /never be turned again/.test(text(ask)));
        if (ask) { alerts.splice(alerts.indexOf(ask), 1); ask.getPositiveButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(ask); }
        clear();
        check("…paid, and the Cure is working (4 weeks)", Number(q.getMoneyState().getCash().toString()) <= cash0 - Vampire.curePrice && Relationships.meta(ana).cureWeeks === Vampire.cureWeeks, `${cash0} → ${q.getMoneyState().getCash()}`);
        check("…can't buy it twice", /already taking the Cure/.test(new LoveActionCell(loveAction("cureThem"), ana).requirementNotMetString(q) ?? ""));
        week(q, Vampire.cureWeeks);
        const a0 = ana.getAgeInWeeks();
        check("…after 4 weeks they're human: no longer a vampire, not in your coven, no Eternal Bond", !Vampire.isTurned(ana) && !Vampire.coven(q).includes(ana) && !Vampire.bonded(q));
        check("…and you're still a vampire (it was their cure, not yours)", Vampire.isVampire(q));
        week(q, W);
        check("…they start ageing again", ana.getAgeInWeeks() >= a0 + W, `${a0} → ${ana.getAgeInWeeks()}`);
        check("…and can't be turned again (their one vampire life)", /one vampire life/.test(new LoveActionCell(loveAction("turn"), ana).requirementNotMetString(q) ?? "") && !rowsFor(ana).includes("Buy Them the Vampiric Cure"));
    }
    // a friend from the coven, bought the Cure by someone who isn't a vampire any more
    const f = SocialPerson.make("friend", Sex.male, null, 30 * W);
    Relationships.circle(q).add(f); const m = Relationships.circle(q).metaFor(f.id); m.vampire = true; m.knows = true;
    Vampire.state(q).isVampire = false; Vampire.state(q).cured = true;
    check("…works for friends too, even when you're human", rowsFor(f).includes("Buy Them the Vampiric Cure"));
    Vampire.cureOther(q, f); clear();
    week(q, Vampire.cureWeeks);
    const f0 = f.getAgeInWeeks();
    week(q, 4);
    check("…the friend is human and ageing", !Vampire.isTurned(f) && f.getAgeInWeeks() === f0 + 4);
    const human = SocialPerson.make("friend", Sex.female, null, 30 * W); Relationships.circle(q).add(human);
    check("…and the option isn't there for people who aren't vampires", !rowsFor(human).includes("Buy Them the Vampiric Cure"));
}

console.log(failures ? `${failures} FAILED` : "ALL PASSED");
if (failures) process.exit(1);
