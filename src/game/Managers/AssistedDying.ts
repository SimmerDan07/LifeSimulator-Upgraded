// Health tab: "Assisted Dying" — lets an adult character end their life for a fee. The life then ends the
// normal way (death pop-up, life summary, cemetery, "Continue as your child").
import { BigInteger, R } from "../runtime";
import { GameStateManager } from "./GameStateManager";
import { AlertManager } from "./AlertManager";
import { AlertViewModel } from "./AlertViewModel";
import { AlertActionViewModel } from "./AlertActionViewModel";
import { AlertType } from "./AlertType";
import { MoneyState } from "./MoneyState";
import { MoneyUpdateType } from "../Enums/MoneyUpdateType";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";

export const AssistedDying = {
    /** Price in US dollars (shown in the player's currency). */
    cost: 10000,
    minAge: 18,

    price(): BigInteger { return BigInteger.valueOf(AssistedDying.cost); },
    available(player: any): boolean { return player.getAgeInYears() >= AssistedDying.minAge; },

    cell(): ActionCellSingleViewModel | null {
        const p = GameStateManager.INSTANCE.getPersonState();
        if (!AssistedDying.available(p)) return null;
        const price = ExtensionsKt.numberDisplayString(AssistedDying.price(), true);
        return new ActionCellSingleViewModel(null, "Assisted Dying",
            new TextLabelViewModel("End this life peacefully with medical assistance.", null, false, false, null, null),
            new ButtonViewModel(price, null, true, false, false, true, false, { invoke: () => { AssistedDying.confirm(); return null; } }),
            null, null);
    },

    confirm() {
        const p = GameStateManager.INSTANCE.getPersonState();
        const price = ExtensionsKt.numberDisplayString(AssistedDying.price(), true);
        if (p.getMoneyState().getCash().compareTo(AssistedDying.price()) < 0) {
            AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Assisted Dying", `This costs ${price}. You don't have enough cash.`,
                R.drawable.health_hospitalstay, null, null, null, null, null, null, 504, null), false, 2, null);
            return;
        }
        AlertManager.showAlert$default(AlertManager.INSTANCE, new AlertViewModel("Assisted Dying",
            `Are you sure? This will end ${p.getFullName()}'s life (age ${p.getAgeInYears()}) for ${price}. ` +
            `You'll see the life summary and, if you have children aged 8 or older, you can continue as one of them.`,
            R.drawable.health_hospitalstay, null, null,
            new AlertActionViewModel("End this life", { invoke: () => { AssistedDying.perform(); return null; } }),
            new AlertActionViewModel("Cancel", { invoke: () => null }),
            null, AlertType.Alert, 0, null), false, 2, null);
    },

    perform() {
        const p = GameStateManager.INSTANCE.getPersonState();
        if (!GameStateManager.INSTANCE.getGlobalStateManager().getSaveState().getHasGameStarted()) return;
        MoneyState.updateMoney$default(p.getMoneyState(), AssistedDying.price(), MoneyUpdateType.directSpend, null, null, 12, null);
        AlertManager.INSTANCE.showDeathAlertWithMessage(
            `${p.getFirstName()} passed away peacefully at age ${p.getAgeInYears()}, with medical assistance.`, "Assisted dying");
        const f = GameStateManager.INSTANCE.getMainGameFragment();
        if (f != null) f.updateUI(null);
    },
};
