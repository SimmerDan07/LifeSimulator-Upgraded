// Love tab remodel (v0.12.0): the new things to do with each relationship.
// Each one renders like the game's own action rows (picture, title, "+N relationship", attribute changes, price button)
// by implementing the same ActionDescriptor interface. Unless marked instant, an action takes one week.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Pet } from "../Enums/Pet";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { Relationships, MOOD_TITLE } from "./Relationships";
import { SocialPerson } from "./SocialPerson";
import { Babies } from "./Babies";
import { Vampire } from "../Lifepaths/Vampire";

export type Section = "time" | "big" | "hard";
type Mods = [number, number, number];   // health, happiness, sanity

export interface LoveActionDef {
    id: string;
    title: string | ((t: any) => string);
    image: any;
    who: string[];                        // partner | parent | child | pet | sibling | friend | ex | group
    section: Section;
    cost?: number | ((t: any) => number);
    bond?: number;
    mods?: Mods;
    /** Shown at all? (age, situation) */
    show?: (t: any, p: any) => boolean;
    /** Shown but locked, with this reason. */
    lock?: (t: any, p: any) => string | null;
    /** Extra effect after the relationship change. `moodBefore` is their mood before the action. */
    run?: (t: any, p: any, gain: number, moodBefore: string) => void;
    instant?: boolean;
    confirm?: (t: any) => string;
    /** Deep Talk, Call, Ask for Advice: lifts Stressed/Upset to Fine first. */
    lifts?: boolean;
    actionTitle?: (t: any) => string | null;
    note?: (t: any) => string | null;
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const age = (x: any) => x.getAgeInYears();
const alive = (t: any) => t != null && t.getIsAlive();
const apart = (t: any, p: any) => !(Relationships.livesWithParents(p) && (Relationships.kindOf(t) === "parent" || age(t) < 18));
const adult = (_t: any, p: any) => (age(p) < 18 ? "Must be 18 or older" : null);
const isDog = (t: any) => t.getPetType() === Pet.dog;
const isCat = (t: any) => t.getPetType() === Pet.cat;
const childAge = (min: number, max: number) => (t: any) => alive(t) && age(t) >= min && age(t) <= max;
/** v0.17.0 extended family kinds. */
const REL = ["grandparent", "auntUncle", "cousin", "nibling", "grandchild", "greatGrandchild"];
const YOUNGER = ["grandchild", "greatGrandchild", "nibling"];

export const LOVE_ACTIONS: LoveActionDef[] = [
    // ---------------------------------------------------------------- partner
    { id: "cookDinner", title: "Cook Dinner Together", image: R.drawable.skill_homechef, who: ["partner"], section: "time", bond: 10, mods: [1, 3, 2] },
    { id: "deepTalk", title: "Deep Talk", image: R.drawable.health_meditation, who: ["partner"], section: "time", bond: 12, mods: [0, 0, 3], lifts: true,
        run: (t, _p, _g, before) => Relationships.banner("Deep Talk", `${t.getFirstName()} was feeling ${MOOD_TITLE[before as keyof typeof MOOD_TITLE] ?? "Fine"}.${before === "upset" || before === "stressed" ? " Talking it through helped: they feel Fine now." : ""}`) },
    { id: "partnerGift", title: "Give a Gift", image: R.drawable.inappnotification_gift, who: ["partner"], section: "time", cost: 200, bond: 15, mods: [0, 3, 0] },
    { id: "getaway", title: "Weekend Getaway", image: R.drawable.vacation_luxury, who: ["partner"], section: "big", cost: 1500, bond: 60, mods: [0, 10, 5] },
    { id: "anniversary", title: (t) => `Celebrate Your ${Relationships.ordinal(Relationships.anniversaryYears(t) ?? 1)} Anniversary`, image: R.drawable.love_marry, who: ["partner"], section: "big", cost: 500, bond: 80, mods: [0, 8, 3],
        show: (t) => { const y = Relationships.anniversaryYears(t); return y != null && Relationships.meta(t).annivYear !== y; },
        run: (t) => { Relationships.meta(t).annivYear = Relationships.anniversaryYears(t) ?? undefined; } },
    { id: "therapy", title: "Couples Therapy", image: R.drawable.health_psychologist, who: ["partner"], section: "big", cost: 300, bond: 40, mods: [0, 0, 4],
        show: (t) => t.getRelationshipProgress() < 300, run: (t) => Relationships.liftMood(t) },
    { id: "renewVows", title: "Renew Your Vows", image: R.drawable.love_propose, who: ["partner"], section: "big", cost: 5000, bond: 150, mods: [0, 20, 5],
        show: (t, p) => Relationships.isMarried(p) && t.marriedSinceWeek != null && Relationships.now() - t.marriedSinceWeek >= 10 * Relationships.WPY(),
        lock: (t) => { const w = Relationships.meta(t).vowsWeek; return w != null && Relationships.now() - w < Relationships.WPY() ? "You renewed your vows this year" : null; },
        run: (t) => { Relationships.meta(t).vowsWeek = Relationships.now(); } },

    // ---------------------------------------------------------------- parents
    { id: "parentCall", title: "Call", image: R.drawable.childaction_call, who: ["parent", "sibling"], section: "time", bond: 20, lifts: true, show: (t, p) => apart(t, p) },
    { id: "parentVisit", title: "Visit", image: R.drawable.childaction_visit, who: ["parent", "sibling"], section: "time", bond: 60, mods: [0, 5, 2], show: (t, p) => apart(t, p) },
    { id: "advice", title: "Ask for Advice", image: R.drawable.skill_selfhelp, who: ["parent", "grandparent"], section: "time", bond: 10, mods: [0, 0, 3], lifts: true },
    { id: "chores", title: "Help Around the House", image: R.drawable.skill_hygieneexpert, who: ["parent"], section: "time", bond: 25, mods: [0, -1, 0], show: (_t, p) => Relationships.livesWithParents(p) },
    { id: "parentVacation", title: "Take Them on Vacation", image: R.drawable.vacation_international, who: ["parent"], section: "big", cost: 2000, bond: 100, mods: [0, 10, 5], lock: adult },
    { id: "askMoney", title: "Ask for Money", image: R.drawable.bank_withdrawal, who: ["parent"], section: "big", bond: -20,
        lock: (t, p) => {
            if (age(p) < 18) return "Must be 18 or older";
            const w = Relationships.meta(t).moneyAskedWeek;
            const left = w == null ? 0 : 24 - (Relationships.now() - w);
            return left > 0 ? `You can ask again in ${left} week${left === 1 ? "" : "s"}` : null;
        },
        note: () => "They may say yes (more likely when you're close).\n",
        run: (t, p) => {
            Relationships.meta(t).moneyAskedWeek = Relationships.now();
            const score = t.getRelationshipProgress() + 20;
            if (Math.random() < (score / 1000) * 0.9) {
                const amount = Math.max(100, Math.round((score * Relationships.rnd(1, 3)) / 50) * 50);
                MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(amount), MoneyUpdateType.misc, null, null, 12, null);
                Relationships.alert("Ask for Money", `${t.getFirstName()} gave you ${Relationships.money(amount)}.`, R.drawable.bank_withdrawal);
            } else Relationships.alert("Ask for Money", `${t.getFirstName()} said no.`, R.drawable.bank_withdrawal);
        } },

