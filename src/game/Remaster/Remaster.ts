// v0.36.0 The Remaster: what the weekly tick calls (Player.collectWeeklyValues / applyWeeklyInner / leisureAction).
import { Bank } from "./Bank";
import { Things } from "./Things";
import { Body } from "./Body";
import { Fun } from "./Fun";
import { Traits } from "./Traits";
import { Feats } from "./Feats";

const safe = (f: () => void) => { try { f(); } catch (e) { console.error(e); } };
export const Remaster = {
    enabled: true,
    collectWeeklyValues(p: any) {
        if (!Remaster.enabled) return;
        safe(() => Bank.collectWeeklyValues(p));
        safe(() => Things.collectWeeklyValues(p));
        safe(() => Body.collectWeeklyValues(p));
        safe(() => Traits.collectWeeklyValues(p));
    },
    afterWeek(p: any) {
        if (!Remaster.enabled) return;
        safe(() => Bank.afterWeek(p));
        safe(() => Things.afterWeek(p));
        safe(() => Body.afterWeek(p));
        safe(() => Traits.afterWeek(p));
        safe(() => Feats.afterWeek(p));
    },
    onLeisure(p: any, l: any) { if (Remaster.enabled) safe(() => Fun.onLeisure(p, l, Fun.current)); },
    onNewYear(p: any) { if (Remaster.enabled) safe(() => Bank.onNewYear(p)); },
};
