// Celebrity Life (v0.19.0) — the fame pack. A lifepath in the Lifepaths tab (star icon) with three celebrity
// careers that are only offered here: Acting (Theater degree), Music (Music & Production degree) and Dance (starts as
// a Street Dancer). They are real jobs — pay, promotions and the Work tab's Work buttons work as usual — but:
//   - working one earns fans and skill; the top levels also need fans (Lead Actor needs to be Famous, …);
//   - fans make a fame tier: Unknown → Local Talent (1K) → Rising Star (10K) → Famous (100K) → Star (1M) →
//     Superstar (10M) → Icon (100M); fans fade if you go quiet for more than two weeks;
//   - reputation (0–100) shapes fan growth; at 10 or less you're cancelled until it's back to 35;
//   - activities per career (auditions and movies; songs, singles, albums, tours, music videos; dance battles,
//     choreography, a yearly championship) and for fame (social media, meet & greets, red carpets, talk shows,
//     charity galas, your own brand, a star on the Walk of Fame);
//   - a team with weekly costs (agent, publicist, bodyguard); royalties and brand income every week;
//   - events: paparazzi, scandals, endorsement deals, stalkers, viral moments, and yearly awards;
//   - crossovers: fame helps dating; heirs inherit 10% of a famous parent's peak fans; the obituary and Family
//     Line remember it; a famous vampire draws suspicion (cameras everywhere).
import { ArrayList, BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { AlertActionViewModel } from "../Managers/AlertActionViewModel";
import { AlertType } from "../Managers/AlertType";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Modifiers } from "../Managers/Modifiers";
import { Constants } from "../Utils/Constants";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { Job } from "../Enums/Job";
import { CompletableAction } from "../Enums/CompletableAction";
import { CelebrityState } from "./CelebrityState";
import { Vampire, LifeActionDef } from "./Vampire";
import { World } from "./CelebrityWorld";
import { CelebNames } from "./CelebNames";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const WPY = () => Constants.Time.INSTANCE.getWeeksPerYear();
const roll = (p: number) => Math.random() < p;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const earn = (p: any, n: number, label: string | null = null) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.workIncome, label, null, 8, null);
const pay = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.directSpend, null, null, 12, null);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const refreshUI = () => { try { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); } catch { /* no UI */ } };
const now = (p: any) => p.calendarWeeks?.() ?? p.getAgeInWeeks();

export const TIERS = [
    { name: "Unknown", min: 0 },
    { name: "Local Talent", min: 1_000 },
    { name: "Rising Star", min: 10_000 },
    { name: "Famous", min: 100_000 },
    { name: "Star", min: 1_000_000 },
    { name: "Superstar", min: 10_000_000 },
    { name: "Icon", min: 100_000_000 },
];
/** Nobody has more fans than this. */
export const FAN_CEILING = 800_000_000;
export type CelebCareer = "acting" | "music" | "dance";
export const CAREERS: { id: CelebCareer; job: () => Job; title: string; skill: "acting" | "music" | "dance"; degree: () => CompletableAction; degreeFrom: number; awards: string; word: string }[] = [
    { id: "acting", job: () => Job.actor, title: "Acting", skill: "acting", degree: () => CompletableAction.college_theater, degreeFrom: 4, awards: "Golden Star Awards", word: "actor" },
    { id: "music", job: () => Job.music, title: "Music", skill: "music", degree: () => CompletableAction.college_music, degreeFrom: 5, awards: "Music Awards", word: "musician" },
    { id: "dance", job: () => Job.dancer, title: "Dance", skill: "dance", degree: () => CompletableAction.college_theater, degreeFrom: 5, awards: "Dance Awards", word: "dancer" },
];
/** Fame tier needed for a promotion to `level` (by career), e.g. acting 7 (Lead Actor) needs Famous. */
const FAME_GATES: Record<CelebCareer, Record<number, number>> = {
    acting: { 6: 2, 7: 3, 8: 4, 9: 5 },
    music: { 6: 2, 7: 3, 8: 4, 9: 5 },
    dance: { 5: 1, 6: 2, 7: 3 },
};
const ROLES = ["a detective in a crime drama", "the villain in a superhero movie", "a lead in a romantic comedy", "a soldier in a war epic", "a ghost in a horror film", "a chef in a sitcom", "a king in a period drama", "a robot in a sci-fi series"];
const BRANDS = ["fragrance", "clothing line", "sneaker line", "makeup line", "energy drink", "headphone line"];
const SCANDALS = ["were photographed in a heated argument with a waiter", "posted something you deeply regret", "were caught lip-syncing", "had old messages leaked", "skipped a charity event you promised to attend", "were spotted partying the night before a big show"];
/** Tabloid versions of SCANDALS (same order). */
const SCANDAL_NEWS = ["caught screaming at a waiter", "under fire for a post", "caught lip-syncing", "leaked messages", "no-show at charity event", "partying before the big show"];
const COMPANIES = ["a sportswear giant", "a soda company", "a luxury watchmaker", "a phone maker", "a fast-food chain", "a crypto startup"];

