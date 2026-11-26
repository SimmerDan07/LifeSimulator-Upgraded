// The Vampire lifepath (v0.15.0), following the plan doc "Vampire Lifepath — Plan".
//
// Becoming: 18+, out of jail. A pale stranger (2% a week at Nightclubs and Local Events) or Seek the Ancient
// ($5,000 a try, 25%) reveals the path; Accept the Bite turns you over one week (health drops to 50%).
// Living: your body stops ageing (true age and the calendar keep going).
// High thirst hurts. v0.22.0: the bar takes 2 years to fill on Feed by Hand; at 100 you collapse for 10–40 years, lose half your
// cash, blood power and your job (a mortal partner moves on), and wake Withered. Sunlight drains your mood (v0.21.1: not your health).
// v0.21.1: nothing mortal can lower a vampire's health (AttributeState.healthGuard); only starving and hunters' stakes
// can. Well-fed vampires heal +3 health a week.
// Suspicion grows from hunting, frenzies and never ageing; at 80+ vampire hunters may come.
// Blood power (1 a year, +1 every 10 years) buys six powers. Tell loved ones your secret; turn them (3 blood power).
// Vampires can't have biological children. Endings: the Vampiric Cure (the reworked Elixir of Youth) or Final Rest.
// v0.16.0: the Vampiric Cure costs $300 billion; one vampire life per lifetime (no turning again after the Cure);
// a vampire's health never decays (only vampire dangers hurt it); blood diets replace food diets.
import { TrueAge } from "../Managers/TrueAge";
import { seasonForMonth } from "../World/WorldData";
import { ArrayList, BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { AlertActionViewModel } from "../Managers/AlertActionViewModel";
import { AlertType } from "../Managers/AlertType";
import { AttributeState } from "../Managers/AttributeState";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { NameGenerator } from "../Managers/NameGenerator";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { PersonAttribute } from "../Enums/PersonAttribute";
import { Leisure } from "../Enums/Leisure";
import { Sex } from "../Enums/Sex";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Constants } from "../Utils/Constants";
import { Relationships } from "../Social/Relationships";
import { SocialPerson } from "../Social/SocialPerson";
import { VampireState } from "./VampireState";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(n), true);
const roll = (p: number) => Math.random() < p;
const refreshUI = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };
const cash = (p: any) => p.getMoneyState().getCash();
const pay = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));

export interface PowerDef { id: string; title: string; cost: number; image: any; blurb: string }
export const POWERS: PowerDef[] = [
    { id: "charm", title: "Charm", cost: 1, image: R.drawable.icon_power_charm, blurb: "Dating works more often; relationship gains +25%." },
    { id: "nightOwl", title: "Night Owl", cost: 1, image: R.drawable.icon_power_nightowl, blurb: "You work night shifts: no sunlight at work and 20% more pay (not in outdoor jobs)." },
    { id: "bloodBank", title: "Blood Bank Contact", cost: 2, image: R.drawable.icon_power_bloodbank, blurb: "Unlocks Buy from a Blood Bank." },
    { id: "mistStep", title: "Mist Step", cost: 2, image: R.drawable.icon_power_miststep, blurb: "Hunting no longer risks police trouble." },
    { id: "sunWard", title: "Sun Ward", cost: 3, image: R.drawable.icon_power_sunward, blurb: "Sunlight drains you half as much." },
    { id: "mindFog", title: "Mind Fog", cost: 3, image: R.drawable.icon_power_mindfog, blurb: "Suspicion drops by 5 by itself every week." },
    // v0.26.0: eight more powers
    { id: "beastTongue", title: "Beast Tongue", cost: 1, image: R.drawable.icon_power_beast, blurb: "Animals adore you: Rats & Strays costs no happiness, and vets, zookeepers and marine biologists get +2 happiness a week at work." },
    { id: "glamour", title: "Glamour", cost: 2, image: R.drawable.icon_power_glamour, blurb: "You show up in mirrors and photos: selfies are safe and the paparazzi never catch anything strange." },
    { id: "batForm", title: "Bat Form", cost: 2, image: R.drawable.icon_power_batform, blurb: "Fly off into the night: hunting raises suspicion half as much, and +20% to beat vampire hunters." },
    { id: "shadowStep", title: "Shadow Step", cost: 2, image: R.drawable.icon_power_shadowstep, blurb: "Vanish into the shadows: Lay Low takes 25 suspicion off and costs no happiness, and fleeing vampire hunters no longer costs you your job." },
    { id: "ancientScholar", title: "Ancient Scholar", cost: 2, image: R.drawable.icon_power_scholar, blurb: "Centuries of reading: degrees, trainings, skills and languages take 25% less time." },
    { id: "bloodAlchemy", title: "Blood Alchemy", cost: 3, image: R.drawable.icon_power_alchemy, blurb: "Your body wastes nothing: thirst rises 25% slower on any diet." },
    { id: "regeneration", title: "Regeneration", cost: 3, image: R.drawable.icon_power_regen, blurb: "Wounds close as you watch: +2 more healing a week, and a Withered body recovers twice as fast." },
    { id: "hypnoticGaze", title: "Hypnotic Gaze", cost: 4, image: R.drawable.icon_power_gaze, blurb: "Your boss can't say no: promotions come twice as fast (you still need the degree)." },
];

/** Leisure that happens in daylight (burns a vampire). */
const DAYTIME = new Set(["goToPark", "goCamping", "local_vacation", "international_vacation", "luxury_vacation", "ski", "watchSoccer", "badminton", "bullfightingShow"]);

const STARVING = "Starving for blood";

export interface BloodDiet {
    id: string; title: string; image: any; cost: number;
    /** Thirst change per week (Feed by Hand: +15). */
    thirst: number;
    mods: [number, number, number];
    suspicion?: number;
    blurb: string;
    lock?: (p: any) => string | null;
}
/** What a vampire lives on every week (the Health tab's Choose Menu and the Lifepaths Feeding section). */
/** v0.22.0: thirst per week that fills the bar (0 → 100) in two years (48-week years). */
export const THIRST_2_YEARS = 100 / 96;
/** v0.22.0: after a collapse, health can't go above this while your body is Withered. */
export const WITHERED_CAP = 50;
export const WITHERED_WEEKS = 96;
export const BLOOD_DIETS: BloodDiet[] = [
    { id: "hand", title: "Feed by Hand", image: R.drawable.icon_vamp_feedbyhand, cost: 0, thirst: THIRST_2_YEARS, mods: [0, 0, 0],
        blurb: "No plan: you feed yourself with the Feeding actions." },
    { id: "rats", title: "Rats & Strays", image: R.drawable.vdiet_rats, cost: 0, thirst: THIRST_2_YEARS / 2, mods: [0, -3, 0],
        blurb: "Free, but grim and never enough." },
    { id: "butcher", title: "Butcher's Blood", image: R.drawable.vdiet_butcher, cost: 300, thirst: -3, mods: [0, -1, 0],
        blurb: "Pig and cow blood from the butcher. Keeps you going." },
    { id: "bags", title: "Blood Bank Bags", image: R.drawable.vdiet_bloodbag, cost: 2000, thirst: -10, mods: [1, 0, 0],
        blurb: "Human blood, delivered cold and discreet.",
        lock: (p) => (Vampire.has("bloodBank", p) || Vampire.hasMedicalJob(p) ? null : "Needs the Blood Bank Contact power or a medical job") },
    { id: "hunting", title: "Nightly Hunting", image: R.drawable.icon_vamp_hunt, cost: 0, thirst: -20, mods: [0, 2, 0], suspicion: 4,
        blurb: "Free and fresh, but people notice. 5% chance of police trouble a week (none with Mist Step)." },
    { id: "donors", title: "Willing Donors", image: R.drawable.icon_vamp_donors, cost: 8000, thirst: -15, mods: [0, 3, 2], suspicion: 1,
        blurb: "A private club of people who like being bitten." },
    { id: "vintage", title: "Rare Vintage", image: R.drawable.vdiet_vintage, cost: 50000, thirst: -20, mods: [2, 6, 4],
        blurb: "Aged blood from the finest cellars. Only the oldest vampires can afford it." },
];

