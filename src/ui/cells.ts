// Renders the game's view models (the same "cells" the Android list adapter showed) to DOM.
import { ART_FALLBACK } from "../game/data/ArtSlots";
import { richToHtml, textToHtml, colorOf } from "./rich";
import images from "./images.json";
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
import { ImageButtonViewModel } from "../game/Models/ImageButtonViewModel";
import { ImageCellViewModel } from "../game/Models/ImageCellViewModel";
import { LeftRightCellViewModel } from "../game/Models/LeftRightCellViewModel";
import { NavigationBarViewModel } from "../game/Models/NavigationBarViewModel";
import { OptionsBarViewModel } from "../game/Models/OptionsBarViewModel";
import { ProgressBarCellViewModel } from "../game/Models/ProgressBarCellViewModel";
import { ProgressBarViewModel } from "../game/Models/ProgressBarViewModel";
import { ProgressCellTappableViewModel } from "../game/Models/ProgressCellTappableViewModel";
import { SettingsRowViewModel } from "../game/Models/SettingsRowViewModel";
import { SingleButtonViewModel } from "../game/Models/SingleButtonViewModel";
import { SingleLabelCellViewModel } from "../game/Models/SingleLabelCellViewModel";
import { SliderViewModel } from "../game/Models/SliderViewModel";
import { SwitchViewModel } from "../game/Models/SwitchViewModel";
import { TextLabelViewModel } from "../game/Models/TextLabelViewModel";
import { TombstoneViewModel } from "../game/Models/TombstoneViewModel";
import { WorkButtonsViewModel } from "../game/Models/WorkButtonsViewModel";
import { EditableTextFieldViewModel } from "../game/Models/EditableTextFieldViewModel";
import { PersonCardViewModel, SubHeaderViewModel, MeterViewModel, FamilyTreeViewModel, PagerViewModel } from "../game/Models/PersonCardViewModel";

const IMG: Record<string, string> = images as any;

/** Called after any user action so the screen reflects new game state. */
export type AfterAction = () => void;
let afterAction: AfterAction = () => {};
export function setAfterAction(f: AfterAction) { afterAction = f; }

export function imageUrl(id: any): string | null {
    if (id == null) return null;
    // v0.18.0 art slots: a row's own icon if you've drawn it, otherwise the stand-in
    const f = IMG[String(id)] ?? IMG[ART_FALLBACK[String(id)]];
    return f ? "assets/images/" + f : null;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
}

/** v0.18.0 family tree row pages (session only). */
const TREE_ROW_MAX = 14;
const treeRowPage = new Map<string, number>();
function treeRowPages(groups: any[]): any[][] {
    const pages: any[][] = [];
    let cur: any[] = [], count = 0;
    const flush = () => { if (cur.length) { pages.push(cur); cur = []; count = 0; } };
    for (const g of groups) {
        if (g.nodes.length > TREE_ROW_MAX) {
            // one big family: split it, keeping the label ("Ava's children (2/3)")
            flush();
            const n = Math.ceil(g.nodes.length / TREE_ROW_MAX);
            for (let i = 0; i < n; i++) pages.push([{ ...g, label: `${g.label} (${i + 1}/${n})`, nodes: g.nodes.slice(i * TREE_ROW_MAX, (i + 1) * TREE_ROW_MAX) }]);
            continue;
        }
        if (count + g.nodes.length > TREE_ROW_MAX) flush();
        cur.push(g); count += g.nodes.length;
    }
    flush();
    return pages.length ? pages : [[]];
}
function runAction(fn: () => void) {
    try {
        fn();
    } catch (e) {
        console.error(e);
        toastError(e);
    }
    afterAction();
}

export function toastError(e: any) {
    const t = el("div", "toast toast-error", "Something went wrong: " + textToHtml(String(e?.message ?? e)));
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 6000);
}

