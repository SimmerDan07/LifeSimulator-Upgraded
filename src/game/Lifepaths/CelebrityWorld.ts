// Celebrity Life v0.20.0 "The Fame Update": the world around a star.
//   - Headlines: a tabloid feed of everything you do (and everything that happens to you).
//   - Discography & Filmography: every song, album, movie, TV season, show, video and book has a name.
//   - Rivals (one per career) with feuds, diss tracks, dance-offs and premiere showdowns.
//   - Celebrity friends from A-list parties, collaborations, and dating a celebrity (power couples, celebrity weddings).
//   - Awards nights with a red carpet (what you wear matters) and rivals in the same category.
//   - Movie genres, your music sound, TV series with seasons.
//   - Business (merch drops, a fan club, a foundation, a memoir) and legacy (farewell tour → Legend, Hall of Fame).
//   - Young talent (talent shows, TV commercials) for kids, and milestones for the whole career.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Modifiers } from "../Managers/Modifiers";
import { NameGenerator } from "../Managers/NameGenerator";
import { Person } from "../Managers/Person";
import { Sex } from "../Enums/Sex";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { RomanticRelationshipStatus } from "../Enums/RomanticRelationshipStatus";
import { Relationships } from "../Social/Relationships";
import { Celebrity, CAREERS, TIERS, FAN_CEILING } from "./Celebrity";
import { CelebNames, MOVIE_GENRES, SOUNDS } from "./CelebNames";
import { CelebrityState, CelebRival, CelebFriend, CelebWork } from "./CelebrityState";
import { LifeActionDef } from "./Vampire";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const roll = (p: number) => Math.random() < p;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const now = (p: any) => p.calendarWeeks?.() ?? p.getAgeInWeeks();
const earn = (p: any, n: number, label: string) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.workIncome, label, null, 8, null);
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const name = (p: any) => p.getFullName();
const C = () => Celebrity;
const fans = (n: number) => Celebrity.fansText(n);

/** Points a work is worth when picking what you're "known for". */
const SCORE: Record<string, number> = { "#1": 100, "Top 10": 60, "Top 100": 20, "Didn't chart": 2, Diamond: 150, Platinum: 90, Gold: 40, "Modest seller": 10,
    Blockbuster: 140, Hit: 70, Flop: 5, Viral: 80, "Hit show": 50, "Cult favorite": 30, Cancelled: 5, Champion: 80, Bestseller: 40, "Sold out": 30 };

export const KIND_LABEL: Record<string, string> = {
    single: "Single", album: "Album", movie: "Movie", series: "TV series", show: "Stage show", video: "Music video", challenge: "Dance challenge",
    memoir: "Memoir", merch: "Merch", commercial: "TV commercial", collab: "Collab", tour: "Tour", talent: "Talent show", diss: "Diss track", title: "Title",
};

