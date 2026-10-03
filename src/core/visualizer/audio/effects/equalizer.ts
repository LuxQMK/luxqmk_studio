/**
 * LuxQMK Studio - Graphic Equalizer Audio Effect Renderer
 * Supports:
 * - Vertical Spectrum mode (Linear clamped ROYGBIV spectrum & multi-stop gradients)
 * - Background Wave mode (Flowing dynamic gradient animated in time)
 * - Pure saturated Peak Hold dots (no white dilution)
 * - 0% to 100% idle floor dimming
 */

import { AudioEffectRenderer, AudioRenderContext } from '../../types';
import { getDirectedCoordinate } from '../../geometry/coordinate-mapper';
import { samplePaletteRgb, sampleLinearPaletteRgb, hexToRgbList, hsvToRgb } from '../../palettes';

export class EqualizerEffect implements AudioEffectRenderer {
  public id = 'equalizer';

  public render(ctx: AudioRenderContext): void {
    const { now, config, keys, frequencyBands, peakBands, maxX, maxY, applyKeyStyle } = ctx;
    const colorStyle = config.audioColorStyle || 'spectrum';
    const isWaveStyle = colorStyle === 'backgroundWave';
    const palette = config.audioColorMode || 'rainbow';
    const direction = config.audioDirection || 'bottom_to_top';
    const speed = config.audioSpeed || 1.0;
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, direction, maxX, maxY);
      let rgb: [number, number, number] = [0, 0, 0];
      let brightFactor = floor;

      // Equalizer frequency band mapping (16 columns)
      const bandIdx = Math.min(15, Math.max(0, Math.floor(dirCoord.secondary * 16)));
      const bandVal = frequencyBands[bandIdx] || 0;
      const peakVal = peakBands[bandIdx] || 0;

      // Vertical position along the bar: 0.0 (base) -> 1.0 (top peak)
      const heightPos = Math.max(0, Math.min(1.0, dirCoord.primary));
      const heightThreshold = heightPos * 255;

      const fillDiff = bandVal - heightThreshold;
      const antialiasRange = 32;

      // Dynamic animated wave phase (when backgroundWave style is selected)
      const wavePhase = ((dirCoord.primary - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
      // Subtle horizontal stereo-frequency hue offset
      const bandHueOffset = (bandIdx / 15) * 0.15;

      if (fillDiff >= 0 && bandVal > 6) {
        // Active key in the rising equalizer column
        const fillRatio = Math.min(1.0, 0.45 + (fillDiff / antialiasRange) * 0.55);
        brightFactor = (floor + (1.0 - floor) * fillRatio) * intensity;

        if (isWaveStyle) {
          // Dynamic flowing background wave illuminated by equalizer bars
          rgb = samplePaletteRgb(palette, wavePhase, customRgb);
        } else {
          // Vertical Spectral Mode: Deep Royal Blue (0.0) -> Cyan -> Emerald Green -> Amber Gold -> Pure Fiery Crimson Red (1.0)
          if (palette === 'rainbow') {
            const hNorm = ((0.66 - heightPos * 0.66 + bandHueOffset) % 1.0 + 1.0) % 1.0;
            rgb = hsvToRgb(Math.round(hNorm * 255), 255, 255);
          } else if (palette === 'singleColor') {
            const shade = 0.45 + heightPos * 0.55;
            rgb = [
              Math.min(255, Math.round(customRgb[0] * shade)),
              Math.min(255, Math.round(customRgb[1] * shade)),
              Math.min(255, Math.round(customRgb[2] * shade))
            ];
          } else {
            rgb = sampleLinearPaletteRgb(palette, heightPos, customRgb);
          }
        }
      } else {
        // Inactive background above the active bar
        if (floor <= 0.001) {
          brightFactor = 0;
          rgb = [0, 0, 0];
        } else {
          brightFactor = floor * intensity;
          if (isWaveStyle) {
            rgb = samplePaletteRgb(palette, wavePhase, customRgb);
          } else {
            if (palette === 'rainbow') {
              const dimHue = ((0.66 - heightPos * 0.66 + bandHueOffset) % 1.0 + 1.0) % 1.0;
              rgb = hsvToRgb(Math.round(dimHue * 255), 255, 60);
            } else if (palette === 'singleColor') {
              rgb = [Math.round(customRgb[0] * 0.2), Math.round(customRgb[1] * 0.2), Math.round(customRgb[2] * 0.2)];
            } else {
              const basePal = sampleLinearPaletteRgb(palette, heightPos, customRgb);
              rgb = [Math.round(basePal[0] * 0.25), Math.round(basePal[1] * 0.25), Math.round(basePal[2] * 0.25)];
            }
          }
        }
      }

      applyKeyStyle(k, rgb[0], rgb[1], rgb[2], brightFactor);
    }
  }

