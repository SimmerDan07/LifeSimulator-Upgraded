// Headless "monkey" test: plays the ported game by clicking random enabled buttons.
// Usage: node dist-test/monkey.js [seedSteps] [lives]
import { UIBridge } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { EducationModelGenerator } from "../src/game/Controllers/EducationModelGenerator";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { HealthModelGenerator } from "../src/game/Controllers/HealthModelGenerator";
import { BankModelGenerator } from "../src/game/Controllers/BankModelGenerator";
import { ButtonViewModel } from "../src/game/Models/ButtonViewModel";
import { MainGameFragment } from "../src/game/ui/bridge";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { SpannableStringBuilder } from "../src/game/runtime";

const STEPS = parseInt(process.argv[2] ?? "3000", 10);
const files = new Map<string, string>();
const alertQueue: any[] = [];
let navs: { type: GenericListType; key: string }[] = [];
const stats: Record<string, number> = {};
const bump = (k: string) => (stats[k] = (stats[k] ?? 0) + 1);

UIBridge.install({
    broadcast(a) { bump("broadcast:" + a); },
    reloadGenericList() {},
    navigateTo(type, key) { navs.push({ type, key }); bump("nav:" + type.name()); },
    backToMainGame() { navs = []; },
    showAlert(vm) { alertQueue.push(vm); bump("alert:" + vm.getTitle()); if (/Died|Bankrupt|died/i.test(vm.getTitle() + (vm.getMessage() ?? ""))) { const p = GameStateManager.INSTANCE.getPersonState(); bump("end@age" + p.getAgeInYears() + ":" + (vm.getMessage() ?? "").slice(0, 50)); } },
    readFile: (n) => files.get(n) ?? null,
    writeFile: (n, t) => { files.set(n, t); },
});

const gens: Record<string, any> = {
    Profile: new ProfileModelGenerator(), Leisure: new VacationModelGenerator(), Love: new LoveModelGenerator(),
    Education: new EducationModelGenerator(), Work: new WorkModelGenerator(), Health: new HealthModelGenerator(), Bank: new BankModelGenerator(),
};
class FakeMain extends MainGameFragment {
    tab = MainGameTab.Profile;
    updateUI(_t: any) {}
    updateHUD() {}
    reloadTab(_t: any) {}
    getSelectedTab() { return this.tab; }
}
const main = new FakeMain();

/** Recursively collect clickable actions from a view-model tree. */
function actions(vm: any, out: { label: string; fn: () => void }[], seen = new Set<any>(), depth = 0) {
    if (!vm || typeof vm !== "object" || seen.has(vm) || depth > 6) return;
    seen.add(vm);
    if (vm instanceof ButtonViewModel) {
        if (vm.getEnabled() && !vm.getHidden() && !vm.getShowLock()) out.push({ label: vm.getTitle(), fn: () => vm.component8().invoke() });
        return;
    }
    if (vm instanceof SpannableStringBuilder) return;
    for (const k of Object.keys(vm)) {
        const v = vm[k];
        if (v && typeof v === "object" && typeof v.invoke === "function" && /click|tap|action|select/i.test(k) && !(vm instanceof ButtonViewModel)) {
            out.push({ label: vm.constructor?.name + "." + k, fn: () => v.invoke() });
        } else if (Array.isArray(v)) for (const x of v) actions(x, out, seen, depth + 1);
        else if (v && typeof v === "object") actions(v, out, seen, depth + 1);
    }
}

function handleAlerts(rng: () => number) {
    let guard = 0;
    while (alertQueue.length && guard++ < 50) {
        const vm = alertQueue.shift();
        const btns = [vm.getPositiveButton(), vm.getNegativeButton(), ...(vm.getAdditionalButtons() ?? [])].filter(Boolean);
        const tf = vm.getEditableTextFieldViewModel?.();
        if (tf) try { tf.getOnTextChanged?.()?.invoke?.("Testname"); } catch {}
        if (btns.length) btns[Math.floor(rng() * btns.length)].getAction().invoke();
        AlertManager.INSTANCE.alertDismissed(vm);
    }
}

