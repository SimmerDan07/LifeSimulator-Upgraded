// Desktop shell for the ported Life Simulator: HUD, tabs, list screens, dialogs, saving.
import "./style.css";
import { News } from "../game/Managers/News";
import { UIBridge, MainGameFragment, GenericListFragment } from "../game/ui/bridge";
import { GameStateManager } from "../game/Managers/GameStateManager";
import { AlertManager } from "../game/Managers/AlertManager";
import { AlertType } from "../game/Managers/AlertType";
import type { AlertViewModel } from "../game/Managers/AlertViewModel";
import { SoundManager } from "../game/Managers/SoundManager";
import { SoundEffect } from "../game/Managers/SoundEffect";
import { MainGameTab } from "../game/Enums/MainGameTab";
import { LifepathsModelGenerator } from "../game/Controllers/LifepathsModelGenerator";
import { SocialModelGenerator } from "../game/Controllers/SocialModelGenerator";
import { Vampire } from "../game/Lifepaths/Vampire";
import { Celebrity } from "../game/Lifepaths/Celebrity";
import { Seasons } from "../game/Managers/Seasons";
import { GenericListType } from "../game/Fragments/GenericListType";
import { GenericListModelGenerator } from "../game/Controllers/GenericListModelGenerator";
import { ProfileModelGenerator } from "../game/Controllers/ProfileModelGenerator";
import { VacationModelGenerator } from "../game/Controllers/VacationModelGenerator";
import { LoveModelGenerator } from "../game/Controllers/LoveModelGenerator";
import { EducationModelGenerator } from "../game/Controllers/EducationModelGenerator";
import { WorkModelGenerator } from "../game/Controllers/WorkModelGenerator";
import { HealthModelGenerator } from "../game/Controllers/HealthModelGenerator";
import { BankModelGenerator } from "../game/Controllers/BankModelGenerator";
import { NavigationBarViewModel } from "../game/Models/NavigationBarViewModel";
import { ExtensionsKt } from "../game/Utils/ExtensionsKt";
import { Utils } from "../game/Utils/Utils";
import { renderCell, setAfterAction, imageUrl, toastError, button } from "./cells";
import { richToHtml, textToHtml } from "./rich";
import { ButtonViewModel } from "../game/Models/ButtonViewModel";

declare global {
    interface Window { lifesimFS?: { read(name: string): string | null; write(name: string, text: string): void; dir(): string; openDir?(): boolean }; }
}

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const S = (k: string) => Utils.INSTANCE.getString(k);

// ------------------------------------------------------------------ storage
const storage = {
    read(name: string): string | null {
        if (window.lifesimFS) return window.lifesimFS.read(name);
        try { return localStorage.getItem("lifesim:" + name); } catch { return null; }
    },
    write(name: string, text: string) {
        if (window.lifesimFS) return window.lifesimFS.write(name, text);
        try { localStorage.setItem("lifesim:" + name, text); } catch (e) { console.error("save failed", e); }
    },
};

// ------------------------------------------------------------------ tabs
const TABS: { tab: MainGameTab; icon: string; label: string; gen: any }[] = [
    { tab: MainGameTab.Profile, icon: "tab_profile", label: "Profile", gen: new ProfileModelGenerator() },
    { tab: MainGameTab.Leisure, icon: "tab_leisure", label: "Leisure", gen: new VacationModelGenerator() },
    { tab: MainGameTab.Love, icon: "tab_love", label: "Love", gen: new LoveModelGenerator() },
    { tab: MainGameTab.Education, icon: "tab_education", label: "Education", gen: new EducationModelGenerator() },
    { tab: MainGameTab.Work, icon: "tab_briefcase", label: "Work", gen: new WorkModelGenerator() },
    { tab: MainGameTab.Health, icon: "tab_health", label: "Health", gen: new HealthModelGenerator() },
    { tab: MainGameTab.Bank, icon: "tab_bank", label: "Bank", gen: new BankModelGenerator() },
    { tab: MainGameTab.Social, icon: "tab_social", label: "Social", gen: new SocialModelGenerator() },
    { tab: MainGameTab.Lifepaths, icon: "tab_lifepaths", label: "Lifepaths", gen: new LifepathsModelGenerator() },
];

