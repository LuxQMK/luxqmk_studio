import { create } from 'zustand';
import {
  BacklightConfig,
  SidelightConfig,
  ReactiveConfig,
  WinLockConfig,
  LockIndicatorConfig,
  LayerLightingConfig,
  LogoLocksConfig,
  MonochromeConfig,
  GradientStopItem,
} from '../types/lighting';
import { hidProtocol, CHANNELS, CUSTOM_VAL, RGB_MATRIX_VAL } from '../core/hid-protocol';
import { useDeviceStore } from './useDeviceStore';
import { useUIStore } from './useUIStore';
import { useKeymapStore } from './useKeymapStore';
import { useI18n } from '../i18n';
import { hsvToRgb, hexToHs, hexToRgb } from '../hooks/useLightingVisualizer';
import { getLayoutForPreset } from '../data/layouts';

export const ALL_RGB_EFFECTS = [
  { id: 0, name: 'All Off', isRainbow: false },
  { id: 1, name: 'Solid Color', isRainbow: false },
  { id: 2, name: 'Alphas Mods', isRainbow: false },
  { id: 3, name: 'Gradient Up/Down', isRainbow: false },
  { id: 4, name: 'Gradient Left/Right', isRainbow: false },
  { id: 5, name: 'Breathing', isRainbow: false },
  { id: 6, name: 'Band Sat.', isRainbow: false },
  { id: 7, name: 'Band Val.', isRainbow: false },
  { id: 8, name: 'Pinwheel Sat.', isRainbow: false },
  { id: 9, name: 'Pinwheel Val.', isRainbow: false },
  { id: 10, name: 'Spiral Sat.', isRainbow: false },
  { id: 11, name: 'Spiral Val.', isRainbow: false },
  { id: 12, name: 'Cycle All', isRainbow: true },
  { id: 13, name: 'Cycle Left/Right (Rainbow Wave)', isRainbow: true },
  { id: 14, name: 'Cycle Up/Down', isRainbow: true },
  { id: 15, name: 'Rainbow Moving Chevron', isRainbow: true },
  { id: 16, name: 'Cycle Out/In', isRainbow: true },
  { id: 17, name: 'Cycle Out/In Dual', isRainbow: true },
  { id: 18, name: 'Cycle Pinwheel', isRainbow: true },
  { id: 19, name: 'Cycle Spiral', isRainbow: true },
  { id: 20, name: 'Dual Beacon', isRainbow: true },
  { id: 21, name: 'Rainbow Beacon', isRainbow: true },
  { id: 22, name: 'Rainbow Pinwheels', isRainbow: true },
  { id: 23, name: 'Raindrops', isRainbow: false },
  { id: 24, name: 'Jellybean Raindrops', isRainbow: true },
  { id: 25, name: 'Hue Breathing', isRainbow: false },
  { id: 26, name: 'Hue Pendulum', isRainbow: false },
  { id: 27, name: 'Hue Wave', isRainbow: false },
  { id: 28, name: 'Pixel Rain', isRainbow: true },
  { id: 29, name: 'Pixel Flow', isRainbow: true },
  { id: 30, name: 'Pixel Fractal', isRainbow: true },
  { id: 31, name: 'Digital Rain', isRainbow: false },
  { id: 32, name: 'Riverflow', isRainbow: false },
  { id: 33, name: 'Lux Wave', isRainbow: true },
  { id: 34, name: 'Cycle Dynamic', isRainbow: true },
  { id: 35, name: 'Gradient Cycle (Multi-Stop)', isRainbow: true },
  { id: 36, name: 'Gradient Wave (Multi-Stop)', isRainbow: true },
  { id: 37, name: 'Gradient Spiral (Multi-Stop)', isRainbow: true },
  { id: 38, name: 'Gradient Breathe (Multi-Stop)', isRainbow: true },
  { id: 39, name: 'Profile 1 (FPS)', isRainbow: false, isPerKey: true },
  { id: 40, name: 'Profile 2 (MOBA)', isRainbow: false, isPerKey: true },
  { id: 41, name: 'Profile 3 (MMO)', isRainbow: false, isPerKey: true },
];

export const HARDWARE_GRADIENTS = [
  { id: 0, label: 'Rainbow (Classic Spectrum)' },
  { id: 1, label: 'Cyberpunk (Cyan / Pink / Yellow)' },
  { id: 2, label: 'Synthwave (Indigo / Hot Pink / Orange / Gold)' },
  { id: 3, label: 'Sunset Horizon (Purple / Crimson / Amber)' },
  { id: 4, label: 'Toxic Lime (Acid Lime / Yellow / Neon Green)' },
  { id: 5, label: 'Ocean Breeze (Navy / Azure / Aqua / Sky Blue)' },
  { id: 6, label: 'Fire & Ice (Ice Blue / White / Flame / Crimson)' },
  { id: 7, label: 'Pastel Dream (Lavender / Mint / Peach / Pink)' },
  { id: 8, label: 'Custom Gradient Profile 1 (Hardware EEPROM)' },
  { id: 9, label: 'Custom Gradient Profile 2 (Hardware EEPROM)' },
];

export const COLOR_SWATCHES = [
  '#00ffff', '#ff0055', '#00ff88', '#ffcc00', '#9d00ff', '#ff0000',
  '#0066ff', '#ffffff', '#ff6600', '#00ffcc', '#ff00aa', '#33ff00',
  '#7700ff', '#1a1e29'
];

interface LightingState {
  backlight: BacklightConfig;
  sidelight: SidelightConfig;
  reactive: ReactiveConfig;
  winLock: WinLockConfig;
  capsLock: LockIndicatorConfig;
  numLock: LockIndicatorConfig;
  scrollLock: LockIndicatorConfig;
  layerLighting: LayerLightingConfig;
  logoLocks: LogoLocksConfig;
  monochrome: MonochromeConfig;

  // Per-Key Studio
  activeProfileIndex: number; // 0, 1, 2
  activePaintColor: string;
  selectedLeds: Set<number>;
  perKeyProfiles: Record<number, Record<number, string>>; // profile -> ledIndex -> hex color
  isSimulatingFn: boolean;

  setBacklight: (patch: Partial<BacklightConfig>) => void;
  setSidelight: (patch: Partial<SidelightConfig>) => void;
  setReactive: (patch: Partial<ReactiveConfig>) => void;
  setWinLock: (patch: Partial<WinLockConfig>) => void;
  setCapsLock: (patch: Partial<LockIndicatorConfig>) => void;
  setNumLock: (patch: Partial<LockIndicatorConfig>) => void;
  setScrollLock: (patch: Partial<LockIndicatorConfig>) => void;
  setLayerLighting: (patch: Partial<LayerLightingConfig>) => void;
  setLogoLocks: (patch: Partial<LogoLocksConfig>) => void;
  setMonochrome: (patch: Partial<MonochromeConfig>) => void;

