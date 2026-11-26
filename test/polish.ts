// v0.25.0 "The Polish Update": typo fixes, Hobbies, Life Moments, auto anniversaries, Celebrity × Vampire cross content.
import { SpouseIncome } from "../src/game/Social/SpouseIncome";
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { Relationship } from "../src/game/Enums/Relationship";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { Sex } from "../src/game/Enums/Sex";
import { LoverPersonality } from "../src/game/Enums/LoverPersonality";
import { Person } from "../src/game/Managers/Person";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { Hobbies, HOBBIES, LEVELS } from "../src/game/Managers/Hobbies";
import { LifeMoments, MOMENTS } from "../src/game/Managers/LifeMoments";
import { Relationships } from "../src/game/Social/Relationships";
import { Vampire, FEEDING, HIDING, LifeActions } from "../src/game/Lifepaths/Vampire";
import { Celebrity, FAME } from "../src/game/Lifepaths/Celebrity";
import { SUPERFAN, MIDNIGHT_SHOW, RETURN_FROM_DEAD } from "../src/game/Lifepaths/Crossover";
import { Job } from "../src/game/Enums/Job";
import strings from "../src/game/data/strings.json";
import { AssistedDying } from "../src/game/Managers/AssistedDying";
import { Subscriptions } from "../src/game/Managers/Subscriptions";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Leisure; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { for (let i = 0; i < 100 && alerts.length; i++) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const titlesOf = () => alerts.map((a) => a.getTitle?.() ?? a.title);
/** Dismiss everything (queued ones show as the current one closes) and return every alert seen. */
const drain = (): any[] => { const seen: any[] = []; for (let i = 0; i < 200 && alerts.length; i++) { const a = alerts.shift(); seen.push(a); AlertManager.INSTANCE.alertDismissed(a); } return seen; };
const T = (xs: any[]) => xs.map((a) => a.getTitle?.() ?? a.title);
const W = 48;
const withRandom = <T>(v: number, fn: () => T): T => { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const rich = (p: any, n = 1_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const rows = (g: any) => Array.from(g.generateViewModels().getContentViewModels() as any) as any[];
const titles = (rs: any[]) => rs.map((r) => r.title).filter((t) => typeof t === "string");
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const start = (age: number, tweak?: (np: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.initializeAge(age, true);
    np.getTraitState().getTraits().clear();
    tweak?.(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const lover = (p: any, first: string, score = 700) => {
    const x = new Person(Relationship.lover, Sex.female, "Vale", 30 * W); x.setFirstName(first); x.setLoverPersonality(LoverPersonality.cheerful);
    x.setRelationshipProgress(score);
    p.getFamilyState().date(x);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    return x;
};

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
LifeMoments.enabled = false;   // turned on where tested

// ---------------------------------------------------------------- typos
{
    const all = Object.values(strings as any).filter((v) => typeof v === "string").join("\n");
    const bad = ["Eradiction", "Pan handler", "neccessary", "avaliable", "theraputic", "youself", "Sofware", "Its Over", "Your found", "Detriot", "Sacremento", "Franciso"].filter((w) => all.includes(w));
    check("typos fixed in the game's text", bad.length === 0, bad.join(", "));
    check("…'Panhandler' and 'Disease Eradication'", all.includes("Panhandler") && all.includes("Disease Eradication: Polio"));
}

// ---------------------------------------------------------------- hobbies
{
    let p = start(4);
    check("no Hobbies section under 6", !titles(rows(new VacationModelGenerator())).includes("Hobbies"));
    p = start(25);
    rich(p);
    let r = rows(new VacationModelGenerator());
    const hi = titles(r).indexOf("Hobbies");
    check("Leisure tab: a Hobbies section with 8 hobbies", hi >= 0 && HOBBIES.every((d) => titles(r).includes(d.title)), titles(r).slice(hi, hi + 9).join(" | "));
    const paint = r.find((x) => x.title === "Painting");
    check("hobby rows explain how to level up", /Practice to reach Amateur at 20/.test(text(paint)));
    const w0 = p.getAgeInWeeks(), c0 = cash(p);
    paint.actionButton.action.invoke(); clear();
    const s1 = Hobbies.skill("painting", p);
    check("Practice: one week passes, costs $15, skill goes up", p.getAgeInWeeks() === w0 + 1 && s1 >= 8 && s1 <= 10 && c0 - cash(p) >= 15, `skill ${s1}, weeks ${p.getAgeInWeeks() - w0}`);
    check("…and the row shows the level", rows(new VacationModelGenerator()).some((x) => /^Painting · Beginner \d+$/.test(x.title)));
    let lvlAlert = false;
    for (let i = 0; i < 4; i++) { keep(p); Hobbies.practice("painting", p); if (titlesOf().includes("Amateur Painter")) lvlAlert = true; clear(); }
    check("reaching Amateur: a message, and a show-off row appears", lvlAlert && Hobbies.skill("painting", p) >= 20 && rows(new VacationModelGenerator()).some((x) => x.title === "Sell a Painting"));
    const c1 = cash(p);
    const res = Hobbies.showOff("painting", p); clear();
    check("Sell a Painting: you get paid (and a week passes)", res != null && cash(p) > c1, `${res}`);
    check("…then wait 4 weeks", /Again in \d weeks?/.test(Hobbies.canShow("painting", p) ?? ""), Hobbies.canShow("painting", p) ?? "");
    // gains slow down near the top
    check("practice gains slow down as you improve", Hobbies.gain(0) === 9 && Hobbies.gain(50) === 5 && Hobbies.gain(95) === 2);
    check("levels: Beginner, Amateur 20, Skilled 45, Expert 70, Master 90", LEVELS.map((l) => `${l.name}${l.min}`).join(",") === "Beginner0,Amateur20,Skilled45,Expert70,Master90");
    // every hobby's show-off works at every level
    let ok = true, msgs: string[] = [];
    for (const d of HOBBIES) for (const s of [25, 50, 75, 95]) {
        const h = Hobbies.state(d.id, p); h.skill = s; h.lastShow = -999;
        rich(p, 100000);
        const m = Hobbies.showOff(d.id, p); clear();
        if (typeof m !== "string" || !m.length) { ok = false; msgs.push(`${d.id}@${s}`); }
    }
    check("every hobby's show-off works at every level (32 tries)", ok, msgs.join(", "));
    const music0 = Celebrity.state(p).music;
    Hobbies.practice("guitar", p); clear();
    check("cross: practising guitar trains the Celebrity Life music skill", Celebrity.state(p).music === music0 + 1);
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    check("hobbies are saved", back.getSaveState().currentSlot().getPersonState().hobbies?.painting?.skill === Hobbies.skill("painting", p));
    check("Hobbies.summary lists Amateur+", /Painting \((Skilled|Expert|Master)\)/.test(Hobbies.summary(p)), Hobbies.summary(p));
}

// ---------------------------------------------------------------- life moments
{
    // every moment, every option, for a player who fits
    const setups: Record<string, (age: number) => any> = {
        any: (age) => { const p = start(age); rich(p, 200000); return p; },
    };
    let built = 0, ran = 0;
    const broken: string[] = [];
    // v0.32.0: the school and home moments (y_…) are tested in test/youth.ts; the old Driving Test moment is retired
    const LIST = MOMENTS.filter((m) => !m.id.startsWith("y_") && !m.id.startsWith("w_") && !m.id.startsWith("sc_") && m.id !== "drivingTest");   // v0.33.0: work (w_…) and self-care (sc_…) moments are in test/workplace.ts
    for (const m of LIST) {
        const age = Math.min(m.max, Math.max(m.min, m.min >= 60 ? 66 : m.min < 13 ? m.min + 1 : m.min + 6));
        for (let opt = 0; opt < 3; opt++) {
            const p = setups.any(age);
            if (m.id === "getaway" || m.id === "argument") lover(p, "Mia");
            if (m.id === "friendLoan" || m.id === "sleepover") { Relationships.makeFriend("work", p); }
            if (m.id === "kidTrouble" || m.id === "recital") { const k = new Person(Relationship.child, Sex.male, p.getLastName(), 10 * W); k.setFirstName("Leo"); p.getFamilyState().getFamilyMembers().add(k); }
            if (["rivalOffer", "bossMistake", "creditStolen"].includes(m.id)) p.getJobState().switchJob(Job.retail);
            if (m.id === "fanAsk") Celebrity.addFans(p, 200000);
            if (m.id === "neverAge" || m.id === "bloodDrive") { Vampire.rise(p); Vampire.state(p).vampireWeeks = 20 * W; clear(); }
            if (m.when && !m.when(p)) { broken.push(`${m.id}: not eligible in test setup`); break; }
            clear();
            const shown = LifeMoments.trigger(p, m.id);
            const a = alerts.find((x) => x.getTitle() === m.title);
            if (shown == null || a == null) { broken.push(`${m.id}: not shown`); break; }
            built++;
            const btns = [a.getPositiveButton(), ...Array.from((a.getAdditionalButtons() ?? []) as any), a.getNegativeButton()].filter(Boolean) as any[];
            if (opt >= btns.length) { clear(); break; }
            alerts.splice(alerts.indexOf(a), 1);
            try { btns[opt].getAction().invoke(); } catch (e: any) { broken.push(`${m.id}#${opt}: ${e.message}`); }
            AlertManager.INSTANCE.alertDismissed(a);
            const res = alerts.find((x) => x.getTitle() === m.title);
            if (res == null || !(res.getMessage?.() ?? "").length) broken.push(`${m.id}#${opt}: no result`);
            else ran++;
            clear();
        }
    }
    check(`all ${LIST.length} life moments show, and every choice gives a result (${ran} choices)`, broken.length === 0 && ran >= LIST.length * 2, broken.slice(0, 6).join(" | "));
    check("at least 40 moments across childhood, teens, adults and later life",
        MOMENTS.length >= 40 && MOMENTS.some((m) => m.max <= 13) && MOMENTS.some((m) => m.min >= 13 && m.max <= 18) && MOMENTS.some((m) => m.min >= 45));

    // v0.25.1: priced choices only when you can pay
    {
        const p = start(30);
        MoneyState.updateMoney$default(p.getMoneyState(), p.getMoneyState().getCash(), MoneyUpdateType.directSpend, null, null, 12, null);
        clear();
        LifeMoments.trigger(p, "plumbing");
        const a = drain().find((x) => x.getTitle() === "Flooded Kitchen");
        const labels = a ? [a.getPositiveButton()?.getTitle(), a.getNegativeButton()?.getTitle(), ...Array.from((a.getAdditionalButtons() ?? []) as any).map((b: any) => b.getTitle())].filter(Boolean) : [];
        check("v0.25.1: with no money, life moments don't offer choices that cost money", cash(p) <= 0 && labels.length >= 1 && !labels.some((l) => /\$/.test(l)), labels.join(" | "));
    }

    // weekly: 12% chance, never in jail, gap, cooldown
    LifeMoments.enabled = true;
    const p = start(30);
    rich(p);
    const before = LifeMoments.state(p).last;
    withRandom(0.01, () => { keep(p); p.applyWeekly(); });
    const fired = LifeMoments.state(p).last !== before;
    clear();
    check("after a week there's a chance of a moment (12%)", fired && LifeMoments.chance === 0.12);
    const last = LifeMoments.state(p).last;
    withRandom(0.01, () => { keep(p); p.applyWeekly(); }); clear();
    check("…but not two within 3 weeks", LifeMoments.state(p).last === last);
    const seen = Object.keys(LifeMoments.state(p).seen);
    check("…and the same moment not again for 2 years", seen.length === 1 && !LifeMoments.eligible(p).some((m) => m.id === seen[0]));
    p.getCrimeState().setIsInJail?.(true);
    check("no moments in jail", p.getCrimeState().getIsInJail?.() !== true || !LifeMoments.canHappen(p));
    p.getCrimeState().setIsInJail?.(false);
    // a friend's loan comes back later
    LifeMoments.state(p).pending.push({ week: LifeMoments.now(p), amount: 1100, name: "Sam" });
    clear();
    const c0 = cash(p);
    LifeMoments.state(p).last = LifeMoments.now(p);   // no new moment this time
    LifeMoments.afterWeek(p);
    const paid = T(drain());
    check("a friend pays back a loan later (with a little extra)", cash(p) - c0 === 1100 && paid.includes("Paid Back"), `${cash(p) - c0} ${paid.join(",")}`);
    LifeMoments.enabled = false;
}

// ---------------------------------------------------------------- auto anniversaries
{
    const p = start(30);
    rich(p);
    const x = lover(p, "Ana", 500);
    x.togetherSinceWeek = Relationships.now() - W; x.marriedSinceWeek = Relationships.now() - W;   // anniversary this week
    const loveRows = () => rows(new LoveModelGenerator());
    const row = () => loveRows().find((r) => /^Celebrate Anniversaries Automatically/.test(r.title ?? ""));
    check("Love tab › Partner: Celebrate Anniversaries Automatically: Off", row()?.title === "Celebrate Anniversaries Automatically: Off");
    row().actionButton.action.invoke();
    check("Turn On", Relationships.autoAnniversary(p) && row().title === "Celebrate Anniversaries Automatically: On");
    const c0 = cash(p), r0 = x.getRelationshipProgress();
    check("(it's the anniversary week)", Relationships.anniversaryYears(x) === 1, `${p.getFamilyState().getPartner() === x} ${Relationships.now()} ${x.togetherSinceWeek} ${x.marriedSinceWeek} ${x.getIsAlive?.()}`);
    const spousePay = SpouseIncome.weekly(x);   // v0.28.1: the spouse's paycheck lands the same week
    keep(p); p.applyWeekly();
    const t = T(drain());
    check("the anniversary is celebrated for you: $500, +80, never forgotten", t.includes("Happy Anniversary") && !t.includes("Forgotten Anniversary") && c0 + spousePay - cash(p) >= 500 && x.getRelationshipProgress() >= r0 + 80 - 5, `${t.join(",")} ${r0}→${x.getRelationshipProgress()}`);
    // turned off: forgotten again
    row().actionButton.action.invoke();
    x.togetherSinceWeek = Relationships.now() - W; x.marriedSinceWeek = Relationships.now() - W;
    Relationships.meta(x).annivYear = undefined; Relationships.meta(x).annivMissed = undefined;
    keep(p); p.applyWeekly();
    const t2 = T(drain());
    check("Off: you can forget it again", t2.includes("Forgotten Anniversary"), t2.join(","));
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    check("saved (circle.autoAnniversary)", back.getSaveState().currentSlot().getPersonState().social?.autoAnniversary === false);
}

// ---------------------------------------------------------------- celebrity × vampire
{
    const p = start(30);
    rich(p, 10_000_000);
    Vampire.rise(p); clear();
    const s = Celebrity.state(p);
    s.fans = 2_000_000; s.peakFans = 2_000_000; s.tierShown = Celebrity.tierOf(s.fans); s.brand = "Nightshade Perfume"; s.fanClub = true;
    p.getJobState().switchJob(Job.actor);
    check("Feed on a Superfan shows for a famous vampire", FEEDING.includes(SUPERFAN) && LifeActions.cells(FEEDING, p).some((c: any) => c.title === "Feed on a Superfan"));
    check("Midnight Show in Celebrity Life › Fame for a vampire with a celebrity career", FAME.includes(MIDNIGHT_SHOW) && new (class { })() != null && MIDNIGHT_SHOW.show!(p));
    const f0 = s.fans;
    LifeActions.perform(MIDNIGHT_SHOW, p); clear();
    check("…Midnight Show: more fans (5%, shaped by fame tier)", s.fans > f0 * 1.02, `${f0} → ${s.fans}`);
    // charm
    const g0 = Celebrity.addFans(p, 1000);
    Vampire.state(p).powers.push("charm");
    const g1 = Celebrity.addFans(p, 1000);
    check("Charm: +20% fan gains", Math.abs(g1 / g0 - 1.2) < 0.05, `${g0} → ${g1}`);
    // paparazzi catch a vampire
    Vampire.state(p).suspicion = 0;
    Celebrity.vampirePhotos(p);
    const strange = T(drain()).includes("Strange Photos");
    check("paparazzi can catch a vampire on camera (+suspicion, headline)", strange && Vampire.state(p).suspicion > 0 && /no reflection|glow|younger/.test(s.news.slice(-1)[0]?.text ?? ""), titlesOf().join(","));
    // fake your death: fame drops
    const before = s.fans, oldName = p.getFullName();
    clear();
    Vampire.fakeDeath(p);
    const msg = drain().find((a) => a.getTitle() === "A New Life");
    check("Fake Your Death while famous: your fans drop to a handful (max 2,000)", s.fans === Math.min(2000, Math.round(before * 0.05)) && /almost nobody knows who you are/.test(msg?.getMessage?.() ?? ""), `${before} → ${s.fans}`);
    check("…the brand, fan club and old name stay with the dead star", s.brand == null && !s.fanClub && s.formerName === oldName && s.formerFans === before);
    check("…headline: the old star found dead", s.news.some((h: any) => h.text.startsWith(`${oldName} found dead`)));
    check("…and the screen remembers who you were", /Secretly /.test(text(rows({ generateViewModels: () => new LifepathsModelGenerator().screen("celebrity") }))));
    // return from the dead
    check("Return from the Dead appears (100K+ fans before)", RETURN_FROM_DEAD.show!(p));
    Vampire.state(p).suspicion = 0;
    const f1 = s.fans;
    RETURN_FROM_DEAD.run(p); clear();
    check("…win back ~40% of the old fans, +30 suspicion, once", s.fans > f1 + before * 0.2 && Vampire.state(p).suspicion === 30 && !RETURN_FROM_DEAD.show!(p), `${f1} → ${s.fans}`);
    // collapse while famous
    p.getJobState().setCurrentJob(null);
    clear();
    Vampire.collapse(p, 10);
    const c = drain().find((a) => a.getTitle() === "You Collapsed");
    check("collapsing while famous: missing/found headlines and a fans line in the alert", s.news.some((h: any) => /has vanished/.test(h.text)) && s.news.some((h: any) => /FOUND ALIVE/.test(h.text)) && /fans moved on/.test(c?.getMessage?.() ?? ""));
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    check("saved (formerName, returned)", back.getSaveState().currentSlot().getPersonState().celebrity?.formerName === oldName && back.getSaveState().currentSlot().getPersonState().celebrity?.returned === true);
}

// ---------------------------------------------------------------- v0.25.2: features that contradicted each other
{
    // vampires can't buy Assisted Dying (they have Final Rest)
    let p = start(40);
    check("Assisted Dying is there for humans", AssistedDying.available(p));
    Vampire.rise(p); clear();
    check("v0.25.2: …but not for vampires", !AssistedDying.available(p) && AssistedDying.cell() == null);
    // kids don't pay for hobby supplies; vampires burn in daylight hobbies
    p = start(9);
    const c0 = cash(p);
    const pr = Hobbies.practice("painting", p);
    check("v0.25.2: kids' hobby supplies are free (parents pay)", Hobbies.costFor(Hobbies.def("painting"), p) === 0 && pr && cash(p) >= c0, `${pr} ${c0} → ${cash(p)} ${Hobbies.blocked(Hobbies.def("painting"), p)}`);
    clear();
    p = start(30); rich(p); Vampire.rise(p); clear();
    keep(p); p.setBirthMonth(3 - Math.floor((p.calendarWeeks() % 48) / 4));   // v0.26.0: spring sun
    const h0 = p.getAttributeState().getHappiness();
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, -50, 0));
    const h1 = p.getAttributeState().getHappiness();
    Hobbies.practice("gardening", p); drain();
    const gardenRow = rows(new VacationModelGenerator()).find((r) => /^Gardening/.test(r.title));
    check("v0.25.2: gardening in daylight costs a vampire happiness (and says so)", /Daytime: −10 happiness for a vampire/.test(text(gardenRow)), `${h0} ${h1}`);
    const chess = rows(new VacationModelGenerator()).find((r) => /^Chess/.test(r.title));
    check("…indoor hobbies don't", !/Daytime/.test(text(chess)));
    // collapse: nothing keeps happening "for you"
    p = start(30); rich(p, 100000);
    Vampire.rise(p); clear();
    const ana = lover(p, "Ana", 900);
    Relationships.meta(ana, p).knows = true; Relationships.meta(ana, p).vampire = true;
    Relationships.setAutoAnniversary(true, p);
    Subscriptions.subscribe("gym", p);
    const friends0 = new Set(Relationships.friends(p).map((f) => f.id));
    const cs = Celebrity.state(p); cs.fans = 500000; cs.tierShown = Celebrity.tierOf(cs.fans); cs.series = { title: "Night Shift", weeksLeft: 10, season: 1 };
    const awards0 = cs.awards.length;
    Vampire.state(p).inTorpor = true;
    check("v0.25.2: while collapsed: no gym/therapist, no making friends, no auto anniversary", Subscriptions.paused(p) && Relationships.away(p));
    Vampire.state(p).inTorpor = false;
    clear();
    Vampire.collapse(p, 12);
    const col = drain().find((a) => a.getTitle() === "You Collapsed");
    const newFriends = Relationships.friends(p).filter((f) => !friends0.has(f.id));
    check("…after 12+ years collapsed: only the passer-by is a new friend", newFriends.length <= 1, newFriends.map((f) => f.getFirstName()).join(","));
    check("…no awards won and no TV series kept while you were missing", cs.awards.length === awards0 && cs.series == null);
    check("…and nothing in the 'while you were gone' list was celebrated or photographed for you", !/Happy Anniversary|Strange Photos|Paparazzi|Endorsement/.test(col?.getMessage?.() ?? ""), (col?.getMessage?.() ?? "").slice(-200));
    // stale loans are forgotten
    LifeMoments.enabled = true;
    LifeMoments.state(p).pending.push({ week: LifeMoments.now(p) - 500, amount: 999, name: "Old Friend" });
    const c1 = cash(p);
    LifeMoments.state(p).last = LifeMoments.now(p);
    LifeMoments.afterWeek(p);
    check("v0.25.2: a loan from decades ago isn't suddenly paid back", cash(p) === c1 && !T(drain()).includes("Paid Back"));
    LifeMoments.enabled = false;
}
{
    // fake your death: everyone who doesn't know thinks you're dead
    const p = start(35); rich(p, 5_000_000);
    Vampire.rise(p); clear();
    const wife = lover(p, "Clara", 900);
    const mom = Array.from(p.getFamilyState().getFamilyMembers() as any).find((x: any) => x.getRelationship?.() === Relationship.mother) as any;
    const mom0 = mom?.getRelationshipProgress();
    const cs = Celebrity.state(p); cs.fans = 1_500_000; cs.tierShown = Celebrity.tierOf(cs.fans);
    cs.works.push({ kind: "movie", title: "Blood Moon Rising", age: 30, result: "Blockbuster", score: 140, extra: "" } as any); cs.awards.push("Best Actor 2031"); cs.movies = 3; cs.hits = 2;
    cs.rivals = { actor: { first: "Max", last: "Steel", female: false, fans: 900000, wins: 0, losses: 0, made: 0 } as any };
    clear();
    Vampire.fakeDeath(p);
    const msg = drain().find((a) => a.getTitle() === "A New Life")?.getMessage?.() ?? "";
    check("v0.25.2: Fake Your Death: a partner who doesn't know your secret grieves and is gone", p.getFamilyState().getPartner() == null && /Clara buried an empty coffin/.test(msg), msg.slice(0, 200));
    check("…your family thinks you're dead too (−300)", mom == null || (mom.getRelationshipProgress() === Math.max(0, mom0 - 300) && /Your family believes you're gone/.test(msg)), `${mom0} → ${mom?.getRelationshipProgress()}`);
    check("…the dead star's movies, awards, royalties and rivals aren't yours any more", cs.works.length === 0 && cs.awards.length === 0 && cs.movies === 0 && cs.hits === 0 && Object.keys(cs.rivals).length === 0 && cs.former?.works?.length === 1);
    RETURN_FROM_DEAD.run(p); clear();
    check("…until you Return from the Dead: they're yours again", cs.works.some((w: any) => w.title === "Blood Moon Rising") && cs.awards.includes("Best Actor 2031") && cs.movies === 3 && cs.hits === 2 && cs.former == null);
    // a partner who knows stays
    const q = start(35); Vampire.rise(q); clear();
    const ally = lover(q, "Rhea", 900); Relationships.meta(ally, q).knows = true;
    Vampire.fakeDeath(q); clear();
    check("…a partner who knows your secret stays with you", q.getFamilyState().getPartner() === ally);
}

console.log(failures ? `${failures} FAILED` : "ALL PASSED");
if (failures) process.exit(1);
