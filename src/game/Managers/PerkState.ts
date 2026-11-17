// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Intrinsics, NoWhenBranchMatchedException } from "../runtime";
import { Achievement } from "../Enums/Achievement";
import { DebugFlag } from "../Enums/DebugFlag";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { GameStateManager } from "./GameStateManager";
import { Perk } from "../Enums/Perk";

export class PerkState {
    static INSTANCE: any;
    states: ArrayList<PerkState.SinglePerkState> = null;
    constructor() {
        this.states = new ArrayList();
        for (const perk of Perk.INSTANCE.getAvailablePerks()) {
            this.states.add(new PerkState.SinglePerkState(perk, false));
        }
    }
    getStates(): ArrayList<PerkState.SinglePerkState> {
        return this.states;
    }
    isPerkUnlocked(perk: Perk): boolean {
        Intrinsics.checkParameterIsNotNull(perk, "perk");
        if (DebugFlag.unlockAllPerks.getEnabled()) {
            return true;
        }
        let i: Perk.PerkUnlockType = perk.getUnlockType();
        if (i === Perk.PerkUnlockType.inAppPurchase) {
            return GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockAllContent) || GameStateManager.INSTANCE.getGlobalStateManager().getInappPurchaseState().isPurchased(GameInAppPurchase.unlockAllPerks);
        }
        if (i !== Perk.PerkUnlockType.achievement) {
            if (i === Perk.PerkUnlockType.dailyReward) {
                return false;
            }
            throw new NoWhenBranchMatchedException();
        }
        let requiredAchievementToUnlock: Achievement = perk.getRequiredAchievementToUnlock();
        if (requiredAchievementToUnlock != null) {
            return GameStateManager.INSTANCE.getGlobalStateManager().getAchievementState().isAchievementComplete(requiredAchievementToUnlock);
        }
        return false;
    }
}
export namespace PerkState {
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
    export class SinglePerkState {
        static INSTANCE: any;
        type: Perk = null;
        unlocked: boolean = false;
        constructor(type: Perk, z: boolean) {
            Intrinsics.checkParameterIsNotNull(type, "type");
        this.type = type;
        this.unlocked = z;
        }
        static copy$default(singlePerkState: PerkState.SinglePerkState, perk: Perk, z: boolean, i: number, obj: any): PerkState.SinglePerkState {
        if ((i & 1) !== 0) {
            perk = singlePerkState.type;
        }
        if ((i & 2) !== 0) {
            z = singlePerkState.unlocked;
        }
        return singlePerkState.copy(perk, z);
    }
        getType(): Perk {
        return this.type;
    }
        getUnlocked(): boolean {
        return this.unlocked;
    }
        copy(type: Perk, unlocked: boolean): PerkState.SinglePerkState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new PerkState.SinglePerkState(type, unlocked);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof PerkState.SinglePerkState) {
                let singlePerkState: PerkState.SinglePerkState = (other as unknown as PerkState.SinglePerkState);
                if (Intrinsics.areEqual(this.type, singlePerkState.type)) {
                    if (this.unlocked === singlePerkState.unlocked) {
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((("SinglePerkState(type=" + this.type) + ", unlocked=") + this.unlocked) + ")";
    }
        setUnlocked(z: boolean): void {
        this.unlocked = z;
    }
    }
    export namespace SinglePerkState {
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
PerkState.INSTANCE = new PerkState.Companion(null);
PerkState.SinglePerkState.INSTANCE = new PerkState.SinglePerkState.Companion(null);
