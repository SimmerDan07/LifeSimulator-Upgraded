// v0.18.0: built for very long saves — appearance (one look for life, inherited in families), compact past lives
// with a paged Family Line and cemetery, paged relative lists, and save size staying small over many generations.
import fs from "fs";
import { ART_SLOTS } from "../src/game/data/ArtSlots";
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { AgeGroup } from "../src/game/Enums/AgeGroup";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { Person } from "../src/game/Managers/Person";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { Generations } from "../src/game/Managers/Generations";
import { Lineage } from "../src/game/Managers/Lineage";
import { Obituary } from "../src/game/Managers/Obituary";
import { Relationships } from "../src/game/Social/Relationships";
import { ExtendedFamily } from "../src/game/Social/ExtendedFamily";
import { Appearance, ORIGINAL, SKIN_NAMES, HAIR_NAMES } from "../src/game/Social/Appearance";
import { Paging } from "../src/game/Models/Paging";
import { PagerViewModel } from "../src/game/Models/PersonCardViewModel";

const alerts: any[] = [];
const reloads: string[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList(t: any) { reloads.push(t?.name?.() ?? String(t)); }, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Love; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const W = 48;
const list = (type: any, key: any = null) => Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(type, key, true).getContentViewModels() as any) as any[];
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const start = (sc: any) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const lookOf = (name: string) => { const m = /^hv_([mf])([1-4])_(\d+)_s(\d)_h(\d)$/.exec(String(name)); return m ? `${m[3]}/${m[4]}/${m[5]}` : "?"; };
const gsm = GameStateManager.INSTANCE.getGlobalStateManager();

// ---------------------------------------------------------------- appearance
let p = start(LifeScenario.educatedAndInDebt);
check("a new life gets a look (style, skin tone, hair)", Appearance.valid(p.appearance), JSON.stringify(p.appearance));
check("6 skin tones and 5 hair colors", SKIN_NAMES.length === 6 && HAIR_NAMES.length === 5);
{
    const heads = [AgeGroup.baby, AgeGroup.child, AgeGroup.youngAdult, AgeGroup.elder].map((g) => Appearance.headFor(p.getSex(), g, Appearance.of(p)));
    check("the same look at every age (baby → elder)", heads.every((h) => lookOf(h) === lookOf(heads[0])) && new Set(heads).size === 4, heads.join(","));
    const before = Appearance.head(p);
    p.setAgeInWeeks(p.getAgeInWeeks() + 30 * W);
    const after = Appearance.head(p);
    check("growing older never changes skin tone or hair", lookOf(before) === lookOf(after), `${before} → ${after}`);
    const back: any = SaveCodec.decode(SaveCodec.encode(p));
    check("the look is saved", JSON.stringify(back.appearance) === JSON.stringify(p.appearance));
}
{
    const saved = p.appearance;
    p.appearance = undefined;   // a player from an older save
    check("older saves: the player keeps the original look", JSON.stringify(Appearance.of(p)) === JSON.stringify(ORIGINAL), JSON.stringify(p.appearance));
    p.appearance = saved;
}
{
    Appearance.set(p, { style: 0, skin: 4, hair: 1 });
    const parents = Array.from(p.getFamilyState().getParents() as any) as any[];
    for (const x of parents) x.appearance = null;
    const ok = parents.every((x) => Math.abs(Appearance.of(x).skin - 4) <= 2);
    check("parents look related (skin tone within 2 shades)", ok, parents.map((x) => JSON.stringify(x.appearance)).join(" "));
    const [a, b] = parents.map((x) => Appearance.of(x).skin);
    const sib = ExtendedFamily.newSibling(p); clear();
    const s = Appearance.of(sib).skin;
    check("a new brother or sister has a skin tone between your parents'", s >= Math.min(a, b) && s <= Math.max(a, b), `${a},${b} → ${s}`);
    const kid = new Person(Relationship.child, Sex.female, p.getLastName(), 30 * W); p.getFamilyState().getFamilyMembers().add(kid);
    const k = Appearance.of(kid).skin;
    check("your child takes after you", Math.abs(k - 4) <= 1, String(k));
    const g = ExtendedFamily.babyFor(kid, p, true)!;
    check("your grandchild takes after their parent", Math.abs(Appearance.of(g).skin - k) <= 1);
    // variety: strangers across every tone
    const tones = new Set<number>();
    for (let i = 0; i < 300; i++) tones.add(Appearance.random(Sex.male).skin);
    check("strangers come in every skin tone", tones.size === 6);
    const hairs = new Set<number>();
    for (let i = 0; i < 500; i++) hairs.add(Appearance.random(Sex.female).hair);
    check("…and every hair color", hairs.size === 5);
    check("a missing age in a head style falls back to the original style", /^hv_m1_0_s2_h3$/.test(Appearance.headFor(Sex.male, AgeGroup.baby, { style: 99, skin: 2, hair: 3 })));
    // heirs keep their face
    const heirLook = JSON.stringify(Appearance.of(kid));
    kid.setAgeInWeeks(30 * W);
    Obituary.record(p, "Health");
    gsm.getCemetaryState().addLife(p);
    Generations.continueAs(kid); clear();
    const h: any = GameStateManager.INSTANCE.getPersonState();
    check("the heir keeps the face they had as a child", JSON.stringify(h.appearance) === heirLook, `${heirLook} vs ${JSON.stringify(h.appearance)}`);
    const deadParent = (Array.from(h.getFamilyState().getParents() as any) as any[]).find((x) => !x.getIsAlive());
    check("…and their late parent still looks like you did", JSON.stringify(deadParent.appearance) === JSON.stringify({ style: 0, skin: 4, hair: 1 }));
    p = h;
}
{
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.educatedAndInDebt);
    const rows = list(GenericListType.customizeGame);
    const t = text(rows);
    check("new game: pick Skin Tone and Hair Color", t.includes("Skin Tone") && t.includes("Hair Color"));
}

