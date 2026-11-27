// Family & love extras:
// - True age of parents, children and your partner (they age normally; the Elixir of Youth makes them younger).
// - Give a family member or your partner the Elixir of Youth (same price as yours; 10 years younger, never below 18).
// - How long you've been together with your partner, and how long you've been married.
// - "Spend Time with Everyone": a week with each person you have a relationship with (v0.21.0: partner, parents, children,
//   siblings, extended family, friends and pets — 12 relationships = 12 weeks).
import { TrueAge } from "./TrueAge";
import { BigInteger, R } from "../runtime";
import { WorkAction } from "../Enums/WorkAction";
import { GenericListType } from "../Fragments/GenericListType";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { HealthEvent } from "../Enums/HealthEvent";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { Constants } from "../Utils/Constants";
import { Relationships } from "../Social/Relationships";

const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const refresh = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };

export const FamilyExtras = {
    elixirYears: 10,
    elixirMinAge: 18,
    /** Relationship gained with each person from "Spend Time with Everyone" (a whole week just with them; v0.21.1: +400,
     *  never halved by a bad mood, up to the 1000 maximum). */
    togetherBond: 400,
    get togetherModifiers(): Modifiers { return new Modifiers(0, 4, 3); },

    // ---------------------------------------------------------------- true age
    trueAgeYears(person: any): number {
        FamilyExtras.fixTrueAge(person);
        return TrueAge.yearsNumber(person);
    },
    /** Every digit, with commas (v0.29.2: the true age has no ceiling). */
    trueAgeText(person: any): string {
        FamilyExtras.fixTrueAge(person);
        return TrueAge.text(person);
    },
    /** Older saves never advanced family members' true age (original bug), so it can lag behind their age. */
    fixTrueAge(person: any): void {
        if (person.trueAgeBlocks == null && (person.trueAgeInWeeks ?? 0) < person.getAgeInWeeks()) person.trueAgeInWeeks = person.getAgeInWeeks();
    },
    /** "34 (true age 34)" / "34 (true age 44)" — v0.24.0: everyone's true age is always shown. */
    ageText(person: any): string {
        FamilyExtras.fixTrueAge(person);
        return `${person.getAgeInYears()} (true age ${FamilyExtras.trueAgeText(person)})`;
    },

    // ---------------------------------------------------------------- elixir for others
    elixirPrice(): BigInteger { return HealthEvent.elixirOfYouth.getCost(); },
    /** v0.15.0: the Elixir of Youth was reworked into the vampire Cure, so nobody can be made younger any more. */
    elixirRetired: true,
    canGetElixir(person: any): boolean { if (FamilyExtras.elixirRetired) return false; return person.getIsAlive() && !person.getNotYetBorn() && person.getPetType?.() == null && person.getAgeInYears() > FamilyExtras.elixirMinAge; },
    elixirCell(person: any): ActionCellSingleViewModel | null {
        if (FamilyExtras.elixirRetired) return null;
        if (person == null || !person.getIsAlive() || person.getNotYetBorn()) return null;
        const p = GameStateManager.INSTANCE.getPersonState();
        const price = FamilyExtras.elixirPrice();
        const ok = FamilyExtras.canGetElixir(person);
        const sub = ok ? `Make ${person.getFirstName()} ${FamilyExtras.elixirYears} years younger (not below ${FamilyExtras.elixirMinAge}).`
            : `Only for people older than ${FamilyExtras.elixirMinAge}.`;
        return new ActionCellSingleViewModel(R.drawable.health_youthelixir, `Give ${person.getFirstName()} the Elixir of Youth`,
            new TextLabelViewModel(sub, null, false, false, null, null),
            new ButtonViewModel(ExtensionsKt.numberDisplayString(price, true), null, ok && p.getMoneyState().getCash().compareTo(price) >= 0, false, !ok, false, false,
                { invoke: () => { FamilyExtras.confirmElixir(person); return null; } }),
            null, null);
    },
    confirmElixir(person: any) {
        const price = ExtensionsKt.numberDisplayString(FamilyExtras.elixirPrice(), true);
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Elixir of Youth",
            `Give ${person.getFullName()} (age ${person.getAgeInYears()}) the Elixir of Youth for ${price}?`, R.drawable.health_youthelixir, null, null,
            new AlertActionViewModel("Give it", { invoke: () => { FamilyExtras.giveElixir(person); return null; } }),
            new AlertActionViewModel("Cancel", { invoke: () => null }), null, AlertType.Alert, 0, null), false, 2, null);
    },
    /** Returns true if it was given. */
    giveElixir(person: any): boolean {
        const p = GameStateManager.INSTANCE.getPersonState();
        const price = FamilyExtras.elixirPrice();
        if (!FamilyExtras.canGetElixir(person) || p.getMoneyState().getCash().compareTo(price) < 0) return false;
        FamilyExtras.trueAgeYears(person);   // bring an old save's true age up to date first
        const before = person.getAgeInYears();
        person.setAgeInWeeks(Math.max(FamilyExtras.elixirMinAge * WPY(), person.getAgeInWeeks() - FamilyExtras.elixirYears * WPY()));
        person.setRelationshipProgress(person.getRelationshipProgress() + 10);
        MoneyState.updateMoney$default(p.getMoneyState(), price, MoneyUpdateType.directSpend, null, null, 12, null);
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Elixir of Youth",
            `${person.getFirstName()} drank the Elixir of Youth and went from ${before} to ${person.getAgeInYears()}! (True age ${FamilyExtras.trueAgeYears(person)}.)`,
            R.drawable.health_youthelixir, null, null, null, null, null, null, 504, null), false, 2, null);
        p.applyWeekly();
        for (const t of [GenericListType.parentDetails, GenericListType.childDetails]) { try { Utils.INSTANCE.reloadGenericList(t); } catch { /* not open */ } }
        refresh();
        return true;
    },

    // ---------------------------------------------------------------- relationship counters
    now(): number { return GameStateManager.INSTANCE.getPersonState().getTrueAgeInWeeks(); },
    /** Partners from older saves have no start date: start counting from now. */
    ensureTogetherSince(partner: any) {
        if (partner == null) return;
        if (partner.togetherSinceWeek == null) partner.togetherSinceWeek = FamilyExtras.now();
        const status = GameStateManager.INSTANCE.getPersonState().getRomanticRelationshipStatus()?.name?.();
        if (status === "married" && partner.marriedSinceWeek == null) partner.marriedSinceWeek = FamilyExtras.now();
    },
    span(weeks: number): string {
        const years = Math.floor(Math.max(0, weeks) / WPY());
        if (years < 1) return "less than a year";
        return `${years} year${years === 1 ? "" : "s"}`;
    },
    /** "Together 3 years · Married 1 year", or null when single. */
    countersText(): string | null {
        const p = GameStateManager.INSTANCE.getPersonState();
        const partner = p.getFamilyState().getPartner();
        if (partner == null) return null;
        FamilyExtras.ensureTogetherSince(partner);
        const now = FamilyExtras.now();
        let s = `Together ${FamilyExtras.span(now - partner.togetherSinceWeek)}`;
        if (partner.marriedSinceWeek != null) s += ` · Married ${FamilyExtras.span(now - partner.marriedSinceWeek)}`;
        return s;
    },
    onStartDating(person: any) { person.togetherSinceWeek = FamilyExtras.now(); person.marriedSinceWeek = null; },
    onMarried(partner: any) { if (partner != null) { FamilyExtras.ensureTogetherSince(partner); partner.marriedSinceWeek = FamilyExtras.now(); } },

    // ---------------------------------------------------------------- spend time with everyone
    /** Every relationship you have (v0.21.0): partner, children, parents, siblings, extended family, friends, pets. Exes don't come. */
    everyone(): any[] {
        const p = GameStateManager.INSTANCE.getPersonState();
        const fam = p.getFamilyState();
        const out: any[] = [];
        const alive = (x: any) => x != null && x.getIsAlive() && !(x.getNotYetBorn?.() ?? false);
        const partner = fam.getPartner();
        if (alive(partner)) out.push(partner);
        for (const list of [fam.getChildren(), fam.getParents()]) for (const x of Array.from(list as any) as any[]) if (alive(x)) out.push(x);
        const social = (p as any).getSocial?.();
        if (social != null) {
            for (const kind of ["sibling", "grandchild", "greatGrandchild", "grandparent", "nibling", "auntUncle", "cousin", "friend"])
                for (const s of social.list(kind)) if (s.getIsAlive()) out.push(s);
        }
        for (const x of Array.from(fam.getPets() as any) as any[]) if (alive(x)) out.push(x);
        return out;
    },
    weeksText(n: number): string { return `${n} week${n === 1 ? "" : "s"}`; },
    spendTimeCell(): ActionCellSingleViewModel {
        const people = FamilyExtras.everyone();
        const n = people.length;
        const sub = n === 0 ? "You don't have anyone to spend time with yet."
            : n === 1 ? `A week with ${people[0].getFirstName()}: +${FamilyExtras.togetherBond} relationship.`
            : `A week with each of your ${n} relationships (family, partner, friends and pets): ${FamilyExtras.weeksText(n)} go by, +${FamilyExtras.togetherBond} relationship with each.`;
        const job = (() => { try { return GameStateManager.INSTANCE.getPersonState().getJobState().getCurrentJob(); } catch { return null; } })();
        const sub2 = n && job != null ? `${sub} You still go to work every week (pay and promotions).` : sub;
        const text = new TextLabelViewModel(sub2, null, false, false, null, null);
        return new ActionCellSingleViewModel(R.drawable.family, "Spend Time with Everyone", text,
            new ButtonViewModel(n ? FamilyExtras.weeksText(n) : "Free", null, n > 0, false, false, false, false,
                { invoke: () => { FamilyExtras.askSpendTime(); return null; } }),
            null, null);
    },
    /** More than one person: confirm first, because it takes that many weeks. */
    askSpendTime() {
        const n = FamilyExtras.everyone().length;
        if (n <= 1) { FamilyExtras.spendTimeWithEveryone(); return; }
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Spend Time with Everyone",
            `You'll spend a week with each of your ${n} relationships, one after another. ${FamilyExtras.weeksText(n)} will go by, and each of them gets +${FamilyExtras.togetherBond} relationship.${GameStateManager.INSTANCE.getPersonState().getJobState().getCurrentJob() != null ? " You'll still go to work and get paid (and promoted)." : ""}`, R.drawable.family, null, null,
            new AlertActionViewModel(`Spend ${FamilyExtras.weeksText(n)}`, { invoke: () => { FamilyExtras.spendTimeWithEveryone(); return null; } }),
            new AlertActionViewModel("Cancel", { invoke: () => null }), null, AlertType.Alert, 0, null), false, 2, null);
    },
    /** The work part of the "Time Well Spent" summary: weeks worked, money in, promotions. */
    workLine(p: any, job0: any, level0: number, cash0: number, worked: number): string {
        if (!worked || job0 == null) return "";
        const job = p.getJobState().getCurrentJob();
        const earned = Number(p.getMoneyState().getCash().add(p.getMoneyState().getSavings()).toString()) - cash0;
        const st = job != null ? p.getJobState().getState(job) : null;
        const promo = job === job0 && st != null && st.getLevel() > level0 ? ` You were promoted to ${st.getJobTitle()}!` : "";
        return `\nYou still went to work: ${FamilyExtras.weeksText(worked)} of shifts${earned > 0 ? `, ${ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(earned)), true)} better off` : ""}.${promo}`;
    },
    /** v0.36.1: Spend Time with Everyone stops when health, happiness or sanity falls below this. */
    stopBelow: 20,
    lowStat(p: any): string {
        const at = p.getAttributeState();
        const v: [string, number][] = [["health", Number(at.getHealth())], ["happiness", Number(at.getHappiness())], ["sanity", Number(at.getSanity())]];
        return v.sort((a, b) => a[1] - b[1])[0][0];
    },
    /** One week with each person, in order. Stops early if you die, end up in jail or are in danger. Returns the weeks spent. */
    spendTimeWithEveryone(): number {
        const p: any = GameStateManager.INSTANCE.getPersonState();
        const people = FamilyExtras.everyone();
        if (!people.length) return 0;
        let weeks = 0;
        const names: string[] = [];
        const playing = () => GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted() && GameStateManager.INSTANCE.getPersonState() === p;
        // nobody you're spending these weeks with drifts away while they wait for their week
        Relationships.together = new Set(people);
        // v0.28.1: you still go to work those weeks (pay and promotions), and what happens goes to News
        const job0 = p.getJobState().getCurrentJob();
        const level0 = job0 != null ? p.getJobState().getState(job0).getLevel() : 0;
        const cash0 = Number(p.getMoneyState().getCash().add(p.getMoneyState().getSavings()).toString());
        let worked = 0, stopped = false;
        AlertManager.inWeek++;
        try {
            for (const x of people) {
                if (!playing()) break;
                try { if (p.getCrimeState().getIsInJail()) break; } catch { /* ignore */ }
                if (!x.getIsAlive()) continue; // they died during the weeks before theirs
                const before = x.getRelationshipProgress();
                Relationships.applyGain(x, "rel:everyone", FamilyExtras.togetherBond);
                // the full +400 even if they're Stressed or Upset (applyGain would halve it)
                if (x.getRelationshipProgress() < before + FamilyExtras.togetherBond) x.setRelationshipProgress(before + FamilyExtras.togetherBond);
                p.getAttributeState().setDeltaValueImmediate(FamilyExtras.togetherModifiers);
                const job = p.getJobState().getCurrentJob();
                let inJail = false; try { inJail = p.getCrimeState().getIsInJail(); } catch { /* ignore */ }
                if (job != null && !inJail) { p.getJobState().work(job, WorkAction.normal); worked++; }   // work() passes the week
                else p.applyWeekly();
                weeks++;
                names.push(x.getFirstName());
                // v0.36.1: stop if you're in danger (an illness or a bad stretch), so you can deal with it in time
                // instead of the weeks running on while the warnings wait in the queue
                try {
                    const at = p.getAttributeState();
                    const low = Math.min(Number(at.getHealth()), Number(at.getHappiness()), Number(at.getSanity()));
                    if (low < FamilyExtras.stopBelow && weeks < people.length && !p?.vampire?.isVampire) { stopped = true; break; }
                } catch { /* ignore */ }
            }
        } finally {
            Relationships.together = null;
            AlertManager.inWeek--;
        }
        if ((weeks > 1 || worked > 0 || (stopped && weeks > 0)) && playing()) {
            const list = names.length > 6 ? `${names.slice(0, 5).join(", ")} and ${names.length - 5} more` : names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Time Well Spent",
                `You spent ${FamilyExtras.weeksText(weeks)} with ${list}${weeks < people.length ? ` (${people.length - weeks} had to wait for another time)` : ""}${stopped ? `. You stopped early to look after yourself: your ${FamilyExtras.lowStat(p)} is low` : ""}. ${weeks < people.length ? (weeks === 1 ? "They're" : "Each of them is") : "Everyone is"} +${FamilyExtras.togetherBond} closer to you.${FamilyExtras.workLine(p, job0, level0, cash0, worked)}`,
                R.drawable.family, null, null, null, null, null, null, 504, null), false, 2, null);
        }
        refresh();
        return weeks;
    },
};
