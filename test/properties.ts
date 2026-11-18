// Property System Overhaul — feature tests (node, no UI).
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { Country } from "../src/game/Enums/Country";
import { Housing } from "../src/game/Enums/Housing";
import { HousingState } from "../src/game/Managers/HousingState";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { ButtonViewModel } from "../src/game/Models/ButtonViewModel";
import { BigInteger } from "../src/game/runtime";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { RealEstatePortfolio } from "../src/game/RealEstate/RealEstatePortfolio";
import { RE } from "../src/game/RealEstate/RealEstateConfig";
import fs from "fs";

let fixture: string | null = null;
const alerts: any[] = []; const navs: string[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo(t) { navs.push(t.name()); }, backToMainGame() { navs.push("<back>"); }, showAlert(vm) { alerts.push(vm); }, readFile: () => fixture, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const buttons = (vm: any) => { const out: ButtonViewModel[] = []; const seen = new Set(); const walk = (o: any, d = 0) => { if (!o || typeof o !== "object" || d > 6 || seen.has(o)) return; seen.add(o); if (o instanceof ButtonViewModel) { out.push(o); return; } for (const v of Object.values(o)) Array.isArray(v) ? v.forEach((x) => walk(x, d + 1)) : walk(v, d + 1); }; walk(vm); return out; };
const clearAlerts = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const cash = (p: any) => p.getMoneyState().getCash().doubleValue();
const flows = (p: any) => { p.collectWeeklyValues?.(); return p.getMoneyState(); };
const cashFlowLines = (p: any): [string, number][] => {
    const vm = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.cashFlow, "", false);
    const txt = JSON.stringify(vm, (k, v) => (typeof v === "bigint" ? v.toString() : v));
    return [[txt, 0]];
};
const withRandom = <T>(value: number, fn: () => T): T => { const r = Math.random; Math.random = () => value; try { return fn(); } finally { Math.random = r; } };

// ======================================================================= 1. old v0.3 save
fixture = fs.readFileSync("test/fixtures/save-v0.3-landlord.txt", "utf8");
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p = GameStateManager.INSTANCE.getPersonState();
    check("v0.3 save loads", !!p && p.getFullName().length > 0, p?.getFullName());
    check("v0.3 save had no portfolio", (p as any).realEstate == null);
    const pf = p.getRealEstate();
    pf.reconcile(p);
    const houses = pf.all().filter((x) => x.type === "house"), complexes = pf.all().filter((x) => x.type === "apartmentComplex");
    check("migrated 2 houses + 2 complexes", houses.length === 2 && complexes.length === 2, pf.all().map((x) => x.type + ":" + x.use).join(", "));
    check("home you live in became your residence", houses.filter((x) => x.use === "residence").length === 1 && p.getHousingState().currentHousing().getType() === Housing.house);
    const rent = pf.all().reduce((s, x) => s + pf.weeklyRent(x), 0);
    check("rental income continues at the original rate", Math.round(rent) === 600 + 2 * 125000, `rent ${Math.round(rent)}/wk`);
    check("HousingState counts unchanged", p.getHousingState().getState(Housing.house).getNumberOwned().intValue() === 2 && p.getHousingState().getState(Housing.apartmentComplex).getNumberOwned().intValue() === 2);
    const c0 = cash(p);
    for (let i = 0; i < 4; i++) { p.applyWeekly(); clearAlerts(); }
    check("weeks advance on the old save", cash(p) > c0, `cash ${c0} -> ${cash(p)}`);
    const enc = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
    const back = SaveCodec.decode(enc).getSaveState().currentSlot().getPersonState();
    check("upgraded save round-trips", back.getRealEstate().all().length === 4 && back.getRealEstate().all()[0].history.length > 0);
    check("net worth includes property equity", p.getNetWorth().doubleValue() > p.getMoneyState().getTotalAsset().doubleValue() + 100e6);
}

// ======================================================================= 2. fresh game
fixture = null;
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.oldMan);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!);
clearAlerts();
const p = GameStateManager.INSTANCE.getPersonState();
p.setCountry(Country.unitedStates);
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(50_000_000), MoneyUpdateType.workIncome, null, null, 12, null);
const pf = p.getRealEstate();

// classic quick-buy
{
    const before = cash(p);
    const price = pf.quickPrice("house", "unitedStates");
    check("classic price = original price at a fresh market", price === 500000, String(price));
    HousingState.purchase$default(p.getHousingState(), Housing.house, BigInteger.valueOf(1), 0, null);
    check("classic buy charges the price", Math.round(before - cash(p)) === 500000, String(before - cash(p)));
    check("classic buy creates a property record", pf.all().length === 1 && pf.all()[0].type === "house" && p.getHousingState().getState(Housing.house).getNumberOwned().intValue() === 1);
    check("not living there → rented out (original behaviour)", pf.all()[0].use === "rental" && !!pf.all()[0].tenant);
    const vm = ProfileModelGenerator.INSTANCE ?? null;
}