export function label(vm: TextLabelViewModel | null | undefined, cls = "label"): HTMLElement | null {
    if (!vm || vm.getHidden()) return null;
    const d = el("div", cls);
    const sb = vm.getStringBuilder();
    if (sb != null) d.innerHTML = richToHtml(sb);
    else {
        d.innerHTML = textToHtml(vm.getTitle());
        const c = colorOf(vm.getTextColor());
        if (c) d.style.color = c;
        if (vm.getBold()) d.style.fontWeight = "700";
        const fs = vm.getFontSize();
        if (fs && fs !== 16) d.style.fontSize = fs + "px";
    }
    return d;
}

export function button(vm: ButtonViewModel | null | undefined, cls = "btn"): HTMLElement | null {
    if (!vm || vm.getHidden()) return null;
    const b = el("button", cls);
    const sb = vm.getTitleStringBuilder();
    if (vm.getShowLock()) {
        b.textContent = "🔒";
        b.disabled = true;
        b.classList.add("locked");
        b.title = "Locked";
    } else {
        if (sb != null) b.innerHTML = richToHtml(sb);
        else b.textContent = vm.getTitle();
        b.disabled = !vm.getEnabled();
    }
    b.addEventListener("click", () => {
        if (b.disabled) return;
        if (vm.getShowPlaySoundEffect()) SoundManager.INSTANCE.playSound(SoundEffect.Pop2);
        b.classList.add("pressed");
        runAction(() => vm.getAction().invoke());
    });
    return b;
}

function image(id: any, cls = "cell-img"): HTMLElement | null {
    const url = imageUrl(id);
    if (!url && cls === "cell-img") return null;
    const d = el("div", cls);
    if (url) {
        const i = el("img");
        i.src = url;
        i.alt = "";
        i.draggable = false;
        d.appendChild(i);
    }
    return d;
}

function progressBar(vm: ProgressBarViewModel | null | undefined): HTMLElement | null {
    if (!vm || vm.getHidden()) return null;
    const outer = el("div", "progress");
    const inner = el("div", "progress-fill");
    const max = vm.getMaxProgressValue() || 1;
    const pct = Math.max(0, Math.min(100, (vm.getProgressValue() / max) * 100));
    inner.style.width = pct + "%";
    if (vm.getUseColorScheme()) inner.style.background = colorOf(ExtensionsKt.progressColorScheme(pct)) ?? "";
    outer.appendChild(inner);
    outer.title = `${Math.round(vm.getProgressValue())} / ${Math.round(max)}`;
    return outer;
}

function cellRow(img: HTMLElement | null, ...rest: HTMLElement[]): HTMLElement {
    const row = el("div", "cell-row" + (img ? "" : " no-img"));
    if (img) row.appendChild(img);
    row.append(...rest);
    return row;
}

function card(...children: (HTMLElement | null)[]): HTMLElement {
    const c = el("div", "card");
    for (const ch of children) if (ch) c.appendChild(ch);
    return c;
}

function titleBlock(title: string, subtitle: TextLabelViewModel | null, decorator?: HTMLElement | null): HTMLElement {
    const t = el("div", "cell-text");
    const row = el("div", "cell-title-row");
    row.appendChild(el("div", "cell-title", textToHtml(title)));
    if (decorator) row.appendChild(decorator);
    t.appendChild(row);
    const s = label(subtitle, "cell-subtitle");
    if (s) t.appendChild(s);
    return t;
}

function imageButton(vm: ImageButtonViewModel | null | undefined): HTMLElement | null {
    if (!vm || vm.getHidden()) return null;
    const b = el("button", "img-btn");
    const url = imageUrl(vm.getImageId());
    if (url) { const i = el("img"); i.src = url; b.appendChild(i); }
    b.disabled = !vm.getEnabled();
    b.addEventListener("click", () => runAction(() => vm.getAction().invoke()));
    return b;
}

