// Family & love extras:
// - True age of parents, children and your partner (they age normally; the Elixir of Youth makes them younger).
// - Give a family member or your partner the Elixir of Youth (same price as yours; 10 years younger, never below 18).
// - How long you've been together with your partner, and how long you've been married.
// - "Spend Time with Everyone": a week with each person you have a relationship with (v0.21.0: partner, parents, children,
//   siblings, extended family, friends and pets — 12 relationships = 12 weeks).
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
        // Older saves never advanced family members' true age (original bug), so it can lag behind their age.
        if ((person.trueAgeInWeeks ?? 0) < person.getAgeInWeeks()) person.trueAgeInWeeks = person.getAgeInWeeks();
        return Math.floor(person.trueAgeInWeeks / WPY());
    },
    /** "34 (true age 34)" / "34 (true age 44)" — v0.24.0: everyone's true age is always shown. */
    ageText(person: any): string {
        const age = person.getAgeInYears(), trueAge = FamilyExtras.trueAgeYears(person);
        return `${age} (true age ${Math.max(age, trueAge)})`;
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
        const text = new TextLabelViewModel(sub, null, false, false, null, null);
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
            `You'll spend a week with each of your ${n} relationships, one after another. ${FamilyExtras.weeksText(n)} will go by, and each of them gets +${FamilyExtras.togetherBond} relationship.`, R.drawable.family, null, null,
            new AlertActionViewModel(`Spend ${FamilyExtras.weeksText(n)}`, { invoke: () => { FamilyExtras.spendTimeWithEveryone(); return null; } }),
            new AlertActionViewModel("Cancel", { invoke: () => null }), null, AlertType.Alert, 0, null), false, 2, null);
    },
    /** One week with each person, in order. Stops early if you die or end up in jail. Returns the weeks spent. */
    spendTimeWithEveryone(): number {
        const p: any = GameStateManager.INSTANCE.getPersonState();
        const people = FamilyExtras.everyone();
        if (!people.length) return 0;
        let weeks = 0;
        const names: string[] = [];
        const playing = () => GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted() && GameStateManager.INSTANCE.getPersonState() === p;
        // nobody you're spending these weeks with drifts away while they wait for their week
        Relationships.together = new Set(people);
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
                p.applyWeekly();
                weeks++;
                names.push(x.getFirstName());
            }
        } finally {
            Relationships.together = null;
        }
        if (weeks > 1 && playing()) {
            const list = names.length > 6 ? `${names.slice(0, 5).join(", ")} and ${names.length - 5} more` : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Time Well Spent",
                `You spent ${FamilyExtras.weeksText(weeks)} with ${list}${weeks < people.length ? ` (${people.length - weeks} had to wait for another time)` : ""}. Everyone is +${FamilyExtras.togetherBond} closer to you.`,
                R.drawable.family, null, null, null, null, null, null, 504, null), false, 2, null);
        }
        refresh();
        return weeks;
    },
};
