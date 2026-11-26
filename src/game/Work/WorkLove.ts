// v0.33.0 "The Career Overhaul": Love tab actions for your boss and coworkers, and asking friends and family to put
// in a good word. Added to LOVE_ACTIONS by installWork().
import { LoveActionDef } from "../Social/LoveActions";
import { Relationships } from "../Social/Relationships";
import { Work } from "./Work";
import { Workplace } from "./Workplace";

const isBoss = (t: any) => t?.workRole === "boss";
const every = (key: "raiseAsk" | "promoAsk" | "feedback" | "chat" | "help", weeks: number, what: string) => (_t: any, p: any) => {
    const since = Work.now(p) - (Workplace.state(p) as any)[key];
    return since < weeks ? `${what} again in ${weeks - since} week${weeks - since === 1 ? "" : "s"}` : null;
};
const say = (title: string, msg: string) => Relationships.banner(title, msg, "tab_briefcase");
const shout = (title: string, msg: string) => Work.say(title, msg, "tab_briefcase");

export const WORK_LOVE_ACTIONS: LoveActionDef[] = [
    // ------------------------------------------------------------------ your boss
    { id: "bossChat", title: "Chat with Your Boss", image: "tab_briefcase", who: ["coworker"], section: "time", bond: 10, instant: true,
        show: (t) => isBoss(t), lock: every("chat", 1, "Chat"),
        note: () => "A few minutes of small talk. Bosses remember who stops by. Once a week.\n",
        run: (_t, p) => { Workplace.state(p).chat = Work.now(p); Workplace.bump(p, 2); } },
    { id: "bossFeedback", title: "Ask for Feedback", image: "icon_work_review", who: ["coworker"], section: "time", instant: true,
        show: (t) => isBoss(t), lock: every("feedback", 4, "Ask"),
        note: () => "Find out where you really stand. Every 4 weeks.\n",
        run: (_t, p) => shout("Feedback", Workplace.feedback(p)) },
    { id: "bossRaise", title: "Ask for a Raise", image: "bank_deposit", who: ["coworker"], section: "big", instant: true,
        show: (t) => isBoss(t), lock: every("raiseAsk", 26, "Ask"),
        note: () => `Better odds when your performance and their opinion of you are high. Every 6 months.\n`,
        run: (_t, p) => shout("Asking for a Raise", Workplace.askRaise(p)) },
    { id: "bossPromotion", title: "Ask for a Promotion", image: "icon_work_effort", who: ["coworker"], section: "big", instant: true,
        show: (t) => isBoss(t), lock: every("promoAsk", 26, "Ask"),
        note: () => "Works if you're most of the way there, performing well, and liked. Every 6 months.\n",
        run: (_t, p) => shout("Asking for a Promotion", Workplace.askPromotion(p)) },
    { id: "bossComplain", title: "Complain About a Coworker", image: "icon_work_review", who: ["coworker"], section: "hard", instant: true,
        show: (t, p) => isBoss(t) && Workplace.coworkers(p).length > 0,
        note: () => "If they really are the problem, your boss may sort it out. If not, it's on you.\n",
        run: (_t, p) => Workplace.complainMenu(p) },
    // ------------------------------------------------------------------ coworkers
    { id: "coworkerLunch", title: "Grab Lunch Together", image: "vacation_drinks", who: ["coworker"], section: "time", cost: 15, bond: 20, mods: [0, 3, 1], instant: true,
        lock: (t) => ((Relationships.meta(t) as any).lunch === Relationships.now() ? "Again next week" : null),
        note: () => "Once a week, on your lunch break.\n",
        run: (t) => { (Relationships.meta(t) as any).lunch = Relationships.now(); } },
    { id: "coworkerHelp", title: "Ask for Help", image: "possession_computer_2", who: ["coworker"], section: "time", instant: true,
        show: (t) => !isBoss(t), lock: every("help", 4, "Ask"),
        note: (t) => `${t.getFirstName()} might show you a better way to do things (+3 performance). Every 4 weeks.\n`,
        run: (t, p) => shout("A Little Help", Workplace.askHelp(p, t)) },
    { id: "coworkerAskOut", title: "Ask Them Out", image: "love_movie", who: ["coworker"], section: "big", instant: true,
        show: (_t, p) => p.getAgeInYears() >= 18,
        lock: (t, p) => Workplace.canAskOut(p, t),
        note: (t) => (isBoss(t) ? "Dating your boss. What could go wrong?\n" : "An office romance. Everyone will know by Monday.\n"),
        run: (t, p) => {
            const yes = Math.random() < (isBoss(t) ? 0.35 : 0.6);
            const name = t.getFirstName();
            if (!yes) { t.setRelationshipProgress(t.getRelationshipProgress() - 80); say("Awkward", `${name} said they'd rather keep things professional. You'll see them at the coffee machine tomorrow.`); return; }
            const boss = isBoss(t);
            if (Workplace.date(p, t)) say("Office Romance", `${name} said yes! You're dating now.${boss ? " HR would like a word, eventually." : ""}`);
        } },
    // ------------------------------------------------------------------ a good word from friends and family
    { id: "referral", title: (t) => `Ask ${t.getFirstName()} About Jobs at Their Work`, image: "tab_briefcase",
        who: ["friend", "sibling", "parent", "partner", "cousin", "auntUncle", "grandparent", "child"], section: "time", instant: true,
        show: (t, p) => Work.enabled && p.getAgeInYears() >= 16 && t.getIsAlive() && t.getAgeInYears() >= 22 && t.getAgeInYears() < 70,
        lock: (t, p) => (t.getRelationshipProgress() < 450 ? "You'd need to be closer first" : ((Relationships.meta(t) as any).referral ?? -99) > Relationships.now() - 12 ? "Ask again in a few weeks" : Work.state(p).referral ? "Someone already put in a word for you" : null),
        note: (t) => `${t.getFirstName()} puts in a word: your next job application gets an interview for sure. Every 12 weeks.\n`,
        run: (t, p) => { (Relationships.meta(t) as any).referral = Relationships.now(); Work.state(p).referral = t.getFirstName(); say("A Good Word", `${t.getFirstName()} says they'll mention you. Your next application goes straight to an interview.`); } },
];
