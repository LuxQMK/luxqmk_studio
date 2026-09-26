/**
 * Keyboard matrix, layout, and keycode type definitions
 */

export interface KeyLayoutItem {
  id?: string;
  matrix: [number, number]; // [row, col]
  x: number;
  y: number;
  w?: number;
  h?: number;
  label?: string;
  sublabel?: string;
  type?: 'standard' | 'modifier' | 'space' | 'enter' | 'iso-enter' | 'knob' | 'sidelight' | 'logo';
  group?: 'wasd' | 'alpha' | 'mod' | 'num' | 'numpad' | 'nav' | 'func' | 'sidelights' | 'logo';
  ledIndex?: number;
  defaultKeycode?: number;
  isKnob?: boolean;
  isLogo?: boolean;
}

export interface KeyboardLayoutData {
  name: string;
  rows: number;
  cols: number;
  keys: KeyLayoutItem[];
  matrixMap?: Record<string, number>;
}

export interface KeycodeEntry {
  code: number | string;
  name: string;
  label: string;
  sublabel?: string;
  desc?: string;
  title?: string;
  lightingType?: string;
  isAny?: boolean;
  category: 'basic' | 'media' | 'macro' | 'layers' | 'special' | 'lighting' | 'custom' | string;
}

export interface LayerKeymap {
  [layerIndex: number]: (number | string)[];
}

export interface EncoderConfig {
  layer: number;
  ccw: number | string;
  cw: number | string;
  press: number | string;
}
