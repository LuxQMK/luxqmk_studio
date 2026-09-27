const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const targetDir = path.resolve(__dirname, '../../luxqmk_click/public/screenshots');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

ipcMain.handle('get-autostart', async () => false);
ipcMain.handle('set-autostart', async () => true);
ipcMain.handle('get-desktop-sources', async () => []);
ipcMain.handle('get-app-data-path', async () => targetDir);
ipcMain.handle('open-app-data-folder', async () => true);
ipcMain.handle('save-user-config', async () => true);
ipcMain.handle('load-user-config', async () => ({}));
ipcMain.handle('open-external', async () => true);
ipcMain.handle('flasher:get-tools-status', async () => ({
  dfuUtil: { installed: true, version: '0.11' },
  wb32Cli: { installed: true, version: '1.0' },
  driversReady: true,
  wb32Available: true,
  dfuUtilAvailable: true,
}));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 1100, // Full 1100px height so both keyboard preview AND all bottom control cards are fully visible!
    show: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadFile(distHtml);
  await sleep(1000);

  // Initialize store safely with English & connected GMMK 3 75%
  await win.webContents.executeJavaScript(`
    (() => {
      window.__stores.useI18n.getState().setLanguage('en');
      localStorage.setItem('luxqmk_lang', 'en');
      document.documentElement.lang = 'en';

      const desc = window.__stores.ALL_DEVICE_DESCRIPTORS.find(d => d.id === 'gmmk3-75-ansi') || window.__stores.ALL_DEVICE_DESCRIPTORS[0];
      window.__stores.useDeviceStore.setState({
        isConnected: true,
        activeDescriptor: desc,
        firmwareInfo: { major: 1, minor: 4, patch: 1, versionString: '1.4.1' }
      });
      window.__stores.useKeymapStore.setState({
        presetLayoutId: desc.id
      });

      window.__stores.useLightingStore.getState().loadFromHardware = async () => {};
      window.__stores.useLightingStore.setState({
        backlight: {
          brightness: 255,
          effect: 13, // Cycle Rainbow Wave
          speed: 128,
          density: 128,
          color: '#00ffff',
          reverse: false,
          gradientPreset: 1, // Cyberpunk
        },
        reactive: {
          enable: true,
          mode: 1, // Fade
          color: { h: 0, s: 255 },
          speed: 96,
          blend: 0, // Additive Glow
        },
        layerLighting: {
          enable: true,
          dimLevel: 128,
          layerColors: {
            1: { h: 28, s: 255 },
            2: { h: 128, s: 255 },
            3: { h: 200, s: 255 }
          }
        },
        logoLocks: {
          mode: 1,
          lockColors: {
            1: { h: 0, s: 255 },
            2: { h: 165, s: 255 },
            3: { h: 8, s: 255 },
            4: { h: 77, s: 255 },
            5: { h: 43, s: 255 },
            6: { h: 137, s: 255 },
            7: { h: 0, s: 0 }
          }
        },
        winLock: {
          mode: 2,
          color: { h: 0, s: 255 }
        },
        sidelight: {
          customEnable: true,
          effect: 4, // Rainbow Wave
          speed: 128,
          density: 128,
          color: '#00ffff',
          gradientPreset: 1,
          reverse: false,
        }
      });
    })()
  `);

  await sleep(1000);

  const captures = [
    // 1. QMK Lighting - Main Backlight (Full View with bottom controls)
    {
      file: 'studio-lighting.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('main');
      `
    },
    // 2. QMK Lighting - Reactive Layer
    {
      file: 'studio-lighting-reactive.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('reactive');
      `
    },
    // 3. QMK Lighting - Layer Lighting
    {
      file: 'studio-lighting-layer.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('layers');
      `
    },
    // 4. QMK Lighting - Logo & Lock Indicators
    {
      file: 'studio-lighting-logo.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('logo');
      `
    },
    // 5. QMK Lighting - Win Lock
    {
      file: 'studio-lighting-winlock.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('winlock');
      `
    },
    // 6. Studio Lighting - Audio Visualizer
    {
      file: 'studio-visualizer.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('studio_lighting');
        window.__stores.useUIStore.getState().setStudioSubTab('visualizer');
      `
    },
    // 7. Studio Lighting - Custom PC Animations
    {
      file: 'studio-visualizer-pc.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('studio_lighting');
        window.__stores.useUIStore.getState().setStudioSubTab('animations');
      `
    },
    // 8. Device Settings - Performance, Latency & Flasher
    {
      file: 'studio-settings.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('settings');
        window.__stores.useSettingsStore.setState({
          performance: {
            debounceType: 1, // Asymmetric Eager
            debounceTimeMs: 2, // 2ms
            nkroEnabled: true,
            pollingRate: 1000
          }
        });
      `
    },
    // 9. Macro Editor
    {
      file: 'studio-macro.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('macro');
        window.__stores.useMacroStore.getState().updateActiveMacro({
          name: 'Macro 0',
          content: 'Hello World!{KC_ENTER}'
        });
      `
    },
    // 10. Keymap Editor
    {
      file: 'studio-keymap.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('keymap');
      `
    },
    // 11. Encoder View
    {
      file: 'studio-encoder.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('encoder');
      `
    },
    // 12. Tester View
    {
      file: 'studio-tester.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('tester');
      `
    },
    // 13. Backup View
    {
      file: 'studio-backup.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('backup');
      `
    }
  ];

  for (const item of captures) {
    console.log(`\nCapturing: ${item.file}...`);
    await win.webContents.executeJavaScript(`
      (() => {
        ${item.setup || ''}
      })()
    `);

    await sleep(2200);

    const image = await win.webContents.capturePage();
    const pngBuf = image.toPNG();
    const filePath = path.join(targetDir, item.file);
    fs.writeFileSync(filePath, pngBuf);
    console.log(`[SAVED] ${item.file} -> ${filePath} (${pngBuf.length} bytes)`);
  }

  console.log('\nAll full-height screenshots captured successfully!');
  app.exit(0);
});
