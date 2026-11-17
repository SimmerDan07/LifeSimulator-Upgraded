// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class AlertType extends JEnum {
    static readonly Alert: AlertType = new AlertType("Alert", 0);
    static readonly Banner: AlertType = new AlertType("Banner", 1);
    static values(): AlertType[] { return [AlertType.Alert, AlertType.Banner]; }
    static valueOf(n: string): AlertType { return (AlertType as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
