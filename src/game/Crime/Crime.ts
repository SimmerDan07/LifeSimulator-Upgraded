// v0.27.0 "The Crime Update": crime, the police, courts, prison, gangs and crime families (data in CrimeData.ts).
//
// - Crimes take the week. Success depends on the crime, your skills (tech jobs and degrees, martial arts, health,
//   vampire powers, a crew) and how hot the police already are. A failed crime can get you arrested on the spot.
// - Heat (0–100) is police attention. It cools by itself; laying low, bribes and good deeds cool it faster.
//   Every crime you get away with stays an open case: the hotter you are, the likelier the police come knocking.
//   Unsolved murders stay open for 20 years (MURDER_COLD_YEARS); detectives keep working them until then.
// - Court: plead guilty, take the public defender, hire a lawyer, defend yourself (if you're a lawyer), bribe the
//   judge (crime families), or turn State's witness (crime families: a new name, but they never forget).
// - Prison: real now. You live in a cell (your lease ends; homes you own wait for you), eat prison food, lose your
//   job (most of them), and spend the week in the yard. Parole for good behaviour, appeals, prison gangs,
//   escapes (fugitives get hunted until they leave the country or buy a new identity).
// - Records: convictions show up in background checks for 7 years (police, doctors, lawyers, teachers, nurses,
//   pilots…). Juvenile records are sealed at 18.
// - Gangs (14+): join one, rise from Prospect to Shot Caller, or start your own: recruit, take turf, collect.
// - Crime families (18+): from Associate to Don. A Don buys fronts, bribes the police chief and judges, and fights
//   off rival families and federal investigators.
// - Murder (18+): pick someone in your life and a method. They really die.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Housing } from "../Enums/Housing";
import { Diet } from "../Enums/Diet";
import { Trait } from "../Enums/Trait";
import { Possession } from "../Enums/Possession";
import { CompletableAction } from "../Enums/CompletableAction";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Constants } from "../Utils/Constants";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { LifeMoments } from "../Managers/LifeMoments";
import { Relationships } from "../Social/Relationships";
import { Vampire } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Activities } from "../World/Activities";
import { World } from "../World/World";
import { COUNTRY_BY_ID } from "../World/WorldData";
import { CRIMES, CRIME_BY_ID, CrimeDef, FAMILY_NAMES, FRONTS, GANG_NAMES, GANG_RANKS, GANG_RESPECT, MAFIA_RANKS, MAFIA_RESPECT, MURDER, MURDER_COLD_YEARS } from "./CrimeData";

export interface RecordEntry { crime: string; title: string; week: number; age: number; weeks: number; violent: boolean; juvenile: boolean; victims?: string[] }
export interface OpenCase { crime: string; title: string; week: number; violent: boolean; murder?: boolean; victim?: string; sentence: [number, number] }
export interface Org { kind: "gang" | "mafia"; name: string; rank: number; points: number; own: boolean; members: number; turf: number; fronts: string[]; since: number; waitWeeks?: number }
export interface JailInfo { weeks: number; total: number; served: number; crime: string; violent: boolean; juvenile: boolean; prevHousing: string | null; prevResidence: string | null; prevDiet: string | null; behavior: number; appealed?: boolean }
export interface CrimeData {
    heat: number; respect: number; record: RecordEntry[]; open: OpenCase[]; jail: JailInfo | null; fugitive: boolean;
    org: Org | null; prisonGang: boolean; bribeUntil: number; judgeBribed: boolean; ricoWeeks: number; marked: boolean;
    stats: { crimes: number; caught: number; earned: number; kills: number; escapes: number; served?: number };
    pendingFamily?: Org | null;
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const now = (p: any): number => { try { return p.calendarWeeks(); } catch { return 0; } };
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const roll = (x: number) => Math.random() < x;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const earn = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.misc, null, null, 12, null);
const spend = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.directSpend, null, null, 12, null);
export const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const alive = (x: any) => x != null && (x.getIsAlive?.() ?? true);
const years = (w: number) => { if (w < WPY()) return `${Math.max(1, Math.round(w))} week${Math.round(w) === 1 ? "" : "s"}`; const y = +(w / WPY()).toFixed(w < 10 * WPY() ? 1 : 0); return `${y} year${y === 1 ? "" : "s"}`; };
type Opt = [string, () => string];

export const LIFE_SENTENCE = 2400;   // 50 years
export const RECORD_YEARS = 7;
export const MIN_AGE = 13;

