// v0.33.0 "The Career Overhaul": wires the stages together (called from GameStateManager.init).
import { Work } from "./Work";
import { Hiring } from "./Hiring";
import { Workplace } from "./Workplace";
import { CareerPath } from "./CareerPath";
import { Hustles } from "./Hustles";
import { Companies } from "./Company";
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
