// v0.26.0 "The Career Update": 40 careers, 37 degrees and trainings, seasons, social media and 8 more vampire powers.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { EducationModelGenerator } from "../src/game/Controllers/EducationModelGenerator";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { SocialModelGenerator } from "../src/game/Controllers/SocialModelGenerator";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { Job } from "../src/game/Enums/Job";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { Leisure } from "../src/game/Enums/Leisure";
import { CAREERS, DEGREES, CAREER_CATEGORIES } from "../src/game/Careers/CareerData";
import { Careers, ATHLETE_RETIRE_AGE } from "../src/game/Careers/Careers";
import { Seasons } from "../src/game/Managers/Seasons";
import { SocialMedia, POSTS, POSTS_PER_WEEK, ACCOUNT } from "../src/game/Social/SocialMedia";
import { Vampire, POWERS, BLOOD_DIETS, LifeActions, WITHERED_WEEKS } from "../src/game/Lifepaths/Vampire";
import { LifeMoments, MOMENTS } from "../src/game/Managers/LifeMoments";
import { Hobbies } from "../src/game/Managers/Hobbies";
import { ART_SLOTS } from "../src/game/data/ArtSlots";
import { Celebrity } from "../src/game/Lifepaths/Celebrity";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Work; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const drain = (): any[] => { const seen: any[] = []; for (let i = 0; i < 200 && alerts.length; i++) { const a = alerts.shift(); seen.push(a); AlertManager.INSTANCE.alertDismissed(a); } return seen; };
const T = (xs: any[]) => xs.map((a) => a.getTitle?.() ?? a.title);
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const rich = (p: any, n = 1_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const rows = (g: any) => Array.from(g.generateViewModels().getContentViewModels() as any) as any[];
const screen = (key: string) => Array.from(new LifepathsModelGenerator().screen(key).getContentViewModels() as any) as any[];
const titles = (rs: any[]) => rs.map((r) => r.title ?? r.getTitle?.()).filter((t) => typeof t === "string");
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const setMonth = (p: any, m: number) => p.setBirthMonth(m - Math.floor((p.calendarWeeks() % 48) / 4));
const start = (age: number) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.initializeAge(age, true);
    np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); drain();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const graduate = (p: any, ...names: string[]) => { for (const n of names) p.getCompletableActionState().completeAction((CompletableAction as any)[n]); };
const work = (p: any, job: any, n = 1) => { for (let i = 0; i < n; i++) { keep(p); p.getJobState().work(job, WorkAction.values()[0]); drain(); } };
const run = (def: any, p: any) => { const ok = LifeActions.perform(def, p); drain(); return ok; };
const post = (id: string) => POSTS.find((x) => x.id === id)!;

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
LifeMoments.enabled = false;

// ---------------------------------------------------------------- the data
{
    check("41 new careers (40 + Translator in v0.27.0); the first 8 groups have 5 each", CAREERS.length === 41 && CAREER_CATEGORIES.slice(0, 8).every((c) => CAREERS.filter((x) => x.category === c.id && x.id !== "translator").length === 5));
    const all = Job.values();
    check("…all are real jobs (67 in all)", all.length === 67 && CAREERS.every((d) => (Job as any)[d.id] instanceof Job), `${all.length}`);
    check("…with unique ordinals", new Set(all.map((j) => j.ordinal())).size === all.length);
    const bad = CAREERS.filter((d) => !(d.titles.length === d.pay.length && d.pay.length === d.mods.length && d.mods.length === d.edu.length && (d.followers == null || d.followers.length === d.titles.length)));
    check("every career has a title, pay, effects and education for each level", bad.length === 0, bad.map((d) => d.id).join(","));
    const badEdu = CAREERS.flatMap((d) => d.edu.filter((e) => e != null && !((CompletableAction as any)[e] instanceof CompletableAction)).map((e) => `${d.id}:${e}`));
    check("every education requirement is a real degree", badEdu.length === 0, badEdu.join(","));
    check("37 new degrees and trainings", DEGREES.length === 37 && DEGREES.every((d) => (CompletableAction as any)[d.id] instanceof CompletableAction));
    const badJob = DEGREES.filter((d) => d.job != null && !((Job as any)[d.job] instanceof Job));
    check("…each leads to a real career", badJob.length === 0, badJob.map((d) => d.id).join(","));
    const unused = DEGREES.filter((d) => !CAREERS.some((c) => c.edu.includes(d.id)));
    check("…and each is needed by a career", unused.length === 0, unused.map((d) => d.id).join(","));
    const j = Job.nurse as any;
    check("pay, titles and images work for a new career", j.pay(2).getRandomValue() > 0 && j.getJobTitles()[1] === "Registered Nurse" && j.getImageId() === "icon_job_nurse" && j.modifiers(1) != null);
    check("every new career and degree has a picture slot", CAREERS.every((c) => ART_SLOTS.some((s) => s.name === c.image)) && DEGREES.every((d) => ART_SLOTS.some((s) => s.name === d.image)));
    const pharm = CompletableAction.pharmacySchool as any;
    check("graduate schools come after Biology", pharm.getPrerequiste() === CompletableAction.college_biology && (CompletableAction.vetSchool as any).getPrerequiste() === CompletableAction.college_biology);
}

