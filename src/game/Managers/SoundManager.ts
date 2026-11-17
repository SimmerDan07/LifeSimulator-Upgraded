// Hand-ported sound playback (HTML5 audio). Sound files are copied from the APK.
import { SoundEffect } from "./SoundEffect";
import { GameStateManager } from "./GameStateManager";

const MP3 = new Set(["cat", "plane", "soundtrack1", "turkey", "victory"]);
const cache = new Map<string, HTMLAudioElement>();
let music: HTMLAudioElement | null = null;

export class SoundManager {
    static INSTANCE: SoundManager;
    playSound(effect: SoundEffect): void {
        try {
            const settings = GameStateManager.INSTANCE.getGlobalStateManager()?.getGameSettings();
            if (settings && !settings.getSoundEffectEnabled()) return;
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
            if (on) void music.play().catch(() => {}); else music.pause();
        } catch { /* audio unavailable */ }
    }
}
SoundManager.INSTANCE = new SoundManager();
