// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R, SpannableStringBuilder } from "../runtime";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Modifiers } from "../Managers/Modifiers";
import { Utils } from "../Utils/Utils";

export class Trait extends JEnum {
    static readonly cunning: Trait = new Trait("cunning", 0);
    static readonly strongImmuneSystem: Trait = new Trait("strongImmuneSystem", 1);
    static readonly sexy: Trait = new Trait("sexy", 2);
    static readonly frugal: Trait = new Trait("frugal", 3);
    static readonly confident: Trait = new Trait("confident", 4);
    static readonly adventurous: Trait = new Trait("adventurous", 5);
    static readonly intellectualCuriosity: Trait = new Trait("intellectualCuriosity", 6);
    static readonly optimistic: Trait = new Trait("optimistic", 7);
    static readonly evenTempered: Trait = new Trait("evenTempered", 8);
    static readonly logical: Trait = new Trait("logical", 9);
    static readonly creative: Trait = new Trait("creative", 10);
    static readonly humble: Trait = new Trait("humble", 11);
    static readonly charismatic: Trait = new Trait("charismatic", 12);
    static readonly persuasive: Trait = new Trait("persuasive", 13);
    static readonly articulate: Trait = new Trait("articulate", 14);
    static readonly entertainer: Trait = new Trait("entertainer", 15);
    static readonly clumsy: Trait = new Trait("clumsy", 16);
    static readonly sickly: Trait = new Trait("sickly", 17);
    static readonly buttUgly: Trait = new Trait("buttUgly", 18);
    static readonly unlucky: Trait = new Trait("unlucky", 19);
    static readonly pessimistic: Trait = new Trait("pessimistic", 20);
    static readonly lazy: Trait = new Trait("lazy", 21);
    static readonly stupid: Trait = new Trait("stupid", 22);
    static readonly closeMinded: Trait = new Trait("closeMinded", 23);
    static readonly apathetic: Trait = new Trait("apathetic", 24);
    static readonly highMaintenance: Trait = new Trait("highMaintenance", 25);
    static readonly shortTempered: Trait = new Trait("shortTempered", 26);
    static readonly infertile: Trait = new Trait("infertile", 27);
    static readonly crazy: Trait = new Trait("crazy", 28);
    static values(): Trait[] { return [Trait.cunning, Trait.strongImmuneSystem, Trait.sexy, Trait.frugal, Trait.confident, Trait.adventurous, Trait.intellectualCuriosity, Trait.optimistic, Trait.evenTempered, Trait.logical, Trait.creative, Trait.humble, Trait.charismatic, Trait.persuasive, Trait.articulate, Trait.entertainer, Trait.clumsy, Trait.sickly, Trait.buttUgly, Trait.unlucky, Trait.pessimistic, Trait.lazy, Trait.stupid, Trait.closeMinded, Trait.apathetic, Trait.highMaintenance, Trait.shortTempered, Trait.infertile, Trait.crazy]; }
    static valueOf(n: string): Trait { return (Trait as any)[n]; }
    static INSTANCE: any;
    static StrongImmuneSystemModifier: number;
    static OptimisticModifier: number;
    static EvenTemperedModifier: number;
    static PessimisticModifier: number;
    static BiopolarModifier: number;
    static CrazyModifier: number;
    static SicklyModifier: number;
    static ShortTemperedModifier: number;
    static AdventurousVacationBoost: number;
    static IntellectualCuriosityBoost: number;
    static chooseCareerIncomeBoost: number;
    static humblePromotionBoost: number;
    static lazyPromotionModifier: number;
    static stupidEducationModifier: number;
    static closeMindedSkillModifier: number;
    static highMaintenanceRentModifier: number;
    static persuasiveBusinessUpgradeCostModifier: number;
    static charismaticHiringCostCostModifier: number;
    static frugalDietPriceModifier: number;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    isPositiveTrait(): boolean {
        switch (this) {
            case Trait.cunning:
            case Trait.strongImmuneSystem:
            case Trait.sexy:
            case Trait.frugal:
            case Trait.confident:
            case Trait.adventurous:
            case Trait.intellectualCuriosity:
            case Trait.optimistic:
            case Trait.evenTempered:
            case Trait.logical:
            case Trait.creative:
            case Trait.humble:
            case Trait.charismatic:
            case Trait.persuasive:
            case Trait.articulate:
            case Trait.entertainer:
                return true;
            case Trait.clumsy:
            case Trait.sickly:
            case Trait.buttUgly:
            case Trait.unlucky:
            case Trait.pessimistic:
            case Trait.lazy:
            case Trait.stupid:
            case Trait.closeMinded:
            case Trait.apathetic:
            case Trait.highMaintenance:
            case Trait.shortTempered:
            case Trait.infertile:
            case Trait.crazy:
                return false;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getTitle(): string {
        switch (this) {
            case Trait.cunning:
                return Utils.INSTANCE.getString(R.string.TraitTitle_cunning);
            case Trait.strongImmuneSystem:
                return Utils.INSTANCE.getString(R.string.TraitTitle_strongImmuneSystem);
            case Trait.sexy:
                return Utils.INSTANCE.getString(R.string.TraitTitle_sexy);
            case Trait.frugal:
                return Utils.INSTANCE.getString(R.string.TraitTitle_frugal);
            case Trait.confident:
                return Utils.INSTANCE.getString(R.string.TraitTitle_confident);
            case Trait.adventurous:
                return Utils.INSTANCE.getString(R.string.TraitTitle_adventurous);
            case Trait.intellectualCuriosity:
                return Utils.INSTANCE.getString(R.string.TraitTitle_intellectualCuriosity);
            case Trait.optimistic:
                return Utils.INSTANCE.getString(R.string.TraitTitle_optimistic);
            case Trait.evenTempered:
                return Utils.INSTANCE.getString(R.string.TraitTitle_evenTempered);
            case Trait.logical:
                return Utils.INSTANCE.getString(R.string.TraitTitle_logical);
            case Trait.creative:
                return Utils.INSTANCE.getString(R.string.TraitTitle_creative);
            case Trait.humble:
                return Utils.INSTANCE.getString(R.string.TraitTitle_humble);
            case Trait.charismatic:
                return Utils.INSTANCE.getString(R.string.TraitTitle_charismatic);
            case Trait.persuasive:
                return Utils.INSTANCE.getString(R.string.TraitTitle_persuasive);
            case Trait.articulate:
                return Utils.INSTANCE.getString(R.string.TraitTitle_articulate);
            case Trait.entertainer:
                return Utils.INSTANCE.getString(R.string.TraitTitle_entertainer);
            case Trait.clumsy:
                return Utils.INSTANCE.getString(R.string.TraitTitle_clumsy);
            case Trait.sickly:
                return Utils.INSTANCE.getString(R.string.TraitTitle_sickly);
            case Trait.buttUgly:
                return Utils.INSTANCE.getString(R.string.TraitTitle_buttUgly);
            case Trait.unlucky:
                return Utils.INSTANCE.getString(R.string.TraitTitle_unlucky);
            case Trait.pessimistic:
                return Utils.INSTANCE.getString(R.string.TraitTitle_pessimistic);
            case Trait.lazy:
                return Utils.INSTANCE.getString(R.string.TraitTitle_lazy);
            case Trait.stupid:
                return Utils.INSTANCE.getString(R.string.TraitTitle_stupid);
            case Trait.closeMinded:
                return Utils.INSTANCE.getString(R.string.TraitTitle_closeMinded);
            case Trait.apathetic:
                return Utils.INSTANCE.getString(R.string.TraitTitle_apathetic);
            case Trait.highMaintenance:
                return Utils.INSTANCE.getString(R.string.TraitTitle_highMaintenance);
            case Trait.shortTempered:
                return Utils.INSTANCE.getString(R.string.TraitTitle_shortTempered);
            case Trait.infertile:
                return Utils.INSTANCE.getString(R.string.TraitTitle_infertile);
            case Trait.crazy:
                return Utils.INSTANCE.getString(R.string.TraitTitle_Crazy);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getOpposite(): Trait {
        switch (this) {
            case Trait.optimistic:
                return Trait.pessimistic;
            case Trait.pessimistic:
                return Trait.optimistic;
            case Trait.cunning:
                return Trait.clumsy;
            case Trait.clumsy:
                return Trait.cunning;
            case Trait.sexy:
                return Trait.buttUgly;
            case Trait.buttUgly:
                return Trait.sexy;
            case Trait.evenTempered:
                return Trait.shortTempered;
            case Trait.shortTempered:
                return Trait.evenTempered;
            case Trait.lazy:
                return Trait.humble;
            case Trait.humble:
                return Trait.lazy;
            case Trait.strongImmuneSystem:
                return Trait.sickly;
            case Trait.sickly:
                return Trait.strongImmuneSystem;
            case Trait.intellectualCuriosity:
                return Trait.stupid;
            case Trait.stupid:
                return Trait.intellectualCuriosity;
            default:
                return null;
        }
    }
    isMentalTrait(): boolean {
        switch (this) {
            case Trait.strongImmuneSystem:
            case Trait.sexy:
            case Trait.sickly:
            case Trait.buttUgly:
            case Trait.stupid:
            case Trait.infertile:
                return false;
            default:
                return true;
        }
    }
    getModifiers(): Modifiers {
        switch (this) {
            case Trait.optimistic:
                return Modifiers.INSTANCE.modifierWithHappiness(Trait.OptimisticModifier);
            case Trait.evenTempered:
                return Modifiers.INSTANCE.modifierWithSanity(Trait.EvenTemperedModifier);
            case Trait.pessimistic:
                return Modifiers.INSTANCE.modifierWithHappiness(Trait.PessimisticModifier);
            case Trait.shortTempered:
                return Modifiers.INSTANCE.modifierWithSanity(Trait.ShortTemperedModifier);
            case Trait.crazy:
                return Modifiers.INSTANCE.modifierWithSanity(Trait.CrazyModifier);
            case Trait.sickly:
                return Modifiers.INSTANCE.modifierWithHealth(Trait.SicklyModifier);
            case Trait.strongImmuneSystem:
                return Modifiers.INSTANCE.modifierWithHealth(Trait.StrongImmuneSystemModifier);
            default:
                return null;
        }
    }
    getDescription(): SpannableStringBuilder {
        let string: string;
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        switch (this) {
            case Trait.cunning:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_cunning);
                break;
            case Trait.sexy:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_sexy);
                break;
            case Trait.frugal:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_frugal);
                break;
            case Trait.confident:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_confident);
                break;
            case Trait.adventurous:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_adventurous);
                break;
            case Trait.intellectualCuriosity:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_intellectualCuriosity);
                break;
            case Trait.optimistic:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_optimistic);
                break;
            case Trait.logical:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_logical);
                break;
            case Trait.creative:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_creative);
                break;
            case Trait.humble:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_humble);
                break;
            case Trait.charismatic:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_charismatic);
                break;
            case Trait.persuasive:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_persuasive);
                break;
            case Trait.articulate:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_articulate);
                break;
            case Trait.entertainer:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_entertainer);
                break;
            case Trait.clumsy:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_clumsy);
                break;
            case Trait.buttUgly:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_buttUgly);
                break;
            case Trait.unlucky:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_unlucky);
                break;
            case Trait.lazy:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_lazy);
                break;
            case Trait.stupid:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_stupid);
                break;
            case Trait.closeMinded:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_closeMinded);
                break;
            case Trait.apathetic:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_apathetic);
                break;
            case Trait.highMaintenance:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_highMaintenance);
                break;
            case Trait.infertile:
                string = Utils.INSTANCE.getString(R.string.TraitDescription_infertile);
                break;
            default:
                string = "";
                break;
        }
        ExtensionsKt.appendNormal$default(spannableStringBuilder, string, null, null, null, 14, null);
        let modifiers: Modifiers = this.getModifiers();
        if (modifiers != null) {
            ExtensionsKt.appendNormal$default(ExtensionsKt.appendAttributesString$default(spannableStringBuilder, modifiers, null, null, null, 14, null), "/" + Utils.INSTANCE.getString(R.string.Common_Week), null, null, null, 14, null);
        }
        return spannableStringBuilder;
    }
}
export namespace Trait {
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
        getStrongImmuneSystemModifier(): number {
        return Trait.StrongImmuneSystemModifier;
    }
        getOptimisticModifier(): number {
        return Trait.OptimisticModifier;
    }
        getEvenTemperedModifier(): number {
        return Trait.EvenTemperedModifier;
    }
        getPessimisticModifier(): number {
        return Trait.PessimisticModifier;
    }
        getBiopolarModifier(): number {
        return Trait.BiopolarModifier;
    }
        getCrazyModifier(): number {
        return Trait.CrazyModifier;
    }
        getSicklyModifier(): number {
        return Trait.SicklyModifier;
    }
        getShortTemperedModifier(): number {
        return Trait.ShortTemperedModifier;
    }
        getAdventurousVacationBoost(): number {
        return Trait.AdventurousVacationBoost;
    }
        getIntellectualCuriosityBoost(): number {
        return Trait.IntellectualCuriosityBoost;
    }
        getChooseCareerIncomeBoost(): number {
        return Trait.chooseCareerIncomeBoost;
    }
        getHumblePromotionBoost(): number {
        return Trait.humblePromotionBoost;
    }
        getLazyPromotionModifier(): number {
        return Trait.lazyPromotionModifier;
    }
        getStupidEducationModifier(): number {
        return Trait.stupidEducationModifier;
    }
        getCloseMindedSkillModifier(): number {
        return Trait.closeMindedSkillModifier;
    }
        getHighMaintenanceRentModifier(): number {
        return Trait.highMaintenanceRentModifier;
    }
        getPersuasiveBusinessUpgradeCostModifier(): number {
        return Trait.persuasiveBusinessUpgradeCostModifier;
    }
        getCharismaticHiringCostCostModifier(): number {
        return Trait.charismaticHiringCostCostModifier;
    }
        getFrugalDietPriceModifier(): number {
        return Trait.frugalDietPriceModifier;
    }
        getAvailableTraits(): Trait[] {
        return [Trait.strongImmuneSystem, Trait.sexy, Trait.frugal, Trait.confident, Trait.adventurous, Trait.intellectualCuriosity, Trait.optimistic, Trait.evenTempered, Trait.logical, Trait.creative, Trait.humble, Trait.articulate, Trait.entertainer, Trait.sickly, Trait.buttUgly, Trait.unlucky, Trait.pessimistic, Trait.lazy, Trait.stupid, Trait.apathetic, Trait.highMaintenance, Trait.shortTempered, Trait.infertile, Trait.crazy, Trait.persuasive, Trait.charismatic];
    }
    }
}
Trait.INSTANCE = new Trait.Companion(null);
Trait.StrongImmuneSystemModifier = 0.5;
Trait.OptimisticModifier = 0.5;
Trait.EvenTemperedModifier = 0.5;
Trait.PessimisticModifier = -0.5;
Trait.BiopolarModifier = -1.0;
Trait.CrazyModifier = -2.0;
Trait.SicklyModifier = -1.0;
Trait.ShortTemperedModifier = -0.5;
Trait.AdventurousVacationBoost = 1.3;
Trait.IntellectualCuriosityBoost = 0.7;
Trait.chooseCareerIncomeBoost = 1.2;
Trait.humblePromotionBoost = 0.8;
Trait.lazyPromotionModifier = 1.2;
Trait.stupidEducationModifier = 1.25;
Trait.closeMindedSkillModifier = 2.0;
Trait.highMaintenanceRentModifier = 1.25;
Trait.persuasiveBusinessUpgradeCostModifier = 0.8;
Trait.charismaticHiringCostCostModifier = 0.8;
Trait.frugalDietPriceModifier = 0.7;
