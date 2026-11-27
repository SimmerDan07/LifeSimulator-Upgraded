// v0.33.0 "The Career Overhaul": 32 new subscriptions (from 4 to 36), grouped on the Profile tab. Each one does
// something every week. A job perk can cover one ("Covered by your job", never a second row). Streaming, music
// and the gym have family plans. The first week of a new subscription is free (once). Prices sometimes go up.
// Rules that stay: instant to start or cancel, paused in jail or a vampire's collapse, a week in debt cancels all.
import { R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { LifeMoments } from "../Managers/LifeMoments";
import { SUBSCRIPTIONS, SubscriptionDef, Subscriptions } from "../Managers/Subscriptions";
import { Relationships } from "../Social/Relationships";
import { SocialPerson } from "../Social/SocialPerson";
import { Person } from "../Managers/Person";
import { Relationship } from "../Enums/Relationship";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { Sexuality } from "../Enums/Sexuality";
import { Hobbies } from "../Managers/Hobbies";
import { Vampire } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Illness } from "../Health/Illness";
import { Youth } from "../Youth/Youth";
import { CompletableAction } from "../Enums/CompletableAction";
import { LANGUAGE_DEFS } from "../World/WorldData";
import { Work, WorkDice } from "./Work";
import { CareerPath } from "./CareerPath";
import { Companies } from "./Company";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const { roll, rnd, pick, clamp } = WorkDice;
const kids = (p: any): any[] => { try { return Array.from(p.getFamilyState().getChildren() as any).filter((k: any) => k.getIsAlive?.() !== false); } catch { return []; } };
const pets = (p: any): any[] => { try { return Array.from(p.getFamilyState().getPets() as any); } catch { return []; } };
const partner = (p: any): any => { try { return p.getFamilyState().getPartner(); } catch { return null; } };
const age = (x: any) => { try { return x.getAgeInYears(); } catch { return 0; } };
const bump = (x: any, n: number) => { try { x.setRelationshipProgress(Math.min(1000, x.getRelationshipProgress() + n)); } catch { /* ignore */ } };
const hobby = (p: any, id: string, n: number) => { try { const h: any = Hobbies.peek(id, p); if (h) h.skill = Math.min(100, (h.skill ?? 0) + n); } catch { /* ignore */ } };
const img = (k: string) => (R.drawable as any)[k] ?? k;

