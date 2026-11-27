// v0.36.0 The Remaster: the screens. The Bank tab, the Money › Things section and its Store, the Health tab's new
// sections, the Leisure tab (categories, choices, company, trips) and the achievements gallery. Lifepaths keys rm-*.
import { ArrayList, Integer, R } from "../runtime";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { GameStateManager } from "../Managers/GameStateManager";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { ActionProgressViewModel } from "../Models/ActionProgressViewModel";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { ImageButtonViewModel } from "../Models/ImageButtonViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { BankAction } from "../Enums/BankAction";
import { BankActionAmount } from "../Enums/BankActionAmount";
import { Possession } from "../Enums/Possession";
import { Achievement } from "../Enums/Achievement";
import { CompletableAction } from "../Enums/CompletableAction";
import { Leisure } from "../Enums/Leisure";
import { player, now, age, WPY, money, num, cash, savings, img, Say, isVampire, inJail } from "./Core";
import { Bank } from "./Bank";
import { SECTORS, COMPANIES, FUNDS, PHASES, LOAN_OFFERS, GOALS } from "./BankData";
import { Things } from "./Things";
import { THINGS, THING_CATS, THING_BY_ID, type ThingDef } from "./ThingsData";
import { Body, ROUTINES } from "./Body";
import { Fun, TIERS, TRIP_LENGTHS, TRIP_BUDGETS, type Tier } from "./Fun";
import { Traits } from "./Traits";
import { Feats, FEATS, FEAT_GROUPS, HEAD_STARTS } from "./Feats";

const refresh = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const hidden = () => ButtonViewModel.INSTANCE.getHidden();
const B = (title: string, enabled: boolean, fn: () => void, lock = false) =>
    new ButtonViewModel(title, null, enabled, false, lock, false, false, { invoke: () => { fn(); refresh(); return null; } });
const row = (image: any, title: string, body: string, button?: any) => new ActionCellSingleViewModel(typeof image === "string" ? img(image) : image, title, text(body), button ?? hidden(), null, null);
const multi = (image: any, title: string, body: string, buttons: any[]) =>
    new ActionCellMultipleOptionsViewModel(typeof image === "string" ? img(image) : image, title, text(body), TextLabelViewModel.INSTANCE.getHidden(), buttons, null, 32, null);
const H = (t: string) => new HeaderTitleViewModel(t);
const prog = (image: any, title: string, body: string, done: boolean, value: number, max: number) =>
    new ActionProgressViewModel(typeof image === "string" ? img(image) : image, title, text(body), done ? "Complete" : null, new ProgressBarViewModel(Math.max(0, Math.min(value, max)), Math.max(1, max), false, false), ImageButtonViewModel.INSTANCE.getHidden(), ButtonViewModel.INSTANCE.getHidden());
