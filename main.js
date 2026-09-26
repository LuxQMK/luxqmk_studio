const { app, BrowserWindow, Tray, Menu, ipcMain, desktopCapturer, session, shell, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn, execSync } = require("child_process");

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

// Disable background throttling for real-time 60 FPS RGB matrix streaming & audio visualizer
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");

/**
 * Reads user-config.json safely from userData directory.
 */
function getUserConfig() {
  try {
    const userPath = app.getPath("userData");
    const cfgFile = path.join(userPath, "user-config.json");
    if (fs.existsSync(cfgFile)) {
      return JSON.parse(fs.readFileSync(cfgFile, "utf-8")) || {};
    }
  } catch (e) {}
  return {};
}

/**
 * Updates user-config.json with a patch object.
 */
function persistUserConfigPatch(patch) {
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
    const updated = { ...existing, ...patch, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(cfgFile, JSON.stringify(updated, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to patch user config:", e);
  }
}

/**
 * Checks if autostart at login is currently registered in Windows registry or app settings.
 */
function isAutostartEnabled() {
  if (process.platform === "win32") {
    try {
      const out = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "LuxQMK Studio"', {
        encoding: "utf-8",
        windowsHide: true,
        stdio: ["ignore", "pipe", "ignore"]
      });
      if (out && out.includes("LuxQMK Studio")) return true;
    } catch (e) {}
    try {
      const outLegacy = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "electron.app.LuxQMK Studio"', {
        encoding: "utf-8",
        windowsHide: true,
        stdio: ["ignore", "pipe", "ignore"]
      });
      if (outLegacy && outLegacy.includes("LuxQMK Studio")) return true;
    } catch (e) {}
  }

  // Fallback to Electron API
  try {
    const withHidden = app.getLoginItemSettings({ args: ["--hidden", "--autostart"] });
    if (withHidden && withHidden.openAtLogin) return true;
    const withSingleArg = app.getLoginItemSettings({ args: ["--hidden"] });
    if (withSingleArg && withSingleArg.openAtLogin) return true;
    const standard = app.getLoginItemSettings();
    if (standard && standard.openAtLogin) return true;
  } catch (e) {}

  // Check user config
  const cfg = getUserConfig();
  if (cfg.autostart === true) return true;

  return false;
}

/**
 * Configures autostart at login with hidden flags so Windows launches it silently in tray.
 */
function setAutostartState(enable) {
  const isEnabled = !!enable;

  if (process.platform === "win32") {
    const exePath = process.execPath;
    if (isEnabled) {
      const cmd = `\\"${exePath}\\" --hidden --autostart`;
      try {
        execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "LuxQMK Studio" /t REG_SZ /d "${cmd}" /f`, { windowsHide: true });
        // Clean up legacy key if present to prevent unflagged duplicates
        try {
          execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "electron.app.LuxQMK Studio" /f`, { windowsHide: true });
        } catch (e) {}
      } catch (err) {
        console.error("Failed to add autostart registry entry via reg.exe:", err);
      }
    } else {
      try {
        execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "LuxQMK Studio" /f`, { windowsHide: true });
      } catch (e) {}
      try {
        execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "electron.app.LuxQMK Studio" /f`, { windowsHide: true });
      } catch (e) {}
    }
  }

  // Also synchronize Electron's internal login item settings
  try {
    app.setLoginItemSettings({
      openAtLogin: isEnabled,
      openAsHidden: true,
      path: process.execPath,
      args: isEnabled ? ["--hidden", "--autostart"] : []
    });
  } catch (e) {
    console.error("Failed to set login item settings:", e);
  }

  // Persist preference in user-config.json
  persistUserConfigPatch({ autostart: isEnabled });

  return isAutostartEnabled();
}

/**
 * Verifies and repairs the autostart registry entry on application boot if needed.
 * Ensures that if autostart is enabled, it contains the mandatory `--hidden --autostart` flags.
 */
function ensureAutostartIntegrity() {
  if (process.platform !== "win32") return;
  try {
    if (isAutostartEnabled()) {
      let needsFix = false;
      try {
        const out = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "LuxQMK Studio"', {
          encoding: "utf-8",
          windowsHide: true,
          stdio: ["ignore", "pipe", "ignore"]
        });
        if (!out.includes("--hidden") && !out.includes("--autostart")) {
          needsFix = true;
        }
      } catch (e) {
        needsFix = true; // Key was missing or in legacy name
      }

      // Check if legacy key is present
      try {
        const legacyOut = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "electron.app.LuxQMK Studio"', {
          encoding: "utf-8",
          windowsHide: true,
          stdio: ["ignore", "pipe", "ignore"]
        });
        if (legacyOut) {
          needsFix = true;
        }
      } catch (e) {}

      if (needsFix) {
        setAutostartState(true);
      }
    }
  } catch (e) {
    console.warn("Failed to verify autostart integrity:", e);
  }
}