export const NEW_SUBSCRIPTIONS: SubscriptionDef[] = [
    // entertainment
    { id: "streaming", group: "Entertainment", title: "Streaming Service", image: img("vacation_videogames"), weekly: 4, mods: [0, 1, 0], minAge: 10, family: true, blurb: "Shows and films on demand. A family plan makes movie night a thing." },
    { id: "music", group: "Entertainment", title: "Music Streaming", image: img("education_college_music"), weekly: 3, mods: [0, 1, 0], minAge: 10, family: true, blurb: "Every song ever. Music hobbies and DJ gigs come easier." },
    { id: "gamingPass", group: "Entertainment", title: "Gaming Pass", image: img("vacation_videogames"), weekly: 4, mods: [0, 1, 0], minAge: 8, blurb: "Hundreds of games. Your Gaming hobby grows faster." },
    { id: "sportsTv", group: "Entertainment", title: "Sports TV Package", image: img("vacation_soccer"), weekly: 15, mods: [0, 1, 0], minAge: 12, family: true, blurb: "Every game, live. Friends come over to watch." },
    { id: "audiobooks", group: "Entertainment", title: "Audiobooks", image: img("sidehustle_author"), weekly: 3, mods: [0, 0, 1], minAge: 10, blurb: "Stories on the go. Your Writing hobby grows a little too." },
    // food & home
    { id: "mealKit", group: "Food & Home", title: "Meal Kit", image: img("skill_homechef"), weekly: 60, mods: [1, 0, 0], minAge: 18, blurb: "Fresh recipes at your door. Your Cooking hobby grows." },
    { id: "coffeeClub", group: "Food & Home", title: "Coffee Club", image: img("work_barista"), weekly: 8, mods: [0, 1, 0], minAge: 16, blurb: "Beans from around the world. A little sharper at work." },
    { id: "cleaning", group: "Food & Home", title: "Cleaning Service", image: img("skill_hygieneexpert"), weekly: 80, mods: [0, 2, 0], minAge: 18, blurb: "A spotless home and no arguments about chores." },
    { id: "plants", group: "Food & Home", title: "Plant & Flower Box", image: img("business_farm_new"), weekly: 6, mods: [0, 0, 1], minAge: 12, blurb: "Something green arrives every month." },
    // health & self-care
    { id: "yogaApp", group: "Health & Self-Care", title: "Yoga & Meditation App", image: img("health_meditation"), weekly: 3, mods: [0, 0, 1], minAge: 12, blurb: "Ten calm minutes a day. Work burnout builds slower." },
    { id: "spa", group: "Health & Self-Care", title: "Spa Membership", image: img("vacation_spa"), weekly: 120, mods: [0, 2, 1], minAge: 18, blurb: "Saunas, pools and robes." },
    { id: "nutritionist", group: "Health & Self-Care", title: "Nutritionist", image: img("skill_nutritionscience"), weekly: 90, mods: [1, 0, 0], minAge: 14, blurb: "Someone who knows what you should eat." },
    { id: "dentalVision", group: "Health & Self-Care", title: "Dental & Vision Plan", image: img("health_doctorvisit"), weekly: 15, mods: [0, 0, 0], minAge: 18, blurb: "Dentist cleanings and eye exams (Health › Self-Care) are free." },
    { id: "massage", group: "Health & Self-Care", title: "Massage Membership", image: img("vacation_spa"), weekly: 40, mods: [1, 0, 2], minAge: 16, blurb: "A massage a week." },
    { id: "fitnessPass", group: "Health & Self-Care", title: "Fitness Class Pass", image: img("health_workout"), weekly: 30, mods: [2, 0, 0], minAge: 14, blurb: "Yoga, pilates and spin. Now and then you meet someone new." },
    { id: "skincareBox", group: "Health & Self-Care", title: "Skincare Box", image: img("skill_hygieneexpert"), weekly: 10, mods: [0, 1, 0], minAge: 12, blurb: "Serums, masks and things you can't pronounce." },
    { id: "sleepApp", group: "Health & Self-Care", title: "Sleep App", image: img("health_meditation"), weekly: 2, mods: [0, 0, 0], minAge: 12, blurb: "Healthy sleep (Health › Self-Care) gives +2 health a week instead of +1." },
    { id: "lifeCoach", group: "Health & Self-Care", title: "Life Coach", image: img("skill_selfimprovement"), weekly: 200, mods: [0, 1, 0], minAge: 16, blurb: "Your self-care goals finish 25% sooner." },
    // career & learning
    { id: "jobBoard", group: "Career & Learning", title: "Job Board Premium", image: img("tab_briefcase"), weekly: 10, mods: [0, 0, 0], minAge: 16, blurb: "+5 Hire Score, and fresh job openings every 2 weeks instead of 4." },
    { id: "onlineCourses", group: "Career & Learning", title: "Online Courses", image: img("education_masters"), weekly: 12, mods: [0, 0, 0], minAge: 14, covered: "courses", blurb: "+1 career skill a week in your job's field, and Take a Course costs half." },
    { id: "coworking", group: "Career & Learning", title: "Coworking Space", image: img("possession_computer_2"), weekly: 60, mods: [0, 1, 0], minAge: 18, blurb: "Working from home climbs as fast as the office. Sometimes you network." },
    { id: "languageApp", group: "Career & Learning", title: "Language App", image: img("education_literature"), weekly: 3, mods: [0, 0, 0], minAge: 8, blurb: "A little progress every week on a language you've started learning." },
    // family
    { id: "babysitter", group: "Family", title: "Babysitter", image: img("love_baby"), weekly: 150, mods: [0, 2, 2], minAge: 18, show: (p) => kids(p).some((k) => age(k) < 13), blurb: "Date nights and a breather. Your kids and partner feel closer." },
    { id: "kidTutor", group: "Family", title: "Tutor for Your Kid", image: img("work_teacher"), weekly: 80, mods: [0, 0, 0], minAge: 18, show: (p) => kids(p).some((k) => age(k) >= 5 && age(k) < 18), blurb: "Your school-age kids' grades go up faster." },
    { id: "dogWalker", group: "Family", title: "Dog Walker", image: img("vacation_park"), weekly: 40, mods: [0, 1, 0], minAge: 16, show: (p) => pets(p).length > 0, blurb: "Your pets get their walks while you work." },
    { id: "familyPhone", group: "Family", title: "Family Phone Plan", image: img("possession_computer_2"), weekly: 20, mods: [0, 0, 0], minAge: 18, show: (p) => kids(p).some((k) => age(k) >= 12 && age(k) < 18), blurb: "Your teens get phones (and are a bit happier with you)." },
    // love
    { id: "datingApp", group: "Love", title: "Dating App Premium", image: img("love_tinder_date"), weekly: 8, mods: [0, 0, 0], minAge: 18, show: (p) => partner(p) == null, blurb: "Better matches. Now and then someone special wants to meet." },
    // lifepaths
    { id: "bloodBank", group: "Lifepaths", title: "Blood Bank Delivery", image: img("lifepath_vampire"), weekly: 250, mods: [0, 0, 0], minAge: 0, show: (p) => Vampire.isVampire(p), blurb: "Bagged blood at your door: your hunger eases every week, with no hunting and no Rumours." },
    { id: "fanClub", group: "Lifepaths", title: "Fan Club Platform", image: img("lifepath_celebrity"), weekly: 20, mods: [0, 1, 0], minAge: 13, show: (p) => Celebrity.fans(p) >= 10_000, blurb: "Your fans grow every week, and the merch pays a little." },
    { id: "security", group: "Lifepaths", title: "Private Security", image: img("police_badge"), weekly: 500, mods: [0, 0, 2], minAge: 18, show: (p) => Celebrity.fans(p) >= 100_000 || Number(p.getMoneyState().getCash().toString()) >= 5_000_000, blurb: "Nobody gets near you that you don't want near you." },
    { id: "lawyer", group: "Lifepaths", title: "Lawyer on Retainer", image: img("work_lawyer"), weekly: 300, mods: [0, 0, 1], minAge: 18, blurb: "If you're ever sentenced, it's 30% shorter." },
    { id: "accounting", group: "Business", title: "Accounting Software", image: img("skill_investment"), weekly: 25, mods: [0, 0, 0], minAge: 18, show: (p) => Companies.all(p).some((c) => !c.public), blurb: "Fewer money troubles at your companies: theft and supplier problems happen half as often." },
];

