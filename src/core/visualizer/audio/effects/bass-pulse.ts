/**
 * LuxQMK Studio - Bass Beat Pulse & Treble Shimmer Audio Effect Renderer
 *
 * Cinematic Rhythm & Starlight Lighting Engine:
 * - Dynamic Transient Onset Detection & continuous sub-bass envelope follower
 * - Powerful 0-to-100% brightness surges on kick drums and 808 drops with smooth musical decay
 * - Wave propagation following effect direction (Center-Out, Bottom-to-Top, Perimeter-In, etc.)
 * - Smooth continuous color flow with zero abrupt color snapping or jumping
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
  private bassAverage = 30;
  private prevTreble = 0;
  private sparkles: Map<string, ActiveSparkle> = new Map();

  public reset(): void {
    this.beatIntensity = 0;
    this.beatTime = 0;
    this.prevBass = 0;
    this.bassAverage = 30;
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

    // 1. Robust Transient Kick & Beat Detection
    // Use bassEnergy directly (properly scaled by user sensitivity)
    const currentBass = bassEnergy;
    const delta = currentBass - this.prevBass;
    this.prevBass = currentBass;

    // Moving average of bass volume for adaptive thresholding
    this.bassAverage = this.bassAverage * 0.92 + currentBass * 0.08;

    const minCooldownMs = Math.max(90, 140 / speed);
    const fluxThreshold = 9.0 / Math.max(0.3, sensitivity);

    const isBeat =
      now - this.beatTime > minCooldownMs &&
      currentBass > 20.0 &&
      (delta > fluxThreshold || currentBass > this.bassAverage * 1.35 + 8.0);

    if (isBeat) {
      this.beatTime = now;
      // High-energy surge: scale punch from 0.75 up to 1.0
      this.beatIntensity = Math.min(1.0, Math.max(0.75, (currentBass / 220) * 1.3));
    }

    // 2. Treble Shimmer Trigger (Bands 9..15: ~4.8 kHz - 24 kHz)
    let trebleSum = 0;
    for (let b = 9; b < 16; b++) {
      trebleSum += frequencyBands[b] || 0;
    }
    const trebleAvg = trebleSum / 7;
    const trebleDelta = Math.max(0, trebleAvg - this.prevTreble);
    this.prevTreble = trebleAvg;

    const trebleThreshold = 12.0 / Math.max(0.3, sensitivity);
    if (trebleDelta > trebleThreshold || (trebleAvg > 60 && Math.random() < 0.35)) {
      // Spawn 1 to 4 random sparkles across available keys
      const keys = geometryManager.getCachedKeys();
      if (keys.length > 0) {
        const sparkleCount = Math.min(4, Math.max(1, Math.floor((trebleDelta / 12) * 2)));
        for (let s = 0; s < sparkleCount; s++) {
          const randKey = keys[Math.floor(Math.random() * keys.length)];
          if (randKey && !randKey.isKnob) {
            this.sparkles.set(randKey.id, {
              keyId: randKey.id,
              startTime: now,
              duration: Math.max(110, 180 / speed),
              intensity: Math.min(1.0, 0.70 + (trebleAvg / 255) * 0.5)
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
    const bgDir = config.audioBackgroundDirection || 'static';

    const maxDist = geometryManager.maxDist || 125;
    const timeSinceBeat = now - this.beatTime;
    const beatDuration = Math.max(220, 340 / speed); // ~250-350ms musical surge envelope

    // Continuous bass follower so sub-bass drone keeps the keyboard pumping between kicks
    const continuousBass = Math.min(1.0, (bassEnergy / 255) * 1.15);

    // Smooth continuous global color phase (NO sudden jumps on beats)
    const timeColorPhase = (now * 0.00035 * speed) % 1.0;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      // 1. Calculate spatial wave propagation delay based on effect direction
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

      // Wave propagation delay from epicenter across the keyboard (~0 to 110ms)
      const waveDelay = distFrac * 110;
      const keyTimeSinceBeat = Math.max(0, timeSinceBeat - waveDelay);

      let keyBeatGlow = 0;
      if (keyTimeSinceBeat < beatDuration) {
        const tNorm = keyTimeSinceBeat / beatDuration;
        // Punchy attack (first 25ms) followed by smooth exponential decay
        if (tNorm < 0.08) {
          keyBeatGlow = (tNorm / 0.08) * this.beatIntensity;
        } else {
          keyBeatGlow = Math.pow(1.0 - (tNorm - 0.08) / 0.92, 2.0) * this.beatIntensity;
        }
      }

      // Master key pulse combines transient kick flash with continuous bass rumble
      const totalKeyPulse = Math.min(1.0, Math.max(keyBeatGlow, continuousBass * 0.75));

      // 2. High-dynamic brightness: smoothly scales from floor (e.g. 15%) up to 100%+
      let brightFactor = (floor + (1.0 - floor) * totalKeyPulse) * intensity;
      let rgb: [number, number, number] = [0, 0, 0];

      // Smooth flowing color phase without sudden jumps
      let colorCoord = distFrac * 0.35;
      if (bgDir !== 'static') {
        const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, bgDir === 'follow' ? direction : bgDir, maxX, maxY);
        colorCoord = dirCoord.primary * 0.45;
      }
      const smoothColorPhase = ((timeColorPhase + colorCoord) % 1.0 + 1.0) % 1.0;

      if (palette === 'rainbow') {
        rgb = hsvToRgb(Math.round(smoothColorPhase * 255), 235, 255);
      } else if (palette === 'singleColor') {
        // Luminance boost on beats
        const shade = 0.55 + totalKeyPulse * 0.45;
        rgb = [
          Math.min(255, Math.round(customRgb[0] * shade)),
          Math.min(255, Math.round(customRgb[1] * shade)),
          Math.min(255, Math.round(customRgb[2] * shade))
        ];
      } else {
        rgb = sampleLinearPaletteRgb(palette, smoothColorPhase, customRgb);
      }

      // 3. Treble Shimmer Overlay (Starlight Glints)
      const sparkle = this.sparkles.get(k.id);
      if (sparkle) {
        const age = now - sparkle.startTime;
        if (age >= 0 && age < sparkle.duration) {
          const spNorm = age / sparkle.duration;
          // Smooth bell-curve sparkle attack and fade
          const glint = Math.sin(spNorm * Math.PI) * sparkle.intensity;
          brightFactor = Math.min(1.5, Math.max(brightFactor, (0.50 + glint * 0.90) * intensity));

          // Star glint tint: blend towards pure brilliant white
          const starTint = Math.min(1.0, glint * 1.3);
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

    // Sidelights pulse in sync with the beat surge and continuous bass
    const timeSinceBeat = now - this.beatTime;
    const beatDuration = Math.max(220, 340 / speed);

    let beatGlow = 0;
    if (timeSinceBeat >= 0 && timeSinceBeat < beatDuration) {
      const tNorm = timeSinceBeat / beatDuration;
      beatGlow = Math.pow(1.0 - tNorm, 2.0) * this.beatIntensity;
    }

    const continuousBass = Math.min(1.0, (bassEnergy / 255) * 1.15);
    const totalPulse = Math.min(1.0, Math.max(beatGlow, continuousBass * 0.75));

    const bright = (floor + (1.0 - floor) * totalPulse) * intensity;
    const timeColorPhase = (now * 0.00035 * speed) % 1.0;
    const colorPhase = ((timeColorPhase + normY * 0.3) % 1.0 + 1.0) % 1.0;

    let rgb: [number, number, number] = [0, 0, 0];
    if (palette === 'rainbow') {
      rgb = hsvToRgb(Math.round(colorPhase * 255), 235, 255);
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
