// v0.26.0 Social Media (the Social tab).
//
// From 13 you can open an account. Four platforms, each good for different posts:
//   Snapgram (photos: selfies, couples, kids, pets, seasons), ClipTok (short videos: trends, highlights),
//   Chirper (text: hot takes, work news) and VidTube (long videos: hobbies, live streams).
// Posting is instant (3 posts a week); Go Live takes the week. Followers grow faster the more you have, posts can go
// viral (or backfire), trolls and brand deals turn up, and from 10K followers you earn ad revenue every week.
//
// Ties to the rest of the game:
// - Careers: politicians, content creators, fashion designers, film directors and celebrity chefs need followers to
//   be promoted; media careers gain followers just by working.
// - Celebrity Life: fans follow you (followers drift toward half your fans), and posts win a few fans back.
// - Vampires: cameras don't see you. Selfies come out empty and videos glitch (+suspicion) unless you have Glamour.
//   Faking your death means a new account (the old one becomes a memorial page); collapsing leaves it dormant.
// - Seasons: a Seasonal Post does better, and holidays bring extra followers.
// - No posting in jail (phones are contraband), while lying collapsed, or during a Digital Detox.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { LifeMoments } from "../Managers/LifeMoments";
import { Seasons } from "../Managers/Seasons";
import { Hobbies, HOBBIES } from "../Managers/Hobbies";
import { Vampire, LifeActionDef, LifeActions } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { Relationships } from "./Relationships";
import { SideHustle } from "../Enums/SideHustle";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";

export type Platform = "snapgram" | "cliptok" | "chirper" | "vidtube";
export const PLATFORMS: { id: Platform; title: string; image: any; blurb: string }[] = [
    { id: "snapgram", title: "Snapgram", image: R.drawable.icon_social_snapgram, blurb: "Photos: selfies, couples, kids, pets and seasons" },
    { id: "cliptok", title: "ClipTok", image: R.drawable.icon_social_cliptok, blurb: "Short videos: trends and highlights. Goes viral the most" },
    { id: "chirper", title: "Chirper", image: R.drawable.icon_social_chirper, blurb: "Text: hot takes and work news. Politicians and journalists live here" },
    { id: "vidtube", title: "VidTube", image: R.drawable.icon_social_vidtube, blurb: "Long videos: hobbies and live streams. Your YouTube Star skill helps" },
];
export const MIN_AGE = 13;
export const POSTS_PER_WEEK = 3;
export const AD_REVENUE_FROM = 10_000;
export const VERIFY_AT = 25_000;
export const SPONSOR_AT = 10_000;
export const LIVE_AT = 1_000;
export const BUY_PRICE = 1_000;
export const BUY_AMOUNT = 10_000;

export interface SocialState {
    handle: string | null;
    f: Record<Platform, number>;
    posts: number;            // this week
    total: number;            // all time
    lastPostWeek: number;
    verified: boolean;
    detox: boolean;
    bought: number;           // fake followers still on the books
    boughtWeeks: number;
    sponsoredThisWeek: boolean;
    earned: number;
    peak: number;
    feed: string[];
    former: { handle: string; followers: number }[];
}

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const money = (n: number) => ExtensionsKt.numberDisplayString(BigInteger.valueOf(Math.round(n)), true);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const roll = (x: number) => Math.random() < x;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const cash = (p: any) => Number(p.getMoneyState().getCash().toString());
const earn = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.misc, null, null, 12, null);
const alive = (x: any) => x != null && (x.getIsAlive?.() ?? true);
const weeks = (p: any): number => { try { return p.calendarWeeks(); } catch { return 0; } };
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const susp = (p: any, n: number) => { const s = Vampire.peek(p); if (s?.isVampire) s.suspicion = Math.max(0, Math.min(100, s.suspicion + n)); };

