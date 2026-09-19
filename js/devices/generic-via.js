/**
 * Device Profile: Generic & Universal QMK / VIA Keyboard Profiles
 * Supports TKL 80%, 60%, 75%, and arbitrary Dynamic VIA/QMK JSONs
 */
(function () {
  window.GENERIC_VIA_DEVICES = [
    {
      id: 'generic-via',
      name: 'Generic QMK/VIA Keyboard',
      family: 'Generic',
      formFactor: '100%',
      layout: 'ANSI',
      vendorId: null,
      productId: null,
      mcu: 'QMK Compatible Microcontroller',
      matrix: 'Dynamic Matrix Layout',
      ledTotal: 104,
      capabilities: {
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
      id: 'generic-tkl',
      name: 'Standard TKL 80% (Keychron Q3 / TKL)',
      family: 'Generic',
      formFactor: 'TKL',
      layout: 'ANSI',
      vendorId: null,
      productId: null,
      mcu: 'QMK / VIA Microcontroller',
      matrix: 'Dynamic TKL Matrix',
      ledTotal: 87,
      capabilities: {
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
      id: 'generic-60',
      name: 'Standard 60% (Tofu60 / Universal 60%)',
      family: 'Generic',
      formFactor: '60%',
      layout: 'ANSI',
      vendorId: null,
      productId: null,
      mcu: 'QMK / VIA Microcontroller',
      matrix: 'Dynamic 60% Matrix',
      ledTotal: 61,
      capabilities: {
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
    }
  ];
})();
