// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, CollectionsKt, Double, Intrinsics, JMath, Pair, TypeCastException, Unit } from "../runtime";
import { Collections } from "../runtime";
import { AlertManager } from "./AlertManager";
import { GameStateManager } from "./GameStateManager";
import { RandomEvent } from "../Enums/RandomEvent";
import { SideHustle } from "../Enums/SideHustle";
import { Utils } from "../Utils/Utils";

export class SideHustleState {
    static INSTANCE: any;
    states: SideHustleState.SingleSideHustleState[] = null;
    constructor() {
        let values: SideHustle[] = SideHustle.values();
        let arrayList: ArrayList = new ArrayList();
        for (const sideHustle of values) {
            arrayList.add(new SideHustleState.SingleSideHustleState(sideHustle, false, null, 6, null));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array == null) {
            throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
        }
        this.states = (array as unknown as SideHustleState.SingleSideHustleState[]);
    }
    getStates(): SideHustleState.SingleSideHustleState[] {
        return this.states;
    }
    setStates(singleSideHustleStateArr: SideHustleState.SingleSideHustleState[]): void {
        Intrinsics.checkParameterIsNotNull(singleSideHustleStateArr, "<set-?>");
        this.states = singleSideHustleStateArr;
    }
    getState(hustle: SideHustle): SideHustleState.SingleSideHustleState {
        Intrinsics.checkParameterIsNotNull(hustle, "hustle");
        let singleSideHustleStateArr: SideHustleState.SingleSideHustleState[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const singleSideHustleState of singleSideHustleStateArr) {
            if (singleSideHustleState.getType() === hustle) {
                arrayList.add(singleSideHustleState);
            }
        }
        return (CollectionsKt.first((arrayList as unknown as ArrayList)) as unknown as SideHustleState.SingleSideHustleState);
    }
    work(progress: number): void {
        let activeProject: SideHustleState.SideHustleProject;
        let currentSideHustleState: SideHustleState.SingleSideHustleState = this.currentSideHustleState();
        if ((currentSideHustleState != null) && ((activeProject = currentSideHustleState.getActiveProject()) != null)) {
            activeProject.setProgressCurrent(activeProject.getProgressCurrent() + progress);
            if (activeProject.getCompleted()) {
                this.deactivateProject();
                AlertManager.INSTANCE.showProjectComplete(activeProject);
            } else {
                AlertManager.showRandomEvent$default(AlertManager.INSTANCE, RandomEvent.INSTANCE.randomEventForSideHustle(activeProject.getType()), false, 2, null);
            }
        }
        GameStateManager.INSTANCE.getPersonState().applyWeekly();
    }
    advanceWeek(): void {
        for (const singleSideHustleState of this.states) {
            singleSideHustleState.progressWeek();
        }
    }
    deactivateProject(): void {
        let singleSideHustleStateArr: SideHustleState.SingleSideHustleState[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const singleSideHustleState of singleSideHustleStateArr) {
            singleSideHustleState.setCurrent(false);
            arrayList.add(Unit.INSTANCE);
        }
    }
    switchSideProject(type: SideHustle): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        GameStateManager.INSTANCE.getPersonState().getJobState().setCurrentJob(null);
        for (const singleSideHustleState of this.states) {
            if (type === singleSideHustleState.getType()) {
                singleSideHustleState.setCurrent(true);
            } else {
                singleSideHustleState.setCurrent(false);
            }
        }
    }
    currentSideHustleState(): SideHustleState.SingleSideHustleState {
        let singleSideHustleStateArr: SideHustleState.SingleSideHustleState[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const singleSideHustleState of singleSideHustleStateArr) {
            if (singleSideHustleState.isCurrent()) {
                arrayList.add(singleSideHustleState);
            }
        }
        return (CollectionsKt.firstOrNull((arrayList as unknown as ArrayList)) as unknown as SideHustleState.SingleSideHustleState);
    }
    populateProject(hustle: SideHustle, number: number, quality: SideHustle.ProjectQuality): void {
        Intrinsics.checkParameterIsNotNull(hustle, "hustle");
        Intrinsics.checkParameterIsNotNull(quality, "quality");
        let state: SideHustleState.SingleSideHustleState = this.getState(hustle);
        for (let i = 0; i < number; i++) {
            let project: SideHustleState.SideHustleProject = state.getProject(SideHustle.ProjectEffort.light);
            project.setProgressCurrent(project.getProgressMax());
            project.setQuality(quality);
            state.getProjects().add(project);
        }
    }
}
export namespace SideHustleState {
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
    export class SingleSideHustleState {
        static INSTANCE: any;
        _isCurrent: boolean = false;
        projects: ArrayList<SideHustleState.SideHustleProject> = null;
        type: SideHustle = null;
        $init0(type: SideHustle, z: boolean, projects: ArrayList<SideHustleState.SideHustleProject>): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(projects, "projects");
        this.type = type;
        this._isCurrent = z;
        this.projects = projects;
    }
        $init1(sideHustle: SideHustle, z: boolean, arrayList: ArrayList, i: number, defaultConstructorMarker: any): void {
        this.$init(sideHustle, ((i & 2) !== 0) ? false : z, ((i & 4) !== 0) ? new ArrayList() : arrayList);
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 5 && (a[0] == null || a[0] instanceof SideHustle) && typeof a[1] === 'boolean' && (a[2] == null || Array.isArray(a[2])) && (typeof a[3] === 'number' || typeof a[3] === 'string')) return (this as any).$init1(...a);
            if (a.length === 3 && (a[0] == null || a[0] instanceof SideHustle) && typeof a[1] === 'boolean' && (a[2] == null || Array.isArray(a[2]))) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        static copy$default(singleSideHustleState: SideHustleState.SingleSideHustleState, sideHustle: SideHustle, z: boolean, arrayList: ArrayList, i: number, obj: any): SideHustleState.SingleSideHustleState {
        if ((i & 1) !== 0) {
            sideHustle = singleSideHustleState.type;
        }
        if ((i & 2) !== 0) {
            z = singleSideHustleState._isCurrent;
        }
        if ((i & 4) !== 0) {
            arrayList = singleSideHustleState.projects;
        }
        return singleSideHustleState.copy(sideHustle, z, arrayList);
    }
        getType(): SideHustle {
        return this.type;
    }
        getIsCurrent(): boolean {
        return this._isCurrent;
    }
        component3(): ArrayList<SideHustleState.SideHustleProject> {
        return this.projects;
    }
        copy(type: SideHustle, isCurrent: boolean, projects: ArrayList<SideHustleState.SideHustleProject>): SideHustleState.SingleSideHustleState {
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(projects, "projects");
        return new SideHustleState.SingleSideHustleState(type, isCurrent, projects);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof SideHustleState.SingleSideHustleState) {
                let singleSideHustleState: SideHustleState.SingleSideHustleState = (other as unknown as SideHustleState.SingleSideHustleState);
                if (Intrinsics.areEqual(this.type, singleSideHustleState.type)) {
                    if (!(this._isCurrent === singleSideHustleState._isCurrent) || !Intrinsics.areEqual(this.projects, singleSideHustleState.projects)) {
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((("SingleSideHustleState(type=" + this.type) + ", isCurrent=") + this._isCurrent) + ", projects=") + this.projects) + ")";
    }
        isCurrent(): boolean {
        return this._isCurrent;
    }
        setCurrent(z: boolean): void {
        this._isCurrent = z;
    }
        getProjects(): ArrayList<SideHustleState.SideHustleProject> {
        return this.projects;
    }
        getSkillLevel(): SideHustle.SkillLevel {
        return SideHustle.SkillLevel.INSTANCE.level(this.type, this.getCompletedProjects().length);
    }
        getActiveProject(): SideHustleState.SideHustleProject {
        let arrayList: ArrayList<SideHustleState.SideHustleProject> = this.projects;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (!((obj as unknown as SideHustleState.SideHustleProject)).getCompleted()) {
                arrayList2.add(obj);
            }
        }
        return (CollectionsKt.firstOrNull((arrayList2 as unknown as ArrayList)) as unknown as SideHustleState.SideHustleProject);
    }
        getTotalRevenue(): number {
        let i: number = 0;
        for (const sideHustleProject of this.getCompletedProjects()) {
            i += sideHustleProject.getTotalRevenue();
        }
        return i;
    }
        getWeeklyRevenue(): number {
        let i: number = 0;
        for (const sideHustleProject of this.getCompletedProjects()) {
            i += sideHustleProject.getQuality().weeklyIncome(this.type);
        }
        return i;
    }
        getCompletedProjects(): SideHustleState.SideHustleProject[] {
        let arrayList: ArrayList<SideHustleState.SideHustleProject> = this.projects;
        let arrayList2: ArrayList = new ArrayList();
        for (const obj of arrayList) {
            if (((obj as unknown as SideHustleState.SideHustleProject)).getCompleted()) {
                arrayList2.add(obj);
            }
        }
        let array = arrayList2.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as SideHustleState.SideHustleProject[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
        /** Ported from Vineflower output (jadx could not decompile it). */
        getProject(effort: SideHustle.ProjectEffort): SideHustleState.SideHustleProject {
            const outcomes = effort.getPossibleQualityOutcomes();
            const boost = effort.getQualityProbabilityBoost() * this.getSkillLevel().getSkillQualityProbabilityBoost();
            const pool: Pair<any, number>[] = outcomes.map((q) => new Pair<any, number>(q, q.getRelativeProbability()));
            if (pool.length > 2) {
                pool[1] = new Pair(pool[1].getFirst(), pool[1].getSecond() * boost);
                pool[2] = new Pair(pool[2].getFirst(), pool[2].getSecond() * boost);
            }
            const quality = CollectionsKt.first(Utils.Random.INSTANCE.chooseFromPoolWithProbability(pool, 1)) as SideHustle.ProjectQuality;
            const names = quality.projectName(this.type);
            Collections.shuffle(names);
            const existing = this.projects.map((p) => p.getName());
            let name = "";
            let n = 1;
            while (name.length === 0) {
                let candidate = "";
                for (const possible of names) {
                    const c = n >= 2 ? possible + " " + n : possible;
                    if (!existing.includes(c)) { candidate = c; break; }
                }
                if (names.length === 0) candidate = "Project " + n;
                n++;
                name = candidate;
            }
            return new SideHustleState.SideHustleProject(this.type, quality, name, effort.progressRequirement(this.type), 0, 16, null);
        }
        startProject(effort: SideHustle.ProjectEffort): void {
        Intrinsics.checkParameterIsNotNull(effort, "effort");
        this.projects.add(this.getProject(effort));
    }
        progressWeek(): void {
        for (const sideHustleProject of this.getCompletedProjects()) {
            sideHustleProject.setTotalRevenue(sideHustleProject.getTotalRevenue() + sideHustleProject.getQuality().weeklyIncome(this.type));
        }
    }
    }
    export namespace SingleSideHustleState {
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
    export class SideHustleProject {
        static INSTANCE: any;
        name: string = null;
        progressCurrent: number = 0;
        progressMax: number = 0;
        quality: SideHustle.ProjectQuality = null;
        totalRevenue: number = 0;
        type: SideHustle = null;
        $init0(type: SideHustle, quality: SideHustle.ProjectQuality, name: string, d: number, i: number): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(quality, "quality");
        Intrinsics.checkParameterIsNotNull(name, "name");
        this.type = type;
        this.quality = quality;
        this.name = name;
        this.progressMax = d;
        this.totalRevenue = i;
    }
        $init1(sideHustle: SideHustle, projectQuality: SideHustle.ProjectQuality, str: string, d: number, i: number, i2: number, defaultConstructorMarker: any): void {
        this.$init(sideHustle, projectQuality, str, d, ((i2 & 16) !== 0) ? 0 : i);
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 7 && (a[0] == null || a[0] instanceof SideHustle) && (a[1] == null || a[1] instanceof SideHustle.ProjectQuality) && (a[2] == null || typeof a[2] === 'string') && typeof a[3] === 'number' && (typeof a[4] === 'number' || typeof a[4] === 'string') && (typeof a[5] === 'number' || typeof a[5] === 'string')) return (this as any).$init1(...a);
            if (a.length === 5 && (a[0] == null || a[0] instanceof SideHustle) && (a[1] == null || a[1] instanceof SideHustle.ProjectQuality) && (a[2] == null || typeof a[2] === 'string') && typeof a[3] === 'number' && (typeof a[4] === 'number' || typeof a[4] === 'string')) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
        static copy$default(sideHustleProject: SideHustleState.SideHustleProject, sideHustle: SideHustle, projectQuality: SideHustle.ProjectQuality, str: string, d: number, i: number, i2: number, obj: any): SideHustleState.SideHustleProject {
        if ((i2 & 1) !== 0) {
            sideHustle = sideHustleProject.type;
        }
        if ((i2 & 2) !== 0) {
            projectQuality = sideHustleProject.quality;
        }
        let projectQuality2: SideHustle.ProjectQuality = projectQuality;
        if ((i2 & 4) !== 0) {
            str = sideHustleProject.name;
        }
        let str2: string = str;
        if ((i2 & 8) !== 0) {
            d = sideHustleProject.progressMax;
        }
        let d2: number = d;
        if ((i2 & 16) !== 0) {
            i = sideHustleProject.totalRevenue;
        }
        return sideHustleProject.copy(sideHustle, projectQuality2, str2, d2, i);
    }
        getType(): SideHustle {
        return this.type;
    }
        getQuality(): SideHustle.ProjectQuality {
        return this.quality;
    }
        getName(): string {
        return this.name;
    }
        getProgressMax(): number {
        return this.progressMax;
    }
        getTotalRevenue(): number {
        return this.totalRevenue;
    }
        copy(type: SideHustle, quality: SideHustle.ProjectQuality, name: string, progressMax: number, totalRevenue: number): SideHustleState.SideHustleProject {
        Intrinsics.checkParameterIsNotNull(type, "type");
        Intrinsics.checkParameterIsNotNull(quality, "quality");
        Intrinsics.checkParameterIsNotNull(name, "name");
        return new SideHustleState.SideHustleProject(type, quality, name, progressMax, totalRevenue);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof SideHustleState.SideHustleProject) {
                let sideHustleProject: SideHustleState.SideHustleProject = (other as unknown as SideHustleState.SideHustleProject);
                if (((Intrinsics.areEqual(this.type, sideHustleProject.type) && Intrinsics.areEqual(this.quality, sideHustleProject.quality)) && Intrinsics.areEqual(this.name, sideHustleProject.name)) && (Double.compare(this.progressMax, sideHustleProject.progressMax) === 0)) {
                    if (this.totalRevenue === sideHustleProject.totalRevenue) {
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((((((("SideHustleProject(type=" + this.type) + ", quality=") + this.quality) + ", name=") + this.name) + ", progressMax=") + this.progressMax) + ", totalRevenue=") + this.totalRevenue) + ")";
    }
        setQuality(projectQuality: SideHustle.ProjectQuality): void {
        Intrinsics.checkParameterIsNotNull(projectQuality, "<set-?>");
        this.quality = projectQuality;
    }
        setTotalRevenue(i: number): void {
        this.totalRevenue = i;
    }
        getProgressCurrent(): number {
        return this.progressCurrent;
    }
        setProgressCurrent(d: number): void {
        this.progressCurrent = Math.min(Math.max(d, 0.0), this.progressMax);
    }
        getCompleted(): boolean {
        return this.progressCurrent >= this.progressMax;
    }
        getTotalUnits(): number {
        let d: number = this.totalRevenue;
        let unitPerDollarRevenue: number = this.type.getUnitPerDollarRevenue();
        Double.isNaN(d);
        let d2: number = d * unitPerDollarRevenue;
        if (this.type.getUnitPerDollarRevenue() > 1) {
            let randomValueWithinRange: number = Utils.Random.INSTANCE.randomValueWithinRange(0, JMath.toInt(this.type.getUnitPerDollarRevenue()));
            Double.isNaN(randomValueWithinRange);
            d2 += randomValueWithinRange;
        }
        return JMath.toInt(d2);
    }
    }
    export namespace SideHustleProject {
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
SideHustleState.INSTANCE = new SideHustleState.Companion(null);
SideHustleState.SingleSideHustleState.INSTANCE = new SideHustleState.SingleSideHustleState.Companion(null);
SideHustleState.SideHustleProject.INSTANCE = new SideHustleState.SideHustleProject.Companion(null);
