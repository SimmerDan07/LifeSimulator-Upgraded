// Hand-ported from Managers/GameStateManager.java. Loads/saves the whole game via SaveCodec.
import { BigInteger } from "../runtime";
import { GlobalStateManager } from "./GlobalStateManager";
import { Player } from "./Player";
import { NameGenerator } from "./NameGenerator";
import { MoneyState } from "./MoneyState";
import { TelemetryManager } from "./TelemetryManager";
import { Sex } from "../Enums/Sex";
import { Gender } from "../Enums/Gender";
import { Sexuality } from "../Enums/Sexuality";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { DebugFlag } from "../Enums/DebugFlag";
import type { LifeScenario } from "../Enums/LifeScenario";
import { Constants } from "../Utils/Constants";
import { Utils } from "../Utils/Utils";
import { SaveCodec } from "../save/SaveCodec";

export class GameStateManager {
    static INSTANCE: GameStateManager;
    currentlyShowingGenericList: any = null;
    globalStateManager!: GlobalStateManager;
    mainGameActivity: any = null;
    mainGameFragment: any = null;
    newGamePlayerState: Player | null = null;

    /** Called once at startup (the Kotlin object's static init). */
    init(): void {
        this.globalStateManager = this.loadData();
        const slot = this.globalStateManager.getSaveState().currentSlot();
        if (slot.getPersonState() == null) {
            slot.setPersonState(new Player(NameGenerator.INSTANCE.generateFirstName(Sex.male), "Liu", Gender.male, Sexuality.straight, Sex.male, Constants.Time.INSTANCE.getWeeksPerYear() * 60));
        }
    }

    getPersonState(): Player {
        const p = this.globalStateManager.getSaveState().currentSlot().getPersonState();
        if (p == null) throw new Error("no person state");
        return p;
    }
    getGlobalStateManager(): GlobalStateManager { return this.globalStateManager; }
    setGlobalStateManager(g: GlobalStateManager) { this.globalStateManager = g; }
    getMainGameFragment(): any { return this.mainGameFragment; }
    setMainGameFragment(f: any) { this.mainGameFragment = f; }
    getMainGameActivity(): any { return this.mainGameActivity; }
    setMainGameActivity(a: any) { this.mainGameActivity = a; }
    getCurrentlyShowingGenericList(): any { return this.currentlyShowingGenericList; }
    setCurrentlyShowingGenericList(f: any) { this.currentlyShowingGenericList = f; }
    getNewGamePlayerState(): Player | null { return this.newGamePlayerState; }
    setNewGamePlayerState(p: Player | null) { this.newGamePlayerState = p; }

    saveData(): void {
        Utils.Storage.INSTANCE.writeFile(null, SaveCodec.encode(this.globalStateManager), Constants.File.INSTANCE.getSaveFileName());
    }
    loadData(): GlobalStateManager {
        const text = Utils.Storage.INSTANCE.readFile(null, Constants.File.INSTANCE.getSaveFileName());
        if (text != null && text.length > 0) {
            try {
                return SaveCodec.decode(text) as GlobalStateManager;
            } catch (e) {
                console.error("Save file could not be loaded; starting fresh.", e);
            }
        }
        return new GlobalStateManager();
    }
    startNewGameFlow(lifeScenario: LifeScenario): void {
        TelemetryManager.INSTANCE.logEvent("New_Game", null);
        this.newGamePlayerState = lifeScenario.getInitialState();
    }
    startNewGame(player: Player): void {
        player.applyPerkStateEffects();
        player.applyNameEasternEgg();
        this.globalStateManager.getSaveState().currentSlot().setPersonState(player);
        this.globalStateManager.getSaveState().setHasGameStarted(true);
        if (DebugFlag.startWithAlotOfMoney.getEnabled()) {
            MoneyState.updateMoney$default(player.getMoneyState(), new BigInteger("5000000000000000"), MoneyUpdateType.workIncome, null, null, 12, null);
        }
        this.saveData();
    }
}
GameStateManager.INSTANCE = new GameStateManager();
