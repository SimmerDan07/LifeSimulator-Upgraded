// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics } from "../runtime";
import { AchievementBadge } from "../Enums/AchievementBadge";
import { AchievementBadgeState } from "./AchievementBadgeState";
import { GameStateManager } from "./GameStateManager";
import { GoogleLeaderboardManager } from "./GoogleLeaderboardManager";
import { Player } from "./Player";
import { Lineage } from "./Lineage";

export class CemetaryState {
    static INSTANCE: any;
    pastLives: ArrayList<Player> = null;
    /** v0.18.0: a small record of every past life (see Lineage); only the newest lives keep a full snapshot. */
    records: any[] = [];
    constructor() {
        this.pastLives = new ArrayList();
    }
    getPastLives(): ArrayList<Player> {
        return this.pastLives;
    }
    setPastLives(arrayList: ArrayList<Player>): void {
        Intrinsics.checkParameterIsNotNull(arrayList, "<set-?>");
        this.pastLives = arrayList;
    }
    addLife(person: Player): void {
        Intrinsics.checkParameterIsNotNull(person, "person");
        let arrayList: ArrayList<Player> = this.pastLives;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (Intrinsics.areEqual(((obj as unknown as Player)).getId(), person.getId())) {
                arrayList2.add(obj);
            }
        }
        if (arrayList2.size() === 0) {
            this.pastLives.add(person);
            let it = AchievementBadge.INSTANCE.getBadges(person).iterator();
            while (it.hasNext()) {
                let badge: AchievementBadge = it.next();
                let achievementBadgeState: AchievementBadgeState = GameStateManager.INSTANCE.getGlobalStateManager().getAchievementBadgeState();
                achievementBadgeState.completeBadge(badge);
            }
            GoogleLeaderboardManager.INSTANCE.reportLeaderboard(person);
        }
        Lineage.afterAddLife(this, person);
    }
    removeLife(personId: string): void {
        Intrinsics.checkParameterIsNotNull(personId, "personId");
        let arrayList: ArrayList<Player> = this.pastLives;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (!Intrinsics.areEqual(((obj as unknown as Player)).getId(), personId)) {
                arrayList2.add(obj);
            }
        }
        this.pastLives = (CollectionsKt.toCollection(arrayList2, new ArrayList()) as unknown as ArrayList);
    }
}
export namespace CemetaryState {
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
CemetaryState.INSTANCE = new CemetaryState.Companion(null);
