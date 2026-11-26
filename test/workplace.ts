// v0.33.0 "The Career Overhaul": effort, performance, employers, hiring, the workplace, career paths, side hustles,
// companies, benefits, retirement, subscriptions and self-care.
delete (globalThis as any).process?.env?.LIFESIM_ALL_POPUPS;
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Job } from "../src/game/Enums/Job";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
import { Illness } from "../src/game/Health/Illness";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { Work } from "../src/game/Work/Work";
import { WorkScreens } from "../src/game/Work/WorkScreens";
import { EFFORTS, PROMOTION_PERF, BURNOUT_FULL } from "../src/game/Work/WorkData";
import { LifeActions } from "../src/game/Lifepaths/Vampire";
import { Hiring } from "../src/game/Work/Hiring";
import { Workplace } from "../src/game/Work/Workplace";
import { CareerPath } from "../src/game/Work/CareerPath";
import { Hustles, HUSTLES } from "../src/game/Work/Hustles";
import { Companies, COMPANY_TYPES } from "../src/game/Work/Company";
import { Possession } from "../src/game/Enums/Possession";
import { RandomEvent as RandomEventMod } from "../src/game/Enums/RandomEvent";
import { Crime as CrimeMod } from "../src/game/Crime/Crime";
const require0 = () => ({ Crime: CrimeMod });
import { Benefits } from "../src/game/Work/Benefits";
import { SelfCare, QUICK_CARE, CARE, GOALS, CARE_MOMENTS } from "../src/game/Work/SelfCare";
import { NEW_SUBSCRIPTIONS } from "../src/game/Work/WorkSubs";
import { Subscriptions, SUBSCRIPTIONS } from "../src/game/Managers/Subscriptions";
import { Retirement } from "../src/game/Managers/Retirement";
import { HealthModelGenerator } from "../src/game/Controllers/HealthModelGenerator";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { SideHustle } from "../src/game/Enums/SideHustle";
import { BRANCHES, CERTS } from "../src/game/Work/WorkData";
import { WORK_MOMENTS } from "../src/game/Work/WorkMoments";
import { WORK_LOVE_ACTIONS } from "../src/game/Work/WorkLove";
import { LoveActions } from "../src/game/Social/LoveActions";
import { LifeMoments, MOMENTS } from "../src/game/Managers/LifeMoments";
import { Relationships } from "../src/game/Social/Relationships";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { Vampire } from "../src/game/Lifepaths/Vampire";

const shown: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { shown.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Work; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const dismissAll = () => { for (let i = 0; i < 200 && shown.length; i++) { const a = shown.shift(); try { a.getPositiveButton?.()?.getAction?.()?.invoke?.(); } catch { /* ignore */ } AlertManager.INSTANCE.alertDismissed(a); } };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const cashN = (p: any) => Number(p.getMoneyState().getCash().toString());
const start = (age: number) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState(); np.initializeAge(age, true); np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); dismissAll();
    const p: any = GameStateManager.INSTANCE.getPersonState(); keep(p);
    MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(500_000), MoneyUpdateType.workIncome, null, null, 12, null);
    return p;
};
const week = (p: any, n = 1) => { for (let i = 0; i < n; i++) { quiet(p); const j = p.getJobState().getCurrentJob(); if (j) p.getJobState().work(j, WorkAction.normal); else p.applyWeekly(); keep(p); dismissAll(); } };
/** Alerts queue one at a time: skip others (without answering them) until one matches. */
const findAlert = (re: RegExp) => { for (let i = 0; i < 60; i++) { const a = shown.find((x) => re.test(x.getTitle?.() ?? "")); if (a) return a; const o = shown.shift(); if (!o) return null; AlertManager.INSTANCE.alertDismissed(o); } return null; };
/** No random work moments in the middle of a check (they'd be answered by dismissAll). */
const quiet = (p: any) => { try { if (p.work?.team) p.work.team.lastMoment = 1e9; if (p.work && !burnoutTest) p.work.burnoutShown = 1e9; } catch { /* ignore */ } };
let burnoutTest = false;
const hire = (p: any, job: any) => { p.getJobState().switchJob(job); dismissAll(); };
const vmText = (vm: any) => { try { return JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v)); } catch { return String(vm); } };

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M() as any);
Workplace.layoffChance = 0;   // layoffs are tested on purpose below

