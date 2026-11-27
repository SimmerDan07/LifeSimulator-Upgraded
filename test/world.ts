// v0.27.0 "The World Update": 37 countries, 35 languages, 113 things to do, birth country and skipping childhood.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { VacationModelGenerator } from "../src/game/Controllers/VacationModelGenerator";
import { EducationModelGenerator } from "../src/game/Controllers/EducationModelGenerator";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { ExtensionsKt } from "../src/game/Utils/ExtensionsKt";
import { Country } from "../src/game/Enums/Country";
import { Currency } from "../src/game/Enums/Currency";
import { Diet } from "../src/game/Enums/Diet";
import { Job } from "../src/game/Enums/Job";
import { Leisure } from "../src/game/Enums/Leisure";
import { Possession } from "../src/game/Enums/Possession";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { World } from "../src/game/World/World";
import { Activities } from "../src/game/World/Activities";
import { COUNTRY_DEFS, LANGUAGE_DEFS, seasonForMonth } from "../src/game/World/WorldData";
import { ACTIVITY_DEFS, ACTIVITY_CATEGORIES } from "../src/game/World/ActivityData";
import { Seasons } from "../src/game/Managers/Seasons";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Hobbies } from "../src/game/Managers/Hobbies";
import { Careers } from "../src/game/Careers/Careers";
import { Crime } from "../src/game/Crime/Crime";
import { AchievementBadge } from "../src/game/Enums/AchievementBadge";
import fs from "fs";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Leisure; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const drain = () => { for (let i = 0; i < 200 && alerts.length; i++) { const a = alerts.shift(); AlertManager.INSTANCE.alertDismissed(a); } };
const keep = (p: any) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100));
const rich = (p: any, n = 2_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const rows = (g: any) => Array.from(g.generateViewModels().getContentViewModels() as any) as any[];
const screen = (key: string) => Array.from(new LifepathsModelGenerator().screen(key).getContentViewModels() as any) as any[];
const titles = (rs: any[]) => rs.map((r) => r.title ?? r.getTitle?.()).filter((t) => typeof t === "string");
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const setMonth = (p: any, m: number) => p.setBirthMonth(m - Math.floor((p.calendarWeeks() % 48) / 4));
const imgs = JSON.parse(fs.readFileSync("src/ui/images.json", "utf8"));
const start = (age: number, tweak?: (np: any) => void, scenario = LifeScenario.sandboxMode) => {
    GameStateManager.INSTANCE.startNewGameFlow(scenario);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    if (age >= 0) np.initializeAge(age, true);
    np.getTraitState().getTraits().clear();
    tweak?.(np);
    GameStateManager.INSTANCE.startNewGame(np); drain();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const withRandom = (v: number, f: () => void) => { const r = Math.random; Math.random = () => v; try { f(); } finally { Math.random = r; } };
const lang = (id: string) => (CompletableAction as any)[id] as CompletableAction;

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
const { LifeMoments } = await import("../src/game/Managers/LifeMoments");
LifeMoments.enabled = false;

// ---------------------------------------------------------------- the data
{
    const all = Country.values();
    check("37 countries (7 original + 30 new)", all.length === 37 && COUNTRY_DEFS.length === 37);
    check("…with unique ordinals and names", new Set(all.map((c) => c.ordinal())).size === 37 && new Set(all.map((c) => c.getTitle())).size === 37);
    const badFlag = all.filter((c) => !imgs[c.getImageId() as any]);
    check("every country has a flag picture", badFlag.length === 0, badFlag.map((c) => c.name()).join(","));
    const bad = all.filter((c) => { try { return !c.getCurrency().getSymbol() || !(c.getDietOptions().length > 0) || !(c.getLeisureOptions().length > 0) || !(c.getLegalDrinkingAge() >= 16) || World.travelOption(c) == null; } catch { return true; } });
    check("every country has a currency, diets, leisure, a drinking age and a Move option", bad.length === 0, bad.map((c) => c.name()).join(","));
    check("35 languages (4 original + 31 new incl. English)", LANGUAGE_DEFS.length === 35 && LANGUAGE_DEFS.every((l) => lang(l.id)?.isLanguage()));
    check("…learned like the originals (skill, time, cost, picture)", LANGUAGE_DEFS.every((l) => { const a = lang(l.id); return a.getType().name() === "skill" && a.getTimeRequiredInWeeks() > 0 && Number(a.getCostPerWeek().toString()) > 0 && !!imgs[a.getImageId() as any]; }));
    check("every country's language exists", all.every((c) => World.requiredLanguage(c) != null));
    check("113 new activities in 8 groups plus a local favourite in every country", ACTIVITY_DEFS.length === 113 && ACTIVITY_CATEGORIES.length === 8 && all.every((c) => ACTIVITY_DEFS.some((a) => a.country === c.name())));
    check("…all real Leisure values with a title, mood effects and a picture", ACTIVITY_DEFS.every((a) => { const l = Activities.leisure(a.id); return l instanceof Leisure && l.getTitle() === a.title && l.getModifiers() != null && !!l.getImageId(); }));
    check("new currencies show their own symbol", (Currency as any).krw.getSymbol() === "₩" && (Currency as any).krw.getExchangeRate() === 1350);
}

// ---------------------------------------------------------------- birth country and native language
{
    const p = start(25, (np) => World.setBirthCountry(np, (Country as any).germany));
    check("born in Germany", p.getCountry() === (Country as any).germany && p.nativeLanguage === "german");
    check("…German counts as learned, English doesn't", World.knows(p, "german") && p.getCompletableActionState().isCompleted(lang("german")) && !World.knows(p, "english"));
    check("…money is shown in euros", /€/.test(ExtensionsKt.numberDisplayString(BigInteger.valueOf(100), true)));
    rich(p); p.getItemState().setItemOwned?.(Possession.passport, true); try { p.buyItem(Possession.passport); } catch { /* ignore */ }
    const us = World.travelOption(Country.unitedStates)!;
    check("moving to the US needs English for a German", /English/.test(us.requirementNotMetString(p) ?? ""), us.requirementNotMetString(p) ?? "");
    p.getCompletableActionState().completeAction(lang("english"));
    check("…which you can learn", us.requirementNotMetString(p) == null, us.requirementNotMetString(p) ?? "");
    keep(p); p.leisureAction(us); drain();
    check("…and then move", p.getCountry() === Country.unitedStates);
    // old saves: everyone was born in the US
    delete p.nativeLanguage;
    check("old saves: native language is English", World.native(p) === "english" && World.knows(p, "english"));
    // the customize screen
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.sandboxMode);
    const vms = Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.customizeGame, "", true).getContentViewModels() as any) as any[];
    const picker = vms.find((v) => v.title === "Birth Country");
    check("the new-game screen has a Birth Country picker with all 37", picker != null && picker.getOptionsViewModels().length === 37);
    picker.getOptionsViewModels().find((o: any) => o.getTitle() === "Japan").getOnSelected().invoke();
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    check("…picking Japan makes you a Japanese speaker", np.getCountry() === Country.japan && np.nativeLanguage === "japanese");
}

