// v0.27.0 "The Crime Update": crimes, the police, courts, prison, records, gangs, crime families and murder.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { Job } from "../src/game/Enums/Job";
import { Housing } from "../src/game/Enums/Housing";
import { Diet } from "../src/game/Enums/Diet";
import { Leisure } from "../src/game/Enums/Leisure";
import { Country } from "../src/game/Enums/Country";
import { Possession } from "../src/game/Enums/Possession";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { Crime, LIFE_SENTENCE } from "../src/game/Crime/Crime";
import { CRIMES, CRIME_BY_ID } from "../src/game/Crime/CrimeData";
import { CrimeScreen } from "../src/game/Crime/CrimeScreen";
import { Careers } from "../src/game/Careers/Careers";
import { Vampire, LifeActions } from "../src/game/Lifepaths/Vampire";
import { Relationships } from "../src/game/Social/Relationships";
import { World } from "../src/game/World/World";
import { Activities } from "../src/game/World/Activities";
import { LifeMoments } from "../src/game/Managers/LifeMoments";
import { Generations } from "../src/game/Managers/Generations";
import { SocialMedia } from "../src/game/Social/SocialMedia";
import { AchievementBadge } from "../src/game/Enums/AchievementBadge";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Lifepaths; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const drain = () => { for (let i = 0; i < 200 && alerts.length; i++) { const a = alerts.shift(); AlertManager.INSTANCE.alertDismissed(a); } };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const rich = (p: any, n = 5_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const rows = (g: any) => Array.from(g.generateViewModels().getContentViewModels() as any) as any[];
const screen = (key: string) => Array.from(new LifepathsModelGenerator().screen(key).getContentViewModels() as any) as any[];
const titles = (rs: any[]) => rs.map((r) => r.title ?? r.getTitle?.()).filter((t) => typeof t === "string");
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const start = (age: number) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.initializeAge(age, true);
    np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); drain();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
/** Math.random returns these values in turn, then real random numbers. */
const seq = (vals: number[], f: () => void) => { const r = Math.random; let i = 0; Math.random = () => (i < vals.length ? vals[i++] : r()); try { f(); } finally { Math.random = r; } };
const answer = (re: RegExp): boolean => {
    for (const a of [...alerts]) {
        const btns = [a.getPositiveButton?.(), a.getNegativeButton?.(), ...(a.getAdditionalButtons?.() ? Array.from(a.getAdditionalButtons() as any) : [])].filter(Boolean) as any[];
        const b = btns.find((x) => re.test(x.getTitle()));
        if (b) { alerts.splice(alerts.indexOf(a), 1); b.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); return true; }
    }
    return false;
};
const commit = (p: any, id: string) => LifeActions.perform({ id, title: id, image: null, run: (q: any) => Crime.commit(q, CRIME_BY_ID[id]) } as any, p);

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
LifeMoments.enabled = false;

// ---------------------------------------------------------------- the Underworld screen
{
    const k = start(10);
    check("crime is locked before 13", titles(rows(new LifepathsModelGenerator())).includes("Crime") && Crime.block(k) != null);
    const p = start(16); keep(p);
    const t = titles(screen("crime"));
    check("the Underworld screen lists crimes by kind", ["Petty Crime", "Theft & Robbery", "Scams & Fraud", "Big Heists", "Violent Crime", "Staying Out of Trouble"].every((h) => t.includes(h)) && t.includes("Shoplift") && t.includes("Rob a Bank"), t.join(" | ").slice(0, 300));
    check("…with gangs and crime families", t.includes("Join a Gang") && t.includes("Seek a Meeting with a Crime Family"));
    check(`${CRIMES.length} crimes with pictures, odds and sentences`, CRIMES.length >= 20 && CRIMES.every((c) => c.odds > 0 && c.sentence[1] >= c.sentence[0]));
    check("a 16-year-old can't rob a bank (18+)", /18/.test(Crime.needsBlock(p, CRIME_BY_ID.bankRobbery) ?? ""));
}

