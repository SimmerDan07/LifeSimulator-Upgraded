// Lifepaths › Celebrity Life (v0.19.0; v0.20.0 "The Fame Update"): the screen behind the star in the Lifepaths menu,
// plus its sub-screens (Headlines, Discography & Filmography, Milestones).
import { ArrayList, R } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { Paging } from "../Models/Paging";
import { Relationships } from "../Social/Relationships";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { LifeActions, LifeActionDef } from "./Vampire";
import { Celebrity, CAREERS, TIERS, ACTING, MUSIC, DANCE, FAME, TEAM, WALK_OF_FAME } from "./Celebrity";
import { World, MILESTONES, KIND_LABEL, ACTING_PLUS, MUSIC_PLUS, DANCE_PLUS, CIRCLE, BUSINESS, LEGACY, YOUNG } from "./CelebrityWorld";

const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const note = (id: string, s: string) => new SingleLabelCellViewModel(id, new TextLabelViewModel(s, null, false, false, null, null, 62, null));
const openRow = (image: any, title: string, body: string, key: string) => new ActionCellSingleViewModel(image, title, text(body),
    new ButtonViewModel("Open", null, true, false, false, false, false, { invoke: () => { Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null); return null; } }), null, null);

/** Built on demand: these lists come from modules that import each other. */
const ACTIVITIES = (): Record<string, { title: string; defs: LifeActionDef[] }> => ({
    acting: { title: "Acting", defs: [...ACTING, ...ACTING_PLUS] },
    music: { title: "Music", defs: [...MUSIC, ...MUSIC_PLUS] },
    dance: { title: "Dance", defs: [...DANCE, ...DANCE_PLUS] },
});
const KIND_IMAGE: Record<string, any> = {
    single: R.drawable.icon_celeb_single, album: R.drawable.icon_celeb_album, movie: R.drawable.icon_celeb_movie, series: R.drawable.icon_celeb_series,
    show: R.drawable.icon_celeb_choreo, video: R.drawable.icon_celeb_musicvideo, challenge: R.drawable.icon_celeb_viral, memoir: R.drawable.icon_celeb_memoir,
    merch: R.drawable.icon_celeb_merch, commercial: R.drawable.icon_celeb_commercial, tour: R.drawable.icon_celeb_tour, talent: R.drawable.icon_celeb_talent,
    diss: R.drawable.icon_celeb_rival, title: R.drawable.icon_celeb_competition,
};
const KIND_ORDER = ["single", "album", "diss", "video", "tour", "movie", "series", "commercial", "show", "challenge", "title", "talent", "memoir", "merch"];
const KIND_PLURAL: Record<string, string> = { single: "Singles", album: "Albums", diss: "Diss Tracks", video: "Music Videos", tour: "Tours", movie: "Movies", series: "TV Series",
    commercial: "Commercials", show: "Stage Shows", challenge: "Dance Challenges", title: "Titles", talent: "Talent Shows", memoir: "Books", merch: "Merch Drops" };

export const CelebrityScreen = {
    content(p: any, out: ArrayList<BaseViewModel>) {
        const s = Celebrity.state(p);
        const t = Celebrity.tier(p);
        const c = Celebrity.career(p);
        const money = Celebrity.money;

        // ---------------------------------------------------------------- status
        const job = c ? `${c.title} career: ${p.getJobState().getCurrentJobState().getJobTitle()}` : "No celebrity career yet: pick one below.";
        const known = World.knownFor(p);
        const extras = [
            known ? `Known for ${known}.` : null,
            s.legend ? "A Legend: your fans never fade." : null,
            s.cancelled ? "You're cancelled: fans barely grow until your reputation is back to 35." : null,
            s.inherited > 0 ? `Born famous: ${Celebrity.fansText(s.inherited)} fans came with your family name.` : null,
        ].filter(Boolean);
        out.add(info(Celebrity.image, TIERS[t].name, `${Celebrity.fansText(s.fans)} fans (peak ${Celebrity.fansText(s.peakFans)}).\n${job}${extras.length ? "\n" + extras.join("\n") : ""}`));
        const next = TIERS[t + 1];
        const lo = TIERS[t].min;
        out.add(new MeterViewModel("Fans", next ? s.fans - lo : 1, next ? next.min - lo : 1, "gold",
            next ? `Next: ${next.name} at ${Celebrity.fansText(next.min)} fans. ${s.legend ? "As a Legend, your fans never fade." : "Fans fade if you go more than two weeks without working or doing something public."}`
                : "The very top. Nobody is more famous than you.",
            next ? `${Celebrity.fansText(s.fans)} / ${Celebrity.fansText(next.min)}` : Celebrity.fansText(s.fans)));
        out.add(new MeterViewModel("Reputation", s.reputation, 100, s.reputation < 25 ? "red" : "green",
            s.cancelled ? "Cancelled. Charity galas, meet & greets and good work bring it back." : s.reputation < 25 ? "Low: fans grow slower. At 10 or less you're cancelled." : s.reputation > 75 ? "Beloved: fans grow faster." : "Scandals lower it; charity and fans raise it."));
        const costs = Celebrity.weeklyCosts(p).reduce((a, x) => a + x.amount, 0) + (s.foundation ? 5000 : 0);
        const roy = Celebrity.royalties(p), brand = Celebrity.brandIncome(p), club = s.fanClub ? Math.round(s.fans * 0.0002) + 50 : 0;
        const tv = s.series ? Math.max(1, Celebrity.level(p)) * 1500 : 0;
        if (costs || roy || brand || club || tv) {
            const parts = [roy ? `royalties +${money(roy)}` : null, brand ? `${s.brand} +${money(brand)}` : null, club ? `fan club +${money(club)}` : null,
                tv ? `TV series +${money(tv)}` : null, costs ? `team & foundation −${money(costs)}` : null].filter(Boolean);
            out.add(note("CelebWeekly", `Every week: ${parts.join(", ")}.`));
        }

        // ---------------------------------------------------------------- headlines
        out.add(new HeaderTitleViewModel("Headlines"));
        const latest = s.news.slice(-3).reverse();
        if (!latest.length) out.add(note("CelebNoNews", "Nobody's writing about you yet. Give them something to talk about."));
        latest.forEach((h, i) => out.add(info(R.drawable.icon_celeb_news, h.text, `Age ${h.age}`)));
        if (s.news.length > 3) out.add(openRow(R.drawable.icon_celeb_news, "All Headlines", `${s.news.length} stories about you.`, "celebrity-news"));

        // ---------------------------------------------------------------- rival
        const r = World.rivalOf(p);
        if (r != null && c != null) {
            out.add(new HeaderTitleViewModel("Your Rival"));
            const total = Math.max(1, s.fans + r.fans);
            out.add(info(R.drawable.icon_celeb_rival, World.rivalName(r),
                `Another ${c.word} after the same spotlight. ${Celebrity.fansText(r.fans)} fans.\nHead to head: you ${r.losses} – ${r.wins} them.`));
            out.add(new MeterViewModel(`You vs ${r.first}`, s.fans, total, "gold",
                s.fans > r.fans ? "You're ahead. Keep it that way." : "They're ahead. Feuds, diss tracks and dance-offs can change that.",
                `${Celebrity.fansText(s.fans)} vs ${Celebrity.fansText(r.fans)}`));
        }

        // ---------------------------------------------------------------- careers
        out.add(new HeaderTitleViewModel("Careers"));
        const ordered = [...CAREERS].sort((a, b) => (a === c ? -1 : b === c ? 1 : 0));
        for (const k of ordered) out.add(p.getJobState().getState(k.job()).getViewModel());
        out.add(note("CelebCareerRules",
            "These careers are only found here. Acting starts as an Extra (Theater degree from Theater Ensemble). Music starts as a Street Performer (Music & Production degree from Recording Artist). " +
            "Dance starts as a Street Dancer (Theater degree from Dance Captain). The top jobs also need fans: work hard and get noticed. Your Work buttons work your celebrity job too."));
        out.add(note("CelebSkills", `Skills · Acting ${Celebrity.skill(p, "acting")} · Music ${Celebrity.skill(p, "music")} · Dance ${Celebrity.skill(p, "dance")}  (degrees add 15)`));

        // ---------------------------------------------------------------- young talent
        if (p.getAgeInYears() < 18) {
            out.add(new HeaderTitleViewModel("Young Talent"));
            for (const cell of LifeActions.cells(YOUNG, p)) out.add(cell);
        }

        // ---------------------------------------------------------------- activities (your career first)
        const order = c ? [c.id, ...CAREERS.map((x) => x.id).filter((x) => x !== c.id)] : CAREERS.map((x) => x.id);
        for (const id of order) {
            const a = ACTIVITIES()[id];
            out.add(new HeaderTitleViewModel(a.title));
            for (const cell of LifeActions.cells(a.defs, p)) out.add(cell);
        }
        out.add(new HeaderTitleViewModel("Fame"));
        for (const cell of LifeActions.cells(FAME, p)) out.add(cell);

        // ---------------------------------------------------------------- celebrity circle
        out.add(new HeaderTitleViewModel("Celebrity Circle"));
        const pt = World.celebPartner(p);
        if (pt != null) {
            const m = Relationships.meta(pt, p).celeb;
            out.add(info(R.drawable.icon_celeb_date, `${pt.getFullName()} (your partner)`,
                `A famous ${CAREERS.find((x) => x.id === m?.career)?.word ?? "star"} with ${Celebrity.fansText(m?.fans ?? 0)} fans. ${s.weddingNews ? "Married: the power couple everyone talks about." : "The paparazzi follow you both."}`));
        }
        for (const cell of LifeActions.cells(CIRCLE, p)) out.add(cell);
        for (const f of s.friends) out.add(info(R.drawable.icon_celeb_friend, f.name, `${CAREERS.find((x) => x.id === f.career)?.title ?? "Star"} · ${Celebrity.fansText(f.fans)} fans`));

        // ---------------------------------------------------------------- business, team, legacy
        out.add(new HeaderTitleViewModel("Business"));
        for (const cell of LifeActions.cells(BUSINESS, p)) out.add(cell);
        out.add(new HeaderTitleViewModel("Your Team"));
        for (const cell of LifeActions.cells(TEAM, p)) out.add(cell);
        out.add(new HeaderTitleViewModel("Legacy"));
        for (const cell of LifeActions.cells([...WALK_OF_FAME, ...LEGACY], p)) out.add(cell);

        // ---------------------------------------------------------------- awards & records
        out.add(new HeaderTitleViewModel(`Awards & Records${s.awards.length ? ` · ${s.awards.length}` : ""}`));
        const rec = [
            s.roles && `${s.roles} role${s.roles === 1 ? "" : "s"}`, s.movies && `${s.movies} movie${s.movies === 1 ? "" : "s"}`,
            s.singles && `${s.singles} single${s.singles === 1 ? "" : "s"}`, s.albums && `${s.albums} album${s.albums === 1 ? "" : "s"}`,
            s.hits && `${s.hits} hit${s.hits === 1 ? "" : "s"}`, s.tours && `${s.tours} tour${s.tours === 1 ? "" : "s"}`,
            s.battlesWon && `${s.battlesWon} dance battle${s.battlesWon === 1 ? "" : "s"} won`, s.feudWins && `${s.feudWins} feud${s.feudWins === 1 ? "" : "s"} won`,
        ].filter(Boolean);
        out.add(note("CelebRecords", rec.length ? rec.join(" · ") : "No records yet."));
        out.add(openRow(R.drawable.icon_celeb_works, "Discography & Filmography", s.works.length ? `${s.works.length} works.${known ? ` Known for ${known}.` : ""}` : "Everything you make will be listed here.", "celebrity-works"));
        out.add(openRow(R.drawable.icon_celeb_milestones, "Milestones", `${s.milestones.length} of ${MILESTONES.length} reached.`, "celebrity-milestones"));
        if (!s.awards.length) out.add(note("CelebNoAwards", "No awards yet. Once you're a Rising Star, a busy year in your career can earn you a nomination."));
        s.awards.forEach((a) => out.add(info(/Walk of Fame/.test(a) ? R.drawable.icon_celeb_walkoffame : /Hall of Fame/.test(a) ? R.drawable.icon_celeb_halloffame : R.drawable.icon_celeb_award,
            a.replace(/ \(age \d+\)$/, ""), (a.match(/\((age \d+)\)$/)?.[1] ?? "").replace("age", "Age"))));
    },

    /** Headlines, newest first. */
    news(p: any, out: ArrayList<BaseViewModel>, header: ArrayList<BaseViewModel>) {
        const s = Celebrity.state(p);
        const all = s.news.slice().reverse();
        const pg = Paging.slice(all, "celebNews", 40);
        if (pg.pages > 1) out.add(Paging.pager("celebNews", pg.page, pg.pages, `Stories ${pg.from}–${pg.to} of ${all.length}`, GenericListType.lifepath));
        if (!all.length) out.add(note("CelebNoNews", "No headlines yet."));
        let age = -1;
        for (const h of pg.items) {
            if (h.age !== age) { age = h.age; out.add(new HeaderTitleViewModel(`Age ${age}`)); }
            out.add(info(R.drawable.icon_celeb_news, h.text, ""));
        }
    },
    /** Discography & Filmography, grouped by kind, newest first. */
    works(p: any, out: ArrayList<BaseViewModel>) {
        const s = Celebrity.state(p);
        const known = World.best(p);
        if (known) out.add(info(KIND_IMAGE[known.kind] ?? Celebrity.image, `Known for "${known.title}"`, `${KIND_LABEL[known.kind] ?? known.kind} · ${known.result} · age ${known.age}`));
        if (!s.works.length) out.add(note("CelebNoWorks", "Nothing yet. Record a single, star in a movie, choreograph a show…"));
        for (const k of KIND_ORDER) {
            const ws = s.works.filter((w) => w.kind === k).reverse();
            if (!ws.length) continue;
            out.add(new HeaderTitleViewModel(`${KIND_PLURAL[k]} · ${ws.length}`));
            for (const w of ws.slice(0, 60)) out.add(info(KIND_IMAGE[k] ?? Celebrity.image, w.title, [w.result, w.extra, `age ${w.age}`].filter(Boolean).join(" · ")));
            if (ws.length > 60) out.add(note("CelebMore" + k, `…and ${ws.length - 60} older.`));
        }
    },
    milestones(p: any, out: ArrayList<BaseViewModel>) {
        const s = Celebrity.state(p);
        out.add(note("CelebMilestoneCount", `${s.milestones.length} of ${MILESTONES.length} reached.`));
        for (const m of MILESTONES) {
            const ok = s.milestones.includes(m.id);
            out.add(info(ok ? R.drawable.icon_celeb_award : R.drawable.locked, m.title, `${m.desc}${ok ? "\nReached ✓" : ""}`));
        }
    },
};
