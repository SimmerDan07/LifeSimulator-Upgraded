// Desktop shell for the ported Life Simulator: HUD, tabs, list screens, dialogs, saving.
import "./style.css";
import "./nl.css";
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
import { HeaderTitleViewModel } from "../game/Models/HeaderTitleViewModel";
import { CustomizeTextFieldViewModel } from "../game/Models/CustomizeTextFieldViewModel";
import { CustomizeOptionsViewModel } from "../game/Models/CustomizeOptionsViewModel";
import { CustomizeSliderViewModel } from "../game/Models/CustomizeSliderViewModel";
import { WEATHER } from "../game/Vampires/VData";
import { drawCell, markCutRows, setSheetHost, NL_ICONS, type Drawn, type SheetOpts } from "./rows";

declare global {
    interface Window { lifesimFS?: { read(name: string): string | null; write(name: string, text: string): void; dir(): string; openDir?(): boolean }; }
}

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const S = (k: string) => Utils.INSTANCE.getString(k);

// ------------------------------------------------------------------ storage
// Windows and Android: real files (window.lifesimFS). A browser / iPhone home-screen app (v0.31.0): IndexedDB,
// which has room for very long saves (localStorage stops at about 5 MB). Everything is read into memory before
// the game starts, so the game's reads stay instant; every write goes to IndexedDB in the background.
const webFiles = new Map<string, string>();
let idb: IDBDatabase | null = null;
let idbWrites: Promise<void> = Promise.resolve();
let frozen = false;   // a backup was just loaded: nothing may overwrite it while the page reloads
const idbReq = <T>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function openWebStorage(): Promise<void> {
    if (window.lifesimFS || typeof indexedDB === "undefined") return;
    try {
        idb = await new Promise<IDBDatabase>((res, rej) => {
            const r = indexedDB.open("lifesim", 1);
            r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("files")) r.result.createObjectStore("files"); };
            r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error("blocked"));
        });
        const st = idb.transaction("files", "readonly").objectStore("files");
        const [keys, vals] = await Promise.all([idbReq(st.getAllKeys()), idbReq(st.getAll())]);
        keys.forEach((k, i) => { if (typeof vals[i] === "string") webFiles.set(String(k), vals[i]); });
        // ask the browser to never clear it (home-screen apps on iPhone keep their data anyway)
        try { void navigator.storage?.persist?.(); } catch { /* not supported */ }
    } catch (e) { console.warn("IndexedDB unavailable; using localStorage", e); idb = null; }
}
const storage = {
    read(name: string): string | null {
        if (window.lifesimFS) return window.lifesimFS.read(name);
        if (idb && webFiles.has(name)) return webFiles.get(name)!;
        try { return localStorage.getItem("lifesim:" + name); } catch { return null; }   // older browser saves
    },
    write(name: string, text: string, force = false) {
        if (frozen && !force) return;
        if (window.lifesimFS) return window.lifesimFS.write(name, text);
        if (idb) {
            webFiles.set(name, text);
            const db = idb;
            idbWrites = idbWrites.then(() => new Promise<void>((res) => {
                const tx = db.transaction("files", "readwrite");
                tx.objectStore("files").put(text, name);
                tx.oncomplete = () => res();
                tx.onerror = tx.onabort = () => { try { localStorage.setItem("lifesim:" + name, text); } catch { /* full */ } res(); };
            }));
            return;
        }
        try { localStorage.setItem("lifesim:" + name, text); } catch (e) { console.error("save failed", e); }
    },
    /** Waits until every save has reached the disk. */
    flush(): Promise<void> { return idbWrites; },
};

// ------------------------------------------------------------------ backups (v0.31.0)
/** Hand a backup to the player: the share sheet where there is one (iPhone: Save to Files, AirDrop…), else a download. */
async function backUpFile(name: string, text: string): Promise<"shared" | "downloaded" | "cancelled" | "failed"> {
    try {
        const file = new File([text], name, { type: "text/plain" });
        const nav: any = navigator;
        if (nav.canShare?.({ files: [file] }) && nav.share) {
            try { await nav.share({ files: [file], title: name }); return "shared"; }
            catch (e: any) { if (e?.name === "AbortError") return "cancelled"; }
        }
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url; a.download = name; a.style.display = "none";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return "downloaded";
    } catch (e) { console.error(e); return "failed"; }
}
/** Let the player pick a backup file; resolves with its text (null if they didn't pick one). */
function pickBackupFile(): Promise<string | null> {
    return new Promise((res) => {
        const input = document.createElement("input");
        input.type = "file"; input.accept = ".txt,text/plain"; input.style.display = "none";
        let done = false;
        input.addEventListener("change", () => {
            done = true;
            const f = input.files?.[0]; input.remove();
            if (!f) { res(null); return; }
            f.text().then(res, () => res(null));
        });
        input.addEventListener("cancel", () => { if (!done) { input.remove(); res(null); } });
        document.body.appendChild(input); input.click();
    });
}

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

