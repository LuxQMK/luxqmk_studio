const { app, BrowserWindow, Tray, Menu, ipcMain, desktopCapturer, session, shell, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

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

  // Enable automatic system audio loopback capture (WASAPI) without prompt
  if (typeof ses.setDisplayMediaRequestHandler === "function") {
    ses.setDisplayMediaRequestHandler((request, callback) => {
      desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
        if (sources && sources.length > 0) {
          callback({ video: sources[0], audio: "loopback" });
        } else {
          callback({});
        }
      }).catch((err) => {
        console.error("setDisplayMediaRequestHandler error:", err);
        callback({});
      });
    });
  }

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

ipcMain.handle("get-app-data-path", () => {
  return app.getPath("userData");
});

ipcMain.handle("open-app-data-folder", async () => {
  const p = app.getPath("userData");
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
  await shell.openPath(p);
  return p;
});

ipcMain.handle("save-user-config", (event, config) => {
  try {
    const userPath = app.getPath("userData");
    if (!fs.existsSync(userPath)) {
      fs.mkdirSync(userPath, { recursive: true });
    }
    const cfgFile = path.join(userPath, "user-config.json");
    let existing = {};
    if (fs.existsSync(cfgFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(cfgFile, "utf-8")) || {};
      } catch (e) {}
    }
    const updated = { ...existing, ...config, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(cfgFile, JSON.stringify(updated, null, 2), "utf-8");
    return { success: true, path: cfgFile };
  } catch (err) {
    console.error("Failed to save user config:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("load-user-config", () => {
  try {
    const cfgFile = path.join(app.getPath("userData"), "user-config.json");
    if (fs.existsSync(cfgFile)) {
      const data = fs.readFileSync(cfgFile, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load user config:", err);
  }
  return null;
});

// ==========================================
// Smart Firmware Flasher IPC Engine
// ==========================================

function getFlasherToolPath(toolName = "wb32") {
  const isWb32 = toolName.toLowerCase().includes("wb32");
  const binName = isWb32 ? "wb32-dfu-updater_cli.exe" : "dfu-util.exe";

  const candidates = [];

  // 1. In Electron resourcesPath when packaged (app.asar.unpacked)
  if (process.resourcesPath) {
    candidates.push(path.join(process.resourcesPath, "app.asar.unpacked", "bin", binName));
    candidates.push(path.join(process.resourcesPath, "bin", binName));
  }

  // 2. Unpacked directory if running from inside app.asar
  if (__dirname.includes("app.asar")) {
    candidates.push(path.join(__dirname.replace(/app\.asar/g, "app.asar.unpacked"), "bin", binName));
  } else {
    // 3. Local bin in development workspace
    candidates.push(path.join(__dirname, "bin", binName));
  }

  // 4. In QMK MSYS if installed
  candidates.push(path.join("C:\\QMK_MSYS\\opt\\qmk\\bin", binName));
  candidates.push(path.join("C:\\QMK_MSYS\\usr\\bin", binName));

  // 5. In QMK Toolbox if installed
  candidates.push(path.join("C:\\Program Files\\QMK Toolbox", binName));
  candidates.push(path.join("C:\\Program Files (x86)\\QMK Toolbox", binName));
  candidates.push(path.join(process.env.LOCALAPPDATA || "", "QMK Toolbox", binName));

  for (const p of candidates) {
    try {
      // Must NOT be a virtual path inside .asar because child_process.spawn requires real OS binary
      if (!p.includes(".asar\\") && !p.includes(".asar/") && !p.endsWith(".asar") && fs.existsSync(p)) {
        return p;
      }
    } catch (e) {
      // Ignore
    }
  }
  return null;
}

ipcMain.handle("flasher:get-tools-status", () => {
  const wb32 = getFlasherToolPath("wb32");
  const dfuUtil = getFlasherToolPath("dfu-util");
  return {
    wb32Available: !!wb32,
    wb32Path: wb32,
    dfuUtilAvailable: !!dfuUtil,
    dfuUtilPath: dfuUtil
  };
});

ipcMain.handle("flasher:select-firmware-file", async () => {
  if (!mainWindow) return null;
  const res = await dialog.showOpenDialog(mainWindow, {
    title: "Wybierz plik Firmware (.bin, .hex, .uf2)",
    properties: ["openFile"],
    filters: [
      { name: "Firmware Files (*.bin, *.hex, *.uf2)", extensions: ["bin", "hex", "uf2"] },
      { name: "Wszystkie pliki (*.*)", extensions: ["*"] }
    ]
  });
  if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null;
  const filePath = res.filePaths[0];
  const stats = fs.statSync(filePath);
  return {
    filePath,
    fileName: path.basename(filePath),
    fileSize: stats.size,
    extension: path.extname(filePath).toLowerCase()
  };
});

ipcMain.handle("flasher:save-preflash-backup", async (event, snapshotData) => {
  try {
    const userPath = app.getPath("userData");
    const cacheDir = path.join(userPath, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const cacheFile = path.join(cacheDir, "preflash_cache.json");
    const payload = JSON.stringify(snapshotData, null, 2);
    fs.writeFileSync(cacheFile, payload, "utf-8");

    return { success: true, filePath: cacheFile };
  } catch (err) {
    console.error("Failed to save preflash cache:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("flasher:load-preflash-backup", async () => {
  try {
    const userPath = app.getPath("userData");
    const cacheFile = path.join(userPath, "cache", "preflash_cache.json");
    if (fs.existsSync(cacheFile)) {
      const data = fs.readFileSync(cacheFile, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load preflash cache:", err);
  }
  return null;
});

let currentFlasherProcess = null;

ipcMain.handle("flasher:cancel-flash", () => {
  if (currentFlasherProcess) {
    try {
      currentFlasherProcess.kill();
      currentFlasherProcess = null;
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  return { success: true };
});

ipcMain.handle("flasher:flash-firmware", (event, { filePath, toolType = "wb32" }) => {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      return resolve({ success: false, error: "Plik firmware nie istnieje: " + filePath });
    }

    const toolExe = getFlasherToolPath(toolType);
    if (!toolExe) {
      return resolve({
        success: false,
        error: `Nie znaleziono narzędzia programującego (${toolType}).`
      });
    }

    const isWb32 = toolType.toLowerCase().includes("wb32") || toolExe.toLowerCase().includes("wb32");
    const args = isWb32
      ? ["-t", "-s", "0x08000000", "-w", "-D", filePath, "-R"]
      : ["-a", "0", "-s", "0x08000000:leave", "-D", filePath, "-R"];

    const sendProgress = (percent, phase, log) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("flasher:progress", { percent, phase, log });
      }
    };

    sendProgress(10, "starting", `Uruchamianie ${path.basename(toolExe)}...`);

    try {
      const child = spawn(toolExe, args, { windowsHide: true });
      currentFlasherProcess = child;
      let fullOutput = "";
      let dfuDetected = false;

      // 15-second timeout for DFU mode detection
      const dfuTimeout = setTimeout(() => {
        if (!dfuDetected && currentFlasherProcess === child) {
          try {
            child.kill();
          } catch (e) {}
          currentFlasherProcess = null;
          resolve({
            success: false,
            timeout: true,
            error: "Nie wykryto klawiatury w trybie Bootloadera DFU w ciągu 15 sekund. Odłącz kabel USB, przytrzymaj klawisz Esc (lub przycisk Reset na płytce PCB) i podłącz kabel ponownie do portu USB."
          });
        }
      }, 15000);

      child.stdout.on("data", (data) => {
        const str = data.toString();
        fullOutput += str;
        console.log("[Flasher STDOUT]:", str.trim());

        const trimmed = str.trim();
        // Filter out dot-only polling outputs
        if (/^[\.\s]+$/.test(trimmed)) {
          return;
        }

        if (str.includes("Waiting for device") || str.includes("Waiting for DFU") || str.includes("Scanning")) {
          sendProgress(25, "waiting_dfu", "Oczekiwanie na wykrycie klawiatury w trybie Bootloadera DFU...");
        } else if (str.includes("Erasing") || str.includes("erase") || str.includes("Device found") || str.includes("matched") || str.includes("Found DFU")) {
          dfuDetected = true;
          clearTimeout(dfuTimeout);
          sendProgress(40, "erasing", "Wykryto urządzenie DFU! Czyszczenie pamięci Flash...");
        } else if (str.includes("Downloading") || str.includes("Write") || str.includes("%")) {
          dfuDetected = true;
          clearTimeout(dfuTimeout);
          const match = str.match(/(\d{1,3})%/);
          const pct = match ? Math.min(95, Math.max(50, parseInt(match[1], 10))) : 70;
          sendProgress(pct, "flashing", `Zapisywanie nowego firmware: ${match ? match[1] + "%" : "w toku..."}`);
        } else if (dfuDetected && (str.includes("Reset") || str.includes("Success") || str.includes("done") || str.includes("Downloaded"))) {
          clearTimeout(dfuTimeout);
          sendProgress(95, "rebooting", "Resetowanie i restartowanie klawiatury...");
        } else if (trimmed.length > 0) {
          sendProgress(50, "flashing", trimmed.split("\n")[0]);
        }
      });

      child.stderr.on("data", (data) => {
        const str = data.toString();
        fullOutput += str;
        console.warn("[Flasher STDERR]:", str.trim());
        const trimmed = str.trim();
        if (!/^[\.\s]+$/.test(trimmed) && trimmed.length > 0) {
          sendProgress(50, "flashing", trimmed.split("\n")[0]);
        }
      });

      child.on("error", (err) => {
        clearTimeout(dfuTimeout);
        currentFlasherProcess = null;
        console.error("Flasher spawn error:", err);
        resolve({ success: false, error: err.message, output: fullOutput });
      });

      child.on("close", (code) => {
        clearTimeout(dfuTimeout);
        currentFlasherProcess = null;
        const lowerOutput = fullOutput.toLowerCase();
        const hasNoDeviceError = lowerOutput.includes("no dfu capable") || lowerOutput.includes("not found device") || lowerOutput.includes("no device");
        
        if (code === 0 && dfuDetected && !hasNoDeviceError) {
          sendProgress(100, "done", "Firmware został pomyślnie wgrany do pamięci klawiatury!");
          resolve({ success: true, code, output: fullOutput });
        } else {
          const errMsg = hasNoDeviceError
            ? "Nie wykryto klawiatury w trybie DFU. Odłącz kabel USB, przytrzymaj klawisz Esc i podłącz ponownie."
            : `Proces programatora zakończył się niepowodzeniem (kod: ${code}).\n${fullOutput.trim()}`;
          resolve({
            success: false,
            code,
            error: errMsg,
            output: fullOutput
          });
        }
      });
    } catch (e) {
      currentFlasherProcess = null;
      resolve({ success: false, error: e.message });
    }
  });
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
