// v0.27.0 "The World Update": the rules for the 113 new activities (data in ActivityData.ts) and the Leisure tab layout.
//
// - Locks: festivals only in their months, weather activities only in their seasons (flipped south of the equator),
//   local favourites only in their country, casinos not where gambling is banned, Speed Dating for singles, a house
//   party needs a home, nothing but the prison yard while you're in prison.
// - Kids: family-friendly activities are free under 18 ("your parents pay"), like the seasonal ones.
// - Vampires: outdoor activities are daytime (sunlight costs happiness); night activities are safe.
// - Effects: some activities do more than change your mood (meeting someone, training a hobby, gambling, helping
//   your career, getting better in a fight…). See EFFECTS.
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { Modifiers } from "../Managers/Modifiers";
import { MoneyState } from "../Managers/MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { Leisure } from "../Enums/Leisure";
import { Housing } from "../Enums/Housing";
import { LoverPersonality } from "../Enums/LoverPersonality";
import { AlertManager } from "../Managers/AlertManager";
import { Hobbies } from "../Managers/Hobbies";
import { LifeMoments } from "../Managers/LifeMoments";
import { Seasons } from "../Managers/Seasons";
import { Relationships } from "../Social/Relationships";
import { Vampire } from "../Lifepaths/Vampire";
import { Celebrity } from "../Lifepaths/Celebrity";
import { CompletableAction } from "../Enums/CompletableAction";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { Utils } from "../Utils/Utils";
import { GenericListType } from "../Fragments/GenericListType";
import { ACTIVITY_CATEGORIES, ACTIVITY_DEFS, ActivityDef } from "./ActivityData";
import { COUNTRY_BY_ID } from "./WorldData";
import { World } from "./World";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const attr = (p: any, h: number, hap: number, san: number) => p.getAttributeState().setDeltaValueImmediate(new Modifiers(h, hap, san));
const roll = (x: number) => Math.random() < x;
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const earn = (p: any, n: number) => MoneyState.updateMoney$default(p.getMoneyState(), BigInteger.valueOf(Math.round(n)), MoneyUpdateType.misc, null, null, 12, null);
const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const alive = (x: any) => x != null && (x.getIsAlive?.() ?? true);
const result = (title: string, msg: string, image: any) => { try { LifeMoments.result(title, msg, image); } catch { /* no UI */ } };
const inJail = (p: any) => { try { return !!p.getCrimeState().getIsInJail(); } catch { return false; } };
const hobby = (p: any, id: string, n: number) => { const s = Hobbies.state(id, p); s.skill = Math.min(100, (s.skill ?? 0) + n); };
const single = (p: any) => { try { return p.getFamilyState().getPartner() == null; } catch { return true; } };

