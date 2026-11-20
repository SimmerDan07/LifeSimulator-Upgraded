// Lifepaths tab: hidden paths a life can take that change what your character is.
// v0.15.0: the Vampire lifepath (see src/game/Lifepaths/Vampire.ts).
// v0.19.0: the tab is a menu of paths (Celebrity Life, Vampire); each opens its own screen (GenericListType.lifepath).
import { ArrayList, R } from "../runtime";
import { Illness } from "../Health/Illness";
import { LegacyScreen } from "../Legacy/LegacyScreen";
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
import { Vampire, LifeActions, BECOMING, FEEDING, HIDING, ENDINGS, powerDefs, POWERS, WITHERED_CAP } from "../Lifepaths/Vampire";
import { LoveScreens } from "../Social/LoveScreens";
import { Celebrity } from "../Lifepaths/Celebrity";
import { CelebrityScreen } from "../Lifepaths/CelebrityScreen";
import { NavigationBarViewModel } from "../Models/NavigationBarViewModel";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { WorkModelGenerator } from "./WorkModelGenerator";
import { Careers } from "../Careers/Careers";
import { Activities } from "../World/Activities";
import { World } from "../World/World";
import { Crime } from "../Crime/Crime";
import { CrimeScreen } from "../Crime/CrimeScreen";

const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const thirstTrend = (n: number) => (n > 0 ? `On your diet the bar fills in ${Vampire.fillText(n)}. When it's full you collapse, and 10 to 40 years can pass before someone finds you.` : `Falls ${-n} a week on your diet.`);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const open = (key: string) => Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null);
const row = (image: any, title: string, body: string, go: () => void) =>
    new ActionCellSingleViewModel(image, title, text(body), new ButtonViewModel("Open", null, true, false, false, false, false, { invoke: () => { go(); return null; } }), null, null);

export class LifepathsModelGenerator {
    gameTab: MainGameTab = MainGameTab.Lifepaths;

    /** The Lifepaths tab (v0.19.0): a menu of paths. Each opens its own screen. */
    generateViewModels(): GenericListFragmentViewModel {
        const out = new ArrayList<BaseViewModel>();
        const p: any = GameStateManager.INSTANCE.getPersonState();
        out.add(new HeaderTitleViewModel("Lifepaths"));
        out.add(info(R.drawable.tab_lifepaths, "The All-Seeing Eye",
            "Some lives don't follow the usual road. Lifepaths change what you are, how long you live and how the world sees you."));
        out.add(row(Celebrity.image, "Celebrity Life", this.celebrityStatus(p), () => open("celebrity")));
        const v = Vampire.peek(p);
        if (p.getAgeInYears() < Vampire.minAge && !v?.isVampire) {
            out.add(new ActionCellSingleViewModel(R.drawable.locked, "Vampire", text("A path for adults. Come back when you're 18."),
                new ButtonViewModel("Locked", null, false, false, true, false, false, { invoke: () => null }), null, null));
        } else {
            out.add(row(Vampire.image, "Vampire", this.vampireStatus(p), () => open("vampire")));
        }
        // v0.27.0: the Underworld (crime, gangs, crime families)
        if (p.getAgeInYears() < 13 && !Crime.inJail(p)) {
            out.add(new ActionCellSingleViewModel(R.drawable.locked, "Crime", text("The underworld opens its doors at 13."),
                new ButtonViewModel("Locked", null, false, false, true, false, false, { invoke: () => null }), null, null));
        } else {
            out.add(row(R.drawable.lifepath_crime, "Crime", CrimeScreen.status(p), () => open("crime")));
        }
        return new GenericListFragmentViewModel(out);
    }

    celebrityStatus(p: any): string {
        const s = Celebrity.peek(p);
        const c = Celebrity.career(p);
        if ((s == null || s.peakFans === 0) && c == null)
            return "Act, sing or dance your way to fame. Three fame careers (also in the Career Center), fans to win, scandals to survive, awards, and a star on the Walk of Fame.";
        const job = c ? `${c.title}: ${p.getJobState().getCurrentJobState().getJobTitle()}` : "No celebrity career right now";
        const latest = s?.news?.[s.news.length - 1];
        return `${Celebrity.tierName(p)} · ${Celebrity.fansText(Celebrity.fans(p))} fans${s?.cancelled ? " · Cancelled" : ""}${s?.legend ? " · Legend" : ""}\n${job}${latest ? `\nLatest: ${latest.text}` : ""}`;
    }

    vampireStatus(p: any): string {
        const s = Vampire.peek(p);
        if (s?.isVampire) {
            if (s.cureWeeks > 0) return `The Vampiric Cure is working: ${s.cureWeeks} week${s.cureWeeks === 1 ? "" : "s"} to go.`;
            const years = Vampire.years(p);
            return `${years > 0 ? `Vampire for ${years} year${years === 1 ? "" : "s"}` : "A newly risen vampire"} · Thirst ${Math.round(s.thirst)} · Suspicion ${s.suspicion}`;
        }
        if (s != null && s.turningWeeks > 0) return "The Turning: you'll rise a vampire at the end of this week.";
        if (s?.cured) return "Human again. You get one vampire life: this path is closed to you now.";
        return s?.discovered ? "An ancient vampire has offered you eternity." : "Rumours say vampires walk among us.";
    }

