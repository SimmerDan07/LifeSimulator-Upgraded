// v0.36.0 The Remaster: the Bank. Accounts (the original savings and credit line, plus a kids' fund), loans with
// real terms and a credit score, a small stock market of named companies that rides an economy cycle, funds,
// savings goals, the money story (net worth over the years) and the lottery. Nothing here can kill anyone.
import { Rm, player, now, age, WPY, roll, pick, clamp, money, num, cash, savings, pay, earn, bill, Say, img, rnd } from "./Core";
import { SECTORS, COMPANIES, FUNDS, PHASES, LOAN_OFFERS, CREDIT_BANDS, GOALS, SCRATCH, type Phase, type LoanKind, type LoanOffer } from "./BankData";
import { Perk } from "../Enums/Perk";
import { Trait } from "../Enums/Trait";
import { Traits } from "./Traits";

export interface Loan { id: string; kind: LoanKind; title: string; original: number; balance: number; rate: number; payment: number; weeksLeft: number; missed: number; run: number; ref?: string; since: number }
export interface Goal { id: string; since: number; reached?: number }
export interface BankState {
    v: number; converted?: boolean;
    credit: number | null; onTime: number; misses: number;
    loans: Loan[]; nextLoan: number;
    units: Record<string, number>; basis: Record<string, number>;
    prices: Record<string, number>; last: Record<string, number>; yearAgo: Record<string, number>;
    phase: Phase; phaseUntil: number; phaseSince: number;
    auto: number; autoInto: string;
    goals: Goal[];
    kids: Record<string, { name: string; amount: number }>;
    worth: { age: number; value: number }[];
    scratch: { bought: number; won: number };
    collections?: number;
}

