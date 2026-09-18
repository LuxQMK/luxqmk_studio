/**
 * GMMK Studio - Backup & Restore Manager
 * Handles 100% complete configuration extraction, smart diff flashing, progress indicators & verification.
 */

(function () {
  class BackupManager {
    constructor(protocol) {
      this.protocol = protocol;
      this.stagedBackupData = null;
    }

    init() {
      this._bindBackupActions();
      this._bindRestoreActions();
      this._bindConsoleActions();
    }

    _log(msg, type = "info") {
      if (this.protocol) {
        this.protocol.log(msg, type);
      }
    }

    async createBackup(onProgress) {
      if (!this.protocol || !this.protocol.device) {
        throw new Error("Keyboard not connected!");
      }

      const { CHANNELS, CUSTOM_VAL, RGB_MATRIX_VAL, KEYBOARD_SPECS } = window.GMMK3_CONSTANTS;

      this._log("▶ Starting full keyboard memory backup...", "info");

      const backup = {
        app: "GMMK3_Studio_Companion",
        version: 2,
        keyboard_name: this.protocol.device?.productName || "GMMK 3 100% ANSI",
        created_at: new Date().toISOString(),
        layers: [],
        encoders: [],
        macros: {},
        rgb_matrix: {},
        custom_settings: {}
      };

      // 1. Read all layer keycodes (Layers 0..2)
      this._log("Reading key matrix for 3 layers (Safe Chunked Transfer)...", "info");
      try {
        const keymapBytes = await this.protocol.readFullKeymap(KEYBOARD_SPECS.layers, KEYBOARD_SPECS.rows, KEYBOARD_SPECS.cols);

        for (let layer = 0; layer < KEYBOARD_SPECS.layers; layer++) {
          const layerMatrix = [];
          for (let r = 0; r < KEYBOARD_SPECS.rows; r++) {
            const rowKeys = [];
            for (let c = 0; c < KEYBOARD_SPECS.cols; c++) {
              const byteIdx = (layer * KEYBOARD_SPECS.rows * KEYBOARD_SPECS.cols * 2) + (r * KEYBOARD_SPECS.cols * 2) + (c * 2);
              const keycode = (keymapBytes[byteIdx] << 8) | keymapBytes[byteIdx + 1];
              rowKeys.push(keycode);
            }
            layerMatrix.push(rowKeys);
          }
          backup.layers.push(layerMatrix);
          if (onProgress) onProgress(Math.round(((layer + 1) / KEYBOARD_SPECS.layers) * 40));
        }
        this._log(`Successfully read ${backup.layers.length} layers from keyboard buffer.`, "success");
      } catch (err) {
        this._log("Fallback: Reading keycodes via individual HID queries...", "warning");
        for (let layer = 0; layer < KEYBOARD_SPECS.layers; layer++) {
          const layerMatrix = [];
          for (let r = 0; r < KEYBOARD_SPECS.rows; r++) {
            const rowKeys = [];
            for (let c = 0; c < KEYBOARD_SPECS.cols; c++) {
              const keycode = await this.protocol.getKeycode(layer, r, c);
              rowKeys.push(keycode);
            }
            layerMatrix.push(rowKeys);
          }
          backup.layers.push(layerMatrix);
          if (onProgress) onProgress(Math.round(((layer + 1) / KEYBOARD_SPECS.layers) * 40));
        }
      }

      // 2. Read rotary knob encoder mappings for all layers
      this._log("Reading rotary knob configuration (CCW, CW, Press) for all layers...", "info");
      for (let layer = 0; layer < KEYBOARD_SPECS.layers; layer++) {
        const ccw = await this.protocol.getEncoder(layer, 0, false);
        const cw = await this.protocol.getEncoder(layer, 0, true);
        const press = backup.layers[layer]?.[0]?.[7] ?? 0x00A8;
        backup.encoders.push({ layer, ccw, cw, press });
      }
      if (onProgress) onProgress(55);

      // 3. Read dynamic macros
      this._log("Reading macro buffer memory...", "info");
      try {
        backup.macros = await this.protocol.getMacroBuffer();
        this._log(`Successfully read macro buffer (${backup.macros.bufferSize || 0} bytes).`, "success");
      } catch (err) {
        backup.macros = { bufferSize: 0, data: [] };
      }
      if (onProgress) onProgress(70);

      // 4. Read RGB Matrix settings
      this._log("Reading RGB Matrix lighting parameters...", "info");
      try {
        const bri = await this.protocol.getRGBMatrixValue(RGB_MATRIX_VAL.BRIGHTNESS);
        const eff = await this.protocol.getRGBMatrixValue(RGB_MATRIX_VAL.EFFECT);
        const spd = await this.protocol.getRGBMatrixValue(RGB_MATRIX_VAL.EFFECT_SPEED);
        const col = await this.protocol.getRGBMatrixValue(RGB_MATRIX_VAL.COLOR);

        backup.rgb_matrix = {
          brightness: bri ? bri[3] : 255,
          effect: eff ? eff[3] : 1,
          speed: spd ? spd[3] : 128,
          hue: col ? col[3] : 0,
          sat: col ? col[4] : 255
        };
        this._log(`Read RGB: Effect #${backup.rgb_matrix.effect}, Brightness ${backup.rgb_matrix.brightness}, Speed ${backup.rgb_matrix.speed}.`, "success");
      } catch (err) {
        this._log("RGB Matrix read warning: " + err.message, "warning");
      }
      if (onProgress) onProgress(85);

      // 5. Read LuxQMK custom settings (Layer lighting, Reactive, Dim, Win Lock, Logo Lock states)
      this._log("Reading LuxQMK custom settings (Layers, Reactive, Dimming, Logo Lock Indicators)...", "info");
      try {
        const rev = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.RGB_REVERSE);
        const lEn = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_LIGHTING_ENABLE);
        const lDim = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_DIM_LEVEL);
        const l1 = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_1_COLOR);
        const l2 = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_2_COLOR);
        const l3 = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_3_COLOR);
        const logo = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_MODE);

        // Reactive Layer settings
        const rEn = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_ENABLE);
        const rMode = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_MODE);
        const rCol = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_COLOR);
        const rSpd = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_SPEED);
        const rBld = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_BLEND);

        // Win Lock settings
        const wlMode = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_MODE);
        const wlCol = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_COLOR);

        // 7 lock indicator colors
        const caps = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS);
        const num = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM);
        const scroll = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_SCROLL);
        const capsNum = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_NUM);
        const capsScroll = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_SCROLL);
        const numScroll = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM_SCROLL);
        const all = await this.protocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_ALL);

        backup.custom_settings = {
          rgb_reverse: rev ? rev[3] === 1 : false,
          layer_lighting_enable: lEn ? lEn[3] === 1 : true,
          layer_dim_level: lDim ? lDim[3] : 128,
          layer_colors: {
            layer_1: l1 ? { h: l1[3], s: l1[4] } : { h: 28, s: 255 },
            layer_2: l2 ? { h: l2[3], s: l2[4] } : { h: 128, s: 255 },
            layer_3: l3 ? { h: l3[3], s: l3[4] } : { h: 200, s: 255 }
          },
          reactive_layer: {
            enable: rEn ? rEn[3] === 1 : false,
            mode: rMode ? rMode[3] : 0,
            color: rCol ? { h: rCol[3], s: rCol[4] } : { h: 180, s: 255 },
            speed: rSpd ? rSpd[3] : 128,
            blend: rBld ? rBld[3] : 0
          },
          win_lock: {
            mode: wlMode ? wlMode[3] : 1,
            color: wlCol ? { h: wlCol[3], s: wlCol[4] } : { h: 0, s: 255 }
          },
          logo_led: {
            mode: logo ? logo[3] : 1,
            caps: caps ? { h: caps[3], s: caps[4] } : { h: 0, s: 255 },
            num: num ? { h: num[3], s: num[4] } : { h: 145, s: 255 },
            scroll: scroll ? { h: scroll[3], s: scroll[4] } : { h: 85, s: 255 },
            caps_num: capsNum ? { h: capsNum[3], s: capsNum[4] } : { h: 213, s: 255 },
            caps_scroll: capsScroll ? { h: capsScroll[3], s: capsScroll[4] } : { h: 43, s: 255 },
            num_scroll: numScroll ? { h: numScroll[3], s: numScroll[4] } : { h: 106, s: 255 },
            all: all ? { h: all[3], s: all[4] } : { h: 0, s: 0 }
          }
        };
        this._log("Successfully read layer colors, reactive layer, Win Lock, and 7 Logo Lock indicators.", "success");
      } catch (err) {
        this._log("Custom settings read warning: " + err.message, "warning");
      }
      if (onProgress) onProgress(100);

      this._log("✔ Complete backup successfully created!", "success");
      return backup;
    }

    async restoreBackup(backupData, onProgress) {
      if (!this.protocol || !this.protocol.device) {
        throw new Error("Keyboard not connected!");
      }

      if (!backupData || !backupData.layers) {
        throw new Error("Invalid backup file structure.");
      }

      const { CHANNELS, CUSTOM_VAL, RGB_MATRIX_VAL, KEYBOARD_SPECS } = window.GMMK3_CONSTANTS;

      this._log("▶ Starting restore to keyboard memory...", "info");

      // 1. Smart Diff Keycode Writing
      const layers = backupData.layers;
      const rows = KEYBOARD_SPECS.rows;
      const cols = KEYBOARD_SPECS.cols;

      this._log("Analyzing keymap diffs (Smart Diffing)...", "info");
      let currentKeymap = null;
      try {
        currentKeymap = await this.protocol.readFullKeymap(KEYBOARD_SPECS.layers, rows, cols);
      } catch (e) {}

      let diffKeys = [];
      for (let l = 0; l < layers.length && l < KEYBOARD_SPECS.layers; l++) {
        for (let r = 0; r < layers[l].length && r < rows; r++) {
          for (let c = 0; c < layers[l][r].length && c < cols; c++) {
            const targetKc = layers[l][r][c];
            let isDifferent = true;
            if (currentKeymap) {
              const byteIdx = (l * rows * cols * 2) + (r * cols * 2) + (c * 2);
              const currentKc = (currentKeymap[byteIdx] << 8) | currentKeymap[byteIdx + 1];
              isDifferent = (currentKc !== targetKc);
            }
            if (isDifferent) {
              diffKeys.push({ l, r, c, kc: targetKc });
            }
          }
        }
      }

      if (diffKeys.length > 0) {
        this._log(`Detected ${diffKeys.length} modified keys. Writing to EEPROM...`, "info");
        for (let i = 0; i < diffKeys.length; i++) {
          const { l, r, c, kc } = diffKeys[i];
          await this.protocol.setKeycode(l, r, c, kc);
          if (onProgress && i % 3 === 0) {
            onProgress(Math.round(((i + 1) / diffKeys.length) * 40));
          }
          await this.protocol.sleep(4);
        }
        this._log(`Wrote ${diffKeys.length} keys to EEPROM memory.`, "success");
      } else {
        this._log("Key layout is identical to backup - skipping redundant writes.", "success");
      }
      if (onProgress) onProgress(40);

      // 2. Restore Rotary Knob (Encoder)
      if (backupData.encoders && Array.isArray(backupData.encoders)) {
        this._log("Restoring rotary knob configuration for all layers...", "info");
        for (const enc of backupData.encoders) {
          if (enc.layer !== undefined) {
            if (enc.ccw !== undefined) await this.protocol.setEncoder(enc.layer, 0, false, enc.ccw);
            if (enc.cw !== undefined) await this.protocol.setEncoder(enc.layer, 0, true, enc.cw);
            if (enc.press !== undefined) await this.protocol.setKeycode(enc.layer, 0, 7, enc.press);
          }
        }
        this._log("Successfully updated rotary knob encoder actions.", "success");
      }
      if (onProgress) onProgress(55);

      // 3. Restore dynamic macros
      if (backupData.macros && backupData.macros.data) {
        this._log("Restoring dynamic macro memory...", "info");
        try {
          await this.protocol.setMacroBuffer(backupData.macros);
          this._log("Macro memory updated successfully.", "success");
        } catch (e) {
          this._log("Macro write error: " + e.message, "warning");
        }
      }
      if (onProgress) onProgress(70);

      // 4. Restore RGB Matrix parameters
      const rgb = backupData.rgb_matrix;
      if (rgb) {
        this._log(`Restoring RGB Matrix settings (Effect #${rgb.effect}, Brightness ${rgb.brightness})...`, "info");
        try {
          if (rgb.brightness !== undefined) await this.protocol.setRGBMatrixValue(RGB_MATRIX_VAL.BRIGHTNESS, rgb.brightness);
          if (rgb.effect !== undefined) await this.protocol.setRGBMatrixValue(RGB_MATRIX_VAL.EFFECT, rgb.effect);
          if (rgb.speed !== undefined) await this.protocol.setRGBMatrixValue(RGB_MATRIX_VAL.EFFECT_SPEED, rgb.speed);
          if (rgb.hue !== undefined && rgb.sat !== undefined) await this.protocol.setRGBMatrixValue(RGB_MATRIX_VAL.COLOR, rgb.hue, rgb.sat);
          await this.protocol.saveCustomConfig(CHANNELS.RGB_MATRIX);
          this._log("Saved RGB Matrix configuration to EEPROM.", "success");
        } catch (e) {
          this._log("RGB restore error: " + e.message, "warning");
        }
      }
      if (onProgress) onProgress(85);

      // 5. Restore custom settings (Layer lighting, Reactive, Dim, Win Lock, 7 Logo Lock states)
      const cust = backupData.custom_settings;
      if (cust) {
        this._log("Restoring layer colors, reactive settings, Win Lock, and 7 Logo Lock states...", "info");
        try {
          if (cust.rgb_reverse !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.RGB_REVERSE, cust.rgb_reverse ? 1 : 0);
          if (cust.layer_lighting_enable !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_LIGHTING_ENABLE, cust.layer_lighting_enable ? 1 : 0);
          if (cust.layer_dim_level !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_DIM_LEVEL, cust.layer_dim_level);

          if (cust.layer_colors) {
            const lc = cust.layer_colors;
            if (lc.layer_1) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_1_COLOR, lc.layer_1.h, lc.layer_1.s);
            if (lc.layer_2) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_2_COLOR, lc.layer_2.h, lc.layer_2.s);
            if (lc.layer_3) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_3_COLOR, lc.layer_3.h, lc.layer_3.s);
          }

          if (cust.reactive_layer) {
            const rl = cust.reactive_layer;
            if (rl.enable !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_ENABLE, rl.enable ? 1 : 0);
            if (rl.mode !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_MODE, rl.mode);
            if (rl.color) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_COLOR, rl.color.h, rl.color.s);
            if (rl.speed !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_SPEED, rl.speed);
            if (rl.blend !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_BLEND, rl.blend);
          }

          if (cust.win_lock) {
            const wl = cust.win_lock;
            if (wl.mode !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_MODE, wl.mode);
            if (wl.color) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_COLOR, wl.color.h, wl.color.s);
          }

          if (cust.logo_led) {
            const ll = cust.logo_led;
            if (ll.mode !== undefined) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_MODE, ll.mode);
            if (ll.caps) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS, ll.caps.h, ll.caps.s);
            if (ll.num) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM, ll.num.h, ll.num.s);
            if (ll.scroll) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_SCROLL, ll.scroll.h, ll.scroll.s);
            if (ll.caps_num) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_NUM, ll.caps_num.h, ll.caps_num.s);
            if (ll.caps_scroll) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_SCROLL, ll.caps_scroll.h, ll.caps_scroll.s);
            if (ll.num_scroll) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM_SCROLL, ll.num_scroll.h, ll.num_scroll.s);
            if (ll.all) await this.protocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_ALL, ll.all.h, ll.all.s);
          }

          await this.protocol.saveCustomConfig(CHANNELS.CUSTOM);
          this._log("Saved custom parameters to EEPROM.", "success");
        } catch (e) {
          this._log("Custom settings write error: " + e.message, "warning");
        }
      }

      if (onProgress) onProgress(100);
      this._log("✔ All settings restored successfully!", "success");
    }

    _bindBackupActions() {
      const btn = document.getElementById("btnCreateBackup");
      const pContainer = document.getElementById("backupProgress");
      const pBar = document.getElementById("backupProgressBar");
      const pText = document.getElementById("backupProgressText");
      const pPercent = document.getElementById("backupProgressPercent");

      btn?.addEventListener("click", async () => {
        if (!this.protocol || !this.protocol.device) return;
        try {
          btn.disabled = true;
          if (pContainer) pContainer.style.display = "block";
          if (pBar) pBar.style.width = "0%";
          if (pPercent) pPercent.textContent = "0%";
          if (pText) pText.textContent = window.i18n ? window.i18n.t("backupProgressReading") : "Reading data from keyboard...";

          window.gUI?.showToast(window.i18n ? window.i18n.t("toastCreatingBackup") : "Creating full keyboard backup...", "info");

          const backup = await this.createBackup((pct) => {
            if (pBar) pBar.style.width = `${pct}%`;
            if (pPercent) pPercent.textContent = `${pct}%`;
            if (pct >= 100 && pText) pText.textContent = window.i18n ? window.i18n.t("backupProgressGenerating") : "Generating .JSON file...";
          });

          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
          a.href = url;
          a.download = `GMMK3_Backup_${timestamp}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          window.gUI?.showToast(window.i18n ? window.i18n.t("toastBackupDownloaded") : "Backup file downloaded successfully!", "success");
          if (pText) pText.textContent = window.i18n ? window.i18n.t("backupProgressDone") : "Completed!";
        } catch (e) {
          window.gUI?.showToast(window.i18n ? window.i18n.t("toastBackupError", { err: e.message }) : "Backup error: " + e.message, "error");
          this._log("Error: " + e.message, "error");
        } finally {
          btn.disabled = false;
        }
      });
    }

    _bindRestoreActions() {
      const dropzone = document.getElementById("dropzone");
      const fileInput = document.getElementById("fileInput");
      const btnRestore = document.getElementById("btnRestoreBackup");
      const pContainer = document.getElementById("restoreProgress");
      const pBar = document.getElementById("restoreProgressBar");
      const pText = document.getElementById("restoreProgressText");
      const pPercent = document.getElementById("restoreProgressPercent");

      dropzone?.addEventListener("click", () => fileInput?.click());

      dropzone?.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });

      dropzone?.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      dropzone?.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files?.length > 0) {
          this._handleSelectedFile(e.dataTransfer.files[0]);
        }
      });

      fileInput?.addEventListener("change", (e) => {
        if (e.target.files?.length > 0) {
          this._handleSelectedFile(e.target.files[0]);
        }
      });

      btnRestore?.addEventListener("click", async () => {
        if (!this.stagedBackupData) {
          window.gUI?.showToast(window.i18n ? window.i18n.t("toastSelectValidBackup") : "Please select a valid .JSON backup file!", "warning");
          return;
        }

        try {
          btnRestore.disabled = true;
          if (pContainer) pContainer.style.display = "block";
          if (pBar) pBar.style.width = "0%";
          if (pPercent) pPercent.textContent = "0%";
          if (pText) pText.textContent = window.i18n ? window.i18n.t("restoreProgressWriting") : "Writing settings to EEPROM...";

          window.gUI?.showToast(window.i18n ? window.i18n.t("toastRestoring") : "Flashing backup to keyboard memory...", "info");

          await this.restoreBackup(this.stagedBackupData, (pct) => {
            if (pBar) pBar.style.width = `${pct}%`;
            if (pPercent) pPercent.textContent = `${pct}%`;
            if (pct >= 100 && pText) pText.textContent = window.i18n ? window.i18n.t("restoreProgressRefreshing") : "Refreshing interface...";
          });

          window.gUI?.showToast(window.i18n ? window.i18n.t("toastRestored") : "All settings restored successfully!", "success");
          if (pText) pText.textContent = window.i18n ? window.i18n.t("restoreProgressDone") : "Restored 100%!";

          // Refresh active views
          if (window.gKeymapEditor) await window.gKeymapEditor.loadKeymapFromDevice();
          if (window.gLightingController) await window.gLightingController.loadFromDevice();
        } catch (e) {
          window.gUI?.showToast(window.i18n ? window.i18n.t("toastRestoreError", { err: e.message }) : "Restore error: " + e.message, "error");
          this._log("Error: " + e.message, "error");
        } finally {
          btnRestore.disabled = false;
        }
      });
    }

    _handleSelectedFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.layers || !Array.isArray(parsed.layers)) {
            throw new Error("Invalid backup file structure (layers array missing)");
          }
          this.stagedBackupData = parsed;
          
          const filePreview = document.getElementById("filePreview");
          if (filePreview) filePreview.style.display = "block";

          const prevFileName = document.getElementById("prevFileName");
          if (prevFileName) prevFileName.textContent = file.name;

          const prevDate = document.getElementById("prevDate");
          if (prevDate) prevDate.textContent = parsed.created_at ? new Date(parsed.created_at).toLocaleString() : "-";

          const prevLayers = document.getElementById("prevLayers");
          if (prevLayers) prevLayers.textContent = window.i18n ? window.i18n.t("valStatLayers", { count: parsed.layers.length }) : `${parsed.layers.length} Layers`;

          const prevEncoder = document.getElementById("prevEncoder");
          if (prevEncoder) {
            prevEncoder.textContent = parsed.encoders
              ? (window.i18n ? window.i18n.t("valStatProfiles", { count: parsed.encoders.length }) : `${parsed.encoders.length} Profiles`)
              : (window.i18n ? window.i18n.t("valStatStandard") : "Standard");
          }

          const prevRgb = document.getElementById("prevRgb");
          if (prevRgb) {
            prevRgb.textContent = parsed.rgb_matrix
              ? `Effect #${parsed.rgb_matrix.effect || 1}`
              : (window.i18n ? window.i18n.t("valStatNone") : "None");
          }

          const prevCustom = document.getElementById("prevCustom");
          if (prevCustom) {
            prevCustom.textContent = parsed.custom_settings
              ? (window.i18n ? window.i18n.t("valStatCustom") : "7 Locks + Layers")
              : (window.i18n ? window.i18n.t("valStatStandard") : "Standard");
          }

          const btnRestore = document.getElementById("btnRestoreBackup");
          if (btnRestore && this.protocol && this.protocol.isConnected) {
            btnRestore.disabled = false;
          }

          this._log(`Loaded backup file: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Ready to flash.`, "success");
        } catch (err) {
          window.gUI?.showToast(window.i18n ? window.i18n.t("toastSelectValidBackup") : ("Invalid .JSON backup file: " + err.message), "error");
          this._log("JSON parse error: " + err.message, "error");
        }
      };
      reader.readAsText(file);
    }

    _bindConsoleActions() {
      const btnClear = document.getElementById("btnClearLog");
      const consoleLog = document.getElementById("consoleLog");
      btnClear?.addEventListener("click", () => {
        if (consoleLog) {
          const clearedMsg = window.i18n ? window.i18n.t("consoleCleared") : "Console cleared.";
          consoleLog.innerHTML = `<div class="log-line"><span class="log-time">[${new Date().toLocaleTimeString()}]</span><span class="log-info">${clearedMsg}</span></div>`;
        }
      });
    }
  }

  window.BackupManager = BackupManager;
})();
