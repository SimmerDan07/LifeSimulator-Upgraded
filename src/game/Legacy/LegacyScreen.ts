// v0.28.0 Legacy & Inheritance (Profile tab): your estate, your will, a family trust, Switch Life, gifts to your
// children, family heirlooms and what you've inherited. Screens: GenericListType.lifepath key "legacy".
//
// SWITCH LIFE (like BitLife): hand your money, homes, possessions, businesses, investments, pets and heirlooms to one
// of your children and carry on as them, without dying. You can keep 25% or half to retire on. The old you lives on
// as a retired parent in the new life (a vampire stays a vampire and never ages); what they kept comes back as
// inheritance when they die. No inheritance tax (it's a gift while you're alive). Not from a prison cell, not while
// collapsed. It's recorded in your family line as "handed everything to …" (still living).
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Generations } from "../Managers/Generations";
import { LifeMoments } from "../Managers/LifeMoments";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { Appearance } from "../Social/Appearance";
import { Vampire } from "../Lifepaths/Vampire";
import { Legacy, WillMode } from "./Legacy";
import { HEIRLOOM_BY_ID } from "./LegacyData";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;   // shown in the local currency by the UI
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null, 62, null);
const hidden = () => ButtonViewModel.INSTANCE.getHidden();
const btn = (title: string, on: boolean, f: () => void) => new ButtonViewModel(title, null, on, false, !on, false, false, { invoke: () => { if (on) f(); return null; } });
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const row = (image: any, title: string, body: string, b: any = hidden()) => new ActionCellSingleViewModel(image, title, text(body), b, null, null);

export const SwitchLife = {
    /** Why you can't hand over your life right now, or null. */
    block(p: any = player()): string | null {
        try { if (p.getCrimeState().getIsInJail()) return "Not from a prison cell"; } catch { /* ignore */ }
        if (Vampire.isInTorpor(p)) return "Not while you lie collapsed";
        if (!Legacy.children(p).length) return "You have no children yet";
        return null;
    },
    childBlock(c: any): string | null {
        if (c.getAgeInYears() < Generations.minHeirAge()) return `From age ${Generations.minHeirAge()}`;
        return null;
    },
    ask(p: any, child: any) {
        const total = Legacy.liquid(p);
        const name = child.getFirstName();
        const minor = child.getAgeInYears() < 18 ? ` ${name} is ${child.getAgeInYears()}: they'll live with you (their retired parent) until 18.` : "";
        const body = `You'll hand ${name} your money and investments (${money(total)}), every home, possession, business, pet and heirloom, and play on as them.${minor}\n\n` +
            `${p.getFirstName()} retires and lives on in the family (find them on the Love tab). No inheritance tax: it's a gift while you're alive. ` +
            `Whatever you keep comes back as inheritance one day.${Vampire.isVampire(p) ? " As a vampire, the old you will never age." : ""}`;
        LifeMoments.ask(`Switch to ${name}?`, body, Appearance.head(child), [
            ["Hand over everything", () => { Generations.continueAs(child, { handover: { keep: 0 } }); return ""; }],
            [`Keep 25% to retire on (${usd(total * 0.25)})`, () => { Generations.continueAs(child, { handover: { keep: 0.25 } }); return ""; }],
            [`Keep half (${usd(total * 0.5)})`, () => { Generations.continueAs(child, { handover: { keep: 0.5 } }); return ""; }],
            ["Not yet", () => ""],
        ]);
    },
};

