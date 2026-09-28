# LuxQMK Studio

[![Latest Release](https://img.shields.io/badge/Release-v1.4.3-00b4d8.svg?style=flat)](https://github.com/LuxQMK/luxqmk_studio/releases/tag/v1.4.3)
[![Firmware Engine](https://img.shields.io/badge/Firmware-LuxQMK%20v0.3.3-8a2be2.svg?style=flat)](https://github.com/LuxQMK/qmk_firmware)
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
├── index.html               # Semantic HTML5 root mount point
├── vite.config.ts           # Vite build & bundler configuration
├── tsconfig.json            # TypeScript project configuration
├── package.json             # NPM project definitions & build scripts
├── main.js                  # Electron desktop application main process
├── preload.js               # Secure IPC bridge for Electron
├── assets/                  # High-resolution SVG and PNG branding assets
├── bin/                     # Hardware flasher tools (wb32-dfu-updater, dfu-util)
├── css/                     # Design system tokens and styles
└── src/                     # React 19 + TypeScript + Zustand Application
    ├── main.tsx             # Application bootstrap & DOM rendering
    ├── App.tsx              # Root component & responsive layout shell
    ├── core/                # WebHID protocol & audio visualizer streaming services
    ├── data/                # Keyboard presets, VIA keycodes & device descriptors
    ├── store/               # Zustand global state stores (Device, Keymap, Lighting, etc.)
    ├── views/               # Modular studio views (Keymap, Lighting, Studio Lighting, etc.)
    ├── components/          # Reusable UI components (TopBar, Sidebar, Modals, etc.)
    ├── i18n/                # Type-safe internationalization (EN/PL)
    └── services/            # JSON backup & restore serializers
```

---

## 🚀 How to Run & Build

### Development Mode
```bash
# Install dependencies
npm install

# Start Vite live-reload dev server
npm run dev

# Start Electron desktop application
npm start
```

### Testing
```bash
# Run comprehensive validation test suite
npm test
```

### Production Build & Installer
```bash
# Compile TypeScript & bundle assets with Vite
npm run build

# Build production NSIS Windows Installer (.exe)
npm run dist:installer
```

---

## 📜 License
- **LuxQMK Studio Application**: Open Source GNU General Public License v3 ([GPLv3](LICENSE))
- **LuxQMK Firmware**: GNU General Public License v2 / v3 (GPL)
