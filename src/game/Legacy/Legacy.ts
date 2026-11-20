// v0.28.0 Legacy: wills, inheritance, estate tax, heirlooms and gifts (Profile tab › Legacy & Inheritance).
//
// YOUR ESTATE (when you die and continue as a child, Generations.continueAs → Legacy.settle):
//   money and investments, minus the country's estate tax (ESTATE_TAX: a rate above a tax-free amount; a family
//   trust halves it), minus 5% probate if you never wrote a will, minus your charity bequest. Then your will:
//   "everything to my heir" (the default), "split equally between my children", or "half to my partner" (they keep
//   it as your heir's other parent, and it comes back when they die). Homes, possessions, businesses and pets always
//   go to the heir, tax-free. Without a will, a brother or sister who got nothing may contest it.
// THEIR ESTATES (Person.die → Legacy.onRelativeDeath): parents and partners have money of their own now
//   (Legacy.wealthOf: rolled once, by how well-off the family is). When a parent dies their partner inherits; when
//   the last parent dies, the children split it (closer children get a bigger share), after estate tax, and you
//   can contest a will that short-changes you. A spouse inherits tax-free; an unmarried partner gets nothing.
//   Slayer rule: inherit from someone you murdered and get convicted for it, and the court takes it back.
// HEIRLOOMS: parents and grandparents can leave you one (watches, rings, recipe books, a violin…). Some teach you a
//   hobby, all of them gain value as antiques, and they pass down the line with everything else.
// GIFTS: give money to a grown child while you're alive: no tax, and if you later continue as them, it's theirs.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Relationship } from "../Enums/Relationship";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { LifeMoments } from "../Managers/LifeMoments";
import { Hobbies } from "../Managers/Hobbies";
import { Relationships } from "../Social/Relationships";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { COUNTRY_BY_ID } from "../World/WorldData";
import { ESTATE_TAX, HEIRLOOMS, HEIRLOOM_BY_ID } from "./LegacyData";

export type WillMode = "heir" | "equal" | "partner";
export interface WillState { written: boolean; mode: WillMode; charity: number; trust: boolean; week: number }
export interface Heirloom { id: string; from: string; value: number; gen: number }
export interface LegacyState {
    will: WillState;
    heirlooms: Heirloom[];
    gifted: number;
    inherited: { from: string; amount: number; age: number }[];
}
export interface EstatePlan {
    money: number; tax: number; probate: number; charity: number; partner: number;
    others: { id: string; name: string; amount: number }[];
    heir: number; taxRate: number; taxFree: number;
}

const WPY = 48;
const player = (): any => GameStateManager.INSTANCE.getPersonState();
const now = (p: any): number => { try { return p.calendarWeeks(); } catch { return 0; } };
const roll = (x: number) => Math.random() < x;
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const give = (p: any, n: number, why: string) => { if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.workIncome, why, null, 12, null); };
const take = (p: any, n: number, why: string) => { if (n > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(-Math.round(n)), MoneyUpdateType.directSpend, why, null, 8, null); };
const alive = (x: any) => { try { return x.getIsAlive(); } catch { return !!x?.isAlive; } };