export const Activities = {
    defs: ACTIVITY_DEFS,
    /** Other modules react to good deeds (Crime: the police cool down a little). */
    goodDeedHooks: [] as ((p: any) => void)[],
    leisure(id: string): Leisure { return (Leisure as any)[id]; },
    /** Fight experience from martial arts classes (prison riots, gang fights, vampire hunters): up to +15%. */
    fightBonus(p: any = player()): number { return Math.min(0.15, (p?.activityStats?.martial ?? 0) * 0.01); },
    stats(p: any): Record<string, number> { return p.activityStats ?? (p.activityStats = {}); },
    jailOnly(l: Leisure): boolean { return Leisure.INSTANCE.getJailEvent().includes(l); },

    /** Why this leisure option is locked right now (null = it isn't). Also covers moving abroad. */
    lock(l: Leisure, p: any): string | null {
        if (inJail(p) && !Activities.jailOnly(l)) return "Not while you're in prison";
        const c = l.getTravelCountry();
        if (c != null) return World.moveBlock(c, p);
        const a = l.act();
        if (a == null) return null;
        const here = p.getCountry().name();
        if (a.country && a.country !== here) return `Only in ${COUNTRY_BY_ID[a.country]?.name ?? a.country}`;
        if (a.notIn?.includes(here)) return `Not allowed in ${p.getCountry().getTitle()}`;
        if (a.months && !a.months.includes(Seasons.monthIndex(p))) return `Only in ${a.months.map((m) => MONTHS[m]).join(" and ")}`;
        if (a.seasons && !a.seasons.includes(Seasons.season(p))) return `Not in ${Seasons.name(p).toLowerCase()} (${a.seasons.join(", ")} only)`;
        if (a.effect === "speedDating" && !single(p)) return "Singles only";
        if (a.effect === "party") {
            try { if (p.getHousingState().currentHousing().getType() === Housing.homeless) return "You need a home to throw a party"; } catch { /* ignore */ }
        }
        return null;
    },
    cost(l: Leisure, p: any): number {
        const a = l.act();
        if (a == null) return 0;
        return a.family && p.getAgeInYears() < 18 ? 0 : a.cost;
    },
    note(l: Leisure): string | null {
        if (l.getTravelCountry() != null) return World.moveNote(l);
        // v0.27.0: the original prison yard rows say what they do to your parole
        switch (l.name()) {
            case "smokeCigarette": case "stareAtWall": return "Keep your head down: counts as good behaviour.\n";
            case "prisonRiot": return "Win respect, or get beaten up. Either way it hurts your behaviour (and parole).\n";
            case "prisonEscape": return (Vampire.isVampire(player()) && Vampire.has("shadowStep", player()))
                ? "Shadow Step: the walls can't hold you.\n"
                : "Long odds. If you're caught you get extra time and lose your good behaviour.\n";
        }
        const a = l.act();
        if (a == null) return null;
        const p = player();
        const bits: string[] = [a.blurb];
        if (a.months) bits.push(`Only in ${a.months.map((m) => MONTHS[m]).join(" and ")}.`);
        if (a.seasons) bits.push(`Seasons: ${a.seasons.join(", ")}.`);
        if (a.family && a.cost > 0 && p.getAgeInYears() < 18) bits.push("Your parents pay.");
        if (a.night && Vampire.isVampire(p)) bits.push("At night: no sunlight.");
        return bits.join(" ") + "\n";
    },

    /** After the week (Player.leisureAction). */
    onLeisure(p: any, l: Leisure) {
        const a = l.act();
        if (a == null) return;
        const st = Activities.stats(p);
        st[a.id] = (st[a.id] ?? 0) + 1;
        if (a.effect && EFFECTS[a.effect]) { try { EFFECTS[a.effect](p, a); } catch { /* ignore */ } }
    },

    // ------------------------------------------------------------------ Leisure tab
    localCells(p: any = player()): any[] {
        const out: any[] = [];
        const here = p.getCountry().name();
        const list = ACTIVITY_DEFS.filter((a) => a.country === here);
        if (!list.length) return out;
        out.push(new HeaderTitleViewModel(`Local Favourites: ${p.getCountry().getTitle()}`));
        for (const a of list) out.push(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, Activities.leisure(a.id), null, 2, null));
        return out;
    },
    categoryCells(p: any = player()): any[] {
        const out: any[] = [new HeaderTitleViewModel("Things to Do")];
        for (const c of ACTIVITY_CATEGORIES) {
            const list = ACTIVITY_DEFS.filter((a) => a.cat === c.id);
            const open = list.filter((a) => Activities.leisure(a.id).requirementNotMetString(p) == null).length;
            out.push(new ActionCellSingleViewModel((R.drawable as any)[c.image], c.title, text(`${c.blurb}\n${list.length} activities · ${open} you can do now`),
                new ButtonViewModel("Browse", null, true, false, false, false, false,
                    { invoke: () => { Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.lifepath, "activities:" + c.id, false, 4, null); return null; } }), null, null));
        }
        return out;
    },
    categoryTitle(cat: string): string { return ACTIVITY_CATEGORIES.find((c) => c.id === cat)?.title ?? "Things to Do"; },
    screenCells(cat: string, p: any = player()): any[] {
        const out: any[] = [];
        const c = ACTIVITY_CATEGORIES.find((x) => x.id === cat);
        if (c) out.push(new ActionCellSingleViewModel((R.drawable as any)[c.image], c.title, text(`${c.blurb}\nIt's ${Seasons.label(p)} in ${p.getCountry().getTitle()}.`), ButtonViewModel.INSTANCE.getHidden(), null, null));
        for (const a of ACTIVITY_DEFS.filter((x) => x.cat === cat)) out.push(ActionCellSingleViewModel.Companion.initWithActionDescriptor$default(ActionCellSingleViewModel.INSTANCE, Activities.leisure(a.id), null, 2, null));
        return out;
    },
};