// ---------------------------------------------------------------- Work tab: Career Center
{
    const p = start(25); keep(p);
    const r = rows(new WorkModelGenerator());
    const t = titles(r);
    check("the Work tab has a Career Center with 8 groups", t.includes("Career Center") && CAREER_CATEGORIES.every((c) => t.includes(c.title)), t.slice(-10).join(" | "));
    check("v0.27.0: the original careers are in the Career Center too", [Job.panHandler, Job.programmer, Job.actor, Job.sushiChef].every((j) => Careers.categoryOf(j) != null) && CAREER_CATEGORIES.length === 10);
    const health = screen("careers:health");
    check("a group screen lists its 5 careers", CAREERS.filter((c) => c.category === "health").every((c) => text(health).includes((Job as any)[c.id].getJobTitles()[0])), titles(health).join(" | "));
    graduate(p, "highSchool");
    Careers.job("electrician");
    p.getJobState().switchJob(Job.electrician);
    const top = titles(rows(new WorkModelGenerator()));
    check("your Career Center job shows at the top of the Work tab", top[1] === "Apprentice Electrician", top.slice(0, 3).join(" | "));
    work(p, Job.electrician, 3);
    check("you can work a new career", p.getJobState().getCurrentJobState().getProgress() >= 1);
    // degrees
    const ed = titles(rows(new EducationModelGenerator()));
    check("Education: new college degrees and a Trade School & Training section", ed.includes("Nursing Degree") && ed.includes("Trade School & Training") && ed.includes("Trade School: Electrical"), ed.filter((x) => !x.startsWith("College")).join(" | "));
    const before = p.getCompletableActionState().getState(CompletableAction.electricalTrade).getProgress();
    p.learnSkillOrEducation(CompletableAction.electricalTrade); drain();
    check("…and you can study one", p.getCompletableActionState().getState(CompletableAction.electricalTrade).getProgress() === before + 1);
}

// ---------------------------------------------------------------- applying: age and fitness
{
    let p = start(12); keep(p);
    check("too young for the content creator career at 12", Careers.applyBlock(Job.contentCreator, p) != null);
    p = start(31); keep(p);
    check("pro athletes are hired up to 30", /up to age 30/.test(Careers.applyBlock(Job.proAthlete, p) ?? ""));
    p.getAttributeState().setHealth(50);
    check("firefighters need 60 health", /60 health/.test(Careers.applyBlock(Job.firefighter, p) ?? ""));
    const cell = text(p.getJobState().getState(Job.firefighter).getViewModel());
    check("…and the Apply button says why", /60 health/.test(cell));
    keep(p);
    check("…which goes away when you're fit", Careers.applyBlock(Job.firefighter, p) == null);
    // losing the job when you're unfit for a month
    graduate(p, "highSchool", "fireAcademy");
    p.getJobState().switchJob(Job.firefighter);
    for (let i = 0; i < 4; i++) { p.getAttributeState().setHealth(40); Careers.afterWeek(p); }
    drain();
    check("4 weeks under 60 health: you're let go", p.getJobState().getCurrentJob() == null);
}

