// Love tab: Come Out.
import { UIBridge, MainGameFragment } from "../src/game/ui/bridge";
import { GameStateManager } from "../src/game/Managers/GameStateManager";
import { AlertManager } from "../src/game/Managers/AlertManager";
import { LifeScenario } from "../src/game/Enums/LifeScenario";
import { MainGameTab } from "../src/game/Enums/MainGameTab";
import { Sexuality } from "../src/game/Enums/Sexuality";
import { Sex } from "../src/game/Enums/Sex";
import { LoveModelGenerator } from "../src/game/Controllers/LoveModelGenerator";
import { ButtonViewModel } from "../src/game/Models/ButtonViewModel";
import { SaveCodec } from "../src/game/save/SaveCodec";
const alerts: any[] = [];
UIBridge.install({ broadcast() {}, reloadGenericList() {}, navigateTo() {}, backToMainGame() {}, showAlert(vm) { alerts.push(vm); }, readFile: () => null, writeFile() {} });
class M extends MainGameFragment { updateUI() {} updateHUD() {} reloadTab() {} getSelectedTab() { return MainGameTab.Love; } }
GameStateManager.INSTANCE.init(); GameStateManager.INSTANCE.setMainGameFragment(new M());
let failures = 0;
const check = (n: string, ok: boolean, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };
const buttons = (vm: any) => { const out: ButtonViewModel[] = []; const seen = new Set(); const walk = (o: any, d = 0) => { if (!o || typeof o !== "object" || d > 6 || seen.has(o)) return; seen.add(o); if (o instanceof ButtonViewModel) { out.push(o); return; } for (const v of Object.values(o)) Array.isArray(v) ? v.forEach((x) => walk(x, d + 1)) : walk(v, d + 1); }; walk(vm); return out; };
const loveButtons = () => buttons(new LoveModelGenerator().getRomanceViewModels());
const clear = () => { while (alerts.length) AlertManager.INSTANCE.alertDismissed(alerts.shift()); };

GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.youngChild);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear();
const kid = GameStateManager.INSTANCE.getPersonState();
check("shown from age 13", (kid.getAgeInYears() >= 13) === loveButtons().some((b) => b.getTitle() === "Come out"), "age " + kid.getAgeInYears());

GameStateManager.INSTANCE.startNewGameFlow(LifeScenario.highSchoolDropout);
GameStateManager.INSTANCE.startNewGame(GameStateManager.INSTANCE.getNewGamePlayerState()!); clear();
const p = GameStateManager.INSTANCE.getPersonState();
p.setSexuality(Sexuality.straight);
const btn = loveButtons().find((b) => b.getTitle() === "Come out");
check("Come Out is in the Love tab", !!btn);
btn!.getAction().invoke();
const a = alerts.shift();
const choices = [a.getPositiveButton(), ...(a.getAdditionalButtons() ?? [])].map((x: any) => x.getTitle());
check("offers the two other sexualities + cancel", choices.join(",") === "I'm gay,I'm bisexual" && a.getNegativeButton().getTitle() === "Cancel", choices.join(","));
a.getNegativeButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a);
check("cancel changes nothing", p.getSexuality() === Sexuality.straight);
const happy0 = p.getAttributeState().getHappiness?.() ?? 0;
btn!.getAction().invoke();
const a2 = alerts.shift(); a2.getPositiveButton().getAction().invoke(); AlertManager.INSTANCE.alertDismissed(a2);
check("now gay", p.getSexuality() === Sexuality.gay);
const res = alerts.shift();
check("result pop-up with family reactions", !!res && /came out as gay/.test(res.getMessage()) && p.getFamilyState().getParents().size() > 0 ? /proud|time/.test(res.getMessage()) : true, res?.getMessage()?.replace(/\n/g, " / "));
if (res) AlertManager.INSTANCE.alertDismissed(res);
clear();
check("happiness went up", (p.getAttributeState().getHappiness?.() ?? 1) >= happy0);
// dating follows the new sexuality
const partners = new Set<string>(); for (let i = 0; i < 40; i++) partners.add(p.getSex().randomPartnerGender(p.getSexuality()).name());
check("new partners match the new sexuality", partners.size === 1 && partners.has(p.getSex().name()), [...partners].join(","));
const opts2 = (() => { loveButtons().find((b) => b.getTitle() === "Come out")!.getAction().invoke(); const x = alerts.shift(); const r = [x.getPositiveButton(), ...(x.getAdditionalButtons() ?? [])].map((y: any) => y.getTitle()); AlertManager.INSTANCE.alertDismissed(x); return r; })();
check("can change again (straight/bisexual offered)", opts2.join(",") === "I'm straight,I'm bisexual", opts2.join(","));
const back = SaveCodec.decode(SaveCodec.encode(GameStateManager.INSTANCE.getGlobalStateManager())).getSaveState().currentSlot().getPersonState();
check("saved", back.getSexuality() === Sexuality.gay);
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
