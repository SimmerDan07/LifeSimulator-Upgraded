// v0.35.0 "Vampires Reborn": the screens. Lifepaths › Vampire is your home (status, meters, this week's weather,
// feeding and the Hunt), with five sub-screens: Powers, Masquerade, Court, Lair and Bloodline. Each control lives in
// one place (the court's people are also in Love › Night, where their actions are).
import { ArrayList, BigInteger, R } from "../runtime";
import { TrueAge } from "../Managers/TrueAge";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { BaseViewModel } from "../Models/BaseViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { CustomizeSwitchViewModel } from "../Models/CustomizeSwitchViewModel";
import { SwitchViewModel } from "../Models/SwitchViewModel";
import { LoveScreens } from "../Social/LoveScreens";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Vampire, LifeActions, FEEDING, HIDING, ENDINGS, WITHERED_CAP, type LifeActionDef } from "../Lifepaths/Vampire";
import { Reborn, player, WPY, img, now } from "./Reborn";
import { Becoming, BECOMING_REBORN } from "./Becoming";
import { Night, Masquerade, Court, Forever } from "./Night";
import { Bonds } from "./Bonds";
import { BLOODLINES, lineOf, RANKS, TREE, DISCIPLINES, WEATHER, GROUNDS, LAIR, STANDING } from "./VData";

const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const open = (key: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null);
const link = (image: any, title: string, body: string, key: string) =>
    new ActionCellSingleViewModel(image, title, text(body), new ButtonViewModel("Open", null, true, false, false, false, false, { invoke: () => { open(key); return null; } }), null, null);
const say = (title: string, t: string | void, image: any = Vampire.image) => { if (t) Vampire.alert(title, t, image); };
const yrs = (n: number) => `${n} year${n === 1 ? "" : "s"}`;

// ---------------------------------------------------------------- rows
const HUNT: () => LifeActionDef[] = () => Night.grounds().map((g) => ({
    id: "hunt-" + g.id, title: g.title, image: img(g.image), instant: true, actionTitle: () => "Hunt",
    lock: (p: any) => Night.huntLock(p),
    note: () => `${g.blurb} Risk ${g.risk <= 2 ? "low" : g.risk <= 6 ? "medium" : "high"}${Reborn.peek()?.domain === g.id ? " (your domain: half the Rumours)" : ""}.\n`,
    run: (p: any) => Night.hunt(p, g.id),
}));
const HERD: LifeActionDef = { id: "gatherHerd", title: "Gather a Herd", image: img("icon_vamp_herd"), cost: 2000, instant: true,
    lock: (p) => (Night.herd(p).length >= Night.herdMax(p) ? `You have ${Night.herdMax(p)} already` : null),
    note: () => `Find a mortal who'll let you feed for money or devotion (${Night.herd().length} of ${Night.herdMax()}). Feed on them in Love › Night, or live on Your Own Herd as your blood supply.\n`,
    run: (p) => say("Your Herd", Night.gatherHerd(p), img("icon_vamp_herd")) };
const MASQ: () => LifeActionDef[] = () => [
    HIDING[0],
    { id: "cover", title: "A Cover Story", image: img("icon_vamp_identity"), cost: 2000, instant: true, show: (p) => !Reborn.st(p).cover,
        note: () => "A rare skin condition, a night job: it explains the pale skin and the nights. Rumours −10, and ageing questions stir half the Rumours.\n",
        run: (p) => say("A Cover Story", Masquerade.coverStory(p), img("icon_vamp_identity")) },
    { id: "identity", title: "A New Identity", image: img("icon_vamp_identity"), cost: 5000,
        lock: (p) => Masquerade.identityLock(p),
        note: () => "Every few decades you need a new name to keep working. You lose your job, not your skills or career history. Rumours −30.\n",
        confirm: () => "Become someone new? You'll need to find a new job.",
        run: (p) => say("A New Identity", Masquerade.newIdentity(p), img("icon_vamp_identity")) },
    HIDING[1],
    { ...HIDING[2], note: () => "−50 Rumours and the hunters lose your trail (the Hunt −40). You quit your job, friends you leave behind feel distant, and you start again at a new court (Known).\n",
        run: (p: any) => { Masquerade.moveCity(p); Vampire.alert("A New City", "You moved somewhere nobody knows you. A new court will want to meet you.", Vampire.image); } },
];

