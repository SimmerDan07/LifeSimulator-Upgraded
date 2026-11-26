// v0.32.0 "Childhood & Teen Years": hooks into other modules (called from GameStateManager.init after installCrime).
import { MOMENTS } from "../Managers/LifeMoments";
import { Generations } from "../Managers/Generations";
import { Crime } from "../Crime/Crime";
import { Youth, bondParents } from "./Youth";
import { installYouthMoments } from "./YouthMoments";
import { YoungHooks } from "../Lifepaths/CelebrityWorld";
import { childStarBonus, childStarGig } from "./YouthScreens";

let installed = false;

/** Extra effects for the Life Moments that were already there (child and teen ones), by option position. */
const DECOR: Record<string, (p: any, i: number, result: string) => void> = {
    bully: (p, i) => { if (i === 0) { Youth.addPoints(p, { resilient: 2, leader: 1 }); Youth.rep(p, 2); } else if (i === 1) Youth.addPoints(p, { golden: 1 }); else Youth.addPoints(p, { resilient: 2 }); },
    schoolPlay: (p, i) => { if (i === 0) { Youth.addPoints(p, { creative: 2, social: 1 }); const a = Youth.peek(p)?.acts?.drama; if (a?.joined) a.xp = Math.min(100, a.xp + 3); } else Youth.addPoints(p, { hardWorker: 1 }); },
    scienceFair: (p, i) => { if (i < 2) Youth.addPoints(p, { brainiac: i === 1 ? 3 : 1 }); },
    spellingBee: (p, i) => { Youth.addPoints(p, { bookworm: i === 0 ? 3 : 1 }); },
    sleepover: (p, i) => { if (i === 0) Youth.addPoints(p, { social: 1 }); },
    fieldTrip: (p, i) => { Youth.addPoints(p, i === 0 ? { kind: 2 } : { social: 1 }); },
    brokenWindow: (p, i) => { Youth.addPoints(p, i === 0 ? { golden: 1, kind: 1 } : { troublemaker: 2 }); },
    allowance: (p, i) => { if (i === 0) Youth.addPoints(p, { hardWorker: 2, golden: 1 }); },
    houseParty: (p, i, r) => {
        if (i === 0) { Youth.rep(p, 5); Youth.addPoints(p, { social: 2, rebel: 1 }); if (/grounded/i.test(r)) Youth.ground(p, "a house party", 4); }
        else Youth.addPoints(p, { golden: 1 });
    },
    cheat: (p, i, r) => { if (i === 0) { Youth.addPoints(p, { troublemaker: 2 }); if (/detention/i.test(r)) { Youth.state(p).detentions++; Youth.grades(p, -3); } else Youth.grades(p, 1); } else { Youth.addPoints(p, { bookworm: 2, golden: 1 }); Youth.grades(p, 1); } },
    crush: (p, i) => { Youth.addPoints(p, i === 0 ? { social: 1 } : { creative: 1 }); },
    firstJob: (p, i) => { if (i === 0) { Youth.addPoints(p, { hardWorker: 3 }); Youth.state(p).jobWeeks += 4; } },
    prom: (p, i) => { if (i < 2) { Youth.addPoints(p, { social: 2 }); Youth.book(p, i === 0 ? "Went to prom with a date." : "Went to prom with friends."); } },
    sneakOut: (p, i, r) => { if (i === 0) { Youth.addPoints(p, { rebel: 2 }); if (/waiting/i.test(r)) { bondParents(p, 0); Youth.ground(p, "sneaking out to a concert"); } } else Youth.addPoints(p, { golden: 1 }); },
};

export function installYouth() {
    if (installed) return;
    installed = true;
    installYouthMoments();
    for (const m of MOMENTS) {
        // the old Driving Test moment: the real test lives on the Leisure tab now (Growing Up)
        if (m.id === "drivingTest") { m.when = () => false; continue; }
        const d = DECOR[m.id];
        if (!d) continue;
        const make = m.make;
        m.make = (p: any) => {
            const b = make(p);
            if (b == null) return b;
            b.options = b.options.map((o, i) => [o[0], () => { const r = o[1](); try { if (Youth.isYoung(p)) d(p, i, r ?? ""); } catch { /* ignore */ } return r; }] as [string, () => string]);
            return b;
        };
    }
    Generations.heirHooks.push((parent, heir) => Youth.heir(parent, heir));
    YoungHooks.gig = (p, n) => childStarGig(p, n);
    YoungHooks.bonus = (p) => (Youth.isYoung(p) ? childStarBonus(p) : 0);
    Youth.hooks.respect = (p, n) => { const s: any = Crime.state(p); s.respect = Math.min(100, (s.respect ?? 0) + n); };
}