export const open = (key: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null);
const link = (image: any, title: string, body: string, key: string, label = "Open") => row(image, title, body, B(label, true, () => open(key)));
const say = (title: string, t: string | void | null, image: any) => { if (t) Say.result(title, t, typeof image === "string" ? img(image) : image); };
const pct = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`;
const short = (n: number) => (n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `$${Math.round(n / 1e3)}K` : money(n));

/** One of the original bank rows (deposit, withdraw, credit line, lottery), as the game always drew it. */
function bankActionRow(p: any, bankAction: any, title?: string): any {
    const buttons: any[] = [];
    for (const amt of BankActionAmount.values()) {
        buttons.push(new ButtonViewModel(amt.buttonText(bankAction), null, amt.buttonEnabled(bankAction), false, bankAction.getLockedString() != null, false, false,
            { invoke: () => { GameStateManager.INSTANCE.getPersonState().bankAction(bankAction, amt); } }, 106, null));
    }
    const lock = bankAction.getLockedString();
    const sub = lock != null ? new TextLabelViewModel(lock, null, false, false, null, null, 62, null) : new TextLabelViewModel("", null, false, false, null, bankAction.getSubtitle(), 30, null);
    const deco = new TextLabelViewModel("", null, false, false, null, bankAction.getDecorator(), 30, null);
    return new ActionCellMultipleOptionsViewModel(Integer.valueOf(bankAction.getImageId()), title ?? bankAction.getTitle(), sub, deco, buttons, null, 32, null);
}

export const RScreens = {
    // ================================================================ Bank tab
    bankTab(p: any = player()): any[] {
        const out: any[] = [];
        const adult = age(p) >= 18;
        const b = adult || Bank.peek(p) ? Bank.st(p) : null;
        out.push(H("Bank"));
        const nw = Bank.netWorth(p);
        out.push(link("icon_rm_worth", `Net Worth: ${money(nw)}`, `Cash ${money(cash(p))} · Savings ${money(savings(p))}${Bank.invested(p) ? ` · Invested ${money(Bank.invested(p))}` : ""}${Bank.debt(p) ? ` · Loans −${money(Bank.debt(p))}` : ""}\nSee where your money comes from and goes, and your net worth over the years.`, "rm-worth", "Money Story"));
        if (b?.credit != null) { const band = Bank.creditBand(b.credit); out.push(new MeterViewModel("Credit Score", b.credit - 300, 550, b.credit >= 670 ? "green" : b.credit >= 580 ? "blue" : "red", `${band.title}. Loans cost ${(band.rate * 100).toFixed(0)}%, mortgages ${(band.mortgage * 100).toFixed(1)}%. Paying on time raises it; missed payments and a maxed-out credit line lower it.`, String(b.credit))); }
        // accounts
        out.push(H("Accounts"));
        out.push(bankActionRow(p, BankAction.deposit));
        out.push(bankActionRow(p, BankAction.withdrawal));
        if (b && Bank.kidsOf(p).length) {
            const total = Object.values(b.kids).reduce((s, f) => s + f.amount, 0);
            out.push(link("icon_rm_kidsfund", "Kids' Fund", `${total ? money(total) + " saved. " : ""}Money for your children that grows like bonds and is theirs at 18.`, "rm-kids"));
        }
        for (const c of RScreens.subsMoneyCells?.() ?? []) out.push(c);
        // loans
        if (adult) {
            out.push(H("Loans"));
            out.push(bankActionRow(p, BankAction.takeLoan, "Credit Line"));
            for (const l of b!.loans) {
                out.push(row("icon_rm_loan", l.title, `${money(l.balance)} left · ${money(l.payment)} a week at ${(l.rate * 100).toFixed(1)}% · ${Math.ceil(l.weeksLeft / WPY())} year${Math.ceil(l.weeksLeft / WPY()) === 1 ? "" : "s"} to go${l.run ? ` · ${l.run} missed in a row` : ""}`,
                    B(`Pay Off ${short(Math.ceil(l.balance))}`, cash(p) >= l.balance, () => say("Paid Off", Bank.payOff(p, l.id), "icon_rm_loan"), cash(p) < l.balance)));
            }
            out.push(link("bank_loan", "Borrow", "Personal and student loans with fixed weekly payments. Car loans are offered when you buy a car; mortgages in Real Estate.", "rm-loans"));
        }
        // investing
        if (adult) {
            out.push(H("Investing"));
            const inv = Bank.invested(p);
            const basis = Object.values(b!.basis).reduce((s, x) => s + x, 0);
            out.push(link("icon_rm_market", inv ? `Investments: ${money(inv)}` : "The Stock Market", `${inv ? `${inv >= basis ? "Up " + money(inv - basis) : "Down " + money(basis - inv)} overall. ` : ""}The economy: ${Bank.phase(p).title}. Funds, bonds, gold, crypto and ${COMPANIES.length} companies.`, "rm-market", inv ? "Manage" : "Open"));
            out.push(multi("icon_rm_auto", `Auto-Invest: ${b!.auto ? money(b!.auto) + " a week" : "Off"}`, `Set it and forget it: a weekly amount into the ${Bank.title(b!.autoInto)} whenever you have the cash.`,
                [0, 50, 200, 1000].map((n) => B(n ? short(n) : "Off", b!.auto !== n, () => { b!.auto = n; }))));
        }
        // goals
        if (adult) {
            out.push(H("Savings Goals"));
            const have = Bank.goalProgress(p);
            for (const g of b!.goals) {
                const d = GOALS.find((x) => x.id === g.id)!;
                out.push(prog(d.image, d.title, g.reached ? "Reached!" : `${money(Math.min(have, d.target))} of ${money(d.target)} (cash, savings and investments)`, !!g.reached, have, d.target));
            }
            out.push(link("bank_deposit", b!.goals.length ? "Change Goals" : "Set a Goal", "Pick up to three things to save for. Reaching one is a milestone.", "rm-goals"));
        }
        // lottery
        if (adult) {
            out.push(H("Lottery"));
            out.push(bankActionRow(p, BankAction.buyLottery));
            out.push(row("bank_lottery", "Scratch Card", `$5. Instant prizes up to $1,000,000.${b!.scratch.bought ? ` You've bought ${b!.scratch.bought} and won ${money(b!.scratch.won)}.` : ""}`,
                B("$5", cash(p) >= 5, () => say("Scratch Card", Bank.scratch(p), "bank_lottery"))));
        }
        return out;
    },
    /** Set at install: Automatic Savings and Pay Bills from Savings (Subscriptions.moneyCells). */
    subsMoneyCells: null as (() => any[]) | null,

    market(p: any = player()): any[] {
        const out: any[] = [];
        const b = Bank.st(p);
        const ph = Bank.phase(p);
        out.push(row("icon_rm_market", `The Economy: ${ph.title}`, `${ph.blurb} Phases last one to four years. Prices change every week.`));
        const amounts = [1000, 10_000, 100_000];
        const assetRow = (id: string, title: string, image: string, blurb: string) => {
            const v = Bank.value(p, id), basis = b.basis[id] ?? 0;
            const own = v > 0 ? `\nYou own ${money(v)} (${v >= basis ? "up " + money(v - basis) : "down " + money(basis - v)}).` : "";
            const buttons = amounts.map((a) => B(`Buy ${short(a)}`, cash(p) >= a, () => say("Bought", Bank.buy(p, id, a), image), cash(p) < a));
            if (v > 0) { buttons.push(B("Sell Half", true, () => say("Sold", Bank.sell(p, id, 0.5), image))); buttons.push(B("Sell All", true, () => say("Sold", Bank.sell(p, id, 1), image))); }
            return multi(image, title, `${money(b.prices[id])} · this week ${pct(Bank.change(p, id))} · this year ${pct(Bank.change(p, id, "year"))}\n${blurb}${own}`, buttons);
        };
        out.push(H("Funds"));
        for (const f of FUNDS) out.push(assetRow(f.id, f.title, f.id === "crypto" ? "icon_rm_crypto" : "icon_rm_fund", `${f.blurb} Risk: ${f.risk}.`));
        const canPick = p.getCompletableActionState().isCompleted(CompletableAction.personalFinance);
        for (const s of SECTORS) {
            out.push(H(s.title));
            if (!canPick) { out.push(row("bank_withdrawal", "Pick Your Own Stocks", `${s.blurb} Needs the Personal Finance course (Education) before you can buy single companies. Funds are open to everyone.`)); continue; }
            for (const c of COMPANIES.filter((x) => x.sector === s.id)) out.push(assetRow(c.id, c.name, "icon_rm_stock", c.blurb));
        }
        return out;
    },
    loans(p: any = player()): any[] {
        const out: any[] = [];
        const b = Bank.st(p);
        const band = Bank.creditBand(b.credit ?? 650);
        out.push(row("icon_rm_loan", `Your Credit: ${b.credit ?? "none yet"} (${band.title})`, `Personal loans cost ${(band.rate * 100).toFixed(0)}% a year at your score. Every payment on time helps; a missed one costs a $25 fee and drops your score. Six missed in a row on a car loan and the bank takes the car back.`));
        out.push(H("Loans"));
        for (const o of LOAN_OFFERS) {
            const rate = Bank.rate(p, o.kind);
            const pay = Bank.payment(o.amount, rate, o.years * WPY());
            const lock = Bank.offerLock(p, o);
            out.push(row("bank_loan", `${o.title}: ${money(o.amount)}`, `${(rate * 100).toFixed(1)}% over ${o.years} years: ${money(pay)} a week.${o.kind === "student" ? " For tuition and living costs while you study." : ""}${lock ? `\n${lock}.` : ""}`,
                B(lock ? "Locked" : "Borrow", !lock, () => say("Loan", Bank.take(p, o), "bank_loan"), !!lock)));
        }
        return out;
    },
    goals(p: any = player()): any[] {
        const out: any[] = [];
        const b = Bank.st(p);
        const have = Bank.goalProgress(p);
        out.push(row("bank_deposit", "Savings Goals", `Your cash, savings and investments count toward every goal (${money(have)} now). Up to three at a time.`));
        for (const g of GOALS) {
            const on = b.goals.find((x) => x.id === g.id);
            out.push(row(g.image, `${g.title}: ${money(g.target)}`, `${g.blurb}${on?.reached ? " Reached!" : on ? ` ${Math.min(100, Math.floor((have / g.target) * 100))}% there.` : ""}`,
                on ? B(on.reached ? "Clear" : "Drop", true, () => Bank.dropGoal(p, g.id)) : B("Save for It", b.goals.filter((x) => !x.reached).length < 3, () => say("Savings Goal", Bank.addGoal(p, g.id), g.image))));
        }
        return out;
    },
    kids(p: any = player()): any[] {
        const out: any[] = [];
        const b = Bank.st(p);
        out.push(row("icon_rm_kidsfund", "Kids' Fund", "Put money aside for each child. It grows about 4% a year and is paid to them at 18 (they'll love you for it). If one of them is your heir, theirs comes with you."));
        for (const k of Bank.kidsOf(p)) {
            if (k.getAgeInYears() >= 18) continue;
            const f = b.kids[k.getId()];
            out.push(multi("icon_rm_kidsfund", `${k.getFirstName()}, ${k.getAgeInYears()}`, f ? `${money(f.amount)} saved.` : "Nothing saved yet.",
                [1000, 10_000, 100_000].map((n) => B(`Add ${short(n)}`, cash(p) >= n, () => say("Kids' Fund", Bank.fundFor(p, k, n), "icon_rm_kidsfund"), cash(p) < n))));
        }
        return out;
    },
    worth(p: any = player()): any[] {
        const out: any[] = [];
        out.push(H("What You Have"));
        const parts: [string, number][] = [["Cash", cash(p)], ["Savings", savings(p)], ["Investments", Bank.invested(p)],
            ["Property (after mortgages)", (() => { try { return p.getRealEstate().totalEquity(); } catch { return 0; } })()], ["Your things", Things.worth(p)],
            ["Kids' funds", Object.values(Bank.peek(p)?.kids ?? {}).reduce((s, f) => s + f.amount, 0)],
            ["Loans", -Bank.debt(p)], ["Credit line", -(() => { try { return num(p.getMoneyState().getLoanLimitUsed()); } catch { return 0; } })()]];
        for (const [k, v] of parts) if (Math.round(v)) out.push(row("icon_rm_worth", k, money(v)));
        out.push(row("icon_rm_worth", `Net Worth: ${money(Bank.netWorth(p))}`, ""));
        out.push(H("Last Week"));
        try {
            const d = p.getMoneyState().getWeeklyDelta();
            let any = false;
            for (const pr of Array.from(d as any) as any[]) { const v = num(pr.getSecond()); if (!v) continue; any = true; out.push(row(v > 0 ? "bank_deposit" : "bank_withdrawal", pr.getFirst() ?? "Other", `${v > 0 ? "+" : "−"}${money(Math.abs(v))}`)); }
            if (!any) out.push(row("bank_deposit", "Nothing came in or went out", ""));
        } catch { /* */ }
        const w = Bank.peek(p)?.worth ?? [];
        if (w.length) {
            out.push(H("Over the Years"));
            const max = Math.max(1, ...w.map((x) => Math.abs(x.value)));
            for (const x of w.slice(-40).reverse()) out.push(new MeterViewModel(`Age ${x.age}`, Math.max(0, x.value), max, x.value >= 0 ? "green" : "red", null, money(x.value)));
        }
        return out;
    },

    // ================================================================ Money › Things
    itemsSection(p: any = player()): any[] {
        const out: any[] = [H("Your Things")];
        const owned = Things.owned(p);
        const orig = RScreens.originalOwned(p);
        const best = Things.bestCar(p);
        out.push(link("icon_rm_things", owned.length + orig.length ? `${owned.length + orig.length} Thing${owned.length + orig.length === 1 ? "" : "s"}` : "Nothing Yet", `${owned.length ? `Worth ${money(Things.worth(p))}. ` : ""}${Things.upkeep(p) ? `Upkeep ${money(Things.upkeep(p))} a week. ` : ""}${best ? `You drive a ${best.title}. ` : ""}Sell, give away or use what you own.`, "rm-things", "View"));
        out.push(link("icon_rm_store", "The Store", "Cars, tech, hobby gear, things for your home, style, collectibles and big toys.", "rm-store", "Shop"));
        // the big toys you own: things to do with them
        const toys: [string, "yacht" | "jet" | "rocket", any, string, string][] = [["Throw a Yacht Party", "yacht", "possession_yacht", "Invite your friends out on the water (+40 each).", "Party"], ["Fly Away for the Weekend", "jet", "possession_jet", "Anywhere you like, no queues.", "Fly"], ["Launch Into Space", "rocket", "possession_rocket", "Once in a lifetime.", "Launch"]];
        for (const [title, which, image, blurb, label] of toys) {
            if (!p.getItemState().isOwned(which === "yacht" ? Possession.yacht : which === "jet" ? Possession.privateJet : Possession.rocket)) continue;
            const lock = Things.toyLock(p, which);
            out.push(row(image, title, `${blurb}${lock ? `\n${lock}.` : ""}`, B(label, !lock, () => { const t = which === "yacht" ? Things.yachtParty(p) : which === "jet" ? Things.jetAway(p) : Things.launch(p); say(title, t, image); p.applyWeekly(); }, !!lock)));
        }
        return out;
    },
    /** The original items you own (for the list of your things). */
    originalOwned(p: any): any[] {
        const out: any[] = [];
        try { for (const s of p.getItemState().getStates()) if (s.getOwned() && s.getType() !== Possession.car && s.getType().isAvaliable()) out.push(s); } catch { /* */ }
        return out;
    },
    /** One original item row (buy / upgrade), as the Profile used to show it. */
    originalRow(p: any, pos: any): any {
        const st = p.getItemState().getState(pos);
        const cell: any = ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(pos, Integer.valueOf(st.getLevel()));
        let label: string, enabled: boolean;
        if (st.getOwned() && st.getLevel() === pos.getMaxLevel()) { label = "Owned"; enabled = false; }
        else { const c = pos.costForLevel(st.getLevel() + 1); label = money(num(c)); enabled = p.getMoneyState().getCash().compareTo(c) >= 0; }
        cell.setActionButton(new ButtonViewModel(label, null, enabled, false, false, false, false, { invoke: () => { pos.action(GameStateManager.INSTANCE.getPersonState()); } }, 122, null));
        return cell;
    },
    things(p: any = player()): any[] {
        const out: any[] = [];
        const owned = Things.owned(p);
        if (!owned.length && !RScreens.originalOwned(p).length) out.push(row("icon_rm_things", "Nothing Yet", "Things you buy in the Store show up here."));
        for (const cat of THING_CATS) {
            const list = owned.filter((o) => Things.def(o.id)?.cat === cat.id);
            if (!list.length) continue;
            out.push(H(cat.title));
            for (const o of list) {
                const d = Things.def(o.id)!;
                const v = Things.value(p, o);
                const bits = [`Worth ${money(v)}${d.grow != null ? ` (paid ${money(o.paid)})` : ""}`];
                if (d.upkeep) bits.push(`${money(Math.round(d.upkeep * Traits.upkeepMult(p)))} a week upkeep`);
                if (o.loan) { const l = Bank.peek(p)?.loans.find((x) => x.id === o.loan); if (l) bits.push(`${money(l.balance)} left on the loan`); }
                if (o.from) bits.push(`from ${o.from}`);
                const buttons = [B(`Sell ${short(Math.max(0, Things.sellPrice(p, o)))}`, true, () => say("Sold", Things.sell(p, o.uid), d.image))];
                if (!o.loan) buttons.push(B("Give Away", true, () => RScreens.giftMenu(p, o.uid)));
                out.push(multi(d.image, d.title, `${bits.join(" · ")}\n${RScreens.thingEffects(d)}`, buttons));
            }
        }
        const orig = RScreens.originalOwned(p);
        if (orig.length) {
            out.push(H("Gear and Big Toys"));
            for (const s of orig) out.push(row(s.getType().overrideImageId(Integer.valueOf(Math.max(1, s.getLevel()))), s.getType().getTitle() + (s.getType().getMaxLevel() > 1 ? ` (level ${s.getLevel()})` : ""), "Upgrade or sell it in the Store."));
        }
        return out;
    },
    giftMenu(p: any, uid: string) {
        const people = Fun.people(p).slice(0, 6);
        if (!people.length) { Say.result("Give Away", "There's nobody close to give it to yet.", img("icon_rm_things")); return; }
        Say.menu("Give It to…", "Who should have it? A big gift means a lot.", img("icon_rm_things"), [
            ...people.map((x): [string, () => string] => [x.getFirstName(), () => Things.gift(p, uid, x)]),
            ["Keep it", () => ""],
        ]);
    },
    thingEffects(d: ThingDef): string {
        const fx: string[] = [];
        const m = d.mods;
        if (m) { if (m[1] > 0) fx.push(`+${m[1]} happiness`); if (m[2] > 0) fx.push(`+${m[2]} sanity`); if (m[0] > 0) fx.push(`+${m[0]} health`); if (m[2] < 0) fx.push(`${m[2]} sanity`); }
        const what = fx.length ? `Every week: ${fx.join(", ")}.` : "";
        const extra: string[] = [];
        if (d.fit) extra.push("Helps your fitness.");
        if (d.sleep) extra.push("Better sleep.");
        if (d.cook) extra.push("Home cooking is healthier.");
        if (d.grow != null) extra.push("Its value changes every year.");
        if (d.possession) extra.push(d.blurb.match(/Also counts as[^.]*\./)?.[0] ?? "");
        return [what, ...extra].filter(Boolean).join(" ");
    },
    store(p: any = player()): any[] {
        const out: any[] = [row("icon_rm_store", "The Store", `Cash: ${money(cash(p))}. Cars can be bought with a car loan (10% down).`)];
        for (const c of THING_CATS) {
            const n = Things.inCat(c.id).length + RScreens.originalsIn(c.id).length;
            out.push(link(c.image, c.title, `${c.blurb}\n${n} things`, "rm-store:" + c.id, "Browse"));
        }
        return out;
    },
    /** Where the original items sit in the Store (so nothing is listed twice). */
    originalsIn(cat: string): any[] {
        switch (cat) {
            case "tech": return [Possession.gameConsole, Possession.laptop, Possession.videoEquipment];
            case "hobby": return [Possession.turntable, Possession.campingEquipment];
            case "home": return [Possession.passport];
            case "toy": return [Possession.privateJet, Possession.yacht, Possession.rocket];
            default: return [];
        }
    },
    storeCat(cat: string, p: any = player()): any[] {
        const out: any[] = [];
        const c = THING_CATS.find((x) => x.id === cat);
        if (c) out.push(row(c.image, c.title, `${c.blurb}\nCash: ${money(cash(p))}.`));
        for (const pos of RScreens.originalsIn(cat)) out.push(RScreens.originalRow(p, pos));
        for (const d of Things.inCat(cat)) {
            const lock = Things.lock(p, d), fin = d.cat === "car" ? Things.lock(p, d, true) : "n/a";
            const n = Things.owned(p).filter((o) => o.id === d.id).length;
            const body = `${d.blurb}${n ? ` (You have ${n}.)` : ""}\n${RScreens.thingEffects(d)}${d.upkeep ? ` Upkeep ${money(d.upkeep)} a week.` : ""}${d.dep != null && d.cat !== "collect" ? ` Loses about ${Math.round(d.dep * 100)}% of its value a year.` : ""}${lock && lock !== "Not enough cash" ? `\n${lock}.` : ""}`;
            const buttons = [B(money(d.price), !lock, () => say("Bought", Things.buy(p, d.id), d.image), !!lock)];
            if (d.cat === "car" && d.price >= 5000) buttons.push(B(`Finance (${short(Math.round(d.price * 0.1))} down)`, !fin, () => say("Bought", Things.buy(p, d.id, true), d.image), !!fin));
            out.push(buttons.length > 1 ? multi(d.image, d.title, body, buttons) : row(d.image, d.title, body, buttons[0]));
        }
        return out;
    },

    // ================================================================ Health tab
    doctorCells(p: any, illnessRows: any[], careRows: any[]): any[] {
        if (isVampire(p) || age(p) < 3) return [];
        const b = Body.st(p);
        const out: any[] = [H("Doctor")];
        if (age(p) >= 18 || b.doctor) {
            const doc = Body.doctor(p);
            out.push(row("health_doctorvisit", `${doc}, Your Family Doctor`, `${b.doctorVisits ? `${b.doctorVisits} checkup${b.doctorVisits === 1 ? "" : "s"} together. ` : ""}Ask for advice any time: it's free.`,
                B("Ask", true, () => say(`${doc} Says`, Body.advice(p).map((x) => "• " + x).join("\n"), "health_doctorvisit"))));
        }
        for (const c of illnessRows) out.push(c);
        for (const c of careRows) out.push(c);
        return out;
    },
    fitnessCells(p: any = player()): any[] {
        if (!Body.shown(p)) return [];
        const b = Body.st(p);
        const r = Body.routine(p);
        const out: any[] = [H("Fitness")];
        out.push(new MeterViewModel("Fitness", Math.round(b.fit), 100, b.fit >= 65 ? "green" : b.fit >= 35 ? "blue" : "red", `${Body.fitTitle(b.fit)}. ${Body.fitHealth(p) >= 0 ? "+" : ""}${Body.fitHealth(p)} health a week${b.fit >= 50 ? ", and you catch fewer illnesses" : ""}. It moves slowly toward what your routine can build (${Math.round(Body.target(p))}).`, String(Math.round(b.fit))));
        out.push(row("health_workout", `Exercise: ${r.title}`, `${r.blurb}${r.weekly ? ` ${money(r.weekly)} a week.` : ""}${Things.boost(p, "fit") ? " Your gear helps." : ""}`, B("Change", true, () => RScreens.routineMenu(p))));
        return out;
    },
    routineMenu(p: any) {
        const opts = ROUTINES.filter((r) => !Body.routineLock(p, r) || r.id === Body.st(p).routine);
        const locked = ROUTINES.filter((r) => Body.routineLock(p, r) && r.id !== Body.st(p).routine);
        Say.menu("How Do You Keep Fit?", opts.map((r) => `${r.title}: ${r.blurb}${r.weekly ? ` (${money(r.weekly)}/week)` : ""}`).join("\n\n") + (locked.length ? `\n\nNot yet: ${locked.map((r) => `${r.title} (${Body.routineLock(p, r)})`).join("; ")}.` : ""), img("health_workout"),
            opts.map((r): [string, () => string] => [r.title, () => Body.setRoutine(p, r.id)]));
    },
    habitCells(p: any = player()): any[] {
        if (!Body.shown(p) || age(p) < 16) return [];
        const b = Body.st(p);
        const out: any[] = [H("Habits")];
        if (!b.smoker) out.push(row("health_pills", "Smoking: No", b.quit ? "You quit. Your risk of lung and heart disease keeps falling." : "You don't smoke.", age(p) >= 18 ? B("Start", true, () => say("Smoking", Body.startSmoking(p), "health_pills")) : undefined));
        else if (b.quitting) out.push(row("health_pills", "Smoking: Quitting", `${b.quitting.how === "patches" ? "Nicotine patches" : "A quit program"}: ${Math.max(0, b.quitting.until - now(p))} week${b.quitting.until - now(p) === 1 ? "" : "s"} to go.`));
        else out.push(multi("health_pills", "Smoking: Yes", `−0.6 health and +0.4 sanity a week, $35 a week, and three times the risk of heart and lung disease.${b.quitTries ? ` ${b.quitTries} tr${b.quitTries === 1 ? "y" : "ies"} at quitting so far (each one helps).` : ""}`, [
            B("Cold Turkey (15%)", true, () => say("Quitting", Body.quitSmoking(p, "cold"), "health_pills")),
            B("Patches $40/wk (50%)", true, () => say("Quitting", Body.quitSmoking(p, "patches"), "health_pills")),
            B("Quit Program $300 (75%)", cash(p) >= 300, () => say("Quitting", Body.quitSmoking(p, "program"), "health_pills"), cash(p) < 300),
        ]));
        const dr = b.drink;
        if (dr === "heavy") out.push(multi("vacation_drinks", "Drinking: Heavy", "+1 happiness, −1 health and −0.8 sanity a week, $70 a week.", [
            B("Support Group (45%)", true, () => say("Getting Sober", Body.getSober(p, "group"), "health_meditation")),
            B("Rehab $5,000 (80%)", cash(p) >= 5000, () => say("Getting Sober", Body.getSober(p, "rehab"), "health_meditation"), cash(p) < 5000),
        ]));
        else if (age(p) >= 18) out.push(multi("vacation_drinks", `Drinking: ${dr === "none" ? "No" : "Socially"}`, dr === "social" ? "+0.6 happiness a week, $25 a week." : "You don't drink.", [
            B("None", dr !== "none", () => Body.setDrink(p, "none")), B("Socially", dr !== "social", () => Body.setDrink(p, "social")), B("Heavily", true, () => say("Drinking", Body.setDrink(p, "heavy"), "vacation_drinks")),
        ]));
        return out;
    },
    /** Diets in groups (the Choose Your Diet screen). */
    dietGroup(diet: any): "Everyday" | "Cheap & Quick" | "Only Here" {
        const n = diet.name();
        if (["scavenge", "cupnoodle", "fastfood"].includes(n)) return "Cheap & Quick";
        if (["basic", "balanced", "vegan", "homeCooking"].includes(n)) return "Everyday";
        return "Only Here";
    },

    // ================================================================ Leisure tab
    leisureCells(p: any = player()): any[] {
        const out: any[] = [];
        if (age(p) < 4) return out;
        const people = Fun.people(p);
        if (age(p) >= 6 && people.length) {
            const w = Fun.companion(p);
            out.push(H("Going With"));
            out.push(row(w ? "icon_rm_company" : "icon_rm_company", w ? `With ${w.getFirstName()}` : "On Your Own", w ? "They come along to everything you do (+15 relationship each time), and it's more fun." : "Bring someone along: it's more fun, and you get closer.", B("Change", true, () => RScreens.companyMenu(p))));
        }
        out.push(H("Things to Do"));
        for (const c of Fun.categories(p)) {
            const list = Fun.inCategory(p, c.id);
            if (!list.length) continue;
            const can = list.filter((l) => { try { return l.requirementNotMetString(p) == null && Activities_lock(l, p) == null; } catch { return false; } }).length;
            out.push(link(c.image, c.title, `${c.blurb}\n${list.length} things · ${can} you can do now`, "activities:" + c.id, "Browse"));
        }
        if (age(p) >= 16) out.push(link("vacation_international", "Plan a Trip", `Pick where, how long and how fancy. ${Fun.peek(p)?.visited.length ? `Countries visited: ${Fun.peek(p)!.visited.length}.` : "Every new country counts."}`, "rm-trips", "Plan"));
        const fav = Fun.favourites(p);
        if (fav.length) out.push(row("icon_rm_favourite", "Your Favourites", fav.map(([k, n]) => `${(Leisure as any)[k]?.getTitle?.() ?? k} (${n} times)`).join(" · ") + "\nFavourites always give a little extra happiness."));
        return out;
    },
    companyMenu(p: any) {
        const people = Fun.people(p).slice(0, 6);
        Say.menu("Who's Coming?", "They'll come along to everything you do until you change it.", img("icon_rm_company"), [
            ...people.map((x): [string, () => string] => [x.getFirstName(), () => Fun.setCompanion(p, x)]),
            ["Just me", () => Fun.setCompanion(p, null)],
        ]);
    },
    /** A category screen (activities:<cat>): every activity with its three ways to do it. */
    category(cat: string, p: any = player()): any[] {
        const out: any[] = [];
        const c = Fun.categories(p).find((x) => x.id === cat);
        if (c) out.push(row(c.image, c.title, `${c.blurb}${Fun.companion(p) ? ` You're bringing ${Fun.companion(p).getFirstName()}.` : ""}`));
        for (const l of Fun.inCategory(p, cat)) out.push(RScreens.activityRow(p, l));
        return out;
    },
    activityRow(p: any, l: any): any {
        const tiers = Fun.tierFor(l, p);
        if (tiers.length === 1) return ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, l, null, 2, null);
        let lock: string | null = null;
        try { lock = l.requirementNotMetString(p) ?? null; } catch { lock = null; }
        const base = Fun.baseCost(l, p);
        const desc = (() => { try { return String(l.getAdditionalDescription() ?? ""); } catch { return ""; } })().replace(/\n+$/, "");
        const count = Fun.peek(p)?.counts[l.name()] ?? 0;
        const body = `${desc}${count >= 8 ? "\nOne of your favourites." : count ? `\nDone ${count} time${count === 1 ? "" : "s"}.` : ""}${lock ? `\n${lock}.` : ""}`;
        const buttons = tiers.map((t: Tier) => {
            const cost = Math.round(base * TIERS[t].cost);
            const enabled = !lock && cash(p) >= cost;
            return B(`${TIERS[t].title}${cost ? " " + short(cost) : ""}`, enabled, () => Fun.go(p, l, t), !enabled);
        });
        return multi(l.getImageId(), l.getTitle(), body, buttons);
    },
    trips(p: any = player()): any[] {
        const out: any[] = [];
        const f = Fun.st(p);
        const w = Fun.companion(p);
        out.push(multi("vacation_international", `How Long: ${Fun.tripLength(p).title}`, `${w ? `${w.getFirstName()} is coming (prices are for two). ` : ""}A two-week trip takes two weeks of your life.`, TRIP_LENGTHS.map((L) => B(L.title, f.tripLen !== L.id, () => { f.tripLen = L.id; }))));
        const hasPass = p.getItemState().isOwned(Possession.passport);
        if (!hasPass) out.push(link("possesion_passport", "You Need a Passport", "Trips abroad need one. Get it in the Store (Home & Travel).", "rm-store:home", "Get One"));
        const budgets = (c: any | null) => TRIP_BUDGETS.map((b) => { const lock = Fun.tripLock(p, c, b.id); return B(`${b.title} ${short(Fun.tripCost(p, c, b.id))}`, !lock, () => Fun.trip(p, c, b.id), !!lock); });
        out.push(H("Close to Home"));
        out.push(multi("vacation_local", `Around ${p.getCountry().getTitle()}`, "A road trip, a city break or a cabin by a lake.", budgets(null)));
        const regions: Record<string, string> = { americas: "The Americas", europe: "Europe", asia: "Asia & the Pacific", africa: "Africa & the Middle East", oceania: "Oceania" };
        const dests = Fun.destinations(p);
        const byRegion: Record<string, any[]> = {};
        for (const c of dests) (byRegion[Fun.region(c)] ??= []).push(c);
        for (const r of Object.keys(byRegion)) {
            out.push(H(regions[r] ?? r));
            for (const c of byRegion[r]) out.push(multi(c.getImageId(), c.getTitle(), `${f.visited.includes(c.name()) ? "You've been here before." : "Somewhere new."}`, budgets(c)));
        }
        return out;
    },

    // ================================================================ achievements
    feats(p: any = player()): any[] {
        const out: any[] = [];
        const g = Feats.global();
        out.push(row("achievement_truelegacy", `Achievements: ${Feats.count()} of ${FEATS.length}`, "Saved across all your lives. Some unlock head starts you can switch on when you start a new life."));
        for (const grp of FEAT_GROUPS) {
            const list = FEATS.filter((f) => f.group === grp.id);
            out.push(H(`${grp.title} (${list.filter((f) => g.done[f.id]).length}/${list.length})`));
            for (const f of list) {
                const d = g.done[f.id];
                const hs = HEAD_STARTS.find((h) => h.by === f.id);
                const pr = d ? null : Feats.progress(p, f);
                const body = `${f.blurb}${d ? `\nDone by ${d.name || "you"} at ${d.age}.` : ""}${hs ? `\nUnlocks: ${hs.title}.` : ""}`;
                out.push(prog(f.image, f.title, body, !!d, d ? 1 : pr ? pr[0] : 0, d ? 1 : pr ? pr[1] : 1));
            }
        }
        out.push(H("Classic"));
        for (const a of Achievement.INSTANCE.getAvailableAchievements()) {
            const done = GameStateManager.INSTANCE.getGlobalStateManager().getAchievementState().isAchievementComplete(a);
            out.push(new ActionProgressViewModel(a.getImageId(), a.getTitle(), new TextLabelViewModel(a.getDescription(), null, false, false, null, null, 62, null), done ? "Complete" : null, a.getProgressState(p), ImageButtonViewModel.INSTANCE.getHidden(), ButtonViewModel.INSTANCE.getHidden()));
        }
        return out;
    },
    /** Head starts on the new-life screen (only the unlocked ones). */
    headStartCells(np: any): any[] {
        const out: any[] = [];
        const open = HEAD_STARTS.filter((h) => Feats.startUnlocked(h));
        out.push(H(`Head Starts (${open.length} of ${HEAD_STARTS.length} unlocked)`));
        if (!open.length) out.push(row("achievement_truelegacy", "None Unlocked Yet", "Achievements unlock small head starts for new lives. See them in Settings › Achievements."));
        for (const h of HEAD_STARTS) {
            const on = Feats.chosen(np).includes(h.id);
            if (!Feats.startUnlocked(h)) continue;
            out.push(row("achievement_truelegacy", h.title, h.blurb, B(on ? "On" : "Off", true, () => { Feats.toggle(np, h.id, !on); try { Utils.INSTANCE.reloadGenericList(GenericListType.perkSelection); } catch { /* */ } })));
        }
        return out;
    },

    // ================================================================ routing
    title(key: string): string {
        if (key.startsWith("rm-store:")) return THING_CATS.find((c) => c.id === key.slice(9))?.title ?? "Store";
        return ({ "rm-market": "Stock Market", "rm-loans": "Borrow", "rm-goals": "Savings Goals", "rm-kids": "Kids' Fund", "rm-worth": "Money Story", "rm-things": "Your Things", "rm-store": "The Store", "rm-trips": "Plan a Trip", "rm-feats": "Achievements" } as any)[key] ?? "Life";
    },
    screen(key: string, p: any = player()): any[] {
        if (key.startsWith("rm-store:")) return RScreens.storeCat(key.slice(9), p);
        switch (key) {
            case "rm-market": return RScreens.market(p);
            case "rm-loans": return RScreens.loans(p);
            case "rm-goals": return RScreens.goals(p);
            case "rm-kids": return RScreens.kids(p);
            case "rm-worth": return RScreens.worth(p);
            case "rm-things": return RScreens.things(p);
            case "rm-store": return RScreens.store(p);
            case "rm-trips": return RScreens.trips(p);
            case "rm-feats": return RScreens.feats(p);
        }
        return [];
    },
};

/** Set at install (Activities.lock: country, season, prison…). */
let Activities_lock: (l: any, p: any) => string | null = () => null;
export function setActivitiesLock(f: (l: any, p: any) => string | null) { Activities_lock = f; }
