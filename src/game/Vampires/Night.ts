// v0.35.0 "Vampires Reborn": the night. The weekly rhythm (Hunger stages, Vitality, frenzy, Humanity), the Hunt
// (ground → prey → approach → how much), blood supplies, the Masquerade (Rumours, the Hunt and its named hunters,
// cover stories, new identities) and your city's vampire court (Standing, favours, rivals, tasks, a domain, elders).
import { BigInteger } from "../runtime";
import { Sex } from "../Enums/Sex";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Modifiers } from "../Managers/Modifiers";
import { NameGenerator } from "../Managers/NameGenerator";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Relationships } from "../Social/Relationships";
import { COUNTRY_BY_ID } from "../World/WorldData";
import { Vampire, BLOOD_DIETS, type LifeActionDef } from "../Lifepaths/Vampire";
import { Reborn, player, WPY, roll, pick, clamp, img, now } from "./Reborn";
import { Becoming } from "./Becoming";
import { GROUNDS, PREY, AMOUNTS, COURT_TITLES, TASKS, ERAS, LAIR, TREE, lineOf, type Ground } from "./VData";

const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const cashNum = (p: any) => { try { return Number(p.getMoneyState().getCash().toString()); } catch { return 0; } };
const pay = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.directSpend, null, null, 12, null);
const earn = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.misc, null, null, 12, null);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const rumours = (p: any, n: number) => { const s = Vampire.state(p); s.suspicion = clamp(s.suspicion + n, 0, Vampire.has("nightEternal", p) ? 50 : 100); };
const huntUp = (p: any, n: number) => { const r = Reborn.st(p); r.hunt = clamp(r.hunt + n, 0, Vampire.has("puppetMaster", p) ? 60 : 100); };
/** Supplies that don't cost you Humanity (the willing, the bagged, the bought). */
const CLEAN = new Set(["hand", "butcher", "bags", "donors", "vintage", "herd", "hospital", "rats"]);
const WILLING = new Set(["donors", "herd", "hospital"]);

// ====================================================================== supplies (the old blood diets, plus two)
export function addSupplies() {
    if (BLOOD_DIETS.some((d) => d.id === "herd")) return;
    BLOOD_DIETS.push(
        { id: "herd", title: "Your Own Herd", image: img("icon_vamp_herd"), cost: 1500, thirst: -12, mods: [0, 3, 1],
            blurb: "A few mortals who let you feed, for money or devotion. Gather them on the Vampire screen.",
            lock: (p) => (Night.herd(p).length ? null : "Gather a herd first (Vampire screen)") },
        { id: "hospital", title: "Hospital Night Shift", image: img("health_hospitalstay"), cost: 0, thirst: -10, mods: [0, 0, 0],
            blurb: "Free bags from the blood fridge, if you work nights in healthcare.",
            lock: (p) => (Vampire.hasMedicalJob(p) ? null : "Needs a medical job") },
    );
    const bags = BLOOD_DIETS.find((d) => d.id === "bags");
    if (bags) bags.lock = (p) => (Vampire.has("bloodBank", p) || Vampire.hasMedicalJob(p) || (Reborn.peek(p) as any)?.bankDeal ? null : "Needs the Blood Bank Contact power or a medical job");
}
/** Hunger per week on a supply, after bloodline and powers (Velvet Court: only the willing feed you well). */
export function supplyRate(p: any, d: any, t: number): number {
    if (!Reborn.peek(p)) return t;
    let x = t;
    if (x > 0) x *= Reborn.rateFactor(p);
    else {
        if (Reborn.isLine("velvet", p) && !WILLING.has(d.id) && d.id !== "vintage") x *= 0.5;
        if (d.id === "herd" && Reborn.st(p).lair.includes("feeding")) x -= 5;
    }
    return x;
}

