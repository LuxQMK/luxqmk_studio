import { useEffect, useRef, useCallback } from 'react';
import { useLightingStore } from '../store/useLightingStore';
import { useKeymapStore } from '../store/useKeymapStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useUIStore } from '../store/useUIStore';
import { hidProtocol } from '../core/hid-protocol';
import { CODE_TO_KEY_ID } from '../views/TesterView';
import { KeyLayoutItem } from '../types/keyboard';
import { SidelightConfig } from '../types/lighting';

export interface VisualizerKey {
  id: string;
  label?: string;
  matrix: [number, number];
  x: number;
  y: number;
  w: number;
  h: number;
  qmkX: number;
  qmkY: number;
  dx: number;
  dy: number;
  dist: number;
  group?: string;
  isKnob?: boolean;
  isLogo?: boolean;
  el: HTMLElement | null;
}

export interface SideDiffuser {
  id: string;
  qmkX: number;
  qmkY: number;
  dx: number;
  dy: number;
  dist: number;
  isLeft: boolean;
  el: HTMLElement | null;
}

const HARDWARE_GRADIENT_PRESETS: Array<Array<{ pos: number; r: number; g: number; b: number }> | null> = [
  null,
  [
    { pos: 0, r: 0, g: 255, b: 255 },
    { pos: 85, r: 255, g: 0, b: 128 },
    { pos: 170, r: 255, g: 255, b: 0 },
  ],
  [
    { pos: 0, r: 75, g: 0, b: 130 },
    { pos: 64, r: 255, g: 0, b: 128 },
    { pos: 128, r: 255, g: 100, b: 0 },
    { pos: 192, r: 255, g: 215, b: 0 },
  ],
  [
    { pos: 0, r: 45, g: 10, b: 85 },
    { pos: 85, r: 235, g: 45, b: 55 },
    { pos: 170, r: 255, g: 190, b: 40 },
  ],
  [
    { pos: 0, r: 166, g: 255, b: 0 },
    { pos: 85, r: 243, g: 255, b: 0 },
    { pos: 170, r: 0, g: 229, b: 58 },
  ],
  [
    { pos: 0, r: 0, g: 20, b: 80 },
    { pos: 64, r: 0, g: 140, b: 255 },
    { pos: 128, r: 0, g: 255, b: 200 },
    { pos: 192, r: 135, g: 206, b: 250 },
  ],
  [
    { pos: 0, r: 0, g: 200, b: 255 },
    { pos: 64, r: 255, g: 255, b: 255 },
    { pos: 128, r: 255, g: 80, b: 0 },
    { pos: 192, r: 180, g: 0, b: 0 },
  ],
  [
    { pos: 0, r: 218, g: 182, b: 252 },
    { pos: 64, r: 168, g: 240, b: 219 },
    { pos: 128, r: 255, g: 209, b: 178 },
    { pos: 192, r: 255, g: 182, b: 193 },
  ],
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = (hex || '#ffffff').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return {
    r: isNaN(r) ? 255 : Math.max(0, Math.min(255, r)),
    g: isNaN(g) ? 255 : Math.max(0, Math.min(255, g)),
    b: isNaN(b) ? 255 : Math.max(0, Math.min(255, b)),
  };
}

export function hexToHs(hex: string): [number, number] {
  let c = (hex || '#ffffff').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }

  return [Math.round((h / 360) * 255), Math.round(s * 255)];
}

export function hsvToRgb(hByte: number, sByte: number, vByte: number): { r: number; g: number; b: number } {
  const normH = (((hByte % 256) + 256) % 256) / 256;
  const h = normH * 360;
  const s = Math.max(0, Math.min(255, sByte)) / 255;
  const v = Math.max(0, Math.min(255, vByte)) / 255;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.max(0, Math.min(255, Math.round((r + m) * 255))),
    g: Math.max(0, Math.min(255, Math.round((g + m) * 255))),
    b: Math.max(0, Math.min(255, Math.round((b + m) * 255))),
  };
}