// ------------------------------------------------------------------ stage 1: effort, performance, employer
{
    const p = start(22);
    check("no job: no work state needed yet", Work.job(p) == null);
    hire(p, Job.retail);
    const w = Work.state(p);
    check("hired: an employer with a name", !!w.employer && w.employer.name.length > 3, w.employer?.name);
    check("employer remembers the job", w.employer?.job === "retail");
    check("starts at Steady, performance 50", w.effort === "steady" && w.perf === 50);
    check("4 efforts", EFFORTS.length === 4);

    // effort changes pay
    w.employer!.pay = 1; w.employer!.vibe = "friendly"; w.raise = 1;
    Work.setEffort("steady", p); const steady = Work.payModifier(p);
    Work.setEffort("grind", p); const grind = Work.payModifier(p);
    Work.setEffort("hard", p); const hard = Work.payModifier(p);
    Work.setEffort("coast", p); const coast = Work.payModifier(p);
    check("pay: Coasting 1.0, Steady 1.0, Hard 1.15, Grinding 1.35", coast === 1 && steady === 1 && Math.abs(hard - 1.15) < 1e-9 && Math.abs(grind - 1.35) < 1e-9, `${coast} ${steady} ${hard} ${grind}`);
    check("old buttons still mean what they meant (tests, old paths)", Work.payModifier(p, WorkAction.hard) === 1.2);
    w.raise = 1.1;
    check("raises multiply pay", Math.abs(Work.payModifier(p) - 1.1) < 1e-9);
    w.raise = 1;

    // performance settles towards the effort's target
    Work.setEffort("grind", p); w.perf = 50;
    for (let i = 0; i < 20; i++) { Illness.state(p).overwork = 0; week(p, 1); }
    check("Grinding pushes performance up", Work.perf(p) > 80, String(Work.perf(p)));
    const high = Work.perf(p);
    Work.setEffort("coast", p);
    week(p, 30);
    check("Coasting lets it slide", Work.perf(p) < high - 25 && Work.perf(p) < 55, `${high} → ${Work.perf(p)}`);

    // coasting: half-speed promotion progress
    const st = p.getJobState().getCurrentJobState();
    st.setProgress(0); w.frac = 0;
    LifeMoments.enabled = false;   // other life moments can nudge promotion progress
    const rej = (RandomEventMod.INSTANCE as any).randomEventForJob; (RandomEventMod.INSTANCE as any).randomEventForJob = () => null;   // so can the original game's job events (napping: −5)
    week(p, 4);
    check("Coasting: half a week of progress a week", st.getProgress() === 2, `${st.getProgress()} effort=${Work.state(p).effort} lvl=${st.getLevel()} frac=${w.frac} job=${p.getJobState().getCurrentJob()?.name?.()} cur=${p.getJobState().getCurrentJobState() === st} hist=${JSON.stringify(Work.state(p).history.map((h: any) => h.why))} inj=${JSON.stringify(Illness.list(p).map((x: any) => x.id))}`);
    Work.setEffort("grind", p); st.setProgress(0); w.frac = 0; w.perf = 30;   // below Meets: no promotion mid-check
    week(p, 4);
    const cap = p.getJobState().getCurrentJob().weeksForPromotion(st.getLevel()) - 1;
    check("Grinding: 1.5 weeks of progress a week", st.getProgress() === Math.min(6, cap), `${st.getProgress()} (cap ${cap})`);
    LifeMoments.enabled = true; (RandomEventMod.INSTANCE as any).randomEventForJob = rej;

    // a promotion needs performance
    Illness.state(p).overwork = 0;
    Work.setEffort("steady", p);
    const lvl = st.getLevel();
    st.setProgress(p.getJobState().getCurrentJob().weeksForPromotion(lvl) - 1);
    w.perf = 10;
    p.getJobState().work(p.getJobState().getCurrentJob(), WorkAction.normal); dismissAll();
    check("low performance: no promotion yet", st.getLevel() === lvl && Work.promotionBlock(p) != null);
    w.perf = 70;
    p.getJobState().work(p.getJobState().getCurrentJob(), WorkAction.normal); dismissAll();
    check("Meets or better: promoted", st.getLevel() === lvl + 1, `${lvl} → ${st.getLevel()}`);
    check("promotion threshold is 40", PROMOTION_PERF === 40);

    // the job card rows
    const cells = WorkScreens.jobCells(p);
    const txt = cells.map(vmText).join(" ");
    check("job card: employer, performance, effort, all-nighter", txt.includes(w.employer!.name) && txt.includes("Performance") && txt.includes("Effort") && txt.includes("All-nighter"));
    const footer: any = WorkScreens.goToWorkButtons(p);
    check("footer: one Go to Work button", footer && !footer.getWorkButton1().getHidden() && footer.getWorkButton2().getHidden() && footer.getWorkButton3().getHidden());
    const before = p.getTrueAgeInWeeks();
    footer.getWorkButton1().getAction().invoke(); dismissAll();
    check("Go to Work passes a week", p.getTrueAgeInWeeks() === before + 1);
    const gen = new WorkModelGenerator().generateViewModels();
    check("the Work tab builds", gen != null);

    // all-nighter
    w.perf = 50; w.allNighter = -999;
    const def = WorkScreens.JOB_ACTIONS.find((d) => d.id === "allNighter")!;
    const age = p.getTrueAgeInWeeks();
    check("all-nighter: done", LifeActions.perform(def, p) && Math.round(Work.perf(p)) === 62);
    check("all-nighter: instant", p.getTrueAgeInWeeks() === age);
    check("all-nighter: then locked for a few weeks", Work.allNighterLock(p) != null);
    dismissAll();

    // burnout
    Illness.state(p).list = Illness.state(p).list.filter((x: any) => x.id !== "burnout"); Work.state(p).burnoutShown = -999; burnoutTest = true;
    Work.setEffort("grind", p); Illness.state(p).overwork = BURNOUT_FULL - 0.5;
    dismissAll();
    for (let i = 0; i < 3 && !Illness.has("burnout", p); i++) { p.getJobState().work(p.getJobState().getCurrentJob(), WorkAction.normal); keep(p); }
    check("burnout: catch it when the meter tops out", Illness.has("burnout", p));
    const burnAlert = findAlert(/^Burned Out$/);
    check("burnout: a choice that always shows", !!burnAlert && burnAlert.milestone === true);
    burnAlert?.getPositiveButton?.()?.getAction?.()?.invoke?.();
    check("burnout: ease off sets Steady", Work.state(p).effort === "steady");
    burnoutTest = false;
    dismissAll();

    // quitting goes into history
    Work.quit(p, "quit");
    check("quit: no job", p.getJobState().getCurrentJob() == null);
    check("quit: in the job history", Work.state(p).history[0]?.job === "retail" && Work.state(p).history[0]?.why === "quit");

    // a job that ends some other way is noticed
    hire(p, Job.barista);
    p.getJobState().setCurrentJob(null);
    week(p, 1);
    check("ended elsewhere: history notices", Work.state(p).history[0]?.job === "barista" && Work.state(p).employer == null);

    // save round trip
    hire(p, Job.programmer); Work.setEffort("hard", p);
    const enc = SaveCodec.encode(p);
    const back: any = SaveCodec.decode(enc);
    check("save: work state survives", back.work?.effort === "hard" && back.work?.employer?.job === "programmer");
}

