// Hand-ported from Managers/GameStateManager.java. Loads/saves the whole game via SaveCodec.
import { installCrime } from "../Crime/install";
import { World } from "../World/World";
import { Crossover } from "../Lifepaths/Crossover";
import { Appearance } from "../Social/Appearance";
import { BigInteger } from "../runtime";
import { Schooling } from "./Schooling";
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
import { Work } from "../Work/Work";
import { installWork } from "../Work/install";
import { installVampires } from "../Vampires/install";
import { installRemaster } from "../Remaster/install";
import { installYouth } from "../Youth/install";

export class GameStateManager {
    static INSTANCE: GameStateManager;
    currentlyShowingGenericList: any = null;
    globalStateManager!: GlobalStateManager;
    mainGameActivity: any = null;
    mainGameFragment: any = null;
    newGamePlayerState: Player | null = null;

    /** Called once at startup (the Kotlin object's static init). */
    init(): void {
        Crossover.install();   // v0.25.0: Celebrity Life × Vampire cross content (hooks and extra actions)
        installCrime();        // v0.27.0: the Crime update's hooks into careers, moving, heirs, vampires…
        installYouth();        // v0.32.0: Childhood & Teen Years (moments, heirs)
        installWork();         // v0.33.0: The Career Overhaul (hiring, workplace, hustles, companies, benefits)
        installVampires();     // v0.35.0: Vampires Reborn
        installRemaster();     // v0.36.0: The Remaster
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
        // v0.18.0: a random look (skin tone, hair, head style) that can be changed on the customize screen
        const np: any = this.newGamePlayerState;
        if (np != null && !Appearance.valid(np.appearance)) Appearance.set(np, Appearance.random(np.getSex()));
    }
    /** v0.36.0: run when a brand-new life starts (not an heir). */
    static newLifeHooks: ((p: any) => void)[] = [];
    startNewGame(player: Player): void {
        Schooling.fillForAge(player);  // schooling that fits the starting age (preschool…high school)
        World.onNewLife(player);       // v0.27.0: native language (birth country)
        Work.state(player);            // v0.33.0: a new life starts with the new work system (no "upgrade" note)
        for (const h of GameStateManager.newLifeHooks) { try { h(player); } catch (e) { console.error(e); } }   // v0.36.0: head starts
        if (!Appearance.valid((player as any).appearance)) Appearance.set(player, Appearance.random(player.getSex()));
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
