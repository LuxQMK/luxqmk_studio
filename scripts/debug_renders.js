const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

ipcMain.handle('get-autostart', async () => false);
ipcMain.handle('set-autostart', async () => true);
ipcMain.handle('get-desktop-sources', async () => []);
ipcMain.handle('get-app-data-path', async () => __dirname);
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

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.webContents.on('console-message', (e, level, msg, line, src) => {
    console.log(`[Console L${level}] ${msg}`);
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadFile(distHtml);

  await new Promise(r => setTimeout(r, 1000));

  // Initialize store safely
  await win.webContents.executeJavaScript(`
    (() => {
      window.addEventListener('error', (e) => {
        console.error('[WINDOW_ERROR]', e.message, e.error?.stack);
      });
      window.addEventListener('unhandledrejection', (e) => {
        console.error('[UNHANDLED_REJECTION]', e.reason?.message, e.reason?.stack);
      });

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
    })()
  `);

  const views = ['keymap', 'lighting', 'studio_lighting', 'macro', 'encoder', 'tester', 'backup', 'settings'];

  for (const v of views) {
    console.log(`\nTesting view: ${v}`);
    await win.webContents.executeJavaScript(`
      (() => {
        try {
          window.__stores.useUIStore.getState().setActiveView('${v}');
        } catch (err) {
          console.error('[SWITCH_ERROR]', err);
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    const check = await win.webContents.executeJavaScript(`
      (() => {
        const sec = document.querySelector('.view-container.active, #${v}, #view-${v}');
        return {
          view: '${v}',
          hasContainer: Boolean(sec),
          containerId: sec ? sec.id : null,
          childrenCount: sec ? sec.children.length : 0,
          innerTextLength: sec ? sec.innerText.length : 0
        };
      })()
    `);
    console.log('Result for', v, ':', check);
  }

  app.exit(0);
});
