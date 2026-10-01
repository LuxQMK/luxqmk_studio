const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const targetDir = path.resolve(__dirname, '../../luxqmk_click/public/screenshots');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Register mock IPC handlers
ipcMain.handle('get-autostart', async () => false);
ipcMain.handle('set-autostart', async () => true);
ipcMain.handle('get-desktop-sources', async () => []);
ipcMain.handle('get-app-data-path', async () => targetDir);
ipcMain.handle('open-app-data-folder', async () => true);
ipcMain.handle('save-user-config', async () => true);
ipcMain.handle('load-user-config', async () => ({}));
ipcMain.handle('open-external', async () => true);
ipcMain.handle('updater:check', async () => ({ updateAvailable: false }));
ipcMain.handle('updater:check-for-updates', async () => ({ updateAvailable: false }));
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
    width: 1424,
    height: 967,
    useContentSize: true,
    show: true,
    backgroundColor: '#0c0d14',
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.show();
  win.restore();
  win.focus();

  const distHtml = path.join(__dirname, '../dist/index.html');
  console.log('Loading Studio dist from:', distHtml);
  await win.loadFile(distHtml);

  await sleep(1500);

  // Initialize store safely with English & connected GMMK 3 75%
  await win.webContents.executeJavaScript(`
    (() => {
      try {
        window.__stores.useI18n.getState().setLanguage('en');
        localStorage.setItem('luxqmk_lang', 'en');
        document.documentElement.lang = 'en';

        const desc = window.__stores.ALL_DEVICE_DESCRIPTORS.find(d => d.id === 'gmmk3-75-ansi') || window.__stores.ALL_DEVICE_DESCRIPTORS[0];
        window.__stores.useDeviceStore.setState({
          isConnected: true,
          activeDescriptor: desc,
          firmwareInfo: { major: 1, minor: 4, patch: 3, versionString: '1.4.3-dev' }
        });
        window.__stores.useKeymapStore.setState({
          presetLayoutId: desc.id
        });

        // Prevent real hardware poll on mount
        window.__stores.useLightingStore.getState().loadFromHardware = async () => {};
        window.__stores.useLightingStore.setState({
          backlight: {
            brightness: 255,
            effect: 13, // Cycle Left/Right (Rainbow Wave)
            speed: 128,
            density: 128,
            color: '#00ffff',
            reverse: false,
            gradientPreset: 1, // Cyberpunk
          },
          reactive: {
            enable: true,
            mode: 1, // Fade
            color: { h: 0, s: 255 }, // Red
            speed: 96,
            blend: 0, // Additive Glow
          },
          layerLighting: {
            enable: true,
            layer1Enable: true,
            layer1Color: '#ffb700',
            layer2Enable: false,
            layer2Color: '#00ffff',
            layer3Enable: true,
            layer3Color: '#b400ff',
            dimMasterEnable: true,
            dimLevel: 128,
            dimLayer1Enable: true,
            layer1DimLevel: 128,
            dimLayer2Enable: false,
            layer2DimLevel: 255,
            dimLayer3Enable: true,
            layer3DimLevel: 128,
          },
          logoLocks: {
            mode: 1, // Indicator (RGB Idle)
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
          capsLock: {
            mode: 2,
            color: '#00ffff'
          },
          winLock: {
            mode: 2,
            color: '#ec4899'
          },
          numLock: {
            mode: 2,
            color: '#3b82f6'
          },
          scrollLock: {
            mode: 2,
            color: '#a855f7'
          },
          sidelight: {
            customEnable: true,
            effect: 13,
            speed: 128,
            density: 128,
            color: '#00ffff',
            gradientPreset: 1,
            reverse: false,
          }
        });

        if (window.__stores.useMacroStore) {
          window.__stores.useMacroStore.getState().updateActiveMacro({
            name: 'Macro 0',
            content: 'Hello World!{KC_ENTER}'
          });
        }

        if (window.__stores.useSettingsStore) {
          window.__stores.useSettingsStore.setState({
            performance: {
              debounceType: 1,
              debounceTimeMs: 2,
              nkroEnabled: true,
              pollingRate: 1000
            }
          });
        }

        if (window.__stores.useVisualizerStore) {
          window.__stores.useVisualizerStore.getState().setAudioLevels([
            0.85, 0.95, 0.78, 0.62, 0.55, 0.70, 0.88, 0.92,
            0.65, 0.48, 0.40, 0.58, 0.72, 0.80, 0.60, 0.45
          ]);
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    })()
  `);

  await sleep(1000);

  const captures = [
    {
      name: 'Keymap View',
      file: 'studio-keymap.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('keymap');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
      `
    },
    {
      name: 'Lighting - Main Backlight',
      file: 'studio-lighting.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('backlight');
        window.__stores.useLightingStore.setState({
          backlight: { effect: 13, speed: 128, density: 128, brightness: 255, color: '#00ffff', reverse: false, gradientPreset: 1 }
        });
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 400;
      `
    },
    {
      name: 'Lighting - Main Backlight Copy',
      file: 'studio-lighting-main.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('backlight');
        window.__stores.useLightingStore.setState({
          backlight: { effect: 13, speed: 128, density: 128, brightness: 255, color: '#00ffff', reverse: false, gradientPreset: 1 }
        });
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 400;
      `
    },
    {
      name: 'Lighting - Hardware EEPROM Multi-Stop Gradient Studio',
      file: 'studio-lighting-hardware-gradient.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('backlight');
        window.__stores.useLightingStore.setState({
          backlight: { effect: 13, speed: 128, density: 128, brightness: 255, color: '#00ffff', reverse: false, gradientPreset: 8 }
        });
        window.__stores.useLightingStore.getState().setActiveHardwareGradientProfile(0);
        window.__stores.useLightingStore.getState().applyHardwareGradientTemplate(0, [
          { pos: 0.0, color: '#00f0ff' },
          { pos: 0.333, color: '#ff0080' },
          { pos: 0.667, color: '#ffd000' }
        ]);
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 380;
      `
    },
    {
      name: 'Lighting - Reactive Layer',
      file: 'studio-lighting-reactive.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('reactive');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 400;
      `
    },
    {
      name: 'Lighting - Layer Dimming',
      file: 'studio-lighting-layer.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('layers');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 400;
      `
    },
    {
      name: 'Lighting - Logo & Locks',
      file: 'studio-lighting-logo.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('logo');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 400;
      `
    },
    {
      name: 'Lighting - Lock Indicators (75% Compact Layout)',
      file: 'studio-lighting-winlock.png',
      setup: `
        const desc75 = window.__stores.ALL_DEVICE_DESCRIPTORS.find(d => d.id === 'gmmk3-75-ansi') || window.__stores.ALL_DEVICE_DESCRIPTORS[0];
        window.__stores.useDeviceStore.setState({
          isConnected: true,
          activeDescriptor: desc75,
        });
        window.__stores.useKeymapStore.setState({
          presetLayoutId: 'gmmk3-75-ansi'
        });
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('winlock');
        window.__stores.useLightingStore.setState({
          capsLock: { mode: 2, color: '#00ffff' },
          winLock: { mode: 2, color: '#ec4899' },
        });
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 400;
      `
    },
    {
      name: 'Lighting - Full Lock Indicators (100% Layout)',
      file: 'studio-lighting-indicators-100.png',
      setup: `
        const desc100 = window.__stores.ALL_DEVICE_DESCRIPTORS.find(d => d.id === 'gmmk3-100-ansi') || window.__stores.ALL_DEVICE_DESCRIPTORS[0];
        window.__stores.useDeviceStore.setState({
          isConnected: true,
          activeDescriptor: desc100,
        });
        window.__stores.useKeymapStore.setState({
          presetLayoutId: 'gmmk3-100-ansi'
        });
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('winlock');
        window.__stores.useLightingStore.setState({
          capsLock: { mode: 2, color: '#00ffff' },
          winLock: { mode: 2, color: '#ec4899' },
          numLock: { mode: 2, color: '#3b82f6' },
          scrollLock: { mode: 2, color: '#a855f7' },
        });
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 400;
      `
    },
    {
      name: 'Lighting - Per-Key Custom Studio',
      file: 'studio-lighting-perkey.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('lighting');
        window.__stores.useUIStore.getState().setLightingSubTab('backlight');
        window.__stores.useLightingStore.setState({
          backlight: { effect: 39, speed: 128, brightness: 255, color: '#00ffff', density: 128, reverse: false, gradientPreset: 0 }
        });
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
      `
    },
    {
      name: 'Studio Lighting - Audio Visualizer',
      file: 'studio-visualizer.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('studio_lighting');
        window.__stores.useUIStore.getState().setStudioSubTab('audio');
        window.__stores.useVisualizerStore.getState().setConfig({
          audioColorMode: 'spectrum',
          audioMode: 'equalizer',
          gain: 1.2
        });
        window.__stores.useVisualizerStore.getState().setAudioLevels([
          0.85, 0.95, 0.78, 0.62, 0.55, 0.70, 0.88, 0.92,
          0.65, 0.48, 0.40, 0.58, 0.72, 0.80, 0.60, 0.45
        ]);
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 380;
      `
    },
    {
      name: 'Studio Lighting - Custom Multi-Stop Gradient Studio',
      file: 'studio-visualizer-custom-gradient.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('studio_lighting');
        window.__stores.useUIStore.getState().setStudioSubTab('audio');
        window.__stores.useVisualizerStore.getState().setConfig({
          audioColorMode: 'custom_grad_cyberpunk',
          audioMode: 'equalizer'
        });
        window.__stores.useVisualizerStore.getState().setActiveCustomGradientId('custom_grad_cyberpunk');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 780;
      `
    },
    {
      name: 'Studio Lighting - PC Streamed Animations',
      file: 'studio-visualizer-pc.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('studio_lighting');
        window.__stores.useUIStore.getState().setStudioSubTab('effects');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 320;
      `
    },
    {
      name: 'Macro Editor',
      file: 'studio-macro.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('macro');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
      `
    },
    {
      name: 'Encoder Configuration',
      file: 'studio-encoder.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('encoder');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
      `
    },
    {
      name: 'Key Tester',
      file: 'studio-tester.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('tester');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
      `
    },
    {
      name: 'Backup & Restore',
      file: 'studio-backup.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('backup');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
      `
    },
    {
      name: 'Settings & Flasher',
      file: 'studio-settings.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('settings');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
      `
    },
    {
      name: 'Keymap - Hardware Switch Studio',
      file: 'studio-hardware-switches.png',
      setup: `
        window.__stores.useKeyboardThemeStore.getState().setDesignModalOpen(false);
        window.__stores.useUIStore.getState().setActiveView('keymap');
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 480;
      `
    },
    {
      name: 'Keymap - Virtual Keyboard Appearance Customizer',
      file: 'studio-keyboard-customizer.png',
      setup: `
        window.__stores.useUIStore.getState().setActiveView('keymap');
        window.__stores.useKeyboardThemeStore.getState().setDesignModalOpen(true);
      `
    }
  ];

  for (const item of captures) {
    console.log(`\n========================================`);
    console.log(`[CAPTURING] ${item.name} -> ${item.file}`);

    win.show();
    win.focus();

    try {
      await win.webContents.executeJavaScript(`
        (() => {
          try {
            ${item.setup}
          } catch (e) {
            console.error('Setup error in ${item.file}:', e);
          }
        })()
      `);
    } catch (err) {
      console.error('executeJavaScript error:', err);
    }

    // Give ample time for React, canvas rendering, CSS transitions
    await sleep(2200);

    const image = await win.webContents.capturePage();
    const pngBuf = image.toPNG();
    if (pngBuf.length > 1000) {
      const filePath = path.join(targetDir, item.file);
      fs.writeFileSync(filePath, pngBuf);
      console.log(`[SAVED] ${item.file} (${pngBuf.length} bytes, size: ${image.getSize().width}x${image.getSize().height})`);
    } else {
      console.error(`[WARNING] Image capture returned ${pngBuf.length} bytes for ${item.file}`);
    }
  }

  console.log('\nAll documentation screenshots captured successfully!');
  app.exit(0);
});
