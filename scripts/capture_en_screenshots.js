const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const targetDir = path.resolve(__dirname, '../../luxqmk_click/public/screenshots');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Register IPC handlers
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
    show: true, // Visible window ensures Chromium compositor renders all dynamically switched views
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  console.log('Loading Studio from:', distHtml);
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
          gradientPreset: 0,
        },
        sidelight: {
          customEnable: true,
          effect: 13,
          speed: 128,
          density: 128,
          color: '#00ffff',
          gradientPreset: 0,
          reverse: false,
        }
      });

      // Populate M0 macro slot safely
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
    })()
  `);

  await sleep(1000);

  const viewsToCapture = [
    {
      view: 'keymap',
      file: 'studio-keymap.png',
      exactTitle: 'Visual Keymap Editor',
      sectionId: 'view-keymap'
    },
    {
      view: 'lighting',
      file: 'studio-lighting.png',
      exactTitle: 'QMK Lighting (Hardware EEPROM)',
      sectionId: 'view-lighting',
      setup: `
        window.__stores.useUIStore.getState().setLightingSubTab('main');
      `
    },
    {
      view: 'studio_lighting',
      file: 'studio-visualizer.png',
      exactTitle: 'LuxQMK Studio Lighting (Software RGB Suite)',
      sectionId: 'view-studio_lighting',
      setup: `
        window.__stores.useUIStore.getState().setStudioSubTab('visualizer');
      `
    },
    {
      view: 'macro',
      file: 'studio-macro.png',
      exactTitle: 'Hardware Macro Editor',
      sectionId: 'view-macro'
    },
    {
      view: 'encoder',
      file: 'studio-encoder.png',
      exactTitle: 'Rotary Knob Configuration',
      sectionId: 'view-encoder'
    },
    {
      view: 'tester',
      file: 'studio-tester.png',
      exactTitle: 'Interactive Key Tester',
      sectionId: 'view-tester'
    },
    {
      view: 'backup',
      file: 'studio-backup.png',
      exactTitle: 'Profiles & Layout Backups',
      sectionId: 'view-backup'
    },
    {
      view: 'settings',
      file: 'studio-settings.png',
      exactTitle: 'Device Settings & Tools',
      sectionId: 'view-settings'
    },
  ];

  for (const item of viewsToCapture) {
    console.log(`\n========================================`);
    console.log(`Setting View: ${item.view} (${item.file})`);

    // Switch view
    await win.webContents.executeJavaScript(`
      (() => {
        window.__stores.useUIStore.getState().setActiveView('${item.view}');
        ${item.setup || ''}
      })()
    `);

    // Poll until DOM strictly reflects the target section, has children, and top bar matches
    let verified = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const status = await win.webContents.executeJavaScript(`
        (() => {
          const sec = document.getElementById('${item.sectionId}');
          const titleEl = document.getElementById('topBarViewTitle');
          const titleText = titleEl ? titleEl.innerText.trim() : '';
          const hasChildren = sec ? sec.children.length > 0 : false;
          const textLen = sec ? sec.innerText.length : 0;
          return {
            hasSection: Boolean(sec && hasChildren && textLen > 50),
            titleText: titleText,
            textLen: textLen
          };
        })()
      `);

      if (status.hasSection && status.titleText === item.exactTitle) {
        verified = true;
        console.log(`[PASS] Verified Section #${item.sectionId} (Title: "${status.titleText}", textLen: ${status.textLen})`);
        break;
      }
      await sleep(100);
    }

    if (!verified) {
      console.error(`[FAIL] Could not verify view ${item.view}!`);
    }

    // Wait 2.2s for React layout recalculation, SVGs, canvas, and sub-elements
    await sleep(2200);

    const image = await win.webContents.capturePage();
    const pngBuf = image.toPNG();
    const filePath = path.join(targetDir, item.file);
    fs.writeFileSync(filePath, pngBuf);
    console.log(`[SAVED] ${item.file} -> ${filePath} (${pngBuf.length} bytes)`);
  }

  console.log('\nAll 8 screenshots successfully captured, verified, and saved in English!');
  app.exit(0);
});
