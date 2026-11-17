// Years-in-career counter, retirement at 60 (physical age), and the perk selection screen (switch off, Enable/Disable all).
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Job } from "../src/game/Enums/Job";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Retirement } from "../src/game/Managers/Retirement";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
import fs from "fs";
let fixture: string | null = fs.readFileSync("test/fixtures/save-v0.3-landlord.txt", "utf8");
const alerts: any[] = [];
let reloads = 0;
UIBridge.install({ broadcast() {}, reloadGenericList() { reloads++; }, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => fixture, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Work; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const WPY = 48;
const text = (vm: any): string => {
    const parts: string[] = [];
    const walk = (o: any, d: number) => { if (o == null || d > 4) return; if (typeof o === "string") { parts.push(o); return; } if (typeof o !== "object") return; if (typeof o.text === "string") parts.push(o.text); for (const k of Object.keys(o)) if (k !== "text") walk(o[k], d + 1); };
    walk(vm, 0); return parts.join(" | ");
};
const workTab = () => Array.from(new WorkModelGenerator().getWorkViewModels() as any) as any[];

// ---- old save (made before careers were counted or retirement existed)
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
{
    const p: any = GameStateManager.INSTANCE.getPersonState();
    let ok = true, msg = "";
    try { workTab(); p.applyWeekly(); clear(); } catch (e: any) { ok = false; msg = e.message; }
    check("old save: Work tab and a week run fine", ok, msg);
    check("old save: not retired", !Retirement.isRetired(p) && Retirement.pension(p) === 0);
}

// ---- years in career
fixture = null;
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.highSchoolDropout);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear();
const p: any = GameStateManager.INSTANCE.getPersonState();
p.getJobState().switchJob(Job.retail);
const st: any = p.getJobState().getState(Job.retail);
check("no years shown before working", Retirement.careerText(st) === null);
const keepAlive = () => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(5000), MoneyUpdateType.workIncome, null, null, 12, null); };
for (let w = 0; w < 10; w++) { keepAlive(); p.getJobState().work(Job.retail, WorkAction.normal); clear(); }
check("weeks counted while working", Retirement.weeksIn(st) === 10, String(Retirement.weeksIn(st)));
check("under a year: 'Less than a year in this career'", Retirement.careerText(st) === "Less than a year in this career", String(Retirement.careerText(st)));
for (let w = 0; w < 2 * WPY; w++) { keepAlive(); p.applyWeekly(); clear(); }  // other weeks still count while it's your job
check("counts every week it's your job (2 years 10 weeks = 2 years)", Retirement.yearsIn(st) === 2 && Retirement.careerText(st) === "2 years in this career", String(Retirement.careerText(st)));
check("Work tab card shows the years", workTab().some((vm) => /2 years in this career/.test(text(vm))));
p.getJobState().switchJob(Job.burgerFlipper);
for (let w = 0; w < 5; w++) { keepAlive(); p.applyWeekly(); clear(); }
check("switching away stops the counter but keeps it", Retirement.weeksIn(st) === 2 * WPY + 10 && Retirement.weeksIn(p.getJobState().getState(Job.burgerFlipper)) === 5);
p.getJobState().switchJob(Job.retail);
p.getJobState().getState(Job.retail).setLevel(5);

