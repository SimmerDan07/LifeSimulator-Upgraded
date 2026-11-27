// v0.35.0 "Vampires Reborn": the new vampire layers (ways in, the turning, weather and the sun, Hunger stages,
// Humanity and frenzy, torpor kinds, the power tree, the Hunt, supplies, the Masquerade, the court, bonds,
// screens, endings and converting old vampires).
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { LoveEvent } from "../src/game/Enums/LoveEvent";
import { Relationship } from "../src/game/Enums/Relationship";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { LoverPersonality } from "../src/game/Enums/LoverPersonality";
import { Sex } from "../src/game/Enums/Sex";
import { Country } from "../src/game/Enums/Country";
import { Person } from "../src/game/Managers/Person";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
import { SocialPerson } from "../src/game/Social/SocialPerson";
import { Relationships } from "../src/game/Social/Relationships";
import { LOVE_ACTIONS } from "../src/game/Social/LoveActions";
import { Vampire, BLOOD_DIETS } from "../src/game/Lifepaths/Vampire";
import { Reborn } from "../src/game/Vampires/Reborn";
import { Becoming, BECOMING_REBORN } from "../src/game/Vampires/Becoming";
import { Night, Masquerade, Court, Forever, supplyRate } from "../src/game/Vampires/Night";
import { Bonds, NIGHT_LOVE_ACTIONS } from "../src/game/Vampires/Bonds";
import { VScreens } from "../src/game/Vampires/VScreens";
import { Generations } from "../src/game/Managers/Generations";
import { TREE, TIER_COST, BLOODLINES, GROUNDS, VAMP_ICONS } from "../src/game/Vampires/VData";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Lifepaths; } }
let failures = 0, passes = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; else passes++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const W = 48;
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const titleOf = (a: any) => a.getTitle?.() ?? a.title;
const msgOf = (a: any) => a.getMessage?.() ?? "";
/** Dismiss everything, returning what was shown (alerts queue one at a time). */
const drain = (): { title: string; msg: string }[] => {
    const seen: { title: string; msg: string }[] = [];
    for (let i = 0; i < 60 && alerts.length; i++) { const a = alerts.shift(); seen.push({ title: titleOf(a), msg: msgOf(a) }); AlertManager.INSTANCE.alertDismissed(a); }
    return seen;
};
const clear = () => { drain(); };
const buttons = (a: any): any[] => [a.getPositiveButton?.(), ...(a.getAdditionalButtons?.() ? Array.from(a.getAdditionalButtons() as any) : []), a.getNegativeButton?.()].filter(Boolean);
const btnTitles = (a: any) => buttons(a).map((b: any) => b.getTitle());
/** Find the alert titled like `title` (dismissing what comes before it) and return it without pressing anything. */
const find = (title: RegExp): any => {
    for (let i = 0; i < 40; i++) {
        const a = alerts.find((x) => title.test(titleOf(x)));
        if (a) return a;
        if (!alerts.length) return null;
        AlertManager.INSTANCE.alertDismissed(alerts.shift());
    }
    return null;
};
/** Press the button matching `btn` on the alert titled like `title`. Returns the outcome text shown after, if any. */
const press = (title: RegExp, btn: RegExp): string | null => {
    const a = find(title);
    if (!a) return null;
    const b = buttons(a).find((x: any) => btn.test(x.getTitle()));
    if (!b) return null;
    alerts.splice(alerts.indexOf(a), 1);
    b.getAction().invoke();
    AlertManager.INSTANCE.alertDismissed(a);
    const after = alerts.find((x) => titleOf(x) === titleOf(a) || true);
    return after ? msgOf(after) : "";
};
const withRandom = <T>(v: number, fn: () => T): T => { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } };
const keep = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); };
const rich = (p: any, n = 50_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const week = (p: any, n = 1) => { for (let i = 0; i < n; i++) { keep(p); if (Vampire.isVampire(p)) Vampire.state(p).thirst = 0; p.applyWeekly(); clear(); } };
const start = (sc: any = LifeScenario.educatedAndInDebt) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); clear();
    const p = GameStateManager.INSTANCE.getPersonState() as any;
    p.setCountry(Country.unitedStates);
    return p;
};
/** A freshly risen vampire of a bloodline (Seeking, a quiet last night). */
const vamp = (line: any = "nosferim") => {
    const p = start(); rich(p);
    Vampire.state(p).discovered = true; Reborn.st(p).way = "seeking";
    Becoming.chooseLine(p, line);
    Becoming.beginTurning(p, "alone");
    clear();
    return p;
};
const friend = (p: any, first: string, score = 700, years = 30) => {
    const x = SocialPerson.make("friend" as any, Sex.INSTANCE.getRandomSex(), null, years * W);
    x.firstName = first; x.setRelationshipProgress(score);
    Relationships.circle(p).add(x);
    return x;
};
const lover = (p: any, first: string, score = 700) => {
    const x = new Person(Relationship.lover, Sex.female, "Vale", 30 * W); x.setFirstName(first); x.setLoverPersonality(LoverPersonality.cheerful);
    x.setRelationshipProgress(score);
    p.getFamilyState().date(x);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    return x;
};
const sunny = (p: any, w: any = "sunny") => { const r = Reborn.st(p); r.weather = w; r.weatherWeek = p.getTrueAgeInWeeks(); };
const month = (p: any, m: number, fn: () => void) => { p.getCurrentMonthIndex = () => m; try { fn(); } finally { delete p.getCurrentMonthIndex; } };
const titles = (rows: any[]) => rows.map((r: any) => r.title).filter((t: any) => typeof t === "string");

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());

// ================================================================ the data
check("five bloodlines, one per discipline", BLOODLINES.length === 5 && new Set(BLOODLINES.map((b) => b.discipline)).size === 5);
check("the power tree: 5 disciplines × 5 tiers", TREE.length === 25 && ["shadow", "blood", "mind", "beast", "sun"].every((d) => [1, 2, 3, 4, 5].every((t) => TREE.filter((n) => n.discipline === d && n.tier === t).length === 1)));
check("the 14 old power ids are kept", ["mistStep", "shadowStep", "mindFog", "bloodAlchemy", "regeneration", "bloodBank", "charm", "glamour", "hypnoticGaze", "beastTongue", "nightOwl", "batForm", "sunWard", "ancientScholar"].every((id) => TREE.some((n) => n.id === id)));
check("vampire art slots are listed (32)", VAMP_ICONS.length === 32 && VAMP_ICONS.every((x) => x.name && x.fallback));
check("the night's Love actions are registered", NIGHT_LOVE_ACTIONS.every((d) => LOVE_ACTIONS.some((x) => x.id === d.id)));
check("two new blood supplies: Your Own Herd, Hospital Night Shift", BLOOD_DIETS.some((d) => d.id === "herd") && BLOOD_DIETS.some((d) => d.id === "hospital"));