class MainScreen extends MainGameFragment {
    selectedTab: MainGameTab = MainGameTab.Profile;
    private scrollPos = new Map<MainGameTab, number>();

    getSelectedTab() { return this.selectedTab; }
    isVisible() { return true; }

    updateUI(tab: MainGameTab | null) {
        this.updateHUD();
        this.reloadTab(tab ?? this.selectedTab);
    }

    updateHUD() {
        if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted() && !hasPlayer()) return;
        let m;
        try { m = GameStateManager.INSTANCE.getPersonState().getGetHUDViewModel(); } catch { return; }
        const p = GameStateManager.INSTANCE.getPersonState();
        setBar("#hud-health", m.getAttr_health_progress());
        setBar("#hud-happiness", m.getAttr_happiness_progress());
        setBar("#hud-sanity", m.getAttr_sanity_progress());
        // v0.15.0: vampires get a red Thirst bar
        const vamp = Vampire.isVampire(p) && (p as any).vampire?.cureWeeks === 0;
        document.body.classList.toggle("vampire", vamp);
        if (vamp) { const t = $("#hud-thirst") as HTMLElement; t.style.width = `${(p as any).vampire.thirst}%`; t.style.background = "#b3262e"; }
        // v0.20.0: fame chip (Celebrity Life)
        const fame = $("#hud-fame") as HTMLButtonElement;
        if (fame) {
            const show = Celebrity.fans(p) >= 1000 || Celebrity.career(p) != null;
            fame.hidden = !show;
            if (show) fame.innerHTML = `<img src="${imageUrl(Celebrity.image) ?? ""}" alt=""><span>${Celebrity.fansText(Celebrity.fans(p))}</span><span class="tier">${Celebrity.tierName(p)}</span>`;
        }
        const nc = $("#hud-news-count") as HTMLElement | null;
        if (nc) { const n = News.unread(p); nc.hidden = n === 0; nc.textContent = n > 99 ? "99+" : String(n); }
        $("#hud-cash").textContent = ExtensionsKt.numberDisplayString(m.getCashAmount(), true);
        $("#hud-bank").textContent = ExtensionsKt.numberDisplayString(m.getBankAmount(), true);
        $("#hud-name").textContent = p.getFullName();
        $("#hud-age").textContent = `${m.getAgeInYears()} ${S("common_years")}`;
        $("#hud-month").textContent = `${m.getMonthString()} · ${Seasons.label(p)}`;   // v0.26.0 seasons
        const w = m.getWeekProgress();
        $("#hud-week").innerHTML = [0, 1, 2, 3].map((i) => `<span class="dot${i <= w ? " on" : ""}"></span>`).join("");
    }

    reloadTab(tab: MainGameTab) {
        if (tab !== this.selectedTab) return;
        const content = $("#content");
        const footer = $("#footer");
        const t = TABS.find((x) => x.tab === tab)!;
        let vm;
        try { vm = t.gen.generateViewModels(); } catch (e) { console.error(e); toastError(e); return; }
        const top = content.scrollTop;
        content.replaceChildren();
        for (const c of vm.getContentViewModels()) { const e = renderCell(c); if (e) content.appendChild(e); }
        footer.replaceChildren();
        const f = vm.getFooterViewModels();
        if (f) for (const c of f) { const e = renderCell(c); if (e) footer.appendChild(e); }
        footer.classList.toggle("empty", footer.childElementCount === 0);
        content.scrollTop = top;
        for (const b of document.querySelectorAll(".tab")) b.classList.toggle("active", (b as HTMLElement).dataset.tab === tab.name());
    }

    selectTab(tab: MainGameTab) {
        if (this.selectedTab === tab) return;
        this.scrollPos.set(this.selectedTab, $("#content").scrollTop);
        this.selectedTab = tab;
        SoundManager.INSTANCE.playSound(SoundEffect.Pop);
        this.reloadTab(tab);
        $("#content").scrollTop = this.scrollPos.get(tab) ?? 0;
    }
}

