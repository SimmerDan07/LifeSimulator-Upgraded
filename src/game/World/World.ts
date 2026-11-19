// v0.27.0 "The World Update": countries, languages and moving abroad (data in WorldData.ts).
//
// - Birth country: chosen when you create a character (any of the 37). You speak its language natively, and it
//   counts as learned (Player.nativeLanguage; older saves were all born in the US, so their native language is English).
// - Moving needs the country's language, now including English for people born where English isn't spoken.
//   You must be 18, can't move from prison, and a job that only exists in your old country stays behind.
// - Every foreign language you speak adds 1% to your pay (up to +10%); some add 5% in particular careers
//   (Latin for doctors and lawyers, Sign Language for nurses and teachers…). Translators need languages to work.
// - Leisure tab › Travel lists four regions; each opens a screen with its countries.
// - Education tab › Languages lists what you're learning and opens the full list of 35 languages.
import { R, BigInteger } from "../runtime";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { Country } from "../Enums/Country";
import { CompletableAction } from "../Enums/CompletableAction";
import { Leisure } from "../Enums/Leisure";
import { Job } from "../Enums/Job";
import { Modifiers } from "../Managers/Modifiers";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { COUNTRY_BY_ID, COUNTRY_DEFS, CountryDef, LANGUAGE_BY_ID, LANGUAGE_DEFS, REGIONS, Region, nativeLanguageOf } from "./WorldData";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const info = (image: any, title: string, body: string) => new ActionCellSingleViewModel(image, title, text(body), ButtonViewModel.INSTANCE.getHidden(), null, null);
const browse = (image: any, title: string, body: string, key: string) =>
    new ActionCellSingleViewModel(image, title, text(body), new ButtonViewModel("Browse", null, true, false, false, false, false,
        { invoke: () => { Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, key, false, 4, null); return null; } }), null, null);

export const MOVE_MIN_AGE = 18;

