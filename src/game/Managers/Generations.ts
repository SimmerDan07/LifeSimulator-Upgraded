// Generational play (Life Sim Upgraded): when you die, continue the family line as one of your children.
// The heir inherits the estate (money after debts, homes, possessions, businesses, stocks, pets),
// keeps their own job, gets schooling that matches their age/job, and remembers their parents.
import { ArrayList, BigInteger, Pair } from "../runtime";
import { Schooling } from "./Schooling";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { Player } from "./Player";
import { Person } from "./Person";
import { FamilyState } from "./FamilyState";
import { MoneyState } from "./MoneyState";
import { Relationship } from "../Enums/Relationship";
import { CompletableAction } from "../Enums/CompletableAction";
import { Sexuality } from "../Enums/Sexuality";
import { GenericListType } from "../Fragments/GenericListType";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { SingleButtonViewModel } from "../Models/SingleButtonViewModel";
import type { BaseViewModel } from "../Models/BaseViewModel";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { Relationships } from "../Social/Relationships";
import { SaveCodec } from "../save/SaveCodec";

export class Generations {
    /** Youngest age you can take over as (same minimum age the game uses for players). */
    static minHeirAge(): number { return Constants.Person.INSTANCE.getMinAgeInYears(); }

    static eligibleHeirs(parent: Player): Person[] {
        return parent.getFamilyState().getAliveChildren().filter((c: Person) => !c.getNotYetBorn() && c.getAgeInYears() >= Generations.minHeirAge());
    }

    /** Estate passed on: cash + savings minus the outstanding loan (debts don't pass to the heir). */
    static estate(parent: Player): BigInteger {
        const m = parent.getMoneyState();
        const v = m.getCash().add(m.getSavings()).subtract(m.getLoanLimitUsed());
        return v.signum() > 0 ? v : BigInteger.ZERO;
    }

    static openHeirScreen(): void {
        Utils.INSTANCE.navigateTo(GenericListType.chooseHeir, "", false);
    }

    static heirListViewModel(): GenericListFragmentViewModel {
        const parent = GameStateManager.INSTANCE.getPersonState();
        const header = new ArrayList<BaseViewModel>();
        header.add(new NavigationBarViewModel("Continue Your Legacy", false));
        const content = new ArrayList<BaseViewModel>();
        const heirs = Generations.eligibleHeirs(parent);
        const intro = new TextLabelViewModel(
            `${parent.getFullName()} has passed away. Choose a child to carry on the family line. ` +
            `They inherit ${ExtensionsKt.numberDisplayString(Generations.estate(parent), true)} plus all homes, possessions, businesses and investments.`,
            null, false, false, null, null, 62, null);
        content.add(new SingleLabelCellViewModel("HeirIntro", intro));
        content.add(new HeaderTitleViewModel(`Generation ${parent.getGeneration() + 1}`));
        if (heirs.length === 0) {
            content.add(new SingleLabelCellViewModel("NoHeirs", new TextLabelViewModel(
                `No children aged ${Generations.minHeirAge()} or older.`, null, false, false, null, null, 62, null)));
        }
        for (const child of heirs) {
            const sub = new TextLabelViewModel(`${child.getAgeInYears()} years old · ${child.getChildStatus()}`, null, false, false, null, null, 62, null);
            content.add(new ActionCellSingleViewModel(child.getAgeGroup().imageId(child.getSex()), child.getFullName(), sub,
                new ButtonViewModel("Play as " + child.getFirstName(), null, true, false, false, true, false,
                    { invoke: () => Generations.continueAs(child) }, 122, null), null, null, 48, null));
        }
        const footer = new ArrayList<BaseViewModel>();
        footer.add(new SingleButtonViewModel(new ButtonViewModel("Start a new life instead", null, false, false, false, false, false,
            { invoke: () => Utils.INSTANCE.triggerNewGameStart() }, 126, null)));
        return new GenericListFragmentViewModel(content, header, footer);
    }

