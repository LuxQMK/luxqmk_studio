/**
 * LuxQMK Studio - Bass Beat Pulse & Treble Shimmer Audio Effect Renderer
 *
 * Cinematic Rhythm & Starlight Lighting Engine:
 * - Dynamic Dual-EMA Spectral Flux kick and drop detection (Fast/Slow envelope)
 * - Powerful 0-to-100% brightness surges with directional wavefront propagation
 * - Continuous sub-bass breathing envelope for organic pumping during sustained low-end
 * - Direction-aware spatial gradient rendering (Rainbow, Curated Palettes, Custom Gradients, Single Color)
 * - Treble Shimmer: High-frequency percussion, hi-hats, and cymbal transients spawn sparkling star glints
 * - Fully synchronized room-filling ambient sidelight pulse
 */

import { AudioEffectRenderer, AudioRenderContext } from '../../types';
import { sampleLinearPaletteRgb, hexToRgbList, hsvToRgb } from '../../palettes';
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

  // Bass beat onset detection & dynamic envelope
  private beatIntensity = 0;
  private beatTime = 0;
  private bassFast = 0;
  private bassSlow = 0;
  private bassPeak = 45;
  private continuousPulse = 0;

  // Treble shimmer
  private prevTreble = 0;
  private sparkles: Map<string, ActiveSparkle> = new Map();

  public reset(): void {
    this.beatIntensity = 0;
    this.beatTime = 0;
    this.bassFast = 0;
    this.bassSlow = 0;
    this.bassPeak = 45;
    this.continuousPulse = 0;
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

    // 1. Dual-EMA Spectral Flux Bass Beat Detection with AGC
    const rawBass = rawBassEnergy !== undefined ? rawBassEnergy : bassEnergy;
    const effBass = Math.max(bassEnergy, rawBass * 1.5) * sensitivity;

    // Dynamic AGC tracking: track running peak of bass with graceful decay
    this.bassPeak = Math.max(effBass, this.bassPeak * 0.992);
    this.bassPeak = Math.max(30, this.bassPeak); // Floor prevents over-triggering during silence

    // Fast EMA (sharp transient attack) & Slow EMA (background bass floor)
    this.bassFast = this.bassFast * 0.40 + effBass * 0.60;
    this.bassSlow = this.bassSlow * 0.94 + effBass * 0.06;

    // Spectral Flux represents the sudden onset above the rolling background
    const flux = Math.max(0, this.bassFast - this.bassSlow);
    const rawFlux = rawBassFlux !== undefined ? rawBassFlux : 0;

    // Adaptive threshold scaled to background energy and sensitivity
    const fluxThreshold = Math.max(3.5, this.bassSlow * 0.20) / Math.max(0.4, sensitivity);
    const minCooldownMs = Math.max(80, 140 / speed);

    const isBeat =
      now - this.beatTime > minCooldownMs &&
      effBass > 10.0 &&
      (flux > fluxThreshold || rawFlux > 6.5);

    if (isBeat) {
      this.beatTime = now;
      const ratio = Math.min(1.0, effBass / this.bassPeak);
      this.beatIntensity = Math.min(1.0, Math.max(0.75, ratio * 1.25));
    }

    // Continuous sub-bass follower for breathing/pumping between beats
    const normEff = Math.min(1.0, effBass / this.bassPeak);
    const targetContinuous = Math.pow(normEff, 1.25);
    this.continuousPulse = this.continuousPulse * 0.70 + targetContinuous * 0.30;

    // 2. Treble Shimmer Trigger (Bands 9..15: ~4.8 kHz - 24 kHz)
    let trebleSum = 0;
    for (let b = 9; b < 16; b++) {
      trebleSum += frequencyBands[b] || 0;
    }
    const trebleAvg = trebleSum / 7;
    const trebleDelta = Math.max(0, trebleAvg - this.prevTreble);
    this.prevTreble = trebleAvg;

    const trebleThreshold = 9.0 / Math.max(0.3, sensitivity);
    if (trebleDelta > trebleThreshold || (trebleAvg > 45 && Math.random() < 0.35)) {
      const keys = geometryManager.getCachedKeys();
      if (keys.length > 0) {
        const sparkleCount = Math.min(5, Math.max(1, Math.floor((trebleDelta / 8) * 2)));
        for (let s = 0; s < sparkleCount; s++) {
          const randKey = keys[Math.floor(Math.random() * keys.length)];
          if (randKey && !randKey.isKnob) {
            this.sparkles.set(randKey.id, {
              keyId: randKey.id,
              startTime: now,
              duration: Math.max(130, 200 / speed),
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
    const { now, config, keys, maxX, maxY, applyKeyStyle } = ctx;
    const direction = config.audioDirection || 'center_out';
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;

    // Time since last kick beat
    const elapsed = now - this.beatTime;
    const waveTravelDuration = Math.max(160, 240 / speed); // ~200ms wave travel across keyboard
    const waveProgress = elapsed / waveTravelDuration; // 0.0 -> 1.0 -> 1.6

    // Global flash component (entire keyboard flashes on beat impact and decays over ~300ms)
    const flashDuration = Math.max(200, 300 / speed);
    const globalFlash = elapsed < flashDuration
      ? Math.pow(1.0 - elapsed / flashDuration, 1.6) * this.beatIntensity
      : 0;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      // Coordinate along the selected direction (0.0 at origin, 1.0 at destination)
      const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, direction, maxX, maxY);
      const pos = dirCoord.primary;

      // 1. Traveling pulse wavefront along the direction
      let waveCrest = 0;
      if (waveProgress >= 0 && waveProgress < 1.6) {
        const distFromWave = Math.abs(pos - waveProgress);
        const waveWidth = 0.40; // Smooth wavefront spread
        if (distFromWave < waveWidth) {
          const shape = Math.cos((distFromWave / waveWidth) * (Math.PI / 2));
          const fade = Math.pow(Math.max(0, 1.0 - waveProgress / 1.6), 1.3);
          waveCrest = shape * fade * this.beatIntensity;
        }
      }

      // Total key pulse combines global flash surge, traveling wave crest, and continuous bass breathing
      const beatSurge = Math.min(1.0, globalFlash * 0.55 + waveCrest * 0.70);
      const totalPulse = Math.min(1.0, Math.max(beatSurge, this.continuousPulse * 0.85));

      // 2. High-dynamic brightness: scales smoothly from floor (e.g. 15%) up to 100%+
      let brightFactor = (floor + (1.0 - floor) * totalPulse) * intensity;
      let rgb: [number, number, number];

      // 3. Spatial Gradient in the selected Direction
      if (palette === 'rainbow') {
        rgb = hsvToRgb(Math.round(pos * 255), 250, 255);
      } else if (palette === 'singleColor') {
        rgb = customRgb;
      } else {
        rgb = sampleLinearPaletteRgb(palette, pos, customRgb);
      }

      // 4. Treble Shimmer Overlay (Starlight Glints)
      const sparkle = this.sparkles.get(k.id);
      if (sparkle) {
        const age = now - sparkle.startTime;
        if (age >= 0 && age < sparkle.duration) {
          const spNorm = age / sparkle.duration;
          const glint = Math.sin(spNorm * Math.PI) * sparkle.intensity;
          brightFactor = Math.min(1.5, Math.max(brightFactor, (0.45 + glint * 0.85) * intensity));

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
    const direction = config.audioDirection || 'center_out';
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;

    // Sidelight position mapping aligned with selected direction
    let pos = normY;
    if (direction === 'bottom_to_top') {
      pos = 1.0 - normY;
    } else if (direction === 'top_to_bottom') {
      pos = normY;
    } else if (direction === 'left_to_right') {
      pos = side === 'left' ? 0.0 : 1.0;
    } else if (direction === 'right_to_left') {
      pos = side === 'left' ? 1.0 : 0.0;
    } else if (direction === 'center_out') {
      pos = Math.abs(normY - 0.5) * 2.0;
    } else if (direction === 'perimeter_in') {
      pos = 1.0 - Math.abs(normY - 0.5) * 2.0;
    }

    const elapsed = now - this.beatTime;
    const waveTravelDuration = Math.max(160, 240 / speed);
    const waveProgress = elapsed / waveTravelDuration;

    const flashDuration = Math.max(200, 300 / speed);
    const globalFlash = elapsed < flashDuration
      ? Math.pow(1.0 - elapsed / flashDuration, 1.6) * this.beatIntensity
      : 0;

    let waveCrest = 0;
    if (waveProgress >= 0 && waveProgress < 1.6) {
      const distFromWave = Math.abs(pos - waveProgress);
      const waveWidth = 0.40;
      if (distFromWave < waveWidth) {
        const shape = Math.cos((distFromWave / waveWidth) * (Math.PI / 2));
        const fade = Math.pow(Math.max(0, 1.0 - waveProgress / 1.6), 1.3);
        waveCrest = shape * fade * this.beatIntensity;
      }
    }

    const beatSurge = Math.min(1.0, globalFlash * 0.55 + waveCrest * 0.70);
    const totalPulse = Math.min(1.0, Math.max(beatSurge, this.continuousPulse * 0.85));

    const bright = (floor + (1.0 - floor) * totalPulse) * intensity;

    let rgb: [number, number, number];
    if (palette === 'rainbow') {
      rgb = hsvToRgb(Math.round(pos * 255), 250, 255);
    } else if (palette === 'singleColor') {
      rgb = customRgb;
    } else {
      rgb = sampleLinearPaletteRgb(palette, pos, customRgb);
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(rgb[0] * bright))),
      g: Math.max(0, Math.min(255, Math.round(rgb[1] * bright))),
      b: Math.max(0, Math.min(255, Math.round(rgb[2] * bright)))
    };
  }
}
