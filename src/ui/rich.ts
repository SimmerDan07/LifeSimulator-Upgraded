// Renders Android-style SpannableStringBuilder rich text to HTML.
import { SpannableStringBuilder, Span } from "../game/runtime";
import { Utils } from "../game/Utils/Utils";
import { ExtensionsKt } from "../game/Utils/ExtensionsKt";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function colorOf(id: any): string | null {
    if (id == null) return null;
    return Utils.INSTANCE.getColor(id);
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
            if (w.kind === "color") style.push("color:" + w.color);
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
