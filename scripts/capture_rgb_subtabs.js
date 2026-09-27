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
    height: 900,
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
          effect: 13,
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
          dimLevel: 128,
          layerColors: {
            1: { h: 28, s: 255 },
            2: { h: 128, s: 255 },
            3: { h: 200, s: 255 }
          }
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
        winLock: {
          mode: 2, // Custom color
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

  const subtabsToCapture = [
    {
      view: 'lighting',
      subtab: 'backlight',
      file: 'studio-lighting.png',
      scroll: 400,
      setup: `window.__stores.useUIStore.getState().setLightingSubTab('backlight');`
    },
    {
      view: 'lighting',
      subtab: 'backlight',
      file: 'studio-lighting-main.png',
      scroll: 400,
      setup: `window.__stores.useUIStore.getState().setLightingSubTab('backlight');`
    },
    {
      view: 'lighting',
      subtab: 'reactive',
      file: 'studio-lighting-reactive.png',
      scroll: 400,
      setup: `window.__stores.useUIStore.getState().setLightingSubTab('reactive');`
    },
    {
      view: 'lighting',
      subtab: 'winlock',
      file: 'studio-lighting-winlock.png',
      scroll: 400,
      setup: `window.__stores.useUIStore.getState().setLightingSubTab('winlock');`
    },
    {
      view: 'lighting',
      subtab: 'layers',
      file: 'studio-lighting-layer.png',
      scroll: 400,
      setup: `window.__stores.useUIStore.getState().setLightingSubTab('layers');`
    },
    {
      view: 'lighting',
      subtab: 'logo',
      file: 'studio-lighting-logo.png',
      scroll: 400,
      setup: `window.__stores.useUIStore.getState().setLightingSubTab('logo');`
    },
    {
      view: 'lighting',
      subtab: 'perkey',
      file: 'studio-lighting-perkey.png',
      scroll: 0,
      setup: `
        window.__stores.useUIStore.getState().setLightingSubTab('backlight');
        window.__stores.useLightingStore.setState({
          backlight: { effect: 39, speed: 128, brightness: 255, color: '#00ffff', density: 128, reverse: false, gradientPreset: 0 }
        });
      `
    },
    {
      view: 'studio_lighting',
      subtab: 'animations',
      file: 'studio-visualizer-pc.png',
      scroll: 300,
      setup: `
        window.__stores.useUIStore.getState().setStudioSubTab('animations');
      `
    }
  ];

  for (const item of subtabsToCapture) {
    console.log(`\nCapturing subtab: ${item.view} -> ${item.subtab} (${item.file})`);
    
    await win.webContents.executeJavaScript(`
      (() => {
        window.__stores.useUIStore.getState().setActiveView('${item.view}');
        ${item.setup || ''}
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = ${item.scroll || 0};
      })()
    `);

    await sleep(2200);

    const image = await win.webContents.capturePage();
    const pngBuf = image.toPNG();
    const filePath = path.join(targetDir, item.file);
    fs.writeFileSync(filePath, pngBuf);
    console.log(`[SAVED] ${item.file} -> ${filePath} (${pngBuf.length} bytes)`);
  }

  console.log('\nAll subtab screenshots captured successfully!');
  app.exit(0);
});