export const Night = {
    // ------------------------------------------------------------------ the week
    week(p: any) {
        const s = Vampire.state(p);
        if (!s.isVampire || s.cureWeeks > 0 || s.inTorpor) return;
        const r = Reborn.st(p);
        if (!r.converted) Becoming.convert(p);
        Court.ensure(p);
        Reborn.weather(p);
        // the body: Vitality refills at night, sunburn and burns heal
        const refill = (r.lair.includes("blackout") ? 50 : 25) * (Vampire.has("duskWalker", p) ? 2 : 1);
        r.vitality = clamp(r.vitality + refill, 0, 100);
        if (r.sunburnWeeks > 0) r.sunburnWeeks--;
        if (r.burnWeeks > 0) { r.burnWeeks = Math.max(0, r.burnWeeks - (Vampire.has("regeneration", p) ? 2 : 1)); const a = p.getAttributeState(); if (a.getHealth() > 60) a.setHealth(60); }
        // Hunger warnings (always show)
        if (s.thirst >= 95 && !r.warned95) { r.warned95 = true; Reborn.milestone("Torpor Is Near", "Your hunger is almost total. Feed this week, or you'll fall into torpor for years (5 to 30).", Vampire.image); }
        else if (s.thirst >= 80 && !r.warned80) { r.warned80 = true; Reborn.milestone("Starving", "You're starving: your powers weaken, the Beast is close, and at 100 hunger you'll fall into torpor. Feed soon (the Hunt, a blood supply or a Blood Bank).", Vampire.image); }
        if (s.thirst < 70) { r.warned80 = false; r.warned95 = false; }
        // frenzy
        if (roll(Reborn.frenzyChance(p))) Reborn.frenzy(p);
        // Humanity: a clean year raises it; feeding on the unwilling every week wears it down
        const d = Vampire.diet(p);
        if (d.id === "hunting") Reborn.addHumanity(p, -1 / WPY());
        if (CLEAN.has(d.id)) {
            r.cleanWeeks += Night.lovedOnes(p) ? 2 : 1;
            if (r.cleanWeeks >= WPY()) { r.cleanWeeks = 0; if (r.humanity < 10) Reborn.addHumanity(p, 1, "A year of feeding only on the willing and the bagged."); }
        }
        if (Reborn.pendingBeast || r.humanity <= 0) { Reborn.pendingBeast = false; (s as any).torporKind = "beast"; s.collapsePending = true; }
        if (s.thirst >= 100) (s as any).torporKind = "starving";
        // Golconda: Humanity 10, held for a century
        if (r.humanity >= 9.5) r.at10Weeks++; else r.at10Weeks = 0;
        Masquerade.week(p);
        Court.week(p);
        Night.yearly(p);
    },
    /** Someone mortal still close to you (keeps you human). */
    lovedOnes(p: any): boolean {
        try { return Relationships.familyPeople(p).some((x: any) => x.getIsAlive() && x.getPetType?.() == null && !Vampire.isTurned(x) && x.getRelationshipProgress() >= 700); } catch { return false; }
    },
    /** Each new year of blood age. */
    yearly(p: any) {
        const r = Reborn.st(p) as any;
        const y = Reborn.bloodYears(p);
        if (r.lastYear == null) r.lastYear = y;
        while (r.lastYear < y) {
            r.lastYear++;
            const yy = r.lastYear;
            if (yy % 5 === 0) Reborn.addStanding(p, 1);
            if (Vampire.has("puppetMaster", p)) Reborn.addStanding(p, 2);
            if (yy % 10 === 0 && r.lair.includes("library")) Vampire.state(p).bloodPower += 1;
            if (r.lair.includes("manor")) r.owed++;
            if (r.domain) r.owed++;
            if (r.vault > 0) r.vault = Math.round(r.vault * 1.03);
            if (Reborn.rankIndex(p) >= 3) r.legend++;
            if (yy > 0 && yy % 25 === 0 && r.eraYear !== yy) { r.eraYear = yy; Forever.era(p); }
            if (yy >= 30 && yy % 30 === 0 && r.lastAntique !== yy) { r.lastAntique = yy; Forever.antique(p); }
            // the rank changed
            const rk = Reborn.rank(p);
            if (rk.years === yy && yy > 0) Reborn.milestone(`You Are ${/^[AEIOU]/.test(rk.title) ? "an" : "a"} ${rk.title}`, `${yy} years of blood. ${rk.opens}.`, Vampire.image);
        }
    },

    // ------------------------------------------------------------------ the Hunt
    herd(p: any = player()): any[] { const r = Reborn.peek(p); return (r?.herdIds ?? []).map((id) => Relationships.circle(p).get(id)).filter((x: any) => x && x.getIsAlive()); },
    herdMax(p: any = player()): number { return 3 + (Reborn.st(p).lair.includes("feeding") ? 1 : 0); },
    gatherHerd(p: any): string {
        const r = Reborn.st(p);
        const x = Becoming.makeVampire(p, "herd", null, 0);
        const m = Relationships.circle(p).metaFor(x.id);
        m.vampire = false; m.knows = true;
        x.bloodline = undefined as any;
        x.trueAgeInWeeks = x.ageInWeeks;
        x.setRelationshipProgress(550);
        r.herdIds = [...r.herdIds.filter((id) => Relationships.circle(p).get(id)), x.id];
        return `${x.getFullName()} answered your discreet advert and agreed to let you feed, for a fee. They're in Love › Night.`;
    },
    grounds(p: any = player()): Ground[] {
        return GROUNDS.filter((g) => !g.needs || (g.needs === "rival" ? !!Reborn.st(p).rivalId : Vampire.has(g.needs, p)));
    },
    huntLock(p: any): string | null {
        if (p.getCrimeState?.()?.getIsInJail?.()) return "Not while you're in prison";
        return Reborn.st(p).lastHunt === now(p) ? "Once a week: hunt again next week" : null;
    },
    /** Step 2: three prey at the ground. */
    hunt(p: any, groundId: string) {
        const g = GROUNDS.find((x) => x.id === groundId) ?? GROUNDS[0];
        const prey = [...g.prey].sort(() => Math.random() - 0.5).slice(0, 3).map((id) => PREY.find((x) => x.id === id)!).filter(Boolean);
        Reborn.menu(g.title, `${g.blurb} You pick out three.`, img(g.image), [
            ...prey.map((x): [string, () => string | void] => [`${cap(x.title)} (${x.vintage})`, () => { Night.approach(p, g, x.id); }]),
            ["Go home hungry", () => "You changed your mind and slipped back into the dark."],
        ]);
    },
    /** Step 3: how you take them. */
    approach(p: any, g: Ground, preyId: string) {
        const x = PREY.find((y) => y.id === preyId)!;
        const opts: [string, () => string | void][] = [];
        const seduce = Reborn.isLine("velvet", p) ? 1 : clamp(0.7 - x.hard + (Vampire.has("charm", p) ? 0.1 : 0), 0.2, 0.95);
        const stalk = clamp(0.85 - x.hard + (Vampire.has("batForm", p) || Vampire.has("wolfForm", p) ? 0.1 : 0) - (Reborn.st(p).sunburnWeeks > 0 ? 0.15 : 0), 0.2, 0.95);
        opts.push([`Seduce (${Math.round(seduce * 100)}%)`, () => { Night.amount(p, g, x.id, "seduce", seduce); }]);
        opts.push([`Stalk (${Math.round(stalk * 100)}%)`, () => { Night.amount(p, g, x.id, "stalk", stalk); }]);
        if (Vampire.has("glamour", p)) opts.push(["Glamour (sure)", () => { Night.amount(p, g, x.id, "glamour", 1); }]);
        if (Vampire.has("dominate", p)) opts.push(["Dominate (sure)", () => { Night.amount(p, g, x.id, "dominate", 1); }]);
        opts.push(["Let them go", () => "You let them walk on, never knowing."]);
        Reborn.menu("How Do You Take Them?", `${cap(x.title)}. Seduced prey are willing (no Humanity cost unless you drain them); stalked prey aren't.`, img(g.image), opts);
    },
    /** Step 4: how much. */
    amount(p: any, g: Ground, preyId: string, how: string, chance: number) {
        Reborn.menu("How Much?", "The pulse is right there.", img("icon_vamp_hunt"), [
            ...AMOUNTS.map((a): [string, () => string] => [a.title, () => Night.feed(p, g.id, preyId, how, a.id, chance)]),
        ]);
    },
    /** The outcome (also used by tests). */
    feed(p: any, groundId: string, preyId: string, how: string, amountId: string, chance = 1, forceWin?: boolean): string {
        const r = Reborn.st(p), s = Vampire.state(p);
        const g = GROUNDS.find((x) => x.id === groundId) ?? GROUNDS[0];
        const x = PREY.find((y) => y.id === preyId) ?? PREY[0];
        const a = AMOUNTS.find((y) => y.id === amountId) ?? AMOUNTS[0];
        r.lastHunt = now(p);
        const won = forceWin ?? roll(chance);
        if (!won) {
            rumours(p, 6);
            let t = `${cap(x.title)} got away and told everyone about the creep in the dark (Rumours +6).`;
            if (!Vampire.has("mistStep", p) && roll(0.2)) { pay(p, 2000); rumours(p, 8); Vampire.hooks.police?.(p); t += ` The police came asking; you paid ${money(2000)} to make it go away (Rumours +8).`; }
            if (g.id === "rival") { Reborn.addStanding(p, -5); t += " Your rival heard about it (Standing −5)."; }
            return t;
        }
        let drop = a.hunger - (r.sunburnWeeks > 0 ? 10 : 0);
        s.thirst = Math.max(0, s.thirst - drop); s.weeksAtMaxThirst = 0;
        let rum = g.risk / 2 + a.rumours;
        if (Reborn.isLine("moonborn", p) || Vampire.has("batForm", p)) rum /= 2;
        if (r.domain === g.id) rum /= 2;
        if (how === "glamour") rum = a.id === "drain" ? a.rumours : 0;
        rumours(p, Math.round(rum));
        const parts: string[] = [`Hunger −${drop}`];
        if (Math.round(rum)) parts.push(`Rumours +${Math.round(rum)}`);
        // the Beast's price
        const willing = how === "seduce" || how === "dominate";
        let hum = a.humanity;
        if (x.id === "predator") hum = a.id === "drain" ? 0.5 : 0;
        else if (willing && a.id !== "drain") hum = 0;
        if (hum > 0) { Reborn.addHumanity(p, -hum); parts.push(`Humanity −${hum === 1 ? 1 : hum}`); }
        if (a.id === "drain") { huntUp(p, 6); parts.push("the Hunt +6"); }
        // the vintage
        const first = !r.vintages[x.vintage];
        r.vintages[x.vintage] = (r.vintages[x.vintage] ?? 0) + 1;
        attr(p, x.bonus[0], x.bonus[1], x.bonus[2]);
        let extra = "";
        if (first) {
            const n = Object.keys(r.vintages).length;
            if (x.id === "famous" || n % 4 === 0) { s.bloodPower += 1; extra = ` A new vintage for your collection (${n} tasted): +1 blood power.`; }
            else extra = ` A new vintage for your collection (${n} tasted).`;
        }
        if (g.id === "rival") { Reborn.addStanding(p, 3); const rv = Court.rival(p); rv?.setRelationshipProgress(rv.getRelationshipProgress() - 100); parts.push("Standing +3, your rival is furious"); }
        const how2 = how === "seduce" ? "seduced" : how === "glamour" ? "glamoured" : how === "dominate" ? "commanded" : "stalked";
        const end = a.id === "drain" ? "You drained them. Now there's a body to get rid of." : a.id === "feast" ? "You fed deeply; they'll wake in a hospital." : "Just a sip; they'll wake up dizzy and fine.";
        return `You ${how2} ${x.title}. ${end} ${x.vintage}: ${x.note}. (${parts.join(", ")}.)${extra}`;
    },
};
const hunterName = () => NameGenerator.INSTANCE.generateFirstName(Sex.INSTANCE.getRandomSex()) + " " + NameGenerator.INSTANCE.generateLastName();
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// ====================================================================== the Masquerade
export const Masquerade = {
    hunterStage(h: number): string { return h >= 85 ? "They strike" : h >= 60 ? "They know" : h >= 30 ? "Asking questions" : "Nobody's looking"; },
    week(p: any) {
        const r = Reborn.st(p), s = Vampire.state(p);
        // Rumours fade on their own (Nosferim twice as fast; your domain and your thralls help)
        const fadeEvery = Reborn.isLine("nosferim", p) ? 2 : 4;
        if (now(p) % fadeEvery === 0) rumours(p, -1);
        if (r.domain) rumours(p, -1);
        const thralls = Bonds.thralls(p).length;
        if (thralls) rumours(p, -thralls * (Vampire.has("bloodBond", p) ? 2 : 1));
        if (Vampire.has("mindFog", p) && !(s as any).mindFogDone) { /* Vampire.afterWeek already applies Mind Fog */ }
        // Rumours feed the Hunt
        if (s.suspicion >= 50) huntUp(p, (s.suspicion - 40) / 15);
        else if (s.suspicion < 30) huntUp(p, -1);
        if (Vampire.has("vanish", p)) huntUp(p, -2);
        if (r.allyIds.length && now(p) % 4 === 0) huntUp(p, -r.allyIds.length);
        // the hunters become people
        if (r.hunt >= 30 && !r.hunter) {
            r.hunter = { name: hunterName(), base: pick(["a church basement", "a gun shop", "a closed-down boxing gym", "a police archive", "a rare-books shop"]), martyrs: 0, stage: 1 };
            Reborn.note(p, "Someone's Asking Questions", `A mortal named ${r.hunter.name} has been asking odd questions about you: where you go at night, why nobody's seen you eat. Notes keep appearing on your door. (The Hunt is ${Math.round(r.hunt)}.)`, img("icon_vamp_hunter"));
        }
        if (r.hunter && r.hunt >= 60 && r.hunter.stage < 2) { r.hunter.stage = 2; Reborn.note(p, "They Know", `${r.hunter.name}'s people are watching your home from ${r.hunter.base}, and staking out your feeding grounds. Lay Low, cover your tracks, or prepare for a fight.`, img("icon_vamp_hunter")); }
        if (r.hunter && r.hunt < 20) r.hunter.stage = 1;
        if (r.hunt >= 85 && roll(Vampire.has("thePack", p) ? 0.1 : 0.25)) Masquerade.strike(p);
        // ageing in public: every 10 years in one city, people notice
        if (now(p) - r.cityWeek >= 10 * WPY() && now(p) - r.lastAgeing >= 10 * WPY()) { r.lastAgeing = now(p); Masquerade.ageingInPublic(p); }
        // the court enforces the Masquerade
        if (s.suspicion >= 95 && now(p) - ((r as any).lastSummons ?? -999) >= WPY()) { (r as any).lastSummons = now(p); Court.summons(p); }
    },
    ageingInPublic(p: any) {
        Reborn.menu("You Haven't Aged a Day", "A neighbour who's known you for ten years squinted at you over the fence: \"You haven't changed at all. What's your secret?\"", Vampire.image, [
            [`Makeup and grey dye (${money(500)})`, () => { if (cashNum(p) >= 500) pay(p, 500); rumours(p, 3); return "A few fake wrinkles and some grey at the temples. It mostly works (Rumours +3)."; }],
            [`A fake birth certificate (${money(5000)})`, () => { if (cashNum(p) >= 5000) { pay(p, 5000); rumours(p, -5); return "On paper you're your own son now. Very convincing (Rumours −5)."; } rumours(p, 8); return "You couldn't afford it, so you shrugged. They didn't believe you (Rumours +8)."; }],
            ["\"Good genes!\"", () => { rumours(p, Reborn.st(p).cover ? 4 : 8); return `They laughed. They didn't believe you (Rumours +${Reborn.st(p).cover ? 4 : 8}).`; }],
            ["Move on to a new city", () => { Masquerade.moveCity(p); return "You packed up and left before anyone could ask again."; }],
        ]);
        // it's a random event: when silenced, the makeup is the careful choice
    },
    /** 85+: they strike. Always shows. */
    strike(p: any) {
        const r = Reborn.st(p);
        const h = r.hunter ?? { name: "a hunter", base: "nowhere", martyrs: 0, stage: 3 };
        const win = Vampire.fightWinChance(p) - (r.sunburnWeeks > 0 ? 0.2 : 0);
        const opts: [string, () => string][] = [
            [`Fight (${Math.round(win * 100)}%)`, () => Masquerade.fight(p, win)],
            [Vampire.has("mistStep", p) || Vampire.has("vanish", p) ? "Flee as mist" : "Flee the city", () => Masquerade.flee(p)],
        ];
        const talk = clamp(0.2 + (Vampire.has("hypnoticGaze", p) ? 0.3 : 0) + (Reborn.humanity(p) >= 8 ? 0.2 : 0), 0, 0.9);
        opts.push([`Talk (${Math.round(talk * 100)}%)`, () => { if (roll(talk)) { r.hunt = 25; r.hunter = null; Reborn.addHumanity(p, 0.5); return `You talked. ${h.name} lowered the stake, shaking, and walked away. They won't come back (the Hunt falls to 25).`; } return Masquerade.fight(p, win * 0.7, "Talking failed. "); }]);
        if (Reborn.rankIndex(p) >= 1 && Vampire.state(p).bloodPower >= 3) opts.push(["Turn them (3 blood power)", () => { Vampire.state(p).bloodPower -= 3; r.hunt = 15; r.hunter = null; Reborn.addHumanity(p, -1); Reborn.addStanding(p, 5); return `You turned ${h.name} into what they hunted. Their crew scattered. A cruel kind of justice (Humanity −1, Standing +5, the Hunt falls to 15).`; }]);
        if (r.owed > 0 || r.standing >= 40) opts.push([r.owed > 0 ? "Call your court (a favour)" : "Call your court", () => { if (r.owed > 0) r.owed--; else Reborn.addStanding(p, -5); r.hunt = 10; r.hunter = null; return "Your court took care of it. You don't ask how. (The Hunt falls to 10.)"; }]);
        Reborn.milestone("The Hunters Strike", `${h.name} and their crew kicked in your door at dusk, with stakes, garlic and a camera. What do you do?`, img("icon_vamp_hunter"), opts);
    },
    fight(p: any, win: number, pre = ""): string {
        const r = Reborn.st(p);
        const h = r.hunter;
        if (roll(win)) {
            r.hunt = clamp(r.hunt - 50, 0, 100);
            Reborn.addHumanity(p, -0.5);
            if (h && roll(0.3)) { r.hunter = { name: hunterName(), base: h.base, martyrs: h.martyrs + 1, stage: 1 }; r.hunt = 40; return pre + `You won, but ${h.name} became a martyr: ${r.hunter.name} has sworn to finish the job (the Hunt is 40).`; }
            r.hunter = null;
            return pre + "You won. The hunters fled into the night and won't be back for a while (the Hunt −50, Humanity −½).";
        }
        // never fatal (v0.30.1): staked and dragged into the sun, then years of torpor
        if (r.allyIds.length && !(r as any).allySaved) { (r as any).allySaved = true; r.hunt = 30; return pre + "You were losing, until your ally burst through the window and dragged you out. You owe them everything (the Hunt is 30)."; }
        Vampire.state(p).collapsePending = true; (Vampire.state(p) as any).torporKind = "staked";
        return pre + "They got you. A stake through the heart, and the sun on your face. Everything went dark.";
    },
    flee(p: any): string {
        const r = Reborn.st(p);
        if (Vampire.has("mistStep", p) || Vampire.has("vanish", p) || r.lair.includes("exit")) { r.hunt = clamp(r.hunt - 35, 0, 100); return "You were gone before they reached the stairs. They lost your trail (the Hunt −35)."; }
        Masquerade.moveCity(p, true);
        return "You packed a bag and left before dawn. You lost your job, but the hunters lost your trail.";
    },
    /** Move to a new city: a new court (you start at Known), new hunting grounds, a fresh start with the neighbours. */
    moveCity(p: any, free = false) {
        const r = Reborn.st(p);
        if (!free) { /* the Lifepaths action has already charged its price */ }
        p.getJobState().setCurrentJob(null);
        rumours(p, -50);
        for (const f of Relationships.friends(p)) if (!Vampire.knows(f)) f.setRelationshipProgress(f.getRelationshipProgress() - 100);
        r.hunt = clamp(r.hunt - 40, 0, 100);
        if (r.hunt < 30) r.hunter = null;
        r.cityWeek = now(p); r.lastAgeing = now(p);
        r.domain = null;
        Court.newCity(p);
    },
    coverStory(p: any): string {
        Reborn.st(p).cover = true;
        rumours(p, -10);
        return "Everyone now \"knows\" about your rare skin condition and your night job at the data centre. It explains the pale skin and the nights (Rumours −10; ageing questions and missed daytime events stir half the Rumours).";
    },
    /** Every few decades: a new name on your résumé, references from "your father", your skills intact. */
    newIdentity(p: any): string {
        const r = Reborn.st(p);
        const old = p.getFullName();
        const first = NameGenerator.INSTANCE.generateFirstName(p.getSex());
        p.setFirstName(first);
        p.getJobState().setCurrentJob(null);
        rumours(p, -30);
        r.identityWeek = now(p); r.lastAgeing = now(p); r.cityWeek = now(p);
        return `${old} "retired abroad". You're ${first} ${p.lastName} now, with glowing references from "your father". You'll need a new job, but your skills and career history come with you (Rumours −30).`;
    },
    identityLock(p: any): string | null {
        const y = (now(p) - Reborn.st(p).identityWeek) / WPY();
        return y < 15 ? `You've only been this person for ${Math.floor(y)} years (15+ needed)` : null;
    },
};

