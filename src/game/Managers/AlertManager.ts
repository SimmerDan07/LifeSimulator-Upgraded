// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Appearance } from "../Social/Appearance";
import { News } from "./News";
import { Illness } from "../Health/Illness";
import { ILLNESS_DEFS } from "../Health/IllnessData";
import { Obituary } from "./Obituary";
import { Generations } from "./Generations";
import { GameInAppPurchase } from "../Enums/GameInAppPurchase";
import { ArrayList, Arrays, ArraysKt, BigInteger, CollectionsKt, Function0, HashMap, Integer, Intrinsics, MapsKt, R, Ref, SpannableStringBuilder, StringBuilder, StringCompanionObject, StringsKt, TuplesKt, TypeCastException } from "../runtime";
import { UIBridge } from "../ui/bridge";
import { Achievement } from "../Enums/Achievement";
import { AchievementBadge } from "../Enums/AchievementBadge";
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
    /** v0.22.0: while set (a vampire lying collapsed for years), alerts are collected here instead of shown. */
    static muted: AlertViewModel[] | null = null;
    /**
     * v0.28.1 fewer pop-ups: > 0 while weeks go by (Player.applyWeekly, Spend Time with Everyone). Anything that pops
     * up on its own then goes to News instead, except holidays, dying and naming a baby (AlertManager.mustShow).
     */
    static inWeek = 0;
    static allPopups(): boolean {
        try { if ((globalThis as any).process?.env?.LIFESIM_ALL_POPUPS) return true; } catch { /* no env */ }
        try { return !!(GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings() as any).allPopups; } catch { return false; }
    }
    /** v0.29.1: Game Settings › "No pop-ups at all": nothing ever pops up, from the weeks or from what you tap. */
    static noPopups(): boolean {
        try { if ((globalThis as any).process?.env?.LIFESIM_NO_POPUPS) return true; } catch { /* no env */ }
        try { return !!(GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings() as any).noPopups; } catch { return false; }
    }
    /** …and with it, what you tap still gets a small corner notice (default on). */
    static notices(): boolean {
        try { return (GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings() as any).popupNotices !== false; } catch { return true; }
    }
    private static silentDepth = 0;
    /** v0.29.4: > 0 while a random event is happening (see randomly). */
    static randomScope = 0;
    /** Run something that happens to you at random (a surprise during what you're doing): what it shows is a random event. */
    static randomly<T>(fn: () => T): T { AlertManager.randomScope++; try { return fn(); } finally { AlertManager.randomScope--; } }
    /** Random = it happened on its own (the weeks going by), inside randomly(), or tagged vm.random. Not a menu you opened. */
    static isRandom(vm: AlertViewModel): boolean { return AlertManager.inWeek > 0 || AlertManager.randomScope > 0 || !!(vm as any).random; }
    /** The choice made for you when an alert isn't shown (see quietly). */
    static quietPick<T>(vm: T, choice: "positive" | "negative" | number): T { (vm as any).quietChoice = choice; return vm; }
    /**
     * v0.29.4 "No pop-ups for random events": a random event never shows. It goes to News, and a choice is made:
     * its own quiet pick if it has one (holidays, wills, emergencies, achievements…), else no thanks (a loan, a
     * reunion, an invitation, a stranger's offer…), or OK / the first option if there is no "no". One that happened
     * while you were doing something gets a small corner notice (unless those are off too).
     */
    static silently(vm: AlertViewModel): void {
        const v: any = vm;
        const tapped = AlertManager.inWeek === 0;   // it happened while you were doing something (not the weeks going by)
        if (vm.getType() === AlertType.Banner) {
            News.add(vm);
            if (tapped && AlertManager.notices()) AlertManager.INSTANCE.show(vm);
            return;
        }
        if (AlertManager.silentDepth > 12) { News.add(vm); return; }   // a question that keeps asking itself
        AlertManager.silentDepth++;
        try {
            const several = vm.getNegativeButton() != null || (vm.getAdditionalButtons()?.size?.() ?? 0) > 0;
            // a random event is never "confirmed" for you: its own quiet pick, else no thanks (or OK)
            if (tapped && !several && AlertManager.notices()) {
                // what happened after your tap, as a small notice that doesn't stop anything
                const notice = new AlertViewModel(vm.getTitle(), vm.getMessage(), vm.getImageId(), vm.getAttributedMessage(), null, null, null, null, AlertType.Banner, 0, null);
                AlertManager.INSTANCE.show(notice);
            }
            AlertManager.randomly(() => AlertManager.quietly(vm));   // what follows from it is part of the random event too
        } finally { AlertManager.silentDepth--; }
    }
    /** v0.28.1: Game Settings › "Turn off holiday pop-ups" (stored as holidayPopups = false). */
    static holidaysOn(): boolean {
        try { return (GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings() as any).holidayPopups !== false; } catch { return true; }
    }
    static mustShow(vm: AlertViewModel): boolean {
        const v: any = vm;
        if (v.holiday) return AlertManager.holidaysOn();
        if (vm.getEditableTextFieldViewModel?.() != null) return true;   // naming a baby
        const t = vm.getTitle?.();
        return t === Utils.INSTANCE.getString(R.string.Alert_DeathTitle);
    }
    /** Says nothing and makes the sensible choice: positive when asked to (a will, an emergency), otherwise decline. */
    static quietly(vm: AlertViewModel): void {
        const v: any = vm;
        let btn: AlertActionViewModel | null = null;
        try {
            const extra = vm.getAdditionalButtons();
            if (typeof v.quietChoice === "number") {
                // an option by position: 0 = first (positive), the last = negative, the rest are the extra buttons
                const n = 1 + (extra?.size?.() ?? 0) + (vm.getNegativeButton() != null ? 1 : 0);
                const i = Math.max(0, Math.min(n - 1, v.quietChoice));
                btn = i === 0 ? vm.getPositiveButton() : i === n - 1 && vm.getNegativeButton() != null ? vm.getNegativeButton() : extra.get(i - 1);
            } else if (v.quietChoice === "negative") btn = vm.getNegativeButton() ?? vm.getPositiveButton();
            else if (v.quietChoice === "positive") btn = vm.getPositiveButton() ?? (extra?.size?.() ? extra.get(0) : null);
            else btn = vm.getNegativeButton() ?? vm.getPositiveButton() ?? (extra?.size?.() ? extra.get(0) : null);
        } catch { /* ignore */ }
        const several = (vm.getNegativeButton?.() != null) || ((vm.getAdditionalButtons?.()?.size?.() ?? 0) > 0);
        News.add(vm, several && btn ? btn.getTitle() : null);
        try { btn?.getAction()?.invoke(); } catch (e) { console.error(e); }
    }
    showAlert$0(alertViewModel: AlertViewModel, prioritize: boolean): void {
        // v0.29.4: "No pop-ups for random events" — random events and their choices go to News; menus you open
        // (savings %, amounts, "Are you sure?", names, info) still pop up as normal
        if (AlertManager.muted == null && AlertManager.noPopups() && !(alertViewModel as any).essential && AlertManager.isRandom(alertViewModel)) { AlertManager.silently(alertViewModel); return; }
        // v0.28.1b: holidays turned off never pop up, whatever else is on and wherever they come from
        if (AlertManager.muted == null && (alertViewModel as any).holiday && !AlertManager.holidaysOn()) { AlertManager.quietly(alertViewModel); return; }
        if (AlertManager.muted == null && AlertManager.inWeek > 0 && !AlertManager.allPopups() && !AlertManager.mustShow(alertViewModel)) {
            // a warning that you're about to die still shows, as a small notice that doesn't block anything
            if ((alertViewModel as any).critical) {
                News.add(alertViewModel);
                this.show(new AlertViewModel(alertViewModel.getTitle(), String(alertViewModel.getMessage?.() ?? ""), alertViewModel.getImageId(), null, null, null, null, null, AlertType.Banner, 0, null));
                return;
            }
            AlertManager.quietly(alertViewModel);
            return;
        }
        if (AlertManager.muted != null) {
            // Nobody is there to answer: an "Okay" alert's action still happens (a breakup goes through); a question is declined.
            AlertManager.muted.push(alertViewModel);
            try {
                const extra = alertViewModel.getAdditionalButtons();
                const btn = alertViewModel.getNegativeButton() ?? (extra == null || extra.size() === 0 ? alertViewModel.getPositiveButton() : null);
                btn?.getAction()?.invoke();
            } catch { /* ignore */ }
            return;
        }
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
        // v0.20.0 fix: banners don't block the screen, so keep going until a real alert is showing (before, a banner
        // queued behind an alert left the alerts after it stuck in the queue until something else popped up).
        while (!AlertManager.currentlyShowing && AlertManager.alertQueue.size() > 0) {
            let alert: AlertViewModel = AlertManager.alertQueue.removeFirst();
            this.show(alert);
        }
    }
    showConfirmationAlert(alert: AlertViewModel, action: Function0<any>): void {
        Intrinsics.checkParameterIsNotNull(alert, "alert");
        Intrinsics.checkParameterIsNotNull(action, "action");
        const S = (k: string) => Utils.INSTANCE.getString(k);
        const msg = String(alert.getMessage() ?? "");
        // v0.29.1: wiping a whole save is the one question "No pop-ups at all" still asks
        const essential = [S("Alert_DeleteSaveSlot_Message"), S("Alert_Restart_Descrption"), S("AchievementComplete_RestartConfimration")].includes(msg);
        const cvm: any = new AlertViewModel(alert.getTitle(), alert.getMessage(), alert.getImageId(), null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_Yes), action), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Common_No), {
            invoke: () => {
        }
        }), null, null, 408, null);
        cvm.confirm = true;
        if (essential) cvm.essential = true;
        AlertManager.showAlert$default(this, cvm, false, 2, null);
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
            const lowVm = new AlertViewModel(str, format, Integer.valueOf(attribute.getLowAttributeImageId()), null, null, null, null, null, null, 504, null);
            (lowVm as any).critical = true;   // v0.28.1: still shown (as a notice) when pop-ups are off
            AlertManager.showAlert$default(alertManager, lowVm, false, 2, null);
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
    /** v0.30.1: going bankrupt doesn't end your life: debts on your cash are wiped, savings go with them, and it hurts. */
    showBankruptAlert(): void {
        TelemetryManager.INSTANCE.logEvent("Bankruptcy", MapsKt.mapOf(TuplesKt.to("Reason", "Bankruptcy")));
        const p: any = GameStateManager.INSTANCE.getPersonState();
        const ms = p.getMoneyState();
        try {
            // creditors take your savings, the rest of the debt (and your loans) is wiped
            if (ms.cash.signum() < 0) ms.cash = BigInteger.ZERO;
            ms.savings = BigInteger.ZERO;
            ms.setLoanLimitUsed(BigInteger.ZERO);
        } catch { /* keep going */ }
        try { p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, -20, -10)); } catch { /* ignore */ }
        const vm = new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_Bankrupt),
            "You went bankrupt. Your debts are wiped, and your savings with them. Your credit is ruined and it's a heavy blow (−20 happiness, −10 sanity) — but life goes on.",
            R.drawable.bank_deposit, null, null, null, null, null, null, 504, null);
        (vm as any).critical = true;   // a big moment: still a corner notice when weekly pop-ups are quiet
        AlertManager.showAlert$default(this, vm, false, 2, null);
    }
    showDeathAlert(attribute: PersonAttribute): void {
        Intrinsics.checkParameterIsNotNull(attribute, "attribute");
        // v0.28.0: if an illness was draining your health, that's what you died of
        let ill: string | null = null;
        try { if (attribute === PersonAttribute.health) ill = Illness.deathCause(GameStateManager.INSTANCE.getPersonState()); } catch { /* ignore */ }
        const lower = ill ? ill.replace(/\b([A-Z])([a-z]+)/g, (_m: string, a: string, b: string) => a.toLowerCase() + b) : "";
        const kind = ill ? ILLNESS_DEFS.find((d) => d.title === ill)?.kind : null;
        const article = ill && (kind === "injury" || /^(heart attack|stroke|bad burn)$/.test(lower)) ? (/^[aeiou]/.test(lower) ? "an " : "a ") : "";
        // v0.30.1: plain words — the only deaths are a stat reaching zero
        void article;
        const what = attribute === PersonAttribute.health ? "health" : attribute === PersonAttribute.happiness ? "happiness" : "sanity";
        this.showDeathAlertWithMessage(`Your ${what} reached zero. You have died.` + (ill ? ` (You had ${lower}.)` : ""), attribute.getTitle());
    }
    /** Death pop-up with any message (used for attribute deaths and Assisted Dying). */
    showDeathAlertWithMessage(message: string, reason: string, image: any = R.drawable.skull): void {
        TelemetryManager.INSTANCE.logEvent("Death_Alert", MapsKt.mapOf(TuplesKt.to("Reason", reason)));
        Obituary.record(GameStateManager.INSTANCE.getPersonState(), reason);
        if (GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) {
            const heirButtons = new ArrayList<AlertActionViewModel>();
            if (Generations.eligibleHeirs(GameStateManager.INSTANCE.getPersonState()).length > 0) {
                heirButtons.add(new AlertActionViewModel("Continue as your child", { invoke: () => Generations.openHeirScreen() }));
            }
            let alertViewModel: AlertViewModel = new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_DeathTitle), message, image, null, null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.DeathTombstoneLifeSummary), {
                invoke: () => {
                Utils.INSTANCE.navigateTo(GenericListType.gameSummary, Constants.ViewModel.INSTANCE.getTombstoneModeDeath(), false);
            }
            }), new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_DeathAction_SecondChance), {
                invoke: () => {
                InAppPurchaseManager.INSTANCE.purchaseProduct(GameInAppPurchase.revive);
            }
            }), heirButtons, null, 280, null);
            AlertManager.quietPick(alertViewModel, "positive");   // v0.29.1 no pop-ups: on to the tombstone (never an automatic revive)
            GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().setHasGameStarted(false);
            GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().addLife(GameStateManager.INSTANCE.getPersonState());
            AlertManager.showAlert$default(this, alertViewModel, false, 2, null);
        }
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
        AlertManager.showAlert$default(this, new AlertViewModel(format, null, Appearance.head(partnerForPlayer), appendAttributesString$default, null, alertActionViewModel, alertActionViewModel2, null, null, 400, null), false, 2, null);
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
        (member as any).deathReason = objArr[2];   // v0.28.0: the family line / will reading use the same reason
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
        // v0.28.1: random events never pop up on their own (they go to News), unless all pop-ups are on
        AlertManager.inWeek++;
        try {
            this.showAlert(new AlertViewModel(title, null, imageId, spannableStringBuilder, null, (arrayList2.size() > 0) ? null : new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Buttons_Okay), {
                invoke: () => {
            }
            }), null, arrayList2, event.getShowAsAlert() ? AlertType.Alert : AlertType.Banner), shouldPrioritize);
        } finally { AlertManager.inWeek--; }
        event.applyEventModifier(personState);
        let mainGameFragment: MainGameFragment = GameStateManager.INSTANCE.getMainGameFragment();
        if (mainGameFragment != null) {
            MainGameFragment.updateUI$default(mainGameFragment, null, 1, null);
        }
    }
    showPromotionAlert(jobState: JobState.JobStateSingle): void {
        Intrinsics.checkParameterIsNotNull(jobState, "jobState");
        AlertManager.inWeek++;   // v0.28.1: promotions go to News (the Work tab shows your new title)
        try { this.showPromotionAlertNow(jobState); } finally { AlertManager.inWeek--; }
    }
    showPromotionAlertNow(jobState: JobState.JobStateSingle): void {
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
        AlertManager.showAlert$default(this, AlertManager.quietPick(new AlertViewModel(Utils.INSTANCE.getString(R.string.Alert_Achievement_Title), null, Integer.valueOf(achievement.getImageId()), ExtensionsKt.appendNormal$default(spannableStringBuilder, format, null, null, null, 14, null), null, new AlertActionViewModel(Utils.INSTANCE.getString(R.string.Alert_Achievement_Button_NewGame), {
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
        }), null, null, 400, null), "negative"), false, 2, null);
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
