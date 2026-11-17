// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Intrinsics } from "../runtime";
import { Achievement } from "../Enums/Achievement";

export class AchievementState {
    static INSTANCE: any;
    states: ArrayList<AchievementState.SingleAchievementState> = null;
    constructor() {
        this.states = new ArrayList();
        let z: boolean = false;
        for (const achievement of Achievement.values()) {
            this.states.add(new AchievementState.SingleAchievementState(achievement, z, 2, null));
        }
    }
    getStates(): ArrayList<AchievementState.SingleAchievementState> {
        return this.states;
    }
    isAchievementComplete(type: Achievement): boolean {
        Intrinsics.checkParameterIsNotNull(type, "type");
        let arrayList: ArrayList<AchievementState.SingleAchievementState> = this.states;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (((obj as unknown as AchievementState.SingleAchievementState)).getType() === type) {
                arrayList2.add(obj);
            }
        }
        return ((CollectionsKt.first((arrayList2 as unknown as ArrayList)) as unknown as AchievementState.SingleAchievementState)).getCompleted();
    }
}
export namespace AchievementState {
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
    export class SingleAchievementState {
        static INSTANCE: any;
        completed: boolean = false;
        type: Achievement = null;
        $init0(type: Achievement, z: boolean): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        this.type = type;
        this.completed = z;
    }
        $init1(achievement: Achievement, z: boolean, i: number, defaultConstructorMarker: any): void {
        this.$init(achievement, ((i & 2) !== 0) ? false : z);
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 4 && (a[0] == null || a[0] instanceof Achievement) && typeof a[1] === 'boolean' && (typeof a[2] === 'number' || typeof a[2] === 'string')) return (this as any).$init1(...a);
            if (a.length === 2 && (a[0] == null || a[0] instanceof Achievement) && typeof a[1] === 'boolean') return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        static copy$default(singleAchievementState: AchievementState.SingleAchievementState, achievement: Achievement, z: boolean, i: number, obj: any): AchievementState.SingleAchievementState {
        if ((i & 1) !== 0) {
            achievement = singleAchievementState.type;
        }
        if ((i & 2) !== 0) {
            z = singleAchievementState.completed;
        }
        return singleAchievementState.copy(achievement, z);
    }
        getType(): Achievement {
        return this.type;
    }
        getCompleted(): boolean {
        return this.completed;
    }
        copy(type: Achievement, completed: boolean): AchievementState.SingleAchievementState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new AchievementState.SingleAchievementState(type, completed);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof AchievementState.SingleAchievementState) {
                let singleAchievementState: AchievementState.SingleAchievementState = (other as unknown as AchievementState.SingleAchievementState);
                if (Intrinsics.areEqual(this.type, singleAchievementState.type)) {
                    if (this.completed === singleAchievementState.completed) {
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((("SingleAchievementState(type=" + this.type) + ", completed=") + this.completed) + ")";
    }
        setCompleted(z: boolean): void {
        this.completed = z;
    }
    }
    export namespace SingleAchievementState {
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
AchievementState.INSTANCE = new AchievementState.Companion(null);
AchievementState.SingleAchievementState.INSTANCE = new AchievementState.SingleAchievementState.Companion(null);
