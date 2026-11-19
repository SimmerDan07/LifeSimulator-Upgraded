// Subscriptions (v0.13.0, Profile tab): things you pay for every week that help you every week.
//
//   Gym Membership   $50/week   +2 health a week     14+
//   Gym Coach        $150/week  +3 health a week     14+, needs a Gym Membership
//   Therapist        $200/week  +4 sanity a week     12+
//
// Subscribing or cancelling is instant (no week passes). The first payment is taken at the end of the week.
// Payments and benefits show in the weekly cash flow and weekly modifiers. While you're in jail they're paused.
// If you end a week in debt, every subscription is cancelled. Cancelling the gym also cancels the coach.
//
// v0.23.0 Automatic Savings (free): 25%, 50%, 75% or 80% of every paycheck goes straight to your savings
// (Player.autoSavePercent; undefined in older saves = off). Player.autoSaved counts the total put away.
// v0.24.0 Pay Bills from Savings (free, On/Off): weekly bills come out of savings while savings can cover them
// (Player.billsFromSavings; the hook is MoneyState.billsFromSavings). v0.24.1: both rows are on the Bank tab only.
import { ArrayList, BigInteger, R } from "../runtime";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";

export interface SubscriptionDef {
    id: string;
    title: string;
    image: any;
    weekly: number;
    mods: [number, number, number];   // health, happiness, sanity — every week
    minAge: number;
    requires?: string;
    blurb: string;
}

export const SUBSCRIPTIONS: SubscriptionDef[] = [
    { id: "gym", title: "Gym Membership", image: R.drawable.health_workout, weekly: 50, mods: [2, 0, 0], minAge: 14, blurb: "Work out whenever you like." },
    { id: "coach", title: "Gym Coach", image: R.drawable.icon_sub_coach, weekly: 150, mods: [3, 0, 0], minAge: 14, requires: "gym", blurb: "A personal trainer at your gym." },
    { id: "therapist", title: "Therapist", image: R.drawable.health_psychologist, weekly: 200, mods: [0, 0, 4], minAge: 12, blurb: "A weekly session for your mental health." },
];

export const AUTO_SAVE_OPTIONS = [25, 50, 75, 80];

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(n), true);
const refreshUI = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };

export const Subscriptions = {
    def(id: string): SubscriptionDef { return SUBSCRIPTIONS.find((d) => d.id === id)!; },
    /** Active subscription ids (Player.subscriptions; undefined in older saves). */
    active(p: any = player()): string[] { return p.subscriptions ?? (p.subscriptions = []); },
    has(id: string, p: any = player()): boolean { return Subscriptions.active(p).includes(id); },
    /** In jail, or (v0.25.2) a vampire lying collapsed: no gym, no coach, no therapist. */
    paused(p: any = player()): boolean { if (p?.vampire?.inTorpor) return true; try { return !!p.getCrimeState().getIsInJail(); } catch { return false; } },
    weeklyTotal(p: any = player()): number { return Subscriptions.active(p).reduce((t, id) => t + (Subscriptions.def(id)?.weekly ?? 0), 0); },

    /** Why you can't subscribe right now, or null. */
    blocked(d: SubscriptionDef, p: any = player()): string | null {
        if (p.getAgeInYears() < d.minAge) return `Must be at least ${d.minAge} years old`;
        if (d.requires && !Subscriptions.has(d.requires, p)) return `Needs a ${Subscriptions.def(d.requires).title}`;
        if (Subscriptions.paused(p)) return "Not while you're in jail";
        if (p.getMoneyState().getCash().compareTo(BigInteger.valueOf(d.weekly)) < 0) return `You need ${money(d.weekly)} for the first week`;
        return null;
    },
    subscribe(id: string, p: any = player()): boolean {
        const d = Subscriptions.def(id);
        if (d == null || Subscriptions.has(id, p) || Subscriptions.blocked(d, p) != null) return false;
        Subscriptions.active(p).push(id);
        return true;
    },
    /** Cancel one (and anything that needs it). */
    cancel(id: string, p: any = player()): string[] {
        const gone = [id, ...SUBSCRIPTIONS.filter((d) => d.requires === id).map((d) => d.id)];
        const before = Subscriptions.active(p);
        p.subscriptions = before.filter((x: string) => !gone.includes(x));
        return gone.filter((x) => before.includes(x));
    },

    /** Weekly payments and benefits (called from Player.collectWeeklyValues, also used for the previews). */
    collectWeeklyValues(p: any) {
        if (Subscriptions.paused(p)) return;
        for (const id of Subscriptions.active(p)) {
            const d = Subscriptions.def(id);
            if (d == null) continue;
            MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(d.weekly), MoneyUpdateType.expense, d.title, null, 8, null);
            p.getAttributeState().setDeltaValue(new Modifiers(d.mods[0], d.mods[1], d.mods[2]), d.title);
        }
    },
    /** After each week: can't pay → everything is cancelled. */
    afterWeek(p: any) {
        const subs = Subscriptions.active(p);
        if (!subs.length || p.getMoneyState().getCash().compareTo(BigInteger.valueOf(0)) >= 0) return;
        const names = subs.map((id) => Subscriptions.def(id)?.title).filter(Boolean).join(", ");
        p.subscriptions = [];
        try {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Subscriptions Cancelled",
                `You're out of money, so your subscriptions were cancelled: ${names}.`, R.drawable.redx, null, null, null, null, null, null, 504, null), false, 2, null);
        } catch { /* no UI */ }
    },

    // ------------------------------------------------------------------ Automatic Savings (v0.23.0)
    /** 0 (off), 25, 50, 75 or 80. */
    autoSave(p: any = player()): number { return p.autoSavePercent ?? 0; },
    setAutoSave(pct: number, p: any = player()) {
        p.autoSavePercent = AUTO_SAVE_OPTIONS.includes(pct) ? pct : 0;
    },
    /** Total put away by Automatic Savings so far. */
    autoSaved(p: any = player()): number { return p.autoSaved ?? 0; },
    /** Pay a paycheck: the Automatic Savings share goes to savings, the rest to cash. Returns the part saved. */
    payCheck(amount: number, p: any = player()): number {
        const ms = p.getMoneyState();
        const pct = Subscriptions.autoSave(p);
        const saved = pct > 0 && amount > 0 ? Math.floor((amount * pct) / 100) : 0;
        MoneyState.updateMoney$default(ms, BigInteger.valueOf(amount - saved), MoneyUpdateType.workIncome, null, null, 12, null);
        if (saved > 0 && !MoneyState.frozen) {
            MoneyState.updateMoney$default(ms, BigInteger.valueOf(saved), MoneyUpdateType.workIncome, null, MoneyDestination.savings, 4, null);
            p.autoSaved = Subscriptions.autoSaved(p) + saved;
        }
        return saved;
    },
    /** The Set Up / Change button: pick a percentage (or turn it off). */
    askAutoSave(p: any = player()) {
        const cur = Subscriptions.autoSave(p);
        const opt = (n: number): [string, () => void] => [`${n}%${cur === n ? " ✓" : ""}`, () => Subscriptions.setAutoSave(n, p)];
        const options: [string, () => void][] = [...AUTO_SAVE_OPTIONS.map(opt), cur > 0 ? ["Turn Off", () => Subscriptions.setAutoSave(0, p)] : ["Cancel", () => {}]];
        const first = options[0], last = options[options.length - 1];
        const extra = new ArrayList<AlertActionViewModel>();
        for (const [label, fn] of options.slice(1, -1)) extra.add(new AlertActionViewModel(label, { invoke: () => { fn(); refreshUI(); return null; } }));
        try {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Automatic Savings",
                "How much of every paycheck should go straight into your savings? The rest goes to your cash like before." +
                (cur > 0 ? `\n\nRight now: ${cur}%.` : ""), R.drawable.hud_bank, null, null,
                new AlertActionViewModel(first[0], { invoke: () => { first[1](); refreshUI(); return null; } }),
                new AlertActionViewModel(last[0], { invoke: () => { last[1](); refreshUI(); return null; } }),
                extra, AlertType.Alert, 0, null), false, 2, null);
        } catch { /* no UI */ }
    },

    // ------------------------------------------------------------------ Pay Bills from Savings (v0.24.0)
    billsFromSavings(p: any = player()): boolean { return !!p?.billsFromSavings; },
    setBillsFromSavings(on: boolean, p: any = player()) { p.billsFromSavings = on; },

    // ------------------------------------------------------------------ Profile tab rows
    /** The two free money rows (also on the Bank tab). */
    moneyCells(): ActionCellSingleViewModel[] {
        return [ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(new AutoSaveCell() as any, null),
            ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(new BillsCell() as any, null)];
    },
    cells(): ActionCellSingleViewModel[] {
        // v0.24.1: Automatic Savings and Pay Bills from Savings live on the Bank tab only
        return [...SUBSCRIPTIONS.map((d) => ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(new SubscriptionCell(d) as any, null))];
    },
};

