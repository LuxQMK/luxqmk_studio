/**
 * LuxQMK Studio - Visualizer Core Types
 */

import { StudioLightingConfig } from '../../types/lighting';

export interface KeyGeometry {
  id: string;
  matrix?: [number, number];
  hardwareLedIndex?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  qmkX: number;
  qmkY: number;
  dx: number;
  dy: number;
  dist: number;
  isLogo: boolean;
  isKnob: boolean;
  group?: string;
  el?: HTMLElement | null;
  curRgb: { r: number; g: number; b: number };
}

export interface PaletteStop {
  pos: number;
  rgb: [number, number, number];
}

export interface RenderContext {
  now: number;
  dt: number;
  config: StudioLightingConfig;
  keys: KeyGeometry[];
  maxX: number;
  maxY: number;
  applyKeyStyle: (k: KeyGeometry, r: number, g: number, b: number, bright: number) => void;
}

export interface AudioRenderContext extends RenderContext {
  frequencyBands: Float32Array; // 16 frequency bands (0..255)
  peakBands: Float32Array;      // 16 peak hold indicators (0..255)
  bassEnergy: number;           // Bass volume energy (0..255)
  rawBassFlux?: number;         // Unclipped transient onset flux (0..255)
  rawBassEnergy?: number;       // Raw unclipped bass level (0..255)
}

export interface AudioEffectRenderer {
  id: string;
  init?: () => void;
  reset?: () => void;
  updateAnalysis?: (
    now: number,
    frequencyBands: Float32Array,
    bassEnergy: number,
    config: StudioLightingConfig,
    maxX: number,
    maxY: number,
    rawBassFlux?: number,
    rawBassEnergy?: number
  ) => void;
  render: (ctx: AudioRenderContext) => void;
  computeSidelightRgb?: (
    side: 'left' | 'right',
    normY: number,
    now: number,
    config: StudioLightingConfig,
    frequencyBands: Float32Array,
    bassEnergy: number,
    maxX: number
  ) => { r: number; g: number; b: number } | null;
}

export interface SoftwareEffectRenderer {
  id: string;
  init?: () => void;
  reset?: () => void;
  render: (ctx: RenderContext) => void;
  computeSidelightRgb?: (
    side: 'left' | 'right',
    normY: number,
    now: number,
    config: StudioLightingConfig,
    maxX: number,
    maxY: number
  ) => { r: number; g: number; b: number } | null;
}
