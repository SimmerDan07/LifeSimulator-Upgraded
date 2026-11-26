// v0.33.0 "The Career Overhaul": wires the stages together (called from GameStateManager.init).
import { Work } from "./Work";
import { Hiring } from "./Hiring";
import { Generations } from "../Managers/Generations";

let installed = false;
export function installWork() {
    if (installed) return;
    installed = true;
    Work.weekHooks.push((p) => Hiring.afterWeek(p));
    // an heir's life starts on the new system (their own job, if any, gets an employer without the "upgrade" note)
    Generations.heirHooks.push((_parent, heir) => { const w = Work.state(heir); w.converted = false; });
}
