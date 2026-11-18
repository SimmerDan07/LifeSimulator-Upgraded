// Leisure tab: "Playtime" — things to do for young children (ages 0–8), shown above the normal leisure list.
// They work like the other leisure actions (cost + happiness/sanity/health, one week passes); the family ones also
// bring you closer to your parents. The images are the original game's child-activity pictures; like the other
// leisure rows they aren't drawn (ActionCellSingleViewModel.initWithActionDescriptor passes Integer.valueOf(name) = NaN).
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { Modifiers } from "./Modifiers";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";

type KidDef = {
    id: string; title: string; minAge: number; maxAge: number; cost: number;
    mods: [number, number, number];     // health, happiness, sanity
    image: any; needsParent?: boolean; parentBond?: number;
};

const DEFS: KidDef[] = [
    { id: "nap", title: "Nap Time", minAge: 0, maxAge: 4, cost: 0, mods: [2, 2, 4], image: R.drawable.vacation_take_week_off },
    { id: "toys", title: "Play with Toys", minAge: 0, maxAge: 8, cost: 0, mods: [0, 5, 2], image: R.drawable.love_play },
    { id: "story", title: "Bedtime Story", minAge: 0, maxAge: 8, cost: 0, mods: [0, 3, 5], image: R.drawable.childaction_tellstory, needsParent: true, parentBond: 8 },
    { id: "playground", title: "Go to the Playground", minAge: 2, maxAge: 8, cost: 0, mods: [2, 6, 3], image: R.drawable.childaction_playground },
    { id: "catch", title: "Play Catch with a Parent", minAge: 3, maxAge: 8, cost: 0, mods: [2, 5, 2], image: R.drawable.childaction_playcatch, needsParent: true, parentBond: 12 },
    { id: "movie", title: "Family Movie Night", minAge: 2, maxAge: 8, cost: 10, mods: [0, 6, 5], image: R.drawable.childaction_movienight, needsParent: true, parentBond: 15 },
    { id: "museum", title: "Children's Museum", minAge: 4, maxAge: 8, cost: 20, mods: [0, 5, 6], image: R.drawable.love_museum },
    { id: "carnival", title: "Go to the Carnival", minAge: 3, maxAge: 8, cost: 40, mods: [0, 10, 4], image: R.drawable.childaction_carnival },
    { id: "themepark", title: "Theme Park Trip", minAge: 4, maxAge: 8, cost: 150, mods: [0, 16, 8], image: R.drawable.childaction_themepark },
    { id: "familytrip", title: "Family Vacation", minAge: 2, maxAge: 8, cost: 400, mods: [1, 20, 12], image: R.drawable.childaction_familyvacation, needsParent: true, parentBond: 60 },
];

/** One playtime activity; implements the same interface as the game's leisure actions so it looks the same. */
export class KidActivity {
    constructor(public def: KidDef) {}
    getTitle(): string { return this.def.title; }
    getImageId(): any { return this.def.image; }
    getCost(): BigInteger { return BigInteger.valueOf(this.def.cost); }
    getModifiers(): Modifiers { return new Modifiers(this.def.mods[0], this.def.mods[1], this.def.mods[2]); }
    getActionTitle(): string | null { return null; }
    getAdditionalDescription(): string | null { return null; }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(player: any): string | null {
        const age = player.getAgeInYears();
        if (age < this.def.minAge) return `Must be at least ${this.def.minAge} years old`;
        if (age > this.def.maxAge) return `Only for ages ${this.def.minAge}–${this.def.maxAge}`;
        if (this.def.needsParent && KidsLeisure.livingParents(player).length === 0) return "Needs a parent";
        return null;
    }
    action(player: any): void {
        if (this.requirementNotMetString(player) != null) return;
        player.applyAttributeAndMoneyFromEvent(this);
        if (this.def.parentBond) {
            const max = RelationshipProgressStatus.INSTANCE.getMaxValue();
            const parents = KidsLeisure.livingParents(player);
            for (const p of parents) p.setRelationshipProgress(Math.min(max, p.getRelationshipProgress() + this.def.parentBond));
            // time with your parents this week: no weekly drift for them (like the game's own family actions)
            if (parents.length) player.getTempState().setPrevActionState(parents[0].getRelationship().getCorrespondingActionType());
        }
        player.applyWeekly();
    }
}

export const KidsLeisure = {
    maxAge: 8,
    activities: DEFS.map((d) => new KidActivity(d)),
    shown(player: any): boolean { return player.getAgeInYears() <= KidsLeisure.maxAge; },
    livingParents(player: any): any[] {
        return Array.from(player.getFamilyState().getParents() as any).filter((p: any) => p.getIsAlive());
    },
    get(id: string): KidActivity { return KidsLeisure.activities.find((a) => a.def.id === id)!; },
    /** The player, for convenience in tests. */
    player(): any { return GameStateManager.INSTANCE.getPersonState(); },
};