    // ---------------------------------------------------------------- children
    { id: "feedCuddle", title: "Feed and Cuddle", image: R.drawable.love_baby, who: ["child"], section: "time", bond: 10, mods: [0, 3, 2], show: childAge(0, 3) },
    { id: "lullaby", title: "Sing a Lullaby", image: R.drawable.childaction_tellstory, who: ["child"], section: "time", bond: 8, mods: [0, 2, 3], show: childAge(0, 3) },
    { id: "homework", title: "Help with Homework", image: R.drawable.education_elementaryschool, who: ["child"], section: "time", bond: 15, mods: [0, 0, -1], show: childAge(5, 11) },
    { id: "sports", title: "Sign Up for Sports", image: R.drawable.vacation_soccer, who: ["child"], section: "time", cost: 100, bond: 20, mods: [0, 3, 0], show: childAge(6, 11) },
    { id: "talkFuture", title: "Talk About the Future", image: R.drawable.education_college_business, who: ["child"], section: "time", bond: 20, mods: [0, 0, 2], show: childAge(12, 17) },
    { id: "teachDrive", title: "Teach to Drive", image: R.drawable.possession_car, who: ["child"], section: "time", bond: 30, mods: [0, 0, -2], show: childAge(16, 17),
        lock: (_t, p) => (Relationships.ownsCar(p) ? null : "You need a car") },
    { id: "birthdayParty", title: (t) => `${t.getFirstName()}'s ${Relationships.ordinal(age(t))} Birthday Party`, image: R.drawable.achievement_happy, who: ["child"], section: "big",
        cost: (t) => (age(t) >= 12 ? 500 : 300), bond: 60, mods: [0, 6, 0],
        show: (t) => childAge(4, 17)(t) && Relationships.isBirthdayWeek(t) && Relationships.meta(t).bdayYear !== age(t),
        run: (t) => { Relationships.meta(t).bdayYear = age(t); } },
    { id: "familyDinner", title: "Family Dinner", image: R.drawable.diet_balanced, who: ["child"], section: "time", cost: 100, bond: 25, mods: [0, 4, 2], show: childAge(18, 999) },
    { id: "giveMoney", title: "Give Money", image: R.drawable.iap_money1, who: ["child"], section: "big", cost: 1000, bond: 40, show: childAge(18, 999) },
    { id: "rentHelp", title: (t) => (Relationships.meta(t).rentHelp ? "Stop Helping with Rent" : "Help with Rent"), image: R.drawable.housing_small_apartment, who: ["child"], section: "big",
        instant: true, show: childAge(18, 999),
        actionTitle: (t) => (Relationships.meta(t).rentHelp ? "Stop" : "$200/wk"),
        note: (t) => (Relationships.meta(t).rentHelp ? "You pay $200 a week towards their rent (+5 relationship a week).\n" : "Pay $200 a week towards their rent, until you stop. +5 relationship a week.\n"),
        run: (t) => { const m = Relationships.meta(t); m.rentHelp = !m.rentHelp; } },