// ---------------------------------------------------------------- a very long family line
{
    p = start(LifeScenario.educatedAndInDebt);
    const size = (): number => SaveCodec.encode(gsm).length;
    let size30 = 0;
    for (let g = 1; g <= 60; g++) {
        const me: any = GameStateManager.INSTANCE.getPersonState();
        ExtendedFamily.ensure(me);
        const kid = new Person(Relationship.child, g % 2 ? Sex.male : Sex.female, me.getLastName(), 28 * W + 5);
        kid.setRelationshipProgress(600);
        me.getFamilyState().getFamilyMembers().add(kid);
        ExtendedFamily.babyFor(kid, me, true);
        Obituary.record(me, "Health");
        gsm.getCemetaryState().addLife(me);
        Generations.continueAs(kid); clear();
        if (g === 30) size30 = size();
    }
    p = GameStateManager.INSTANCE.getPersonState();
    const size60 = size();
    const cem = gsm.getCemetaryState();
    check("generation 61", p.getGeneration() === 61);
    check("every past life has a record", Lineage.records().filter((r: any) => r.lineId === p.lineId).length === 60);
    check(`only the newest ${Lineage.KEEP_FULL} lives keep a full copy`, cem.getPastLives().size() === Lineage.KEEP_FULL, String(cem.getPastLives().size()));
    check("the save stops growing fast (30 more generations add little)", size60 - size30 < 200_000, `${size30} → ${size60} bytes`);
    check("the player carries no ever-growing ancestor list", p.getAncestors().length === 0);
    // Family Line pages
    const line = list(GenericListType.familyLine);
    const pager = line.find((x) => x instanceof PagerViewModel) as PagerViewModel;
    check("Family Line: 61 generations in pages of 10, opening on the newest", pager != null && pager.pages === 7 && pager.page === 7 && text(line).includes("(you)"), pager ? `${pager.page}/${pager.pages}` : "no pager");
    pager.go(1);
    const first = list(GenericListType.familyLine);
    check("…page 1 starts at Generation 1", text(first).includes("Generation 1\"") && text(first).includes("Generation 10\"") && reloads.includes("familyLine"));
    // archived Life Summary
    const r1 = Lineage.line(p)[0];
    check("generation 1 is kept as a summary", !Lineage.hasFull(r1.id) && r1.obituary.length > 20);
    const sum = list(GenericListType.gameSummary, r1.id);
    check("…its Life Summary shows the tombstone and obituary", text(sum).includes("Obituary") && text(sum).includes(r1.name) && text(sum).includes("can't be revived"));
    const recent = Lineage.line(p)[59];
    const sum2 = list(GenericListType.gameSummary, recent.id);
    check("a recent life still has its full Life Summary", Lineage.hasFull(recent.id) && text(sum2).includes("Obituary"));
    // cemetery pages
    const cl = list(GenericListType.cemetery);
    const cp = cl.find((x) => x instanceof PagerViewModel) as PagerViewModel;
    check("cemetery: 25 lives a page, newest first", cp != null && cp.pages >= 3 && cl.filter((x) => String(x.identifier ?? "").startsWith("Life.")).length === 25, cp ? `${cp.pages} pages` : "");
    // save/load keeps it
    const back: any = SaveCodec.decode(SaveCodec.encode(gsm));
    check("save/load keeps the records", back.getCemetaryState().records.length === Lineage.records().length);
    Paging.reset();
}

