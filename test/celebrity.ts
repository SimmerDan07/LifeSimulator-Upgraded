// v0.19.0: Celebrity Life (Lifepaths › star). Careers only offered there (Acting, reworked Music, new Dance),
// fans and tiers, fame gates on promotions, degrees, activities, team, events, awards, inheritance, obituary.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Job } from "../src/game/Enums/Job";
import { WorkAction } from "../src/game/Enums/WorkAction";
import { CompletableAction } from "../src/game/Enums/CompletableAction";
import { LifepathsModelGenerator } from "../src/game/Controllers/LifepathsModelGenerator";
import { GenericListModelGenerator } from "../src/game/Controllers/GenericListModelGenerator";
import { WorkModelGenerator } from "../src/game/Controllers/WorkModelGenerator";
import { ProfileModelGenerator } from "../src/game/Controllers/ProfileModelGenerator";
import { GenericListType } from "../src/game/Fragments/GenericListType";
import { Modifiers } from "../src/game/Managers/Modifiers";
import { MoneyState } from "../src/game/Managers/MoneyState";
import { MoneyUpdateType } from "../src/game/Enums/MoneyUpdateType";
import { Generations } from "../src/game/Managers/Generations";
import { Obituary } from "../src/game/Managers/Obituary";
import { Lineage } from "../src/game/Managers/Lineage";
import { FamilyTree } from "../src/game/Social/FamilyTree";
import { SaveCodec } from "../src/game/save/SaveCodec";
import { BigInteger } from "../src/game/runtime";
import { LifeActions } from "../src/game/Lifepaths/Vampire";
import { Vampire } from "../src/game/Lifepaths/Vampire";
import { Celebrity, ACTING, MUSIC, DANCE, FAME, TEAM, TIERS, WALK_OF_FAME } from "../src/game/Lifepaths/Celebrity";
import { BUSINESS } from "../src/game/Lifepaths/CelebrityWorld";
import { ART_SLOTS } from "../src/game/data/ArtSlots";

const alerts: any[] = [];
const navs: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo(t: any, k: any) { navs.push([t, k]); }, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Lifepaths; } }
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const titlesOf = () => alerts.map((a) => a.getTitle?.() ?? a.title);
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };
const text = (vm: any): string => JSON.stringify(vm, (k, v) => (k === "parent" ? undefined : v));
const rows = (vm: any) => Array.from(vm.getContentViewModels() as any) as any[];
const menu = () => rows(new LifepathsModelGenerator().generateViewModels());
const celeb = () => rows(new LifepathsModelGenerator().screen("celebrity"));
const titles = (rs: any[]) => rs.map((r) => r.title).filter((t) => typeof t === "string");
const def = (list: any[], id: string) => list.find((d) => d.id === id);
const withRandom = <T>(v: number, fn: () => T): T => { const r = Math.random; Math.random = () => v; try { return fn(); } finally { Math.random = r; } };
const keep = (p: any) => { p.getAttributeState().setDeltaValueImmediate(new Modifiers(100, 100, 100)); };
const rich = (p: any, n = 50_000_000) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(n), MoneyUpdateType.workIncome, null, null, 12, null);
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const start = (sc: any, tweak?: (np: any) => void) => {
    GameStateManager.INSTANCE.startNewGameFlow(sc);
    const np: any = GameStateManager.INSTANCE.getNewGamePlayerState();
    np.getTraitState().getTraits().clear();
    tweak?.(np);
    GameStateManager.INSTANCE.startNewGame(np); clear();
    return GameStateManager.INSTANCE.getPersonState() as any;
};
/** Press the button labelled `label` on the newest alert titled `title`. */
const press = (title: string, label: string) => {
    const a = [...alerts].reverse().find((x) => x.getTitle() === title);
    if (!a) return false;
    const bs = [a.getPositiveButton(), a.getNegativeButton(), ...(Array.from((a.getAdditionalButtons() ?? []) as any) as any[])].filter(Boolean);
    const b = bs.find((x: any) => x.getTitle() === label);
    if (!b) return false;
    alerts.splice(alerts.indexOf(a), 1); b.getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a);
    return true;
};
const work = (p: any, n = 1) => { for (let i = 0; i < n; i++) { keep(p); p.getJobState().work(p.getJobState().getCurrentJob(), WorkAction.values()[1]); clear(); } };

GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());

// ---------------------------------------------------------------- the menu and the careers
let p = start(LifeScenario.educatedAndInDebt);
rich(p);
check("Lifepaths tab is a menu with Celebrity Life (star) and Vampire", titles(menu()).includes("Celebrity Life") && titles(menu()).includes("Vampire") && !titles(menu()).includes("Seek the Ancient"));
check("Celebrity Life row uses the star icon", menu().find((r) => r.title === "Celebrity Life")?.imageId === "lifepath_celebrity" || /lifepath_celebrity/.test(text(menu().find((r) => r.title === "Celebrity Life"))));
const openRow = menu().find((r) => r.title === "Celebrity Life");
navs.length = 0;
openRow.getActionButton().getAction().invoke();
check("Open goes to the Celebrity Life screen", navs.length === 1 && navs[0][0] === GenericListType.lifepath && navs[0][1] === "celebrity");
const vm = GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.lifepath, "celebrity", true);
check("…titled Celebrity Life", /Celebrity Life/.test(text(Array.from(vm.getHeaderViewModels() as any))));
check("Vampire screen still works from the menu", /Vampire/.test(text(Array.from(GenericListModelGenerator.INSTANCE.genericListViewModels(GenericListType.lifepath, "vampire", true).getHeaderViewModels() as any))));

const workTitles = () => rows(new WorkModelGenerator().generateViewModels()).map((r) => r.title);
check("Work tab no longer lists Acting/Music/Dance", !text(rows(new WorkModelGenerator().generateViewModels())).match(/Street Performer|Extra|Street Dancer/));
const screen = celeb();
// v0.27.0: the three fame careers live in the Career Center (Entertainment & Fame); Celebrity Life links there
const fameCareers = rows(new LifepathsModelGenerator().screen("careers:entertainment"));
check("the Career Center's Entertainment & Fame group lists the three careers; Celebrity Life links to it", /Extra/.test(text(fameCareers)) && /Street Performer/.test(text(fameCareers)) && /Street Dancer/.test(text(fameCareers)) && screen.some((r) => r.title === "Fame Careers"));
check("…with Fans and Reputation meters", screen.some((r) => r.title === "Fans") && screen.some((r) => r.title === "Reputation"));
check("…and Acting, Music, Dance, Fame, Your Team, Awards sections", ["Acting", "Music", "Dance", "Fame", "Your Team"].every((h) => screen.some((r) => r.title === h)) && screen.some((r) => /^Awards & Records/.test(r.title ?? "")));
check("Job titles: Acting starts as Extra; Music ladder reworked; Dance ladder", Job.actor.getJobTitles()[0] === "Extra" && Job.music.getJobTitles()[0] === "Street Performer" && Job.music.getJobTitles().length === 9 && Job.dancer.getJobTitles()[0] === "Street Dancer");
check("Theater degree gates Acting at Theater Ensemble and Dance at Dance Captain", Job.actor.educationRequirement(4) === CompletableAction.college_theater && Job.actor.educationRequirement(3) == null && Job.dancer.educationRequirement(5) === CompletableAction.college_theater && Job.dancer.educationRequirement(4) == null);
check("Music & Production degree gates Recording Artist", Job.music.educationRequirement(5) === CompletableAction.college_music && Job.music.educationRequirement(4) == null);
check("Degree descriptions mention Celebrity Life", /Celebrity Life/.test(CompletableAction.college_music.getDescription()) && /Celebrity Life/.test(CompletableAction.college_theater.getDescription()));

