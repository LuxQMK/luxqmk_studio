import { create } from 'zustand';
import { KeyLayoutItem } from '../types/keyboard';
import { getLayoutForPreset } from '../data/layouts';
import { hidProtocol } from '../core/hid-protocol';
import { useDeviceStore } from './useDeviceStore';
import { useUIStore } from './useUIStore';
import { useI18n } from '../i18n';

const DEFAULT_FL_MAP: Record<string, number> = {
  F1: 0x00A5, // Media Play/Pause
  F2: 0x00A6, // Media Stop
  F3: 0x00A7, // Media Prev
  F4: 0x00A8, // Media Next
  F5: 0x00A9, // Volume Down
  F6: 0x00AA, // Volume Up
  F7: 0x00AB, // Mute
  F8: 0x00AC, // Media Select
  F9: 0x00AD, // Mail
  F10: 0x00AE, // Calculator
  F11: 0x00AF, // My Computer
  F12: 0x0046, // PrintScreen
  O: 0x7E40, // RGB Toggle
  Z: 0x7C04, // RGB Mode -
  X: 0x7C05, // RGB Mode +
  C: 0x7C06, // RGB Hue -
  V: 0x7C07, // RGB Hue +
  LWIN: 0x7B00, // Win Lock
  UP: 0x7C03, // Brightness +
  DOWN: 0x7C02, // Brightness -
  LEFT: 0x7C00, // Speed -
  RGHT: 0x7C01, // Speed +
};

interface KeymapState {
  activeLayer: number; // 0, 1, 2
  selectedKey: KeyLayoutItem | null;
  presetLayoutId: string;
  activeCategory: 'basic' | 'media' | 'macro' | 'layers' | 'special' | 'lighting' | 'custom';
  layerKeymaps: Record<number, Record<string, number>>; // layer -> "row,col" -> keycode
  encoderMappings: Record<number, { CCW: number; CW: number; Press: number }>;

  setActiveLayer: (layer: number) => void;
  setSelectedKey: (key: KeyLayoutItem | null) => void;
  setPresetLayoutId: (presetId: string) => void;
  setActiveCategory: (cat: 'basic' | 'media' | 'macro' | 'layers' | 'special' | 'lighting' | 'custom') => void;
  assignKeycodeToSelected: (keycode: number) => Promise<void>;
  getKeycode: (layer: number, row: number, col: number) => number;
  readAllLayersFromKeyboard: () => Promise<void>;
  readLayerFromKeyboard: (layer: number) => Promise<void>;
  loadViaJson: (jsonString: string) => boolean;
}