// ------------------------------------------------------------------ v0.34.0 the new look: five tabs at the bottom
type Sub = { tab: MainGameTab; label: string };
const GROUPS: { id: string; label: string; icon: string; subs: Sub[] }[] = [
    { id: "me", label: "Me", icon: "tab_profile", subs: [{ tab: MainGameTab.Profile, label: "Profile" }, { tab: MainGameTab.Health, label: "Health" }, { tab: MainGameTab.Lifepaths, label: "Paths" }] },
    { id: "work", label: "Work", icon: "tab_briefcase", subs: [{ tab: MainGameTab.Work, label: "Job" }, { tab: MainGameTab.Education, label: "School" }] },
    { id: "people", label: "People", icon: "tab_love", subs: [{ tab: MainGameTab.Love, label: "Love & Family" }, { tab: MainGameTab.Social, label: "Social" }] },
    { id: "money", label: "Money", icon: "tab_bank", subs: [{ tab: MainGameTab.Bank, label: "Money" }] },
    { id: "fun", label: "Fun", icon: "tab_leisure", subs: [{ tab: MainGameTab.Leisure, label: "Fun" }] },
];
/** Profile sections that live on the Money tab in the new look (shown once, never on both). */
const moneySections = () => [S("section_header_housing"), "Subscriptions", S("SectionHeader_Items")];

function gameSettings(): any { try { return GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings(); } catch { return null; } }
/** The new look, unless the player switched Classic look on in Settings. */
function isNL(): boolean { return !gameSettings()?.classicLook; }
const darkMQ = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
let lookNow = "";
function applyLook() {
    const gs = gameSettings();
    const nl = !gs?.classicLook;
    const theme = gs?.theme ?? "auto";
    const dark = nl && (theme === "dark" || (theme === "auto" && !!darkMQ?.matches));
    document.body.classList.toggle("nl", nl);
    document.body.classList.toggle("dark", dark);
    const sig = `${nl}|${dark}`;
    if (sig !== lookNow) {
        const switched = lookNow !== "" && lookNow.split("|")[0] !== String(nl);
        lookNow = sig;
        if (switched) { if (nl) main.syncGroup(); $("#content").scrollTop = 0; }
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#000000" : "#2c2c2e");
    }
}

/** Section open/closed choices, kept between sessions. */
const SEC_KEY = "lifesim:nl:sections";
let secState: Record<string, boolean> = {};
try { secState = JSON.parse(localStorage.getItem(SEC_KEY) || "{}"); } catch { secState = {}; }
const saveSecState = () => { try { localStorage.setItem(SEC_KEY, JSON.stringify(secState)); } catch { /* private mode */ } };
/** "Can do now": rows locked by a requirement are hidden (on unless the player turns it off). */
let canDoNow = (() => { try { return localStorage.getItem("lifesim:nl:cando") !== "0"; } catch { return true; } })();
const setCanDo = (v: boolean) => { canDoNow = v; try { localStorage.setItem("lifesim:nl:cando", v ? "1" : "0"); } catch { /* */ } };
const searchText = new Map<string, string>();

type Section = { title: string | null; cells: any[] };
function splitSections(cells: any[]): Section[] {
    const out: Section[] = [];
    let cur: Section = { title: null, cells: [] };
    for (const c of cells) {
        if (c instanceof NavigationBarViewModel) continue;
        if (c instanceof HeaderTitleViewModel) {
            if (cur.title !== null || cur.cells.length) out.push(cur);
            cur = { title: c.title, cells: [] };
        } else cur.cells.push(c);
    }
    if (cur.title !== null || cur.cells.length) out.push(cur);
    return out;
}
function sectionCells(cells: any[], titles: string[], keep: boolean): any[] {
    const out: any[] = [];
    let inside = false;
    for (const c of cells) {
        if (c instanceof HeaderTitleViewModel) inside = titles.includes(c.title);
        if (inside === keep) out.push(c);
    }
    return out;
}

/** Lays out a screen in the new look: optional summary (first row + Go to Work), then one grouped box per section;
 *  sections open and close with a tap on their title; long screens get Search and the "Can do now" filter. */
