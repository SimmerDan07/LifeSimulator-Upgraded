// Lifepaths tab (v0.14.0): hidden paths a life can take that change what your character is.
// The tab is in place; the first lifepath (Vampire) is being planned and is shown as coming soon.
import { ArrayList, R } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { HeaderTitleViewModel } from "../Models/HeaderTitleViewModel";
import { ActionCellSingleViewModel } from "../Models/ActionCellSingleViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import { ButtonViewModel } from "../Models/ButtonViewModel";
import { MainGameTab } from "../Enums/MainGameTab";

const text = (s: string) => new TextLabelViewModel(s, null, false, false, null, null);

export class LifepathsModelGenerator {
    gameTab: MainGameTab = MainGameTab.Lifepaths;

    generateViewModels(): GenericListFragmentViewModel {
        const out = new ArrayList<BaseViewModel>();
        out.add(new HeaderTitleViewModel("Lifepaths"));
        out.add(new ActionCellSingleViewModel(R.drawable.tab_lifepaths, "The All-Seeing Eye",
            text("Some lives don't follow the usual road. Lifepaths change what you are, how long you live and how the world sees you. Their secrets will appear here."),
            ButtonViewModel.INSTANCE.getHidden(), null, null));
        out.add(new HeaderTitleViewModel("Paths"));
        out.add(new ActionCellSingleViewModel(R.drawable.locked, "Vampire",
            text("Coming soon."),
            new ButtonViewModel("Locked", null, false, false, true, false, false, { invoke: () => null }), null, null));
        return new GenericListFragmentViewModel(out);
    }
}
