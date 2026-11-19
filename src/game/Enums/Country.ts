// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, NoWhenBranchMatchedException, R } from "../runtime";
import { CompletableAction } from "./CompletableAction";
import { Currency } from "./Currency";
import { Diet } from "./Diet";
import { Job } from "./Job";
import { Leisure } from "./Leisure";
import { Utils } from "../Utils/Utils";
import { COUNTRY_BY_ID, CountryDef, NEW_COUNTRY_DEFS } from "../World/WorldData";

export class Country extends JEnum {
    static readonly unitedStates: Country = new Country("unitedStates", 0);
    static readonly canada: Country = new Country("canada", 1);
    static readonly japan: Country = new Country("japan", 2);
    static readonly france: Country = new Country("france", 3);
    static readonly spain: Country = new Country("spain", 4);
    static readonly uk: Country = new Country("uk", 5);
    static readonly china: Country = new Country("china", 6);
    static values(): Country[] { return [Country.unitedStates, Country.canada, Country.japan, Country.france, Country.spain, Country.uk, Country.china, ...NEW_COUNTRIES]; }
    /** v0.27.0: the World data for this country (all 37 have one). */
    def(): CountryDef { return COUNTRY_BY_ID[this.name()]; }
    isNew(): boolean { return !this.def()?.original; }
    static valueOf(n: string): Country { return (Country as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getTitle(): string {
        switch (this) {
            case Country.unitedStates:
                return Utils.INSTANCE.getString(R.string.Country_UnitedStates);
            case Country.canada:
                return Utils.INSTANCE.getString(R.string.Country_Canada);
            case Country.japan:
                return Utils.INSTANCE.getString(R.string.Country_Japan);
            case Country.france:
                return Utils.INSTANCE.getString(R.string.Country_France);
            case Country.spain:
                return Utils.INSTANCE.getString(R.string.Country_Spain);
            case Country.uk:
                return Utils.INSTANCE.getString(R.string.Country_UK);
            case Country.china:
                return Utils.INSTANCE.getString(R.string.Country_China);
            default:
                if (this.def()) return this.def().name;
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case Country.unitedStates:
                return R.drawable.flag_unitedstates;
            case Country.canada:
                return R.drawable.flag_canada;
            case Country.japan:
                return R.drawable.flag_japan;
            case Country.france:
                return R.drawable.flag_france;
            case Country.spain:
                return R.drawable.flag_spain;
            case Country.uk:
                return R.drawable.flag_uk;
            case Country.china:
                return R.drawable.flag_china;
            default:
                if (this.def()) return (R.drawable as any)["flag_" + this.name().toLowerCase()];
                throw new NoWhenBranchMatchedException();
        }
    }
    getLegalDrinkingAge(): number {
        switch (this) {
            case Country.unitedStates:
                return 21;
            case Country.canada:
            case Country.france:
            case Country.uk:
            case Country.china:
                return 18;
            case Country.japan:
                return 20;
            case Country.spain:
                return 16;
            default:
                if (this.def()) return this.def().drink;
                throw new NoWhenBranchMatchedException();
        }
    }
    getDietOptions(): Diet[] {
        switch (this) {
            case Country.unitedStates:
                return [Diet.scavenge, Diet.cupnoodle, Diet.fastfood, Diet.basic, Diet.balanced, Diet.vegan];
            case Country.canada:
                return [Diet.scavenge, Diet.cupnoodle, Diet.poutine, Diet.maplePancakes, Diet.balanced, Diet.vegan];
            case Country.japan:
                return [Diet.scavenge, Diet.onigri, Diet.ramen, Diet.balanced, Diet.sushi];
            case Country.france:
                return [Diet.scavenge, Diet.baguette, Diet.quiche, Diet.escargot, Diet.vegan];
            case Country.spain:
                return [Diet.scavenge, Diet.cupnoodle, Diet.churro, Diet.croquette, Diet.chorizo, Diet.paella];
            case Country.uk:
                return [Diet.scavenge, Diet.cupnoodle, Diet.fastfood, Diet.fullEnglish, Diet.fishAndChips, Diet.tikkaMasala];
            case Country.china:
                return [Diet.scavenge, Diet.cupnoodle, Diet.fastfood, Diet.noodles, Diet.hotpot, Diet.seafood];
            default:
                if (this.def()) return this.def().diets.map((d) => (Diet as any)[d]).filter((d: any) => d != null);
                throw new NoWhenBranchMatchedException();
        }
    }
    getUnlockedByDefault(): boolean {
        let i: Country = this;
        return (i === Country.unitedStates) || (i === Country.canada) || this.isNew();
    }
    getLeisureOptions(): Leisure[] {
        switch (this) {
            case Country.unitedStates:
                return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.grab_drinks, Leisure.goCamping, Leisure.goToConcert, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa];
            case Country.canada:
                return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.grab_drinks, Leisure.ski, Leisure.goToConcert, Leisure.iceHockey, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa];
            case Country.japan:
                return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.watchAnime, Leisure.izakaya, Leisure.goCamping, Leisure.jpopConcert, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa];
            case Country.france:
                return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.grab_drinks, Leisure.goCamping, Leisure.goToConcert, Leisure.watchOpera, Leisure.watchSoccer, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa];
            case Country.spain:
                return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.grab_drinks, Leisure.goCamping, Leisure.flamingoShow, Leisure.bullfightingShow, Leisure.watchSoccer, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa];
            case Country.uk:
                return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.pub, Leisure.goCamping, Leisure.watchSoccer, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa];
            case Country.china:
                return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.grab_drinks, Leisure.pingpong, Leisure.badminton, Leisure.watchSoccer, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa];
            default: {
                const d = this.def();
                if (!d) throw new NoWhenBranchMatchedException();
                const out = [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, d.id === "ireland" || d.id === "australia" || d.id === "newZealand" ? Leisure.pub : Leisure.grab_drinks];
                if (d.climate !== "desert") out.push(Leisure.goCamping);
                out.push(Leisure.goToConcert);
                if (d.ski) out.push(Leisure.ski);
                if (d.climate === "cold" && d.id !== "iceland") out.push(Leisure.iceHockey);
                if (d.id !== "southKorea" && d.id !== "india" && d.id !== "newZealand") out.push(Leisure.watchSoccer);
                out.push(Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa);
                return out;
            }
        }
    }
    getUnskilledJobOptions(): Job[] {
        switch (this) {
            case Country.unitedStates:
                return [Job.burgerFlipper];
            case Country.canada:
                return [Job.barista];
            case Country.japan:
                return [Job.sushiChef];
            case Country.france:
                return [Job.pastryChef, Job.tourGuide];
            case Country.spain:
                return [Job.sommelier, Job.tourGuide];
            case Country.uk:
                return [Job.royalGuard];
            case Country.china:
                return [Job.constructionWorker];
            default:
                if (this.def()) return this.def().jobs.map((j) => (Job as any)[j]).filter((j: any) => j != null);
                throw new NoWhenBranchMatchedException();
        }
    }
    getAdditionalJobOptions(): Job[] {
        return (this !== Country.japan) ? new Array(0).fill(null) : [Job.animeArtist];
    }
    getCurrency(): Currency {
        switch (this) {
            case Country.unitedStates:
                return Currency.dollar;
            case Country.canada:
                return Currency.dollar;
            case Country.japan:
                return Currency.yen;
            case Country.france:
                return Currency.euro;
            case Country.spain:
                return Currency.euro;
            case Country.uk:
                return Currency.pound;
            case Country.china:
                return Currency.yuan;
            default:
                if (this.def()) return (Currency as any)[this.def().currency];
                throw new NoWhenBranchMatchedException();
        }
    }
    getRequiredLanguage(): CompletableAction {
        switch (this) {
            case Country.unitedStates:
            case Country.canada:
            case Country.uk:
                return null;
            case Country.japan:
                return CompletableAction.japanese;
            case Country.france:
                return CompletableAction.french;
            case Country.spain:
                return CompletableAction.spanish;
            case Country.china:
                return CompletableAction.chinese;
            default:
                if (this.def()) return this.def().lang ? (CompletableAction as any)[this.def().lang] : null;
                throw new NoWhenBranchMatchedException();
        }
    }
}

/** v0.27.0 "The World Update": 30 new countries (data in World/WorldData.ts). */
export const NEW_COUNTRIES: Country[] = [];
NEW_COUNTRY_DEFS.forEach((d, i) => { const c = new Country(d.id, 7 + i); (Country as any)[d.id] = c; NEW_COUNTRIES.push(c); });
