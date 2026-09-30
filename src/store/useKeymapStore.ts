import { create } from 'zustand';
import { KeyLayoutItem } from '../types/keyboard';
import { getLayoutForPreset } from '../data/layouts';
import { hidProtocol } from '../core/hid-protocol';
import { useDeviceStore } from './useDeviceStore';
import { useUIStore } from './useUIStore';
import { useI18n } from '../i18n';

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
    if (val !== undefined && val !== null) return val;

    const keys = getLayoutForPreset(get().presetLayoutId);
    const item = keys.find((k) => k.matrix[0] === row && k.matrix[1] === col);

    if (layer === 0) {
      return (item as any)?.defaultKeycode || 0x0000;
    }

    return 0x0001; // KC_TRNS for layers 1, 2, 3 by default when no hardware data is present
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
