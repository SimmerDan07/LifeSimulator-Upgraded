// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { Function0, Intrinsics } from "../runtime";
import { BaseViewModel } from "./BaseViewModel";
import { CellType } from "./CellType";

export class SettingsRowViewModel extends BaseViewModel {
    action: Function0<any> = null;
    identifier: string = null;
    imageId: number = 0;
    isEnabled: boolean = false;
    showChevron: boolean = false;
    title: string = null;
    constructor(title: string, i: number, z: boolean, z2: boolean, action: Function0<any>) {
        super();
        Intrinsics.checkParameterIsNotNull(title, "title");
        Intrinsics.checkParameterIsNotNull(action, "action");
        this.identifier = title;
        this.title = title;
        this.imageId = i;
        this.showChevron = z;
        this.action = action;
        this.isEnabled = z2;
    }
    getType(): CellType {
        return CellType.settingsRow;
    }
    getIdentifier(): string {
        return this.identifier;
    }
    getTitle(): string {
        return this.title;
    }
    getImageId(): number {
        return this.imageId;
    }
    getShowChevron(): boolean {
        return this.showChevron;
    }
    getAction(): Function0<any> {
        return this.action;
    }
    getIsEnabled(): boolean {
        return this.isEnabled;
    }
    equals(other: any): boolean {
        if ((other == null) || !(other instanceof SettingsRowViewModel)) {
            return false;
        }
        let settingsRowViewModel: SettingsRowViewModel = (other as unknown as SettingsRowViewModel);
        return ((Intrinsics.areEqual(this.title, settingsRowViewModel.title) && (this.imageId === settingsRowViewModel.imageId)) && (this.showChevron === settingsRowViewModel.showChevron)) && (this.isEnabled === settingsRowViewModel.isEnabled);
    }
}
