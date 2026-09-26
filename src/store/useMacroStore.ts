import { create } from 'zustand';
import { MacroSlot, MacroBufferUsage } from '../types/macro';
import { useDeviceStore } from './useDeviceStore';
import { useUIStore } from './useUIStore';
import { useI18n } from '../i18n';

// QMK send_string bytecode parser and encoder
export function encodeMacroStringToBytes(str: string): number[] {
  const bytes: number[] = [];
  let i = 0;

  while (i < str.length) {
    if (str[i] === '{') {
      const closeIdx = str.indexOf('}', i);
      if (closeIdx !== -1) {
        const token = str.substring(i + 1, closeIdx);
        // Delay: e.g. {100ms}
        if (/^\d+ms$/i.test(token)) {
          const num = token.replace(/ms/i, '');
          bytes.push(0x01, 0x04);
          for (let c = 0; c < num.length; c++) {
            bytes.push(num.charCodeAt(c));
          }
          bytes.push(0x7c); // '|' delimiter
        }
        // Down mod: e.g. {+KC_LCTRL}
        else if (token.startsWith('+')) {
          bytes.push(0x01, 0x02, getKeyCodeByName(token.substring(1)));
        }
        // Up mod: e.g. {-KC_LCTRL}
        else if (token.startsWith('-')) {
          bytes.push(0x01, 0x03, getKeyCodeByName(token.substring(1)));
        }
        // Single tap: e.g. {KC_ENTER}
        else {
          bytes.push(0x01, 0x01, getKeyCodeByName(token));
        }
        i = closeIdx + 1;
        continue;
      }
    }
    // Plain character
    bytes.push(str.charCodeAt(i));
    i++;
  }

  bytes.push(0x00); // Null terminator
  return bytes;
}

export function decodeBytesToMacroString(bytes: Uint8Array | number[]): string {
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const b = bytes[i];
    if (b === 0x00) break;

    if (b === 0x01) {
      const action = bytes[i + 1];
      if (action === 0x01) {
        // Tap
        const kc = bytes[i + 2];
        result += `{${getKeyNameByCode(kc)}}`;
        i += 3;
        continue;
      } else if (action === 0x02) {
        // Down
        const kc = bytes[i + 2];
        result += `{+${getKeyNameByCode(kc)}}`;
        i += 3;
        continue;
      } else if (action === 0x03) {
        // Up
        const kc = bytes[i + 2];
        result += `{-${getKeyNameByCode(kc)}}`;
        i += 3;
        continue;
      } else if (action === 0x04) {
        // Delay
        i += 2;
        let delayStr = '';
        while (i < bytes.length && bytes[i] !== 0x7c && bytes[i] !== 0x00) {
          delayStr += String.fromCharCode(bytes[i]);
          i++;
        }
        if (i < bytes.length && bytes[i] === 0x7c) i++;
        result += `{${delayStr}ms}`;
        continue;
      }
    }

    result += String.fromCharCode(b);
    i++;
  }

  return result;
}

