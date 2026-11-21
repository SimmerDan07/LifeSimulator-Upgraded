// The Family Tree screen (v0.17.0): every generation from your grandparents down to your great-grandchildren,
// each row split into family groups ("Mom's side", "Aunt Rosa's children", "Your children"…). Tap anyone to open them.
import { TrueAge } from "../Managers/TrueAge";
import { Appearance, ORIGINAL } from "./Appearance";
import { ArrayList } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { FamilyTreeViewModel, TreeGroup, TreeNode, TreeRow } from "../Models/PersonCardViewModel";
import { GameStateManager } from "../Managers/GameStateManager";
import { Relationship } from "../Enums/Relationship";
import { R } from "../runtime";
import { Sex } from "../Enums/Sex";
import { Utils } from "../Utils/Utils";
import { Relationships } from "./Relationships";
import { ExtendedFamily } from "./ExtendedFamily";
import { LoveScreens } from "./LoveScreens";
import { SocialPerson } from "./SocialPerson";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { TombstoneViewModel } from "../Models/TombstoneViewModel";
import { PersonCardViewModel } from "../Models/PersonCardViewModel";
import { Paging } from "../Models/Paging";
import { Lineage, LifeRecord } from "../Managers/Lineage";
import { AgeGroup } from "../Enums/AgeGroup";
import { Pair } from "../runtime";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const open = (id: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.personDetails, id, false, 4, null);

