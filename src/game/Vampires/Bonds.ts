// v0.35.0 "Vampires Reborn": love, family and the ones you turn. Telling your secret, partners ageing around you,
// grief, thralls (the blood bond), childer you sire, your sire, the court as people (favours, alliances, romance),
// your herd, and heirs who inherit a vampire legacy. Family never drifts from doing nothing: guiding a childe only helps.
import { R } from "../runtime";
import { Modifiers } from "../Managers/Modifiers";
import { Person } from "../Managers/Person";
import { Relationship } from "../Enums/Relationship";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { Sexuality } from "../Enums/Sexuality";
import { TrueAge } from "../Managers/TrueAge";
import { Relationships } from "../Social/Relationships";
import { type LoveActionDef } from "../Social/LoveActions";
import { Vampire } from "../Lifepaths/Vampire";
import { Reborn, player, WPY, roll, clamp, img, now } from "./Reborn";
import { Becoming } from "./Becoming";
import { Night, Court, Bonds as BondsBase } from "./Night";
import { lineOf } from "./VData";

const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const alive = (t: any) => t != null && t.getIsAlive();
const age = (t: any) => t.getAgeInYears();
const REL = ["grandparent", "auntUncle", "cousin", "nibling", "grandchild", "greatGrandchild"];
const PEOPLE = ["partner", "parent", "child", "sibling", "friend", ...REL];
const isNight = (t: any, role?: string) => t?.kind === "night" && (!role || t.nightRole === role);
const meta = (t: any, p: any = player()) => Relationships.meta(t, p);