// ---------------------------------------------------------------- seasons
{
    const p = start(30); keep(p);
    setMonth(p, 0);
    check("January is winter", Seasons.season(p) === "winter" && Seasons.label(p) === "❄️ Winter");
    setMonth(p, 6);
    check("July is summer", Seasons.season(p) === "summer");
    check("lifeguards earn +50% in summer", Careers.payMultiplier(Job.lifeguard, p) === 1.5);
    setMonth(p, 0);
    check("…and less in winter; ski instructors the other way round", Careers.payMultiplier(Job.lifeguard, p) === 0.4 && Careers.payMultiplier(Job.skiInstructor, p) === 1.6);
    check("ski season is winter only", Leisure.ski.requirementNotMetString(p) == null || !/Ski season/.test(Leisure.ski.requirementNotMetString(p)));
    setMonth(p, 6);
    check("…no skiing in July", /Ski season/.test(Leisure.ski.requirementNotMetString(p) ?? ""));
    check("Leisure tab shows This Season's activities", titles(rows(new VacationModelGenerator())).some((t) => /This Season: ☀️ Summer/.test(t)));
    setMonth(p, 3);
    Vampire.rise(p); drain();
    const spring = Vampire.sunDamage(p); setMonth(p, 6); const summer = Vampire.sunDamage(p); setMonth(p, 0); const winter = Vampire.sunDamage(p);
    check("sunlight: half in winter, ×1.5 in summer", spring === 10 && summer === 15 && winter === 5, `${winter} ${spring} ${summer}`);
    // moments follow the seasons
    const q = start(8); keep(q); setMonth(q, 6);
    const ids = LifeMoments.eligible(q).map((m) => m.id);
    check("no snow days in summer; lemonade stands only in summer", !ids.includes("snowDay") && (ids.includes("lemonade") || LifeMoments.state(q).seen.lemonade != null), ids.join(","));
    setMonth(q, 0);
    check("…snow days in winter", LifeMoments.eligible(q).some((m) => m.id === "snowDay"));
    check("every season filter names a real season", MOMENTS.every((m) => !m.seasons || m.seasons.every((s) => ["winter", "spring", "summer", "fall"].includes(s))));
}

// ---------------------------------------------------------------- promotions: followers and hobbies
{
    const p = start(25); keep(p); rich(p);
    graduate(p, "highSchool");
    p.getJobState().switchJob(Job.politician);
    const st = p.getJobState().getCurrentJobState();
    st.setProgress(Job.politician.weeksForPromotion(1) - 1);
    work(p, Job.politician);
    check("a politician needs 500 followers for City Council", st.getLevel() === 1 && /500 social media followers/.test(Careers.promotionBlock(Job.politician, 2, p) ?? ""));
    SocialMedia.createAccount(p); drain();
    SocialMedia.addFollowers(p, 600, "chirper");
    st.setProgress(Job.politician.weeksForPromotion(1) - 1);
    work(p, Job.politician);
    check("…with 600 followers you're promoted", st.getLevel() === 2, `${st.getLevel()}`);
    // hobby gate
    p.getJobState().switchJob(Job.gameDeveloper);
    graduate(p, "gameDesign");
    const g = p.getJobState().getCurrentJobState(); g.setLevel(4); g.setProgress(Job.gameDeveloper.weeksForPromotion(4) - 1);
    work(p, Job.gameDeveloper);
    check("a game developer needs Gaming 45 to become Lead Designer", g.getLevel() === 4 && /Gaming skill 45/.test(Careers.promotionBlock(Job.gameDeveloper, 5, p) ?? ""));
    Hobbies.state("gaming", p).skill = 50;
    g.setProgress(Job.gameDeveloper.weeksForPromotion(4) - 1);
    work(p, Job.gameDeveloper);
    check("…with the skill, promoted", g.getLevel() === 5);
    check("working as a content creator wins followers", (() => { p.getJobState().switchJob(Job.contentCreator); const f0 = SocialMedia.followers(p); work(p, Job.contentCreator, 3); return SocialMedia.followers(p) > f0; })());
}

// ---------------------------------------------------------------- pro athletes retire; pilots fly cheap
{
    const p = start(30); keep(p);
    p.getJobState().switchJob(Job.proAthlete);
    p.getJobState().getCurrentJobState().setLevel(4);
    p.initializeAge?.(ATHLETE_RETIRE_AGE, true);
    if (p.getAgeInYears() < ATHLETE_RETIRE_AGE) p.ageInWeeks = ATHLETE_RETIRE_AGE * 48;
    LifeMoments.enabled = true;
    Careers.afterWeek(p);
    const a = alerts.find((x) => /Hanging Up/.test(x.getTitle?.() ?? x.title));
    check("pro athletes retire at 38", p.getJobState().getCurrentJob() == null && a != null);
    if (a) { alerts.splice(alerts.indexOf(a), 1); a.getPositiveButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); }
    drain(); LifeMoments.enabled = false;
    check("…and can coach straight away as a Personal Trainer", p.getJobState().getCurrentJob() === Job.personalTrainer && p.getJobState().getCurrentJobState().getLevel() >= 3, `${p.getJobState().getCurrentJob()?.name()}`);
    const full = Number(Leisure.international_vacation.getCost().toString());
    p.getJobState().switchJob(Job.pilot);
    const half = Number(Leisure.international_vacation.getCost().toString());
    check("pilots pay half for vacations", half === Math.round(full / 2), `${full} → ${half}`);
    check("…but not for the park", Number(Leisure.goToPark.getCost().toString()) === 25);
}

