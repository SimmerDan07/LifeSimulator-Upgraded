// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Intrinsics, JEnum, NoWhenBranchMatchedException } from "../runtime";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { LifeScenarioState } from "../Managers/LifeScenarioState";
import { Player } from "../Managers/Player";

export class GooglePlayLeaderboard extends JEnum {
    static readonly highestAge: GooglePlayLeaderboard = new GooglePlayLeaderboard("highestAge", 0);
    static readonly highestTrueAge: GooglePlayLeaderboard = new GooglePlayLeaderboard("highestTrueAge", 1);
    static readonly highestNetWorth: GooglePlayLeaderboard = new GooglePlayLeaderboard("highestNetWorth", 2);
    static readonly mostNumberOfChildren: GooglePlayLeaderboard = new GooglePlayLeaderboard("mostNumberOfChildren", 3);
    static readonly mostNumberOfBadges: GooglePlayLeaderboard = new GooglePlayLeaderboard("mostNumberOfBadges", 4);
    static readonly mostLifeScenariosComplete: GooglePlayLeaderboard = new GooglePlayLeaderboard("mostLifeScenariosComplete", 5);
    static values(): GooglePlayLeaderboard[] { return [GooglePlayLeaderboard.highestAge, GooglePlayLeaderboard.highestTrueAge, GooglePlayLeaderboard.highestNetWorth, GooglePlayLeaderboard.mostNumberOfChildren, GooglePlayLeaderboard.mostNumberOfBadges, GooglePlayLeaderboard.mostLifeScenariosComplete]; }
    static valueOf(n: string): GooglePlayLeaderboard { return (GooglePlayLeaderboard as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getGooglePlayId(): string {
        switch (this) {
            case GooglePlayLeaderboard.highestAge:
                return "CgkIwaX8nNkXEAIQAQ";
            case GooglePlayLeaderboard.highestTrueAge:
                return "CgkIwaX8nNkXEAIQAg";
            case GooglePlayLeaderboard.highestNetWorth:
                return "CgkIwaX8nNkXEAIQAw";
            case GooglePlayLeaderboard.mostNumberOfChildren:
                return "CgkIwaX8nNkXEAIQBA";
            case GooglePlayLeaderboard.mostNumberOfBadges:
                return "CgkIwaX8nNkXEAIQBQ";
            case GooglePlayLeaderboard.mostLifeScenariosComplete:
                return "CgkIwaX8nNkXEAIQBg";
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    valueForLeaderboard(player: Player): number {
        Intrinsics.checkParameterIsNotNull(player, "player");
        switch (this) {
            case GooglePlayLeaderboard.highestAge:
                return player.getAgeInYears();
            case GooglePlayLeaderboard.highestTrueAge:
                return player.getTrueAgeInYears();
            case GooglePlayLeaderboard.highestNetWorth:
                return ExtensionsKt.toIntegerCappingAtMaxInt(player.getNetWorth());
            case GooglePlayLeaderboard.mostNumberOfChildren:
                return player.getFamilyState().getChildren().size();
            case GooglePlayLeaderboard.mostNumberOfBadges:
                return GameStateManager.INSTANCE.getGlobalStateManager().getAchievementBadgeState().completedBadges().length;
            case GooglePlayLeaderboard.mostLifeScenariosComplete:
                let states: ArrayList<LifeScenarioState.SingleLifeScenarioState> = GameStateManager.INSTANCE.getGlobalStateManager().getLifeScenarioState().getStates();
                let arrayList: ArrayList = new ArrayList();
                for (const obj of states) {
                    if (((obj as unknown as LifeScenarioState.SingleLifeScenarioState)).getCompleted()) {
                        arrayList.add(obj);
                    }
                }
                return arrayList.size();
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
}
