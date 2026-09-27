export interface DeviceDescriptor {
  id: string;
  name: string;
  family: string;
  formFactor: string;
  layout: string;
  vendorId: number | null;
  productId: number | null;
  mcu: string;
  matrix: string;
  ledTotal: number;
  lightingType: string;
  capabilities: {
    hasVia?: boolean;
    hasLighting: boolean;
    hasRgbMatrix: boolean;
    hasMonochromeBacklight: boolean;
    hasRotaryEncoder: boolean;
    hasLogoBadgeLed: boolean;
    logoLedIndex: number | null;
    hasSidelights: boolean;
    sidelightCount: number;
    hasWinLock: boolean;
    winLockLedIndex: number | null;
    hasDualLayerReactive: boolean;
    hasPerLayerLighting: boolean;
    hasDebounceControl: boolean;
    hasNkroToggle: boolean;
  };
}

export const ALL_DEVICE_DESCRIPTORS: DeviceDescriptor[] = [
  {
    "id": "gmmk3-100-ansi",
    "name": "Glorious GMMK 3 100% ANSI",
    "family": "GMMK 3",
    "formFactor": "100%",
    "layout": "ANSI",
    "vendorId": 20555,
    "productId": 12815,
    "mcu": "WB32FQ95 (ARM Cortex-M4)",
    "matrix": "14 Rows × 8 Cols (112 Key Positions)",
    "ledTotal": 125,
    "lightingType": "rgb_matrix",
    "capabilities": {
      "hasVia": true,
      "hasLighting": true,
      "hasRgbMatrix": true,
      "hasMonochromeBacklight": false,
      "hasRotaryEncoder": true,
      "hasLogoBadgeLed": true,
      "logoLedIndex": 124,
      "hasSidelights": true,
      "sidelightCount": 20,
      "hasWinLock": true,
      "winLockLedIndex": 92,
      "hasDualLayerReactive": true,
      "hasPerLayerLighting": true,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  },
  {
    "id": "gmmk3-75-ansi",
    "name": "Glorious GMMK 3 75% ANSI",
    "family": "GMMK 3",
    "formFactor": "75%",
    "layout": "ANSI",
    "vendorId": 20555,
    "productId": 12814,
    "mcu": "WB32FQ95 (ARM Cortex-M4)",
    "matrix": "11 Rows × 8 Cols (88 Key Positions)",
    "ledTotal": 101,
    "lightingType": "rgb_matrix",
    "capabilities": {
      "hasVia": true,
      "hasLighting": true,
      "hasRgbMatrix": true,
      "hasMonochromeBacklight": false,
      "hasRotaryEncoder": true,
      "hasLogoBadgeLed": true,
      "logoLedIndex": 100,
      "hasSidelights": true,
      "sidelightCount": 20,
      "hasWinLock": true,
      "winLockLedIndex": 72,
      "hasDualLayerReactive": true,
      "hasPerLayerLighting": true,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  },
  {
    "id": "gmmk3-65-ansi",
    "name": "Glorious GMMK 3 65% ANSI",
    "family": "GMMK 3",
    "formFactor": "65%",
    "layout": "ANSI",
    "vendorId": 20555,
    "productId": 12813,
    "mcu": "WB32FQ95 (ARM Cortex-M4)",
    "matrix": "9 Rows × 8 Cols (72 Key Positions)",
    "ledTotal": 85,
    "lightingType": "rgb_matrix",
    "capabilities": {
      "hasVia": true,
      "hasLighting": true,
      "hasRgbMatrix": true,
      "hasMonochromeBacklight": false,
      "hasRotaryEncoder": false,
      "hasLogoBadgeLed": false,
      "logoLedIndex": null,
      "hasSidelights": true,
      "sidelightCount": 20,
      "hasWinLock": true,
      "winLockLedIndex": 58,
      "hasDualLayerReactive": true,
      "hasPerLayerLighting": true,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  },
  {
    "id": "gmmk2-96-ansi",
    "name": "Glorious GMMK 2 96% ANSI",
    "family": "GMMK 2",
    "formFactor": "96%",
    "layout": "ANSI",
    "vendorId": 12815,
    "productId": 20555,
    "mcu": "WB32FQ95 (ARM Cortex-M4)",
    "matrix": "13 Rows × 8 Cols (104 Key Positions)",
    "ledTotal": 119,
    "lightingType": "rgb_matrix",
    "capabilities": {
      "hasVia": true,
      "hasLighting": true,
      "hasRgbMatrix": true,
      "hasMonochromeBacklight": false,
      "hasRotaryEncoder": false,
      "hasLogoBadgeLed": false,
      "logoLedIndex": null,
      "hasSidelights": true,
      "sidelightCount": 20,
      "hasWinLock": true,
      "winLockLedIndex": 88,
      "hasDualLayerReactive": true,
      "hasPerLayerLighting": true,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  },
  {
    "id": "gmmk2-65-ansi",
    "name": "Glorious GMMK 2 65% ANSI",
    "family": "GMMK 2",
    "formFactor": "65%",
    "layout": "ANSI",
    "vendorId": 12815,
    "productId": 20554,
    "mcu": "WB32FQ95 (ARM Cortex-M4)",
    "matrix": "9 Rows × 8 Cols (72 Key Positions)",
    "ledTotal": 87,
    "lightingType": "rgb_matrix",
    "capabilities": {
      "hasVia": true,
      "hasLighting": true,
      "hasRgbMatrix": true,
      "hasMonochromeBacklight": false,
      "hasRotaryEncoder": false,
      "hasLogoBadgeLed": false,
      "logoLedIndex": null,
      "hasSidelights": true,
      "sidelightCount": 20,
      "hasWinLock": true,
      "winLockLedIndex": 59,
      "hasDualLayerReactive": true,
      "hasPerLayerLighting": true,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  },
  {
    "id": "generic-via",
    "name": "Generic QMK/VIA Keyboard (RGB Matrix)",
    "family": "Generic",
    "formFactor": "100%",
    "layout": "ANSI",
    "vendorId": null,
    "productId": null,
    "mcu": "QMK Compatible Microcontroller",
    "matrix": "Dynamic Matrix Layout",
    "ledTotal": 104,
    "lightingType": "rgb_matrix",
    "capabilities": {
      "hasVia": true,
      "hasLighting": true,
      "hasRgbMatrix": true,
      "hasMonochromeBacklight": false,
      "hasRotaryEncoder": false,
      "hasLogoBadgeLed": false,
      "logoLedIndex": null,
      "hasSidelights": false,
      "sidelightCount": 0,
      "hasWinLock": true,
      "winLockLedIndex": null,
      "hasDualLayerReactive": true,
      "hasPerLayerLighting": true,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  },
  {
    "id": "generic-monochrome",
    "name": "Generic TKL 80% (Monochrome Backlight)",
    "family": "Generic",
    "formFactor": "TKL",
    "layout": "ANSI",
    "vendorId": null,
    "productId": null,
    "mcu": "QMK / VIA Microcontroller",
    "matrix": "Dynamic TKL Matrix",
    "ledTotal": 87,
    "lightingType": "monochrome",
    "capabilities": {
      "hasVia": true,
      "hasLighting": true,
      "hasRgbMatrix": false,
      "hasMonochromeBacklight": true,
      "hasRotaryEncoder": false,
      "hasLogoBadgeLed": false,
      "logoLedIndex": null,
      "hasSidelights": false,
      "sidelightCount": 0,
      "hasWinLock": true,
      "winLockLedIndex": null,
      "hasDualLayerReactive": false,
      "hasPerLayerLighting": false,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  },
  {
    "id": "generic-unlit",
    "name": "Generic 60% (Unlit / No Backlight)",
    "family": "Generic",
    "formFactor": "60%",
    "layout": "ANSI",
    "vendorId": null,
    "productId": null,
    "mcu": "QMK / VIA Microcontroller",
    "matrix": "Dynamic 60% Matrix",
    "ledTotal": 0,
    "lightingType": "none",
    "capabilities": {
      "hasVia": true,
      "hasLighting": false,
      "hasRgbMatrix": false,
      "hasMonochromeBacklight": false,
      "hasRotaryEncoder": false,
      "hasLogoBadgeLed": false,
      "logoLedIndex": null,
      "hasSidelights": false,
      "sidelightCount": 0,
      "hasWinLock": false,
      "winLockLedIndex": null,
      "hasDualLayerReactive": false,
      "hasPerLayerLighting": false,
      "hasDebounceControl": true,
      "hasNkroToggle": true
    }
  }
];

export function findDeviceDescriptor(vendorId: number, productId: number): DeviceDescriptor | undefined {
  return ALL_DEVICE_DESCRIPTORS.find(d => 
    (d.vendorId === vendorId && d.productId === productId) ||
    (d.vendorId === productId && d.productId === vendorId) // handle swapped endianness
  );
}

export function createDynamicDescriptor(
  vendorId: number,
  productId: number,
  productName?: string,
  catalogEntry?: {
    id?: string;
    name?: string;
    features?: string[];
    mcu?: string;
    layout?: string;
  } | null
): DeviceDescriptor {
  const hasRgb = catalogEntry?.features?.includes('rgb') || catalogEntry?.features?.includes('rgb_matrix') || false;
  const hasMonochrome = catalogEntry?.features?.includes('backlight') || catalogEntry?.features?.includes('monochrome') || false;
  const hasLighting = hasRgb || hasMonochrome;
  const hasEncoder = catalogEntry?.features?.includes('encoder') || false;
  const hasVia = catalogEntry?.features ? catalogEntry.features.includes('via') : true;
  const layout = catalogEntry?.layout?.toUpperCase() || 'ANSI';

  const name = catalogEntry?.name || productName || `QMK Keyboard (0x${vendorId.toString(16).toUpperCase().padStart(4, '0')}:0x${productId.toString(16).toUpperCase().padStart(4, '0')})`;

  return {
    id: catalogEntry?.id || 'generic-via',
    name,
    family: 'Generic QMK',
    formFactor: catalogEntry?.layout || '100%',
    layout: layout.includes('ISO') ? 'ISO' : 'ANSI',
    vendorId,
    productId,
    mcu: catalogEntry?.mcu || 'QMK Microcontroller',
    matrix: 'Universal Dynamic Matrix',
    ledTotal: hasRgb ? 87 : (hasMonochrome ? 87 : 0),
    lightingType: hasRgb ? 'rgb_matrix' : (hasMonochrome ? 'monochrome' : 'none'),
    capabilities: {
      hasVia,
      hasLighting,
      hasRgbMatrix: hasRgb,
      hasMonochromeBacklight: hasMonochrome,
      hasRotaryEncoder: hasEncoder,
      hasLogoBadgeLed: false,
      logoLedIndex: null,
      hasSidelights: false,
      sidelightCount: 0,
      hasWinLock: true,
      winLockLedIndex: null,
      hasDualLayerReactive: hasRgb,
      hasPerLayerLighting: hasRgb,
      hasDebounceControl: true,
      hasNkroToggle: true,
    },
  };
}
