// Love tab remodel (v0.12.0): the rules behind relationships.
//
// - Everyone: partner, parents, children, pets (FamilyState) and siblings, friends, exes (SocialCircle).
// - Gains go through applyGain(): moods (Stressed/Upset halve gains). Weekly drift goes through drift():
//   1 a week, none for parents/siblings while you're a kid, and never below Good for them from time alone.
// - Moods are re-rolled every 4 weeks, weighted by the score (and a partner's personality).
// - Anniversaries come from the Together/Married counters; a missed one costs 40. Birthdays come from age.
// - Siblings are rolled for new games (0–3) and inherited by heirs; a breakup or divorce keeps your ex.
// - Friends are met at school or work, or with "Meet New People" (up to 10).
import { BigInteger, R } from "../runtime";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { AlertActionViewModel } from "../Managers/AlertActionViewModel";
import { AlertType } from "../Managers/AlertType";
import { MoneyState } from "../Managers/MoneyState";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Relationship } from "../Enums/Relationship";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { Sex } from "../Enums/Sex";
import { Sexuality } from "../Enums/Sexuality";
import { Housing } from "../Enums/Housing";
import { Possession } from "../Enums/Possession";
import { Person } from "../Managers/Person";
import { Vampire } from "../Lifepaths/Vampire";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { SocialCircle, PersonMeta } from "./SocialCircle";
import { SocialPerson, RELATIVE_KINDS } from "./SocialPerson";
import { ExtendedFamily } from "./ExtendedFamily";

export type Mood = "happy" | "fine" | "stressed" | "upset";
export const MOOD_TITLE: Record<Mood, string> = { happy: "Happy", fine: "Fine", stressed: "Stressed", upset: "Upset" };

const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const MAX = () => RelationshipProgressStatus.INSTANCE.getMaxValue();
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const refreshUI = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };

const OCCUPATIONS = ["Nurse", "Teacher", "Mechanic", "Accountant", "Chef", "Software Developer", "Electrician", "Cashier",
    "Police Officer", "Graphic Designer", "Truck Driver", "Hairdresser", "Lawyer", "Barista", "Plumber", "Real Estate Agent"];