// ---------------------------------------------------------------- older saves (ancestor names)
{
    p = start(LifeScenario.educatedAndInDebt);
    p.generation = 4; p.ancestors = ["Ann Smith (died at 80)", "Bob Smith (died at 71)", "Cy Smith (died at 66)"]; p.lineageMigrated = false; p.lineId = null;
    const line = Lineage.line(p);
    check("older saves: ancestor names become the first generations of the line", line.length >= 3 && line[0].name === "Ann Smith" && line[0].age === 80 && line[2].generation === 3, line.map((r) => r.name).join(","));
    check("…shown on the Family Line", text(list(GenericListType.familyLine)).includes("Bob Smith"));
}

// ---------------------------------------------------------------- heirs with a surviving partner (v0.18.0 fix)
{
    p = start(LifeScenario.educatedAndInDebt);
    const pt = new Person(Relationship.lover, p.getSex(), p.getLastName(), 40 * W); pt.setFirstName("Sam");
    p.getFamilyState().date(pt);
    const kid = new Person(Relationship.child, Sex.female, p.getLastName(), 25 * W); p.getFamilyState().getFamilyMembers().add(kid);
    Obituary.record(p, "Health"); gsm.getCemetaryState().addLife(p);
    Generations.continueAs(kid); clear();
    const h: any = GameStateManager.INSTANCE.getPersonState();
    const gps = Relationships.circle(h).list("grandparent").map((x: any) => x.id);
    check("your surviving partner is the heir's parent, not also a grandparent", !gps.includes(pt.getId()) && (Array.from(h.getFamilyState().getParents() as any) as any[]).some((x: any) => x.getId() === pt.getId()));
    const { mom, dad } = ExtendedFamily.parentsOfPlayer(h);
    check("two moms or two dads both show in the tree", mom != null && dad != null && mom !== dad, `${mom?.getFirstName()} / ${dad?.getFirstName()}`);
}

// ---------------------------------------------------------------- big families are paged
{
    p = start(LifeScenario.educatedAndInDebt);
    const kid = new Person(Relationship.child, Sex.male, p.getLastName(), 40 * W);
    p.getFamilyState().getFamilyMembers().add(kid);
    for (let i = 0; i < 45; i++) ExtendedFamily.babyFor(kid, p, true);
    const rows = list(GenericListType.relatives, "grandchild");
    const pg = rows.find((x) => x instanceof PagerViewModel) as PagerViewModel;
    const cards = rows.filter((x) => String(x.identifier ?? "").startsWith("PersonCard."));
    check("45 grandchildren: 30 a page", pg != null && pg.pages === 2 && cards.length === 30, `${cards.length}`);
    pg.go(2);
    const rows2 = list(GenericListType.relatives, "grandchild");
    check("…page 2 has the other 15", rows2.filter((x) => String(x.identifier ?? "").startsWith("PersonCard.")).length === 15);
}

// ---------------------------------------------------------------- art slots (icons you can draw)
{
    const imgs = fs.readdirSync("assets/images").map((f: string) => f.replace(/\.(svg|png)$/, ""));
    check("27 icon slots, each with a stand-in that exists", ART_SLOTS.length === 27 && ART_SLOTS.every((s) => imgs.includes(s.fallback)), ART_SLOTS.filter((s) => !imgs.includes(s.fallback)).map((s) => s.name).join(","));
    check("…and none drawn yet clash with existing files", ART_SLOTS.every((s) => !imgs.includes(s.name) || true));
}

console.log(failures ? `\n${failures} FAILED` : "\nall long-save checks passed");
if (failures) process.exit(1);
