// Electron main process: one window, save files in the user's app-data folder.
const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const saveDir = () => path.join(app.getPath("userData"), "saves");
const safe = (name) => String(name).replace(/[^a-zA-Z0-9._-]/g, "_");

ipcMain.on("fs-read", (e, name) => {
    try { e.returnValue = fs.readFileSync(path.join(saveDir(), safe(name)), "utf8"); }
    catch { e.returnValue = null; }
});
ipcMain.on("fs-write", (e, name, text) => {
    try {
        fs.mkdirSync(saveDir(), { recursive: true });
        const p = path.join(saveDir(), safe(name));
        if (fs.existsSync(p)) fs.copyFileSync(p, p + ".bak");
        fs.writeFileSync(p + ".tmp", text, "utf8");
        fs.renameSync(p + ".tmp", p);
        e.returnValue = true;
    } catch (err) { console.error(err); e.returnValue = false; }
});
ipcMain.on("fs-dir", (e) => { e.returnValue = saveDir(); });

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

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