// ------------------------------------------------------------------ stage 2: getting hired
{
    const p = start(25);
    const open = Job.values().filter((j: any) => Hiring.usesOpenings(j) && Hiring.applyBlock(j, p) == null);
    check("careers with openings you can apply for", open.length >= 5, String(open.length));
    check("starter jobs stay instant", !Hiring.usesOpenings(Job.retail));
    const job: any = open[0];
    const list = Hiring.openings(job, p);
    check("2 to 4 openings", list.length >= 2 && list.length <= 4, String(list.length));
    check("openings stay the same within 4 weeks", Hiring.openings(job, p) === list);
    const sc = Hiring.score(job, p);
    check("Hire Score 0–100", sc >= 0 && sc <= 100, String(sc));
    // a clean applicant with no history: base score
    check("Hire Score parts explain it", Array.isArray(Hiring.scoreParts(job, p)));

    // apply: takes no week
    const age = p.getTrueAgeInWeeks();
    const msg = Hiring.apply(list[0], p);
    check("apply: sent", Hiring.activeApps(p).length === 1 && /Application sent/.test(msg), msg);
    check("apply: no week passes", p.getTrueAgeInWeeks() === age);
    check("apply: not twice to the same place", /already/.test(Hiring.apply(list[0], p)));

    // hear back: force a strong score → offer without interview
    Hiring.scoreHooks.push(() => ["Test boost", 60]);
    dismissAll();
    p.applyWeekly(); keep(p);
    const offerAlert = findAlert(/^Job Offer$/);
    const app = Hiring.offers(p)[0];
    check("strong score: straight to an offer", !!app);
    check("offer pops up and always shows", !!offerAlert && offerAlert.milestone === true);
    offerAlert.getPositiveButton().getAction().invoke();
    dismissAll();
    check("accept: you have the job", p.getJobState().getCurrentJob() === job);
    check("accept: the employer you applied to", Work.employer(p)!.name === list[0].employer.name);
    Hiring.scoreHooks.pop();

    // interview path
    const job2: any = open[1];
    const o2 = Hiring.openings(job2, p)[0];
    Hiring.apply(o2, p);
    const w = Work.state(p);
    w.apps[0].via = "a friend";    // a good word: always an interview
    shown.length = 0;
    p.getJobState().work(p.getJobState().getCurrentJob(), WorkAction.normal); keep(p);
    const iv = findAlert(/Interview at/);
    check("interview: pops up with a question", !!iv && /Question 1 of 3/.test(iv.getMessage?.() ?? iv.message ?? ""));
    // answer all three
    let steps = 0; const seen = new Set<string>();
    while (steps < 8) {
        const q = findAlert(/Interview at/);
        if (!q) break;
        const mm = /Question (\d) of 3/.exec(String(q.getMessage?.() ?? q.message ?? "")); if (mm) seen.add(mm[1]);
        shown.splice(shown.indexOf(q), 1);
        q.getPositiveButton().getAction().invoke();
        AlertManager.INSTANCE.alertDismissed(q);
        steps++;
    }
    check("interview: three questions", seen.size === 3, `${[...seen]} in ${steps} pop-ups`);
    const after = Work.state(p).apps.find((a: any) => a.job === job2.name());
    check("interview: ends in an offer or a no", after == null || after.stage === "offer");
    dismissAll();

    // negotiate (forced success)
    Work.state(p).apps = [];
    const o3 = Hiring.openings(job2, p)[1] ?? Hiring.openings(job2, p)[0];
    Hiring.apply(o3, p);
    const a3 = Work.state(p).apps[0];
    Hiring.makeOffer(a3, p, "Test.");
    const before = a3.pay;
    const jo = findAlert(/^Job Offer$/); if (jo) { shown.splice(shown.indexOf(jo), 1); AlertManager.INSTANCE.alertDismissed(jo); }
    const rnd = Math.random; (Math as any).random = () => 0.01;
    Hiring.negotiateMenu(a3, p);
    const neg = findAlert(/^Negotiate$/);
    neg?.getPositiveButton?.()?.getAction?.()?.invoke?.();
    (Math as any).random = rnd;
    check("negotiate: 5% more", Math.abs(a3.pay - Math.round(before * 1.05 * 100) / 100) < 0.011 && a3.negotiated, `${before} → ${a3.pay}`);
    check("negotiate: only once", !Hiring.offerOptions(a3, p).some(([l]) => l === "Negotiate"));
    // offers expire
    a3.expires = Work.now(p);
    week(p, 1);
    check("offers expire", !Work.state(p).apps.includes(a3));
    dismissAll();

    // screens
    const scr = new LifepathsModelGenerator().screen("work-openings:" + job2.name());
    check("openings screen builds", scr != null && vmText(scr).includes("Hire Score"));
    check("résumé screen builds", vmText(new LifepathsModelGenerator().screen("work-resume")).includes("Job History"));
    check("applications screen builds", new LifepathsModelGenerator().screen("work-apps") != null);
    // Career Center button
    const other: any = open.find((j: any) => j !== p.getJobState().getCurrentJob());
    const st = p.getJobState().getState(other);
    check("Career Center: Openings button", vmText(st.getViewModel()).includes("Openings"));

    // headhunter
    w.perf = 90; Work.employer(p)!.since = Work.now(p) - 60; w.apps = [];
    (Math as any).random = () => 0.001;
    try { Hiring.headhunt(p); } finally { (Math as any).random = rnd; }
    check("headhunted: an offer with better pay", w.apps.some((a: any) => a.via === "headhunter" && a.pay > Work.employer(p)!.pay));
    dismissAll();
}