function personCard(vm: PersonCardViewModel): HTMLElement {
    const c = el("div", "card person-card" + (vm.large ? " large" : "") + (vm.greyed ? " greyed" : ""));
    const head = el("div", "pc-head");
    const url = imageUrl(vm.imageId);
    if (url) { const i = el("img"); i.src = url; i.alt = ""; i.draggable = false; head.appendChild(i); }
    const body = el("div", "pc-body");
    const title = el("div", "pc-title");
    title.innerHTML = (vm.relation ? `<b>${textToHtml(vm.relation)} - </b>` : "") + textToHtml(vm.name);
    for (const b of vm.badges ?? []) title.appendChild(el("span", "pc-badge", textToHtml(b)));
    body.appendChild(title);
    const age = el("div", "pc-age", textToHtml(vm.ageText ?? ""));
    if (vm.large && vm.statusTitle && vm.score != null) age.appendChild(el("span", "pc-status st-" + vm.status, textToHtml(vm.statusTitle)));
    body.appendChild(age);
    if (vm.note) body.appendChild(el("div", "pc-note", textToHtml(vm.note)));
    if (vm.score != null) {
        const max = vm.maxScore || 1000;
        const bar = el("div", "pc-bar st-" + vm.status);
        const fill = el("div", "pc-fill");
        fill.style.width = Math.max(0, Math.min(100, (vm.score / max) * 100)) + "%";
        bar.append(fill, el("span", "pc-score", `${Math.round(vm.score)}/${Math.round(max)}`));
        body.appendChild(bar);
    }
    c.append(head, body);
    const click = vm.onClick;
    if (click) {
        c.classList.add("tappable");
        c.appendChild(el("span", "chevron fa", "\uf054"));
        c.addEventListener("click", () => runAction(() => click.invoke()));
    }
    return c;
}

