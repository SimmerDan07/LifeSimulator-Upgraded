// Every button (v0.29.3 full bug check): for each starting life, press EVERY button on EVERY screen once — the 9 tabs,
// every lifepath screen (all activity groups, world regions, career categories, languages, legacy, medical history,
// crime, vampire, celebrity, news) and every list screen those buttons open (one level deeper) — each from a fresh copy
// of the same save. Pop-ups are answered with the first option, then (in a second pass) with the last one.
// After each press: no exception, invariants hold, no broken text, and the save still round-trips.
// Usage: node dist-test/everybutton.mjs [scenario filter regex]
import { Illness } from "../src/game/Health/Illness";
import { Legacy } from "../src/game/Legacy/Legacy";
import { Lineage } from "../src/game/Managers/Lineage";
import { Crime } from "../src/game/Crime/Crime";
import { Country } from "../src/game/Enums/Country";
import { Possession } from "../src/game/Enums/Possession";
import { SocialModelGenerator } from "../src/game/Controllers/SocialModelGenerator";
import { SocialMedia, POSTS_PER_WEEK } from "../src/game/Social/SocialMedia";
import { Careers } from "../src/game/Careers/Careers";
import { CAREER_CATEGORIES } from "../src/game/Careers/CareerData";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { EducationModelGenerator } from "../src/game/Controllers/EducationModelGenerator";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { HealthModelGenerator } from "../src/game/Controllers/HealthModelGenerator";
import { BankModelGenerator } from "../src/game/Controllers/BankModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { ButtonViewModel } from "../src/game/Models/ButtonViewModel";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { SpannableStringBuilder, BigInteger } from "../src/game/runtime";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Celebrity } from "../src/game/Lifepaths/Celebrity";
import { Hobbies } from "../src/game/Managers/Hobbies";
import { Relationships } from "../src/game/Social/Relationships";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { LoverPersonality } from "../src/game/Enums/LoverPersonality";
import { Sex } from "../src/game/Enums/Sex";
import { Job } from "../src/game/Enums/Job";
import { Youth } from "../src/game/Youth/Youth";
import { Reborn } from "../src/game/Vampires/Reborn";
import { Night } from "../src/game/Vampires/Night";
import { Bank } from "../src/game/Remaster/Bank";
import { Things } from "../src/game/Remaster/Things";
import { Body } from "../src/game/Remaster/Body";
import { THING_CATS } from "../src/game/Remaster/ThingsData";
import { LOAN_OFFERS } from "../src/game/Remaster/BankData";


let seed = 777;
const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
Math.random = rng;
const files = new Map<string, string>();
const queue: any[] = [];
let navs: { type: GenericListType; key: string }[] = [];
UIBridge.install({
    broadcast() {}, reloadGenericList() {},
    navigateTo(type, key) { navs.push({ type, key }); },
    backToMainGame() { navs = []; },
    showAlert(vm) { queue.push(vm); },
    readFile: (n) => files.get(n) ?? null, writeFile: (n, t) => { files.set(n, t); },
});
class FakeMain extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
const gens: Record<string, any> = {
    Profile: new ProfileModelGenerator(), Leisure: new VacationModelGenerator(), Love: new LoveModelGenerator(),
    Education: new EducationModelGenerator(), Work: new WorkModelGenerator(), Health: new HealthModelGenerator(),
    Bank: new BankModelGenerator(), Lifepaths: new LifepathsModelGenerator(), Social: new SocialModelGenerator(),
};
const lp = new LifepathsModelGenerator();
const lastAlerts: string[] = [];
const ends: Record<string, string[]> = {};
const problems = new Map<string, { n: number; where: string }>();
const report = (kind: string, msg: string, where: string) => { const k = `${kind}: ${msg}`; const x = problems.get(k); if (x) x.n++; else problems.set(k, { n: 1, where }); };