export const SocialMedia = {
    num(n: number): string { n = Math.round(n); return n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : `${n}`; },
    peek(p: any = player()): SocialState | null { return p?.social ?? null; },
    state(p: any = player()): SocialState {
        const s = p.social ?? (p.social = {});
        s.handle ??= null;
        s.f ??= { snapgram: 0, cliptok: 0, chirper: 0, vidtube: 0 };
        for (const k of PLATFORMS) s.f[k.id] ??= 0;
        s.posts ??= 0; s.total ??= 0; s.lastPostWeek ??= 0; s.verified ??= false; s.detox ??= false;
        s.bought ??= 0; s.boughtWeeks ??= 0; s.sponsoredThisWeek ??= false; s.earned ??= 0; s.peak ??= 0; s.feed ??= []; s.former ??= [];
        return s;
    },
    hasAccount(p: any = player()): boolean { return !!SocialMedia.peek(p)?.handle; },
    followers(p: any = player()): number {
        const s = SocialMedia.peek(p);
        if (s?.handle == null) return 0;
        return Math.round(PLATFORMS.reduce((a, k) => a + (s.f[k.id] ?? 0), 0));
    },
    platformOf(p: any, id: Platform): number { return Math.round(SocialMedia.peek(p)?.f?.[id] ?? 0); },
    /** Adds followers to one platform (negative takes them away). Returns what changed. */
    addFollowers(p: any, n: number, where: Platform = "snapgram"): number {
        if (!SocialMedia.hasAccount(p)) return 0;
        const s = SocialMedia.state(p);
        const before = s.f[where];
        s.f[where] = Math.max(0, before + n);
        s.peak = Math.max(s.peak, SocialMedia.followers(p));
        return s.f[where] - before;
    },
    /** Takes a share of followers from every platform. */
    lose(p: any, share: number): number {
        const s = SocialMedia.state(p);
        let lost = 0;
        for (const k of PLATFORMS) { const d = Math.round(s.f[k.id] * share); s.f[k.id] -= d; lost += d; }
        return lost;
    },
    log(p: any, line: string) { const s = SocialMedia.state(p); s.feed = [line, ...s.feed].slice(0, 8); },

    // ------------------------------------------------------------------ rules
    /** Why you can't use social media right now (null = you can). */
    blocked(p: any = player()): string | null {
        if (p.getAgeInYears() < MIN_AGE) return `From age ${MIN_AGE}`;
        try { if (p.getCrimeState().getIsInJail()) return "Phones are contraband in jail"; } catch { /* ignore */ }
        if (Vampire.isInTorpor(p)) return "You're lying collapsed somewhere";
        return null;
    },
    postBlock(p: any = player()): string | null {
        const b = SocialMedia.blocked(p);
        if (b) return b;
        const s = SocialMedia.peek(p);
        if (s?.handle == null) return "Create an account first";
        if (s.detox) return "You're on a Digital Detox";
        if (s.posts >= POSTS_PER_WEEK) return `You've posted ${POSTS_PER_WEEK} times this week`;
        return null;
    },
    /** How many followers a normal post wins (before luck). */
    reach(p: any, quality = 1): number {
        const f = SocialMedia.followers(p);
        const s = SocialMedia.state(p);
        const fame = 1 + Celebrity.tier(p) * 0.25;
        return (20 + Math.sqrt(f) * 2) * quality * fame * (s.verified ? 1.15 : 1);
    },
    /** A camera post for a vampire without Glamour: the video glitches whenever you're in frame. */
    invisible(p: any): boolean { return !Vampire.photogenic(p); },
    post(p: any, where: Platform, quality: number, line: string, opts: { viral?: number; backlash?: number } = {}): string {
        const s = SocialMedia.state(p);
        s.posts++; s.total++; s.lastPostWeek = weeks(p);
        let gain = SocialMedia.reach(p, quality) * rnd(0.5, 1.5);
        let note = "";
        if (opts.backlash && roll(opts.backlash)) {
            const lost = SocialMedia.lose(p, 0.03);
            attr(p, 0, -3, -2);
            SocialMedia.log(p, `${line} — backlash (−${SocialMedia.num(lost)})`);
            return `It didn't land. The replies are brutal and you lost ${SocialMedia.num(lost)} followers. (−3 happiness, −2 sanity)`;
        }
        if (opts.viral && roll(opts.viral)) {
            gain = gain * 4 + SocialMedia.followers(p) * 0.03 + 500;
            note = " It went VIRAL! 🔥";
            attr(p, 0, 4, 0);
        }
        const got = SocialMedia.addFollowers(p, gain, where);
        if (Celebrity.peek(p) != null && (Celebrity.peek(p)!.peakFans ?? 0) > 0) Celebrity.addFans(p, got * 0.2);
        SocialMedia.log(p, `${line} (+${SocialMedia.num(got)})`);
        return `+${SocialMedia.num(got)} followers on ${PLATFORMS.find((x) => x.id === where)!.title}.${note}`;
    },
    result(title: string, msg: string, image: any) { LifeMoments.result(title, msg, image); },

    // ------------------------------------------------------------------ account
    createAccount(p: any) {
        const s = SocialMedia.state(p);
        const base = `${p.getFirstName()}${p.getLastName?.() ?? ""}`.toLowerCase().replace(/[^a-z]/g, "");
        s.handle = `@${base}${Math.floor(rnd(1, 99))}`;
        s.f = { snapgram: 5, cliptok: 0, chirper: 0, vidtube: 0 };   // your friends follow you straight away
        SocialMedia.log(p, "Joined Snapgram, ClipTok, Chirper and VidTube");
        SocialMedia.result("Welcome Online", `You're ${s.handle}. A few friends followed you straight away. Post up to ${POSTS_PER_WEEK} times a week; it doesn't take your week.`, R.drawable.icon_social_account);
    },
    buyFollowers(p: any) {
        const s = SocialMedia.state(p);
        s.bought += BUY_AMOUNT; s.boughtWeeks = 0;
        SocialMedia.addFollowers(p, BUY_AMOUNT, "snapgram");
        SocialMedia.result("Followers Bought", `${SocialMedia.num(BUY_AMOUNT)} "followers" arrived overnight. They never like anything. If anyone notices, they'll all vanish and take some real ones with them.`, R.drawable.icon_social_buy);
    },

    // ------------------------------------------------------------------ the week
    adRevenue(p: any): number {
        const f = SocialMedia.followers(p) - (SocialMedia.peek(p)?.bought ?? 0);   // bots don't watch ads
        return f >= AD_REVENUE_FROM ? Math.round(f * 0.0015) : 0;
    },
    collectWeeklyValues(p: any) {
        const s = SocialMedia.peek(p);
        if (s?.handle == null || SocialMedia.blocked(p) != null) return;
        const a = p.getAttributeState();
        if (s.detox) { a.setDeltaValue(new Modifiers(0, 2, 3), "Digital Detox"); return; }
        const ad = SocialMedia.adRevenue(p);
        if (ad > 0) { MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(ad), MoneyUpdateType.passiveIncome, "Social media ads", null, 8, null); s.earned += ad; }
        if (s.posts >= POSTS_PER_WEEK) a.setDeltaValue(new Modifiers(0, 0, -1), "Doomscrolling");
    },
    afterWeek(p: any) {
        const s = SocialMedia.peek(p);
        if (s?.handle == null) return;
        s.posts = 0; s.sponsoredThisWeek = false;
        if (SocialMedia.blocked(p) != null) return;
        const f = SocialMedia.followers(p);
        // quiet accounts fade; detox costs a few
        if (s.detox) SocialMedia.lose(p, 0.005);
        else if (weeks(p) - s.lastPostWeek > 12 && f > 50) SocialMedia.lose(p, 0.01);
        // fans follow famous people
        const fans = Celebrity.fans(p);
        if (fans >= 1000 && f < fans * 0.5) SocialMedia.addFollowers(p, (fans * 0.5 - f) * 0.02, "snapgram");
        // the bots get found out
        if (s.bought > 0) {
            s.boughtWeeks++;
            if (roll(0.06)) {
                const fake = Math.min(s.bought, s.f.snapgram);
                s.f.snapgram -= fake; s.bought = 0;
                const lost = SocialMedia.lose(p, 0.05);
                attr(p, 0, -5, -3);
                SocialMedia.log(p, "Exposed for buying followers");
                LifeMoments.result("Exposed!", `Someone noticed your followers are bots. Snapgram wiped ${SocialMedia.num(fake)} fake accounts, and ${SocialMedia.num(lost)} real people unfollowed you in disgust.`, R.drawable.icon_social_buy);
                return;
            }
            if (s.boughtWeeks >= 48) s.bought = 0;   // after a year they blend in
        }
        if (!s.detox && f >= 100 && roll(0.04) && LifeMoments.canHappen(p)) SocialMedia.event(p);
    },

    // ------------------------------------------------------------------ events
    event(p: any) {
        const f = SocialMedia.followers(p);
        const list: (() => void)[] = [
            () => LifeMoments.ask("Trolls", `A pile-on: hundreds of strangers are in your replies telling you you're wrong about everything.`, R.drawable.icon_post_hottake, [
                ["Block and move on", () => { attr(p, 0, 0, -1); return "Block, block, block. Peace restored."; }],
                ["Clap back", () => { if (roll(0.5)) { const g = SocialMedia.addFollowers(p, f * 0.05 + 100, "chirper"); return `Your reply was so good it went viral. (+${SocialMedia.num(g)} followers)`; } attr(p, 0, -4, -4); return "It got worse. Much worse. (−4 happiness, −4 sanity)"; }],
                ["Log off for the day", () => { attr(p, 0, 1, 2); return "You touched grass. It helped."; }],
            ]),
            () => LifeMoments.ask("Collab Invite", "A bigger creator wants to make a video with you.", R.drawable.icon_social_cliptok, [
                ["Do it", () => { const g = SocialMedia.addFollowers(p, SocialMedia.reach(p, 4), "cliptok"); attr(p, 0, 3, 0); return `Their fans liked you. (+${SocialMedia.num(g)} followers)`; }],
                ["Not my vibe", () => "You passed."],
            ]),
            () => { const g = SocialMedia.addFollowers(p, SocialMedia.reach(p, 2), "snapgram"); attr(p, 0, 3, 0); LifeMoments.result("A Meme of You", `Someone turned an old photo of you into a meme. It's everywhere. (+${SocialMedia.num(g)} followers)`, R.drawable.icon_post_selfie); },
        ];
        if (f >= 5000) list.push(() => {
            const pay = Math.round(Math.min(100000, f * 0.02));
            LifeMoments.ask("Brand Deal", `A brand wants you to promote their energy drink for ${money(pay)}.`, R.drawable.icon_post_sponsored, [
                ["Take the money", () => { earn(p, pay); SocialMedia.state(p).earned += pay; SocialMedia.lose(p, 0.01); return `${money(pay)} richer. A few followers rolled their eyes.`; }],
                ["Keep it real", () => { SocialMedia.addFollowers(p, f * 0.01, "snapgram"); attr(p, 0, 2, 0); return "Your followers respect that."; }],
            ]);
        });
        if (f >= 50000) list.push(() => LifeMoments.ask("Old Post Resurfaces", "Someone dug up something embarrassing you posted years ago.", R.drawable.icon_social_feed, [
            ["Apologise", () => { SocialMedia.lose(p, 0.01); attr(p, 0, -2, 0); return "A sincere apology. Most people moved on."; }],
            ["Ignore it", () => { if (roll(0.5)) return "It blew over in a day."; const l = SocialMedia.lose(p, 0.06); attr(p, 0, -4, -3); return `It didn't blow over. (−${SocialMedia.num(l)} followers)`; }],
        ]));
        if (Vampire.isVampire(p) && !Vampire.photogenic(p)) list.push(() => { susp(p, 4); LifeMoments.result("Conspiracy Thread", `A viral thread asks why ${SocialMedia.peek(p)!.handle} never appears in a single tagged photo. (+4 suspicion)`, R.drawable.icon_social_chirper); });
        pick(list)();
    },

    // ------------------------------------------------------------------ vampire crossovers
    fakeDeath(p: any, oldName: string): string {
        const s = SocialMedia.peek(p);
        if (s?.handle == null) return "";
        const f = SocialMedia.followers(p);
        s.former = [...s.former, { handle: s.handle, followers: f }];
        const old = s.handle;
        s.handle = null; s.f = { snapgram: 0, cliptok: 0, chirper: 0, vidtube: 0 }; s.bought = 0; s.verified = false; s.feed = []; s.posts = 0;
        return f >= 50 ? `\n\n${old} is a memorial page now: ${SocialMedia.num(f)} followers left candles in the comments for ${oldName}. You'll need a new account (Social tab).` : "";
    },
    collapseStart(p: any) { const s = SocialMedia.peek(p); if (s) (s as any).beforeCollapse = SocialMedia.followers(p); },
    collapseEnd(p: any, years: number): string {
        const s = SocialMedia.peek(p);
        if (s?.handle == null) return "";
        const before = (s as any).beforeCollapse ?? SocialMedia.followers(p);
        delete (s as any).beforeCollapse;
        SocialMedia.lose(p, Math.min(0.9, 0.15 * years / 5 + 0.3));
        s.lastPostWeek = weeks(p); s.detox = false;
        const now = SocialMedia.followers(p);
        return before >= 100 ? `\n\nYour accounts sat silent for ${years} years (${SocialMedia.num(before)} → ${SocialMedia.num(now)} followers).` : "";
    },

    // ------------------------------------------------------------------ the Social tab
    cells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel("Social Media")];
        const s = SocialMedia.peek(p);
        const blocked = SocialMedia.blocked(p);
        if (s?.handle == null) {
            out.push(info(R.drawable.icon_social_account, "Social Media",
                "Share your life on Snapgram, ClipTok, Chirper and VidTube. Followers help some careers (politicians, content creators, fashion designers, film directors, chefs), turn into ad money from 10K, and bring brand deals." +
                (s?.former?.length ? `\n\nYour old account${s.former.length > 1 ? "s" : ""} (${s.former.map((x) => `${x.handle}, ${SocialMedia.num(x.followers)}`).join("; ")}) belonged to someone who's dead now.` : "")));
            for (const c of LifeActions.cells(ACCOUNT_START, p)) out.push(c);
            return out;
        }
        const f = SocialMedia.followers(p);
        const ad = SocialMedia.adRevenue(p);
        out.push(info(R.drawable.icon_social_account, `${s.handle}${s.verified ? " ✔" : ""}`,
            `${SocialMedia.num(f)} follower${Math.round(f) === 1 ? "" : "s"} · ${s.total} post${s.total === 1 ? "" : "s"} · ${s.posts}/${POSTS_PER_WEEK} posts this week` +
            (s.detox ? "\nOn a Digital Detox: +2 happiness, +3 sanity a week; you lose 0.5% of your followers a week." : "") +
            (ad > 0 ? `\nAd revenue: ${money(ad)} a week` : `\nAd revenue starts at ${SocialMedia.num(AD_REVENUE_FROM)} followers.`) +
            (s.earned > 0 ? ` · Earned so far: ${money(s.earned)}` : "") +
            (blocked ? `\n${blocked}.` : "")));
        if (!s.detox) out.push(new MeterViewModel("Posts this week", s.posts, POSTS_PER_WEEK, "blue", s.posts >= POSTS_PER_WEEK ? "That's enough screen time for one week (−1 sanity)." : "Posting doesn't take your week."));
        out.push(new HeaderTitleViewModel("Post"));
        for (const c of LifeActions.cells(POSTS, p)) out.push(c);
        out.push(new HeaderTitleViewModel("Platforms"));
        for (const k of PLATFORMS) out.push(info(k.image, k.title, `${SocialMedia.num(s.f[k.id])} follower${Math.round(s.f[k.id]) === 1 ? "" : "s"}\n${k.blurb}.`));
        out.push(new HeaderTitleViewModel("Account"));
        for (const c of LifeActions.cells(ACCOUNT, p)) out.push(c);
        if (s.feed.length) {
            out.push(new HeaderTitleViewModel("Your Feed"));
            out.push(info(R.drawable.icon_social_feed, "Recent posts", s.feed.join("\n")));
        }
        return out;
    },
};

