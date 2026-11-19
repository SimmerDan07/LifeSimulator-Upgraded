// Life Moments (v0.25.0): small stories with a choice, so weeks aren't all the same.
//
// After a week ends there's a 12% chance of one (never two within 3 weeks, and the same moment not again for 2 years).
// Each one fits a stage of life (child 5–12, teen 13–17, adult, senior 65+) and sometimes your situation (a job, a
// partner, kids, parents, friends, money, being famous, being a vampire). You pick what to do; the result shows next.
// Moments never happen in jail, while a vampire lies collapsed, or once the life is over.
// State: Player.moments = { last, seen: {id: week}, pending: [{week, amount, name}] } (undefined in older saves).
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { ArrayList } from "../runtime";
import { Modifiers } from "./Modifiers";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Relationships } from "../Social/Relationships";
import { Hobbies } from "./Hobbies";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Vampire } from "../Lifepaths/Vampire";

type Opt = [string, () => string];
export interface Moment {
    id: string;
    min: number; max: number;
    when?: (p: any) => boolean;
    weight?: number;
    title: string;
    image: any;
    /** Builds the text and the options (so they can name people and amounts). */
    make: (p: any) => { text: string; options: Opt[] } | null;
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const roll = (x: number) => Math.random() < x;
const pickOne = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const pay = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.directSpend, null, null, 12, null);
const earn = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.workIncome, null, null, 12, null);
const bond = (x: any, n: number) => { if (x != null) x.setRelationshipProgress(Math.max(0, Math.min(1000, x.getRelationshipProgress() + n))); };
const alive = (x: any) => x != null && (x.getIsAlive?.() ?? true);
const parents = (p: any): any[] => { try { return (Array.from(p.getFamilyState().getParents() as any) as any[]).filter(alive); } catch { return []; } };
const kids = (p: any, lo = 0, hi = 200): any[] => { try { return (Array.from(p.getFamilyState().getChildren() as any) as any[]).filter((k) => alive(k) && k.getAgeInYears() >= lo && k.getAgeInYears() <= hi); } catch { return []; } };
const partner = (p: any): any => { try { const x = p.getFamilyState().getPartner(); return alive(x) ? x : null; } catch { return null; } };
const friends = (p: any): any[] => { try { return Relationships.friends(p).filter(alive); } catch { return []; } };
const job = (p: any): any => { try { return p.getJobState().getCurrentJobState(); } catch { return null; } };
const nonCelebJob = (p: any) => { const j = job(p); return j != null && !Celebrity.isCelebJob(j.getType()); };
const progress = (p: any, n: number) => { const j = job(p); if (j != null) j.progress = Math.max(0, (j.progress ?? 0) + n); };
const parentWord = (p: any) => { const ps = parents(p); return ps.length >= 2 ? "your parents" : ps.length ? `your ${ps[0].getTitle?.().toLowerCase() ?? "parent"}` : "your guardian"; };
const bondParents = (p: any, n: number) => parents(p).forEach((x) => bond(x, n));
const susp = (p: any, n: number) => { const s = Vampire.peek(p); if (s?.isVampire) s.suspicion = Math.max(0, Math.min(100, s.suspicion + n)); };