    // ---------------------------------------------------------------- pets
    { id: "walk", title: "Go for a Walk", image: R.drawable.pet_dog, who: ["pet"], section: "time", bond: 20, mods: [1, 2, 1], show: (t) => alive(t) && isDog(t) },
    { id: "petPlay", title: "Play Together", image: R.drawable.vacation_park, who: ["pet"], section: "time", bond: 15, mods: [0, 3, 2], show: alive },
    { id: "groom", title: "Grooming", image: R.drawable.skill_hygieneexpert, who: ["pet"], section: "time", cost: 80, bond: 12, show: (t) => alive(t) && (isDog(t) || isCat(t)) },
    { id: "vet", title: "Vet Checkup", image: R.drawable.health_doctorvisit, who: ["pet"], section: "big", cost: 200, bond: 10, show: alive,
        note: (t) => { const u = Relationships.meta(t).vetUntil; return u != null && u >= Relationships.now() ? "Checked: healthier for the rest of the year.\n" : "Keeps them healthy for a year.\n"; },
        run: (t) => { Relationships.meta(t).vetUntil = Relationships.now() + Relationships.WPY(); } },

    // ---------------------------------------------------------------- siblings
    { id: "hangOut", title: "Hang Out", image: R.drawable.vacation_park, who: ["sibling", "friend", "cousin"], section: "time", bond: 15, mods: [0, 4, 2],
        show: (t, p) => alive(t) && (Relationships.kindOf(t) !== "cousin" || (age(t) >= 4 && age(p) >= 4)) },
    { id: "videoGames", title: "Play Video Games", image: R.drawable.vacation_videogames, who: ["sibling"], section: "time", bond: 12, mods: [0, 4, 1],
        show: (t, p) => age(t) < 18 && age(p) < 18 },
    { id: "prank", title: "Prank Them", image: R.drawable.random, who: ["sibling"], section: "time", mods: [0, 3, 0], show: (t, p) => age(t) < 18 && age(p) < 18,
        note: () => "+10 or −10 relationship: depends how they take it.\n",
        run: (t) => {
            const good = Math.random() < 0.5;
            Relationships.applyGain(t, "rel:prank", good ? 10 : -10);
            Relationships.banner("Prank", good ? `${t.getFirstName()} thought it was hilarious. (+10)` : `${t.getFirstName()} did not find it funny. (−10)`);
        } },
    { id: "lend", title: "Lend $1,000", image: R.drawable.bank_loan, who: ["sibling"], section: "big", cost: 1000, bond: 30,
        lock: (t, p) => (age(p) < 18 || age(t) < 18 ? "You both need to be 18 or older" : Relationships.meta(t).loanDue != null ? "They still owe you $1,000" : null),
        note: () => "They may pay you back in a few months.\n",
        run: (t) => { Relationships.meta(t).loanDue = Relationships.now() + Relationships.rnd(8, 24); } },
    { id: "siblingFuneral", title: "Attend Funeral", image: R.drawable.love_funeral, who: ["sibling", "parent", ...REL], section: "big", cost: 1000, mods: [0, -10, -5],
        show: (t) => !t.getIsAlive() && !t.getIsBuried(), run: (t) => t.setBuried(true) },