// ---------------------------------------------------------------- posts
const best = (p: any) => {
    let b: { id: string; title: string; skill: number } | null = null;
    for (const h of HOBBIES) { const sk = Hobbies.skill(h.id, p); if (sk >= 10 && (b == null || sk > b.skill)) b = { id: h.id, title: h.title, skill: sk }; }
    return b;
};
const partnerOf = (p: any) => { try { const x = p.getFamilyState().getPartner(); return alive(x) ? x : null; } catch { return null; } };
const kidsOf = (p: any): any[] => { try { return (Array.from(p.getFamilyState().getChildren() as any) as any[]).filter((k) => alive(k) && !k.getNotYetBorn?.()); } catch { return []; } };
const petsOf = (p: any): any[] => { try { return (Array.from(p.getFamilyState().getPets() as any) as any[]).filter(alive); } catch { return []; } };
const jobOf = (p: any) => { try { return p.getJobState().getCurrentJobState(); } catch { return null; } };
const youtube = (p: any): number => { try { return p.getSideHustleState().getState(SideHustle.youTubeStar).getSkillLevel().getRaw(); } catch { return 0; } };
const done = (title: string, image: any) => (msg: string) => SocialMedia.result(title, msg, image);
const postLock = (extra?: (p: any) => string | null) => (p: any) => SocialMedia.postBlock(p) ?? extra?.(p) ?? null;
const camera = "Vampires don't show up on camera (Glamour fixes that).\n";

