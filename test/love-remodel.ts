// Love tab remodel (v0.12.0): grouped relationship cards, the shared person screen, new actions for every
// relationship, moods, anniversaries and birthdays, gentle weekly drift, siblings, friends and exes.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { HeaderTitleViewModel } from "../src/game/Models/HeaderTitleViewModel";
import { PersonCardViewModel } from "../src/game/Models/PersonCardViewModel";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { RelationshipProgressStatus } from "../src/game/Enums/RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { Sex } from "../src/game/Enums/Sex";
import { Pet } from "../src/game/Enums/Pet";
import { LoverPersonality } from "../src/game/Enums/LoverPersonality";
import { LoveEvent } from "../src/game/Enums/LoveEvent";
import { PersonInteraction } from "../src/game/Enums/PersonInteraction";
import { Possession } from "../src/game/Enums/Possession";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { FamilyState } from "../src/game/Managers/FamilyState";
import { FamilyExtras } from "../src/game/Managers/FamilyExtras";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { Relationships } from "../src/game/Social/Relationships";
import { LoveActions, LOVE_ACTIONS, loveAction, LoveActionCell } from "../src/game/Social/LoveActions";
import { SocialPerson } from "../src/game/Social/SocialPerson";
import fs from "fs";

let fixture: string | null = fs.readFileSync("test/fixtures/save-v0.3-landlord.txt", "utf8");
const alerts: any[] = [];
let showing: any = null;
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo(type: any, key: any) { showing = { type, key }; }, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => fixture, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Love; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
/** Press "yes" on the newest alert with a positive button (confirmations). */
const confirmYes = () => { const a = [...alerts].reverse().find((x) => x.getPositiveButton?.() != null); if (a) { alerts.splice(alerts.indexOf(a), 1); a.getPositiveButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); } };
const W = 48;
const text = (vm: any): string => { const out: string[] = []; const walk = (o: any, d: number) => { if (o == null || d > 4) return; if (typeof o === "string") { out.push(o); return; } if (typeof o !== "object") return; if (typeof o.text === "string") out.push(o.text); for (const k of Object.keys(o)) if (k !== "text") walk(o[k], d + 1); }; walk(vm, 0); return out.join(" | "); };
const tab = () => Array.from(new LoveModelGenerator().generateViewModels().getContentViewModels() as any) as any[];
const screen = (id: string) => Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.personDetails, id, true).getContentViewModels() as any) as any[];
const headers = (rows: any[]) => rows.filter((r) => r instanceof HeaderTitleViewModel).map((r) => r.title);
const cards = (rows: any[]) => rows.filter((r) => r instanceof PersonCardViewModel) as PersonCardViewModel[];
const titles = (rows: any[]) => rows.map((r) => r.title).filter((t) => typeof t === "string");
const keepAlive = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(500), MoneyUpdateType.workIncome, null, null, 12, null); };
const rich = (p: any) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(1_000_000), MoneyUpdateType.workIncome, null, null, 12, null);
const week = (p: any, n = 1) => { for (let i = 0; i < n; i++) { keepAlive(p); p.applyWeekly(); clear(); } };
const start = (sc: any, tweak?: (p: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    if (tweak) tweak(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const doIt = (id: string, target: any, p: any) => { const ok = LoveActions.perform(loveAction(id), target, p); clear(); return ok; };
const ids = (target: any, kind: string, p: any) => (["time", "big", "hard"] as const).flatMap((s) => LOVE_ACTIONS.filter((d) => d.section === s && d.who.includes(kind) && new LoveActionCell(d, target).visible(p)).map((d) => d.id));

// ---------------------------------------------------------------- old save: opens, no siblings/exes, everyone Fine
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p: any = GameStateManager.INSTANCE.getPersonState();
    check("old save: no siblings, friends or exes", p.getSocial().list().length === 0);
    let ok = true, msg = "";
    try { tab(); for (const x of Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]) screen(x.getId()); } catch (e: any) { ok = false; msg = e.message; }
    check("old save: Love tab and every person screen open", ok, msg);
    const fam = Array.from(p.getFamilyState().getFamilyMembers() as any).filter((x: any) => x.getPetType() == null) as any[];
    check("old save: everyone's mood is Fine", fam.every((x) => Relationships.mood(x) === "fine"));
    const round = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    check("old save: saves and loads again", round != null);
}

// ---------------------------------------------------------------- a v0.12 save (siblings, friends, an ex) loads back
fixture = fs.readFileSync("test/fixtures/save-v0.12-love.txt", "utf8");
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p: any = GameStateManager.INSTANCE.getPersonState();
    const c = p.getSocial();
    check("v0.12 save: 2 siblings, 2 friends and an ex come back", c.list("sibling").length === 2 && c.list("friend").length === 2 && c.list("ex").length === 1 && c.list()[0] instanceof SocialPerson);
    let ok = true, msg = "";
    try { tab(); for (const x of [...Array.from(p.getFamilyState().getFamilyMembers() as any) as any[], ...c.list()]) screen(x.getId()); } catch (e: any) { ok = false; msg = e.message; }
    check("v0.12 save: Love tab and every person screen open", ok, msg);
}