    // ---------------------------------------------------------------- extended family (v0.17.0)
    { id: "relCall", title: "Call", image: R.drawable.childaction_call, who: REL, section: "time", bond: 15, lifts: true,
        show: (t, p) => alive(t) && age(t) >= 6 && age(p) >= 6 },
    { id: "relVisit", title: "Visit", image: R.drawable.childaction_visit, who: REL, section: "time", bond: 40, mods: [0, 4, 2] },
    { id: "relGift", title: "Give a Gift", image: R.drawable.inappnotification_gift, who: REL, section: "time", cost: 100, bond: 20, mods: [0, 2, 0],
        show: (t, p) => alive(t) && age(p) >= 12 },
    { id: "stories", title: "Listen to Their Stories", image: R.drawable.childaction_tellstory, who: ["grandparent"], section: "time", bond: 30, mods: [0, 2, 4] },
    { id: "babysit", title: "Babysit", image: R.drawable.childaction_playground, who: YOUNGER, section: "time", bond: 30, mods: [0, 4, -2],
        show: (t, p) => alive(t) && age(t) <= 10 && age(p) >= 16 },
    { id: "familyStories", title: "Tell Them Family Stories", image: R.drawable.childaction_tellstory, who: ["grandchild", "greatGrandchild"], section: "time", bond: 25, mods: [0, 3, 3],
        show: (t) => alive(t) && age(t) >= 4 },
    { id: "spoil", title: "Spoil Them", image: R.drawable.childaction_carnival, who: YOUNGER, section: "time", cost: 300, bond: 40, mods: [0, 5, 0],
        show: (t, p) => alive(t) && age(t) < 18 && age(p) >= 18 },
    { id: "payCollege", title: "Pay for College", image: R.drawable.education_college_business, who: YOUNGER, section: "big", cost: 20000, bond: 150, mods: [0, 8, 0],
        show: (t, p) => alive(t) && age(t) >= 17 && age(t) <= 22 && age(p) >= 18 && !Relationships.meta(t).collegePaid,
        note: () => "Pay their college tuition. Once only.\n",
        run: (t) => { Relationships.meta(t).collegePaid = true; } },

