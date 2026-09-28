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
  O: 30752, // RGB Toggle (RGB_TOG / 0x7820)
  Z: 30754, // RGB Mode - (RGB_RMOD / 0x7822)
  X: 30753, // RGB Mode + (RGB_MOD / 0x7821)
  C: 30756, // RGB Hue - (RGB_HUD / 0x7824)
  V: 30755, // RGB Hue + (RGB_HUI / 0x7823)
  LWIN: 31765, // Win Lock / Magic GUI Toggle (0x7C15)
  UP: 30759, // Brightness + (RGB_VAI / 0x7827)
  DOWN: 30760, // Brightness - (RGB_VAD / 0x7828)
  LEFT: 30762, // Speed - (RGB_SPD / 0x782A)
  RGHT: 30761, // Speed + (RGB_SPI / 0x7829)
  PGUP: 32257, // Density + (RGB_DEN_INC / 0x7E01)
  PGDN: 32258, // Density - (RGB_DEN_DEC / 0x7E02)
  END: 32260, // Density Reset (RGB_DEN_RST / 0x7E04)
  HOME: 32261, // Gradient Step (RGB_GRAD_STEP / 0x7E05)
  INS: 32262, // Reactive Step (RGB_REACT_STEP / 0x7E06)
  DEL: 32256, // RGB Reverse (RGB_REV / 0x7E00)
};

interface KeymapState {
  activeLayer: number; // 0, 1, 2, 3
  selectedKey: KeyLayoutItem | null;
  presetLayoutId: string;
  activeCategory: 'basic' | 'media' | 'macro' | 'layers' | 'special' | 'lighting' | 'custom';
  layerKeymaps: Record<number, Record<string, number>>; // layer -> "row,col" -> keycode
  encoderMappings: Record<number, { CCW: number; CW: number; Press: number }>;

  setActiveLayer: (layer: number) => void;
  setSelectedKey: (key: KeyLayoutItem | null) => void;
  setPresetLayoutId: (presetId: string) => void;
  setActiveCategory: (cat: 'basic' | 'media' | 'macro' | 'layers' | 'special' | 'lighting' | 'custom') => void;
  assignKeycodeToKey: (layer: number, row: number, col: number, keycode: number) => Promise<void>;
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
    3: {},
  },
  encoderMappings: {
    0: { CCW: 0x00AA, CW: 0x00A9, Press: 0x00A8 },
    1: { CCW: 0x00AA, CW: 0x00A9, Press: 0x0001 },
    2: { CCW: 0x00AA, CW: 0x00A9, Press: 0x00A8 },
    3: { CCW: 0x00AA, CW: 0x00A9, Press: 0x0001 },
  },

  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setSelectedKey: (key) => set({ selectedKey: key }),
  setPresetLayoutId: (presetId) => {
    const isConn = useDeviceStore.getState().isConnected;
    set({
      presetLayoutId: presetId,
      selectedKey: null,
      ...(!isConn ? { layerKeymaps: { 0: {}, 1: {}, 2: {}, 3: {} } } : {}),
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

    if (layer === 2) {
      // Layer 2 is Mac Base -> default to standard base keycode if not remapped
      return (item as any)?.defaultKeycode || 0x0000;
    }

    if (layer === 3 && item?.id && DEFAULT_FL_MAP[item.id]) {
      // Layer 3 is Mac Fn -> default to media/lighting keys or pass-through
      return DEFAULT_FL_MAP[item.id];
    }

    // Default to KC_TRNS (0x0001) or whatever value was in EEPROM
    return val !== undefined ? val : 0x0001;
  },

  assignKeycodeToKey: async (layer: number, row: number, col: number, keycode: number) => {
    if (row < 0 || col < 0) return;
    const keyStr = `${row},${col}`;

    // Update in memory
    set((state) => ({
      layerKeymaps: {
        ...state.layerKeymaps,
        [layer]: {
          ...state.layerKeymaps[layer],
          [keyStr]: keycode,
        },
      },
    }));

    useDeviceStore.getState().markDirty('keymap');

    // Send to hardware if connected
    if (useDeviceStore.getState().isConnected) {
      try {
        await hidProtocol.setKeycode(layer, row, col, keycode);
      } catch (e: any) {
        console.error('Failed to set keycode on hardware:', e);
      }
    }
  },

  assignKeycodeToSelected: async (keycode: number) => {
    const { selectedKey, activeLayer, assignKeycodeToKey } = get();
    if (!selectedKey || selectedKey.matrix[0] < 0) return;
    await assignKeycodeToKey(activeLayer, selectedKey.matrix[0], selectedKey.matrix[1], keycode);
  },

  readAllLayersFromKeyboard: async () => {
    if (!useDeviceStore.getState().isConnected) return;
    try {
      const rows = 14;
      const cols = 8;
      const layers = 4;

      const buffer = await hidProtocol.readFullKeymap(layers, rows, cols);
      const newLayerKeymaps: Record<number, Record<string, number>> = { 0: {}, 1: {}, 2: {}, 3: {} };

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
          const press = newLayerKeymaps[l]['11,6'] || (l === 0 || l === 2 ? 0x00A8 : 0x0001);
          newEncoderData[l] = { CCW: ccw, CW: cw, Press: press };
        } catch (e) {
          newEncoderData[l] = get().encoderMappings[l] || { CCW: 0x00AA, CW: 0x00A9, Press: 0x00A8 };
        }
      }

      set({
        layerKeymaps: newLayerKeymaps,
        encoderMappings: newEncoderData,
      });

      console.log('Successfully loaded full 4-layer keymap from hardware.');
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
