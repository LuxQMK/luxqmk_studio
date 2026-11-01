/**
 * LuxQMK Studio - Bass Beat Pulse & Treble Shimmer Audio Effect Renderer
 *
 * Cinematic Rhythm & Starlight Lighting Engine:
 * - Dynamic Transient Onset Detection for punchy kick drums and 808 sub-bass drops
 * - Smooth exponential decay envelope synchronized with music tempo and speed
 * - Direction-aware spatial bloom (Center-Out, Bottom-to-Top, Perimeter-In, etc.)
 * - Treble Shimmer: High-frequency percussion, hi-hats, and cymbal transients spawn sparkling star glints
 * - Ambient room-filling underglow sidelight pulse
 * - Full support for Curated Palettes, Custom Gradients, and Single Accent Color
 */

import { AudioEffectRenderer, AudioRenderContext } from '../../types';
import { samplePaletteRgb, sampleLinearPaletteRgb, hexToRgbList, hsvToRgb } from '../../palettes';
import { geometryManager } from '../../geometry/geometry-manager';
import { getDirectedCoordinate } from '../../geometry/coordinate-mapper';

interface ActiveSparkle {
  keyId: string;
  startTime: number;
  duration: number;
  intensity: number;
}

export class BassPulseEffect implements AudioEffectRenderer {
  public id = 'bassPulse';

  private pulseLevel = 0;
  private prevBass = 0;
  private bassBaseline = 35;
  private lastBeatTime = 0;
  private prevTreble = 0;
  private sparkles: Map<string, ActiveSparkle> = new Map();
  private beatPhaseOffset = 0;

  public reset(): void {
    this.pulseLevel = 0;
    this.prevBass = 0;
    this.bassBaseline = 35;
    this.lastBeatTime = 0;
    this.prevTreble = 0;
    this.sparkles.clear();
    this.beatPhaseOffset = 0;
  }

  public updateAnalysis(
    now: number,
    frequencyBands: Float32Array,
    bassEnergy: number,
    config: any,
    maxX: number,
    maxY: number,
    rawBassFlux?: number,
    rawBassEnergy?: number
  ): void {
    const speed = config.audioSpeed || 1.0;
    const sensitivity = config.audioSensitivity || 1.2;

    // 1. Transient Kick / Beat Detection
    const unclippedBass = rawBassEnergy !== undefined ? rawBassEnergy : bassEnergy;
    const unclippedFlux = rawBassFlux !== undefined ? rawBassFlux : Math.max(0, unclippedBass - this.prevBass);
    const delta = unclippedBass - this.prevBass;
    this.prevBass = unclippedBass;

    this.bassBaseline = this.bassBaseline * 0.94 + unclippedBass * 0.06;

    const minCooldownMs = Math.max(90, 140 / speed);
    const fluxThreshold = 12.0 / Math.max(0.3, sensitivity);

    const isBeat =
      now - this.lastBeatTime > minCooldownMs &&
      unclippedBass > 24.0 &&
      (unclippedFlux > fluxThreshold || (delta > fluxThreshold * 1.25 && unclippedBass > this.bassBaseline + 5.0));

    if (isBeat) {
      this.lastBeatTime = now;
      const hitIntensity = Math.min(1.0, Math.max(0.55, (unclippedBass / 240) * 1.3));
      this.pulseLevel = Math.max(this.pulseLevel, hitIntensity);
      this.beatPhaseOffset = (this.beatPhaseOffset + 0.12) % 1.0;
    }

    // 2. Treble Shimmer Trigger (Bands 9..15: ~4.8 kHz - 24 kHz)
    let trebleSum = 0;
    for (let b = 9; b < 16; b++) {
      trebleSum += frequencyBands[b] || 0;
    }
    const trebleAvg = trebleSum / 7;
    const trebleDelta = Math.max(0, trebleAvg - this.prevTreble);
    this.prevTreble = trebleAvg;

    const trebleThreshold = 14.0 / Math.max(0.3, sensitivity);
    if (trebleDelta > trebleThreshold || (trebleAvg > 65 && Math.random() < 0.28)) {
      // Spawn 1 to 4 random sparkles across available keys
      const keys = geometryManager.getCachedKeys();
      if (keys.length > 0) {
        const sparkleCount = Math.min(4, Math.max(1, Math.floor((trebleDelta / 15) * 2)));
        for (let s = 0; s < sparkleCount; s++) {
          const randKey = keys[Math.floor(Math.random() * keys.length)];
          if (randKey && !randKey.isKnob) {
            this.sparkles.set(randKey.id, {
              keyId: randKey.id,
              startTime: now,
              duration: Math.max(120, 200 / speed),
              intensity: Math.min(1.0, 0.65 + (trebleAvg / 255) * 0.5)
            });
          }
        }
      }
    }

    // Prune expired sparkles
    this.sparkles.forEach((sp, id) => {
      if (now - sp.startTime > sp.duration) {
        this.sparkles.delete(id);
      }
    });
  }