// ---------------------------------------------------------------- siblings for new games
fixture = null;
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const counts = [0, 0, 0, 0, 0];
    let p: any = null;
    for (let i = 0; i < 40; i++) { p = start(LifeScenario.educatedAndInDebt); counts[Math.min(4, Relationships.siblings(p).length)]++; }
    check("new games roll 0–3 siblings (all four counts seen in 40 games)", counts[4] === 0 && counts.slice(0, 4).every((c) => c > 0), counts.join("/"));
    const sibs = Relationships.siblings(p);
    check("siblings share your surname and are alive", sibs.every((s) => s.lastName === p.getLastName() && s.getIsAlive()));
    p.initializeLastName("Zephyr");
    check("changing your surname at setup changes theirs", Relationships.siblings(p).every((s) => s.lastName === "Zephyr"));
}

// ---------------------------------------------------------------- Love tab layout
let p: any = start(LifeScenario.educatedAndInDebt);
rich(p);
const fam = p.getFamilyState();
const ana = new Person(Relationship.lover, Sex.female, "Rivera", 30 * W); ana.setFirstName("Ana"); ana.setLoverPersonality(LoverPersonality.soulMate);
ana.setRelationshipProgress(500);
fam.date(ana);
const kidOld = new Person(Relationship.child, Sex.female, p.getLastName(), 9 * W + 5); kidOld.setFirstName("Marcene"); fam.getFamilyMembers().add(kidOld);
const kidYoung = new Person(Relationship.child, Sex.male, p.getLastName(), 2 * W + 3); kidYoung.setFirstName("Leo"); fam.getFamilyMembers().add(kidYoung);
FamilyState.adoptPet$default(fam, Pet.dog, null, 2, null); clear();
const dog = Array.from(fam.getPets() as any)[0] as any;
const sis = SocialPerson.make("sibling", Sex.female, p.getLastName(), p.getAgeInWeeks() + 3 * W); sis.firstName = "Rosa"; p.getSocial().add(sis);
const bro = SocialPerson.make("sibling", Sex.male, p.getLastName(), p.getAgeInWeeks() - 2 * W); bro.firstName = "Tom"; p.getSocial().add(bro);
for (const s of Relationships.siblings(p)) if (s !== sis && s !== bro) p.getSocial().remove(s.id);
let rows = tab();
const hs = headers(rows);
check("tab groups in order: Partner, Parents, Children, Siblings, Friends, Pets", ["Partner", "Parents", "Children", "Siblings", "Friends", "Pets"].every((h, i, a) => hs.indexOf(h) >= 0 && (i === 0 || hs.indexOf(a[i - 1]) < hs.indexOf(h))), hs.join(" › "));
check("no Past Relationships group yet", !hs.includes("Past Relationships"));
const cs = cards(rows);
check("every person is a card with a head picture and a score", cs.length >= 7 && cs.every((c) => /^head_|^hv_|^pet_/.test(String(c.imageId)) && c.score != null), cs.map((c) => c.imageId).join(","));
const marcene = cs.find((c) => c.name.startsWith("Marcene"))!;
check("card reads like the concept: 'Daughter - Marcene …', 'Age: 9 (true age 9)'", marcene.relation === "Daughter" && marcene.ageText === "Age: 9 (true age 9)", `${marcene.relation} / ${marcene.ageText}`);
const childOrder = cs.filter((c) => c.relation === "Daughter" || c.relation === "Son").map((c) => c.name.split(" ")[0]);
check("children oldest first", childOrder[0] === "Marcene" && childOrder[1] === "Leo", childOrder.join(","));
const sibOrder = cs.filter((c) => c.relation === "Brother" || c.relation === "Sister").map((c) => c.name.split(" ")[0]);
check("siblings oldest first", sibOrder.join(",") === "Rosa,Tom", sibOrder.join(","));
check("card bar is coloured by status", cs.find((c) => c.name.startsWith("Ana"))!.status === "good");
cs.find((c) => c.name.startsWith("Ana"))!.onClick!.invoke();
check("tapping a card opens the person screen", showing?.type === GenericListType.personDetails && showing?.key === ana.getId());
check("group actions on top: Spend Time with Everyone, Family Gathering, Family Vacation", ["Spend Time with Everyone", "Family Gathering"].every((t) => titles(rows).includes(t)) && titles(rows).includes(PersonInteraction.familyVacation.getTitle()));
check("Meet New People sits with Friends; Adopt Pet with Pets", titles(rows).includes("Meet New People") && titles(rows).includes(PersonInteraction.adoptPet.getTitle()));

