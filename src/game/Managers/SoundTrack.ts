// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */
import { JEnum, R } from "../runtime";

export class SoundTrack extends JEnum {
    static readonly upliftingJazz: SoundTrack = new SoundTrack("upliftingJazz", 0);
    static values(): SoundTrack[] { return [SoundTrack.upliftingJazz]; }
    static valueOf(n: string): SoundTrack { return (SoundTrack as any)[n]; }
    constructor(name: string, ordinal: number) { super(name, ordinal); }
    getFileId(): number {
        return R.raw.soundtrack1;
    }
}
