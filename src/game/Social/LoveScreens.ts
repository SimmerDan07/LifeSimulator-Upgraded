// Love tab remodel (v0.12.0): the Love tab itself, the shared person screen and the Past Relationships list.
//
// Love tab: status and group actions on top, then Partner, Parents, Children, Siblings, Friends, Pets,
// Past Relationships and More. Empty groups are hidden. Inside a group: oldest first, the deceased last under "In memory".
// Every card opens the same person screen: a large card, an About card, then Spend time / Big moments / Hard choices.
import { ArrayList, BigInteger, R, SpannableStringBuilder } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { SingleButtonViewModel } from "../Models/SingleButtonViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { PersonCardViewModel, SubHeaderViewModel } from "../Models/PersonCardViewModel";
import { GameStateManager } from "../Managers/GameStateManager";
import { FamilyExtras } from "../Managers/FamilyExtras";
import { ComingOut } from "../Managers/ComingOut";
import { Relationship } from "../Enums/Relationship";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { LoveEvent } from "../Enums/LoveEvent";
import { PersonInteraction } from "../Enums/PersonInteraction";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { Constants } from "../Utils/Constants";
import { Pair } from "../runtime";
import { Relationships, MOOD_TITLE } from "./Relationships";
import { LoveActions, LoveActionCell, loveAction, Section } from "./LoveActions";
import { SocialPerson } from "./SocialPerson";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const S = (k: string) => Utils.INSTANCE.getString((R.string as any)[k]);
const text = (s: string, color: any = null) => new TextLabelViewModel(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), s, color, null, null, 12, null), false, false, null, 14, null);
const boldText = (b: string, s: string, color: any = null) => new TextLabelViewModel(
    ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), b, null, null, null, 14, null), s, color, null, null, 12, null), false, false, null, 14, null);
const open = (id: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.personDetails, id, false, 4, null);

const TIME_LOVE = [LoveEvent.watchMovie, LoveEvent.museum, LoveEvent.romanticDinner, LoveEvent.watchPlay];
const HARD_LOVE = [LoveEvent.breakUp, LoveEvent.divorce, LoveEvent.abortChild];
const HARD_PI = [PersonInteraction.putUpForAdoption, PersonInteraction.abandonPet];
const BIG_PI = [PersonInteraction.funeral, PersonInteraction.roadTrip, PersonInteraction.familyVacation];