function actions(vm: any, out: { label: string; fn: () => void }[], seen = new Set<any>(), depth = 0) {
    if (!vm || typeof vm !== "object" || seen.has(vm) || depth > 7) return;
    seen.add(vm);
    if (vm instanceof ButtonViewModel) {
        if (vm.getEnabled() && !vm.getHidden() && !vm.getShowLock()) out.push({ label: vm.getTitle(), fn: () => vm.component8().invoke() });
        return;
    }
    if (vm instanceof SpannableStringBuilder) return;
    for (const k of Object.keys(vm)) {
        const v = vm[k];
        if (v && typeof v === "object" && typeof v.invoke === "function" && /click|tap|action|select/i.test(k)) out.push({ label: (vm.title ?? vm.constructor?.name) + "." + k, fn: () => v.invoke() });
        else if (Array.isArray(v)) for (const x of v) actions(x, out, seen, depth + 1);
        else if (v && typeof v === "object") actions(v, out, seen, depth + 1);
    }
}
/** Strings shown on screen that look broken. */
function badText(vm: any, where: string, seen = new Set<any>(), depth = 0) {
    if (vm == null || depth > 8) return;
    if (typeof vm === "string") {
        if (/\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b(?! ?:)|Infinity/.test(vm) && !/^https?:|null cannot/.test(vm)) report("TEXT", vm.slice(0, 120), where);
        return;
    }
    if (typeof vm !== "object" || seen.has(vm)) return;
    seen.add(vm);
    if (vm instanceof SpannableStringBuilder) { badText(vm.toString(), where, seen, depth + 1); return; }
    for (const k of Object.keys(vm)) if (k !== "parent" && typeof vm[k] !== "function") badText(vm[k], where, seen, depth + 1);
}
function handleAlerts() {
    for (let g = 0; g < 60 && queue.length; g++) {
        const vm = queue.shift();
        lastAlerts.push(`${vm.getTitle?.()}: ${(vm.getMessage?.() ?? vm.getAttributedMessage?.()?.toString?.() ?? "").slice(0, 90)}`); if (lastAlerts.length > 6) lastAlerts.shift();
        badText(vm.getTitle?.(), "alert"); badText(vm.getMessage?.(), "alert:" + vm.getTitle?.());
        if (vm.getAttributedMessage?.()) badText(vm.getAttributedMessage(), "alert:" + vm.getTitle?.());
        const btns = [vm.getPositiveButton(), vm.getNegativeButton(), ...(vm.getAdditionalButtons() ?? [])].filter(Boolean);
        const tf = vm.getEditableTextFieldViewModel?.();
        if (tf) try { tf.getOnTextChanged?.()?.invoke?.("Testname"); } catch { /* ignore */ }
        // don't end lives on purpose (Assisted Dying, Final Rest): say no
        const ender = /^(Assisted Dying|Final Rest)$/.test(vm.getTitle?.() ?? "");
        try { if (btns.length) (ender ? (vm.getNegativeButton() ?? btns[btns.length - 1]) : (answerLast ? btns[btns.length - 1] : btns[0])).getAction().invoke(); }
        catch (e: any) { report("ERROR", (e?.message ?? String(e)), "alert " + vm.getTitle?.() + " | " + (e?.stack?.split("\n").slice(1, 3).join(" <- ") ?? "")); }
        AlertManager.INSTANCE.alertDismissed(vm);
    }
}

