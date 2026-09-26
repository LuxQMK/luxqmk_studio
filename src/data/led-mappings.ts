/**
 * LuxQMK Studio - Hardware LED Matrix & Physical Driver Index Mappings
 * Maps keyboard matrix positions [row, col] to physical MCU LED driver indices.
 * Provides 1:1 parity with QMK firmware g_led_config.matrix_co definitions.
 */

export interface HardwareLightingProfile {
  totalLeds: number;
  sidelightRange?: {
    left: [number, number];  // [startLedIndex, endLedIndex] (inclusive)
    right: [number, number]; // [startLedIndex, endLedIndex] (inclusive)
  };
  logoLedIndex?: number;
  winLockLedIndex?: number;
}

export const MATRIX_CO_TABLES: Record<string, number[][]> = {
  // Glorious GMMK 3 100% ANSI (14 Rows x 8 Cols)
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

  // Glorious GMMK 3 75% ANSI (14 Rows x 8 Cols)
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

  // Glorious GMMK 3 65% ANSI (14 Rows x 8 Cols)
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

  // Glorious GMMK 2 96% ANSI (14 Rows x 8 Cols)
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

  // Glorious GMMK 2 65% ANSI (14 Rows x 8 Cols)
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

export const HARDWARE_LIGHTING_PROFILES: Record<string, HardwareLightingProfile> = {
  'gmmk3-100-ansi': {
    totalLeds: 125,
    sidelightRange: { left: [104, 113], right: [114, 123] },
    logoLedIndex: 124,
    winLockLedIndex: 92
  },
  'gmmk3-75-ansi': {
    totalLeds: 101,
    sidelightRange: { left: [80, 89], right: [90, 99] },
    logoLedIndex: 100,
    winLockLedIndex: 72
  },
  'gmmk3-65-ansi': {
    totalLeds: 85,
    sidelightRange: { left: [65, 74], right: [75, 84] },
    winLockLedIndex: 58
  },
  'gmmk2-96-ansi': {
    totalLeds: 119,
    sidelightRange: { left: [99, 108], right: [109, 118] },
    winLockLedIndex: 88
  },
  'gmmk2-65-ansi': {
    totalLeds: 87,
    sidelightRange: { left: [67, 76], right: [77, 86] },
    winLockLedIndex: 59
  },
  'generic-tkl': {
    totalLeds: 87
  },
  'generic-60': {
    totalLeds: 61
  },
  'generic-via': {
    totalLeds: 104
  }
};

/**
 * Resolves physical MCU LED driver index for a given layout matrix position [row, col].
 */
export function getHardwareLedIndex(presetId: string, row?: number, col?: number): number | undefined {
  if (row === undefined || col === undefined) return undefined;
  const table = MATRIX_CO_TABLES[presetId];
  if (table && table[row] && table[row][col] !== undefined && table[row][col] !== 255 && table[row][col] !== -1) {
    return table[row][col];
  }
  return undefined;
}
