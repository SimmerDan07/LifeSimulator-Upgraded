// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { CompletableAction } from "./CompletableAction";
import { GameStateManager } from "../Managers/GameStateManager";
import { Utils } from "../Utils/Utils";

export class WorkAction extends JEnum {
    static readonly normal: WorkAction = new WorkAction("normal", 0);
    static readonly hard: WorkAction = new WorkAction("hard", 1);
    static readonly veryHard: WorkAction = new WorkAction("veryHard", 2);
    static values(): WorkAction[] { return [WorkAction.normal, WorkAction.hard, WorkAction.veryHard]; }
    static valueOf(n: string): WorkAction { return (WorkAction as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitleText(): string {
        let i: WorkAction = this;
        if (i === WorkAction.normal) {
            return Utils.INSTANCE.getString(R.string.Job_Action_Work1);
        }
        if (i === WorkAction.hard) {
            return Utils.INSTANCE.getString(R.string.Job_Action_Work2);
        }
        if (i === WorkAction.veryHard) {
            return Utils.INSTANCE.getString(R.string.Job_Action_Work3);
        }
        throw new NoWhenBranchMatchedException();
    }
    getPayModifier(): number {
        let i: WorkAction = this;
        if (i === WorkAction.normal) {
            return 1.0;
        }
        if (i === WorkAction.hard) {
            return 1.2;
        }
        if (i === WorkAction.veryHard) {
            return GameStateManager.INSTANCE.getPersonState().hasSkill(CompletableAction.timeMangement) ? 1.8 : 1.5;
        }
        throw new NoWhenBranchMatchedException();
    }
    getSideHustleProgressModifier(): number {
        let i: WorkAction = this;
        if (i === WorkAction.normal) {
            return 1.0;
        }
        if (i === WorkAction.hard) {
            return 1.5;
        }
        if (i === WorkAction.veryHard) {
            return GameStateManager.INSTANCE.getPersonState().hasSkill(CompletableAction.timeMangement) ? 3.0 : 2.0;
        }
        throw new NoWhenBranchMatchedException();
    }
    getHappinessModifier(): number {
        let i: WorkAction = this;
        if (i === WorkAction.normal) {
            return -1.0;
        }
        if (i === WorkAction.hard) {
            return -2.0;
        }
        if (i === WorkAction.veryHard) {
            return -3.0;
        }
        throw new NoWhenBranchMatchedException();
    }
}
