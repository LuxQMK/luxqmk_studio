const { app, BrowserWindow, Tray, Menu, ipcMain, desktopCapturer, session } = require("electron");
const path = require("path");

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: "#0b0f19",
    autoHideMenuBar: true,
    title: "LuxQMK Studio",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false // Keep RGB & Audio running at 60 FPS in background!
    }
  });

  // Enable WebHID permissions automatically
  const ses = mainWindow.webContents.session;
  ses.setPermissionCheckHandler((webContents, permission) => {
    if (permission === "hid") return true;
    return false;
  });

  ses.setDevicePermissionHandler((details) => {
    if (details.deviceType === "hid") return true;
    return false;
  });

  ses.on("select-hid-device", (event, details, callback) => {
    event.preventDefault();
    if (details.deviceList && details.deviceList.length > 0) {
      // Auto-select GMMK 3 / QMK device if found
      const target = details.deviceList.find((d) =>
        (d.vendorId === 0x320f || d.vendorId === 0x0c45) ||
        (d.productName && d.productName.toLowerCase().includes("gmmk"))
      );
      callback(target ? target.deviceId : details.deviceList[0].deviceId);
    } else {
      callback("");
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "icon.png");
  tray = new Tray(iconPath);
  tray.setToolTip("LuxQMK Studio");

  const updateMenu = () => {
    const isAutostart = app.getLoginItemSettings().openAtLogin;
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Otwórz LuxQMK Studio",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: "separator" },
      {
        label: "Uruchamiaj przy starcie Windowsa",
        type: "checkbox",
        checked: isAutostart,
        click: (menuItem) => {
          app.setLoginItemSettings({
            openAtLogin: menuItem.checked,
            openAsHidden: true
          });
          updateMenu();
        }
      },
      { type: "separator" },
      {
        label: "Zakończ / Zamknij",
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  };

  updateMenu();

  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// IPC Handlers
ipcMain.handle("get-autostart", () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle("set-autostart", (event, enable) => {
  app.setLoginItemSettings({
    openAtLogin: !!enable,
    openAsHidden: true
  });
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on("minimize-to-tray", () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.handle("get-desktop-sources", async () => {
  try {
    const sources = await desktopCapturer.getSources({ types: ["screen"] });
    return sources.map((s) => ({ id: s.id, name: s.name }));
  } catch (err) {
    console.error("Error getting desktop sources:", err);
    return [];
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Keep app running in tray unless explicit quit
  }
});