export const FamilyTree = {
    node(x: any, relation?: string): TreeNode {
        const dead = !x.getIsAlive();
        return {
            id: x.getId(),
            name: x.getFirstName(),
            relation: relation ?? FamilyTree.relationOf(x),
            sub: dead ? "Deceased" : `Age ${x.getAgeInYears()}` + (x.getTrueAgeInYears?.() > x.getAgeInYears() ? ` (true ${TrueAge.text(x)})` : ""),
            imageId: LoveScreens.headImage(x),
            dead,
            you: false,
            badge: ExtendedFamily.isNewborn(x) ? "New" : Relationships.circle().metaFor(x.getId()).vampire ? "Vampire" : null,
            onClick: { invoke: () => open(x.getId()) },
        };
    },
    relationOf(x: any): string {
        if (x instanceof SocialPerson) return x.getTitle();
        const kind = Relationships.kindOf(x);
        const male = x.getSex() === Sex.male;
        if (kind === "parent") return male ? "Father" : "Mother";
        if (kind === "child") return male ? "Son" : "Daughter";
        if (kind === "partner") return male ? "Husband" : "Wife";
        return "";
    },
    you(p: any): TreeNode {
        let img: any = null;
        try { img = Appearance.head(p); } catch { /* none */ }
        return { id: p.getId?.() ?? "you", name: p.getFirstName(), relation: "You", sub: `Age ${p.getAgeInYears()}`, imageId: img, dead: false, you: true, badge: null, onClick: null };
    },
    /** Oldest first, the living before the dead. */
    sort(list: any[]): any[] {
        return list.slice().sort((a, b) => (a.getIsAlive() === b.getIsAlive() ? b.getAgeInWeeks() - a.getAgeInWeeks() : a.getIsAlive() ? -1 : 1));
    },
    /** Groups of children by parent, in the order the parents are given. */
    childGroups(parents: any[], label: (par: any) => string, p: any): TreeGroup[] {
        const out: TreeGroup[] = [];
        for (const par of parents) {
            const kids = ExtendedFamily.childrenOf(par.getId(), p);
            if (kids.length) out.push({ label: label(par), nodes: FamilyTree.sort(kids).map((k) => FamilyTree.node(k)), you: false });
        }
        return out;
    },
    rows(p: any = player()): TreeRow[] {
        ExtendedFamily.ensure(p);
        const c = Relationships.circle(p);
        const { mom, dad } = ExtendedFamily.parentsOfPlayer(p);
        const sides = [mom, dad].filter((x) => x != null);
        const sideIds = sides.map((x) => x.getId());
        const rows: TreeRow[] = [];
        const add = (title: string, groups: TreeGroup[]) => { const g = groups.filter((x) => x.nodes.length); if (g.length) rows.push({ title, groups: g }); };

        // Grandparents
        const gp = c.list("grandparent");
        const gpGroups: TreeGroup[] = sides.map((par) => ({ label: ExtendedFamily.sideTitle(par.getId(), p), nodes: FamilyTree.sort(gp.filter((g) => g.side === par.getId())).map((g) => FamilyTree.node(g)), you: false }));
        const stray = gp.filter((g) => !sideIds.includes(g.side ?? ""));
        if (stray.length) gpGroups.push({ label: "Family", nodes: stray.map((g) => FamilyTree.node(g)), you: false });
        add("Grandparents", gpGroups);

        // Parents with their brothers and sisters (each parent sits next to the middle of the tree)
        const au = c.list("auntUncle");
        const parentGroups: TreeGroup[] = sides.map((par, i) => {
            const aunts = FamilyTree.sort(au.filter((a) => a.side === par.getId())).map((a) => FamilyTree.node(a));
            const me = FamilyTree.node(par);
            return { label: ExtendedFamily.sideTitle(par.getId(), p), nodes: i === 0 && sides.length > 1 ? [...aunts, me] : [me, ...aunts], you: false };
        });
        const strayAu = au.filter((a) => !sideIds.includes(a.side ?? ""));
        if (strayAu.length) parentGroups.push({ label: "Family", nodes: strayAu.map((a) => FamilyTree.node(a)), you: false });
        add("Parents, Aunts & Uncles", parentGroups);

        // You, your siblings (and partner), with the cousins on each side
        const auntsOf = (par: any) => FamilyTree.sort(au.filter((a) => a.side === par?.getId?.()));
        const cousinLabel = (a: any) => `${a.getTitle()} ${a.getFirstName()}'s children`;
        const leftCousins = sides.length ? FamilyTree.childGroups(auntsOf(sides[0]), cousinLabel, p) : [];
        const rightCousins = sides.length > 1 ? FamilyTree.childGroups(auntsOf(sides[1]), cousinLabel, p) : [];
        const otherCousins = FamilyTree.childGroups(strayAu, cousinLabel, p);
        const sibs = FamilyTree.sort(Relationships.siblings(p));
        const youNodes = [FamilyTree.you(p), ...sibs.map((s) => FamilyTree.node(s))].sort((a, b) => {
            const age = (n: TreeNode) => (n.you ? p.getAgeInWeeks() : (c.get(n.id)?.getAgeInWeeks() ?? 0));
            return age(b) - age(a);
        });
        const mid: TreeGroup[] = [{ label: sibs.length ? "You & your siblings" : "You", nodes: youNodes, you: true }];
        const partner = p.getFamilyState().getPartner();
        if (partner != null) mid.push({ label: "Partner", nodes: [FamilyTree.node(partner)], you: false });
        add("You, Siblings & Cousins", [...leftCousins, ...mid, ...rightCousins, ...otherCousins]);

        // Your children, and your siblings' children
        const kids = FamilyTree.sort(Relationships.family(Relationship.child, p).filter((k) => !k.getNotYetBorn()));
        const nieces = FamilyTree.childGroups(sibs, (s) => `${s.getTitle()} ${s.getFirstName()}'s children`, p);
        add("Children, Nieces & Nephews", [{ label: "Your children", nodes: kids.map((k) => FamilyTree.node(k)), you: false }, ...nieces]);

        // Grandchildren (by your child), great-grandchildren (by grandchild)
        add("Grandchildren", FamilyTree.childGroups(kids, (k) => `${k.getFirstName()}'s children`, p));
        add("Great-grandchildren", FamilyTree.childGroups(FamilyTree.sort(c.list("grandchild")), (g) => `${g.getFirstName()}'s children`, p));
        return rows;
    },
    screen(): GenericListFragmentViewModel {
        const p = player();
        const out = new ArrayList<BaseViewModel>();
        const header = new ArrayList<BaseViewModel>();
        header.add(new NavigationBarViewModel("Family Tree", false, 2, null));
        const living = ExtendedFamily.all(p).filter((x) => x.getIsAlive()).length + Relationships.familyPeople(p).filter((x) => !ExtendedFamily.isRelative(x)).length;
        const intro = `${p.getLastName()} family · ${living} living relatives` + (p.getGeneration?.() > 1 ? ` · Generation ${p.getGeneration()}` : "") + ". Tap anyone to see them.";
        out.add(new SingleLabelCellViewModel("TreeIntro", new TextLabelViewModel(intro, null, false, false, null, null, 62, null)));
        // v0.18.0: earlier generations live on their own paged screen (built for very long family lines)
        const line = Lineage.line(p);
        if (line.length) {
            const row = new LeftRightCellViewModel("FamilyLineRow", new TextLabelViewModel("Family Line", null, false, false, null, null, 62, null),
                new TextLabelViewModel(`${line.length + 1} generations · see every ancestor`, null, false, false, null, null, 62, null), null, 8, null);
            row.setOnClick({ invoke: () => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.familyLine, null, false, 6, null) });
            out.add(row);
        }
        out.add(new FamilyTreeViewModel(FamilyTree.rows(p)));
        return new GenericListFragmentViewModel(out, header, null);
    },

    // ------------------------------------------------------------------ v0.18.0 Family Line (every generation, paged)
    LINE_PAGE: 10,
    recordImage(r: LifeRecord): any {
        try { return FamilyTree.headForRecord(r); } catch { return R.drawable.non_binary_1; }
    },
    headForRecord(r: LifeRecord): any {
        const sex = r.sex === "female" ? Sex.female : Sex.male;
        return Appearance.headFor(sex, AgeGroup.INSTANCE.getAgeGroup(Math.max(r.age, 19)), r.appearance ?? ORIGINAL);
    },
    lineText(r: LifeRecord): string {
        if (r.legacy) return `Lived to ${r.age}`;
        if (r.retired && r.alive) return `Handed everything to ${r.retired.to} at ${r.retired.age} · still living`;   // v0.28.0
        const bits = [`Lived to ${r.age}` + (r.trueAge !== r.age ? ` (true age ${(r as any).trueAgeText ?? TrueAge.format(r.trueAge)})` : "")];
        if (r.retired) bits.push(`handed everything to ${r.retired.to} at ${r.retired.age}`);
        if (r.cause && !/^Retired:/.test(r.cause)) bits.push(r.cause);
        if (r.vampireYears > 0) bits.push(`vampire for ${r.vampireYears} years`);
        if (r.fame) bits.push(r.fame);
        if (r.partner) bits.push(`partner ${r.partner}`);
        bits.push(`${r.children} ${r.children === 1 ? "child" : "children"}`);
        return bits.join(" · ");
    },
    lineScreen(): GenericListFragmentViewModel {
        const p = player();
        const out = new ArrayList<BaseViewModel>();
        const header = new ArrayList<BaseViewModel>();
        header.add(new NavigationBarViewModel("Family Line", false, 2, null));
        const line = Lineage.line(p);
        type Entry = { r: LifeRecord | null; gen: number };
        const entries: Entry[] = [...line.map((r) => ({ r, gen: r.generation })), { r: null, gen: p.getGeneration?.() ?? line.length + 1 }];
        const total = entries.length;
        out.add(new SingleLabelCellViewModel("LineIntro", new TextLabelViewModel(
            `The ${p.getLastName()} family line · ${total} generation${total === 1 ? "" : "s"}. Oldest first; tap a past life to read their Life Summary.`, null, false, false, null, null, 62, null)));
        const pg = Paging.slice(entries, "familyLine:" + Lineage.lineIdOf(p), FamilyTree.LINE_PAGE, "last");
        const label = `Generations ${pg.items[0]?.gen ?? 1}–${pg.items[pg.items.length - 1]?.gen ?? 1} of ${total}`;
        if (pg.pages > 1) out.add(Paging.pager("familyLine:" + Lineage.lineIdOf(p), pg.page, pg.pages, label, GenericListType.familyLine));
        else out.add(new HeaderTitleViewModel(label));
        for (const e of pg.items) {
            if (e.r == null) {
                let img: any = null;
                try { img = FamilyTree.you(p).imageId; } catch { /* none */ }
                out.add(new PersonCardViewModel("line-you", img, `Generation ${e.gen}`, `${p.getFullName()} (you)`, `Age: ${p.getAgeInYears()} · living`, null, 1000, "good", "", ["You"], null));
                continue;
            }
            const r = e.r;
            const open = r.legacy ? null : { invoke: () => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.gameSummary, r.id, false, 4, null) };
            out.add(new PersonCardViewModel("line-" + r.id, FamilyTree.recordImage(r), `Generation ${r.generation}`, r.name, FamilyTree.lineText(r), null, 1000, "good", "",
                Lineage.hasFull(r.id) ? [] : r.legacy ? ["Name only"] : ["Summary"], open));
        }
        if (pg.pages > 1) out.add(Paging.pager("familyLine:" + Lineage.lineIdOf(p), pg.page, pg.pages, label, GenericListType.familyLine));
        return new GenericListFragmentViewModel(out, header, null);
    },
    /** The Life Summary of a life kept only as a record. */
    archivedSummary(id: string): GenericListFragmentViewModel {
        const out = new ArrayList<BaseViewModel>();
        const header = new ArrayList<BaseViewModel>();
        header.add(new NavigationBarViewModel("Life Summary", false, 2, null));
        const r = Lineage.find(id);
        if (r == null) {
            out.add(new SingleLabelCellViewModel("NoLife", new TextLabelViewModel("This life couldn't be found.", null, false, false, null, null, 62, null)));
            return new GenericListFragmentViewModel(out, header, null);
        }
        out.add(new TombstoneViewModel(Lineage.tombstone(r)));
        if (r.obituary) {
            out.add(new HeaderTitleViewModel("Obituary"));
            out.add(new SingleLabelCellViewModel("Obituary", new TextLabelViewModel(r.obituary, null, false, false, null, null, 62, null)));
            if (r.obituaryRows.length) out.add(Utils.ViewModel.INSTANCE.getPropertyListViewModel(r.obituaryRows.map(([a, b]) => new Pair(a, b))));
        }
        out.add(new SingleLabelCellViewModel("Archived", new TextLabelViewModel(
            "Older lives are kept as a summary so very long family saves stay fast, so this life can't be revived.", null, false, false, null, null, 62, null)));
        return new GenericListFragmentViewModel(out, header, null);
    },
};