export const Vampire = {
    minAge: 18,
    thirstPerWeek: THIRST_2_YEARS,
    /** Health a well-fed vampire (thirst under 60) heals every week. */
    healPerWeek: 3,
    /** Set while a vampire danger (a hunter's stake) is hurting you, so the health guard lets it through. */
    harming: false,
    turnCost: 3,            // blood power to turn someone
    curePrice: 300_000_000_000,
    cureName: "Vampiric Cure",
    cureWeeks: 4,
    image: R.drawable.lifepath_vampire,

    // ------------------------------------------------------------------ state
    state(p: any = player()): VampireState {
        if (p.vampire == null) p.vampire = new VampireState();
        return p.vampire;
    },
    peek(p: any = player()): VampireState | null { return p?.vampire ?? null; },
    isVampire(p: any = player()): boolean { return !!Vampire.peek(p)?.isVampire; },
    isTurning(p: any = player()): boolean { return (Vampire.peek(p)?.turningWeeks ?? 0) > 0; },
    /** Your body doesn't age this week (a vampire, or in the turning week). */
    frozen(p: any = player()): boolean { return Vampire.isVampire(p); },
    has(power: string, p: any = player()): boolean { return Vampire.isVampire(p) && (Vampire.peek(p)?.powers ?? []).includes(power); },
    years(p: any = player()): number { return Math.floor((Vampire.peek(p)?.vampireWeeks ?? 0) / WPY()); },
    /** Added to the age for the calendar (month, new years). */
    calendarOffset(p: any): number { return p?.vampire?.calendarOffset ?? 0; },
    canBecome(p: any = player()): string | null {
        if (p?.vampire?.cured) return "You've already lived your one vampire life";
        if (p.getAgeInYears() < Vampire.minAge) return `Must be at least ${Vampire.minAge}`;
        if (p.getCrimeState().getIsInJail()) return "Not while you're in jail";
        return null;
    },

    // ------------------------------------------------------------------ people (turned / knows the secret)
    knows(person: any): boolean { return !!Relationships.meta(person).knows; },
    isTurned(person: any): boolean {
        try { return !!GameStateManager.INSTANCE.getPersonState()?.getSocial?.()?.metaFor(person.getId()).vampire; } catch { return false; }
    },
    /** Coven: vampire friends you met plus everyone you turned. */
    // ------------------------------------------------------------------ Eternal Bond (v0.17.0)
    /** You and your partner are both vampires: an Eternal Bond. */
    bondedPartner(p: any = player()): any {
        if (!Vampire.isVampire(p)) return null;
        const partner = p.getFamilyState?.()?.getPartner?.();
        return partner != null && partner.getIsAlive() && Vampire.isTurned(partner) ? partner : null;
    },
    bonded(p: any = player()): boolean { return Vampire.bondedPartner(p) != null; },
    /** Hunt Together (a partner action): −50 thirst, +6 suspicion, 10% police trouble unless Mist Step. */
    huntTogether(p: any) {
        const s = Vampire.state(p);
        s.thirst = Math.max(0, s.thirst - 50);
        s.suspicion = Math.min(100, s.suspicion + 6);
        if (!Vampire.has("mistStep", p) && roll(0.1)) {
            pay(p, 2000);
            s.suspicion = Math.min(100, s.suspicion + 10);
            Vampire.hooks.police?.(p); Vampire.alert("Police Trouble", `Someone saw the two of you. You paid ${money(2000)} in "fines" (suspicion +10).`, R.drawable.police_badge);
        }
    },
    /** Chance of beating the hunters (better with your bonded partner at your side). */
    fightWinChance(p: any = player()): number { return Math.min(0.95, (Vampire.bonded(p) ? 0.7 : 0.5) + (Vampire.has("batForm", p) ? 0.2 : 0) + (Vampire.hooks.fight?.(p) ?? 0)); },
    /** v0.26.0 Ancient Scholar: every third week of study counts twice (25% less time). */
    studyBonus(p: any = player()): number {
        if (!Vampire.isVampire(p) || !Vampire.has("ancientScholar", p)) return 0;
        const s = Vampire.state(p); s.studyWeeks = ((s.studyWeeks ?? 0) + 1) % 3;
        return s.studyWeeks === 0 ? 1 : 0;
    },
    /** v0.26.0 Hypnotic Gaze: an extra week of promotion progress for every week worked. */
    promotionBonus(p: any = player()): number { return Vampire.isVampire(p) && Vampire.has("hypnoticGaze", p) ? 1 : 0; },
    /** v0.26.0 Glamour: photos and mirrors show you. */
    photogenic(p: any = player()): boolean { return !Vampire.isVampire(p) || Vampire.has("glamour", p); },
    /** Vampires you turned (not your partner, not coven friends): each one raises suspicion by 2 a year. */
    turnedLovedOnes(p: any = player()): any[] {
        const partner = p.getFamilyState?.()?.getPartner?.();
        return Vampire.coven(p).filter((x: any) => x !== partner && x.metAt !== "coven");
    },
    coven(p: any = player()): any[] {
        const out: any[] = [];
        for (const x of Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]) if (x.getIsAlive() && Vampire.isTurned(x)) out.push(x);
        for (const s of Relationships.circle(p).list()) if (s.getIsAlive() && s.kind !== "ex" && Vampire.isTurned(s)) out.push(s);
        return out;
    },

    // ------------------------------------------------------------------ becoming
    /** Nightclub / Local Event: the pale stranger. */
    maybeStranger(p: any, event: any) {
        if (!event || !["nightClub", "localEvent"].includes(event.name())) return;
        const s = Vampire.state(p);
        if (s.discovered || s.isVampire || Vampire.canBecome(p) != null) return;
        if (!roll(0.02)) return;
        s.discovered = true;
        Vampire.alert("A Pale Stranger", "Someone pale and strangely beautiful watched you all night. As you left, they whispered: \"Eternity is yours, if you want it.\" A new path has opened in the Lifepaths tab.");
    },
    seek(p: any = player()) {
        const s = Vampire.state(p);
        s.seekTries++;
        if (roll(0.25)) {
            s.discovered = true;
            Vampire.alert("You Found Them", "After weeks of rumours, an ancient vampire agrees to meet you. The choice is yours now.");
        } else {
            Vampire.alert("No Trace", "You chased whispers through the night and found nothing. Maybe next time.");
        }
    },
    acceptBite(p: any = player()) {
        const s = Vampire.state(p);
        s.turningWeeks = 1;
        const h = p.getAttributeState().getHealth();
        if (h > 50) attr(p, -(h - 50), 0, 0);
    },
    /** End of the turning week. */
    rise(p: any) {
        const s = Vampire.state(p);
        s.turningWeeks = 0;
        s.isVampire = true;
        s.turnedAtWeeks = p.getAgeInWeeks();
        s.turnedTrueWeek = p.getTrueAgeInWeeks();
        s.thirst = 0; s.suspicion = 0; s.weeksAtMaxThirst = 0; s.cureWeeks = 0;
        try { Vampire.hooks.rise?.(p); } catch { /* ignore */ }
        s.bloodPower = Math.max(s.bloodPower, 1);
        if (Vampire.hooks.risen) { Vampire.hooks.risen(p); return; }   // v0.35.0: the first hunger
        Vampire.alert("You Rise a Vampire", `You wake up hungry and ageless. You'll stay ${p.getAgeInYears()} forever, but you need blood every week and the sun is no longer your friend. Your Lifepaths tab is your home now.`, Vampire.image);
    },

    // ------------------------------------------------------------------ weekly
    /** The week passes while frozen: true age and calendar move, your body doesn't. */
    tickFrozen(p: any) {
        const s = Vampire.state(p);
        p.addTrueAgeWeeks(1);   // v0.29.2: exact, however old
        s.calendarOffset++;
        s.vampireWeeks++;
        Vampire.hooks.tick?.(p);   // v0.35.0: blood age (torpor counts half)
    },
    /** Weekly attribute effects (also used for the weekly previews; no side effects). */
    collectWeeklyValues(p: any) {
        const s = Vampire.peek(p);
        if (!s?.isVampire || s.cureWeeks > 0 || s.inTorpor) return;
        // v0.22.0: gentler (it now takes two years to fill the bar; at 100 you collapse instead of dying)
        // v0.35.0: Hunger stages (Hungry 60+: −1 happiness; Starving 80+: −2 happiness, −3 sanity)
        if (s.thirst >= 80) p.getAttributeState().setDeltaValue(new Modifiers(0, -2, -3), "Hunger: Starving");
        else if (s.thirst >= 60) p.getAttributeState().setDeltaValue(new Modifiers(0, -1, 0), "Hunger: Hungry");
        const sunburn = (s as any).rb?.sunburnWeeks ?? 0;
        if (sunburn > 0) p.getAttributeState().setDeltaValue(new Modifiers(0, -2, 0), "Sunburned");
        if (s.weeksAtMaxThirst >= 4) p.getAttributeState().setDeltaValue(new Modifiers(-25, 0, 0), STARVING);
        // the blood diet: weekly cost and how it makes you feel
        const d = Vampire.diet(p);
        const two = Vampire.bonded(p);
        const label = "Blood Supply - " + d.title + (two && d.cost > 0 ? " (for two)" : "");
        if (d.cost > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(d.cost * (two ? 2 : 1)), MoneyUpdateType.expense, label, null, 8, null);
        const dm = Vampire.dietMods(p, d);
        p.getAttributeState().setDeltaValue(new Modifiers(dm[0], dm[1], dm[2]), label);
        // v0.21.1: undead bodies mend themselves while fed
        // v0.22.0: after a collapse your body is Withered for two years: no healing, health capped at 50
        if ((s.witheredWeeks ?? 0) > 0) p.getAttributeState().setDeltaValue(new Modifiers(0, -1, 0), "Withered body");
        else if (s.thirst < (Vampire.hooks.week ? 30 : 60) && s.weeksAtMaxThirst === 0 && p.getAttributeState().getHealth() < Vampire.healthCap(p))
            p.getAttributeState().setDeltaValue(new Modifiers(Vampire.healPerWeek + (Vampire.has("regeneration", p) ? 2 : 0) + ((s as any).rb?.line === "ironblood" ? 2 : 0), 0, 0), "Vampire healing");
    },
    /** v0.35.0: burns from the sun cap your health at 60 until they heal. */
    healthCap(p: any): number { return ((p?.vampire?.rb?.burnWeeks ?? 0) > 0) ? 60 : 100; },
    /** A vampire's health never decays: only vampire dangers (starving, hunters) can lower it. */
    protectHealth(p: any) {
        if (!Vampire.isVampire(p)) return;
        const list: any = p.getAttributeState().getDeltaThisWeek(PersonAttribute.health);
        for (let i = list.size() - 1; i >= 0; i--) {
            const pair = list.get(i);
            const v = pair.getSecond();
            const n = typeof v === "number" ? v : Number(v?.doubleValue?.() ?? v);
            if (n < 0 && pair.getFirst() !== STARVING) list.removeAt(i);
        }
    },

    // ------------------------------------------------------------------ blood diets
    /** The diet in effect this week (paused while curing or in jail; falls back to Feed by Hand if it's locked). */
    diet(p: any = player()): BloodDiet {
        const s = Vampire.peek(p);
        const hand = BLOOD_DIETS[0];
        if (!s?.isVampire || s.cureWeeks > 0) return hand;
        try { if (p.getCrimeState().getIsInJail()) return hand; } catch { /* ignore */ }
        const d = BLOOD_DIETS.find((x) => x.id === (s.diet ?? "hand")) ?? hand;
        return d.lock?.(p) ? hand : d;
    },
    chosenDiet(p: any = player()): BloodDiet { return BLOOD_DIETS.find((x) => x.id === (Vampire.peek(p)?.diet ?? "hand")) ?? BLOOD_DIETS[0]; },
    /** Thirst change per week on your current diet (Feed by Hand: +15). */
    thirstPerWeekFor(p: any = player()): number { return Vampire.thirstRate(p, Vampire.diet(p)); },
    /** v0.26.0: Blood Alchemy slows a rising thirst by 25%. */
    thirstRate(p: any, d: BloodDiet): number {
        let t = d.thirst > 0 && Vampire.has("bloodAlchemy", p) ? d.thirst * 0.75 : d.thirst;
        if (Vampire.hooks.rate) t = Vampire.hooks.rate(p, d, t);   // v0.35.0: bloodline, Ancient Blood, Golconda, the Velvet Court
        return t;
    },
    dietMods(p: any, d: BloodDiet): [number, number, number] { return d.id === "rats" && Vampire.has("beastTongue", p) ? [d.mods[0], 0, d.mods[2]] : d.mods; },
    dietSuspicion(p: any, d: BloodDiet): number { return d.suspicion && d.id === "hunting" && Vampire.has("batForm", p) ? Math.ceil(d.suspicion / 2) : d.suspicion ?? 0; },
    chooseDiet(p: any, id: string) { Vampire.state(p).diet = id; },
    openDietMenu() { Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.chooseDiet, null, false, 6, null); },
    dietCells(p: any = player()): ActionCellSingleViewModel[] {
        const current = Vampire.chosenDiet(p).id;
        return BLOOD_DIETS.map((d) => {
            const c = ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(new BloodDietCell(d) as any, null);
            if (d.id === current) c.getActionButton().setEnabled(false);
            return c;
        });
    },
    currentDietCell(p: any = player()): ActionCellSingleViewModel {
        const c = ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(new BloodDietCell(Vampire.chosenDiet(p)) as any, null);
        c.getActionButton().setHidden(true);
        return c;
    },
    afterWeek(p: any) {
        try { Vampire.hooks.human?.(p); } catch { /* */ }   // v0.35.0: a way out for the dying
        const s = Vampire.peek(p);
        if (s == null) return;
        if (s.turningWeeks > 0) { s.turningWeeks--; if (s.turningWeeks === 0) Vampire.rise(p); return; }
        if (!s.isVampire) return;
        if (s.cureWeeks > 0) {
            s.cureWeeks--;
            if (s.cureWeeks === 0) {
                s.isVampire = false; s.cured = true; s.thirst = 0; s.suspicion = 0; s.weeksAtMaxThirst = 0; s.diet = "hand";
                s.witheredWeeks = 0; s.collapsePending = false;   // v0.25.2: a human body isn't Withered
                Vampire.alert("Human Again", `The Vampiric Cure has done its work. Your heart beats again, and you'll start ageing from ${p.getAgeInYears()}. The vampire's path is closed to you for the rest of this life.` + (() => { const pt = p.getFamilyState?.()?.getPartner?.(); return pt != null && pt.getIsAlive() && Vampire.isTurned(pt) ? ` ${pt.getFirstName()} is still a vampire; your Eternal Bond is broken.` : ""; })(), R.drawable.health_youthelixir);
            }
            return;
        }
        if (s.inTorpor) return;   // lying collapsed somewhere: nothing happens to you
        const d = Vampire.diet(p);
        s.thirst = Math.max(0, Math.min(100, s.thirst + Vampire.thirstRate(p, d)));
        s.weeksAtMaxThirst = s.thirst >= 100 ? s.weeksAtMaxThirst + 1 : 0;
        if (d.suspicion) s.suspicion = Math.max(0, Math.min(100, s.suspicion + Vampire.dietSuspicion(p, d)));
        if (d.id === "hunting" && !Vampire.has("mistStep", p) && roll(0.05)) {
            pay(p, 2000);
            s.suspicion = Math.min(100, s.suspicion + 10);
            Vampire.hooks.police?.(p); Vampire.alert("Police Trouble", `Someone saw you on one of your nightly hunts. You paid ${money(2000)} in "fines" and the police are watching (suspicion +10).`, R.drawable.police_badge);
        }
        // Eternal Bond: with no blood diet, your partner hunts on their own and people notice
        if (Vampire.bonded(p) && d.id === "hand") s.suspicion = Math.min(100, s.suspicion + 2);
        if (Vampire.has("mindFog", p)) s.suspicion = Math.max(0, s.suspicion - 5);
        // a year of not ageing: blood power, and people start to wonder
        const years = Math.floor(s.vampireWeeks / WPY());
        while (s.yearsAwarded < years) {
            s.yearsAwarded++;
            s.bloodPower += 1 + (s.yearsAwarded % 10 === 0 ? 1 : 0);
            s.suspicion = Math.min(100, s.suspicion + 1 + 2 * Vampire.turnedLovedOnes(p).length);
            Vampire.hooks.yearly?.(p, s.yearsAwarded);
        }
        if ((s.witheredWeeks ?? 0) > 0) {
            s.witheredWeeks = Math.max(0, s.witheredWeeks - (Vampire.has("regeneration", p) ? 2 : 1));
            const a = p.getAttributeState();
            if (a.getHealth() > WITHERED_CAP) a.setHealth(WITHERED_CAP);
        }
        if (Vampire.hooks.week) { try { Vampire.hooks.week(p); } catch (e) { console.error(e); } }   // v0.35.0 Vampires Reborn
        if (s.thirst >= 100) s.collapsePending = true;   // v0.22.0: collapse (runs after this week ends)
        else if (!Vampire.hooks.week && s.suspicion >= 80 && roll(0.2)) Vampire.hunters(p);
    },
    // ------------------------------------------------------------------ collapse (v0.22.0)
    /** "2 years" — how long a diet takes to fill the thirst bar from empty. */
    fillText(perWeek: number): string {
        const y = 100 / perWeek / WPY();
        return Math.abs(y - Math.round(y)) < 0.05 ? `${Math.round(y)} year${Math.round(y) === 1 ? "" : "s"}` : `${Math.round(100 / perWeek)} weeks`;
    },
    isInTorpor(p: any = player()): boolean { return !!Vampire.peek(p)?.inTorpor; },
    /** Called at the very end of Player.applyWeekly: if your thirst bar filled up, you collapse and years go by. */
    afterWeekEnd(p: any) {
        const s = Vampire.peek(p);
        if (s == null || !s.collapsePending || s.inTorpor) return;
        s.collapsePending = false;
        if (Vampire.hooks.torpor) Vampire.hooks.torpor(p, (s as any).torporKind ?? "starving");
        else Vampire.collapse(p);
        delete (s as any).torporKind;
    },
    /** Weak with thirst, you collapse somewhere hidden and lie there for 10–40 years (your body doesn't age, the world
     *  does) until a passer-by finds you and gives you some blood. Depriving your body has a price:
     *  - your job is gone, and half your cash (you were declared missing; your accounts were picked over)
     *  - a mortal partner gave you up for dead and moved on; everyone else drifts as the years go by
     *  - half your blood power withers away
     *  - you wake Withered: 20 health, and for two years health can't go above 50 and doesn't heal (−1 happiness a week) */
    collapse(p: any, years: number = 10 + Math.floor(Math.random() * 31), kind: "starving" | "chosen" | "beast" | "staked" | "old" = "old") {
        const s = Vampire.state(p);
        const reborn = kind !== "old";   // v0.35.0: torpor (gentler: you keep your blood power, a shorter Withered spell)
        const weeks = years * WPY() + Math.floor(Math.random() * (WPY() / 2));
        const where = kind === "chosen" ? "in your coffin" : kind === "staked" ? "in a shallow grave the hunters dug" : pick(["in a storm drain", "behind a dumpster in an alley", "in the basement of an abandoned building", "under a bridge", "in a forgotten crypt", "in the woods outside town"]);
        const jobBefore = p.getJobState().getCurrentJob();
        Vampire.hooks.torporStart?.(p, kind);
        if (jobBefore != null) p.getJobState().setCurrentJob(null);
        const partnerBefore = p.getFamilyState().getPartner();
        Vampire.hooks.collapseStart?.(p);
        const missed: any[] = [];
        s.inTorpor = true;
        AlertManager.muted = missed;
        MoneyState.frozen = true;
        // the ones you turned are vampires too: they wait for you (no drift, no missed anniversaries). Mortals move on.
        const together0 = Relationships.together;
        Relationships.together = new Set<any>(Vampire.coven(p));
        let passed = 0;
        try {
            const playing = () => GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted() && GameStateManager.INSTANCE.getPersonState() === p;
            for (let i = 0; i < weeks && playing(); i++) { p.applyWeekly(); passed++; }
        } finally {
            s.inTorpor = false;
            AlertManager.muted = null;
            MoneyState.frozen = false;
            Relationships.together = together0;
        }
        const lost: string[] = [];
        if (jobBefore != null) lost.push("your job");
        // declared missing: half your cash is gone by the time you sort it out
        const c = Number(cash(p).toString());
        const gone = c > 0 && kind !== "chosen" ? Math.floor(c / 2) : 0;
        if (gone > 0) { pay(p, gone); lost.push(`${money(gone)} (half your cash: you were declared missing)`); }
        // a mortal partner gave up waiting
        const partner = p.getFamilyState().getPartner();
        let partnerLeft: string | null = null, partnerWaited: string | null = null;
        if (partner != null && Vampire.isTurned(partner)) partnerWaited = partner.getFirstName();
        else if (partner != null) try { p.getFamilyState().breakUp(); } catch { /* ignore */ }
        if (partnerBefore != null && partnerWaited == null) partnerLeft = partnerBefore.getFirstName();
        // the body pays for it
        const bp = s.bloodPower;
        if (!reborn) s.bloodPower = Math.floor(bp / 2);
        if (bp - s.bloodPower > 0) lost.push(`${bp - s.bloodPower} blood power`);
        s.thirst = kind === "chosen" ? 60 : 40; s.weeksAtMaxThirst = 0;
        s.suspicion = Math.max(0, s.suspicion - 30);   // the world forgot about you
        s.collapses = (s.collapses ?? 0) + 1;
        s.witheredWeeks = kind === "chosen" ? 0 : reborn ? WITHERED_WEEKS / 2 : WITHERED_WEEKS;
        const a = p.getAttributeState();
        if (kind === "chosen") { a.setHealth(Math.max(a.getHealth(), 70)); a.setHappiness(Math.max(a.getHappiness(), 50)); a.setSanity(Math.max(a.getSanity(), 50)); }
        else { a.setHealth(20); a.setHappiness(Math.max(Math.min(a.getHappiness(), 25), 15)); a.setSanity(Math.max(Math.min(a.getSanity(), 25), 15)); }
        a.setLowAttributeCountdown_health(0); a.setLowAttributeCountdown_happiness(0); a.setLowAttributeCountdown_sanity(0);
        const saviour = kind === "chosen" ? null : Relationships.makeFriend("out", p);
        if (saviour != null) saviour.setRelationshipProgress(650);
        const who = saviour ? `${saviour.getFullName()}, a passer-by,` : pick(["a jogger", "a homeless man", "a nurse walking home", "a kid exploring"]);
        const waking = Vampire.hooks.waking?.(p, kind, Math.floor(passed / WPY())) ?? "";
        const span = (() => { const y = Math.floor(passed / WPY()), m = Math.floor((passed % WPY()) / 4); return [y ? `${y} year${y === 1 ? "" : "s"}` : null, m ? `${m} month${m === 1 ? "" : "s"}` : null].filter(Boolean).join(" and ") || `${passed} weeks`; })();
        const events = Vampire.missedSummary(missed);
        const famous = Vampire.hooks.collapseEnd ? Vampire.hooks.collapseEnd(p, Math.floor(passed / WPY())) : "";
        const opening = kind === "chosen" ? `You closed the lid of your coffin and slept ${where} for ${span}. You rise rested, and hungry.`
            : kind === "beast" ? `The Beast took you. For ${span} you were a wild thing in the dark, feeding on whatever crossed your path, until you came back to yourself ${where}. Your Humanity is 1.`
            : kind === "staked" ? `The hunters drove a stake through your heart, dragged you into the sun and left you ${where}. You lay there for ${span}, burned and still, until the stake rotted loose.`
            : `You starved your body too long. Weak and shaking, you collapsed ${where} and lay there like a corpse for ${span}.\n\n` +
            `Then ${who} found you, thought you'd been hurt, and let you drink a little of their blood. You came back to yourself.`;
        Vampire.alert(kind === "chosen" ? "You Wake" : kind === "beast" ? "Lost to the Beast" : kind === "staked" ? "Staked" : reborn ? "Torpor" : "You Collapsed",
            opening +
            (saviour ? ` ${saviour.getFirstName()} is your friend now.` : "") +
            (partnerLeft ? `\n\n${partnerLeft} waited for years, then had you declared dead and moved on. You're single.` : "") +
            (partnerWaited ? `\n\n${partnerWaited}, your eternal partner, never stopped looking for you.` : "") +
            (lost.length ? `\n\nYou lost ${lost.join(", ")}.` : "") +
            famous +
            (s.witheredWeeks > 0 ? `\n\nYour body is Withered: you woke at 20 health, and for the next ${s.witheredWeeks === WITHERED_WEEKS ? "2 years" : "year"} it can't go above ${WITHERED_CAP} or heal (−1 happiness a week).` : "") +
            waking +
            (events ? `\n\nWhile you were gone: ${events}` : ""), Vampire.image);
        return passed;
    },
    /** "2 births, 1 death in the family, 3 other things" from the alerts that happened while you were collapsed. */
    missedSummary(missed: any[]): string {
        const titles = missed.map((m) => { try { return m.getTitle?.() ?? m.title ?? ""; } catch { return ""; } }).filter(Boolean);
        if (!titles.length) return "";
        const counts = new Map<string, number>();
        for (const t of titles) counts.set(t, (counts.get(t) ?? 0) + 1);
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, n]) => (n > 1 ? `${t} ×${n}` : t));
        return top.join(", ") + (counts.size > 6 ? `, and ${counts.size - 6} other kinds of news.` : ".");
    },
    frenzy(p: any) {
        const s = Vampire.state(p);
        const pick = Math.random();
        const job = p.getJobState().getCurrentJob();
        const fam = Relationships.familyPeople(p).filter((x: any) => !Vampire.isTurned(x));
        if (pick < 0.4 || (!job && !fam.length)) {
            s.suspicion = Math.min(100, s.suspicion + 25);
            pay(p, 5000);
            Vampire.alert("Frenzy", `Starving, you attacked a stranger in an alley. The police are asking questions (suspicion +25) and you paid ${money(5000)} to make it go away.`);
        } else if ((pick < 0.7 && job) || !fam.length) {
            p.getJobState().setCurrentJob(null);
            Vampire.alert("Frenzy", "You lost control at work and bit a coworker. You've been fired.");
        } else {
            const x = fam[Math.floor(Math.random() * fam.length)];
            x.setRelationshipProgress(x.getRelationshipProgress() - 100);
            Vampire.alert("Frenzy", `In your hunger you lashed out at ${x.getFirstName()}. They're terrified of you now (−100 relationship).`);
        }
    },
    hunters(p: any) {
        const s = Vampire.state(p);
        const extra = new ArrayList<AlertActionViewModel>();
        if (cash(p).compareTo(BigInteger.valueOf(10000)) >= 0) {
            extra.add(new AlertActionViewModel(`Hide (${money(10000)})`, { invoke: () => { pay(p, 10000); s.suspicion = Math.max(0, s.suspicion - 30); refreshUI(); return null; } }));
        }
        try {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Vampire Hunters",
                "Hunters with stakes and garlic have tracked you down. What do you do?", R.drawable.icon_vamp_hunters, null, null,
                new AlertActionViewModel("Fight", { invoke: () => { Vampire.fight(p); return null; } }),
                new AlertActionViewModel("Flee to a new city", { invoke: () => { Vampire.flee(p); return null; } }),
                extra, AlertType.Alert, 0, null), false, 2, null);
        } catch { /* no UI */ }
    },
    fight(p: any) {
        const s = Vampire.state(p);
        const r = Math.random();
        const win = Vampire.fightWinChance(p);
        const partner = Vampire.bondedPartner(p);
        if (r < win) {
            s.suspicion = Math.max(0, s.suspicion - 40);
            Vampire.alert("You Won", partner != null ? `You and ${partner.getFirstName()} fought side by side. The hunters fled into the night.` : "The hunters fled into the night. They won't be back for a while.");
        } else if (r < win + (1 - win) / 2) {
            s.suspicion = Math.max(0, s.suspicion - 20);
            Vampire.harming = true;
            try { attr(p, -40, 0, -10); } finally { Vampire.harming = false; }
            Vampire.alert("Barely Escaped", "You got away, but a stake grazed your heart (−40 health).");
        } else {
            // v0.30.1: a vampire only dies by choice (Final Rest) — a stake puts you down, it doesn't end you
            s.suspicion = 0;
            Vampire.harming = true;
            try { attr(p, -60, -10, -15); } finally { Vampire.harming = false; }
            p.getJobState().setCurrentJob(null);
            Vampire.alert("Staked", "The hunters drove a stake through your heart and left you for dead. You aren't so easy to kill: days later you pulled it out and crawled home. Your job is gone and the hunters think you're dust (−60 health).");
        }
        refreshUI();
    },
    flee(p: any) {
        const s = Vampire.state(p);
        s.suspicion = Math.max(0, s.suspicion - 50);
        if (Vampire.has("shadowStep", p)) {   // v0.26.0
            Vampire.alert("Into the Shadows", "You stepped into the shadows and the hunters lost your trail. By morning you were back at work as if nothing happened.");
            refreshUI();
            return;
        }
        p.getJobState().setCurrentJob(null);
        Vampire.alert("A New City", "You packed a bag and left before dawn. You lost your job, but the hunters lost your trail.");
        refreshUI();
    },
    die(_p: any, message: string, reason: string) {
        try { AlertManager.INSTANCE.showDeathAlertWithMessage(message, reason, R.drawable.grave2); } catch { /* no UI */ }
    },

    // ------------------------------------------------------------------ sunlight
    /** v0.26.0: sunlight depends on the season (half in winter, ×1.5 in summer). */
    sunDamage(p: any): number {
        const base = Vampire.has("sunWard", p) ? 5 : 10;
        let m = 0, c: string | null = null; try { m = p.getCurrentMonthIndex(); c = p.getCountry().name(); } catch { /* ignore */ }
        const s = seasonForMonth(m, c);   // v0.27.0: hemisphere-aware
        const f = s === "winter" ? 0.5 : s === "summer" ? 1.5 : 1;
        return Math.round(base * f);
    },
    isDaytime(action: any): boolean { return action != null && (DAYTIME.has(action.name()) || !!action.act?.()?.outdoor); },
    /** v0.21.1: sunlight drains a vampire's happiness (it no longer touches health). */
    onLeisure(p: any, action: any) {
        if (!Vampire.isVampire(p) || !Vampire.isDaytime(action)) return;
        if (Vampire.hooks.exposed) { Vampire.hooks.exposed(p, false, false); return; }   // v0.35.0: weather, Vitality
        attr(p, 0, -Vampire.sunDamage(p), 0);
    },
    leisureNote(action: any): string | null {
        const p = player();
        if (!p || !Vampire.isVampire(p) || !Vampire.isDaytime(action)) return null;
        if (Vampire.hooks.sunNote) return Vampire.hooks.sunNote(p);
        return `Daytime: −${Vampire.sunDamage(p)} happiness for a vampire (sunlight)\n`;
    },
    /** Working a week: day shifts burn (Night Owl works nights and earns 20% more). Returns the pay multiplier. */
    onWork(p: any, job: any = null): number {
        if (!Vampire.isVampire(p)) return 1;
        const d = job?.def?.();
        if (d?.night) return Vampire.has("nightOwl", p) ? 1.2 : 1;   // v0.26.0: a night job never sees the sun
        // v0.26.0: outdoor day jobs (lifeguard, park ranger…) can't move to nights, and burn twice as much
        if (Vampire.hooks.exposed) {   // v0.35.0: the week's weather; night mode moves day jobs to nights
            if (d?.outdoor) { Vampire.hooks.exposed(p, true, true); return 1; }
            if (Vampire.has("nightOwl", p)) return 1.2;
            if ((p.vampire as any)?.rb?.nightMode) return 0.95;
            Vampire.hooks.exposed(p, false, true);
            return 1;
        }
        if (d?.outdoor) { attr(p, 0, -2 * Math.ceil(Vampire.sunDamage(p) / 5), 0); return 1; }
        if (Vampire.has("nightOwl", p)) return 1.2;
        attr(p, 0, -Math.ceil(Vampire.sunDamage(p) / 5), 0);   // v0.21.1: day shifts are tiring (−2 happiness), not deadly
        return 1;
    },
    /** Charm: +25% relationship gains. */
    gainMultiplier(): number { try { return (Vampire.has("charm") ? 1.25 : 1) * (Vampire.hooks.gain?.() ?? 1); } catch { return 1; } },
    datingMultiplier(): number { try { return Vampire.has("charm") ? 1.5 : 1; } catch { return 1; } },

    // ------------------------------------------------------------------ feeding & hiding
    feed(p: any, thirst: number, suspicion: number) {
        const s = Vampire.state(p);
        s.thirst = Math.max(0, s.thirst - thirst);
        s.weeksAtMaxThirst = 0;
        s.suspicion = Math.max(0, Math.min(100, s.suspicion + suspicion));
    },
    hasMedicalJob(p: any): boolean {
        try { const j = p.getJobState().getCurrentJob(); return j != null && (!!j.def?.()?.medical || /doctor|nurse|medic|surgeon|research/i.test(j.name() + " " + (j.getJobTitles?.() ?? []).join(" "))); } catch { return false; }
    },
    /** A living, human partner who knows your secret. v0.25.1: never one you turned (vampire blood won't feed you). */
    willingPartner(p: any): any {
        const partner = p.getFamilyState().getPartner();
        return partner != null && partner.getIsAlive() && Vampire.knows(partner) && !Vampire.isTurned(partner) ? partner : null;
    },
    /** Why you can't feed on your partner, or null. */
    partnerFeedLock(p: any): string | null {
        const partner = p.getFamilyState?.()?.getPartner?.();
        if (partner != null && partner.getIsAlive() && Vampire.isTurned(partner)) return `${partner.getFirstName()} is a vampire too: there's no living blood to share. Hunt Together instead`;
        return Vampire.willingPartner(p) ? null : "Your partner must know your secret";
    },
    /** v0.25.0 cross content (set by Crossover.ts, which knows about Celebrity Life). Each returns extra alert text. */
    hooks: {
        fakeDeath: null as ((p: any, oldName: string) => string) | null,
        collapseStart: null as ((p: any) => void) | null,
        collapseEnd: null as ((p: any, years: number) => string) | null,
        yearly: null as ((p: any, years: number) => void) | null,
        /** v0.27.0: police trouble while hunting (Crime: heat). */
        police: null as ((p: any) => void) | null,
        /** v0.28.0: rising cures every illness (Illness). */
        rise: null as ((p: any) => void) | null,
        // v0.35.0 Vampires Reborn (src/game/Vampires)
        tick: null as ((p: any) => void) | null,
        week: null as ((p: any) => void) | null,
        rate: null as ((p: any, d: BloodDiet, t: number) => number) | null,
        fight: null as ((p: any) => number) | null,
        gain: null as (() => number) | null,
        exposed: null as ((p: any, outdoorJob: boolean, shift: boolean) => void) | null,
        sunNote: null as ((p: any) => string) | null,
        torpor: null as ((p: any, kind: any) => void) | null,
        torporStart: null as ((p: any, kind: string) => void) | null,
        waking: null as ((p: any, kind: string, years: number) => string) | null,
        risen: null as ((p: any) => void) | null,
        human: null as ((p: any) => void) | null,
    },
    /** Set by Crossover: a celebrity power couple ends when you fake your death. */
    forgetCelebPartner: null as ((p: any) => void) | null,
    fakeDeath(p: any) {
        const s = Vampire.state(p);
        const oldName = p.getFullName();
        const first = NameGenerator.INSTANCE.generateFirstName(p.getSex());
        const last = NameGenerator.INSTANCE.generateLastName();
        p.setFirstName(first);
        p.lastName = last;
        p.getJobState().setCurrentJob(null);
        p.getJobState().resetCareers();   // v0.23.0: the new you has no work history
        s.suspicion = 0;
        const gone: string[] = [];
        for (const f of Relationships.friends(p)) if (!Vampire.knows(f) && !Vampire.isTurned(f)) { Relationships.circle(p).remove(f.id); gone.push(f.getFirstName()); }
        // v0.25.2: everyone who doesn't know your secret believes you're dead
        const fam = p.getFamilyState();
        const partner = fam.getPartner();
        let widowed: string | null = null;
        if (partner != null && partner.getIsAlive() && !Vampire.knows(partner) && !Vampire.isTurned(partner)) {
            widowed = partner.getFirstName();
            try { fam.breakUp(); } catch { /* ignore */ }
            Vampire.forgetCelebPartner?.(p);
        }
        const mourners: string[] = [];
        for (const x of Array.from(fam.getFamilyMembers() as any) as any[]) {
            if (!x.getIsAlive() || x.getNotYetBorn?.() || x.getPetType?.() != null || x === partner) continue;
            if (Vampire.knows(x) || Vampire.isTurned(x)) continue;
            x.setRelationshipProgress(Math.max(0, x.getRelationshipProgress() - 300));
            mourners.push(x.getFirstName());
        }
        for (const x of Relationships.circle(p).list()) {
            if (!x.getIsAlive() || x.kind === "friend" || x.kind === "ex" || Vampire.knows(x) || Vampire.isTurned(x)) continue;
            x.setRelationshipProgress(Math.max(0, x.getRelationshipProgress() - 300));
        }
        if (p.moments?.pending) p.moments.pending = [];   // friends who owed you money think you're dead
        const extra = Vampire.hooks.fakeDeath ? Vampire.hooks.fakeDeath(p, oldName) : "";
        const lines = [
            `You staged your own death and became ${first} ${last}. You left your job behind, and your career starts over from the bottom with no years behind you.`,
            gone.length ? `Friends who didn't know your secret mourned you: ${gone.join(", ")}.` : "",
            widowed ? `${widowed} buried an empty coffin and grieves for you. You can't be together any more.` : "",
            mourners.length ? `Your family believes you're gone (${mourners.slice(0, 4).join(", ")}${mourners.length > 4 ? ` and ${mourners.length - 4} more` : ""}). You can still watch over them, from a distance (−300 relationship).` : "",
        ].filter(Boolean);
        Vampire.alert("A New Life", lines.join("\n\n") + extra, R.drawable.grave);
    },
    moveCity(p: any) {
        const s = Vampire.state(p);
        p.getJobState().setCurrentJob(null);
        s.suspicion = Math.max(0, s.suspicion - 50);
        for (const f of Relationships.friends(p)) if (!Vampire.knows(f)) f.setRelationshipProgress(f.getRelationshipProgress() - 100);
        Vampire.alert("A New City", "You moved somewhere nobody knows you. You quit your job, and friends you left behind feel distant.");
    },
    findCoven(p: any) {
        if (Relationships.friends(p).length >= Relationships.maxFriends) { Vampire.alert("Coven", "You already have 10 friends."); return; }
        if (!roll(0.35)) { Vampire.alert("Coven", "You searched the night but no other vampire showed themselves."); return; }
        const f = SocialPerson.make("friend", Sex.INSTANCE.getRandomSex(), null, Vampire.state(p).turnedAtWeeks + Math.floor(Math.random() * 10) * WPY());
        f.metAt = "coven";
        f.sinceWeek = Relationships.now();
        f.trueAgeInWeeks = f.ageInWeeks + (50 + Math.floor(Math.random() * 300)) * WPY();
        f.setRelationshipProgress(400);
        Relationships.circle(p).add(f);
        const m = Relationships.circle(p).metaFor(f.id);
        m.vampire = true; m.knows = true;
        Vampire.alert("Coven", `You met ${f.getFullName()}, a vampire who looks ${f.getAgeInYears()} but is really ${TrueAge.text(f)}.`, Vampire.image);
    },

    // ------------------------------------------------------------------ loved ones
    /** Tell them your secret. Close (600+) people accept; others may take it badly. */
    tell(p: any, person: any) {
        const m = Relationships.meta(person);
        const name = person.getFirstName();
        if (person.getRelationshipProgress() >= 600 || roll(0.3)) {
            m.knows = true;
            Vampire.alert("Your Secret", `${name} listened, went quiet, then hugged you. Your secret is safe with them.`, Vampire.image);
            return;
        }
        const isPartner = Relationships.kindOf(person) === "partner";
        if (isPartner && roll(0.5)) {
            Vampire.alert("Your Secret", `${name} couldn't handle it and left you.`, R.drawable.love_breakup);
            p.getFamilyState().breakUp();
            return;
        }
        m.knows = true;
        person.setRelationshipProgress(person.getRelationshipProgress() - 150);
        Vampire.state(p).suspicion = Math.min(100, Vampire.state(p).suspicion + 15);
        Vampire.alert("Your Secret", `${name} is scared of you now (−150 relationship), and might talk (suspicion +15).`, R.drawable.angry);
    },
    turn(p: any, person: any) {
        const s = Vampire.state(p);
        s.bloodPower -= Vampire.turnCost;
        const m = Relationships.meta(person);
        m.vampire = true; m.knows = true;
        person.setRelationshipProgress(person.getRelationshipProgress() + 100);
        Vampire.alert("Turned", `${person.getFirstName()} rose a vampire. They'll stay ${person.getAgeInYears()} forever, by your side.`, Vampire.image);
    },
    /** A human loved one dies: watching them go hurts more when you'll live forever. */
    onFamilyDeath(person: any) {
        try {
            const p = player();
            if (!Vampire.isVampire(p) || person.getPetType?.() != null || Vampire.isTurned(person)) return;
            attr(p, 0, 0, -10);
        } catch { /* no player */ }
    },

    // ------------------------------------------------------------------ endings
    startCure(p: any) { Vampire.state(p).cureWeeks = Vampire.cureWeeks; },
    /** v0.30.2: the Vampiric Cure, bought for someone else (your partner, family, a friend, a coven vampire). */
    cureOther(p: any, person: any) {
        const m = Relationships.meta(person, p);
        m.cureWeeks = Vampire.cureWeeks;
        person.setRelationshipProgress(person.getRelationshipProgress() + 100);
        Vampire.alert("Vampiric Cure", `${person.getFirstName()} drank the Vampiric Cure (+100 relationship). In ${Vampire.cureWeeks} weeks their heart will beat again.`, R.drawable.health_youthelixir);
    },
    /** Weekly: anyone taking the Cure you bought them becomes human when it's done. */
    tickCures(p: any) {
        let people: any[] = [];
        try { people = [...Relationships.familyPeople(p), ...Relationships.circle(p).list().filter((x: any) => x.getIsAlive() && x.kind !== "ex")]; } catch { return; }
        const done = new Set<string>();
        for (const x of people) {
            const id = String(x.getId());
            if (done.has(id)) continue;
            done.add(id);
            const m = Relationships.meta(x, p);
            if (!((m.cureWeeks ?? 0) > 0)) continue;
            m.cureWeeks = (m.cureWeeks ?? 1) - 1;
            if (m.cureWeeks > 0) continue;
            delete m.cureWeeks;
            m.vampire = false; m.cured = true;
            const partner = p.getFamilyState?.()?.getPartner?.();
            const bond = x === partner && Vampire.isVampire(p) ? " You're still a vampire; your Eternal Bond is broken." : "";
            AlertManager.randomly(() => Vampire.alert("Human Again", `The Vampiric Cure has done its work: ${x.getFirstName()}'s heart beats again, and they'll start ageing from ${x.getAgeInYears()}.${bond}`, R.drawable.health_youthelixir));
        }
    },
    finalRest(p: any) {
        Vampire.die(p, `After ${Vampire.years(p) < 1 ? "less than a year" : Vampire.years(p) === 1 ? "a year" : `${Vampire.years(p)} years`} in the dark, ${p.getFirstName()} chose to rest at last and watched one final sunrise.`, "Final Rest");
        refreshUI();
    },

    // ------------------------------------------------------------------ babies
    /** Vampires (you or your partner) can't have biological children. */
    canHaveBiologicalKids(p: any = player()): boolean {
        const partner = p.getFamilyState().getPartner();
        return !Vampire.isVampire(p) && !(partner != null && Vampire.isTurned(partner));
    },

    // ------------------------------------------------------------------ messages
    alert(title: string, msg: string, image: any = R.drawable.lifepath_vampire) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
    },
    confirm(title: string, msg: string, image: any, yes: string, onYes: () => void) {
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null,
            new AlertActionViewModel(yes, { invoke: () => { onYes(); refreshUI(); return null; } }),
            new AlertActionViewModel("Cancel", { invoke: () => null }), null, AlertType.Alert, 0, null), false, 2, null);
    },
    refreshUI,
    money,
    PersonAttribute,
    Leisure,
};

