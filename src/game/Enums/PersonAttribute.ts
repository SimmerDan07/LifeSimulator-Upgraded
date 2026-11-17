// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArraysKt, JEnum, NoWhenBranchMatchedException, R, Random } from "../runtime";
import { Utils } from "../Utils/Utils";

export class PersonAttribute extends JEnum {
    static readonly health: PersonAttribute = new PersonAttribute("health", 0);
    static readonly happiness: PersonAttribute = new PersonAttribute("happiness", 1);
    static readonly sanity: PersonAttribute = new PersonAttribute("sanity", 2);
    static values(): PersonAttribute[] { return [PersonAttribute.health, PersonAttribute.happiness, PersonAttribute.sanity]; }
    static valueOf(n: string): PersonAttribute { return (PersonAttribute as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getColorId(): number {
        let i: PersonAttribute = this;
        if (i === PersonAttribute.health) {
            return R.color.flatRed;
        }
        if (i === PersonAttribute.happiness) {
            return R.color.flatYellow;
        }
        if (i === PersonAttribute.sanity) {
            return R.color.flatPink;
        }
        throw new NoWhenBranchMatchedException();
    }
    getFontAwesomeCharacter(): string {
        let i: PersonAttribute = this;
        if (i === PersonAttribute.health) {
            return Utils.INSTANCE.getString(R.string.fa_heart_solid);
        }
        if (i === PersonAttribute.happiness) {
            return Utils.INSTANCE.getString(R.string.fa_smile_solid);
        }
        if (i === PersonAttribute.sanity) {
            return Utils.INSTANCE.getString(R.string.fa_brain_solid);
        }
        throw new NoWhenBranchMatchedException();
    }
    getTitle(): string {
        let i: PersonAttribute = this;
        if (i === PersonAttribute.health) {
            return Utils.INSTANCE.getString(R.string.Common_Attribute_Health);
        }
        if (i === PersonAttribute.happiness) {
            return Utils.INSTANCE.getString(R.string.Common_Attribute_Happiness);
        }
        if (i === PersonAttribute.sanity) {
            return Utils.INSTANCE.getString(R.string.Common_Attribute_Sanity);
        }
        throw new NoWhenBranchMatchedException();
    }
    getLowAttributeMessage(): string {
        let i: PersonAttribute = this;
        if (i === PersonAttribute.health) {
            return Utils.INSTANCE.getString(R.string.Alert_LowAttributeMessage_Health);
        }
        if (i === PersonAttribute.happiness) {
            return Utils.INSTANCE.getString(R.string.Alert_LowAttributeMessage_Happiness);
        }
        if (i === PersonAttribute.sanity) {
            return Utils.INSTANCE.getString(R.string.Alert_LowAttributeMessage_Sanity);
        }
        throw new NoWhenBranchMatchedException();
    }
    getLowAttributeImageId(): number {
        let i: PersonAttribute = this;
        if (i === PersonAttribute.health) {
            return R.drawable.health_low;
        }
        if (i === PersonAttribute.happiness) {
            return R.drawable.happiness_low;
        }
        if (i === PersonAttribute.sanity) {
            return R.drawable.sanity_low;
        }
        throw new NoWhenBranchMatchedException();
    }
    getHelpText(): string {
        let i: PersonAttribute = this;
        if (i === PersonAttribute.health) {
            return Utils.INSTANCE.getString(R.string.HelpPage_Attribute_Health);
        }
        if (i === PersonAttribute.happiness) {
            return Utils.INSTANCE.getString(R.string.HelpPage_Attribute_Happiness);
        }
        if (i === PersonAttribute.sanity) {
            return Utils.INSTANCE.getString(R.string.HelpPage_Attribute_Sanity);
        }
        throw new NoWhenBranchMatchedException();
    }
    getDeathMessage(): string {
        let i: PersonAttribute = this;
        if (i === PersonAttribute.health) {
            return (ArraysKt.random([Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health1), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health2), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health3), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health4), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health5), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health6), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health7), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health8), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health9), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Health10)], Random.INSTANCE) as string);
        }
        if (i === PersonAttribute.happiness) {
            return (ArraysKt.random([Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness1), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness2), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness3), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness4), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness5), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness6), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness7), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness8), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness9), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Happiness10)], Random.INSTANCE) as string);
        }
        if (i === PersonAttribute.sanity) {
            return (ArraysKt.random([Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity1), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity2), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity3), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity4), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity5), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity6), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity7), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity8), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity9), Utils.INSTANCE.getString(R.string.Alert_DeathMessage_Sanity10)], Random.INSTANCE) as string);
        }
        throw new NoWhenBranchMatchedException();
    }
}
