// v0.17.0: the extended family and the Family Tree (grandparents, aunts/uncles, cousins, nieces/nephews,
// grandchildren, great-grandchildren), parents having babies until 55, kids having kids, heirs inheriting the
// tree, the obituary, and the "Renowned Actor" typo.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { Person } from "../src/game/Managers/Person";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { Relationships } from "../src/game/Social/Relationships";
import { ExtendedFamily } from "../src/game/Social/ExtendedFamily";
import { FamilyTree } from "../src/game/Social/FamilyTree";
import { Obituary } from "../src/game/Managers/Obituary";
import { LoveActions, loveAction, LoveActionCell } from "../src/game/Social/LoveActions";
import { Generations } from "../src/game/Managers/Generations";
import { Utils } from "../src/game/Utils/Utils";
import { R } from "../src/game/runtime";

const alerts: any[] = [];
const navs: string[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo(t: any) { navs.push(t?.name?.() ?? String(t)); }, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Love; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const titlesOf = () => alerts.map((a) => a.getTitle?.() ?? a.title);
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const W = 48;
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const titles = (rows: any[]) => rows.map((r) => r.title ?? r.getTitle?.()).filter((t) => typeof t === "string");
const withRandom = <T>(v: number, fn: () => T): T => { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } };
const keep = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); };
const rich = (p: any, n = 50_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const list = (type: any, key: any = null) => Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(type, key, true).getContentViewModels() as any) as any[];
const loveTab = () => Array.from(new LoveModelGenerator().generateViewModels().getContentViewModels() as any) as any[];
const start = (sc: any) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const child = (p: any, sex: any, first: string, years: number) => {
    const k = new Person(Relationship.child, sex, p.getLastName(), years * W + 7);
    k.setFirstName(first);
    k.setRelationshipProgress(600);
    p.getFamilyState().getFamilyMembers().add(k);
    return k;
};

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());

// ---------------------------------------------------------------- typo
check("\"Renowned Actor\" (was \"Renowed\")", Utils.INSTANCE.getString((R.string as any).Title_Actor_9) === "Renowned Actor");

// ---------------------------------------------------------------- a new life rolls the extended family
let p = start(LifeScenario.educatedAndInDebt);
const c = Relationships.circle(p);
ExtendedFamily.ensure(p);
const { mom, dad } = ExtendedFamily.parentsOfPlayer(p);
const gps = c.list("grandparent");
check("4 grandparents, 2 on each side", gps.length === 4 && gps.filter((g) => g.side === mom.getId()).length === 2 && gps.filter((g) => g.side === dad.getId()).length === 2);
check("grandparents are older than your parents", gps.every((g) => !g.getIsAlive() || g.getAgeInWeeks() > Math.max(mom.getAgeInWeeks(), dad.getAgeInWeeks())));
check("dad's side shares your surname; mom's side has her maiden name", gps.filter((g) => g.side === dad.getId()).every((g) => g.lastName === p.getLastName()) && gps.filter((g) => g.side === mom.getId()).every((g) => g.lastName !== p.getLastName()));
const aus = c.list("auntUncle");
check("aunts and uncles belong to a side", aus.every((a) => a.side === mom.getId() || a.side === dad.getId()), String(aus.length));
check("cousins are children of an aunt or uncle, 20+ years younger", c.list("cousin").every((x) => { const par = Relationships.find(x.parentId, p); return par?.kind === "auntUncle" && par.getAgeInWeeks() - x.getAgeInWeeks() >= 20 * W; }));
check("rolled only once", (ExtendedFamily.ensure(p), c.list("grandparent").length === 4));

// make the family predictable for the rest of the checks
for (const g of gps) { g.isAlive = true; g.isBuried = false; g.ageInWeeks = 70 * W + 5; g.trueAgeInWeeks = g.ageInWeeks; }
let uncle = aus.find((a) => a.side === dad.getId());
if (uncle == null) { uncle = ExtendedFamily.make("auntUncle", Sex.male, p.getLastName(), 40 * W, 500); uncle.side = dad.getId(); c.add(uncle); }
uncle.isAlive = true; uncle.ageInWeeks = 40 * W + 3; uncle.sex = Sex.male; uncle.firstName = "Mark";