export const LoveScreens = {
    // ------------------------------------------------------------------ cards
    headImage(person: any): any {
        const pet = person.getPetType?.();
        if (pet != null) return pet.easternEggImage(person.getFirstName()) ?? pet.getImageId();
        try { return person.getAgeGroup().imageId(person.getSex()); } catch { return R.drawable.non_binary_1; }
    },
    ageLine(person: any): string {
        if (!person.getIsAlive()) return person.getIsBuried?.() ? "Deceased · laid to rest" : "Deceased";
        if (person.getPetType?.() != null) return `Age: ${person.getAgeInYears()}`;
        return `Age: ${FamilyExtras.ageText(person)}`;
    },
    relationTitle(person: any): string {
        try {
            const t = person.getTitle();
            if (t) return t;
        } catch { /* fall through */ }
        if (Relationships.kindOf(person) === "partner") return person.getSex()?.name?.() === "male" ? "Late husband" : "Late wife";
        return "";
    },
    card(person: any, opts: { large?: boolean; click?: boolean } = {}): PersonCardViewModel {
        const score = person.getRelationshipProgress();
        const isPet = person.getPetType?.() != null;
        const note: string | null = null;   // the mood is in the About card
        return new PersonCardViewModel(person.getId(), LoveScreens.headImage(person), LoveScreens.relationTitle(person),
            isPet ? person.getFirstName() : person.getFullName(), LoveScreens.ageLine(person),
            score, RelationshipProgressStatus.INSTANCE.getMaxValue(), Relationships.statusKey(score), Relationships.statusTitle(person),
            Relationships.badges(person), opts.click === false ? null : { invoke: () => open(person.getId()) },
            !!opts.large, !person.getIsAlive(), note);
    },
    /** Cards for a group: living people oldest first, then "In memory". */
    group(list: any[], out: ArrayList<BaseViewModel>, extra?: (alive: any[]) => void) {
        const living = Relationships.byAge(list.filter((x) => x.getIsAlive()));
        const dead = Relationships.byAge(list.filter((x) => !x.getIsAlive()));
        for (const x of living) {
            if (x.getNotYetBorn?.()) out.add(x.getPersonNameAndAgeInfoViewModel());
            else out.add(LoveScreens.card(x));
        }
        extra?.(living);
        if (dead.length) {
            out.add(new SubHeaderViewModel("In memory"));
            for (const x of dead) out.add(LoveScreens.card(x));
        }
    },

    // ------------------------------------------------------------------ Love tab
    tab(): GenericListFragmentViewModel {
        const p = player();
        Relationships.repairDrift(p);
        const fam = p.getFamilyState();
        const out = new ArrayList<BaseViewModel>();
        const status = p.getRomanticRelationshipStatus();

        // Status, counters and things to do with everyone
        out.add(new HeaderTitleViewModel("Relationships"));
        const sb = ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), S("Common_Status") + ": ", null, null, null, 14, null), status.getTitle(), R.color.flatSkyBlue, null, null, 12, null);
        const counters = FamilyExtras.countersText();
        if (counters != null) ExtensionsKt.appendNormal$default(ExtensionsKt.appendNormal$default(sb, "   ·   ", null, null, null, 14, null), counters, null, null, null, 14, null);
        out.add(new SingleLabelCellViewModel("RelationshipStatus", new TextLabelViewModel(sb, false, false, null, 14, null)));
        out.add(FamilyExtras.spendTimeCell());
        out.add(new LoveActionCell(loveAction("gathering"), null).cell());
        if (fam.getAliveChildren().size() > 0) out.add(ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(PersonInteraction.familyVacation, null));

        // Partner (or Find Love)
        out.add(new HeaderTitleViewModel("Partner"));
        const partner = fam.getPartner();
        if (partner != null) {
            out.add(LoveScreens.card(partner));
        } else {
            out.add(new SubHeaderViewModel("Find Love"));
            const events = Array.from(LoveEvent.INSTANCE.eventsForPlayer(p) as any) as any[];
            if (events.length === 0) out.add(new SingleLabelCellViewModel("NoDating", text(p.getCrimeState().getIsInJail() ? "You can't date while you're in jail." : "Not right now.")));
            for (const e of events) out.add(ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(e, null));
        }

        // Parents
        const parents = Relationships.family(Relationship.parent, p);
        if (parents.length) {
            out.add(new HeaderTitleViewModel(S("HelpSection_Parents")));
            let allowance: string, color: any = null;
            if (!fam.getParentsStillLiving()) allowance = S("FamilyEvent_ParentsDead");
            else if (!p.getCanBeSupportedByFamily()) allowance = S("FamilyEvent_TooOldForAllowance");
            else { allowance = ExtensionsKt.numberDisplayString$default(p.getCurrentAllowance(), false, 1, null); color = R.color.flatGreen; }
            const c = new LeftRightCellViewModel("ParentAllowance", ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), S("Family_AllowanceLabel") + ": ", null, null, null, 14, null), allowance, color, null, null, 12, null));
            out.add(c);
            LoveScreens.group(parents, out, (living) => { if (living.length) out.add(ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(PersonInteraction.roadTrip, null)); });
        }

        // Children (pregnancy included)
        const children = Relationships.family(Relationship.child, p);
        if (children.length) { out.add(new HeaderTitleViewModel(S("Common_Children"))); LoveScreens.group(children, out); }

        // Siblings
        const siblings = Relationships.siblings(p);
        if (siblings.length) { out.add(new HeaderTitleViewModel("Siblings")); LoveScreens.group(siblings, out); }

        // Friends
        const friends = Relationships.friends(p);
        if (friends.length || p.getAgeInYears() >= 4) {
            out.add(new HeaderTitleViewModel(`Friends${friends.length ? ` (${friends.length}/${Relationships.maxFriends})` : ""}`));
            LoveScreens.group(friends, out);
            out.add(new LoveActionCell(loveAction("meetPeople"), null).cell());
        }

        // Pets (living)
        out.add(new HeaderTitleViewModel(S("Common_Pets")));
        for (const pet of Relationships.byAge(Relationships.family(Relationship.pet, p).filter((x) => x.getIsAlive()))) out.add(LoveScreens.card(pet));
        out.add(ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(PersonInteraction.adoptPet, null));

        // Past relationships (collapsed)
        const exes = Relationships.exes(p);
        if (exes.length) {
            out.add(new HeaderTitleViewModel("Past Relationships"));
            const row = new LeftRightCellViewModel("PastRelationships", boldText(`${exes.length} past relationship${exes.length === 1 ? "" : "s"}`, ""), text(exes.map((e) => e.getFirstName()).slice(0, 4).join(", ") + (exes.length > 4 ? "…" : "")), null, 8, null);
            row.setOnClick({ invoke: () => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.pastRelationships, null, false, 6, null) });
            out.add(row);
        }

        // More
        const comingOut = ComingOut.cell();
        if (comingOut != null) { out.add(new HeaderTitleViewModel("More")); out.add(comingOut); }
        return new GenericListFragmentViewModel(out);
    },

    pastRelationships(): GenericListFragmentViewModel {
        const out = new ArrayList<BaseViewModel>();
        const exes = Relationships.exes();
        if (!exes.length) out.add(new SingleLabelCellViewModel("NoExes", text("No past relationships.")));
        // most recent breakup first
        for (const e of exes.slice().sort((a, b) => b.sinceWeek - a.sinceWeek)) out.add(LoveScreens.card(e));
        return new GenericListFragmentViewModel(out);
    },

    // ------------------------------------------------------------------ person screen
    aboutRows(t: any): [string, string][] {
        const p = player();
        const kind = Relationships.kindOf(t);
        const rows: [string, string][] = [];
        const span = (w: number) => FamilyExtras.span(w);
        if (kind === "pet") {
            rows.push([S("Common_Animal"), t.getPetType().getTitle()]);
            return rows;
        }
        if (t.getIsAlive()) rows.push(["Mood", MOOD_TITLE[Relationships.mood(t)]]);
        rows.push([S("identity_name_gender"), t.getGender()?.getTitle?.() ?? ""]);
        if (kind === "partner" && t.getIsAlive()) {
            const lp = t.getLoverPersonality();
            if (lp != null) rows.push([S("Alert_Love_YouMetSomeone_Personality"), lp.getTitle()]);
            FamilyExtras.ensureTogetherSince(t);
            const now = FamilyExtras.now();
            rows.push(["Together", span(now - t.togetherSinceWeek)]);
            if (t.marriedSinceWeek != null) rows.push(["Married", span(now - t.marriedSinceWeek)]);
            const since = Relationships.anniversarySince(t);
            if (since != null) {
                const left = Relationships.WPY() - ((now - since) % Relationships.WPY());
                rows.push(["Next anniversary", left === Relationships.WPY() ? "this week" : `in ${left} week${left === 1 ? "" : "s"}`]);
            }
        }
        if (kind === "child" && t.getIsAlive()) { try { rows.push([S("Common_Status"), t.getChildStatus()]); } catch { /* none */ } }
        if (kind === "sibling" && t.getIsAlive()) { const o = Relationships.occupationOf(t); if (o) rows.push(["Occupation", o]); }
        if (kind === "friend") { rows.push(["How you met", Relationships.metAtText(t)]); rows.push(["Friends for", span(Relationships.now() - t.sinceWeek)]); }
        if (kind === "ex") {
            rows.push(["You were", t.exStatus === "married" ? "Married" : t.exStatus === "engaged" ? "Engaged" : "Dating"]);
            rows.push(["Split up", `${span(Relationships.now() - t.sinceWeek)} ago`.replace("less than a year ago", "this year")]);
            if (t.loverPersonality != null) rows.push([S("Alert_Love_YouMetSomeone_Personality"), t.loverPersonality.getTitle()]);
        }
        if (t.getIsAlive() && t.getPetType?.() == null) {
            const by = (t.getAgeInWeeks() % Relationships.WPY());
            if (t.getAgeInWeeks() > 0) rows.push(["Next birthday", by === 0 ? "this week" : `in ${Relationships.WPY() - by} weeks`]);
        }
        void p;
        return rows;
    },
    /** Existing (original game) actions for this person, sorted into the three sections. */
    existing(t: any): Record<Section, BaseViewModel[]> {
        const p = player();
        const out: Record<Section, BaseViewModel[]> = { time: [], big: [], hard: [] };
        const kind = Relationships.kindOf(t);
        const pi = (x: any, meta: any = null) => ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(x, meta);
        if (kind === "partner") {
            for (const e of Array.from(LoveEvent.INSTANCE.eventsForPlayer(p) as any) as any[]) {
                const sec: Section = TIME_LOVE.includes(e) ? "time" : HARD_LOVE.includes(e) ? "hard" : "big";
                out[sec].push(pi(e));
            }
        } else if (kind === "parent") {
            if (t.getIsAlive()) {
                for (const x of PersonInteraction.INSTANCE.getParentActions()) out.time.push(pi(x));
                // (Road Trip is for both parents, so it stays on the Love tab under Parents)
            }
        } else if (kind === "child") {
            for (const x of PersonInteraction.INSTANCE.actionWithChild(t)) {
                if (x === PersonInteraction.funeral && t.getIsBuried()) continue;
                out[HARD_PI.includes(x) ? "hard" : BIG_PI.includes(x) ? "big" : "time"].push(pi(x));
            }
        } else if (kind === "pet") {
            if (t.getIsAlive()) for (const x of PersonInteraction.INSTANCE.getPetActions()) out[HARD_PI.includes(x) ? "hard" : "time"].push(pi(x, t));
        }
        // the Elixir of Youth (adults only)
        if (kind !== "pet" && kind !== "ex" && kind !== "friend" && t.getIsAlive() && t.getAgeInYears() >= 18) {
            const elixir = FamilyExtras.elixirCell(t);
            if (elixir != null) out.big.push(elixir);
        }
        return out;
    },
    person(key: string): GenericListFragmentViewModel {
        const p = player();
        const out = new ArrayList<BaseViewModel>();
        const header = new ArrayList<BaseViewModel>();
        const t = Relationships.find(key, p);
        if (t == null) {
            header.add(new NavigationBarViewModel("Relationships", false, 2, null));
            out.add(new SingleLabelCellViewModel("Gone", text("They're no longer part of your life.")));
            out.add(new SingleButtonViewModel(new ButtonViewModel("Back to the Love tab", null, true, false, false, false, false,
                { invoke: () => Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal()) }, 126, null)));
            return new GenericListFragmentViewModel(out, header, null);
        }
        const kind = Relationships.kindOf(t);
        header.add(new NavigationBarViewModel(kind === "pet" ? t.getFirstName() : t.getFullName(), false, 2, null));
        out.add(LoveScreens.card(t, { large: true, click: false }));

        // About them
        out.add(new HeaderTitleViewModel("About"));
        out.add(Utils.ViewModel.INSTANCE.getPropertyListViewModel(LoveScreens.aboutRows(t).map(([a, b]) => new Pair(a, b))));
        if (kind === "pet") {
            out.add(new LeftRightCellViewModel("PetBenefit", ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), S("Common_Benefits") + ": ", null, null, null, 14, null), t.getPetType().getModifiers(), null, null, null, 14, null)));
        }
        if (kind === "partner" && t.getIsAlive()) {
            const sb = new SpannableStringBuilder();
            const mods = t.getPartnerModifiers();
            if (mods != null) ExtensionsKt.appendAttributesString$default(sb, mods, null, null, null, 14, null);
            const cost = t.getPartnerCost();
            if (cost != null && cost.intValue?.() !== 0 && cost !== 0) { sb.append(" "); ExtensionsKt.appendMoney(sb, BigInteger.valueOf(+cost)); }
            out.add(new LeftRightCellViewModel("PartnerEffects", new TextLabelViewModel(ExtensionsKt.appendBold$default(new SpannableStringBuilder(), "Weekly effect", null, null, null, 14, null), false, false, null, 14, null), new TextLabelViewModel(sb, false, false, null, 14, null), null, 8, null));
        }
        if (kind === "child" && t.getIsAlive() && t.getSupportedByParent()) out.add(t.getChildSupport().getViewModelForChildSupport(t));

        // Actions
        const existing = LoveScreens.existing(t);
        const sections: [Section, string][] = [["time", "Spend time"], ["big", "Big moments"], ["hard", "Hard choices"]];
        for (const [sec, title] of sections) {
            const cells: BaseViewModel[] = [...existing[sec], ...LoveActions.cellsFor(t, kind, sec, p)];
            if (!cells.length) continue;
            out.add(new HeaderTitleViewModel(title));
            for (const c of cells) out.add(c);
        }
        if (!t.getIsAlive() && out.size() <= 3) out.add(new SingleLabelCellViewModel("InMemory", text(`In loving memory of ${t.getFirstName()}.`)));
        return new GenericListFragmentViewModel(out, header, null);
    },
};

void RomanticRelationshipStatus;
void SocialPerson;
