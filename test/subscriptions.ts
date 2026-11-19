// Subscriptions (v0.13.0, Profile tab): Gym Membership, Gym Coach (needs the gym), Therapist.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { HeaderTitleViewModel } from "../src/game/Models/HeaderTitleViewModel";
import { PersonAttribute } from "../src/game/Enums/PersonAttribute";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { Subscriptions } from "../src/game/Managers/Subscriptions";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { MoneyDestination } from "../src/game/Enums/MoneyDestination";
import { BankModelGenerator } from "../src/game/Controllers/BankModelGenerator";
import fs from "fs";

let fixture: string | null = fs.readFileSync("test/fixtures/save-v0.3-landlord.txt", "utf8");
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => fixture, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Profile; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const profile = () => Array.from(new ProfileModelGenerator().generateViewModels().getContentViewModels() as any) as any[];
const subRows = () => { const r = profile(); const i = r.findIndex((x) => x instanceof HeaderTitleViewModel && x.title === "Subscriptions"); return i < 0 ? [] : r.slice(i + 3, i + 6); };
const billsRow = () => { const r = profile(); const i = r.findIndex((x) => x instanceof HeaderTitleViewModel && x.title === "Subscriptions"); return r[i + 2]; };
const autoRow = () => { const r = profile(); const i = r.findIndex((x) => x instanceof HeaderTitleViewModel && x.title === "Subscriptions"); return r[i + 1]; };
const delta = (p: any, attr: any, key: string) => { p.collectWeeklyValues(); const list = Array.from(p.getAttributeState().getDeltaThisWeek(attr) as any) as any[]; p.resetValuesThisWeek(); const hit = list.find((x) => x.getFirst() === key); return hit ? Number(hit.getSecond()) : 0; };
const flow = (p: any) => p.getTotalCashFlowPerWeek().intValue();
const start = (sc: any, tweak?: (np: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    tweak?.(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};

// ---------------------------------------------------------------- old save
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p: any = GameStateManager.INSTANCE.getPersonState();
    check("old save: no subscriptions", Subscriptions.active(p).length === 0);
    const rows = subRows();
    check("Profile tab: a Subscriptions section with Gym Membership, Gym Coach, Therapist", rows.map((r) => r.title).join(",") === "Gym Membership,Gym Coach,Therapist", rows.map((r) => r.title).join(","));
    check("old save: Automatic Savings is first in Subscriptions, off, button Set Up", /^Automatic Savings$/.test(autoRow()?.title) && autoRow().actionButton.title === "Set Up" && Subscriptions.autoSave(p) === 0, autoRow()?.title);
    check("rows have their pictures and weekly prices", rows.every((r) => r.imageId != null) && /\$50\/wk/.test(JSON.stringify(rows[0])));
}

// ---------------------------------------------------------------- an adult
fixture = null;
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
let p = start(LifeScenario.educatedAndInDebt);
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(100000), MoneyUpdateType.workIncome, null, null, 12, null);
{
    check("Gym Coach needs a Gym Membership", Subscriptions.blocked(Subscriptions.def("coach"), p) === "Needs a Gym Membership" && !Subscriptions.subscribe("coach", p));
    const f0 = flow(p);
    const cash0 = p.getMoneyState().getCash().intValue();
    const wk0 = p.getAgeInWeeks();
    const btn = subRows()[0].actionButton;
    check("the Gym row's button reads $50/wk and is enabled", btn.title === "$50/wk" && btn.enabled, `${btn.title} ${btn.enabled}`);
    btn.action.invoke();
    check("subscribing is instant (no week passes, nothing paid yet)", Subscriptions.has("gym", p) && p.getAgeInWeeks() === wk0 && p.getMoneyState().getCash().intValue() === cash0);
    check("Gym Membership: −$50 a week in your cash flow", f0 - flow(p) === 50, `${f0} → ${flow(p)}`);
    check("…and +2 health a week", delta(p, PersonAttribute.health, "Gym Membership") === 2);
    check("Gym Coach unlocks", Subscriptions.subscribe("coach", p));
    check("Coach: another −$150 and +3 health", f0 - flow(p) === 200 && delta(p, PersonAttribute.health, "Gym Coach") === 3, `${f0 - flow(p)} ${delta(p, PersonAttribute.health, "Gym Coach")}`);
    check("Therapist: −$200 and +4 sanity (mental health)", Subscriptions.subscribe("therapist", p) && f0 - flow(p) === 400 && delta(p, PersonAttribute.sanity, "Therapist") === 4);
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
    p.applyWeekly(); clear();
    check("still active after a week", Subscriptions.active(p).length === 3);
    const rows = subRows();
    check("active rows say Active and offer Cancel", rows.every((r) => /Cancel/.test(JSON.stringify(r)) && /Active/.test(JSON.stringify(r))));
    const gone = Subscriptions.cancel("gym", p);
    check("cancelling the gym also cancels the coach", gone.join(",") === "gym,coach" && !Subscriptions.has("coach", p) && Subscriptions.has("therapist", p));
    p.getCrimeState().isInJail = true;
    const fj = flow(p);
    p.getCrimeState().isInJail = false;
    check("paused (no cost, no benefit) while in jail", flow(p) - fj === -200 && delta(p, PersonAttribute.sanity, "Therapist") === 4);
    const round: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    check("saved and loaded", JSON.stringify(round.getSaveState().currentSlot().getPersonState().subscriptions) === JSON.stringify(["therapist"]));
    // run out of money
    Subscriptions.subscribe("gym", p);
    MoneyState.updateMoney$default(p.getMoneyState(), p.getMoneyState().getCash().add(BigInteger.valueOf(10)), MoneyUpdateType.directSpend, null, null, 12, null);
    p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
    p.applyWeekly();
    const cancelled = alerts.some((a) => a.getTitle?.() === "Subscriptions Cancelled");
    clear();
    check("ending a week in debt cancels them all (with a message)", p.getMoneyState().getCash().intValue() >= 0 || (Subscriptions.active(p).length === 0 && cancelled), `cash ${p.getMoneyState().getCash()} subs ${Subscriptions.active(p)}`);
}