export const Legacy = {
    peek(p: any = player()): LegacyState | null { return p?.legacy ?? null; },
    state(p: any = player()): LegacyState {
        const s = p.legacy ?? (p.legacy = {});
        s.will ??= { written: false, mode: "heir", charity: 0, trust: false, week: -1 };
        s.heirlooms ??= []; s.gifted ??= 0; s.inherited ??= [];
        return s as LegacyState;
    },
    will(p: any = player()): WillState { return Legacy.state(p).will; },

    // ------------------------------------------------------------------ estate tax
    taxRule(p: any = player()): { rate: number; exempt: number } { return ESTATE_TAX[p.getCountry().name()] ?? { rate: 0, exempt: 0 }; },
    estateTax(p: any, base: number, trust = Legacy.will(p).trust): number {
        const r = Legacy.taxRule(p);
        return Math.max(0, Math.round((base - r.exempt) * r.rate * (trust ? 0.5 : 1)));
    },
    taxText(p: any = player()): string {
        const r = Legacy.taxRule(p);
        const c = p.getCountry().getTitle();
        if (r.rate === 0) return `${c} has no inheritance tax.`;
        return `Inheritance tax in ${c}: ${Math.round(r.rate * 100)}% of money and investments${r.exempt ? ` above ${money(r.exempt)}` : ""}${Legacy.will(p).trust ? " (halved by your family trust)" : ""}. Homes pass tax-free.`;
    },

    // ------------------------------------------------------------------ your estate
    /** Money and investments (minus the loan), the part a will splits. */
    liquid(p: any = player()): number {
        const m = p.getMoneyState();
        let v = Number(m.getCash().add(m.getSavings()).subtract(m.getLoanLimitUsed()).toString());
        try { v += Number(p.getStockState().getTotalValue().toString()); } catch { /* none */ }
        return Math.max(0, v);
    },
    /** Living children who could inherit, oldest first. */
    children(p: any = player()): any[] {
        try { return (Array.from(p.getFamilyState().getAliveChildren() as any) as any[]).filter((c) => !c.getNotYetBorn()); } catch { return []; }
    },
    plan(p: any = player(), heir: any = null): EstatePlan {
        const w = Legacy.will(p);
        const total = Legacy.liquid(p);
        const r = Legacy.taxRule(p);
        const tax = Legacy.estateTax(p, total);
        let rest = total - tax;
        const probate = w.written ? 0 : Math.round(rest * 0.05);
        rest -= probate;
        const charity = Math.round(rest * (w.charity / 100));
        rest -= charity;
        let partner = 0;
        const pt = p.getFamilyState().getPartner();
        const married = p.getRomanticRelationshipStatus?.() === RomanticRelationshipStatus.married;
        if (w.mode === "partner" && pt != null && alive(pt) && married) { partner = Math.round(rest / 2); rest -= partner; }
        const others: EstatePlan["others"] = [];
        if (w.mode === "equal") {
            const kids = Legacy.children(p);
            const n = Math.max(1, kids.length);
            const share = Math.round(rest / n);
            for (const k of kids) if (heir == null || k.getId() !== heir.getId()) others.push({ id: k.getId(), name: k.getFirstName(), amount: share });
            if (heir == null && others.length) others.pop();   // one share stays with whoever you continue as
            rest -= share * others.length;
        }
        return { money: total, tax, probate, charity, partner, others, heir: Math.max(0, rest), taxRate: r.rate, taxFree: r.exempt };
    },
    planText(e: EstatePlan, heirName = "your heir"): string {
        const lines = [`Money and investments: ${money(e.money)}`];
        if (e.tax) lines.push(`Inheritance tax: −${money(e.tax)}`);
        if (e.probate) lines.push(`Probate (no will): −${money(e.probate)}`);
        if (e.charity) lines.push(`To charity: −${money(e.charity)}`);
        if (e.partner) lines.push(`To your partner: −${money(e.partner)}`);
        for (const o of e.others) lines.push(`To ${o.name}: −${money(o.amount)}`);
        lines.push(`To ${heirName}: ${money(e.heir)}`);
        return lines.join("\n");
    },
    /**
     * Death: carry out the will (Generations.continueAs). Returns the money the heir gets and lines for the alert.
     * Call before the heir becomes the player; `siblingHook` runs after their brothers and sisters exist.
     */
    settle(parent: any, child: any): { heir: number; lines: string[]; after: (heir: any) => void } {
        const w = Legacy.will(parent);
        const e = Legacy.plan(parent, child);
        const lines: string[] = [];
        if (e.tax) lines.push(`Inheritance tax took ${money(e.tax)}.`);
        if (e.probate) lines.push(`With no will, probate cost ${money(e.probate)}.`);
        if (e.charity) lines.push(`${money(e.charity)} went to charity, as ${parent.getFirstName()} wished.`);
        const pt = parent.getFamilyState().getPartner();
        if (e.partner && pt != null) { pt.wealth = (Legacy.wealthOf(pt) ?? 0) + e.partner; lines.push(`${pt.getFirstName()} received ${money(e.partner)}.`); }
        if (e.others.length) lines.push(`Your brothers and sisters each received ${money(e.others[0].amount)}.`);
        const others = e.others;
        const heirloomsBefore = Legacy.state(parent).heirlooms.length;
        const after = (heir: any) => {
            // brothers and sisters: their shares (and the feelings about them)
            const sibs = Relationships.siblings(heir);
            for (const s of sibs) {
                const o = others.find((x) => x.id === s.id);
                if (o) { (s as any).wealth = ((s as any).wealth ?? 0) + o.amount; s.setRelationshipProgress(Math.min(1000, s.getRelationshipProgress() + 100)); }
            }
            Legacy.passDown(parent, heir);
            if (e.charity) { try { heir.getAttributeState().setDeltaValueImmediate(new Modifiers(0, 5, 3)); } catch { /* ignore */ } }
            // no will: a brother or sister who got nothing may contest it
            if (!w.written && others.length === 0 && sibs.length && e.heir > 50_000 && roll(0.5)) Legacy.contestedByMoment(heir, sibs[Math.floor(Math.random() * sibs.length)], e.heir);
        };
        if (heirloomsBefore) lines.push(`${heirloomsBefore} family heirloom${heirloomsBefore === 1 ? "" : "s"} passed to you.`);
        return { heir: e.heir, lines, after };
    },
    contestedByMoment(heir: any, sib: any, amount: number) {
        const share = Math.round(amount / 2);
        const fee = Math.round(Math.max(5000, amount * 0.04));
        setTimeout0(() => LifeMoments.ask("The Will Is Contested", `${sib.getFirstName()} says your parent never meant to leave them nothing, and they've hired a lawyer. They want ${money(share)}.`, R.drawable.will, [
            [`Settle: give them ${money(Math.round(share / 2))}`, () => { take(heir, Math.round(share / 2), "Will settlement"); sib.setRelationshipProgress(Math.min(1000, sib.getRelationshipProgress() + 150)); return `You settled. ${sib.getFirstName()} is grateful, and you're still family.`; }],
            [`Fight it in court (${money(fee)})`, () => {
                take(heir, fee, "Lawyer");
                sib.setRelationshipProgress(Math.max(0, sib.getRelationshipProgress() - 300));
                if (roll(0.6)) return `The judge upheld everything. ${sib.getFirstName()} isn't speaking to you.`;
                take(heir, share, "Court-ordered share");
                return `You lost: ${sib.getFirstName()} gets ${money(share)}, and the family is split.`;
            }],
            [`Give them ${money(share)} (half)`, () => { take(heir, share, "Will settlement"); sib.setRelationshipProgress(Math.min(1000, sib.getRelationshipProgress() + 300)); return `Fair is fair. ${sib.getFirstName()} hugged you at the door.`; }],
        ]));
    },

    // ------------------------------------------------------------------ will & planning (Legacy screen)
    willPrice(p: any = player()): number { return Legacy.isLawyer(p) ? 0 : 1000; },
    trustPrice(p: any = player()): number { return Legacy.isLawyer(p) ? 5000 : 25000; },
    isLawyer(p: any): boolean { try { return p.getJobState().getCurrentJob()?.name?.() === "lawyer"; } catch { return false; } },
    writeWill(p: any, mode: WillMode, charity: number): string {
        const w = Legacy.will(p);
        const cost = w.written ? 0 : Legacy.willPrice(p);
        if (cost > cash(p)) return `A lawyer charges ${money(cost)} to write a will.`;
        take(p, cost, "Will");
        Object.assign(w, { written: true, mode, charity, week: now(p) });
        return `Your will is signed and witnessed${cost ? ` (${money(cost)})` : ""}. ${Legacy.modeText(mode)}${charity ? ` ${charity}% goes to charity.` : ""}`;
    },
    modeText(mode: WillMode): string {
        return mode === "equal" ? "Your money is split equally between your children." : mode === "partner" ? "Half your money goes to your spouse, the rest to your heir." : "Everything goes to the child who carries on the family line.";
    },
    setUpTrust(p: any): string {
        const w = Legacy.will(p);
        if (!w.written) return "You need a will first.";
        const c = Legacy.trustPrice(p);
        if (c > cash(p)) return `Setting up a trust costs ${money(c)}.`;
        take(p, c, "Family trust");
        w.trust = true;
        return `Your family trust is set up (${money(c)}). Inheritance tax on your estate is halved.`;
    },
    /** A gift to a grown child: tax-free, and theirs if you ever continue as them. */
    gift(p: any, child: any, amount: number): string {
        if (amount > cash(p)) return "You don't have that much cash.";
        take(p, amount, `Gift to ${child.getFirstName()}`);
        child.wealth = (child.wealth ?? 0) + amount;
        child.setRelationshipProgress(Math.min(1000, child.getRelationshipProgress() + Math.min(300, 30 + Math.round(amount / 2000))));
        Legacy.state(p).gifted += amount;
        return `You gave ${child.getFirstName()} ${money(amount)}. Gifts while you're alive aren't taxed, and it's theirs to keep.`;
    },

    // ------------------------------------------------------------------ other people's money
    /** What a relative has to leave (rolled once). Parents: by how well-off the family is. */
    wealthOf(x: any): number {
        if (x == null) return 0;
        if (typeof x.wealth === "number") return x.wealth;
        const age = x.getAgeInYears?.() ?? 40;
        let w = 0;
        const rel = x.getRelationship?.();
        if (rel === Relationship.parent || x.kind === "grandparent") {
            const r = Math.random();
            w = r < 0.08 ? 0 : r < 0.6 ? 20_000 + Math.random() * 130_000 : r < 0.9 ? 150_000 + Math.random() * 450_000 : r < 0.98 ? 600_000 + Math.random() * 2_400_000 : 3_000_000 + Math.random() * 17_000_000;
            if (x.kind === "grandparent") w *= 0.4;
        } else if (rel === Relationship.lover) {
            w = Math.max(0, (age - 20) * (2000 + Math.random() * 6000));
        } else w = 0;
        try { w *= COUNTRY_BY_ID[player().getCountry().name()]?.value ?? 1; } catch { /* ignore */ }
        x.wealth = Math.round(w);
        return x.wealth;
    },
    wealthLabel(n: number): string {
        return n <= 0 ? "Broke" : n < 50_000 ? "Getting by" : n < 200_000 ? "Comfortable" : n < 700_000 ? "Well-off" : n < 3_000_000 ? "Wealthy" : "Rich";
    },
    /** Person.die: parents and partners leave what they had. */
    onRelativeDeath(member: any) {
        const p = player();
        if (p == null || member == null) return;
        try { Legacy.closeFormerLife(member); } catch { /* ignore */ }
        const rel = member.getRelationship?.();
        if (rel === Relationship.parent) {
            const parents = (Array.from(p.getFamilyState().getParents() as any) as any[]);
            const other = parents.find((x) => x !== member && alive(x));
            const w = Legacy.wealthOf(member);
            if (other != null) {
                other.wealth = Legacy.wealthOf(other) + w;
                member.wealth = 0;
                if (w > 0) LifeMoments.banner("The Will", `${member.getFirstName()} left everything to ${other.getFirstName()}.`);
                return;
            }
            // the last parent: their children split it
            Legacy.willReading(p, member, w + 0);
            member.wealth = 0;
            return;
        }
        if (rel === Relationship.lover) {
            const w = Legacy.wealthOf(member);
            member.wealth = 0;
            const married = p.getRomanticRelationshipStatus?.() === RomanticRelationshipStatus.married;
            if (!married) { if (w > 20_000) LifeMoments.banner("The Will", `You weren't married, so ${member.getFirstName()}'s savings went to their family.`); return; }
            if (w <= 0) return;
            setTimeout0(() => {
                give(p, w, `Inheritance from ${member.getFirstName()}`);
                Legacy.record(p, member.getFirstName(), w);
                Legacy.slayerCheck(p, member, w);
                LifeMoments.result("Inheritance", `${member.getFirstName()} left you everything: ${money(w)}. Between spouses, it's tax-free.`, R.drawable.will);
            });
        }
    },
    /** The last parent is gone: read the will. */
    willReading(p: any, parent: any, estate: number) {
        const sibs = Relationships.siblings(p).filter((s) => s.getIsAlive());
        const tax = Legacy.estateTax(p, estate, false);
        const net = Math.max(0, estate - tax);
        const status = (() => { try { return parent.getRelationshipProgress(); } catch { return 500; } })();
        const myWeight = status >= 900 ? 1.5 : status >= 700 ? 1.25 : status >= 400 ? 1 : status >= 200 ? 0.6 : 0.25;
        const total = myWeight + sibs.length;
        const mine = Math.round(net * myWeight / total);
        const equal = Math.round(net / (1 + sibs.length));
        const heirloom = roll(0.5) ? Legacy.randomHeirloom(p) : null;
        const lines = [`${parent.getFirstName()}'s estate: ${money(estate)}.`];
        if (tax) lines.push(`Inheritance tax: ${money(tax)}.`);
        if (sibs.length) lines.push(`Split between ${sibs.length + 1} children${myWeight > 1 ? ": you were close, so you got a bigger share" : myWeight < 1 ? ": you weren't close, so you got a smaller share" : ""}.`);
        lines.push(`You inherit ${money(mine)}.`);
        if (heirloom) lines.push(`And ${parent.getFirstName()} wanted you to have the ${HEIRLOOM_BY_ID[heirloom].title.toLowerCase()}.`);
        if (estate <= 0) lines.splice(0, lines.length, `${parent.getFirstName()} didn't leave any money, only memories.${heirloom ? ` And the ${HEIRLOOM_BY_ID[heirloom].title.toLowerCase()}.` : ""}`);
        const pay = (n: number) => { give(p, n, `Inheritance from ${parent.getFirstName()}`); Legacy.record(p, parent.getFirstName(), n); Legacy.slayerCheck(p, parent, n); if (heirloom) Legacy.addHeirloom(p, heirloom, parent.getFirstName(), true); for (const s of sibs) (s as any).wealth = ((s as any).wealth ?? 0) + Math.round((net - n) / Math.max(1, sibs.length)); };
        const opts: [string, () => string][] = [["Accept", () => { pay(mine); return ""; }]];
        if (mine < equal * 0.9 && sibs.length) {
            const fee = Math.round(Math.max(3000, (equal - mine) * 0.15));
            opts.push([`Contest the will (${money(fee)})`, () => {
                if (fee > cash(p) + mine) { pay(mine); return "You couldn't afford a lawyer."; }
                if (roll(0.55)) { pay(equal); take(p, fee, "Lawyer"); for (const s of sibs) s.setRelationshipProgress(Math.max(0, s.getRelationshipProgress() - 150)); return `The court split it equally: you get ${money(equal)} (minus ${money(fee)} for the lawyer). Your siblings are annoyed.`; }
                pay(mine); take(p, fee, "Lawyer"); return `The will stands. You keep ${money(mine)}, minus the lawyer.`;
            }]);
        }
        setTimeout0(() => LifeMoments.ask(`The Will of ${parent.getFirstName()}`, lines.join("\n"), R.drawable.will, opts, { quiet: "positive" }));
    },
    record(p: any, from: string, amount: number) {
        if (amount <= 0) return;
        const s = Legacy.state(p);
        s.inherited.push({ from, amount: Math.round(amount), age: p.getAgeInYears() });
        if (s.inherited.length > 30) s.inherited.splice(0, s.inherited.length - 30);
    },
    /** Slayer rule: an open murder case for this person remembers the inheritance (Crime takes it back on conviction). */
    slayerCheck(p: any, victim: any, amount: number) {
        try {
            const name = victim.getFullName?.() ?? victim.getFirstName();
            // already convicted of killing them (caught on the spot): the court takes it straight back
            if ((p.crime?.record ?? []).some((r: any) => (r.victims ?? []).includes(name))) {
                take(p, amount, "Forfeited inheritance");
                LifeMoments.banner("Slayer Rule", `You were convicted of killing ${victim.getFirstName()}, so you can't keep what they left you.`);
                return;
            }
            const c = (p.crime?.open ?? []).find((x: any) => x.murder && x.victim === name);
            if (c) c.inherited = (c.inherited ?? 0) + Math.round(amount);
        } catch { /* ignore */ }
    },
    /** Crime.convict: a murderer can't keep what they inherited from their victim. */
    forfeit(p: any, cases: any[]): string | null {
        const n = cases.reduce((t, c) => t + (c.inherited ?? 0), 0);
        if (n <= 0) return null;
        take(p, n, "Forfeited inheritance");
        return `The court ordered you to give back the ${money(n)} you inherited from your victim.`;
    },

    // ------------------------------------------------------------------ heirlooms
    randomHeirloom(p: any): string | null {
        const have = new Set(Legacy.state(p).heirlooms.map((h) => h.id));
        const free = HEIRLOOMS.filter((h) => !have.has(h.id));
        return free.length ? free[Math.floor(Math.random() * free.length)].id : null;
    },
    addHeirloom(p: any, id: string, from: string, teach = true): Heirloom | null {
        const d = HEIRLOOM_BY_ID[id];
        if (d == null) return null;
        const s = Legacy.state(p);
        if (s.heirlooms.some((h) => h.id === id)) return null;
        const h: Heirloom = { id, from, value: d.value, gen: p.getGeneration?.() ?? 1 };
        s.heirlooms.push(h);
        if (teach && d.hobby) { try { const hs = Hobbies.state(d.hobby.id, p); hs.skill = Math.min(100, (hs.skill ?? 0) + d.hobby.skill); } catch { /* ignore */ } }
        return h;
    },
    /** Your heirlooms (worth 25% more each generation) and gifts the heir already had go down the line. */
    passDown(parent: any, heir: any) {
        const from = Legacy.peek(parent);
        if (!from) return;
        const hs = Legacy.state(heir);
        for (const h of from.heirlooms) {
            if (hs.heirlooms.some((x) => x.id === h.id)) continue;
            hs.heirlooms.push({ ...h, value: Math.round(h.value * 1.25) });
            const d = HEIRLOOM_BY_ID[h.id];
            if (d?.hobby) { try { const st = Hobbies.state(d.hobby.id, heir); st.skill = Math.min(100, (st.skill ?? 0) + d.hobby.skill); } catch { /* ignore */ } }
        }
        from.heirlooms = [];
    },
    sellHeirloom(p: any, id: string): string {
        const s = Legacy.state(p);
        const h = s.heirlooms.find((x) => x.id === id);
        if (!h) return "";
        s.heirlooms = s.heirlooms.filter((x) => x !== h);
        give(p, h.value, "Sold an heirloom");
        try { p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, -5, -2)); } catch { /* ignore */ }
        return `You sold the ${HEIRLOOM_BY_ID[h.id].title.toLowerCase()} for ${money(h.value)}. It felt wrong. (−5 happiness)`;
    },

    // ------------------------------------------------------------------ Switch Life records
    /** A retired former player (now a parent in your family) died: finish their life record. */
    closeFormerLife(member: any) {
        const id = member.formerLifeId;
        if (!id) return;
        const recs: any[] = GameStateManager.INSTANCE.getGlobalStateManager()?.getCemetaryState?.()?.records ?? [];
        const r = recs.find((x) => x.id === id);
        if (!r) return;
        const age = member.getAgeInYears();
        r.alive = false;
        const handed = r.retired?.age ?? r.age;
        r.age = age;
        r.trueAge = member.getTrueAgeInYears?.() ?? age;
        r.cause = member.deathReason ? String(member.deathReason) : "Old age";
        r.obituary = `${r.name} died at the age of ${age}, ${age - handed} year${age - handed === 1 ? "" : "s"} after handing everything down to ${r.retired?.to ?? "a child"}. ` + String(r.obituary ?? "").replace(/^[^.]*\.\s*/, "");
    },
};

/** Run after the current alert or week (alerts opened from inside a death alert queue up). */
function setTimeout0(f: () => void) { try { f(); } catch { /* ignore */ } }
void WPY;