/** One subscription, in the shape of the game's action rows. The button says "$50/wk" or "Cancel". */
class SubscriptionCell {
    constructor(public d: SubscriptionDef) {}
    on(): boolean { return Subscriptions.has(this.d.id); }
    getTitle(): string { return this.d.title; }
    getImageId(): any { return this.d.image; }
    getCost(): BigInteger { return BigInteger.valueOf(this.on() ? 0 : this.d.weekly); }
    getModifiers(): Modifiers { return new Modifiers(this.d.mods[0], this.d.mods[1], this.d.mods[2]); }
    getActionTitle(): string { return this.on() ? "Cancel" : `${money(this.d.weekly)}/wk`; }
    getAdditionalDescription(): string {
        if (this.on()) return `Active${Subscriptions.paused() ? " (paused while you're in jail)" : ""} · ${money(this.d.weekly)} a week · every week: `;
        return `${this.d.blurb} Every week: `;
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null {
        if (this.on()) return null;
        const b = Subscriptions.blocked(this.d, p);
        // "not enough money" is shown by the greyed-out price button, like other rows
        return b != null && !b.startsWith("You need") ? b : null;
    }
    action(p: any): void {
        if (this.on()) Subscriptions.cancel(this.d.id, p);
        else Subscriptions.subscribe(this.d.id, p);
        refreshUI();
    }
}

/** Automatic Savings (v0.23.0): free. The button says "Set Up" or "Change". */
class AutoSaveCell {
    on(): boolean { return Subscriptions.autoSave() > 0; }
    getTitle(): string { return this.on() ? `Automatic Savings: ${Subscriptions.autoSave()}%` : "Automatic Savings"; }
    getImageId(): any { return R.drawable.hud_bank; }
    getCost(): BigInteger { return BigInteger.valueOf(0); }
    getModifiers(): Modifiers { return new Modifiers(0, 0, 0); }
    getActionTitle(): string { return this.on() ? "Change" : "Set Up"; }
    getAdditionalDescription(): string {
        if (this.on()) return `${Subscriptions.autoSave()}% of every paycheck goes straight to your savings. Saved so far: ${money(Subscriptions.autoSaved())}.`;
        return "Free. Send 25%, 50%, 75% or 80% of every paycheck straight to your savings.";
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(_p: any): string | null { return null; }
    action(p: any): void { Subscriptions.askAutoSave(p); }
}

/** Pay Bills from Savings (v0.24.0): free. The button says "Turn On" or "Turn Off". */
class BillsCell {
    on(): boolean { return Subscriptions.billsFromSavings(); }
    getTitle(): string { return `Pay Bills from Savings: ${this.on() ? "On" : "Off"}`; }
    getImageId(): any { return R.drawable.bank_withdrawal; }
    getCost(): BigInteger { return BigInteger.valueOf(0); }
    getModifiers(): Modifiers { return new Modifiers(0, 0, 0); }
    getActionTitle(): string { return this.on() ? "Turn Off" : "Turn On"; }
    getAdditionalDescription(): string {
        if (this.on()) return "Your weekly bills (rent, food, subscriptions, loans and the rest) come out of your savings. If your savings can't cover a bill, it comes out of your cash.";
        return "Free. Have your weekly bills taken from your savings instead of your cash.";
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(_p: any): string | null { return null; }
    action(p: any): void { Subscriptions.setBillsFromSavings(!Subscriptions.billsFromSavings(p), p); refreshUI(); }
}

// v0.24.0: weekly bills for the current player come out of savings when they've turned it on
MoneyState.billsFromSavings = (ms: any): boolean => {
    try { const p = player(); return p != null && p.getMoneyState() === ms && !!p.billsFromSavings; } catch { return false; }
};
