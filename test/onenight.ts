// v0.28.1 Fewer pop-ups: only holidays pop up on their own; everything else goes to News. Spend Time with Everyone
// still goes to work.
delete (globalThis as any).process?.env?.LIFESIM_ALL_POPUPS;
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { AlertType } from "../src/game/Managers/AlertType";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { PersonAttribute } from "../src/game/Enums/PersonAttribute";
import { Person } from "../src/game/Managers/Person";
import { Relationship } from "../src/game/Enums/Relationship";
import { Sex } from "../src/game/Enums/Sex";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { SpouseIncome } from "../src/game/Social/SpouseIncome";
import { LoveScreens } from "../src/game/Social/LoveScreens";
import { Job } from "../src/game/Enums/Job";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { BigInteger, SpannableStringBuilder } from "../src/game/runtime";
import { ExtensionsKt } from "../src/game/Utils/ExtensionsKt";
import { LifeMoments } from "../src/game/Managers/LifeMoments";
import { News } from "../src/game/Managers/News";
import { FamilyExtras } from "../src/game/Managers/FamilyExtras";
import { Relationships } from "../src/game/Social/Relationships";
import { Illness } from "../src/game/Health/Illness";
import { Crime } from "../src/game/Crime/Crime";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Utils } from "../src/game/Utils/Utils";
import { AlertViewModel } from "../src/game/Managers/AlertViewModel";
import { AlertActionViewModel } from "../src/game/Managers/AlertActionViewModel";
import { LoveActions, loveAction } from "../src/game/Social/LoveActions";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Achievement } from "../src/game/Enums/Achievement";
import { Subscriptions } from "../src/game/Managers/Subscriptions";

const shown: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { shown.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Work; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const dismissAll = () => { for (let i = 0; i < 200 && shown.length; i++) { const a = shown.shift(); try { a.getPositiveButton?.()?.getAction?.()?.invoke?.(); } catch { /* ignore */ } AlertManager.INSTANCE.alertDismissed(a); } };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const cash = (p: any) => Number(p.getMoneyState().getCash().add(p.getMoneyState().getSavings()).toString());
const start = (age: number) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState(); np.initializeAge(age, true); np.getTraitState().getTraits().clear();
    GameStateManager.INSTANCE.startNewGame(np); dismissAll();
    const p: any = GameStateManager.INSTANCE.getPersonState(); keep(p);
    MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(500_000), MoneyUpdateType.workIncome, null, null, 12, null);
    return p;
};
import { OneNight } from "../src/game/Social/OneNight";
import { Babies } from "../src/game/Social/Babies";
import { Sexuality } from "../src/game/Enums/Sexuality";
import { Trait } from "../src/game/Enums/Trait";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { LoveScreens } from "../src/game/Social/LoveScreens";
import { Vampire } from "../src/game/Lifepaths/Vampire";
// v0.30.0 One-night stands
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const life = (age: number, sex: any, sexuality: any = Sexuality.straight) => { const p = start(age); p.setSex(sex); p.setSexuality(sexuality); shown.length = 0; return p; };
const loveTab = (_p: any) => JSON.stringify(LoveScreens.tab());
const withRandom = <T>(r: number, fn: () => T): T => { const m = OneNight.dice; OneNight.dice = () => r; try { return fn(); } finally { OneNight.dice = m; } };
const modals = () => shown.filter((a) => a.getType?.() !== AlertType.Banner);
const weeks = (p: any, n: number) => { for (let i = 0; i < n; i++) { keep(p); p.applyWeekly(); dismissAll(); } };

