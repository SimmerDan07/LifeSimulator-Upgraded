// v0.36.0 The Remaster: traits that change how a life plays. Each trait has a few concrete effects (listed where you
// see it), the harsh ones have kinder names, and traits can change: therapy softens hard edges, and big moments
// (getting fit, seeing the world, beating a serious illness, saving hard) can give you a new one. Ids are kept.
import { Rm, player, now, age, WPY, roll, pick, money, cash, pay, Say, img, weeklyMods, mods, isVampire } from "./Core";
import { Trait } from "../Enums/Trait";
import { Subscriptions } from "../Managers/Subscriptions";

export interface TraitInfo { title?: string; does: string }
/** What each trait does (shown in the trait list and when you pick traits for a new life). */
export const TRAIT_INFO: Record<string, TraitInfo> = {
    cunning: { does: "Job interviews +3; you haggle 10% more when you sell things; sneakier options in crime." },
    strongImmuneSystem: { does: "+health every week, and 30% less likely to catch an illness." },
    sexy: { does: "Dates go better and people notice you." },
    frugal: { does: "Upkeep on your things is 20% cheaper, trips 10% cheaper, and you start with better credit." },
    confident: { does: "Job interviews +5." },
    adventurous: { does: "Holidays and trips are 25% more fun." },
    intellectualCuriosity: { does: "You learn faster at school and in courses." },
    optimistic: { does: "+happiness every week, and quitting habits is easier." },
    evenTempered: { does: "+sanity every week, and quitting habits is much easier." },
    logical: { does: "You learn faster, and do a little better at work (+2)." },
    creative: { does: "Arts, culture and games are 20% more fun; better at creative side hustles." },
    humble: { does: "Coworkers and bosses like you (+1 at work)." },
    charismatic: { does: "Job interviews +6 and +2 at work: people like you." },
    persuasive: { does: "You talk your way into 5% more pay." },
    articulate: { does: "Job interviews +4; better at writing and speaking side hustles." },
    entertainer: { does: "Nightlife is 20% more fun; better at performing side hustles." },
    clumsy: { does: "Now and then something silly happens (never dangerous)." },
    sickly: { title: "Delicate Health", does: "−health every week, 30% more likely to catch things, and fitness is harder to build." },
    buttUgly: { title: "Unconventional Looks", does: "Dates are harder at first; people who stay, really like you." },
    unlucky: { does: "Scratch cards win half as often, and cars break down more." },
    pessimistic: { title: "Glass Half Empty", does: "−happiness every week. Therapy can help." },
    lazy: { title: "Laid-Back", does: "−3 at work, but +sanity every week: nothing gets to you." },
    stupid: { title: "Scatterbrained", does: "Slower at school and −2 at work, but +happiness every week." },
    closeMinded: { title: "Set in Their Ways", does: "New activities are 20% less fun (favourites are just as good). Therapy can help." },
    apathetic: { title: "Indifferent", does: "Relationships grow slower, but +sanity every week. Therapy can help." },
    highMaintenance: { does: "Your things make you 50% happier, and cost 20% more to keep." },
    shortTempered: { title: "Hot-Headed", does: "−sanity every week. Therapy can help." },
    infertile: { does: "You can't have biological children; adoption is open to you." },
    crazy: { title: "Wild Card", does: "−sanity every week, and every so often you do something wild. Therapy can help." },
};
/** Traits therapy can soften (one every 24 weeks of therapy). */
export const SOFTENABLE = ["shortTempered", "pessimistic", "crazy", "apathetic", "closeMinded"];

export interface TraitsState { v: number; therapyWeeks: number; fitWeeks: number; changes: { week: number; text: string }[]; given: string[] }

const has = (p: any, t: string): boolean => { try { return p.getTraitState().getTraits().contains((Trait as any)[t]); } catch { return false; } };