export const useKeymapStore = create<KeymapState>((set, get) => ({
  activeLayer: 0,
  selectedKey: null,
  presetLayoutId: 'gmmk3-100-ansi',
  activeCategory: 'basic',
  layerKeymaps: {
    0: {},
    1: {},
    2: {},
  },
  encoderMappings: {
    0: { CCW: 0x00AA, CW: 0x00A9, Press: 0x00A8 },
    1: { CCW: 0x00AA, CW: 0x00A9, Press: 0x0001 },
    2: { CCW: 0x0001, CW: 0x0001, Press: 0x0001 },
  },

  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setSelectedKey: (key) => set({ selectedKey: key }),
  setPresetLayoutId: (presetId) => {
    const isConn = useDeviceStore.getState().isConnected;
    set({
      presetLayoutId: presetId,
      selectedKey: null,
      ...(!isConn ? { layerKeymaps: { 0: {}, 1: {}, 2: {} } } : {}),
    });
  },
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  getKeycode: (layer, row, col) => {
    const keyStr = `${row},${col}`;
    const val = get().layerKeymaps[layer]?.[keyStr];
    if (val !== undefined && val !== null && val !== 0x0000 && val !== 0x0001) return val;

    const keys = getLayoutForPreset(get().presetLayoutId);
    const item = keys.find((k) => k.matrix[0] === row && k.matrix[1] === col);

    if (layer === 0) {
      return (item as any)?.defaultKeycode || 0x0000;
    }

    if (layer === 1 && item?.id && DEFAULT_FL_MAP[item.id]) {
      return DEFAULT_FL_MAP[item.id];
    }

    // Layer 1 and 2 default to KC_TRNS (0x0001) or whatever value was in EEPROM
    return val !== undefined ? val : 0x0001;
  },

  assignKeycodeToSelected: async (keycode: number) => {
    const { selectedKey, activeLayer } = get();
    if (!selectedKey || selectedKey.matrix[0] < 0) return;

    const row = selectedKey.matrix[0];
    const col = selectedKey.matrix[1];
    const keyStr = `${row},${col}`;

    // Update in memory
    set((state) => ({
      layerKeymaps: {
        ...state.layerKeymaps,
        [activeLayer]: {
          ...state.layerKeymaps[activeLayer],
          [keyStr]: keycode,
        },
      },
    }));

    useDeviceStore.getState().markDirty('keymap');

    // Send to hardware if connected
    if (useDeviceStore.getState().isConnected) {
      try {
        await hidProtocol.setKeycode(activeLayer, row, col, keycode);
      } catch (e: any) {
        console.error('Failed to set keycode on hardware:', e);
      }
    }
  },

  readAllLayersFromKeyboard: async () => {
    if (!useDeviceStore.getState().isConnected) return;
    try {
      const rows = 14;
      const cols = 8;
      const layers = 3;

      const buffer = await hidProtocol.readFullKeymap(layers, rows, cols);
      const newLayerKeymaps: Record<number, Record<string, number>> = { 0: {}, 1: {}, 2: {} };

      for (let l = 0; l < layers; l++) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const byteIdx = (l * rows * cols * 2) + (r * cols * 2) + (c * 2);
            const kc = (buffer[byteIdx] << 8) | buffer[byteIdx + 1];
            newLayerKeymaps[l][`${r},${c}`] = kc;
          }
        }
      }

      // Read encoders
      const newEncoderData: Record<number, { CCW: number; CW: number; Press: number }> = {};
      for (let l = 0; l < layers; l++) {
        try {
          const ccw = await hidProtocol.getEncoder(l, 0, false);
          const cw = await hidProtocol.getEncoder(l, 0, true);
          const press = newLayerKeymaps[l]['11,6'] || (l === 0 ? 0x00A8 : 0x0001);
          newEncoderData[l] = { CCW: ccw, CW: cw, Press: press };
        } catch (e) {
          newEncoderData[l] = get().encoderMappings[l] || { CCW: 0x00AA, CW: 0x00A9, Press: 0x00A8 };
        }
      }

      set({
        layerKeymaps: newLayerKeymaps,
        encoderMappings: newEncoderData,
      });

      console.log('Successfully loaded full 3-layer keymap from hardware.');
    } catch (err) {
      console.warn('Could not read full keymap buffer from hardware:', err);
    }
  },

  readLayerFromKeyboard: async (layer: number) => {
    if (!useDeviceStore.getState().isConnected) return;
    const layout = getLayoutForPreset(get().presetLayoutId);
    const updatedMap: Record<string, number> = {};

    for (const key of layout) {
      if (key.matrix[0] >= 0 && key.matrix[1] >= 0) {
        try {
          const kc = await hidProtocol.getKeycode(layer, key.matrix[0], key.matrix[1]);
          updatedMap[`${key.matrix[0]},${key.matrix[1]}`] = kc;
        } catch (e) {}
      }
    }

    set((state) => ({
      layerKeymaps: {
        ...state.layerKeymaps,
        [layer]: {
          ...state.layerKeymaps[layer],
          ...updatedMap,
        },
      },
    }));
  },

  loadViaJson: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.keycodes && Array.isArray(data.keycodes)) {
        // Map VIA keycodes matrix
        useUIStore.getState().showToast(useI18n.getState().t('toastViaLayoutLoaded'), 'success');
        return true;
      }
      useUIStore.getState().showToast(useI18n.getState().t('toastInvalidViaJson'), 'warning');
      return false;
    } catch (e: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${e.message}`, 'error');
      return false;
    }
  },
}));