let answerLast = false;
function allScreens(): { name: string; models: any }[] {
    const out: { name: string; models: any }[] = [];
    for (const [name, g] of Object.entries(gens)) out.push({ name, models: g.generateViewModels() });
    const keys = ["youth-activities", "youth-yearbook", "work-apps", "work-resume", "work-certs", "work-hustles", "work-start-company", "work-retirement", "vampire", "vampire-powers", "vampire-masquerade", "vampire-court", "vampire-lair", "vampire-bloodline", "celebrity", "celebrity-news", "celebrity-works", "celebrity-milestones", "crime", "crime-murder", "news", "health-history", "legacy", "languages",
        ...["outdoors", "sports", "culture", "nightlife", "wellness", "fun", "food", "giving", "local"].map((a) => "activities:" + a),
        "rm-market", "rm-loans", "rm-goals", "rm-kids", "rm-worth", "rm-things", "rm-store", "rm-trips", "rm-feats", ...THING_CATS.map((c) => "rm-store:" + c.id),
        ...["americas", "europe", "asia", "africa"].map((r) => "world:" + r),
        ...CAREER_CATEGORIES.map((c) => "careers:" + c.id)];
    for (const k of keys) { try { out.push({ name: k, models: lp.screen(k) }); } catch (e: any) { report("ERROR", "screen " + k + ": " + (e?.message ?? e), k); } }
    return out;
}
function listScreen(n: { type: any; key: string }) { return GenericListModelGenerator.INSTANCE.genericListViewModels(n.type, n.key, true); }
const num = (b: any) => Number(b?.toString?.() ?? NaN);
function invariants(where: string) {
    const p: any = GameStateManager.INSTANCE.getPersonState();
    const a = p.getAttributeState();
    for (const [n, v] of [["health", a.getHealth()], ["happiness", a.getHappiness()], ["sanity", a.getSanity()]] as [string, number][])
        if (!Number.isFinite(v) || v < 0 || v > 100) report("ATTR", `${n}=${v}`, where);
    const c = num(p.getMoneyState().getCash()), s = num(p.getMoneyState().getSavings());
    if (!Number.isFinite(c) || !Number.isFinite(s)) report("MONEY", `cash=${c} savings=${s}`, where);
    const people = [...(Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]), ...Relationships.circle(p).list()];
    for (const x of people) {
        const r = x.getRelationshipProgress();
        if (!Number.isFinite(r) || r < 0 || r > 1000) report("REL", `${x.getTitle?.() ?? x.kind} ${x.getFirstName?.()} = ${r}`, where);
        const ag = x.getAgeInWeeks?.();
        // a baby on the way has a negative age (weeks until birth); anything else below zero is wrong
        if (ag != null && (!Number.isFinite(ag) || ag < -48 || (ag < 0 && !x.getNotYetBorn?.()))) report("AGE", `${x.getFirstName?.()} ageWeeks=${ag}`, where);
    }
    const cs = Celebrity.peek(p);
    if (cs) {
        if (!Number.isFinite(cs.fans) || cs.fans < 0) report("FAME", `fans=${cs.fans}`, where);
        if (!Number.isFinite(cs.reputation) || cs.reputation < 0 || cs.reputation > 100) report("FAME", `rep=${cs.reputation}`, where);
        for (const k of ["acting", "music", "dance"]) if (!Number.isFinite(cs[k] ?? 0) || (cs[k] ?? 0) < 0 || (cs[k] ?? 0) > 100) report("FAME", `${k}=${cs[k]}`, where);
    }
    const vs = Vampire.peek(p);
    if (vs?.isVampire) {
        if (!Number.isFinite(vs.thirst) || vs.thirst < 0 || vs.thirst > 100) report("VAMP", `thirst=${vs.thirst}`, where);
        if (!Number.isFinite(vs.suspicion) || vs.suspicion < 0 || vs.suspicion > 100) report("VAMP", `suspicion=${vs.suspicion}`, where);
        if (vs.bloodPower < 0) report("VAMP", `bloodPower=${vs.bloodPower}`, where);
        if (vs.inTorpor || AlertManager.muted != null || MoneyState.frozen) report("VAMP", "collapse flags left on", where);
    }
    for (const [id, h] of Object.entries(p.hobbies ?? {}) as [string, any][]) if (!Number.isFinite(h.skill) || h.skill < 0 || h.skill > 100) report("HOBBY", `${id}=${h.skill}`, where);
    if (Relationships.together != null) report("STATE", "Relationships.together left set", where);
    const cr = Crime.peek(p);
    if (cr) {
        if (!Number.isFinite(cr.heat) || cr.heat < 0 || cr.heat > 100) report("CRIME", `heat=${cr.heat}`, where);
        const jailed = p.getCrimeState().getIsInJail();
        if (jailed !== (cr.jail != null)) report("CRIME", `isInJail=${jailed} but jail=${JSON.stringify(cr.jail)}`, where);
        if (jailed && p.getHousingState().currentHousing().getType().name() !== "jail") report("CRIME", "in jail but not living in jail", where);
        if (!jailed && p.getHousingState().currentHousing().getType().name() === "jail") report("CRIME", "living in jail but free", where);
        if (cr.jail && (cr.jail.weeks < 0 || !Number.isFinite(cr.jail.weeks))) report("CRIME", `jail weeks ${cr.jail.weeks}`, where);
        if (jailed && p.getJobState().getCurrentJob() != null && (cr.jail?.total ?? 0) >= 4) report("CRIME", "kept a job through a long sentence", where);
        if (cr.org && (cr.org.rank < 0 || cr.org.rank > 4)) report("CRIME", `rank ${cr.org.rank}`, where);
    }
    if (p.getCountry() == null) report("WORLD", "no country", where);
    // v0.28.0 illnesses and legacy
    const il = Illness.peek(p);
    if (il) {
        if (Vampire.isVampire(p) && il.list.length) report("ILLNESS", `vampire with ${il.list.map((x) => x.id).join(",")}`, where);
        for (const x of il.list) {
            const d = Illness.def(x.id);
            if (!d) { report("ILLNESS", `unknown ${x.id}`, where); continue; }
            if (d.stages && ((x.stage ?? 1) < 1 || (x.stage ?? 1) > d.stages)) report("ILLNESS", `${x.id} stage ${x.stage}`, where);
            if (x.course && x.course.left < 0) report("ILLNESS", `${x.id} course ${x.course.left}`, where);
            if (il.list.filter((y) => y.id === x.id).length > 1) report("ILLNESS", `${x.id} twice`, where);
        }
    }
    const lg = Legacy.peek(p);
    if (lg) {
        if (new Set(lg.heirlooms.map((h) => h.id)).size !== lg.heirlooms.length) report("LEGACY", "duplicate heirloom", where);
        if (!["heir", "equal", "partner"].includes(lg.will.mode)) report("LEGACY", `will mode ${lg.will.mode}`, where);
    }
    for (const par of Array.from(p.getFamilyState().getParents() as any) as any[]) {
        if (!par.formerLifeId) continue;
        const rec: any = Lineage.find(par.formerLifeId);
        if (!rec) report("LEGACY", "retired parent without a life record", where);
        else if (rec.alive !== par.getIsAlive()) report("LEGACY", `record alive=${rec.alive} but parent alive=${par.getIsAlive()}`, where);
        if (typeof par.wealth === "number" && (!Number.isFinite(par.wealth) || par.wealth < 0)) report("LEGACY", `parent wealth ${par.wealth}`, where);
    }
    const sm = SocialMedia.peek(p);
    if (sm) {
        for (const [k, v] of Object.entries(sm.f ?? {}) as [string, number][]) if (!Number.isFinite(v) || v < 0) report("SOCIAL", `${k}=${v}`, where);
        if (sm.posts > POSTS_PER_WEEK) report("SOCIAL", `posts=${sm.posts}`, where);
        if (sm.bought < 0) report("SOCIAL", `bought=${sm.bought}`, where);
    }
    const job = p.getJobState().getCurrentJob();
    if (job != null && Careers.applyBlock(job, p) != null && !/up to age/.test(Careers.applyBlock(job, p)!) && !/health/.test(Careers.applyBlock(job, p)!)) report("CAREER", `working as ${job.name()} but: ${Careers.applyBlock(job, p)}`, where);
    const lvl = p.getJobState().getCurrentJobState?.()?.getLevel?.();
    if (job != null && (lvl < 1 || lvl > job.getMaxLevels())) report("CAREER", `${job.name()} level ${lvl}`, where);
}

