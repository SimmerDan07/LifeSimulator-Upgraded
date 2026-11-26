// v0.28.1 Fewer pop-ups: only holidays pop up on their own; everything else goes to News. Spend Time with Everyone
// still goes to work.
delete (globalThis as any).process?.env?.LIFESIM_ALL_POPUPS;
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { AlertType } from "../src/game/Managers/AlertType";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { PersonAttribute } from "../src/game/Enums/PersonAttribute";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { SpouseIncome } from "../src/game/Social/SpouseIncome";
import { LoveScreens } from "../src/game/Social/LoveScreens";
import { Job } from "../src/game/Enums/Job";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger, SpannableStringBuilder } from "../src/game/runtime";
import { ExtensionsKt } from "../src/game/Utils/ExtensionsKt";
import { LifeMoments } from "../src/game/Managers/LifeMoments";
import { News } from "../src/game/Managers/News";
import { FamilyExtras } from "../src/game/Managers/FamilyExtras";
import { Relationships } from "../src/game/Social/Relationships";
import { Illness } from "../src/game/Health/Illness";
import { Crime } from "../src/game/Crime/Crime";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Utils } from "../src/game/Utils/Utils";
import { AlertViewModel } from "../src/game/Managers/AlertViewModel";
import { AlertActionViewModel } from "../src/game/Managers/AlertActionViewModel";
import { LoveActions, loveAction } from "../src/game/Social/LoveActions";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Achievement } from "../src/game/Enums/Achievement";
import { Subscriptions } from "../src/game/Managers/Subscriptions";

const shown: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { shown.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Work; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const dismissAll = () => { for (let i = 0; i < 200 && shown.length; i++) { const a = shown.shift(); try { a.getPositiveButton?.()?.getAction?.()?.invoke?.(); } catch { /* ignore */ } AlertManager.INSTANCE.alertDismissed(a); } };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const cash = (p: any) => Number(p.getMoneyState().getCash().add(p.getMoneyState().getSavings()).toString());
const start = (age: number) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState(); np.initializeAge(age, true); np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); dismissAll();
    const p: any = GameStateManager.INSTANCE.getPersonState(); keep(p);
    MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(500_000), MoneyUpdateType.workIncome, null, null, 12, null);
    return p;
};
import { Youth } from "../src/game/Youth/Youth";
import { YouthScreens } from "../src/game/Youth/YouthScreens";
import { YOUTH_MOMENTS } from "../src/game/Youth/YouthMoments";
import { ACTIVITIES, UPBRINGING, TRAIT_POINTS, MAX_TRAITS, PART_JOBS } from "../src/game/Youth/YouthData";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { Trait } from "../src/game/Enums/Trait";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { MOMENTS } from "../src/game/Managers/LifeMoments";
import { Hobbies } from "../src/game/Managers/Hobbies";
import { Celebrity } from "../src/game/Lifepaths/Celebrity";
import { SocialMedia } from "../src/game/Social/SocialMedia";
import { LifeActions } from "../src/game/Lifepaths/Vampire";
import { Generations } from "../src/game/Managers/Generations";
import { YOUNG } from "../src/game/Lifepaths/CelebrityWorld";
import { EducationModelGenerator } from "../src/game/Controllers/EducationModelGenerator";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
// v0.32.0 Childhood & Teen Years
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
LifeMoments.enabled = false;
const titlesOf = (gen: any): string[] => { const out: string[] = []; for (const c of Array.from(gen.generateViewModels().getContentViewModels() as any) as any[]) { const t = c.title ?? c.getTitle?.() ?? c.text?.text ?? c.getTitleViewModel?.()?.getText?.()?.toString?.(); if (t != null) out.push(String(t)); } return out; };
const cellTitles = (cells: any[]) => cells.map((c: any) => String(c.title ?? c.getTitle?.() ?? c.getTitleViewModel?.()?.getText?.() ?? c.titleText ?? ""));
const anyText = (cells: any[]) => JSON.stringify(cells.map((c: any) => { try { return SaveCodec.encode(c); } catch { return ""; } }));
const school = (p: any) => Youth.currentSchool(p);
const studyWeek = (p: any) => { const s = school(p); if (s) p.getCompletableActionState().tickCompletionProgress(s); p.applyWeekly(); };
const week = (p: any, n = 1) => { for (let i = 0; i < n; i++) { keep(p); p.applyWeekly(); dismissAll(); } };
const def = (list: any[], id: string) => list.find((d) => d.id === id);
const withRandom = <T>(v: number, f: () => T): T => { const r = Math.random; Math.random = () => v; try { return f(); } finally { Math.random = r; } };
/** Sandbox starts can come with schools finished: put a kid back in elementary school. */
const enrol = (p: any) => { const cas = p.getCompletableActionState(); cas.clearAction(CompletableAction.elementarySchool); cas.getState(CompletableAction.elementarySchool).setProgress(40); };
const msgs = () => shown.map((a) => `${a.getTitle?.()}: ${a.getMessage?.()}`).join(" | ");