// cash flow
{
    const ms = p.getMoneyState();
    p.collectWeeklyValues();
    const deltas = ms.getWeeklyDelta().map((x: any) => x.getFirst()).join(" | ");
    check("weekly cash flow has rent, tax and upkeep", /Rental income/i.test(deltas) && /Property Tax/.test(deltas) && /Property Upkeep/.test(deltas));
}

// move in
const house = pf.all()[0];
{
    check("move in", pf.moveInto(p, house.id) == null && house.use === "residence" && p.getHousingState().currentHousing().getType() === Housing.house);
    check("no tenant once you live there", house.tenant == null && pf.weeklyRent(house) === 0);
}

// market: cash and mortgage purchases
{
    pf.refreshListings(p);
    check("market has listings", pf.listings.length === RE.listingCount, pf.listings.map((l) => l.typeLabel() + " " + Math.round(l.condition)).join(" | "));
    const l = pf.listings[0]; const ask1 = l.askingPrice;
    const before = cash(p);
    const r1 = pf.buyListing(p, l.id, false);
    check("buy listing with cash", r1 == null && Math.round(before - cash(p)) === ask1, `${r1} paid ${before - cash(p)} asking ${ask1}`);
    const bought = pf.all()[pf.all().length - 1];
    check("bought property tracked with price/date/owner", bought.purchasePrice === ask1 && bought.purchasedBy === p.getFullName() && bought.history.length === 1);
    const l2 = pf.listings[0]; const ask2 = l2.askingPrice;
    const b2 = cash(p);
    check("buy listing with mortgage", pf.buyListing(p, l2.id, true) == null, "");
    const mp = pf.all()[pf.all().length - 1];
    check("mortgage: 20% down paid, loan recorded", Math.abs((b2 - cash(p)) - ask2 * RE.downPayment) < 2 && !!mp.mortgage && Math.abs(mp.mortgage!.balance - ask2 * 0.8) < 2);
    const bal0 = mp.mortgage!.balance;
    for (let i = 0; i < 10; i++) { p.applyWeekly(); clearAlerts(); }
    check("mortgage balance goes down each week", mp.mortgage!.balance < bal0, `${Math.round(bal0)} -> ${Math.round(mp.mortgage!.balance)}`);
    check("pay off mortgage", pf.payOffMortgage(p, mp.id) == null && mp.mortgage == null);
    // a poor player is refused
    const broke = { ...p, getMoneyState: () => ({ getCash: () => BigInteger.valueOf(1000), getSavings: () => BigInteger.ZERO }), getJobState: () => ({ getCurrentJobState: () => null }) };
    check("bank refuses a mortgage you can't afford", pf.mortgageRefusal(broke, 5_000_000) != null);
}

// renovations
{
    const before = pf.value(house), c0 = cash(p), cond0 = house.condition;
    const cost = pf.renovationCost(house, "kitchen")!;
    check("renovate kitchen", pf.renovate(p, house.id, "kitchen") == null && house.renovations.kitchen === 1);
    check("renovation costs money, raises value and condition", Math.round(c0 - cash(p)) === Math.round(cost) && pf.value(house) > before && house.condition >= Math.min(100, cond0 + 1));
    pf.renovate(p, house.id, "kitchen"); pf.renovate(p, house.id, "kitchen");
    check("renovation levels cap at 3", pf.renovate(p, house.id, "kitchen") != null && house.renovations.kitchen === 3);
    p.getAttributeState(); p.collectWeeklyValues();
    check("renovated home gives comfort", house.comfort() > 0);
}

