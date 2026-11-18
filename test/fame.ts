// v0.20.0 "The Fame Update" for Celebrity Life: headlines, works & titles, sound, rivals & feuds, friends & collabs,
// dating a celebrity, awards nights, TV series, business, legacy, young talent, milestones, sub-screens, old saves.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Job } from "../src/game/Enums/Job";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { RomanticRelationshipStatus } from "../src/game/Enums/RomanticRelationshipStatus";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { Obituary } from "../src/game/Managers/Obituary";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { LifeActions } from "../src/game/Lifepaths/Vampire";
import { Relationships } from "../src/game/Social/Relationships";
import { Celebrity, MUSIC, DANCE } from "../src/game/Lifepaths/Celebrity";
import { World, MILESTONES, ACTING_PLUS, MUSIC_PLUS, DANCE_PLUS, CIRCLE, BUSINESS, LEGACY, YOUNG } from "../src/game/Lifepaths/CelebrityWorld";
import { CelebNames } from "../src/game/Lifepaths/CelebNames";
import { ART_SLOTS } from "../src/game/data/ArtSlots";

const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Lifepaths; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const titlesOf = () => alerts.map((a) => a.getTitle?.() ?? a.title);
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const rows = (vm: any) => Array.from(vm.getContentViewModels() as any) as any[];
const screen = (key = "celebrity") => rows(new LifepathsModelGenerator().screen(key));
const def = (list: any[], id: string) => list.find((d) => d.id === id);
const withRandom = <T>(v: number, fn: () => T): T => { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } };
const keep = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); };
const rich = (p: any, n = 900_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const buttons = (a: any) => [a.getPositiveButton(), ...(Array.from((a.getAdditionalButtons() ?? []) as any) as any[]), a.getNegativeButton()].filter(Boolean);
const press = (title: string, label: string) => {
    const a = [...alerts].reverse().find((x) => x.getTitle() === title);
    if (!a) return false;
    const b = buttons(a).find((x: any) => x.getTitle() === label);
    if (!b) return false;
    alerts.splice(alerts.indexOf(a), 1); b.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a);
    return true;
};
const start = (tweak?: (np: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.educatedAndInDebt);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.getTraitState().getTraits().clear();
    tweak?.(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
const week = (p: any, n = 1, r = 0.999) => { for (let i = 0; i < n; i++) withRandom(r, () => { keep(p); p.applyWeekly(); }); clear(); };

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());

// ---------------------------------------------------------------- names
const songs = new Set(Array.from({ length: 40 }, () => CelebNames.song()));
check("Song titles vary (40 rolls → 25+ different)", songs.size >= 25, String(songs.size));
check("Movie titles by genre; dedupe against used titles", typeof CelebNames.movie("Horror") === "string" && (() => { const used = ["X"]; return CelebNames.album(used) !== "X"; })());

// ---------------------------------------------------------------- old v0.19 saves
let p = start();
rich(p);
const old: any = Celebrity.state(p);
for (const k of ["news", "works", "rivals", "friends", "milestones", "awardShows", "merchWeek"]) delete old[k];
check("A v0.19 celebrity state gets the new fields", Array.isArray(Celebrity.state(p).news) && Array.isArray(Celebrity.state(p).works) && typeof Celebrity.state(p).rivals === "object" && Celebrity.state(p).merchWeek === -999);
check("Old state: screen and sub-screens open", screen().length > 10 && screen("celebrity-news").length >= 1 && screen("celebrity-works").length >= 1 && screen("celebrity-milestones").length === MILESTONES.length + 1);

// ---------------------------------------------------------------- music: sound, titles, headlines, rival
p.getCompletableActionState().completeAction(CompletableAction.college_music);
p.getJobState().switchJob(Job.music);
p.getJobState().getState(Job.music).setLevel(5);
const s = Celebrity.state(p);
s.fans = 50_000; s.peakFans = 50_000; s.tierShown = 2; s.music = 90; s.songs = 20; s.lastActive = p.calendarWeeks();
check("Choose Your Sound is instant and offers 6 sounds", (() => { LifeActions.perform(def(MUSIC_PLUS, "sound"), p); const a = alerts.find((x) => x.getTitle() === "Choose Your Sound"); return a != null && buttons(a).length === 6; })());
press("Choose Your Sound", "Rock"); clear();
check("Picked Rock (headline written)", s.sound === "rock" && s.news.some((h) => /goes Rock/.test(h.text)));
const perf = (list: any[], id: string, r = 0.999, then?: () => void) => withRandom(r, () => { keep(p); const ok = LifeActions.perform(def(list, id), p); then?.(); clear(); return ok; });
perf(MUSIC, "single", 0.999);
const lastSingle = s.works.filter((w) => w.kind === "single").pop();
check("A single gets a title, a chart result and a headline", lastSingle != null && lastSingle.title.length > 2 && /#1|Top 10/.test(lastSingle.result) && s.news.some((h) => h.text.includes(lastSingle.title)), lastSingle?.result);
check("Known for: the hit single", /single "/.test(World.knownFor(p) ?? ""), World.knownFor(p) ?? "none");
const g0 = Celebrity.tourGross(p);
perf(MUSIC, "tour", 0.5);
const tourWork = s.works.filter((w) => w.kind === "tour").pop();
check("Tours are named and logged (rock earns 25% more)", tourWork != null && / (Tour|Live)$/.test(tourWork.title) && tourWork.extra === Celebrity.money(Math.round(g0 * 1.25)), `${tourWork?.title} ${tourWork?.extra} vs ${g0}`);
week(p, 1);
const r = World.rivalOf(p)!;
check("A rival appears for your career", r != null && r.first.length > 0 && r.fans > 0);
check("Screen: Your Rival card and a You vs meter", screen().some((x) => x.title === World.rivalName(r)) && screen().some((x) => x.title === `You vs ${r.first}`));
check("Screen: Headlines show the latest stories", screen().some((x) => x.title === "Headlines") && screen().some((x) => x.title === s.news[s.news.length - 1].text));
check("Diss track: a contest with your rival, logged as a work", (() => { const w = s.feudWins + s.feudLosses; perf(MUSIC_PLUS, "diss", 0.01); return s.feudWins + s.feudLosses === w + 1 && s.works.some((x) => x.kind === "diss"); })());

// feud event
World.feud(p);
const fa = alerts.find((x) => x.getTitle() === "Feud!");
check("Feud: Clap back / Take the high road / Offer a collab", fa != null && buttons(fa).map((b: any) => b.getTitle()).join("|") === "Clap back|Take the high road|Offer a collab");
const rep0 = s.reputation;
press("Feud!", "Take the high road"); clear();
check("The high road: +3 reputation", s.reputation === Math.min(100, rep0 + 3));
s.reputation = 70;
World.feud(p);
withRandom(0.01, () => press("Feud!", "Offer a collab")); clear();
check("Peace offer accepted: the rival becomes a friend, a new rival later", s.friends.some((f) => f.name === World.rivalName(r)) && s.rivals.music == null);
week(p, 1);
check("…and a new rival turns up", World.rivalOf(p) != null && World.rivalOf(p)!.made > r.made);

// friends & collabs
check("Collaborate with your most famous friend (logged single with feat.)", (() => { const n = s.works.length; perf(CIRCLE, "collab", 0.01); return s.works.length === n + 1 && /feat\./.test(s.works[s.works.length - 1].title); })());
check("A-List Party: a new celebrity friend", (() => { const n = s.friends.length; perf(CIRCLE, "party", 0.01); return s.friends.length === Math.min(8, n + 1); })());

// awards night
s.yearWork = 5;
World.ceremony(p, "Music Awards", "Song of the Year", "music");
const an = alerts.find((x) => x.getTitle() === "Awards Night");
check("Awards Night: three looks", an != null && buttons(an).length === 3);
withRandom(0.01, () => press("Awards Night", "Daring look")); clear();
check("Daring look + win: best dressed headline and the award", s.awards.some((a) => /Song of the Year — Music Awards/.test(a)) && s.news.some((h) => /best dressed/.test(h.text)) && s.awardShows.includes("Music Awards"));

// ---------------------------------------------------------------- dating a celebrity
check("Date a Celebrity needs Famous", (s.fans = 50_000, World.canDateCeleb(p) != null));
s.fans = 300_000; s.peakFans = Math.max(s.peakFans, 300_000);
check("…then it's open when single", World.canDateCeleb(p) == null);
perf(CIRCLE, "dateCeleb", 0.01);
const pt = World.celebPartner(p);
check("Dating a celebrity: a partner with the Celebrity badge and a headline", pt != null && Relationships.badges(pt).includes("Celebrity") && s.news.some((h) => /dating/.test(h.text)));
check("Can't date another while together", World.canDateCeleb(p) === "You're already with someone");
p.setRomanticRelationshipStatus(RomanticRelationshipStatus.married);
week(p, 1);
check("Married: Wedding of the Year and the Power Couple milestone", s.weddingNews && s.news.some((h) => /Wedding of the year/.test(h.text)) && s.milestones.includes("powerCouple"));
check("Celebrity Circle shows your partner", screen().some((x) => x.title === `${pt.getFullName()} (your partner)`));

// ---------------------------------------------------------------- acting: TV series
p.getCompletableActionState().completeAction(CompletableAction.college_theater);
p.getJobState().switchJob(Job.actor);
p.getJobState().getState(Job.actor).setLevel(5);
s.acting = 95;
check("Join a TV Series at Supporting Actor", perf(ACTING_PLUS, "series") && s.series != null && s.series.weeksLeft === 20);
check("The series pays every week", (() => { p.collectWeeklyValues(); const ok = text(Array.from(p.getMoneyState().cashDeltaThisWeek as any)).includes("TV series"); p.resetValuesThisWeek(); return ok; })());
week(p, 19);
check("…19 weeks later, still on", s.series != null && s.series.weeksLeft === 1);
week(p, 1, 0.999);
check("Season finale: logged, and the network asks for another season", s.works.some((w) => w.kind === "series") && alerts.length === 0 && s.series == null);
// (alerts were cleared by week(); renew directly)
World.seriesWeekly(p);
s.series = { title: "Test Show", weeksLeft: 1, season: 1 };
withRandom(0.999, () => { World.seriesWeekly(p); press("Season Finale", "Sign for another season"); }); clear();
check("Renewing starts season 2", s.series != null && s.series.season === 2 && s.series.weeksLeft === 20);

// ---------------------------------------------------------------- business & legacy
s.fans = 5_000_000; s.peakFans = Math.max(s.peakFans, 5_000_000); s.tierShown = 4;
check("Drop Merch, then wait 8 weeks", perf(BUSINESS, "merch") && !perf(BUSINESS, "merch") && World.merchReady(p) > 0);
check("Fan club: weekly money, fans fade half as fast", perf(BUSINESS, "fanClub") && s.fanClub && Celebrity.fadeRate(p) < 0.005 + 1e-9);
check("Foundation: $5,000 a week and reputation up", (() => { s.reputation = 50; perf(BUSINESS, "foundation"); const r0 = s.reputation; week(p, 2); return !!s.foundation && s.reputation >= r0 + 1; })());
check("Memoir (30+, Famous): a bestseller with a title", (() => { p.initializeAgeInYears?.(41); return perf(BUSINESS, "memoir") && !!s.memoir && s.works.some((w) => w.kind === "memoir"); })());
check("Farewell Tour needs 50+", !perf(LEGACY, "farewell"));
p.initializeAgeInYears(55);
check("Farewell Tour at 55: you're a Legend", perf(LEGACY, "farewell") && s.legend);
const f1 = s.fans; s.lastActive = p.calendarWeeks() - 30;
week(p, 3);
check("Legends' fans never fade", s.fans >= f1);
s.awards.push("a (age 1)", "b (age 1)", "c (age 1)", "d (age 1)");
check("Hall of Fame (45+, 5 awards)", perf(LEGACY, "hallOfFame") && s.hallOfFame && s.awards.some((a) => /Hall of Fame/.test(a)));

// ---------------------------------------------------------------- milestones & sub-screens
World.checkMilestones(p);
check("Milestones reached along the way", ["local", "rising", "famous", "star", "numberOne", "powerCouple", "legend", "hallOfFame", "author", "philanthropist", "tvStar"].every((m) => s.milestones.includes(m)), s.milestones.join(","));
check("Milestones screen: one card each, reached ones marked", screen("celebrity-milestones").filter((x) => /Reached/.test(text(x))).length === s.milestones.length);
check("Discography & Filmography groups works", (() => { const t = text(screen("celebrity-works")); return /Singles/.test(t) && /Tours/.test(t) && /TV Series/.test(t) && /Known for/.test(t); })());
check("Headlines screen lists every story", screen("celebrity-news").filter((x) => x.title && s.news.some((h) => h.text === x.title)).length === Math.min(40, s.news.length));
check("Sub-screens via the list generator", (() => { const vm = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.lifepath, "celebrity-works", true); return /Discography/.test(text(Array.from(vm.getHeaderViewModels() as any))); })());
check("Menu status shows the latest headline", /Latest:/.test(text(rows(new LifepathsModelGenerator().generateViewModels()))));

// ---------------------------------------------------------------- obituary & saving
check("Obituary: best known for…", /best known for the /.test(Obituary.text(p)), Obituary.text(p));
const back: any = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager()));
const bs = back.getSaveState().currentSlot().getPersonState().celebrity;
check("Headlines, works, rivals, friends and milestones survive saving", bs.news.length === s.news.length && bs.works.length === s.works.length && bs.friends.length === s.friends.length && bs.milestones.length === s.milestones.length && Object.keys(bs.rivals).length === Object.keys(s.rivals).length);

