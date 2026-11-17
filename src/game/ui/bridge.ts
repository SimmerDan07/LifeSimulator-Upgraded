// The seam between the ported game logic and the desktop UI.
// Game code calls these (in place of Android navigation / dialogs / file IO); the UI
// registers an implementation at startup with UIBridge.install(...).
import { SpannableStringBuilder } from "../runtime";
import { GenericListType } from "../Fragments/GenericListType";
import { SingleLabelCellViewModel } from "../Models/SingleLabelCellViewModel";
import { TextLabelViewModel } from "../Models/TextLabelViewModel";
import type { AlertViewModel } from "../Managers/AlertViewModel";
import type { MainGameTab } from "../Enums/MainGameTab";

export interface UIImpl {
    broadcast(action: string): void;
    reloadGenericList(type: GenericListType): void;
    navigateTo(type: GenericListType, key: string, animated: boolean): void;
    backToMainGame(): void;
    showAlert(vm: AlertViewModel): void;
    readFile(name: string): string | null;
    writeFile(name: string, text: string): void;
}

let impl: UIImpl | null = null;

export const UIBridge = {
    install(i: UIImpl) { impl = i; },
    broadcast(a: string) { impl?.broadcast(a); },
    reloadGenericList(t: GenericListType) { impl?.reloadGenericList(t); },
    navigateTo(t: GenericListType, key: string, animated: boolean) { impl?.navigateTo(t, key, animated); },
    backToMainGame() { impl?.backToMainGame(); },
    showAlert(vm: AlertViewModel) { impl?.showAlert(vm); },
    readFile(name: string): string | null { return impl ? impl.readFile(name) : null; },
    writeFile(name: string, text: string) { impl?.writeFile(name, text); },
    GenericListType() { return GenericListType; },
    makePropertyList(sb: SpannableStringBuilder) {
        return new SingleLabelCellViewModel("PropertyListModel", new TextLabelViewModel("", null, false, false, null, sb, 30, null));
    },
};

// ---- Android classes the game logic references, reduced to what it actually uses ----

/** The main game screen. The real one is implemented by the UI (src/ui/MainScreen.ts). */
export abstract class MainGameFragment {
    abstract updateUI(tab: MainGameTab | null): void;
    abstract updateHUD(): void;
    abstract reloadTab(tab: MainGameTab): void;
    abstract getSelectedTab(): MainGameTab;
    getContext(): any { return {}; }
    isVisible(): boolean { return true; }
    static updateUI$default(f: MainGameFragment, tab: MainGameTab | null, mask: number, _o: any): void {
        if ((mask & 1) !== 0) tab = null;
        f.updateUI(tab);
    }
}
export abstract class GenericListFragment {
    abstract getListType(): GenericListType;
    abstract getActivityKey(): string;
    getListKey(): string { return this.getActivityKey(); }
}
export class MainApplication {
    static INSTANCE = { applicationContext: () => ({ getPackageName: () => "lifesim.desktop", getResources: () => ({}) }) };
}
export class MainGameActivity { startActivity(_i: any) {} runOnUiThread(r: any) { r?.run?.(); } }
export class MainGameFragmentDirections { static INSTANCE = {}; }
export class GenericListFragmentDirections { static INSTANCE = {}; }
export class GenericListFragmentArgs {}
export class AlertDialogContentView {}
export class CFAlertDialog {}
export class GameHUD {}
export class BaseContentRecyclerView {}
export class SharedAdapter {}
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export class DateFormatSymbols { getMonths(): string[] { return MONTHS; } }