export const POSTS: LifeActionDef[] = [
    { id: "selfie", title: "Post a Selfie", image: R.drawable.icon_post_selfie, instant: true, actionTitle: () => "Post",
        lock: postLock(),
        note: () => "Snapgram. Easy likes.\n" + (SocialMedia.invisible(player()) ? camera : ""),
        run: (p) => {
            if (SocialMedia.invisible(p)) {
                const s = SocialMedia.state(p); s.posts++; s.total++; s.lastPostWeek = weeks(p); susp(p, 5);
                SocialMedia.log(p, "Posted a selfie of… an empty room");
                return done("Post a Selfie", R.drawable.icon_post_selfie)("The photo shows an empty room. The comments are all \"where are you??\" (+5 suspicion)");
            }
            done("Post a Selfie", R.drawable.icon_post_selfie)(SocialMedia.post(p, "snapgram", 1, pick(["New selfie", "Golden hour selfie", "Mirror selfie", "No-filter selfie"])));
        } },
    { id: "hottake", title: "Share a Hot Take", image: R.drawable.icon_post_hottake, instant: true, actionTitle: () => "Post",
        lock: postLock(),
        note: () => "Chirper. 20% chance it goes viral, 25% chance of backlash. Politicians and journalists do better.\n",
        run: (p) => {
            const d = jobOf(p)?.getType?.()?.def?.();
            const q = d && (d.id === "politician" || d.id === "journalist") ? 1.6 : 1.2;
            done("Share a Hot Take", R.drawable.icon_post_hottake)(SocialMedia.post(p, "chirper", q, pick(["Pineapple belongs on pizza", "Hot take: Mondays are fine", "Unpopular opinion thread", "The ending was actually good"]), { viral: 0.2, backlash: 0.25 }));
        } },
    { id: "trend", title: "Join a Trend", image: R.drawable.icon_post_trend, instant: true, actionTitle: () => "Post",
        lock: postLock(),
        note: () => "ClipTok. The best chance to go viral (12%); young creators do better.\n" + (SocialMedia.invisible(player()) ? camera : ""),
        run: (p) => {
            const q = (p.getAgeInYears() <= 30 ? 1.3 : 0.9) * (SocialMedia.invisible(p) ? 0.5 : 1);
            if (SocialMedia.invisible(p)) susp(p, 3);
            attr(p, 0, 2, 0);
            done("Join a Trend", R.drawable.icon_post_trend)(SocialMedia.post(p, "cliptok", q, pick(["Did the new dance trend", "Tried the viral recipe", "Lip-synced the sound of the week"]), { viral: 0.12 }) +
                (SocialMedia.invisible(p) ? " Viewers say the video glitches whenever you're in frame. (+3 suspicion)" : ""));
        } },
    { id: "hobby", title: () => { const b = best(player()); return b ? `Show Off Your ${b.title}` : "Show Off a Hobby"; }, image: R.drawable.icon_post_hobby, instant: true, actionTitle: () => "Post",
        lock: postLock((p) => (best(p) ? null : "Get a hobby to skill 10 first (Leisure tab)")),
        note: () => "VidTube. The better you are, the more people watch. Your YouTube Star skill helps.\n",
        run: (p) => {
            const b = best(p)!;
            const q = 0.5 + b.skill / 50 + youtube(p) * 0.15;
            done("Show Off Your Hobby", R.drawable.icon_post_hobby)(SocialMedia.post(p, "vidtube", q, `${b.title} video`));
        } },
    { id: "work", title: "Post About Work", image: R.drawable.icon_post_work, instant: true, actionTitle: () => "Post",
        lock: postLock((p) => (jobOf(p) ? null : "You don't have a job")),
        note: () => "Chirper. Higher jobs get more attention; media careers even more.\n",
        run: (p) => {
            const j = jobOf(p), d = j.getType().def?.();
            const media = d && ["journalist", "photographer", "fashionDesigner", "filmDirector", "chef", "contentCreator", "politician", "proAthlete", "astronaut"].includes(d.id);
            const q = (1 + j.getLevel() * 0.1) * (media ? 1.5 : 1);
            done("Post About Work", R.drawable.icon_post_work)(SocialMedia.post(p, "chirper", q, `A day as a ${j.getJobTitle()}`));
        } },
    { id: "season", title: () => `Seasonal Post (${Seasons.label(player())})`, image: R.drawable.icon_post_season, instant: true, actionTitle: () => "Post",
        lock: postLock(),
        note: () => "Snapgram. Everyone loves a seasonal post.\n",
        run: (p) => {
            const line = { winter: "Snow day vibes ❄️", spring: "Spring flowers 🌸", summer: "Summer days ☀️", fall: "Cosy fall mornings 🍂" }[Seasons.season(p)];
            done("Seasonal Post", R.drawable.icon_post_season)(SocialMedia.post(p, "snapgram", 1.3, line));
        } },
    { id: "couple", title: () => { const x = partnerOf(player()); return x ? `Couple Photo with ${x.getFirstName()}` : "Couple Photo"; }, image: R.drawable.icon_post_couple, instant: true, actionTitle: () => "Post",
        lock: postLock((p) => (partnerOf(p) ? null : "You're single")),
        note: () => "Snapgram. +10 relationship.\n",
        run: (p) => {
            const x = partnerOf(p);
            x.setRelationshipProgress(Math.min(1000, x.getRelationshipProgress() + 10));
            const ghost = SocialMedia.invisible(p) || (Vampire.isTurned(x) && !Vampire.has("glamour", p));
            if (ghost) susp(p, 3);
            done("Couple Photo", R.drawable.icon_post_couple)(SocialMedia.post(p, "snapgram", ghost ? 0.6 : 1.2, `Me and ${x.getFirstName()} ❤️`) +
                (ghost ? " The comments ask why only one of you is in the picture. (+3 suspicion)" : ` ${x.getFirstName()} loved it.`));
        } },
    { id: "kid", title: "Proud Parent Post", image: R.drawable.icon_post_kid, instant: true, actionTitle: () => "Post",
        lock: postLock((p) => (kidsOf(p).length ? null : "You don't have children")),
        note: () => "Snapgram. Little kids love it; teenagers really don't.\n",
        run: (p) => {
            const k = pick(kidsOf(p));
            const teen = k.getAgeInYears() >= 13 && k.getAgeInYears() < 20;
            k.setRelationshipProgress(Math.max(0, Math.min(1000, k.getRelationshipProgress() + (teen ? -10 : 5))));
            done("Proud Parent Post", R.drawable.icon_post_kid)(SocialMedia.post(p, "snapgram", 1.3, `So proud of ${k.getFirstName()}`) +
                (teen ? ` ${k.getFirstName()}: "Delete that. NOW." (−10 relationship)` : ""));
        } },
    { id: "pet", title: () => { const x = petsOf(player())[0]; return x ? `Pet Pic of ${x.getFirstName()}` : "Pet Pic"; }, image: R.drawable.icon_post_pet, instant: true, actionTitle: () => "Post",
        lock: postLock((p) => (petsOf(p).length ? null : "You don't have a pet")),
        note: () => "Snapgram. Pets always win the internet.\n",
        run: (p) => { const x = pick(petsOf(p)); done("Pet Pic", R.drawable.icon_post_pet)(SocialMedia.post(p, "snapgram", 1.6, `${x.getFirstName()} being adorable`, { viral: 0.08 })); } },
    { id: "live", title: "Go Live", image: R.drawable.icon_post_live, actionTitle: () => "Stream",
        lock: postLock((p) => (SocialMedia.followers(p) >= LIVE_AT ? null : `Needs ${SocialMedia.num(LIVE_AT)} followers`)),
        note: () => "VidTube. A whole week of streaming: viewers donate and you gain followers. Takes the week.\n" + (SocialMedia.invisible(player()) ? camera : ""),
        mods: [0, 2, -2],
        run: (p) => {
            const inv = SocialMedia.invisible(p);
            const tips = Math.round(SocialMedia.followers(p) * rnd(0.003, 0.008) * (inv ? 0.3 : 1));
            earn(p, tips); SocialMedia.state(p).earned += tips;
            if (inv) susp(p, 4);
            const msg = SocialMedia.post(p, "vidtube", 2 * (inv ? 0.4 : 1), "Went live", { viral: 0.05 });
            done("Go Live", R.drawable.icon_post_live)(`${msg} Viewers donated ${money(tips)}.` + (inv ? " Chat kept asking why the camera shows an empty chair. (+4 suspicion)" : ""));
        } },
    { id: "sponsored", title: "Sponsored Post", image: R.drawable.icon_post_sponsored, instant: true, actionTitle: () => "Post",
        lock: postLock((p) => (SocialMedia.followers(p) < SPONSOR_AT ? `Needs ${SocialMedia.num(SPONSOR_AT)} followers` : SocialMedia.state(p).sponsoredThisWeek ? "One sponsored post a week" : null)),
        note: () => { const f = SocialMedia.followers(player()); return `Paid: about ${money(Math.min(50000, f * 0.01))}. Some followers find it cringe (−0.5%). One a week.\n`; },
        run: (p) => {
            const s = SocialMedia.state(p);
            const pay = Math.round(Math.min(50000, SocialMedia.followers(p) * 0.01));
            s.posts++; s.total++; s.lastPostWeek = weeks(p); s.sponsoredThisWeek = true; s.earned += pay;
            earn(p, pay);
            const lost = SocialMedia.lose(p, 0.005);
            SocialMedia.log(p, `#ad (−${SocialMedia.num(lost)})`);
            done("Sponsored Post", R.drawable.icon_post_sponsored)(`You earned ${money(pay)}. ${SocialMedia.num(lost)} followers unfollowed.`);
        } },
];

