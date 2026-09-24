# LuxQMK Studio

[![Latest Release](https://img.shields.io/badge/Release-v1.3.0-00b4d8.svg?style=flat)](https://github.com/LuxQMK/luxqmk_studio/releases/tag/v1.3.0)
[![Firmware Engine](https://img.shields.io/badge/Firmware-LuxQMK%20v0.3.0-8a2be2.svg?style=flat)](https://github.com/LuxQMK/qmk_firmware)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Professional WebHID / Desktop companion suite for real-time keymap remapping, lighting configuration, reactive effect layering, multi-stop gradients, audio visualizers, raw HID diagnostics, and backup/restore workflows for keyboards running **LuxQMK** / **QMK Firmware** and the **VIA Protocol**.

---

## 🌟 Key Features

- **Universal Dynamic VIA Layout Engine**: Native matrix rendering for 100%, 96%, 80% TKL, 75%, 65%, and 60% form factors (ANSI & ISO), plus on-the-fly custom VIA `design_layout.json` & QMK `keyboard.json` importing.
- **Visual Keymap & Rotary Encoder Editor**: Interactive real-time keycode remapping across layers 0 to 2, full VIA keycode categories (Basic, Media, Macro, Layers, Special, Lighting, Custom), and rotary knob action configuration.
- **Advanced Multi-Stop Gradient Engine**: Custom gradient designer supporting up to 8 color stops, CIE1931 perceptual lightness curve, spatial density controls, and EEPROM persistence.
- **Sidelight & Underglow Suite**: Center-out wave dynamics, board-aware optical window calibration (GMMK 3, GMMK 2, Generic), density tuning, and independent color/speed control.
- **Dual-Layer Reactive Lighting**: Real-time hardware layering for reactive effects (Fade, Splash, Rainbow Ripple, Cross, Nexus Star, Wide Wave, Typing Heatmap).
- **Direct Lighting Atomic Streamer**: High-performance double-buffered direct LED streaming over WebHID for software animations.
- **Web Audio Visualizer**: Real-time microphone/system audio frequency visualizer mapped to keyboard backlighting and sidelights.
- **Live Keystroke & Matrix Tester**: Low-latency switch actuation tester with keycode logging and hit tracking.
- **Hardware Profile & Capability Detection**: Auto-detects GMMK 3 (100%, 75%, 65%), GMMK 2 (96%, 65%), Keychron, and generic VIA/QMK keyboards.
- **Full Settings Backup & Restore**: One-click JSON serialization and safe chunked restore for EEPROM settings.
- **Multilingual Support (i18n)**: 100% complete English (EN) and Polish (PL) localization with automatic browser detection and persistent preferences.

---

## 📁 Modular Architecture

```text
luxqmk_studio/
├── index.html               # Semantic HTML5 UI shell
├── css/
│   ├── variables.css        # CSS design system tokens (colors, glow, radiuses)
│   ├── sidebar.css          # Navigation sidebar styling
│   ├── layout.css           # Responsive grids, flexbox, and dynamic auto-scaling canvases
│   └── components.css       # Glassmorphism cards, buttons, palettes, sliders, toasts
├── js/
│   ├── app.js               # Application bootstrap & event lifecycle
│   ├── layout-data.js       # Universal physical layout definitions & VIA JSON parser
│   ├── device-manager.js    # Multi-device detection and capability manager
│   ├── devices/             # Device hardware profile descriptors (gmmk3, gmmk2, generic-via)
│   ├── hid-protocol.js      # Low-level WebHID communication layer (VIA & Raw HID)
│   ├── keycodes-db.js       # Comprehensive VIA / QMK keycodes database
│   ├── keymap-editor.js     # Visual key remapping & encoder manager
│   ├── lighting-controller.js# Real-time RGB visualizer and hardware sync engine
│   ├── gradient-editor.js   # Multi-stop color stop designer with CIE1931 preview
│   ├── audio-visualizer.js  # Web Audio API reactive spectrum visualizer
│   ├── studio-lighting.js   # Studio direct streaming animation engine
│   ├── key-tester.js        # Switch actuation tester & keycode history
│   ├── backup-manager.js    # JSON configuration backup & restore engine
│   ├── macro-manager.js     # QMK bytecode macro editor & recorder
│   ├── firmware-flasher.js  # Integrated DFU flasher & bootloader trigger
│   ├── ui-controller.js     # DOM controller, modal management, toasts, tabs
│   └── i18n.js              # Internationalization dictionary & manager (EN/PL)
├── main.js                  # Electron desktop application main process
├── preload.js               # Secure IPC bridge for Electron
└── util/
    ├── bundle_studio.py     # Standalone single-file HTML bundler
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

# Run comprehensive test suite
npm test

# Build NSIS Windows Installer (.exe)
npm run dist:installer
```

---

## 📜 License
- **LuxQMK Studio Application**: Open Source GNU General Public License v3 ([GPLv3](LICENSE))
- **LuxQMK Firmware**: GNU General Public License v2 / v3 (GPL)
