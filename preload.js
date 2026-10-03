const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  getAutostart: () => ipcRenderer.invoke("get-autostart"),
  setAutostart: (enable) => ipcRenderer.invoke("set-autostart", enable),
  minimizeToTray: () => ipcRenderer.send("minimize-to-tray"),
  getDesktopSources: () => ipcRenderer.invoke("get-desktop-sources"),
  getAppDataPath: () => ipcRenderer.invoke("get-app-data-path"),
  openAppDataFolder: () => ipcRenderer.invoke("open-app-data-folder"),
  saveUserConfig: (cfg) => ipcRenderer.invoke("save-user-config", cfg),
  loadUserConfig: () => ipcRenderer.invoke("load-user-config"),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  onAutostartChanged: (callback) => {
    const handler = (event, enabled) => callback(enabled);
    ipcRenderer.on("autostart-changed", handler);
    return () => ipcRenderer.removeListener("autostart-changed", handler);
  },

  onWindowMinimized: (callback) => {
    const handler = (event, isMinimized) => callback(isMinimized);
    ipcRenderer.on("window-minimized", handler);
    return () => ipcRenderer.removeListener("window-minimized", handler);
  },

  // Firmware Flasher APIs
  getFlasherToolsStatus: () => ipcRenderer.invoke("flasher:get-tools-status"),
  selectFirmwareFile: () => ipcRenderer.invoke("flasher:select-firmware-file"),
  savePreflashBackup: (snapshot) => ipcRenderer.invoke("flasher:save-preflash-backup", snapshot),
  loadPreflashBackup: () => ipcRenderer.invoke("flasher:load-preflash-backup"),
  saveTempFirmware: (params) => ipcRenderer.invoke("flasher:save-temp-firmware", params),
  flashFirmware: (params) => ipcRenderer.invoke("flasher:flash-firmware", params),
  cancelFlash: () => ipcRenderer.invoke("flasher:cancel-flash"),
  onFlasherProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on("flasher:progress", handler);
    return () => ipcRenderer.removeListener("flasher:progress", handler);
  },

  // Interactive Auto-Updater APIs
  checkForStudioUpdates: () => ipcRenderer.invoke("updater:check-for-updates"),
  checkStudioUpdates: () => ipcRenderer.invoke("updater:check-for-updates"),
  downloadStudioUpdate: () => ipcRenderer.invoke("updater:download-update"),
  quitAndInstallStudioUpdate: () => ipcRenderer.invoke("updater:quit-and-install"),
  setAllowPrerelease: (enabled) => ipcRenderer.invoke("updater:set-allow-prerelease", enabled),
  getAllowPrerelease: () => ipcRenderer.invoke("updater:get-allow-prerelease"),
  onUpdateStatus: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on("updater:status", handler);
    return () => ipcRenderer.removeListener("updater:status", handler);
  }
});