// ================================================================ ways in: Seduced
{
    const p = start(); rich(p);
    check("human: no offer yet", Becoming.canAccept(p) === "No vampire has offered you eternity yet");
    withRandom(0.01, () => Becoming.nightOut(p, LoveEvent.nightClub));
    const s = Vampire.state(p), r = Reborn.st(p);
    check("a pale stranger at a nightclub (Seduced)", s.discovered && r.way === "seduced" && r.meetings === 1 && !!find(/A Pale Stranger/));
    clear();
    const sire = Becoming.sire(p);
    check("…they're a real person: a night vampire who doesn't age", sire?.kind === "night" && sire.nightRole === "sire" && Relationships.circle(p).metaFor(sire.id).vampire && sire.getTrueAgeInWeeks() > sire.getAgeInWeeks());
    check("…with a sire name, age and bloodline", !!r.sireName && r.sireAge >= 80 && BLOODLINES.some((b) => b.id === r.sireLine));
    check("bite locked: meet them 2 more times", /2 more times/.test(Becoming.canAccept(p) ?? ""));
    const meet = BECOMING_REBORN.find((d) => d.id === "meet")!;
    check("Meet the stranger shows; Seek the Ancient hides", meet.show!(p) && !BECOMING_REBORN.find((d) => d.id === "seek")!.show!(p));
    const t1 = Becoming.meet(p);
    check("a second meeting tells a story", /gallery|rooftop|river/.test(t1) && r.meetings === 2);
    check("…1 more time", /1 more time first/.test(Becoming.canAccept(p) ?? ""));
    const t2 = Becoming.meet(p);
    check("the third meeting: the offer is made", /The offer is made/.test(t2) && Becoming.canAccept(p) == null && !meet.show!(p));
    check("other nightlife brings no second stranger once discovered", (() => { const id = r.sireId; withRandom(0.001, () => Becoming.nightOut(p, LoveEvent.nightClub)); return r.sireId === id && r.way === "seduced" && !find(/A Pale Stranger|^Attacked$/); })());
}

// ================================================================ ways in: Seeking (choose your bloodline)
{
    const p = start(); rich(p);
    withRandom(0.9, () => Becoming.seekStep(p));
    check("seeking can fail (60% a try)", Reborn.st(p).seekStep === 0 && !Vampire.state(p).discovered);
    const a = withRandom(0.1, () => Becoming.seekStep(p));
    const b = withRandom(0.1, () => Becoming.seekStep(p));
    check("step 1 and 2: the shop, the library", /occult shop/.test(a) && /library/.test(b) && !Vampire.state(p).discovered);
    const c = withRandom(0.1, () => Becoming.seekStep(p));
    check("step 3: they find you", /Choose the bloodline/.test(c) && Vampire.state(p).discovered && Reborn.st(p).way === "seeking");
    check("…bite locked until you choose", Becoming.canAccept(p) === "Choose your bloodline first");
    check("…five 'Join the …' rows", BECOMING_REBORN.filter((d) => d.id.startsWith("line-") && d.show!(p)).length === 5);
    const scr = VScreens.screen("vampire", p) as any[];
    check("…the screen shows each bloodline's gift and weakness", BLOODLINES.every((x) => scr.some((r) => r.title === x.title && /Gift/.test(text(r)) && /Weakness/.test(text(r)))));
    Becoming.chooseLine(p, "ashen");
    check("chose the Ashen: an old Ashen sire", Reborn.st(p).line === "ashen" && Becoming.sire(p)?.bloodline === "ashen" && Reborn.st(p).sireAge >= 200 && Becoming.canAccept(p) == null);
    check("…the rows go away", BECOMING_REBORN.filter((d) => d.id.startsWith("line-") && d.show!(p)).length === 0);
    // the turning: last night (sunrise)
    const bp0 = Vampire.state(p).bloodPower;
    Becoming.lastNightMenu(p);
    const ln = find(/Your Last Human Night/);
    check("Accept the Bite → your last human night (3 choices)", !!ln && btnTitles(ln).length === 3);
    const out = press(/Your Last Human Night/, /sunrise/);
    const rise = find(/You Rise/);
    check("watching one last sunrise: +1 blood power, then the bite", out != null && Vampire.isVampire(p) && Vampire.state(p).bloodPower >= bp0 + 1, `${bp0} → ${Vampire.state(p).bloodPower}`);
    check("rising: a first-hunger choice (3 options), always shows", !!rise && btnTitles(rise).length === 3 && !rise.random);
    press(/You Rise/, /Drink your fill/);
    check("drink your fill: Humanity 6, hunger 0", Reborn.humanity(p) === 6 && Vampire.state(p).thirst === 0);
    check("Seeking starts at Standing 30", Reborn.st(p).standing === 30);
    check("a Fledgling of the Ashen, 0 years", Reborn.rank(p).title === "Fledgling" && Reborn.line(p).id === "ashen" && Reborn.bloodYears(p) === 0);
    check("your city's court: a Prince and 4 more", Court.members(p).length === 5 && Court.prince(p)?.courtTitle === "Prince" && Court.members(p).filter((x: any) => x.courtTitle && x.courtTitle !== "Prince").length === 4);
    check("status line names rank and bloodline", /Fledgling of the Ashen/.test(VScreens.status(p)));
    clear();
}

// ================================================================ ways in: Attacked, Loved, Dying
{
    const p = start(); rich(p);
    Becoming.attacked(p);
    check("attacked: a milestone, and the turning has begun", !!find(/^Attacked$/) && Vampire.isTurning(p) && Reborn.st(p).way === "attacked");
    clear();
    keep(p); p.applyWeekly();
    const rise = find(/You Rise/);
    check("…a week later you rise", !!rise && Vampire.isVampire(p));
    press(/You Rise/, /Feed gently/);
    check("attacked starts darker: Humanity 5 + 1 for mercy", Reborn.humanity(p) === 6 && Vampire.state(p).thirst === 20);
    check("…Standing 10", Reborn.st(p).standing === 10);
    check("…and you can hunt your sire (Love › Night)", NIGHT_LOVE_ACTIONS.find((d) => d.id === "sireHunt")!.show!(Becoming.sire(p), p));
    clear();
}
{
    const p = start(); rich(p);
    const v = Becoming.makeVampire(p, "court", "velvet");
    check("a vampire you know (night kind, known)", Relationships.circle(p).metaFor(v.id).vampire && Vampire.isTurned(v));
    const ask = NIGHT_LOVE_ACTIONS.find((d) => d.id === "askTurn")!;
    check("Ask Them to Turn You shows for a vampire", ask.show!(v, p) && ask.lock!(v, p) == null);
    v.setRelationshipProgress(300);
    const no = Becoming.askToBeTurned(p, v);
    check("not loved enough: 'Not yet' (−30)", /Not yet/.test(no) && v.getRelationshipProgress() === 270 && !Vampire.state(p).discovered);
    v.setRelationshipProgress(700);
    Becoming.askToBeTurned(p, v);
    check("loved: they'll turn you (Loved, their bloodline)", Vampire.state(p).discovered && Reborn.st(p).way === "loved" && Reborn.st(p).sireId === v.getId() && Reborn.st(p).line === "velvet" && Becoming.canAccept(p) == null);
}
{
    const p = start(); rich(p);
    Vampire.state(p).discovered = true;
    p.getAgeInYears = () => 70;
    p.getAttributeState().setHealth(20);
    withRandom(0.01, () => Becoming.maybeDyingOffer(p));
    const a = find(/A Way Out/);
    check("old and very ill, knowing a vampire: A Way Out (always shows)", !!a && !a.random && btnTitles(a).join() === "Accept,Decline");
    press(/A Way Out/, /Accept/);
    check("accept: the turning begins (Dying)", Vampire.isTurning(p) && Reborn.st(p).way === "dying");
    clear();
    withRandom(0.01, () => Becoming.maybeDyingOffer(p));
    check("…offered only once", !find(/A Way Out/));
    delete p.getAgeInYears;
    clear();
}
{
    const p = start(); rich(p);
    const kin = Relationships.familyPeople(p).filter((x: any) => x.getIsAlive() && x.getPetType?.() == null);
    const before = kin.map((x: any) => x.getRelationshipProgress());
    Vampire.state(p).discovered = true; Reborn.st(p).way = "seeking"; Becoming.chooseLine(p, "ironblood");
    Becoming.beginTurning(p, "family");
    check("last night with family: +50 with each of them", kin.length > 0 && kin.every((x: any, i: number) => x.getRelationshipProgress() >= Math.min(1000, before[i] + 50) - 2 || before[i] >= 950), kin.map((x: any, i: number) => `${before[i]}→${x.getRelationshipProgress()}`).join(" "));
    press(/You Rise/, /Refuse/);
    check("refuse to feed: Humanity 9, hunger 50", Reborn.humanity(p) === 9 && Vampire.state(p).thirst === 50);
    clear();
}

