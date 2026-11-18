// Page state for long lists (v0.18.0): Family Line, cemetery, big groups of relatives.
// Pages are 1-based; the state lives for the session (it isn't saved).
import { PagerViewModel } from "./PersonCardViewModel";
import { UIBridge } from "../ui/bridge";

const state = new Map<string, number>();

export const Paging = {
    pages(count: number, size: number): number { return Math.max(1, Math.ceil(count / size)); },
    /** The current page for `key` (first or last page by default), clamped to 1..pages. */
    get(key: string, pages: number, start: "first" | "last" = "first"): number {
        const p = state.get(key) ?? (start === "last" ? pages : 1);
        return Math.min(pages, Math.max(1, p));
    },
    set(key: string, page: number) { state.set(key, page); },
    reset(key?: string) { if (key) state.delete(key); else state.clear(); },
    /** One page of `items`. */
    slice<T>(items: T[], key: string, size: number, start: "first" | "last" = "first"): { items: T[]; page: number; pages: number; from: number; to: number } {
        const pages = Paging.pages(items.length, size);
        const page = Paging.get(key, pages, start);
        const from = (page - 1) * size;
        return { items: items.slice(from, from + size), page, pages, from: from + 1, to: Math.min(items.length, from + size) };
    },
    /** Page controls that re-render the list screen `type` in place. */
    pager(key: string, page: number, pages: number, label: string, type: any): PagerViewModel {
        return new PagerViewModel(key, page, pages, label, (n: number) => {
            Paging.set(key, Math.min(pages, Math.max(1, Math.round(n))));
            UIBridge.reloadGenericList(type);
        });
    },
};
