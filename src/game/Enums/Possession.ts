// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Arrays, BigInteger, Double, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, StringBuilder, StringCompanionObject } from "../runtime";
import { ActionDescriptor } from "./ActionDescriptor";
import { GameStateManager } from "../Managers/GameStateManager";
import { ItemState } from "../Managers/ItemState";
import { Leisure } from "./Leisure";
import { Modifiers } from "../Managers/Modifiers";
import { Player } from "../Managers/Player";
import { SideHustle } from "./SideHustle";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";

export class Possession extends JEnum implements ActionDescriptor {
    static readonly gameConsole: Possession = new Possession("gameConsole", 0);
    static readonly campingEquipment: Possession = new Possession("campingEquipment", 1);
    static readonly gun: Possession = new Possession("gun", 2);
    static readonly passport: Possession = new Possession("passport", 3);
    static readonly laptop: Possession = new Possession("laptop", 4);
    static readonly turntable: Possession = new Possession("turntable", 5);
    static readonly videoEquipment: Possession = new Possession("videoEquipment", 6);
    static readonly car: Possession = new Possession("car", 7);
    static readonly privateJet: Possession = new Possession("privateJet", 8);
    static readonly yacht: Possession = new Possession("yacht", 9);
    static readonly rocket: Possession = new Possession("rocket", 10);
    static values(): Possession[] { return [Possession.gameConsole, Possession.campingEquipment, Possession.gun, Possession.passport, Possession.laptop, Possession.turntable, Possession.videoEquipment, Possession.car, Possession.privateJet, Possession.yacht, Possession.rocket]; }
    static valueOf(n: string): Possession { return (Possession as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getImageId(): number {
        return 0;
    }
    getActionTitle(): string {
        return ActionDescriptor.DefaultImpls.getActionTitle(this);
    }
    getAgeRange(): ValueRange {
        return ActionDescriptor.DefaultImpls.getAgeRange(this);
    }
    getModifiers(): Modifiers {
        return ActionDescriptor.DefaultImpls.getModifiers(this);
    }
    getRequiredItem(): Possession {
        return ActionDescriptor.DefaultImpls.getRequiredItem(this);
    }
    overrideCost(metadata: any): BigInteger {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        return ActionDescriptor.DefaultImpls.overrideCost(this, metadata);
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
            case Possession.gameConsole:
                return Utils.INSTANCE.getString(R.string.Possession_GameConsole);
            case Possession.campingEquipment:
                return Utils.INSTANCE.getString(R.string.Possession_CampingEquipment);
            case Possession.car:
                return Utils.INSTANCE.getString(R.string.Possession_Car);
            case Possession.privateJet:
                return Utils.INSTANCE.getString(R.string.Possession_PrivateJet);
            case Possession.yacht:
                return Utils.INSTANCE.getString(R.string.Possession_Yacht);
            case Possession.rocket:
                return Utils.INSTANCE.getString(R.string.Possession_Rocket);
            case Possession.passport:
                return Utils.INSTANCE.getString(R.string.Possession_Passport);
            case Possession.videoEquipment:
                return Utils.INSTANCE.getString(R.string.Item_VideoEquipment);
            case Possession.turntable:
                return Utils.INSTANCE.getString(R.string.Item_TurnTable);
            case Possession.laptop:
                return Utils.INSTANCE.getString(R.string.Item_Laptop);
            case Possession.gun:
                return Utils.INSTANCE.getString(R.string.Item_Gun);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    isAvaliable(): boolean {
        return this !== Possession.gun;
    }
    overrideImageId(metadata: any): number {
        Intrinsics.checkParameterIsNotNull(metadata, "metadata");
        let intValue: number = (metadata).intValue();
        switch (this) {
            case Possession.gameConsole:
                return R.drawable.vacation_videogames;
            case Possession.campingEquipment:
                return R.drawable.possesion_campingtent;
            case Possession.car:
                if ((intValue === 0) || (intValue === 1)) {
                    return R.drawable.possession_car;
                }
                if (intValue === 2) {
                    return R.drawable.possesion_nicecar;
                }
                break;
            case Possession.privateJet:
                return R.drawable.possession_jet;
            case Possession.yacht:
                return R.drawable.possession_yacht;
            case Possession.rocket:
                return R.drawable.possession_rocket;
            case Possession.passport:
                return R.drawable.possesion_passport;
            case Possession.videoEquipment:
                if (intValue < 3) {
                    return R.drawable.possesion_recordingequipment_1;
                }
                if (intValue < 7) {
                    return R.drawable.possesion_recordingequipment_2;
                }
                if (intValue <= 10) {
                    return R.drawable.possesion_recordingequipment_3;
                }
                break;
            case Possession.turntable:
                if (intValue < 3) {
                    return R.drawable.possession_turntable_1;
                }
                if (intValue < 7) {
                    return R.drawable.sidehustle_dj;
                }
                if (intValue <= 10) {
                    return R.drawable.possession_turntable_3;
                }
                break;
            case Possession.laptop:
                if (intValue < 3) {
                    return R.drawable.possesion_computer_1;
                }
                if (intValue < 7) {
                    return R.drawable.possession_computer_2;
                }
                if (intValue <= 10) {
                    return R.drawable.possession_computer_3;
                }
                break;
            case Possession.gun:
                return R.drawable.possession_gun;
        }
        return 0;
    }
    getCost(): BigInteger {
        return this.costForLevel(GameStateManager.INSTANCE.getPersonState().getItemState().getState(this).getLevel());
    }
    costForLevel(level: number): BigInteger {
        let i: number = 5000;
        switch (this) {
            case Possession.gameConsole:
                i = 500;
                break;
            case Possession.campingEquipment:
                i = 2000;
                break;
            case Possession.car:
                i = 30000;
                break;
            case Possession.privateJet:
                i = 30000000;
                break;
            case Possession.yacht:
                i = 100000000;
                break;
            case Possession.rocket:
                i = 2000000000;
                break;
            case Possession.passport:
            case Possession.turntable:
                i = 10000;
                break;
            case Possession.videoEquipment:
                i = 25000;
                break;
            case Possession.laptop:
            case Possession.gun:
                break;
            default:
                i = 0;
                break;
        }
        if ((this === Possession.car) && (level === 2)) {
            let valueOf: BigInteger = BigInteger.valueOf(250000);
            return valueOf;
        }
        if (this.getMaxLevel() > 1) {
            let pow: number = Math.pow(2.0, level - 1);
            let d: number = i;
            Double.isNaN(d);
            i = JMath.toInt((pow * d));
        }
        let valueOf2: BigInteger = BigInteger.valueOf(i);
        return valueOf2;
    }
    getCanBeSold(): boolean {
        let i: Possession = this;
        return (((i === Possession.car) || (i === Possession.privateJet)) || (i === Possession.yacht)) || (i === Possession.rocket);
    }
    getItemBoostModifier(): number {
        let i: Possession = this;
        if (i === Possession.laptop) {
            return 0.25;
        }
        if (i !== Possession.turntable) {
            return (i !== Possession.videoEquipment) ? 0.0 : 0.5;
        }
        return 0.3;
    }
    getRelevantSideHustle(): SideHustle[] {
        let i: Possession = this;
        if (i === Possession.laptop) {
            return [SideHustle.appDeveloper, SideHustle.author];
        }
        if (i === Possession.turntable) {
            return [SideHustle.DJ];
        }
        if (i !== Possession.videoEquipment) {
            return null;
        }
        return [SideHustle.youTubeStar, SideHustle.actor];
    }
    getAdditionalDescription(): string {
        let state: ItemState.SingleItemState = GameStateManager.INSTANCE.getPersonState().getItemState().getState(this);
        switch (this) {
            case Possession.gameConsole:
                return Utils.INSTANCE.getString(R.string.Possession_GameConsole_Description);
            case Possession.campingEquipment:
                return Utils.INSTANCE.getString(R.string.Possession_CampingEquipment_Description);
            case Possession.car:
                let sb: StringBuilder = new StringBuilder();
                if (state.getLevel() > 0) {
                    sb.append((Utils.INSTANCE.getString(R.string.Common_Level) + ": ") + state.getLevel());
                    sb.append("\n");
                    if (state.getLevel() !== state.getType().getMaxLevel()) {
                        sb.append(Utils.INSTANCE.getString(R.string.Common_NextLevel) + ": ");
                    }
                }
                if (state.getLevel() === 0) {
                    let stringCompanionObject = StringCompanionObject.INSTANCE;
                    let string: string = Utils.INSTANCE.getString(R.string.Possession_Car_Description);
                    let objArr = [Leisure.local_vacation.getTitle()];
                    let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
                    sb.append(format);
                } else if (state.getLevel() >= 1) {
                    sb.append(Utils.INSTANCE.getString(R.string.Possession_LuxuryCar_Description));
                }
                return sb.toString();
            case Possession.privateJet:
                let stringCompanionObject2 = StringCompanionObject.INSTANCE;
                let string2: string = Utils.INSTANCE.getString(R.string.Possession_PrivateJet_Description);
                let objArr2 = [Leisure.international_vacation.getTitle()];
                let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
                return format2;
            case Possession.yacht:
                let stringCompanionObject3 = StringCompanionObject.INSTANCE;
                let string3: string = Utils.INSTANCE.getString(R.string.Possession_Yacht_Description);
                let objArr3 = [Leisure.luxury_vacation.getTitle()];
                let format3: string = String.format(string3, Arrays.copyOf(objArr3, objArr3.length));
                return format3;
            case Possession.rocket:
                return Utils.INSTANCE.getString(R.string.Possession_Rocket_Description);
            case Possession.passport:
                return Utils.INSTANCE.getString(R.string.Possession_Passport_Description);
            case Possession.gun:
                return Utils.INSTANCE.getString(R.string.Possession_Gun_Description);
            case Possession.turntable:
            case Possession.laptop:
            case Possession.videoEquipment:
                let relevantSideHustle: SideHustle[] = this.getRelevantSideHustle();
                if ((relevantSideHustle == null) || (state.getLevel() <= 0)) {
                    return null;
                }
                let sb2: StringBuilder = new StringBuilder();
                sb2.append((Utils.INSTANCE.getString(R.string.Common_Level) + ": ") + state.getLevel());
                sb2.append("\n");
                if (state.getLevel() < state.getType().getMaxLevel()) {
                    let sb3: StringBuilder = new StringBuilder();
                    sb3.append(Utils.INSTANCE.getString(R.string.Common_NextLevel));
                    sb3.append(": +");
                    let itemBoostModifier: number = this.getItemBoostModifier();
                    let d: number = 100;
                    Double.isNaN(d);
                    sb3.append(JMath.toInt((itemBoostModifier * d)));
                    sb3.append("% ");
                    sb2.append(sb3.toString());
                    let length: number = relevantSideHustle.length;
                    for (let i = 0; i < length; i++) {
                        let sideHustle: SideHustle = relevantSideHustle[i];
                        if (i === 0) {
                            sb2.append(sideHustle.getProjectName());
                        } else {
                            sb2.append("/" + sideHustle.getProjectName());
                        }
                    }
                    sb2.append(" " + Utils.INSTANCE.getString(R.string.Common_Revenue));
                }
                return sb2.toString();
            default:
                return null;
        }
    }
    getMaxLevel(): number {
        let i: Possession = this;
        if (((i === Possession.laptop) || (i === Possession.videoEquipment)) || (i === Possession.turntable)) {
            return 10;
        }
        return (i !== Possession.car) ? 1 : 2;
    }
    action(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        player.buyItem(this);
    }
}
