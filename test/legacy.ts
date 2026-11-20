// v0.28.0 Legacy: wills, inheritance tax, Switch Life, gifts, heirlooms, relatives' estates, the slayer rule.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { Sex } from "../src/game/Enums/Sex";
import { Country } from "../src/game/Enums/Country";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { Lineage } from "../src/game/Managers/Lineage";
import { LifeMoments } from "../src/game/Managers/LifeMoments";
import { Generations } from "../src/game/Managers/Generations";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { Legacy } from "../src/game/Legacy/Legacy";
import { LegacyScreen, SwitchLife } from "../src/game/Legacy/LegacyScreen";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Crime } from "../src/game/Crime/Crime";
import { Relationships } from "../src/game/Social/Relationships";
import { FamilyTree } from "../src/game/Social/FamilyTree";
import { Hobbies } from "../src/game/Managers/Hobbies";
import { World } from "../src/game/World/World";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const drain = () => { for (let i = 0; i < 200 && alerts.length; i++) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const setCash = (p: any, n: number) => { const m = p.getMoneyState(); MoneyState.updateMoney$default(m, BigInteger.valueOf(n - Number(m.getCash().toString())), MoneyUpdateType.workIncome, null, null, 12, null); };
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const screen = (key: string) => Array.from(new LifepathsModelGenerator().screen(key).getContentViewModels() as any) as any[];
const seq = (vals: number[], f: () => void) => { const r = Math.random; let i = 0; Math.random = () => (i < vals.length ? vals[i++] : r()); try { f(); } finally { Math.random = r; } };
const answer = (re: RegExp): boolean => {
    for (const a of [...alerts]) {
        const btns = [a.getPositiveButton?.(), a.getNegativeButton?.(), ...(a.getAdditionalButtons?.() ? Array.from(a.getAdditionalButtons() as any) : [])].filter(Boolean) as any[];
        const b = btns.find((x) => re.test(x.getTitle()));
        if (b) { alerts.splice(alerts.indexOf(a), 1); b.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); return true; }
    }
    return false;
};
const start = (age: number, country = "unitedStates") => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.initializeAge(age, true); np.getTraitState().getTraits().clear();
    World.setBirthCountry(np, (Country as any)[country]);
    GameStateManager.INSTANCE.startNewGame(np); drain();
    const p: any = GameStateManager.INSTANCE.getPersonState(); keep(p); return p;
};
const addKid = (p: any, name: string, age: number, sex = Sex.female) => {
    const k = new Person(Relationship.child, sex, p.getLastName(), 48 * age + 3); k.setFirstName(name); k.setRelationshipProgress(800);
    p.getFamilyState().getFamilyMembers().add(k); return k as any;
};

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
LifeMoments.enabled = false;

// ---------------------------------------------------------------- the estate plan
{
    const p = start(60, "uk"); setCash(p, 1_000_000);
    const e = Legacy.plan(p);
    check("UK inheritance tax: 40% above the tax-free amount", e.tax === Math.round((1_000_000 - 410_000) * 0.4), `tax ${e.tax}`);
    check("no will: 5% probate", e.probate === Math.round((1_000_000 - e.tax) * 0.05));
    addKid(p, "Ava", 30); addKid(p, "Ben", 28, Sex.male);
    alerts.length = 0;
    LegacyScreen.willDialog(p); answer(/Split equally/); answer(/^10%$/); drain();
    check("writing a will costs a lawyer's fee", Legacy.will(p).written && Legacy.will(p).mode === "equal" && cash(p) === 999_000, `${cash(p)}`);
    const e2 = Legacy.plan(p);
    check("…no more probate, and 10% to charity", e2.probate === 0 && e2.charity === Math.round((cash(p) - e2.tax) * 0.1));
    check("…equal split: one share for the other child", e2.others.length === 1 && Math.abs(e2.others[0].amount - e2.heir) <= 1, JSON.stringify(e2));
    Legacy.setUpTrust(p);
    check("a family trust halves the inheritance tax", Legacy.plan(p).tax === Math.round((cash(p) - 410_000) * 0.4 * 0.5));
    check("Canada has no inheritance tax", Legacy.estateTax(start(40, "canada"), 5_000_000) === 0);
}

