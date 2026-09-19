/**
 * LuxQMK Studio - WebHID Protocol Layer (VIA v12 / Raw HID)
 * Multi-device management, automatic reconnection, and persistent selection.
 */

(function () {
  const VIA_CMD = {
    GET_PROTOCOL_VERSION: 0x01,
    DYNAMIC_KEYMAP_GET_KEYCODE: 0x04,
    DYNAMIC_KEYMAP_SET_KEYCODE: 0x05,
    DYNAMIC_KEYMAP_RESET: 0x06,
    CUSTOM_SET_VALUE: 0x07,
    CUSTOM_GET_VALUE: 0x08,
    CUSTOM_SAVE: 0x09,
    MACRO_GET_COUNT: 0x0C,
    MACRO_GET_BUFFER_SIZE: 0x0D,
    MACRO_GET_BUFFER: 0x0E,
    MACRO_SET_BUFFER: 0x0F,
    MACRO_RESET: 0x10,
    DYNAMIC_KEYMAP_GET_LAYER_COUNT: 0x11,
    DYNAMIC_KEYMAP_GET_BUFFER: 0x12,
    DYNAMIC_KEYMAP_SET_BUFFER: 0x13,
    DYNAMIC_KEYMAP_GET_ENCODER: 0x14,
    DYNAMIC_KEYMAP_SET_ENCODER: 0x15
  };

  const CHANNELS = {
    CUSTOM: 0x01,
    RGB_MATRIX: 0x03
  };

  const CUSTOM_VAL = {
    RGB_REVERSE: 1,
    LAYER_LIGHTING_ENABLE: 2,
    LAYER_DIM_LEVEL: 3,
    LAYER_1_COLOR: 4,
    LAYER_2_COLOR: 5,
    LAYER_3_COLOR: 6,
    LOGO_MODE: 7,
    LOGO_COLOR_CAPS: 8,
    LOGO_COLOR_NUM: 9,
    LOGO_COLOR_SCROLL: 10,
    LOGO_COLOR_CAPS_NUM: 11,
    LOGO_COLOR_CAPS_SCROLL: 12,
    LOGO_COLOR_NUM_SCROLL: 13,
    LOGO_COLOR_ALL: 14,
    ACTIVE_LAYER: 15,
    HOST_LEDS: 16,
    WIN_LOCK_MODE: 17,
    WIN_LOCK_COLOR: 18,
    WIN_LOCK_STATE: 19,
    REACTIVE_ENABLE: 20,
    REACTIVE_MODE: 21,
    REACTIVE_COLOR: 22,
    REACTIVE_SPEED: 23,
    REACTIVE_BLEND: 24,
    LUXQMK_VERSION: 25,
    QMK_VERSION: 26,
    DEBOUNCE_TIME: 27
  };

  const RGB_MATRIX_VAL = {
    BRIGHTNESS: 1,
    EFFECT: 2,
    EFFECT_SPEED: 3,
    COLOR: 4
  };

  const KEYBOARD_SPECS = {
    vendorId: 0x504B,
    productId: 0x320F,
    usagePage: 0xFF60,
    usage: 0x61,
    rows: 14,
    cols: 8,
    layers: 3
  };

  class GMMK3Protocol {
    constructor() {
      this.device = null;
      this.onLog = null;
      this.onDisconnect = null;
      this.onDevicesChanged = null;
      this._lock = Promise.resolve();
      this._pending = null;
      this._reportListener = this._handleInputReport.bind(this);
      this.initHIDListeners();
    }

    initHIDListeners() {
      if (typeof navigator !== 'undefined' && navigator.hid) {
        navigator.hid.addEventListener('disconnect', (event) => {
          if (this.device && event.device === this.device) {
            this.cleanup();
            if (this.onDisconnect) {
              this.onDisconnect(event.device);
            }
          }
          if (this.onDevicesChanged) {
            this.onDevicesChanged();
          }
        });

        navigator.hid.addEventListener('connect', (event) => {
          if (this.onDevicesChanged) {
            this.onDevicesChanged();
          }
        });
      }
    }

    _handleInputReport(event) {
      if (!this._pending) return;

      const data = new Uint8Array(event.data.buffer, event.data.byteOffset, event.data.byteLength);
      const req = this._pending;

      if (typeof req.predicate === "function") {
        if (!req.predicate(data)) {
          return;
        }
      }

      if (req.timer) clearTimeout(req.timer);
      this._pending = null;
      req.resolve(data);
    }

    cleanup() {
      if (this.device) {
        try {
          this.device.removeEventListener('inputreport', this._reportListener);
        } catch (e) {}
      }
      if (this._pending) {
        if (this._pending.timer) clearTimeout(this._pending.timer);
        if (typeof this._pending.reject === 'function') {
          this._pending.reject(new Error("Device disconnected"));
        }
      }
      this._pending = null;
      this.device = null;
      this._lock = Promise.resolve();
    }

    log(msg, type = 'info') {
      if (this.onLog) {
        this.onLog(msg, type);
      }
    }

    get isConnected() {
      return this.device !== null && this.device.opened;
    }

    isRawHID(d) {
      if (!d || !d.collections || d.collections.length === 0) return false;
      return d.collections.some(c => c.usagePage === 0xFF60);
    }

    isDedicatedRawHID(d) {
      if (!d || !d.collections || d.collections.length === 0) return false;
      const hasRaw = d.collections.some(c => c.usagePage === 0xFF60 && (c.usage === 0x61 || c.usage === 0x01));
      const hasOSInterface = d.collections.some(c => c.usagePage === 0x01 || c.usagePage === 0x0C);
      return hasRaw && !hasOSInterface;
    }

    getDeviceId(d, index = 0) {
      if (!d) return "";
      const v = (d.vendorId || 0).toString(16).padStart(4, "0");
      const p = (d.productId || 0).toString(16).padStart(4, "0");
      const s = d.serialNumber || index.toString();
      return `${v}:${p}:${s}`;
    }

    async getAuthorizedDevices() {
      if (!navigator.hid) return [];
      try {
        const devices = await navigator.hid.getDevices();
        // Return only Raw HID devices
        return devices.filter(d => this.isRawHID(d));
      } catch (e) {
        return [];
      }
    }

    async connectDevice(targetDevice) {
      if (!targetDevice) {
        throw new Error(window.i18n ? window.i18n.t("optNoDevices") : "No device specified");
      }

      this.cleanup();
      this.device = targetDevice;

      if (!this.device.opened) {
        await this.device.open();
      }

      this.device.addEventListener('inputreport', this._reportListener);
      const name = this.device.productName || "LuxQMK Keyboard";
      const msg = window.i18n ? window.i18n.t("logConnectedDevice", { name }) : `Connected to device: ${name} (0xFF60:0x61)`;
      this.log(msg, 'info');
      return this.device;
    }

    async autoConnect(savedId = null) {
      const devices = await this.getAuthorizedDevices();
      if (devices.length === 0) return null;

      let target = null;
      if (savedId) {
        target = devices.find((d, idx) => this.getDeviceId(d, idx) === savedId);
      }

      if (!target) {
        // Find best dedicated Raw HID device
        target = devices.find(d => this.isDedicatedRawHID(d)) || devices[0];
      }

      if (target) {
        return await this.connectDevice(target);
      }
      return null;
    }

    async requestAndConnect() {
      if (!navigator.hid) {
        throw new Error(window.i18n ? window.i18n.t("errorWebHidNotSupported") : "WebHID is not supported in this browser");
      }

      const devices = await navigator.hid.requestDevice({
        filters: [
          { usagePage: 0xFF60, usage: 0x61 },
          { usagePage: 0xFF60 }
        ]
      });

      if (!devices || devices.length === 0) {
        throw new Error(window.i18n ? window.i18n.t("logDeviceCancelled") : "Device selection cancelled");
      }

      const target = devices.find(d => this.isDedicatedRawHID(d)) || devices[0];
      return await this.connectDevice(target);
    }

    async disconnect() {
      if (this.device) {
        try {
          if (this.device.opened) {
            await this.device.close();
          }
        } catch (e) {}
      }
      this.cleanup();
      const msg = window.i18n ? window.i18n.t("logDisconnected") : "Keyboard disconnected";
      this.log(msg, "warning");
    }

    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Sequential execution of HID transactions protected by a robust mutex queue
     */
    async sendCommand(bytes, timeoutMs = 2500, retries = 2, predicate = null) {
      const currentAction = async () => {
        if (!this.device || !this.device.opened) {
          throw new Error("Device is not opened or disconnected");
        }

        const report = new Uint8Array(32);
        for (let i = 0; i < Math.min(bytes.length, 32); i++) {
          report[i] = bytes[i];
        }

        const checkMatch = predicate || ((data) => {
          return data[0] === bytes[0] || data[0] === 0xFF;
        });

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            if (this._pending && this._pending.timer) {
              clearTimeout(this._pending.timer);
            }
            this._pending = null;

            const responsePromise = new Promise((resolve, reject) => {
              const timer = setTimeout(() => {
                if (this._pending && this._pending.resolve === resolve) {
                  this._pending = null;
                }
                reject(new Error(`HID response timeout after ${timeoutMs}ms (CMD 0x${bytes[0].toString(16)})`));
              }, timeoutMs);

              this._pending = { resolve, reject, timer, predicate: checkMatch };
            });

            await this.device.sendReport(0x00, report);
            const responseData = await responsePromise;
            return responseData;
          } catch (err) {
            if (attempt === retries) {
              throw err;
            }
            await this.sleep(40);
          }
        }
      };

      const nextPromise = this._lock.catch(() => {}).then(currentAction);
      this._lock = nextPromise.catch(() => {});
      return nextPromise;
    }

    // --- VIA Core Methods ---
    async getProtocolVersion() {
      const res = await this.sendCommand([VIA_CMD.GET_PROTOCOL_VERSION]);
      return (res[1] << 8) | res[2];
    }

    async getKeycode(layer, row, col) {
      const res = await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_GET_KEYCODE, layer, row, col]);
      return (res[4] << 8) | res[5];
    }

    async setKeycode(layer, row, col, keycode) {
      const hi = (keycode >> 8) & 0xFF;
      const lo = keycode & 0xFF;
      return await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_SET_KEYCODE, layer, row, col, hi, lo]);
    }

    async getKeymapBuffer(offset, size) {
      const offHi = (offset >> 8) & 0xFF;
      const offLo = offset & 0xFF;
      return await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_GET_BUFFER, offHi, offLo, size]);
    }

    async readFullKeymap(layers = 3, rows = 14, cols = 8) {
      const totalBytes = layers * rows * cols * 2;
      const fullBuffer = new Uint8Array(totalBytes);
      const CHUNK_SIZE = 28;
      for (let offset = 0; offset < totalBytes; offset += CHUNK_SIZE) {
        const size = Math.min(CHUNK_SIZE, totalBytes - offset);
        const res = await this.getKeymapBuffer(offset, size);
        for (let i = 0; i < size; i++) {
          fullBuffer[offset + i] = res[4 + i];
        }
      }
      return fullBuffer;
    }

    async setKeymapBuffer(offset, size, bytes) {
      const offHi = (offset >> 8) & 0xFF;
      const offLo = offset & 0xFF;
      const payload = [VIA_CMD.DYNAMIC_KEYMAP_SET_BUFFER, offHi, offLo, size, ...bytes];
      return await this.sendCommand(payload);
    }

    // --- Rotary Knob Encoders ---
    async getEncoder(layer, id = 0, isClockwise = false) {
      const res = await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_GET_ENCODER, layer, id, isClockwise ? 1 : 0]);
      return (res[4] << 8) | res[5];
    }

    async setEncoder(layer, id = 0, isClockwise = false, keycode = 0) {
      const hi = (keycode >> 8) & 0xFF;
      const lo = keycode & 0xFF;
      return await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_SET_ENCODER, layer, id, isClockwise ? 1 : 0, hi, lo]);
    }

    // --- Dynamic Macro Methods ---
    async getMacroCount() {
      const res = await this.sendCommand([VIA_CMD.MACRO_GET_COUNT]);
      return res[1];
    }

    async getMacroBufferSize() {
      const res = await this.sendCommand([VIA_CMD.MACRO_GET_BUFFER_SIZE]);
      return (res[1] << 8) | res[2];
    }

    async getMacroBuffer() {
      try {
        const totalSize = await this.getMacroBufferSize();
        if (!totalSize || totalSize > 4096) {
          return { bufferSize: 0, data: [] };
        }
        const data = [];
        const CHUNK_SIZE = 28;
        for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
          const size = Math.min(CHUNK_SIZE, totalSize - offset);
          const offHi = (offset >> 8) & 0xFF;
          const offLo = offset & 0xFF;
          const res = await this.sendCommand([VIA_CMD.MACRO_GET_BUFFER, offHi, offLo, size]);
          for (let i = 0; i < size; i++) {
            data.push(res[4 + i]);
          }
        }
        return { bufferSize: totalSize, data };
      } catch (e) {
        return { bufferSize: 0, data: [] };
      }
    }

    async setMacroBuffer(macroObj) {
      if (!macroObj || !Array.isArray(macroObj.data) || macroObj.data.length === 0) return;
      const data = macroObj.data;
      const totalSize = data.length;
      const CHUNK_SIZE = 28;
      for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
        const size = Math.min(CHUNK_SIZE, totalSize - offset);
        const offHi = (offset >> 8) & 0xFF;
        const offLo = offset & 0xFF;
        const chunk = data.slice(offset, offset + size);
        const payload = [VIA_CMD.MACRO_SET_BUFFER, offHi, offLo, size, ...chunk];
        await this.sendCommand(payload);
        await this.sleep(4);
      }
    }

    async resetMacros() {
      return await this.sendCommand([VIA_CMD.MACRO_RESET]);
    }

    // --- RGB Matrix Standard Channel (Channel 3) ---
    async getRGBMatrixValue(valueId) {
      return await this.sendCommand([VIA_CMD.CUSTOM_GET_VALUE, CHANNELS.RGB_MATRIX, valueId]);
    }

    async setRGBMatrixValue(valueId, ...args) {
      return await this.sendCommand([VIA_CMD.CUSTOM_SET_VALUE, CHANNELS.RGB_MATRIX, valueId, ...args]);
    }

    // --- Custom Channel (Channel 1) ---
    async getCustomValue(channel, valueId) {
      const predicate = (data) => {
        return (data[0] === VIA_CMD.CUSTOM_GET_VALUE && data[1] === channel && data[2] === valueId) || data[0] === 0xFF;
      };
      const res = await this.sendCommand([VIA_CMD.CUSTOM_GET_VALUE, channel, valueId], 2000, 2, predicate);
      if (!res || res[0] === 0xFF || res[1] !== channel || res[2] !== valueId) {
        return null;
      }
      return res;
    }

    async setCustomValue(channel, valueId, ...args) {
      return await this.sendCommand([VIA_CMD.CUSTOM_SET_VALUE, channel, valueId, ...args]);
    }

    async saveCustomConfig(channel = CHANNELS.CUSTOM) {
      return await this.sendCommand([VIA_CMD.CUSTOM_SAVE, channel]);
    }

    async getActiveLayer() {
      const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.ACTIVE_LAYER);
      if (!res || res[0] === 0xFF || res[1] !== CHANNELS.CUSTOM || res[2] !== CUSTOM_VAL.ACTIVE_LAYER) {
        return undefined;
      }
      return res[3];
    }

    async getHostLeds() {
      const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.HOST_LEDS);
      if (!res || res[0] === 0xFF || res[1] !== CHANNELS.CUSTOM || res[2] !== CUSTOM_VAL.HOST_LEDS) {
        return null;
      }
      return {
        caps: res[3] === 1,
        num: res[4] === 1,
        scroll: res[5] === 1
      };
    }

    async getFirmwareVersion() {
      try {
        const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LUXQMK_VERSION);
        if (!res || res[0] === 0xFF || res[1] !== CHANNELS.CUSTOM || res[2] !== CUSTOM_VAL.LUXQMK_VERSION) {
          return { major: 0, minor: 0, patch: 0, versionString: "Legacy / Generic VIA", capabilities: {} };
        }
        const major = res[3];
        const minor = res[4];
        const patch = res[5];
        const capFlags = res[6] || 0;
        return {
          major,
          minor,
          patch,
          versionString: `v${major}.${minor}.${patch}`,
          capabilities: {
            reactiveOverlay: (capFlags & 0x01) !== 0,
            directionReverse: (capFlags & 0x02) !== 0,
            logoBadgeLed: (capFlags & 0x04) !== 0,
            winLock: (capFlags & 0x08) !== 0,
            layerLighting: (capFlags & 0x10) !== 0,
            heatmap: (capFlags & 0x20) !== 0
          }
        };
      } catch (e) {
        return { major: 0, minor: 0, patch: 0, versionString: "Legacy / Generic VIA", capabilities: {} };
      }
    }

    async getQMKVersion() {
      try {
        const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.QMK_VERSION);
        if (!res || res[0] === 0xFF || res[1] !== CHANNELS.CUSTOM || res[2] !== CUSTOM_VAL.QMK_VERSION) {
          return "QMK";
        }
        let str = "";
        for (let i = 3; i < res.length; i++) {
          if (res[i] === 0) break;
          str += String.fromCharCode(res[i]);
        }
        return str.trim() || "QMK";
      } catch (e) {
        return "QMK";
      }
    }

    async getDebounceTime() {
      try {
        const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.DEBOUNCE_TIME);
        if (!res || res[0] === 0xFF || res[1] !== CHANNELS.CUSTOM || res[2] !== CUSTOM_VAL.DEBOUNCE_TIME) {
          return 5;
        }
        return res[3];
      } catch (e) {
        return 5;
      }
    }

    async setDebounceTime(ms) {
      await this.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.DEBOUNCE_TIME, parseInt(ms, 10) || 5);
      await this.saveCustomConfig();
    }

    async resetEEPROM() {
      if (!this.isConnected) throw new Error("Device not connected");
      this.log("Sending EEPROM factory reset command (VIA DYNAMIC_KEYMAP_RESET)...", "warning");
      try {
        await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_RESET]);
        this.log("EEPROM factory reset command sent successfully", "success");
      } catch (e) {
        this.log("EEPROM reset error: " + e.message, "error");
        throw e;
      }
    }

    async jumpToBootloader() {
      // QMK VIA standard bootloader jump command
      try {
        await this.sendCommand([0x05, 0xFF]);
      } catch (e) {}
    }
  }

  window.GMMK3Protocol = GMMK3Protocol;
  window.GMMK3_CONSTANTS = {
    VIA_CMD,
    CHANNELS,
    CUSTOM_VAL,
    RGB_MATRIX_VAL,
    KEYBOARD_SPECS
  };
})();
