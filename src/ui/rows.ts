// v0.34.0 "The New Look": draws the game's cells as thin iPhone-style rows inside grouped boxes, with the long text
// and extra choices in a detail sheet. The game hands over exactly the same view models as before; only the drawing
// changes. The classic look keeps using renderCell() in cells.ts.
import { richToHtml, textToHtml } from "./rich";
import { el, button, runAction, imageUrl, progressBar, switchControl, textField, slider, renderCell, label } from "./cells";
import { SoundManager } from "../game/Managers/SoundManager";
import { SoundEffect } from "../game/Managers/SoundEffect";
import { ExtensionsKt } from "../game/Utils/ExtensionsKt";
import { ActionCellMultipleOptionsViewModel } from "../game/Models/ActionCellMultipleOptionsViewModel";
import { ActionCellSingleViewModel } from "../game/Models/ActionCellSingleViewModel";
import { ActionProgressViewModel } from "../game/Models/ActionProgressViewModel";
import { ButtonViewModel } from "../game/Models/ButtonViewModel";
import { CustomizeOptionsViewModel } from "../game/Models/CustomizeOptionsViewModel";
import { CustomizeSliderViewModel } from "../game/Models/CustomizeSliderViewModel";
import { CustomizeSwitchViewModel } from "../game/Models/CustomizeSwitchViewModel";
import { CustomizeTextFieldViewModel } from "../game/Models/CustomizeTextFieldViewModel";
import { HeaderTitleViewModel } from "../game/Models/HeaderTitleViewModel";
import { ImageCellViewModel } from "../game/Models/ImageCellViewModel";
import { LeftRightCellViewModel } from "../game/Models/LeftRightCellViewModel";
import { NavigationBarViewModel } from "../game/Models/NavigationBarViewModel";
import { ProgressBarCellViewModel } from "../game/Models/ProgressBarCellViewModel";
import { ProgressCellTappableViewModel } from "../game/Models/ProgressCellTappableViewModel";
import { SettingsRowViewModel } from "../game/Models/SettingsRowViewModel";
import { SingleButtonViewModel } from "../game/Models/SingleButtonViewModel";
import { SingleLabelCellViewModel } from "../game/Models/SingleLabelCellViewModel";
import { TextLabelViewModel } from "../game/Models/TextLabelViewModel";
import { WorkButtonsViewModel } from "../game/Models/WorkButtonsViewModel";
import { PersonCardViewModel, SubHeaderViewModel, MeterViewModel } from "../game/Models/PersonCardViewModel";

// ------------------------------------------------------------------ small pieces
const FA = { chevron: "", lock: "", down: "", search: "", close: "" };

function icon(id: any, cls = "row-icon"): HTMLElement | null {
    const url = imageUrl(id);
    if (!url) return null;
    const d = el("div", cls);
    const i = el("img");
    i.src = url; i.alt = ""; i.draggable = false; i.loading = "lazy";
    d.appendChild(i);
    return d;
}

function chevron(): HTMLElement { return el("span", "row-chev fa", FA.chevron); }

/** A button as a small pill for a row (line breaks become " · "). */
function pill(vm: ButtonViewModel | null | undefined): HTMLElement | null {
    const b = button(vm, "pill");
    if (!b) return null;
    if (b.classList.contains("locked")) { b.innerHTML = `<span class="fa">${FA.lock}</span>`; b.title = "Locked"; }
    for (const br of Array.from(b.querySelectorAll("br"))) br.replaceWith(document.createTextNode(" · "));
    b.addEventListener("click", (e) => e.stopPropagation());
    return b;
}

function visibleButtons(list: (ButtonViewModel | null | undefined)[]): ButtonViewModel[] {
    return list.filter((b): b is ButtonViewModel => !!b && !b.getHidden());
}

/** Is this button blocked by a requirement (the 🔒 the game shows)? */
const isLocked = (b: ButtonViewModel) => !!b.getShowLock();

