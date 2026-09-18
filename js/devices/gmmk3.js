/**
 * Device Profile: Glorious GMMK 3 Family (100%, 75%, 65%)
 */
(function () {
  window.GMMK3_DEVICES = [
    {
      id: 'gmmk3-100-ansi',
      name: 'Glorious GMMK 3 100% ANSI',
      family: 'GMMK 3',
      formFactor: '100%',
      layout: 'ANSI',
      vendorId: 0x504B,
      productId: 0x320F,
      mcu: 'WB32FQ95 (ARM Cortex-M4)',
      matrix: '14 Rows × 8 Cols (112 Key Positions)',
      ledTotal: 125,
      capabilities: {
        hasRotaryEncoder: true,
        hasLogoBadgeLed: true,
        logoLedIndex: 124,
        hasSidelights: true,
        sidelightCount: 20,
        hasWinLock: true,
        winLockLedIndex: 92,
        hasDualLayerReactive: true,
        hasPerLayerLighting: true,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    },
    {
      id: 'gmmk3-75-ansi',
      name: 'Glorious GMMK 3 75% ANSI',
      family: 'GMMK 3',
      formFactor: '75%',
      layout: 'ANSI',
      vendorId: 0x504B,
      productId: 0x320E,
      mcu: 'WB32FQ95 (ARM Cortex-M4)',
      matrix: '11 Rows × 8 Cols (88 Key Positions)',
      ledTotal: 99,
      capabilities: {
        hasRotaryEncoder: true,
        hasLogoBadgeLed: true,
        logoLedIndex: 98,
        hasSidelights: true,
        sidelightCount: 16,
        hasWinLock: true,
        winLockLedIndex: 72,
        hasDualLayerReactive: true,
        hasPerLayerLighting: true,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    },
    {
      id: 'gmmk3-65-ansi',
      name: 'Glorious GMMK 3 65% ANSI',
      family: 'GMMK 3',
      formFactor: '65%',
      layout: 'ANSI',
      vendorId: 0x504B,
      productId: 0x320D,
      mcu: 'WB32FQ95 (ARM Cortex-M4)',
      matrix: '9 Rows × 8 Cols (72 Key Positions)',
      ledTotal: 83,
      capabilities: {
        hasRotaryEncoder: false,
        hasLogoBadgeLed: true,
        logoLedIndex: 82,
        hasSidelights: true,
        sidelightCount: 14,
        hasWinLock: true,
        winLockLedIndex: 58,
        hasDualLayerReactive: true,
        hasPerLayerLighting: true,
        hasDebounceControl: true,
        hasNkroToggle: true
      }
    }
  ];
})();