/**
 * Detects whether the application should start silently in background / system tray.
 * Uses multi-layered detection:
 * 1. Command-line flags (--hidden, --autostart, /hidden, --minimized, etc.)
 * 2. Electron login item settings (wasOpenedAsHidden, wasOpenedAtLogin)
 * 3. System Uptime Heuristic (launched within 5 min of system boot with autostart enabled)
 * 4. User config flag (startMinimizedToTray)
 */
function shouldStartHidden() {
  const args = process.argv || [];
  const hiddenFlags = [
    "--hidden",
    "-hidden",
    "/hidden",
    "--autostart",
    "-autostart",
    "/autostart",
    "--minimized",
    "-minimized",
    "/minimized",
    "--background",
    "-background",
    "/background",
    "--tray",
    "-tray",
    "/tray"
  ];
  const hasHiddenFlag = args.some((arg) => hiddenFlags.includes(String(arg).toLowerCase()));
  if (hasHiddenFlag) {
    console.log("[Startup] Starting hidden in system tray (Flag detected in process.argv).");
    return true;
  }

  try {
    const loginSettings = app.getLoginItemSettings();
    if (loginSettings && (loginSettings.wasOpenedAsHidden || loginSettings.wasOpenedAtLogin)) {
      console.log("[Startup] Starting hidden in system tray (Electron login item detected).");
      return true;
    }
  } catch (e) {}

  // Heuristic: If autostart is enabled AND system was booted recently (within 5 minutes / 300s),
  // this is an OS startup boot launch!
  try {
    const uptimeSec = os.uptime();
    if (uptimeSec < 300 && isAutostartEnabled()) {
      console.log(`[Startup] Starting hidden in system tray (System uptime ${Math.round(uptimeSec)}s < 300s & autostart enabled).`);
      return true;
    }
  } catch (e) {}

  // Check user config preference for explicit start minimized
  try {
    const cfg = getUserConfig();
    if (cfg.startMinimizedToTray === true) {
      console.log("[Startup] Starting hidden in system tray (startMinimizedToTray configured).");
      return true;
    }
  } catch (e) {}

  console.log("[Startup] Starting visible window.");
  return false;
}

let updateTrayMenuFn = null;