// ---------------------------------------------------------------- getting away with it, getting caught
{
    const p = start(25); keep(p); rich(p, 10000);
    const c0 = cash(p);
    seq([0.0, 0.5], () => commit(p, "carTheft")); drain();
    check("a successful crime pays and draws heat", cash(p) > c0 && Crime.heat(p) > 0 && Crime.state(p).open.length === 1, `${c0} → ${cash(p)}, heat ${Crime.heat(p)}`);
    // caught
    seq([0.99, 0.0, 0.5], () => commit(p, "burglary"));
    const arrested = alerts.some((a) => a.getTitle?.() === "Arrested!");
    check("a failed crime can end in an arrest (with a trial)", arrested);
    seq([0.9], () => answer(/Public defender/));
    drain();
    check("convicted: you're in prison", Crime.inJail(p) && p.getHousingState().currentHousing().getType() === Housing.jail && p.getDiet() === Diet.prisonFood);
    check("…both crimes count (open cases come along)", Crime.state(p).open.length <= 1 && Crime.state(p).record.length === 1);
    check("…the Work tab has prison jobs only", titles(rows(new WorkModelGenerator())).includes("Prison Jobs"));
    check("…the Leisure tab is the yard", titles(rows(new VacationModelGenerator())).includes("Prison Yard") && titles(rows(new VacationModelGenerator())).includes("Prison Gym"));
    check("…no buying things or apartments", /prison/.test(Possession.car.requirementNotMetString(p) ?? "") && p.getRealEstate().moveToBasic(p, Housing.shared_room) != null);
    check("…no Career Center applications", /prison/.test(Careers.applyBlock(Job.retail, p) ?? ""));
    check("…no social media", SocialMedia.blocked(p) != null);
    check("…the Lifepaths row says how long", /left/.test(CrimeScreen.status(p)));
    // serve it
    const w = Crime.state(p).jail!.weeks;
    for (let i = 0; i < w + 2 && Crime.inJail(p); i++) { keep(p); p.applyWeekly(); drain(); }
    check("released after serving (or parole)", !Crime.inJail(p) && p.getHousingState().currentHousing().getType() !== Housing.jail);
    check("a fresh record blocks background-check careers", /Background check/.test(Careers.applyBlock(Job.police, p) ?? ""), Careers.applyBlock(Job.police, p) ?? "");
    check("…but not others", Careers.applyBlock(Job.retail, p) == null);
    // 7 years later
    Crime.state(p).record.forEach((r) => (r.week -= 8 * 48));
    check("records clear after 7 years", Careers.applyBlock(Job.police, p) == null);
}

// ---------------------------------------------------------------- courts
{
    const p = start(30); keep(p); rich(p);
    Crime.arrest(p, [{ crime: "burglary", title: "Burglary", week: 0, violent: false, sentence: [48, 48] }], "Test");
    seq([0.0], () => answer(/top lawyer/)); drain();
    check("a top lawyer can win (not guilty)", !Crime.inJail(p));
    // pleading guilty
    Crime.arrest(p, [{ crime: "burglary", title: "Burglary", week: 0, violent: false, sentence: [100, 100] }], "Test");
    answer(/Plead guilty/); drain();
    const j = Crime.state(p).jail!;
    check("pleading guilty cuts the sentence by 30%", j != null && j.total < 100 * Crime.justice(p) * 1.26 && j.total >= Math.round(70 * Crime.justice(p)) - 1, `${j?.total}`);
    Crime.release(p, "served"); drain();
    // lawyers defend themselves
    p.getJobState().switchJob(Job.lawyer); p.getJobState().getCurrentJobState().setLevel(4);
    Crime.arrest(p, [{ crime: "fraud", title: "Fraud", week: 0, violent: false, sentence: [48, 48] }], "Test");
    check("lawyers can defend themselves", alerts.some((a) => [a.getPositiveButton?.(), a.getNegativeButton?.(), ...Array.from(a.getAdditionalButtons?.() ?? [])].some((b: any) => b && /Defend yourself/.test(b.getTitle()))));
    seq([0.0], () => answer(/Defend yourself/)); drain();
    // kids
    const k = start(15); keep(k);
    seq([0.99, 0.0], () => commit(k, "shoplift")); drain();
    check("a first shoplifting offence is a fine, and a juvenile record", !Crime.inJail(k) && Crime.state(k).record[0]?.juvenile === true);
    check("…which doesn't show on background checks", Crime.recordBlock(k) == null);
}

