// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { BigInteger, Double, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R } from "../runtime";
import { ActionDescriptor } from "./ActionDescriptor";
import { CompletableAction } from "./CompletableAction";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";

export class Diet extends JEnum implements ActionDescriptor {
    static readonly scavenge: Diet = new Diet("scavenge", 0);
    static readonly cupnoodle: Diet = new Diet("cupnoodle", 1);
    static readonly fastfood: Diet = new Diet("fastfood", 2);
    static readonly basic: Diet = new Diet("basic", 3);
    static readonly balanced: Diet = new Diet("balanced", 4);
    static readonly vegan: Diet = new Diet("vegan", 5);
    static readonly homeCooking: Diet = new Diet("homeCooking", 6);
    static readonly prisonFood: Diet = new Diet("prisonFood", 7);
    static readonly maplePancakes: Diet = new Diet("maplePancakes", 8);
    static readonly poutine: Diet = new Diet("poutine", 9);
    static readonly onigri: Diet = new Diet("onigri", 10);
    static readonly ramen: Diet = new Diet("ramen", 11);
    static readonly sushi: Diet = new Diet("sushi", 12);
    static readonly baguette: Diet = new Diet("baguette", 13);
    static readonly quiche: Diet = new Diet("quiche", 14);
    static readonly escargot: Diet = new Diet("escargot", 15);
    static readonly churro: Diet = new Diet("churro", 16);
    static readonly croquette: Diet = new Diet("croquette", 17);
    static readonly chorizo: Diet = new Diet("chorizo", 18);
    static readonly paella: Diet = new Diet("paella", 19);
    static readonly fullEnglish: Diet = new Diet("fullEnglish", 20);
    static readonly fishAndChips: Diet = new Diet("fishAndChips", 21);
    static readonly tikkaMasala: Diet = new Diet("tikkaMasala", 22);
    static readonly noodles: Diet = new Diet("noodles", 23);
    static readonly hotpot: Diet = new Diet("hotpot", 24);
    static readonly seafood: Diet = new Diet("seafood", 25);
    static values(): Diet[] { return [Diet.scavenge, Diet.cupnoodle, Diet.fastfood, Diet.basic, Diet.balanced, Diet.vegan, Diet.homeCooking, Diet.prisonFood, Diet.maplePancakes, Diet.poutine, Diet.onigri, Diet.ramen, Diet.sushi, Diet.baguette, Diet.quiche, Diet.escargot, Diet.churro, Diet.croquette, Diet.chorizo, Diet.paella, Diet.fullEnglish, Diet.fishAndChips, Diet.tikkaMasala, Diet.noodles, Diet.hotpot, Diet.seafood]; }
    static valueOf(n: string): Diet { return (Diet as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
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
        Intrinsics.checkParameterIsNotNull(player, "player");
        return ActionDescriptor.DefaultImpls.requirementNotMetString(this, player);
    }
    getTitle(): string {
        switch (this) {
            case Diet.scavenge:
                return Utils.INSTANCE.getString(R.string.Diet_Scavenge);
            case Diet.cupnoodle:
                return Utils.INSTANCE.getString(R.string.Diet_CupNoodle);
            case Diet.fastfood:
                return Utils.INSTANCE.getString(R.string.Diet_FastFood);
            case Diet.basic:
                return Utils.INSTANCE.getString(R.string.Diet_BasicDiet);
            case Diet.balanced:
                return Utils.INSTANCE.getString(R.string.Diet_BalancedDiet);
            case Diet.vegan:
                return Utils.INSTANCE.getString(R.string.Diet_VeganDiet);
            case Diet.homeCooking:
                return Utils.INSTANCE.getString(R.string.Diet_HomeCooking);
            case Diet.prisonFood:
                return Utils.INSTANCE.getString(R.string.Diet_PrisonFood);
            case Diet.maplePancakes:
                return Utils.INSTANCE.getString(R.string.Diet_MaplePancakes);
            case Diet.poutine:
                return Utils.INSTANCE.getString(R.string.Diet_Poutine);
            case Diet.onigri:
                return Utils.INSTANCE.getString(R.string.Diet_Onigri);
            case Diet.ramen:
                return Utils.INSTANCE.getString(R.string.Diet_Ramen);
            case Diet.sushi:
                return Utils.INSTANCE.getString(R.string.Diet_Sushi);
            case Diet.baguette:
                return Utils.INSTANCE.getString(R.string.Diet_Quiche);
            case Diet.quiche:
                return Utils.INSTANCE.getString(R.string.Diet_Escargot);
            case Diet.escargot:
                return Utils.INSTANCE.getString(R.string.Diet_Baguette);
            case Diet.churro:
                return Utils.INSTANCE.getString(R.string.Diet_Churros);
            case Diet.croquette:
                return Utils.INSTANCE.getString(R.string.Diet_Croquettes);
            case Diet.chorizo:
                return Utils.INSTANCE.getString(R.string.Diet_Chorizo);
            case Diet.paella:
                return Utils.INSTANCE.getString(R.string.Diet_Paella);
            case Diet.fullEnglish:
                return Utils.INSTANCE.getString(R.string.Diet_FullEnglish);
            case Diet.fishAndChips:
                return Utils.INSTANCE.getString(R.string.Diet_FishAndChips);
            case Diet.tikkaMasala:
                return Utils.INSTANCE.getString(R.string.Diet_TikkaMasala);
            case Diet.noodles:
                return Utils.INSTANCE.getString(R.string.Diet_Noodles);
            case Diet.hotpot:
                return Utils.INSTANCE.getString(R.string.Diet_Hotpot);
            case Diet.seafood:
                return Utils.INSTANCE.getString(R.string.Diet_Seafood);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case Diet.scavenge:
                return R.drawable.diet_scavenge;
            case Diet.cupnoodle:
                return R.drawable.diet_cupnoodles;
            case Diet.fastfood:
                return R.drawable.diet_fastfood;
            case Diet.basic:
                return R.drawable.diet_basic;
            case Diet.balanced:
            case Diet.homeCooking:
            case Diet.fullEnglish:
                return R.drawable.diet_balanced;
            case Diet.vegan:
                return R.drawable.diet_vegan;
            case Diet.prisonFood:
                return R.drawable.diet_prisonfood;
            case Diet.maplePancakes:
                return R.drawable.diet_maplepancakes;
            case Diet.poutine:
                return R.drawable.diet_poutine;
            case Diet.onigri:
                return R.drawable.diet_onigiri;
            case Diet.ramen:
                return R.drawable.diet_ramen;
            case Diet.sushi:
                return R.drawable.diet_sushi;
            case Diet.baguette:
                return R.drawable.diet_baguette;
            case Diet.quiche:
                return R.drawable.diet_quiche;
            case Diet.escargot:
                return R.drawable.diet_escargot;
            case Diet.churro:
                return R.drawable.diet_churros;
            case Diet.croquette:
                return R.drawable.diet_croquette;
            case Diet.chorizo:
                return R.drawable.diet_chorizo;
            case Diet.paella:
                return R.drawable.diet_paella;
            case Diet.fishAndChips:
                return R.drawable.diet_fishnchips;
            case Diet.tikkaMasala:
                return R.drawable.diet_tikkamasala;
            case Diet.noodles:
                return R.drawable.noodles;
            case Diet.hotpot:
                return R.drawable.diet_hotpot;
            case Diet.seafood:
                return R.drawable.diet_seafood;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getCost(): BigInteger {
        let i: number = 800;
        switch (this) {
            case Diet.scavenge:
            case Diet.homeCooking:
            case Diet.prisonFood:
                i = 0;
                break;
            case Diet.cupnoodle:
                i = 25;
                break;
            case Diet.fastfood:
            case Diet.poutine:
            case Diet.onigri:
            case Diet.baguette:
                i = 100;
                break;
            case Diet.basic:
            case Diet.maplePancakes:
            case Diet.ramen:
            case Diet.quiche:
            case Diet.fullEnglish:
                i = 250;
                break;
            case Diet.balanced:
            case Diet.escargot:
                i = 500;
                break;
            case Diet.vegan:
            case Diet.sushi:
                i = 1000;
                break;
            case Diet.churro:
                i = 75;
                break;
            case Diet.croquette:
                i = 200;
                break;
            case Diet.chorizo:
                i = 400;
                break;
            case Diet.paella:
            case Diet.tikkaMasala:
                break;
            case Diet.fishAndChips:
                i = 350;
                break;
            case Diet.noodles:
                i = 120;
                break;
            case Diet.hotpot:
                i = 300;
                break;
            case Diet.seafood:
                i = 1500;
                break;
            default:
                throw new NoWhenBranchMatchedException();
        }
        if (GameStateManager.INSTANCE.getPersonState().getCompletableActionState().isCompleted(CompletableAction.frugalShopper) && this.isHomeCooked()) {
            let d: number = i;
            Double.isNaN(d);
            i = JMath.toInt((d * 0.5));
        }
        if (GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.frugal)) {
            let d2: number = i;
            let frugalDietPriceModifier: number = Trait.INSTANCE.getFrugalDietPriceModifier();
            Double.isNaN(d2);
            i = JMath.toInt((d2 * frugalDietPriceModifier));
        }
        let valueOf: BigInteger = BigInteger.valueOf(i);
        return valueOf;
    }
    isHomeCooked(): boolean {
        let i: Diet = this;
        return ((i === Diet.basic) || (i === Diet.balanced)) || (i === Diet.vegan);
    }
    getAdditionalDescription(): string {
        return Utils.Strings.INSTANCE.formatWithPerWeek(ExtensionsKt.numberDisplayString$default(this.getCost(), false, 1, null)) + "\n";
    }
    getActionTitle(): string {
        return Utils.INSTANCE.getString(R.string.Common_Eat);
    }
    getModifiers(): Modifiers {
        let d: number = 1.5;
        switch (this) {
            case Diet.scavenge:
                d = -1.0;
                break;
            case Diet.cupnoodle:
                d = -0.5;
                break;
            case Diet.fastfood:
                d = -0.2;
                break;
            case Diet.basic:
            case Diet.homeCooking:
            case Diet.quiche:
            case Diet.fullEnglish:
                d = 0.5;
                break;
            case Diet.balanced:
            case Diet.ramen:
            case Diet.fishAndChips:
                d = 1.0;
                break;
            case Diet.vegan:
                d = 2.0;
                break;
            case Diet.prisonFood:
            case Diet.poutine:
                d = -0.3;
                break;
            case Diet.maplePancakes:
                d = 0.75;
                break;
            case Diet.onigri:
                d = 0.2;
                break;
            case Diet.sushi:
            case Diet.seafood:
                d = 3.0;
                break;
            case Diet.baguette:
                d = 0.0;
                break;
            case Diet.escargot:
            case Diet.chorizo:
                d = 1.2;
                break;
            case Diet.churro:
                d = 0.1;
                break;
            case Diet.croquette:
                d = 0.6;
                break;
            case Diet.paella:
                d = 2.5;
                break;
            case Diet.tikkaMasala:
            case Diet.hotpot:
                break;
            case Diet.noodles:
                d = 0.7;
                break;
        }
        if (GameStateManager.INSTANCE.getPersonState().getCompletableActionState().isCompleted(CompletableAction.nutritionScience) && this.isHomeCooked()) {
            d += 0.5;
        }
        return Modifiers.INSTANCE.modifierWithHealth(d);
    }
    action(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        player.changeDiet(this);
        Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal());
    }
}
