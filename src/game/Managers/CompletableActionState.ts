// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Vampire } from "../Lifepaths/Vampire";
import { ArrayList, Boolean, CollectionsKt, Intrinsics, R, TypeCastException, UnsupportedOperationException } from "../runtime";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { ActionProgressViewModel } from "../Models/ActionProgressViewModel";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { CompletableAction } from "../Enums/CompletableAction";
import { CompletableActionType } from "../Enums/CompletableActionType";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "./GameStateManager";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";
import { Schooling, AgeLimits } from "./Schooling";
import { Youth } from "../Youth/Youth";

export class CompletableActionState {
    static INSTANCE: any;
    states: CompletableActionState.CompletableActionStateSingle[] = null;
    constructor() {
        let values: CompletableAction[] = CompletableAction.values();
        let arrayList: ArrayList = new ArrayList();
        for (const completableAction of values) {
            arrayList.add(new CompletableActionState.CompletableActionStateSingle(completableAction, 0, false));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array == null) {
            throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
        }
        this.states = (array as unknown as CompletableActionState.CompletableActionStateSingle[]);
    }
    isCompleted(type: CompletableAction): boolean {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return this.getState(type).getCompleted();
    }
    getStates$0(actionType: CompletableActionType): CompletableActionState.CompletableActionStateSingle[] {
        Intrinsics.checkParameterIsNotNull(actionType, "actionType");
        let completableActionStateSingleArr: CompletableActionState.CompletableActionStateSingle[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        // Records added later (old saves) sit at the end of the list; show everything in the game's order.
        for (const a of CompletableAction.values()) {
            if (a.getType() === actionType) arrayList.add(this.getState(a));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as CompletableActionState.CompletableActionStateSingle[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    getStates$1(): CompletableActionState.CompletableActionStateSingle[] {
        return this.states;
    }
    getStates(...a: any[]): any {
        if (a.length === 1 && (a[0] == null || a[0] instanceof CompletableActionType)) return (this as any).getStates$0(...a);
        if (a.length === 0) return (this as any).getStates$1(...a);
        throw new Error('no overload for getStates with ' + a.length + ' args');
    }
    getHasACollegeDegree(): boolean {
        let collegeDegrees: CompletableAction[] = CompletableAction.INSTANCE.getCollegeDegrees();
        let arrayList: ArrayList = new ArrayList();
        for (const completableAction of collegeDegrees) {
            arrayList.add(Boolean.valueOf(this.isCompleted(completableAction)));
        }
        let it = arrayList.iterator();
        if (!it.hasNext()) {
            throw new UnsupportedOperationException("Empty collection can't be reduced.");
        }
        let next = it.next();
        while (it.hasNext()) {
            // Fetch first: jadx inlined it.next() into the `||`, so it was skipped once true (infinite loop).
            const item = it.next();
            next = Boolean.valueOf(((next as unknown as boolean)).booleanValue() || ((item as unknown as boolean)).booleanValue());
        }
        return ((next as unknown as boolean)).booleanValue();
    }
    deduceCurrentDegreeBeingWorkedOn(): CompletableActionState.CompletableActionStateSingle {
        let states: CompletableActionState.CompletableActionStateSingle[] = this.getStates(CompletableActionType.education);
        let arrayList: ArrayList = new ArrayList();
        for (const completableActionStateSingle of states) {
            if ((completableActionStateSingle.getCompleted() || (completableActionStateSingle.getProgress() === 0)) ? false : true) {
                arrayList.add(completableActionStateSingle);
            }
        }
        return (CollectionsKt.firstOrNull((arrayList as unknown as ArrayList)) as unknown as CompletableActionState.CompletableActionStateSingle);
    }
    tickCompletionProgress(type: CompletableAction): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        let state: CompletableActionState.CompletableActionStateSingle = this.getState(type);
        if (state.getCompleted()) {
            return;
        }
        let timeRequiredInWeeks: number = type.getTimeRequiredInWeeks(GameStateManager.INSTANCE.getPersonState());
        if (Schooling.isSchool(type)) { try { Youth.onSchoolWeek(GameStateManager.INSTANCE.getPersonState(), type); } catch { /* ignore */ } }   // v0.32.0 grades
        state.setProgress(Math.min(state.getProgress() + 1 + Vampire.studyBonus(GameStateManager.INSTANCE.getPersonState()), timeRequiredInWeeks));
        if (state.getProgress() >= timeRequiredInWeeks) {
            state.setCompleted(true);
            type.actionCompletedHandler(GameStateManager.INSTANCE.getPersonState());
        }
    }
    completeAction(type: CompletableAction): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        this.getState(type).setProgress(type.getTimeRequiredInWeeks(GameStateManager.INSTANCE.getPersonState()));
        this.getState(type).setCompleted(true);
    }
    clearAction(type: CompletableAction): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        this.getState(type).setProgress(0);
        this.getState(type).setCompleted(false);
    }
    setProgress(type: CompletableAction, progress: number): void {
        Intrinsics.checkParameterIsNotNull(type, "type");
        let state: CompletableActionState.CompletableActionStateSingle = this.getState(type);
        if (progress === 0) {
            state.setCompleted(false);
        }
        let timeRequiredInWeeks: number = type.getTimeRequiredInWeeks(GameStateManager.INSTANCE.getPersonState());
        state.setProgress(Math.min(timeRequiredInWeeks, progress));
        if (state.getCompleted() && (state.getProgress() < timeRequiredInWeeks)) {
            state.setProgress(timeRequiredInWeeks);
        }
        if ((state.getProgress() < timeRequiredInWeeks) || state.getCompleted()) {
            return;
        }
        state.setCompleted(true);
    }
    getState(type: CompletableAction): CompletableActionState.CompletableActionStateSingle {
        let completableActionStateSingleArr: CompletableActionState.CompletableActionStateSingle[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const completableActionStateSingle of completableActionStateSingleArr) {
            if (completableActionStateSingle.getType() === type) {
                arrayList.add(completableActionStateSingle);
            }
        }
        if (arrayList.isEmpty()) return this.createMissing(type);
        return (CollectionsKt.first((arrayList as unknown as ArrayList)) as unknown as CompletableActionState.CompletableActionStateSingle);
    }
    /** Saves made before Preschool / Elementary School existed: add the record. Someone who has started middle
     *  school, or is 11 or older, has already been through them. */
    createMissing(type: CompletableAction): CompletableActionState.CompletableActionStateSingle {
        const created = new CompletableActionState.CompletableActionStateSingle(type, 0, false);
        this.states = [...this.states, created];
        if (type === CompletableAction.preschool || type === CompletableAction.elementarySchool) {
            const ms = this.getState(CompletableAction.middleSchool);
            let owner: any = null;
            try { const p = GameStateManager.INSTANCE.getPersonState(); if (p.getCompletableActionState() === this) owner = p; } catch { /* no game yet */ }
            if (ms.getCompleted() || ms.getProgress() > 0 || (owner != null && owner.getAgeInYears() >= 11)) {
                created.setCompleted(true);
                created.setProgress(Schooling.info(type)!.years * Schooling.weeksPerSchoolYear);
            }
        }
        return created;
    }
}
export namespace CompletableActionState {
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
    export class CompletableActionStateSingle {
        static INSTANCE: any;
        completed: boolean = false;
        progress: number = 0;
        type: CompletableAction = null;
        constructor(type: CompletableAction, i: number, z: boolean) {
            Intrinsics.checkParameterIsNotNull(type, "type");
        this.type = type;
        this.progress = i;
        this.completed = z;
        }
        static copy$default(completableActionStateSingle: CompletableActionState.CompletableActionStateSingle, completableAction: CompletableAction, i: number, z: boolean, i2: number, obj: any): CompletableActionState.CompletableActionStateSingle {
        if ((i2 & 1) !== 0) {
            completableAction = completableActionStateSingle.type;
        }
        if ((i2 & 2) !== 0) {
            i = completableActionStateSingle.progress;
        }
        if ((i2 & 4) !== 0) {
            z = completableActionStateSingle.completed;
        }
        return completableActionStateSingle.copy(completableAction, i, z);
    }
        getType(): CompletableAction {
        return this.type;
    }
        getProgress(): number {
        return this.progress;
    }
        getCompleted(): boolean {
        return this.completed;
    }
        copy(type: CompletableAction, progress: number, completed: boolean): CompletableActionState.CompletableActionStateSingle {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new CompletableActionState.CompletableActionStateSingle(type, progress, completed);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof CompletableActionState.CompletableActionStateSingle) {
                let completableActionStateSingle: CompletableActionState.CompletableActionStateSingle = (other as unknown as CompletableActionState.CompletableActionStateSingle);
                if (Intrinsics.areEqual(this.type, completableActionStateSingle.type)) {
                    if (this.progress === completableActionStateSingle.progress) {
                        if (this.completed === completableActionStateSingle.completed) {
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((("CompletableActionStateSingle(type=" + this.type) + ", progress=") + this.progress) + ", completed=") + this.completed) + ")";
    }
        setProgress(i: number): void {
        this.progress = i;
    }
        setCompleted(z: boolean): void {
        this.completed = z;
    }
        updateProgress(progress: number): void {
        this.progress = Math.max(0, progress);
    }
        /** Ported from Vineflower output (jadx could not decompile it). */
        getViewModel(): BaseViewModel {
            const player = GameStateManager.INSTANCE.getPersonState();
            const imageId = this.type.getImageId();
            const title = this.type.getTitle();
            let description: string | null = this.type.getDescription();
            let locked = false;
            if (this.type === CompletableAction.masters) {
                const degrees = CompletableAction.INSTANCE.getCollegeDegrees().filter((d) => player.getCompletableActionState().getState(d).getCompleted());
                if (degrees.length === 0) locked = true;
            }
            const prereq = this.type.getPrerequiste();
            if (prereq != null) locked = !player.getCompletableActionState().getState(prereq).getCompleted();
            if (locked) {
                const what = this.type.getPrerequiste() != null ? this.type.getPrerequiste().getTitle() : Utils.INSTANCE.getString(R.string.Common_None);
                description = Utils.Strings.INSTANCE.getRequiresString(what);
            }
            // Age: schools have starting ages; skills and languages from 6; college needs high school anyway.
            const ageBlock = this.completed ? null : CompletableActionState.ageBlockFor(this.type, player);
            if (!locked && ageBlock != null) { locked = true; description = ageBlock; }
            let progress = this.progress;
            const required = this.type.getTimeRequiredInWeeks(player);
            if (this.completed && progress !== required) progress = required;
            const bar = new ProgressBarViewModel(progress, required, false, false, 12, null);
            const label = this.completed ? Utils.INSTANCE.getString(R.string.Common_Complete) : ExtensionsKt.numberDisplayString$default(this.type.getCostPerWeek(), false, 1, null);
            const enabled = !this.completed && player.getMoneyState().getCash().compareTo(this.type.getCostPerWeek()) >= 0;
            const button = new ButtonViewModel(label, null, enabled, false, locked, false, false, {
                invoke: () => GameStateManager.INSTANCE.getPersonState().learnSkillOrEducation(this.getType()),
            }, 96, null);
            const text = description != null ? new TextLabelViewModel(description, null, false, false, null, null, 62, null) : TextLabelViewModel.INSTANCE.getHidden();
            // Weeks of study still to go (shown next to the title)
            const left = Math.max(0, required - progress);
            const decorator = (this.completed || locked || left <= 0) ? null : `${left} week${left === 1 ? "" : "s"} left`;
            return new ActionProgressViewModel(imageId, title, text, decorator, bar, null, button, 32, null);
        }
    }
    export namespace CompletableActionStateSingle {
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
CompletableActionState.INSTANCE = new CompletableActionState.Companion(null);
export namespace CompletableActionState {
    /** Age reason this can't be studied now, or null. */
    export function ageBlockFor(type: CompletableAction, player: any): string | null {
        if (Schooling.isSchool(type)) return Schooling.ageBlock(type, player);
        if (type.getType() === CompletableActionType.skill) return AgeLimits.tooYoung(AgeLimits.skills, player);
        if (type.getType() === CompletableActionType.philanthrophy) return AgeLimits.tooYoung(AgeLimits.adultStuff, player);
        return null;
    }
}
CompletableActionState.CompletableActionStateSingle.INSTANCE = new CompletableActionState.CompletableActionStateSingle.Companion(null);