// ---------------------------------------------------------------- skipping childhood
{
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.youngChild);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    check("a newborn scenario starts at 0", np.getAgeInYears() === 0);
    let vms = Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.customizeGame, "", true).getContentViewModels() as any) as any[];
    const sw = vms.find((v) => /Skip childhood/.test(v.title ?? ""));
    check("…and offers Skip childhood", sw != null);
    sw.getSwitchViewModel().getOnValueChangedHandler().invoke(true);
    check("…which makes you 13", np.getAgeInYears() === 13);
    vms = Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.customizeGame, "", true).getContentViewModels() as any) as any[];
    check("…and stays on the screen to switch back", vms.some((v) => /Skip childhood/.test(v.title ?? "")));
    GameStateManager.INSTANCE.startNewGame(np); drain();
    const p: any = GameStateManager.INSTANCE.getPersonState();
    check("you start at 13 with elementary school done", p.getAgeInYears() === 13 && p.getCompletableActionState().isCompleted(CompletableAction.elementarySchool) && !p.getCompletableActionState().isCompleted(CompletableAction.highSchool));
    check("…living with your parents", p.getHousingState().currentHousing().getType().name() === "parentsHouse");
}

// ---------------------------------------------------------------- the Leisure tab
{
    const p = start(25, (np) => World.setBirthCountry(np, (Country as any).brazil)); keep(p); rich(p);
    const t = titles(rows(new VacationModelGenerator()));
    check("Leisure tab: Only Here, Things to Do, Move Abroad", t.includes("Only Here: Brazil") && t.includes("Things to Do") && t.includes("Move Abroad") && ACTIVITY_CATEGORIES.every((c) => t.includes(c.title)), t.join(" | ").slice(0, 400));
    check("Move Abroad has four regions", ["The Americas", "Europe", "Asia & the Pacific", "Middle East & Africa"].every((r) => t.includes(r)));
    const eu = titles(screen("world:europe"));
    check("…a region lists its countries", eu.some((x) => /Germany/.test(x)) && eu.some((x) => /Iceland/.test(x)));
    const fun = titles(screen("activities:fun"));
    check("a group screen lists its activities", fun.includes("Escape Room") && fun.includes("Theme Park Day"));
    // seasons are flipped in Brazil
    setMonth(p, 11);
    check("December is summer in Brazil", Seasons.season(p) === "summer" && seasonForMonth(11, "brazil") === "summer" && seasonForMonth(11, "germany") === "winter");
    const carnival = Activities.leisure("rioCarnival");
    setMonth(p, 1);
    check("Rio Carnival is in February…", carnival.requirementNotMetString(p) == null, carnival.requirementNotMetString(p) ?? "");
    setMonth(p, 5);
    check("…and only then", /February/.test(carnival.requirementNotMetString(p) ?? ""));
    check("Oktoberfest only in Germany", /Germany/.test(Activities.leisure("oktoberfest").requirementNotMetString(p) ?? ""));
    check("no snow in tropical Brazil", !Seasons.snow(p));
    // doing things
    const c0 = Hobbies.skill("cooking", p);
    keep(p); p.leisureAction(Activities.leisure("cookingClass")); drain();
    check("a cooking class trains Cooking", Hobbies.skill("cooking", p) > c0);
    const f0 = Activities.fightBonus(p);
    keep(p); p.leisureAction(Activities.leisure("martialArts")); drain();
    check("martial arts make you better in a fight", Activities.fightBonus(p) > f0);
    const m0 = cash(p);
    withRandom(0.01, () => { keep(p); p.leisureAction(Activities.leisure("casino")); }); drain();
    check("the casino can pay out (jackpot)", cash(p) > m0 + 20000, `${m0} → ${cash(p)}`);
    check("casinos are banned in some countries", (() => { p.setCountry((Country as any).uae); const r = /Not allowed/.test(Activities.leisure("casino").requirementNotMetString(p) ?? ""); p.setCountry((Country as any).brazil); return r; })());
    // kids
    const k = start(10);
    check("family activities are free for kids", Number(Activities.leisure("themePark").getCost().toString()) === 0);
    check("…bars aren't open to them", Activities.leisure("rooftopBar").requirementNotMetString(k) != null);
    check("…and nobody under 18 moves abroad alone", /18/.test(World.travelOption(Country.japan)!.requirementNotMetString(k) ?? ""));
    // vampires
    const v = start(30); keep(v); Vampire.rise(v); drain(); setMonth(v, 3);
    const h0 = v.getAttributeState().getHappiness();
    keep(v); const before = v.getAttributeState().getHappiness();
    Vampire.onLeisure(v, Activities.leisure("hiking"));
    check("outdoor activities burn vampires; night ones don't", v.getAttributeState().getHappiness() < before && !Vampire.isDaytime(Activities.leisure("stargazing")), `${h0} ${before} ${v.getAttributeState().getHappiness()}`);
}