// ---- retirement uses physical age
p.setAgeInWeeks(18 * WPY); p.trueAgeInWeeks = 80 * WPY;
check("physically 18, true age 80: can't retire", !Retirement.canRetire(p) && Retirement.cell() === null, `age ${p.getAgeInYears()} true ${p.getTrueAgeInYears()}`);
p.setAgeInWeeks(59 * WPY);
check("59: can't retire", !Retirement.canRetire(p) && Retirement.cell() === null);
// birthday pop-up at 60
p.setAgeInWeeks(60 * WPY - 1);
keepAlive(); p.applyWeekly();
const offer = alerts.find((a) => /You Can Retire/.test(a.getTitle?.() ?? ""));
check("turning 60 with a job: retire-or-keep-working pop-up", !!offer, alerts.map((a) => a.getTitle?.()).join(", "));
const keep = [offer?.getPositiveButton?.(), offer?.getNegativeButton?.()].find((b: any) => b && /Keep working/.test(b.getTitle()));
keep?.getAction().invoke(); clear();
check("keep working: still employed, not retired", p.getJobState().getCurrentJob() === Job.retail && !Retirement.isRetired(p));
for (let w = 0; w < WPY; w++) { keepAlive(); p.applyWeekly(); clear(); }
check("pop-up only once", !alerts.some((a) => /You Can Retire/.test(a.getTitle?.() ?? "")));
check("60+: Retire row on the Work tab", workTab().some((vm) => vm.title === "Retire"));
const years = Retirement.yearsIn(st);
const expected = Math.max(100, Math.round(1500 * Math.min(0.7, 0.02 * years)));
check("pension = 2% of pay per career year (min $100)", Retirement.pensionIfRetiredNow(p) === expected, `${Retirement.pensionIfRetiredNow(p)} vs ${expected}, ${years} yrs`);
const pension = Retirement.retire(); clear();
check("retiring ends the job", Retirement.isRetired(p) && p.getJobState().getCurrentJob() == null && p.retiredFrom === "Store Manager");
check("Work tab shows Retired row", workTab().some((vm) => vm.title === "Retired" && /Pension/.test(text(vm))));
p.getMoneyState().cashDeltaThisWeek.clear();
p.collectWeeklyValues();
const line = Array.from(p.getMoneyState().cashDeltaThisWeek as any).find((x: any) => x.getFirst() === "Pension") as any;
check("weekly Pension income line", !!line && line.getSecond().intValue() === pension, line ? String(line.getSecond()) : "none");
p.getMoneyState().cashDeltaThisWeek.clear();
const c0 = p.getMoneyState().getCash().doubleValue(); keepAlive(); const c1 = p.getMoneyState().getCash().doubleValue();
void c0; void c1;
// save round trip
const saved = (SaveCodec as any).encode(p);
if (saved != null) {
    const back: any = (SaveCodec as any).decode(saved);
    check("save round trip keeps retirement + career years", back.retired === true && back.pensionWeekly === pension && Retirement.weeksIn(back.getJobState().getState(Job.retail)) === Retirement.weeksIn(st));
}
// back to work
const applyBtn = (workTab().find((vm) => vm.title === "Cashier" || /Cashier|Store Manager/.test(vm.title ?? "")) as any);
const btn = applyBtn?.actionButton ?? applyBtn?.button ?? applyBtn?.getActionButton?.();
btn?.getAction?.().invoke();
const back = alerts.find((a) => /Back to Work/.test(a.getTitle?.() ?? ""));
check("applying while retired asks first", !!back, alerts.map((a) => a.getTitle?.()).join(", "));
const go = [back?.getPositiveButton?.(), back?.getNegativeButton?.()].find((b: any) => b && /Go back/.test(b.getTitle()));
go?.getAction().invoke(); clear();
check("going back to work ends retirement", !Retirement.isRetired(p) && p.getJobState().getCurrentJob() === Job.retail);
check("retiring again never pays less", Retirement.pensionIfRetiredNow(p) >= pension);

// ---- perks
GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.highSchoolDropout);
const ng: any = GameStateManager.INSTANCE.getNewGamePlayerState();
const screen = () => GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.perkSelection, "", true);
const rows = () => Array.from(screen().getContentViewModels() as any) as any[];
const perkRows = () => rows().filter((r) => r.switchViewModel && !r.switchViewModel.getHidden());
const total = perkRows().length;
check("unlocked perks start switched on", total > 0 && ng.getPerkState().getPerks().size() === total, `${ng.getPerkState().getPerks().size()} / ${total}`);
const first = perkRows()[0];
first.switchViewModel.getOnValueChangedHandler().invoke(false);
check("switching a perk off sticks after the screen redraws", ng.getPerkState().getPerks().size() === total - 1 && perkRows()[0].switchViewModel.getInitialValue() === false && ng.getPerkState().getPerks().size() === total - 1);
const allRow = () => rows().find((r) => r.title === "All Perks");
check("All Perks row with Enable all / Disable all", !!allRow() && allRow().getButtons().map((b: any) => b.getTitle()).join(",") === "Enable all,Disable all");
allRow().getButtons()[1].getAction().invoke();
check("Disable all turns every perk off", ng.getPerkState().getPerks().size() === 0 && perkRows().every((r) => !r.switchViewModel.getInitialValue()));
check("Disable all greyed out when all are off", !allRow().getButtons()[1].getEnabled() && allRow().getButtons()[0].getEnabled());
allRow().getButtons()[0].getAction().invoke();
check("Enable all turns every perk on", ng.getPerkState().getPerks().size() === total && perkRows().every((r) => r.switchViewModel.getInitialValue()));
perkRows()[1].switchViewModel.getOnValueChangedHandler().invoke(false);
const chosen = ng.getPerkState().getPerks().size();
GameStateManager.INSTANCE.startNewGame(ng); clear();
check("the new life starts with exactly the chosen perks", GameStateManager.INSTANCE.getPersonState().getPerkState().getPerks().size() === chosen && chosen === total - 1);

console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures ? 1 : 0);
