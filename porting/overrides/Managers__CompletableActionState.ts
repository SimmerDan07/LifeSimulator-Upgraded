//@@ +imports
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
//@@ CompletableActionState.CompletableActionStateSingle.getViewModel
/** Ported from Vineflower output (jadx could not decompile it). */
getViewModel(): BaseViewModel {
    const player = GameStateManager.INSTANCE.getPersonState();
    const imageId = this.type.getImageId();
    const title = this.type.getTitle();
    let description: string | null = this.type.getDescription();
    let locked = false;
    if (this.type === CompletableAction.masters) {
        const degrees = CompletableAction.INSTANCE.getCollegeDegrees().filter((d) => player.getCompletableActionState().getState(d).getCompleted());
        if (degrees.length === 0) locked = true;
    }
    const prereq = this.type.getPrerequiste();
    if (prereq != null) locked = !player.getCompletableActionState().getState(prereq).getCompleted();
    if (locked) {
        const what = this.type.getPrerequiste() != null ? this.type.getPrerequiste().getTitle() : Utils.INSTANCE.getString(R.string.Common_None);
        description = Utils.Strings.INSTANCE.getRequiresString(what);
    }
    let progress = this.progress;
    const required = this.type.getTimeRequiredInWeeks(player);
    if (this.completed && progress !== required) progress = required;
    const bar = new ProgressBarViewModel(progress, required, false, false, 12, null);
    const label = this.completed ? Utils.INSTANCE.getString(R.string.Common_Complete) : ExtensionsKt.numberDisplayString$default(this.type.getCostPerWeek(), false, 1, null);
    const enabled = !this.completed && player.getMoneyState().getCash().compareTo(this.type.getCostPerWeek()) >= 0;
    const button = new ButtonViewModel(label, null, enabled, false, locked, false, false, {
        invoke: () => GameStateManager.INSTANCE.getPersonState().learnSkillOrEducation(this.getType()),
    }, 96, null);
    const text = description != null ? new TextLabelViewModel(description, null, false, false, null, null, 62, null) : TextLabelViewModel.INSTANCE.getHidden();
    return new ActionProgressViewModel(imageId, title, text, null, bar, null, button, 32, null);
}