// apply for Dance from the Celebrity Life screen
const danceCard = fameCareers.find((r) => /Street Dancer/.test(r.title ?? ""));
danceCard.getButton?.()?.getAction?.()?.invoke?.() ?? danceCard.button?.action?.invoke?.();
if (p.getJobState().getCurrentJob() !== Job.dancer) p.getJobState().switchJob(Job.dancer);
check("Apply from Celebrity Life: now a Street Dancer", p.getJobState().getCurrentJob() === Job.dancer);
check("Work tab shows the celebrity job and a note to Lifepaths", /Street Dancer/.test(text(rows(new WorkModelGenerator().generateViewModels()))) && /Celebrity Life/.test(text(rows(new WorkModelGenerator().generateViewModels()))));
check("Celebrity Life screen has the Work buttons in the footer", (new LifepathsModelGenerator().screen("celebrity").getFooterViewModels()?.size?.() ?? 0) > 0);
const before = Celebrity.fans(p);
work(p, 5);
check("Working a celebrity job earns fans and skill", Celebrity.fans(p) > before && Celebrity.state(p).dance >= 5, `${Celebrity.fans(p)} fans, dance ${Celebrity.state(p).dance}`);

// fame gate: Dance Captain (5) needs Local Talent
const st = p.getJobState().getState(Job.dancer);
st.setLevel(4); st.setProgress(9999);
p.getCompletableActionState().completeAction(CompletableAction.college_theater);
Celebrity.state(p).fans = 10; Celebrity.state(p).blockShown = null;
keep(p); p.getJobState().work(Job.dancer, WorkAction.values()[1]);
check("Not famous enough: no promotion to Dance Captain, with an alert", st.getLevel() === 4 && titlesOf().includes("Not Famous Enough Yet"), titlesOf().join(","));
clear();
check("The job card (top of the Work tab) says what fame the next promotion needs", /Next promotion needs: Local Talent/.test(text(rows(new WorkModelGenerator().generateViewModels()))));
Celebrity.state(p).fans = 5000;
st.setProgress(9999);
keep(p); p.getJobState().work(Job.dancer, WorkAction.values()[1]); clear();
check("With 5K fans (Local Talent): promoted to Dance Captain", st.getLevel() === 5, String(st.getLevel()));

// ---------------------------------------------------------------- tiers and fans
check("Tiers: 1K Local Talent, 10K Rising Star, 100K Famous, 1M Star, 10M Superstar, 100M Icon", TIERS.map((t) => t.min).join() === "0,1000,10000,100000,1000000,10000000,100000000");
check("Fans text: 12.4K, 3.5M", Celebrity.fansText(12400) === "12.4K" && Celebrity.fansText(3_500_000) === "3.5M");
Celebrity.state(p).tierShown = 1;
Celebrity.addFans(p, 20000);
check("Crossing a tier shows an alert", titlesOf().some((t) => /Rising Star/.test(t)), titlesOf().join(","));
clear();
check("Profile shows Fame", /Fame/.test(text(rows(new ProfileModelGenerator().generateViewModels()))));

// ---------------------------------------------------------------- activities
const s = Celebrity.state(p);
const perf = (list: any[], id: string, r = 0.01, then?: () => void) => withRandom(r, () => { keep(p); const ok = LifeActions.perform(def(list, id), p); then?.(); clear(); return ok; });
check("Dance Practice raises dance skill", (() => { const d = s.dance; perf(DANCE, "dancePractice"); return s.dance === Math.min(100, d + 4); })());
check("Dance Battle can be won (fans + $1,000)", (() => { const b = s.battlesWon; perf(DANCE, "battle"); return s.battlesWon === b + 1; })());
check("Choreograph a Show unlocked at Dance Captain", perf(DANCE, "choreograph"));
check("World Dance Championship: once a year", perf(DANCE, "championship") && !perf(DANCE, "championship") && s.awards.some((a) => /World Dance Champion/.test(a)));
check("Acting activities are locked outside an acting career", !perf(ACTING, "audition"));
check("Record a Single locked without a music career", !perf(MUSIC, "single"));
check("Write a Song works for anyone 10+", perf(MUSIC, "writeSong") && s.songs === 1);