const gauss = () => { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const ASSETS = (): string[] => [...COMPANIES.map((c) => c.id), ...FUNDS.map((f) => f.id)];

export const Bank = {
    st(p: any = player()): BankState {
        const r = Rm.st(p);
        const b = r.bank as BankState;
        if (b.v == null) {
            Object.assign(b, {
                v: 1, credit: null, onTime: 0, misses: 0, loans: [], nextLoan: 1, units: {}, basis: {}, prices: {}, last: {}, yearAgo: {},
                phase: "steady", phaseUntil: now(p) + rnd(1, 3) * WPY(), phaseSince: now(p), auto: 0, autoInto: "index", goals: [], kids: {}, worth: [], scratch: { bought: 0, won: 0 },
            } as BankState);
            for (const c of COMPANIES) b.prices[c.id] = c.price * (0.8 + Math.random() * 0.4);
            for (const f of FUNDS) b.prices[f.id] = f.price;
            b.last = { ...b.prices }; b.yearAgo = { ...b.prices };
        }
        for (const id of ASSETS()) if (b.prices[id] == null) { const d: any = COMPANIES.find((c) => c.id === id) ?? FUNDS.find((f) => f.id === id); b.prices[id] = d.price; b.last[id] = d.price; b.yearAgo[id] = d.price; }
        if (b.credit == null && age(p) >= 18) b.credit = Bank.startingCredit(p);
        if (!b.converted) Bank.convert(p, b);
        return b;
    },
    peek(p: any = player()): BankState | null { const b = p?.rm?.bank; return b?.v ? b : null; },
    startingCredit(p: any): number {
        let c = 650;
        try { if (p.hasPerk(Perk.goodCreditScore)) c += 60; } catch { /* */ }
        try { if (p.getTraitState().getTraits().contains(Trait.frugal)) c += 20; } catch { /* */ }
        return c;
    },
    /** An old save's single stock becomes the Index Fund (same value), once. */
    convert(p: any, b: BankState) {
        b.converted = true;
        try {
            const s = p.getStockState();
            const shares = num(s.getSharesOwned());
            if (shares > 0) {
                const value = shares * s.getCostPerShare();
                b.units.index = (b.units.index ?? 0) + value / b.prices.index;
                b.basis.index = (b.basis.index ?? 0) + value;
                s.setSharesOwned(s.getSharesOwned().subtract(s.getSharesOwned()));
            }
        } catch { /* */ }
    },

    // ------------------------------------------------------------------ credit
    creditBand(score: number) { return CREDIT_BANDS.find((x) => score >= x.min) ?? CREDIT_BANDS[CREDIT_BANDS.length - 1]; },
    credit(p: any = player()): number | null { return Bank.st(p).credit; },
    addCredit(p: any, d: number) { const b = Bank.st(p); if (b.credit == null) return; b.credit = clamp(Math.round(b.credit + d), 300, 850); },
    rate(p: any = player(), kind: LoanKind = "personal"): number {
        const c = Bank.credit(p) ?? 650;
        const base = Bank.creditBand(c).rate;
        return kind === "student" ? 0.055 : kind === "car" ? Math.max(0.04, base - 0.03) : base;
    },
    mortgageRate(p: any = player()): number { return Bank.creditBand(Bank.credit(p) ?? 650).mortgage; },

    // ------------------------------------------------------------------ loans
    payment(principal: number, rate: number, weeks: number): number {
        const r = rate / WPY();
        return r === 0 ? principal / weeks : (principal * r) / (1 - Math.pow(1 + r, -weeks));
    },
    debt(p: any = player()): number { return (Bank.peek(p)?.loans ?? []).reduce((s, l) => s + l.balance, 0); },
    weeklyPayments(p: any = player()): number { return (Bank.peek(p)?.loans ?? []).reduce((s, l) => s + l.payment, 0); },
    offerLock(p: any, o: LoanOffer): string | null {
        if (age(p) < 18) return "Ages 18+";
        const b = Bank.st(p);
        if (o.kind === "student") {
            if (!Bank.studentOk(p)) return "Only while you're working on a degree";
            if (b.loans.some((l) => l.kind === "student")) return "You already have one";
            return null;
        }
        if ((b.credit ?? 0) < o.minCredit) return `Needs a credit score of ${o.minCredit}`;
        if (b.loans.filter((l) => l.kind === "personal").length >= 2) return "Two personal loans at a time";
        const income = Bank.weeklyIncome(p);
        const pay = Bank.payment(o.amount, Bank.rate(p, o.kind), o.years * WPY());
        if (pay + Bank.weeklyPayments(p) > Math.max(150, income * 0.45)) return "The bank says you can't afford the payments";
        return null;
    },
    /** Whether you're working on a degree. */
    studentOk: (p: any): boolean => { try { return p.getCompletableActionState().deduceCurrentDegreeBeingWorkedOn() != null; } catch { return false; } },
    /** Roughly what comes in a week (pay, pension, rent from tenants…), for affordability. */
    weeklyIncome(p: any): number {
        try { const t = num(p.getTotalCashFlowPerWeek()); return Math.max(0, t + Bank.weeklyPayments(p)); } catch { return 0; }
    },
    take(p: any, o: LoanOffer): string {
        const lock = Bank.offerLock(p, o);
        if (lock) return lock;
        const l = Bank.addLoan(p, o.kind, o.title, o.amount, o.years);
        earn(p, o.amount);
        return `The bank lent you ${money(o.amount)} at ${(l.rate * 100).toFixed(1)}%. You'll pay ${money(l.payment)} a week for ${o.years} years.`;
    },
    addLoan(p: any, kind: LoanKind, title: string, amount: number, years: number, ref?: string): Loan {
        const b = Bank.st(p);
        const rate = Bank.rate(p, kind);
        const weeks = years * WPY();
        const l: Loan = { id: "L" + b.nextLoan++, kind, title, original: amount, balance: amount, rate, payment: Math.round(Bank.payment(amount, rate, weeks) * 100) / 100, weeksLeft: weeks, missed: 0, run: 0, ref, since: now(p) };
        b.loans.push(l);
        return l;
    },
    payOff(p: any, id: string): string {
        const b = Bank.st(p);
        const l = b.loans.find((x) => x.id === id);
        if (!l) return "";
        const due = Math.ceil(l.balance);
        if (cash(p) < due) return `You need ${money(due)} in cash.`;
        pay(p, due);
        b.loans = b.loans.filter((x) => x !== l);
        Bank.addCredit(p, 10);
        Rm.mark(p, "loanPaid");
        return `${l.title} paid off. One less bill (credit score +10).`;
    },
    /** Weekly payments: on time builds your score; short of cash, it's a missed payment. */
    collectPayments(p: any) {
        const b = Bank.peek(p);
        if (!b || !b.loans.length) return;
        let available = cash(p);
        for (const l of [...b.loans]) {
            const due = Math.min(l.payment, l.balance * (1 + l.rate / WPY()));
            if (available >= due) {
                available -= due;
                bill(p, due, l.title);
                l.balance = Math.max(0, l.balance * (1 + l.rate / WPY()) - due);
                l.weeksLeft--; l.run = 0;
                b.onTime++;
                if (b.onTime % 4 === 0) Bank.addCredit(p, 1);
                if (l.balance < 0.5 || l.weeksLeft <= 0) {
                    b.loans = b.loans.filter((x) => x !== l);
                    Bank.addCredit(p, 15);
                    Rm.mark(p, "loanPaid");
                    Say.note("Loan Paid Off", `Your ${l.title.toLowerCase()} is paid off. Credit score +15.`, img("icon_rm_loan"));
                }
            } else {
                Bank.miss(p, b, l);
            }
        }
    },
    miss(p: any, b: BankState, l: Loan) {
        l.missed++; l.run++; b.misses++;
        l.balance += 25;   // a late fee
        Bank.addCredit(p, -15);
        if (l.run === 1) Say.note("Missed Payment", `You didn't have the ${money(l.payment)} for your ${l.title.toLowerCase()}. A $25 late fee and your credit score dropped.`, img("icon_rm_loan"));
        else if (l.run === 4) Say.milestone("Final Notice", `You've missed four payments in a row on your ${l.title.toLowerCase()}. ${l.ref ? "Miss two more and they'll take back what it paid for." : "Miss more and it goes to collections."}`, img("icon_rm_loan"));
        if (l.run >= 6 && l.ref) {
            const what = Bank.repossess?.(p, l.ref) ?? "it";
            b.loans = b.loans.filter((x) => x !== l);
            Bank.addCredit(p, -60);
            Say.milestone("Repossessed", `The bank took back ${what}. The loan is gone with it, but your credit score fell a long way.`, img("icon_rm_loan"));
        } else if (l.run >= 8) {
            l.balance *= 1.1; l.run = 0;
            Bank.addCredit(p, -60);
            b.collections = (b.collections ?? 0) + 1;
            Say.milestone("Sent to Collections", `Your ${l.title.toLowerCase()} went to a debt collector: the balance grew 10% and your credit score took a big hit. Payments carry on as before.`, img("icon_rm_loan"));
        }
    },
    /** Set by Things: take back the item a loan paid for; returns its name. */
    repossess: null as ((p: any, ref: string) => string) | null,

    // ------------------------------------------------------------------ the market
    phase(p: any = player()) { return PHASES.find((x) => x.id === Bank.st(p).phase)!; },
    nextPhase(p: any) {
        const b = Bank.st(p);
        const cur = b.phase;
        const choices: [Phase, number][] = cur === "recession" ? [["steady", 0.6], ["boom", 0.3], ["slump", 0.1]]
            : cur === "boom" ? [["steady", 0.5], ["slump", 0.35], ["recession", 0.15]]
            : cur === "slump" ? [["recession", 0.3], ["steady", 0.55], ["boom", 0.15]]
            : [["boom", 0.35], ["slump", 0.4], ["recession", 0.1], ["steady", 0.15]];
        let x = Math.random(), next: Phase = choices[0][0];
        for (const [id, w] of choices) { if (x < w) { next = id; break; } x -= w; }
        b.phase = next; b.phaseSince = now(p);
        b.phaseUntil = now(p) + (next === "recession" ? rnd(1, 2) : rnd(1, 4)) * WPY();
        const ph = PHASES.find((q) => q.id === next)!;
        if (next !== cur) Say.note(`The Economy: ${ph.title}`, ph.blurb, img("icon_rm_market"));
    },
    tickMarket(p: any) {
        const b = Bank.st(p);
        if (now(p) >= b.phaseUntil) Bank.nextPhase(p);
        const ph = Bank.phase(p);
        const W = WPY();
        b.last = { ...b.prices };
        const secShock: Record<string, number> = {};
        for (const s of SECTORS) secShock[s.id] = gauss() * s.vol;
        let sum = 0;
        for (const c of COMPANIES) {
            const s = SECTORS.find((x) => x.id === c.sector)!;
            let r = (ph.yearly * s.beta + c.edge) / W + secShock[c.sector] + gauss() * 0.015;
            if (roll(0.002)) { const big = (roll(0.5) ? 1 : -1) * (0.15 + Math.random() * 0.2); r += big; Bank.companyNews(p, c.id, big); }
            b.prices[c.id] = Math.max(0.5, b.prices[c.id] * (1 + r));
            sum += r;
        }
        b.prices.index *= 1 + sum / COMPANIES.length;
        b.prices.bonds *= 1 + (0.035 + (ph.id === "recession" ? 0.03 : 0)) / W + gauss() * 0.002;
        b.prices.gold *= 1 + ({ boom: -0.03, steady: 0.03, slump: 0.08, recession: 0.15 } as any)[ph.id] / W + gauss() * 0.02;
        let cr = 0.3 / W + gauss() * 0.1;
        if (roll(0.004)) { cr = -0.5; Bank.cryptoNews(p, "crash"); } else if (roll(0.004)) { cr = 0.8; Bank.cryptoNews(p, "moon"); }
        b.prices.crypto = Math.max(1, b.prices.crypto * (1 + cr));
        if (now(p) % W === 0) b.yearAgo = { ...b.prices };
    },
    companyNews(p: any, id: string, r: number) {
        const b = Bank.st(p);
        if (!(b.units[id] > 0)) return;
        const c = COMPANIES.find((x) => x.id === id)!;
        Say.note(r > 0 ? `${c.name} Soars` : `${c.name} Tumbles`, r > 0 ? `Great news at ${c.name}: the stock jumped ${Math.round(r * 100)}% this week. You own some.` : `Bad news at ${c.name}: the stock fell ${Math.round(-r * 100)}% this week. You own some.`, img("icon_rm_market"));
    },
    cryptoNews(p: any, kind: "crash" | "moon") {
        if (!(Bank.st(p).units.crypto > 0)) return;
        Say.note(kind === "crash" ? "Crypto Crashes" : "Crypto to the Moon", kind === "crash" ? "Crypto lost half its value in a week." : "Crypto jumped 80% in a week.", img("icon_rm_crypto"));
    },
    title(id: string): string { return COMPANIES.find((c) => c.id === id)?.name ?? FUNDS.find((f) => f.id === id)?.title ?? id; },
    price(p: any, id: string): number { return Bank.st(p).prices[id] ?? 0; },
    value(p: any, id: string): number { const b = Bank.peek(p); return b ? (b.units[id] ?? 0) * (b.prices[id] ?? 0) : 0; },
    invested(p: any = player()): number { const b = Bank.peek(p); if (!b) return 0; return Object.keys(b.units).reduce((s, id) => s + (b.units[id] ?? 0) * (b.prices[id] ?? 0), 0); },
    change(p: any, id: string, since: "week" | "year" = "week"): number {
        const b = Bank.st(p); const old = since === "week" ? b.last[id] : b.yearAgo[id];
        return old ? b.prices[id] / old - 1 : 0;
    },
    buyLock(p: any, amount: number): string | null {
        if (age(p) < 18) return "Ages 18+";
        if (amount < 1) return "Nothing to invest";
        if (cash(p) < amount) return "Not enough cash";
        return null;
    },
    buy(p: any, id: string, amount: number): string {
        const lock = Bank.buyLock(p, amount);
        if (lock) return lock;
        const b = Bank.st(p);
        pay(p, amount);
        b.units[id] = (b.units[id] ?? 0) + amount / b.prices[id];
        b.basis[id] = (b.basis[id] ?? 0) + amount;
        return `Bought ${money(amount)} of ${Bank.title(id)}.`;
    },
    sell(p: any, id: string, share = 1): string {
        const b = Bank.st(p);
        const u = b.units[id] ?? 0;
        if (u <= 0) return "You don't own any";
        const sold = u * share, value = sold * b.prices[id];
        const basis = (b.basis[id] ?? 0) * share;
        b.units[id] = u - sold; b.basis[id] = (b.basis[id] ?? 0) - basis;
        if (b.units[id] < 1e-9) { delete b.units[id]; delete b.basis[id]; }
        earn(p, value);
        const gain = value - basis;
        return `Sold ${money(value)} of ${Bank.title(id)} (${gain >= 0 ? "a gain of " + money(gain) : "a loss of " + money(-gain)}).`;
    },
    /** Set it and forget it: a weekly amount into a fund. */
    autoInvest(p: any) {
        const b = Bank.peek(p);
        if (!b || !(b.auto > 0)) return;
        if (cash(p) - b.auto < 0) return;
        b.units[b.autoInto] = (b.units[b.autoInto] ?? 0) + b.auto / b.prices[b.autoInto];
        b.basis[b.autoInto] = (b.basis[b.autoInto] ?? 0) + b.auto;
        bill(p, b.auto, `Auto-invest (${Bank.title(b.autoInto)})`);
    },

    // ------------------------------------------------------------------ goals, kids' fund, worth
    goalProgress(p: any): number { return cash(p) + savings(p) + Bank.invested(p); },
    addGoal(p: any, id: string): string {
        const b = Bank.st(p);
        if (b.goals.some((g) => g.id === id)) return "";
        if (b.goals.filter((g) => !g.reached).length >= 3) return "Three goals at a time.";
        b.goals.push({ id, since: now(p) });
        return `New goal: ${GOALS.find((g) => g.id === id)!.title}.`;
    },
    dropGoal(p: any, id: string) { const b = Bank.st(p); b.goals = b.goals.filter((g) => g.id !== id); },
    checkGoals(p: any) {
        const b = Bank.peek(p);
        if (!b) return;
        const have = Bank.goalProgress(p);
        for (const g of b.goals) {
            if (g.reached) continue;
            const d = GOALS.find((x) => x.id === g.id);
            if (d && have >= d.target) { g.reached = now(p); Say.milestone("Goal Reached", `${d.title}: you've saved ${money(d.target)}. ${d.blurb}`, img(d.image)); }
        }
    },
    kidsOf(p: any): any[] {
        try { return Array.from(p.getFamilyState().getAliveChildren() as any); } catch { return []; }
    },
    fundFor(p: any, kid: any, amount: number): string {
        if (cash(p) < amount) return "Not enough cash";
        const b = Bank.st(p);
        pay(p, amount);
        const f = b.kids[kid.getId()] ?? (b.kids[kid.getId()] = { name: kid.getFirstName(), amount: 0 });
        f.amount += amount;
        return `${money(amount)} into ${kid.getFirstName()}'s fund (${money(f.amount)} now). It grows with bonds and is theirs at 18.`;
    },
    tickKids(p: any) {
        const b = Bank.peek(p);
        if (!b) return;
        for (const id of Object.keys(b.kids)) {
            const f = b.kids[id];
            f.amount *= 1 + 0.04 / WPY();
            const kid = Bank.kidsOf(p).find((k: any) => k.getId() === id);
            if (!kid) continue;
            if (kid.getAgeInYears() >= 18) {
                try { kid.setRelationshipProgress(Math.min(1000, kid.getRelationshipProgress() + 100)); } catch { /* */ }
                Say.milestone(`${f.name}'s Fund`, `${f.name} turned 18 and got their fund: ${money(f.amount)}. They're starting adult life without debt. (+100 relationship)`, img("icon_rm_kidsfund"));
                delete b.kids[id];
                Rm.mark(p, "fundPaid");
            }
        }
    },
    /** Set by Things: what your things are worth (for net worth). */
    thingsWorth: null as ((p: any) => number) | null,
    netWorth(p: any = player()): number {
        let n = 0;
        try { n = num(p.getNetWorth()); } catch { n = cash(p) + savings(p); }
        n += Bank.invested(p) - Bank.debt(p);
        try { n -= num(p.getMoneyState().getLoanLimitUsed()); } catch { /* */ }
        n += Bank.thingsWorth?.(p) ?? 0;
        n += Object.values(Bank.peek(p)?.kids ?? {}).reduce((s, f) => s + f.amount, 0);
        return Math.round(n);
    },
    onNewYear(p: any) {
        const b = Bank.st(p);
        b.worth.push({ age: age(p), value: Bank.netWorth(p) });
        if (b.worth.length > 200) b.worth.splice(0, b.worth.length - 200);
    },

    // ------------------------------------------------------------------ the lottery
    scratch(p: any): string {
        if (age(p) < 18) return "Ages 18+";
        if (cash(p) < SCRATCH.cost) return "Not enough cash";
        const b = Bank.st(p);
        pay(p, SCRATCH.cost);
        b.scratch.bought++;
        const x = Math.random();
        let acc = 0;
        const luck = Traits.scratchMult(p) * (Bank.luckHook?.(p) ?? 1);
        for (const [odds, prize] of SCRATCH.odds) {
            acc += odds * luck;
            if (x < acc) {
                earn(p, prize); b.scratch.won += prize;
                if (prize >= 10_000) Rm.mark(p, "scratchBig");
                return prize >= 10_000 ? `You scratched off… ${money(prize)}! Your hands are shaking.` : prize > SCRATCH.cost ? `A winner: ${money(prize)}.` : `You won your ${money(prize)} back.`;
            }
        }
        return pick(["Nothing. Not even close.", "One symbol off. So close.", "Nothing this time."]);
    },

    /** Set by Feats (the Lucky Star head start). */
    luckHook: null as ((p: any) => number) | null,

    // ------------------------------------------------------------------ the week
    collectWeeklyValues(p: any) {
        if (!Bank.peek(p) && age(p) < 18) return;
        Bank.collectPayments(p);
        Bank.autoInvest(p);
    },
    afterWeek(p: any) {
        if (age(p) < 16 && !Bank.peek(p)) return;
        const b = Bank.st(p);
        if (b.credit == null && age(p) >= 18) b.credit = Bank.startingCredit(p);
        Bank.tickMarket(p);
        Bank.tickKids(p);
        Bank.checkGoals(p);
        // a maxed-out credit line weighs on your score
        try { const ms = p.getMoneyState(); const lim = num(ms.getLoanLimit()); if (lim > 0 && num(ms.getLoanLimitUsed()) > lim * 0.8 && now(p) % 4 === 0) Bank.addCredit(p, -1); } catch { /* */ }
    },
    /** Heirs: loans are settled from the estate; investments and kids' funds pass on. */
    inherit(parent: any, heir: any) {
        const pb = Bank.peek(parent);
        if (!pb) return;
        const hb = Bank.st(heir);
        for (const id of Object.keys(pb.units)) { hb.units[id] = (hb.units[id] ?? 0) + pb.units[id] * (pb.prices[id] / hb.prices[id]); hb.basis[id] = (hb.basis[id] ?? 0) + (pb.basis[id] ?? 0); }
        const own = pb.kids[heir.getId?.()];
        if (own) earn(heir, own.amount);
        for (const [id, f] of Object.entries(pb.kids)) if (id !== heir.getId?.()) hb.kids[id] = f;
        const debt = Bank.debt(parent);
        if (debt > 0) pay(heir, Math.min(debt, Math.max(0, cash(heir))));
        pb.units = {}; pb.kids = {}; pb.loans = [];
        hb.phase = pb.phase; hb.phaseUntil = now(heir) + Math.max(WPY(), pb.phaseUntil - now(parent)); hb.prices = { ...pb.prices }; hb.last = { ...pb.last }; hb.yearAgo = { ...pb.yearAgo };
    },
    LOAN_OFFERS, GOALS, FUNDS, COMPANIES, SECTORS,
};
