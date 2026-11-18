// v0.18.0: the Windows app keeps saves in Documents\Life Simulator\Saves (electron/main.cjs), copies saves from
// older versions over, and falls back to the app-data folder if Documents can't be written.
// Runs electron/main.cjs with a fake `electron` module in temporary folders.
const Module = require("module");
const fs = require("fs");
const os = require("os");
const path = require("path");

let failures = 0;
const check = (n, ok, x = "") => { if (!ok) failures++; console.log((ok ? "PASS " : "FAIL ") + n + (x ? "  (" + x + ")" : "")); };

function boot(docs, appData) {
    const handlers = {};
    const opened = [];
    let ready;
    const fake = {
        app: { getPath: (k) => (k === "documents" ? docs : appData), whenReady: () => new Promise((r) => { ready = r; }), on() {} },
        BrowserWindow: class { constructor() { this.webContents = { on() {}, setWindowOpenHandler() {} }; } loadFile() {} once() {} },
        ipcMain: { on: (name, fn) => { handlers[name] = fn; } },
        Menu: { setApplicationMenu() {} },
        shell: { openPath: (p) => { opened.push(p); return Promise.resolve(""); }, openExternal() {} },
    };
    const orig = Module._load;
    Module._load = function (req, ...rest) { return req === "electron" ? fake : orig.call(this, req, ...rest); };
    const file = path.join(__dirname, "..", "electron", "main.cjs");
    delete require.cache[require.resolve(file)];
    require(file);
    Module._load = orig;
    ready();
    const call = (name, ...args) => { const e = {}; handlers[name](e, ...args); return e.returnValue; };
    return { call, opened };
}

(async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lifesim-"));
    const docs = path.join(tmp, "Documents"), appData = path.join(tmp, "AppData");
    fs.mkdirSync(path.join(appData, "saves"), { recursive: true });
    fs.mkdirSync(docs, { recursive: true });
    fs.writeFileSync(path.join(appData, "saves", "saveFile.txt"), "OLD SAVE");
    const app = boot(docs, appData);
    await new Promise((r) => setTimeout(r, 20));
    const dir = path.join(docs, "Life Simulator", "Saves");
    check("saves live in Documents\\Life Simulator\\Saves", app.call("fs-dir") === dir, app.call("fs-dir"));
    check("saves from older versions are copied over", fs.readFileSync(path.join(dir, "saveFile.txt"), "utf8") === "OLD SAVE");
    check("…and the old copy is left where it was", fs.existsSync(path.join(appData, "saves", "saveFile.txt")));
    check("a READ ME explains the files", fs.existsSync(path.join(dir, "READ ME.txt")));
    check("loading reads the Documents save", app.call("fs-read", "saveFile.txt") === "OLD SAVE");
    check("saving writes to Documents", app.call("fs-write", "saveFile.txt", "NEW SAVE") === true && fs.readFileSync(path.join(dir, "saveFile.txt"), "utf8") === "NEW SAVE");
    check("…keeping the previous save as .bak", fs.readFileSync(path.join(dir, "saveFile.txt.bak"), "utf8") === "OLD SAVE");
    app.call("fs-open-dir");
    check("Settings › Save Folder opens it", app.opened[0] === dir);

    // Documents can't be written: fall back to app data
    const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), "lifesim-"));
    const docs2 = path.join(tmp2, "Documents"), appData2 = path.join(tmp2, "AppData");
    fs.mkdirSync(docs2, { recursive: true });
    fs.writeFileSync(path.join(docs2, "Life Simulator"), "not a folder");
    const app2 = boot(docs2, appData2);
    await new Promise((r) => setTimeout(r, 20));
    check("if Documents can't be used, saving still works (app data)", app2.call("fs-write", "saveFile.txt", "X") === true && fs.readFileSync(path.join(appData2, "saves", "saveFile.txt"), "utf8") === "X");
    check("…and the game says where", app2.call("fs-dir") === path.join(appData2, "saves"));
    fs.rmSync(tmp, { recursive: true, force: true }); fs.rmSync(tmp2, { recursive: true, force: true });
    console.log(failures ? `\n${failures} FAILED` : "\nall save-folder checks passed");
    if (failures) process.exit(1);
})();