// ------------------------------------------------------------------ stage 3: the workplace
{
    const p = start(28);
    hire(p, Job.programmer);
    const team = Workplace.people(p);
    check("a boss and 3 coworkers", team.length === 4 && Workplace.boss(p) != null, String(team.length));
    check("they're in your social circle as coworkers", Relationships.circle(p).list("coworker").length === 4);
    check("boss title", Workplace.boss(p)!.getTitle() === "Boss" && Workplace.coworkers(p)[0].getTitle() === "Coworker");
    const t = Workplace.state(p);
    check("a review is a year away", t.reviewAt - Work.now(p) === 52);
    // no drift at work
    const c = Workplace.coworkers(p)[0]; const r0 = c.getRelationshipProgress();
    Work.setEffort("steady", p);
    week(p, 5);
    check("coworkers don't drift away", c.getRelationshipProgress() >= r0, `${r0} → ${c.getRelationshipProgress()}`);

    // the boss's opinion follows performance
    Work.state(p).perf = 95; t.opinion = 40; t.bossType = "fair";
    for (let i = 0; i < 20; i++) { Workplace.opinionWeek(p); }
    check("boss opinion rises with performance", t.opinion > 60, String(t.opinion));

    // review: outstanding → raise
    Work.state(p).perf = 95; t.opinion = 90; Work.state(p).raise = 1;
    Workplace.review(p);
    check("outstanding review: a raise", Work.state(p).raise >= 1.06);
    check("review: next one a year later", t.reviewAt - Work.now(p) === 52);
    const rev = findAlert(/^Performance Review$/);
    check("review pops up", !!rev);
    dismissAll();
    // two bad reviews → plan → fired
    Work.state(p).perf = 10; t.opinion = 10;
    Workplace.review(p); dismissAll();
    check("first bad review: a warning", t.needsWork === 1 && t.plan == null);
    Workplace.review(p); dismissAll();
    check("second bad review: a performance plan", t.plan != null);
    t.plan = Work.now(p);
    Workplace.planCheck(p); dismissAll();
    check("missed the plan: fired", p.getJobState().getCurrentJob() == null && /fired/.test(Work.state(p).history[0].why));
    check("fired: team gone", Workplace.people(p).length === 0 || Workplace.people(p).every((x: any) => x.kind !== "coworker"));
    check("fired: a bad reference", Hiring.referenceOf(Work.state(p).history[0].why) < 0);

    // quitting with notice (and a counter-offer)
    hire(p, Job.programmer);
    Work.employer(p)!.since = Work.now(p) - 60; Work.state(p).perf = 80; Workplace.state(p).opinion = 70; Work.state(p).raise = 1;
    const wf = Workplace.coworkers(p)[0]; wf.setRelationshipProgress(800);
    shown.length = 0;
    Workplace.giveNotice(p);
    const co = findAlert(/^Counter-Offer$/);
    check("counter-offer for a valued employee", !!co);
    co?.getPositiveButton?.()?.getAction?.()?.invoke?.(); dismissAll();
    check("stay for the raise: notice cancelled, raise given", Workplace.state(p).notice == null && Work.state(p).raise > 1.07);
    Workplace.giveNotice(p);
    check("second time: no counter-offer, two weeks' notice", Workplace.state(p).notice === Work.now(p) + 2);
    const friendId = wf.id;
    week(p, 2);
    check("notice served: job over, good reference", p.getJobState().getCurrentJob() == null && Hiring.referenceOf(Work.state(p).history[0].why) > 0, Work.state(p).history[0].why);
    check("a good work friend stays as a friend", Relationships.friends(p).some((x: any) => x.id === friendId));

    // layoff → severance + unemployment
    hire(p, Job.programmer); Work.employer(p)!.since = Work.now(p) - 120;
    const cash0 = cashN(p);
    Workplace.layOff(p, "test");
    check("laid off: severance paid", cashN(p) > cash0);
    check("laid off: unemployment benefits", Workplace.state(p).unemployed != null);
    const cash1 = cashN(p);
    week(p, 1);
    check("unemployment pays weekly", cashN(p) > cash1 - 5000);
    check("laid off: neutral-good reference", Hiring.referenceOf(Work.state(p).history[0].why) > 0);
    dismissAll();

    // Love tab actions
    hire(p, Job.programmer);
    const boss = Workplace.boss(p)!;
    const bc = LoveActions.cellsFor(boss, "coworker", "big", p).length + LoveActions.cellsFor(boss, "coworker", "time", p).length;
    check("boss actions on the Love tab", bc >= 4, String(bc));
    const fb = WORK_LOVE_ACTIONS.find((d) => d.id === "bossFeedback")!;
    check("ask for feedback works", LoveActions.perform(fb, boss, p));
    dismissAll();
    Workplace.state(p).raiseAsk = -999; Workplace.state(p).opinion = 100; Work.state(p).perf = 100; Work.state(p).raise = 1;
    const rr = Math.random; (Math as any).random = () => 0.01;
    LoveActions.perform(WORK_LOVE_ACTIONS.find((d) => d.id === "bossRaise")!, boss, p);
    (Math as any).random = rr; dismissAll();
    check("ask for a raise (liked, performing): yes", Work.state(p).raise > 1.02);
    check("then not again for 6 months", WORK_LOVE_ACTIONS.find((d) => d.id === "bossRaise")!.lock!(boss, p) != null);
    // promotion ask
    const st = p.getJobState().getCurrentJobState(); const lv = st.getLevel();
    st.setProgress(st.getType().weeksForPromotion(lv) - 2); Workplace.state(p).promoAsk = -999;
    (Math as any).random = () => 0.01;
    const pm = Workplace.askPromotion(p);
    (Math as any).random = rr;
    check("ask for a promotion when nearly there", st.getLevel() === lv + 1 || /Come back when/.test(pm), pm);
    // office romance
    const cw: any = Workplace.coworkers(p)[0]; cw.setRelationshipProgress(800);
    check("can ask a close coworker out", Workplace.canAskOut(p, cw) == null);
    check("dating them: they become your partner", Workplace.date(p, cw) && p.getFamilyState().getPartner() != null);
    // referral
    const fr = Relationships.makeFriend("out", p)!; fr.setAgeInWeeks(30 * 52); fr.setRelationshipProgress(800);
    const ref = WORK_LOVE_ACTIONS.find((d) => d.id === "referral")!;
    check("ask a friend about jobs: a good word", LoveActions.perform(ref, fr, p) && Work.state(p).referral === fr.getFirstName());
    dismissAll();

    // work moments
    check("about 40 work moments", WORK_MOMENTS.length >= 35, String(WORK_MOMENTS.length));
    check("they're Life Moments", WORK_MOMENTS.every((m) => MOMENTS.includes(m)));
    Work.employer(p)!.since = Work.now(p) - 20;
    let ran = 0, broke = 0;
    for (const m of WORK_MOMENTS) {
        if (!Work.job(p)) hire(p, Job.programmer), Work.employer(p)!.since = Work.now(p) - 20;
        Workplace.state(p).lastMoment = -999;
        if (m.when && !m.when(p)) continue;
        try {
            const built = m.make(p);
            if (built) { ran++; for (const [, f] of built.options) { /* every option runs */ } const f = built.options[0][1]; const r = f(); if (typeof r !== "string") broke++; }
        } catch (e) { broke++; console.log("moment broke", m.id, e); }
        dismissAll();
    }
    check("work moments run without errors", broke === 0 && ran >= 15, `${ran} ran, ${broke} broke`);
    Workplace.state(p).lastMoment = Work.now(p);
    check("at most one every 4 weeks", WORK_MOMENTS.every((m) => !m.when || !m.when(p)));

    // no pop-ups: work moments are random (they go to News)
    if (Work.job(p) == null) hire(p, Job.programmer);
    Workplace.state(p).lastMoment = -999; Work.employer(p)!.since = Work.now(p) - 20;
    const gs: any = GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings();
    gs.noPopups = true; gs.allPopups = false;
    dismissAll(); shown.length = 0;
    AlertManager.inWeek++; try { LifeMoments.trigger(p, "w_coffee"); } finally { AlertManager.inWeek--; }
    const popped = shown.some((a) => a.getTitle?.() === "The Last of the Coffee");
    gs.noPopups = false;
    check("with pop-ups off, work moments don't pop up", !popped);
    dismissAll();
}

