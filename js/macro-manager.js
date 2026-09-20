/**
 * LuxQMK Studio - Universal Macro Manager
 * Full bidirectional compatibility with standard QMK / VIA Dynamic Macros protocol.
 */

(function () {
  // QMK Basic Keycode map for send_string expressions
  const QMK_KC_MAP = {
    "KC_A": 4, "KC_B": 5, "KC_C": 6, "KC_D": 7, "KC_E": 8, "KC_F": 9, "KC_G": 10,
    "KC_H": 11, "KC_I": 12, "KC_J": 13, "KC_K": 14, "KC_L": 15, "KC_M": 16, "KC_N": 17,
    "KC_O": 18, "KC_P": 19, "KC_Q": 20, "KC_R": 21, "KC_S": 22, "KC_T": 23, "KC_U": 24,
    "KC_V": 25, "KC_W": 26, "KC_X": 27, "KC_Y": 28, "KC_Z": 29,
    "KC_1": 30, "KC_2": 31, "KC_3": 32, "KC_4": 33, "KC_5": 34, "KC_6": 35, "KC_7": 36,
    "KC_8": 37, "KC_9": 38, "KC_0": 39,
    "KC_ENTER": 40, "KC_ENT": 40, "KC_ESC": 41, "KC_ESCAPE": 41, "KC_BSPC": 42, "KC_BACKSPACE": 42,
    "KC_TAB": 43, "KC_SPACE": 44, "KC_SPC": 44, "KC_MINUS": 45, "KC_MINS": 45, "KC_EQUAL": 46, "KC_EQL": 46,
    "KC_LBRC": 47, "KC_RBRC": 48, "KC_BSLS": 49, "KC_NONUS_HASH": 50, "KC_SCLN": 51, "KC_QUOT": 52,
    "KC_GRV": 53, "KC_COMM": 54, "KC_DOT": 55, "KC_SLSH": 56, "KC_CAPS": 57,
    "KC_F1": 58, "KC_F2": 59, "KC_F3": 60, "KC_F4": 61, "KC_F5": 62, "KC_F6": 63,
    "KC_F7": 64, "KC_F8": 65, "KC_F9": 66, "KC_F10": 67, "KC_F11": 68, "KC_F12": 69,
    "KC_PSCR": 70, "KC_SLCK": 71, "KC_PAUS": 72, "KC_INS": 73, "KC_HOME": 74, "KC_PGUP": 75,
    "KC_DEL": 76, "KC_DELETE": 76, "KC_END": 77, "KC_PGDN": 78, "KC_RIGHT": 79, "KC_RGHT": 79,
    "KC_LEFT": 80, "KC_DOWN": 81, "KC_UP": 82, "KC_NLCK": 83,
    "KC_LCTRL": 224, "KC_LCTL": 224, "KC_LSHIFT": 225, "KC_LSFT": 225,
    "KC_LALT": 226, "KC_LGUI": 227, "KC_LWIN": 227, "KC_LCMD": 227,
    "KC_RCTRL": 228, "KC_RCTL": 228, "KC_RSHIFT": 229, "KC_RSFT": 229,
    "KC_RALT": 230, "KC_ALGR": 230, "KC_RGUI": 231, "KC_RWIN": 231, "KC_RCMD": 231
  };

  // Reverse mapping from code to canonical name
  const CODE_TO_NAME = {};
  for (const [name, code] of Object.entries(QMK_KC_MAP)) {
    if (!CODE_TO_NAME[code] || name.length > CODE_TO_NAME[code].length) {
      CODE_TO_NAME[code] = name;
    }
  }

  // JS Event Code to QMK Keycode mapper for live recording
  const JS_CODE_TO_QMK = {
    "KeyA": "KC_A", "KeyB": "KC_B", "KeyC": "KC_C", "KeyD": "KC_D", "KeyE": "KC_E",
    "KeyF": "KC_F", "KeyG": "KC_G", "KeyH": "KC_H", "KeyI": "KC_I", "KeyJ": "KC_J",
    "KeyK": "KC_K", "KeyL": "KC_L", "KeyM": "KC_M", "KeyN": "KC_N", "KeyO": "KC_O",
    "KeyP": "KC_P", "KeyQ": "KC_Q", "KeyR": "KC_R", "KeyS": "KC_S", "KeyT": "KC_T",
    "KeyU": "KC_U", "KeyV": "KC_V", "KeyW": "KC_W", "KeyX": "KC_X", "KeyY": "KC_Y", "KeyZ": "KC_Z",
    "Digit1": "KC_1", "Digit2": "KC_2", "Digit3": "KC_3", "Digit4": "KC_4", "Digit5": "KC_5",
    "Digit6": "KC_6", "Digit7": "KC_7", "Digit8": "KC_8", "Digit9": "KC_9", "Digit0": "KC_0",
    "Enter": "KC_ENTER", "Escape": "KC_ESC", "Backspace": "KC_BSPC", "Tab": "KC_TAB", "Space": "KC_SPACE",
    "Minus": "KC_MINUS", "Equal": "KC_EQUAL", "BracketLeft": "KC_LBRC", "BracketRight": "KC_RBRC",
    "Backslash": "KC_BSLS", "Semicolon": "KC_SCLN", "Quote": "KC_QUOT", "Backquote": "KC_GRV",
    "Comma": "KC_COMM", "Period": "KC_DOT", "Slash": "KC_SLSH", "CapsLock": "KC_CAPS",
    "F1": "KC_F1", "F2": "KC_F2", "F3": "KC_F3", "F4": "KC_F4", "F5": "KC_F5", "F6": "KC_F6",
    "F7": "KC_F7", "F8": "KC_F8", "F9": "KC_F9", "F10": "KC_F10", "F11": "KC_F11", "F12": "KC_F12",
    "PrintScreen": "KC_PSCR", "ScrollLock": "KC_SLCK", "Pause": "KC_PAUS", "Insert": "KC_INS",
    "Home": "KC_HOME", "PageUp": "KC_PGUP", "Delete": "KC_DEL", "End": "KC_END", "PageDown": "KC_PGDN",
    "ArrowRight": "KC_RIGHT", "ArrowLeft": "KC_LEFT", "ArrowDown": "KC_DOWN", "ArrowUp": "KC_UP",
    "ControlLeft": "KC_LCTRL", "ShiftLeft": "KC_LSHIFT", "AltLeft": "KC_LALT", "MetaLeft": "KC_LGUI",
    "ControlRight": "KC_RCTRL", "ShiftRight": "KC_RSHIFT", "AltRight": "KC_RALT", "MetaRight": "KC_RGUI"
  };

  class MacroManager {
    constructor(protocol) {
      this.protocol = protocol;
      this.macroCount = 16;
      this.bufferSize = 1024;
      this.macros = [];
      this.activeMacroId = 0;
      this.isRecording = false;
      this._lastEventTime = 0;
      this._recordingHandlerDown = null;
      this._recordingHandlerUp = null;

      this._initDefaultMacros();
    }

    _initDefaultMacros() {
      this.macros = [];
      for (let i = 0; i < this.macroCount; i++) {
        this.macros.push({
          id: i,
          label: `Macro ${i}`,
          text: ""
        });
      }
      this._loadFromLocalStorage();
    }

    _loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem("luxqmk_macros_backup");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((m) => {
              if (m && typeof m.id === "number" && m.id < this.macroCount) {
                this.macros[m.id].text = m.text || "";
                if (m.label) this.macros[m.id].label = m.label;
              }
            });
          }
        }
      } catch (e) {
        console.warn("Could not load local macros backup:", e);
      }
    }

    _saveToLocalStorage() {
      try {
        localStorage.setItem("luxqmk_macros_backup", JSON.stringify(this.macros));
      } catch (e) {
        console.warn("Could not save local macros backup:", e);
      }
    }

    init() {
      this._bindUI();
      this.render();
    }

    // --- ENCODING & DECODING VIA DYNAMIC MACRO BYTECODE ---

    /**
     * Decodes null-delimited QMK send_string bytecode buffer into macro strings.
     * QMK send_string protocol:
     *   - SS_QMK_PREFIX (0x01) followed by:
     *     - SS_TAP_CODE (0x01) + keycode (1 byte)
     *     - SS_DOWN_CODE (0x02) + keycode (1 byte)
     *     - SS_UP_CODE (0x03) + keycode (1 byte)
     *     - SS_DELAY_CODE (0x04) + ASCII digits + '|' delimiter
     *   - ASCII characters (0x20 - 0x7E) are literal text
     *   - 0x00 terminates the macro slot
     */
    decodeMacroBuffer(buffer, macroCount = this.macroCount) {
      const result = [];
      for (let i = 0; i < macroCount; i++) {
        result.push("");
      }

      if (!buffer || buffer.length === 0) return result;

      let currentMacro = 0;
      let i = 0;
      const len = buffer.length;

      while (i < len && currentMacro < macroCount) {
        const b = buffer[i];

        if (b === 0x00) {
          currentMacro++;
          i++;
          continue;
        }

        // QMK SS_QMK_PREFIX: 0x01
        if (b === 0x01 && i + 1 < len) {
          const action = buffer[i + 1];

          // 1. SS_TAP_CODE: 0x01 + keycode
          if (action === 0x01 && i + 2 < len) {
            const kc = buffer[i + 2];
            const name = CODE_TO_NAME[kc] || `0x${kc.toString(16).toUpperCase()}`;
            result[currentMacro] += `{${name}}`;
            i += 3;
            continue;
          }

          // 2. SS_DOWN_CODE: 0x02 + keycode
          if (action === 0x02 && i + 2 < len) {
            const kc = buffer[i + 2];
            const name = CODE_TO_NAME[kc] || `0x${kc.toString(16).toUpperCase()}`;
            result[currentMacro] += `{+${name}}`;
            i += 3;
            continue;
          }

          // 3. SS_UP_CODE: 0x03 + keycode
          if (action === 0x03 && i + 2 < len) {
            const kc = buffer[i + 2];
            const name = CODE_TO_NAME[kc] || `0x${kc.toString(16).toUpperCase()}`;
            result[currentMacro] += `{-${name}}`;
            i += 3;
            continue;
          }

          // 4. SS_DELAY_CODE: 0x04 + ASCII digits + '|'
          if (action === 0x04) {
            let dStr = "";
            let dIdx = i + 2;
            while (dIdx < len && buffer[dIdx] >= 0x30 && buffer[dIdx] <= 0x39) {
              dStr += String.fromCharCode(buffer[dIdx]);
              dIdx++;
            }
            if (dIdx < len && buffer[dIdx] === 0x7C) {
              dIdx++; // skip delimiter '|'
            }
            if (dStr.length > 0) {
              result[currentMacro] += `{${dStr}ms}`;
            }
            i = dIdx;
            continue;
          }

          // Unknown prefix action - skip prefix and action
          i += 2;
          continue;
        }

        // Standard ASCII printable character
        if (b >= 32 && b <= 126) {
          result[currentMacro] += String.fromCharCode(b);
          i++;
        } else {
          // Ignore unhandled non-printable control byte
          i++;
        }
      }

      return result;
    }

    /**
     * Encodes macro strings into a null-delimited QMK send_string bytecode array.
     */
    encodeMacroBuffer(macros = this.macros, targetBufferSize = this.bufferSize) {
      const bytes = [];

      for (let mIdx = 0; mIdx < macros.length; mIdx++) {
        const text = (typeof macros[mIdx] === "string") ? macros[mIdx] : (macros[mIdx].text || "");
        let i = 0;

        while (i < text.length) {
          if (text[i] === "{") {
            const closeIdx = text.indexOf("}", i);
            if (closeIdx !== -1) {
              const tag = text.substring(i + 1, closeIdx).trim();
              i = closeIdx + 1;

              // 1. Delay tag: e.g. {100}, {100ms}, {delay:100} -> \1\4 <digits> |
              const delayMatch = tag.match(/^(?:delay\s*:\s*)?(\d+)(?:ms)?$/i);
              if (delayMatch) {
                const msStr = delayMatch[1];
                bytes.push(0x01); // SS_QMK_PREFIX
                bytes.push(0x04); // SS_DELAY_CODE
                for (let c = 0; c < msStr.length; c++) {
                  bytes.push(msStr.charCodeAt(c));
                }
                bytes.push(0x7C); // '|' delimiter consumed by QMK
                continue;
              }

              // 2. Key down: {+KC_LCTRL} -> \1\2 <kc>
              if (tag.startsWith("+")) {
                const kcName = tag.substring(1).trim().toUpperCase();
                const kcCode = QMK_KC_MAP[kcName];
                if (kcCode !== undefined) {
                  bytes.push(0x01); // SS_QMK_PREFIX
                  bytes.push(0x02); // SS_DOWN_CODE
                  bytes.push(kcCode);
                  continue;
                }
              }

              // 3. Key up: {-KC_LCTRL} -> \1\3 <kc>
              if (tag.startsWith("-")) {
                const kcName = tag.substring(1).trim().toUpperCase();
                const kcCode = QMK_KC_MAP[kcName];
                if (kcCode !== undefined) {
                  bytes.push(0x01); // SS_QMK_PREFIX
                  bytes.push(0x03); // SS_UP_CODE
                  bytes.push(kcCode);
                  continue;
                }
              }

              // 4. Key tap: {KC_ENTER}, {KC_A} -> \1\1 <kc>
              const kcCode = QMK_KC_MAP[tag.toUpperCase()];
              if (kcCode !== undefined) {
                bytes.push(0x01); // SS_QMK_PREFIX
                bytes.push(0x01); // SS_TAP_CODE
                bytes.push(kcCode);
                continue;
              }

              // If unknown tag, emit literally
              for (let c = 0; c < tag.length; c++) {
                bytes.push(tag.charCodeAt(c) & 0xFF);
              }
              continue;
            }
          }

          // Plain ASCII character
          const code = text.charCodeAt(i);
          if (code >= 32 && code <= 126) {
            bytes.push(code);
          }
          i++;
        }

        // Terminate each macro with null byte 0x00
        bytes.push(0x00);
      }

      // Ensure total byte count does not exceed targetBufferSize
      if (bytes.length > targetBufferSize) {
        console.warn(`Macro buffer overflow: ${bytes.length} > ${targetBufferSize} bytes`);
        bytes.length = targetBufferSize;
        bytes[targetBufferSize - 1] = 0x00;
      } else {
        // Zero-pad to complete buffer size
        while (bytes.length < targetBufferSize) {
          bytes.push(0x00);
        }
      }

      return bytes;
    }

    calculateTotalUsedBytes() {
      let total = 0;
      for (const m of this.macros) {
        const text = m.text || "";
        let i = 0;
        let count = 0;
        while (i < text.length) {
          if (text[i] === "{") {
            const closeIdx = text.indexOf("}", i);
            if (closeIdx !== -1) {
              const tag = text.substring(i + 1, closeIdx).trim();
              i = closeIdx + 1;
              const delayMatch = tag.match(/^(?:delay\s*:\s*)?(\d+)(?:ms)?$/i);
              if (delayMatch) {
                count += 2 + delayMatch[1].length + 1; // 0x01 + 0x04 + digits + '|'
                continue;
              }
              if (tag.startsWith("+") || tag.startsWith("-")) {
                count += 3; // 0x01 + action + keycode
                continue;
              }
              if (QMK_KC_MAP[tag.toUpperCase()] !== undefined) {
                count += 3; // 0x01 + 0x01 + keycode
                continue;
              }
            }
          }
          count++;
          i++;
        }
        count += 1; // null terminator
        total += count;
      }
      return total;
    }

    // --- HARDWARE COMMUNICATIONS ---

    async loadFromDevice() {
      if (!this.protocol || !this.protocol.isConnected) {
        return;
      }

      try {
        const count = await this.protocol.getMacroCount();
        if (typeof count === "number" && count > 0) {
          this.macroCount = Math.min(32, count);
        }

        const bufSize = await this.protocol.getMacroBufferSize();
        if (typeof bufSize === "number" && bufSize > 0) {
          this.bufferSize = bufSize;
        }

        const bufObj = await this.protocol.getMacroBuffer();
        if (bufObj && Array.isArray(bufObj.data) && bufObj.data.length > 0) {
          const decoded = this.decodeMacroBuffer(bufObj.data, this.macroCount);
          decoded.forEach((str, idx) => {
            if (idx < this.macros.length) {
              this.macros[idx].text = str;
            } else {
              this.macros.push({
                id: idx,
                label: `Macro ${idx}`,
                text: str
              });
            }
          });
          this._saveToLocalStorage();
          this.render();
          const usedBytes = this.calculateTotalUsedBytes();
          if (window.gUI) {
            window.gUI.showToast(
              window.i18n
                ? window.i18n.t("toastMacrosLoaded", {
                    count: this.macroCount,
                    used: usedBytes,
                    total: this.bufferSize
                  })
                : `Loaded ${this.macroCount} macros from keyboard EEPROM (${usedBytes} / ${this.bufferSize} bytes)`,
              "success"
            );
          }
        }
      } catch (err) {
        console.warn("Could not load macros from device:", err);
      }
    }

    async saveToDevice() {
      if (!this.protocol || !this.protocol.isConnected) {
        if (window.gUI) {
          window.gUI.showToast(
            window.i18n ? window.i18n.t("toastDeviceNotConnected") : "Please connect keyboard first",
            "warning"
          );
        }
        return;
      }

      try {
        const encodedBuffer = this.encodeMacroBuffer(this.macros, this.bufferSize);
        await this.protocol.setMacroBuffer({ data: encodedBuffer });
        this._saveToLocalStorage();
        this.render();
        if (window.gUI) {
          window.gUI.showToast(
            window.i18n ? window.i18n.t("toastMacrosSaved") : "Macros saved to keyboard EEPROM",
            "success"
          );
        }
      } catch (err) {
        console.error("Failed to save macros to device:", err);
        if (window.gUI) {
          window.gUI.showToast(
            window.i18n
              ? window.i18n.t("toastMacrosSaveError", { msg: err.message || "Unknown error" })
              : `Failed to save macros: ${err.message}`,
            "error"
          );
        }
      }
    }

    async resetMacros() {
      if (!this.protocol || !this.protocol.isConnected) {
        this._initDefaultMacros();
        this.render();
        return;
      }

      try {
        await this.protocol.resetMacros();
        this._initDefaultMacros();
        this._saveToLocalStorage();
        this.render();
        if (window.gUI) {
          window.gUI.showToast(
            window.i18n ? window.i18n.t("toastMacrosReset") : "All macros cleared on keyboard",
            "info"
          );
        }
      } catch (err) {
        console.error("Failed to reset macros on device:", err);
      }
    }

    // --- KEYSTROKE RECORDER ---

    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    }

    startRecording() {
      this.isRecording = true;
      this._lastEventTime = performance.now();

      const btnRecord = document.getElementById("btnRecordMacro");
      const recordStatus = document.getElementById("macroRecordStatus");
      if (btnRecord) {
        btnRecord.classList.add("recording");
        const span = btnRecord.querySelector("span:last-child");
        if (span && window.i18n) span.textContent = window.i18n.t("btnStopRecord");
      }
      if (recordStatus) {
        recordStatus.style.display = "inline-flex";
      }

      this._recordingHandlerDown = (e) => {
        // Prevent recording shortcut keys when pressing Stop button
        if (e.target && e.target.id === "btnRecordMacro") return;
        e.preventDefault();

        const now = performance.now();
        const delta = Math.round(now - this._lastEventTime);
        this._lastEventTime = now;

        const qmkKc = JS_CODE_TO_QMK[e.code];
        if (!qmkKc) return;

        let insert = "";
        if (delta > 35 && delta < 5000) {
          insert += `{${delta}ms}`;
        }

        const isModifier = ["KC_LCTRL", "KC_RCTRL", "KC_LSHIFT", "KC_RSHIFT", "KC_LALT", "KC_RALT", "KC_LGUI", "KC_RGUI"].includes(qmkKc);
        if (isModifier) {
          insert += `{+${qmkKc}}`;
        } else {
          insert += `{${qmkKc}}`;
        }

        this.insertTextAtCursor(insert);
      };

      this._recordingHandlerUp = (e) => {
        if (e.target && e.target.id === "btnRecordMacro") return;
        e.preventDefault();

        const qmkKc = JS_CODE_TO_QMK[e.code];
        if (!qmkKc) return;

        const isModifier = ["KC_LCTRL", "KC_RCTRL", "KC_LSHIFT", "KC_RSHIFT", "KC_LALT", "KC_RALT", "KC_LGUI", "KC_RGUI"].includes(qmkKc);
        if (isModifier) {
          this.insertTextAtCursor(`{-${qmkKc}}`);
        }
      };

      window.addEventListener("keydown", this._recordingHandlerDown, { capture: true });
      window.addEventListener("keyup", this._recordingHandlerUp, { capture: true });
    }

    stopRecording() {
      this.isRecording = false;

      const btnRecord = document.getElementById("btnRecordMacro");
      const recordStatus = document.getElementById("macroRecordStatus");
      if (btnRecord) {
        btnRecord.classList.remove("recording");
        const span = btnRecord.querySelector("span:last-child");
        if (span && window.i18n) span.textContent = window.i18n.t("btnStartRecord");
      }
      if (recordStatus) {
        recordStatus.style.display = "none";
      }

      if (this._recordingHandlerDown) {
        window.removeEventListener("keydown", this._recordingHandlerDown, { capture: true });
        this._recordingHandlerDown = null;
      }
      if (this._recordingHandlerUp) {
        window.removeEventListener("keyup", this._recordingHandlerUp, { capture: true });
        this._recordingHandlerUp = null;
      }
    }

    insertTextAtCursor(insertText) {
      const textarea = document.getElementById("macroContentEditor");
      if (!textarea) return;

      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const val = textarea.value;

      textarea.value = val.substring(0, start) + insertText + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
      textarea.focus();

      this.macros[this.activeMacroId].text = textarea.value;
      this._saveToLocalStorage();
      this.updateMemoryGauge();
      this.updateSlotListSnippets();
    }

    // --- UI BINDINGS & RENDERING ---

    _bindUI() {
      const textarea = document.getElementById("macroContentEditor");
      if (textarea) {
        textarea.addEventListener("input", (e) => {
          this.macros[this.activeMacroId].text = e.target.value;
          this._saveToLocalStorage();
          this.updateMemoryGauge();
          this.updateSlotListSnippets();
        });
      }

      const labelInput = document.getElementById("macroNameInput");
      if (labelInput) {
        labelInput.addEventListener("input", (e) => {
          this.macros[this.activeMacroId].label = e.target.value || `Macro ${this.activeMacroId}`;
          this._saveToLocalStorage();
          this.updateSlotListSnippets();
        });
      }

      const btnRecord = document.getElementById("btnRecordMacro");
      if (btnRecord) {
        btnRecord.addEventListener("click", () => this.toggleRecording());
      }

      const btnSave = document.getElementById("btnSaveMacros");
      if (btnSave) {
        btnSave.addEventListener("click", () => this.saveToDevice());
      }

      const btnReload = document.getElementById("btnReloadMacros");
      if (btnReload) {
        btnReload.addEventListener("click", () => this.loadFromDevice());
      }

      const btnClear = document.getElementById("btnClearCurrentMacro");
      if (btnClear) {
        btnClear.addEventListener("click", () => {
          this.macros[this.activeMacroId].text = "";
          if (textarea) textarea.value = "";
          this._saveToLocalStorage();
          this.updateMemoryGauge();
          this.updateSlotListSnippets();
        });
      }

      const btnResetAll = document.getElementById("btnResetAllMacros");
      if (btnResetAll) {
        btnResetAll.addEventListener("click", () => {
          if (confirm(window.i18n ? window.i18n.t("confirmResetMacros") : "Are you sure you want to clear all macros?")) {
            this.resetMacros();
          }
        });
      }

      // Quick syntax insertion buttons
      document.querySelectorAll("[data-macro-insert]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.insertTextAtCursor(btn.dataset.macroInsert);
        });
      });
    }

    selectMacro(id) {
      if (id < 0 || id >= this.macroCount) return;
      this.activeMacroId = id;

      const textarea = document.getElementById("macroContentEditor");
      const labelInput = document.getElementById("macroNameInput");
      const activeTitle = document.getElementById("macroActiveTitleBadge");

      if (textarea) textarea.value = this.macros[id].text || "";
      if (labelInput) labelInput.value = this.macros[id].label || `Macro ${id}`;
      if (activeTitle) activeTitle.textContent = `M${id}`;

      document.querySelectorAll(".macro-slot-card").forEach((card) => {
        if (parseInt(card.dataset.macroId, 10) === id) {
          card.classList.add("active");
        } else {
          card.classList.remove("active");
        }
      });

      this.updateMemoryGauge();
    }

    render() {
      this.renderSlotList();
      this.selectMacro(this.activeMacroId);
      this.updateMemoryGauge();
    }

    renderSlotList() {
      const container = document.getElementById("macroSlotsList");
      if (!container) return;

      container.innerHTML = "";

      for (let i = 0; i < this.macroCount; i++) {
        const m = this.macros[i] || { id: i, label: `Macro ${i}`, text: "" };
        const card = document.createElement("button");
        card.className = `macro-slot-card ${i === this.activeMacroId ? "active" : ""}`;
        card.dataset.macroId = i;
        card.type = "button";

        const hasContent = (m.text && m.text.trim().length > 0);
        const preview = hasContent ? m.text : (window.i18n ? window.i18n.t("macroSlotEmpty") : "Empty");

        card.innerHTML = `
          <div class="macro-slot-header">
            <div class="macro-slot-id">
              <span class="macro-slot-dot ${hasContent ? "filled" : ""}"></span>
              <strong>M${i}</strong>
            </div>
            <span class="macro-slot-name">${m.label || `Macro ${i}`}</span>
          </div>
          <div class="macro-slot-snippet">${this._escapeHtml(preview)}</div>
        `;

        card.addEventListener("click", () => this.selectMacro(i));
        container.appendChild(card);
      }
    }

    updateSlotListSnippets() {
      document.querySelectorAll(".macro-slot-card").forEach((card) => {
        const id = parseInt(card.dataset.macroId, 10);
        const m = this.macros[id];
        if (!m) return;

        const dot = card.querySelector(".macro-slot-dot");
        const nameEl = card.querySelector(".macro-slot-name");
        const snippetEl = card.querySelector(".macro-slot-snippet");

        const hasContent = (m.text && m.text.trim().length > 0);
        if (dot) dot.className = `macro-slot-dot ${hasContent ? "filled" : ""}`;
        if (nameEl) nameEl.textContent = m.label || `Macro ${id}`;
        if (snippetEl) {
          const preview = hasContent ? m.text : (window.i18n ? window.i18n.t("macroSlotEmpty") : "Empty");
          snippetEl.textContent = preview;
        }
      });
    }

    updateMemoryGauge() {
      const usedBytes = this.calculateTotalUsedBytes();
      const pct = Math.min(100, Math.round((usedBytes / this.bufferSize) * 100));

      const fill = document.getElementById("macroMemoryGaugeFill");
      const text = document.getElementById("macroMemoryGaugeText");

      if (fill) {
        fill.style.width = `${pct}%`;
        fill.style.backgroundColor = pct > 90 ? "#ef4444" : (pct > 75 ? "#f59e0b" : "var(--accent-cyan, #00f0ff)");
      }

      if (text) {
        text.textContent = `${usedBytes} / ${this.bufferSize} B (${pct}%)`;
      }
    }

    _escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }

  window.MacroManager = MacroManager;
})();