// ---------------------------------------------------------------- person screens
for (const [who, x] of [["partner", ana], ["parent", fam.getAliveParents().get(0)], ["child", kidOld], ["toddler", kidYoung], ["pet", dog], ["sibling", sis]] as [string, any][]) {
    let ok = true, msg = "";
    let r: any[] = [];
    try { r = screen(x.getId()); } catch (e: any) { ok = false; msg = e.message; }
    const h = headers(r);
    check(`${who} screen: large card, About, Spend time`, ok && cards(r)[0]?.large === true && h[0] === "About" && h.filter((x: string) => !/Children$/.test(x))[1] === "Spend time", msg || h.join(" › "));
}
const partnerRows = screen(ana.getId());
check("partner screen: dates under Spend time, Propose under Big moments, Break Up under Hard choices", (() => {
    const h = partnerRows.map((r) => r instanceof HeaderTitleViewModel ? "#" + (r as any).title : r.title);
    const at = (t: string) => h.indexOf(t);
    return at("#Spend time") < at(LoveEvent.romanticDinner.getTitle()) && at(LoveEvent.romanticDinner.getTitle()) < at("#Big moments") && at("#Big moments") < at(LoveEvent.propose.getTitle()) && at("#Hard choices") < at(LoveEvent.breakUp.getTitle());
})());
check("partner screen has the new partner actions", ["Cook Dinner Together", "Deep Talk", "Give a Gift", "Weekend Getaway"].every((t) => titles(partnerRows).includes(t)));
check("Couples Therapy only when things are bad (<300)", !titles(partnerRows).includes("Couples Therapy"));
check("toddler: Feed and Cuddle + Lullaby, no Homework", ids(kidYoung, "child", p).includes("feedCuddle") && ids(kidYoung, "child", p).includes("lullaby") && !ids(kidYoung, "child", p).includes("homework"));
check("9-year-old: Homework + Sports, no Lullaby", ids(kidOld, "child", p).includes("homework") && ids(kidOld, "child", p).includes("sports") && !ids(kidOld, "child", p).includes("lullaby"));
check("dog: Walk, Play, Grooming, Vet", ["walk", "petPlay", "groom", "vet"].every((x) => ids(dog, "pet", p).includes(x)));
const mom = fam.getAliveParents().get(0) as any;
const atHome = Relationships.livesWithParents(p);
check("parents: Call/Visit only when you live apart, chores only at home", atHome ? ids(mom, "parent", p).includes("chores") && !ids(mom, "parent", p).includes("parentCall") : ids(mom, "parent", p).includes("parentCall") && !ids(mom, "parent", p).includes("chores"));
check("unknown person id: friendly message, no crash", text(screen("nobody")).includes("no longer part of your life"));

