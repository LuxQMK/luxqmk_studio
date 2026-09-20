/**
 * LuxQMK Studio - Central Application Entry Point
 * Multi-device management, automatic startup reconnection, and persistent selection.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const protocol = new window.GMMK3Protocol();
  const ui = new window.UIController();
  const keymapEditor = new window.KeymapEditor(protocol);
  const lightingController = new window.LightingController(protocol);
  const studioLighting = (window.StudioLightingController)
    ? new window.StudioLightingController(protocol, lightingController)
    : new window.AudioVisualizer(protocol, lightingController);
  const keyTester = new window.KeyTester();
  const backupManager = new window.BackupManager(protocol);
  const macroManager = new window.MacroManager(protocol);
  const firmwareFlasher = (window.FirmwareFlasher) ? new window.FirmwareFlasher() : null;

  window.gProtocol = protocol;
  window.gmmkProtocol = protocol;
  window.gUI = ui;
  window.gKeymapEditor = keymapEditor;
  window.gLightingController = lightingController;
  window.gStudioLighting = studioLighting;
  window.gAudioVisualizer = studioLighting;
  window.gKeyTester = keyTester;
  window.gBackupManager = backupManager;
  window.gMacroManager = macroManager;
  window.gFirmwareFlasher = firmwareFlasher;

  // Initialize modules
  ui.init();
  keymapEditor.init();
  macroManager.init();
  lightingController.init();
  await studioLighting.init();
  backupManager.init();
  if (firmwareFlasher) await firmwareFlasher.init();
  window.i18n.translatePage();

  // Log listener connected to on-screen console
  protocol.onLog = (msg, type = "info") => {
    console.log(`[HID ${type.toUpperCase()}]`, msg);
    const consoleLog = document.getElementById("consoleLog");
    if (consoleLog) {
      const line = document.createElement("div");
      line.className = "log-line";
      const timeStr = new Date().toLocaleTimeString();
      line.innerHTML = `<span class="log-time">[${timeStr}]</span><span class="log-${type}">${msg}</span>`;
      consoleLog.appendChild(line);
      consoleLog.scrollTop = consoleLog.scrollHeight;

      if (consoleLog.children.length > 200) {
        consoleLog.removeChild(consoleLog.firstChild);
      }
    }
  };

  // --- MULTI-DEVICE MANAGEMENT & AUTO-RECONNECTION ---
  const deviceSelectorBtn = document.getElementById("deviceSelectorBtn");
  const deviceDropdownMenu = document.getElementById("deviceDropdownMenu");
  const deviceDropdownList = document.getElementById("deviceDropdownList");
  const deviceDropdownAddBtn = document.getElementById("deviceDropdownAddBtn");
  const deviceNameDisplay = document.getElementById("deviceNameDisplay");
  const deviceStatusBadge = document.getElementById("deviceStatusBadge");
  const deviceSelectorDot = document.getElementById("deviceSelectorDot");
  const btnAddDevice = document.getElementById("btnAddDevice");
  const btnConnect = document.getElementById("btnConnect");

  function closeDeviceDropdown() {
    if (deviceDropdownMenu) {
      deviceDropdownMenu.classList.remove("show");
      deviceSelectorBtn?.setAttribute("aria-expanded", "false");
    }
  }

  function toggleDeviceDropdown(e) {
    if (e) e.stopPropagation();
    if (!deviceDropdownMenu) return;
    const isShowing = deviceDropdownMenu.classList.contains("show");
    if (isShowing) {
      closeDeviceDropdown();
    } else {
      deviceDropdownMenu.classList.add("show");
      deviceSelectorBtn?.setAttribute("aria-expanded", "true");
    }
  }

  deviceSelectorBtn?.addEventListener("click", toggleDeviceDropdown);

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#customDeviceSelector")) {
      closeDeviceDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDeviceDropdown();
    }
  });

  deviceDropdownAddBtn?.addEventListener("click", async () => {
    closeDeviceDropdown();
    await triggerPairNewDevice();
  });

  async function refreshDeviceList() {
    const devices = await protocol.getAuthorizedDevices();
    if (!deviceDropdownList) return;

    deviceDropdownList.innerHTML = "";

    const isConnected = protocol.isConnected && protocol.device;
    const currentId = isConnected ? protocol.getDeviceId(protocol.device) : null;
    const currentName = isConnected ? (protocol.device.productName || "GMMK Keyboard") : null;

    if (devices.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "device-dropdown-empty";
      emptyEl.textContent = window.i18n.t("optNoDevices");
      deviceDropdownList.appendChild(emptyEl);

      if (deviceNameDisplay) deviceNameDisplay.textContent = window.i18n.t("optNoDevices");
      if (deviceStatusBadge) {
        deviceStatusBadge.textContent = window.i18n.t("statusDisconnected");
        deviceStatusBadge.classList.add("disconnected");
      }
      deviceSelectorDot?.classList.remove("connected");
    } else {
      devices.forEach((d, idx) => {
        const id = protocol.getDeviceId(d, idx);
        const isCurrent = isConnected && currentId === id;

        const itemBtn = document.createElement("button");
        itemBtn.className = `device-dropdown-item ${isCurrent ? "active" : ""}`;
        itemBtn.type = "button";
        itemBtn.innerHTML = `
          <span class="item-icon">⌨️</span>
          <span class="item-name">${d.productName || "GMMK Keyboard"}</span>
          ${isCurrent ? '<span class="item-check">✓</span>' : ''}
        `;

        itemBtn.addEventListener("click", async () => {
          closeDeviceDropdown();
          if (isCurrent) return;
          try {
            ui.showToast(window.i18n.t("toastSwitchingDevice"), "info");
            const dev = await protocol.connectDevice(d);
            await handleDeviceConnected(dev);
            ui.showToast(window.i18n.t("toastConnected", { name: dev.productName || "GMMK Keyboard" }), "success");
          } catch (err) {
            ui.showToast(window.i18n.t("toastSwitchError", { err: err.message }), "error");
            await refreshDeviceList();
          }
        });

        deviceDropdownList.appendChild(itemBtn);
      });

      if (isConnected && currentName) {
        if (deviceNameDisplay) deviceNameDisplay.textContent = currentName;
        if (deviceStatusBadge) {
          deviceStatusBadge.textContent = window.i18n.t("statusConnected");
          deviceStatusBadge.classList.remove("disconnected");
        }
        deviceSelectorDot?.classList.add("connected");
      } else {
        if (deviceNameDisplay) deviceNameDisplay.textContent = devices[0].productName || "GMMK Keyboard";
        if (deviceStatusBadge) {
          deviceStatusBadge.textContent = window.i18n.t("statusDisconnected");
          deviceStatusBadge.classList.add("disconnected");
        }
        deviceSelectorDot?.classList.remove("connected");
      }
    }
  }

  window.i18n.onChange(async () => {
    await refreshDeviceList();
    if (window.deviceManager) {
      window.deviceManager.applyProfileUI();
    }
  });

  async function handleDeviceConnected(dev) {
    if (!dev) return;
    const devId = protocol.getDeviceId(dev);
    localStorage.setItem("gmmk_last_device_id", devId);
    if (window.deviceManager) {
      window.deviceManager.identifyAndApply(dev);
    }
    ui.setDeviceConnectedState(true, dev.productName || "GMMK Keyboard");
    await refreshDeviceList();

    try {
      // Query LuxQMK & QMK firmware version for smart capability handshake
      const fwInfo = await protocol.getFirmwareVersion();
      const qmkVer = await protocol.getQMKVersion();
      fwInfo.qmkVersion = qmkVer;
      if (window.deviceManager) {
        window.deviceManager.setFirmwareInfo(fwInfo);
      }

      if (window.gLightingController) {
        window.gLightingController.clearStaleHits();
        if (ui && (ui.activeView === "lighting" || ui.activeView === "studio_lighting" || ui.activeView === "audio")) {
          window.gLightingController.startVisualizer();
        }
      }
      await keymapEditor.loadKeymapFromDevice();
      await lightingController.loadFromDevice();
      await macroManager.loadFromDevice();
      const debounceVal = await protocol.getDebounceTime();
      if (ui.updateDebounceFromDevice) {
        ui.updateDebounceFromDevice(debounceVal);
      }
    } catch (err) {
      console.warn("Could not load initial device configuration:", err);
    }
  }

  // Auto-connect on startup
  async function performAutoConnect() {
    try {
      const savedId = localStorage.getItem("gmmk_last_device_id");
      const dev = await protocol.autoConnect(savedId);
      if (dev) {
        ui.showToast(window.i18n.t("toastAutoConnected", { name: dev.productName || "GMMK Keyboard" }), "success");
        await handleDeviceConnected(dev);
      } else {
        await refreshDeviceList();
      }
    } catch (e) {
      console.warn("Auto-connect warning:", e);
      await refreshDeviceList();
    }
  }

  async function triggerPairNewDevice() {
    try {
      btnConnect && (btnConnect.disabled = true);
      const dev = await protocol.requestAndConnect();
      if (dev) {
        ui.showToast(window.i18n.t("toastNewConnected", { name: dev.productName || "GMMK Keyboard" }), "success");
        await handleDeviceConnected(dev);
      }
    } catch (err) {
      if (err.message && !err.message.includes("cancel") && !err.message.includes("anulow")) {
        ui.showToast("Connection error: " + err.message, "error");
      }
    } finally {
      btnConnect && (btnConnect.disabled = false);
      await refreshDeviceList();
    }
  }

  btnAddDevice?.addEventListener("click", triggerPairNewDevice);

  // Connect / Disconnect button
  btnConnect?.addEventListener("click", async () => {
    if (protocol.isConnected) {
      await protocol.disconnect();
      if (window.deviceManager) {
        window.deviceManager.setFirmwareInfo(null);
      }
      ui.setDeviceConnectedState(false);
      await refreshDeviceList();
      return;
    }
    await triggerPairNewDevice();
  });

  // Listen for USB plug/unplug events
  protocol.onDevicesChanged = async () => {
    await refreshDeviceList();
    if (!protocol.isConnected) {
      if (window.deviceManager) {
        window.deviceManager.setFirmwareInfo(null);
      }
      await performAutoConnect();
    }
  };

  protocol.onDisconnect = async () => {
    if (window.deviceManager) {
      window.deviceManager.setFirmwareInfo(null);
    }
    ui.setDeviceConnectedState(false);
    if (window.gLightingController) {
      window.gLightingController.clearStaleHits();
    }
    ui.showToast(window.i18n.t("logDisconnected"), "warning");
    await refreshDeviceList();
  };

  // Execute startup auto-connect
  await performAutoConnect();

  // Refresh Button Action
  document.getElementById("btnRefreshDevice")?.addEventListener("click", async () => {
    if (!protocol.device) return;
    try {
      ui.showToast(window.i18n.t("toastRefreshing"), "info");
      await keymapEditor.loadKeymapFromDevice();
      await lightingController.loadFromDevice();
      ui.showToast(window.i18n.t("toastRefreshed"), "success");
    } catch (e) {
      ui.showToast(window.i18n.t("toastRefreshError", { err: e.message }), "error");
    }
  });

  // Settings: Bootloader Action
  document.getElementById("btnJumpBootloader")?.addEventListener("click", async () => {
    if (!protocol.device) return;
    if (confirm(window.i18n.t("confirmBootloader"))) {
      await protocol.jumpToBootloader();
      ui.showToast(window.i18n.t("toastBootloaderReboot"), "warning");
    }
  });

  // Settings: Reset EEPROM Action
  document.getElementById("btnResetEEPROM")?.addEventListener("click", async () => {
    if (!protocol.device) return;
    if (confirm(window.i18n.t("confirmResetEEPROM"))) {
      await protocol.sendCommand([0x06 /* DYNAMIC_KEYMAP_RESET */]);
      ui.showToast(window.i18n.t("toastEepromReset"), "warning");
      setTimeout(async () => {
        await keymapEditor.loadKeymapFromDevice();
        await lightingController.loadFromDevice();
      }, 500);
    }
  });

  // Key Tester Reset Button
  document.getElementById("btnResetKeyTest")?.addEventListener("click", () => {
    keyTester.reset();
  });
});