export const VScreens = {
    title(key: string): string {
        return ({ "vampire-powers": "Powers", "vampire-masquerade": "The Masquerade", "vampire-court": "Court", "vampire-lair": "Your Lair", "vampire-bloodline": "Bloodline" } as any)[key] ?? "Vampire";
    },
    screen(key: string, p: any = player()): BaseViewModel[] {
        const out: BaseViewModel[] = [];
        if (!Vampire.isVampire(p)) { VScreens.human(p, out); return out; }
        if (!Reborn.st(p).converted) Becoming.convert(p);
        Court.ensure(p);
        if (key === "vampire-powers") VScreens.powers(p, out);
        else if (key === "vampire-masquerade") VScreens.masquerade(p, out);
        else if (key === "vampire-court") VScreens.court(p, out);
        else if (key === "vampire-lair") VScreens.lair(p, out);
        else if (key === "vampire-bloodline") VScreens.bloodline(p, out);
        else VScreens.home(p, out);
        return out;
    },
    status(p: any = player()): string {
        const s = Vampire.peek(p);
        if (s?.isVampire) return `${Reborn.rank(p).title} of the ${Reborn.line(p).title} · ${yrs(Reborn.bloodYears(p))} · Hunger ${Math.round(s.thirst)} · Humanity ${Reborn.humanity(p)}`;
        if (s != null && s.turningWeeks > 0) return "The Turning: you'll rise a vampire at the end of this week.";
        if (s?.cured) return "Human again. You get one vampire life: this path is closed to you now.";
        const leg = (p as any).vampireLegacy;
        if (leg) return `Your ancestor ${leg.name} walked the night. The vampires remember your family.`;
        return s?.discovered ? "A vampire has offered you eternity." : "Rumours say vampires walk among us.";
    },

    // ------------------------------------------------------------------ before you're turned
    human(p: any, out: BaseViewModel[]) {
        const s = Vampire.peek(p);
        out.push(new HeaderTitleViewModel("Vampire"));
        if (s != null && s.turningWeeks > 0) { out.push(info(Vampire.image, "The Turning", "Your heart is slowing and the light hurts. By the end of this week you'll rise a vampire.")); return; }
        if (s?.cured) { out.push(info(R.drawable.health_youthelixir, "Human Again", `You were a vampire for ${yrs(Math.floor(s.vampireWeeks / WPY()))}, until the Vampiric Cure. You get one vampire life: this path is closed to you now.`)); return; }
        if (p.getAgeInYears() < Vampire.minAge) { out.push(info(R.drawable.locked, "Vampire", "A path for adults. Come back when you're 18.")); return; }
        const r = Reborn.peek(p);
        const sire = Becoming.sire(p);
        const leg = (p as any).vampireLegacy;
        let body = "Rumours say vampires walk among us. Some say a pale stranger appears at nightclubs and local events. Or you could go looking: Seek the Ancient is a quest in three steps.";
        if (s?.discovered && r?.way === "seduced") body = `${sire?.getFullName() ?? "A stranger"} keeps finding you at night. They're old (${r?.sireAge ?? "?"} years), ${lineOf(sire?.bloodline).title}, and they want you.`;
        else if (s?.discovered && r?.way === "seeking") body = r?.line ? `You've chosen the ${lineOf(r.line).title}. ${sire?.getFullName() ?? "Your sire"} is ready when you are.` : "The ancients have agreed to meet you. Choose the bloodline you'll join:";
        else if (s?.discovered) body = `${sire?.getFullName() ?? "A vampire"} has offered you eternity. You'd stop ageing forever, but need blood every week, fear the sun, and can't have biological children.`;
        if (leg) body += `\n\nYour ancestor ${leg.name} was a vampire of the ${lineOf(leg.line).title}${leg.childer?.length ? `, and sired ${leg.childer.join(", ")}` : ""}. The night remembers your family.`;
        out.push(info(Vampire.image, "Vampire", body));
        if (s?.discovered && r?.way === "seeking" && !r.line) for (const b of BLOODLINES) out.push(info(img(b.image), b.title, `${b.feel}.\nGift: ${b.gift}\nWeakness: ${b.weakness}`));
        for (const c of LifeActions.cells(BECOMING_REBORN, p)) out.push(c);
    },

    // ------------------------------------------------------------------ home
    home(p: any, out: BaseViewModel[]) {
        const s = Vampire.state(p), r = Reborn.st(p);
        const line = Reborn.line(p), rank = Reborn.rank(p), next = Reborn.nextRank(p);
        const turnedAt = Math.floor(s.turnedAtWeeks / WPY());
        out.push(new HeaderTitleViewModel("Vampire"));
        out.push(info(img(line.image), `${rank.title} of the ${line.title}`,
            `${yrs(Reborn.bloodYears(p))} of blood${next ? ` (${next.title} at ${next.years})` : ""}. Turned at ${turnedAt} by ${r.sireName || "a stranger"}; true age ${TrueAge.text(p)}. ${s.bloodPower} blood power.`));
        if (s.cureWeeks > 0) { out.push(info(R.drawable.health_youthelixir, "The Vampiric Cure is working", `${s.cureWeeks} week${s.cureWeeks === 1 ? "" : "s"} until you're human again. Your hunger has stopped.`)); VScreens.endings(p, out); return; }
        out.push(new MeterViewModel("Hunger", s.thirst, 100, "red", `${Reborn.stage(s.thirst)}: ${Reborn.stageText(s.thirst)} ${VScreens.trend(p)}`, `${Math.round(s.thirst)} · ${Reborn.stage(s.thirst)}`));
        const h = Reborn.humanity(p);
        out.push(new MeterViewModel("Humanity", r.humanity, 10, "gold", `${Reborn.humanityTitle(h)}. ${h >= 8 ? "Mortals like you and frenzy is rare." : h <= 3 ? "The Beast is strong: frenzy is common, mortals sense something wrong, and Beast powers are cheaper." : "Balanced."}${r.golconda ? " You've reached Golconda." : ""}`, `${h} / 10`));
        out.push(new MeterViewModel("Vitality", r.vitality, 100, "blue", r.sunburnWeeks > 0 ? `Sunburned for ${r.sunburnWeeks} more week${r.sunburnWeeks === 1 ? "" : "s"}.` : `Daylight drains it; it refills ${r.lair.includes("blackout") ? 50 : 25} a week at night${r.lair.includes("blackout") ? "" : " (Blackout Rooms double that)"}. At 0 you're sunburned.`, `${Math.round(r.vitality)}`));
        out.push(new MeterViewModel("Rumours", s.suspicion, 100, "purple", `What mortals whisper about you. They feed the Hunt from 50.${Celebrity.tier(p) >= 3 ? " You're famous: cameras everywhere make people wonder why you never age." : ""}`, `${Math.round(s.suspicion)}`));
        out.push(new MeterViewModel("The Hunt", r.hunt, 100, "red", `${Masquerade.hunterStage(r.hunt)}${r.hunter ? `: ${r.hunter.name}` : ""}. At 85 they strike.`, `${Math.round(r.hunt)}`));
        const w = Reborn.weather(p), [hap, vit] = Reborn.sunCost(p);
        out.push(info(img("icon_vamp_weather"), `This Week: ${WEATHER[w].title}`, `${WEATHER[w].text} A daytime outing costs ${hap ? `−${hap} happiness and −${vit} Vitality` : "nothing"}${r.nightMode ? "; your day job runs at night" : ""}.`));
        out.push(new CustomizeSwitchViewModel("Night mode: work and study at night (no sun at work, 5% less pay)", new SwitchViewModel(!!r.nightMode, false, { invoke: (on: boolean) => { r.nightMode = on; Vampire.refreshUI(); return null; } })));
        if ((s.witheredWeeks ?? 0) > 0) out.push(info(Vampire.image, "Withered", `Your body is recovering from torpor: health can't go above ${WITHERED_CAP} and doesn't heal, −1 happiness a week. ${s.witheredWeeks} week${s.witheredWeeks === 1 ? "" : "s"} left.`));
        if (r.burnWeeks > 0) out.push(info(img("icon_vamp_weather"), "Burned", `Your sun burns are healing: health can't go above 60 for ${r.burnWeeks} more week${r.burnWeeks === 1 ? "" : "s"}.`));
        out.push(new HeaderTitleViewModel("Feeding"));
        for (const c of LifeActions.cells([FEEDING[0]], p)) out.push(c);
        out.push(new HeaderTitleViewModel(Night.huntLock(p) ? "The Hunt (next week)" : "The Hunt"));
        for (const c of LifeActions.cells(HUNT(), p)) out.push(c);
        out.push(new HeaderTitleViewModel("Quick Feeding"));
        for (const c of LifeActions.cells([...FEEDING.slice(1), HERD], p)) out.push(c);
        out.push(new HeaderTitleViewModel("Your Night"));
        const owned = (s.powers ?? []).length;
        out.push(link(img("icon_power_charm"), "Powers", `${owned} of ${TREE.length} learned · ${s.bloodPower} blood power`, "vampire-powers"));
        out.push(link(img("icon_vamp_identity"), "The Masquerade", `Rumours ${Math.round(s.suspicion)} · the Hunt ${Math.round(r.hunt)}${r.cover ? " · cover story in place" : ""}`, "vampire-masquerade"));
        out.push(link(img("icon_vamp_court"), "Court", `${Reborn.standingTitle(p)} in ${Court.cityName(p)} · ${r.owed} favour${r.owed === 1 ? "" : "s"} owed to you${r.task ? " · on a task" : ""}`, "vampire-court"));
        out.push(link(img("menu_coffin"), "Your Lair", `${r.lair.length} of ${LAIR.length} upgrades${r.vault ? ` · ${money(r.vault)} in the Vault` : ""}`, "vampire-lair"));
        out.push(link(img(line.image), "Bloodline", `${line.title} · sire ${r.sireName || "unknown"} · ${Bonds.childer(p).length} childer · ${Object.keys(r.vintages).length} vintages`, "vampire-bloodline"));
        const bond = Vampire.bondedPartner(p);
        if (bond != null) {
            out.push(new HeaderTitleViewModel("Eternal Bond"));
            out.push(info(R.drawable.icon_bond, `Eternal Bond with ${bond.getFirstName()}`, "You never drift apart, fight hunters side by side (70% to win) and share your blood supply (it costs double; with Feed by Hand they hunt alone: Rumours +2 a week)."));
        }
        VScreens.endings(p, out);
    },
    trend(p: any): string {
        const n = Vampire.thirstPerWeekFor(p);
        return n > 0 ? `On your supply it fills in ${Vampire.fillText(n)}; at 100 you fall into torpor for 5 to 30 years.` : `Falls ${Math.round(-n)} a week on your supply.`;
    },
    endings(p: any, out: BaseViewModel[]) {
        out.push(new HeaderTitleViewModel("Endings"));
        const extra: LifeActionDef[] = [
            { id: "golconda", title: "Seek Golconda", image: img("icon_vamp_golconda"), show: (pp) => !Reborn.st(pp).golconda,
                lock: (pp) => Forever.golcondaLock(pp),
                note: () => "The rare good ending: hold Humanity 10 for a century, then a quest in three steps. Hunger fades to almost nothing, the sun only stings, and you live on.\n",
                run: (pp) => say("Golconda", Forever.golcondaStep(pp), img("icon_vamp_golconda")) },
            { id: "research", title: "Research a Cure", image: R.drawable.icon_vamp_cure, cost: 1_000_000, show: (pp) => Vampire.state(pp).cureWeeks === 0,
                lock: (pp) => Forever.cureLock(pp),
                note: () => `Instead of ${money(Vampire.curePrice)}: a year of alchemy (12 months of research, twice as fast with an Occult Library; ${Reborn.st().cureResearch} done). The same one vampire life rule applies.\n`,
                run: (pp) => say("The Cure", Forever.research(pp), R.drawable.icon_vamp_cure) },
        ];
        for (const c of LifeActions.cells([ENDINGS[0], ...extra, ENDINGS[1]], p)) out.push(c);
    },

    // ------------------------------------------------------------------ powers
    powers(p: any, out: BaseViewModel[]) {
        const s = Vampire.state(p), rank = Reborn.rank(p), next = Reborn.nextRank(p);
        out.push(new HeaderTitleViewModel(`Powers · ${s.bloodPower} blood power`));
        out.push(info(img(Reborn.line(p).image), `${rank.title} · ${yrs(Reborn.bloodYears(p))} of blood`,
            `You can learn tier ${rank.tier} powers${next ? ` (tier ${next.tier} at ${next.years} years)` : ""}. Each discipline goes in order. Your bloodline makes ${DISCIPLINES.find((d) => d.id === Reborn.line(p).discipline)?.title} powers cheaper. You earn 1 blood power a year (+1 every 10 years), and more from rare vintages, your sire, the court and rituals.`));
        out.push(...LifeActions.cells([{ id: "reshape", title: "Reshape Your Powers", image: img("icon_power_mindfog"), instant: true,
            lock: (pp) => Reborn.canReshape(pp),
            note: () => "Once a century: give every power back for its blood power, and choose again.\n",
            confirm: () => "Give back all your powers for their blood power?",
            run: (pp) => say("Reshaped", `Your powers dissolved back into your blood: ${Reborn.reshape(pp)} blood power to spend again.`) }], p));
        for (const d of DISCIPLINES) {
            out.push(new HeaderTitleViewModel(d.title));
            out.push(new SingleLabelCellViewModel("disc-" + d.id, text(d.use)));
            const defs: LifeActionDef[] = TREE.filter((n) => n.discipline === d.id).map((n) => ({
                id: "learn-" + n.id, title: `${n.title} (tier ${n.tier})`, image: img(n.image), instant: true,
                actionTitle: () => (Vampire.has(n.id) ? "Learned" : `${Reborn.cost(n)} BP`),
                lock: (pp: any) => Reborn.powerLock(n, pp),
                note: () => n.blurb + "\n",
                run: (pp: any) => { Reborn.learn(pp, n.id); },
            }));
            for (const c of LifeActions.cells(defs, p)) out.push(c);
        }
    },

    // ------------------------------------------------------------------ the Masquerade
    masquerade(p: any, out: BaseViewModel[]) {
        const s = Vampire.state(p), r = Reborn.st(p);
        out.push(new HeaderTitleViewModel("The Masquerade"));
        out.push(new MeterViewModel("Rumours", s.suspicion, 100, "purple", "Rise from careless feeding, frenzies, never ageing in front of people who knew you, fame and photos. Fade slowly on their own.", `${Math.round(s.suspicion)}`));
        out.push(new MeterViewModel("The Hunt", r.hunt, 100, "red", "Rumours from 50 feed the Hunt. At 30 a hunter starts asking questions, at 60 they watch you, at 85 they strike. Losing never kills you: it's years in torpor.", `${Math.round(r.hunt)}`));
        if (r.hunter) out.push(info(img("icon_vamp_hunter"), r.hunter.name, `${Masquerade.hunterStage(r.hunt)}. They work out of ${r.hunter.base}.${r.hunter.martyrs ? ` They took up the cause after ${r.hunter.martyrs === 1 ? "a martyr" : `${r.hunter.martyrs} martyrs`} fell.` : ""}`));
        const y = Math.floor((now(p) - r.cityWeek) / WPY());
        out.push(new SingleLabelCellViewModel("city", text(`You've lived in this city ${yrs(y)}; every 10 years people notice you haven't aged. You've been ${p.getFullName()} for ${yrs(Math.floor((now(p) - r.identityWeek) / WPY()))}.`)));
        out.push(new HeaderTitleViewModel("Covering Your Tracks"));
        for (const c of LifeActions.cells(MASQ(), p)) out.push(c);
    },

    // ------------------------------------------------------------------ court
    court(p: any, out: BaseViewModel[]) {
        const r = Reborn.st(p);
        out.push(new HeaderTitleViewModel(`Court of ${Court.cityName(p)}`));
        out.push(new MeterViewModel("Standing", r.standing, 100, "green", `${STANDING.map((x) => x.title).join(" → ")}. Rises with blood age, tasks, favours and keeping the Masquerade; falls with breaches.`, Reborn.standingTitle(p)));
        out.push(new SingleLabelCellViewModel("favours", text(`${r.owed} favour${r.owed === 1 ? "" : "s"} owed to you. Favours keep: call them in to bury Rumours, call off the Hunt or exile a rival.${r.domain ? ` Your domain: ${GROUNDS.find((g) => g.id === r.domain)?.title}.` : ""}`)));
        const defs: LifeActionDef[] = [
            { id: "attend", title: "Attend Court", image: img("icon_vamp_court"), instant: true, lock: (pp) => Court.canAttend(pp),
                note: () => "Once a month (optional: skipping never costs Standing). News, rumours and a vote.\n", run: (pp) => Court.attend(pp) },
            { id: "favour", title: "Call In a Favour", image: img("icon_vamp_court"), instant: true, lock: (pp) => (Reborn.st(pp).owed > 0 ? null : "Nobody owes you a favour"),
                run: (pp) => Court.callFavour(pp) },
            { id: "task", title: "Ask the Prince for a Task", image: img("icon_vamp_task"), instant: true, lock: (pp) => Court.taskLock(pp),
                note: () => "A mission that pays in Standing, blood power and a favour (your powers help). Every 12 weeks.\n",
                run: (pp) => say("The Prince's Task", Court.startTask(pp), img("icon_vamp_task")) },
        ];
        for (const c of LifeActions.cells(defs, p)) out.push(c);
        if (r.task) out.push(info(img("icon_vamp_task"), r.task.title, `${Math.max(0, r.task.until - now(p))} week${r.task.until - now(p) === 1 ? "" : "s"} to go.`));
        if (!r.domain) {
            out.push(new HeaderTitleViewModel("Claim a Domain"));
            const doms: LifeActionDef[] = GROUNDS.filter((g) => !g.needs).map((g) => ({ id: "domain-" + g.id, title: g.title, image: img(g.image), cost: 10000, instant: true,
                lock: (pp: any) => Court.domainLock(pp), note: () => "Hunting here stirs half the Rumours, Rumours fade faster, and you collect a favour a year.\n",
                run: (pp: any) => say("Your Domain", Court.claimDomain(pp, g.id), img("icon_vamp_court")) }));
            for (const c of LifeActions.cells(doms, p)) out.push(c);
        }
        out.push(new HeaderTitleViewModel("The Court"));
        out.push(new SingleLabelCellViewModel("courtNote", text("Their actions (favours, alliances, romance, rivalry) are on their screens in Love › Night.")));
        for (const x of Court.members(p)) out.push(LoveScreens.card(x));
    },

    // ------------------------------------------------------------------ lair
    lair(p: any, out: BaseViewModel[]) {
        const r = Reborn.st(p);
        out.push(new HeaderTitleViewModel("Your Lair"));
        const defs: LifeActionDef[] = LAIR.map((x) => ({ id: "lair-" + x.id, title: x.title, image: img(x.image), cost: x.cost, instant: true,
            actionTitle: () => (Reborn.st().lair.includes(x.id) ? "Built" : null),
            lock: (pp: any) => (Reborn.st(pp).lair.includes(x.id) ? "Already built" : x.minRank && Reborn.rankIndex(pp) < x.minRank ? `Needs ${RANKS[x.minRank].title} rank` : null),
            note: () => x.blurb + "\n", run: (pp: any) => Forever.buyLair(pp, x.id) }));
        for (const c of LifeActions.cells(defs, p)) out.push(c);
        out.push(new HeaderTitleViewModel(`The Vault · ${money(r.vault)}`));
        out.push(new SingleLabelCellViewModel("vault", text("A hidden account under no name. It grows 3% a year and survives torpor, new identities and faked deaths.")));
        const vault: LifeActionDef[] = [10_000, 100_000, 1_000_000].map((n) => ({ id: "vault-" + n, title: `Hide ${money(n)}`, image: img("icon_vamp_vault"), instant: true,
            lock: (pp: any) => (Number(pp.getMoneyState().getCash().toString()) < n ? "Not enough cash" : null), actionTitle: () => "Hide",
            run: (pp: any) => Forever.vaultIn(pp, n) }));
        vault.push({ id: "vault-out", title: "Take It All Out", image: img("icon_vamp_vault"), instant: true, lock: (pp) => (Reborn.st(pp).vault > 0 ? null : "The Vault is empty"),
            run: (pp) => say("The Vault", `You quietly moved ${money(Forever.vaultOut(pp))} back into your accounts.`, img("icon_vamp_vault")) });
        for (const c of LifeActions.cells(vault, p)) out.push(c);
        out.push(new HeaderTitleViewModel("Chosen Torpor"));
        out.push(new SingleLabelCellViewModel("torpor", text(`Sleep on purpose to skip decades: the calendar moves, mortals age, investments grow, and the Hunt cools (${r.lair.includes("crypt") ? "−30 in your Crypt" : "−20; −30 with a Crypt"}). You lose your job and mortal partner; blood age counts at half speed.`)));
        const sleep: LifeActionDef[] = [10, 25, 50, 100].map((n) => ({ id: "sleep-" + n, title: `Sleep ${n} Years`, image: img("icon_vamp_torpor"), instant: true, actionTitle: () => "Sleep",
            confirm: () => `Close the lid for ${n} years?`, run: (pp: any) => { Reborn.torpor(pp, "chosen", n); } }));
        for (const c of LifeActions.cells(sleep, p)) out.push(c);
    },

    // ------------------------------------------------------------------ bloodline
    bloodline(p: any, out: BaseViewModel[]) {
        const r = Reborn.st(p), line = Reborn.line(p);
        out.push(new HeaderTitleViewModel(line.title));
        out.push(info(img(line.image), line.feel, `Gift: ${line.gift}\nWeakness: ${line.weakness}`));
        const sire = Becoming.sire(p);
        out.push(new HeaderTitleViewModel("Your Sire"));
        if (sire) out.push(LoveScreens.card(sire));
        else out.push(new SingleLabelCellViewModel("nosire", text(r.sireName ? `${r.sireName} is gone.` : "Your sire is unknown.")));
        const childer = Bonds.childer(p);
        out.push(new HeaderTitleViewModel(`Your Childer${childer.length ? ` (${childer.length})` : ""}`));
        if (!childer.length) out.push(new SingleLabelCellViewModel("nochilde", text(Reborn.rankIndex(p) >= 1 ? "Turn someone who knows your secret from their Love tab screen." : "From Neonate rank (25 years of blood) you can sire childer of your own.")));
        for (const x of childer) out.push(LoveScreens.card(x));
        out.push(new HeaderTitleViewModel("Vintages"));
        const v = Object.entries(r.vintages).sort((a, b) => b[1] - a[1]);
        out.push(new SingleLabelCellViewModel("vintages", text(v.length ? v.map(([k, n]) => `${k} ×${n}`).join(", ") + (v.length >= 8 ? "\nA true connoisseur." : "") : "Hunt to taste your first vintage. Every fourth new one gives +1 blood power.")));
        if (Reborn.rankIndex(p) >= 3) out.push(info(Vampire.image, "Legend", `${r.legend ? `${r.legend} years of stories: ` : ""}books, films and songs about "a figure in the night" are about you. ${Reborn.bloodYears(p) >= 500 ? "Some nights the centuries feel heavy; love, art and court life keep the numbness away." : ""}`));
    },
};
void Bonds; void BLOODLINES;
