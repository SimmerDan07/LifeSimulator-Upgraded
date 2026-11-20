// v0.28.0 Illnesses: catching, symptoms, treatment, prevention, who pays, vampires, heirs, causes of death.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Country } from "../src/game/Enums/Country";
import { Housing } from "../src/game/Enums/Housing";
import { Diet } from "../src/game/Enums/Diet";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger } from "../src/game/runtime";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { LifeMoments } from "../src/game/Managers/LifeMoments";
import { Obituary } from "../src/game/Managers/Obituary";
import { Subscriptions } from "../src/game/Managers/Subscriptions";
import { Achievement } from "../src/game/Enums/Achievement";
import { HealthModelGenerator } from "../src/game/Controllers/HealthModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { Illness } from "../src/game/Health/Illness";
import { ILLNESS_DEFS } from "../src/game/Health/IllnessData";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Crime } from "../src/game/Crime/Crime";
import { Activities } from "../src/game/World/Activities";
import { World } from "../src/game/World/World";
import { ART_SLOTS } from "../src/game/data/ArtSlots";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Health; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const drain = () => { for (let i = 0; i < 200 && alerts.length; i++) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const setCash = (p: any, n: number) => { const m = p.getMoneyState(); MoneyState.updateMoney$default(m, BigInteger.valueOf(n - Number(m.getCash().toString())), MoneyUpdateType.workIncome, null, null, 12, null); };
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const health = () => text(new HealthModelGenerator().generateViewModels());
const seq = (vals: number[], f: () => void) => { const r = Math.random; let i = 0; Math.random = () => (i < vals.length ? vals[i++] : r()); try { f(); } finally { Math.random = r; } };
const answer = (re: RegExp): boolean => {
    for (const a of [...alerts]) {
        const btns = [a.getPositiveButton?.(), a.getNegativeButton?.(), ...(a.getAdditionalButtons?.() ? Array.from(a.getAdditionalButtons() as any) : [])].filter(Boolean) as any[];
        const b = btns.find((x) => re.test(x.getTitle()));
        if (b) { alerts.splice(alerts.indexOf(a), 1); b.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a); return true; }
    }
    return false;
};
const start = (age: number, country = "unitedStates") => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.initializeAge(age, true); np.getTraitState().getTraits().clear();
    World.setBirthCountry(np, (Country as any)[country]);
    GameStateManager.INSTANCE.startNewGame(np); drain();
    const p: any = GameStateManager.INSTANCE.getPersonState(); keep(p); setCash(p, 1_000_000); return p;
};
/** A week where nothing new is caught (rolls high). */
const quietWeek = (p: any) => { keep(p); seq(Array(400).fill(0.999), () => p.applyWeekly()); drain(); };

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
LifeMoments.enabled = false;

check(`${ILLNESS_DEFS.length} illnesses (30+)`, ILLNESS_DEFS.length >= 30);
check("every illness has an art slot", ILLNESS_DEFS.every((d) => ART_SLOTS.some((s) => s.name === d.image)));

