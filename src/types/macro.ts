/**
 * Macro Editor Type Definitions
 */

export interface MacroSlot {
  id: number; // 0 to 15 (M0 - M15)
  name: string;
  content: string; // Plain text or {KC_ENTER}, {+KC_LCTRL}, {100ms}
}

export interface MacroBufferUsage {
  usedBytes: number;
  maxBytes: number; // 1024 B
  percentage: number;
}