export const Bonds = {
    ...BondsBase,
    // ------------------------------------------------------------------ the secret
    tell(p: any, t: any) {
        const m = meta(t, p), name = t.getFirstName();
        const h = Reborn.humanity(p);
        const accept = t.getRelationshipProgress() >= 600 || roll(0.2 + (h >= 8 ? 0.2 : h <= 3 ? -0.1 : 0));
        if (accept) {
            m.knows = true;
            if (age(t) >= 18 && roll(0.3)) { m.wantsTurn = true; Vampire.alert("Your Secret", `${name} listened, went quiet, then took your hand: "Then make me like you. I want forever too."`, Vampire.image); return; }
            Vampire.alert("Your Secret", `${name} listened, went quiet, then hugged you. Your secret is safe with them.`, Vampire.image);
            return;
        }
        if (Relationships.kindOf(t) === "partner" && roll(0.5)) { Vampire.alert("Your Secret", `${name} couldn't handle it and left you.`, R.drawable.love_breakup); p.getFamilyState().breakUp(); return; }
        m.knows = true;
        t.setRelationshipProgress(t.getRelationshipProgress() - 150);
        if (roll(0.5)) { Vampire.state(p).suspicion = clamp(Vampire.state(p).suspicion + 15, 0, 100); Vampire.alert("Your Secret", `${name} is scared of you now (−150 relationship), and told someone (Rumours +15).`, R.drawable.angry); return; }
        Vampire.alert("Your Secret", `${name} is scared of you now (−150 relationship), but kept it to themselves.`, R.drawable.angry);
    },
    // ------------------------------------------------------------------ siring
    turnLock(p: any, t: any): string | null {
        if (meta(t, p).cured) return "They've already lived their one vampire life";
        if (age(t) < 18) return "They must be 18 or older";
        if (Vampire.state(p).bloodPower < Vampire.turnCost) return `Needs ${Vampire.turnCost} blood power`;
        if (Reborn.rankIndex(p) < 1 && !Vampire.has("ancientBlood", p)) return "Only a Neonate (25 years of blood) can sire a childe";
        return null;
    },
    turn(p: any, t: any) {
        const unwilling = t.getRelationshipProgress() < 500 && !meta(t, p).wantsTurn;
        Vampire.turn(p, t);
        const m = meta(t, p);
        m.childe = true; m.guided = 0; delete m.wantsTurn;
        (m as any).childeLine = Reborn.st(p).line;
        if (unwilling) {
            Reborn.addHumanity(p, -2); Reborn.addStanding(p, -10);
            t.setRelationshipProgress(Math.max(0, t.getRelationshipProgress() - 300));
            Vampire.alert("Against Their Will", `${t.getFirstName()} didn't want this. They rose hating you (−300 relationship), and the court frowns on it (Humanity −2, Standing −10).`, Vampire.image);
        }
    },
    childer(p: any = player()): any[] { try { return Vampire.coven(p).filter((x: any) => meta(x, p).childe); } catch { return []; } },
    guide(p: any, t: any): string {
        const m = meta(t, p);
        m.guided = (m.guided ?? 0) + 1;
        m.lastGuided = now(p);
        if (m.guided === 3) { Reborn.st(p).owed++; Reborn.addStanding(p, 3); return `${t.getFirstName()} has grown into a fine vampire, and speaks for you at court (+1 favour, Standing +3).`; }
        return pick3([`You taught ${t.getFirstName()} to feed without leaving a mark.`, `You showed ${t.getFirstName()} the old safe houses of the city.`, `You sat up with ${t.getFirstName()} through a hard night of hunger.`]);
    },
    // ------------------------------------------------------------------ thralls
    shareLock(p: any, t: any): string | null {
        if (Vampire.isTurned(t)) return "They're a vampire";
        if (age(t) < 18) return "They must be 18 or older";
        return null;
    },
    share(p: any, t: any): string {
        const m = meta(t, p);
        m.bloodShares = (m.bloodShares ?? 0) + 1;
        const need = Vampire.has("bloodBond", p) ? 1 : 3;
        if (m.bloodShares >= need) {
            m.thrall = true;
            t.setRelationshipProgress(Math.max(900, t.getRelationshipProgress()));
            Reborn.addHumanity(p, -1);
            return `${t.getFirstName()} drank your blood ${need === 1 ? "once" : "a third time"}, and something in their eyes changed for good. They're your thrall now: devoted, loyal and protective. They'll guard your day sleep and quiet the gossip (Rumours fall every week). It's power, and it's grim (Humanity −1).`;
        }
        t.setRelationshipProgress(Math.min(1000, t.getRelationshipProgress() + 30));
        return `${t.getFirstName()} drank a little of your blood and felt wonderful (+30 relationship). ${need - m.bloodShares} more time${need - m.bloodShares === 1 ? "" : "s"} and they'll be bound to you.`;
    },
    // ------------------------------------------------------------------ ageing around you, grief
    week(p: any) {
        if (!Reborn.on(p)) return;
        const partner = p.getFamilyState?.()?.getPartner?.();
        if (alive(partner) && !Vampire.isTurned(partner)) {
            const r = Reborn.st(p);
            const seen = r.milestones[partner.getId()] ?? (r.milestones[partner.getId()] = []);
            for (const at of [50, 70, 90]) {
                if (age(partner) >= at && !seen.includes(at)) { seen.push(at); Bonds.partnerAgeing(p, partner, at); break; }
            }
        }
    },
    partnerAgeing(p: any, t: any, at: number) {
        const n = t.getFirstName();
        const can = Bonds.turnLock(p, t) == null && Vampire.knows(t);
        Reborn.menu(`${n} Is ${at}`, `${n} found a grey hair, then looked at you: "You haven't changed at all, have you? Not one day."`, R.drawable.love_romantic_dinner, [
            ...(can ? [[`Offer to turn them (${Vampire.turnCost} blood power)`, () => { Bonds.turn(p, t); return `${n} said yes. They'll stay ${at} forever, with you.`; }] as [string, () => string]] : []),
            ["Stay until the end", () => { Reborn.addHumanity(p, 0.5); t.setRelationshipProgress(Math.min(1000, t.getRelationshipProgress() + 50)); return `You held their hand. You'll stay until the very end (+50 relationship, Humanity +½).`; }],
            ["Let them go", () => { attr(p, 0, -10, 0); try { p.getFamilyState().breakUp(); } catch { /* */ } return `You left, so they could have an ordinary life with someone who'll grow old beside them (−10 happiness).`; }],
        ]);
    },
    /** A loved mortal died (replaces the flat −10 sanity). A random event: silenced, you mourn. */
    grief(person: any) {
        try {
            const p = player();
            if (!Reborn.on(p) || person.getPetType?.() != null || Vampire.isTurned(person)) return;
            const n = person.getFirstName();
            Reborn.ask(p, "Grief", `${n} is gone, and you'll go on for centuries without them. How do you carry it?`, R.drawable.love_funeral, [
                ["Mourn them", () => { attr(p, 0, 0, -10); Reborn.addHumanity(p, 0.5); return "You let it hurt. Remembering keeps you human (−10 sanity, Humanity +½)."; }],
                ["Numb it", () => { Reborn.addHumanity(p, -0.5); return "You felt nothing. That should scare you more than it does (Humanity −½)."; }],
                ["Never love a mortal again", () => { Reborn.st(p).neverLove = true; Reborn.addHumanity(p, -1); return "You closed that door for good. Dating will rarely work now (Humanity −1)."; }],
            ]);
        } catch { /* no player */ }
    },
    datingFactor(p: any = player()): number { return Reborn.peek(p)?.neverLove && Vampire.isVampire(p) ? 0.3 : 1; },
    // ------------------------------------------------------------------ vampire romance
    dateLock(p: any, t: any): string | null {
        if (p.getFamilyState().getPartner() != null) return "You're already with someone";
        if (t.nightRole === "prince") return "The Prince doesn't date subjects";
        return t.getRelationshipProgress() < 600 ? "Get closer first (600 relationship)" : null;
    },
    date(p: any, t: any): string {
        const lover = new Person(t.firstName, t.lastName, t.getGender(), t.sexuality ?? Sexuality.straight, t.getSex(), Relationship.lover, t.getAgeInWeeks(), LoverPersonality.cheerful);
        try { TrueAge.copy(t, lover); } catch { /* */ }
        lover.setRelationshipProgress(Math.max(600, t.getRelationshipProgress()));
        const r = Reborn.st(p);
        r.courtIds = r.courtIds.filter((id) => id !== t.id); r.allyIds = r.allyIds.filter((id) => id !== t.id);
        if (r.rivalId === t.id) r.rivalId = null;
        Relationships.circle(p).remove(t.id);
        p.getFamilyState().date(lover);
        const m = Relationships.circle(p).metaFor(lover.getId());
        m.vampire = true; m.knows = true;
        return `${t.getFirstName()} said yes. Two immortals: this could last a very long time (an Eternal Bond, if you like).`;
    },
    // ------------------------------------------------------------------ heirs
    heir(parent: any, heir: any) {
        const r = Reborn.peek(parent), v = parent?.vampire;
        if (!v || !(v.isVampire || v.cured) || !r) return;
        heir.vampireLegacy = { name: parent.getFullName(), line: r.line, rank: Reborn.rank(parent).title, childer: Bonds.childer(parent).map((x: any) => x.getFullName()).slice(0, 3) };
    },
};
const pick3 = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];

