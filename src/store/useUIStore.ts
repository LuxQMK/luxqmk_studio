import { create } from 'zustand';

export type ViewTab = 'keymap' | 'macro' | 'encoder' | 'tester' | 'lighting' | 'studio_lighting' | 'backup' | 'settings';
export type LightingSubTab = 'backlight' | 'reactive' | 'winlock' | 'layers' | 'logo';
export type StudioSubTab = 'audio' | 'effects' | 'gif';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UIState {
  activeView: ViewTab;
  lightingSubTab: LightingSubTab;
  studioSubTab: StudioSubTab;
  isAppSettingsOpen: boolean;
  isAboutOpen: boolean;
  isUpdateModalOpen: boolean;
  toasts: ToastMessage[];
  
  setActiveView: (view: ViewTab) => void;
  setLightingSubTab: (tab: LightingSubTab) => void;
  setStudioSubTab: (tab: StudioSubTab) => void;
  setAppSettingsOpen: (open: boolean) => void;
  setAboutOpen: (open: boolean) => void;
  setUpdateModalOpen: (open: boolean) => void;
  showToast: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

function getSavedStudioSubTab(): StudioSubTab {
  if (typeof window === 'undefined') return 'audio';
  try {
    const raw = localStorage.getItem('luxqmk_studio_lighting_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.activeSubTab && (parsed.activeSubTab === 'audio' || parsed.activeSubTab === 'effects' || parsed.activeSubTab === 'gif')) {
        return parsed.activeSubTab;
      }
    }
  } catch (e) {}
  return 'audio';
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'keymap',
  lightingSubTab: 'backlight',
  studioSubTab: getSavedStudioSubTab(),
  isAppSettingsOpen: false,
  isAboutOpen: false,
  isUpdateModalOpen: false,
  toasts: [],

  setActiveView: (view) => set({ activeView: view }),
  setLightingSubTab: (tab) => set({ lightingSubTab: tab }),
  setStudioSubTab: (tab) => set({ studioSubTab: tab }),
  setAppSettingsOpen: (open) => set({ isAppSettingsOpen: open }),
  setAboutOpen: (open) => set({ isAboutOpen: open }),
  setUpdateModalOpen: (open) => set({ isUpdateModalOpen: open }),
  showToast: (text, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, text, type }] }));
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
