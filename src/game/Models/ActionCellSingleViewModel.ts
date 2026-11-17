// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Integer, Intrinsics, SpannableStringBuilder } from "../runtime";
import { ActionDescriptor } from "../Enums/ActionDescriptor";
import { BaseViewModel } from "./BaseViewModel";
import { ButtonViewModel } from "./ButtonViewModel";
import { CellType } from "./CellType";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Player } from "../Managers/Player";
import { SwitchViewModel } from "./SwitchViewModel";
import { TextLabelViewModel } from "./TextLabelViewModel";

export class ActionCellSingleViewModel extends BaseViewModel {
    static INSTANCE: any;
    actionButton: ButtonViewModel = null;
    identifier: string = null;
    imageId: number = null;
    subtitle: TextLabelViewModel = null;
    switchViewModel: SwitchViewModel = null;
    title: string = null;
    $init0(num: number, str: string, textLabelViewModel: TextLabelViewModel, buttonViewModel: ButtonViewModel, switchViewModel: SwitchViewModel, str2: string, i: number, defaultConstructorMarker: any): void {
        this.$init(num, str, textLabelViewModel, buttonViewModel, ((i & 16) !== 0) ? SwitchViewModel.INSTANCE.getHidden() : switchViewModel, ((i & 32) !== 0) ? null : str2);
    }
    $init1(num: number, title: string, subtitle: TextLabelViewModel, actionButton: ButtonViewModel, switchViewModel: SwitchViewModel, str: string): void {
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(subtitle, "subtitle");
        Intrinsics.checkParameterIsNotNull(actionButton, "actionButton");
        Intrinsics.checkParameterIsNotNull(switchViewModel, "switchViewModel");
        this.identifier = (str == null) ? title : str;
        this.imageId = num;
        this.title = title;
        this.subtitle = subtitle;
        this.actionButton = actionButton;
        this.switchViewModel = switchViewModel;
    }
    constructor(...args: any[]) {
        super();
        this.$init(...args);
    }
    $init(...a: any[]): any {
        if (a.length === 8 && (a[0] == null || typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || a[3] instanceof ButtonViewModel) && (a[4] == null || a[4] instanceof SwitchViewModel) && (a[5] == null || typeof a[5] === 'string') && (typeof a[6] === 'number' || typeof a[6] === 'string')) return (this as any).$init0(...a);
        if (a.length === 6 && (a[0] == null || typeof a[0] === 'number' || typeof a[0] === 'string') && (a[1] == null || typeof a[1] === 'string') && (a[2] == null || a[2] instanceof TextLabelViewModel) && (a[3] == null || a[3] instanceof ButtonViewModel) && (a[4] == null || a[4] instanceof SwitchViewModel) && (a[5] == null || typeof a[5] === 'string')) return (this as any).$init1(...a);
        throw new Error('no overload for $init with ' + a.length + ' args');
    }
    getType(): CellType {
        return CellType.actionCellSingle;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getImageId(): number {
        return this.imageId;
    }
    getTitle(): string {
        return this.title;
    }
    getSubtitle(): TextLabelViewModel {
        return this.subtitle;
    }
    setSubtitle(textLabelViewModel: TextLabelViewModel): void {
        Intrinsics.checkParameterIsNotNull(textLabelViewModel, "<set-?>");
        this.subtitle = textLabelViewModel;
    }
    getActionButton(): ButtonViewModel {
        return this.actionButton;
    }
    setActionButton(buttonViewModel: ButtonViewModel): void {
        Intrinsics.checkParameterIsNotNull(buttonViewModel, "<set-?>");
        this.actionButton = buttonViewModel;
    }
    getSwitchViewModel(): SwitchViewModel {
        return this.switchViewModel;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof ActionCellSingleViewModel)) {
            return false;
        }
        let actionCellSingleViewModel: ActionCellSingleViewModel = (other as unknown as ActionCellSingleViewModel);
        return (((Intrinsics.areEqual(this.imageId, actionCellSingleViewModel.imageId) && Intrinsics.areEqual(this.title, actionCellSingleViewModel.title)) && Intrinsics.areEqual(this.subtitle, actionCellSingleViewModel.subtitle)) && Intrinsics.areEqual(this.actionButton, actionCellSingleViewModel.actionButton)) && Intrinsics.areEqual(this.switchViewModel, actionCellSingleViewModel.switchViewModel);
    }
}
export namespace ActionCellSingleViewModel {
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
        static initWithActionDescriptor$default(companion: any, actionDescriptor: ActionDescriptor, obj: any, i: number, obj2: any): ActionCellSingleViewModel {
        if ((i & 2) !== 0) {
            obj = null;
        }
        return companion.initWithActionDescriptor(actionDescriptor, obj);
    }
        initWithActionDescriptor(actionDescriptor: ActionDescriptor, metadata: any): ActionCellSingleViewModel {
        Intrinsics.checkParameterIsNotNull(actionDescriptor, "actionDescriptor");
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let requirementNotMetString: string = actionDescriptor.requirementNotMetString(personState);
        if ((requirementNotMetString == null) || (ExtensionsKt.appendNormal$default(spannableStringBuilder, requirementNotMetString, null, null, null, 14, null) == null)) {
            let additionalDescription: string = actionDescriptor.getAdditionalDescription();
            if (additionalDescription != null) {
                ExtensionsKt.appendNormal$default(spannableStringBuilder, additionalDescription, null, null, null, 14, null);
            }
            ExtensionsKt.appendAttributesString$default(spannableStringBuilder, actionDescriptor.getModifiers(), null, null, null, 14, null);
        }
        let textLabelViewModel: TextLabelViewModel = new TextLabelViewModel("", null, false, false, null, spannableStringBuilder, 30, null);
        let cost: BigInteger = actionDescriptor.getCost();
        let imageId: number = actionDescriptor.getImageId();
        let title: string = actionDescriptor.getTitle();
        if (metadata != null) {
            let overrideTitle: string = actionDescriptor.overrideTitle(metadata);
            if (overrideTitle != null) {
                title = overrideTitle;
            }
            let overrideImageId: number = actionDescriptor.overrideImageId(metadata);
            if (overrideImageId != null) {
                imageId = overrideImageId.intValue();
            }
            let overrideCost: BigInteger = actionDescriptor.overrideCost(metadata);
            if (overrideCost != null) {
                cost = overrideCost;
            }
        }
        let str: string = title;
        let actionTitle: string = actionDescriptor.getActionTitle();
        if (actionTitle == null) {
            actionTitle = ExtensionsKt.numberDisplayString$default(cost, false, 1, null);
        }
        let str2: string = actionTitle;
        let z: boolean = requirementNotMetString != null;
        let valueOf: BigInteger = BigInteger.valueOf(0);
        return new ActionCellSingleViewModel(Integer.valueOf(imageId), str, textLabelViewModel, new ButtonViewModel(str2, null, !(Intrinsics.areEqual(cost, valueOf) !== true) || (personState.getMoneyState().getCash().compareTo(cost) >= 0), false, z, false, false, {
            invoke: () => {
            actionDescriptor.action(GameStateManager.INSTANCE.getPersonState());
        }
        }, 96, null), null, null, 48, null);
    }
    }
}
ActionCellSingleViewModel.INSTANCE = new ActionCellSingleViewModel.Companion(null);
