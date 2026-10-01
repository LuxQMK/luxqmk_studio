/**
 * LuxQMK Studio Changelog Database
 * Automatically generated from CHANGELOG.md by scripts/sync-version.js. DO NOT EDIT DIRECTLY.
 */

export interface ChangelogRelease {
  version: string;
  date: string;
  sections: Record<string, string[]>;
  bullets: string[];
}

export const STUDIO_CHANGELOG: ChangelogRelease[] = [
  {
    "version": "1.4.5",
    "date": "Unreleased / In Development",
    "sections": {
      "Added": [
        "**Integrated Release Notes Engine**: Native in-app changelog browser and update summaries in Settings and OTA dialogs.",
        "**Offline Changelog Support**: Bundled typed changelog history without third-party API rate limits."
      ],
      "Changed": [
        "**Version Synchronization Pipeline**: Integrated automated changelog compilation into `scripts/sync-version.js` (`src/data/changelog.ts`)."
      ]
    },
    "bullets": [
      "[Added] **Integrated Release Notes Engine**: Native in-app changelog browser and update summaries in Settings and OTA dialogs.",
      "[Added] **Offline Changelog Support**: Bundled typed changelog history without third-party API rate limits.",
      "[Changed] **Version Synchronization Pipeline**: Integrated automated changelog compilation into `scripts/sync-version.js` (`src/data/changelog.ts`)."
    ]
  },
  {
    "version": "1.4.4",
    "date": "2026-10-01",
    "sections": {
      "Added": [
        "**Decoupled Layer Background Dimming**: Dedicated brightness dimming sliders per layer independent of key color highlights.",
        "**Enhanced Backup & Smart Restore**: Snapshot backup engine expanded to store per-layer dimming levels, sidelights, custom lock indicator modes, and physical DIP switch presets.",
        "**Custom Lock Indicator Customizer**: Real-time configuration for Caps Lock, Num Lock, Scroll Lock, and Win Lock LED colors with HSV quantization matching QMK firmware.",
        "**Virtual Keyboard Customizer**: Visual theme customization for keycaps, chassis materials, and LED glow effects in the preview canvas."
      ],
      "Changed": [
        "**4-Layer Authentic Display**: Removed synthetic fallback mappings to display live 4-layer EEPROM state directly from the device.",
        "**Minimum Firmware Baseline**: Recommended firmware updated to LuxQMK Firmware v0.3.5+.",
        "**HSV Normalization Alignment**: Aligned color calculation divisors to eliminate hue calculation skews."
      ],
      "Fixed": [
        "**Layer 2 Mac Base Mode Handling**: Aligned layer highlight bitmask toggles with firmware rules to respect Mac mode switching.",
        "**Status Badge Localization**: Localized Reactive, Win Lock, and NKRO badges in Polish and English."
      ]
    },
    "bullets": [
      "[Added] **Decoupled Layer Background Dimming**: Dedicated brightness dimming sliders per layer independent of key color highlights.",
      "[Added] **Enhanced Backup & Smart Restore**: Snapshot backup engine expanded to store per-layer dimming levels, sidelights, custom lock indicator modes, and physical DIP switch presets.",
      "[Added] **Custom Lock Indicator Customizer**: Real-time configuration for Caps Lock, Num Lock, Scroll Lock, and Win Lock LED colors with HSV quantization matching QMK firmware.",
      "[Added] **Virtual Keyboard Customizer**: Visual theme customization for keycaps, chassis materials, and LED glow effects in the preview canvas.",
      "[Changed] **4-Layer Authentic Display**: Removed synthetic fallback mappings to display live 4-layer EEPROM state directly from the device.",
      "[Changed] **Minimum Firmware Baseline**: Recommended firmware updated to LuxQMK Firmware v0.3.5+.",
      "[Changed] **HSV Normalization Alignment**: Aligned color calculation divisors to eliminate hue calculation skews.",
      "[Fixed] **Layer 2 Mac Base Mode Handling**: Aligned layer highlight bitmask toggles with firmware rules to respect Mac mode switching.",
      "[Fixed] **Status Badge Localization**: Localized Reactive, Win Lock, and NKRO badges in Polish and English."
    ]
  },
  {
    "version": "1.4.3",
    "date": "2026-09-28",
    "sections": {
      "Added": [
        "**Reactive Keystroke Heatmap Configuration**: Visual slider controls for reactive speed and fade decay durations.",
        "**Dynamic Speed & Density Tuning**: Direct controls for spatial gradient density and animation velocity."
      ],
      "Changed": [
        "**Audio Visualizer Web Audio Pipeline**: Reduced audio loopback capture latency with optimized FFT frequency binning."
      ]
    },
    "bullets": [
      "[Added] **Reactive Keystroke Heatmap Configuration**: Visual slider controls for reactive speed and fade decay durations.",
      "[Added] **Dynamic Speed & Density Tuning**: Direct controls for spatial gradient density and animation velocity.",
      "[Changed] **Audio Visualizer Web Audio Pipeline**: Reduced audio loopback capture latency with optimized FFT frequency binning."
    ]
  },
  {
    "version": "1.4.2",
    "date": "2026-09-25",
    "sections": {
      "Added": [
        "**Per-Key RGB Lighting Profiles**: Studio interface for editing and persisting 3 custom Per-Key lighting profiles (FPS, MOBA, MMO/RPG) into hardware EEPROM.",
        "**Multi-Stop Color Stop Editor**: Interactive gradient curve designer with CIE1931 lightness curve correction."
      ],
      "Fixed": [
        "**GMMK 3 Sidelight Color Synchronization**: Resolved dual-zone sidelight color packet latency over raw HID channels."
      ]
    },
    "bullets": [
      "[Added] **Per-Key RGB Lighting Profiles**: Studio interface for editing and persisting 3 custom Per-Key lighting profiles (FPS, MOBA, MMO/RPG) into hardware EEPROM.",
      "[Added] **Multi-Stop Color Stop Editor**: Interactive gradient curve designer with CIE1931 lightness curve correction.",
      "[Fixed] **GMMK 3 Sidelight Color Synchronization**: Resolved dual-zone sidelight color packet latency over raw HID channels."
    ]
  },
  {
    "version": "1.4.0",
    "date": "2026-09-18",
    "sections": {
      "Added": [
        "**Full Architecture Rewrite**: Modern React 19 + TypeScript + Zustand companion suite.",
        "**WebHID Streaming Engine**: 60 FPS bidirectional RGB packet streaming and audio visualizers.",
        "**Keymap & Macro Editor**: Full 4-layer key remapping with QMK keycode database.",
        "**Hardware Profile Database**: Deep matrix descriptors for Glorious GMMK 3, GMMK 2, and Keychron keyboards."
      ]
    },
    "bullets": [
      "[Added] **Full Architecture Rewrite**: Modern React 19 + TypeScript + Zustand companion suite.",
      "[Added] **WebHID Streaming Engine**: 60 FPS bidirectional RGB packet streaming and audio visualizers.",
      "[Added] **Keymap & Macro Editor**: Full 4-layer key remapping with QMK keycode database.",
      "[Added] **Hardware Profile Database**: Deep matrix descriptors for Glorious GMMK 3, GMMK 2, and Keychron keyboards."
    ]
  }
];

export const LATEST_RELEASE = STUDIO_CHANGELOG[0] || null;

export default STUDIO_CHANGELOG;
