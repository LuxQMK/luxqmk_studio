import { create } from 'zustand';
import { StudioLightingConfig } from '../types/lighting';
import { visualizerService } from '../core/visualizer-service';

interface VisualizerState {
  config: StudioLightingConfig;
  audioLevels: number[]; // 16 frequency bands for visualizers

  setConfig: (patch: Partial<StudioLightingConfig>) => void;
  toggleStudioLighting: () => void;
  startStudioLighting: () => Promise<void>;
  stopStudioLighting: () => void;
  setAudioLevels: (levels: number[]) => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  config: {
    isRunning: false,
    activeSubTab: 'audio',
    audioSource: 'system_loopback',
    audioMode: 'equalizer',
    audioColorMode: 'rainbow',
    audioDirection: 'bottom_to_top',
    audioSingleColor: '#00ffff',
    audioSensitivity: 1.2,
    audioSpeed: 1.0,
    audioIntensity: 1.0,
    audioSmoothing: 0.82,
    audioFloor: 0.15,

    softwareEffect: 'neonWave',
    softwarePalette: 'rainbow',
    softwareDirection: 'left_to_right',
    softwareSingleColor: '#00ffff',
    softwareSpeed: 1.0,
    softwareIntensity: 1.0,
    softwareFloor: 0.10,

    sidelightCustomEnable: false,
    sidelightMode: 'followMain',
    sidelightPalette: 'rainbow',
    sidelightColor: '#00ffff',
    sidelightSpeed: 1.0,
    sidelightIntensity: 1.0,
  },
  audioLevels: Array(16).fill(0),

  setConfig: (patch) => {
    set((state) => ({ config: { ...state.config, ...patch } }));
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
}));
