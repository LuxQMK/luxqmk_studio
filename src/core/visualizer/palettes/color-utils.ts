/**
 * LuxQMK Studio - Color Mathematics Utilities (HSV, Hex, RGB Lerp)
 */

export function hsvToRgb(hByte: number, sByte: number = 255, vByte: number = 255): [number, number, number] {
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

export function hexToRgbList(hex: string): [number, number, number] {
  let c = (hex || '#ffffff').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  return [
    parseInt(c.substring(0, 2), 16) || 0,
    parseInt(c.substring(2, 4), 16) || 0,
    parseInt(c.substring(4, 6), 16) || 0
  ];
}

export function lerpColor(rgb1: [number, number, number], rgb2: [number, number, number], t: number): [number, number, number] {
  const clampedT = Math.max(0, Math.min(1, t));
  return [
    Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * clampedT),
    Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * clampedT),
    Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * clampedT),
  ];
}
