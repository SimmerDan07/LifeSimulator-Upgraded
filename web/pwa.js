// The iPhone / browser app (v0.31.0): works offline once opened. The service worker keeps a copy of the game.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch((e) => console.warn("offline copy unavailable", e)); });
}