export const World = {
    // ------------------------------------------------------------------ state (v0.19 saves get the new fields here)
    normalize(s: CelebrityState): CelebrityState {
        s.news ??= []; s.works ??= []; s.rivals ??= {}; s.friends ??= []; s.milestones ??= []; s.awardShows ??= []; s.awards ??= [];
        s.merchWeek ??= -999; s.feudWins ??= 0; s.feudLosses ??= 0;
        return s;
    },

    // ------------------------------------------------------------------ headlines and works
    news(p: any, text: string) {
        const s = C().state(p);
        s.news.push({ age: p.getAgeInYears(), week: now(p), text });
        if (s.news.length > 80) s.news.splice(0, s.news.length - 80);
    },
    work(p: any, kind: string, title: string, result: string, extra?: string): CelebWork {
        const s = C().state(p);
        const w: CelebWork = { kind, title, age: p.getAgeInYears(), result, score: SCORE[result] ?? 15, extra };
        s.works.push(w);
        if (s.works.length > 300) s.works.splice(0, s.works.length - 300);
        return w;
    },
    titles(p: any): string[] { return (C().peek(p)?.works ?? []).map((w) => w.title); },
    best(p: any): CelebWork | null {
        const ws = C().peek(p)?.works ?? [];
        let b: CelebWork | null = null;
        for (const w of ws) if (b == null || w.score > b.score || (w.score === b.score && w.age > b.age)) b = w;
        return b != null && b.score >= 20 ? b : null;
    },
    /** "the #1 single "Neon Hearts"" */
    knownFor(p: any): string | null {
        const b = World.best(p);
        if (b == null) return null;
        const what = b.kind === "single" ? (b.result === "#1" ? "#1 single" : "hit single") : b.kind === "album" ? `${b.result.toLowerCase()} album` :
            b.kind === "movie" ? (b.result === "Blockbuster" ? "blockbuster" : `hit ${b.extra ? b.extra.toLowerCase() + " " : ""}movie`) :
            b.kind === "series" ? "TV series" : (KIND_LABEL[b.kind] ?? b.kind).toLowerCase();
        if (b.kind === "title") return `the ${b.title} title`;
        return `the ${what} "${b.title}"`;
    },

    // ------------------------------------------------------------------ sound
    sound(p: any = player()): string | null { return C().peek(p)?.sound ?? null; },
    soundIs(p: any, id: string): boolean { return World.sound(p) === id; },
    chooseSound(p: any) {
        const opts = SOUNDS.map((x) => [`${x.title}`, () => { C().state(p).sound = x.id; World.news(p, `${name(p)} goes ${x.title}: "this is the real me"`); }] as [string, () => void]);
        C().choice("Choose Your Sound", "What kind of artist are you?\n\n" + SOUNDS.map((x) => `${x.title}: ${x.blurb}`).join("\n"), R.drawable.icon_celeb_sound, opts);
    },

    // ------------------------------------------------------------------ rivals
    rival(p: any, career: string): CelebRival {
        const s = C().state(p);
        if (s.rivals[career] == null) {
            const female = roll(0.5);
            s.rivals[career] = { first: NameGenerator.INSTANCE.generateFirstName(female ? Sex.female : Sex.male), last: NameGenerator.INSTANCE.generateLastName(),
                female, fans: Math.round(Math.max(800, C().fans(p) * rnd(0.9, 1.6) + rnd(300, 2500))), wins: 0, losses: 0, made: now(p) };
        }
        return s.rivals[career];
    },
    rivalOf(p: any = player()): CelebRival | null { const c = C().career(p); return c ? World.rival(p, c.id) : null; },
    rivalName(r: CelebRival): string { return `${r.first} ${r.last}`; },
    weeklyRivals(p: any) {
        const s = C().state(p);
        for (const r of Object.values(s.rivals)) {
            const behind = s.fans > r.fans * 2;
            r.fans = Math.round(Math.min(FAN_CEILING * 0.9, r.fans * (1 + rnd(0.001, behind ? 0.02 : 0.009)) + rnd(5, 60)));
        }
    },
    /** A head-to-head with your rival (feud, diss track, dance-off, premiere showdown). */
    contest(p: any, how: string): boolean {
        const s = C().state(p);
        const c = C().career(p);
        const r = World.rivalOf(p);
        if (c == null || r == null) return false;
        const chance = clamp(0.5 + (C().skill(p, c.skill) - 50) / 200 + (s.fans > r.fans ? 0.08 : -0.05) + (how === "diss" && World.soundIs(p, "hiphop") ? 0.1 : 0), 0.15, 0.85);
        const rn = World.rivalName(r);
        if (roll(chance)) {
            const gain = C().addFans(p, Math.max(500, r.fans * 0.03));
            r.fans = Math.max(100, Math.round(r.fans - gain * 0.5));
            r.losses++; s.feudWins++;
            C().rep(p, -1);
            World.news(p, `${name(p)} ${how === "diss" ? "drops a diss track and" : how === "danceoff" ? "out-dances" : how === "premiere" ? "steals the premiere from" : "wins the feud with"} ${how === "diss" ? `buries ${rn}` : rn}`);
            C().alert("You Won the Feud", `The internet has decided: you beat ${rn}. +${fans(gain)} fans.`, R.drawable.icon_celeb_rival);
            return true;
        }
        const lost = Math.round(s.fans * 0.02);
        C().addFans(p, -lost);
        r.fans += lost; r.wins++; s.feudLosses++;
        C().rep(p, -3);
        World.news(p, `${rn} wins round ${r.wins + r.losses} against ${name(p)}`);
        C().alert("You Lost This Round", `${rn} came out on top. −${fans(lost)} fans, and a little pride.`, R.drawable.icon_celeb_rival);
        return false;
    },
    feud(p: any) {
        const r = World.rivalOf(p);
        if (r == null) return;
        const rn = World.rivalName(r);
        const said = CelebNames.pick(["overrated", "a one-hit wonder", "an industry plant", "all hype", "yesterday's news", "boring"]);
        C().choice("Feud!", `Your rival ${rn} told an interviewer you're "${said}". The internet wants a response.`, R.drawable.icon_celeb_rival, [
            ["Clap back", () => { World.contest(p, "feud"); World.after(p); }],
            ["Take the high road", () => { C().rep(p, 3); World.news(p, `${name(p)} stays classy as ${rn} throws shade`); World.after(p); }],
            ["Offer a collab", () => World.peace(p)],
        ]);
    },
    peace(p: any) {
        const s = C().state(p);
        const c = C().career(p);
        const r = World.rivalOf(p);
        if (c == null || r == null) return;
        const rn = World.rivalName(r);
        if (s.reputation >= 40 && roll(0.6)) {
            const g = C().addFans(p, Math.max(1000, r.fans * 0.05));
            World.addFriend(p, { name: rn, career: c.id, fans: r.fans, female: r.female });
            delete s.rivals[c.id];
            World.news(p, `Feud over! ${name(p)} and ${rn} team up`);
            C().alert("Rivals No More", `${rn} said yes. Your collab made headlines: +${fans(g)} fans, and a new friend. (A new rival will turn up soon.)`, R.drawable.icon_celeb_collab);
        } else {
            C().rep(p, -2);
            World.news(p, `${rn} laughs off ${name(p)}'s collab offer`);
            C().alert("Rejected", `${rn} turned you down in public.`, R.drawable.icon_celeb_rival);
        }
        World.after(p);
    },

    // ------------------------------------------------------------------ friends, collabs, dating
    addFriend(p: any, f: CelebFriend) {
        const s = C().state(p);
        if (s.friends.some((x) => x.name === f.name)) return;
        s.friends.push(f);
        s.friends.sort((a, b) => b.fans - a.fans);
        if (s.friends.length > 8) s.friends.length = 8;
    },
    newCeleb(p: any): CelebFriend {
        const female = roll(0.5);
        return { name: `${NameGenerator.INSTANCE.generateFirstName(female ? Sex.female : Sex.male)} ${NameGenerator.INSTANCE.generateLastName()}`,
            career: CelebNames.pick(["acting", "music", "dance", "acting", "music"]), fans: Math.round(Math.max(5000, C().fans(p) * rnd(0.4, 2.5))), female };
    },
    party(p: any) {
        C().active(p);
        if (roll(0.65)) {
            const f = World.newCeleb(p);
            World.addFriend(p, f);
            const g = C().grow(p, 0.01, 200);
            if (C().tier(p) >= 3) World.news(p, `${name(p)} spotted partying with ${f.name}`);
            C().alert("New Celebrity Friend", `You hit it off with ${f.name}, a ${CAREERS.find((c) => c.id === f.career)?.word ?? "star"} with ${fans(f.fans)} fans. +${fans(g)} fans from the photos.`, R.drawable.icon_celeb_party);
        } else {
            attr(p, 0, -2, -2);
            C().banner("A-List Party", "Nobody interesting showed up. You went home early.");
        }
    },
    bestFriend(p: any = player()): CelebFriend | null { return C().peek(p)?.friends?.[0] ?? null; },
    collab(p: any) {
        const s = C().state(p);
        const f = World.bestFriend(p);
        const c = C().career(p);
        if (f == null || c == null) return;
        C().active(p); s.yearWork++;
        const g = C().addFans(p, Math.min(f.fans * 0.04, s.fans * 0.3 + 20000) + 500);
        f.fans = Math.round(f.fans + g * 0.3);
        let title: string;
        if (c.id === "music") { title = `${CelebNames.song(World.titles(p))} (feat. ${f.name})`; World.work(p, "single", title, roll(0.4) ? "Top 10" : "Top 100", "Collab"); if (roll(0.4)) s.hits++; }
        else if (c.id === "acting") { title = CelebNames.movie(CelebNames.pick([...MOVIE_GENRES]), World.titles(p)); World.work(p, "movie", title, "Hit", `Co-starring ${f.name}`); }
        else { title = CelebNames.show(World.titles(p)); World.work(p, "show", title, "Sold out", `With ${f.name}`); }
        World.news(p, `${name(p)} and ${f.name} team up for "${title}"`);
        C().alert("Collab Out Now", `"${title}" with ${f.name} is everywhere. +${fans(g)} fans.`, R.drawable.icon_celeb_collab);
    },
    canDateCeleb(p: any): string | null {
        if (p.getAgeInYears() < 18) return "Must be at least 18";
        if (p.getFamilyState().getPartner() != null) return "You're already with someone";
        if (C().tier(p) < 3) return `Needs ${TIERS[3].name} (${fans(TIERS[3].min)} fans)`;
        return null;
    },
    dateCeleb(p: any) {
        const s = C().state(p);
        C().active(p);
        if (!roll(0.45 + C().tier(p) * 0.05)) {
            const f = World.newCeleb(p);
            World.addFriend(p, f);
            C().alert("Just Friends", `You went on a date with ${f.name}. No sparks, but you're friends now.`, R.drawable.icon_celeb_date);
            return;
        }
        const x: any = Person.INSTANCE.getPartnerForPlayer(p, CelebNames.pick([LoverPersonality.careerDriven, LoverPersonality.partyAnimal, LoverPersonality.cheerful, LoverPersonality.soulMate]));
        const career = CelebNames.pick(["acting", "music", "dance"]);
        const theirFans = Math.round(Math.max(50_000, s.fans * rnd(0.3, 1.8)));
        p.getFamilyState().date(x);
        x.setRelationshipProgress(Math.max(x.getRelationshipProgress(), 450));
        Relationships.meta(x, p).celeb = { career, fans: theirFans };
        s.partnerId = x.getId(); s.weddingNews = false;
        const g = C().addFans(p, theirFans * 0.03);
        World.news(p, `It's official: ${name(p)} is dating ${x.getFullName()}!`);
        C().alert("A Power Couple Is Born", `You're dating ${x.getFullName()}, a ${CAREERS.find((c) => c.id === career)?.word} with ${fans(theirFans)} fans. +${fans(g)} fans already. They're on your Love tab.`, R.drawable.icon_celeb_date);
    },
    celebPartner(p: any = player()): any {
        const s = C().peek(p);
        const pt = p.getFamilyState?.()?.getPartner?.();
        return s?.partnerId != null && pt != null && pt.getId() === s.partnerId && pt.getIsAlive() ? pt : null;
    },
    weeklyCouple(p: any) {
        const s = C().state(p);
        if (s.partnerId == null) return;
        const pt = World.celebPartner(p);
        if (pt == null) {
            const old = p.getFamilyState().getFamilyMembers?.();
            let who = "their celebrity partner";
            try { for (const m of Array.from(old as any) as any[]) if (m.getId?.() === s.partnerId) who = m.getFullName(); } catch { /* ignore */ }
            World.news(p, `${name(p)} and ${who}: it's over`);
            C().grow(p, 0.01, 0);
            s.partnerId = null; s.weddingNews = false;
            return;
        }
        const m = Relationships.meta(pt, p);
        if (m.celeb) {
            m.celeb.fans = Math.round(Math.min(FAN_CEILING * 0.9, m.celeb.fans * (1 + rnd(0.001, 0.006))));
            C().addFans(p, Math.min(m.celeb.fans * 0.0004, 40000));
        }
        if (!s.weddingNews && p.getRomanticRelationshipStatus() === RomanticRelationshipStatus.married) {
            s.weddingNews = true;
            const g = C().grow(p, 0.05, 2000);
            World.news(p, `Wedding of the year: ${name(p)} marries ${pt.getFullName()}`);
            C().alert("Wedding of the Year", `Your wedding to ${pt.getFullName()} is on every magazine cover. +${fans(g)} fans.`, R.drawable.icon_celeb_date);
        }
    },

    // ------------------------------------------------------------------ awards night
    ceremony(p: any, show: string, cat: string, careerId: string) {
        const s = C().state(p);
        const r = s.rivals[careerId];
        const withRival = r != null && roll(0.5);
        const rn = r ? World.rivalName(r) : "";
        const go = (look: "classic" | "bold" | "daring") => () => {
            let bonus = 0, note = "";
            if (look === "classic") { C().rep(p, 2); note = "Your classic look got polite applause."; }
            if (look === "bold") { const g = C().grow(p, 0.02, 500); bonus = 0.03; note = `Your bold look got people talking (+${fans(g)} fans).`; }
            if (look === "daring") {
                if (roll(0.5)) { const g = C().grow(p, 0.06, 1000); bonus = 0.05; note = `Best dressed of the night! +${fans(g)} fans.`; World.news(p, `${name(p)} named best dressed at the ${show}`); }
                else { C().rep(p, -5); note = "The fashion police were not kind. Worst dressed of the night."; World.news(p, `${name(p)}'s ${show} outfit: what were they thinking?`); }
            }
            const c = CAREERS.find((x) => x.id === careerId)!;
            const win = clamp(0.3 + C().skill(p, c.skill) / 300 + s.reputation / 500 + bonus + (careerId === "music" && World.soundIs(p, "rnb") ? 0.1 : 0) - (withRival && r!.fans > s.fans ? 0.05 : 0), 0.1, 0.85);
            if (roll(win)) {
                s.awards.push(`${cat} — ${show} (age ${p.getAgeInYears()})`);
                if (!s.awardShows.includes(show)) s.awardShows.push(show);
                const g = C().grow(p, 0.15, 5000);
                C().rep(p, 5);
                attr(p, 0, 15, 5);
                if (withRival) r!.losses++;
                World.news(p, `${name(p)} wins ${cat} at the ${show}${withRival ? `, beating ${rn}` : ""}`);
                C().alert("You Won!", `${note}\n\nAnd the award for ${cat} goes to… you! +${fans(g)} fans.${withRival ? ` ${rn} clapped. Barely.` : ""}`, R.drawable.icon_celeb_award);
            } else {
                C().grow(p, 0.03, 1000);
                if (withRival) { r!.wins++; World.news(p, `${rn} beats ${name(p)} to ${cat}`); }
                C().alert("So Close", `${note}\n\nYou were nominated for ${cat}, but ${withRival ? `your rival ${rn}` : "someone else"} took it home. The nomination still got you noticed.`, R.drawable.icon_celeb_award);
            }
            World.after(p);
        };
        World.news(p, `${name(p)} nominated for ${cat} at the ${show}`);
        C().choice("Awards Night", `You're nominated for ${cat} at the ${show}${withRival ? `, up against your rival ${rn}` : ""}. The red carpet is waiting. What are you wearing?`, R.drawable.icon_celeb_redcarpet, [
            ["Classic & elegant", go("classic")], ["Bold statement", go("bold")], ["Daring look", go("daring")],
        ]);
    },

    // ------------------------------------------------------------------ movies and TV
    chooseGenre(p: any) {
        C().choice("Choose a Role", "Your agent has five scripts on the table. Which one?\n\nAction: big paychecks. Drama: awards bait. Comedy: crowd-pleaser. Horror: cheap and risky. Indie: low pay, critics love it.",
            R.drawable.icon_celeb_movie, MOVIE_GENRES.map((g) => [g, () => { C().movie(p, g); World.after(p); }] as [string, () => void]));
    },
    seriesWeekly(p: any) {
        const s = C().state(p);
        if (s.series == null) return;
        if (C().career(p)?.id !== "acting") { World.news(p, `"${s.series.title}" recasts ${name(p)}'s role`); s.series = null; return; }
        const lvl = C().level(p);
        C().addFans(p, lvl * lvl * 25 + 100);
        C().active(p);
        s.series.weeksLeft--;
        if (s.series.weeksLeft > 0) return;
        const sc = C().skill(p, "acting") + rnd(-30, 40);
        const result = sc >= 90 ? "Hit show" : sc >= 45 ? "Cult favorite" : "Cancelled";
        const t = `${s.series.title} (Season ${s.series.season})`;
        World.work(p, "series", t, result);
        s.yearWork += 2;
        if (result === "Cancelled") {
            World.news(p, `"${s.series.title}" cancelled after ${s.series.season} season${s.series.season === 1 ? "" : "s"}`);
            C().alert("Series Cancelled", `"${s.series.title}" won't be back. Ratings weren't there.`, R.drawable.icon_celeb_series);
            s.series = null;
            return;
        }
        const g = C().grow(p, result === "Hit show" ? 0.08 : 0.03, 3000);
        World.news(p, `"${s.series.title}" season ${s.series.season} finale ${result === "Hit show" ? "breaks records" : "wins over critics"}`);
        const title = s.series.title, season = s.series.season;
        s.series = null;
        C().choice("Season Finale", `Season ${season} of "${title}" was a ${result.toLowerCase()} (+${fans(g)} fans). The network wants another season.`, R.drawable.icon_celeb_series, [
            ["Sign for another season", () => { C().state(p).series = { title, weeksLeft: 20, season: season + 1 }; }],
            ["Leave the show", () => { World.news(p, `${name(p)} exits "${title}"`); }],
        ]);
    },

    // ------------------------------------------------------------------ business & legacy
    merchGross(p: any): number { return Math.round(Math.min(5_000_000, C().fans(p) * 0.02 + 2000)); },
    merchReady(p: any): number { return Math.max(0, C().state(p).merchWeek + 8 - now(p)); },
    weeklyBusiness(p: any) {
        const s = C().peek(p);
        if (s == null) return;
        if (s.fanClub && s.fans > 0) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(s.fans * 0.0002) + 50), MoneyUpdateType.passiveIncome, "Fan club", null, 8, null);
        if (s.foundation) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(5000), MoneyUpdateType.expense, s.foundation, null, 8, null);
        if (s.series != null) MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.max(1, C().level(p)) * 1500), MoneyUpdateType.passiveIncome, `TV series: ${s.series.title}`, null, 8, null);
    },

    // ------------------------------------------------------------------ the week
    weekly(p: any) {
        const s = C().state(p);
        World.weeklyRivals(p);
        World.weeklyCouple(p);
        World.seriesWeekly(p);
        if (s.foundation && s.reputation < 90) s.reputation = Math.min(90, s.reputation + 1);
        const c = C().career(p);
        if (c) World.rival(p, c.id);
        World.checkMilestones(p);
    },
    perks(p: any): boolean {
        const t = C().tier(p);
        if (t >= 4 && roll(0.03)) { attr(p, 0, 4, 0); C().banner("Free Stuff", CelebNames.pick(["A designer sent you a whole wardrobe.", "A car company lent you a supercar for a month.", "A hotel comped your stay in the penthouse."])); return true; }
        if (t >= 1 && roll(0.02)) { attr(p, 0, 1, 0); C().banner("Recognized", CelebNames.pick(["A fan asked for a selfie at the grocery store.", "Someone recognized you at the gym.", "A kid asked for your autograph."])); return true; }
        return false;
    },
    /** After any choice: milestones and a UI refresh. */
    after(p: any) { World.checkMilestones(p); },

    // ------------------------------------------------------------------ milestones
    checkMilestones(p: any) {
        const s = C().state(p);
        if (!s.childStar && s.fans >= 1000 && p.getAgeInYears() < 14) s.childStar = true;
        for (const m of MILESTONES) {
            if (s.milestones.includes(m.id)) continue;
            let ok = false;
            try { ok = m.test(p, s); } catch { ok = false; }
            if (!ok) continue;
            s.milestones.push(m.id);
            C().banner(`Milestone: ${m.title}`, m.desc);
        }
    },
};

const any = (s: CelebrityState, f: (w: CelebWork) => boolean) => (s.works ?? []).some(f);
export const MILESTONES: { id: string; title: string; desc: string; test: (p: any, s: CelebrityState) => boolean }[] = [
    { id: "local", title: "Local Talent", desc: "1,000 fans.", test: (_p, s) => s.peakFans >= 1_000 },
    { id: "rising", title: "Rising Star", desc: "10,000 fans.", test: (_p, s) => s.peakFans >= 10_000 },
    { id: "famous", title: "Famous", desc: "100,000 fans.", test: (_p, s) => s.peakFans >= 100_000 },
    { id: "star", title: "Star", desc: "1 million fans.", test: (_p, s) => s.peakFans >= 1_000_000 },
    { id: "superstar", title: "Superstar", desc: "10 million fans.", test: (_p, s) => s.peakFans >= 10_000_000 },
    { id: "icon", title: "Icon", desc: "100 million fans.", test: (_p, s) => s.peakFans >= 100_000_000 },
    { id: "childStar", title: "Child Star", desc: "1,000 fans before you turned 14.", test: (_p, s) => !!s.childStar },
    { id: "bornFamous", title: "Born Famous", desc: "Started life with fans from a famous parent.", test: (_p, s) => (s.inherited ?? 0) > 0 },
    { id: "firstHit", title: "First Hit", desc: "A top 10 single.", test: (_p, s) => any(s, (w) => w.kind === "single" && (w.result === "Top 10" || w.result === "#1")) },
    { id: "numberOne", title: "Number One", desc: "A #1 single.", test: (_p, s) => any(s, (w) => w.kind === "single" && w.result === "#1") },
    { id: "diamond", title: "Diamond", desc: "A diamond album.", test: (_p, s) => any(s, (w) => w.kind === "album" && w.result === "Diamond") },
    { id: "blockbuster", title: "Blockbuster", desc: "Star in a blockbuster movie.", test: (_p, s) => any(s, (w) => w.kind === "movie" && w.result === "Blockbuster") },
    { id: "tvStar", title: "TV Star", desc: "Finish a season of a TV series.", test: (_p, s) => any(s, (w) => w.kind === "series") },
    { id: "viral", title: "Gone Viral", desc: "A music video or dance challenge went viral.", test: (_p, s) => any(s, (w) => w.result === "Viral") },
    { id: "champion", title: "World Champion", desc: "Win the World Dance Championship.", test: (_p, s) => s.awards.some((a) => /World Dance Champion/.test(a)) },
    { id: "firstAward", title: "Award Winner", desc: "Win at an awards show.", test: (_p, s) => (s.awardShows ?? []).length > 0 || s.awards.some((a) => /Awards/.test(a)) },
    { id: "grandSlam", title: "Grand Slam", desc: "Win at the Golden Star Awards, the Music Awards and the Dance Awards.", test: (_p, s) => ["Golden Star Awards", "Music Awards", "Dance Awards"].every((x) => s.awards.some((a) => a.includes(x))) },
    { id: "trophyCabinet", title: "Trophy Cabinet", desc: "10 awards and titles.", test: (_p, s) => s.awards.length >= 10 },
    { id: "tripleThreat", title: "Triple Threat", desc: "Acting, music and dance skills all 60+.", test: (_p, s) => s.acting >= 60 && s.music >= 60 && s.dance >= 60 },
    { id: "rivalBeaten", title: "Bigger Than Your Rival", desc: "More fans than your rival (100K+).", test: (_p, s) => s.fans >= 100_000 && Object.values(s.rivals ?? {}).some((r) => s.fans > r.fans) },
    { id: "feudWinner", title: "Feud Winner", desc: "Win 3 feuds.", test: (_p, s) => (s.feudWins ?? 0) >= 3 },
    { id: "powerCouple", title: "Power Couple", desc: "Marry a celebrity.", test: (_p, s) => !!s.weddingNews },
    { id: "comeback", title: "The Comeback", desc: "Come back from being cancelled.", test: (_p, s) => !!s.comeback },
    { id: "mogul", title: "Mogul", desc: "Your own brand, a fan club and a merch drop.", test: (_p, s) => !!s.brand && !!s.fanClub && any(s, (w) => w.kind === "merch") },
    { id: "philanthropist", title: "Philanthropist", desc: "Start a foundation.", test: (_p, s) => !!s.foundation },
    { id: "author", title: "Bestselling Author", desc: "Publish your memoir.", test: (_p, s) => !!s.memoir },
    { id: "walkOfFame", title: "Walk of Fame", desc: "Get your star on the Walk of Fame.", test: (_p, s) => !!s.walkOfFame },
    { id: "hallOfFame", title: "Hall of Fame", desc: "Be inducted into the Hall of Fame.", test: (_p, s) => !!s.hallOfFame },
    { id: "legend", title: "Legend", desc: "Finish a farewell tour.", test: (_p, s) => !!s.legend },
];

// ======================================================================== activities
const st = () => Celebrity.state();
const go = (d: LifeActionDef): LifeActionDef => { if (d.cost == null && d.actionTitle == null) d.actionTitle = () => "Go"; return d; };
const inCareer = (id: string) => (p: any) => {
    if (Celebrity.career(p)?.id === id) return null;
    const t = CAREERS.find((c) => c.id === id)!.title.toLowerCase();
    return `Start ${/^[aeiou]/.test(t) ? "an" : "a"} ${t} career first`;
};
const atLevel = (id: string, lvl: number, title: string) => (p: any) => inCareer(id)(p) ?? (Celebrity.level(p) >= lvl ? null : `Needs ${title}`);
const atTier = (t: number) => (p: any) => (Celebrity.tier(p) >= t ? null : `Needs ${TIERS[t].name} (${Celebrity.fansText(TIERS[t].min)} fans)`);
const both = (...fs: ((p: any) => string | null)[]) => (p: any) => { for (const f of fs) { const r = f(p); if (r) return r; } return null; };
const age = (lo: number, hi = 999) => (p: any) => (p.getAgeInYears() < lo ? `Must be at least ${lo}` : p.getAgeInYears() > hi ? `Only until ${hi}` : null);
const once = (k: keyof CelebrityState, msg: string) => (p: any) => (Celebrity.state(p)[k] ? msg : null);
const rivalLock = (p: any) => (World.rivalOf(p) ? null : "No rival yet");

