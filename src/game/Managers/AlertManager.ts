// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { ArrayList, Arrays, ArraysKt, BigInteger, CollectionsKt, Function0, HashMap, Integer, Intrinsics, MapsKt, R, Ref, SpannableStringBuilder, StringBuilder, StringCompanionObject, StringsKt, TuplesKt, TypeCastException } from "../runtime";
import { UIBridge } from "../ui/bridge";
import { Achievement } from "../Enums/Achievement";
import { AchievementBadge } from "../Enums/AchievementBadge";
import { AdManager } from "./AdManager";
import { AdRewards } from "./AdRewards";
import { AgeGroup } from "../Enums/AgeGroup";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { AlertViewModel } from "./AlertViewModel";
import { BusinessAction } from "../Enums/BusinessAction";
import { BusinessState } from "./BusinessState";
import { CompletableAction } from "../Enums/CompletableAction";
import { Constants } from "../Utils/Constants";
import { DebugFlag } from "../Enums/DebugFlag";
import { EditableTextFieldViewModel } from "../Models/EditableTextFieldViewModel";
import { EventChoice } from "../Enums/EventChoice";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { FamilyState } from "./FamilyState";
import { GameStateManager } from "./GameStateManager";
import { GenericListFragment } from "../ui/bridge";
import { GenericListType } from "../Fragments/GenericListType";
import { Housing } from "../Enums/Housing";
import { IProbableEvent } from "../Enums/IProbableEvent";
import { InAppPurchaseManager } from "./InAppPurchaseManager";
import { Job } from "../Enums/Job";
import { JobState } from "./JobState";
import { LotteryOutcome } from "../Enums/LotteryOutcome";
import { LoveEvent } from "../Enums/LoveEvent";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { MainGameActivity } from "../ui/bridge";
import { MainGameFragment } from "../ui/bridge";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Person } from "./Person";
import { PersonAttribute } from "../Enums/PersonAttribute";
import { PersonInteraction } from "../Enums/PersonInteraction";
import { Pet } from "../Enums/Pet";
import { Player } from "./Player";
import { PregnancyOutcome } from "../Enums/PregnancyOutcome";
import { RandomEvent } from "../Enums/RandomEvent";
import { Relationship } from "../Enums/Relationship";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";
import { SideHustleState } from "./SideHustleState";
import { SocialBarItem } from "./SocialBarItem";
import { SoundEffect } from "./SoundEffect";
import { SoundManager } from "./SoundManager";
import { TelemetryManager } from "./TelemetryManager";
import { Trait } from "../Enums/Trait";
import { Utils } from "../Utils/Utils";