function hasPlayer() {
    try { GameStateManager.INSTANCE.getPersonState(); return true; } catch { return false; }
}

function setBar(sel: string, v: number) {
    const fill = $(sel);
    const pct = Math.max(0, Math.min(100, v));
    fill.style.width = pct + "%";
    fill.style.background = Utils.INSTANCE.getColor(ExtensionsKt.progressColorScheme(pct));
    fill.parentElement!.title = `${Math.round(pct)} / 100`;
}

// ------------------------------------------------------------------ list screens (Android "GenericListFragment")
class ListScreen extends GenericListFragment {
    el: HTMLElement;
    constructor(public type: GenericListType, public key: string, public canGoBack: boolean) {
        super();
        this.el = document.createElement("section");
        this.el.className = "list-screen";
    }
    getListType() { return this.type; }
    getActivityKey() { return this.key; }
    getSupportBackNavigation() { return this.canGoBack; }

    render() {
        let vm;
        try { vm = GenericListModelGenerator.INSTANCE.genericListViewModels(this.type, this.key, this.canGoBack); }
        catch (e) { console.error(e); toastError(e); return; }
        const body = document.createElement("div");
        body.className = "list-body";
        let title = "";
        try { title = this.type.getNavBarTitle() ?? ""; } catch { /* untitled list */ }
        const header = vm.getHeaderViewModels() ?? [];
        for (const h of header) if (h instanceof NavigationBarViewModel) title = h.title ?? title;
        const head = document.createElement("header");
        head.className = "list-head";
        if (this.canGoBack) {
            const back = document.createElement("button");
            back.className = "back fa";
            back.innerHTML = "";
            back.title = "Back (Esc)";
            back.addEventListener("click", () => nav.pop());
            head.appendChild(back);
        }
        const h = document.createElement("h1");
        h.innerHTML = textToHtml(title);
        head.appendChild(h);
        for (const x of header) if (!(x instanceof NavigationBarViewModel)) { const e = renderCell(x); if (e) body.appendChild(e); }
        for (const c of vm.getContentViewModels()) { const e = renderCell(c); if (e) body.appendChild(e); }
        const foot = document.createElement("div");
        foot.className = "list-foot";
        for (const c of vm.getFooterViewModels() ?? []) { const e = renderCell(c); if (e) foot.appendChild(e); }
        const top = this.el.querySelector(".list-body")?.scrollTop ?? 0;
        this.el.replaceChildren(head, body, foot);
        body.scrollTop = top;
    }
}

const nav = {
    stack: [] as ListScreen[],
    top(): ListScreen | null { return this.stack[this.stack.length - 1] ?? null; },
    push(type: GenericListType, key: string, canGoBack: boolean) {
        const s = new ListScreen(type, key, canGoBack || this.stack.length > 0 && canGoBack);
        this.stack.push(s);
        $("#overlay").appendChild(s.el);
        $("#overlay").classList.add("open");
        GameStateManager.INSTANCE.setCurrentlyShowingGenericList(s);
        s.render();
        requestAnimationFrame(() => s.el.classList.add("shown"));
    },
    pop() {
        const s = this.stack.pop();
        if (s) s.el.remove();
        GameStateManager.INSTANCE.setCurrentlyShowingGenericList(this.top());
        if (!this.stack.length) $("#overlay").classList.remove("open");
        this.top()?.render();
        render();
    },
    clear() {
        for (const s of this.stack) s.el.remove();
        this.stack = [];
        GameStateManager.INSTANCE.setCurrentlyShowingGenericList(null);
        $("#overlay").classList.remove("open");
    },
};

/** Sidebar tabs (and keys 1-8): close any open menus (Settings, Real Estate, lists...) and show the tab.
 *  Screens you can't back out of (new-life setup, choosing an heir) stay open. */
function goToTab(tab: MainGameTab) {
    if (nav.stack.length) {
        if (!nav.stack.every((s) => s.canGoBack)) return;
        nav.clear();
        render();
    }
    main.selectTab(tab);
}

