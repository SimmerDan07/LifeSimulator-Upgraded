// v0.33.0 "The Career Overhaul", stage 6: benefits, the 401(k) and retirement.
//
// - Paid leave: every employer gives 2–6 weeks a year. A week you don't go to work (a Leisure week, a Mental
//   Health Day's share) uses it first and still pays. It resets on your work anniversary.
// - Parental leave: when a baby arrives while you have a job, the next 6 weeks off are paid.
// - Health insurance, gym and online-course perks cover those subscriptions ("Covered by your job").
// - 401(k): put 0–15% of every paycheck in; a "401(k) match" employer adds half of it (up to 6% of pay). It grows
//   with the market (a new return each year, 2–10%). Locked until 60 (early withdrawal: 10% penalty). When you
//   retire it becomes income: 6% of the balance a year, for life, on top of your pension.
// - Pension employers add 1% of pay per year you worked there to the pension. Stock grants pay a bonus every year.
// - Retirement screen (Work tab): what you'd get now and in 5 years; retirees can volunteer and consult.
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Modifiers } from "../Managers/Modifiers";
import { Retirement } from "../Managers/Retirement";
import { Work, WorkDice, money } from "./Work";
import { Workplace } from "./Workplace";

export interface BenefitState {
    leaveYear: number; leaveUsed: number; parental: number; kids: number;
    pct: number; balance: number; ret: number; retYear: number; contributed: number;
    stockYear: number; retiredPay: number; consult: number; volunteer: number;
}
export const K401_OPTIONS = [0, 3, 6, 10, 15];
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { roll, rnd, clamp } = WorkDice;
const WPY = 52;
const add = (p: any, n: number, type = MoneyUpdateType.workIncome) => { n = Math.round(n); if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), type, null, null, 12, null); };
const kidCount = (p: any) => { try { return Array.from(p.getFamilyState().getChildren() as any).length; } catch { return 0; } };