export class AlertManager {
    static INSTANCE: AlertManager = new AlertManager();
    static alertQueue: any = new ArrayList();
    static currentlyShowing: boolean = false;
    constructor() {

    }
    getAlertQueue(): any {
        return AlertManager.alertQueue;
    }
    setAlertQueue(linkedList: any): void {
        Intrinsics.checkParameterIsNotNull(linkedList, "<set-?>");
        AlertManager.alertQueue = linkedList;
    }
    getCurrentlyShowing(): boolean {
        return AlertManager.currentlyShowing;
    }
    setCurrentlyShowing(z: boolean): void {
        AlertManager.currentlyShowing = z;
    }
    static showAlert$default(alertManager: AlertManager, alertViewModel: AlertViewModel, z: boolean, i: number, obj: any): void {
        if ((i & 2) !== 0) {
            z = false;
        }
        alertManager.showAlert(alertViewModel, z);
    }
    showAlert$0(alertViewModel: AlertViewModel, prioritize: boolean): void {
        Intrinsics.checkParameterIsNotNull(alertViewModel, "alertViewModel");
        if (!AlertManager.currentlyShowing) {
            this.show(alertViewModel);
        } else if (prioritize) {
            AlertManager.alertQueue.addFirst(alertViewModel);
        } else {
            AlertManager.alertQueue.add(alertViewModel);
        }
    }
    showAlert$1(alertViewModel: AlertViewModel, onlyOn: GenericListType): void {
        Intrinsics.checkParameterIsNotNull(alertViewModel, "alertViewModel");
        Intrinsics.checkParameterIsNotNull(onlyOn, "onlyOn");
        let currentlyShowingGenericList: GenericListFragment = GameStateManager.INSTANCE.getCurrentlyShowingGenericList();
        if (((currentlyShowingGenericList != null) ? currentlyShowingGenericList.getListType() : null) !== onlyOn) {
            return;
        }
        AlertManager.showAlert$default(this, alertViewModel, false, 2, null);
    }
    showAlert(...a: any[]): any {
        if (a.length === 2 && (a[0] == null || a[0] instanceof AlertViewModel) && typeof a[1] === 'boolean') return (this as any).showAlert$0(...a);
        if (a.length === 2 && (a[0] == null || a[0] instanceof AlertViewModel) && (a[1] == null || a[1] instanceof GenericListType)) return (this as any).showAlert$1(...a);
        throw new Error('no overload for showAlert with ' + a.length + ' args');
    }
    show(alertViewModel: AlertViewModel): void {
        UIBridge.showAlert(alertViewModel);
        if (alertViewModel.getType() === AlertType.Alert) AlertManager.INSTANCE.setCurrentlyShowing(true);
        const imageId = alertViewModel.getImageId();
        if (imageId != null) {
            const t = alertViewModel.getTitle();
            const S = (k: string) => Utils.INSTANCE.getString(k);
            if (t === S("Alert_DeathTitle") || t === S("FamilyAlert_DeathTitle")) SoundManager.INSTANCE.playSound(SoundEffect.Bell);
            else if (t === S("Alert_TutorialComplete_Title")) SoundManager.INSTANCE.playSound(SoundEffect.Coin);
            else if (t === S("CrimeFailure_AlertTitle")) SoundManager.INSTANCE.playSound(SoundEffect.Siren);
            else if (t === S("BabyBornAlertTitle")) SoundManager.INSTANCE.playSound(SoundEffect.BabyCry);
            else if (t === S("Alert_MovedToCountry_Title")) SoundManager.INSTANCE.playSound(SoundEffect.Plane);
            else SoundManager.INSTANCE.playSound(SoundEffect.Important);
        }
    }
    showNextAlertIfNeeded(): void {
        if (AlertManager.currentlyShowing || (AlertManager.alertQueue.size() <= 0)) {
            return;
        }
        let alert: AlertViewModel = AlertManager.alertQueue.removeFirst();
        this.show(alert);
    }
    showConfirmationAlert(alert: AlertViewModel, action: Function0<any>): void {
        Intrinsics.checkParameterIsNotNull(alert, "alert");
        Intrinsics.checkParameterIsNotNull(action, "action");
        AlertManager.showAlert$default(this, new AlertViewModel(alert.getTitle(), alert.getMessage(), alert.getImageId(), null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_Yes), action), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_No), {
            invoke: () => {
        }
        }), null, null, 408, null), false, 2, null);
    }
    showAttributeLowAlertIfRequired(attribute: PersonAttribute, week: number): void {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        if (week <= 0) {
            return;
        }
        let weeksTillZeroAttributeDeath: number = Constants.Person.INSTANCE.getWeeksTillZeroAttributeDeath() - week;
        if ((weeksTillZeroAttributeDeath === 1) || (weeksTillZeroAttributeDeath === 5)) {
            let alertManager: AlertManager = AlertManager.INSTANCE;
            let str: string = (attribute.getTitle() + " ") + Utils.INSTANCE.getString(R.string.Alert_LowAttribute_Low);
            let stringCompanionObject = StringCompanionObject.INSTANCE;
            let lowAttributeMessage: string = attribute.getLowAttributeMessage();
            let objArr = [Integer.valueOf(weeksTillZeroAttributeDeath)];
            let format: string = String.format(lowAttributeMessage, Arrays.copyOf(objArr, objArr.length));
            AlertManager.showAlert$default(alertManager, new AlertViewModel(str, format, Integer.valueOf(attribute.getLowAttributeImageId()), null, null, null, null, null, null, 504, null), false, 2, null);
        }
    }
    showBankNoticeAlert(bankruptcyAmount: BigInteger, weeksLeft: number): void {
        Intrinsics.checkParameterIsNotNull(bankruptcyAmount, "bankruptcyAmount");
        let alertManager: AlertManager = AlertManager.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Alert_BankNoticeTitle);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_BankNoticeMessage);
        let objArr = [ExtensionsKt.numberDisplayString$default(bankruptcyAmount, false, 1, null), Integer.valueOf(weeksLeft)];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, R.drawable.bank_deposit, null, null, null, null, null, null, 504, null), false, 2, null);
    }
    showNewTraitAcquired(trait: Trait, fromSkill: CompletableAction): void {
        Intrinsics.checkParameterIsNotNull(trait, "trait");
        Intrinsics.checkParameterIsNotNull(fromSkill, "fromSkill");
        let alertManager: AlertManager = AlertManager.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Alert_NewTraitTitle);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_NewTraitDescription);
        let objArr = [trait.getTitle()];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, Integer.valueOf(fromSkill.getImageId()), null, null, null, null, null, null, 504, null), false, 2, null);
    }
    showBankruptAlert(): void {
        TelemetryManager.INSTANCE.logEvent("Death_Alert", MapsKt.mapOf(TuplesKt.to("Reason", "Bankruptcy")));
        let alertViewModel: AlertViewModel = new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_Bankrupt), Utils.INSTANCE.getString(R.string.Alert_BankruptMessage), R.drawable.bank_deposit, null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.DeathTombstoneLifeSummary), {
            invoke: () => {
            Utils.INSTANCE.navigateTo(GenericListType.gameSummary, Constants.ViewModel.INSTANCE.getTombstoneModeDeath(), false);
        }
        }), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_BankruptRevive), {
            invoke: () => {
            InAppPurchaseManager.INSTANCE.purchaseProduct(GameInAppPurchase.revive);
        }
        }), null, null, 408, null);
        GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().setHasGameStarted(false);
        GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().addLife(GameStateManager.INSTANCE.getPersonState());
        AlertManager.showAlert$default(this, alertViewModel, false, 2, null);
    }
    showDeathAlert(attribute: PersonAttribute): void {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        TelemetryManager.INSTANCE.logEvent("Death_Alert", MapsKt.mapOf(TuplesKt.to("Reason", attribute.getTitle())));
        if (GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) {
            let alertViewModel: AlertViewModel = new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_DeathTitle), attribute.getDeathMessage(), R.drawable.skull, null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.DeathTombstoneLifeSummary), {
                invoke: () => {
                Utils.INSTANCE.navigateTo(GenericListType.gameSummary, Constants.ViewModel.INSTANCE.getTombstoneModeDeath(), false);
            }
            }), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_DeathAction_SecondChance), {
                invoke: () => {
                InAppPurchaseManager.INSTANCE.purchaseProduct(GameInAppPurchase.revive);
            }
            }), null, null, 408, null);
            GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().setHasGameStarted(false);
            GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().addLife(GameStateManager.INSTANCE.getPersonState());
            AlertManager.showAlert$default(this, alertViewModel, false, 2, null);
        }
    }
    showDoubleIncomeAlert(): void {
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_AdTitle), Utils.INSTANCE.getString(R.string.Alert_AdMessageDoubleIncome), R.drawable.iap_money1, null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_Sure), {
            invoke: () => {
            AdManager.INSTANCE.showAd(AdRewards.doubleIncomeForAYear, "Double Income Alert");
        }
        }), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_NoThanks), {
            invoke: () => {
        }
        }), null, null, 408, null), false, 2, null);
    }
    rateGamePrompt(): void {
        if (GameStateManager.INSTANCE.getGlobalStateManager().getGlobalGameState().getHasPromptedForAppRating()) {
            return;
        }
        GameStateManager.INSTANCE.getGlobalStateManager().getGlobalGameState().setHasPromptedForAppRating(true);
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.RateGameTitle), Utils.INSTANCE.getString(R.string.RateGameDescription), R.drawable.menu_rate, null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_Sure), {
            invoke: () => {
            let mainGameActivity: MainGameActivity = GameStateManager.INSTANCE.getMainGameActivity();
            if (mainGameActivity != null) {
                mainGameActivity.startActivity(SocialBarItem.rateGame.getIntent());
            }
        }
        }), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_NoThanks), {
            invoke: () => {
        }
        }), null, null, 408, null), false, 2, null);
    }
    showRelationshipBreakUp(partner: Person): void {
        Intrinsics.checkParameterIsNotNull(partner, "partner");
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.AlertFailedRelationshipDescription);
        let objArr = [partner.getFullName()];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.AlertFailedRelationshipTitle), null, R.drawable.love_breakup, ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, format, null, null, null, 14, null)), LoveEvent.breakUp.getModifiers(), null, null, null, 14, null), null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
            invoke: () => {
            let personState: Player = GameStateManager.INSTANCE.getPersonState();
            personState.getAttributeState().setDeltaValueImmediate(LoveEvent.breakUp.getModifiers());
            personState.getFamilyState().breakUp();
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }), null, null, null, 464, null), false, 2, null);
    }
    showRelationshipWarning(partner: Person): void {
        Intrinsics.checkParameterIsNotNull(partner, "partner");
        let alertManager: AlertManager = AlertManager.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.AlertFailingRelationshipTitle);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.AlertFailingRelationshipDescription);
        let objArr = [partner.getFullName(), partner.getGender().getPronoun()];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, R.drawable.angry, null, null, null, null, null, null, 504, null), false, 2, null);
    }
    showLotteryAlert(numberOfTickets: number): void {
        let chooseFromPool: ArrayList<IProbableEvent> = Utils.Random.INSTANCE.chooseFromPool(ArraysKt.toCollection(LotteryOutcome.values(), new ArrayList()), numberOfTickets);
        let hashMap: HashMap = new HashMap();
        for (const iProbableEvent of chooseFromPool) {
            if (iProbableEvent != null) {
                let lotteryOutcome: LotteryOutcome = (iProbableEvent as unknown as LotteryOutcome);
                let num: number = hashMap.get(lotteryOutcome);
                if (num != null) {
                    hashMap.put(lotteryOutcome, Integer.valueOf(num.intValue() + 1));
                } else {
                    let alertManager: AlertManager = AlertManager.INSTANCE;
                    hashMap.put(lotteryOutcome, 1);
                }
            } else {
                throw new TypeCastException("null cannot be cast to non-null type Enums.LotteryOutcome");
            }
        }
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Lottery_Alert_Title);
        let objArr = [Integer.valueOf(numberOfTickets)];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let intRef: Ref.IntRef = new Ref.IntRef();
        intRef.element = 0;
        for (const entry of hashMap.entrySet()) {
            let lotteryOutcome2: LotteryOutcome = (entry.getKey() as unknown as LotteryOutcome);
            let intValue: number = (entry.getValue()).intValue();
            if (intValue > 0) {
                let reward: number = lotteryOutcome2.getReward() * intValue;
                intRef.element += reward;
                ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNormal$default(spannableStringBuilder, ((intValue + "x ") + lotteryOutcome2.getTitle()) + " = ", null, null, null, 14, null), ExtensionsKt.numberDisplayString$default(reward, false, 1, null), R.color.flatGreen, null, null, 12, null));
            }
        }
        ExtensionsKt.appendBold$default(spannableStringBuilder, Utils.INSTANCE.getString(R.string.Common_Total) + ": ", null, null, null, 14, null);
        ExtensionsKt.appendBold$default(spannableStringBuilder, ExtensionsKt.numberDisplayString$default(intRef.element, false, 1, null), R.color.flatGreen, null, null, 12, null);
        AlertManager.showAlert$default(this, new AlertViewModel(format, spannableStringBuilder, R.drawable.bank_lottery, {
            invoke: () => {
            let moneyState: MoneyState = GameStateManager.INSTANCE.getPersonState().getMoneyState();
            let valueOf: BigInteger = BigInteger.valueOf(intRef.element);
            MoneyState.updateMoney$default(moneyState, valueOf, MoneyUpdateType.workIncome, null, null, 12, null);
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }), false, 2, null);
    }
    showMetPartnerAlert(partner: LoverPersonality): void {
        Intrinsics.checkParameterIsNotNull(partner, "partner");
        let partnerForPlayer: Person = Person.INSTANCE.getPartnerForPlayer(GameStateManager.INSTANCE.getPersonState(), partner);
        let appendAttributesString$default: SpannableStringBuilder = ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.Common_Name), partnerForPlayer.getFullName()), null, null, null, 14, null)), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.Health_Header_Age), String.valueOf(partnerForPlayer.getAgeInYears())), null, null, null, 14, null)), Utils.Strings.INSTANCE.formatWithColon(Utils.INSTANCE.getString(R.string.Alert_Love_YouMetSomeone_Personality), partner.getTitle()), null, null, null, 14, null)), partner.getModifiers(), null, null, null, 14, null);
        if (partner.getCost() !== 0) {
            let append: SpannableStringBuilder = appendAttributesString$default.append(" ");
            let valueOf: BigInteger = BigInteger.valueOf(partner.getCost());
            ExtensionsKt.appendMoney(append, valueOf);
        }
        let alertActionViewModel: AlertActionViewModel = new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Love_YouMetSomeone_Date), {
            invoke: () => {
            GameStateManager.INSTANCE.getPersonState().getFamilyState().date(partnerForPlayer);
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        });
        let alertActionViewModel2: AlertActionViewModel = new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Love_YouMetSomeone_Reject), {
            invoke: () => {
        }
        });
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Alert_Love_YouMetSomeone_Title);
        let objArr = [partnerForPlayer.getSex().getDatingTitle()];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(format, null, Integer.valueOf(AgeGroup.INSTANCE.getAgeGroup(partnerForPlayer.getAgeInYears()).imageId(partnerForPlayer.getSex())), appendAttributesString$default, null, alertActionViewModel, alertActionViewModel2, null, null, 400, null), false, 2, null);
    }
    showBabyBornAlert(baby: Person, adopted: boolean): void {
        Intrinsics.checkParameterIsNotNull(baby, "baby");
        let str: string = (Utils.INSTANCE.returnFirstIfTrue(adopted, Utils.INSTANCE.getString(R.string.Alert_AdoptedChildTitle), Utils.INSTANCE.getString(R.string.BabyBornAlertTitle)) as string);
        let str2: string = (Utils.INSTANCE.returnFirstIfTrue(adopted, Utils.INSTANCE.getString(R.string.Alert_AdoptedChildMessage), Utils.INSTANCE.getString(R.string.BabyBornAlertMessage)) as string);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let objArr = [baby.getSex().getDatingTitle(), baby.getGender().getPronounThirdPerson(), baby.getFullName()];
        let format: string = String.format(str2, Arrays.copyOf(objArr, objArr.length));
        let objectRef: Ref.ObjectRef = new Ref.ObjectRef();
        objectRef.element = baby.getFirstName();
        AlertManager.showAlert$default(this, new AlertViewModel(str, format, R.drawable.alert_newbaby, null, new EditableTextFieldViewModel(Utils.INSTANCE.getString(R.string.CustomGame_TapToCustomizeFirstName), {
            invoke: (newText: string) => {
            Intrinsics.checkParameterIsNotNull(newText, "newText");
            objectRef.element = newText;
        }
        }, false, 4, null), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
            invoke: () => {
            let person: Person = baby;
            let str3: string = (objectRef.element as string);
            if (str3 == null) {
                throw new TypeCastException("null cannot be cast to non-null type kotlin.CharSequence");
            }
            person.setFirstName(StringsKt.trim(str3).toString());
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }), null, null, null, 448, null), false, 2, null);
    }
    showMiscarriage(child: Person): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        this.show(new AlertViewModel(Utils.INSTANCE.getString(R.string.PregnantMiscarriage_AlertTitle), Utils.INSTANCE.getString(R.string.PregnantMiscarriage_AlertMessage), R.drawable.alert_miscarriage, Utils.INSTANCE.getString(R.string.Common_OhNo), {
            invoke: () => {
            GameStateManager.INSTANCE.getPersonState().getFamilyState().getFamilyMembers().remove(child);
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }));
    }
    showBabyTwinOrTripletBorn(child: Person, event: PregnancyOutcome): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        Intrinsics.checkParameterIsNotNull(event, "event");
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let person: Person = new Person(Relationship.child, child.getSex(), child.getLastName(), 0);
        let objectRef: Ref.ObjectRef = new Ref.ObjectRef();
        objectRef.element = new Person(Relationship.child, child.getSex(), child.getLastName(), 0);
        let str: string = (Utils.INSTANCE.returnFirstIfTrue(event === PregnancyOutcome.twins, Utils.INSTANCE.getString(R.string.AlertTitle_Twins), Utils.INSTANCE.getString(R.string.AlertTitle_Triplet)) as string);
        let companion = Utils.INSTANCE;
        let z: boolean = event === PregnancyOutcome.twins;
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.BabyBornAlertMessageTwin);
        let objArr = [Utils.INSTANCE.getString(R.string.Common_Twin), child.getSex().getDatingTitle(), child.getFirstName(), person.getFirstName()];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        let stringCompanionObject2 = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.BabyBornAlertMessageTriplet);
        let objArr2 = [Utils.INSTANCE.getString(R.string.Common_Triplet), child.getSex().getDatingTitle(), child.getFirstName(), person.getFirstName(), ((objectRef.element as unknown as Person)).getFirstName()];
        let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
        AlertManager.showAlert$default(this, new AlertViewModel(str, (companion.returnFirstIfTrue(z, format, format2) as string), R.drawable.alert_newbaby, {
            invoke: () => {
            personState.getFamilyState().getFamilyMembers().add(person);
            if (event === PregnancyOutcome.triplets) {
                personState.getFamilyState().getFamilyMembers().add((objectRef.element as unknown as Person));
            }
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }), false, 2, null);
    }
    showFamilyMemberDeathAlert(member: Person): void {
        Intrinsics.checkParameterIsNotNull(member, "member");
        let modifiers: Modifiers = new Modifiers(0.0, -50.0, -50.0);
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.FamilyAlert_DeathMessage);
        let objArr = new Array(4).fill(null);
        let title: string = member.getTitle();
        if (title == null) {
            throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
        }
        let lowerCase: string = title.toLowerCase();
        objArr[0] = lowerCase;
        objArr[1] = member.getFullName();
        objArr[2] = member.getDeathReason();
        objArr[3] = member.getRelationshipStatus().getDeathReasonForStatus();
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.FamilyAlert_DeathTitle), ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, format, null, null, null, 14, null)), modifiers, null, null, null, 14, null), R.drawable.grave, Utils.INSTANCE.getString(R.string.Common_OhNo), {
            invoke: () => {
            GameStateManager.INSTANCE.getPersonState().getAttributeState().setDeltaValueImmediate(modifiers);
            member.die();
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
            Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getReloadGenericList());
        }
        }), false, 2, null);
    }
    showCompanyIncorporated(state: BusinessState.SingleBusinessState): void {
        Intrinsics.checkParameterIsNotNull(state, "state");
        let string: string = Utils.INSTANCE.getString(R.string.Alert_BusinessIncorporate_Company);
        let objArr = new Array(2).fill(null);
        objArr[0] = state.getName();
        let sb: StringBuilder = new StringBuilder();
        let title: string = BusinessAction.hire.title(state.getType());
        if (title == null) {
            throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
        }
        let lowerCase: string = title.toLowerCase();
        sb.append(lowerCase);
        sb.append("s");
        objArr[1] = sb.toString();
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_BusinessIncorporate_Title), format, Integer.valueOf(state.getType().imageId(1)), null, new EditableTextFieldViewModel(Utils.INSTANCE.getString(R.string.CustomGame_TapToCustomize), {
            invoke: (newText: string) => {
            Intrinsics.checkParameterIsNotNull(newText, "newText");
            state.setName(StringsKt.trim(newText).toString());
        }
        }, false, 4, null), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
            invoke: () => {
            Utils.INSTANCE.reloadGenericList(GenericListType.businessDetails);
        }
        }), null, null, null, 448, null), false, 2, null);
    }
    showMissingDegreeAlert(degree: CompletableAction): void {
        Intrinsics.checkParameterIsNotNull(degree, "degree");
        let string: string = Utils.INSTANCE.getString(R.string.Alert_MissingDegree_Title);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_MissingDegree_Message);
        let objArr = [degree.getTitle()];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(string, format, Integer.valueOf(degree.getImageId()), null, null, null, null, null, null, 504, null), false, 2, null);
    }
    static showRandomEvent$default(alertManager: AlertManager, randomEvent: RandomEvent, z: boolean, i: number, obj: any): void {
        if ((i & 2) !== 0) {
            z = false;
        }
        alertManager.showRandomEvent(randomEvent, z);
    }
    showRandomEvent(event: RandomEvent, shouldPrioritize: boolean): void {
        if ((event == null) || DebugFlag.turnOffRandomEvents.getEnabled()) {
            return;
        }
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let imageId: number = event.getImageId();
        let title: string = event.getTitle();
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        if (!event.getModifiers().isAllZero()) {
            ExtensionsKt.appendNormal$default(ExtensionsKt.appendAttributesString$default(spannableStringBuilder, event.getModifiers(), null, null, null, 14, null), " ", null, null, null, 14, null);
        }
        let promotionProgressModifier: number = event.getPromotionProgressModifier();
        if (promotionProgressModifier != null) {
            let intValue: number = promotionProgressModifier.intValue();
            ExtensionsKt.appendNormal$default(spannableStringBuilder, ((ExtensionsKt.stringWithExplicitPlusMinusSign(intValue) + " ") + Utils.INSTANCE.getString(R.string.RandomEvent_Message_PromotionProgress)) + "  ", Integer.valueOf(ExtensionsKt.displayColor(intValue)), null, null, 12, null);
        }
        let coursePorgressModifier: number = event.getCoursePorgressModifier();
        if (coursePorgressModifier != null) {
            let intValue2: number = coursePorgressModifier.intValue();
            ExtensionsKt.appendNormal$default(spannableStringBuilder, ((ExtensionsKt.stringWithExplicitPlusMinusSign(intValue2) + " ") + Utils.INSTANCE.getString(R.string.RandomEvent_Message_CourseProgress)) + "  ", Integer.valueOf(ExtensionsKt.displayColor(intValue2)), null, null, 12, null);
        }
        let sideProjectProgressModifier: number = event.getSideProjectProgressModifier();
        if (sideProjectProgressModifier != null) {
            let intValue3: number = sideProjectProgressModifier.intValue();
            ExtensionsKt.appendNormal$default(spannableStringBuilder, ((ExtensionsKt.stringWithExplicitPlusMinusSign(intValue3) + " ") + Utils.INSTANCE.getString(R.string.RandomEvent_Message_ProjectProgress)) + "  ", Integer.valueOf(ExtensionsKt.displayColor(intValue3)), null, null, 12, null);
        }
        let incomeModifier: number = event.getIncomeModifier();
        if (incomeModifier != null) {
            let doubleValue: number = incomeModifier.doubleValue();
            ExtensionsKt.appendNormal$default(spannableStringBuilder, ((doubleValue + "X ") + Utils.INSTANCE.getString(R.string.RandomEvent_Message_Income)) + "  ", Integer.valueOf(ExtensionsKt.displayColor(doubleValue)), null, null, 12, null);
        }
        let moneyPercentModifier: number = event.getMoneyPercentModifier();
        if (moneyPercentModifier != null) {
            ExtensionsKt.appendNormal$default(spannableStringBuilder, ((ExtensionsKt.toPercentString(moneyPercentModifier.doubleValue() - 1.0) + " ") + Utils.INSTANCE.getString(R.string.Common_Attribute_Money)) + "  ", R.color.flatRed, null, null, 12, null);
        }
        let moneyModifier: number = event.getMoneyModifier();
        if (moneyModifier !== 0) {
            ExtensionsKt.appendNormal$default(spannableStringBuilder, ExtensionsKt.numberDisplayString$default(moneyModifier, false, 1, null), Integer.valueOf(ExtensionsKt.displayColor(moneyModifier)), null, null, 12, null);
        }
        let weekModifier: number = event.getWeekModifier();
        if (weekModifier != null) {
            ExtensionsKt.appendNormal$default(spannableStringBuilder, ((weekModifier.intValue() + " ") + Utils.INSTANCE.getString(R.string.Common_Week)) + "  ", R.color.flatRed, null, null, 12, null);
        }
        let arrayList: ArrayList = new ArrayList();
        let choices: EventChoice[] = event.getChoices();
        if (choices != null) {
            for (const eventChoice of choices) {
                arrayList.add(new AlertActionViewModel(eventChoice.getChoiceText(), {
                    invoke: () => {
                    AlertManager.INSTANCE.showRandomEvent(eventChoice.getEvent(), true);
                }
                }));
            }
        }
        let arrayList2: ArrayList = arrayList;
        this.showAlert(new AlertViewModel(title, null, imageId, spannableStringBuilder, null, (arrayList2.size() > 0) ? null : new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
            invoke: () => {
        }
        }), null, arrayList2, event.getShowAsAlert() ? AlertType.Alert : AlertType.Banner), shouldPrioritize);
        event.applyEventModifier(personState);
        let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
        if (mainGameFragment != null) {
            MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
        }
    }
    showPromotionAlert(jobState: JobState.JobStateSingle): void {
        Intrinsics.checkParameterIsNotNull(jobState, "jobState");
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_Promotion_Title), ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), (Utils.INSTANCE.getString(R.string.Alert_Promotion_MessageNewTitle) + ": ") + jobState.getJobTitle(), null, null, null, 14, null)), jobState.getModifiers(), jobState.getSalaryRange(), null, null, 12, null), jobState.getType().getImageId(), {
            invoke: () => {
        }
        }), false, 2, null);
    }
    showAchievementAlert(achievement: Achievement): void {
        Intrinsics.checkParameterIsNotNull(achievement, "achievement");
        TelemetryManager.INSTANCE.logEvent("AchievementComplete", MapsKt.mapOf(TuplesKt.to("Type", achievement.getTitle())));
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Alert_Achievement_Description);
        let objArr = [achievement.getTitle()];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_Achievement_Title), null, Integer.valueOf(achievement.getImageId()), ExtensionsKt.appendNormal$default(spannableStringBuilder, format, null, null, null, 14, null), null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Achievement_Button_NewGame), {
            invoke: () => {
            AlertManager.INSTANCE.showConfirmationAlert(new AlertViewModel(Utils.INSTANCE.getString(R.string.Common_AreYouSure), Utils.INSTANCE.getString(R.string.AchievementComplete_RestartConfimration), R.drawable.menu_restart, null, null, null, null, null, null, 504, null), {
                invoke: () => {
                Utils.INSTANCE.triggerNewGameStart();
            }
            });
        }
        }), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Achievement_Button_Continue), {
            invoke: () => {
        }
        }), null, null, 400, null), false, 2, null);
    }
    showBadgeEarnedAlert(badge: AchievementBadge): void {
        Intrinsics.checkParameterIsNotNull(badge, "badge");
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Banner_BadgeEarned_Title);
        let objArr = [badge.getRarity().getTitle()];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        let stringCompanionObject2 = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Banner_BadgeEarned_Message);
        let objArr2 = [badge.getTitle()];
        let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
        AlertManager.showAlert$default(this, new AlertViewModel(format, format2, R.drawable.menu_badge, AlertType.Banner), false, 2, null);
    }
    showInheritanceAlert(relationshipStatus: RelationshipProgressStatus): void {
        Intrinsics.checkParameterIsNotNull(relationshipStatus, "relationshipStatus");
        let string: string = Utils.INSTANCE.getString(R.string.FamilyAlert_Death_WillTitle);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.FamilyAlert_Death_WillMessage);
        let objArr = [ExtensionsKt.numberDisplayString$default(relationshipStatus.getInheritance(), false, 1, null)];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(string, format, R.drawable.will, Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
            invoke: () => {
            let moneyState: MoneyState = GameStateManager.INSTANCE.getPersonState().getMoneyState();
            let valueOf: BigInteger = BigInteger.valueOf(relationshipStatus.getInheritance());
            MoneyState.updateMoney$default(moneyState, valueOf, MoneyUpdateType.workIncome, null, null, 12, null);
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }), false, 2, null);
    }
    showPetDeathAlert(pet: Person): void {
        Intrinsics.checkParameterIsNotNull(pet, "pet");
        let petType: Pet = pet.getPetType();
        if ((petType == null) || (petType == null)) {
            return;
        }
        let modifiers: Modifiers = new Modifiers(0.0, -15.0, 0.0);
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.PetDeathMessage);
        let objArr = [pet.getFirstName(), pet.getDeathReason()];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.PetDeathTitle), ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, format, null, null, null, 14, null)), modifiers, null, null, null, 14, null), petType.getImageId(), Utils.INSTANCE.getString(R.string.Common_OhNo), {
            invoke: () => {
            GameStateManager.INSTANCE.getPersonState().getAttributeState().setDeltaValueImmediate(modifiers);
            pet.die();
            GameStateManager.INSTANCE.getPersonState().getFamilyState().removeWithId(pet.getId());
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
            }
        }
        }), false, 2, null);
    }
    showPetAdoptedAlert(pet: Person): void {
        Intrinsics.checkParameterIsNotNull(pet, "pet");
        let petType: Pet = pet.getPetType();
        if (petType != null) {
            let stringCompanionObject = StringCompanionObject.INSTANCE;
            let string: string = Utils.INSTANCE.getString(R.string.Alert_PetBoughtTitle);
            let objArr = new Array(1).fill(null);
            let title: string = petType.getTitle();
            if (title == null) {
                throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
            }
            let lowerCase: string = title.toLowerCase();
            objArr[0] = lowerCase;
            let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
            let stringCompanionObject2 = StringCompanionObject.INSTANCE;
            let string2: string = Utils.INSTANCE.getString(R.string.Alert_PetBoughtMessage);
            let objArr2 = [pet.getGender().getPronounThirdPerson(), pet.getFirstName()];
            let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
            let objectRef: Ref.ObjectRef = new Ref.ObjectRef();
            objectRef.element = pet.getFirstName();
            AlertManager.showAlert$default(this, new AlertViewModel(format, format2, Integer.valueOf(petType.getImageId()), null, new EditableTextFieldViewModel(Utils.INSTANCE.getString(R.string.CustomGame_TapToCustomizeName), {
                invoke: (newText: string) => {
                Intrinsics.checkParameterIsNotNull(newText, "newText");
                objectRef.element = newText;
            }
            }, false, 4, null), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
                invoke: () => {
                let person: Person = pet;
                let str: string = (objectRef.element as string);
                if (str == null) {
                    throw new TypeCastException("null cannot be cast to non-null type kotlin.CharSequence");
                }
                person.setFirstName(StringsKt.trim(str).toString());
                let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
                if (mainGameFragment != null) {
                    MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
                }
            }
            }), null, null, null, 448, null), false, 2, null);
        }
    }
    showTooManyPetsAlert(targetHousing: Housing): void {
        Intrinsics.checkParameterIsNotNull(targetHousing, "targetHousing");
        let alertManager: AlertManager = AlertManager.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.TooManyPetsAlertTitle);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.TooManyPetsAlertDescription);
        let objArr = new Array(5).fill(null);
        objArr[0] = targetHousing.getTitle();
        objArr[1] = Integer.valueOf(targetHousing.getNumberOfPetsAllowed());
        objArr[2] = (targetHousing.getNumberOfPetsAllowed() > 1) ? Utils.INSTANCE.getString(R.string.Common_Pet_Plural) : Utils.INSTANCE.getString(R.string.Common_Pet);
        objArr[3] = Integer.valueOf(GameStateManager.INSTANCE.getPersonState().getFamilyState().getAlivePets().size());
        objArr[4] = (GameStateManager.INSTANCE.getPersonState().getFamilyState().getAlivePets().size() > 1) ? Utils.INSTANCE.getString(R.string.Common_Pet_Plural) : Utils.INSTANCE.getString(R.string.Common_Pet);
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(alertManager, new AlertViewModel(string, format, R.drawable.pet_adopt, null, null, null, null, null, null, 504, null), false, 2, null);
    }
    showChildPayForCollegeAlert(child: Person): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Alert_ChildWantsToGoToCollege_Message);
        let objArr = [child.getFullName(), ExtensionsKt.numberDisplayString$default(CompletableAction.college_science.getTotalCost(), false, 1, null)];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_ChildWantsToGoToCollege_Title), null, Integer.valueOf(CompletableAction.masters.getImageId()), ExtensionsKt.appendNormal$default(spannableStringBuilder, format, null, null, null, 14, null), null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_ChildWantsToGoToCollege_Option_PayForIt), {
            invoke: () => {
            AlertManager.INSTANCE.showYouPaidForChildCollegeAlert(child);
        }
        }), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_ChildWantsToGoToCollege_Option_GetLoan), {
            invoke: () => {
            if (Utils.Random.INSTANCE.rollWithProbability(0.5)) {
                AlertManager.INSTANCE.showChildDecideToWorkInsteadOfCollege(child);
            } else {
                AlertManager.INSTANCE.showYouDidntPayForCollegeButTheyStillAttend(child);
            }
        }
        }), null, null, 400, null), false, 2, null);
    }
    showYouPaidForChildCollegeAlert(child: Person): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        let string: string = Utils.INSTANCE.getString(R.string.Alert_ChildHappyYouPaidForCollege_Title);
        let sb: StringBuilder = new StringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_ChildHappyYouPaidForCollege_Message);
        let objArr = new Array(3).fill(null);
        objArr[0] = child.getFullName();
        objArr[1] = child.getGender().getPossessiveHisHer();
        let pronoun: string = child.getGender().getPronoun();
        if (pronoun == null) {
            throw new TypeCastException("null cannot be cast to non-null type java.lang.String");
        }
        let lowerCase: string = pronoun.toLowerCase();
        objArr[2] = lowerCase;
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        sb.append(format);
        sb.append("\n");
        let sb2: StringBuilder = new StringBuilder();
        sb2.append("+");
        let i: number = 250;
        sb2.append(250);
        sb2.append(" ");
        sb2.append(Utils.INSTANCE.getString(R.string.ChildEvent_EventModifier));
        sb.append(sb2.toString());
        let sb3: string = sb.toString();
        AlertManager.showAlert$default(this, new AlertViewModel(string, sb3, R.drawable.achievement_happy, {
            invoke: () => {
            MoneyState.updateMoney$default(GameStateManager.INSTANCE.getPersonState().getMoneyState(), CompletableAction.college_science.getTotalCost(), MoneyUpdateType.directSpend, null, null, 12, null);
            let person: Person = child;
            person.setRelationshipProgress(person.getRelationshipProgress() + i);
            let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
            if (mainGameFragment != null) {
                mainGameFragment.updateHUD();
            }
            Utils.INSTANCE.reloadGenericList(GenericListType.childDetails);
        }
        }), false, 2, null);
    }
    showProjectComplete(project: SideHustleState.SideHustleProject): void {
        Intrinsics.checkParameterIsNotNull(project, "project");
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.SideHustle_CompletionTitle);
        let objArr = [project.getType().getProjectName()];
        let format: string = String.format(string, Arrays.copyOf(objArr, objArr.length));
        let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder();
        let stringCompanionObject2 = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.SideHustle_CompletionMessage);
        let objArr2 = [project.getType().getProjectName(), project.getType().getProjectName()];
        let format2: string = String.format(string2, Arrays.copyOf(objArr2, objArr2.length));
        AlertManager.showAlert$default(this, new AlertViewModel(format, ExtensionsKt.appendNormal$default(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendNewline(ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(spannableStringBuilder, format2, null, null, null, 14, null))), ((Utils.INSTANCE.getString(R.string.Common_Name) + ": '") + project.getName()) + "'", null, null, null, 14, null)), ((StringsKt.capitalize(project.getType().getProjectName()) + " ") + Utils.INSTANCE.getString(R.string.Common_Quality)) + ": ", null, null, null, 14, null), project.getQuality().getTitle(), Integer.valueOf(project.getQuality().getColor()), null, null, 12, null), project.getType().getImageId(), {
            invoke: () => {
        }
        }), false, 2, null);
    }
    showYouDidntPayForCollegeButTheyStillAttend(child: Person): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        let string: string = Utils.INSTANCE.getString(R.string.Alert_ChildGetsStudentLoan_Title);
        let sb: StringBuilder = new StringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_ChildGetsStudentLoan_Message);
        let objArr = [child.getFullName(), child.getGender().getPossessiveHisHer()];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        sb.append(format);
        sb.append("\n");
        let sb2: StringBuilder = new StringBuilder();
        let i: number = -100;
        sb2.append(-100);
        sb2.append(" ");
        sb2.append(Utils.INSTANCE.getString(R.string.ChildEvent_EventModifier));
        sb.append(sb2.toString());
        let sb3: string = sb.toString();
        AlertManager.showAlert$default(this, new AlertViewModel(string, sb3, R.drawable.angry, {
            invoke: () => {
            let person: Person = child;
            person.setRelationshipProgress(person.getRelationshipProgress() + i);
            Utils.INSTANCE.reloadGenericList(GenericListType.childDetails);
        }
        }), false, 2, null);
    }
    showChildDecideToWorkInsteadOfCollege(child: Person): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        let string: string = Utils.INSTANCE.getString(R.string.Alert_ChildWorksInsteads_Title);
        let sb: StringBuilder = new StringBuilder();
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_ChildWorksInsteads_Message);
        let objArr = [child.getFullName(), child.getGender().getPossessiveHisHer()];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        sb.append(format);
        sb.append("\n");
        let sb2: StringBuilder = new StringBuilder();
        let i: number = -100;
        sb2.append(-100);
        sb2.append(" ");
        sb2.append(Utils.INSTANCE.getString(R.string.ChildEvent_EventModifier));
        sb.append(sb2.toString());
        let sb3: string = sb.toString();
        AlertManager.showAlert$default(this, new AlertViewModel(string, sb3, R.drawable.angry, {
            invoke: () => {
            AlertManager.INSTANCE.showChildStartNewJob(child, Job.dataEntry);
            let person: Person = child;
            person.setRelationshipProgress(person.getRelationshipProgress() + i);
            Utils.INSTANCE.reloadGenericList(GenericListType.childDetails);
        }
        }), false, 2, null);
    }
    showChildStartNewJob(child: Person, job: Job): void {
        Intrinsics.checkParameterIsNotNull(child, "child");
        Intrinsics.checkParameterIsNotNull(job, "job");
        let string: string = Utils.INSTANCE.getString(R.string.Alert_ChildNewJob_Title);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_ChildNewJob_Message);
        let objArr = [child.getFullName(), job.getJobTitles()[0]];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        AlertManager.showAlert$default(this, new AlertViewModel(string, format, job.getImageId(), {
            invoke: () => {
            let childJobState: JobState = child.getChildJobState();
            if (childJobState == null) {
                childJobState = new JobState();
            }
            childJobState.switchJob(job);
            child.setChildJobState(childJobState);
            Utils.INSTANCE.reloadGenericList(GenericListType.childDetails);
        }
        }), false, 2, null);
    }
    showAbandonPetAlert(pet: Person): void {
        Intrinsics.checkParameterIsNotNull(pet, "pet");
        let alertManager: AlertManager = AlertManager.INSTANCE;
        let string: string = Utils.INSTANCE.getString(R.string.Common_AreYouSure);
        let stringCompanionObject = StringCompanionObject.INSTANCE;
        let string2: string = Utils.INSTANCE.getString(R.string.Alert_AbandonPet_Message);
        let objArr = [pet.getFirstName()];
        let format: string = String.format(string2, Arrays.copyOf(objArr, objArr.length));
        alertManager.showConfirmationAlert(new AlertViewModel(string, format, Integer.valueOf(PersonInteraction.abandonPet.getImageId()), null, null, null, null, null, null, 504, null), {
            invoke: () => {
            let familyState: FamilyState = GameStateManager.INSTANCE.getPersonState().getFamilyState();
            let familyMembers: ArrayList<Person> = GameStateManager.INSTANCE.getPersonState().getFamilyState().getFamilyMembers();
            let arrayList: ArrayList = new ArrayList();
            for (const obj of familyMembers) {
                if (!Intrinsics.areEqual(pet.getId(), ((obj as unknown as Person)).getId())) {
                    arrayList.add(obj);
                }
            }
            familyState.setFamilyMembers((CollectionsKt.toCollection(arrayList, new ArrayList()) as unknown as ArrayList));
            Utils.INSTANCE.broadcastIntent(Constants.Intent.INSTANCE.getPopModal());
        }
        });
    }
    alertDismissed(alertViewModel: AlertViewModel): void {
        AlertManager.currentlyShowing = false;
        this.showNextAlertIfNeeded();
        SoundManager.INSTANCE.playSound(SoundEffect.Whoosh);
    }
}
