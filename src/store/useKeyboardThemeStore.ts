import { create } from 'zustand';
import { CASE_THEMES, KEYCAP_THEMES, CaseTheme, KeycapTheme } from '../data/keyboardThemes';

interface KeyboardThemeState {
  caseThemeId: string;
  keycapThemeId: string;
  isDesignModalOpen: boolean;
  activeCaseTheme: CaseTheme;
  activeKeycapTheme: KeycapTheme;
  canvasThemeStyles: React.CSSProperties;

  setCaseThemeId: (id: string) => void;
  setKeycapThemeId: (id: string) => void;
  setDesignModalOpen: (open: boolean) => void;
  resetToDefaults: () => void;

  getActiveCaseTheme: () => CaseTheme;
  getActiveKeycapTheme: () => KeycapTheme;
  getCanvasThemeStyles: () => React.CSSProperties;
}

const STORAGE_KEY = 'luxqmk_keyboard_design_theme';

function computeThemeData(caseId: string, keycapId: string) {
  const caseTheme = CASE_THEMES.find((c) => c.id === caseId) || CASE_THEMES[0];
  const keyTheme = KEYCAP_THEMES.find((k) => k.id === keycapId) || KEYCAP_THEMES[0];
  const styles: React.CSSProperties = {
    // Keyboard Case Styling Variables
    '--keyboard-case-bg': caseTheme.background,
    '--keyboard-case-border': caseTheme.border,
    '--keyboard-case-shadow': caseTheme.boxShadow,

    // Keycap Alpha Styling Variables
    '--key-bg': keyTheme.alphaBg,
    '--key-text': keyTheme.alphaText,
    '--key-subtext': keyTheme.alphaSubtext,
    '--key-border': keyTheme.alphaBorder,
    '--key-bg-hover': keyTheme.alphaHover,
    '--key-custom-text': keyTheme.customText || '#00f0ff',

    // Key Group Modifiers
    '--key-group-mod': keyTheme.modBg,
    '--key-text-mod': keyTheme.modText,
    '--key-border-mod': keyTheme.modBorder,

    // Key Group Function
    '--key-group-func': keyTheme.funcBg,
    '--key-text-func': keyTheme.funcText,
    '--key-border-func': keyTheme.funcBorder || keyTheme.modBorder,

    // Key Group Navigation
    '--key-group-nav': keyTheme.navBg,
    '--key-text-nav': keyTheme.navText,
    '--key-border-nav': keyTheme.navBorder || keyTheme.modBorder,

    // Key Group Number & Numpad
    '--key-group-num': keyTheme.numBg || keyTheme.alphaBg,
    '--key-text-num': keyTheme.numText || keyTheme.alphaText,
    '--key-group-numpad': keyTheme.numpadBg,
    '--key-text-numpad': keyTheme.numpadText,

    // Knob
    '--key-knob-bg': keyTheme.knobBg,
    '--key-knob-border': keyTheme.knobBorder,
  } as React.CSSProperties;

  return {
    caseTheme,
    keyTheme,
    styles,
  };
}

function loadInitialTheme(): { caseThemeId: string; keycapThemeId: string } {
  if (typeof window === 'undefined') {
    return { caseThemeId: 'stealth-black', keycapThemeId: 'dark-stealth' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const caseExists = CASE_THEMES.some((c) => c.id === parsed.caseThemeId);
      const keycapExists = KEYCAP_THEMES.some((k) => k.id === parsed.keycapThemeId);
      return {
        caseThemeId: caseExists ? parsed.caseThemeId : 'stealth-black',
        keycapThemeId: keycapExists ? parsed.keycapThemeId : 'dark-stealth',
      };
    }
  } catch (e) {
    console.error('Failed to load keyboard theme from localStorage:', e);
  }
  return { caseThemeId: 'stealth-black', keycapThemeId: 'dark-stealth' };
}

const initial = loadInitialTheme();
const initialComputed = computeThemeData(initial.caseThemeId, initial.keycapThemeId);

export const useKeyboardThemeStore = create<KeyboardThemeState>((set, get) => {
  const persist = (caseId: string, keycapId: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ caseThemeId: caseId, keycapThemeId: keycapId }));
    } catch (e) {}
  };

  return {
    caseThemeId: initial.caseThemeId,
    keycapThemeId: initial.keycapThemeId,
    isDesignModalOpen: false,
    activeCaseTheme: initialComputed.caseTheme,
    activeKeycapTheme: initialComputed.keyTheme,
    canvasThemeStyles: initialComputed.styles,

    setCaseThemeId: (id: string) => {
      const currentKeycap = get().keycapThemeId;
      const computed = computeThemeData(id, currentKeycap);
      set({
        caseThemeId: id,
        activeCaseTheme: computed.caseTheme,
        activeKeycapTheme: computed.keyTheme,
        canvasThemeStyles: computed.styles,
      });
      persist(id, currentKeycap);
    },

    setKeycapThemeId: (id: string) => {
      const currentCase = get().caseThemeId;
      const computed = computeThemeData(currentCase, id);
      set({
        keycapThemeId: id,
        activeCaseTheme: computed.caseTheme,
        activeKeycapTheme: computed.keyTheme,
        canvasThemeStyles: computed.styles,
      });
      persist(currentCase, id);
    },

    setDesignModalOpen: (open: boolean) => set({ isDesignModalOpen: open }),

    resetToDefaults: () => {
      const computed = computeThemeData('stealth-black', 'dark-stealth');
      set({
        caseThemeId: 'stealth-black',
        keycapThemeId: 'dark-stealth',
        activeCaseTheme: computed.caseTheme,
        activeKeycapTheme: computed.keyTheme,
        canvasThemeStyles: computed.styles,
      });
      persist('stealth-black', 'dark-stealth');
    },

    getActiveCaseTheme: () => get().activeCaseTheme,
    getActiveKeycapTheme: () => get().activeKeycapTheme,
    getCanvasThemeStyles: () => get().canvasThemeStyles,
  };
});

