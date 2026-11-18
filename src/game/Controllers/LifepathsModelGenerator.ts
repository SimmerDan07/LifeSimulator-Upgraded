// Lifepaths tab: hidden paths a life can take that change what your character is.
// v0.15.0: the Vampire lifepath (see src/game/Lifepaths/Vampire.ts).
import { ArrayList, R } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { MeterViewModel } from "../Models/PersonCardViewModel";
import { MainGameTab } from "../Enums/MainGameTab";
import { GameStateManager } from "../Managers/GameStateManager";
import { Vampire, LifeActions, BECOMING, FEEDING, HIDING, ENDINGS, powerDefs, POWERS } from "../Lifepaths/Vampire";
import { LoveScreens } from "../Social/LoveScreens";

const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const thirstTrend = (n: number) => (n > 0 ? `Rises ${n} a week on your diet.` : `Falls ${-n} a week on your diet.`);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);

export class LifepathsModelGenerator {
    gameTab: MainGameTab = MainGameTab.Lifepaths;

    generateViewModels(): GenericListFragmentViewModel {
        const out = new ArrayList<BaseViewModel>();
        const p: any = GameStateManager.INSTANCE.getPersonState();
        const s = Vampire.peek(p);
        if (s?.isVampire) {
            this.vampire(p, out);
            return new GenericListFragmentViewModel(out);
        }
        out.add(new HeaderTitleViewModel("Lifepaths"));
        out.add(info(R.drawable.tab_lifepaths, "The All-Seeing Eye",
            "Some lives don't follow the usual road. Lifepaths change what you are, how long you live and how the world sees you."));
        out.add(new HeaderTitleViewModel("Vampire"));
        if (s != null && s.turningWeeks > 0) {
            out.add(info(Vampire.image, "The Turning", "Your heart is slowing and the light hurts. By the end of this week you'll rise a vampire."));
        } else if (s?.cured) {
            out.add(info(R.drawable.health_youthelixir, "Human Again",
                `You were a vampire for ${Math.floor(s.vampireWeeks / 48)} years, until the Vampiric Cure. You get one vampire life: this path is closed to you now.`));
        } else if (p.getAgeInYears() < Vampire.minAge) {
            out.add(new ActionCellSingleViewModel(R.drawable.locked, "Vampire", text("A path for adults. Come back when you're 18."),
                new ButtonViewModel("Locked", null, false, false, true, false, false, { invoke: () => null }), null, null));
        } else {
            out.add(info(Vampire.image, "Vampire", s?.discovered
                ? "An ancient vampire has offered you eternity. You'd stop ageing forever, but need blood every week, fear the sun, and can't have biological children."
                : "Rumours say vampires walk among us. Some say a pale stranger appears at nightclubs and local events. Or you could go looking."));
            for (const c of LifeActions.cells(BECOMING, p)) out.add(c);
        }
        return new GenericListFragmentViewModel(out);
    }

    vampire(p: any, out: ArrayList<BaseViewModel>) {
        const s = Vampire.state(p);
        const years = Vampire.years(p);
        const turnedAt = Math.floor(s.turnedAtWeeks / 48);
        const trueAge = Math.floor(p.getTrueAgeInWeeks() / 48);
        out.add(new HeaderTitleViewModel("Vampire"));
        const powers = (s.powers ?? []).map((id: string) => POWERS.find((x) => x.id === id)?.title).filter(Boolean).join(", ");
        out.add(info(Vampire.image, years > 0 ? `Vampire for ${years} year${years === 1 ? "" : "s"}` : "A newly risen vampire",
            `Turned at ${turnedAt}, true age ${trueAge}. Blood power: ${s.bloodPower}.${powers ? ` Powers: ${powers}.` : ""}`));
        if (s.cureWeeks > 0) {
            out.add(info(R.drawable.health_youthelixir, "The Vampiric Cure is working", `${s.cureWeeks} week${s.cureWeeks === 1 ? "" : "s"} until you're human again. Your thirst has stopped.`));
        } else {
            out.add(new MeterViewModel("Thirst", s.thirst, 100, "red",
                s.thirst >= 100 ? "Starving: you'll frenzy every week until you feed." : s.thirst >= 80 ? "Desperate: −20 sanity a week." : s.thirst >= 60 ? "Hungry: −5 happiness a week." : thirstTrend(Vampire.thirstPerWeekFor(p))));
            out.add(new MeterViewModel("Suspicion", s.suspicion, 100, "purple",
                s.suspicion >= 80 ? "Vampire hunters may come for you." : "At 80, vampire hunters start looking for you."));
            out.add(new HeaderTitleViewModel("Feeding"));
            for (const c of LifeActions.cells(FEEDING, p)) out.add(c);
            out.add(new HeaderTitleViewModel("Hiding"));
            for (const c of LifeActions.cells(HIDING, p)) out.add(c);
            out.add(new HeaderTitleViewModel(`Powers · ${s.bloodPower} blood power`));
            for (const c of LifeActions.cells(powerDefs(), p)) out.add(c);
        }
        // v0.17.0 Eternal Bond
        const bond = Vampire.bondedPartner(p);
        if (bond != null) {
            out.add(new HeaderTitleViewModel("Eternal Bond"));
            const married = bond.marriedSinceWeek != null;
            const since = bond.marriedSinceWeek ?? bond.togetherSinceWeek;
            const yrs = since != null ? Math.floor((p.getTrueAgeInWeeks() - since) / 48) : null;
            out.add(info(R.drawable.love_propose, `Eternal Bond with ${bond.getFirstName()}`,
                (yrs != null ? `${married ? "Married" : "Together"} ${yrs} year${yrs === 1 ? "" : "s"}. ` : "") + "You never drift apart, fight hunters side by side (70% to win) and share your blood diet (it costs double; with no diet, they hunt alone: +2 suspicion a week). Hunt Together, Dance Through the Night and Eternal Vows are on their Love tab screen."));
        }
        out.add(new HeaderTitleViewModel("Coven"));
        const coven = Vampire.coven(p);
        if (!coven.length) out.add(new SingleLabelCellViewModel("NoCoven", text("No other vampires yet. Find Your Coven, or turn someone close to you from their Love tab screen.")));
        for (const x of coven) out.add(LoveScreens.card(x));
        out.add(new HeaderTitleViewModel("Endings"));
        for (const c of LifeActions.cells(ENDINGS, p)) out.add(c);
    }
}
