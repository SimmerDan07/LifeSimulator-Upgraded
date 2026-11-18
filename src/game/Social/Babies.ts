// Having children (v0.15.0).
// - Make a Baby: only a man and a woman (by sex), neither infertile, neither a vampire. The woman carries it.
//   (Before, two men could "make a baby" and the game said the husband was pregnant.)
// - Surrogacy: two men. A surrogate carries your baby ($100,000).
// - Artificial Insemination: two women. One of you carries it ($15,000).
// - Adopt a Child: any couple, and now also on your own (18+).
// - Vampires (you or your partner) can't have biological children: adoption only.
import { R } from "../runtime";
import { GameStateManager } from "../Managers/GameStateManager";
import { AlertManager } from "../Managers/AlertManager";
import { AlertViewModel } from "../Managers/AlertViewModel";
import { Person } from "../Managers/Person";
import { Sex } from "../Enums/Sex";
import { Trait } from "../Enums/Trait";
import { Constants } from "../Utils/Constants";
import { Vampire } from "../Lifepaths/Vampire";

const player = (): any => GameStateManager.INSTANCE.getPersonState();
const refreshUI = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(null); };

export type Carrier = "you" | "partner" | "surrogate";

export const Babies = {
    surrogacyPrice: 100_000,
    inseminationPrice: 15_000,
    adoptionPrice: 50_000,

    partner(p: any = player()): any { return p.getFamilyState().getPartner(); },
    infertile(p: any): boolean { try { return p.hasTrait(Trait.infertile); } catch { return false; } },
    /** "mixed" (a man and a woman), "men", "women", or null with no partner. By sex, not gender. */
    couple(p: any = player()): "mixed" | "men" | "women" | null {
        const partner = Babies.partner(p);
        if (partner == null || !partner.getIsAlive()) return null;
        const a = p.getSex(), b = partner.getSex();
        if (a !== b) return "mixed";
        return a === Sex.male ? "men" : "women";
    },
    pregnant(p: any = player()): boolean { return p.getFamilyState().getPregnantChild() != null; },
    biological(p: any = player()): boolean { return Vampire.canHaveBiologicalKids(p); },

    /** A man and a woman can make a baby the usual way. */
    canMakeBaby(p: any = player()): boolean { return Babies.couple(p) === "mixed" && !Babies.infertile(p) && Babies.biological(p); },
    canSurrogacy(p: any = player()): boolean { return Babies.couple(p) === "men" && Babies.biological(p); },
    /** Two women: who carries the baby (you unless you can't), or null if neither can. */
    inseminationCarrier(p: any = player()): Carrier | null {
        if (Babies.couple(p) !== "women" || !Babies.biological(p)) return null;
        return Babies.infertile(p) ? "partner" : "you";
    },

    /** Start a pregnancy carried by `carrier`. */
    startPregnancy(p: any, carrier: Carrier): any {
        const child = Person.INSTANCE.makeBabyForPlayer(p);
        (child as any).carrier = carrier;
        p.getFamilyState().getFamilyMembers().add(child);
        return child;
    },
    carrierOf(child: any): Carrier {
        if (child?.carrier) return child.carrier;
        // older saves: the woman of the couple carried it
        const p = player();
        return p?.getSex?.() === Sex.male ? "partner" : "you";
    },
    /** "You are" / "Your wife is" / "Your surrogate is" (followed by "pregnant"). */
    carrierPhrase(child: any): string {
        const c = Babies.carrierOf(child);
        if (c === "surrogate") return "Your surrogate is";
        if (c === "partner") {
            const partner = Babies.partner();
            const title = partner?.getTitle?.()?.toLowerCase?.() ?? "partner";
            return `Your ${title} is`;
        }
        return "You are";
    },
    announce(child: any) {
        const weeks = Constants.Time.INSTANCE.getPregnancyTimeInWeeks();
        const c = Babies.carrierOf(child);
        const msg = c === "surrogate" ? `A surrogate is carrying your baby! They'll be born in ${weeks} weeks.`
            : `${Babies.carrierPhrase(child)} pregnant! Your baby will be born in ${weeks} weeks.`;
        try { AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("You are going to be a parent!", msg, R.drawable.alert_pregnant, null, null, null, null, null, null, 504, null), false, 2, null); } catch { /* no UI */ }
    },
    adopt(p: any = player()): any {
        const child = Person.INSTANCE.adoptChildForPlayer(p);
        p.getFamilyState().getFamilyMembers().add(child);
        try { AlertManager.INSTANCE.showBabyBornAlert(child, true); } catch { /* no UI */ }
        refreshUI();
        return child;
    },
};
