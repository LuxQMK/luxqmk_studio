/**
 * LuxQMK Studio - Bass Beat Pulse & Treble Shimmer Audio Effect Renderer
 *
 * Cinematic Rhythm & Starlight Lighting Engine:
 * - Multi-tiered Bass & Kick Drum Detection (Fast/Slow EMA Flux, Delta Transient, Rolling Baseline AGC)
 * - Polyphonic Wave Superposition: Multiple consecutive beats spawn independent traveling waves without cutoffs
 * - Dynamic 0-to-100% Brightness Surge with directional wavefront propagation
 * - Smooth continuous directional gradient flow (Rainbow, Curated Palettes, Custom Gradients, Single Color)
 * - Treble Shimmer: High-frequency percussion, hi-hats, and cymbal transients spawn sparkling star glints (toggleable)
 * - Fully synchronized room-filling ambient sidelight pulse
 */

import { AudioEffectRenderer, AudioRenderContext } from '../../types';
import { sampleLinearPaletteRgb, hexToRgbList, hsvToRgb } from '../../palettes';
import { geometryManager } from '../../geometry/geometry-manager';
import { getDirectedCoordinate } from '../../geometry/coordinate-mapper';

interface ActiveBassWave {
  id: number;
  startTime: number;
  travelDuration: number;
  decayDuration: number;
  intensity: number;
}

interface ActiveSparkle {
  keyId: string;
  startTime: number;
  duration: number;
  intensity: number;
}

export class BassPulseEffect implements AudioEffectRenderer {
  public id = 'bassPulse';

  // Polyphonic Bass Waves & Dynamic Envelope
  private activeWaves: ActiveBassWave[] = [];
  private waveIdSeq = 0;
  private lastKickTime = 0;
  private prevBass = 0;
  private bassBaseline = 25;
  private bassFast = 0;
  private bassSlow = 0;

  // Treble shimmer
  private prevTreble = 0;
  private sparkles: Map<string, ActiveSparkle> = new Map();

