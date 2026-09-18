/**
 * LuxQMK Studio - Internationalization (i18n) Module
 * English (en) is the foundational base language.
 * Polish (pl) is fully synchronized with professional localization.
 */

(function () {
  const translations = {
    en: {
      appName: "LuxQMK Studio",
      appSubtitle: "QMK / VIA Configuration Hub",
      lblDeviceStatus: "Device Status:",
      statusConnected: "Connected",
      statusDisconnected: "Disconnected",
      btnConnect: "Connect Keyboard",
      btnDisconnect: "Disconnect",
      btnRefresh: "Refresh",
      btnCheckUpdates: "Check for Updates",
      btnAboutApp: "About & Author",
      btnOk: "OK",
      modalAboutTitle: "About LuxQMK Studio",
      lblAuthorTitle: "Project Author",
      lblAuthorName: "Dorian Piwnik",
      lblAuthorRole: "Creator & Lead Developer of the LuxQMK Project",
      lblLicenseTitle: "License",
      lblLicenseDesc: "• <strong>LuxQMK Studio Application</strong>: Open Source MIT License<br>• <strong>LuxQMK Firmware</strong>: GNU General Public License v2 / v3 (GPL)",
      lblWebsiteTitle: "Project Website",
      lblGithubTitle: "GitHub",
      lblWebsiteStatus: "(Official documentation and website coming soon)",
      lblLegalTitle: "Legal Notices & Disclaimer",
      lblLegalDesc: "LuxQMK Studio is an independent companion configuration suite developed for keyboards running LuxQMK custom firmware (fork of QMK Firmware) communicating via standard WebHID / VIA protocol channels.<br><br>QMK Firmware is open-source software licensed under GPLv2+. VIA is an open configuration protocol standard.<br><br>All product names, logos, trademarks, and registered trademarks (including Glorious, GMMK 3, GMMK 2, WB32) are property of their respective owners and are used solely for identification and compatibility purposes.",
      msgUpdateCheckTitle: "LuxQMK Studio Updates",
      msgUpdateCheckLatest: "You are running the latest version of LuxQMK Studio (v1.0.0). Automatic update downloads will be available soon!",
      tooltipAddDevice: "Add / Pair New Device (+)",
      optSearchingDevices: "Searching for devices...",
      optNoDevices: "No devices found (Click + to connect)",
      lblActiveDevice: "(Active)",
      lblConnectedDevices: "Authorized Devices",
      optAddNewDevice: "Add / Connect new device...",

      // Navigation
      navKeymap: "Keymap Editor",
      navLighting: "Lighting Studio",
      navAudio: "Audio Visualizer",
      navEncoder: "Rotary Knob",
      navTester: "Key Tester",
      navBackup: "Profiles & Backup",
      navSettings: "Device Settings",

      // View Titles & Subtitles
      viewKeymapTitle: "Visual Keymap Editor",
      viewKeymapSubtitle: "Real-time key assignment for hardware layers 0 to 2",
      viewLightingTitle: "Lighting Studio",
      viewLightingSubtitle: "RGB animations, dual-layer overlay, and lock indicators",
      viewAudioTitle: "Real-Time Audio Visualizer",
      viewAudioSubtitle: "Dynamic lighting synchronized with music, beat, and games",
      viewEncoderTitle: "Rotary Knob Configuration",
      viewEncoderSubtitle: "Assign Clockwise, Counter-Clockwise, and Press actions",
      viewTesterTitle: "Interactive Key Tester",
      viewTesterSubtitle: "Test hardware key presses, responsiveness, and anti-ghosting",
      viewBackupTitle: "Profiles & Layout Backups",
      viewBackupSubtitle: "Save, export, and restore complete keyboard memory snapshots",
      viewSettingsTitle: "Device Settings & Tools",
      viewSettingsSubtitle: "Firmware utilities, EEPROM factory reset, and bootloader",

      // Keymap
      layer0: "Layer 0 (Base)",
      layer1: "Layer 1 (Fn)",
      layer2: "Layer 2 (Custom)",
      selectedKeyDefault: "Click any keycap on the keyboard to remap it",
      selectedKeyActive: "Assigning key:",
      layerLabel: "Layer",
      assignedLabel: "Assigned:",

      // Categories
      catBasic: "Basic",
      catMedia: "Media",
      catMacro: "Macro",
      catLayers: "Layers",
      catSpecial: "Special",
      catLighting: "Lighting",
      catCustom: "Custom (LuxQMK)",

      // Knob
      rotCCW: "↺ Rotate Left (CCW)",
      rotCW: "↻ Rotate Right (CW)",
      knobPress: "🔘 Knob Press (Click)",

      // Lighting Tabs
      tabBacklight: "Main Backlight",
      tabReactive: "Reactive Layer",
      tabWinLock: "Win Lock",
      tabLayers: "Layer Lighting",
      tabLogo: "Logo & Locks",
      lightingLivePreviewTitle: "Live Lighting Preview & RGB Visualizer (1:1 QMK)",
      btnHoldFn: "🔘 Hold Fn",

      // Lighting Controls
      lblBrightness: "Master Brightness",
      lblEffect: "Lighting Effect",
      lblSpeed: "Animation Speed",
      lblRgbColor: "Effect Color",
      lblReverse: "Reverse Animation Direction",
      lblLayerLightingEnable: "Dim Inactive & Highlight Active Keys",
      lblLayerDimLevel: "Inactive Keys Brightness",
      lblLayer1Color: "Layer 1 Color (Fn)",
      lblLayer2Color: "Layer 2 Color (Custom)",
      lblLayer3Color: "Layer 3 Color (Custom)",
      layerColorsTitle: "Active Layer Colors",
      layer1ColorDesc: "Active function keys, media controls",
      layer2ColorDesc: "Custom key mappings and macros",
      layer3ColorDesc: "Additional layer 3 assignments",
      hintSingleColor: "Set color for single-color effects",
      hintRainbowColor: "Rainbow effect (uses full color spectrum)",
      lblLogoMode: "Logo Mode",

      // Reactive Layer Overlay
      reactiveSectionTitle: "⚡ Reactive Layer (Dual-Layer Overlay)",
      reactiveDesc: "Layer a reactive keystroke effect directly on top of your background animation.",
      lblReactiveEnable: "Enable Reactive Overlay on Background",
      lblReactiveEffect: "Reactive Effect",
      optReactiveOff: "Disabled",
      optReactiveFade: "Reactive Fade",
      optReactiveSplash: "Splash Ripple (Single Color)",
      optReactiveSplashRainbow: "Splash Ripple (Rainbow)",
      optReactiveCross: "Reactive Cross (+)",
      optReactiveNexus: "Reactive Nexus (X)",
      optReactiveWide: "Reactive Wide Wave",
      optReactiveHeatmap: "Typing Heatmap",
      lblReactiveColor: "Reactive Effect Color",
      lblReactiveColorHint: "Color of ripples and reactive flashes",
      lblReactiveSpeed: "Reaction Duration / Speed",
      lblReactiveBlend: "Blend Mode",
      optBlendAdditive: "Additive Glow (Additive)",
      optBlendOverride: "Solid Override",

      // Win Lock Indicator
      winLockSectionTitle: "🔒 Windows Key Lock (Win Lock)",
      winLockDesc: "Configure the Windows key LED behavior when Win Lock is toggled (default Fn + Win).",
      lblWinLockMode: "Win Lock LED Behavior",
      optWinLockAnim: "Default: Do nothing (continue animation)",
      optWinLockOff: "Turn off LED (LED Off)",
      optWinLockColor: "Set custom color (Custom Color)",
      lblWinLockColor: "Win Lock Indicator Color",
      lblWinLockColorHint: "Color of the Win key LED when locked",
      lblWinLockToggle: "Toggle Win Lock (Fn + Win)",
      lblWinLockToggleHint: "Test Windows key GUI lock state",

      // Logo LED & 7 Lock Indicators
      logoSubtitle: "Configure Glorious badge LED behavior and lock indicator colors next to the knob.",
      optLogoRgb: "RGB Matrix Effect (Default)",
      optLogoLockRgb: "Lock Indicator (RGB when inactive)",
      optLogoLockOff: "Lock Indicator (Off when inactive)",
      logoCapsDesc: "Caps Lock indicator (#FF0000)",
      logoNumDesc: "Num Lock indicator (#001EFF)",
      logoScrollDesc: "Scroll Lock indicator (#32FF00)",
      logoCapsNumDesc: "Caps + Num Lock active (#FF3200)",
      logoCapsScrollDesc: "Caps + Scroll Lock active (#FFFF00)",
      logoNumScrollDesc: "Num + Scroll Lock active (#00C8FF)",
      logoAllDesc: "All 3 locks active (#FFFFFF)",

      // Audio Visualizer
      audioCardTitle: "🎵 Real-Time Audio Visualizer & Spectrum",
      audioDesc: "Synchronize your keyboard LEDs to music, YouTube, Spotify, and gaming sounds in real time.",
      btnAudioStart: "▶️ Start Audio Visualizer",
      btnAudioStop: "⏹️ Stop Audio Visualizer",
      audioStatusActive: "Active (Live 60 FPS)",
      audioStatusStopped: "Stopped",
      audioMode: "Visualization Mode",
      optEqualizer: "Graphic Equalizer (Spectrum Column Bars)",
      optBassPulse: "Bass Pulse (Beat Drop Reaction)",
      optAudioWave: "Audio Wave (Energy Ripples)",
      optVuMeter: "Stereo VU Meter (Left/Right Channel Level)",
      audioColorMode: "Color Palette",
      optColorRainbow: "Dynamic Rainbow Spectrum",
      optColorSingle: "Custom Accent Color",
      lblAudioSingleColor: "Audio Accent Color",
      lblAudioSingleColorHint: "Color of frequency bars and pulses",
      audioSensitivity: "Audio Sensitivity Multiplier",
      lblAutostart: "Launch LuxQMK Studio on Windows Startup",
      lblAutostartHint: "Runs quietly in the System Tray and operates audio visualizers in the background",
      lblDesktopAutostart: "Launch LuxQMK Studio on Windows Startup",

      // Key Tester
      testedKeys: "Tested Keys:",
      btnResetTest: "🔄 Reset Test",
      testerRecentKeys: "Recently pressed keys:",

      // Profiles & Backup Checklist & Buttons
      backupTitle: "Create Complete Backup",
      backupDesc: "Download a full snapshot of keymaps, layers, encoder, RGB, and custom settings.",
      backupFeatureLayers: "✓ 3 Hardware Keymap Layers (Base, Fn, Custom)",
      backupFeatureEncoder: "✓ Rotary Knob Configuration (CCW, CW, Press)",
      backupFeatureMacros: "✓ Macro Memory & Dynamic Keycodes",
      backupFeatureRgb: "✓ RGB Matrix Lighting Mode, Speed & Brightness",
      backupFeatureCustom: "✓ Custom Layer Colors, Dim Level & 7 Logo Lock Indicators",
      btnDownloadBackup: "💾 Download JSON Backup File",
      backupProgressReading: "Reading data from keyboard...",
      backupProgressGenerating: "Generating .JSON file...",
      backupProgressDone: "Completed!",

      // Restore
      restoreTitle: "Restore from Backup",
      restoreDesc: "Upload a previously exported JSON backup file to flash it back to keyboard memory.",
      dropzoneTextTitle: "Click or drag & drop backup file here",
      dropzoneText: "Accepts JSON configuration snapshots exported from LuxQMK Studio",
      btnFlashBackup: "⚡ Restore & Flash to Keyboard Memory",
      restoreProgressWriting: "Writing settings to EEPROM memory...",
      restoreProgressRefreshing: "Refreshing interface...",
      restoreProgressDone: "Restored 100%!",

      // File Preview
      lblStatLayers: "Layers:",
      lblStatEncoder: "Encoder:",
      lblStatRgb: "RGB:",
      lblStatCustom: "LuxQMK:",
      valStatLayers: "{count} Layers",
      valStatProfiles: "{count} Profiles",
      valStatCustom: "7 Locks + Layers",
      valStatNone: "None",
      valStatStandard: "Standard",

      // Console
      consoleTitle: "Hardware HID Communication Console",
      btnClearLog: "Clear Console",
      consoleInitialLog: "Ready. Connect keyboard via WebHID to start transmission.",
      consoleCleared: "Console cleared.",

      // Badges
      badgeEnabled: "Enabled",
      badgeDisabled: "Disabled",
      badgeLocked: "Locked",
      badgeUnlocked: "Unlocked",
      badgeLayerActive: "🎨 Layer {layer} Active • Dimming: {dim}%",
      badgeReactiveActive: "⚡ Reactive Layer: Enabled ({mode})",
      badgeReactiveDisabled: "⚡ Reactive Layer: Disabled",
      badgeLogoPreview: "💎 Logo & Knob Lock Indicator Preview",
      badgeWinLockPreview: "🔒 Windows Key Lock Preview (Win Lock)",
      badgeEffectBrightness: "{name} • {pct}% Brightness",

      // Device Settings
      btnBootloader: "🚀 Reboot to Bootloader (DFU Mode)",
      btnResetEeprom: "⚠️ Factory Reset EEPROM",

      // Toasts & Alerts
      toastConnected: "Connected to: {name}",
      toastAutoConnected: "Automatically connected to: {name}",
      toastNewConnected: "Connected new device: {name}",
      toastSwitchingDevice: "Switching device...",
      toastSwitchError: "Error switching device: {err}",
      toastRefreshing: "Refreshing data from keyboard...",
      toastRefreshed: "Data refreshed successfully!",
      toastRefreshError: "Error refreshing: {err}",
      toastCreatingBackup: "Creating complete keyboard backup...",
      toastBackupDownloaded: "Backup file downloaded successfully!",
      toastBackupError: "Error creating backup: {err}",
      toastRestoring: "Flashing backup to keyboard memory...",
      toastRestored: "All settings restored successfully!",
      toastRestoreError: "Error restoring backup: {err}",
      toastSelectValidBackup: "Please select a valid .JSON backup file!",
      toastBootloaderReboot: "Keyboard rebooting to Bootloader (DFU)...",
      toastEepromReset: "EEPROM reset command sent! Reconnecting...",
      confirmBootloader: "Are you sure you want to reboot the keyboard into Bootloader (DFU Mode)? You will need to flash or replug the keyboard to exit.",
      confirmResetEEPROM: "WARNING: This will reset all keymaps and EEPROM settings back to factory defaults. Are you sure you want to proceed?",
      toastAudioStarted: "Audio Visualizer started",
      toastAudioError: "Audio error: {err}",
      toastAutostartEnabled: "Windows startup launch enabled",
      toastAutostartDisabled: "Windows startup launch disabled",
      logConnected: "Keyboard connected successfully via WebHID",
      logConnectedDevice: "Connected to device: {name} (0xFF60:0x61)",
      logDisconnected: "Keyboard disconnected",
      logDeviceCancelled: "Device selection cancelled",
      errorWebHidNotSupported: "WebHID is not supported in this browser",
      logEepromResetSending: "Sending EEPROM factory reset command (VIA DYNAMIC_KEYMAP_RESET)...",
      logEepromResetSuccess: "EEPROM factory reset command sent successfully",
      
      // Settings View - Performance & Latency
      cardPerformanceTitle: "Performance & Input Latency",
      cardPerformanceSubtitle: "Configure switch debounce filtering, NKRO rollover mode, and USB polling rate",
      lblDebounceTime: "Debounce Time / Input Latency",
      descDebounce: "Filters mechanical contact vibrations (switch chatter). 0–2 ms offers ultra-fast esports response; 16 ms provides safe operation preventing accidental double clicks on older switches.",
      debounce0: "0 ms (Esports / Eager)",
      debounce2: "2 ms (Ultra Fast)",
      debounce5: "5 ms (Balanced QMK)",
      debounce8: "8 ms (Standard)",
      debounce16: "16 ms (Safe / Glorious Core)",
      lblNkroMode: "N-Key Rollover (NKRO) Mode",
      descNkro: "Enables registration of unlimited simultaneous key presses without the 6-key USB limitation.",
      nkroActiveBadge: "Active: Full NKRO Mode (Unlimited Keys)",
      nkroDisabledBadge: "Active: 6KRO Mode (6-Key Limit)",
      lblPollingRate: "USB Polling Rate (Frequency)",
      descPollingRate: "How often the USB controller reports keyboard state to the computer.",
      polling1000: "1000 Hz (1.0 ms) - Default",
      polling2000: "2000 Hz (0.5 ms)",
      polling4000: "4000 Hz (0.25 ms)",
      polling8000: "8000 Hz (0.125 ms)",
      polling500: "500 Hz (2.0 ms)",
      polling125: "125 Hz (8.0 ms)",

      // Settings View - Hardware Info
      cardHardwareTitle: "Hardware Information & Diagnostics",
      cardHardwareSubtitle: "Controller specifications, memory status, and communication protocols",
      lblKeyboardModel: "Keyboard Model:",
      valKeyboardModel: "Glorious GMMK 3 100% ANSI",
      lblMcuChip: "MCU Microcontroller:",
      valMcuChip: "WB32FQ95 (ARM Cortex-M4)",
      lblUsbVidPid: "USB VID / PID:",
      valUsbVidPid: "VID: 0x504B | PID: 0x320F",
      lblProtocolVersion: "Firmware & Engine:",
      valProtocolVersion: "LuxQMK v0.1.0 (QMK v0.34.4 / VIA v12)",
      lblMatrixLayout: "Physical Matrix:",
      valMatrixLayout: "14 Rows × 8 Cols (112 Key Positions)",
      lblEepromSize: "Custom EEPROM Buffer:",
      valEepromSize: "32 Bytes Dedicated Storage",
      lblCompatibilityStatus: "Compatibility Status:",
      valCompatibilityStatus: "✓ Fully Compatible (LuxQMK Studio v1.0.0)",
      statusFwCompatible: "✓ Fully Compatible (LuxQMK Studio v1.0.0)",
      statusFwUpdateRequired: "⚠️ Firmware Update Required (LuxQMK v0.1.0+ recommended)",
      statusFwNewer: "ℹ️ Newer Firmware Detected (Update LuxQMK Studio)",
      statusFwLegacy: "⚠️ Legacy Firmware (Basic features only)",

      // Settings View - Maintenance Tools
      cardMaintenanceTitle: "Maintenance & EEPROM Tools",
      cardMaintenanceSubtitle: "Advanced operations on controller memory and flashing mode",
      lblBootloaderTitle: "Reboot to Bootloader (DFU Mode)",
      btnBootloaderDesc: "Puts the keyboard into DFU Bootloader mode for flashing new firmware (.bin/.hex).",
      lblResetEepromTitle: "Factory Reset EEPROM",
      btnResetEepromDesc: "Clears keyboard EEPROM memory and restores factory default keymaps, lighting, and macros.",
      lblQuickBackupTitle: "Quick Profile Backup",
      btnQuickBackupDesc: "Quickly export a full snapshot of your current layers and lighting configuration.",
      btnQuickBackup: "💾 Export Profile Backup",

      // Dialogs & Toast messages
      toastDebounceSet: "Debounce latency set to: {val}",
      toastNkroSet: "NKRO mode updated: {mode}",
      toastPollingSet: "USB Polling Rate set to: {hz}",
      toastResetEepromSuccess: "EEPROM reset successfully! Restored factory defaults.",
      toastBootloaderSuccess: "Keyboard rebooted into DFU Bootloader mode."
    },

    pl: {
      appName: "LuxQMK Studio",
      appSubtitle: "Centrum Konfiguracji QMK / VIA",
      lblDeviceStatus: "Status Urządzenia:",
      statusConnected: "Połączono",
      statusDisconnected: "Rozłączono",
      btnConnect: "Połącz Klawiaturę",
      btnDisconnect: "Rozłącz",
      btnRefresh: "Odśwież",
      btnCheckUpdates: "Sprawdź aktualizacje",
      btnAboutApp: "O programie i Autor",
      btnOk: "OK",
      modalAboutTitle: "O programie LuxQMK Studio",
      lblAuthorTitle: "Autor projektu",
      lblAuthorName: "Dorian Piwnik",
      lblAuthorRole: "Główny twórca i programista projektu LuxQMK",
      lblLicenseTitle: "Licencja",
      lblLicenseDesc: "• <strong>Aplikacja LuxQMK Studio</strong>: Open Source MIT License<br>• <strong>Firmware LuxQMK</strong>: GNU General Public License v2 / v3 (GPL)",
      lblWebsiteTitle: "Strona projektu",
      lblGithubTitle: "GitHub",
      lblWebsiteStatus: "(Oficjalna strona i repozytorium w przygotowaniu — wkrótce)",
      lblLegalTitle: "Informacje prawne i nota licencyjna",
      lblLegalDesc: "LuxQMK Studio jest niezależnym oprogramowaniem towarzyszącym do konfiguracji klawiatur bazującym na protokole WebHID oraz VIA. Komponenty firmware stanowią zmodyfikowany fork QMK Firmware na licencji GNU GPL v2/v3.<br><br>QMK Firmware jest oprogramowaniem open-source na licencji GPLv2+. VIA jest otwartym standardem protokołu konfiguracji.<br><br>Wszelkie nazwy produktów, logotypy, znaki towarowe i zarejestrowane znaki handlowe (w tym Glorious, GMMK 3, GMMK 2, WB32) należą do ich prawnych właścicieli i zostały użyte wyłącznie w celach informacyjnych oraz identyfikacji kompatybilności sprzętowej.",
      msgUpdateCheckTitle: "Aktualizacje LuxQMK Studio",
      msgUpdateCheckLatest: "Posiadasz najnowszą wersję LuxQMK Studio (v1.0.0). Automatyczne pobieranie aktualizacji z poziomu programu będzie dostępne wkrótce!",
      tooltipAddDevice: "Dodaj / Połącz nowe urządzenie (+)",
      optSearchingDevices: "Wyszukiwanie urządzeń...",
      optNoDevices: "Brak urządzeń (Kliknij + aby połączyć)",
      lblActiveDevice: "(Aktywna)",
      lblConnectedDevices: "Podłączone urządzenia",
      optAddNewDevice: "Dodaj / Połącz nowe urządzenie...",

      // Navigation
      navKeymap: "Mapowanie Klawiszy",
      navLighting: "Studio Oświetlenia",
      navAudio: "Wizualizer Audio",
      navEncoder: "Pokrętło (Enkoder)",
      navTester: "Tester Klawiszy",
      navBackup: "Profile i Kopia",
      navSettings: "Ustawienia Urządzenia",

      // View Titles & Subtitles
      viewKeymapTitle: "Wizualny Edytor Układu",
      viewKeymapSubtitle: "Mapowanie klawiszy w czasie rzeczywistym dla warstw 0-2",
      viewLightingTitle: "Studio Oświetlenia RGB",
      viewLightingSubtitle: "Efekty podświetlenia, warstwy reaktywne i wskaźniki blokad",
      viewAudioTitle: "Wizualizer Audio w Czasie Rzeczywistym",
      viewAudioSubtitle: "Reakcja podświetlenia klawiatury na muzykę, basy i dźwięk z komputera",
      viewEncoderTitle: "Konfiguracja Pokrętła (Enkodera)",
      viewEncoderSubtitle: "Przypisz akcje dla obrotu w lewo, w prawo oraz wciśnięcia",
      viewTesterTitle: "Interaktywny Tester Klawiszy",
      viewTesterSubtitle: "Sprawdź rejestrację klawiszy, czas reakcji i anti-ghosting",
      viewBackupTitle: "Profile i Kopie Zapasowe",
      viewBackupSubtitle: "Zapisuj, eksportuj i przywracaj pełną pamięć klawiatury",
      viewSettingsTitle: "Narzędzia i Ustawienia",
      viewSettingsSubtitle: "Zarządzanie firmware, reset EEPROM i tryb bootloadera",

      // Keymap
      layer0: "Warstwa 0 (Baza)",
      layer1: "Warstwa 1 (Fn)",
      layer2: "Warstwa 2 (Własna)",
      selectedKeyDefault: "Kliknij dowolny klawisz na wirtualnej klawiaturze, aby go zmienić",
      selectedKeyActive: "Zmieniasz klawisz:",
      layerLabel: "Warstwa",
      assignedLabel: "Przypisano:",

      // Categories
      catBasic: "Podstawowe",
      catMedia: "Multimedia",
      catMacro: "Makra",
      catLayers: "Warstwy",
      catSpecial: "Specjalne",
      catLighting: "Podświetlenie",
      catCustom: "Własne (LuxQMK)",

      // Knob
      rotCCW: "↺ Obrót w lewo (CCW)",
      rotCW: "↻ Obrót w prawo (CW)",
      knobPress: "🔘 Wciśnięcie pokrętła (Klik)",

      // Lighting Tabs
      tabBacklight: "Podświetlenie Główne",
      tabReactive: "Warstwa Reaktywna",
      tabWinLock: "Blokada Win (Win Lock)",
      tabLayers: "Podświetlenie Warstw",
      tabLogo: "Dioda Logo i Blokady",
      lightingLivePreviewTitle: "Wizualizacja Oświetlenia na Żywo (1:1 QMK)",
      btnHoldFn: "🔘 Trzymaj Fn",

      // Lighting Controls
      lblBrightness: "Jasność Główna",
      lblEffect: "Efekt Podświetlenia",
      lblSpeed: "Szybkość Animacji",
      lblRgbColor: "Kolor Efektu",
      lblReverse: "Odwróć Kierunek Animacji",
      lblLayerLightingEnable: "Ściemnianie Nieaktywnych i Podświetlanie Aktywnych",
      lblLayerDimLevel: "Jasność Nieaktywnych Klawiszy",
      lblLayer1Color: "Kolor Warstwy 1 (Fn)",
      lblLayer2Color: "Kolor Warstwy 2 (Własna)",
      lblLayer3Color: "Kolor Warstwy 3 (Własna)",
      layerColorsTitle: "Kolory Aktywnych Warstw",
      layer1ColorDesc: "Aktywne klawisze funkcyjne, multimedia",
      layer2ColorDesc: "Klawisze niestandardowe i makra",
      layer3ColorDesc: "Dodatkowe przypisania warstwy 3",
      hintSingleColor: "Ustaw barwę dla efektów jednokolorowych",
      hintRainbowColor: "Efekt tęczowy (używa pełnego spektrum kolorów)",
      lblLogoMode: "Tryb Diody Logo",

      // Reactive Layer Overlay
      reactiveSectionTitle: "⚡ Warstwa Reaktywna (Dual-Layer)",
      reactiveDesc: "Nakładaj efekt reakcji na kliknięcie bezpośrednio na aktywną animację tła.",
      lblReactiveEnable: "Włącz Nakładanie Efektu Reaktywnego na Tło",
      lblReactiveEffect: "Efekt Reaktywny",
      optReactiveOff: "Wyłączony",
      optReactiveFade: "Zwykły Zanik (Reactive Fade)",
      optReactiveSplash: "Fala Kolista (Splash Ripple)",
      optReactiveSplashRainbow: "Fala Tęczowa (Rainbow Splash)",
      optReactiveCross: "Krzyż (Reactive Cross +)",
      optReactiveNexus: "Gwiazda (Reactive Nexus X)",
      optReactiveWide: "Szeroka Fala (Wide Wave)",
      optReactiveHeatmap: "Heatmapa Pisania (Typing Heatmap)",
      lblReactiveColor: "Kolor Błysku Reaktywnego",
      lblReactiveColorHint: "Barwa fali i rozbłysków dla efektów jednokolorowych",
      lblReactiveSpeed: "Czas Trwania / Szybkość Reakcji",
      lblReactiveBlend: "Tryb Mieszania (Blend Mode)",
      optBlendAdditive: "Dodawanie / Rozświetlanie (Additive Glow)",
      optBlendOverride: "Zastąpienie Tła (Solid Override)",

      // Win Lock Indicator
      winLockSectionTitle: "🔒 Blokada Klawisza Win (Win Lock)",
      winLockDesc: "Określ zachowanie diody klawisza Windows, gdy zostanie włączona blokada (domyślnie skrótem Fn + Win).",
      lblWinLockMode: "Tryb Diody przy Win Lock",
      optWinLockAnim: "Domyślnie: Nic nie rób (kontynuuje animacje)",
      optWinLockOff: "Wygaś diodę (LED Off)",
      optWinLockColor: "Ustaw wybrany kolor (Custom Color)",
      lblWinLockColor: "Kolor Wskaźnika Win Lock",
      lblWinLockColorHint: "Barwa diody klawisza Win podczas blokady",
      lblWinLockToggle: "Przełącz Blokadę Win (Fn + Win)",
      lblWinLockToggleHint: "Włącz lub wyłącz stan blokady klawisza GUI",

      // Logo LED & 7 Lock Indicators
      logoSubtitle: "Konfiguruj zachowanie i kolory diody Glorious Badge obok pokrętła.",
      optLogoRgb: "Efekt RGB Matrix (Domyślny)",
      optLogoLockRgb: "Wskaźnik Blokad (RGB gdy nieaktywne)",
      optLogoLockOff: "Wskaźnik Blokad (Wyłączona gdy nieaktywne)",
      logoCapsDesc: "Wskaźnik wielkich liter (#FF0000)",
      logoNumDesc: "Wskaźnik klawiatury numerycznej (#001EFF)",
      logoScrollDesc: "Wskaźnik blokady przewijania (#32FF00)",
      logoCapsNumDesc: "Równoczesna blokada Caps i Num (#FF3200)",
      logoCapsScrollDesc: "Równoczesna blokada Caps i Scroll (#FFFF00)",
      logoNumScrollDesc: "Równoczesna blokada Num i Scroll (#00C8FF)",
      logoAllDesc: "Wszystkie 3 blokady aktywne (#FFFFFF)",

      // Audio Visualizer
      audioCardTitle: "🎵 Wizualizer Audio i Muzyki w Czasie Rzeczywistym",
      audioDesc: "Podświetlenie klawiatury reagujące w czasie rzeczywistym na muzykę (Spotify, YouTube), gry i dźwięki systemowe.",
      btnAudioStart: "▶️ Uruchom Wizualizer Audio",
      btnAudioStop: "⏹️ Zatrzymaj Wizualizer Audio",
      audioStatusActive: "Aktywny (Live 60 FPS)",
      audioStatusStopped: "Zatrzymany",
      audioMode: "Tryb Wizualizacji",
      optEqualizer: "Korektor Graficzny (Equalizer Spectrum - Słupki)",
      optBassPulse: "Pulsowanie Basem (Bass Beat Pulse)",
      optAudioWave: "Fala Dźwiękowa (Audio Wave)",
      optVuMeter: "Wskaźnik Wysterowania (Stereo VU Meter)",
      audioColorMode: "Kolorystyka Wizualizacji",
      optColorRainbow: "Dynamiczne Spektrum Tęczy (Rainbow)",
      optColorSingle: "Własny Kolor Akcentowy",
      lblAudioSingleColor: "Kolor Efektu Audio",
      lblAudioSingleColorHint: "Barwa błysków i słupków equalizera",
      audioSensitivity: "Czułość i Wzmocnienie Dźwięku",
      lblAutostart: "Uruchamiaj aplikację przy starcie systemu Windows",
      lblAutostartHint: "Aplikacja startuje w tle (System Tray) i natychmiast obsługuje efekty dźwiękowe",
      lblDesktopAutostart: "Uruchamiaj LuxQMK Studio przy starcie systemu",

      // Key Tester
      testedKeys: "Przetestowane klawisze:",
      btnResetTest: "🔄 Resetuj Test",
      testerRecentKeys: "Ostatnio wciśnięte klawisze:",

      // Profiles & Backup Checklist & Buttons
      backupTitle: "Utwórz Pełną Kopię Zapasową",
      backupDesc: "Pobierz pełną migawkę mapowania klawiszy, warstw, pokrętła, RGB i ustawień.",
      backupFeatureLayers: "✓ Układ 3 warstw klawiszy (Baza, Fn, Własna)",
      backupFeatureEncoder: "✓ Konfiguracja obrotu pokrętła (CCW/CW) i kliknięcia",
      backupFeatureMacros: "✓ Pamięć makr i skrótów dynamicznych",
      backupFeatureRgb: "✓ Tryb podświetlenia RGB Matrix, prędkość i jasność",
      backupFeatureCustom: "✓ Kolory warstw 1-3, poziom ściemnienia i 7 stanów wskaźników diody Logo",
      btnDownloadBackup: "💾 Pobierz Pełny Backup (.json)",
      backupProgressReading: "Odczytywanie danych z klawiatury...",
      backupProgressGenerating: "Generowanie pliku .JSON...",
      backupProgressDone: "Zakończono!",

      // Restore
      restoreTitle: "Przywracanie z Kopii Zapasowej",
      restoreDesc: "Wgraj wcześniej wyeksportowany plik JSON, aby przywrócić pamięć klawiatury.",
      dropzoneTextTitle: "Kliknij lub przeciągnij plik kopii (.json) tutaj",
      dropzoneText: "Obsługuje pliki konfiguracyjne JSON wyeksportowane z LuxQMK Studio",
      btnFlashBackup: "⚡ Przywróć i Wgraj do Pamięci Klawiatury",
      restoreProgressWriting: "Zapisywanie ustawień do pamięci EEPROM...",
      restoreProgressRefreshing: "Odświeżanie interfejsu...",
      restoreProgressDone: "Przywrócono w 100%!",

      // File Preview
      lblStatLayers: "Warstwy:",
      lblStatEncoder: "Enkoder:",
      lblStatRgb: "RGB:",
      lblStatCustom: "LuxQMK:",
      valStatLayers: "{count} Warstwy",
      valStatProfiles: "{count} Profile",
      valStatCustom: "7 Wskaźników + Warstwy",
      valStatNone: "Brak",
      valStatStandard: "Standard",

      // Console
      consoleTitle: "Konsola Transmisji Sprzętowej HID",
      btnClearLog: "Wyczyść konsolę",
      consoleInitialLog: "Gotowy do pracy. Połącz klawiaturę przez WebHID, aby rozpocząć transmisję.",
      consoleCleared: "Konsola została wyczyszczona.",

      // Badges
      badgeEnabled: "Włączona",
      badgeDisabled: "Wyłączona",
      badgeLocked: "Zablokowany",
      badgeUnlocked: "Odblokowany",
      badgeLayerActive: "🎨 Warstwa {layer} Aktywna • Ściemnienie: {dim}%",
      badgeReactiveActive: "⚡ Warstwa Reaktywna: Włączona ({mode})",
      badgeReactiveDisabled: "⚡ Warstwa Reaktywna: Wyłączona",
      badgeLogoPreview: "💎 Podgląd Wskaźników Logo & Pokrętła",
      badgeWinLockPreview: "🔒 Podgląd Blokady Klawisza Windows (Win Lock)",
      badgeEffectBrightness: "{name} • {pct}% Jasności",

      // Device Settings
      btnBootloader: "🚀 Uruchom Tryb Bootloadera (DFU)",
      btnResetEeprom: "⚠️ Resetuj EEPROM do Ustawień Fabrycznych",

      // Toasts & Alerts
      toastConnected: "Połączono z: {name}",
      toastAutoConnected: "Automatycznie połączono z: {name}",
      toastNewConnected: "Połączono nowe urządzenie: {name}",
      toastSwitchingDevice: "Przełączanie urządzenia...",
      toastSwitchError: "Błąd przełączania urządzenia: {err}",
      toastRefreshing: "Odświeżanie danych z klawiatury...",
      toastRefreshed: "Dane zostały pomyślnie odświeżone!",
      toastRefreshError: "Błąd odświeżania: {err}",
      toastCreatingBackup: "Tworzenie pełnej kopii klawiatury...",
      toastBackupDownloaded: "Plik kopii zapasowej został pomyślnie pobrany!",
      toastBackupError: "Błąd tworzenia kopii: {err}",
      toastRestoring: "Wgrywanie kopii do pamięci klawiatury...",
      toastRestored: "Wszystkie ustawienia zostały pomyślnie przywrócone!",
      toastRestoreError: "Błąd przywracania: {err}",
      toastSelectValidBackup: "Wybierz poprawny plik kopii zapasowej (.json)!",
      toastBootloaderReboot: "Klawiatura restartuje się do trybu Bootloadera (DFU)...",
      toastEepromReset: "Wysłano polecenie resetu EEPROM! Ponowne łączenie...",
      confirmBootloader: "Czy na pewno chcesz zrestartować klawiaturę do trybu Bootloadera (DFU)? Wymagane będzie ponowne podłączenie lub wgranie nowego firmware.",
      confirmResetEEPROM: "OSTRZEŻENIE: Spowoduje to przywrócenie fabrycznego układu klawiszy i ustawień EEPROM. Czy chcesz kontynuować?",
      toastAudioStarted: "Wizualizer audio został uruchomiony",
      toastAudioError: "Błąd audio: {err}",
      toastAutostartEnabled: "Włączono uruchamianie przy starcie Windows",
      toastAutostartDisabled: "Wyłączono uruchamianie przy starcie Windows",
      logConnected: "Klawiatura została pomyślnie połączona przez WebHID",
      logConnectedDevice: "Połączono z urządzeniem: {name} (0xFF60:0x61)",
      logDisconnected: "Klawiatura została rozłączona",
      logDeviceCancelled: "Wybór urządzenia został anulowany",
      errorWebHidNotSupported: "WebHID nie jest wspierany w tej przeglądarce",
      logEepromResetSending: "Wysyłanie polecenia resetu fabrycznego EEPROM...",
      logEepromResetSuccess: "Polecenie resetu pamięci EEPROM zostało wysłane pomyślnie",

      // Settings View - Performance & Latency
      cardPerformanceTitle: "Wydajność i Czas Opóźnienia (Latency)",
      cardPerformanceSubtitle: "Konfiguracja filtra drgań styków, trybu NKRO oraz częstotliwości próbkowania USB",
      lblDebounceTime: "Czas eliminacji drgań styków (Debounce)",
      descDebounce: "Filtruje zjawisko drgań styków mechanicznych (switch chatter). 0–2 ms to natychmiastowa reakcja turniejowa w grach; 16 ms to tryb bezpieczny chroniący przed podwójnym klikiem na starszych switchach.",
      debounce0: "0 ms (Turniejowy / Eager)",
      debounce2: "2 ms (Ultra Szybki)",
      debounce5: "5 ms (Zbalansowany QMK)",
      debounce8: "8 ms (Standardowy)",
      debounce16: "16 ms (Bezpieczny / Glorious Core)",
      lblNkroMode: "Tryb N-Key Rollover (NKRO)",
      descNkro: "Rejestracja nieograniczonej liczby równocześnie wciśniętych klawiszy bez ograniczenia do 6 klawiszy USB.",
      nkroActiveBadge: "Aktywny: Pełny tryb Full NKRO (Brak limitu klawiszy)",
      nkroDisabledBadge: "Aktywny: Tryb 6KRO (Limit 6 klawiszy)",
      lblPollingRate: "Częstotliwość próbkowania USB (Polling Rate)",
      descPollingRate: "Częstotliwość, z jaką kontroler USB wysyła stan klawiatury do komputera.",
      polling1000: "1000 Hz (1.0 ms) - Domyślny",
      polling2000: "2000 Hz (0.5 ms)",
      polling4000: "4000 Hz (0.25 ms)",
      polling8000: "8000 Hz (0.125 ms)",
      polling500: "500 Hz (2.0 ms)",
      polling125: "125 Hz (8.0 ms)",

      // Settings View - Hardware Info
      cardHardwareTitle: "Informacje Sprzętowe & Diagnostyka",
      cardHardwareSubtitle: "Specyfikacja mikrokontrolera, stan pamięci i protokoły komunikacji",
      lblKeyboardModel: "Model Klawiatury:",
      valKeyboardModel: "Glorious GMMK 3 100% ANSI",
      lblMcuChip: "Mikrokontroler MCU:",
      valMcuChip: "WB32FQ95 (ARM Cortex-M4)",
      lblUsbVidPid: "Identyfikatory USB:",
      valUsbVidPid: "VID: 0x504B | PID: 0x320F",
      lblProtocolVersion: "Wersja Firmware & Silnika:",
      valProtocolVersion: "LuxQMK v0.1.0 (QMK v0.34.4 / VIA v12)",
      lblMatrixLayout: "Matryca Fizyczna:",
      valMatrixLayout: "14 Wierszy × 8 Kolumn (112 pozycji)",
      lblEepromSize: "Pamięć Niestandardowa EEPROM:",
      valEepromSize: "32 Bajty Pamięci Trwałej",
      lblCompatibilityStatus: "Status Zgodności:",
      valCompatibilityStatus: "✓ W pełni zgodny (LuxQMK Studio v1.0.0)",
      statusFwCompatible: "✓ W pełni zgodny (LuxQMK Studio v1.0.0)",
      statusFwUpdateRequired: "⚠️ Wymagana aktualizacja firmware (zalecany LuxQMK v0.1.0+)",
      statusFwNewer: "ℹ️ Wykryto nowszy firmware (Zalecana aktualizacja LuxQMK Studio)",
      statusFwLegacy: "⚠️ Oprogramowanie starszego typu (Tylko podstawowe funkcje)",

      // Settings View - Maintenance Tools
      cardMaintenanceTitle: "Narzędzia Serwisowe & Pamięć EEPROM",
      cardMaintenanceSubtitle: "Zaawansowane operacje na pamięci kontrolera i tryb programowania",
      lblBootloaderTitle: "Uruchomienie Bootloadera (DFU Mode)",
      btnBootloaderDesc: "Wprowadza klawiaturę w tryb DFU Bootloadera umożliwiający wgranie nowego pliku firmware (.bin/.hex).",
      lblResetEepromTitle: "Reset Pamięci EEPROM",
      btnResetEepromDesc: "Czyści pamięć EEPROM klawiatury i przywraca fabryczny układ warstw, podświetlenia i makr.",
      lblQuickBackupTitle: "Szybka Kopia Profilu",
      btnQuickBackupDesc: "Szybko wyeksportuj pełną migawkę bieżącego układu warstw i oświetlenia.",
      btnQuickBackup: "💾 Eksportuj Kopię Profilu",

      // Dialogs & Toast messages
      toastDebounceSet: "Ustawiono czas opóźnienia Debounce: {val}",
      toastNkroSet: "Zaktualizowano tryb NKRO: {mode}",
      toastPollingSet: "Ustawiono częstotliwość próbkowania USB: {hz}",
      toastResetEepromSuccess: "Pamięć EEPROM została pomyślnie zresetowana do ustawień fabrycznych!",
      toastBootloaderSuccess: "Klawiatura została zrestartowana w tryb DFU Bootloader."
    }
  };

  class I18n {
    constructor() {
      this.listeners = [];
      // English is the foundational default
      this.currentLang = localStorage.getItem("gmmk_studio_lang") || "en";
    }

    t(key, params = {}) {
      const dict = translations[this.currentLang] || translations.en;
      let text = dict[key] || translations.en[key] || key;
      if (typeof text === "string" && params) {
        Object.keys(params).forEach(k => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), params[k]);
        });
      }
      return text;
    }

    onChange(fn) {
      if (typeof fn === "function") {
        this.listeners.push(fn);
      }
    }

    setLang(lang) {
      if (translations[lang]) {
        this.currentLang = lang;
        localStorage.setItem("gmmk_studio_lang", lang);
        document.documentElement.lang = lang;
        this.translatePage();
        this.listeners.forEach(fn => {
          try { fn(lang); } catch (e) { console.warn("i18n listener error:", e); }
        });
      }
    }

    translatePage() {
      // 1. Standard text content & HTML formatting
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        const translation = this.t(key);
        if (translation) {
          if (el.tagName === "INPUT" && el.type === "placeholder") {
            el.placeholder = translation;
          } else if (/<[a-z][\s\S]*>/i.test(translation)) {
            el.innerHTML = translation;
          } else {
            el.textContent = translation;
          }
        }
      });

      // 2. Tooltip / Title attributes
      document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const key = el.dataset.i18nTitle;
        const translation = this.t(key);
        if (translation) el.title = translation;
      });

      // 3. Placeholder attributes
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        const translation = this.t(key);
        if (translation) el.placeholder = translation;
      });
    }
  }

  window.i18n = new I18n();
})();
