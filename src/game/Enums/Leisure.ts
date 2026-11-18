// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Arrays, BigInteger, Double, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, StringCompanionObject } from "../runtime";
import { ActionDescriptor } from "./ActionDescriptor";
import { Country } from "./Country";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { Perk } from "./Perk";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";
import { Vampire } from "../Lifepaths/Vampire";

export class Leisure extends JEnum implements ActionDescriptor {
    static readonly take_week_off: Leisure = new Leisure("take_week_off", 0);
    static readonly goToPark: Leisure = new Leisure("goToPark", 1);
    static readonly playGames: Leisure = new Leisure("playGames", 2);
    static readonly grab_drinks: Leisure = new Leisure("grab_drinks", 3);
    static readonly goToConcert: Leisure = new Leisure("goToConcert", 4);
    static readonly goCamping: Leisure = new Leisure("goCamping", 5);
    static readonly local_vacation: Leisure = new Leisure("local_vacation", 6);
    static readonly international_vacation: Leisure = new Leisure("international_vacation", 7);
    static readonly luxury_vacation: Leisure = new Leisure("luxury_vacation", 8);
    static readonly spa: Leisure = new Leisure("spa", 9);
    static readonly smokeCigarette: Leisure = new Leisure("smokeCigarette", 10);
    static readonly prisonRiot: Leisure = new Leisure("prisonRiot", 11);
    static readonly stareAtWall: Leisure = new Leisure("stareAtWall", 12);
    static readonly prisonEscape: Leisure = new Leisure("prisonEscape", 13);
    static readonly ski: Leisure = new Leisure("ski", 14);
    static readonly iceHockey: Leisure = new Leisure("iceHockey", 15);
    static readonly jpopConcert: Leisure = new Leisure("jpopConcert", 16);
    static readonly izakaya: Leisure = new Leisure("izakaya", 17);
    static readonly watchAnime: Leisure = new Leisure("watchAnime", 18);
    static readonly watchOpera: Leisure = new Leisure("watchOpera", 19);
    static readonly watchSoccer: Leisure = new Leisure("watchSoccer", 20);
    static readonly flamingoShow: Leisure = new Leisure("flamingoShow", 21);
    static readonly bullfightingShow: Leisure = new Leisure("bullfightingShow", 22);
    static readonly pub: Leisure = new Leisure("pub", 23);
    static readonly pingpong: Leisure = new Leisure("pingpong", 24);
    static readonly badminton: Leisure = new Leisure("badminton", 25);
    static readonly travelToJapan: Leisure = new Leisure("travelToJapan", 26);
    static readonly travelToCanada: Leisure = new Leisure("travelToCanada", 27);
    static readonly travelToUnitedStates: Leisure = new Leisure("travelToUnitedStates", 28);
    static readonly travelToFrance: Leisure = new Leisure("travelToFrance", 29);
    static readonly travelToSpain: Leisure = new Leisure("travelToSpain", 30);
    static readonly travelToUK: Leisure = new Leisure("travelToUK", 31);
    static readonly travelToChina: Leisure = new Leisure("travelToChina", 32);
    static values(): Leisure[] { return [Leisure.take_week_off, Leisure.goToPark, Leisure.playGames, Leisure.grab_drinks, Leisure.goToConcert, Leisure.goCamping, Leisure.local_vacation, Leisure.international_vacation, Leisure.luxury_vacation, Leisure.spa, Leisure.smokeCigarette, Leisure.prisonRiot, Leisure.stareAtWall, Leisure.prisonEscape, Leisure.ski, Leisure.iceHockey, Leisure.jpopConcert, Leisure.izakaya, Leisure.watchAnime, Leisure.watchOpera, Leisure.watchSoccer, Leisure.flamingoShow, Leisure.bullfightingShow, Leisure.pub, Leisure.pingpong, Leisure.badminton, Leisure.travelToJapan, Leisure.travelToCanada, Leisure.travelToUnitedStates, Leisure.travelToFrance, Leisure.travelToSpain, Leisure.travelToUK, Leisure.travelToChina]; }
    static valueOf(n: string): Leisure { return (Leisure as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getActionTitle(): string {
        return ActionDescriptor.DefaultImpls.getActionTitle(this);
    }
    getAdditionalDescription(): string {
        // v0.15.0: daylight burns vampires
        const sun = Vampire.leisureNote(this);
        if (sun) return sun + (ActionDescriptor.DefaultImpls.getAdditionalDescription(this) ?? "");
        return ActionDescriptor.DefaultImpls.getAdditionalDescription(this);
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
            case Leisure.take_week_off:
                return Utils.INSTANCE.getString(R.string.Vacation_TakeWeekOff);
            case Leisure.goToPark:
                return Utils.INSTANCE.getString(R.string.Vacation_Park);
            case Leisure.playGames:
                return Utils.INSTANCE.getString(R.string.Vacation_VideoGames);
            case Leisure.grab_drinks:
                return Utils.INSTANCE.getString(R.string.Vacation_GrabDrinks);
            case Leisure.goToConcert:
                return Utils.INSTANCE.getString(R.string.Vacation_Concert);
            case Leisure.goCamping:
                return Utils.INSTANCE.getString(R.string.Vacation_Camping);
            case Leisure.local_vacation:
                return Utils.INSTANCE.getString(R.string.Vacation_LocalVacation);
            case Leisure.international_vacation:
                return Utils.INSTANCE.getString(R.string.Vacation_InternationalVacation);
            case Leisure.luxury_vacation:
                return Utils.INSTANCE.getString(R.string.Vacation_LuxuryVacation);
            case Leisure.spa:
                return Utils.INSTANCE.getString(R.string.Vacation_Spa);
            case Leisure.smokeCigarette:
                return Utils.INSTANCE.getString(R.string.Vacation_Prison_Smoke);
            case Leisure.prisonRiot:
                return Utils.INSTANCE.getString(R.string.Vacation_Prison_PrisonRiot);
            case Leisure.stareAtWall:
                return Utils.INSTANCE.getString(R.string.Vacation_Prison_StareAtWall);
            case Leisure.prisonEscape:
                return Utils.INSTANCE.getString(R.string.Vacation_Prison_EscapeAttempt);
            case Leisure.ski:
                return Utils.INSTANCE.getString(R.string.Vacation_Ski);
            case Leisure.iceHockey:
                return Utils.INSTANCE.getString(R.string.Vacation_IceHockey);
            case Leisure.jpopConcert:
                return Utils.INSTANCE.getString(R.string.Vacation_JpopConcert);
            case Leisure.izakaya:
                return Utils.INSTANCE.getString(R.string.Vacation_Izakaya);
            case Leisure.watchAnime:
                return Utils.INSTANCE.getString(R.string.Vacation_WatchAnime);
            case Leisure.watchOpera:
                return Utils.INSTANCE.getString(R.string.Vacation_WatchOpera);
            case Leisure.watchSoccer:
                return Utils.INSTANCE.getString(R.string.Vacation_WatchSoccer);
            case Leisure.flamingoShow:
                return Utils.INSTANCE.getString(R.string.Vacation_FlamingoShow);
            case Leisure.bullfightingShow:
                return Utils.INSTANCE.getString(R.string.Vacation_Bullfighting);
            case Leisure.pub:
                return Utils.INSTANCE.getString(R.string.Vacation_VisitPub);
            case Leisure.pingpong:
                return Utils.INSTANCE.getString(R.string.Vacation_PlayPingPong);
            case Leisure.badminton:
                return Utils.INSTANCE.getString(R.string.Vacation_PlayBadminton);
            case Leisure.travelToJapan:
            case Leisure.travelToCanada:
            case Leisure.travelToUnitedStates:
            case Leisure.travelToFrance:
            case Leisure.travelToSpain:
            case Leisure.travelToUK:
            case Leisure.travelToChina:
                let stringCompanionObject = StringCompanionObject.INSTANCE;
                let string: string = Utils.INSTANCE.getString(R.string.Vacation_MoveToCountry);
                let objArr = new Array(1).fill(null);
                let travelCountry: Country = this.getTravelCountry();
                objArr[0] = (travelCountry != null) ? travelCountry.getTitle() : null;
                let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                return format;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getCost(): BigInteger {
        let i: number = 800;
        switch (this) {
            case Leisure.take_week_off:
            case Leisure.prisonRiot:
            case Leisure.stareAtWall:
            case Leisure.prisonEscape:
                i = 0;
                break;
            case Leisure.goToPark:
            case Leisure.smokeCigarette:
                i = 25;
                break;
            case Leisure.playGames:
                i = 50;
                break;
            case Leisure.grab_drinks:
            case Leisure.pub:
                i = 200;
                break;
            case Leisure.goToConcert:
            case Leisure.iceHockey:
            case Leisure.jpopConcert:
            case Leisure.watchSoccer:
                i = 1000;
                break;
            case Leisure.goCamping:
            case Leisure.watchOpera:
                i = 500;
                break;
            case Leisure.local_vacation:
                i = (Utils.INSTANCE.returnFirstIfTrue(GameStateManager.INSTANCE.getPersonState().getItemState().isOwned(Possession.car), 1000, 2000)).intValue();
                break;
            case Leisure.international_vacation:
                i = (Utils.INSTANCE.returnFirstIfTrue(GameStateManager.INSTANCE.getPersonState().getItemState().isOwned(Possession.privateJet), 2500, 5000)).intValue();
                break;
            case Leisure.luxury_vacation:
                i = (Utils.INSTANCE.returnFirstIfTrue(GameStateManager.INSTANCE.getPersonState().getItemState().isOwned(Possession.yacht), 4000, 20000)).intValue();
                break;
            case Leisure.spa:
                i = 50000;
                break;
            case Leisure.ski:
            case Leisure.pingpong:
                i = 600;
                break;
            case Leisure.izakaya:
                i = 250;
                break;
            case Leisure.watchAnime:
                i = 100;
                break;
            case Leisure.flamingoShow:
            case Leisure.badminton:
                break;
            case Leisure.bullfightingShow:
                i = 2000;
                break;
            case Leisure.travelToJapan:
            case Leisure.travelToCanada:
            case Leisure.travelToUnitedStates:
            case Leisure.travelToFrance:
            case Leisure.travelToSpain:
            case Leisure.travelToUK:
            case Leisure.travelToChina:
                i = 100000;
                break;
        }
        if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.frugalTraveler)) {
            let d: number = i;
            let frugalTravelerDiscountModifier: number = Perk.INSTANCE.getFrugalTravelerDiscountModifier();
            Double.isNaN(d);
            i = JMath.toInt((d * frugalTravelerDiscountModifier));
        }
        let valueOf: BigInteger = BigInteger.valueOf(i);
        return valueOf;
    }
    getTravelCountry(): Country {
        switch (this) {
            case Leisure.travelToJapan:
                return Country.japan;
            case Leisure.travelToCanada:
                return Country.canada;
            case Leisure.travelToUnitedStates:
                return Country.unitedStates;
            case Leisure.travelToFrance:
                return Country.france;
            case Leisure.travelToSpain:
                return Country.spain;
            case Leisure.travelToUK:
                return Country.uk;
            case Leisure.travelToChina:
                return Country.china;
            default:
                return null;
        }
    }
    getModifiers(): Modifiers {
        let modifiers: Modifiers;
        let modifiers2: Modifiers = new Modifiers(0.0, 0.0, 0.0);
        switch (this) {
            case Leisure.take_week_off:
                modifiers = new Modifiers(0.0, 3.0, 3.0);
                break;
            case Leisure.goToPark:
                modifiers = new Modifiers(0.0, 5.0, 4.0);
                break;
            case Leisure.playGames:
                modifiers = new Modifiers(0.0, 10.0, 6.0);
                break;
            case Leisure.grab_drinks:
                modifiers = new Modifiers(0.0, 12.0, 10.0);
                break;
            case Leisure.goToConcert:
                modifiers = new Modifiers(0.0, 20.0, 15.0);
                break;
            case Leisure.goCamping:
                modifiers = new Modifiers(0.0, 10.0, 18.0);
                break;
            case Leisure.local_vacation:
                modifiers = new Modifiers(0.0, 30.0, 20.0);
                break;
            case Leisure.international_vacation:
                modifiers = new Modifiers(0.0, 50.0, 40.0);
                break;
            case Leisure.luxury_vacation:
                modifiers = new Modifiers(0.0, 70.0, 50.0);
                break;
            case Leisure.spa:
                modifiers = new Modifiers(0.0, 100.0, 100.0);
                break;
            case Leisure.smokeCigarette:
                modifiers = new Modifiers(0.0, 5.0, 0.0);
                break;
            case Leisure.prisonRiot:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case Leisure.stareAtWall:
                modifiers = new Modifiers(0.0, 0.0, -10.0);
                break;
            case Leisure.prisonEscape:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            case Leisure.ski:
                modifiers = new Modifiers(0.0, 15.0, 10.0);
                break;
            case Leisure.iceHockey:
                modifiers = new Modifiers(0.0, 25.0, 20.0);
                break;
            case Leisure.jpopConcert:
                modifiers = new Modifiers(0.0, 30.0, 20.0);
                break;
            case Leisure.izakaya:
                modifiers = new Modifiers(0.0, 15.0, 15.0);
                break;
            case Leisure.watchAnime:
                modifiers = new Modifiers(0.0, 12.0, 8.0);
                break;
            case Leisure.watchOpera:
                modifiers = new Modifiers(0.0, 15.0, 12.0);
                break;
            case Leisure.watchSoccer:
                modifiers = new Modifiers(0.0, 25.0, 20.0);
                break;
            case Leisure.flamingoShow:
                modifiers = new Modifiers(0.0, 20.0, 15.0);
                break;
            case Leisure.bullfightingShow:
                modifiers = new Modifiers(0.0, 35.0, 20.0);
                break;
            case Leisure.pub:
                modifiers = new Modifiers(0.0, 15.0, 10.0);
                break;
            case Leisure.pingpong:
                modifiers = new Modifiers(0.0, 20.0, 15.0);
                break;
            case Leisure.badminton:
                modifiers = new Modifiers(0.0, 25.0, 18.0);
                break;
            case Leisure.travelToJapan:
            case Leisure.travelToCanada:
            case Leisure.travelToUnitedStates:
            case Leisure.travelToFrance:
            case Leisure.travelToSpain:
            case Leisure.travelToUK:
            case Leisure.travelToChina:
                modifiers = new Modifiers(0.0, 0.0, 0.0);
                break;
            default:
                modifiers = modifiers2;
                break;
        }
        if (GameStateManager.INSTANCE.getPersonState().hasPerk(Perk.excitable)) {
            modifiers = new Modifiers(modifiers.getHealth(), modifiers.getHappiness() * Perk.INSTANCE.getExcitableHappinessBoost(), modifiers.getSanity());
        }
        return GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.adventurous) ? new Modifiers(modifiers.getHealth(), modifiers.getHappiness() * Trait.INSTANCE.getAdventurousVacationBoost(), modifiers.getSanity()) : modifiers;
    }
    getImageId(): number {
        switch (this) {
            case Leisure.take_week_off:
                return R.drawable.vacation_take_week_off;
            case Leisure.grab_drinks:
                return R.drawable.vacation_drinks;
            case Leisure.local_vacation:
                return R.drawable.vacation_local;
            case Leisure.international_vacation:
                return R.drawable.vacation_international;
            case Leisure.luxury_vacation:
                return R.drawable.vacation_luxury;
            case Leisure.goToPark:
                return R.drawable.vacation_park;
            case Leisure.playGames:
                return R.drawable.vacation_videogames;
            case Leisure.goToConcert:
                return R.drawable.vacation_concert;
            case Leisure.goCamping:
                return R.drawable.vacation_camping;
            case Leisure.spa:
                return R.drawable.vacation_spa;
            case Leisure.smokeCigarette:
                return R.drawable.leisure_prison_smoke;
            case Leisure.prisonRiot:
                return R.drawable.leisure_prison_startriot;
            case Leisure.stareAtWall:
                return R.drawable.leisure_prison_stareatwall;
            case Leisure.prisonEscape:
                return R.drawable.leisure_prison_escape;
            case Leisure.ski:
                return R.drawable.vacation_ski;
            case Leisure.iceHockey:
                return R.drawable.vacation_hockeymatch;
            case Leisure.jpopConcert:
                return R.drawable.vacation_jpopconcert;
            case Leisure.izakaya:
                return R.drawable.vacation_izakaya;
            case Leisure.watchAnime:
                return R.drawable.vacation_watchanime;
            case Leisure.watchOpera:
                return R.drawable.vacation_opera;
            case Leisure.watchSoccer:
                return R.drawable.vacation_soccer;
            case Leisure.travelToJapan:
            case Leisure.travelToCanada:
            case Leisure.travelToUnitedStates:
            case Leisure.travelToFrance:
            case Leisure.travelToSpain:
            case Leisure.travelToUK:
            case Leisure.travelToChina:
                let travelCountry: Country = this.getTravelCountry();
                if (travelCountry == null) {
                    Intrinsics.throwNpe();
                }
                return travelCountry.getImageId();
            case Leisure.flamingoShow:
                return R.drawable.vacation_flamingo;
            case Leisure.bullfightingShow:
                return R.drawable.vacation_bullfighting;
            case Leisure.pub:
                return R.drawable.vacation_pub;
            case Leisure.pingpong:
                return R.drawable.vacation_pingpong;
            case Leisure.badminton:
                return R.drawable.vacation_badminton;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getAgeRange(): ValueRange {
        let i: Leisure = this;
        if (((i === Leisure.grab_drinks) || (i === Leisure.izakaya)) || (i === Leisure.pub)) {
            return ValueRange.INSTANCE.getWithMinAge(GameStateManager.INSTANCE.getPersonState().getCountry().getLegalDrinkingAge());
        }
        return null;
    }
    getRequiredItem(): Possession {
        if ((this.getTravelCountry() != null) || (this === Leisure.spa)) {
            return Possession.passport;
        }
        let i: Leisure = this;
        if (i === Leisure.playGames) {
            return Possession.gameConsole;
        }
        if (i === Leisure.goCamping) {
            return Possession.campingEquipment;
        }
        if ((i === Leisure.international_vacation) || (i === Leisure.luxury_vacation)) {
            return Possession.passport;
        }
        return null;
    }
    action(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        player.leisureAction(this);
    }
}
export namespace Leisure {
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
        getJailEvent(): Leisure[] {
        return [Leisure.smokeCigarette, Leisure.stareAtWall, Leisure.prisonRiot, Leisure.prisonEscape];
    }
        getTravelEvents(): Leisure[] {
        return [Leisure.travelToJapan, Leisure.travelToCanada, Leisure.travelToUnitedStates, Leisure.travelToFrance, Leisure.travelToSpain, Leisure.travelToUK, Leisure.travelToChina];
    }
        getLeisureOptions(player: Player): Leisure[] {
        Intrinsics.checkParameterIsNotNull(player, "player");
        return player.getCountry().getLeisureOptions();
    }
    }
}
Leisure.INSTANCE = new Leisure.Companion(null);