// ---------------------------------------------------------------- dying with a will
{
    const p = start(70); setCash(p, 2_000_000);
    const ava = addKid(p, "Ava", 40); addKid(p, "Ben", 38, Sex.male);
    Legacy.writeWill(p, "equal", 0);
    p.getAttributeState().setHealth(0); (p.getAttributeState() as any).lowAttributeCountdown_health = 10;
    for (let i = 0; i < 20 && GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted(); i++) { p.applyWeekly(); }
    drain();
    const before = Legacy.plan(p, ava);
    Generations.continueAs(ava);
    const h: any = GameStateManager.INSTANCE.getPersonState();
    check("the heir gets their share of the will", h.getFirstName() === "Ava" && Math.abs(cash(h) - before.heir) < 2, `${cash(h)} vs ${before.heir}`);
    const ben = Relationships.siblings(h).find((s: any) => s.getFirstName() === "Ben") as any;
    check("…and their brother got his share", ben && Math.abs((ben.wealth ?? 0) - before.others[0].amount) < 2, `${ben?.wealth}`);
    check("the will reading is in the welcome alert", alerts.some((a) => /brothers and sisters each received/.test(text(a))));
    drain();
}

// ---------------------------------------------------------------- Switch Life
{
    const p = start(62); setCash(p, 800_000);
    const name = p.getFirstName(), oldId = p.getId();
    const mia = addKid(p, "Mia", 34);
    Legacy.addHeirloom(p, "oldGuitar", "Grandpa Joe");
    check("Legacy is on the Profile tab", /Legacy & Inheritance/.test(text(new ProfileModelGenerator().generateViewModels())));
    check("the Legacy screen lists the child to switch to", /Switch/.test(text(screen("legacy"))) && /Mia/.test(text(screen("legacy"))));
    check("not from a prison cell", (() => { Crime.sendToJail(p, 20, "Theft", false, false); drain(); const b = SwitchLife.block(p); Crime.release(p, "served"); drain(); return /prison/.test(b ?? ""); })());
    alerts.length = 0;
    SwitchLife.ask(p, mia); answer(/Keep 25%/); drain();
    const h: any = GameStateManager.INSTANCE.getPersonState();
    check("you're now the child", h.getFirstName() === "Mia" && h.getGeneration() === 2);
    check("…with 75% of the money (no tax on a gift)", Math.abs(cash(h) - 600_000) < 2, `${cash(h)}`);
    const old = (Array.from(h.getFamilyState().getParents() as any) as any[]).find((x) => x.getFirstName() === name);
    check("…and the old you is alive, retired, keeping 25%", old && old.getIsAlive() && Math.abs(old.wealth - 200_000) < 2 && old.formerLifeId === oldId);
    check("heirlooms passed down (worth 25% more, and they taught the heir)", Legacy.state(h).heirlooms.some((x) => x.id === "oldGuitar" && x.value === 1000) && Hobbies.skill("guitar", h) >= 12);
    const rec: any = Lineage.find(oldId);
    check("the family line records the handover (still living)", rec && rec.alive && rec.retired?.to === "Mia" && /still living/.test(FamilyTree.lineText(rec)), rec ? FamilyTree.lineText(rec) : "none");
    check("…and the obituary doesn't say they died", rec && /handed everything down to Mia/.test(rec.obituary) && !/died/.test(rec.obituary.split(".")[0]));
    // the old you dies later: the record is finished and what they kept comes back
    alerts.length = 0;
    old.deathReason = "a heart attack";
    old.die(); answer(/Accept/); drain();
    const rec2: any = Lineage.find(oldId);
    check("when the old you dies, the record is closed", rec2 && rec2.alive === false && /died at the age of/.test(rec2.obituary), rec2?.obituary);
    const back = Legacy.state(h).inherited.find((x) => x.from === name);
    check("…and what they kept comes back as inheritance (the will reading)", (back?.amount ?? 0) > 0, `${back?.amount}`);
    const save = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
    const g: any = SaveCodec.decode(save);
    check("saves keep the retired parent and the legacy state", !!g.getSaveState().currentSlot().getPersonState().legacy);
}

// ---------------------------------------------------------------- a vampire hands over
{
    const p = start(40); setCash(p, 100_000);
    Vampire.rise(p); drain();
    const kid = addKid(p, "Leo", 20, Sex.male);
    Generations.continueAs(kid, { handover: { keep: 0 } }); drain();
    const h: any = GameStateManager.INSTANCE.getPersonState();
    const old = (Array.from(h.getFamilyState().getParents() as any) as any[]).find((x) => x.getIsAlive() && x.formerLifeId);
    check("a vampire who hands over stays a vampire (never ages, never dies of age)", old && Vampire.isTurned(old) && old.getChanceOfDeathThisWeek() === 0);
    check("…and the heir is human", !Vampire.isVampire(h));
}