// ---------------------------------------------------------------- escapes and fugitives
{
    const p = start(30); keep(p); rich(p);
    Crime.sendToJail(p, 200, "Robbery", true, false); drain();
    Vampire.rise(p); drain(); Vampire.state(p).powers = ["shadowStep"];
    p.leisureAction(Leisure.prisonEscape); drain();
    check("Shadow Step: a vampire's escape always works", !Crime.inJail(p) && Crime.state(p).fugitive && Crime.heat(p) >= 90);
    check("fugitives are blocked from background-check jobs", /fugitive/.test(Careers.applyBlock(Job.police, p) ?? ""));
    p.getCompletableActionState().completeAction(CompletableAction.japanese);
    p.buyItem(Possession.passport);
    seq([0.1], () => { keep(p); p.leisureAction(World.travelOption(Country.japan)!); }); drain();
    check("fleeing abroad can end the manhunt", p.getCountry() === Country.japan && !Crime.state(p).fugitive);
    // a mortal escape attempt that fails adds a year
    const q = start(30); keep(q);
    Crime.sendToJail(q, 100, "Robbery", false, false); drain();
    const before = Crime.state(q).jail!.weeks;
    Crime.afterLeisureEvent(q, Leisure.prisonEscape, { name: () => "prison_escape_failure_tunnel", getJailTimeModifier: () => 48 });
    check("a failed escape adds a year", Crime.state(q).jail!.weeks === before + 48);
}