// who can see it
{
    const kid = life(16, Sex.female);
    check("under 18: no One-Night Stand on the Love tab", !/One-Night Stand/.test(loveTab(kid)));
    const adult = life(25, Sex.female);
    check("18+: it's on the Love tab", /One-Night Stand/.test(loveTab(adult)));
    OneNight.open(adult);
    const m = modals()[0];
    check("tapping it opens a choice: protection / no protection / never mind", m?.getTitle() === "One-Night Stand" && /Never mind/.test(JSON.stringify([m.getPositiveButton().getTitle(), m.getNegativeButton().getTitle(), m.getAdditionalButtons().get(0).getTitle()])));
    const wk = Relationships.now();
    m.getNegativeButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(m);
    check("Never mind: nothing happens (no night, no week)", OneNight.state(adult).count === 0 && Relationships.now() === wk);
    let ok = true;
    for (let i = 0; i < 200; i++) { const s = OneNight.stranger(adult); if (s.age < 18 || s.sex !== Sex.male) ok = false; }
    const gay = life(30, Sex.male, Sexuality.gay);
    for (let i = 0; i < 200; i++) { const s = OneNight.stranger(gay); if (s.age < 18 || s.sex !== Sex.male) ok = false; }
    const young = life(18, Sex.male);
    for (let i = 0; i < 200; i++) { const s = OneNight.stranger(young); if (s.age < 18) ok = false; }
    check("the other person is always 18+ and the sex you're attracted to", ok);
}
// you're a woman: you can get pregnant
{
    const p = life(26, Sex.female);
    const s = OneNight.stranger(p);
    const txt = withRandom(0.0, () => OneNight.night(p, s, false));
    dismissAll();
    const child: any = p.getFamilyState().getPregnantChild();
    check("a woman can get pregnant from a one-night stand", child != null && Babies.pregnant(p) && /positive pregnancy test/.test(txt), txt);
    check("…and the father is on record", child?.otherParent?.name === `${s.first} ${s.last}` && child?.otherParent?.oneNight === true);
    weeks(p, 42);
    const born = Relationships.family(Relationship.child, p).find((k: any) => k.otherParent?.oneNight);
    check("…the baby is born and joins your family", born != null && !born.getNotYetBorn());
    const rows = JSON.stringify(LoveScreens.aboutRows(born));
    check("…their details show the father (a one-night stand)", /one-night stand/.test(rows) && rows.includes(s.first));
    const again = withRandom(0.0, () => { OneNight.night(p, OneNight.stranger(p), false); return OneNight.night(p, OneNight.stranger(p), false); });
    void again; dismissAll();
    check("…and you can't get pregnant again while you're already expecting", Relationships.family(Relationship.child, p).filter((k: any) => k.getNotYetBorn()).length <= 1);
}
// you're a man: she tracks you down, the baby joins your family
{
    const p = life(28, Sex.male);
    const s = OneNight.stranger(p);
    withRandom(0.0, () => OneNight.night(p, s, false)); dismissAll();
    check("a man can get someone pregnant (she doesn't tell you right away)", OneNight.state(p).pending.length === 1 && p.getFamilyState().getPregnantChild() == null);
    shown.length = 0;
    const seen: string[] = [];
    for (let i = 0; i < 9; i++) { keep(p); p.applyWeekly(); seen.push(...shown.map((a) => a.getTitle() + ": " + a.getMessage())); dismissAll(); }
    const told = [...seen, ...News.state(p).items.map((i: any) => i.title + ": " + i.text)];
    check("…a few weeks later she tracks you down (a pop-up, or in News when weekly events go there)", told.some((t) => /tracked you down/.test(t) && t.includes(s.first)), told.join(" | ").slice(0, 200));
    const save = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
    const back: any = SaveCodec.decode(save).getSaveState().currentSlot().getPersonState();
    check("…saves keep the baby on the way", back.oneNight?.pending?.length === 1 && back.oneNight.pending[0].mother === s.first);
    weeks(p, 34);
    const kid = Relationships.family(Relationship.child, p).find((k: any) => k.otherParent?.oneNight);
    check("…the baby is born and is part of your family", kid != null && kid.otherParent.name === `${s.first} ${s.last}` && OneNight.state(p).kids === 1 && OneNight.state(p).pending.length === 0);
}
// who can't
{
    const never = (p: any, label: string) => { let n = 0; for (let i = 0; i < 40; i++) { withRandom(0.0, () => OneNight.night(p, { ...OneNight.stranger(p) }, false)); dismissAll(); } n = Relationships.family(Relationship.child, p).length + OneNight.state(p).pending.length; check(label, n === 0, String(n)); };
    never(life(30, Sex.male, Sexuality.gay), "two men: no baby");
    never(life(30, Sex.female, Sexuality.gay), "two women: no baby");
    const inf = life(30, Sex.female); inf.getTraitState().getTraits().add(Trait.infertile); never(inf, "infertile: no baby");
    never(life(52, Sex.female), "a woman over 45: no baby");
    const v = life(30, Sex.male); Vampire.rise(v); dismissAll(); Vampire.state(v).thirst = 0; never(v, "a vampire (dead): no baby");
}
// how likely
{
    const rate = (protection: boolean) => {
        const p = life(25, Sex.male); let n = 0;
        for (let i = 0; i < 3000; i++) { const s = OneNight.stranger(p); if (OneNight.canConceive(p, s) && Math.random() < (protection ? OneNight.chance.protection : OneNight.chance.none)) n++; }
        return n / 3000;
    };
    const a = rate(true), b = rate(false);
    check("protection makes a baby much less likely (~2% vs ~15%)", a < 0.04 && b > 0.1 && b < 0.2, `${(a * 100).toFixed(1)}% vs ${(b * 100).toFixed(1)}%`);
}
// cheating
{
    const p = life(30, Sex.male);
    const x: any = new Person(Relationship.lover, Sex.female, "Lane", 48 * 30); x.setFirstName("Ava"); x.setRelationshipProgress(900);
    p.getFamilyState().date(x); p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    OneNight.open(p);
    check("with a partner, it warns you it's cheating", /This would be cheating/.test(modals()[0]?.getMessage() ?? ""));
    dismissAll();
    // found out (dice 0.1 < 0.35), no baby (0.1 > 0.15? no: 0.1 < 0.15 makes a baby) — use protection so 0.1 > 2%
    const txt = withRandom(0.1, () => OneNight.night(p, OneNight.stranger(p), true)); dismissAll();
    check("…if they find out, it hurts (−40, upset) or they leave", /found out/.test(txt) && (x.getRelationshipProgress() <= 860 || p.getFamilyState().getPartner() == null), txt);
}
// No pop-ups for random events: the menu still asks, the surprise goes to News
{
    const gs: any = GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings();
    gs.noPopups = true;
    const p = life(28, Sex.male);
    OneNight.open(p);
    check("with No pop-ups for random events on, the One-Night Stand menu still pops up (you chose it)", modals().length === 1);
    dismissAll();
    withRandom(0.0, () => OneNight.night(p, OneNight.stranger(p), false)); dismissAll(); shown.length = 0;
    const mods: string[] = [];
    for (let i = 0; i < 44; i++) { keep(p); p.applyWeekly(); mods.push(...modals().map((a) => a.getTitle())); dismissAll(); }
    check("…but \"she's pregnant\" and the birth are random events: News, not pop-ups", !mods.some((t) => /Surprise|It's a/.test(t)) && News.state(p).items.some((i: any) => i.title === "A Surprise"), mods.join(" | "));
    gs.noPopups = false;
}
console.log(failures ? `\n${failures} FAILED` : "\nall one-night stand checks passed");
process.exit(failures ? 1 : 0);
