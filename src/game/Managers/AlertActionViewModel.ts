// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function0, Intrinsics } from "../runtime";

export class AlertActionViewModel {
    action: Function0<any> = null;
    title: string = null;
    constructor(title: string, action: Function0<any>) {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(action, "action");
        this.title = title;
        this.action = action;
    }
    static copy$default(alertActionViewModel: AlertActionViewModel, str: string, function0: Function0, i: number, obj: any): AlertActionViewModel {
        if ((i & 1) !== 0) {
            str = alertActionViewModel.title;
        }
        if ((i & 2) !== 0) {
            function0 = alertActionViewModel.action;
        }
        return alertActionViewModel.copy(str, function0);
    }
    getTitle(): string {
        return this.title;
    }
    component2(): Function0<any> {
        return this.action;
    }
    copy(title: string, action: Function0<any>): AlertActionViewModel {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(action, "action");
        return new AlertActionViewModel(title, action);
    }
    equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (!(other instanceof AlertActionViewModel)) {
            return false;
        }
        let alertActionViewModel: AlertActionViewModel = (other as unknown as AlertActionViewModel);
        return Intrinsics.areEqual(this.title, alertActionViewModel.title) && Intrinsics.areEqual(this.action, alertActionViewModel.action);
    }
    toString(): string {
        return ((("AlertActionViewModel(title=" + this.title) + ", action=") + this.action) + ")";
    }
    getAction(): Function0<any> {
        return this.action;
    }
}