  // Per-Key actions
  setActiveProfileIndex: (idx: number) => void;
  setActivePaintColor: (color: string) => void;
  toggleLedSelection: (ledIndex: number, multi?: boolean) => void;
  setSelectedLeds: (leds: Set<number>) => void;
  paintLed: (ledIndex: number, color?: string) => void;
  fillSelectedLeds: (color?: string) => void;
  clearProfileLeds: () => void;
  selectKeyGroup: (groupName: string) => void;
  applyTemplate: (templateId: string) => void;
  setSimulatingFn: (sim: boolean) => void;

  // Hardware Multi-Stop Gradient Studio
  hardwareGradients: Record<number, GradientStopItem[]>;
  activeHardwareGradientProfile: number; // 0 or 1

  setActiveHardwareGradientProfile: (prof: number) => void;
  setHardwareGradientStop: (prof: number, index: number, patch: Partial<GradientStopItem>) => void;
  addHardwareGradientStop: (prof: number, pos?: number, color?: string) => void;
  deleteHardwareGradientStop: (prof: number, index: number) => void;
  distributeHardwareGradientStops: (prof: number, mode: 'qmk' | 'linear') => void;
  applyHardwareGradientTemplate: (prof: number, stops: GradientStopItem[]) => void;
  saveHardwareGradientToEEPROM: (prof: number) => Promise<void>;
  loadHardwareGradientsFromHardware: () => Promise<void>;

  loadFromHardware: () => Promise<void>;
  saveLightingToHardware: () => Promise<void>;
  discardLightingChanges: () => Promise<void>;
}

function hsToHex(h: number, s: number): string {
  const rgb = hsvToRgb(h, s, 255);
  const r = rgb.r.toString(16).padStart(2, '0');
  const g = rgb.g.toString(16).padStart(2, '0');
  const b = rgb.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

const perKeyPendingBlocks = new Map<number, Set<number>>();
let perKeyThrottleTimer: any = null;

function queuePerKeyBlock(profIdx: number, ledIndex: number) {
  if (!useDeviceStore.getState().isConnected) return;
  const startIdx = Math.floor(ledIndex / 8) * 8;
  if (!perKeyPendingBlocks.has(profIdx)) {
    perKeyPendingBlocks.set(profIdx, new Set());
  }
  perKeyPendingBlocks.get(profIdx)!.add(startIdx);

  if (perKeyThrottleTimer) clearTimeout(perKeyThrottleTimer);
  perKeyThrottleTimer = setTimeout(async () => {
    if (!useDeviceStore.getState().isConnected) return;
    const entries = Array.from(perKeyPendingBlocks.entries());
    perKeyPendingBlocks.clear();

    for (const [pIdx, blockStarts] of entries) {
      const prof = useLightingStore.getState().perKeyProfiles[pIdx] || {};
      for (const startIdx of blockStarts) {
        const triplets: number[] = [];
        for (let i = 0; i < 8; i++) {
          const hex = prof[startIdx + i];
          const rgb = hex ? hexToRgb(hex) : { r: 0, g: 0, b: 0 };
          triplets.push(rgb.r, rgb.g, rgb.b);
        }
        await hidProtocol.setPerKeyProfileBlock(pIdx, startIdx, triplets).catch(() => {});
      }
    }
  }, 40);
}

const hardwareGradientPendingProfiles = new Set<number>();
let hardwareGradientThrottleTimer: any = null;

function queueHardwareGradientUpdate(prof: number) {
  if (!useDeviceStore.getState().isConnected) return;
  hardwareGradientPendingProfiles.add(prof);

  if (hardwareGradientThrottleTimer) clearTimeout(hardwareGradientThrottleTimer);
  hardwareGradientThrottleTimer = setTimeout(async () => {
    if (!useDeviceStore.getState().isConnected) return;
    const profiles = Array.from(hardwareGradientPendingProfiles);
    hardwareGradientPendingProfiles.clear();

    for (const p of profiles) {
      const stops = useLightingStore.getState().hardwareGradients[p] || [];
      if (stops.length < 2) continue;
      try {
        await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_CUSTOM_COUNT, [p, stops.length]);
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          const rgb = hexToRgb(s.color);
          const posByte = Math.max(0, Math.min(255, Math.round(s.pos * 255)));
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_CUSTOM_STOP, [p, i, posByte, rgb.r, rgb.g, rgb.b]);
        }
      } catch (e) {
        // Live streaming error suppressed
      }
    }
  }, 40);
}