// problems and repairs
{
    house.problems = [];   // a random problem may already have broken out during the weeks above
    house.problems.push({ type: "leakyRoof", weeks: 0 });
    const c0 = house.condition;
    withRandom(0.999, () => pf.advanceWeek(p));
    check("open problem damages condition", house.condition < c0);
    const c1 = cash(p);
    check("pro repair fixes it", pf.repair(p, house.id, "leakyRoof", false).startsWith("ok:") && house.problems.length === 0 && cash(p) < c1);
    house.problems.push({ type: "pests", weeks: 0 });
    const fail = withRandom(0.99, () => pf.repair(p, house.id, "pests", true));
    check("DIY can fail", house.problems.length === 1 && /didn't hold/.test(fail));
    withRandom(0.1, () => pf.repair(p, house.id, "pests", true));
    check("DIY can succeed", house.problems.length === 0);
    house.problems.push({ type: "foundation", weeks: 0 });
    check("some problems need a pro", !pf.repair(p, house.id, "foundation", true).startsWith("ok:"));
    pf.repair(p, house.id, "foundation", false);
}

// upkeep vs neglect
{
    const a = pf.makeProperty("house", "unitedStates"), b = pf.makeProperty("house", "unitedStates");
    a.upkeep = "none"; b.upkeep = "premium"; b.neighborhood = a.neighborhood; b.quality = a.quality; a.use = b.use = "vacant";
    pf.properties.push(a, b);
    HousingState; p.getHousingState().getState(Housing.house).setNumberOwned(p.getHousingState().getState(Housing.house).getNumberOwned().add(BigInteger.valueOf(2)));
    withRandom(0.999, () => { for (let i = 0; i < 96; i++) pf.advanceWeek(p); });
    check("neglected property runs down faster than a premium-upkeep one", a.condition < b.condition - 5, `none ${a.condition.toFixed(1)} vs premium ${b.condition.toFixed(1)}`);
    check("worse condition → lower value", pf.value(a) < pf.value(b));
    const before = a.condition;
    check("maintenance crew restores condition", pf.service(p, a.id, false) == null && a.condition > before);
    check("maintenance has a cooldown", pf.service(p, a.id, false) != null);
}

// rentals and vacancy
{
    const a = pf.all().find((x) => x.upkeep === "none")!;
    check("rent out", pf.setUse(p, a.id, "rental") == null && a.use === "rental" && a.tenant == null);
    withRandom(0.01, () => pf.advanceWeek(p));
    check("a tenant moves in", !!a.tenant && pf.weeklyRent(a) > 0);
    check("leave vacant", pf.setUse(p, a.id, "vacant") == null && pf.weeklyRent(a) === 0);
}

// market moves
{
    const idx0 = pf.marketIndex("unitedStates");
    for (let i = 0; i < 200; i++) pf.stepMarket("unitedStates");
    check("market index moves", Math.abs(pf.marketIndex("unitedStates") - idx0) > 1e-6, `${idx0.toFixed(3)} -> ${pf.marketIndex("unitedStates").toFixed(3)}`);
}

// screens build without errors
{
    let ok = true, msg = "";
    try {
        for (const [t, k] of [[GenericListType.realEstate, ""], [GenericListType.propertyMarket, ""], [GenericListType.propertyDetails, house.id], [GenericListType.propertyRenovations, house.id], [GenericListType.propertyFamily, house.id], [GenericListType.propertyDetails, "missing"]] as const) {
            const vm = GenericListModelGenerator.INSTANCE.genericListViewModels(t, k, true);
            if (!vm.getContentViewModels().size()) { ok = false; msg += t.name() + " empty; "; }
        }
        const prof = ProfileModelGenerator.INSTANCE?.getHousingViewModels?.();
        if (prof && !buttons(prof).some((b) => /Open Real Estate/.test(b.getTitle()))) { ok = false; msg += "profile has no entry; "; }
        if (prof && buttons(prof).some((b) => /Purchase|Sell/.test(b.getTitle()))) { ok = false; msg += "old buy/sell buttons still on Profile; "; }
        const ov = buttons(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.realEstate, "", true).getContentViewModels()).map((b) => b.getTitle());
        if (!ov.includes("Homes for Sale") || !ov.includes("Homes for Rent")) { ok = false; msg += "real estate screen missing Find a Home: " + ov.join(","); }
        if (ov.some((t) => /^Buy 1$|^Buy max|^Sell all/.test(t))) { ok = false; msg += "old bulk buy/sell buttons still there: " + ov.join(","); }
    } catch (e: any) { ok = false; msg = e.stack; }
    check("all property screens render", ok, msg);
    const det = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.propertyDetails, house.id, true);
    const titles = buttons(det.getContentViewModels()).map((b) => b.getTitle());
    check("details screen offers renovate / sell / upkeep", titles.some((t) => /Renovate/.test(t)) && titles.includes("Sell") && titles.includes("Premium"), titles.join(", "));
}

// selling
{
    const target = pf.all().find((x) => x.use !== "residence" && !x.mortgage)!;
    const n0 = pf.all().length, owned0 = p.getHousingState().getState(RealEstatePortfolio.housingOf(target.type)).getNumberOwned().intValue(), c0 = cash(p);
    const expect = pf.saleProceeds(target);
    check("sell property", pf.sellProperty(p, target.id) == null && pf.all().length === n0 - 1);
    check("sale pays market value minus fees", Math.abs(cash(p) - c0 - expect) < 2 && p.getHousingState().getState(RealEstatePortfolio.housingOf(target.type)).getNumberOwned().intValue() === owned0 - 1);
    check("sale recorded in history", pf.sold.length >= 1);
    HousingState.purchase$default(p.getHousingState(), Housing.small_apartment, BigInteger.valueOf(30), 0, null);
    const block = pf.all().find((x) => x.type === "small_apartment" && x.units === 30);
    const apts0 = p.getHousingState().getState(Housing.small_apartment).getNumberOwned().intValue();
    check("bulk classic buy becomes one 30-unit portfolio", !!block);
    p.getHousingState().sell(Housing.small_apartment, BigInteger.valueOf(10));
    check("classic sell takes units from the portfolio", block!.units === 20 && p.getHousingState().getState(Housing.small_apartment).getNumberOwned().intValue() === apts0 - 10);
    p.getHousingState().sellMax(Housing.small_apartment);
    check("classic sell max", !pf.all().some((x) => x.type === "small_apartment") && p.getHousingState().getState(Housing.small_apartment).getNumberOwned().intValue() === 0);
}

