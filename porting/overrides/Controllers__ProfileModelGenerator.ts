//@@ +imports
import { HousingState } from "../Managers/HousingState";
//@@ ProfileModelGenerator.getHousingViewModels
/** Ported from Vineflower output (jadx could not decompile it). */
getHousingViewModels(): ArrayList<BaseViewModel> {
    const out = new ArrayList<BaseViewModel>();
    out.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.section_header_housing)));
    const player = GameStateManager.INSTANCE.getPersonState();
    const refresh = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) f.updateUI(this.getGameTab()); };
    for (const housingType of Housing.INSTANCE.housingOptions(player)) {
        const housingState = player.getHousingState().getState(housingType);
        const desc = new SpannableStringBuilder("");
        const req = housingType.getRequiredItem();
        const locked = req != null && !player.getItemState().isOwned(req);
        if (locked) {
            ExtensionsKt.appendNormal$default(desc, Utils.Strings.INSTANCE.getRequiresString(req.getTitle()), null, null, null, 14, null);
        } else {
            if (housingState.getType().getPurchasable()) {
                ExtensionsKt.appendNormal$default(desc, Utils.INSTANCE.getString(R.string.Common_Buy) + ": " + ExtensionsKt.numberDisplayString$default(housingState.getType().getPurchasePrice(), false, 1, null), null, null, null, 14, null);
            }
            const rentLine = Utils.INSTANCE.getString(R.string.Bank_CashFlow_Rent) + ": " + ExtensionsKt.numberDisplayString$default(housingState.getType().getRentalCost(), false, 1, null);
            if (housingState.getType().getRentalEarning().compareTo(BigInteger.ZERO) > 0) {
                if (desc.toString().length > 0) {
                    ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(ExtensionsKt.appendBold$default(desc, " · ", null, null, null, 14, null), rentLine, null, null, null, 14, null));
                } else {
                    ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(desc, rentLine, null, null, null, 14, null));
                }
            } else if (desc.length > 0) {
                ExtensionsKt.appendNewline(desc);
            }
            if (housingState.getTotalRentalIncome().compareTo(BigInteger.ZERO) > 0) {
                ExtensionsKt.appendNewline(ExtensionsKt.appendNormal$default(
                    ExtensionsKt.appendNormal$default(desc, Utils.INSTANCE.getString(R.string.Bank_CashFlow_RentalIncome) + ": ", null, null, null, 14, null),
                    String(ExtensionsKt.numberDisplayString$default(housingState.getTotalRentalIncome(), false, 1, null)), R.color.flatGreen, null, null, 12, null));
            }
            ExtensionsKt.appendAttributesString$default(desc, housingState.getType().getModifiers(), null, null, null, 14, null);
        }
        const status = new SpannableStringBuilder("");
        if (housingState.getCurrentlyLivingHere()) {
            ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(status, Utils.INSTANCE.getString(R.string.Common_Current), R.color.flatBlue, null, null, 12, null));
        }
        if (housingState.getNumberOwned().compareTo(BigInteger.ZERO) > 0) {
            ExtensionsKt.appendBold$default(status, Utils.INSTANCE.getString(R.string.Housing_Label_Owned) + ": " + ExtensionsKt.numberDisplayString(housingState.getNumberOwned(), false), null, null, null, 14, null);
        }
        const statusLabel = status.length > 0 ? new TextLabelViewModel("", null, false, false, null, status, 30, null) : TextLabelViewModel.INSTANCE.getHidden();
        const buttons: ButtonViewModel[] = [];
        if (housingState.getType().getLivable()) {
            buttons.push(new ButtonViewModel(Utils.INSTANCE.getString(R.string.Housing_Action_MoveHere), null, !housingState.getCurrentlyLivingHere(), false, locked, false, false, {
                invoke: () => {
                    if (housingType.getNumberOfPetsAllowed() < GameStateManager.INSTANCE.getPersonState().getFamilyState().getAlivePets().size()) {
                        AlertManager.INSTANCE.showTooManyPetsAlert(housingType);
                    } else {
                        GameStateManager.INSTANCE.getPersonState().getHousingState().moveHere(housingState.getType());
                        refresh();
                    }
                },
            }, 104, null));
        }
        if (housingState.getType().getPurchasable()) {
            const canAfford = player.getMoneyState().getCash().compareTo(housingState.getType().getPurchasePrice()) >= 0;
            const ownsOne = housingState.getNumberOwned().compareTo(BigInteger.ONE) >= 0;
            const buy = Utils.INSTANCE.getString(R.string.Housing_Action_Purchase);
            const sell = Utils.INSTANCE.getString(R.string.Common_Sell);
            const max = Utils.INSTANCE.getString(R.string.Common_Max);
            buttons.push(new ButtonViewModel(buy, null, canAfford, false, locked, false, false, {
                invoke: () => { HousingState.purchase$default(GameStateManager.INSTANCE.getPersonState().getHousingState(), housingState.getType(), null, 2, null); refresh(); },
            }, 106, null));
            buttons.push(new ButtonViewModel(buy + " " + max, null, canAfford, false, locked, false, false, {
                invoke: () => { GameStateManager.INSTANCE.getPersonState().getHousingState().purchaseMax(housingState.getType()); refresh(); },
            }, 106, null));
            buttons.push(new ButtonViewModel(sell, null, ownsOne, false, locked, false, false, {
                invoke: () => { HousingState.sell$default(GameStateManager.INSTANCE.getPersonState().getHousingState(), housingState.getType(), null, 2, null); refresh(); },
            }, 106, null));
            buttons.push(new ButtonViewModel(sell + " " + max, null, ownsOne, false, locked, false, false, {
                invoke: () => { GameStateManager.INSTANCE.getPersonState().getHousingState().sellMax(housingState.getType()); refresh(); },
            }, 106, null));
        }
        out.add(new ActionCellMultipleOptionsViewModel(housingState.getType().getImageId(), housingState.getType().getTitle(),
            new TextLabelViewModel("", null, false, false, null, desc, 30, null), statusLabel, buttons, null, 32, null));
    }
    return out;
}