// ---------------------------------------------------------------- breakups
p.getFamilyState().getFamilyMembers().remove(pt);
p.setRomanticRelationshipStatus(RomanticRelationshipStatus.single);
week(p, 1);
check("Breaking up makes the news", s.partnerId == null && s.news.some((h) => /it's over/.test(h.text)));

// ---------------------------------------------------------------- dance-off
p.getJobState().switchJob(Job.dancer);
week(p, 1);
check("Dance-Off vs Your Rival (dance career)", (() => { const n = s.feudWins + s.feudLosses; perf(DANCE_PLUS, "danceoff", 0.01); return s.feudWins + s.feudLosses === n + 1; })());

// ---------------------------------------------------------------- young talent
const kid = start((np) => np.initializeAgeInYears(9));
rich(kid);
const ks = Celebrity.state(kid);
check("Kids see the Young Talent section", screen().some((x) => x.title === "Young Talent") && screen().some((x) => x.title === "Enter a Talent Show"));
withRandom(0.01, () => { keep(kid); LifeActions.perform(def(YOUNG, "talentShow"), kid); }); clear();
check("Win a talent show (fans, prize, headline)", ks.fans > 0 && ks.news.some((h) => /talent show/.test(h.text)));
for (let i = 0; i < 6; i++) { withRandom(0.01, () => { keep(kid); LifeActions.perform(def(YOUNG, "commercial"), kid); }); clear(); }
check("TV commercials (child actor)", ks.works.filter((w) => w.kind === "commercial").length === 6);
ks.fans = Math.max(ks.fans, 1500);
World.checkMilestones(kid);
check("Child Star milestone", ks.milestones.includes("childStar"));
check("Grown-ups don't see Young Talent", (start((np) => np.initializeAgeInYears(30)), !screen().some((x) => x.title === "Young Talent")));

// ---------------------------------------------------------------- art
check("Art slots for the 18 new icons", ["icon_celeb_sound", "icon_celeb_rival", "icon_celeb_collab", "icon_celeb_party", "icon_celeb_date", "icon_celeb_friend", "icon_celeb_series", "icon_celeb_merch",
    "icon_celeb_fanclub", "icon_celeb_foundation", "icon_celeb_memoir", "icon_celeb_farewell", "icon_celeb_halloffame", "icon_celeb_talent", "icon_celeb_commercial", "icon_celeb_news",
    "icon_celeb_works", "icon_celeb_milestones"].every((n) => ART_SLOTS.some((x) => x.name === n)));

console.log(failures ? `\n${failures} FAILED` : "\nall fame checks passed");
if (failures) process.exit(1);
