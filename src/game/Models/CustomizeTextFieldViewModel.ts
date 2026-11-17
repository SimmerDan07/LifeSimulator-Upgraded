// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";
import { EditableTextFieldViewModel } from "./EditableTextFieldViewModel";

export class CustomizeTextFieldViewModel extends BaseViewModel {
    editTextViewModel: EditableTextFieldViewModel = null;
    identifier: string = null;
    title: string = null;
    constructor(title: string, editTextModel: EditableTextFieldViewModel) {
        super();
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(editTextModel, "editTextModel");
        this.identifier = title;
        this.title = title;
        this.editTextViewModel = editTextModel;
    }
    getType(): CellType {
        return CellType.customize_textfield;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getTitle(): string {
        return this.title;
    }
    getEditTextViewModel(): EditableTextFieldViewModel {
        return this.editTextViewModel;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof CustomizeTextFieldViewModel)) {
            return false;
        }
        let customizeTextFieldViewModel: CustomizeTextFieldViewModel = (other as unknown as CustomizeTextFieldViewModel);
        return Intrinsics.areEqual(customizeTextFieldViewModel.title, this.title) && Intrinsics.areEqual(customizeTextFieldViewModel.editTextViewModel, this.editTextViewModel);
    }
}