// ======================================================================== action rows
export interface LifeActionDef {
    id: string;
    title: string | (() => string);
    image: any;
    cost?: number | (() => number);
    mods?: [number, number, number] | (() => [number, number, number]);
    note?: () => string | null;
    lock?: (p: any) => string | null;
    show?: (p: any) => boolean;
    run: (p: any) => void;
    instant?: boolean;
    confirm?: () => string;
    actionTitle?: () => string | null;
    /** v0.27.0: a prison action (the only kind you can do in prison). */
    jail?: boolean;
}

/** A blood diet in the shape of the game's diet rows. */
export class BloodDietCell {
    constructor(public d: BloodDiet) {}
    getTitle(): string { return this.d.title; }
    getImageId(): any { return this.d.image; }
    getCost(): BigInteger { return BigInteger.valueOf(this.d.cost); }
    getModifiers(): Modifiers { const m = Vampire.dietMods(player(), this.d); return new Modifiers(m[0], m[1], m[2]); }
    getActionTitle(): string { return "Drink"; }
    getAdditionalDescription(): string {
        const t = Vampire.thirstRate(player(), this.d);
        const thirst = t > 0 ? `Thirst bar fills in ${Vampire.fillText(t)}` : `Thirst −${-t} a week`;
        const sus = this.d.suspicion ? `, suspicion +${Vampire.dietSuspicion(player(), this.d)} a week` : "";
        return `${money(this.d.cost)} a week · ${thirst}${sus}\n${this.d.blurb}\n`;
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null { return this.d.lock?.(p) ?? null; }
    action(p: any): void {
        Vampire.chooseDiet(p, this.d.id);
        try { Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal()); } catch { /* no UI */ }
        refreshUI();
    }
}