    // ---------------------------------------------------------------- friends
    { id: "friendCall", title: "Call", image: R.drawable.childaction_call, who: ["friend"], section: "time", bond: 20, lifts: true, show: (_t, p) => age(p) >= 8 },
    { id: "movies", title: "Go to the Movies", image: R.drawable.love_movie, who: ["friend"], section: "time", cost: 30, bond: 20, mods: [0, 5, 2] },
    { id: "party", title: "Go to a Party", image: R.drawable.love_nightclub, who: ["friend"], section: "time", cost: 50, bond: 25, mods: [-2, 8, 0],
        lock: (_t, p) => (age(p) < 16 ? "Must be 16 or older" : null) },
    { id: "friendGift", title: "Give a Gift", image: R.drawable.inappnotification_gift, who: ["friend", "sibling"], section: "time", cost: 100, bond: 15, mods: [0, 2, 0] },
    { id: "unfriend", title: "Unfriend", image: R.drawable.redx, who: ["friend"], section: "hard", instant: true,
        confirm: (t) => `Stop being friends with ${t.getFullName()}? They'll be gone from your list.`,
        run: (t, p) => { Relationships.circle(p).remove(t.getId()); Relationships.popPersonScreen(); } },

    // ---------------------------------------------------------------- exes
    { id: "textEx", title: "Text Them", image: R.drawable.childaction_call, who: ["ex"], section: "time", bond: 10,
        note: () => "Small chance they'll want to try again.\n",
        run: (t, p) => {
            if (p.getFamilyState().getPartner() == null && t.getRelationshipProgress() >= 350 && Math.random() < 0.08) {
                Relationships.confirm("Second Chance?", `${t.getFirstName()} misses you and wants to try again. Get back together?`, R.drawable.love_romantic_dinner, "Get back together",
                    () => { if (Relationships.getBackTogether(t)) Relationships.popPersonScreen(); });
            }
        } },
    { id: "backTogether", title: "Ask to Get Back Together", image: R.drawable.love_romantic_dinner, who: ["ex"], section: "big", mods: [0, 10, 0],
        lock: (t) => Relationships.canGetBackTogether(t),
        note: () => "Needs a score of 500 or more.\n",
        run: (t) => { if (Relationships.getBackTogether(t)) { Relationships.alert("Back Together", `You and ${t.getFirstName()} are back together!`, R.drawable.love_romantic_dinner); Relationships.popPersonScreen(); } } },
    { id: "removeEx", title: "Remove from List", image: R.drawable.redx, who: ["ex"], section: "hard", instant: true,
        confirm: (t) => `Remove ${t.getFullName()} from your past relationships?`,
        run: (t, p) => { Relationships.circle(p).remove(t.getId()); Relationships.popPersonScreen(); } },

    // ---------------------------------------------------------------- babies (v0.15.0)
    { id: "surrogacy", title: "Surrogacy", image: R.drawable.alert_pregnant, who: ["partner"], section: "big", cost: Babies.surrogacyPrice, mods: [0, 10, 0],
        show: (t, p) => alive(t) && Babies.canSurrogacy(p),
        lock: (_t, p) => (Babies.pregnant(p) ? "You're already expecting a baby" : null),
        note: () => "A surrogate carries your baby. Born in 40 weeks.\n",
        run: (_t, p) => Babies.announce(Babies.startPregnancy(p, "surrogate")) },
    { id: "insemination", title: "Artificial Insemination", image: R.drawable.sperm, who: ["partner"], section: "big", cost: Babies.inseminationPrice, mods: [0, 10, 0],
        show: (t, p) => alive(t) && Babies.inseminationCarrier(p) != null,
        lock: (_t, p) => (Babies.pregnant(p) ? "You're already expecting a baby" : null),
        note: (t) => (Babies.inseminationCarrier() === "you" ? "You carry the baby" : `${t.getFirstName()} carries the baby`) + " (with a donor). Born in 40 weeks.\n",
        run: (_t, p) => Babies.announce(Babies.startPregnancy(p, Babies.inseminationCarrier(p) ?? "you")) },