export const Relationships = {
    moodEvery: 4,
    maxFriends: 10,
    missedAnniversary: 40,
    friendChancePerWeek: 0.02,

    // ------------------------------------------------------------------ basics
    now(): number { return player().getTrueAgeInWeeks(); },
    circle(p: any = player()): SocialCircle { return p.getSocial(); },
    meta(person: any, p: any = player()): PersonMeta { return Relationships.circle(p).metaFor(person.getId()); },
    isSocial(person: any): boolean { return person instanceof SocialPerson; },
    /** "partner" | "parent" | "child" | "pet" | "sibling" | "friend" | "ex" */
    kindOf(person: any): string {
        if (person instanceof SocialPerson) return person.kind;
        const r = person.getRelationship();
        if (r === Relationship.lover) return "partner";
        if (r === Relationship.parent) return "parent";
        if (r === Relationship.child) return "child";
        if (r === Relationship.pet) return "pet";
        return "self";
    },
    /** Find anyone by id (family first, then the social circle). */
    find(id: string | null, p: any = player()): any {
        if (id == null) return null;
        return p.getFamilyState().getWithId(id) ?? Relationships.circle(p).get(id);
    },
    statusKey(score: number): string { return RelationshipProgressStatus.INSTANCE.statusFromValue(score).name(); },
    statusTitle(person: any): string {
        const st = RelationshipProgressStatus.INSTANCE.statusFromValue(person.getRelationshipProgress());
        const rel = person instanceof SocialPerson ? Relationship.parent : person.getRelationship();
        try { return st.title(rel === Relationship.self ? Relationship.parent : rel); } catch { return st.name(); }
    },
    livesWithParents(p: any = player()): boolean {
        try { return p.getHousingState().currentHousing().getType() === Housing.parentsHouse; } catch { return false; }
    },
    ownsCar(p: any = player()): boolean { try { return p.getItemState().isOwned(Possession.car); } catch { return false; } },
    isMarried(p: any = player()): boolean { return p.getRomanticRelationshipStatus() === RomanticRelationshipStatus.married; },

    // ------------------------------------------------------------------ moods
    mood(person: any): Mood {
        if (person.getPetType?.() != null) return "fine";
        return (Relationships.meta(person).mood as Mood) ?? "fine";
    },
    setMood(person: any, m: Mood) { Relationships.meta(person).mood = m; },
    rollMood(person: any): Mood {
        const s = person.getRelationshipProgress();
        let w = s >= 600 ? [50, 35, 10, 5] : s >= 300 ? [30, 45, 15, 10] : [15, 35, 25, 25];
        const lp = person.getLoverPersonality?.();
        if (lp === LoverPersonality.optimist || lp === LoverPersonality.cheerful || lp === LoverPersonality.soulMate) w = [w[0] + 15, w[1], Math.max(0, w[2] - 5), Math.max(0, w[3] - 10)];
        if (lp === LoverPersonality.highMaintenance || lp === LoverPersonality.abusive) w = [Math.max(0, w[0] - 10), w[1], w[2] + 5, w[3] + 10];
        const total = w.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        const moods: Mood[] = ["happy", "fine", "stressed", "upset"];
        for (let i = 0; i < 4; i++) { if ((r -= w[i]) < 0) return moods[i]; }
        return "fine";
    },
    /** Deep Talk, Call and Ask for Advice: a worried or upset person feels better. */
    liftMood(person: any) { const m = Relationships.mood(person); if (m === "upset" || m === "stressed") Relationships.setMood(person, "fine"); },

    // ------------------------------------------------------------------ gains
    /** How much `base` would give right now (a Stressed or Upset person gets half), without doing it. */
    preview(person: any, _key: string, base: number): { gain: number; why: string | null } {
        if (base <= 0) return { gain: base, why: null };
        const mood = Relationships.mood(person);
        if (mood === "stressed" || mood === "upset") return { gain: Math.max(1, Math.round(base / 2)), why: `halved: ${MOOD_TITLE[mood].toLowerCase()}` };
        return { gain: base, why: null };
    },
    /** Apply a relationship change from `key` (an action id). Positive gains are halved while they're Stressed or Upset.
     *  (v0.12.1: the repeat-action penalty was removed at the user's request.) */
    applyGain(person: any, key: string, base: number): number {
        if (person == null) return 0;
        const m = Relationships.meta(person), now = Relationships.now();
        const gain = base > 0 ? Math.round(Relationships.preview(person, key, base).gain * Vampire.gainMultiplier()) : base;
        m.touched = now;
        if (key === "pi:call") Relationships.liftMood(person);
        person.setRelationshipProgress(person.getRelationshipProgress() + gain);
        return gain;
    },

    // ------------------------------------------------------------------ weekly drift (v0.12.1)
    /** Parents and siblings never drift below this from time alone ("Good"). */
    familyFloor: 400,
    /**
     * How much someone's score drifts this week when you did nothing with them (0 or negative).
     * - While you're a kid (under 18) your parents and siblings don't drift at all: you live with them.
     * - As an adult they drift 1 a week but never below 400 (Good) from time alone.
     * - Everyone else drifts 1 a week (2 if you're Apathetic, 0 with Emotional Intelligence).
     */
    drift(person: any, p: any = player()): number {
        const rate = RelationshipProgressStatus.INSTANCE.getWeeklyDeteriorationRate();
        if (rate >= 0) return 0;
        const kind = Relationships.kindOf(person);
        if (kind === "partner" && Vampire.bonded(p)) return 0;   // v0.17.0 Eternal Bond: you never drift apart
        if (kind === "parent" || kind === "sibling" || RELATIVE_KINDS.includes(kind)) {
            if (p.getAgeInYears() < 18) return 0;
            const score = person.getRelationshipProgress();
            if (score <= Relationships.familyFloor) return 0;
            return Math.max(rate, Relationships.familyFloor - score);
        }
        return rate;
    },
    /** One-time repair for saves played before v0.12.1: family that drifted to nothing while you were growing up. */
    repairDrift(p: any = player()) {
        const c = Relationships.circle(p);
        if (c.driftFixed) return;
        c.driftFixed = true;
        const minor = p.getAgeInYears() < 18;
        const target = minor ? RelationshipProgressStatus.good.getStartProgressValue() : Relationships.familyFloor;
        const fam = [...Relationships.family(Relationship.parent, p), ...Relationships.siblings(p)];
        for (const x of fam) if (x.getIsAlive() && x.getRelationshipProgress() < target) x.setRelationshipProgress(target);
    },

    // ------------------------------------------------------------------ once-a-year moments
    anniversarySince(partner: any): number | null {
        if (partner == null) return null;
        return partner.marriedSinceWeek ?? partner.togetherSinceWeek ?? null;
    },
    /** Years together/married being celebrated, if `week` is an anniversary week. */
    anniversaryYears(partner: any, week = Relationships.now()): number | null {
        const since = Relationships.anniversarySince(partner);
        if (since == null || partner.getIsAlive?.() === false) return null;
        const d = week - since;
        return d > 0 && d % WPY() === 0 ? d / WPY() : null;
    },
    isBirthdayWeek(person: any): boolean {
        if (person.getNotYetBorn?.()) return false;
        const a = person.getAgeInWeeks();
        return a > 0 && a % WPY() === 0;
    },
    badges(person: any): string[] {
        const out: string[] = [];
        if (!person.getIsAlive()) return out;
        if (Relationships.kindOf(person) === "partner" && Vampire.bonded()) out.push("Eternal Bond");
        else if (Relationships.circle().metaFor(person.getId()).vampire) out.push("Vampire");
        if (ExtendedFamily.isNewborn(person)) out.push("Newborn");
        if (Relationships.isBirthdayWeek(person)) out.push("Birthday this week");
        if (Relationships.kindOf(person) === "partner" && Relationships.anniversaryYears(person) != null) out.push("Anniversary this week");
        return out;
    },

    // ------------------------------------------------------------------ people lists (oldest first)
    byAge(list: any[]): any[] { return list.slice().sort((a, b) => b.getAgeInWeeks() - a.getAgeInWeeks()); },
    family(rel: Relationship, p: any = player()): any[] { return Array.from(p.getFamilyState().membersForType(rel) as any); },
    siblings(p: any = player()): SocialPerson[] { return Relationships.circle(p).list("sibling"); },
    friends(p: any = player()): SocialPerson[] { return Relationships.circle(p).list("friend"); },
    exes(p: any = player()): SocialPerson[] { return Relationships.circle(p).list("ex"); },
    /** Partner, parents, children and siblings who are alive and born (for Family Gathering). */
    familyPeople(p: any = player()): any[] {
        const fam = p.getFamilyState();
        const out: any[] = [];
        const partner = fam.getPartner();
        if (partner != null && partner.getIsAlive()) out.push(partner);
        for (const rel of [Relationship.parent, Relationship.child]) for (const x of Relationships.family(rel, p)) if (x.getIsAlive() && !x.getNotYetBorn()) out.push(x);
        for (const s of Relationships.siblings(p)) if (s.getIsAlive()) out.push(s);
        for (const r of ExtendedFamily.all(p)) if (r.getIsAlive()) out.push(r);   // v0.17.0
        return out;
    },

    // ------------------------------------------------------------------ siblings
    /** New games: 0–3 siblings near your age, with your parents' surname. Replaces any rolled before. */
    rollSiblings(p: any) {
        const c = p.getSocial();
        for (const s of c.list("sibling")) c.remove(s.id);
        const r = Math.random();
        const n = r < 0.25 ? 0 : r < 0.6 ? 1 : r < 0.85 ? 2 : 3;
        const myAge = p.getAgeInWeeks();
        for (let i = 0; i < n; i++) {
            let age = myAge + rnd(-8, 8) * WPY() + rnd(-20, 20);
            if (age < 0 || Math.abs(age - myAge) < 30) age = myAge + rnd(1, 8) * WPY();
            const s = SocialPerson.make("sibling", Sex.INSTANCE.getRandomSex(), p.getLastName(), age);
            s.setRelationshipProgress(rnd(400, 650));
            if (s.getAgeInYears() >= 22) s.occupation = OCCUPATIONS[rnd(0, OCCUPATIONS.length - 1)];
            c.add(s);
        }
    },
    /** Heirs: the deceased's other living children become siblings. */
    inheritSiblings(parent: any, heir: any, chosenChild: any) {
        const c = heir.getSocial();
        for (const s of c.list("sibling")) c.remove(s.id);
        for (const k of Array.from(parent.getFamilyState().getChildren() as any) as any[]) {
            if (k === chosenChild || k.getId() === chosenChild.getId() || !k.getIsAlive() || k.getNotYetBorn()) continue;
            const s = SocialPerson.make("sibling", k.getSex(), k.getLastName() ?? heir.getLastName(), k.getAgeInWeeks());
            s.id = k.getId();   // v0.17.0: keeps their children (your grandchildren) linked as the heir's nieces/nephews
            s.firstName = k.getFirstName();
            s.trueAgeInWeeks = k.getTrueAgeInWeeks?.() ?? k.getAgeInWeeks();
            s.setRelationshipProgress(500);
            const job = k.getChildJobState?.()?.getCurrentJob?.();
            if (job != null) { try { s.occupation = job.getTitle(); } catch { /* untitled */ } }
            c.add(s);
        }
    },
    /** "Elementary school", "Nurse"… */
    occupationOf(person: any): string | null {
        if (person instanceof SocialPerson) {
            const a = person.getAgeInYears();
            if (a < 3) return "Too young for school";
            if (a < 5) return "Preschool";
            if (a < 11) return "Elementary school";
            if (a < 14) return "Middle school";
            if (a < 18) return "High school";
            if (person.occupation) return person.occupation;
            if (a < 22) return "College";
            person.occupation = OCCUPATIONS[rnd(0, OCCUPATIONS.length - 1)];
            return person.occupation;
        }
        try { return person.getChildStatus?.() ?? null; } catch { return null; }
    },

    // ------------------------------------------------------------------ exes
    recordEx(partner: any, status: any) {
        if (partner == null || !partner.getIsAlive()) return;
        const p = player();
        const ex = SocialPerson.make("ex", partner.getSex(), partner.getLastName(), partner.getAgeInWeeks());
        ex.firstName = partner.getFirstName();
        ex.gender = partner.getGender();
        ex.sexuality = partner.getSexuality() ?? Sexuality.straight;
        ex.loverPersonality = partner.getLoverPersonality();
        ex.trueAgeInWeeks = partner.getTrueAgeInWeeks?.() ?? partner.getAgeInWeeks();
        ex.exStatus = status === RomanticRelationshipStatus.married ? "married" : status === RomanticRelationshipStatus.engaged ? "engaged" : "dating";
        ex.sinceWeek = Relationships.now();
        ex.setRelationshipProgress(partner.getRelationshipProgress());
        Relationships.circle(p).add(ex);
    },
    canGetBackTogether(ex: SocialPerson): string | null {
        const p = player();
        if (p.getFamilyState().getPartner() != null) return "You're already with someone";
        if (p.getRomanticRelationshipStatus() === RomanticRelationshipStatus.widowed) return "Not while you're grieving";
        if (ex.getRelationshipProgress() < 500) return `Needs a score of 500 (now ${ex.getRelationshipProgress()})`;
        return null;
    },
    getBackTogether(ex: SocialPerson): boolean {
        if (Relationships.canGetBackTogether(ex) != null) return false;
        const p = player();
        const lover = new Person(ex.firstName, ex.lastName, ex.getGender(), ex.sexuality ?? Sexuality.straight, ex.getSex(), Relationship.lover, ex.getAgeInWeeks(), ex.loverPersonality ?? LoverPersonality.cheerful);
        lover.setTrueAgeInWeeks(ex.getTrueAgeInWeeks());
        lover.setRelationshipProgress(ex.getRelationshipProgress());
        Relationships.circle(p).remove(ex.id);
        p.getFamilyState().date(lover);
        return true;
    },

    // ------------------------------------------------------------------ friends
    canMeetPeople(p: any = player()): string | null {
        if (p.getAgeInYears() < 4) return "Must be at least 4 years old";
        if (Relationships.friends(p).length >= Relationships.maxFriends) return `You already have ${Relationships.maxFriends} friends`;
        return null;
    },
    makeFriend(metAt: string, p: any = player()): SocialPerson | null {
        if (Relationships.friends(p).length >= Relationships.maxFriends) return null;
        const age = Math.max(3 * WPY(), p.getAgeInWeeks() + rnd(-2 * WPY(), 2 * WPY()));
        const f = SocialPerson.make("friend", Sex.INSTANCE.getRandomSex(), null, age);
        f.metAt = metAt;
        f.sinceWeek = Relationships.now();
        f.setRelationshipProgress(rnd(250, 400));
        Relationships.circle(p).add(f);
        return f;
    },
    /** Where you'd meet friends this week, or null. */
    meetingPlace(p: any = player()): string | null {
        const a = p.getAgeInYears();
        if (a >= 4 && a < 18) return "school";
        try { if (p.getJobState().getCurrentJob() != null) return "work"; } catch { /* no job state */ }
        return null;
    },
    metAtText(f: SocialPerson): string {
        return f.metAt === "school" ? "Met at school" : f.metAt === "work" ? "Met at work" : "Met out and about";
    },

    // ------------------------------------------------------------------ pets
    petHealthFactor(pet: any): number {
        try { const m = Relationships.meta(pet); return m.vetUntil != null && m.vetUntil >= Relationships.now() ? 0.5 : 1; } catch { return 1; }
    },

    // ------------------------------------------------------------------ weekly
    /** Weekly cash flow: help with your children's rent. Also used for the cash-flow preview, so no side effects. */
    collectWeeklyValues() {
        const p = player();
        if (p == null || p.getSocial == null) return;
        for (const k of Relationships.family(Relationship.child, p)) {
            if (!k.getIsAlive() || k.getAgeInYears() < 18) continue;
            if (Relationships.meta(k, p).rentHelp) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(200), MoneyUpdateType.expense, `Rent help - ${k.getFirstName()}`, null, 8, null);
        }
    },
    weekly(weeks: number) {
        let p: any;
        try { p = player(); } catch { return; }
        if (p == null || p.getSocial == null) return;
        Relationships.repairDrift(p);
        const c = Relationships.circle(p);
        const now = Relationships.now();
        // siblings, friends and exes age, drift apart a little each week, and may pass away
        for (const s of c.list()) {
            if (!s.getIsAlive()) continue;
            const turned = !!c.metaFor(s.id).vampire;   // vampires don't age or die of old age
            if (turned) s.trueAgeInWeeks = s.getTrueAgeInWeeks() + weeks;
            else s.advanceWeeks(weeks);
            if (weeks > 1) continue;
            const m = c.metaFor(s.id);
            if (m.touched !== now) s.setRelationshipProgress(s.getRelationshipProgress() + Relationships.drift(s, p));
            if (s.kind === "sibling" && m.loanDue != null && now >= m.loanDue) {
                delete m.loanDue;
                if (Math.random() < 0.6) {
                    MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(1000), MoneyUpdateType.misc, null, null, 12, null);
                    Relationships.banner("Loan repaid", `${s.getFirstName()} paid back the $1,000 you lent them.`);
                }
            }
            const chance = turned ? 0 : Constants.Person.INSTANCE.chanceOfDeathAtAgePerWeek(s.getAgeInYears(), Constants.Person.INSTANCE.getPersonLifeExpectancy());
            if (Math.random() < chance) {
                s.isAlive = false;
                const msg = `Your ${s.getTitle().toLowerCase()} ${s.getFullName()} has died at the age of ${s.getAgeInYears()}.`;
                if (s.kind === "ex") c.remove(s.id);
                else if (s.kind === "auntUncle" || s.kind === "cousin" || s.kind === "nibling") Relationships.banner("Family Loss", msg, R.drawable.love_funeral);
                else Relationships.alert(s.kind === "friend" ? "A Friend Passed Away" : "Family Loss", msg, R.drawable.love_funeral);
                if (s.kind === "friend") c.remove(s.id);
                continue;
            }
            if (s.kind === "friend" && s.getRelationshipProgress() <= 0) {
                c.remove(s.id);
                Relationships.banner("Drifted apart", `You and ${s.getFirstName()} aren't friends any more.`);
            }
        }
        // v0.17.0: babies across the family (parents until 55, children, grandchildren, siblings, aunts/uncles)
        ExtendedFamily.weekly(weeks, p);
        if (weeks > 1) return;
        const fam = p.getFamilyState();
        // children whose rent you help with
        for (const k of Relationships.family(Relationship.child, p)) {
            if (k.getIsAlive() && k.getAgeInYears() >= 18 && Relationships.meta(k, p).rentHelp) k.setRelationshipProgress(k.getRelationshipProgress() + 5);
        }
        // a missed anniversary
        const partner = fam.getPartner();
        if (partner != null && partner.getIsAlive()) {
            const years = Relationships.anniversaryYears(partner, now);
            const m = Relationships.meta(partner, p);
            if (years != null && m.annivYear !== years && m.annivMissed !== years) {
                m.annivMissed = years;
                partner.setRelationshipProgress(partner.getRelationshipProgress() - Relationships.missedAnniversary);
                Relationships.setMood(partner, "upset");
                Relationships.alert("Forgotten Anniversary", `You forgot your ${Relationships.ordinal(years)} anniversary with ${partner.getFirstName()}. (−${Relationships.missedAnniversary} relationship)`, R.drawable.love_breakup);
            }
        }
        // moods every 4 weeks
        if (c.moodWeek == null || now - c.moodWeek >= Relationships.moodEvery || now < c.moodWeek) {
            c.moodWeek = now;
            const everyone: any[] = [...Array.from(fam.getFamilyMembers() as any).filter((x: any) => x.getIsAlive() && !x.getNotYetBorn() && x.getPetType() == null), ...c.list().filter((s) => s.getIsAlive())];
            for (const x of everyone) Relationships.setMood(x, Relationships.rollMood(x));
        }
        // making friends at school or work
        const place = Relationships.meetingPlace(p);
        if (place != null && Relationships.friends(p).length < Relationships.maxFriends && Math.random() < Relationships.friendChancePerWeek) {
            const f = Relationships.makeFriend(place, p);
            if (f) Relationships.banner("New Friend", `You made a new friend at ${place}: ${f.getFullName()}.`);
        }
    },

    // ------------------------------------------------------------------ messages
    ordinal(n: number): string {
        const s = ["th", "st", "nd", "rd"], v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    },
    banner(title: string, msg: string, image: any = R.drawable.family) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, AlertType.Banner, 0, null), false, 2, null); } catch { /* no UI */ }
    },
    alert(title: string, msg: string, image: any = R.drawable.family) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
    },
    confirm(title: string, msg: string, image: any, yes: string, onYes: () => void) {
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null,
            new AlertActionViewModel(yes, { invoke: () => { onYes(); refreshUI(); return null; } }),
            new AlertActionViewModel("Cancel", { invoke: () => null }), null, AlertType.Alert, 0, null), false, 2, null);
    },
    /** Close the person screen (they're gone from your life) if it is the one showing. */
    popPersonScreen() {
        try {
            const top = GameStateManager.INSTANCE.getCurrentlyShowingGenericList();
            if (top != null && top.getListType() === GenericListType.personDetails) Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal());
        } catch { /* no UI */ }
    },
    money(n: number): string { return ExtensionsKt.numberDisplayString(BigInteger.valueOf(n), true); },
    refreshUI,
    mods(h: number, hap: number, san: number): Modifiers { return new Modifiers(h, hap, san); },
    WPY,
    MAX,
    rnd,
};

