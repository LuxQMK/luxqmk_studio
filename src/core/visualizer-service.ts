/**
 * LuxQMK Studio - 60 FPS Real-Time Software Lighting & Audio Visualizer Engine
 * High-performance audio loopback and procedural RGB matrix streaming engine.
 * Supports:
 * - Web Audio API / WASAPI Loopback (7 Dynamic Audio Modes)
 * - 30+ Real-Time PC Animation Engines with 6 Spatial Directions
 * - 10 Curated Color Palettes + Single Color Custom Mapping
 * - Precise Keycap Center Coordinate Geometry (Fixes Spacebar, Right Alt, Modifiers)
 * - Ambient Floor Glow & Intensity Scaling
 * - Direct WebHID Frame Streaming to Hardware (30 FPS)
 */

import { hidProtocol } from './hid-protocol';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { useKeymapStore } from '../store/useKeymapStore';
import { useUIStore } from '../store/useUIStore';
import { useI18n } from '../i18n';
import { getLayoutForPreset } from '../data/layouts';
import { KeyLayoutItem } from '../types/keyboard';
import { HARDWARE_LIGHTING_PROFILES, getHardwareLedIndex } from '../data/led-mappings';

export interface PaletteStop {
  pos: number;
  rgb: [number, number, number];
}

export const PALETTES: Record<string, PaletteStop[] | null> = {
  rainbow: null, // Dynamic HSV Rainbow
  cyberpunk: [
    { pos: 0.0, rgb: [0, 240, 255] },      // Electric Cyan #00F0FF (0%)
    { pos: 0.333, rgb: [255, 0, 85] },     // Neon Pink #FF0055 (33.3%)
    { pos: 0.667, rgb: [255, 208, 0] }     // Cyber Amber #FFD000 (66.7%)
  ],
  vaporwave: [
    { pos: 0.0, rgb: [155, 81, 224] },     // Pastel Violet #9B51E0 (0%)
    { pos: 0.333, rgb: [255, 117, 151] },  // Sunset Pink #FF7597 (33.3%)
    { pos: 0.667, rgb: [0, 229, 255] }     // Pastel Cyan #00E5FF (66.7%)
  ],
  fire_ember: [
    { pos: 0.0, rgb: [255, 30, 0] },       // Magma Crimson #FF1E00 (0%)
    { pos: 0.333, rgb: [255, 119, 0] },    // Ember Orange #FF7700 (33.3%)
    { pos: 0.667, rgb: [255, 221, 0] }     // Gold Flame #FFDD00 (66.7%)
  ],
  ocean_abyss: [
    { pos: 0.0, rgb: [0, 34, 68] },        // Deep Navy #002244 (0%)
    { pos: 0.25, rgb: [0, 102, 255] },     // Azure #0066FF (25%)
    { pos: 0.5, rgb: [0, 255, 255] },      // Electric Cyan #00FFFF (50%)
    { pos: 0.75, rgb: [0, 255, 176] }      // Seafoam Aqua #00FFB0 (75%)
  ],
  matrix_code: [
    { pos: 0.0, rgb: [0, 255, 102] },      // Phosphor Green #00FF66 (0%)
    { pos: 0.333, rgb: [57, 255, 20] },    // Cyber Lime #39FF14 (33.3%)
    { pos: 0.667, rgb: [0, 143, 17] }      // Deep Emerald #008F11 (66.7%)
  ],
  synthwave: [
    { pos: 0.0, rgb: [138, 43, 226] },     // Blue Violet #8A2BE2 (0%)
    { pos: 0.25, rgb: [255, 20, 147] },    // Hot Pink #FF1493 (25%)
    { pos: 0.5, rgb: [255, 100, 0] },      // Neon Orange (50%)
    { pos: 0.75, rgb: [255, 204, 0] }      // Sunburst Gold #FFCC00 (75%)
  ],
  ice_glacier: [
    { pos: 0.0, rgb: [0, 51, 102] },       // Arctic Deep Blue #003366 (0%)
    { pos: 0.333, rgb: [112, 214, 255] },  // Glacier Ice Blue #70D6FF (33.3%)
    { pos: 0.667, rgb: [224, 247, 250] }   // Polar White Frost #E0F7FA (66.7%)
  ],
  toxic_radiation: [
    { pos: 0.0, rgb: [166, 255, 0] },      // Acid Lime #A6FF00 (0%)
    { pos: 0.333, rgb: [243, 255, 0] },    // Toxic Yellow #F3FF00 (33.3%)
    { pos: 0.667, rgb: [0, 229, 58] }      // Radioactive Green #00E53A (66.7%)
  ],
  singleColor: null
};

export function hsvToRgb(hByte: number, sByte: number = 255, vByte: number = 255): [number, number, number] {
  const normH = (((hByte % 256) + 256) % 256) / 256;
  const h = normH * 360;
  const s = Math.max(0, Math.min(255, sByte)) / 255;
  const v = Math.max(0, Math.min(255, vByte)) / 255;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return [
    Math.max(0, Math.min(255, Math.round((r + m) * 255))),
    Math.max(0, Math.min(255, Math.round((g + m) * 255))),
    Math.max(0, Math.min(255, Math.round((b + m) * 255)))
  ];
}

export function samplePaletteRgb(
  paletteName: string,
  factor: number,
  customSingleRgb?: [number, number, number]
): [number, number, number] {
  if (paletteName === 'singleColor' && customSingleRgb) {
    return customSingleRgb;
  }
  const safeFactor = Number.isFinite(factor) ? factor : 0;
  const f = ((safeFactor % 1) + 1) % 1;

  let stops: PaletteStop[] | null = null;

  if (paletteName.startsWith('custom_grad_') || paletteName === 'custom_gradient') {
    const customList = useVisualizerStore.getState().customGradients || [];
    let customPreset = customList.find((g) => g.id === paletteName);
    if (!customPreset && paletteName === 'custom_gradient') {
      const activeId = useVisualizerStore.getState().activeCustomGradientId;
      customPreset = customList.find((g) => g.id === activeId) || customList[0];
    }
    if (customPreset && customPreset.stops && customPreset.stops.length > 0) {
      stops = customPreset.stops
        .slice()
        .sort((a, b) => a.pos - b.pos)
        .map((s) => ({
          pos: Math.max(0, Math.min(1, s.pos)),
          rgb: hexToRgbList(s.color)
        }));
    }
  } else if (PALETTES[paletteName]) {
    stops = PALETTES[paletteName];
  }

  if (paletteName === 'rainbow' || !stops || stops.length === 0) {
    return hsvToRgb(Math.round(f * 255), 255, 255);
  }

  const s0 = stops[0];
  const sLast = stops[stops.length - 1];

  if (f <= s0.pos) {
    const wrapSpan = (1.0 - sLast.pos) + s0.pos;
    if (wrapSpan === 0) return s0.rgb;
    const progress = Math.max(0, Math.min(1, (f + (1.0 - sLast.pos)) / wrapSpan));
    return [
      Math.max(0, Math.min(255, Math.round(sLast.rgb[0] + (s0.rgb[0] - sLast.rgb[0]) * progress))),
      Math.max(0, Math.min(255, Math.round(sLast.rgb[1] + (s0.rgb[1] - sLast.rgb[1]) * progress))),
      Math.max(0, Math.min(255, Math.round(sLast.rgb[2] + (s0.rgb[2] - sLast.rgb[2]) * progress)))
    ];
  }
  if (f >= sLast.pos) {
    const wrapSpan = (1.0 - sLast.pos) + s0.pos;
    if (wrapSpan === 0) return sLast.rgb;
    const progress = Math.max(0, Math.min(1, (f - sLast.pos) / wrapSpan));
    return [
      Math.max(0, Math.min(255, Math.round(sLast.rgb[0] + (s0.rgb[0] - sLast.rgb[0]) * progress))),
      Math.max(0, Math.min(255, Math.round(sLast.rgb[1] + (s0.rgb[1] - sLast.rgb[1]) * progress))),
      Math.max(0, Math.min(255, Math.round(sLast.rgb[2] + (s0.rgb[2] - sLast.rgb[2]) * progress)))
    ];
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (f >= s1.pos && f <= s2.pos) {
      const span = s2.pos - s1.pos || 1;
      const t = Math.max(0, Math.min(1, (f - s1.pos) / span));
      return [
        Math.max(0, Math.min(255, Math.round(s1.rgb[0] + (s2.rgb[0] - s1.rgb[0]) * t))),
        Math.max(0, Math.min(255, Math.round(s1.rgb[1] + (s2.rgb[1] - s1.rgb[1]) * t))),
        Math.max(0, Math.min(255, Math.round(s1.rgb[2] + (s2.rgb[2] - s1.rgb[2]) * t)))
      ];
    }
  }
  return stops[0].rgb;
}

