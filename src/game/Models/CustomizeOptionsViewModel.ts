// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { CustomizeSingleOptionViewModel } from "./CustomizeSingleOptionViewModel";

export class CustomizeOptionsViewModel extends BaseViewModel {
    defaultOptionTitle: string = null;
    identifier: string = null;
    optionsViewModels: CustomizeSingleOptionViewModel[] = null;
    title: string = null;
    constructor(title: string, defaultOptionTitle: string, options: CustomizeSingleOptionViewModel[]) {
        super();
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(defaultOptionTitle, "defaultOptionTitle");
        Intrinsics.checkParameterIsNotNull(options, "options");
        this.identifier = title;
        this.title = title;
        this.defaultOptionTitle = defaultOptionTitle;
        this.optionsViewModels = options;
    }
    getType(): CellType {
        return CellType.customize_options;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getTitle(): string {
        return this.title;
    }
    getDefaultOptionTitle(): string {
        return this.defaultOptionTitle;
    }
    setDefaultOptionTitle(str: string): void {
        Intrinsics.checkParameterIsNotNull(str, "<set-?>");
        this.defaultOptionTitle = str;
    }
    getOptionsViewModels(): CustomizeSingleOptionViewModel[] {
        return this.optionsViewModels;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof CustomizeOptionsViewModel)) {
            return false;
        }
        let customizeOptionsViewModel: CustomizeOptionsViewModel = (other as unknown as CustomizeOptionsViewModel);
        return Intrinsics.areEqual(customizeOptionsViewModel.title, this.title) && Intrinsics.areEqual(this.optionsViewModels, customizeOptionsViewModel.optionsViewModels);
    }
}
