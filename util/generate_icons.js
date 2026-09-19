const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  try {
    const win = new BrowserWindow({
      width: 512,
      height: 512,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        offscreen: false
      }
    });

    const svgPath = path.join(__dirname, '..', 'assets', 'logo.svg');
    const svgData = fs.readFileSync(svgPath, 'utf8');
    const html = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:512px;height:512px;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;}</style></head><body>${svgData}</body></html>`;

    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    await new Promise(r => setTimeout(r, 600));

    const image = await win.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });
    const pngBuffer = image.toPNG();
    const outPng = path.join(__dirname, '..', 'assets', 'icon.png');
    fs.writeFileSync(outPng, pngBuffer);
    console.log(`[OK] Rendered icon.png -> ${outPng} (${pngBuffer.length} bytes)`);
  } catch (err) {
    console.error('[ERR] Failed to render icon:', err);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});
