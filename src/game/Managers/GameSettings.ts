// AUTO-GENERATED from decompiled Life Simulator code by j2ts.py — edit freely.
/* eslint-disable */

export class GameSettings {
    static INSTANCE: any;
    hapticsEnabled: boolean = false;
    musicEnabled: boolean = false;
    soundEffectEnabled: boolean = false;
    /** v0.28.1: show every event as a pop-up (off: only holidays pop up; the rest goes to News). */
    allPopups: boolean = false;
    /** v0.28.1: holidays pop up (off: they go to News too, with a sensible choice made for you). */
    holidayPopups: boolean = true;
    /** v0.29.1: nothing ever pops up (everything goes to News, choices are made for you). */
    noPopups: boolean = false;
    /** v0.29.1: with noPopups, what you tap still gets a small corner notice. */
    popupNotices: boolean = true;
    /** v0.34.0: "auto" (match the phone), "light" or "dark". */
    theme: string = "auto";
    /** v0.34.0: the old look (big cards, side tabs). */
    classicLook: boolean = false;
    constructor() {
        this.hapticsEnabled = true;
        this.musicEnabled = true;
        this.soundEffectEnabled = true;
    }
    getMusicEnabled(): boolean {
        return this.musicEnabled;
    }
    setMusicEnabled(z: boolean): void {
        this.musicEnabled = z;
    }
    getSoundEffectEnabled(): boolean {
        return this.soundEffectEnabled;
    }
    setSoundEffectEnabled(z: boolean): void {
        this.soundEffectEnabled = z;
    }
    getHapticsEnabled(): boolean {
        return this.hapticsEnabled;
    }
    setHapticsEnabled(z: boolean): void {
        this.hapticsEnabled = z;
    }
}
export namespace GameSettings {
    export class Companion {
        $init0(): void {
    }
        $init1(defaultConstructorMarker: any): void {
        this.$init();
    }
        constructor(...args: any[]) {
            this.$init(...args);
        }
        $init(...a: any[]): any {
            if (a.length === 1) return (this as any).$init1(...a);
            if (a.length === 0) return (this as any).$init0(...a);
            throw new Error('no overload for $init with ' + a.length + ' args');
        }
    }
}
GameSettings.INSTANCE = new GameSettings.Companion(null);
