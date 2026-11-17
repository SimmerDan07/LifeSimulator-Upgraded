// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */

export class MiscState {
    static INSTANCE: any;
    adRewardDoubleIncomeWeeksLeft: number = 0;
    currentAverageHappiness: number = 0;
    currentParentRelationship: number = 0;
    hasReceivedRelationshipWarning: boolean = false;
    hasShownDegreeMissingAlert: boolean = false;
    isSexExplicitlySet: boolean = false;
    lifeTracker: MiscState.LifeTracker = null;
    numberOfLifeElixirsBought: number = 0;
    totalWeekInLife: number = 0;
    tripsTaken: number = 0;
    constructor() {
        this.currentAverageHappiness = 0.8;
        this.currentParentRelationship = 0.6;
        this.lifeTracker = new MiscState.LifeTracker(0, 0, 0, 0, 0, 0, 0, 0, 255, null);
    }
    getTotalWeekInLife(): number {
        return this.totalWeekInLife;
    }
    setTotalWeekInLife(i: number): void {
        this.totalWeekInLife = i;
    }
    getNumberOfLifeElixirsBought(): number {
        return this.numberOfLifeElixirsBought;
    }
    setNumberOfLifeElixirsBought(i: number): void {
        this.numberOfLifeElixirsBought = i;
    }
    getTripsTaken(): number {
        return this.tripsTaken;
    }
    setTripsTaken(i: number): void {
        this.tripsTaken = i;
    }
    getCurrentAverageHappiness(): number {
        return this.currentAverageHappiness;
    }
    setCurrentAverageHappiness(d: number): void {
        this.currentAverageHappiness = d;
    }
    getCurrentParentRelationship(): number {
        return this.currentParentRelationship;
    }
    setCurrentParentRelationship(d: number): void {
        this.currentParentRelationship = d;
    }
    getLifeTracker(): MiscState.LifeTracker {
        return this.lifeTracker;
    }
    getHasReceivedRelationshipWarning(): boolean {
        return this.hasReceivedRelationshipWarning;
    }
    setHasReceivedRelationshipWarning(z: boolean): void {
        this.hasReceivedRelationshipWarning = z;
    }
    getAdRewardDoubleIncomeWeeksLeft(): number {
        return this.adRewardDoubleIncomeWeeksLeft;
    }
    setAdRewardDoubleIncomeWeeksLeft(i: number): void {
        this.adRewardDoubleIncomeWeeksLeft = Math.max(i, 0);
    }
    isAdDoubleIncomeRewardActive(): boolean {
        return this.adRewardDoubleIncomeWeeksLeft > 0;
    }
    getIsSexExplicitlySet(): boolean {
        return this.isSexExplicitlySet;
    }
    setSexExplicitlySet(z: boolean): void {
        this.isSexExplicitlySet = z;
    }
    getHasShownDegreeMissingAlert(): boolean {
        return this.hasShownDegreeMissingAlert;
    }
    setHasShownDegreeMissingAlert(z: boolean): void {
        this.hasShownDegreeMissingAlert = z;
    }
}
export namespace MiscState {
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
    export class LifeTracker {
        static INSTANCE: any;
        childrenAction: number = 0;
        educationAction: number = 0;
        familyAction: number = 0;
        healthAction: number = 0;
        relationshipAction: number = 0;
        vacationAction: number = 0;
        weeksInPrison: number = 0;
        workAction: number = 0;
        $init0(): void {
        this.$init(0, 0, 0, 0, 0, 0, 0, 0, 255, null);
    }
        $init1(i: number, i2: number, i3: number, i4: number, i5: number, i6: number, i7: number, i8: number): void {
        this.familyAction = i;
        this.childrenAction = i2;
        this.healthAction = i3;
        this.vacationAction = i4;
        this.workAction = i5;
        this.educationAction = i6;
        this.relationshipAction = i7;
        this.weeksInPrison = i8;
    }
        $init2(i: number, i2: number, i3: number, i4: number, i5: number, i6: number, i7: number, i8: number, i9: number, defaultConstructorMarker: any): void {
        this.$init(((i9 & 1) !== 0) ? 0 : i, ((i9 & 2) !== 0) ? 0 : i2, ((i9 & 4) !== 0) ? 0 : i3, ((i9 & 8) !== 0) ? 0 : i4, ((i9 & 16) !== 0) ? 0 : i5, ((i9 & 32) !== 0) ? 0 : i6, ((i9 & 64) !== 0) ? 0 : i7, ((i9 & 128) === 0) ? i8 : 0);
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 10 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (typeof a[1] === 'number' || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && (typeof a[3] === 'number' || typeof a[3] === 'string') && (typeof a[4] === 'number' || typeof a[4] === 'string') && (typeof a[5] === 'number' || typeof a[5] === 'string') && (typeof a[6] === 'number' || typeof a[6] === 'string') && (typeof a[7] === 'number' || typeof a[7] === 'string') && (typeof a[8] === 'number' || typeof a[8] === 'string')) return (this as any).$init2(...a);
            if (a.length === 8 && (typeof a[0] === 'number' || typeof a[0] === 'string') && (typeof a[1] === 'number' || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && (typeof a[3] === 'number' || typeof a[3] === 'string') && (typeof a[4] === 'number' || typeof a[4] === 'string') && (typeof a[5] === 'number' || typeof a[5] === 'string') && (typeof a[6] === 'number' || typeof a[6] === 'string') && (typeof a[7] === 'number' || typeof a[7] === 'string')) return (this as any).$init1(...a);
            if (a.length === 0) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        getFamilyAction(): number {
        return this.familyAction;
    }
        getChildrenAction(): number {
        return this.childrenAction;
    }
        getHealthAction(): number {
        return this.healthAction;
    }
        getVacationAction(): number {
        return this.vacationAction;
    }
        getWorkAction(): number {
        return this.workAction;
    }
        getEducationAction(): number {
        return this.educationAction;
    }
        getRelationshipAction(): number {
        return this.relationshipAction;
    }
        getWeeksInPrison(): number {
        return this.weeksInPrison;
    }
        copy(familyAction: number, childrenAction: number, healthAction: number, vacationAction: number, workAction: number, educationAction: number, relationshipAction: number, weeksInPrison: number): MiscState.LifeTracker {
        return new MiscState.LifeTracker(familyAction, childrenAction, healthAction, vacationAction, workAction, educationAction, relationshipAction, weeksInPrison);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof MiscState.LifeTracker) {
                let lifeTracker: MiscState.LifeTracker = (other as unknown as MiscState.LifeTracker);
                if (this.familyAction === lifeTracker.familyAction) {
                    if (this.childrenAction === lifeTracker.childrenAction) {
                        if (this.healthAction === lifeTracker.healthAction) {
                            if (this.vacationAction === lifeTracker.vacationAction) {
                                if (this.workAction === lifeTracker.workAction) {
                                    if (this.educationAction === lifeTracker.educationAction) {
                                        if (this.relationshipAction === lifeTracker.relationshipAction) {
                                            if (this.weeksInPrison === lifeTracker.weeksInPrison) {
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((((((((((((("LifeTracker(familyAction=" + this.familyAction) + ", childrenAction=") + this.childrenAction) + ", healthAction=") + this.healthAction) + ", vacationAction=") + this.vacationAction) + ", workAction=") + this.workAction) + ", educationAction=") + this.educationAction) + ", relationshipAction=") + this.relationshipAction) + ", weeksInPrison=") + this.weeksInPrison) + ")";
    }
        setFamilyAction(i: number): void {
        this.familyAction = i;
    }
        setChildrenAction(i: number): void {
        this.childrenAction = i;
    }
        setHealthAction(i: number): void {
        this.healthAction = i;
    }
        setVacationAction(i: number): void {
        this.vacationAction = i;
    }
        setWorkAction(i: number): void {
        this.workAction = i;
    }
        setEducationAction(i: number): void {
        this.educationAction = i;
    }
        setRelationshipAction(i: number): void {
        this.relationshipAction = i;
    }
        setWeeksInPrison(i: number): void {
        this.weeksInPrison = i;
    }
        getTotalTimeSpend(): number {
        return ((((((this.familyAction + this.childrenAction) + this.healthAction) + this.vacationAction) + this.workAction) + this.educationAction) + this.relationshipAction) + this.weeksInPrison;
    }
    }
    export namespace LifeTracker {
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
MiscState.INSTANCE = new MiscState.Companion(null);
MiscState.LifeTracker.INSTANCE = new MiscState.LifeTracker.Companion(null);
