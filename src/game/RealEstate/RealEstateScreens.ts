// Property System Overhaul — screens and notifications.
// Built from the game's own view models so they render with the existing list UI.
import { ArrayList, SpannableStringBuilder } from "../runtime";
import { AgeLimits } from "../Managers/Schooling";
import { R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { AlertActionViewModel } from "../Managers/AlertActionViewModel";
import { AlertType } from "../Managers/AlertType";
import { GenericListType } from "../Fragments/GenericListType";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { SingleButtonViewModel } from "../Models/SingleButtonViewModel";
import { ProgressBarCellViewModel } from "../Models/ProgressBarCellViewModel";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { Relationship } from "../Enums/Relationship";
import { Modifiers } from "../Managers/Modifiers";
import { Housing } from "../Enums/Housing";
import { HousingState } from "../Managers/HousingState";
import { BigInteger } from "../runtime";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { RealEstatePortfolio, RealEstateEvent } from "./RealEstatePortfolio";
import { OwnedProperty, conditionLabel } from "./OwnedProperty";
import { BASIC_HOUSING, PROPERTY_TYPES, RENOVATIONS, RENOVATION_LEVELS, PROBLEMS, UPKEEP, RE } from "./RealEstateConfig";

type Line = [string, string, string?]; // label, value, optional colour

const player = () => GameStateManager.INSTANCE.getPersonState();
const portfolio = () => player().getRealEstate();
const money = (n: number) => RealEstatePortfolio.money(n);
const img = (p: OwnedProperty) => (R.drawable as any)[p.info()?.image ?? "housing_house"];
/** "+1.3 😊 +0.3 🧠" for a home's weekly comfort. */
function comfortSb(sb: any, pf: RealEstatePortfolio, p: OwnedProperty) {
    const c = pf.homeComfort(p);
    ExtensionsKt.appendAttributesString$default(sb, new Modifiers(0, Math.round(c.happiness * 10) / 10, Math.round(c.sanity * 10) / 10), null, null, null, 14, null);
}
const act = (fn: () => void) => ({ invoke: () => { fn(); return null; } });

function text(s: string, bold = false): TextLabelViewModel { return new TextLabelViewModel(s, null, bold, false, null, null); }
function rich(lines: Line[]): TextLabelViewModel {
    const sb = new SpannableStringBuilder("");
    lines.forEach(([k, v, c], i) => {
        if (k) ExtensionsKt.appendBold$default(sb, k + ": ", null, null, null, 14, null);
        ExtensionsKt.appendNormal$default(sb, v, c ?? null, null, null, c ? 12 : 14, null);
        if (i < lines.length - 1) ExtensionsKt.appendNewline(sb);
    });
    return new TextLabelViewModel("", null, false, false, null, sb);
}
function button(title: string, enabled: boolean, fn: () => void): ButtonViewModel {
    return new ButtonViewModel(title, null, enabled, false, false, true, false, act(fn));
}
function label(id: string, lines: Line[]) { return new SingleLabelCellViewModel(id, rich(lines)); }
function cell(image: any, title: string, lines: Line[], buttons: ButtonViewModel[]) {
    return new ActionCellMultipleOptionsViewModel(image, title, rich(lines), text(""), buttons, null);
}
const signed = (n: number) => (n >= 0 ? "+" : "−") + money(Math.abs(n));
const pct = (n: number) => `${n >= 0 ? "+" : ""}${Math.round(n * 100)}%`;
const ago = (weeks: number) => {
    const y = Math.floor(weeks / RE.weeksPerYear);
    return y >= 1 ? `${y} yr${y === 1 ? "" : "s"}` : `${weeks} wk${weeks === 1 ? "" : "s"}`;
};
const when = (weeks: number) => (weeks <= 0 ? "This week" : `${ago(weeks)} ago`);
const useLabel = (p: OwnedProperty, pf: RealEstatePortfolio, pl: any): string => {
    switch (p.use) {
        case "residence": return "Your home";
        case "family": return "Family home — " + p.occupants.map((id) => RealEstatePortfolio.familyMember(pl, id)?.getFirstName() ?? "?").join(", ");
        case "rental":
            if (p.info().multiUnit || p.isBlock()) return `Rental — ${Math.round(pf.occupancyShare(p) * 100)}% let`;
            return p.tenant ? `Rental — tenant ${p.tenant.name}` : "Rental — looking for a tenant";
        default: return "Vacant";
    }
};
const condColor = (c: number) => (c >= 75 ? R.color.flatGreen : c >= 50 ? R.color.flatOrange : R.color.flatRed);

export const RealEstateScreens = {
    // ---------------------------------------------------------------- navigation helpers
    open(type: GenericListType, key = "") { Utils.INSTANCE.navigateTo(type, key, true); },
    reload() {
        for (const t of [GenericListType.realEstate, GenericListType.propertyDetails, GenericListType.propertyMarket, GenericListType.propertyRenovations, GenericListType.propertyFamily, GenericListType.rentalMarket]) {
            try { Utils.INSTANCE.reloadGenericList(t); } catch { /* not open */ }
        }
    },
    alert(title: string, msg: string, image: any = R.drawable.housing_house) {
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null);
    },
    banner(title: string, msg: string, image: any = R.drawable.housing_house) {
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, AlertType.Banner), false, 2, null);
    },
    /** Alert with a confirm button (and optional extra buttons) plus Cancel. */
    confirm(title: string, msg: string, image: any, ok: string, fn: () => void, extra: [string, () => void][] = [], cancel = "Cancel") {
        const extras = extra.map(([t, f]) => new AlertActionViewModel(t, act(f)));
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null,
            new AlertActionViewModel(ok, act(fn)), new AlertActionViewModel(cancel, act(() => {})), extras.length ? extras : null, AlertType.Alert, 0, null), false, 2, null);
    },
    /** Runs an action; shows its error if it returned one. */
    run(title: string, result: string | null, image?: any) {
        if (result && !result.startsWith("ok:")) RealEstateScreens.alert(title, result, image);
        else if (result) RealEstateScreens.alert(title, result.slice(3), image);
        RealEstateScreens.reload();
    },

    // ---------------------------------------------------------------- weekly news
    notify(events: RealEstateEvent[]) {
        if (!events?.length) return;
        try {
            const pf = portfolio();
            const home = pf.residence();
            const others: RealEstateEvent[] = [];
            for (const e of events) {
                if (e.kind === "problem" && home && e.id === home.id && e.problem) {
                    const pr = PROBLEMS[e.problem];
                    const pro = pf.repairCost(home, e.problem);
                    const diy = pr.diy && !home.info().multiUnit;
                    const extra: [string, () => void][] = diy ? [[`Fix it yourself (${money(pro * RE.diyCostShare)})`, () => RealEstateScreens.run(pr.label, pf.repair(player(), home.id, e.problem!, true), img(home))]] : [];
                    RealEstateScreens.confirm(pr.label, `${pr.description} at your home, ${home.name}. Left alone it will keep damaging the place and make you unhappy.`, img(home),
                        `Hire a pro (${money(pro)})`, () => RealEstateScreens.run(pr.label, pf.repair(player(), home.id, e.problem!, false), img(home)), extra, "Deal with it later");
                } else if (e.kind === "mortgagePaid") {
                    RealEstateScreens.alert("Mortgage Paid Off", e.text);
                } else if (e.kind !== "tenantFound") others.push(e);
            }
            const problems = others.filter((e) => e.kind === "problem");
            if (problems.length) RealEstateScreens.banner("Property Maintenance", problems[0].text + (problems.length > 1 ? ` (+${problems.length - 1} more)` : "") + " See Real Estate.");
            for (const e of others.filter((e) => e.kind === "market")) RealEstateScreens.banner("Housing Market", e.text);
            const left = others.filter((e) => e.kind === "tenantLeft");
            if (left.length) RealEstateScreens.banner("Tenant Moved Out", left[0].text + (left.length > 1 ? ` (+${left.length - 1} more)` : ""));
        } catch (err) { console.warn("real estate notify", err); }
    },

    // ---------------------------------------------------------------- Profile tab summary (shown above the classic Housing list)
    /** The Profile tab's whole Housing section: where you live + entry to Real Estate. */
    profileSummary(content: ArrayList<any>) {
        const pl = player(), pf = portfolio();
        pf.reconcile(pl);
        const n = pf.all().length;
        const rent = pf.all().reduce((s, p) => s + pf.weeklyRent(p), 0);
        const costs = pf.all().reduce((s, p) => s + pf.weeklyCosts(p), 0);
        const cur = pl.getHousingState().currentHousing().getType();
        const home = pf.residence();
        const lease = pf.lease;
        const lines: Line[] = [["Living in", home ? `${home.name} (your home)` : lease ? `${lease.name} (renting, ${money(lease.leaseRent ?? 0)}/week)` : `${cur.getTitle()}${RealEstateScreens.rentText(cur)}`]];
        if (n) {
            lines.push(["Properties", String(pf.all().reduce((s, p) => s + p.units, 0))], ["Equity", money(pf.totalEquity())],
                ["Net per week", signed(rent - costs), rent - costs >= 0 ? R.color.flatGreen : R.color.flatRed]);
        } else lines.push(["", "Rent a place, or buy homes and investment properties, renovate them, rent them out and pass them down."]);
        const sb = rich(lines).getStringBuilder();
        ExtensionsKt.appendNewline(sb);
        if (home ?? lease) comfortSb(sb, pf, (home ?? lease)!);
        else ExtensionsKt.appendAttributesString$default(sb, cur.getModifiers(), null, null, null, 14, null);
        content.add(new ActionCellMultipleOptionsViewModel(home ? img(home) : lease ? img(lease) : cur.getImageId(), "Real Estate", new TextLabelViewModel("", null, false, false, null, sb), text(""), [
            button("Open Real Estate", true, () => RealEstateScreens.open(GenericListType.realEstate)),
            button("Find a Home", true, () => RealEstateScreens.open(GenericListType.propertyMarket)),
        ], null));
    },

    rentText(h: any): string {
        const r = h.getRentalCost?.();
        if (r == null || r.signum() <= 0) return "";
        return ` — rent ${ExtensionsKt.numberDisplayString(r, true)}/week`;
    },

    /** Moves into a rented place (original rules: pets limit, owned homes are lived in rent-free). */
    rentPlace(h: any) {
        const pl = player();
        if (h.getNumberOfPetsAllowed() < pl.getFamilyState().getAlivePets().size()) { AlertManager.INSTANCE.showTooManyPetsAlert(h); return; }
        pl.getHousingState().moveHere(h);
        portfolio().reconcile(pl);
        RealEstateScreens.reload();
        const f = GameStateManager.INSTANCE.getMainGameFragment();
        if (f != null) f.updateUI(null);
    },

    // ---------------------------------------------------------------- overview
    overview(): GenericListFragmentViewModel {
        const pl = player(), pf = portfolio();
        pf.reconcile(pl);
        const content = new ArrayList<any>(), header = new ArrayList<any>(), footer = new ArrayList<any>();
        header.add(new NavigationBarViewModel("Real Estate", true));
        const props = pf.all();
        const rent = props.reduce((s, p) => s + pf.weeklyRent(p), 0);
        const costs = props.reduce((s, p) => s + pf.weeklyCosts(p), 0);
        const country = RealEstatePortfolio.countryKey(pl);
        const idx = pf.marketIndex(country);
        content.add(label("RESummary", [
            ["Properties", props.length ? `${props.length}${props.some((p) => p.isBlock()) ? ` (${props.reduce((s, p) => s + p.units, 0)} units)` : ""}` : "None yet"],
            ["Portfolio value", money(pf.totalValue())],
            ["Mortgage debt", money(pf.totalDebt())],
            ["Equity", money(pf.totalEquity())],
            ["Rent per week", money(rent), R.color.flatGreen],
            ["Costs per week", money(costs), R.color.flatRed],
            ["Net per week", signed(rent - costs), rent - costs >= 0 ? R.color.flatGreen : R.color.flatRed],
            ["Local market", `${idx.toFixed(2)}× (${pct(idx - 1)} vs. the base prices)`],
        ]));
        const home = pf.residence();
        const lease = pf.lease;
        const cur = pl.getHousingState().currentHousing().getType();
        const atParents = cur === Housing.parentsHouse;
        const minorAtParents = atParents && pl.getAgeInYears() < AgeLimits.adultStuff;  // adults can move out any time

        // Where you live: a home you own, a home you rent, or a basic place
        content.add(new HeaderTitleViewModel("Where You Live"));
        if (home || lease) {
            const h = (home ?? lease)!;
            const lines: Line[] = [["", `${h.typeLabel()} · ${h.neighborhoodLabel()}${h.city ? ", " + h.city : ""}`]];
            if (home) lines.push(["", "You own this home."], ["Condition", `${Math.round(h.condition)}% (${conditionLabel(h.condition)})`, condColor(h.condition)]);
            else lines.push(["Renting", `${money(lease!.leaseRent ?? 0)}/week from ${lease!.landlord ?? "a landlord"} (repairs are the landlord's job)`]);
            const sb = rich(lines).getStringBuilder();
            ExtensionsKt.appendNewline(sb);
            comfortSb(sb, pf, h);
            content.add(new ActionCellMultipleOptionsViewModel(img(h), (home ? "🏠 " : "") + h.name, new TextLabelViewModel("", null, false, false, null, sb), text(""),
                home ? [button("Manage", true, () => RealEstateScreens.open(GenericListType.propertyDetails, home.id))] : [], null));
        } else {
            const sb = rich([["", atParents ? (minorAtParents ? "You live with your parents." : "You live with your parents. You can move out whenever you like.") : cur.getRentalCost().signum() > 0 ? `Basic housing${RealEstateScreens.rentText(cur)}` : "No rent to pay."]]).getStringBuilder();
            ExtensionsKt.appendNewline(sb);
            ExtensionsKt.appendAttributesString$default(sb, cur.getModifiers(), null, null, null, 14, null);
            content.add(new ActionCellMultipleOptionsViewModel(cur.getImageId(), cur.getTitle(), new TextLabelViewModel("", null, false, false, null, sb), text(""), [], null));
        }

        // Your properties
        const order = (p: OwnedProperty) => (p.info().category === "Residential" ? 1 : 2);
        const sorted = [...props].filter((p) => p !== home).sort((a, b) => order(a) - order(b) || pf.value(b) - pf.value(a));
        if (sorted.length) content.add(new HeaderTitleViewModel(home ? "Your Other Properties" : "Your Properties"));
        else if (!home) content.add(label("RENone", [["", "You don't own any property yet. Find one under Homes for Sale (mortgages available)."]]));
        for (const p of sorted) {
            const lines: Line[] = [
                ["", `${p.typeLabel()} · ${p.neighborhoodLabel()}${p.city ? ", " + p.city : ""}`],
                ["Value", money(pf.value(p))],
                ["Condition", `${Math.round(p.condition)}% (${conditionLabel(p.condition)})`, condColor(p.condition)],
                ["Use", useLabel(p, pf, pl)],
                ["Net", signed(pf.weeklyNet(p)) + "/week", pf.weeklyNet(p) >= 0 ? R.color.flatGreen : R.color.flatRed],
            ];
            if (p.problems.length) lines.push(["Problems", p.problemLabels().join(", "), R.color.flatRed]);
            if (p.mortgage) lines.push(["Mortgage", money(p.mortgage.balance)]);
            content.add(cell(img(p), p.displayName(), lines, [button("Manage", true, () => RealEstateScreens.open(GenericListType.propertyDetails, p.id))]));
        }

        // Find a home
        content.add(new HeaderTitleViewModel("Find a Home"));
        content.add(cell(R.drawable.housing_family_home, "Homes for Sale & Rent", [["", minorAtParents
            ? "You can look for your own place once you're 18."
            : "Every home is unique: its own address, neighborhood, condition and price. New listings every 4 weeks."]], [
            button("Homes for Sale", !minorAtParents, () => RealEstateScreens.open(GenericListType.propertyMarket)),
            button("Homes for Rent", !minorAtParents, () => RealEstateScreens.open(GenericListType.rentalMarket)),
        ]));
        if (!minorAtParents) {
            const basics = Housing.INSTANCE.housingOptions(pl).filter((h: any) => BASIC_HOUSING.includes(h.name()) && h !== cur && h !== Housing.jail);
            for (const h of basics) {
                const sb = rich([["Rent", h.getRentalCost().signum() > 0 ? `${ExtensionsKt.numberDisplayString(h.getRentalCost(), true)}/week` : "Free"]]).getStringBuilder();
                ExtensionsKt.appendNewline(sb);
                ExtensionsKt.appendAttributesString$default(sb, h.getModifiers(), null, null, null, 14, null);
                content.add(new ActionCellMultipleOptionsViewModel(h.getImageId(), h.getTitle(), new TextLabelViewModel("", null, false, false, null, sb), text(""),
                    [button("Move here", true, () => RealEstateScreens.confirm("Move", `Move to ${h.getTitle().toLowerCase()}?${lease ? " Your lease will end." : home ? " Your home stays yours (vacant) — you can rent it out." : ""}`,
                        h.getImageId(), "Move", () => RealEstateScreens.run("Move", pf.moveToBasic(pl, h), h.getImageId())))], null));
            }
        }

        if (pf.gifted?.length) {
            content.add(new HeaderTitleViewModel("Given to Family"));
            content.add(label("REGifted", pf.gifted.slice(-10).reverse().map((g) => [g.property.displayName(), `given to ${g.recipientName}, ${when(pf.clock() - g.clock).toLowerCase()}`] as Line)));
        }
        if (pf.sold?.length) {
            content.add(new HeaderTitleViewModel("Sold"));
            content.add(label("RESold", pf.sold.slice(-10).reverse().map((s) => {
                const gain = s.soldFor - s.boughtFor;
                return [s.name, `sold by ${s.seller} for ${money(s.soldFor)} (${signed(gain)}), ${when(pf.clock() - s.clock).toLowerCase()}`, gain >= 0 ? R.color.flatGreen : R.color.flatRed] as Line;
            })));
        }
        return new GenericListFragmentViewModel(content, header, footer);
    },

    // ---------------------------------------------------------------- one property
    details(id: string): GenericListFragmentViewModel {
        const pl = player(), pf = portfolio();
        pf.reconcile(pl);
        const content = new ArrayList<any>(), header = new ArrayList<any>(), footer = new ArrayList<any>();
        const p = pf.get(id);
        if (!p) {
            header.add(new NavigationBarViewModel("Property", true));
            content.add(label("REGone", [["", "This property is no longer yours."]]));
            return new GenericListFragmentViewModel(content, header, footer);
        }
        header.add(new NavigationBarViewModel(p.isBlock() ? p.displayName() : p.typeLabel(), true));
        const value = pf.value(p);
        const gain = value - p.purchasePrice;
        const owned = pf.clock() - (p.purchasedAt ?? 0);
        content.add(cell(img(p), p.displayName(), [
            ["Address", p.isBlock() ? `${p.units} standard units` : p.address()],
            ["Type", `${p.typeLabel()} (${p.info().category})`],
            ["Neighborhood", p.neighborhoodLabel()],
            ["Current value", money(value)],
            [(p as any).migrated ? "Recorded value" : "Purchase price", `${money(p.purchasePrice)} (${signed(gain)})`, gain >= 0 ? R.color.flatGreen : R.color.flatRed],
            ["Owned for", (p as any).migrated ? `since before records began (value then: ${money(p.purchasePrice)})` : `${ago(owned)}${p.purchasedBy ? ` — bought by ${p.purchasedBy} at age ${p.purchasedAtAge}` : ""}`],
            ["Use", useLabel(p, pf, pl)],
        ], []));
        content.add(label("RECond", [["Condition", `${Math.round(p.condition)}% (${conditionLabel(p.condition)})`, condColor(p.condition)]]));
        content.add(new ProgressBarCellViewModel("REBar", new ProgressBarViewModel(p.condition, 100, true, false)));

        // Money
        const rows: Line[] = [];
        const rent = pf.weeklyRent(p);
        if (p.use === "rental") rows.push(["Rent", `${money(rent)} of ${money(pf.rentPotential(p))} possible`, R.color.flatGreen]);
        rows.push(["Property tax", money(pf.weeklyTax(p))]);
        rows.push(["Upkeep", `${money(pf.weeklyUpkeep(p))} (${UPKEEP[p.upkeep]?.label ?? p.upkeep})`]);
        if (pf.weeklyUtilities(p) > 0) rows.push(["Utilities", money(pf.weeklyUtilities(p))]);
        if (p.mortgage) rows.push(["Mortgage payment", money(p.mortgage.payment)]);
        rows.push(["Net", signed(pf.weeklyNet(p)), pf.weeklyNet(p) >= 0 ? R.color.flatGreen : R.color.flatRed]);
        const anyP = p as any;
        if (anyP.rentCollected || anyP.costsPaid) rows.push(["Lifetime", `${money(anyP.rentCollected ?? 0)} rent, ${money(anyP.costsPaid ?? 0)} costs`]);
        content.add(new HeaderTitleViewModel("Weekly Money"));
        content.add(label("REMoney", rows));

        // Problems
        if (p.problems.length) {
            content.add(new HeaderTitleViewModel("Problems"));
            for (const pr of [...p.problems]) {
                const info = PROBLEMS[pr.type];
                const cost = pf.repairCost(p, pr.type);
                const cash = pl.getMoneyState().getCash().doubleValue();
                const diyOk = info.diy && !p.info().multiUnit && !p.isBlock();
                const btns = [button(`Hire a pro (${money(cost)})`, cash >= cost, () => RealEstateScreens.run(info.label, pf.repair(pl, p.id, pr.type, false), img(p)))];
                if (diyOk) btns.push(button(`DIY (${money(cost * RE.diyCostShare)})`, cash >= cost * RE.diyCostShare, () => RealEstateScreens.run(info.label, pf.repair(pl, p.id, pr.type, true), img(p))));
                content.add(cell(img(p), info.label, [["", info.description], ["Open for", ago(pr.weeks)], ["Damage", `−${info.weeklyDamage} condition per week`, R.color.flatRed]], btns));
            }
        }

        // What it's used for
        const livable = RealEstatePortfolio.housingOf(p.type).getLivable();
        const useBtns: ButtonViewModel[] = [];
        if (livable && p.use !== "residence") useBtns.push(button("Move in", true, () => RealEstateScreens.run("Move", pf.moveInto(pl, p.id), img(p))));
        if (p.use !== "residence") {
            useBtns.push(button("Rent it out", p.use !== "rental", () => RealEstateScreens.run("Rent", pf.setUse(pl, p.id, "rental"), img(p))));
            useBtns.push(button("Leave vacant", p.use !== "vacant", () => RealEstateScreens.run("Vacant", pf.setUse(pl, p.id, "vacant"), img(p))));
        }
        if (livable && !p.isBlock() && p.use !== "residence") useBtns.push(button("Family…", true, () => RealEstateScreens.open(GenericListType.propertyFamily, p.id)));
        content.add(new HeaderTitleViewModel("Use"));
        content.add(cell(img(p), useLabel(p, pf, pl), [["", p.use === "residence"
            ? `You live here (${(() => { const c = pf.homeComfort(p); return `+${c.happiness.toFixed(1)} happiness${c.sanity > 0.05 ? `, +${c.sanity.toFixed(1)} sanity` : ""}`; })()} per week). Better condition and renovations raise that; problems and a run-down home make you unhappy. To move, use Move in on another property you own, or Find a Home on the Real Estate screen.`
            : "Rentals earn rent once a tenant moves in (a well-kept place finds tenants faster and keeps them longer). Family living here rent-free grow closer to you."]], useBtns));

        // Upkeep, maintenance, renovations
        const cash = pl.getMoneyState().getCash().doubleValue();
        content.add(new HeaderTitleViewModel("Upkeep & Renovations"));
        content.add(cell(img(p), `Upkeep plan: ${UPKEEP[p.upkeep]?.label}`, [
            ["", "Ongoing upkeep slows wear and makes problems rarer. Standard includes a manager who fixes minor problems after 3 weeks and major ones after 6; Premium fixes everything within 1–2 weeks (repairs billed at the normal price). With none, the property runs down quickly."],
            ...Object.entries(UPKEEP).map(([k, u]) => [u.label, `${money(pf.baseValue(p) * u.yearly / RE.weeksPerYear)}/week`] as Line),
        ], Object.entries(UPKEEP).map(([k, u]) => button(u.label, p.upkeep !== k, () => RealEstateScreens.run("Upkeep", pf.setUpkeep(p.id, k))))));
        const proCost = pf.serviceCost(p, false), diyCost = pf.serviceCost(p, true);
        const proWait = pf.serviceWait(p, false), diyWait = pf.serviceWait(p, true);
        const svc = [button(proWait ? `Crew (in ${proWait} wk)` : `Maintenance crew (${money(proCost)})`, !proWait && cash >= proCost && p.condition < 100, () => RealEstateScreens.run("Maintenance", pf.service(pl, p.id, false), img(p)))];
        if (!p.info().multiUnit && !p.isBlock()) svc.push(button(diyWait ? `DIY (in ${diyWait} wk)` : `DIY touch-up (${money(diyCost)})`, !diyWait && cash >= diyCost && p.condition < 100, () => RealEstateScreens.run("Maintenance", pf.service(pl, p.id, true), img(p))));
        content.add(cell(img(p), "Maintenance", [["", `A crew visit restores ${RE.serviceGain} condition (every 4 weeks); a DIY touch-up restores ${RE.diyServiceGain} (every 8 weeks).`]], svc));
        const renoDone = Object.values(p.renovations).reduce((s, l) => s + l, 0);
        content.add(cell(img(p), "Renovations", [["Completed", `${renoDone} of ${Object.keys(RENOVATIONS).length * RENOVATION_LEVELS.length} upgrades (+${Math.round(p.renovationBonus() * 100)}% value)`]],
            [button("Renovate…", true, () => RealEstateScreens.open(GenericListType.propertyRenovations, p.id))]));

        // Mortgage
        if (p.mortgage) {
            const m = p.mortgage;
            content.add(new HeaderTitleViewModel("Mortgage"));
            content.add(cell(img(p), "Mortgage", [
                ["Balance", money(m.balance)], ["Original loan", money(m.original)],
                ["Rate", `${(m.rate * 100).toFixed(1)}% per year`], ["Payment", `${money(m.payment)}/week`],
            ], [button(`Pay off (${money(m.balance)})`, cash >= m.balance, () => RealEstateScreens.run("Mortgage", pf.payOffMortgage(pl, p.id), img(p)))]));
        }

        // Selling
        const proceeds = pf.saleProceeds(p);
        content.add(new HeaderTitleViewModel("Sell"));
        content.add(cell(img(p), `Sell for about ${money(value)}`, [
            ["You'd receive", `${money(proceeds)} after ${Math.round(RE.sellingFees * 100)}% agent fees${p.mortgage ? " and paying off the mortgage" : ""}`, proceeds >= 0 ? R.color.flatGreen : R.color.flatRed],
            ["Profit vs. purchase", signed(value * (1 - RE.sellingFees) - p.purchasePrice), value * (1 - RE.sellingFees) >= p.purchasePrice ? R.color.flatGreen : R.color.flatRed],
        ], [button("Sell", true, () => RealEstateScreens.confirm("Sell Property",
            `Sell ${p.displayName()} for about ${money(value)}? You'd receive ${money(proceeds)}.${p.use === "residence" ? " You live here, so you'd stay on as a renter until you move." : ""}`,
            img(p), "Sell", () => RealEstateScreens.run("Sell", pf.sellProperty(pl, p.id), img(p))))]));

        // History
        if (p.history?.length) {
            content.add(new HeaderTitleViewModel("History"));
            content.add(label("REHistory", [...p.history].reverse().slice(0, 25).map((h) => [when(pf.clock() - h.clock), h.text] as Line)));
        }
        return new GenericListFragmentViewModel(content, header, footer);
    },

    // ---------------------------------------------------------------- renovations
    renovations(id: string): GenericListFragmentViewModel {
        const pl = player(), pf = portfolio();
        const content = new ArrayList<any>(), header = new ArrayList<any>();
        header.add(new NavigationBarViewModel("Renovations", true));
        const p = pf.get(id);
        if (!p) { content.add(label("REGone", [["", "This property is no longer yours."]])); return new GenericListFragmentViewModel(content, header, new ArrayList()); }
        const cash = pl.getMoneyState().getCash().doubleValue();
        content.add(label("RenoIntro", [["", `${p.displayName()} — each room has three upgrade levels (${RENOVATION_LEVELS.join(" → ")}). Upgrades raise the value and rent, improve condition, and make the home nicer to live in. Higher levels add less value per dollar.`]]));
        for (const [cat, r] of Object.entries(RENOVATIONS)) {
            const lvl = p.renovations[cat] ?? 0;
            const cost = pf.renovationCost(p, cat);
            const lines: Line[] = [["Current", lvl ? `${RENOVATION_LEVELS[lvl - 1]} (${lvl}/${RENOVATION_LEVELS.length})` : "Original"]];
            if (cost != null) {
                const addValue = pf.baseValue(p) * (r.value[lvl] ?? 0) * (pf.value(p) / pf.baseValue(p) / (1 + p.renovationBonus()));
                lines.push(["Next", `${RENOVATION_LEVELS[lvl]} — adds about ${money(addValue)} value, +${r.condition} condition`]);
                if (p.use === "residence") lines.push(["Comfort", `+${r.comfort} happiness per week while you live here`, R.color.flatGreen]);
            } else lines.push(["", "Fully renovated", R.color.flatGreen]);
            content.add(cell(img(p), r.label, lines, cost == null ? [] : [button(`Renovate (${money(cost)})`, cash >= cost, () => RealEstateScreens.run(r.label, pf.renovate(pl, p.id, cat), img(p)))]));
        }
        return new GenericListFragmentViewModel(content, header, new ArrayList());
    },

    // ---------------------------------------------------------------- family
    family(id: string): GenericListFragmentViewModel {
        const pl = player(), pf = portfolio();
        const content = new ArrayList<any>(), header = new ArrayList<any>();
        header.add(new NavigationBarViewModel("Family & Property", true));
        const p = pf.get(id);
        if (!p) { content.add(label("REGone", [["", "This property is no longer yours."]])); return new GenericListFragmentViewModel(content, header, new ArrayList()); }
        content.add(label("FamIntro", [["", `Let family live in ${p.displayName()} rent-free (they'll grow closer to you; you pay the utilities), or give it to them outright. If the person you give it to later becomes your heir, it comes back into the family estate.`]]));
        const fam = pf.housableFamily(pl);
        if (!fam.length) content.add(label("FamNone", [["", "No adult family members to house right now (parents, or children aged 18+)."]]));
        for (const m of fam) {
            const where = pf.whereLives(m.getId());
            const here = where === p;
            const rel = m.getRelationship() === Relationship.parent ? "Parent" : "Child";
            const btns = [here
                ? button("Move out", true, () => RealEstateScreens.run("Family", pf.removeOccupant(pl, p.id, m.getId()), img(p)))
                : button("Move in here", true, () => RealEstateScreens.run("Family", pf.addOccupant(pl, p.id, m.getId()), img(p)))];
            btns.push(button("Give property", !p.mortgage, () => RealEstateScreens.confirm("Give Property",
                `Give ${p.displayName()} (worth ${money(pf.value(p))}) to ${m.getFullName()}? It will no longer be yours.`, img(p), "Give it",
                () => { RealEstateScreens.run("Gift", pf.gift(pl, p.id, m.getId()), img(p)); Utils.INSTANCE.navigationBackToMainGame(); })));
            content.add(cell(R.drawable.housing_house, `${m.getFullName()} (${rel}, ${m.getAgeInYears()})`, [
                ["Lives", here ? "here" : where ? where.displayName() : "elsewhere"],
                ["Relationship", `${m.getRelationshipProgress()}%`],
            ], btns));
        }
        return new GenericListFragmentViewModel(content, header, new ArrayList());
    },

    // ---------------------------------------------------------------- market
    market(): GenericListFragmentViewModel {
        const pl = player(), pf = portfolio();
        pf.reconcile(pl);
        if (!pf.listings?.length) pf.refreshListings(pl);
        const content = new ArrayList<any>(), header = new ArrayList<any>();
        header.add(new NavigationBarViewModel("Homes for Sale", true));
        const country = RealEstatePortfolio.countryKey(pl);
        const idx = pf.marketIndex(country);
        const next = Math.max(0, RE.listingRefreshWeeks - (pf.clock() - pf.listingsWeek));
        const cash = pl.getMoneyState().getCash().doubleValue();
        const adult = pl.getAgeInYears() >= AgeLimits.adultStuff;
        if (!adult) content.add(label("TooYoungToBuy", [["", `You must be ${AgeLimits.adultStuff} to buy a home.`, R.color.flatRed]]));
        content.add(label("MarketIntro", [
            ["Market", `${idx.toFixed(2)}× base prices (${pct(idx - 1)})`],
            ["New listings", next ? `in ${next} week${next === 1 ? "" : "s"}` : "next week"],
            ["Mortgages", `${Math.round(RE.downPayment * 100)}% down, ${(RE.mortgageRate * 100).toFixed(1)}% over ${RE.mortgageYears} years`],
            ["Your cash", money(cash)],
        ]));
        content.add(new SingleButtonViewModel(button("Homes for Rent instead", true, () => RealEstateScreens.open(GenericListType.rentalMarket))));
        for (const l of [...pf.listings].sort((a, b) => a.askingPrice - b.askingPrice)) {
            const value = pf.value(l);
            const down = l.askingPrice * RE.downPayment;
            const pay = RealEstatePortfolio.mortgagePayment(l.askingPrice - down, RE.mortgageRate);
            const deal = l.askingPrice / value - 1;
            const lines: Line[] = [
                ["", `${l.typeLabel()} (${l.info().tier === "Investment" ? "investment building" : l.info().tier.toLowerCase() + " home"}) · ${l.neighborhoodLabel()}, ${l.city}`],
                ["Asking", `${money(l.askingPrice)} (${Math.abs(Math.round(deal * 100))}% ${deal <= 0 ? "below" : "above"} estimated value)`, deal <= 0 ? R.color.flatGreen : R.color.flatOrange],
                ["Condition", `${Math.round(l.condition)}% (${conditionLabel(l.condition)})`, condColor(l.condition)],
                ["Est. rent", `${money(pf.rentPotential(l))}/week`],
            ];
            const renos = Object.entries(l.renovations).map(([k, v]) => `${RENOVATIONS[k].label} (${RENOVATION_LEVELS[v - 1]})`);
            if (renos.length) lines.push(["Renovated", renos.join(", ")]);
            if (l.problems.length) lines.push(["Problems", l.problemLabels().join(", "), R.color.flatRed]);
            const refusal = pf.mortgageRefusal(pl, l.askingPrice);
            const lsb = rich(lines).getStringBuilder();
            if (l.info().category === "Residential") { ExtensionsKt.appendNewline(lsb); ExtensionsKt.appendNormal$default(lsb, "Living here: ", null, null, null, 14, null); comfortSb(lsb, pf, l); }
            content.add(new ActionCellMultipleOptionsViewModel(img(l), l.name, new TextLabelViewModel("", null, false, false, null, lsb), text(""), [
                button(`Buy (${money(l.askingPrice)})`, adult && cash >= l.askingPrice, () => RealEstateScreens.confirm("Buy Property",
                    `Buy ${l.name} for ${money(l.askingPrice)} cash?`, img(l), "Buy", () => RealEstateScreens.afterBuy(l.id, pf.buyListing(pl, l.id, false), l))),
                button(`Mortgage (${money(down)} down)`, adult && refusal == null, () => RealEstateScreens.confirm("Mortgage",
                    `Put ${money(down)} down and borrow ${money(l.askingPrice - down)} at ${(RE.mortgageRate * 100).toFixed(1)}%? Payments are ${money(pay)} per week for ${RE.mortgageYears} years (paid automatically; you can pay it off early).`,
                    img(l), "Buy with mortgage", () => RealEstateScreens.afterBuy(l.id, pf.buyListing(pl, l.id, true), l))),
            ], null));
            if (refusal && cash >= down) content.add(label("Refusal" + l.id, [["", refusal, R.color.flatGrey]]));
        }
        return new GenericListFragmentViewModel(content, header, new ArrayList());
    },

    // ---------------------------------------------------------------- homes for rent
    rentalMarket(): GenericListFragmentViewModel {
        const pl = player(), pf = portfolio();
        pf.reconcile(pl);
        if (!pf.rentals?.length) pf.refreshRentals(pl);
        const content = new ArrayList<any>(), header = new ArrayList<any>();
        header.add(new NavigationBarViewModel("Homes for Rent", true));
        const next = Math.max(0, RE.listingRefreshWeeks - (pf.clock() - pf.listingsWeek));
        const cash = pl.getMoneyState().getCash().doubleValue();
        const lease = pf.lease, home = pf.residence();
        const adult = pl.getAgeInYears() >= AgeLimits.adultStuff;
        if (!adult) content.add(label("TooYoungToRent", [["", `You must be ${AgeLimits.adultStuff} to rent a home.`, R.color.flatRed]]));
        content.add(label("RentIntro", [
            ["", "Renting is cheaper up front: no down payment, no taxes or repairs (the landlord handles those). You pay rent and utilities every week."],
            ["Now living in", home ? `${home.name} (you own it — it stays yours if you move)` : lease ? `${lease.name} (${money(lease.leaseRent ?? 0)}/week)` : pl.getHousingState().currentHousing().getType().getTitle()],
            ["New listings", next ? `in ${next} week${next === 1 ? "" : "s"}` : "next week"],
            ["Your cash", money(cash)],
        ]));
        content.add(new SingleButtonViewModel(button("Homes for Sale instead", true, () => RealEstateScreens.open(GenericListType.propertyMarket))));
        for (const l of [...pf.rentals].sort((a, b) => (a.leaseRent ?? 0) - (b.leaseRent ?? 0))) {
            const rent = l.leaseRent ?? 0;
            const lines: Line[] = [
                ["", `${l.typeLabel()} (${l.info().tier.toLowerCase()} home) · ${l.neighborhoodLabel()}, ${l.city}`],
                ["Rent", `${money(rent)}/week + about ${money(l.info().utilities * l.countryInfo().value)} utilities`],
                ["Condition", `${Math.round(l.condition)}% (${conditionLabel(l.condition)})`, condColor(l.condition)],
                ["Landlord", l.landlord ?? "—"],
            ];
            const renos = Object.entries(l.renovations).map(([k, v]) => `${RENOVATIONS[k].label} (${RENOVATION_LEVELS[v - 1]})`);
            if (renos.length) lines.push(["Renovated", renos.join(", ")]);
            const sb = rich(lines).getStringBuilder();
            ExtensionsKt.appendNewline(sb); ExtensionsKt.appendNormal$default(sb, "Living here: ", null, null, null, 14, null); comfortSb(sb, pf, l);
            content.add(new ActionCellMultipleOptionsViewModel(img(l), l.name, new TextLabelViewModel("", null, false, false, null, sb), text(""), [
                button(`Rent (${money(rent)}/week)`, adult && cash >= rent * 2, () => RealEstateScreens.confirm("Rent This Home",
                    `Sign a lease on ${l.name} for ${money(rent)} per week and move in?${lease ? " Your current lease ends." : home ? " Your home stays yours (vacant) — you can rent it out or sell it." : ""}`,
                    img(l), "Sign lease", () => RealEstateScreens.run("Lease", pf.signLease(pl, l.id), img(l)))),
            ], null));
        }
        return new GenericListFragmentViewModel(content, header, new ArrayList());
    },

    afterBuy(listingId: string, result: string | null, l: OwnedProperty) {
        if (result) { RealEstateScreens.alert("Purchase", result, img(l)); return; }
        const pl = player(), pf = portfolio();
        const p = pf.all()[pf.all().length - 1];
        RealEstateScreens.reload();
        if (!p) return;
        const livable = RealEstatePortfolio.housingOf(p.type).getLivable();
        const extra: [string, () => void][] = livable ? [["Move in", () => RealEstateScreens.run("Move", pf.moveInto(pl, p.id), img(p))]] : [];
        RealEstateScreens.confirm("Congratulations!", `You now own ${p.displayName()}. What do you want to do with it?`, img(p),
            "Rent it out", () => RealEstateScreens.run("Rent", pf.setUse(pl, p.id, "rental"), img(p)), extra, "Decide later");
    },
};