  public reset(): void {
    this.activeWaves = [];
    this.waveIdSeq = 0;
    this.lastKickTime = 0;
    this.prevBass = 0;
    this.bassBaseline = 25;
    this.bassFast = 0;
    this.bassSlow = 0;
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

    // 1. High-Sensitivity Multi-Tiered Bass & Kick Detection
    const rawBass = rawBassEnergy !== undefined ? rawBassEnergy : bassEnergy;
    const currentBass = Math.max(bassEnergy, rawBass * sensitivity * 1.3);

    // Dynamic rolling baseline
    this.bassBaseline = this.bassBaseline * 0.93 + currentBass * 0.07;
    const delta = currentBass - this.prevBass;
    this.prevBass = currentBass;

    // Fast and Slow EMA for spectral flux
    this.bassFast = this.bassFast * 0.35 + currentBass * 0.65;
    this.bassSlow = this.bassSlow * 0.94 + currentBass * 0.06;
    const flux = Math.max(0, this.bassFast - this.bassSlow);

    const fluxThresh = Math.max(3.0, this.bassSlow * 0.20) / Math.max(0.4, sensitivity);
    // Lower cooldown to 70-110ms so rapid consecutive kick beats register cleanly as distinct waves
    const minCooldownMs = Math.max(70, 110 / speed);

    const isKick =
      now - this.lastKickTime > minCooldownMs &&
      currentBass > 12.0 &&
      (flux > fluxThresh ||
        delta > 8.0 / Math.max(0.4, sensitivity) ||
        (rawBassFlux !== undefined && rawBassFlux * sensitivity > 6.0) ||
        currentBass > this.bassBaseline * 1.28 + 4.0);

    if (isKick) {
      this.lastKickTime = now;
      const hitIntensity = Math.min(1.0, Math.max(0.80, (currentBass / 140) * 1.2));
      const travelDuration = Math.max(180, 260 / speed);
      const decayDuration = Math.max(240, 340 / speed);

      // Spawn new wave without interrupting previous waves
      this.activeWaves.push({
        id: ++this.waveIdSeq,
        startTime: now,
        travelDuration,
        decayDuration,
        intensity: hitIntensity
      });

      // Keep at most 6 overlapping active waves in flight
      if (this.activeWaves.length > 6) {
        this.activeWaves.shift();
      }
    }

    // Prune fully completed waves
    this.activeWaves = this.activeWaves.filter(
      (w) => now - w.startTime <= w.travelDuration + w.decayDuration
    );

    // 2. Treble Shimmer Trigger (Bands 9..15: ~4.8 kHz - 24 kHz)
    const enableShimmer = config.audioTrebleShimmer !== false;
    if (!enableShimmer) {
      if (this.sparkles.size > 0) this.sparkles.clear();
    } else {
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
  }

  public render(ctx: AudioRenderContext): void {
    const { now, config, keys, bassEnergy, maxX, maxY, applyKeyStyle } = ctx;
    const direction = config.audioDirection || 'center_out';
    const palette = config.audioColorMode || 'rainbow';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;
    const enableShimmer = config.audioTrebleShimmer !== false;

    // Continuous sub-bass breathing (gentle background elevation during heavy bass)
    const contBass = Math.max(0, (bassEnergy - 20) / 200);
    const continuousGlow = Math.pow(Math.min(1.0, contBass), 1.8) * 0.25;

    // Directional flow offset for background gradient
    const flowOffset = (now * 0.00025 * speed) % 1.0;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      // Coordinate along the selected direction (0.0 at origin, 1.0 at destination)
      const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, direction, maxX, maxY);
      const pos = dirCoord.primary;

      // Polyphonic wave superposition: accumulate all overlapping waves
      let totalWaveEnergy = 0;
      let peakGlow = 0;
      for (let w = 0; w < this.activeWaves.length; w++) {
        const wave = this.activeWaves[w];
        const elapsed = now - wave.startTime;
        const keyArrival = pos * wave.travelDuration;
        const keyAge = elapsed - keyArrival;

        // Punchy flash on kick onset (first 100ms)
        let punch = 0;
        if (elapsed >= 0 && elapsed < 100) {
          punch = (1.0 - elapsed / 100) * 0.40 * wave.intensity;
        }

        // Directional traveling wave crest & decay
        let glow = 0;
        if (keyAge >= 0 && keyAge < wave.decayDuration) {
          if (keyAge < 25) {
            glow = (keyAge / 25) * wave.intensity;
          } else {
            glow = Math.pow(1.0 - (keyAge - 25) / (wave.decayDuration - 25), 1.8) * wave.intensity;
          }
        }

        const waveHit = Math.max(glow, punch);
        totalWaveEnergy += waveHit;
        if (glow > peakGlow) peakGlow = glow;
      }

      // Total key pulse smoothly combines all active waves + continuous sub-bass
      const totalPulse = Math.min(1.0, totalWaveEnergy + continuousGlow);

      // High-dynamic brightness: scales smoothly from floor (e.g. 15%) up to 100%+
      let brightFactor = (floor + (1.0 - floor) * totalPulse) * intensity;

      // Direction-aligned flowing gradient: flows smoothly from origin to destination
      const colorPhase = ((pos - flowOffset) % 1.0 + 1.0) % 1.0;

      let rgb: [number, number, number];
      if (palette === 'rainbow') {
        rgb = hsvToRgb(Math.round(colorPhase * 255), 245, 255);
      } else if (palette === 'singleColor') {
        const whiteLift = peakGlow * 0.35;
        rgb = [
          Math.min(255, Math.round(customRgb[0] * (1 - whiteLift) + 255 * whiteLift)),
          Math.min(255, Math.round(customRgb[1] * (1 - whiteLift) + 255 * whiteLift)),
          Math.min(255, Math.round(customRgb[2] * (1 - whiteLift) + 255 * whiteLift))
        ];
      } else {
        rgb = sampleLinearPaletteRgb(palette, colorPhase, customRgb);
      }

      // Treble Shimmer Overlay (Starlight Glints)
      if (enableShimmer) {
        const sparkle = this.sparkles.get(k.id);
        if (sparkle) {
          const age = now - sparkle.startTime;
          if (age >= 0 && age < sparkle.duration) {
            const spNorm = age / sparkle.duration;
            const glint = Math.sin(spNorm * Math.PI) * sparkle.intensity;
            brightFactor = Math.min(1.5, Math.max(brightFactor, (0.50 + glint * 0.85) * intensity));

            const starTint = Math.min(1.0, glint * 1.35);
            rgb = [
              Math.min(255, Math.round(rgb[0] * (1 - starTint) + 255 * starTint)),
              Math.min(255, Math.round(rgb[1] * (1 - starTint) + 255 * starTint)),
              Math.min(255, Math.round(rgb[2] * (1 - starTint) + 255 * starTint))
            ];
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

    let totalWaveEnergy = 0;
    for (let w = 0; w < this.activeWaves.length; w++) {
      const wave = this.activeWaves[w];
      const elapsed = now - wave.startTime;
      const keyArrival = pos * wave.travelDuration;
      const keyAge = elapsed - keyArrival;

      let punch = 0;
      if (elapsed >= 0 && elapsed < 100) {
        punch = (1.0 - elapsed / 100) * 0.40 * wave.intensity;
      }

      let glow = 0;
      if (keyAge >= 0 && keyAge < wave.decayDuration) {
        if (keyAge < 25) {
          glow = (keyAge / 25) * wave.intensity;
        } else {
          glow = Math.pow(1.0 - (keyAge - 25) / (wave.decayDuration - 25), 1.8) * wave.intensity;
        }
      }
      totalWaveEnergy += Math.max(glow, punch);
    }

    const contBass = Math.max(0, (bassEnergy - 20) / 200);
    const continuousGlow = Math.pow(Math.min(1.0, contBass), 1.8) * 0.25;

    const totalPulse = Math.min(1.0, totalWaveEnergy + continuousGlow);
    const bright = (floor + (1.0 - floor) * totalPulse) * intensity;

    const flowOffset = (now * 0.00025 * speed) % 1.0;
    const colorPhase = ((pos - flowOffset) % 1.0 + 1.0) % 1.0;

    let rgb: [number, number, number];
    if (palette === 'rainbow') {
      rgb = hsvToRgb(Math.round(colorPhase * 255), 245, 255);
    } else if (palette === 'singleColor') {
      rgb = customRgb;
    } else {
      rgb = sampleLinearPaletteRgb(palette, colorPhase, customRgb);
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(rgb[0] * bright))),
      g: Math.max(0, Math.min(255, Math.round(rgb[1] * bright))),
      b: Math.max(0, Math.min(255, Math.round(rgb[2] * bright)))
    };
  }
}
