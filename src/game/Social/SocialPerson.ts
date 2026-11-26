// Siblings, friends and exes (Love tab remodel, v0.12.0).
// They are not family members in the original game's sense (no allowance, no inheritance, no child support),
// so they live in the player's SocialCircle instead of FamilyState. They still look like a Person to the
// Love tab: name, sex, age, alive, a 0–1000 relationship score.
import { Constants } from "../Utils/Constants";
import { NameGenerator } from "../Managers/NameGenerator";
import { Sex } from "../Enums/Sex";
import { Gender } from "../Enums/Gender";
import { Sexuality } from "../Enums/Sexuality";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { AgeGroup } from "../Enums/AgeGroup";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";

export type SocialKind = "sibling" | "friend" | "ex"
    // v0.17.0 extended family
    | "grandparent" | "auntUncle" | "cousin" | "nibling" | "grandchild" | "greatGrandchild"
    // v0.33.0: your boss and coworkers (workRole says which)
    | "coworker"
    // v0.35.0: the night: your sire, your city's court, your herd (nightRole says which)
    | "night";
/** The extended family kinds (v0.17.0). */
export const RELATIVE_KINDS = ["grandparent", "auntUncle", "cousin", "nibling", "grandchild", "greatGrandchild"];

let counter = 0;

export class SocialPerson {
    id: string = "";
    kind: string = "friend";
    firstName: string = "";
    lastName: string = "";
    sex: Sex = null;
    gender: Gender = null;
    sexuality: Sexuality = null;
    ageInWeeks: number = 0;
    trueAgeInWeeks: number = 0;
    isAlive: boolean = true;
    isBuried: boolean = false;
    relationshipProgress: number = 500;
    /** Friends: "school", "work" or "out". */
    metAt: string = null;
    /** Exes: how far it went ("dating", "engaged", "married") and the personality they had as your partner. */
    exStatus: string = null;
    loverPersonality: LoverPersonality = null;
    /** Week (your true age in weeks) you broke up / met. */
    sinceWeek: number = 0;
    /** Adult siblings: what they do. */
    occupation: string = null;
    /** v0.17.0: whose child they are (a Person or SocialPerson id): cousins → aunt/uncle, nieces → sibling,
     *  grandchildren → your child, great-grandchildren → grandchild. */
    parentId: string = null;
    /** v0.17.0: grandparents, aunts and uncles: "mom" or "dad" (your parents' side). */
    side: string = null;
    /** v0.17.0: week (your true age) they were born into the family, for "New baby" badges. */
    bornWeek: number = null;
    /** v0.18.0: head style, skin tone and hair color (see Appearance). */
    appearance: { style: number; skin: number; hair: number } = null;
    /** v0.33.0 coworkers: "boss", "rival", "friend", "gossip", "slacker" or "star"; a boss's style. */
    workRole: string = undefined;
    bossType: string = undefined;
    /** v0.35.0 the night: "sire", "prince", "court", "herd"; a vampire's bloodline and court title. */
    nightRole: string = undefined;
    bloodline: string = undefined;
    courtTitle: string = undefined;

    static make(kind: SocialKind, sex: Sex, lastName: string | null, ageInWeeks: number): SocialPerson {
        const p = new SocialPerson();
        p.id = `${kind}-${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
        p.kind = kind;
        p.sex = sex;
        p.gender = sex.getCorrespondingGender();
        p.sexuality = Sexuality.straight;
        p.firstName = NameGenerator.INSTANCE.generateFirstName(sex);
        p.lastName = lastName ?? NameGenerator.INSTANCE.generateLastName();
        p.ageInWeeks = Math.max(0, ageInWeeks);
        p.trueAgeInWeeks = p.ageInWeeks;
        return p;
    }

    getId(): string { return this.id; }
    getKind(): SocialKind { return this.kind as SocialKind; }
    getFirstName(): string { return this.firstName; }
    getLastName(): string { return this.lastName; }
    getFullName(): string { return `${this.firstName} ${this.lastName}`; }
    getSex(): Sex { return this.sex ?? Sex.male; }
    getGender(): Gender { return this.gender ?? this.getSex().getCorrespondingGender(); }
    getIsAlive(): boolean { return this.isAlive; }
    getIsBuried(): boolean { return this.isBuried; }
    setBuried(b: boolean) { this.isBuried = b; }
    getNotYetBorn(): boolean { return false; }
    getPetType(): any { return null; }
    getAgeInWeeks(): number { return this.ageInWeeks; }
    getAgeInYears(): number { return Math.floor(this.ageInWeeks / Constants.Time.INSTANCE.getWeeksPerYear()); }
    getTrueAgeInWeeks(): number { return Math.max(this.trueAgeInWeeks ?? 0, this.ageInWeeks); }
    getAgeGroup(): AgeGroup { return AgeGroup.INSTANCE.getAgeGroup(this.getAgeInYears()); }
    getRelationshipProgress(): number { return this.relationshipProgress; }
    setRelationshipProgress(v: number) {
        this.relationshipProgress = Math.max(0, Math.min(RelationshipProgressStatus.INSTANCE.getMaxValue(), Math.round(v)));
    }
    getRelationshipStatus(): RelationshipProgressStatus { return RelationshipProgressStatus.INSTANCE.statusFromValue(this.relationshipProgress); }
    /** The Elixir of Youth: younger, but the true age keeps counting up. */
    setAgeInWeeks(w: number) { if (w > this.ageInWeeks) this.trueAgeInWeeks = (this.trueAgeInWeeks ?? 0) + (w - this.ageInWeeks); this.ageInWeeks = Math.max(0, w); }
    getTrueAgeInYears(): number { return Math.floor(this.getTrueAgeInWeeks() / Constants.Time.INSTANCE.getWeeksPerYear()); }
    advanceWeeks(n: number) { this.ageInWeeks += n; this.trueAgeInWeeks = (this.trueAgeInWeeks ?? 0) + n; }

    /** "Brother", "Sister", "Friend", "Ex-wife"… */
    getTitle(): string {
        const male = this.getSex() === Sex.male;
        if (this.kind === "sibling") return male ? "Brother" : "Sister";
        if (this.kind === "coworker") return this.workRole === "boss" ? "Boss" : "Coworker";
        if (this.kind === "night") return this.nightRole === "sire" ? "Sire" : this.nightRole === "herd" ? "Herd" : this.nightRole === "prince" ? "Prince" : (this.courtTitle ?? "Court Vampire");
        if (this.kind === "grandparent") return male ? "Grandfather" : "Grandmother";
        if (this.kind === "auntUncle") return male ? "Uncle" : "Aunt";
        if (this.kind === "cousin") return "Cousin";
        if (this.kind === "nibling") return male ? "Nephew" : "Niece";
        if (this.kind === "grandchild") return male ? "Grandson" : "Granddaughter";
        if (this.kind === "greatGrandchild") return male ? "Great-grandson" : "Great-granddaughter";
        if (this.kind === "ex") {
            if (this.exStatus === "married") return male ? "Ex-husband" : "Ex-wife";
            if (this.exStatus === "engaged") return male ? "Ex-fiancé" : "Ex-fiancée";
            return male ? "Ex-boyfriend" : "Ex-girlfriend";
        }
        return "Friend";
    }
}
