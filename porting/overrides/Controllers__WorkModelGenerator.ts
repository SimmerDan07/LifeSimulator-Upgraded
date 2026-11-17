//@@ WorkModelGenerator.getSideHustleViewModels
/** Ported from Vineflower output (jadx could not decompile it). */
getSideHustleViewModels(): ArrayList<BaseViewModel> {
    const out = new ArrayList<BaseViewModel>();
    out.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.SectionHeader_SideHustle)));
    const player = GameStateManager.INSTANCE.getPersonState();
    const refresh = () => { const f = GameStateManager.INSTANCE.getMainGameFragment(); if (f != null) MainGameFragment.updateUI$default(f, null, 1, null); };
    for (const hustleState of player.getSideHustleState().getStates()) {
        const hustle = hustleState.getType();
        const desc = new SpannableStringBuilder();
        const notMet = hustle.requirementNotMetString(player);
        const locked = notMet != null;
        if (notMet != null) {
            ExtensionsKt.appendNormal$default(desc, notMet, null, null, null, 14, null);
        } else {
            ExtensionsKt.appendNormal$default(
                ExtensionsKt.appendBold$default(desc, Utils.INSTANCE.getString(R.string.Common_Skill) + ": ", null, null, null, 14, null),
                hustleState.getSkillLevel().getTitle(), hustleState.getSkillLevel().getColorId(), null, null, 12, null);
        }
        const buttons: ButtonViewModel[] = [];
        if (hustleState.getActiveProject() != null) {
            if (!hustleState.isCurrent()) {
                buttons.push(new ButtonViewModel(Utils.INSTANCE.getString(R.string.SideHustle_ResumeProject), null, false, false, false, false, false, {
                    invoke: () => { player.getSideHustleState().switchSideProject(hustleState.getType()); refresh(); },
                }, 126, null));
            }
        } else {
            for (const effort of SideHustle.ProjectEffort.values()) {
                const effortLocked = locked || hustleState.getSkillLevel().getRaw() < effort.getSkillLevelToUnlock().getRaw();
                buttons.push(new ButtonViewModel(effort.title(hustle), null, !locked, false, effortLocked, false, false, {
                    invoke: () => { GameStateManager.INSTANCE.getPersonState().startProject(hustle, effort); refresh(); },
                }, 98, null));
            }
        }
        out.add(new ActionCellMultipleOptionsViewModel(hustle.getImageId(), hustle.getTitle(),
            new TextLabelViewModel(desc, false, false, null, 14, null), TextLabelViewModel.INSTANCE.getHidden(), buttons, null, 32, null));
        if (hustleState.isCurrent()) {
            const project = hustleState.getActiveProject();
            if (project != null) {
                out.add(new ProgressBarCellViewModel("SideHustleProjectProgress", new ProgressBarViewModel(project.getProgressCurrent(), project.getProgressMax(), false, false, 12, null)));
            }
        }
        const completed = hustleState.getCompletedProjects().length;
        const cell = new LeftRightCellViewModel("ProjectList." + hustle.name(), completed + " " + hustle.getProjectNamePlural());
        if (completed > 0) {
            cell.setOnClick({ invoke: () => Utils.navigateTo$default(Utils.INSTANCE, GenericListType.sideHustleProjects, hustle.name(), false, 4, null) });
        }
        out.add(cell);
    }
    return out;
}