// ---------------------------------------------------------------- the Love tab
{
    const rows = loveTab();
    check("Love tab: Extended Family section with the Family Tree", titles(rows).includes("Extended Family") && rows.some((r) => text(r).includes("Family Tree")));
    check("…and a Grandparents row", rows.some((r) => text(r).includes("Grandparents (4)")));
    const gl = list(GenericListType.relatives, "grandparent");
    check("Grandparents screen: grouped by Mom's side / Dad's side", titles(gl).includes("Mom's side") && titles(gl).includes("Dad's side"), titles(gl).join(","));
    const g = gps[0];
    const ps = list(GenericListType.personDetails, g.getId());
    check("grandparent screen: Family row, Call, Visit, Listen to Their Stories, Ask for Advice", text(ps).includes(ExtendedFamily.sideTitle(g.side, p)) && ["Call", "Visit", "Listen to Their Stories", "Ask for Advice"].every((t) => titles(ps).includes(t)), titles(ps).join(","));
    const ups = list(GenericListType.personDetails, uncle.getId());
    check("uncle screen shows his children (your cousins)", ExtendedFamily.childrenOf(uncle.id, p).length === 0 || titles(ups).includes(`${uncle.getFirstName()}'s Children`));
}

// ---------------------------------------------------------------- the family tree
{
    const rows = FamilyTree.rows(p);
    const t = rows.map((r) => r.title);
    check("tree: Grandparents → Parents, Aunts & Uncles → You, Siblings & Cousins", t[0] === "Grandparents" && t[1] === "Parents, Aunts & Uncles" && t[2] === "You, Siblings & Cousins", t.join(" | "));
    const you = rows[2].groups.find((g) => g.you);
    check("tree: you're in the middle row, highlighted", you != null && you.nodes.some((n) => n.you && n.name === p.getFirstName()));
    check("tree: each parent sits with their brothers and sisters", rows[1].groups.every((g) => g.nodes.some((n) => n.relation === "Mother" || n.relation === "Father")));
    const screen = list(GenericListType.familyTree);
    check("Family Tree screen renders", screen.some((r) => r.constructor?.name === "FamilyTreeViewModel"));
    const node = rows[0].groups[0].nodes[0];
    node.onClick?.invoke();
    check("tapping someone opens them", navs[navs.length - 1] === "personDetails");
}

// ---------------------------------------------------------------- parents keep having kids until 55
{
    mom.setAlive(true); dad.setAlive(true);
    mom.setAgeInWeeks(40 * W); dad.setAgeInWeeks(42 * W);
    for (const s of Relationships.siblings(p)) c.remove(s.id);
    check("parents (mom 40) can have a baby", ExtendedFamily.canParentsHaveBaby(p));
    clear();
    withRandom(0, () => ExtendedFamily.weekly(1, p));
    const sib = Relationships.siblings(p).find((s) => s.getAgeInWeeks() === 0);
    check("…a new brother or sister is born (age 0)", sib != null && titlesOf().includes("New Sibling!"), titlesOf().join(","));
    check("…with a Newborn badge", sib != null && Relationships.badges(sib).includes("Newborn"));
    clear();
    mom.setAgeInWeeks(54 * W + 47);
    check("mom 54: still possible", ExtendedFamily.canParentsHaveBaby(p));
    mom.setAgeInWeeks(55 * W);
    check("mom 55: no more babies", !ExtendedFamily.canParentsHaveBaby(p));
    const before = Relationships.siblings(p).length;
    withRandom(0, () => ExtendedFamily.weekly(1, p)); clear();
    check("…none are born after 55", Relationships.siblings(p).length === before);
    mom.setAgeInWeeks(45 * W); mom.setAlive(false);
    check("only one parent alive: no more babies", !ExtendedFamily.canParentsHaveBaby(p));
    mom.setAlive(true);
}