function subtitle(vm: TextLabelViewModel | null | undefined): HTMLElement | null {
    return label(vm, "row-sub");
}

function textBlock(title: string, sub: HTMLElement | null, deco?: HTMLElement | null): HTMLElement {
    const t = el("div", "row-text");
    const top = el("div", "row-title-line");
    top.appendChild(el("div", "row-title", textToHtml(title)));
    if (deco) top.appendChild(deco);
    t.appendChild(top);
    if (sub) t.appendChild(sub);
    return t;
}

function row(cls: string, ...parts: (HTMLElement | null)[]): HTMLElement {
    const r = el("div", "row " + cls);
    for (const p of parts) if (p) r.appendChild(p);
    return r;
}

function tap(r: HTMLElement, fn: () => void) {
    r.classList.add("tappable");
    r.addEventListener("click", () => fn());
}

// ------------------------------------------------------------------ detail sheet
export type SheetOpts = { dismissable?: boolean; cls?: string };
let sheetHook: ((box: HTMLElement, opts: SheetOpts) => () => void) | null = null;
/** main.ts supplies the sheet host (so sheets queue with the game's own pop-ups). */
export function setSheetHost(f: (box: HTMLElement, opts: SheetOpts) => () => void) { sheetHook = f; }

/** Details for a row: the big picture, the full text and every choice, as large buttons. */
function openDetails(d: { imageId: any; title: string; deco?: string | null; sub?: TextLabelViewModel | null; progress?: HTMLElement | null; buttons: ButtonViewModel[]; extra?: HTMLElement | null }) {
    if (!sheetHook) return;
    const box = el("div", "sheet-body");
    const url = imageUrl(d.imageId);
    if (url) box.insertAdjacentHTML("beforeend", `<img class="sheet-img" src="${url}" alt="">`);
    box.appendChild(el("h2", "sheet-title", textToHtml(d.title)));
    if (d.deco) box.appendChild(el("div", "sheet-deco", textToHtml(d.deco)));
    const s = label(d.sub, "sheet-text");
    if (s) box.appendChild(s);
    if (d.progress) box.appendChild(d.progress);
    if (d.extra) box.appendChild(d.extra);
    const btns = el("div", "sheet-buttons");
    let close: () => void = () => {};
    for (const vm of d.buttons) {
        const b = button(vm, "btn sheet-btn");
        if (!b) continue;
        if (isLocked(vm)) { b.innerHTML = `<span class="fa">${FA.lock}</span> Locked`; }
        // close the sheet first, so whatever the action opens (a pop-up, a screen) shows on top
        b.addEventListener("click", () => close(), { capture: true });
        btns.appendChild(b);
    }
    const done = el("button", "btn sheet-btn sheet-close", "Close");
    done.addEventListener("click", () => close());
    btns.appendChild(done);
    box.appendChild(btns);
    close = sheetHook(box, { dismissable: true, cls: "details" });
}

// ------------------------------------------------------------------ cells → rows
export type Drawn = { el: HTMLElement; kind: "row" | "block" | "header" | "primary" };

/** Lines like "Age: 34" become two-column rows (the Profile's identity card, property lists). */
function keyValueRows(vm: TextLabelViewModel): HTMLElement[] | null {
    const sb = vm.getStringBuilder();
    const text = sb != null ? sb.text : vm.getTitle();
    if (!text) return null;
    const lines = text.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length);
    if (lines.length < 3 || !lines.every((l: string) => /^[^:]{1,28}:\s+\S/.test(l))) return null;
    return lines.map((l: string) => {
        const i = l.indexOf(":");
        const r = row("kv", el("div", "kv-left", textToHtml(l.slice(0, i))), el("div", "kv-right", textToHtml(l.slice(i + 1).trim())));
        return r;
    });
}