// ---------------------------------------------------------------- social media
{
    let p = start(12); keep(p);
    check("no social media under 13", SocialMedia.blocked(p) != null && titles(rows(new SocialModelGenerator())).includes("Create an Account"));
    p = start(20); keep(p); rich(p);
    const t0 = titles(rows(new SocialModelGenerator()));
    check("the Social tab offers an account", t0.includes("Create an Account"));
    SocialMedia.createAccount(p); drain();
    check("…which gets you a handle", /^@/.test(SocialMedia.state(p).handle ?? ""));
    const t1 = titles(rows(new SocialModelGenerator()));
    check("the tab shows posts, platforms and the account", ["Post a Selfie", "Snapgram", "ClipTok", "Chirper", "VidTube", "Digital Detox"].every((x) => t1.includes(x)), t1.join(" | "));
    const f0 = SocialMedia.followers(p), w0 = p.calendarWeeks();
    run(post("selfie"), p);
    check("a selfie wins followers and doesn't take the week", SocialMedia.followers(p) > f0 && p.calendarWeeks() === w0);
    run(post("season"), p); run(post("selfie"), p);
    check(`${POSTS_PER_WEEK} posts a week`, SocialMedia.postBlock(p) != null && !run(post("selfie"), p));
    SocialMedia.afterWeek(p);
    check("…and the count resets each week", SocialMedia.postBlock(p) == null);
    check("locked posts say why (no partner, no kids, no pet)", /single/.test(post("couple").lock!(p) ?? "") && /children/.test(post("kid").lock!(p) ?? "") && /pet/.test(post("pet").lock!(p) ?? ""));
    SocialMedia.addFollowers(p, 20000, "snapgram");
    const ad = SocialMedia.adRevenue(p);
    const c0 = cash(p); p.collectWeeklyValues(); p.resetValuesThisWeek?.();
    check("ad revenue from 10K followers", ad >= 30, `${ad}`);
    const c1 = cash(p);
    run(post("sponsored"), p);
    check("a sponsored post pays", cash(p) > c1, `${c0} ${c1} ${cash(p)}`);
    check("…once a week", post("sponsored").lock!(p) != null);
    run(ACCOUNT_ROW("verify"), p);
    check("verified at 25K", SocialMedia.state(p).verified === false || SocialMedia.followers(p) >= 25000);
    SocialMedia.addFollowers(p, 10000, "chirper");
    SocialMedia.afterWeek(p);
    run(ACCOUNT_ROW("verify"), p);
    check("…a blue tick", SocialMedia.state(p).verified);
    // detox
    run(ACCOUNT_ROW("detox"), p);
    check("Digital Detox stops posting", SocialMedia.state(p).detox && /Detox/.test(SocialMedia.postBlock(p) ?? ""));
    run(ACCOUNT_ROW("detox"), p);
    // jail
    p.getCrimeState().isInJail = true;
    check("no phones in jail", /jail/.test(SocialMedia.postBlock(p) ?? ""));
    p.getCrimeState().isInJail = false;
    // celebrity fans follow you
    Celebrity.state(p).fans = 2_000_000;
    const before = SocialMedia.followers(p);
    SocialMedia.afterWeek(p);
    check("famous people gain followers from their fans", SocialMedia.followers(p) > before);
    Celebrity.state(p).fans = 0;
    // vampires and cameras
    Vampire.rise(p); drain();
    const sus = Vampire.state(p).suspicion;
    run(post("selfie"), p);
    check("a vampire's selfie shows an empty room (+suspicion)", Vampire.state(p).suspicion > sus);
    SocialMedia.afterWeek(p);
    Vampire.state(p).powers = [...Vampire.state(p).powers, "glamour"];
    const sus2 = Vampire.state(p).suspicion, f2 = SocialMedia.followers(p);
    run(post("selfie"), p);
    check("…Glamour fixes that", Vampire.state(p).suspicion === sus2 && SocialMedia.followers(p) > f2);
    // faking your death: a new account
    const old = SocialMedia.state(p).handle;
    const msg = SocialMedia.fakeDeath(p, "Old Name");
    check("faking your death turns your account into a memorial page", SocialMedia.state(p).handle == null && SocialMedia.state(p).former.some((x) => x.handle === old) && /memorial/.test(msg));
    check("…and you start again from zero", SocialMedia.followers(p) === 0 && titles(rows(new SocialModelGenerator())).includes("Create an Account"));
    // saves
    SocialMedia.createAccount(p); drain(); SocialMedia.addFollowers(p, 1234, "vidtube");
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    const bp = back.getSaveState().currentSlot().getPersonState();
    check("social media is saved", Math.round(bp.social?.f?.vidtube) === 1234 && bp.social.former.length === 1);
}
function ACCOUNT_ROW(id: string): any { return ACCOUNT.find((d) => d.id === id)!; }

