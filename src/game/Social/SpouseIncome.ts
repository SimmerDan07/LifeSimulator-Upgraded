// v0.28.1 Your husband or wife works too. A spouse gets a job of their own (picked once, fitting their age and
// the country: no local jobs from elsewhere, no fame careers, no panhandling) and brings home their pay every week,
// straight into the family's money (Player.collectWeeklyValues; it shows as "Spouse's income" in the weekly cash flow).
// They get promoted now and then, retire at the usual age on a pension (40%), and stop earning if you divorce or they
// die. Shown on the Love tab under your partner. A partner you're only dating keeps their money to themselves.
import { BigInteger } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { Job } from "../Enums/Job";
import { Careers } from "../Careers/Careers";
import { World } from "../World/World";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Constants } from "../Utils/Constants";

export interface SpouseJob { job: string; level: number; since: number }

const NO = new Set(["entertainment"]);
const SKIP = new Set(["panHandler", "royalGuard", "translator"]);
const player = (): any => { try { return GameStateManager.INSTANCE.getPersonState(); } catch { return null; } };
const now = (p: any) => { try { return p.calendarWeeks(); } catch { return 0; } };

export const SpouseIncome = {
    /** The spouse whose pay comes home (married, alive), or null. */
    spouse(p: any = player()): any {
        try {
            if (p.getRomanticRelationshipStatus() !== RomanticRelationshipStatus.married) return null;
            const x = p.getFamilyState().getPartner();
            return x != null && x.getIsAlive() ? x : null;
        } catch { return null; }
    },
    retired(x: any): boolean { return x.getAgeInYears() >= Constants.Time.INSTANCE.getRetirementAge(); },
    /** Their career (rolled the first time it's needed). */
    jobOf(x: any): SpouseJob | null {
        if (x == null) return null;
        if (x.spouseJob) return x.spouseJob;
        const p = player();
        const here = p?.getCountry?.()?.name?.();
        const pool = Job.values().filter((j: any) => !SKIP.has(j.name()) && !NO.has(Careers.categoryOf(j) ?? "") && (() => { const c = World.localJobCountries(j); return !c.length || c.includes(here); })());
        const j: any = pool[Math.floor(Math.random() * pool.length)];
        const max = j.getMaxLevels();
        const age = x.getAgeInYears();
        const level = Math.max(1, Math.min(max, 1 + Math.floor(Math.max(0, age - 22) / 8)));
        x.spouseJob = { job: j.name(), level, since: now(p) };
        return x.spouseJob;
    },
    title(x: any): string {
        const s = SpouseIncome.jobOf(x);
        const j: any = s ? (Job as any)[s.job] : null;
        if (!j) return "";
        const titles = j.getJobTitles();
        return titles[Math.min(titles.length - 1, s!.level - 1)] ?? titles[0];
    },
    /** Weekly take-home pay (a pension when retired). */
    weekly(x: any): number {
        const s = SpouseIncome.jobOf(x);
        const j: any = s ? (Job as any)[s.job] : null;
        if (!j) return 0;
        const r = j.pay(Math.min(j.getMaxLevels(), s!.level));
        const mid = (r.getMin() + r.getMax()) / 2;
        return Math.round(mid * 0.85 * (SpouseIncome.retired(x) ? 0.4 : 1));
    },
    collectWeeklyValues(p: any) {
        const x = SpouseIncome.spouse(p);
        if (x == null) return;
        const pay = SpouseIncome.weekly(x);
        if (pay > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(pay), MoneyUpdateType.passiveIncome, "Spouse's income", null, 8, null);
        // a promotion every few years
        const s = SpouseIncome.jobOf(x)!;
        const j: any = (Job as any)[s.job];
        if ((s as any).checked === now(p)) return;   // the cash-flow preview runs this too: roll once a week
        (s as any).checked = now(p);
        if (j && !SpouseIncome.retired(x) && s.level < j.getMaxLevels() && now(p) - s.since > 48 * 3 && Math.random() < 1 / 96) { s.level++; s.since = now(p); }
    },
    /** The Love tab line under your partner. */
    line(x: any): string | null {
        if (x == null || SpouseIncome.spouse() !== x) return null;
        const pay = ExtensionsKt.numberDisplayString(BigInteger.valueOf(SpouseIncome.weekly(x)), true);
        return SpouseIncome.retired(x) ? `${x.getFirstName()} is retired: their pension brings in ${pay} a week.` : `${x.getFirstName()} works as ${ExtensionsKt.aOrAn(SpouseIncome.title(x))}: brings home ${pay} a week.`;
    },
};