  public computeSidelightRgb(
    side: 'left' | 'right',
    normY: number,
    now: number,
    config: any,
    frequencyBands: Float32Array
  ): { r: number; g: number; b: number } {
    const colorStyle = config.audioColorStyle || 'spectrum';
    const isWaveStyle = colorStyle === 'backgroundWave';
    const palette = config.audioColorMode || 'rainbow';
    const speed = config.audioSpeed || 1.0;
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');

    const heightPos = 1.0 - normY;
    const heightThreshold = heightPos * 255;
    const bandVal = side === 'left'
      ? (frequencyBands[Math.min(7, Math.floor((1 - normY) * 8))] || 0)
      : (frequencyBands[Math.min(15, 8 + Math.floor((1 - normY) * 8))] || 0);

    const wavePhase = ((normY - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
    let bright = floor * intensity;
    let rgb: [number, number, number] = [0, 0, 0];

    if (bandVal >= heightThreshold && bandVal > 8) {
      const fillDiff = bandVal - heightThreshold;
      const fillRatio = Math.min(1.0, 0.5 + (fillDiff / 32) * 0.5);
      bright = (floor + (1.0 - floor) * fillRatio) * intensity;

      if (isWaveStyle) {
        rgb = samplePaletteRgb(palette, wavePhase, customRgb);
      } else {
        if (palette === 'rainbow') {
          const sideHueOffset = side === 'left' ? 0.0 : 0.12;
          const hNorm = ((0.66 - heightPos * 0.66 + sideHueOffset) % 1.0 + 1.0) % 1.0;
          rgb = hsvToRgb(Math.round(hNorm * 255), 255, 255);
        } else if (palette === 'singleColor') {
          const shade = 0.45 + heightPos * 0.55;
          rgb = [Math.round(customRgb[0] * shade), Math.round(customRgb[1] * shade), Math.round(customRgb[2] * shade)];
        } else {
          rgb = sampleLinearPaletteRgb(palette, heightPos, customRgb);
        }
      }
    } else {
      if (floor <= 0.001) {
        bright = 0;
        rgb = [0, 0, 0];
      } else {
        bright = floor * intensity;
        if (isWaveStyle) {
          rgb = samplePaletteRgb(palette, wavePhase, customRgb);
        } else {
          if (palette === 'rainbow') {
            const sideHueOffset = side === 'left' ? 0.0 : 0.12;
            const dimHue = ((0.66 - heightPos * 0.66 + sideHueOffset) % 1.0 + 1.0) % 1.0;
            rgb = hsvToRgb(Math.round(dimHue * 255), 255, 60);
          } else if (palette === 'singleColor') {
            rgb = [Math.round(customRgb[0] * 0.2), Math.round(customRgb[1] * 0.2), Math.round(customRgb[2] * 0.2)];
          } else {
            const basePal = sampleLinearPaletteRgb(palette, heightPos, customRgb);
            rgb = [Math.round(basePal[0] * 0.25), Math.round(basePal[1] * 0.25), Math.round(basePal[2] * 0.25)];
          }
        }
      }
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(rgb[0] * bright))),
      g: Math.max(0, Math.min(255, Math.round(rgb[1] * bright))),
      b: Math.max(0, Math.min(255, Math.round(rgb[2] * bright)))
    };
  }
}