function personRow(vm: PersonCardViewModel): HTMLElement {
    const face = icon(vm.imageId, "row-face");
    const text = el("div", "row-text");
    const t = el("div", "row-title-line");
    const name = el("div", "row-title");
    name.innerHTML = textToHtml(vm.name);
    t.appendChild(name);
    for (const b of vm.badges ?? []) t.appendChild(el("span", "row-badge", textToHtml(b)));
    text.appendChild(t);
    const sub = [vm.relation, vm.ageText].filter(Boolean).map((x) => textToHtml(x)).join(" · ");
    const line = el("div", "row-sub one", sub);
    if (vm.statusTitle && vm.score != null) line.appendChild(el("span", "row-status st-" + vm.status, textToHtml(vm.statusTitle)));
    text.appendChild(line);
    if (vm.note) text.appendChild(el("div", "row-sub one muted", textToHtml(vm.note)));
    if (vm.score != null) {
        const max = vm.maxScore || 1000;
        const bar = el("div", "row-bar st-" + vm.status), fill = el("div", "row-bar-fill");
        fill.style.width = Math.max(0, Math.min(100, (vm.score / max) * 100)) + "%";
        bar.appendChild(fill);
        text.appendChild(bar);
    }
    const r = row("person" + (vm.large ? " large" : "") + (vm.greyed ? " greyed" : ""), face, text);
    const click = vm.onClick;
    if (click) { r.appendChild(chevron()); tap(r, () => runAction(() => click.invoke())); }
    return r;
}

