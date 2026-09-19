/**
 * GMMK Studio - Live Matrix & Keystroke Tester
 */

(function () {
  class KeyTester {
    constructor() {
      this.pressedKeys = new Set();
      this.testedKeys = new Set();
      this.history = [];
      this.isActive = false;
      this._keyListenerDown = this._handleKeyDown.bind(this);
      this._keyListenerUp = this._handleKeyUp.bind(this);
    }

    start() {
      if (this.isActive) return;
      this.isActive = true;
      window.addEventListener("keydown", this._keyListenerDown, true);
      window.addEventListener("keyup", this._keyListenerUp, true);
      this.renderTesterCanvas();
    }

    stop() {
      this.isActive = false;
      window.removeEventListener("keydown", this._keyListenerDown, true);
      window.removeEventListener("keyup", this._keyListenerUp, true);
    }

    reset() {
      this.pressedKeys.clear();
      this.testedKeys.clear();
      this.history = [];
      this.renderTesterCanvas();
      this._updateStats();
    }

    getActiveLayout() {
      const profile = window.deviceManager ? window.deviceManager.getActiveProfile() : null;
      if (window.LayoutEngine && typeof window.LayoutEngine.getLayoutForProfile === 'function') {
        return window.LayoutEngine.getLayoutForProfile(profile);
      }
      return window.GMMK3_LAYOUT || [];
    }

    renderTesterCanvas() {
      const container = document.getElementById("testerCanvas");
      if (!container) return;

      container.innerHTML = "";

      const profile = window.deviceManager ? window.deviceManager.getActiveProfile() : null;
      const layout = this.getActiveLayout();
      const bounds = window.LayoutEngine ? window.LayoutEngine.getLayoutBounds(layout) : { width: 22.5, height: 6.25 };

      container.style.setProperty("--keyboard-width-units", bounds.width);
      container.style.setProperty("--keyboard-height-units", bounds.height);
      container.style.width = `calc(${bounds.width} * var(--key-unit) + 36px)`;
      container.style.height = `calc(${bounds.height} * var(--key-unit) + 36px)`;

      // Toggle side diffusers visibility on chassis based on device profile capabilities
      const hasSidelights = !!(profile && profile.capabilities && profile.capabilities.hasSidelights);
      container.classList.toggle("has-sidelights", hasSidelights);

      layout.forEach(key => {
        const keyEl = document.createElement("div");
        keyEl.className = "tester-keycap";
        keyEl.id = `test-key-${key.id}`;

        keyEl.style.left = `calc(${key.x} * var(--key-unit) + 18px)`;
        keyEl.style.top = `calc(${key.y} * var(--key-unit) + 18px)`;
        keyEl.style.width = `calc(${key.w} * var(--key-unit) - 4px)`;
        keyEl.style.height = `calc(${key.h} * var(--key-unit) - 4px)`;

        if (this.testedKeys.has(key.id)) keyEl.classList.add("tested");
        if (this.pressedKeys.has(key.id)) keyEl.classList.add("pressed");

        if (key.isLogo) {
          keyEl.innerHTML = "";
        } else if (key.isKnob) {
          keyEl.innerHTML = `<span class="t-label">🎛️</span>`;
        } else {
          keyEl.innerHTML = `<span class="t-label">${key.label}</span>`;
        }
        container.appendChild(keyEl);
      });

      window.gUI?.fitKeyboardPreviews();
      this._updateStats();
    }

    _handleKeyDown(e) {
      if (!this.isActive) return;
      
      const keyId = this._mapCodeToKeyId(e.code);
      if (keyId) {
        this.pressedKeys.add(keyId);
        this.testedKeys.add(keyId);
        
        const el = document.getElementById(`test-key-${keyId}`);
        if (el) {
          el.classList.add("pressed");
          el.classList.add("tested");
        }
      }

      this.history.unshift({
        key: e.key,
        code: e.code,
        time: new Date().toLocaleTimeString()
      });
      if (this.history.length > 20) this.history.pop();

      this._updateStats();
    }

    _handleKeyUp(e) {
      if (!this.isActive) return;

      const keyId = this._mapCodeToKeyId(e.code);
      if (keyId) {
        this.pressedKeys.delete(keyId);
        const el = document.getElementById(`test-key-${keyId}`);
        if (el) {
          el.classList.remove("pressed");
        }
      }
      this._updateStats();
    }

    _updateStats() {
      const countEl = document.getElementById("testedKeysCount");
      const layout = this.getActiveLayout();
      const totalKeys = layout.filter(k => !k.isLogo).length || 105;
      if (countEl) {
        countEl.textContent = `${this.testedKeys.size} / ${totalKeys}`;
      }

      const listEl = document.getElementById("testerHistoryList");
      if (listEl) {
        listEl.innerHTML = this.history.map(item => `
          <div class="history-chip">
            <span class="chip-code">${item.code}</span>
            <span class="chip-time">${item.time}</span>
          </div>
        `).join("");
      }
    }

    _mapCodeToKeyId(code) {
      const codeMap = {
        "Escape": "ESC", "F1": "F1", "F2": "F2", "F3": "F3", "F4": "F4",
        "F5": "F5", "F6": "F6", "F7": "F7", "F8": "F8", "F9": "F9", "F10": "F10", "F11": "F11", "F12": "F12",
        "PrintScreen": "PSCR", "ScrollLock": "SCRL", "Pause": "PAUS",
        "Backquote": "GRV", "Digit1": "1", "Digit2": "2", "Digit3": "3", "Digit4": "4", "Digit5": "5",
        "Digit6": "6", "Digit7": "7", "Digit8": "8", "Digit9": "9", "Digit0": "0", "Minus": "MINS", "Equal": "EQL", "Backspace": "BSPC",
        "Insert": "INS", "Home": "HOME", "PageUp": "PGUP", "NumLock": "NUM", "NumpadDivide": "PSLS", "NumpadMultiply": "PAST", "NumpadSubtract": "PMNS",
        "Tab": "TAB", "KeyQ": "Q", "KeyW": "W", "KeyE": "E", "KeyR": "R", "KeyT": "T", "KeyY": "Y", "KeyU": "U", "KeyI": "I", "KeyO": "O", "KeyP": "P", "BracketLeft": "LBRC", "BracketRight": "RBRC", "Backslash": "BSLS",
        "Delete": "DEL", "End": "END", "PageDown": "PGDN", "Numpad7": "P7", "Numpad8": "P8", "Numpad9": "P9", "NumpadAdd": "PPLS",
        "CapsLock": "CAPS", "KeyA": "A", "KeyS": "S", "KeyD": "D", "KeyF": "F", "KeyG": "G", "KeyH": "H", "KeyJ": "J", "KeyK": "K", "KeyL": "L", "Semicolon": "SCLN", "Quote": "QUOT", "Enter": "ENT",
        "Numpad4": "P4", "Numpad5": "P5", "Numpad6": "P6",
        "ShiftLeft": "LSFT", "KeyZ": "Z", "KeyX": "X", "KeyC": "C", "KeyV": "V", "KeyB": "B", "KeyN": "N", "KeyM": "M", "Comma": "COMM", "Period": "DOT", "Slash": "SLSH", "ShiftRight": "RSFT",
        "ArrowUp": "UP", "Numpad1": "P1", "Numpad2": "P2", "Numpad3": "P3", "NumpadEnter": "PENT",
        "ControlLeft": "LCTL", "MetaLeft": "LWIN", "AltLeft": "LALT", "Space": "SPC", "AltRight": "RALT", "ContextMenu": "APP", "ControlRight": "RCTL",
        "ArrowLeft": "LEFT", "ArrowDown": "DOWN", "ArrowRight": "RGHT", "Numpad0": "P0", "NumpadDecimal": "PDOT"
      };
      return codeMap[code] || null;
    }
  }

  window.KeyTester = KeyTester;
})();