function layout(container: HTMLElement, cells: any[], opts: { key: string; footer?: any[] }) {
    container.replaceChildren();
    container.classList.add("nl-screen");
    const secs = splitSections(cells);
    if (opts.footer && opts.footer.length) {
        const box = document.createElement("div");
        box.className = "group summary";
        const first = secs.find((x) => x.cells.length);
        const fc = first ? first.cells.shift() : null;
        const d = fc ? drawCell(fc) : null;
        if (d) box.appendChild(d.el);
        for (const f of opts.footer) { const e = drawCell(f); if (e) box.appendChild(e.el); }
        if (box.childElementCount) container.appendChild(box);
    }
    const drawn = secs.map((sec) => ({ sec, items: sec.cells.map(drawCell).filter((x): x is Drawn => !!x && x.kind !== "header") }));
    const rowsTotal = drawn.reduce((n, d) => n + d.items.filter((i) => i.kind === "row").length, 0);
    const anyLocked = drawn.some((d) => d.items.some((i) => i.el.classList.contains("locked")));
    // forms (new-life setup, settings) never get Search or the filter
    const isForm = cells.some((c) => c instanceof CustomizeTextFieldViewModel || c instanceof CustomizeOptionsViewModel || c instanceof CustomizeSliderViewModel);
    if (!isForm && (rowsTotal >= 15 || anyLocked)) {
        const bar = document.createElement("div");
        bar.className = "toolbar";
        if (rowsTotal >= 15) {
            const lab = document.createElement("label");
            lab.className = "search";
            lab.innerHTML = `<span class="fa">${NL_ICONS.search}</span>`;
            const input = document.createElement("input");
            input.type = "search"; input.placeholder = "Search"; input.value = searchText.get(opts.key) ?? "";
            input.addEventListener("input", () => { searchText.set(opts.key, input.value); applyFilters(container); });
            input.addEventListener("keydown", (e) => e.stopPropagation());
            lab.appendChild(input);
            bar.appendChild(lab);
        }
        if (anyLocked) {
            const chip = document.createElement("button");
            chip.className = "filter-chip";
            chip.addEventListener("click", () => { setCanDo(!canDoNow); applyFilters(container); });
            bar.appendChild(chip);
        }
        container.appendChild(bar);
    }
    let titled = 0;
    // which sections start open: the first one, the biggest one (the heart of the screen) and short ones
    const sizes = drawn.map((d) => (d.sec.title != null ? d.items.filter((x) => x.kind === "row").length : -1));
    const biggest = sizes.indexOf(Math.max(...sizes));
    drawn.forEach(({ sec, items }, i) => {
        if (!items.length) return;
        const box = document.createElement("section");
        box.className = "sec";
        const rows = items.filter((x) => x.kind === "row").length;
        if (sec.title != null) {
            const k = opts.key + "|" + sec.title;
            const open = secState[k] ?? (titled === 0 || i === biggest || rows <= 5);
            titled++;
            box.classList.toggle("open", open);
            const h = document.createElement("button");
            h.className = "sec-head";
            h.innerHTML = `<span class="sec-name">${textToHtml(sec.title)}</span><span class="sec-count">${rows || ""}</span><span class="fa sec-chev">${NL_ICONS.down}</span>`;
            h.addEventListener("click", () => {
                const now = !box.classList.contains("open");
                box.classList.toggle("open", now);
                secState[k] = now; saveSecState();
                if (now) markCutRows(box);
            });
            box.appendChild(h);
        } else box.classList.add("open", "untitled");
        const g = document.createElement("div");
        g.className = "group";
        for (const it of items) {
            if (it.kind === "block") { const w = document.createElement("div"); w.className = "blk"; w.appendChild(it.el); g.appendChild(w); }
            else g.appendChild(it.el);
        }
        const note = document.createElement("button");
        note.className = "locked-note";
        note.addEventListener("click", () => { setCanDo(false); applyFilters(container); });
        g.appendChild(note);
        box.appendChild(g);
        container.appendChild(box);
    });
    applyFilters(container, opts.key);
    markCutRows(container);
}

function applyFilters(container: HTMLElement, key?: string) {
    const input = container.querySelector<HTMLInputElement>(".toolbar input");
    const q = (input?.value ?? (key ? searchText.get(key) : "") ?? "").trim().toLowerCase();
    container.classList.toggle("can-do", canDoNow);
    container.classList.toggle("searching", q.length > 0);
    const chip = container.querySelector<HTMLElement>(".filter-chip");
    if (chip) { chip.classList.toggle("on", canDoNow); chip.innerHTML = canDoNow ? `<span class="fa">\uf00c</span> Can do now` : "Show all"; chip.title = canDoNow ? "Showing only what you can do now (tap to show everything)" : "Showing everything (tap to hide what's locked)"; }
    for (const sec of Array.from(container.querySelectorAll<HTMLElement>(".sec"))) {
        let hits = 0;
        for (const r of Array.from(sec.querySelectorAll<HTMLElement>(".group > .row, .group > .kv-list, .group > .blk"))) {
            const hit = !q || (r.textContent ?? "").toLowerCase().includes(q);
            r.classList.toggle("miss", !hit);
            if (hit) hits++;
        }
        const headHit = !!q && (sec.querySelector(".sec-name")?.textContent ?? "").toLowerCase().includes(q);
        if (headHit) { for (const r of Array.from(sec.querySelectorAll(".miss"))) r.classList.remove("miss"); hits = 1; }
        sec.classList.toggle("found", !!q && hits > 0);
        sec.classList.toggle("nohit", !!q && hits === 0);
        const locked = sec.querySelectorAll(".group > .row.locked").length;
        const note = sec.querySelector<HTMLElement>(".locked-note");
        if (note) { note.hidden = !(canDoNow && !q && locked > 0); note.textContent = `${locked} locked · Show`; }
        // no divider above the first row still showing
        const g = sec.querySelector(".group");
        if (g) {
            let first = true;
            for (const c of Array.from(g.children) as HTMLElement[]) {
                const gone = c.hidden || (q ? c.classList.contains("miss") : canDoNow && c.classList.contains("locked"));
                c.classList.toggle("first-vis", first && !gone);
                if (!gone) first = false;
            }
        }
    }
    if (q) markCutRows(container);
}