function screens(): { name: string; models: any }[] {
    const out: { name: string; models: any }[] = [];
    for (const [name, g] of Object.entries(gens)) out.push({ name, models: g.generateViewModels() });
    for (const n of navs.slice(-1)) out.push({ name: "list:" + n.type.name(), models: GenericListModelGenerator.INSTANCE.genericListViewModels(n.type, n.key, true) });
    return out;
}

function startLife() {
    const scenarios = LifeScenario.values();
    const sc = scenarios[0];
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const p = GameStateManager.INSTANCE.getNewGamePlayerState()!;
    // exercise the customize screen too
    GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.customizeGame, "", true);
    GameStateManager.INSTANCE.startNewGame(p);
    navs = [];
}

// ---- run
GameStateManager.INSTANCE.init();
GameStateManager.INSTANCE.setMainGameFragment(main);
for (const t of GenericListType.values()) {
    try { GenericListModelGenerator.INSTANCE.genericListViewModels(t, "", true); bump("listOK"); }
    catch (e: any) { console.log("LIST FAIL", t.name(), e?.stack?.split("\n").slice(0, 4).join(" | ")); bump("listFail"); }
}
startLife();
let rnd = 12345;
const rng = () => ((rnd = (rnd * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const errors = new Map<string, number>();
let lives = 1;
for (let step = 0; step < STEPS; step++) {
    try {
        handleAlerts(rng);
        const gsm = GameStateManager.INSTANCE.getGlobalStateManager();
        if (!gsm.getSaveState().getHasGameStarted()) { startLife(); lives++; continue; }
        const all: { label: string; fn: () => void; screen: string }[] = [];
        for (const s of screens()) {
            const acts: any[] = [];
            actions(s.models, acts);
            for (const a of acts) all.push({ ...a, screen: s.name });
        }
        if (!all.length) { bump("noActions"); GameStateManager.INSTANCE.getPersonState().applyWeekly(); continue; }
        let pool = all;
        if (process.env.MODE === "sensible") {
            const safe = all.filter((a) => !/lottery|ticket|buy|purchase|loan|casino|gamble|bet|crime|steal|rob|drug|quit/i.test(a.label));
            const r = rng();
            const want = r < 0.55 ? "Work" : r < 0.7 ? "Health" : r < 0.82 ? "Education" : r < 0.92 ? "Leisure" : r < 0.96 ? "Love" : "";
            const sub = safe.filter((a) => a.screen === want);
            pool = sub.length ? sub : safe.length ? safe : all;
        }
        const pick = pool[Math.floor(rng() * pool.length)];
        bump("click:" + pick.screen);
        pick.fn();
        if (rng() < 0.3) navs = [];
        if (step % 250 === 0) {
            // round-trip the save file
            const txt = SaveCodec.encode(gsm);
            const back = SaveCodec.decode(txt);
            GameStateManager.INSTANCE.setGlobalStateManager(back);
            bump("saveRoundTrip");
        }
    } catch (e: any) {
        const key = (e?.message ?? String(e)) + " @ " + (e?.stack?.split("\n").slice(1, 3).join(" <- ") ?? "");
        errors.set(key, (errors.get(key) ?? 0) + 1);
        alertQueue.length = 0;
        try { AlertManager.INSTANCE.setCurrentlyShowing(false); } catch {}
    }
}
const p = GameStateManager.INSTANCE.getPersonState();
const past = GameStateManager.INSTANCE.getGlobalStateManager().getCemetaryState().getPastLives();
console.log("past lives (age at end):", past.map((x: any) => x.getAgeInYears()).join(", "));
console.log("lives played:", lives, " current:", p.getFullName(), "age", p.getAgeInYears(), "cash", p.getMoneyState().getCash().toString());
console.log("stats:", JSON.stringify(Object.fromEntries(Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 40))));
console.log("distinct errors:", errors.size);
for (const [k, n] of [...errors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  x${n}  ${k}`);
