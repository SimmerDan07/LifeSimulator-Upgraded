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
const HOLIDAYS = /New Year|Valentine|Fireworks|Halloween|Harvest|Holidays|Feast/;

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
LifeMoments.enabled = true;
check("pop-ups for every event are off by default", !AlertManager.allPopups());

// ---------------------------------------------------------------- two years of weeks: only holidays pop up
{
    const p = start(30);
    p.getJobState().switchJob(Job.retail);
    for (let i = 0; i < 3; i++) Relationships.makeFriend("test", p);
    const popped: string[] = [];
    for (let w = 0; w < 96; w++) {
        keep(p);
        if (p.getJobState().getCurrentJob() == null) p.getJobState().switchJob(Job.retail);   // a layoff can happen
        if (w % 2) p.getJobState().work(p.getJobState().getCurrentJob(), WorkAction.normal); else p.applyWeekly();
        for (const a of shown) if (a.getType?.() !== AlertType.Banner) popped.push(a.getTitle());
        dismissAll();
    }
    const other = popped.filter((t) => !HOLIDAYS.test(t));
    check("in two years, only holidays popped up", other.length === 0 && popped.length > 0, `holidays ${popped.length - other.length}, other: ${other.slice(0, 6).join(" | ")}`);
    check("…about one holiday every two months", popped.length >= 8 && popped.length <= 16, `${popped.length}`);
    const n = News.state(p).items.length;
    check("everything else went to News", n > 10 && News.unread(p) > 0, `${n} news, ${News.unread(p)} unread`);
    const screen = new LifepathsModelGenerator().screen("news");
    check("the News screen lists them (newest first) and marks them read", JSON.stringify(screen).includes(News.state(p).items[n - 1].title) && News.unread(p) === 0);
    {   // attribute icons (−3 happiness) keep their icon font instead of turning into a box
        const sb = new SpannableStringBuilder("-3 "); ExtensionsKt.appendAttributeIcon$default(sb, PersonAttribute.happiness, null, 2, null);
        News.add({ getTitle: () => "Icon Test", getMessage: () => null, getAttributedMessage: () => sb, getImageId: () => null });
        const cell = JSON.stringify(News.cells(p).find((c: any) => JSON.stringify(c).includes("Icon Test")));
        check("News keeps attribute icons", /fa_solid/.test(cell), cell.slice(0, 200));
    }
}

// ---------------------------------------------------------------- choices made for you
{
    const p = start(40);
    shown.length = 0;
    Illness.catch(p, "appendicitis", "test");   // outside a week: the Treat dialog pops up (you caused it)
    check("outside the week (your own click) pop-ups still show", shown.some((a) => /Appendicitis/.test(a.getTitle())));
    dismissAll();
}
{
    const p = start(40);
    const before = cash(p);
    AlertManager.inWeek++;
    try { Illness.catch(p, "appendicitis", "test"); } finally { AlertManager.inWeek--; }
    check("an emergency during the week is treated for you (first treatment you can afford)", Illness.list(p)[0]?.course != null && cash(p) < before && shown.length === 0, JSON.stringify(Illness.list(p)));
    check("…and it's in News", News.state(p).items.some((x) => /Appendicitis/.test(x.title) && /Surgery/.test(x.chose ?? "")));
}
{
    const p = start(40);
    const parents = Array.from(p.getFamilyState().getParents() as any) as any[];
    parents[0].isAlive = false;
    for (const s of Relationships.siblings(p)) s.isAlive = false;
    parents[1].wealth = 300_000;
    const before = cash(p);
    AlertManager.inWeek++;
    try { parents[1].die(); } finally { AlertManager.inWeek--; }
    check("a will read during the week is accepted for you", cash(p) - before === 300_000 && shown.length === 0, `${cash(p) - before}`);
}
{
    const p = start(30);
    AlertManager.inWeek++;
    try { Crime.arrest(p, [{ crime: "burglary", title: "Burgle a House", week: 0, violent: false, sentence: [24, 96] }], "Caught."); } finally { AlertManager.inWeek--; }
    check("arrested during the week: the public defender takes the case", News.state(p).items.some((x) => /Arrested/.test(x.title) && /Public defender/.test(x.chose ?? "")) && shown.length === 0);
}
{
    start(50);
    shown.length = 0;
    AlertManager.inWeek++;
    try { AlertManager.INSTANCE.showAttributeLowAlertIfRequired(PersonAttribute.health, 1); } finally { AlertManager.inWeek--; }
    check("a 'you will die soon' warning still shows, as a small notice (not a blocking pop-up)", shown.length === 1 && shown[0].getType() === AlertType.Banner, shown.map((a) => `${a.getTitle()}:${a.getType()?.name?.()}`).join(","));
    dismissAll();
}

