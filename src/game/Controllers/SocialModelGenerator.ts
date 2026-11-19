// v0.26.0: the Social tab (social media). The rules live in src/game/Social/SocialMedia.ts.
import { ArrayList } from "../runtime";
import { BaseViewModel } from "../Models/BaseViewModel";
import { GenericListFragmentViewModel } from "../Fragments/GenericListFragmentViewModel";
import { MainGameTab } from "../Enums/MainGameTab";
import { GameStateManager } from "../Managers/GameStateManager";
import { SocialMedia } from "../Social/SocialMedia";

export class SocialModelGenerator {
    gameTab: MainGameTab = MainGameTab.Social;
    generateViewModels(): GenericListFragmentViewModel {
        const out = new ArrayList<BaseViewModel>();
        for (const c of SocialMedia.cells(GameStateManager.INSTANCE.getPersonState())) out.add(c);
        return new GenericListFragmentViewModel(out);
    }
}
