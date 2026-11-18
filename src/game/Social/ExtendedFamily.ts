// Extended family (v0.17.0): grandparents, aunts and uncles, cousins, nieces and nephews, grandchildren and
// great-grandchildren. They live in the player's SocialCircle as SocialPersons, linked into a tree by
// `parentId` (whose child they are) and `side` (which of your parents' families they belong to: that parent's id).
//
// - New games and older saves roll the family once (lazily, the first time it's needed): both parents' families
//   (grandparents, 0–3 aunts/uncles each, their children), plus children for adult siblings, adult children and
//   adult grandchildren.
// - The family keeps growing: your parents have more children until your mother (or the younger parent) turns 55;
//   adults aged 20–49 have children: your children (grandchildren), grandchildren (great-grandchildren),
//   siblings (nieces/nephews) and aunts/uncles (cousins).
// - Heirs inherit the tree one generation down (grandparents ← your parents, aunts/uncles ← your siblings,
//   cousins ← your nieces/nephews, nieces/nephews ← your other grandchildren, children ← the heir's own kids).
import { R } from "../runtime";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "../Managers/GameStateManager";
import { NameGenerator } from "../Managers/NameGenerator";
import { Person } from "../Managers/Person";
import { Relationship } from "../Enums/Relationship";
import { Sex } from "../Enums/Sex";
import { Sexuality } from "../Enums/Sexuality";
import { SocialPerson, RELATIVE_KINDS } from "./SocialPerson";
import { Relationships } from "./Relationships";

const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
const years = (x: any) => Math.floor(x.getAgeInWeeks() / WPY());

/** Plural headings for each kind, in family order. */
export const RELATIVE_TITLES: Record<string, string> = {
    grandparent: "Grandparents",
    auntUncle: "Aunts & Uncles",
    cousin: "Cousins",
    nibling: "Nieces & Nephews",
    grandchild: "Grandchildren",
    greatGrandchild: "Great-grandchildren",
};

/** Who has babies, and how often (chance per year while aged 20–49). */
const BIRTHS: { kind: string; childKind: string; perYear: number; max: number }[] = [
    { kind: "child", childKind: "grandchild", perYear: 0.09, max: 4 },
    { kind: "grandchild", childKind: "greatGrandchild", perYear: 0.09, max: 3 },
    { kind: "sibling", childKind: "nibling", perYear: 0.08, max: 4 },
    { kind: "auntUncle", childKind: "cousin", perYear: 0.06, max: 4 },
];