// ====================================================================== the court
export const Court = {
    members(p: any = player()): any[] { const r = Reborn.peek(p); return (r?.courtIds ?? []).map((id) => Relationships.circle(p).get(id)).filter((x: any) => x && x.getIsAlive()); },
    prince(p: any = player()): any { const id = Reborn.peek(p)?.princeId; return id ? Relationships.circle(p).get(id) : null; },
    rival(p: any = player()): any { const id = Reborn.peek(p)?.rivalId; return id ? Relationships.circle(p).get(id) : null; },
    allies(p: any = player()): any[] { const r = Reborn.peek(p); return (r?.allyIds ?? []).map((id) => Relationships.circle(p).get(id)).filter(Boolean); },
    /** The court sits in the country's first big city. */
    cityName(p: any = player()): string {
        const BIG: Record<string, string> = { unitedStates: "New York", canada: "Toronto", japan: "Tokyo", france: "Paris", spain: "Madrid", uk: "London", china: "Shanghai" };
        try { const c = Reborn.country(p); return BIG[c] ?? COUNTRY_BY_ID[c]?.cities?.[0] ?? COUNTRY_BY_ID[c]?.name ?? "your city"; } catch { return "your city"; }
    },
    /** Each country's capital has its own court (made once). */
    ensure(p: any) {
        const r = Reborn.st(p);
        const c = Reborn.country(p);
        if (r.city === c && Court.members(p).length) return;
        if (r.city && r.city !== c) { Court.newCity(p); return; }
        r.city = c;
        Court.build(p);
    },
    build(p: any) {
        const r = Reborn.st(p);
        const prince = Becoming.makeVampire(p, "prince", null, 250 + Math.floor(Math.random() * 600));
        prince.courtTitle = "Prince";
        const ids = [prince.id];
        for (const t of COURT_TITLES.slice(1, 5)) { const x = Becoming.makeVampire(p, "court"); x.courtTitle = t; x.setRelationshipProgress(400 + Math.floor(Math.random() * 200)); ids.push(x.id); }
        r.courtIds = ids; r.princeId = prince.id;
    },
    newCity(p: any) {
        const r = Reborn.st(p);
        for (const x of Court.members(p)) if (!r.allyIds.includes(x.id) && x.id !== r.sireId) Relationships.circle(p).remove(x.id);
        r.courtIds = r.courtIds.filter((id) => r.allyIds.includes(id));
        if (r.rivalId && !r.allyIds.includes(r.rivalId)) r.rivalId = null;
        r.city = Reborn.country(p);
        r.standing = Math.min(r.standing, 20) || 20;
        Court.build(p);
    },
    week(p: any) {
        const r = Reborn.st(p);
        // a rival takes against you
        if (!r.rivalId && r.standing >= 20 && Reborn.bloodYears(p) >= 2 && roll(0.01)) {
            const c = Court.members(p).filter((x: any) => x.id !== r.princeId && !r.allyIds.includes(x.id));
            if (c.length) { const x = pick(c); r.rivalId = x.id; x.setRelationshipProgress(150); Reborn.note(p, "A Rival", `${x.getFullName()}, the court's ${x.courtTitle ?? "vampire"}, has taken against you. Expect trouble for years.`, img("icon_vamp_court")); }
        }
        if (r.rivalId && now(p) - r.lastRivalry >= WPY() && roll(0.05)) { r.lastRivalry = now(p); Court.rivalry(p); }
        // the Prince's task resolves
        if (r.task && now(p) >= r.task.until) Court.finishTask(p);
        // elders stir beneath the city
        if (Reborn.rankIndex(p) >= 2 && roll(0.002)) Court.elder(p);
    },
    canAttend(p: any): string | null { return now(p) - Reborn.st(p).lastCourt < 4 ? "Court meets once a month" : null; },
    attend(p: any) {
        const r = Reborn.st(p);
        r.lastCourt = now(p);
        const prince = Court.prince(p), rival = Court.rival(p);
        const other = pick(Court.members(p).filter((x: any) => x.id !== r.princeId)) ?? prince;
        const topic = pick([
            `${prince?.getFirstName() ?? "The Prince"} proposes closing the docks to all hunting for a year.`,
            `${other?.getFirstName() ?? "Someone"} wants a new fledgling punished for a sloppy kill.`,
            "There's talk of letting a rival city's vampires pass through.",
            `${prince?.getFirstName() ?? "The Prince"} wants every vampire to pay a tithe of favours.`,
        ]);
        const sure = Vampire.has("dominate", p);
        Reborn.menu("Court in Elysium", `The court gathers at midnight. ${topic}${rival ? ` ${rival.getFirstName()} is watching you.` : ""}`, img("icon_vamp_court"), [
            ["Support the Prince", () => { prince?.setRelationshipProgress(Math.min(1000, prince.getRelationshipProgress() + 60)); Reborn.addStanding(p, 2); return "The Prince noted your support (Standing +2)."; }],
            ["Speak against it", () => { if (sure || roll(0.5)) { Reborn.addStanding(p, 5); return sure ? "Your voice carried the room. Nobody quite knows why (Standing +5)." : "Your argument won the room (Standing +5)."; } Reborn.addStanding(p, -3); prince?.setRelationshipProgress(prince.getRelationshipProgress() - 50); return "You lost the vote, and the Prince remembers (Standing −3)."; }],
            ["Stay quiet", () => "You listened, learned who sided with whom, and said nothing."],
        ]);
    },
    callFavour(p: any) {
        const r = Reborn.st(p), s = Vampire.state(p);
        const opts: [string, () => string][] = [
            ["Bury the Rumours", () => { r.owed--; s.suspicion = clamp(s.suspicion - 40, 0, 100); return "A word in the right ear, a story in the papers. People forgot (Rumours −40)."; }],
            ["Call off the Hunt", () => { r.owed--; r.hunt = clamp(r.hunt - 30, 0, 100); if (r.hunt < 30) r.hunter = null; return "Someone made the hunters look somewhere else (the Hunt −30)."; }],
        ];
        if (r.rivalId) opts.push(["Have your rival exiled", () => { r.owed--; const x = Court.rival(p); if (x) { Relationships.circle(p).remove(x.id); r.courtIds = r.courtIds.filter((id) => id !== x.id); } r.rivalId = null; Reborn.addStanding(p, 5); return "Your rival left the city before dawn and won't be back (Standing +5)."; }]);
        opts.push(["Keep it for later", () => "Favours keep. You'll use it when it counts."]);
        Reborn.menu("Call In a Favour", `${r.owed} favour${r.owed === 1 ? "" : "s"} owed to you.`, img("icon_vamp_court"), opts);
    },
    taskLock(p: any): string | null {
        const r = Reborn.st(p);
        if (r.task) return `Busy: ${r.task.title}`;
        return now(p) - r.lastTask < 12 ? "The Prince has no work for you yet (every 12 weeks)" : null;
    },
    startTask(p: any): string {
        const r = Reborn.st(p);
        const t = pick(TASKS);
        r.task = { id: t.id, title: t.title, until: now(p) + t.weeks, power: t.power };
        r.lastTask = now(p);
        return `The Prince's task: ${t.title.toLowerCase()}. You'll know how it went in ${t.weeks} weeks (your ${t.power} powers help).`;
    },
    finishTask(p: any) {
        const r = Reborn.st(p);
        const t = r.task!;
        r.task = null;
        const owned = TREE.filter((n) => n.discipline === t.power && Vampire.has(n.id, p)).length;
        if (roll(clamp(0.5 + 0.12 * owned, 0.5, 0.92))) {
            Reborn.addStanding(p, 10); Vampire.state(p).bloodPower += 1; r.owed++;
            Reborn.note(p, "Task Done", `You did it: ${t.title.toLowerCase()}. The Prince is pleased (Standing +10, +1 blood power, and they owe you a favour).`, img("icon_vamp_task"));
        } else {
            Reborn.addStanding(p, -5);
            Reborn.note(p, "Task Failed", `You failed to ${t.title.toLowerCase().replace(/^find/, "find").replace(/^deal/, "deal")}. The Prince is disappointed (Standing −5).`, img("icon_vamp_task"));
        }
    },
    domainLock(p: any): string | null {
        const r = Reborn.st(p);
        if (r.domain) return null;
        return r.standing < 40 ? "Needs Respected standing (40)" : null;
    },
    claimDomain(p: any, groundId: string): string {
        const r = Reborn.st(p);
        const g = GROUNDS.find((x) => x.id === groundId)!;
        r.domain = g.id;
        return `${g.title} is your domain now: hunting there stirs half the Rumours, Rumours fade faster, and you collect a favour every year.`;
    },
    rivalry(p: any) {
        const r = Reborn.st(p), x = Court.rival(p);
        if (!x) return;
        const n = x.getFirstName();
        const kind = pick(["ground", "frame", "duel"]);
        if (kind === "ground" && r.domain) {
            Reborn.menu("Your Rival Moves", `${n} is hunting openly in your domain.`, img("icon_vamp_court"), [
                ["Drive them out", () => { if (roll(Vampire.fightWinChance(p) - 0.1)) { Reborn.addStanding(p, 6); return `You drove ${n} out (Standing +6).`; } r.domain = null; Reborn.addStanding(p, -6); return `${n} beat you. Your domain is theirs now (Standing −6).`; }],
                ["Let it go", () => { r.domain = null; Reborn.addStanding(p, -4); return `You let ${n} have it. People noticed (Standing −4, your domain is gone).`; }],
            ]);
            return;
        }
        if (kind === "frame") {
            Reborn.menu("Framed", `${n} has told the Prince you broke the Masquerade.`, img("icon_vamp_court"), [
                ...(r.owed > 0 ? [["Spend a favour to clear your name", () => { r.owed--; return "A favour called in, and the charge went away."; }] as [string, () => string]] : []),
                ["Take the blame", () => { rumours(p, 10); Reborn.addStanding(p, -5); return "The court believed them (Rumours +10, Standing −5)."; }],
            ]);
            return;
        }
        Reborn.menu("A Duel", `${n} challenged you before the whole court: wits or claws.`, img("icon_vamp_court"), [
            ["Claws", () => { if (roll(Vampire.fightWinChance(p))) { Reborn.addStanding(p, 8); return `You won in front of everyone (Standing +8).`; } Vampire.harming = true; try { attr(p, -25, -5, 0); } finally { Vampire.harming = false; } Reborn.addStanding(p, -8); return `${n} won (Standing −8, −25 health).`; }],
            ["Wits", () => { if (roll(Vampire.has("hypnoticGaze", p) ? 0.75 : 0.5)) { Reborn.addStanding(p, 6); return "Your words drew blood (Standing +6)."; } Reborn.addStanding(p, -6); return `${n} made you look a fool (Standing −6).`; }],
            ["Refuse", () => { Reborn.addStanding(p, -3); return "You declined. Some call it wisdom (Standing −3)."; }],
        ]);
    },
    summons(p: any) {
        Reborn.milestone("Summoned by the Prince", "Your Rumours have reached the court. The Prince summons you: the Masquerade comes first, and you are endangering it.", img("icon_vamp_court"), [
            ["Pay in blood (2 blood power)", () => { const s = Vampire.state(p); s.bloodPower = Math.max(0, s.bloodPower - 2); s.suspicion = clamp(s.suspicion - 30, 0, 100); return "You paid, and the court cleaned up after you (Rumours −30)."; }],
            ["Take a task to make it right", () => { const r = Reborn.st(p); Vampire.state(p).suspicion = clamp(Vampire.state(p).suspicion - 15, 0, 100); if (!r.task) Court.startTask(p); Reborn.addStanding(p, -3); return "You'll earn your way back (Rumours −15, Standing −3)."; }],
            ["Accept exile", () => { Masquerade.moveCity(p, true); return "You left the city that night. A new court, a clean slate."; }],
        ]);
    },
    elder(p: any) {
        Reborn.note(p, "An Elder Wakes", "Something old has woken beneath the city.", img("icon_vamp_court"));
        Reborn.menu("An Elder Wakes", "An ancient vampire, older than the city, has woken in the catacombs and summoned you. They offer power, for a terrible favour.", Vampire.image, [
            ["Serve them", () => { Vampire.state(p).bloodPower += 3; Reborn.addStanding(p, 5); Reborn.addHumanity(p, -1); return "You did what they asked. You won't speak of it (+3 blood power, Standing +5, Humanity −1)."; }],
            ["Report them to the Prince", () => { Reborn.addStanding(p, 10); Reborn.st(p).owed++; return "The court sealed the catacombs again, and the Prince owes you (Standing +10, +1 favour)."; }],
            ["Refuse", () => { Reborn.addStanding(p, -2); return "You walked away. They'll sleep again. Maybe."; }],
        ]);
    },
};