    // ---------------------------------------------------------------- vampires (v0.15.0)
    { id: "tellSecret", title: "Tell Them You're a Vampire", image: R.drawable.lifepath_vampire, who: ["partner", "parent", "child", "sibling", "friend", ...REL], section: "big",
        show: (t, p) => alive(t) && Vampire.isVampire(p) && !Vampire.knows(t) && !Vampire.isTurned(t) && (Relationships.kindOf(t) !== "child" || age(t) >= 12),
        note: () => "Close people (600+) take it well. Others may be scared, talk, or leave.\n",
        run: (t, p) => Vampire.tell(p, t) },
    { id: "turn", title: "Turn Them into a Vampire", image: R.drawable.lifepath_vampire, who: ["partner", "parent", "child", "sibling", "friend", ...REL], section: "big",
        show: (t, p) => alive(t) && Vampire.isVampire(p) && Vampire.knows(t) && !Vampire.isTurned(t),
        lock: (t, p) => (age(t) < 18 ? "They must be 18 or older" : Vampire.state(p).bloodPower < Vampire.turnCost ? `Needs ${Vampire.turnCost} blood power` : null),
        note: () => `They stop ageing and join your coven. Costs ${Vampire.turnCost} blood power.\n`,
        run: (t, p) => Vampire.turn(p, t) },

    // ---------------------------------------------------------------- Eternal Bond (v0.17.0): you and your partner are both vampires
    { id: "huntTogether", title: "Hunt Together", image: R.drawable.mosquito, who: ["partner"], section: "time", bond: 40, mods: [0, 6, 0],
        show: (t, p) => alive(t) && Vampire.bonded(p),
        note: (_t) => `−50 thirst, +6 suspicion${Vampire.has("mistStep") ? "" : ", 10% chance of police trouble"}.\n`,
        run: (_t, p) => Vampire.huntTogether(p) },
    { id: "nightDance", title: "Dance Through the Night", image: R.drawable.love_nightclub, who: ["partner"], section: "time", cost: 100, bond: 30, mods: [0, 7, 3],
        show: (t, p) => alive(t) && Vampire.bonded(p) },
    { id: "eternalVows", title: "Eternal Vows", image: R.drawable.love_propose, who: ["partner"], section: "big", cost: 10000, bond: 200, mods: [0, 20, 5],
        show: (t, p) => alive(t) && Vampire.bonded(p),
        lock: (t) => { const w = Relationships.meta(t).eternalVowsWeek; return w != null && Relationships.now() - w < 10 * Relationships.WPY() ? "Once every 10 years" : null; },
        note: () => "A midnight ceremony to bind you for eternity. Once every 10 years.\n",
        run: (t) => { Relationships.meta(t).eternalVowsWeek = Relationships.now(); } },

    // ---------------------------------------------------------------- everyone (Love tab)
    { id: "gathering", title: "Family Gathering", image: R.drawable.achievement_bigfamily, who: ["group"], section: "big", cost: 250, mods: [0, 6, 3],
        lock: (_t, p) => (Relationships.familyPeople(p).length < 2 ? "Needs at least 2 family members" : null),
        note: (_t) => `+30 relationship with everyone in your family (${Relationships.familyPeople().length}).\n`,
        run: (_t, p) => { for (const x of Relationships.familyPeople(p)) Relationships.applyGain(x, "rel:gathering", 30); } },
    { id: "adoptSingle", title: "Adopt a Child", image: R.drawable.love_adopt, who: ["group"], section: "big", cost: Babies.adoptionPrice,
        show: (_t, p) => p.getFamilyState().getPartner() == null,
        lock: (_t, p) => (age(p) < 18 ? "Must be 18 or older" : null),
        note: () => "Raise a child on your own.\n",
        run: (_t, p) => Babies.adopt(p) },
    { id: "meetPeople", title: "Meet New People", image: R.drawable.waving_hand, who: ["group"], section: "time", mods: [0, 2, 0],
        lock: (_t, p) => Relationships.canMeetPeople(p),
        note: () => "Good chance of making a new friend.\n",
        run: (_t, p) => {
            if (Math.random() < 0.5) {
                const f = Relationships.makeFriend("out", p);
                if (f) Relationships.alert("New Friend", `You hit it off with ${f.getFullName()}, ${f.getAgeInYears()}.`, R.drawable.waving_hand);
            } else Relationships.banner("Meet New People", "You didn't click with anyone this time.", R.drawable.waving_hand);
        } },
];

