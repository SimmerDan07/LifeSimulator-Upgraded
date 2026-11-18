// School for kids (Preschool → Elementary → Middle → High School) and age limits for young players.
//
// Kids study by clicking the school each week (one week of school per click), like the original game, but school
// now takes realistic time and each school has a starting age, so you graduate high school around 17–18 instead of 15:
//   Preschool          ages 3–5    2 school years   optional; a head start of half a year in elementary
//   Elementary School  from 5      6 school years   (K–5)
//   Middle School      from 11     3 school years   needs Elementary
//   High School        from 14     4 school years   needs Middle
// A school year is 40 weeks of study (the game's year is 48 weeks, so studying every week keeps you slightly ahead).
// Adults (18+) who never finished go to night school at the original, faster pace (like a GED).
import { CompletableAction } from "../Enums/CompletableAction";
import { Constants } from "../Utils/Constants";
import { GameStateManager } from "./GameStateManager";

type SchoolInfo = { minAge: number; maxAge: number | null; years: number; adultWeeks: number | null };

export const Schooling = {
    weeksPerSchoolYear: 40,
    adultAge: 18,
    /** Weeks of elementary school you skip if you finished preschool. */
    preschoolHeadStartWeeks: 20,

    info(a: CompletableAction): SchoolInfo | null {
        switch (a) {
            case CompletableAction.preschool: return { minAge: 3, maxAge: 5, years: 2, adultWeeks: null };
            case CompletableAction.elementarySchool: return { minAge: 5, maxAge: null, years: 6, adultWeeks: 60 };
            case CompletableAction.middleSchool: return { minAge: 11, maxAge: null, years: 3, adultWeeks: 60 };
            case CompletableAction.highSchool: return { minAge: 14, maxAge: null, years: 4, adultWeeks: 80 };
            default: return null;
        }
    },
    isSchool(a: CompletableAction): boolean { return Schooling.info(a) != null; },
    order(): CompletableAction[] { return [CompletableAction.preschool, CompletableAction.elementarySchool, CompletableAction.middleSchool, CompletableAction.highSchool]; },

    isAdult(player: any): boolean { return player != null && player.getAgeInYears() >= Schooling.adultAge; },

    /** Weeks of study needed. Kids: full school years. Adults: night school (null = not offered, e.g. preschool). */
    weeksRequired(a: CompletableAction, player: any): number | null {
        const info = Schooling.info(a);
        if (info == null) return null;
        if (Schooling.isAdult(player)) return info.adultWeeks;
        let weeks = info.years * Schooling.weeksPerSchoolYear;
        if (a === CompletableAction.elementarySchool && player?.getCompletableActionState?.()?.isCompleted(CompletableAction.preschool)) {
            weeks -= Schooling.preschoolHeadStartWeeks;
        }
        return weeks;
    },

    /** Why this school can't be studied right now because of age, or null. */
    ageBlock(a: CompletableAction, player: any): string | null {
        const info = Schooling.info(a);
        if (info == null || player == null) return null;
        const age = player.getAgeInYears();
        if (age < info.minAge) return `Starts at age ${info.minAge}`;
        if (info.maxAge != null && age > info.maxAge) return `Only for ages ${info.minAge}–${info.maxAge}`;
        return null;
    },

    /** Short line shown under the school on the Education tab. */
    description(a: CompletableAction, player: any): string | null {
        const info = Schooling.info(a);
        if (info == null) return null;
        if (Schooling.isAdult(player) && info.adultWeeks != null) return `Night school for adults: ${info.adultWeeks} weeks of study.`;
        const ages = info.maxAge != null ? `Ages ${info.minAge}–${info.maxAge}` : `From age ${info.minAge}`;
        const years = `${info.years} school years`;
        if (a === CompletableAction.preschool) return `${ages} · ${years} · optional, gives a head start in elementary school.`;
        const weeks = Schooling.weeksRequired(a, player) ?? info.years * Schooling.weeksPerSchoolYear;
        const headStart = weeks < info.years * Schooling.weeksPerSchoolYear ? ", preschool head start" : "";
        return `${ages} · ${years} (${weeks} weeks of study${headStart}).`;
    },

    /**
     * Makes a new character's schooling fit their age (scenario starts, sandbox, heirs).
     * - Earlier schools are completed when a later one is done or under way.
     * - Anyone 11+ has finished preschool and elementary (the original game had no such schools).
     * - Minors also get the schools their age implies, and progress in the school they'd be in now — but only where
     *   the scenario didn't set that school itself.
     * - With `byAge` (heirs), adults also get middle/high school by age (14 / 18), like before.
     */
    fillForAge(player: any, byAge = false) {
        const edu = player.getCompletableActionState();
        const age = player.getAgeInYears();
        const schools = Schooling.order();
        // Set records directly: the character being set up may not be the current player yet, and the shared
        // helpers measure progress against the current player.
        const st = (a: CompletableAction) => edu.getState(a);
        const complete = (a: CompletableAction) => { if (!st(a).getCompleted()) { st(a).setCompleted(true); st(a).setProgress(Schooling.weeksRequired(a, player) ?? 0); } };
        const touched = (a: CompletableAction) => st(a).getCompleted() || st(a).getProgress() > 0;
        // consistency: anything before a started school is done
        for (let i = schools.length - 1; i > 0; i--) {
            if (touched(schools[i])) for (let j = 0; j < i; j++) complete(schools[j]);
        }
        if (age >= 11) { complete(CompletableAction.preschool); complete(CompletableAction.elementarySchool); }
        if (age < Schooling.adultAge || byAge) {
            for (const a of schools) {
                if (touched(a)) continue;
                const info = Schooling.info(a)!;
                if (age >= info.minAge + info.years) complete(a);
                else {
                    if (age > info.minAge && age < Schooling.adultAge) {
                        const need = Schooling.weeksRequired(a, player) ?? 0;
                        st(a).setProgress(Math.min(need - 1, (age - info.minAge) * Schooling.weeksPerSchoolYear));
                    }
                    break;
                }
            }
        }
    },
};

/** Age limits for young players (the game can now start at age 0). */
export const AgeLimits = {
    work: 14,          // jobs and side hustles
    adultStuff: 18,    // businesses, property, loans, stocks
    skills: 6,         // skills and languages

    tooYoung(min: number, player?: any): string | null {
        const p = player ?? GameStateManager.INSTANCE.getPersonState();
        return p.getAgeInYears() < min ? `Must be at least ${min} years old` : null;
    },
};

/** Elixir of Youth can't make you younger than this (the original game's minimum age). */
export const ELIXIR_MIN_AGE_WEEKS = () => Constants.Time.INSTANCE.getWeeksPerYear() * Constants.Person.INSTANCE.getMinAgeInYears();