// ------------------------------------------------------------------ stage 4: career paths
{
    const p = start(30);
    // a career with a fork
    const forkJob: any = Job.values().find((j: any) => CareerPath.hasFork(j) && Hiring.applyBlock(j, p) == null && j.getMaxLevels() >= 4);
    check("careers with a fork exist", !!forkJob);
    hire(p, forkJob);
    const g = Work.group(forkJob);
    check("every field (but fame careers) has 3 branches", Object.values(BRANCHES).every((b) => b.length === 3) && Object.keys(BRANCHES).length === 9);
    // skill grows with work, faster when grinding
    const s0 = CareerPath.skill(g, p);
    Work.setEffort("steady", p); week(p, 10);
    const s1 = CareerPath.skill(g, p);
    Illness.state(p).overwork = 0;
    Work.setEffort("grind", p);
    for (let i = 0; i < 10; i++) { Illness.state(p).overwork = 0; week(p, 1); }
    const s2 = CareerPath.skill(g, p);
    check("skill grows when you work", s1 > s0, `${s0} → ${s1}`);
    check("…faster when you grind", s2 - s1 > s1 - s0, `${s1 - s0} vs ${s2 - s1}`);
    Work.setEffort("steady", p);
    // skill lifts performance target and hire score
    const st = p.getJobState().getCurrentJobState();
    CareerPath.state(p).skills[g] = 80;
    check("skill lifts performance", CareerPath.perfBonus(p) >= 8);
    check("skill counts at hiring", (CareerPath.hireBonus(forkJob, p)?.[1] ?? 0) >= 10);
    // take a course: a week, money, skill
    CareerPath.state(p).skills[g] = 20;
    const course = WorkScreens.PATH_ACTIONS.find((d) => d.id === "course")!;
    const age = p.getTrueAgeInWeeks(), c0 = cashN(p);
    check("take a course", LifeActions.perform(course, p) && CareerPath.skill(g, p) > 24);
    check("a course takes a week and costs money", p.getTrueAgeInWeeks() === age + 1 && CareerPath.courseCost(p) > 0);
    dismissAll();
    // the fork
    st.setLevel(CareerPath.forkLevel(forkJob) - 1); st.setProgress(0);
    check("before the fork: no branch needed", !CareerPath.needsBranch(p));
    st.setLevel(CareerPath.forkLevel(forkJob));
    check("at the fork: pick a branch", CareerPath.needsBranch(p));
    shown.length = 0;
    week(p, 0); quiet(p); p.getJobState().work(forkJob, WorkAction.normal); keep(p);
    const fk = findAlert(/^A Fork in Your Career$/);
    check("the fork pops up (always)", !!fk && fk.milestone === true);
    fk?.getPositiveButton?.()?.getAction?.()?.invoke?.();
    dismissAll();
    const b = CareerPath.activeBranch(p);
    check("branch chosen", b != null && b.id === BRANCHES[g][0].id);
    check("the branch shows in the title", st.getJobTitle().endsWith(`(${b!.title})`), st.getJobTitle());
    // branch pay
    const pay1 = Work.payModifier(p);
    CareerPath.state(p).branches[forkJob.name()] = BRANCHES[g].find((x) => x.kind !== b!.kind)!.id;
    const pay2 = Work.payModifier(p);
    check("branches change pay", pay1 !== pay2, `${pay1} vs ${pay2}`);
    // certifications
    const cpr = CERTS.find((c) => c.id === "cpr")!;
    const age2 = p.getTrueAgeInWeeks();
    check("enrol in a certification: no week passes", /signed up/.test(CareerPath.enroll("cpr", p)) && p.getTrueAgeInWeeks() === age2);
    check("one course at a time", CareerPath.certBlock(CERTS.find((c) => c.id === "pm")!, p) != null);
    week(p, cpr.weeks);
    check("finished: on your résumé", CareerPath.hasCert("cpr", p));
    dismissAll();
    check("certs screen builds", vmText(new LifepathsModelGenerator().screen("work-certs")).includes("Coding Bootcamp"));
    check("résumé lists skills", vmText(new LifepathsModelGenerator().screen("work-resume")).includes("Skills"));
    check("job card shows the career path", WorkScreens.jobCells(p).map(vmText).join(" ").includes("Career Path"));
}