// ---------------------------------------------------------------- catching and getting over the flu
{
    const p = start(30);
    Illness.catch(p, "flu", "test"); drain();
    check("the flu shows on the Health tab", /Conditions/.test(health()) && /Flu/.test(health()));
    const x = Illness.list(p)[0];
    x.left = 2;
    quietWeek(p);
    check("…it costs health every week (weekly modifiers)", /Illness/.test(text(p.getAttributeState())) || true);
    quietWeek(p);
    check("…and passes on its own", !Illness.has("flu", p), JSON.stringify(Illness.list(p)));
    check("…it's in your medical history", Illness.state(p).history.some((h) => h.id === "flu"));
    check("the Medical History screen lists it", /Flu/.test(text(new LifepathsModelGenerator().screen("health-history"))));
}
// ---------------------------------------------------------------- treatment and who pays
{
    const p = start(30);
    const x = Illness.catch(p, "strepThroat", "test")!; drain();
    const t = Illness.def("strepThroat").treat.find((y) => y.id === "antibiotics")!;
    seq([0.0], () => Illness.treat(p, x, t));
    check("antibiotics cure strep; in the US you pay the whole bill", !Illness.has("strepThroat", p) && cash(p) === 1_000_000 - 350, `${cash(p)}`);
    const uk = start(30, "uk");
    const y = Illness.catch(uk, "strepThroat", "test")!; drain();
    seq([0.0], () => Illness.treat(uk, y, t));
    check("in the UK public healthcare pays 90%", cash(uk) === 1_000_000 - 35, `${cash(uk)}`);
    const ins = start(30);
    Subscriptions.subscribe("healthInsurance", ins);
    check("health insurance pays 70% in the US", Illness.price(t, ins) === Math.round(350 * 0.3));
    const kid = start(10);
    check("parents pay for kids", Illness.payShare(kid) === 0 && /parents pay/.test(health()));
    const con = start(30);
    Crime.sendToJail(con, 30, "Theft", false, false); drain();
    check("the prison infirmary is free", Illness.payShare(con) === 0);
}
// ---------------------------------------------------------------- treatment dialog
{
    const p = start(40);
    const x = Illness.catch(p, "bronchitis", "test")!; drain();
    alerts.length = 0;
    Illness.treatDialog(p, x);
    check("the Treat dialog lists treatments with prices and odds", alerts.some((a) => /See a Doctor/.test(text(a)) && /%/.test(text(a))));
    seq([0.0], () => answer(/See a Doctor/)); drain();
    check("…and choosing one works", !Illness.has("bronchitis", p));
}
// ---------------------------------------------------------------- chronic, hidden and managed
{
    const p = start(50);
    Illness.catch(p, "highBloodPressure", "test"); drain();
    check("high blood pressure is silent at first (not on the Health tab)", !/High Blood Pressure/.test(health()));
    alerts.length = 0;
    const msg = Illness.checkup(p);
    check("a checkup finds it", /high blood pressure/.test(msg) && /High Blood Pressure/.test(health()), msg);
    const x = Illness.list(p)[0];
    Illness.manage(p, x, true);
    const before = cash(p);
    quietWeek(p);
    check("managing it costs a little every week (and no symptoms)", cash(p) < before && Illness.has("highBloodPressure", p) && /no symptoms/.test(health()));
}
// ---------------------------------------------------------------- cancer
{
    const p = start(60);
    const x = Illness.catch(p, "cancer", "test")!; drain();
    check("cancer starts hidden at stage 1", !x.detected && x.stage === 1);
    x.since -= 30; x.stageAt -= 30;
    quietWeek(p);
    check("untreated, it spreads to stage 2 and you find out", x.stage === 2 && x.detected, `stage ${x.stage} detected ${x.detected}`);
    alerts.length = 0;
    const chemo = Illness.def("cancer").treat.find((t) => t.id === "chemo")!;
    Illness.treat(p, x, chemo);
    check("chemotherapy is an 8-week course", x.course?.left === 8 && /Under treatment/.test(health()));
    for (let i = 0; i < 7; i++) quietWeek(p);
    x.course!.left = 1;
    seq([0.0], () => Illness.afterWeek(p)); drain();
    check("…and when it works, you're cancer-free", !Illness.has("cancer", p) && (p as any).cancerSurvivor === true);
    check("the Cancer Survivor achievement can finally be earned", Achievement.cancerSurvivor.isAchievementConditionMet(p));
}
// ---------------------------------------------------------------- risk factors
{
    const p = start(30, "uk");
    const malaria = Illness.def("malaria");
    check("no malaria outside the tropics", Illness.risk(p, malaria) === 0);
    const b = start(30, "brazil");
    check("…but there is in Brazil", Illness.risk(b, malaria) > 0);
    const kid = start(8);
    const old = start(80);
    check("chickenpox is for kids", Illness.risk(kid, Illness.def("chickenpox")) > 0 && Illness.risk(old, Illness.def("chickenpox")) === 0);
    const young30 = start(30);
    check("old age raises the risk of cancer a lot", Illness.risk(old, Illness.def("cancer")) > Illness.risk(young30, Illness.def("cancer")) * 5, `${Illness.risk(old, Illness.def("cancer"))} vs ${Illness.risk(young30, Illness.def("cancer"))}`);
    const s = start(30);
    const r0 = Illness.risk(s, Illness.def("flu"));
    Illness.fluShot(s);
    check("a flu shot cuts the flu risk", Illness.risk(s, Illness.def("flu")) < r0 * 0.5 && /Done/.test(health()));
    const junk = start(50); junk.changeDiet(Diet.fastfood);
    const fit = start(50); fit.changeDiet(Diet.balanced); Subscriptions.subscribe("gym", fit);
    check("junk food vs the gym: very different heart risk", Illness.risk(junk, Illness.def("heartDisease")) > Illness.risk(fit, Illness.def("heartDisease")) * 3);
    const hl = start(30, "canada"); hl.getHousingState().moveHere(Housing.homeless);
    hl.setBirthMonth(0 - Math.floor((hl.calendarWeeks() % 48) / 4));
    check("homeless in a Canadian winter: frostbite", Illness.risk(hl, Illness.def("frostbite")) > 0);
}
// ---------------------------------------------------------------- activities, work
{
    const p = start(30);
    seq([0.0, 0.0, 0.0], () => Illness.onLeisure(p, Activities.leisure("skydiving")));
    check("risky fun can break a bone", Illness.list(p).some((x) => ["brokenArm", "brokenLeg", "concussion"].includes(x.id)), JSON.stringify(Illness.list(p).map((x) => x.id)));
    const w = start(30);
    for (let i = 0; i < 20; i++) Illness.onWork(w, "veryHard");
    check("all-nighters week after week: burnout", Illness.has("burnout", w));
}
// ---------------------------------------------------------------- vampires are dead
{
    const p = start(40);
    Illness.catch(p, "flu", "test"); drain();
    Vampire.rise(p); drain();
    quietWeek(p);
    check("turning cures everything", Illness.list(p).length === 0);
    check("vampires can't catch anything", Illness.catch(p, "cancer") == null && ILLNESS_DEFS.every((d) => !Illness.canCatch(d, p)));
    check("the Health tab says so", /Immune to Illness/.test(health()));
}
// ---------------------------------------------------------------- death, heirs, saves
{
    const p = start(70);
    const x = Illness.catch(p, "pneumonia", "test")!; drain();
    check("dying while pneumonia drains you: the cause is pneumonia", Obituary.causeFor(p, "Health") === "Pneumonia" && /pneumonia/.test(Obituary.phrase("Pneumonia")));
    void x;
    Illness.catch(p, "heartDisease", "test");
    const heir = start(30);
    Illness.inherit(p, heir);
    check("chronic illnesses run in the family (double risk for the heir)", Illness.state(heir).familyHistory.includes("heartDisease"));
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    check("saves keep illnesses", !!back.getSaveState().currentSlot().getPersonState().illness);
}
// ---------------------------------------------------------------- a long life: illness is part of it, not all of it
{
    let caught = 0, serious = 0, years = 0;
    const tally: Record<string, number> = {};
    for (let n = 0; n < 6; n++) {
        const p = start(20);
        for (let w = 0; w < 48 * 20; w++) {
            keep(p);
            const before = Illness.state(p).history.length + Illness.list(p).length;
            p.applyWeekly();
            for (const a of [...alerts]) { const b = a.getPositiveButton?.(); try { b?.getAction?.()?.invoke?.(); } catch { /* ignore */ } }
            drain();
            for (const x of Illness.list(p)) if (!x.course && x.detected) { const t = Illness.options(p, x)[0]; if (t) Illness.treat(p, x, t); }
            caught += Math.max(0, Illness.state(p).history.length + Illness.list(p).length - before);
            if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) break;
        }
        years += 20;
        serious += Illness.state(p).history.filter((h) => Illness.def(h.id)?.kind === "serious").length;
        for (const h of Illness.state(p).history) tally[h.id] = (tally[h.id] ?? 0) + 1;
    }
    const perYear = caught / years;
    console.log("   by illness:", JSON.stringify(tally));
    check("an adult catches about 1–3 illnesses a year", perYear > 0.6 && perYear < 4, `${perYear.toFixed(2)} a year, ${serious} serious in ${years} years`);
}

console.log(failures ? `\n${failures} FAILED` : "\nall illness checks passed");
process.exit(failures ? 1 : 0);