// ---------------------------------------------------------------- languages, pay and careers
{
    const p = start(30); keep(p); rich(p);
    const edu = titles(rows(new EducationModelGenerator()));
    check("Education tab: a Languages row opens all 35", edu.includes("Languages"));
    const ls = titles(screen("languages"));
    check("…grouped (native, for moving, others)", ls.includes("Your Native Language") && ls.includes("Languages for Moving Abroad") && ls.includes("Other Languages") && ls.includes("Latin") && ls.includes("German"));
    const j = Careers.job("translator");
    check("translators need a foreign language", /foreign language/.test(Careers.applyBlock(j, p) ?? ""));
    p.getCompletableActionState().completeAction(lang("german"));
    check("…which German is", Careers.applyBlock(j, p) == null);
    check("foreign languages raise pay (+1% each)", Math.abs(World.payMultiplier(p, Job.retail) - 1.01) < 1e-9);
    p.getCompletableActionState().completeAction(lang("latin"));
    check("Latin pays doctors 5% more", World.payMultiplier(p, Job.medical) > World.payMultiplier(p, Job.retail) + 0.04);
    // local jobs stay in their country
    p.setCountry(Country.japan);
    p.getJobState().switchJob(Job.sushiChef);
    p.getCompletableActionState().completeAction(lang("french"));
    p.buyItem?.(Possession.passport);
    keep(p); p.leisureAction(World.travelOption(Country.france)!); drain();
    check("moving away from Japan ends a sushi chef job", p.getCountry() === Country.france && p.getJobState().getCurrentJob() == null);
    check("…which is Japan-only in the Career Center", /Only in Japan/.test(Careers.applyBlock(Job.sushiChef, p) ?? ""));
    check("the Work tab has no job and the Career Center", titles(rows(new WorkModelGenerator())).includes("No job right now"));
}

