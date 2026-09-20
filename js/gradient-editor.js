/**
 * LuxQMK Studio - Visual Multi-Stop Gradient Ramp Editor
 * PowerPoint / Figma / CSS Gradient Style Interactive Component
 */
(function () {
  const PRESET_GRADIENTS = {
    rainbow: {
      name: "Rainbow (Classic Spectrum)",
      stops: [
        { pos: 0, r: 255, g: 0, b: 0 },
        { pos: 36, r: 255, g: 165, b: 0 },
        { pos: 73, r: 255, g: 255, b: 0 },
        { pos: 109, r: 0, g: 255, b: 0 },
        { pos: 146, r: 0, g: 255, b: 255 },
        { pos: 182, r: 0, g: 0, b: 255 },
        { pos: 219, r: 238, g: 130, b: 238 }
      ]
    },
    cyberpunk: {
      name: "Cyberpunk",
      stops: [
        { pos: 0, r: 0, g: 255, b: 255 },
        { pos: 85, r: 255, g: 0, b: 128 },
        { pos: 170, r: 255, g: 255, b: 0 }
      ]
    },
    synthwave: {
      name: "Synthwave",
      stops: [
        { pos: 0, r: 75, g: 0, b: 130 },
        { pos: 64, r: 255, g: 0, b: 128 },
        { pos: 128, r: 255, g: 100, b: 0 },
        { pos: 192, r: 255, g: 215, b: 0 }
      ]
    },
    sunset: {
      name: "Sunset Horizon",
      stops: [
        { pos: 0, r: 45, g: 10, b: 85 },
        { pos: 85, r: 235, g: 45, b: 55 },
        { pos: 170, r: 255, g: 190, b: 40 }
      ]
    },
    toxic_lime: {
      name: "Toxic Lime",
      stops: [
        { pos: 0, r: 166, g: 255, b: 0 },
        { pos: 85, r: 243, g: 255, b: 0 },
        { pos: 170, r: 0, g: 229, b: 58 }
      ]
    },
    ocean: {
      name: "Ocean Breeze",
      stops: [
        { pos: 0, r: 0, g: 20, b: 80 },
        { pos: 64, r: 0, g: 140, b: 255 },
        { pos: 128, r: 0, g: 255, b: 200 },
        { pos: 192, r: 135, g: 206, b: 250 }
      ]
    },
    fire_ice: {
      name: "Fire & Ice",
      stops: [
        { pos: 0, r: 0, g: 200, b: 255 },
        { pos: 64, r: 255, g: 255, b: 255 },
        { pos: 128, r: 255, g: 80, b: 0 },
        { pos: 192, r: 180, g: 0, b: 0 }
      ]
    },
    pastel: {
      name: "Pastel Dream",
      stops: [
        { pos: 0, r: 218, g: 182, b: 252 },
        { pos: 64, r: 168, g: 240, b: 219 },
        { pos: 128, r: 255, g: 209, b: 178 },
        { pos: 192, r: 255, g: 182, b: 193 }
      ]
    }
  };

  class GradientEditor {
    constructor(container, options = {}) {
      this.container = typeof container === "string" ? document.getElementById(container) : container;
      this.options = Object.assign({
        maxStops: 8,
        minStops: 2,
        onChange: null,
        stops: [
          { pos: 0, r: 0, g: 255, b: 255 },
          { pos: 85, r: 255, g: 0, b: 128 },
          { pos: 170, r: 255, g: 255, b: 0 }
        ]
      }, options);

      this.stops = JSON.parse(JSON.stringify(this.options.stops));
      this.activeStopIndex = 0;
      this._isDragging = false;
      this._dragIndex = -1;

      if (this.container) {
        this.init();
      }
    }

    init() {
      this.container.innerHTML = "";
      this.container.className = "gradient-editor-widget";

      // 1. Interactive Gradient Track Wrapper
      const trackWrap = document.createElement("div");
      trackWrap.className = "gradient-track-wrap";
      trackWrap.innerHTML = `
        <div class="gradient-track-label-bar">
          <span class="gradient-track-title" data-i18n="lblGradientEditor">Multi-Stop Gradient Ramp</span>
          <span class="gradient-track-hint" data-i18n="lblGradientEditorHint">Click track to add stop | Drag pin to reposition</span>
        </div>
        <div class="gradient-track-area" id="gradientTrackArea">
          <div class="gradient-track-bar" id="gradientTrackBar"></div>
          <div class="gradient-pins-layer" id="gradientPinsLayer"></div>
        </div>
      `;
      this.container.appendChild(trackWrap);

      // 2. Active Stop Controls Toolbar
      const controlsBar = document.createElement("div");
      controlsBar.className = "gradient-stop-controls-bar";
      controlsBar.innerHTML = `
        <div class="gradient-stop-control-item">
          <label data-i18n="lblActiveStopColor">Stop Color</label>
          <div class="color-input-wrap">
            <input type="color" id="gradientActiveColorPicker" class="color-picker-input" value="#00ffff">
            <input type="text" id="gradientActiveHexInput" class="form-control font-mono" style="width: 90px; text-transform: uppercase;" value="#00FFFF" maxlength="7">
          </div>
        </div>
        <div class="gradient-stop-control-item" style="flex: 1; min-width: 160px;">
          <div style="display: flex; justify-content: space-between;">
            <label data-i18n="lblActiveStopPosition">Stop Position</label>
            <span id="gradientActivePosLabel" class="font-mono text-cyan">0%</span>
          </div>
          <div class="range-slider-wrap">
            <input type="range" id="gradientActivePosSlider" class="range-slider" min="0" max="100" step="1" value="0">
          </div>
        </div>
        <div class="gradient-stop-control-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="gradientAddStopBtn" title="Add Stop" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span data-i18n="btnAddStop">Add Stop</span>
          </button>
          <button type="button" class="btn btn-danger btn-sm" id="gradientDeleteStopBtn" title="Delete Stop" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span data-i18n="btnDeleteStop">Remove</span>
          </button>
        </div>
      `;
      this.container.appendChild(controlsBar);

      // 3. Preset Quick-Picks Toolbar
      const presetsBar = document.createElement("div");
      presetsBar.className = "gradient-presets-bar";
      presetsBar.innerHTML = `
        <span class="presets-bar-title" data-i18n="lblGradientPresets">Presets:</span>
        <div class="gradient-preset-pills">
          <button type="button" class="preset-pill" data-preset="rainbow">Rainbow</button>
          <button type="button" class="preset-pill" data-preset="cyberpunk">Cyberpunk</button>
          <button type="button" class="preset-pill" data-preset="synthwave">Synthwave</button>
          <button type="button" class="preset-pill" data-preset="sunset">Sunset</button>
          <button type="button" class="preset-pill" data-preset="toxic_lime">Toxic Lime</button>
          <button type="button" class="preset-pill" data-preset="ocean">Ocean</button>
          <button type="button" class="preset-pill" data-preset="fire_ice">Fire & Ice</button>
          <button type="button" class="preset-pill" data-preset="pastel">Pastel</button>
        </div>
      `;
      this.container.appendChild(presetsBar);

      this._cacheElements();
      this._bindEvents();
      this.render();
    }

    _cacheElements() {
      this.trackArea = this.container.querySelector("#gradientTrackArea");
      this.trackBar = this.container.querySelector("#gradientTrackBar");
      this.pinsLayer = this.container.querySelector("#gradientPinsLayer");
      this.colorPicker = this.container.querySelector("#gradientActiveColorPicker");
      this.hexInput = this.container.querySelector("#gradientActiveHexInput");
      this.posSlider = this.container.querySelector("#gradientActivePosSlider");
      this.posLabel = this.container.querySelector("#gradientActivePosLabel");
      this.addBtn = this.container.querySelector("#gradientAddStopBtn");
      this.delBtn = this.container.querySelector("#gradientDeleteStopBtn");
    }

    _bindEvents() {
      // 1. Click track to add stop
      this.trackArea.addEventListener("click", (e) => {
        if (e.target.closest(".gradient-pin")) return; // Clicked existing pin
        if (this.stops.length >= this.options.maxStops) return;

        const rect = this.trackArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const norm = Math.max(0, Math.min(1, clickX / rect.width));
        const pos255 = Math.round(norm * 255);

        // Sample color at click position
        const sampledRgb = this.sampleAt(pos255);
        this.stops.push({
          pos: pos255,
          r: sampledRgb[0],
          g: sampledRgb[1],
          b: sampledRgb[2]
        });
        this.stops.sort((a, b) => a.pos - b.pos);
        this.activeStopIndex = this.stops.findIndex(s => s.pos === pos255);
        this.render();
        this._emitChange();
      });

      // 2. Drag-and-drop pins
      const onMove = (e) => {
        if (!this._isDragging || this._dragIndex < 0) return;
        const rect = this.trackArea.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const norm = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newPos = Math.round(norm * 255);

        this.stops[this._dragIndex].pos = newPos;

        // Fast update single pin DOM
        const pinEl = this.pinsLayer.querySelector(`.gradient-pin[data-index="${this._dragIndex}"]`);
        if (pinEl) {
          const pct = ((newPos / 255) * 100).toFixed(2);
          pinEl.style.left = `${pct}%`;
          const tooltip = pinEl.querySelector(".pin-tooltip");
          if (tooltip) tooltip.textContent = `${Math.round((newPos / 255) * 100)}%`;
        }

        // Update track gradient background
        if (this.trackBar) {
          this.trackBar.style.background = this.toCssLinearGradient();
        }

        // Fast update position controls
        const pct = Math.round((newPos / 255) * 100);
        if (this.posSlider) this.posSlider.value = String(pct);
        if (this.posLabel) this.posLabel.textContent = `${pct}%`;

        this._emitChange();
      };

      const onUp = () => {
        if (this._isDragging) {
          this._isDragging = false;
          const cur = this.stops[this._dragIndex];
          this.stops.sort((a, b) => a.pos - b.pos);
          if (cur) {
            this.activeStopIndex = this.stops.indexOf(cur);
          }
          this._dragIndex = -1;
          this.render();
          this._emitChange();
        }
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
      };

      this.pinsLayer.addEventListener("mousedown", (e) => {
        const pin = e.target.closest(".gradient-pin");
        if (!pin) return;
        const idx = parseInt(pin.dataset.index, 10);
        if (isNaN(idx)) return;
        this.activeStopIndex = idx;
        this._isDragging = true;
        this._dragIndex = idx;
        this.render();

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      });

      this.pinsLayer.addEventListener("touchstart", (e) => {
        const pin = e.target.closest(".gradient-pin");
        if (!pin) return;
        const idx = parseInt(pin.dataset.index, 10);
        if (isNaN(idx)) return;
        this.activeStopIndex = idx;
        this._isDragging = true;
        this._dragIndex = idx;
        this.render();

        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onUp);
      });

      // 3. Color picker & Hex input
      const updateColor = (hex) => {
        const stop = this.stops[this.activeStopIndex];
        if (!stop) return;
        const rgb = this._hexToRgb(hex);
        stop.r = rgb[0];
        stop.g = rgb[1];
        stop.b = rgb[2];
        this.render();
        this._emitChange();
      };

      this.colorPicker.addEventListener("input", (e) => {
        this.hexInput.value = e.target.value.toUpperCase();
        updateColor(e.target.value);
      });
      this.colorPicker.addEventListener("change", (e) => {
        this.hexInput.value = e.target.value.toUpperCase();
        updateColor(e.target.value);
      });

      this.hexInput.addEventListener("input", (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith("#")) val = "#" + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          this.colorPicker.value = val;
          updateColor(val);
        }
      });

      // 4. Position Slider
      this.posSlider.addEventListener("input", (e) => {
        const stop = this.stops[this.activeStopIndex];
        if (!stop) return;
        const pct = parseInt(e.target.value, 10);
        stop.pos = Math.round((pct / 100) * 255);
        this.posLabel.textContent = `${pct}%`;
        this.render();
        this._emitChange();
      });

      this.posSlider.addEventListener("change", () => {
        const cur = this.stops[this.activeStopIndex];
        this.stops.sort((a, b) => a.pos - b.pos);
        if (cur) {
          this.activeStopIndex = this.stops.indexOf(cur);
        }
        this.render();
        this._emitChange();
      });

      // 5. Add Stop Button
      this.addBtn.addEventListener("click", () => {
        if (this.stops.length >= this.options.maxStops) return;
        let newPos = 128;
        if (this.stops.length > 0) {
          const cur = this.stops[this.activeStopIndex] || this.stops[0];
          newPos = Math.min(255, cur.pos + 30);
          if (newPos > 255) newPos = Math.max(0, cur.pos - 30);
        }
        const sampled = this.sampleAt(newPos);
        this.stops.push({ pos: newPos, r: sampled[0], g: sampled[1], b: sampled[2] });
        this.stops.sort((a, b) => a.pos - b.pos);
        this.activeStopIndex = this.stops.findIndex(s => s.pos === newPos);
        this.render();
        this._emitChange();
      });

      // 6. Delete Stop Button
      this.delBtn.addEventListener("click", () => {
        if (this.stops.length <= this.options.minStops) return;
        this.stops.splice(this.activeStopIndex, 1);
        if (this.activeStopIndex >= this.stops.length) {
          this.activeStopIndex = this.stops.length - 1;
        }
        this.render();
        this._emitChange();
      });

      // 7. Preset Pills
      this.container.querySelectorAll(".preset-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          const pKey = pill.dataset.preset;
          if (PRESET_GRADIENTS[pKey]) {
            this.setStops(PRESET_GRADIENTS[pKey].stops, true);
          }
        });
      });

      // 8. Deselect active pin when clicking anywhere outside this gradient editor widget
      document.addEventListener("pointerdown", (e) => {
        if (!this.container || !this.container.isConnected) return;
        if (!this.container.contains(e.target)) {
          if (this.activeStopIndex !== -1) {
            this.activeStopIndex = -1;
            this.renderPinsOnly();
            this._updateControlsUI();
          }
        }
      });
    }

    render() {
      if (!this.trackBar || !this.pinsLayer) return;

      // Update Track Bar Background (CSS linear-gradient)
      const gradientCss = this.toCssLinearGradient();
      this.trackBar.style.background = gradientCss;

      // Render Pins
      this.renderPinsOnly();
      this._updateControlsUI();
    }

    renderPinsOnly() {
      if (!this.pinsLayer) return;
      this.pinsLayer.innerHTML = "";

      this.stops.forEach((s, idx) => {
        const pct = ((s.pos / 255) * 100).toFixed(2);
        const hex = this._rgbToHex(s.r, s.g, s.b);
        const isActive = (idx === this.activeStopIndex);
        const isDragging = (this._isDragging && idx === this._dragIndex);

        const pin = document.createElement("div");
        pin.className = `gradient-pin ${isActive ? "active" : ""} ${isDragging ? "dragging" : ""}`;
        pin.dataset.index = String(idx);
        pin.style.left = `${pct}%`;
        pin.innerHTML = `
          <div class="pin-marker" style="background-color: ${hex};"></div>
          <div class="pin-tooltip">${Math.round((s.pos / 255) * 100)}%</div>
        `;
        this.pinsLayer.appendChild(pin);
      });
    }

    _updateControlsUI() {
      if (this.activeStopIndex < 0 || this.activeStopIndex >= this.stops.length) {
        if (this.colorPicker) this.colorPicker.disabled = true;
        if (this.hexInput) {
          this.hexInput.disabled = true;
          this.hexInput.value = "---";
        }
        if (this.posSlider) this.posSlider.disabled = true;
        if (this.posLabel) this.posLabel.textContent = "--";
        if (this.delBtn) this.delBtn.disabled = true;
        if (this.addBtn) this.addBtn.disabled = (this.stops.length >= this.options.maxStops);
        return;
      }

      const activeStop = this.stops[this.activeStopIndex];
      const hex = this._rgbToHex(activeStop.r, activeStop.g, activeStop.b);
      const pct = Math.round((activeStop.pos / 255) * 100);

      if (this.colorPicker) {
        this.colorPicker.disabled = false;
        this.colorPicker.value = hex;
      }
      if (this.hexInput) {
        this.hexInput.disabled = false;
        this.hexInput.value = hex.toUpperCase();
      }
      if (this.posSlider) {
        this.posSlider.disabled = false;
        this.posSlider.value = String(pct);
      }
      if (this.posLabel) this.posLabel.textContent = `${pct}%`;

      if (this.delBtn) this.delBtn.disabled = (this.stops.length <= this.options.minStops);
      if (this.addBtn) this.addBtn.disabled = (this.stops.length >= this.options.maxStops);
    }

    toCssLinearGradient(direction = "to right") {
      if (!this.stops || this.stops.length === 0) return "#00ffff";
      const sorted = [...this.stops].sort((a, b) => a.pos - b.pos);
      const parts = sorted.map((s) => {
        const pct = ((s.pos / 255) * 100).toFixed(1);
        return `rgb(${s.r}, ${s.g}, ${s.b}) ${pct}%`;
      });
      const s0 = sorted[0];
      const sLast = sorted[sorted.length - 1];
      if (sLast.pos < 255) {
        // Render seamless cyclic wrap back to first stop color at 100%
        parts.push(`rgb(${s0.r}, ${s0.g}, ${s0.b}) 100%`);
      }
      return `linear-gradient(${direction}, ${parts.join(", ")})`;
    }

    sampleAt(pos255) {
      if (!this.stops || this.stops.length === 0) return [0, 255, 255];
      const sorted = [...this.stops].sort((a, b) => a.pos - b.pos);
      const norm = ((pos255 % 256) + 256) % 256;
      const s0 = sorted[0];
      const sLast = sorted[sorted.length - 1];

      if (norm <= s0.pos) {
        const wrapSpan = (255 - sLast.pos) + s0.pos;
        if (wrapSpan === 0) return [s0.r, s0.g, s0.b];
        const progress = (norm + (255 - sLast.pos)) / wrapSpan;
        return [
          Math.round(sLast.r + (s0.r - sLast.r) * progress),
          Math.round(sLast.g + (s0.g - sLast.g) * progress),
          Math.round(sLast.b + (s0.b - sLast.b) * progress)
        ];
      }
      if (norm >= sLast.pos) {
        const wrapSpan = (255 - sLast.pos) + s0.pos;
        if (wrapSpan === 0) return [sLast.r, sLast.g, sLast.b];
        const progress = (norm - sLast.pos) / wrapSpan;
        return [
          Math.round(sLast.r + (s0.r - sLast.r) * progress),
          Math.round(sLast.g + (s0.g - sLast.g) * progress),
          Math.round(sLast.b + (s0.b - sLast.b) * progress)
        ];
      }

      for (let i = 0; i < sorted.length - 1; i++) {
        const cur = sorted[i];
        const next = sorted[i + 1];
        if (norm >= cur.pos && norm <= next.pos) {
          const span = next.pos - cur.pos;
          if (span === 0) return [cur.r, cur.g, cur.b];
          const t = (norm - cur.pos) / span;
          return [
            Math.round(cur.r + (next.r - cur.r) * t),
            Math.round(cur.g + (next.g - cur.g) * t),
            Math.round(cur.b + (next.b - cur.b) * t)
          ];
        }
      }
      return [s0.r, s0.g, s0.b];
    }

    getStops() {
      return [...this.stops].sort((a, b) => a.pos - b.pos);
    }

    setStops(stops, emitChange = false) {
      if (!Array.isArray(stops) || stops.length < 2) return;
      this.stops = JSON.parse(JSON.stringify(stops)).sort((a, b) => a.pos - b.pos);
      this.activeStopIndex = 0;
      this.render();
      if (emitChange) {
        this._emitChange();
      }
    }

    _emitChange() {
      if (typeof this.options.onChange === "function") {
        this.options.onChange(this.getStops());
      }
    }

    _rgbToHex(r, g, b) {
      return "#" + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }).join("");
    }

    _hexToRgb(hex) {
      const c = hex.replace("#", "");
      return [
        parseInt(c.substring(0, 2), 16) || 0,
        parseInt(c.substring(2, 4), 16) || 0,
        parseInt(c.substring(4, 6), 16) || 0
      ];
    }
  }

  window.GradientEditor = GradientEditor;
  window.PRESET_GRADIENTS = PRESET_GRADIENTS;
})();