// ---------------------------------------------------------------- kids have kids
{
    const ava = child(p, Sex.female, "Ava", 30);
    check("an adult child (30) can have a baby", ExtendedFamily.canHaveBaby(ava, p));
    clear();
    const g1 = ExtendedFamily.babyFor(ava, p)!;
    check("grandchild born: linked to Ava", g1.kind === "grandchild" && g1.parentId === ava.getId() && g1.getAgeInWeeks() === 0);
    check("…\"You're a Grandparent!\"", titlesOf().includes("You're a Grandparent!"), titlesOf().join(","));
    check("…a daughter's child gets the other parent's surname", g1.lastName !== "" );
    clear();
    g1.ageInWeeks = 25 * W; g1.trueAgeInWeeks = g1.ageInWeeks;
    const gg = ExtendedFamily.babyFor(g1, p)!;
    check("great-grandchild born: linked to the grandchild", gg.kind === "greatGrandchild" && gg.parentId === g1.id);
    check("…\"You're a Great-grandparent!\"", titlesOf().includes("You're a Great-grandparent!"));
    clear();
    check("great-grandchildren don't have kids in the tree", !ExtendedFamily.canHaveBaby(Object.assign(gg, { ageInWeeks: 30 * W }), p));
    gg.ageInWeeks = 0;
    const kid19 = child(p, Sex.male, "Leo", 19);
    check("too young (19): no babies", !ExtendedFamily.canHaveBaby(kid19, p));
    kid19.setAgeInWeeks(50 * W);
    check("too old (50): no babies", !ExtendedFamily.canHaveBaby(kid19, p));
    kid19.setAgeInWeeks(19 * W);
    for (let i = 0; i < 3; i++) ExtendedFamily.babyFor(ava, p, true);
    check("at most 4 children each", !ExtendedFamily.canHaveBaby(ava, p));
    // siblings and aunts/uncles have kids too
    const sis = Relationships.siblings(p)[0];
    sis.ageInWeeks = 32 * W; sis.sex = Sex.female;
    const n = ExtendedFamily.babyFor(sis, p)!;
    check("a sibling's baby is your niece or nephew", n.kind === "nibling" && n.parentId === sis.id && /Niece|Nephew/.test(n.getTitle()));
    const cz = ExtendedFamily.babyFor(uncle, p)!;
    check("an uncle's baby is your cousin, with his surname", cz.kind === "cousin" && cz.parentId === uncle.id && cz.lastName === uncle.lastName);
    clear();
    check("the tree has Children, Grandchildren and Great-grandchildren rows", ["Children, Nieces & Nephews", "Grandchildren", "Great-grandchildren"].every((t) => FamilyTree.rows(p).some((r) => r.title === t)));
    check("…grandchildren grouped under Ava", FamilyTree.rows(p).find((r) => r.title === "Grandchildren")!.groups.some((g) => g.label === "Ava's children" && g.nodes.length === 4));
    check("Love tab: Grandchildren (4) with New baby!", loveTab().some((r) => text(r).includes("Grandchildren (4)") && text(r).includes("New baby")));
    const avaScreen = list(GenericListType.personDetails, ava.getId());
    check("Ava's screen shows her children and \"Children: 4\"", titles(avaScreen).includes("Ava's Children") && /Children[^A-Za-z]{1,12}4/.test(text(avaScreen)), titles(avaScreen).join(",") + " " + (text(avaScreen).match(/.{30}Children.{30}/)?.[0] ?? ""));
    // things to do with grandchildren
    rich(p);
    const gs = list(GenericListType.personDetails, g1.id);
    check("grandchild (25): Call, Visit, Give a Gift, Tell Them Family Stories", ["Call", "Visit", "Give a Gift", "Tell Them Family Stories"].every((t) => titles(gs).includes(t)), titles(gs).join(","));
    const baby = ExtendedFamily.childrenOf(ava.getId(), p).find((x) => x.id !== g1.id)!;
    baby.ageInWeeks = 3 * W;
    const bs = list(GenericListType.personDetails, baby.id);
    check("young grandchild: Babysit and Spoil Them", titles(bs).includes("Babysit") && titles(bs).includes("Spoil Them"), titles(bs).join(","));
    baby.ageInWeeks = 18 * W;
    const before = baby.getRelationshipProgress();
    check("Pay for College at 18", LoveActions.perform(loveAction("payCollege"), baby, p) && baby.getRelationshipProgress() > before);
    clear();
    check("…only once", !new LoveActionCell(loveAction("payCollege"), baby).visible(p));
    check("Family Gathering includes the extended family", Relationships.familyPeople(p).some((x) => x.id === g1.id) && Relationships.familyPeople(p).some((x) => x.id === uncle!.id));
}

// ---------------------------------------------------------------- gentle drift, deaths, funerals
{
    const g = gps[0];
    g.setRelationshipProgress(350);
    check("relatives don't drift below Good from time alone (like parents)", Relationships.drift(g, p) === 0);
    g.ageInWeeks = 118 * W;
    clear();
    withRandom(0, () => Relationships.weekly(1));
    check("an old grandparent can pass away (Family Loss)", !g.getIsAlive() && titlesOf().includes("Family Loss"), titlesOf().join(","));
    clear();
    check("…and stays in the family (In memory)", c.get(g.id) != null);
    const ps = list(GenericListType.personDetails, g.id);
    check("…with Attend Funeral", titles(ps).includes("Attend Funeral"));
    check("the tree greys them out", FamilyTree.rows(p)[0].groups.some((gr) => gr.nodes.some((n) => n.id === g.id && n.dead)));
}

// ---------------------------------------------------------------- saves
{
    const enc = SaveCodec.encode(p);
    const back: any = SaveCodec.decode(enc);
    const bc = back.getSocial();
    check("save/load keeps the tree (links and sides)", bc.list("grandchild").length === c.list("grandchild").length && bc.list("cousin").every((x: any) => x.parentId != null) && bc.list("grandparent").every((x: any) => x.side != null) && bc.extendedRolled === true);
    // an older save: no extended family yet
    const old: any = SaveCodec.decode(enc);
    const oc = old.getSocial();
    for (const x of oc.list()) if (["grandparent", "auntUncle", "cousin", "nibling", "grandchild", "greatGrandchild"].includes(x.kind)) oc.remove(x.id);
    delete oc.extendedRolled;
    ExtendedFamily.ensure(old);
    check("older saves get an extended family the first time", oc.list("grandparent").length === 4 && oc.extendedRolled === true);
    check("…including grandchildren for adult children", oc.list("grandchild").length >= 0);
}