// ------------------------------------------------------------------ dialogs
function showAlert(vm: AlertViewModel) {
    if (vm.getType() === AlertType.Banner) return showBanner(vm);
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    const box = document.createElement("div");
    box.className = "modal";
    const url = imageUrl(vm.getImageId());
    if (url) box.insertAdjacentHTML("beforeend", `<img class="modal-img" src="${url}" alt="">`);
    if (vm.getTitle()) box.insertAdjacentHTML("beforeend", `<h2>${textToHtml(vm.getTitle())}</h2>`);
    const msg = document.createElement("div");
    msg.className = "modal-msg";
    const am = vm.getAttributedMessage();
    msg.innerHTML = am != null ? richToHtml(am) : textToHtml(vm.getMessage());
    box.appendChild(msg);
    const tf = vm.getEditableTextFieldViewModel();
    let input: HTMLInputElement | null = null;
    if (tf != null && !tf.getHidden()) {
        input = document.createElement("input");
        input.className = "text-input";
        input.placeholder = tf.getPlaceholderText() ?? "";
        input.addEventListener("input", () => tf.getTextChangedHandler().invoke(input!.value));
        box.appendChild(input);
    }
    const buttons = document.createElement("div");
    buttons.className = "modal-buttons";
    const close = (action?: () => void) => {
        backdrop.remove();
        try { action?.(); } catch (e) { console.error(e); toastError(e); }
        AlertManager.INSTANCE.alertDismissed(vm);
        refresh();
    };
    const add = (b: any, cls: string) => {
        if (!b) return;
        const e = document.createElement("button");
        e.className = "btn " + cls;
        e.textContent = ExtensionsKt.localizeDollars(b.getTitle());
        e.addEventListener("click", () => close(() => b.getAction().invoke()));
        buttons.appendChild(e);
    };
    add(vm.getPositiveButton(), "positive");
    for (const b of vm.getAdditionalButtons() ?? []) add(b, "neutral");
    add(vm.getNegativeButton(), "negative");
    if (!buttons.childElementCount) {
        const ok = document.createElement("button");
        ok.className = "btn positive";
        ok.textContent = S("Alert_Buttons_Okay");
        ok.addEventListener("click", () => close());
        buttons.appendChild(ok);
    }
    box.appendChild(buttons);
    backdrop.appendChild(box);
    $("#modals").appendChild(backdrop);
    (input ?? (buttons.firstElementChild as HTMLElement))?.focus();
}

function showBanner(vm: AlertViewModel) {
    const t = document.createElement("div");
    t.className = "toast";
    const url = imageUrl(vm.getImageId());
    const am = vm.getAttributedMessage();
    const body = am != null ? richToHtml(am) : textToHtml(vm.getMessage() ?? "");
    t.innerHTML = `${url ? `<img src="${url}" alt="">` : ""}<div><b>${textToHtml(vm.getTitle() ?? "")}</b><div>${body}</div></div>`;
    t.addEventListener("click", () => t.remove());   // tap to dismiss early
    const box = $("#toasts");
    box.appendChild(t);
    while (box.childElementCount > 4) box.firstElementChild?.remove();   // a burst of notices: keep the newest few
    const ms = Math.min(7000, 3500 + (t.textContent?.length ?? 0) * 18);   // longer text stays a little longer
    setTimeout(() => t.classList.add("hide"), ms);
    setTimeout(() => t.remove(), ms + 500);
}

// ------------------------------------------------------------------ wiring
const main = new MainScreen();

/** Re-render everything from current game state. */
function render() {
    document.body.classList.toggle("no-life", !GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted());
    main.updateHUD();
    main.reloadTab(main.selectedTab);
    nav.top()?.render();
}

let startingNewLife = false;
/** Re-render after a player action; if the life ended and nothing is pending, start the new-life flow. */
function refresh() {
    render();
    if (startingNewLife) return;
    if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted() && nav.stack.length === 0 && !document.querySelector(".modal-backdrop")) {
        startingNewLife = true;
        try { Utils.INSTANCE.triggerNewGameStart(); } finally { startingNewLife = false; }
    }
}

