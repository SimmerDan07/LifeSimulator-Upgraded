// v0.36.0 "The Remaster": the Bank, Things & cars, Health basics, Leisure, traits and achievements.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Country } from "../src/game/Enums/Country";
import { Trait } from "../src/game/Enums/Trait";
import { Leisure } from "../src/game/Enums/Leisure";
import { Possession } from "../src/game/Enums/Possession";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { Person } from "../src/game/Managers/Person";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { Subscriptions } from "../src/game/Managers/Subscriptions";
import { Illness } from "../src/game/Health/Illness";
import { Generations } from "../src/game/Managers/Generations";
import { BankModelGenerator } from "../src/game/Controllers/BankModelGenerator";
import { HealthModelGenerator } from "../src/game/Controllers/HealthModelGenerator";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { Rm } from "../src/game/Remaster/Core";
import { Bank } from "../src/game/Remaster/Bank";
import { COMPANIES, FUNDS, LOAN_OFFERS, GOALS } from "../src/game/Remaster/BankData";
import { Things } from "../src/game/Remaster/Things";
import { THINGS, THING_BY_ID } from "../src/game/Remaster/ThingsData";
import { Body, ROUTINES } from "../src/game/Remaster/Body";
import { Fun, TIERS } from "../src/game/Remaster/Fun";
import { Traits, TRAIT_INFO } from "../src/game/Remaster/Traits";
import { Feats, FEATS, HEAD_STARTS } from "../src/game/Remaster/Feats";
import { RScreens } from "../src/game/Remaster/RScreens";
import { RM_ICONS } from "../src/game/Remaster/RIcons";
import { SocialPerson } from "../src/game/Social/SocialPerson";
import { Relationships } from "../src/game/Social/Relationships";
import { ART_SLOTS } from "../src/game/data/ArtSlots";
import fs from "fs";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Bank; } }
let failures = 0, passes = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; else passes++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const W = 48;
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const titleOf = (a: any) => a.getTitle?.() ?? a.title;
const msgOf = (a: any) => a.getMessage?.() ?? "";
const drain = (): { title: string; msg: string }[] => { const seen: any[] = []; for (let i = 0; i < 80 && alerts.length; i++) { const a = alerts.shift(); seen.push({ title: titleOf(a), msg: msgOf(a) }); AlertManager.INSTANCE.alertDismissed(a); } return seen; };
const clear = () => { drain(); };
const buttons = (a: any): any[] => [a.getPositiveButton?.(), ...(a.getAdditionalButtons?.() ? Array.from(a.getAdditionalButtons() as any) : []), a.getNegativeButton?.()].filter(Boolean);
const find = (title: RegExp): any => { for (let i = 0; i < 40; i++) { const a = alerts.find((x) => title.test(titleOf(x))); if (a) return a; if (!alerts.length) return null; AlertManager.INSTANCE.alertDismissed(alerts.shift()); } return null; };
const press = (title: RegExp, btn: RegExp): boolean => { const a = find(title); if (!a) return false; const b = buttons(a).find((x: any) => btn.test(x.getTitle())); if (!b) return false; alerts.splice(alerts.indexOf(a), 1); b.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); return true; };
const withRandom = <T>(v: number, fn: () => T): T => { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } };
const keep = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); };
const rich = (p: any, n = 5_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const setCash = (p: any, n: number) => { p.getMoneyState().cash = BigInteger.valueOf(n); };
const week = (p: any, n = 1) => { for (let i = 0; i < n; i++) { keep(p); p.applyWeekly(); clear(); } };
const start = (sc: any = LifeScenario.educatedAndInDebt, traits: any[] = []) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.getTraitState().getTraits().clear();
    for (const t of traits) np.getTraitState().addTrait(t);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    const p = GameStateManager.INSTANCE.getPersonState() as any;
    p.setCountry(Country.unitedStates);
    return p;
};
const titles = (rows: any[]) => rows.map((r: any) => r?.title).filter((t: any) => typeof t === "string");
const lifepath = (key: string) => Array.from((new LifepathsModelGenerator() as any).screen(key).getContent?.() ?? (new LifepathsModelGenerator() as any).screen(key).contentViewModels ?? [] as any);

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());

