/**
 * Device Profile: Glorious GMMK 2 Family (96%, 65%)
 */
(function () {
  window.GMMK2_DEVICES = [
    {
      id: 'gmmk2-96-ansi',
      name: 'Glorious GMMK 2 96% ANSI',
      family: 'GMMK 2',
      formFactor: '96%',
      layout: 'ANSI',
      vendorId: 0x320F,
      productId: 0x504B,
      mcu: 'WB32FQ95 (ARM Cortex-M4)',
      matrix: '13 Rows × 8 Cols (104 Key Positions)',
      ledTotal: 119,
      lightingType: 'rgb_matrix',
      capabilities: {
        hasLighting: true,
        hasRgbMatrix: true,
        hasMonochromeBacklight: false,
        hasRotaryEncoder: false,
        hasLogoBadgeLed: false,
        logoLedIndex: null,
        hasSidelights: true,
        sidelightCount: 20,
        hasWinLock: true,
        winLockLedIndex: 88,
        hasDualLayerReactive: true,
        hasPerLayerLighting: true,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    },
    {
      id: 'gmmk2-65-ansi',
      name: 'Glorious GMMK 2 65% ANSI',
      family: 'GMMK 2',
      formFactor: '65%',
      layout: 'ANSI',
      vendorId: 0x320F,
      productId: 0x504A,
      mcu: 'WB32FQ95 (ARM Cortex-M4)',
      matrix: '9 Rows × 8 Cols (72 Key Positions)',
      ledTotal: 87,
      lightingType: 'rgb_matrix',
      capabilities: {
        hasLighting: true,
        hasRgbMatrix: true,
        hasMonochromeBacklight: false,
        hasRotaryEncoder: false,
        hasLogoBadgeLed: false,
        logoLedIndex: null,
        hasSidelights: true,
        sidelightCount: 20,
        hasWinLock: true,
        winLockLedIndex: 59,
        hasDualLayerReactive: true,
        hasPerLayerLighting: true,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    }
  ];
})();