// ---------------------------------------------------------------- scenarios
const W = 48;
const rich = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const lover = (p: any, first: string) => {
    const x = new Person(Relationship.lover, Sex.female, "Vale", 30 * W); x.setFirstName(first); x.setLoverPersonality(LoverPersonality.cheerful);
    x.setRelationshipProgress(800); p.getFamilyState().date(x); p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married); return x;
};
const SCENARIOS: Record<string, () => void> = {
    child: () => start(6, () => {}),
    teen: () => start(15, (p) => { rich(p, 2000); }),
    family: () => start(32, (p) => { rich(p, 300000); lover(p, "Mia"); const k = new Person(Relationship.child, Sex.male, p.getLastName(), 8 * W); k.setFirstName("Leo"); p.getFamilyState().getFamilyMembers().add(k); Relationships.makeFriend("work", p); }),
    old: () => start(74, (p) => { rich(p, 80000); }),
    broke: () => start(22, () => {}),
    vampire: () => start(30, (p) => { rich(p, 500000); Vampire.rise(p); const s = Vampire.state(p); s.bloodPower = 8; s.thirst = 50; const x = lover(p, "Ana"); Relationships.meta(x).knows = true; }),
    thirsty: () => start(30, (p) => { rich(p, 50000); Vampire.rise(p); Vampire.state(p).thirst = 99.5; }),
    celebrity: () => start(24, (p) => { rich(p, 2_000_000); p.getJobState().switchJob(Job.music); const s = Celebrity.state(p); s.fans = 600_000; s.music = 60; }),
    vampstar: () => start(34, (p) => { rich(p, 5_000_000); Vampire.rise(p); p.getJobState().switchJob(Job.actor); const s = Celebrity.state(p); s.fans = 3_000_000; s.acting = 70; Vampire.state(p).bloodPower = 10; }),
    // v0.27.0
    foreigner: () => start(24, (p) => { rich(p, 300000); p.setCountry((Country as any).brazil); p.nativeLanguage = "portuguese"; p.getCompletableActionState().completeAction((CompletableAction as any).portuguese); p.getCompletableActionState().completeAction((CompletableAction as any).german); p.buyItem(Possession.passport); }),
    criminal: () => start(22, (p) => { rich(p, 50000); Crime.state(p).respect = 60; Crime.joinGang(p); Crime.orgPoints(p, 150); }),
    don: () => start(40, (p) => { rich(p, 20000000); const s = Crime.state(p); s.respect = 200; s.org = { kind: "mafia", name: "The Fuzz Family", rank: 4, points: 700, own: true, members: 0, turf: 0, fronts: ["pizzeria"], since: 0 }; s.heat = 50; }),
    inmate: () => start(30, (p) => { rich(p, 20000); Crime.sendToJail(p, 300, "Robbery", true, false); }),
    teenKorea: () => start(13, (p) => { p.setCountry((Country as any).southKorea); }),
    worker: () => start(23, (p) => { rich(p, 60000); for (const n of ["highSchool", "college_biology", "nursing", "emtTraining", "electricalTrade", "cdl", "fireAcademy", "culinarySchool", "gameDesign"]) p.getCompletableActionState().completeAction((CompletableAction as any)[n]); }),
    influencer: () => start(19, (p) => { rich(p, 20000); SocialMedia.createAccount(p); SocialMedia.addFollowers(p, 40000, "cliptok"); p.getJobState().switchJob((Job as any).contentCreator); }),
    vampcreator: () => start(26, (p) => { rich(p, 200000); Vampire.rise(p); Vampire.state(p).bloodPower = 20; SocialMedia.createAccount(p); SocialMedia.addFollowers(p, 15000, "snapgram"); }),
    // v0.35.0 Vampires Reborn
    elder: () => start(40, (p) => { rich(p, 5_000_000); Vampire.rise(p); const s = Vampire.state(p); s.bloodPower = 30; s.suspicion = 60; s.powers = ["mistStep", "shadowStep", "charm", "glamour", "hypnoticGaze", "sunWard"]; const r = Reborn.st(p); r.bloodAgeWeeks = 320 * W; r.standing = 65; r.owed = 2; r.hunt = 70; r.lair = ["blackout", "crypt"]; r.vault = 50000; Night.gatherHerd(p); }),
    hunted: () => start(28, (p) => { rich(p, 100000); Vampire.rise(p); const r = Reborn.st(p); r.hunt = 88; r.humanity = 2; Vampire.state(p).suspicion = 96; Vampire.state(p).thirst = 85; }),
    seeker: () => start(25, (p) => { rich(p, 100000); Vampire.state(p).discovered = true; Reborn.st(p).way = "seeking"; }),
    // v0.36.0 The Remaster
    tycoon: () => start(36, (p) => { rich(p, 2_000_000); lover(p, "Iris"); const k = new Person(Relationship.child, Sex.male, p.getLastName(), 6 * W); k.setFirstName("Max"); p.getFamilyState().getFamilyMembers().add(k);
        Bank.buy(p, "index", 50_000); Bank.buy(p, "crypto", 5_000); Bank.addGoal(p, "house"); Bank.fundFor(p, k, 2_000); Bank.take(p, LOAN_OFFERS.find((o) => o.id === "p5")!);
        Things.buy(p, "compact", true); Things.buy(p, "espresso"); Things.buy(p, "painting"); Body.setRoutine(p, "running"); Body.startSmoking(p); }),
    // v0.28.0
    patriarch: () => start(66, (p) => { rich(p, 3_000_000); lover(p, "Rose"); for (const [n, a] of [["Ava", 38], ["Ben", 35], ["Cal", 16]] as [string, number][]) { const k = new Person(Relationship.child, Sex.female, p.getLastName(), a * W); k.setFirstName(n); k.setRelationshipProgress(700); p.getFamilyState().getFamilyMembers().add(k); } Legacy.addHeirloom(p, "pocketWatch", "Grandpa"); Legacy.writeWill(p, "equal", 10); }),
    sickly: () => start(68, (p) => { rich(p, 400000); Illness.catch(p, "heartDisease", "fuzz"); const c = Illness.catch(p, "cancer", "fuzz")!; c.stage = 2; c.detected = true; Illness.catch(p, "flu", "fuzz"); }),
    // v0.32.0 Childhood & Teen Years
    kid: () => start(9, (p) => { Youth.join("soccer", p); Youth.join("piano", p); Youth.state(p).acts.soccer.xp = 30; Relationships.makeFriend("school", p); }),
    childstar: () => start(10, (p) => { Youth.join("drama", p); Youth.state(p).acts.drama.xp = 50; Youth.state(p).star = { gigs: 3, trust: 5000, agent: false, burnout: 75, tv: 0, lastGig: 0 }; }),
    senior: () => start(17, (p) => { rich(p, 3000); const y = Youth.state(p); y.phone = true; y.permit = true; y.grades = 91; y.rep = 60; y.crowd = "popular"; Youth.join("debate", p); y.acts.debate.xp = 75; Youth.takeJob("retail", p); y.grounded = 2; }),
    hobbyist: () => start(40, (p) => { rich(p, 100000); for (const id of ["painting", "running", "writing"]) Hobbies.state(id, p).skill = 85; }),
};
function start(age: number, tweak: (p: any) => void) {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.initializeAge(age, true);
    GameStateManager.INSTANCE.startNewGame(np);
    handleAlerts();
    const p: any = GameStateManager.INSTANCE.getPersonState();
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
    tweak(p);
    handleAlerts();
    navs = [];
}


