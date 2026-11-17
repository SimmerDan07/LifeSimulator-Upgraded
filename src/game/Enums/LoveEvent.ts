// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, BigInteger, CollectionsKt, Double, Intrinsics, JEnum, JMath, NoWhenBranchMatchedException, R, StringBuilder } from "../runtime";
import { ActionDescriptor } from "./ActionDescriptor";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { Person } from "../Managers/Person";
import { Player } from "../Managers/Player";
import { Possession } from "./Possession";
import { RelationshipProgressStatus } from "./RelationshipProgressStatus";
import { RomanticRelationshipStatus } from "./RomanticRelationshipStatus";
import { Trait } from "./Trait";
import { Utils } from "../Utils/Utils";
import { ValueRange } from "../Utils/ValueRange";

export class LoveEvent extends JEnum implements ActionDescriptor {
    static readonly swipeRight: LoveEvent = new LoveEvent("swipeRight", 0);
    static readonly nightClub: LoveEvent = new LoveEvent("nightClub", 1);
    static readonly localEvent: LoveEvent = new LoveEvent("localEvent", 2);
    static readonly romanticDinner: LoveEvent = new LoveEvent("romanticDinner", 3);
    static readonly propose: LoveEvent = new LoveEvent("propose", 4);
    static readonly watchMovie: LoveEvent = new LoveEvent("watchMovie", 5);
    static readonly watchPlay: LoveEvent = new LoveEvent("watchPlay", 6);
    static readonly museum: LoveEvent = new LoveEvent("museum", 7);
    static readonly marry: LoveEvent = new LoveEvent("marry", 8);
    static readonly breakUp: LoveEvent = new LoveEvent("breakUp", 9);
    static readonly divorce: LoveEvent = new LoveEvent("divorce", 10);
    static readonly makeBaby: LoveEvent = new LoveEvent("makeBaby", 11);
    static readonly adoptBaby: LoveEvent = new LoveEvent("adoptBaby", 12);
    static readonly attendFuneral: LoveEvent = new LoveEvent("attendFuneral", 13);
    static readonly abortChild: LoveEvent = new LoveEvent("abortChild", 14);
    static values(): LoveEvent[] { return [LoveEvent.swipeRight, LoveEvent.nightClub, LoveEvent.localEvent, LoveEvent.romanticDinner, LoveEvent.propose, LoveEvent.watchMovie, LoveEvent.watchPlay, LoveEvent.museum, LoveEvent.marry, LoveEvent.breakUp, LoveEvent.divorce, LoveEvent.makeBaby, LoveEvent.adoptBaby, LoveEvent.attendFuneral, LoveEvent.abortChild]; }
    static valueOf(n: string): LoveEvent { return (LoveEvent as any)[n]; }
    static INSTANCE: any;
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getActionTitle(): string {
        return ActionDescriptor.DefaultImpls.getActionTitle(this);
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
            case LoveEvent.swipeRight:
                return Utils.INSTANCE.getString(R.string.Love_Action_SwipeRight);
            case LoveEvent.nightClub:
                return Utils.INSTANCE.getString(R.string.Love_Action_NightClub);
            case LoveEvent.localEvent:
                return Utils.INSTANCE.getString(R.string.Love_Action_LocalEvent);
            case LoveEvent.romanticDinner:
                return Utils.INSTANCE.getString(R.string.Love_Action_RomanticDinner);
            case LoveEvent.propose:
                return Utils.INSTANCE.getString(R.string.Love_Action_Propose);
            case LoveEvent.watchMovie:
                return Utils.INSTANCE.getString(R.string.Love_Action_WatchMovie);
            case LoveEvent.watchPlay:
                return Utils.INSTANCE.getString(R.string.Love_Action_WatchPlay);
            case LoveEvent.museum:
                return Utils.INSTANCE.getString(R.string.Love_Action_GoToMuseum);
            case LoveEvent.marry:
                return Utils.INSTANCE.getString(R.string.Love_Action_Marry);
            case LoveEvent.breakUp:
                return Utils.INSTANCE.getString(R.string.Love_Action_Breakup);
            case LoveEvent.divorce:
                return Utils.INSTANCE.getString(R.string.Love_Action_Divorce);
            case LoveEvent.makeBaby:
                return Utils.INSTANCE.getString(R.string.Love_Action_MakeBaby);
            case LoveEvent.adoptBaby:
                return Utils.INSTANCE.getString(R.string.LoveEvent_AdoptBaby);
            case LoveEvent.attendFuneral:
                return Utils.INSTANCE.getString(R.string.Love_Action_AttendFuneral);
            case LoveEvent.abortChild:
                return Utils.INSTANCE.getString(R.string.Love_Action_Abortion);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getImageId(): number {
        switch (this) {
            case LoveEvent.swipeRight:
                return R.drawable.love_tinder_date;
            case LoveEvent.nightClub:
                return R.drawable.love_nightclub;
            case LoveEvent.localEvent:
                return R.drawable.love_go_to_local_event;
            case LoveEvent.romanticDinner:
                return R.drawable.love_romantic_dinner;
            case LoveEvent.propose:
                return R.drawable.love_propose;
            case LoveEvent.watchMovie:
                return R.drawable.love_movie;
            case LoveEvent.watchPlay:
                return R.drawable.love_play;
            case LoveEvent.museum:
                return R.drawable.love_museum;
            case LoveEvent.marry:
                return R.drawable.love_marry;
            case LoveEvent.breakUp:
            case LoveEvent.divorce:
                return R.drawable.love_breakup;
            case LoveEvent.makeBaby:
                return R.drawable.love_baby;
            case LoveEvent.adoptBaby:
                return R.drawable.love_adopt;
            case LoveEvent.attendFuneral:
                return R.drawable.love_funeral;
            case LoveEvent.abortChild:
                return R.drawable.love_abortion;
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getCost(): BigInteger {
        let i: number = 100;
        switch (this) {
            case LoveEvent.swipeRight:
                i = 50;
                break;
            case LoveEvent.nightClub:
            case LoveEvent.watchMovie:
                break;
            case LoveEvent.localEvent:
                i = 200;
                break;
            case LoveEvent.romanticDinner:
                i = 500;
                break;
            case LoveEvent.propose:
                i = 30000;
                break;
            case LoveEvent.watchPlay:
                i = 2000;
                break;
            case LoveEvent.museum:
                i = 250;
                break;
            case LoveEvent.marry:
                i = 100000;
                break;
            case LoveEvent.breakUp:
            case LoveEvent.makeBaby:
            case LoveEvent.attendFuneral:
                i = 0;
                break;
            case LoveEvent.divorce:
                i = 10000;
                break;
            case LoveEvent.adoptBaby:
                i = 50000;
                break;
            case LoveEvent.abortChild:
                i = 1000;
                break;
        }
        let valueOf: BigInteger = BigInteger.valueOf(i);
        return valueOf;
    }
    getDateprogressValue(): number {
        let i: LoveEvent = this;
        if (i === LoveEvent.romanticDinner) {
            return 15;
        }
        if (i === LoveEvent.watchMovie) {
            return 8;
        }
        if (i !== LoveEvent.watchPlay) {
            return (i !== LoveEvent.museum) ? 0 : 10;
        }
        return 20;
    }
    isBreakupEvent(): boolean {
        let i: LoveEvent = this;
        return (i === LoveEvent.divorce) || (i === LoveEvent.breakUp);
    }
    getModifiers(): Modifiers {
        switch (this) {
            case LoveEvent.swipeRight:
                return new Modifiers(0.0, 0.0, 0.0);
            case LoveEvent.nightClub:
                return new Modifiers(0.0, 0.0, 0.0);
            case LoveEvent.localEvent:
                return new Modifiers(0.0, 0.0, 0.0);
            case LoveEvent.romanticDinner:
                return new Modifiers(0.0, 5.0, 2.0);
            case LoveEvent.propose:
                return new Modifiers(0.0, 30.0, 0.0);
            case LoveEvent.watchMovie:
                return new Modifiers(0.0, 3.0, 2.0);
            case LoveEvent.watchPlay:
                return new Modifiers(0.0, 3.0, 8.0);
            case LoveEvent.museum:
                return new Modifiers(0.0, 4.0, 4.0);
            case LoveEvent.marry:
                return new Modifiers(0.0, 50.0, 0.0);
            case LoveEvent.breakUp:
                return new Modifiers(0.0, -20.0, -20.0);
            case LoveEvent.divorce:
                return new Modifiers(0.0, -40.0, -40.0);
            case LoveEvent.makeBaby:
                return new Modifiers(0.0, 20.0, 0.0);
            case LoveEvent.adoptBaby:
                return new Modifiers(0.0, 0.0, 0.0);
            case LoveEvent.attendFuneral:
                return new Modifiers(0.0, -20.0, 10.0);
            case LoveEvent.abortChild:
                return new Modifiers(-20.0, 0.0, 0.0);
            default:
                throw new NoWhenBranchMatchedException();
        }
    }
    getAgeRange(): ValueRange {
        let i: LoveEvent = this;
        if (i === LoveEvent.swipeRight) {
            return ValueRange.INSTANCE.getWithMinAge(16);
        }
        if (i === LoveEvent.nightClub) {
            return ValueRange.INSTANCE.getWithMinAge(18);
        }
        if (i === LoveEvent.localEvent) {
            return ValueRange.INSTANCE.getWithMinAge(21);
        }
        if ((i === LoveEvent.propose) || (i === LoveEvent.marry)) {
            return ValueRange.INSTANCE.getWithMinAge(18);
        }
        return null;
    }
    getAdditionalDescription(): string {
        if (this === LoveEvent.marry) {
            return Utils.INSTANCE.getString(R.string.Love_Status_Marry_Subtitle) + "\n";
        }
        if (this.getChanceOfFindingDate() > 0.0) {
            let sb: StringBuilder = new StringBuilder();
            let chanceOfFindingDate: number = this.getChanceOfFindingDate();
            let d: number = 100;
            Double.isNaN(d);
            sb.append(JMath.toInt((chanceOfFindingDate * d)));
            sb.append("% ");
            sb.append(Utils.INSTANCE.getString(R.string.Love_Action_ChangeOfMeet));
            return sb.toString();
        }
        if (this.getDateprogressValue() <= 0) {
            return null;
        }
        return ((("+" + this.getDateprogressValue()) + " ") + Utils.INSTANCE.getString(R.string.Common_RelationshipLower)) + "\n";
    }
    getChanceOfFindingDate(): number {
        let i: LoveEvent = this;
        let d: number = (i !== LoveEvent.swipeRight) ? ((i !== LoveEvent.localEvent) ? ((i !== LoveEvent.nightClub) ? 0.0 : 0.12) : 0.25) : 0.05;
        if (GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.sexy)) {
            let d2: number = 2;
            Double.isNaN(d2);
            d *= d2;
        }
        return GameStateManager.INSTANCE.getPersonState().hasTrait(Trait.buttUgly) ? (d * 0.5) : d;
    }
    getRequiredRelationshipStatus(): RelationshipProgressStatus {
        let i: LoveEvent = this;
        if (i === LoveEvent.propose) {
            return RelationshipProgressStatus.good;
        }
        if (i !== LoveEvent.marry) {
            return null;
        }
        return RelationshipProgressStatus.close;
    }
    action(player: Player): void {
        Intrinsics.checkParameterIsNotNull(player, "player");
        player.loveEvent(this);
    }
}
export namespace LoveEvent {
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
        eventsForPlayer(player: Player): ArrayList<LoveEvent> {
        Intrinsics.checkParameterIsNotNull(player, "player");
        if (player.getCrimeState().getIsInJail()) {
            return new ArrayList();
        }
        let arrayList: ArrayList<LoveEvent> = new ArrayList();
        let arrayListOf: ArrayList = CollectionsKt.arrayListOf(LoveEvent.watchMovie, LoveEvent.museum, LoveEvent.romanticDinner, LoveEvent.watchPlay);
        let arrayList2: ArrayList = new ArrayList();
        let partner: Person = player.getFamilyState().getPartner();
        if ((player.getSex().getCorrespondingGender() === ((partner != null) ? partner.getGender() : null)) || player.hasTrait(Trait.infertile)) {
            arrayList2.add(LoveEvent.adoptBaby);
        }
        arrayList2.add(LoveEvent.makeBaby);
        if (player.getFamilyState().getPregnantChild() != null) {
            arrayList2.add(LoveEvent.abortChild);
        }
        let i: RomanticRelationshipStatus = player.getRomanticRelationshipStatus();
        if (i === RomanticRelationshipStatus.single) {
            CollectionsKt.addAll(arrayList, [LoveEvent.swipeRight, LoveEvent.nightClub, LoveEvent.localEvent]);
        } else if (i === RomanticRelationshipStatus.inRelationship) {
            arrayList.add(LoveEvent.propose);
            arrayList.addAll(arrayListOf);
            arrayList.add(LoveEvent.breakUp);
        } else if (i === RomanticRelationshipStatus.engaged) {
            arrayList.add(LoveEvent.marry);
            arrayList.addAll(arrayListOf);
            arrayList.addAll(arrayList2);
            arrayList.add(LoveEvent.breakUp);
        } else if (i === RomanticRelationshipStatus.married) {
            arrayList.addAll(arrayListOf);
            arrayList.addAll(arrayList2);
            arrayList.add(LoveEvent.divorce);
        } else if (i === RomanticRelationshipStatus.widowed) {
            arrayList.add(LoveEvent.attendFuneral);
        }
        return arrayList;
    }
    }
}
LoveEvent.INSTANCE = new LoveEvent.Companion(null);