/** Love tab actions for the night (added to LOVE_ACTIONS at install). */
export const NIGHT_LOVE_ACTIONS: LoveActionDef[] = [
    // mortals who know your secret
    { id: "shareBlood", title: "Share Your Blood", image: img("icon_vamp_thrall"), who: PEOPLE, section: "big", instant: true,
        show: (t, p) => alive(t) && Reborn.on(p) && Vampire.knows(t) && !Vampire.isTurned(t) && !meta(t, p).thrall,
        lock: (t, p) => Bonds.shareLock(p, t),
        note: (t) => `A taste of your blood. ${Vampire.has("bloodBond") ? "Once" : "Three times"} and ${t.getFirstName()} becomes your thrall: devoted and protective, at a cost to your Humanity.\n`,
        run: (t, p) => Vampire.alert("The Blood Bond", Bonds.share(p, t), img("icon_vamp_thrall")) },
    { id: "guideChilde", title: "Guide Your Childe", image: img("icon_vamp_childe"), who: [...PEOPLE, "night"], section: "time", bond: 25,
        show: (t, p) => alive(t) && Reborn.on(p) && !!meta(t, p).childe,
        note: (t) => `Teach ${t.getFirstName()} the ways of the night. A well-raised childe speaks for you at court (${meta(t).guided ?? 0} of 3).\n`,
        run: (t, p) => Vampire.alert("Your Childe", Bonds.guide(p, t), img("icon_vamp_childe")) },
    // asking a vampire for forever (you're human)
    { id: "askTurn", title: "Ask Them to Turn You", image: img("icon_vamp_bite"), who: [...PEOPLE, "night"], section: "big", instant: true,
        show: (t, p) => alive(t) && !Vampire.isVampire(p) && !Vampire.isTurning(p) && Vampire.isTurned(t) && !(t.kind === "night" && t.nightRole === "herd"),
        lock: (_t, p) => Vampire.canBecome(p) ?? (Vampire.state(p).discovered && Reborn.st(p).way !== "loved" ? "Another vampire has already made you an offer" : null),
        note: (t) => `${t.getFirstName()} could make you a vampire (they'll need to love you: 600+).\n`,
        run: (t, p) => Vampire.alert("Forever", Becoming.askToBeTurned(p, t), Vampire.image) },
    // the court
    { id: "nightRespects", title: "Pay Your Respects", image: img("icon_vamp_court"), who: ["night"], section: "time", bond: 20,
        show: (t, p) => alive(t) && Reborn.on(p) && (isNight(t, "court") || isNight(t, "prince") || isNight(t, "sire")) },
    { id: "nightFavour", title: "Do Them a Favour", image: img("icon_vamp_court"), who: ["night"], section: "time", bond: 30,
        show: (t, p) => alive(t) && Reborn.on(p) && (isNight(t, "court") || isNight(t, "prince")),
        note: (t) => `Help ${t.getFirstName()} with something unpleasant. Close vampires (600+) will owe you a favour.\n`,
        run: (t, p) => { if (t.getRelationshipProgress() >= 600) { Reborn.st(p).owed++; Vampire.alert("A Favour", `${t.getFirstName()} owes you one now. Favours keep.`, img("icon_vamp_court")); } } },
    { id: "nightAlly", title: "Form an Alliance", image: img("icon_vamp_court"), who: ["night"], section: "big", instant: true,
        show: (t, p) => alive(t) && Reborn.on(p) && isNight(t, "court") && !Reborn.st(p).allyIds.includes(t.id) && Reborn.st(p).rivalId !== t.id,
        lock: (t, p) => (Reborn.st(p).allyIds.length >= 3 ? "You have 3 allies already" : t.getRelationshipProgress() < 700 ? "Needs 700 relationship" : null),
        note: () => "Allies cover for you: they cool the Hunt every month and may save you from hunters once.\n",
        run: (t, p) => { Reborn.st(p).allyIds = [...Reborn.st(p).allyIds, t.id]; Vampire.alert("Alliance", `You and ${t.getFirstName()} swore to cover for each other.`, img("icon_vamp_court")); } },
    { id: "nightDate", title: "Ask Them Out", image: R.drawable.love_romantic_dinner, who: ["night"], section: "big", instant: true,
        show: (t, p) => alive(t) && Reborn.on(p) && (isNight(t, "court") || isNight(t, "sire")),
        lock: (t, p) => Bonds.dateLock(p, t),
        run: (t, p) => Vampire.alert("Vampire Romance", Bonds.date(p, t), R.drawable.love_romantic_dinner) },
    { id: "nightChallenge", title: "Challenge Your Rival", image: R.drawable.skull, who: ["night"], section: "hard", instant: true,
        show: (t, p) => alive(t) && Reborn.on(p) && Reborn.st(p).rivalId === t.id,
        lock: (_t, p) => (now(p) - Reborn.st(p).lastRivalry < 12 ? "You fought recently" : null),
        run: (_t, p) => { Reborn.st(p).lastRivalry = now(p); Court.rivalry(p); } },
    // your sire
    { id: "sireLearn", title: "Learn from Your Sire", image: img("icon_vamp_sire"), who: ["night", ...PEOPLE], section: "time", bond: 15,
        show: (t, p) => alive(t) && Reborn.on(p) && Reborn.st(p).sireId === t.getId(),
        lock: (t, p) => (now(p) - ((Reborn.st(p) as any).lastLesson ?? -999) < WPY() ? "Once a year" : t.getRelationshipProgress() < 600 ? "They don't think much of you yet (600)" : null),
        run: (_t, p) => { (Reborn.st(p) as any).lastLesson = now(p); Vampire.state(p).bloodPower += 1; Vampire.alert("Your Sire", "A night of old lessons: +1 blood power.", img("icon_vamp_sire")); } },
    { id: "sireHunt", title: "Hunt Your Sire", image: R.drawable.skull, who: ["night"], section: "hard", instant: true,
        show: (t, p) => alive(t) && Reborn.on(p) && Reborn.st(p).sireId === t.getId() && Reborn.st(p).way === "attacked",
        confirm: (t) => `Go after ${t.getFirstName()}, who turned you against your will?`,
        run: (t, p) => {
            if (roll(Vampire.fightWinChance(p) - 0.15)) { t.isAlive = false; Relationships.circle(p).remove(t.id); Vampire.state(p).bloodPower += 2; Reborn.addStanding(p, 5); Vampire.alert("Revenge", `You found ${t.getFirstName()} at dawn and ended them. Their blood was old and strong (+2 blood power, Standing +5).`, Vampire.image); }
            else { Vampire.harming = true; try { attr(p, -30, -5, -5); } finally { Vampire.harming = false; } Vampire.alert("Not Yet", `${t.getFirstName()} laughed, threw you through a window, and vanished (−30 health).`, Vampire.image); }
        } },
    // your herd
    { id: "herdFeed", title: "Feed on Them", image: img("icon_vamp_herd"), who: ["night"], section: "time",
        show: (t, p) => alive(t) && Reborn.on(p) && isNight(t, "herd"),
        note: () => "−25 hunger, −10 relationship.\n",
        run: (t, p) => { Vampire.feed(p, 25, 0); t.setRelationshipProgress(t.getRelationshipProgress() - 10); } },
    { id: "herdRelease", title: "Let Them Go", image: R.drawable.love_breakup, who: ["night"], section: "hard", instant: true,
        show: (t, p) => alive(t) && isNight(t, "herd"),
        confirm: (t) => `Let ${t.getFirstName()} go? They'll leave your herd.`,
        run: (t, p) => { const r = Reborn.st(p); r.herdIds = r.herdIds.filter((id) => id !== t.id); Relationships.circle(p).remove(t.id); } },
];
void Night; void lineOf; void Vampire.image;
