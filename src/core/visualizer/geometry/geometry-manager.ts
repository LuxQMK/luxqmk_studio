/**
 * LuxQMK Studio - Keycap Geometry and Physical Matrix Anchor Manager
 */

import { KeyGeometry } from '../types';
import { KeyLayoutItem } from '../../../types/keyboard';
import { getLayoutForPreset } from '../../../data/layouts';
import { useKeymapStore } from '../../../store/useKeymapStore';
import { HARDWARE_LIGHTING_PROFILES, getHardwareLedIndex } from '../../../data/led-mappings';

export class GeometryManager {
  private cachedKeys: KeyGeometry[] = [];
  private cachedLayoutId: string = '';
  public maxX: number = 22.5;
  public maxY: number = 5.5;
  public centerAnchorX: number = 11.0;
  public centerAnchorY: number = 2.75;
  public centerQmkX: number = 109;
  public centerQmkY: number = 27;
  public maxDist: number = 125;

  public rebuildKeyGeometry(presetId: string): void {
    const layout = getLayoutForPreset(presetId);
    let maxX = 0;
    let maxY = 0;
    layout.forEach((k: KeyLayoutItem) => {
      const rX = k.x + (k.w || 1);
      const rY = k.y + (k.h || 1);
      if (rX > maxX) maxX = rX;
      if (rY > maxY) maxY = rY;
    });

    this.maxX = maxX || 22.5;
    this.maxY = maxY || 5.5;

    // Standard Anchor: Key P center (QMK coordinate standard point (109, 27))
    const keyP = layout.find((k: KeyLayoutItem) => k.id === 'P' || k.label === 'P');
    let centerQmkX = 109;
    let centerQmkY = 27;
    let centerAnchorX = 11.0;
    let centerAnchorY = 2.75;

    if (keyP) {
      const pKeyW = keyP.w || 1;
      const pKeyH = keyP.h || 1;
      centerAnchorX = keyP.x + pKeyW / 2;
      centerAnchorY = keyP.y + pKeyH / 2;
      centerQmkX = (keyP as any).qmkPoint ? (keyP as any).qmkPoint[0] : Math.round((centerAnchorX / this.maxX) * 224);
      centerQmkY = (keyP as any).qmkPoint ? (keyP as any).qmkPoint[1] : Math.round((centerAnchorY / this.maxY) * 64);
    }

    this.centerAnchorX = centerAnchorX;
    this.centerAnchorY = centerAnchorY;
    this.centerQmkX = centerQmkX;
    this.centerQmkY = centerQmkY;

    this.cachedKeys = layout.map((k: KeyLayoutItem) => {
      const w = k.w || 1;
      const h = k.h || 1;
      const centerX = k.x + w / 2;
      const centerY = k.y + h / 2;

      // Exact QMK matrix coordinates (Center Anchor)
      const qmkX = (k as any).qmkPoint ? (k as any).qmkPoint[0] : Math.round((centerX / this.maxX) * 224);
      const qmkY = (k as any).qmkPoint ? (k as any).qmkPoint[1] : Math.round((centerY / this.maxY) * 64);
      const dx = qmkX - centerQmkX;
      const dy = qmkY - centerQmkY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const keyId = k.id || ((k as any).isLogo ? 'LOGO_LED' : (k.label || `k-${k.matrix?.[0]}-${k.matrix?.[1]}`));

      let hardwareLedIndex: number | undefined;
      if ((k as any).isLogo) {
        hardwareLedIndex = HARDWARE_LIGHTING_PROFILES[presetId]?.logoLedIndex;
      } else if (k.matrix) {
        hardwareLedIndex = getHardwareLedIndex(presetId, k.matrix[0], k.matrix[1]);
      }

      return {
        id: keyId,
        matrix: k.matrix,
        hardwareLedIndex,
        x: k.x,
        y: k.y,
        w,
        h,
        centerX,
        centerY,
        qmkX,
        qmkY,
        dx,
        dy,
        dist,
        isLogo: !!(k as any).isLogo,
        isKnob: !!(k as any).isKnob,
        group: k.group,
        el: null,
        curRgb: { r: 0, g: 0, b: 0 }
      };
    });

    let maxDist = 0;
    for (let i = 0; i < this.cachedKeys.length; i++) {
      if (this.cachedKeys[i].dist > maxDist) {
        maxDist = this.cachedKeys[i].dist;
      }
    }
    this.maxDist = maxDist || 125;
    this.cachedLayoutId = presetId;
  }

  public getCenterAnchor(): { x: number; y: number; qmkX: number; qmkY: number; maxDist: number } {
    return {
      x: this.centerAnchorX,
      y: this.centerAnchorY,
      qmkX: this.centerQmkX,
      qmkY: this.centerQmkY,
      maxDist: this.maxDist
    };
  }

  public ensureGeometry(): KeyGeometry[] {
    const presetId = useKeymapStore.getState().presetLayoutId || 'gmmk3-100-ansi';
    if (this.cachedKeys.length === 0 || this.cachedLayoutId !== presetId) {
      this.rebuildKeyGeometry(presetId);
    }

    // Attach DOM element handles if needed
    if (typeof document !== 'undefined') {
      for (let i = 0; i < this.cachedKeys.length; i++) {
        const k = this.cachedKeys[i];
        if (!k.el || !document.contains(k.el)) {
          k.el = document.querySelector<HTMLElement>(`#studioLightingKeyboardCanvas [data-key-id="${k.id}"]`);
        }
      }
    }
    return this.cachedKeys;
  }

  public getCachedKeys(): KeyGeometry[] {
    return this.cachedKeys;
  }
}

export const geometryManager = new GeometryManager();
