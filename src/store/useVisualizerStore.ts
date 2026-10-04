import { create } from 'zustand';
import { StudioLightingConfig, CustomGradientPreset, GradientStopItem } from '../types/lighting';
import { visualizerService } from '../core/visualizer-service';

export const DEFAULT_CUSTOM_GRADIENTS: CustomGradientPreset[] = [
  {
    id: 'custom_grad_sunset',
    name: 'Neon Sunset',
    stops: [
      { pos: 0.0, color: '#ff007f' },
      { pos: 0.333, color: '#7928ca' },
      { pos: 0.667, color: '#00dfd8' }
    ]
  },
  {
    id: 'custom_grad_cyberpunk',
    name: 'Cyberpunk Neon',
    stops: [
      { pos: 0.0, color: '#00f0ff' },
      { pos: 0.333, color: '#ff0080' },
      { pos: 0.667, color: '#ffd000' }
    ]
  },
  {
    id: 'custom_grad_synthwave',
    name: 'Synthwave 80s',
    stops: [
      { pos: 0.0, color: '#4b0082' },
      { pos: 0.25, color: '#ff1493' },
      { pos: 0.5, color: '#ff6400' },
      { pos: 0.75, color: '#ffd700' }
    ]
  },
  {
    id: 'custom_grad_emerald',
    name: 'Emerald Forest',
    stops: [
      { pos: 0.0, color: '#00f260' },
      { pos: 0.333, color: '#0575e6' },
      { pos: 0.667, color: '#00f2fe' }
    ]
  },
  {
    id: 'custom_grad_plasma',
    name: 'Cosmic Plasma',
    stops: [
      { pos: 0.0, color: '#f12711' },
      { pos: 0.333, color: '#f5af19' },
      { pos: 0.667, color: '#8a2387' }
    ]
  }
];

function loadSavedCustomGradients(): CustomGradientPreset[] {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_GRADIENTS;
  try {
    const raw = localStorage.getItem('luxqmk_custom_gradients');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_CUSTOM_GRADIENTS;
}

function persistCustomGradients(gradients: CustomGradientPreset[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('luxqmk_custom_gradients', JSON.stringify(gradients));
    if ((window as any).electronAPI && (window as any).electronAPI.saveUserConfig) {
      (window as any).electronAPI.saveUserConfig({ customGradients: gradients });
    }
  } catch (e) {}
}

interface VisualizerState {
  config: StudioLightingConfig;
  audioLevels: number[]; // 16 frequency bands for visualizers
  customGradients: CustomGradientPreset[];
  activeCustomGradientId: string;

  setConfig: (patch: Partial<StudioLightingConfig>) => void;
  toggleStudioLighting: () => void;
  startStudioLighting: () => Promise<void>;
  stopStudioLighting: () => void;
  setAudioLevels: (levels: number[]) => void;

  // Custom Gradient Preset actions
  addCustomGradient: (name?: string, stops?: GradientStopItem[]) => string;
  updateCustomGradient: (id: string, patch: Partial<CustomGradientPreset>) => void;
  deleteCustomGradient: (id: string) => void;
  duplicateCustomGradient: (id: string) => string;
  distributeStops: (id: string, mode: 'qmk' | 'linear') => void;
  setActiveCustomGradientId: (id: string) => void;
  setCustomGradients: (gradients: CustomGradientPreset[]) => void;
}

const DEFAULT_STUDIO_LIGHTING_CONFIG: StudioLightingConfig = {
  isRunning: false,
  activeSubTab: 'audio',
  audioSource: 'system_loopback',
  audioMode: 'equalizer',
  audioColorStyle: 'spectrum',
  audioColorMode: 'rainbow',
  audioDirection: 'bottom_to_top',
  audioSingleColor: '#00ffff',
  audioSensitivity: 1.2,
  audioSpeed: 1.0,
  audioIntensity: 1.0,
  audioSmoothing: 0.82,
  audioFloor: 0.15,
  audioBackgroundDirection: 'static',

  softwareEffect: 'neonWave',
  softwarePalette: 'rainbow',
  softwareDirection: 'left_to_right',
  softwareSingleColor: '#00ffff',
  softwareSpeed: 1.0,
  softwareIntensity: 1.0,
  softwareFloor: 0.10,

  // GIF Player defaults
  gifFitMode: 'fit',
  gifSpeed: 1.0,
  gifIntensity: 1.0,
  gifContrast: 1.0,
  gifSidelightMode: 'edge',

  sidelightCustomEnable: false,
  sidelightMode: 'followMain',
  sidelightPalette: 'rainbow',
  sidelightColor: '#00ffff',
  sidelightSpeed: 1.0,
  sidelightIntensity: 1.0,
};

function loadSavedStudioConfig(): StudioLightingConfig {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_LIGHTING_CONFIG;
  try {
    const raw = localStorage.getItem('luxqmk_studio_lighting_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_STUDIO_LIGHTING_CONFIG,
          ...parsed,
          isRunning: false // Never auto-start rendering engine on cold launch
        };
      }
    }
  } catch (e) {}
  return DEFAULT_STUDIO_LIGHTING_CONFIG;
}