export const MOMENTS: Moment[] = [
    // ------------------------------------------------------------------ childhood (5–12)
    { id: "tooth", min: 5, max: 8, title: "A Wobbly Tooth", image: R.drawable.love_play, make: (p) => ({
        text: "Your tooth finally fell out! What do you do with it?",
        options: [
            ["Put it under your pillow", () => { earn(p, 5); attr(p, 0, 6, 0); return "The Tooth Fairy left you $5. Best night ever."; }],
            ["Keep it in a jar", () => { attr(p, 0, 2, 3); return "It's a little weird, but it's yours."; }],
        ] }) },
    { id: "schoolPlay", min: 6, max: 12, title: "The School Play", image: R.drawable.love_play, make: (p) => ({
        text: "Your class is putting on a play and the teacher asks if you want the lead role.",
        options: [
            ["Take the lead", () => {
                if (roll(0.6)) { attr(p, 0, 10, 2); bondParents(p, 25); try { Celebrity.train(p, "acting", 3); } catch { /* ignore */ } return `You nailed it. ${parentWord(p)[0].toUpperCase() + parentWord(p).slice(1)} filmed the whole thing. (+3 acting)`; }
                attr(p, 0, -5, -2); return "You forgot your lines in front of everyone. It'll be funny in ten years.";
            }],
            ["Work backstage", () => { attr(p, 0, 3, 4); return "You ran the lights. Nobody noticed, which means you did it perfectly."; }],
        ] }) },
    { id: "bully", min: 7, max: 13, title: "A Bully", image: R.drawable.angry, make: (p) => ({
        text: "An older kid keeps taking your lunch money.",
        options: [
            ["Stand up to them", () => { if (roll(0.55)) { attr(p, 0, 8, 4); return "You told them to back off, and they did. Huh."; } attr(p, -5, -6, -2); return "It didn't go well. At least it's over."; }],
            ["Tell a teacher", () => { attr(p, 0, 2, 4); return "The teacher handled it. You eat lunch in peace now."; }],
            ["Just hand it over", () => { attr(p, -2, -4, -3); return "Another hungry afternoon."; }],
        ] }) },
    { id: "scienceFair", min: 8, max: 13, title: "Science Fair", image: R.drawable.education_science, make: (p) => ({
        text: "The science fair is next week. What's your project?",
        options: [
            ["A baking-soda volcano", () => { attr(p, 0, 4, 1); return "Classic. It erupted on cue and everyone cheered."; }],
            ["Build a robot", () => { if (roll(0.4)) { attr(p, 0, 12, 3); bondParents(p, 20); return "Your robot won first prize! It mostly drives in circles, but it won."; } attr(p, 0, 1, -2); return "The robot caught fire a little. Honourable mention."; }],
            ["Skip it", () => { attr(p, 0, 1, 0); return "You spent the week playing outside instead."; }],
        ] }) },
    { id: "puppy", min: 6, max: 13, title: "A Stray Puppy", image: R.drawable.pet_dog, make: (p) => ({
        text: "A scruffy puppy followed you home from school.",
        options: [
            ["Sneak it into your room", () => { if (roll(0.5)) { attr(p, 0, 10, 2); return "Three secret days of puppy cuddles. Then a neighbour recognised it and took it home, very grateful."; } bondParents(p, -20); attr(p, 0, -3, 0); return `${parentWord(p)[0].toUpperCase() + parentWord(p).slice(1)} found it within an hour. You're grounded, the puppy went back to its owner.`; }],
            ["Take it to the shelter", () => { attr(p, 0, 3, 5); return "The shelter found its owner the next day. You did the right thing."; }],
        ] }) },
    { id: "sleepover", min: 7, max: 13, title: "A Sleepover", image: R.drawable.childaction_movienight, make: (p) => {
        const f = pickOne(friends(p));
        return { text: f ? `${f.getFirstName()} invited you to a sleepover this weekend.` : "A kid from your class invited you to a sleepover this weekend.",
            options: [
                ["Go", () => { attr(p, 0, 8, 2); if (f) { bond(f, 60); return `Pizza, a scary movie and no sleep at all. You and ${f.getFirstName()} are closer than ever.`; } const nf = Relationships.makeFriend("school", p); return nf ? `Pizza, a scary movie and no sleep at all. ${nf.getFirstName()} is your friend now.` : "Pizza, a scary movie and no sleep at all."; }],
                ["Stay home", () => { attr(p, 0, 0, 3); return "A quiet weekend with your own pillow."; }],
            ] };
    } },
    { id: "spellingBee", min: 8, max: 12, title: "Spelling Bee", image: R.drawable.education_elementaryschool, make: (p) => ({
        text: "You made it into the school spelling bee.",
        options: [
            ["Study all week", () => { if (roll(0.6)) { attr(p, 0, 12, 2); bondParents(p, 20); return "You spelled \"necessary\" correctly and won. (It has one c and two s's.)"; } attr(p, 0, 3, 0); return "Second place. Still pretty great."; }],
            ["Wing it", () => { if (roll(0.25)) { attr(p, 0, 12, 0); return "You won without studying. Don't tell anyone."; } attr(p, 0, -2, 0); return "Out in the first round on \"rhythm\". Who spells it like that?"; }],
        ] }) },

    { id: "lemonade", min: 6, max: 12, title: "Lemonade Stand", image: R.drawable.diet_balanced, make: (p) => ({
        text: "It's the hottest day of the year. Lemonade stand?",
        options: [
            ["Open for business", () => { const n = 10 + Math.floor(Math.random() * 40); earn(p, n); attr(p, 0, 7, 1); return `You sold out by lunchtime and made $${n}. A tycoon is born.`; }],
            ["Drink it all yourself", () => { attr(p, 1, 5, 0); return "Best. Lemonade. Ever."; }],
        ] }) },
    { id: "fieldTrip", min: 6, max: 12, title: "Field Trip", image: R.drawable.love_museum, make: (p) => {
        const where = pickOne(["the zoo", "the aquarium", "the science museum", "a chocolate factory", "a farm"]);
        return { text: `Your class is going on a field trip to ${where}. Your partner for the day is the kid nobody talks to.`,
            options: [
                ["Make friends with them", () => { attr(p, 0, 6, 3); const nf = Relationships.makeFriend("school", p); return nf ? `${nf.getFirstName()} turned out to be hilarious. New best friend?` : "They turned out to be hilarious."; }],
                ["Stick with your usual group", () => { attr(p, 0, 5, 0); friends(p).forEach((f) => bond(f, 15)); return `A great day at ${where} with your friends.`; }],
            ] };
    } },
    { id: "brokenWindow", min: 7, max: 13, title: "The Broken Window", image: R.drawable.angry, make: (p) => ({
        text: "Your ball just went through the neighbour's window. Nobody saw.",
        options: [
            ["Knock and confess", () => { bondParents(p, 15); attr(p, 0, -2, 5); return "The neighbour was so impressed you owned up that they only made you rake their leaves."; }],
            ["Run!", () => { if (roll(0.5)) { attr(p, 0, 2, -4); return "You got away with it. Your stomach hurts every time you walk past their house."; } bondParents(p, -30); attr(p, 0, -6, -2); return `The neighbour had a doorbell camera. ${parentWord(p)[0].toUpperCase() + parentWord(p).slice(1)} paid for the window, and you're paying them back in chores.`; }],
        ] }) },
    { id: "snowDay", min: 5, max: 12, title: "Snow Day!", image: R.drawable.vacation_ski, make: (p) => ({
        text: "School is cancelled. There's a foot of snow outside.",
        options: [
            ["Build the biggest snowman ever", () => { attr(p, 1, 8, 2); return "He's taller than you and has a carrot nose. Legend."; }],
            ["Snowball fight with the whole street", () => { attr(p, 0, 10, 0); friends(p).forEach((f) => bond(f, 10)); return "You were hit 47 times. You hit back 48. Victory."; }],
            ["Stay in with hot chocolate", () => { attr(p, 0, 5, 5); return "Blankets, cartoons and marshmallows."; }],
        ] }) },
    { id: "allowance", min: 8, max: 14, when: (p) => parents(p).length > 0, title: "Saving Up", image: R.drawable.hud_bank, make: (p) => ({
        text: "There's a toy you really want. It costs $60 and you have $20.",
        options: [
            ["Do chores to earn the rest", () => { earn(p, 40); bondParents(p, 20); attr(p, 0, 6, 2); return "Three weeks of dishes later, it's yours. It feels extra good because you earned it."; }],
            ["Beg for it", () => { if (roll(0.3)) { attr(p, 0, 8, 0); return "It worked! This time."; } bondParents(p, -10); attr(p, 0, -4, 0); return "\"Money doesn't grow on trees.\" You've heard that before."; }],
        ] }) },

    // ------------------------------------------------------------------ teens (13–17)
    { id: "houseParty", min: 14, max: 17, title: "A House Party", image: R.drawable.love_nightclub, make: (p) => ({
        text: "Someone's parents are out of town and there's a party tonight.",
        options: [
            ["Go", () => { attr(p, 0, 10, 0); if (roll(0.25)) { bondParents(p, -40); attr(p, 0, -4, 0); return `Great party, until the police showed up and called ${parentWord(p)}. You're grounded for a month.`; } return "Loud music, bad snacks, best night of the year."; }],
            ["Stay home", () => { attr(p, 0, -1, 4); return "You heard it got shut down by the police. Good call."; }],
        ] }) },
    { id: "cheat", min: 13, max: 17, title: "The Test Answers", image: R.drawable.education_highschool, make: (p) => ({
        text: "A friend got hold of the answers for tomorrow's big test.",
        options: [
            ["Use them", () => { if (roll(0.7)) { attr(p, 0, 4, -3); return "Perfect score. It doesn't feel as good as you thought."; } bondParents(p, -30); attr(p, 0, -8, -4); return "The teacher noticed everyone had the same wrong answer on question 7. Detention, and a call home."; }],
            ["Study instead", () => { attr(p, 0, 1, 5); return "You passed on your own. That feels good."; }],
        ] }) },
    { id: "crush", min: 13, max: 17, title: "A Crush", image: R.drawable.love_romantic_dinner, make: (p) => ({
        text: "You can't stop thinking about someone in your class.",
        options: [
            ["Ask them out", () => { if (roll(0.5)) { attr(p, 0, 12, 2); return "They said yes! Ice cream, awkward silence, perfect."; } attr(p, 0, -6, -2); return "They said they \"don't see you that way\". Ouch."; }],
            ["Write a note and never send it", () => { attr(p, 0, 1, 3); return "It's in your drawer forever now."; }],
        ] }) },
    { id: "firstJob", min: 14, max: 17, when: (p) => job(p) == null, title: "A Little Job", image: R.drawable.childaction_visit, make: (p) => {
        const what = pickOne(["mow their lawn", "walk their dog", "babysit their kids"]);
        return { text: `A neighbour offers to pay you $300 to ${what} every weekend this month.`,
            options: [
                ["Take it", () => { earn(p, 300); attr(p, -1, 2, -1); return "$300 earned. Your first real money."; }],
                ["Not now", () => { attr(p, 0, 1, 1); return "Weekends are for sleeping."; }],
            ] };
    } },
    { id: "drivingTest", min: 16, max: 17, title: "Driving Test", image: R.drawable.possession_car, make: (p) => ({
        text: "Your driving test is this week.",
        options: [
            ["Practice every evening", () => { if (roll(0.85)) { attr(p, 0, 10, 2); return "Passed! Freedom has four wheels."; } attr(p, 0, -5, 0); return "You failed on parallel parking. Everyone does."; }],
            ["You'll be fine", () => { if (roll(0.5)) { attr(p, 0, 10, 0); return "Passed! Barely."; } attr(p, 0, -6, -2); return "You ran a stop sign in front of the examiner. Try again next month."; }],
        ] }) },
    { id: "prom", min: 16, max: 18, title: "Prom Night", image: R.drawable.love_marry, make: (p) => ({
        text: "Prom is coming up.",
        options: [
            ["Go with a date ($200)", () => { pay(p, 200); attr(p, 0, 12, 2); return "Corsages, photos, and one slow dance you'll remember forever."; }],
            ["Go with friends", () => { attr(p, 0, 9, 3); friends(p).forEach((f) => bond(f, 30)); return "You danced all night with your friends. Honestly the best way to do it."; }],
            ["Skip it", () => { attr(p, 0, 0, 2); return "You watched movies at home. No regrets. Mostly."; }],
        ] }) },
    { id: "sneakOut", min: 14, max: 17, title: "The Concert", image: R.drawable.vacation_concert, make: (p) => ({
        text: "Your favourite band is playing tonight, but it's a school night.",
        options: [
            ["Sneak out", () => { attr(p, 0, 12, 0); if (roll(0.35)) { bondParents(p, -50); return `Amazing show. ${parentWord(p)[0].toUpperCase() + parentWord(p).slice(1)} were waiting in the kitchen when you got home.`; } return "Amazing show, and you got home without anyone noticing."; }],
            ["Ask permission", () => { if (roll(0.5)) { attr(p, 0, 9, 0); bondParents(p, 15); return "They said yes! On the condition you text when you get there."; } attr(p, 0, -3, 0); return "They said no. There's always the live recording."; }],
        ] }) },

    // ------------------------------------------------------------------ adults
    { id: "wallet", min: 18, max: 120, title: "A Lost Wallet", image: R.drawable.hud_cash, make: (p) => ({
        text: "You found a wallet on the sidewalk with $500 cash and an ID inside.",
        options: [
            ["Return it", () => { attr(p, 0, 3, 6); if (roll(0.35)) { earn(p, 100); return "The owner cried with relief and insisted you take $100."; } return "The owner was so grateful. Good karma."; }],
            ["Keep the cash", () => { earn(p, 500); attr(p, 0, 2, -6); return "$500 richer. You keep thinking about the face on the ID."; }],
        ] }) },
    { id: "friendLoan", min: 20, max: 120, when: (p) => friends(p).length > 0 && cash(p) > 2000, title: "A Friend in Need", image: R.drawable.waving_hand, make: (p) => {
        const f = pickOne(friends(p));
        const n = Math.max(1000, Math.min(20000, Math.round(cash(p) * 0.05 / 500) * 500));
        return { text: `${f.getFirstName()} is behind on rent and asks to borrow ${money(n)}. They promise to pay it back in two months.`,
            options: [
                ["Lend it", () => { pay(p, n); bond(f, 80); LifeMoments.addPending(p, { week: LifeMoments.now(p) + 8, amount: roll(0.7) ? Math.round(n * 1.1) : 0, name: f.getFirstName() }); return `${f.getFirstName()} hugged you. You'll see if it comes back.`; }],
                ["Say no", () => { bond(f, -40); attr(p, 0, -2, 0); return `${f.getFirstName()} said they understand. They don't, really.`; }],
            ] };
    } },
    { id: "rivalOffer", min: 22, max: 64, when: nonCelebJob, title: "A Job Offer", image: R.drawable.tab_briefcase, make: (p) => {
        const bonus = Math.round(Math.max(1000, Number(job(p).getType().pay(job(p).getLevel()).getRandomValue()) * 4) / 100) * 100;
        return { text: `A rival company wants you. They'll pay a ${money(bonus)} signing bonus, but your boss hears about it.`,
            options: [
                ["Use it to ask for a raise", () => { if (roll(0.55)) { earn(p, bonus); progress(p, 3); attr(p, 0, 6, 0); return `Your boss matched it: ${money(bonus)} bonus and a step closer to promotion.`; } progress(p, -2); attr(p, 0, -4, -2); return "Your boss called your bluff. Awkward week at the office."; }],
                ["Stay loyal", () => { progress(p, 2); attr(p, 0, 1, 2); return "Your boss noticed you turned it down. Good things come to the loyal."; }],
            ] };
    } },
    { id: "bossMistake", min: 20, max: 70, when: nonCelebJob, title: "The Boss's Mistake", image: R.drawable.tab_briefcase, make: (p) => ({
        text: "You spot a big mistake in your boss's report, just before it goes to the client.",
        options: [
            ["Tell them privately", () => { progress(p, 2); attr(p, 0, 2, 2); return "They fixed it in time and quietly thanked you. They won't forget it."; }],
            ["Point it out in the meeting", () => { if (roll(0.5)) { progress(p, 4); attr(p, 0, 5, 0); return "The client was impressed you caught it. So was the boss's boss."; } progress(p, -3); attr(p, 0, -4, -3); return "Your boss went red. You're not their favourite any more."; }],
            ["Say nothing", () => { attr(p, 0, 0, -3); return "The client found it. Everyone had a bad week."; }],
        ] }) },
    { id: "creditStolen", min: 20, max: 70, when: nonCelebJob, title: "Stolen Credit", image: R.drawable.angry, make: (p) => ({
        text: "A coworker presented your idea as their own.",
        options: [
            ["Confront them", () => { if (roll(0.5)) { progress(p, 3); attr(p, 0, 4, 3); return "You had the emails to prove it. Credit restored."; } attr(p, 0, -3, -2); return "It turned into your word against theirs. Tense."; }],
            ["Let it go", () => { attr(p, 0, -4, -1); return "You let it go. It still stings."; }],
        ] }) },
    { id: "hotTip", min: 25, max: 120, when: (p) => cash(p) >= 6000, title: "A Hot Tip", image: R.drawable.skill_investment, make: (p) => {
        const n = cash(p) >= 60000 ? 25000 : 5000;
        return { text: `A friend of a friend swears a tiny company is about to take off. Put ${money(n)} in?`,
            options: [
                ["Invest", () => { pay(p, n); const r = Math.random(); if (r < 0.35) { earn(p, n * 3); attr(p, 0, 12, 0); return `It took off! Your ${money(n)} is now ${money(n * 3)}.`; } if (r < 0.6) { earn(p, n); return "It went nowhere. You got your money back, at least."; } attr(p, 0, -8, -4); return `The company vanished, and so did your ${money(n)}.`; }],
                ["Pass", () => { attr(p, 0, 0, 2); return "You'll never know. Probably for the best."; }],
            ] };
    } },
    { id: "neighbours", min: 18, max: 120, title: "Noisy Neighbours", image: R.drawable.sanity_low, make: (p) => ({
        text: "Your neighbours have had a loud party every night this week.",
        options: [
            ["Knock and ask nicely", () => { if (roll(0.6)) { attr(p, 0, 2, 5); return "They apologised and invited you next time. Quiet nights again."; } attr(p, 0, -2, -3); return "They turned it down for an hour. Then up again."; }],
            ["Call in a complaint", () => { attr(p, 0, -1, 4); return "It worked, but they glare at you in the hallway now."; }],
            ["Earplugs", () => { attr(p, 0, 0, -3); return "You slept, sort of."; }],
        ] }) },
    { id: "juryDuty", min: 21, max: 75, title: "Jury Duty", image: R.drawable.police_badge, make: (p) => ({
        text: "You've been called for jury duty.",
        options: [
            ["Serve", () => { pay(p, 200); attr(p, 0, 1, 6); return "A week in a courtroom, a fair verdict, and $200 less pay. Civic duty done."; }],
            ["Try to get out of it", () => { if (roll(0.6)) { attr(p, 0, 2, 0); return "They let you go. Nobody asked too many questions."; } pay(p, 500); attr(p, 0, -3, -2); return "The judge didn't buy your excuse. $500 fine."; }],
        ] }) },
    { id: "raceInvite", min: 18, max: 60, title: "Run With Me?", image: R.drawable.health_workout, make: (p) => ({
        text: "A friend signed you both up for a charity 10K. It's in a month.",
        options: [
            ["Train for it", () => { Hobbies.addSkill("running", 10, p); attr(p, 6, 6, 2); return "You trained every morning and crossed the line together. (+10 running)"; }],
            ["Cheer from the sidelines", () => { attr(p, 0, 4, 0); return "You held the best sign at the finish line."; }],
        ] }) },
    { id: "plumbing", min: 18, max: 120, title: "Flooded Kitchen", image: R.drawable.housing_small_apartment, make: (p) => ({
        text: "A pipe burst under the sink and the kitchen is flooding.",
        options: [
            ["Call a plumber ($600)", () => { pay(p, 600); attr(p, 0, -1, 1); return "Fixed in an hour. Expensive hour."; }],
            ["Fix it yourself", () => { if (roll(0.5)) { attr(p, 0, 6, 2); return "A video, a wrench and some swearing. It's fixed!"; } pay(p, 1500); attr(p, 0, -6, -4); return "You made it worse. The plumber's bill was $1,500."; }],
        ] }) },
    { id: "inheritance", min: 30, max: 120, weight: 0.3, title: "A Surprise Inheritance", image: R.drawable.will, make: (p) => {
        const n = (5 + Math.floor(Math.random() * 46)) * 1000;
        return { text: `A great-aunt you met once left you ${money(n)} in her will.`,
            options: [
                ["Keep it", () => { earn(p, n); attr(p, 0, 6, 0); return `${money(n)} is yours. Thank you, great-aunt.`; }],
                ["Donate half to her favourite charity", () => { earn(p, n / 2); attr(p, 0, 5, 8); return `You kept ${money(n / 2)} and gave the rest to the animal shelter she loved.`; }],
            ] };
    } },
    { id: "reunion", min: 28, max: 70, title: "School Reunion", image: R.drawable.love_go_to_local_event, make: (p) => ({
        text: "Your old school is holding a reunion.",
        options: [
            ["Go", () => { attr(p, 0, 6, 0); const nf = roll(0.5) ? Relationships.makeFriend("reunion", p) : null; return nf ? `You reconnected with ${nf.getFullName()}. Friends again, like no time passed.` : "Everyone looked older except you, obviously."; }],
            ["Skip it", () => { attr(p, 0, 0, 2); return "Some things are better left in the yearbook."; }],
        ] }) },
    { id: "volunteer", min: 16, max: 120, title: "Volunteers Needed", image: R.drawable.philanthrophy_worldhunger, make: (p) => ({
        text: "The food bank is short of volunteers this weekend.",
        options: [
            ["Volunteer", () => { attr(p, 0, 4, 8); return "You packed 400 meals. Tired, but it was a good kind of tired."; }],
            ["Donate $100", () => { pay(p, 100); attr(p, 0, 2, 4); return "They sent a lovely thank-you card."; }],
            ["Not this time", () => { return "Maybe next month."; }],
        ] }) },
    { id: "getaway", min: 20, max: 120, when: (p) => partner(p) != null, title: "A Weekend Away", image: R.drawable.vacation_local, make: (p) => {
        const x = partner(p);
        return { text: `${x.getFirstName()} wants a weekend away, just the two of you.`,
            options: [
                ["Go ($800)", () => { pay(p, 800); bond(x, 60); attr(p, 0, 10, 4); return `Sunsets, room service and no phones. You and ${x.getFirstName()} needed that.`; }],
                ["Too busy", () => { bond(x, -40); attr(p, 0, -2, 0); return `${x.getFirstName()} said "fine". It was not fine.`; }],
            ] };
    } },
    { id: "argument", min: 18, max: 120, when: (p) => partner(p) != null, title: "An Argument", image: R.drawable.angry, make: (p) => {
        const x = partner(p);
        const about = pickOne(["the dishes", "money", "whose turn it is to plan date night", "your phone", "their mother"]);
        return { text: `You and ${x.getFirstName()} had a big argument about ${about}.`,
            options: [
                ["Apologise", () => { bond(x, 30); attr(p, 0, -1, 2); return "You talked it out and made up."; }],
                ["Stand your ground", () => { if (roll(0.5)) { attr(p, 0, 0, 4); return `${x.getFirstName()} came round to your side. Victory, sort of.`; } bond(x, -60); attr(p, 0, -4, -2); return "It turned into a cold war. The couch is your bed tonight."; }],
                ["Give each other space", () => { bond(x, 5); attr(p, 0, 0, 2); return "By the next day, neither of you remembered why it mattered."; }],
            ] };
    } },
    { id: "kidTrouble", min: 24, max: 120, when: (p) => kids(p, 6, 17).length > 0, title: "Trouble at School", image: R.drawable.education_middleschool, make: (p) => {
        const k = pickOne(kids(p, 6, 17));
        return { text: `${k.getFirstName()}'s teacher called: they've been getting into trouble.`,
            options: [
                ["Talk it through", () => { bond(k, 40); attr(p, 0, 0, 2); return `${k.getFirstName()} opened up about what's been going on. It's getting better.`; }],
                ["Ground them", () => { bond(k, -20); attr(p, 0, 0, 3); return `${k.getFirstName()} is furious, but the calls from school stopped.`; }],
                ["Ignore it", () => { bond(k, -15); attr(p, 0, 0, -2); return "The teacher called again. And again."; }],
            ] };
    } },
    { id: "recital", min: 24, max: 120, when: (p) => kids(p, 5, 16).length > 0, title: "The Recital", image: R.drawable.vacation_opera, make: (p) => {
        const k = pickOne(kids(p, 5, 16));
        const what = pickOne(["piano recital", "school concert", "big game", "dance show"]);
        return { text: `${k.getFirstName()}'s ${what} is on the same afternoon as an important meeting.`,
            options: [
                ["Be there", () => { bond(k, 50); progress(p, -1); attr(p, 0, 8, 2); return `${k.getFirstName()} spotted you in the crowd and lit up.`; }],
                ["Go to the meeting", () => { bond(k, -50); progress(p, 1); attr(p, 0, -4, -2); return `${k.getFirstName()} kept looking for you in the crowd.`; }],
            ] };
    } },
    { id: "parentHelp", min: 28, max: 120, when: (p) => parents(p).length > 0, title: "A Parent Needs Help", image: R.drawable.childaction_call, make: (p) => {
        const x = pickOne(parents(p));
        const n = 2000;
        return { text: `${x.getFirstName()} is moving house and could use some help (and a little money).`,
            options: [
                ["Help with money", () => { pay(p, n); bond(x, 80); return `${x.getFirstName()} said you're the best kid anyone could ask for.`; }],
                ["Help in person", () => { bond(x, 50); attr(p, -3, 2, 0); return "A week of boxes and old photo albums. Your back hurts. Worth it."; }],
                ["Can't right now", () => { bond(x, -40); attr(p, 0, -2, -1); return `${x.getFirstName()} said it's fine. You could hear that it wasn't.`; }],
            ] };
    } },
    { id: "foster", min: 18, max: 120, title: "A Stray Cat", image: R.drawable.pet_cat, make: (p) => ({
        text: "A skinny stray cat keeps sitting outside your door.",
        options: [
            ["Take it to the vet and find it a home ($100)", () => { pay(p, 100); attr(p, 0, 4, 5); return "Your coworker adopted it. They send you photos every day."; }],
            ["Feed it and move on", () => { attr(p, 0, 2, 1); return "It looks a little less skinny every day."; }],
        ] }) },

    // ------------------------------------------------------------------ later life (60+)
    { id: "scamCall", min: 45, max: 120, weight: 1.2, title: "A Strange Call", image: R.drawable.childaction_call, make: (p) => ({
        text: "Someone from \"your bank\" calls: your account is compromised and they need your details right now.",
        options: [
            ["Hang up and call your bank", () => { attr(p, 0, 1, 3); return "It was a scam. Your real bank thanked you for checking."; }],
            ["Give them your details", () => { const n = Math.min(Math.max(0, cash(p)), 3000); pay(p, n); attr(p, 0, -8, -8); return n > 0 ? `It was a scam. ${money(n)} gone before you realised.` : "It was a scam, but there was nothing in the account to take."; }],
        ] }) },
    { id: "memoir", min: 60, max: 120, title: "Your Story", image: R.drawable.sidehustle_author, make: (p) => ({
        text: "The grandkids (and everyone else) keep asking about the old days.",
        options: [
            ["Write it all down", () => { Hobbies.addSkill("writing", 15, p); attr(p, 0, 4, 6); return "Notebooks full of stories. (+15 writing)"; }],
            ["Tell stories at dinner", () => { kids(p).forEach((k) => bond(k, 20)); attr(p, 0, 6, 2); return "Everyone laughed at the same stories they've heard a hundred times."; }],
        ] }) },
    { id: "bingo", min: 60, max: 120, title: "Bingo Night", image: R.drawable.random, make: (p) => ({
        text: "The community centre is running bingo night.",
        options: [
            ["Play ($10)", () => { pay(p, 10); if (roll(0.2)) { earn(p, 500); attr(p, 0, 10, 0); return "BINGO! $500 and the envy of the whole room."; } attr(p, 0, 4, 1); return "No luck, but the snacks were excellent."; }],
            ["Stay in", () => { attr(p, 0, 0, 2); return "A quiet night with a good book."; }],
        ] }) },
    { id: "checkup", min: 50, max: 120, title: "A Funny Feeling", image: R.drawable.health_doctorvisit, make: (p) => ({
        text: "You've had a nagging pain for a couple of weeks.",
        options: [
            ["See a doctor ($300)", () => { pay(p, 300); attr(p, 6, 2, 5); return "Nothing serious, and they caught it early. Peace of mind."; }],
            ["Ignore it", () => { if (roll(0.5)) { return "It went away on its own."; } attr(p, -10, -4, -3); return "It got worse before it got better."; }],
        ] }) },

    // ------------------------------------------------------------------ cross content: fame and vampires
    { id: "fanAsk", min: 14, max: 120, when: (p) => Celebrity.tier(p) >= 2, title: "A Young Fan", image: R.drawable.lifepath_celebrity, make: (p) => ({
        text: "A kid in a hospital wrote to say you're their hero, and asks if you'd visit.",
        options: [
            ["Visit", () => { attr(p, 0, 6, 6); Celebrity.rep(p, 5); Celebrity.addFans(p, Celebrity.fans(p) * 0.01); return "You spent the afternoon with the whole ward. Somebody filmed it; the internet loved it."; }],
            ["Send a signed photo", () => { attr(p, 0, 1, 1); return "They taped it right above the bed."; }],
        ] }) },
    { id: "neverAge", min: 18, max: 120, when: (p) => Vampire.isVampire(p) && Vampire.years(p) >= 8, title: "\"You Never Change\"", image: R.drawable.lifepath_vampire, make: (p) => ({
        text: `An old acquaintance stops you: "You look exactly the same as you did ${Vampire.years(p)} years ago. How?"`,
        options: [
            ["Good genes and sunscreen", () => { if (roll(0.7)) { attr(p, 0, 2, 0); return "They laughed and asked for the brand of sunscreen."; } susp(p, 6); return "They didn't look convinced. (+6 suspicion)"; }],
            ["Wink and walk away", () => { susp(p, 3); attr(p, 0, 4, 0); return "Mysterious. They'll be thinking about it for weeks. (+3 suspicion)"; }],
            ["Avoid them from now on", () => { attr(p, 0, -2, 1); return "You take the long way home now."; }],
        ] }) },
    { id: "bloodDrive", min: 18, max: 120, when: (p) => Vampire.isVampire(p), title: "The Blood Drive", image: R.drawable.icon_vamp_bloodbank, make: (p) => ({
        text: "The hospital's blood drive is looking for volunteers to help out at the donation tent. All night.",
        options: [
            ["Volunteer (very carefully)", () => { const s = Vampire.state(p); if (roll(0.75)) { s.thirst = Math.max(0, s.thirst - 15); attr(p, 0, 4, 2); return "Nobody noticed a few bags \"went missing\". (−15 thirst)"; } susp(p, 12); return "A nurse caught you with a bag. You said it was for a friend. (+12 suspicion)"; }],
            ["Stay far away", () => { attr(p, 0, 0, 2); return "Temptation avoided."; }],
        ] }) },
];

