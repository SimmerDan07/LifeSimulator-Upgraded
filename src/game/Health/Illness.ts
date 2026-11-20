// v0.28.0 Illnesses: catching them, living with them, treating them (Health tab). Data in IllnessData.ts.
//
// - Each week (Player.applyWeekly → Illness.afterWeek) you might catch one new illness. The chance is the illness's
//   `base` times its risk factors (Illness.risk): the season, your age, kids in the house or school, your diet, the
//   gym, smoking and drinking, being homeless or in prison, the climate, your job, overwork, low health or mood,
//   and your family history (an heir's parent's chronic and serious illnesses).
// - Symptoms are weekly modifiers (Illness.collectWeeklyValues). Acute illnesses clear up after a few weeks;
//   chronic ones stay until cured, or until you manage them (daily medication: a weekly cost, no symptoms, no
//   complications). Hidden ones (blood pressure, diabetes, heart disease, early cancer) give no symptoms until a
//   checkup finds them or they get worse. Cancer has four stages; untreated it spreads every 24 weeks.
// - Treatments cost money (your country's public healthcare pays most of it outside the US; health insurance pays
//   70% of the rest; parents pay for kids; the prison infirmary is free). Courses take weeks, then the odds roll.
// - Vampires are dead: they catch nothing, and the bite cures everything. Dying of an illness names it.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Housing } from "../Enums/Housing";
import { CompletableAction } from "../Enums/CompletableAction";
import { LifeMoments } from "../Managers/LifeMoments";
import { Seasons } from "../Managers/Seasons";
import { Hobbies } from "../Managers/Hobbies";
import { Subscriptions } from "../Managers/Subscriptions";
import { Vampire } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { World as CelebWorld } from "../Lifepaths/CelebrityWorld";
import { Careers } from "../Careers/Careers";
import { Relationships } from "../Social/Relationships";
import { climateOf } from "../World/WorldData";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { Utils } from "../Utils/Utils";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GenericListType } from "../Fragments/GenericListType";
import { HEALTHCARE, ILLNESS_BY_ID, ILLNESS_DEFS, INSURANCE_COVERS, IllnessDef, TreatDef } from "./IllnessData";

export interface Ill {
    id: string;
    since: number;            // calendar week it started
    left?: number;            // acute: weeks until it clears up by itself
    detected: boolean;        // symptoms (or a checkup) told you about it
    stage?: number;           // cancer
    stageAt?: number;         // week the stage last changed
    managed?: boolean;        // chronic: on daily medication
    course?: { id: string; left: number };
    why?: string;
}
export interface IllnessState {
    list: Ill[];
    history: { id: string; age: number; outcome: string }[];
    immune: string[];
    shotYear: number;
    checkupWeek: number;
    overwork: number;
    drinks: number;
    smokes: number;
    cured: number;
    familyHistory: string[];
}

const WPY = 48;
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const now = (p: any): number => { try { return p.calendarWeeks(); } catch { return 0; } };
const roll = (x: number) => Math.random() < x;
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null, 62, null);
const img = (d: IllnessDef) => (R.drawable as any)[d.image] ?? (R.drawable as any)[d.fallback];
const inJail = (p: any) => { try { return !!p.getCrimeState().getIsInJail(); } catch { return false; } };
const homeless = (p: any) => { try { return p.getHousingState().currentHousing().getType() === Housing.homeless; } catch { return false; } };
const atParents = (p: any) => { try { return p.getHousingState().currentHousing().getType() === Housing.parentsHouse; } catch { return false; } };
const SICK_DIETS = ["fastfood", "cupnoodle", "scavenge"];
const GOOD_DIETS = ["balanced", "vegan", "seafood", "homeCooking", "sushi"];