GameStateManager.INSTANCE.init();
GameStateManager.INSTANCE.setMainGameFragment(new FakeMain());
const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
const SKIP = /Assisted Dying|Final Rest|Restart|New Game|Delete|Suicide/i;
let presses = 0, lists = 0;
const ok = new Set<string>();
const restore = (save: string) => { GameStateManager.INSTANCE.setGlobalStateManager(SaveCodec.decode(save)); navs = []; queue.length = 0; AlertManager.muted = null; MoneyState.frozen = false; Relationships.together = null; try { AlertManager.INSTANCE.setCurrentlyShowing(false); } catch { /* ignore */ } };
function press(where: string, fn: () => void) {
    const t0 = Date.now();
    try {
        fn(); handleAlerts();
        const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
        if (gsm.getSaveState().getHasGameStarted()) {
            invariants(where);
            for (const s of [...Object.entries(gens)].map(([n, g]) => ({ n, m: (g as any).generateViewModels() }))) badText(s.m, where + " -> " + s.n);
            const a1 = SaveCodec.encode(gsm); if (SaveCodec.encode(SaveCodec.decode(a1)) !== a1) report("SAVE", "round trip changed the save", where);
        }
        presses++;
        const ms = Date.now() - t0;
        if (process.env.VERBOSE || ms > 3000) console.log(`  ${ms} ms  ${where}`);
    } catch (e: any) {
        report("ERROR", e?.message ?? String(e), where + " | " + (e?.stack?.split("\n").slice(1, 4).join(" <- ") ?? ""));
    }
}
for (const [name, setup] of Object.entries(SCENARIOS)) {
    if (filter && !filter.test(name)) continue;
    setup();
    const save = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
    for (const last of [false, true]) {
        answerLast = last;
        restore(save);
        // the list of every button on every screen, from this save
        const targets: { screen: string; label: string; idx: number }[] = [];
        for (const s of allScreens()) { badText(s.models, name + ":" + s.name); const acts: any[] = []; actions(s.models, acts); acts.forEach((a, i) => { if (!SKIP.test(a.label)) targets.push({ screen: s.name, label: a.label, idx: i }); }); }
        const opened = new Map<string, { type: any; key: string; via: { screen: string; idx: number } }>();
        for (const t of targets) {
            restore(save);
            const s = allScreens().find((x) => x.name === t.screen)!;
            const acts: any[] = []; actions(s.models, acts);
            const a = acts[t.idx]?.label === t.label ? acts[t.idx] : acts.find((x: any) => x.label === t.label);
            if (!a) continue;
            const where = `${name}${last ? "(last)" : ""}: ${t.screen} / ${t.label}`;
            press(where, () => a.fn());
            ok.add(t.screen + " / " + t.label);
            for (const n of navs) { const k = n.type.name() + ":" + n.key; if (!opened.has(k)) opened.set(k, { ...n, via: t }); }
        }
        // one level deeper: every button on every list screen those buttons opened
        for (const [k, n] of opened) {
            restore(save);
            const s = allScreens().find((x) => x.name === n.via.screen)!; const acts: any[] = []; actions(s.models, acts);
            try { acts[n.via.idx]?.fn(); handleAlerts(); } catch { continue; }
            let models: any; try { models = listScreen(n); } catch (e: any) { report("ERROR", "list " + k + ": " + (e?.message ?? e), name); continue; }
            lists++;
            badText(models, name + ":list " + k);
            const inner: any[] = []; actions(models, inner);
            const save2 = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
            inner.forEach((ia: any, j: number) => {
                if (SKIP.test(ia.label)) return;
                restore(save2);
                const m2 = listScreen(n); const in2: any[] = []; actions(m2, in2);
                const b = in2[j]?.label === ia.label ? in2[j] : in2.find((x: any) => x.label === ia.label);
                if (!b) return;
                press(`${name}${last ? "(last)" : ""}: list ${k} / ${ia.label}`, () => b.fn());
                ok.add("list " + n.type.name() + " / " + ia.label);
            });
        }
    }
    console.log(`${name}: done (${presses} presses so far, ${lists} list screens)`);
}
console.log(`presses: ${presses}, distinct buttons: ${ok.size}, list screens: ${lists}`);
console.log(`problems: ${problems.size}`);
for (const [k, v] of [...problems.entries()].sort((a, b) => b[1].n - a[1].n)) console.log(`  x${v.n}  ${k}\n        @ ${v.where.slice(0, 300)}`);
process.exit(problems.size ? 1 : 0);
