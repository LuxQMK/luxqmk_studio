/**
 * LuxQMK Studio - Bass Shockwave Audio Effect Renderer
 *
 * Razor-Sharp High-Contrast Shockwave Engine:
 * - High-precision transient onset detection for kicks, 808 drops, and rhythm beats
 * - Ultra-crisp expanding wavefront rings (width ~0.9 key) with dark/dim background contrast
 * - Sub-frame temporal progression across 60 FPS
 * - Concentric multi-ring superposition for polyphonic beat trains and drum rolls
 * - Epicenter transient flash at the origin
 * - Seamless support for Curated Palettes, Custom Gradients, Single Accent Colors, and 6 Directions
 */

import { AudioEffectRenderer, AudioRenderContext } from '../../types';
import { samplePaletteRgb, sampleLinearPaletteRgb, hexToRgbList, hsvToRgb } from '../../palettes';
import { geometryManager } from '../../geometry/geometry-manager';

interface ActiveShockwaveRing {
  id: number;
  startTime: number;
  duration: number;
  maxRadius: number;
  speed: number;
  intensity: number;
  paletteOffset: number;
}

export class BassShockwaveEffect implements AudioEffectRenderer {
  public id = 'bassShockwave';

  private activeRings: ActiveShockwaveRing[] = [];
  private ringIdSequence = 0;
  private lastBeatTime = 0;
  private prevBass = 0;
  private bassBaseline = 35;
  private epicenterFlashUntil = 0;
  private epicenterFlashIntensity = 0;

  public reset(): void {
    this.activeRings = [];
    this.ringIdSequence = 0;
    this.lastBeatTime = 0;
    this.prevBass = 0;
    this.bassBaseline = 35;
    this.epicenterFlashUntil = 0;
    this.epicenterFlashIntensity = 0;
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

    // Use unclipped raw low-end dynamics directly from AudioAnalyzer
    const unclippedBass = rawBassEnergy !== undefined ? rawBassEnergy : bassEnergy;
    const unclippedFlux = rawBassFlux !== undefined ? rawBassFlux : Math.max(0, unclippedBass - this.prevBass);
    const delta = unclippedBass - this.prevBass;
    this.prevBass = unclippedBass;

    // Dynamic moving baseline for ratio estimation
    this.bassBaseline = this.bassBaseline * 0.94 + unclippedBass * 0.06;

    const minCooldownMs = Math.max(85, 130 / speed);
    // Dynamic flux threshold: smoothly scales with sensitivity slider
    const fluxThreshold = 12.5 / Math.max(0.3, sensitivity);

    // Universal robust beat trigger
    const isBeat =
      now - this.lastBeatTime > minCooldownMs &&
      unclippedBass > 25.0 &&
      (unclippedFlux > fluxThreshold || (delta > fluxThreshold * 1.3 && unclippedBass > this.bassBaseline + 6.0));

    if (isBeat) {
      this.lastBeatTime = now;

      const maxDist = geometryManager.maxDist || 125;

      // Fast, snappy, cinematic wave duration (~280-400ms)
      const duration = Math.max(260, 380 / speed);
      const waveSpeed = maxDist / duration;
      const hitIntensity = Math.min(1.0, Math.max(0.6, (unclippedBass / 255) * 1.25));

      // Trigger instantaneous epicenter flash at Key P anchor
      this.epicenterFlashUntil = now + Math.max(70, 110 / speed);
      this.epicenterFlashIntensity = hitIntensity;

      // Palette offset progression per ring
      const paletteOffset = (this.ringIdSequence * 0.17) % 1.0;

      this.activeRings.push({
        id: ++this.ringIdSequence,
        startTime: now,
        duration,
        maxRadius: maxDist,
        speed: waveSpeed,
        intensity: hitIntensity,
        paletteOffset
      });

      // Keep maximum 5 concurrent active rings
      if (this.activeRings.length > 5) {
        this.activeRings.shift();
      }
    }

    // Prune completed rings
    this.activeRings = this.activeRings.filter((r) => now - r.startTime < r.duration);
  }