export const Illness = {
    peek(p: any = player()): IllnessState | null { return p?.illness ?? null; },
    state(p: any = player()): IllnessState {
        const s = p.illness ?? (p.illness = {});
        s.list ??= []; s.history ??= []; s.immune ??= []; s.familyHistory ??= [];
        s.shotYear ??= -1; s.checkupWeek ??= -999; s.overwork ??= 0; s.drinks ??= 0; s.smokes ??= 0; s.cured ??= 0;
        return s as IllnessState;
    },
    def(id: string): IllnessDef { return ILLNESS_BY_ID[id]; },
    /** Vampires are dead: nothing to catch. */
    immune(p: any = player()): boolean { return Vampire.isVampire(p); },
    funded(id: string, p: any = player()): boolean { const a = (CompletableAction as any)[id]; if (a == null) return false; try { return p.getCompletableActionState().isCompleted(a); } catch { return false; } },
    list(p: any = player()): Ill[] { return Illness.peek(p)?.list ?? []; },
    has(id: string, p: any = player()): boolean { return Illness.list(p).some((x) => x.id === id); },
    known(p: any = player()): Ill[] { return Illness.list(p).filter((x) => x.detected); },
    stageOf(x: Ill): number { return x.stage ?? 1; },

    // ------------------------------------------------------------------ who pays
    /** Share of a medical bill you pay: 0 for kids at home and prisoners, the country's share, minus insurance. */
    payShare(p: any = player()): number {
        if (inJail(p)) return 0;
        if (p.getAgeInYears() < 18 && atParents(p)) return 0;
        let share = HEALTHCARE[p.getCountry().name()] ?? 1;
        if (Subscriptions.has("healthInsurance", p)) share *= 1 - INSURANCE_COVERS;
        return share;
    },
    price(t: TreatDef, p: any = player()): number { return Math.round(t.cost * Illness.payShare(p)); },
    whoPays(p: any = player()): string {
        if (inJail(p)) return "The prison infirmary treats you for free.";
        if (p.getAgeInYears() < 18 && atParents(p)) return "Your parents pay your medical bills.";
        const share = HEALTHCARE[p.getCountry().name()] ?? 1;
        const ins = Subscriptions.has("healthInsurance", p);
        if (share >= 1) return ins ? `No public healthcare in ${p.getCountry().getTitle()}, but your health insurance pays ${Math.round(INSURANCE_COVERS * 100)}% of every bill.` : `No public healthcare in ${p.getCountry().getTitle()}: you pay every bill. Health insurance (Profile › Subscriptions) pays ${Math.round(INSURANCE_COVERS * 100)}%.`;
        return `Public healthcare in ${p.getCountry().getTitle()} pays ${Math.round((1 - share) * 100)}% of every bill${ins ? `, and your insurance pays ${Math.round(INSURANCE_COVERS * 100)}% of the rest` : ""}.`;
    },

    // ------------------------------------------------------------------ risk
    risk(p: any, d: IllnessDef): number {
        const age = p.getAgeInYears();
        if (d.minAge != null && age < d.minAge) return 0;
        if (d.maxAge != null && age > d.maxAge) return 0;
        const s = Illness.state(p);
        const season = (() => { try { return Seasons.season(p); } catch { return "spring"; } })();
        const climate = (() => { try { return climateOf(p.getCountry().name()); } catch { return "temperate"; } })();
        const attrs = p.getAttributeState();
        const diet = p.getDiet?.()?.name?.() ?? "";
        const job = p.getJobState?.()?.getCurrentJob?.();
        const jobName = job?.name?.() ?? "";
        const careerDef = job != null ? Careers.def(job) : null;
        const kidsAtHome = (() => { try { return (Array.from(p.getFamilyState().getAliveChildren() as any) as any[]).some((c) => !c.getNotYetBorn() && c.getAgeInYears() < 13); } catch { return false; } })();
        let base = d.base, m = 1;
        for (const r of d.risk ?? []) {
            const n = Number(r.replace(/^[a-zA-Z]+/, "")) || 0;
            const key = r.replace(/\d+$/, "");
            switch (key) {
                case "winter": if (season === "winter") m *= n || 3; else if (season === "summer") m *= 0.4; break;
                case "summer": if (season === "summer") m *= n || 2; break;
                case "spring": if (season === "spring") m *= n || 3; else m *= 0.3; break;
                case "kids": if (kidsAtHome) m *= 1.6; break;
                case "school": if (age >= 5 && age <= 17) m *= 2; break;
                case "lowHealth": if (attrs.getHealth() < 40) m *= 2; break;
                case "homeless": if (homeless(p)) m *= n || 2; break;
                case "jail": if (inJail(p)) m *= n || 2; break;
                case "old": if (age >= 60) m *= n || 2; break;
                case "elderly": if (age >= 65) m *= 3; break;
                case "aging": m *= Math.min(12, Math.max(0.15, ((age - 20) / 20) ** 2)); break;
                case "fluShot": if (s.shotYear === Math.floor(now(p) / WPY)) m *= 0.3; break;
                case "smoker": if (s.smokes > 20) m *= 3; break;
                case "smokerOnly": base = s.smokes > 50 ? 0.0006 : 0; break;
                case "junkFood": if (SICK_DIETS.includes(diet)) m *= n || 2; else if (GOOD_DIETS.includes(diet)) m *= 0.7; break;
                case "scavenge": if (diet === "scavenge") m *= 3; break;
                case "fit": if (Subscriptions.has("gym", p)) m *= 0.6; if (Hobbies.skill("running", p) >= 20) m *= 0.7; break;
                case "stress": if (attrs.getSanity() < 40) m *= 2; if (s.overwork > 6) m *= 1.5; break;
                case "sad": if (attrs.getHappiness() < 40) m *= n || 2; break;
                case "lonely": if (Relationships.friends(p).length === 0 && p.getFamilyState().getPartner() == null) m *= 1.5; break;
                case "tropical": if (climate === "tropical") m *= 3; break;
                case "tropicalOnly": base = climate === "tropical" ? (d.id === "dengue" ? 0.002 : 0.0015) : 0; break;
                case "outdoors": if (careerDef?.outdoor) m *= 1.5; break;
                case "onlyFromActivities": base = 0; break;
                case "active": if (Subscriptions.has("gym", p) || age < 16) m *= 1.4; break;
                case "manualJob": if (["trades"].includes(Careers.categoryOf?.(job) ?? "") || ["constructionWorker", "farmer"].includes(jobName)) m *= 3; break;
                case "firefighter": if (jobName === "firefighter") m *= 20; break;
                case "cook": if (["chef", "burgerFlipper", "sushiChef", "pastryChef"].includes(jobName)) m *= 5; break;
                case "frostbite": base = season === "winter" && climate === "cold" && homeless(p) ? 0.01 : 0; break;
                case "heatstroke": base = season === "summer" && (climate === "desert" || climate === "tropical") && (homeless(p) || careerDef?.outdoor) ? 0.006 : 0; break;
                case "dogOwner": try { if ((Array.from(p.getFamilyState().getPets() as any) as any[]).some((x) => x.getIsAlive() && x.getPetType?.()?.name?.() === "dog")) m *= 5; } catch { /* ignore */ } break;
                case "nightShift": if (careerDef?.night) m *= 2; break;
                case "drinker": base = s.drinks > 60 ? 0.0008 * Math.min(4, s.drinks / 60) : 0; break;
                case "cold": if (climate === "cold") m *= 1.5; break;
                case "overwork": base = s.overwork > 8 ? 0.01 * (s.overwork - 8) : 0; break;
                case "swim": break;
            }
        }
        if (s.familyHistory.includes(d.id)) m *= 2;
        // your philanthropy pays off (Bank tab): Disease Eradication and Cancer Research
        if (Illness.funded("diseaseEradicationPolio", p) && (d.id === "measles" || d.id === "tuberculosis" || d.id === "chickenpox")) m *= 0.2;
        if (Illness.funded("diseaseEradicationMalaria", p) && (d.id === "malaria" || d.id === "dengue")) m *= 0.1;
        if (Illness.funded("cancerResearch", p) && (d.id === "cancer" || d.id === "leukemia")) m *= 0.5;
        return base * m;
    },

    // ------------------------------------------------------------------ getting sick
    canCatch(d: IllnessDef, p: any = player()): boolean {
        if (Illness.immune(p) || Illness.has(d.id, p)) return false;
        if (d.once && Illness.state(p).immune.includes(d.id)) return false;
        const age = p.getAgeInYears();
        return !(d.minAge != null && age < d.minAge) && !(d.maxAge != null && age > d.maxAge);
    },
    /** Catch an illness now (`why` is shown: "from skiing", "your son brought it home"). */
    catch(p: any, id: string, why?: string, quiet = false): Ill | null {
        const d = Illness.def(id);
        if (d == null || !Illness.canCatch(d, p)) return null;
        const s = Illness.state(p);
        const x: Ill = { id, since: now(p), detected: !d.hidden, why };
        if (d.weeks) x.left = rnd(d.weeks[0], d.weeks[1]);
        if (d.stages) { x.stage = 1; x.stageAt = now(p); }
        s.list.push(x);
        if (d.once) s.immune.push(id);
        if (!quiet && x.detected) Illness.announce(p, x);
        return x;
    },
    announce(p: any, x: Ill) {
        const d = Illness.def(x.id);
        const how = x.why ? ` (${x.why})` : "";
        if (d.emergency || d.kind === "serious" || d.mods[0] <= -5) {
            Illness.treatDialog(p, x, `${d.title}!${how}`);
            try { if (Celebrity.fans(p) >= 50000) CelebWorld.news(p, `${p.getFullName()} rushed to hospital`); } catch { /* ignore */ }
        } else if (d.kind === "chronic" || d.kind === "mental") {
            LifeMoments.result(`Diagnosed: ${d.title}`, `${d.blurb}${how}\n\nIt's on your Health tab, with what you can do about it.`, img(d));
        } else LifeMoments.banner(`You have ${/^[AEIOU]/.test(d.title) ? "an" : "a"} ${d.title.toLowerCase()}`, `${d.blurb}${how} See the Health tab.`);
    },

    // ------------------------------------------------------------------ the week
    collectWeeklyValues(p: any) {
        const s = Illness.peek(p);
        if (!s || !s.list.length || Illness.immune(p)) return;
        let h = 0, ha = 0, sa = 0;
        for (const x of s.list) {
            const d = Illness.def(x.id);
            if (d == null || !x.detected) continue;
            if (x.managed && d.manage) {
                if (!inJail(p)) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(d.manage.weekly * Illness.payShare(p))), MoneyUpdateType.expense, d.manage.title, null, 8, null);
                continue;
            }
            const k = (x.course ? 0.5 : 1) * (d.stages ? Illness.stageOf(x) ** 1.3 : 1);
            h += d.mods[0] * k; ha += d.mods[1] * k; sa += d.mods[2] * k;
        }
        if (h || ha || sa) p.getAttributeState().setDeltaValue(new Modifiers(Math.round(h), Math.round(ha), Math.round(sa)), "Illness");
    },
    afterWeek(p: any) {
        try { if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) return; } catch { return; }
        const s = Illness.state(p);
        if (Illness.immune(p)) {
            if (s.list.length) { Illness.cureAll(p, "vampire"); LifeMoments.banner("Nothing Can Make You Sick", "Your body is dead now. Every illness you had is gone, and nothing will ever make you sick again."); }
            return;
        }
        const t = now(p);
        s.overwork = Math.max(0, s.overwork - 0.25);
        for (const x of [...s.list]) {
            const d = Illness.def(x.id);
            if (d == null) { s.list.splice(s.list.indexOf(x), 1); continue; }
            // a course of treatment
            if (x.course) {
                x.course.left--;
                if (x.course.left <= 0) { Illness.finishCourse(p, x); continue; }
            }
            // hidden: symptoms show up
            if (!x.detected && d.hidden && t - x.since >= d.hidden) { x.detected = true; Illness.announce(p, x); }
            // cancer spreads
            if (d.stages && !x.course && (x.stage ?? 1) < d.stages && t - (x.stageAt ?? x.since) >= (d.stageWeeks ?? 24)) {
                x.stage = (x.stage ?? 1) + 1; x.stageAt = t;
                if (!x.detected && x.stage >= 2) { x.detected = true; Illness.announce(p, x); }
                else if (x.detected) LifeMoments.result(`${d.title}: Stage ${x.stage}`, x.stage >= 4 ? "It has spread. Treat it now: time is running out." : "It's getting worse. Treatment works best early.", img(d));
            }
            // acute: clears up by itself
            if (x.left != null && !x.course) {
                x.left--;
                if (x.left <= 0) { Illness.cure(p, x, "got better"); if (d.kind !== "mental" || x.detected) LifeMoments.banner("Feeling Better", `Your ${d.title.toLowerCase()} is gone.`); continue; }
            }
            // untreated: it can get worse
            if (d.after && x.detected && !x.course && !x.managed && roll(d.after.chance)) {
                const nx = Illness.catch(p, d.after.id, `after untreated ${d.title.toLowerCase()}`);
                if (nx && d.kind === "infection") Illness.cure(p, x, "turned worse");
            }
            if (d.after && !x.detected && !x.managed && roll(d.after.chance / 2)) Illness.catch(p, d.after.id, `you never knew you had ${d.title.toLowerCase()}`);
        }
        // catch something new (one at a time)
        const kidsAtHome = (() => { try { return (Array.from(p.getFamilyState().getAliveChildren() as any) as any[]).filter((c) => !c.getNotYetBorn() && c.getAgeInYears() >= 3 && c.getAgeInYears() < 13); } catch { return []; } })();
        const pool = ILLNESS_DEFS.filter((d) => Illness.canCatch(d, p)).sort(() => Math.random() - 0.5);
        for (const d of pool) {
            if (!roll(Illness.risk(p, d))) continue;
            let why: string | undefined;
            if (d.contagious && kidsAtHome.length && roll(0.5)) { const k = kidsAtHome[Math.floor(Math.random() * kidsAtHome.length)]; why = `${k.getFirstName()} brought it home from school`; }
            else if (d.contagious && inJail(p)) why = "it's going around the cell block";
            Illness.catch(p, d.id, why);
            break;
        }
    },

    // ------------------------------------------------------------------ getting better
    cure(p: any, x: Ill, outcome = "cured") {
        const s = Illness.state(p);
        const i = s.list.indexOf(x);
        if (i >= 0) s.list.splice(i, 1);
        s.history.push({ id: x.id, age: p.getAgeInYears(), outcome });
        if (s.history.length > 60) s.history.splice(0, s.history.length - 60);
        if (outcome === "cured" || outcome === "got better") s.cured++;
        if (x.id === "cancer" && outcome === "cured") { try { (p as any).cancerSurvivor = true; } catch { /* ignore */ } }
    },
    cureAll(p: any, outcome: string) { for (const x of [...Illness.list(p)]) Illness.cure(p, x, outcome); },
    /** Treatments you can get for this illness right now. */
    options(p: any, x: Ill): TreatDef[] {
        const d = Illness.def(x.id);
        const st = Illness.stageOf(x);
        return d.treat.filter((t) => (t.minStage == null || st >= t.minStage) && (t.maxStage == null || st <= t.maxStage));
    },
    odds(p: any, x: Ill, t: TreatDef): number {
        let o = t.odds;
        const d = Illness.def(x.id);
        if (d.stages) o -= 0.15 * (Illness.stageOf(x) - 1);
        if (t.id === "therapy" && Subscriptions.has("therapist", p)) o += 0.15;
        if ((x.id === "cancer" || x.id === "leukemia") && Illness.funded("cancerResearch", p)) o += 0.15;
        if (t.id === "rest" && p.getAgeInYears() >= 70) o -= 0.15;
        return Math.max(0.05, Math.min(0.99, o));
    },
    treat(p: any, x: Ill, t: TreatDef): string {
        const d = Illness.def(x.id);
        const cost = Illness.price(t, p);
        if (cost > cash(p)) return `You can't afford ${t.title.toLowerCase()} (${money(cost)}).`;
        if (cost > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(-cost), MoneyUpdateType.directSpend, t.title, null, 8, null);
        if (t.weeks) {
            x.course = { id: t.id, left: t.weeks };
            return `${t.title} started${cost ? ` (${money(cost)})` : ""}. ${t.weeks} week${t.weeks === 1 ? "" : "s"} to go: your symptoms are halved meanwhile.`;
        }
        if (roll(Illness.odds(p, x, t))) { Illness.cure(p, x); return `It worked: your ${d.title.toLowerCase()} is gone.${cost ? ` (${money(cost)})` : ""}`; }
        if (x.left != null) x.left = Math.max(1, x.left - 1);
        return `It helped a little, but you're still sick.${cost ? ` (${money(cost)})` : ""}`;
    },
    finishCourse(p: any, x: Ill) {
        const d = Illness.def(x.id);
        const t = d.treat.find((y) => y.id === x.course!.id);
        x.course = undefined;
        if (t == null) return;
        if (roll(Illness.odds(p, x, t))) {
            Illness.cure(p, x);
            LifeMoments.result(d.id === "cancer" || d.id === "leukemia" ? "Cancer-Free!" : "Treatment Worked", d.id === "cancer" || d.id === "leukemia" ? "The scans are clear. You beat it." : `${t.title} is done, and your ${d.title.toLowerCase()} is gone.`, img(d));
        } else {
            x.stageAt = now(GameStateManager.INSTANCE.getPersonState());
            LifeMoments.result("Treatment Didn't Work", `${t.title} is done, but you still have ${d.title.toLowerCase()}. You can try again, or try something else.`, img(d));
        }
    },
    manage(p: any, x: Ill, on: boolean) { x.managed = on; },

    treatDialog(p: any, x: Ill, title?: string) {
        const d = Illness.def(x.id);
        const opts: [string, () => string][] = [];
        for (const t of Illness.options(p, x)) {
            const c = Illness.price(t, p);
            if (c > cash(p)) continue;
            opts.push([`${t.title}${c ? ` ($${c.toLocaleString("en-US")})` : t.cost ? " (covered)" : " (free)"} · ${Math.round(Illness.odds(p, x, t) * 100)}%`, () => Illness.treat(p, x, t)]);
        }
        if (d.manage && !x.managed) opts.push([`Manage it: ${d.manage.title} ($${Math.round(d.manage.weekly * Illness.payShare(p)).toLocaleString("en-US")}/week)`, () => { x.managed = true; return `You're on ${d.manage!.title.toLowerCase()} now: no symptoms while you keep taking it.`; }]);
        if (d.manage && x.managed) opts.push([`Stop ${d.manage.title}`, () => { x.managed = false; return "You stopped your medication. The symptoms are back."; }]);
        opts.push([d.emergency ? "Tough it out (dangerous)" : "Not now", () => ""]);
        const body = `${d.blurb}${d.stages ? `\nStage ${Illness.stageOf(x)} of ${d.stages}.` : ""}\n${Illness.whoPays(p)}${opts.length === 1 ? "\nYou can't afford any treatment right now." : ""}`;
        // with pop-ups off, an emergency gets the first treatment you can afford; anything else waits on the Health tab
        LifeMoments.ask(title ?? d.title, body, img(d), opts, { quiet: d.emergency && opts.length > 1 ? "positive" : "negative" });
    },

    // ------------------------------------------------------------------ prevention
    checkupPrice(p: any = player()): number { return Math.round(200 * Illness.payShare(p)); },
    checkup(p: any = player()): string {
        const c = Illness.checkupPrice(p);
        if (c > cash(p)) return "You can't afford a checkup right now.";
        if (c) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(-c), MoneyUpdateType.directSpend, "Checkup", null, 8, null);
        const s = Illness.state(p);
        s.checkupWeek = now(p);
        const found = s.list.filter((x) => !x.detected);
        for (const x of found) x.detected = true;
        if (found.length) return `The tests found ${found.map((x) => Illness.def(x.id).title.toLowerCase()).join(" and ")}. Catching it early makes treatment work better: see your Health tab.`;
        const warn: string[] = [];
        for (const id of ["highBloodPressure", "diabetes", "heartDisease", "cancer"]) if (!Illness.has(id, p) && Illness.risk(p, Illness.def(id)) > Illness.def(id).base * 2.5) warn.push(Illness.def(id).title.toLowerCase());
        const known = Illness.known(p).map((x) => Illness.def(x.id).title.toLowerCase());
        const head = known.length ? `Nothing new. (You already know about your ${known.join(", ")}.)` : "A clean bill of health.";
        return `${head}${warn.length ? ` The doctor says you're at higher risk of ${warn.join(", ")}: better food and the gym help.` : ""}`;
    },
    fluShotPrice(p: any = player()): number { return Math.round(30 * Illness.payShare(p)); },
    hadFluShot(p: any = player()): boolean { return Illness.state(p).shotYear === Math.floor(now(p) / WPY); },
    fluShot(p: any = player()): string {
        const c = Illness.fluShotPrice(p);
        if (c > cash(p)) return "You can't afford it right now.";
        if (c) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(-c), MoneyUpdateType.directSpend, "Flu Shot", null, 8, null);
        Illness.state(p).shotYear = Math.floor(now(p) / WPY);
        return "A quick pinch. Your chance of the flu this year is much lower.";
    },

    // ------------------------------------------------------------------ hooks from elsewhere
    /** Work (JobState.work): all-nighters wear you down. */
    onWork(p: any, action: string) {
        if (Illness.immune(p)) return;
        const s = Illness.state(p);
        s.overwork = Math.max(0, s.overwork + (action === "veryHard" ? 1.5 : action === "hard" ? 0.6 : -0.5));
        if (s.overwork > 8 && roll(0.04 * (s.overwork - 8))) Illness.catch(p, "burnout", "too many all-nighters");
    },
    /** Leisure (Player.leisureAction): smoking, drinking and risky fun. */
    onLeisure(p: any, l: any) {
        if (Illness.immune(p)) return;
        const s = Illness.state(p);
        const name = l?.name?.() ?? "";
        const a = l?.act?.();
        if (name === "smokeCigarette") s.smokes++;
        if (["grab_drinks", "pub", "izakaya"].includes(name) || a?.drink) s.drinks++;
        else s.drinks = Math.max(0, s.drinks - 0.2);
        const id = a?.id ?? name;
        const chance = (x: number, ill: string, why: string) => { if (roll(x)) Illness.catch(p, ill, why); };
        if (a?.effect === "risky") chance(0.03, Math.random() < 0.5 ? "brokenArm" : Math.random() < 0.5 ? "brokenLeg" : "concussion", `from ${a.title.toLowerCase().replace(/^go /, "")}`);
        if (name === "ski" || id === "snowboarding") chance(0.03, Math.random() < 0.6 ? "brokenLeg" : "sprainedAnkle", "on the slopes");
        if (["hiking", "goCamping", "camping", "safari", "fishing"].includes(id)) { chance(0.01, "lymeDisease", "a tick in the woods"); try { if (climateOf(p.getCountry().name()) === "tropical") chance(0.02, "malaria", "a mosquito bite outdoors"); } catch { /* ignore */ } }
        if (["soccerMatch", "basketball", "martialArts", "tennis", "iceSkatingRink", "trampolinePark", "iceHockey", "badminton"].includes(id)) chance(0.015, "sprainedAnkle", `playing ${a?.title?.toLowerCase?.() ?? "sports"}`);
        if (a?.cat === "food" || ["streetFoodTour", "foodFestival"].includes(id)) chance(0.02, "foodPoisoning", "something at the food stalls");
        if (["swimming", "scubaDiving", "surfing", "waterPark"].includes(id) && p.getAgeInYears() <= 12) chance(0.03, "earInfection", "water in the ear");
        if (name === "prisonRiot") chance(0.08, Math.random() < 0.5 ? "concussion" : "brokenArm", "in the riot");
    },
    /** The original Health tab treatments (already paid for) can clear up what you have. */
    onHealthEvent(p: any, ev: string) {
        if (Illness.immune(p)) return;
        const odds: Record<string, (d: IllnessDef) => number> = {
            selfTreatment: (d) => (d.kind === "infection" && d.mods[0] > -5 ? 0.3 : 0),
            doctorVisit: (d) => (d.kind === "infection" || d.kind === "injury" ? 0.6 : 0),
            hospitalStay: (d) => (d.kind === "infection" || d.kind === "injury" ? 0.85 : d.kind === "serious" && !d.stages ? 0.7 : 0),
            mindfulMeditation: (d) => (d.id === "insomnia" || d.id === "anxiety" ? 0.15 : 0),
            psychiatristVisit: (d) => (d.kind === "mental" ? 0.3 : 0),
            takeAntidepressantPills: (d) => (d.id === "depression" || d.id === "anxiety" ? 0.2 : 0),
            experimentalTreatment: (d) => (d.kind === "chronic" ? 0 : d.stages ? 0.3 : 0.5),
            chemotherapy: (d) => (d.stages ? 0.4 : 0),
        };
        const f = odds[ev];
        if (!f) return;
        const healed: string[] = [];
        for (const x of [...Illness.known(p)]) {
            const d = Illness.def(x.id);
            if (d && roll(f(d) - (d.stages ? 0.1 * (Illness.stageOf(x) - 1) : 0))) { Illness.cure(p, x); healed.push(d.title.toLowerCase()); }
        }
        if (healed.length) LifeMoments.banner("Feeling Better", `That cleared up your ${healed.join(" and ")}.`);
    },
    /** What killed you (Obituary): the worst illness you had, if any was hurting you. */
    deathCause(p: any): string | null {
        let worst: IllnessDef | null = null, w = 0;
        for (const x of Illness.known(p)) {
            const d = Illness.def(x.id);
            if (d == null || x.managed) continue;
            const hit = -d.mods[0] * (d.stages ? Illness.stageOf(x) ** 1.3 : 1);
            if (hit > w) { w = hit; worst = d; }
        }
        return worst && w >= 3 ? worst.title : null;
    },
    /** Heirs (Generations): a parent's chronic and serious illnesses run in the family. */
    inherit(parent: any, heir: any) {
        const ps = Illness.peek(parent);
        if (!ps) return;
        const ids = new Set<string>([...(ps.familyHistory ?? [])]);
        for (const h of [...ps.history.map((x) => x.id), ...ps.list.map((x) => x.id)]) { const d = Illness.def(h); if (d && (d.kind === "chronic" || d.kind === "serious") && !d.emergency) ids.add(h); }
        if (ids.size) Illness.state(heir).familyHistory = [...ids];
    },

    // ------------------------------------------------------------------ the Health tab
    cells(p: any = player()): any[] {
        const out: any[] = [];
        if (Illness.immune(p)) {
            out.push(new ActionCellSingleViewModel(R.drawable.lifepath_vampire, "Immune to Illness", text("You're dead: no cold, flu, cancer or heart attack can touch you."), ButtonViewModel.INSTANCE.getHidden(), null, null));
            return out;
        }
        const known = Illness.known(p);
        out.push(new HeaderTitleViewModel(known.length ? "Conditions" : "Illness & Prevention"));
        for (const x of known) {
            const d = Illness.def(x.id);
            const bits: string[] = [d.blurb];
            if (x.why) bits.push(`Caught: ${x.why}.`);
            if (d.stages) bits.push(`Stage ${Illness.stageOf(x)} of ${d.stages}.`);
            if (x.course) bits.push(`Under treatment: ${x.course.left} week${x.course.left === 1 ? "" : "s"} to go.`);
            else if (x.managed && d.manage) bits.push(`Managed with ${d.manage.title.toLowerCase()} (${money(Math.round(d.manage.weekly * Illness.payShare(p)))}/week): no symptoms.`);
            else if (x.left != null) bits.push(`Should pass in about ${x.left} week${x.left === 1 ? "" : "s"}.`);
            else if (d.kind === "chronic") bits.push("It won't go away on its own.");
            const k = (x.managed ? 0 : 1) * (x.course ? 0.5 : 1) * (d.stages ? Illness.stageOf(x) ** 1.3 : 1);
            const fx = [["health", d.mods[0]], ["happiness", d.mods[1]], ["sanity", d.mods[2]]].filter(([, v]) => Math.round((v as number) * k)).map(([n, v]) => `${Math.round((v as number) * k)} ${n}`);
            if (fx.length) bits.push(`Every week: ${fx.join(", ")}.`);
            out.push(new ActionCellSingleViewModel(img(d), d.title, text(bits.join("\n")),
                x.course ? ButtonViewModel.INSTANCE.getHidden() : new ButtonViewModel("Treat", null, true, false, false, false, false, { invoke: () => { Illness.treatDialog(p, x); return null; } }), null, null));
        }
        if (!known.length) out.push(new ActionCellSingleViewModel(R.drawable.health_workout, "No Illnesses", text(`You're not sick. ${Illness.whoPays(p)}`), ButtonViewModel.INSTANCE.getHidden(), null, null));
        else out.push(new ActionCellSingleViewModel(R.drawable.health_doctorvisit, "Medical Bills", text(Illness.whoPays(p)), ButtonViewModel.INSTANCE.getHidden(), null, null));
        const ck = Illness.checkupPrice(p);
        const sinceCheck = now(p) - Illness.state(p).checkupWeek;
        out.push(new ActionCellSingleViewModel(R.drawable.health_doctorvisit, "Get a Checkup",
            text(`Blood tests and a once-over: finds silent illnesses (blood pressure, diabetes, heart disease, early cancer) before they hurt you.${sinceCheck < WPY ? " You had one this year." : " Once a year is wise from 40."}`),
            new ButtonViewModel(ck ? money(ck) : "Go", null, ck <= cash(p), false, ck > cash(p), false, false, { invoke: () => { LifeMoments.result("Checkup", Illness.checkup(p), R.drawable.health_doctorvisit); return null; } }), null, null));
        const shot = Illness.hadFluShot(p);
        const fc = Illness.fluShotPrice(p);
        out.push(new ActionCellSingleViewModel(R.drawable.health_pills, "Get a Flu Shot", text(shot ? "Done for this year: 70% less likely to catch the flu." : "70% less likely to catch the flu this year. Best before winter."),
            new ButtonViewModel(shot ? "Done" : fc ? money(fc) : "Go", null, !shot && fc <= cash(p), false, shot || fc > cash(p), false, false, { invoke: () => { if (!Illness.hadFluShot(p)) LifeMoments.result("Flu Shot", Illness.fluShot(p), R.drawable.health_pills); return null; } }), null, null));
        const hist = Illness.state(p).history.length;
        out.push(new ActionCellSingleViewModel(R.drawable.health_choosemenu, "Medical History", text(hist ? `${hist} illness${hist === 1 ? "" : "es"} so far.${Illness.state(p).familyHistory.length ? " Family history noted." : ""}` : "Nothing yet."),
            new ButtonViewModel("Open", null, true, false, false, false, false, { invoke: () => { Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, "health-history", false, 4, null); return null; } }), null, null));
        return out;
    },
    historyCells(p: any = player()): any[] {
        const s = Illness.state(p);
        const out: any[] = [new HeaderTitleViewModel("Medical History")];
        if (s.familyHistory.length) out.push(new ActionCellSingleViewModel(R.drawable.family, "Family History", text(`Runs in your family: ${s.familyHistory.map((id) => Illness.def(id)?.title).filter(Boolean).join(", ")}. Twice the usual risk: checkups catch these early.`), ButtonViewModel.INSTANCE.getHidden(), null, null));
        if (s.smokes > 20 || s.drinks > 40) out.push(new ActionCellSingleViewModel(R.drawable.health_low, "Habits", text([s.smokes > 20 ? "You smoke: lung and heart risk." : "", s.drinks > 40 ? "You drink a lot: liver risk." : ""].filter(Boolean).join(" ")), ButtonViewModel.INSTANCE.getHidden(), null, null));
        if (!s.history.length) out.push(new ActionCellSingleViewModel(R.drawable.health_workout, "Nothing Yet", text("You've never been ill."), ButtonViewModel.INSTANCE.getHidden(), null, null));
        for (const h of [...s.history].reverse()) {
            const d = Illness.def(h.id);
            if (!d) continue;
            out.push(new ActionCellSingleViewModel(img(d), d.title, text(`Age ${h.age}: ${h.outcome}.`), ButtonViewModel.INSTANCE.getHidden(), null, null));
        }
        return out;
    },
};
void ILLNESS_DEFS;
