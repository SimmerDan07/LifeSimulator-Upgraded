// Renders Android-style SpannableStringBuilder rich text to HTML.
import { SpannableStringBuilder, Span } from "../game/runtime";
import { Utils } from "../game/Utils/Utils";
import { ExtensionsKt } from "../game/Utils/ExtensionsKt";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function colorOf(id: any): string | null {
    if (id == null) return null;
    return cssColor(Utils.INSTANCE.getColor(id));
}

/** v0.34.0: the game's near-black and grey text colours follow the theme (same colours in the light theme, light text in
 *  dark mode); its white text follows --on-btn, so it stays readable on tinted buttons. */
const THEMED: Record<string, string> = {
    "#2b2b2b": "var(--ink, #2b2b2b)", "#3b3b3b": "var(--ink, #3b3b3b)", "#2f2f2f": "var(--ink, #2f2f2f)", "#000000": "var(--ink, #000000)",
    "#434343": "var(--ink, #434343)", "#555555": "var(--ink2, #555555)", "#263238": "var(--ink, #263238)", "#3d4447": "var(--ink2, #3d4447)",
    "#828c8d": "var(--muted, #828c8d)", "#98a4a6": "var(--muted, #98a4a6)",
    "#edf0f1": "var(--on-btn, #edf0f1)", "#ffffff": "var(--on-btn, #ffffff)",
};
export function cssColor(c: any): string {
    const k = String(c ?? "").trim().toLowerCase();
    return THEMED[k] ?? String(c);
}

/** Convert a spannable to an HTML fragment. */
export function richToHtml(sb: SpannableStringBuilder): string {
    const text = sb.text;
    if (!text) return "";
    const cuts = new Set<number>([0, text.length]);
    for (const s of sb.spans) { cuts.add(Math.max(0, Math.min(text.length, s.start))); cuts.add(Math.max(0, Math.min(text.length, s.end))); }
    const points = [...cuts].sort((a, b) => a - b);
    let html = "";
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1];
        if (a === b) continue;
        const piece = text.slice(a, b);
        const active = sb.spans.filter((s: Span) => s.start <= a && s.end >= b);
        const style: string[] = [];
        let cls = "";
        for (const s of active) {
            const w = s.what;
            if (w.kind === "style" && (w.style & 1)) style.push("font-weight:700");
            if (w.kind === "style" && (w.style & 2)) style.push("font-style:italic");
            if (w.kind === "color") style.push("color:" + cssColor(w.color));
            if (w.kind === "abssize") style.push(`font-size:${Math.max(10, w.size)}px`);
            if (w.kind === "relsize") style.push(`font-size:${w.size}em`);
            if (w.kind === "font" && w.font === "fa_solid") cls = "fa";
        }
        const body = esc(ExtensionsKt.localizeDollars(piece)).replace(/\n/g, "<br>");
        html += style.length || cls ? `<span${cls ? ` class="${cls}"` : ""}${style.length ? ` style="${style.join(";")}"` : ""}>${body}</span>` : body;
    }
    return html;
}

export function textToHtml(s: string | null | undefined): string {
    return s ? esc(ExtensionsKt.localizeDollars(s)).replace(/\n/g, "<br>") : "";
}
