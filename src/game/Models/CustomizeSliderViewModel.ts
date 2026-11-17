// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { SliderViewModel } from "./SliderViewModel";

export class CustomizeSliderViewModel extends BaseViewModel {
    identifier: string = null;
    sliderViewModel: SliderViewModel = null;
    title: string = null;
    constructor(title: string, sliderViewModel: SliderViewModel) {
        super();
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(sliderViewModel, "sliderViewModel");
        this.identifier = String.valueOf(sliderViewModel.getInitialValue());
        this.title = title;
        this.sliderViewModel = sliderViewModel;
    }
    getType(): CellType {
        return CellType.customize_slider;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getTitle(): string {
        return this.title;
    }
    getSliderViewModel(): SliderViewModel {
        return this.sliderViewModel;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof CustomizeSliderViewModel)) {
            return false;
        }
        let customizeSliderViewModel: CustomizeSliderViewModel = (other as unknown as CustomizeSliderViewModel);
        return Intrinsics.areEqual(customizeSliderViewModel.sliderViewModel, this.sliderViewModel) && Intrinsics.areEqual(customizeSliderViewModel.title, this.title);
    }
}