// family, gifts and inheritance
{
    const ava = new Person(Relationship.child, Sex.female, p.getLastName(), 48 * 25 + 5); ava.setFirstName("Ava");
    const ben = new Person(Relationship.child, Sex.male, p.getLastName(), 48 * 22 + 5); ben.setFirstName("Ben");
    p.getFamilyState().getFamilyMembers().add(ava); p.getFamilyState().getFamilyMembers().add(ben);
    HousingState.purchase$default(p.getHousingState(), Housing.house, BigInteger.valueOf(2), 0, null);
    const [h1, h2] = pf.all().filter((x) => x.type === "house" && x.use !== "residence").slice(-2);
    check("adult children can be housed", pf.housableFamily(p).length === 2);
    check("family member moves in", pf.addOccupant(p, h1.id, ava.getId()) == null && h1.use === "family" && h1.occupants.includes(ava.getId()) && h1.tenant == null);
    const rel0 = ava.getRelationshipProgress();
    withRandom(0.01, () => pf.advanceWeek(p));
    check("housing family improves the relationship", ava.getRelationshipProgress() > rel0 || rel0 >= 100);
    p.collectWeeklyValues();
    check("owner pays utilities for family homes", pf.weeklyUtilities(h1) > 0);
    const owned0 = p.getHousingState().getState(Housing.house).getNumberOwned().intValue();
    check("gift a property", pf.gift(p, h2.id, ben.getId()) == null && !pf.get(h2.id) && pf.gifted.length === 1 && p.getHousingState().getState(Housing.house).getNumberOwned().intValue() === owned0 - 1);

    // inheritance: die and continue as Ava (who lives in h1)
    const count = pf.all().length, value = pf.totalValue(), parentId = p.getId();
    const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
    alerts.length = 0;
    for (let i = 0; i < 60 && gsm.getSaveState().getHasGameStarted(); i++) {
        while (alerts.length) { const a = alerts.shift(); if (/died/i.test(a.getTitle())) { alerts.unshift(a); break; } AlertManager.INSTANCE.alertDismissed(a); }
        if (alerts.length) break;
        (p.getAttributeState() as any).lowAttributeCountdown_health = 10; p.getAttributeState().setHealth(0); p.applyWeekly();
    }
    const death = alerts.find((a) => /died/i.test(a.getTitle()));
    check("parent died", !!death);
    const valueAtDeath = pf.totalValue();
    (death?.getAdditionalButtons() ?? []).find((b: any) => /child/i.test(b.getTitle()))?.getAction().invoke();
    AlertManager.INSTANCE.alertDismissed(death);
    const heirBtn = buttons(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.chooseHeir, "", false).getContentViewModels()).find((b) => /Ava/.test(b.getTitle()));
    heirBtn?.getAction().invoke();
    const h = GameStateManager.INSTANCE.getPersonState();
    check("playing as Ava", h.getFirstName() === "Ava" && h.getId() !== parentId);
    const hp = h.getRealEstate();
    check("heir inherits every property", hp === pf && hp.all().length === count, `${hp.all().length}/${count}`);
    check("inheritance recorded in property history", hp.all().every((x) => x.history.some((e) => /Inherited by Ava/.test(e.text))));
    check("Ava keeps living in the house she lived in", hp.get(h1.id)?.use === "residence" && h.getHousingState().currentHousing().getType() === Housing.house);
    check("gift to Ben stays Ben's", hp.gifted.length === 1 && !hp.get(h2.id));
    check("estate value carried over", Math.abs(hp.totalValue() - valueAtDeath) / valueAtDeath < 0.001);
    alerts.length = 0;
    for (let i = 0; i < 4; i++) { h.applyWeekly(); clearAlerts(); }
    check("heir's weeks run", true);
    const back = SaveCodec.decode(SaveCodec.encode(gsm)).getSaveState().currentSlot().getPersonState();
    check("heir's save round-trips with properties", back.getRealEstate().all().length === count);
}

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
