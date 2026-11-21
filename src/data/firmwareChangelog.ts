/**
 * LuxQMK Firmware Changelog Database
 * Automatically generated from qmk_firmware/CHANGELOG.md by scripts/sync-version.js. DO NOT EDIT DIRECTLY.
 */

import { ChangelogRelease } from './changelog';

export const FIRMWARE_CHANGELOG: ChangelogRelease[] = [
  {
    "version": "0.3.6",
    "date": "2026-11-21",
    "sections": {
      "Changed": [
        "**QMK Upstream Base (`v0.34.8`)**: Merged `qmk/qmk_firmware` `master` into `develop`, including the ChibiOS EP0 control OUT buffer sizing fix (`tmk_core/protocol/chibios/usb_main.c`) for STM32 USBv1 and WB32 MCUs."
      ]
    },
    "bullets": [
      "[Changed] **QMK Upstream Base (`v0.34.8`)**: Merged `qmk/qmk_firmware` `master` into `develop`, including the ChibiOS EP0 control OUT buffer sizing fix (`tmk_core/protocol/chibios/usb_main.c`) for STM32 USBv1 and WB32 MCUs."
    ]
  },
  {
    "version": "0.3.5",
    "date": "2026-10-01",
    "sections": {
      "Added": [
        "**Decoupled Layer Background Dimming**: Dedicated brightness dimming controls (`g_layer_dim_enable`, `g_layer_dim_levels[4]`) independent of layer key highlight colors.",
        "**macOS Base Transparency**: Layer 2 (macOS Base) has dimming and key highlighting disabled by default (`0x0B` bitmask) for seamless ambient backlighting.",
        "**Mac Layout Support for GMMK 3**: Pre-populated Mac Base (Layer 2) and Mac Fn (Layer 3) across all GMMK 3 ANSI/ISO VIA keymaps."
      ],
      "Changed": [
        "**Modular Userspace Architecture**: Refactored `users/luxqmk/luxqmk.c` into modular C submodules (`luxqmk_eeprom.c`, `luxqmk_protocol.c`, `luxqmk_reactive.c`, `luxqmk_gradients.c`).",
        "**Enhanced Keychron Catalog Tier**: Elevated Keychron V & Q series keyboards to `luxqmk_enhanced` tier with optimized matrix descriptors.",
        "**4-Layer Authentic Display**: Aligned layer lighting enable bitmasks to support live 4-layer EEPROM highlight and dimming persistence."
      ],
      "Fixed": [
        "**Combined Active Layer Reporting**: Fixed `USER_VAL_ACTIVE_LAYER` raw HID query to report combined `layer_state` and `default_layer_state`.",
        "**Keychron Target Definitions**: Corrected Keychron build targets to use `default` keymap with userspace hooks."
      ]
    },
    "bullets": [
      "[Added] **Decoupled Layer Background Dimming**: Dedicated brightness dimming controls (`g_layer_dim_enable`, `g_layer_dim_levels[4]`) independent of layer key highlight colors.",
      "[Added] **macOS Base Transparency**: Layer 2 (macOS Base) has dimming and key highlighting disabled by default (`0x0B` bitmask) for seamless ambient backlighting.",
      "[Added] **Mac Layout Support for GMMK 3**: Pre-populated Mac Base (Layer 2) and Mac Fn (Layer 3) across all GMMK 3 ANSI/ISO VIA keymaps.",
      "[Changed] **Modular Userspace Architecture**: Refactored `users/luxqmk/luxqmk.c` into modular C submodules (`luxqmk_eeprom.c`, `luxqmk_protocol.c`, `luxqmk_reactive.c`, `luxqmk_gradients.c`).",
      "[Changed] **Enhanced Keychron Catalog Tier**: Elevated Keychron V & Q series keyboards to `luxqmk_enhanced` tier with optimized matrix descriptors.",
      "[Changed] **4-Layer Authentic Display**: Aligned layer lighting enable bitmasks to support live 4-layer EEPROM highlight and dimming persistence.",
      "[Fixed] **Combined Active Layer Reporting**: Fixed `USER_VAL_ACTIVE_LAYER` raw HID query to report combined `layer_state` and `default_layer_state`.",
      "[Fixed] **Keychron Target Definitions**: Corrected Keychron build targets to use `default` keymap with userspace hooks."
    ]
  },
  {
    "version": "0.3.4",
    "date": "2026-09-28",
    "sections": {
      "Added": [
        "**Custom Lock LED Indicators**: Real-time configurable Lock LED indicators (Caps, Num, Scroll, Win Lock) with Keychron and GMMK 3 board support.",
        "**Dynamic Matrix Catalog Generator**: Python-based matrix sharder supporting up to 22 concurrent runners with hardware thread weighting."
      ],
      "Fixed": [
        "**EEPROM Stack Buffer Guard**: Expanded `luxqmk_eeprom_save` header buffer to 160 bytes to prevent stack overflow during DIP switch persistence.",
        "**DIP Switch Board Handler**: Prevented board-level handler override on Keychron hardware DIP switches."
      ]
    },
    "bullets": [
      "[Added] **Custom Lock LED Indicators**: Real-time configurable Lock LED indicators (Caps, Num, Scroll, Win Lock) with Keychron and GMMK 3 board support.",
      "[Added] **Dynamic Matrix Catalog Generator**: Python-based matrix sharder supporting up to 22 concurrent runners with hardware thread weighting.",
      "[Fixed] **EEPROM Stack Buffer Guard**: Expanded `luxqmk_eeprom_save` header buffer to 160 bytes to prevent stack overflow during DIP switch persistence.",
      "[Fixed] **DIP Switch Board Handler**: Prevented board-level handler override on Keychron hardware DIP switches."
    ]
  },
  {
    "version": "0.3.3",
    "date": "2026-09-25",
    "sections": {
      "Added": [
        "**Hardware DIP Switches**: Configurable hardware DIP switches (Mac/Win 2-position & multi-position) in EEPROM & WebHID protocol."
      ],
      "Fixed": [
        "**Inverted Switch Mapping**: Aligned physical switch position defaults (`pos0` = Mac/Left, `pos1` = Win/Right)."
      ]
    },
    "bullets": [
      "[Added] **Hardware DIP Switches**: Configurable hardware DIP switches (Mac/Win 2-position & multi-position) in EEPROM & WebHID protocol.",
      "[Fixed] **Inverted Switch Mapping**: Aligned physical switch position defaults (`pos0` = Mac/Left, `pos1` = Win/Right)."
    ]
  },
  {
    "version": "0.3.2",
    "date": "2026-09-22",
    "sections": {
      "Added": [
        "**Universal VIA Compilation**: Native `VIA_ENABLE = yes` enabled across all keyboards compiled with LuxQMK userspace.",
        "**Dynamic Hardware Feature Extraction**: Added VIA support tags and dynamic hardware capabilities extraction in catalog generator."
      ],
      "Fixed": [
        "**ISO Keymap Layout Macros**: Corrected keymap layout macros for GMMK 2 (65% & 96%) and GMMK 3 ISO models."
      ]
    },
    "bullets": [
      "[Added] **Universal VIA Compilation**: Native `VIA_ENABLE = yes` enabled across all keyboards compiled with LuxQMK userspace.",
      "[Added] **Dynamic Hardware Feature Extraction**: Added VIA support tags and dynamic hardware capabilities extraction in catalog generator.",
      "[Fixed] **ISO Keymap Layout Macros**: Corrected keymap layout macros for GMMK 2 (65% & 96%) and GMMK 3 ISO models."
    ]
  },
  {
    "version": "0.3.1",
    "date": "2026-09-18",
    "sections": {
      "Added": [
        "**Runtime NKRO Toggle**: Added runtime NKRO state toggle over WebHID protocol alongside permanent boot NKRO."
      ]
    },
    "bullets": [
      "[Added] **Runtime NKRO Toggle**: Added runtime NKRO state toggle over WebHID protocol alongside permanent boot NKRO."
    ]
  },
  {
    "version": "0.3.0",
    "date": "2026-09-15",
    "sections": {
      "Added": [
        "**Dual-Layer Compositing Engine**: Layer 0 Base Ambient Matrix (41+ effects) + Layer 1 Keystroke Reactive Overlay (Fade, Splash, Splash Rainbow, Cross, Nexus, Wide, Heatmap).",
        "**Multi-Stop Gradient Engine**: Custom gradient sampling with CIE1931 lightness curve correction (`luxqmk_gradients.c`).",
        "**Modular Hardware Abstraction Layer (HAL)**: Hardware abstraction for GMMK 3 (100%, 75%, 65%), GMMK 2 (96%, 65%), Keychron, and Generic QMK boards.",
        "**Direct Software Streaming**: Atomic double-buffering for live 60 FPS studio lighting.",
        "**Permanent Boot NKRO Enforcement**: High-speed 1000Hz (1ms) USB polling with forced NKRO upon MCU boot.",
        "**WebHID Raw Protocol**: Custom 32-byte packet dispatch for real-time bidirectional communication with LuxQMK Studio."
      ]
    },
    "bullets": [
      "[Added] **Dual-Layer Compositing Engine**: Layer 0 Base Ambient Matrix (41+ effects) + Layer 1 Keystroke Reactive Overlay (Fade, Splash, Splash Rainbow, Cross, Nexus, Wide, Heatmap).",
      "[Added] **Multi-Stop Gradient Engine**: Custom gradient sampling with CIE1931 lightness curve correction (`luxqmk_gradients.c`).",
      "[Added] **Modular Hardware Abstraction Layer (HAL)**: Hardware abstraction for GMMK 3 (100%, 75%, 65%), GMMK 2 (96%, 65%), Keychron, and Generic QMK boards.",
      "[Added] **Direct Software Streaming**: Atomic double-buffering for live 60 FPS studio lighting.",
      "[Added] **Permanent Boot NKRO Enforcement**: High-speed 1000Hz (1ms) USB polling with forced NKRO upon MCU boot.",
      "[Added] **WebHID Raw Protocol**: Custom 32-byte packet dispatch for real-time bidirectional communication with LuxQMK Studio."
    ]
  }
];

export const LATEST_FIRMWARE_RELEASE = FIRMWARE_CHANGELOG[0] || null;

export default FIRMWARE_CHANGELOG;