export function hexToRgbList(hex: string): [number, number, number] {
  let c = (hex || '#ffffff').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  return [
    parseInt(c.substring(0, 2), 16) || 0,
    parseInt(c.substring(2, 4), 16) || 0,
    parseInt(c.substring(4, 6), 16) || 0
  ];
}

export function lerpColor(rgb1: [number, number, number], rgb2: [number, number, number], t: number): [number, number, number] {
  const clampedT = Math.max(0, Math.min(1, t));
  return [
    Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * clampedT),
    Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * clampedT),
    Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * clampedT),
  ];
}

export function getDirectedCoordinate(x: number, y: number, dir: string, maxX: number = 22.5, maxY: number = 5.5) {
  const normX = Math.max(0, Math.min(1, x / (maxX || 1)));
  const normY = Math.max(0, Math.min(1, y / (maxY || 1)));
  const centerX = maxX / 2;
  const centerY = maxY / 2;
  const distCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
  const normDist = Math.min(1, distCenter / (maxDist || 1));

  switch (dir) {
    case 'left_to_right':
      return { primary: normX, secondary: normY, dist: normDist };
    case 'right_to_left':
      return { primary: 1 - normX, secondary: normY, dist: normDist };
    case 'bottom_to_top':
      return { primary: 1 - normY, secondary: normX, dist: normDist };
    case 'top_to_bottom':
      return { primary: normY, secondary: normX, dist: normDist };
    case 'center_out':
      return { primary: normDist, secondary: normDist, dist: normDist };
    case 'perimeter_in':
      return { primary: 1 - normDist, secondary: 1 - normDist, dist: 1 - normDist };
    default:
      return { primary: normX, secondary: normY, dist: normDist };
  }
}

interface KeyGeometry {
  id: string;
  matrix?: [number, number];
  hardwareLedIndex?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  qmkX: number;
  qmkY: number;
  dx: number;
  dy: number;
  dist: number;
  isLogo: boolean;
  isKnob: boolean;
  group?: string;
  el?: HTMLElement | null;
  curRgb: { r: number; g: number; b: number };
}