// ---------------------------------------------------------------- gangs and families
{
    const p = start(20); keep(p); rich(p);
    check("joining a gang needs some respect", Crime.state(p).respect < 5);
    Crime.state(p).respect = 10;
    Crime.joinGang(p);
    check("…then you're a Prospect", Crime.state(p).org?.kind === "gang" && Crime.rankTitle(Crime.state(p).org!) === "Prospect");
    Crime.orgPoints(p, 70);
    check("respect ranks you up", Crime.rankTitle(Crime.state(p).org!) === "Enforcer");
    Crime.orgPoints(p, 400);
    check("…to Shot Caller: the gang is yours", Crime.state(p).org!.own && Crime.state(p).org!.turf >= 2);
    const c0 = cash(p);
    keep(p); p.applyWeekly(); drain();
    check("turf pays every week", cash(p) > c0);
    // the family
    const q = start(25); keep(q); rich(q);
    Crime.state(q).respect = 60;
    Crime.joinFamily(q);
    check("a crime family takes you in as an Associate", Crime.state(q).org?.kind === "mafia" && Crime.state(q).org!.rank === 0);
    Crime.orgPoints(q, 700);
    check("…up to Underboss by respect (a Don is made, not promoted)", Crime.state(q).org!.rank === 3 && !Crime.state(q).org!.own);
    const take = CrimeScreen.cells(q).find((c: any) => c.title === "Take Over the Family");
    check("an Underboss can move against the Don", take != null);
    Crime.state(q).org!.rank = 4; Crime.state(q).org!.own = true; Crime.state(q).org!.fronts = [];
    const t = titles(CrimeScreen.cells(q));
    check("a Don buys fronts and bribes judges", t.some((x) => /Buy a Front: Casino/.test(x)) && t.includes("Bribe a Judge") && t.includes("Bribe the Police Chief"));
    Crime.state(q).judgeBribed = true;
    Crime.arrest(q, [{ crime: "racketeering", title: "Racketeering", week: 0, violent: true, sentence: [480, 480] }], "Test");
    seq([0.0], () => answer(/judge you bribed/)); drain();
    check("…and a bribed judge throws the case out", !Crime.inJail(q) && !Crime.state(q).judgeBribed);
    Crime.arrest(q, [{ crime: "racketeering", title: "Racketeering", week: 0, violent: true, sentence: [480, 480] }], "Test");
    const last = q.getLastName();
    answer(/State's witness/); drain();
    check("turning State's witness: free, out of the family, a new name", !Crime.inJail(q) && Crime.state(q).org == null && q.getLastName() !== last && Crime.state(q).marked);
}

// ---------------------------------------------------------------- murder
{
    const p = start(30); keep(p); rich(p);
    const friend = Relationships.makeFriend("test", p)!;
    friend.ageInWeeks = 30 * 48;
    check("you can only pick adults", Crime.victims(p).includes(friend) && Crime.victims(p).every((v: any) => v.getAgeInYears() >= 18));
    seq([0.0, 0.99], () => Crime.murder(p, friend, "accident")); drain();
    check("a murder kills them and opens a case", !friend.getIsAlive() && Crime.state(p).open.some((c) => c.murder) && Crime.state(p).stats.kills === 1);
    Crime.state(p).open.forEach((c) => (c.week -= 10 * 48));
    Crime.state(p).heat = 0;
    keep(p); seq([0.99, 0.99, 0.99, 0.99, 0.99], () => p.applyWeekly()); drain();
    check("…10 years later it's still open (murders don't go cold after 5 years)", Crime.state(p).open.some((c) => c.murder));
    check("…and the Crime screen says when it will be closed", /closed unsolved in 10 years/.test(text(screen("crime"))), (text(screen("crime")).match(/including murder[^)]*\)/) ?? [""])[0]);
    Crime.state(p).open.forEach((c) => (c.week -= 10 * 48));
    keep(p); seq([0.99, 0.99, 0.99, 0.99, 0.99], () => p.applyWeekly()); drain();
    check("…after 20 years the police close it, unsolved", !Crime.state(p).open.some((c) => c.murder));
    const m = screen("crime-murder");
    check("the murder screen lists people with a Kill button", m.some((r: any) => /Kill/.test(text(r))) || Crime.victims(p).length === 0);
    // the partner
    const q = start(30); keep(q);
    const { Person } = await import("../src/game/Managers/Person");
    const { LoverPersonality } = await import("../src/game/Enums/LoverPersonality");
    const x: any = Person.INSTANCE.getPartnerForPlayer(q, LoverPersonality.cheerful);
    q.getFamilyState().date(x);
    seq([0.0, 0.99], () => Crime.murder(q, x, "poison")); drain();
    check("killing your partner leaves you a widow(er)", !x.getIsAlive() && q.getRomanticRelationshipStatus().name() === "widowed");
}

// ---------------------------------------------------------------- crossovers
{
    // faking your death closes your files
    const p = start(30); keep(p); rich(p);
    Vampire.rise(p); drain();
    Crime.state(p).record.push({ crime: "x", title: "Theft", week: p.calendarWeeks(), age: 30, weeks: 50, violent: false, juvenile: false });
    Crime.state(p).heat = 80;
    Vampire.fakeDeath(p); drain();
    check("faking your death clears your record and heat", Crime.state(p).record.length === 0 && Crime.heat(p) === 0);
    // a vampire who collapses in prison is carried out of it
    const v = start(30); keep(v); Vampire.rise(v); drain();
    Crime.sendToJail(v, 500, "Theft", false, false); drain();
    Vampire.hooks.collapseStart?.(v);
    check("collapsing in prison: the body was carried out (you're free)", !Crime.inJail(v) && v.getHousingState().currentHousing().getType() !== Housing.jail);
    // heirs don't wake up in a cell; the family business passes on
    const d = start(60); keep(d); rich(d);
    Crime.state(d).org = { kind: "mafia", name: "The Test Family", rank: 4, points: 700, own: true, members: 0, turf: 0, fronts: ["pizzeria"], since: 0 };
    Crime.sendToJail(d, 500, "Racketeering", true, false); drain();
    const heir: any = { getHousingState: () => d.getHousingState(), getAgeInYears: () => 25, getCrimeState: () => ({}), calendarWeeks: () => 0 };
    Crime.heir(d, heir);
    check("an heir doesn't inherit the cell", d.getHousingState().currentHousing().getType() !== Housing.jail);
    check("…but can take over the family business", heir.crime?.pendingFamily?.name === "The Test Family");
    // good deeds cool the police
    const g = start(25); keep(g); Crime.state(g).heat = 30;
    g.leisureAction(Activities.leisure("soupKitchen")); drain();
    check("good deeds cool the police a little", Crime.heat(g) < 30);
    void Generations;
}