// ---------------------------------------------------------------- the setting
{
    const p = start(30);
    const gs: any = GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings();
    const vm = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.gameSettings, "", false);
    check("Game Settings has the pop-up switch", /Pop-ups for every event/.test(JSON.stringify(vm)));
    gs.allPopups = true;
    shown.length = 0;
    AlertManager.inWeek++;
    try { LifeMoments.banner("Test", "hello"); LifeMoments.result("Something Happened", "text", null); } finally { AlertManager.inWeek--; }
    check("with the switch on, everything pops up again", shown.some((a) => a.getTitle() === "Something Happened"));
    gs.allPopups = false;
    dismissAll();
    void p;
}

// ---------------------------------------------------------------- Spend Time with Everyone still works
{
    const p = start(30);
    p.getJobState().switchJob(Job.retail);
    for (let i = 0; i < 5; i++) Relationships.makeFriend("test", p);
    const st = p.getJobState().getState(Job.retail);
    const lvl = st.getLevel(), prog = st.getProgress();
    const before = cash(p);
    shown.length = 0;
    const weeks = FamilyExtras.spendTimeWithEveryone();
    check("Spend Time with Everyone: you still get paid", weeks >= 5 && cash(p) > before, `${weeks} weeks, ${before} -> ${cash(p)}`);
    check("…and still move toward a promotion", st.getLevel() > lvl || st.getProgress() > prog, `level ${lvl}->${st.getLevel()}, progress ${prog}->${st.getProgress()}`);
    const sum = shown.find((a) => a.getTitle() === "Time Well Spent");
    check("…the summary says so (and nothing else popped up)", !!sum && /went to work/.test(String(sum.getMessage())) && shown.filter((a) => a.getType?.() !== AlertType.Banner && !HOLIDAYS.test(a.getTitle())).length === 1, shown.map((a) => a.getTitle()).join(" | "));
    check("the Spend Time row mentions work", /still go to work/.test(JSON.stringify(FamilyExtras.spendTimeCell())));
}

