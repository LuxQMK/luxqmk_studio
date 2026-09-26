/**
 * LuxQMK Studio - Software Lighting Controller & 60 FPS Real-Time FX Suite
 * Universal support for:
 * 1. Audio Visualizers (WASAPI Loopback, Microphone, Stereo Mix) with 7 Dynamic Modes
 * 2. Real-Time PC Animation Engines with 7 High-End Presets & 6 Spatial Directions
 * 3. 10 Curated Color Palettes + Custom Color Gradient Mapping
 * 4. Smooth Parametric Controls: Speed, Intensity, Smoothing, Ambient Floor Glow
 * 5. WebHID Direct Hardware Streaming & Bidirectional Persistence
 */

(function () {
  // Curated Color Palettes (RGB Stop Tables with Equal Angular Distribution for 360° Circular Looping)
  const PALETTES = {
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

  const MATRIX_CO_TABLES = {
    'gmmk3-100-ansi': [
      [ 74, 255, 31, 99,  98, 101, 91, 5 ],
      [ 38, 37,  59, 0,   75, 32,  16, 17],
      [ 39, 58,  60, 255, 76, 53,  1,  18],
      [ 40, 3,   61, 4,   77, 86,  2,  19],
      [ 41, 42,  62, 63,  78, 79,  21, 20],
      [ 44, 43,  65, 64,  81, 80,  22, 23],
      [ 45, 49,  66, 6,   82, 51,  28, 24],
      [ 46, 7,   67, 100, 83, 30,  8,  25],
      [ 47, 48,  68, 69,  97, 84,  27, 26],
      [ 92, 85,  96, 93,  94, 95,  15, 13],
      [ 14, 29,  50, 11,  70, 12,  9,  10],
      [ 54, 71,  87, 57,  33, 255, 255, 255],
      [ 55, 72,  88, 102, 34, 255, 52,  255],
      [ 56, 73,  89, 103, 35, 36,  90,  255]
    ],
    'gmmk3-75-ansi': [
      [ 57, 255, 255, 77, 255, 79, 71, 5 ],
      [ 29, 28,  44,  0,   58,  42, 13, 14],
      [ 30, 43,  45,  255, 59,  56, 1,  15],
      [ 31, 3,   46,  4,   60,  69, 2,  16],
      [ 32, 33,  47,  48,  61,  62, 18, 17],
      [ 35, 34,  50,  49,  64,  63, 19, 20],
      [ 36, 40,  51,  6,   65,  27, 25, 21],
      [ 37, 7,   52,  78,  66,  255,8,  22],
      [ 38, 39,  53,  54,  255, 67, 24, 23],
      [ 72, 68,  76,  73,  74,  75, 255, 255],
      [ 255, 26, 41,  11,  55,  12, 9,  10],
      [ 255, 255, 255, 255, 255, 255, 255, 255],
      [ 255, 255, 255, 255, 255, 255, 70, 255],
      [ 255, 255, 255, 255, 255, 255, 255, 255]
    ],
    'gmmk3-65-ansi': [
      [ 42, 255, 255, 62, 255, 64, 56, 255 ],
      [ 15, 14,  29,  0,   43, 255, 255, 1  ],
      [ 16, 28,  30,  255, 44, 41, 255, 2  ],
      [ 17, 255, 31,  255, 45, 54, 255, 3  ],
      [ 18, 19,  32,  33,  46, 47, 5,   4  ],
      [ 21, 20,  35,  34,  49, 48, 6,   7  ],
      [ 22, 26,  36,  255, 50, 255, 12, 8  ],
      [ 23, 255, 37,  63,  51, 255, 255, 9  ],
      [ 24, 25,  38,  39,  255, 52, 11, 0  ],
      [ 57, 53,  61,  58,  59, 60, 255, 255],
      [ 255, 13, 27,  255, 40, 255, 255, 255],
      [ 255, 255, 255, 255, 255, 255, 255, 255],
      [ 255, 255, 255, 255, 255, 255, 55, 255],
      [ 255, 255, 255, 255, 255, 255, 255, 255]
    ],
    'gmmk2-96-ansi': [
      [ 0,  18, 36, 54, 70, 87, 14, 94 ],
      [ 1,  19, 37, 55, 255,88, 15, 82 ],
      [ 2,  20, 38, 56, 71, 89, 16, 95 ],
      [ 3,  21, 39, 57, 72, 255,17, 96 ],
      [ 4,  22, 40, 58, 73, 255,32, 97 ],
      [ 5,  23, 41, 59, 74, 255,33, 98 ],
      [ 6,  24, 42, 60, 75, 90, 34, 83 ],
      [ 7,  25, 43, 61, 76, 255,35, 84 ],
      [ 8,  26, 44, 62, 77, 255,50, 85 ],
      [ 9,  27, 45, 63, 78, 91, 51, 86 ],
      [ 10, 28, 46, 64, 79, 92, 52, 67 ],
      [ 11, 29, 47, 65, 80, 255,53, 68 ],
      [ 12, 30, 48, 66, 255,93, 255,69 ],
      [ 13, 31, 255,49, 81, 255,255,255]
    ],
    'gmmk2-65-ansi': [
      [ 0,  1,  15, 30, 44, 58, 14, 64 ],
      [ 255,2,  16, 31, 255,59, 255,56 ],
      [ 255,3,  17, 32, 45, 60, 29, 65 ],
      [ 255,4,  18, 33, 46, 255,43, 66 ],
      [ 255,5,  19, 34, 47, 255,255,255],
      [ 255,6,  20, 35, 48, 255,255,255],
      [ 255,7,  21, 36, 49, 61, 255,57 ],
      [ 255,8,  22, 37, 50, 255,255,255],
      [ 255,9,  23, 38, 51, 255,255,255],
      [ 255,10, 24, 39, 52, 62, 255,255],
      [ 255,11, 25, 40, 53, 63, 255,255],
      [ 255,12, 26, 41, 54, 255,255,255],
      [ 255,13, 27, 42, 255,255,255,255],
      [ 13, 28, 255,55, 255,255,255,255]
    ]
  };

  const HARDWARE_LIGHTING_PROFILES = {
    'gmmk3-100-ansi': {
      totalLeds: 125,
      sidelightRange: { left: [104, 113], right: [114, 123] },
      logoLedIndex: 124
    },
    'gmmk3-75-ansi': {
      totalLeds: 101,
      sidelightRange: { left: [80, 89], right: [90, 99] },
      logoLedIndex: 100
    },
    'gmmk3-65-ansi': {
      totalLeds: 85,
      sidelightRange: { left: [65, 74], right: [75, 84] }
    },
    'gmmk2-96-ansi': {
      totalLeds: 119,
      sidelightRange: { left: [99, 108], right: [109, 118] }
    },
    'gmmk2-65-ansi': {
      totalLeds: 87,
      sidelightRange: { left: [67, 76], right: [77, 86] }
    },
    'generic-via': {
      totalLeds: 104
    }
  };

  function getHardwareLedIndex(presetId, row, col) {
    if (row === undefined || col === undefined) return undefined;
    const table = MATRIX_CO_TABLES[presetId];
    if (table && table[row] && table[row][col] !== undefined && table[row][col] !== 255 && table[row][col] !== -1) {
      return table[row][col];
    }
    return undefined;
  }

  // Dynamic HSV to RGB Converter (pure standalone function)
  function hsvToRgb(hByte, sByte = 255, vByte = 255) {
    // Normalization of H to [0, 360) ensuring safe positive modulo
    const normH = (((hByte % 256) + 256) % 256) / 256;
    const h = normH * 360;
    const s = Math.max(0, Math.min(255, sByte)) / 255;
    const v = Math.max(0, Math.min(255, vByte)) / 255;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return [
      Math.max(0, Math.min(255, Math.round((r + m) * 255))),
      Math.max(0, Math.min(255, Math.round((g + m) * 255))),
      Math.max(0, Math.min(255, Math.round((b + m) * 255)))
    ];
  }

  let _lastCustomStopsRef = null;
  let _lastCustomStopsLut = null;

  function _buildCustomStopsLut(activeStops) {
    const lut = new Array(256);
    const sorted = [...activeStops].sort((a, b) => a.pos - b.pos);
    const s0 = sorted[0];
    const sLast = sorted[sorted.length - 1];
    const wrapSpan = (255 - sLast.pos) + s0.pos;

    for (let f255 = 0; f255 < 256; f255++) {
      let r = s0.r, g = s0.g, b = s0.b;
      if (f255 <= s0.pos) {
        if (wrapSpan === 0) {
          r = s0.r; g = s0.g; b = s0.b;
        } else {
          const progress = (f255 + (255 - sLast.pos)) / wrapSpan;
          r = Math.round(sLast.r + (s0.r - sLast.r) * progress);
          g = Math.round(sLast.g + (s0.g - sLast.g) * progress);
          b = Math.round(sLast.b + (s0.b - sLast.b) * progress);
        }
      } else if (f255 >= sLast.pos) {
        if (wrapSpan === 0) {
          r = sLast.r; g = sLast.g; b = sLast.b;
        } else {
          const progress = (f255 - sLast.pos) / wrapSpan;
          r = Math.round(sLast.r + (s0.r - sLast.r) * progress);
          g = Math.round(sLast.g + (s0.g - sLast.g) * progress);
          b = Math.round(sLast.b + (s0.b - sLast.b) * progress);
        }
      } else {
        for (let i = 0; i < sorted.length - 1; i++) {
          const cur = sorted[i];
          const next = sorted[i + 1];
          if (f255 >= cur.pos && f255 <= next.pos) {
            const span = next.pos - cur.pos;
            const t = span === 0 ? 0 : (f255 - cur.pos) / span;
            r = Math.round(cur.r + (next.r - cur.r) * t);
            g = Math.round(cur.g + (next.g - cur.g) * t);
            b = Math.round(cur.b + (next.b - cur.b) * t);
            break;
          }
        }
      }
      lut[f255] = [r, g, b];
    }
    return lut;
  }

  function samplePaletteRgb(paletteName, factor, customRgb = [0, 255, 255], customGradientStops = null) {
    if (paletteName === "singleColor") {
      return customRgb;
    }
    const activeStops = customGradientStops || window.gStudioLighting?.config?.softwareGradientStops || window.PRESET_GRADIENTS?.cyberpunk?.stops;
    if (paletteName === "customGradient" && Array.isArray(activeStops) && activeStops.length >= 2) {
      if (_lastCustomStopsRef !== activeStops || !_lastCustomStopsLut) {
        _lastCustomStopsRef = activeStops;
        _lastCustomStopsLut = _buildCustomStopsLut(activeStops);
      }
      const f255 = Math.round((((factor % 1) + 1) % 1) * 255) & 0xFF;
      return _lastCustomStopsLut[f255] || [s0?.r || 0, s0?.g || 255, s0?.b || 255];
    }

    const f = ((factor % 1) + 1) % 1; // Normalize to 0..1
    if (paletteName === "rainbow" || !PALETTES[paletteName]) {
      return hsvToRgb(Math.round(f * 255), 255, 255);
    }
    const stops = PALETTES[paletteName];
    const s0 = stops[0];
    const sLast = stops[stops.length - 1];

    if (f <= s0.pos) {
      const wrapSpan = (1.0 - sLast.pos) + s0.pos;
      if (wrapSpan === 0) return s0.rgb;
      const progress = (f + (1.0 - sLast.pos)) / wrapSpan;
      return [
        Math.round(sLast.rgb[0] + (s0.rgb[0] - sLast.rgb[0]) * progress),
        Math.round(sLast.rgb[1] + (s0.rgb[1] - sLast.rgb[1]) * progress),
        Math.round(sLast.rgb[2] + (s0.rgb[2] - sLast.rgb[2]) * progress)
      ];
    }
    if (f >= sLast.pos) {
      const wrapSpan = (1.0 - sLast.pos) + s0.pos;
      if (wrapSpan === 0) return sLast.rgb;
      const progress = (f - sLast.pos) / wrapSpan;
      return [
        Math.round(sLast.rgb[0] + (s0.rgb[0] - sLast.rgb[0]) * progress),
        Math.round(sLast.rgb[1] + (s0.rgb[1] - sLast.rgb[1]) * progress),
        Math.round(sLast.rgb[2] + (s0.rgb[2] - sLast.rgb[2]) * progress)
      ];
    }

    for (let i = 0; i < stops.length - 1; i++) {
      const s1 = stops[i];
      const s2 = stops[i + 1];
      if (f >= s1.pos && f <= s2.pos) {
        const t = (f - s1.pos) / (s2.pos - s1.pos);
        return [
          Math.max(0, Math.min(255, Math.round(s1.rgb[0] + (s2.rgb[0] - s1.rgb[0]) * t))),
          Math.max(0, Math.min(255, Math.round(s1.rgb[1] + (s2.rgb[1] - s1.rgb[1]) * t))),
          Math.max(0, Math.min(255, Math.round(s1.rgb[2] + (s2.rgb[2] - s1.rgb[2]) * t)))
        ];
      }
    }
    return stops[0].rgb;
  }

  function lerpColor(rgb1, rgb2, t) {
    const clampedT = Math.max(0, Math.min(1, t));
    return [
      Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * clampedT),
      Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * clampedT),
      Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * clampedT)
    ];
  }

  function getDirectedCoordinate(x, y, dir, maxX = 22.5, maxY = 5.5) {
    const normX = Math.max(0, Math.min(1, x / maxX));
    const normY = Math.max(0, Math.min(1, y / maxY));
    const centerX = maxX / 2;
    const centerY = maxY / 2;
    const distCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    const normDist = Math.min(1, distCenter / maxDist);

    switch (dir) {
      case "left_to_right":
        return { primary: normX, secondary: normY, dist: normDist };
      case "right_to_left":
        return { primary: 1 - normX, secondary: normY, dist: normDist };
      case "bottom_to_top":
        return { primary: 1 - normY, secondary: normX, dist: normDist };
      case "top_to_bottom":
        return { primary: normY, secondary: normX, dist: normDist };
      case "center_out":
        return { primary: normDist, secondary: normDist, dist: normDist };
      case "perimeter_in":
        return { primary: 1 - normDist, secondary: 1 - normDist, dist: 1 - normDist };
      default:
        return { primary: normX, secondary: normY, dist: normDist };
    }
  }

  const EFFECT_DIRECTION_MODES = {
    // Spatial 6 directions for Signature PC Effects
    spatial6: [
      { value: "left_to_right", i18n: "optDirLeftToRight", label: "Left to Right (A -> Enter)" },
      { value: "right_to_left", i18n: "optDirRightToLeft", label: "Right to Left (Enter -> A)" },
      { value: "bottom_to_top", i18n: "optDirBottomToTop", label: "Bottom to Top (Spacebar -> Function Row)" },
      { value: "top_to_bottom", i18n: "optDirTopToBottom", label: "Top to Bottom (Function Row -> Spacebar)" },
      { value: "center_out", i18n: "optDirCenterOut", label: "Center Outward (Radial Explosion)" },
      { value: "perimeter_in", i18n: "optDirPerimeterIn", label: "Perimeter Inward (Diffusers -> Center)" }
    ],
    // Horizontal (Left <-> Right)
    horizontal: [
      { value: "left_to_right", i18n: "optDirLeftToRight", label: "Left to Right (A -> Enter)" },
      { value: "right_to_left", i18n: "optDirRightToLeft", label: "Right to Left (Enter -> A)" }
    ],
    // Vertical (Top <-> Bottom)
    vertical: [
      { value: "top_to_bottom", i18n: "optDirTopToBottom", label: "Top to Bottom (Function Row -> Spacebar)" },
      { value: "bottom_to_top", i18n: "optDirBottomToTop", label: "Bottom to Top (Spacebar -> Function Row)" }
    ],
    // Radial (Out <-> In)
    radial: [
      { value: "perimeter_in", i18n: "optDirPerimeterIn", label: "Perimeter Inward (Diffusers -> Center)" },
      { value: "center_out", i18n: "optDirCenterOut", label: "Center Outward (Radial Explosion)" }
    ],
    // Rotational (CW <-> CCW)
    rotational: [
      { value: "cw", i18n: "optDirClockwise", label: "Clockwise (Default)" },
      { value: "ccw", i18n: "optDirCounterClockwise", label: "Counter-Clockwise (Reverse)" }
    ],
    // None / Omnidirectional
    none: [
      { value: "none", i18n: "optDirNotApplicable", label: "Not Applicable (Omnidirectional)" }
    ]
  };

  const EFFECT_TO_DIR_CATEGORY = {
    // Signature PC Effects
    neonWave: "spatial6",
    matrixRain: "spatial6",
    particleStorm: "spatial6",
    aurora: "spatial6",
    pulseBloom: "spatial6",
    fireEmber: "spatial6",
    hyperspaceWarp: "spatial6",

    // QMK Cycling & Radial
    qmk_cycle_all: "none",
    qmk_cycle_left_right: "horizontal",
    qmk_cycle_up_down: "vertical",
    qmk_rainbow_chevron: "horizontal",
    qmk_cycle_out_in: "radial",
    qmk_cycle_out_in_dual: "radial",
    qmk_cycle_pinwheel: "rotational",
    qmk_cycle_spiral: "rotational",
    qmk_dual_beacon: "rotational",
    qmk_rainbow_beacon: "rotational",
    qmk_rainbow_pinwheels: "rotational",

    // QMK Waves & Atmosphere
    qmk_hue_wave: "horizontal",
    qmk_hue_pendulum: "horizontal",
    qmk_breathing: "none",
    qmk_hue_breathing: "none",
    qmk_flower_blooming: "radial",
    qmk_riverflow: "horizontal",

    // QMK Drops & Particles
    qmk_raindrops: "none",
    qmk_jellybean_raindrops: "none",
    qmk_pixel_rain: "vertical",
    qmk_pixel_flow: "horizontal",
    qmk_pixel_fractal: "none",
    qmk_starlight: "none",
    qmk_starlight_smooth: "none",
    qmk_starlight_dual_hue: "none",

    // QMK Bands & Gradients
    qmk_gradient_up_down: "vertical",
    qmk_gradient_left_right: "horizontal",
    qmk_colorband_sat: "horizontal",
    qmk_colorband_val: "horizontal",
    qmk_colorband_pinwheel_sat: "rotational",
    qmk_colorband_pinwheel_val: "rotational",
    qmk_colorband_spiral_sat: "rotational",
    qmk_colorband_spiral_val: "rotational",
    qmk_solid_color: "none",
    qmk_alphas_mods: "none"
  };

  class StudioLightingController {
    constructor(protocol, lightingController) {
      this.protocol = protocol;
      this.lighting = lightingController;

      this.activeTab = "audio"; // "audio" or "effects"
      this.isRunning = false;
      this.animFrameId = null;

      // Audio Context & Analyser
      this.audioCtx = null;
      this.analyser = null;
      this.mediaStream = null;
      this.sourceNode = null;
      this.dataArray = null;
      this.frequencyBands = new Float32Array(16);
      this.bassEnergy = 0;
      this.bassHistory = [];
      this.isBeat = false;
      this.beatDecay = 0;

      // Animation State & Particles
      this.particles = [];
      this.matrixDrops = [];
      this.starfield = [];
      this.warpStars = [];
      this.raindrops = {};
      this.starlightStars = [];
      this.pixelRainDrops = [];
      this.lastFrameTime = 0;

      // Configuration Model
      this.config = {
        enabled: false,
        activeTab: "audio",

        // Audio Visualizer Settings
        sourceId: "system_loopback",
        audioMode: "equalizer", // equalizer, bassPulse, vuMeter, audioWave, spectrumHeatmap, starfieldBeats, voiceAura
        audioColorMode: "rainbow", // rainbow, cyberpunk, vaporwave, fire_ember, ocean_abyss, matrix_code, synthwave, ice_glacier, toxic_radiation, singleColor
        audioDirection: "bottom_to_top", // bottom_to_top, top_to_bottom, left_to_right, right_to_left, center_out, perimeter_in
        audioColor: [0, 255], // HSV [H, S] for singleColor
        audioCustomHex: "#00ffff",
        sensitivity: 1.2,
        audioSpeed: 1.0,
        audioIntensity: 1.0,
        smoothing: 0.82,
        audioFloor: 0.15,

        // PC Software Animation Settings
        effectPreset: "neonWave", // neonWave, matrixRain, particleStorm, aurora, pulseBloom, fireEmber, hyperspaceWarp
        softwarePalette: "rainbow",
        softwareDirection: "left_to_right",
        softwareCustomHex: "#00ffff",
        effectSpeed: 1.0,
        effectIntensity: 1.0,
        softwareFloor: 0.10,

        // Sidelight (Underglow Lightbars) Settings
        sidelightCustomEnable: false,
        sidelightMode: "followMain", // followMain, vuMeterStereo, waveFlow, rhythmicPulse, solidAccent, off
        sidelightPalette: "rainbow",
        sidelightCustomHex: "#00ffff",
        sidelightSpeed: 1.0,
        sidelightIntensity: 1.0
      };

      // Hardware Direct Lighting Streaming
      this._lastHardwareStreamTime = 0;
      this._isHardwareStreaming = false;
      this._logoCurRgb = { r: 0, g: 0, b: 0 };
      this._lastTickTime = 0;
      this._bgTimer = null;

      this._boundTick = this._tick.bind(this);
      this._boundBackgroundTick = this._backgroundTick.bind(this);
      this._setupVisibilityHandler();
    }

    _setupVisibilityHandler() {
      document.addEventListener("visibilitychange", () => {
        if (!this.isRunning) return;
        if (document.hidden) {
          if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
          if (this._bgTimer) clearInterval(this._bgTimer);
          this._bgTimer = setInterval(this._boundBackgroundTick, 33);
        } else {
          if (this._bgTimer) {
            clearInterval(this._bgTimer);
            this._bgTimer = null;
          }
          if (!this.animFrameId) {
            this.animFrameId = requestAnimationFrame(this._boundTick);
          }
        }
      });
    }

    async init() {
      await this._loadConfig();
      this._bindUI();
      await this.enumerateAudioSources();
      this._initParticles();
      this._initMatrixDrops();
      this._initStarfield();
      this._initWarpStars();
      this._syncFormControls();
      this._updateUI();

      if (window.i18n) {
        window.i18n.onChange(() => {
          this.enumerateAudioSources();
          this._updateDirectionOptionsForEffect(this.config.effectPreset || "neonWave");
          this._updateUI();
        });
      }

      // Auto-resume state if user left studio lighting enabled
      if (this.config.enabled) {
        setTimeout(async () => {
          try {
            await this.start(true);
          } catch (e) {
            console.warn("Studio lighting auto-resume skipped on boot:", e);
          }
        }, 150);
      }
    }

    _initParticles() {
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
    }

    _initMatrixDrops() {
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

    _initStarfield() {
      this.starfield = [];
      for (let i = 0; i < 30; i++) {
        this.starfield.push({
          x: Math.random() * 23,
          y: Math.random() * 6,
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04,
          brightness: Math.random() * 0.5,
          colorOffset: Math.random()
        });
      }
    }

    _initWarpStars() {
      this.warpStars = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        this.warpStars.push({
          angle: angle,
          dist: Math.random() * 14,
          speed: 0.05 + Math.random() * 0.15,
          colorOffset: Math.random()
        });
      }
    }

    async enumerateAudioSources() {
      const sel = document.getElementById("audioSourceSelect");
      if (!sel) return;

      const currentVal = this.config.sourceId || "system_loopback";
      const isPl = window.i18n && window.i18n.currentLang === "pl";

      sel.innerHTML = "";
      const optLoopback = document.createElement("option");
      optLoopback.value = "system_loopback";
      optLoopback.textContent = isPl
        ? "Dźwięk systemowy (Głośniki / Loopback)"
        : "System Audio Output (WASAPI / Loopback)";
      sel.appendChild(optLoopback);

      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter((d) => d.kind === "audioinput");

          audioInputs.forEach((dev, idx) => {
            const opt = document.createElement("option");
            opt.value = dev.deviceId;
            opt.textContent = `${dev.label || (isPl ? `Wejście Audio / Mikrofon ${idx + 1}` : `Audio Input / Microphone ${idx + 1}`)}`;
            sel.appendChild(opt);
          });
        } catch (e) {
          console.warn("Could not enumerate audio devices:", e);
        }
      }

      sel.value = currentVal;
      if (sel.value !== currentVal) {
        sel.value = "system_loopback";
        this.config.sourceId = "system_loopback";
        this._saveConfig();
      }
    }

    _syncFormControls() {
      // Audio controls
      const selSource = document.getElementById("audioSourceSelect");
      if (selSource) selSource.value = this.config.sourceId || "system_loopback";

      const selAudioMode = document.getElementById("audioModeSelect");
      if (selAudioMode) selAudioMode.value = this.config.audioMode || "equalizer";

      const selColorMode = document.getElementById("audioColorModeSelect");
      if (selColorMode) {
        selColorMode.value = this.config.audioColorMode || "rainbow";
        const colorWrap = document.getElementById("audioSingleColorGroup");
        if (colorWrap) {
          colorWrap.style.display = this.config.audioColorMode === "singleColor" ? "block" : "none";
        }
      }

      const pickerAudio = document.getElementById("audioColorPicker");
      if (pickerAudio) pickerAudio.value = this.config.audioCustomHex || "#00ffff";

      const selAudioDir = document.getElementById("audioDirectionSelect");
      if (selAudioDir) selAudioDir.value = this.config.audioDirection || "bottom_to_top";

      const sliderAudioSens = document.getElementById("audioSensitivitySlider");
      const lblSens = document.getElementById("audioSensVal");
      if (sliderAudioSens) {
        sliderAudioSens.value = String(this.config.sensitivity || 1.2);
        if (lblSens) lblSens.textContent = `${this.config.sensitivity}x`;
      }

      const sliderAudioSpeed = document.getElementById("audioSpeedSlider");
      const lblAudioSpd = document.getElementById("audioSpeedVal");
      if (sliderAudioSpeed) {
        sliderAudioSpeed.value = String(this.config.audioSpeed || 1.0);
        if (lblAudioSpd) lblAudioSpd.textContent = `${this.config.audioSpeed}x`;
      }

      const sliderAudioInt = document.getElementById("audioIntensitySlider");
      const lblAudioInt = document.getElementById("audioIntensityVal");
      if (sliderAudioInt) {
        sliderAudioInt.value = String(this.config.audioIntensity || 1.0);
        if (lblAudioInt) lblAudioInt.textContent = `${Math.round((this.config.audioIntensity || 1.0) * 100)}%`;
      }

      const sliderAudioSmooth = document.getElementById("audioSmoothingSlider");
      const lblAudioSmooth = document.getElementById("audioSmoothingVal");
      if (sliderAudioSmooth) {
        sliderAudioSmooth.value = String(this.config.smoothing || 0.82);
        if (lblAudioSmooth) lblAudioSmooth.textContent = String(this.config.smoothing || 0.82);
      }

      const sliderAudioFloor = document.getElementById("audioFloorSlider");
      const lblAudioFloor = document.getElementById("audioFloorVal");
      if (sliderAudioFloor) {
        sliderAudioFloor.value = String(this.config.audioFloor || 0.15);
        if (lblAudioFloor) lblAudioFloor.textContent = `${Math.round((this.config.audioFloor || 0.15) * 100)}%`;
      }

      // PC Software FX controls
      const selEffect = document.getElementById("softwareEffectSelect");
      if (selEffect) selEffect.value = this.config.effectPreset || "neonWave";

      const selSoftPalette = document.getElementById("softwarePaletteSelect");
      if (selSoftPalette) {
        selSoftPalette.value = this.config.softwarePalette || "rainbow";
        const colorWrap = document.getElementById("softwareSingleColorGroup");
        if (colorWrap) {
          colorWrap.style.display = this.config.softwarePalette === "singleColor" ? "block" : "none";
        }
      }

      const pickerSoft = document.getElementById("softwareColorPicker");
      if (pickerSoft) pickerSoft.value = this.config.softwareCustomHex || "#00ffff";

      this._updateDirectionOptionsForEffect(this.config.effectPreset || "neonWave");

      const sliderEffectSpeed = document.getElementById("softwareEffectSpeedSlider");
      const lblSpeed = document.getElementById("softwareEffectSpeedVal");
      if (sliderEffectSpeed) {
        sliderEffectSpeed.value = String(this.config.effectSpeed || 1.0);
        if (lblSpeed) lblSpeed.textContent = `${this.config.effectSpeed}x`;
      }

      const sliderEffectIntensity = document.getElementById("softwareEffectIntensitySlider");
      const lblInt = document.getElementById("softwareEffectIntensityVal");
      if (sliderEffectIntensity) {
        sliderEffectIntensity.value = String(this.config.effectIntensity || 1.0);
        if (lblInt) lblInt.textContent = `${Math.round((this.config.effectIntensity || 1.0) * 100)}%`;
      }

      const sliderSoftFloor = document.getElementById("softwareEffectFloorSlider");
      const lblSoftFloor = document.getElementById("softwareFloorVal");
      if (sliderSoftFloor) {
        sliderSoftFloor.value = String(this.config.softwareFloor || 0.10);
        if (lblSoftFloor) lblSoftFloor.textContent = `${Math.round((this.config.softwareFloor || 0.10) * 100)}%`;
      }

      // Studio Sidelights (Underglow Lightbars) controls
      const chkStudioSide = document.getElementById("chkStudioSidelightCustomEnable");
      if (chkStudioSide) chkStudioSide.checked = !!this.config.sidelightCustomEnable;

      const studioSideWrap = document.getElementById("studioSidelightControlsContainer");
      if (studioSideWrap) {
        studioSideWrap.style.display = this.config.sidelightCustomEnable ? "block" : "none";
      }

      const selStudioSideMode = document.getElementById("studioSidelightModeSelect");
      if (selStudioSideMode) selStudioSideMode.value = this.config.sidelightMode || "followMain";

      const selStudioSidePalette = document.getElementById("studioSidelightPaletteSelect");
      if (selStudioSidePalette) {
        selStudioSidePalette.value = this.config.sidelightPalette || "rainbow";
        const sideColorGrp = document.getElementById("studioSidelightColorGroup");
        if (sideColorGrp) {
          sideColorGrp.style.display = (this.config.sidelightPalette === "singleColor" || this.config.sidelightMode === "solidAccent") ? "block" : "none";
        }
      }

      const pickerStudioSide = document.getElementById("studioSidelightColorPicker");
      if (pickerStudioSide) pickerStudioSide.value = this.config.sidelightCustomHex || "#00ffff";

      const sliderStudioSideSpeed = document.getElementById("studioSidelightSpeedSlider");
      const lblStudioSideSpeed = document.getElementById("studioSidelightSpeedVal");
      if (sliderStudioSideSpeed) {
        sliderStudioSideSpeed.value = String(this.config.sidelightSpeed || 1.0);
        if (lblStudioSideSpeed) lblStudioSideSpeed.textContent = `${this.config.sidelightSpeed}x`;
      }

      const sliderStudioSideInt = document.getElementById("studioSidelightIntensitySlider");
      const lblStudioSideInt = document.getElementById("studioSidelightIntensityVal");
      if (sliderStudioSideInt) {
        sliderStudioSideInt.value = String(this.config.sidelightIntensity || 1.0);
        if (lblStudioSideInt) lblStudioSideInt.textContent = `${Math.round((this.config.sidelightIntensity || 1.0) * 100)}%`;
      }
    }

    _updateDirectionOptionsForEffect(preset) {
      const selDir = document.getElementById("softwareDirectionSelect");
      if (!selDir) return;

      const cat = EFFECT_TO_DIR_CATEGORY[preset] || "spatial6";
      const options = EFFECT_DIRECTION_MODES[cat] || EFFECT_DIRECTION_MODES.spatial6;

      const currentVal = this.config.softwareDirection;
      selDir.innerHTML = "";

      options.forEach((opt) => {
        const optionEl = document.createElement("option");
        optionEl.value = opt.value;
        optionEl.setAttribute("data-i18n", opt.i18n);
        optionEl.textContent = (window.i18n && typeof window.i18n.t === "function") ? window.i18n.t(opt.i18n) : opt.label;
        selDir.appendChild(optionEl);
      });

      const hasCurrent = options.some((opt) => opt.value === currentVal);
      if (hasCurrent) {
        selDir.value = currentVal;
      } else {
        selDir.value = options[0].value;
        this.config.softwareDirection = options[0].value;
        this._saveConfig();
      }

      selDir.disabled = (cat === "none");
    }

    switchSubTab(tabName) {
      this.activeTab = tabName;
      this.config.activeTab = tabName;
      this._saveConfig();

      document.querySelectorAll(".studio-lighting-tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
      });

      const audioPane = document.getElementById("pane-studio-audio");
      const fxPane = document.getElementById("pane-studio-effects");
      if (audioPane) audioPane.style.display = tabName === "audio" ? "block" : "none";
      if (fxPane) fxPane.style.display = tabName === "effects" ? "block" : "none";

      if (this.isRunning) {
        if (tabName === "effects" && this.audioCtx) {
          this._stopAudioStream();
        } else if (tabName === "audio" && !this.audioCtx) {
          this._startAudioStream();
        }
      }
    }

    async start(silent = false) {
      if (this.isRunning) return;

      try {
        if (this.activeTab === "audio") {
          await this._startAudioStream();
        }

        this.isRunning = true;
        this.config.enabled = true;
        this._saveConfig();
        this._updateUI();

        if (this.protocol && this.protocol.isConnected) {
          this.protocol.setDirectLightingEnable(true);
        }

        if (this._bgTimer) {
          clearInterval(this._bgTimer);
          this._bgTimer = null;
        }

        if (document.hidden) {
          this._bgTimer = setInterval(this._boundBackgroundTick, 33);
        } else {
          if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
          this.animFrameId = requestAnimationFrame(this._boundTick);
        }

        if (!silent && window.gUI) {
          window.gUI.showToast(window.i18n ? window.i18n.t("toastStudioLightingStarted") : "LuxQMK Studio Lighting activated", "success");
        }
      } catch (err) {
        console.warn("Could not start studio lighting:", err);
        this.stop();
        if (!silent && window.gUI) {
          const errMsg = window.i18n ? window.i18n.t("toastAudioError", { err: err.message }) : ("Error: " + err.message);
          window.gUI.showToast(errMsg, "error");
        }
      }
    }

    stop() {
      this.isRunning = false;
      this.config.enabled = false;
      this._saveConfig();

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }

      if (this._bgTimer) {
        clearInterval(this._bgTimer);
        this._bgTimer = null;
      }

      if (this.protocol && this.protocol.isConnected) {
        this.protocol.setDirectLightingEnable(false);
      }

      this._stopAudioStream();
      this._updateUI();

      // Reset preview key styling to default
      if (this.lighting && this.lighting.visualizerKeys) {
        this.lighting.visualizerKeys.forEach((k) => {
          k._curRgb = { r: 0, g: 0, b: 0 };
          const targets = k.els || [k.el];
          targets.forEach((el) => {
            if (el) {
              el.style.backgroundColor = "";
              el.style.borderColor = "";
              el.style.boxShadow = "";
              el.style.color = "";
              el.style.textShadow = "";
            }
          });
        });
      }

      if (this.lighting && this.lighting.sideDiffusers) {
        this.lighting.sideDiffusers.forEach((sd) => {
          sd._curRgb = { r: 0, g: 0, b: 0 };
          const targets = sd.els || [sd.el];
          targets.forEach((el) => {
            if (el) {
              el.style.backgroundColor = "";
              el.style.boxShadow = "";
            }
          });
        });
      }

      if (this.lighting && this.lighting.logoBadgeEl) {
        this._logoCurRgb = { r: 0, g: 0, b: 0 };
        const targets = Array.isArray(this.lighting.logoBadgeEl) ? this.lighting.logoBadgeEl : [this.lighting.logoBadgeEl];
        targets.forEach((el) => {
          if (el) {
            el.style.backgroundColor = "";
            el.style.borderColor = "";
            el.style.boxShadow = "";
          }
        });
      }

      if (window.gUI) {
        window.gUI.showToast(window.i18n ? window.i18n.t("toastStudioLightingStopped") : "LuxQMK Studio Lighting stopped", "info");
      }
    }

    async _startAudioStream() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      if (this.config.sourceId === "system_loopback") {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
          this.mediaStream.getVideoTracks().forEach((t) => t.stop());
        } else {
          throw new Error("System audio loopback is not supported in this environment");
        }
      } else {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: this.config.sourceId },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          },
          video: false
        });
      }

      if (!this.mediaStream || this.mediaStream.getAudioTracks().length === 0) {
        throw new Error("No audio stream track found");
      }

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = this.config.smoothing || 0.82;

      this.sourceNode.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    _stopAudioStream() {
      if (this.sourceNode) {
        try { this.sourceNode.disconnect(); } catch (e) {}
        this.sourceNode = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
      }
      if (this.audioCtx) {
        try { this.audioCtx.close(); } catch (e) {}
        this.audioCtx = null;
      }
    }

    _tick(now) {
      if (!this.isRunning) return;

      const tNow = typeof now === "number" ? now : performance.now();
      this._lastTickTime = tNow;

      if (this.activeTab === "audio" && this.analyser) {
        this._processAudioAnalysis();
        this._renderAudioFrame(tNow);
      } else {
        this._renderSoftwareFxFrame(tNow);
      }

      this._streamToHardware(tNow);

      if (this.isRunning && !document.hidden && typeof requestAnimationFrame !== "undefined") {
        this.animFrameId = requestAnimationFrame(this._boundTick);
      }
    }

    _backgroundTick() {
      if (!this.isRunning || !document.hidden) return;
      const now = performance.now();
      if (this.activeTab === "audio" && this.analyser) {
        this._processAudioAnalysis();
        this._renderAudioFrame(now);
      } else {
        this._renderSoftwareFxFrame(now);
      }
      this._streamToHardware(now);
    }

    _processAudioAnalysis() {
      this.analyser.getByteFrequencyData(this.dataArray);

      // 1. 16 Frequency Bands
      const binCount = this.analyser.frequencyBinCount;
      const step = Math.floor(binCount / 16);

      for (let i = 0; i < 16; i++) {
        let sum = 0;
        const start = i * step;
        const end = start + step;
        for (let b = start; b < end; b++) {
          sum += this.dataArray[b];
        }
        const avg = (sum / step) * (this.config.sensitivity || 1.2);
        this.frequencyBands[i] = Math.min(255, avg);
      }

      // 2. Bass Beat Detection
      let bassSum = 0;
      for (let b = 0; b < 4; b++) {
        bassSum += this.dataArray[b];
      }
      const curBass = (bassSum / 4) * (this.config.sensitivity || 1.2);
      this.bassHistory.push(curBass);
      if (this.bassHistory.length > 30) this.bassHistory.shift();

      const avgBass = this.bassHistory.reduce((a, v) => a + v, 0) / this.bassHistory.length;
      if (curBass > avgBass * 1.35 && curBass > 85) {
        this.isBeat = true;
        this.beatDecay = 255;
      } else {
        this.isBeat = false;
        this.beatDecay = Math.max(0, this.beatDecay - 16);
      }
      this.bassEnergy = curBass;
    }

    _renderAudioFrame(now) {
      if (!this.lighting || !this.lighting.visualizerKeys) return;

      const keys = this.lighting.visualizerKeys;
      const palette = this.config.audioColorMode || "rainbow";
      const direction = this.config.audioDirection || "bottom_to_top";
      const speed = this.config.audioSpeed || 1.0;
      const intensity = this.config.audioIntensity || 1.0;
      const floor = (this.config.audioFloor <= 0.01) ? 0 : (this.config.audioFloor || 0.15);
      const customRgb = this._hexToRgbList(this.config.audioCustomHex || "#00ffff");

      // Advance starfield particles if active
      if (this.config.audioMode === "starfieldBeats") {
        this.starfield.forEach((s) => {
          s.x += s.vx * speed * (1 + this.bassEnergy * 0.005);
          s.y += s.vy * speed * (1 + this.bassEnergy * 0.005);
          if (s.x < 0) s.x = 23; if (s.x > 23) s.x = 0;
          if (s.y < 0) s.y = 6;  if (s.y > 6) s.y = 0;
        });
      }

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.isLogo || k.isKnob) continue;

        const dirCoord = getDirectedCoordinate(k.x, k.y, direction);
        let rgb = [0, 0, 0];
        let brightFactor = floor;

        switch (this.config.audioMode) {
          case "equalizer": {
            // Equalizer spectrum columns along chosen direction
            const bandIdx = Math.min(15, Math.max(0, Math.floor(dirCoord.secondary * 16)));
            const bandVal = this.frequencyBands[bandIdx] || 0;
            const noiseGate = 10;
            const effectiveBand = bandVal > noiseGate ? bandVal : 0;
            const heightThreshold = dirCoord.primary * 255;

            if (effectiveBand > 0 && effectiveBand >= heightThreshold) {
              const normVal = effectiveBand / 255;
              brightFactor = (floor + (1 - floor) * normVal) * intensity;
              const sampled = samplePaletteRgb(palette, dirCoord.secondary - now * 0.0005 * speed, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round((dirCoord.secondary * 255 + now * 0.02 * speed) % 256), 255, 255);
            } else {
              brightFactor = floor * intensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, dirCoord.secondary - now * 0.0005 * speed, customRgb);
                rgb = sampled ? sampled : this._hsvToRgbList(Math.round((dirCoord.secondary * 255) % 256), 255, 255);
              } else {
                rgb = [0, 0, 0];
              }
            }
            break;
          }

          case "bassPulse": {
            // Bass beat drop shockwave radiating along chosen direction
            const shockwave = Math.max(0, Math.sin((dirCoord.dist * 12) - (now * 0.008 * speed)));
            const pulseNorm = (this.beatDecay / 255) * Math.pow(shockwave, 2);
            if (pulseNorm > 0.02) {
              brightFactor = (floor + (1 - floor) * pulseNorm) * intensity;
              const sampled = samplePaletteRgb(palette, dirCoord.dist * 0.8 - now * 0.0008 * speed, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round((now * 0.04 * speed + dirCoord.dist * 40) % 256), 255, 255);
            } else {
              brightFactor = floor * intensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, dirCoord.dist * 0.8, customRgb);
                rgb = sampled ? sampled : this._hsvToRgbList(Math.round((dirCoord.dist * 40) % 256), 255, 255);
              } else {
                rgb = [0, 0, 0];
              }
            }
            break;
          }

          case "vuMeter": {
            // Stereo VU Meter
            const isRightChannel = k.x > 11.25;
            const band = isRightChannel ? this.frequencyBands[12] : this.frequencyBands[3];
            const xNorm = isRightChannel ? ((k.x - 11.25) / 11.25) : ((11.25 - k.x) / 11.25);
            if (band > 12 && (xNorm * 255) <= band) {
              brightFactor = 1.0 * intensity;
              const sampled = samplePaletteRgb(palette, xNorm, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round(85 - (xNorm * 85)), 255, 255);
            } else {
              brightFactor = floor * intensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, xNorm, customRgb);
                rgb = sampled ? sampled : this._hsvToRgbList(Math.round(85 - (xNorm * 85)), 255, 255);
              } else {
                rgb = [0, 0, 0];
              }
            }
            break;
          }

          case "audioWave": {
            // Propagating Energy Ripple Wavefront moving along dirCoord.primary
            const waveProg = (now * 0.0006 * speed) % 1.0;
            const diff = Math.abs(dirCoord.primary - waveProg);
            const wrappedDiff = Math.min(diff, 1 - diff);
            if (wrappedDiff < 0.12 && this.bassEnergy > 10) {
              const ripple = Math.pow(1 - (wrappedDiff / 0.12), 2);
              const waveNorm = Math.min(1.0, ripple * (this.bassEnergy / 180));
              brightFactor = (floor + (1 - floor) * waveNorm) * intensity;
              const sampled = samplePaletteRgb(palette, dirCoord.primary - now * 0.0006 * speed, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round((dirCoord.primary * 160 - now * 0.04 * speed) & 0xFF), 255, 255);
            } else {
              brightFactor = floor * intensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, dirCoord.primary, customRgb);
                rgb = sampled ? sampled : this._hsvToRgbList(Math.round(dirCoord.primary * 160) & 0xFF, 255, 255);
              } else {
                rgb = [0, 0, 0];
              }
            }
            break;
          }

          case "spectrumHeatmap": {
            // Frequency Zone Heatmap along chosen direction
            const lowWeight = (this.frequencyBands[1] + this.frequencyBands[2]) / 510;
            const midWeight = (this.frequencyBands[6] + this.frequencyBands[7]) / 510;
            const highWeight = (this.frequencyBands[12] + this.frequencyBands[13]) / 510;

            const dLow = Math.max(0, 1 - (dirCoord.primary * 1.5));
            const dMid = 1 - Math.abs(dirCoord.primary - 0.5) * 2;
            const dHigh = Math.max(0, (dirCoord.primary - 0.3) * 1.4);

            const combinedEnergy = Math.min(1.0, lowWeight * dLow + midWeight * dMid + highWeight * dHigh);
            if (combinedEnergy > 0.03) {
              brightFactor = (floor + (1 - floor) * combinedEnergy) * intensity;
              const palettePos = (dirCoord.primary * 0.7) + (combinedEnergy * 0.3);
              const sampled = samplePaletteRgb(palette, palettePos, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round(dirCoord.primary * 180), 255, 255);
            } else {
              brightFactor = floor * intensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, dirCoord.primary * 0.7, customRgb);
                rgb = sampled ? sampled : this._hsvToRgbList(Math.round(dirCoord.primary * 180), 255, 255);
              } else {
                rgb = [0, 0, 0];
              }
            }
            break;
          }

          case "starfieldBeats": {
            // Starfield particle beats
            let maxStarBright = 0;
            let starColorOffset = 0;

            this.starfield.forEach((s) => {
              const dx = k.x - s.x;
              const dy = k.y - s.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 2.0) {
                const b = (1 - (dist / 2.0)) * (0.3 + (this.beatDecay / 255) * 1.2);
                if (b > maxStarBright) {
                  maxStarBright = b;
                  starColorOffset = s.colorOffset;
                }
              }
            });

            if (maxStarBright > 0.05) {
              brightFactor = (floor + (1 - floor) * Math.min(1.0, maxStarBright)) * intensity;
              const sampled = samplePaletteRgb(palette, starColorOffset + now * 0.0003 * speed, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round(starColorOffset * 255 + now * 0.03) % 256, 255, 255);
            } else {
              brightFactor = floor * intensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, 0.5, customRgb);
                rgb = sampled ? sampled : [0, 100, 200];
              } else {
                rgb = [0, 0, 0];
              }
            }
            break;
          }

          case "voiceAura": {
            // Voice / Mic Breathing Aura
            const micLevel = (this.frequencyBands[3] + this.frequencyBands[5] + this.frequencyBands[8]) / 765;
            const wave = Math.sin((dirCoord.dist * 6) - (now * 0.004 * speed));
            const auraNorm = Math.max(0, Math.min(1.0, micLevel * 1.3 + (micLevel > 0.05 ? wave * 0.2 : 0)));
            if (auraNorm > 0.03) {
              brightFactor = (floor + (1 - floor) * auraNorm) * intensity;
              const sampled = samplePaletteRgb(palette, dirCoord.dist * 0.5 + micLevel * 0.5, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round(140 + wave * 30), 240, 255);
            } else {
              brightFactor = floor * intensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, dirCoord.dist * 0.5, customRgb);
                rgb = sampled ? sampled : [0, 150, 150];
              } else {
                rgb = [0, 0, 0];
              }
            }
            break;
          }
        }

        this._applyKeyRgb(k, rgb[0], rgb[1], rgb[2], brightFactor);
      }

      // Render Left & Right Side Diffusers
      if (this.config.sidelightCustomEnable && this.config.sidelightMode !== "followMain") {
        this._renderStudioSidelights(now, speed, intensity, floor);
      } else {
        const diffusers = this.lighting.sideDiffusers || [];
        for (let i = 0; i < diffusers.length; i++) {
          const sd = diffusers[i];
          if (!sd || !sd.el) continue;

          const x = sd.isLeft ? 0 : 22.5;
          const y = (sd.qmkY / 64) * 5.5;
          const dirCoord = getDirectedCoordinate(x, y, direction);

          let brightFactor = floor;
          let rgb = [0, 0, 0];

          const bandIdx = sd.isLeft
            ? Math.min(7, Math.floor(dirCoord.primary * 8))
            : Math.min(15, 8 + Math.floor(dirCoord.primary * 8));
          const bandVal = this.frequencyBands[bandIdx] || 0;

          if (bandVal > 10 || this.beatDecay > 10) {
            const normVal = Math.min(1.0, ((bandVal / 255) + (this.beatDecay / 350)));
            brightFactor = (floor + (1 - floor) * normVal) * intensity;
            const sampled = samplePaletteRgb(palette, dirCoord.primary - now * 0.0005 * speed, customRgb);
            rgb = sampled ? sampled : this._hsvToRgbList(Math.round(dirCoord.primary * 160 - now * 0.02 * speed) % 256, 255, 255);
          } else {
            brightFactor = floor * intensity;
            if (floor > 0.005) {
              const sampled = samplePaletteRgb(palette, dirCoord.primary, customRgb);
              rgb = sampled ? sampled : [0, 120, 255];
            } else {
              rgb = [0, 0, 0];
            }
          }

          this._applyDiffuserRgb(sd, rgb[0], rgb[1], rgb[2], brightFactor);
        }
      }

      // Render Logo Badge LED
      if (this.lighting.logoBadgeEl) {
        let logoBright = floor * intensity;
        let logoRgb = [0, 0, 0];
        if (this.bassEnergy > 10) {
          const normBass = Math.min(1.0, this.bassEnergy / 200);
          logoBright = (floor + (1 - floor) * normBass) * intensity;
          const sampled = samplePaletteRgb(palette, now * 0.0008 * speed, customRgb);
          logoRgb = sampled ? sampled : this._hsvToRgbList(Math.round((now * 0.05 * speed) % 256), 255, 255);
        } else if (floor > 0.005) {
          const sampled = samplePaletteRgb(palette, now * 0.0008 * speed, customRgb);
          logoRgb = sampled ? sampled : [0, 200, 255];
        }
        this._applyLogoRgb(this.lighting.logoBadgeEl, logoRgb[0], logoRgb[1], logoRgb[2], logoBright);
      }
    }

    _renderStudioSidelights(now, masterSpeed, masterIntensity, floor) {
      const diffusers = this.lighting.sideDiffusers || [];
      if (diffusers.length === 0) return;

      const sideMode = this.config.sidelightMode || "followMain";
      const palette = this.config.sidelightPalette || "rainbow";
      const sSpeed = (this.config.sidelightSpeed || 1.0) * (masterSpeed || 1.0);
      const sIntensity = (this.config.sidelightIntensity || 1.0) * (masterIntensity || 1.0);
      const customRgb = this._hexToRgbList(this.config.sidelightCustomHex || "#00ffff");

      for (let i = 0; i < diffusers.length; i++) {
        const sd = diffusers[i];
        if (!sd || !sd.el) continue;

        let rgb = [0, 0, 0];
        let brightFactor = floor;

        const qY = (sd.qmkY !== undefined) ? sd.qmkY : 37.5;
        const normY = Math.max(0, Math.min(1, (qY - 15) / 45));

        switch (sideMode) {
          case "vuMeterStereo": {
            // Left channel (bands 0..7), Right channel (bands 8..15)
            const bandIdx = sd.isLeft
              ? Math.min(7, Math.max(0, Math.floor((1 - normY) * 8)))
              : Math.min(15, Math.max(8, 8 + Math.floor((1 - normY) * 8)));
            const bandVal = (this.frequencyBands && this.frequencyBands[bandIdx]) || 0;
            const threshold = (1 - normY) * 255;

            if (bandVal > 15 && bandVal >= threshold) {
              brightFactor = Math.min(1.0, (bandVal / 255)) * sIntensity;
              const sampled = samplePaletteRgb(palette, 1 - normY, customRgb);
              rgb = sampled ? sampled : this._hsvToRgbList(Math.round(85 - ((1 - normY) * 85)), 255, 255);
            } else {
              brightFactor = floor * sIntensity;
              if (floor > 0.005) {
                const sampled = samplePaletteRgb(palette, 1 - normY, customRgb);
                rgb = sampled ? sampled : [0, 100, 200];
              }
            }
            break;
          }

          case "waveFlow": {
            const wavePhase = (now * 0.0008 * sSpeed - normY * 1.5) % 1.0;
            const phaseNorm = (wavePhase + 1.0) % 1.0;
            const waveSin = 0.5 + 0.5 * Math.sin(phaseNorm * Math.PI * 2);
            brightFactor = (floor + (1 - floor) * waveSin) * sIntensity;
            const sampled = samplePaletteRgb(palette, phaseNorm, customRgb);
            rgb = sampled ? sampled : this._hsvToRgbList(Math.round(phaseNorm * 255), 255, 255);
            break;
          }

          case "centerWaveFlow": {
            const distCenter = Math.abs(normY - 0.5) * 2.0;
            const wavePhase = (now * 0.0008 * sSpeed - distCenter * 1.5) % 1.0;
            const phaseNorm = (wavePhase + 1.0) % 1.0;
            const waveSin = 0.5 + 0.5 * Math.sin(phaseNorm * Math.PI * 2);
            brightFactor = (floor + (1 - floor) * waveSin) * sIntensity;
            const sampled = samplePaletteRgb(palette, phaseNorm, customRgb);
            rgb = sampled ? sampled : this._hsvToRgbList(Math.round(phaseNorm * 255), 255, 255);
            break;
          }

          case "rhythmicPulse": {
            const pulse = (this.beatDecay > 10)
              ? (this.beatDecay / 255)
              : (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.004 * sSpeed)));
            brightFactor = (floor + (1 - floor) * pulse) * sIntensity;
            const sampled = samplePaletteRgb(palette, now * 0.0005 * sSpeed, customRgb);
            rgb = sampled ? sampled : this._hsvToRgbList(Math.round((now * 0.03 * sSpeed) % 256), 255, 255);
            break;
          }

          case "solidAccent": {
            brightFactor = 1.0 * sIntensity;
            rgb = customRgb;
            break;
          }

          case "off": {
            brightFactor = 0;
            rgb = [0, 0, 0];
            break;
          }

          default:
            brightFactor = floor;
            rgb = [0, 0, 0];
            break;
        }

        this._applyDiffuserRgb(sd, rgb[0], rgb[1], rgb[2], brightFactor);
      }
    }

    _renderSoftwareFxFrame(now) {
      if (!this.lighting || !this.lighting.visualizerKeys) return;

      const keys = this.lighting.visualizerKeys;
      const preset = this.config.effectPreset || "neonWave";
      const palette = this.config.softwarePalette || "rainbow";
      const direction = this.config.softwareDirection || "left_to_right";
      const speed = this.config.effectSpeed || 1.0;
      const intensity = this.config.effectIntensity || 1.0;
      const floor = (this.config.softwareFloor <= 0.01) ? 0 : (this.config.softwareFloor || 0.10);
      const customRgb = this._hexToRgbList(this.config.softwareCustomHex || "#00ffff");
      const customGradientStops = this.config.softwareGradientStops || (window.PRESET_GRADIENTS?.cyberpunk?.stops);

      // Update particle physics & procedural generators
      if (preset === "particleStorm") {
        this.particles.forEach((p) => {
          p.x += p.vx * speed;
          p.y += p.vy * speed;
          if (p.x < 0 || p.x > 23) p.vx *= -1;
          if (p.y < 0 || p.y > 6) p.vy *= -1;
        });
      } else if (preset === "matrixRain") {
        this.matrixDrops.forEach((d) => {
          d.y += d.speed * speed;
          if (d.y > 9) {
            d.y = -Math.random() * 4;
            d.speed = 0.08 + Math.random() * 0.12;
          }
        });
      } else if (preset === "hyperspaceWarp") {
        this.warpStars.forEach((ws) => {
          ws.dist += ws.speed * speed;
          if (ws.dist > 16) {
            ws.dist = 0.5 + Math.random() * 2;
            ws.angle = Math.random() * Math.PI * 2;
          }
        });
      } else if (preset === "qmk_pixel_rain") {
        if (!this.pixelRainDrops || this.pixelRainDrops.length === 0) {
          this.pixelRainDrops = [];
          for (let c = 0; c < 24; c++) {
            this.pixelRainDrops.push({
              col: c,
              y: Math.random() * -10,
              speed: 0.04 + Math.random() * 0.07,
              length: 2 + Math.floor(Math.random() * 3),
              hue: Math.random()
            });
          }
        }
        this.pixelRainDrops.forEach((d) => {
          d.y += d.speed * speed;
          if (d.y > 8) {
            d.y = -Math.random() * 5;
            d.speed = 0.04 + Math.random() * 0.07;
            d.hue = Math.random();
          }
        });
      } else if (preset === "qmk_raindrops" || preset === "qmk_jellybean_raindrops") {
        if (!this.raindrops) this.raindrops = {};
        if (Math.random() < 0.35 * speed) {
          const randIdx = Math.floor(Math.random() * keys.length);
          this.raindrops[randIdx] = { life: 1.0, hue: Math.random() };
        }
        for (const idx in this.raindrops) {
          this.raindrops[idx].life -= 0.018 * speed;
          if (this.raindrops[idx].life <= 0) delete this.raindrops[idx];
        }
      } else if (preset.startsWith("qmk_starlight")) {
        if (!this.starlightStars || this.starlightStars.length !== keys.length) {
          this.starlightStars = keys.map((_, idx) => ({
            phase: Math.random() * Math.PI * 2,
            speed: 0.0015 + Math.random() * 0.0035,
            hueOffset: Math.random(),
            isAlt: (idx % 2 === 0)
          }));
        }
      }

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.isLogo || k.isKnob) continue;

        const normX = (k.qmkX !== undefined) ? (k.qmkX / 224) : (k.x / 22.5);
        const normY = (k.qmkY !== undefined) ? (k.qmkY / 64) : (k.y / 5.5);
        const qmkX = (k.qmkX !== undefined) ? k.qmkX : Math.round(normX * 224);
        const qmkY = (k.qmkY !== undefined) ? k.qmkY : Math.round(normY * 64);
        const dx = (k.dx !== undefined) ? (k.dx / 112) : ((k.x - 11.25) / 11.25);
        const dy = (k.dy !== undefined) ? (k.dy / 32) : ((k.y - 2.75) / 2.75);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const angleNorm = ((angle / (Math.PI * 2)) + 1) % 1;
        const isAlpha = (k.group === "alpha" || k.group === "alphas") ||
          (!k.group && normY >= 0.2 && normY <= 0.7 && normX >= 0.08 && normX <= 0.65);
        const dirCoord = getDirectedCoordinate(normX * 22.5, normY * 5.5, direction);

        const { rgb, brightFactor } = this._sampleSoftwareFxPixel({
          normX, normY, qmkX, qmkY, dx, dy, dist, angle, angleNorm, dirCoord, isAlpha, i, isDiffuser: false,
          now, preset, palette, direction, speed, intensity, floor, customRgb, customGradientStops
        });

        this._applyKeyRgb(k, rgb[0], rgb[1], rgb[2], brightFactor);
      }

      // Render Left & Right Side Diffusers
      if (this.config.sidelightCustomEnable && this.config.sidelightMode !== "followMain") {
        this._renderStudioSidelights(now, speed, intensity, floor);
      } else {
        const diffusers = this.lighting.sideDiffusers || [];
        for (let i = 0; i < diffusers.length; i++) {
          const sd = diffusers[i];
          if (!sd || !sd.el) continue;

          const normX = sd.isLeft ? 0 : 1.0;
          const normY = (sd.qmkY !== undefined) ? (sd.qmkY / 64) : 0.5;
          const qmkX = (sd.qmkX !== undefined) ? sd.qmkX : (sd.isLeft ? 0 : 224);
          const qmkY = (sd.qmkY !== undefined) ? sd.qmkY : Math.round(normY * 64);
          const dx = (sd.dx !== undefined) ? (sd.dx / 112) : (sd.isLeft ? -1.0 : 1.0);
          const dy = (sd.dy !== undefined) ? (sd.dy / 32) : ((normY - 0.5) * 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const angleNorm = ((angle / (Math.PI * 2)) + 1) % 1;
          const dirCoord = getDirectedCoordinate(normX * 22.5, normY * 5.5, direction);

          const { rgb, brightFactor } = this._sampleSoftwareFxPixel({
            normX, normY, qmkX, qmkY, dx, dy, dist, angle, angleNorm, dirCoord, isAlpha: false, i: undefined, isDiffuser: true,
            now, preset, palette, direction, speed, intensity, floor, customRgb, customGradientStops
          });

          this._applyDiffuserRgb(sd, rgb[0], rgb[1], rgb[2], brightFactor);
        }
      }

      // Render Logo Badge LED
      if (this.lighting.logoBadgeEl) {
        const logoBright = Math.max(floor * intensity, 0.9 * intensity);
        const sampled = samplePaletteRgb(palette, now * 0.0008 * speed, customRgb, customGradientStops);
        const rgb = sampled ? sampled : this._hsvToRgbList(Math.round((now * 0.05 * speed) % 256), 255, 255);
        this._applyLogoRgb(this.lighting.logoBadgeEl, rgb[0], rgb[1], rgb[2], logoBright);
      }
    }

    _sampleSoftwareFxPixel(params) {
      const {
        normX, normY, qmkX, qmkY, dx, dy, dist, angle, angleNorm, dirCoord, isAlpha, i, isDiffuser,
        now, preset, palette, direction, speed, intensity, floor, customRgb, customGradientStops
      } = params;

      const dx_qmk = (typeof qmkX === "number") ? (qmkX - 112) : Math.round(dx * 112);
      const dy_qmk = (typeof qmkY === "number") ? (qmkY - 32) : Math.round(dy * 32);
      const qmkDist = Math.sqrt(dx_qmk * dx_qmk + dy_qmk * dy_qmk);
      const qmkAngle = ((Math.atan2(dy_qmk, dx_qmk) / (Math.PI * 2)) + 1) % 1 * 256;
      const keyX = (typeof qmkX === "number") ? qmkX : Math.round(normX * 224);
      const keyY = (typeof qmkY === "number") ? qmkY : Math.round(normY * 64);

      let rgb = [0, 0, 0];
      let brightFactor = floor;

      switch (preset) {
        // --- 🌟 Signature PC Effects ---
        case "neonWave": {
          const waveRaw = Math.sin((dirCoord.primary * 5.0) - (now * 0.0035 * speed));
          const waveCutoff = floor > 0.005 ? 0 : 0.08;
          const wavePeak = Math.max(0, (waveRaw - waveCutoff) / (1 - waveCutoff));
          const waveNorm = Math.pow(wavePeak, 1.5);
          brightFactor = (floor + (1 - floor) * waveNorm) * intensity;
          const palettePos = dirCoord.primary - (now * 0.0006 * speed);
          const sampled = samplePaletteRgb(palette, palettePos, customRgb);
          rgb = (brightFactor > 0.005)
            ? (sampled ? sampled : this._hsvToRgbList(Math.round((dirCoord.primary * 160 - now * 0.04 * speed) % 256), 255, 255))
            : [0, 0, 0];
          break;
        }

        case "matrixRain": {
          const col = Math.min(23, Math.max(0, Math.floor(dirCoord.secondary * 24)));
          const drop = this.matrixDrops[col % this.matrixDrops.length];
          const distFlow = (dirCoord.primary * 8) - drop.y;
          if (distFlow >= 0 && distFlow < drop.length) {
            if (distFlow < 0.8) {
              brightFactor = 1.2 * intensity;
              rgb = [255, 255, 255]; // Leading spark
            } else {
              const tail = (1 - (distFlow / drop.length));
              brightFactor = (floor + (1 - floor) * tail) * intensity;
              const sampled = samplePaletteRgb(palette, tail * 0.6 + 0.2, customRgb);
              rgb = sampled ? sampled : [0, 255, 70];
            }
          } else {
            brightFactor = floor * intensity;
            if (floor > 0.005) {
              const sampled = samplePaletteRgb(palette, 0.1, customRgb);
              rgb = sampled ? sampled : [0, 80, 20];
            } else {
              rgb = [0, 0, 0];
            }
          }
          break;
        }

        case "particleStorm": {
          let maxBright = 0;
          let pColorFactor = 0;
          const kx = normX * 22.5;
          const ky = normY * 5.5;

          this.particles.forEach((p) => {
            const pdx = kx - p.x;
            const pdy = ky - p.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist < p.radius) {
              const b = (1 - (pdist / p.radius));
              if (b > maxBright) {
                maxBright = b;
                pColorFactor = p.hue / 255;
              }
            }
          });

          if (maxBright > 0.02) {
            brightFactor = (floor + (1 - floor) * maxBright) * intensity;
            const sampled = samplePaletteRgb(palette, pColorFactor + now * 0.0004 * speed, customRgb);
            rgb = sampled ? sampled : this._hsvToRgbList(Math.round(pColorFactor * 255), 255, 255);
          } else {
            brightFactor = floor * intensity;
            if (floor > 0.005) {
              const sampled = samplePaletteRgb(palette, dirCoord.dist, customRgb);
              rgb = sampled ? sampled : [20, 20, 40];
            } else {
              rgb = [0, 0, 0];
            }
          }
          break;
        }

        case "aurora": {
          const p1 = Math.sin(dirCoord.primary * 4.0 - now * 0.002 * speed);
          const p2 = Math.cos(dirCoord.secondary * 4.0 - now * 0.0025 * speed);
          const rawCombined = (p1 + p2) * 0.5;
          const ribbonCutoff = floor > 0.005 ? 0 : 0.12;
          const combined = Math.max(0, (rawCombined - ribbonCutoff) / (1 - ribbonCutoff));
          const waveNorm = Math.pow(combined, 1.8);
          brightFactor = (floor + (1 - floor) * waveNorm) * intensity;
          const palettePos = 0.5 + rawCombined * 0.4;
          const sampled = samplePaletteRgb(palette, palettePos, customRgb);
          rgb = (brightFactor > 0.005)
            ? (sampled ? sampled : this._hsvToRgbList(Math.round((120 + rawCombined * 60) % 256), 240, 255))
            : [0, 0, 0];
          break;
        }

        case "pulseBloom": {
          const ring = Math.sin((dirCoord.primary * 10.0) - (now * 0.006 * speed));
          const ringCutoff = floor > 0.005 ? 0 : 0.08;
          const ringPeak = Math.max(0, (ring - ringCutoff) / (1 - ringCutoff));
          const ringNorm = Math.pow(ringPeak, 2.5);
          brightFactor = (floor + (1 - floor) * ringNorm) * intensity;
          const palettePos = dirCoord.primary * 0.7 - (now * 0.0008 * speed);
          const sampled = samplePaletteRgb(palette, palettePos, customRgb);
          rgb = (brightFactor > 0.005)
            ? (sampled ? sampled : this._hsvToRgbList(Math.round((dirCoord.primary * 120 - now * 0.04 * speed) % 256), 255, 255))
            : [0, 0, 0];
          break;
        }

        case "fireEmber": {
          const flameBase = 1 - dirCoord.primary;
          const flicker = Math.sin(dirCoord.secondary * 4.0 - now * 0.008 * speed) * Math.cos(dirCoord.primary * 5.0 - now * 0.006 * speed);
          const rawHeat = flameBase + flicker * 0.35;
          const heatCutoff = floor > 0.005 ? 0 : 0.18;
          const flameHeat = Math.max(0, Math.min(1.0, (rawHeat - heatCutoff) / (1 - heatCutoff)));
          const flameNorm = Math.pow(flameHeat, 1.8);
          brightFactor = (floor + (1 - floor) * flameNorm) * intensity;
          const sampled = samplePaletteRgb(palette, 1 - flameHeat, customRgb);
          rgb = (brightFactor > 0.005)
            ? (sampled ? sampled : this._hsvToRgbList(Math.round(scaleBetween(flameHeat, 0, 40)), 255, 255))
            : [0, 0, 0];
          break;
        }

        case "hyperspaceWarp": {
          let maxStar = 0;
          const starDist = dist * 14;
          this.warpStars.forEach((ws) => {
            const dAngle = Math.abs(angle - ws.angle);
            const dDist = Math.abs(starDist - ws.dist);
            if (dAngle < 0.25 && dDist < 1.8) {
              const b = (1 - (dDist / 1.8));
              if (b > maxStar) maxStar = b;
            }
          });

          if (maxStar > 0.05) {
            brightFactor = (floor + (1 - floor) * maxStar) * intensity;
            const sampled = samplePaletteRgb(palette, dist + now * 0.0005 * speed, customRgb);
            rgb = sampled ? sampled : this._hsvToRgbList(Math.round((dist * 180 + now * 0.03 * speed) % 256), 240, 255);
          } else {
            brightFactor = floor * intensity;
            if (floor > 0.005) {
              const sampled = samplePaletteRgb(palette, dist, customRgb);
              rgb = sampled ? sampled : [0, 20, 60];
            } else {
              rgb = [0, 0, 0];
            }
          }
          break;
        }

        // --- 🌈 QMK Cycling & Radial (Exact QMK Firmware Math) ---
        case "qmk_cycle_all": {
          const t = ((direction === "right_to_left" || direction === "ccw" ? -1 : 1) * now * 0.00035 * speed);
          const palettePos = (t % 1.0 + 1.0) % 1.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, palettePos, customRgb);
          break;
        }

        case "qmk_cycle_left_right": {
          const time = (direction === "right_to_left" ? -1 : 1) * (now * 0.00035 * speed * 256);
          const huePos = ((keyX - time) % 256 + 256) % 256 / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_cycle_up_down": {
          const time = (direction === "bottom_to_top" ? -1 : 1) * (now * 0.00035 * speed * 256);
          const huePos = ((keyY * 4 - time) % 256 + 256) % 256 / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_rainbow_chevron": {
          const time = (direction === "right_to_left" ? -1 : 1) * (now * 0.00035 * speed * 256);
          const chevron = Math.abs(dy_qmk) * 2 + keyX + time;
          const huePos = ((chevron % 256 + 256) % 256) / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_cycle_out_in": {
          const time = (direction === "center_out" ? -1 : 1) * (now * 0.00035 * speed * 256);
          const huePos = (((qmkDist * 1.5) + time) % 256 + 256) % 256 / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_cycle_out_in_dual": {
          const dx_dual = 56 - Math.abs(dx_qmk);
          const dist_dual = Math.sqrt(dx_dual * dx_dual + dy_qmk * dy_qmk);
          const time = (direction === "center_out" ? -1 : 1) * (now * 0.00035 * speed * 256);
          const huePos = (((dist_dual * 3.0) + time) % 256 + 256) % 256 / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_cycle_pinwheel": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const time = rotDir * (now * 0.00035 * speed * 256);
          const huePos = ((qmkAngle + time) % 256 + 256) % 256 / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_cycle_spiral": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const time = rotDir * (now * 0.00035 * speed * 256);
          const huePos = ((qmkDist + time - qmkAngle) % 256 + 256) % 256 / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_dual_beacon": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const angleBeam = rotDir * (now * 0.0008 * speed);
          const cos = Math.cos(angleBeam);
          const sin = Math.sin(angleBeam);
          const proj = (dy_qmk * cos + dx_qmk * sin) / 128.0;
          const huePos = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_rainbow_beacon": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const angleBeam = rotDir * (now * 0.0008 * speed);
          const cos = Math.cos(angleBeam);
          const sin = Math.sin(angleBeam);
          const proj = (dy_qmk * 2 * cos + dx_qmk * 2 * sin) / 128.0;
          const huePos = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        case "qmk_rainbow_pinwheels": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const angleBeam = rotDir * (now * 0.0008 * speed);
          const cos = Math.cos(angleBeam);
          const sin = Math.sin(angleBeam);
          const proj = (dy_qmk * 3 * cos + (56 - Math.abs(dx_qmk)) * 3 * sin) / 128.0;
          const huePos = ((proj % 1.0) + 1.0) % 1.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, huePos, customRgb);
          break;
        }

        // --- 🌊 QMK Waves & Atmosphere ---
        case "qmk_hue_wave": {
          const time = (now * 0.00035 * speed * 256) % 256;
          const t = (direction === "right_to_left") ? (255 - time) : time;
          const diff = Math.abs(keyX - t);
          const hueShift = (diff * (24 / 255)) / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, 0.5 + hueShift, customRgb);
          break;
        }

        case "qmk_hue_pendulum": {
          const sinVal = (Math.sin(now * 0.002 * speed) + 1) * 127.5;
          const x = (direction === "right_to_left") ? (224 - keyX) : keyX;
          const diff = Math.abs(sinVal + x - 128);
          const hueShift = (Math.min(255, diff * 2) * (12 / 255)) / 256.0;
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, 0.5 + hueShift, customRgb);
          break;
        }

        case "qmk_breathing": {
          const breath = Math.abs(Math.sin(now * 0.0015 * speed));
          brightFactor = (floor + (1 - floor) * breath) * intensity;
          rgb = samplePaletteRgb(palette, 0.5, customRgb);
          break;
        }

        case "qmk_hue_breathing": {
          const breath = Math.abs(Math.sin(now * 0.0015 * speed));
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, 0.5 + breath * (12 / 256), customRgb);
          break;
        }

        case "qmk_flower_blooming": {
          const time = (direction === "center_out" ? -1 : 1) * (now * 0.00035 * speed * 256);
          const sign = (dy_qmk > 0) ? 1 : -1;
          const huePos = ((keyX * 3 - keyY * 3 + sign * time) % 256 + 256) % 256 / 256.0;
          const col = samplePaletteRgb(palette, huePos, customRgb);
          rgb = (dy_qmk > 0) ? [col[2], col[1], col[0]] : col;
          brightFactor = 1.0 * intensity;
          break;
        }

        case "qmk_riverflow": {
          const idx = (direction === "right_to_left") ? (100 - (i || 0)) : (i || 0);
          const flow = Math.abs(Math.sin(now * 0.0025 * speed + idx * 0.35));
          brightFactor = (floor + (1 - floor) * flow) * intensity;
          rgb = samplePaletteRgb(palette, (idx * 0.02 + now * 0.0002 * speed) % 1.0, customRgb);
          break;
        }

        // --- ✨ QMK Drops & Particles ---
        case "qmk_raindrops": {
          const drop = (this.raindrops && i !== undefined) ? this.raindrops[i] : null;
          if (drop && drop.life > 0) {
            brightFactor = (floor + (1 - floor) * Math.pow(drop.life, 1.5)) * intensity;
            rgb = samplePaletteRgb(palette, drop.hue, customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = (floor > 0.005) ? samplePaletteRgb(palette, 0.5, customRgb) : [0, 0, 0];
          }
          break;
        }

        case "qmk_jellybean_raindrops": {
          const drop = (this.raindrops && i !== undefined) ? this.raindrops[i] : null;
          if (drop && drop.life > 0) {
            brightFactor = (floor + (1 - floor) * Math.pow(drop.life, 1.5)) * intensity;
            rgb = hsvToRgb(Math.round(drop.hue * 255), 255, 255);
          } else {
            brightFactor = floor * intensity;
            rgb = (floor > 0.005) ? [20, 20, 40] : [0, 0, 0];
          }
          break;
        }

        case "qmk_pixel_rain": {
          const col = Math.min(23, Math.max(0, Math.floor(normX * 24)));
          const drop = (this.pixelRainDrops && this.pixelRainDrops.length > 0)
            ? this.pixelRainDrops[col % this.pixelRainDrops.length]
            : null;
          const posY = (direction === "bottom_to_top") ? (1.0 - normY) : normY;
          const distFlow = drop ? ((posY * 6) - drop.y) : -1;
          if (distFlow >= 0 && distFlow < (drop ? drop.length : 2)) {
            const tail = 1 - (distFlow / (drop ? drop.length : 2));
            brightFactor = (floor + (1 - floor) * tail) * intensity;
            rgb = samplePaletteRgb(palette, (drop ? drop.hue : 0.5), customRgb);
          } else {
            brightFactor = floor * intensity;
            rgb = (floor > 0.005) ? samplePaletteRgb(palette, 0.1, customRgb) : [0, 0, 0];
          }
          break;
        }

        case "qmk_pixel_flow": {
          const posX = (direction === "right_to_left") ? (1.0 - normX) : normX;
          const flowVal = Math.sin((posX * 12.0) - (now * 0.004 * speed)) * Math.cos((normY * 8.0) - (now * 0.003 * speed));
          const flowNorm = (flowVal + 1) / 2;
          brightFactor = (floor + (1 - floor) * Math.pow(flowNorm, 1.5)) * intensity;
          const palettePos = (posX * 0.6) + (flowNorm * 0.4) - (now * 0.0003 * speed);
          rgb = samplePaletteRgb(palette, palettePos, customRgb);
          break;
        }

        case "qmk_pixel_fractal": {
          const fx = Math.floor(normX * 32);
          const fy = Math.floor(normY * 12);
          const ft = Math.floor(now * 0.005 * speed);
          const pattern = ((fx ^ fy ^ ft) % 8) / 8;
          brightFactor = (floor + (1 - floor) * pattern) * intensity;
          const palettePos = pattern + (now * 0.0002 * speed);
          rgb = samplePaletteRgb(palette, palettePos, customRgb);
          break;
        }

        case "qmk_starlight": {
          const star = (this.starlightStars && i !== undefined && this.starlightStars[i]) ? this.starlightStars[i] : null;
          const phase = star ? star.phase : 0;
          const twinkle = Math.abs(Math.sin((now * 0.0015 * speed) + phase));
          brightFactor = (floor + (1 - floor) * twinkle) * intensity;
          rgb = samplePaletteRgb(palette, star ? star.hueOffset : 0.5, customRgb);
          break;
        }

        case "qmk_starlight_smooth": {
          const star = (this.starlightStars && i !== undefined && this.starlightStars[i]) ? this.starlightStars[i] : null;
          const phase = star ? star.phase : 0;
          const twinkle = Math.abs(Math.sin((now * 0.0015 * speed) + phase));
          brightFactor = (floor + (1 - floor) * Math.pow(twinkle, 1.5)) * intensity;
          const palettePos = (star ? star.hueOffset : 0.5) + (now * 0.0001 * speed);
          rgb = samplePaletteRgb(palette, palettePos, customRgb);
          break;
        }

        case "qmk_starlight_dual_hue": {
          const star = (this.starlightStars && i !== undefined && this.starlightStars[i]) ? this.starlightStars[i] : null;
          const phase = star ? star.phase : 0;
          const twinkle = Math.abs(Math.sin((now * 0.0015 * speed) + phase));
          brightFactor = (floor + (1 - floor) * Math.pow(twinkle, 1.5)) * intensity;
          const palettePos = (star && star.isAlt) ? 0.15 : 0.65;
          rgb = samplePaletteRgb(palette, palettePos, customRgb);
          break;
        }

        // --- 🎨 QMK Bands & Gradients (Exact QMK Firmware Math) ---
        case "qmk_gradient_up_down": {
          const pos = (direction === "bottom_to_top") ? (1.0 - normY) : normY;
          const palettePos = pos * (speed * 0.8);
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, palettePos, customRgb);
          break;
        }

        case "qmk_gradient_left_right": {
          const pos = (direction === "right_to_left") ? (1.0 - normX) : normX;
          const palettePos = pos * (speed * 0.8);
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, palettePos, customRgb);
          break;
        }

        case "qmk_colorband_sat": {
          const time = (now * 0.00035 * speed * 256) % 256;
          const t = (direction === "right_to_left") ? (255 - time) : time;
          const x255 = (keyX * 228 / 224) + 28;
          const diff = Math.abs(x255 - t);
          const satVal = Math.max(0, 1.0 - (diff * 8.0 / 255.0));
          const baseRgb = samplePaletteRgb(palette, normX, customRgb);
          brightFactor = 1.0 * intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, satVal);
          break;
        }

        case "qmk_colorband_val": {
          const time = (now * 0.00035 * speed * 256) % 256;
          const t = (direction === "right_to_left") ? (255 - time) : time;
          const x255 = (keyX * 228 / 224) + 28;
          const diff = Math.abs(x255 - t);
          const val = Math.max(0, 1.0 - (diff * 8.0 / 255.0));
          brightFactor = (floor + (1 - floor) * val) * intensity;
          rgb = samplePaletteRgb(palette, normX, customRgb);
          break;
        }

        case "qmk_colorband_pinwheel_sat": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const time = rotDir * (now * 0.0004 * speed * 256);
          const wave = ((time - qmkAngle * 3) % 256 + 256) % 256 / 255.0;
          const baseRgb = samplePaletteRgb(palette, angleNorm, customRgb);
          brightFactor = 1.0 * intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, wave);
          break;
        }

        case "qmk_colorband_pinwheel_val": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const time = rotDir * (now * 0.0004 * speed * 256);
          const wave = ((time - qmkAngle * 3) % 256 + 256) % 256 / 255.0;
          brightFactor = (floor + (1 - floor) * wave) * intensity;
          rgb = samplePaletteRgb(palette, angleNorm, customRgb);
          break;
        }

        case "qmk_colorband_spiral_sat": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const time = rotDir * (now * 0.0004 * speed * 256);
          const wave = ((qmkDist + time - qmkAngle) % 256 + 256) % 256 / 255.0;
          const baseRgb = samplePaletteRgb(palette, angleNorm, customRgb);
          brightFactor = 1.0 * intensity;
          rgb = lerpColor([255, 255, 255], baseRgb, wave);
          break;
        }

        case "qmk_colorband_spiral_val": {
          const rotDir = (direction === "ccw" || direction === "right_to_left") ? -1 : 1;
          const time = rotDir * (now * 0.0004 * speed * 256);
          const wave = ((qmkDist + time - qmkAngle) % 256 + 256) % 256 / 255.0;
          brightFactor = (floor + (1 - floor) * wave) * intensity;
          rgb = samplePaletteRgb(palette, angleNorm, customRgb);
          break;
        }

        case "qmk_solid_color": {
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, 0.5, customRgb);
          break;
        }

        case "qmk_alphas_mods": {
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, isAlpha ? 0.15 : 0.65, customRgb);
          break;
        }

        default: {
          brightFactor = 1.0 * intensity;
          rgb = samplePaletteRgb(palette, 0.5, customRgb);
          break;
        }
      }

      return { rgb, brightFactor };
    }

    _applyKeyRgb(k, r, g, b, brightFactor = 1.0) {
      if (brightFactor <= 0.005) {
        k._curRgb = { r: 0, g: 0, b: 0 };
        const targets = k.els || [k.el];
        for (let t = 0; t < targets.length; t++) {
          const el = targets[t];
          if (el) {
            el.style.backgroundColor = "#070a12";
            el.style.borderColor = "rgba(255, 255, 255, 0.04)";
            el.style.boxShadow = "none";
            el.style.color = "rgba(255, 255, 255, 0.25)";
            el.style.textShadow = "none";
          }
        }
        return;
      }

      const clampedBright = Math.max(0, Math.min(1.5, brightFactor));
      const finalR = Math.max(0, Math.min(255, Math.round(r * clampedBright)));
      const finalG = Math.max(0, Math.min(255, Math.round(g * clampedBright)));
      const finalB = Math.max(0, Math.min(255, Math.round(b * clampedBright)));

      if (finalR === 0 && finalG === 0 && finalB === 0) {
        k._curRgb = { r: 0, g: 0, b: 0 };
        const targets = k.els || [k.el];
        for (let t = 0; t < targets.length; t++) {
          const el = targets[t];
          if (el) {
            el.style.backgroundColor = "#070a12";
            el.style.borderColor = "rgba(255, 255, 255, 0.04)";
            el.style.boxShadow = "none";
            el.style.color = "rgba(255, 255, 255, 0.25)";
            el.style.textShadow = "none";
          }
        }
        return;
      }

      k._curRgb = { r: finalR, g: finalG, b: finalB };

      const alpha = Math.max(0.2, Math.min(0.95, clampedBright));
      const bg = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
      const border = `rgba(${finalR}, ${finalG}, ${finalB}, ${Math.max(0.3, Math.min(0.85, clampedBright))})`;
      const shadow = `0 0 ${Math.round(4 + clampedBright * 10)}px rgba(${finalR}, ${finalG}, ${finalB}, ${Math.min(1.0, clampedBright)})`;

      const targets = k.els || [k.el];
      for (let t = 0; t < targets.length; t++) {
        const el = targets[t];
        if (!el) continue;
        el.style.backgroundColor = bg;
        el.style.borderColor = border;
        el.style.boxShadow = shadow;
        el.style.color = "#ffffff";
        el.style.textShadow = `0 0 6px rgba(${finalR}, ${finalG}, ${finalB}, 0.8)`;
      }
    }

    _applyDiffuserRgb(sd, r, g, b, brightFactor = 1.0) {
      if (!sd) return;
      if (brightFactor <= 0.005) {
        sd._curRgb = { r: 0, g: 0, b: 0 };
        const targets = sd.els || [sd.el];
        for (let t = 0; t < targets.length; t++) {
          const el = targets[t];
          if (el) {
            el.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            el.style.boxShadow = "none";
          }
        }
        return;
      }

      const clampedBright = Math.max(0, Math.min(1.5, brightFactor));
      const finalR = Math.max(0, Math.min(255, Math.round(r * clampedBright)));
      const finalG = Math.max(0, Math.min(255, Math.round(g * clampedBright)));
      const finalB = Math.max(0, Math.min(255, Math.round(b * clampedBright)));

      if (finalR === 0 && finalG === 0 && finalB === 0) {
        sd._curRgb = { r: 0, g: 0, b: 0 };
        const targets = sd.els || [sd.el];
        for (let t = 0; t < targets.length; t++) {
          const el = targets[t];
          if (el) {
            el.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            el.style.boxShadow = "none";
          }
        }
        return;
      }

      sd._curRgb = { r: finalR, g: finalG, b: finalB };

      const bg = `rgba(${finalR}, ${finalG}, ${finalB}, ${Math.max(0.2, Math.min(0.95, clampedBright))})`;
      const shadow = `0 0 ${Math.round(6 + clampedBright * 12)}px rgba(${finalR}, ${finalG}, ${finalB}, ${Math.min(1.0, clampedBright)})`;

      const targets = sd.els || [sd.el];
      for (let t = 0; t < targets.length; t++) {
        const el = targets[t];
        if (!el) continue;
        el.style.backgroundColor = bg;
        el.style.boxShadow = shadow;
      }
    }

    _applyLogoRgb(logoEl, r, g, b, brightFactor = 1.0) {
      if (!logoEl) return;
      if (brightFactor <= 0.005) {
        this._logoCurRgb = { r: 0, g: 0, b: 0 };
        const targets = Array.isArray(logoEl) ? logoEl : [logoEl];
        for (let t = 0; t < targets.length; t++) {
          const el = targets[t];
          if (el) {
            el.style.backgroundColor = "#070a12";
            el.style.borderColor = "rgba(255, 255, 255, 0.1)";
            el.style.boxShadow = "none";
          }
        }
        return;
      }

      const clampedBright = Math.max(0, Math.min(1.5, brightFactor));
      const finalR = Math.max(0, Math.min(255, Math.round(r * clampedBright)));
      const finalG = Math.max(0, Math.min(255, Math.round(g * clampedBright)));
      const finalB = Math.max(0, Math.min(255, Math.round(b * clampedBright)));

      if (finalR === 0 && finalG === 0 && finalB === 0) {
        this._logoCurRgb = { r: 0, g: 0, b: 0 };
        const targets = Array.isArray(logoEl) ? logoEl : [logoEl];
        for (let t = 0; t < targets.length; t++) {
          const el = targets[t];
          if (el) {
            el.style.backgroundColor = "#070a12";
            el.style.borderColor = "rgba(255, 255, 255, 0.1)";
            el.style.boxShadow = "none";
          }
        }
        return;
      }

      this._logoCurRgb = { r: finalR, g: finalG, b: finalB };

      const bg = `rgba(${finalR}, ${finalG}, ${finalB}, 0.95)`;
      const shadow = `0 0 14px rgba(${finalR}, ${finalG}, ${finalB}, 0.95), inset 0 0 4px rgba(255, 255, 255, 0.5)`;
      const targets = Array.isArray(logoEl) ? logoEl : [logoEl];

      for (let t = 0; t < targets.length; t++) {
        const el = targets[t];
        if (!el) continue;
        el.style.backgroundColor = bg;
        el.style.borderColor = `rgba(255, 255, 255, 0.6)`;
        el.style.boxShadow = shadow;
      }
    }

    _hexToRgbList(hex) {
      const c = hex.replace("#", "");
      return [
        parseInt(c.substring(0, 2), 16) || 0,
        parseInt(c.substring(2, 4), 16) || 0,
        parseInt(c.substring(4, 6), 16) || 0
      ];
    }

    _hsvToRgbList(h, s = 255, v = 255) {
      return hsvToRgb(h, s, v);
    }

    _computeSidelightRgb(side, index, totalCount, now, config) {
      const isCustom = !!config.sidelightCustomEnable;
      const normY = (index + 0.5) / (totalCount || 1);
      const maxX = this.lighting?.maxX || 22.5;
      const maxY = this.lighting?.maxY || 5.5;
      const posX = side === 'left' ? 0 : maxX;
      const posY = normY * maxY;

      if (!isCustom || config.sidelightMode === 'followMain') {
        const activeTab = this.activeSubTab;
        if (activeTab === 'audio') {
          const palette = config.audioColorMode || 'rainbow';
          const direction = config.audioDirection || 'bottom_to_top';
          const speed = config.audioSpeed || 1.0;
          const intensity = config.audioIntensity || 1.0;
          const floor = config.audioFloor || 0.15;
          const customRgb = hexToRgb(config.audioSingleColor || '#00ffff');
          const dirCoord = getDirectedCoordinate(posX, posY, direction, maxX, maxY);

          const phase = (dirCoord.primary - now * 0.0006 * speed + 1000) % 1.0;
          const bandVal = (this.frequencyBands[Math.min(15, Math.floor(normY * 16))] || 0) / 255;
          const bright = (floor + (1 - floor) * bandVal) * intensity;
          const rgb = samplePaletteRgb(palette, phase, customRgb);
          return {
            r: Math.min(255, Math.round(rgb[0] * bright)),
            g: Math.min(255, Math.round(rgb[1] * bright)),
            b: Math.min(255, Math.round(rgb[2] * bright))
          };
        } else {
          const palette = config.softwarePalette || 'rainbow';
          const direction = config.softwareDirection || 'left_to_right';
          const speed = config.softwareSpeed || 1.0;
          const intensity = config.softwareIntensity || 1.0;
          const floor = config.softwareFloor || 0.10;
          const customRgb = hexToRgb(config.softwareSingleColor || '#00ffff');
          const dirCoord = getDirectedCoordinate(posX, posY, direction, maxX, maxY);

          const phase = (dirCoord.primary - now * 0.0008 * speed + 1000) % 1.0;
          const waveSin = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
          const bright = (floor + (1 - floor) * waveSin) * intensity;
          const rgb = samplePaletteRgb(palette, phase, customRgb);
          return {
            r: Math.min(255, Math.round(rgb[0] * bright)),
            g: Math.min(255, Math.round(rgb[1] * bright)),
            b: Math.min(255, Math.round(rgb[2] * bright))
          };
        }
      }

      const mode = config.sidelightMode || 'followMain';
      const palette = config.sidelightPalette || 'rainbow';
      const speed = config.sidelightSpeed || 1.0;
      const intensity = config.sidelightIntensity || 1.0;
      const customRgb = hexToRgb(config.sidelightColor || '#00ffff');

      if (mode === 'off') {
        return { r: 0, g: 0, b: 0 };
      }

      if (mode === 'solidAccent') {
        return {
          r: Math.min(255, Math.round(customRgb[0] * intensity)),
          g: Math.min(255, Math.round(customRgb[1] * intensity)),
          b: Math.min(255, Math.round(customRgb[2] * intensity))
        };
      }

      if (mode === 'vuMeterStereo') {
        const band = side === 'left' ? this.frequencyBands[2] : this.frequencyBands[13];
        const threshold = (1 - normY) * 255;
        const isLit = (band || 0) >= threshold;
        const bright = isLit ? intensity : 0.1 * intensity;
        const rgb = samplePaletteRgb(palette, normY, customRgb);
        return {
          r: Math.min(255, Math.round(rgb[0] * bright)),
          g: Math.min(255, Math.round(rgb[1] * bright)),
          b: Math.min(255, Math.round(rgb[2] * bright))
        };
      }

      if (mode === 'waveFlow') {
        const phase = (normY - now * 0.001 * speed + 1000) % 1.0;
        const rgb = samplePaletteRgb(palette, phase, customRgb);
        return {
          r: Math.min(255, Math.round(rgb[0] * intensity)),
          g: Math.min(255, Math.round(rgb[1] * intensity)),
          b: Math.min(255, Math.round(rgb[2] * intensity))
        };
      }

      if (mode === 'waveCenter') {
        const distFromCenter = Math.abs(normY - 0.5) * 2;
        const phase = (distFromCenter - now * 0.0012 * speed + 1000) % 1.0;
        const rgb = samplePaletteRgb(palette, phase, customRgb);
        return {
          r: Math.min(255, Math.round(rgb[0] * intensity)),
          g: Math.min(255, Math.round(rgb[1] * intensity)),
          b: Math.min(255, Math.round(rgb[2] * intensity))
        };
      }

      if (mode === 'rhythmicPulse') {
        const pulseNorm = Math.max(0.1, this.beatDecay / 255);
        const phase = (now * 0.0005 * speed) % 1.0;
        const rgb = samplePaletteRgb(palette, phase, customRgb);
        return {
          r: Math.min(255, Math.round(rgb[0] * pulseNorm * intensity)),
          g: Math.min(255, Math.round(rgb[1] * pulseNorm * intensity)),
          b: Math.min(255, Math.round(rgb[2] * pulseNorm * intensity))
        };
      }

      const phase = (normY - now * 0.0008 * speed + 1000) % 1.0;
      const rgb = samplePaletteRgb(palette, phase, customRgb);
      return {
        r: Math.min(255, Math.round(rgb[0] * intensity)),
        g: Math.min(255, Math.round(rgb[1] * intensity)),
        b: Math.min(255, Math.round(rgb[2] * intensity))
      };
    }

    async _streamToHardware(now) {
      if (!this.protocol || !this.protocol.isConnected || !this.protocol.device) return;
      if (this._isHardwareStreaming) return;
      if (now - this._lastHardwareStreamTime < 32) return; // ~30 FPS rock-solid hardware stream with atomic double-buffering

      this._lastHardwareStreamTime = now;
      this._isHardwareStreaming = true;

      try {
        const presetId = window.gDeviceManager?.activeDescriptor?.id || 'gmmk3-100-ansi';
        const hwProfile = HARDWARE_LIGHTING_PROFILES[presetId] || { totalLeds: 125 };
        const totalLeds = hwProfile.totalLeds;
        const hwBuffer = new Uint8Array(totalLeds * 3);

        const keys = this.lighting?.visualizerKeys || [];

        // 1. Physical matrix keys
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (k.isKnob) continue;

          let targetLed = undefined;
          if (k.isLogo && hwProfile.logoLedIndex !== undefined) {
            targetLed = hwProfile.logoLedIndex;
          } else if (k.matrix) {
            targetLed = getHardwareLedIndex(presetId, k.matrix[0], k.matrix[1]);
          }

          if (targetLed !== undefined && targetLed < totalLeds) {
            const rgb = k._curRgb || { r: 0, g: 0, b: 0 };
            const offset = targetLed * 3;
            hwBuffer[offset + 0] = rgb.r;
            hwBuffer[offset + 1] = rgb.g;
            hwBuffer[offset + 2] = rgb.b;
          }
        }

        // 2. Left and Right Sidelights
        if (hwProfile.sidelightRange) {
          const config = this.config;
          const leftRange = hwProfile.sidelightRange.left;
          const rightRange = hwProfile.sidelightRange.right;
          const leftCount = leftRange[1] - leftRange[0] + 1;
          const rightCount = rightRange[1] - rightRange[0] + 1;

          for (let i = 0; i < leftCount; i++) {
            const ledIndex = leftRange[0] + i;
            if (ledIndex < totalLeds) {
              const sideRgb = this._computeSidelightRgb('left', i, leftCount, now, config);
              const offset = ledIndex * 3;
              hwBuffer[offset + 0] = sideRgb.r;
              hwBuffer[offset + 1] = sideRgb.g;
              hwBuffer[offset + 2] = sideRgb.b;
            }
          }

          for (let i = 0; i < rightCount; i++) {
            const ledIndex = rightRange[0] + i;
            if (ledIndex < totalLeds) {
              const sideRgb = this._computeSidelightRgb('right', i, rightCount, now, config);
              const offset = ledIndex * 3;
              hwBuffer[offset + 0] = sideRgb.r;
              hwBuffer[offset + 1] = sideRgb.g;
              hwBuffer[offset + 2] = sideRgb.b;
            }
          }
        }

        // 3. Glorious Logo Badge LED
        if (hwProfile.logoLedIndex !== undefined && hwProfile.logoLedIndex < totalLeds) {
          const logoKey = keys.find(k => k.isLogo);
          const logoRgb = this._logoCurRgb || logoKey?._curRgb;
          if (logoRgb) {
            const offset = hwProfile.logoLedIndex * 3;
            hwBuffer[offset + 0] = logoRgb.r;
            hwBuffer[offset + 1] = logoRgb.g;
            hwBuffer[offset + 2] = logoRgb.b;
          }
        }

        // Stream to firmware in 9-LED blocks (27 RGB bytes per 32-byte VIA packet)
        const CHUNK_LEDS = 9;
        for (let startLed = 0; startLed < totalLeds; startLed += CHUNK_LEDS) {
          const count = Math.min(CHUNK_LEDS, totalLeds - startLed);
          const isLast = (startLed + count >= totalLeds);
          const chunk = Array.from(hwBuffer.slice(startLed * 3, (startLed + count) * 3));
          const packetStartIdx = isLast ? (startLed | 0x80) : startLed;
          await this.protocol.sendDirectLightingBlock(packetStartIdx, chunk);
        }
      } catch (e) {
        // Suppress transient frame dropping
      } finally {
        this._isHardwareStreaming = false;
      }
    }

    _bindUI() {
      // 1. Sub-Tab Switcher
      document.querySelectorAll(".studio-lighting-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.switchSubTab(btn.dataset.tab);
        });
      });

      // 2. Master Toggle Button
      const btnToggle = document.getElementById("btnStudioLightingToggle");
      if (btnToggle) {
        btnToggle.addEventListener("click", () => {
          if (this.isRunning) {
            this.stop();
          } else {
            this.start();
          }
        });
      }

      // 3. Audio Controls
      const selSource = document.getElementById("audioSourceSelect");
      if (selSource) {
        selSource.addEventListener("change", async (e) => {
          this.config.sourceId = e.target.value;
          this._saveConfig();
          if (this.isRunning && this.activeTab === "audio") {
            this._stopAudioStream();
            await this._startAudioStream();
          }
        });
      }

      const btnRefresh = document.getElementById("btnRefreshAudioSources");
      if (btnRefresh) {
        btnRefresh.addEventListener("click", async () => {
          try {
            const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
            tmp.getTracks().forEach((t) => t.stop());
          } catch (e) {}
          await this.enumerateAudioSources();
          if (window.gUI) {
            window.gUI.showToast(window.i18n ? window.i18n.t("toastAudioSourcesRefreshed") : "Audio sources refreshed", "info");
          }
        });
      }

      const selAudioMode = document.getElementById("audioModeSelect");
      if (selAudioMode) {
        selAudioMode.addEventListener("change", (e) => {
          this.config.audioMode = e.target.value;
          this._saveConfig();
        });
      }

      const selColorMode = document.getElementById("audioColorModeSelect");
      const audioGradWrap = document.getElementById("audioGradientEditorGroup");
      if (selColorMode) {
        selColorMode.addEventListener("change", (e) => {
          this.config.audioColorMode = e.target.value;
          const colorWrap = document.getElementById("audioSingleColorGroup");
          if (colorWrap) {
            colorWrap.style.display = e.target.value === "singleColor" ? "block" : "none";
          }
          if (audioGradWrap) {
            audioGradWrap.style.display = e.target.value === "customGradient" ? "block" : "none";
          }
          this._saveConfig();
        });
      }

      if (document.getElementById("audioGradientEditorContainer") && window.GradientEditor) {
        this.audioGradientEditor = new window.GradientEditor("audioGradientEditorContainer", {
          stops: this.config.audioGradientStops || [
            { pos: 0, r: 0, g: 255, b: 255 },
            { pos: 128, r: 255, g: 0, b: 128 },
            { pos: 255, r: 255, g: 255, b: 0 }
          ],
          onChange: (stops) => {
            this.config.audioGradientStops = stops;
            this._saveConfig();
          }
        });
      }

      const pickerAudioColor = document.getElementById("audioColorPicker");
      if (pickerAudioColor) {
        const onAudioColor = (e) => {
          this.config.audioCustomHex = e.target.value;
          this._saveConfig();
        };
        pickerAudioColor.addEventListener("input", onAudioColor);
        pickerAudioColor.addEventListener("change", onAudioColor);
      }

      const selAudioDir = document.getElementById("audioDirectionSelect");
      if (selAudioDir) {
        selAudioDir.addEventListener("change", (e) => {
          this.config.audioDirection = e.target.value;
          this._saveConfig();
        });
      }

      const sliderAudioSens = document.getElementById("audioSensitivitySlider");
      if (sliderAudioSens) {
        sliderAudioSens.addEventListener("input", (e) => {
          this.config.sensitivity = parseFloat(e.target.value);
          const lbl = document.getElementById("audioSensVal");
          if (lbl) lbl.textContent = `${e.target.value}x`;
          this._saveConfig();
        });
      }

      const sliderAudioSpeed = document.getElementById("audioSpeedSlider");
      if (sliderAudioSpeed) {
        sliderAudioSpeed.addEventListener("input", (e) => {
          this.config.audioSpeed = parseFloat(e.target.value);
          const lbl = document.getElementById("audioSpeedVal");
          if (lbl) lbl.textContent = `${e.target.value}x`;
          this._saveConfig();
        });
      }

      const sliderAudioIntensity = document.getElementById("audioIntensitySlider");
      if (sliderAudioIntensity) {
        sliderAudioIntensity.addEventListener("input", (e) => {
          this.config.audioIntensity = parseFloat(e.target.value);
          const lbl = document.getElementById("audioIntensityVal");
          if (lbl) lbl.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
          this._saveConfig();
        });
      }

      const sliderAudioSmoothing = document.getElementById("audioSmoothingSlider");
      if (sliderAudioSmoothing) {
        sliderAudioSmoothing.addEventListener("input", (e) => {
          this.config.smoothing = parseFloat(e.target.value);
          if (this.analyser) {
            this.analyser.smoothingTimeConstant = this.config.smoothing;
          }
          const lbl = document.getElementById("audioSmoothingVal");
          if (lbl) lbl.textContent = String(e.target.value);
          this._saveConfig();
        });
      }

      const sliderAudioFloor = document.getElementById("audioFloorSlider");
      if (sliderAudioFloor) {
        sliderAudioFloor.addEventListener("input", (e) => {
          this.config.audioFloor = parseFloat(e.target.value);
          const lbl = document.getElementById("audioFloorVal");
          if (lbl) lbl.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
          this._saveConfig();
        });
      }

      // 4. PC Software Animation Controls
      const selEffect = document.getElementById("softwareEffectSelect");
      if (selEffect) {
        selEffect.addEventListener("change", (e) => {
          this.config.effectPreset = e.target.value;
          this._updateDirectionOptionsForEffect(e.target.value);
          this._saveConfig();
        });
      }

      const selSoftPalette = document.getElementById("softwarePaletteSelect");
      const softGradWrap = document.getElementById("softwareGradientEditorGroup");
      if (selSoftPalette) {
        selSoftPalette.addEventListener("change", (e) => {
          this.config.softwarePalette = e.target.value;
          const colorWrap = document.getElementById("softwareSingleColorGroup");
          if (colorWrap) {
            colorWrap.style.display = e.target.value === "singleColor" ? "block" : "none";
          }
          if (softGradWrap) {
            softGradWrap.style.display = e.target.value === "customGradient" ? "block" : "none";
          }
          this._saveConfig();
        });
      }

      if (document.getElementById("softwareGradientEditorContainer") && window.GradientEditor) {
        this.softGradientEditor = new window.GradientEditor("softwareGradientEditorContainer", {
          stops: this.config.softwareGradientStops || [
            { pos: 0, r: 0, g: 255, b: 255 },
            { pos: 128, r: 255, g: 0, b: 128 },
            { pos: 255, r: 255, g: 255, b: 0 }
          ],
          onChange: (stops) => {
            this.config.softwareGradientStops = stops;
            this._saveConfig();
          }
        });
      }

      const pickerSoftColor = document.getElementById("softwareColorPicker");
      if (pickerSoftColor) {
        const onSoftColor = (e) => {
          this.config.softwareCustomHex = e.target.value;
          this._saveConfig();
        };
        pickerSoftColor.addEventListener("input", onSoftColor);
        pickerSoftColor.addEventListener("change", onSoftColor);
      }

      const selSoftDir = document.getElementById("softwareDirectionSelect");
      if (selSoftDir) {
        selSoftDir.addEventListener("change", (e) => {
          this.config.softwareDirection = e.target.value;
          this._saveConfig();
        });
      }

      const sliderSpeed = document.getElementById("softwareEffectSpeedSlider");
      if (sliderSpeed) {
        sliderSpeed.addEventListener("input", (e) => {
          this.config.effectSpeed = parseFloat(e.target.value);
          const lbl = document.getElementById("softwareEffectSpeedVal");
          if (lbl) lbl.textContent = `${e.target.value}x`;
          this._saveConfig();
        });
      }

      const sliderIntensity = document.getElementById("softwareEffectIntensitySlider");
      if (sliderIntensity) {
        sliderIntensity.addEventListener("input", (e) => {
          this.config.effectIntensity = parseFloat(e.target.value);
          const lbl = document.getElementById("softwareEffectIntensityVal");
          if (lbl) lbl.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
          this._saveConfig();
        });
      }

      const sliderSoftFloor = document.getElementById("softwareEffectFloorSlider");
      if (sliderSoftFloor) {
        sliderSoftFloor.addEventListener("input", (e) => {
          this.config.softwareFloor = parseFloat(e.target.value);
          const lbl = document.getElementById("softwareFloorVal");
          if (lbl) lbl.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
          this._saveConfig();
        });
      }

      // 5. Studio Sidelights (Underglow Lightbars) Controls
      const chkStudioSide = document.getElementById("chkStudioSidelightCustomEnable");
      if (chkStudioSide) {
        chkStudioSide.addEventListener("change", (e) => {
          this.config.sidelightCustomEnable = e.target.checked;
          const wrap = document.getElementById("studioSidelightControlsContainer");
          if (wrap) wrap.style.display = e.target.checked ? "block" : "none";
          this._saveConfig();
        });
      }

      const selStudioSideMode = document.getElementById("studioSidelightModeSelect");
      if (selStudioSideMode) {
        selStudioSideMode.addEventListener("change", (e) => {
          this.config.sidelightMode = e.target.value;
          const sideColorGrp = document.getElementById("studioSidelightColorGroup");
          if (sideColorGrp) {
            sideColorGrp.style.display = (this.config.sidelightPalette === "singleColor" || e.target.value === "solidAccent") ? "block" : "none";
          }
          this._saveConfig();
        });
      }

      const selStudioSidePalette = document.getElementById("studioSidelightPaletteSelect");
      if (selStudioSidePalette) {
        selStudioSidePalette.addEventListener("change", (e) => {
          this.config.sidelightPalette = e.target.value;
          const sideColorGrp = document.getElementById("studioSidelightColorGroup");
          if (sideColorGrp) {
            sideColorGrp.style.display = (e.target.value === "singleColor" || this.config.sidelightMode === "solidAccent") ? "block" : "none";
          }
          this._saveConfig();
        });
      }

      const pickerStudioSide = document.getElementById("studioSidelightColorPicker");
      if (pickerStudioSide) {
        const onSideColor = (e) => {
          this.config.sidelightCustomHex = e.target.value;
          this._saveConfig();
        };
        pickerStudioSide.addEventListener("input", onSideColor);
        pickerStudioSide.addEventListener("change", onSideColor);
      }

      const sliderStudioSideSpeed = document.getElementById("studioSidelightSpeedSlider");
      if (sliderStudioSideSpeed) {
        sliderStudioSideSpeed.addEventListener("input", (e) => {
          this.config.sidelightSpeed = parseFloat(e.target.value);
          const lbl = document.getElementById("studioSidelightSpeedVal");
          if (lbl) lbl.textContent = `${e.target.value}x`;
          this._saveConfig();
        });
      }

      const sliderStudioSideInt = document.getElementById("studioSidelightIntensitySlider");
      if (sliderStudioSideInt) {
        sliderStudioSideInt.addEventListener("input", (e) => {
          this.config.sidelightIntensity = parseFloat(e.target.value);
          const lbl = document.getElementById("studioSidelightIntensityVal");
          if (lbl) lbl.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
          this._saveConfig();
        });
      }
    }

    _saveConfig() {
      const cfg = {
        enabled: this.config.enabled,
        activeTab: this.activeTab,
        sourceId: this.config.sourceId,
        audioMode: this.config.audioMode,
        audioColorMode: this.config.audioColorMode,
        audioDirection: this.config.audioDirection,
        audioCustomHex: this.config.audioCustomHex,
        sensitivity: this.config.sensitivity,
        audioSpeed: this.config.audioSpeed,
        audioIntensity: this.config.audioIntensity,
        smoothing: this.config.smoothing,
        audioFloor: this.config.audioFloor,
        effectPreset: this.config.effectPreset,
        softwarePalette: this.config.softwarePalette,
        softwareDirection: this.config.softwareDirection,
        softwareCustomHex: this.config.softwareCustomHex,
        effectSpeed: this.config.effectSpeed,
        effectIntensity: this.config.effectIntensity,
        softwareFloor: this.config.softwareFloor,
        sidelightCustomEnable: this.config.sidelightCustomEnable,
        sidelightMode: this.config.sidelightMode,
        sidelightPalette: this.config.sidelightPalette,
        sidelightCustomHex: this.config.sidelightCustomHex,
        sidelightSpeed: this.config.sidelightSpeed,
        sidelightIntensity: this.config.sidelightIntensity
      };

      localStorage.setItem("luxqmk_studio_lighting_config", JSON.stringify(cfg));
      localStorage.setItem("luxqmk_audio_source", this.config.sourceId);

      if (window.electronAPI && window.electronAPI.saveUserConfig) {
        window.electronAPI.saveUserConfig({ studioLighting: cfg });
      }
    }

    async _loadConfig() {
      let cfg = null;
      if (window.electronAPI && window.electronAPI.loadUserConfig) {
        try {
          const userCfg = await window.electronAPI.loadUserConfig();
          if (userCfg && userCfg.studioLighting) {
            cfg = userCfg.studioLighting;
          }
        } catch (e) {}
      }

      if (!cfg) {
        try {
          const raw = localStorage.getItem("luxqmk_studio_lighting_config");
          if (raw) cfg = JSON.parse(raw);
        } catch (e) {}
      }

      if (cfg) {
        if (typeof cfg.enabled === "boolean") this.config.enabled = cfg.enabled;
        if (cfg.activeTab) this.activeTab = cfg.activeTab;
        if (cfg.sourceId) this.config.sourceId = cfg.sourceId;
        if (cfg.audioMode) this.config.audioMode = cfg.audioMode;
        if (cfg.audioColorMode) this.config.audioColorMode = cfg.audioColorMode;
        if (cfg.audioDirection) this.config.audioDirection = cfg.audioDirection;
        if (cfg.audioCustomHex) this.config.audioCustomHex = cfg.audioCustomHex;
        if (typeof cfg.sensitivity === "number") this.config.sensitivity = cfg.sensitivity;
        if (typeof cfg.audioSpeed === "number") this.config.audioSpeed = cfg.audioSpeed;
        if (typeof cfg.audioIntensity === "number") this.config.audioIntensity = cfg.audioIntensity;
        if (typeof cfg.smoothing === "number") this.config.smoothing = cfg.smoothing;
        if (typeof cfg.audioFloor === "number") this.config.audioFloor = cfg.audioFloor;
        if (cfg.effectPreset) this.config.effectPreset = cfg.effectPreset;
        if (cfg.softwarePalette) this.config.softwarePalette = cfg.softwarePalette;
        if (cfg.softwareDirection) this.config.softwareDirection = cfg.softwareDirection;
        if (cfg.softwareCustomHex) this.config.softwareCustomHex = cfg.softwareCustomHex;
        if (typeof cfg.effectSpeed === "number") this.config.effectSpeed = cfg.effectSpeed;
        if (typeof cfg.effectIntensity === "number") this.config.effectIntensity = cfg.effectIntensity;
        if (typeof cfg.softwareFloor === "number") this.config.softwareFloor = cfg.softwareFloor;
        if (typeof cfg.sidelightCustomEnable === "boolean") this.config.sidelightCustomEnable = cfg.sidelightCustomEnable;
        if (cfg.sidelightMode) this.config.sidelightMode = cfg.sidelightMode;
        if (cfg.sidelightPalette) this.config.sidelightPalette = cfg.sidelightPalette;
        if (cfg.sidelightCustomHex) this.config.sidelightCustomHex = cfg.sidelightCustomHex;
        if (typeof cfg.sidelightSpeed === "number") this.config.sidelightSpeed = cfg.sidelightSpeed;
        if (typeof cfg.sidelightIntensity === "number") this.config.sidelightIntensity = cfg.sidelightIntensity;
      }
    }

    _updateUI() {
      const btnToggle = document.getElementById("btnStudioLightingToggle");
      const badge = document.getElementById("studioLightingStatusBadge");

      if (btnToggle) {
        const playSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        const stopSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';
        const textKey = this.isRunning ? "btnStopSoftwareFx" : "btnStartSoftwareFx";
        const labelText = window.i18n ? window.i18n.t(textKey) : (this.isRunning ? "Stop Studio Lighting" : "Start Studio Lighting");
        btnToggle.innerHTML = `${this.isRunning ? stopSvg : playSvg} <span data-i18n="${textKey}">${labelText}</span>`;
        btnToggle.className = this.isRunning ? "btn btn-danger" : "btn btn-primary";
      }

      if (badge) {
        badge.dataset.i18n = this.isRunning ? "lblSoftwareActiveBadge" : "lblSoftwareStoppedBadge";
        const activeText = window.i18n ? window.i18n.t("lblSoftwareActiveBadge") : "Active (Running 60 FPS)";
        const stoppedText = window.i18n ? window.i18n.t("lblSoftwareStoppedBadge") : "Stopped";
        badge.textContent = this.isRunning ? activeText : stoppedText;
        badge.className = this.isRunning ? "badge-pill badge-success" : "badge-pill";
      }

      document.querySelectorAll(".studio-lighting-tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === this.activeTab);
      });
      const audioPane = document.getElementById("pane-studio-audio");
      const fxPane = document.getElementById("pane-studio-effects");
      if (audioPane) audioPane.style.display = this.activeTab === "audio" ? "block" : "none";
      if (fxPane) fxPane.style.display = this.activeTab === "effects" ? "block" : "none";
    }

    updateUI() {
      this._updateUI();
    }
  }

  function scaleBetween(unscaledNum, minAllowed, maxAllowed, min = 0, max = 1) {
    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
  }

  window.StudioLightingController = StudioLightingController;
})();