export function loveAction(id: string): LoveActionDef { return LOVE_ACTIONS.find((a) => a.id === id)!; }

/** One action for one person, in the shape the game's action rows expect. */
export class LoveActionCell {
    constructor(public def: LoveActionDef, public target: any) {}
    getTitle(): string { return typeof this.def.title === "function" ? this.def.title(this.target) : this.def.title; }
    getImageId(): any { return this.def.image; }
    costValue(): number { const c = this.def.cost; return typeof c === "function" ? c(this.target) : c ?? 0; }
    getCost(): BigInteger { return BigInteger.valueOf(this.costValue()); }
    getModifiers(): Modifiers { const m = this.def.mods ?? [0, 0, 0]; return new Modifiers(m[0], m[1], m[2]); }
    getActionTitle(): string | null { return this.def.actionTitle?.(this.target) ?? null; }
    getAdditionalDescription(): string | null {
        const note = this.def.note?.(this.target) ?? "";
        const b = this.def.bond ?? 0;
        if (b === 0 || this.target == null) return note || null;
        if (b < 0) return `${b} relationship\n` + note;
        const pv = Relationships.preview(this.target, "rel:" + this.def.id, b);
        return `+${pv.gain} relationship${pv.why ? ` (${pv.why})` : ""}\n` + note;
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null {
        if (p.getCrimeState?.()?.getIsInJail?.()) return "Not while you're in jail";
        return this.def.lock?.(this.target, p) ?? null;
    }
    visible(p: any = player()): boolean { return this.def.show ? !!this.def.show(this.target, p) : this.target == null || alive(this.target); }
    action(p: any): void { LoveActions.perform(this.def, this.target, p); }
    cell(): ActionCellSingleViewModel { return ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(this as any, null); }
}

export const LoveActions = {
    /** Visible action cells for `target` (or the group actions when target is null) in one section. */
    cellsFor(target: any, kind: string, section: Section, p: any = player()): ActionCellSingleViewModel[] {
        const out: ActionCellSingleViewModel[] = [];
        for (const def of LOVE_ACTIONS) {
            if (def.section !== section || !def.who.includes(kind)) continue;
            const a = new LoveActionCell(def, target);
            if (a.visible(p)) out.push(a.cell());
        }
        return out;
    },
    /** Do it (used by the rows and by tests). Returns false if it couldn't be done. */
    perform(def: LoveActionDef, target: any, p: any = player()): boolean {
        const cell = new LoveActionCell(def, target);
        if (!cell.visible(p) || cell.requirementNotMetString(p) != null) return false;
        if (p.getMoneyState().getCash().compareTo(cell.getCost()) < 0 && cell.costValue() > 0) return false;
        const go = () => {
            p.applyAttributeAndMoneyFromEvent(cell);
            const moodBefore = target != null ? Relationships.mood(target) : "fine";
            if (def.lifts && target != null) Relationships.liftMood(target);
            let gain = 0;
            if (target != null) {
                if (def.bond) gain = Relationships.applyGain(target, "rel:" + def.id, def.bond);
                else if (!def.instant) Relationships.meta(target, p).touched = Relationships.now();
                // time together this week: no weekly drift (like the game's own family actions); settings changes don't count
                if (!(target instanceof SocialPerson) && !def.instant) p.getTempState().setPrevActionState(target.getRelationship().getCorrespondingActionType());
            }
            const lt = p.getMiscState().getLifeTracker();
            lt.setRelationshipAction(lt.getRelationshipAction() + 1);
            def.run?.(target, p, gain, moodBefore);
            if (!def.instant) p.applyWeekly();
            else Relationships.refreshUI();
        };
        if (def.confirm) { Relationships.confirm(cell.getTitle(), def.confirm(target), def.image, cell.getTitle(), go); return true; }
        go();
        return true;
    },
};
