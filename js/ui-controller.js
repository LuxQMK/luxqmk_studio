/**
 * GMMK Studio - UI Controller & Navigation Manager
 */

(function () {
  class UIController {
    constructor() {
      this.activeView = "keymap";
      this.toastTimeout = null;
      this.isConnected = false;
      this.deviceName = "GMMK 3 100% ANSI";
    }

    init() {
      this._bindSidebarNav();
      this._bindLangSelect();
      this._initDesktopFeatures();
      this._initSettingsControls();
      this._initFooterAndModals();
      this._initResponsiveKeyboardFit();
    }

    _initFooterAndModals() {
      // 1. About & Legal Modal
      const btnAbout = document.getElementById("btnAboutApp");
      const aboutModal = document.getElementById("aboutModal");
      const btnCloseAbout = document.getElementById("btnCloseAboutModal");
      const btnOkAbout = document.getElementById("btnOkAboutModal");

      if (btnAbout && aboutModal) {
        btnAbout.addEventListener("click", () => {
          aboutModal.classList.add("active");
        });

        const closeAbout = () => aboutModal.classList.remove("active");
        btnCloseAbout?.addEventListener("click", closeAbout);
        btnOkAbout?.addEventListener("click", closeAbout);
        aboutModal.addEventListener("click", (e) => {
          if (e.target === aboutModal) closeAbout();
        });
      }

      // 2. Check for Updates
      const btnCheckUpdates = document.getElementById("btnCheckUpdates");
      if (btnCheckUpdates) {
        btnCheckUpdates.addEventListener("click", () => {
          this.showToast(window.i18n.t("msgUpdateCheckLatest"), "info");
        });
      }
    }

    async _initDesktopFeatures() {
      if (window.electronAPI && window.electronAPI.isDesktop) {
        const autostartCard = document.getElementById("desktopAutostartCard");
        const chkAutostart = document.getElementById("chkDesktopAutostart");
        if (autostartCard) autostartCard.style.display = "block";

        if (chkAutostart) {
          const isEnabled = await window.electronAPI.getAutostart();
          chkAutostart.checked = isEnabled;
          chkAutostart.addEventListener("change", async (e) => {
            const newState = await window.electronAPI.setAutostart(e.target.checked);
            chkAutostart.checked = newState;
            const msg = newState
              ? (window.i18n ? window.i18n.t("toastAutostartEnabled") : "Windows startup launch enabled")
              : (window.i18n ? window.i18n.t("toastAutostartDisabled") : "Windows startup launch disabled");
            this.showToast(msg, "info");
          });
        }
      }
    }

    _initSettingsControls() {
      // 1. Debounce Time Pills
      const savedDebounce = localStorage.getItem("gmmk_debounce_ms") || "5";
      const debounceBadge = document.getElementById("currentDebounceBadge");
      if (debounceBadge) debounceBadge.textContent = savedDebounce + " ms";

      document.querySelectorAll(".debounce-pill").forEach((pill) => {
        if (pill.dataset.val === savedDebounce) {
          pill.classList.add("active");
        } else {
          pill.classList.remove("active");
        }

        pill.addEventListener("click", () => {
          document.querySelectorAll(".debounce-pill").forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          const val = pill.dataset.val;
          localStorage.setItem("gmmk_debounce_ms", val);
          if (debounceBadge) debounceBadge.textContent = val + " ms";
          this.showToast(window.i18n.t("toastDebounceSet", { val: val + " ms" }), "success");
        });
      });

      // 2. NKRO Switch Toggle
      const chkNkro = document.getElementById("chkNkroToggle");
      const nkroBadge = document.getElementById("nkroStatusBadge");
      const savedNkro = localStorage.getItem("gmmk_nkro_enabled") !== "0"; // Default true (NKRO on)

      if (chkNkro) {
        chkNkro.checked = savedNkro;
        this._updateNkroBadge(savedNkro);

        chkNkro.addEventListener("change", (e) => {
          const isChecked = e.target.checked;
          localStorage.setItem("gmmk_nkro_enabled", isChecked ? "1" : "0");
          this._updateNkroBadge(isChecked);
          const modeStr = isChecked ? "Full NKRO" : "6KRO";
          this.showToast(window.i18n.t("toastNkroSet", { mode: modeStr }), "info");
        });
      }

      // 3. Polling Rate Select
      const selectPolling = document.getElementById("selectPollingRate");
      const savedPolling = localStorage.getItem("gmmk_polling_rate") || "1000";
      if (selectPolling) {
        selectPolling.value = savedPolling;
        selectPolling.addEventListener("change", (e) => {
          localStorage.setItem("gmmk_polling_rate", e.target.value);
          this.showToast(window.i18n.t("toastPollingSet", { hz: e.target.value + " Hz" }), "info");
        });
      }

      // 4. Maintenance Action Buttons
      const btnBootloader = document.getElementById("btnJumpBootloader");
      if (btnBootloader) {
        btnBootloader.addEventListener("click", async () => {
          if (!window.gProtocol || !window.gProtocol.isConnected) return;
          if (confirm(window.i18n.t("confirmBootloader"))) {
            try {
              await window.gProtocol.jumpToBootloader();
              this.showToast(window.i18n.t("toastBootloaderSuccess"), "warning");
            } catch (err) {
              this.showToast("Bootloader error: " + err.message, "error");
            }
          }
        });
      }

      const btnResetEeprom = document.getElementById("btnResetEEPROM");
      if (btnResetEeprom) {
        btnResetEeprom.addEventListener("click", async () => {
          if (!window.gProtocol || !window.gProtocol.isConnected) return;
          if (confirm(window.i18n.t("confirmResetEEPROM"))) {
            try {
              await window.gProtocol.resetEEPROM();
              this.showToast(window.i18n.t("toastResetEepromSuccess"), "success");
              if (window.gKeymapEditor) {
                await window.gKeymapEditor.readKeymaps();
              }
            } catch (err) {
              this.showToast("Reset error: " + err.message, "error");
            }
          }
        });
      }

      const btnQuickBackup = document.getElementById("btnQuickBackup");
      if (btnQuickBackup) {
        btnQuickBackup.addEventListener("click", () => {
          if (window.gBackupManager) {
            window.gBackupManager.createBackup();
          }
        });
      }
    }

    _updateNkroBadge(active) {
      const nkroBadge = document.getElementById("nkroStatusBadge");
      if (!nkroBadge) return;
      if (active) {
        nkroBadge.classList.add("active");
        nkroBadge.textContent = window.i18n.t("nkroActiveBadge");
      } else {
        nkroBadge.classList.remove("active");
        nkroBadge.textContent = window.i18n.t("nkroDisabledBadge");
      }
    }

    switchView(viewId) {
      this.activeView = viewId;

      // Update sidebar active buttons
      document.querySelectorAll(".nav-item-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === viewId);
      });

      // Update view containers
      document.querySelectorAll(".view-container").forEach((view) => {
        view.classList.toggle("active", view.id === `view-${viewId}`);
      });

      // Update Top Bar View Header Title
      const titles = {
        keymap: { t: "viewKeymapTitle", s: "viewKeymapSubtitle" },
        lighting: { t: "viewLightingTitle", s: "viewLightingSubtitle" },
        audio: { t: "viewAudioTitle", s: "viewAudioSubtitle" },
        encoder: { t: "viewEncoderTitle", s: "viewEncoderSubtitle" },
        tester: { t: "viewTesterTitle", s: "viewTesterSubtitle" },
        backup: { t: "viewBackupTitle", s: "viewBackupSubtitle" },
        settings: { t: "viewSettingsTitle", s: "viewSettingsSubtitle" }
      };

      const meta = titles[viewId] || titles.keymap;
      const h1 = document.getElementById("topBarViewTitle");
      const p = document.getElementById("topBarViewSubtitle");
      if (h1) h1.dataset.i18n = meta.t;
      if (p) p.dataset.i18n = meta.s;
      window.i18n.translatePage();

      // Ensure device connection labels are accurate after translatePage
      this.syncDeviceStatusUI();

      // Start or stop Key Tester if entering/leaving tester view
      if (window.gKeyTester) {
        if (viewId === "tester") {
          window.gKeyTester.start();
        } else {
          window.gKeyTester.stop();
        }
      }

      // Start or stop Lighting Visualizer loop
      if (window.gLightingController) {
        if (viewId === "lighting" || viewId === "audio") {
          window.gLightingController.startVisualizer();
        } else {
          window.gLightingController.stopVisualizer();
        }
      }

      // Responsive fit for newly displayed view
      requestAnimationFrame(() => this.fitKeyboardPreviews());
    }

    setDeviceConnectedState(connected, devName = "GMMK 3 100% ANSI") {
      this.isConnected = Boolean(connected);
      if (devName) this.deviceName = devName;
      this.syncDeviceStatusUI();

      // Enable/disable maintenance action buttons
      const maintenanceButtons = [
        document.getElementById("btnJumpBootloader"),
        document.getElementById("btnResetEEPROM"),
        document.getElementById("btnQuickBackup"),
        document.getElementById("btnCreateBackup"),
        document.getElementById("btnRestoreBackup"),
        document.getElementById("btnRefreshDevice")
      ];

      maintenanceButtons.forEach((btn) => {
        if (btn) btn.disabled = !this.isConnected;
      });

      if (window.gLightingController) {
        window.gLightingController.setControlsEnabled(true);
      }
    }

    syncDeviceStatusUI() {
      const chip = document.getElementById("deviceChip");
      const chipName = document.getElementById("deviceChipName");
      const btnConnect = document.getElementById("btnConnect");
      const btnConnectLabel = document.getElementById("btnConnectLabel");
      const deviceNameDisplay = document.getElementById("deviceNameDisplay");
      const deviceStatusBadge = document.getElementById("deviceStatusBadge");
      const deviceSelectorDot = document.getElementById("deviceSelectorDot");

      if (this.isConnected) {
        chip?.classList.add("connected");
        if (chipName) chipName.textContent = this.deviceName;
        if (deviceNameDisplay) deviceNameDisplay.textContent = this.deviceName;
        if (deviceStatusBadge) {
          deviceStatusBadge.textContent = window.i18n.t("statusConnected");
          deviceStatusBadge.classList.remove("disconnected");
        }
        deviceSelectorDot?.classList.add("connected");

        if (btnConnectLabel) btnConnectLabel.textContent = window.i18n.t("btnDisconnect");
        btnConnect?.classList.replace("btn-primary", "btn-secondary");
      } else {
        chip?.classList.remove("connected");
        if (chipName) chipName.textContent = window.i18n.t("statusDisconnected");
        if (deviceNameDisplay) deviceNameDisplay.textContent = window.i18n.t("optSearchingDevices");
        if (deviceStatusBadge) {
          deviceStatusBadge.textContent = window.i18n.t("statusDisconnected");
          deviceStatusBadge.classList.add("disconnected");
        }
        deviceSelectorDot?.classList.remove("connected");

        if (btnConnectLabel) btnConnectLabel.textContent = window.i18n.t("btnConnect");
        btnConnect?.classList.replace("btn-secondary", "btn-primary");
      }

      // Re-sync NKRO badge text with current language
      const chkNkro = document.getElementById("chkNkroToggle");
      if (chkNkro) this._updateNkroBadge(chkNkro.checked);
    }

    showToast(message, type = "info") {
      let toast = document.getElementById("appToast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "appToast";
        toast.className = "app-toast";
        document.body.appendChild(toast);
      }

      const icons = {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌"
      };

      const icon = icons[type] || "ℹ️";
      toast.innerHTML = `<span style="font-size:1.1rem; flex-shrink:0;">${icon}</span><span style="flex:1;">${message}</span>`;
      toast.className = `app-toast toast-${type} show`;
      toast.onclick = () => {
        toast.classList.remove("show");
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
      };

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
      }, 3500);
    }

    _bindSidebarNav() {
      document.querySelectorAll(".nav-item-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.switchView(btn.dataset.view);
        });
      });
    }

    _bindLangSelect() {
      const select = document.getElementById("langSelect");
      if (select) {
        select.value = window.i18n.currentLang;
        select.addEventListener("change", (e) => {
          window.i18n.setLang(e.target.value);
          this.syncDeviceStatusUI();
        });
      }
    }

    _initResponsiveKeyboardFit() {
      const fit = () => this.fitKeyboardPreviews();

      if (typeof ResizeObserver !== "undefined") {
        this._keyboardResizeObserver = new ResizeObserver(() => {
          window.requestAnimationFrame(fit);
        });

        document.querySelectorAll(".keyboard-scroll-wrapper").forEach((wrapper) => {
          this._keyboardResizeObserver.observe(wrapper);
        });
      }

      window.addEventListener("resize", fit);
      window.addEventListener("orientationchange", fit);

      // Perform initial layout passes once DOM is settled
      setTimeout(fit, 60);
      setTimeout(fit, 350);
    }

    fitKeyboardPreviews() {
      const wrappers = document.querySelectorAll(".keyboard-scroll-wrapper");
      wrappers.forEach((wrapper) => {
        const canvas = wrapper.querySelector(".keyboard-canvas");
        if (!canvas) return;

        const containerWidth = wrapper.clientWidth;
        if (containerWidth <= 0) return; // Tab is hidden (display: none)

        // offsetWidth and offsetHeight return the unscaled DOM layout box dimensions
        const baseWidth = canvas.offsetWidth || 1161;
        const baseHeight = canvas.offsetHeight || 349;

        if (containerWidth < baseWidth) {
          const scale = containerWidth / baseWidth;
          canvas.style.transform = `scale(${scale})`;
          canvas.style.transformOrigin = "top center";
          wrapper.style.height = `${Math.ceil(baseHeight * scale)}px`;
        } else {
          canvas.style.transform = "none";
          wrapper.style.height = `${baseHeight}px`;
        }
      });
    }
  }

  window.UIController = UIController;
})();