function sampleGradient(
  presetId: number,
  phase: number,
  vScale = 1.0,
  sScale = 1.0
): { r: number; g: number; b: number } {
  if (presetId <= 0 || presetId >= HARDWARE_GRADIENT_PRESETS.length) {
    return hsvToRgb(phase, Math.round(255 * sScale), Math.round(255 * vScale));
  }
  const stops = HARDWARE_GRADIENT_PRESETS[presetId];
  if (!stops || stops.length === 0) {
    return hsvToRgb(phase, Math.round(255 * sScale), Math.round(255 * vScale));
  }

  const p = (phase % 256 + 256) % 256;
  const s0 = stops[0];
  const sLast = stops[stops.length - 1];

  let r = 255;
  let g = 255;
  let b = 255;

  if (p <= s0.pos) {
    const wrapSpan = (255 - sLast.pos) + s0.pos;
    if (wrapSpan === 0) {
      r = s0.r;
      g = s0.g;
      b = s0.b;
    } else {
      const prog = (p + (255 - sLast.pos)) / wrapSpan;
      r = Math.round(sLast.r + (s0.r - sLast.r) * prog);
      g = Math.round(sLast.g + (s0.g - sLast.g) * prog);
      b = Math.round(sLast.b + (s0.b - sLast.b) * prog);
    }
  } else if (p >= sLast.pos) {
    const wrapSpan = (255 - sLast.pos) + s0.pos;
    if (wrapSpan === 0) {
      r = sLast.r;
      g = sLast.g;
      b = sLast.b;
    } else {
      const prog = (p - sLast.pos) / wrapSpan;
      r = Math.round(sLast.r + (s0.r - sLast.r) * prog);
      g = Math.round(sLast.g + (s0.g - sLast.g) * prog);
      b = Math.round(sLast.b + (s0.b - sLast.b) * prog);
    }
  } else {
    for (let i = 0; i < stops.length - 1; i++) {
      const cur = stops[i];
      const next = stops[i + 1];
      if (p >= cur.pos && p <= next.pos) {
        const span = next.pos - cur.pos;
        const prog = span === 0 ? 0 : (p - cur.pos) / span;
        r = Math.round(cur.r + (next.r - cur.r) * prog);
        g = Math.round(cur.g + (next.g - cur.g) * prog);
        b = Math.round(cur.b + (next.b - cur.b) * prog);
        break;
      }
    }
  }

  return {
    r: Math.min(255, Math.max(0, Math.round(r * vScale))),
    g: Math.min(255, Math.max(0, Math.round(g * vScale))),
    b: Math.min(255, Math.max(0, Math.round(b * vScale))),
  };
}

