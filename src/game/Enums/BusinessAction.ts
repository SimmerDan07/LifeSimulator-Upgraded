// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Arrays, BigInteger, Intrinsics, JEnum, NoWhenBranchMatchedException, R, StringCompanionObject, TypeCastException } from "../runtime";
import { Business } from "./Business";
import { BusinessState } from "../Managers/BusinessState";
import { CompletableAction } from "./CompletableAction";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Utils } from "../Utils/Utils";

export class BusinessAction extends JEnum {
    static readonly incorporate: BusinessAction = new BusinessAction("incorporate", 0);
    static readonly upgrade: BusinessAction = new BusinessAction("upgrade", 1);
    static readonly hire: BusinessAction = new BusinessAction("hire", 2);
    static readonly hireMax: BusinessAction = new BusinessAction("hireMax", 3);
    static readonly moraleAction: BusinessAction = new BusinessAction("moraleAction", 4);
    static readonly sellBusiness: BusinessAction = new BusinessAction("sellBusiness", 5);
    static values(): BusinessAction[] { return [BusinessAction.incorporate, BusinessAction.upgrade, BusinessAction.hire, BusinessAction.hireMax, BusinessAction.moraleAction, BusinessAction.sellBusiness]; }
    static valueOf(n: string): BusinessAction { return (BusinessAction as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    title(type: Business): string {
        Intrinsics.checkParameterIsNotNull(type, "type");
        switch (this) {
            case BusinessAction.incorporate:
                return Utils.INSTANCE.getString(R.string.BusinessAction_Incorporate);
            case BusinessAction.upgrade:
                let i: Business = type;
                if ((i === Business.factory) || (i === Business.realEstateCompany)) {
                    return Utils.INSTANCE.getString(R.string.BusinessUpgrade_Factory);
                }
                if (i === Business.softwareCompany) {
                    return Utils.INSTANCE.getString(R.string.BusinessUpgrade_SoftwareCompany);
                }
                if ((i === Business.restaurantChain) || (i === Business.farm)) {
                    return Utils.INSTANCE.getString(R.string.BusinessUpgrade_Chain);
                }
                throw new NoWhenBranchMatchedException();
            case BusinessAction.hire:
                let i2: Business = type;
                if ((i2 === Business.factory) || (i2 === Business.farm)) {
                    return Utils.INSTANCE.getString(R.string.BusinessHire_Factory);
                }
                if (i2 === Business.softwareCompany) {
                    return Utils.INSTANCE.getString(R.string.BusinessHire_SoftwareCompany);
                }
                if (i2 === Business.restaurantChain) {
                    return Utils.INSTANCE.getString(R.string.BusinessHire_Chain);
                }
                if (i2 === Business.realEstateCompany) {
                    return Utils.INSTANCE.getString(R.string.Business_RealEstate_NewContract);
                }
                throw new NoWhenBranchMatchedException();
            case BusinessAction.hireMax:
                let i3: Business = type;
                if ((i3 === Business.factory) || (i3 === Business.farm)) {
                    return Utils.INSTANCE.getString(R.string.BusinessHireMax_Factory);
                }
                if (i3 === Business.softwareCompany) {
                    return Utils.INSTANCE.getString(R.string.BusinessHireMax_SoftwareCompany);
                }
                if (i3 === Business.restaurantChain) {
                    return Utils.INSTANCE.getString(R.string.BusinessHireMax_Chain);
                }
                if (i3 === Business.realEstateCompany) {
                    return Utils.INSTANCE.getString(R.string.Business_RealEstate_MaxContract);
                }
                throw new NoWhenBranchMatchedException();
            case BusinessAction.moraleAction:
                let i4: Business = type;
                if (i4 === Business.factory) {
                    return Utils.INSTANCE.getString(R.string.BusinessMorale_Factory);
                }
                if (i4 === Business.softwareCompany) {
                    return Utils.INSTANCE.getString(R.string.BusinessMorale_SoftwareCompany);
                }
                if (i4 === Business.restaurantChain) {
                    return Utils.INSTANCE.getString(R.string.BusinessMorale_Chain);
                }
                if (i4 === Business.realEstateCompany) {
                    return Utils.INSTANCE.getString(R.string.Business_RealEstate_MoraleEvent);
                }
                if (i4 === Business.farm) {
                    return Utils.INSTANCE.getString(R.string.Business_Farm_MoraleEvent);
                }
                throw new NoWhenBranchMatchedException();
            case BusinessAction.sellBusiness:
                return Utils.INSTANCE.getString(R.string.BusinessSellBusiness);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    imageId(type: Business): number {
        Intrinsics.checkParameterIsNotNull(type, "type");
        switch (this) {
            case BusinessAction.incorporate:
                return type.imageId(1);
            case BusinessAction.upgrade:
                let i: Business = type;
                if (i === Business.factory) {
                    return R.drawable.business_upgrade_factory;
                }
                if (((i === Business.softwareCompany) || (i === Business.restaurantChain)) || (i === Business.realEstateCompany)) {
                    return R.drawable.business_upgrade_gamingcompany;
                }
                if (i === Business.farm) {
                    return R.drawable.business_upgrade_farm;
                }
                throw new NoWhenBranchMatchedException();
            case BusinessAction.hire:
            case BusinessAction.hireMax:
                let i2: Business = type;
                if (i2 === Business.factory) {
                    return R.drawable.business_hire_worker;
                }
                if (i2 === Business.softwareCompany) {
                    return R.drawable.business_hire_employee;
                }
                if (i2 === Business.restaurantChain) {
                    return R.drawable.business_open_store;
                }
                if (i2 === Business.realEstateCompany) {
                    return R.drawable.business_realestate_new;
                }
                if (i2 === Business.farm) {
                    return R.drawable.business_farm_new;
                }
                throw new NoWhenBranchMatchedException();
            case BusinessAction.moraleAction:
                let i3: Business = type;
                if (i3 === Business.factory) {
                    return R.drawable.business_factory_morale;
                }
                if (i3 === Business.softwareCompany) {
                    return R.drawable.business_softwarecompany_morale;
                }
                if (i3 === Business.restaurantChain) {
                    return R.drawable.business_chain_morale;
                }
                if (i3 === Business.realEstateCompany) {
                    return R.drawable.business_realestate_progress;
                }
                if (i3 === Business.farm) {
                    return R.drawable.business_farm_progress;
                }
                throw new NoWhenBranchMatchedException();
            case BusinessAction.sellBusiness:
                return R.drawable.business_sell;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    cost(state: BusinessState.SingleBusinessState): BigInteger {
        Intrinsics.checkParameterIsNotNull(state, "state");
        switch (this) {
            case BusinessAction.incorporate:
                let valueOf: BigInteger = BigInteger.valueOf(state.getType().getBaseBusinessCost());
                return valueOf;
            case BusinessAction.upgrade:
                return state.getType().businessUpgradeCostForLevel(state.getLevel());
            case BusinessAction.hire:
                let valueOf2: BigInteger = BigInteger.valueOf(state.getType().unitCostForLevel(state.getLevel()));
                return valueOf2;
            case BusinessAction.hireMax:
                let valueOf3: BigInteger = BigInteger.valueOf(state.getType().unitCostForLevel(state.getLevel()));
                let companion = Utils.MathExtension.INSTANCE;
                let maxEmployeeHirable: BigInteger = state.getMaxEmployeeHirable();
                let valueOf4: BigInteger = BigInteger.valueOf(1);
                let multiply: BigInteger = valueOf3.multiply(companion.max(maxEmployeeHirable, valueOf4));
                return multiply;
            case BusinessAction.moraleAction:
                let valueOf5: BigInteger = BigInteger.valueOf(state.getType().getMoraleActionCostPerEmployee());
                let multiply2: BigInteger = valueOf5.multiply(state.getNumberOfBusinessUnits());
                return multiply2;
            case BusinessAction.sellBusiness:
                let valueOf6: BigInteger = BigInteger.valueOf(0);
                return valueOf6;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    requirementNotMetString(state: BusinessState.SingleBusinessState): string {
        Intrinsics.checkParameterIsNotNull(state, "state");
        let valueOf: BigInteger = BigInteger.valueOf(state.getType().upgradeUnitRequirement(state.getLevel() + 1));
        switch (this) {
            case BusinessAction.incorporate:
                let requiredDegree: CompletableAction = state.getType().getRequiredDegree();
                if ((requiredDegree != null) && !GameStateManager.INSTANCE.getPersonState().hasSkill(requiredDegree)) {
                    return Utils.Strings.INSTANCE.getRequiresString(requiredDegree.getTitle());
                }
                return null;
            case BusinessAction.upgrade:
                if (state.getLevel() === Constants.Business.INSTANCE.getMaxLevel()) {
                    return Utils.INSTANCE.getString(R.string.Business_MaxLevel);
                }
                if (state.getNumberOfBusinessUnits().compareTo(valueOf) < 0) {
                    return (((Utils.INSTANCE.getString(R.string.Common_Requires) + " ") + valueOf) + " ") + state.getType().getBusinessUnitTitle();
                }
                return null;
            case BusinessAction.hire:
            case BusinessAction.hireMax:
                if ((state.getLevel() !== Constants.Business.INSTANCE.getMaxLevel()) && (state.getNumberOfBusinessUnits().compareTo(valueOf) >= 0)) {
                    return Utils.INSTANCE.getString(R.string.Hire_NeedUpgradeBusiness);
                }
                return null;
            case BusinessAction.moraleAction:
                let numberOfBusinessUnits: BigInteger = state.getNumberOfBusinessUnits();
                let valueOf2: BigInteger = BigInteger.valueOf(0);
                if (numberOfBusinessUnits.compareTo(valueOf2) <= 0) {
                    return (Utils.INSTANCE.getString(R.string.Common_No) + " ") + state.getType().getBusinessUnitTitle();
                }
                return null;
            case BusinessAction.sellBusiness:
                return null;
            default:
                return null;
        }
    }
    getButtonTitle(): string {
        if (this !== BusinessAction.sellBusiness) {
            return null;
        }
        return Utils.INSTANCE.getString(R.string.Common_Sell);
    }
    additionalDescription(state: BusinessState.SingleBusinessState): string {
        Intrinsics.checkParameterIsNotNull(state, "state");
        let i: BusinessAction = this;
        if (i !== BusinessAction.upgrade) {
            if (i === BusinessAction.moraleAction) {
                return (("+" + this.getMoraleBoost()) + " ") + state.getType().getMoraleTitle();
            }
            if (i !== BusinessAction.sellBusiness) {
                return null;
            }
            return (Utils.INSTANCE.getString(R.string.CompanyValue_Label) + ": ") + ExtensionsKt.numberDisplayString$default(state.getTotalCompanyValue(), false, 1, null);
        }
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.BusinessUpgrade_Description);
        let objArr = new Array(2).fill(null);
        let businessUnitSingularTitle: string = state.getType().getBusinessUnitSingularTitle();
        if (businessUnitSingularTitle == null) {
            throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
        }
        let lowerCase: string = businessUnitSingularTitle.toLowerCase();
        objArr[0] = lowerCase;
        let businessUnitSingularTitle2: string = state.getType().getBusinessUnitSingularTitle();
        if (businessUnitSingularTitle2 == null) {
            throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
        }
        let lowerCase2: string = businessUnitSingularTitle2.toLowerCase();
        objArr[1] = lowerCase2;
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        return format;
    }
    getMoraleBoost(): number {
        return (this !== BusinessAction.moraleAction) ? 0 : 10;
    }
}
export namespace BusinessAction {
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
        getAllValues(): BusinessAction[] {
        return [BusinessAction.upgrade, BusinessAction.hire, BusinessAction.hireMax, BusinessAction.moraleAction, BusinessAction.sellBusiness];
    }
    }
}
BusinessAction.INSTANCE = new BusinessAction.Companion(null);