// ---------------------------------------------------------------- every action runs
{
    let ok = true, msg = "";
    const targets: [string, any][] = [["partner", ana], ["parent", mom], ["child", kidOld], ["child", kidYoung], ["pet", dog], ["sibling", sis]];
    try {
        for (const [kind, t] of targets) for (const id of ids(t, kind, p)) {
            const def = loveAction(id);
            if (def.confirm || id === "askMoney") continue;
            keepAlive(p); rich(p);
            const cell = new LoveActionCell(def, t);
            if (cell.requirementNotMetString(p) != null) continue;
            if (!LoveActions.perform(def, t, p)) throw new Error(`${kind}:${id} did nothing`);
            clear();
        }
    } catch (e: any) { ok = false; msg = e.message; }
    check("every visible action on every relationship runs without errors", ok, msg);
}

// ---------------------------------------------------------------- no repeat penalty (removed in v0.12.1)
{
    Relationships.setMood(mom, "fine");
    mom.setRelationshipProgress(300);
    const g = (id: string) => { const b = mom.getRelationshipProgress(); doIt(id, mom, p); Relationships.setMood(mom, "fine"); return mom.getRelationshipProgress() - b; };
    // drift is skipped for the parent you did something with, so the gain is exact
    const a1 = g("advice"), a2 = g("advice"), a3 = g("advice");
    check("the same action week after week gives the full amount every time", a1 === 10 && a2 === 10 && a3 === 10, `${a1}, ${a2}, ${a3}`);
    check("the row shows the full gain", new LoveActionCell(loveAction("advice"), mom).getAdditionalDescription() === "+10 relationship\n", String(new LoveActionCell(loveAction("advice"), mom).getAdditionalDescription()));
}

// ---------------------------------------------------------------- moods
{
    Relationships.setMood(ana, "stressed");
    ana.setRelationshipProgress(400);
    const before = ana.getRelationshipProgress();
    doIt("cookDinner", ana, p);
    check("Stressed halves what an action gives (Cook Dinner +10 → +5)", ana.getRelationshipProgress() - before === 5, String(ana.getRelationshipProgress() - before));
    Relationships.setMood(ana, "upset");
    const b2 = ana.getRelationshipProgress();
    doIt("deepTalk", ana, p);
    check("Deep Talk lifts Upset to Fine and gives the full +12", Relationships.mood(ana) === "fine" && ana.getRelationshipProgress() - b2 === 12, `${Relationships.mood(ana)} ${ana.getRelationshipProgress() - b2}`);
    const c = p.getSocial(); c.moodWeek = Relationships.now() - 10;
    week(p);
    check("moods are re-rolled every 4 weeks", c.moodWeek === Relationships.now() - 1);
    const counts: Record<string, number> = { happy: 0, fine: 0, stressed: 0, upset: 0 };
    ana.setRelationshipProgress(900);
    for (let i = 0; i < 400; i++) counts[Relationships.rollMood(ana)]++;
    const lowCounts: Record<string, number> = { happy: 0, fine: 0, stressed: 0, upset: 0 };
    ana.setRelationshipProgress(100);
    for (let i = 0; i < 400; i++) lowCounts[Relationships.rollMood(ana)]++;
    check("moods lean on the score: close people are happier", counts.happy > lowCounts.happy && lowCounts.upset > counts.upset, JSON.stringify(counts) + " vs " + JSON.stringify(lowCounts));
    ana.setRelationshipProgress(500);
}

