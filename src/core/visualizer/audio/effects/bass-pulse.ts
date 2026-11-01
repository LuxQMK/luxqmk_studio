/**
 * LuxQMK Studio - Bass Beat Pulse & Treble Shimmer Audio Effect Renderer
 *
 * Cinematic Rhythm & Starlight Lighting Engine:
 * - Dynamic Adaptive Beat & Kick Detection with automatic gain tracking
 * - Powerful 0-to-100% brightness surge and continuous sub-bass breathing envelope
 * - Wave propagation following selected Effect Direction (Center-Out, Bottom-to-Top, Left-to-Right, etc.)
 * - Clean, unified color presentation with zero scrolling rainbow rings or gradient crawl
 * - Treble Shimmer: High-frequency percussion, hi-hats, and cymbal transients spawn sparkling star glints
 * - Room-filling ambient underglow sidelight pulse
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

  private beatIntensity = 0;
  private beatTime = 0;
  private prevBass = 0;
  private bassFloor = 18;
  private bassPeak = 65;
  private prevTreble = 0;
  private sparkles: Map<string, ActiveSparkle> = new Map();

  public reset(): void {
    this.beatIntensity = 0;
    this.beatTime = 0;
    this.prevBass = 0;
    this.bassFloor = 18;
    this.bassPeak = 65;
    this.prevTreble = 0;
    this.sparkles.clear();
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

    // 1. Adaptive Kick & Bass Beat Detection with AGC (Automatic Gain Calibration)
    const rawBass = rawBassEnergy !== undefined ? rawBassEnergy : bassEnergy;
    const effBass = Math.max(bassEnergy, rawBass * 1.6) * sensitivity;

    // Slowly track dynamic noise floor and signal peak
    this.bassFloor = this.bassFloor * 0.98 + effBass * 0.02;
    this.bassPeak = Math.max(effBass, this.bassPeak * 0.992);
    const dynamicRange = Math.max(20, this.bassPeak - this.bassFloor);
    const normalizedBass = Math.max(0, Math.min(1.0, (effBass - this.bassFloor) / dynamicRange));

    const delta = normalizedBass - this.prevBass;
    this.prevBass = normalizedBass;

    const minCooldownMs = Math.max(90, 150 / speed);
    const fluxThreshold = 0.12 / Math.max(0.4, sensitivity);

    const isBeat =
      now - this.beatTime > minCooldownMs &&
      normalizedBass > 0.22 &&
      (delta > fluxThreshold || (rawBassFlux !== undefined && rawBassFlux > 10.0));

    if (isBeat) {
      this.beatTime = now;
      this.beatIntensity = Math.min(1.0, Math.max(0.75, normalizedBass * 1.3));
    }

    // 2. Treble Shimmer Trigger (Bands 9..15: ~4.8 kHz - 24 kHz)
    let trebleSum = 0;
    for (let b = 9; b < 16; b++) {
      trebleSum += frequencyBands[b] || 0;
    }
    const trebleAvg = trebleSum / 7;
    const trebleDelta = Math.max(0, trebleAvg - this.prevTreble);
    this.prevTreble = trebleAvg;

    const trebleThreshold = 10.0 / Math.max(0.3, sensitivity);
    if (trebleDelta > trebleThreshold || (trebleAvg > 50 && Math.random() < 0.35)) {
      const keys = geometryManager.getCachedKeys();
      if (keys.length > 0) {
        const sparkleCount = Math.min(4, Math.max(1, Math.floor((trebleDelta / 10) * 2)));
        for (let s = 0; s < sparkleCount; s++) {
          const randKey = keys[Math.floor(Math.random() * keys.length)];
          if (randKey && !randKey.isKnob) {
            this.sparkles.set(randKey.id, {
              keyId: randKey.id,
              startTime: now,
              duration: Math.max(120, 190 / speed),
              intensity: Math.min(1.0, 0.75 + (trebleAvg / 255) * 0.5)
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
    const { now, config, keys, bassEnergy, maxX, maxY, applyKeyStyle } = ctx;
    const direction = config.audioDirection || 'center_out';
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;

    // Time since last kick beat
    const elapsed = now - this.beatTime;
    const waveTravelDuration = Math.max(180, 260 / speed); // ~200ms wave travel across keyboard
    const waveProgress = elapsed / waveTravelDuration; // 0.0 -> 1.0+

    // Continuous sub-bass follower for breathing between kicks
    const sensitivity = config.audioSensitivity || 1.2;
    const effBass = (bassEnergy / 255) * sensitivity;
    const continuousPulse = Math.pow(Math.min(1.0, effBass * 1.3), 1.2);

    // Global harmonious color phase that slowly cycles over time (NO concentric rings)
    const globalHue = (now * 0.00018 * speed) % 1.0;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      // Coordinate along the selected direction (0.0 at origin, 1.0 at destination)
      const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, direction, maxX, maxY);
      const pos = dirCoord.primary;

      // 1. Calculate traveling pulse wavefront
      let beatPulse = 0;
      if (waveProgress >= 0 && waveProgress < 1.6) {
        const distFromWave = Math.abs(pos - waveProgress);
        const waveWidth = 0.35; // smooth wave width
        if (distFromWave < waveWidth) {
          const crest = Math.cos((distFromWave / waveWidth) * (Math.PI / 2));
          const fade = Math.pow(Math.max(0, 1.0 - waveProgress / 1.6), 1.5);
          beatPulse = crest * fade * this.beatIntensity;
        }
      }

      // Total key pulse combines propagating beat surge and continuous bass breathing
      const totalPulse = Math.min(1.0, Math.max(beatPulse, continuousPulse * 0.80));

      // 2. High-dynamic brightness: scales smoothly from floor (e.g. 15%) up to 100%+
      let brightFactor = (floor + (1.0 - floor) * totalPulse) * intensity;
      let rgb: [number, number, number] = [0, 0, 0];

      // Clean, unified palette mapping without concentric rainbow stripes
      if (palette === 'rainbow') {
        rgb = hsvToRgb(Math.round(globalHue * 255), 240, 255);
      } else if (palette === 'singleColor') {
        const shade = 0.55 + totalPulse * 0.45;
        rgb = [
          Math.min(255, Math.round(customRgb[0] * shade)),
          Math.min(255, Math.round(customRgb[1] * shade)),
          Math.min(255, Math.round(customRgb[2] * shade))
        ];
      } else {
        rgb = samplePaletteRgb(palette, globalHue, customRgb);
      }

      // 3. Treble Shimmer Overlay (Starlight Glints)
      const sparkle = this.sparkles.get(k.id);
      if (sparkle) {
        const age = now - sparkle.startTime;
        if (age >= 0 && age < sparkle.duration) {
          const spNorm = age / sparkle.duration;
          const glint = Math.sin(spNorm * Math.PI) * sparkle.intensity;
          brightFactor = Math.min(1.5, Math.max(brightFactor, (0.50 + glint * 0.90) * intensity));

          const starTint = Math.min(1.0, glint * 1.35);
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
    const sensitivity = config.audioSensitivity || 1.2;

    const elapsed = now - this.beatTime;
    const waveTravelDuration = Math.max(180, 260 / speed);
    const waveProgress = elapsed / waveTravelDuration;

    let beatGlow = 0;
    if (waveProgress >= 0 && waveProgress < 1.6) {
      beatGlow = Math.pow(Math.max(0, 1.0 - waveProgress / 1.6), 1.5) * this.beatIntensity;
    }

    const effBass = (bassEnergy / 255) * sensitivity;
    const continuousPulse = Math.pow(Math.min(1.0, effBass * 1.3), 1.2);
    const totalPulse = Math.min(1.0, Math.max(beatGlow, continuousPulse * 0.80));

    const bright = (floor + (1.0 - floor) * totalPulse) * intensity;
    const globalHue = (now * 0.00018 * speed) % 1.0;

    let rgb: [number, number, number] = [0, 0, 0];
    if (palette === 'rainbow') {
      rgb = hsvToRgb(Math.round(globalHue * 255), 240, 255);
    } else if (palette === 'singleColor') {
      rgb = customRgb;
    } else {
      rgb = samplePaletteRgb(palette, globalHue, customRgb);
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(rgb[0] * bright))),
      g: Math.max(0, Math.min(255, Math.round(rgb[1] * bright))),
      b: Math.max(0, Math.min(255, Math.round(rgb[2] * bright)))
    };
  }
}