    /** A Lifepaths screen: "celebrity" or "vampire". */
    screen(key: string | null): GenericListFragmentViewModel {
        const p: any = GameStateManager.INSTANCE.getPersonState();
        const out = new ArrayList<BaseViewModel>();
        const header = new ArrayList<BaseViewModel>();
        if (key === "crime") {
            header.add(new NavigationBarViewModel("Crime", false, 2, null));
            for (const c of CrimeScreen.cells(p)) out.add(c);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key === "crime-murder") {
            header.add(new NavigationBarViewModel("Murder", false, 2, null));
            for (const c of CrimeScreen.murderCells(p)) out.add(c);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key === "health-history") {   // v0.28.0 (Health tab)
            header.add(new NavigationBarViewModel("Medical History", false, 2, null));
            for (const c of Illness.historyCells(p)) out.add(c);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key != null && key.startsWith("legacy")) {   // v0.28.0 (Profile tab): your will, heirlooms, Switch Life
            header.add(new NavigationBarViewModel(LegacyScreen.title(key), false, 2, null));
            for (const c of LegacyScreen.cells(key, p)) out.add(c);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key != null && key.startsWith("activities:")) {
            // v0.27.0 Things to Do: one screen per group (opened from the Leisure tab)
            const cat = key.slice("activities:".length);
            header.add(new NavigationBarViewModel(Activities.categoryTitle(cat), false, 2, null));
            for (const c of Activities.screenCells(cat, p)) out.add(c);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key != null && key.startsWith("world:")) {
            // v0.27.0 Move Abroad: one screen per region
            const r = key.slice("world:".length) as any;
            header.add(new NavigationBarViewModel(World.regionTitle(r), false, 2, null));
            for (const c of World.regionCells(r, p)) out.add(c);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key === "languages") {
            header.add(new NavigationBarViewModel("Languages", false, 2, null));
            for (const c of World.languageScreen(p)) out.add(c);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key != null && key.startsWith("careers:")) {
            // v0.26.0 Career Center: one screen per career group (opened from the Work tab)
            const cat = key.slice("careers:".length);
            header.add(new NavigationBarViewModel(Careers.categoryTitle(cat), false, 2, null));
            for (const c of Careers.categoryCells(cat, p)) out.add(c);
            let footer: ArrayList<BaseViewModel> = null;
            if (p.getJobState().getCurrentJob() != null) { footer = new ArrayList<BaseViewModel>(); footer.add(new WorkModelGenerator().getWorkButtonsViewModel()); }
            return new GenericListFragmentViewModel(out, header, footer);
        }
        if (key === "vampire") {
            header.add(new NavigationBarViewModel("Vampire", false, 2, null));
            this.vampireContent(p, out);
            return new GenericListFragmentViewModel(out, header, null);
        }
        if (key === "celebrity-news" || key === "celebrity-works" || key === "celebrity-milestones") {
            header.add(new NavigationBarViewModel(key === "celebrity-news" ? "Headlines" : key === "celebrity-works" ? "Discography & Filmography" : "Milestones", false, 2, null));
            if (key === "celebrity-news") CelebrityScreen.news(p, out, header);
            else if (key === "celebrity-works") CelebrityScreen.works(p, out);
            else CelebrityScreen.milestones(p, out);
            return new GenericListFragmentViewModel(out, header, null);
        }
        header.add(new NavigationBarViewModel("Celebrity Life", false, 2, null));
        let footer: ArrayList<BaseViewModel> = null;
        if (Celebrity.career(p) != null) { footer = new ArrayList<BaseViewModel>(); footer.add(new WorkModelGenerator().getWorkButtonsViewModel()); }
        CelebrityScreen.content(p, out);
        return new GenericListFragmentViewModel(out, header, footer);
    }

    /** The Vampire screen (before v0.19.0 this was the whole Lifepaths tab). */
    vampireContent(p: any, out: ArrayList<BaseViewModel>) {
        const s = Vampire.peek(p);
        if (s?.isVampire) { this.vampire(p, out); return; }
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
                s.thirst >= 100 ? "Empty: you're about to collapse." : s.thirst >= 80 ? "Desperate: −2 happiness, −3 sanity a week. Feed soon or you'll collapse." : s.thirst >= 60 ? "Hungry: −2 happiness a week." : thirstTrend(Vampire.thirstPerWeekFor(p))));
            if ((s.witheredWeeks ?? 0) > 0) out.add(info(Vampire.image, "Withered",
                `Your body is still recovering from the collapse: health can't go above ${WITHERED_CAP} and doesn't heal, −1 happiness a week. ${s.witheredWeeks} week${s.witheredWeeks === 1 ? "" : "s"} left.`));
            out.add(new MeterViewModel("Suspicion", s.suspicion, 100, "purple",
                (s.suspicion >= 80 ? "Vampire hunters may come for you." : "At 80, vampire hunters start looking for you.") +
                (Celebrity.tier(p) >= 3 ? " You're famous: cameras everywhere make people wonder why you never age." : "")));
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
            out.add(info(R.drawable.icon_bond, `Eternal Bond with ${bond.getFirstName()}`,
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
