//@@ +imports
import { UIBridge } from "../ui/bridge";
//@@ AlertManager.show
show(alertViewModel: AlertViewModel): void {
    UIBridge.showAlert(alertViewModel);
    if (alertViewModel.getType() === AlertType.Alert) AlertManager.INSTANCE.setCurrentlyShowing(true);
    const imageId = alertViewModel.getImageId();
    if (imageId != null) {
        const t = alertViewModel.getTitle();
        const S = (k: string) => Utils.INSTANCE.getString(k);
        if (t === S("Alert_DeathTitle") || t === S("FamilyAlert_DeathTitle")) SoundManager.INSTANCE.playSound(SoundEffect.Bell);
        else if (t === S("Alert_TutorialComplete_Title")) SoundManager.INSTANCE.playSound(SoundEffect.Coin);
        else if (t === S("CrimeFailure_AlertTitle")) SoundManager.INSTANCE.playSound(SoundEffect.Siren);
        else if (t === S("BabyBornAlertTitle")) SoundManager.INSTANCE.playSound(SoundEffect.BabyCry);
        else if (t === S("Alert_MovedToCountry_Title")) SoundManager.INSTANCE.playSound(SoundEffect.Plane);
        else SoundManager.INSTANCE.playSound(SoundEffect.Important);
    }
}
//@@ AlertManager.createAlert
//@@ AlertManager.createBanner
