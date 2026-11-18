// Everything the Love tab remodel needs to remember. Saved with the player (Player.social).
// Older saves have no circle: one is created empty (no siblings or exes, everyone's mood Fine).
import { SocialPerson } from "./SocialPerson";

/** Per-person notes, keyed by Person/SocialPerson id. All fields optional. */
export interface PersonMeta {
    mood?: string;          // happy | fine | stressed | upset
    lastKey?: string;       // (v0.12.0 repeat-action penalty, removed in v0.12.1)
    lastWeek?: number;
    streak?: number;
    touched?: number;       // last week you did anything with them (skips their weekly drift)
    annivYear?: number;     // last anniversary celebrated (years together)
    annivMissed?: number;   // last anniversary that was missed
    bdayYear?: number;      // last birthday party (their age)
    rentHelp?: boolean;     // you pay $200/week towards their rent
    vetUntil?: number;      // pet checked by a vet: healthier until this week
    moneyAskedWeek?: number;
    vowsWeek?: number;
    loanDue?: number;       // sibling loan: week it may be paid back
    knows?: boolean;        // knows you're a vampire
    vampire?: boolean;      // a vampire (you turned them, or met them in your coven)
    collegePaid?: boolean;
    eternalVowsWeek?: number; // v0.17.0 Eternal Bond vows
    celeb?: { career: string; fans: number }; // v0.20.0: a celebrity you dated through Celebrity Life
  // v0.17.0: you paid a grandchild's / niece's college
}

export class SocialCircle {
    people: SocialPerson[] = [];
    meta: any = {};
    /** Week the moods were last rolled. */
    moodWeek: number = -1;
    /** v0.12.1 one-time repair of family scores that drifted away while you were a kid. */
    driftFixed: boolean = false;
    /** v0.17.0: the extended family (grandparents, aunts, uncles, cousins, nieces, nephews, grandchildren) was rolled. */
    extendedRolled: boolean = false;

    list(kind?: string): SocialPerson[] {
        const all = this.people ?? (this.people = []);
        return kind ? all.filter((p) => p.kind === kind) : all.slice();
    }
    get(id: string): SocialPerson | null { return (this.people ?? []).find((p) => p.id === id) ?? null; }
    add(p: SocialPerson) { (this.people ?? (this.people = [])).push(p); }
    remove(id: string) { this.people = (this.people ?? []).filter((p) => p.id !== id); delete (this.meta ?? {})[id]; }
    metaFor(id: string): PersonMeta {
        const m = this.meta ?? (this.meta = {});
        return m[id] ?? (m[id] = {});
    }
}
