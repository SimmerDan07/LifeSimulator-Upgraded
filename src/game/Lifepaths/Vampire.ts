// The Vampire lifepath (v0.15.0), following the plan doc "Vampire Lifepath — Plan".
//
// Becoming: 18+, out of jail. A pale stranger (2% a week at Nightclubs and Local Events) or Seek the Ancient
// ($5,000 a try, 25%) reveals the path; Accept the Bite turns you over one week (health drops to 50%).
// Living: your body stops ageing (true age and the calendar keep going). Thirst +5 a week (v0.21.1; was +15); feed to lower it.
// High thirst hurts; at 100 you frenzy, and 4+ weeks at 100 starves you. Sunlight drains your mood (v0.21.1: not your health).
// v0.21.1: nothing mortal can lower a vampire's health (AttributeState.healthGuard); only starving and hunters' stakes
// can. Well-fed vampires heal +3 health a week.
// Suspicion grows from hunting, frenzies and never ageing; at 80+ vampire hunters may come.
// Blood power (1 a year, +1 every 10 years) buys six powers. Tell loved ones your secret; turn them (3 blood power).
// Vampires can't have biological children. Endings: the Vampiric Cure (the reworked Elixir of Youth) or Final Rest.
// v0.16.0: the Vampiric Cure costs $300 billion; one vampire life per lifetime (no turning again after the Cure);
// a vampire's health never decays (only vampire dangers hurt it); blood diets replace food diets.
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
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(n), true);
const roll = (p: number) => Math.random() < p;
const refreshUI = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };
const cash = (p: any) => p.getMoneyState().getCash();
const pay = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.directSpend, null, null, 12, null);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));