// ---------------------------------------------------------------- prison and the Leisure tab
{
    const p = start(25); keep(p);
    Crime.sendToJail(p, 20, "Theft", false, false); drain();
    const t = titles(rows(new VacationModelGenerator()));
    check("in prison the Leisure tab is the yard", t.includes("Prison Yard") && !t.includes("Things to Do") && !t.includes("Move Abroad"));
    check("…and activities are locked", /prison/.test(Activities.leisure("hiking").requirementNotMetString(p) ?? ""));
}

// ---------------------------------------------------------------- saves
{
    const p = start(30, (np) => World.setBirthCountry(np, (Country as any).southKorea)); keep(p);
    p.leisureAction(Activities.leisure("arcade")); drain();
    const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
    const bp = back.getSaveState().currentSlot().getPersonState();
    check("saves keep the new country, native language and activity history", bp.getCountry() === (Country as any).southKorea && bp.nativeLanguage === "korean" && bp.activityStats?.arcade === 1);
    check("the local diet is offered in new countries", (Country as any).southKorea.getDietOptions().includes(Diet.localCuisine) && /Korean/.test(Diet.localCuisine.getTitle()));
}

// ---------------------------------------------------------------- consistency fixes found while playing
{
    const p = start(30, (np) => World.setBirthCountry(np, (Country as any).brazil)); keep(p);
    check("story prices are shown in the local currency", ExtensionsKt.localizeDollars("Go ($800)") === `Go (${ExtensionsKt.numberDisplayString(BigInteger.valueOf(800), true)})` && /R\$/.test(ExtensionsKt.localizeDollars("$5,000 a week")), ExtensionsKt.localizeDollars("Go ($800) · $5,000 a week · $1M"));
    check("…and an already-local price isn't touched", ExtensionsKt.localizeDollars("R$500") === "R$500");
    const us = start(30); keep(us);
    check("…in the US nothing changes", ExtensionsKt.localizeDollars("Go ($800)") === "Go ($800)");
    check("a or an before a job title", ExtensionsKt.aOrAn("Interpreter") === "an Interpreter" && ExtensionsKt.aOrAn("Nurse") === "a Nurse" && ExtensionsKt.aOrAn("Underboss") === "an Underboss");
    check("every language says where it lets you move (old ones too)", /Needed to move to France/.test((CompletableAction as any).french.getDescription()) && /Mexico/.test((CompletableAction as any).spanish.getDescription()));
    check("festival blurbs don't repeat the month", !/\(February\)/.test(Activities.note(Activities.leisure("rioCarnival")) ?? ""));
}
{
    const p = start(30); keep(p);
    check("Bilingual isn't free for speaking your native language", !AchievementBadge.bilingual.achieved(p));
    p.getCompletableActionState().completeAction((CompletableAction as any).german);
    check("…one more language earns it", AchievementBadge.bilingual.achieved(p));
}

void WorkAction;
console.log(failures ? `\n${failures} FAILED` : "\nall world update checks passed");
process.exit(failures ? 1 : 0);
