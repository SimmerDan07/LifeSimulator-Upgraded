// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, BigInteger, CollectionsKt, Intrinsics, JEnum, NoWhenBranchMatchedException, R, Random } from "../runtime";
import { ActionDescriptor } from "./ActionDescriptor";
import { AlertManager } from "../Managers/AlertManager";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { FamilyState } from "../Managers/FamilyState";
import { Modifiers } from "../Managers/Modifiers";
import { Person } from "../Managers/Person";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { SoundEffect } from "../Managers/SoundEffect";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";

export class Pet extends JEnum implements ActionDescriptor {
    static readonly dog: Pet = new Pet("dog", 0);
    static readonly cat: Pet = new Pet("cat", 1);
    static readonly guineaPig: Pet = new Pet("guineaPig", 2);
    static readonly fish: Pet = new Pet("fish", 3);
    static readonly parrot: Pet = new Pet("parrot", 4);
    static readonly duck: Pet = new Pet("duck", 5);
    static readonly turkey: Pet = new Pet("turkey", 6);
    static values(): Pet[] { return [Pet.dog, Pet.cat, Pet.guineaPig, Pet.fish, Pet.parrot, Pet.duck, Pet.turkey]; }
    static valueOf(n: string): Pet { return (Pet as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getActionTitle(): string {
        return ActionDescriptor.DefaultImpls.getActionTitle(this);
    }
    getAgeRange(): ValueRange {
        return ActionDescriptor.DefaultImpls.getAgeRange(this);
    }
    getRequiredItem(): Possession {
        return ActionDescriptor.DefaultImpls.getRequiredItem(this);
    }
    overrideCost(metadata: any): BigInteger {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return ActionDescriptor.DefaultImpls.overrideCost(this, metadata);
    }
    overrideImageId(metadata: any): number {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return ActionDescriptor.DefaultImpls.overrideImageId(this, metadata);
    }
    overrideTitle(metadata: any): string {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return ActionDescriptor.DefaultImpls.overrideTitle(this, metadata);
    }
    requirementNotMetString(player: Player): string {
        if (player.getCrimeState().getIsInJail()) return "Not while you're in prison";   // v0.27.0
        Intrinsics.checkParameterIsNotNull(player, "player");
        return ActionDescriptor.DefaultImpls.requirementNotMetString(this, player);
    }
    getTitle(): string {
        switch (this) {
            case Pet.dog:
                return Utils.INSTANCE.getString(R.string.Pet_Type_Dog);
            case Pet.cat:
                return Utils.INSTANCE.getString(R.string.Pet_Type_Cat);
            case Pet.guineaPig:
                return Utils.INSTANCE.getString(R.string.Pet_Type_GuineaPig);
            case Pet.fish:
                return Utils.INSTANCE.getString(R.string.Pet_Type_Fish);
            case Pet.parrot:
                return Utils.INSTANCE.getString(R.string.Pet_Type_Parrot);
            case Pet.duck:
                return Utils.INSTANCE.getString(R.string.Pet_Type_Duck);
            case Pet.turkey:
                return Utils.INSTANCE.getString(R.string.Pet_Type_Turkey);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case Pet.dog:
                return R.drawable.pet_dog;
            case Pet.cat:
                return R.drawable.pet_cat;
            case Pet.guineaPig:
                return R.drawable.pet_guineapig;
            case Pet.fish:
                return R.drawable.pet_fish;
            case Pet.parrot:
                return R.drawable.pet_bird;
            case Pet.duck:
                return R.drawable.pet_duck;
            case Pet.turkey:
                return R.drawable.pet_turkey;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getTreatImageId(): number {
        switch (this) {
            case Pet.dog:
                return R.drawable.pet_dog_food;
            case Pet.cat:
                return R.drawable.pet_cat_food;
            case Pet.guineaPig:
                return R.drawable.pet_guineapig_food;
            case Pet.fish:
                return R.drawable.pet_fish_food;
            case Pet.parrot:
            case Pet.turkey:
                return R.drawable.pet_bird_food;
            case Pet.duck:
                return R.drawable.pet_duck_food;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getModifiers(): Modifiers {
        switch (this) {
            case Pet.dog:
                return new Modifiers(0.5, 0.3, 0.0);
            case Pet.cat:
                return new Modifiers(0.3, 0.2, 0.0);
            case Pet.guineaPig:
                return new Modifiers(0.2, 0.2, 0.0);
            case Pet.fish:
                return new Modifiers(0.0, 0.2, 0.0);
            case Pet.parrot:
                return new Modifiers(0.0, 0.3, 0.0);
            case Pet.duck:
                return new Modifiers(0.3, 0.1, 0.0);
            case Pet.turkey:
                return new Modifiers(0.4, 0.4, 0.0);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getAgeExpectancy(): number {
        switch (this) {
            case Pet.dog:
            case Pet.cat:
                return 12;
            case Pet.guineaPig:
                return 6;
            case Pet.fish:
            case Pet.turkey:
                return 5;
            case Pet.parrot:
                return 25;
            case Pet.duck:
                return 8;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getCost(): BigInteger {
        let i: number;
        switch (this) {
            case Pet.dog:
                i = 20000;
                break;
            case Pet.cat:
                i = 10000;
                break;
            case Pet.guineaPig:
                i = 5000;
                break;
            case Pet.fish:
                i = 1000;
                break;
            case Pet.parrot:
                i = 3000;
                break;
            case Pet.duck:
                i = 4000;
                break;
            case Pet.turkey:
                i = 6000;
                break;
            default:
                i = 0;
                break;
        }
        let valueOf: BigInteger = BigInteger.valueOf(i);
        return valueOf;
    }
    getTreatCost(): number {
        return this.getMaintenanceCost() * 2;
    }
    getMaintenanceCost(): number {
        switch (this) {
            case Pet.dog:
                return 100;
            case Pet.cat:
                return 80;
            case Pet.guineaPig:
                return 50;
            case Pet.fish:
                return 10;
            case Pet.parrot:
                return 25;
            case Pet.duck:
                return 60;
            case Pet.turkey:
                return 40;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    easternEggImage(petName: string): number {
        Intrinsics.checkParameterIsNotNull(petName, "petName");
        let i: Pet = this;
        if (i !== Pet.cat) {
            return (i !== Pet.guineaPig) ? (((i === Pet.parrot) && Intrinsics.areEqual(petName, "Pidgey")) ? R.drawable.pet_easteregg_pidgey : null) : (Intrinsics.areEqual(petName, "Rattata") ? R.drawable.pet_easteregg_rattata : null);
        }
        if (Intrinsics.areEqual(petName, "Pikachu")) {
            return R.drawable.pet_easteregg_pikachu;
        }
        return Intrinsics.areEqual(petName, "Meowth") ? R.drawable.pet_easteregg_meowth : null;
    }
    getSoundEffect(): SoundEffect {
        switch (this) {
            case Pet.dog:
                return SoundEffect.Bark;
            case Pet.cat:
                return SoundEffect.Meow;
            case Pet.guineaPig:
                return SoundEffect.GuineaPig;
            case Pet.fish:
                return SoundEffect.Fish;
            case Pet.parrot:
                return SoundEffect.BirdCall;
            case Pet.duck:
                return SoundEffect.Duck;
            case Pet.turkey:
                return SoundEffect.Turkey;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getRandomName(): string {
        let arrayList: ArrayList = new ArrayList();
        switch (this) {
            case Pet.dog:
                CollectionsKt.addAll(arrayList, ["Max", "Spot", "Rocky", "Charlie", "Dogo", "Doge", "Derpy", "Bear", "Bella", "Lucy", "Daisy", "Bud", "Woofer", "Pupper", "Pupperino", "Fluffer", "Bork", "Astro", "Brian", "Clifford", "Copper", "Dawg", "Droopy", "Goofy", "Huckleberry", "Pluto", "Odie", "Scooby-Doo", "Snoopy", "Underdog", "Chase", "Apollo", "Tracker"]);
                break;
            case Pet.cat:
                CollectionsKt.addAll(arrayList, ["Furball", "Mewie", "Chloe", "Nala", "Garfield", "Felix", "Tiger", "Jasper", "Loki", "Ruby", "Cleo", "Leo", "Buddy", "Snowball", "Simba", "Felix", "Tom", "Hello Kitty", "Sylvester", "Tigger", "Nala", "Scratchy", "Figaro", "Mr.Jinx", "Puss", "Salem", "Lucifer", "Grumpy", "Sassy"]);
                break;
            case Pet.guineaPig:
                CollectionsKt.addAll(arrayList, ["Tinker", "Lucky", "Scooter", "Bella", "Sunny", "Cookie", "Lola", "Pip", "Squeaky", "Twitch", "Einstein", "Winston", "Socrates", "Luna", "Sleepy", "Goofer", "Fluffy", "Tank", "Bear", "Stumpy", "Stubby", "Silky", "Furry"]);
                break;
            case Pet.fish:
                CollectionsKt.addAll(arrayList, ["Sushi", "Bubbles", "Casper", "Shadow", "Comet", "Flash", "Blue", "Crimson", "Nemo", "Dory", "Finley", "Captain Jack", "Drake", "Crash", "Sunny", "Finny", "Pumpkin", "Ariel", "Freckles", "Coco", "Elsa", "Peach", "Angel", "Buffy", "Diva"]);
                break;
            case Pet.parrot:
                CollectionsKt.addAll(arrayList, ["Matey", "Road Runner", "Tweety", "Woodstock", "Foghorn", "Huey", "Loue", "Dewey", "Woody", "Woodpecker", "McBird", "Daisy", "Toucan", "Quacker", "Egghead", "Iago", "Zazu", "Drake", "Beaky", "Willy", "Tootsie", "Henery", "Heckle", "Skipper", "Opus", "Gunther", "Kowalski", "Private", "Plucky", "Kevin", "Yakky", "Doodle", "McQuack", "Chirper", "Playboy", "Flit", "Big Bird"]);
                break;
            case Pet.duck:
                CollectionsKt.addAll(arrayList, ["Daffy", "Donald", "Road Runner", "Tweety", "Dewey", "Duckie", "Duckling", "Eggy", "Egg Head", "Huey", "Le Quack", "Ms.Duck", "Newton", "Pato", "Plucky", "Quacker", "Quackula", "McDuck", "Taipoca", "Wade"]);
                break;
            case Pet.turkey:
                CollectionsKt.addAll(arrayList, ["Gobbler", "Thanksgiving", "Big Chicken", "Big Bird", "Wishbone", "Mayflower", "Squasher", "Fiblet", "Farley", "Drumstick", "Yam Bam", "Pepe", "Pickles", "Butterball", "Trots"]);
                break;
        }
        return (CollectionsKt.random(arrayList, Random.INSTANCE) as string);
    }
    getAdditionalDescription(): string {
        return Utils.Strings.INSTANCE.formatWithPerWeek(ExtensionsKt.numberDisplayString$default(this.getMaintenanceCost(), false, 1, null)) + "\n";
    }
    getRandomDeathReason(): string {
        let arrayList: ArrayList = new ArrayList();
        CollectionsKt.addAll(arrayList, [Utils.INSTANCE.getString(R.string.Pet_DeathReasonGeneral_Overfed), Utils.INSTANCE.getString(R.string.Pet_DeathReasonGeneral_Disease), Utils.INSTANCE.getString(R.string.Pet_DeathReasonGeneral_ForgotToFeedIt), Utils.INSTANCE.getString(R.string.Pet_DeathReasonGeneral_Depressed)]);
        switch (this) {
            case Pet.dog:
                CollectionsKt.addAll(arrayList, [Utils.INSTANCE.getString(R.string.Pet_DeathReasonCatDog_Roadkill), Utils.INSTANCE.getString(R.string.Pet_DeathReasonCatDog_Suffocate), Utils.INSTANCE.getString(R.string.Pet_DeathReasonCatDog_Freezer)]);
                break;
            case Pet.cat:
                CollectionsKt.addAll(arrayList, [Utils.INSTANCE.getString(R.string.Pet_DeathReasonCatDog_Roadkill), Utils.INSTANCE.getString(R.string.Pet_DeathReasonCatDog_Suffocate), Utils.INSTANCE.getString(R.string.Pet_DeathReasonCatDog_Freezer), Utils.INSTANCE.getString(R.string.Pet_DeathReasonCat_Brawl)]);
                break;
            case Pet.guineaPig:
                CollectionsKt.addAll(arrayList, [Utils.INSTANCE.getString(R.string.Pet_DeathReasonGuinea_Exhaustion)]);
                break;
            case Pet.fish:
                CollectionsKt.addAll(arrayList, [Utils.INSTANCE.getString(R.string.Pet_DeathReasonFish_DroppedBleach), Utils.INSTANCE.getString(R.string.Pet_DeathReasonFish_BrokenAirPump), Utils.INSTANCE.getString(R.string.Pet_DeathReasonFish_TankOfHeater), Utils.INSTANCE.getString(R.string.Pet_DeathReasonFish_FoodDisposal), Utils.INSTANCE.getString(R.string.Pet_DeathReasonFish_DownTheToilet)]);
                break;
            case Pet.parrot:
                CollectionsKt.addAll(arrayList, [Utils.INSTANCE.getString(R.string.Pet_DeathReasonBird_FlewIntoAWindow), Utils.INSTANCE.getString(R.string.Pet_DeathReasonBird_FlewIntoAPowerLine)]);
                break;
            case Pet.duck:
            case Pet.turkey:
                CollectionsKt.addAll(arrayList, [Utils.INSTANCE.getString(R.string.Pet_DeathReasonDuck_Drown), Utils.INSTANCE.getString(R.string.Pet_DeathReasonDuck_LayingEgg)]);
                break;
        }
        return (CollectionsKt.random(arrayList, Random.INSTANCE) as string);
    }
    action(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        let adoptPet$default: Person = FamilyState.adoptPet$default(player.getFamilyState(), this, null, 2, null);
        Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal());
        AlertManager.INSTANCE.showPetAdoptedAlert(adoptPet$default);
    }
}
export namespace Pet {
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
        getAllPurchasable(): Pet[] {
        return [Pet.fish, Pet.parrot, Pet.guineaPig, Pet.duck, Pet.cat, Pet.dog];
    }
    }
}
Pet.INSTANCE = new Pet.Companion(null);