export const LegacyScreen = {
    title(_key: string): string { return "Legacy & Inheritance"; },
    /** The Profile tab card. */
    profileCell(p: any = player()): any {
        const s = Legacy.peek(p);
        const w = Legacy.will(p);
        const bits = [w.written ? `Will: ${w.mode === "equal" ? "split between your children" : w.mode === "partner" ? "half to your spouse" : "everything to your heir"}` : "No will yet"];
        if (s?.heirlooms.length) bits.push(`${s.heirlooms.length} heirloom${s.heirlooms.length === 1 ? "" : "s"}`);
        const kids = Legacy.children(p).length;
        if (kids) bits.push(`${kids} ${kids === 1 ? "child" : "children"} who could carry on the family`);
        return new ActionCellSingleViewModel(R.drawable.will, "Legacy & Inheritance", text(`${bits.join(" · ")}.\nYour will, inheritance tax, gifts, heirlooms, and Switch Life (hand everything to a child and play on as them).`),
            new ButtonViewModel("Open", null, true, false, false, false, false, { invoke: () => { Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, "legacy", false, 4, null); return null; } }), null, null);
    },
    cells(_key: string, p: any = player()): any[] {
        const out: any[] = [];
        const s = Legacy.state(p);
        const w = s.will;
        const kids = Legacy.children(p);
        // ---------------------------------------------------------------- estate
        out.push(new HeaderTitleViewModel("Your Estate"));
        const homes = (() => { try { return p.getRealEstate().all().length; } catch { return 0; } })();
        const equity = (() => { try { return Math.round(p.getRealEstate().totalEquity()); } catch { return 0; } })();
        out.push(row(R.drawable.hud_bank, "If You Died Today", `${Legacy.planText(Legacy.plan(p), kids.length ? "the child you continue as" : "your heir")}\n` +
            `${homes ? `Plus ${homes} propert${homes === 1 ? "y" : "ies"} (${money(equity)} after mortgages), ` : ""}possessions, businesses and pets: they always go to your heir, tax-free.\n${Legacy.taxText(p)}`));
        // ---------------------------------------------------------------- will
        out.push(new HeaderTitleViewModel("Your Will"));
        const wp = Legacy.willPrice(p);
        out.push(row(R.drawable.will, w.written ? "Your Will" : "No Will",
            w.written ? `${Legacy.modeText(w.mode)}${w.charity ? ` ${w.charity}% of your money goes to charity.` : ""} Signed at age ${Math.max(0, p.getAgeInYears() - Math.floor((p.calendarWeeks() - w.week) / 48))}. Changing it is free.`
                : `Without a will, probate takes 5% of your money and a brother or sister who gets nothing may contest it. A lawyer writes one for ${wp ? money(wp) : "free (you're a lawyer)"}.`,
            btn(w.written ? "Change" : wp ? money(wp) : "Write", w.written || wp <= cash(p), () => LegacyScreen.willDialog(p))));
        const tp = Legacy.trustPrice(p);
        out.push(row(R.drawable.bank_deposit, "Family Trust", w.trust ? "Set up. Inheritance tax on your estate is halved." : `Halves the inheritance tax on your estate. Needs a will.${Legacy.taxRule(p).rate === 0 ? ` (${p.getCountry().getTitle()} has no inheritance tax, so you don't need one.)` : ""}`,
            w.trust ? hidden() : btn(money(tp), w.written && tp <= cash(p), () => LifeMoments.result("Family Trust", Legacy.setUpTrust(p), R.drawable.bank_deposit))));
        // ---------------------------------------------------------------- switch life
        out.push(new HeaderTitleViewModel("Switch Life"));
        const block = SwitchLife.block(p);
        out.push(row(R.drawable.family, "Hand It All Down", `Give one of your children everything you own and play on as them, without dying. You can keep some money to retire on. The old you lives on in the family.${block ? `\n${block}.` : ""}`));
        for (const c of kids) {
            const cb = SwitchLife.childBlock(c);
            const wealth = (c as any).wealth ? ` · has ${money((c as any).wealth)} of their own` : "";
            out.push(new ActionCellSingleViewModel(Appearance.head(c), c.getFullName(), text(`${c.getAgeInYears()} years old · ${c.getChildStatus?.() ?? ""}${wealth}${cb ? `\n${cb}` : ""}`),
                btn("Switch", !block && !cb, () => SwitchLife.ask(p, c)), null, null));
        }
        // ---------------------------------------------------------------- gifts
        const grown = kids.filter((c) => c.getAgeInYears() >= 18);
        if (grown.length) {
            out.push(new HeaderTitleViewModel("Gifts"));
            out.push(row(R.drawable.hud_cash, "Give While You're Alive", `Gifts aren't taxed, your children love them, and if you later continue as that child, the money is still theirs.${s.gifted ? ` You've given ${money(s.gifted)} so far.` : ""}`));
            for (const c of grown) {
                out.push(new ActionCellSingleViewModel(Appearance.head(c), `Give ${c.getFirstName()} Money`, text((c as any).wealth ? `They have ${money((c as any).wealth)} from you.` : "A head start in life."),
                    btn("Give", cash(p) >= 1000, () => LegacyScreen.giftDialog(p, c)), null, null));
            }
        }
        // ---------------------------------------------------------------- heirlooms
        out.push(new HeaderTitleViewModel("Family Heirlooms"));
        if (!s.heirlooms.length) out.push(row(R.drawable.will, "None Yet", "Parents and grandparents may leave you one: a watch, a ring, a recipe book, a violin… They gain value with every generation and pass down with everything else."));
        for (const h of s.heirlooms) {
            const d = HEIRLOOM_BY_ID[h.id];
            if (!d) continue;
            out.push(new ActionCellSingleViewModel((R.drawable as any)["icon_heirloom_" + d.id.toLowerCase()] ?? (R.drawable as any)[d.fallback], d.title,
                text(`${d.blurb}\nFrom ${h.from}${h.gen ? ` (generation ${h.gen})` : ""} · worth ${money(h.value)}${d.hobby ? ` · taught you some ${d.hobby.id}` : ""}`),
                btn("Sell", true, () => LifeMoments.ask(`Sell the ${d.title}?`, `A dealer offers ${money(h.value)}. It's been in the family for generations.`, (R.drawable as any)[d.fallback], [["Sell it", () => Legacy.sellHeirloom(p, h.id)], ["Keep it", () => ""]])), null, null));
        }
        // ---------------------------------------------------------------- inheritances
        if (s.inherited.length) {
            out.push(new HeaderTitleViewModel("What You've Inherited"));
            for (const x of [...s.inherited].reverse()) out.push(row(R.drawable.will, `From ${x.from}`, `${money(x.amount)} at age ${x.age}.`));
        }
        return out;
    },
    willDialog(p: any) {
        const kids = Legacy.children(p);
        const pt = p.getFamilyState().getPartner();
        const married = (() => { try { return p.getRomanticRelationshipStatus().name() === "married"; } catch { return false; } })();
        const pick = (mode: WillMode) => () => { LegacyScreen.charityDialog(p, mode); return ""; };
        const opts: [string, () => string][] = [["Everything to my heir", pick("heir")]];
        if (kids.length > 1) opts.push(["Split equally between my children", pick("equal")]);
        if (pt != null && pt.getIsAlive() && married) opts.push([`Half to ${pt.getFirstName()}, the rest to my heir`, pick("partner")]);
        opts.push(["Cancel", () => ""]);
        LifeMoments.ask("Your Will", "Who gets your money when you die? (Homes, possessions, businesses, pets and heirlooms always go to the child who carries on the family.)", R.drawable.will, opts);
    },
    charityDialog(p: any, mode: WillMode) {
        const go = (c: number) => () => Legacy.writeWill(p, mode, c);
        LifeMoments.ask("Leave Something to Charity?", "A share of your money for a good cause. It's in your obituary, and your heir will be proud.", R.drawable.philanthrophy_worldhunger,
            [["10%", go(10)], ["25%", go(25)], ["Half", go(50)], ["Nothing", go(0)]]);
    },
    giftDialog(p: any, c: any) {
        const have = cash(p);
        const opts: [string, () => string][] = [];
        for (const n of [10_000, 100_000, 1_000_000, 10_000_000]) if (have >= n) opts.push([usd(n), () => Legacy.gift(p, c, n)]);
        if (have >= 2000) opts.push([`Half your cash (${usd(have / 2)})`, () => Legacy.gift(p, c, Math.floor(have / 2))]);
        opts.push(["Cancel", () => ""]);
        LifeMoments.ask(`A Gift for ${c.getFirstName()}`, `How much? You have ${money(have)} in cash.`, Appearance.head(c), opts);
    },
};
