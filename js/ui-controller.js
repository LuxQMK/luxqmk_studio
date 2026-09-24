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
      this.unsavedDomains = {
        lighting: false,
        profile: false,
        gradient: false,
        performance: false
      };
      this.hasUnsavedChanges = false;
    }

    init() {
      this._bindSidebarNav();
      this._bindLangSelect();
      this._initLayoutControls();
      this._initDesktopFeatures();
      this._initSettingsControls();
      this._initFooterAndModals();
      this._initResponsiveKeyboardFit();
      this._initUnsavedChangesBanner();
    }

    _initLayoutControls() {
      const select = document.getElementById("layoutPresetSelect");
      const btnLoad = document.getElementById("btnLoadViaJson");
      const fileInput = document.getElementById("viaJsonFileInput");

      if (select) {
        select.addEventListener("change", (e) => {
          const profileId = e.target.value;
          if (window.deviceManager) {
            window.deviceManager.setProfile(profileId);
            this.showToast(
              window.i18n ? (window.i18n.t("toastSwitchingDevice") || "Layout switched") : "Layout switched",
              "info"
            );
          }
        });
      }

      if (btnLoad && fileInput) {
        btnLoad.addEventListener("click", () => {
          fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const parsed = JSON.parse(evt.target.result);
              if (window.deviceManager && window.deviceManager.loadCustomVIALayout(parsed)) {
                const count = window.deviceManager.getActiveProfile().customLayout.length;
                const msg = window.i18n ? window.i18n.t("toastLayoutLoaded", { count: count }) : `VIA Layout (${count} keys) loaded successfully!`;
                this.showToast(msg, "success");
              } else {
                const errMsg = window.i18n ? window.i18n.t("toastLayoutError") : "Invalid VIA JSON layout file format.";
                this.showToast(errMsg, "error");
              }
            } catch (err) {
              console.error("Error parsing VIA JSON layout:", err);
              const errMsg = window.i18n ? window.i18n.t("toastLayoutError") : "Failed to parse JSON file.";
              this.showToast(errMsg, "error");
            }
            fileInput.value = "";
          };
          reader.readAsText(file);
        });
      }
    }

    _initFooterAndModals() {
      // 1. Application Settings Modal
      const btnAppSettings = document.getElementById("btnAppSettings");
      const appSettingsModal = document.getElementById("appSettingsModal");
      const btnCloseAppSettings = document.getElementById("btnCloseAppSettingsModal");
      const btnOkAppSettings = document.getElementById("btnOkAppSettingsModal");
      const chkAppAutostartModal = document.getElementById("chkAppAutostartModal");
      const lblAppAutostartStatus = document.getElementById("lblAppAutostartStatus");
      const btnOpenAppDataModal = document.getElementById("btnOpenAppDataModal");

      if (btnAppSettings && appSettingsModal) {
        btnAppSettings.addEventListener("click", async () => {
          appSettingsModal.classList.add("active");
          // Sync current states
          const modalSelect = document.getElementById("appLanguageSelectModal");
          if (modalSelect && window.i18n) {
            modalSelect.value = window.i18n.currentLang;
          }
          if (window.electronAPI && window.electronAPI.isDesktop) {
            try {
              const isEnabled = await window.electronAPI.getAutostart();
              if (chkAppAutostartModal) chkAppAutostartModal.checked = isEnabled;
              if (lblAppAutostartStatus && window.i18n) {
                lblAppAutostartStatus.textContent = isEnabled
                  ? window.i18n.t("lblAutostartStatusEnabled")
                  : window.i18n.t("lblAutostartStatusDisabled");
                lblAppAutostartStatus.style.color = isEnabled ? "var(--accent-cyan)" : "var(--text-muted)";
              }
            } catch (err) {
              console.warn("Could not query autostart status:", err);
            }
          } else {
            if (chkAppAutostartModal) chkAppAutostartModal.disabled = true;
            if (lblAppAutostartStatus && window.i18n) {
              lblAppAutostartStatus.textContent = window.i18n.t("lblAutostartNotAvailable");
            }
          }
        });

        const closeAppSettings = () => appSettingsModal.classList.remove("active");
        btnCloseAppSettings?.addEventListener("click", closeAppSettings);
        btnOkAppSettings?.addEventListener("click", closeAppSettings);
        appSettingsModal.addEventListener("click", (e) => {
          if (e.target === appSettingsModal) closeAppSettings();
        });
      }

      // Autostart switch in App Settings Modal
      if (chkAppAutostartModal && window.electronAPI && window.electronAPI.isDesktop) {
        if (typeof window.electronAPI.onAutostartChanged === "function") {
          window.electronAPI.onAutostartChanged((isEnabled) => {
            if (chkAppAutostartModal) chkAppAutostartModal.checked = isEnabled;
            const chkDesktop = document.getElementById("chkDesktopAutostart");
            if (chkDesktop) chkDesktop.checked = isEnabled;
            if (lblAppAutostartStatus && window.i18n) {
              lblAppAutostartStatus.textContent = isEnabled
                ? window.i18n.t("lblAutostartStatusEnabled")
                : window.i18n.t("lblAutostartStatusDisabled");
              lblAppAutostartStatus.style.color = isEnabled ? "var(--accent-cyan)" : "var(--text-muted)";
            }
          });
        }

        chkAppAutostartModal.addEventListener("change", async (e) => {
          try {
            const newState = await window.electronAPI.setAutostart(e.target.checked);
            chkAppAutostartModal.checked = newState;
            const chkDesktop = document.getElementById("chkDesktopAutostart");
            if (chkDesktop) chkDesktop.checked = newState;

            if (lblAppAutostartStatus && window.i18n) {
              lblAppAutostartStatus.textContent = newState
                ? window.i18n.t("lblAutostartStatusEnabled")
                : window.i18n.t("lblAutostartStatusDisabled");
              lblAppAutostartStatus.style.color = newState ? "var(--accent-cyan)" : "var(--text-muted)";
            }

            const msg = newState
              ? (window.i18n ? window.i18n.t("toastAutostartEnabled") : "Windows startup launch enabled")
              : (window.i18n ? window.i18n.t("toastAutostartDisabled") : "Windows startup launch disabled");
            this.showToast(msg, "info");
          } catch (err) {
            console.error("Failed to toggle autostart:", err);
          }
        });
      }

      // Open Data Folder
      if (btnOpenAppDataModal) {
        btnOpenAppDataModal.addEventListener("click", async () => {
          if (window.electronAPI && typeof window.electronAPI.openAppDataFolder === "function") {
            try {
              await window.electronAPI.openAppDataFolder();
              const msg = window.i18n ? window.i18n.t("toastAppDataOpened") : "Opened data directory in file manager";
              this.showToast(msg, "success");
            } catch (err) {
              console.error("Failed to open data folder:", err);
              this.showToast("Failed to open data folder", "error");
            }
          } else {
            this.showToast("Data folder is available in the desktop application", "warning");
          }
        });
      }

      // 2. About & Legal Modal
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

      // 3. Check for Updates
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
        const chkAppAutostartModal = document.getElementById("chkAppAutostartModal");
        const lblAppAutostartStatus = document.getElementById("lblAppAutostartStatus");

        if (autostartCard) autostartCard.style.display = "block";

        if (chkAutostart) {
          const isEnabled = await window.electronAPI.getAutostart();
          chkAutostart.checked = isEnabled;
          if (chkAppAutostartModal) chkAppAutostartModal.checked = isEnabled;
          if (lblAppAutostartStatus && window.i18n) {
            lblAppAutostartStatus.textContent = isEnabled
              ? window.i18n.t("lblAutostartStatusEnabled")
              : window.i18n.t("lblAutostartStatusDisabled");
            lblAppAutostartStatus.style.color = isEnabled ? "var(--accent-cyan)" : "var(--text-muted)";
          }

          chkAutostart.addEventListener("change", async (e) => {
            const newState = await window.electronAPI.setAutostart(e.target.checked);
            chkAutostart.checked = newState;
            if (chkAppAutostartModal) chkAppAutostartModal.checked = newState;
            if (lblAppAutostartStatus && window.i18n) {
              lblAppAutostartStatus.textContent = newState
                ? window.i18n.t("lblAutostartStatusEnabled")
                : window.i18n.t("lblAutostartStatusDisabled");
              lblAppAutostartStatus.style.color = newState ? "var(--accent-cyan)" : "var(--text-muted)";
            }
            const msg = newState
              ? (window.i18n ? window.i18n.t("toastAutostartEnabled") : "Windows startup launch enabled")
              : (window.i18n ? window.i18n.t("toastAutostartDisabled") : "Windows startup launch disabled");
            this.showToast(msg, "info");
          });
        }
      }
    }

    _initSettingsControls() {
      // 1. Debounce Algorithm (Engine) Selector
      const savedDebounceType = localStorage.getItem("gmmk_debounce_type") || "0";
      const debounceTypeBadge = document.getElementById("currentDebounceTypeBadge");
      const typeContainer = document.getElementById("debounceTypePillsContainer");

      const updateDebounceTypeBadgeText = (val) => {
        if (!debounceTypeBadge) return;
        const keyMap = {
          "0": "badgeDefer",
          "1": "badgeAsymEager",
          "2": "badgeSymEager"
        };
        const key = keyMap[val] || "badgeDefer";
        debounceTypeBadge.textContent = window.i18n ? window.i18n.t(key) : "Symmetric Defer (QMK Default)";
      };

      if (typeContainer) {
        updateDebounceTypeBadgeText(savedDebounceType);
        const typePills = typeContainer.querySelectorAll(".debounce-pill");
        typePills.forEach((pill) => {
          if (pill.dataset.val === savedDebounceType) {
            pill.classList.add("active");
          } else {
            pill.classList.remove("active");
          }

          pill.addEventListener("click", () => {
            typePills.forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            const val = pill.dataset.val;
            localStorage.setItem("gmmk_debounce_type", val);
            updateDebounceTypeBadgeText(val);
            const badgeText = debounceTypeBadge ? debounceTypeBadge.textContent : val;
            this.showToast(window.i18n.t("toastDebounceTypeSet", { val: badgeText }), "success");
          });
        });
      }

      // 2. Debounce Time Selector
      const savedDebounce = localStorage.getItem("gmmk_debounce_ms") || "5";
      const debounceBadge = document.getElementById("currentDebounceBadge");
      const timeContainer = document.getElementById("debouncePillsContainer");
      if (debounceBadge) debounceBadge.textContent = savedDebounce + " ms";

      if (timeContainer) {
        const timePills = timeContainer.querySelectorAll(".debounce-pill");
        timePills.forEach((pill) => {
          if (pill.dataset.val === savedDebounce) {
            pill.classList.add("active");
          } else {
            pill.classList.remove("active");
          }

          pill.addEventListener("click", async () => {
            timePills.forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            const val = pill.dataset.val;
            localStorage.setItem("gmmk_debounce_ms", val);
            if (debounceBadge) debounceBadge.textContent = val + " ms";
            const proto = window.gProtocol || window.gmmkProtocol;
            if (proto && proto.isConnected) {
              try {
                await proto.setDebounceTime(parseInt(val, 10));
                this.setUnsavedChanges(true, "performance");
              } catch (e) {
                console.warn("Failed to set debounce on device:", e);
              }
            }
            this.showToast(window.i18n.t("toastDebounceSet", { val: val + " ms" }), "success");
          });
        });
      }

      // 3. NKRO Switch Toggle
      const chkNkro = document.getElementById("chkNkroToggle");
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

      // 4. Polling Rate Select
      const selectPolling = document.getElementById("selectPollingRate");
      const savedPolling = localStorage.getItem("gmmk_polling_rate") || "1000";
      if (selectPolling) {
        selectPolling.value = savedPolling;
        selectPolling.addEventListener("change", (e) => {
          localStorage.setItem("gmmk_polling_rate", e.target.value);
          this.showToast(window.i18n.t("toastPollingSet", { hz: e.target.value + " Hz" }), "info");
        });
      }

      // 5. Maintenance Action Buttons
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

      // 6. Save Performance Settings to EEPROM
      const btnSavePerf = document.getElementById("btnSavePerformanceEEPROM");
      if (btnSavePerf) {
        btnSavePerf.addEventListener("click", async () => {
          const proto = window.gProtocol || window.gmmkProtocol;
          if (!proto || !proto.isConnected) {
            this.showToast(window.i18n ? window.i18n.t("toastConnectKeyboardFirst") : "Connect keyboard first", "warning");
            return;
          }
          try {
            await proto.saveCustomConfig();
            this.setUnsavedChanges(false, "performance");
            this.showToast(window.i18n ? window.i18n.t("toastSavedToEEPROM") : "Settings saved to keyboard memory (EEPROM)!", "success");
          } catch (err) {
            this.showToast("Save error: " + err.message, "error");
          }
        });
      }

      // Sync badges and banner when language is switched
      if (window.i18n && typeof window.i18n.onChange === "function") {
        window.i18n.onChange(() => {
          const currentType = localStorage.getItem("gmmk_debounce_type") || "0";
          updateDebounceTypeBadgeText(currentType);
          const currentNkro = localStorage.getItem("gmmk_nkro_enabled") !== "0";
          this._updateNkroBadge(currentNkro);
          this._updateUnsavedUI();
        });
      }
    }

    _initUnsavedChangesBanner() {
      const btnTopBarSave = document.getElementById("btnTopBarSave");
      if (btnTopBarSave) {
        btnTopBarSave.addEventListener("click", () => this.saveAllToEEPROM());
      }
      const btnTopBarDiscard = document.getElementById("btnTopBarDiscard");
      if (btnTopBarDiscard) {
        btnTopBarDiscard.addEventListener("click", () => this.discardAllUnsavedChanges());
      }

      window.addEventListener("beforeunload", (e) => {
        if (this.hasUnsavedChanges) {
          e.preventDefault();
          e.returnValue = "";
          return "";
        }
      });
    }

    setUnsavedChanges(hasUnsaved = true, domain = "lighting") {
      if (hasUnsaved) {
        if (domain === "all") {
          this.unsavedDomains.lighting = true;
          this.unsavedDomains.profile = true;
          this.unsavedDomains.gradient = true;
          this.unsavedDomains.performance = true;
        } else if (this.unsavedDomains[domain] !== undefined) {
          this.unsavedDomains[domain] = true;
        } else {
          this.unsavedDomains.lighting = true;
        }
      } else {
        if (!domain || domain === "all") {
          this.unsavedDomains.lighting = false;
          this.unsavedDomains.profile = false;
          this.unsavedDomains.gradient = false;
          this.unsavedDomains.performance = false;
        } else if (this.unsavedDomains[domain] !== undefined) {
          this.unsavedDomains[domain] = false;
        }
      }

      this.hasUnsavedChanges = Object.values(this.unsavedDomains).some(Boolean);
      this._updateUnsavedUI();
    }

    _updateUnsavedUI() {
      const topBarBadge = document.getElementById("topBarUnsavedBadge");

      // 1. Update pulsating highlight on lighting save buttons
      const lightingButtons = document.querySelectorAll(
        "#btnSaveBacklightEEPROM, #btnSaveReactiveEEPROM, #btnSaveWinLockEEPROM, #btnSaveLayersEEPROM, #btnSaveLogoEEPROM, #btnSaveMonochromeEEPROM"
      );
      lightingButtons.forEach(btn => {
        btn.classList.toggle("btn-save-eeprom-pulse", Boolean(this.unsavedDomains.lighting));
      });

      // 2. Update pulsating highlight on per-key profile save button
      const profileBtn = document.getElementById("btnSavePerKeyProfile");
      if (profileBtn) {
        profileBtn.classList.toggle("btn-save-eeprom-pulse", Boolean(this.unsavedDomains.profile));
      }

      // 3. Update pulsating highlight on hardware gradient save button
      const gradBtn = document.getElementById("btnSaveHardwareGradient");
      if (gradBtn) {
        gradBtn.classList.toggle("btn-save-eeprom-pulse", Boolean(this.unsavedDomains.gradient));
      }

      // 4. Update pulsating highlight on performance save button
      const perfBtn = document.getElementById("btnSavePerformanceEEPROM");
      if (perfBtn) {
        perfBtn.classList.toggle("btn-save-eeprom-pulse", Boolean(this.unsavedDomains.performance));
      }

      // 5. Update top bar unsaved changes indicator
      if (topBarBadge) {
        topBarBadge.style.display = this.hasUnsavedChanges ? "inline-flex" : "none";
      }
    }

    async saveAllToEEPROM() {
      const proto = window.gProtocol || window.gmmkProtocol;
      if (!proto || !proto.isConnected) {
        this.showToast(window.i18n ? window.i18n.t("toastConnectKeyboardFirst") : "Connect keyboard first", "warning");
        return;
      }
      try {
        const C = window.GMMK3_CONSTANTS || { CHANNELS: { CUSTOM: 1, RGB_MATRIX: 2 } };
        // 1. Save standard RGB matrix & custom config to EEPROM
        await proto.saveCustomConfig(C.CHANNELS.RGB_MATRIX);
        await proto.saveCustomConfig(C.CHANNELS.CUSTOM);

        // 2. Commit per-key profile to EEPROM if present
        if (window.gLightingController && window.gLightingController.activePerKeyProfile !== undefined) {
          const profIdx = window.gLightingController.activePerKeyProfile;
          const colors = window.gLightingController.state?.custom?.perKeyProfiles?.[profIdx];
          if (colors && colors.length > 0 && typeof proto.savePerKeyProfileToEEPROM === "function") {
            try {
              await proto.setFullPerKeyProfile(profIdx, colors);
              await proto.savePerKeyProfileToEEPROM(profIdx);
            } catch (perKeyErr) {
              console.warn("Could not commit per-key profile in saveAll:", perKeyErr);
            }
          }
        }

        // 3. Commit custom gradient stops if present
        if (window.gLightingController && (window.gLightingController.state?.custom?.activeGradient === 8 || window.gLightingController.state?.custom?.activeGradient === 9)) {
          const prof = (window.gLightingController.state.custom.activeGradient === 9) ? 1 : 0;
          const stops = window.gLightingController.hardwareGradientEditor ? window.gLightingController.hardwareGradientEditor.getStops() : (window.gLightingController.state.custom.customProfiles?.[prof] || []);
          try {
            await proto.setCustomValue(C.CHANNELS.CUSTOM, 34, prof, stops.length);
            for (let s = 0; s < stops.length && s < 8; s++) {
              await proto.setCustomValue(C.CHANNELS.CUSTOM, 35, prof, s, stops[s].pos, stops[s].r, stops[s].g, stops[s].b);
            }
            await proto.setCustomValue(C.CHANNELS.CUSTOM, 37, prof, 1);
          } catch (gradErr) {
            console.warn("Could not commit gradient stops in saveAll:", gradErr);
          }
        }

        this.setUnsavedChanges(false, "all");
        this.showToast(window.i18n ? window.i18n.t("toastSavedToEEPROM") : "Settings permanently saved to keyboard memory (EEPROM)!", "success");
      } catch (err) {
        this.showToast("Save error: " + err.message, "error");
      }
    }

    async discardAllUnsavedChanges() {
      const proto = window.gProtocol || window.gmmkProtocol;
      if (!proto || !proto.isConnected) {
        this.showToast(window.i18n ? window.i18n.t("toastConnectKeyboardFirst") : "Connect keyboard first", "warning");
        return;
      }
      try {
        this.showToast(window.i18n ? window.i18n.t("toastDiscardingChanges") : "Reverting to saved EEPROM settings...", "info");

        // 1. Tell keyboard firmware to reload its RAM variables from EEPROM
        if (typeof proto.reloadEEPROM === "function") {
          await proto.reloadEEPROM();
          await proto.sleep(60);
        }

        // 2. Reload lighting controller & keymap editor state from device EEPROM
        if (window.gLightingController) {
          await window.gLightingController.loadFromDevice();
        }
        if (window.gKeymapEditor) {
          await window.gKeymapEditor.loadKeymapFromDevice();
        }

        // 3. Clear unsaved dirty flags across all domains
        this.setUnsavedChanges(false, "all");
        this.showToast(window.i18n ? window.i18n.t("toastDiscardedSuccess") : "Settings restored from keyboard EEPROM!", "success");
      } catch (err) {
        this.showToast("Discard error: " + err.message, "error");
      }
    }

    updateDebounceFromDevice(ms) {
      if (typeof ms !== "number" || isNaN(ms)) return;
      const strVal = String(ms);
      localStorage.setItem("gmmk_debounce_ms", strVal);
      const debounceBadge = document.getElementById("currentDebounceBadge");
      if (debounceBadge) debounceBadge.textContent = strVal + " ms";
      const container = document.getElementById("debouncePillsContainer");
      if (container) {
        container.querySelectorAll(".debounce-pill").forEach((pill) => {
          if (pill.dataset.val === strVal) {
            pill.classList.add("active");
          } else {
            pill.classList.remove("active");
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
        const isMatch = view.id === `view-${viewId}` || view.id === `view-${viewId.replace(/_/g, "-")}`;
        view.classList.toggle("active", isMatch);
      });

      // Update Top Bar View Header Title
      const titles = {
        keymap: { t: "viewKeymapTitle", s: "viewKeymapSubtitle" },
        macro: { t: "viewMacroTitle", s: "viewMacroSubtitle" },
        lighting: { t: "viewLightingTitle", s: "viewLightingSubtitle" },
        studio_lighting: { t: "viewStudioLightingTitle", s: "viewStudioLightingSubtitle" },
        audio: { t: "viewStudioLightingTitle", s: "viewStudioLightingSubtitle" },
        encoder: { t: "viewEncoderTitle", s: "viewEncoderSubtitle" },
        tester: { t: "viewTesterTitle", s: "viewTesterSubtitle" },
        backup: { t: "viewBackupTitle", s: "viewBackupSubtitle" },
        settings: { t: "viewSettingsTitle", s: "viewSettingsSubtitle" }
      };

      const meta = titles[viewId] || titles.keymap;
      const h1 = document.getElementById("topBarViewTitle");
      const p = document.getElementById("topBarViewSubtitle");
      if (h1) {
        h1.dataset.i18n = meta.t;
        h1.textContent = window.i18n ? window.i18n.t(meta.t) : meta.t;
      }
      if (p) {
        p.dataset.i18n = meta.s;
        p.textContent = window.i18n ? window.i18n.t(meta.s) : meta.s;
      }

      // Stop Macro Keystroke recording if navigating away from macro editor
      if (window.gMacroManager && viewId !== "macro" && window.gMacroManager.isRecording) {
        window.gMacroManager.stopRecording();
      }

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
        if (viewId === "lighting" || viewId === "studio_lighting" || viewId === "audio") {
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

      // Enable/disable maintenance and macro action buttons
      const maintenanceButtons = [
        document.getElementById("btnJumpBootloader"),
        document.getElementById("btnResetEEPROM"),
        document.getElementById("btnQuickBackup"),
        document.getElementById("btnCreateBackup"),
        document.getElementById("btnRestoreBackup"),
        document.getElementById("btnRefreshDevice"),
        document.getElementById("btnSaveMacros"),
        document.getElementById("btnReloadMacros"),
        document.getElementById("btnResetAllMacros")
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

      const layoutPresetWrap = document.getElementById("layoutPresetWrap");
      const connectedDeviceBadgeWrap = document.getElementById("connectedDeviceBadgeWrap");
      const connectedDeviceBadgeName = document.getElementById("connectedDeviceBadgeName");

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

        // Hide offline demo dropdown and show active hardware status badge
        if (layoutPresetWrap) layoutPresetWrap.style.display = "none";
        if (connectedDeviceBadgeWrap) connectedDeviceBadgeWrap.style.display = "inline-flex";
        if (connectedDeviceBadgeName) connectedDeviceBadgeName.textContent = this.deviceName;
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

        // Show offline demo dropdown and hide hardware status badge
        if (layoutPresetWrap) layoutPresetWrap.style.display = "flex";
        if (connectedDeviceBadgeWrap) connectedDeviceBadgeWrap.style.display = "none";
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
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
      };

      const icon = icons[type] || icons.info;
      toast.innerHTML = `<span class="toast-icon-wrap" style="display:inline-flex; align-items:center; flex-shrink:0;">${icon}</span><span style="flex:1;">${message}</span>`;
      toast.className = `app-toast toast-${type} show`;
      toast.onclick = () => {
        toast.classList.remove("show");
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
      };

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
      }, 4500);
    }

    _bindSidebarNav() {
      document.querySelectorAll(".nav-item-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.switchView(btn.dataset.view);
        });
      });
    }

    _bindLangSelect() {
      const topSelect = document.getElementById("langSelect");
      const modalSelect = document.getElementById("appLanguageSelectModal");

      const handleLangChange = (lang) => {
        if (!window.i18n) return;
        window.i18n.setLang(lang);
        if (topSelect) topSelect.value = lang;
        if (modalSelect) modalSelect.value = lang;
        this.syncDeviceStatusUI();

        // Refresh autostart label if available
        const lblAppAutostartStatus = document.getElementById("lblAppAutostartStatus");
        const chkAppAutostartModal = document.getElementById("chkAppAutostartModal");
        if (lblAppAutostartStatus && chkAppAutostartModal) {
          if (window.electronAPI && window.electronAPI.isDesktop) {
            lblAppAutostartStatus.textContent = chkAppAutostartModal.checked
              ? window.i18n.t("lblAutostartStatusEnabled")
              : window.i18n.t("lblAutostartStatusDisabled");
          } else {
            lblAppAutostartStatus.textContent = window.i18n.t("lblAutostartNotAvailable");
          }
        }
      };

      if (topSelect) {
        topSelect.value = window.i18n ? window.i18n.currentLang : "en";
        topSelect.addEventListener("change", (e) => handleLangChange(e.target.value));
      }

      if (modalSelect) {
        modalSelect.value = window.i18n ? window.i18n.currentLang : "en";
        modalSelect.addEventListener("change", (e) => handleLangChange(e.target.value));
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
          const scale = Math.min(1, containerWidth / baseWidth);
          canvas.style.transform = `scale(${scale})`;
          canvas.style.transformOrigin = "top center";
          wrapper.style.height = `${Math.ceil(baseHeight * scale) + 24}px`;
        } else {
          canvas.style.transform = "none";
          wrapper.style.height = `${baseHeight + 16}px`;
        }
      });
    }
  }

  window.UIController = UIController;
})();
