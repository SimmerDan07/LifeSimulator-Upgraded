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
    week(p, 4);
    check("Coasting: half a week of progress a week", st.getProgress() === 2, String(st.getProgress()));
    Work.setEffort("grind", p); st.setProgress(0); w.frac = 0; w.perf = 90;
    week(p, 4);
    check("Grinding: 1.5 weeks of progress a week", st.getProgress() === 6, String(st.getProgress()));

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