function boot() {
    UIBridge.install({
        broadcast(action) {
            if (action === "popModal") nav.pop();
            else if (action === "reloadGenericList") nav.top()?.render();
        },
        reloadGenericList(type) { if (nav.top()?.type === type) nav.top()!.render(); },
        navigateTo(type, key, animated) { nav.push(type, key, animated); },
        backToMainGame() { nav.clear(); render(); },
        showAlert,
        readFile: (n) => storage.read(n),
        writeFile: (n, t) => storage.write(n, t),
        saveFolder: () => (window.lifesimFS ? window.lifesimFS.dir() : null),
        openSaveFolder: () => (window.lifesimFS?.openDir ? window.lifesimFS.openDir() : false),
    });
    setAfterAction(refresh);

    const tabs = $("#tabs");
    for (const t of TABS) {
        const b = document.createElement("button");
        b.className = "tab";
        b.dataset.tab = t.tab.name();
        b.title = t.label;
        b.innerHTML = `<img src="${imageUrl(t.icon)}" alt=""><span>${t.label}</span>`;
        b.addEventListener("click", () => goToTab(t.tab));
        tabs.appendChild(b);
    }
    $("#hud-settings").addEventListener("click", () => Utils.INSTANCE.navigateTo(GenericListType.settingsMenu, "", true));
    // v0.28.1: News (what happened during the weeks, instead of pop-ups)
    $("#hud-news")?.addEventListener("click", () => { if (nav.stack.length && !nav.stack.every((x) => x.canGoBack)) return; Utils.INSTANCE.navigateTo(GenericListType.lifepath, "news", true); });
    $("#hud-fame")?.addEventListener("click", () => { if (nav.stack.length && !nav.stack.every((x) => x.canGoBack)) return; Utils.INSTANCE.navigateTo(GenericListType.lifepath, "celebrity", true); });
    $("#hud-settings").querySelector("img")!.setAttribute("src", imageUrl("hud_settings")!);
    $("#hud-cash-icon").setAttribute("src", imageUrl("hud_cash")!);
    $("#hud-bank-icon").setAttribute("src", imageUrl("hud_bank")!);

    document.addEventListener("keydown", (e) => {
        if (document.querySelector(".modal-backdrop")) {
            if (e.key === "Enter") (document.querySelector(".modal-buttons .btn") as HTMLElement)?.click();
            return;
        }
        if (e.key === "Escape" && nav.top()?.canGoBack) nav.pop();
        if (/^[1-9]$/.test(e.key) && !(e.target instanceof HTMLInputElement)) goToTab(TABS[+e.key - 1].tab);
    });
    window.addEventListener("beforeunload", () => { try { GameStateManager.INSTANCE.saveData(); } catch {} });
    const saveNow = () => { try { if (GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) GameStateManager.INSTANCE.saveData(); } catch {} };
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveNow(); });
    // Android app (android/): the system back button calls __lifesimBack (true = handled here, false = leave the
    // app), and the app calls __lifesimSave when it goes to the background.
    (window as any).__lifesimSave = saveNow;
    (window as any).__lifesimBack = (): boolean => {
        const modal = document.querySelector(".modal-backdrop");
        if (modal) {   // a pop-up: OK closes a message, "no" closes a yes/no question; a real choice waits for a tap
            const btns = modal.querySelectorAll<HTMLButtonElement>(".modal-buttons .btn");
            if (btns.length === 1 || btns.length === 2) btns[btns.length - 1].click();
            return true;
        }
        if (nav.top()?.canGoBack) { nav.pop(); return true; }
        return false;
    };
    setInterval(() => { try { if (GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) GameStateManager.INSTANCE.saveData(); } catch {} }, 30000);

    GameStateManager.INSTANCE.init();
    GameStateManager.INSTANCE.setMainGameFragment(main);
    try {
        const music = GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings().getMusicEnabled();
        document.addEventListener("pointerdown", () => SoundManager.INSTANCE.toggleMusic(music), { once: true });
    } catch {}

    if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) {
        Utils.INSTANCE.triggerNewGameStart();
    } else {
        // "You made money while away" (free real-time income, originally paired with an ad) is removed.
    }
    render();
    document.body.classList.add("ready");
}

void button; void ButtonViewModel;
boot();