/** A Lifepaths row in the shape of the game's action rows. */
export class LifeActionCell {
    constructor(public def: LifeActionDef) {}
    getTitle(): string { return typeof this.def.title === "function" ? this.def.title() : this.def.title; }
    getImageId(): any { const i = this.def.image; return typeof i === "function" ? i() : i; }
    costValue(): number { const c = this.def.cost; return typeof c === "function" ? c() : c ?? 0; }
    getCost(): BigInteger { return BigInteger.valueOf(this.costValue()); }
    getModifiers(): Modifiers { const m = (typeof this.def.mods === "function" ? this.def.mods() : this.def.mods) ?? [0, 0, 0]; return new Modifiers(m[0], m[1], m[2]); }
    getActionTitle(): string | null { return this.def.actionTitle?.() ?? (this.costValue() > 0 ? null : "Go"); }   // v0.25.1: free actions say "Go", not "$0"
    getAdditionalDescription(): string | null { return this.def.note?.() ?? null; }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null {
        const jailed = !!p.getCrimeState?.()?.getIsInJail?.();
        if (jailed && !this.def.jail) return "Not while you're in prison";
        if (!jailed && this.def.jail) return "Only in prison";
        return this.def.lock?.(p) ?? null;
    }
    visible(p: any = player()): boolean { return this.def.show ? this.def.show(p) : true; }
    action(p: any): void { LifeActions.perform(this.def, p); }
    cell(): ActionCellSingleViewModel { return ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(this as any, null); }
}

