/**
 * LuxQMK Studio - WebHID Protocol Engine
 * Handles raw 32-byte HID packet exchange via VIA channel.
 */

export const VIA_CMD = {
  GET_PROTOCOL_VERSION: 0x01,
  GET_KEYBOARD_VALUE: 0x02,
  SET_KEYBOARD_VALUE: 0x03,
  DYNAMIC_KEYMAP_GET_KEYCODE: 0x04,
  DYNAMIC_KEYMAP_SET_KEYCODE: 0x05,
  DYNAMIC_KEYMAP_RESET: 0x06,
  CUSTOM_SET_VALUE: 0x07,
  CUSTOM_GET_VALUE: 0x08,
  CUSTOM_SAVE: 0x09,
  EEPROM_RESET: 0x0A,
  BOOTLOADER_JUMP: 0x0B,
  MACRO_GET_COUNT: 0x0C,
  MACRO_GET_BUFFER_SIZE: 0x0D,
  MACRO_GET_BUFFER: 0x0E,
  MACRO_SET_BUFFER: 0x0F,
  MACRO_RESET: 0x10,
  DYNAMIC_KEYMAP_GET_LAYER_COUNT: 0x11,
  DYNAMIC_KEYMAP_GET_BUFFER: 0x12,
  DYNAMIC_KEYMAP_SET_BUFFER: 0x13,
  DYNAMIC_KEYMAP_GET_ENCODER: 0x14,
  DYNAMIC_KEYMAP_SET_ENCODER: 0x15,
} as const;

export const CHANNELS = {
  CUSTOM: 0x01,
  BACKLIGHT: 0x02,
  RGB_MATRIX: 0x03,
} as const;

export const CUSTOM_VAL = {
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
  DEBOUNCE_TIME: 27,
  DIRECT_LIGHTING_ENABLE: 28,
  DIRECT_LIGHTING_BLOCK: 29,
  GRADIENT_PRESET: 33,
  GRADIENT_CUSTOM_COUNT: 34,
  GRADIENT_CUSTOM_STOP: 35,
  EFFECT_DENSITY: 36,
  GRADIENT_SAVE_EEPROM: 37,
  PERKEY_PROFILE_GET_BLOCK: 38,
  PERKEY_PROFILE_SET_BLOCK: 39,
  PERKEY_PROFILE_SAVE_EEPROM: 40,
  PERKEY_PROFILE_ACTIVE: 41,
  RELOAD_EEPROM: 42,
  SIDELIGHT_ENABLE: 43,
  SIDELIGHT_MODE: 44,
  SIDELIGHT_COLOR: 45,
  SIDELIGHT_SPEED: 46,
  SIDELIGHT_GRADIENT: 47,
  SIDELIGHT_REVERSE: 48,
  SIDELIGHT_DENSITY: 49,
  NKRO_STATE: 50,
} as const;

export const RGB_MATRIX_VAL = {
  BRIGHTNESS: 1,
  EFFECT: 2,
  EFFECT_SPEED: 3,
  COLOR: 4,
} as const;

interface PendingRequest {
  resolve: (data: Uint8Array) => void;
  reject: (err: any) => void;
  timer: any;
  predicate?: (data: Uint8Array) => boolean;
}

export class HidProtocol {
  private device: HIDDevice | null = null;
  private pending: PendingRequest | null = null;
  private logCallback?: (msg: string, type?: 'rx' | 'tx' | 'info' | 'error') => void;
  private lock: Promise<any> = Promise.resolve();

  public setLogCallback(cb: (msg: string, type?: 'rx' | 'tx' | 'info' | 'error') => void) {
    this.logCallback = cb;
  }

  public log(msg: string, type: 'rx' | 'tx' | 'info' | 'error' = 'info') {
    if (this.logCallback) {
      this.logCallback(msg, type);
    }
  }

  public sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private reportListener = (event: any) => {
    if (!this.pending) return;
    const data = new Uint8Array(event.data.buffer, event.data.byteOffset, event.data.byteLength);
    if (this.logCallback) {
      const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      this.log(`RX: ${hex}`, 'rx');
    }
    if (this.pending) {
      if (this.pending.predicate && !this.pending.predicate(data)) {
        return;
      }
      const item = this.pending;
      this.pending = null;
      if (item.timer) clearTimeout(item.timer);
      item.resolve(data);
    }
  };

