/**
 * LuxQMK Studio - Stereo VU Meter Audio Effect Renderer
 *
 * Professional Stereo Audio Level & Peak Programme Meter:
 * - True Independent Left and Right channel separation via Web Audio API Splitter
 * - Full support for 6 Direction Modes (Center-Out, Perimeter-In, Bottom-to-Top, Top-to-Bottom, Left-to-Right, Right-to-Left)
 * - Master Stereo Level Bar & 16-Band Stereo Spectrum (8L + 8R bands) display layouts
 * - Classic Analog/LED Studio VU color scale (Green -> Amber -> Red) and full support for all Curated & Custom Palettes
 * - High-precision Peak Hold indicators with gravitational decay
 * - Dedicated Left & Right Sidelight VU lightbars
 */

import { AudioEffectRenderer, AudioRenderContext } from '../../types';
import { samplePaletteRgb, sampleLinearPaletteRgb, hexToRgbList, hsvToRgb } from '../../palettes';
import { getDirectedCoordinate } from '../../geometry/coordinate-mapper';

export class VuMeterEffect implements AudioEffectRenderer {
  public id = 'vuMeter';

  public render(ctx: AudioRenderContext): void {
    const {
      now,
      config,
      keys,
      maxX,
      maxY,
      applyKeyStyle,
      stereoLeftEnergy = 0,
      stereoRightEnergy = 0,
      stereoLeftPeak = 0,
      stereoRightPeak = 0,
      stereoLeftBands,
      stereoRightBands,
      stereoLeftPeakBands,
      stereoRightPeakBands
    } = ctx;

    const direction = config.audioDirection || 'center_out';
    const vuStyle = config.audioVuStyle === 'stereo_columns' ? 'stereo_columns' : 'master_bar';
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;
    const bgDir = config.audioBackgroundDirection || 'static';

    const midX = maxX / 2;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      const isLeftChannel = k.centerX <= midX;
      let activePos = 0;
      let levelFrac = 0;
      let peakFrac = 0;

      // 1. Compute level & active coordinate based on Direction and Layout
      if (vuStyle === 'stereo_columns') {
        // Multi-band 16-Band Stereo Spectrum (8 Left + 8 Right Bands)
        let bandIdx = 0;
        if (isLeftChannel) {
          const colFrac = Math.max(0, Math.min(0.999, k.centerX / Math.max(1, midX)));
          bandIdx = Math.min(7, Math.floor(colFrac * 8));
          levelFrac = (stereoLeftBands ? stereoLeftBands[bandIdx] || 0 : 0) / 255;
          peakFrac = (stereoLeftPeakBands ? stereoLeftPeakBands[bandIdx] || 0 : 0) / 255;
        } else {
          const colFrac = Math.max(0, Math.min(0.999, (k.centerX - midX) / Math.max(1, maxX - midX)));
          bandIdx = Math.min(7, Math.floor(colFrac * 8));
          levelFrac = (stereoRightBands ? stereoRightBands[bandIdx] || 0 : 0) / 255;
          peakFrac = (stereoRightPeakBands ? stereoRightPeakBands[bandIdx] || 0 : 0) / 255;
        }

        switch (direction) {
          case 'top_to_bottom':
            activePos = k.centerY / Math.max(1, maxY);
            break;
          case 'center_out':
            activePos = isLeftChannel
              ? (midX - k.centerX) / Math.max(1, midX)
              : (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
          case 'perimeter_in':
            activePos = isLeftChannel
              ? 1.0 - (midX - k.centerX) / Math.max(1, midX)
              : 1.0 - (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
          case 'left_to_right':
            activePos = isLeftChannel
              ? k.centerX / Math.max(1, midX)
              : (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
          case 'right_to_left':
            activePos = isLeftChannel
              ? (midX - k.centerX) / Math.max(1, midX)
              : 1.0 - (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
          case 'bottom_to_top':
          default:
            activePos = 1.0 - (k.centerY / Math.max(1, maxY));
            break;
        }
      } else {
        // Master Stereo Level Bar
        const masterLevel = isLeftChannel ? stereoLeftEnergy : stereoRightEnergy;
        const masterPeak = isLeftChannel ? stereoLeftPeak : stereoRightPeak;

        levelFrac = masterLevel / 255;
        peakFrac = masterPeak / 255;

        switch (direction) {
          case 'bottom_to_top':
            activePos = 1.0 - (k.centerY / Math.max(1, maxY));
            break;
          case 'top_to_bottom':
            activePos = k.centerY / Math.max(1, maxY);
            break;
          case 'perimeter_in':
            activePos = isLeftChannel
              ? 1.0 - (midX - k.centerX) / Math.max(1, midX)
              : 1.0 - (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
          case 'left_to_right':
            activePos = isLeftChannel
              ? k.centerX / Math.max(1, midX)
              : (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
          case 'right_to_left':
            activePos = isLeftChannel
              ? (midX - k.centerX) / Math.max(1, midX)
              : 1.0 - (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
          case 'center_out':
          default:
            activePos = isLeftChannel
              ? (midX - k.centerX) / Math.max(1, midX)
              : (k.centerX - midX) / Math.max(1, maxX - midX);
            break;
        }
      }

      // 2. Detection of Active Key & Peak Hold Indicator
      const isActiveKey = activePos <= levelFrac && levelFrac > 0.02;
      const isPeakKey = Math.abs(activePos - peakFrac) < 0.095 && peakFrac > 0.08;

      // 3. Compute Color & Brightness
      let rgb: [number, number, number] = [0, 0, 0];
      let brightFactor = floor * intensity;

      if (isActiveKey) {
        // Sub-key anti-aliased edge falloff
        const fillDiff = levelFrac - activePos;
        const edgeRatio = Math.min(1.0, 0.45 + Math.max(0, fillDiff / 0.16) * 0.55);
        brightFactor = (floor + (1.0 - floor) * edgeRatio) * intensity;
        rgb = this._getVuColor(palette, activePos, customRgb);
      } else {
        // Idle floor background
        if (floor <= 0.001) {
          brightFactor = 0;
          rgb = [0, 0, 0];
        } else {
          brightFactor = floor * intensity;
          if (bgDir === 'static') {
            rgb = this._getDimVuColor(palette, activePos, customRgb);
          } else {
            const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, bgDir, maxX, maxY);
            const wavePhase = ((dirCoord.primary - now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
            rgb = samplePaletteRgb(palette, wavePhase, customRgb);
          }
        }
      }

      // 4. Peak Hold Indicator (Crisp saturated peak dot)
      if (isPeakKey) {
        brightFactor = Math.max(brightFactor, 1.0 * intensity);
        if (palette === 'rainbow') {
          rgb = [255, 24, 24]; // High-contrast Fiery Red peak dot
        } else if (palette === 'singleColor') {
          rgb = [255, 255, 255]; // Crisp white peak glint
        } else {
          rgb = sampleLinearPaletteRgb(palette, 1.0, customRgb);
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
    frequencyBands: Float32Array,
    bassEnergy: number,
    maxX: number,
    stereoLeftEnergy?: number,
    stereoRightEnergy?: number,
    stereoLeftPeak?: number,
    stereoRightPeak?: number
  ): { r: number; g: number; b: number } {
    const direction = config.audioDirection || 'center_out';
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');

    const channelLevel = (side === 'left' ? (stereoLeftEnergy ?? bassEnergy) : (stereoRightEnergy ?? bassEnergy)) / 255;
    const channelPeak = (side === 'left' ? (stereoLeftPeak ?? channelLevel * 255) : (stereoRightPeak ?? channelLevel * 255)) / 255;

    // Sidelight position calculation reacting to audioDirection
    let heightPos = 1.0 - normY; // Default bottom-to-top
    if (direction === 'top_to_bottom') {
      heightPos = normY;
    } else if (direction === 'perimeter_in') {
      heightPos = Math.abs(normY - 0.5) * 2.0;
    }

    const isActive = heightPos <= channelLevel && channelLevel > 0.02;
    const isPeak = Math.abs(heightPos - channelPeak) < 0.12 && channelPeak > 0.08;

    let rgb: [number, number, number] = [0, 0, 0];
    let brightFactor = floor * intensity;

    if (isActive) {
      const fillDiff = channelLevel - heightPos;
      const edgeRatio = Math.min(1.0, 0.45 + Math.max(0, fillDiff / 0.15) * 0.55);
      brightFactor = (floor + (1.0 - floor) * edgeRatio) * intensity;
      rgb = this._getVuColor(palette, heightPos, customRgb);
    } else {
      brightFactor = floor * intensity;
      rgb = this._getDimVuColor(palette, heightPos, customRgb);
    }

    if (isPeak) {
      brightFactor = Math.max(brightFactor, 1.0 * intensity);
      rgb = palette === 'rainbow' ? [255, 24, 24] : sampleLinearPaletteRgb(palette, 1.0, customRgb);
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(rgb[0] * brightFactor))),
      g: Math.max(0, Math.min(255, Math.round(rgb[1] * brightFactor))),
      b: Math.max(0, Math.min(255, Math.round(rgb[2] * brightFactor)))
    };
  }

  private _getVuColor(palette: string, pos: number, customRgb: [number, number, number]): [number, number, number] {
    if (palette === 'rainbow') {
      // Classic professional studio VU scale:
      // 0.0 -> 0.60: Deep Emerald / Vivid Green (Safe Zone)
      // 0.60 -> 0.85: Amber Gold / Warm Yellow (Headroom Warning)
      // 0.85 -> 1.0: Pure Fiery Crimson Red (Peak Saturation)
      if (pos < 0.60) {
        const t = pos / 0.60;
        return [Math.round(20 * t), 230, Math.round(118 * (1 - t))];
      } else if (pos < 0.85) {
        const t = (pos - 0.60) / 0.25;
        return [Math.round(20 + 235 * t), Math.round(230 - 59 * t), 0];
      } else {
        const t = (pos - 0.85) / 0.15;
        return [255, Math.round(171 * (1 - t)), Math.round(40 * t)];
      }
    } else if (palette === 'singleColor') {
      const shade = 0.45 + pos * 0.55;
      return [
        Math.min(255, Math.round(customRgb[0] * shade)),
        Math.min(255, Math.round(customRgb[1] * shade)),
        Math.min(255, Math.round(customRgb[2] * shade))
      ];
    } else {
      return sampleLinearPaletteRgb(palette, pos, customRgb);
    }
  }

  private _getDimVuColor(palette: string, pos: number, customRgb: [number, number, number]): [number, number, number] {
    const full = this._getVuColor(palette, pos, customRgb);
    return [Math.round(full[0] * 0.25), Math.round(full[1] * 0.25), Math.round(full[2] * 0.25)];
  }
}