  public render(ctx: AudioRenderContext): void {
    const { now, dt, config, keys, bassEnergy, maxX, maxY, applyKeyStyle } = ctx;
    const direction = config.audioDirection || 'center_out';
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;
    const bgDir = config.audioBackgroundDirection || 'static';

    // Exponential decay of beat pulse envelope
    const decayFactor = Math.exp(-dt / (180 / speed));
    this.pulseLevel *= decayFactor;

    // Combine transient kick impact with continuous sub-bass rumble
    const continuousBass = (bassEnergy / 255) * 0.75;
    const masterPulse = Math.min(1.0, Math.max(this.pulseLevel, continuousBass));

    const maxDist = geometryManager.maxDist || 125;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      // 1. Calculate spatial falloff based on effect direction
      let distFrac = 0;
      switch (direction) {
        case 'bottom_to_top':
          distFrac = 1.0 - (k.centerY / Math.max(1, maxY));
          break;
        case 'top_to_bottom':
          distFrac = k.centerY / Math.max(1, maxY);
          break;
        case 'left_to_right':
          distFrac = k.centerX / Math.max(1, maxX);
          break;
        case 'right_to_left':
          distFrac = 1.0 - (k.centerX / Math.max(1, maxX));
          break;
        case 'perimeter_in': {
          const d = k.dist !== undefined ? k.dist : Math.hypot(k.dx, k.dy);
          distFrac = 1.0 - (d / maxDist);
          break;
        }
        case 'center_out':
        default: {
          const d = k.dist !== undefined ? k.dist : Math.hypot(k.dx, k.dy);
          distFrac = d / maxDist;
          break;
        }
      }

      // Smooth radial bloom from the epicenter
      const waveSpread = 0.40;
      const keyPulse = Math.max(0, masterPulse - distFrac * waveSpread) / (1.0 - waveSpread * 0.5);
      const effectivePulse = Math.min(1.0, Math.max(0, keyPulse));

      // 2. Base Color & Brightness from Palette
      let brightFactor = (floor + (1.0 - floor) * effectivePulse) * intensity;
      let rgb: [number, number, number] = [0, 0, 0];

      // Time-animated phase offset modulated by beats
      let colorPhase = 0.5;
      if (bgDir !== 'static') {
        const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, bgDir === 'follow' ? direction : bgDir, maxX, maxY);
        colorPhase = (((dirCoord.primary * 0.5 + this.beatPhaseOffset) - now * 0.0005 * speed) % 1.0 + 1.0) % 1.0;
      } else {
        colorPhase = (((distFrac * 0.35 + this.beatPhaseOffset) - now * 0.0003 * speed) % 1.0 + 1.0) % 1.0;
      }

      if (palette === 'rainbow') {
        rgb = hsvToRgb(Math.round(colorPhase * 255), 240, 255);
      } else if (palette === 'singleColor') {
        const shade = 0.5 + effectivePulse * 0.5;
        rgb = [
          Math.min(255, Math.round(customRgb[0] * shade)),
          Math.min(255, Math.round(customRgb[1] * shade)),
          Math.min(255, Math.round(customRgb[2] * shade))
        ];
      } else {
        rgb = sampleLinearPaletteRgb(palette, ((distFrac * 0.6 + colorPhase * 0.4) % 1.0 + 1.0) % 1.0, customRgb);
      }

      // 3. Treble Shimmer Overlay (Starlight Glints)
      const sparkle = this.sparkles.get(k.id);
      if (sparkle) {
        const age = now - sparkle.startTime;
        if (age >= 0 && age < sparkle.duration) {
          const spNorm = age / sparkle.duration;
          // Crisp bell curve attack & smooth sparkle decay
          const glint = Math.sin(spNorm * Math.PI) * sparkle.intensity;
          brightFactor = Math.min(1.5, Math.max(brightFactor, (0.45 + glint * 0.85) * intensity));

          // Star glint tint: blend towards pure brilliant white
          const starTint = Math.min(1.0, glint * 1.25);
          rgb = [
            Math.min(255, Math.round(rgb[0] * (1 - starTint) + 255 * starTint)),
            Math.min(255, Math.round(rgb[1] * (1 - starTint) + 255 * starTint)),
            Math.min(255, Math.round(rgb[2] * (1 - starTint) + 255 * starTint))
          ];
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
    maxX: number
  ): { r: number; g: number; b: number } {
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;

    // Ambient room-filling pulse underglow
    const continuousBass = (bassEnergy / 255) * 0.75;
    const masterPulse = Math.min(1.0, Math.max(this.pulseLevel, continuousBass));

    const bright = (floor + (1.0 - floor) * masterPulse) * intensity;
    const colorPhase = (((normY * 0.35 + this.beatPhaseOffset) - now * 0.0004 * speed) % 1.0 + 1.0) % 1.0;

    let rgb: [number, number, number] = [0, 0, 0];
    if (palette === 'rainbow') {
      rgb = hsvToRgb(Math.round(colorPhase * 255), 240, 255);
    } else if (palette === 'singleColor') {
      rgb = customRgb;
    } else {
      rgb = samplePaletteRgb(palette, colorPhase, customRgb);
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(rgb[0] * bright))),
      g: Math.max(0, Math.min(255, Math.round(rgb[1] * bright))),
      b: Math.max(0, Math.min(255, Math.round(rgb[2] * bright)))
    };
  }
}

