// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArraysKt, BigInteger, Double, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, Random } from "../runtime";
import { CompletableAction } from "./CompletableAction";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { RelationshipProgressStatus } from "./RelationshipProgressStatus";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";

export class Business extends JEnum {
    static readonly factory: Business = new Business("factory", 0);
    static readonly softwareCompany: Business = new Business("softwareCompany", 1);
    static readonly restaurantChain: Business = new Business("restaurantChain", 2);
    static readonly realEstateCompany: Business = new Business("realEstateCompany", 3);
    static readonly farm: Business = new Business("farm", 4);
    static values(): Business[] { return [Business.factory, Business.softwareCompany, Business.restaurantChain, Business.realEstateCompany, Business.farm]; }
    static valueOf(n: string): Business { return (Business as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getBusinessUnitTitle(): string {
        let i: Business = this;
        if (i === Business.factory) {
            return Utils.INSTANCE.getString(R.string.Business_Factory_UnitName);
        }
        if (i === Business.softwareCompany) {
            return Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_UnitName);
        }
        if (i === Business.restaurantChain) {
            return Utils.INSTANCE.getString(R.string.Business_RestuarantChain_UnitName);
        }
        if (i === Business.realEstateCompany) {
            return Utils.INSTANCE.getString(R.string.Business_RealEstate_UnitName);
        }
        if (i === Business.farm) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_UnitName);
        }
        throw new NoWhenBranchMatchedException();
    }
    getBusinessUnitSingularTitle(): string {
        let i: Business = this;
        if (i === Business.factory) {
            return Utils.INSTANCE.getString(R.string.Business_Factory_UnitNameSingular);
        }
        if (i === Business.softwareCompany) {
            return Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_UnitNameSingular);
        }
        if (i === Business.restaurantChain) {
            return Utils.INSTANCE.getString(R.string.Business_RestuarantChain_UnitNameSingular);
        }
        if (i === Business.realEstateCompany) {
            return Utils.INSTANCE.getString(R.string.Business_RealEstate_UnitNameSingular);
        }
        if (i === Business.farm) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_UnitNameSingular);
        }
        throw new NoWhenBranchMatchedException();
    }
    getBaseBusinessName(): string {
        let i: Business = this;
        if (i === Business.factory) {
            return Utils.INSTANCE.getString(R.string.BusinessFactory_BaseName);
        }
        if (i === Business.softwareCompany) {
            return Utils.INSTANCE.getString(R.string.BusinessSoftwareCompany_BaseName);
        }
        if (i === Business.restaurantChain) {
            return Utils.INSTANCE.getString(R.string.BusinessChain_BaseName);
        }
        if (i === Business.realEstateCompany) {
            return Utils.INSTANCE.getString(R.string.BusinessRealEstate_BaseName);
        }
        if (i === Business.farm) {
            return Utils.INSTANCE.getString(R.string.BusinessFarm_BaseName);
        }
        throw new NoWhenBranchMatchedException();
    }
    getUpkeepName(): string {
        let i: Business = this;
        if (((i === Business.factory) || (i === Business.softwareCompany)) || (i === Business.farm)) {
            return Utils.INSTANCE.getString(R.string.BusinessAttributeSalary_Factory);
        }
        if (i === Business.restaurantChain) {
            return Utils.INSTANCE.getString(R.string.BusinessAttributeSalary_Chain);
        }
        if (i === Business.realEstateCompany) {
            return Utils.INSTANCE.getString(R.string.BusinessAttributeRealEstate_Project);
        }
        throw new NoWhenBranchMatchedException();
    }
    getRandomCompanyName(): string {
        let strArr: string[];
        let i: Business = this;
        if (i === Business.factory) {
            strArr = ["General Gears", "Tesla", "Solar City", "Nestle", "Airtrain", "Skynet Manufactoring", "Foxcon", "U.S Steel", "General Electronics", "Dow Chemicals", "Boxes Inc", "Paperclip Factory", "Fox Motors"];
        } else if (i === Business.softwareCompany) {
            strArr = ["Microsoftware", "IPM", "Yapple", "Uber", "Yoogle", "Salefarce", "Adobo", "PayBuddy", "Cispo", "Circle", "BitConnect", "Cypto Inc", "GitPub", "CircleSpace", "LinkedOut", "Wahoo", "Smack"];
        } else if (i === Business.restaurantChain) {
            strArr = ["Farby's", "Pasta Garden", "Buffalo Wild Drumsticks", "Burger Queen", "Dairy King", "Hungry Jack", "Hotdog Heaven", "Yellow Castle", "Taco Pal", "Pizza House", "Panera Salad", "Chip and Toe", "Jack My Box", "Six Guys", "Steak and Bake"];
        } else if (i === Business.realEstateCompany) {
            strArr = ["Brookfield", "Tower Corporation", "Simon Property", "Annaly", "Prologis", "Link", "Weyerhaeuser", "Gecina", "Klepierre", "Westfield", "Avalon", "Ventas", "Oxford", "Camden", "Corcoran Group", "Zillow", "Redfin"];
        } else {
            if (i !== Business.farm) {
                throw new NoWhenBranchMatchedException();
            }
            strArr = ["Anna Creek", "Home Valley", "Wave Hill", "Monsanto", "Rocket Farm", "Adler", "Sunny Seeds", "Old Stone Farm", "Black Hallow", "Nightfall Farm", "Winterfell Farm", "Meadowgrove", "Precious Stone Farm", "Two Pines", "Dragontooth Farm", "Iron Hill Farm", "Rosewood Farm", "Turkey Hill", "Scarlet Farm", "Wholesome Farm"];
        }
        return (ArraysKt.random(strArr, Random.INSTANCE) as string);
    }
    getMoraleTitle(): string {
        let i: Business = this;
        if (i === Business.factory) {
            return (this.getBusinessUnitSingularTitle() + " ") + Utils.INSTANCE.getString(R.string.BusinessFactory_MoraleTitle);
        }
        if (i === Business.softwareCompany) {
            return (this.getBusinessUnitSingularTitle() + " ") + Utils.INSTANCE.getString(R.string.BusinessSoftwareCompany_MoraleTitle);
        }
        if (i === Business.restaurantChain) {
            return (this.getBusinessUnitSingularTitle() + " ") + Utils.INSTANCE.getString(R.string.BusinessRestaurantChain_MoraleTitle);
        }
        if (i === Business.realEstateCompany) {
            return (Utils.INSTANCE.getString(R.string.Common_Company) + " ") + Utils.INSTANCE.getString(R.string.Business_RealEstate_MoraleTitle);
        }
        if (i !== Business.farm) {
            throw new NoWhenBranchMatchedException();
        }
        return (Utils.INSTANCE.getString(R.string.Common_Produce) + " ") + Utils.INSTANCE.getString(R.string.Business_Farm_MoraleTitle);
    }
    getUpkeepTitle(): string {
        let i: Business = this;
        if ((i === Business.factory) || (i === Business.softwareCompany)) {
            return Utils.INSTANCE.getString(R.string.BusinessFactory_UpkeepName);
        }
        if (i === Business.restaurantChain) {
            return Utils.INSTANCE.getString(R.string.BusinessChain_UpkeepName);
        }
        if (i === Business.realEstateCompany) {
            return Utils.INSTANCE.getString(R.string.Business_RealEstate_UpkeepName);
        }
        if (i === Business.farm) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_UpkeepName);
        }
        throw new NoWhenBranchMatchedException();
    }
    getBenefitsImageId(): number {
        let i: Business = this;
        if ((i === Business.factory) || (i === Business.softwareCompany)) {
            return R.drawable.business_factory_benefit;
        }
        if (i === Business.restaurantChain) {
            return R.drawable.business_chain_benefit;
        }
        if (i === Business.realEstateCompany) {
            return R.drawable.business_realestate_upkeep;
        }
        if (i === Business.farm) {
            return R.drawable.business_farm_upkeep;
        }
        throw new NoWhenBranchMatchedException();
    }
    getMaxNumberOfBusinessUnits(): BigInteger {
        let i: Business = this;
        if (((i === Business.factory) || (i === Business.softwareCompany)) || (i === Business.farm)) {
            let valueOf: BigInteger = BigInteger.valueOf(100000000);
            return valueOf;
        }
        if (i === Business.restaurantChain) {
            let valueOf2: BigInteger = BigInteger.valueOf(20000000);
            return valueOf2;
        }
        if (i !== Business.realEstateCompany) {
            throw new NoWhenBranchMatchedException();
        }
        let valueOf3: BigInteger = BigInteger.valueOf(10000000);
        return valueOf3;
    }
    moraleText(status: RelationshipProgressStatus): string {
        Intrinsics.checkParameterIsNotNull(status, "status");
        let i: Business = this;
        if ((i === Business.factory) || (i === Business.softwareCompany)) {
            let i2: RelationshipProgressStatus = status;
            if (i2 === RelationshipProgressStatus.distant) {
                return Utils.INSTANCE.getString(R.string.BusinessFactory_Morale1);
            }
            if (i2 === RelationshipProgressStatus.lacking) {
                return Utils.INSTANCE.getString(R.string.BusinessFactory_Morale2);
            }
            if (i2 === RelationshipProgressStatus.good) {
                return Utils.INSTANCE.getString(R.string.BusinessFactory_Morale3);
            }
            if (i2 === RelationshipProgressStatus.close) {
                return Utils.INSTANCE.getString(R.string.BusinessFactory_Morale4);
            }
            if (i2 === RelationshipProgressStatus.besties) {
                return Utils.INSTANCE.getString(R.string.BusinessFactory_Morale5);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === Business.restaurantChain) {
            let i3: RelationshipProgressStatus = status;
            if (i3 === RelationshipProgressStatus.distant) {
                return Utils.INSTANCE.getString(R.string.BusinessChain_Morale1);
            }
            if (i3 === RelationshipProgressStatus.lacking) {
                return Utils.INSTANCE.getString(R.string.BusinessChain_Morale2);
            }
            if (i3 === RelationshipProgressStatus.good) {
                return Utils.INSTANCE.getString(R.string.BusinessChain_Morale3);
            }
            if (i3 === RelationshipProgressStatus.close) {
                return Utils.INSTANCE.getString(R.string.BusinessChain_Morale4);
            }
            if (i3 === RelationshipProgressStatus.besties) {
                return Utils.INSTANCE.getString(R.string.BusinessChain_Morale5);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === Business.realEstateCompany) {
            let i4: RelationshipProgressStatus = status;
            if (i4 === RelationshipProgressStatus.distant) {
                return Utils.INSTANCE.getString(R.string.BusinessRealEstate_Morale1);
            }
            if (i4 === RelationshipProgressStatus.lacking) {
                return Utils.INSTANCE.getString(R.string.BusinessRealEstate_Morale2);
            }
            if (i4 === RelationshipProgressStatus.good) {
                return Utils.INSTANCE.getString(R.string.BusinessRealEstate_Morale3);
            }
            if (i4 === RelationshipProgressStatus.close) {
                return Utils.INSTANCE.getString(R.string.BusinessRealEstate_Morale4);
            }
            if (i4 === RelationshipProgressStatus.besties) {
                return Utils.INSTANCE.getString(R.string.BusinessRealEstate_Morale5);
            }
            throw new NoWhenBranchMatchedException();
        }
        if (i === Business.farm) {
            let i5: RelationshipProgressStatus = status;
            if (i5 === RelationshipProgressStatus.distant) {
                return Utils.INSTANCE.getString(R.string.BusinessFarm_Morale1);
            }
            if (i5 === RelationshipProgressStatus.lacking) {
                return Utils.INSTANCE.getString(R.string.BusinessFarm_Morale2);
            }
            if (i5 === RelationshipProgressStatus.good) {
                return Utils.INSTANCE.getString(R.string.BusinessFarm_Morale3);
            }
            if (i5 === RelationshipProgressStatus.close) {
                return Utils.INSTANCE.getString(R.string.BusinessFarm_Morale4);
            }
            if (i5 === RelationshipProgressStatus.besties) {
                return Utils.INSTANCE.getString(R.string.BusinessFarm_Morale5);
            }
            throw new NoWhenBranchMatchedException();
        }
        throw new NoWhenBranchMatchedException();
    }
    imageId(level: number): number {
        let i: Business = this;
        if (i === Business.factory) {
            if ((level >= 0) && (4 >= level)) {
                return R.drawable.business_factory1;
            }
            return ((5 <= level) && (8 >= level)) ? R.drawable.business_factory2 : R.drawable.business_factory3;
        }
        if (i === Business.softwareCompany) {
            if ((level >= 0) && (4 >= level)) {
                return R.drawable.business_software1;
            }
            return ((5 <= level) && (8 >= level)) ? R.drawable.business_software2 : R.drawable.business_software3;
        }
        if (i === Business.restaurantChain) {
            if ((level >= 0) && (4 >= level)) {
                return R.drawable.business_coffeechain1;
            }
            return ((5 <= level) && (8 >= level)) ? R.drawable.business_coffeechain2 : R.drawable.business_coffeechain3;
        }
        if (i === Business.realEstateCompany) {
            if ((level >= 0) && (4 >= level)) {
                return R.drawable.business_realestate1;
            }
            return ((5 <= level) && (8 >= level)) ? R.drawable.business_realestate2 : R.drawable.business_realestate3;
        }
        if (i !== Business.farm) {
            throw new NoWhenBranchMatchedException();
        }
        if ((level >= 0) && (4 >= level)) {
            return R.drawable.business_farm1;
        }
        return ((5 <= level) && (8 >= level)) ? R.drawable.business_farm2 : R.drawable.business_farm3;
    }
    companyLogoImageEasternEgg(companyName: string): number {
        Intrinsics.checkParameterIsNotNull(companyName, "companyName");
        let i: Business = this;
        if (i !== Business.factory) {
            if (i === Business.softwareCompany) {
                let hashCode: number = Intrinsics.hashCode(companyName);
                if (hashCode !== 63476538) {
                    if (hashCode !== 561774310) {
                        if ((hashCode === 1909739726) && Intrinsics.areEqual(companyName, "Microsoft")) {
                            return R.drawable.companylogo_microsoft;
                        }
                    } else if (Intrinsics.areEqual(companyName, "Facebook")) {
                        return R.drawable.companylogo_facebook;
                    }
                } else if (Intrinsics.areEqual(companyName, "Apple")) {
                    return R.drawable.companylogo_apple;
                }
            } else {
                if (i !== Business.restaurantChain) {
                    if ((i === Business.realEstateCompany) || (i === Business.farm)) {
                        return null;
                    }
                    throw new NoWhenBranchMatchedException();
                }
                if ((Intrinsics.hashCode(companyName) === -1787348185) && Intrinsics.areEqual(companyName, "McDonalds")) {
                    return R.drawable.companylogo_mcdonalds;
                }
            }
        } else if ((Intrinsics.hashCode(companyName) === 80698615) && Intrinsics.areEqual(companyName, "Tesla")) {
            return R.drawable.companylogo_tesla;
        }
        return null;
    }
    getRequiredDegree(): CompletableAction {
        let i: Business = this;
        if (i === Business.factory) {
            return CompletableAction.college_business;
        }
        if (i === Business.softwareCompany) {
            return CompletableAction.college_computerScience;
        }
        if (i === Business.restaurantChain) {
            return CompletableAction.highSchool;
        }
        if (i === Business.realEstateCompany) {
            return CompletableAction.college_business;
        }
        if (i === Business.farm) {
            return CompletableAction.highSchool;
        }
        throw new NoWhenBranchMatchedException();
    }
    getBaseBusinessCost(): number {
        let i: Business = this;
        if (i === Business.factory) {
            return 1000000;
        }
        if (i === Business.softwareCompany) {
            return 2000000;
        }
        if ((i === Business.restaurantChain) || (i === Business.realEstateCompany)) {
            return 1000000;
        }
        if (i === Business.farm) {
            return 10000000;
        }
        throw new NoWhenBranchMatchedException();
    }
    getBaseBusinessUnitCost(): number {
        let i: Business = this;
        if (i === Business.factory) {
            return 50000;
        }
        if (i === Business.softwareCompany) {
            return 100000;
        }
        if (i === Business.restaurantChain) {
            return 250000;
        }
        if (i === Business.realEstateCompany) {
            return 100000;
        }
        if (i === Business.farm) {
            return 35000;
        }
        throw new NoWhenBranchMatchedException();
    }
    getBaseSalaryPerWeek(): number {
        let i: Business = this;
        if (i !== Business.factory) {
            if (i === Business.softwareCompany) {
                return 2000;
            }
            if ((i === Business.restaurantChain) || (i === Business.realEstateCompany)) {
                return 5000;
            }
            if (i !== Business.farm) {
                throw new NoWhenBranchMatchedException();
            }
        }
        return 1000;
    }
    getBaseBusinessRevenuePerWeek(): number {
        let i: number;
        let i2: Business = this;
        if (i2 === Business.factory) {
            i = 1250;
        } else if (i2 === Business.softwareCompany) {
            i = 2600;
        } else if (i2 === Business.restaurantChain) {
            i = 6250;
        } else if (i2 === Business.realEstateCompany) {
            i = 5500;
        } else {
            if (i2 !== Business.farm) {
                throw new NoWhenBranchMatchedException();
            }
            i = 1500;
        }
        return i;
    }
    getMoraleActionCostPerEmployee(): number {
        let i: Business = this;
        if (i === Business.factory) {
            return 10000;
        }
        if (i === Business.softwareCompany) {
            return 20000;
        }
        if (i === Business.restaurantChain) {
            return 50000;
        }
        if (i === Business.realEstateCompany) {
            return 25000;
        }
        if (i === Business.farm) {
            return 10000;
        }
        throw new NoWhenBranchMatchedException();
    }
    upgradeUnitRequirement(level: number): number {
        let i: Business = this;
        if ((i === Business.factory) || (i === Business.farm)) {
            switch (level) {
                case 1:
                    return 0;
                case 2:
                    return 10;
                case 3:
                    return 25;
                case 4:
                    return 50;
                case 5:
                    return 100;
                case 6:
                    return 200;
                case 7:
                    return 400;
                case 8:
                    return 1000;
                case 9:
                    return 2000;
                case 10:
                    return 3000;
                case 11:
                    return 5000;
                case 12:
                    return 10000;
            }
        }
        if (i === Business.softwareCompany) {
            switch (level) {
                case 1:
                    return 0;
                case 2:
                    return 5;
                case 3:
                    return 10;
                case 4:
                    return 20;
                case 5:
                    return 30;
                case 6:
                    return 50;
                case 7:
                    return 80;
                case 8:
                    return 150;
                case 9:
                    return 200;
                case 10:
                    return 400;
                case 11:
                    return 1000;
                case 12:
                    return 2000;
            }
        }
        if (i === Business.restaurantChain) {
            switch (level) {
                case 1:
                    return 0;
                case 2:
                    return 2;
                case 3:
                    return 6;
                case 4:
                    return 10;
                case 5:
                    return 15;
                case 6:
                    return 30;
                case 7:
                    return 50;
                case 8:
                    return 80;
                case 9:
                    return 120;
                case 10:
                    return 200;
                case 11:
                    return 500;
                case 12:
                    return 1000;
            }
        }
        if (i !== Business.realEstateCompany) {
            throw new NoWhenBranchMatchedException();
        }
        switch (level) {
            case 1:
                return 0;
            case 2:
                return 3;
            case 3:
                return 8;
            case 4:
                return 20;
            case 5:
                return 40;
            case 6:
                return 100;
            case 7:
                return 150;
            case 8:
                return 250;
            case 9:
                return 400;
            case 10:
                return 600;
            case 11:
                return 1000;
            case 12:
                return 1500;
        }
    }
    companyTitle(level: number): string {
        let i: Business = this;
        if (i === Business.factory) {
            if ((level >= 0) && (2 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_Factory_Name1);
            }
            if ((3 <= level) && (4 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_Factory_Name2);
            }
            if ((5 <= level) && (6 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_Factory_Name3);
            }
            if ((7 <= level) && (8 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_Factory_Name4);
            }
            if ((9 <= level) && (10 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_Factory_Name5);
            }
            return ((11 <= level) && (12 >= level)) ? Utils.INSTANCE.getString(R.string.Business_Factory_Name6) : "";
        }
        if (i === Business.softwareCompany) {
            if ((level >= 0) && (2 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_Name1);
            }
            if ((3 <= level) && (4 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_Name2);
            }
            if ((5 <= level) && (6 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_Name3);
            }
            if ((7 <= level) && (8 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_Name4);
            }
            if ((9 <= level) && (10 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_Name5);
            }
            return ((11 <= level) && (12 >= level)) ? Utils.INSTANCE.getString(R.string.Business_SoftwareCompany_Name6) : "";
        }
        if (i === Business.restaurantChain) {
            if ((level >= 0) && (2 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RestuarantChain_Name1);
            }
            if ((3 <= level) && (4 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RestuarantChain_Name2);
            }
            if ((5 <= level) && (6 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RestuarantChain_Name3);
            }
            if ((7 <= level) && (8 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RestuarantChain_Name4);
            }
            if ((9 <= level) && (10 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RestuarantChain_Name5);
            }
            return ((11 <= level) && (12 >= level)) ? Utils.INSTANCE.getString(R.string.Business_RestuarantChain_Name6) : "";
        }
        if (i === Business.realEstateCompany) {
            if ((level >= 0) && (2 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RealEstate_Name1);
            }
            if ((3 <= level) && (4 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RealEstate_Name2);
            }
            if ((5 <= level) && (6 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RealEstate_Name3);
            }
            if ((7 <= level) && (8 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RealEstate_Name4);
            }
            if ((9 <= level) && (10 >= level)) {
                return Utils.INSTANCE.getString(R.string.Business_RealEstate_Name5);
            }
            return ((11 <= level) && (12 >= level)) ? Utils.INSTANCE.getString(R.string.Business_RealEstate_Name6) : "";
        }
        if (i !== Business.farm) {
            throw new NoWhenBranchMatchedException();
        }
        if ((level >= 0) && (2 >= level)) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_Name1);
        }
        if ((3 <= level) && (4 >= level)) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_Name2);
        }
        if ((5 <= level) && (6 >= level)) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_Name3);
        }
        if ((7 <= level) && (8 >= level)) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_Name4);
        }
        if ((9 <= level) && (10 >= level)) {
            return Utils.INSTANCE.getString(R.string.Business_Farm_Name5);
        }
        return ((11 <= level) && (12 >= level)) ? Utils.INSTANCE.getString(R.string.Business_Farm_Name6) : "";
    }
    unitCostForLevel(level: number): number {
        let d: number = 1;
        let d2: number = level - 1;
        Double.isNaN(d2);
        Double.isNaN(d);
        let d3: number = d + (d2 * 0.5);
        if (GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.charismatic)) {
            d3 *= Trait.INSTANCE.getPersuasiveBusinessUpgradeCostModifier();
        }
        let baseBusinessUnitCost: number = this.getBaseBusinessUnitCost();
        Double.isNaN(baseBusinessUnitCost);
        return JMath.toInt((d3 * baseBusinessUnitCost));
    }
    businessUpgradeCostForLevel(level: number): BigInteger {
        let valueOf: BigInteger = BigInteger.valueOf(this.getBaseBusinessCost());
        let valueOf2: BigInteger = BigInteger.valueOf(4);
        let pow: BigInteger = valueOf2.pow(level);
        let multiply: BigInteger = valueOf.multiply(pow);
        return GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.persuasive) ? ExtensionsKt.multiply(multiply, Trait.INSTANCE.getPersuasiveBusinessUpgradeCostModifier()) : multiply;
    }
    revenueForWeekForLevel(level: number): number {
        let baseBusinessRevenuePerWeek: number = this.getBaseBusinessRevenuePerWeek();
        let d: number = 1;
        let d2: number = level - 1;
        Double.isNaN(d2);
        Double.isNaN(d);
        Double.isNaN(baseBusinessRevenuePerWeek);
        return JMath.toInt((baseBusinessRevenuePerWeek * (d + (d2 * 0.5))));
    }
}
