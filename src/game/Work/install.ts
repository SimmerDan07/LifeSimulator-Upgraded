// v0.33.0 "The Career Overhaul": wires the stages together (called from GameStateManager.init).
import { Work } from "./Work";
import { Hiring } from "./Hiring";
import { Workplace } from "./Workplace";
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
    // stage 2: hiring
    Work.weekHooks.push((p) => Hiring.afterWeek(p));
    // an heir's life starts on the new system (their own job, if any, gets an employer without the "upgrade" note)
    Generations.heirHooks.push((_parent, heir) => { const w = Work.state(heir); w.converted = false; });
}