export const LifeActions = {
    perform(def: LifeActionDef, p: any = player()): boolean {
        const cell = new LifeActionCell(def);
        if (!cell.visible(p) || cell.requirementNotMetString(p) != null) return false;
        if (cell.costValue() > 0 && cash(p).compareTo(cell.getCost()) < 0) return false;
        const go = () => {
            p.applyAttributeAndMoneyFromEvent(cell);
            def.run(p);
            if (!def.instant) p.applyWeekly();
            else refreshUI();
        };
        if (def.confirm) { Vampire.confirm(cell.getTitle(), def.confirm(), def.image, cell.getTitle(), go); return true; }
        go();
        return true;
    },
    cells(defs: LifeActionDef[], p: any = player()): ActionCellSingleViewModel[] {
        return defs.map((d) => new LifeActionCell(d)).filter((c) => c.visible(p)).map((c) => c.cell());
    },
};

const vs = () => Vampire.state();
const thirstNote = (n: number, s = 0) => `−${n} thirst${s > 0 ? `, +${s} suspicion` : s < 0 ? `, ${s} suspicion` : ""}\n`;

export const BECOMING: LifeActionDef[] = [
    { id: "seek", title: "Seek the Ancient", image: R.drawable.icon_vamp_seek, cost: 5000, show: (p) => !Vampire.state(p).discovered,
        lock: (p) => Vampire.canBecome(p), note: () => "Follow the rumours. 1 in 4 chance of finding a vampire willing to meet you.\n", run: (p) => Vampire.seek(p) },
    { id: "bite", title: "Accept the Bite", image: R.drawable.icon_vamp_bite, show: (p) => Vampire.state(p).discovered,
        lock: (p) => Vampire.canBecome(p),
        note: () => "Become a vampire. Takes a week; your health drops to 50%.\n",
        confirm: () => "You'll never age again, but you'll need blood every week, the sun will burn you, and you can't have biological children. You can only go back with the Vampiric Cure, and you only get one vampire life. Accept the bite?",
        run: (p) => Vampire.acceptBite(p) },
];

