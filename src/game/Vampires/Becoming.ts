// v0.35.0 "Vampires Reborn": becoming a vampire is a story. Five ways in (Seduced, Seeking, Attacked, Loved, Dying),
// a named sire from one of five bloodlines, and the turning in three steps: your last human night, the bite, and
// rising with a first hunger that sets your starting Humanity. Old vampires are converted once ("You've Been Reborn").
import { Sex } from "../Enums/Sex";
import { Relationships } from "../Social/Relationships";
import { SocialPerson } from "../Social/SocialPerson";
import { Subscriptions } from "../Managers/Subscriptions";
import { Vampire, LifeActions, type LifeActionDef } from "../Lifepaths/Vampire";
import { Reborn, player, WPY, roll, pick, clamp, img, now } from "./Reborn";
import { BLOODLINES, lineOf, TREE, type LineId } from "./VData";

import { Modifiers } from "../Managers/Modifiers";
const attrNow = (p: any, h: number, hap: number, san: number) => { try { p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san)); } catch { /* */ } };

export const Becoming = {
    // ------------------------------------------------------------------ vampires as people
    /** A vampire in your world (your sire, a court member). They don't age and remember you for centuries. */
    makeVampire(p: any, role: string, line: LineId | null = null, years = 80 + Math.floor(Math.random() * 400)): SocialPerson {
        const looks = (19 + Math.floor(Math.random() * 30)) * WPY();
        const x = SocialPerson.make("night" as any, Sex.INSTANCE.getRandomSex(), null, looks);
        x.nightRole = role;
        x.bloodline = line ?? pick(BLOODLINES).id;
        x.trueAgeInWeeks = looks + years * WPY();
        x.sinceWeek = Relationships.now();
        x.metAt = "night";
        x.setRelationshipProgress(500);
        Relationships.circle(p).add(x);
        const m = Relationships.circle(p).metaFor(x.id);
        m.vampire = true; m.knows = true;
        return x;
    },
    sire(p: any = player()): any { const id = Reborn.peek(p)?.sireId; return id ? Relationships.circle(p).get(id) : null; },
    ensureSire(p: any, line: LineId | null = null, years?: number): any {
        const r = Reborn.st(p);
        const existing = Becoming.sire(p);
        if (existing) return existing;
        const x = Becoming.makeVampire(p, "sire", line, years);
        r.sireId = x.id; r.sireName = x.getFullName(); r.sireLine = x.bloodline as LineId;
        r.sireAge = Math.floor((x.trueAgeInWeeks - x.ageInWeeks) / WPY());
        return x;
    },

    // ------------------------------------------------------------------ ways in
    /** Nightclubs and local events (and bars): the stranger who keeps showing up, or (rarely) an attack. */
    nightOut(p: any, event: any) {
        if (!event || !["nightClub", "localEvent"].includes(event.name())) return;
        const s = Vampire.state(p);
        if (s.isVampire || s.turningWeeks > 0 || Vampire.canBecome(p) != null) return;
        const r = Reborn.st(p);
        r.nightOuts++;
        if (!s.discovered && roll(0.02)) {
            s.discovered = true;
            r.way = "seduced"; r.meetings = 1;
            const x = Becoming.ensureSire(p);
            Vampire.alert("A Pale Stranger", `${x.getFullName()}, pale and strangely beautiful, watched you all night. As you left they whispered: "Eternity is yours, if you want it." A new path has opened in the Lifepaths tab: meet them again, and they'll make you an offer.`);
            return;
        }
        // decision 2: a rare darker way in, only for people who are out at night a lot
        if (!s.discovered && r.nightOuts >= 20 && roll(0.004)) Becoming.attacked(p);
    },
    attacked(p: any) {
        const s = Vampire.state(p), r = Reborn.st(p);
        s.discovered = true; r.way = "attacked";
        const x = Becoming.ensureSire(p);
        x.setRelationshipProgress(150);
        Reborn.milestone("Attacked", `Walking home alone, something caught you from behind. Teeth, cold hands, then nothing. You woke in an alley, freezing and starving, with a name in your head: ${x.getFullName()}. You're becoming a vampire, and nobody asked you.`, Vampire.image);
        Becoming.beginTurning(p, "alone", false);
    },
    /** Meet your sire-to-be again (Seduced): after three meetings they make the offer. */
    meet(p: any): string {
        const r = Reborn.st(p);
        const x = Becoming.sire(p);
        r.meetings++;
        x?.setRelationshipProgress(Math.min(1000, x.getRelationshipProgress() + 120));
        const n = x?.getFirstName() ?? "The stranger";
        const lines = [
            `${n} took you to a gallery after closing and talked about painters they'd known personally.`,
            `${n} met you on a rooftop and told you what the city looked like a hundred years ago.`,
            `${n} said nothing for an hour, just watched the river with you. Then: "I could give you forever."`,
        ];
        return lines[Math.min(r.meetings - 2, 2)] + (r.meetings >= 3 ? " The offer is made: Accept the Bite is in the Lifepaths tab." : "");
    },
    /** Seek the Ancient (kept): now a quest in three steps; at the end you choose your bloodline. */
    seekStep(p: any): string {
        const r = Reborn.st(p), s = Vampire.state(p);
        s.seekTries++;
        if (!roll(0.6)) return pick(["You chased whispers all night and found nothing.", "The address was a laundromat. The trail went cold.", "Someone followed you home. Then they were gone."]);
        r.seekStep++;
        if (r.seekStep === 1) return "An occult shop owner slid a card across the counter: an old library, after midnight.";
        if (r.seekStep === 2) return "In the library's locked room, a ledger of names going back centuries. One is still in the city.";
        s.discovered = true; r.way = "seeking";
        return "They found you before you found them. The ancients respect those who seek them out. Choose the bloodline you'll join (Lifepaths › Vampire).";
    },
    /** Seeking: you pick the bloodline (and get a sire from it). */
    chooseLine(p: any, line: LineId) {
        const r = Reborn.st(p);
        r.line = line;
        Becoming.ensureSire(p, line, 200 + Math.floor(Math.random() * 600));
        const x = Becoming.sire(p); if (x) { x.bloodline = line; r.sireLine = line; }
    },
    /** Loved: a vampire you love offers you forever (asked from their Love tab screen). */
    askToBeTurned(p: any, t: any): string {
        const r = Reborn.st(p), s = Vampire.state(p);
        if (t.getRelationshipProgress() < 600) { t.setRelationshipProgress(t.getRelationshipProgress() - 30); return `${t.getFirstName()} looked at you for a long time. "Not yet. Not like this." (−30 relationship)`; }
        s.discovered = true; r.way = "loved";
        r.sireId = t.getId(); r.sireName = t.getFullName(); r.sireLine = (t.bloodline as LineId) ?? pick(BLOODLINES).id; r.line = r.sireLine;
        r.sireAge = Math.max(1, Math.floor(((t.getTrueAgeInWeeks?.() ?? t.getAgeInWeeks()) - t.getAgeInWeeks()) / WPY()));
        t.setRelationshipProgress(Math.min(1000, t.getRelationshipProgress() + 100));
        return `${t.getFirstName()} took your hand. "Forever, then." Accept the Bite is waiting in the Lifepaths tab.`;
    },
    /** Dying: old or very ill, and a vampire you know offers a way out (once). */
    maybeDyingOffer(p: any) {
        const s = Vampire.peek(p);
        if (s?.isVampire || (s?.turningWeeks ?? 0) > 0 || Vampire.canBecome(p) != null) return;
        const r = Reborn.peek(p);
        if ((r as any)?.dyingOffered) return;
        let ill = false; try { ill = p.getAttributeState().getHealth() < 25; } catch { /* */ }
        const knowsOne = !!s?.discovered || Relationships.circle(p).list().some((x: any) => x.getIsAlive() && Relationships.circle(p).metaFor(x.id).vampire);
        if (!ill || p.getAgeInYears() < 55 || !knowsOne || !roll(0.05)) return;
        const rr = Reborn.st(p) as any;
        rr.dyingOffered = true;
        const x = Becoming.sire(p) ?? Relationships.circle(p).list().find((v: any) => v.getIsAlive() && Relationships.circle(p).metaFor(v.id).vampire) ?? Becoming.ensureSire(p);
        Reborn.milestone("A Way Out", `${x.getFullName()} sat by your bed when the nurses had gone. "You don't have to go into the dark. You could live in it." You'd stay ${p.getAgeInYears()} forever, but healed of everything.`, Vampire.image, [
            ["Accept", () => { const st = Vampire.state(p); st.discovered = true; rr.way = "dying"; if (!rr.sireId) { rr.sireId = x.getId(); rr.sireName = x.getFullName(); rr.sireLine = x.bloodline ?? "nosferim"; } Becoming.beginTurning(p, "family", false); return "You said yes. The bite felt like falling asleep."; }],
            ["Decline", () => "You thanked them, and asked them to leave. Whatever comes, it'll be yours."],
        ]);
    },

    // ------------------------------------------------------------------ the turning
    canAccept(p: any): string | null {
        const lock = Vampire.canBecome(p);
        if (lock) return lock;
        const r = Reborn.st(p), s = Vampire.state(p);
        if (!s.discovered) return "No vampire has offered you eternity yet";
        if (r.way === "seduced" && r.meetings < 3) return `Meet ${Becoming.sire(p)?.getFirstName() ?? "them"} ${3 - r.meetings} more time${3 - r.meetings === 1 ? "" : "s"} first`;
        if (r.way === "seeking" && !r.line) return "Choose your bloodline first";
        return null;
    },
    /** Step 1: your last human night. Then the bite (the turning week). */
    lastNightMenu(p: any) {
        Reborn.menu("Your Last Human Night", "Tomorrow you won't see the sun again. How do you spend your last night as a human?", img("icon_vamp_bite"), [
            ["With family", () => Becoming.beginTurning(p, "family")],
            ["Alone, remembering", () => Becoming.beginTurning(p, "alone")],
            ["Watch one last sunrise", () => Becoming.beginTurning(p, "sunrise")],
        ]);
    },
    /** passWeek: the turning week passes now (from the Lifepaths menu); false when it happens inside a week already. */
    beginTurning(p: any, night: "family" | "alone" | "sunrise", passWeek = true): string {
        const r = Reborn.st(p);
        r.lastNight = night;
        let memory = "";
        if (night === "family") { for (const x of Relationships.familyPeople(p)) if (x.getIsAlive() && x.getPetType?.() == null) x.setRelationshipProgress(Math.min(1000, x.getRelationshipProgress() + 50)); memory = "You laughed with your family until late (+50 relationship with all of them). They'll never know it was goodbye."; }
        else if (night === "alone") { attrNow(p, 0, 0, 10); memory = "You walked through every place that mattered to you (+10 sanity)."; }
        else { attrNow(p, 0, 10, 0); Vampire.state(p).bloodPower += 1; memory = "You watched the sun come up one last time and never forgot its colour (+10 happiness, +1 blood power)."; }
        const line = lineOf(r.line ?? Becoming.ensureSire(p)?.bloodline ?? null);
        if (!r.line) r.line = line.id;
        Vampire.acceptBite(p);
        const sire = Becoming.sire(p);
        const text = `${memory}\n\nThen ${sire?.getFirstName() ?? "your sire"} came for you. The bite: you join the ${line.title} bloodline. ${line.gift}\nThe price: ${line.weakness}\n\nBy the end of the week you'll rise.`;
        if (passWeek) { try { p.applyWeekly(); } catch (e) { console.error(e); } }
        return text;
    },
    /** Step 3 (end of the turning week): the first hunger sets your starting Humanity. Always shows. */
    risen(p: any) {
        const r = Reborn.st(p);
        r.converted = true;
        r.bloodAgeWeeks = 0;
        r.standing = r.way === "seeking" ? 30 : r.way === "attacked" ? 10 : 20;
        r.cityWeek = now(p); r.identityWeek = now(p);
        r.vitality = 100;
        Becoming.ensureSire(p, r.line);
        const base = r.way === "attacked" ? 5 : r.way === "dying" ? 8 : 7;
        r.humanity = base;
        try { (require_court()).ensure(p); } catch { /* */ }
        Reborn.milestone("You Rise", `You wake starving and ageless. You'll stay ${p.getAgeInYears()} forever. Your sire, ${r.sireName || "a stranger"}, leaves a gift on your pillow: a frightened young man tied to a chair, who says he owes them money.`, Vampire.image, [
            ["Feed gently, then let him go", () => { r.humanity = base + 1; Vampire.state(p).thirst = 20; return `You drank just enough and untied him. He ran. Your sire raised an eyebrow. (Humanity ${Math.round(r.humanity)}, hunger 20.)`; }],
            ["Drink your fill", () => { r.humanity = base - 1; Vampire.state(p).thirst = 0; return `You didn't stop until you were full. He lived, just. The Beast purred. (Humanity ${Math.round(r.humanity)}, hunger 0.)`; }],
            ["Refuse, and go hungry", () => { r.humanity = clamp(base + 2, 0, 9); Vampire.state(p).thirst = 50; attrNow(p, 0, 0, -10); return `You set him free and suffered through the night (−10 sanity). Your sire called it "sentimental". (Humanity ${Math.round(r.humanity)}, hunger 50.)`; }],
        ]);
    },

    // ------------------------------------------------------------------ old saves
    /** Vampires from before v0.35 keep everything and gain the new layers, once. */
    convert(p: any) {
        const r = Reborn.st(p);
        if (r.converted) return;
        r.converted = true;
        const s = Vampire.state(p);
        // the bloodline that fits your powers best
        const counts: Record<string, number> = {};
        for (const id of s.powers ?? []) { const n = TREE.find((x) => x.id === id); if (n) counts[n.discipline] = (counts[n.discipline] ?? 0) + 1; }
        const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
        r.line = (BLOODLINES.find((b) => b.discipline === best) ?? pick(BLOODLINES)).id;
        r.way = r.way ?? "old";
        const sire = Becoming.ensureSire(p, r.line);
        sire.setRelationshipProgress(450);
        r.bloodAgeWeeks = s.vampireWeeks;
        r.humanity = 7;
        r.hunt = Math.round(s.suspicion / 3);
        r.cityWeek = now(p); r.identityWeek = now(p);
        // the ones you turned become your childer
        for (const x of Vampire.turnedLovedOnes(p)) Relationships.meta(x, p).childe = true;
        const partner = Vampire.bondedPartner(p);
        if (partner) Relationships.meta(partner, p).childe = true;
        // the Blood Bank Delivery subscription moves into your blood supply (one place for it)
        let moved = "";
        try { if (Subscriptions.has("bloodBank", p)) { Subscriptions.cancel?.("bloodBank", p); (r as any).bankDeal = true; s.diet = "bags"; moved = " Your Blood Bank Delivery is now your blood supply (Blood Bank Bags)."; } } catch { /* */ }
        const hadCoven = Vampire.coven(p).some((x: any) => x.metAt === "coven");
        r.standing = hadCoven ? 25 : 20;
        try { (require_court()).ensure(p); } catch { /* */ }
        Reborn.milestone("You've Been Reborn", `Being a vampire has changed. You belong to the ${lineOf(r.line).title} bloodline, through ${sire.getFullName()}, the stranger who turned you. You're a ${Reborn.rank(p).title} (${Reborn.bloodYears(p)} years of blood age) with Humanity ${Math.round(r.humanity)}. Your thirst is now Hunger, suspicion is Rumours, and real hunters keep their own score (the Hunt). The sun follows the weather, and your city has a vampire court.${moved} Everything is on Lifepaths › Vampire.`, Vampire.image);
    },
};
// the court is wired at install time (avoids an import loop)
let courtRef: any = null;
export function setCourtRef(c: any) { courtRef = c; }
function require_court() { return courtRef; }