  public setDevice(device: HIDDevice | null) {
    if (this.device) {
      try {
        this.device.removeEventListener('inputreport', this.reportListener);
      } catch (e) {}
    }
    if (this.pending) {
      if (this.pending.timer) clearTimeout(this.pending.timer);
      if (typeof this.pending.reject === 'function') {
        this.pending.reject(new Error('Device disconnected'));
      }
      this.pending = null;
    }
    this.device = device;
    if (this.device) {
      this.device.addEventListener('inputreport', this.reportListener);
    }
  }

  public isConnected(): boolean {
    return this.device !== null && this.device.opened;
  }

  public async sendCommand(
    cmdBuffer: Uint8Array | number[],
    timeoutMs = 3000,
    retries = 2,
    predicate?: (data: Uint8Array) => boolean
  ): Promise<Uint8Array> {
    const currentAction = async (): Promise<Uint8Array> => {
      if (!this.device || !this.device.opened) {
        throw new Error('Device is not connected');
      }

      const packet = new Uint8Array(32);
      for (let i = 0; i < Math.min(cmdBuffer.length, 32); i++) {
        packet[i] = cmdBuffer[i];
      }

      const checkMatch = predicate || ((data: Uint8Array) => {
        return data[0] === packet[0] || data[0] === 0xFF;
      });

      if (this.logCallback) {
        const hex = Array.from(packet).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
        this.log(`TX: ${hex}`, 'tx');
      }

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          if (this.pending && this.pending.timer) {
            clearTimeout(this.pending.timer);
          }
          this.pending = null;

          const responseData = await new Promise<Uint8Array>((resolve, reject) => {
            const timer = setTimeout(() => {
              if (this.pending && this.pending.resolve === resolve) {
                this.pending = null;
              }
              reject(new Error(`HID command timed out (${timeoutMs}ms)`));
            }, timeoutMs);

            this.pending = { resolve, reject, timer, predicate: checkMatch };

            (async () => {
              try {
                await this.device!.sendReport(0x00, packet);
              } catch (err: any) {
                try {
                  await this.device!.sendFeatureReport(0x00, packet);
                } catch (e) {
                  if (this.pending && this.pending.resolve === resolve) {
                    this.pending = null;
                  }
                  clearTimeout(timer);
                  reject(err);
                }
              }
            })();
          });

          return responseData;
        } catch (err: any) {
          if (attempt === retries) {
            throw err;
          }
          await this.sleep(25 * (attempt + 1));
        }
      }
      throw new Error('HID command failed');
    };

    const nextPromise = this.lock.catch(() => {}).then(currentAction);
    this.lock = nextPromise.catch(() => {});
    return nextPromise;
  }

  // Keymap methods
  public async getKeycode(layer: number, row: number, col: number): Promise<number> {
    const res = await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_GET_KEYCODE, layer, row, col]);
    return (res[4] << 8) | res[5];
  }

  public async setKeycode(layer: number, row: number, col: number, keycode: number): Promise<void> {
    await this.sendCommand([
      VIA_CMD.DYNAMIC_KEYMAP_SET_KEYCODE,
      layer,
      row,
      col,
      (keycode >> 8) & 0xFF,
      keycode & 0xFF,
    ]);
  }

  public async getKeymapBuffer(offset: number, size: number): Promise<Uint8Array> {
    const offHi = (offset >> 8) & 0xFF;
    const offLo = offset & 0xFF;
    return await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_GET_BUFFER, offHi, offLo, size]);
  }

  public async readFullKeymap(layers = 3, rows = 14, cols = 8): Promise<Uint8Array> {
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

  public async setKeymapBuffer(offset: number, size: number, bytes: number[] | Uint8Array): Promise<Uint8Array> {
    const offHi = (offset >> 8) & 0xFF;
    const offLo = offset & 0xFF;
    const byteArray = Array.isArray(bytes) ? bytes : Array.from(bytes);
    return await this.sendCommand([VIA_CMD.DYNAMIC_KEYMAP_SET_BUFFER, offHi, offLo, size, ...byteArray]);
  }

  public async writeFullKeymap(
    layers: number[][][],
    rows = 14,
    cols = 8,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    const totalLayers = Math.min(layers.length, 3);
    const totalBytes = totalLayers * rows * cols * 2;
    const fullBuffer = new Uint8Array(totalBytes);
    for (let l = 0; l < totalLayers; l++) {
      const layer = layers[l];
      if (!layer) continue;
      for (let r = 0; r < rows && r < layer.length; r++) {
        const row = layer[r];
        if (!row) continue;
        for (let c = 0; c < cols && c < row.length; c++) {
          const kc = row[c] ?? 0;
          const byteIdx = (l * rows * cols * 2) + (r * cols * 2) + (c * 2);
          fullBuffer[byteIdx] = (kc >> 8) & 0xFF;
          fullBuffer[byteIdx + 1] = kc & 0xFF;
        }
      }
    }

    const CHUNK_SIZE = 28;
    for (let offset = 0; offset < totalBytes; offset += CHUNK_SIZE) {
      const size = Math.min(CHUNK_SIZE, totalBytes - offset);
      const chunk = Array.from(fullBuffer.slice(offset, offset + size));
      await this.setKeymapBuffer(offset, size, chunk);
      if (onProgress) {
        onProgress(Math.round(((offset + size) / totalBytes) * 100));
      }
      await this.sleep(2);
    }
  }

  // Encoder methods
  public async getEncoder(layer: number, index = 0, clockwise = false): Promise<number> {
    const res = await this.sendCommand([
      VIA_CMD.DYNAMIC_KEYMAP_GET_ENCODER,
      layer,
      index,
      clockwise ? 1 : 0,
    ]);
    return (res[4] << 8) | res[5];
  }

  public async setEncoder(layer: number, index = 0, clockwise = false, keycode = 0): Promise<void> {
    await this.sendCommand([
      VIA_CMD.DYNAMIC_KEYMAP_SET_ENCODER,
      layer,
      index,
      clockwise ? 1 : 0,
      (keycode >> 8) & 0xFF,
      keycode & 0xFF,
    ]);
  }

  // Monochromatic Backlight (Channel 2)
  public async getBacklightValue(valueId: number): Promise<number[]> {
    const res = await this.sendCommand(
      [VIA_CMD.CUSTOM_GET_VALUE, CHANNELS.BACKLIGHT, valueId],
      3000,
      2,
      (data) => (data[0] === VIA_CMD.CUSTOM_GET_VALUE && data[1] === CHANNELS.BACKLIGHT && data[2] === valueId) || data[0] === 0xFF
    );
    return Array.from(res.slice(3));
  }

  public async setBacklightValue(valueId: number, ...args: number[]): Promise<void> {
    await this.sendCommand([VIA_CMD.CUSTOM_SET_VALUE, CHANNELS.BACKLIGHT, valueId, ...args]);
  }

  // RGB Matrix (Channel 3)
  public async getRGBMatrixValue(valueId: number): Promise<number[]> {
    const res = await this.sendCommand(
      [VIA_CMD.CUSTOM_GET_VALUE, CHANNELS.RGB_MATRIX, valueId],
      3000,
      2,
      (data) => (data[0] === VIA_CMD.CUSTOM_GET_VALUE && data[1] === CHANNELS.RGB_MATRIX && data[2] === valueId) || data[0] === 0xFF
    );
    return Array.from(res.slice(3));
  }

  public async setRGBMatrixValue(valueId: number, ...args: number[]): Promise<void> {
    await this.sendCommand([VIA_CMD.CUSTOM_SET_VALUE, CHANNELS.RGB_MATRIX, valueId, ...args]);
  }

  // Custom channels
  public async getCustomValue(channel: number, valueId: number, ...args: number[]): Promise<number[]> {
    const res = await this.sendCommand(
      [VIA_CMD.CUSTOM_GET_VALUE, channel, valueId, ...args],
      3000,
      2,
      (data) => (data[0] === VIA_CMD.CUSTOM_GET_VALUE && data[1] === channel && data[2] === valueId) || data[0] === 0xFF
    );
    return Array.from(res.slice(3));
  }

  public async setCustomValue(channel: number, valueId: number, data: number[]): Promise<void> {
    const packet = [VIA_CMD.CUSTOM_SET_VALUE, channel, valueId, ...data];
    await this.sendCommand(packet);
  }

  public async getActiveLayer(): Promise<number | undefined> {
    try {
      const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.ACTIVE_LAYER);
      if (res && res.length > 0) return res[0];
    } catch (e) {}
    return undefined;
  }

  public async getHostLeds(): Promise<{ caps: boolean; num: boolean; scroll: boolean } | null> {
    try {
      const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.HOST_LEDS);
      if (res && res.length >= 3) {
        return {
          caps: res[0] === 1,
          num: res[1] === 1,
          scroll: res[2] === 1,
        };
      }
    } catch (e) {}
    return null;
  }

  public async getFirmwareVersion(): Promise<any> {
    try {
      const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LUXQMK_VERSION);
      if (res && res.length >= 3) {
        return {
          major: res[0],
          minor: res[1],
          patch: res[2],
          versionString: `v${res[0]}.${res[1]}.${res[2]}`,
        };
      }
    } catch (e) {}
    return { major: 0, minor: 0, patch: 0, versionString: 'Legacy / Generic VIA' };
  }

  public async getPerKeyProfile(profileIdx = 0, totalLeds = 144): Promise<Array<{ r: number; g: number; b: number }>> {
    const CHUNK_LEDS = 8;
    const rgbArray: Array<{ r: number; g: number; b: number }> = [];
    const safeTotal = Math.min(144, Math.max(1, totalLeds));

    for (let startLed = 0; startLed < safeTotal; startLed += CHUNK_LEDS) {
      const count = Math.min(CHUNK_LEDS, safeTotal - startLed);
      try {
        const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.PERKEY_PROFILE_GET_BLOCK, profileIdx, startLed, count);
        if (res && res.length >= 3 + (count * 3)) {
          for (let i = 0; i < count; i++) {
            rgbArray.push({
              r: res[3 + (i * 3) + 0],
              g: res[3 + (i * 3) + 1],
              b: res[3 + (i * 3) + 2],
            });
          }
        } else {
          for (let i = 0; i < count; i++) rgbArray.push({ r: 0, g: 0, b: 0 });
        }
      } catch (e) {
        for (let i = 0; i < count; i++) rgbArray.push({ r: 0, g: 0, b: 0 });
      }
    }
    return rgbArray;
  }

  public async setPerKeyProfileBlock(profileIdx: number, startIdx: number, rgbData: number[]): Promise<void> {
    const count = Math.min(8, Math.floor(rgbData.length / 3));
    const triplets = rgbData.slice(0, count * 3);
    const payload = [
      VIA_CMD.CUSTOM_SET_VALUE,
      CHANNELS.CUSTOM,
      CUSTOM_VAL.PERKEY_PROFILE_SET_BLOCK,
      profileIdx,
      startIdx,
      count,
      ...triplets,
    ];
    await this.sendCommand(payload);
  }

  public async setFullPerKeyProfile(profileIdx: number, rgbArray: Array<{ r: number; g: number; b: number }>): Promise<void> {
    const CHUNK_LEDS = 8;
    const totalLeds = Math.min(144, rgbArray.length);

    for (let startLed = 0; startLed < totalLeds; startLed += CHUNK_LEDS) {
      const count = Math.min(CHUNK_LEDS, totalLeds - startLed);
      const triplets: number[] = [];
      for (let i = 0; i < count; i++) {
        const c = rgbArray[startLed + i] || { r: 0, g: 0, b: 0 };
        triplets.push(c.r || 0, c.g || 0, c.b || 0);
      }
      await this.setPerKeyProfileBlock(profileIdx, startLed, triplets);
    }
  }

  public async getSidelightConfig(): Promise<any> {
    try {
      const enRes = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_ENABLE);
      const modeRes = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_MODE);
      const colorRes = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_COLOR);
      const speedRes = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_SPEED);
      const gradRes = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_GRADIENT);
      const revRes = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_REVERSE);
      const densRes = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_DENSITY);

      return {
        enable: enRes && enRes.length > 0 ? enRes[0] === 1 : false,
        mode: modeRes && modeRes.length > 0 ? (modeRes[0] === 0 ? 1 : modeRes[0]) : 1,
        hue: colorRes && colorRes.length > 0 ? colorRes[0] : 0,
        sat: colorRes && colorRes.length > 1 ? colorRes[1] : 255,
        speed: speedRes && speedRes.length > 0 ? speedRes[0] : 128,
        gradient: gradRes && gradRes.length > 0 ? gradRes[0] : 0,
        reverse: revRes && revRes.length > 0 ? revRes[0] === 1 : false,
        density: densRes && densRes.length > 0 ? (densRes[0] || 128) : 128,
      };
    } catch (e) {
      return null;
    }
  }

  public async getNkroState(): Promise<boolean> {
    try {
      const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NKRO_STATE);
      return res && res.length > 0 ? res[0] === 1 : true;
    } catch (e) {
      return true;
    }
  }

  public async setNkroState(enabled: boolean): Promise<void> {
    await this.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NKRO_STATE, [enabled ? 1 : 0]);
  }

  public async getDebounceTime(): Promise<number> {
    try {
      const res = await this.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.DEBOUNCE_TIME);
      return res && res.length > 0 ? res[0] : 5;
    } catch (e) {
      return 5;
    }
  }

  public async setDebounceTime(timeMs: number): Promise<void> {
    await this.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.DEBOUNCE_TIME, [timeMs]);
  }

  public async getMacroBufferSize(): Promise<number> {
    try {
      const res = await this.sendCommand([VIA_CMD.MACRO_GET_BUFFER_SIZE]);
      return (res[1] << 8) | res[2];
    } catch (e) {
      return 0;
    }
  }

  public async getMacroBuffer(): Promise<{ bufferSize: number; data: number[] }> {
    try {
      const totalSize = await this.getMacroBufferSize();
      if (!totalSize || totalSize > 4096) {
        return { bufferSize: 0, data: [] };
      }
      const data: number[] = [];
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

  public async setMacroBuffer(macroObj: { bufferSize?: number; data?: number[] }): Promise<void> {
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

  public async saveCustomConfig(channel: number = CHANNELS.CUSTOM): Promise<void> {
    try {
      await this.sendCommand([VIA_CMD.CUSTOM_SAVE, channel]);
    } catch (e) {}
  }

  public async saveEeprom(): Promise<void> {
    try {
      await this.sendCommand([VIA_CMD.CUSTOM_SAVE, CHANNELS.CUSTOM]);
    } catch (e) {}
    try {
      await this.sendCommand([VIA_CMD.CUSTOM_SAVE, CHANNELS.RGB_MATRIX]);
    } catch (e2) {}
  }

  public async savePerKeyProfileToEEPROM(profileIdx = 0): Promise<void> {
    await this.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.PERKEY_PROFILE_SAVE_EEPROM, [profileIdx]);
  }

  public async reloadEEPROM(channel = CHANNELS.CUSTOM): Promise<void> {
    try {
      await this.sendCommand([0x0A, channel]);
    } catch (e) {}
    try {
      await this.setCustomValue(channel, CUSTOM_VAL.RELOAD_EEPROM, [1]);
    } catch (e2) {}
  }

  public async setDirectLightingEnable(enable: boolean): Promise<void> {
    if (!this.isConnected()) return;
    try {
      await this.sendCommand([VIA_CMD.CUSTOM_SET_VALUE, CHANNELS.CUSTOM, CUSTOM_VAL.DIRECT_LIGHTING_ENABLE, enable ? 1 : 0]);
    } catch (e) {}
  }

  public async sendDirectLightingBlock(startIdx: number, rgbTriplets: number[]): Promise<void> {
    if (!this.device || !this.device.opened || !rgbTriplets || rgbTriplets.length === 0) return;
    const count = Math.floor(rgbTriplets.length / 3);
    const report = new Uint8Array(32);
    report[0] = VIA_CMD.CUSTOM_SET_VALUE;
    report[1] = CHANNELS.CUSTOM;
    report[2] = CUSTOM_VAL.DIRECT_LIGHTING_BLOCK;
    report[3] = startIdx;
    report[4] = count;
    for (let i = 0; i < rgbTriplets.length && (5 + i) < 32; i++) {
      report[5 + i] = rgbTriplets[i];
    }
    try {
      await this.device.sendReport(0x00, report);
    } catch (e) {}
  }

  public async jumpToBootloader(): Promise<void> {
    try {
      await this.sendCommand([VIA_CMD.BOOTLOADER_JUMP], 150, 0);
    } catch (e) {}
    try {
      await this.sendCommand([VIA_CMD.CUSTOM_SET_VALUE, CHANNELS.CUSTOM, 0xFE, 0x01], 150, 0);
    } catch (e) {}
  }

  public async factoryResetEeprom(): Promise<void> {
    await this.sendCommand([VIA_CMD.EEPROM_RESET]);
  }
}

export const hidProtocol = new HidProtocol();
