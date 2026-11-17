// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { ArrayList, R, SpannableStringBuilder } from "../runtime";
import { ActionCellMultipleOptionsViewModel } from "../Models/ActionCellMultipleOptionsViewModel";
import { AttributeState } from "../Managers/AttributeState";
import { BaseViewModel } from "../Models/BaseViewModel";
import { Business } from "../Enums/Business";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { ExtensionsKt } from "../Utils/ExtensionsKt";
import { GameStateManager } from "../Managers/GameStateManager";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { GenericListType } from "../Fragments/GenericListType";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { IViewModelGenerator } from "./IViewModelGenerator";
import { Job } from "../Enums/Job";
import { LeftRightCellViewModel } from "../Models/LeftRightCellViewModel";
import { MainGameFragment } from "../ui/bridge";
import { Modifiers } from "../Managers/Modifiers";
import { Player } from "../Managers/Player";
import { ProgressBarCellViewModel } from "../Models/ProgressBarCellViewModel";
import { ProgressBarViewModel } from "../Models/ProgressBarViewModel";
import { ProgressCellTappableViewModel } from "../Models/ProgressCellTappableViewModel";
import { SideHustle } from "../Enums/SideHustle";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { Utils } from "../Utils/Utils";
import { WorkAction } from "../Enums/WorkAction";
import { WorkButtonsViewModel } from "../Models/WorkButtonsViewModel";
import { WorkType } from "../Enums/WorkType";
import { Retirement } from "../Managers/Retirement";

export class WorkModelGenerator implements IViewModelGenerator {
    generateViewModels(): GenericListFragmentViewModel {
        let arrayList: ArrayList = new ArrayList();
        let arrayList2: ArrayList = new ArrayList();
        arrayList.addAll(this.getWorkViewModels());
        arrayList2.add(this.getWorkButtonsViewModel());
        arrayList.addAll(this.getSideHustleViewModels());
        arrayList.addAll(this.getBusinessViewModels());
        return new GenericListFragmentViewModel(arrayList, null, arrayList2);
    }
    getWorkViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.tab_name_work)));
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        for (const jobStateSingle of personState.getJobState().statesForPlayer(personState)) {
            arrayList.add(jobStateSingle.getViewModel());
        }
        const retirement = Retirement.cell();
        if (retirement != null) arrayList.add(retirement);
        return arrayList;
    }
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
    getBusinessViewModels(): ArrayList<BaseViewModel> {
        let arrayList: ArrayList = new ArrayList();
        arrayList.add(new HeaderTitleViewModel(Utils.INSTANCE.getString(R.string.Common_Business)));
        for (const singleBusinessState of GameStateManager.INSTANCE.getPersonState().getBusinessState().getStates()) {
            let type: Business = singleBusinessState.getType();
            let str: string = String();
            let hidden: ProgressBarViewModel = ProgressBarViewModel.INSTANCE.getHidden();
            if (singleBusinessState.getLevel() === 0) {
                str = Utils.INSTANCE.getString(R.string.Common_Business_NotStarted);
            } else if (singleBusinessState.getLevel() > 0) {
                str = (Utils.INSTANCE.getString(R.string.Common_Level) + " ") + singleBusinessState.getLevel();
                hidden = new ProgressBarViewModel(singleBusinessState.getMoraleProgress());
            }
            arrayList.add(new ProgressCellTappableViewModel(type.imageId(singleBusinessState.getLevel()), type.getBaseBusinessName(), new TextLabelViewModel(ExtensionsKt.appendNormal$default(new SpannableStringBuilder(), str, null, null, null, 14, null), false, false, null, 14, null), hidden, {
                invoke: () => {
                Utils.Companion.navigateTo$default(Utils.INSTANCE, GenericListType.businessDetails, singleBusinessState.getId(), false, 4, null);
            }
            }));
        }
        return arrayList;
    }
    getWorkButtonsViewModel(): WorkButtonsViewModel {
        let personState: Player = GameStateManager.INSTANCE.getPersonState();
        let workButtonType: WorkType = personState.getWorkButtonType();
        let arrayList: ArrayList = new ArrayList();
        for (const workAction of WorkAction.values()) {
            let spannableStringBuilder: SpannableStringBuilder = new SpannableStringBuilder("");
            ExtensionsKt.appendNormal$default(ExtensionsKt.appendAttributesString$default(ExtensionsKt.appendNewline(ExtensionsKt.appendBold$default(spannableStringBuilder, workAction.getTitleText(), R.color.flatWhite, 18, null, 8, null)), Modifiers.INSTANCE.modifierWithHappiness(workAction.getHappinessModifier()), null, 13, null, 10, null), " ", null, null, null, 14, null);
            if ((workButtonType === WorkType.none) || (workButtonType === WorkType.job)) {
                ExtensionsKt.appendNormal$default(spannableStringBuilder, (workAction.getPayModifier() + "x ") + Utils.INSTANCE.getString(R.string.Common_Pay), R.color.flatGreen, 13, null, 8, null);
            } else if (workButtonType === WorkType.sideHustle) {
                ExtensionsKt.appendNormal$default(spannableStringBuilder, (workAction.getSideHustleProgressModifier() + " ") + Utils.INSTANCE.getString(R.string.Common_Progress), R.color.flatGreen, 13, null, 8, null);
            }
            arrayList.add(new ButtonViewModel("", spannableStringBuilder, workButtonType !== WorkType.none, false, false, false, false, {
                invoke: () => {
                if (workButtonType !== WorkType.none) {
                    AttributeState.setDeltaValue$default(personState.getAttributeState(), Modifiers.INSTANCE.modifierWithHappiness(workAction.getHappinessModifier()), null, 2, null);
                }
                let i: WorkType = workButtonType;
                if (i !== WorkType.job) {
                    if (i !== WorkType.sideHustle) {
                        return;
                    }
                    personState.getSideHustleState().work(workAction.getSideHustleProgressModifier());
                } else {
                    let currentJob: Job = personState.getJobState().getCurrentJob();
                    if (currentJob != null) {
                        personState.getJobState().work(currentJob, workAction);
                    }
                }
            }
            }, 120, null));
        }
        let obj = arrayList.get(0);
        let obj2 = arrayList.get(1);
        let obj3 = arrayList.get(2);
        return new WorkButtonsViewModel((obj as unknown as ButtonViewModel), (obj2 as unknown as ButtonViewModel), (obj3 as unknown as ButtonViewModel));
    }
}
