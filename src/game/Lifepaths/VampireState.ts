// The Vampire lifepath's save data (Player.vampire). Older saves have none: you're human.
export class VampireState {
    /** The path has been revealed (pale stranger or Seek the Ancient). */
    discovered: boolean = false;
    /** Weeks left of the turning (the week after accepting the bite). */
    turningWeeks: number = 0;
    isVampire: boolean = false;
    /** Physical age (weeks) when turned, and your true age (weeks) then. */
    turnedAtWeeks: number = 0;
    turnedTrueWeek: number = 0;
    /** Weeks lived as a vampire; also keeps the calendar moving while your age is frozen. */
    vampireWeeks: number = 0;
    /** Added to your (frozen) age to work out the month and new years. Kept after the Cure. */
    calendarOffset: number = 0;
    thirst: number = 0;
    suspicion: number = 0;
    weeksAtMaxThirst: number = 0;
    bloodPower: number = 0;
    yearsAwarded: number = 0;
    powers: string[] = [];
    /** Weeks left until the Cure takes effect (0 = not curing). */
    cureWeeks: number = 0;
    /** You were a vampire once and took the Cure. */
    cured: boolean = false;
    seekTries: number = 0;
    /** v0.16.0: the blood diet id (see BLOOD_DIETS); undefined in older saves = Feed by Hand. */
    diet: string = "hand";
}
