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
    "version": "1.4.5-beta.2",
    "date": "In Development",
    "sections": {
      "Added": [
        "**GIF Animation Matrix Player**: Real-time GIF playback directly on keyboard LEDs with WebCodecs multi-frame decoding, multi-point area averaging, and configurable playback speed (0.25x–3.0x).",
        "**Aspect Ratio & Matrix Fit Modes**: Three dedicated mapping presets (*Fit / Letterbox*, *Fill / Crop*, *Stretch / Full*) to accurately render any GIF aspect ratio on physical keyboard matrices.",
        "**LED Contrast Enhancement Engine**: Parametric contrast boost slider (50%–200%) providing punchy colors and deep blacks tailored for mechanical keyboard LED matrices.",
        "**Studio Lighting Auto-Resume Pipeline**: Automatic restoration and live streaming resumption of active Studio Lighting effects (Audio, PC procedural animations, and GIF animations) across application restarts and USB device re-connections.",
        "**Sidelight Lateral Band Sampling**: Regional 30% edge band sampling and alpha-fallback mechanism for dynamic underglow lightbar animations synchronized with GIF frames."
      ],
      "Changed": [
        "**Studio Sub-Tab Navigation**: Added dedicated *GIF Animation Player* tab alongside *Audio Visualizer* and *PC Animations* with synchronized state persistence.",
        "**Saved Asset Restoration**: Transparent background-decoding pipeline ensuring cached GIF files resume streaming immediately upon hardware connection."
      ]
    },
    "bullets": [
      "[Added] **GIF Animation Matrix Player**: Real-time GIF playback directly on keyboard LEDs with WebCodecs multi-frame decoding, multi-point area averaging, and configurable playback speed (0.25x–3.0x).",
      "[Added] **Aspect Ratio & Matrix Fit Modes**: Three dedicated mapping presets (*Fit / Letterbox*, *Fill / Crop*, *Stretch / Full*) to accurately render any GIF aspect ratio on physical keyboard matrices.",
      "[Added] **LED Contrast Enhancement Engine**: Parametric contrast boost slider (50%–200%) providing punchy colors and deep blacks tailored for mechanical keyboard LED matrices.",
      "[Added] **Studio Lighting Auto-Resume Pipeline**: Automatic restoration and live streaming resumption of active Studio Lighting effects (Audio, PC procedural animations, and GIF animations) across application restarts and USB device re-connections.",
      "[Added] **Sidelight Lateral Band Sampling**: Regional 30% edge band sampling and alpha-fallback mechanism for dynamic underglow lightbar animations synchronized with GIF frames.",
      "[Changed] **Studio Sub-Tab Navigation**: Added dedicated *GIF Animation Player* tab alongside *Audio Visualizer* and *PC Animations* with synchronized state persistence.",
      "[Changed] **Saved Asset Restoration**: Transparent background-decoding pipeline ensuring cached GIF files resume streaming immediately upon hardware connection."
    ]
  },
  {
    "version": "1.4.5-beta.1",
    "date": "2026-10-04",
    "sections": {
      "Added": [
        "**Modular Studio Lighting & Visualizer Architecture**: Refactored the core lighting and streaming engine into dedicated submodules (`audio`, `effects`, `geometry`, `palettes`, `sidelights`, `visualizer-engine`).",
        "**Background & Minimized Streaming Engine**: Implemented a hybrid timer mechanism ensuring continuous real-time RGB streaming even when the Studio window is minimized or running in the background (bypassing Chromium throttling).",
        "**Studio Lighting Persistence**: Full persistence of all visualizer settings, audio sensitivity, background floor, direction, and color modes in `localStorage` and `electronAPI`.",
        "**Bass Shockwave Audio Mode**: Radial expanding shockwave anchored to keyboard physical center (Key P / matrix center) with bidirectional spatial velocity.",
        "**Customizable Idle Background Wave Direction**: Granular animation direction controls (Left-to-Right, Right-to-Left, Center-to-Outward, Outward-to-Center) for ambient lighting under Graphic Equalizer and Bass Shockwave.",
        "**Audio Visualizer Color Styles**: Dynamic Wave / ROYGBIV Rainbow Spectrum, Unified Monochromatic, and Frequency-Banded color mapping with a configurable 0%–100% idle floor brightness.",
        "**Integrated Release Notes Browser**: In-app modal viewer with decoupled Studio and Firmware release notes (`ChangelogViewer.tsx`)."
      ],
      "Changed": [
        "**Audio Stream Resilience & Watchdog**: Auto-reconnect and watchdog monitoring for seamless Windows audio endpoint switching (e.g. headphones to speakers) without streaming drops or silence freezing.",
        "**Equalizer Decay Smoothing**: Eliminated non-sequential decay artifacts and silence flickering on sudden volume dropouts.",
        "**Settings & Application UI**: Expanded workstation layout with improved spacing and unified navigation across settings modals.",
        "**Version Synchronization Pipeline**: Integrated automated changelog compilation into `scripts/sync-version.js` (`src/data/changelog.ts`)."
      ],
      "Fixed": [
        "**Wave Vector Direction Alignment**: Corrected visualizer wave propagation vectors to match physical keyboard layouts."
      ]
    },
    "bullets": [
      "[Added] **Modular Studio Lighting & Visualizer Architecture**: Refactored the core lighting and streaming engine into dedicated submodules (`audio`, `effects`, `geometry`, `palettes`, `sidelights`, `visualizer-engine`).",
      "[Added] **Background & Minimized Streaming Engine**: Implemented a hybrid timer mechanism ensuring continuous real-time RGB streaming even when the Studio window is minimized or running in the background (bypassing Chromium throttling).",
      "[Added] **Studio Lighting Persistence**: Full persistence of all visualizer settings, audio sensitivity, background floor, direction, and color modes in `localStorage` and `electronAPI`.",
      "[Added] **Bass Shockwave Audio Mode**: Radial expanding shockwave anchored to keyboard physical center (Key P / matrix center) with bidirectional spatial velocity.",
      "[Added] **Customizable Idle Background Wave Direction**: Granular animation direction controls (Left-to-Right, Right-to-Left, Center-to-Outward, Outward-to-Center) for ambient lighting under Graphic Equalizer and Bass Shockwave.",
      "[Added] **Audio Visualizer Color Styles**: Dynamic Wave / ROYGBIV Rainbow Spectrum, Unified Monochromatic, and Frequency-Banded color mapping with a configurable 0%–100% idle floor brightness.",
      "[Added] **Integrated Release Notes Browser**: In-app modal viewer with decoupled Studio and Firmware release notes (`ChangelogViewer.tsx`).",
      "[Changed] **Audio Stream Resilience & Watchdog**: Auto-reconnect and watchdog monitoring for seamless Windows audio endpoint switching (e.g. headphones to speakers) without streaming drops or silence freezing.",
      "[Changed] **Equalizer Decay Smoothing**: Eliminated non-sequential decay artifacts and silence flickering on sudden volume dropouts.",
      "[Changed] **Settings & Application UI**: Expanded workstation layout with improved spacing and unified navigation across settings modals.",
      "[Changed] **Version Synchronization Pipeline**: Integrated automated changelog compilation into `scripts/sync-version.js` (`src/data/changelog.ts`).",
      "[Fixed] **Wave Vector Direction Alignment**: Corrected visualizer wave propagation vectors to match physical keyboard layouts."
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
        "**High-Speed WebHID Protocol Engine**: Direct USB packet communication with QMK firmware (`0xFF60` raw HID).",
        "**Dual Reactive RGB Engine**: Real-time canvas preview and simultaneous configuration of base animations and reactive keystroke layers.",
        "**60 FPS WASAPI Audio Visualizer**: Live audio frequency loopback analyzer streaming directly to keyboard matrix LEDs.",
        "**Rotary Encoder Customizer**: Dynamic mapping of clockwise, counter-clockwise, and button press functions.",
        "**Interactive Keyboard Matrix Tester**: Visual keystroke and latency verification.",
        "**Universal Backup & Cloud Profile Migration**: JSON profile snapshot export/import."
      ]
    },
    "bullets": [
      "[Added] **Full Architecture Rewrite**: Modern React 19 + TypeScript + Zustand companion suite.",
      "[Added] **High-Speed WebHID Protocol Engine**: Direct USB packet communication with QMK firmware (`0xFF60` raw HID).",
      "[Added] **Dual Reactive RGB Engine**: Real-time canvas preview and simultaneous configuration of base animations and reactive keystroke layers.",
      "[Added] **60 FPS WASAPI Audio Visualizer**: Live audio frequency loopback analyzer streaming directly to keyboard matrix LEDs.",
      "[Added] **Rotary Encoder Customizer**: Dynamic mapping of clockwise, counter-clockwise, and button press functions.",
      "[Added] **Interactive Keyboard Matrix Tester**: Visual keystroke and latency verification.",
      "[Added] **Universal Backup & Cloud Profile Migration**: JSON profile snapshot export/import."
    ]
  }
];

export const LATEST_RELEASE = STUDIO_CHANGELOG[0] || null;

export default STUDIO_CHANGELOG;
