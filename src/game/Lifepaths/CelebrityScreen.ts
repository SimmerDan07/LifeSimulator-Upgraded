// Lifepaths › Celebrity Life (v0.19.0): the screen behind the star in the Lifepaths menu.
import { ArrayList, R } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { LifeActions, LifeActionDef } from "./Vampire";
import { Celebrity, CAREERS, TIERS, ACTING, MUSIC, DANCE, FAME, TEAM } from "./Celebrity";

const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const note = (id: string, s: string) => new SingleLabelCellViewModel(id, new TextLabelViewModel(s, null, false, false, null, null, 62, null));

const ACTIVITIES: Record<string, { title: string; defs: LifeActionDef[] }> = {
    acting: { title: "Acting", defs: ACTING },
    music: { title: "Music", defs: MUSIC },
    dance: { title: "Dance", defs: DANCE },
};

export const CelebrityScreen = {
    content(p: any, out: ArrayList<BaseViewModel>) {
        const s = Celebrity.state(p);
        const t = Celebrity.tier(p);
        const c = Celebrity.career(p);
        const money = Celebrity.money;

        // ---------------------------------------------------------------- status
        const job = c ? `${c.title} career: ${p.getJobState().getCurrentJobState().getJobTitle()}` : "No celebrity career yet: pick one below.";
        const born = s.inherited > 0 ? `\nBorn famous: ${Celebrity.fansText(s.inherited)} fans came with your family name.` : "";
        out.add(info(Celebrity.image, TIERS[t].name,
            `${Celebrity.fansText(s.fans)} fans (peak ${Celebrity.fansText(s.peakFans)}).\n${job}${s.cancelled ? "\nYou're cancelled: fans barely grow until your reputation is back to 35." : ""}${born}`));
        const next = TIERS[t + 1];
        const lo = TIERS[t].min;
        out.add(new MeterViewModel("Fans", next ? s.fans - lo : 1, next ? next.min - lo : 1, "gold",
            next ? `Next: ${next.name} at ${Celebrity.fansText(next.min)} fans. Fans fade if you go more than two weeks without working or doing something public.`
                : "The very top. Nobody is more famous than you.",
            next ? `${Celebrity.fansText(s.fans)} / ${Celebrity.fansText(next.min)}` : Celebrity.fansText(s.fans)));
        out.add(new MeterViewModel("Reputation", s.reputation, 100, s.reputation < 25 ? "red" : "green",
            s.cancelled ? "Cancelled. Charity galas, meet & greets and good work bring it back." : s.reputation < 25 ? "Low: fans grow slower. At 10 or less you're cancelled." : s.reputation > 75 ? "Beloved: fans grow faster." : "Scandals lower it; charity and fans raise it."));
        const costs = Celebrity.weeklyCosts(p).reduce((a, x) => a + x.amount, 0);
        const roy = Celebrity.royalties(p), brand = Celebrity.brandIncome(p);
        if (costs || roy || brand) {
            const parts = [roy ? `royalties +${money(roy)}` : null, brand ? `${s.brand} +${money(brand)}` : null, costs ? `team −${money(costs)}` : null].filter(Boolean);
            out.add(note("CelebWeekly", `Every week: ${parts.join(", ")}.`));
        }

        // ---------------------------------------------------------------- careers
        out.add(new HeaderTitleViewModel("Careers"));
        const ordered = [...CAREERS].sort((a, b) => (a === c ? -1 : b === c ? 1 : 0));
        for (const k of ordered) out.add(p.getJobState().getState(k.job()).getViewModel());
        out.add(note("CelebCareerRules",
            "These careers are only found here. Acting starts as an Extra (Theater degree from Theater Ensemble). Music starts as a Street Performer (Music & Production degree from Recording Artist). " +
            "Dance starts as a Street Dancer (Theater degree from Dance Captain). The top jobs also need fans: work hard and get noticed. Your Work buttons work your celebrity job too."));
        out.add(note("CelebSkills", `Skills · Acting ${Celebrity.skill(p, "acting")} · Music ${Celebrity.skill(p, "music")} · Dance ${Celebrity.skill(p, "dance")}  (degrees add 15)`));

        // ---------------------------------------------------------------- activities (your career first)
        const order = c ? [c.id, ...CAREERS.map((x) => x.id).filter((x) => x !== c.id)] : CAREERS.map((x) => x.id);
        for (const id of order) {
            const a = ACTIVITIES[id];
            out.add(new HeaderTitleViewModel(a.title));
            for (const cell of LifeActions.cells(a.defs, p)) out.add(cell);
        }
        out.add(new HeaderTitleViewModel("Fame"));
        for (const cell of LifeActions.cells(FAME, p)) out.add(cell);
        out.add(new HeaderTitleViewModel("Your Team"));
        for (const cell of LifeActions.cells(TEAM, p)) out.add(cell);

        // ---------------------------------------------------------------- awards & records
        out.add(new HeaderTitleViewModel(`Awards & Records${s.awards.length ? ` · ${s.awards.length}` : ""}`));
        const rec = [
            s.roles && `${s.roles} role${s.roles === 1 ? "" : "s"}`, s.movies && `${s.movies} movie${s.movies === 1 ? "" : "s"}`,
            s.singles && `${s.singles} single${s.singles === 1 ? "" : "s"}`, s.albums && `${s.albums} album${s.albums === 1 ? "" : "s"}`,
            s.hits && `${s.hits} hit${s.hits === 1 ? "" : "s"}`, s.tours && `${s.tours} tour${s.tours === 1 ? "" : "s"}`,
            s.battlesWon && `${s.battlesWon} dance battle${s.battlesWon === 1 ? "" : "s"} won`,
        ].filter(Boolean);
        out.add(note("CelebRecords", rec.length ? rec.join(" · ") : "No records yet."));
        if (!s.awards.length) out.add(note("CelebNoAwards", "No awards yet. Once you're a Rising Star, a busy year in your career can earn you a nomination."));
        s.awards.forEach((a, i) => out.add(info(/Walk of Fame/.test(a) ? R.drawable.icon_celeb_walkoffame : R.drawable.icon_celeb_award, a.replace(/ \(age \d+\)$/, ""), (a.match(/\((age \d+)\)$/)?.[1] ?? "").replace("age", "Age"))));
    },
};