const CelebrityBase = {
    image: R.drawable.lifepath_celebrity,
    minAge: 14,

    // ------------------------------------------------------------------ state
    state(p: any = player()): CelebrityState {
        if (p.celebrity == null) p.celebrity = new CelebrityState();
        return World.normalize(p.celebrity);
    },
    peek(p: any = player()): CelebrityState | null { return p?.celebrity ?? null; },
    fans(p: any = player()): number { return Celebrity.peek(p)?.fans ?? 0; },
    tier(p: any = player()): number { return Celebrity.tierOf(Celebrity.fans(p)); },
    tierOf(fans: number): number { let t = 0; TIERS.forEach((x, i) => { if (fans >= x.min) t = i; }); return t; },
    tierName(p: any = player()): string { return TIERS[Celebrity.tier(p)].name; },
    fansText(n: number): string {
        const f = (x: number) => (x >= 100 ? Math.round(x).toString() : (Math.round(x * 10) / 10).toString());
        if (n >= 1e9) return f(n / 1e9) + "B";
        if (n >= 1e6) return f(n / 1e6) + "M";
        if (n >= 1e3) return f(n / 1e3) + "K";
        return String(Math.round(n));
    },
    career(p: any = player()) {
        const job = p.getJobState?.()?.getCurrentJob?.();
        return CAREERS.find((c) => c.job() === job) ?? null;
    },
    level(p: any = player()): number {
        const c = Celebrity.career(p);
        return c ? p.getJobState().getState(c.job()).getLevel() : 0;
    },
    isCelebJob(job: any): boolean { return CAREERS.some((c) => c.job() === job); },
    hasDegree(p: any, c: { degree: () => CompletableAction }): boolean {
        try { return p.getCompletableActionState().isCompleted(c.degree()); } catch { return false; }
    },
    /** Skill used for chances: the trained skill, +15 with the career's degree. */
    skill(p: any, kind: "acting" | "music" | "dance"): number {
        const s = Celebrity.state(p);
        const c = CAREERS.find((x) => x.skill === kind)!;
        return clamp((s[kind] ?? 0) + (Celebrity.hasDegree(p, c) ? 15 : 0), 0, 115);
    },
    train(p: any, kind: "acting" | "music" | "dance", n: number) { const s = Celebrity.state(p); s[kind] = clamp((s[kind] ?? 0) + n, 0, 100); },
    active(p: any) { Celebrity.state(p).lastActive = now(p); },

    // ------------------------------------------------------------------ fans and reputation
    repFactor(p: any): number {
        const s = Celebrity.state(p);
        if (s.cancelled) return 0.3;
        return s.reputation < 25 ? 0.6 : s.reputation > 75 ? 1.15 : 1;
    },
    /** Add (or remove, if negative) fans. Gains are shaped by reputation; crossing a tier shows an alert. */
    addFans(p: any, n: number): number {
        const s = Celebrity.state(p);
        // gains slow down as you approach the whole world (a soft ceiling of 800 million fans)
        // and each tier above Rising Star is harder to climb than the last
        const climb = 1 / (1 + 0.25 * Math.max(0, Celebrity.tierOf(s.fans) - 2));
        const gain = n > 0 ? Math.round(n * Celebrity.repFactor(p) * climb * Math.max(0, 1 - s.fans / FAN_CEILING)) : Math.round(n);
        s.fans = Math.max(0, Math.min(FAN_CEILING, s.fans + gain));
        s.peakFans = Math.max(s.peakFans, s.fans);
        const t = Celebrity.tierOf(s.fans);
        if (t > (s.tierShown ?? 0)) {
            s.tierShown = t;
            if (t >= 2) World.news(p, `${p.getFullName()} is now a${/^[AEIOU]/.test(TIERS[t].name) ? "n" : ""} ${TIERS[t].name} with ${Celebrity.fansText(s.fans)} fans`);
            Celebrity.alert(`You're ${t === 1 ? "Local Talent" : `a${/^[AEIOU]/.test(TIERS[t].name) ? "n" : ""} ${TIERS[t].name}`}!`,
                `${Celebrity.fansText(s.fans)} fans now follow you.${Celebrity.tierPerk(t)}`, Celebrity.image);
        }
        return gain;
    },
    tierPerk(t: number): string {
        return ["", " People in town start to recognize you.", " You can walk red carpets now.", " Talk shows, charity galas and endorsement deals open up — and so do the paparazzi.",
            " You can launch your own brand.", " Stalkers are a real risk now: think about a bodyguard.", " You're one of the most famous people alive. The Walk of Fame awaits."][t] ?? "";
    },
    /** A share of your fans plus a base amount (activities scale with fame). */
    grow(p: any, share: number, base: number): number { return Celebrity.addFans(p, Celebrity.fans(p) * share + base); },
    rep(p: any, d: number) {
        const s = Celebrity.state(p);
        s.reputation = clamp(s.reputation + d, 0, 100);
        if (!s.cancelled && s.reputation <= 10) {
            s.cancelled = true;
            s.wasCancelled = true;
            s.agent = false;
            World.news(p, `${p.getFullName()} is CANCELLED`);
            Celebrity.alert("You've Been Cancelled", "The internet has turned on you. Fan growth slows to a crawl and your agent has dropped you. Win people back (charity, apologies, good work) to get your reputation back to 35.", R.drawable.icon_celeb_scandal);
        } else if (s.cancelled && s.reputation >= 35) {
            s.cancelled = false;
            s.comeback = true;
            World.news(p, `The comeback: fans forgive ${p.getFullName()}`);
            Celebrity.alert("The Comeback", "People are giving you a second chance. You're no longer cancelled.", Celebrity.image);
        }
    },

    // ------------------------------------------------------------------ careers
    /** Why a promotion to `level` is blocked by fame (null = it isn't). */
    promotionBlock(job: any, level: number, p: any = player()): string | null {
        const c = CAREERS.find((x) => x.job() === job);
        if (c == null) return null;
        const need = FAME_GATES[c.id][level];
        if (need == null || Celebrity.tier(p) >= need) return null;
        return `${TIERS[need].name} (${Celebrity.fansText(TIERS[need].min)} fans)`;
    },
    /** Called when the promotion check fails on fame; shows the alert once per level. */
    blocked(job: any, level: number, p: any = player()) {
        const s = Celebrity.state(p);
        const key = `${job.name()}:${level}`;
        if (s.blockShown === key) return;
        s.blockShown = key;
        Celebrity.alert("Not Famous Enough Yet", `Your next promotion needs you to be ${Celebrity.promotionBlock(job, level, p)}. Grow your fanbase in Lifepaths › Celebrity Life.`, Celebrity.image);
    },
    /** A week of work in a celebrity career: fans, skill and staying in the public eye. */
    onWork(p: any, job: any, level: number, payModifier = 1) {
        const c = CAREERS.find((x) => x.job() === job);
        if (c == null) return;
        Celebrity.train(p, c.skill, 1);
        Celebrity.addFans(p, (level * level * 8 + 10) * payModifier * rnd(0.6, 1.4));
        Celebrity.active(p);
        Celebrity.state(p).yearWork += 0.05;
    },

    // ------------------------------------------------------------------ the week
    weeklyCosts(p: any): { label: string; amount: number }[] {
        const s = Celebrity.peek(p);
        if (s == null) return [];
        const out: { label: string; amount: number }[] = [];
        if (s.agent) out.push({ label: "Agent", amount: 1000 });
        if (s.publicist) out.push({ label: "Publicist", amount: 1500 });
        if (s.bodyguard) out.push({ label: "Bodyguard", amount: 2500 });
        return out;
    },
    royalties(p: any): number {
        const s = Celebrity.peek(p);
        if (s == null || s.fans < 1000) return 0;
        return Math.round((s.fans * 0.0005 + s.hits * 200 + s.albums * 500 + s.movies * 300) * (s.cancelled ? 0.5 : 1));
    },
    brandIncome(p: any): number { const s = Celebrity.peek(p); return s?.brand ? Math.round(s.fans * 0.001) : 0; },
    /** Weekly fade when you go quiet. */
    fadeRate(p: any): number {
        const s = Celebrity.state(p);
        let r = s.publicist ? 0.005 : 0.01;
        if (s.fanClub) r *= 0.5;
        if (World.soundIs(p, "country")) r *= 0.5;
        return r;
    },
    /** How hard scandals hit (country sound and a foundation soften them). */
    scandalFactor(p: any): number { const s = Celebrity.state(p); return (World.soundIs(p, "country") ? 0.6 : 1) * (s.foundation ? 0.7 : 1); },
    tourGross(p: any): number { return Math.min(20_000_000, Math.max(2000, Celebrity.fans(p) * 0.4)); },
    /** Famous people climb faster: extra promotion progress per week of work (Famous +1, Superstar +2, Icon +3). */
    progressBonus(job: any, p: any = player()): number { return Celebrity.isCelebJob(job) ? Math.floor(Celebrity.tier(p) / 2) : 0; },
    collectWeeklyValues(p: any) {
        const s = Celebrity.peek(p);
        if (s == null) return;
        try { if (p.getCrimeState().getIsInJail()) return; } catch { /* ignore */ }
        for (const c of Celebrity.weeklyCosts(p)) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(c.amount), MoneyUpdateType.expense, c.label, null, 8, null);
        const r = Celebrity.royalties(p);
        if (r > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(r), MoneyUpdateType.passiveIncome, "Fame royalties", null, 8, null);
        const b = Celebrity.brandIncome(p);
        if (b > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(b), MoneyUpdateType.passiveIncome, `Your ${s.brand}`, null, 8, null);
        World.weeklyBusiness(p);
    },
    afterWeek(p: any) {
        const s = Celebrity.peek(p);
        if (s == null || (s.fans <= 0 && Celebrity.career(p) == null)) return;
        try { if (!p.getIsAlive()) return; } catch { /* ignore */ }
        // fans fade when you go quiet (less with a publicist, a fan club or a country sound; never for a Legend)
        if (now(p) - (s.lastActive ?? 0) > 2 && !s.legend) s.fans = Math.max(0, Math.round(s.fans * (1 - Celebrity.fadeRate(p))));
        World.weekly(p);
        if (s.fans < 1000) return;
        const t = Celebrity.tier(p);
        // a famous vampire: cameras everywhere
        if (Vampire.isVampire(p) && t >= 4 && !Vampire.has("mindFog", p)) { const v = Vampire.state(p); v.suspicion = Math.min(100, v.suspicion + 1); }
        // the awards (once a year)
        const year = Math.floor(p.calendarWeeks() / WPY());
        if (s.awardYear !== year) { const first = s.awardYear < 0; s.awardYear = year; if (!first) Celebrity.awards(p); }
        // one event a week at most
        if (t >= 2 && Celebrity.career(p) != null && s.rivals[Celebrity.career(p)!.id] != null && roll(0.02)) return World.feud(p);
        if (t >= 5 && !s.bodyguard && roll(0.02)) return Celebrity.stalker(p);
        if (t >= 3 && roll(s.publicist ? 0.012 : 0.025)) return Celebrity.scandal(p);
        if (t >= 3 && !s.cancelled && roll(s.agent ? 0.05 : 0.03)) return Celebrity.endorsement(p);
        if (t >= 3 && roll(0.06)) {
            Celebrity.addFans(p, s.fans * 0.01); attr(p, 0, 0, -2);
            const pt = World.celebPartner(p);
            if (pt != null) World.news(p, `Spotted: ${p.getFullName()} and ${pt.getFirstName()} ${pick(["holding hands in Malibu", "at a quiet dinner", "shopping on Rodeo Drive", "on a yacht"])}`);
            return Celebrity.banner("Paparazzi", pt != null ? `Photographers followed you and ${pt.getFirstName()} all week.` : "Photographers followed you all week. Any press is good press… right?");
        }
        if (t >= 2 && roll(0.02)) { attr(p, 0, 3, 0); return Celebrity.banner("Fan Mail", "A fan sent you a heartfelt letter and a hand-made gift."); }
        World.perks(p);
    },

    // ------------------------------------------------------------------ events
    scandal(p: any) {
        const s = Celebrity.state(p);
        const i = Math.floor(Math.random() * SCANDALS.length);
        const what = SCANDALS[i];
        const k = Celebrity.scandalFactor(p);
        const n = p.getFullName();
        World.news(p, `SCANDAL: ${n} ${SCANDAL_NEWS[i]}`);
        Celebrity.choice("Tabloid Scandal", `The tabloids say you ${what}. Everyone's talking. What do you do?`, R.drawable.icon_celeb_scandal, [
            ["Apologize", () => { Celebrity.rep(p, Math.round(-4 * k)); Celebrity.addFans(p, -s.fans * 0.02); World.news(p, `${n} apologizes`); Celebrity.banner("You Apologized", "Most people respected it. A few fans left."); World.after(p); }],
            ["Deny it", () => { if (roll(0.5)) { World.news(p, `${n} denies everything, and it works`); Celebrity.banner("It Blew Over", "Nobody could prove anything."); } else { Celebrity.rep(p, Math.round(-18 * k)); Celebrity.addFans(p, -s.fans * 0.05); World.news(p, `Caught lying: new proof sinks ${n}`); Celebrity.banner("Caught Lying", "Proof came out. It's much worse now."); } World.after(p); }],
            ["Lean into it", () => { Celebrity.rep(p, Math.round(-12 * k)); Celebrity.addFans(p, s.fans * 0.06); World.news(p, `${n} doesn't care what you think`); Celebrity.banner("Notorious", "Your name is everywhere. Not everyone is a fan of it."); World.after(p); }],
        ]);
    },
    endorsement(p: any) {
        const s = Celebrity.state(p);
        const who = pick(COMPANIES);
        const offer = Math.min(5_000_000, Math.round(s.fans * 0.03 / 1000) * 1000 + 5000);
        const shady = who === "a crypto startup" || roll(0.15);
        Celebrity.choice("Endorsement Deal", `${who[0].toUpperCase() + who.slice(1)} wants you in its next campaign for ${money(offer)}.`, R.drawable.icon_celeb_brand, [
            ["Accept", () => { earn(p, offer, "Endorsement deal"); Celebrity.grow(p, 0.02, 500); World.news(p, `${p.getFullName()} signs ${money(offer)} deal with ${who}`); if (shady) { Celebrity.rep(p, -10); Celebrity.banner("Bad Partner", "The company turned out to be shady. Fans are disappointed you took the deal."); } }],
            ["Decline", () => { Celebrity.rep(p, 1); }],
        ]);
    },
    stalker(p: any) {
        attr(p, -5, -5, -15);
        World.news(p, `Police warn obsessed fan to stay away from ${p.getFullName()}`);
        Celebrity.choice("A Stalker", "Someone has been following you home and leaving notes. You don't feel safe.", R.drawable.icon_celeb_bodyguard, [
            ["Hire a Bodyguard ($2,500 a week)", () => { Celebrity.state(p).bodyguard = true; }],
            ["Call the police", () => { Celebrity.banner("Reported", "The police took a report. It's still scary."); }],
        ]);
    },
    awards(p: any) {
        const s = Celebrity.state(p);
        const c = Celebrity.career(p);
        const t = Celebrity.tier(p);
        if (c == null || t < 2) { s.yearWork = 0; return; }
        const level = Celebrity.level(p);
        const nominate = clamp(0.1 + t * 0.08 + Math.min(4, s.yearWork) * 0.08 + level * 0.02, 0, 0.9);
        s.yearWork = 0;
        if (!roll(nominate)) return;
        const cat = { acting: pick(["Best Actor", "Best Supporting Role", "Best Performance in a Series"]), music: pick(["Song of the Year", "Best New Artist", "Album of the Year"]), dance: pick(["Best Choreography", "Dancer of the Year"]) }[c.id];
        World.ceremony(p, c.awards, cat, c.id);
    },

    // ------------------------------------------------------------------ crossovers
    datingMultiplier(p: any = player()): number { return 1 + Celebrity.tier(p) * 0.08; },
    /** Heirs: a famous parent passes on 10% of their peak fans (and a famous last name). */
    inherit(parent: any, heir: any) {
        const s = Celebrity.peek(parent);
        if (s == null || s.peakFans < 10_000) return;
        const h = Celebrity.state(heir);
        h.fans = h.inherited = Math.round(s.peakFans * 0.1);
        h.peakFans = h.fans;
        h.tierShown = Celebrity.tierOf(h.fans);
        h.lastActive = now(heir);
    },
    /** "a famous actor", for the obituary (null if never famous). */
    describe(p: any): string | null {
        const s = Celebrity.peek(p);
        if (s == null || s.peakFans < 1000) return null;
        const t = TIERS[Celebrity.tierOf(s.peakFans)].name.toLowerCase();
        const c = Celebrity.career(p);
        const word = c?.word ?? "celebrity";
        return `${/^[aeiou]/.test(t) ? "an" : "a"} ${t === "local talent" ? "locally known" : t} ${word}`;
    },
    knownFor(p: any): string | null { return World.knownFor(p); },
    fameLine(p: any): string | null {
        const s = Celebrity.peek(p);
        if (s == null || s.peakFans < 1000) return null;
        return `${TIERS[Celebrity.tierOf(s.peakFans)].name} (${Celebrity.fansText(s.peakFans)} fans at the peak)`;
    },

    // ------------------------------------------------------------------ UI helpers
    alert(title: string, msg: string, image: any = R.drawable.lifepath_celebrity) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
    },
    banner(title: string, msg: string) {
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, R.drawable.lifepath_celebrity, null, null, null, null, null, AlertType.Banner, 0, null), false, 2, null); } catch { /* no UI */ }
    },
    choice(title: string, msg: string, image: any, options: [string, () => void][]) {
        // first option = the main (green) button, the last = the bottom (red) one, any others in between, in order
        const first = options[0];
        const second = options.length > 1 ? options[options.length - 1] : undefined;
        const rest = options.slice(1, Math.max(1, options.length - 1));
        const extra = new ArrayList<AlertActionViewModel>();
        for (const [label, fn] of rest) extra.add(new AlertActionViewModel(label, { invoke: () => { fn(); refreshUI(); return null; } }));
        try {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null,
                new AlertActionViewModel(first[0], { invoke: () => { first[1](); refreshUI(); return null; } }),
                second ? new AlertActionViewModel(second[0], { invoke: () => { second[1](); refreshUI(); return null; } }) : null,
                extra, AlertType.Alert, 0, null), false, 2, null);
        } catch { /* no UI */ }
    },
    money,
};
export const Celebrity: typeof CelebrityBase & CelebrityRules = CelebrityBase as any;