  public render(ctx: AudioRenderContext): void {
    const { now, config, keys, frequencyBands, applyKeyStyle } = ctx;
    const palette = config.audioColorMode || 'rainbow';
    const direction = config.audioDirection || 'center_out';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;

    const maxDist = geometryManager.maxDist || 125;
    const numRings = this.activeRings.length;

    // Treble presence shimmer (bands 8..15)
    let trebleSum = 0;
    for (let b = 8; b < 16; b++) trebleSum += frequencyBands[b] || 0;
    const trebleNorm = Math.min(1.0, (trebleSum / 8) / 140);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      let waveTotalEnergy = 0;
      let dominantHue = 0;
      let dominantWeight = 0;

      // Calculate key distance based on unified QMK matrix coordinates and Key P anchor
      let keyDist = 0;
      switch (direction) {
        case 'center_out':
          keyDist = k.dist !== undefined ? k.dist : Math.hypot(k.dx, k.dy);
          break;
        case 'perimeter_in':
          keyDist = maxDist - (k.dist !== undefined ? k.dist : Math.hypot(k.dx, k.dy));
          break;
        case 'bottom_to_top':
          keyDist = ((64 - (k.qmkY ?? 32)) / 64) * maxDist;
          break;
        case 'top_to_bottom':
          keyDist = ((k.qmkY ?? 32) / 64) * maxDist;
          break;
        case 'left_to_right':
          keyDist = ((k.qmkX ?? 109) / 224) * maxDist;
          break;
        case 'right_to_left':
          keyDist = ((224 - (k.qmkX ?? 109)) / 224) * maxDist;
          break;
        default:
          keyDist = k.dist !== undefined ? k.dist : Math.hypot(k.dx, k.dy);
          break;
      }

      // 1. Calculate wave impact for all active rings
      for (let r = 0; r < numRings; r++) {
        const ring = this.activeRings[r];
        const age = now - ring.startTime;
        if (age < 0 || age > ring.duration) continue;

        const progress = age / ring.duration; // 0.0 -> 1.0
        const currentRadius = ring.speed * age;

        // Razor-sharp ring width in QMK coordinates (~10-14 units is approx 0.8-1 keycap width)
        const waveSigma = 10.5 + progress * 3.5;
        const deltaDist = Math.abs(keyDist - currentRadius);

        // Gaussian wave crest
        const crest = Math.exp(-Math.pow(deltaDist, 2) / (2 * Math.pow(waveSigma, 2)));

        // Envelope: strong punchy attack, crisp linear-quadratic fadeout
        const fade = Math.pow(1.0 - progress, 1.25) * ring.intensity;
        const ringEnergy = crest * fade;

        if (ringEnergy > 0.015) {
          waveTotalEnergy += ringEnergy;
          if (ringEnergy > dominantWeight) {
            dominantWeight = ringEnergy;
            dominantHue = ((progress * 0.75 + ring.paletteOffset + (keyDist / maxDist) * 0.25) % 1.0 + 1.0) % 1.0;
          }
        }
      }

      // 2. Epicenter Flash right at Key P anchor (for center_out / perimeter_in)
      let epicenterEnergy = 0;
      if (now < this.epicenterFlashUntil && (direction === 'center_out' || direction === 'perimeter_in')) {
        const flashProgress = (this.epicenterFlashUntil - now) / 100;
        const distFromP = k.dist !== undefined ? k.dist : Math.hypot(k.dx, k.dy);
        if (distFromP < 28) {
          const coreFalloff = 1.0 - (distFromP / 28);
          epicenterEnergy = coreFalloff * flashProgress * this.epicenterFlashIntensity;
        }
      }

      const totalEnergy = Math.min(1.3, waveTotalEnergy * 1.25 + epicenterEnergy);

      let rgb: [number, number, number] = [0, 0, 0];
      let brightFactor = floor * intensity;

      if (totalEnergy > 0.02) {
        // High-Contrast Active Shockwave Wavefront
        brightFactor = (floor + (1.0 - floor) * Math.min(1.0, totalEnergy * 1.15)) * intensity;

        const colorPhase = dominantWeight > 0.05
          ? dominantHue
          : ((((k.qmkX ?? 109) / 224) * 0.5 + now * 0.0004 * speed) % 1.0 + 1.0) % 1.0;

        if (palette === 'rainbow') {
          const finalHue = ((colorPhase + trebleNorm * 0.08) % 1.0 + 1.0) % 1.0;
          rgb = hsvToRgb(Math.round(finalHue * 255), 255, 255);
        } else if (palette === 'singleColor') {
          const shade = 0.5 + Math.min(0.5, totalEnergy * 0.5);
          rgb = [
            Math.min(255, Math.round(customRgb[0] * shade)),
            Math.min(255, Math.round(customRgb[1] * shade)),
            Math.min(255, Math.round(customRgb[2] * shade))
          ];
        } else {
          rgb = sampleLinearPaletteRgb(palette, colorPhase, customRgb);
        }
      } else {
        // Clean Inactive Dark / Ambient Floor Background
        if (floor <= 0.001) {
          brightFactor = 0;
          rgb = [0, 0, 0];
        } else {
          brightFactor = floor * intensity;
          const ambientPhase = ((((k.qmkX ?? 109) / 224) * 0.4 + now * 0.00025 * speed) % 1.0 + 1.0) % 1.0;
          if (palette === 'rainbow') {
            rgb = hsvToRgb(Math.round(ambientPhase * 255), 255, 60);
          } else if (palette === 'singleColor') {
            rgb = [Math.round(customRgb[0] * 0.2), Math.round(customRgb[1] * 0.2), Math.round(customRgb[2] * 0.2)];
          } else {
            const basePal = sampleLinearPaletteRgb(palette, ambientPhase, customRgb);
            rgb = [Math.round(basePal[0] * 0.25), Math.round(basePal[1] * 0.25), Math.round(basePal[2] * 0.25)];
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
    const palette = config.audioColorMode || 'rainbow';
    const direction = config.audioDirection || 'center_out';
    const intensity = config.audioIntensity || 1.0;
    const floor = config.audioFloor !== undefined ? config.audioFloor : 0.15;
    const customRgb = hexToRgbList(config.audioSingleColor || '#00ffff');
    const speed = config.audioSpeed || 1.0;

    const maxDist = geometryManager.maxDist || 125;
    const centerAnchor = geometryManager.getCenterAnchor();

    // Sidelight position in QMK coordinates
    const qmkX = side === 'left' ? 0 : 224;
    const qmkY = normY * 64;

    let keyDist = 0;
    switch (direction) {
      case 'center_out':
        keyDist = Math.hypot(qmkX - centerAnchor.qmkX, qmkY - centerAnchor.qmkY);
        break;
      case 'perimeter_in':
        keyDist = maxDist - Math.hypot(qmkX - centerAnchor.qmkX, qmkY - centerAnchor.qmkY);
        break;
      case 'bottom_to_top':
        keyDist = ((64 - qmkY) / 64) * maxDist;
        break;
      case 'top_to_bottom':
        keyDist = (qmkY / 64) * maxDist;
        break;
      case 'left_to_right':
        keyDist = (qmkX / 224) * maxDist;
        break;
      case 'right_to_left':
        keyDist = ((224 - qmkX) / 224) * maxDist;
        break;
      default:
        keyDist = Math.hypot(qmkX - centerAnchor.qmkX, qmkY - centerAnchor.qmkY);
        break;
    }

    let sideWaveTotal = 0;
    for (let r = 0; r < this.activeRings.length; r++) {
      const ring = this.activeRings[r];
      const age = now - ring.startTime;
      if (age < 0 || age > ring.duration) continue;

      const progress = age / ring.duration;
      const currentRadius = ring.speed * age;
      const delta = Math.abs(keyDist - currentRadius);
      const waveSigma = 14.0;
      const crest = Math.exp(-Math.pow(delta, 2) / (2 * Math.pow(waveSigma, 2)));
      const fade = (1.0 - progress) * ring.intensity;
      sideWaveTotal += crest * fade;
    }

    const bright = (floor + (1.0 - floor) * Math.min(1.0, sideWaveTotal * 1.3)) * intensity;
    const phase = ((normY * 0.35 + now * 0.0004 * speed) % 1.0 + 1.0) % 1.0;

    let rgb: [number, number, number] = [0, 0, 0];
    if (palette === 'rainbow') {
      rgb = hsvToRgb(Math.round(phase * 255), 255, 255);
    } else if (palette === 'singleColor') {
      rgb = customRgb;
    } else {
      rgb = samplePaletteRgb(palette, phase, customRgb);
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(rgb[0] * bright))),
      g: Math.max(0, Math.min(255, Math.round(rgb[1] * bright))),
      b: Math.max(0, Math.min(255, Math.round(rgb[2] * bright)))
    };
  }
}