// ---------------------------------------------------------------- holiday pop-ups can be turned off too
{
    const gs: any = GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings();
    check("holiday pop-ups are on by default", gs.holidayPopups !== false);
    const settings = JSON.stringify(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.gameSettings, "", false));
    check("Game Settings has a holiday pop-up switch", /Turn off holiday pop-ups/.test(settings));
    gs.holidayPopups = false;
    const p = start(30);
    const x: any = new Person(Relationship.lover, Sex.female, "Lane", 48 * 30); x.setFirstName("Ava"); x.setRelationshipProgress(500);
    p.getFamilyState().date(x); p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    const rel0 = x.getRelationshipProgress();
    const popped: string[] = [];
    for (let w = 0; w < 96; w++) { keep(p); p.applyWeekly(); for (const a of shown) if (a.getType?.() !== AlertType.Banner) popped.push(a.getTitle()); dismissAll(); }
    check("with it off, not even holidays pop up", popped.length === 0, popped.slice(0, 6).join(" | "));
    const hol = News.state(p).items.filter((i: any) => HOLIDAYS.test(i.title));
    check("…they go to News instead, with a choice made", hol.length >= 8 && hol.every((i: any) => !!i.chose), `${hol.length} ${hol.slice(0, 3).map((i: any) => i.title + "→" + i.chose).join(" | ")}`);
    check("…and the choice is never the harmful one", hol.every((i: any) => !/Skip|Forget|scam/.test(i.chose ?? "")), hol.map((i: any) => i.chose).join(", "));
    check("…a quiet Valentine's still helps the marriage", x.getRelationshipProgress() >= rel0 - 200, `${rel0} -> ${x.getRelationshipProgress()}`);
    // and it wins over "Pop-ups for every event"
    gs.allPopups = true;
    const before = popped.length;
    for (let w = 0; w < 48; w++) { keep(p); p.applyWeekly(); for (const a of shown) if (a.getType?.() !== AlertType.Banner && HOLIDAYS.test(a.getTitle())) popped.push(a.getTitle()); dismissAll(); }
    check("…even with pop-ups for every event on", popped.length === before, popped.slice(before).join(" | "));
    gs.allPopups = false;
    // the switch reads as a "turn off" switch: on = no holiday pop-ups
    const sw = (GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.gameSettings, "", false) as any);
    const rows: any[] = Array.from(sw.getContentViewModels?.() ?? sw);
    const row: any = rows.find((r: any) => /Turn off holiday/.test(JSON.stringify(r)));
    const swvm: any = row && Object.values(row).find((v: any) => v && typeof v.getOnValueChangedHandler === "function");
    check("the switch shows ON while holidays are off", !!swvm && swvm.getInitialValue() === true);
    swvm?.getOnValueChangedHandler().invoke(false);
    check("…and turning it off brings holidays back", gs.holidayPopups === true);
    gs.holidayPopups = true;
    // with holidays on: one pop-up per holiday; how it went is a small notice
    shown.length = 0;
    let q: any = null;
    for (let w = 0; w < 30 && !q; w++) { keep(p); p.applyWeekly(); q = shown.find((a) => a.getType?.() !== AlertType.Banner && HOLIDAYS.test(a.getTitle())); if (!q) dismissAll(); }
    shown.length = 0;
    const unread0 = News.unread(p);
    q?.getPositiveButton()?.getAction()?.invoke(); if (q) AlertManager.INSTANCE.alertDismissed(q);
    check("answering a holiday shows a small notice, not a second pop-up", !!q && shown.length >= 1 && shown.every((a) => a.getType?.() === AlertType.Banner), shown.map((a) => a.getTitle() + ":" + a.getType?.()).join(" | "));
    const last = News.state(p).items[News.state(p).items.length - 1];
    check("…answering it doesn't mark the rest of News as read", unread0 > 0 && News.unread(p) === unread0, `${unread0} -> ${News.unread(p)}`);
    check("…and it's kept in News with your choice", !!last && last.title === q?.getTitle() && !!last.chose && !!last.outcome, JSON.stringify(last).slice(0, 160));
    dismissAll();
}

// ---------------------------------------------------------------- a husband or wife earns too
{
    const p = start(35);
    const x: any = new Person(Relationship.lover, Sex.male, "Reed", 48 * 36); x.setFirstName("Sam"); x.setRelationshipProgress(800);
    p.getFamilyState().date(x);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.dating);
    const flow = () => p.getTotalCashFlowPerWeek().intValue();
    const f0 = flow();
    check("a partner you're only dating keeps their money", SpouseIncome.spouse(p) == null);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    const pay = SpouseIncome.weekly(x);
    check("a spouse has a job and a paycheck", pay > 0 && SpouseIncome.title(x).length > 0, `${SpouseIncome.title(x)} ${pay}`);
    check("…that shows in the weekly cash flow", flow() - f0 === pay, `${f0} -> ${flow()}`);
    const before = cash(p);
    keep(p); p.applyWeekly();
    check("…and lands in the family's money every week", cash(p) - before >= pay - 2000, `${cash(p) - before}`);
    check("the Love tab says what they do", /works as/.test(JSON.stringify(LoveScreens.tab())));
    x.ageInWeeks = 48 * 70;
    check("retired spouses bring in a pension", SpouseIncome.weekly(x) === Math.round(pay * 0.4) || Math.abs(SpouseIncome.weekly(x) - pay * 0.4) <= 1);
    p.setRomanticRelationshipStatus(RomanticRelationshipStatus.single);
    check("divorced: no more paycheck", SpouseIncome.spouse(p) == null);
}