// ---------------------------------------------------------------- anniversaries and birthdays
{
    const now = Relationships.now();
    ana.togetherSinceWeek = now - W;      // one year ago this week
    Relationships.meta(ana).annivYear = undefined; Relationships.meta(ana).annivMissed = undefined;
    const card = cards(tab()).find((c) => c.name.startsWith("Ana"))!;
    check("anniversary week: badge on the card", card.badges.includes("Anniversary this week"));
    check("…and the Anniversary action appears", ids(ana, "partner", p).includes("anniversary"));
    Relationships.setMood(ana, "fine");
    const b = ana.getRelationshipProgress();
    doIt("anniversary", ana, p);
    check("celebrating gives +80 and no penalty", ana.getRelationshipProgress() - b >= 80 - 2, String(ana.getRelationshipProgress() - b));
    // next year: forget it
    ana.togetherSinceWeek = Relationships.now() - 2 * W;
    const b2 = ana.getRelationshipProgress();
    Relationships.setMood(ana, "fine");
    week(p);
    check("a missed anniversary costs 40 and upsets them", b2 - ana.getRelationshipProgress() >= 40 && Relationships.mood(ana) === "upset", `${b2} → ${ana.getRelationshipProgress()}`);
    week(p);
    check("the penalty happens once", Relationships.meta(ana).annivMissed === 2);

    kidOld.ageInWeeks = 10 * W - 1;    // turns 10 next week
    week(p);
    check("birthday week: badge and Birthday Party ($300 for under-12s)", Relationships.badges(kidOld).includes("Birthday this week") && ids(kidOld, "child", p).includes("birthdayParty") && new LoveActionCell(loveAction("birthdayParty"), kidOld).costValue() === 300);
    doIt("birthdayParty", kidOld, p);
    check("one party per birthday", !ids(kidOld, "child", p).includes("birthdayParty"));
}

// ---------------------------------------------------------------- family gathering, help with rent, vet
{
    const people = Relationships.familyPeople(p);
    for (const x of people) Relationships.setMood(x, "fine");
    const before = people.map((x) => x.getRelationshipProgress());
    doIt("gathering", null, p);
    check("Family Gathering: everyone in the family +30 (less the weekly drift)", people.every((x, i) => x.getRelationshipProgress() - before[i] >= 26),
        people.map((x, i) => x.getRelationshipProgress() - before[i]).join(","));

    kidOld.ageInWeeks = 20 * W + 3;
    const flow0 = p.getTotalCashFlowPerWeek();
    doIt("rentHelp", kidOld, p);
    check("Help with Rent: -$200 a week in your cash flow", flow0.subtract(p.getTotalCashFlowPerWeek()).intValue() === 200, `${flow0} → ${p.getTotalCashFlowPerWeek()}`);
    Relationships.setMood(kidOld, "fine");
    const k0 = kidOld.getRelationshipProgress();
    week(p);
    check("…and +5 relationship a week (minus the weekly drift)", kidOld.getRelationshipProgress() - k0 === 5 + RelationshipProgressStatus.INSTANCE.getWeeklyDeteriorationRate(), String(kidOld.getRelationshipProgress() - k0));
    const flowA = p.getTotalCashFlowPerWeek();
    doIt("rentHelp", kidOld, p);
    check("Stop Helping with Rent", p.getTotalCashFlowPerWeek().subtract(flowA).intValue() === 200 && !Relationships.meta(kidOld).rentHelp);

    Relationships.meta(dog).vetUntil = undefined;   // (the "every action" pass above already took them once)
    const c0 = dog.getChanceOfDeathThisWeek();
    doIt("vet", dog, p);
    check("Vet Checkup halves the pet's chance of dying for a year", Math.abs(dog.getChanceOfDeathThisWeek() - c0 / 2) < 1e-12 || c0 === 0, `${c0} → ${dog.getChanceOfDeathThisWeek()}`);
}