// ---------------------------------------------------------------- vampire powers
{
    check("14 blood powers, each with a picture", POWERS.length === 14 && POWERS.every((pw) => ART_SLOTS.some((s) => s.name === pw.image)));
    const p = start(30); keep(p); rich(p); Vampire.rise(p); drain();
    const s = Vampire.state(p);
    const give = (id: string) => { s.powers = [...(s.powers ?? []), id]; };
    const rats = BLOOD_DIETS.find((d) => d.id === "rats")!;
    s.diet = "hand";
    const t0 = Vampire.thirstPerWeekFor(p);
    give("bloodAlchemy");
    check("Blood Alchemy: thirst rises 25% slower", Math.abs(Vampire.thirstPerWeekFor(p) - t0 * 0.75) < 1e-9);
    check("Beast Tongue: rats cost no happiness", Vampire.dietMods(p, rats)[1] === -3 && (give("beastTongue"), Vampire.dietMods(p, rats)[1] === 0));
    const w0 = Vampire.fightWinChance(p); give("batForm");
    check("Bat Form: +20% against hunters, half suspicion from hunting", Math.abs(Vampire.fightWinChance(p) - w0 - 0.2) < 1e-9 && Vampire.dietSuspicion(p, BLOOD_DIETS.find((d) => d.id === "hunting")!) === 2);
    give("hypnoticGaze");
    check("Hypnotic Gaze: promotions twice as fast", Careers.progressBonus(Job.nurse, p) === 1);
    s.witheredWeeks = 10; give("regeneration"); Vampire.afterWeek(p);
    check("Regeneration: a Withered body recovers twice as fast", s.witheredWeeks === 8, `${s.witheredWeeks}`);
    s.witheredWeeks = 0;
    give("ancientScholar");
    graduate(p, "highSchool");
    const st = p.getCompletableActionState();
    for (let i = 0; i < 3; i++) st.tickCompletionProgress(CompletableAction.nursing);
    check("Ancient Scholar: 3 weeks of study count as 4", st.getState(CompletableAction.nursing).getProgress() === 4, `${st.getState(CompletableAction.nursing).getProgress()}`);
    give("shadowStep");
    s.suspicion = 60; p.getJobState().switchJob(Job.nurse); Vampire.flee(p); drain();
    check("Shadow Step: fleeing hunters keeps your job; Lay Low is stronger", p.getJobState().getCurrentJob() === Job.nurse && s.suspicion === 10, `${s.suspicion}`);
    check("Glamour: you show up in photos", (give("glamour"), Vampire.photogenic(p)));
    const v = rows(new LifepathsModelGenerator()); void v;
    const powerRows = titles(screen("vampire"));
    check("the Powers section lists all 14", POWERS.every((pw) => powerRows.includes(pw.title)), powerRows.join(" | ").slice(0, 400));
    // night and outdoor jobs
    s.powers = [];
    check("bartenders work nights (no sun)", Vampire.onWork(p, Job.bartender) === 1);
    const h0 = p.getAttributeState().getHappiness(); setMonth(p, 3);
    Vampire.onWork(p, Job.lifeguard);
    check("outdoor day jobs burn twice as much", Math.abs(p.getAttributeState().getHappiness() - (h0 - 4)) < 0.01, `${h0} → ${p.getAttributeState().getHappiness()}`);
    p.getJobState().switchJob(Job.nurse);
    check("nurses count as a medical job (Blood Bank Bags)", Vampire.hasMedicalJob(p));
}

// ---------------------------------------------------------------- old saves
{
    const p = start(30); keep(p);
    delete p.social; delete p.careers; delete p.seasons;
    let ok = true;
    try { rows(new SocialModelGenerator()); rows(new WorkModelGenerator()); p.collectWeeklyValues(); p.resetValuesThisWeek?.(); Seasons.afterWeek(p); Careers.afterWeek(p); SocialMedia.afterWeek(p); } catch (e) { ok = false; console.log(e); }
    check("older saves (no social media, careers or seasons yet) work", ok);
}

console.log(failures ? `\n${failures} FAILED` : "\nall career update checks passed");
process.exit(failures ? 1 : 0);
