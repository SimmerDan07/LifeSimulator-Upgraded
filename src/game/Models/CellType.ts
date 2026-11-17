// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class CellType extends JEnum {
    static readonly none: CellType = new CellType("none", 0, 0);
    static readonly leftRightCell: CellType = new CellType("leftRightCell", 1, 1);
    static readonly headerTitle: CellType = new CellType("headerTitle", 2, 2);
    static readonly imageCell: CellType = new CellType("imageCell", 3, 3);
    static readonly actionCellMultipleOptions: CellType = new CellType("actionCellMultipleOptions", 4, 4);
    static readonly actionCellSingle: CellType = new CellType("actionCellSingle", 5, 5);
    static readonly actionCellWithProgress: CellType = new CellType("actionCellWithProgress", 6, 6);
    static readonly navigationBarCell: CellType = new CellType("navigationBarCell", 7, 7);
    static readonly progressbarCell: CellType = new CellType("progressbarCell", 8, 8);
    static readonly optionBar: CellType = new CellType("optionBar", 9, 9);
    static readonly settingsRow: CellType = new CellType("settingsRow", 10, 10);
    static readonly singleButton: CellType = new CellType("singleButton", 11, 11);
    static readonly customize_switch: CellType = new CellType("customize_switch", 12, 12);
    static readonly customize_slider: CellType = new CellType("customize_slider", 13, 13);
    static readonly customize_options: CellType = new CellType("customize_options", 14, 14);
    static readonly customize_textfield: CellType = new CellType("customize_textfield", 15, 15);
    static readonly tombstoneCell: CellType = new CellType("tombstoneCell", 16, 16);
    static readonly workButtons: CellType = new CellType("workButtons", 17, 17);
    static readonly singleLabel: CellType = new CellType("singleLabel", 18, 18);
    static readonly progressCellTappable: CellType = new CellType("progressCellTappable", 19, 19);
    static values(): CellType[] { return [CellType.none, CellType.leftRightCell, CellType.headerTitle, CellType.imageCell, CellType.actionCellMultipleOptions, CellType.actionCellSingle, CellType.actionCellWithProgress, CellType.navigationBarCell, CellType.progressbarCell, CellType.optionBar, CellType.settingsRow, CellType.singleButton, CellType.customize_switch, CellType.customize_slider, CellType.customize_options, CellType.customize_textfield, CellType.tombstoneCell, CellType.workButtons, CellType.singleLabel, CellType.progressCellTappable]; }
    static valueOf(n: string): CellType { return (CellType as any)[n]; }
    raw: number = 0;
    constructor(name: string, ordinal: number, i: number) {
        super(name, ordinal);
        this.raw = i;
    }
    getRaw(): number {
        return this.raw;
    }
}
