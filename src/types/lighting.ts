/**
 * RGB Matrix and Lighting Type Definitions
 */

export interface BacklightConfig {
  brightness: number; // 0-255
  effect: number; // effect index
  speed: number; // 0-255
  density: number; // 32-255
  color: string; // hex #RRGGBB
  reverse: boolean;
  gradientPreset: number;
}

export interface SidelightConfig {
  customEnable: boolean;
  effect: number;
  speed: number;
  density: number;
  color: string;
  gradientPreset: number;
  reverse: boolean;
}

export interface ReactiveConfig {
  enable: boolean;
  mode: number; // 0=off, 1=fade, 2=splash, 3=rainbow splash, 4=cross, 5=nexus, 6=wide, 7=heatmap
  color: string;
  speed: number;
  blend: number; // 0=additive, 1=override
}

export interface WinLockConfig {
  mode: number; // 0=default, 1=off, 2=color
  color: string;
  isLocked: boolean;
}

export interface LockIndicatorConfig {
  mode: number; // 0=animation/disabled, 1=off, 2=custom color, 3=solid white
  color: string;
}

export interface LayerLightingConfig {
  enable: boolean;
  dimLevel: number; // 0-255
  layer1Enable?: boolean;
  layer1Color: string;
  layer2Enable?: boolean;
  layer2Color: string;
  layer3Enable?: boolean;
  layer3Color: string;
}

export interface LogoLocksConfig {
  mode: number; // 0=rgb, 1=indicator-rgb, 2=indicator-off
  colorCaps: string;
  colorNum: string;
  colorScroll: string;
  colorCapsNum: string;
  colorCapsScroll: string;
  colorNumScroll: string;
  colorAll: string;
}

export interface MonochromeConfig {
  enable: boolean;
  brightness: number;
  breathing: boolean;
  tint: string;
}

export interface GradientStopItem {
  pos: number; // 0.0 to 1.0
  color: string; // hex #RRGGBB
}

export interface CustomGradientPreset {
  id: string;
  name: string;
  stops: GradientStopItem[];
}

export interface PerKeyProfileData {
  [profileIndex: number]: Record<number, string>; // ledIndex -> hex color
}

export interface StudioLightingConfig {
  isRunning: boolean;
  activeSubTab: 'audio' | 'effects';
  
  // Audio visualizer settings
  audioSource: string;
  audioMode: string;
  audioColorMode: string;
  audioDirection: string;
  audioSingleColor: string;
  audioSensitivity: number;
  audioSpeed: number;
  audioIntensity: number;
  audioSmoothing: number;
  audioFloor: number;

  // PC software effects
  softwareEffect: string;
  softwarePalette: string;
  softwareDirection: string;
  softwareSingleColor: string;
  softwareSpeed: number;
  softwareIntensity: number;
  softwareFloor: number;

  // Studio Sidelight
  sidelightCustomEnable: boolean;
  sidelightMode: string;
  sidelightPalette: string;
  sidelightColor: string;
  sidelightSpeed: number;
  sidelightIntensity: number;
}
