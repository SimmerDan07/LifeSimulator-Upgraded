// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Intrinsics, JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { Perk } from "./Perk";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";

export class Housing extends JEnum {
    static readonly homeless: Housing = new Housing("homeless", 0);
    static readonly shared_room: Housing = new Housing("shared_room", 1);
    static readonly small_apartment: Housing = new Housing("small_apartment", 2);
    static readonly house: Housing = new Housing("house", 3);
    static readonly luxury_condo: Housing = new Housing("luxury_condo", 4);
    static readonly grand_estate: Housing = new Housing("grand_estate", 5);
    static readonly parentsHouse: Housing = new Housing("parentsHouse", 6);
    static readonly apartmentComplex: Housing = new Housing("apartmentComplex", 7);
    static readonly jail: Housing = new Housing("jail", 8);
    static readonly skyscraper: Housing = new Housing("skyscraper", 9);
    static readonly spaceHotel: Housing = new Housing("spaceHotel", 10);
    static values(): Housing[] { return [Housing.homeless, Housing.shared_room, Housing.small_apartment, Housing.house, Housing.luxury_condo, Housing.grand_estate, Housing.parentsHouse, Housing.apartmentComplex, Housing.jail, Housing.skyscraper, Housing.spaceHotel]; }
    static valueOf(n: string): Housing { return (Housing as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case Housing.homeless:
                return Utils.INSTANCE.getString(R.string.Housing_Name_ParkBench);
            case Housing.shared_room:
                return Utils.INSTANCE.getString(R.string.Housing_Name_SharedRoom);
            case Housing.small_apartment:
                return Utils.INSTANCE.getString(R.string.Housing_Name_SmallApartment);
            case Housing.house:
                return Utils.INSTANCE.getString(R.string.Housing_Name_House);
            case Housing.luxury_condo:
                return Utils.INSTANCE.getString(R.string.Housing_Name_LuxuryCondo);
            case Housing.grand_estate:
                return Utils.INSTANCE.getString(R.string.Housing_Name_GrandEstate);
            case Housing.parentsHouse:
                return Utils.INSTANCE.getString(R.string.Housing_Name_HouseParent);
            case Housing.apartmentComplex:
                return Utils.INSTANCE.getString(R.string.Housing_Name_ApartmentComplex);
            case Housing.jail:
                return Utils.INSTANCE.getString(R.string.Housing_Jail);
            case Housing.skyscraper:
                return Utils.INSTANCE.getString(R.string.Housing_Name_Skyscraper);
            case Housing.spaceHotel:
                return Utils.INSTANCE.getString(R.string.Housing_Name_SpaceHotel);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case Housing.homeless:
                return R.drawable.housing_homeless;
            case Housing.shared_room:
                return R.drawable.housing_shared_room;
            case Housing.small_apartment:
                return R.drawable.housing_small_apartment;
            case Housing.house:
            case Housing.parentsHouse:
                return R.drawable.housing_house;
            case Housing.luxury_condo:
                return R.drawable.housing_luxury_condo;
            case Housing.grand_estate:
                return R.drawable.housing_grand_estate;
            case Housing.apartmentComplex:
                return R.drawable.housing_apartmentcomplex;
            case Housing.jail:
                return R.drawable.jail;
            case Housing.skyscraper:
                return R.drawable.housing_skyscraper;
            case Housing.spaceHotel:
                return R.drawable.housing_spacehotel;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getModifiers(): Modifiers {
        switch (this) {
            case Housing.homeless:
                return new Modifiers(0.0, -1.0, -1.0);
            case Housing.shared_room:
                return new Modifiers(0.0, -1.0, 0.0);
            case Housing.small_apartment:
                return new Modifiers(0.0, 0.0, 0.0);
            case Housing.house:
                return new Modifiers(0.0, 1.0, 0.0);
            case Housing.luxury_condo:
                return new Modifiers(0.0, 1.0, 1.0);
            case Housing.grand_estate:
                return new Modifiers(0.0, 2.0, 1.0);
            case Housing.parentsHouse:
                return new Modifiers(0.0, 1.0, 0.0);
            case Housing.apartmentComplex:
                return new Modifiers(0.0, 0.0, 0.0);
            case Housing.jail:
                return new Modifiers(0.0, 0.0, 0.0);
            case Housing.skyscraper:
                return new Modifiers(0.0, 0.0, 0.0);
            case Housing.spaceHotel:
                return new Modifiers(0.0, 2.0, 2.0);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getPurchasePrice(): BigInteger {
        switch (this) {
            case Housing.homeless:
                let valueOf: BigInteger = BigInteger.valueOf(0);
                return valueOf;
            case Housing.shared_room:
                let valueOf2: BigInteger = BigInteger.valueOf(0);
                return valueOf2;
            case Housing.small_apartment:
                let valueOf3: BigInteger = BigInteger.valueOf(200000);
                return valueOf3;
            case Housing.house:
                let valueOf4: BigInteger = BigInteger.valueOf(500000);
                return valueOf4;
            case Housing.luxury_condo:
                let valueOf5: BigInteger = BigInteger.valueOf(1250000);
                return valueOf5;
            case Housing.grand_estate:
                let valueOf6: BigInteger = BigInteger.valueOf(10000000);
                return valueOf6;
            case Housing.parentsHouse:
                let valueOf7: BigInteger = BigInteger.valueOf(0);
                return valueOf7;
            case Housing.apartmentComplex:
                let valueOf8: BigInteger = BigInteger.valueOf(100000000);
                return valueOf8;
            case Housing.jail:
                let valueOf9: BigInteger = BigInteger.valueOf(0);
                return valueOf9;
            case Housing.skyscraper:
                let valueOf10: BigInteger = BigInteger.valueOf(10000000000);
                return valueOf10;
            case Housing.spaceHotel:
                let valueOf11: BigInteger = BigInteger.valueOf(10000000000000);
                return valueOf11;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getPurchasable(): boolean {
        let purchasePrice: BigInteger = this.getPurchasePrice();
        return !Intrinsics.areEqual(purchasePrice, BigInteger.valueOf(0));
    }
    getRentalValue(): BigInteger {
        let j: number = 0;
        let valueOf: BigInteger = BigInteger.valueOf(j);
        switch (this) {
            case Housing.homeless:
                let valueOf2: BigInteger = BigInteger.valueOf(j);
                return valueOf2;
            case Housing.shared_room:
                let valueOf3: BigInteger = BigInteger.valueOf(100);
                return valueOf3;
            case Housing.small_apartment:
                let valueOf4: BigInteger = BigInteger.valueOf(200);
                return valueOf4;
            case Housing.house:
                let valueOf5: BigInteger = BigInteger.valueOf(600);
                return valueOf5;
            case Housing.luxury_condo:
                let valueOf6: BigInteger = BigInteger.valueOf(1600);
                return valueOf6;
            case Housing.grand_estate:
                let valueOf7: BigInteger = BigInteger.valueOf(12000);
                return valueOf7;
            case Housing.parentsHouse:
                let valueOf8: BigInteger = BigInteger.valueOf(j);
                return valueOf8;
            case Housing.apartmentComplex:
                let valueOf9: BigInteger = BigInteger.valueOf(125000);
                return valueOf9;
            case Housing.jail:
                let valueOf10: BigInteger = BigInteger.valueOf(j);
                return valueOf10;
            case Housing.skyscraper:
                let valueOf11: BigInteger = BigInteger.valueOf(15000000);
                return valueOf11;
            case Housing.spaceHotel:
                let valueOf12: BigInteger = BigInteger.valueOf(16000000000);
                return valueOf12;
            default:
                return valueOf;
        }
    }
    getRentalEarning(): BigInteger {
        let rentalValue: BigInteger = this.getRentalValue();
        return GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.realestateMogul) ? ExtensionsKt.times(rentalValue, Perk.INSTANCE.getRealestateMongulBoost()) : rentalValue;
    }
    getRentalCost(): BigInteger {
        if (!this.getLivable()) {
            return this.getRentalEarning();
        }
        let rentalValue: BigInteger = this.getRentalValue();
        return GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.highMaintenance) ? ExtensionsKt.times(rentalValue, Trait.INSTANCE.getHighMaintenanceRentModifier()) : rentalValue;
    }
    getLivable(): boolean {
        let i: Housing = this;
        return ((i === Housing.apartmentComplex) || (i === Housing.skyscraper)) ? false : true;
    }
    getNumberOfPetsAllowed(): number {
        switch (this) {
            case Housing.small_apartment:
            case Housing.parentsHouse:
                return 1;
            case Housing.house:
            case Housing.luxury_condo:
                return 2;
            case Housing.grand_estate:
                return 3;
            case Housing.spaceHotel:
                return 4;
            default:
                return 0;
        }
    }
    getRequiredItem(): Possession {
        if (this !== Housing.spaceHotel) {
            return null;
        }
        return Possession.rocket;
    }
}
export namespace Housing {
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
        getNormalHousingOptions(): Housing[] {
        return [Housing.homeless, Housing.shared_room, Housing.small_apartment, Housing.house, Housing.luxury_condo, Housing.grand_estate, Housing.apartmentComplex, Housing.skyscraper, Housing.spaceHotel];
    }
        housingOptions(player: Player): Housing[] {
        Intrinsics.checkParameterIsNotNull(player, "player");
        // Kids live with their parents. Adults can move out, and move back in while a parent is alive.
        const atParents = player.getHousingState().currentHousing().getType() === Housing.parentsHouse;
        if (atParents && player.getAgeInYears() < 18) return [Housing.parentsHouse];
        const options = this.getNormalHousingOptions();
        return player.getFamilyState().getParentsStillLiving() ? [...options, Housing.parentsHouse] : options;
    }
    }
}
Housing.INSTANCE = new Housing.Companion(null);