export const FEEDING: LifeActionDef[] = [
    { id: "diet", title: () => `Blood Supply: ${Vampire.chosenDiet(player()).title}`, image: () => Vampire.chosenDiet(player()).image, instant: true,
        actionTitle: () => "Change",
        note: () => new BloodDietCell(Vampire.chosenDiet(player())).getAdditionalDescription(),
        run: () => Vampire.openDietMenu() },
    { id: "bloodBank", title: "Buy from a Blood Bank", image: R.drawable.icon_vamp_bloodbank, cost: 500,
        lock: (p) => (Vampire.has("bloodBank", p) || Vampire.hasMedicalJob(p) ? null : "Needs the Blood Bank Contact power or a medical job"),
        note: () => thirstNote(40, 2), run: (p) => Vampire.feed(p, 40, 2) },
    { id: "animal", title: "Animal Blood", image: R.drawable.icon_vamp_animal, cost: 50, mods: [0, -5, 0], note: () => thirstNote(20), run: (p) => Vampire.feed(p, 20, 0) },
    { id: "hunt", title: "Hunt at Night", image: R.drawable.icon_vamp_hunt,
        note: () => thirstNote(60, Vampire.has("batForm") ? 5 : 10) + (Vampire.has("mistStep") ? "" : "10% chance of police trouble.\n"),
        run: (p) => {
            Vampire.feed(p, 60, Vampire.has("batForm", p) ? 5 : 10);
            if (!Vampire.has("mistStep", p) && roll(0.1)) {
                pay(p, 2000);
                Vampire.state(p).suspicion = Math.min(100, Vampire.state(p).suspicion + 10);
                Vampire.hooks.police?.(p); Vampire.alert("Police Trouble", `Someone saw you. You paid ${money(2000)} in "fines" and the police are watching (suspicion +10).`, R.drawable.police_badge);
            }
        } },
    { id: "partner", title: () => `Feed on ${Vampire.willingPartner(player())?.getFirstName() ?? "a Willing Partner"}`, image: R.drawable.icon_vamp_feedpartner,
        lock: (p) => Vampire.partnerFeedLock(p),
        note: () => thirstNote(30) + "−20 relationship with your partner.\n",
        run: (p) => { Vampire.feed(p, 30, 0); const w = Vampire.willingPartner(p); if (w) w.setRelationshipProgress(w.getRelationshipProgress() - 20); } },
];