// ---------------------------------------------------------------- v0.23.0 Automatic Savings
{
    const ms = () => p.getMoneyState();
    const num = (b: any) => Number(b.toString());
    p.getJobState().switchJob(p.getJobState().statesForPlayer(p)[0].getType());
    const job = p.getJobState().getCurrentJob();
    check("a job to test with", job != null);
    // open the chooser from the row
    autoRow().actionButton.action.invoke();
    const a = alerts.find((x) => x.getTitle?.() === "Automatic Savings");
    const labels = a ? [a.getPositiveButton().getTitle(), ...Array.from(a.getAdditionalButtons() as any).map((b: any) => b.getTitle()), a.getNegativeButton().getTitle()] : [];
    check("Set Up asks: 25%, 50%, 75%, 80% (or Cancel)", labels.join(",") === "25%,50%,75%,80%,Cancel", labels.join(","));
    const pick = (label: string) => { const x = alerts.find((y) => y.getTitle?.() === "Automatic Savings"); const all = [x.getPositiveButton(), ...Array.from(x.getAdditionalButtons() as any), x.getNegativeButton()] as any[]; all.find((b) => b.getTitle().startsWith(label)).getAction().invoke(); clear(); };
    pick("50%");
    check("picking 50% turns it on; the row shows it", Subscriptions.autoSave(p) === 50 && autoRow().title === "Automatic Savings: 50%" && autoRow().actionButton.title === "Change", autoRow().title);
    for (const pct of [25, 50, 75, 80]) {
        Subscriptions.setAutoSave(pct, p);
        const c0 = num(ms().getCash()), s0 = num(ms().getSavings());
        const saved = Subscriptions.payCheck(1000, p);
        check(`${pct}% of a $1,000 paycheck goes to savings, the rest to cash`, saved === pct * 10 && num(ms().getSavings()) - s0 === pct * 10 && num(ms().getCash()) - c0 === 1000 - pct * 10, `${num(ms().getSavings()) - s0} / ${num(ms().getCash()) - c0}`);
    }
    // a real week of work
    Subscriptions.setAutoSave(75, p);
    const t1 = Subscriptions.autoSaved(p);
    const real = Subscriptions.payCheck; let pay = 0, part = 0;
    (Subscriptions as any).payCheck = (n: number, q: any) => { pay = n; part = real(n, q); return part; };
    p.getJobState().work(job, WorkAction.normal); clear();
    (Subscriptions as any).payCheck = real;
    check("working a week pays through Automatic Savings: 75% to savings", pay > 0 && part === Math.floor(pay * 0.75) && Subscriptions.autoSaved(p) - t1 === part, `pay ${pay}, saved ${part}`);
    check("the row counts what you've saved so far", /Saved so far: \$/.test(JSON.stringify(autoRow())));
    const round: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    const rp = round.getSaveState().currentSlot().getPersonState();
    check("saved and loaded (75%, total saved)", rp.autoSavePercent === 75 && rp.autoSaved === Subscriptions.autoSaved(p));
    // turn it off
    autoRow().actionButton.action.invoke();
    const b = alerts.find((x) => x.getTitle?.() === "Automatic Savings");
    check("when on, the chooser marks the current one and offers Turn Off", b != null && Array.from(b.getAdditionalButtons() as any).some((x: any) => x.getTitle() === "75% ✓") && b.getNegativeButton().getTitle() === "Turn Off");
    pick("Turn Off");
    const s2 = num(ms().getSavings());
    Subscriptions.payCheck(1000, p);
    check("Turn Off: the whole paycheck goes to cash again", Subscriptions.autoSave(p) === 0 && num(ms().getSavings()) === s2 && autoRow().title === "Automatic Savings");
}

