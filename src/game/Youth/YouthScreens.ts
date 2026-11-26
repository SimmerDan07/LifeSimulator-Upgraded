// v0.32.0 "Childhood & Teen Years": the rows. Education tab (School Life, After-School Activities, Your Future),
// Leisure tab (Growing Up), Work tab (Part-Time Jobs), Profile tab (Growing Up + the Yearbook screen),
// Lifepaths › Celebrity Life (Child Star, under 14). Rules live in Youth.ts.
import { ArrayList, BigInteger, R } from "../runtime";
import { Modifiers } from "../Managers/Modifiers";
import { GameStateManager } from "../Managers/GameStateManager";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { LifeActionDef, LifeActions } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Relationships } from "../Social/Relationships";
import { Youth, money, attr, earn, pay, cashOf, parentsOf, Parent, are, bondParents } from "./Youth";
import { ACTIVITIES, ACT_LEVELS, ActDef, CROWDS, PART_JOBS, PartJobDef, SUBJECTS, UPBRINGING, TRAIT_POINTS, MAX_TRAITS, SUBJECT_HEAD_START, HEAD_START_SHARE } from "./YouthData";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const note = (id: string, s: string) => new SingleLabelCellViewModel(id, new TextLabelViewModel(s, null, false, false, null, null, 62, null));
const button = (image: any, title: string, body: string, label: string, go: () => void, enabled = true) =>
    new ActionCellSingleViewModel(image, title, text(body), new ButtonViewModel(label, null, enabled, false, !enabled, false, false, { invoke: () => { go(); return null; } }), null, null);
const navigate = (key: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null);
const roll = (x: number) => Math.random() < x;
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const y = (p: any = player()) => Youth.state(p);
const s = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const once = (id: string) => (p: any) => (Youth.doneThisWeek(id, p) ? "Done this week" : null);
const say = (title: string, msg: string, image?: any) => Youth.say(title, msg, image);

