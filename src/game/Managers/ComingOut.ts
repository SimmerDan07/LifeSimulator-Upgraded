// Love tab: "Come Out" — change your character's sexuality (straight / gay / bisexual).
// Who you meet when dating follows your sexuality from then on (Sex.randomPartnerGender uses it).
import { R } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { Modifiers } from "./Modifiers";
import { Sexuality } from "../Enums/Sexuality";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { RelationshipProgressStatus } from "../Enums/RelationshipProgressStatus";

const ICON = R.drawable.love_comingout;

export const ComingOut = {
    minAge: 13,
    /** Chance each parent is supportive (otherwise they need some time). */
    supportChance: 0.8,

    available(p: any): boolean { return p.getAgeInYears() >= ComingOut.minAge; },

    cell(): ActionCellSingleViewModel | null {
        const p = GameStateManager.INSTANCE.getPersonState();
        if (!ComingOut.available(p)) return null;
        return new ActionCellSingleViewModel(ICON, "Come Out",
            new TextLabelViewModel(`Share who you are. You're currently ${p.getSexuality().getTitle().toLowerCase()}.`, null, false, false, null, null),
            new ButtonViewModel("Come out", null, true, false, false, true, false, { invoke: () => { ComingOut.choose(); return null; } }),
            null, null);
    },

    choose() {
        const p = GameStateManager.INSTANCE.getPersonState();
        const options = [Sexuality.straight, Sexuality.gay, Sexuality.bisexual].filter((s) => s !== p.getSexuality());
        const act = (s: Sexuality) => new AlertActionViewModel(`I'm ${s.getTitle().toLowerCase()}`, { invoke: () => { ComingOut.comeOut(s); return null; } });
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Come Out",
            `You're currently ${p.getSexuality().getTitle().toLowerCase()}. How do you want to come out?`, ICON, null, null,
            act(options[0]), new AlertActionViewModel("Cancel", { invoke: () => null }), [act(options[1])], AlertType.Alert, 0, null), false, 2, null);
    },

    /** Changes sexuality, gives a happiness/sanity lift, and family react. Returns the message shown. */
    comeOut(s: Sexuality): string {
        const p = GameStateManager.INSTANCE.getPersonState();
        p.setSexuality(s);
        p.getAttributeState().setDeltaValueImmediate(new Modifiers(0, 10, 5));
        const reactions: string[] = [];
        const max = RelationshipProgressStatus.INSTANCE.getMaxValue();
        for (const parent of p.getFamilyState().getParents()) {
            if (!parent.getIsAlive()) continue;
            const ok = Math.random() < ComingOut.supportChance;
            parent.setRelationshipProgress(Math.max(0, Math.min(max, parent.getRelationshipProgress() + (ok ? 10 : -15))));
            reactions.push(`${parent.getFirstName()} ${ok ? "hugged you and said they're proud of you" : "was surprised and needs some time"}.`);
        }
        const partner = p.getFamilyState().getPartner();
        if (partner != null && partner.getIsAlive()) reactions.push(`${partner.getFirstName()} listened and thanked you for telling them.`);
        const msg = `You came out as ${s.getTitle().toLowerCase()}! It feels good to be yourself.` + (reactions.length ? "\n\n" + reactions.join("\n") : "");
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("You Came Out", msg, ICON, null, null, null, null, null, null, 504, null), false, 2, null);
        const f = GameStateManager.INSTANCE.getMainGameFragment();
        if (f != null) f.updateUI(null);
        return msg;
    },
};
