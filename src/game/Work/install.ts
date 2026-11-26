// v0.33.0 "The Career Overhaul": wires the stages together (called from GameStateManager.init).
import { Work } from "./Work";
import { Hiring } from "./Hiring";
import { Workplace } from "./Workplace";
import { CareerPath } from "./CareerPath";
import { Hustles } from "./Hustles";
import { Companies } from "./Company";
import { Benefits } from "./Benefits";
import { SelfCare, CARE_MOMENTS } from "./SelfCare";
import { WorkSubs, NEW_SUBSCRIPTIONS } from "./WorkSubs";
import { SUBSCRIPTIONS, Subscriptions } from "../Managers/Subscriptions";
import { Retirement } from "../Managers/Retirement";
import { Crime } from "../Crime/Crime";
import { WORK_LOVE_ACTIONS } from "./WorkLove";
import { WORK_MOMENTS } from "./WorkMoments";
import { MOMENTS } from "../Managers/LifeMoments";
import { LOVE_ACTIONS } from "../Social/LoveActions";
import { Generations } from "../Managers/Generations";

let installed = false;
export function installWork() {
    if (installed) return;
    installed = true;
    // stage 3: the workplace
    Work.hireHooks.push((p) => Workplace.onHired(p));
    Work.hooks.onLeft = (p) => Workplace.onLeft(p);
    Work.perfHooks.push((p) => Workplace.perfBonus(p));
    Work.weekHooks.push((p) => Workplace.afterWeek(p));
    for (const m of WORK_MOMENTS) if (!MOMENTS.some((x) => x.id === m.id)) MOMENTS.push(m);
    for (const d of WORK_LOVE_ACTIONS) if (!LOVE_ACTIONS.some((x) => x.id === d.id)) LOVE_ACTIONS.push(d);
    // stage 4: career paths
    Work.payHooks.push((p) => CareerPath.payMult(p));
    Work.modHooks.push((p) => CareerPath.mods(p));
    Work.perfHooks.push((p) => CareerPath.perfBonus(p));
    Work.workHooks.push((p, e) => CareerPath.onWork(p, e));
    Work.weekHooks.push((p) => CareerPath.weekly(p));
    Hiring.scoreHooks.push((job, p) => CareerPath.hireBonus(job, p));
    // stage 5: side hustles and companies
    Work.weekHooks.push((p) => Hustles.weekly(p));
    Work.weekHooks.push((p) => Companies.weekly(p));
    // stage 6: benefits, retirement, subscriptions, self-care
    for (const d of NEW_SUBSCRIPTIONS) if (!SUBSCRIPTIONS.some((x) => x.id === d.id)) SUBSCRIPTIONS.push(d);
    Subscriptions.coverHook = (perk, p) => Work.job(p) != null && Work.hasPerk(perk as any, p);
    Work.weekHooks.push((p) => Benefits.weekly(p));
    Work.weekHooks.push((p) => SelfCare.weekly(p));
    Work.weekHooks.push((p) => WorkSubs.weekly(p));
    Work.perfHooks.push((p) => SelfCare.perfBonus(p));
    Work.perfHooks.push((p) => (Subscriptions.on("coffeeClub", p) ? 2 : 0));
    Work.wfhFull = (p) => Subscriptions.on("coworking", p);
    CareerPath.courseDiscount = (p) => Subscriptions.on("onlineCourses", p);
    Companies.careful = (p) => Subscriptions.on("accounting", p);
    Crime.sentenceHooks.push((p) => (Subscriptions.on("lawyer", p) ? 0.7 : 1));
    Hiring.refreshWeeks = (p) => (Subscriptions.on("jobBoard", p) ? 2 : 4);
    Hiring.scoreHooks.push((_job, p) => (Subscriptions.on("jobBoard", p) ? ["Job Board Premium", 5] : null));
    Retirement.extraHook = (p) => Benefits.retirementExtra(p);
    Retirement.retireHooks.push((p) => { Benefits.onRetire(p); Work.employer(p); Work.left(p, "retired"); });
    for (const m of CARE_MOMENTS) if (!MOMENTS.some((x) => x.id === m.id)) MOMENTS.push(m);
    // stage 2: hiring
    Work.weekHooks.push((p) => Hiring.afterWeek(p));
    // an heir's life starts on the new system (their own job, if any, gets an employer without the "upgrade" note)
    Generations.heirHooks.push((parent, heir) => {
        const w = Work.state(heir); w.converted = false;
        // your heir inherits your companies
        const pw: any = Work.peek(parent);
        if (pw?.companies?.length) { w.companies = [...(w.companies ?? []), ...pw.companies]; pw.companies = []; }
    });
}