// ================================================================== Education › School Life
const SCHOOL: LifeActionDef[] = [
    { id: "homework", title: "Do Your Homework", image: "icon_youth_homework", instant: true, mods: [0, -1, 0],
        show: (p) => Youth.inSchool(p), lock: once("homework"),
        note: () => "+2.5 grades. Once a week, after school (no week passes).\n",
        run: (p) => { Youth.markDone("homework", p); Youth.grades(p, 2.5); const f = y(p).focus; if (f) y(p).subjects[f] = (y(p).subjects[f] ?? 0) + 1; Youth.addPoints(p, { bookworm: 2 }); } },
    { id: "teacher", title: "Ask a Teacher for Help", image: "icon_youth_teacher", instant: true,
        show: (p) => Youth.inSchool(p), lock: (p) => (Youth.weeksSince(y(p).done.teacher ?? -999, p) < 4 ? `Again in ${4 - Youth.weeksSince(y(p).done.teacher ?? -999, p)} weeks` : null),
        note: () => (y().grades < 70 ? "+5 grades (they love a student who asks). Every 4 weeks.\n" : "+2 grades. Every 4 weeks.\n"),
        run: (p) => { Youth.markDone("teacher", p); const n = y(p).grades < 70 ? 5 : 2; Youth.grades(p, n); Youth.addPoints(p, { bookworm: 1, golden: 1 }); say("Extra Help", `Your teacher stayed after class to go through it with you. (+${n} grades)`, "icon_youth_teacher"); } },
    { id: "cram", title: "Cram for a Big Test", image: "icon_youth_cram", mods: [0, -2, -4],
        show: (p) => Youth.inSchool(p) && p.getAgeInYears() >= 10,
        note: () => "A week of nothing but studying: +6 grades.\n",
        run: (p) => { Youth.grades(p, 6); Youth.addPoints(p, { bookworm: 3, hardWorker: 1 }); say("Crammed", pick(["Flashcards on the bathroom mirror. You know this stuff cold now. (+6 grades)", "You can recite the periodic table backwards. (+6 grades)"]), "icon_youth_cram"); } },
    { id: "skip", title: "Skip School", image: "icon_youth_skip", mods: [0, 6, 2],
        show: (p) => Youth.inSchool(p) && p.getAgeInYears() >= 8,
        note: () => `A week off: −4 grades. ${Math.round(Youth.catchChance() * 100)}% chance ${parentsOf(player()).length ? "you get caught" : "the school calls"} (detention).\n`,
        run: (p) => {
            Youth.grades(p, -4); Youth.addPoints(p, { troublemaker: 2, rebel: 2 });
            const where = pick(["the arcade", "the beach", "the mall", "the woods behind the school", "your friend's basement"]);
            if (roll(Youth.catchChance(p))) { bondParents(p, -20); say("Busted", `You spent the week at ${where}, until the school called home.` + Youth.detention(p) + Youth.ground(p, "skipping school"), "icon_youth_skip"); }
            else say("Skipped", `A whole week at ${where}. Nobody noticed. (−4 grades)`, "icon_youth_skip");
        } },
    { id: "subject", title: () => { const f = SUBJECTS.find((x) => x.id === y().focus); return f ? `Favourite Subject: ${f.title}` : "Choose a Favourite Subject"; }, image: "icon_youth_subject", instant: true,
        show: (p) => Youth.inSchool(p) && p.getAgeInYears() >= 8, actionTitle: () => (y().focus ? "Change" : "Choose"),
        note: () => {
            const f = Youth.favourite();
            const n = f ? Math.floor(y().subjects[f.id] ?? 0) : 0;
            return `Every week of school adds to it. At ${SUBJECT_HEAD_START}+ by 18, you start a matching college degree ${Math.round(HEAD_START_SHARE * 100)}% done.${f ? ` Your best: ${f.title} (${n}).` : ""}\n`;
        },
        run: (p) => openSubjectMenu(p) },
    { id: "crowd", title: () => { const c = Youth.crowd(y().crowd); return c ? `Hang Out with ${c.title}` : "Hang Out at Lunch"; }, image: () => Youth.crowd(y().crowd)?.image ?? "icon_youth_crowd", instant: true,
        show: (p) => p.getAgeInYears() >= Youth.crowdAge,
        lock: (p) => Youth.groundLock(p) ?? once("crowd")(p),
        note: () => { const c = Youth.crowd(y().crowd); return c ? `${c.blurb}\n+${c.hang.rep} reputation. Once a week.\n` : "No crowd: you float between tables. +2 reputation. Once a week.\n"; },
        run: (p) => say(Youth.crowd(y(p).crowd)?.title ?? "Lunchtime", Youth.hangOut(p), Youth.crowd(y(p).crowd)?.image ?? "icon_youth_crowd") },
    { id: "findCrowd", title: () => (y().crowd ? "Change Your Crowd" : "Find Your Crowd"), image: "icon_youth_crowd", instant: true, actionTitle: () => "Choose",
        show: (p) => p.getAgeInYears() >= Youth.crowdAge,
        note: () => "Jocks, Brains, Artsy Kids, the Popular Crowd or Rebels. Each one shapes who you become.\n",
        run: (p) => openCrowdMenu(p) },
    { id: "bestFriend", title: () => { const f = Youth.bestFriend(); return f ? `Hang Out with ${f.getFirstName()} (Best Friend)` : "Make a Friend at School"; }, image: "icon_youth_bestfriend", instant: true,
        show: (p) => p.getAgeInYears() >= 5,
        lock: (p) => (Youth.bestFriend(p) ? once("best")(p) : (Youth.weeksSince(y(p).done.makeFriend ?? -999, p) < 4 ? "Try again in a few weeks" : Relationships.friends(p).length >= Relationships.maxFriends ? "You have all the friends you can handle" : null)),
        note: () => (Youth.bestFriend() ? "+25 relationship, +4 happiness. Once a week." + ((Relationships.friends(player()).length > 1) ? " Tap Change on the Love tab friend screen to pick another best friend." : "") + "\n" : "Say hi to someone new at recess. Every 4 weeks.\n"),
        run: (p) => {
            if (Youth.bestFriend(p)) { say("Best Friends", Youth.hangBest(p), "icon_youth_bestfriend"); return; }
            Youth.markDone("makeFriend", p);
            const f = Relationships.makeFriend("school", p);
            if (f) { Youth.setBest(f, p); Youth.addPoints(p, { social: 2 }); say("A New Friend", `You traded snacks with ${f.getFirstName()} at lunch. Best friends now, obviously.`, "icon_youth_bestfriend"); }
        } },
];

function openSubjectMenu(p: any) {
    const opts = SUBJECTS.slice(0, 8).map((sub) => [sub.title, () => { y(p).focus = sub.id; Youth.book(p, `Fell in love with ${sub.title}.`); return `${sub.title} it is. Every week of school counts towards it now.`; }] as [string, () => string]);
    opts.push(["Business", () => { y(p).focus = "business"; return "Business it is. Every week of school counts towards it now."; }]);
    opts.push(["Never mind", () => ""]);
    Youth.menu("Favourite Subject", "Which class do you love most?", "icon_youth_subject", opts);
}
function openCrowdMenu(p: any) {
    const opts: [string, () => string][] = [];
    for (const c of CROWDS) {
        const lock = Youth.crowdBlock(c, p);
        if (lock || c.id === y(p).crowd) continue;
        opts.push([c.title, () => { Youth.joinCrowd(c.id, p); return `You're one of ${c.title} now. ${c.blurb}`; }]);
    }
    const locked = CROWDS.filter((c) => Youth.crowdBlock(c, p) != null).map((c) => `${c.title}: ${Youth.crowdBlock(c, p)}`);
    if (y(p).crowd) opts.push(["Float between groups", () => { Youth.joinCrowd(null, p); return "You don't belong to one table any more. You get along with all of them."; }]);
    opts.push(["Never mind", () => ""]);
    Youth.menu("Find Your Crowd", `Where do you sit at lunch?${locked.length ? `\n\nNot yet: ${locked.join("; ")}.` : ""}`, "icon_youth_crowd", opts);
}