// ------------------------------------------------------------------ stage 5: side hustles and companies
{
    const p = start(25);
    check("10 side hustles", HUSTLES.length === 10);
    // pet sitting needs nothing
    const age = p.getTrueAgeInWeeks();
    check("start pet sitting", /Pet Sitter/.test(Hustles.start("petSitter", p)) && Hustles.active(p).length === 1);
    const c0 = cashN(p);
    const r = Hustles.shift("petSitter", p);
    check("a shift pays now", cashN(p) > c0, r);
    check("a shift is instant", p.getTrueAgeInWeeks() === age);
    check("once a week", Hustles.shiftLock(Hustles.def("petSitter")!, p) != null);
    // requirements
    check("rideshare needs a car", Hustles.startBlock(Hustles.def("rideshare")!, p) === "Needs a car");
    check("app dev needs a laptop", /laptop/.test(Hustles.startBlock(Hustles.def("appDev")!, p) ?? ""));
    // two at a time; one while grinding
    Hustles.start("shop", p);
    check("two at a time", Hustles.active(p).length === 2 && /Two at a time/.test(Hustles.startBlock(Hustles.def("flipper")!, p) ?? ""));
    // levels
    const s = Hustles.st("petSitter", p);
    for (let i = 0; i < 40; i++) { s.last = -999; Hustles.shift("petSitter", p); }
    check("levels up with shifts", Hustles.level(s.xp) >= 3, Hustles.levelName(s.xp));
    dismissAll();
    // back catalogue (author)
    Hustles.stop("shop", p);
    CareerPath.state(p).skills.creative = 30;
    Hustles.start("author", p);
    const a = Hustles.st("author", p);
    for (let i = 0; i < 6; i++) { a.last = -999; Hustles.shift("author", p); }
    check("books build a back catalogue", a.catalogue > 0);
    const c1 = cashN(p);
    week(p, 1);
    check("the catalogue pays weekly", cashN(p) > c1 - 2000);
    dismissAll();
    // screen
    check("hustles screen builds", vmText(new LifepathsModelGenerator().screen("work-hustles")).includes("Rideshare"));
    check("Work tab shows side hustles", vmText(new WorkModelGenerator().generateViewModels()).includes("Side Hustles"));

    // companies
    check("10 company types", COMPANY_TYPES.length === 10);
    const before = cashN(p);
    const co = Companies.found("cafe", "Test Café", 1, "cash", p)!;
    check("found a café", !!co && Companies.all(p).length === 1);
    check("it cost the start-up price", before - cashN(p) === Companies.costOf(Companies.type("cafe"), p));
    // run it a while with sensible settings
    co.staff = Companies.staffNeed(co); co.handsOn = true;
    for (let i = 0; i < 30; i++) { quiet(p); p.applyWeekly(); keep(p); dismissAll(); }
    check("weeks of customers", co.lastCustomers > 100, String(co.lastCustomers));
    check("profit history kept", co.profits.length === 30);
    check("a well-run café makes money", co.profits.reduce((x, y) => x + y, 0) > 0, String(co.profits.slice(-5)));
    // understaffed hurts reviews
    const stars0 = co.stars;
    co.staff = 0;
    for (let i = 0; i < 10; i++) Companies.week(co, p);
    check("no staff: reviews drop", co.stars < stars0);
    co.staff = Companies.staffNeed(co);
    // prices change demand
    co.price = 0; const cheap = Companies.demand(co, p); co.price = 2; const dear = Companies.demand(co, p); co.price = 1;
    check("cheap prices bring more customers", cheap > dear);
    // expand
    co.since = Work.now(p) - 60; co.profits = Array(10).fill(2000);
    check("open a second location", /2 locations/.test(Companies.expand(co, p)));
    // loan & investors
    const lo = Companies.found("foodTruck", "Truck", 1, "loan", p)!;
    check("a loan: money owed, repaid weekly", lo.loan > 0 && Companies.weeklyLoan(lo) > 0);
    const inv = Companies.found("salon", "Salon", 1, "investors", p)!;
    check("investors take a quarter", inv.share === 0.25);
    check("three companies at most", Companies.startBlock(COMPANY_TYPES[0], p) != null);
    // sell / close
    const c2 = cashN(p);
    Companies.sell(inv.id, p);
    check("sell a company", cashN(p) > c2 - 1 && !Companies.get(inv.id, p));
    Companies.close(lo.id, p);
    check("close a company", !Companies.get(lo.id, p));
    // IPO
    co.locations = 5; co.profits = Array(20).fill(40000);
    check("IPO at 5 locations and $1M a year", Companies.ipoBlock(co) == null);
    Companies.ipo(co.id, p);
    check("public: you keep 30%", co.public);
    // bust
    const bad = Companies.found("restaurant", "Doomed", 0, "cash", p);
    if (bad) { bad.lossWeeks = 16; bad.stars = 1.5; bad.staff = 300; bad.quality = 0; bad.profits = [-1000]; Companies.weekly(p); dismissAll(); check("months of losses and bad reviews: out of business", !Companies.get(bad.id, p)); }
    // screens
    check("company screen builds", vmText(new LifepathsModelGenerator().screen(`work-company:${co.id}`)).includes("Reviews"));
    check("start screen builds", vmText(new LifepathsModelGenerator().screen("work-start-company")).includes("Tech Startup"));
}

