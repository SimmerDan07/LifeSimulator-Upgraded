//@@ +imports
import { Trait } from "./Trait";
//@@ SideHustle.ProjectEffort.progressRequirement
/** Months of work a project needs (reconstructed from bytecode) x weeks per month. */
progressRequirement(hustle: SideHustle): number {
    const T: Record<string, number[]> = {
        appDeveloper: [5, 8, 12], youTubeStar: [2, 3, 5], DJ: [3, 5, 7], author: [8, 12, 18], actor: [12, 18, 24],
    };
    const row = T[hustle.name()];
    const idx = this === SideHustle.ProjectEffort.light ? 0 : this === SideHustle.ProjectEffort.medium ? 1 : this === SideHustle.ProjectEffort.heavy ? 2 : -1;
    const months = row && idx >= 0 ? row[idx] : 0;
    return months * Constants.Time.INSTANCE.getWeeksPerMonth();
}
//@@ SideHustle.ProjectQuality.weeklyIncome
/** Weekly income of a finished project (reconstructed from bytecode). */
weeklyIncome(hustle: SideHustle): number {
    const T: Record<string, number[]> = {          // garbage, poor, average, good, amazing
        appDeveloper: [5, 20, 100, 500, 2000],
        youTubeStar: [1, 5, 20, 125, 500],
        DJ: [3, 10, 50, 200, 1000],
        author: [6, 25, 200, 600, 3000],
        actor: [20, 50, 250, 1250, 5000],
    };
    const row = T[hustle.name()];
    let income = row ? row[this.ordinal()] : 0;
    const player = GameStateManager.INSTANCE.getPersonState();
    const boostTrait = hustle.getIncomeBoostTrait();
    if (boostTrait != null && player.hasTrait(boostTrait)) {
        income = JMath.toInt(income * Trait.INSTANCE.getChooseCareerIncomeBoost());
    }
    if (player.getMiscState().isAdDoubleIncomeRewardActive()) income *= 2;
    const item = player.getItemState().getState(hustle.getRequiredItem());
    return JMath.toInt(income * (1 + (item.getLevel() - 1) * item.getType().getItemBoostModifier()));
}
