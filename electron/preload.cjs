const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("lifesimFS", {
    read: (name) => ipcRenderer.sendSync("fs-read", name),
    write: (name, text) => ipcRenderer.sendSync("fs-write", name, text),
    dir: () => ipcRenderer.sendSync("fs-dir"),
    openDir: () => ipcRenderer.sendSync("fs-open-dir"),
});