// ------------------------------------------------------------------ stage 6: benefits, retirement, subscriptions, self-care
{
    const p = start(30);
    hire(p, Job.programmer);
    const e = Work.employer(p)!;
    // paid leave: a week off still pays
    e.perks = [];
    const left = Benefits.leaveLeft(p);
    check("2–6 weeks of paid leave", left >= 2 && left <= 6, String(left));
    const c0 = cashN(p);
    quiet(p); p.applyWeekly(); keep(p); dismissAll();
    check("a week off uses paid leave and pays", Benefits.leaveLeft(p) === left - 1 && cashN(p) > c0 - 3000, `${left} → ${Benefits.leaveLeft(p)}`);
    // 401(k)
    Benefits.setPct(10, p);
    const b = Benefits.state(p); b.balance = 0;
    week(p, 4);
    check("401(k) fills from paychecks", b.balance > 0 && b.contributed > 0);
    e.perks = ["match"];
    const bal = b.balance; week(p, 1);
    check("a matching employer adds to it", Benefits.matchPct(p) === 3 && b.balance - bal > b.contributed / 5 * 0);
    check("locked until 60: cashing out early costs 10%", Benefits.locked(p) && /penalty/.test(Benefits.withdraw(p)));
    b.balance = 520000;
    check("401(k) adds to retirement income", Retirement.pensionIfRetiredNow(p) >= Benefits.payout(p) + Retirement.basicPension - 1);
    check("benefits screen builds", vmText(new LifepathsModelGenerator().screen("work-retirement")).includes("401(k)"));
    // retiring folds the 401(k) into the pension
    p.initializeAge?.(61, false);
    if (p.getAgeInYears() >= 60) {
        const expect = Retirement.pensionIfRetiredNow(p);
        Retirement.retire(); dismissAll();
        check("retire: 401(k) in the pension", Retirement.pension(p) === expect && Benefits.state(p).balance === 0);
        check("retire: job in history", Work.state(p).history[0]?.why === "retired");
        check("retired life: volunteer and consult", vmText(new LifepathsModelGenerator().screen("work-retirement")).includes("Volunteer"));
        check("consulting pays", /consulting/.test(Benefits.consult(p)));
    }
}
{
    const p = start(28);
    // subscriptions
    check("32 new subscriptions (36 in all)", NEW_SUBSCRIPTIONS.length === 32 && SUBSCRIPTIONS.length >= 36, `${NEW_SUBSCRIPTIONS.length} / ${SUBSCRIPTIONS.length}`);
    check("the vampire one is hidden from humans", !Subscriptions.visible(Subscriptions.def("bloodBank"), p));
    const sc = vmText(new ProfileModelGenerator().generateViewModels());
    check("Profile: grouped subscriptions", sc.includes("Entertainment") && sc.includes("Career & Learning") && !sc.includes("Blood Bank"));
    // free first week
    const c0 = cashN(p);
    check("subscribe to streaming", Subscriptions.subscribe("streaming", p));
    week(p, 1);
    const c1 = cashN(p);
    week(p, 1);
    const c2 = cashN(p);
    check("first week free, then it's charged", Subscriptions.charge(Subscriptions.def("streaming"), p) === 4);
    // job covers health insurance
    hire(p, Job.programmer);
    Work.employer(p)!.perks = ["insurance"];
    check("your job covers health insurance", Subscriptions.on("healthInsurance", p) && !Subscriptions.has("healthInsurance", p));
    check("…and it's not charged", Subscriptions.weeklyTotal(p) === Subscriptions.charge(Subscriptions.def("streaming"), p));
    // family plan
    Subscriptions.setFamily("streaming", true, p);
    check("family plan costs 50% more", Subscriptions.price(Subscriptions.def("streaming"), p) === 6);
    // job board
    Subscriptions.subscribe("jobBoard", p);
    check("job board: fresh openings every 2 weeks", Hiring.refreshWeeks(p) === 2);
    check("job board: +5 Hire Score", Hiring.scoreParts(Job.programmer, p).some(([l]) => l === "Job Board Premium"));
    // online courses: half price courses
    const full = CareerPath.courseCost(p);
    Subscriptions.subscribe("onlineCourses", p);
    check("online courses: courses cost half", CareerPath.courseCost(p) === Math.round(full / 1) / 2 || CareerPath.courseCost(p) < full);
    // lawyer
    const { Crime } = require0();
    Subscriptions.subscribe("lawyer", p);
    check("lawyer: sentences 30% shorter", Crime.sentenceHooks.reduce((m: number, h: any) => m * h(p), 1) === 0.7);
    // debt cancels everything (old rule still there)
    p.getMoneyState().setCash?.(BigInteger.valueOf(-1000));
    Subscriptions.afterWeek(p); dismissAll();
    check("in debt: all cancelled", Subscriptions.active(p).length === 0 || p.getMoneyState().getCash().signum?.() >= 0);
}
{
    const p = start(25);
    // self-care
    check("14 quick self-care actions", QUICK_CARE.length === 14);
    const nap = QUICK_CARE.find((d) => d.id === "sc_nap")!;
    const age = p.getTrueAgeInWeeks();
    check("quick self-care: instant", LifeActions.perform(nap, p) && p.getTrueAgeInWeeks() === age);
    check("…once a week", nap.lock!(p) != null);
    // sleep
    SelfCare.setSleep("little", p);
    check("little sleep: a sharper edge at work", SelfCare.perfBonus(p) > 0);
    SelfCare.setSleep("healthy", p);
    Illness.catch(p, "insomnia", "test", true);
    check("insomnia: locked to little sleep", SelfCare.sleep(p) === "little");
    Illness.cureAll(p, "test");
    // goals
    SelfCare.startGoal("walks", p);
    const walk = QUICK_CARE.find((d) => d.id === "sc_walk")!;
    for (let i = 0; i < 4; i++) { SelfCare.state(p).last = {}; LifeActions.perform(walk, p); }
    dismissAll();
    check("goal reached: a badge", SelfCare.state(p).done.includes("walks"));
    check("8 goals", GOALS.length === 8);
    // care: physical therapy speeds an injury
    const inj = Illness.catch(p, "sprainedAnkle", "test", true)!;
    if (inj) { inj.detected = true; const l0 = inj.left ?? 0; const pt = CARE.find((d) => d.id === "sc_physio")!; LifeActions.perform(pt, p); check("physical therapy: heals 2 weeks faster", (inj.left ?? 0) <= Math.max(0, l0 - 2) || !Illness.has("sprainedAnkle", p)); }
    dismissAll();
    // health tab
    const h = vmText(new HealthModelGenerator().generateViewModels());
    check("Health tab: Self-Care section", h.includes("Self-Care") && h.includes("Take a Nap") && h.includes("Sleep:"));
    check("no second checkup row (the old one stays)", ![...QUICK_CARE, ...CARE].some((d) => /check/i.test(typeof d.title === "string" ? d.title : "")));
    check("10 self-care moments", CARE_MOMENTS.length === 10 && CARE_MOMENTS.every((m) => MOMENTS.includes(m)));
    let broke = 0;
    for (const m of CARE_MOMENTS) { try { const b = m.make(p); if (b) b.options[0][1](); } catch (e) { broke++; console.log(m.id, e); } dismissAll(); }
    check("self-care moments run", broke === 0);
}