function persistStudioConfig(config: StudioLightingConfig) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = { ...config, isRunning: false };
    localStorage.setItem('luxqmk_studio_lighting_config', JSON.stringify(toSave));
    if ((window as any).electronAPI && (window as any).electronAPI.saveUserConfig) {
      (window as any).electronAPI.saveUserConfig({ studioLightingConfig: toSave });
    }
  } catch (e) {}
}

const initialGradients = loadSavedCustomGradients();
const initialConfig = loadSavedStudioConfig();

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  config: initialConfig,
  audioLevels: Array(16).fill(0),
  customGradients: initialGradients,
  activeCustomGradientId: initialGradients[0]?.id || 'custom_grad_sunset',

  setConfig: (patch) => {
    set((state) => {
      const updated = { ...state.config, ...patch };
      persistStudioConfig(updated);
      return { config: updated };
    });
  },

  toggleStudioLighting: () => {
    visualizerService.toggle();
  },

  startStudioLighting: async () => {
    await visualizerService.start();
  },

  stopStudioLighting: () => {
    visualizerService.stop();
  },

  setAudioLevels: (levels) => set({ audioLevels: levels }),

  addCustomGradient: (name, stops) => {
    const newId = `custom_grad_${Date.now()}`;
    const newName = name || `Gradient #${get().customGradients.length + 1}`;
    const newStops = stops || [
      { pos: 0.0, color: '#00f0ff' },
      { pos: 0.5, color: '#ff007f' },
      { pos: 1.0, color: '#ffd000' }
    ];
    const newPreset: CustomGradientPreset = {
      id: newId,
      name: newName,
      stops: newStops
    };
    const updated = [...get().customGradients, newPreset];
    set({ customGradients: updated, activeCustomGradientId: newId });
    persistCustomGradients(updated);
    return newId;
  },

  updateCustomGradient: (id, patch) => {
    const updated = get().customGradients.map((g) => {
      if (g.id === id) {
        return { ...g, ...patch };
      }
      return g;
    });
    set({ customGradients: updated });
    persistCustomGradients(updated);
  },

  deleteCustomGradient: (id) => {
    const list = get().customGradients;
    if (list.length <= 1) return; // Keep at least one custom gradient
    const updated = list.filter((g) => g.id !== id);
    const nextActiveId = get().activeCustomGradientId === id ? updated[0].id : get().activeCustomGradientId;
    set({ customGradients: updated, activeCustomGradientId: nextActiveId });
    persistCustomGradients(updated);

    // If current selected palette in config was this gradient, fall back to next
    const curConfig = get().config;
    if (curConfig.softwarePalette === id) {
      set({ config: { ...curConfig, softwarePalette: nextActiveId } });
    }
    if (curConfig.audioColorMode === id) {
      set({ config: { ...curConfig, audioColorMode: nextActiveId } });
    }
    if (curConfig.sidelightPalette === id) {
      set({ config: { ...curConfig, sidelightPalette: nextActiveId } });
    }
  },

  duplicateCustomGradient: (id) => {
    const target = get().customGradients.find((g) => g.id === id) || get().customGradients[0];
    const newId = `custom_grad_${Date.now()}`;
    const newName = `${target.name} (Copy)`;
    const newPreset: CustomGradientPreset = {
      id: newId,
      name: newName,
      stops: JSON.parse(JSON.stringify(target.stops))
    };
    const updated = [...get().customGradients, newPreset];
    set({ customGradients: updated, activeCustomGradientId: newId });
    persistCustomGradients(updated);
    return newId;
  },

  distributeStops: (id, mode) => {
    const target = get().customGradients.find((g) => g.id === id);
    if (!target || !target.stops || target.stops.length < 2) return;
    const n = target.stops.length;
    const sorted = [...target.stops].sort((a, b) => a.pos - b.pos);
    const updatedStops = sorted.map((s, idx) => {
      let newPos = 0;
      if (mode === 'qmk') {
        newPos = Math.round((idx / n) * 1000) / 1000;
      } else {
        newPos = Math.round((idx / (n - 1)) * 1000) / 1000;
      }
      return { ...s, pos: Math.max(0, Math.min(1, newPos)) };
    });
    get().updateCustomGradient(id, { stops: updatedStops });
  },

  setActiveCustomGradientId: (id) => {
    set({ activeCustomGradientId: id });
  },

  setCustomGradients: (gradients) => {
    if (Array.isArray(gradients) && gradients.length > 0) {
      set({ customGradients: gradients, activeCustomGradientId: gradients[0].id });
      persistCustomGradients(gradients);
    }
  }
}));