// ---------------------------------------------------------------- school life
{
    const p = start(6); shown.length = 0; enrol(p);
    week(p);
    const y = Youth.state(p);
    check("a 6-year-old has school life (grades, reputation)", Youth.schoolShown(p) && Youth.inSchool(p) && y.grades > 0);
    const edu = YouthScreens.education(p);
    const txt = anyText(edu);
    check("the Education tab shows School Life with Grades and Reputation meters", /School Life/.test(txt) && /Grades/.test(txt) && /Reputation/.test(txt));
    y.grades = 70;
    for (let i = 0; i < 10; i++) { keep(p); studyWeek(p); dismissAll(); }
    check("studying at school every week raises your grades", y.grades > 79, String(y.grades));
    const g = y.grades;
    week(p, 6);
    check("weeks without school let them slide (gently)", y.grades < g && y.grades > g - 5, `${g} → ${y.grades}`);
    y.grades = 46; week(p, 10);
    check("…but never below 45 on their own", y.grades >= 45 && y.grades <= 46);
    // homework
    const hw = def(YouthScreens.defs.SCHOOL, "homework");
    const before = y.grades;
    LifeActions.perform(hw, p);
    check("Do Your Homework: +2.5 grades, instantly", Math.abs(y.grades - before - 2.5) < 0.01);
    check("…once a week", LifeActions.perform(hw, p) === false);
    // report card
    shown.length = 0; y.report = Youth.now(p) - 20; y.grades = 95; y.honorRolls = 0;
    week(p);
    check("a report card comes every 16 weeks (honor roll for an A)", y.reports.length > 0 && y.reports[y.reports.length - 1].startsWith("A") && y.honorRolls === 1);
    check("…and it goes to News (it isn't a choice), like other things that happen during the week", News.state().items.some((i: any) => /Report Card/.test(i.title)));
    // skip school
    const skip = def(YouthScreens.defs.SCHOOL, "skip");
    const k = start(9); enrol(k); const yk = Youth.state(k); yk.style = "strict";
    yk.grades = 80; yk.detentions = 0;
    const caughtRoll = Math.random; let calls = 0; Math.random = () => (calls++ < 2 ? 0.01 : caughtRoll());   // where you went, and getting caught
    try { LifeActions.perform(skip, k); } finally { Math.random = caughtRoll; }
    check("Skip School: −4 grades, and if you're caught: detention (and grounded)", yk.grades <= 76 && yk.detentions === 1 && Youth.groundedWeeks(k) > 0, `${yk.grades} ${yk.detentions}`);
    dismissAll();
}
// ---------------------------------------------------------------- activities
{
    const p = start(9); shown.length = 0;
    const y = Youth.state(p);
    check("joining an activity", Youth.join("track", p) && Youth.join("piano", p) && Youth.join("art", p));
    check("…up to three at once", !Youth.join("soccer", p) && /3 activities/.test(Youth.joinBlock(ACTIVITIES.find((d) => d.id === "soccer")!, p) ?? ""));
    check("…age limits (Debate from 12)", /12/.test(Youth.joinBlock(ACTIVITIES.find((d) => d.id === "debate")!, p) ?? ""));
    const run0 = Hobbies.skill("running", p);
    check("practising is instant and once a week", Youth.practice("track", p) && !Youth.practice("track", p) && Youth.state(p).acts.track.xp > 0);
    check("…and trains the matching adult hobby (Track → Running)", Hobbies.skill("running", p) > run0);
    for (let i = 0; i < 4; i++) { week(p); Youth.practice("track", p); }
    check("…levels up to Good", Youth.levelOf(y.acts.track.xp) >= 1, String(y.acts.track.xp));
    const sh = ACTIVITIES.find((d) => d.id === "track")!;
    y.acts.track.lastShow = -999;
    check("showing off (a meet) once you're Good", Youth.showBlock(sh, p) == null);
    withRandom(0.01, () => Youth.showOff("track", p));
    check("…wins a trophy (+5 reputation)", y.acts.track.trophies === 1 && Youth.trophies(p) === 1);
    check("…then not again for 8 weeks", /week/.test(Youth.showBlock(sh, p) ?? ""));
    const tabs = YouthScreens.education(p);
    check("joined activities show on the Education tab with a Browse button", /Track & Field/.test(anyText(tabs)) && /Browse Activities/.test(anyText(tabs)));
    check("the activities screen lists every activity", ACTIVITIES.every((d) => anyText(YouthScreens.activitiesScreen(p)).includes(d.title.replace(/&/g, "\\u0026")) || anyText(YouthScreens.activitiesScreen(p)).includes(d.title)));
    Youth.quit("art", p);
    check("quitting frees a spot", Youth.joined(p).length === 2 && Youth.join("soccer", p));
    // drama → acting (Celebrity Life)
    const p2 = start(8); Youth.join("drama", p2); const act0 = Celebrity.skill(p2, "acting"); Youth.practice("drama", p2);
    check("Drama Club trains your Celebrity Life acting", Celebrity.skill(p2, "acting") > act0);
    dismissAll();
}
// ---------------------------------------------------------------- crowds, friends, grounding
{
    const p = start(12); shown.length = 0;
    const y = Youth.state(p); y.rep = 10;
    const pop = { id: "popular" } as any;
    check("the Popular Crowd needs a reputation", Youth.crowdBlock(require_crowd("popular"), p) != null && Youth.crowdBlock(require_crowd("brains"), p) == null);
    Youth.joinCrowd("brains", p);
    const g0 = y.grades, r0 = y.rep;
    const hang = def(YouthScreens.defs.SCHOOL, "crowd");
    LifeActions.perform(hang, p);
    check("hanging out with the Brains: +reputation, +grades", y.rep > r0 && y.grades > g0);
    check("…once a week", LifeActions.perform(hang, p) === false);
    week(p);
    Youth.ground(p, "testing", 3);
    check("grounded: no hanging out", /Grounded/.test(new (require_cell())(hang).requirementNotMetString(p) ?? ""));
    const party = def(YouthScreens.defs.GROWING, "party");
    p.initializeAge?.call; 
    week(p, 3);
    check("grounding wears off", Youth.groundedWeeks(p) === 0 && LifeActions.perform(hang, p));
    // best friend
    const bf = def(YouthScreens.defs.SCHOOL, "bestFriend");
    Relationships.circle(p).people.length = 0; y.best = null;
    LifeActions.perform(bf, p);
    check("Make a Friend at School gives you a best friend", Youth.bestFriend(p) != null);
    week(p);
    const f = Youth.bestFriend(p); const b0 = f.getRelationshipProgress();
    LifeActions.perform(bf, p);
    check("…hang out with them once a week (+relationship)", f.getRelationshipProgress() > b0);
    void pop; void party;
    dismissAll();
}
function require_crowd(id: string) { return (require_data().CROWDS as any[]).find((c) => c.id === id); }
function require_data() { return YD; }
function require_cell() { return LifeActionCellRef; }
import * as YD from "../src/game/Youth/YouthData";
import { SocialPerson as SocialPersonRef } from "../src/game/Social/SocialPerson";
import { LifeActionCell as LifeActionCellRef } from "../src/game/Lifepaths/Vampire";
// ---------------------------------------------------------------- money
{
    const p = start(10); shown.length = 0;
    const y = Youth.state(p); y.style = "loving";
    const pm = Youth.allowance(p);
    check("pocket money every week", pm > 0);
    const c0 = Number(p.getMoneyState().getCash().toString());
    week(p);
    const c1 = Number(p.getMoneyState().getCash().toString());
    check("…paid into your cash", c1 - c0 >= pm - 1, `${c1 - c0} vs ${pm}`);
    y.piggyOn = true;
    const parentsList = (Array.from(p.getFamilyState().getParents() as any) as any[]);
    const chores = loveAction("chores");
    if (parentsList.length) LoveActions.perform(chores, parentsList[0], p);
    dismissAll();
    check("Help Around the House doubles that week's pocket money, half into the piggy bank", y.piggy >= pm, `${y.piggy} vs ${pm}`);
    const raise = def(YouthScreens.defs.GROWING, "raise");
    withRandom(0.0, () => LifeActions.perform(raise, p));
    check("asking for more pocket money (when they say yes)", Youth.allowance(p) > pm);
    check("…then not again for 24 weeks", /24|weeks/.test(Youth.raiseBlock(p) ?? ""));
    dismissAll();
}
// ---------------------------------------------------------------- phone, driving, part-time jobs
{
    const p = start(12); shown.length = 0;
    const y = Youth.state(p); y.style = "loving";
    check("no social media at 12 without a phone", SocialMedia.blocked(p) != null);
    LifeActions.perform(def(YouthScreens.defs.GROWING, "phone"), p);
    check("…a phone of your own opens it at 12", y.phone && SocialMedia.blocked(p) == null);
    const q = start(15); const yq = Youth.state(q);
    withRandom(0.0, () => LifeActions.perform(def(YouthScreens.defs.GROWING, "permit"), q));
    check("learner's permit at 15", yq.permit);
    check("…the driving test waits until 16", /16/.test(Youth.testBlock(q) ?? ""));
    for (let i = 0; i < 3; i++) LifeActions.perform(def(YouthScreens.defs.GROWING, "lessons"), q);
    check("driving lessons", yq.lessons === 3);
    q.initializeAge(16, false);
    withRandom(0.0, () => LifeActions.perform(def(YouthScreens.defs.GROWING, "drivetest"), q));
    check("the driving test at 16 gives you your licence", yq.license);
    check("the old Driving Test life moment is retired (no double tests)", MOMENTS.find((m) => m.id === "drivingTest")?.when?.(q) === false);
    // jobs
    const lg = PART_JOBS.find((j) => j.id === "lifeguard")!, tutor = PART_JOBS.find((j) => j.id === "tutor")!, ff = PART_JOBS.find((j) => j.id === "fastFood")!;
    yq.grades = 70;
    check("Lifeguard needs Swimming, Tutor needs good grades", Youth.jobBlock(lg, q) != null && Youth.jobBlock(tutor, q) != null && Youth.jobBlock(ff, q) == null);
    Youth.takeJob("fastFood", q);
    const c0 = Number(q.getMoneyState().getCash().toString());
    week(q, 4);
    check("a part-time job pays every week", yq.jobWeeks === 4 && Number(q.getMoneyState().getCash().toString()) - c0 >= ff.pay * 4 - 10);
    check("the Work tab shows Part-Time Jobs", /Part-Time Jobs/.test(anyText(YouthScreens.work(q))));
    dismissAll();
}
// ---------------------------------------------------------------- upbringing traits
{
    const p = start(10); shown.length = 0;
    p.getTraitState().getTraits().clear(); p.getTraitState().addTrait(Trait.pessimistic);
    Youth.addPoints(p, { athlete: TRAIT_POINTS });
    check("enough points earns an upbringing trait", Youth.has("athlete", p));
    check("…with the game's own trait (Athlete → Strong Immune System)", p.getTraitState().hasTrait(Trait.strongImmuneSystem));
    Youth.addPoints(p, { golden: TRAIT_POINTS });
    check("…and a negative opposite is grown out of (Golden Child → Optimistic replaces Pessimistic)", p.getTraitState().hasTrait(Trait.optimistic) && !p.getTraitState().hasTrait(Trait.pessimistic));
    for (const t of UPBRINGING) Youth.addPoints(p, { [t.id]: TRAIT_POINTS } as any);
    check(`at most ${MAX_TRAITS} traits`, Youth.state(p).traits.length === MAX_TRAITS);
    check("the Profile tab shows Growing Up with the Yearbook", /Yearbook/.test(anyText(YouthScreens.profile(p))) && /Athlete/.test(anyText(YouthScreens.yearbook(p))));
    dismissAll();
}
// ---------------------------------------------------------------- graduation and turning 18
{
    const p = start(17); shown.length = 0;
    const y = Youth.state(p); y.style = "loving"; y.grades = 97; y.scholarApplied = true; y.piggy = 1000; y.subjects = { science: 80 };
    y.record = ["Shoplifting"]; Youth.giveTrait(p, "troublemaker", true);
    const sav0 = Number(p.getMoneyState().getSavings().toString());
    const cas = p.getCompletableActionState();
    cas.completeAction(CompletableAction.middleSchool); cas.completeAction(CompletableAction.highSchool);
    shown.length = 0;
    week(p, 0); keep(p); p.applyWeekly();
    const grad = shown.find((a) => a.getTitle() === "Graduation Day");
    check("finishing high school: Graduation Day (Valedictorian with an A+)", grad != null && y.graduated && y.honors === "Valedictorian");
    check("…scholarships go into your savings", y.scholarship > 0 && Number(p.getMoneyState().getSavings().toString()) > sav0);
    dismissAll();
    p.initializeAge(18, false);
    const respect0 = Crime.state(p).respect;
    keep(p); p.applyWeekly();
    const grown = shown.find((a) => a.getTitle() === "You're 18");
    check("turning 18: the growing-up summary", grown != null && y.grown);
    check("…the piggy bank (and 50% from your parents) goes into savings", y.piggy === 0 && /piggy bank/.test(String(grown?.getMessage?.())));
    check("…a head start in a matching degree (Science)", cas.getState(CompletableAction.college_science).getProgress() > 0);
    check("…the juvenile record is sealed", /sealed/.test(String(grown?.getMessage?.())));
    check("…a Troublemaker gets underworld respect", Crime.state(p).respect === respect0 + 10);
    check("…no more school life after 18", YouthScreens.education(p).length === 0 && YouthScreens.leisure(p).length === 0);
    dismissAll();
    // the first real job starts with experience
    y.jobWeeks = 48;
    p.getJobState().switchJob(Job.retail);
    check("part-time work counts at your first real job", (p.getJobState().getCurrentJobState().progress ?? 0) >= 8);
    dismissAll();
}
// ---------------------------------------------------------------- milestones pop up even with no pop-ups
{
    process.env.LIFESIM_NO_POPUPS = "1";
    const p = start(17); shown.length = 0;
    const y = Youth.state(p);
    p.getCompletableActionState().completeAction(CompletableAction.highSchool);
    keep(p); p.applyWeekly();
    check("graduation still pops up with \"No pop-ups for random events\" on (it's a milestone)", shown.some((a) => a.getTitle() === "Graduation Day") && y.graduated);
    y.report = Youth.now(p) - 20; shown.length = 0;
    const q = start(10); shown.length = 0; Youth.state(q).report = Youth.now(q) - 20;
    keep(q); q.applyWeekly();
    check("…while a report card stays quiet", !shown.some((a) => /Report Card/.test(a.getTitle())));
    delete process.env.LIFESIM_NO_POPUPS;
    dismissAll();
}
// ---------------------------------------------------------------- child star
{
    const p = start(9); shown.length = 0;
    const f0 = Celebrity.fans(p);
    withRandom(0.01, () => LifeActions.perform(YOUNG.find((d: any) => d.id === "commercial")!, p));
    const st = Youth.state(p).star!;
    check("a child star's commercial: fans and a trust fund", Celebrity.fans(p) > f0 && st.trust > 0 && st.gigs === 1);
    check("…shows on the Celebrity Life screen under 14 (Young Talent)", /Child star/.test(anyText(YouthScreens.childStar(p))));
    const trust = st.trust; const sav0 = Number(p.getMoneyState().getSavings().toString());
    p.initializeAge(18, false); keep(p); p.applyWeekly();
    check("…the trust fund opens at 18", st.trust === 0 && Number(p.getMoneyState().getSavings().toString()) >= sav0 + trust);
    dismissAll();
}
// ---------------------------------------------------------------- the kids you raise
{
    const p = start(40); shown.length = 0;
    const kid = new Person(Relationship.child, Sex.female, p.getLastName(), 10 * 48); kid.setFirstName("Maya");
    p.getFamilyState().getFamilyMembers().add(kid);
    const kd = Youth.kid(kid, p); kd.grades = 70;
    LoveActions.perform(loveAction("homework"), kid, p); dismissAll();
    check("Help with Homework raises your kid's grades", kd.grades >= 71.4, String(kd.grades));
    LoveActions.perform(loveAction("houseRules"), kid, p);
    check("House Rules: Strict", kd.style === "strict");
    LoveActions.perform(loveAction("sports"), kid, p); dismissAll();
    check("Sign Up for an Activity picks one they love", kd.act != null);
    LoveActions.perform(loveAction("cheerThem"), kid, p); dismissAll();
    check("Go to their game or recital", (kd.cheered ?? -1) >= 0);
    check("their screen shows grades and what they love", JSON.stringify(LoveScreens.aboutRows(kid)).includes("Grades") && JSON.stringify(LoveScreens.aboutRows(kid)).includes("Loves"));
    kd.points.bookworm = 30; kd.points.athlete = 20;
    kid.setAgeInWeeks(18 * 48); week(p);
    check("at 18 they grow up with the traits you gave them", kd.grown === true && (kd.traits ?? []).includes("bookworm"));
    // continuing as them
    const heir: any = new (p.constructor as any)(kid.getFirstName(), kid.getLastName(), kid.getGender(), p.getSexuality(), kid.getSex(), kid.getAgeInWeeks());
    Youth.heir(p, heir);
    check("continuing as your child: they start with those traits", Youth.has("bookworm", heir) && heir.getTraitState().hasTrait(Trait.intellectualCuriosity));
    dismissAll();
}
// ---------------------------------------------------------------- every youth moment works
{
    let bad: string[] = []; const skipped: string[] = [];
    for (const m of YOUTH_MOMENTS) {
        for (let opt = 0; opt < 4; opt++) {
            const p = start(Math.min(m.max, Math.max(m.min, 14))); shown.length = 0;
            const y = Youth.state(p); y.phone = true; y.license = true; y.grades = 90; y.rep = 50;
            if (!Youth.inSchool(p)) { const cas = p.getCompletableActionState(); cas.completeAction(CompletableAction.middleSchool); cas.clearAction(CompletableAction.highSchool); cas.getState(CompletableAction.highSchool).setProgress(10); } y.detentions = 1; y.crowd = "jocks"; y.star = { gigs: 2, trust: 0, agent: false, burnout: 60, tv: 0, lastGig: 0 };
            Youth.join("soccer", p); Youth.join("band", p); y.acts.soccer.xp = 50; Youth.takeJob("fastFood", p); Relationships.makeFriend("school", p);
            try {
                if (m.when && !m.when(p)) {
                    // give them what the moment needs (siblings, pets, two parents)
                    if (/sibling/i.test(m.id)) { const sib = new Person(Relationship.parent, Sex.male, p.getLastName(), 16 * 48); void sib; Relationships.circle(p).add(SocialPersonRef.make("sibling", Sex.male, null, 15 * 48)); }
                    if (!m.when(p)) { if (opt === 0) skipped.push(m.id); break; }
                }
                const b = m.make(p);
                if (b == null) { if (opt === 0) bad.push(m.id + " (no text)"); break; }
                if (opt >= b.options.length) break;
                const r = b.options[opt][1]();
                if (typeof r !== "string" || !r.length) bad.push(`${m.id}#${opt} empty`);
            } catch (e: any) { bad.push(`${m.id}#${opt}: ${e?.message}`); }
            dismissAll();
        }
    }
    check(`all ${YOUTH_MOMENTS.length} school and home moments run (every option)`, bad.length === 0, bad.join("; "));
    check("…(the only ones skipped need a pet or two parents at home)", skipped.every((id) => ["y_dogHomework", "y_lostPet", "y_parentsArgue", "y_moving", "y_bdayParty", "y_gameNight", "y_roadTrip", "y_curfew"].includes(id)), skipped.join(","));
    check("they're in the Life Moments list", YOUTH_MOMENTS.every((m) => MOMENTS.includes(m)));
    // an old moment, now with consequences
    const p = start(15); const y = Youth.state(p); y.style = "strict";
    const hp = MOMENTS.find((m) => m.id === "houseParty")!;
    const b = withRandom(0.01, () => hp.make(p)!);
    withRandom(0.01, () => b.options[0][1]());
    check("an older moment now has consequences (the house party that got busted: grounded)", Youth.groundedWeeks(p) > 0);
    dismissAll();
}
// ---------------------------------------------------------------- saves
{
    const p = start(13); const y = Youth.state(p); Youth.join("chess", p); Youth.practice("chess", p); y.yearbook.push({ age: 13, text: "Test" }); Youth.giveTrait(p, "brainiac", true);
    const copy: any = SaveCodec.decode(SaveCodec.encode(p));
    check("childhood survives a save and load", copy.youth?.acts?.chess?.xp === y.acts.chess.xp && copy.youth.traits.includes("brainiac") && copy.youth.yearbook.length === y.yearbook.length);
    const old = start(40); delete old.youth; week(old, 3);
    check("an adult from an older save doesn't get a childhood made up", old.youth == null);
    // the tabs render with the update
    const kidP = start(13);
    check("the tabs build for a 13-year-old", titlesOf(new EducationModelGenerator()).length > 0 && titlesOf(new VacationModelGenerator()).length > 0 && titlesOf(new WorkModelGenerator()).length > 0 && titlesOf(new ProfileModelGenerator()).length > 0);
    void kidP;
    dismissAll();
}
console.log(failures ? `\n${failures} FAILED` : "\nall youth checks passed");
process.exit(failures ? 1 : 0);