// ======================================================================== activities
const s_ = () => Celebrity.state();
const inCareer = (id: CelebCareer) => (p: any) => {
    if (Celebrity.career(p)?.id === id) return null;
    const t = CAREERS.find((c) => c.id === id)!.title.toLowerCase();
    return `Start ${/^[aeiou]/.test(t) ? "an" : "a"} ${t} career first`;
};
const atLevel = (id: CelebCareer, lvl: number, title: string) => (p: any) => inCareer(id)(p) ?? (Celebrity.level(p) >= lvl ? null : `Needs ${title}`);
const atTier = (t: number) => (p: any) => (Celebrity.tier(p) >= t ? null : `Needs ${TIERS[t].name} (${Celebrity.fansText(TIERS[t].min)} fans)`);
const both = (a: (p: any) => string | null, b: (p: any) => string | null) => (p: any) => a(p) ?? b(p);
const ageOk = (n: number) => (p: any) => (p.getAgeInYears() >= n ? null : `Must be at least ${n}`);
const done = (p: any) => { Celebrity.active(p); Celebrity.state(p).yearWork++; };

export const ACTING: LifeActionDef[] = [
    { id: "actingClass", title: "Acting Class", image: R.drawable.icon_celeb_actingclass, cost: 500, mods: [0, 1, 0], lock: ageOk(6),
        note: () => `Acting skill ${s_().acting} → +5.\n`, run: (p) => Celebrity.train(p, "acting", 5) },
    { id: "audition", title: "Audition for a Role", image: R.drawable.icon_celeb_audition, lock: inCareer("acting"),
        note: () => `${Math.round(Celebrity.auditionChance(player()) * 100)}% chance. Roles bring fans, a bonus and faster promotion.\n`,
        run: (p) => Celebrity.audition(p) },
    { id: "movie", title: "Star in a Movie", image: R.drawable.icon_celeb_movie, lock: atLevel("acting", 7, "Lead Actor"),
        note: () => "Pick a genre (action, drama, comedy, horror or indie), film it, and the box office decides.\n", run: (p) => World.chooseGenre(p) },
];
export const MUSIC: LifeActionDef[] = [
    { id: "musicLessons", title: "Music Lessons", image: R.drawable.icon_celeb_lessons, cost: 300, mods: [0, 1, 1], lock: ageOk(6),
        note: () => `Music skill ${s_().music} → +5.\n`, run: (p) => Celebrity.train(p, "music", 5) },
    { id: "writeSong", title: "Write a Song", image: R.drawable.icon_celeb_writesong, mods: [0, 2, 1], lock: ageOk(10),
        note: () => `${s_().songs} unreleased song${s_().songs === 1 ? "" : "s"}.\n`, run: (p) => { Celebrity.state(p).songs++; Celebrity.train(p, "music", 1); Celebrity.active(p); } },
    { id: "single", title: "Record a Single", image: R.drawable.icon_celeb_single, cost: 2000, lock: both(inCareer("music"), (p) => (Celebrity.state(p).songs > 0 ? null : "Write a song first")),
        note: () => "Studio time for one song. The charts decide how far it goes.\n", run: (p) => Celebrity.single(p) },
    { id: "album", title: "Release an Album", image: R.drawable.icon_celeb_album, cost: 25000,
        lock: both(atLevel("music", 5, "Recording Artist"), (p) => (Celebrity.state(p).songs >= 8 ? null : `Needs 8 unreleased songs (${Celebrity.state(p).songs})`)),
        note: () => "Eight songs. Gold, platinum or diamond?\n", run: (p) => Celebrity.album(p) },
    { id: "tour", title: "Go on Tour", image: R.drawable.icon_celeb_tour, cost: 10000, mods: [-10, 5, -5], lock: atLevel("music", 4, "Opening Act"),
        note: () => `Ticket sales depend on your fans (about ${money(Celebrity.tourGross(player()))}).\n`, run: (p) => Celebrity.tour(p) },
    { id: "musicVideo", title: "Shoot a Music Video", image: R.drawable.icon_celeb_musicvideo, cost: 20000,
        lock: both(inCareer("music"), (p) => (Celebrity.state(p).singles > 0 ? null : "Release a single first")),
        note: () => "A chance to go viral.\n", run: (p) => Celebrity.musicVideo(p) },
];
export const DANCE: LifeActionDef[] = [
    { id: "dancePractice", title: "Dance Practice", image: R.drawable.icon_celeb_dancepractice, mods: [2, 1, 0], lock: ageOk(6),
        note: () => `Dance skill ${s_().dance} → +4.\n`, run: (p) => Celebrity.train(p, "dance", 4) },
    { id: "streetShow", title: "Street Performance", image: R.drawable.icon_celeb_streetshow, mods: [1, 2, 0], lock: inCareer("dance"),
        note: () => "Tips from the crowd and a few new fans.\n", run: (p) => Celebrity.streetShow(p) },
    { id: "battle", title: "Dance Battle", image: R.drawable.icon_celeb_battle, lock: inCareer("dance"),
        note: () => `${Math.round(Celebrity.battleChance(player()) * 100)}% chance to win $1,000 and a crowd of fans.\n`, run: (p) => Celebrity.battle(p) },
    { id: "danceChallenge", title: "Start a Dance Challenge", image: R.drawable.icon_celeb_viral, lock: inCareer("dance"),
        note: () => "Post a routine online. Sometimes the whole world joins in.\n", run: (p) => Celebrity.challenge(p) },
    { id: "choreograph", title: "Choreograph a Show", image: R.drawable.icon_celeb_choreo, mods: [0, 3, -1], lock: atLevel("dance", 5, "Dance Captain"),
        note: () => `Paid ${money(5000 * Math.max(1, Celebrity.level(player()) - 3))}.\n`, run: (p) => Celebrity.choreograph(p) },
    { id: "championship", title: "World Dance Championship", image: R.drawable.icon_celeb_competition, cost: 1000,
        lock: both(atLevel("dance", 2, "Dance Crew Member"), (p) => (Celebrity.state(p).championshipYear === Math.floor(p.calendarWeeks() / WPY()) ? "Once a year" : null)),
        note: () => "Once a year. Win the title and a trophy.\n", run: (p) => Celebrity.championship(p) },
];
export const FAME: LifeActionDef[] = [
    { id: "social", title: "Post on Social Media", image: R.drawable.icon_celeb_social, lock: ageOk(13),
        note: () => "Keep fans close. Small chance of saying the wrong thing.\n", run: (p) => Celebrity.social(p) },
    { id: "meetGreet", title: "Fan Meet & Greet", image: R.drawable.icon_celeb_meetgreet, cost: 500, mods: [0, 5, 0], lock: atTier(1),
        note: () => "+3% fans, +2 reputation.\n", run: (p) => { Celebrity.grow(p, 0.03, 100); Celebrity.rep(p, 2); done(p); } },
    { id: "redCarpet", title: "Walk a Red Carpet", image: R.drawable.icon_celeb_redcarpet, cost: 3000, mods: [0, 4, 0], lock: atTier(2),
        note: () => "+4% fans, +3 reputation.\n", run: (p) => { Celebrity.grow(p, 0.04, 500); Celebrity.rep(p, 3); done(p); } },
    { id: "talkShow", title: "Talk Show Interview", image: R.drawable.icon_celeb_talkshow, lock: atTier(3),
        note: () => `Paid ${money(5000 * Celebrity.tier(player()))}; +6% fans. Small risk of a gaffe.\n`, run: (p) => Celebrity.talkShow(p) },
    { id: "gala", title: "Host a Charity Gala", image: R.drawable.icon_celeb_gala, cost: 25000, mods: [0, 6, 3], lock: atTier(3),
        note: () => "+15 reputation, +2% fans.\n", run: (p) => { Celebrity.rep(p, 15); Celebrity.grow(p, 0.02, 500); done(p); } },
];
/** Shown in the Legacy section. */
export const WALK_OF_FAME: LifeActionDef[] = [
    { id: "walkOfFame", title: "Star on the Walk of Fame", image: R.drawable.icon_celeb_walkoffame, cost: 30000,
        lock: (p) => (Celebrity.state(p).walkOfFame ? "You have your star" : Celebrity.tier(p) >= 6 || (Celebrity.tier(p) >= 5 && Celebrity.state(p).awards.length >= 3) ? null : "Needs Icon, or Superstar with 3 awards"),
        note: () => "Your name, in the pavement, forever.\n",
        run: (p) => { const s = Celebrity.state(p); s.walkOfFame = true; s.awards.push(`Star on the Walk of Fame (age ${p.getAgeInYears()})`); Celebrity.rep(p, 10); attr(p, 0, 20, 5); World.news(p, `${p.getFullName()} gets a star on the Walk of Fame`); Celebrity.alert("A Star Is Laid", "Your star on the Walk of Fame is unveiled in front of thousands of fans.", R.drawable.icon_celeb_walkoffame); } },
];
// free activities say "Go" instead of "$0"
for (const d of [...ACTING, ...MUSIC, ...DANCE, ...FAME, ...WALK_OF_FAME]) if (d.cost == null && d.actionTitle == null) d.actionTitle = () => "Go";

