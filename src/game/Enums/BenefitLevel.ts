// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, Integer, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, SpannableStringBuilder, TypeCastException } from "../runtime";
import { Perk } from "./Perk";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { BaseViewModel } from "../Models/BaseViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListType } from "../Fragments/GenericListType";
import { Person } from "../Managers/Person";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";

export class BenefitLevel extends JEnum {
    static readonly minimum: BenefitLevel = new BenefitLevel("minimum", 0);
    static readonly low: BenefitLevel = new BenefitLevel("low", 1);
    static readonly medium: BenefitLevel = new BenefitLevel("medium", 2);
    static readonly high: BenefitLevel = new BenefitLevel("high", 3);
    static values(): BenefitLevel[] { return [BenefitLevel.minimum, BenefitLevel.low, BenefitLevel.medium, BenefitLevel.high]; }
    static valueOf(n: string): BenefitLevel { return (BenefitLevel as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        let i: BenefitLevel = this;
        if (i === BenefitLevel.minimum) {
            return Utils.INSTANCE.getString(R.string.ChildSupport_Minimum);
        }
        if (i === BenefitLevel.low) {
            return Utils.INSTANCE.getString(R.string.ChildSupport_Low);
        }
        if (i === BenefitLevel.medium) {
            return Utils.INSTANCE.getString(R.string.ChildSupport_Medium);
        }
        if (i === BenefitLevel.high) {
            return Utils.INSTANCE.getString(R.string.ChildSupport_High);
        }
        throw new NoWhenBranchMatchedException();
    }
    getColor(): number {
        let i: BenefitLevel = this;
        if (i === BenefitLevel.minimum) {
            return R.color.flatRed;
        }
        if (i === BenefitLevel.low) {
            return R.color.flatOrange;
        }
        if (i === BenefitLevel.medium) {
            return R.color.flatGreen;
        }
        if (i === BenefitLevel.high) {
            return R.color.flatPurple;
        }
        throw new NoWhenBranchMatchedException();
    }
    getChildSupport_cost(): number {
        let i: BenefitLevel = this;
        if (i === BenefitLevel.minimum) {
            return 50;
        }
        if (i === BenefitLevel.low) {
            return 200;
        }
        if (i === BenefitLevel.medium) {
            return 500;
        }
        if (i === BenefitLevel.high) {
            return 2000;
        }
        throw new NoWhenBranchMatchedException();
    }
    /** Reconstructed from bytecode. */
    getWeeklyRelationshipModifier(): number {
        let v = 0;
        if (this === BenefitLevel.minimum) v = -2;
        else if (this === BenefitLevel.low) v = 0;
        else if (this === BenefitLevel.medium) v = 1;
        else if (this === BenefitLevel.high) v = 2;
        if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.goodParenting)) {
            v += JMath.toInt(Perk.INSTANCE.getGoodParentingChildSupportBoost());
        }
        return v;
    }
    getWeeklyMoraleModifier(): number {
        let i: BenefitLevel = this;
        if (i === BenefitLevel.minimum) {
            return -2;
        }
        if (i === BenefitLevel.low) {
            return 0;
        }
        if (i === BenefitLevel.medium) {
            return 1;
        }
        if (i === BenefitLevel.high) {
            return 2;
        }
        throw new NoWhenBranchMatchedException();
    }
    getCostSalaryModifier(): number {
        let i: BenefitLevel = this;
        if (i === BenefitLevel.minimum) {
            return 0.1;
        }
        if (i === BenefitLevel.low) {
            return 0.2;
        }
        if (i === BenefitLevel.medium) {
            return 0.3;
        }
        if (i === BenefitLevel.high) {
            return 0.5;
        }
        throw new NoWhenBranchMatchedException();
    }
    getViewModelForChildSupport(child: Person): BaseViewModel {
        Intrinsics.checkParameterIsNotNull(child, "child");
        let string: string = Utils.INSTANCE.getString(R.string.ChildSupport_Title);
        let appendNormal$default: SpannableStringBuilder = ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), Utils.INSTANCE.getString(R.string.Common_Current) + ": ", null, null, null, 14, null), this.getTitle(), Integer.valueOf(this.getColor()), null, null, 12, null)), Utils.Strings.INSTANCE.formatWithPerWeek(ExtensionsKt.numberDisplayString$default(this.getChildSupport_cost(), false, 1, null)), null, null, null, 14, null)), Utils.Strings.INSTANCE.formatWithPerWeek((ExtensionsKt.stringWithExplicitPlusMinusSign(this.getWeeklyRelationshipModifier()) + " ") + Utils.INSTANCE.getString(R.string.ChildEvent_EventModifier)), null, null, null, 14, null);
        let arrayList: ArrayList = new ArrayList();
        let values: BenefitLevel[] = BenefitLevel.values();
        let length: number = values.length;
        for (let i = 0; i < length; i++) {
            let benefitLevel: BenefitLevel = values[i];
            arrayList.add(new ButtonViewModel(benefitLevel.getTitle(), null, benefitLevel !== this, false, false, false, false, {
                invoke: () => {
                child.setChildSupport(benefitLevel);
                Utils.INSTANCE.reloadGenericList(GenericListType.childDetails);
            }
            }, 122, null));
        }
        let textLabelViewModel: TextLabelViewModel = new TextLabelViewModel(appendNormal$default, false, false, null, 14, null);
        let hidden: TextLabelViewModel = TextLabelViewModel.INSTANCE.getHidden();
        let array = arrayList.toArray(new Array(0).fill(null));
        if (array != null) {
            return new ActionCellMultipleOptionsViewModel(R.drawable.childsupport, string, textLabelViewModel, hidden, (array as unknown as ButtonViewModel[]), null, 32, null);
        }
        throw new TypeCastException("null cannot be cast to non-null type kotlin.Array<T>");
    }
}