// ================================================================ the weather and the sun
{
    const p = vamp("nosferim");
    p.setCountry((Country as any).uae);
    let sun = 0;
    month(p, 6, () => { for (let i = 0; i < 300; i++) if (Reborn.rollWeather(p) === "sunny") sun++; });
    check("a desert summer is mostly sunny", sun > 240, `${sun}/300`);
    p.setCountry((Country as any).norway);
    month(p, 0, () => check("far north in deep winter: Polar Night", Reborn.rollWeather(p) === "polarNight"));
    month(p, 6, () => check("far north in high summer: the Midnight Sun", Reborn.rollWeather(p) === "midnightSun"));
    p.setCountry((Country as any).uk);
    let rainy = 0;
    month(p, 9, () => { for (let i = 0; i < 300; i++) if (["rainy", "cloudy", "stormy"].includes(Reborn.rollWeather(p))) rainy++; });
    check("a temperate autumn is mostly grey", rainy > 180, `${rainy}/300`);
    p.setCountry(Country.unitedStates);
    const r = Reborn.st(p);
    month(p, 3, () => {
        sunny(p, "polarNight");
        check("no sun: daytime costs nothing", Reborn.sunCost(p).join() === "0,0");
        sunny(p, "sunny");
        check("a clear spring day: −10 happiness, −25 Vitality", Reborn.sunCost(p).join() === "10,25", Reborn.sunCost(p).join());
        sunny(p, "cloudy");
        check("cloudy: half", Reborn.sunCost(p).join() === "5,13", Reborn.sunCost(p).join());
        sunny(p, "sunny");
        check("outdoor jobs: double", Reborn.sunCost(p, true).join() === "20,50");
        Vampire.state(p).powers = ["sunWard"];
        check("Sun Ward halves it", Reborn.sunCost(p).join() === "5,13");
        Vampire.state(p).powers = ["sunWard", "overcast"];
        sunny(p, "cloudy");
        check("Overcast: a cloudy day is nearly free", Reborn.sunlight(p) < 0.06);
        Vampire.state(p).powers = [];
        sunny(p, "sunny");
        r.vitality = 100;
        withRandom(0.5, () => Reborn.exposed(p));
        check("a daytime outing takes 25 Vitality", r.vitality === 75);
        withRandom(0.5, () => { Reborn.exposed(p); Reborn.exposed(p); Reborn.exposed(p); });
        check("at 0 Vitality: sunburned for 4 weeks", r.vitality === 0 && r.sunburnWeeks === 4 && !!find(/Sunburned/));
        clear();
        withRandom(0.5, () => Reborn.exposed(p, false, true));
        check("a day shift costs a fifth of the happiness, half the Vitality", Reborn.sunCost(p).join() === "10,25");
        r.vitality = 100;
        Vampire.state(p).powers = ["daywalker"];
        withRandom(0.5, () => Reborn.exposed(p));
        check("Daywalker: the first outing a week is free", r.vitality === 100);
        withRandom(0.5, () => Reborn.exposed(p));
        check("…the second isn't", r.vitality === 75);
        Vampire.state(p).powers = [];
        r.vitality = 100; r.sunburnWeeks = 0;
        withRandom(0.01, () => Reborn.exposed(p));
        check("caught in the sun (rare): burns for 24 weeks, never fatal", r.burnWeeks === 24 && Vampire.isVampire(p) && !!find(/Caught in the Sun/));
        clear();
    });
    r.burnWeeks = 24; p.getAttributeState().setHealth(100);
    Night.week(p);
    check("burns: health can't go above 60 while they heal", p.getAttributeState().getHealth() <= 60 && r.burnWeeks === 23);
    r.burnWeeks = 0;
    r.vitality = 10; r.lair = [];
    Night.week(p);
    check("Vitality refills 25 a night", r.vitality === 35);
    r.lair = ["blackout"]; r.vitality = 10;
    Night.week(p);
    check("…50 with Blackout Rooms", r.vitality === 60);
    clear();
    const ashen = vamp("ashen");
    month(ashen, 3, () => { sunny(ashen, "sunny"); check("the Ashen burn 50% more in their first 25 years", Reborn.sunCost(ashen).join() === "15,38", Reborn.sunCost(ashen).join()); });
    clear();
}

// ================================================================ hunger stages, warnings, frenzy
{
    const p = vamp("ironblood"), s = Vampire.state(p), r = Reborn.st(p);
    check("hunger stages", ["Sated", "Peckish", "Hungry", "Starving", "Torpor is near"].join() === [10, 40, 65, 85, 96].map((h) => Reborn.stage(h)).join());
    check("Ironblood hunger rises 25% faster", Math.abs(Reborn.rateFactor(p) - 1.25) < 1e-9);
    s.thirst = 82; r.warned80 = false;
    Night.week(p);
    check("starving: a warning that always shows", (() => { const a = find(/^Starving$/); return !!a && !a.random; })());
    clear();
    Night.week(p);
    check("…once", !find(/^Starving$/));
    s.thirst = 96;
    Night.week(p);
    check("96: Torpor Is Near", !!find(/Torpor Is Near/));
    clear();
    s.thirst = 50; Night.week(p);
    check("fed again: the warnings reset", !r.warned80 && !r.warned95);
    s.thirst = 50;
    check("no frenzy below 60", Reborn.frenzyChance(p) === 0);
    s.thirst = 90; r.humanity = 7;
    const base = Reborn.frenzyChance(p);
    check("hungry: frenzy can strike", base > 0.1 && base < 0.2, String(base));
    r.humanity = 9;
    check("almost human: half as likely", Math.abs(Reborn.frenzyChance(p) - base / 2) < 1e-9);
    r.humanity = 2;
    check("a monster: far more likely", Reborn.frenzyChance(p) > base * 1.5);
    r.humanity = 7;
    s.powers = ["thePack"];
    check("The Pack: no frenzy at all", Reborn.frenzyChance(p) === 0);
    s.powers = [];
    const moon = vamp("moonborn"); Vampire.state(moon).thirst = 90;
    check("Moonborn frenzy 50% more often", Math.abs(Reborn.frenzyChance(moon) - base * 1.5) < 1e-9);
    clear();
    // frenzy, with a choice
    const q = vamp("velvet"), qs = Vampire.state(q);
    qs.thirst = 90;
    Reborn.frenzy(q);
    const f = find(/^Frenzy$/);
    check("frenzy: Resist / Flee / Give in", !!f && btnTitles(f).length === 3 && /Resist \(\d+%\)/.test(btnTitles(f)[0]) && btnTitles(f)[2] === "Give in");
    const h0 = Reborn.st(q).humanity;
    press(/^Frenzy$/, /Give in/);
    check("giving in: hunger −45, Humanity −1", qs.thirst === 45 && Reborn.st(q).humanity === h0 - 1);
    clear();
    qs.thirst = 90;
    Reborn.frenzy(q);
    withRandom(0.01, () => press(/^Frenzy$/, /Resist/));
    check("resisting (and succeeding) costs only sanity", qs.thirst === 90 && Reborn.st(q).humanity === h0 - 1);
    clear();
}