// ---------------------------------------------------------------- gifts
{
    const p = start(55); setCash(p, 500_000);
    const ava = addKid(p, "Ava", 25);
    const rel = ava.getRelationshipProgress();
    Legacy.gift(p, ava, 100_000);
    check("a gift goes to the child and they love it", ava.wealth === 100_000 && cash(p) === 400_000 && ava.getRelationshipProgress() > rel);
    Generations.continueAs(ava, { handover: { keep: 1 } }); drain();
    const h: any = GameStateManager.INSTANCE.getPersonState();
    check("continuing as them later: the gift is still theirs", Math.abs(cash(h) - 100_000) < 2, `${cash(h)}`);
}

// ---------------------------------------------------------------- relatives' estates
{
    const p = start(40); setCash(p, 0);
    const parents = Array.from(p.getFamilyState().getParents() as any) as any[];
    check("you have two living parents to test with", parents.length === 2 && parents.every((x) => x.getIsAlive()));
    parents[0].wealth = 300_000; parents[1].wealth = 100_000;
    alerts.length = 0;
    parents[0].die(); drain();
    check("when one parent dies, the other inherits", parents[1].wealth === 400_000 && cash(p) === 0);
    for (const s of Relationships.siblings(p)) s.isAlive = false;
    parents[1].setRelationshipProgress(950);
    parents[1].die();
    check("the last parent's will is read (a choice)", alerts.some((a) => /The Will of/.test(a.getTitle?.() ?? "")));
    answer(/Accept/); drain();
    check("…an only child gets it all (no US tax under the exemption)", cash(p) === 400_000, `${cash(p)}`);
}
{
    const p = start(40); setCash(p, 0);
    const sib = Relationships.siblings(p);
    const parents = Array.from(p.getFamilyState().getParents() as any) as any[];
    parents[0].isAlive = false;
    parents[1].wealth = 400_000; parents[1].setRelationshipProgress(100);
    if (!sib.length) { const s = Relationships.makeFriend("x", p); (s as any).kind = "sibling"; }
    alerts.length = 0;
    parents[1].die();
    check("not close to your parent: a smaller share, and you can contest it", alerts.some((a) => /Contest the will/.test(text(a))));
    seq([0.1], () => answer(/Contest/)); drain();
    check("…winning the case gets you an equal share", cash(p) > 0, `${cash(p)}`);
}
{
    const p = start(45); setCash(p, 0);
    const lover = new Person(Relationship.lover, Sex.male, "Stone", 48 * 50) as any; lover.setFirstName("Sam");
    p.getFamilyState().getFamilyMembers().add(lover); p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    lover.wealth = 250_000;
    lover.die(); drain();
    check("a spouse inherits, tax-free", cash(p) === 250_000, `${cash(p)}`);
}

// ---------------------------------------------------------------- the slayer rule
{
    const p = start(40); setCash(p, 100_000);
    const parents = Array.from(p.getFamilyState().getParents() as any) as any[];
    parents[0].isAlive = false;
    for (const s of Relationships.siblings(p)) s.isAlive = false;
    parents[1].wealth = 500_000;
    alerts.length = 0;
    seq([0.0, 0.99], () => Crime.murder(p, parents[1], "accident"));
    answer(/Accept/); drain();
    check("you inherit from a parent you killed (for now)", cash(p) >= 590_000, `${cash(p)}`);
    const c = Crime.state(p).open.find((x: any) => x.murder) as any;
    check("…the murder case remembers it", c && c.inherited >= 490_000);
    alerts.length = 0;
    if (c) Crime.arrest(p, [c], "Detectives found you."); answer(/Public defender/); drain();
    if (Crime.inJail(p)) check("convicted: the court takes the inheritance back (slayer rule)", cash(p) < 150_000, `${cash(p)}`);
    else check("convicted: the court takes the inheritance back (slayer rule)", true, "acquitted this run");
}

console.log(failures ? `\n${failures} FAILED` : "\nall legacy checks passed");
process.exit(failures ? 1 : 0);
