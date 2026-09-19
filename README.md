# LuxQMK Studio (v1.1.0)

Professional WebHID / Desktop companion suite for real-time keymap remapping, lighting configuration, reactive effect layering, audio visualizers, raw HID diagnostics, and backup/restore workflows for keyboards running **LuxQMK** / **QMK Firmware** and the **VIA v12 Protocol**.

---

## 🌟 Key Features

- **Universal Dynamic VIA Layout Engine**: Native matrix rendering for 100%, 96%, 80% TKL, 75%, 65%, and 60% form factors (ANSI & ISO), plus on-the-fly custom VIA `design_layout.json` & QMK `keyboard.json` importing.
- **Visual Keymap & Rotary Encoder Editor**: Interactive real-time keycode remapping across layers 0 to 2, full VIA keycode categories (Basic, Media, Macro, Layers, Special, Lighting, Custom), and rotary knob action configuration.
- **Lighting Studio & Reactive Engine**: 1:1 parity with QMK RGB Matrix animation algorithms, custom Lux Wave & Cycle Dynamic modes, dual-layer reactive overlays, per-layer lighting, and Logo Badge / Sidelight controls.
- **Web Audio Visualizer**: Real-time microphone/system audio frequency visualizer mapped to keyboard backlighting.
- **Live Keystroke & Matrix Tester**: Low-latency switch actuation tester with keycode logging and hit tracking.
- **Hardware Profile & Capability Detection**: Auto-detects GMMK 3 (100%, 75%, 65%), GMMK 2 (96%, 65%), Keychron, and generic VIA/QMK keyboards, dynamically adapting peripheral UI elements.
- **Full Settings Backup & Restore**: One-click JSON serialization and safe chunked restore for EEPROM settings.
- **Multilingual Support (i18n)**: English (EN) and Polish (PL) localization with automatic browser detection and persistent preferences.

---

## 📁 Modular Architecture

```text
luxqmk-studio/
├── index.html               # Semantic HTML5 UI shell
├── css/
│   ├── variables.css        # CSS design system tokens (colors, glow, radiuses)
│   ├── sidebar.css          # Navigation sidebar styling
│   ├── layout.css           # Responsive grids, flexbox, and dynamic auto-scaling canvases
│   └── components.css       # Glassmorphism cards, buttons, palettes, sliders, toasts
├── js/
│   ├── app.js               # Application bootstrap & event lifecycle
│   ├── layout-data.js       # Universal physical layout definitions & VIA JSON parser
│   ├── device-manager.js    # Multi-device detection and capability manager (v1.1.0)
│   ├── devices/             # Device hardware profile descriptors (gmmk3, gmmk2, generic-via)
│   ├── hid-protocol.js      # Low-level WebHID communication layer (VIA v12 & Raw HID)
│   ├── keycodes-db.js       # Comprehensive VIA / QMK keycodes database
│   ├── keymap-editor.js     # Visual key remapping & encoder manager
│   ├── lighting-controller.js# Real-time RGB visualizer and hardware sync engine
│   ├── audio-visualizer.js  # Web Audio API reactive spectrum visualizer
│   ├── key-tester.js        # Switch actuation tester & keycode history
│   ├── backup-manager.js    # JSON configuration backup & restore engine
│   ├── ui-controller.js     # DOM controller, modal management, toasts, tabs
│   └── i18n.js              # Internationalization dictionary & manager (EN/PL)
├── main.js                  # Electron desktop application main process
└── util/
    ├── bundle_studio.py     # Standalone portable HTML bundler
    └── update_companion_html.py
```

---

## 🚀 How to Run

### Standalone Web Version (WebHID)
Open `index.html` (or single-file bundle `luxqmk_studio.html`) in any Chromium browser (Google Chrome, Microsoft Edge, Brave, Opera).

### Desktop Application (Electron)
```bash
# Install dependencies
npm install

# Start development app
npm start

# Build portable and installer executables (.exe)
npm run dist
```

---

## 📜 License
- **LuxQMK Studio Application**: Open Source GNU General Public License v3 ([GPLv3](LICENSE))
- **LuxQMK Firmware**: GNU General Public License v2 / v3 (GPL)