// ================================================================ Humanity over time, torpor kinds
{
    const p = vamp("nosferim"), s = Vampire.state(p), r = Reborn.st(p);
    s.diet = "hand"; r.humanity = 6; r.cleanWeeks = W - 1;
    Night.week(p);
    check("a year of clean feeding: Humanity +1", Reborn.humanity(p) === 7 && !!find(/^Humanity$/));
    clear();
    s.diet = "hunting"; r.humanity = 7;
    Night.week(p);
    check("hunting strangers every week wears Humanity down", r.humanity < 7 && r.humanity > 6.9);
    s.diet = "hand";
    // chosen torpor
    const cash0 = cash(p); r.hunt = 50; r.lair = [];
    const age0 = Reborn.st(p).bloodAgeWeeks, true0 = p.getTrueAgeInWeeks();
    Reborn.torpor(p, "chosen", 10);
    clear();
    check("chosen torpor: 10 years pass", p.getTrueAgeInWeeks() - true0 >= 10 * W - 2, String((p.getTrueAgeInWeeks() - true0) / W));
    check("…blood age counts at half speed", Math.abs((r.bloodAgeWeeks - age0) / W - 5) < 1.1, String((r.bloodAgeWeeks - age0) / W));
    check("…the Hunt cools 20", r.hunt === 30);
    check("…your money waits for you", cash(p) >= cash0 * 0.5);
    check("…and you're still a vampire, awake", Vampire.isVampire(p) && !Vampire.isInTorpor(p) && Vampire.isVampire(p));
    // lost to the Beast
    s.thirst = 0;
    Reborn.addHumanity(p, -20);
    check("Humanity 0: the Beast takes over", r.humanity === 0 && Reborn.pendingBeast);
    keep(p); p.applyWeekly(); clear();
    check("…years in torpor, waking at Humanity 1", Reborn.humanity(p) === 1 && !Reborn.pendingBeast && Vampire.isVampire(p) && Vampire.isVampire(p));
    // staked
    r.humanity = 5; r.hunt = 90; r.hunter = { name: "Ada Fell", base: "a gun shop", martyrs: 0, stage: 3 }; r.domain = "club";
    withRandom(0.5, () => { Reborn.torpor(p, "staked", 3); clear(); });   // no frenzy on waking (that could cost Humanity too)
    check("staked: Humanity −1, domain lost, the Hunt reset, hunter gone", r.humanity === 4 && r.domain === null && r.hunt === 10 && r.hunter === null && Vampire.isVampire(p), `h ${r.humanity} d ${r.domain} hunt ${r.hunt} ${JSON.stringify(r.hunter)}`);
}

// ================================================================ the power tree
{
    const p = vamp("nosferim"), s = Vampire.state(p), r = Reborn.st(p);
    const node = (id: string) => Reborn.node(id)!;
    s.bloodPower = 0;
    check("tier 1 needs blood power", /Needs 1 blood power/.test(Reborn.powerLock(node("mistStep"), p) ?? ""));
    check("Nosferim: Shadow powers cost 1 less (min 1)", Reborn.cost(node("mistStep"), p) === 1 && Reborn.cost(node("shadowStep"), p) === 1 && Reborn.cost(node("mindFog"), p) === 2);
    check("…other disciplines full price", Reborn.cost(node("glamour"), p) === TIER_COST[2]);
    s.bloodPower = 20;
    check("a Fledgling can't learn tier 2", /Needs Neonate rank/.test(Reborn.powerLock(node("shadowStep"), p) ?? ""));
    r.bloodAgeWeeks = 25 * W;
    check("25 years: Neonate", Reborn.rank(p).title === "Neonate");
    check("…tier 2 needs tier 1 first", /Learn Mist Step first/.test(Reborn.powerLock(node("shadowStep"), p) ?? ""));
    check("learn Mist Step", Reborn.learn(p, "mistStep") && Vampire.has("mistStep", p) && s.bloodPower === 19);
    check("…then Shadow Step", Reborn.learn(p, "shadowStep") && s.bloodPower === 18);
    check("…not twice", !Reborn.learn(p, "mistStep") && Reborn.powerLock(node("mistStep"), p) === "You have this power");
    check("tier 3 needs Ancilla", /Needs Ancilla/.test(Reborn.powerLock(node("mindFog"), p) ?? ""));
    r.humanity = 2;
    check("a monster finds Beast powers cheap", Reborn.cost(node("nightOwl"), p) === 1);
    r.humanity = 9;
    check("…the almost-human find them hard", Reborn.cost(node("nightOwl"), p) === 3);
    r.humanity = 7;
    check("reshape: once a century", Reborn.canReshape(p) == null);
    const back = Reborn.reshape(p);
    check("…every power back for its blood power", back === TIER_COST[1] + TIER_COST[2] && (s.powers ?? []).length === 0 && s.bloodPower === 18 + back);
    check("…no powers left to reshape", /no powers/.test(Reborn.canReshape(p) ?? ""));
    Reborn.learn(p, "mistStep");
    check("…and not again this century", /Once a century/.test(Reborn.canReshape(p) ?? ""));
    r.bloodAgeWeeks = 100 * W;
    check("a new century: you can again", Reborn.canReshape(p) == null && Reborn.rank(p).title === "Ancilla");
    const pw = VScreens.screen("vampire-powers", p) as any[];
    check("Powers screen: a section per discipline, every power listed", ["Shadow", "Blood", "Mind", "Beast", "Sun"].every((d) => titles(pw).includes(d)) && TREE.every((n) => titles(pw).some((t) => t.startsWith(n.title))));
    clear();
}