// ---------------------------------------------------------------- v0.29.1/v0.29.4 No pop-ups for random events
{
    const gs: any = GameStateManager.INSTANCE.getGlobalStateManager().getGameSettings();
    const S = (k: string) => Utils.INSTANCE.getString(k);
    check("No pop-ups for random events is off by default", !gs.noPopups && !AlertManager.noPopups());
    const rows = () => JSON.stringify(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.gameSettings, "", false));
    check("Game Settings has the switch", /No pop-ups for random events/.test(rows()) && !/Small corner notices/.test(rows()));
    gs.noPopups = true;
    check("…on: the notices switch shows and the finer switches step aside", /Small corner notices/.test(rows()) && !/Pop-ups for every event/.test(rows()) && !/Turn off holiday/.test(rows()));
    gs.allPopups = true; gs.holidayPopups = true;   // even with the other settings asking for pop-ups
    const modals = () => shown.filter((a) => a.getType?.() !== AlertType.Banner);
    const banners = () => shown.filter((a) => a.getType?.() === AlertType.Banner);
    const p = start(30);
    p.getJobState().switchJob(Job.retail);
    for (let i = 0; i < 3; i++) Relationships.makeFriend("test", p);
    const x: any = new Person(Relationship.lover, Sex.female, "Lane", 48 * 30); x.setFirstName("Ava"); x.setRelationshipProgress(600);
    p.getFamilyState().date(x); p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
    shown.length = 0;
    const popped: string[] = []; let notes = 0;
    for (let w = 0; w < 104; w++) { keep(p); p.applyWeekly(); popped.push(...modals().map((a) => a.getTitle())); notes += banners().length; shown.length = 0; }
    check("two years of weeks: not one pop-up, holidays included", popped.length === 0, popped.slice(0, 5).join(" | "));
    check("…not even corner notices for what happened on its own", notes === 0, String(notes));
    const items = News.state(p).items;
    check("…it's all in News, holidays with a choice made", items.filter((i: any) => HOLIDAYS.test(i.title) && i.chose).length >= 8, String(items.length));
    // things that happen on their own: a reunion is skipped
    shown.length = 0;
    AlertManager.inWeek++; try { LifeMoments.trigger(p, "reunion"); } finally { AlertManager.inWeek--; }
    let last = News.state(p).items[News.state(p).items.length - 1];
    check("a school reunion doesn't pop up; it's skipped and in News", modals().length === 0 && last?.title === "School Reunion" && last?.chose === "Skip it", JSON.stringify(last)?.slice(0, 120));
    // …and a life moment is random even if it comes up while you're doing something
    shown.length = 0;
    LifeMoments.trigger(p, "reunion");
    last = News.state(p).items[News.state(p).items.length - 1];
    check("a life moment during a tap: still no pop-up (it's a random event)", modals().length === 0 && last?.chose === "Skip it");
    // v0.29.4: menus you open still pop up — the bug: Automatic Savings picked 25% on its own
    shown.length = 0;
    const save0 = Subscriptions.autoSave(p);
    Subscriptions.askAutoSave(p);
    check("the Automatic Savings menu pops up (and nothing is picked for you)", modals().length === 1 && modals()[0].getTitle() === "Automatic Savings" && Subscriptions.autoSave(p) === save0, `${modals().length} ${Subscriptions.autoSave(p)}`);
    { const m = modals()[0]; m.getAdditionalButtons().get(0).getAction().invoke(); AlertManager.INSTANCE.alertDismissed(m); }
    check("…and the % you pick is the % you get", Subscriptions.autoSave(p) === 50, String(Subscriptions.autoSave(p)));
    shown.length = 0;
    let did = false;
    AlertManager.INSTANCE.showConfirmationAlert(new AlertViewModel(S("Common_AreYouSure"), "Quit your job?", null, null, null, null, null, null, null, 504, null), { invoke: () => { did = true; } });
    check("\"Are you sure?\" after a tap: it asks you (nothing done yet)", !did && modals().length === 1);
    { const m = modals()[0]; m?.getPositiveButton()?.getAction()?.invoke(); if (m) AlertManager.INSTANCE.alertDismissed(m); }
    check("…Yes does it", did);
    shown.length = 0;
    AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Gym", "You worked out.", null, null, null, null, null, null, null, 504, null), false, 2, null);
    check("what you tapped tells you how it went, as usual", modals().length === 1 && modals()[0].getTitle() === "Gym");
    if (modals()[0]) AlertManager.INSTANCE.alertDismissed(modals()[0]);
    // a real action: unfriend someone (it asks "Are you sure?")
    const f = Relationships.friends(p)[0];
    shown.length = 0;
    const n0 = Relationships.friends(p).length;
    LoveActions.perform(loveAction("unfriend"), f, p);
    const ask = modals()[0];
    check("Unfriend asks first", modals().length === 1 && Relationships.friends(p).length === n0);
    ask?.getPositiveButton()?.getAction()?.invoke(); if (ask) AlertManager.INSTANCE.alertDismissed(ask);
    check("…and Yes unfriends", Relationships.friends(p).length === n0 - 1, `${n0} -> ${Relationships.friends(p).length}`);
    // a surprise while doing something: the pale stranger at the night club
    shown.length = 0;
    const r = Math.random; Math.random = () => 0;
    try { AlertManager.randomly(() => Vampire.maybeStranger(p, { name: () => "nightClub" })); } finally { Math.random = r; }
    check("the pale stranger (a surprise during a night out): no pop-up, a corner notice, and the path still opens", modals().length === 0 && banners().length >= 1 && Vampire.state(p).discovered === true);
    gs.popupNotices = false; shown.length = 0;
    AlertManager.randomly(() => AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Lucky Find", "You found $20 on the street.", null, null, null, null, null, null, null, 504, null), false, 2, null));
    check("…with notices off, not even that (still in News)", shown.length === 0 && News.state(p).items.some((i: any) => i.text === "You found $20 on the street."));
    gs.popupNotices = true;
    // a random question: declined
    shown.length = 0; let lent = false;
    const borrow: any = new AlertViewModel("Can I Borrow $500?", "Your friend needs money.", null, null, null,
        new AlertActionViewModel("Lend it", { invoke: () => { lent = true; } }), new AlertActionViewModel("No", { invoke: () => {} }), null, null, 408, null);
    borrow.random = true;
    AlertManager.showAlert$default(AlertManager.INSTANCE, borrow, false, 2, null);
    check("a friend asking to borrow money: no pop-up, politely declined (even with a plain \"No\")", modals().length === 0 && !lent);
    // getting arrested after a crime is a random event: no pop-up, public defender
    shown.length = 0;
    Crime.arrest(p, [{ crime: "shoplift", title: "Shoplifting", week: 0, violent: false, sentence: [4, 8] }], "A guard saw you.");
    check("arrested after a crime: no pop-up (it's handled for you)", modals().length === 0);
    // the only question left: wiping a save
    shown.length = 0; let wiped = false;
    AlertManager.INSTANCE.showConfirmationAlert(new AlertViewModel(S("Common_AreYouSure"), S("Alert_Restart_Descrption"), null, null, null, null, null, null, null, 504, null), { invoke: () => { wiped = true; } });
    check("\"erase your progress?\" asks (and nothing is erased)", modals().length === 1 && !wiped);
    { const m = modals()[0]; m?.getNegativeButton()?.getAction()?.invoke(); if (m) AlertManager.INSTANCE.alertDismissed(m); }
    // an achievement during the weeks never restarts your life on its own
    shown.length = 0;
    const ach: any = Achievement.values()[0];
    AlertManager.inWeek++; try { AlertManager.INSTANCE.showAchievementAlert(ach); } finally { AlertManager.inWeek--; }
    check("an achievement during the week: no pop-up, and your life goes on", modals().length === 0 && GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted());
    // dying of old age (the weeks going by): on to the tombstone, never an automatic second chance
    shown.length = 0;
    AlertManager.inWeek++; try { AlertManager.INSTANCE.showDeathAlertWithMessage("You have died.", "test"); } finally { AlertManager.inWeek--; }
    const d = News.state(p).items[News.state(p).items.length - 1];
    check("dying: no pop-up; the life ends (no automatic revive)", modals().length === 0 && !GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted() && d?.chose !== S("Alert_DeathAction_SecondChance"), JSON.stringify(d)?.slice(0, 140));
    gs.noPopups = false; gs.allPopups = false;
}

console.log(failures ? `\n${failures} FAILED` : "\nall pop-up checks passed");
process.exit(failures ? 1 : 0);
