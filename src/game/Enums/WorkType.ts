// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum } from "../runtime";

export class WorkType extends JEnum {
    static readonly none: WorkType = new WorkType("none", 0);
    static readonly job: WorkType = new WorkType("job", 1);
    static readonly sideHustle: WorkType = new WorkType("sideHustle", 2);
    static values(): WorkType[] { return [WorkType.none, WorkType.job, WorkType.sideHustle]; }
    static valueOf(n: string): WorkType { return (WorkType as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
}
