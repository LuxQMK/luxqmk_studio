/**
 * LuxQMK Studio - Software Effects Engine & Registry
 * Dispatches 30+ procedural PC and QMK-style animation engines
 */

import { RenderContext } from '../types';
import { getDirectedCoordinate } from '../geometry/coordinate-mapper';
import { samplePaletteRgb, hexToRgbList, hsvToRgb, lerpColor, PALETTES } from '../palettes';

export class SoftwareEffectsRegistry {
  private particles: Array<{ x: number; y: number; vx: number; vy: number; hue: number; radius: number }> = [];
  private matrixDrops: Array<{ x: number; y: number; speed: number; length: number }> = [];
  private raindropsCache: Map<string, { offset: number; time: number }> = new Map();

  constructor() {
    this._initProcedurals();
  }

  private _initProcedurals() {
    this.particles = [];
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: Math.random() * 23,
        y: Math.random() * 6,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.06,
        hue: Math.floor(Math.random() * 256),
        radius: 1.5 + Math.random() * 2.0
      });
    }

    this.matrixDrops = [];
    for (let c = 0; c < 24; c++) {
      this.matrixDrops.push({
        x: c,
        y: Math.random() * -12,
        speed: 0.08 + Math.random() * 0.14,
        length: 3 + Math.floor(Math.random() * 5)
      });
    }
  }

  public render(ctx: RenderContext): void {
    const { now, config, keys, maxX, maxY, applyKeyStyle } = ctx;
    const preset = config.softwareEffect || 'neonWave';
    const palette = config.softwarePalette || 'rainbow';
    const direction = config.softwareDirection || 'left_to_right';
    const speed = config.softwareSpeed || 1.0;
    const intensity = config.softwareIntensity || 1.0;
    const floor = config.softwareFloor !== undefined ? config.softwareFloor : 0.10;
    const customRgb = hexToRgbList(config.softwareSingleColor || '#00ffff');

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      const dirCoord = getDirectedCoordinate(k.centerX, k.centerY, direction, maxX, maxY);
      let rgb: [number, number, number] = [0, 0, 0];
      let brightFactor = intensity;

      switch (preset) {
        // --- Signature PC Effects ---
        case 'neonWave': {
          const phase = ((dirCoord.primary - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          const waveSin = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
          brightFactor = (floor + (1 - floor) * waveSin) * intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'matrixRain': {
          const colIdx = Math.floor(k.centerX) % 24;
          const drop = this.matrixDrops[colIdx] || { y: 0, speed: 0.1, length: 4 };
          const curY = (drop.y + now * 0.008 * speed * drop.speed * 8) % (maxY + 8);
          const distFromDrop = k.centerY - curY;
          if (distFromDrop >= 0 && distFromDrop < drop.length) {
            const headGlow = distFromDrop === 0 ? 1.0 : (1.0 - distFromDrop / drop.length);
            brightFactor = (floor + (1 - floor) * headGlow) * intensity;
            rgb = distFromDrop === 0 ? [220, 255, 220] : samplePaletteRgb(palette === 'rainbow' ? 'matrix_code' : palette, 0.3, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = palette === 'rainbow' ? [0, 60, 20] : samplePaletteRgb(palette, 0.05, customRgb);
          }
          break;
        }

        case 'particleStorm': {
          let nearestDist = 999;
          let particleHue = 0;
          for (let p = 0; p < this.particles.length; p++) {
            const pt = this.particles[p];
            const pX = ((pt.x + pt.vx * now * 0.05 * speed) % 24 + 24) % 24;
            const pY = ((pt.y + pt.vy * now * 0.05 * speed) % 6 + 6) % 6;
            const d = Math.sqrt(Math.pow(k.centerX - pX, 2) + Math.pow(k.centerY - pY, 2));
            if (d < nearestDist) {
              nearestDist = d;
              particleHue = pt.hue;
            }
          }
          if (nearestDist < 2.5) {
            const glow = Math.pow(1 - nearestDist / 2.5, 2);
            brightFactor = (floor + (1 - floor) * glow) * intensity;
            rgb = samplePaletteRgb(palette, particleHue / 255, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, 0, customRgb);
          }
          break;
        }

        case 'aurora': {
          const wave1 = Math.sin((k.centerX * 0.25) + (now * 0.0012 * speed));
          const wave2 = Math.cos((k.centerY * 0.45) - (now * 0.0016 * speed));
          const combined = (wave1 + wave2 + 2.0) / 4.0;
          brightFactor = (floor + (1 - floor) * combined) * intensity;
          rgb = samplePaletteRgb(palette, combined, customRgb);
          break;
        }

        case 'pulseBloom': {
          const pulsePhase = ((now * 0.0015 * speed) % 1.0 + 1.0) % 1.0;
          const wave = Math.max(0, Math.sin((dirCoord.dist * 6) - (now * 0.006 * speed)));
          brightFactor = (floor + (1 - floor) * Math.pow(wave, 2)) * intensity;
          rgb = samplePaletteRgb(palette, pulsePhase + dirCoord.dist * 0.5, customRgb);
          break;
        }

        case 'fireEmber': {
          const flameProgress = now * 0.0025 * speed;
          const flameY = k.centerY / (maxY || 1);
          const flameX = k.centerX / (maxX || 1);

          const wave1 = Math.sin(flameX * 7.0 + flameProgress * 2.5);
          const wave2 = Math.cos(flameX * 4.0 - flameProgress * 3.2 + flameY * 3.5);
          const sparkNoise = Math.sin(k.centerX * 11.0 + now * 0.012 * speed) * Math.cos(k.centerY * 7.5 - now * 0.014 * speed);

          const heat = Math.max(0, (1.0 - flameY * 0.85) + (wave1 * 0.18 + wave2 * 0.18) + (sparkNoise * 0.12));
          const clampedHeat = Math.max(0, Math.min(1.0, heat));

          brightFactor = (floor + (1 - floor) * Math.pow(clampedHeat, 1.3)) * intensity;
          const targetPal = (palette === 'rainbow' || !PALETTES[palette]) ? 'fire_ember' : palette;
          const flameColorPos = ((1.0 - clampedHeat * 0.85) + flameProgress * 0.08) % 1.0;
          rgb = samplePaletteRgb(targetPal, flameColorPos, customRgb);
          break;
        }

        case 'hyperspaceWarp': {
          const centerX = maxX / 2;
          const centerY = maxY / 2;
          const dx = k.centerX - centerX;
          const dy = k.centerY - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY) || 1;
          const normDist = distFromCenter / maxRadius;
          const angle = Math.atan2(dy, dx);
          const normAngle = (angle + Math.PI) / (Math.PI * 2);

          const warpSpeed = now * 0.004 * speed;
          const warpRings = ((normDist * 3.5 - warpSpeed) % 1.0 + 1.0) % 1.0;
          const streak = Math.pow(Math.sin(warpRings * Math.PI), 4);
          const starStreak = 0.5 + 0.5 * Math.sin(angle * 6 + warpSpeed * 1.5);
          const combinedGlow = Math.max(0, Math.min(1.0, streak * 0.8 + starStreak * 0.35 * normDist));

          brightFactor = (floor + (1 - floor) * combinedGlow) * intensity;
          const colorPhase = ((normAngle + normDist * 0.5 + now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          rgb = samplePaletteRgb(palette, colorPhase, customRgb);
          break;
        }

        // --- QMK Cycling & Radial ---
        case 'qmk_cycle_all': {
          const phase = ((now * 0.0004 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_left_right':
        case 'qmk_cycle_up_down': {
          const phase = ((dirCoord.primary + now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_rainbow_chevron': {
          const chevron = Math.abs(k.centerY - (maxY / 2)) * 0.5 + k.centerX * 0.1;
          const phase = ((chevron - now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_out_in': {
          const phase = ((dirCoord.dist * 1.5 - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_out_in_dual': {
          const dxDual = (maxX / 4) - Math.abs(k.centerX - (maxX / 2));
          const dyDual = k.centerY - (maxY / 2);
          const distDual = Math.sqrt(dxDual * dxDual + dyDual * dyDual);
          const phase = ((distDual * 0.4 - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_pinwheel': {
          const angle = Math.atan2(k.centerY - (maxY / 2), k.centerX - (maxX / 2));
          const phase = (((angle + Math.PI) / (Math.PI * 2) + now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_cycle_spiral': {
          const angle = Math.atan2(k.centerY - (maxY / 2), k.centerX - (maxX / 2));
          const phase = ((dirCoord.dist * 1.2 + (angle / (Math.PI * 2)) - now * 0.0008 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_dual_beacon': {
          const angleBeam = now * 0.001 * speed;
          const dx = k.centerX - (maxX / 2);
          const dy = k.centerY - (maxY / 2);
          const halfX = (maxX / 2) || 1;
          const proj = (dy * Math.cos(angleBeam) + dx * Math.sin(angleBeam)) / halfX;
          const phase = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_rainbow_beacon': {
          const angleBeam = now * 0.001 * speed;
          const dx = k.centerX - (maxX / 2);
          const dy = k.centerY - (maxY / 2);
          const halfX = (maxX / 2) || 1;
          const proj = (dy * 2 * Math.cos(angleBeam) + dx * 2 * Math.sin(angleBeam)) / halfX;
          const phase = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        case 'qmk_rainbow_pinwheels': {
          const angleBeam = now * 0.001 * speed;
          const halfX = (maxX / 2) || 1;
          const halfY = (maxY / 2) || 1;
          const quadX = (k.centerX % halfX) - (halfX / 2);
          const quadY = (k.centerY % halfY) - (halfY / 2);
          const proj = (quadY * Math.cos(angleBeam) + quadX * Math.sin(angleBeam)) / (halfX / 2 || 1);
          const phase = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }

        // --- QMK Waves & Atmosphere ---
        case 'qmk_hue_wave': {
          const wave = Math.sin((k.centerX * 0.4) - (now * 0.003 * speed));
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, 0.5 + wave * 0.35, customRgb);
          break;
        }

        case 'qmk_hue_pendulum': {
          const swing = Math.sin(now * 0.002 * speed) * (maxX / 2);
          const diff = Math.abs(k.centerX - ((maxX / 2) + swing));
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, 0.5 + (diff / (maxX || 1)) * 0.5, customRgb);
          break;
        }

        case 'qmk_breathing': {
          const phase = Math.abs(Math.sin(now * 0.002 * speed));
          brightFactor = (floor + (1 - floor) * phase) * intensity;
          rgb = samplePaletteRgb(palette, 0.5, customRgb);
          break;
        }

        case 'qmk_hue_breathing': {
          const breath = Math.abs(Math.sin(now * 0.0015 * speed));
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, ((now * 0.0003 * speed + breath * 0.2) % 1.0 + 1.0) % 1.0, customRgb);
          break;
        }

        case 'qmk_flower_blooming': {
          const angle = Math.atan2(k.centerY - (maxY / 2), k.centerX - (maxX / 2));
          const petal = Math.sin(angle * 6 + now * 0.002 * speed);
          const bloom = ((dirCoord.dist * 2.0 - petal * 0.5 - now * 0.001 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, bloom, customRgb);
          break;
        }

        case 'qmk_riverflow': {
          const flow = Math.sin(k.centerX * 0.6 + k.centerY * 0.3 + now * 0.003 * speed);
          brightFactor = (floor + (1 - floor) * (0.5 + 0.5 * flow)) * intensity;
          rgb = samplePaletteRgb(palette, ((k.centerX * 0.05 + now * 0.0005 * speed) % 1.0 + 1.0) % 1.0, customRgb);
          break;
        }

        // --- QMK Drops & Particles ---
        case 'qmk_raindrops': {
          let cache = this.raindropsCache.get(k.id);
          if (!cache || now - cache.time > 800) {
            cache = { offset: Math.floor(Math.random() * 48) - 24, time: now };
            this.raindropsCache.set(k.id, cache);
          }
          const pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(now * 0.004 * speed + k.centerX));
          brightFactor = (floor + (1 - floor) * pulse) * intensity;
          rgb = samplePaletteRgb(palette, 0.5 + cache.offset / 255, customRgb);
          break;
        }

        case 'qmk_jellybean_raindrops': {
          let cache = this.raindropsCache.get(k.id);
          if (!cache || now - cache.time > 600) {
            cache = { offset: Math.floor(Math.random() * 256), time: now };
            this.raindropsCache.set(k.id, cache);
          }
          const pulse = Math.abs(Math.sin(now * 0.005 * speed + cache.offset));
          brightFactor = (floor + (1 - floor) * pulse) * intensity;
          rgb = hsvToRgb(cache.offset, 255, 255);
          break;
        }

        case 'qmk_pixel_rain': {
          const colIdx = Math.floor(k.centerX) % 24;
          const drop = this.matrixDrops[colIdx] || { y: 0, speed: 0.1, length: 3 };
          const curY = (drop.y + now * 0.006 * speed * 8) % (maxY + 4);
          const distDrop = Math.abs(k.centerY - curY);
          if (distDrop < drop.length) {
            const glow = 1.0 - (distDrop / drop.length);
            brightFactor = (floor + (1 - floor) * glow) * intensity;
            rgb = samplePaletteRgb(palette, glow, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = samplePaletteRgb(palette, 0.1, customRgb);
          }
          break;
        }

        case 'qmk_pixel_flow': {
          const wave = Math.sin(k.centerX * 0.8 - now * 0.004 * speed) * Math.cos(k.centerY * 0.6 - now * 0.003 * speed);
          const normWave = 0.5 + 0.5 * wave;
          brightFactor = (floor + (1 - floor) * normWave) * intensity;
          rgb = samplePaletteRgb(palette, ((k.centerX * 0.05 + normWave * 0.3) % 1.0 + 1.0) % 1.0, customRgb);
          break;
        }

        case 'qmk_pixel_fractal': {
          const fx = Math.floor(k.centerX * 2);
          const fy = Math.floor(k.centerY * 2);
          const ft = Math.floor(now * 0.004 * speed);
          const frac = Math.abs(((fx ^ fy ^ ft) % 8) / 8);
          brightFactor = (floor + (1 - floor) * frac) * intensity;
          rgb = samplePaletteRgb(palette, frac, customRgb);
          break;
        }

        case 'qmk_starlight':
        case 'qmk_starlight_smooth':
        case 'qmk_starlight_dual_hue': {
          const starHash = Math.sin(k.centerX * 12.9898 + k.centerY * 78.233) * 43758.5453;
          const starPhase = Math.abs(starHash % 1.0);
          const twinkle = Math.abs(Math.sin(now * 0.002 * speed + starPhase * Math.PI * 2));
          brightFactor = (floor + (1 - floor) * Math.pow(twinkle, 2)) * intensity;
          rgb = samplePaletteRgb(palette, preset === 'qmk_starlight_dual_hue' ? (starPhase > 0.5 ? 0.15 : 0.65) : starPhase, customRgb);
          break;
        }

        // --- QMK Bands & Gradients ---
        case 'qmk_gradient_up_down': {
          const pos = ((k.centerY / (maxY || 1)) * (speed * 0.8)) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, pos, customRgb);
          break;
        }

        case 'qmk_gradient_left_right': {
          const pos = ((k.centerX / (maxX || 1)) * (speed * 0.8)) % 1.0;
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, pos, customRgb);
          break;
        }

        case 'qmk_colorband_sat': {
          const t = ((now * 0.00035 * speed * 256) % 256 + 256) % 256;
          const x255 = (k.qmkX * 228 / 224) + 28;
          const diff = Math.abs(x255 - t);
          const satVal = Math.max(0, 1.0 - (diff * 8.0 / 255.0));
          const baseRgb = samplePaletteRgb(palette, k.centerX / (maxX || 1), customRgb);
          brightFactor = intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, satVal);
          break;
        }

        case 'qmk_colorband_val': {
          const t = ((now * 0.00035 * speed * 256) % 256 + 256) % 256;
          const x255 = (k.qmkX * 228 / 224) + 28;
          const diff = Math.abs(x255 - t);
          const val = Math.max(0, 1.0 - (diff * 8.0 / 255.0));
          brightFactor = (floor + (1 - floor) * val) * intensity;
          rgb = samplePaletteRgb(palette, k.centerX / (maxX || 1), customRgb);
          break;
        }

        case 'qmk_colorband_pinwheel_sat': {
          const angle = Math.atan2(k.centerY - (maxY / 2), k.centerX - (maxX / 2));
          const normAngle = (((angle + Math.PI) / (Math.PI * 2)) % 1.0 + 1.0) % 1.0;
          const wave = 0.5 + 0.5 * Math.sin(angle * 3 - now * 0.004 * speed);
          const baseRgb = samplePaletteRgb(palette, normAngle, customRgb);
          brightFactor = intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, wave);
          break;
        }

        case 'qmk_colorband_pinwheel_val': {
          const angle = Math.atan2(k.centerY - (maxY / 2), k.centerX - (maxX / 2));
          const normAngle = (((angle + Math.PI) / (Math.PI * 2)) % 1.0 + 1.0) % 1.0;
          const wave = 0.5 + 0.5 * Math.sin(angle * 3 - now * 0.004 * speed);
          brightFactor = (floor + (1 - floor) * wave) * intensity;
          rgb = samplePaletteRgb(palette, normAngle, customRgb);
          break;
        }

        case 'qmk_colorband_spiral_sat': {
          const angle = Math.atan2(k.centerY - (maxY / 2), k.centerX - (maxX / 2));
          const wave = 0.5 + 0.5 * Math.sin((dirCoord.dist * 6 - angle * 2) - now * 0.004 * speed);
          const baseRgb = samplePaletteRgb(palette, dirCoord.dist, customRgb);
          brightFactor = intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, wave);
          break;
        }

        case 'qmk_colorband_spiral_val': {
          const angle = Math.atan2(k.centerY - (maxY / 2), k.centerX - (maxX / 2));
          const wave = 0.5 + 0.5 * Math.sin((dirCoord.dist * 6 - angle * 2) - now * 0.004 * speed);
          brightFactor = (floor + (1 - floor) * wave) * intensity;
          rgb = samplePaletteRgb(palette, dirCoord.dist, customRgb);
          break;
        }

        case 'qmk_solid_color': {
          brightFactor = intensity;
          rgb = samplePaletteRgb(palette, 0.5, customRgb);
          break;
        }

        case 'qmk_alphas_mods': {
          brightFactor = intensity;
          if (k.group === 'alpha' || k.group === 'num') {
            rgb = samplePaletteRgb(palette, 0.1, customRgb);
          } else {
            rgb = samplePaletteRgb(palette, 0.6, customRgb);
          }
          break;
        }

        default: {
          const phase = ((dirCoord.primary + now * 0.0006 * speed) % 1.0 + 1.0) % 1.0;
          brightFactor = (floor + (1 - floor)) * intensity;
          rgb = samplePaletteRgb(palette, phase, customRgb);
          break;
        }
      }

      applyKeyStyle(k, rgb[0], rgb[1], rgb[2], brightFactor);
    }
  }
}

export const softwareEffectsRegistry = new SoftwareEffectsRegistry();
