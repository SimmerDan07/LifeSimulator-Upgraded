// The iPhone / browser app: works offline, and updates itself (v0.31.3).
// - A service worker (sw.js) keeps a copy of the whole game on the device.
// - Every time the app is opened or brought back, and every 20 minutes while playing, it checks GitHub for a
//   newer version. A new version downloads in the background; as soon as it's ready and nothing is on screen
//   waiting for an answer, the game saves and restarts into the new version (same life, same week).
(function () {
    var VERSION = "__VERSION__";
    var KEY = "lifesim:appVersion";

    function notice(text) {
        var d = document.createElement("div");
        d.textContent = text;
        d.setAttribute("style", "position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 12px);" +
            "z-index:1000;background:#3b3b3b;color:#fff;font:700 14px Futura,system-ui,sans-serif;padding:10px 16px;border-radius:12px;" +
            "box-shadow:0 8px 24px rgba(0,0,0,.3);transition:opacity .5s;max-width:90vw;text-align:center");
        document.body.appendChild(d);
        setTimeout(function () { d.style.opacity = "0"; }, 3500);
        setTimeout(function () { d.remove(); }, 4200);
    }

    // after an update: say so once
    window.addEventListener("load", function () {
        var last = null;
        try { last = localStorage.getItem(KEY); localStorage.setItem(KEY, VERSION); } catch (e) { /* private mode */ }
        if (last && last !== VERSION) setTimeout(function () { notice("Updated to v" + VERSION); }, 1200);
    });

    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;

    var reloading = false;
    function busy() {
        // a pop-up or a menu waiting for an answer: don't restart under the player's finger
        return !!document.querySelector("#modals .modal-backdrop") || !!document.querySelector("#overlay .list-screen");
    }
    function restartIntoUpdate() {
        if (reloading) return;
        if (busy()) { setTimeout(restartIntoUpdate, 1500); return; }
        reloading = true;
        try { if (window.__lifesimSave) window.__lifesimSave(); } catch (e) { /* keep going */ }
        var flushed = window.__lifesimFlush ? Promise.resolve(window.__lifesimFlush()) : Promise.resolve();
        Promise.race([flushed, new Promise(function (r) { setTimeout(r, 3000); })]).then(function () { location.reload(); });
    }

    window.addEventListener("load", function () {
        var hadController = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.addEventListener("controllerchange", function () {
            // the first install isn't an update; only restart when a newer version took over
            if (hadController) restartIntoUpdate();
            hadController = true;
        });
        navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
            function check() { reg.update().catch(function () { /* offline: try later */ }); }
            document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") check(); });
            setInterval(check, 20 * 60 * 1000);
        }).catch(function (e) { console.warn("offline copy unavailable", e); });
    });
})();