class VisualizerEngineService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private bgTimer: any = null;

  public isRunning: boolean = false;
  private isRestartingAudio: boolean = false;
  private deviceChangeDebounceTimer: any = null;
  private lastAudioRestartTime: number = 0;
  private dataArray: Uint8Array = new Uint8Array(128);
  public frequencyBands: Float32Array = new Float32Array(16);

  public bassEnergy: number = 0;
  private bassHistory: number[] = [];
  public isBeat: boolean = false;
  public beatDecay: number = 0;

  private isHardwareStreaming: boolean = false;
  private lastHardwareStreamTime: number = 0;

  // Geometry Cache
  private cachedKeys: KeyGeometry[] = [];
  private cachedLayoutId: string = '';
  private maxX: number = 22.5;
  private maxY: number = 5.5;

  // Procedural states
  private particles: Array<{ x: number; y: number; vx: number; vy: number; hue: number; radius: number }> = [];
  private matrixDrops: Array<{ x: number; y: number; speed: number; length: number }> = [];
  private starfield: Array<{ x: number; y: number; vx: number; vy: number; brightness: number; colorOffset: number }> = [];
  private warpStars: Array<{ angle: number; dist: number; speed: number; colorOffset: number }> = [];
  private raindropsCache: Map<string, { offset: number; time: number }> = new Map();

  constructor() {
    this._initProcedurals();
    this._bindVisibility();
    this._bindDeviceEvents();
  }

  private _initProcedurals() {
    this.particles = [];
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: Math.random() * 23,
        y: Math.random() * 6,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.06,
        hue: Math.floor(Math.random() * 256),
        radius: 1.5 + Math.random() * 2.0
      });
    }

    this.matrixDrops = [];
    for (let c = 0; c < 24; c++) {
      this.matrixDrops.push({
        x: c,
        y: Math.random() * -12,
        speed: 0.08 + Math.random() * 0.14,
        length: 3 + Math.floor(Math.random() * 5)
      });
    }

    this.starfield = [];
    for (let i = 0; i < 30; i++) {
      this.starfield.push({
        x: Math.random() * 23,
        y: Math.random() * 6,
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        brightness: Math.random() * 0.5,
        colorOffset: Math.random()
      });
    }

    this.warpStars = [];
    for (let i = 0; i < 40; i++) {
      this.warpStars.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 14,
        speed: 0.05 + Math.random() * 0.15,
        colorOffset: Math.random()
      });
    }
  }

  private _bindVisibility() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (!this.isRunning) return;
      if (document.hidden) {
        if (this.animFrameId) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
        if (this.bgTimer) clearInterval(this.bgTimer);
        this.bgTimer = setInterval(() => this._tick(performance.now()), 33);
      } else {
        if (this.bgTimer) {
          clearInterval(this.bgTimer);
          this.bgTimer = null;
        }
        if (!this.animFrameId) {
          this.animFrameId = requestAnimationFrame((t) => this._tick(t));
        }
      }
    });
  }

  /**
   * Listens for Windows / OS audio output and input device changes.
   * Seamlessly re-binds WASAPI loopback and user audio streams on active endpoint switch.
   */
  private _bindDeviceEvents() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === 'function') {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        console.log('[AudioVisualizer] Audio output / input device change detected by OS.');
        if (this.deviceChangeDebounceTimer) {
          clearTimeout(this.deviceChangeDebounceTimer);
        }
        this.deviceChangeDebounceTimer = setTimeout(() => {
          const activeTab = useUIStore.getState().studioSubTab;
          if (this.isRunning && activeTab === 'audio') {
            this.restartAudioStream();
          }
        }, 350);
      });
    }
  }

  public rebuildKeyGeometry(presetId: string): void {
    const layout = getLayoutForPreset(presetId);
    let maxX = 0;
    let maxY = 0;
    layout.forEach((k) => {
      const rX = k.x + (k.w || 1);
      const rY = k.y + (k.h || 1);
      if (rX > maxX) maxX = rX;
      if (rY > maxY) maxY = rY;
    });

    this.maxX = maxX || 22.5;
    this.maxY = maxY || 5.5;

    // Anchor: Key P center or physical board midpoint
    const keyP = layout.find((k) => k.id === 'P' || k.label === 'P');
    let centerQmkX = 109;
    let centerQmkY = 27;
    if (keyP) {
      const pKeyW = keyP.w || 1;
      const pKeyH = keyP.h || 1;
      const pCenterX = keyP.x + pKeyW / 2;
      const pCenterY = keyP.y + pKeyH / 2;
      centerQmkX = (keyP as any).qmkPoint ? (keyP as any).qmkPoint[0] : Math.round((pCenterX / this.maxX) * 224);
      centerQmkY = (keyP as any).qmkPoint ? (keyP as any).qmkPoint[1] : Math.round((pCenterY / this.maxY) * 64);
    }

    this.cachedKeys = layout.map((k) => {
      const w = k.w || 1;
      const h = k.h || 1;
      const centerX = k.x + w / 2;
      const centerY = k.y + h / 2;

      // Exact QMK matrix coordinates (Center Anchor)
      const qmkX = (k as any).qmkPoint ? (k as any).qmkPoint[0] : Math.round((centerX / this.maxX) * 224);
      const qmkY = (k as any).qmkPoint ? (k as any).qmkPoint[1] : Math.round((centerY / this.maxY) * 64);
      const dx = qmkX - centerQmkX;
      const dy = qmkY - centerQmkY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const keyId = k.id || ((k as any).isLogo ? 'LOGO_LED' : (k.label || `k-${k.matrix?.[0]}-${k.matrix?.[1]}`));

      let hardwareLedIndex: number | undefined;
      if ((k as any).isLogo) {
        hardwareLedIndex = HARDWARE_LIGHTING_PROFILES[presetId]?.logoLedIndex;
      } else if (k.matrix) {
        hardwareLedIndex = getHardwareLedIndex(presetId, k.matrix[0], k.matrix[1]);
      }

      return {
        id: keyId,
        matrix: k.matrix,
        hardwareLedIndex,
        x: k.x,
        y: k.y,
        w,
        h,
        centerX,
        centerY,
        qmkX,
        qmkY,
        dx,
        dy,
        dist,
        isLogo: !!(k as any).isLogo,
        isKnob: !!(k as any).isKnob,
        group: k.group,
        el: null,
        curRgb: { r: 0, g: 0, b: 0 }
      };
    });

    this.cachedLayoutId = presetId;
  }

  private _ensureGeometry(): KeyGeometry[] {
    const presetId = useKeymapStore.getState().presetLayoutId || 'gmmk3-100-ansi';
    if (this.cachedKeys.length === 0 || this.cachedLayoutId !== presetId) {
      this.rebuildKeyGeometry(presetId);
    }

    // Attach DOM element handles if needed
    for (let i = 0; i < this.cachedKeys.length; i++) {
      const k = this.cachedKeys[i];
      if (!k.el || !document.contains(k.el)) {
        k.el = document.querySelector<HTMLElement>(`#studioLightingKeyboardCanvas [data-key-id="${k.id}"]`);
      }
    }
    return this.cachedKeys;
  }

  public async enumerateAudioSources(): Promise<Array<{ id: string; label: string }>> {
    const list: Array<{ id: string; label: string }> = [
      { id: 'system_loopback', label: 'System Audio Output (WASAPI / Loopback)' }
    ];
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((d) => d.kind === 'audioinput');
        inputs.forEach((dev, idx) => {
          list.push({
            id: dev.deviceId,
            label: dev.label || `Audio Input / Microphone ${idx + 1}`
          });
        });
      } catch (e) {
        console.warn('Could not enumerate audio devices:', e);
      }
    }
    return list;
  }

  public async start(): Promise<void> {
    const activeTab = useUIStore.getState().studioSubTab;
    if (this.isRunning) {
      if (activeTab === 'audio' && (!this.mediaStream || this.mediaStream.getAudioTracks().every((t) => t.readyState === 'ended'))) {
        await this.restartAudioStream();
      }
      return;
    }
    try {
      if (activeTab === 'audio') {
        await this._startAudioStream();
      }

      this.isRunning = true;
      useVisualizerStore.getState().setConfig({ isRunning: true });

      if (hidProtocol.isConnected()) {
        await hidProtocol.setDirectLightingEnable(true);
      }

      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = requestAnimationFrame((t) => this._tick(t));

      useUIStore.getState().showToast(useI18n.getState().t('toastStudioLightingStarted'), 'success');
    } catch (err: any) {
      console.warn('Could not start studio lighting:', err);
      this.stop();
      useUIStore.getState().showToast(`${useI18n.getState().t('toastErrorPrefix')}: ${err.message || err}`, 'error');
    }
  }

  public stop(): void {
    this.isRunning = false;
    useVisualizerStore.getState().setConfig({ isRunning: false });

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.bgTimer) {
      clearInterval(this.bgTimer);
      this.bgTimer = null;
    }

    if (hidProtocol.isConnected()) {
      hidProtocol.setDirectLightingEnable(false);
    }

    this._stopAudioStream();
    this._resetDomElements();
    useUIStore.getState().showToast(useI18n.getState().t('toastStudioLightingStopped'), 'info');
  }

  public toggle(): void {
    if (this.isRunning) this.stop();
    else this.start();
  }

  /**
   * Gracefully restarts audio capture without interrupting the 60 FPS matrix renderer.
   * Reconnects to current default Windows endpoint.
   */
  public async restartAudioStream(): Promise<void> {
    if (this.isRestartingAudio) return;
    this.isRestartingAudio = true;
    this.lastAudioRestartTime = performance.now();

    try {
      console.log('[AudioVisualizer] Seamlessly reconnecting audio capture stream...');
      this._stopAudioStream();
      // Allow OS / Windows audio routing 200ms to settle
      await new Promise((resolve) => setTimeout(resolve, 200));

      const activeTab = useUIStore.getState().studioSubTab;
      if (this.isRunning && activeTab === 'audio') {
        await this._startAudioStream();
        console.log('[AudioVisualizer] Audio capture reconnected successfully.');
      }
    } catch (err) {
      console.warn('[AudioVisualizer] Could not restart audio capture stream:', err);
    } finally {
      this.isRestartingAudio = false;
    }
  }

  private async _startAudioStream(): Promise<void> {
    const config = useVisualizerStore.getState().config;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio API not supported in this browser');

    this.audioCtx = new AudioContextClass();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.audioCtx.onstatechange = () => {
      if (this.audioCtx && this.audioCtx.state === 'suspended' && this.isRunning) {
        this.audioCtx.resume().catch(() => {});
      }
    };

    if (config.audioSource === 'system_loopback') {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        try {
          this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
          this.mediaStream.getVideoTracks().forEach((t) => t.stop());
        } catch (displayErr) {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            },
            video: false
          });
        }
      } else {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      }
    } else {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: config.audioSource },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });
    }

    if (!this.mediaStream || this.mediaStream.getAudioTracks().length === 0) {
      throw new Error('No audio stream track found');
    }

    // Attach lifecycle listeners to audio tracks to detect Windows device changes or stream closure
    this.mediaStream.getAudioTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        console.log('[AudioVisualizer] Audio track ended (device switched or disconnected).');
        const activeTab = useUIStore.getState().studioSubTab;
        if (this.isRunning && activeTab === 'audio') {
          this.restartAudioStream();
        }
      });
      track.addEventListener('mute', () => {
        console.log('[AudioVisualizer] Audio track muted by OS.');
      });
      track.addEventListener('unmute', () => {
        console.log('[AudioVisualizer] Audio track unmuted by OS.');
      });
    });

    this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = config.audioSmoothing || 0.82;

    this.sourceNode.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  private _stopAudioStream(): void {
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (e) {}
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }
  }

  private _tick(now: number): void {
    if (!this.isRunning) return;

    try {
      const activeTab = useUIStore.getState().studioSubTab;
      if (activeTab === 'audio' && this.analyser) {
        this._processAudioAnalysis();
        this._renderAudioFrame(now);
      } else {
        this._renderSoftwareFxFrame(now);
      }

      this._streamToHardware(now);
    } catch (err) {
      console.error('Error during studio lighting frame render:', err);
    }

    if (this.isRunning && !document.hidden && typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame((t) => this._tick(t));
    }
  }

  private _processAudioAnalysis(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    const tracks = this.mediaStream ? this.mediaStream.getAudioTracks() : [];
    const isEnded = tracks.length === 0 || tracks.some((t) => t.readyState === 'ended');
    if (isEnded && this.isRunning && !this.isRestartingAudio) {
      const now = performance.now();
      if (now - this.lastAudioRestartTime > 2500) {
        this.restartAudioStream();
        return;
      }
    }

    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(this.dataArray as any);

    const config = useVisualizerStore.getState().config;
    const binCount = this.analyser.frequencyBinCount;
    const step = Math.floor(binCount / 16);

    const levels: number[] = [];
    for (let i = 0; i < 16; i++) {
      let sum = 0;
      const start = i * step;
      const end = start + step;
      for (let b = start; b < end; b++) {
        sum += this.dataArray[b];
      }
      const avg = (sum / step) * (config.audioSensitivity || 1.2);
      const val = Math.min(255, avg);
      this.frequencyBands[i] = val;
      levels.push(val);
    }
    useVisualizerStore.getState().setAudioLevels(levels);

    let bassSum = 0;
    for (let b = 0; b < 4; b++) {
      bassSum += this.dataArray[b];
    }
    const curBass = (bassSum / 4) * (config.audioSensitivity || 1.2);
    this.bassHistory.push(curBass);
    if (this.bassHistory.length > 30) this.bassHistory.shift();

    const avgBass = this.bassHistory.reduce((a, v) => a + v, 0) / this.bassHistory.length;
    if (curBass > avgBass * 1.35 && curBass > 85) {
      this.isBeat = true;
      this.beatDecay = 255;
    } else {
      this.isBeat = false;
      this.beatDecay = Math.max(0, this.beatDecay - 16);
    }
    this.bassEnergy = curBass;
  }

  private _renderAudioFrame(now: number): void {
    const keys = this._ensureGeometry();
    const config = useVisualizerStore.getState().config;
    const palette = config.audioColorMode || 'rainbow';
    const direction = config.audioDirection || 'bottom_to_top';
    const speed = config.audioSpeed || 1.0;
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor || 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, direction, this.maxX, this.maxY);
      let rgb: [number, number, number] = [0, 0, 0];
      let brightFactor = floor;

      switch (config.audioMode) {
        case 'equalizer': {
          const bandIdx = Math.min(15, Math.max(0, Math.floor(dirCoord.secondary * 16)));
          const bandVal = this.frequencyBands[bandIdx] || 0;
          const heightThreshold = dirCoord.primary * 255;

          if (bandVal > 10 && bandVal >= heightThreshold) {
            const normVal = bandVal / 255;
            brightFactor = (floor + (1 - floor) * normVal) * intensity;
            rgb = samplePaletteRgb(palette, dirCoord.secondary - now * 0.0005 * speed, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, dirCoord.secondary - now * 0.0005 * speed, customRgb);
          }
          break;
        }

        case 'bassPulse': {
          const shockwave = Math.max(0, Math.sin((dirCoord.dist * 12) - (now * 0.008 * speed)));
          const pulseNorm = (this.beatDecay / 255) * Math.pow(shockwave, 2);
          if (pulseNorm > 0.02) {
            brightFactor = (floor + (1 - floor) * pulseNorm) * intensity;
            rgb = samplePaletteRgb(palette, dirCoord.dist * 0.8 - now * 0.0008 * speed, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, dirCoord.dist * 0.8, customRgb);
          }
          break;
        }

        case 'vuMeter': {
          const isRight = k.centerX > (this.maxX / 2);
          const halfW = (this.maxX / 2) || 1;
          const band = isRight ? this.frequencyBands[12] : this.frequencyBands[3];
          const xNorm = isRight ? ((k.centerX - halfW) / halfW) : ((halfW - k.centerX) / halfW);
          if (band > 12 && (xNorm * 255) <= band) {
            brightFactor = 1.0 * intensity;
            rgb = samplePaletteRgb(palette, xNorm, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, xNorm, customRgb);
          }
          break;
        }

        case 'audioWave': {
          const waveProg = ((now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          const diff = Math.abs(dirCoord.primary - waveProg);
          const wrappedDiff = Math.min(diff, 1 - diff);
          if (wrappedDiff < 0.12 && this.bassEnergy > 10) {
            const ripple = Math.pow(1 - (wrappedDiff / 0.12), 2);
            const waveNorm = Math.min(1.0, ripple * (this.bassEnergy / 180));
            brightFactor = (floor + (1 - floor) * waveNorm) * intensity;
            rgb = samplePaletteRgb(palette, dirCoord.primary - now * 0.0006 * speed, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, dirCoord.primary, customRgb);
          }
          break;
        }

        case 'spectrumHeatmap': {
          const lowW = (this.frequencyBands[1] + this.frequencyBands[2]) / 510;
          const highW = (this.frequencyBands[12] + this.frequencyBands[13]) / 510;
          const energyNorm = Math.min(1.0, lowW * (1 - dirCoord.primary) + highW * dirCoord.primary);
          brightFactor = (floor + (1 - floor) * energyNorm) * intensity;
          rgb = samplePaletteRgb(palette, dirCoord.primary - now * 0.0004 * speed, customRgb);
          break;
        }

        case 'starfieldBeats': {
          const beatBoost = 1 + (this.bassEnergy / 255);
          const starPhase = ((now * 0.0005 * speed * beatBoost + dirCoord.dist * 0.5) % 1.0 + 1.0) % 1.0;
          brightFactor = (floor + (1 - floor) * (this.bassEnergy / 255)) * intensity;
          rgb = samplePaletteRgb(palette, starPhase, customRgb);
          break;
        }

        case 'voiceAura': {
          const aura = Math.sin(now * 0.003 * speed + dirCoord.dist * 4.0);
          const auraNorm = Math.max(0, aura) * (this.frequencyBands[6] / 255);
          brightFactor = (floor + (1 - floor) * auraNorm) * intensity;
          rgb = samplePaletteRgb(palette, dirCoord.dist + now * 0.0002, customRgb);
          break;
        }

        default: {
          const phase = ((dirCoord.primary + now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = (floor + (1 - floor) * (this.bassEnergy / 255)) * intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }
      }

      this._applyKeyStyle(k, rgb[0], rgb[1], rgb[2], brightFactor);
    }

    this._renderSidelightDom(now, config);
  }

  private _renderSoftwareFxFrame(now: number): void {
    const keys = this._ensureGeometry();
    const config = useVisualizerStore.getState().config;
    const preset = config.softwareEffect || 'neonWave';
    const palette = config.softwarePalette || 'rainbow';
    const direction = config.softwareDirection || 'left_to_right';
    const speed = config.softwareSpeed || 1.0;
    const intensity = config.softwareIntensity || 1.0;
    const floor = config.softwareFloor || 0.10;
    const customRgb = hexToRgbList(config.softwareSingleColor || '#00ffff');

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, direction, this.maxX, this.maxY);
      let rgb: [number, number, number] = [0, 0, 0];
      let brightFactor = intensity;

      switch (preset) {
        // --- Signature PC Effects ---
        case 'neonWave': {
          const phase = ((dirCoord.primary - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          const waveSin = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
          brightFactor = (floor + (1 - floor) * waveSin) * intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'matrixRain': {
          const colIdx = Math.floor(k.centerX) % 24;
          const drop = this.matrixDrops[colIdx] || { y: 0, speed: 0.1, length: 4 };
          const curY = (drop.y + now * 0.008 * speed * drop.speed * 8) % (this.maxY + 8);
          const distFromDrop = k.centerY - curY;
          if (distFromDrop >= 0 && distFromDrop < drop.length) {
            const headGlow = distFromDrop === 0 ? 1.0 : (1.0 - distFromDrop / drop.length);
            brightFactor = (floor + (1 - floor) * headGlow) * intensity;
            rgb = distFromDrop === 0 ? [220, 255, 220] : samplePaletteRgb(palette === 'rainbow' ? 'matrix_code' : palette, 0.3, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = palette === 'rainbow' ? [0, 60, 20] : samplePaletteRgb(palette, 0.05, customRgb);
          }
          break;
        }

        case 'particleStorm': {
          let nearestDist = 999;
          let particleHue = 0;
          for (let p = 0; p < this.particles.length; p++) {
            const pt = this.particles[p];
            const pX = ((pt.x + pt.vx * now * 0.05 * speed) % 24 + 24) % 24;
            const pY = ((pt.y + pt.vy * now * 0.05 * speed) % 6 + 6) % 6;
            const d = Math.sqrt(Math.pow(k.centerX - pX, 2) + Math.pow(k.centerY - pY, 2));
            if (d < nearestDist) {
              nearestDist = d;
              particleHue = pt.hue;
            }
          }
          if (nearestDist < 2.5) {
            const glow = Math.pow(1 - nearestDist / 2.5, 2);
            brightFactor = (floor + (1 - floor) * glow) * intensity;
            rgb = samplePaletteRgb(palette, particleHue / 255, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, 0, customRgb);
          }
          break;
        }

        case 'aurora': {
          const wave1 = Math.sin((k.centerX * 0.25) + (now * 0.0012 * speed));
          const wave2 = Math.cos((k.centerY * 0.45) - (now * 0.0016 * speed));
          const combined = (wave1 + wave2 + 2.0) / 4.0;
          brightFactor = (floor + (1 - floor) * combined) * intensity;
          rgb = samplePaletteRgb(palette, combined, customRgb);
          break;
        }

        case 'pulseBloom': {
          const pulsePhase = ((now * 0.0015 * speed) % 1.0 + 1.0) % 1.0;
          const wave = Math.max(0, Math.sin((dirCoord.dist * 6) - (now * 0.006 * speed)));
          brightFactor = (floor + (1 - floor) * Math.pow(wave, 2)) * intensity;
          rgb = samplePaletteRgb(palette, pulsePhase + dirCoord.dist * 0.5, customRgb);
          break;
        }

        case 'fireEmber': {
          // Dynamic upward-rising turbulent flame & ember simulation
          const flameProgress = now * 0.0025 * speed;
          const flameY = k.centerY / (this.maxY || 1);
          const flameX = k.centerX / (this.maxX || 1);

          // Multi-frequency flame turbulence
          const wave1 = Math.sin(flameX * 7.0 + flameProgress * 2.5);
          const wave2 = Math.cos(flameX * 4.0 - flameProgress * 3.2 + flameY * 3.5);
          const sparkNoise = Math.sin(k.centerX * 11.0 + now * 0.012 * speed) * Math.cos(k.centerY * 7.5 - now * 0.014 * speed);

          const heat = Math.max(0, (1.0 - flameY * 0.85) + (wave1 * 0.18 + wave2 * 0.18) + (sparkNoise * 0.12));
          const clampedHeat = Math.max(0, Math.min(1.0, heat));

          brightFactor = (floor + (1 - floor) * Math.pow(clampedHeat, 1.3)) * intensity;
          const targetPal = (palette === 'rainbow' || !PALETTES[palette]) ? 'fire_ember' : palette;
          const flameColorPos = ((1.0 - clampedHeat * 0.85) + flameProgress * 0.08) % 1.0;
          rgb = samplePaletteRgb(targetPal, flameColorPos, customRgb);
          break;
        }

        case 'hyperspaceWarp': {
          const centerX = this.maxX / 2;
          const centerY = this.maxY / 2;
          const dx = k.centerX - centerX;
          const dy = k.centerY - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY) || 1;
          const normDist = distFromCenter / maxRadius;
          const angle = Math.atan2(dy, dx); // -PI..PI
          const normAngle = (angle + Math.PI) / (Math.PI * 2);

          // Hyper-speed warp rings flying outward from the center
          const warpSpeed = now * 0.004 * speed;
          const warpRings = ((normDist * 3.5 - warpSpeed) % 1.0 + 1.0) % 1.0;
          const streak = Math.pow(Math.sin(warpRings * Math.PI), 4);

          // Rotating stellar streaks
          const starStreak = 0.5 + 0.5 * Math.sin(angle * 6 + warpSpeed * 1.5);
          const combinedGlow = Math.max(0, Math.min(1.0, streak * 0.8 + starStreak * 0.35 * normDist));

          brightFactor = (floor + (1 - floor) * combinedGlow) * intensity;
          const colorPhase = ((normAngle + normDist * 0.5 + now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          rgb = samplePaletteRgb(palette, colorPhase, customRgb);
          break;
        }

        // --- QMK Cycling & Radial ---
        case 'qmk_cycle_all': {
          const phase = ((now * 0.0004 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_left_right': {
          const phase = ((dirCoord.primary + now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_up_down': {
          const phase = ((dirCoord.primary + now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_rainbow_chevron': {
          const chevron = Math.abs(k.centerY - (this.maxY / 2)) * 0.5 + k.centerX * 0.1;
          const phase = ((chevron - now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_out_in': {
          const phase = ((dirCoord.dist * 1.5 - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_out_in_dual': {
          const dxDual = (this.maxX / 4) - Math.abs(k.centerX - (this.maxX / 2));
          const dyDual = k.centerY - (this.maxY / 2);
          const distDual = Math.sqrt(dxDual * dxDual + dyDual * dyDual);
          const phase = ((distDual * 0.4 - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_pinwheel': {
          const angle = Math.atan2(k.centerY - (this.maxY / 2), k.centerX - (this.maxX / 2));
          const phase = (((angle + Math.PI) / (Math.PI * 2) + now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_spiral': {
          const angle = Math.atan2(k.centerY - (this.maxY / 2), k.centerX - (this.maxX / 2));
          const phase = ((dirCoord.dist * 1.2 + (angle / (Math.PI * 2)) - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_dual_beacon': {
          const angleBeam = now * 0.001 * speed;
          const dx = k.centerX - (this.maxX / 2);
          const dy = k.centerY - (this.maxY / 2);
          const halfX = (this.maxX / 2) || 1;
          const proj = (dy * Math.cos(angleBeam) + dx * Math.sin(angleBeam)) / halfX;
          const phase = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_rainbow_beacon': {
          const angleBeam = now * 0.001 * speed;
          const dx = k.centerX - (this.maxX / 2);
          const dy = k.centerY - (this.maxY / 2);
          const halfX = (this.maxX / 2) || 1;
          const proj = (dy * 2 * Math.cos(angleBeam) + dx * 2 * Math.sin(angleBeam)) / halfX;
          const phase = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_rainbow_pinwheels': {
          const angleBeam = now * 0.001 * speed;
          const halfX = (this.maxX / 2) || 1;
          const halfY = (this.maxY / 2) || 1;
          const quadX = (k.centerX % halfX) - (halfX / 2);
          const quadY = (k.centerY % halfY) - (halfY / 2);
          const proj = (quadY * Math.cos(angleBeam) + quadX * Math.sin(angleBeam)) / (halfX / 2 || 1);
          const phase = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        // --- QMK Waves & Atmosphere ---
        case 'qmk_hue_wave': {
          const wave = Math.sin((k.centerX * 0.4) - (now * 0.003 * speed));
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, 0.5 + wave * 0.35, customRgb);
          break;
        }

        case 'qmk_hue_pendulum': {
          const swing = Math.sin(now * 0.002 * speed) * (this.maxX / 2);
          const diff = Math.abs(k.centerX - ((this.maxX / 2) + swing));
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, 0.5 + (diff / (this.maxX || 1)) * 0.5, customRgb);
          break;
        }

        case 'qmk_breathing': {
          const phase = Math.abs(Math.sin(now * 0.002 * speed));
          brightFactor = (floor + (1 - floor) * phase) * intensity;
          rgb = samplePaletteRgb(palette, 0.5, customRgb);
          break;
        }

        case 'qmk_hue_breathing': {
          const breath = Math.abs(Math.sin(now * 0.0015 * speed));
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, ((now * 0.0003 * speed + breath * 0.2) % 1.0 + 1.0) % 1.0, customRgb);
          break;
        }

        case 'qmk_flower_blooming': {
          const angle = Math.atan2(k.centerY - (this.maxY / 2), k.centerX - (this.maxX / 2));
          const petal = Math.sin(angle * 6 + now * 0.002 * speed);
          const bloom = ((dirCoord.dist * 2.0 - petal * 0.5 - now * 0.001 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, bloom, customRgb);
          break;
        }

        case 'qmk_riverflow': {
          const flow = Math.sin(k.centerX * 0.6 + k.centerY * 0.3 + now * 0.003 * speed);
          brightFactor = (floor + (1 - floor) * (0.5 + 0.5 * flow)) * intensity;
          rgb = samplePaletteRgb(palette, ((k.centerX * 0.05 + now * 0.0005 * speed) % 1.0 + 1.0) % 1.0, customRgb);
          break;
        }

        // --- QMK Drops & Particles ---
        case 'qmk_raindrops': {
          let cache = this.raindropsCache.get(k.id);
          if (!cache || now - cache.time > 800) {
            cache = { offset: Math.floor(Math.random() * 48) - 24, time: now };
            this.raindropsCache.set(k.id, cache);
          }
          const pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(now * 0.004 * speed + k.centerX));
          brightFactor = (floor + (1 - floor) * pulse) * intensity;
          rgb = samplePaletteRgb(palette, 0.5 + cache.offset / 255, customRgb);
          break;
        }

        case 'qmk_jellybean_raindrops': {
          let cache = this.raindropsCache.get(k.id);
          if (!cache || now - cache.time > 600) {
            cache = { offset: Math.floor(Math.random() * 256), time: now };
            this.raindropsCache.set(k.id, cache);
          }
          const pulse = Math.abs(Math.sin(now * 0.005 * speed + cache.offset));
          brightFactor = (floor + (1 - floor) * pulse) * intensity;
          rgb = hsvToRgb(cache.offset, 255, 255);
          break;
        }

        case 'qmk_pixel_rain': {
          const colIdx = Math.floor(k.centerX) % 24;
          const drop = this.matrixDrops[colIdx] || { y: 0, speed: 0.1, length: 3 };
          const curY = (drop.y + now * 0.006 * speed * 8) % (this.maxY + 4);
          const distDrop = Math.abs(k.centerY - curY);
          if (distDrop < drop.length) {
            const glow = 1.0 - (distDrop / drop.length);
            brightFactor = (floor + (1 - floor) * glow) * intensity;
            rgb = samplePaletteRgb(palette, glow, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, 0.1, customRgb);
          }
          break;
        }

        case 'qmk_pixel_flow': {
          const wave = Math.sin(k.centerX * 0.8 - now * 0.004 * speed) * Math.cos(k.centerY * 0.6 - now * 0.003 * speed);
          const normWave = 0.5 + 0.5 * wave;
          brightFactor = (floor + (1 - floor) * normWave) * intensity;
          rgb = samplePaletteRgb(palette, ((k.centerX * 0.05 + normWave * 0.3) % 1.0 + 1.0) % 1.0, customRgb);
          break;
        }

        case 'qmk_pixel_fractal': {
          const fx = Math.floor(k.centerX * 2);
          const fy = Math.floor(k.centerY * 2);
          const ft = Math.floor(now * 0.004 * speed);
          const frac = Math.abs(((fx ^ fy ^ ft) % 8) / 8);
          brightFactor = (floor + (1 - floor) * frac) * intensity;
          rgb = samplePaletteRgb(palette, frac, customRgb);
          break;
        }

        case 'qmk_starlight':
        case 'qmk_starlight_smooth':
        case 'qmk_starlight_dual_hue': {
          const starHash = Math.sin(k.centerX * 12.9898 + k.centerY * 78.233) * 43758.5453;
          const starPhase = Math.abs(starHash % 1.0);
          const twinkle = Math.abs(Math.sin(now * 0.002 * speed + starPhase * Math.PI * 2));
          brightFactor = (floor + (1 - floor) * Math.pow(twinkle, 2)) * intensity;
          rgb = samplePaletteRgb(palette, preset === 'qmk_starlight_dual_hue' ? (starPhase > 0.5 ? 0.15 : 0.65) : starPhase, customRgb);
          break;
        }

        // --- QMK Bands & Gradients ---
        case 'qmk_gradient_up_down': {
          const pos = ((k.centerY / (this.maxY || 1)) * (speed * 0.8)) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, pos, customRgb);
          break;
        }

        case 'qmk_gradient_left_right': {
          const pos = ((k.centerX / (this.maxX || 1)) * (speed * 0.8)) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, pos, customRgb);
          break;
        }

        case 'qmk_colorband_sat': {
          const t = ((now * 0.00035 * speed * 256) % 256 + 256) % 256;
          const x255 = (k.qmkX * 228 / 224) + 28;
          const diff = Math.abs(x255 - t);
          const satVal = Math.max(0, 1.0 - (diff * 8.0 / 255.0));
          const baseRgb = samplePaletteRgb(palette, k.centerX / (this.maxX || 1), customRgb);
          brightFactor = intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, satVal);
          break;
        }

        case 'qmk_colorband_val': {
          const t = ((now * 0.00035 * speed * 256) % 256 + 256) % 256;
          const x255 = (k.qmkX * 228 / 224) + 28;
          const diff = Math.abs(x255 - t);
          const val = Math.max(0, 1.0 - (diff * 8.0 / 255.0));
          brightFactor = (floor + (1 - floor) * val) * intensity;
          rgb = samplePaletteRgb(palette, k.centerX / (this.maxX || 1), customRgb);
          break;
        }

        case 'qmk_colorband_pinwheel_sat': {
          const angle = Math.atan2(k.centerY - (this.maxY / 2), k.centerX - (this.maxX / 2));
          const normAngle = (((angle + Math.PI) / (Math.PI * 2)) % 1.0 + 1.0) % 1.0;
          const wave = 0.5 + 0.5 * Math.sin(angle * 3 - now * 0.004 * speed);
          const baseRgb = samplePaletteRgb(palette, normAngle, customRgb);
          brightFactor = intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, wave);
          break;
        }

        case 'qmk_colorband_pinwheel_val': {
          const angle = Math.atan2(k.centerY - (this.maxY / 2), k.centerX - (this.maxX / 2));
          const normAngle = (((angle + Math.PI) / (Math.PI * 2)) % 1.0 + 1.0) % 1.0;
          const wave = 0.5 + 0.5 * Math.sin(angle * 3 - now * 0.004 * speed);
          brightFactor = (floor + (1 - floor) * wave) * intensity;
          rgb = samplePaletteRgb(palette, normAngle, customRgb);
          break;
        }

        case 'qmk_colorband_spiral_sat': {
          const angle = Math.atan2(k.centerY - (this.maxY / 2), k.centerX - (this.maxX / 2));
          const wave = 0.5 + 0.5 * Math.sin((dirCoord.dist * 6 - angle * 2) - now * 0.004 * speed);
          const baseRgb = samplePaletteRgb(palette, dirCoord.dist, customRgb);
          brightFactor = intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, wave);
          break;
        }

        case 'qmk_colorband_spiral_val': {
          const angle = Math.atan2(k.centerY - (this.maxY / 2), k.centerX - (this.maxX / 2));
          const wave = 0.5 + 0.5 * Math.sin((dirCoord.dist * 6 - angle * 2) - now * 0.004 * speed);
          brightFactor = (floor + (1 - floor) * wave) * intensity;
          rgb = samplePaletteRgb(palette, dirCoord.dist, customRgb);
          break;
        }

        case 'qmk_solid_color': {
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, 0.5, customRgb);
          break;
        }

        case 'qmk_alphas_mods': {
          brightFactor = intensity;
          if (k.group === 'alpha' || k.group === 'num') {
            rgb = samplePaletteRgb(palette, 0.1, customRgb);
          } else {
            rgb = samplePaletteRgb(palette, 0.6, customRgb);
          }
          break;
        }

        default: {
          const phase = ((dirCoord.primary + now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = (floor + (1 - floor)) * intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }
      }

      this._applyKeyStyle(k, rgb[0], rgb[1], rgb[2], brightFactor);
    }

    this._renderSidelightDom(now, config);
  }

  private _applyKeyStyle(k: KeyGeometry, r: number, g: number, b: number, bright: number): void {
    if (k.isKnob) return; // Rotary knob is a mechanical encoder without matrix RGB LED

    const safeBright = Number.isFinite(bright) ? Math.max(0, Math.min(1.5, bright)) : 0;
    const safeR = Number.isFinite(r) ? r : 0;
    const safeG = Number.isFinite(g) ? g : 0;
    const safeB = Number.isFinite(b) ? b : 0;

    const finalR = Math.max(0, Math.min(255, Math.round(safeR * safeBright)));
    const finalG = Math.max(0, Math.min(255, Math.round(safeG * safeBright)));
    const finalB = Math.max(0, Math.min(255, Math.round(safeB * safeBright)));

    k.curRgb = { r: finalR, g: finalG, b: finalB };

    if (!k.el) return;

    if (finalR === 0 && finalG === 0 && finalB === 0) {
      k.el.style.backgroundColor = 'rgba(11, 15, 25, 0.85)';
      k.el.style.borderColor = 'rgba(255, 255, 255, 0.04)';
      k.el.style.boxShadow = 'none';
      return;
    }

    const alpha = Math.max(0.2, Math.min(0.95, safeBright));
    k.el.style.backgroundColor = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
    k.el.style.borderColor = `rgba(${Math.min(255, finalR + 40)}, ${Math.min(255, finalG + 40)}, ${Math.min(255, finalB + 40)}, 0.85)`;
    k.el.style.boxShadow = `0 0 ${Math.round(4 + safeBright * 10)}px rgba(${finalR}, ${finalG}, ${finalB}, ${Math.min(1.0, safeBright)})`;
  }

  private _renderSidelightDom(now: number, config: any): void {
    const leftEls = document.querySelectorAll<HTMLElement>('#studioLightingKeyboardCanvas .side-diffuser-left');
    const rightEls = document.querySelectorAll<HTMLElement>('#studioLightingKeyboardCanvas .side-diffuser-right');

    leftEls.forEach((el, i) => {
      const rgb = this._computeSidelightRgb('left', i, leftEls.length, now, config);
      if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
        el.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        el.style.boxShadow = 'none';
      } else {
        el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`;
        el.style.borderColor = `rgba(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)}, 0.6)`;
        el.style.boxShadow = `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
      }
    });

    rightEls.forEach((el, i) => {
      const rgb = this._computeSidelightRgb('right', i, rightEls.length, now, config);
      if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
        el.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        el.style.boxShadow = 'none';
      } else {
        el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`;
        el.style.borderColor = `rgba(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)}, 0.6)`;
        el.style.boxShadow = `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
      }
    });
  }

  private _computeSidelightRgb(
    side: 'left' | 'right',
    index: number,
    totalCount: number,
    now: number,
    config: any
  ): { r: number; g: number; b: number } {
    const isCustom = !!config.sidelightCustomEnable;
    const normY = (index + 0.5) / (totalCount || 1); // 0..1 from top to bottom
    const posX = side === 'left' ? 0 : this.maxX;
    const posY = normY * this.maxY;

    if (!isCustom || config.sidelightMode === 'followMain') {
      const activeTab = useUIStore.getState().studioSubTab;
      if (activeTab === 'audio') {
        const palette = config.audioColorMode || 'rainbow';
        const direction = config.audioDirection || 'bottom_to_top';
        const speed = config.audioSpeed || 1.0;
        const intensity = config.audioIntensity || 1.0;
        const floor = config.audioFloor || 0.15;
        const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
        const dirCoord = getDirectedCoordinate(posX, posY, direction, this.maxX, this.maxY);

        const phase = ((dirCoord.primary - now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
        const bandVal = (this.frequencyBands[Math.min(15, Math.floor(normY * 16))] || 0) / 255;
        const bright = (floor + (1 - floor) * bandVal) * intensity;
        const rgb = samplePaletteRgb(palette, phase, customRgb);
        return {
          r: Math.max(0, Math.min(255, Math.round(rgb[0] * bright))),
          g: Math.max(0, Math.min(255, Math.round(rgb[1] * bright))),
          b: Math.max(0, Math.min(255, Math.round(rgb[2] * bright)))
        };
      } else {
        const preset = config.softwareEffect || 'neonWave';
        const palette = config.softwarePalette || 'rainbow';
        const direction = config.softwareDirection || 'left_to_right';
        const speed = config.softwareSpeed || 1.0;
        const intensity = config.softwareIntensity || 1.0;
        const floor = config.softwareFloor || 0.10;
        const customRgb = hexToRgbList(config.softwareSingleColor || '#00ffff');
        const dirCoord = getDirectedCoordinate(posX, posY, direction, this.maxX, this.maxY);

        let rgb: [number, number, number] = [0, 0, 0];
        let brightFactor = intensity;

        switch (preset) {
          case 'fireEmber': {
            const targetPal = (palette === 'rainbow' || !PALETTES[palette]) ? 'fire_ember' : palette;
            const flicker = 0.6 + 0.4 * Math.sin(normY * 6.0 + now * 0.008 * speed);
            brightFactor = (floor + (1 - floor) * Math.max(0, flicker)) * intensity;
            const flamePhase = ((1.0 - normY * 0.8) + now * 0.002 * speed) % 1.0;
            rgb = samplePaletteRgb(targetPal, flamePhase, customRgb);
            break;
          }
          case 'hyperspaceWarp': {
            const warpRings = (((normY * 3.0 - now * 0.004 * speed) % 1.0) + 1.0) % 1.0;
            const streak = Math.pow(Math.sin(warpRings * Math.PI), 3);
            brightFactor = (floor + (1 - floor) * streak) * intensity;
            rgb = samplePaletteRgb(palette, ((normY + now * 0.001 * speed) % 1.0 + 1.0) % 1.0, customRgb);
            break;
          }
          default: {
            const phase = ((dirCoord.primary - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
            const waveSin = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
            brightFactor = (floor + (1 - floor) * waveSin) * intensity;
            rgb = samplePaletteRgb(palette, phase, customRgb);
            break;
          }
        }

        return {
          r: Math.max(0, Math.min(255, Math.round(rgb[0] * brightFactor))),
          g: Math.max(0, Math.min(255, Math.round(rgb[1] * brightFactor))),
          b: Math.max(0, Math.min(255, Math.round(rgb[2] * brightFactor)))
        };
      }
    }

    // Custom Sidelight Modes
    const mode = config.sidelightMode || 'followMain';
    const palette = config.sidelightPalette || 'rainbow';
    const speed = config.sidelightSpeed || 1.0;
    const intensity = config.sidelightIntensity || 1.0;
    const customRgb = hexToRgbList(config.sidelightColor || '#00ffff');

    if (mode === 'off') {
      return { r: 0, g: 0, b: 0 };
    }

    if (mode === 'solidAccent') {
      return {
        r: Math.min(255, Math.round(customRgb[0] * intensity)),
        g: Math.min(255, Math.round(customRgb[1] * intensity)),
        b: Math.min(255, Math.round(customRgb[2] * intensity))
      };
    }

    if (mode === 'vuMeterStereo') {
      const band = side === 'left' ? this.frequencyBands[2] : this.frequencyBands[13];
      const threshold = (1 - normY) * 255;
      const isLit = (band || 0) >= threshold;
      const bright = isLit ? intensity : 0.1 * intensity;
      const rgb = samplePaletteRgb(palette, normY, customRgb);
      return {
        r: Math.min(255, Math.round(rgb[0] * bright)),
        g: Math.min(255, Math.round(rgb[1] * bright)),
        b: Math.min(255, Math.round(rgb[2] * bright))
      };
    }

    if (mode === 'waveFlow') {
      const phase = ((normY - now * 0.001 * speed) % 1.0 + 1.0) % 1.0;
      const rgb = samplePaletteRgb(palette, phase, customRgb);
      return {
        r: Math.min(255, Math.round(rgb[0] * intensity)),
        g: Math.min(255, Math.round(rgb[1] * intensity)),
        b: Math.min(255, Math.round(rgb[2] * intensity))
      };
    }

    if (mode === 'waveCenter') {
      const distFromCenter = Math.abs(normY - 0.5) * 2;
      const phase = ((distFromCenter - now * 0.0012 * speed) % 1.0 + 1.0) % 1.0;
      const rgb = samplePaletteRgb(palette, phase, customRgb);
      return {
        r: Math.min(255, Math.round(rgb[0] * intensity)),
        g: Math.min(255, Math.round(rgb[1] * intensity)),
        b: Math.min(255, Math.round(rgb[2] * intensity))
      };
    }

    if (mode === 'rhythmicPulse') {
      const pulseNorm = Math.max(0.1, this.beatDecay / 255);
      const phase = ((now * 0.0005 * speed) % 1.0 + 1.0) % 1.0;
      const rgb = samplePaletteRgb(palette, phase, customRgb);
      return {
        r: Math.min(255, Math.round(rgb[0] * pulseNorm * intensity)),
        g: Math.min(255, Math.round(rgb[1] * pulseNorm * intensity)),
        b: Math.min(255, Math.round(rgb[2] * pulseNorm * intensity))
      };
    }

    // Default fallback
    const phase = ((normY - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
    const rgb = samplePaletteRgb(palette, phase, customRgb);
    return {
      r: Math.min(255, Math.round(rgb[0] * intensity)),
      g: Math.min(255, Math.round(rgb[1] * intensity)),
      b: Math.min(255, Math.round(rgb[2] * intensity))
    };
  }

  private async _streamToHardware(now: number): Promise<void> {
    if (!hidProtocol.isConnected() || this.isHardwareStreaming) return;
    if (now - this.lastHardwareStreamTime < 32) return; // ~30 FPS hardware streaming

    this.lastHardwareStreamTime = now;
    this.isHardwareStreaming = true;

    try {
      const presetId = useKeymapStore.getState().presetLayoutId || 'gmmk3-100-ansi';
      const hwProfile = HARDWARE_LIGHTING_PROFILES[presetId] || { totalLeds: 125 };
      const totalLeds = hwProfile.totalLeds;
      const hwBuffer = new Uint8Array(totalLeds * 3);

      // 1. Map physical matrix keys to MCU driver index
      const keys = this.cachedKeys;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.isKnob) continue;

        let targetLed = k.hardwareLedIndex;
        if (targetLed === undefined && k.matrix) {
          targetLed = getHardwareLedIndex(presetId, k.matrix[0], k.matrix[1]);
        }

        if (targetLed !== undefined && targetLed < totalLeds) {
          const rgb = k.curRgb || { r: 0, g: 0, b: 0 };
          const offset = targetLed * 3;
          hwBuffer[offset + 0] = rgb.r;
          hwBuffer[offset + 1] = rgb.g;
          hwBuffer[offset + 2] = rgb.b;
        }
      }

      // 2. Map Sidelights (Underglow) if present
      if (hwProfile.sidelightRange) {
        const config = useVisualizerStore.getState().config;
        const leftRange = hwProfile.sidelightRange.left;
        const rightRange = hwProfile.sidelightRange.right;
        const leftCount = leftRange[1] - leftRange[0] + 1;
        const rightCount = rightRange[1] - rightRange[0] + 1;

        for (let i = 0; i < leftCount; i++) {
          const ledIndex = leftRange[0] + i;
          if (ledIndex < totalLeds) {
            const sideRgb = this._computeSidelightRgb('left', i, leftCount, now, config);
            const offset = ledIndex * 3;
            hwBuffer[offset + 0] = sideRgb.r;
            hwBuffer[offset + 1] = sideRgb.g;
            hwBuffer[offset + 2] = sideRgb.b;
          }
        }

        for (let i = 0; i < rightCount; i++) {
          const ledIndex = rightRange[0] + i;
          if (ledIndex < totalLeds) {
            const sideRgb = this._computeSidelightRgb('right', i, rightCount, now, config);
            const offset = ledIndex * 3;
            hwBuffer[offset + 0] = sideRgb.r;
            hwBuffer[offset + 1] = sideRgb.g;
            hwBuffer[offset + 2] = sideRgb.b;
          }
        }
      }

      // 3. Map Logo LED if present
      if (hwProfile.logoLedIndex !== undefined && hwProfile.logoLedIndex < totalLeds) {
        const logoKey = keys.find(k => k.isLogo);
        if (logoKey) {
          const offset = hwProfile.logoLedIndex * 3;
          hwBuffer[offset + 0] = logoKey.curRgb.r;
          hwBuffer[offset + 1] = logoKey.curRgb.g;
          hwBuffer[offset + 2] = logoKey.curRgb.b;
        }
      }

      // 4. Stream to firmware in 9-LED blocks (27 RGB bytes per 32-byte VIA packet)
      const CHUNK_LEDS = 9;
      for (let startLed = 0; startLed < totalLeds; startLed += CHUNK_LEDS) {
        const count = Math.min(CHUNK_LEDS, totalLeds - startLed);
        const isLast = (startLed + count >= totalLeds);
        const chunk = Array.from(hwBuffer.slice(startLed * 3, (startLed + count) * 3));
        const packetStartIdx = isLast ? (startLed | 0x80) : startLed;
        await hidProtocol.sendDirectLightingBlock(packetStartIdx, chunk);
      }
    } catch (e) {
      // Suppress transient frame dropping
    } finally {
      this.isHardwareStreaming = false;
    }
  }

  private _resetDomElements(): void {
    for (let i = 0; i < this.cachedKeys.length; i++) {
      const k = this.cachedKeys[i];
      k.curRgb = { r: 0, g: 0, b: 0 };
      if (k.el) {
        k.el.style.backgroundColor = 'rgba(11, 15, 25, 0.85)';
        k.el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        k.el.style.boxShadow = 'none';
      }
    }

    const sideSegments = document.querySelectorAll<HTMLElement>('#studioLightingKeyboardCanvas .side-diffuser-segment');
    sideSegments.forEach((el) => {
      el.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
      el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      el.style.boxShadow = 'none';
    });
  }
}

export const visualizerService = new VisualizerEngineService();
