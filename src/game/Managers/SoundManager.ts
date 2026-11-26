// Hand-ported sound playback (HTML5 audio). Sound files are copied from the APK.
import { SoundEffect } from "./SoundEffect";
import { GameStateManager } from "./GameStateManager";

const MP3 = new Set(["cat", "plane", "soundtrack1", "turkey", "victory"]);
const cache = new Map<string, HTMLAudioElement>();
let music: HTMLAudioElement | null = null;
let wanted = false;   // music is switched on (and has been started)
let away = false;     // v0.31.1: the app is in the background / the screen is off → silence
const startMusic = () => {
    if (!music || !wanted || away) return;
    // a phone can refuse to restart audio without a tap: then it starts again on the next tap
    void music.play().catch(() => document.addEventListener("pointerdown", startMusic, { once: true }));
};

export class SoundManager {
    static INSTANCE: SoundManager;
    playSound(effect: SoundEffect): void {
        try {
            const settings = GameStateManager.INSTANCE.getGlobalStateManager()?.getGameSettings();
            if (settings && !settings.getSoundEffectEnabled()) return;
            if (away) return;
            const id = String(effect.getFileId());
            const file = id + (MP3.has(id) ? ".mp3" : ".wav");
            let a = cache.get(file);
            if (!a) { a = new Audio("assets/sounds/" + file); cache.set(file, a); }
            const inst = a.cloneNode(true) as HTMLAudioElement;
            inst.volume = 0.6;
            void inst.play().catch(() => {});
        } catch { /* audio unavailable */ }
    }
    toggleMusic(on: boolean): void {
        try {
            if (!music) { music = new Audio("assets/sounds/soundtrack1.mp3"); music.loop = true; music.volume = 0.35; }
            wanted = on;
            if (on) startMusic(); else music.pause();
        } catch { /* audio unavailable */ }
    }
    /** v0.31.1: the player left the game (home screen, another app, screen off, window minimised) or came back. */
    setAway(isAway: boolean): void {
        if (away === isAway) return;
        away = isAway;
        try {
            if (isAway) music?.pause();
            else startMusic();
        } catch { /* audio unavailable */ }
    }
    isAway(): boolean { return away; }
    isMusicPlaying(): boolean { return music != null && !music.paused; }
}
SoundManager.INSTANCE = new SoundManager();
