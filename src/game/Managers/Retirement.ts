// Retirement: from age 60 the player can retire (Work tab, or the pop-up on their 60th birthday) or keep working.
// Retiring ends the job and pays a weekly pension for life. Applying for a job again comes out of retirement
// (the pension stops while you work; retiring again later never pays less than before).
//
// Also: years-in-career text for the job cards. Each career record counts the weeks it was your job
// (JobStateSingle.weeksInCareer, counted in Player.applyWeekly).
import { BigInteger } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Constants } from "../Utils/Constants";

export const Retirement = {
    minAge: 60,
    /** Share of your final weekly pay earned per full year in the career you retire from. */
    sharePerYear: 0.02,
    /** Most a pension can be, as a share of final pay (reached after 35 years). */
    maxShare: 0.7,
    /** Basic weekly pension everyone gets at minimum (US dollars, shown in the player's currency). */
    basicPension: 100,
    /** Weekly happiness / sanity from having time for yourself. */
    weeklyModifiers: new Modifiers(0, 1, 1),

    weeksPerYear(): number { return Constants.Time.INSTANCE.getWeeksPerYear(); },

    // ----- years in a career -----
    weeksIn(state: any): number { return state?.weeksInCareer ?? 0; },
    yearsIn(state: any): number { return Math.floor(Retirement.weeksIn(state) / Retirement.weeksPerYear()); },
    /** "3 years in this career", "1 year in this career", "Less than a year in this career", or null if never worked it. */
    careerText(state: any): string | null {
        const weeks = Retirement.weeksIn(state);
        if (weeks <= 0) return null;
        const years = Retirement.yearsIn(state);
        if (years < 1) return "Less than a year in this career";
        return `${years} ${years === 1 ? "year" : "years"} in this career`;
    },

    // ----- state on the player (plain fields; undefined in older saves) -----
    isRetired(p: any): boolean { return !!p.retired; },
    pension(p: any): number { return p.pensionWeekly ?? 0; },
    canRetire(p: any): boolean { return !Retirement.isRetired(p) && p.getAgeInYears() >= Retirement.minAge; },

    /** Weekly pension you would get if you retired now from your current job. */
    pensionIfRetiredNow(p: any): number {
        const st = p.getJobState().getCurrentJobState();
        let amount = Retirement.basicPension;
        if (st != null) {
            const range = st.getSalaryRange();
            const pay = (range.getMin() + range.getMax()) / 2;
            const share = Math.min(Retirement.maxShare, Retirement.sharePerYear * Retirement.yearsIn(st));
            amount = Math.max(amount, Math.round(pay * share));
        }
        return Math.max(amount, Retirement.pension(p));
    },

    money(n: number): string { return ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true); },

    // ----- Work tab row -----
    cell(): ActionCellSingleViewModel | null {
        const p = GameStateManager.INSTANCE.getPersonState();
        if (Retirement.isRetired(p)) {
            const from = p.retiredFrom ? ` from ${p.retiredFrom}` : "";
            return new ActionCellSingleViewModel(null, "Retired",
                new TextLabelViewModel(`You retired${from} at ${p.retiredAtAge ?? Retirement.minAge}. Pension: ${Retirement.money(Retirement.pension(p))} a week. Applying for a job brings you out of retirement.`, null, false, false, null, null),
                ButtonViewModel.INSTANCE.getHidden(), null, null);
        }
        if (!Retirement.canRetire(p)) return null;
        const st = p.getJobState().getCurrentJobState();
        const years = st != null ? Retirement.yearsIn(st) : 0;
        const detail = st != null
            ? `${years} ${years === 1 ? "year" : "years"} in your career: 2% of your pay for each year, up to 70%.`
            : "You have no job, so you get the basic pension.";
        return new ActionCellSingleViewModel(null, "Retire",
            new TextLabelViewModel(`Stop working and get ${Retirement.money(Retirement.pensionIfRetiredNow(p))} a week for life. ${detail}`, null, false, false, null, null),
            new ButtonViewModel("Retire", null, true, false, false, true, false, { invoke: () => { Retirement.confirm(); return null; } }),
            null, null);
    },

    confirm() {
        const p = GameStateManager.INSTANCE.getPersonState();
        if (!Retirement.canRetire(p)) return;
        const job = p.getJobState().getCurrentJobState();
        const what = job != null ? `leave your job as ${job.getJobTitle()} and ` : "";
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Retire",
            `Retire now? You'll ${what}get a pension of ${Retirement.money(Retirement.pensionIfRetiredNow(p))} a week for the rest of your life.`,
            null, null, null,
            new AlertActionViewModel("Retire", { invoke: () => { Retirement.retire(); return null; } }),
            new AlertActionViewModel("Keep working", { invoke: () => null }),
            null, AlertType.Alert, 0, null), false, 2, null);
    },

    /** Retires the player. Returns the weekly pension. */
    retire(): number {
        const p = GameStateManager.INSTANCE.getPersonState();
        const pension = Retirement.pensionIfRetiredNow(p);
        const job = p.getJobState().getCurrentJobState();
        p.retired = true;
        p.pensionWeekly = pension;
        p.retiredFrom = job != null ? job.getJobTitle() : null;
        p.retiredAtAge = p.getAgeInYears();
        p.retirementOffered = true;
        p.getJobState().setCurrentJob(null);
        p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, 10, 5));
        let story = "You retired.";
        if (job != null) {
            const y = Retirement.yearsIn(job);
            const span = y < 1 ? "less than a year" : `${y} ${y === 1 ? "year" : "years"}`;
            story = `After ${span} in your career, you retired as ${job.getJobTitle()}.`;
        }
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Happy Retirement!",
            `${story} Your pension is ${Retirement.money(pension)} a week.`,
            null, null, null, null, null, null, null, 504, null), false, 2, null);
        Retirement.refresh();
        return pension;
    },

    /** Called when applying for a job. Asks first if the player is retired; runs `apply` when it's fine to go ahead. */
    beforeApplying(apply: () => void) {
        const p = GameStateManager.INSTANCE.getPersonState();
        if (!Retirement.isRetired(p)) { apply(); return; }
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Back to Work?",
            `You're retired. Taking this job stops your ${Retirement.money(Retirement.pension(p))}-a-week pension while you work. You can retire again any time.`,
            null, null, null,
            new AlertActionViewModel("Go back to work", { invoke: () => { p.retired = false; apply(); return null; } }),
            new AlertActionViewModel("Stay retired", { invoke: () => null }),
            null, AlertType.Alert, 0, null), false, 2, null);
    },

    /** Weekly pension and the calm of retired life (called from Player.collectWeeklyValues). */
    collectWeeklyValues(p: any) {
        if (!Retirement.isRetired(p)) return;
        const pension = Retirement.pension(p);
        if (pension > 0) {
            MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(pension), MoneyUpdateType.passiveIncome, "Pension", null, 8, null);
        }
        p.getAttributeState().setDeltaValue(Retirement.weeklyModifiers, "Retirement");
    },

    /** Counts a week in the current career (called once per real week from Player.applyWeekly). */
    countWeek(p: any) {
        const st = p.getJobState().getCurrentJobState();
        if (st != null) st.weeksInCareer = Retirement.weeksIn(st) + 1;
    },

    /** On the birthday that makes you 60 (or the first birthday after, for older saves), offer to retire. */
    onNewYear(p: any) {
        if (p.retirementOffered || Retirement.isRetired(p) || p.getAgeInYears() < Retirement.minAge) return;
        if (p.getJobState().getCurrentJob() == null) return;
        p.retirementOffered = true;
        const job = p.getJobState().getCurrentJobState();
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("You Can Retire",
            `You're ${p.getAgeInYears()}! You can retire now with a pension of ${Retirement.money(Retirement.pensionIfRetiredNow(p))} a week, ` +
            `or keep working as ${job.getJobTitle()}. You can also retire later from the Work tab.`,
            null, null, null,
            new AlertActionViewModel("Retire", { invoke: () => { Retirement.retire(); return null; } }),
            new AlertActionViewModel("Keep working", { invoke: () => null }),
            null, AlertType.Alert, 0, null), false, 2, null);
    },

    refresh() {
        const f = GameStateManager.INSTANCE.getMainGameFragment();
        if (f != null) f.updateUI(null);
    },
};