export const LifeMoments = {
    /** Off switch (feature tests that count alerts turn it off). */
    enabled: true,
    chance: 0.12,
    gap: 3,
    cooldown: 96,
    now(p: any): number { try { return p.getTrueAgeInWeeks(); } catch { return 0; } },
    state(p: any = player()): { last: number; seen: Record<string, number>; pending: { week: number; amount: number; name: string }[] } {
        const m = p.moments ?? (p.moments = {});
        m.last ??= -999; m.seen ??= {}; m.pending ??= [];
        return m;
    },
    addPending(p: any, x: { week: number; amount: number; name: string }) { LifeMoments.state(p).pending.push(x); },
    /** Moments that could happen to this player right now. */
    eligible(p: any = player()): Moment[] {
        const age = p.getAgeInYears(), now = LifeMoments.now(p), s = LifeMoments.state(p);
        return MOMENTS.filter((m) => age >= m.min && age <= m.max && (s.seen[m.id] == null || now - s.seen[m.id] >= LifeMoments.cooldown) && (!m.when || safe(() => m.when!(p))));
    },
    canHappen(p: any): boolean {
        try {
            if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) return false;
            if (GameStateManager.INSTANCE.getPersonState() !== p) return false;
            if (p.getCrimeState?.()?.getIsInJail?.()) return false;
        } catch { return false; }
        if (!LifeMoments.enabled || Vampire.isInTorpor(p) || AlertManager.muted != null) return false;
        if (Relationships.together != null) return false;   // busy: Spend Time with Everyone
        return p.getAgeInYears() >= 5;
    },
    /** Called once a week (end of Player.applyWeekly). */
    afterWeek(p: any) {
        if (!LifeMoments.canHappen(p)) return;
        const s = LifeMoments.state(p), now = LifeMoments.now(p);
        // friends paying you back
        const due = s.pending.filter((x) => x.week <= now);
        if (due.length) {
            s.pending = s.pending.filter((x) => x.week > now);
            for (const d of due) {
                if (d.amount > 0) { earn(p, d.amount); LifeMoments.banner("Paid Back", `${d.name} paid back the loan, plus a little extra: ${money(d.amount)}.`); }
                else LifeMoments.banner("Still Waiting", `${d.name} hasn't paid you back. They keep changing the subject.`);
            }
        }
        if (now - s.last < LifeMoments.gap || Math.random() >= LifeMoments.chance) return;
        LifeMoments.trigger(p);
    },
    /** Show a moment now (a random eligible one, or the given id). Returns the moment shown, or null. */
    trigger(p: any = player(), id?: string): Moment | null {
        const list = id ? MOMENTS.filter((m) => m.id === id) : LifeMoments.eligible(p);
        if (!list.length) return null;
        const total = list.reduce((t, m) => t + (m.weight ?? 1), 0);
        let r = Math.random() * total, m = list[0];
        for (const x of list) { r -= x.weight ?? 1; if (r <= 0) { m = x; break; } }
        const built = safe(() => m.make(p));
        if (built == null) return null;
        const s = LifeMoments.state(p);
        s.last = LifeMoments.now(p);
        s.seen[m.id] = s.last;
        LifeMoments.ask(m.title, built.text, m.image, built.options);
        return m;
    },
    ask(title: string, text: string, image: any, options: Opt[]) {
        // first option = green, last = red, any in between are extra buttons (like Celebrity.choice)
        const wrap = (o: Opt) => new AlertActionViewModel(o[0], { invoke: () => { const r = safe(o[1]); if (r) LifeMoments.result(title, r, image); refresh(); return null; } });
        const extra = new ArrayList<AlertActionViewModel>();
        for (const o of options.slice(1, -1)) extra.add(wrap(o));
        try {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, text, image, null, null,
                wrap(options[0]), options.length > 1 ? wrap(options[options.length - 1]) : null, extra, AlertType.Alert, 0, null), false, 2, null);
        } catch { /* no UI */ }
    },
    result(title: string, text: string, image: any) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, text, image, null, null, null, null, null, null, 504, null), true, 2, null); } catch { /* no UI */ }
    },
    banner(title: string, msg: string) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, R.drawable.waving_hand, null, null, null, null, null, AlertType.Banner, 0, null), false, 2, null); } catch { /* no UI */ }
    },
};

function safe<T>(f: () => T): T | null { try { return f(); } catch { return null; } }
const refresh = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };
