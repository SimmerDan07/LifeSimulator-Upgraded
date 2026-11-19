// v0.26.0 "The Career Update": the rules for the 40 new careers (data in CareerData.ts).
//
// - Seasons: some careers earn more (or less) by season — lifeguards in summer, ski instructors in winter,
//   accountants in tax season (spring, which also costs them 2 sanity a week).
// - Applying: some careers have an age range (pro athletes start by 30, astronauts by 50) or need you fit
//   (firefighters 60 health, astronauts 70, pro athletes 75). Drop below that for 4 weeks and you lose the job.
// - Promotions: some need social media followers (politicians, content creators, fashion designers, film directors,
//   celebrity chefs), and three need a hobby (game developers: Gaming, journalists: Writing, chefs: Cooking).
// - Pro athletes retire at 38 and can go straight into coaching as a Personal Trainer.
// - Pilots and flight attendants fly for half price (vacations and travel cost 50% less).
// - Vampires: night jobs (bartender) never see the sun; outdoor day jobs burn twice as much.
// - Each career group has its own on-the-job moments.
// - Career Center: the Work tab lists the 8 groups; each opens a screen with its careers.
import { BigInteger, R } from "../runtime";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { LifeMoments } from "../Managers/LifeMoments";
import { Seasons } from "../Managers/Seasons";
import { Hobbies, HOBBIES } from "../Managers/Hobbies";
import { Job } from "../Enums/Job";
import { Leisure } from "../Enums/Leisure";
import { Vampire } from "../Lifepaths/Vampire";
import { SocialMedia } from "../Social/SocialMedia";
import { CAREERS, CAREER_CATEGORIES, CAREER_BY_ID, CareerDef, ORIGINAL_JOB_CATEGORY, CLEAN_RECORD_JOBS } from "./CareerData";
import { World } from "../World/World";
import { COUNTRY_BY_ID } from "../World/WorldData";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const roll = (x: number) => Math.random() < x;
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const num = (n: number) => (n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : `${n}`);
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);

export const ATHLETE_RETIRE_AGE = 38;
export const LOW_HEALTH_WEEKS = 4;
const ANIMAL = new Set(["veterinarian", "zookeeper", "marineBiologist"]);

export const Careers = {
    def(job: any): CareerDef | null { try { return job?.def?.() ?? null; } catch { return null; } },
    isNew(job: any): boolean { return Careers.def(job) != null; },
    job(id: string): Job { return (Job as any)[id]; },
    current(p: any = player()): CareerDef | null { try { return Careers.def(p.getJobState().getCurrentJob()); } catch { return null; } },
    state(p: any): { lowHealth: number; shown: Record<string, string> } {
        const s = p.careers ?? (p.careers = {});
        s.lowHealth ??= 0; s.shown ??= {};
        return s;
    },

    // ------------------------------------------------------------------ seasons and pay
    seasonMultiplier(job: any, p: any = player()): number { return Careers.def(job)?.season?.[Seasons.season(p)] ?? 1; },
    /** The whole pay multiplier for a week of work in this career (season only; Night Owl is in Vampire.onWork). */
    payMultiplier(job: any, p: any = player()): number { return Careers.seasonMultiplier(job, p); },
    seasonText(job: any, p: any = player()): string | null {
        const d = Careers.def(job);
        if (d?.season == null) return null;
        const m = Careers.seasonMultiplier(job, p);
        const now = m === 1 ? "normal pay" : m > 1 ? `+${Math.round((m - 1) * 100)}% pay` : `−${Math.round((1 - m) * 100)}% pay`;
        return `${d.seasonNote ?? ""} Now (${Seasons.label(p)}): ${now}.`.trim();
    },

    // ------------------------------------------------------------------ applying
    /** v0.27.0: every career in a Career Center group (new ones first, then the original game's). */
    jobsIn(cat: string): Job[] {
        return [...CAREERS.filter((c) => c.category === cat).map((c) => Careers.job(c.id)),
            ...Object.entries(ORIGINAL_JOB_CATEGORY).filter(([, c]) => c === cat).map(([id]) => Careers.job(id))].filter((j) => j != null);
    },
    categoryOf(job: any): string | null { return Careers.def(job)?.category ?? ORIGINAL_JOB_CATEGORY[job?.name?.()] ?? null; },
    /** Set by Crime: why a criminal record stops you (null = it doesn't). */
    recordBlock: (_p: any, _job: any): string | null => null,
    /** Why you can't apply for this career right now, or null. */
    applyBlock(job: any, p: any = player()): string | null {
        const isCurrent = (() => { try { return p.getJobState().getCurrentJob() === job; } catch { return false; } })();
        if (!isCurrent) {
            try { if (p.getCrimeState().getIsInJail()) return "Not while you're in prison"; } catch { /* ignore */ }
            const local = World.localJobCountries(job);
            if (local.length && !local.includes(p.getCountry().name())) return `Only in ${local.map((c) => COUNTRY_BY_ID[c]?.name ?? c).join(", ")}`;
            if (CLEAN_RECORD_JOBS.has(job?.name?.())) { const r = Careers.recordBlock(p, job); if (r) return r; }
        }
        const d = Careers.def(job);
        if (d == null) return null;
        if (!isCurrent && d.langs && World.foreignLanguages(p).length < d.langs[0]) return `Needs ${d.langs[0]} foreign language${d.langs[0] === 1 ? "" : "s"} (you speak ${World.foreignLanguages(p).length})`;
        const age = p.getAgeInYears();
        if (d.minAge != null && age < d.minAge) return `From age ${d.minAge}`;
        if (d.maxAge != null && age > d.maxAge && p.getJobState().getCurrentJob() !== job) return `Only hires people up to age ${d.maxAge}`;
        if (d.minHealth != null && p.getAttributeState().getHealth() < d.minHealth) return `Needs ${d.minHealth} health to pass the fitness test`;
        return null;
    },

    // ------------------------------------------------------------------ promotions
    /** Why a promotion to `level` (1-based) is blocked by followers or a hobby (null = it isn't). */
    promotionBlock(job: any, level: number, p: any = player()): string | null {
        const d = Careers.def(job);
        if (d == null) return null;
        const langs = d.langs?.[level - 1] ?? 0;
        if (langs > 0 && World.foreignLanguages(p).length < langs) return `${langs} foreign languages (you speak ${World.foreignLanguages(p).length}; learn more in the Education tab)`;
        const need = d.followers?.[level - 1] ?? 0;
        if (need > 0 && SocialMedia.followers(p) < need) return `${num(need)} social media followers (you have ${num(SocialMedia.followers(p))}${SocialMedia.hasAccount(p) ? "" : "; open an account in the Social tab"})`;
        if (d.hobby && level >= d.hobby.from) {
            const h = HOBBIES.find((x) => x.id === d.hobby!.id);
            const have = Math.floor(Hobbies.skill(d.hobby.id, p));
            if (have < d.hobby.skill) return `${h?.title ?? d.hobby.id} skill ${d.hobby.skill} (you have ${have}; practise it in the Leisure tab)`;
        }
        return null;
    },
    blocked(job: any, level: number, p: any = player()) {
        const why = Careers.promotionBlock(job, level, p);
        if (why == null) return;
        const s = Careers.state(p), key = `${job.name()}:${level}`;
        if (s.shown.promo === key) return;
        s.shown.promo = key;
        alert("Promotion on Hold", `Your boss is ready to promote you to ${job.getJobTitles()[level - 1]}, but first you need ${why}.`, job.getImageId());
    },
    /** Extra promotion progress for a week of work (Hypnotic Gaze). */
    progressBonus(_job: any, p: any = player()): number { return Vampire.promotionBonus(p); },

    // ------------------------------------------------------------------ a week of work
    onWork(p: any, job: any, level: number) {
        const d = Careers.def(job);
        if (d == null) return;
        const s = Seasons.season(p);
        if (d.id === "accountant" && s === "spring") attr(p, 0, 0, -2);
        if (ANIMAL.has(d.id) && Vampire.isVampire(p) && Vampire.has("beastTongue", p)) attr(p, 0, 2, 0);
        // media careers grow your following just by doing the job
        const fans: Record<string, number> = { contentCreator: 40, journalist: 15, photographer: 10, fashionDesigner: 12, filmDirector: 15, politician: 20, chef: 6, proAthlete: 25 };
        if (fans[d.id] && SocialMedia.hasAccount(p)) SocialMedia.addFollowers(p, fans[d.id] * level * level * (0.6 + Math.random() * 0.8), d.id === "contentCreator" ? "vidtube" : "snapgram");
        if (roll(0.04)) Careers.moment(p, d, level);
    },
    /** Called once a week after it ends. */
    afterWeek(p: any) {
        const d = Careers.current(p);
        const st = Careers.state(p);
        if (d == null) { st.lowHealth = 0; return; }
        if (Relationships_away(p)) return;
        const job = Careers.job(d.id);
        if (d.minHealth != null && !Vampire.isVampire(p)) {
            st.lowHealth = p.getAttributeState().getHealth() < d.minHealth ? st.lowHealth + 1 : 0;
            if (st.lowHealth >= LOW_HEALTH_WEEKS) {
                st.lowHealth = 0;
                p.getJobState().setCurrentJob(null);
                alert("Failed the Fitness Test", `As ${ExtensionsKt.aOrAn(d.name.toLowerCase())} you need ${d.minHealth} health. You've been below that for a month, so they let you go. Get healthy and you can apply again.`, job.getImageId());
                return;
            }
        }
        if (d.id === "proAthlete" && p.getAgeInYears() >= ATHLETE_RETIRE_AGE && !Vampire.isVampire(p)) Careers.athleteRetires(p);
    },
    athleteRetires(p: any) {
        const js = p.getJobState(), was = js.getCurrentJobState()?.getJobTitle?.() ?? "Athlete";
        js.setCurrentJob(null);
        const trainer = Careers.job("personalTrainer");
        const ask = () => {
            LifeMoments.ask("Hanging Up Your Boots", `At ${p.getAgeInYears()} your body can't keep up any more. You retire from pro sport as ${ExtensionsKt.aOrAn(was)}. What next?`, Careers.job("proAthlete").getImageId(), [
                ["Coach (Personal Trainer)", () => {
                    const s = js.getState(trainer);
                    if (s.getLevel() < 3) s.setLevel(3);
                    js.switchJob(trainer);
                    return `Your name opens doors: you start as ${ExtensionsKt.aOrAn(s.getJobTitle())}.`;
                }],
                ["Take a break", () => { attr(p, 0, 5, 5); return "You've earned a rest."; }],
            ]);
        };
        ask();
    },

    // ------------------------------------------------------------------ perks
    /** Pilots and flight attendants fly for half price. */
    travelDiscount(p: any = player()): number { const d = Careers.current(p); return d && (d.id === "pilot" || d.id === "flightAttendant") ? 0.5 : 1; },
    isMedical(job: any): boolean { return !!Careers.def(job)?.medical; },
    isNight(job: any): boolean { return !!Careers.def(job)?.night; },
    isOutdoor(job: any): boolean { return !!Careers.def(job)?.outdoor; },

    // ------------------------------------------------------------------ on-the-job moments
    moment(p: any, d: CareerDef, level: number) {
        if (!LifeMoments.canHappen(p)) return;
        const img = Careers.job(d.id).getImageId();
        const list = MOMENTS[d.category] ?? [];
        if (!list.length) return;
        pick(list)(p, d, level, img);
    },

    // ------------------------------------------------------------------ Career Center (Work tab)
    counts(cat: string, p: any = player()): { total: number; open: number } {
        const list = Careers.jobsIn(cat);
        let open = 0;
        for (const j of list) {
            const edu = j.educationRequirement(1);
            if (Careers.applyBlock(j, p) == null && (edu == null || p.getCompletableActionState().isCompleted(edu))) open++;
        }
        return { total: list.length, open };
    },
    centerCells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel("Career Center")];
        for (const c of CAREER_CATEGORIES) {
            const n = Careers.counts(c.id, p);
            const mine = Careers.categoryOf(p.getJobState().getCurrentJob()) === c.id ? ` · You work here as ${ExtensionsKt.aOrAn(p.getJobState().getCurrentJobState().getJobTitle())}` : "";
            out.push(new ActionCellSingleViewModel((R.drawable as any)[c.image], c.title, text(`${c.blurb}\n${n.total} careers · ${n.open} you can start now${mine}`),
                new ButtonViewModel("Browse", null, true, false, false, false, false, { invoke: () => { Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, "careers:" + c.id, false, 4, null); return null; } }), null, null));
        }
        return out;
    },
    categoryTitle(cat: string): string { return CAREER_CATEGORIES.find((c) => c.id === cat)?.title ?? "Careers"; },
    categoryCells(cat: string, p: any = player()): any[] {
        const out: any[] = [];
        const c = CAREER_CATEGORIES.find((x) => x.id === cat);
        if (c) out.push(new ActionCellSingleViewModel((R.drawable as any)[c.image], c.title, text(`${c.blurb}\nIt's ${Seasons.label(p)}.`), ButtonViewModel.INSTANCE.getHidden(), null, null));
        for (const j of Careers.jobsIn(cat)) out.push(p.getJobState().getState(j).getViewModel());
        return out;
    },
    /** The extra lines on a career's Work cell. */
    describe(job: any, level: number, p: any = player()): string[] {
        const d = Careers.def(job);
        const current = p.getJobState().getCurrentJob() === job;
        if (d == null) {
            // v0.27.0: the original careers say where they exist and whether they check your record
            const out: string[] = [];
            const local = World.localJobCountries(job);
            if (local.length && !current) out.push(`Local job: ${local.map((c) => COUNTRY_BY_ID[c]?.name ?? c).join(", ")}`);
            if (CLEAN_RECORD_JOBS.has(job?.name?.()) && !current) out.push("Background check: needs a clean criminal record");
            return out;
        }
        const out: string[] = [];
        if (!current) out.push(d.blurb);
        const req: string[] = [];
        if (!current) {
            if (d.minAge != null) req.push(`age ${d.minAge}+`);
            if (d.maxAge != null) req.push(`hired up to age ${d.maxAge}`);
            if (d.minHealth != null) req.push(`${d.minHealth}+ health`);
        }
        if (!current && d.langs) req.push(`${d.langs[0]} foreign language${d.langs[0] === 1 ? "" : "s"}`);
        if (!current && CLEAN_RECORD_JOBS.has(d.id)) req.push("a clean criminal record");
        if (req.length) out.push(`Requires: ${req.join(", ")}`);
        const next = level + 1;
        if (current && next <= d.titles.length) {
            const why = Careers.promotionBlock(job, next, p);
            if (why) out.push(`Next promotion needs: ${why}`);
        }
        const ss = Careers.seasonText(job, p);
        if (ss) out.push(ss);
        if (d.night) out.push("Night shifts");
        if (d.id === "pilot" || d.id === "flightAttendant") out.push("Perk: travel and vacations cost 50% less");
        return out;
    },
};

function Relationships_away(p: any): boolean { try { return Seasons.away(p); } catch { return false; } }
function alert(title: string, msg: string, image: any) {
    try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(title, msg, image, null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
}
const jobProgress = (p: any, n: number) => { const j = p.getJobState().getCurrentJobState(); if (j != null) j.progress = Math.max(0, (j.progress ?? 0) + n); };
const bonus = (p: any, n: number) => {
    try { MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.workIncome, null, null, 12, null); } catch { /* ignore */ }
};
type Moment = (p: any, d: CareerDef, level: number, img: any) => void;
const MOMENTS: Record<string, Moment[]> = {
    health: [
        (p, d, _l, img) => LifeMoments.ask("A Long Shift", `A bus crash: every ${d.name.toLowerCase()} in the city is called in. Do you stay past your shift?`, img, [
            ["Stay until it's done", () => { attr(p, -2, 3, -4); jobProgress(p, 2); return "Eighteen hours later, everyone made it. Your boss noticed. (+2 weeks toward a promotion)"; }],
            ["Go home", () => { attr(p, 0, 0, 2); return "You need sleep too. Someone else covers."; }],
        ]),
        (p, _d, _l, img) => { attr(p, 0, 6, 2); LifeMoments.result("A Thank-You Card", "A patient you helped months ago sent a card. It's on your fridge now. (+6 happiness)", img); },
    ],
    trades: [
        (p, d, level, img) => LifeMoments.ask("A Cash Job", `A neighbour asks if you'd do a weekend job off the books as ${ExtensionsKt.aOrAn(d.name.toLowerCase())}.`, img, [
            ["Take it", () => { bonus(p, 150 * level); attr(p, -1, 0, -1); return `An extra $${150 * level} for a long Saturday.`; }],
            ["Enjoy your weekend", () => { attr(p, 0, 3, 2); return "Your weekend, your rules."; }],
        ]),
        (p, _d, _l, img) => { attr(p, 0, 4, 0); LifeMoments.result("Job Well Done", "A customer left you a glowing review: \"Fixed it in an hour. Wizard.\" (+4 happiness)", img); },
    ],
    public: [
        (p, d, _l, img) => { attr(p, 0, 5, 2); SocialMedia.addFollowers(p, 200, "chirper"); LifeMoments.result("Local Hero", `The local paper ran a story about you and your work as a ${d.name.toLowerCase()}. (+200 followers)`, img); },
        (p, _d, _l, img) => LifeMoments.ask("Budget Cuts", "Your department's budget was cut. Do you speak up at the city meeting?", img, [
            ["Speak up", () => { attr(p, 0, 2, -2); SocialMedia.addFollowers(p, 300, "chirper"); return "Your speech went viral locally. The cuts were halved. (+300 followers)"; }],
            ["Keep your head down", () => { attr(p, 0, -2, 0); return "The cuts went through. Everyone's doing more with less."; }],
        ]),
    ],
    tech: [
        (p, _d, _l, img) => LifeMoments.ask("Crunch Time", "The deadline moved up two weeks. Everyone's working nights.", img, [
            ["Crunch", () => { attr(p, -2, -2, -5); jobProgress(p, 2); return "You shipped it. You also forgot what the sun looks like. (+2 weeks toward a promotion)"; }],
            ["Set boundaries", () => { attr(p, 0, 2, 3); return "You logged off at six. The world didn't end."; }],
        ]),
        (p, _d, level, img) => { bonus(p, 300 * level); LifeMoments.result("Bonus", `Your project beat its targets. Bonus: $${300 * level}.`, img); },
    ],
    creative: [
        (p, _d, _l, img) => { SocialMedia.addFollowers(p, 500, "snapgram"); attr(p, 0, 5, 0); LifeMoments.result("Your Work Went Viral", "Something you made is all over social media. (+500 followers, +5 happiness)", img); },
        (p, _d, _l, img) => LifeMoments.ask("Creative Block", "You've stared at a blank page for days.", img, [
            ["Push through", () => { attr(p, 0, -2, -3); jobProgress(p, 1); return "It wasn't your best, but it's done."; }],
            ["Take a walk", () => { attr(p, 1, 2, 4); return "The idea came to you halfway round the park."; }],
        ]),
    ],
    hospitality: [
        (p, _d, level, img) => { bonus(p, 100 * level); attr(p, 0, 3, 0); LifeMoments.result("Big Tip", `A guest left a huge tip: $${100 * level}.`, img); },
        (p, _d, _l, img) => LifeMoments.ask("A Rude Guest", "A guest is screaming at you about something that isn't your fault.", img, [
            ["Kill them with kindness", () => { attr(p, 0, -1, -2); jobProgress(p, 1); return "Your manager saw everything and was impressed."; }],
            ["Tell them what you think", () => { attr(p, 0, 4, 1); jobProgress(p, -2); return "It felt great. Your manager didn't love it. (−2 weeks of progress)"; }],
        ]),
    ],
    science: [
        (p, _d, _l, img) => { attr(p, 0, 6, 3); SocialMedia.addFollowers(p, 300, "chirper"); LifeMoments.result("A Discovery", "Your team made a real discovery. Your name is on the paper. (+300 followers)", img); },
        (p, _d, _l, img) => { attr(p, 0, -3, -2); jobProgress(p, -1); LifeMoments.result("Grant Rejected", "The funding fell through. Back to writing proposals.", img); },
    ],
    sports: [
        (p, d, _l, img) => { SocialMedia.addFollowers(p, d.id === "proAthlete" || d.id === "contentCreator" ? 2000 : 150, "cliptok"); attr(p, 1, 5, 0); LifeMoments.result("Highlight Reel", "A clip of you went viral on ClipTok.", img); },
        (p, _d, _l, img) => { attr(p, -3, -2, 0); LifeMoments.result("Pulled a Muscle", "You pushed too hard. A week of ice packs. (−3 health)", img); },
    ],
};
void CAREER_BY_ID;
export function installCareerHooks() { Leisure.travelDiscount = (p) => Careers.travelDiscount(p); }