export const HIDING: LifeActionDef[] = [
    { id: "layLow", title: "Lay Low", image: R.drawable.icon_vamp_laylow, mods: () => (Vampire.has("shadowStep") ? [0, 0, 0] : [0, -3, 0]),
        note: () => (Vampire.has("shadowStep") ? "−25 suspicion (Shadow Step)\n" : "−15 suspicion\n"),
        run: (p) => { const s = Vampire.state(p); s.suspicion = Math.max(0, s.suspicion - (Vampire.has("shadowStep", p) ? 25 : 15)); } },
    { id: "fakeDeath", title: "Fake Your Death", image: R.drawable.icon_vamp_fakedeath, cost: 20000, note: () => "Suspicion back to 0 with a new name. You lose your job and all your career progress (every career starts over, years-in-career too), and friends who don't know your secret think you died.\n",
        confirm: () => "Start over with a new name? You'll lose your job, all your career progress (levels and years in your career) and the friends who don't know your secret.", run: (p) => Vampire.fakeDeath(p) },
    { id: "moveCity", title: "Move to a New City", image: R.drawable.icon_vamp_movecity, cost: 5000, note: () => "−50 suspicion. You quit your job and friends you leave behind feel distant.\n",
        confirm: () => "Move away? You'll quit your job.", run: (p) => Vampire.moveCity(p) },
    { id: "coven", title: "Find Your Coven", image: R.drawable.icon_vamp_coven, note: () => "Look for other vampires (about a 1 in 3 chance).\n", run: (p) => Vampire.findCoven(p) },
];

