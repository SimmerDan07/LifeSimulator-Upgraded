// The obituary (v0.17.0): a written summary of a life, shown under the tombstone on the Life Summary screen
// (and for past lives in the cemetery). The cause of death is recorded when the death alert is shown.
import { TrueAge } from "./TrueAge";
import { Pair } from "../runtime";
import { Illness } from "../Health/Illness";
import { ILLNESS_DEFS } from "../Health/IllnessData";
import { BaseViewModel } from "../Models/BaseViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { PersonAttribute } from "../Enums/PersonAttribute";
import { Relationship } from "../Enums/Relationship";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { Sex } from "../Enums/Sex";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { Constants } from "../Utils/Constants";
import { Vampire } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";

const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1]);

export const Obituary = {
    /** Remember how they died (called with the death alert's reason). */
    record(p: any, reason: string) {
        if (p == null) return;
        try { p.deathCause = Obituary.causeFor(p, reason); } catch { p.deathCause = reason; }
    },
    causeFor(p: any, reason: string): string {
        const t = (a: PersonAttribute) => { try { return a.getTitle(); } catch { return a.name(); } };
        if (reason === t(PersonAttribute.health)) {
            if (Vampire.isVampire(p)) return "Starved for blood";
            const ill = Illness.deathCause(p);   // v0.28.0
            if (ill) return ill;
            return p.getAgeInYears() >= 70 ? "Old age" : "Poor health";
        }
        if (reason === t(PersonAttribute.happiness)) return "A broken spirit";
        if (reason === t(PersonAttribute.sanity)) return "A mental breakdown";
        if (reason === "Assisted dying") return "Assisted dying";
        if (reason === "Vampire hunters") return "Slain by vampire hunters";
        if (reason === "Final Rest") return "Final Rest (one last sunrise)";
        if (reason === "Bankruptcy") return "Bankruptcy";
        return reason || "Unknown";
    },
    phrase(cause: string): string {
        switch (cause) {
            case "Old age": return "peacefully of old age";
            case "Poor health": return "after a long battle with poor health";
            case "Starved for blood": return "starved for blood";
            case "A broken spirit": return "of a broken spirit";
            case "A mental breakdown": return "after a mental breakdown";
            case "Assisted dying": return "peacefully, with medical assistance";
            case "Slain by vampire hunters": return "at the hands of vampire hunters";
            case "Final Rest (one last sunrise)": return "choosing to watch one last sunrise";
            case "Bankruptcy": return "penniless after going bankrupt";
            default: { const d = ILLNESS_DEFS.find((x) => x.title === cause); if (d) return d.kind === "injury" ? `from a ${cause.toLowerCase()}` : `after a battle with ${cause.toLowerCase().replace(/^type 2 /, "")}`; return ""; }
        }
    },
    social(p: any, kind: string): any[] { try { return p.getSocial().list(kind); } catch { return []; } },
    members(p: any, rel: Relationship): any[] { try { return Array.from(p.getFamilyState().membersForType(rel) as any) as any[]; } catch { return []; } },
    /** Living family (survived by) and those who died first (preceded in death by). */
    family(p: any): { survived: string[]; preceded: string[]; counts: Record<string, number> } {
        const survived: string[] = [], preceded: string[] = [];
        const counts: Record<string, number> = {};
        const partner = p.getFamilyState().getPartner();
        if (partner != null) {
            const word = p.getRomanticRelationshipStatus() === RomanticRelationshipStatus.married || p.getRomanticRelationshipStatus() === RomanticRelationshipStatus.widowed
                ? (partner.getSex() === Sex.male ? "husband" : "wife") : "partner";
            (partner.getIsAlive() ? survived : preceded).push(`${word} ${partner.getFirstName()}`);
        }
        const group = (label: string, one: string, xs: any[]) => {
            const alive = xs.filter((x) => x.getIsAlive() && !x.getNotYetBorn?.()), dead = xs.filter((x) => !x.getIsAlive());
            counts[label] = alive.length;
            if (alive.length) survived.push(alive.length <= 2 && one !== "parent" ? `${plural(alive.length, one)} (${alive.map((x) => x.getFirstName()).join(" and ")})` : plural(alive.length, one));
            if (dead.length) preceded.push(dead.length <= 2 ? `${plural(dead.length, one)} (${dead.map((x) => x.getFirstName()).join(" and ")})` : plural(dead.length, one));
        };
        group("Children", "child", Obituary.members(p, Relationship.child).map((x) => x));
        // fix the plural of child
        for (const arr of [survived, preceded]) for (let i = 0; i < arr.length; i++) arr[i] = arr[i].replace(/^(\d+) childs/, "$1 children");
        group("Grandchildren", "grandchild", Obituary.social(p, "grandchild"));
        for (const arr of [survived, preceded]) for (let i = 0; i < arr.length; i++) arr[i] = arr[i].replace(/^(\d+) grandchilds/, "$1 grandchildren");
        group("Great-grandchildren", "great-grandchild", Obituary.social(p, "greatGrandchild"));
        for (const arr of [survived, preceded]) for (let i = 0; i < arr.length; i++) arr[i] = arr[i].replace(/^(\d+) great-grandchilds/, "$1 great-grandchildren");
        group("Siblings", "sibling", Obituary.social(p, "sibling"));
        const parents = Obituary.members(p, Relationship.parent);
        const deadParents = parents.filter((x) => !x.getIsAlive()).length, liveParents = parents.length - deadParents;
        if (liveParents) survived.push(liveParents === 2 ? "both parents" : "a parent");
        if (deadParents) preceded.push(deadParents === 2 ? "both parents" : "a parent");
        counts["Nieces & nephews"] = Obituary.social(p, "nibling").filter((x: any) => x.getIsAlive()).length;
        return { survived, preceded, counts };
    },
    career(p: any): string {
        try {
            if (p.retired && p.getJobState().getCurrentJob() == null) return "retired";
            const job = p.getJobState().getCurrentJobDisplayString();
            return job && !/unemployed/i.test(job) ? job : "";
        } catch { return ""; }
    },
    text(p: any): string {
        const he = p.getSex() === Sex.female ? "She" : "He";
        const his = p.getSex() === Sex.female ? "her" : "his";
        const cause = p.deathCause ?? "";
        const age = p.getAgeInYears(), trueAge = p.getTrueAgeInYears();
        let t = p.retiredTo
            ? `${p.getFullName()} handed everything down to ${p.retiredTo} at the age of ${age} and retired.`   // v0.28.0 Switch Life
            : `${p.getFullName()} died at the age of ${age}` + (trueAge !== age ? ` (true age ${TrueAge.text(p)})` : "") + (Obituary.phrase(cause) ? ", " + Obituary.phrase(cause) : "") + ".";
        const vs = Vampire.peek(p);
        if (vs != null && (vs.isVampire || vs.cured) && vs.vampireWeeks > 0) {
            const y = Math.floor(vs.vampireWeeks / WPY());
            t += vs.cured ? ` ${he} lived ${plural(y, "year")} as a vampire before taking the Vampiric Cure.` : ` ${he} walked the night as a vampire for ${plural(y, "year")}.`;
        }
        // v0.19.0 Celebrity Life
        const famous = Celebrity.describe(p);
        if (famous) {
            const cs = Celebrity.peek(p);
            const known = Celebrity.knownFor(p);
            t += ` ${he} was ${famous}${known ? `, best known for ${known}` : ""}, with ${Celebrity.fansText(cs.peakFans)} fans at the height of ${his} fame` +
                (cs.awards.length ? ` and ${plural(cs.awards.length, "award")} to ${his} name` : "") + (cs.walkOfFame ? `, and has a star on the Walk of Fame` : "") + ".";
        }
        const job = Obituary.career(p);
        if (job === "retired") t += ` ${he} had retired.`;
        else if (job) t += ` ${he} worked as ${/^[aeiou]/i.test(job) ? "an" : "a"} ${job}.`;
        const fam = Obituary.family(p);
        if (fam.survived.length) t += ` ${he} is survived by ${his} ${list(fam.survived)}.`;
        if (fam.preceded.length) t += ` ${he} was preceded in death by ${his} ${list(fam.preceded)}.`;
        t += ` ${he} left behind ${ExtensionsKt.numberDisplayString$default(p.getNetWorth(), false, 1, null)}.`;
        if ((p.getGeneration?.() ?? 1) > 1) t += ` Generation ${p.getGeneration()} of the ${p.getLastName()} family.`;
        return t;
    },
    rows(p: any): Pair<string, string>[] {
        const rows: [string, string][] = [];
        rows.push(["Cause of death", p.deathCause ?? "Unknown"]);
        rows.push(["Age", p.getTrueAgeInYears() !== p.getAgeInYears() ? `${p.getAgeInYears()} (true age ${TrueAge.text(p)})` : String(p.getAgeInYears())]);
        const vs = Vampire.peek(p);
        if (vs != null && vs.vampireWeeks > 0 && (vs.isVampire || vs.cured)) rows.push(["Vampire for", plural(Math.floor(vs.vampireWeeks / WPY()), "year")]);
        rows.push(["Net worth", ExtensionsKt.numberDisplayString$default(p.getNetWorth(), false, 1, null)]);
        const job = Obituary.career(p);
        if (job) rows.push(["Career", job === "retired" ? "Retired" : job]);
        const fame = Celebrity.fameLine(p);
        if (fame) rows.push(["Fame", fame]);
        const cs = Celebrity.peek(p);
        if (cs != null && cs.awards.length) rows.push(["Awards", String(cs.awards.length)]);
        const known = Celebrity.knownFor(p);
        if (known) rows.push(["Known for", known.replace(/^the /, "")]);
        const c = Obituary.family(p).counts;
        for (const k of ["Children", "Grandchildren", "Great-grandchildren", "Siblings", "Nieces & nephews"]) if (c[k]) rows.push([k + " (living)", String(c[k])]);
        if ((p.getGeneration?.() ?? 1) > 1) rows.push(["Generation", String(p.getGeneration())]);
        return rows.map(([a, b]) => new Pair(a, b));
    },
    viewModels(p: any): BaseViewModel[] {
        if (p == null) return [];
        return [
            new HeaderTitleViewModel("Obituary"),
            new SingleLabelCellViewModel("Obituary", new TextLabelViewModel(Obituary.text(p), null, false, false, null, null, 62, null)),
            Utils.ViewModel.INSTANCE.getPropertyListViewModel(Obituary.rows(p)),
        ];
    },
};