/** Extra career rows (shown under each career's section). */
export const ACTING_PLUS: LifeActionDef[] = [
    go({ id: "series", title: () => (st().series ? `On TV: ${st().series.title}` : "Join a TV Series"), image: R.drawable.icon_celeb_series,
        lock: both(atLevel("acting", 5, "Supporting Actor"), (p) => (Celebrity.state(p).series ? `Season ${Celebrity.state(p).series.season}: ${Celebrity.state(p).series.weeksLeft} weeks left` : null)),
        note: () => "20-week seasons: weekly pay and fans. Hit shows get renewed.\n",
        run: (p) => { const s = Celebrity.state(p); s.series = { title: CelebNames.series(World.titles(p)), weeksLeft: 21, season: 1 }; /* the signing week counts */ World.news(p, `${p.getFullName()} cast in new series "${s.series.title}"`); Celebrity.active(p); } }),
    go({ id: "premiere", title: "Premiere Showdown", image: R.drawable.icon_celeb_rival, lock: both(inCareer("acting"), atTier(2), rivalLock),
        note: () => "Upstage your rival at a movie premiere.\n", run: (p) => { Celebrity.active(p); World.contest(p, "premiere"); } }),
];
export const MUSIC_PLUS: LifeActionDef[] = [
    { id: "sound", title: () => (st().sound ? `Your Sound: ${SOUNDS.find((x) => x.id === st().sound)?.title}` : "Choose Your Sound"), image: R.drawable.icon_celeb_sound, instant: true,
        lock: inCareer("music"), actionTitle: () => (st().sound ? "Change" : "Choose"),
        note: () => (st().sound ? `${SOUNDS.find((x) => x.id === st().sound)?.blurb}\n` : "Pop, Hip-Hop, Rock, R&B, Country or Electronic. Each has a perk.\n"),
        run: (p) => World.chooseSound(p) },
    { id: "diss", title: "Drop a Diss Track", image: R.drawable.icon_celeb_rival, cost: 5000, lock: both(inCareer("music"), atTier(2), rivalLock),
        note: () => "Call out your rival in a song. Win and take their fans.\n",
        run: (p) => { Celebrity.active(p); const won = World.contest(p, "diss"); World.work(p, "diss", CelebNames.song(World.titles(p)), won ? "Top 10" : "Top 100", `Aimed at ${World.rivalName(World.rivalOf(p)!)}`); } },
];
export const DANCE_PLUS: LifeActionDef[] = [
    go({ id: "danceoff", title: "Dance-Off vs Your Rival", image: R.drawable.icon_celeb_rival, lock: both(inCareer("dance"), atTier(1), rivalLock),
        note: () => "Settle it on the floor, in front of everyone.\n", run: (p) => { Celebrity.active(p); World.contest(p, "danceoff"); } }),
];
export const CIRCLE: LifeActionDef[] = [
    { id: "party", title: "Go to an A-List Party", image: R.drawable.icon_celeb_party, cost: 2000, mods: [-1, 4, -1], lock: both(age(18), atTier(2)),
        note: () => "Meet other celebrities (about 2 in 3 parties).\n", run: (p) => World.party(p) },
    go({ id: "collab", title: () => `Collaborate${World.bestFriend() ? ` with ${World.bestFriend()!.name}` : ""}`, image: R.drawable.icon_celeb_collab,
        lock: (p) => (Celebrity.career(p) == null ? "Needs a celebrity career" : World.bestFriend(p) ? null : "Make a celebrity friend first"),
        note: () => (World.bestFriend() ? `A song, movie or show with ${World.bestFriend()!.name} (${Celebrity.fansText(World.bestFriend()!.fans)} fans).\n` : "Team up with your most famous friend.\n"),
        run: (p) => World.collab(p) }),
    go({ id: "dateCeleb", title: "Date a Celebrity", image: R.drawable.icon_celeb_date, mods: [0, 3, 0], lock: (p) => World.canDateCeleb(p),
        note: () => "Find someone as famous as you. Power couples share the spotlight (and the paparazzi).\n", run: (p) => World.dateCeleb(p) }),
];
export const BUSINESS: LifeActionDef[] = [
    { id: "merch", title: "Drop Merch", image: R.drawable.icon_celeb_merch, cost: 5000, lock: both(atTier(1), (p) => (World.merchReady(p) > 0 ? `Next drop in ${World.merchReady(p)} weeks` : null)),
        note: () => `Sales about ${Celebrity.money(World.merchGross(player()))}. Once every 8 weeks.\n`,
        run: (p) => { const s = Celebrity.state(p); s.merchWeek = now(p); const g = Math.round(World.merchGross(p) * rnd(0.7, 1.3)); earn(p, g, "Merch sales"); const t = CelebNames.merch(); World.work(p, "merch", t, "Sold out", Celebrity.money(g)); Celebrity.grow(p, 0.01, 50); Celebrity.active(p); if (Celebrity.tier(p) >= 3) World.news(p, `${p.getFullName()}'s ${t} sells out in minutes`); Celebrity.alert("Merch Sold Out", `Your ${t} sold out: ${Celebrity.money(g)}.`, R.drawable.icon_celeb_merch); } },
    { id: "fanClub", title: () => (st().fanClub ? "Official Fan Club (running)" : "Start an Official Fan Club"), image: R.drawable.icon_celeb_fanclub, cost: 10000, lock: both(atTier(2), once("fanClub", "You have one")),
        note: () => `Members pay every week (about ${Celebrity.money(Celebrity.fans(player()) * 0.0002 + 50)}), and loyal fans fade half as fast.\n`,
        run: (p) => { Celebrity.state(p).fanClub = true; World.news(p, `${p.getFullName()} launches official fan club`); } },
    { id: "brand", title: "Launch Your Own Brand", image: R.drawable.icon_celeb_brand, cost: 250000, lock: both(atTier(4), (p) => (Celebrity.state(p).brand ? "You already have one" : null)),
        note: () => (st().brand ? `Your ${st().brand} earns ${Celebrity.money(Celebrity.brandIncome(player()))} a week.\n` : `Earns 0.1% of your fans in dollars every week (about ${Celebrity.money(Celebrity.fans(player()) * 0.001)}).\n`),
        run: (p) => { const s = Celebrity.state(p); s.brand = CelebNames.pick(["fragrance", "clothing line", "sneaker line", "makeup line", "energy drink", "headphone line"]); Celebrity.grow(p, 0.03, 0); World.news(p, `${p.getFullName()} launches a ${s.brand}`); Celebrity.alert("Brand Launched", `Your ${s.brand} is in stores everywhere.`, R.drawable.icon_celeb_brand); Celebrity.active(p); } },
    { id: "foundation", title: () => st().foundation ?? "Start a Foundation", image: R.drawable.icon_celeb_foundation, cost: 1_000_000, lock: both(atTier(4), once("foundation", "Running")),
        note: () => (st().foundation ? "$5,000 a week. +1 reputation a week (up to 90), and scandals hurt less.\n" : "$1M to start, $5,000 a week. +1 reputation every week (up to 90); scandals hurt less.\n"),
        run: (p) => { const s = Celebrity.state(p); const cause = CelebNames.cause(); s.foundation = `${p.getLastName()} Foundation`; Celebrity.rep(p, 10); World.news(p, `${p.getFullName()} gives $1M to start the ${s.foundation} for ${cause}`); Celebrity.alert("Foundation Started", `The ${s.foundation} will support ${cause}.`, R.drawable.icon_celeb_foundation); } },
    go({ id: "memoir", title: () => (st().memoir ? `Memoir: ${st().memoir}` : "Write Your Memoir"), image: R.drawable.icon_celeb_memoir, mods: [0, 2, 3], lock: both(age(30), atTier(3), once("memoir", "Published")),
        note: () => `A book deal worth about ${Celebrity.money(Math.min(3_000_000, Celebrity.fans(player()) * 0.02 + 50000))}.\n`,
        run: (p) => { const s = Celebrity.state(p); s.memoir = CelebNames.memoir(p.getFullName()); const adv = Math.round(Math.min(3_000_000, s.fans * 0.02 + 50000)); earn(p, adv, "Book deal"); const g = Celebrity.grow(p, 0.05, 1000); World.work(p, "memoir", s.memoir, "Bestseller"); World.news(p, `${p.getFullName()}'s memoir "${s.memoir}" tops the bestseller list`); Celebrity.alert("Bestseller", `"${s.memoir}" is a bestseller: ${Celebrity.money(adv)} and +${Celebrity.fansText(g)} fans.`, R.drawable.icon_celeb_memoir); Celebrity.active(p); } }),
];
export const LEGACY: LifeActionDef[] = [
    { id: "farewell", title: () => (st().legend ? "Legend" : "Farewell Tour"), image: R.drawable.icon_celeb_farewell, cost: 50000, mods: [-10, 10, 0], lock: both(age(50), atTier(3), once("legend", "You're a Legend")),
        note: () => (st().legend ? "Your fans never fade.\n" : "One last tour. Afterwards you're a Legend: your fans never fade, royalties keep coming.\n"),
        run: (p) => { const s = Celebrity.state(p); s.legend = true; const g = Math.round(Celebrity.tourGross(p) * 2); earn(p, g, "Farewell tour"); const f = Celebrity.grow(p, 0.1, 5000); World.work(p, "tour", `${p.getFullName()}: The Farewell Tour`, "Sold out"); World.news(p, `${p.getFullName()} says goodbye with a sold-out farewell tour`); Celebrity.alert("A Legend", `The farewell tour grossed ${Celebrity.money(g)} (+${Celebrity.fansText(f)} fans). Whatever you do now, your fans will never forget you.`, R.drawable.icon_celeb_farewell); } },
    { id: "hallOfFame", title: "Hall of Fame Induction", image: R.drawable.icon_celeb_halloffame, cost: 20000, lock: both(age(45), once("hallOfFame", "Inducted"), (p) => (Celebrity.tier(p) >= 6 || Celebrity.state(p).awards.length >= 5 ? null : "Needs Icon, or 5 awards")),
        note: () => "Join the greats.\n",
        run: (p) => { const s = Celebrity.state(p); s.hallOfFame = true; s.awards.push(`Hall of Fame (age ${p.getAgeInYears()})`); Celebrity.rep(p, 10); Celebrity.grow(p, 0.03, 0); World.news(p, `${p.getFullName()} inducted into the Hall of Fame`); Celebrity.alert("Hall of Fame", "Your name joins the greats.", R.drawable.icon_celeb_halloffame); } },
];
export const YOUNG: LifeActionDef[] = [
    go({ id: "talentShow", title: "Enter a Talent Show", image: R.drawable.icon_celeb_talent, mods: [0, 2, 0], lock: age(6, 17),
        note: () => "Sing, dance or act. Win and the whole town knows your name.\n",
        run: (p) => {
            const s = Celebrity.state(p);
            const best = Math.max(Celebrity.skill(p, "acting"), Celebrity.skill(p, "music"), Celebrity.skill(p, "dance"));
            if (roll(clamp(0.25 + best / 150, 0.1, 0.85))) {
                earn(p, 500, "Talent show prize");
                const g = Celebrity.grow(p, 0.05, 300 + best * 10);
                World.work(p, "talent", `${CelebNames.pick(["Spring", "Summer", "Winter", "County", "School"])} Talent Show`, "Winner");
                World.news(p, `${p.getAgeInYears()}-year-old ${p.getFullName()} wins the talent show`);
                Celebrity.alert("You Won the Talent Show!", `$500 and +${Celebrity.fansText(g)} fans.`, R.drawable.icon_celeb_talent);
            } else { attr(p, 0, -3, 0); Celebrity.alert("Not This Time", "You didn't win, but you were great.", R.drawable.icon_celeb_talent); }
            Celebrity.active(p); s.yearWork++;
        } }),
    go({ id: "commercial", title: "TV Commercial Audition", image: R.drawable.icon_celeb_commercial, lock: age(6, 13),
        note: () => "Child actors start somewhere. Pays well and gets your face out there.\n",
        run: (p) => {
            if (roll(clamp(0.35 + Celebrity.skill(p, "acting") / 150, 0.1, 0.9))) {
                const pay = Math.round(rnd(1000, 3000));
                earn(p, pay, "Commercial");
                const brand = CelebNames.pick(["cereal", "toy store", "juice box", "sneaker", "theme park", "pizza"]);
                const g = Celebrity.grow(p, 0.04, 500);
                Celebrity.train(p, "acting", 2);
                World.work(p, "commercial", `${brand[0].toUpperCase() + brand.slice(1)} commercial`, "Booked");
                World.news(p, `Who's the kid in the new ${brand} commercial? It's ${p.getFullName()}`);
                Celebrity.alert("You Booked It!", `You're in a ${brand} commercial: ${Celebrity.money(pay)} and +${Celebrity.fansText(g)} fans.`, R.drawable.icon_celeb_commercial);
            } else Celebrity.alert("Not This Time", "They went with another kid.", R.drawable.icon_celeb_commercial);
            Celebrity.active(p);
        } }),
];