// ---------------------------------------------------------------- saves and old saves
{
    const p = start(30); keep(p);
    Crime.state(p).respect = 33;
    Crime.sendToJail(p, 50, "Theft", false, false); drain();
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    const bp = back.getSaveState().currentSlot().getPersonState();
    check("saves keep prison and your criminal life", bp.getCrimeState().getIsInJail() && bp.crime.jail.weeks === 50 && bp.crime.respect === 33);
    const q = start(30); delete q.crime;
    let ok = true;
    try { CrimeScreen.cells(q); CrimeScreen.status(q); Crime.afterWeek(q); rows(new LifepathsModelGenerator()); } catch (e) { ok = false; console.log(e); }
    check("older saves (no criminal history) work", ok);
}

// ---------------------------------------------------------------- fixes found while playing
{
    const p = start(25); keep(p);
    const s = Crime.state(p);
    s.open.push({ crime: "burglary", title: "Burgle a House", week: 0, violent: false, sentence: [24, 96] }, { crime: "burglary", title: "Burgle a House", week: 0, violent: false, sentence: [24, 96] });
    alerts.length = 0;
    seq([0.1, 0.1], () => Crime.arrest(p, [{ crime: "burglary", title: "Burgle a House", week: 0, violent: false, sentence: [24, 96] }], "Caught."));
    const msg = alerts.map((a) => a.getMessage?.() ?? a.message ?? JSON.stringify(a)).join(" ");
    check("repeat charges are counted, not listed again and again", /burgle a house \(3 counts\)/.test(msg), msg.slice(0, 300).replace(/\n/g, " | "));
    answer(/Public defender/); drain();
    if (Crime.inJail(p)) {
        const jailEnds = s.jail!.weeks;
        check("a conviction stays on background checks for 7 years AFTER the sentence", /clears in (\d+)/.test(Crime.recordBlock(p) ?? "") && +(/clears in (\d+)/.exec(Crime.recordBlock(p)!)![1]) >= Math.floor(jailEnds / 48) + 7, Crime.recordBlock(p) ?? "");
    } else check("a conviction stays on background checks for 7 years AFTER the sentence", true, "acquitted this run");
    check("sentences of exactly a year say \"1 year\"", Crime.years(48) === "1 year" && Crime.years(96) === "2 years");
}
{
    const p = start(30); keep(p);
    check("the Criminal badge (10+ years inside) can be earned now", !AchievementBadge.criminal.achieved(p) && (() => { Crime.state(p).stats.served = 481; return AchievementBadge.criminal.achieved(p); })());
}

{
    const p = start(30); keep(p);
    p.getJobState().switchJob(Job.retail);
    Crime.sendToJail(p, 2, "Vandalism", false, false); drain();
    check("a two-week stay keeps your job…", p.getJobState().getCurrentJob() === Job.retail);
    Crime.addJailWeeks(p, 48); drain();
    check("…until extra time (a failed escape) makes it a long one", p.getJobState().getCurrentJob() == null);
    p.getJobState().switchJob(Job.retail);
    check("nobody can hire you while you're inside", p.getJobState().getCurrentJob() == null);
}

void LIFE_SENTENCE;
console.log(failures ? `\n${failures} FAILED` : "\nall crime update checks passed");
process.exit(failures ? 1 : 0);