export const ExtendedFamily = {
    /** Your parents stop having children when your mother (or the younger parent) reaches this age. */
    parentsStopAt: 55,
    parentsPerYear: 0.06,
    maxSiblings: 8,
    fertileFrom: 20,
    fertileTo: 49,

    isRelative(x: any): boolean { return x instanceof SocialPerson && RELATIVE_KINDS.includes(x.kind); },
    relatives(kind: string, p: any = player()): SocialPerson[] {
        ExtendedFamily.ensure(p);
        return Relationships.circle(p).list(kind);
    },
    /** Everyone in the extended family (alive or not). */
    all(p: any = player()): SocialPerson[] {
        ExtendedFamily.ensure(p);
        return Relationships.circle(p).list().filter((x) => RELATIVE_KINDS.includes(x.kind));
    },
    childrenOf(parentId: string, p: any = player()): SocialPerson[] {
        return Relationships.circle(p).list().filter((x) => x.parentId === parentId);
    },
    /** The person someone is a child of (a Person or SocialPerson), if still known. */
    parentOf(x: SocialPerson, p: any = player()): any { return x.parentId ? Relationships.find(x.parentId, p) : null; },
    parentsOfPlayer(p: any = player()): { mom: any; dad: any; list: any[] } {
        const list = Array.from(p.getFamilyState().getParents() as any) as any[];
        const mom = list.find((x) => x.getSex() === Sex.female) ?? null;
        const dad = list.find((x) => x !== mom && x.getSex() === Sex.male) ?? list.find((x) => x !== mom) ?? null;
        return { mom, dad, list };
    },
    /** "Mom's side", "Dad's side" (or the parent's name when both are moms/dads). */
    sideTitle(side: string | null, p: any = player()): string {
        const par = side ? Relationships.find(side, p) : null;
        if (par == null) return "Family";
        const { mom, dad } = ExtendedFamily.parentsOfPlayer(p);
        const both = mom != null && dad != null && mom.getSex() === dad.getSex();
        const word = par.getSex() === Sex.female ? "Mom" : "Dad";
        return both ? `${par.getFirstName()}'s side` : `${word}'s side`;
    },

    // ------------------------------------------------------------------ making people
    /** A dead elder is marked deceased and laid to rest (they died before your story starts). */
    elderAlive(ageYears: number): boolean {
        if (ageYears < 65) return true;
        if (ageYears >= 100) return false;
        return Math.random() > (ageYears - 65) / 38;
    },
    make(kind: string, sex: any, lastName: string, ageInWeeks: number, score: number): SocialPerson {
        const s = SocialPerson.make(kind as any, sex, lastName, ageInWeeks);
        s.setRelationshipProgress(score);
        if (!ExtendedFamily.elderAlive(s.getAgeInYears())) {
            s.isAlive = false;
            s.isBuried = true;
        }
        return s;
    },
    /** A child born to `parent` (a Person or SocialPerson), `ageInWeeks` old. */
    kidOf(parent: any, kind: string, ageInWeeks: number, p: any): SocialPerson {
        const sex = Sex.INSTANCE.getRandomSex();
        const last = parent.getSex() === Sex.male ? parent.getLastName() : NameGenerator.INSTANCE.generateLastName();
        const k = ExtendedFamily.make(kind, sex, last ?? p.getLastName(), ageInWeeks, rnd(kind === "grandchild" || kind === "greatGrandchild" ? 450 : 350, 620));
        k.parentId = parent.getId();
        k.side = parent.side ?? null;
        Relationships.circle(p).add(k);
        return k;
    },
    /** 0–n children for an adult relative, spaced like real families. */
    rollKidsOf(parent: any, kind: string, counts: number[], p: any) {
        const a = years(parent);
        if (a < ExtendedFamily.fertileFrom) return;
        const n = pick(counts);
        for (let i = 0; i < n; i++) {
            const gap = rnd(ExtendedFamily.fertileFrom, Math.max(ExtendedFamily.fertileFrom, Math.min(42, a)));
            const age = parent.getAgeInWeeks() - gap * WPY() - rnd(0, WPY() - 1);
            if (age < 0) continue;
            ExtendedFamily.kidOf(parent, kind, age, p);
        }
    },
    /** One parent's family: their parents (your grandparents), siblings (aunts/uncles) and the cousins. */
    rollSide(p: any, parent: any) {
        if (parent == null) return;
        const c = Relationships.circle(p);
        // maiden name for your mother's side (you carry your father's surname)
        const surname = parent.getSex() === Sex.female && parent.getLastName() === p.getLastName() ? NameGenerator.INSTANCE.generateLastName() : (parent.getLastName() ?? p.getLastName());
        const side = parent.getId();
        const pAge = parent.getAgeInWeeks();
        const r = Math.random();
        const n = r < 0.2 ? 0 : r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
        let oldest = pAge;
        const aunts: SocialPerson[] = [];
        for (let i = 0; i < n; i++) {
            let age = pAge + rnd(-12, 12) * WPY() + rnd(0, WPY() - 1);
            if (age < WPY()) age = pAge + rnd(1, 6) * WPY();
            const sex = Sex.INSTANCE.getRandomSex();
            const au = ExtendedFamily.make("auntUncle", sex, sex === Sex.male ? surname : (Math.random() < 0.6 ? NameGenerator.INSTANCE.generateLastName() : surname), age, rnd(350, 600));
            au.side = side;
            if (!au.isAlive) au.ageInWeeks = Math.min(au.ageInWeeks, rnd(55, 90) * WPY());
            c.add(au);
            aunts.push(au);
            oldest = Math.max(oldest, age);
        }
        for (const sex of [Sex.male, Sex.female]) {
            const age = oldest + rnd(20, 34) * WPY() + rnd(0, WPY() - 1);
            const g = ExtendedFamily.make("grandparent", sex, surname, age, rnd(450, 650));
            g.side = side;
            if (!g.isAlive) g.ageInWeeks = rnd(Math.min(60, g.getAgeInYears()), Math.min(95, g.getAgeInYears())) * WPY();
            c.add(g);
        }
        for (const au of aunts) ExtendedFamily.rollKidsOf(au, "cousin", [0, 1, 1, 2, 2, 3], p);
    },
    /** Roll everything that's missing for this life (new games, saves from before v0.17.0). */
    roll(p: any) {
        const c = Relationships.circle(p);
        c.extendedRolled = true;
        const { mom, dad } = ExtendedFamily.parentsOfPlayer(p);
        if (!c.list("grandparent").length && !c.list("auntUncle").length) {
            ExtendedFamily.rollSide(p, mom);
            ExtendedFamily.rollSide(p, dad);
        }
        for (const s of c.list("sibling")) if (!ExtendedFamily.childrenOf(s.id, p).length) ExtendedFamily.rollKidsOf(s, "nibling", [0, 0, 1, 1, 2, 3], p);
        for (const k of Relationships.family(Relationship.child, p)) {
            if (k.getNotYetBorn() || ExtendedFamily.childrenOf(k.getId(), p).length) continue;
            ExtendedFamily.rollKidsOf(k, "grandchild", [0, 1, 1, 2, 2, 3], p);
        }
        for (const g of c.list("grandchild")) if (!ExtendedFamily.childrenOf(g.id, p).length) ExtendedFamily.rollKidsOf(g, "greatGrandchild", [0, 0, 1, 1, 2], p);
    },
    ensure(p: any = player()) {
        if (p == null || p.getSocial == null) return;
        const c = Relationships.circle(p);
        if (!c.extendedRolled) ExtendedFamily.roll(p);
    },

    // ------------------------------------------------------------------ the family grows
    /** The age that decides whether your parents can still have a baby: your mother's, or the younger parent's. */
    parentsFertileAge(p: any = player()): number | null {
        const { mom, list } = ExtendedFamily.parentsOfPlayer(p);
        const living = list.filter((x) => x.getIsAlive());
        if (living.length < 2) return null;
        if (mom != null) return mom.getAgeInYears();
        return Math.min(...living.map((x) => x.getAgeInYears()));
    },
    canParentsHaveBaby(p: any = player()): boolean {
        const age = ExtendedFamily.parentsFertileAge(p);
        if (age == null || age >= ExtendedFamily.parentsStopAt) return false;
        return Relationships.siblings(p).filter((s) => s.getIsAlive()).length < ExtendedFamily.maxSiblings;
    },
    /** Your parents had a baby: a new brother or sister. */
    newSibling(p: any = player()): SocialPerson {
        const sex = Sex.INSTANCE.getRandomSex();
        const s = SocialPerson.make("sibling", sex, p.getLastName(), 0);
        s.setRelationshipProgress(500);
        s.bornWeek = Relationships.now();
        Relationships.circle(p).add(s);
        Relationships.alert("New Sibling!", `Your parents had a baby ${sex === Sex.male ? "boy" : "girl"}: ${s.getFirstName()}. You have a new ${sex === Sex.male ? "brother" : "sister"}!`, R.drawable.love_baby);
        return s;
    },
    canHaveBaby(x: any, p: any = player()): boolean {
        if (!x.getIsAlive() || x.getNotYetBorn?.()) return false;
        const a = x.getAgeInYears();
        if (a < ExtendedFamily.fertileFrom || a > ExtendedFamily.fertileTo) return false;
        if (Relationships.circle(p).metaFor(x.getId()).vampire) return false;   // vampires can't have biological children
        const rule = BIRTHS.find((b) => b.kind === Relationships.kindOf(x));
        return rule != null && ExtendedFamily.childrenOf(x.getId(), p).filter((k) => k.getIsAlive()).length < rule.max;
    },
    /** `x` (your child, grandchild, sibling or aunt/uncle) had a baby. */
    babyFor(x: any, p: any = player(), quiet = false): SocialPerson | null {
        const rule = BIRTHS.find((b) => b.kind === Relationships.kindOf(x));
        if (rule == null) return null;
        const k = ExtendedFamily.kidOf(x, rule.childKind, 0, p);
        k.isAlive = true; k.isBuried = false;
        k.bornWeek = Relationships.now();
        if (quiet) return k;
        const boyGirl = k.getSex() === Sex.male ? "boy" : "girl";
        const rel = x.getTitle?.() ?? (x.getSex() === Sex.male ? "son" : "daughter");
        const whose = Relationships.kindOf(x) === "child" ? (x.getSex() === Sex.male ? "son" : "daughter") : rel.toLowerCase();
        if (rule.childKind === "grandchild") {
            const first = Relationships.circle(p).list("grandchild").length === 1;
            Relationships.alert(first ? "You're a Grandparent!" : "New Grandchild!", `Your ${whose} ${x.getFirstName()} had a baby ${boyGirl}: ${k.getFullName()}.`, R.drawable.love_baby);
        } else if (rule.childKind === "greatGrandchild") {
            const first = Relationships.circle(p).list("greatGrandchild").length === 1;
            Relationships.alert(first ? "You're a Great-grandparent!" : "New Great-grandchild!", `Your ${whose} ${x.getFirstName()} had a baby ${boyGirl}: ${k.getFullName()}.`, R.drawable.love_baby);
        } else {
            Relationships.banner("New Baby in the Family", `Your ${whose} ${x.getFirstName()} had a baby ${boyGirl}: ${k.getFirstName()}.`, R.drawable.love_baby);
        }
        return k;
    },
    /** Weekly: births across the family. */
    weekly(weeks: number, p: any = player()) {
        if (p == null || p.getSocial == null) return;
        ExtendedFamily.ensure(p);
        const per = (perYear: number) => Math.random() < (perYear * Math.max(1, weeks)) / WPY();
        if (ExtendedFamily.canParentsHaveBaby(p) && per(ExtendedFamily.parentsPerYear)) ExtendedFamily.newSibling(p);
        const c = Relationships.circle(p);
        const candidates: any[] = [...Relationships.family(Relationship.child, p), ...c.list("grandchild"), ...c.list("sibling"), ...c.list("auntUncle")];
        for (const x of candidates) {
            const rule = BIRTHS.find((b) => b.kind === Relationships.kindOf(x));
            if (rule && ExtendedFamily.canHaveBaby(x, p) && per(rule.perYear)) ExtendedFamily.babyFor(x, p);
        }
    },

    // ------------------------------------------------------------------ heirs
    /**
     * The heir's family, one generation down. Call after Relationships.inheritSiblings (which keeps the
     * siblings' ids, so nieces and nephews stay linked) and after the heir's FamilyState is set.
     */
    inherit(dead: any, heir: any, chosen: any) {
        const from = Relationships.circle(dead);
        const to = Relationships.circle(heir);
        const side = (() => { const ps = Array.from(heir.getFamilyState().getParents() as any) as any[]; return ps.find((x) => !x.getIsAlive())?.getId() ?? null; })();
        const copyMeta = (id: string) => { const m = from.meta?.[id]; if (m) to.meta[id] = { ...m, touched: undefined }; };
        const move = (s: SocialPerson, kind: string, sideId: string | null = s.side) => {
            const n = Object.assign(Object.create(Object.getPrototypeOf(s)), s) as SocialPerson;
            n.kind = kind;
            n.side = sideId;
            to.add(n);
            copyMeta(n.id);
            return n;
        };
        // your parents → the heir's grandparents (on your side of the family)
        for (const par of Relationships.family(Relationship.parent, dead)) {
            const g = SocialPerson.make("grandparent", par.getSex(), par.getLastName(), par.getAgeInWeeks());
            g.id = par.getId();
            g.firstName = par.getFirstName();
            g.trueAgeInWeeks = par.getTrueAgeInWeeks?.() ?? par.getAgeInWeeks();
            g.isAlive = par.getIsAlive();
            g.isBuried = !par.getIsAlive();
            g.side = side;
            g.setRelationshipProgress(500);
            to.add(g);
            copyMeta(g.id);
        }
        // your siblings → aunts/uncles; your nieces/nephews → cousins
        for (const s of from.list("sibling")) move(s, "auntUncle", side);
        for (const s of from.list("nibling")) move(s, "cousin", side);
        // your grandchildren → the heir's own children (theirs) or nieces/nephews (their siblings')
        const heirKids = new Set<string>();
        for (const g of from.list("grandchild")) {
            if (g.parentId === chosen.getId()) {
                const k = new Person(g.firstName, g.lastName, g.getGender(), g.sexuality ?? Sexuality.straight, g.getSex(), Relationship.child, g.getAgeInWeeks(), null);
                k.setId(g.id);
                k.setTrueAgeInWeeks(g.getTrueAgeInWeeks());
                k.setRelationshipProgress(g.getRelationshipProgress());
                if (!g.getIsAlive()) { k.setAlive(false); k.setBuried(g.getIsBuried()); }
                heir.getFamilyState().getFamilyMembers().add(k);
                heirKids.add(g.id);
                copyMeta(g.id);
            } else move(g, "nibling", null);
        }
        // great-grandchildren through the heir's kids → the heir's grandchildren
        for (const g of from.list("greatGrandchild")) if (g.parentId != null && heirKids.has(g.parentId)) move(g, "grandchild", null);
        // the other parent's family (your partner's side), if there is one
        to.extendedRolled = true;
        const other = (Array.from(heir.getFamilyState().getParents() as any) as any[]).find((x) => x.getIsAlive() && x.getId() !== side);
        if (other != null) ExtendedFamily.rollSide(heir, other);
    },

    // ------------------------------------------------------------------ helpers for the screens
    /** "Uncle Mark's children", "Your children"… */
    groupLabel(parentId: string | null, p: any = player()): string {
        const par = parentId ? Relationships.find(parentId, p) : null;
        if (par == null) return "Family";
        const t = par instanceof SocialPerson ? par.getTitle() : Relationships.kindOf(par) === "child" ? (par.getSex() === Sex.male ? "Son" : "Daughter") : "";
        return `${t ? t + " " : ""}${par.getFirstName()}'s children`;
    },
    counts(p: any = player()): Record<string, { alive: number; dead: number }> {
        const out: Record<string, { alive: number; dead: number }> = {};
        for (const k of RELATIVE_KINDS) {
            const list = ExtendedFamily.relatives(k, p);
            out[k] = { alive: list.filter((x) => x.getIsAlive()).length, dead: list.filter((x) => !x.getIsAlive()).length };
        }
        return out;
    },
    isNewborn(x: any): boolean { return x instanceof SocialPerson && x.getIsAlive() && x.getAgeInWeeks() < 4 && x.bornWeek != null; },
};
