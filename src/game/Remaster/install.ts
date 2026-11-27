// v0.36.0 "The Remaster": wires the new Bank, Things, Health, Leisure, Traits and Achievements into the game
// (called from GameStateManager.init after installVampires).
import { Leisure } from "../Enums/Leisure";
import { Trait } from "../Enums/Trait";
import { Vampire } from "../Lifepaths/Vampire";
import { Illness } from "../Health/Illness";
import { Work } from "../Work/Work";
import { Hiring } from "../Work/Hiring";
import { SelfCare } from "../Work/SelfCare";
import { Subscriptions } from "../Managers/Subscriptions";
import { Retirement } from "../Managers/Retirement";
import { Generations } from "../Managers/Generations";
import { GameStateManager } from "../Managers/GameStateManager";
import { Relationships } from "../Social/Relationships";
import { World } from "../World/World";
import { Activities } from "../World/Activities";
import { Bonds } from "../Vampires/Bonds";
import { setMortgageRateHook } from "../RealEstate/RealEstateConfig";
import { player, age, Rm, Say, img, WPY } from "./Core";
import { Bank } from "./Bank";
import { Things, setRelationshipsRef } from "./Things";
import { Body } from "./Body";
import { Fun, TIERS } from "./Fun";
import { Traits } from "./Traits";
import { Feats } from "./Feats";
import { RScreens, setActivitiesLock } from "./RScreens";

let installed = false;
export function installRemaster() {
    if (installed) return;
    installed = true;
    // Leisure: on a budget / normal / splurge / at night, plus traits and favourites
    Leisure.tierHook = (l: any) => {
        const t = Fun.current ? TIERS[Fun.current] : { cost: 1, mods: 1 };
        const p = player();
        let m = t.mods;
        try { const fav = (Fun.peek(p)?.counts[l.name()] ?? 0) >= 8; m *= Traits.leisureMult(p, Fun.categoryOf(l), fav); } catch { /* */ }
        return t.cost === 1 && m === 1 ? null : { cost: t.cost, mods: m };
    };
    Vampire.atNight = () => Fun.current === "night";
    Fun.isDaytime = (l: any) => Vampire.isDaytime(l);
    Fun.friends = (p: any) => [...Relationships.circle(p).list("sibling"), ...Relationships.friends(p)];
    Fun.meet = (p: any, where: string) => { const f = Relationships.makeFriend(`a trip to ${where}`, p); return f ? f.getFirstName() : null; };
    Fun.souvenir = (p: any, where: string) => Things.addSouvenir(p, where);
    setActivitiesLock((l: any, p: any) => Activities.lock(l, p));
    setRelationshipsRef(Relationships);
    // traits
    Trait.titleHook = (t: any) => Traits.title(t);
    Trait.doesHook = (t: any) => Traits.does(t);
    Hiring.scoreHooks.push((_job: any, p: any) => Traits.hireBonus(p));
    Work.perfHooks.push((p: any) => Traits.perfBonus(p));
    Work.payHooks.push((p: any) => Traits.payMult(p));
    Illness.riskMult = (p: any) => Traits.illnessMult(p);
    // health
    Illness.fitHook = (p: any) => Body.fitReducesIllness(p);
    Illness.onCheckup = (p: any) => { if (age(p) >= 18) { Body.doctor(p); Body.st(p).doctorVisits++; } };
    Body.teamFriend = (p: any) => { const f = Relationships.makeFriend("your sports team", p); if (f) Say.note("A New Friend", `${f.getFirstName()} from your team asked you out for a drink after the game. You're friends now.`, img("health_workout")); };
    // money and things
    setMortgageRateHook(() => { const p = player(); return p && age(p) >= 18 ? Bank.mortgageRate(p) : 0.055; });
    Bank.repossess = (p: any, ref: string) => Things.repossess(p, ref);
    Bank.thingsWorth = (p: any) => Things.worth(p);
    Bank.luckHook = (p: any) => (Feats.has(p, "luckyStar") ? 2 : 1);
    RScreens.subsMoneyCells = () => Subscriptions.moneyCells() as any[];
    Retirement.retireHooks.push((p: any) => Rm.mark(p, "retired"));
    // achievements
    Feats.languages = (p: any) => World.languagesSpoken(p).length;
    Feats.childer = (p: any) => Bonds.childer(p).length;
    Feats.sleepHealthy = (p: any) => SelfCare.sleep(p) === "healthy";
    GameStateManager.newLifeHooks.push((p: any) => Feats.applyStart(p));
    // a vampire with the Old Blood head start rises as a Neonate (25 years of blood)
    const risen = Vampire.hooks.risen;
    Vampire.hooks.risen = (p: any) => {
        risen?.(p);
        try { if (Feats.has(p, "oldBlood")) { const r = p.vampire?.rb; if (r && (r.bloodAgeWeeks ?? 0) < 25 * WPY()) r.bloodAgeWeeks = 25 * WPY(); } } catch { /* */ }
    };
    // heirs
    Generations.heirHooks.push((parent: any, heir: any) => {
        try { Bank.inherit(parent, heir); } catch (e) { console.error(e); }
        try { Things.inherit(parent, heir); } catch (e) { console.error(e); }
        try { const pf = Rm.peek(parent)?.feats; if (pf?.starts) Rm.st(heir).feats.starts = [...pf.starts]; } catch { /* */ }
    });
}
