// Hand-ported: container for all persistent state (saved as one JSON document).
import { GameInAppPurchaseState } from "./GameInAppPurchaseState";
import { PerkState } from "./PerkState";
import { AchievementBadgeState } from "./AchievementBadgeState";
import { LifeScenarioState } from "./LifeScenarioState";
import { AchievementState } from "./AchievementState";
import { GameSaveSlotState } from "./GameSaveSlotState";
import { GameSettings } from "./GameSettings";
import { CemetaryState } from "./CemetaryState";
import { GlobalGameState } from "./GlobalGameState";
import { BackgroundRewardState } from "./BackgroundRewardState";

export class GlobalStateManager {
    inappPurchaseState = new GameInAppPurchaseState();
    perkState = new PerkState();
    achievementBadgeState = new AchievementBadgeState();
    lifeScenarioState = new LifeScenarioState();
    achievementState = new AchievementState();
    saveState = new GameSaveSlotState();
    gameSettings = new GameSettings();
    cemetaryState = new CemetaryState();
    globalGameState = new GlobalGameState();
    backgroundRewardState = new BackgroundRewardState();

    getInappPurchaseState() { return this.inappPurchaseState; }
    getPerkState() { return this.perkState; }
    getAchievementBadgeState() { return this.achievementBadgeState; }
    getLifeScenarioState() { return this.lifeScenarioState; }
    getAchievementState() { return this.achievementState; }
    getSaveState() { return this.saveState; }
    getGameSettings() { return this.gameSettings; }
    getCemetaryState() { return this.cemetaryState; }
    getGlobalGameState() { return this.globalGameState; }
    getBackgroundRewardState() { return this.backgroundRewardState; }
}
