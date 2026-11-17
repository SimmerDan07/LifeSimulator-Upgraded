// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Function0, Integer, Intrinsics, R, SpannableStringBuilder } from "../runtime";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { EditableTextFieldViewModel } from "../Models/EditableTextFieldViewModel";
import { Utils } from "../Utils/Utils";

export class AlertViewModel {
    additionalButtons: ArrayList<AlertActionViewModel> = null;
    attributedMessage: SpannableStringBuilder = null;
    editableTextFieldViewModel: EditableTextFieldViewModel = null;
    imageId: number = null;
    message: string = null;
    negativeButton: AlertActionViewModel = null;
    positiveButton: AlertActionViewModel = null;
    title: string = null;
    type: AlertType = null;
    $init0(title: string, str: string, num: number, spannableStringBuilder: SpannableStringBuilder, editableTextFieldViewModel: EditableTextFieldViewModel, alertActionViewModel: AlertActionViewModel, alertActionViewModel2: AlertActionViewModel, collection: ArrayList<AlertActionViewModel>, type: AlertType): void {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(type, "type");
        this.title = title;
        this.message = str;
        this.imageId = num;
        this.attributedMessage = spannableStringBuilder;
        this.editableTextFieldViewModel = editableTextFieldViewModel;
        this.positiveButton = alertActionViewModel;
        this.negativeButton = alertActionViewModel2;
        this.additionalButtons = collection;
        this.type = type;
    }
    $init1(str: string, str2: string, num: number, spannableStringBuilder: SpannableStringBuilder, editableTextFieldViewModel: EditableTextFieldViewModel, alertActionViewModel: AlertActionViewModel, alertActionViewModel2: AlertActionViewModel, collection: ArrayList, alertType: AlertType, i: number, defaultConstructorMarker: any): void {
        this.$init(str, str2, num, ((i & 8) !== 0) ? null : spannableStringBuilder, ((i & 16) !== 0) ? null : editableTextFieldViewModel, ((i & 32) !== 0) ? new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
            invoke: () => {
        }
        }) : alertActionViewModel, ((i & 64) !== 0) ? null : alertActionViewModel2, ((i & 128) !== 0) ? null : collection, ((i & 256) !== 0) ? AlertType.Alert : alertType);
    }
    $init2(title: string, message: string, i: number, type: AlertType): void {
        this.$init(title, message, Integer.valueOf(i), null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
            invoke: () => {
        }
        }), null, null, type, 216, null);
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(message, "message");
        Intrinsics.checkParameterIsNotNull(type, "type");
    }
    $init3(title: string, message: string, i: number, actionButton: string): void {
        this.$init(title, message, Integer.valueOf(i), null, null, new AlertActionViewModel(actionButton, {
            invoke: () => {
        }
        }), null, null, null, 472, null);
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(message, "message");
        Intrinsics.checkParameterIsNotNull(actionButton, "actionButton");
    }
    $init4(title: string, message: string, i: number, action: Function0<any>): void {
        this.$init(title, message, Integer.valueOf(i), null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), action), null, null, null, 472, null);
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(message, "message");
        Intrinsics.checkParameterIsNotNull(action, "action");
    }
    $init5(title: string, message: string, i: number, actionButton: string, action: Function0<any>): void {
        this.$init(title, message, Integer.valueOf(i), null, null, new AlertActionViewModel(actionButton, action), null, null, null, 472, null);
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(message, "message");
        Intrinsics.checkParameterIsNotNull(actionButton, "actionButton");
        Intrinsics.checkParameterIsNotNull(action, "action");
    }
    $init6(title: string, attributedMessage: SpannableStringBuilder, i: number, action: Function0<any>): void {
        this.$init(title, null, Integer.valueOf(i), attributedMessage, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), action), null, null, null, 464, null);
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(attributedMessage, "attributedMessage");
        Intrinsics.checkParameterIsNotNull(action, "action");
    }
    $init7(title: string, attributedMessage: SpannableStringBuilder, i: number, actionButton: string, action: Function0<any>): void {
        this.$init(title, null, Integer.valueOf(i), attributedMessage, null, new AlertActionViewModel(actionButton, action), null, null, null, 464, null);
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(attributedMessage, "attributedMessage");
        Intrinsics.checkParameterIsNotNull(actionButton, "actionButton");
        Intrinsics.checkParameterIsNotNull(action, "action");
    }
    constructor(...args: any[]) {
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 11 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || a[3] instanceof SpannableStringBuilder) && (a[4] == null || a[4] instanceof EditableTextFieldViewModel) && (a[5] == null || a[5] instanceof AlertActionViewModel) && (a[6] == null || a[6] instanceof AlertActionViewModel) && (a[7] == null || Array.isArray(a[7])) && (a[8] == null || a[8] instanceof AlertType) && (typeof a[9] === 'number' || typeof a[9] === 'string')) return (this as any).$init1(...a);
        if (a.length === 9 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || a[3] instanceof SpannableStringBuilder) && (a[4] == null || a[4] instanceof EditableTextFieldViewModel) && (a[5] == null || a[5] instanceof AlertActionViewModel) && (a[6] == null || a[6] instanceof AlertActionViewModel) && (a[7] == null || Array.isArray(a[7])) && (a[8] == null || a[8] instanceof AlertType)) return (this as any).$init0(...a);
        if (a.length === 5 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'string') && (a[4] == null || typeof a[4] === 'object')) return (this as any).$init5(...a);
        if (a.length === 5 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof SpannableStringBuilder) && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'string') && (a[4] == null || typeof a[4] === 'object')) return (this as any).$init7(...a);
        if (a.length === 4 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || a[3] instanceof AlertType)) return (this as any).$init2(...a);
        if (a.length === 4 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'string')) return (this as any).$init3(...a);
        if (a.length === 4 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'object')) return (this as any).$init4(...a);
        if (a.length === 4 && (a[0] == null || typeof a[0] === 'string') && (a[1] == null || a[1] instanceof SpannableStringBuilder) && (typeof a[2] === 'number' || typeof a[2] === 'string') && (a[3] == null || typeof a[3] === 'object')) return (this as any).$init6(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getTitle(): string {
        return this.title;
    }
    getMessage(): string {
        return this.message;
    }
    getImageId(): number {
        return this.imageId;
    }
    getAttributedMessage(): SpannableStringBuilder {
        return this.attributedMessage;
    }
    getEditableTextFieldViewModel(): EditableTextFieldViewModel {
        return this.editableTextFieldViewModel;
    }
    getPositiveButton(): AlertActionViewModel {
        return this.positiveButton;
    }
    getNegativeButton(): AlertActionViewModel {
        return this.negativeButton;
    }
    component8(): ArrayList<AlertActionViewModel> {
        return this.additionalButtons;
    }
    getType(): AlertType {
        return this.type;
    }
    copy(title: string, message: string, imageId: number, attributedMessage: SpannableStringBuilder, editableTextFieldViewModel: EditableTextFieldViewModel, positiveButton: AlertActionViewModel, negativeButton: AlertActionViewModel, additionalButtons: ArrayList<AlertActionViewModel>, type: AlertType): AlertViewModel {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(type, "type");
        return new AlertViewModel(title, message, imageId, attributedMessage, editableTextFieldViewModel, positiveButton, negativeButton, additionalButtons, type);
    }
    equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (!(other instanceof AlertViewModel)) {
            return false;
        }
        let alertViewModel: AlertViewModel = (other as unknown as AlertViewModel);
        return (((((((Intrinsics.areEqual(this.title, alertViewModel.title) && Intrinsics.areEqual(this.message, alertViewModel.message)) && Intrinsics.areEqual(this.imageId, alertViewModel.imageId)) && Intrinsics.areEqual(this.attributedMessage, alertViewModel.attributedMessage)) && Intrinsics.areEqual(this.editableTextFieldViewModel, alertViewModel.editableTextFieldViewModel)) && Intrinsics.areEqual(this.positiveButton, alertViewModel.positiveButton)) && Intrinsics.areEqual(this.negativeButton, alertViewModel.negativeButton)) && Intrinsics.areEqual(this.additionalButtons, alertViewModel.additionalButtons)) && Intrinsics.areEqual(this.type, alertViewModel.type);
    }
    toString(): string {
        return ((((((((((((((((("AlertViewModel(title=" + this.title) + ", message=") + this.message) + ", imageId=") + this.imageId) + ", attributedMessage=") + (this.attributedMessage)) + ", editableTextFieldViewModel=") + this.editableTextFieldViewModel) + ", positiveButton=") + this.positiveButton) + ", negativeButton=") + this.negativeButton) + ", additionalButtons=") + this.additionalButtons) + ", type=") + this.type) + ")";
    }
    getAdditionalButtons(): ArrayList<AlertActionViewModel> {
        return this.additionalButtons;
    }
}