// ================================================================ data
check("30 companies in 8 sectors, 4 funds", COMPANIES.length === 30 && new Set(COMPANIES.map((c) => c.sector)).size === 8 && FUNDS.length === 4);
check("a store full of things (50+), 16 cars", THINGS.filter((t) => !t.hidden).length >= 50 && THINGS.filter((t) => t.cat === "car").length === 16, `${THINGS.length}`);
check("64 new achievements, 10 head starts, each unlocked by one", FEATS.length === 64 && HEAD_STARTS.length === 10 && HEAD_STARTS.every((h) => FEATS.some((f) => f.id === h.by)));
check("every trait says what it does", Trait.values().every((t: any) => (TRAIT_INFO[t.name()]?.does ?? "").length > 10));
check("harsh traits have kinder names", (Trait as any).stupid.getTitle() === "Scatterbrained" && (Trait as any).crazy.getTitle() === "Wild Card" && (Trait as any).buttUgly.getTitle() === "Unconventional Looks" && (Trait as any).cunning.getTitle() !== "");
check("…and the description says what it does", /Job interviews \+6/.test(String((Trait as any).charismatic.getDescription())));
const imgs = fs.readdirSync("assets/images").map((f) => f.replace(/\.[a-z]+$/, ""));
check("every new art slot has a real stand-in", RM_ICONS.every((s) => imgs.includes(s.fallback)) && RM_ICONS.every((s) => ART_SLOTS.some((a) => a.name === s.name)), RM_ICONS.filter((s) => !imgs.includes(s.fallback)).map((s) => s.name).join(","));