// ---------------------------------------------------------------- v0.24.0 Pay Bills from Savings
{
    const ms = () => p.getMoneyState();
    const num = (b: any) => Number(b.toString());
    check("Pay Bills from Savings row: Off, Turn On", billsRow()?.title === "Pay Bills from Savings: Off" && billsRow().actionButton.title === "Turn On", billsRow()?.title);
    const bank = Array.from(new BankModelGenerator().generateViewModels().getContentViewModels() as any) as any[];
    check("the Bank tab has both rows too", bank.some((r) => /^Automatic Savings/.test(r.title)) && bank.some((r) => /^Pay Bills from Savings/.test(r.title)));
    billsRow().actionButton.action.invoke();
    check("Turn On", Subscriptions.billsFromSavings(p) && billsRow().title === "Pay Bills from Savings: On" && billsRow().actionButton.title === "Turn Off");
    // put money in savings, then a week of bills
    MoneyState.updateMoney$default(ms(), BigInteger.valueOf(10_000_000), MoneyUpdateType.workIncome, null, MoneyDestination.savings, 4, null);
    Subscriptions.subscribe("gym", p);
    p.collectWeeklyValues();
    const sDelta = Array.from((ms() as any).savingsDeltaThisWeek as any).map((x: any) => [x.getFirst(), num(x.getSecond())]) as any[];
    const cDelta = Array.from((ms() as any).cashDeltaThisWeek as any).map((x: any) => [x.getFirst(), num(x.getSecond())]) as any[];
    p.resetValuesThisWeek();
    check("bills go to savings, not cash", sDelta.some(([k, v]) => k === "Gym Membership (from savings)" && v === -50) && sDelta.some(([k]) => /^Rent/.test(k)) && !cDelta.some(([, v]) => v < 0), `savings ${JSON.stringify(sDelta)} cash ${JSON.stringify(cDelta)}`);
    // savings can't cover it → cash
    const s0 = num(ms().getSavings());
    MoneyState.updateMoney$default(ms(), BigInteger.valueOf(s0), MoneyUpdateType.directSpend, null, MoneyDestination.savings, 4, null);
    check("(savings emptied)", num(ms().getSavings()) === 0);
    p.collectWeeklyValues();
    const c2 = Array.from((ms() as any).cashDeltaThisWeek as any).some((x: any) => x.getFirst() === "Gym Membership" && num(x.getSecond()) === -50);
    p.resetValuesThisWeek();
    check("…when savings can't cover a bill, it comes out of cash", c2);
    const round: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    check("saved and loaded (On)", round.getSaveState().currentSlot().getPersonState().billsFromSavings === true);
    billsRow().actionButton.action.invoke();
    MoneyState.updateMoney$default(ms(), BigInteger.valueOf(5000), MoneyUpdateType.workIncome, null, MoneyDestination.savings, 4, null);
    p.collectWeeklyValues();
    const c3 = Array.from((ms() as any).cashDeltaThisWeek as any).some((x: any) => x.getFirst() === "Gym Membership");
    p.resetValuesThisWeek();
    check("Turn Off: bills come out of cash again", !Subscriptions.billsFromSavings(p) && c3);
    Subscriptions.cancel("gym", p);
}

// ---------------------------------------------------------------- a child
p = start(LifeScenario.youngChild);
MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(100000), MoneyUpdateType.workIncome, null, null, 12, null);
check("a young child can't subscribe (gym 14+, therapist 12+)", Subscriptions.blocked(Subscriptions.def("gym"), p) === "Must be at least 14 years old" && Subscriptions.blocked(Subscriptions.def("therapist"), p) === "Must be at least 12 years old" && !Subscriptions.subscribe("gym", p));

console.log(failures ? `${failures} FAILED` : "ALL PASSED");
if (failures) process.exit(1);