    /** Hand the game over to `child`. Call after the parent's death has been recorded. */
    static continueAs(child: Person): void {
        const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
        const parent = GameStateManager.INSTANCE.getPersonState();
        const estate = Generations.estate(parent);

        // Keep a frozen copy of the parent in the cemetery before their belongings move on.
        const snapshot = SaveCodec.decode(SaveCodec.encode(parent)) as Player;
        gsm.getCemetaryState().removeLife(parent.getId());
        gsm.getCemetaryState().addLife(snapshot);

        const heir = new Player(child.getFirstName(), child.getLastName() ?? parent.getLastName(), child.getGender(),
            child.getSexuality() ?? Sexuality.straight, child.getSex(), child.getAgeInWeeks());
        heir.setTrueAgeInWeeks(child.getTrueAgeInWeeks());
        heir.setCountry(parent.getCountry());
        heir.setLifeScenario(parent.getLifeScenario());
        heir.changeDiet(parent.getDiet());
        heir.initializeRandomTraits();
        heir.getPerkState().setPerks(new ArrayList(parent.getPerkState().getPerks()));
        heir.generation = parent.getGeneration() + 1;
        heir.ancestors = [...parent.getAncestors(), `${parent.getFullName()} (died at ${parent.getAgeInYears()})`];

        // Keep the calendar month the same when play passes to the heir (their birthday is in their own month).
        const weeksPerMonth = Constants.Time.INSTANCE.getWeeksPerMonth(), weeksPerYear = Constants.Time.INSTANCE.getWeeksPerYear();
        heir.setBirthMonth(parent.getCurrentMonthIndex() - Math.floor((child.getAgeInWeeks() % weeksPerYear) / weeksPerMonth));

        // Schooling: kids went to school while growing up (preschool from 3 … high school done at 18);
        // a job implies its required education.
        const age = child.getAgeInYears();
        const edu = heir.getCompletableActionState();
        Schooling.fillForAge(heir, true);
        const childJob = child.getChildJobState();
        if (childJob != null && childJob.getCurrentJob() != null) {
            heir.jobState = childJob;
            const job = childJob.getCurrentJob();
            for (let lvl = 1; lvl <= job.getMaxLevels(); lvl++) {
                const req = job.educationRequirement(lvl);
                if (req != null && lvl <= childJob.getState(job).getLevel()) {
                    edu.completeAction(CompletableAction.middleSchool);
                    edu.completeAction(CompletableAction.highSchool);
                    edu.completeAction(req);
                }
            }
        }
        Schooling.fillForAge(heir, true);  // schools before any the job needed

        // Inheritance
        heir.setMoneyState(new MoneyState(estate, BigInteger.ZERO));
        heir.housingState = parent.housingState;
        heir.setItemState(parent.getItemState());
        heir.setBusinessState(parent.getBusinessState());
        heir.stockState = parent.stockState;

        // Family: the deceased parent, the surviving partner as the other parent, and the pets.
        const fam = new FamilyState();
        const dead = new Person(Relationship.parent, parent.getSex(), parent.getLastName(), parent.getAgeInWeeks());
        dead.setFirstName(parent.getFirstName());
        dead.setAlive(false);
        dead.setBuried(true);
        dead.setRelationshipProgress(child.getRelationshipProgress());
        fam.getFamilyMembers().add(dead);
        const partner = parent.getFamilyState().getPartner();
        if (partner != null && partner.getIsAlive()) {
            partner.setRelationship(Relationship.parent);
            partner.setRelationshipProgress(child.getRelationshipProgress());
            fam.getFamilyMembers().add(partner);
        }
        for (const pet of parent.getFamilyState().getPets()) if (pet.getIsAlive()) fam.getFamilyMembers().add(pet);
        heir.familyState = fam;
        // Your brothers and sisters: the deceased's other children.
        Relationships.inheritSiblings(parent, heir, child);

        // Real estate: every property (with its mortgage) passes to the heir; gifts they received come back,
        // and if they were living in one of the family's properties they stay there.
        const realEstate = parent.getRealEstate();
        realEstate.markHeirHome(child);
        heir.realEstate = realEstate;
        realEstate.inherit(parent, heir, child);
        const propCount = realEstate.all().length;

        // Hand over control.
        gsm.getSaveState().currentSlot().setPersonState(heir);
        gsm.getSaveState().setHasGameStarted(true);
        GameStateManager.INSTANCE.saveData();
        Utils.INSTANCE.navigationBackToMainGame();
        const f = GameStateManager.INSTANCE.getMainGameFragment();
        if (f != null) f.updateUI(null);

        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(
            `Generation ${heir.getGeneration()}`,
            `You are now ${heir.getFullName()}, ${age}, child of ${parent.getFullName()}. ` +
            `You inherited ${ExtensionsKt.numberDisplayString(estate, true)} and everything your parent owned` +
            (propCount ? `, including ${propCount} propert${propCount === 1 ? "y" : "ies"} (see Real Estate on your Profile).` : "."),
            "will", null, null, null, null, null, null, 504, null), false, 2, null);
    }

    /** Extra rows for the profile identity card. */
    static identityRows(p: Player): Pair<string, string>[] {
        if (p.getGeneration() <= 1) return [];
        return [new Pair("Generation", String(p.getGeneration()))];
    }
}