export const useLightingStore = create<LightingState>((set, get) => ({
  savedSnapshot: null as any,
  backlight: {
    brightness: 255,
    effect: 13, // Default: Cycle Left/Right (Rainbow Wave)
    speed: 128,
    density: 128,
    color: '#00ffff',
    reverse: false,
    gradientPreset: 0,
  },
  sidelight: {
    customEnable: false,
    effect: 1,
    speed: 128,
    density: 128,
    color: '#00ffff',
    gradientPreset: 0,
    reverse: false,
  },
  reactive: {
    enable: false,
    mode: 1,
    color: '#ff0055',
    speed: 128,
    blend: 0,
  },
  winLock: {
    mode: 0,
    color: '#ffffff',
    isLocked: false,
  },
  capsLock: {
    mode: 0,
    color: '#ffffff',
  },
  numLock: {
    mode: 0,
    color: '#ffffff',
  },
  scrollLock: {
    mode: 0,
    color: '#ffffff',
  },
  layerLighting: {
    enable: true,
    dimLevel: 128,
    layer1Enable: true,
    layer1Color: '#ffffff',
    layer2Enable: false,
    layer2Color: '#00ffff',
    layer3Enable: true,
    layer3Color: '#b400ff',
  },
  logoLocks: {
    mode: 1,
    colorCaps: '#ff0000',
    colorNum: '#001eff',
    colorScroll: '#30ff00',
    colorCapsNum: '#ff3000',
    colorCapsScroll: '#fcff00',
    colorNumScroll: '#00c6ff',
    colorAll: '#ffffff',
  },
  monochrome: {
    enable: true,
    brightness: 255,
    breathing: false,
    tint: '#ffffff',
  },

  activeProfileIndex: 0,
  activePaintColor: '#00ffff',
  selectedLeds: new Set(),
  perKeyProfiles: {
    0: {},
    1: {},
    2: {},
  },
  hardwareGradients: {
    0: [
      { pos: 0.0, color: '#00f0ff' },
      { pos: 0.333, color: '#ff0080' },
      { pos: 0.667, color: '#ffd000' }
    ],
    1: [
      { pos: 0.0, color: '#00f260' },
      { pos: 0.333, color: '#0575e6' },
      { pos: 0.667, color: '#00f2fe' }
    ]
  },
  activeHardwareGradientProfile: 0,
  isSimulatingFn: false,

  setBacklight: (patch) => {
    set((state) => ({ backlight: { ...state.backlight, ...patch } }));
    useDeviceStore.getState().markDirty('lighting');

    if (useDeviceStore.getState().isConnected) {
      const b = get().backlight;
      if (patch.brightness !== undefined) {
        hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.BRIGHTNESS, b.brightness);
      }
      if (patch.effect !== undefined) {
        hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.EFFECT, b.effect);
      }
      if (patch.speed !== undefined) {
        hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.EFFECT_SPEED, b.speed);
      }
      if (patch.color !== undefined) {
        const [h, s] = hexToHs(b.color);
        hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.COLOR, h, s);
      }
      if (patch.reverse !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.RGB_REVERSE, [b.reverse ? 1 : 0]);
      }
      if (patch.density !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.EFFECT_DENSITY, [b.density]);
      }
      if (patch.gradientPreset !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_PRESET, [b.gradientPreset]);
        if (b.gradientPreset >= 8) {
          queueHardwareGradientUpdate(b.gradientPreset - 8);
        }
      }
    }
  },

  setSidelight: (patch) => {
    set((state) => {
      const nextSidelight = { ...state.sidelight, ...patch };
      if (nextSidelight.customEnable && (!nextSidelight.effect || nextSidelight.effect === 0)) {
        nextSidelight.effect = 1;
      }
      return { sidelight: nextSidelight };
    });
    useDeviceStore.getState().markDirty('sidelight');

    if (useDeviceStore.getState().isConnected) {
      const s = get().sidelight;
      if (patch.customEnable !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_ENABLE, [s.customEnable ? 1 : 0]);
        if (s.customEnable) {
          hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_MODE, [s.effect || 1]);
        }
      }
      if (patch.effect !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_MODE, [s.effect]);
      }
      if (patch.speed !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_SPEED, [s.speed]);
      }
      if (patch.color !== undefined) {
        const [h, sat] = hexToHs(s.color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_COLOR, [h, sat]);
      }
      if (patch.gradientPreset !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_GRADIENT, [s.gradientPreset]);
        if (s.gradientPreset >= 8) {
          queueHardwareGradientUpdate(s.gradientPreset - 8);
        }
      }
      if (patch.reverse !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_REVERSE, [s.reverse ? 1 : 0]);
      }
      if (patch.density !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_DENSITY, [s.density]);
      }
    }
  },

  setReactive: (patch) => {
    set((state) => ({ reactive: { ...state.reactive, ...patch } }));
    useDeviceStore.getState().markDirty('reactive');

    if (useDeviceStore.getState().isConnected) {
      const r = get().reactive;
      if (patch.enable !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_ENABLE, [r.enable ? 1 : 0]);
      }
      if (patch.mode !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_MODE, [r.mode]);
      }
      if (patch.speed !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_SPEED, [r.speed]);
      }
      if (patch.color !== undefined) {
        const [h, s] = hexToHs(r.color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_COLOR, [h, s]);
      }
      if (patch.blend !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_BLEND, [r.blend]);
      }
    }
  },

  setWinLock: (patch) => {
    set((state) => ({ winLock: { ...state.winLock, ...patch } }));
    useDeviceStore.getState().markDirty('winlock');

    if (useDeviceStore.getState().isConnected) {
      const w = get().winLock;
      if (patch.mode !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_MODE, [w.mode]);
      }
      if (patch.color !== undefined) {
        const [h, s] = hexToHs(w.color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_COLOR, [h, s]);
      }
      if (patch.isLocked !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_STATE, [w.isLocked ? 1 : 0]);
      }
    }
  },

  setCapsLock: (patch) => {
    set((state) => ({ capsLock: { ...state.capsLock, ...patch } }));
    useDeviceStore.getState().markDirty('capslock');

    if (useDeviceStore.getState().isConnected) {
      const c = get().capsLock;
      if (patch.mode !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.CAPS_LOCK_MODE, [c.mode]);
      }
      if (patch.color !== undefined) {
        const [h, s] = hexToHs(c.color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.CAPS_LOCK_COLOR, [h, s]);
      }
    }
  },

  setNumLock: (patch) => {
    set((state) => ({ numLock: { ...state.numLock, ...patch } }));
    useDeviceStore.getState().markDirty('numlock');

    if (useDeviceStore.getState().isConnected) {
      const n = get().numLock;
      if (patch.mode !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NUM_LOCK_MODE, [n.mode]);
      }
      if (patch.color !== undefined) {
        const [h, s] = hexToHs(n.color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NUM_LOCK_COLOR, [h, s]);
      }
    }
  },

  setScrollLock: (patch) => {
    set((state) => ({ scrollLock: { ...state.scrollLock, ...patch } }));
    useDeviceStore.getState().markDirty('scrolllock');

    if (useDeviceStore.getState().isConnected) {
      const slock = get().scrollLock;
      if (patch.mode !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SCROLL_LOCK_MODE, [slock.mode]);
      }
      if (patch.color !== undefined) {
        const [h, s] = hexToHs(slock.color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SCROLL_LOCK_COLOR, [h, s]);
      }
    }
  },

  setLayerLighting: (patch) => {
    set((state) => ({ layerLighting: { ...state.layerLighting, ...patch } }));
    useDeviceStore.getState().markDirty('layer_lighting');

    if (useDeviceStore.getState().isConnected) {
      const l = get().layerLighting;
      if (patch.enable !== undefined || patch.layer1Enable !== undefined || patch.layer2Enable !== undefined || patch.layer3Enable !== undefined) {
        let mask = 0;
        if (l.enable) {
          mask = 0x01;
          if (l.layer1Enable !== false) mask |= (1 << 1);
          if (l.layer2Enable === true) mask |= (1 << 2);
          if (l.layer3Enable !== false) mask |= (1 << 3);
        }
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_LIGHTING_ENABLE, [mask]);
      }
      if (patch.dimLevel !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_DIM_LEVEL, [l.dimLevel]);
      }
      if (patch.layer1Color !== undefined) {
        const [h, s] = hexToHs(l.layer1Color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_1_COLOR, [h, s]);
      }
      if (patch.layer2Color !== undefined) {
        const [h, s] = hexToHs(l.layer2Color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_2_COLOR, [h, s]);
      }
      if (patch.layer3Color !== undefined) {
        const [h, s] = hexToHs(l.layer3Color);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_3_COLOR, [h, s]);
      }
    }
  },

  setLogoLocks: (patch) => {
    set((state) => ({ logoLocks: { ...state.logoLocks, ...patch } }));
    useDeviceStore.getState().markDirty('logo');

    if (useDeviceStore.getState().isConnected) {
      const ll = get().logoLocks;
      if (patch.mode !== undefined) {
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_MODE, [ll.mode]);
      }
      if (patch.colorCaps !== undefined) {
        const [h, s] = hexToHs(ll.colorCaps);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS, [h, s]);
      }
      if (patch.colorNum !== undefined) {
        const [h, s] = hexToHs(ll.colorNum);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM, [h, s]);
      }
      if (patch.colorScroll !== undefined) {
        const [h, s] = hexToHs(ll.colorScroll);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_SCROLL, [h, s]);
      }
      if (patch.colorCapsNum !== undefined) {
        const [h, s] = hexToHs(ll.colorCapsNum);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_NUM, [h, s]);
      }
      if (patch.colorCapsScroll !== undefined) {
        const [h, s] = hexToHs(ll.colorCapsScroll);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_SCROLL, [h, s]);
      }
      if (patch.colorNumScroll !== undefined) {
        const [h, s] = hexToHs(ll.colorNumScroll);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM_SCROLL, [h, s]);
      }
      if (patch.colorAll !== undefined) {
        const [h, s] = hexToHs(ll.colorAll);
        hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_ALL, [h, s]);
      }
    }
  },

  setMonochrome: (patch) => {
    set((state) => ({ monochrome: { ...state.monochrome, ...patch } }));
    useDeviceStore.getState().markDirty('monochrome');
  },

  setActiveProfileIndex: (idx) => set({ activeProfileIndex: idx, selectedLeds: new Set<number>() }),
  setActivePaintColor: (color) => set({ activePaintColor: color }),
  setSelectedLeds: (leds) => set({ selectedLeds: leds }),
  setSimulatingFn: (sim) => set({ isSimulatingFn: sim }),

  toggleLedSelection: (ledIndex, multi = false) => {
    set((state) => {
      const updated = multi ? new Set<number>(state.selectedLeds) : new Set<number>();
      if (updated.has(ledIndex)) {
        updated.delete(ledIndex);
      } else {
        updated.add(ledIndex);
      }
      return { selectedLeds: updated };
    });
  },

  paintLed: (ledIndex, color) => {
    const { activeProfileIndex, activePaintColor, perKeyProfiles } = get();
    const c = color || activePaintColor;
    const currentProf = { ...perKeyProfiles[activeProfileIndex], [ledIndex]: c };
    set((state) => ({
      perKeyProfiles: {
        ...state.perKeyProfiles,
        [activeProfileIndex]: currentProf,
      },
    }));
    useDeviceStore.getState().markDirty('perkey');
    queuePerKeyBlock(activeProfileIndex, ledIndex);
  },

  fillSelectedLeds: (color) => {
    const { activeProfileIndex, activePaintColor, selectedLeds, perKeyProfiles } = get();
    const c = color || activePaintColor;
    const updated = { ...perKeyProfiles[activeProfileIndex] };
    selectedLeds.forEach((idx) => {
      updated[idx] = c;
      queuePerKeyBlock(activeProfileIndex, idx);
    });
    set((state) => ({
      perKeyProfiles: {
        ...state.perKeyProfiles,
        [activeProfileIndex]: updated,
      },
    }));
    useDeviceStore.getState().markDirty('perkey');
  },

  clearProfileLeds: () => {
    const { activeProfileIndex } = get();
    set((state) => ({
      perKeyProfiles: {
        ...state.perKeyProfiles,
        [activeProfileIndex]: {},
      },
      selectedLeds: new Set(),
    }));
    useDeviceStore.getState().markDirty('perkey');
    if (useDeviceStore.getState().isConnected) {
      const emptyArr = Array.from({ length: 144 }, () => ({ r: 0, g: 0, b: 0 }));
      hidProtocol.setFullPerKeyProfile(activeProfileIndex, emptyArr).catch(() => {});
    }
    useUIStore.getState().showToast(`${useI18n.getState().t('toastClearedProfile')} ${activeProfileIndex + 1}`, 'info');
  },

  selectKeyGroup: (groupName) => {
    const layout = getLayoutForPreset(useKeymapStore.getState().presetLayoutId);
    const newSelected = new Set<number>();
    const grp = groupName.toLowerCase();

    layout.forEach((k, idx) => {
      if ((k as any).isKnob) return;

      switch (grp) {
        case 'all':
          newSelected.add(idx);
          break;
        case 'wasd':
          if (['W', 'A', 'S', 'D'].includes(k.id || k.label || '')) newSelected.add(idx);
          break;
        case 'alpha':
        case 'alphas':
          if (k.group === 'alpha' && !(k as any).isLogo) newSelected.add(idx);
          break;
        case 'mod':
        case 'modifiers':
          if (k.group === 'mod' || ['SPC', 'ENT', 'BSPC', 'TAB', 'CAPS', 'LSFT', 'RSFT', 'LCTL', 'RCTL', 'LALT', 'RALT', 'LWIN'].includes(k.id || k.label || '')) {
            if (!(k as any).isLogo) newSelected.add(idx);
          }
          break;
        case 'num':
        case 'numbers':
          if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'MINS', 'EQL'].includes(k.id || k.label || '')) newSelected.add(idx);
          break;
        case 'numpad':
          if (k.group === 'numpad' || String(k.id || k.label).startsWith('P')) {
            if (!(k as any).isLogo) newSelected.add(idx);
          }
          break;
        case 'nav':
        case 'arrows':
          if (['UP', 'DOWN', 'LEFT', 'RGHT', 'INS', 'DEL', 'HOME', 'END', 'PGUP', 'PGDN'].includes(k.id || k.label || '')) newSelected.add(idx);
          break;
        case 'func':
        case 'function':
          if (['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(k.id || k.label || '')) newSelected.add(idx);
          break;
        case 'logo':
          if ((k as any).isLogo || k.id === 'LOGO_LED') newSelected.add(idx);
          break;
      }
    });

    set({ selectedLeds: newSelected });
    useUIStore.getState().showToast(`${useI18n.getState().t('toastSelectedGroup')}: ${groupName.toUpperCase()} (${newSelected.size} keys)`, 'info');
  },

  setActiveHardwareGradientProfile: (prof) => {
    set({ activeHardwareGradientProfile: prof });
    queueHardwareGradientUpdate(prof);
  },

  setHardwareGradientStop: (prof, index, patch) => {
    const current = get().hardwareGradients[prof] || [];
    const updated = current.map((s, i) => (i === index ? { ...s, ...patch } : s));
    set((state) => ({
      hardwareGradients: {
        ...state.hardwareGradients,
        [prof]: updated
      }
    }));
    useDeviceStore.getState().markDirty('lighting');
    queueHardwareGradientUpdate(prof);
  },

  addHardwareGradientStop: (prof, pos, color) => {
    const current = get().hardwareGradients[prof] || [];
    if (current.length >= 8) return;
    const newPos = pos !== undefined ? pos : 0.5;
    const newColor = color || '#00ffff';
    const updated = [...current, { pos: newPos, color: newColor }];
    set((state) => ({
      hardwareGradients: {
        ...state.hardwareGradients,
        [prof]: updated
      }
    }));
    useDeviceStore.getState().markDirty('lighting');
    queueHardwareGradientUpdate(prof);
  },

  deleteHardwareGradientStop: (prof, index) => {
    const current = get().hardwareGradients[prof] || [];
    if (current.length <= 2) return;
    const updated = current.filter((_, i) => i !== index);
    set((state) => ({
      hardwareGradients: {
        ...state.hardwareGradients,
        [prof]: updated
      }
    }));
    useDeviceStore.getState().markDirty('lighting');
    queueHardwareGradientUpdate(prof);
  },

  distributeHardwareGradientStops: (prof, mode) => {
    const current = get().hardwareGradients[prof] || [];
    if (current.length < 2) return;
    const n = current.length;
    const sorted = [...current].sort((a, b) => a.pos - b.pos);
    const updated = sorted.map((s, idx) => {
      let newPos = 0;
      if (mode === 'qmk') {
        newPos = Math.round((idx / n) * 1000) / 1000;
      } else {
        newPos = Math.round((idx / (n - 1)) * 1000) / 1000;
      }
      return { ...s, pos: Math.max(0, Math.min(1, newPos)) };
    });
    set((state) => ({
      hardwareGradients: {
        ...state.hardwareGradients,
        [prof]: updated
      }
    }));
    useDeviceStore.getState().markDirty('lighting');
    queueHardwareGradientUpdate(prof);
  },

  applyHardwareGradientTemplate: (prof, stops) => {
    set((state) => ({
      hardwareGradients: {
        ...state.hardwareGradients,
        [prof]: JSON.parse(JSON.stringify(stops))
      }
    }));
    useDeviceStore.getState().markDirty('lighting');
    queueHardwareGradientUpdate(prof);
  },

  saveHardwareGradientToEEPROM: async (prof) => {
    if (!useDeviceStore.getState().isConnected) {
      useUIStore.getState().showToast('Keyboard not connected!', 'error');
      return;
    }
    const stops = get().hardwareGradients[prof] || [];
    if (stops.length < 2) return;
    try {
      await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_CUSTOM_COUNT, [prof, stops.length]);
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        const rgb = hexToRgb(s.color);
        const posByte = Math.max(0, Math.min(255, Math.round(s.pos * 255)));
        await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_CUSTOM_STOP, [prof, i, posByte, rgb.r, rgb.g, rgb.b]);
      }
      await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_SAVE_EEPROM, [prof]);
      useUIStore.getState().showToast(useI18n.getState().t('toastGradientSavedToEeprom'), 'success');
    } catch (e: any) {
      useUIStore.getState().showToast(`Error saving gradient: ${e.message}`, 'error');
    }
  },

  loadHardwareGradientsFromHardware: async () => {
    if (!useDeviceStore.getState().isConnected) return;
    try {
      const gradMap: Record<number, GradientStopItem[]> = {};
      for (let prof = 0; prof < 2; prof++) {
        const countRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_CUSTOM_COUNT, prof);
        const count = countRes && countRes.length >= 2 ? countRes[1] : 3;
        const safeCount = Math.max(2, Math.min(8, count));
        const stops: GradientStopItem[] = [];
        for (let s = 0; s < safeCount; s++) {
          const stopRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_CUSTOM_STOP, prof, s);
          if (stopRes && stopRes.length >= 6) {
            const pos = stopRes[2] / 255;
            const r = stopRes[3];
            const g = stopRes[4];
            const b = stopRes[5];
            const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
            stops.push({ pos: Math.round(pos * 1000) / 1000, color: hex });
          } else {
            stops.push({ pos: Math.round((s / safeCount) * 1000) / 1000, color: '#00ffff' });
          }
        }
        gradMap[prof] = stops;
      }
      set({ hardwareGradients: gradMap });
    } catch (e) {}
  },

  applyTemplate: (templateId) => {
    const layout = getLayoutForPreset(useKeymapStore.getState().presetLayoutId);
    const { activeProfileIndex } = get();
    const newProfile: Record<number, string> = {};
    const tpl = templateId.toLowerCase().replace(/^tpl-/, '');

    switch (tpl) {
      case 'fps':
        // Base dark blue/grey
        layout.forEach((k, idx) => { newProfile[idx] = '#0a0d18'; });
        // WASD red, essential gaming keys cyan
        layout.forEach((k, idx) => {
          if (['W', 'A', 'S', 'D'].includes(k.id || k.label || '')) newProfile[idx] = '#ff0033';
          else if (['1', '2', '3', '4', '5', 'R', 'E', 'Q', 'F', 'G', 'C', 'V', 'SPC', 'LSFT', 'LCTL'].includes(k.id || k.label || '')) newProfile[idx] = '#00ffff';
        });
        break;

      case 'moba':
        // Base dark purple
        layout.forEach((k, idx) => { newProfile[idx] = '#100520'; });
        // QWER / D / F neon gold/magenta
        layout.forEach((k, idx) => {
          if (['Q', 'W', 'E', 'R'].includes(k.id || k.label || '')) newProfile[idx] = '#ff00aa';
          else if (['D', 'F'].includes(k.id || k.label || '')) newProfile[idx] = '#ffcc00';
          else if (['1', '2', '3', '4', '5', '6', '7'].includes(k.id || k.label || '')) newProfile[idx] = '#00ffaa';
          else if (['B', 'SPC', 'TAB', 'P'].includes(k.id || k.label || '')) newProfile[idx] = '#00aaff';
        });
        break;

      case 'mmo':
        // Base dark emerald
        layout.forEach((k, idx) => { newProfile[idx] = '#051810'; });
        layout.forEach((k, idx) => {
          if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'MINS', 'EQL'].includes(k.id || k.label || '')) newProfile[idx] = '#00ff88';
          else if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(k.id || k.label || '')) newProfile[idx] = '#00aaff';
          else if (['W', 'A', 'S', 'D'].includes(k.id || k.label || '')) newProfile[idx] = '#ffaa00';
        });
        break;

      case 'racing':
        layout.forEach((k, idx) => { newProfile[idx] = '#0c0c14'; });
        layout.forEach((k, idx) => {
          if ((k.id || k.label) === 'W') newProfile[idx] = '#00ff44'; // Acceleration Green
          else if (['A', 'D'].includes(k.id || k.label || '')) newProfile[idx] = '#ffc800'; // Steering Yellow
          else if ((k.id || k.label) === 'S') newProfile[idx] = '#ff001e'; // Brake Red
          else if ((k.id || k.label) === 'SPC') newProfile[idx] = '#ff7800'; // Handbrake Orange
        });
        break;

      case 'cyberpunk':
        layout.forEach((k, idx) => { newProfile[idx] = '#ff0080'; }); // Hot Pink base
        layout.forEach((k, idx) => {
          if (k.group === 'alpha' && !(k as any).isKnob && !(k as any).isLogo) newProfile[idx] = '#00ffff'; // Neon Cyan
          else if (['UP', 'DOWN', 'LEFT', 'RGHT', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(k.id || k.label || '')) newProfile[idx] = '#ffff00'; // Neon Yellow
        });
        break;

      case 'matrix':
        layout.forEach((k, idx) => { newProfile[idx] = '#00280a'; }); // Deep Green base
        layout.forEach((k, idx) => {
          if (k.group === 'alpha' && !(k as any).isKnob && !(k as any).isLogo) newProfile[idx] = '#00ff3c'; // Bright Matrix Green
        });
        break;

      case 'office':
        layout.forEach((k, idx) => { newProfile[idx] = '#ffffff'; }); // Clean Studio White
        break;

      case 'rainbow':
        layout.forEach((k, idx) => {
          if (!(k as any).isKnob) {
            const qX = (k as any).qmkPoint ? (k as any).qmkPoint[0] : Math.round((k.x / 22.5) * 224);
            const hue = Math.round((qX / 224) * 255) & 0xFF;
            const hex = hsToHex(hue, 255);
            newProfile[idx] = hex;
          }
        });
        break;
    }

    set((state) => ({
      perKeyProfiles: {
        ...state.perKeyProfiles,
        [activeProfileIndex]: newProfile,
      },
      selectedLeds: new Set(),
    }));
    useDeviceStore.getState().markDirty('perkey');

    // If connected, stream to keyboard RAM live
    if (useDeviceStore.getState().isConnected) {
      const rgbArr: Array<{ r: number; g: number; b: number }> = [];
      for (let i = 0; i < 144; i++) {
        const hex = newProfile[i];
        if (hex) rgbArr.push(hexToRgb(hex));
        else rgbArr.push({ r: 0, g: 0, b: 0 });
      }
      hidProtocol.setFullPerKeyProfile(activeProfileIndex, rgbArr).catch((e) => console.warn('Failed to stream template to device:', e));
    }

    useUIStore.getState().showToast(`${useI18n.getState().t('toastAppliedTemplate')}: ${tpl.toUpperCase()}`, 'success');
  },

  loadFromHardware: async () => {
    if (!useDeviceStore.getState().isConnected) return;
    try {
      // 1. RGB Matrix values
      const bRes = await hidProtocol.getRGBMatrixValue(RGB_MATRIX_VAL.BRIGHTNESS);
      const eRes = await hidProtocol.getRGBMatrixValue(RGB_MATRIX_VAL.EFFECT);
      const sRes = await hidProtocol.getRGBMatrixValue(RGB_MATRIX_VAL.EFFECT_SPEED);
      const cRes = await hidProtocol.getRGBMatrixValue(RGB_MATRIX_VAL.COLOR);

      const bri = bRes && bRes.length > 0 ? bRes[0] : 255;
      const eff = eRes && eRes.length > 0 ? eRes[0] : 13;
      const spd = sRes && sRes.length > 0 ? Math.max(10, sRes[0]) : 128;
      const col = cRes && cRes.length >= 2 ? hsToHex(cRes[0], cRes[1]) : '#00ffff';

      // 2. Custom values
      const revRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.RGB_REVERSE);
      const densRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.EFFECT_DENSITY);
      const gradRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_PRESET);

      set((state) => ({
        backlight: {
          ...state.backlight,
          brightness: bri,
          effect: eff,
          speed: spd,
          color: col,
          reverse: revRes && revRes.length > 0 ? revRes[0] === 1 : false,
          density: densRes && densRes.length > 0 ? densRes[0] : 128,
          gradientPreset: gradRes && gradRes.length > 0 ? gradRes[0] : 0,
        },
      }));

      // Sidelight
      try {
        const sConf = await hidProtocol.getSidelightConfig();
        if (sConf) {
          const isEnabled = Boolean(sConf.enable);
          const rawMode = Number(sConf.mode) || 0;
          const safeMode = rawMode === 0 ? 1 : rawMode;
          set((state) => ({
            sidelight: {
              ...state.sidelight,
              customEnable: isEnabled,
              effect: safeMode,
              speed: sConf.speed < 10 ? 128 : sConf.speed,
              color: hsToHex(sConf.hue, sConf.sat),
              gradientPreset: sConf.gradient,
              reverse: Boolean(sConf.reverse),
              density: sConf.density || 128,
            },
          }));
        }
      } catch (e) {}

      // Reactive
      try {
        const rEnRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_ENABLE);
        const rModeRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_MODE);
        const rColRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_COLOR);
        const rSpdRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_SPEED);
        const rBldRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_BLEND);

        set((state) => ({
          reactive: {
            ...state.reactive,
            enable: rEnRes && rEnRes.length > 0 ? rEnRes[0] === 1 : false,
            mode: rModeRes && rModeRes.length > 0 ? rModeRes[0] : 1,
            color: rColRes && rColRes.length >= 2 ? hsToHex(rColRes[0], rColRes[1]) : '#ff0055',
            speed: rSpdRes && rSpdRes.length > 0 ? (rSpdRes[0] < 10 ? 128 : rSpdRes[0]) : 128,
            blend: rBldRes && rBldRes.length > 0 ? rBldRes[0] : 0,
          },
        }));
      } catch (e) {}

      // WinLock
      try {
        const wModeRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_MODE);
        const wColRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_COLOR);
        const wStRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_STATE);

        set((state) => ({
          winLock: {
            ...state.winLock,
            mode: wModeRes && wModeRes.length > 0 ? wModeRes[0] : 0,
            color: wColRes && wColRes.length >= 2 ? hsToHex(wColRes[0], wColRes[1]) : '#ffffff',
            isLocked: wStRes && wStRes.length > 0 ? wStRes[0] === 1 : false,
          },
        }));
      } catch (e) {}

      // Lock Indicators (Caps, Num, Scroll)
      try {
        const capsModeRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.CAPS_LOCK_MODE);
        const capsColRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.CAPS_LOCK_COLOR);
        set((state) => ({
          capsLock: {
            ...state.capsLock,
            mode: capsModeRes && capsModeRes.length > 0 ? capsModeRes[0] : 0,
            color: capsColRes && capsColRes.length >= 2 ? hsToHex(capsColRes[0], capsColRes[1]) : '#ffffff',
          },
        }));
      } catch (e) {}

      try {
        const numModeRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NUM_LOCK_MODE);
        const numColRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NUM_LOCK_COLOR);
        set((state) => ({
          numLock: {
            ...state.numLock,
            mode: numModeRes && numModeRes.length > 0 ? numModeRes[0] : 0,
            color: numColRes && numColRes.length >= 2 ? hsToHex(numColRes[0], numColRes[1]) : '#ffffff',
          },
        }));
      } catch (e) {}

      try {
        const scrollModeRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SCROLL_LOCK_MODE);
        const scrollColRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SCROLL_LOCK_COLOR);
        set((state) => ({
          scrollLock: {
            ...state.scrollLock,
            mode: scrollModeRes && scrollModeRes.length > 0 ? scrollModeRes[0] : 0,
            color: scrollColRes && scrollColRes.length >= 2 ? hsToHex(scrollColRes[0], scrollColRes[1]) : '#ffffff',
          },
        }));
      } catch (e) {}

      // Layer lighting
      try {
        const lEnRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_LIGHTING_ENABLE);
        const lDimRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_DIM_LEVEL);
        const l1Res = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_1_COLOR);
        const l2Res = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_2_COLOR);
        const l3Res = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_3_COLOR);

        const lEnVal = lEnRes && lEnRes.length > 0 ? (lEnRes[0] === 1 ? 0x0B : lEnRes[0]) : 0x0B;
        const isMasterEnabled = (lEnVal & 0x01) !== 0;
        const isL1Enabled = (lEnVal & 0x02) !== 0;
        const isL2Enabled = (lEnVal & 0x04) !== 0;
        const isL3Enabled = (lEnVal & 0x08) !== 0;

        set((state) => ({
          layerLighting: {
            ...state.layerLighting,
            enable: isMasterEnabled,
            layer1Enable: isL1Enabled,
            layer2Enable: isL2Enabled,
            layer3Enable: isL3Enabled,
            dimLevel: lDimRes && lDimRes.length > 0 ? lDimRes[0] : 128,
            layer1Color: l1Res && l1Res.length >= 2 ? hsToHex(l1Res[0], l1Res[1]) : '#ffffff',
            layer2Color: l2Res && l2Res.length >= 2 ? hsToHex(l2Res[0], l2Res[1]) : '#00ffff',
            layer3Color: l3Res && l3Res.length >= 2 ? hsToHex(l3Res[0], l3Res[1]) : '#b400ff',
          },
        }));
      } catch (e) {}

      // Logo locks
      try {
        const logoModeRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_MODE);
        const logoCapsRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS);
        const logoNumRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM);
        const logoScrollRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_SCROLL);
        const logoCapsNumRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_NUM);
        const logoCapsScrollRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS_SCROLL);
        const logoNumScrollRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM_SCROLL);
        const logoAllRes = await hidProtocol.getCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_ALL);

        set((state) => ({
          logoLocks: {
            ...state.logoLocks,
            mode: logoModeRes && logoModeRes.length > 0 ? logoModeRes[0] : 1,
            colorCaps: logoCapsRes && logoCapsRes.length >= 2 ? hsToHex(logoCapsRes[0], logoCapsRes[1]) : '#ff0000',
            colorNum: logoNumRes && logoNumRes.length >= 2 ? hsToHex(logoNumRes[0], logoNumRes[1]) : '#001eff',
            colorScroll: logoScrollRes && logoScrollRes.length >= 2 ? hsToHex(logoScrollRes[0], logoScrollRes[1]) : '#30ff00',
            colorCapsNum: logoCapsNumRes && logoCapsNumRes.length >= 2 ? hsToHex(logoCapsNumRes[0], logoCapsNumRes[1]) : '#ff3000',
            colorCapsScroll: logoCapsScrollRes && logoCapsScrollRes.length >= 2 ? hsToHex(logoCapsScrollRes[0], logoCapsScrollRes[1]) : '#fcff00',
            colorNumScroll: logoNumScrollRes && logoNumScrollRes.length >= 2 ? hsToHex(logoNumScrollRes[0], logoNumScrollRes[1]) : '#00c6ff',
            colorAll: logoAllRes && logoAllRes.length >= 2 ? hsToHex(logoAllRes[0], logoAllRes[1]) : '#ffffff',
          },
        }));
      } catch (e) {}

      // PerKey Profiles
      for (let p = 0; p < 3; p++) {
        try {
          const colors = await hidProtocol.getPerKeyProfile(p, 144);
          if (colors && colors.length > 0) {
            const map: Record<number, string> = {};
            colors.forEach((c, idx) => {
              if (c && (c.r !== 0 || c.g !== 0 || c.b !== 0)) {
                const r = c.r.toString(16).padStart(2, '0');
                const g = c.g.toString(16).padStart(2, '0');
                const b = c.b.toString(16).padStart(2, '0');
                map[idx] = `#${r}${g}${b}`;
              }
            });
            set((state) => ({
              perKeyProfiles: {
                ...state.perKeyProfiles,
                [p]: map,
              },
            }));
          }
        } catch (e) {}
      }

      // Hardware Gradients (Profile 1 & 2)
      try {
        await get().loadHardwareGradientsFromHardware();
      } catch (e) {}

      console.log('Successfully synced hardware lighting config.');
      const snapshot = {
        backlight: JSON.parse(JSON.stringify(get().backlight)),
        sidelight: JSON.parse(JSON.stringify(get().sidelight)),
        reactive: JSON.parse(JSON.stringify(get().reactive)),
        winLock: JSON.parse(JSON.stringify(get().winLock)),
        capsLock: JSON.parse(JSON.stringify(get().capsLock)),
        numLock: JSON.parse(JSON.stringify(get().numLock)),
        scrollLock: JSON.parse(JSON.stringify(get().scrollLock)),
        layerLighting: JSON.parse(JSON.stringify(get().layerLighting)),
        logoLocks: JSON.parse(JSON.stringify(get().logoLocks)),
        perKeyProfiles: JSON.parse(JSON.stringify(get().perKeyProfiles)),
      };
      set({ savedSnapshot: snapshot } as any);
    } catch (err) {
      console.warn('Could not load full lighting configuration from hardware:', err);
    }
  },

  saveLightingToHardware: async () => {
    if (!useDeviceStore.getState().isConnected) return;
    try {
      await hidProtocol.saveEeprom();
      const isPerKey = get().backlight.effect >= 39 && get().backlight.effect <= 41;
      if (isPerKey) {
        await hidProtocol.savePerKeyProfileToEEPROM(get().activeProfileIndex);
      }
      const activeProf = get().activeHardwareGradientProfile;
      if (activeProf !== undefined && (get().backlight.gradientPreset >= 8 || get().sidelight.gradientPreset >= 8)) {
        await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_SAVE_EEPROM, [activeProf]);
      }
      const snapshot = {
        backlight: JSON.parse(JSON.stringify(get().backlight)),
        sidelight: JSON.parse(JSON.stringify(get().sidelight)),
        reactive: JSON.parse(JSON.stringify(get().reactive)),
        winLock: JSON.parse(JSON.stringify(get().winLock)),
        capsLock: JSON.parse(JSON.stringify(get().capsLock)),
        numLock: JSON.parse(JSON.stringify(get().numLock)),
        scrollLock: JSON.parse(JSON.stringify(get().scrollLock)),
        layerLighting: JSON.parse(JSON.stringify(get().layerLighting)),
        logoLocks: JSON.parse(JSON.stringify(get().logoLocks)),
        perKeyProfiles: JSON.parse(JSON.stringify(get().perKeyProfiles)),
      };
      set({ savedSnapshot: snapshot } as any);
      useDeviceStore.getState().clearDirty();
      useUIStore.getState().showToast(useI18n.getState().t('toastSavedToEEPROM'), 'success');
    } catch (err: any) {
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${err.message}`, 'error');
    }
  },

  discardLightingChanges: async () => {
    if (!useDeviceStore.getState().isConnected) return;
    try {
      const snap = (get() as any).savedSnapshot;
      // 1. Tell keyboard firmware to reload EEPROM into RAM
      await hidProtocol.reloadEEPROM();
      await new Promise((r) => setTimeout(r, 60));

      if (snap) {
        // 2. Re-apply backlight parameters live via WebHID
        await hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.EFFECT, snap.backlight.effect);
        await hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.BRIGHTNESS, snap.backlight.brightness);
        await hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.EFFECT_SPEED, snap.backlight.speed);
        const [h, s] = hexToHs(snap.backlight.color);
        await hidProtocol.setRGBMatrixValue(RGB_MATRIX_VAL.COLOR, h, s);
        await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.RGB_REVERSE, [snap.backlight.reverse ? 1 : 0]);
        await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.EFFECT_DENSITY, [snap.backlight.density]);
        await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.GRADIENT_PRESET, [snap.backlight.gradientPreset]);

        // 3. Re-apply sidelights live
        if (snap.sidelight) {
          const [sh, ss] = hexToHs(snap.sidelight.color);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_ENABLE, [snap.sidelight.customEnable ? 1 : 0]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_MODE, [snap.sidelight.effect]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_COLOR, [sh, ss]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_SPEED, [snap.sidelight.speed]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_GRADIENT, [snap.sidelight.gradientPreset]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_REVERSE, [snap.sidelight.reverse ? 1 : 0]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SIDELIGHT_DENSITY, [snap.sidelight.density]);
        }

        // 4. Re-apply reactive live
        if (snap.reactive) {
          const [rh, rs] = hexToHs(snap.reactive.color);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_ENABLE, [snap.reactive.enable ? 1 : 0]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_MODE, [snap.reactive.mode]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_COLOR, [rh, rs]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_SPEED, [snap.reactive.speed]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.REACTIVE_BLEND, [snap.reactive.blend]);
        }

        // 5. Re-apply winLock live
        if (snap.winLock) {
          const [wh, ws] = hexToHs(snap.winLock.color);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_MODE, [snap.winLock.mode]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_COLOR, [wh, ws]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.WIN_LOCK_STATE, [snap.winLock.isLocked ? 1 : 0]);
        }

        // 6. Re-apply lock indicators live
        if (snap.capsLock) {
          const [ch, cs] = hexToHs(snap.capsLock.color);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.CAPS_LOCK_MODE, [snap.capsLock.mode]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.CAPS_LOCK_COLOR, [ch, cs]);
        }
        if (snap.numLock) {
          const [nh, ns] = hexToHs(snap.numLock.color);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NUM_LOCK_MODE, [snap.numLock.mode]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.NUM_LOCK_COLOR, [nh, ns]);
        }
        if (snap.scrollLock) {
          const [sh, ss] = hexToHs(snap.scrollLock.color);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SCROLL_LOCK_MODE, [snap.scrollLock.mode]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.SCROLL_LOCK_COLOR, [sh, ss]);
        }

        // 7. Re-apply layerLighting live
        if (snap.layerLighting) {
          const [l1h, l1s] = hexToHs(snap.layerLighting.layer1Color);
          const [l2h, l2s] = hexToHs(snap.layerLighting.layer2Color);
          const [l3h, l3s] = hexToHs(snap.layerLighting.layer3Color);
          let snapMask = 0;
          if (snap.layerLighting.enable) {
            snapMask = 0x01;
            if (snap.layerLighting.layer1Enable !== false) snapMask |= (1 << 1);
            if (snap.layerLighting.layer2Enable === true) snapMask |= (1 << 2);
            if (snap.layerLighting.layer3Enable !== false) snapMask |= (1 << 3);
          }
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_LIGHTING_ENABLE, [snapMask]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_DIM_LEVEL, [snap.layerLighting.dimLevel]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_1_COLOR, [l1h, l1s]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_2_COLOR, [l2h, l2s]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LAYER_3_COLOR, [l3h, l3s]);
        }

        // 8. Re-apply logo live
        if (snap.logoLocks) {
          const [ch, cs] = hexToHs(snap.logoLocks.colorCaps);
          const [nh, ns] = hexToHs(snap.logoLocks.colorNum);
          const [sch, scs] = hexToHs(snap.logoLocks.colorScroll);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_MODE, [snap.logoLocks.mode]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_CAPS, [ch, cs]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_NUM, [nh, ns]);
          await hidProtocol.setCustomValue(CHANNELS.CUSTOM, CUSTOM_VAL.LOGO_COLOR_SCROLL, [sch, scs]);
        }

        // 9. Re-apply per-key profiles live
        if (snap.perKeyProfiles) {
          for (let p = 0; p < 3; p++) {
            if (snap.perKeyProfiles[p]) {
              const rgbArr: Array<{ r: number; g: number; b: number }> = [];
              for (let i = 0; i < 144; i++) {
                const hex = snap.perKeyProfiles[p][i];
                if (hex) {
                  const rgb = hexToRgb(hex);
                  rgbArr.push(rgb);
                } else {
                  rgbArr.push({ r: 0, g: 0, b: 0 });
                }
              }
              await hidProtocol.setFullPerKeyProfile(p, rgbArr);
            }
          }
        }

        // Restore store state
        set({
          backlight: JSON.parse(JSON.stringify(snap.backlight)),
          sidelight: JSON.parse(JSON.stringify(snap.sidelight)),
          reactive: JSON.parse(JSON.stringify(snap.reactive)),
          winLock: JSON.parse(JSON.stringify(snap.winLock)),
          capsLock: JSON.parse(JSON.stringify(snap.capsLock)),
          numLock: JSON.parse(JSON.stringify(snap.numLock)),
          scrollLock: JSON.parse(JSON.stringify(snap.scrollLock)),
          layerLighting: JSON.parse(JSON.stringify(snap.layerLighting)),
          logoLocks: JSON.parse(JSON.stringify(snap.logoLocks)),
          perKeyProfiles: JSON.parse(JSON.stringify(snap.perKeyProfiles)),
        });
      }
    } catch (err) {
      console.warn('Could not discard lighting changes:', err);
    }
  },
}));