export const ACCOUNT_START: LifeActionDef[] = [
    { id: "create", title: "Create an Account", image: R.drawable.icon_social_account, instant: true, actionTitle: () => "Sign Up",
        lock: (p) => SocialMedia.blocked(p),
        note: () => `Free. From age ${MIN_AGE}.\n`, run: (p) => SocialMedia.createAccount(p) },
];
export const ACCOUNT: LifeActionDef[] = [
    { id: "detox", title: () => (SocialMedia.state(player()).detox ? "End Your Digital Detox" : "Digital Detox"), image: R.drawable.icon_social_detox, instant: true,
        actionTitle: () => (SocialMedia.state(player()).detox ? "Log Back In" : "Start"),
        lock: (p) => SocialMedia.blocked(p),
        note: () => "No posting. +2 happiness and +3 sanity a week, but you lose 0.5% of your followers a week.\n",
        run: (p) => { const s = SocialMedia.state(p); s.detox = !s.detox; SocialMedia.log(p, s.detox ? "Started a digital detox" : "Back online"); } },
    { id: "verify", title: "Get Verified", image: R.drawable.icon_social_verified, instant: true, actionTitle: () => "Apply",
        show: (p) => !SocialMedia.state(p).verified,
        lock: (p) => SocialMedia.blocked(p) ?? (SocialMedia.followers(p) - SocialMedia.state(p).bought < VERIFY_AT ? `Needs ${SocialMedia.num(VERIFY_AT)} real followers` : null),
        note: () => "A blue tick: +15% followers from every post.\n",
        run: (p) => { SocialMedia.state(p).verified = true; SocialMedia.log(p, "Got verified ✔"); attr(p, 0, 5, 0); } },
    { id: "buy", title: "Buy Followers", image: R.drawable.icon_social_buy, cost: BUY_PRICE, instant: true, actionTitle: () => "Buy",
        lock: (p) => SocialMedia.blocked(p) ?? (SocialMedia.state(p).bought > 0 ? "You already have bots on your account" : null),
        note: () => `${SocialMedia.num(BUY_AMOUNT)} fake followers. They count for promotions, but bots don't pay ads, and every week there's a 6% chance you're exposed (they vanish and real followers leave). After a year they blend in.\n`,
        run: (p) => SocialMedia.buyFollowers(p) },
];
void cash; void Relationships;
