/**
 * LuxQMK Studio - Multi-Stop Gradient and Palette Samplers
 */

import { PaletteStop } from '../types';
import { PALETTES } from './palettes';
import { hexToRgbList, hsvToRgb } from './color-utils';
import { useVisualizerStore } from '../../../store/useVisualizerStore';

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

export function sampleLinearPaletteRgb(
  paletteName: string,
  factor: number,
  customSingleRgb?: [number, number, number]
): [number, number, number] {
  if (paletteName === 'singleColor' && customSingleRgb) {
    return customSingleRgb;
  }
  const f = Math.max(0, Math.min(1.0, Number.isFinite(factor) ? factor : 0));

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
    // Saturated Dynamic Equalizer Spectrum: Deep Royal Blue (0.0) -> Cyan -> Emerald Green -> Amber Gold -> Pure Fiery Crimson Red (1.0)
    // Never turns white!
    const hNorm = ((0.66 - f * 0.66) % 1.0 + 1.0) % 1.0;
    return hsvToRgb(Math.round(hNorm * 255), 255, 255);
  }

  const s0 = stops[0];
  const sLast = stops[stops.length - 1];

  if (f <= s0.pos) return s0.rgb;
  if (f >= sLast.pos) return sLast.rgb;

  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (f >= s1.pos && f <= s2.pos) {
      const span = s2.pos - s1.pos || 0.001;
      const t = Math.max(0, Math.min(1, (f - s1.pos) / span));
      return [
        Math.max(0, Math.min(255, Math.round(s1.rgb[0] + (s2.rgb[0] - s1.rgb[0]) * t))),
        Math.max(0, Math.min(255, Math.round(s1.rgb[1] + (s2.rgb[1] - s1.rgb[1]) * t))),
        Math.max(0, Math.min(255, Math.round(s1.rgb[2] + (s2.rgb[2] - s1.rgb[2]) * t)))
      ];
    }
  }
  return sLast.rgb;
}