export const ENDINGS: LifeActionDef[] = [
    { id: "cure", title: Vampire.cureName, image: R.drawable.icon_vamp_cure, cost: Vampire.curePrice,
        show: (p) => Vampire.state(p).cureWeeks === 0,
        note: () => `The rarest thing in the world. Become human again over ${Vampire.cureWeeks} weeks and start ageing from your frozen age. You get one vampire life: you can never become one again.\n`,
        confirm: () => "Drink the Vampiric Cure and become human again? Your powers and blood power will be gone, and you can never become a vampire again in this life.", run: (p) => Vampire.startCure(p) },
    { id: "finalRest", title: "Final Rest", image: R.drawable.icon_vamp_finalrest, instant: true,
        note: () => "End your eternal life peacefully. The game continues with your heirs, as with any death.\n",
        confirm: () => "Watch one last sunrise and end this life?", run: (p) => Vampire.finalRest(p) },
];

export function powerDefs(): LifeActionDef[] {
    return POWERS.map((pw) => ({
        id: "power-" + pw.id, title: pw.title, image: pw.image, instant: true,
        note: () => (Vampire.has(pw.id) ? "Owned. " : `Costs ${pw.cost} blood power. `) + pw.blurb + "\n",
        actionTitle: () => (Vampire.has(pw.id) ? "Owned" : `${pw.cost} BP`),
        lock: (p: any) => (Vampire.has(pw.id, p) ? "You have this power" : Vampire.state(p).bloodPower < pw.cost ? `Needs ${pw.cost} blood power` : null),
        run: (p: any) => { const s = Vampire.state(p); s.bloodPower -= pw.cost; s.powers = [...(s.powers ?? []), pw.id]; },
    }));
}

void vs;

// v0.21.1: a vampire can't be hurt by mortal things. Every health loss for the current player while they're a vampire is
// blocked, except starving (weekly, labelled STARVING) and vampire dangers that set Vampire.harming.
AttributeState.healthGuard = (st: any, delta: number, key: string | null): number => {
    if (delta >= 0 || Vampire.harming || key === STARVING) return delta;
    try {
        const p = player();
        if (p != null && p.getAttributeState() === st && Vampire.isVampire(p)) return 0;
    } catch { /* no player yet */ }
    return delta;
};