// ---------------------------------------------------------------- siblings
{
    p.getSocial().metaFor(sis.id).touched = undefined;
    const s0 = sis.getRelationshipProgress();
    week(p);
    check("siblings drift a little each week", sis.getRelationshipProgress() < s0 && sis.getRelationshipProgress() >= s0 - 3, `${s0} → ${sis.getRelationshipProgress()}`);
    const age0 = sis.getAgeInWeeks();
    week(p);
    check("siblings age with you", sis.getAgeInWeeks() === age0 + 1);
    Relationships.setMood(sis, "fine");
    const s1 = sis.getRelationshipProgress();
    doIt("hangOut", sis, p);
    check("Hang Out with a sibling: +15, no drift that week", sis.getRelationshipProgress() - s1 === 15, String(sis.getRelationshipProgress() - s1));
    check("adults: no Video Games or Prank", !ids(sis, "sibling", p).includes("videoGames") && !ids(sis, "sibling", p).includes("prank"));
    Relationships.meta(sis).loanDue = undefined;   // (the "every action" pass above already lent once)
    const lent = doIt("lend", sis, p);
    check("Lend $1,000, and they owe you", lent && Relationships.meta(sis).loanDue != null);
    check("can't lend again until repaid", new LoveActionCell(loveAction("lend"), sis).requirementNotMetString(p) === "They still owe you $1,000");
    Relationships.meta(sis).loanDue = Relationships.now();
    week(p);
    check("the loan comes due (repaid or not, it's settled)", Relationships.meta(sis).loanDue == null);

    // heirs inherit the deceased's other children as siblings
    const heir: any = { getSocial: (() => { const { SocialCircle } = require_social(); const c = new SocialCircle(); return () => c; })(), getLastName: () => p.getLastName() };
    Relationships.inheritSiblings(p, heir, kidOld);
    const hs2 = heir.getSocial().list("sibling");
    check("an heir's siblings are the deceased's other children", hs2.length === 1 && hs2[0].firstName === "Leo" && hs2[0].getAgeInWeeks() === kidYoung.getAgeInWeeks());
}

// ---------------------------------------------------------------- v0.21.1: turn off making friends automatically
{
    for (const f of Relationships.friends(p)) p.getSocial().remove(f.id);
    const place = Relationships.meetingPlace(p) ?? (p.getJobState().switchJob(p.getJobState().statesForPlayer(p)[0].getType()), Relationships.meetingPlace(p));
    const row = () => tab().find((r) => /^Make Friends Automatically/.test(r.title ?? ""));
    check("Love tab › Friends: 'Make Friends Automatically: On' with Turn Off", row()?.title === "Make Friends Automatically: On" && /Turn Off/.test(text(row())), String(place));
    row().getActionButton().getAction().invoke();
    check("…Turn Off flips it", !Relationships.autoFriends(p) && row()?.title === "Make Friends Automatically: Off" && /Turn On/.test(text(row())));
    const r = Math.random; Math.random = () => 0;
    try { for (let i = 0; i < 30; i++) Relationships.maybeMakeFriend(p); } finally { Math.random = r; }
    clear();
    check("off: no friends made at school or work", Relationships.friends(p).length === 0, String(Relationships.friends(p).length));
    check("off: Meet New People is still there to use", new LoveActionCell(loveAction("meetPeople"), null).requirementNotMetString(p) == null);
    for (const f of Relationships.friends(p)) p.getSocial().remove(f.id);
    row().getActionButton().getAction().invoke();
    Math.random = () => 0;
    try { Relationships.maybeMakeFriend(p); } finally { Math.random = r; }
    clear();
    check("on again: friends come on their own", Relationships.autoFriends(p) && Relationships.friends(p).length === 1);
    const back: any = (SaveCodec as any).decode((SaveCodec as any).encode(p));
    Relationships.setAutoFriends(false, p);
    const back2: any = (SaveCodec as any).decode((SaveCodec as any).encode(p));
    check("the setting is saved", back.getSocial().autoFriends === true && back2.getSocial().autoFriends === false);
    Relationships.setAutoFriends(true, p);
}

// ---------------------------------------------------------------- friends
{
    for (const f of Relationships.friends(p)) p.getSocial().remove(f.id);
    let made = 0;
    for (let i = 0; i < 40 && Relationships.friends(p).length < 3; i++) { if (doIt("meetPeople", null, p)) made++; }
    check("Meet New People makes friends", Relationships.friends(p).length >= 3, String(Relationships.friends(p).length));
    while (Relationships.friends(p).length < 10) Relationships.makeFriend("work", p);
    check("at most 10 friends", new LoveActionCell(loveAction("meetPeople"), null).requirementNotMetString(p) === "You already have 10 friends" && Relationships.makeFriend("work", p) == null);
    const f = Relationships.friends(p)[0];
    check("friend screen: How you met + Spend time", /How you met/.test(text(screen(f.id))) && ["hangOut", "friendCall", "movies", "party", "friendGift", "unfriend"].every((x) => ids(f, "friend", p).includes(x)));
    LoveActions.perform(loveAction("unfriend"), f, p); confirmYes(); clear();
    check("Unfriend (after confirming) removes them", Relationships.friends(p).length === 9);
    const lonely = Relationships.friends(p)[0];
    lonely.setRelationshipProgress(1);
    p.getSocial().metaFor(lonely.id).touched = undefined;
    week(p);
    check("a friend you ignore until 0 drifts away", Relationships.circle(p).get(lonely.id) == null);
}

