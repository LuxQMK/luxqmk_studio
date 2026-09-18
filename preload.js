const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  getAutostart: () => ipcRenderer.invoke("get-autostart"),
  setAutostart: (enable) => ipcRenderer.invoke("set-autostart", enable),
  minimizeToTray: () => ipcRenderer.send("minimize-to-tray"),
  getDesktopSources: () => ipcRenderer.invoke("get-desktop-sources")
});