export const Benefits = {
    state(p: any = player()): BenefitState {
        const w: any = Work.state(p);
        const b: BenefitState = w.ben ?? (w.ben = { leaveYear: -1, leaveUsed: 0, parental: 0, kids: kidCount(p), pct: 0, balance: 0, ret: 0.06, retYear: -1, contributed: 0, stockYear: -1, retiredPay: 0, consult: -999, volunteer: -999 });
        return b;
    },
    // ------------------------------------------------------------------ leave
    leaveWeeks(p: any = player()): number {
        const e = Work.employer(p);
        if (!e) return 0;
        const ex: any = e;
        if (ex.leave == null) { let h = 0; for (const c of e.name) h = (h * 31 + c.charCodeAt(0)) % 997; ex.leave = 2 + (h % 5); }
        return ex.leave;
    },
    yearAtJob(p: any = player()): number { const e = Work.employer(p); return e ? Math.floor((Work.now(p) - e.since) / WPY) : 0; },
    leaveLeft(p: any = player()): number {
        const b = Benefits.state(p);
        if (b.leaveYear !== Benefits.yearAtJob(p)) { b.leaveYear = Benefits.yearAtJob(p); b.leaveUsed = 0; }
        return Math.max(0, Benefits.leaveWeeks(p) - b.leaveUsed);
    },
    leaveLock(p: any = player()): string | null { if (Work.job(p) == null) return "Needs a job"; return Benefits.leaveLeft(p) < 0.2 ? "No paid leave left this year" : null; },
    useLeave(p: any, weeks: number) { Benefits.leaveLeft(p); Benefits.state(p).leaveUsed += weeks; },

    // ------------------------------------------------------------------ 401(k)
    setPct(pct: number, p: any = player()) { if (K401_OPTIONS.includes(pct)) Benefits.state(p).pct = pct; },
    matchPct(p: any = player()): number { return Work.hasPerk("match", p) ? Math.min(6, Benefits.state(p).pct) / 2 : 0; },
    /** A paycheck: your 401(k) share comes off the top. Returns what's left to pay you. */
    payroll(p: any, amount: number): number {
        if (!Work.enabled || amount <= 0) return amount;
        const b = Benefits.state(p);
        if (!b.pct) return amount;
        const mine = Math.floor(amount * b.pct / 100);
        const match = Math.floor(amount * Benefits.matchPct(p) / 100);
        b.balance += mine + match; b.contributed += mine;
        return amount - mine;
    },
    locked(p: any = player()): boolean { return p.getAgeInYears() < Retirement.minAge; },
    withdraw(p: any = player()): string {
        const b = Benefits.state(p);
        if (b.balance < 1) return "Your 401(k) is empty.";
        const pen = Benefits.locked(p) ? 0.1 : 0;
        const out = Math.round(b.balance * (1 - pen));
        add(p, out, MoneyUpdateType.passiveIncome);
        b.balance = 0;
        return `You cashed out your 401(k): ${money(out)}${pen ? ` (after a 10% early-withdrawal penalty)` : ""}.`;
    },
    /** 6% a year of the balance, for life (once you retire). */
    payout(p: any = player(), balance = Benefits.state(p).balance): number { return Math.round(balance * 0.06 / WPY); },
    /** Extra weekly retirement income on top of the basic pension (401(k) + pension employer). */
    retirementExtra(p: any = player()): number {
        let n = Benefits.payout(p);
        if (Work.hasPerk("pension", p)) n += Math.round(Workplace.weeklyPay(p) * 0.01 * Benefits.yearAtJob(p));
        return n;
    },
    projected(p: any = player(), years = 5): number {
        const b = Benefits.state(p);
        let bal = b.balance;
        const yearly = Workplace.weeklyPay(p) * WPY * (b.pct + Benefits.matchPct(p)) / 100;
        for (let i = 0; i < years; i++) bal = bal * 1.06 + yearly;
        return bal;
    },
    onRetire(p: any) {
        const b = Benefits.state(p);
        b.retiredPay = Workplace.weeklyPay(p);
        b.balance = 0;   // it's in the pension now
    },

    // ------------------------------------------------------------------ the week
    weekly(p: any) {
        const b = Benefits.state(p), now = Work.now(p);
        // the market's return for the year
        const year = Math.floor(now / WPY);
        if (b.retYear !== year) { b.retYear = year; b.ret = (2 + Math.random() * 8) / 100; }
        if (b.balance > 0) b.balance = b.balance * (1 + b.ret / WPY);
        const kids = kidCount(p);
        if (kids > b.kids && Work.job(p) != null) { b.parental = 6; Work.say("Parental Leave", "Congratulations! Your next 6 weeks off work are paid.", "love_baby"); }
        b.kids = kids;
        const job = Work.job(p), w: any = Work.state(p);
        if (job == null) return;
        // a week you didn't go to work: parental leave, then paid leave
        if ((w.workedAt ?? -999) < now - 1) {
            const pay = Workplace.weeklyPay(p);
            if (b.parental > 0) { b.parental--; add(p, pay); }
            else if (Benefits.leaveLeft(p) >= 1) { Benefits.useLeave(p, 1); add(p, pay); }
        }
        // stock grants, once a year
        const e = Work.employer(p);
        if (e && Work.hasPerk("stock", p) && Benefits.yearAtJob(p) > 0 && b.stockYear !== Benefits.yearAtJob(p)) {
            b.stockYear = Benefits.yearAtJob(p);
            const bonus = Workplace.weeklyPay(p) * rnd(2, 5);
            add(p, bonus);
            Work.say("Stock Grant", `Your shares at ${e.name} vested: ${money(bonus)}.`, "bank_stocks");
        }
    },

    // ------------------------------------------------------------------ retired life
    volunteerLock(p: any = player()): string | null { return Work.now(p) - Benefits.state(p).volunteer < 1 ? "Again next week" : null; },
    volunteer(p: any = player()): string {
        Benefits.state(p).volunteer = Work.now(p);
        p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, 3, 2));
        return WorkDice.pick(["You read to kids at the library. One of them hugged you.", "A morning at the food bank. You know everyone's name now.", "You helped plant 40 trees in the park."]);
    },
    consultLock(p: any = player()): string | null {
        if (!Retirement.isRetired(p)) return "For retirees";
        const since = Work.now(p) - Benefits.state(p).consult;
        return since < 4 ? `Again in ${4 - since} week${4 - since === 1 ? "" : "s"}` : null;
    },
    consult(p: any = player()): string {
        const b = Benefits.state(p);
        b.consult = Work.now(p);
        const fee = Math.max(500, Math.round((b.retiredPay || 600) * 2));
        add(p, fee);
        return `Your old field still needs you: a few days of consulting for ${money(fee)}.`;
    },
};