export const World = {
    def(p: any = player()): CountryDef | null { try { return COUNTRY_BY_ID[p.getCountry().name()] ?? null; } catch { return null; } },
    country(id: string): Country { return (Country as any)[id]; },
    /** The language you grew up speaking (CompletableAction name). */
    native(p: any = player()): string { return p?.nativeLanguage ?? "english"; },
    nativeTitle(p: any = player()): string { return LANGUAGE_BY_ID[World.native(p)]?.title ?? "English"; },
    knows(p: any, lang: any): boolean {
        if (lang == null) return true;
        const id = typeof lang === "string" ? lang : lang.name();
        if (World.native(p) === id) return true;
        try { return p.getCompletableActionState().isCompleted((CompletableAction as any)[id]); } catch { return false; }
    },
    /** The language a country needs (English where the original game needed none). */
    requiredLanguage(c: Country): CompletableAction { return c.getRequiredLanguage() ?? (CompletableAction as any).english; },
    languagesSpoken(p: any = player()): string[] { return LANGUAGE_DEFS.filter((l) => World.knows(p, l.id)).map((l) => l.id); },
    foreignLanguages(p: any = player()): string[] { return World.languagesSpoken(p).filter((l) => l !== World.native(p)); },
    /** Pay multiplier from languages: +1% per foreign language (max +10%), +5% for each one that suits your career. */
    payMultiplier(p: any, job: any): number {
        const foreign = World.foreignLanguages(p);
        if (!foreign.length) return 1;
        const name = job?.name?.() ?? "";
        let bonus = Math.min(0.1, foreign.length * 0.01);
        for (const l of foreign) if (LANGUAGE_BY_ID[l]?.jobs?.includes(name)) bonus += 0.05;
        return 1 + bonus;
    },

    // ------------------------------------------------------------------ birth country (new game)
    setBirthCountry(np: any, c: Country) {
        const before = World.native(np);
        try { if (np.nativeLanguageCompleted) np.getCompletableActionState().clearAction((CompletableAction as any)[before]); } catch { /* ignore */ }
        np.setCountry(c);
        np.nativeLanguage = nativeLanguageOf(c.name());
        np.nativeLanguageCompleted = false;
        World.onNewLife(np);
    },
    /** A new character (new game or heir): their native language counts as learned. */
    onNewLife(p: any) {
        if (p.nativeLanguage == null) p.nativeLanguage = nativeLanguageOf(p.getCountry().name());
        const a = (CompletableAction as any)[p.nativeLanguage];
        try {
            if (a != null && !p.getCompletableActionState().isCompleted(a)) { p.getCompletableActionState().completeAction(a); p.nativeLanguageCompleted = true; }
        } catch { /* ignore */ }
        // home cooking for kids, the country's diets for adults (a moved birth country can't keep another country's dish)
        try {
            const diets = p.getCountry().getDietOptions();
            const d = p.getDiet?.();
            if (d != null && p.getAgeInYears() >= 18 && !diets.includes(d)) p.changeDiet(diets[Math.min(1, diets.length - 1)]);
        } catch { /* ignore */ }
    },
    /** Skip childhood: start a new life at 13 (customize screen switch). */
    skipTo13(np: any, on: boolean) {
        if (on) {
            if (np.skipChildhoodFrom == null) np.skipChildhoodFrom = np.getAgeInYears();
            np.initializeAge(13, true);
        } else if (np.skipChildhoodFrom != null) {
            np.initializeAge(np.skipChildhoodFrom, true);
            np.skipChildhoodFrom = null;
        }
        np.skipChildhood = on;
    },

    // ------------------------------------------------------------------ moving abroad
    /** Why you can't move to `c` right now (on top of money, passport and language), or null. */
    moveBlock(c: Country, p: any = player()): string | null {
        if (p.getAgeInYears() < MOVE_MIN_AGE) return `You can move abroad at ${MOVE_MIN_AGE}`;
        try { if (p.getCrimeState().getIsInJail()) return "Not while you're in prison"; } catch { /* ignore */ }
        const lang = World.requiredLanguage(c);
        if (lang != null && !World.knows(p, lang)) return `You need to speak ${lang.getTitle()}`;
        return null;
    },
    /** After moving (Player.leisureAction): jobs that only exist in your old country stay there. */
    afterMove(p: any, from: Country, to: Country) {
        const lines: string[] = [];
        try {
            const job = p.getJobState().getCurrentJob();
            if (job != null && World.localJobCountries(job).length && !World.localJobCountries(job).includes(to.name())) {
                const title = p.getJobState().getCurrentJobState().getJobTitle();
                p.getJobState().setCurrentJob(null);
                lines.push(`Your job as ${ExtensionsKt.aOrAn(title)} stayed in ${from.getTitle()}. Find a new one in the Career Center.`);
            }
        } catch { /* ignore */ }
        const d = COUNTRY_BY_ID[to.name()];
        if (d && !d.original) lines.push(`${d.blurb} Money is shown in ${to.getCurrency().getSymbol().trim()} now.`);
        for (const hook of World.moveHooks) { try { const s = hook(p, from, to); if (s) lines.push(s); } catch { /* ignore */ } }
        if (lines.length) {
            try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel(`Welcome to ${to.getTitle()}`, lines.join("\n\n"), to.getImageId(), null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
        }
    },
    /** Other modules add what moving means for them (crime heat, fugitives…). */
    moveHooks: [] as ((p: any, from: Country, to: Country) => string | null)[],
    /** Countries where a local job exists (empty = everywhere). */
    localJobCountries(job: any): string[] {
        const name = job?.name?.();
        const everywhere = ["panHandler", "dataEntry", "uber", "retail", "business", "medical", "finance", "research", "programmer", "teacher", "artist", "police", "army", "lawyer", "music", "actor", "dancer"];
        if (name == null || everywhere.includes(name) || job.def?.() != null) return [];
        const out: string[] = [];
        for (const c of Country.values()) {
            try { if ([...c.getUnskilledJobOptions(), ...c.getAdditionalJobOptions()].includes(job)) out.push(c.name()); } catch { /* ignore */ }
        }
        return out;
    },
    travelOption(c: Country): Leisure | null { return Leisure.INSTANCE.getTravelEvents().find((l: Leisure) => l.getTravelCountry() === c) ?? null; },

    // ------------------------------------------------------------------ Leisure tab › Travel
    travelCells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel("Move Abroad")];
        const here = World.def(p);
        out.push(info(p.getCountry().getImageId(), `You live in ${p.getCountry().getTitle()}`,
            `${here?.blurb ?? ""}\nYou speak ${World.languagesSpoken(p).map((l) => LANGUAGE_BY_ID[l]?.title).join(", ")}. Moving costs ${ExtensionsKt.numberDisplayString(BigInteger.valueOf(100000), true)}, needs a passport and the country's language, and you must be ${MOVE_MIN_AGE}.`.trim()));
        for (const r of REGIONS) {
            const list = COUNTRY_DEFS.filter((c) => c.region === r.id && c.id !== here?.id);
            const ok = list.filter((c) => World.knows(p, World.requiredLanguage(World.country(c.id)))).length;
            out.push(browse((R.drawable as any)[r.image], r.title, `${r.blurb}\n${list.length} countries · you speak the language of ${ok}`, "world:" + r.id));
        }
        return out;
    },
    regionTitle(r: string): string { return REGIONS.find((x) => x.id === r)?.title ?? "Countries"; },
    regionCells(r: Region, p: any = player()): any[] {
        const out: any[] = [];
        for (const c of COUNTRY_DEFS.filter((x) => x.region === r)) {
            const country = World.country(c.id);
            if (country === p.getCountry()) { out.push(info(country.getImageId(), `${c.name} (you live here)`, c.blurb)); continue; }
            const l = World.travelOption(country);
            if (l == null) continue;
            const cell = ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, l, null, 2, null);
            cell.getActionButton().setShouldShowAnimation(false);
            out.push(cell);
        }
        return out;
    },
    /** Extra lines under a "Move to …" row. */
    moveNote(l: Leisure): string | null {
        const c = l.getTravelCountry();
        if (c == null) return null;
        const d = COUNTRY_BY_ID[c.name()];
        const lang = World.requiredLanguage(c);
        const climate = d ? { temperate: "Mild seasons", cold: "Cold, snowy winters", tropical: "Tropical: no winter", desert: "Desert: hot and dry" }[d.climate] + (d.south ? " (seasons flipped: Christmas is in summer)" : "") : "";
        return `${d?.blurb ?? ""}\nLanguage: ${lang.getTitle()} · ${climate} · Drinking age ${c.getLegalDrinkingAge()} · Currency ${c.getCurrency().getSymbol().trim()}\n`;
    },

    // ------------------------------------------------------------------ Education tab › Languages
    languageCells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_Language))];
        const spoken = World.languagesSpoken(p);
        out.push(browse(R.drawable.education_literature, "Languages",
            `You speak ${spoken.map((l) => LANGUAGE_BY_ID[l]?.title).join(", ")} (native: ${World.nativeTitle(p)}).\n35 languages to learn: each foreign one adds 1% to your pay (up to 10%), and you need a country's language to move there.`, "languages"));
        // languages you're part-way through stay on the tab
        for (const s of p.getCompletableActionState().getStates((CompletableAction as any).french.getType())) {
            const a = s.getType();
            if (a.isLanguage() && !s.getCompleted() && s.getProgress() > 0) out.push(s.getViewModel());
        }
        return out;
    },
    languageScreen(p: any = player()): any[] {
        const out: any[] = [];
        const states = p.getCompletableActionState().getStates((CompletableAction as any).french.getType()).filter((s: any) => s.getType().isLanguage());
        const byId = new Map<string, any>(states.map((s: any) => [s.getType().name(), s]));
        const native = World.native(p);
        out.push(new HeaderTitleViewModel("Your Native Language"));
        const nd = LANGUAGE_BY_ID[native];
        if (nd) out.push(info((R.drawable as any)[nd.image], nd.title, `You grew up speaking ${nd.title}. ${nd.perk}`));
        const group = (title: string, ids: string[]) => {
            const rows = ids.filter((id) => id !== native && byId.has(id));
            if (!rows.length) return;
            out.push(new HeaderTitleViewModel(title));
            for (const id of rows) out.push(byId.get(id).getViewModel());
        };
        const needed = new Set(COUNTRY_DEFS.map((c) => c.lang ?? "english"));
        group("Languages for Moving Abroad", LANGUAGE_DEFS.filter((l) => needed.has(l.id)).map((l) => l.id));
        group("Other Languages", LANGUAGE_DEFS.filter((l) => !needed.has(l.id)).map((l) => l.id));
        return out;
    },
};


void Job; void Modifiers;
