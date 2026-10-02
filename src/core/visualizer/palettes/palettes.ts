/**
 * LuxQMK Studio - Curated Color Palettes
 */

import { PaletteStop } from '../types';

export const PALETTES: Record<string, PaletteStop[] | null> = {
  rainbow: null, // Dynamic HSV Rainbow
  cyberpunk: [
    { pos: 0.0, rgb: [0, 240, 255] },      // Electric Cyan #00F0FF (0%)
    { pos: 0.333, rgb: [255, 0, 85] },     // Neon Pink #FF0055 (33.3%)
    { pos: 0.667, rgb: [255, 208, 0] }     // Cyber Amber #FFD000 (66.7%)
  ],
  vaporwave: [
    { pos: 0.0, rgb: [155, 81, 224] },     // Pastel Violet #9B51E0 (0%)
    { pos: 0.333, rgb: [255, 117, 151] },  // Sunset Pink #FF7597 (33.3%)
    { pos: 0.667, rgb: [0, 229, 255] }     // Pastel Cyan #00E5FF (66.7%)
  ],
  fire_ember: [
    { pos: 0.0, rgb: [255, 30, 0] },       // Magma Crimson #FF1E00 (0%)
    { pos: 0.333, rgb: [255, 119, 0] },    // Ember Orange #FF7700 (33.3%)
    { pos: 0.667, rgb: [255, 221, 0] }     // Gold Flame #FFDD00 (66.7%)
  ],
  ocean_abyss: [
    { pos: 0.0, rgb: [0, 34, 68] },        // Deep Navy #002244 (0%)
    { pos: 0.25, rgb: [0, 102, 255] },     // Azure #0066FF (25%)
    { pos: 0.5, rgb: [0, 255, 255] },      // Electric Cyan #00FFFF (50%)
    { pos: 0.75, rgb: [0, 255, 176] }      // Seafoam Aqua #00FFB0 (75%)
  ],
  matrix_code: [
    { pos: 0.0, rgb: [0, 255, 102] },      // Phosphor Green #00FF66 (0%)
    { pos: 0.333, rgb: [57, 255, 20] },    // Cyber Lime #39FF14 (33.3%)
    { pos: 0.667, rgb: [0, 143, 17] }      // Deep Emerald #008F11 (66.7%)
  ],
  synthwave: [
    { pos: 0.0, rgb: [138, 43, 226] },     // Blue Violet #8A2BE2 (0%)
    { pos: 0.25, rgb: [255, 20, 147] },    // Hot Pink #FF1493 (25%)
    { pos: 0.5, rgb: [255, 100, 0] },      // Neon Orange (50%)
    { pos: 0.75, rgb: [255, 204, 0] }      // Sunburst Gold #FFCC00 (75%)
  ],
  ice_glacier: [
    { pos: 0.0, rgb: [0, 51, 102] },       // Arctic Deep Blue #003366 (0%)
    { pos: 0.333, rgb: [112, 214, 255] },  // Glacier Ice Blue #70D6FF (33.3%)
    { pos: 0.667, rgb: [224, 247, 250] }   // Polar White Frost #E0F7FA (66.7%)
  ],
  toxic_radiation: [
    { pos: 0.0, rgb: [166, 255, 0] },      // Acid Lime #A6FF00 (0%)
    { pos: 0.333, rgb: [243, 255, 0] },    // Toxic Yellow #F3FF00 (33.3%)
    { pos: 0.667, rgb: [0, 229, 58] }      // Radioactive Green #00E53A (66.7%)
  ],
  singleColor: null
};