export function evalSidelightEffect(
  sd: SideDiffuser,
  sidelight: SidelightConfig,
  now: number,
  brightness: number,
  deviceFamily?: string
): { r: number; g: number; b: number } {
  const mode = Number(sidelight.effect) || 1;
  const speed = Math.max(10, Number(sidelight.speed) || 128);
  // Exact 1:1 parity with QMK uint8_t speed_scaled = qadd8(g_sidelight_speed / 4, 1);
  const speedScaled = Math.floor(speed / 4) + 1;
  // Exact 1:1 parity with QMK scale16by8(g_rgb_timer, speed_scaled) -> (now * speedScaled) / 256
  const t = Math.round((now * speedScaled) / 256) & 0xFF;

  const [hue, sat] = hexToHs(sidelight.color || '#00ffff');
  const gradPreset = Number(sidelight.gradientPreset) || 0;
  const rev = Boolean(sidelight.reverse);
  const density = Number(sidelight.density) || 128;
  const baseV = 255 * brightness;

  // Board-aware physical optical calibration (GMMK 3 Chassis offset vs GMMK 2 / Generic symmetric)
  let yScaled = 0;
  let distScaled = 0;
  let optStep = 0;
  let isHidden = false;

  if (sd.id && sd.id.startsWith('SLED')) {
    const num = parseInt(sd.id.replace('SLED', ''), 10);
    const isGmmk3 = !deviceFamily || deviceFamily.includes('GMMK 3');
    if (isGmmk3) {
      // GMMK 3 Chassis calibration (Left: visible 1..8, Right: visible 2..9)
      if (num >= 1 && num <= 10) {
        const kLeft = num - 1;
        if (kLeft < 1 || kLeft > 8) isHidden = true;
        const normLeft = Math.max(0, Math.min(7, kLeft - 1));
        optStep = normLeft;
        yScaled = Math.round((normLeft * 255 * density) / (7 * 128)) & 0xFF;
        const distSym = Math.min(7, Math.abs(2 * kLeft - 9));
        distScaled = Math.round((distSym * 255 * density) / (7 * 128)) & 0xFF;
      } else if (num >= 11 && num <= 20) {
        const kRight = 20 - num;
        if (kRight < 2 || kRight > 9) isHidden = true;
        const normRight = Math.max(0, Math.min(7, kRight - 2));
        optStep = normRight;
        yScaled = Math.round((normRight * 255 * density) / (7 * 128)) & 0xFF;
        const distSym = Math.min(7, Math.abs(2 * kRight - 11));
        distScaled = Math.round((distSym * 255 * density) / (7 * 128)) & 0xFF;
      }
    } else {
      // GMMK 2 & Generic symmetric 1:1 linear strip
      const totalSide = 10;
      const span = Math.max(1, totalSide - 1);
      const k = (num <= totalSide) ? (num - 1) : ((totalSide * 2) - num);
      const kClamped = Math.max(0, Math.min(span, k));
      optStep = kClamped;
      yScaled = Math.round((kClamped * 255 * density) / (span * 128)) & 0xFF;
      const distSym = Math.min(span, Math.abs(2 * kClamped - span));
      distScaled = Math.round((distSym * 255 * density) / (span * 128)) & 0xFF;
    }
  }

  switch (mode) {
    case 1: // SOLID_COLOR
      return hsvToRgb(hue, sat, baseV);

    case 2: // BREATHING (1:1 QMK scale8(abs8(sin8(time)), val))
      {
        const breathSin = Math.abs(Math.sin((t / 256) * Math.PI * 2));
        return hsvToRgb(hue, sat, baseV * breathSin);
      }

    case 3: // CYCLE_RAINBOW
      {
        const phase = (rev ? (255 - t) : t) & 0xFF;
        return hsvToRgb(phase, 255, baseV);
      }

    case 4: // RAINBOW_WAVE (Top to Bottom normal, Bottom to Top reversed)
      {
        const phase = (t + (rev ? yScaled : (256 - yScaled)) + hue) % 256;
        return hsvToRgb(phase, 255, baseV);
      }

    case 5: // RAINBOW_CENTER_WAVE (Center Outward normal, Outward into Center reversed)
      {
        const phase = (t + (rev ? distScaled : (256 - distScaled)) + hue) % 256;
        return hsvToRgb(phase, 255, baseV);
      }

    case 6: // GRADIENT_WAVE (Top to Bottom normal, Bottom to Top reversed)
      {
        const phase = (t + (rev ? yScaled : (256 - yScaled))) % 256;
        return sampleGradient(gradPreset, phase, brightness, 1.0);
      }

    case 7: // GRADIENT_CENTER_WAVE (Center Outward normal, Outward into Center reversed)
      {
        const phase = (t + (rev ? distScaled : (256 - distScaled))) % 256;
        return sampleGradient(gradPreset, phase, brightness, 1.0);
      }

    case 8: // GRADIENT_CYCLE
      {
        const phase = (rev ? (255 - t) : t) & 0xFF;
        return sampleGradient(gradPreset, phase, brightness, 1.0);
      }

    case 9: // GRADIENT_BREATHE
      {
        const gradSpeedScaled = Math.floor(speed / 16) + 1;
        const tGrad = Math.round((now * gradSpeedScaled) / 256) & 0xFF;
        const breathSin = Math.abs(Math.sin((t / 256) * Math.PI * 2));
        return sampleGradient(gradPreset, tGrad, brightness * breathSin, 1.0);
      }

    case 10: // SINGLE_WAVE (1:1 QMK sin8(time + ...))
      {
        const wavePhase = (t + (rev ? yScaled : (256 - yScaled))) & 0xFF;
        const waveSin = 0.5 + 0.5 * Math.sin((wavePhase / 256) * Math.PI * 2);
        return hsvToRgb(hue, sat, baseV * waveSin);
      }

    case 11: // DIAGNOSTIC OPTICAL CALIBRATION
      {
        if (isHidden) return { r: 0, g: 0, b: 0 };
        const diagColors = [
          { r: 255, g: 0, b: 0 },     // 0: Red (Visible Top on BOTH strips)
          { r: 255, g: 128, b: 0 },   // 1: Orange
          { r: 255, g: 255, b: 0 },   // 2: Yellow
          { r: 0, g: 255, b: 0 },     // 3: Green (Visible Center 1)
          { r: 0, g: 255, b: 0 },     // 4: Green (Visible Center 2)
          { r: 0, g: 255, b: 255 },   // 5: Cyan
          { r: 255, g: 0, b: 255 },   // 6: Magenta
          { r: 0, g: 0, b: 255 },     // 7: Blue (Visible Bottom on BOTH strips)
        ];
        const col = diagColors[Math.min(7, Math.max(0, optStep))];
        return {
          r: Math.round((col.r * baseV) / 255),
          g: Math.round((col.g * baseV) / 255),
          b: Math.round((col.b * baseV) / 255),
        };
      }

    case 12: // OFF
      return { r: 0, g: 0, b: 0 };

    default:
      return hsvToRgb(hue, sat, baseV);
  }
}