export function renderCell(vm: any): HTMLElement | null {
    if (vm == null) return null;
    if (vm instanceof PersonCardViewModel) return personCard(vm);
    if (vm instanceof SubHeaderViewModel) return el("div", "memory-label", textToHtml(vm.title));
    if (vm instanceof PagerViewModel) {
        const c = el("div", "card pager");
        const btn = (label: string, to: number, title: string) => {
            const b = el("button", "btn pager-btn", textToHtml(label)) as HTMLButtonElement;
            b.title = title;
            b.disabled = to < 1 || to > vm.pages || to === vm.page;
            b.addEventListener("click", () => runAction(() => vm.go(to)));
            return b;
        };
        c.appendChild(btn("«", 1, "First page"));
        if (vm.pages > 10) c.appendChild(btn("−10", vm.page - 10, "Back 10 pages"));
        c.appendChild(btn("‹", vm.page - 1, "Previous page"));
        const mid = el("div", "pager-mid");
        mid.appendChild(el("div", "pager-label", textToHtml(vm.label)));
        const line = el("div", "pager-line");
        line.appendChild(el("span", "", textToHtml("Page ")));
        const input = el("input", "pager-input") as HTMLInputElement;
        input.type = "number"; input.min = "1"; input.max = String(vm.pages); input.value = String(vm.page);
        input.addEventListener("keydown", (e) => { if (e.key === "Enter") runAction(() => vm.go(Number(input.value) || vm.page)); e.stopPropagation(); });
        input.addEventListener("change", () => runAction(() => vm.go(Number(input.value) || vm.page)));
        line.appendChild(input);
        line.appendChild(el("span", "", textToHtml(` of ${vm.pages}`)));
        mid.appendChild(line);
        c.appendChild(mid);
        c.appendChild(btn("›", vm.page + 1, "Next page"));
        if (vm.pages > 10) c.appendChild(btn("+10", vm.page + 10, "Forward 10 pages"));
        c.appendChild(btn("»", vm.pages, "Last page"));
        return c;
    }
    if (vm instanceof FamilyTreeViewModel) {
        const c = el("div", "card tree-card");
        vm.rows.forEach((row, i) => {
            if (i > 0) c.appendChild(el("div", "tree-link"));
            const r = el("div", "tree-row");
            // v0.18.0: a row with lots of people is split into pages of about TREE_ROW_MAX people
            const pages = treeRowPages(row.groups);
            const pkey = row.title;
            const page = Math.min(pages.length - 1, treeRowPage.get(pkey) ?? 0);
            const title = el("div", "tree-row-title", textToHtml(row.title));
            if (pages.length > 1) {
                const nav = el("span", "tree-row-pager");
                const go = (n: number) => { treeRowPage.set(pkey, n); const fresh = renderCell(vm); if (fresh) c.replaceWith(fresh); };
                const prev = el("button", "tree-page-btn", "‹") as HTMLButtonElement; prev.disabled = page === 0; prev.addEventListener("click", () => go(page - 1));
                const next = el("button", "tree-page-btn", "›") as HTMLButtonElement; next.disabled = page >= pages.length - 1; next.addEventListener("click", () => go(page + 1));
                nav.appendChild(prev); nav.appendChild(el("span", "tree-page-label", `${page + 1} / ${pages.length}`)); nav.appendChild(next);
                title.appendChild(nav);
            }
            r.appendChild(title);
            const groups = el("div", "tree-groups");
            for (const g of pages[page]) {
                const ge = el("div", "tree-group" + (g.you ? " you-group" : ""));
                ge.appendChild(el("div", "tree-group-label", textToHtml(g.label)));
                const nodes = el("div", "tree-nodes");
                for (const n of g.nodes) {
                    const ne = el("div", "tree-node" + (n.dead ? " dead" : "") + (n.you ? " you" : ""));
                    const url = imageUrl(n.imageId);
                    if (url) { const im = el("img"); im.src = url; im.alt = ""; im.draggable = false; ne.appendChild(im); }
                    ne.appendChild(el("div", "tn-name", textToHtml(n.name)));
                    ne.appendChild(el("div", "tn-rel", textToHtml(n.relation)));
                    ne.appendChild(el("div", "tn-sub", textToHtml(n.sub)));
                    if (n.badge) ne.appendChild(el("span", "tn-badge", textToHtml(n.badge)));
                    const click = n.onClick;
                    if (click) { ne.classList.add("tappable"); ne.addEventListener("click", () => runAction(() => click.invoke())); }
                    nodes.appendChild(ne);
                }
                ge.appendChild(nodes);
                groups.appendChild(ge);
            }
            r.appendChild(groups);
            c.appendChild(r);
        });
        return c;
    }
    if (vm instanceof MeterViewModel) {
        const c = el("div", "card meter-card tone-" + vm.tone);
        const top = el("div", "meter-top");
        top.append(el("b", "", textToHtml(vm.title)), el("span", "meter-val", textToHtml(vm.display ?? `${Math.round(vm.value)}/${vm.max}`)));
        const bar = el("div", "meter-bar"), fill = el("div", "meter-fill");
        fill.style.width = Math.max(0, Math.min(100, (vm.value / (vm.max || 1)) * 100)) + "%";
        bar.appendChild(fill);
        c.append(top, bar);
        if (vm.note) c.appendChild(el("div", "meter-note", textToHtml(vm.note)));
        return c;
    }
    if (vm instanceof HeaderTitleViewModel) return el("h2", "section-header", textToHtml(vm.getDisplayTitle()));
    if (vm instanceof NavigationBarViewModel) return null; // drawn by the screen header
    if (vm instanceof ActionCellSingleViewModel) {
        const right = el("div", "cell-actions single");
        const b = button(vm.getActionButton());
        if (b) right.appendChild(b);
        const sw = switchControl(vm.getSwitchViewModel());
        if (sw) right.appendChild(sw);
        return card(cellRow(image(vm.getImageId()), titleBlock(vm.getTitle(), vm.getSubtitle()), right));
    }
    if (vm instanceof ActionCellMultipleOptionsViewModel) {
        const deco = label(vm.getDecorator(), "cell-decorator");
        const row = cellRow(image(vm.getImageId()), titleBlock(vm.getTitle(), vm.getSubtitle(), deco));
        const btns = el("div", "button-grid");
        for (const bvm of vm.getButtons() ?? []) { const b = button(bvm); if (b) btns.appendChild(b); }
        return card(row, btns.childElementCount ? btns : null);
    }
    if (vm instanceof ActionProgressViewModel) {
        let deco: HTMLElement | null = null;
        if (vm.getDecoratorText()) deco = el("div", "cell-decorator", textToHtml(vm.getDecoratorText()));
        const di = imageButton(vm.getDecoratorImage());
        const right = el("div", "cell-actions single");
        const b = button(vm.getActionButton());
        if (b) right.appendChild(b);
        const text = titleBlock(vm.getTitle(), vm.getSubtitle(), deco ?? di);
        const pb = progressBar(vm.getProgressBar());
        if (pb) text.appendChild(pb);
        return card(cellRow(image(vm.getImageId()), text, right));
    }
    if (vm instanceof ProgressCellTappableViewModel) {
        const text = titleBlock(vm.getTitle(), vm.getSubtitle());
        const pb = progressBar(vm.getProgressBar());
        if (pb) text.appendChild(pb);
        const c = card(cellRow(image(vm.getImageId()), text));
        const click = vm.getOnClick();
        if (click) { c.classList.add("tappable"); c.addEventListener("click", () => runAction(() => click.invoke())); }
        return c;
    }
    if (vm instanceof ProgressBarCellViewModel) {
        const pb = progressBar(vm.getProgressBar());
        return pb ? card(pb) : null;
    }
    if (vm instanceof LeftRightCellViewModel) {
        const row = el("div", "lr-row");
        const l = label(vm.getLeftLabel(), "lr-left");
        const r = label(vm.getRightLabel(), "lr-right");
        if (l) row.appendChild(l);
        if (r) row.appendChild(r);
        const c = card(row);
        c.classList.add("compact");
        const click = vm.getOnClick();
        if (click) {
            c.classList.add("tappable");
            row.appendChild(el("span", "chevron fa", ""));
            c.addEventListener("click", () => runAction(() => click.invoke()));
        }
        return c;
    }
    if (vm instanceof SingleLabelCellViewModel) {
        const l = label(vm.getLabel(), "single-label");
        if (!l) return null;
        const c = card(l);
        c.classList.add("compact");
        return c;
    }
    if (vm instanceof SingleButtonViewModel) {
        const b = button(vm.getButton(), "btn wide");
        return b ? card(b) : null;
    }
    if (vm instanceof WorkButtonsViewModel) {
        const row = el("div", "work-buttons");
        for (const b of [vm.getWorkButton1(), vm.getWorkButton2(), vm.getWorkButton3()]) { const e = button(b, "btn work"); if (e) row.appendChild(e); }
        return row;
    }
    if (vm instanceof ImageCellViewModel) {
        const d = el("div", "image-cell");
        d.appendChild(image(vm.getImageId(), "big-img")!);
        if (vm.getTopRightImageId() != null) d.appendChild(image(vm.getTopRightImageId(), "corner-img")!);
        return d;
    }
    if (vm instanceof OptionsBarViewModel) {
        const d = el("div", "options-bar");
        for (const b of vm.getButtons() ?? []) { const e = imageButton(b); if (e) d.appendChild(e); }
        return d;
    }
    if (vm instanceof SettingsRowViewModel) {
        const row = el("div", "settings-row");
        row.append(image(vm.getImageId(), "settings-img")!, el("div", "settings-title", textToHtml(vm.getTitle())));
        if (vm.getShowChevron()) row.appendChild(el("span", "chevron fa", ""));
        const c = card(row);
        c.classList.add("compact");
        if (vm.getIsEnabled()) {
            c.classList.add("tappable");
            c.addEventListener("click", () => runAction(() => vm.getAction().invoke()));
        } else c.classList.add("disabled");
        return c;
    }
    if (vm instanceof TombstoneViewModel) {
        const d = el("div", "tombstone");
        d.innerHTML = richToHtml(vm.getDeathSummary());
        return d;
    }
    if (vm instanceof CustomizeTextFieldViewModel) {
        const f = textField(vm.getEditTextViewModel());
        const c = card(el("div", "customize-title", textToHtml(vm.getTitle())), f);
        c.classList.add("customize");
        return c;
    }
    if (vm instanceof CustomizeSliderViewModel) {
        const c = card(el("div", "customize-title", textToHtml(vm.getTitle())), slider(vm.getSliderViewModel()));
        c.classList.add("customize");
        return c;
    }
    if (vm instanceof CustomizeSwitchViewModel) {
        const row = el("div", "lr-row");
        row.append(el("div", "customize-title", textToHtml(vm.getTitle())));
        const sw = switchControl(vm.getSwitchViewModel());
        if (sw) row.appendChild(sw);
        const c = card(row);
        c.classList.add("customize");
        return c;
    }
    if (vm instanceof CustomizeOptionsViewModel) {
        const c = card(el("div", "customize-title", textToHtml(vm.getTitle())));
        c.classList.add("customize");
        const opts = el("div", "option-chips");
        const current = el("div", "option-current", textToHtml(vm.getDefaultOptionTitle()));
        for (const o of vm.getOptionsViewModels() ?? []) {
            const chip = el("button", "chip");
            const url = imageUrl(o.getImageId());
            if (url) { const i = el("img"); i.src = url; chip.appendChild(i); }
            chip.appendChild(el("span", "", textToHtml(o.getTitle())));
            const def = vm.getDefaultOptionTitle() ?? "";
            if (o.getTitle() === def || (o.getTitle().length === 3 && def.startsWith(o.getTitle()))) chip.classList.add("selected");  // "Jan" ↔ "January"
            chip.addEventListener("click", () => runAction(() => o.getOnSelected().invoke()));
            opts.appendChild(chip);
        }
        c.append(current, opts);
        return c;
    }
    console.warn("No renderer for", vm?.constructor?.name);
    return null;
}