// switch to music
p.getJobState().switchJob(Job.music);
p.getJobState().getState(Job.music).setLevel(5);
p.getCompletableActionState().completeAction(CompletableAction.college_music);
for (let i = 0; i < 9; i++) perf(MUSIC, "writeSong");
s.music = 60;
check("Record a Single (a hit with a good roll)", (() => { const h = s.hits; perf(MUSIC, "single", 0.99); return s.singles === 1 && s.hits === h + 1; })());
check("Release an Album needs 8 songs and Recording Artist", perf(MUSIC, "album", 0.9) && s.albums === 1 && s.songs === 1);
check("Go on Tour pays ticket sales", (() => { const c = cash(p); perf(MUSIC, "tour"); return s.tours === 1 && cash(p) > c - 10000; })());
check("Shoot a Music Video", perf(MUSIC, "musicVideo"));
check("On the Music screen the Music section comes first", (() => { const r = celeb(); const i = (h: string) => r.findIndex((x) => x.title === h); return i("Music") < i("Acting") && i("Music") < i("Dance"); })());

// switch to acting
p.getJobState().switchJob(Job.actor);
p.getJobState().getState(Job.actor).setLevel(7);
check("Audition (success gives a role)", (() => { const r0 = s.roles; perf(ACTING, "audition", 0.01); return s.roles === r0 + 1; })());
s.acting = 90;
check("Star in a Movie at Lead Actor: pick a genre (blockbuster with a great roll)", (() => { const m = s.movies; perf(ACTING, "movie", 0.999, () => press("Choose a Role", "Action")); return s.movies === m + 1 && s.works.some((w: any) => w.kind === "movie" && w.result === "Blockbuster" && w.extra === "Action"); })());

// fame and team
s.fans = 2_000_000; s.tierShown = 4;
check("Red Carpet / Talk Show / Gala / Brand available as a Star", ["redCarpet", "talkShow", "gala"].every((id) => perf(FAME, id, 0.5)) && perf(BUSINESS, "brand") && !!s.brand);
check("Brand earns money every week", Celebrity.brandIncome(p) === Math.round(s.fans * 0.001));
check("Walk of Fame locked below Icon (or Superstar with 3 awards)", !perf(WALK_OF_FAME, "walkOfFame"));
LifeActions.perform(def(TEAM, "agent"), p); LifeActions.perform(def(TEAM, "publicist"), p); LifeActions.perform(def(TEAM, "bodyguard"), p);
check("Hire agent, publicist and bodyguard", s.agent && s.publicist && s.bodyguard);
check("Team costs $5,000 a week", Celebrity.weeklyCosts(p).reduce((a, x) => a + x.amount, 0) === 5000);
check("Royalties from fans, hits, albums and movies", Celebrity.royalties(p) > 1000);

// reputation and cancelling
s.reputation = 15; Celebrity.rep(p, -10);
check("Reputation at 10 or less: cancelled, the agent leaves", s.cancelled && !s.agent && titlesOf().includes("You've Been Cancelled"));
clear();
Celebrity.rep(p, 40);
check("Back to 35: the comeback", !s.cancelled && titlesOf().includes("The Comeback"));
clear();

// scandal choices
s.reputation = 60; const f0 = s.fans;
Celebrity.scandal(p);
const sc = alerts.find((a) => a.getTitle() === "Tabloid Scandal");
check("Scandal: three choices (Apologize / Deny it / Lean into it)", sc != null && sc.getPositiveButton().getTitle() === "Apologize" && sc.getNegativeButton().getTitle() === "Lean into it" && Array.from(sc.getAdditionalButtons() as any).length === 1);
sc.getPositiveButton().getAction().invoke(); clear();
check("Apologizing costs a little reputation and a few fans", s.reputation === 56 && s.fans < f0);