/** Draws one cell for the new look. Returns null for cells with nothing to show. */
export function drawCell(vm: any): Drawn | null {
    if (vm == null) return null;
    if (vm instanceof NavigationBarViewModel) return null;
    if (vm instanceof HeaderTitleViewModel) return { el: el("div", "sec-title", textToHtml(vm.title)), kind: "header" };
    if (vm instanceof SubHeaderViewModel) return { el: el("div", "row sub-head", textToHtml(vm.title)), kind: "row" };
    if (vm instanceof PersonCardViewModel) return { el: personRow(vm), kind: "row" };

    if (vm instanceof ActionCellSingleViewModel) {
        const b = vm.getActionButton();
        const right = el("div", "row-act");
        const p = pill(b);
        if (p) right.appendChild(p);
        const sw = switchControl(vm.getSwitchViewModel());
        if (sw) { sw.addEventListener("click", (e) => e.stopPropagation()); right.appendChild(sw); }
        const r = row("action", icon(vm.getImageId()), textBlock(vm.getTitle(), subtitle(vm.getSubtitle())), right.childElementCount ? right : null);
        const locked = !!b && !b.getHidden() && isLocked(b);
        if (locked) r.classList.add("locked");
        r.dataset.more = "1";
        r.addEventListener("click", () => { if (r.classList.contains("more") || locked) openDetails({ imageId: vm.getImageId(), title: vm.getTitle(), sub: vm.getSubtitle(), buttons: visibleButtons([b]) }); });
        return { el: r, kind: "row" };
    }
    if (vm instanceof ActionCellMultipleOptionsViewModel) {
        const btns = visibleButtons(vm.getButtons() ?? []);
        const decoVm = vm.getDecorator();
        const deco = label(decoVm, "row-deco");
        const r = row("action", icon(vm.getImageId()), textBlock(vm.getTitle(), subtitle(vm.getSubtitle()), deco));
        const details = () => openDetails({ imageId: vm.getImageId(), title: vm.getTitle(), deco: deco?.textContent ?? null, sub: vm.getSubtitle(), buttons: btns });
        if (btns.length === 1) {
            const right = el("div", "row-act");
            right.appendChild(pill(btns[0])!);
            r.appendChild(right);
            r.dataset.more = "1";
            r.addEventListener("click", () => { if (r.classList.contains("more") || isLocked(btns[0])) details(); });
        } else if (btns.length > 1) {
            const right = el("div", "row-act");
            right.appendChild(el("span", "row-count", `${btns.length} choices`));
            right.appendChild(chevron());
            r.appendChild(right);
            tap(r, details);
        }
        if (btns.length && btns.every(isLocked)) r.classList.add("locked");
        return { el: r, kind: "row" };
    }
    if (vm instanceof ActionProgressViewModel) {
        const b = vm.getActionButton();
        let deco: HTMLElement | null = null;
        if (vm.getDecoratorText()) deco = el("div", "row-deco", textToHtml(vm.getDecoratorText()));
        const text = textBlock(vm.getTitle(), subtitle(vm.getSubtitle()), deco);
        const pb = progressBar(vm.getProgressBar());
        if (pb) { pb.classList.add("row-progress"); text.appendChild(pb); }
        const right = el("div", "row-act");
        const p = pill(b);
        if (p) right.appendChild(p);
        const r = row("action", icon(vm.getImageId()), text, right.childElementCount ? right : null);
        const locked = !!b && !b.getHidden() && isLocked(b);
        if (locked) r.classList.add("locked");
        r.dataset.more = "1";
        r.addEventListener("click", () => { if (r.classList.contains("more") || locked) openDetails({ imageId: vm.getImageId(), title: vm.getTitle(), deco: vm.getDecoratorText(), sub: vm.getSubtitle(), progress: progressBar(vm.getProgressBar()), buttons: visibleButtons([b]) }); });
        return { el: r, kind: "row" };
    }
    if (vm instanceof ProgressCellTappableViewModel) {
        const text = textBlock(vm.getTitle(), subtitle(vm.getSubtitle()));
        const pb = progressBar(vm.getProgressBar());
        if (pb) { pb.classList.add("row-progress"); text.appendChild(pb); }
        const r = row("action", icon(vm.getImageId()), text);
        const click = vm.getOnClick();
        if (click) { r.appendChild(chevron()); tap(r, () => runAction(() => click.invoke())); }
        return { el: r, kind: "row" };
    }
    if (vm instanceof ProgressBarCellViewModel) {
        const pb = progressBar(vm.getProgressBar());
        if (!pb) return null;
        pb.classList.add("row-progress");
        return { el: row("bar-only", pb), kind: "row" };
    }
    if (vm instanceof MeterViewModel) {
        const top = el("div", "row-title-line");
        top.append(el("div", "row-title", textToHtml(vm.title)), el("div", "row-value", textToHtml(vm.display ?? `${Math.round(vm.value)}/${vm.max}`)));
        const text = el("div", "row-text");
        text.appendChild(top);
        const bar = el("div", "meter-bar"), fill = el("div", "meter-fill");
        fill.style.width = Math.max(0, Math.min(100, (vm.value / (vm.max || 1)) * 100)) + "%";
        bar.appendChild(fill);
        text.appendChild(bar);
        if (vm.note) text.appendChild(el("div", "row-sub", textToHtml(vm.note)));
        return { el: row("meter tone-" + vm.tone, text), kind: "row" };
    }
    if (vm instanceof LeftRightCellViewModel) {
        const l = label(vm.getLeftLabel(), "kv-left");
        const rr = label(vm.getRightLabel(), "kv-right");
        const r = row("kv", l, rr);
        const click = vm.getOnClick();
        if (click) { r.appendChild(chevron()); tap(r, () => runAction(() => click.invoke())); }
        return { el: r, kind: "row" };
    }
    if (vm instanceof SingleLabelCellViewModel) {
        const lv = vm.getLabel();
        if (!lv || lv.getHidden()) return null;
        const kv = keyValueRows(lv);
        if (kv) { const wrap = el("div", "kv-list"); wrap.append(...kv); return { el: wrap, kind: "row" }; }
        const l = label(lv, "row-note");
        return l ? { el: row("note", l), kind: "row" } : null;
    }
    if (vm instanceof SingleButtonViewModel) {
        const b = button(vm.getButton(), "row-button");
        if (!b) return null;
        for (const br of Array.from(b.querySelectorAll("br"))) br.replaceWith(document.createTextNode(" · "));
        if (b.classList.contains("locked")) b.innerHTML = `<span class="fa">${FA.lock}</span>`;
        return { el: row("button-row", b), kind: "row" };
    }
    if (vm instanceof WorkButtonsViewModel) {
        const wrap = el("div", "primary-buttons");
        for (const b of [vm.getWorkButton1(), vm.getWorkButton2(), vm.getWorkButton3()]) { const e = button(b, "btn primary"); if (e) wrap.appendChild(e); }
        return wrap.childElementCount ? { el: wrap, kind: "primary" } : null;
    }
    if (vm instanceof SettingsRowViewModel) {
        const r = row("settings", icon(vm.getImageId(), "row-icon small"), el("div", "row-title", textToHtml(vm.getTitle())));
        if (vm.getShowChevron()) r.appendChild(chevron());
        if (vm.getIsEnabled()) tap(r, () => runAction(() => vm.getAction().invoke()));
        else r.classList.add("disabled");
        return { el: r, kind: "row" };
    }
    if (vm instanceof CustomizeSwitchViewModel) {
        const sw = switchControl(vm.getSwitchViewModel());
        const r = row("switch-row", el("div", "row-title wrap", textToHtml(vm.getTitle())), sw);
        return { el: r, kind: "row" };
    }
    if (vm instanceof CustomizeTextFieldViewModel) {
        const f = textField(vm.getEditTextViewModel());
        const r = row("field-row", el("div", "row-label", textToHtml(vm.getTitle())), f);
        return { el: r, kind: "row" };
    }
    if (vm instanceof CustomizeSliderViewModel) {
        const r = row("field-row", el("div", "row-label", textToHtml(vm.getTitle())), slider(vm.getSliderViewModel()));
        return { el: r, kind: "row" };
    }
    if (vm instanceof CustomizeOptionsViewModel) {
        const head = el("div", "row-title-line");
        head.append(el("div", "row-title", textToHtml(vm.getTitle())), el("div", "row-value", textToHtml(vm.getDefaultOptionTitle())));
        const opts = el("div", "option-chips");
        for (const o of vm.getOptionsViewModels() ?? []) {
            const chip = el("button", "chip");
            const url = imageUrl(o.getImageId());
            if (url) { const i = el("img"); i.src = url; chip.appendChild(i); }
            chip.appendChild(el("span", "", textToHtml(o.getTitle())));
            const def = vm.getDefaultOptionTitle() ?? "";
            if (o.getTitle() === def || (o.getTitle().length === 3 && def.startsWith(o.getTitle()))) chip.classList.add("selected");
            chip.addEventListener("click", () => { SoundManager.INSTANCE.playSound(SoundEffect.Pop2); runAction(() => o.getOnSelected().invoke()); });
            opts.appendChild(chip);
        }
        const text = el("div", "row-text");
        text.append(head, opts);
        return { el: row("options-row", text), kind: "row" };
    }
    if (vm instanceof ImageCellViewModel) {
        const d = renderCell(vm);
        return d ? { el: d, kind: "block" } : null;
    }
    // family tree, pager, tombstone, options bar…: the classic drawing, sitting in the new layout
    const d = renderCell(vm);
    return d ? { el: d, kind: "block" } : null;
}

/** After the rows are on screen: rows whose text was cut short open their details when tapped. */
export function markCutRows(root: HTMLElement) {
    for (const r of Array.from(root.querySelectorAll<HTMLElement>(".row[data-more]"))) {
        const s = r.querySelector<HTMLElement>(".row-sub");
        const t = r.querySelector<HTMLElement>(".row-title");
        const p = r.querySelector<HTMLElement>(".pill");
        const cut = (e: HTMLElement | null) => !!e && (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2);
        if (cut(s) || cut(t) || cut(p)) { r.classList.add("more", "tappable"); }
    }
}

export const NL_ICONS = FA;
void ExtensionsKt; void richToHtml;