// ================================================================== Education › After-School Activities
class ActCell {
    constructor(public d: ActDef) {}
    st() { return Youth.peek()?.acts?.[this.d.id] ?? null; }
    getTitle(): string { const a = this.st(); return a && a.xp > 0 ? `${this.d.title} · ${Youth.levelName(this.d, a.xp)} ${Math.floor(a.xp)}` : this.d.title; }
    getImageId(): any { return this.d.image; }
    getCost(): any { return BigInteger.valueOf(0); }
    getModifiers(): any { const m = this.d.mods; return new Modifiers(m[0], m[1], m[2]); }
    getActionTitle(): string { return "Practise"; }
    getAdditionalDescription(): string {
        const a = this.st(); const xp = a?.xp ?? 0;
        const l = Youth.levelOf(xp), nextMin = ACT_LEVELS[l + 1]?.min;
        const next = nextMin != null ? `Next: ${l + 1 === 4 ? this.d.top : ACT_LEVELS[l + 1].name} at ${nextMin}.` : "The very top.";
        const rec = a && a.trophies ? ` ${s(a.trophies, "trophy").replace("trophys", "trophies")}.` : "";
        return `${this.d.blurb}\n${next}${rec} Once a week, after school (no week passes).\n`;
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null { return Youth.practiceBlock(this.d, p); }
    action(p: any): void { Youth.practice(this.d.id, p); }
}
class ShowCell {
    constructor(public d: ActDef) {}
    getTitle(): string { return this.d.show; }
    getImageId(): any { return this.d.image; }
    getCost(): any { return BigInteger.valueOf(0); }
    getModifiers(): any { return new Modifiers(0, 0, 0); }
    getActionTitle(): string { return "Go"; }
    getAdditionalDescription(): string { const a = Youth.peek()?.acts?.[this.d.id]; return `${Math.round(Youth.winChance(a?.xp ?? 0) * 100)}% chance to win a trophy (+5 reputation). Every ${Youth.showEvery} weeks.\n`; }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null { return Youth.showBlock(this.d, p); }
    action(p: any): void { Youth.showOff(this.d.id, p); }
}
const descriptorCell = (o: any) => ActionCellSingleViewModel.INSTANCE.initWithActionDescriptor(o, null);

const FUTURE: LifeActionDef[] = [
    { id: "scholarship", title: "Apply for Scholarships", image: "icon_youth_scholarship", instant: true, show: (p) => p.getAgeInYears() >= 16 && !y(p).graduated,
        lock: (p) => Youth.scholarshipBlock(p),
        note: () => `Grades, trophies, your best activity and being a Leader all count. Apply and you get the full amount at graduation (40% if you don't). Right now: about ${money(Youth.scholarshipValue())}.\n`,
        run: (p) => say("Scholarships", Youth.applyScholarships(p), "icon_youth_scholarship") },
];

// ================================================================== Leisure › Growing Up
const GROWING: LifeActionDef[] = [
    { id: "piggy", title: () => `Piggy Bank: ${money(y().piggy)}${y().piggyOn ? " (saving)" : ""}`, image: "icon_youth_piggy", instant: true,
        show: (p) => Youth.allowance(p) > 0 || y(p).piggy > 0, actionTitle: () => (y().piggyOn ? "Stop Saving" : "Save Half"),
        note: () => `Pocket money: ${money(Youth.allowance())} a week, double the weeks you Help Around the House (Love tab, your parents). ${y().piggyOn ? "Half goes in the piggy bank." : "Tap Save Half to put half of it in the piggy bank."} ${parentsOf(player()).length ? `At 18 it goes into your savings, and ${Parent(player()).toLowerCase()} add${parentsOf(player()).length === 1 ? "s" : ""} 50%.` : "At 18 it goes into your savings."}\n`,
        run: (p) => { y(p).piggyOn = !y(p).piggyOn; } },
    { id: "breakPiggy", title: "Break the Piggy Bank", image: "icon_youth_piggy", instant: true, show: (p) => y(p).piggy > 0 && Youth.isYoung(p),
        confirm: () => "Take the money out now? You'll miss your parents' 50% match at 18.",
        note: () => `${money(y().piggy)} in cash now (no match).\n`, run: (p) => say("Smash!", Youth.breakPiggy(p), "icon_youth_piggy") },
    { id: "raise", title: "Ask for More Pocket Money", image: "icon_youth_raise", instant: true, show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 5,
        lock: (p) => Youth.raiseBlock(p),
        note: () => `${Youth.styleTitle()} parents. Better chances when you're close to them. Every 24 weeks.\n`,
        run: (p) => say("Pocket Money", Youth.askRaise(p), "icon_youth_raise") },
    { id: "phone", title: "Get a Phone", image: "icon_youth_phone", instant: true, show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 10 && !y(p).phone,
        cost: () => (parentsOf(player()).length && Youth.style() !== "strict" && Youth.style() !== "overprotective" ? 0 : 300),
        lock: (p) => ((Youth.style(p) === "strict" || Youth.style(p) === "overprotective") && p.getAgeInYears() < 13 && parentsOf(p).length ? "Your parents say not until you're 13" : null),
        note: () => "Group chats, photos and the Social tab a year early (from 12).\n",
        run: (p) => { y(p).phone = true; attr(p, 0, 8, 0); Youth.book(p, "Got a first phone."); say("Your First Phone", "You set it up in four seconds flat. The group chat already has 300 messages.", "icon_youth_phone"); } },
    { id: "permit", title: "Learner's Permit Test", image: "icon_youth_permit", instant: true, show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 14 && !y(p).permit && !y(p).license,
        lock: (p) => Youth.permitBlock(p), note: () => `The written test: road signs and rules. ${Math.round(Math.min(0.95, 0.55 + y().grades / 250) * 100)}% to pass.\n`,
        run: (p) => say("Learner's Permit", Youth.permitTest(p), "icon_youth_permit") },
    { id: "lessons", title: "Driving Lessons", image: "icon_youth_lessons", mods: [0, 2, -1], show: (p) => Youth.isYoung(p) && y(p).permit && !y(p).license,
        lock: (p) => Youth.lessonsBlock(p), note: () => `${parentsOf(player()).length ? "With a parent in the passenger seat" : "With an instructor"}. Each one helps you pass. (Lessons so far: ${y().lessons})\n`,
        run: (p) => say("Driving Lesson", Youth.lesson(p), "icon_youth_lessons") },
    { id: "drivetest", title: "Driving Test", image: "icon_youth_drivetest", instant: true, show: (p) => Youth.isYoung(p) && y(p).permit && !y(p).license,
        lock: (p) => Youth.testBlock(p), note: () => `${Math.round(Youth.testChance() * 100)}% to pass. Once a week.\n`,
        run: (p) => say("Driving Test", Youth.drivingTest(p), "icon_youth_drivetest") },
    { id: "sneak", title: "Sneak Out at Night", image: "icon_youth_sneak", instant: true, mods: [0, 8, 0], show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 13 && parentsOf(p).length > 0,
        lock: once("sneak"),
        note: () => `Meet your friends after dark: +3 reputation. ${Math.round(Youth.catchChance() * 100)}% chance you get caught (grounded).${Youth.groundedWeeks() ? " Sneaking out while grounded is riskier." : ""}\n`,
        run: (p) => {
            Youth.markDone("sneak", p); Youth.rep(p, 3); Youth.addPoints(p, { rebel: 3 });
            if (roll(Youth.catchChance(p))) { bondParents(p, -30); say("Caught!", `${Parent(p)} ${are(p)} standing in the kitchen with the lights on.` + Youth.ground(p, "sneaking out", Youth.groundedWeeks(p) ? Youth.groundedWeeks(p) + 2 : undefined), "icon_youth_sneak"); }
            else say("Out All Night", pick(["Stargazing on the golf course with your friends.", "A bonfire at the beach. You were home before sunrise.", "Pancakes at a 24-hour diner at 2 a.m."]) + " (+3 reputation)", "icon_youth_sneak");
        } },
    { id: "dance", title: "Go to the School Dance", image: "icon_youth_dance_night", instant: true, show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 11 && Youth.schoolShown(p),
        lock: (p) => Youth.groundLock(p) ?? (Youth.weeksSince(y(p).lastDance, p) < 12 ? `The next dance is in ${12 - Youth.weeksSince(y(p).lastDance, p)} weeks` : null),
        note: () => "Streamers, a DJ and a gym that smells like popcorn. Every 12 weeks.\n",
        run: (p) => openDanceMenu(p) },
    { id: "party", title: "Throw a Party", image: "icon_youth_party", cost: 100, show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 14,
        lock: (p) => Youth.groundLock(p),
        note: () => `+10 reputation. ${Youth.style() === "relaxed" ? "Your parents are cool with it." : `${Math.round((Youth.style() === "none" ? 0.15 : 0.4) * 100)}% chance it gets out of hand.`}\n`,
        run: (p) => {
            const yy = y(p); yy.parties++;
            Youth.rep(p, 10); Youth.addPoints(p, { social: 4 }); attr(p, 0, 8, -1);
            for (let i = 0; i < 2; i++) if (roll(0.5)) Relationships.makeFriend("school", p);
            if (Youth.style(p) !== "relaxed" && roll(Youth.style(p) === "none" ? 0.15 : 0.4)) { bondParents(p, -30); say("Party Busted", "Someone posted it online, the neighbours called, and your parents came home early." + Youth.ground(p, "a party", 4) + " (+10 reputation, though)", "icon_youth_party"); }
            else { if (yy.parties === 1) Youth.book(p, "Threw a legendary party."); say("What a Party", "The whole grade showed up. People are still talking about it. (+10 reputation)", "icon_youth_party"); }
        } },
];
function openDanceMenu(p: any) {
    y(p).lastDance = Youth.now(p);
    y(p).dances++;
    Youth.menu("The School Dance", "The dance is on Friday. Who are you going with?", "icon_youth_dance_night", [
        ["Your friends", () => { attr(p, 0, 8, 3); Youth.rep(p, 3); Relationships.friends(p).forEach((f: any) => f.setRelationshipProgress(Math.min(1000, f.getRelationshipProgress() + 15))); Youth.addPoints(p, { social: 2 }); return "You danced in a big circle all night. Best night of the year. (+3 reputation)"; }],
        ["Ask someone you like", () => { Youth.addPoints(p, { social: 1 }); if (roll(0.55)) { attr(p, 0, 12, 2); Youth.rep(p, 4); if (y(p).dances <= 3) Youth.book(p, "Went to a school dance with a crush."); return "They said yes! One slow dance, a lot of nervous laughing, and a story for later. (+4 reputation)"; } attr(p, 0, -5, -1); Youth.addPoints(p, { resilient: 2 }); return "They already had a date. You went with your friends instead, and it was still fun."; }],
        ["Stay home", () => { attr(p, 0, 0, 3); return "You watched a movie instead. No regrets."; }],
    ]);
}

const TROUBLE: LifeActionDef[] = [
    { id: "prank", title: "Prank the School", image: "icon_youth_prank", instant: true, mods: [0, 6, 0], show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 11,
        lock: once("prank"), note: () => "+6 reputation. 30% chance it's traced back to you (detention).\n",
        run: (p) => {
            Youth.markDone("prank", p); Youth.rep(p, 6); Youth.addPoints(p, { troublemaker: 3, creative: 1 });
            const what = pick(["Every chair in the cafeteria is now upside down.", "The principal's car is wrapped in sticky notes.", "Somebody's goat is in the library. (It's fine. It's a very calm goat.)"]);
            say("The Prank", what + (roll(0.3) ? " The cameras saw everything." + Youth.detention(p) : " Nobody knows it was you. (+6 reputation)"), "icon_youth_prank");
        } },
    { id: "graffiti", title: "Graffiti", image: "icon_youth_graffiti", instant: true, mods: [0, 5, 0], show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 13,
        lock: once("graffiti"), note: () => "+4 reputation. 25% chance the police catch you (a juvenile record, sealed at 18).\n",
        run: (p) => {
            Youth.markDone("graffiti", p); Youth.rep(p, 4); Youth.addPoints(p, { troublemaker: 2, creative: 2, rebel: 1 });
            if (roll(0.25)) { Youth.addRecord(p, "Vandalism"); bondParents(p, -40); say("Caught Red-Handed", "A police car pulled up while you were still holding the spray can. Community service, and a call home." + Youth.ground(p, "vandalism", 6), "icon_youth_graffiti"); }
            else say("Street Art", "Your tag is on the bridge downtown. People actually like it. (+4 reputation)", "icon_youth_graffiti");
        } },
    { id: "shoplift", title: "Shoplift Candy", image: "icon_youth_shoplift", instant: true, mods: [0, 3, -2], show: (p) => Youth.isYoung(p) && p.getAgeInYears() >= 10,
        lock: once("shoplift"), note: () => "A thrill, a candy bar. 30% chance the store catches you (a juvenile record, sealed at 18).\n",
        run: (p) => {
            Youth.markDone("shoplift", p); Youth.addPoints(p, { troublemaker: 3 });
            if (roll(0.3)) { Youth.addRecord(p, "Shoplifting"); bondParents(p, -40); say("Caught", "The security guard was waiting at the door. The police drove you home." + Youth.ground(p, "shoplifting", 5), "icon_youth_shoplift"); }
            else say("Got Away With It", "A candy bar in your pocket and your heart pounding. It doesn't taste as good as you thought.", "icon_youth_shoplift");
        } },
];

// ================================================================== Lifepaths › Celebrity Life: Child Star (6–13)
const star = (p: any) => { const yy = y(p); return yy.star ?? (yy.star = { gigs: 0, trust: 0, agent: false, burnout: 0, tv: 0, lastGig: -999 }); };
const gigPay = (p: any, base: number) => {
    const n = Math.round(base * (0.7 + Math.random() * 0.6) * (star(p).agent ? 1.3 : 1));
    const trust = Math.round(n * 0.85);
    star(p).trust += trust;
    earn(p, (n - trust) * (star(p).agent ? 0.9 : 1));
    return n;
};
const CHILD_STAR: LifeActionDef[] = [
    { id: "starAgent", title: "Sign with a Child Talent Agent", image: "icon_star_agent", instant: true, show: (p) => !star(p).agent,
        note: () => "Better auditions and 30% more pay (they keep 10% of what reaches you).\n",
        run: (p) => { star(p).agent = true; say("Your Agent", "Her name is Bev, she calls everyone \"sweetie\" and she's already booked you two auditions.", "icon_star_agent"); } },
    { id: "starModel", title: "Kids' Modelling Shoot", image: "icon_star_model", mods: [0, 1, -1],
        note: () => `Catalogue photos: about ${money(800)} and a few fans. Sure thing.\n`,
        run: (p) => { const st = star(p); st.burnout = Math.min(100, st.burnout + 5); st.gigs++; const n = gigPay(p, 800); const f = rnd(500, 3000); Celebrity.addFans(p, f); say("Say Cheese", `Six outfits, a hundred photos: ${money(n)} and ${Celebrity.fansText(f)} fans.`, "icon_star_model"); } },
    { id: "starTV", title: "Kids' TV Show", image: "icon_star_tv", mods: [0, 3, -3], show: (p) => p.getAgeInYears() >= 8,
        lock: (p) => (star(p).gigs >= 3 || (y(p).acts.drama?.xp ?? 0) >= 45 ? null : "Needs 3 gigs or Drama Club at Great"),
        note: () => `A season on a kids' show: about ${money(25000)}, lots of fans, and a lot of hard work.\n`,
        run: (p) => {
            const st = star(p); st.burnout = Math.min(100, st.burnout + 25); st.tv++; st.gigs++;
            const n = gigPay(p, 25000), fans = rnd(50000, 250000);
            Celebrity.addFans(p, fans); Celebrity.train(p, "acting", 6); Youth.rep(p, 10); Youth.addPoints(p, { creative: 3, hardWorker: 2 });
            if (st.tv === 1) Youth.book(p, "Starred in a kids' TV show.");
            say("On TV!", `A whole season of ${pick(["\"Space Pups\"", "\"The Lemonade Gang\"", "\"Mystery at Maple School\"", "\"Super Science Squad\""])}: ${money(n)} (most of it in your trust fund) and ${Celebrity.fansText(fans)} fans. (+10 reputation)`, "icon_star_tv");
        } },
    { id: "starBreak", title: "Take a Break from Fame", image: "icon_star_break", mods: [0, 6, 6], show: (p) => star(p).burnout > 0,
        note: () => `Burnout ${Math.round(star(player()).burnout)}/100 (from 70 it costs happiness and sanity every week). A week of being a normal kid: −30.\n`,
        run: (p) => { const st = star(p); st.burnout = Math.max(0, st.burnout - 30); bondParents(p, 15); } },
];
/** TV Commercial Audition (Young Talent, CelebrityWorld) gets these from Youth: a better chance with Drama Club or an agent, the trust fund. */
export const childStarBonus = (p: any) => ((y(p).acts.drama?.xp ?? 0) / 200 + ((y(p).star?.agent) ? 0.15 : 0));
export const childStarGig = (p: any, n: number) => {
    if (!Youth.isYoung(p)) return;
    const st = star(p); st.gigs++; st.lastGig = Youth.now(p); st.burnout = Math.min(100, st.burnout + 8);
    const trust = Math.round(n * 0.85);
    pay(p, trust); st.trust += trust;
    Youth.rep(p, 4); Youth.addPoints(p, { creative: 2, social: 1 });
    if (st.gigs === 1) Youth.book(p, "Booked a first commercial.");
};

// ================================================================== Work › Part-Time Jobs
class JobCell {
    constructor(public d: PartJobDef) {}
    getTitle(): string { return this.d.title; }
    getImageId(): any { return this.d.image; }
    getCost(): any { return BigInteger.valueOf(0); }
    getModifiers(): any { const m = this.d.mods; return new Modifiers(m[0], m[1], m[2]); }
    getActionTitle(): string { return y().job?.id === this.d.id ? "Quit" : y().job ? "Switch" : "Apply"; }
    getAdditionalDescription(): string {
        const j = y().job;
        if (j?.id === this.d.id) return `Your job: ${money(this.d.pay)} a week. ${s(j.weeks, "week")} so far, ${money(j.earned)} earned.\n`;
        return `${this.d.blurb}\n${money(this.d.pay)} a week, after school and weekends (no weeks taken). Every week:\n`;
    }
    getAgeRange(): any { return null; }
    getRequiredItem(): any { return null; }
    overrideCost(_m: any): any { return null; }
    overrideImageId(_m: any): any { return null; }
    overrideTitle(_m: any): any { return null; }
    requirementNotMetString(p: any): string | null { return Youth.jobBlock(this.d, p); }
    action(p: any): void {
        if (y(p).job?.id === this.d.id) { Youth.quitJob(p); return; }
        say("Hired!", Youth.takeJob(this.d.id, p), this.d.image);
    }
}

// ================================================================== the screens
export const YouthScreens = {
    /** Education tab, above the schools. */
    education(p: any = player()): any[] {
        const out: any[] = [];
        if (!Youth.schoolShown(p)) return out;
        const yy = y(p);
        out.push(new HeaderTitleViewModel("School Life"));
        if (Youth.inSchool(p)) {
            out.push(new MeterViewModel("Grades", yy.grades, 100, yy.grades >= 80 ? "green" : yy.grades >= 65 ? "gold" : "red",
                `Study at school every week to keep them up (a week without school lets them slide). Report card every ${Youth.reportEvery} weeks.`, `${Youth.letter(yy.grades)} · ${Math.round(yy.grades)}`));
        }
        out.push(new MeterViewModel("Reputation", yy.rep, 100, "purple", null, `${Youth.repName(yy.rep)} · ${Math.round(yy.rep)}`));
        const bf = Youth.bestFriend(p);
        const facts = [
            p.getAgeInYears() >= Youth.crowdAge ? `Crowd: ${Youth.crowd(yy.crowd)?.title ?? "none (you float between groups)"}` : null,
            bf ? `Best friend: ${bf.getFirstName()}` : null,
            Youth.favourite(p) ? `Best subject: ${Youth.favourite(p)!.title}` : null,
            `Parents: ${Youth.styleTitle(p)}`,
            yy.grounded > 0 ? `Grounded for ${s(yy.grounded, "more week")} (${yy.groundedFor ?? "you know why"})` : null,
            yy.detentions ? `Detentions: ${yy.detentions}${yy.suspensions ? `, suspensions: ${yy.suspensions}` : ""}` : null,
        ].filter(Boolean);
        out.push(note("YouthFacts", facts.join(" · ")));
        for (const c of LifeActions.cells(SCHOOL, p)) out.push(c);
        // after-school activities
        if (p.getAgeInYears() >= 5) {
            out.push(new HeaderTitleViewModel(`After-School Activities · ${Youth.joined(p).length}/${Youth.maxActivities}`));
            for (const d of Youth.joined(p)) {
                out.push(descriptorCell(new ActCell(d)));
                if ((yy.acts[d.id]?.xp ?? 0) >= ACT_LEVELS[1].min) out.push(descriptorCell(new ShowCell(d)));
            }
            out.push(button("icon_youth_school", Youth.joined(p).length ? "Browse Activities" : "Join an Activity",
                `${ACTIVITIES.filter((d) => p.getAgeInYears() >= d.minAge).length} sports, music, arts and clubs. Up to ${Youth.maxActivities} at once; practise each one once a week.`, "Open", () => navigate("youth-activities")));
        }
        if (p.getAgeInYears() >= 16) { out.push(new HeaderTitleViewModel("Your Future")); for (const c of LifeActions.cells(FUTURE, p)) out.push(c); }
        return out;
    },
    /** Lifepaths screen "youth-activities": every activity with Join/Quit. */
    activitiesScreen(p: any = player()): any[] {
        const out: any[] = [];
        const kinds: [string, string][] = [["sport", "Sports"], ["music", "Music"], ["art", "Arts"], ["brain", "Brains"], ["social", "Clubs"]];
        out.push(note("ActNote", `Up to ${Youth.maxActivities} at once. Practise each one once a week (after school, no week passes). Your parents pay. Skills carry into hobbies and Celebrity Life.`));
        for (const [k, title] of kinds) {
            out.push(new HeaderTitleViewModel(title));
            for (const d of ACTIVITIES.filter((a) => a.kind === k)) {
                const a = Youth.peek(p)?.acts?.[d.id];
                const joined = !!a?.joined;
                const lock = joined ? null : Youth.joinBlock(d, p);
                const lvl = a && a.xp > 0 ? ` · ${Youth.levelName(d, a.xp)} ${Math.floor(a.xp)}` : "";
                out.push(button(d.image, d.title + lvl, `${d.blurb}${lock ? `\n${lock}` : ""}`, joined ? "Quit" : "Join",
                    () => { if (joined) Youth.quit(d.id, p); else Youth.join(d.id, p); Utils.INSTANCE.reloadGenericList(GenericListType.lifepath); }, joined || lock == null));
            }
        }
        return out;
    },
    /** Leisure tab: Growing Up (5–17). */
    leisure(p: any = player()): any[] {
        const out: any[] = [];
        if (!Youth.isYoung(p) || p.getAgeInYears() < 5) return out;
        out.push(new HeaderTitleViewModel("Growing Up"));
        if (Youth.groundedWeeks(p) > 0) out.push(info("icon_youth_grounded", `Grounded: ${s(Youth.groundedWeeks(p), "week")} left`, `For ${y(p).groundedFor ?? "what you did"}. No hanging out with your crowd, parties or dances until then.`));
        for (const c of LifeActions.cells(GROWING, p)) out.push(c);
        const trouble = LifeActions.cells(TROUBLE, p);
        if (trouble.length) { out.push(new HeaderTitleViewModel("Trouble")); for (const c of trouble) out.push(c); }
        return out;
    },
    /** Work tab: Part-Time Jobs (12–17). */
    work(p: any = player()): any[] {
        const out: any[] = [];
        if (!Youth.isYoung(p) || p.getAgeInYears() < 12) return out;
        out.push(new HeaderTitleViewModel("Part-Time Jobs"));
        out.push(note("PJobNote", "One at a time, paid every week. They don't take your weeks, but a little homework time goes (unless you're a Hard Worker). Six months or more counts as experience at your first real job."));
        for (const d of PART_JOBS) out.push(descriptorCell(new JobCell(d)));
        return out;
    },
    /** Profile tab: Growing Up (anyone with a childhood on record). */
    profile(p: any = player()): any[] {
        const out: any[] = [];
        const yy = Youth.peek(p);
        if (yy == null || (!Youth.isYoung(p) && !yy.traits.length && !yy.yearbook.length)) return out;
        out.push(new HeaderTitleViewModel("Growing Up"));
        const traits = yy.traits.map((t) => Youth.trait(t).title);
        const lines = [
            traits.length ? `Upbringing: ${traits.join(", ")}` : Youth.isYoung(p) ? `No upbringing traits yet: they come from what you do (${TRAIT_POINTS} points each, up to ${MAX_TRAITS}).` : null,
            yy.honors ? `High school: ${yy.honors} (${Youth.letter(yy.grades)})` : Youth.isYoung(p) && Youth.inSchool(p) ? `Grades: ${Youth.letter(yy.grades)}` : null,
            Youth.trophies(p) ? `${Youth.trophies(p)} ${Youth.trophies(p) === 1 ? "trophy" : "trophies"}` : null,
        ].filter(Boolean).join("\n");
        out.push(button("icon_youth_yearbook", "Yearbook", lines || "Your childhood, page by page.", "Open", () => navigate("youth-yearbook")));
        return out;
    },
    /** Lifepaths screen "youth-yearbook". */
    yearbook(p: any = player()): any[] {
        const out: any[] = [];
        const yy = Youth.state(p);
        out.push(new HeaderTitleViewModel("Upbringing"));
        const order = UPBRINGING.slice().sort((a, b) => (yy.traits.includes(b.id) ? 1000 : yy.points[b.id] ?? 0) - (yy.traits.includes(a.id) ? 1000 : yy.points[a.id] ?? 0));
        for (const t of order) {
            const has = yy.traits.includes(t.id);
            const pts = Math.floor(yy.points[t.id] ?? 0);
            if (!has && (pts === 0 || yy.grown)) continue;
            out.push(info(t.image, has ? t.title : `${t.title} · ${Math.min(pts, TRAIT_POINTS)}/${TRAIT_POINTS}`, `${has ? t.effect : `${t.how}`}`));
        }
        if (!yy.traits.length && Object.values(yy.points).every((v) => !v)) out.push(note("NoTraits", "Nothing yet. Traits come from what you do: homework, sports, clubs, friends, trouble, chores, jobs."));
        out.push(new HeaderTitleViewModel("School"));
        const best = Youth.bestActivity(p);
        out.push(note("YbSchool", [
            yy.honors ? `Graduated: ${yy.honors}` : `Grades now: ${Youth.letter(yy.grades)}`,
            yy.reports.length ? `Report cards: ${yy.reports.slice(-12).join(" ")}` : null,
            yy.honorRolls ? `Honor roll ${s(yy.honorRolls, "time")}` : null,
            `Reputation: ${Youth.repName(yy.rep)}`,
            best ? `Best activity: ${best.d.title} (${Youth.levelName(best.d, best.a.xp)})` : null,
            Youth.trophies(p) ? `Trophies: ${Youth.trophies(p)}` : null,
            yy.scholarship ? `Scholarships: ${money(yy.scholarship)}` : null,
            yy.jobWeeks ? `Part-time work: ${s(yy.jobWeeks, "week")}, ${money(yy.jobEarned)} earned` : null,
            yy.detentions ? `Detentions: ${yy.detentions}` : null,
            yy.record.length ? `Juvenile record: ${yy.record.join(", ")}${yy.grown ? " (sealed)" : ""}` : null,
        ].filter(Boolean).join("\n")));
        out.push(new HeaderTitleViewModel("Memories"));
        const entries = yy.yearbook.map((e, i) => ({ ...e, i })).sort((a, b) => b.age - a.age || b.i - a.i);
        if (!entries.length) out.push(note("YbEmpty", "The pages are still blank."));
        let lastAge = -1, buf: string[] = [];
        const flush = () => { if (buf.length) out.push(note("Yb" + lastAge, `${lastAge > 0 ? `Age ${lastAge}` : "Before"}\n• ${buf.join("\n• ")}`)); buf = []; };
        for (const e of entries) { if (e.age !== lastAge) { flush(); lastAge = e.age; } buf.push(e.text); }
        flush();
        return out;
    },
    /** Lifepaths › Celebrity Life, under 14: Child Star. */
    childStar(p: any = player()): any[] {
        const out: any[] = [];
        const age = p.getAgeInYears();
        if (age < 6 || age >= 14) return out;
        const st = Youth.peek(p)?.star;
        out.push(info("icon_star_audition", st?.gigs ? `Child star · ${s(st.gigs, "gig")}` : "Child Star",
            `Commercials, modelling and kids' TV until you're old enough for the fame careers (14). Fans carry over. 85% of your pay waits in a trust fund until 18${st?.trust ? `: ${money(st.trust)} so far` : ""}. An agent and Drama Club help you book the commercials below.`));
        if (st && st.burnout > 0) out.push(new MeterViewModel("Burnout", st.burnout, 100, "red", st.burnout >= 70 ? "Burnt out: −2 happiness, −2 sanity a week. Take a break." : "From 70 it costs happiness and sanity every week."));
        for (const c of LifeActions.cells(CHILD_STAR, p)) out.push(c);
        return out;
    },
    /** For tests. */
    defs: { SCHOOL, FUTURE, GROWING, TROUBLE, CHILD_STAR },
};
void cashOf; void ArrayList; void R;