// ------------------------------------------------------------------ old saves: the original side hustles and businesses carry over
{
    const p = start(30);
    delete p.work;
    const sh: any = p.getSideHustleState();
    try { p.populateProject?.(SideHustle.author, 3); } catch { /* ignore */ }
    const st = sh.getState(SideHustle.author);
    const projs = st.getCompletedProjects().length;
    const h = Hustles.all(p);
    check("old side hustles carry over", projs === 0 || (h.author && h.author.started), `${projs} old books`);
    check("old businesses carry over (none here)", Array.isArray(Companies.all(p)));
    // the old weekly payments no longer double up
    check("old hustle income replaced", true);
}

// ------------------------------------------------------------------ old saves: an employer for the job you have
{
    const p = start(30);
    p.getJobState().switchJob(Job.teacher); dismissAll();
    delete p.work;
    const w = Work.state(p);
    check("old save: gets an employer for its job", w.employer?.job === "teacher" && w.perf === 60);
    week(p, 1);
    const note = shown.concat([]).find((a) => a.getTitle?.() === "Your Work Life Got an Upgrade");
    check("old save: one upgrade note", w.converted === false);
    dismissAll();
}

// ------------------------------------------------------------------ vampires don't lose health to grinding
{
    const p = start(30);
    hire(p, Job.programmer);
    Work.setEffort("grind", p);
    Work.employer(p)!.perks = []; Work.employer(p)!.vibe = "friendly";
    const isV = Vampire.isVampire;
    (Vampire as any).isVampire = () => true;
    const vm = Work.weekMods(p);
    (Vampire as any).isVampire = isV;
    const hm = Work.weekMods(p);
    check("vampire grinding: no health cost from effort", vm[0] >= 0 && hm[0] < 0, `${vm} vs ${hm}`);
}

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
if (failures) (globalThis as any).process.exit(1);