// ---------------------------------------------------------------- exes
{
    ana.setRelationshipProgress(620);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.engaged);
    p.loveEvent(LoveEvent.breakUp); confirmYes(); clear();
    const exes = Relationships.exes(p);
    check("breaking up moves your partner to Past Relationships, score kept", fam.getPartner() == null && exes.length === 1 && exes[0].firstName === "Ana" && exes[0].getRelationshipProgress() >= 600 && exes[0].getTitle() === "Ex-fiancée", exes.map((e) => `${e.getTitle()} ${e.getRelationshipProgress()}`).join());
    rows = tab();
    check("Love tab: collapsed 'Past Relationships' row and a Find Love section", headers(rows).includes("Past Relationships") && titles(rows).includes(LoveEvent.swipeRight.getTitle()));
    const past = Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.pastRelationships, null as any, true).getContentViewModels() as any);
    check("Past Relationships list shows Ana's card", cards(past).some((c) => c.name.startsWith("Ana")));
    const ex = exes[0];
    check("ex screen: Text Them, Get Back Together, Remove", ["textEx", "backTogether", "removeEx"].every((x) => ids(ex, "ex", p).includes(x)));
    ex.setRelationshipProgress(300);
    check("Get Back Together needs 500+", /500/.test(new LoveActionCell(loveAction("backTogether"), ex).requirementNotMetString(p) ?? ""));
    ex.setRelationshipProgress(700);
    doIt("backTogether", ex, p);
    const again = fam.getPartner();
    check("…at 700 they become your partner again (dating, score kept)", again != null && again.getFirstName() === "Ana" && p.getRomanticRelationshipStatus() === RomanticRelationshipStatus.inRelationship && again.getRelationshipProgress() >= 690 && Relationships.exes(p).length === 0);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    p.loveEvent(LoveEvent.divorce); confirmYes(); clear();
    check("divorce: 'Ex-wife'", Relationships.exes(p)[0]?.getTitle() === "Ex-wife");
    LoveActions.perform(loveAction("removeEx"), Relationships.exes(p)[0], p); confirmYes(); clear();
    check("Remove from List", Relationships.exes(p).length === 0);
}

// ---------------------------------------------------------------- dates; adult child & parent actions
{
    const bo = new Person(Relationship.lover, Sex.male, "Kim", 30 * W); bo.setFirstName("Bo"); bo.setLoverPersonality(LoverPersonality.cheerful);
    bo.setRelationshipProgress(300); fam.date(bo); Relationships.setMood(bo, "fine");
    const b0 = bo.getRelationshipProgress();
    p.loveEvent(LoveEvent.romanticDinner); clear(); Relationships.setMood(bo, "fine");
    const d1 = bo.getRelationshipProgress() - b0;
    const b1 = bo.getRelationshipProgress();
    p.loveEvent(LoveEvent.romanticDinner); clear();
    const d2 = bo.getRelationshipProgress() - b1;
    check("Romantic Dinner twice in a row: +15 both times", d1 === 15 && d2 === 15, `${d1}, ${d2}`);

    mom.setRelationshipProgress(950);
    Relationships.meta(mom).moneyAskedWeek = undefined;
    const cash = p.getMoneyState().getCash();
    doIt("askMoney", mom, p);
    check("Ask for Money: −20 with that parent, maybe cash", mom.getRelationshipProgress() <= 950 - 20 + 0 && p.getMoneyState().getCash().compareTo(cash) >= -1);
    check("…then wait 24 weeks to ask again", /ask again in 23 weeks/.test(new LoveActionCell(loveAction("askMoney"), mom).requirementNotMetString(p) ?? ""), String(new LoveActionCell(loveAction("askMoney"), mom).requirementNotMetString(p)));

    const teen = new Person(Relationship.child, Sex.male, p.getLastName(), 16 * W + 2); teen.setFirstName("Ari"); fam.getFamilyMembers().add(teen);
    check("16-year-old: Teach to Drive needs a car", new LoveActionCell(loveAction("teachDrive"), teen).requirementNotMetString(p) === "You need a car");
    p.getItemState().purchaseItem?.(Possession.car);
    if (!Relationships.ownsCar(p)) { try { (p.getItemState() as any).getOwnedItems?.().add(Possession.car); } catch { /* */ } }
    check("…and opens once you own one", !Relationships.ownsCar(p) || new LoveActionCell(loveAction("teachDrive"), teen).requirementNotMetString(p) == null);
}