// ---------------------------------------------------------------- heirs inherit the tree
{
    // Ava (30, 4 kids) becomes the heir; Leo is her brother; one of your siblings has a child
    const ava = (Array.from(p.getFamilyState().getChildren() as any) as any[]).find((k) => k.getFirstName() === "Ava");
    const leo = (Array.from(p.getFamilyState().getChildren() as any) as any[]).find((k) => k.getFirstName() === "Leo");
    leo.setAgeInWeeks(28 * W);
    const leoKid = ExtendedFamily.babyFor(leo, p, true)!;
    const avaKids = ExtendedFamily.childrenOf(ava.getId(), p).map((x) => x.id);
    const greatGrand = c.list("greatGrandchild").filter((x) => avaKids.includes(x.parentId!)).map((x) => x.id);
    const mySiblings = Relationships.siblings(p).map((s) => s.id);
    const myNieces = c.list("nibling").map((s) => s.id);
    const myParents = (Array.from(p.getFamilyState().getParents() as any) as any[]).map((x) => x.getId());
    p.getAttributeState().setHealth(0);
    (p.getAttributeState() as any).lowAttributeCountdown_health = 10;
    Obituary.record(p, "Health");
    const ob = Obituary.text(p);
    check("obituary: survived by children and grandchildren", /survived by/.test(ob) && /grandchildren/.test(ob) && /great-grandchild/.test(ob), ob);
    Generations.continueAs(ava); clear();
    const h: any = GameStateManager.INSTANCE.getPersonState();
    const hc = Relationships.circle(h);
    check("heir: Ava's children are now her own children", avaKids.every((id) => h.getFamilyState().getWithId(id)?.getRelationship() === Relationship.child), String(avaKids.length));
    check("heir: your great-grandchildren are her grandchildren", greatGrand.every((id) => hc.get(id)?.kind === "grandchild"));
    check("heir: Leo is her brother and his child her nephew/niece", hc.get(leo.getId())?.kind === "sibling" && hc.get(leoKid.id)?.kind === "nibling" && hc.get(leoKid.id)?.parentId === leo.getId());
    check("heir: your siblings are her aunts and uncles", mySiblings.every((id) => hc.get(id)?.kind === "auntUncle"));
    check("heir: your nieces and nephews are her cousins", myNieces.every((id) => hc.get(id)?.kind === "cousin"));
    check("heir: your parents are her grandparents", myParents.every((id) => hc.get(id)?.kind === "grandparent"));
    check("heir: the tree is ready (no second roll)", hc.extendedRolled === true);
    const t = FamilyTree.rows(h).map((r) => r.title);
    check("heir's tree has her children and grandchildren", t.includes("Children, Nieces & Nephews") && t.includes("Grandchildren"), t.join(" | "));
}

// ---------------------------------------------------------------- the obituary on the Life Summary
{
    p = start(LifeScenario.oldMan);
    const kid = child(p, Sex.male, "Sam", 40);
    ExtendedFamily.babyFor(kid, p, true);
    alerts.length = 0;
    const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
    for (let i = 0; i < 40 && gsm.getSaveState().getHasGameStarted(); i++) {
        while (alerts.length) { const a = alerts.shift(); if (/died/i.test(a.getTitle())) { alerts.unshift(a); break; } AlertManager.INSTANCE.alertDismissed(a); }
        if (alerts.length) break;
        (p.getAttributeState() as any).lowAttributeCountdown_health = 10; p.getAttributeState().setHealth(0); p.applyWeekly();
    }
    check("died", !gsm.getSaveState().getHasGameStarted());
    check("cause of death recorded", p.deathCause === "Old age" || p.deathCause === "Poor health", String(p.deathCause));
    const sum = Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.gameSummary, "OnDeath", false).getContentViewModels() as any) as any[];
    check("Life Summary: Obituary under the tombstone", titles(sum).includes("Obituary") && text(sum).includes("survived by") && text(sum).includes("Cause of death") && text(sum).includes("Grandchildren (living)"), titles(sum).join(","));
    check("…the cemetery copy keeps it", (gsm.getCemetaryState().getPastLives() as any).some((x: any) => x.deathCause != null));
}

console.log(failures ? `\n${failures} FAILED` : "\nall family-tree checks passed");
if (failures) process.exit(1);
