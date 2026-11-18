// Family & love extras:
// - True age of parents, children and your partner (they age normally; the Elixir of Youth makes them younger).
// - Give a family member or your partner the Elixir of Youth (same price as yours; 10 years younger, never below 18).
// - How long you've been together with your partner, and how long you've been married.
// - "Spend Time with Everyone": one week with your partner, parents, children and pets.
import { BigInteger, R } from "../runtime";
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

const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const refresh = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };

export const FamilyExtras = {
    elixirYears: 10,
    elixirMinAge: 18,
    /** Relationship gained with each person from "Spend Time with Everyone". */
    togetherBond: 10,
    get togetherModifiers(): Modifiers { return new Modifiers(0, 4, 3); },

    // ---------------------------------------------------------------- true age
    trueAgeYears(person: any): number {
        // Older saves never advanced family members' true age (original bug), so it can lag behind their age.
        if ((person.trueAgeInWeeks ?? 0) < person.getAgeInWeeks()) person.trueAgeInWeeks = person.getAgeInWeeks();
        return Math.floor(person.trueAgeInWeeks / WPY());
    },
    /** "34" or "34 (true age 44)". */
    ageText(person: any): string {
        const age = person.getAgeInYears(), trueAge = FamilyExtras.trueAgeYears(person);
        return trueAge > age ? `${age} (true age ${trueAge})` : `${age}`;
    },

    // ---------------------------------------------------------------- elixir for others
    elixirPrice(): BigInteger { return HealthEvent.elixirOfYouth.getCost(); },
    canGetElixir(person: any): boolean { return person.getIsAlive() && !person.getNotYetBorn() && person.getPetType?.() == null && person.getAgeInYears() > FamilyExtras.elixirMinAge; },
    elixirCell(person: any): ActionCellSingleViewModel | null {
        if (person == null || !person.getIsAlive() || person.getNotYetBorn()) return null;
        const p = GameStateManager.INSTANCE.getPersonState();
        const price = FamilyExtras.elixirPrice();
        const ok = FamilyExtras.canGetElixir(person);
        const sub = ok ? `Make ${person.getFirstName()} ${FamilyExtras.elixirYears} years younger (not below ${FamilyExtras.elixirMinAge}).`
            : `Only for people older than ${FamilyExtras.elixirMinAge}.`;
        return new ActionCellSingleViewModel(null, `Give ${person.getFirstName()} the Elixir of Youth`,  // no row picture, like the other Love/Health actions
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
    everyone(): any[] {
        const fam = GameStateManager.INSTANCE.getPersonState().getFamilyState();
        const out: any[] = [];
        const partner = fam.getPartner();
        if (partner != null && partner.getIsAlive()) out.push(partner);
        for (const list of [fam.getParents(), fam.getChildren(), fam.getPets()]) {
            for (const x of Array.from(list as any) as any[]) if (x.getIsAlive() && !x.getNotYetBorn()) out.push(x);
        }
        return out;
    },
    spendTimeCell(): ActionCellSingleViewModel {
        const people = FamilyExtras.everyone();
        const sub = people.length ? `A week with ${people.length === 1 ? people[0].getFirstName() : `all ${people.length} of your family, partner and pets`}. Everyone grows closer.`
            : "You don't have any family, partner or pets to spend time with.";
        const text = new TextLabelViewModel(sub, null, false, false, null, null);
        return new ActionCellSingleViewModel(null, "Spend Time with Everyone", text,
            new ButtonViewModel("Free", null, people.length > 0, false, false, false, false,
                { invoke: () => { FamilyExtras.spendTimeWithEveryone(); return null; } }),
            null, null);
    },
    spendTimeWithEveryone(): number {
        const p = GameStateManager.INSTANCE.getPersonState();
        const people = FamilyExtras.everyone();
        if (!people.length) return 0;
        for (const x of people) x.setRelationshipProgress(x.getRelationshipProgress() + FamilyExtras.togetherBond);
        p.getAttributeState().setDeltaValueImmediate(FamilyExtras.togetherModifiers);
        p.applyWeekly();
        refresh();
        return people.length;
    },
};
