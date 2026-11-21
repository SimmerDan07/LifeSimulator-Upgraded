// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { World } from "../World/World";
import { Illness } from "../Health/Illness";
import { Careers } from "../Careers/Careers";
import { ArrayList, ArraysKt, BigInteger, CollectionsKt, Intrinsics, JMath, MapsKt, R, SpannableStringBuilder, TuplesKt, TypeCastException } from "../runtime";
import { AgeLimits } from "./Schooling";
import { ActionProgressViewModel } from "../Models/ActionProgressViewModel";
import { AlertManager } from "./AlertManager";
import { AttributeState } from "./AttributeState";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { CompletableAction } from "../Enums/CompletableAction";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "./GameStateManager";
import { Job } from "../Enums/Job";
import { MainGameFragment } from "../ui/bridge";
import { MainGameTab } from "../Enums/MainGameTab";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Player } from "./Player";
import { Possession } from "../Enums/Possession";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { RandomEvent } from "../Enums/RandomEvent";
import { TelemetryManager } from "./TelemetryManager";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";
import { WorkAction } from "../Enums/WorkAction";
import { Retirement } from "./Retirement";
import { Vampire } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Subscriptions } from "./Subscriptions";

export class JobState {
    static INSTANCE: any;
    currentJob: Job = null;
    states: JobState.JobStateSingle[] = null;
    constructor() {
        let values: Job[] = Job.values();
        let arrayList: ArrayList = new ArrayList();
        for (const job of values) {
            arrayList.add(new JobState.JobStateSingle(job, 0, 1));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array == null) {
            throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
        }
        this.states = (array as unknown as JobState.JobStateSingle[]);
    }
    getCurrentJob(): Job {
        return this.currentJob;
    }
    /** v0.23.0: a whole new identity (Fake Your Death): every career back to its first level, no progress, years-in-career 0. */
    resetCareers(): void {
        for (const st of this.states) { st.level = 1; st.progress = 0; st.weeksInCareer = 0; }
    }
    setCurrentJob(job: Job): void {
        this.currentJob = job;
    }
    getCurrentJobState(): JobState.JobStateSingle {
        let job: Job = this.currentJob;
        if (job != null) {
            return this.getState(job);
        }
        return null;
    }
    getCurrentJobDisplayString(): string {
        let currentJobState: JobState.JobStateSingle = this.getCurrentJobState();
        if (currentJobState != null) {
            return currentJobState.getJobTitle();
        }
        return Utils.INSTANCE.getString(R.string.ProfileStatus_JobStateUnemployed);
    }
    isJobMaxedOut(): boolean {
        let currentJobState: JobState.JobStateSingle = this.getCurrentJobState();
        return (currentJobState != null) && (currentJobState.getType().getMaxLevels() === currentJobState.getLevel());
    }
    statesForPlayer(player: Player): JobState.JobStateSingle[] {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let jobsForPlayer: Job[] = Job.INSTANCE.jobsForPlayer(player);
        let arrayList: ArrayList = new ArrayList();
        for (const job of jobsForPlayer) {
            arrayList.add(this.getState(job));
        }
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array != null) {
            return (array as unknown as JobState.JobStateSingle[]);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
    getState(job: Job): JobState.JobStateSingle {
        Intrinsics.checkParameterIsNotNull(job, "job");
        let jobStateSingleArr: JobState.JobStateSingle[] = this.states;
        let arrayList: ArrayList = new ArrayList();
        for (const jobStateSingle of jobStateSingleArr) {
            if (jobStateSingle.getType() === job) {
                arrayList.add(jobStateSingle);
            }
        }
        if (arrayList.isEmpty()) {
            // Careers added after a save was made (e.g. Retail) have no record yet in older saves.
            const created = new JobState.JobStateSingle(job, 0, 1);
            this.states = [...this.states, created];
            return created;
        }
        return (CollectionsKt.first((arrayList as unknown as ArrayList)) as unknown as JobState.JobStateSingle);
    }
    work(job: Job, workAction: WorkAction): void {
        Intrinsics.checkParameterIsNotNull(job, "job");
        Intrinsics.checkParameterIsNotNull(workAction, "workAction");
        TelemetryManager.INSTANCE.logEvent("Work", MapsKt.mapOf(TuplesKt.to("Type", ArraysKt.first(job.getJobTitles())), TuplesKt.to("Action", workAction.toString())));
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        if (personState.getCrimeState().getIsInJail()) return;   // v0.27.0: no outside work from a cell
        let state: JobState.JobStateSingle = this.getState(job);
        AttributeState.setDeltaValue$default(personState.getAttributeState(), job.modifiers(state.getLevel()), null, 2, null);
        let randomValue: number = state.getType().pay(state.getLevel()).getRandomValue() * workAction.getPayModifier() * Vampire.onWork(personState, job) * Careers.payMultiplier(job, personState) * World.payMultiplier(personState, job);
        // v0.23.0 Automatic Savings: part of the paycheck can go straight to savings
        Subscriptions.payCheck(JMath.toInt(randomValue), personState);
        // v0.19.0 Celebrity Life: celebrity careers earn fans and skill
        Celebrity.onWork(personState, job, state.getLevel(), workAction.getPayModifier());
        // v0.26.0: the new careers (seasons, followers, on-the-job moments)
        // v0.29.4: surprises at work are random events
        AlertManager.randomly(() => {
            Careers.onWork(personState, job, state.getLevel());
            Illness.onWork(personState, workAction.name());   // v0.28.0: all-nighters can burn you out
        });
        if (!state.isMaxLevel()) {
            if (state.getProgress() >= (job.weeksForPromotion(state.getLevel()) - 1)) {
                let educationRequirement: CompletableAction = state.getType().educationRequirement(state.getLevel() + 1);
                const fameBlock: string | null = Celebrity.promotionBlock(job, state.getLevel() + 1, personState);
                const careerBlock: string | null = Careers.promotionBlock(job, state.getLevel() + 1, personState);
                const hasDegree: boolean = (educationRequirement != null) ? personState.getCompletableActionState().isCompleted(educationRequirement) : true;
                if (hasDegree && fameBlock != null) {
                    Celebrity.blocked(job, state.getLevel() + 1, personState);
                } else if (hasDegree && careerBlock != null) {
                    Careers.blocked(job, state.getLevel() + 1, personState);
                } else if (hasDegree) {
                    state.setProgress(0);
                    state.setLevel(state.getLevel() + 1);
                    personState.getMiscState().setHasShownDegreeMissingAlert(false);
                    AlertManager.INSTANCE.showPromotionAlert(state);
                } else if (!personState.getMiscState().getHasShownDegreeMissingAlert() && (educationRequirement != null)) {
                    AlertManager.INSTANCE.showMissingDegreeAlert(educationRequirement);
                    personState.getMiscState().setHasShownDegreeMissingAlert(true);
                }
            } else {
                // v0.19.0: fame speeds up celebrity careers
                state.setProgress(Math.min(job.weeksForPromotion(state.getLevel()) - 1, state.getProgress() + 1 + Celebrity.progressBonus(job, personState) + Careers.progressBonus(job, personState)));
            }
        }
        AlertManager.showRandomEvent$default(AlertManager.INSTANCE, RandomEvent.INSTANCE.randomEventForJob(state.getType()), false, 2, null);
        personState.applyWeekly();
    }
    switchJob(job: Job): void {
        Intrinsics.checkParameterIsNotNull(job, "job");
        // v0.27.0: nobody hires you while you're in prison (whatever path tries: coaching, moments, heirs…)
        try { const me = GameStateManager.INSTANCE.getPersonState(); if (me?.getJobState() === this && me.getCrimeState().getIsInJail()) return; } catch { /* no game */ }
        this.currentJob = job;
        GameStateManager.INSTANCE.getPersonState().getSideHustleState().deactivateProject();
        GameStateManager.INSTANCE.getPersonState().getMiscState().setHasShownDegreeMissingAlert(false);
    }
}
export namespace JobState {
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
    export class JobStateSingle {
        static INSTANCE: any;
        level: number = 0;
        progress: number = 0;
        type: Job = null;
        /** Weeks this career has been your job (undefined in older saves: read via Retirement.weeksIn). */
        weeksInCareer: number = 0;
        constructor(type: Job, i: number, i2: number) {
            Intrinsics.checkParameterIsNotNull(type, "type");
        this.type = type;
        this.progress = i;
        this.level = i2;
        }
        static copy$default(jobStateSingle: JobState.JobStateSingle, job: Job, i: number, i2: number, i3: number, obj: any): JobState.JobStateSingle {
        if ((i3 & 1) !== 0) {
            job = jobStateSingle.type;
        }
        if ((i3 & 2) !== 0) {
            i = jobStateSingle.progress;
        }
        if ((i3 & 4) !== 0) {
            i2 = jobStateSingle.level;
        }
        return jobStateSingle.copy(job, i, i2);
    }
        getType(): Job {
        return this.type;
    }
        getProgress(): number {
        return this.progress;
    }
        getLevel(): number {
        return this.level;
    }
        copy(type: Job, progress: number, level: number): JobState.JobStateSingle {
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new JobState.JobStateSingle(type, progress, level);
    }
        equals(other: any): boolean {
        if (this !== other) {
            if (other instanceof JobState.JobStateSingle) {
                let jobStateSingle: JobState.JobStateSingle = (other as unknown as JobState.JobStateSingle);
                if (Intrinsics.areEqual(this.type, jobStateSingle.type)) {
                    if (this.progress === jobStateSingle.progress) {
                        if (this.level === jobStateSingle.level) {
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
        toString(): string {
        return ((((("JobStateSingle(type=" + this.type) + ", progress=") + this.progress) + ", level=") + this.level) + ")";
    }
        setProgress(i: number): void {
        this.progress = i;
    }
        setLevel(i: number): void {
        this.level = i;
    }
        updateProgress(progress: number): void {
        this.progress = Math.max(0, progress);
    }
        isMaxLevel(): boolean {
        return this.type.getMaxLevels() === this.level;
    }
        getJobTitle(): string {
        return this.type.getJobTitles()[this.level - 1];
    }
        getModifiers(): Modifiers {
        return this.type.modifiers(this.level);
    }
        getSalaryRange(): ValueRange {
        return this.type.pay(this.level);
    }
        getViewModel(): BaseViewModel {
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let imageId: number = this.type.getImageId();
        let jobTitle: string = this.getJobTitle();
        let str: string = "";
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder("");
        let z: boolean = false;
        let z2: boolean = this.type === personState.getJobState().getCurrentJob();
        let educationRequirement: CompletableAction = this.type.educationRequirement(this.level);
        let requiredItem: Possession = this.type.getRequiredItem();
        if (educationRequirement != null) {
            z = !personState.getCompletableActionState().isCompleted(educationRequirement);
            str = educationRequirement.getTitle();
        }
        if (requiredItem != null) {
            z = !personState.getItemState().isOwned(requiredItem);
            str = requiredItem.getTitle();
        }
        // Too young to work (the game can start at age 0)
        const tooYoung: string | null = z2 ? null : AgeLimits.tooYoung(AgeLimits.work, personState);
        // v0.26.0: age range and fitness for the new careers
        const careerBlock: string | null = (z2 || tooYoung != null) ? null : Careers.applyBlock(this.type, personState);
        let z3: boolean = z || tooYoung != null || careerBlock != null;
        if (careerBlock != null && !z) {
            ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, careerBlock, null, null, null, 14, null));
        } else if (tooYoung != null) {
            ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, tooYoung, null, null, null, 14, null));
        } else if (z3) {
            ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, Utils.Strings.INSTANCE.getRequiresString(str), null, null, null, 14, null));
        }
        let hidden: ProgressBarViewModel = ProgressBarViewModel.INSTANCE.getHidden();
        let currentJobState: JobState.JobStateSingle = personState.getJobState().getCurrentJobState();
        if (((currentJobState != null) && (currentJobState.type === this.type)) && !currentJobState.isMaxLevel()) {
            hidden = new ProgressBarViewModel(this.progress, this.type.weeksForPromotion(this.level), false, false, 12, null);
            let educationRequirement2: CompletableAction = currentJobState.type.educationRequirement(this.level + 1);
            if ((educationRequirement2 != null) && !personState.getCompletableActionState().isCompleted(educationRequirement2)) {
                ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, (Utils.INSTANCE.getString(R.string.Job_Action_NextPromotion) + ": ") + educationRequirement2.getTitle(), null, null, null, 14, null));
            }
        }
        // v0.19.0: celebrity careers also need fans for the top promotions
        if (!this.isMaxLevel() && Celebrity.isCelebJob(this.type)) {
            const fame = Celebrity.promotionBlock(this.type, this.level + 1, personState);
            if (fame != null) ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, `Next promotion needs: ${fame}`, null, null, null, 14, null));
        }
        let progressBarViewModel: ProgressBarViewModel = hidden;
        if (!z3) {
            ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, this.type.pay(this.level).displayString(true), R.color.flatGreen, null, null, 12, null)), this.type.modifiers(this.level), null, null, null, 14, null);
        }
        // v0.26.0: what the new careers need and how the season treats them
        for (const line of Careers.describe(this.type, this.level, personState)) {
            if (spannableStringBuilder.length > 0 && !spannableStringBuilder.toString().endsWith("\n")) ExtensionsKt.appendNewline(spannableStringBuilder);
            ExtensionsKt.appendNormal$default(spannableStringBuilder, line, null, null, null, 14, null);
        }
        const careerText = Retirement.careerText(this);
        if (careerText != null) {
            if (spannableStringBuilder.length > 0 && !spannableStringBuilder.toString().endsWith("\n")) ExtensionsKt.appendNewline(spannableStringBuilder);
            ExtensionsKt.appendNormal$default(spannableStringBuilder, careerText, null, null, null, 14, null);
        }
        return new ActionProgressViewModel(imageId, jobTitle, new TextLabelViewModel("", null, false, false, null, spannableStringBuilder, 30, null), z2 ? Utils.INSTANCE.getString(R.string.Housing_Label_Current) : null, progressBarViewModel, null, new ButtonViewModel(Utils.INSTANCE.getString(R.string.Job_Action_Apply), null, !z2, false, z3, false, false, {
            invoke: () => {
            if (AgeLimits.tooYoung(AgeLimits.work) != null) return;
            if (Careers.applyBlock(this.getType(), GameStateManager.INSTANCE.getPersonState()) != null) return;
            Retirement.beforeApplying(() => {
                GameStateManager.INSTANCE.getPersonState().getJobState().switchJob(this.getType());
                let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
                if (mainGameFragment != null) {
                    mainGameFragment.updateUI(MainGameTab.Work);
                }
            });
        }
        }, 96, null), 32, null);
    }
    }
    export namespace JobStateSingle {
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
JobState.INSTANCE = new JobState.Companion(null);
JobState.JobStateSingle.INSTANCE = new JobState.JobStateSingle.Companion(null);
