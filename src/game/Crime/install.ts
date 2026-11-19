// v0.27.0: connects modules that hook into each other (called from GameStateManager.init, after Crossover):
// Subscriptions (bills from savings), Careers (travel discount), Activities (leisure locks), and the Crime update.
import { Crime } from "./Crime";
import { CrimeScreen } from "./CrimeScreen";
import { Careers } from "../Careers/Careers";
import { CLEAN_RECORD_JOBS } from "../Careers/CareerData";
import { Vampire } from "../Lifepaths/Vampire";
import { World as CelebWorld } from "../Lifepaths/CelebrityWorld";
import { World } from "../World/World";
import { Activities } from "../World/Activities";
import { Generations } from "../Managers/Generations";
import { VacationModelGenerator } from "../Controllers/VacationModelGenerator";
import { Housing } from "../Enums/Housing";
import { installSubscriptionHooks } from "../Managers/Subscriptions";
import { installCareerHooks } from "../Careers/Careers";
import { installActivityHooks } from "../World/Activities";

let installed = false;
export function installCrime() {
    if (installed) return;
    installed = true;
    installSubscriptionHooks();
    installCareerHooks();
    installActivityHooks();
    Careers.recordBlock = (p) => Crime.recordBlock(p);
    Crime.hooks.cleanJob = (job) => CLEAN_RECORD_JOBS.has(job?.name?.());
    Crime.hooks.news = (p, text) => { try { CelebWorld.news(p, text); } catch { /* ignore */ } };
    World.moveHooks.push((p) => Crime.onMove(p));
    Generations.heirHooks.push((parent, heir) => Crime.heir(parent, heir));
    Activities.goodDeedHooks.push((p) => { const s = Crime.peek(p); if (s) s.heat = Math.max(0, s.heat - 2); });
    VacationModelGenerator.prisonCells = (p) => CrimeScreen.prisonYardCells(p);
    // vampires: police trouble while hunting draws heat; faking your death closes your files; collapsing in prison
    Vampire.hooks.police = (p) => Crime.addHeat(p, 10);
    const fake = Vampire.hooks.fakeDeath;
    Vampire.hooks.fakeDeath = (p, oldName) => (fake ? fake(p, oldName) : "") + Crime.fakeDeath(p);
    const start = Vampire.hooks.collapseStart;
    Vampire.hooks.collapseStart = (p) => {
        start?.(p);
        if (Crime.inJail(p)) {
            // the guards found you cold and took you for dead; the body went missing from the morgue
            const s = Crime.state(p);
            s.jail = null; s.prisonGang = false; s.heat = 0;
            p.getCrimeState().isInJail = false;
            p.getHousingState().moveHere(Housing.homeless);
        }
        const s = Crime.peek(p);
        if (s?.org && !s.org.own) s.org = null;
    };
}