export const Traits = {
    st(p: any = player()): TraitsState {
        const t = Rm.st(p).traits as TraitsState;
        if (t.v == null) Object.assign(t, { v: 1, therapyWeeks: 0, fitWeeks: 0, changes: [], given: [] } as TraitsState);
        return t;
    },
    has,
    title(t: any): string | null { return TRAIT_INFO[t?.name?.()]?.title ?? null; },
    does(t: any): string { return TRAIT_INFO[t?.name?.()]?.does ?? ""; },

    // ------------------------------------------------------------------ effects other systems ask for
    hireBonus(p: any): [string, number] | null {
        let n = 0; const why: string[] = [];
        const add = (t: string, v: number) => { if (has(p, t)) { n += v; why.push(Traits.title((Trait as any)[t]) ?? (Trait as any)[t].getTitle()); } };
        add("cunning", 3); add("confident", 5); add("charismatic", 6); add("articulate", 4);
        return n ? [why.join(", "), n] : null;
    },
    perfBonus(p: any): number { return (has(p, "logical") ? 2 : 0) + (has(p, "charismatic") ? 2 : 0) + (has(p, "humble") ? 1 : 0) - (has(p, "lazy") ? 3 : 0) - (has(p, "stupid") ? 2 : 0); },
    payMult(p: any): number { return has(p, "persuasive") ? 1.05 : 1; },
    sellMult(p: any): number { return has(p, "cunning") ? 1.1 : 1; },
    upkeepMult(p: any): number { return (has(p, "frugal") ? 0.8 : 1) * (has(p, "highMaintenance") ? 1.2 : 1); },
    thingsHappyMult(p: any): number { return has(p, "highMaintenance") ? 1.5 : 1; },
    tripMult(p: any): number { return has(p, "adventurous") ? 1.25 : 1; },
    tripCostMult(p: any): number { return has(p, "frugal") ? 0.9 : 1; },
    leisureMult(p: any, cat: string | null, favourite: boolean): number {
        let m = 1;
        if (has(p, "creative") && (cat === "culture" || cat === "fun")) m *= 1.2;
        if (has(p, "entertainer") && cat === "nightlife") m *= 1.2;
        if (has(p, "closeMinded") && !favourite) m *= 0.8;
        return m;
    },
    illnessMult(p: any): number { return (has(p, "strongImmuneSystem") ? 0.7 : 1) * (has(p, "sickly") ? 1.3 : 1); },
    scratchMult(p: any): number { return has(p, "unlucky") ? 0.5 : 1; },
    breakdownMult(p: any): number { return has(p, "unlucky") ? 1.5 : 1; },

    // ------------------------------------------------------------------ the week
    collectWeeklyValues(p: any) {
        if (age(p) < 6) return;
        let h = 0, hap = 0, san = 0;
        if (has(p, "lazy")) san += 0.5;
        if (has(p, "stupid")) hap += 0.3;
        if (has(p, "apathetic")) san += 0.5;
        if (h || hap || san) weeklyMods(p, h, hap, san, "Your traits");
    },
    afterWeek(p: any) {
        if (age(p) < 6) return;
        const t = Traits.st(p);
        // little moments
        if (has(p, "clumsy") && roll(0.008)) Traits.clumsyMoment(p);
        if (has(p, "crazy") && roll(0.008)) Traits.wildMoment(p);
        // therapy softens hard edges
        if (age(p) >= 12 && (Subscriptions.on?.("therapist", p) || Subscriptions.has?.("therapist", p))) {
            t.therapyWeeks++;
            if (t.therapyWeeks % 24 === 0) {
                const soft = SOFTENABLE.find((x) => has(p, x));
                if (soft) Traits.remove(p, soft, "Therapy Is Working", `After months of therapy, you're not ${(Traits.title((Trait as any)[soft]) ?? (Trait as any)[soft].getTitle()).toLowerCase()} any more. It feels like putting down something heavy.`);
            }
        }
        // a year of being fit makes you confident
        const fit = (p.rm?.body?.fit ?? 0) as number;
        t.fitWeeks = fit >= 70 && !isVampire(p) ? t.fitWeeks + 1 : 0;
        if (t.fitWeeks >= WPY()) Traits.give(p, "confident", "Confident", "A year of being properly fit changed how you carry yourself. You're Confident now.");
        // seeing the world
        if ((p.rm?.fun?.visited?.length ?? 0) >= 10) Traits.give(p, "adventurous", "Adventurous", "Ten countries in, you've caught the travel bug for good. You're Adventurous now.");
        // beating a serious illness
        try { const hist: any[] = p.illness?.history ?? []; if (hist.some((h) => ["cancer", "leukemia", "heartDisease", "stroke"].includes(h.id) && /cured|beat|remission/.test(h.outcome ?? ""))) Traits.give(p, "optimistic", "A New Lease on Life", "You beat something that could have killed you. Every day feels like a gift now: you're Optimistic."); } catch { /* */ }
        // saving hard
        try { const goals: any[] = p.rm?.bank?.goals ?? []; if (goals.some((g) => g.reached && ["house", "college", "million", "retire"].includes(g.id))) Traits.give(p, "frugal", "Frugal", "Reaching a big savings goal changed how you think about money. You're Frugal now."); } catch { /* */ }
    },
    give(p: any, id: string, title: string, text: string) {
        const t = Traits.st(p);
        if (t.given.includes(id) || has(p, id)) return;
        const tr = (Trait as any)[id];
        const opp = tr.getOpposite?.();
        if (opp && p.getTraitState().getTraits().contains(opp)) return;   // you'd have to lose the opposite first
        t.given.push(id);
        p.getTraitState().addTrait(tr);
        t.changes.push({ week: now(p), text: `Became ${tr.getTitle()}` });
        Say.milestone(title, text, img("icon_rm_traits"));
    },
    remove(p: any, id: string, title: string, text: string) {
        const tr = (Trait as any)[id];
        p.getTraitState().getTraits().remove(tr);
        Traits.st(p).changes.push({ week: now(p), text: `No longer ${Traits.title(tr) ?? tr.getTitle()}` });
        Say.milestone(title, text, img("icon_rm_traits"));
    },
    clumsyMoment(p: any) {
        const x = pick([
            ["Oops", "You dropped your phone down the stairs. The screen survived; your pride didn't.", 0, -1, 0],
            ["Oops", "You walked into a glass door in front of everyone.", 0, -2, 0],
            ["Oops", "You spilled coffee all over your shirt right before an important meeting.", 0, -1, -1],
            ["Oops", "You tripped over nothing at all. Twice.", -1, 0, 0],
            ["Oops", "You locked yourself out and had to call a locksmith ($120).", 0, -1, -1, 120],
        ] as any[]);
        mods(p, x[2], x[3], x[4]);
        if (x[5] && cash(p) >= x[5]) pay(p, x[5]);
        Say.note(x[0], x[1], img("icon_rm_traits"));
    },
    wildMoment(p: any) {
        const x = pick([
            ["Wild Card", "You got a tattoo on a whim. You kind of love it.", 0, 4, 1, 200],
            ["Wild Card", "You drove to the coast at 2 a.m. just to see the sunrise.", 0, 5, 2, 80],
            ["Wild Card", "You dyed your hair bright blue. People are still talking.", 0, 3, 1, 60],
            ["Wild Card", "You signed up for a skydiving lesson on a dare.", 0, 6, -1, 300],
        ] as any[]);
        mods(p, x[2], x[3], x[4]);
        if (cash(p) >= x[5]) pay(p, x[5]);
        Say.note(x[0], x[1], img("icon_rm_traits"));
    },
};
