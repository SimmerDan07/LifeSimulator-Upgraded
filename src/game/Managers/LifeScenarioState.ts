// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Intrinsics } from "../runtime";
import { DebugFlag } from "../Enums/DebugFlag";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { GameStateManager } from "./GameStateManager";
import { LifeScenario } from "../Enums/LifeScenario";

export class LifeScenarioState {
    static INSTANCE: any;
    states: ArrayList<LifeScenarioState.SingleLifeScenarioState> = null;
    constructor() {
        this.states = new ArrayList();
        for (const lifeScenario of LifeScenario.values()) {
            this.states.add(new LifeScenarioState.SingleLifeScenarioState(lifeScenario, false, lifeScenario.getInitiallyUnlocked()));
        }
    }
    getStates(): ArrayList<LifeScenarioState.SingleLifeScenarioState> {
        return this.states;
    }
}
export namespace LifeScenarioState {
    export class Companion {
        $init0(): void {
    }
        $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 1) return (this as any).$init1(...a);
            if (a.length === 0) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
    }
    export class SingleLifeScenarioState {
        static INSTANCE: any;
        completed: boolean = false;
        type: LifeScenario = null;
        unlocked: boolean = false;
        constructor(type: LifeScenario, z: boolean, z2: boolean) {
            Intrinsics.checkParameterIsNotNull(type, "type");
        this.type = type;
        this.completed = z;
        this.unlocked = z2;
        }
        static copy$default(singleLifeScenarioState: LifeScenarioState.SingleLifeScenarioState, lifeScenario: LifeScenario, z: boolean, z2: boolean, i: number, obj: any): LifeScenarioState.SingleLifeScenarioState {
        if ((i & 1) !== 0) {
            lifeScenario = singleLifeScenarioState.type;
        }
        if ((i & 2) !== 0) {
            z = singleLifeScenarioState.completed;
        }
        if ((i & 4) !== 0) {
            z2 = singleLifeScenarioState.unlocked;
        }
        return singleLifeScenarioState.copy(lifeScenario, z, z2);
    }
        getType(): LifeScenario {
        return this.type;
    }
        getCompleted(): boolean {
        return this.completed;
    }
        getUnlocked(): boolean {
        return this.unlocked;
    }
        copy(type: LifeScenario, completed: boolean, unlocked: boolean): LifeScenarioState.SingleLifeScenarioState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new LifeScenarioState.SingleLifeScenarioState(type, completed, unlocked);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof LifeScenarioState.SingleLifeScenarioState) {
                let singleLifeScenarioState: LifeScenarioState.SingleLifeScenarioState = (other as unknown as LifeScenarioState.SingleLifeScenarioState);
                if (Intrinsics.areEqual(this.type, singleLifeScenarioState.type)) {
                    if (this.completed === singleLifeScenarioState.completed) {
                        if (this.unlocked === singleLifeScenarioState.unlocked) {
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((("SingleLifeScenarioState(type=" + this.type) + ", completed=") + this.completed) + ", unlocked=") + this.unlocked) + ")";
    }
        setCompleted(z: boolean): void {
        this.completed = z;
    }
        setUnlocked(z: boolean): void {
        this.unlocked = z;
    }
        getPurchased(): boolean {
        return ((DebugFlag.unlockAllScenarios.getEnabled() || (this.type !== LifeScenario.sandboxMode)) || GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockSandboxMode)) || GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockAllContent);
    }
    }
    export namespace SingleLifeScenarioState {
        export class Companion {
            $init0(): void {
    }
            $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
            constructor(...args: any[]) {
                this.$init(...args);
            }
            $init(...a: any[]): any {
                if (a.length === 1) return (this as any).$init1(...a);
                if (a.length === 0) return (this as any).$init0(...a);
                throw new Error('no overload for $init with ' + a.length + ' args');
            }
        }
    }
}
LifeScenarioState.INSTANCE = new LifeScenarioState.Companion(null);
LifeScenarioState.SingleLifeScenarioState.INSTANCE = new LifeScenarioState.SingleLifeScenarioState.Companion(null);
