// v0.28.1 Fewer pop-ups: what happens on its own during the week (random events, life moments, illnesses, crime,
// careers, social media, family news…) is written here instead of popping up. Only holidays still pop up (and the
// few things that need you: dying, naming a baby). The bell in the top bar shows how many are unread and opens the
// list (GenericListType.lifepath key "news"). Settings › Game Settings can turn every pop-up back on.
//
// Choices nobody was asked about are made sensibly (AlertManager.quietChoice): a random question is declined, a
// will is accepted, an emergency gets the first treatment you can afford, a court case gets the public defender.
import { R, SpannableStringBuilder } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";

export interface NewsItem { week: number; age: number; title: string; text: string; image: any; chose?: string; outcome?: string; spans?: any[] }
export interface NewsState { items: NewsItem[]; unread: number }

const MAX = 120;
const player = (): any => { try { return GameStateManager.INSTANCE.getPersonState(); } catch { return null; } };
const textOf = (vm: any): string => {
    try {
        const m = vm.getMessage?.();
        if (m) return String(m);
        const a = vm.getAttributedMessage?.();
        return a ? String(a.toString?.() ?? a) : "";
    } catch { return ""; }
};

export const News = {
    peek(p: any = player()): NewsState | null { return p?.news ?? null; },
    state(p: any = player()): NewsState {
        const s = p.news ?? (p.news = {});
        s.items ??= []; s.unread ??= 0;
        return s as NewsState;
    },
    add(vm: any, chose?: string | null) {
        const p = player();
        if (p == null) return;
        const s = News.state(p);
        const item: NewsItem = { week: (() => { try { return p.calendarWeeks(); } catch { return 0; } })(), age: p.getAgeInYears(), title: String(vm.getTitle?.() ?? ""), text: textOf(vm).trim(), image: vm.getImageId?.() ?? null };
        if (chose) item.chose = chose;
        // keep the icons (+3 happiness etc.) of a styled message: its spans are plain data, so they save fine
        try {
            const m = vm.getMessage?.() ? null : vm.getAttributedMessage?.();
            if (m instanceof SpannableStringBuilder && m.spans.length) {
                const lead = m.text.length - m.text.trimStart().length;
                item.spans = m.spans.map((sp) => ({ what: sp.what, start: sp.start - lead, end: sp.end - lead }));
            }
        } catch { /* plain text is fine */ }
        if (!item.title && !item.text) return;
        // the answer to a question made for you ("Volunteers Needed" → "Maybe next month.") joins the question
        const last = s.items[s.items.length - 1];
        if (last && last.chose && last.outcome == null && last.title === item.title && last.week === item.week) { last.outcome = item.text; return; }
        s.items.push(item);
        if (s.items.length > MAX) s.items.splice(0, s.items.length - MAX);
        s.unread = Math.min(MAX, s.unread + 1);
    },
    unread(p: any = player()): number { return News.peek(p)?.unread ?? 0; },
    markRead(p: any = player()) { if (News.peek(p)) News.state(p).unread = 0; },
    cells(p: any = player()): any[] {
        const s = News.state(p);
        News.markRead(p);
        try { GameStateManager.INSTANCE.getMainGameFragment()?.updateHUD?.(); } catch { /* no UI */ }
        const out: any[] = [];
        if (!s.items.length) {
            out.push(new HeaderTitleViewModel("News"));
            out.push(new ActionCellSingleViewModel(R.drawable.waving_hand, "Nothing Yet", new TextLabelViewModel("What happens in your life while the weeks go by shows up here, instead of popping up.", null, false, false, null, null, 62, null), ButtonViewModel.INSTANCE.getHidden(), null, null));
            return out;
        }
        let lastAge = -1;
        for (const it of [...s.items].reverse()) {
            if (it.age !== lastAge) { out.push(new HeaderTitleViewModel(`Age ${it.age}`)); lastAge = it.age; }
            const after = it.chose ? `→ ${it.chose}${it.outcome ? `: ${it.outcome}` : ""}` : "";
            let body: any;
            if (it.spans?.length) {
                const sb = new SpannableStringBuilder(it.text);
                for (const sp of it.spans) if (sp.start >= 0 && sp.end <= it.text.length) sb.setSpan(sp.what, sp.start, sp.end, 0);
                if (after) sb.append("\n" + after);
                body = sb;
            } else body = [it.text.replace(/[\uf000-\uf8ff]/g, "").trim(), after].filter(Boolean).join("\n");
            out.push(new ActionCellSingleViewModel(it.image ?? R.drawable.waving_hand, it.title, (body instanceof SpannableStringBuilder ? new TextLabelViewModel(body, false, false, null, 14, null) : new TextLabelViewModel(body, null, false, false, null, null, 62, null)), ButtonViewModel.INSTANCE.getHidden(), null, null));
        }
        return out;
    },
};