export function useLightingVisualizer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  layoutKeys: KeyLayoutItem[]
) {
  const hitsRef = useRef<Array<{ id: string; x: number; y: number; time: number; hue: number }>>([]);
  const raindropsCacheRef = useRef<Map<string, { offset: number; time: number }>>(new Map());
  const animFrameRef = useRef<number | null>(null);

  const registerKeyHit = useCallback((keyId: string, qmkX: number, qmkY: number) => {
    const now = performance.now();
    const randomHue = Math.floor(Math.random() * 256);
    const hitObj = { id: keyId, x: qmkX, y: qmkY, time: now, hue: randomHue };

    hitsRef.current.push(hitObj);
    if (hitsRef.current.length > 20) {
      hitsRef.current.shift();
    }
  }, []);

  // Sync physical keypresses for visualizer reactive lighting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyId = CODE_TO_KEY_ID[e.code];
      if (keyId) {
        const k = layoutKeys.find((lk) => lk.id === keyId || lk.label === keyId);
        const qX = (k as any)?.qmkPoint ? (k as any).qmkPoint[0] : 109;
        const qY = (k as any)?.qmkPoint ? (k as any).qmkPoint[1] : 27;
        registerKeyHit(keyId, qX, qY);
      }
    };

    const eventOptions = { capture: true, passive: true };
    window.addEventListener('keydown', handleKeyDown, eventOptions);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, eventOptions);
    };
  }, [layoutKeys, registerKeyHit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isRunning = true;

    // Build visualizer key list from container DOM children
    let centerX = 109;
    let centerY = 27;

    const boundsW = 22.5;
    const boundsH = 6.25;

    const keyP = layoutKeys.find((k) => k.id === 'P' || k.label === 'P');
    if (keyP) {
      const pCenterX = keyP.x + ((keyP.w || 1) / 2);
      const pCenterY = keyP.y + ((keyP.h || 1) / 2);
      centerX = (keyP as any).qmkPoint ? (keyP as any).qmkPoint[0] : Math.round((pCenterX / boundsW) * 224);
      centerY = (keyP as any).qmkPoint ? (keyP as any).qmkPoint[1] : Math.round((pCenterY / boundsH) * 64);
    }

    const visualizerKeys: VisualizerKey[] = layoutKeys.map((k) => {
      const keyW = k.w || 1;
      const keyH = k.h || 1;
      const keyCenterX = k.x + keyW / 2;
      const keyCenterY = k.y + keyH / 2;

      const qmkX = (k as any).qmkPoint ? (k as any).qmkPoint[0] : Math.round((keyCenterX / boundsW) * 224);
      const qmkY = (k as any).qmkPoint ? (k as any).qmkPoint[1] : Math.round((keyCenterY / boundsH) * 64);

      const dx = qmkX - centerX;
      const dy = qmkY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const keyId = k.id || ((k as any).isLogo ? 'LOGO_LED' : (k.label || `k-${k.matrix?.[0]}-${k.matrix?.[1]}`));
      const el = container.querySelector<HTMLElement>(`[data-key-id="${keyId}"]`) || ((k as any).isLogo ? container.querySelector<HTMLElement>('.logo-keycap') : null);

      return {
        id: keyId,
        label: k.label,
        matrix: k.matrix,
        x: keyCenterX,
        y: keyCenterY,
        w: keyW,
        h: keyH,
        qmkX,
        qmkY,
        dx,
        dy,
        dist,
        group: k.group,
        isKnob: (k as any).isKnob,
        isLogo: (k as any).isLogo,
        el,
      };
    });

    const sideDiffusers: SideDiffuser[] = [];
    const sideEls = container.querySelectorAll<HTMLElement>('.side-diffuser-segment');
    const cRect = container.getBoundingClientRect();
    sideEls.forEach((el) => {
      const id = el.getAttribute('data-key-id') || '';
      const isLeft = el.classList.contains('side-diffuser-left');
      const rect = el.getBoundingClientRect();
      const relY = cRect.height > 0 ? (rect.top + rect.height / 2 - cRect.top) / cRect.height : 0.5;
      const qmkX = isLeft ? 0 : 224;
      const qmkY = Math.round(relY * 64);
      const dx = qmkX - centerX;
      const dy = qmkY - centerY;
      sideDiffusers.push({
        id,
        qmkX,
        qmkY,
        dx,
        dy,
        dist: Math.sqrt(dx * dx + dy * dy),
        isLeft,
        el,
      });
    });

    const renderLoop = (timestamp: number) => {
      if (!isRunning) return;

      const store = useLightingStore.getState();
      const { backlight, reactive, isSimulatingFn, winLock, layerLighting } = store;

      const now = timestamp;
      const speed = Math.max(10, backlight.speed || 128);
      const tByte = Math.round(now * (speed / 512)) & 0xFF;
      const brightness = Math.max(0, Math.min(255, backlight.brightness)) / 255;
      const [baseH, baseS] = hexToHs(backlight.color || '#00ffff');
      const baseV = 255 * brightness;
      const rev = Boolean(backlight.reverse);
      const effect = backlight.effect !== undefined ? backlight.effect : 13;
      const density = (backlight.density || 128) / 128;
      const activeGrad = backlight.gradientPreset || 0;
      const spdFactor = Math.max(0.1, speed / 128);

      // Filter expired hits (> 2.5s)
      hitsRef.current = hitsRef.current.filter((h) => h && Number.isFinite(h.time) && (now - h.time) < 2500);

      // Render each key
      for (let i = 0; i < visualizerKeys.length; i++) {
        const k = visualizerKeys[i];
        if (!k.el) {
          k.el = container.querySelector<HTMLElement>(`[data-key-id="${k.id}"]`) || (k.isLogo ? container.querySelector<HTMLElement>('.logo-keycap') : null);
          if (!k.el) continue;
        }

        if (k.isKnob) continue;

        let h = baseH;
        let s = baseS;
        let v = baseV;
        let customRgb: { r: number; g: number; b: number } | null = null;

        // Effect Math Calculation (Exact 1:1 QMK Parity)
        switch (effect) {
          case 0: // ALL_OFF
            v = 0;
            break;
          case 1: // SOLID_COLOR
            h = baseH;
            s = baseS;
            v = baseV;
            break;
          case 2: // ALPHAS_MODS
            if (k.group === 'alpha' || k.group === 'num') {
              h = baseH;
            } else {
              h = (baseH + 128) & 0xFF;
            }
            break;
          case 3: // GRADIENT_UP_DOWN
            {
              const y = rev ? (64 - k.qmkY) : k.qmkY;
              const scale = Math.round((64 * speed) / 255);
              h = (baseH + Math.round(scale * (y / 16))) & 0xFF;
            }
            break;
          case 4: // GRADIENT_LEFT_RIGHT
            {
              const x = rev ? (224 - k.qmkX) : k.qmkX;
              const scale = Math.round((64 * speed) / 255);
              h = (baseH + Math.round(scale * (x / 16))) & 0xFF;
            }
            break;
          case 5: // BREATHING
            {
              const phase = now * 0.002 * spdFactor;
              const breath = Math.abs(Math.sin(phase));
              v = Math.round(baseV * (0.08 + 0.92 * breath));
            }
            break;
          case 6: // BAND_SAT
            {
              const t = rev ? (255 - tByte) : tByte;
              const diff = Math.abs(Math.round((k.qmkX * 228) / 256) + 28 - t);
              const band = Math.max(0, 255 - diff * 8);
              s = Math.round((baseS * band) / 255);
            }
            break;
          case 7: // BAND_VAL
            {
              const t = rev ? (255 - tByte) : tByte;
              const diff = Math.abs(Math.round((k.qmkX * 228) / 256) + 28 - t);
              const band = Math.max(0, 255 - diff * 8);
              v = Math.round((baseV * band) / 255);
            }
            break;
          case 12: // CYCLE_ALL
            {
              const phase = ((rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
              } else {
                h = phase;
              }
            }
            break;
          case 13: // CYCLE_LEFT_RIGHT (Rainbow Wave)
            {
              const spatialX = Math.round(k.qmkX * density);
              const phase = (spatialX + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
              } else {
                h = phase;
              }
            }
            break;
          case 14: // CYCLE_UP_DOWN
            {
              const spatialY = Math.round(k.qmkY * 4 * density);
              const phase = (spatialY + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
              } else {
                h = phase;
              }
            }
            break;
          case 16: // CYCLE_OUT_IN
            {
              const phase = (Math.round(1.5 * k.dist * density) + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
              } else {
                h = phase;
              }
            }
            break;
          case 18: // PINWHEEL
            {
              const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
              const phase = (Math.round(angle * density) + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
              } else {
                h = phase;
              }
            }
            break;
          case 19: // SPIRAL
            {
              const angle = (Math.atan2(k.dy, k.dx) + Math.PI) / (2 * Math.PI) * 255;
              const phase = (Math.round((k.dist - angle) * density) + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
              } else {
                h = phase;
              }
            }
            break;
          case 31: // DIGITAL_RAIN
            {
              const stream = ((k.qmkX * 7 + Math.floor(now * 0.015 * spdFactor)) % 40);
              const dist = Math.abs((k.qmkY / 2) - stream);
              h = 85;
              s = 255;
              v = dist < 5 ? Math.round(baseV * (1.0 - dist / 5)) : Math.round(baseV * 0.06);
            }
            break;
          case 33: // LUXQMK_WAVE
            {
              const phase = (Math.round((k.qmkX / 2) * density) + (rev ? -tByte : tByte) + baseH) & 0xFF;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase, baseV / 255);
              } else {
                h = phase;
              }
            }
            break;
          case 34: // CYCLE_DYNAMIC
            {
              const phase = (rev ? (Math.round(1.5 * k.dist * density) - tByte) : (Math.round(1.5 * k.dist * density) + tByte)) + baseH;
              if (activeGrad > 0) {
                customRgb = sampleGradient(activeGrad, phase & 0xFF, baseV / 255);
              } else {
                h = phase & 0xFF;
              }
            }
            break;
          case 39: // CUSTOM_PER_KEY_PROFILE_1
          case 40: // CUSTOM_PER_KEY_PROFILE_2
          case 41: // CUSTOM_PER_KEY_PROFILE_3
            {
              const profIdx = effect - 39;
              const profile = store.perKeyProfiles[profIdx] || {};
              const hex = profile[i];
              if (hex) {
                const c = hexToRgb(hex);
                const scaledV = baseV / 255;
                customRgb = {
                  r: Math.round(c.r * scaledV),
                  g: Math.round(c.g * scaledV),
                  b: Math.round(c.b * scaledV),
                };
              } else {
                customRgb = { r: 0, g: 0, b: 0 };
              }
            }
            break;
          default:
            {
              const spatialX = Math.round(k.qmkX * density);
              const phase = (spatialX + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
              h = phase;
            }
            break;
        }

        let rgb = customRgb || hsvToRgb(h, s, v);

        // Reactive Touch / Click Layer
        if (reactive.enable && reactive.mode > 0) {
          const rSpdScale = Math.max(0.1, (reactive.speed + 1) / 128);
          const [rH, rS] = hexToHs(reactive.color || '#ffffff');
          let rIntensity = 0;

          if (reactive.mode === 1) { // Fade
            const lastHit = hitsRef.current.find((hit) => hit.id === k.id);
            if (lastHit) {
              const elapsedSec = (now - lastHit.time) / 1000;
              const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 3.0));
              if (tick < 255) rIntensity = 255 - tick;
            }
          } else if (reactive.mode === 2 || reactive.mode === 3) { // Splash
            let sumInt = 0;
            for (const hit of hitsRef.current) {
              const dx = k.qmkX - hit.x;
              const dy = k.qmkY - hit.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const elapsedSec = (now - hit.time) / 1000;
              const tick = Math.min(255, Math.floor(elapsedSec * 60 * rSpdScale * 3.5));
              const eff = tick - dist;
              if (eff >= 0 && eff < 28 && tick < 255) {
                sumInt = Math.min(255, sumInt + Math.floor((28 - eff) * (255 - tick) / 28));
              }
            }
            rIntensity = sumInt;
          }

          if (rIntensity > 0) {
            const rRgb = hsvToRgb(rH, rS, Math.round(255 * (rIntensity / 255)));
            rgb = {
              r: Math.min(255, rgb.r + rRgb.r),
              g: Math.min(255, rgb.g + rRgb.g),
              b: Math.min(255, rgb.b + rRgb.b),
            };
          }
        }

        // Layer simulation & hardware layer highlighting and dimming (1:1 QMK luxqmk.c parity)
        const hwActiveLayer = useDeviceStore.getState().activeLayer || 0;
        const isLayersTab = useUIStore.getState().activeView === 'lighting' && useUIStore.getState().lightingSubTab === 'layers';
        const activeLyr = isSimulatingFn ? 1 : (hwActiveLayer > 0 ? hwActiveLayer : (isLayersTab ? 1 : 0));
        const isLayerActive = activeLyr > 0 && layerLighting.enable;

        if (isLayerActive) {
          let isKeyProgrammed = false;
          if (k.matrix) {
            const kc = useKeymapStore.getState().getKeycode(activeLyr, k.matrix[0], k.matrix[1]);
            if (kc !== 0x0000 && kc !== 0x0001) {
              isKeyProgrammed = true;
            }
          }
          if (!isKeyProgrammed && activeLyr === 1) {
            if (k.id && (k.id.startsWith('F') || ['O', 'Z', 'X', 'C', 'V', 'UP', 'DOWN', 'LEFT', 'RGHT'].includes(k.id))) {
              isKeyProgrammed = true;
            }
          }

          let layerTargetColor = layerLighting.layer1Color || '#ffffff';
          if (activeLyr === 2) layerTargetColor = layerLighting.layer2Color || '#00ffff';
          else if (activeLyr === 3) layerTargetColor = layerLighting.layer3Color || '#b400ff';

          if (isKeyProgrammed) {
            rgb = hexToRgb(layerTargetColor);
          } else {
            const dim = (layerLighting.dimLevel !== undefined ? layerLighting.dimLevel : 100) / 255;
            rgb = {
              r: Math.round(rgb.r * dim),
              g: Math.round(rgb.g * dim),
              b: Math.round(rgb.b * dim),
            };
          }
        }

        // Win Lock indicator
        if (k.id === 'LWIN' && winLock.isLocked) {
          if (winLock.mode === 1) {
            rgb = { r: 0, g: 0, b: 0 };
          } else if (winLock.mode === 2) {
            rgb = hexToRgb(winLock.color || '#ff0000');
          }
        }

        // Logo LED Lock Indicator (1:1 QMK luxqmk.c parity)
        if (k.isLogo) {
          const { logoLocks } = store;
          const currentSubTab = useUIStore.getState().lightingSubTab;
          const activeView = useUIStore.getState().activeView;
          const mode = logoLocks?.mode ?? 1; // 0: RGB, 1: Indicator (RGB idle), 2: Indicator (Off idle)
          const hostLeds = useDeviceStore.getState().hostLeds;
          const lockSum = (hostLeds.caps ? 1 : 0) | (hostLeds.num ? 2 : 0) | (hostLeds.scroll ? 4 : 0);

          if (mode === 0) {
            // Mode 0: Main RGB animation flows through Logo LED
          } else if (mode === 1) {
            // Mode 1: Lock Indicator with RGB idle
            if (lockSum > 0 || (activeView === 'lighting' && currentSubTab === 'logo')) {
              const lockKeys = [
                'colorCaps',
                'colorCaps',
                'colorNum',
                'colorCapsNum',
                'colorScroll',
                'colorCapsScroll',
                'colorNumScroll',
                'colorAll',
              ];
              const lk = lockKeys[lockSum || 1] as keyof typeof logoLocks;
              const colHex = (logoLocks as any)[lk] || '#001eff';
              const [lh, ls] = hexToHs(colHex);
              const lv = Math.max(120, Math.round(255 * (brightness > 0 ? brightness : 1.0)));
              rgb = hsvToRgb(lh, ls, lv);
            }
          } else if (mode === 2) {
            // Mode 2: Lock Indicator with Off idle
            if (lockSum > 0 || (activeView === 'lighting' && currentSubTab === 'logo')) {
              const lockKeys = [
                'colorCaps',
                'colorCaps',
                'colorNum',
                'colorCapsNum',
                'colorScroll',
                'colorCapsScroll',
                'colorNumScroll',
                'colorAll',
              ];
              const lk = lockKeys[lockSum || 1] as keyof typeof logoLocks;
              const colHex = (logoLocks as any)[lk] || '#001eff';
              const [lh, ls] = hexToHs(colHex);
              const lv = Math.max(120, Math.round(255 * (brightness > 0 ? brightness : 1.0)));
              rgb = hsvToRgb(lh, ls, lv);
            } else {
              rgb = { r: 0, g: 0, b: 0 };
            }
          }
        }

        // Apply styles directly to element
        if (k.isLogo) {
          if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
            k.el.style.backgroundColor = 'rgba(15, 20, 32, 0.9)';
            k.el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            k.el.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.5)';
          } else {
            k.el.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            k.el.style.borderColor = `rgba(${Math.min(255, rgb.r + 60)}, ${Math.min(255, rgb.g + 60)}, ${Math.min(255, rgb.b + 60)}, 0.9)`;
            k.el.style.boxShadow = `0 0 16px rgb(${rgb.r}, ${rgb.g}, ${rgb.b}), 0 0 28px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.6)`;
          }
        } else {
          const avgBri = (rgb.r + rgb.g + rgb.b) / 3;
          const glowAlpha = Math.min(0.85, (avgBri / 255) * 0.75);
          const textColor = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 140 ? '#111827' : '#ffffff';

          k.el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
          k.el.style.borderColor = `rgba(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)}, 0.5)`;
          k.el.style.boxShadow = `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowAlpha}), inset 0 1px 0 rgba(255, 255, 255, 0.2)`;
          k.el.style.color = textColor;
        }
      }

      // Render Left & Right Side Diffuser Lightbars
      const { sidelight } = store;
      const isCustomSidelight = Boolean(sidelight?.customEnable);
      const currentDeviceFamily = useDeviceStore.getState().activeDescriptor?.family;

      if (sideDiffusers.length === 0) {
        const sideEls = container.querySelectorAll<HTMLElement>('.side-diffuser-segment');
        if (sideEls.length > 0) {
          const cRect = container.getBoundingClientRect();
          sideEls.forEach((el) => {
            const id = el.getAttribute('data-key-id') || '';
            const isLeft = el.classList.contains('side-diffuser-left');
            const rect = el.getBoundingClientRect();
            const relY = cRect.height > 0 ? (rect.top + rect.height / 2 - cRect.top) / cRect.height : 0.5;
            const qmkX = isLeft ? 0 : 224;
            const qmkY = Math.round(relY * 64);
            const dx = qmkX - centerX;
            const dy = qmkY - centerY;
            sideDiffusers.push({
              id,
              qmkX,
              qmkY,
              dx,
              dy,
              dist: Math.sqrt(dx * dx + dy * dy),
              isLeft,
              el,
            });
          });
        }
      }

      for (let sIdx = 0; sIdx < sideDiffusers.length; sIdx++) {
        const sd = sideDiffusers[sIdx];
        if (!sd.el) {
          sd.el = container.querySelector<HTMLElement>(`[data-key-id="${sd.id}"]`);
          if (!sd.el) continue;
        }

        let rgb: { r: number; g: number; b: number };

        if (isCustomSidelight) {
          rgb = evalSidelightEffect(sd, sidelight, now, brightness, currentDeviceFamily);
        } else {
          // Follow 1:1 main QMK matrix lighting calculation
          let h = baseH;
          let sVal = baseS;
          let v = baseV;
          let customRgb: { r: number; g: number; b: number } | null = null;

          switch (effect) {
            case 0: // ALL_OFF
              v = 0;
              break;
            case 1: // SOLID_COLOR
              h = baseH;
              sVal = baseS;
              v = baseV;
              break;
            case 3: // GRADIENT_UP_DOWN
              {
                const y = rev ? (64 - sd.qmkY) : sd.qmkY;
                const scale = Math.round((64 * speed) / 255);
                h = (baseH + Math.round(scale * (y / 16))) & 0xFF;
              }
              break;
            case 4: // GRADIENT_LEFT_RIGHT
              {
                const x = rev ? (224 - sd.qmkX) : sd.qmkX;
                const scale = Math.round((64 * speed) / 255);
                h = (baseH + Math.round(scale * (x / 16))) & 0xFF;
              }
              break;
            case 5: // BREATHING
              {
                const phase = now * 0.002 * spdFactor;
                const breath = Math.abs(Math.sin(phase));
                v = Math.round(baseV * (0.08 + 0.92 * breath));
              }
              break;
            case 12: // CYCLE_ALL
              {
                const phase = ((rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
                } else {
                  h = phase;
                }
              }
              break;
            case 13: // CYCLE_LEFT_RIGHT
              {
                const spatialX = Math.round(sd.qmkX * density);
                const phase = (spatialX + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
                } else {
                  h = phase;
                }
              }
              break;
            case 14: // CYCLE_UP_DOWN
              {
                const spatialY = Math.round(sd.qmkY * 4 * density);
                const phase = (spatialY + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
                } else {
                  h = phase;
                }
              }
              break;
            case 16: // CYCLE_OUT_IN
              {
                const phase = (Math.round(1.5 * sd.dist * density) + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
                } else {
                  h = phase;
                }
              }
              break;
            case 18: // PINWHEEL
              {
                const angle = (Math.atan2(sd.dy, sd.dx) + Math.PI) / (2 * Math.PI) * 255;
                const phase = (Math.round(angle * density) + (rev ? (255 - tByte) : tByte) + baseH) & 0xFF;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
                } else {
                  h = phase;
                }
              }
              break;
            case 19: // SPIRAL
              {
                const angle = (Math.atan2(sd.dy, sd.dx) + Math.PI) / (2 * Math.PI) * 255;
                const phase = (Math.round((sd.dist - angle) * density) + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase, baseV / 255, baseS / 255);
                } else {
                  h = phase;
                }
              }
              break;
            case 33: // LUXQMK_WAVE
              {
                const phase = (Math.round((sd.qmkX / 2) * density) + (rev ? -tByte : tByte) + baseH) & 0xFF;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase, baseV / 255);
                } else {
                  h = phase;
                }
              }
              break;
            case 34: // CYCLE_DYNAMIC
              {
                const phase = (rev ? (Math.round(1.5 * sd.dist * density) - tByte) : (Math.round(1.5 * sd.dist * density) + tByte)) + baseH;
                if (activeGrad > 0) {
                  customRgb = sampleGradient(activeGrad, phase & 0xFF, baseV / 255);
                } else {
                  h = phase & 0xFF;
                }
              }
              break;
            default:
              {
                const spatialX = Math.round(sd.qmkX * density);
                const phase = (spatialX + (rev ? tByte : (255 - tByte)) + baseH) & 0xFF;
                h = phase;
              }
              break;
          }

          rgb = customRgb || hsvToRgb(h, sVal, v);
        }

        if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
          sd.el.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          sd.el.style.boxShadow = 'none';
          sd.el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        } else {
          sd.el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`;
          sd.el.style.borderColor = `rgba(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)}, 0.6)`;
          sd.el.style.boxShadow = `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85), 0 0 18px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [containerRef, layoutKeys]);

  return { registerKeyHit };
}