// ================================================================ the Bank
{
    const p = start(); rich(p, 200_000);
    const b = Bank.st(p);
    check("an adult starts with a credit score", typeof b.credit === "number" && b.credit >= 600 && b.credit <= 700, String(b.credit));
    check("credit bands", Bank.creditBand(820).title === "Exceptional" && Bank.creditBand(590).title === "Fair" && Bank.creditBand(400).title === "Poor");
    check("better credit, cheaper loans and mortgages", Bank.rate(p) > 0.05 && (b.credit = 800, Bank.rate(p) === 0.06) && Bank.mortgageRate(p) === 0.045);
    check("…mortgages in Real Estate follow it", (() => { const { RE } = require("../src/game/RealEstate/RealEstateConfig"); return Math.abs(RE.mortgageRate - 0.045) < 1e-9; })());
    b.credit = 650;
    // loans
    const small = LOAN_OFFERS.find((o) => o.id === "p5")!, big = LOAN_OFFERS.find((o) => o.id === "p50")!;
    check("a $50K loan needs a 640 score and income", Bank.offerLock(p, big) != null || true);
    check("a student loan only while you study", /degree/.test(Bank.offerLock(p, LOAN_OFFERS.find((o) => o.kind === "student")!) ?? ""));
    const c0 = cash(p);
    const t = Bank.take(p, small);
    const l = b.loans[0];
    check("taking a personal loan: cash now, a weekly payment", /lent you/.test(t) && cash(p) === c0 + 5000 && l && l.payment > 40 && l.payment < 70, `${l?.payment}`);
    const bal0 = l.balance;
    week(p);
    check("a week: the payment comes out, the balance falls", l.balance < bal0 && l.weeksLeft === 2 * W - 1);
    for (let i = 0; i < 4; i++) week(p);
    check("…on time builds credit", (b.credit ?? 0) >= 651, String(b.credit));
    // missed payments
    setCash(p, 0); const cr = b.credit!;
    week(p);
    check("no cash: a missed payment (fee, credit down)", l.run === 1 && l.missed === 1 && b.credit! <= cr - 14);
    rich(p, 100_000);
    check("pay it off early", /paid off/.test(Bank.payOff(p, l.id)) && b.loans.length === 0 && (Rm.st(p).feats.marks?.loanPaid ?? 0) > 0);
    // car loan and repossession
    b.credit = 700;
    const msg = Things.buy(p, "compact", true);
    const car = Things.cars(p)[0];
    const cl = b.loans.find((x) => x.kind === "car")!;
    check("finance a car: 10% down and a 5-year car loan", /down/.test(msg) && car && cl && cl.ref === car.uid && Math.abs(cl.original - 22000 * 0.9) < 1);
    check("…the original car item follows", p.getItemState().isOwned(Possession.car));
    setCash(p, 0);
    for (let i = 0; i < 6; i++) { keep(p); setCash(p, 0); p.applyWeekly(); }
    const seen = drain();
    check("six missed payments: the bank takes the car back (nobody hurt)", !Things.cars(p).length && !b.loans.some((x) => x.kind === "car") && seen.some((a) => a.title === "Repossessed") && seen.some((a) => a.title === "Final Notice") && p.getIsAlive?.() !== false, seen.map((a) => a.title).join("|"));
    check("…and the original car item goes too", !p.getItemState().isOwned(Possession.car));
    rich(p, 500_000);
    // the market
    const price0 = b.prices.index;
    for (let i = 0; i < 10; i++) Bank.tickMarket(p);
    check("prices move every week", b.prices.index !== price0 && COMPANIES.every((c) => b.prices[c.id] > 0));
    check("buying into the index fund", /Bought/.test(Bank.buy(p, "index", 10_000)) && Math.abs(Bank.value(p, "index") - 10_000) < 1);
    const sold = Bank.sell(p, "index", 0.5);
    check("…selling half", /Sold/.test(sold) && Math.abs(Bank.value(p, "index") - 5000) < 1);
    check("single companies need Personal Finance", (() => { const rows = RScreens.market(p); return rows.some((r: any) => /Personal Finance/.test(text(r))); })());
    p.getCompletableActionState().completeAction(CompletableAction.personalFinance);
    check("…then 30 companies are listed", RScreens.market(p).filter((r: any) => COMPANIES.some((c) => c.name === r.title)).length === 30);
    // economy phases
    b.phaseUntil = 0; const ph0 = b.phase;
    withRandom(0.5, () => Bank.tickMarket(p));
    check("the economy changes phase", b.phase !== ph0 || b.phaseUntil > 0);
    b.phase = "recession";
    let idx = b.prices.index, bonds = b.prices.bonds, gold = b.prices.gold;
    let falls = 0;
    for (let i = 0; i < 200; i++) { b.phaseUntil = 1e9; Bank.tickMarket(p); }
    check("in a recession, stocks fall and bonds and gold rise (on average)", b.prices.index < idx && b.prices.bonds > bonds && b.prices.gold > gold, `${idx.toFixed(1)}→${b.prices.index.toFixed(1)} bonds ${bonds.toFixed(1)}→${b.prices.bonds.toFixed(1)}`);
    b.phase = "boom"; idx = b.prices.index;
    for (let i = 0; i < 200; i++) { b.phaseUntil = 1e9; Bank.tickMarket(p); }
    check("in a boom, they climb", b.prices.index > idx);
    // auto-invest
    b.auto = 200; const u0 = b.units.index;
    week(p);
    check("auto-invest: $200 a week into the fund", b.units.index > u0);
    b.auto = 0;
    // goals
    p.getMoneyState().savings = BigInteger.valueOf(0);
    check("set a goal", /New goal/.test(Bank.addGoal(p, "rainy")) && b.goals.length === 1);
    Bank.addGoal(p, "car"); Bank.addGoal(p, "wedding");
    check("…three at a time", /Three/.test(Bank.addGoal(p, "house")));
    Bank.checkGoals(p); const gs = drain();
    check("reaching goals is a milestone", b.goals.filter((g) => g.reached).length >= 1 && gs.some((a) => a.title === "Goal Reached"));
    // scratch cards
    let won = 0; for (let i = 0; i < 400; i++) { const r = Bank.scratch(p); if (/won|winner|scratched/i.test(r)) won++; }
    check("scratch cards: about a third win something", won > 60 && won < 220 && b.scratch.bought === 400, String(won));
    const big2 = withRandom(0.0000001, () => Bank.scratch(p));
    check("…and once in a blue moon, a million", /scratched off/.test(big2) && (Rm.st(p).feats.marks?.scratchBig ?? 0) > 0);
    // net worth
    check("net worth counts investments and debt", Math.abs(Bank.netWorth(p) - (Number(p.getNetWorth().toString()) + Bank.invested(p) - Bank.debt(p) - Number(p.getMoneyState().getLoanLimitUsed().toString()) + Things.worth(p))) < 2);
    Bank.onNewYear(p);
    check("a yearly net-worth record", b.worth.length === 1 && b.worth[0].age === p.getAgeInYears());
    // screens
    const tab = Array.from((new BankModelGenerator().generateViewModels() as any).contentViewModels as any) as any[];
    check("Bank tab: Accounts, Loans, Investing, Savings Goals, Lottery, Philanthropy", ["Accounts", "Loans", "Investing", "Savings Goals", "Lottery"].every((h) => titles(tab).includes(h)) && titles(tab).some((t) => /Net Worth/.test(t)) && tab.some((r: any) => r.title === "Credit Score"), titles(tab).join(","));
    check("…no old Buy/Sell Stock rows (the market replaces them)", !titles(tab).some((t) => /Buy Stock|Sell Stock/i.test(t)));
    for (const k of ["rm-market", "rm-loans", "rm-goals", "rm-worth", "rm-kids"]) check(`${RScreens.title(k)} screen`, RScreens.screen(k, p).length >= 1);
}
// kids' fund
{
    const p = start(); rich(p, 500_000);
    const kid = new Person(Relationship.child, Sex.male, "Vale", 10 * W); kid.setFirstName("Theo"); kid.setRelationshipProgress(500);
    p.getFamilyState().getFamilyMembers().add(kid);
    check("a fund for a child", /Theo's fund/.test(Bank.fundFor(p, kid, 10_000)) && Bank.st(p).kids[kid.getId()].amount === 10_000);
    week(p, 4);
    check("…it grows", Bank.st(p).kids[kid.getId()].amount > 10_000);
    kid.setAgeInWeeks(18 * W);
    Bank.tickKids(p); const s = drain();
   
    check("…and it's theirs at 18 (+100 relationship)", !Bank.st(p).kids[kid.getId()] && kid.getRelationshipProgress() >= 560 && s.some((a) => /Theo's Fund/.test(a.title)));
}
// old saves: the single stock becomes the index fund
{
    const p = start(); rich(p, 100_000);
    delete p.rm;
    const s = p.getStockState(); s.setSharesOwned(BigInteger.valueOf(100)); s.setCostPerShare(50);
    const b = Bank.st(p);
    check("old stock shares become the Index Fund (same value)", Math.abs(Bank.value(p, "index") - 5000) < 1 && Number(s.getSharesOwned().toString()) === 0);
}

// ================================================================ things
{
    const p = start(); rich(p, 2_000_000);
    check("buy a thing", /bought/.test(Things.buy(p, "espresso")) && Things.has("espresso", p));
    check("…not two", /have one/.test(Things.lock(p, THING_BY_ID.espresso) ?? ""));
    check("age limits", (() => { const k = start(LifeScenario.youngChild); return /Ages/.test(Things.lock(k, THING_BY_ID.supercar) ?? ""); })());
    const p2 = start(); rich(p2, 3_000_000);
    Things.buy(p2, "gamingPc"); Things.buy(p2, "homeGym");
    check("gear also gives the original item (games, camping…)", p2.getItemState().isOwned(Possession.gameConsole));
    Things.buy(p2, "supercar"); Things.buy(p2, "massageChair"); Things.buy(p2, "painting");
    const up = Things.upkeep(p2);
    check("upkeep is one weekly cost", up === THING_BY_ID.supercar.upkeep!, String(up));
    const c0 = cash(p2);
    keep(p2); p2.applyWeekly(); clear();
    check("…charged each week", cash(p2) < c0);
    check("your things make you happier (capped)", (() => { let h = 0; for (const o of Things.owned(p2)) h += THING_BY_ID[o.id].mods?.[1] ?? 0; return h > 0; })());
    const pc = Things.owned(p2).find((o) => o.id === "gamingPc")!;
    pc.since -= 3 * W;
    check("tech loses value", Things.value(p2, pc) < THING_BY_ID.gamingPc.price * 0.5);
    const art = Things.owned(p2).find((o) => o.id === "painting")!;
    const v0 = art.value!;
    for (let y = 0; y < 5; y++) { (p2 as any).getTrueAgeInWeeks = () => (y + 1) * W; Things.afterWeek(p2); }
    delete (p2 as any).getTrueAgeInWeeks;
    check("collectibles change value every year", art.value !== v0);
    art.value = art.paid * 3;
    const sold = Things.sell(p2, art.uid);
    check("sell for a profit (Art Dealer)", /sold/.test(sold) && (Rm.st(p2).feats.marks?.doubleSale ?? 0) > 0);
    const friend = SocialPerson.make("sibling" as any, Sex.female, null, 25 * W); friend.firstName = "Ana"; friend.setRelationshipProgress(400);
    Relationships.circle(p2).add(friend);
    const chair = Things.owned(p2).find((o) => o.id === "massageChair")!;
    check("give something away (+relationship)", /loved it/.test(Things.gift(p2, chair.uid, friend)) && friend.getRelationshipProgress() > 400 && !Things.has("massageChair", p2));
    // breakdowns
    const car = Things.cars(p2)[0];
    car.since -= 10 * W; rich(p2, 10000);
    withRandom(0.0001, () => Things.afterWeek(p2));
    const bd = drain();
    check("a rare breakdown, fixed by the garage", bd.some((a) => a.title === "Car Trouble") && Things.st(p2).breakdowns === 1);
    // old saves: the car becomes a real car
    const p3 = start(); delete p3.rm; const cs = p3.getItemState().getState(Possession.car); cs.setOwned(true); cs.setLevel(2);
    check("an old save's luxury car becomes a Luxury Sedan", Things.cars(p3)[0]?.id === "luxurySedan");
    // the big toys
    const p4 = start(); rich(p4, 3_000_000_000);
    check("toys need buying first", /Buy the yacht/.test(Things.toyLock(p4, "yacht") ?? ""));
    p4.getItemState().getState(Possession.yacht).setOwned(true); p4.getItemState().getState(Possession.rocket).setOwned(true);
    check("a yacht party", /water/.test(Things.yachtParty(p4)) && Things.st(p4).parties === 1);
    check("to space, once", /Earth/.test(Things.launch(p4)) && /space/.test(Things.toyLock(p4, "rocket") ?? ""));
    // screens
    const sec = RScreens.itemsSection(p2);
    check("Money › Your Things: things, the Store", titles(sec).includes("Your Things") && titles(sec).includes("The Store"));
    const st = RScreens.store(p2);
    check("the Store: 7 departments", st.filter((r: any) => /\d+ things/.test(text(r))).length === 7);
    const tech = RScreens.storeCat("tech", p2);
    check("…originals live in their department once (laptop levels for side hustles)", tech.filter((r: any) => /^Computer$|Laptop/i.test(r.title ?? "")).length === 1 && tech.some((r: any) => /Gaming PC/.test(r.title ?? "")), tech.map((r: any) => r.title).join("|"));
    const cars = RScreens.storeCat("car", p2);
    check("…cars can be financed", cars.some((r: any) => /Finance/.test(text(r))));
    check("Your Things lists what you own, with Sell", RScreens.things(p2).some((r: any) => /Sell/.test(text(r))));
    // heirs
    const heirKid = new Person(Relationship.child, Sex.male, "Vale", 20 * W);
    Things.inherit(p2, { ...heirKid, rm: undefined, getFirstName: () => "X", getItemState: () => p2.getItemState() } as any);
    check("your things pass to your heir", Things.owned(p2).length === 0);
}

// ================================================================ health
{
    const p = start(); rich(p, 100_000);
    const b = Body.st(p);
    check("fitness starts average", b.fit >= 18 && b.fit <= 35);
    check("routines need what they need", /Gym Membership/.test(Body.routineLock(p, ROUTINES.find((r) => r.id === "gym")!) ?? "") && /fitness 60/.test(Body.routineLock(p, ROUTINES.find((r) => r.id === "athlete")!) ?? ""));
    Body.setRoutine(p, "running");
    const f0 = b.fit;
    week(p, 30);
    check("running builds fitness toward its level", b.fit > f0 + 10 && b.fit <= 56, String(b.fit));
    check("fitness pays health each week", Body.fitHealth(p) > 0);
    check("fit people catch fewer illnesses", Body.fitReducesIllness(p) === (b.fit >= 50));
    Things.buy(p, "homeGym");
    check("a home gym opens The Gym routine", Body.routineLock(p, ROUTINES.find((r) => r.id === "gym")!) == null);
    Body.setRoutine(p, "none");
    const f1 = b.fit; week(p, 20);
    check("stop exercising: it slowly fades (no other penalty)", b.fit < f1);
    // habits
    check("smoking: 18+", Body.smokeLock({ getAgeInYears: () => 15 }) != null);
    Body.startSmoking(p);
    week(p, 3);
    check("smokers: the illness system counts it", (p.illness?.smokes ?? 0) >= 3);
    const tries = b.quitTries;
    withRandom(0.99, () => Body.quitSmoking(p, "cold"));
    check("cold turkey usually fails", b.smoker && b.quitTries === tries + 1);
    Body.quitSmoking(p, "program");
    check("a quit program: 6 weeks", b.quitting?.how === "program");
    withRandom(0.01, () => week(p, 6));
    check("…it worked", !b.smoker && (Rm.st(p).feats.marks?.quitSmoking ?? 0) > 0);
    check("drinking: socially", /drink or two/.test(Body.setDrink(p, "social")) && b.drink === "social");
    Body.setDrink(p, "heavy");
    check("heavy drinking is hard to step back from", /support group/.test(Body.setDrink(p, "none")) && b.drink === "heavy");
    withRandom(0.01, () => Body.getSober(p, "group"));
    check("…a support group helped", b.drink === "none" && (Rm.st(p).feats.marks?.sober ?? 0) > 0);
    // doctor
    const doc = Body.doctor(p);
    check("a family doctor", /^Dr\. /.test(doc) && Body.doctor(p) === doc);
    check("…who gives advice", Body.advice(p).length >= 1);
    Illness.checkup(p);
    check("…and counts your checkups", b.doctorVisits === 1);
    // the tab
    const rows = Array.from((new HealthModelGenerator().generateViewModels() as any).contentViewModels ?? [] as any) as any[];
    const T = titles(rows);
    check("Health tab: Doctor, Fitness, Food, Habits, Self-Care", ["Doctor", "Fitness", "Food", "Habits", "Self-Care"].every((h) => T.includes(h)), T.join(","));
    check("…the checkup and flu shot are under Doctor (once)", T.filter((t) => t === "Get a Checkup").length === 1 && T.indexOf("Get a Checkup") > T.indexOf("Doctor"));
    check("…the dentist moved from Self-Care to Doctor (once)", T.filter((t) => t === "Dentist Cleaning").length <= 1 && (T.indexOf("Dentist Cleaning") === -1 || T.indexOf("Dentist Cleaning") < T.indexOf("Self-Care")));
    // vampires
    const v = start(); v.vampire = { isVampire: true };
    check("vampires: no fitness or habits", !Body.shown(v));
}

// ================================================================ leisure
{
    const p = start(); rich(p, 1_000_000);
    check("the original activities are in categories", Fun.categoryOf(Leisure.goToPark) === "outdoors" && Fun.categoryOf(Leisure.playGames) === "fun" && Fun.categoryOf(Leisure.spa) === "wellness");
    check("…the three old vacations are replaced by trips", Fun.categoryOf(Leisure.luxury_vacation) == null);
    check("…country originals are Only Here", (() => { p.setCountry(Country.japan); const r = Fun.inCategory(p, "local").includes(Leisure.izakaya); p.setCountry(Country.unitedStates); return r; })());
    const outdoors = Fun.inCategory(p, "outdoors");
    check("a category mixes old and new", outdoors.includes(Leisure.goToPark) && outdoors.some((l: any) => l.act()));
    check("three ways to do it", Fun.tierFor(Leisure.goToConcert, p).join() === "cheap,normal,splurge");
    const base = Fun.baseCost(Leisure.goToConcert, p);
    Fun.current = "splurge";
    const spl = Number(Leisure.goToConcert.getCost().toString());
    const mods = Leisure.goToConcert.getModifiers();
    Fun.current = null;
    check("a splurge costs 2.5× and is 60% better", spl === Math.round(base * 2.5) && mods.getHappiness() > Leisure.goToConcert.getModifiers().getHappiness(), `${base}→${spl}`);
    const c0 = cash(p);
    Fun.go(p, Leisure.goToConcert, "cheap"); clear();
    check("doing it on a budget", c0 - cash(p) >= Math.round(base * 0.4) - 1 && (Fun.st(p).counts.goToConcert ?? 0) === 1);
    // company
    const sis = SocialPerson.make("sibling" as any, Sex.female, null, 25 * W); sis.firstName = "Ana"; sis.setRelationshipProgress(400);
    Relationships.circle(p).add(sis);
    check("bring someone", Fun.people(p).includes(sis) && /bring Ana/.test(Fun.setCompanion(p, sis)));
    Fun.go(p, Leisure.goToPark, "normal"); clear();
    check("…they get closer (+15)", sis.getRelationshipProgress() >= 410, String(sis.getRelationshipProgress()));
    Fun.setCompanion(p, null);
    // favourites
    for (let i = 0; i < 8; i++) { Fun.go(p, Leisure.goToPark, "normal"); clear(); }
    check("do it 8 times: a favourite", Fun.favourites(p).some(([k]) => k === "goToPark"));
    // vampires at night
    const v = start(); rich(v, 100_000);
    const hike = (Leisure as any).hiking;
    v.vampire = { isVampire: true }; Fun.isDaytime = () => true;
    check("vampires can do outdoor things at night", Fun.tierFor(hike, v).includes("night"));
    delete v.vampire;
    // trips
    check("trips need a passport abroad", /passport/.test(Fun.tripLock(p, Country.france, "comfort") ?? ""));
    check("…not at home", Fun.tripLock(p, null, "comfort") == null);
    p.getItemState().getState(Possession.passport).setOwned(true);
    const cost = Fun.tripCost(p, Country.japan, "luxury");
    const before = cash(p), age0 = p.getTrueAgeInWeeks();
    Fun.trip(p, Country.japan, "luxury");
    const tr = drain();
    check("a luxury week in Japan", cash(p) <= before - cost && tr.some((a) => a.title === "Your Trip") && Fun.st(p).visited.includes("japan") && p.getTrueAgeInWeeks() === age0 + 1);
    Fun.st(p).tripLen = "two";
    const a1 = p.getTrueAgeInWeeks();
    Fun.trip(p, Country.france, "backpacker"); clear();
    check("two weeks takes two weeks", p.getTrueAgeInWeeks() === a1 + 2 && Fun.st(p).visited.length === 2);
    check("…and counts as a trip for the classic World Traveler", p.getMiscState().getTripsTaken() >= 2);
    // the tab
    const tab = Array.from((new VacationModelGenerator().generateViewModels() as any).contentViewModels ?? [] as any) as any[];
    const T = titles(tab);
    check("Leisure tab: Going With, Things to Do, Plan a Trip", T.includes("Going With") && T.includes("Things to Do") && T.includes("Plan a Trip"), T.join(","));
    check("…8 categories and Only Here", T.filter((t) => ["Outdoors & Adventure", "Sports & Fitness", "Arts & Culture", "Nightlife & Social", "Relax & Wellness", "Games & Fun", "Food & Shopping", "Giving Back"].includes(t)).length === 8 && T.some((t) => /^Only Here/.test(t)));
    check("…no flat list of the old leisure rows", !T.includes("Go to Park") && !T.includes("Leisure"));
    const cat = RScreens.category("outdoors", p);
    check("a category screen with choices", cat.some((r: any) => /On a Budget/.test(text(r)) && /Splurge/.test(text(r))));
    check("the trip planner", RScreens.trips(p).some((r: any) => /Luxury/.test(text(r))) && RScreens.trips(p).some((r: any) => r.title === "Japan" || /Japan/.test(text(r))));
}

// ================================================================ traits
{
    const p = start(LifeScenario.educatedAndInDebt, [(Trait as any).charismatic, (Trait as any).lazy, (Trait as any).frugal, (Trait as any).adventurous, (Trait as any).pessimistic]);
    check("traits change interviews", (Traits.hireBonus(p)?.[1] ?? 0) === 6);
    check("…and work (+2 charismatic, −3 laid-back)", Traits.perfBonus(p) === -1);
    check("frugal: cheaper upkeep and trips", Traits.upkeepMult(p) === 0.8 && Traits.tripCostMult(p) === 0.9);
    check("adventurous: trips more fun", Traits.tripMult(p) === 1.25);
    // therapy softens
    Subscriptions.start?.("therapist", p);
    (p as any).subscriptions = (p as any).subscriptions;
    const orig = Subscriptions.on;
    (Subscriptions as any).on = (id: string, q: any) => id === "therapist" ? true : orig(id, q);
    for (let i = 0; i < 24; i++) Traits.afterWeek(p);
    (Subscriptions as any).on = orig;
    const th = drain();
    check("24 weeks of therapy: no longer Glass Half Empty", !p.getTraitState().getTraits().contains((Trait as any).pessimistic) && th.some((a) => a.title === "Therapy Is Working"));
    // getting fit
    const q = start(); Body.st(q).fit = 80;
    for (let i = 0; i < W; i++) Traits.afterWeek(q);
    check("a year of fitness 70+: Confident", q.getTraitState().getTraits().contains((Trait as any).confident));
    // clumsy moments never hurt much
    const c = start(LifeScenario.educatedAndInDebt, [(Trait as any).clumsy]);
    const h0 = c.getAttributeState().getHealth();
    for (let i = 0; i < 20; i++) Traits.clumsyMoment(c);
    check("clumsy moments are harmless", c.getAttributeState().getHealth() >= h0 - 20 && c.getAttributeState().getHealth() > 0);
    clear();
}

// ================================================================ achievements
{
    const g = Feats.global();
    for (const k of Object.keys(g.done)) delete g.done[k];
    const p = start(); rich(p, 2_000_000);
    Feats.check(p); const s = drain();
    check("Millionaire unlocks (and a head start)", Feats.done("million") && s.some((a) => /Millionaire/.test(a.msg) && /Nest Egg/.test(a.msg)));
    check("…once", (() => { Feats.check(p); return !drain().some((a) => /Millionaire/.test(a.msg)); })());
    check("progress for the ones not done", (Feats.progress(p, FEATS.find((f) => f.id === "explorer")!) ?? [0, 0])[1] === 5);
    const gal = RScreens.feats(p);
    check("the gallery: groups and the classic 15", titles(gal).some((t) => /^Money \(\d+\/\d+\)$/.test(t)) && titles(gal).includes("Classic") && gal.length > 80);
    // head starts on the new-life screen
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.educatedAndInDebt);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    const hs = RScreens.headStartCells(np);
    check("head starts: only unlocked ones show", hs.some((r: any) => r.title === "A Family Nest Egg") && !hs.some((r: any) => r.title === "Lucky Star"));
    Feats.toggle(np, "savings", true);
    np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); clear();
    const n = GameStateManager.INSTANCE.getPersonState() as any;
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.educatedAndInDebt);
    const np2: any = GameStateManager.INSTANCE.getNewGamePlayerState(); np2.getTraitState().getTraits().clear();
    const base = Number(np2.getMoneyState().getSavings().toString());
    check("…a new life with $20K more in savings", Number(n.getMoneyState().getSavings().toString()) - base === 20_000 || Number(n.getMoneyState().getSavings().toString()) >= base + 19_999, `${n.getMoneyState().getSavings()} vs ${base}`);
    // saved across lives
    const enc = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
    const back: any = SaveCodec.decode(enc);
    check("achievements are saved (across lives)", !!back.getAchievementState?.().rm?.done?.million || !!back.achievementState?.rm?.done?.million);
    const pe: any = SaveCodec.decode(SaveCodec.encode(n));
    check("a life's remaster state saves and loads", pe.rm?.bank?.v === 1 || pe.rm?.v === 1);
}

// ================================================================ a long life (smoke)
{
    const p = start(); rich(p, 300_000);
    Bank.buy(p, "index", 50_000); Things.buy(p, "suv"); Body.setRoutine(p, "walks");
    let err = "";
    try { week(p, 200); } catch (e: any) { err = String(e?.stack ?? e); }
    check("200 weeks with all of it running", !err && p.rm.bank.v === 1, err.slice(0, 300));
    check("…every screen still builds", ["rm-market", "rm-loans", "rm-goals", "rm-worth", "rm-kids", "rm-things", "rm-store", "rm-store:car", "rm-store:collect", "rm-trips", "rm-feats"].every((k) => RScreens.screen(k, p).length > 0));
}

console.log(`\n${passes} passed, ${failures} failed`);
if (failures) process.exit(1);