// ================================================================ the Hunt
{
    const p = vamp("ironblood"), s = Vampire.state(p), r = Reborn.st(p);
    s.thirst = 80; s.suspicion = 0; r.humanity = 7;
    const bpStart = s.bloodPower;
    check("hunting grounds: the five open ones", Night.grounds(p).map((g) => g.id).join() === "club,alleys,hospital,docks,gala");
    check("Hunt is open", Night.huntLock(p) == null);
    const t = Night.feed(p, "club", "young", "seduce", "sip", 1, true);
    check("a sip: hunger −25, no Humanity cost", s.thirst === 55 && Reborn.st(p).humanity === 7 && /Hunger −25/.test(t));
    check("…Rumours from the ground's risk", s.suspicion === 2);
    check("…once a week", /Once a week/.test(Night.huntLock(p) ?? ""));
    check("…a first vintage", r.vintages["Youth"] === 1 && /A new vintage/.test(t));
    s.thirst = 80;
    Night.feed(p, "alleys", "drunk", "stalk", "feast", 1, true);
    check("a stalked feast: hunger −55, Humanity −¼", s.thirst === 25 && Math.abs(r.humanity - 6.75) < 1e-9);
    r.humanity = 7; s.thirst = 80;
    Night.feed(p, "club", "inLove", "seduce", "feast", 1, true);
    check("a seduced feast is willing: no Humanity cost", r.humanity === 7);
    Night.feed(p, "alleys", "predator", "stalk", "feast", 1, true);
    check("feeding on a mugger: no guilt", r.humanity === 7);
    const bp0 = s.bloodPower;
    s.thirst = 100; const hunt0 = r.hunt;
    Night.feed(p, "docks", "worker", "stalk", "drain", 1, true);
    check("draining: hunger −90, Humanity −1, the Hunt +6", s.thirst === 10 && r.humanity === 6 && r.hunt === hunt0 + 6);
    check("every fourth new vintage: +1 blood power", Object.keys(r.vintages).length === 5 && s.bloodPower === bpStart + 1 && bp0 === s.bloodPower, `${Object.keys(r.vintages).length} vintages, bp ${bpStart}→${s.bloodPower}`);
    const bp1 = s.bloodPower;
    Night.feed(p, "gala", "famous", "seduce", "sip", 1, true);
    check("a famous face: +1 blood power the first time", s.bloodPower === bp1 + 1);
    Night.feed(p, "gala", "famous", "seduce", "sip", 1, true);
    check("…only the first time", s.bloodPower === bp1 + 1 && r.vintages["Fame"] === 2);
    s.suspicion = 0;
    const fail = withRandom(0.9, () => Night.feed(p, "club", "young", "stalk", "sip", 0.5));
    check("they get away: Rumours +6", s.suspicion === 6 && /got away/.test(fail));
    s.suspicion = 0; s.powers = ["glamour"];
    Night.feed(p, "alleys", "drunk", "glamour", "sip", 1, true);
    check("glamoured prey: no Rumours", s.suspicion === 0);
    s.powers = [];
    r.domain = "alleys"; s.suspicion = 0;
    Night.feed(p, "alleys", "drunk", "stalk", "sip", 1, true);
    check("your domain: half the Rumours", s.suspicion === 2);
    r.domain = null;
    check("a rival's territory needs a rival", !Night.grounds(p).some((g) => g.id === "rival"));
    const rv = Court.members(p).find((x: any) => x.id !== r.princeId)!;
    r.rivalId = rv.id; const rp = rv.getRelationshipProgress(); const st0 = r.standing;
    check("…then it opens", Night.grounds(p).some((g) => g.id === "rival"));
    Night.feed(p, "rival", "rich", "seduce", "sip", 1, true);
    check("feeding in their territory: Standing +3, rival −100", r.standing === st0 + 3 && rv.getRelationshipProgress() === rp - 100);
    r.rivalId = null;
    // the menus, end to end
    r.lastHunt = -1; s.thirst = 70;
    Night.hunt(p, "club");
    const g = find(/A Nightclub/);
    check("the Hunt: a ground offers three prey and a way home", !!g && btnTitles(g).length === 4 && btnTitles(g)[3] === "Go home hungry");
    press(/A Nightclub/, /./);
    const how = find(/How Do You Take Them/);
    check("…how do you take them (Seduce, Stalk, Let them go)", !!how && /Seduce \(\d+%\)/.test(btnTitles(how)[0]) && /Stalk/.test(btnTitles(how)[1]));
    press(/How Do You Take Them/, /Seduce/);
    const much = find(/How Much/);
    check("…how much (Sip, Feast, Drain)", !!much && btnTitles(much).join() === "Just a Sip,Feast,Drain Them");
    withRandom(0.01, () => press(/How Much/, /Just a Sip/));
    check("…and it happened", s.thirst === 45 && r.lastHunt === p.getTrueAgeInWeeks());
    clear();
    const mb = vamp("moonborn"); Vampire.state(mb).suspicion = 0;
    Night.feed(mb, "alleys", "drunk", "stalk", "sip", 1, true);
    check("Moonborn: hunting raises half the Rumours", Vampire.state(mb).suspicion === 2);
    const vel = vamp("velvet");
    Night.approach(vel, GROUNDS[0], "famous");
    check("Velvet Court: seducing always works", /Seduce \(100%\)/.test(btnTitles(find(/How Do You Take Them/)).join()));
    clear();
}

// ================================================================ blood supplies
{
    const p = vamp("velvet");
    const d = (id: string) => BLOOD_DIETS.find((x) => x.id === id)!;
    check("Your Own Herd: gather a herd first", /Gather a herd/.test(d("herd").lock!(p) ?? ""));
    const msg = Night.gatherHerd(p);
    const h = Night.herd(p);
    check("gathering a herd: a mortal in Love › Night", h.length === 1 && h[0].kind === "night" && h[0].nightRole === "herd" && /Love › Night/.test(msg) && !Relationships.circle(p).metaFor(h[0].id).vampire);
    check("…the supply opens", d("herd").lock!(p) == null);
    check("Hospital Night Shift needs a medical job", /medical job/.test(d("hospital").lock!(p) ?? ""));
    check("Velvet Court: bagged blood eases half as much", Math.abs(supplyRate(p, d("bags"), -20) + 10) < 1e-9);
    check("…the willing feed you well", supplyRate(p, d("herd"), -12) === -12 && supplyRate(p, d("donors"), -12) === -12);
    Reborn.st(p).lair = ["feeding"];
    check("a Feeding Room: the herd eases 5 more", supplyRate(p, d("herd"), -12) === -17 && Night.herdMax(p) === 4);
    const feed = NIGHT_LOVE_ACTIONS.find((x) => x.id === "herdFeed")!;
    check("feed on your herd from their screen", feed.show!(h[0], p));
    const ib = vamp("ironblood");
    check("Ironblood: hunger rises faster on a supply", supplyRate(ib, d("hand"), 1) === 1.25);
    check("Bags need the power or a medical job", /Blood Bank Contact/.test(d("bags").lock!(ib) ?? ""));
    clear();
}