// ---------------------------------------------------------------- effects
const EFFECTS: Record<string, (p: any, a: ActivityDef) => void> = {
    // v0.28.0: risky fun can now end in a real injury (Illness.onLeisure: broken bones, concussions)
    risky: () => { /* see Illness.onLeisure */ },
    fishing: (p, a) => {
        if (!roll(0.3)) return;
        const fish = pick(["a huge trout", "a bass the size of your arm", "a salmon", "an old boot (it still counts)"]);
        attr(p, 0, 4, 2);
        result("Catch of the Day", `You caught ${fish}! (+4 happiness)`, (R.drawable as any)[a.image]);
    },
    golf: (p, a) => {
        const j = p.getJobState().getCurrentJobState?.();
        if (j == null || !roll(0.3)) return;
        j.progress = (j.progress ?? 0) + 2;
        result("Networking on the Green", "Your boss was in your group and loved your swing. (+2 weeks toward a promotion)", (R.drawable as any)[a.image]);
    },
    martial: (p) => { const st = Activities.stats(p); st.martial = (st.martial ?? 0) + 1; },
    library: (p) => hobby(p, "writing", 2),
    cooking: (p) => hobby(p, "cooking", 3),
    run: (p) => hobby(p, "running", 2),
    karaoke: (p) => { try { Celebrity.train(p, "music", 1); } catch { /* ignore */ } },
    meet: (p, a) => {
        if (single(p) && p.getAgeInYears() >= 18 && roll(0.2)) {
            try { AlertManager.INSTANCE.showMetPartnerAlert(pick(LoverPersonality.values())); return; } catch { /* ignore */ }
        }
        if (roll(0.15) && Relationships.canMeetPeople(p) == null) {
            const f = Relationships.makeFriend("out", p);
            if (f) result("New Friend", `You hit it off with ${f.getFirstName()} on the dance floor. They're on your Love tab now.`, (R.drawable as any)[a.image]);
        }
    },
    speedDating: (p, a) => {
        if (roll(0.5)) { try { AlertManager.INSTANCE.showMetPartnerAlert(pick(LoverPersonality.values())); return; } catch { /* ignore */ } }
        result("No Sparks", "Twenty dates, zero connections. Maybe next time.", (R.drawable as any)[a.image]);
    },
    party: (p, a) => {
        if (p.getAgeInYears() < 18 && Relationships.livesWithParents(p) && roll(0.3)) {
            for (const x of Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]) if (alive(x) && x.getRelationship?.()?.name?.() === "parent") x.setRelationshipProgress(Math.max(0, x.getRelationshipProgress() - 30));
            attr(p, 0, -5, -3);
            result("Busted!", "Your parents came home early. The house is a mess and you're grounded. (−30 with your parents)", (R.drawable as any)[a.image]);
            return;
        }
        if (roll(0.5) && Relationships.canMeetPeople(p) == null) {
            const f = Relationships.makeFriend("party", p);
            if (f) result("Party Animal", `Best party of the year. ${f.getFirstName()} stayed to help clean up — you're friends now.`, (R.drawable as any)[a.image]);
        }
    },
    trivia: (p, a) => {
        const degree = CompletableAction.INSTANCE.getCollegeDegrees().some((d: any) => p.getCompletableActionState().isCompleted(d));
        if (!roll(degree ? 0.4 : 0.15)) return;
        earn(p, 200);
        result("Trivia Champions", "Your team won! The prize: $200 off the bar tab.", (R.drawable as any)[a.image]);
    },
    casino: (p, a) => {
        const r = Math.random();
        let msg: string;
        if (r < 0.02) { earn(p, 25000); attr(p, 0, 20, 0); msg = "JACKPOT! The slot machine wouldn't stop ringing: $25,000!"; }
        else if (r < 0.32) { earn(p, 1000); attr(p, 0, 5, 0); msg = "Red came up. You doubled your money: $1,000."; }
        else if (r < 0.42) { earn(p, 500); msg = "You broke even. The free drinks were nice."; }
        else { attr(p, 0, -3, -2); msg = "Black came up. The $500 is gone."; }
        const st = Activities.stats(p);
        if ((st.casino ?? 0) >= 10 && roll(0.1)) { attr(p, 0, 0, -8); msg += "\n\nYou're here every week. Maybe it's becoming a problem. (−8 sanity)"; }
        result("At the Casino", msg, (R.drawable as any)[a.image]);
    },
    friends: (p) => { for (const f of Relationships.friends(p)) if (alive(f)) f.setRelationshipProgress(Math.min(1000, f.getRelationshipProgress() + 10)); },
    family: (p) => { for (const x of Relationships.familyPeople(p)) if (alive(x) && x.getPetType?.() == null) x.setRelationshipProgress(Math.min(1000, x.getRelationshipProgress() + 10)); },
    animals: (p) => { if (Vampire.isVampire(p) && Vampire.has("beastTongue", p)) attr(p, 0, 5, 0); },
    goodDeed: (p) => {
        try { const s = Celebrity.peek(p); if (s && s.fans >= 1000) Celebrity.addFans(p, s.fans * 0.005); } catch { /* ignore */ }
        for (const hook of Activities.goodDeedHooks) { try { hook(p); } catch { /* ignore */ } }
    },
    blood: (p, a) => {
        if (!Vampire.isVampire(p)) return;
        const s = Vampire.state(p);
        attr(p, 3, 0, 0);   // undo the mortal −3 health (you didn't actually give any)
        s.thirst = Math.max(0, s.thirst - 15);
        s.suspicion = Math.min(100, s.suspicion + 5);
        result("A Very Thirsty Volunteer", "You didn't donate. You helped yourself to a bag in the back. (−15 hunger, +5 Rumours)", (R.drawable as any)[a.image]);
    },
    tutor: (p) => {
        earn(p, 50);
        const j = p.getJobState().getCurrentJobState?.();
        if (j != null && p.getJobState().getCurrentJob()?.name?.() === "teacher") j.progress = (j.progress ?? 0) + 1;
    },
    remember: (p, a) => {
        const dead = (Array.from(p.getFamilyState().getFamilyMembers() as any) as any[]).filter((x) => !alive(x) && x.getPetType?.() == null);
        if (!dead.length) return;
        const x = pick(dead);
        attr(p, 0, 6, 6);
        result("Remembering", `You built an altar with marigolds and ${x.getFirstName()}'s favourite food. It felt like they were there. (+6 happiness, +6 sanity)`, (R.drawable as any)[a.image]);
    },
};

export function installActivityHooks() {
    Leisure.activityLock = (l, p) => Activities.lock(l, p);
    Leisure.activityNote = (l) => Activities.note(l);
    Leisure.activityCost = (l, p) => Activities.cost(l, p);
}