function createWindow() {
  const startHidden = shouldStartHidden();

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: "#0b0f19",
    autoHideMenuBar: true,
    title: "LuxQMK Studio",
    icon: path.join(__dirname, "assets", "icon.png"),
    show: false, // Initially false to prevent flicker; shown when ready if not startHidden
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false // Keep RGB & Audio running at 60 FPS in background!
    }
  });

  // Only show the window on startup if not starting hidden in tray
  if (!startHidden) {
    mainWindow.once("ready-to-show", () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
    });
  }

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
      // Prioritize dedicated Raw HID / VIA interface (usagePage 0xFF60)
      const rawTarget = details.deviceList.find((d) =>
        d.collections && d.collections.some((c) => c.usagePage === 0xff60 && (c.usage === 0x61 || c.usage === 0x01))
      ) || details.deviceList.find((d) =>
        d.collections && d.collections.some((c) => c.usagePage === 0xff60)
      ) || details.deviceList.find((d) =>
        (d.vendorId === 0x504b || d.vendorId === 0x320f || d.vendorId === 0x0c45) ||
        (d.productName && d.productName.toLowerCase().includes("gmmk"))
      );
      callback(rawTarget ? rawTarget.deviceId : details.deviceList[0].deviceId);
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

  const distIndex = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(distIndex)) {
    mainWindow.loadFile(distIndex);
  } else {
    mainWindow.loadFile(path.join(__dirname, "index.html"));
  }

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
    const isAutostart = isAutostartEnabled();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Otwórz LuxQMK Studio",
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
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
          setAutostartState(menuItem.checked);
          updateMenu();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("autostart-changed", menuItem.checked);
          }
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

  updateTrayMenuFn = updateMenu;
  updateMenu();

  tray.on("double-click", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  tray.on("click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// IPC Handlers
ipcMain.handle("get-autostart", () => {
  return isAutostartEnabled();
});

ipcMain.handle("set-autostart", (event, enable) => {
  const state = setAutostartState(enable);
  if (updateTrayMenuFn) {
    updateTrayMenuFn();
  }
  return state;
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

ipcMain.handle("flasher:flash-firmware", async (event, { filePath, toolType = "wb32" }) => {
  if (!fs.existsSync(filePath)) {
    return { success: false, error: "Plik firmware nie istnieje: " + filePath };
  }

  const toolExe = getFlasherToolPath(toolType);
  if (!toolExe) {
    return {
      success: false,
      error: `Nie znaleziono narzędzia programującego (${toolType}).`
    };
  }

  const isWb32 = toolType.toLowerCase().includes("wb32") || toolExe.toLowerCase().includes("wb32");

  const sendProgress = (percent, phase, log) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("flasher:progress", { percent, phase, log });
    }
  };

  sendProgress(10, "starting", `Inicjalizacja programatora (${path.basename(toolExe)})...`);

  // Helper to run a short command tool (e.g. list devices or reset)
  const runTool = (args) => {
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      const child = spawn(toolExe, args, { windowsHide: true });
      currentFlasherProcess = child;

      child.stdout?.on("data", (d) => {
        stdout += d.toString();
      });
      child.stderr?.on("data", (d) => {
        stderr += d.toString();
      });
      child.on("error", (err) => {
        resolve({ code: -1, stdout, stderr, error: err.message });
      });
      child.on("close", (code) => {
        resolve({ code, stdout, stderr });
      });
    });
  };

  // Phase A: Wait for DFU device detection (up to 15 seconds)
  sendProgress(25, "waiting_dfu", "Oczekiwanie na wykrycie klawiatury w trybie Bootloadera DFU...");
  let dfuFound = false;
  let dfuDetails = "";
  const startWait = Date.now();

  while (Date.now() - startWait < 15000) {
    const listRes = await runTool(["-l"]);
    const out = (listRes.stdout + listRes.stderr);
    if (out.includes("Found DFU") || out.includes("Found runtime") || (out.includes("[") && out.includes("]"))) {
      dfuFound = true;
      dfuDetails = out.trim();
      break;
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  if (!dfuFound) {
    return {
      success: false,
      timeout: true,
      error: "Nie wykryto klawiatury w trybie Bootloadera DFU w ciągu 15 sekund. Odłącz kabel USB, przytrzymaj klawisz Esc (lub przycisk Reset na płytce PCB) i podłącz ponownie."
    };
  }

  sendProgress(40, "erasing", "Wykryto urządzenie DFU! Przygotowanie do zapisu pamięci Flash...");

  // Phase B: Execute Flash Write
  const flashArgs = isWb32
    ? ["-t", "-s", "0x08000000", "-D", filePath]
    : ["-a", "0", "-s", "0x08000000:leave", "-D", filePath];

  sendProgress(50, "flashing", "Zapisywanie nowego firmware do pamięci Flash MCU...");

  const flashResult = await new Promise((resolve) => {
    let fullOutput = "";
    const child = spawn(toolExe, flashArgs, { windowsHide: true });
    currentFlasherProcess = child;

    child.stdout?.on("data", (data) => {
      const str = data.toString();
      fullOutput += str;
      console.log("[Flasher STDOUT]:", str.trim());
      const match = str.match(/(\d{1,3})%/);
      if (match) {
        const pct = Math.min(95, Math.max(50, parseInt(match[1], 10)));
        sendProgress(pct, "flashing", `Zapisywanie nowego firmware: ${match[1]}%`);
      } else if (str.includes("Erasing") || str.includes("erase")) {
        sendProgress(45, "erasing", "Czyszczenie pamięci Flash...");
      } else if (str.includes("Downloading") || str.includes("Write")) {
        sendProgress(70, "flashing", "Wgrywanie danych firmware do mikrokontrolera...");
      }
    });

    child.stderr?.on("data", (data) => {
      const str = data.toString();
      fullOutput += str;
      console.warn("[Flasher STDERR]:", str.trim());
    });

    child.on("error", (err) => {
      currentFlasherProcess = null;
      resolve({ success: false, error: err.message, output: fullOutput });
    });

    child.on("close", (code) => {
      currentFlasherProcess = null;
      const lower = fullOutput.toLowerCase();
      const hasError = code !== 0 || lower.includes("error") || lower.includes("failed") || lower.includes("not found");
      resolve({ success: !hasError, code, output: fullOutput });
    });
  });

  if (!flashResult.success) {
    return {
      success: false,
      error: `Błąd podczas programowania pamięci Flash (kod: ${flashResult.code}).\n${flashResult.output}`,
      output: flashResult.output
    };
  }

  // Phase C: If WB32, issue reset command (-R) to reboot the keyboard into new firmware
  if (isWb32) {
    sendProgress(95, "rebooting", "Resetowanie i restartowanie klawiatury...");
    await runTool(["-R"]);
  }

  sendProgress(100, "done", "Firmware został pomyślnie wgrany do pamięci klawiatury!");
  return { success: true, output: flashResult.output };
});

app.whenReady().then(() => {
  ensureAutostartIntegrity();
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
