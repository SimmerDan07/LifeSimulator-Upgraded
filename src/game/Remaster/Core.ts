// v0.36.0 "The Remaster": shared helpers and the per-life state (`p.rm`).
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { LifeMoments } from "../Managers/LifeMoments";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { MoneyDestination } from "../Enums/MoneyDestination";
import { Modifiers } from "../Managers/Modifiers";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { BigInteger, R } from "../runtime";
import { Work } from "../Work/Work";

export const player = (): any => GameStateManager.INSTANCE.getPersonState();
export const WPY = (): number => { try { return Constants.Time.INSTANCE.getWeeksPerYear(); } catch { return 48; } };
export const roll = (x: number) => Math.random() < x;
export const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
export const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const img = (k: string) => (R.drawable as any)[k] ?? k;
/** Weeks lived (true age), the clock the remaster keeps time by. */
export const now = (p: any): number => { try { return p.getTrueAgeInWeeks(); } catch { return 0; } };
export const age = (p: any): number => { try { return p.getAgeInYears(); } catch { return 0; } };
export const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
export const num = (b: any): number => { try { return Number(b.toString()); } catch { return 0; } };
export const cash = (p: any): number => num(p.getMoneyState().getCash());
export const savings = (p: any): number => num(p.getMoneyState().getSavings());
/** Spend now (from cash). */
export const pay = (p: any, n: number) => { if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.directSpend, null, null, 12, null); };
/** Receive now (to cash). */
export const earn = (p: any, n: number) => { if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.misc, null, null, 12, null); };
/** A weekly bill shown in the cash flow under `key` (collected in collectWeeklyValues). */
export const bill = (p: any, n: number, key: string) => { if (n > 0) p.getMoneyState().updateMoney(BigInteger.valueOf(Math.round(n)), MoneyUpdateType.expense, key, MoneyDestination.cash); };
/** Weekly income shown in the cash flow under `key`. */
export const income = (p: any, n: number, key: string) => { if (n > 0) p.getMoneyState().updateMoney(BigInteger.valueOf(Math.round(n)), MoneyUpdateType.passiveIncome, key, MoneyDestination.cash); };
export const mods = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
export const weeklyMods = (p: any, h: number, hap: number, san: number, key: string) => p.getAttributeState().setDeltaValue(new Modifiers(h, hap, san), key);

export const Say = {
    /** Something that just happened by itself (the pop-up switch can silence it; it goes to News). */
    note(title: string, text: string, image: any) { try { LifeMoments.result(title, text, image, { random: AlertManager.inWeek > 0 }); } catch { /* no UI */ } },
    /** The result of something the player did, or a big moment: always shows. */
    result(title: string, text: string, image: any) { try { LifeMoments.result(title, text, image); } catch { /* no UI */ } },
    milestone(title: string, text: string, image: any, options?: [string, () => string | null | void][]) {
        try { Work.milestone(title, text, image, options?.map(([l, f]) => [l, () => (f() as any) ?? ""])); } catch { /* no UI */ }
    },
    /** A random event with a choice (silenced: the first option is taken). */
    ask(title: string, text: string, image: any, options: [string, () => string | null | void][]) {
        try { LifeMoments.ask(title, text, image, options.map(([l, f]) => [l, () => (f() as any) ?? ""] as [string, () => string]), { random: AlertManager.inWeek > 0, quiet: "positive" }); } catch { /* no UI */ }
    },
    /** A menu the player opened: always shows. */
    menu(title: string, text: string, image: any, options: [string, () => string | null | void][]) {
        try { LifeMoments.ask(title, text, image, options.map(([l, f]) => [l, () => (f() as any) ?? ""] as [string, () => string])); } catch { /* no UI */ }
    },
};

export interface RmState { v: number; fun: any; bank: any; body: any; things: any; traits: any; feats: any }
export const Rm = {
    st(p: any = player()): RmState {
        if (p.rm == null) p.rm = { v: 1, fun: {}, bank: {}, body: {}, things: {}, traits: {}, feats: {} };
        const r = p.rm as RmState;
        for (const k of ["fun", "bank", "body", "things", "traits", "feats"]) if ((r as any)[k] == null) (r as any)[k] = {};
        return r;
    },
    peek(p: any = player()): RmState | null { return p?.rm ?? null; },
    /** Note something happened (achievements read these). */
    mark(p: any, k: string) { try { const f = Rm.st(p).feats; const m = f.marks ?? (f.marks = {}); m[k] = (m[k] ?? 0) + 1; } catch { /* */ } },
};

export const isVampire = (p: any): boolean => { try { return !!p?.vampire?.isVampire; } catch { return false; } };
export const inJail = (p: any): boolean => { try { return p.getCrimeState().getIsInJail(); } catch { return false; } };

/**
 * v0.36.1: Player.collectWeeklyValues also runs for previews (the HUD's weekly arrows, Cash Flow, Weekly Modifiers).
 * `Week.real > 0` only while a real week is being collected: anything that changes state (loan payments, missed
 * payments, auto-invest) happens only then; previews just show the bills.
 */
export const Week = { real: 0 };
