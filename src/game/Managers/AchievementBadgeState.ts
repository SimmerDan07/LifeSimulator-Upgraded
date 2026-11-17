// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics, TypeCastException } from "../runtime";
import { AchievementBadge } from "../Enums/AchievementBadge";

export class AchievementBadgeState {
    static INSTANCE: any;
    states: ArrayList<AchievementBadgeState.SingleAchievementBadgeState> = null;
    constructor() {
        this.states = new ArrayList();
        let z: boolean = false;
        for (const achievementBadge of AchievementBadge.values()) {
            this.states.add(new AchievementBadgeState.SingleAchievementBadgeState(achievementBadge, z, 2, null));
        }
    }
    getStates(): ArrayList<AchievementBadgeState.SingleAchievementBadgeState> {
        return this.states;
    }
    completeBadge(badge: AchievementBadge): void {
        Intrinsics.checkParameterIsNotNull(badge, "badge");
        let arrayList: ArrayList<AchievementBadgeState.SingleAchievementBadgeState> = this.states;
        let arrayList2: ArrayList = new ArrayList();
        let it = arrayList.iterator();
        while (true) {
            if (it.hasNext()) {
                let next = it.next();
                if (((next as unknown as AchievementBadgeState.SingleAchievementBadgeState)).getType() === badge) {
                    arrayList2.add(next);
                }
            } else {
                ((CollectionsKt.first((arrayList2 as unknown as ArrayList)) as unknown as AchievementBadgeState.SingleAchievementBadgeState)).setCompleted(true);
                return;
            }
        }
    }
    incompletedBadges(): AchievementBadgeState.SingleAchievementBadgeState[] {
        let arrayList: ArrayList<AchievementBadgeState.SingleAchievementBadgeState> = this.states;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (!((obj as unknown as AchievementBadgeState.SingleAchievementBadgeState)).getCompleted()) {
                arrayList2.add(obj);
            }
        }
        let array = arrayList2.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as AchievementBadgeState.SingleAchievementBadgeState[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    completedBadges(): AchievementBadge[] {
        let arrayList: ArrayList<AchievementBadgeState.SingleAchievementBadgeState> = this.states;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (((obj as unknown as AchievementBadgeState.SingleAchievementBadgeState)).getCompleted()) {
                arrayList2.add(obj);
            }
        }
        let arrayList3: ArrayList = arrayList2;
        let arrayList4: ArrayList = new ArrayList();
        let it = arrayList3.iterator();
        while (it.hasNext()) {
            arrayList4.add(((it.next() as unknown as AchievementBadgeState.SingleAchievementBadgeState)).getType());
        }
        let array = arrayList4.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as AchievementBadge[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    isCompleted(badge: AchievementBadge): boolean {
        Intrinsics.checkParameterIsNotNull(badge, "badge");
        let arrayList: ArrayList<AchievementBadgeState.SingleAchievementBadgeState> = this.states;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (((obj as unknown as AchievementBadgeState.SingleAchievementBadgeState)).getType() === badge) {
                arrayList2.add(obj);
            }
        }
        return ((CollectionsKt.first((arrayList2 as unknown as ArrayList)) as unknown as AchievementBadgeState.SingleAchievementBadgeState)).getCompleted();
    }
}
export namespace AchievementBadgeState {
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
    export class SingleAchievementBadgeState {
        static INSTANCE: any;
        completed: boolean = false;
        type: AchievementBadge = null;
        $init0(type: AchievementBadge, z: boolean): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        this.type = type;
        this.completed = z;
    }
        $init1(achievementBadge: AchievementBadge, z: boolean, i: number, defaultConstructorMarker: any): void {
        this.$init(achievementBadge, ((i & 2) !== 0) ? false : z);
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 4 && (a[0] == null || a[0] instanceof AchievementBadge) && typeof a[1] === 'boolean' && (typeof a[2] === 'number' || typeof a[2] === 'string')) return (this as any).$init1(...a);
            if (a.length === 2 && (a[0] == null || a[0] instanceof AchievementBadge) && typeof a[1] === 'boolean') return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        static copy$default(singleAchievementBadgeState: AchievementBadgeState.SingleAchievementBadgeState, achievementBadge: AchievementBadge, z: boolean, i: number, obj: any): AchievementBadgeState.SingleAchievementBadgeState {
        if ((i & 1) !== 0) {
            achievementBadge = singleAchievementBadgeState.type;
        }
        if ((i & 2) !== 0) {
            z = singleAchievementBadgeState.completed;
        }
        return singleAchievementBadgeState.copy(achievementBadge, z);
    }
        getType(): AchievementBadge {
        return this.type;
    }
        getCompleted(): boolean {
        return this.completed;
    }
        copy(type: AchievementBadge, completed: boolean): AchievementBadgeState.SingleAchievementBadgeState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new AchievementBadgeState.SingleAchievementBadgeState(type, completed);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof AchievementBadgeState.SingleAchievementBadgeState) {
                let singleAchievementBadgeState: AchievementBadgeState.SingleAchievementBadgeState = (other as unknown as AchievementBadgeState.SingleAchievementBadgeState);
                if (Intrinsics.areEqual(this.type, singleAchievementBadgeState.type)) {
                    if (this.completed === singleAchievementBadgeState.completed) {
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((("SingleAchievementBadgeState(type=" + this.type) + ", completed=") + this.completed) + ")";
    }
        setCompleted(z: boolean): void {
        this.completed = z;
    }
    }
    export namespace SingleAchievementBadgeState {
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
AchievementBadgeState.INSTANCE = new AchievementBadgeState.Companion(null);
AchievementBadgeState.SingleAchievementBadgeState.INSTANCE = new AchievementBadgeState.SingleAchievementBadgeState.Companion(null);