// fans fade when quiet; the week hooks
s.lastActive = p.calendarWeeks() - 10;
const f1 = s.fans;
withRandom(0.999, () => { keep(p); p.applyWeekly(); }); clear();
check("Fans fade when you go quiet (0.5% with a publicist)", s.fans < f1 && s.fans >= Math.floor(f1 * 0.995) - 1, `${f1} → ${s.fans}`);

// awards
s.yearWork = 5; s.awardYear = Math.floor(p.calendarWeeks() / 48) - 1;
const a0 = s.awards.length;
withRandom(0.01, () => { keep(p); p.applyWeekly(); press("Awards Night", "Classic & elegant"); }); clear();
check("Yearly awards: a busy year wins one (after the red carpet)", s.awards.length === a0 + 1 && /Golden Star Awards/.test(s.awards[s.awards.length - 1]), s.awards.join(" | "));
check("Awards & Records lists it", /Golden Star Awards/.test(text(celeb())));

// dating
check("Fame helps dating", Celebrity.datingMultiplier(p) > 1.3);

// vampire crossover
Vampire.state(p).isVampire = true; Vampire.state(p).suspicion = 0;
withRandom(0.999, () => { keep(p); Vampire.state(p).thirst = 0; p.applyWeekly(); }); clear();
check("A famous vampire draws suspicion (cameras everywhere)", Vampire.state(p).suspicion >= 1);
Vampire.state(p).isVampire = false;

// save / load
const saved = SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager());
const back: any = SaveCodec.decode(saved);
const bp = back.getSaveState().currentSlot().getPersonState();
check("Fans, awards and records survive saving", bp.celebrity.fans === s.fans && bp.celebrity.awards.length === s.awards.length && bp.celebrity.brand === s.brand);

// obituary, family line, heir
s.peakFans = Math.max(s.peakFans, 2_000_000);
check("Obituary mentions fame and awards", /was a star actor/.test(Obituary.text(p)) && /award/.test(Obituary.text(p)), Obituary.text(p));
check("Obituary rows: Fame and Awards", Obituary.rows(p).some((r: any) => r.component1() === "Fame") && Obituary.rows(p).some((r: any) => r.component1() === "Awards"));
check("Family Line text shows fame", /Star \(/.test(FamilyTree.lineText({ age: 80, trueAge: 80, cause: "", vampireYears: 0, partner: null, children: 1, fame: Celebrity.fameLine(p) } as any)));
const heir: any = { calendarWeeks: () => 0, getAgeInWeeks: () => 0 };
Celebrity.inherit(p, heir);
check("Heir inherits 10% of a famous parent's peak fans", heir.celebrity.fans === Math.round(s.peakFans * 0.1) && heir.celebrity.inherited === heir.celebrity.fans);

// ---------------------------------------------------------------- old saves and children
const old = start(LifeScenario.educatedAndInDebt);
delete (old as any).celebrity;
check("Old saves (no celebrity field): menu and screen still work", titles(menu()).includes("Celebrity Life") && celeb().length > 5);
check("Old saves: weekly hooks are fine", (() => { try { keep(old); old.applyWeekly(); clear(); return true; } catch (e) { console.log(e); return false; } })());
const kid = start(LifeScenario.educatedAndInDebt, (np) => np.initializeAgeInYears(8));
check("Children (8): practice is open, careers aren't", (() => { const r = celeb(); return /Acting Class/.test(text(r)) && !LifeActions.perform(def(FAME, "social"), kid); })());

// ---------------------------------------------------------------- art slots
check("Art slots for every Celebrity icon", ["icon_celeb_dance", "icon_celeb_audition", "icon_celeb_award", "icon_celeb_scandal", "icon_celeb_walkoffame"].every((n) => ART_SLOTS.some((x) => x.name === n)));

console.log(failures ? `\n${failures} FAILED` : "\nall celebrity checks passed");
if (failures) process.exit(1);