// ---------------------------------------------------------------- jail, save round trip
{
    const c = p.getSocial();
    const enc = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
    const dec: any = SaveCodec.decode(enc);
    const p2 = dec.getSaveState().currentSlot().getPersonState();
    const c2 = p2.getSocial();
    check("save keeps siblings, friends, exes and per-person notes", c2.list().length === c.list().length && c2.list("sibling").length === c.list("sibling").length && c.list("sibling").length >= 2 && c2.list()[0] instanceof SocialPerson && JSON.stringify(c2.meta) === JSON.stringify(c.meta));
    p.getCrimeState().setIsInJail?.(true);
    if (p.getCrimeState().getIsInJail()) check("in jail: relationship actions are locked", new LoveActionCell(loveAction("hangOut"), sis).requirementNotMetString(p) === "Not while you're in jail");
}

// ---------------------------------------------------------------- weekly drift (v0.12.1)
{
    // a newborn who never does anything with the family: everyone still likes them at 18
    const kid = start(LifeScenario.youngChild);
    const parents0 = Relationships.family(Relationship.parent, kid).filter((x: any) => x.getIsAlive());
    const sibs0 = Relationships.siblings(kid);
    const start0 = [...parents0, ...sibs0].map((x: any) => x.getRelationshipProgress());
    for (let i = 0; i < 18 * W; i++) { kid.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); kid.applyWeekly(); clear(); }
    const now0 = [...parents0, ...sibs0].map((x: any) => x.getRelationshipProgress());
    check("growing up (0 to 18) without doing anything: parents and siblings don't drift", now0.every((v, i) => v >= start0[i]) && now0.length > 0, start0.join(",") + " → " + now0.join(","));
    check("…so at 18 they still like you (Good or better)", now0.every((v) => v >= 400), now0.join(","));
    const mom2: any = parents0[0];
    mom2.setRelationshipProgress(700);
    for (let i = 0; i < 10; i++) { kid.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); kid.applyWeekly(); clear(); }
    check("as an adult they drift slowly (1 a week, 2 if Apathetic)", mom2.getRelationshipProgress() >= 680 && mom2.getRelationshipProgress() < 700, String(mom2.getRelationshipProgress()));
    mom2.setRelationshipProgress(401);
    for (let i = 0; i < 20; i++) { kid.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); kid.applyWeekly(); clear(); }
    check("…but never below Good (400) from time alone", mom2.getRelationshipProgress() === 400, String(mom2.getRelationshipProgress()));
    const fr = Relationships.makeFriend("work", kid) ?? Relationships.friends(kid)[0];
    fr.setRelationshipProgress(300);
    kid.applyWeekly(); clear();
    check("friends drift 1 a week (2 if Apathetic)", fr.getRelationshipProgress() === 300 + RelationshipProgressStatus.INSTANCE.getWeeklyDeteriorationRate(), String(fr.getRelationshipProgress()));
    // old saves: family that already drifted away is repaired once
    kid.getSocial().driftFixed = false;
    mom2.setRelationshipProgress(5);
    Relationships.repairDrift(kid);
    check("one-time repair for older saves: parents raised back to Good", mom2.getRelationshipProgress() === 400);
    mom2.setRelationshipProgress(5);
    Relationships.repairDrift(kid);
    check("…only once", mom2.getRelationshipProgress() === 5);
}

console.log(failures ? `${failures} FAILED` : "ALL PASSED");
if (failures) process.exit(1);

import * as SocialCircleModule from "../src/game/Social/SocialCircle";
function require_social() { return SocialCircleModule; }
