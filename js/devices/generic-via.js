/**
 * Device Profile: Generic & Universal QMK / VIA Keyboard Profiles
 * Supports TKL 80%, 60%, 75%, and arbitrary Dynamic VIA/QMK JSONs
 */
(function () {
  window.GENERIC_VIA_DEVICES = [
    {
      id: 'generic-via',
      name: 'Generic QMK/VIA Keyboard (RGB Matrix)',
      family: 'Generic',
      formFactor: '100%',
      layout: 'ANSI',
      vendorId: null,
      productId: null,
      mcu: 'QMK Compatible Microcontroller',
      matrix: 'Dynamic Matrix Layout',
      ledTotal: 104,
      lightingType: 'rgb_matrix',
      capabilities: {
        hasLighting: true,
        hasRgbMatrix: true,
        hasMonochromeBacklight: false,
        hasRotaryEncoder: false,
        hasLogoBadgeLed: false,
        logoLedIndex: null,
        hasSidelights: false,
        sidelightCount: 0,
        hasWinLock: true,
        winLockLedIndex: null,
        hasDualLayerReactive: true,
        hasPerLayerLighting: true,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    },
    {
      id: 'generic-monochrome',
      name: 'Generic TKL 80% (Monochrome Backlight)',
      family: 'Generic',
      formFactor: 'TKL',
      layout: 'ANSI',
      vendorId: null,
      productId: null,
      mcu: 'QMK / VIA Microcontroller',
      matrix: 'Dynamic TKL Matrix',
      ledTotal: 87,
      lightingType: 'monochrome',
      capabilities: {
        hasLighting: true,
        hasRgbMatrix: false,
        hasMonochromeBacklight: true,
        hasRotaryEncoder: false,
        hasLogoBadgeLed: false,
        logoLedIndex: null,
        hasSidelights: false,
        sidelightCount: 0,
        hasWinLock: true,
        winLockLedIndex: null,
        hasDualLayerReactive: false,
        hasPerLayerLighting: false,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    },
    {
      id: 'generic-unlit',
      name: 'Generic 60% (Unlit / No Backlight)',
      family: 'Generic',
      formFactor: '60%',
      layout: 'ANSI',
      vendorId: null,
      productId: null,
      mcu: 'QMK / VIA Microcontroller',
      matrix: 'Dynamic 60% Matrix',
      ledTotal: 0,
      lightingType: 'none',
      capabilities: {
        hasLighting: false,
        hasRgbMatrix: false,
        hasMonochromeBacklight: false,
        hasRotaryEncoder: false,
        hasLogoBadgeLed: false,
        logoLedIndex: null,
        hasSidelights: false,
        sidelightCount: 0,
        hasWinLock: false,
        winLockLedIndex: null,
        hasDualLayerReactive: false,
        hasPerLayerLighting: false,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    }
  ];
})();