export const WorkSubs = {
    on(id: string, p: any = player()): boolean { return Subscriptions.on(id, p); },
    /** Every week (after the payments). */
    weekly(p: any) {
        if (Subscriptions.paused(p)) return;
        const on = (id: string) => Subscriptions.on(id, p);
        const fam = (id: string) => Subscriptions.family(id, p);
        if (fam("streaming") || fam("music") || fam("sportsTv") || fam("gym")) { const pt = partner(p); if (pt) bump(pt, 3); for (const k of kids(p)) bump(k, 3); }
        if (on("sportsTv")) for (const f of Relationships.friends(p).slice(0, 3)) bump(f, 2);
        if (on("music")) hobby(p, "guitar", 0.3);
        if (on("gamingPass")) hobby(p, "gaming", 0.5);
        if (on("audiobooks")) hobby(p, "writing", 0.3);
        if (on("mealKit")) hobby(p, "cooking", 0.5);
        if (on("yogaApp")) { try { const s = Illness.state(p); s.overwork = Math.max(0, s.overwork - 0.3); } catch { /* ignore */ } }
        if (on("onlineCourses") && Work.job(p) != null) CareerPath.addSkill(Work.group(Work.job(p)), 1, p);
        if (on("languageApp") && Work.now(p) % 2 === 0) WorkSubs.languageTick(p);
        if (on("babysitter")) { const pt = partner(p); if (pt) bump(pt, 4); for (const k of kids(p)) if (age(k) < 13) bump(k, 4); }
        if (on("kidTutor")) for (const k of kids(p)) if (age(k) >= 5 && age(k) < 18) { const m = Youth.kid(k, p); m.grades = Math.min(100, m.grades + 0.6); }
        if (on("familyPhone")) for (const k of kids(p)) if (age(k) >= 12 && age(k) < 18) bump(k, 2);
        if (on("bloodBank") && Vampire.isVampire(p)) Vampire.feed(p, Math.max(1, Vampire.thirstPerWeekFor(p) * 1.5), 0);
        if (on("fanClub")) { try { const f = Celebrity.fans(p); Celebrity.addFans(p, Math.max(200, Math.round(f * 0.002))); } catch { /* ignore */ } }
        if (on("fitnessPass") && roll(0.04)) { const f = Relationships.makeFriend("gym", p); if (f) Relationships.banner("New Friend", `You and ${f.getFirstName()} keep ending up on neighbouring bikes in spin class. You're friends now.`, "health_workout"); }
        if (on("coworking") && Work.job(p) != null && Work.state(p).wfh && roll(0.03)) { const f = Relationships.makeFriend("work", p); if (f) Relationships.banner("Networking", `You met ${f.getFirstName()} at the coworking space. Good to know people.`, "possession_computer_2"); }
        if (on("datingApp") && partner(p) == null && p.getAgeInYears() >= 18 && roll(0.06)) WorkSubs.match(p);
        // prices sometimes go up (a random event: News when pop-ups are off)
        const mine = Subscriptions.active(p);
        if (mine.length && roll(0.002)) {
            const id = pick(mine), d = Subscriptions.def(id);
            if (d) { const m: any = (p.subPrice ??= {}); m[id] = Math.round((m[id] ?? 1) * (1.1 + Math.random() * 0.1) * 100) / 100; Work.say("Price Increase", `${d.title} raised its price to ${Subscriptions.priceText(d, p)} a week. You can cancel on the Profile tab.`, d.image); }
        }
    },
    languageTick(p: any) {
        try {
            const cas = p.getCompletableActionState();
            for (const l of LANGUAGE_DEFS) {
                const a = (CompletableAction as any)[l.id];
                if (!a || cas.isCompleted(a)) continue;
                const st = cas.getState(a);
                if ((st?.getProgress?.() ?? st?.progress ?? 0) > 0) { cas.tickCompletionProgress(a); return; }
            }
        } catch { /* ignore */ }
    },
    /** A dating-app match who wants to meet. */
    match(p: any) {
        const sex = p.getSex().randomPartnerGender(p.getSexuality());
        const x: any = SocialPerson.make("friend" as any, sex, null, Math.max(18, p.getAgeInYears() + rnd(-5, 5)) * 52 + rnd(0, 51));
        const name = `${x.firstName}`;
        const meet = () => {
            try {
                if (partner(p) != null) return "Turns out you're taken. You let them down gently.";
                const lover = new Person(x.firstName, x.lastName, x.getGender(), p.getSexuality?.() ?? Sexuality.straight, x.getSex(), Relationship.lover, x.getAgeInWeeks(), LoverPersonality.cheerful);
                lover.setRelationshipProgress(rnd(550, 700));
                p.getFamilyState().date(lover);
                return `One drink became three. You and ${name} are dating now.`;
            } catch { return "It was a nice evening."; }
        };
        LifeMoments.ask("It's a Match", `${name} (${x.getAgeInYears()}) matched with you on the dating app and wants to meet for a drink.`, "love_tinder_date",
            [["Meet them", meet], ["Not interested", () => "You swiped on."]], { random: true });
    },
    /** Self-care goals finish sooner with a life coach. */
    goalFactor(p: any = player()): number { return Subscriptions.on("lifeCoach", p) ? 0.75 : 1; },
};