export const Crime = {
    sentenceHooks: [] as ((p: any) => number)[],
    // ------------------------------------------------------------------ state
    peek(p: any = player()): CrimeData | null { return p?.crime ?? null; },
    state(p: any = player()): CrimeData {
        const s = p.crime ?? (p.crime = {});
        s.heat ??= 0; s.respect ??= 0; s.record ??= []; s.open ??= []; s.jail ??= null; s.fugitive ??= false; s.org ??= null;
        s.prisonGang ??= false; s.bribeUntil ??= 0; s.judgeBribed ??= false; s.ricoWeeks ??= 0; s.marked ??= false;
        s.stats ??= { crimes: 0, caught: 0, earned: 0, kills: 0, escapes: 0 };
        return s;
    },
    inJail(p: any = player()): boolean { try { return !!p.getCrimeState().getIsInJail(); } catch { return false; } },
    heat(p: any = player()): number { return Crime.peek(p)?.heat ?? 0; },
    addHeat(p: any, n: number) {
        const s = Crime.state(p);
        const bribed = s.bribeUntil > now(p) && n > 0 ? 0.6 : 1;
        s.heat = clamp(s.heat + n * bribed, 0, 100);
    },
    heatLabel(h: number): string { return h >= 80 ? "Most Wanted" : h >= 60 ? "Hunted" : h >= 40 ? "Under investigation" : h >= 20 ? "On the radar" : h > 0 ? "Barely noticed" : "Clean"; },
    juvenile(p: any): boolean { return p.getAgeInYears() < 18; },
    justice(p: any): number { return COUNTRY_BY_ID[p.getCountry?.()?.name?.()]?.justice ?? 1; },
    /** Adult convictions that still show on background checks. */
    activeRecord(p: any): RecordEntry[] { const s = Crime.peek(p); if (!s) return []; return s.record.filter((r) => !r.juvenile && r.weeks > 0 && Crime.recordEnds(r) > now(p)); },
    /** A conviction shows up on background checks until 7 years after the sentence ends. */
    recordEnds(r: RecordEntry): number { return r.week + r.weeks + RECORD_YEARS * WPY(); },
    recordBlock(p: any): string | null {
        const s = Crime.peek(p);
        if (s?.fugitive) return "You're a wanted fugitive";
        const r = Crime.activeRecord(p);
        if (!r.length) return null;
        const last = r.reduce((a, b) => (Crime.recordEnds(b) > Crime.recordEnds(a) ? b : a));
        const left = Math.ceil((Crime.recordEnds(last) - now(p)) / WPY());
        return `Background check: ${last.title.toLowerCase()} conviction (clears in ${left} year${left === 1 ? "" : "s"})`;
    },
    /** Why you can't commit crimes right now. */
    block(p: any): string | null {
        if (p.getAgeInYears() < MIN_AGE) return `From age ${MIN_AGE}`;
        if (Vampire.isInTorpor(p)) return "You're lying collapsed somewhere";
        if (Crime.inJail(p)) return "You're in prison (the yard is in the Leisure tab)";
        return null;
    },

    // ------------------------------------------------------------------ odds
    techSkill(p: any): boolean {
        const job = p.getJobState().getCurrentJob()?.name?.() ?? "";
        if (["programmer", "cybersecurity", "dataScientist", "gameDeveloper", "uxDesigner"].includes(job)) return true;
        const done = (n: string) => { try { return p.getCompletableActionState().isCompleted((CompletableAction as any)[n]); } catch { return false; } };
        return done("college_computerScience") || done("dataScience") || done("cybersecurityCert") || done("gameDesign");
    },
    skillBonus(p: any, d: CrimeDef): number {
        let b = 0;
        const vamp = Vampire.isVampire(p);
        switch (d.skill) {
            case "tech": b += Crime.techSkill(p) ? 0.25 : 0; break;
            case "con": b += (p.hasTrait?.(Trait.cunning) ? 0.1 : 0) + (vamp && Vampire.has("hypnoticGaze", p) ? 0.2 : 0) + (vamp && Vampire.has("charm", p) ? 0.1 : 0); break;
            case "fight": b += Activities.fightBonus(p) + (p.getAttributeState().getHealth() - 50) / 500 + (vamp ? 0.2 : 0); break;
            case "stealth": b += (p.hasTrait?.(Trait.cunning) ? 0.1 : 0) + (vamp && (Vampire.has("mistStep", p) || Vampire.has("shadowStep", p)) ? 0.15 : 0); break;
            case "drive": b += p.getItemState().isOwned(Possession.car) ? 0.1 : 0; break;
        }
        const org = Crime.peek(p)?.org;
        if (d.crew) b += org ? (org.kind === "mafia" ? 0.3 : 0.2) : -0.15;
        if (p.getJobState().getCurrentJob()?.name?.() === "police") b += 0.1;   // you know how they think
        return b;
    },
    chance(p: any, d: CrimeDef): number { return clamp(d.odds + Crime.skillBonus(p, d) - Crime.heat(p) / 400, 0.05, 0.95); },
    caughtChance(p: any): number { return Vampire.isVampire(p) ? (Vampire.has("mistStep", p) ? 0.3 : Vampire.has("batForm", p) ? 0.4 : 0.5) : 0.55; },
    needsBlock(p: any, d: CrimeDef): string | null {
        if (p.getAgeInYears() < d.minAge) return `From age ${d.minAge}`;
        if (d.needs === "computer" && !(p.getItemState().isOwned(Possession.laptop) || p.getItemState().isOwned(Possession.laptop))) return "Needs a computer";
        if (d.needs === "car" && !p.getItemState().isOwned(Possession.car)) return "Needs a car";
        if ((d.needs === "job") && p.getJobState().getCurrentJob() == null) return "Needs a job";
        if (d.needs === "police" && p.getJobState().getCurrentJob()?.name?.() !== "police") return "Police officers only";
        return null;
    },

    // ------------------------------------------------------------------ committing a crime
    /** A week of crime. Returns the message shown. */
    commit(p: any, d: CrimeDef): string {
        const s = Crime.state(p);
        s.stats.crimes++;
        const ok = roll(Crime.chance(p, d));
        if (ok) {
            let take = Math.round(rnd(d.take[0], d.take[1]));
            let cut = "";
            if (d.crew && s.org && !s.org.own) { const c = Math.round(take * 0.3); take -= c; cut = ` (your ${s.org.kind === "mafia" ? "family" : "gang"} took ${money(c)})`; }
            if (take > 0) { earn(p, take); s.stats.earned += take; }
            Crime.addHeat(p, d.heat);
            s.respect += d.respect;
            if (s.org) Crime.orgPoints(p, d.respect * 2);
            s.open.push({ crime: d.id, title: d.title, week: now(p), violent: !!d.violent, sentence: d.sentence });
            attr(p, 0, 3, d.violent ? -4 : -2);
            if (Vampire.isVampire(p) && d.violent) { const v = Vampire.state(p); v.thirst = Math.max(0, v.thirst - 5); }
            return take > 0 ? `You got away with it: ${money(take)}${cut}. (Heat +${d.heat})` : `You got away with it. (Heat +${d.heat}, respect +${d.respect})`;
        }
        if (roll(Crime.caughtChance(p))) {
            Crime.arrest(p, [{ crime: d.id, title: d.title, week: now(p), violent: !!d.violent, sentence: d.sentence }], `You were caught: ${d.title.toLowerCase()}.`, d.fine);
            if (d.id === "embezzle") { try { p.getJobState().setCurrentJob(null); } catch { /* ignore */ } }
            if (d.needs === "police") { try { p.getJobState().setCurrentJob(null); } catch { /* ignore */ } }
            return "";
        }
        Crime.addHeat(p, Math.ceil(d.heat / 2));
        attr(p, 0, -2, -3);
        return `It went wrong, but you got away. Nothing to show for it. (Heat +${Math.ceil(d.heat / 2)})`;
    },

    // ------------------------------------------------------------------ arrests and court
    /** The police have you. `cases` are what you're charged with; open cases come along for the ride. */
    arrest(p: any, cases: OpenCase[], why: string, fine?: number) {
        const s = Crime.state(p);
        s.stats.caught++;
        // everything they can pin on you: the charges plus open cases (each extra one counts half)
        const all = [...cases];
        for (const c of s.open) if (!all.includes(c) && (c.murder || roll(0.5))) all.push(c);
        s.open = s.open.filter((c) => !all.includes(c));
        const juvenile = Crime.juvenile(p);
        const priors = s.record.filter((r) => !r.juvenile).length;
        let weeks = 0;
        all.forEach((c, i) => { weeks += rnd(c.sentence[0], c.sentence[1]) * (i === 0 ? 1 : 0.5); });
        weeks *= Crime.justice(p) * (juvenile ? 0.5 : 1) * (1 + Math.min(1, priors * 0.25));
        for (const h of Crime.sentenceHooks) weeks *= h(p);   // v0.33.0: a lawyer on retainer
        weeks = Math.min(LIFE_SENTENCE, Math.round(weeks));
        const violent = all.some((c) => c.violent);
        // the same crime several times reads "burgle a house (3 counts)"
        const counts = new Map<string, number>();
        for (const c of all) counts.set(c.title.toLowerCase(), (counts.get(c.title.toLowerCase()) ?? 0) + 1);
        const charges = [...counts].map(([t, n]) => (n > 1 ? `${t} (${n} counts)` : t)).join(", ");
        // parents hear about it
        if (juvenile) for (const x of Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]) if (alive(x) && x.getRelationship?.()?.name?.() === "parent") x.setRelationshipProgress(Math.max(0, x.getRelationshipProgress() - 50));
        Crime.celebrityArrest(p, all[0]?.title ?? "a crime");
        if (weeks === 0) {
            const f = fine ?? 300;
            spend(p, f);
            s.record.push({ crime: all[0].crime, title: all[0].title, week: now(p), age: p.getAgeInYears(), weeks: 0, violent, juvenile });
            Crime.addHeat(p, -10);
            Crime.alert("Busted", `${why}\n\nA first offence: you paid a ${money(f)} fine${juvenile ? " and your parents were called" : ""}.`, R.drawable.police_badge);
            return;
        }
        const lawyerFee = Math.round(Math.min(250000, 3000 + weeks * 150));
        const bribe = Math.round(Math.min(1000000, 20000 + weeks * 400));
        const job = p.getJobState().getCurrentJob();
        const isLawyer = job?.name?.() === "lawyer" && (p.getJobState().getCurrentJobState()?.getLevel?.() ?? 0) >= 3;
        const opts: Opt[] = [
            ["Plead guilty (30% less time)", () => Crime.convict(p, all, Math.round(weeks * 0.7), violent, juvenile)],
        ];
        if (isLawyer) opts.push(["Defend yourself (you're a lawyer)", () => roll(0.35) ? Crime.acquit(p, "You tore the prosecution apart. Not guilty!") : Crime.convict(p, all, Math.round(weeks * 0.75), violent, juvenile)]);
        if (cash(p) >= lawyerFee) opts.push([`Hire a top lawyer (${money(lawyerFee)})`, () => { spend(p, lawyerFee); return roll(0.35) ? Crime.acquit(p, "Your lawyer found a hole in the evidence. Not guilty!") : Crime.convict(p, all, Math.round(weeks * 0.6), violent, juvenile); }]);
        if (s.judgeBribed) opts.push(["Call in the judge you bribed", () => { s.judgeBribed = false; return roll(0.8) ? Crime.acquit(p, "The judge threw the case out. Funny how that works.") : Crime.convict(p, all, weeks, violent, juvenile); }]);
        else if (s.org?.kind === "mafia" && cash(p) >= bribe) opts.push([`Bribe the judge (${money(bribe)})`, () => { spend(p, bribe); if (roll(0.65)) return Crime.acquit(p, "Case dismissed. The judge has a new boat."); return Crime.convict(p, all, Math.round(weeks * 1.5), violent, juvenile, "The judge reported the bribe. Extra time for that."); }]);
        if (s.org) opts.push([`Turn State's witness (leave the ${s.org.kind === "mafia" ? "family" : "gang"})`, () => Crime.witness(p)]);
        opts.push(["Public defender (free)", () => roll(0.15) ? Crime.acquit(p, "The public defender pulled it off. Not guilty!") : Crime.convict(p, all, weeks, violent, juvenile)]);
        LifeMoments.ask("Arrested!", `${why}\nCharges: ${charges}.\nYou're facing about ${years(weeks)}${juvenile ? " in juvenile detention" : " in prison"}.`, R.drawable.police_badge, opts, { random: true });   // getting caught is a random event
    },
    convict(p: any, cases: OpenCase[], weeks: number, violent: boolean, juvenile: boolean, extra = ""): string {
        const s = Crime.state(p);
        weeks = Math.max(1, Math.round(weeks));
        const main = cases[0];
        const victims = cases.filter((c) => c.murder && c.victim).map((c) => c.victim!);
        s.record.push({ crime: main.crime, title: main.title, week: now(p), age: p.getAgeInYears(), weeks, violent, juvenile, ...(victims.length ? { victims } : {}) });
        s.heat = Math.min(s.heat, 10);
        Crime.sendToJail(p, weeks, main.title, violent, juvenile);
        const slayer = Crime.hooks.forfeit?.(p, cases) ?? null;   // v0.28.0: no inheriting from your victim
        return `${extra ? extra + " " : ""}Guilty. You were sentenced to ${years(weeks)}${juvenile ? " in juvenile detention" : ""}${weeks >= LIFE_SENTENCE ? " (life)" : ""}.${slayer ? " " + slayer : ""}`;
    },
    acquit(p: any, msg: string): string { Crime.addHeat(p, -30); attr(p, 0, 10, 5); return msg; },
    /** Turn State's witness: the charges go away, so does your organisation, and you get a new name. */
    witness(p: any): string {
        const s = Crime.state(p);
        const org = s.org;
        s.org = null; s.open = []; s.heat = 0; s.fugitive = false; s.marked = true;
        const old = p.getLastName();
        const fresh = pick(["Smith", "Walker", "Bennett", "Carter", "Hayes", "Morgan", "Reed", "Foster", "Brooks", "Ellis"]);
        try { p.lastName = fresh; } catch { /* ignore */ }
        return `You told the prosecutors everything about ${org?.name ?? "your old crew"}. The charges were dropped and you're in witness protection now: ${p.getFirstName()} ${old} became ${p.getFirstName()} ${fresh}. They never forget, though.`;
    },
    celebrityArrest(p: any, title: string) {
        try {
            const c = Celebrity.peek(p);
            if (!c || c.fans < 1000) return;
            const lost = Math.round(c.fans * 0.12);
            c.fans = Math.max(0, c.fans - lost);
            Crime.hooks.news?.(p, `${p.getFullName()} ARRESTED for ${title.toLowerCase()}!`);
        } catch { /* ignore */ }
    },

    // ------------------------------------------------------------------ prison
    sendToJail(p: any, weeks: number, crime: string, violent: boolean, juvenile: boolean) {
        const s = Crime.state(p);
        const cs = p.getCrimeState();
        let prevHousing: string | null = null, prevResidence: string | null = null, prevDiet: string | null = null;
        try { prevHousing = p.getHousingState().currentHousing().getType().name(); } catch { /* ignore */ }
        try { prevDiet = p.getDiet().name(); } catch { /* ignore */ }
        const lines: string[] = [];
        // your home: a lease ends (you can't pay rent from a cell); a home you own waits for you
        try {
            const pf = p.getRealEstate();
            prevResidence = pf.residence()?.id ?? null;
            if (pf.lease) lines.push("Your lease ended: you can't pay rent from a cell.");
            (pf as any).leaveHome(p);
            pf.reconcile?.(p);
        } catch { /* ignore */ }
        p.getHousingState().moveHere(Housing.jail);
        try { p.changeDiet(Diet.prisonFood); } catch { /* ignore */ }
        cs.isInJail = true;
        s.jail = { weeks, total: weeks, served: 0, crime, violent, juvenile, prevHousing, prevResidence, prevDiet, behavior: 0 };
        // your job: background-check careers fire you at once; any job is gone after a month away
        try {
            const job = p.getJobState().getCurrentJob();
            if (job != null && (weeks >= 4 || Crime.cleanJob(job))) {
                lines.push(`You lost your job as ${ExtensionsKt.aOrAn(p.getJobState().getCurrentJobState().getJobTitle())}.`);
                p.getJobState().setCurrentJob(null);
            }
        } catch { /* ignore */ }
        // a long sentence is hard on a relationship
        try {
            const partner = p.getFamilyState().getPartner();
            if (partner != null && alive(partner) && weeks >= 5 * WPY() && !Vampire.isTurned(partner) && roll(partner.getRelationshipProgress() > 700 ? 0.25 : 0.6)) {
                p.getFamilyState().breakUp();
                lines.push(`${partner.getFirstName()} couldn't wait ${years(weeks)}. They left you.`);
            }
        } catch { /* ignore */ }
        Crime.alert(juvenile ? "Juvenile Detention" : "Prison", `You'll serve ${years(weeks)}${weeks >= LIFE_SENTENCE ? " (a life sentence)" : ""}. Good behaviour can get you out early${violent ? " (violent crimes: after 85%)" : " (after two thirds)"}.\n\n${[...lines, "The Leisure tab is the prison yard now."].join("\n")}`, R.drawable.jail);
    },
    cleanJob(job: any): boolean { return Crime.hooks.cleanJob?.(job) ?? false; },
    release(p: any, how: "served" | "parole" | "escape" | "appeal" | "pardon") {
        const s = Crime.state(p);
        const j = s.jail;
        p.getCrimeState().isInJail = false;
        s.jail = null; s.prisonGang = false;
        let home = "";
        if (how === "escape") {
            p.getHousingState().moveHere(Housing.homeless);
            s.fugitive = true; s.heat = 100; s.stats.escapes++;
            (s as any).escapedWeek = now(p);   // v0.29.3: you get away first — no recapture in the week you escape
        } else {
            const pf = (() => { try { return p.getRealEstate(); } catch { return null; } })();
            const owned = j?.prevResidence && pf?.get?.(j.prevResidence);
            if (owned && pf.moveInto(p, j!.prevResidence) == null) home = "You went home.";
            else if (p.getAgeInYears() < 18 || j?.prevHousing === "parentsHouse") { p.getHousingState().moveHere(Housing.parentsHouse); home = "You moved back in with your parents."; }
            else { p.getHousingState().moveHere(Housing.homeless); home = "You have nowhere to live yet (Profile › Housing)."; }
        }
        try {
            const diets = p.getCountry().getDietOptions();
            const prev = j?.prevDiet ? (Diet as any)[j.prevDiet] : null;
            p.changeDiet(p.getAgeInYears() < 18 ? Diet.homeCooking : prev && diets.includes(prev) ? prev : diets[0]);
        } catch { /* ignore */ }
        const msg = how === "escape" ? "You're out! Every cop in the country is looking for you. Lay low, leave the country or buy a new identity."
            : how === "parole" ? `Released early on parole for good behaviour after ${years(j?.served ?? 0)}. ${home}`
            : how === "appeal" ? `Your appeal won: conviction overturned. ${home}` : `You've served your time. ${home}`;
        Crime.alert(how === "escape" ? "Escaped!" : "Released", msg, how === "escape" ? R.drawable.leisure_prison_escape : R.drawable.waving_hand);
    },
    addJailWeeks(p: any, n: number) {
        const j = Crime.state(p).jail;
        if (!j) return;
        j.weeks += n; j.total += n;
        // a short stay that grows past a month costs you your job, like a long sentence does
        try {
            if (j.total >= 4 && p.getJobState().getCurrentJob() != null) {
                const title = p.getJobState().getCurrentJobState().getJobTitle();
                p.getJobState().setCurrentJob(null);
                Crime.banner("Fired", `You've been away too long: you lost your job as ${ExtensionsKt.aOrAn(title)}.`);
            }
        } catch { /* ignore */ }
    },

    // ------------------------------------------------------------------ the week
    afterWeek(p: any) {
        const s = Crime.peek(p);
        if (s == null) return;
        if (Vampire.isInTorpor(p)) return;
        if (s.jail) { Crime.jailWeek(p, s); return; }
        const t = now(p);
        // heat cools
        let cool = 2;
        if (s.bribeUntil > t) cool += 2;
        if (s.org?.own) cool -= 1;
        s.heat = clamp(s.heat - cool, 0, 100);
        // old cases go cold: 5 years, murders after 20
        for (const c of s.open.filter((x) => x.murder && t - x.week >= MURDER_COLD_YEARS * WPY())) {
            Crime.banner("Case Closed", `After ${MURDER_COLD_YEARS} years, the police closed the case of ${c.victim}'s death. Unsolved.`);
        }
        s.open = s.open.filter((c) => t - c.week < (c.murder ? MURDER_COLD_YEARS : 5) * WPY());
        if (s.org) Crime.orgWeek(p, s);
        // fugitives get caught
        if (s.fugitive && t - ((s as any).escapedWeek ?? -99) > 1 && roll(0.06)) { Crime.recapture(p); return; }
        // detectives on open murder cases
        for (const c of s.open.filter((x) => x.murder)) {
            if (roll(0.012 + s.heat / 2000)) { Crime.arrest(p, [c], `Detectives connected you to the death of ${c.victim}.`); return; }
        }
        // the police knock (open cases and heat)
        if (s.open.length && s.heat >= 35 && roll((s.heat - 30) / 500)) { Crime.arrest(p, [s.open[0]], "The police knocked on your door with a warrant."); return; }
        // the family never forgets
        if (s.marked && roll(0.004)) Crime.hit(p);
    },
    jailWeek(p: any, s: CrimeData) {
        const j = s.jail!;
        j.weeks--; j.served++; j.behavior += 1;
        s.stats.served = (s.stats.served ?? 0) + 1;   // the original "Criminal" badge: more than 10 years inside
        if (j.weeks <= 0) { Crime.release(p, "served"); return; }
        const need = j.violent ? 0.85 : 2 / 3;
        if (j.served >= j.total * need && j.behavior >= j.served * 0.7 && j.total < LIFE_SENTENCE && roll(0.25)) { Crime.release(p, "parole"); return; }
        // a life sentence: parole board after 25 years
        if (j.total >= LIFE_SENTENCE && j.served >= 25 * WPY() && j.behavior >= j.served * 0.8 && roll(0.02)) { Crime.release(p, "parole"); return; }
        // prison life
        if (roll(0.03) && !Vampire.isVampire(p)) {
            if (s.prisonGang || roll(0.4 + Activities.fightBonus(p))) Crime.banner("Yard Fight", "Someone tried you in the yard. They regretted it.");
            else { attr(p, -10, -3, -3); Crime.banner("Yard Fight", "You got jumped in the yard (−10 health). Maybe join a prison gang, or train."); }
        }
        // vampires get thirsty in here
        if (Vampire.isVampire(p) && Vampire.state(p).thirst > 80 && roll(0.2)) {
            const v = Vampire.state(p); v.thirst -= 40; v.suspicion = Math.min(100, v.suspicion + 10);
            Crime.addJailWeeks(p, 24);
            Crime.alert("Lights Out", "The hunger won. Your cellmate is in the infirmary with two small holes in his neck. (+24 weeks, +10 Rumours)", R.drawable.icon_vamp_bite);
        }
    },
    recapture(p: any) {
        const s = Crime.state(p);
        s.fugitive = false;
        Crime.arrest(p, [{ crime: "escape", title: "Escape from Prison", week: now(p), violent: false, sentence: [48, 96] }, ...s.open.splice(0)], "A patrol car recognised you. The run is over.");
    },
    /** The family sends someone. */
    hit(p: any) {
        const s = Crime.state(p);
        if (Vampire.isVampire(p)) { s.marked = false; Crime.alert("A Visitor", "A hitman came for you. Bullets don't do much to you. He won't be telling anyone. They've stopped sending people.", R.drawable.skull); return; }
        if (roll(0.7 + Activities.fightBonus(p))) { attr(p, -30, -10, -10); Crime.alert("They Found You", "A hitman found you. You got away, barely (−30 health)."); return; }
        // v0.30.1: a hit no longer kills you outright — it can leave you close to it (only stats at zero kill)
        s.marked = false;
        attr(p, -60, -15, -15);
        Crime.alert("They Found You", "A hitman found you. You took two bullets and survived, barely (−60 health). They think you're dead — the family has stopped looking.", R.drawable.skull);
    },

    // ------------------------------------------------------------------ gangs and families
    orgName(kind: "gang" | "mafia", p: any): string {
        if (kind === "gang") return pick(GANG_NAMES);
        const c = p.getCountry?.()?.name?.();
        return pick(FAMILY_NAMES[c] ?? FAMILY_NAMES.default);
    },
    ranks(o: Org): string[] { return o.kind === "mafia" ? MAFIA_RANKS : GANG_RANKS; },
    rankTitle(o: Org): string { return Crime.ranks(o)[o.rank]; },
    thresholds(o: Org): number[] { return o.kind === "mafia" ? MAFIA_RESPECT : GANG_RESPECT; },
    joinGang(p: any): string {
        const s = Crime.state(p);
        s.org = { kind: "gang", name: Crime.orgName("gang", p), rank: 0, points: 0, own: false, members: 0, turf: 0, fronts: [], since: now(p) };
        Crime.addHeat(p, 5);
        return `You're in: a Prospect with the ${s.org.name}. Do jobs for them to rise.`;
    },
    startGang(p: any): string {
        const s = Crime.state(p);
        spend(p, 5000);
        s.org = { kind: "gang", name: Crime.orgName("gang", p), rank: 4, points: GANG_RESPECT[4], own: true, members: 6, turf: 1, fronts: [], since: now(p) };
        return `You started the ${s.org.name}: six members and one block of turf. You're the Shot Caller.`;
    },
    joinFamily(p: any): string {
        const s = Crime.state(p);
        const from = s.org?.kind === "gang" ? ` The family squared things with the ${s.org.name}.` : "";
        s.org = { kind: "mafia", name: Crime.orgName("mafia", p), rank: 0, points: 0, own: false, members: 0, turf: 0, fronts: [], since: now(p) };
        Crime.addHeat(p, 5);
        return `${s.org.name} took you in as an Associate.${from} Earn their respect.`;
    },
    leave(p: any): string {
        const s = Crime.state(p);
        const o = s.org!;
        s.org = null;
        if (o.kind === "mafia") { s.marked = true; return `You walked away from ${o.name}. Nobody walks away from ${o.name}.`; }
        if (roll(0.35)) { attr(p, -20, -5, -5); return `The ${o.name} jumped you on your way out (−20 health). You're out, though.`; }
        return `You left the ${o.name}. They let you go.`;
    },
    orgPoints(p: any, n: number) {
        const s = Crime.state(p);
        const o = s.org;
        if (!o || o.own) return;
        o.points += n;
        const th = Crime.thresholds(o);
        const top = o.kind === "mafia" ? 3 : 4;   // a Don is made by an event, not points
        while (o.rank < top && o.points >= th[o.rank + 1]) {
            o.rank++;
            if (o.kind === "gang" && o.rank === 4) { o.own = true; o.members = 10; o.turf = 2; Crime.alert("Shot Caller", `The ${o.name} is yours now. Ten members and two blocks of turf.`, R.drawable.possession_gun); }
            else Crime.banner("Promoted", `You're ${ExtensionsKt.aOrAn(Crime.rankTitle(o))} in the ${o.name} now.`);
        }
    },
    /** Weekly income (Player.collectWeeklyValues): your cut, the gang's turf, the family's fronts. */
    collectWeeklyValues(p: any) {
        const s = Crime.peek(p);
        const o = s?.org;
        if (!o || s!.jail || Vampire.isInTorpor(p)) return;
        const ms = p.getMoneyState();
        const income = (n: number, key: string) => MoneyState.updateMoney$default(ms, BigInteger.valueOf(Math.round(n)), MoneyUpdateType.passiveIncome, key, null, 8, null);
        if (o.kind === "gang") {
            if (o.own) income(o.turf * 600 + o.members * 25, `${o.name} (turf)`);
            else if (o.rank > 0) income(o.rank * 120, `${o.name} (your cut)`);
        } else {
            const fronts = o.fronts.map((f) => FRONTS.find((x) => x.id === f)).filter(Boolean) as typeof FRONTS;
            if (o.own) income(8000 + fronts.reduce((a, f) => a + f.income, 0), `${o.name} (the family's business)`);
            else if (o.rank > 0) income(o.rank * 400, `${o.name} (your cut)`);
        }
    },
    /** Weekly (after the week): heat from your organisation, rivals, the feds, the top job. */
    orgWeek(p: any, s: CrimeData) {
        const o = s.org!;
        if (o.kind === "gang") {
            Crime.addHeat(p, o.own ? 1 + o.turf * 0.5 : o.rank > 0 ? 1 : 0);
        } else {
            if (o.own) {
                const fronts = o.fronts.map((f) => FRONTS.find((x) => x.id === f)).filter(Boolean) as typeof FRONTS;
                Crime.addHeat(p, Math.max(0, 3 - fronts.reduce((a, f) => a + f.launder, 0) * 0.5));
                // the feds
                s.ricoWeeks = s.heat >= 70 ? s.ricoWeeks + 1 : Math.max(0, s.ricoWeeks - 1);
                if (s.ricoWeeks >= 10) { s.ricoWeeks = 0; Crime.arrest(p, [{ crime: "racketeering", title: "Racketeering", week: now(p), violent: true, sentence: [480, 1440] }], "The FBI raided every front you own. You're indicted for racketeering."); return; }
            } else if (o.rank > 0) Crime.addHeat(p, 1);
            // the top job
            if (!o.own && o.rank === 3) {
                o.waitWeeks = (o.waitWeeks ?? 0) + 1;
                if (o.points >= MAFIA_RESPECT[4] && o.waitWeeks >= 48 && roll(0.05)) {
                    o.rank = 4; o.own = true; o.fronts = ["pizzeria"];
                    Crime.alert("The Don Retires", `The old Don stepped down and named you his successor. You run ${o.name} now.`, R.drawable.possession_gun);
                }
            }
        }
        if (roll(0.025) && LifeMoments.canHappen(p)) Crime.orgEvent(p, o);
    },
    orgEvent(p: any, o: Org) {
        const kind = o.kind === "mafia" ? "family" : "gang";
        if (o.own) {
            const tribute = Math.round((o.kind === "mafia" ? 50000 : 3000) * (1 + o.turf * 0.2));
            LifeMoments.ask(o.kind === "mafia" ? "A Rival Family Moves In" : "Rival Gang", `A rival ${kind} is moving on your territory.`, R.drawable.possession_gun, [
                ["Fight back", () => {
                    if (roll(0.55 + Activities.fightBonus(p) + Math.min(0.2, o.members / 200) + (Vampire.isVampire(p) ? 0.15 : 0))) { o.members += 2; Crime.addHeat(p, 10); return "You won. They won't try that again. (+2 members, heat +10)"; }
                    o.members = Math.max(1, o.members - 3); if (o.turf > 1) o.turf--; attr(p, -15, -5, -5); Crime.addHeat(p, 15); return "It went badly. You lost people and turf (−15 health).";
                }],
                [`Pay them off (${money(tribute)})`, () => { if (cash(p) < tribute) return "You couldn't pay. They took a block of turf instead."; spend(p, tribute); return "Peace, for now."; }],
                ["Let them have a corner", () => { if (o.turf > 1) o.turf--; o.members = Math.max(1, o.members - 1); return "You gave ground. Your crew noticed."; }],
            ]);
            return;
        }
        LifeMoments.ask(`The ${o.name}`, `Your ${kind} needs someone to hold a package for a week. No questions.`, R.drawable.possession_gun, [
            ["Do it", () => { if (roll(0.85)) { Crime.orgPoints(p, 10); earn(p, 500 * (o.rank + 1)); return `Easy money (${money(500 * (o.rank + 1))}) and they noticed.`; } Crime.arrest(p, [{ crime: "possession", title: "Possession of Stolen Goods", week: now(p), violent: false, sentence: [24, 96] }], "The police searched your place."); return ""; }],
            ["Make an excuse", () => { Crime.orgPoints(p, -5); return "They didn't like that."; }],
        ]);
    },

    // ------------------------------------------------------------------ murder
    /** People you could kill: adults in your life (never children). */
    victims(p: any): any[] {
        const out: any[] = [];
        try { for (const x of Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]) if (alive(x) && x.getPetType?.() == null && !x.getNotYetBorn?.() && x.getAgeInYears() >= 18) out.push(x); } catch { /* ignore */ }
        try { for (const x of Relationships.circle(p).list()) if (alive(x) && x.getAgeInYears() >= 18 && !out.includes(x)) out.push(x); } catch { /* ignore */ }
        return out;
    },
    murder(p: any, victim: any, method: "poison" | "accident" | "ambush" | "drain" | "hitman"): string {
        const s = Crime.state(p);
        const name = victim.getFullName?.() ?? victim.getFirstName();
        const odds = { poison: 0.7, accident: 0.55, ambush: 0.85, drain: 0.95, hitman: 0.9 }[method] + (method === "ambush" ? Activities.fightBonus(p) : 0);
        const traced = { poison: 0.25, accident: 0.1, ambush: 0.45, drain: 0.15, hitman: 0.2 }[method];
        if (method === "hitman") spend(p, 50000);
        if (!roll(odds)) {
            victim.setRelationshipProgress?.(0);
            Crime.addHeat(p, 25);
            if (roll(0.6)) { Crime.arrest(p, [{ crime: "attemptedMurder", title: "Attempted Murder", week: now(p), violent: true, sentence: [240, 960] }], `${name} survived and went straight to the police.`); return ""; }
            return `${name} survived and has no idea it was you… probably. (Heat +25)`;
        }
        Crime.kill(p, victim);
        s.stats.kills++;
        s.respect += MURDER.respect;
        Crime.addHeat(p, Math.round(MURDER.heat * (traced + 0.5)));
        if (s.org) Crime.orgPoints(p, 40);
        const c: OpenCase = { crime: "murder", title: "Murder", week: now(p), violent: true, murder: true, victim: name, sentence: MURDER.sentence };
        if (roll(traced)) { Crime.arrest(p, [c], `The police traced ${name}'s death back to you.`); return ""; }
        s.open.push(c);
        if (method === "drain") { const v = Vampire.state(p); v.thirst = 0; v.suspicion = Math.min(100, v.suspicion + 15); }
        attr(p, 0, -10, Vampire.isVampire(p) ? -5 : -20);
        const how = { poison: "Poison in their drink", accident: "A tragic accident, the police said", ambush: "A dark street, no witnesses", drain: "Drained dry under a full moon", hitman: "The hitman was a professional" }[method];
        return `${how}. ${name} is dead. The case is open: detectives will work it for ${MURDER_COLD_YEARS} years. (Heat up; −${Vampire.isVampire(p) ? 5 : 20} sanity)`;
    },
    /** Kills a person in your life using the game's own death handling (inheritance, widowhood, funerals). */
    kill(p: any, x: any) {
        if (typeof x.die === "function" && x.getRelationship?.() != null) { x.die(); return; }
        x.isAlive = false;
        try { if (x.kind === "friend" || x.kind === "ex") Relationships.circle(p).remove(x.id); } catch { /* ignore */ }
    },

    // ------------------------------------------------------------------ moving, faking your death, heirs
    onMove(p: any): string | null {
        const s = Crime.peek(p);
        if (!s) return null;
        const lines: string[] = [];
        if (s.fugitive) {
            if (roll(0.7)) { s.fugitive = false; s.heat = 20; s.open = s.open.filter((c) => c.murder); lines.push("You slipped across the border. The police back home can't touch you here."); }
            else { setTimeout0(() => Crime.recapture(p)); lines.push("Airport security recognised your face…"); }
        } else if (s.heat > 0) { s.heat = Math.round(s.heat * 0.3); lines.push("A fresh start: the police here don't know you (heat −70%)."); }
        if (s.org && !s.org.own) { lines.push(`You left the ${s.org.name} behind.`); if (s.org.kind === "mafia") s.marked = true; s.org = null; }
        else if (s.org?.own) lines.push(`You run the ${s.org.name} from abroad now.`);
        return lines.join(" ") || null;
    },
    /** Faking your death (vampires): a new person with a clean slate. */
    fakeDeath(p: any): string {
        const s = Crime.peek(p);
        if (!s) return "";
        const had = s.record.length || s.open.length || s.fugitive || s.org;
        const org = s.org;
        Object.assign(s, { heat: 0, record: [], open: [], fugitive: false, org: null, marked: false, prisonGang: false, judgeBribed: false, ricoWeeks: 0 });
        return had ? `\n\nThe police closed your files: the dead don't stand trial.${org ? ` ${org.name} held a funeral for you.` : ""}` : "";
    },
    heir(parent: any, heir: any) {
        // the heir doesn't wake up in a cell
        try { if (heir.getHousingState().currentHousing().getType() === Housing.jail) heir.getHousingState().moveHere(heir.getAgeInYears() < 18 ? Housing.parentsHouse : Housing.homeless); } catch { /* ignore */ }
        try { heir.getCrimeState().isInJail = false; } catch { /* ignore */ }
        const s = Crime.peek(parent);
        if (s?.org?.own && heir.getAgeInYears() >= 18) {
            heir.crime = { pendingFamily: { ...s.org, since: now(heir), fronts: [...s.org.fronts] } };
        }
    },
    takeOver(p: any, accept: boolean): string {
        const s = Crime.state(p);
        const o = s.pendingFamily;
        s.pendingFamily = null;
        if (!o) return "";
        if (!accept) return `You walked away from the ${o.name}. They let you, out of respect for your parent.`;
        s.org = o;
        Crime.addHeat(p, 20);
        return `You run the ${o.name} now, like your parent did.`;
    },

    // ------------------------------------------------------------------ the prison yard (Leisure tab) and prison events
    leisureEvent(p: any, action: any, ev: any, escapeSuccess?: any): any {
        const name = action?.name?.();
        if (name === "prisonEscape") {
            // v0.29.3: Shadow Step always works — even when the escape roll came up with no event at all
            // (it used to fall through to "a guard caught you in the vent", +12 weeks)
            if (Vampire.isVampire(p) && Vampire.has("shadowStep", p)) return escapeSuccess ?? (ev?.constructor as any)?.prison_escape_success ?? ev;
        }
        if (name === "prisonRiot" && ev?.name?.() === "prison_riot_beatenUp" && (Crime.state(p).prisonGang || roll(Activities.fightBonus(p) * 3))) return (ev.constructor as any).prison_riot_kungfu;
        return ev;
    },
    afterLeisureEvent(p: any, action: any, ev: any) {
        const name = action?.name?.();
        const s = Crime.peek(p);
        if (!s?.jail) return;
        if (name === "prisonRiot") s.jail.behavior -= 6;
        if (name === "smokeCigarette" || name === "stareAtWall") s.jail.behavior += 1;
        if (name === "prisonEscape") {
            const extra = ev?.getJailTimeModifier?.() ?? 0;
            if (ev?.name?.() === "prison_escape_success") { setTimeout0(() => Crime.release(p, "escape")); return; }
            if (extra > 0) { Crime.addJailWeeks(p, extra); s.jail.behavior -= 20; return; }
            if (ev == null) { Crime.addJailWeeks(p, 12); s.jail.behavior -= 10; Crime.banner("Caught", "A guard caught you in the vent. (+12 weeks)"); }
        }
    },

    // ------------------------------------------------------------------ helpers
    hooks: {} as { news?: (p: any, text: string) => void; cleanJob?: (job: any) => boolean; forfeit?: (p: any, cases: OpenCase[]) => string | null },
    alert(title: string, msg: string, image: any = R.drawable.police_badge) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
    },
    banner(title: string, msg: string) { try { LifeMoments.banner(title, msg); } catch { /* no UI */ } },
    years,
    earn(p: any, n: number) { earn(p, n); },
};
/** Run after the current alert/week finishes (the arrest flow opens its own alert). */
function setTimeout0(f: () => void) { try { f(); } catch { /* ignore */ } }
void CRIMES; void CRIME_BY_ID; void World;
