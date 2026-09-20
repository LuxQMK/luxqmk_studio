/**
 * GMMK Studio - Visual Keymap & Rotary Encoder Editor Engine
 */

(function () {
  class KeymapEditor {
    constructor(protocol) {
      this.protocol = protocol;
      this.activeLayer = 0;
      this.selectedKey = null; // { type: 'matrix'|'encoder', id, row, col, direction }
      this.selectedCategory = 'basic';
      this.layerData = {
        0: new Map(),
        1: new Map(),
        2: new Map()
      };
      this.encoderData = {
        0: { CCW: 0x00AA, CW: 0x00A9, Press: 0x00A8 },
        1: { CCW: 0x00AA, CW: 0x00A9, Press: 0x0001 },
        2: { CCW: 0x0001, CW: 0x0001, Press: 0x0001 }
      };
      this.isLoaded = false;
      this.onKeycodeChange = null;
    }

    getActiveLayout() {
      const profile = window.deviceManager ? window.deviceManager.getActiveProfile() : null;
      if (window.LayoutEngine && typeof window.LayoutEngine.getLayoutForProfile === 'function') {
        return window.LayoutEngine.getLayoutForProfile(profile);
      }
      return window.GMMK3_LAYOUT || [];
    }

    init() {
      // Pre-populate layer 0 with default keycodes and layer 1 with QMK default FL keycodes
      const defaultFLMap = {
        F1: 0x00A5, F2: 0x00A6, F3: 0x00A7, F4: 0x00A8, F5: 0x00A9, F6: 0x00AA,
        F7: 0x00AB, F8: 0x00AC, F9: 0x00AD, F10: 0x00AE, F11: 0x00AF, F12: 0x0046,
        O: 0x7E40, Z: 0x7C04, X: 0x7C05, C: 0x7C06, V: 0x7C07, LWIN: 0x7B00,
        UP: 0x7C03, DOWN: 0x7C02, LEFT: 0x7C00, RGHT: 0x7C01
      };

      const layout = this.getActiveLayout();
      if (layout) {
        layout.forEach(k => {
          const [r, c] = k.matrix;
          if (r >= 0 && c >= 0) {
            this.layerData[0].set(`${r},${c}`, k.defaultKeycode || 0x0000);
            this.layerData[1].set(`${r},${c}`, defaultFLMap[k.id] || 0x0001 /* KC_TRNS */);
            this.layerData[2].set(`${r},${c}`, 0x0001 /* KC_TRNS */);
          }
        });
      }

      this._bindCategoryButtons();
      this._bindLayerButtons();
      this.renderKeycodePicker();
      this.renderKeyboard();
      this.renderEncoderPanel();
    }

    async loadKeymapFromDevice() {
      if (!this.protocol || !this.protocol.device) return;

      try {
        const rows = 14;
        const cols = 8;
        const layers = 3;
        
        // Load keymap buffer safely via chunked transfer
        const buffer = await this.protocol.readFullKeymap(layers, rows, cols);
        
        for (let l = 0; l < layers; l++) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const byteIdx = (l * rows * cols * 2) + (r * cols * 2) + (c * 2);
              const kc = (buffer[byteIdx] << 8) | buffer[byteIdx + 1];
              this.layerData[l].set(`${r},${c}`, kc);
            }
          }
        }

        // Load encoder mappings
        for (let l = 0; l < layers; l++) {
          try {
            const ccw = await this.protocol.getEncoder(l, 0, false);
            const cw = await this.protocol.getEncoder(l, 0, true);
            const press = this.layerData[l].get("11,6") || 0x00A8;
            this.encoderData[l] = { CCW: ccw, CW: cw, Press: press };
          } catch (e) {
            console.warn(`Could not load encoder layer ${l}`, e);
          }
        }

        this.isLoaded = true;
        this.renderKeyboard();
        this.renderEncoderPanel();
      } catch (e) {
        console.error("Error loading keymap from device:", e);
      }
    }

    setLayer(layerIndex) {
      this.activeLayer = parseInt(layerIndex, 10);
      document.querySelectorAll(".layer-btn").forEach(btn => {
        btn.classList.toggle("active", parseInt(btn.dataset.layer, 10) === this.activeLayer);
      });
      this.renderKeyboard();
      this.renderEncoderPanel();
    }

    selectKey(keyDesc) {
      this.selectedKey = keyDesc;
      document.querySelectorAll(".keycap-btn, .knob-slot-btn").forEach(el => {
        el.classList.remove("selected");
      });

      if (keyDesc) {
        const el = document.getElementById(`key-${keyDesc.id}`);
        if (el) el.classList.add("selected");
        this._updateSelectedKeyInfo();
      }
    }

    async assignKeycode(keycode) {
      if (!this.selectedKey) return;

      const layer = this.activeLayer;

      if (this.selectedKey.type === "encoder") {
        const dir = this.selectedKey.direction;
        if (dir === "Press") {
          this.layerData[layer].set("11,6", keycode);
          if (this.protocol && this.protocol.device) {
            await this.protocol.setKeycode(layer, 11, 6, keycode);
          }
          this.encoderData[layer].Press = keycode;
        } else {
          const isClockwise = dir === "CW";
          this.encoderData[layer][dir] = keycode;
          if (this.protocol && this.protocol.device) {
            await this.protocol.setEncoder(layer, 0, isClockwise, keycode);
          }
        }
        this.renderEncoderPanel();
        this.renderKeyboard();
      } else {
        const [r, c] = this.selectedKey.matrix;
        this.layerData[layer].set(`${r},${c}`, keycode);

        if (this.protocol && this.protocol.device) {
          await this.protocol.setKeycode(layer, r, c, keycode);
        }
        this.renderKeyboard();
      }

      this._updateSelectedKeyInfo();
      if (this.onKeycodeChange) {
        this.onKeycodeChange(this.selectedKey, keycode);
      }
    }

    _promptAnyKeycode() {
      if (!this.selectedKey) {
        const msg = window.i18n ? window.i18n.t("selectedKeyDefault") || "Click any keycap on the keyboard to select it first" : "Click any keycap on the keyboard to select it first";
        alert(msg);
        return;
      }

      const input = prompt(
        "Enter custom keycode in Hex (e.g. 0x5DB0 or 5DB0) or Decimal (0 - 65535):",
        "0x"
      );
      if (!input || !input.trim()) return;

      const trimmed = input.trim();
      let code = null;
      if (trimmed.toLowerCase().startsWith("0x")) {
        code = parseInt(trimmed, 16);
      } else if (!isNaN(Number(trimmed))) {
        code = parseInt(trimmed, 10);
      } else {
        const hexVal = parseInt(trimmed, 16);
        if (!isNaN(hexVal)) code = hexVal;
      }

      if (code !== null && !isNaN(code) && code >= 0 && code <= 0xFFFF) {
        this.assignKeycode(code);
      } else {
        alert("Invalid keycode! Please enter a valid 16-bit keycode (0x0000 - 0xFFFF).");
      }
    }

    renderKeyboard() {
      const container = document.getElementById("keyboardCanvas");
      if (!container) return;

      container.innerHTML = "";

      const profile = window.deviceManager ? window.deviceManager.getActiveProfile() : null;
      const layout = this.getActiveLayout();
      const bounds = window.LayoutEngine ? window.LayoutEngine.getLayoutBounds(layout) : { width: 22.5, height: 6.25 };

      // Dynamically size the canvas container for auto-scaling
      container.style.setProperty("--keyboard-width-units", bounds.width);
      container.style.setProperty("--keyboard-height-units", bounds.height);
      container.style.width = `calc(${bounds.width} * var(--key-unit) + 36px)`;
      container.style.height = `calc(${bounds.height} * var(--key-unit) + 36px)`;

      // Toggle side diffusers visibility on chassis based on device profile capabilities
      const hasSidelights = !!(profile && profile.capabilities && profile.capabilities.hasSidelights);
      container.classList.toggle("has-sidelights", hasSidelights);

      layout.forEach(key => {
        const keyEl = document.createElement("div");
        keyEl.className = `keycap-btn key-group-${key.group}`;
        keyEl.id = `key-${key.id}`;
        
        // CSS position and dimensions with chassis bezel padding
        keyEl.style.left = `calc(${key.x} * var(--key-unit) + 18px)`;
        keyEl.style.top = `calc(${key.y} * var(--key-unit) + 18px)`;
        keyEl.style.width = `calc(${key.w} * var(--key-unit) - 4px)`;
        keyEl.style.height = `calc(${key.h} * var(--key-unit) - 4px)`;

        // Keycode lookup with robust default fallback
        const [r, c] = key.matrix;
        let currentCode = this.layerData[this.activeLayer]?.get(`${r},${c}`);
        if (currentCode === undefined || currentCode === null) {
          currentCode = (this.activeLayer === 0) ? (key.defaultKeycode || 0x0000) : 0x0001;
        }
        const kcMeta = window.getKeycodeInfo ? window.getKeycodeInfo(currentCode) : { label: key.label, name: "" };

        const primaryLabel = kcMeta.label || key.label;
        const isSelected = this.selectedKey && this.selectedKey.id === key.id;
        if (isSelected) keyEl.classList.add("selected");

        if (key.isLogo) {
          keyEl.classList.add("keycap-logo-badge");
          keyEl.innerHTML = "";
          keyEl.style.cursor = "default";
        } else if (key.isKnob) {
          keyEl.classList.add("keycap-knob");
          keyEl.innerHTML = `<div class="knob-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="3" x2="12" y2="7"></line></svg></div>`;
        } else {
          keyEl.innerHTML = `
            <div class="key-secondary">${key.label}</div>
            <div class="key-primary">${primaryLabel}</div>
          `;
        }

        keyEl.addEventListener("click", () => {
          if (key.isLogo) return;
          if (key.isKnob) {
            if (window.gUI) {
              window.gUI.switchView("encoder");
            }
            this.selectKey({
              type: "encoder",
              id: "ENCODER_PRESS",
              matrix: (key.matrix && key.matrix[0] >= 0) ? key.matrix : [11, 6],
              direction: "Press",
              defaultLabel: "Knob Press"
            });
            return;
          }
          this.selectKey({
            type: "matrix",
            id: key.id,
            matrix: key.matrix,
            direction: null,
            defaultLabel: key.label
          });
        });

        container.appendChild(keyEl);
      });

      window.gUI?.fitKeyboardPreviews();
    }

    renderEncoderPanel() {
      const panel = document.getElementById("encoderConfigWidget");
      if (!panel) return;

      const enc = this.encoderData[this.activeLayer] || { CCW: 0x00AA, CW: 0x00A9, Press: 0x00A8 };
      const ccwInfo = window.getKeycodeInfo(enc.CCW);
      const cwInfo = window.getKeycodeInfo(enc.CW);
      const pressInfo = window.getKeycodeInfo(enc.Press);

      const ccwLabel = window.i18n ? window.i18n.t("rotCCW") : "Rotate Left (CCW)";
      const pressLabel = window.i18n ? window.i18n.t("knobPress") : "Knob Press (Click)";
      const cwLabel = window.i18n ? window.i18n.t("rotCW") : "Rotate Right (CW)";

      panel.innerHTML = `
        <div class="encoder-slots-grid">
          <div class="knob-slot-btn ${this.selectedKey?.direction === 'CCW' ? 'selected' : ''}" id="key-ENCODER_CCW" data-dir="CCW">
            <span class="slot-dir">${ccwLabel}</span>
            <span class="slot-code">${ccwInfo.label}</span>
          </div>
          <div class="knob-slot-btn ${this.selectedKey?.direction === 'Press' ? 'selected' : ''}" id="key-ENCODER_PRESS" data-dir="Press">
            <span class="slot-dir">${pressLabel}</span>
            <span class="slot-code">${pressInfo.label}</span>
          </div>
          <div class="knob-slot-btn ${this.selectedKey?.direction === 'CW' ? 'selected' : ''}" id="key-ENCODER_CW" data-dir="CW">
            <span class="slot-dir">${cwLabel}</span>
            <span class="slot-code">${cwInfo.label}</span>
          </div>
        </div>
      `;

      panel.querySelectorAll(".knob-slot-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const dir = btn.dataset.dir;
          this.selectKey({
            type: "encoder",
            id: `ENCODER_${dir === 'Press' ? 'PRESS' : dir}`,
            matrix: [11, 6],
            direction: dir,
            defaultLabel: `Knob ${dir}`
          });
        });
      });
    }

    renderKeycodePicker() {
      const pickers = document.querySelectorAll("#keycodePickerPalette, #encoderKeycodePickerPalette");
      if (!pickers || pickers.length === 0) return;

      const lightingType = window.deviceManager ? window.deviceManager.getLightingType() : 'rgb_matrix';
      let filtered = window.KEYCODES_DB.filter(k => k.category === this.selectedCategory);

      if (this.selectedCategory === 'lighting') {
        if (lightingType === 'monochrome') {
          filtered = filtered.filter(k => !k.lightingType || k.lightingType === 'monochrome');
        } else if (lightingType === 'rgb_matrix') {
          filtered = filtered.filter(k => !k.lightingType || k.lightingType === 'rgb_matrix' || k.lightingType === 'monochrome');
        } else if (lightingType === 'none') {
          filtered = [];
        }
      }

      pickers.forEach(picker => {
        picker.innerHTML = "";
        filtered.forEach(kc => {
          const btn = document.createElement("button");
          btn.className = "palette-key-btn";
          if (kc.isAny) btn.classList.add("pal-any-btn");
          btn.title = `${kc.name} (${kc.title || kc.label})`;
          btn.innerHTML = `
            <span class="pal-label">${kc.label}</span>
            <span class="pal-name">${kc.name}</span>
          `;

          btn.addEventListener("click", () => {
            if (kc.isAny) {
              this._promptAnyKeycode();
              return;
            }
            this.assignKeycode(kc.code);
          });

          picker.appendChild(btn);
        });
      });
    }

    _bindCategoryButtons() {
      document.querySelectorAll(".cat-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const cat = btn.dataset.category;
          this.selectedCategory = cat;
          document.querySelectorAll(".cat-tab-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.category === cat);
          });
          this.renderKeycodePicker();
        });
      });
    }

    _bindLayerButtons() {
      document.querySelectorAll(".layer-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setLayer(btn.dataset.layer);
        });
      });
      if (window.i18n && typeof window.i18n.onChange === "function") {
        window.i18n.onChange(() => {
          this.renderEncoderPanel();
          this._updateSelectedKeyInfo();
        });
      }
    }

    _updateSelectedKeyInfo() {
      const banner = document.getElementById("selectedKeyBanner");
      if (!banner) return;

      if (!this.selectedKey) {
        const defText = window.i18n ? window.i18n.t("selectedKeyDefault") : "Click any keycap on the keyboard to remap it";
        banner.innerHTML = `<span class="muted-text">${defText}</span>`;
        return;
      }

      let currentCode = 0;
      if (this.selectedKey.type === "encoder") {
        currentCode = this.encoderData[this.activeLayer][this.selectedKey.direction];
      } else {
        const [r, c] = this.selectedKey.matrix;
        currentCode = this.layerData[this.activeLayer]?.get(`${r},${c}`) || 0;
      }

      const meta = window.getKeycodeInfo(currentCode);
      const lyrLabel = window.i18n ? window.i18n.t("layerLabel") : "Layer";
      const asgnLabel = window.i18n ? window.i18n.t("assignedLabel") : "Assigned:";

      banner.innerHTML = `
        <div class="selected-badge">
          <span class="badge-target">${lyrLabel} ${this.activeLayer} › ${this.selectedKey.defaultLabel || this.selectedKey.id}</span>
          <span class="badge-code">${asgnLabel} <strong>${meta.label}</strong> [${meta.name}]</span>
        </div>
      `;
    }
  }

  window.KeymapEditor = KeymapEditor;
})();