const COMMON_KEYS: Record<string, number> = {
  KC_A: 4, KC_B: 5, KC_C: 6, KC_D: 7, KC_E: 8, KC_F: 9, KC_G: 10,
  KC_H: 11, KC_I: 12, KC_J: 13, KC_K: 14, KC_L: 15, KC_M: 16, KC_N: 17,
  KC_O: 18, KC_P: 19, KC_Q: 20, KC_R: 21, KC_S: 22, KC_T: 23, KC_U: 24,
  KC_V: 25, KC_W: 26, KC_X: 27, KC_Y: 28, KC_Z: 29,
  KC_1: 30, KC_2: 31, KC_3: 32, KC_4: 33, KC_5: 34, KC_6: 35, KC_7: 36, KC_8: 37, KC_9: 38, KC_0: 39,
  KC_ENTER: 40, KC_ESC: 41, KC_BSPC: 42, KC_TAB: 43, KC_SPACE: 44,
  KC_MINS: 45, KC_EQL: 46, KC_LBRC: 47, KC_RBRC: 48, KC_BSLS: 49,
  KC_SCLN: 51, KC_QUOT: 52, KC_GRV: 53, KC_COMM: 54, KC_DOT: 55, KC_SLSH: 56,
  KC_CAPS: 57, KC_F1: 58, KC_F2: 59, KC_F3: 60, KC_F4: 61, KC_F5: 62, KC_F6: 63,
  KC_F7: 64, KC_F8: 65, KC_F9: 66, KC_F10: 67, KC_F11: 68, KC_F12: 69,
  KC_PSCR: 70, KC_SCRL: 71, KC_PAUS: 72, KC_INS: 73, KC_HOME: 74, KC_PGUP: 75,
  KC_DEL: 76, KC_END: 77, KC_PGDN: 78, KC_RIGHT: 79, KC_LEFT: 80, KC_DOWN: 81, KC_UP: 82,
  KC_LCTRL: 224, KC_LSHIFT: 225, KC_LALT: 226, KC_LGUI: 227,
  KC_RCTRL: 228, KC_RSHIFT: 229, KC_RALT: 230, KC_RGUI: 231,
};

function getKeyCodeByName(name: string): number {
  return COMMON_KEYS[name.toUpperCase()] || 0;
}

function getKeyNameByCode(code: number): string {
  for (const [name, val] of Object.entries(COMMON_KEYS)) {
    if (val === code) return name;
  }
  return `0x${code.toString(16)}`;
}

interface MacroState {
  activeSlotId: number; // 0..15
  isRecording: boolean;
  slots: MacroSlot[];

  setActiveSlotId: (id: number) => void;
  setRecording: (recording: boolean) => void;
  updateActiveMacro: (patch: { name?: string; content?: string }) => void;
  insertSyntaxAtCursor: (syntax: string) => void;
  clearActiveMacro: () => void;
  resetAllMacros: () => void;
  getBufferUsage: () => MacroBufferUsage;
  saveMacrosToKeyboard: () => Promise<void>;
}

const INITIAL_SLOTS: MacroSlot[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  name: `Macro ${i}`,
  content: '',
}));

export const useMacroStore = create<MacroState>((set, get) => ({
  activeSlotId: 0,
  isRecording: false,
  slots: INITIAL_SLOTS,

  setActiveSlotId: (id) => set({ activeSlotId: id }),
  setRecording: (rec) => set({ isRecording: rec }),

  updateActiveMacro: (patch) => {
    const { activeSlotId, slots } = get();
    const updated = slots.map((s) => (s.id === activeSlotId ? { ...s, ...patch } : s));
    set({ slots: updated });
    useDeviceStore.getState().markDirty('macro');
  },

  insertSyntaxAtCursor: (syntax) => {
    const { activeSlotId, slots } = get();
    const cur = slots.find((s) => s.id === activeSlotId);
    if (!cur) return;
    const newContent = (cur.content || '') + syntax;
    get().updateActiveMacro({ content: newContent });
  },

  clearActiveMacro: () => {
    get().updateActiveMacro({ content: '' });
    useUIStore.getState().showToast(`${useI18n.getState().t('toastClearedMacro')} M${get().activeSlotId}`, 'info');
  },

  resetAllMacros: () => {
    set({ slots: INITIAL_SLOTS });
    useDeviceStore.getState().markDirty('macro');
    useUIStore.getState().showToast(useI18n.getState().t('toastAllMacrosReset'), 'warning');
  },

  getBufferUsage: () => {
    const { slots } = get();
    let totalBytes = 0;
    slots.forEach((s) => {
      if (s.content) {
        totalBytes += encodeMacroStringToBytes(s.content).length;
      }
    });
    const maxBytes = 1024;
    return {
      usedBytes: totalBytes,
      maxBytes,
      percentage: Math.min(100, Math.round((totalBytes / maxBytes) * 100)),
    };
  },

  saveMacrosToKeyboard: async () => {
    useDeviceStore.getState().clearDirty('macro');
    useUIStore.getState().showToast(useI18n.getState().t('toastMacrosSaved'), 'success');
  },
}));