export interface PowerDef { id: string; title: string; cost: number; image: any; blurb: string }
export const POWERS: PowerDef[] = [
    { id: "charm", title: "Charm", cost: 1, image: R.drawable.icon_power_charm, blurb: "Dating works more often; relationship gains +25%." },
    { id: "nightOwl", title: "Night Owl", cost: 1, image: R.drawable.icon_power_nightowl, blurb: "You work night shifts: no sunlight at work and 20% more pay." },
    { id: "bloodBank", title: "Blood Bank Contact", cost: 2, image: R.drawable.icon_power_bloodbank, blurb: "Unlocks Buy from a Blood Bank." },
    { id: "mistStep", title: "Mist Step", cost: 2, image: R.drawable.icon_power_miststep, blurb: "Hunting no longer risks police trouble." },
    { id: "sunWard", title: "Sun Ward", cost: 3, image: R.drawable.icon_power_sunward, blurb: "Sunlight drains you half as much." },
    { id: "mindFog", title: "Mind Fog", cost: 3, image: R.drawable.icon_power_mindfog, blurb: "Suspicion drops by 5 by itself every week." },
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
export const BLOOD_DIETS: BloodDiet[] = [
    { id: "hand", title: "Feed by Hand", image: R.drawable.icon_vamp_feedbyhand, cost: 0, thirst: 5, mods: [0, 0, 0],
        blurb: "No plan: you feed yourself with the Feeding actions." },
    { id: "rats", title: "Rats & Strays", image: R.drawable.vdiet_rats, cost: 0, thirst: 2, mods: [0, -3, 0],
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
    thirstPerWeek: 5,
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
            Vampire.alert("Police Trouble", `Someone saw the two of you. You paid ${money(2000)} in "fines" (suspicion +10).`, R.drawable.police_badge);
        }
    },
    /** Chance of beating the hunters (better with your bonded partner at your side). */
    fightWinChance(p: any = player()): number { return Vampire.bonded(p) ? 0.7 : 0.5; },
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
        s.bloodPower = Math.max(s.bloodPower, 1);
        Vampire.alert("You Rise a Vampire", `You wake up hungry and ageless. You'll stay ${p.getAgeInYears()} forever, but you need blood every week and the sun is no longer your friend. Your Lifepaths tab is your home now.`, Vampire.image);
    },

    // ------------------------------------------------------------------ weekly
    /** The week passes while frozen: true age and calendar move, your body doesn't. */
    tickFrozen(p: any) {
        const s = Vampire.state(p);
        p.setTrueAgeInWeeks(p.getTrueAgeInWeeks() + 1);
        s.calendarOffset++;
        s.vampireWeeks++;
    },
    /** Weekly attribute effects (also used for the weekly previews; no side effects). */
    collectWeeklyValues(p: any) {
        const s = Vampire.peek(p);
        if (!s?.isVampire || s.cureWeeks > 0) return;
        if (s.thirst >= 80) p.getAttributeState().setDeltaValue(new Modifiers(0, 0, -20), "Thirst");
        else if (s.thirst >= 60) p.getAttributeState().setDeltaValue(new Modifiers(0, -5, 0), "Thirst");
        if (s.weeksAtMaxThirst >= 4) p.getAttributeState().setDeltaValue(new Modifiers(-25, 0, 0), STARVING);
        // the blood diet: weekly cost and how it makes you feel
        const d = Vampire.diet(p);
        const two = Vampire.bonded(p);
        const label = "Blood Diet - " + d.title + (two && d.cost > 0 ? " (for two)" : "");
        if (d.cost > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(d.cost * (two ? 2 : 1)), MoneyUpdateType.expense, label, null, 8, null);
        p.getAttributeState().setDeltaValue(new Modifiers(d.mods[0], d.mods[1], d.mods[2]), label);
        // v0.21.1: undead bodies mend themselves while fed
        if (s.thirst < 60 && s.weeksAtMaxThirst === 0 && p.getAttributeState().getHealth() < 100)
            p.getAttributeState().setDeltaValue(new Modifiers(Vampire.healPerWeek, 0, 0), "Vampire healing");
    },
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
    thirstPerWeekFor(p: any = player()): number { return Vampire.diet(p).thirst; },
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
        const s = Vampire.peek(p);
        if (s == null) return;
        if (s.turningWeeks > 0) { s.turningWeeks--; if (s.turningWeeks === 0) Vampire.rise(p); return; }
        if (!s.isVampire) return;
        if (s.cureWeeks > 0) {
            s.cureWeeks--;
            if (s.cureWeeks === 0) {
                s.isVampire = false; s.cured = true; s.thirst = 0; s.suspicion = 0; s.weeksAtMaxThirst = 0; s.diet = "hand";
                Vampire.alert("Human Again", `The Vampiric Cure has done its work. Your heart beats again, and you'll start ageing from ${p.getAgeInYears()}. The vampire's path is closed to you for the rest of this life.` + (() => { const pt = p.getFamilyState?.()?.getPartner?.(); return pt != null && pt.getIsAlive() && Vampire.isTurned(pt) ? ` ${pt.getFirstName()} is still a vampire; your Eternal Bond is broken.` : ""; })(), R.drawable.health_youthelixir);
            }
            return;
        }
        const d = Vampire.diet(p);
        s.thirst = Math.max(0, Math.min(100, s.thirst + d.thirst));
        s.weeksAtMaxThirst = s.thirst >= 100 ? s.weeksAtMaxThirst + 1 : 0;
        if (d.suspicion) s.suspicion = Math.max(0, Math.min(100, s.suspicion + d.suspicion));
        if (d.id === "hunting" && !Vampire.has("mistStep", p) && roll(0.05)) {
            pay(p, 2000);
            s.suspicion = Math.min(100, s.suspicion + 10);
            Vampire.alert("Police Trouble", `Someone saw you on one of your nightly hunts. You paid ${money(2000)} in "fines" and the police are watching (suspicion +10).`, R.drawable.police_badge);
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
        }
        if (s.thirst >= 100) Vampire.frenzy(p);
        else if (s.suspicion >= 80 && roll(0.2)) Vampire.hunters(p);
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
            Vampire.die(p, `${p.getFirstName()} was slain by vampire hunters after ${Vampire.years(p)} years of eternal life.`, "Vampire hunters");
        }
        refreshUI();
    },
    flee(p: any) {
        const s = Vampire.state(p);
        p.getJobState().setCurrentJob(null);
        s.suspicion = Math.max(0, s.suspicion - 50);
        Vampire.alert("A New City", "You packed a bag and left before dawn. You lost your job, but the hunters lost your trail.");
        refreshUI();
    },
    die(_p: any, message: string, reason: string) {
        try { AlertManager.INSTANCE.showDeathAlertWithMessage(message, reason, R.drawable.grave2); } catch { /* no UI */ }
    },

    // ------------------------------------------------------------------ sunlight
    sunDamage(p: any): number { return Vampire.has("sunWard", p) ? 5 : 10; },
    isDaytime(action: any): boolean { return action != null && DAYTIME.has(action.name()); },
    /** v0.21.1: sunlight drains a vampire's happiness (it no longer touches health). */
    onLeisure(p: any, action: any) {
        if (!Vampire.isVampire(p) || !Vampire.isDaytime(action)) return;
        attr(p, 0, -Vampire.sunDamage(p), 0);
    },
    leisureNote(action: any): string | null {
        const p = player();
        if (!p || !Vampire.isVampire(p) || !Vampire.isDaytime(action)) return null;
        return `Daytime: −${Vampire.sunDamage(p)} happiness for a vampire (sunlight)\n`;
    },
    /** Working a week: day shifts burn (Night Owl works nights and earns 20% more). Returns the pay multiplier. */
    onWork(p: any): number {
        if (!Vampire.isVampire(p)) return 1;
        if (Vampire.has("nightOwl", p)) return 1.2;
        attr(p, 0, -Math.ceil(Vampire.sunDamage(p) / 5), 0);   // v0.21.1: day shifts are tiring (−2 happiness), not deadly
        return 1;
    },
    /** Charm: +25% relationship gains. */
    gainMultiplier(): number { try { return Vampire.has("charm") ? 1.25 : 1; } catch { return 1; } },
    datingMultiplier(): number { try { return Vampire.has("charm") ? 1.5 : 1; } catch { return 1; } },

    // ------------------------------------------------------------------ feeding & hiding
    feed(p: any, thirst: number, suspicion: number) {
        const s = Vampire.state(p);
        s.thirst = Math.max(0, s.thirst - thirst);
        s.weeksAtMaxThirst = 0;
        s.suspicion = Math.max(0, Math.min(100, s.suspicion + suspicion));
    },
    hasMedicalJob(p: any): boolean {
        try { const j = p.getJobState().getCurrentJob(); return j != null && /doctor|nurse|medic|surgeon|research/i.test(j.name() + " " + (j.getJobTitles?.() ?? []).join(" ")); } catch { return false; }
    },
    willingPartner(p: any): any {
        const partner = p.getFamilyState().getPartner();
        return partner != null && partner.getIsAlive() && Vampire.knows(partner) ? partner : null;
    },
    fakeDeath(p: any) {
        const s = Vampire.state(p);
        const first = NameGenerator.INSTANCE.generateFirstName(p.getSex());
        const last = NameGenerator.INSTANCE.generateLastName();
        p.setFirstName(first);
        p.lastName = last;
        p.getJobState().setCurrentJob(null);
        s.suspicion = 0;
        const gone: string[] = [];
        for (const f of Relationships.friends(p)) if (!Vampire.knows(f) && !Vampire.isTurned(f)) { Relationships.circle(p).remove(f.id); gone.push(f.getFirstName()); }
        Vampire.alert("A New Life", `You staged your own death and became ${first} ${last}. You left your job behind${gone.length ? `, and friends who didn't know your secret mourned you (${gone.join(", ")})` : ""}.`, R.drawable.grave);
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
        Vampire.alert("Coven", `You met ${f.getFullName()}, a vampire who looks ${f.getAgeInYears()} but is really ${f.getTrueAgeInYears()}.`, Vampire.image);
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
    finalRest(p: any) {
        Vampire.die(p, `After ${Vampire.years(p)} years in the dark, ${p.getFirstName()} chose to rest at last and watched one final sunrise.`, "Final Rest");
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
    mods?: [number, number, number];
    note?: () => string | null;
    lock?: (p: any) => string | null;
    show?: (p: any) => boolean;
    run: (p: any) => void;
    instant?: boolean;
    confirm?: () => string;
    actionTitle?: () => string | null;
}

/** A blood diet in the shape of the game's diet rows. */
export class BloodDietCell {
    constructor(public d: BloodDiet) {}
    getTitle(): string { return this.d.title; }
    getImageId(): any { return this.d.image; }
    getCost(): BigInteger { return BigInteger.valueOf(this.d.cost); }
    getModifiers(): Modifiers { return new Modifiers(this.d.mods[0], this.d.mods[1], this.d.mods[2]); }
    getActionTitle(): string { return "Drink"; }
    getAdditionalDescription(): string {
        const t = this.d.thirst;
        const thirst = t > 0 ? `Thirst +${t} a week` : `Thirst −${-t} a week`;
        const sus = this.d.suspicion ? `, suspicion +${this.d.suspicion} a week` : "";
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
    getModifiers(): Modifiers { const m = this.def.mods ?? [0, 0, 0]; return new Modifiers(m[0], m[1], m[2]); }
    getActionTitle(): string | null { return this.def.actionTitle?.() ?? null; }
    getAdditionalDescription(): string | null { return this.def.note?.() ?? null; }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null {
        if (p.getCrimeState?.()?.getIsInJail?.()) return "Not while you're in jail";
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
    { id: "diet", title: () => `Blood Diet: ${Vampire.chosenDiet(player()).title}`, image: () => Vampire.chosenDiet(player()).image, instant: true,
        actionTitle: () => "Change",
        note: () => new BloodDietCell(Vampire.chosenDiet(player())).getAdditionalDescription(),
        run: () => Vampire.openDietMenu() },
    { id: "bloodBank", title: "Buy from a Blood Bank", image: R.drawable.icon_vamp_bloodbank, cost: 500,
        lock: (p) => (Vampire.has("bloodBank", p) || Vampire.hasMedicalJob(p) ? null : "Needs the Blood Bank Contact power or a medical job"),
        note: () => thirstNote(40, 2), run: (p) => Vampire.feed(p, 40, 2) },
    { id: "animal", title: "Animal Blood", image: R.drawable.icon_vamp_animal, cost: 50, mods: [0, -5, 0], note: () => thirstNote(20), run: (p) => Vampire.feed(p, 20, 0) },
    { id: "hunt", title: "Hunt at Night", image: R.drawable.icon_vamp_hunt,
        note: () => thirstNote(60, 10) + (Vampire.has("mistStep") ? "" : "10% chance of police trouble.\n"),
        run: (p) => {
            Vampire.feed(p, 60, 10);
            if (!Vampire.has("mistStep", p) && roll(0.1)) {
                pay(p, 2000);
                Vampire.state(p).suspicion = Math.min(100, Vampire.state(p).suspicion + 10);
                Vampire.alert("Police Trouble", `Someone saw you. You paid ${money(2000)} in "fines" and the police are watching (suspicion +10).`, R.drawable.police_badge);
            }
        } },
    { id: "partner", title: () => `Feed on ${Vampire.willingPartner(player())?.getFirstName() ?? "a Willing Partner"}`, image: R.drawable.icon_vamp_feedpartner,
        lock: (p) => (Vampire.willingPartner(p) ? null : "Your partner must know your secret"),
        note: () => thirstNote(30) + "−20 relationship with your partner.\n",
        run: (p) => { Vampire.feed(p, 30, 0); const w = Vampire.willingPartner(p); if (w) w.setRelationshipProgress(w.getRelationshipProgress() - 20); } },
];

export const HIDING: LifeActionDef[] = [
    { id: "layLow", title: "Lay Low", image: R.drawable.icon_vamp_laylow, mods: [0, -3, 0], note: () => "−15 suspicion\n", run: (p) => { const s = Vampire.state(p); s.suspicion = Math.max(0, s.suspicion - 15); } },
    { id: "fakeDeath", title: "Fake Your Death", image: R.drawable.icon_vamp_fakedeath, cost: 20000, note: () => "Suspicion back to 0 with a new name. You lose your job, and friends who don't know your secret think you died.\n",
        confirm: () => "Start over with a new name? You'll lose your job and the friends who don't know your secret.", run: (p) => Vampire.fakeDeath(p) },
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