const team = (id: "agent" | "publicist" | "bodyguard", title: string, cost: number, what: string, tier: number, image: any): LifeActionDef => ({
    id, title: () => (Celebrity.state()[id] ? `${title} (hired)` : title), image, instant: true, lock: atTier(tier),
    actionTitle: () => (Celebrity.state()[id] ? "Let Go" : "Hire"),
    note: () => `${money(cost)} a week. ${what}\n`,
    run: (p) => { const s = Celebrity.state(p); s[id] = !s[id]; },
});
export const TEAM: LifeActionDef[] = [
    team("agent", "Agent", 1000, "Better auditions and more endorsement offers.", 1, R.drawable.icon_celeb_agent),
    team("publicist", "Publicist", 1500, "Half as many scandals; fans fade half as fast.", 2, R.drawable.icon_celeb_publicist),
    team("bodyguard", "Bodyguard", 2500, "Keeps stalkers away.", 3, R.drawable.icon_celeb_bodyguard),
];

// ------------------------------------------------------------------ activity rules
Object.assign(Celebrity, {
    auditionChance(p: any): number {
        const s = Celebrity.state(p);
        return clamp(0.2 + Celebrity.skill(p, "acting") / 250 + (s.agent ? 0.15 : 0) + Celebrity.tier(p) * 0.04 - (s.cancelled ? 0.2 : 0), 0.05, 0.9);
    },
    audition(p: any) {
        const s = Celebrity.state(p);
        done(p);
        if (roll(Celebrity.auditionChance(p))) {
            const lvl = Celebrity.level(p);
            const role = pick(ROLES);
            s.roles++;
            const fans = Celebrity.grow(p, 0.05, 200 * lvl);
            const bonus = 500 * lvl * lvl;
            earn(p, bonus, "Role bonus");
            try { const st = p.getJobState().getState(Job.actor); st.updateProgress(st.getProgress() + 2); } catch { /* none */ }
            Celebrity.train(p, "acting", 2);
            Celebrity.alert("You Got the Part!", `You'll play ${role}. +${Celebrity.fansText(fans)} fans and a ${money(bonus)} bonus.`, R.drawable.icon_celeb_audition);
        } else {
            attr(p, 0, -4, -1);
            Celebrity.alert("Not This Time", "The casting director went with someone else.", R.drawable.icon_celeb_audition);
        }
    },
    /** v0.20.0: genres. Action pays most, Drama and Indie are awards bait, Comedy pleases crowds, Horror is a gamble. */
    movie(p: any, genre: string = "Drama") {
        const s = Celebrity.state(p);
        done(p);
        s.movies++;
        const G: Record<string, { score: [number, number]; pay: number; fans: number; awards: number; rep: number }> = {
            Action: { score: [-25, 40], pay: 1.3, fans: 1.1, awards: 0, rep: 0 },
            Drama: { score: [-30, 40], pay: 1, fans: 1, awards: 1, rep: 1 },
            Comedy: { score: [-20, 40], pay: 1, fans: 1.2, awards: 0, rep: 1 },
            Horror: { score: [-45, 55], pay: 0.8, fans: 1.1, awards: 0, rep: 0 },
            Indie: { score: [-25, 35], pay: 0.4, fans: 0.7, awards: 2, rep: 3 },
        };
        const g = G[genre] ?? G.Drama;
        s.yearWork += g.awards;
        const score = Celebrity.skill(p, "acting") + Celebrity.tier(p) * 8 + rnd(g.score[0], g.score[1]);
        const lvl = Math.max(1, Celebrity.level(p));
        const title = CelebNames.movie(genre, World.titles(p));
        const n = p.getFullName();
        if (score < 50) {
            const fee = Math.round(20000 * lvl * g.pay);
            earn(p, fee, "Movie fee");
            Celebrity.rep(p, -3 + g.rep);
            World.work(p, "movie", title, "Flop", genre);
            if (Celebrity.tier(p) >= 2) World.news(p, `"${title}" bombs at the box office`);
            Celebrity.alert("Box Office Flop", `Critics hated "${title}" and nobody went. You still got paid ${money(fee)}.`, R.drawable.icon_celeb_movie);
        } else if (score < 95) {
            const fee = Math.round(80000 * lvl * g.pay);
            earn(p, fee, "Movie fee");
            const f = Celebrity.grow(p, 0.15 * g.fans, 20000);
            Celebrity.rep(p, g.rep);
            World.work(p, "movie", title, "Hit", genre);
            World.news(p, `${n}'s ${genre.toLowerCase()} "${title}" is a hit`);
            Celebrity.alert("A Hit!", `"${title}" did great. ${money(fee)} and +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_movie);
        } else {
            s.hits++;
            const fee = Math.round(250000 * lvl * g.pay);
            earn(p, fee, "Movie fee");
            const f = Celebrity.grow(p, 0.4 * g.fans, 100000);
            Celebrity.rep(p, 4 + g.rep);
            World.work(p, "movie", title, "Blockbuster", genre);
            World.news(p, `"${title}" smashes box office records — ${n} is everywhere`);
            Celebrity.alert("Blockbuster!", `Lines around the block for "${title}". ${money(fee)} and +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_movie);
        }
    },
    chartScore(p: any): number { return Celebrity.skill(p, "music") + Celebrity.tier(p) * 10 + (Celebrity.state(p).agent ? 8 : 0) + (World.soundIs(p, "hiphop") ? 8 : 0) + rnd(-25, 35); },
    /** Pop artists get 10% more fans from releases. */
    popBoost(p: any): number { return World.soundIs(p, "pop") ? 1.1 : 1; },
    single(p: any) {
        const s = Celebrity.state(p);
        done(p);
        s.songs--; s.singles++;
        const score = Celebrity.chartScore(p);
        const k = Celebrity.popBoost(p);
        const title = CelebNames.song(World.titles(p));
        const n = p.getFullName();
        if (score >= 120) {
            s.hits++;
            const f = Celebrity.grow(p, 0.3 * k, 50000); Celebrity.rep(p, 3);
            World.work(p, "single", title, "#1", World.sound(p) ?? undefined);
            World.news(p, `"${title}" debuts at #1 — ${n} makes history`);
            Celebrity.alert("Number One!", `"${title}" went straight to #1. +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_single);
        } else if (score >= 85) {
            s.hits++;
            const f = Celebrity.grow(p, 0.12 * k, 10000);
            World.work(p, "single", title, "Top 10", World.sound(p) ?? undefined);
            World.news(p, `${n}'s "${title}" cracks the top 10`);
            Celebrity.alert("Top 10 Hit", `"${title}" climbed into the top 10. +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_single);
        } else if (score >= 50) {
            const f = Celebrity.grow(p, 0.04 * k, 1500);
            World.work(p, "single", title, "Top 100", World.sound(p) ?? undefined);
            Celebrity.alert("On the Charts", `"${title}" made the top 100. +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_single);
        } else {
            const f = Celebrity.grow(p, 0.005 * k, 150);
            World.work(p, "single", title, "Didn't chart", World.sound(p) ?? undefined);
            Celebrity.alert("Didn't Chart", `Not many people heard "${title}", but +${Celebrity.fansText(f)} fans did.`, R.drawable.icon_celeb_single);
        }
    },
    album(p: any) {
        const s = Celebrity.state(p);
        done(p);
        s.songs -= 8; s.albums++;
        const score = Celebrity.chartScore(p) + 10;
        const [cert, share, base, cash] = score >= 125 ? ["Diamond", 0.5, 200000, 2_000_000] : score >= 95 ? ["Platinum", 0.25, 50000, 500_000] : score >= 65 ? ["Gold", 0.1, 10000, 100_000] : ["Modest seller", 0.02, 2000, 20_000];
        if (score >= 95) s.hits++;
        const title = CelebNames.album(World.titles(p));
        earn(p, cash as number, "Album sales");
        const f = Celebrity.grow(p, (share as number) * Celebrity.popBoost(p), base as number);
        World.work(p, "album", title, cert as string, World.sound(p) ?? undefined);
        if (score >= 65) World.news(p, `${p.getFullName()}'s album "${title}" goes ${(cert as string).toLowerCase()}`);
        Celebrity.alert("Album Released", `"${title}" went ${cert === "Modest seller" ? "out to modest sales" : cert}. ${money(cash as number)} in sales and +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_album);
    },
    tour(p: any) {
        const s = Celebrity.state(p);
        done(p);
        s.tours++;
        const tickets = Math.round(Celebrity.tourGross(p) * rnd(0.8, 1.2) * (World.soundIs(p, "rock") ? 1.25 : 1));
        earn(p, tickets, "Tour ticket sales");
        const f = Celebrity.grow(p, 0.1, 3000);
        Celebrity.train(p, "music", 2);
        const lastAlbum = [...s.works].reverse().find((w) => w.kind === "album");
        const title = lastAlbum ? `The ${lastAlbum.title} Tour` : `${p.getFullName()} Live`;
        World.work(p, "tour", title, "Sold out", money(tickets));
        if (Celebrity.tier(p) >= 3) World.news(p, `${title} sells out arenas, grossing ${money(tickets)}`);
        Celebrity.alert("Tour Wrapped", `${title}: ${money(tickets)} in ticket sales and +${Celebrity.fansText(f)} fans. You're exhausted.`, R.drawable.icon_celeb_tour);
    },
    /** Electronic artists go viral more often. */
    viralChance(p: any, base: number): number { return base * (World.soundIs(p, "electronic") ? 1.6 : 1); },
    musicVideo(p: any) {
        const s = Celebrity.state(p);
        done(p);
        const song = [...s.works].reverse().find((w) => w.kind === "single")?.title ?? CelebNames.song(World.titles(p));
        if (roll(Celebrity.viralChance(p, 0.12))) {
            const f = Celebrity.grow(p, 0.5, 50000);
            World.work(p, "video", song, "Viral");
            World.news(p, `${p.getFullName()}'s "${song}" video breaks the internet`);
            Celebrity.alert("It Went Viral!", `The "${song}" video has hundreds of millions of views. +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_musicvideo);
        } else {
            const f = Celebrity.grow(p, 0.06, 3000);
            World.work(p, "video", song, "Released");
            Celebrity.alert("Music Video Out", `Fans love the "${song}" video. +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_musicvideo);
        }
    },
    battleChance(p: any): number { return clamp(0.25 + Celebrity.skill(p, "dance") / 200, 0.1, 0.9); },
    streetShow(p: any) {
        done(p);
        const tips = Math.round(rnd(50, 150) + Celebrity.skill(p, "dance") * 3);
        earn(p, tips, "Tips");
        Celebrity.train(p, "dance", 1);
        const f = Celebrity.grow(p, 0.01, 40 + Celebrity.skill(p, "dance"));
        Celebrity.banner("Street Performance", `A crowd gathered. ${money(tips)} in tips and +${Celebrity.fansText(f)} fans.`);
    },
    battle(p: any) {
        const s = Celebrity.state(p);
        done(p);
        if (roll(Celebrity.battleChance(p))) {
            s.battlesWon++;
            earn(p, 1000, "Dance battle prize");
            const f = Celebrity.grow(p, 0.05, 800);
            Celebrity.train(p, "dance", 2);
            if (Celebrity.tier(p) >= 2) World.news(p, `${p.getFullName()} wins another dance battle`);
            Celebrity.alert("You Won the Battle!", `The crowd went wild. $1,000 and +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_battle);
        } else {
            attr(p, 0, -3, 0);
            Celebrity.train(p, "dance", 1);
            Celebrity.alert("Out-Danced", "Your rival had better moves tonight. You learned something, though.", R.drawable.icon_celeb_battle);
        }
    },
    challenge(p: any) {
        done(p);
        const title = CelebNames.challenge(p.getFirstName());
        if (roll(Celebrity.viralChance(p, 0.08 + Celebrity.skill(p, "dance") / 1000))) {
            const f = Celebrity.grow(p, 0.5, 20000);
            World.work(p, "challenge", title, "Viral");
            World.news(p, `Everyone is doing ${title}`);
            Celebrity.alert("The World Is Dancing", `Millions are doing ${title}. +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_viral);
        } else {
            const f = Celebrity.grow(p, 0.02, 200);
            World.work(p, "challenge", title, "Posted");
            Celebrity.banner("Dance Challenge", `A few thousand people tried ${title}. +${Celebrity.fansText(f)} fans.`);
        }
    },
    choreograph(p: any) {
        done(p);
        const fee = 5000 * Math.max(1, Celebrity.level(p) - 3);
        earn(p, fee, "Choreography fee");
        const f = Celebrity.grow(p, 0.05, 2000);
        Celebrity.train(p, "dance", 2);
        const title = CelebNames.show(World.titles(p));
        World.work(p, "show", title, "Sold out");
        if (Celebrity.tier(p) >= 3) World.news(p, `${p.getFullName()}'s "${title}" opens to a standing ovation`);
        Celebrity.alert("Show Choreographed", `Opening night of "${title}" was a triumph. ${money(fee)} and +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_choreo);
    },
    championship(p: any) {
        const s = Celebrity.state(p);
        done(p);
        s.championshipYear = Math.floor(p.calendarWeeks() / WPY());
        if (roll(clamp(0.1 + Celebrity.skill(p, "dance") / 180 + Celebrity.level(p) * 0.03, 0.05, 0.8))) {
            s.awards.push(`World Dance Champion (age ${p.getAgeInYears()})`);
            World.work(p, "title", "World Dance Championship", "Champion");
            World.news(p, `${p.getFullName()} crowned World Dance Champion`);
            earn(p, 50000, "Championship prize");
            const f = Celebrity.grow(p, 0.2, 10000);
            Celebrity.alert("World Champion!", `You won the World Dance Championship: $50,000, a trophy and +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_competition);
        } else {
            Celebrity.grow(p, 0.01, 300);
            Celebrity.alert("Not This Year", "You made it to the finals but didn't take the title.", R.drawable.icon_celeb_competition);
        }
    },
    social(p: any) {
        Celebrity.active(p);
        if (Celebrity.fans(p) >= 1000 && roll(0.04)) {
            Celebrity.rep(p, -8);
            Celebrity.addFans(p, -Celebrity.fans(p) * 0.02);
            Celebrity.banner("That Post Didn't Land", "People are upset about what you posted.");
            return;
        }
        const f = Celebrity.grow(p, rnd(0.01, 0.03), 30);
        Celebrity.banner("Posted", `+${Celebrity.fansText(f)} fans.`);
    },
    talkShow(p: any) {
        done(p);
        earn(p, 5000 * Celebrity.tier(p), "Talk show fee");
        if (roll(0.1)) { Celebrity.rep(p, -10); Celebrity.alert("Awkward Interview", "You said something you really shouldn't have. Clips are everywhere.", R.drawable.icon_celeb_talkshow); return; }
        const f = Celebrity.grow(p, 0.06, 2000);
        Celebrity.alert("Great Interview", `The audience loved you. +${Celebrity.fansText(f)} fans.`, R.drawable.icon_celeb_talkshow);
    },
});

export interface CelebrityRules {
    auditionChance(p: any): number; audition(p: any): void; movie(p: any, genre?: string): void; popBoost(p: any): number; viralChance(p: any, base: number): number; chartScore(p: any): number; single(p: any): void; album(p: any): void;
    tour(p: any): void; musicVideo(p: any): void; battleChance(p: any): number; streetShow(p: any): void; battle(p: any): void; challenge(p: any): void;
    choreograph(p: any): void; championship(p: any): void; social(p: any): void; talkShow(p: any): void;
}