/** Lifepaths › Vampire rows before you're turned (replaces the old two rows). */
export const BECOMING_REBORN: LifeActionDef[] = [
    { id: "seek", title: "Seek the Ancient", image: img("icon_vamp_seek"), cost: 5000, show: (p) => !Vampire.state(p).discovered,
        lock: (p) => Vampire.canBecome(p),
        note: () => `A quest in three steps through occult shops, old libraries and rumours (step ${Reborn.st().seekStep + 1} of 3, a 60% chance each try). At the end you choose your bloodline, and the elders respect you for it.\n`,
        run: (p) => { const t = Becoming.seekStep(p); Vampire.alert("Seek the Ancient", t); } },
    { id: "meet", title: () => `Meet ${Becoming.sire()?.getFirstName() ?? "the Stranger"}`, image: Vampire.image, instant: true,
        show: (p) => Vampire.state(p).discovered && Reborn.st(p).way === "seduced" && Reborn.st(p).meetings < 3,
        lock: (p) => (Reborn.st(p).lastHunt === now(p) ? "Once a week" : Vampire.canBecome(p)),
        note: () => `Your sire-to-be keeps finding you at night (${Reborn.st().meetings} of 3 meetings). After the third, they make their offer.\n`,
        run: (p) => { Reborn.st(p).lastHunt = now(p); Vampire.alert("At Night", Becoming.meet(p)); } },
    ...BLOODLINES.map((b): LifeActionDef => ({
        id: "line-" + b.id, title: `Join the ${b.title}`, image: img(b.image), instant: true,
        show: (p) => Vampire.state(p).discovered && Reborn.st(p).way === "seeking" && !Reborn.st(p).line,
        note: () => `${b.feel}. Gift: ${b.gift} Weakness: ${b.weakness}\n`,
        actionTitle: () => "Choose",
        confirm: () => `Join the ${b.title} bloodline? It shapes your powers and your weakness forever.`,
        run: (p) => Becoming.chooseLine(p, b.id),
    })),
    { id: "bite", title: "Accept the Bite", image: img("icon_vamp_bite"), instant: true, show: (p) => Vampire.state(p).discovered,
        lock: (p) => Becoming.canAccept(p),
        note: () => { const r = Reborn.st(); return `${r.sireName ? `${r.sireName} of the ${lineOf(r.line ?? r.sireLine).title}` : "Your sire"} will turn you. First, your last human night; the turning takes a week.\n`; },
        confirm: () => "You'll never age again, but you'll need blood, the sun will burn you, and you can't have biological children. You can only go back with the Vampiric Cure, and you only get one vampire life. Accept the bite?",
        run: (p) => Becoming.lastNightMenu(p) },
];
void LifeActions;
