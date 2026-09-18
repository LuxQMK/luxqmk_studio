/**
 * Device Profile: Generic QMK/VIA Keyboard Profile
 */
(function () {
  window.GENERIC_VIA_DEVICES = [
    {
      id: 'generic-via',
      name: 'Generic QMK/VIA Keyboard',
      family: 'Generic',
      formFactor: 'Custom',
      layout: 'Universal',
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
    }
  ];
})();