// ================================================================ the Masquerade
{
    const p = vamp("nosferim"), s = Vampire.state(p), r = Reborn.st(p);
    s.diet = "hand";
    s.suspicion = 20;
    week(p, 8);
    check("Rumours fade on their own (Nosferim twice as fast)", s.suspicion <= 16, String(s.suspicion));
    r.hunt = 10; s.suspicion = 80;
    Masquerade.week(p);
    check("Rumours from 50 feed the Hunt", r.hunt > 12, String(r.hunt));
    s.suspicion = 10; r.hunt = 10;
    Masquerade.week(p);
    check("…low Rumours let it cool", r.hunt === 9);
    r.hunt = 35; s.suspicion = 40;
    Masquerade.week(p);
    check("the Hunt at 30: a named hunter starts asking questions", !!r.hunter && / /.test(r.hunter.name) && r.hunter.stage === 1 && !!find(/Someone's Asking Questions/));
    clear();
    r.hunt = 65;
    Masquerade.week(p);
    check("…at 60: They Know", r.hunter?.stage === 2 && !!find(/They Know/));
    clear();
    const name = r.hunter!.name;
    check("Masquerade screen shows the hunter", (VScreens.screen("vampire-masquerade", p) as any[]).some((x) => x.title === name));
    // the strike
    s.bloodPower = 5; r.bloodAgeWeeks = 30 * W; r.owed = 1;
    Masquerade.strike(p);
    const a = find(/The Hunters Strike/);
    const bt = a ? btnTitles(a) : [];
    check("they strike: always shows, with real choices", !!a && !a.random && /Fight \(\d+%\)/.test(bt[0]) && bt.includes("Flee the city") && bt.some((x) => /Talk/.test(x)) && bt.some((x) => /Turn them/.test(x)) && bt.some((x) => /Call your court/.test(x)), bt.join(" | "));
    press(/The Hunters Strike/, /Call your court/);
    check("calling your court: a favour spent, the Hunt to 10", r.owed === 0 && r.hunt === 10 && r.hunter === null);
    clear();
    // flee without powers: a new city
    const prince0 = r.princeId; r.hunt = 90; r.standing = 50;
    const out = Masquerade.flee(p);
    check("fleeing: a new city, a new court (you start at Known)", /left before dawn/.test(out) && r.princeId !== prince0 && Court.members(p).length === 5 && r.standing === 20 && r.hunt === 50);
    s.powers = ["mistStep"]; r.hunt = 90;
    Masquerade.flee(p);
    check("…as mist: the Hunt −35, nothing lost", r.hunt === 55);
    s.powers = [];
    // fight and lose: staked, never dead
    r.hunt = 90;
    const lost = withRandom(0.99, () => Masquerade.fight(p, 0.5));
    check("losing a fight: staked (torpor), not death", /stake/.test(lost) && s.collapsePending && (s as any).torporKind === "staked");
    s.collapsePending = false; delete (s as any).torporKind;
    r.allyIds = [Court.members(p)[1].id];
    const saved = withRandom(0.99, () => Masquerade.fight(p, 0.5));
    check("an ally saves you once", /ally/.test(saved) && !s.collapsePending && r.hunt === 30);
    const won = withRandom(0.01, () => Masquerade.fight(p, 0.5));
    check("winning: the Hunt −50", /You won/.test(won) && r.hunt === 0);
    // cover story and new identity
    s.suspicion = 40;
    Masquerade.coverStory(p);
    check("a cover story: Rumours −10, kept", r.cover && s.suspicion === 30);
    check("a new identity needs 15 years as this person", /15\+ needed/.test(Masquerade.identityLock(p) ?? ""));
    r.identityWeek = p.getTrueAgeInWeeks() - 16 * W; s.suspicion = 40;
    check("…then it opens", Masquerade.identityLock(p) == null);
    const idt = Masquerade.newIdentity(p);
    check("a new identity: a new first name, Rumours −30, the clock restarts", /retired abroad/.test(idt) && s.suspicion === 10 && Masquerade.identityLock(p) != null);
    // ageing in public
    r.cityWeek = p.getTrueAgeInWeeks() - 11 * W; r.lastAgeing = r.cityWeek;
    Masquerade.week(p);
    check("ten years in one city: 'You Haven't Aged a Day'", !!find(/You Haven't Aged a Day/));
    clear();
    // the Prince's summons
    s.suspicion = 96; (r as any).lastSummons = -9999;
    Masquerade.week(p);
    const sm = find(/Summoned by the Prince/);
    check("Rumours 95+: the Prince summons you (always shows)", !!sm && !sm.random && btnTitles(sm).length === 3);
    s.bloodPower = 4;
    press(/Summoned by the Prince/, /Pay in blood/);
    check("…pay in blood: −2 blood power, Rumours −30", s.bloodPower === 2 && s.suspicion <= 66);
    clear();
}

// ================================================================ the court
{
    const p = vamp("velvet"), s = Vampire.state(p), r = Reborn.st(p);
    check("Standing starts Known", Reborn.standingTitle(p) === "Known");
    check("court can be attended", Court.canAttend(p) == null);
    const st0 = r.standing;
    Court.attend(p);
    check("Court in Elysium: support, speak, stay quiet", btnTitles(find(/Court in Elysium/)).length === 3);
    press(/Court in Elysium/, /Support the Prince/);
    check("…supporting the Prince: Standing +2", r.standing === st0 + 2);
    check("…court meets once a month", /once a month/.test(Court.canAttend(p) ?? ""));
    clear();
    // favours
    r.owed = 1; s.suspicion = 60;
    Court.callFavour(p);
    press(/Call In a Favour/, /Bury the Rumours/);
    check("a favour buries the Rumours", r.owed === 0 && s.suspicion === 20);
    clear();
    // the Prince's task
    check("a task", Court.taskLock(p) == null && /The Prince's task/.test(Court.startTask(p)));
    check("…one at a time", /Busy/.test(Court.taskLock(p) ?? ""));
    r.task!.until = p.getTrueAgeInWeeks();
    const bp0 = s.bloodPower, st1 = r.standing;
    withRandom(0.1, () => Court.week(p));
    check("…done: Standing +10, +1 blood power, a favour", r.task === null && r.standing === st1 + 10 && s.bloodPower === bp0 + 1 && r.owed === 1 && !!find(/Task Done/));
    clear();
    check("…every 12 weeks", /every 12 weeks/.test(Court.taskLock(p) ?? ""));
    // domain
    r.standing = 30;
    check("a domain needs Respected (40)", /Respected/.test(Court.domainLock(p) ?? ""));
    r.standing = 40;
    check("…Respected", Reborn.standingTitle(p) === "Respected" && Court.domainLock(p) == null);
    Court.claimDomain(p, "docks");
    check("…claimed", r.domain === "docks");
    // a rival
    r.rivalId = null; r.bloodAgeWeeks = 3 * W; r.lastRivalry = p.getTrueAgeInWeeks();
    withRandom(0.001, () => Court.week(p));
    check("a rival takes against you", !!r.rivalId && r.rivalId !== r.princeId && !!find(/A Rival/));
    clear();
    const challenge = NIGHT_LOVE_ACTIONS.find((d) => d.id === "nightChallenge")!;
    check("…challenge them from their screen", challenge.show!(Court.rival(p), p));
    // allies and romance
    const m = Court.members(p).find((x: any) => x.id !== r.princeId && x.id !== r.rivalId)!;
    const ally = NIGHT_LOVE_ACTIONS.find((d) => d.id === "nightAlly")!;
    m.setRelationshipProgress(500);
    check("an alliance needs 700", /700/.test(ally.lock!(m, p) ?? ""));
    m.setRelationshipProgress(750);
    ally.run!(m, p); clear();
    check("…allies", r.allyIds.includes(m.id));
    const date = NIGHT_LOVE_ACTIONS.find((d) => d.id === "nightDate")!;
    check("the Prince doesn't date subjects", /Prince/.test(Bonds.dateLock(p, Court.prince(p)) ?? ""));
    m.setRelationshipProgress(650);
    check("ask a court vampire out", date.show!(m, p) && date.lock!(m, p) == null);
    const said = Bonds.date(p, m);
    const partner = p.getFamilyState().getPartner();
    check("…two immortals: a partner who's a vampire", /said yes/.test(said) && partner != null && Vampire.isTurned(partner) && !r.allyIds.includes(m.id));
    check("court screen: Standing, actions and the court", (() => { const c = VScreens.screen("vampire-court", p) as any[]; return c.some((x) => x.title === "Standing") && titles(c).includes("Attend Court") && titles(c).includes("The Court"); })());
    clear();
}

// ================================================================ bonds: secrets, childer, thralls, ageing, grief, heirs
{
    const p = vamp("nosferim"), s = Vampire.state(p), r = Reborn.st(p);
    const f = friend(p, "Mira", 700);
    withRandom(0.9, () => Bonds.tell(p, f));
    check("telling a close friend: they keep your secret", Vampire.knows(f) && !!find(/Your Secret/));
    clear();
    // siring
    s.bloodPower = 10;
    check("a Fledgling can't sire", /Neonate/.test(Bonds.turnLock(p, f) ?? ""));
    r.bloodAgeWeeks = 25 * W;
    check("a Neonate can", Bonds.turnLock(p, f) == null);
    const young = friend(p, "Kit", 700, 16);
    check("…not someone under 18", /18/.test(Bonds.turnLock(p, young) ?? ""));
    const foe = friend(p, "Rex", 300);
    Relationships.meta(foe).knows = true;
    const h0 = r.humanity, st0 = r.standing;
    Bonds.turn(p, foe); clear();
    check("turning someone against their will: Humanity −2, Standing −10", r.humanity === h0 - 2 && r.standing === Math.max(0, st0 - 10) && foe.getRelationshipProgress() < 300);
    check("…they're your childe", Bonds.childer(p).some((x: any) => x.id === foe.id) && Vampire.isTurned(foe));
    const guide = NIGHT_LOVE_ACTIONS.find((d) => d.id === "guideChilde")!;
    check("Guide Your Childe shows (it only ever helps)", guide.show!(foe, p) && (guide as any).bond > 0);
    const o0 = r.owed;
    Bonds.guide(p, foe); Bonds.guide(p, foe);
    const g3 = Bonds.guide(p, foe);
    check("…guided three times: they speak for you (+1 favour)", r.owed === o0 + 1 && /speaks for you/.test(g3));
    check("Bloodline screen lists your childer", (VScreens.screen("vampire-bloodline", p) as any[]).some((x) => /Your Childer \(1\)/.test(x.title ?? "")));
    // thralls
    const share = NIGHT_LOVE_ACTIONS.find((d) => d.id === "shareBlood")!;
    check("Share Your Blood with a mortal who knows", share.show!(f, p) && share.lock!(f, p) == null);
    check("…not with a vampire", !share.show!(foe, p));
    const h1 = r.humanity;
    Bonds.share(p, f); Bonds.share(p, f);
    check("…twice: not yet bound", !Relationships.meta(f).thrall);
    Bonds.share(p, f);
    check("…three times: a thrall (Humanity −1)", Relationships.meta(f).thrall && Bonds.thralls(p).some((x: any) => x.id === f.id) && r.humanity === h1 - 1 && f.getRelationshipProgress() >= 900);
    s.suspicion = 30;
    Masquerade.week(p);
    check("thralls quiet the gossip", s.suspicion <= 29);
    const g = friend(p, "Ola", 700); Relationships.meta(g).knows = true;
    s.powers = ["bloodBond"];
    Bonds.share(p, g);
    check("Blood Bond: one sharing is enough", Relationships.meta(g).thrall);
    s.powers = [];
    // a mortal partner ages
    const ln = lover(p, "June");
    Relationships.meta(ln).knows = true;
    ln.getAgeInYears = () => 51;
    Bonds.week(p);
    const a = find(/June Is 50/);
    check("your partner turns 50: 'You haven't changed at all'", !!a && btnTitles(a).some((x) => /Offer to turn them/.test(x)) && btnTitles(a).includes("Stay until the end"));
    press(/June Is 50/, /Stay until the end/);
    clear();
    Bonds.week(p);
    check("…once per milestone", !find(/June Is/));
    // grief
    const dead = friend(p, "Bo", 800);
    Bonds.grief(dead);
    const gr = find(/^Grief$/);
    check("a loved mortal dies: Grief, with a choice", !!gr && btnTitles(gr).length === 3);
    press(/^Grief$/, /Never love a mortal again/);
    check("…never love again: dating rarely works now", r.neverLove && Bonds.datingFactor(p) === 0.3);
    clear();
    // heirs
    const heir: any = {};
    Bonds.heir(p, heir);
    check("your heir inherits a vampire legacy", heir.vampireLegacy?.line === "nosferim" && heir.vampireLegacy.childer.length === 1);
    // the sire
    const sire = Becoming.sire(p);
    const learn = NIGHT_LOVE_ACTIONS.find((d) => d.id === "sireLearn")!;
    sire.setRelationshipProgress(700);
    const bp = s.bloodPower;
    check("learn from your sire (once a year)", learn.show!(sire, p) && learn.lock!(sire, p) == null);
    learn.run!(sire, p); clear();
    check("…+1 blood power", s.bloodPower === bp + 1 && /Once a year/.test(learn.lock!(sire, p) ?? ""));
}

// ================================================================ lair, vault, eras
{
    const p = vamp("ironblood"), r = Reborn.st(p);
    Forever.buyLair(p, "crypt");
    check("build a Crypt", r.lair.includes("crypt"));
    r.hunt = 50; Reborn.torpor(p, "chosen", 10); clear();
    check("…chosen torpor in a Crypt cools the Hunt 30", r.hunt === 20);
    const c0 = cash(p);
    Forever.vaultIn(p, 100_000);
    check("the Vault hides money", r.vault === 100_000 && cash(p) === c0 - 100_000);
    const out = Forever.vaultOut(p);
    check("…and gives it back", out === 100_000 && r.vault === 0 && cash(p) === c0, `${c0} → ${cash(p)}`);
    check("the Elder's Manor needs Elder rank", (VScreens.screen("vampire-lair", p) as any[]).some((x) => /Needs Elder rank/.test(text(x))));
    Forever.era(p);
    check("a new era: adapt or cling", btnTitles(find(/The World Changed/)).join() === "Adapt,Cling to the past");
    clear();
}

// ================================================================ endings
{
    const p = vamp("ashen"), s = Vampire.state(p), r = Reborn.st(p);
    check("Golconda: hold Humanity 10 for a century", /Hold Humanity 10/.test(Forever.golcondaLock(p) ?? ""));
    r.at10Weeks = 100 * W;
    check("…then a quest", Forever.golcondaLock(p) == null);
    Forever.golcondaStep(p); Forever.golcondaStep(p);
    check("…three steps", !r.golconda);
    Forever.golcondaStep(p);
    check("Golconda: hunger almost gone, no frenzy, the sun only stings", r.golconda && Reborn.rateFactor(p) === 0.25 && (s.thirst = 90, Reborn.frenzyChance(p) === 0) && Reborn.sunlight(p) < 0.4);
    r.golconda = false;
    check("research a Cure: the Ashen, from Neonate", /Neonate/.test(Forever.cureLock(p) ?? ""));
    r.bloodAgeWeeks = 25 * W;
    check("…open", Forever.cureLock(p) == null);
    for (let i = 0; i < 11; i++) Forever.research(p);
    check("…12 months of research", r.cureResearch === 11 && s.cureWeeks === 0);
    Forever.research(p);
    check("…the Cure is ready", s.cureWeeks > 0);
    const nv = vamp("velvet");
    check("others can't research it", /Only the Ashen/.test(Forever.cureLock(nv) ?? ""));
    check("…unless they know Ancient Scholar", (Vampire.state(nv).powers = ["ancientScholar"], (Reborn.st(nv).bloodAgeWeeks = 25 * W), Forever.cureLock(nv) == null));
    clear();
}

// ================================================================ screens
{
    const p = vamp("moonborn");
    const home = VScreens.screen("vampire", p) as any[];
    check("home: Hunger, Humanity, Vitality, Rumours, the Hunt", ["Hunger", "Humanity", "Vitality", "Rumours", "The Hunt"].every((m) => home.some((x) => x.title === m)));
    check("home: this week's weather and night mode", home.some((x) => /^This Week: /.test(x.title ?? "")) && home.some((x) => /Night mode/.test(text(x))));
    check("home: Feeding, The Hunt, Quick Feeding, Your Night, Endings", ["Feeding", "The Hunt", "Quick Feeding", "Your Night", "Endings"].every((h) => titles(home).includes(h)), titles(home).join(","));
    check("home: links to Powers, Masquerade, Court, Lair, Bloodline", ["Powers", "The Masquerade", "Court", "Your Lair", "Bloodline"].every((t) => titles(home).includes(t)));
    for (const key of ["vampire-powers", "vampire-masquerade", "vampire-court", "vampire-lair", "vampire-bloodline"]) {
        const rows = VScreens.screen(key, p) as any[];
        check(`${VScreens.title(key)} screen renders`, rows.length > 3 && rows.every((x) => x != null));
    }
    check("each power's row says its cost", (VScreens.screen("vampire-powers", p) as any[]).some((x) => /BP/.test(text(x))));
    check("Masquerade: Covering Your Tracks", titles(VScreens.screen("vampire-masquerade", p) as any[]).includes("Covering Your Tracks"));
    check("Lair: chosen torpor and the Vault", (() => { const l = VScreens.screen("vampire-lair", p) as any[]; return titles(l).includes("Chosen Torpor") && titles(l).some((t) => /The Vault/.test(t)); })());
    check("Endings: Final Rest, Golconda, a Cure", ["Seek Golconda", "Research a Cure"].every((t) => titles(home).includes(t)));
    const human = start();
    check("a human sees the way in", titles(VScreens.screen("vampire", human) as any[]).includes("Seek the Ancient"));
    clear();
}


// ================================================================ playing on as your childe
{
    const p = vamp("moonborn"), s = Vampire.state(p), r = Reborn.st(p);
    r.bloodAgeWeeks = 120 * W; s.bloodPower = 10; r.standing = 70; r.vault = 250_000;
    const kidHeirs = Generations.eligibleHeirs(p).length;
    const x = friend(p, "Sol", 800, 27); Relationships.meta(x).knows = true;
    Bonds.turn(p, x); clear();
    Relationships.meta(x).turnedWeek = p.getTrueAgeInWeeks() - 40 * W;
    check("an adult childe can carry on", Bonds.heirs(p).some((c: any) => c.id === x.id) && Generations.anyHeirs(p));
    check("…the death pop-up offers it", kidHeirs > 0 || Generations.heirButtonTitle(p) === "Continue as your childe");
    const list = Generations.heirListViewModel() as any;
    check("…the heir screen lists Your Childer", /Your Childer/.test(text(list)) && /Play as Sol/.test(text(list)));
    const courtIds = Court.members(p).map((c: any) => c.id).sort().join();
    const parentName = p.getFullName();
    Vampire.finalRest(p); clear();
    Bonds.continueAsChilde(p, x);
    const h: any = GameStateManager.INSTANCE.getPersonState();
    const seen = drain();
    check("you're the childe now", h !== p && h.getFirstName() === "Sol");
    check("…a vampire of the same bloodline, 40 years of blood", Vampire.isVampire(h) && Reborn.line(h).id === "moonborn" && Reborn.bloodYears(h) === 40 && Reborn.rank(h).title === "Neonate");
    check("…your sire is the one who chose Final Rest", Reborn.st(h).sireName === parentName && Becoming.sire(h) == null);
    check("…the same court remembers you, halfway to your sire's standing", Court.members(h).map((c: any) => c.id).sort().join() === courtIds && Reborn.st(h).standing === 35);
    check("…the Vault passes with the bloodline", Reborn.st(h).vault === 250_000);
    check("…a welcome that says so", seen.some((a) => a.title === "Your Sire's Legacy") && seen.some((a) => /childe of/.test(a.msg)), seen.map((a) => a.title).join("|"));
    check("…and the game goes on", (() => { try { week(h, 3); return Vampire.isVampire(h) && !Reborn.st(h).converted === false; } catch (e) { return false; } })());
    check("Vampire screens work for the childe", (VScreens.screen("vampire", h) as any[]).length > 10 && /Moonborn/.test(VScreens.status(h)));
}

// ================================================================ old vampires: You've Been Reborn
{
    const p = vamp("nosferim"), s = Vampire.state(p);
    delete (s as any).rb;
    s.powers = ["charm", "glamour", "mistStep"]; s.suspicion = 60; s.vampireWeeks = 30 * W;
    const lv = friend(p, "Lev", 800); Relationships.meta(lv).vampire = true; Relationships.meta(lv).knows = true;
    Night.week(p);
    const r = Reborn.st(p);
    check("an old vampire is converted once: You've Been Reborn (always shows)", (() => { const a = find(/You've Been Reborn/); return !!a && !a.random; })());
    clear();
    check("…the bloodline that fits your powers (Mind → Velvet Court)", r.line === "velvet");
    check("…blood age from your years (Neonate at 30)", Reborn.bloodYears(p) === 30 && Reborn.rank(p).title === "Neonate");
    check("…the Hunt from your suspicion", r.hunt >= 19 && r.hunt <= 22, String(r.hunt));
    check("…a sire, a court", !!Becoming.sire(p) && Court.members(p).length === 5);
    check("…the ones you turned are your childer", Bonds.childer(p).some((x: any) => x.id === lv.id) || Relationships.meta(lv).childe === true);
    check("…powers kept", ["charm", "glamour", "mistStep"].every((id) => Vampire.has(id, p)));
    check("…your sire and the court aren't your childer or coven", !Bonds.childer(p).some((x: any) => x.kind === "night") && !Vampire.coven(p).some((x: any) => x.kind === "night"));
    check("…the court's birthdays aren't every week", Court.members(p).every((x: any) => !Relationships.isBirthdayWeek(x)));
    check("…the court sits in a city", Court.cityName(p) === "New York" && (p.setCountry((Country as any).germany), Court.cityName(p) === "Berlin"));
    p.setCountry(Country.unitedStates);
    Night.week(p);
    check("…only once", !find(/You've Been Reborn/));
    clear();
    check("an old vampire may choose their bloodline once", Becoming.lineChoiceLock(p) == null && titles(VScreens.screen("vampire-bloodline", p) as any[]).includes("Choose Your Bloodline"));
    Becoming.lineMenu(p);
    check("…all five offered", btnTitles(find(/Your Bloodline/)).length === 5);
    press(/Your Bloodline/, /^Ashen$/);
    check("…chose the Ashen", r.line === "ashen" && Becoming.sire(p)?.bloodline === "ashen" && /already chosen/.test(Becoming.lineChoiceLock(p) ?? ""));
    check("…and the row goes away", !titles(VScreens.screen("vampire-bloodline", p) as any[]).includes("Choose Your Bloodline"));
    const born = vamp("velvet");
    check("…a vampire turned in this version keeps their sire's bloodline", /from your sire/.test(Becoming.lineChoiceLock(born) ?? ""));
    clear();
}

console.log(`\n${passes} passed, ${failures} failed`);
if (failures) process.exit(1);