// ====================================================================== love, thralls, childer (the Bonds module fills these in)
export const Bonds = {
    thralls(p: any = player()): any[] {
        try { return [...Relationships.familyPeople(p), ...Relationships.circle(p).list()].filter((x: any) => x.getIsAlive() && Relationships.meta(x, p).thrall); } catch { return []; }
    },
};

// ====================================================================== living forever
export const Forever = {
    era(p: any) {
        const what = pick(ERAS);
        Reborn.menu("The World Changed", `${what}. Another era has passed you by.`, Vampire.image, [
            ["Adapt", () => { attr(p, 0, 0, 3); return "You learned the new ways, again (+3 sanity)."; }],
            ["Cling to the past", () => { attr(p, 0, 6, 0); rumours(p, 5); return "You kept your old habits. Comforting, and a little suspicious (+6 happiness, Rumours +5)."; }],
        ]);
    },
    antique(p: any) {
        const value = 5000 + Reborn.bloodYears(p) * 400;
        Reborn.menu("An Heirloom", `A dealer spotted something you bought decades ago: a watch, a painting, a chair. It's an antique now, worth about ${money(value)}.`, Vampire.image, [
            [`Sell it (${money(value)})`, () => { earn(p, value); return `Sold. Your own past paid ${money(value)}.`; }],
            ["Keep it", () => { attr(p, 0, 3, 0); return "Some things you don't sell (+3 happiness)."; }],
        ]);
    },
    lairCost(id: string): number { return LAIR.find((x) => x.id === id)?.cost ?? 0; },
    buyLair(p: any, id: string) { const r = Reborn.st(p); if (!r.lair.includes(id)) r.lair = [...r.lair, id]; if (id === "manor") Reborn.addStanding(p, 10); },
    vaultIn(p: any, n: number) { pay(p, n); Reborn.st(p).vault += n; },
    vaultOut(p: any) { const r = Reborn.st(p); const n = r.vault; r.vault = 0; earn(p, n); return n; },
    /** Golconda: Humanity 10 held for a century, then a quest in three steps. */
    golcondaLock(p: any): string | null {
        const r = Reborn.st(p);
        if (r.golconda) return "You've reached Golconda";
        if (r.at10Weeks < 100 * WPY()) return `Hold Humanity 10 for a century (${Math.floor(r.at10Weeks / WPY())} of 100 years)`;
        return null;
    },
    golcondaStep(p: any): string {
        const r = Reborn.st(p);
        r.golcondaStep++;
        if (r.golcondaStep < 3) return ["You fasted for a month, and the hunger only whispered.", "You stood in a cathedral at noon, and the sun only stung."][r.golcondaStep - 1] + ` (${r.golcondaStep} of 3)`;
        r.golconda = true;
        return "Golconda. The Beast is quiet at last: your hunger has almost faded, and the sun only stings. Live as long as you like.";
    },
    /** The Ashen (or a Sun scholar) can research a Cure instead of buying it. */
    cureLock(p: any): string | null {
        if (!(Reborn.isLine("ashen", p) || Vampire.has("ancientScholar", p))) return "Only the Ashen, or a vampire with Ancient Scholar, can research it";
        return Reborn.rankIndex(p) < 1 ? "Needs Neonate rank (25 years)" : null;
    },
    research(p: any): string {
        const r = Reborn.st(p);
        r.cureResearch += Reborn.st(p).lair.includes("library") ? 2 : 1;
        if (r.cureResearch >= 12) { r.cureResearch = 0; Vampire.startCure(p); return "Your notes, a century of alchemy and one last ingredient: the Cure is ready, and you drink it. In 4 weeks your heart will beat again."; }
        return `Another month of experiments (${r.cureResearch} of 12).`;
    },
};
void lineOf; void BLOOD_DIETS;
export type { LifeActionDef };
