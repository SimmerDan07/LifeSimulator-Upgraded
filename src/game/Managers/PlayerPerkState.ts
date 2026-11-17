// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Intrinsics } from "../runtime";
import { Perk } from "../Enums/Perk";

export class PlayerPerkState {
    static INSTANCE: any;
    perks: ArrayList<Perk> = null;
    constructor() {
        this.perks = new ArrayList();
    }
    getPerks(): ArrayList<Perk> {
        return this.perks;
    }
    setPerks(arrayList: ArrayList<Perk>): void {
        Intrinsics.checkParameterIsNotNull(arrayList, "<set-?>");
        this.perks = arrayList;
    }
    hasPerk(perk: Perk): boolean {
        Intrinsics.checkParameterIsNotNull(perk, "perk");
        return this.perks.contains(perk);
    }
    addPerk(perk: Perk): void {
        Intrinsics.checkParameterIsNotNull(perk, "perk");
        if (this.perks.contains(perk)) {
            return;
        }
        this.perks.add(perk);
    }
}
export namespace PlayerPerkState {
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
PlayerPerkState.INSTANCE = new PlayerPerkState.Companion(null);
