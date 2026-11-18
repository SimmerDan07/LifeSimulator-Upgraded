// Electron main process: one window, save files in the user's app-data folder.
const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");

// v0.18.0: saves live in Documents\Life Simulator\Saves so players can find and back them up.
// Older versions saved in the app-data folder; those saves are copied over the first time.
// If Windows blocks writing to Documents (e.g. Controlled Folder Access), saving falls back to the app-data folder.
const legacyDir = () => path.join(app.getPath("userData"), "saves");
const docsDir = () => { try { return path.join(app.getPath("documents"), "Life Simulator", "Saves"); } catch { return null; } };
let useLegacy = false;
const saveDir = () => (useLegacy || docsDir() == null ? legacyDir() : docsDir());
const safe = (name) => String(name).replace(/[^a-zA-Z0-9._-]/g, "_");

const README = [
    "Life Simulator - save files",
    "",
    "saveFile.txt is your game. saveFile.txt.bak is the save from just before the last one.",
    "To back up your game, copy this folder somewhere safe. To restore, close the game and copy the files back.",
    "",
].join("\r\n");

function migrateSaves() {
    const to = docsDir();
    if (to == null) { useLegacy = true; return; }
    try {
        fs.mkdirSync(to, { recursive: true });
        const from = legacyDir();
        if (fs.existsSync(from)) {
            for (const f of fs.readdirSync(from)) {
                const src = path.join(from, f), dst = path.join(to, f);
                if (fs.statSync(src).isFile() && !fs.existsSync(dst)) fs.copyFileSync(src, dst);
            }
        }
        const readme = path.join(to, "READ ME.txt");
        if (!fs.existsSync(readme)) fs.writeFileSync(readme, README, "utf8");
    } catch (err) { console.error("Can't use the Documents folder for saves; using app data", err); useLegacy = true; }
}

function writeSave(dir, name, text) {
    fs.mkdirSync(dir, { recursive: true });
    const p = path.join(dir, safe(name));
    if (fs.existsSync(p)) fs.copyFileSync(p, p + ".bak");
    fs.writeFileSync(p + ".tmp", text, "utf8");
    fs.renameSync(p + ".tmp", p);
}

ipcMain.on("fs-read", (e, name) => {
    for (const dir of [saveDir(), legacyDir()]) {
        try { e.returnValue = fs.readFileSync(path.join(dir, safe(name)), "utf8"); return; } catch { /* try the next */ }
    }
    e.returnValue = null;
});
ipcMain.on("fs-write", (e, name, text) => {
    try { writeSave(saveDir(), name, text); e.returnValue = true; }
    catch (err) {
        console.error(err);
        if (!useLegacy) {
            try { useLegacy = true; writeSave(legacyDir(), name, text); e.returnValue = true; return; } catch (err2) { console.error(err2); }
        }
        e.returnValue = false;
    }
});
ipcMain.on("fs-dir", (e) => { e.returnValue = saveDir(); });
ipcMain.on("fs-open-dir", (e) => {
    try { fs.mkdirSync(saveDir(), { recursive: true }); shell.openPath(saveDir()); e.returnValue = true; } catch { e.returnValue = false; }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1280, height: 840, minWidth: 1000, minHeight: 640,
        title: "Life Simulator", backgroundColor: "#3b3b3b", show: false,
        icon: path.join(__dirname, "assets", "icon.png"),
        webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false },
    });
    Menu.setApplicationMenu(null);
    win.loadFile(path.join(__dirname, "index.html"));
    win.once("ready-to-show", () => win.show());
    win.webContents.on("before-input-event", (_e, input) => {
        if (input.type !== "keyDown") return;
        if (input.key === "F12") win.webContents.toggleDevTools();
        if (input.key === "F11") win.setFullScreen(!win.isFullScreen());
        if (input.control && input.key.toLowerCase() === "r") win.webContents.reload();
    });
    win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
}

app.whenReady().then(() => { migrateSaves(); createWindow(); });
app.on("window-all-closed", () => app.quit());
