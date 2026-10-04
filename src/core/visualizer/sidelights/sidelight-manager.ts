/**
 * LuxQMK Studio - Sidelights (Underglow Lightbars) Manager
 */

import { useUIStore } from '../../../store/useUIStore';
import { audioEffectsRegistry } from '../audio/audio-effects-registry';
import { samplePaletteRgb, hexToRgbList, PALETTES } from '../palettes';
import { getDirectedCoordinate } from '../geometry/coordinate-mapper';
import { gifPlayerService } from '../gif/gif-player-service';

export class SidelightManager {
  public computeSidelightRgb(
    side: 'left' | 'right',
    index: number,
    totalCount: number,
    now: number,
    config: any,
    frequencyBands: Float32Array,
    bassEnergy: number,
    beatDecay: number,
    maxX: number,
    maxY: number
  ): { r: number; g: number; b: number } {
    const isCustom = !!config.sidelightCustomEnable;
    const normY = (index + 0.5) / (totalCount || 1); // 0..1 from top to bottom
    const posX = side === 'left' ? 0 : maxX;
    const posY = normY * maxY;

    if (!isCustom || config.sidelightMode === 'followMain') {
      const activeTab = useUIStore.getState().studioSubTab;
      if (activeTab === 'gif') {
        return gifPlayerService.computeSidelightRgb(side, normY, config);
      }

      if (activeTab === 'audio') {
        const audioMode = config.audioMode || 'equalizer';
        const eff = audioEffectsRegistry.get(audioMode);
        if (eff && eff.computeSidelightRgb) {
          const res = eff.computeSidelightRgb(side, normY, now, config, frequencyBands, bassEnergy, maxX);
          if (res) return res;
        }

        // Fallback Equalizer VU meter for sidelights
        const palette = config.audioColorMode || 'rainbow';
        const intensity = config.audioIntensity || 1.0;
        const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
        const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
        const heightPos = 1.0 - normY;
        const heightThreshold = heightPos * 255;
        const bandVal = side === 'left'
          ? (frequencyBands[Math.min(7, Math.floor((1 - normY) * 8))] || 0)
          : (frequencyBands[Math.min(15, 8 + Math.floor((1 - normY) * 8))] || 0);

        let bright = floor * intensity;
        let rgb: [number, number, number] = [0, 0, 0];

        if (bandVal >= heightThreshold && bandVal > 8) {
          const fillDiff = bandVal - heightThreshold;
          const fillRatio = Math.min(1.0, 0.5 + (fillDiff / 32) * 0.5);
          bright = (floor + (1.0 - floor) * fillRatio) * intensity;
          rgb = samplePaletteRgb(palette, heightPos, customRgb);
        } else {
          bright = floor * intensity;
          rgb = samplePaletteRgb(palette, 0.0, customRgb);
        }

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
        const floor = config.softwareFloor !== undefined ? config.softwareFloor : 0.10;
        const customRgb = hexToRgbList(config.softwareSingleColor || '#00ffff');
        const dirCoord = getDirectedCoordinate(posX, posY, direction, maxX, maxY);

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
      const band = side === 'left' ? frequencyBands[2] : frequencyBands[13];
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

    if (mode === 'centerWave') {
      const distFromCenter = Math.abs(normY - 0.5) * 2;
      const phase = ((distFromCenter - now * 0.001 * speed) % 1.0 + 1.0) % 1.0;
      const rgb = samplePaletteRgb(palette, phase, customRgb);
      return {
        r: Math.min(255, Math.round(rgb[0] * intensity)),
        g: Math.min(255, Math.round(rgb[1] * intensity)),
        b: Math.min(255, Math.round(rgb[2] * intensity))
      };
    }

    if (mode === 'rhythmicPulse') {
      const pulseNorm = Math.max(0.1, (beatDecay * 0.7 + (bassEnergy / 255) * 0.5));
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

  public renderSidelightDom(
    now: number,
    config: any,
    frequencyBands: Float32Array,
    bassEnergy: number,
    beatDecay: number,
    maxX: number,
    maxY: number
  ): void {
    if (typeof document === 'undefined') return;
    const leftEls = document.querySelectorAll<HTMLElement>('#studioLightingKeyboardCanvas .side-diffuser-left');
    const rightEls = document.querySelectorAll<HTMLElement>('#studioLightingKeyboardCanvas .side-diffuser-right');

    leftEls.forEach((el, i) => {
      const rgb = this.computeSidelightRgb('left', i, leftEls.length, now, config, frequencyBands, bassEnergy, beatDecay, maxX, maxY);
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
      const rgb = this.computeSidelightRgb('right', i, rightEls.length, now, config, frequencyBands, bassEnergy, beatDecay, maxX, maxY);
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
}

export const sidelightManager = new SidelightManager();
