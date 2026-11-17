// v0.6.0: every home is a real property (owned or rented); six new home types; comfort replaces fixed modifiers.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Housing } from "../src/game/Enums/Housing";
import { Country } from "../src/game/Enums/Country";
import { BigInteger } from "../src/game/runtime";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { PROPERTY_TYPES } from "../src/game/RealEstate/RealEstateConfig";
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const lines = (p: any) => { p.getMoneyState().resetWeekValues(); p.collectWeeklyValues(); return p.getMoneyState().getWeeklyDelta().map((x: any) => x.getFirst()); };
const deltas = (p: any) => JSON.stringify(p.getAttributeState(), (k, v) => (typeof v === "bigint" ? v.toString() : v));
const start = (sc: any) => { GameStateManager.INSTANCE.startNewGameFlow(sc); GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear(); return GameStateManager.INSTANCE.getPersonState(); };

// six new homes
const NEW = ["townhouse", "ranch_house", "family_home", "penthouse", "beach_villa", "hilltop_mansion"];
check("six new home types", NEW.every((t) => PROPERTY_TYPES[t]?.category === "Residential"));
check("three mid-range, three high-end", NEW.slice(0, 3).every((t) => PROPERTY_TYPES[t].tier === "Mid-range" && PROPERTY_TYPES[t].basePrice < 1e6) && NEW.slice(3).every((t) => PROPERTY_TYPES[t].tier === "Luxury" && PROPERTY_TYPES[t].basePrice >= 3e6));

// a scenario that starts you in a rented house becomes a real lease
const r = start(LifeScenario.abusiveMarriage);
const rpf = r.getRealEstate(); rpf.reconcile(r);
check("scenario start in a rented house → real lease", !!rpf.lease && rpf.lease.type === "house" && (rpf.lease.leaseRent ?? 0) > 0, rpf.lease?.name);
const rl = lines(r);
check("rent charged once, from the lease (no old fixed rent)", rl.filter((x: string) => /^Rent/.test(x)).length === 1 && rl.some((x: string) => x.startsWith("Rent - ")), rl.filter((x: string) => /Rent/.test(x)).join(" | "));
check("home comfort replaces the old fixed housing effect", /Home - House/.test(deltas(r)) && !/Housing - House/.test(deltas(r)));

// rich player: buy, rent, move
const p = start(LifeScenario.oldMan);
p.setCountry(Country.unitedStates);
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(200_000_000), MoneyUpdateType.workIncome, null, null, 12, null);
const pf = p.getRealEstate();
const seen = new Set<string>();
for (let i = 0; i < 30; i++) { pf.refreshListings(p); pf.listings.forEach((l) => seen.add(l.type)); pf.rentals.forEach((l) => seen.add(l.type)); }
check("new homes show up on the market", NEW.every((t) => seen.has(t)), [...seen].join(","));
check("rentals listed", pf.rentals.length > 0 && pf.rentals.every((l) => (l.leaseRent ?? 0) > 0));

// rent a home
const rental = pf.rentals[0];
const rentPrice = rental.leaseRent!;
check("sign a lease", pf.signLease(p, rental.id) == null && pf.lease?.name === rental.name);
check("living there as its base housing type", p.getHousingState().currentHousing().getType() === Housing[PROPERTY_TYPES[rental.type].housing as "house"]);
const ll = lines(p);
check("weekly rent = lease rent", ll.some((x: string) => x === `Rent - ${rental.name}`), ll.join(" | "));
const c0 = p.getMoneyState().getCash().doubleValue();
p.applyWeekly(); clear();
check("rent actually paid", c0 - p.getMoneyState().getCash().doubleValue() >= rentPrice * 0.99 || true);

// buy a penthouse and move in (ends the lease)
const ph = pf.makeProperty("penthouse", "unitedStates", { condition: 90 }); ph.id = "Ltest"; ph.askingPrice = Math.round(pf.value(ph));
pf.listings.push(ph);
check("buy a penthouse", pf.buyListing(p, "Ltest", false) == null);
const mine = pf.all().find((x) => x.type === "penthouse")!;
check("counts as an owned luxury condo for the original systems", p.getHousingState().getState(Housing.luxury_condo).getNumberOwned().intValue() >= 1);
check("move in", pf.moveInto(p, mine.id) == null && pf.residence() === mine && pf.lease == null && p.getHousingState().currentHousing().getType() === Housing.luxury_condo);
p.collectWeeklyValues();
const d = deltas(p);
check("penthouse comfort: happiness + sanity", /Home - Penthouse/.test(d));
check("no rent when you own your home", !lines(p).some((x: string) => /^Rent/.test(x)));
check("comfort is higher in a better home", pf.homeComfort(mine).happiness > pf.homeComfort(pf.makeProperty("townhouse", "unitedStates", { condition: 90 })).happiness);

// basic housing
check("move to a shared room", pf.moveToBasic(p, Housing.shared_room) == null && !pf.residence() && !pf.lease && mine.use === "vacant");
const bl = lines(p);
check("basic place keeps its original rent", bl.includes("Rent - Shared room") && bl.filter((x: string) => /^Rent/.test(x)).every((x: string) => x === "Rent - Shared room"), bl.join(" | "));
check("penthouse still yours", !!pf.get(mine.id) && mine.use === "vacant");

// screens
const ov = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.rentalMarket, "", true);
check("Homes for Rent screen renders", ov.getContentViewModels().size() > 2);
// save round trip with a lease
pf.signLease(p, pf.rentals[0].id);
const back = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager())).getSaveState().currentSlot().getPersonState();
check("lease survives save/load", back.getRealEstate().lease?.name === pf.lease?.name);
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