class MainScreen extends MainGameFragment {
    selectedTab: MainGameTab = MainGameTab.Profile;
    private scrollPos = new Map<MainGameTab, number>();
    group = 0;
    subOf = GROUPS.map(() => 0);
    currentSub(): Sub { return GROUPS[this.group].subs[this.subOf[this.group]]; }
    /** Classic → new look: open the group that holds the tab you were on. */
    syncGroup() {
        const gi = GROUPS.findIndex((g) => g.subs.some((x) => x.tab === this.selectedTab));
        if (gi < 0) { this.group = 0; this.subOf[0] = 0; this.selectedTab = MainGameTab.Profile; return; }
        this.group = gi; this.subOf[gi] = GROUPS[gi].subs.findIndex((x) => x.tab === this.selectedTab);
    }
    selectGroup(i: number, j?: number) {
        const content = $("#content");
        this.scrollPos.set(this.selectedTab, content.scrollTop);
        this.group = i;
        if (j != null) this.subOf[i] = j;
        const tab = this.currentSub().tab;
        if (tab === this.selectedTab) { content.scrollTo({ top: 0, behavior: "smooth" }); return; }   // tapping the open tab: back to the top
        this.selectedTab = tab;
        SoundManager.INSTANCE.playSound(SoundEffect.Pop);
        this.reloadTab(tab);
        content.scrollTop = this.scrollPos.get(tab) ?? 0;
        if (content.scrollTop < 20) document.body.classList.remove("nh-min");
    }
    renderNL() {
        const content = $("#content");
        const footer = $("#footer");
        const sub = this.currentSub();
        const t = TABS.find((x) => x.tab === sub.tab)!;
        let vm;
        try { vm = t.gen.generateViewModels(); } catch (e) { console.error(e); toastError(e); return; }
        let cells: any[] = [...vm.getContentViewModels()];
        const foot: any[] = [...(vm.getFooterViewModels() ?? [])];
        const money = moneySections();
        if (sub.tab === MainGameTab.Profile) cells = sectionCells(cells, money, false);
        if (sub.tab === MainGameTab.Bank) {
            try { cells = cells.concat(sectionCells([...TABS.find((x) => x.tab === MainGameTab.Profile)!.gen.generateViewModels().getContentViewModels()], money, true)); }
            catch (e) { console.error(e); }
        }
        const top = content.scrollTop;
        layout(content, cells, { key: sub.tab.name(), footer: foot });
        footer.replaceChildren();
        footer.classList.add("empty");
        content.scrollTop = top;
        this.drawBars();
    }
    drawBars() {
        for (const b of Array.from(document.querySelectorAll<HTMLElement>("#tabbar .tb"))) b.classList.toggle("active", b.dataset.group === GROUPS[this.group].id);
        const st = $("#subtabs");
        const g = GROUPS[this.group];
        document.body.classList.toggle("has-subtabs", g.subs.length > 1);
        st.replaceChildren();
        if (g.subs.length > 1) {
            g.subs.forEach((x, j) => {
                const b = document.createElement("button");
                b.className = "seg" + (j === this.subOf[this.group] ? " active" : "");
                b.textContent = x.label;
                b.addEventListener("click", () => goToGroup(this.group, j));
                st.appendChild(b);
            });
        }
    }

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
        // v0.34.0: the compact top bar
        const first = (() => { try { return (p as any).getFirstName?.() || p.getFullName(); } catch { return p.getFullName(); } })();
        $("#nh-name").textContent = first;
        $("#nh-name").title = p.getFullName();
        $("#nh-vamp").hidden = !vamp;
        // v0.35.0: a vampire sees the week's weather (the sun matters now)
        const wx = vamp ? (p as any).vampire?.rb?.weather : null;
        const wxIcon = wx && WEATHER[wx as keyof typeof WEATHER] ? ` <span class="fa nh-wx" title="${WEATHER[wx as keyof typeof WEATHER].title}">${WEATHER[wx as keyof typeof WEATHER].fa}</span>` : "";
        $("#nh-date").innerHTML = `${textToHtml(String(m.getAgeInYears()))} · ${textToHtml(m.getMonthString())} <span class="nh-season">· ${textToHtml(Seasons.label(p))}</span> <span class="nh-week">${[0, 1, 2, 3].map((i) => `<span class="dot${i <= w ? " on" : ""}"></span>`).join("")}</span>${wxIcon}`;
        setBar("#nh-health", m.getAttr_health_progress());
        setBar("#nh-happiness", m.getAttr_happiness_progress());
        setBar("#nh-sanity", m.getAttr_sanity_progress());
        if (vamp) { const t = $("#nh-thirst") as HTMLElement; t.style.width = `${(p as any).vampire.thirst}%`; t.style.background = "#b3262e"; }
        const total = m.getCashAmount().add(m.getBankAmount());
        const weekKey = `${p.getId?.() ?? ""}|${m.getAgeInYears()}|${m.getMonthString()}|${w}`;
        if (hudMoney.week !== weekKey) { if (hudMoney.week.split("|")[0] === weekKey.split("|")[0]) hudMoney.base = hudMoney.last; else hudMoney.base = total; hudMoney.week = weekKey; }
        hudMoney.last = total;
        const tm = $("#nh-total");
        tm.textContent = ExtensionsKt.numberDisplayString(total, true);
        const dir = hudMoney.base ? total.compareTo(hudMoney.base) : 0;
        tm.classList.toggle("up", dir > 0);
        tm.classList.toggle("down", dir < 0);
        const nn = $("#nh-news-count") as HTMLElement | null;
        if (nn) { const n = News.unread(p); nn.hidden = n === 0; nn.textContent = n > 99 ? "99+" : String(n); }
        const nf = $("#nh-fame") as HTMLButtonElement;
        if (nf) {
            const show = Celebrity.fans(p) >= 1000 || Celebrity.career(p) != null;
            nf.hidden = !show;
            if (show) nf.innerHTML = `<img src="${imageUrl(Celebrity.image) ?? ""}" alt=""><span>${Celebrity.fansText(Celebrity.fans(p))}</span>`;
        }
    }

    reloadTab(tab: MainGameTab) {
        if (isNL()) {
            if (tab !== this.selectedTab && !(this.selectedTab === MainGameTab.Bank && tab === MainGameTab.Profile)) return;
            this.renderNL();
            return;
        }
        if (tab !== this.selectedTab) return;
        const content = $("#content");
        const footer = $("#footer");
        const t = TABS.find((x) => x.tab === tab)!;
        let vm;
        try { vm = t.gen.generateViewModels(); } catch (e) { console.error(e); toastError(e); return; }
        const top = content.scrollTop;
        content.replaceChildren();
        content.classList.remove("nl-screen", "can-do", "searching");
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

const hudMoney: { week: string; base: any; last: any } = { week: "", base: null, last: null };

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
        if (isNL()) return this.renderNL(vm);
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
    /** v0.34.0: the same screen as grouped rows, with a back chevron and a big title. */
    renderNL(vm: any) {
        let title = "";
        try { title = this.type.getNavBarTitle() ?? ""; } catch { /* untitled list */ }
        const header = vm.getHeaderViewModels() ?? [];
        for (const h of header) if (h instanceof NavigationBarViewModel) title = h.title ?? title;
        const head = document.createElement("header");
        head.className = "list-head";
        if (this.canGoBack) {
            const back = document.createElement("button");
            back.className = "back";
            back.innerHTML = `<span class="fa">\uf053</span><span>Back</span>`;
            back.title = "Back (Esc)";
            back.addEventListener("click", () => nav.pop());
            head.appendChild(back);
        }
        const h = document.createElement("h1");
        h.innerHTML = textToHtml(title);
        head.appendChild(h);
        const body = document.createElement("div");
        body.className = "list-body";
        const foot = document.createElement("div");
        foot.className = "list-foot";
        for (const c of vm.getFooterViewModels() ?? []) { const d = drawCell(c); if (d) foot.appendChild(d.el); }
        const top = this.el.querySelector(".list-body")?.scrollTop ?? 0;
        this.el.replaceChildren(head, body, foot);
        const cells = [...header.filter((x: any) => !(x instanceof NavigationBarViewModel)), ...vm.getContentViewModels()];
        const kind = (() => { try { return String((this.type as any).name?.() ?? this.type); } catch { return "list"; } })();
        layout(body, cells, { key: `list:${kind}:${this.key}` });
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

/** v0.34.0: the bottom tab bar (and the switch at the top of Me, Work and People). */
function goToGroup(i: number, j?: number) {
    if (nav.stack.length) {
        if (!nav.stack.every((s) => s.canGoBack)) return;
        nav.clear();
        main.selectGroup(i, j);
        render();
        return;
    }
    main.selectGroup(i, j);
}

// ------------------------------------------------------------------ sheets (v0.34.0)
/** Shows a panel that slides up from the bottom on phones (a centred dialog on big screens). Only one shows at a
 *  time; the rest wait underneath with a "more waiting" count. Returns a function that closes it. */
function hostSheet(content: HTMLElement, opts: SheetOpts): () => void {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop sheet-backdrop";
    const box = document.createElement("div");
    box.className = "modal sheet" + (opts.cls ? " " + opts.cls : "");
    box.appendChild(Object.assign(document.createElement("div"), { className: "grabber" }));
    box.appendChild(content);
    backdrop.appendChild(box);
    let closed = false;
    const close = () => { if (closed) return; closed = true; backdrop.remove(); updateSheetQueue(); };
    (backdrop as any).__close = close;
    if (opts.dismissable) {
        backdrop.dataset.dismiss = "1";
        backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
        swipeToClose(box, close);
    }
    $("#modals").appendChild(backdrop);
    updateSheetQueue();
    return close;
}
/** Drag a sheet down from its top (when it isn't scrolled) to close it. */
function swipeToClose(box: HTMLElement, close: () => void) {
    let y0 = -1, dy = 0;
    box.addEventListener("touchstart", (e) => { if (box.scrollTop > 0) { y0 = -1; return; } y0 = e.touches[0].clientY; dy = 0; box.style.transition = "none"; }, { passive: true });
    box.addEventListener("touchmove", (e) => { if (y0 < 0) return; dy = Math.max(0, e.touches[0].clientY - y0); box.style.transform = dy ? `translateY(${dy}px)` : ""; }, { passive: true });
    box.addEventListener("touchend", () => { if (y0 < 0) return; box.style.transition = ""; if (dy > 90) close(); else box.style.transform = ""; y0 = -1; });
}
function updateSheetQueue() {
    const all = Array.from(document.querySelectorAll<HTMLElement>("#modals .modal-backdrop"));
    for (const b of all) b.querySelector(".queue")?.remove();
    if (all.length > 1 && document.body.classList.contains("nl")) {
        const q = document.createElement("div");
        q.className = "queue";
        q.textContent = `${all.length - 1} more waiting`;
        all[all.length - 1].querySelector(".modal")?.prepend(q);
    }
}
/** Tap money in the top bar: cash and bank. */
function moneySheet() {
    if (!hasPlayer()) return;
    const m = GameStateManager.INSTANCE.getPersonState().getGetHUDViewModel();
    const body = document.createElement("div");
    body.className = "sheet-body";
    const line = (k: string, v: string, cls = "") => `<div class="row kv ${cls}"><div class="kv-left">${k}</div><div class="kv-right">${v}</div></div>`;
    body.innerHTML = `<h2 class="sheet-title">Money</h2><div class="group">${line(`<img class="kv-ico" src="${imageUrl("hud_cash")}" alt=""> Cash`, ExtensionsKt.numberDisplayString(m.getCashAmount(), true))}${line(`<img class="kv-ico" src="${imageUrl("hud_bank")}" alt=""> Bank`, ExtensionsKt.numberDisplayString(m.getBankAmount(), true))}${line("Total", ExtensionsKt.numberDisplayString(m.getCashAmount().add(m.getBankAmount()), true), "total")}</div>`;
    const btns = document.createElement("div");
    btns.className = "sheet-buttons";
    let close = () => {};
    const open = document.createElement("button"); open.className = "btn sheet-btn"; open.textContent = "Open Money";
    open.addEventListener("click", () => { close(); goToGroup(3, 0); });
    const done = document.createElement("button"); done.className = "btn sheet-btn sheet-close"; done.textContent = "Close";
    done.addEventListener("click", () => close());
    btns.append(open, done);
    body.appendChild(btns);
    close = hostSheet(body, { dismissable: true, cls: "details" });
}
/** Tap the stat bars: every stat by name and number. */
function statsSheet() {
    if (!hasPlayer()) return;
    const p = GameStateManager.INSTANCE.getPersonState();
    const m = p.getGetHUDViewModel();
    const vamp = Vampire.isVampire(p) && (p as any).vampire?.cureWeeks === 0;
    const stat = (icon: string, color: string, name: string, v: number) => {
        const pct = Math.max(0, Math.min(100, v));
        return `<div class="row meter"><div class="row-text"><div class="row-title-line"><div class="row-title"><span class="fa" style="color:${color}">${icon}</span> ${name}</div><div class="row-value">${Math.round(pct)} / 100</div></div><div class="meter-bar"><div class="meter-fill" style="width:${pct}%;background:${Utils.INSTANCE.getColor(ExtensionsKt.progressColorScheme(pct))}"></div></div></div></div>`;
    };
    const body = document.createElement("div");
    body.className = "sheet-body";
    body.innerHTML = `<h2 class="sheet-title">How You're Doing</h2><div class="group">${stat("\uf004", "#d65645", "Health", m.getAttr_health_progress())}${stat("\uf118", "#f1c40f", "Happiness", m.getAttr_happiness_progress())}${stat("\uf5dc", "#e685c1", "Sanity", m.getAttr_sanity_progress())}${vamp ? stat("\uf043", "#b3262e", "Hunger", (p as any).vampire.thirst) : ""}</div>`;
    const btns = document.createElement("div");
    btns.className = "sheet-buttons";
    let close = () => {};
    const mods = document.createElement("button"); mods.className = "btn sheet-btn"; mods.textContent = "Weekly Changes";
    mods.addEventListener("click", () => { close(); Utils.INSTANCE.navigateTo(GenericListType.weeklyModifiers, "", true); });
    const done = document.createElement("button"); done.className = "btn sheet-btn sheet-close"; done.textContent = "Close";
    done.addEventListener("click", () => close());
    btns.append(mods, done);
    body.appendChild(btns);
    close = hostSheet(body, { dismissable: true, cls: "details" });
}

// ------------------------------------------------------------------ dialogs
function showAlert(vm: AlertViewModel) {
    if (vm.getType() === AlertType.Banner) return showBanner(vm);
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    const box = document.createElement("div");
    box.className = "modal";
    const nl = isNL();
    if (nl) { backdrop.classList.add("sheet-backdrop"); box.classList.add("sheet"); box.appendChild(Object.assign(document.createElement("div"), { className: "grabber" })); }
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
    let closed = false;
    const close = (action?: () => void) => {
        if (closed) return;
        closed = true;
        backdrop.remove();
        updateSheetQueue();
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
    // v0.34.0: a plain message (one button, nothing to type) also closes with a tap outside or a swipe down
    if (nl && buttons.childElementCount === 1 && !input) {
        const only = buttons.firstElementChild as HTMLButtonElement;
        backdrop.dataset.dismiss = "1";
        (backdrop as any).__close = () => only.click();
        backdrop.addEventListener("click", (e) => { if (e.target === backdrop) only.click(); });
        swipeToClose(box, () => only.click());
    }
    updateSheetQueue();
    (input ?? (buttons.firstElementChild as HTMLElement))?.focus({ preventScroll: true } as any);
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
    applyLook();
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
        // Android's WebView can neither share nor download a file, so backups are for Windows, browsers and iPhone
        canBackUp: () => !window.lifesimFS || !!window.lifesimFS.openDir,
        backUp: backUpFile,
        pickFile: pickBackupFile,
        replaceSave: async (name, text) => { frozen = true; storage.write(name, text, true); await storage.flush(); location.reload(); },
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
    // v0.34.0: the bottom tab bar, the compact top bar and the sheets
    const tabbar = $("#tabbar");
    GROUPS.forEach((g, i) => {
        const b = document.createElement("button");
        b.className = "tb";
        b.dataset.group = g.id;
        b.title = g.label;
        b.innerHTML = `<img src="${imageUrl(g.icon)}" alt=""><span>${g.label}</span>`;
        b.addEventListener("click", () => goToGroup(i));
        tabbar.appendChild(b);
    });
    setSheetHost(hostSheet);
    const openList = (type: GenericListType, key: string) => { if (nav.stack.length && !nav.stack.every((x) => x.canGoBack)) return; Utils.INSTANCE.navigateTo(type, key, true); };
    $("#nh-settings").addEventListener("click", () => openList(GenericListType.settingsMenu, ""));
    $("#nh-news").addEventListener("click", () => openList(GenericListType.lifepath, "news"));
    $("#nh-fame").addEventListener("click", () => openList(GenericListType.lifepath, "celebrity"));
    $("#nh-money").addEventListener("click", moneySheet);
    $("#nh-stats").addEventListener("click", statsSheet);
    // scrolling down tucks the stat bars away (phones); scrolling up brings them back
    let lastY = 0, upRun = 0;
    const onScroll = (e: Event) => {
        const t = e.target as HTMLElement;
        if (!document.body.classList.contains("nl") || window.innerWidth >= 700 || !(t instanceof HTMLElement) || !(t.id === "content" || t.classList.contains("list-body"))) return;
        const y = t.scrollTop;
        const min = document.body.classList.contains("nh-min");
        if (y > lastY) { upRun = 0; if (!min && y > 56) document.body.classList.add("nh-min"); }
        else { upRun += lastY - y; if (min && (upRun > 40 || y < 16)) document.body.classList.remove("nh-min"); }
        lastY = y;
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    // swipe in from the left edge to go back (the iPhone home-screen app has no back gesture of its own)
    {
        let x0 = -1, y0 = 0, dx = 0, scr: HTMLElement | null = null;
        const ov = $("#overlay");
        ov.addEventListener("touchstart", (e) => {
            const t = e.touches[0];
            scr = nav.top()?.canGoBack && document.body.classList.contains("nl") && t.clientX - ov.getBoundingClientRect().left < 24 ? nav.top()!.el : null;
            x0 = scr ? t.clientX : -1; y0 = t.clientY; dx = 0;
        }, { passive: true });
        ov.addEventListener("touchmove", (e) => {
            if (x0 < 0 || !scr) return;
            const t = e.touches[0];
            dx = t.clientX - x0;
            if (Math.abs(t.clientY - y0) > Math.abs(dx) + 10) { x0 = -1; scr.style.transform = ""; return; }
            scr.style.transition = "none";
            scr.style.transform = `translateX(${Math.max(0, dx)}px)`;
        }, { passive: true });
        ov.addEventListener("touchend", () => {
            if (x0 < 0 || !scr) return;
            const el = scr; scr = null; x0 = -1;
            el.style.transition = ""; el.style.transform = "";
            if (dx > 90) nav.pop();
        });
    }
    darkMQ?.addEventListener?.("change", () => render());
    $("#hud-settings").addEventListener("click", () => Utils.INSTANCE.navigateTo(GenericListType.settingsMenu, "", true));
    // v0.28.1: News (what happened during the weeks, instead of pop-ups)
    $("#hud-news")?.addEventListener("click", () => { if (nav.stack.length && !nav.stack.every((x) => x.canGoBack)) return; Utils.INSTANCE.navigateTo(GenericListType.lifepath, "news", true); });
    $("#hud-fame")?.addEventListener("click", () => { if (nav.stack.length && !nav.stack.every((x) => x.canGoBack)) return; Utils.INSTANCE.navigateTo(GenericListType.lifepath, "celebrity", true); });
    $("#hud-settings").querySelector("img")!.setAttribute("src", imageUrl("hud_settings")!);
    $("#hud-cash-icon").setAttribute("src", imageUrl("hud_cash")!);
    $("#hud-bank-icon").setAttribute("src", imageUrl("hud_bank")!);

    document.addEventListener("keydown", (e) => {
        if (document.querySelector(".modal-backdrop")) {
            const tops = document.querySelectorAll<HTMLElement>("#modals .modal-backdrop");
            const topB = tops[tops.length - 1];
            if (e.key === "Escape" && topB?.dataset.dismiss) (topB as any).__close?.();
            else if (e.key === "Enter") (topB?.querySelector(".modal-buttons .btn, .sheet-buttons .btn") as HTMLElement)?.click();
            return;
        }
        if (e.key === "Escape" && nav.top()?.canGoBack) nav.pop();
        if (/^[1-9]$/.test(e.key) && !(e.target instanceof HTMLInputElement)) {
            if (isNL()) { if (+e.key <= GROUPS.length) goToGroup(+e.key - 1); }
            else goToTab(TABS[+e.key - 1].tab);
        }
    });
    window.addEventListener("beforeunload", () => { try { GameStateManager.INSTANCE.saveData(); } catch {} });
    const saveNow = () => { try { if (GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) GameStateManager.INSTANCE.saveData(); } catch {} };
    document.addEventListener("visibilitychange", () => {
        const hidden = document.visibilityState === "hidden";
        SoundManager.INSTANCE.setAway(hidden);   // v0.31.1: no music while you're out of the game
        if (hidden) saveNow();
    });
    window.addEventListener("pagehide", () => { SoundManager.INSTANCE.setAway(true); saveNow(); });   // iPhone: swiping the app away
    window.addEventListener("pageshow", () => SoundManager.INSTANCE.setAway(document.visibilityState === "hidden"));
    (window as any).__lifesimAway = (isAway: boolean) => SoundManager.INSTANCE.setAway(!!isAway);   // Android: MainActivity pause/resume
    // Android app (android/): the system back button calls __lifesimBack (true = handled here, false = leave the
    // app), and the app calls __lifesimSave when it goes to the background.
    (window as any).__lifesimSave = saveNow;
    (window as any).__lifesimFlush = () => storage.flush();   // v0.31.3: the iPhone app waits for this before updating itself
    (window as any).__lifesimBack = (): boolean => {
        const sheets = document.querySelectorAll<HTMLElement>("#modals .modal-backdrop");
        const topSheet = sheets[sheets.length - 1];
        if (topSheet?.dataset.dismiss && (topSheet as any).__close) { (topSheet as any).__close(); return true; }
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

void button; void ButtonViewModel; void richToHtml;
openWebStorage().then(boot, boot);