function switchControl(vm: SwitchViewModel | null | undefined): HTMLElement | null {
    if (!vm || vm.getHidden()) return null;
    const lab = el("label", "switch");
    const input = el("input");
    input.type = "checkbox";
    input.checked = vm.getInitialValue();
    input.addEventListener("change", () => runAction(() => vm.getOnValueChangedHandler().invoke(input.checked)));
    lab.append(input, el("span", "slider-knob"));
    return lab;
}

function textField(vm: EditableTextFieldViewModel | null | undefined): HTMLElement | null {
    if (!vm || vm.getHidden()) return null;
    const i = el("input", "text-input");
    i.type = "text";
    i.placeholder = vm.getPlaceholderText() ?? "";
    if ((vm as any).initialText) i.value = (vm as any).initialText;
    i.addEventListener("input", () => { try { vm.getTextChangedHandler().invoke(i.value); } catch (e) { console.error(e); } });
    i.addEventListener("change", () => afterAction());
    return i;
}

function slider(vm: SliderViewModel): HTMLElement {
    const wrap = el("div", "slider-wrap");
    const input = el("input", "range");
    input.type = "range";
    const res = vm.getSliderResolution();
    input.min = "0";
    input.max = String(res);
    input.step = "1";
    input.value = String(vm.getScaledValueForProgressBar(vm.getInitialValue()));
    const out = el("div", "slider-value");
    const show = () => {
        const v = vm.getActualValueFromProgressBarValue(parseInt(input.value, 10));
        out.textContent = vm.isMoney() ? ExtensionsKt.numberDisplayString(v, true) : String(v);
        return v;
    };
    show();
    input.addEventListener("input", () => { show(); });
    input.addEventListener("change", () => runAction(() => vm.getValueChangedHandler().invoke(show())));
    wrap.append(input, out);
    return wrap;
}
