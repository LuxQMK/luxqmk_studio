const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    webPreferences: {
      offscreen: true
    },
    transparent: true,
    frame: false
  });

  const svgPath = path.resolve(__dirname, "..", "assets", "logo.svg");
  const svgContent = fs.readFileSync(svgPath, "utf8");
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 512px; height: 512px; background: transparent; overflow: hidden; }
    svg { width: 512px; height: 512px; display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  await win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  // Allow layout and rasterization
  await new Promise((r) => setTimeout(r, 600));

  const image = await win.capturePage({ x: 0, y: 0, width: 512, height: 512 });
  const pngBuffer = image.toPNG();
  const pngPath = path.resolve(__dirname, "..", "assets", "icon.png");
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`[OK] Rendered new icon.png (${pngBuffer.length} bytes)`);

  app.quit();
});
