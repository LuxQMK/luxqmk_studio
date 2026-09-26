import React from 'react';
import { useLightingStore } from '../store/useLightingStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useUIStore } from '../store/useUIStore';
import { hexToHs, hsvToRgb } from './useLightingVisualizer';

export function useLogoLedStyle(): React.CSSProperties {
  const { logoLocks, backlight } = useLightingStore();
  const hostLeds = useDeviceStore((s) => s.hostLeds);
  const { lightingSubTab, activeView } = useUIStore();

  const locks = hostLeds || { caps: false, num: false, scroll: false };

  // Compute active RGB
  const mode = logoLocks?.mode ?? 1; // 0=RGB, 1=Lock Indicator (RGB idle), 2=Lock Indicator (Off idle)
  const lockSum = (locks.caps ? 1 : 0) | (locks.num ? 2 : 0) | (locks.scroll ? 4 : 0);
  const isLogoSubTab = activeView === 'lighting' && lightingSubTab === 'logo';

  const brightness = Math.max(0.1, (backlight?.brightness ?? 255) / 255);

  let rgb: { r: number; g: number; b: number } | null = null;

  if (mode === 0) {
    // Mode 0: Main RGB matrix color
    const [bh, bs] = hexToHs(backlight?.color || '#00ffff');
    rgb = hsvToRgb(bh, bs, Math.round(255 * brightness));
  } else if (mode === 1) {
    // Mode 1: Lock Indicator with RGB idle
    if (lockSum > 0 || isLogoSubTab) {
      const lockKeys = [
        'colorCaps',
        'colorCaps',
        'colorNum',
        'colorCapsNum',
        'colorScroll',
        'colorCapsScroll',
        'colorNumScroll',
        'colorAll',
      ];
      const lk = lockKeys[lockSum || 1] as keyof typeof logoLocks;
      const colHex = (logoLocks as any)[lk] || '#001eff';
      const [lh, ls] = hexToHs(colHex);
      rgb = hsvToRgb(lh, ls, Math.max(140, Math.round(255 * brightness)));
    } else {
      const [bh, bs] = hexToHs(backlight?.color || '#00ffff');
      rgb = hsvToRgb(bh, bs, Math.round(255 * brightness));
    }
  } else if (mode === 2) {
    // Mode 2: Lock Indicator with Off idle
    if (lockSum > 0 || isLogoSubTab) {
      const lockKeys = [
        'colorCaps',
        'colorCaps',
        'colorNum',
        'colorCapsNum',
        'colorScroll',
        'colorCapsScroll',
        'colorNumScroll',
        'colorAll',
      ];
      const lk = lockKeys[lockSum || 1] as keyof typeof logoLocks;
      const colHex = (logoLocks as any)[lk] || '#001eff';
      const [lh, ls] = hexToHs(colHex);
      rgb = hsvToRgb(lh, ls, Math.max(140, Math.round(255 * brightness)));
    } else {
      rgb = null;
    }
  }

  if (!rgb || (rgb.r === 0 && rgb.g === 0 && rgb.b === 0)) {
    return {
      backgroundColor: 'rgba(15, 20, 32, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.5)',
    };
  }

  return {
    backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    borderColor: `rgba(${Math.min(255, rgb.r + 60)}, ${Math.min(255, rgb.g + 60)}, ${Math.min(255, rgb.b + 60)}, 0.9)`,
    boxShadow: `0 0 14px rgb(${rgb.r}, ${rgb.g}, ${rgb.b}), 0 0 26px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.6)`,
  };
}
